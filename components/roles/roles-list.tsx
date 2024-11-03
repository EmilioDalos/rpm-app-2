"use client";

import { useState } from "react";
import { RoleCard } from "./roles-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RoleDialog } from "./roles-dialog";
import { Role } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface RoleGridProps {
  roles: Role[];
  onAddRole: (role: Omit<Role, 'id'>) => void;
  onUpdateRole: (role: Role) => void;
  onDeleteRole: (id: string) => void;
}

export function RoleList({ roles, onAddRole, onUpdateRole, onDeleteRole }: RoleGridProps) {
 
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"all" | "personal" | "professional">("all");

  const filteredRoles = roles.filter(
    (role) => selectedType === "all" || (role as Role & { type: string }).type === selectedType
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold">Life Roles</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <ToggleGroup
            type="single"
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as typeof selectedType)}
            className="justify-start"
          >
            <ToggleGroupItem
              value="personal"
              aria-label="Show personal roles"
              className="bg-white p-2 rounded-md border border-gray-300 hover:bg-gray-100 w-32 text-center"
            >
              Personal
            </ToggleGroupItem>
            <ToggleGroupItem
              value="professional"
              aria-label="Show professional roles"
              className="bg-white p-2 rounded-md border border-gray-300 hover:bg-gray-100 w-32 text-center"
            >
              Professional
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRoles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            onUpdate={onUpdateRole}
            onDelete={onDeleteRole}
          />
        ))}
        <Button
          variant="outline"
          className="h-[300px] border-dashed flex flex-col gap-4 hover:border-primary"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-8 w-8" />
          <span className="text-lg font-medium">Add New Role</span>
        </Button>
      </div>

      <RoleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={onAddRole}
      />
    </div>
  );
}
