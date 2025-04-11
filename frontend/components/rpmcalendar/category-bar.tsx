import React from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Category } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

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
                  className={`w-10 h-10 rounded-full overflow-hidden ${
                    activeCategory === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onCategoryClick(category.id)}
                  style={{ 
                    backgroundColor: !category.imageBlob ? (category.color || `#${Math.floor(Math.random()*16777215).toString(16)}`) : 'transparent' 
                  }}
                >
                  {category.imageBlob ? (
                    <div className="w-full h-full relative">
                      <Image 
                        src={category.imageBlob} 
                        alt={category.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <span className="sr-only">{category.name}</span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.type}</p>
                  {category.description && (
                    <p className="text-xs mt-1">{category.description}</p>
                  )}
                </div>
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
              <p>Nieuwe categorie</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </ScrollArea>
  )
}

export default CategoryBar

