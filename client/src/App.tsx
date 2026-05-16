import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import SweepRequests from "./pages/SweepRequests";
import Executions from "./pages/Executions";
import RetryManagement from "./pages/RetryManagement";
import OutboxEvents from "./pages/OutboxEvents";
import InboxEvents from "./pages/InboxEvents";
import ErrorLogs from "./pages/ErrorLogs";
import Settings from "./pages/Settings";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/sweep-requests"} component={SweepRequests} />
      <Route path={"/executions"} component={Executions} />
      <Route path={"/retry-management"} component={RetryManagement} />
      <Route path={"/outbox-events"} component={OutboxEvents} />
      <Route path={"/inbox-events"} component={InboxEvents} />
      <Route path={"/error-logs"} component={ErrorLogs} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
