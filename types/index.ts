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