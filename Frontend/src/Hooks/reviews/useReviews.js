import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '@/lib/instance';

export const useReviewsList = (filmId, type, episodeMetadata = null) => {
  return useInfiniteQuery({
    queryKey: ['reviews', filmId, type, episodeMetadata?.seasonNumber, episodeMetadata?.episodeNumber],
    enabled: !!filmId && !!type,
    queryFn: async ({ pageParam = 0, signal }) => {
      const params = { filmId, type, page: pageParam };
      
      // Add episode metadata if provided for series reviews
      // Support partial metadata: season-only, episode-only, or both
      if (type === 'SERIES' && episodeMetadata) {
        if (typeof episodeMetadata.seasonNumber === 'number') {
          params.seasonNumber = episodeMetadata.seasonNumber;
        }
        if (typeof episodeMetadata.episodeNumber === 'number') {
          params.episodeNumber = episodeMetadata.episodeNumber;
        }
      }
      
      const res = await instance.get('/reviews', {
        params,
        signal,
      });
      return res.data; // List<ReviewsDTO>
    },
    getNextPageParam: (lastPage, pages) => {
      if (Array.isArray(lastPage) && lastPage.length === 20) {
        return pages.length; // next page index (0-based)
      }
      return undefined;
    },
    onError: (err) => {
      if (err.response) {
        console.error('SERVER ERROR RESPONSE:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        });
      } else if (err.request) {
        console.error('NO RESPONSE FROM SERVER:', err.request);
      } else {
        console.error('REQUEST SETUP ERROR:', err.message);
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
  });
};

export const useReplies = (reviewId, enabled = false) => {
  return useInfiniteQuery({
    queryKey: ['replies', reviewId],
    enabled: !!reviewId && enabled,
    queryFn: async ({ pageParam = 0, signal }) => {
      const res = await instance.get('/reviews/reply', {
        params: { reviewId, page: pageParam },
        signal,
      });
      // Extract content array from PageResponse
      return res.data.content || []; // List<ReviewsDTO>
    },
    getNextPageParam: (lastPage, pages) => {
      // Check if there are more pages
      if (Array.isArray(lastPage) && lastPage.length === 20) {
        return pages.length; // next page index
      }
      return undefined;
    },
    onError: (err) => {
      if (err.response) {
        console.error('REPLIES ERROR:', {
          status: err.response.status,
          data: err.response.data,
        });
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30,
  });
};

export const useReviewActions = (filmId, type, episodeMetadata = null) => {
  const qc = useQueryClient();

  const createReview = useMutation({
    mutationFn: async (content) => {
      const payload = { content, filmId, type };
      
      // Add episodeMetadata object if available for series reviews
      // Support partial metadata: season-only, episode-only, or both
      if (type === 'SERIES' && episodeMetadata) {
        payload.episodeMetadata = {};
        if (typeof episodeMetadata.seasonNumber === 'number') {
          payload.episodeMetadata.seasonNumber = episodeMetadata.seasonNumber;
        }
        if (typeof episodeMetadata.episodeNumber === 'number') {
          payload.episodeMetadata.episodeNumber = episodeMetadata.episodeNumber;
        }
        // Only send if we actually have at least one field
        if (Object.keys(payload.episodeMetadata).length === 0) {
          delete payload.episodeMetadata;
        }
      }
      
      const res = await instance.post('/reviews', payload);
      return res.data; // ReviewsDTO
    },
    onSuccess: (created) => {
      // Ensure score has a reasonable default if server does not provide it
      if (typeof created.score !== 'number') {
        created.score = created.likedByMe ? 1 : 0;
      }
      qc.setQueryData(['reviews', filmId, type], (old) => {
        if (!old) return old;
        const first = Array.isArray(old.pages?.[0]) ? old.pages[0] : [];
        return {
          pageParams: old.pageParams,
          pages: [[created, ...first], ...old.pages.slice(1)],
        };
      });
    },
  });

  const createReply = useMutation({
    mutationFn: async ({ content, replyToId }) => {
      const res = await instance.post('/reviews/reply', { content, replyToId });
      return res.data; // ReviewsDTO
    },
    onSuccess: (reply, variables) => {
      const parentId = variables.replyToId;
      if (typeof reply.score !== 'number') {
        reply.score = reply.likedByMe ? 1 : 0;
      }
      qc.setQueryData(['replies', parentId], (old) => {
        const list = Array.isArray(old) ? old : [];
        return [...list, reply];
      });
      qc.setQueryData(['reviews', filmId, type], (old) => {
        if (!old) return old;
        const pages = old.pages.map((page) =>
          page.map((r) => (r.id === parentId ? { ...r, replyCount: (r.replyCount || 0) + 1 } : r)),
        );
        return { ...old, pages };
      });
    },
  });

  const vote = useMutation({
    mutationFn: async ({ reviewId, value }) => {
      const res = await instance.post('/votes', { reviewId, value });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      const { reviewId, value, parentId } = variables;
      const applyVote = (item) => {
        if (item.id !== reviewId) return item;
        const current = item.likedByMe ? 1 : item.disLikedByMe ? -1 : 0;
        const delta = (typeof value === 'number' ? value : 0) - current;
        const nextScore = (typeof item.score === 'number' ? item.score : 0) + delta;
        return {
          ...item,
          likedByMe: value === 1,
          disLikedByMe: value === -1,
          score: nextScore,
        };
      };
      qc.setQueryData(['reviews', filmId, type], (old) => {
        if (!old) return old;
        const pages = old.pages.map((page) => page.map(applyVote));
        return { ...old, pages };
      });
      if (parentId) {
        qc.setQueryData(['replies', parentId], (old) => (Array.isArray(old) ? old.map(applyVote) : old));
      }
    },
  });

  const deleteReview = useMutation({
    mutationFn: async ({ reviewId }) => {
      await instance.delete('/reviews/delete', { params: { reviewId } });
      return reviewId;
    },
    onSuccess: (deletedId, { parentId }) => {
      qc.setQueryData(['reviews', filmId, type], (old) => {
        if (!old) return old;
        const pages = old.pages.map((page) => page.filter((r) => r.id !== deletedId));
        return { ...old, pages };
      });
      if (parentId) {
        qc.setQueryData(['replies', parentId], (old) => (Array.isArray(old) ? old.filter((r) => r.id !== deletedId) : old));
        qc.setQueryData(['reviews', filmId, type], (old) => {
          if (!old) return old;
          const pages = old.pages.map((page) =>
            page.map((r) => (r.id === parentId ? { ...r, replyCount: Math.max((r.replyCount || 1) - 1, 0) } : r)),
          );
          return { ...old, pages };
        });
      }
    },
  });

  return { createReview, createReply, vote, deleteReview };
};

export default {
  useReviewsList,
  useReplies,
  useReviewActions,
};
