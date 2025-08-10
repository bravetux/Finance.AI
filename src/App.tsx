import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Cashflow from "./pages/Cashflow";
import NetWorthCalculator from "./pages/NetWorthCalculator";
import FutureValueCalculator from "./pages/FutureValueCalculator";
import Goals from "./pages/Goals";
import RetirementDashboard from "./pages/RetirementDashboard";
import Portfolio from "./pages/Portfolio";
import ProjectedCashflow from "./pages/ProjectedCashflow";
import AIPrompt from "./pages/AIPrompt";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import FireCalculator from "./pages/FireCalculator";
import ExpenseTracker from "./pages/ExpenseTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="cashflow" element={<Cashflow />} />
              <Route path="expense-tracker" element={<ExpenseTracker />} />
              <Route path="projected-cashflow" element={<ProjectedCashflow />} />
              <Route path="net-worth" element={<NetWorthCalculator />} />
              <Route path="future-value" element={<FutureValueCalculator />} />
              <Route path="goals" element={<Goals />} />
              <Route path="retirement" element={<RetirementDashboard />} />
              <Route path="fire-calculator" element={<FireCalculator />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="reports" element={<Reports />} />
              <Route path="ai-prompt" element={<AIPrompt />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;