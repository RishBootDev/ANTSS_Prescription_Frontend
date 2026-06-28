export interface MedicalDictionary {
  abbreviations: Record<string, string>;
  medicines: Record<string, string>;
}

export const medicalDictionary: MedicalDictionary = {
  abbreviations: {
    // Frequencies
    "OD": "Once Daily",
    "BD": "Twice Daily",
    "BID": "Twice Daily",
    "TDS": "Three Times Daily",
    "TID": "Three Times Daily",
    "QID": "Four Times Daily",
    "SOS": "As Needed",
    "HS": "At Bedtime",
    
    // Meal Instructions
    "AC": "Before Meals",
    "PC": "After Meals",
    "BB": "Before Breakfast",
    
    // Vitals / Clinical
    "BP": "Blood Pressure",
    "PR": "Pulse Rate",
    "HR": "Heart Rate",
    "Temp": "Temperature",
    "Wt": "Weight",
    "Ht": "Height",
    "Dx": "Diagnosis",
    "Hx": "History",
    "Rx": "Prescription",
    "C/O": "Complains Of",
  },
  medicines: {
    // Common Medicine Aliases
    "PCM": "Paracetamol",
    "Crocin": "Paracetamol",
    "Dolo": "Paracetamol",
    "Vit C": "Vitamin C",
    "Amox": "Amoxicillin",
    "Azithro": "Azithromycin",
    "Pantocid": "Pantoprazole",
    "Pan D": "Pantoprazole + Domperidone",
    "Allegra": "Fexofenadine",
    "Calpol": "Paracetamol",
  }
};

/**
 * Helper to serialize the dictionary into the prompt
 */
export function getDictionaryPromptText(): string {
  const abbrevLines = Object.entries(medicalDictionary.abbreviations)
    .map(([key, val]) => `${key} -> ${val}`)
    .join("\n  ");
    
  const medLines = Object.entries(medicalDictionary.medicines)
    .map(([key, val]) => `${key} -> ${val}`)
    .join("\n  ");

  return `
MEDICAL DICTIONARY & NORMALIZATION RULES:
You MUST aggressively replace the following spoken abbreviations and aliases with their full normalized text.
  
Standard Abbreviations:
  ${abbrevLines}
  
Standard Medicines:
  ${medLines}
  
If you hear an abbreviation that matches the left side, ONLY output the normalized value on the right side.
`;
}
