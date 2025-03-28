"use client";

import { useState, useEffect } from "react";
import { CategoryList } from "@/components/categories/category-list";
import { Category } from "@/types";
import { Header } from "@/components/layout/header";

// Fallback API URL if environment variable is not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log('Fetching categories from:', `${API_URL}/api/categories`);
        const response = await fetch(`${API_URL}/api/categories`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Received categories:', data);
          setCategories(data);
          setError(null);
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch categories:', errorData);
          setError(errorData.error || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to connect to the server');
      }
    }

    fetchCategories();
  }, []);

  const handleAddCategory = async (newCategory: Omit<Category, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      if (response.ok) {
        const addedCategory = await response.json();
        setCategories((prevCategories) => [...prevCategories, addedCategory]);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to add category:', errorData);
        setError(errorData.error || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to connect to the server');
    }
  };

  const handleUpdateCategory = async (updatedCategory: Category) => {
    try {
      const response = await fetch(`${API_URL}/api/categories/${updatedCategory.id}`, {
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
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to update category:', errorData);
        setError(errorData.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to connect to the server');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== id));
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to delete category:', errorData);
        setError(errorData.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to connect to the server');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
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
