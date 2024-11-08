import { useState } from "react";
import { RoleCard } from "./roles-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RoleDialog } from "./roles-dialog";
import { Role } from "@/types";

interface RoleGridProps {
  roles: Role[];
  onAddRole: (role: Omit<Role, 'id'>) => void;
  onUpdateRole: (role: Role) => void;
  onDeleteRole: (id: string) => void;
}

export function RoleList({ roles, onAddRole, onUpdateRole, onDeleteRole }: RoleGridProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Life Roles</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {roles.map((role) => (
          <RoleCard
            key={`${role.id}-${role.updatedAt}`} // Unieke key met updatedAt
            role={role}
            onUpdate={onUpdateRole} // Callback voor bijwerken van specifieke rol
            onDelete={onDeleteRole} // Callback voor verwijderen van rol
          />
        ))}
        
        {/* Add New Role Button */}
        <Button
          variant="outline"
          className="h-[300px] border-dashed flex flex-col gap-4 hover:border-primary"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-8 w-8" />
          <span className="text-lg font-medium">Add New Role</span>
        </Button>
      </div>

      {/* Dialoog voor het toevoegen van een nieuwe rol */}
      <RoleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={onAddRole}
      />
    </div>
  );
}
