import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ChapterReader from "@/pages/chapter-reader";
import Quiz from "@/pages/quiz";
import Glossary from "@/pages/glossary";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import AdminPanel from "@/pages/admin-panel";
import Leaderboard from "@/pages/leaderboard";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/chapter/:id" component={ChapterReader} />
          <Route path="/quiz/:id" component={Quiz} />
          <Route path="/glossary" component={Glossary} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      {/* Admin routes - independent of regular auth */}
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-panel" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
