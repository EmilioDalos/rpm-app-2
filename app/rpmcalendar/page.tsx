import RpmCalendar from '@/components/rpmcalendar/rpm-calendar'

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <RpmCalendar isDropDisabled={false} />
    </main>
  )
}

