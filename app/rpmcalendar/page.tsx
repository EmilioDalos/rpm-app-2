import RpmCalendar from '@/components/rpmcalendar/rpm-calendar'
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <RpmCalendar isDropDisabled={false} />
    </main>
  )
}
