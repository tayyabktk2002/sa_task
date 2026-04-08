'use client'
import React, { useRef, useEffect, useState } from 'react';
import { useMembers, removeMember } from '@/hooks/useMember';
import { useOrganizations } from '@/hooks/useOrganizations';
import MemberCard from '../components/MemberCard';
import InviteUserModal from '../components/InviteUserModal';
import { Member } from '@/types';

const Page = () => {
    const { members, loading, hasMore, fetchMoreMembers, setMembers, refreshMembers } = useMembers();
    const { orgs, currentOrgId } = useOrganizations();

    useEffect(() => {
        refreshMembers();
    }, [currentOrgId, refreshMembers]);

    const activeOrg = orgs.find((m: any) => m.org_id === currentOrgId);
    const currentUserRole = activeOrg?.role as string;
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        if (!sentinelRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore && !loading) {
                    fetchMoreMembers();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinelRef.current);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, loading, fetchMoreMembers]);

    const handleRemoveMember = async (memberId: number) => {
        try {
            await removeMember(memberId);
            setMembers(members.filter((member: Member) => member.id !== memberId));
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };

    const handleRoleUpdate = () => {
        fetchMoreMembers(); 
    };

    return (
        <div className='p-6 space-y-6 bg-[#0f172a] min-h-screen text-white'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className='text-2xl font-bold'>Organization Members</h1>
                    <p className='text-slate-400 text-sm'>Manage and view your organization's members.</p>
                </div>
                {(currentUserRole === 'Owner' || currentUserRole === 'Admin') && (
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        Invite User
                    </button>
                )}
            </div>

            {loading && members.length === 0 ? (
                <div className='bg-[#1e293b] border border-slate-800 rounded-xl p-10 text-center text-slate-500'>Loading members...</div>
            ) : members.length === 0 ? (
                <div className='bg-[#1e293b] border border-slate-800 rounded-xl p-10 text-center text-slate-500'>No members found.</div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <MemberCard members={members} onRemove={handleRemoveMember} currentUserRole={currentUserRole} onRoleUpdate={handleRoleUpdate} />
                </div>
            )}

            {hasMore && (
                <div ref={sentinelRef} className='h-4' />
            )}

            {loading && members.length > 0 && (
                <div className='flex justify-center py-4'>
                    <div className='w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
                </div>
            )}
            {/* Placeholder for InviteUserModal */}
            {isInviteModalOpen && <InviteUserModal onClose={() => setIsInviteModalOpen(false)} />}
        </div>
    );
};

export default Page;