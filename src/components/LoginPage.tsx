import React, { useState } from 'react';
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
  AlertCircle
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
      <div className="w-full max-w-5xl bg-[#0b0a21]/90 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 relative z-10 transition-all duration-300">
        {/* LEFT COLUMN: AUTOMOTIVE & REMOTE CLOUD CONNECTIVITY VISUALIZER */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0e0c2a] via-[#120f38] to-[#080718] p-8 md:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
          
          {/* Animated Connecting Cloud Waves */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Header Badge */}
          <div className="relative z-10 space-y-6">
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
                    <span className="text-[#5969ff] text-xs font-mono px-1.5 py-0.5 bg-indigo-950/80 border border-indigo-800/50 rounded-md">GATEWAY</span>
                  </h1>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Remote Telematics & Rules Engine</p>
                </div>
              </div>

              <div className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-mono font-bold rounded-full flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>CAN-FD ACTIVE</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight font-display">
                Next-Gen Automotive <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2ec5d3] via-indigo-300 to-[#5969ff]">
                  Remote Cloud Matrix
                </span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Real-time over-the-air vehicle telemetry evaluation, dynamically mapping ECU event feeds with cloud-orchestrated rules.
              </p>
            </div>
          </div>

          {/* AUTOMOTIVE CLOUD CONNECTIVITY GRAPHIC */}
          <div className="my-8 relative z-10 flex flex-col items-center justify-center py-4">
            
            {/* Outer Orbiting Ring */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              
              <div className="absolute inset-0 rounded-full border border-dashed border-indigo-500/30 animate-spin [animation-duration:30s]" />
              <div className="absolute inset-4 rounded-full border border-cyan-500/20 animate-spin [animation-duration:20s] [animation-direction:reverse]" />

              {/* Central Glowing Hub */}
              <div className="w-28 h-28 rounded-full bg-indigo-950/60 border border-indigo-500/40 p-3 shadow-2xl shadow-indigo-500/30 backdrop-blur-md flex flex-col items-center justify-center relative">
                <div className="flex items-center space-x-1 text-indigo-300 animate-bounce duration-1000">
                  <Cloud className="h-8 w-8 text-[#2ec5d3]" />
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-300 mt-1 uppercase tracking-wider">
                  Cloud Gateway
                </span>
              </div>

              {/* Orbiting Vehicle Node 1 */}
              <div className="absolute w-full h-full pointer-events-none animate-spin [animation-duration:16s]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-indigo-500/60 p-2 rounded-xl shadow-lg flex items-center space-x-1.5 pointer-events-auto">
                  <Car className="h-4 w-4 text-emerald-400" />
                  <span className="text-[9px] font-mono text-slate-200 font-bold">VIN #8821</span>
                </div>
              </div>

              {/* Orbiting ECU Node 2 */}
              <div className="absolute w-full h-full pointer-events-none animate-spin [animation-duration:22s] [animation-direction:reverse]">
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-cyan-500/60 p-2 rounded-xl shadow-lg flex items-center space-x-1.5 pointer-events-auto">
                  <Cpu className="h-4 w-4 text-[#2ec5d3]" />
                  <span className="text-[9px] font-mono text-slate-200 font-bold">ECU Gateway</span>
                </div>
              </div>

              {/* Orbiting Telemetry Node 3 */}
              <div className="absolute w-full h-full pointer-events-none animate-spin [animation-duration:28s]">
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 bg-slate-900 border border-indigo-400/60 p-2 rounded-xl shadow-lg flex items-center space-x-1.5 pointer-events-auto">
                  <Radio className="h-4 w-4 text-amber-400" />
                  <span className="text-[9px] font-mono text-slate-200 font-bold">5G Telematics</span>
                </div>
              </div>
            </div>

            {/* Live Telemetry Ping Status */}
            <div className="mt-4 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 flex items-center space-x-3 shadow-inner">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>Latency: <strong className="text-emerald-400 font-mono">12ms</strong></span>
              <span className="text-slate-600">|</span>
              <span>ISO 26262 ASIL-D</span>
            </div>
          </div>

          {/* Bottom Security Specs Footer */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-[#5969ff]" />
              <span>Zero-Trust Token Sync</span>
            </div>
            <span>v2.4.0-PROD</span>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN / FORGOT PASSWORD / SSO FORM PANEL */}
        <div className="lg:col-span-6 p-8 md:p-10 flex flex-col justify-between bg-[#0b0a21]">
          
          {/* MODE 1: STANDARD LOGIN FORM */}
          {mode === 'login' && (
            <div className="space-y-6 my-auto transition-all duration-300">
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

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
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
                <div className="flex items-center justify-between pt-1">
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
              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#0b0a21] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
                  OR ENTERPRISE SINGLE SIGN-ON
                </span>
              </div>

              {/* SINGLE SIGN-ON (SSO) ALTERNATIVE LOGIN BUTTONS */}
              <div className="grid grid-cols-2 gap-3">
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
              <div className="pt-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
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
