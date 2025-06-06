
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import Index from "./pages/Index";
import SecondVideo from "./pages/SecondVideo";
import NotFound from "./pages/NotFound";
import InstagramLandingPage from "./components/InstagramLandingPage";

const queryClient = new QueryClient();

const App = () => {
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Check if we should show the landing page
    const userAgent = navigator.userAgent.toLowerCase();
    const isInstagram = userAgent.includes('instagram');
    
    if (!isInstagram) {
      setShowLanding(false);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {showLanding ? (
            <InstagramLandingPage onClose={() => setShowLanding(false)} />
          ) : (
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/secondo-video" element={<SecondVideo />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

