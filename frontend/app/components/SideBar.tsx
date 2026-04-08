"use client"
import { useOrganizations } from '@/hooks/useOrganizations';
import Link from 'next/link';
import React from 'react';
import { toast } from 'react-toastify';
import api from '@/lib/api';
import { LucideLogs, Ticket, UsersIcon } from 'lucide-react';



const SideBar: React.FC = () => {
  const { orgs, loading, currentOrgId } = useOrganizations();

  const activeOrg = orgs.find((m) => Number(m.org_id) === Number(currentOrgId));
  const userRole = activeOrg?.role as string;
  const isAdminOrOwner = userRole === 'Owner' || userRole === 'Admin';

  const handleSwitch = async (targetOrgId: string) => {
    try {
      const res = await api.post('/user/switch-org', { targetOrgId });
      toast.success("Organization switched successfully");
      
      if (targetOrgId) localStorage.setItem('activeOrgId', targetOrgId);
      if (res.data?.data?.role) localStorage.setItem('userRole', res.data.data.role);

      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Switching failed!");
    }
  };

  if (loading) return <div className="w-64 bg-gray-800 h-screen p-4 text-gray-400 shrink-0">Loading...</div>;

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4 flex flex-col justify-between shrink-0">
      <div>
        {/* Organization Switcher Dropdown */}
        <div className="mb-8">
          <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Active Org</label>
          <select
            value={currentOrgId}
            onChange={(e) => handleSwitch(e.target.value)}
            className="w-full bg-gray-700 text-sm p-2 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {orgs.map((m) => (
              <option key={m.org_id} value={m.org_id}>
                {m.organization?.name || "Loading..."} ({m.role})
              </option>
            ))}
          </select>
        </div>

        <nav className="space-y-2">
          <Link href="/tickets">
            <div className="p-3 rounded hover:bg-gray-700 cursor-pointer transition-colors flex items-center gap-2">
              <span><Ticket /></span> <span className="text-lg">Tickets</span>
            </div>
          </Link>

          {isAdminOrOwner && (
            <Link href="/members">
              <div className="p-3 rounded hover:bg-gray-700 cursor-pointer transition-colors flex items-center gap-2">
                <span><UsersIcon /></span> <span className="text-lg">Members</span>
              </div>
            </Link>
          )}
          {isAdminOrOwner && (
            <Link href="/audit-log">
              <div className="p-3 rounded hover:bg-gray-700 cursor-pointer transition-colors flex items-center gap-2">
                <span> <LucideLogs /></span> <span className="text-lg">Audit Logs</span>
              </div>
            </Link>
          )}
        </nav>
      </div>

      <div className="text-sm text-gray-400 border-t border-gray-700 pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase">My Role</span>
          <span className="text-white font-semibold">{userRole || "Loading..."}</span>
        </div>
      </div>
    </div>
  )
}

export default SideBar;
