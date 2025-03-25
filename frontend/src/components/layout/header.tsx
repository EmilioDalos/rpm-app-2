"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Calendar, List, FolderTree, Users, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                RPM Life
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="/" passHref>
              <Button 
                variant={isActive('/') ? "default" : "ghost"} 
                className={`flex items-center ${isActive('/') ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/capturelist" passHref>
              <Button 
                variant={isActive('/capturelist') ? "default" : "ghost"}
                className={`flex items-center ${isActive('/capturelist') ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <List className="h-4 w-4 mr-2" />
                Capture List
              </Button>
            </Link>
            <Link href="/rpmcalendar" passHref>
              <Button 
                variant={isActive('/rpmcalendar') ? "default" : "ghost"}
                className={`flex items-center ${isActive('/rpmcalendar') ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </Link>
            <Link href="/categories" passHref>
              <Button 
                variant={isActive('/categories') ? "default" : "ghost"}
                className={`flex items-center ${isActive('/categories') ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <FolderTree className="h-4 w-4 mr-2" />
                Categories
              </Button>
            </Link>
            <Link href="/roles" passHref>
              <Button 
                variant={isActive('/roles') ? "default" : "ghost"}
                className={`flex items-center ${isActive('/roles') ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <Users className="h-4 w-4 mr-2" />
                Roles
              </Button>
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="py-4">
                <Link href="/" className="flex items-center mb-6">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    RPM Life
                  </span>
                </Link>
              </div>
              <nav className="flex flex-col space-y-4">
                <Link href="/" passHref>
                  <Button 
                    variant={isActive('/') ? "default" : "ghost"} 
                    className={`flex items-center justify-start w-full ${isActive('/') ? 'bg-blue-50 text-blue-700' : ''}`}
                  >
                    <Home className="h-4 w-4 mr-3" />
                    Home
                  </Button>
                </Link>
                <Link href="/capturelist" passHref>
                  <Button 
                    variant={isActive('/capturelist') ? "default" : "ghost"}
                    className={`flex items-center justify-start w-full ${isActive('/capturelist') ? 'bg-blue-50 text-blue-700' : ''}`}
                  >
                    <List className="h-4 w-4 mr-3" />
                    Capture List
                  </Button>
                </Link>
                <Link href="/rpmcalendar" passHref>
                  <Button 
                    variant={isActive('/rpmcalendar') ? "default" : "ghost"}
                    className={`flex items-center justify-start w-full ${isActive('/rpmcalendar') ? 'bg-blue-50 text-blue-700' : ''}`}
                  >
                    <Calendar className="h-4 w-4 mr-3" />
                    Calendar
                  </Button>
                </Link>
                <Link href="/categories" passHref>
                  <Button 
                    variant={isActive('/categories') ? "default" : "ghost"}
                    className={`flex items-center justify-start w-full ${isActive('/categories') ? 'bg-blue-50 text-blue-700' : ''}`}
                  >
                    <FolderTree className="h-4 w-4 mr-3" />
                    Categories
                  </Button>
                </Link>
                <Link href="/roles" passHref>
                  <Button 
                    variant={isActive('/roles') ? "default" : "ghost"}
                    className={`flex items-center justify-start w-full ${isActive('/roles') ? 'bg-blue-50 text-blue-700' : ''}`}
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Roles
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
