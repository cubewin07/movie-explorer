import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '@/lib/instance';

export const useReviewsList = (filmId, type) => {
  return useInfiniteQuery({
    queryKey: ['reviews', filmId, type],
    enabled: !!filmId && !!type,
    queryFn: async ({ pageParam = 0, signal }) => {
      const res = await instance.get('/reviews', {
        params: { filmId, type, page: pageParam },
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
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
  });
};

export const useReplies = (reviewId, enabled = false) => {
  return useQuery({
    queryKey: ['replies', reviewId],
    enabled: !!reviewId && enabled,
    queryFn: async ({ signal }) => {
      const res = await instance.get('/reviews/reply', {
        params: { reviewId },
        signal,
      });
      return res.data; // List<ReviewsDTO>
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30,
  });
};

export const useReviewActions = (filmId, type) => {
  const qc = useQueryClient();

  const createReview = useMutation({
    mutationFn: async (content) => {
      const res = await instance.post('/reviews', { content, filmId, type });
      return res.data; // ReviewsDTO
    },
    onSuccess: (created) => {
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
      const applyVoteFlag = (item) => {
        if (item.id !== reviewId) return item;
        return {
          ...item,
          likedByMe: value === 1 ? true : value === 0 ? false : false,
          disLikedByMe: value === -1 ? true : value === 0 ? false : value === 1 ? false : item.disLikedByMe,
        };
      };
      qc.setQueryData(['reviews', filmId, type], (old) => {
        if (!old) return old;
        const pages = old.pages.map((page) => page.map(applyVoteFlag));
        return { ...old, pages };
      });
      if (parentId) {
        qc.setQueryData(['replies', parentId], (old) => (Array.isArray(old) ? old.map(applyVoteFlag) : old));
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
