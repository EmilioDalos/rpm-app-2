import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Role } from "@/types";
import { Edit2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RoleDialog } from "./roles-dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

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
          <div className="w-full text-center">
            <h3 className="text-2xl font-semibold uppercase">{role.name}</h3>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex flex-col items-center justify-center h-40">
          <img
            src={role.imageBlob || '/images/placeholder.svg'}
            alt={role.name}
            className="w-32 h-32 mb-2 rounded-full border border-gray-300"
          />
          
        </CardContent>
        <CardFooter>
          <div className="flex justify-end w-full">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => event.stopPropagation()} // Prevent opening the edit dialog
                  className="bg-gray-200 p-2 rounded" // Gray background, padding, and rounded corners for box effect
                >
                  <Trash2 className="h-4 w-4 text-gray-600" /> {/* Gray icon color */}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Role</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this role? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(role.id)}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>

      <RoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={onUpdate}
        role={role}
      />
    </>
  );
}
