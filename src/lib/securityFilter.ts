/**
 * Security & Anti-Spam Filter Utility
 * Protects registration & forms against spam bots, adult content, and injection attacks.
 */

// Adult & Illegal Content Keywords
const PROHIBITED_KEYWORDS = [
  'adult', 'porn', 'xxx', 'sex', 'casino', 'gambling', 'viagra', 'cialis',
  'escort', 'nude', 'erotic', 'hentai', 'pills', 'pharma', 'crypto-bot',
  'hack', 'warez', 'torrent', 'vape', 'cbd-oil', 'replica', 'cheap-loans'
];

// Blocked Disposable Email Domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
  'trashmail.com', 'getairmail.com', 'dispostable.com', 'yopmail.com',
  'sharklasers.com', 'maildrop.cc', 'temp-mail.org'
];

/**
 * Sanitizes input string to prevent XSS and injection
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Checks if a string contains adult or spam keywords
 */
export function containsProhibitedContent(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return PROHIBITED_KEYWORDS.some((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(lower);
  });
}

/**
 * Validates whether an email uses a disposable domain
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

/**
 * Validates Password Complexity
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export interface PasswordRequirements {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function checkPasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

export function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: 'None', color: '#cbd5e1' };
  
  const reqs = checkPasswordRequirements(password);
  let score = 0;
  if (reqs.minLength) score += 20;
  if (reqs.hasUpper) score += 20;
  if (reqs.hasLower) score += 20;
  if (reqs.hasNumber) score += 20;
  if (reqs.hasSpecial) score += 20;

  if (score <= 40) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 60) return { score, label: 'Fair', color: '#f59e0b' };
  if (score <= 80) return { score, label: 'Good', color: '#3b82f6' };
  return { score, label: 'Strong & Secure', color: '#10b981' };
}
