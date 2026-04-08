export interface User {
  id: number;
  name: string;
  email: string;
  memberships?: Membership[];
}

export interface Membership {
  id: number;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  org_id: number;
  organization?: {
    name: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SideBarProps {
  userRole?: string;
}

export interface Member {
  id: number;
  name: string;
  role: string;
  user: {
    id: number;
    name: string;
    email: string;
  }
  createdAt: string;
}

export interface UseMembersResult {
  members: Member[];
  loading: boolean;
  hasMore: boolean;
  fetchMoreMembers: () => void;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  refreshMembers: () => void;
}

export interface AuditLog {
  id: number;
  action_type: string;
  message: string;
  details: object;
  org_id: number;
  org_name: string;
  user_id: number;
  user_name: string;
  ticket_id: number | null;
  ticket_title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UseAuditLogsResult {
  auditLogs: AuditLog[];
  loading: boolean;
  hasMore: boolean;
  fetchMoreAuditLogs: () => void;
  refreshAuditLogs: () => void;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "Investigating" | "Mitigated" | "Resolved";
  tags: string[];
  createdAt: string;
  updatedAt: string;
  org_id: number;
  org_name: string;
  created_by: string;
  creator: User;
  assigned_to: number | null;
  assignee?: User;
  comments?: Comment[];
}

export interface AttachmentData {
  file_name: string;
  file_url: string;
  file_type: string;
  cloudinary_public_id: string;
}

export interface Comment {
  id: number;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  user_id: number;
  user_name: string;
  ticket_id: number;
  attachments?: AttachmentData[];
}
