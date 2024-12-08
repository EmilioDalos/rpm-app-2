'use client'

import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import CalendarDay from './calendar-day'
import ActionPopup from './action-popup'
import ActionItem from './action-item'
import CategoryBar from './category-bar'
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface Category {
  id: string;
  name: string;
  type: "personal" | "professional";
  description: string;
  vision: string;
  purpose: string;
  roles: Role[];
  threeToThrive: string[];
  resources: string;
  results: string[];
  actionPlans: string[];
  imageBlob: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  categoryId: string;
  name: string;
  purpose: string;
  description: string;
  coreQualities: string[];
  identityStatement: string;
  incantations: string[];
  imageBlob: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RpmBlock {
  id: string;
  result: string;
  purposes: string[];
  massiveActions: MassiveAction[];
  category: string;
  type: "time" | "project" | "day" | "week" | "month" | "quater";
  createdAt: Date;
  updatedAt: Date;
  saved: boolean;
}

export interface MassiveAction {
  id: string;
  text: string;
  leverage: string;
  durationAmount: number;
  durationUnit: 'min' | 'hr' | 'd' | 'wk' | 'mo';
  priority: number;
  key: '✘' | '✔' | 'O' | '➜';
}

const RpmCalendar: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rpmBlocks, setRpmBlocks] = useState<RpmBlock[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  });
  const [actionAssignments, setActionAssignments] = useState<{[key: string]: MassiveAction[]}>({});
  const [selectedAction, setSelectedAction] = useState<MassiveAction | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchRpmBlocks();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Received data is not an array');
      }
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Optionally, you can set an error state here to display to the user
      // setError('Failed to fetch categories. Please try again later.');
    }
  };

  const fetchRpmBlocks = async () => {
    try {
      const response = await fetch('/api/rpmblocks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Received data is not an array');
      }
      setRpmBlocks(data);
    } catch (error) {
      console.error('Error fetching RPM blocks:', error);
      // Optionally, you can set an error state here to display to the user
      // setError('Failed to fetch RPM blocks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRpmBlock = async (updatedBlock: RpmBlock) => {
    try {
      const response = await fetch(`/api/rpmblocks/${updatedBlock.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBlock),
      });
      if (!response.ok) {
        throw new Error('Failed to update RPM block');
      }
      const updatedData: RpmBlock = await response.json();
      setRpmBlocks(prevBlocks => 
        prevBlocks.map(block => block.id === updatedData.id ? updatedData : block)
      );
    } catch (error) {
      console.error('Error updating RPM block:', error);
    }
  };

  useEffect(() => {
    moveUncompletedTasksToTaskList();
  }, [currentWeekStart]);

  const moveUncompletedTasksToTaskList = () => {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const updatedAssignments = { ...actionAssignments };
    const updatedRpmBlocks = [...rpmBlocks];

    Object.entries(updatedAssignments).forEach(([dateKey, actions]) => {
      const [year, month, day] = dateKey.split('-').map(Number);
      const actionDate = new Date(year, month - 1, day);

      if (actionDate < todayDate) {
        actions.forEach(action => {
          if (action.key !== '✔') {
            // Move uncompleted action back to task list
            for (const block of updatedRpmBlocks) {
              const actionIndex = block.massiveActions.findIndex(a => a.id === action.id);
              if (actionIndex !== -1) {
                const updatedAction = { ...action, key: '✘' as const };
                block.massiveActions.push(updatedAction);
                break;
              }
            }
          }
        });
        // Remove all actions from past days
        delete updatedAssignments[dateKey];
      }
    });

    setActionAssignments(updatedAssignments);
    setRpmBlocks(updatedRpmBlocks);
  };

  const handleDrop = (item: MassiveAction, dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const dropDate = new Date(year, month - 1, day);
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (dropDate >= todayDate) {
      setActionAssignments(prev => {
        const updatedAssignments = { ...prev }
        if (!updatedAssignments[dateKey]) {
          updatedAssignments[dateKey] = []
        }
        if (!updatedAssignments[dateKey].some(action => action.id === item.id)) {
          updatedAssignments[dateKey] = [...updatedAssignments[dateKey], item]
        }
        return updatedAssignments
      })

      // Remove the action from the RPM block
      setRpmBlocks(prev => prev.map(block => ({
        ...block,
        massiveActions: block.massiveActions.filter(action => action.id !== item.id)
      })));
    }
  }

  const isActionPlanned = (actionId: string) => {
    return Object.values(actionAssignments).some(
      actions => actions.some(action => action.id === actionId)
    );
  };

  const handleActionClick = (action: MassiveAction) => {
    setSelectedAction(action);
    setIsPopupOpen(true);
  };

  const handleActionUpdate = (updatedAction: MassiveAction) => {
    setActionAssignments(prev => {
      const updatedAssignments = { ...prev };
      Object.keys(updatedAssignments).forEach(dateKey => {
        updatedAssignments[dateKey] = updatedAssignments[dateKey].map(action => 
          action.id === updatedAction.id ? updatedAction : action
        );
      });
      return updatedAssignments;
    });

    setRpmBlocks(prev => prev.map(block => ({
      ...block,
      massiveActions: block.massiveActions.map(action => 
        action.id === updatedAction.id ? updatedAction : action
      )
    })));

    // Update the RPM block on the server
    const updatedBlock = rpmBlocks.find(block => 
      block.massiveActions.some(action => action.id === updatedAction.id)
    );
    if (updatedBlock) {
      updateRpmBlock(updatedBlock);
    }
  };

  const renderCalendar = () => {
    const calendarDays = [];
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let i = 0; i < 28; i++) {
      const currentDate = new Date(currentWeekStart);
      currentDate.setDate(currentWeekStart.getDate() + i);
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
      const isCurrentDay = currentDate.toDateString() === todayDate.toDateString();

      calendarDays.push(
        <CalendarDay 
          key={dateKey} 
          day={currentDate.getDate()}
          month={currentDate.getMonth()}
          year={currentDate.getFullYear()}
          actions={actionAssignments[dateKey] || []}
          dateKey={dateKey}
          isCurrentDay={isCurrentDay}
          onActionClick={handleActionClick}
          onDrop={handleDrop}
        />
      );
    }

    return calendarDays;
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const getCurrentWeekRange = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(currentWeekStart.getDate() + 27);
    
    // Use a specific locale and format options to ensure consistency
    const dateFormatOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric'
    };
    
    return `${currentWeekStart.toLocaleDateString('en-GB', dateFormatOptions)} - ${endOfWeek.toLocaleDateString('en-GB', dateFormatOptions)}`;
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(prevActiveCategory => 
      prevActiveCategory === categoryId ? null : categoryId
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen">
        <CategoryBar 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />
        <div className="w-1/4 p-4 border-r">
          <ScrollArea className="h-[calc(100vh-2rem)]">
            <h2 className="text-2xl font-bold mb-4">RPM Plannen</h2>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              (rpmBlocks || []).map((block) => (
                <div key={block.id} className={`mb-6 ${activeCategory === block.category || activeCategory === null ? '' : 'hidden'}`}>
                  <Card className={`mb-4`}>
                    <CardHeader>
                      <CardTitle>{block.result}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="purposes">
                          <AccordionTrigger>Doelen</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-4">
                              {block.purposes?.map((purpose, index) => (
                                <li key={`purpose-${block.id}-${index}`}>{purpose}</li>
                              )) || []}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="actions">
                          <AccordionTrigger>Acties</AccordionTrigger>
                          <AccordionContent>
                            {block.massiveActions?.map((action) => (
                              <ActionItem
                                key={action.id}
                                action={action}
                                onClick={() => handleActionClick(action)}
                                isPlanned={isActionPlanned(action.id)}
                              />
                            )) || []}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </ScrollArea>
        </div>
        <div className="w-3/4 p-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <Button onClick={handlePreviousWeek} variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">{getCurrentWeekRange()}</h2>
            <Button onClick={handleNextWeek} variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 min-w-[800px]">
            {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map((day, index) => (
              <div key={`weekday-${index}`} className="text-center font-bold">{day}</div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      </div>
      {selectedAction && (
        <ActionPopup
          action={selectedAction}
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onUpdate={handleActionUpdate}
        />
      )}
    </DndProvider>
  )
}

export default RpmCalendar

