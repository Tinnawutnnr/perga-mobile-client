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

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
  reset_session_token: string;
};

export type ResetPasswordRequest = {
  reset_session_token: string;
  otp: string;
  new_password: string;
};

export type ResetPasswordResponse = {
  message: string;
};
