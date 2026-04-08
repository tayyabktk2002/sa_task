import React, { useEffect, useMemo } from 'react'
import { ticketStats } from '@/hooks/tickets'
import { useOrganizations } from '@/hooks/useOrganizations';

const TicketStatCard = () => {
    const { stats, statLoading, refreshStats } = ticketStats();
    const { currentOrgId } = useOrganizations();

    useEffect(() => {
        refreshStats();
    }, [currentOrgId, refreshStats]);

    const counts = useMemo(() => {
        const result = { Total: 0, Open: 0, Investigating: 0, Mitigated: 0, Resolved: 0 };
        if (Array.isArray(stats)) {
            stats.forEach((s: any) => {
                if (result[s.status as keyof typeof result] !== undefined) {
                    result[s.status as keyof typeof result] = Number(s.count);
                }
                result.Total += Number(s.count);
            });
        }
        return result;
    }, [stats]);

    return (
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <StatCard label="Total" count={statLoading ? '...' : counts.Total} color="blue" />
            <StatCard label="Open" count={statLoading ? '...' : counts.Open} color="red" />
            <StatCard label="Investigating" count={statLoading ? '...' : counts.Investigating} color="yellow" />
            <StatCard label="Mitigated" count={statLoading ? '...' : counts.Mitigated} color="indigo" />
            <StatCard label="Resolved" count={statLoading ? '...' : counts.Resolved} color="green" />
        </div>
    )
}

const StatCard = ({ label, count, color }: any) => (
    <div className='bg-[#1e293b] p-4 rounded-lg border border-slate-800 shadow-sm shadow-black/20'>
        <p className='text-slate-400 text-xs uppercase font-bold tracking-wider'>{label}</p>
        <p className={`text-2xl font-bold mt-1 text-${color}-400`}>{typeof count === 'number' ? count.toLocaleString() : count}</p>
    </div>
);

export default TicketStatCard