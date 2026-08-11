import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import ItemDetailPage from "./pages/ItemDetailPage";
import AboutUs from "./pages/AboutUs";
import BrandStory from "./pages/BrandStory";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index page="home" />} />
            <Route path="/portfolio" element={<Index page="portfolio" />} />
            <Route path="/portfolio/:slug" element={<ItemDetailPage section="portfolio" />} />
            <Route path="/construction" element={<Index page="construction" />} />
            <Route path="/construction/:slug" element={<ItemDetailPage section="construction" />} />
            <Route path="/rentals" element={<Index page="rentals" />} />
            <Route path="/rentals/:slug" element={<ItemDetailPage section="rentals" />} />
            <Route path="/hospitality" element={<Index page="hospitality" />} />
            <Route path="/hospitality/:slug" element={<ItemDetailPage section="hospitality" />} />
            <Route path="/contact" element={<Index page="contact" />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/our-brand-story" element={<BrandStory />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            
            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
