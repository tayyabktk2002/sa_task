"use client"
import React, { useState, useEffect } from 'react'
import CreateTicket from '../components/createTicket'
import TicketTable from '../components/TicketTable'
import { getTickets } from '@/hooks/tickets'
import TicketStatCard from '../components/TicketStatCard'
import TicketFilter from '../components/TicketFilter'
import { useOrganizations } from '@/hooks/useOrganizations'

const TicketsPage = () => {
    const [showModal, setShowModal] = useState(false);
    const { tickets, refreshTicket, loading, loadingMore, nextCursor, loadMore } = getTickets();
    const { currentOrgId } = useOrganizations();

    useEffect(() => {
        refreshTicket();
    }, [currentOrgId, refreshTicket]);

    const handleFilterChange = (filters: any) => {
        refreshTicket(filters);
    };

    return (
        <div className='flex flex-col h-full bg-[#0f172a] text-white'>

            {/* Fixed header — never scrolls */}
            <div className='shrink-0 px-6 pt-6 space-y-6'>
                <div className='flex justify-between items-center'>
                    <div>
                        <h1 className='text-2xl font-bold'>Operational Tickets</h1>
                        <p className='text-slate-400 text-sm'>Manage and track your organization's incidents.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className='bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 cursor-pointer'
                    >
                        + Create New Ticket
                    </button>
                </div>

                <TicketStatCard />
                <TicketFilter onFilterChange={handleFilterChange} />
            </div>

            {/* Scrollable tickets area only */}
            <div className='flex-1 overflow-y-auto px-6 pb-6'>
                {loading ? (
                    <div className='bg-[#1e293b] border border-slate-800 rounded-xl p-10 text-center text-slate-500'>Loading tickets...</div>
                ) : (
                    <TicketTable tickets={tickets} nextCursor={nextCursor} loadingMore={loadingMore} onLoadMore={loadMore} onTicketUpdated={refreshTicket} />
                )}
            </div>

            {showModal && (
                <CreateTicket
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        refreshTicket();
                    }}
                />
            )}
        </div>
    )
}



export default TicketsPage