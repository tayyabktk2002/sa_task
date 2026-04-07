"use client"
import Link from 'next/link';
import React from 'react'

interface SideBarProps {
  userRole?: string;
}

const userRole = localStorage.getItem('userRole');
const orgName = localStorage.getItem('orgName');


const SideBar: React.FC<SideBarProps> = () => {
  const isAdminOrOwner = userRole === 'Owner' || userRole === 'Admin';

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">{orgName || "Task Home"}</h2>
      </div>

      <nav className="space-y-2">
        <div className="p-3 rounded hover:bg-gray-700 cursor-pointer transition-colors">
          <Link href="/tickets" className=''>
            <span className="text-lg">🎫 Tickets</span>
          </Link>
        </div>
        {isAdminOrOwner && (
          <div className="p-3 rounded hover:bg-gray-700 cursor-pointer transition-colors">
            <Link href="/members">
              <span className="text-lg">👥 Members</span>
            </Link>
          </div>
        )}
      </nav>
      <div className="absolute bottom-4 left-4 text-sm text-gray-400">
        Role: {userRole}
      </div>
    </div>
  )
}

export default SideBar
