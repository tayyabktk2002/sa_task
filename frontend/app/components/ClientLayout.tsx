'use client';

import { usePathname } from "next/navigation";
import SideBar from "./SideBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppBar from "./AppBar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {

  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/invite-signup';


  return (
    <body className="h-screen flex overflow-hidden"
      cz-shortcut-listen="true"
    >
      {!isAuthPage && <SideBar />}
      <main className={`flex-1 flex flex-col overflow-hidden ${isAuthPage ? '' : 'bg-gray-50'}`}>
        {!isAuthPage && <AppBar />}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        <ToastContainer autoClose={2000}
          position="top-right"
          hideProgressBar={true}
        />
      </main>
    </body>
  );
}
