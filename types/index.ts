export interface Category {
  id: string;
  name: string;
  type: "personal" | "professional";
  description: string;
  roles: Role[];
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
  reflection: string;
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