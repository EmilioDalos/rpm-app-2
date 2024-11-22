export interface Category {
  id: string;
  name: string;
  type: "personal" | "professional";
  description: string;
  vision: string;
  purpose: string;
  roles: Role[];
  threeToThrive: string[];
  resources: string;
  results[]: string; //result, date to achieve
  actionPlans: string[];
  imageBlob: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface Role {
  id: string;
  categoryId: string;
  name: string;
  purpose: string;
  description: string;
  coreQualities: string[];
  identityStatement: string;
  incantations: string[];
  imageBlob: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFormData {
  name: string;
  type: "personal" | "professional";
  description: string;
  roles: { name: string }[];
}

export interface RoleFormData {
  name: string;
  purpose: string;
  description: string;
  coreQualities: string[];
  identityStatement: string;
  reflection: string;
  imageUrl?: string;
}



// Type for the RPM Block
export type RpmBlock = {
  id: string; // Unique identifier for the action
  result: string; // The result or goal associated with this block
  purposes: string[]; // List of purposes associated with this block
  massiveActions: MassiveAction[]; // List of massive actions within this block
  category: string; // Category the action belongs to
  type: "time" | "project" | "day" | "week" | "month" | "quater"
  createdAt: Date;
  updatedAt: Date;
  saved: boolean;
};

// Type for an individual massive action
export type MassiveAction = {
  id: string; // Unique identifier for the action
  text: string; // Description or title of the action
  leverage: string; // Impact level (e.g., "High", "Low")
  durationAmount: number; // Time required for the action
  durationUnit: 'min' | 'hr' | 'd' | 'wk' | 'mo'; // Unit of duration
  priority: number; // Priority level
  key: '✘' | '✔' | 'O' | '➜'; // Status key
};

// Zorg ervoor dat ActionPlan de juiste type verwijzing heeft
type ActionPlan = {
  id: number;
  text: string;
  leverage: string;
  durationAmount: number;
  durationUnit: string;
  priority: number;
  key: string;
  category: string;
  type: RpmBlock['type']; // Gebruik de type definitie van RpmBlock
}

const addMassiveAction = () => {
  const newAction: ActionPlan = {
    id: Date.now(),
    text: '',
    leverage: '',
    durationAmount: 0,
    durationUnit: 'min',
    priority: massiveActions.length + 1,
    key: '✘',
    category: selectedCategory || '',
    type: selectedOption || 'time', // Voeg de geselecteerde optie toe als type, met een standaardwaarde
  }
  setMassiveActions([...massiveActions, newAction])
  setResult(group.title)
}

