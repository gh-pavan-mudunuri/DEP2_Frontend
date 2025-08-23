export interface NavbarProps {
  showSignup?: boolean;
  showCreateEvent?: boolean;
  showLogin?: boolean;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
}

export interface UserProfile {
  role?: number | string;
  name?: string;
  username?: string;
  Email?: string;
  email?: string;
  profileImage?: string;
  imageUrl?: string;
  userId?: string;
  id?: string;
  UserId?: string;
  Id?: string;
}