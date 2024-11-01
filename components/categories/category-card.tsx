"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Category } from "@/types";
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
import { CategoryDialog } from "./category-dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface CategoryCardProps {
  category: Category;
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onUpdate, onDelete }: CategoryCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
            <div>
              <h3 className="text-2xl font-semibold">{category.name}</h3>
              
            </div>
            
        </CardHeader>
        <CardContent className="p-4 flex flex-col items-center justify-center h-40">
        <img src={category.imageBlob || '/images/placeholder.svg'} alt={category.name} className="w-16 h-16 mb-2 rounded-full"/>
            {category.roles?.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
          
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            {category.roles?.length} Role{category.roles?.length !== 1 && "s"}
          </p>
          <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this category? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(category.id)}
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

      <CategoryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={onUpdate}
        category={category}
      />
    </>
  );
}