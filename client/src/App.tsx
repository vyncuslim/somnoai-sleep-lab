import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Notifications from './pages/Notifications';
import AIAssistant from './pages/AIAssistant';
import Calendar from './pages/Calendar';
import ManualEntry from './pages/ManualEntry';
import TrendAnalysis from './pages/TrendAnalysis';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import BrandGuidelines from './pages/BrandGuidelines';
import SleepGoals from './pages/SleepGoals';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import { Cloud, ShieldCheck } from 'lucide-react';

// 简单的访客模式状态管理
const GuestModeContext = React.createContext<{
  isGuest: boolean;
  setIsGuest: (value: boolean) => void;
}>({ isGuest: false, setIsGuest: () => {} });

export const useGuestMode = () => React.useContext(GuestModeContext);

function Router() {
  const { isGuest, setIsGuest } = useGuestMode();

  // 如果是访客模式，显示应用
  if (isGuest) {
    return (
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/calendar"} component={Calendar} />
        <Route path={"/ai-assistant"} component={AIAssistant} />
        <Route path={"/manual-entry"} component={ManualEntry} />
        <Route path={"/trend-analysis"} component={TrendAnalysis} />
        <Route path={"/settings"} component={Settings} />
        <Route path={"/sleep-goals"} component={SleepGoals} />
        <Route path={"/notifications"} component={Notifications} />
        <Route path={"/privacy"} component={Privacy} />
        <Route path={"/privacypolicy"} component={PrivacyPolicy} />
        <Route path={"/terms"} component={Terms} />
        <Route path={"/termsofservice"} component={TermsOfService} />
        <Route path={"/brand-guidelines"} component={BrandGuidelines} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // 未进入访客模式，显示欢迎页面
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/privacypolicy" component={PrivacyPolicy} />
      <Route path="/termsofservice" component={TermsOfService} />
      <Route path="/brand-guidelines" component={BrandGuidelines} />
      <Route component={Landing} />
    </Switch>
  );
}

function App() {
  const [isGuest, setIsGuest] = useState(() => {
    // 从 localStorage 恢复访客模式状态
    return localStorage.getItem('somnoai-guest-mode') === 'true';
  });

  useEffect(() => {
    // 保存访客模式状态到 localStorage
    localStorage.setItem('somnoai-guest-mode', String(isGuest));
  }, [isGuest]);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <GuestModeContext.Provider value={{ isGuest, setIsGuest }}>
            <Router />
          </GuestModeContext.Provider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
