import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Index from "./pages/Index";
import ProfilePage from "./pages/Profile";
import PatternDetectionPage from "./components/PatternDetectionPage";
import NotFound from "./pages/NotFound";
import SelfServeHelpPage from "./pages/SelfServeHelp";
import SelfServeStatsPage from "./pages/SelfServeStats";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/pattern-detection" element={<PatternDetectionPage />} />
            <Route path="/self-serve-help" element={<SelfServeHelpPage />} />
            <Route path="/self-serve-stats" element={<SelfServeStatsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
