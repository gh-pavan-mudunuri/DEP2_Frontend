// Edit profile Page
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  imageUrl: string;
  imageFile: File | null;
  imagePreview: string;
}