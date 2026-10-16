import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound.tsx";
const queryClient = new QueryClient();
const ProtectedRoute = ({ children }: {
    children: React.ReactNode;
}) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace/>;
};
const App = () => (<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Suspense fallback={<p role="status" className="p-8">Loading…</p>}><Routes>
            <Route path="/login" element={<Login />}/>
            <Route path="/" element={<Demo />}/>
            <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>}/>
            <Route path="*" element={<NotFound />}/>
          </Routes></Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>);
export default App;
