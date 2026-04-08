'use client'
import React, { useRef, useEffect } from 'react';
import { useAuditLogs } from '@/hooks/useAuditLog';
import { useOrganizations } from '@/hooks/useOrganizations';

const AuditLogPage = () => {
    const { auditLogs, loading, hasMore, fetchMoreAuditLogs, refreshAuditLogs } = useAuditLogs();
    const { currentOrgId } = useOrganizations();
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        refreshAuditLogs();
    }, [currentOrgId, refreshAuditLogs]);

    useEffect(() => {
        if (!sentinelRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore && !loading) {
                    fetchMoreAuditLogs();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinelRef.current);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, loading, fetchMoreAuditLogs]);

    return (
        <div className='p-6 space-y-6 bg-[#0f172a] min-h-screen text-white'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className='text-2xl font-bold'>Audit Log</h1>
                    <p className='text-slate-400 text-sm'>Review all actions performed in your organization.</p>
                </div>
            </div>

            {loading && auditLogs.length === 0 ? (
                <div className='bg-[#1e293b] border border-slate-800 rounded-xl p-10 text-center text-slate-500'>Loading audit logs...</div>
            ) : auditLogs.length === 0 ? (
                <div className='bg-[#1e293b] border border-slate-800 rounded-xl p-10 text-center text-slate-500'>No audit logs found.</div>
            ) : (
                <div className="overflow-x-auto bg-[#1e293b] rounded-xl border border-slate-800">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-[#334155]">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Action
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Message
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    User
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Ticket
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {auditLogs.map((log, index) => (
                                <tr key={index} className="hover:bg-[#2c3e50]">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {log.action_type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {log.message}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {log.user_name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {log.ticket_title || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {hasMore && (
                <div ref={sentinelRef} className='h-4' />
            )}

            {loading && auditLogs.length > 0 && (
                <div className='flex justify-center py-4'>
                    <div className='w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
                </div>
            )}
        </div>
    );
};

export default AuditLogPage;
