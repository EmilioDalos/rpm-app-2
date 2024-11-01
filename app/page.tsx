"use client";

import { CategoryList } from "@/components/categories/category-list";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <CategoryList />
      </div>
    </main>
  );
}