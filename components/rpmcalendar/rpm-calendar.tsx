'use client'

import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { CalendarDay } from './calendar-day'
import { ActionPopup } from './action-popup'
import { ActionItem } from './action-item'
import { CategoryBar } from './category-bar'
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type Category = {
  id: string;
  name: string;
  color: string;
  projects: RpmBlock[];
};

export type RpmBlock = {
  id: string;
  result: string;
  purposes: string[];
  massiveActions: MassiveAction[];
  type: "time" | "project" | "day" | "week" | "month" | "quater";
  createdAt: Date;
  updatedAt: Date;
  saved: boolean;
};

export type MassiveAction = {
  id: string;
  text: string;
  leverage: string;
  durationAmount: number;
  durationUnit: 'min' | 'hr' | 'd' | 'wk' | 'mo';
  priority: number;
  key: '✘' | '✔' | 'O' | '➜';
  notes?: string;
  color: string;
  missedDate?: Date;
};

const categoryColors = [
  'bg-red-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-purple-200',
  'bg-pink-200',
  'bg-indigo-200',
  'bg-orange-200',
];

const RpmCalendar: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date())
  const [actionAssignments, setActionAssignments] = useState<{[key: string]: MassiveAction[]}>({})
  const [currentDate] = useState<Date>(new Date())
  const [selectedAction, setSelectedAction] = useState<MassiveAction | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Persoonlijke ontwikkeling',
      color: categoryColors[0],
      projects: [
        {
          id: '1',
          result: 'Verbeter productiviteit',
          purposes: ['Meer tijd voor familie', 'Verhoog werkplezier'],
          massiveActions: [
            { id: '1', text: 'Implementeer time-blocking', leverage: 'High', durationAmount: 2, durationUnit: 'hr', priority: 1, key: '➜', color: categoryColors[0] },
            { id: '2', text: 'Leer snellezen', leverage: 'Medium', durationAmount: 30, durationUnit: 'min', priority: 2, key: 'O', color: categoryColors[0] },
          ],
          type: 'month',
          createdAt: new Date(),
          updatedAt: new Date(),
          saved: true,
        },
      ],
    },
    {
      id: '2',
      name: 'Gezondheid',
      color: categoryColors[1],
      projects: [
        {
          id: '2',
          result: 'Verbeter gezondheid',
          purposes: ['Meer energie', 'Betere concentratie'],
          massiveActions: [
            { id: '3', text: 'Dagelijks 30 minuten bewegen', leverage: 'High', durationAmount: 30, durationUnit: 'min', priority: 1, key: '➜', color: categoryColors[1] },
            { id: '4', text: 'Gezond ontbijt voorbereiden', leverage: 'Medium', durationAmount: 15, durationUnit: 'min', priority: 2, key: 'O', color: categoryColors[1] },
          ],
          type: 'week',
          createdAt: new Date(),
          updatedAt: new Date(),
          saved: true,
        },
      ],
    },
  ])

  useEffect(() => {
    moveUncompletedTasksToTaskList();
  }, [date]);

  const moveUncompletedTasksToTaskList = () => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const updatedAssignments = { ...actionAssignments };
    const updatedCategories = [...categories];

    Object.entries(updatedAssignments).forEach(([dateKey, actions]) => {
      const [year, month, day] = dateKey.split('-').map(Number);
      const actionDate = new Date(year, month - 1, day);

      if (actionDate < today) {
        actions.forEach(action => {
          if (action.key !== '✔') {
            // Move uncompleted action back to task list
            for (const category of updatedCategories) {
              for (const project of category.projects) {
                const actionIndex = project.massiveActions.findIndex(a => a.id === action.id);
                if (actionIndex !== -1) {
                  const updatedAction = { ...action, missedDate: actionDate };
                  project.massiveActions.push(updatedAction);
                  break;
                }
              }
            }
          }
        });
        // Remove all actions from past days
        delete updatedAssignments[dateKey];
      }
    });

    setActionAssignments(updatedAssignments);
    setCategories(updatedCategories);
  };

  const handleDrop = (item: MassiveAction, dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const dropDate = new Date(year, month - 1, day);
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    if (dropDate >= today) {
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
      setCategories(prev => prev.map(category => ({
        ...category,
        projects: category.projects.map(project => ({
          ...project,
          massiveActions: project.massiveActions.filter(action => action.id !== item.id)
        }))
      })))
    }
  }

  const isActionPlanned = (actionId: string) => {
    return Object.values(actionAssignments).some(
      actions => actions.some(action => action.id === actionId)
    );
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getCurrentMonthYear = () => {
    const months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
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

    setCategories(prev => prev.map(category => ({
      ...category,
      projects: category.projects.map(project => ({
        ...project,
        massiveActions: project.massiveActions.map(action => 
          action.id === updatedAction.id ? updatedAction : action
        )
      }))
    })));
  };

  const renderCalendar = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarDays = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-32 border rounded-md p-1 bg-muted"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month + 1}-${day}`;
      const isCurrentDay = day === currentDate.getDate() && 
                           month === currentDate.getMonth() && 
                           year === currentDate.getFullYear();
      calendarDays.push(
        <CalendarDay 
          key={dateKey} 
          day={day}
          month={month}
          year={year}
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

  const handlePreviousMonth = () => {
    setDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
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
            {categories.map((category) => (
              <div key={category.id} className={`mb-6 ${activeCategory === category.id || activeCategory === null ? '' : 'hidden'}`}>
                <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                {category.projects.map((project) => (
                  <Card key={project.id} className={`mb-4 ${category.color}`}>
                    <CardHeader>
                      <CardTitle>{project.result}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="purposes">
                          <AccordionTrigger>Doelen</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-4">
                              {project.purposes.map((purpose, index) => (
                                <li key={`purpose-${project.id}-${index}`}>{purpose}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="actions">
                          <AccordionTrigger>Acties</AccordionTrigger>
                          <AccordionContent>
                            {project.massiveActions.map((action) => (
                              <ActionItem
                                key={action.id}
                                action={action}
                                onClick={() => handleActionClick(action)}
                                isPlanned={isActionPlanned(action.id)}
                              />
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </ScrollArea>
        </div>
        <div className="w-3/4 p-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <Button onClick={handlePreviousMonth} variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">{getCurrentMonthYear()}</h2>
            <Button onClick={handleNextMonth} variant="outline" size="icon">
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

