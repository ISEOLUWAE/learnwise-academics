import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnlineStatusWrapper } from "@/components/layout/OnlineStatusWrapper";
import Index from "./pages/Index";
import About from "./pages/About";
import Courses from "./pages/Courses";
import News from "./pages/News";
import Scholarships from "./pages/Scholarships";
import CourseDetail from "./pages/CourseDetail";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Friends from "./pages/Friends";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OnlineStatusWrapper>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/news" element={<News />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/course/:courseCode" element={<CourseDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/friends" element={<Friends />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </OnlineStatusWrapper>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
