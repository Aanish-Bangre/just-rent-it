"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState("");

  useEffect(() => {
    // Show loader when pathname changes
    if (previousPath && previousPath !== pathname) {
      setLoading(true);
      
      // Hide loader after a short delay (simulating page load)
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
    
    setPreviousPath(pathname);
  }, [pathname, previousPath]);

  // Intercept link clicks to show loader immediately
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href && !link.href.startsWith("mailto:") && !link.href.startsWith("tel:") && !link.target) {
        const url = new URL(link.href);
        // Only show loader for internal navigation
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setLoading(true);
        }
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, [pathname]);

  if (!loading) return null;

  return (
    <>
      {/* Loading Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999]">
        <div className="h-1 bg-black animate-[loading_1s_ease-in-out_infinite]" 
             style={{
               animation: "loading 1s ease-in-out infinite",
             }}
        />
      </div>

      {/* Full Screen Overlay with Spinner */}
      <div className="fixed inset-0 z-[9998] bg-white/60 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-black animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-900">Loading...</p>
        </div>
      </div>
    </>
  );
}
