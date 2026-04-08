'use client';

import { useOrganizations } from '@/hooks/useOrganizations';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Membership } from '@/types';

const AppBar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [loader, setLoader] = useState(false);

    const { orgs, loading, currentOrgId, userName } = useOrganizations();

    const activeOrg: Membership | undefined = orgs.find((m) => Number(m.org_id) === Number(currentOrgId));


    const orgName = activeOrg?.organization?.name || (loading ? "Loading..." : "No Organization");
    const userRole = activeOrg?.role || (loading ? "Loading..." : "No Role");
    const username = userName || (loading ? "Loading..." : "User");


    const userInitials = username
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleLogout = async () => {
        try {
            setLoader(true);
            const response = await api.post('/auth/logout');
            if (response.status === 200) {
                router.push('/login');
            } else {
                console.error('Logout failed:', response.data.message);
                toast.error(response.data.message);
            }
        } catch (error: any) {
            console.error('Error during logout:', error.response?.data?.message);
            toast.error(error.response?.data?.message);
        } finally {
            setLoader(false);
        }
    };


    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_24px_0_rgba(99,102,241,0.06),0_1px_4px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-6 h-16 gap-4">

                <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.35)]">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                        </svg>
                    </div>
                    <h1 className="text-base font-bold tracking-tight text-indigo-950 whitespace-nowrap m-0">
                        {orgName}
                    </h1>
                </div>

                <div className="flex items-center gap-2 shrink-0">

                    <div className="w-px h-7 bg-slate-200 mx-1" />
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => { setDropdownOpen((v) => !v); }}
                            aria-label="User menu"
                            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border border-slate-200 bg-transparent cursor-pointer transition-all duration-150 hover:bg-slate-50 hover:border-indigo-400 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]"
                        >
                            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[11px] font-bold text-white tracking-wider shrink-0">
                                {userInitials}
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[13px] font-semibold text-slate-800 max-w-[90px] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {username}
                                </span>
                                <span className="text-[11px] text-slate-400 mt-0.5">{userRole}</span>
                            </div>
                            <svg
                                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute top-[calc(100%+10px)] right-0 w-56 bg-white border border-slate-200 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(99,102,241,0.08)] z-100 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <p className="text-sm font-bold text-slate-800 overflow-hidden text-ellipsis whitespace-nowrap">{username}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">{orgName}</p>
                                </div>
                                <div className="py-1.5">
                                    {/* <button
                                        onClick={() => { router.push('/profile'); setDropdownOpen(false); }}
                                        className="flex items-center gap-2.5 w-full px-4 py-2 text-[13.5px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-500 transition-colors duration-150 border-none bg-transparent cursor-pointer text-left"
                                    >
                                        Profile
                                    </button>
                                    <button className="flex items-center gap-2.5 w-full px-4 py-2 text-[13.5px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-500 transition-colors duration-150 border-none bg-transparent cursor-pointer text-left">
                                        Settings
                                    </button> */}
                                    <div className="h-px bg-slate-100 my-1 mx-2" />
                                    <button
                                        onClick={handleLogout}
                                        className={`flex items-center gap-2.5 w-full px-4 py-2 text-[13.5px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 border-none bg-transparent cursor-pointer text-left ${loader ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={loader}
                                    >
                                        {loader ? 'Logging out...' : 'Logout'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AppBar;
