import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import SecondVideo from "./pages/SecondVideo";
import NotFound from "./pages/NotFound";
import InstagramWarning from "./pages/InstagramWarning";

const queryClient = new QueryClient();

const App = () => {
  const location = useLocation();
  const isFromInstagram = new URLSearchParams(location.search).get('fromInstagram') === 'true';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isFromInstagram ? <InstagramWarning /> : <Index />} />
            <Route path="/secondo-video" element={<SecondVideo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
