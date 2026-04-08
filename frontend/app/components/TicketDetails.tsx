'use client'
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Ticket, User } from '@/types';
import { X } from 'lucide-react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useMembers } from '@/hooks/useMember'; 

interface TicketDetailsProps {
    ticketId: number;
    onClose: () => void;
}

const STATUS_OPTIONS = ["Open", "Investigating", "Mitigated", "Resolved"];
const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

const TicketDetails: React.FC<TicketDetailsProps> = ({ ticketId, onClose }) => {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editableTicket, setEditableTicket] = useState<Partial<Ticket>>({});
    const [newCommentContent, setNewCommentContent] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    const { orgs, currentOrgId } = useOrganizations();
    const activeOrg = orgs.find((m: any) => m.org_id === currentOrgId);
    const currentUserRole = activeOrg?.role as string;
    const { members } = useMembers();

    const canEdit = currentUserRole === 'Owner' || currentUserRole === 'Admin' || currentUserRole === 'Member';

    useEffect(() => {

        const fetchTicket = async () => {
            try {
                setLoading(true);
                setError(null); 

                const response = await api.get(`/tickets/get/${ticketId}`);
                const fetchedTicket: Ticket = response.data.data.ticket;
                setTicket(fetchedTicket);
                setEditableTicket(fetchedTicket);

            } catch (err) {
                console.error('Failed to fetch ticket details:', err);
                setError('Failed to fetch ticket details.');
            } finally {
                setLoading(false);

            }
        };
        fetchTicket();
    }, [ticketId]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditableTicket(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const updateData: Partial<Ticket> = {
                title: editableTicket.title,
                description: editableTicket.description,
                severity: editableTicket.severity,
                status: editableTicket.status,
                assigned_to: editableTicket.assigned_to,
            };
            const response = await api.put(`/tickets/update/${ticketId}`, updateData);
            setTicket(response.data.ticket);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update ticket.');
            console.error(err);
        }
 finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleCommentSubmit = async () => {
        if (!newCommentContent.trim() && !selectedFile) return;

        setUploading(true);
        const formData = new FormData();

        if (newCommentContent.trim()) {
            formData.append('content', newCommentContent);
        }
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        try {
            const response = await api.post(`/tickets/${ticketId}/comments`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const addedComment = response.data.comment;

            setTicket(prevTicket => {
                if (!prevTicket) return null;
                if (!addedComment) {
                    return prevTicket;
                }
                return {
                    ...prevTicket,
                    comments: [...(prevTicket.comments || []), addedComment]
                };
            });
            setNewCommentContent('');
            setSelectedFile(null);
        } catch (err) {
            console.error('Failed to add comment or upload file:', err);
        } finally {
            setUploading(false);
        }
    };


    if (loading) {

        return (
            <div className="fixed inset-0 bg-black/40 bg-opacity-20 flex items-center justify-center z-50">
                <div className="bg-[#0f172a] p-8 rounded-lg shadow-xl text-white w-full max-w-2xl relative">
                    <div>Loading ticket...</div>
                </div>
            </div>
        );
    }

    if (error) {

        return (
            <div className="fixed inset-0 bg-black/40 bg-opacity-20 flex items-center justify-center z-50">
                <div className="bg-[#0f172a] p-8 rounded-lg shadow-xl text-white w-full max-w-2xl relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                    <div>Error: {error}</div>
                </div>
            </div>
        );
    }

    if (!ticket) {

        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/40 bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-[#0f172a] p-8 rounded-lg shadow-xl text-white w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                <h2 className="text-2xl font-bold mb-4">{isEditing ? (
                    <input
                        type="text"
                        name="title"
                        value={editableTicket.title || ''}
                        onChange={handleEditChange}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                ) : ticket.title}</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-slate-400">Status:</p>
                        {isEditing && canEdit ? (
                            <select
                                name="status"
                                value={editableTicket.status || ''}
                                onChange={handleEditChange}
                                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            >
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="text-lg font-semibold">{ticket.status}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Severity:</p>
                        {isEditing && canEdit ? (
                            <select
                                name="severity"
                                value={editableTicket.severity || ''}
                                onChange={handleEditChange}
                                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            >
                                {SEVERITY_OPTIONS.map(severity => (
                                    <option key={severity} value={severity}>{severity}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="text-lg font-semibold">{ticket.severity}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Created By:</p>
                        <span className="text-lg font-semibold">{ticket.creator?.name || 'N/A'}</span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Assigned To:</p>
                        {isEditing && canEdit ? (
                            <select
                                name="assigned_to"
                                value={editableTicket.assigned_to || ''}
                                onChange={handleEditChange}
                                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Unassigned</option>
                                {members.map(member => (
                                    <option key={member.user.id} value={member.user.id}>{member.user.name}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="text-lg font-semibold">{ticket.assignee?.name || 'Unassigned'}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Created At:</p>
                        <span className="text-lg font-semibold">{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Last Updated:</p>
                        <span className="text-lg font-semibold">{new Date(ticket.updatedAt).toLocaleString()}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-slate-400 mb-1">Description:</p>
                    {isEditing && canEdit ? (
                        <textarea
                            name="description"
                            value={editableTicket.description || ''}
                            onChange={handleEditChange}
                            rows={4}
                            className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                    ) : (
                        <p className="text-white whitespace-pre-wrap">{ticket.description}</p>
                    )}
                </div>

                {ticket.tags && ticket.tags.length > 0 && (
                    <div className="mb-6">
                        <p className="text-sm text-slate-400 mb-1">Tags:</p>
                        <div className="flex flex-wrap gap-2">
                            {ticket.tags.map((tag, index) => (
                                <span key={index} className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}

                {canEdit && (
                    <div className="flex justify-end gap-2 mt-4">
                        {isEditing ? (
                            <>
                                <button onClick={() => { setIsEditing(false); setEditableTicket(ticket); }} className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors">Cancel</button>
                                <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">Save</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">Edit Ticket</button>
                        )}
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-slate-700">
                    <h3 className="text-xl font-bold mb-4">Comments</h3>
                    <div className="space-y-4">
                        {ticket.comments && ticket.comments.length > 0 ? (
                            ticket.comments.map(comment => {
                                return (
                                    <div key={comment.id} className="bg-[#1e293b] p-4 rounded-lg border border-slate-700">
                                        <p className="text-sm text-white">{comment.content}</p>
                                    {comment.attachments && comment.attachments.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {comment.attachments.map((att, idx) => (
                                                <div key={idx}>
                                                    {att.file_type?.startsWith('image/') ? (
                                                        <div className="relative group max-w-sm">
                                                            <img 
                                                                src={att.file_url} 
                                                                alt={att.file_name} 
                                                                className="rounded-lg border border-slate-700 max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                                onClick={() => window.open(att.file_url, '_blank')}
                                                            />
                                                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {att.file_name}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs flex items-center">
                                                            <span className="mr-1">📁</span> {att.file_name}
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-500 mt-2">By {comment.user_name} on {new Date(comment.createdAt).toLocaleString()}</p>
                                </div>
                            )})
                        ) : (
                            <div className="bg-[#1e293b] p-4 rounded-lg text-slate-400 border border-slate-700">
                                No comments yet.
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <textarea
                            placeholder="Add a comment..."
                            rows={3}
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        {canEdit && (
                            <div className="mt-2 flex items-center space-x-2">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        )}
                        <button
                            onClick={handleCommentSubmit}
                            disabled={uploading || (!newCommentContent.trim() && !selectedFile)}
                            className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Submitting...' : 'Add Comment'}
                        </button>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default TicketDetails;
