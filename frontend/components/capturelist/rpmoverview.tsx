'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, BookOpen } from 'lucide-react';
import { RpmBlock, CalendarEvent, MassiveAction } from '@/types';
import ActionPlanPanel from './action-plan-panel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Purpose {
  purpose: string;
}

export default function RpmOverview({ blocks }: { blocks: RpmBlock[] }) {
  const [visibleBlocks, setVisibleBlocks] = useState(8);
  const [storedBlocks, setStoredBlocks] = useState<RpmBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<RpmBlock | null>(null);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [categories, setCategories] = useState<Array<{id: string, name: string, roles?: any[]}>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);


  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories from API...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        console.log('Categories API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched categories data:', data);
        
        // Valideer de data structuur
        if (Array.isArray(data)) {
          // Data is al in het juiste formaat
          setCategories(data);
        } else if (data.categories && Array.isArray(data.categories)) {
          // Data zit in een categories property
          setCategories(data.categories);
        } else {
          console.error('Unexpected categories data format:', data);
          setCategories([]); // Fallback naar lege array
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Fallback naar lege array bij error
      }
    };

    fetchCategories();
  }, []);

  // Functie om te controleren of een actie is gepland in de kalender
  const isActionPlanned = (actionId: string): boolean => {
    return calendarEvents.some(event => 
      event.massiveActions && event.massiveActions.some(action => action.id === actionId)
    );
  };

  // Update actionKeys voor geplande acties
  const updateActionKeysForPlannedActions = (blocks: RpmBlock[]): RpmBlock[] => {
    return blocks.map(block => {
      if (!block.massiveActions || block.massiveActions.length === 0) {
        return block;
      }

      const updatedActions = block.massiveActions.map(action => {
        // Als de actie gepland is en nog niet is voltooid (niet ✔ of ✘), markeer het als 📅
        if (isActionPlanned(action.id) && action.key !== "✔" && action.key !== "✘") {
          return { ...action, key: "📅" };
        }
        return action;
      });

      return {
        ...block,
        massiveActions: updatedActions
      };
    });
  };

  useEffect(() => {
    const reloadCombinedBlocks = () => {
      try {
        // Haal lokale blocks op en valideer
        const localBlocks = localStorage.getItem('rpmBlocks');
        const localBlocksArray: RpmBlock[] = localBlocks ? JSON.parse(localBlocks) : [];
        const validLocalBlocks = Array.isArray(localBlocksArray) ? localBlocksArray : [];

        // Valideer server blocks
        const validServerBlocks = Array.isArray(blocks) ? blocks : [];

        // Combineer blocks met validatie
        const combinedBlocks = [
          ...validLocalBlocks,
          ...validServerBlocks.filter(
            (block) => !validLocalBlocks.some((localBlock) => localBlock.id === block.id)
          ),
        ];

        // Filter op categorie indien nodig
        const filteredBlocks = selectedCategory !== "all"
          ? combinedBlocks.filter(block => block.categoryId === selectedCategory)
          : combinedBlocks;

        // Update action keys op basis van kalender planning
        const updatedBlocks = updateActionKeysForPlannedActions(filteredBlocks);
        
        // Update state
        setStoredBlocks(updatedBlocks);
        
        // Update localStorage met originele data
        localStorage.setItem('rpmBlocks', JSON.stringify(combinedBlocks));
      } catch (error) {
        console.error('Error processing RPM blocks:', error);
        // Fallback naar lege array bij error
        setStoredBlocks([]);
      }
    };

    // Laad blocks bij mount en page refresh
    reloadCombinedBlocks();
    fetchRpmBlocks();

    // Event listener voor updates
    window.addEventListener('rpmBlocksUpdated', reloadCombinedBlocks);
    window.addEventListener('beforeunload', reloadCombinedBlocks);

    return () => {
      window.removeEventListener('rpmBlocksUpdated', reloadCombinedBlocks);
      window.removeEventListener('beforeunload', reloadCombinedBlocks);
    };
  }, [blocks, selectedCategory, calendarEvents]);

  const fetchRpmBlocks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rpmblocks`);
      if (!response.ok) {
        throw new Error('Failed to fetch RPM blocks');
      }
      const data = await response.json();
      setStoredBlocks(data);
    } catch (error) {
      console.error('Error fetching RPM blocks:', error);
    }
  };

  const handleDelete = async (id: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        const response = await fetch(`http://localhost:3001/api/rpmblocks/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Error deleting RPM Block: ${response.statusText}`);
        }
      }

      const updatedBlocks = storedBlocks.filter((block) => block.id !== id);
      setStoredBlocks(updatedBlocks);
      localStorage.setItem('rpmBlocks', JSON.stringify(updatedBlocks));
    } catch (error) {
      console.error(`Error deleting RPM Block with ID ${id}:`, error);
    }
  };

  const loadMore = () => {
    setVisibleBlocks((prevVisible) => Math.min(prevVisible + 8, storedBlocks.length));
  };

  const openActionPlan = (block: RpmBlock) => {
    setSelectedBlock(block);
    setShowActionPlan(true);
  };

  const closeActionPlan = () => {
    setSelectedBlock(null);
    setShowActionPlan(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">RPM List</h1>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-12 gap-2 mb-2 px-3 font-medium text-sm text-gray-600">
        <div className="col-span-4 truncate">Result</div>
        <div className="col-span-2 truncate">Type</div>
        <div className="col-span-2 truncate">Categorie</div>
        <div className="col-span-2 truncate">Datum</div>
        <div className="col-span-2 text-right">Acties</div>
      </div>

      <div className="space-y-2">
        {storedBlocks.slice(0, visibleBlocks).map((block, index) => {
          // Vind de categorie naam op basis van de categoryId
          const category = categories.find(cat => cat.id === block.categoryId);
          const categoryName = category ? category.name : "";
          
          return (
            <div
              key={block.id}
              className={`block p-3 rounded-lg transition-colors ${
                block.saved
                  ? index % 2 === 0
                    ? 'bg-gray-100 hover:bg-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4 truncate">{block.result}</div>
                <div className="col-span-2 truncate">{block.type}</div>
                <div className="col-span-2 truncate italic">{categoryName}</div>
                <div className="col-span-2 truncate">
                  {block.updatedAt ? new Date(block.updatedAt).toLocaleDateString('nl-NL') : '-'}
                </div>
                <div className="col-span-2 flex justify-end space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openActionPlan(block)}
                    title="Open RPM Block"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(block.id, !!block.saved)}
                    title="Delete RPM Block"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {storedBlocks.length > visibleBlocks && (
        <Button onClick={loadMore} variant="outline" className="w-full mt-4">
          Load More
        </Button>
      )}

      {showActionPlan && selectedBlock && (
        <ActionPlanPanel selectedBlock={selectedBlock} onClose={closeActionPlan} />
      )}
    </div>
  );
}