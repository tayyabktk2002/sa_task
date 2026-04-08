import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { useOrganizations } from '@/hooks/useOrganizations';

interface InviteUserModalProps {
    onClose: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Member'); // Default role
    const [loading, setLoading] = useState(false);
    const { currentOrgId } = useOrganizations();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/members/invite-user', { email, role, org_id: currentOrgId });
            toast.success('Invitation sent successfully!');
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#1e293b] p-6 rounded-lg shadow-xl border border-slate-700 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Invite New Member</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter user's email"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                            <option value="Viewer">Viewer</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 rounded-md transition-colors ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteUserModal;