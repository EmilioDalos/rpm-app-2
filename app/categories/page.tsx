"use client";

import { useState, useEffect } from "react";
import { CategoryList } from "@/components/categories/category-list";
import { Category } from "@/types";
import { Header } from "@/components/layout/header";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }

    fetchCategories();
  }, []);

  const handleAddCategory = async (newCategory: Omit<Category, 'id'>) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      if (response.ok) {
        const addedCategory = await response.json();
        setCategories((prevCategories) => [...prevCategories, addedCategory]);
      } else {
        console.error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async (updatedCategory: Category) => {
    try {
      const response = await fetch(`/api/categories/${updatedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.id === updatedData.id ? updatedData : cat
          )
        );
      } else {
        console.error('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== id));
      } else {
        console.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <CategoryList
          categories={categories}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </div>
    </main>
  );
}
