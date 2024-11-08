import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Role } from "@/types";
import { Edit2, Trash2 } from "lucide-react";
import { RoleDialog } from "./roles-dialog";
import { useState } from "react";

interface RoleCardProps {
  role: Role;
  onUpdate: (role: Role) => void;
  onDelete: (id: string) => void;
}

export function RoleCard({ role, onUpdate, onDelete }: RoleCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setIsEditDialogOpen(true)}
      >
        <CardHeader>
          <h3 className="text-2xl font-semibold uppercase text-center">{role.name}</h3>
        </CardHeader>
        <CardContent className="p-4 flex flex-col items-center justify-center h-40">
          <img
            src={role.imageBlob || '/images/placeholder.svg'}
            alt={role.name}
            className="w-32 h-32 mb-2 rounded-full border border-gray-300"
          />
        </CardContent>
        <CardFooter className="flex justify-end w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(role.id);
            }}
            className="bg-gray-200 p-2 rounded"
          >
            <Trash2 className="h-4 w-4 text-gray-600" />
          </Button>
        </CardFooter>
      </Card>

      {/* Dialoog voor het bewerken van een rol */}
      <RoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={(updatedRole) => {
          onUpdate(updatedRole); // Update de rol in de parent component
          setIsEditDialogOpen(false); // Sluit de dialoog na opslaan
        }}
        role={role}
      />
    </>
  );
}
