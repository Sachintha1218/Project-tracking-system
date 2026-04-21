/**
 * Session Cookie Management Utility
 * 
 * This script manages browser cookies with no 'Max-Age' or 'Expires' attribute,
 * ensuring they are automatically deleted when the browsing session ends 
 * (i.e., when the browser is closed).
 */

/**
 * Sets a session cookie.
 * @param name - The name of the cookie
 * @param value - The value to store
 */
export const setSessionValue = (name: string, value: string) => {
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(value);
  
  // Omitting 'Expires' and 'Max-Age' makes this a session cookie.
  // We use 'SameSite=Lax' for basic CSRF protection and 'Path=/' to make it available site-wide.
  document.cookie = `${encodedName}=${encodedValue}; path=/; SameSite=Lax`;
};

/**
 * Retrieves a session cookie value.
 * @param name - The name of the cookie
 * @returns The value of the cookie or null if not found
 */
export const getSessionValue = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  
  return null;
};

/**
 * Removes a session cookie.
 * @param name - The name of the cookie to remove
 */
export const removeSessionValue = (name: string) => {
  const encodedName = encodeURIComponent(name);
  
  // To delete a cookie, we set its expiration date to the past.
  document.cookie = `${encodedName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};
