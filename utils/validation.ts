/**
 * Validation utility functions
 */

/**
 * Validates if an email address is in a valid format
 * @param email - The email address to validate
 * @returns true if email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a password meets minimum length requirements
 * @param password - The password to validate
 * @param minLength - Minimum required length (default: 8)
 * @returns true if password meets requirements, false otherwise
 */
export const isValidPassword = (
  password: string,
  minLength: number = 8,
): boolean => {
  return password.length >= minLength;
};

/**
 * Validates username length (3–20 characters)
 */
export const isValidUsername = (username: string): boolean => {
  return username.trim().length >= 3 && username.trim().length <= 20;
};

/**
 * Validates first/last name length (1–50 characters)
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 50;
};

/**
 * Validates age is a number between 1 and 120
 */
export const isValidAge = (age: string): boolean => {
  const n = Number(age);
  return Number.isInteger(n) && n >= 1 && n <= 120;
};

/**
 * Validates height in cm between 50 and 250
 */
export const isValidHeight = (height: string): boolean => {
  const n = Number(height);
  return !isNaN(n) && n >= 50 && n <= 250;
};

/**
 * Validates weight in kg between 1 and 500
 */
export const isValidWeight = (weight: string): boolean => {
  const n = Number(weight);
  return !isNaN(n) && n >= 1 && n <= 500;
};

/**
 * Validates if two passwords match
 * @param password - The original password
 * @param confirmPassword - The confirmation password
 * @returns true if passwords match, false otherwise
 */
export const doPasswordsMatch = (
  password: string,
  confirmPassword: string,
): boolean => {
  return password === confirmPassword;
};
