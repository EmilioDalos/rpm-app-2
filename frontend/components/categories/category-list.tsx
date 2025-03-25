"use client";

import { useState } from "react";
import { CategoryCard } from "./category-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryDialog } from "./category-dialog";
import { Category } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface CategoryGridProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  onUpdateCategory: (category: Category) => Promise<void>;
  onDeleteCategory: (id: string) => void;
}

export function CategoryList({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }: CategoryGridProps) {
 
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"all" | "personal" | "professional">("all");

  const filteredCategories = categories.filter(
    (category) => selectedType === "all" || category.type === selectedType
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold">Life Categories</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
  <ToggleGroup
    type="single"
    value={selectedType}
    onValueChange={(value) => setSelectedType(value as typeof selectedType)}
    className="justify-start"
  >
    <ToggleGroupItem
      value="personal"
      aria-label="Show personal categories"
      className="bg-white p-2 rounded-md border border-gray-300 hover:bg-gray-100 w-32 text-center"
    >
      Personal
    </ToggleGroupItem>
    <ToggleGroupItem
      value="professional"
      aria-label="Show professional categories"
      className="bg-white p-2 rounded-md border border-gray-300 hover:bg-gray-100 w-32 text-center"
    >
      Professional
    </ToggleGroupItem>
  </ToggleGroup>
</div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onUpdate={onUpdateCategory}
            onDelete={onDeleteCategory}
          />
        ))}
        <Button
          variant="outline"
          className="h-[300px] border-dashed flex flex-col gap-4 hover:border-primary"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-8 w-8" />
          <span className="text-lg font-medium">Add New Category</span>
        </Button>
      </div>

      <CategoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={onAddCategory}
      />
    </div>
  );
}