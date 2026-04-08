import api from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

const getTickets = (limit = 12) => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<any>({});

    const fetchTickets = useCallback(async (filters = {}, cursor?: string | null) => {
        cursor ? setLoadingMore(true) : setLoading(true);
        try {
            const filterStr = encodeURIComponent(JSON.stringify(filters));
            const cursorParam = cursor ? `&cursor=${cursor}` : '';
            const apiUrl = `/tickets/get?limit=${limit}&filters=${filterStr}${cursorParam}`;
            console.log('Fetching tickets from:', apiUrl);
            const response = await api.get(apiUrl);
            const { tickets: newTickets, nextCursor: nc } = response.data.data;
            setTickets(prev => cursor ? [...prev, ...newTickets] : newTickets);
            setNextCursor(nc);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            cursor ? setLoadingMore(false) : setLoading(false);
        }
    }, [limit, setLoadingMore, setLoading, setTickets, setNextCursor, api]);

    const refreshTicket = useCallback((filters = {}) => {
        setActiveFilters(filters);
        fetchTickets(filters);
    }, [setActiveFilters, fetchTickets]);

    const loadMore = useCallback(() => {
        if (nextCursor) fetchTickets(activeFilters, nextCursor);
    }, [nextCursor, activeFilters, fetchTickets]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    return { tickets, loading, loadingMore, nextCursor, refreshTicket, loadMore };
}

const ticketStats = () => {
    const [stats, setStats] = useState<any[]>([]);
    const [statLoading, setStatLoading] = useState<boolean>(true);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/tickets/stats');
            setStats(response.data.data);
            setStatLoading(false);
        } catch (error) {
            console.error('Error fetching ticket stats:', error);
        } finally {
            setStatLoading(false);
        }
    }, []);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    return { stats, statLoading, setStats, setStatLoading, refreshStats: fetchStats };
}

export { getTickets, ticketStats }