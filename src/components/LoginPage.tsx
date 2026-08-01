import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Cloud, 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Cpu, 
  Activity, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Zap,
  Globe,
  Radio,
  Server,
  AlertCircle,
  Smartphone,
  Share2,
  Bell,
  Wrench,
  ShieldAlert,
  Send,
  Sliders,
  Check,
  ChevronRight
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void;
  theme?: 'concept-dark' | 'concept-light';
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'forgot_password' | 'sso_auth'>('login');
  
  // Login form state
  const [email, setEmail] = useState('ravi.chouhan@automotive-cloud.io');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // SSO selection state
  const [selectedSSOProvider, setSelectedSSOProvider] = useState<string | null>(null);

  // Live Simulated Alert Stream for Connected Vehicle Illustration
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const simulatedAlerts = [
    {
      id: 'ALT-8821-A',
      title: 'High Battery Temp Warning',
      source: 'EV Battery Management ECU',
      target: 'Car Owner App + B2B Service Portal',
      targetType: 'owner_b2b',
      status: 'DISPATCHED',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    {
      id: 'ALT-9034-B',
      title: 'Brake Pad Wear Threshold (85%)',
      source: 'CAN-FD Chassis Telemetry',
      target: '3rd-Party Service Center Network',
      targetType: 'third_party',
      status: 'AUTO-SCHEDULED',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    {
      id: 'ALT-1049-C',
      title: 'Geofence Boundary Departure',
      source: 'GPS / 5G Telematics Unit',
      target: 'B2B Enterprise Fleet Control',
      targetType: 'b2b',
      status: 'NOTIFIED',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
    },
    {
      id: 'ALT-3312-D',
      title: 'OTA Software Update Ready',
      source: 'Cloud Firmware Repository',
      target: 'Car Owner In-Dash Infotainment',
      targetType: 'owner',
      status: 'DELIVERED',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAlertIndex((prev) => (prev + 1) % simulatedAlerts.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    // Simulate secure cloud telemetry authentication handshake
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        name: email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()) || 'Ravi Chouhan',
        email: email,
        role: 'Fleet Security Lead'
      });
    }, 1200);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setResetSent(true);
    }, 1000);
  };

  const handleSSOLogin = (provider: string) => {
    setSelectedSSOProvider(provider);
    setMode('sso_auth');

    setTimeout(() => {
      onLoginSuccess({
        name: 'Enterprise Fleet Admin',
        email: `admin@${provider.toLowerCase().replace(/\s+/g, '')}-sso.com`,
        role: 'Cloud Gateway Architect'
      });
    }, 1500);
  };

  const handleQuickDemoFill = (role: 'admin' | 'engineer') => {
    if (role === 'admin') {
      setEmail('ravi.chouhan@automotive-cloud.io');
      setPassword('FleetMaster2026!');
    } else {
      setEmail('engineer.sdv@telematics-cloud.com');
      setPassword('CanBusSecure99#');
    }
    setErrorMessage(null);
  };

  const currentAlert = simulatedAlerts[activeAlertIndex];

  return (
    <div className="min-h-screen w-full bg-[#070614] text-slate-100 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* BACKGROUND GRAPHICS & MOTION EFFECTS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(89,105,255,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(46,197,211,0.12),transparent_40%)] pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* Floating Orbital Glow Spheres */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-10000" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-10000" />

      {/* MAIN CONTAINER CARD */}
      <div className="w-full max-w-6xl bg-[#0b0a21]/95 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 relative z-10 transition-all duration-300">
        
        {/* LEFT COLUMN: CONNECTED CAR SERVICES NOTIFICATIONS & EVENTS ILLUSTRATION */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#0e0c2a] via-[#120f38] to-[#080718] p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
          
          {/* Animated Connecting Cloud Waves SVG Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Header Badge */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#5969ff] to-[#2ec5d3] p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                  <div className="h-full w-full bg-[#0b0a21] rounded-[10px] flex items-center justify-center">
                    <Car className="h-5 w-5 text-[#2ec5d3]" />
                  </div>
                </div>
                <div>
                  <h1 className="text-base font-extrabold tracking-wide text-white font-display flex items-center space-x-1.5">
                    <span>SDV CLOUD</span>
                    <span className="text-[#2ec5d3] text-xs font-mono px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-800/50 rounded-md">NOTIFICATION HUB</span>
                  </h1>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Connected Vehicle Events & Alerts Engine</p>
                </div>
              </div>

              <div className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-mono font-bold rounded-full flex items-center space-x-1.5 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>EVENTS ROUTER ACTIVE</span>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight font-display">
                Connected Vehicle Event Matrix <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2ec5d3] via-indigo-300 to-[#5969ff]">
                  Real-Time Notification Dispatch
                </span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated multi-channel routing of vehicle telemetry alerts to <strong className="text-cyan-300">Car Owners</strong>, <strong className="text-indigo-300">B2B Fleets</strong>, and <strong className="text-emerald-300">3rd-Party Partners</strong>.
              </p>
            </div>
          </div>

          {/* ANIMATED DIAGRAM: CONNECTED CAR TO CLOUD TO RECIPIENTS */}
          <div className="my-6 relative z-10 space-y-4">
            
            {/* CENTRAL NETWORK DIAGRAM CARD */}
            <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden">
              
              {/* TOP: Connected Vehicle Sensor Node */}
              <div className="flex items-center justify-between bg-slate-950/90 border border-indigo-500/30 p-3 rounded-xl mb-4 relative">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-950 border border-indigo-700/60 rounded-lg text-indigo-400 animate-pulse">
                    <Car className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>Connected Vehicle (VIN #8821)</span>
                      <span className="px-1.5 py-0.5 bg-indigo-900/60 border border-indigo-700/50 text-[9px] font-mono text-indigo-300 rounded">CAN-FD</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">ECU Sensors • GPS • Battery BARS • ADAS Events</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/50 px-2 py-1 rounded-md">
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  <span>5G Telematics</span>
                </div>
              </div>

              {/* CENTER: Cloud Gateway Event Processor & Rules Engine */}
              <div className="flex flex-col items-center justify-center my-3 relative">
                
                {/* Flow Lines Downward with Animated Pulse */}
                <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 via-cyan-400 to-indigo-500 relative">
                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75" />
                </div>

                <div className="w-full bg-gradient-to-r from-indigo-950/90 via-[#111030] to-indigo-950/90 border border-cyan-500/40 rounded-xl p-2.5 my-1 text-center shadow-lg relative flex items-center justify-between px-4">
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-4 w-4 text-[#2ec5d3] animate-bounce" />
                    <span className="text-[11px] font-mono font-bold text-slate-100 uppercase tracking-wider">
                      Cloud Notification & Rules Gateway
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400">
                    <Zap className="h-3 w-3" />
                    <span>Rule Match: 99.8%</span>
                  </div>
                </div>

                {/* Flow Lines Branching Outward */}
                <div className="w-full flex justify-between px-8 text-cyan-500/50">
                  <div className="w-0.5 h-4 bg-cyan-500/60" />
                  <div className="w-0.5 h-4 bg-indigo-500/60" />
                  <div className="w-0.5 h-4 bg-emerald-500/60" />
                </div>
              </div>

              {/* BOTTOM THREE DESTINATION CHANNELS */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                
                {/* DESTINATION 1: CAR OWNER */}
                <div className={`p-2.5 rounded-xl border transition-all ${
                  currentAlert.targetType.includes('owner') 
                    ? 'bg-cyan-950/70 border-cyan-500/80 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/50' 
                    : 'bg-slate-950/60 border-slate-800 opacity-80'
                }`}>
                  <div className="flex items-center space-x-1.5 text-cyan-400 mb-1">
                    <Smartphone className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[10px] font-bold uppercase font-mono tracking-tight">Car Owners</span>
                  </div>
                  <p className="text-[9px] text-slate-300 leading-tight">Mobile Push • In-Dash Alerts • iOS/Android Sync</p>
                </div>

                {/* DESTINATION 2: B2B / OEM FLEET */}
                <div className={`p-2.5 rounded-xl border transition-all ${
                  currentAlert.targetType.includes('b2b') 
                    ? 'bg-indigo-950/70 border-indigo-500/80 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/50' 
                    : 'bg-slate-950/60 border-slate-800 opacity-80'
                }`}>
                  <div className="flex items-center space-x-1.5 text-indigo-400 mb-1">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[10px] font-bold uppercase font-mono tracking-tight">B2B & OEM Fleet</span>
                  </div>
                  <p className="text-[9px] text-slate-300 leading-tight">Fleet Telematics Dashboard • Enterprise Webhook</p>
                </div>

                {/* DESTINATION 3: 3RD-PARTY SERVICES */}
                <div className={`p-2.5 rounded-xl border transition-all ${
                  currentAlert.targetType.includes('third_party') 
                    ? 'bg-emerald-950/70 border-emerald-500/80 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/50' 
                    : 'bg-slate-950/60 border-slate-800 opacity-80'
                }`}>
                  <div className="flex items-center space-x-1.5 text-emerald-400 mb-1">
                    <Wrench className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[10px] font-bold uppercase font-mono tracking-tight">3rd-Party Hub</span>
                  </div>
                  <p className="text-[9px] text-slate-300 leading-tight">Roadside • EV Smart Grid • Insurance Partner API</p>
                </div>

              </div>

            </div>

            {/* LIVE ANIMATED EVENT TICKER CARD */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-inner">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
                  <Bell className="h-4 w-4 text-amber-400 animate-bounce" />
                </div>
                <div className="truncate">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-400">{currentAlert.id}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${currentAlert.badgeColor}`}>
                      {currentAlert.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {currentAlert.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    Target: <span className="text-cyan-300">{currentAlert.target}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>

          </div>

          {/* Bottom Security Specs Footer */}
          <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-[#5969ff]" />
              <span>ISO 26262 & UNECE WP.29 Compliant</span>
            </div>
            <span>v2.4.0-PROD</span>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN / FORGOT PASSWORD / SSO FORM PANEL */}
        <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-[#0b0a21]">
          
          {/* MODE 1: STANDARD LOGIN FORM */}
          {mode === 'login' && (
            <div className="space-y-5 my-auto transition-all duration-300">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-white font-display tracking-tight flex items-center space-x-2">
                  <span>Sign In to Telematics Console</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Access real-time vehicle notifications, rules matrix & after-sales scheduler.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider block">
                    Automotive Engineer Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-slate-500" />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@automotive-cloud.io"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-[#5969ff] focus:ring-1 focus:ring-[#5969ff] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none transition font-mono"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider block">
                      Encrypted Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => setMode('forgot_password')}
                      className="text-[11px] font-bold text-[#2ec5d3] hover:text-cyan-300 hover:underline transition"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-500" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-[#5969ff] focus:ring-1 focus:ring-[#5969ff] rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none transition font-mono"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Auto-Sync */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-[#5969ff] focus:ring-offset-0 focus:ring-0 h-4 w-4"
                    />
                    <span>Keep Cloud Token Active</span>
                  </label>

                  <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>mTLS Secured</span>
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#5969ff] via-indigo-600 to-[#2ec5d3] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition transform active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>Verifying Cloud Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Authenticate Remote Gateway</span>
                      <ArrowRight className="h-4 w-4 text-white" />
                    </>
                  )}
                </button>
              </form>

              {/* DIVIDER */}
              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#0b0a21] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
                  OR ENTERPRISE SINGLE SIGN-ON
                </span>
              </div>

              {/* SINGLE SIGN-ON (SSO) ALTERNATIVE LOGIN BUTTONS */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSSOLogin('Azure AD Fleet IAM')}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Building2 className="h-4 w-4 text-[#2ec5d3]" />
                  <span>Azure AD SSO</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSSOLogin('Okta Automotive Cloud')}
                  className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Globe className="h-4 w-4 text-[#5969ff]" />
                  <span>Okta SSO</span>
                </button>
              </div>

              {/* QUICK DEMO PRESET FILL */}
              <div className="pt-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Server className="h-3.5 w-3.5 text-amber-400" />
                  <span>Quick Demo Login:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('admin')}
                    className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800/80 text-indigo-300 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer"
                  >
                    Fleet Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('engineer')}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer"
                  >
                    SDV Eng
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* MODE 2: FORGOT PASSWORD FEATURE */}
          {mode === 'forgot_password' && (
            <div className="space-y-6 my-auto transition-all duration-300">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-white font-display tracking-tight flex items-center space-x-2">
                  <KeyRound className="h-5 w-5 text-[#2ec5d3]" />
                  <span>Reset Gateway Access</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Enter your registered automotive developer email address to receive an encrypted password reset key.
                </p>
              </div>

              {resetSent ? (
                <div className="p-5 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl space-y-3 text-center">
                  <div className="h-10 w-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-300 font-mono">Reset Key Dispatched!</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    An encrypted password reset link has been dispatched to <strong className="text-white font-mono">{resetEmail || 'your email'}</strong>. Please check your inbox or corporate spam filter.
                  </p>
                  <button
                    onClick={() => { setMode('login'); setResetSent(false); }}
                    className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold font-mono text-slate-300 uppercase tracking-wider block">
                      Registered Corporate Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 h-4 w-4 text-slate-500" />
                      <input 
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="engineer@automotive-cloud.io"
                        className="w-full bg-slate-900/90 border border-slate-800 focus:border-[#2ec5d3] focus:ring-1 focus:ring-[#2ec5d3] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none transition font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#2ec5d3] to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition transform active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {resetLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        <span>Dispatching Reset Key...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Password Reset Link</span>
                        <ArrowRight className="h-4 w-4 text-white" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition text-center block cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </form>
              )}
            </div>
          )}

          {/* MODE 3: SSO HANDSHAKE SIMULATION */}
          {mode === 'sso_auth' && (
            <div className="space-y-6 my-auto text-center py-6 transition-all duration-300">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border-2 border-cyan-500/20 border-t-[#2ec5d3] animate-spin" />
                <Globe className="h-7 w-7 text-[#5969ff] absolute" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-white font-display">
                  Connecting to {selectedSSOProvider || 'Enterprise SSO'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Exchanging OAuth2.0 / SAML Tokens with Vehicle IAM Gateway...
                </p>
              </div>

              <div className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 flex items-center justify-center space-x-2 max-w-xs mx-auto">
                <CheckCircle2 className="h-4 w-4" />
                <span>mTLS Session Initialized</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
