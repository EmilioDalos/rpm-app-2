'use client'

import Capturelist from './capturelist'
import { Header } from "@/components/layout/header";


export default function Page() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header/>
      <Capturelist />
    </main>
  )
}
