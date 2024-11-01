export interface Category {
  id: string;
  name: string;
  type: "personal" | "professional";
  description: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  categoryId: string;
  name: string;
  purpose: string;
  coreQualities: string[];
  identityStatement: string;
  reflection: string;
  imageUrl?: string;
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
  coreQualities: string[];
  identityStatement: string;
  reflection: string;
  imageUrl?: string;
}