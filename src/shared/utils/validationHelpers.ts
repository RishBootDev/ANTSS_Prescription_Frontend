export const validationHelpers = {
  /**
   * Validates standard 10-digit mobile number
   */
  isValidMobile: (mobile: string): boolean => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(mobile);
  },

  /**
   * Validates standard email addresses
   */
  isValidEmail: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Checks if BP string format is correct (e.g. "120/80")
   */
  isValidBP: (bp: string): boolean => {
    const regex = /^\d{2,3}\/\d{2,3}$/;
    return regex.test(bp);
  },

  /**
   * Validates numeric input limits for vitals
   */
  validateVitalRange: (
    value: number | null | undefined,
    min: number,
    max: number
  ): boolean => {
    if (value === null || value === undefined) return true;
    return value >= min && value <= max;
  },
};
