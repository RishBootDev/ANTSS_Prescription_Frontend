export const pdfGenerator = {
  /**
   * Triggers browser print dialog.
   * Can be customized to export PDF or trigger specific CSS layouts.
   */
  triggerPrint: (): void => {
    if (typeof window !== "undefined") {
      window.print();
    }
  },
};
