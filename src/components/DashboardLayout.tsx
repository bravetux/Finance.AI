"use client";

import React from "react";
import { Link, Outlet } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calculator,
  Landmark,
  Menu,
  TrendingUp,
  ArrowDownUp,
  Target,
  LineChart,
  Bot,
  FileText,
  Briefcase,
  Flame,
  Sheet as SheetIcon,
  FileInput,
  Wallet,
  Home,
  BarChart2,
  Gem,
  PieChart,
  Repeat,
  CheckCircle,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, type: 'link' },
  { 
    name: "CashFlow Planning", 
    icon: Calculator,
    type: 'section',
    children: [
      { name: "Summary", path: "/dashboard/cashflow-summary", icon: LayoutDashboard, type: 'link' },
      { name: "Expense Reduction Planner", path: "/dashboard/expense-reduction-planner", icon: SheetIcon, type: 'link' },
      { name: "Cashflow", path: "/dashboard/cashflow", icon: ArrowDownUp, type: 'link' },
    ]
  },
  { 
    name: "Net Worth", 
    icon: Wallet,
    type: 'section',
    children: [
      { name: "Net Worth Calculator", path: "/dashboard/net-worth", icon: Calculator, type: 'link' },
      { name: "Real Estate", path: "/dashboard/real-estate", icon: Home, type: 'link' },
      { 
        name: "Equity", 
        icon: BarChart2,
        type: 'section',
        children: [
          { name: "Domestic Equity", path: "/dashboard/domestic-equity", icon: BarChart2, type: 'link' },
          { name: "Mutual Fund Allocation", path: "/dashboard/mutual-fund-allocation", icon: PieChart, type: 'link' },
          { name: "Mutual Fund SIP", path: "/dashboard/mutual-fund-sip", icon: Repeat, type: 'link' },
          { name: "Small Case", path: "/dashboard/small-case", icon: Briefcase, type: 'link' },
          { name: "US Equity", path: "/dashboard/us-equity", icon: Landmark, type: 'link' },
        ]
      },
      { name: "Debt", path: "/dashboard/debt", icon: FileText, type: 'link' },
      { 
        name: "Precious Metals", 
        icon: Gem,
        type: 'section',
        children: [
          { name: "Summary", path: "/dashboard/precious-metals-summary", icon: LayoutDashboard, type: 'link' },
          { name: "Gold", path: "/dashboard/gold", icon: Gem, type: 'link' },
          { name: "Silver", path: "/dashboard/silver", icon: Gem, type: 'link' },
          { name: "Platinum", path: "/dashboard/platinum", icon: Gem, type: 'link' },
          { name: "Diamond", path: "/dashboard/diamond", icon: Gem, type: 'link' },
        ]
      },
    ]
  },
  { name: "Goals", path: "/dashboard/goals", icon: Target, type: 'link' },
  { 
    name: "Retirement Planning", 
    icon: Landmark,
    type: 'section',
    children: [
      { name: "Future Value", path: "/dashboard/future-value", icon: TrendingUp, type: 'link' },
      { name: "Retirement", path: "/dashboard/retirement", icon: Landmark, type: 'link' },
      { name: "FIRE Calculator", path: "/dashboard/fire-calculator", icon: Flame, type: 'link' },
      { name: "Projected Cashflow", path: "/dashboard/projected-cashflow", icon: LineChart, type: 'link' },
      { name: "Can you retire now?", path: "/dashboard/can-you-retire-now", icon: CheckCircle, type: 'link' },
      { name: "Post-Retirement Strategy", path: "/dashboard/post-retirement-strategy", icon: LineChart, type: 'link' },
    ]
  },
  { name: "Reports", path: "/dashboard/reports", icon: FileText, type: 'link' },
  { name: "AI Prompt", path: "/dashboard/ai-prompt", icon: Bot, type: 'link' },
];

const DashboardLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col p-4 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <Link to="/dashboard" className="text-2xl font-bold mb-6 text-sidebar-primary-foreground">
        Financial Planner
      </Link>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 pr-4">
          {navItems.map((item) =>
            item.type === 'section' && item.children ? (
              <Accordion key={item.name} type="single" collapsible className="w-full">
                <AccordionItem value={item.name} className="border-none">
                  <AccordionTrigger className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline rounded-md px-3 py-2 w-full font-medium">
                    <div className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    <div className="flex flex-col gap-1 pl-4">
                      {item.children.map((child) =>
                        child.type === 'section' && child.children ? (
                          <Accordion key={child.name} type="single" collapsible className="w-full">
                            <AccordionItem value={child.name} className="border-none">
                              <AccordionTrigger className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline rounded-md px-3 py-2 w-full">
                                <div className="flex items-center">
                                  <child.icon className="mr-2 h-4 w-4" />
                                  {child.name}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-1 pb-0">
                                <div className="flex flex-col gap-1 pl-4">
                                  {child.children.map((grandchild) => (
                                    <Button
                                      key={grandchild.name}
                                      variant="ghost"
                                      className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                      asChild
                                      onClick={() => isMobile && setIsSheetOpen(false)}
                                    >
                                      <Link to={grandchild.path!}>
                                        <grandchild.icon className="mr-2 h-4 w-4" />
                                        {grandchild.name}
                                      </Link>
                                    </Button>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ) : (
                          <Button
                            key={child.name}
                            variant="ghost"
                            className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            asChild
                            onClick={() => isMobile && setIsSheetOpen(false)}
                          >
                            <Link to={child.path!}>
                              <child.icon className="mr-2 h-4 w-4" />
                              {child.name}
                            </Link>
                          </Button>
                        )
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <Link
                key={item.name}
                to={item.path!}
                onClick={() => isMobile && setIsSheetOpen(false)}
                className="flex items-center justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline rounded-md px-3 py-2 w-full font-medium"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            )
          )}
        </nav>
      </ScrollArea>
      <div className="mt-6 text-sm text-sidebar-foreground/80 px-2">
        <p className="font-semibold">Designed and Developed by B.Vignesh Kumar</p>
        <a href="mailto:vigneshkumarb@bravetux.com" className="hover:underline">
          vigneshkumarb@bravetux.com
        </a>
      </div>
      <div className="mt-auto flex items-center justify-end">
        <ThemeToggle />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center justify-between p-4 border-b bg-background">
          <h1 className="text-xl font-bold">Financial Planner</h1>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-grow p-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-screen">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
        <SidebarContent />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80}>
        <main className="p-6">
          <Outlet />
        </main>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default DashboardLayout;