// Travel Guardian - Validation Helpers
// Simple functions to validate user input in forms

// Check if string is empty or only whitespace
export const isEmpty = (text) => {
  return !text || text.trim() === '';
};

// Check if email format is valid
export const validateEmail = (email) => {
  if (isEmpty(email)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Check if password has minimum length (at least 6 characters)
export const validatePassword = (password) => {
  if (isEmpty(password)) return false;
  return password.length >= 6;
};

// Check if phone number is valid (simple digits check, at least 10 digits)
export const validatePhoneNumber = (phone) => {
  if (isEmpty(phone)) return false;
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned.length >= 10;
};
