'use client';
import api from '@/lib/api';
import { EyeClosed, EyeOffIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';


export default function SignupPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const invite_token = searchParams.get('invite_token');
    console.log(invite_token);


    const [loader, setLoader] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });


    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoader(true);
        try {
            const { data } = await api.post('/auth/register', { ...formData, invite_token: searchParams.get('invite_token') });
            const { name, role, org_id, org_name } = data.data;
            localStorage.setItem('userName', name);
            localStorage.setItem('userRole', role);
            localStorage.setItem('activeOrgId', org_id);
            localStorage.setItem('orgName', org_name);
            router.push('/');
            toast.success("Registered successfully.");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoader(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
            <form onSubmit={handleRegister} className="w-full max-w-lg p-8 bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Create Your Account</h2>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Email"
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="relative w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                        >
                            {showPassword ? <EyeOffIcon size={20} /> : <EyeClosed size={20} />}
                        </button>
                    </div>
                    <button type="submit" className={`w-full py-3 ${loader ? 'bg-gray-500' : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'} text-white font-bold rounded-lg transition-all ${loader ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={loader}
                    >
                        {loader ? 'Account Creating...' : 'Create Account'}
                    </button>
                </div>
            </form>
        </div>
    );
}