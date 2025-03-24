"use client";

import { CategoryList } from "@/components/categories/category-list";
import { Header } from "@/components/layout/header";
import { useEffect } from "react";
import { useState } from 'react';
import { Category } from "@/types";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories when component mounts
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

  // Handlers for category operations
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
        console.error('Failed to add category'); // ConsoleError
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async (updatedCategory: Category) => {
    console.log('Updating category with ID:', updatedCategory.id);
    console.log('Updated imageBlob:', updatedCategory.imageBlob); // Log imageBlob
  
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
        console.log('Updated category data:', updatedData); // Log response
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
    setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== id));
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