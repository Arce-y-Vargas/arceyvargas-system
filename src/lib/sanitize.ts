import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (dirty: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: return the string as-is since DOMPurify needs DOM
    return dirty;
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
  });
};

/**
 * Sanitize text input by removing HTML tags and dangerous characters
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, (match) => {
      const map: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return map[match] || match;
    });
};

/**
 * Validate and sanitize email addresses
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w@.-]/g, ''); // Keep only valid email characters
};

/**
 * Sanitize numeric inputs
 */
export const sanitizeNumber = (value: string | number): number => {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  
  if (typeof value !== 'string') {
    return 0;
  }
  
  // Remove non-numeric characters except decimal points and minus sign
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Sanitize file names to prevent directory traversal
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') {
    return '';
  }
  
  return fileName
    .replace(/[\/\\:*?"<>|]/g, '') // Remove dangerous characters
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
};