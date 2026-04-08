'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { EyeClosed, EyeOffIcon } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoader(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <form onSubmit={handleLogin} className="w-full max-w-md p-8 bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-transparent mb-6 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text">
          Welcome Back
        </h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none transition-all"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
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
            {loader ? 'Logging in...' : 'Sign In'}
          </button>
          <div>
            <span className="text-sm text-gray-400">Don't have an account? </span>
            <Link href="/register" className="text-sm text-blue-500 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}