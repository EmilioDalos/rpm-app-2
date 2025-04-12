import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

export const useUnsavedChanges = (initialState = false) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(initialState);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const isInitialMount = useRef(true);

  // Check if current path is one of the protected routes
  const isProtectedRoute = useCallback(() => {
    return pathname === "/capturelist" || 
           pathname === "/rpmcalendar" || 
           pathname.startsWith("/action-plan");
  }, [pathname]);

  // Add event listener for beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isProtectedRoute()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isProtectedRoute]);

  // Listen for navigation events
  useEffect(() => {
    const handleNavigation = (e: PopStateEvent) => {
      if (hasUnsavedChanges && isProtectedRoute()) {
        const confirmLeave = window.confirm('Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je deze pagina wilt verlaten?');
        if (!confirmLeave) {
          // Prevent navigation
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [hasUnsavedChanges, isProtectedRoute]);

  // Add event listener for navigation within the app
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && hasUnsavedChanges && isProtectedRoute()) {
        const href = link.getAttribute('href');
        
        // Check if navigating to a protected route
        if (href && (
          href === '/capturelist' || 
          href === '/rpmcalendar' || 
          href.startsWith('/action-plan')
        )) {
          const confirmLeave = window.confirm('Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je deze pagina wilt verlaten?');
          if (!confirmLeave) {
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [hasUnsavedChanges, isProtectedRoute]);

  // Listen for custom events from other components
  useEffect(() => {
    const handleUnsavedChangesUpdate = (event: CustomEvent) => {
      // Only update if the event is from a protected route
      if (isProtectedRoute()) {
        setHasUnsavedChanges(event.detail.hasUnsavedChanges);
      }
    };

    window.addEventListener('unsavedChangesUpdated', handleUnsavedChangesUpdate as EventListener);
    return () => window.removeEventListener('unsavedChangesUpdated', handleUnsavedChangesUpdate as EventListener);
  }, [isProtectedRoute]);

  // Listen for RPM blocks updates
  useEffect(() => {
    const handleRpmBlocksUpdate = (event: CustomEvent) => {
      // Only update if the event is from a protected route
      if (isProtectedRoute()) {
        setHasUnsavedChanges(event.detail.hasUnsavedChanges);
      }
    };

    window.addEventListener('rpmBlocksUpdated', handleRpmBlocksUpdate as EventListener);
    return () => window.removeEventListener('rpmBlocksUpdated', handleRpmBlocksUpdate as EventListener);
  }, [isProtectedRoute]);

  // Reset hasUnsavedChanges when pathname changes
  useEffect(() => {
    if (!isInitialMount.current && pathname !== prevPathnameRef.current) {
      // Only reset if we're not on a protected route
      if (!isProtectedRoute()) {
        setHasUnsavedChanges(false);
      }
      prevPathnameRef.current = pathname;
    } else {
      isInitialMount.current = false;
    }
  }, [pathname, isProtectedRoute]);

  // Safe setter function to prevent unnecessary updates
  const safeSetHasUnsavedChanges = useCallback((value: boolean) => {
    if (value !== hasUnsavedChanges) {
      setHasUnsavedChanges(value);
    }
  }, [hasUnsavedChanges]);

  return { hasUnsavedChanges, setHasUnsavedChanges: safeSetHasUnsavedChanges, isProtectedRoute };
}; 