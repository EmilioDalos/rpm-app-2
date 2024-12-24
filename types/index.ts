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
  results: string[];
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
export interface RpmBlock {
  id: string;
  result: string;
  purposes: string[];
  massiveActions: MassiveAction[];
  category: string;
  type: string;
  createdAt?: Date;
  updatedAt?: Date;
  saved?: boolean;
}

// Type for an individual massive action
export interface MassiveAction {
  id: string;
  text: string;
  leverage: string;
  durationAmount: number;
  durationUnit: string;
  priority: number;
  notes : string;
  key: string;
  color? :string;
  missedDate?: Date;
}

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // ISO 8601 formatted date
  actions: Array<{
    id: string; // MassiveAction ID
    text: string; // Beschrijving van de actie
    color?: string; // Optioneel: kleur voor weergave in de kalender
  }>;
  categoryId?: string; // Optioneel: koppeling met categorie
  notes?: Note[]; // Notities bij de dag
  createdAt?: Date;
  updatedAt?: Date;
}



