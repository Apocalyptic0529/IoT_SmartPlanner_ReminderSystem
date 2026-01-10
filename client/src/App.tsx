import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "next-themes";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PrivateRoute component={Dashboard} />} />
      <Route path="/analytics" component={() => <PrivateRoute component={Dashboard} />} />
      <Route path="/score" component={() => <PrivateRoute component={Dashboard} />} />
      <Route path="/deleted-tasks" component={() => <PrivateRoute component={Dashboard} />} />
      <Route path="/rescheduled-tasks" component={() => <PrivateRoute component={Dashboard} />} />
      <Route path="/settings" component={() => <PrivateRoute component={Settings} />} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen w-full bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-indigo-600/20 dark:from-blue-900/40 dark:via-purple-950/40 dark:to-indigo-950/40">
            <Router />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
