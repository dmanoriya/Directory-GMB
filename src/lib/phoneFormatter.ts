/**
 * Phone formatting utility for automatic (XXX) XXX-XXXX masking.
 * Caps strict maximum at 10 numeric digits.
 */
export function formatPhoneNumber(val: string): string {
  if (!val) return '';
  
  // Extract numeric digits, strictly capping at 10 digits
  const digits = val.replace(/\D/g, '').slice(0, 10);
  
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export function isValidPhoneNumber(val: string): boolean {
  const digits = val.replace(/\D/g, '');
  return digits.length === 10;
}
