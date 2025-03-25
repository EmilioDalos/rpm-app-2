"use client";

import { useState } from "react";
import { CategoryCard } from "./category-card";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { CategoryDialog } from "./category-dialog";
import { Category } from "@/types";

interface CategoryGridProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  onUpdateCategory: (category: Category) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function CategoryList({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }: CategoryGridProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"all" | "personal" | "professional">("all");

  const filteredCategories = categories.filter(
    (category) => selectedType === "all" || category.type === selectedType
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Life Categories</h2>
              <p className="text-gray-500">Manage and organize your life categories</p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
        
        <div className="p-6 md:p-8 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Filter by type:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
              className={`rounded-full px-6 ${
                selectedType === "all" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
              }`}
            >
              All Categories
            </Button>
            <Button
              variant={selectedType === "personal" ? "default" : "outline"}
              onClick={() => setSelectedType("personal")}
              className={`rounded-full px-6 ${
                selectedType === "personal" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
              }`}
            >
              Personal
            </Button>
            <Button
              variant={selectedType === "professional" ? "default" : "outline"}
              onClick={() => setSelectedType("professional")}
              className={`rounded-full px-6 ${
                selectedType === "professional" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
              }`}
            >
              Professional
            </Button>
          </div>
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">No categories found</h3>
            <p className="text-gray-500 mb-8">
              {selectedType === "all" 
                ? "You haven't created any categories yet. Start by creating your first category to organize your life better." 
                : `You haven't created any ${selectedType} categories yet. Add one to better organize your ${selectedType} life.`}
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-2"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Category
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onUpdate={onUpdateCategory}
              onDelete={onDeleteCategory}
            />
          ))}
        </div>
      )}

      <CategoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={onAddCategory}
      />
    </div>
  );
}