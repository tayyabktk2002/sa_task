import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Member, UseMembersResult } from '@/types';


const useMembers = (): UseMembersResult => {
    const [members, setMembers] = useState<Member[]>([]);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const fetchMembers = useCallback(async (cursor: number | null = null) => {
        setLoading(true);
        try {
            const response = await api.get('/members/get', {
                params: {
                    cursor: cursor,
                    limit: 10,
                },
            });
            const { members: newMembers, nextCursor: newNextCursor } = response.data.data;
            setMembers((prevMembers) => (cursor ? [...prevMembers, ...newMembers] : newMembers));
            setNextCursor(newNextCursor);
            setHasMore(newNextCursor !== null);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshMembers = useCallback(() => {
        setMembers([]);
        setNextCursor(null);
        setHasMore(true);
        fetchMembers();
    }, [fetchMembers]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const fetchMoreMembers = useCallback(() => {
        if (hasMore && !loading && nextCursor !== null) {
            fetchMembers(nextCursor);
        }
    }, [hasMore, loading, nextCursor, fetchMembers]);

    return {
        members,
        loading,
        hasMore,
        fetchMoreMembers,
        setMembers,
        refreshMembers
    };
};

const removeMember = async (memberId: number) => {
    try {
        const response = await api.delete(`/members/remove/${memberId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing member:', error);
    }
}

const updateMemberRole = async (memberId: number, role: string) => {
    try {
        const response = await api.put(`/members/update/${memberId}`, { role });
        return response.data;
    } catch (error) {
        console.error('Error updating member role:', error);
        throw error;
    }
}

export { useMembers, removeMember, updateMemberRole };