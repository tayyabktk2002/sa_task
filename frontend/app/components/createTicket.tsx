"use client";
import React, { useState } from "react";
import api from "@/lib/api";
import { useMembers } from "@/hooks/useMember";

interface CreateTicketProps {
    onClose: () => void;
    onSuccess: () => void;
}

const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Open", "Investigating", "Mitigated", "Resolved"];

const CreateTicket = ({ onClose, onSuccess }: CreateTicketProps) => {
    const [form, setForm] = useState({ title: "", description: "", severity: "Low", status: "Open", tags: "", assignee: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { members } = useMembers();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.post("/tickets/create", {
                ...form,
                tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                assignee: form.assignee || null,
            });
            onSuccess();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to create ticket.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-white">Create New Ticket</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none cursor-pointer">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Title</label>
                        <input
                            name="title" value={form.title} onChange={handleChange} required
                            placeholder="Ticket title"
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Description</label>
                        <textarea
                            name="description" value={form.description} onChange={handleChange} required rows={3}
                            placeholder="Describe the issue..."
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Severity</label>
                        <select
                            name="severity" value={form.severity} onChange={handleChange}
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Status</label>
                        <select
                            name="status" value={form.status} onChange={handleChange}
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                    </div>
                    <label className="text-xs text-slate-400 mb-1 block">Assignee</label>
                    <select
                        name="assignee" value={form.assignee} onChange={handleChange}
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Unassigned</option>
                        {members.map(member => (
                            <option key={member.id} value={member.user.id}>{member.user.name}</option>
                        ))}
                    </select>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Tags <span className="text-slate-600">(comma separated)</span></label>
                        <input
                            name="tags" value={form.tags} onChange={handleChange}
                            placeholder="e.g. network, auth, critical"
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {error && <p className="text-red-400 text-xs">{error}</p>}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-all cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-all cursor-pointer">
                            {loading ? "Creating..." : "Create Ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
