'use client'

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Header } from "@/components/layout/header";
import RpmCalendar from '@/components/rpmcalendar/rpm-calendar';

export default function RpmCalendarPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <main className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <RpmCalendar isDropDisabled={false} />
        </div>
      </main>
    </DndProvider>
  );
}

