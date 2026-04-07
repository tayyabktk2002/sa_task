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