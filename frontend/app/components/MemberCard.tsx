import React, { useState } from "react";
import { Member } from "@/types";
import { updateMemberRole } from "@/hooks/useMember";
import { toast } from "react-toastify";

const MemberCard = ({
  members,
  onRemove,
  currentUserRole,
  onRoleUpdate,
}: {
  members: Member[];
  onRemove: (memberId: number) => void;
  currentUserRole: string;
  onRoleUpdate?: () => void;
}) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleRoleChange = async (memberId: number, newRole: string) => {
    try {
      setUpdatingId(memberId);
      await updateMemberRole(memberId, newRole);
      toast.success("Role updated successfully");
      if (onRoleUpdate) onRoleUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const roles = ["Admin", "Member", "Viewer"];

  return (
    <div>
      {members.map((member: Member, index: number) => (
        <div
          key={index}
          className="bg-[#1e293b] border mb-5 border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-colors flex flex-col group shadow-md shadow-black/20"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
              {member?.user?.name}
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              member.role === 'Owner' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
              member.role === 'Admin' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              'bg-slate-500/10 text-slate-400 border border-slate-500/20'
            }`}>
              {member.role}
            </span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-1 mb-1">
            Email: {member?.user?.email}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>{member.role === "Owner" ? "Owner Since" : "Joined"}</span>
              <span>{new Date(member.createdAt).toLocaleDateString()}</span>
            </div>

            {currentUserRole === "Owner" && member.role !== "Owner" && (
              <div className="text-[11px] text-slate-500 flex justify-between items-center">
                <span>Member ID</span>
                <span>{member.id}</span>
              </div>
            )}

            {/* Role Change Section */}
            {(currentUserRole === "Owner" || currentUserRole === "Admin") && member.role !== "Owner" && (
              <div className="pt-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Change Role</label>
                <select
                  disabled={updatingId === member.id}
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 text-white text-xs rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                  {currentUserRole === "Owner" && <option value="Owner">Owner</option>}
                </select>
              </div>
            )}

            {currentUserRole === "Owner" && member.role !== "Owner" && (
              <button
                onClick={() => onRemove(member.id)}
                className="w-full text-xs mt-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all cursor-pointer font-medium"
              >
                Remove Member
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberCard;
