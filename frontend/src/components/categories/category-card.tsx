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
  onUpdate: (category: Category) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoryCard({ category, onUpdate, onDelete }: CategoryCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
      <Card
        className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200/50 h-full flex flex-col bg-white/50 backdrop-blur-sm hover:bg-white"
        onClick={() => setIsEditDialogOpen(true)}
      >
        <CardHeader className="pb-4 pt-6 px-6">
          <div className="w-full text-center relative">
            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-muted-foreground capitalize mt-1 text-gray-500">
              {category.type}
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-4 flex flex-col items-center justify-center flex-grow">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-100 shadow-md mb-6 group-hover:border-blue-100 transition-colors">
            <img 
              src={category.imageBlob || '/images/placeholder.svg'} 
              alt={category.name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <p className="text-sm text-center text-gray-600 mt-2 line-clamp-3 px-4">
            {category.description || "No description available"}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 p-6 bg-gradient-to-b from-transparent to-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 w-full justify-center">
            {category.roles?.length > 0 ? (
              category.roles.map((role) => (
                <Badge 
                  key={role.id} 
                  variant="secondary" 
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {role.name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">No roles assigned</span>
            )}
          </div>
          <div className="flex justify-end w-full pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(event) => event.stopPropagation()}
                  className="rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this category? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(category.id)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full"
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
