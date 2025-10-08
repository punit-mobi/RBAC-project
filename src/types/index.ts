interface RegisterResponse {
  first_name: string;
  email: string;
  is_admin: boolean;
  role: string;
}

interface LoginUserResponse {
  first_name: string;
  email: string;
  is_admin: boolean;
  role: {
    name: string;
    permissions: string[];
  } | null;
}

export type { RegisterResponse, LoginUserResponse };
