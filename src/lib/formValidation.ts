export function validateLogin(values: { email: string; password: string }) {
  const errors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) || values.email.trim().length > 254) errors.email = 'Enter a valid email address';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length > 128) errors.password = 'Password must be at most 128 characters';
  return errors;
}

export function validateInvite(values: { name: string; password: string; confirm: string }) {
  const errors: Record<string, string> = {};
  if (values.name.trim().length < 2 || values.name.trim().length > 60) errors.name = 'Use between 2 and 60 characters';
  if (values.password.length < 8 || values.password.length > 128) errors.password = 'Use between 8 and 128 characters';
  if (values.password !== values.confirm) errors.confirm = 'Passwords do not match';
  return errors;
}

export function safeReturnPath(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(value)) return '/dashboard';
  return value;
}
