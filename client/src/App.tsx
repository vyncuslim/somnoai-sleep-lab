import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Notifications from "./pages/Notifications";
import GoogleLogin from "./pages/GoogleLogin";
import AIAssistant from "./pages/AIAssistant";
import Calendar from "./pages/Calendar";
import ManualEntry from "./pages/ManualEntry";
import TrendAnalysis from "./pages/TrendAnalysis";

import { useAuth } from "@/_core/hooks/useAuth";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  // 如果未认证，显示登录页面
  if (!isAuthenticated) {
    return <Route component={GoogleLogin} />;
  }

  // 已认证，显示应用页面
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/calendar"} component={Calendar} />
      <Route path={"/ai-assistant"} component={AIAssistant} />
      <Route path={"/manual-entry"} component={ManualEntry} />
      <Route path={"/trend-analysis"} component={TrendAnalysis} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/privacypolicy"} component={Privacy} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/termsofservice"} component={Terms} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
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
