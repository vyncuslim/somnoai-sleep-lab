import React, { useState, useEffect, useCallback } from 'react';
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
import SleepGoals from './pages/SleepGoals';
import NotFound from './pages/NotFound';
import { Loader2, Cloud, PlusCircle, ShieldCheck } from 'lucide-react';

// 简单的访客模式状态管理
const GuestModeContext = React.createContext<{
  isGuest: boolean;
  setIsGuest: (value: boolean) => void;
}>({ isGuest: false, setIsGuest: () => {} });

export const useGuestMode = () => React.useContext(GuestModeContext);

function Router() {
  const { isGuest } = useGuestMode();
  const [isLoading, setIsLoading] = useState(false);

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
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // 未进入访客模式，显示欢迎页面
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8 text-center px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-in fade-in duration-700">
      <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[3rem] shadow-2xl shadow-indigo-500/10">
        <Cloud size={80} className="text-indigo-400 mb-2" />
      </div>
      <div className="max-w-xs space-y-4">
        <h2 className="text-3xl font-black text-white tracking-tight italic">SomnoAI 睡眠实验室</h2>
        <p className="text-slate-400 text-sm">探索您的睡眠数据，获取个性化的睡眠建议</p>
        <div className="p-5 bg-slate-900/60 border border-white/5 rounded-3xl text-left space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">开始使用</span>
          </div>
          <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-2 font-medium">
            <li><span className="text-slate-200">Google Fit：</span>连接您的 Google Fit 账户以自动同步睡眠数据</li>
            <li><span className="text-slate-200">手动录入：</span>如果没有穿戴设备，可以手动录入睡眠数据</li>
            <li><span className="text-slate-200">AI 分析：</span>获得基于您睡眠数据的个性化建议</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col w-full max-w-xs gap-3">
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-indigo-600/30"
        >
          进入应用
        </button>
      </div>
    </div>
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
