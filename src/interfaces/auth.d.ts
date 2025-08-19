export interface User {
  id: string;
  name: string;
  email: string;
  // Add more fields if your backend includes them
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Signup Page

export interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface APIResponse {
  message: string;
}

// Login Page

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: number;
  };
}

export interface APIError {
  message: string;
}


// Verify Email Page

export interface VerifyEmailResponse {
  message: string;
}