"use client";

import { useState } from "react";
import { CategoryCard } from "./category-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryDialog } from "./category-dialog";
import { Category } from "@/types";
import { initialCategories } from "@/lib/initial-data";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"all" | "personal" | "professional">("all");

  const handleAddCategory = (newCategory: Category) => {
    setCategories([...categories, newCategory]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories(
      categories.map((cat) =>
        cat.id === updatedCategory.id ? updatedCategory : cat
      )
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter((cat) => cat.id !== categoryId));
  };

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
           
            <ToggleGroupItem value="personal" aria-label="Show personal categories">
              Personal
            </ToggleGroupItem>
            <ToggleGroupItem value="professional" aria-label="Show professional categories">
              Professional
            </ToggleGroupItem>
          </ToggleGroup>
         
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
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
        onSave={handleAddCategory}
      />
    </div>
  );
}