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
import ProjectedCashflow from "./pages/ProjectedCashflow";
import AIPrompt from "./pages/AIPrompt";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import FireCalculator from "./pages/FireCalculator";
import ExpenseReductionPlanner from "./pages/ExpenseReductionPlanner";
import RealEstate from "./pages/RealEstate";
import DomesticEquity from "./pages/DomesticEquity";
import USEquity from "./pages/USEquity";
import Debt from "./pages/Debt";
import Gold from "./pages/Gold";
import MutualFundAllocation from "./pages/MutualFundAllocation";
import MutualFundSIP from "./pages/MutualFundSIP";
import CashflowSummary from "./pages/CashflowSummary";
import Silver from "./pages/Silver";
import Platinum from "./pages/Platinum";
import Diamond from "./pages/Diamond";
import PreciousMetalsSummary from "./pages/PreciousMetalsSummary";
import SmallCase from "./pages/SmallCase";

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
              <Route path="cashflow-summary" element={<CashflowSummary />} />
              <Route path="expense-reduction-planner" element={<ExpenseReductionPlanner />} />
              <Route path="projected-cashflow" element={<ProjectedCashflow />} />
              <Route path="net-worth" element={<NetWorthCalculator />} />
              <Route path="real-estate" element={<RealEstate />} />
              <Route path="domestic-equity" element={<DomesticEquity />} />
              <Route path="mutual-fund-allocation" element={<MutualFundAllocation />} />
              <Route path="mutual-fund-sip" element={<MutualFundSIP />} />
              <Route path="small-case" element={<SmallCase />} />
              <Route path="us-equity" element={<USEquity />} />
              <Route path="debt" element={<Debt />} />
              <Route path="precious-metals-summary" element={<PreciousMetalsSummary />} />
              <Route path="gold" element={<Gold />} />
              <Route path="silver" element={<Silver />} />
              <Route path="platinum" element={<Platinum />} />
              <Route path="diamond" element={<Diamond />} />
              <Route path="future-value" element={<FutureValueCalculator />} />
              <Route path="goals" element={<Goals />} />
              <Route path="retirement" element={<RetirementDashboard />} />
              <Route path="fire-calculator" element={<FireCalculator />} />
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