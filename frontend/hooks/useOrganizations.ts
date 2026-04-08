import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Membership } from '@/types';

export const useOrganizations = () => {
    const [orgs, setOrgs] = useState<Membership[]>([]);
    const [currentOrgId, setCurrentOrgId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('activeOrgId') || '';
        }
        return '';
    });
    const [userName, setUserName] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('userName') || '';
        }
        return '';
    });
    const [loading, setLoading] = useState(true);

    const fetchOrgs = async () => {
        try {
            const res = await api.get('/user/my-orgs');
            const { memberships, currentOrgId: apiOrgId, userName: apiUserName } = res.data?.data || {};
            
            setOrgs((memberships || []) as Membership[]);
            setCurrentOrgId(apiOrgId || '');
            setUserName(apiUserName || '');

            if (apiOrgId) localStorage.setItem('activeOrgId', apiOrgId);
            if (apiUserName) localStorage.setItem('userName', apiUserName);

        } catch (err) {
            console.error("Error fetching orgs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrgs(); }, []);

    return { orgs, loading, currentOrgId, userName, refreshOrgs: fetchOrgs };
};
