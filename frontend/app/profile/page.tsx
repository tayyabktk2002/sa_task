import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
const page = () => {

    const userRole = localStorage.getItem('userRole');
    const orgName = localStorage.getItem('orgName');
    const userName = localStorage.getItem('userName');
    return (
        <div>
            <div className='mx-10 my-5 flex items-center gap-2'>
                <Link href="/" className='hover:text-indigo-600'>
                    <ArrowLeft />
                </Link>
                <h1 className='text-xl font-bold'>Profile</h1>
            </div>
            <div className="flex items-center justify-between px-6 h-16 gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            S
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900">Sparking Asia</span>
                            <span className="text-xs text-slate-500">Workspace</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page