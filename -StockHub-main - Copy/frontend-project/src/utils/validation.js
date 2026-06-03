export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateMinLength(value, min, fieldName) {
  if (value && value.trim().length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
}

export function validatePositiveInteger(value, fieldName) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    return `${fieldName} must be a positive integer`;
  }
  return null;
}

export function validatePositiveNumber(value, fieldName) {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
}

export function validateNoSpecialChars(value, fieldName) {
  if (value && !/^[a-zA-Z0-9\s]+$/.test(value)) {
    return `${fieldName} must not contain special characters`;
  }
  return null;
}

export function validateLettersOnly(value, fieldName) {
  if (value && !/^[a-zA-Z\s]+$/.test(value)) {
    return `${fieldName} must contain only letters and spaces`;
  }
  return null;
}
