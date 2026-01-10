import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, BarChart3, Home as HomeIcon, Trophy, X, RotateCcw } from "lucide-react";
import Home from "./Home";
import Analytics from "./Analytics";
import Score from "./Score";
import Settings from "./Settings";
import DeletedTasks from "./DeletedTasks";
import RescheduledTasks from "./RescheduledTasks";
import { StatsOverview } from "@/components/StatsOverview";

export default function Dashboard() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  const tabs = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/score", label: "Score", icon: Trophy },
    { path: "/deleted-tasks", label: "Deleted Tasks", icon: X },
    { path: "/rescheduled-tasks", label: "Rescheduled Tasks", icon: RotateCcw },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const currentPath = location === "/" ? "/" : location;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 dark:bg-[#030712] relative z-0">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b dark:bg-[#030712]/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between h-10 sm:h-12">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold font-display text-xs sm:text-sm flex-shrink-0">
                MMK
              </div>
              <h1 className="text-lg sm:text-xl font-display font-bold hidden sm:block dark:text-white">MaalaalaMoKaya</h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground hidden md:block truncate dark:text-gray-400">
                Welcome, {user?.username}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-0.5 sm:gap-1 border-b dark:border-gray-800 pb-0 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentPath === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white"
                  }`}
                  data-testid={`tab-${tab.label.toLowerCase()}`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 relative z-0">
        {currentPath === "/" && (
          <div className="space-y-8 relative z-0">
            <StatsOverview />
            <Home />
          </div>
        )}
        {currentPath === "/analytics" && <Analytics />}
        {currentPath === "/score" && <Score />}
        {currentPath === "/deleted-tasks" && <DeletedTasks />}
        {currentPath === "/rescheduled-tasks" && <RescheduledTasks />}
        {currentPath === "/settings" && <Settings />}
      </main>
    </div>
  );
}
