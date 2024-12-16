import React from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Category } from '@/types';
import Link from 'next/link'

interface CategoryBarProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ categories, activeCategory, onCategoryClick }) => {
  return (
    <ScrollArea className="w-16 h-full border-r">
      <div className="py-4 flex flex-col items-center space-y-4">
        <TooltipProvider>
          {categories.map((category) => (
            <Tooltip key={category.id}>
              <TooltipTrigger asChild>
                <button
                  className={`w-10 h-10 rounded-full ${
                    activeCategory === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onCategoryClick(category.id)}
                  style={{ backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}` }}
                >
                  <span className="sr-only">{category.name}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{category.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/categories" className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl">+</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>New Category</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </ScrollArea>
  )
}

export default CategoryBar

