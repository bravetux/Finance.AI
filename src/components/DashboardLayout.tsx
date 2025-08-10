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
  Sheet as SheetIcon
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

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, type: 'link' },
  { 
    name: "Financial Planning", 
    icon: Calculator,
    type: 'section',
    children: [
      { name: "Expense Reduction Planner", path: "/expense-reduction-planner", icon: SheetIcon },
      { name: "Cashflow", path: "/cashflow", icon: ArrowDownUp },
    ]
  },
  { name: "FIRE Calculator", path: "/fire-calculator", icon: Flame, type: 'link' },
  { name: "Net Worth", path: "/net-worth", icon: Calculator, type: 'link' },
  { name: "Goals", path: "/goals", icon: Target, type: 'link' },
  { name: "Future Value", path: "/future-value", icon: TrendingUp, type: 'link' },
  { name: "Retirement", path: "/retirement", icon: Landmark, type: 'link' },
  { name: "Portfolio", path: "/portfolio", icon: Briefcase, type: 'link' },
  { name: "Projected Cashflow", path: "/projected-cashflow", icon: LineChart, type: 'link' },
  { name: "Reports", path: "/reports", icon: FileText, type: 'link' },
  { name: "AI Prompt", path: "/ai-prompt", icon: Bot, type: 'link' },
];

const DashboardLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col p-4 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <h2 className="text-2xl font-bold mb-6 text-sidebar-primary-foreground">
        Finance Dashboard
      </h2>
      <div className="flex-grow flex flex-col">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) =>
            item.type === 'section' && item.children ? (
              <Accordion key={item.name} type="single" collapsible className="w-full">
                <AccordionItem value={item.name} className="border-none">
                  <AccordionTrigger className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline rounded-md px-3 py-2 w-full">
                    <div className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    <div className="flex flex-col gap-1 pl-4">
                      {item.children.map((child) => (
                        <Button
                          key={child.name}
                          variant="ghost"
                          className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          asChild
                          onClick={() => isMobile && setIsSheetOpen(false)}
                        >
                          <Link to={child.path}>
                            <child.icon className="mr-2 h-4 w-4" />
                            {child.name}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <Button
                key={item.name}
                variant="ghost"
                className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                asChild
                onClick={() => isMobile && setIsSheetOpen(false)}
              >
                <Link to={item.path!}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            )
          )}
        </nav>
        <div className="mt-6 text-sm text-sidebar-foreground/80 px-2">
          <p className="font-semibold">Designed and Developed by B.Vignesh Kumar</p>
          <a href="mailto:vigneshkumarb@bravetux.com" className="hover:underline">
            vigneshkumarb@bravetux.com
          </a>
        </div>
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
          <h1 className="text-xl font-bold">Finance Dashboard</h1>
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