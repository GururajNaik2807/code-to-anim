/**
 * Maps Supabase & network error messages to secure, human-readable UI notices.
 * Prevents internal backend/database details and raw exceptions from leaking to the UI.
 *
 * @param {Error|Object|string} error - The caught error object or message string
 * @returns {string} User-friendly error message
 */
export function mapAuthError(error) {
  if (!error) return '';

  const message = (typeof error === 'string' ? error : error.message || '').toLowerCase();

  // Authentication credentials
  if (
    message.includes('invalid login credentials') ||
    message.includes('invalid_grant') ||
    message.includes('invalid email or password')
  ) {
    return "That email or password doesn't look right. Please check your credentials and try again.";
  }

  // Account collisions
  if (
    message.includes('user already registered') ||
    message.includes('already exists') ||
    message.includes('identity already exists')
  ) {
    return 'An account with this email already exists. Try logging in instead.';
  }

  // Password complexity & validation
  if (message.includes('password should be at least') || message.includes('password is too short')) {
    return 'Password must be at least 6 characters long.';
  }
  if (message.includes('passwords do not match')) {
    return 'Passwords do not match. Please verify and try again.';
  }

  // OTP / Recovery tokens
  if (
    message.includes('token has expired') ||
    message.includes('otp expired') ||
    message.includes('token is invalid') ||
    message.includes('invalid token')
  ) {
    return 'Your recovery code is invalid or has expired. Please request a new code.';
  }

  // Rate limiting / abuse
  if (
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('over_email_send_rate_limit')
  ) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }

  // Network / Connection issues
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('failed to fetch') ||
    message.includes('timeout')
  ) {
    return "We couldn't connect right now. Check your internet connection and try again.";
  }

  // Email format validation
  if (message.includes('invalid email') || message.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }

  // Default fallback for unhandled / unknown errors
  return 'Unable to complete this request. Please check your details and try again.';
}