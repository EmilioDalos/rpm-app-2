import React from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryBarProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ categories, activeCategory, onCategoryClick }) => {
  return (
    <ScrollArea className="w-16 h-full border-r">
      <div className="py-4 flex flex-col items-center space-y-4">
        <TooltipProvider>
          {categories.map((category) => (
            <Tooltip key={category.id}>
              <TooltipTrigger asChild>
                <button
                  className={`w-10 h-10 rounded-full ${category.color} ${
                    activeCategory === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onCategoryClick(category.id)}
                >
                  <span className="sr-only">{category.name}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{category.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </ScrollArea>
  )
}

