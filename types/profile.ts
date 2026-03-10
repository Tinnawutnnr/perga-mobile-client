export type CreateProfileRequest = {
  first_name: string;
  last_name: string;
  age?: number;
  height?: number;
  weight?: number;
};

export type ProfileStatus = {
  has_profile: boolean;
  role: string;
};

export type MyProfile = {
  first_name: string;
  last_name: string;
  age?: number;
  height?: number;
  weight?: number;
};
