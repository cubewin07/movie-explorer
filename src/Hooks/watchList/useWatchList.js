import instance from '@/lib/instance';

export default function useWatchlist() {
    return instance.get('/watchList');
}
