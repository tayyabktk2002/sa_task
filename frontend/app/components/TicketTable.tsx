'use client';
import React, { useEffect, useRef, useState } from 'react';
import TicketDetails from './TicketDetails';
import { Membership, Ticket } from '@/types';
import { useOrganizations } from '@/hooks/useOrganizations';
import api from '@/lib/api';
import { toast } from 'react-toastify';

const TicketTable = ({
    tickets,
    nextCursor,
    loadingMore,
    onLoadMore,
    onTicketUpdated
}: {
    tickets: Ticket[];
    nextCursor: string | null;
    loadingMore: boolean;
    onLoadMore: () => void;
    onTicketUpdated?: () => void;
}) => {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [seeding, setSeeding] = useState(false);

    const { orgs, currentOrgId } = useOrganizations();
    const activeOrg: Membership | undefined = orgs.find((m) => Number(m.org_id) === Number(currentOrgId));
    const userRole = activeOrg?.role;
    const isAdminOrOwner = userRole === 'Owner' || userRole === 'Admin';

    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && nextCursor && !loadingMore) {
                    onLoadMore();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '200px', // Start loading before reaching the bottom
            }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [nextCursor, loadingMore, onLoadMore]);

    const handleTicketClick = (ticketId: number) => {
        setSelectedTicketId(ticketId);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedTicketId(null);
        if (onTicketUpdated) {
            onTicketUpdated(); // Refresh tickets if something was updated in the modal
        }
    };


    // Status colors mapping
    const getStatusStyle = (status: string) => {
        const styles: Record<string, string> = {
            'Open': 'bg-red-500/10 text-red-400 border-red-500/20',
            'Investigating': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            'Mitigated': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'Resolved': 'bg-green-500/10 text-green-400 border-green-500/20',
        };
        return styles[status] || 'bg-slate-500/10 text-slate-400';
    };

    // Severity indicator
    const getSeverityColor = (severity: string) => {
        if (severity === 'Critical') return 'bg-red-600';
        if (severity === 'High') return 'bg-orange-500';
        if (severity === 'Medium') return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    const handleSeedTickets = async () => {
        try {
            setSeeding(true);
            await api.post('/tickets/seed', { count: 1000 });
            if (onTicketUpdated) {
                onTicketUpdated();
            }
            toast.success('Tickets seeded successfully.');
        } catch (error: unknown) {
            const message = (() => {
                if (typeof error !== 'object' || error === null) return null;
                if (!('response' in error)) return null;
                const err = error as { response?: { data?: { message?: string } } };
                return err.response?.data?.message || null;
            })();
            toast.error(message || 'Failed to seed tickets');
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="w-full">
            {isAdminOrOwner && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleSeedTickets}
                        disabled={seeding}
                        className={`text-sm font-medium px-4 py-2 rounded-lg transition-all cursor-pointer border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white ${seeding ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {seeding ? 'Seeding tickets...' : 'Seed Tickets'}
                    </button>
                </div>
            )}
            {(!tickets || tickets.length === 0) ? (
                <div className="p-10 text-center text-slate-500 italic bg-[#1e293b] rounded-xl border border-slate-800">
                    No tickets found.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tickets?.map((ticket, index) => (
                        <div
                            key={ticket.id || index} // Use ticket.id for key if available
                            className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-colors flex flex-col group shadow-md shadow-black/20 cursor-pointer"
                            onClick={() => handleTicketClick(ticket.id)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-full border border-slate-700">
                                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(ticket.severity)}`} />
                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                                        {ticket.severity === 'Critical' ? 'CRIT' : ticket.severity === 'High' ? 'HIGH' : ticket.severity === 'Medium' ? 'MED' : 'LOW'}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                                {ticket.title}
                            </h3>

                            <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-grow">
                                {ticket.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                                <span className="text-[11px] text-slate-500 font-medium">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleTicketClick(ticket.id); }}
                                    className="text-[11px] font-medium bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div ref={sentinelRef} className="h-10 w-full" />
            {(loadingMore) && (
                <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            {isDetailsModalOpen && selectedTicketId && (
                <TicketDetails
                    ticketId={selectedTicketId}
                    onClose={handleCloseDetailsModal}
                />
            )}
        </div>
    );
};

export default TicketTable;
