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
  const isAuthPage = pathname === '/login' || pathname === '/register';


  return (
    <body className="min-h-full flex"
      cz-shortcut-listen="true"
    >
      {!isAuthPage && <SideBar />}
      <main className={`flex-1 ${isAuthPage ? '' : 'bg-gray-50'}`}>
        {!isAuthPage && <AppBar />}
        {children}
        <ToastContainer autoClose={2000}
          position="top-right"
          hideProgressBar={true}
        />
      </main>
    </body>
  );
}
