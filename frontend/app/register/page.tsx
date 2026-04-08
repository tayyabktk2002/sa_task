'use client';
import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { EyeClosed, EyeOffIcon } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    org_name: ''
  });
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoader(true);
    try {
      await api.post('/auth/register', formData);
      router.push('/');
      toast.success("Organization registered successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <form onSubmit={handleRegister} className="w-full max-w-lg p-8 bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl space-y-6">
        <h2 className="text-2xl font-bold text-white mb-4">Create Your Instance</h2>

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

          <div className="pt-4 border-t border-slate-700">
            <label className="text-xs font-bold uppercase text-blue-400 mb-2 block">Organization Setup</label>
            <input
              type="text"
              placeholder="Organization Name (e.g. Acme Corp)"
              className="w-full p-3 bg-slate-900 border border-blue-500/30 rounded-lg text-white focus:border-blue-500 outline-none"
              onChange={e => setFormData({ ...formData, org_name: e.target.value })}
              required
            />
          </div>

          <button type="submit" className={`w-full py-3 ${loader ? 'bg-gray-500' : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'} text-white font-bold rounded-lg transition-all ${loader ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={loader}
          >
            {loader ? 'Creating Workspace...' : 'Build My Workspace'}
          </button>
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-300 block text-center">
            Already have an account? <span className="text-blue-500 hover:underline">Sign In</span>
          </Link>
        </div>
      </form>
    </div>
  );
}