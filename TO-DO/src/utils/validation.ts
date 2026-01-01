export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

export const validateTaskText = (text: string): boolean => {
  return text.trim().length > 0 && text.length <= 500;
};

export const validateCourseCode = (code: string): boolean => {
  return code.trim().length > 0 && code.length <= 10;
};

export const sanitizeInput = (input: string): string => {
  // First remove script tags and their content
  let sanitized = input.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
  // Then remove all other HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  return sanitized.trim();
};
