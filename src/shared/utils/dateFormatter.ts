export const dateFormatter = {
  /**
   * Format ISO string or date object into DD MMM YYYY (e.g. "13 Jun 2026")
   */
  formatDate: (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return "N/A";
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  },

  /**
   * Format ISO string or date object into Time (e.g. "02:54 PM")
   */
  formatTime: (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return "N/A";
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  },

  /**
   * Checks if a date matches today's local date in YYYY-MM-DD format
   */
  isToday: (dateInput: string | Date | null | undefined): boolean => {
    if (!dateInput) return false;
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return false;
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    } catch {
      return false;
    }
  },

  /**
   * Return today's date in YYYY-MM-DD format
   */
  getTodayString: (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  },
};
