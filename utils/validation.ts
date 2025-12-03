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
export const isValidPassword = (password: string, minLength: number = 8): boolean => {
  return password.length >= minLength;
};

/**
 * Validates if two passwords match
 * @param password - The original password
 * @param confirmPassword - The confirmation password
 * @returns true if passwords match, false otherwise
 */
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};