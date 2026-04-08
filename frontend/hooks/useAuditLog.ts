import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { AuditLog, UseAuditLogsResult } from '@/types';

const useAuditLogs = (): UseAuditLogsResult => {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const fetchAuditLogs = useCallback(async (cursor: string | null = null) => {
        setLoading(true);
        try {
            const response = await api.get('/user/audit-log', {
                params: {
                    cursor: cursor,
                    limit: 10,
                },
            });
            const { auditLogs: newAuditLogs, nextCursor: newNextCursor } = response.data.data;
            setAuditLogs((prevLogs) => (cursor ? [...prevLogs, ...newAuditLogs] : newAuditLogs));
            setNextCursor(newNextCursor);
            setHasMore(newNextCursor !== null);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAuditLogs();
    }, [fetchAuditLogs]);

    const fetchMoreAuditLogs = useCallback(() => {
        if (hasMore && !loading && nextCursor !== null) {
            fetchAuditLogs(nextCursor);
        }
    }, [hasMore, loading, nextCursor, fetchAuditLogs]);

    const refreshAuditLogs = useCallback(() => {
        setAuditLogs([]);
        setNextCursor(null);
        setHasMore(true);
        fetchAuditLogs();
    }, [fetchAuditLogs]);

    return {
        auditLogs,
        loading,
        hasMore,
        fetchMoreAuditLogs,
        refreshAuditLogs,
    };
};

export { useAuditLogs };