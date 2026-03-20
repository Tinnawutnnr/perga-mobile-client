export type RegisterRequest = {
  email: string;
  username: string;
  password: string;
  role: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
};
