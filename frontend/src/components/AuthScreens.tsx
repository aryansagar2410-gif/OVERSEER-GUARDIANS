import React, { useState, useEffect } from 'react';

interface AuthScreensProps {
  onLoginSuccess: (userEmail: string) => void;
  onBackToApp: () => void;
}

export const AuthScreens: React.FC<AuthScreensProps> = ({ onLoginSuccess, onBackToApp }) => {
  const [authView, setAuthView] = useState<'login' | 'signup' | 'recovery'>('login');

  // Login view states
  const [demoState, setDemoState] = useState<'default' | 'error' | 'loading'>('default');
  const [loginEmail, setLoginEmail] = useState('elena.vance@stocksense.io');
  const [loginPassword, setLoginPassword] = useState('WarehousePass2025!');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  // Signup view states
  const [signupName, setSignupName] = useState('Elena Vance');
  const [signupEmail, setSignupEmail] = useState('elena.vance@logistiq.com');
  const [signupRole, setSignupRole] = useState<'manager' | 'staff'>('manager');
  const [signupPassword, setSignupPassword] = useState('Op$SecureLedger2025');
  const [confirmPassword, setConfirmPassword] = useState('Op$SecureLedger2025');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [termsError, setTermsError] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Recovery (OTP) view states
  const [otpDigits, setOtpDigits] = useState<string[]>(['4', '8', '2', '9', '1', '']);
  const [timerSeconds, setTimerSeconds] = useState(39);
  const [resendActive, setResendActive] = useState(false);
  const [recoveryVerified, setRecoveryVerified] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('Identity confirmed for enterprise account e.vance@logistiq.com');

  // OTP Countdown Timer
  useEffect(() => {
    if (timerSeconds <= 0) {
      setResendActive(true);
      return;
    }
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  // Dynamic Password Strength Meter logic
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const passwordScore = calculatePasswordStrength(signupPassword);
  const passwordsMatch = signupPassword.length > 0 && signupPassword === confirmPassword;

  const handleLoginSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (demoState === 'error') return; setDemoState('loading'); try { const { login } = await import('../api/auth'); const res = await login({ email: loginEmail, password: loginPassword }); localStorage.setItem('token', res.token); setDemoState('default'); onLoginSuccess(res.user.email); } catch (err: any) { setDemoState('error'); setFeedbackMsg(err.message || 'Login failed'); } };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setSignupSuccess(true);
    setTimeout(() => {
      onLoginSuccess(signupEmail);
    }, 1500);
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryVerified(true);
    setFeedbackMsg('Token successfully verified. Proceeding to set new password...');
    setTimeout(() => {
      onLoginSuccess('e.vance@logistiq.com');
    }, 1200);
  };

  const handleResendOtp = () => {
    setTimerSeconds(60);
    setResendActive(false);
    setFeedbackMsg('New verification code dispatched to e.vance@logistiq.com');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb] text-[#191c1e] relative selection:bg-blue-100">
      {/* Top Header of Auth Screen */}
      <header className="relative z-10 w-full bg-white/80 backdrop-blur-md shadow-xs border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={onBackToApp}
            title="Return to Application"
          >
            <img
              alt="Brand logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1UXocjtMUrIoRdmAAhm8Epl0mYW271zq4ZXxZys7SK76p4CwDIv-6HQ9ktq8SylFBe8y1LwV8bDZsCIBOzn1qdizSJ18a32TbHKUxOKSu21yNY5kRxWfl7lSzGU0jXvwNlcanWDT9lnjB7v3XVJjxQNwdW7_UKeJHcmdKq2kAY-E-Fz5j68cBociOzKEFnL8eE3wzNfUSm0_kw7EOMGuR4duYmOIZAoahRxz-IJdyV6NRJdnDaMpz5zRmU"
            />
            <span className="text-[16px] tracking-tight text-[#191c1e] font-bold">
              Stock<span className="text-[#2563eb]">Sense</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-lg bg-[#eceef0] text-[#434655] text-[10px] uppercase font-bold tracking-wider">
              B2B Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Auth Screen View Selector */}
            <div className="flex items-center bg-[#f2f4f6] p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setAuthView('login')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  authView === 'login' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-[#505f76]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthView('signup')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  authView === 'signup' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-[#505f76]'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setAuthView('recovery')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  authView === 'recovery' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-[#505f76]'
                }`}
              >
                2FA Challenge
              </button>
            </div>

            <button
              type="button"
              onClick={onBackToApp}
              className="text-xs text-[#004ac6] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Back to Dashboard</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* ============================================================== */}
        {/* VIEW 1: ENTERPRISE LOGIN (Screenshot 5)                        */}
        {/* ============================================================== */}
        {authView === 'login' && (
          <div className="flex flex-col w-full items-center justify-center py-4">
            {/* Demo Modes Bar matching Screenshot 5 */}
            <div className="w-full max-w-[460px] mb-3 flex items-center justify-between px-4 py-2 bg-[#f2f4f6] rounded-lg shadow-xs border border-gray-200">
              <div className="flex items-center gap-1.5 text-[#434655] text-xs">
                <span className="material-symbols-outlined text-[15px] text-[#004ac6]">tune</span>
                <span className="font-medium">Interactive Demo Modes:</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDemoState('default')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    demoState === 'default'
                      ? 'bg-white text-[#004ac6] font-semibold shadow-xs'
                      : 'text-[#434655] hover:text-[#191c1e]'
                  }`}
                >
                  Default
                </button>
                <button
                  type="button"
                  onClick={() => setDemoState('error')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    demoState === 'error'
                      ? 'bg-white text-red-600 font-semibold shadow-xs'
                      : 'text-[#434655] hover:text-[#191c1e]'
                  }`}
                >
                  Error State
                </button>
                <button
                  type="button"
                  onClick={() => setDemoState('loading')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    demoState === 'loading'
                      ? 'bg-white text-[#004ac6] font-semibold shadow-xs'
                      : 'text-[#434655] hover:text-[#191c1e]'
                  }`}
                >
                  Loading
                </button>
              </div>
            </div>

            {/* Main Login Card */}
            <div className="w-full max-w-[460px] bg-white rounded-xl shadow-md border border-[#c3c6d7]/30 overflow-hidden relative">
              <div className="p-6 md:p-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#f2f4f6] flex items-center justify-center p-1.5 shadow-2xs">
                      <img
                        alt="StockSense Logo"
                        className="w-full h-full object-contain"
                        src="https://lh3.googleusercontent.com/aida/AEtjO1UXocjtMUrIoRdmAAhm8Epl0mYW271zq4ZXxZys7SK76p4CwDIv-6HQ9ktq8SylFBe8y1LwV8bDZsCIBOzn1qdizSJ18a32TbHKUxOKSu21yNY5kRxWfl7lSzGU0jXvwNlcanWDT9lnjB7v3XVJjxQNwdW7_UKeJHcmdKq2kAY-E-Fz5j68cBociOzKEFnL8eE3wzNfUSm0_kw7EOMGuR4duYmOIZAoahRxz-IJdyV6NRJdnDaMpz5zRmU"
                      />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[16px] font-bold text-[#191c1e]">
                        Stock<span className="text-[#2563eb]">Sense</span>
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-[#d0e1fb] text-[#0b1c30] text-[11px] font-semibold">
                        v2.4
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#eceef0] text-[#434655] text-[11px] font-semibold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Online</span>
                  </div>
                </div>

                <h1 className="text-[20px] font-bold text-[#191c1e] tracking-tight">Welcome back</h1>
                <p className="text-[13px] text-[#434655] mt-1">
                  Enter your credentials to access your warehouse workspace
                </p>

                {/* Error Banner */}
                {demoState === 'error' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0 mt-0.5">
                      error
                    </span>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-red-700 leading-snug">
                        Invalid warehouse credential or password.
                      </p>
                      <p className="text-red-600/80 mt-0.5">
                        2 attempts remaining before automatic security cooldown.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="px-6 md:px-8 pb-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#191c1e] mb-1.5">
                    Work Email
                  </label>
                  <div className="relative rounded-lg">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#737686]">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="elena.vance@stocksense.io"
                      className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40 border border-transparent focus:border-[#2563eb] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#191c1e]">Password</label>
                    <button
                      type="button"
                      onClick={() => setAuthView('recovery')}
                      className="text-xs text-[#2563eb] hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative rounded-lg">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#737686]">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className={`w-full h-9 pl-9 pr-9 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40 border ${
                        demoState === 'error'
                          ? 'bg-red-50 text-red-900 border-red-300'
                          : 'bg-[#f2f4f6] text-[#191c1e] border-transparent focus:bg-white focus:border-[#2563eb]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737686] hover:text-[#191c1e]"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showLoginPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563eb] accent-[#2563eb]"
                    />
                    <span className="text-xs text-[#434655]">Remember this device for 30 days</span>
                  </label>
                </div>

                <div className="pt-1">
                  {demoState === 'loading' ? (
                    <button
                      type="button"
                      disabled
                      className="w-full h-10 bg-[#2563eb]/80 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                      <span>Signing in...</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="w-full h-10 bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <span>Sign In</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="relative py-2 flex items-center justify-center">
                  <div className="w-full h-px bg-gray-200"></div>
                  <span className="absolute px-3 bg-white text-[#434655] text-[10px] uppercase font-bold tracking-wider">
                    or continue with
                  </span>
                </div>

                {/* SSO Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      alert('Redirecting to Okta SAML 2.0 Enterprise Identity Gateway...');
                      onLoginSuccess('elena.vance@stocksense.io');
                    }}
                    className="w-full h-9 px-3 rounded-lg bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] text-xs font-medium flex items-center justify-center gap-2 border border-gray-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#2563eb]">
                      domain_verification
                    </span>
                    <span className="truncate">Okta / SAML SSO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert('Authenticating with Google Workspace Single Sign-On...');
                      onLoginSuccess('elena.vance@stocksense.io');
                    }}
                    className="w-full h-9 px-3 rounded-lg bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] text-xs font-medium flex items-center justify-center gap-2 border border-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="truncate">Google Workspace</span>
                  </button>
                </div>
              </form>

              <div className="px-6 md:px-8 py-3 bg-[#f2f4f6] text-center border-t border-gray-100">
                <p className="text-xs text-[#434655]">
                  Don't have an enterprise account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthView('signup')}
                    className="text-[#2563eb] font-semibold hover:underline ml-1"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>

            {/* Warehouse Security Badge */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[#434655]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white border border-gray-200 shadow-2xs">
                <span className="material-symbols-outlined text-[15px] text-[#505f76]">lock</span>
                <span>Protected by 256-bit TLS encryption</span>
              </div>
              <span>•</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white border border-gray-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
                <span>WH-01 Main node active</span>
                <span className="px-1 py-0.2 rounded bg-gray-100 text-[10px] font-mono">ORD</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: ACCOUNT CREATION (Screenshot 6)                        */}
        {/* ============================================================== */}
        {authView === 'signup' && (
          <div className="relative w-full max-w-[480px]">
            <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 text-[#191c1e] border border-gray-200/80">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#f2f4f6] flex items-center justify-center mb-2 shadow-xs">
                  <img
                    alt="StockSense Icon"
                    className="w-8 h-8 object-contain"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1UXocjtMUrIoRdmAAhm8Epl0mYW271zq4ZXxZys7SK76p4CwDIv-6HQ9ktq8SylFBe8y1LwV8bDZsCIBOzn1qdizSJ18a32TbHKUxOKSu21yNY5kRxWfl7lSzGU0jXvwNlcanWDT9lnjB7v3XVJjxQNwdW7_UKeJHcmdKq2kAY-E-Fz5j68cBociOzKEFnL8eE3wzNfUSm0_kw7EOMGuR4duYmOIZAoahRxz-IJdyV6NRJdnDaMpz5zRmU"
                  />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#d3e4fe] text-[#0b1c30] text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-[13px] text-[#004ac6]">domain_verification</span>
                  <span>Enterprise Provisioning</span>
                </div>
                <h1 className="text-[22px] font-bold tracking-tight text-[#191c1e] mt-1">
                  Create your StockSense account
                </h1>
                <p className="text-xs text-[#434655] max-w-sm mt-1">
                  Join your operations team on the unified, high-precision inventory ledger.
                </p>
              </div>

              {signupSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-xl text-center space-y-2 border border-emerald-200">
                  <span className="material-symbols-outlined text-[36px] text-emerald-600">verified</span>
                  <h3 className="text-sm font-bold text-emerald-900">Workspace Tenant Provisioned</h3>
                  <p className="text-xs text-emerald-700">
                    Your credentials have been authenticated. Redirecting to Austin WH-01 Main node...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3.5">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs font-semibold text-[#191c1e] flex items-center justify-between">
                      <span>Full Name</span>
                      <span className="text-[11px] text-[#737686] font-normal">Required</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#737686] pointer-events-none">
                        person
                      </span>
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Elena Vance"
                        required
                        className="w-full h-9 pl-9 pr-3 text-xs text-[#191c1e] bg-[#f2f4f6] focus:bg-white rounded-lg outline-none border border-transparent focus:border-[#2563eb] transition-all"
                      />
                    </div>
                  </div>

                  {/* Work Email */}
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs font-semibold text-[#191c1e] flex items-center justify-between">
                      <span>Work Email</span>
                      <span className="text-[11px] text-[#2563eb] flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[13px]">format_image_left</span>
                        SSO Auto-detect
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#737686] pointer-events-none">
                        mail
                      </span>
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="name@company.com"
                        required
                        className="w-full h-9 pl-9 pr-3 text-xs text-[#191c1e] bg-[#f2f4f6] focus:bg-white rounded-lg outline-none border border-transparent focus:border-[#2563eb] transition-all"
                      />
                    </div>
                  </div>

                  {/* Operational Role Selector */}
                  <div className="flex flex-col gap-1 text-left pt-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#191c1e]">Operational Role</span>
                      <span className="text-[10px] text-[#737686] uppercase font-bold tracking-wider">
                        Access Scope
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        onClick={() => setSignupRole('manager')}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                          signupRole === 'manager'
                            ? 'bg-blue-50/70 border-[#2563eb] shadow-xs'
                            : 'bg-[#f2f4f6] border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full mb-1">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              signupRole === 'manager' ? 'bg-[#2563eb] text-white' : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              signupRole === 'manager' ? 'bg-[#2563eb] text-white' : 'bg-gray-200'
                            }`}
                          >
                            {signupRole === 'manager' && (
                              <span className="material-symbols-outlined text-[12px]">check</span>
                            )}
                          </span>
                        </div>
                        <span className="block text-xs font-bold text-[#191c1e]">Inventory Manager</span>
                        <span className="block text-[10px] text-[#434655] leading-tight mt-0.5">
                          Approvals, reconciliations, full ledger audit rights.
                        </span>
                      </div>

                      <div
                        onClick={() => setSignupRole('staff')}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                          signupRole === 'staff'
                            ? 'bg-blue-50/70 border-[#2563eb] shadow-xs'
                            : 'bg-[#f2f4f6] border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full mb-1">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              signupRole === 'staff' ? 'bg-[#2563eb] text-white' : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
                          </div>
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              signupRole === 'staff' ? 'bg-[#2563eb] text-white' : 'bg-gray-200'
                            }`}
                          >
                            {signupRole === 'staff' && (
                              <span className="material-symbols-outlined text-[12px]">check</span>
                            )}
                          </span>
                        </div>
                        <span className="block text-xs font-bold text-[#191c1e]">Warehouse Staff</span>
                        <span className="block text-[10px] text-[#434655] leading-tight mt-0.5">
                          Intake scanning, picks, transfers & dock receiving.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Password with 4-bar strength meter */}
                  <div className="flex flex-col gap-1 text-left pt-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-[#191c1e]">Password</label>
                      <span className="text-emerald-700 flex items-center gap-1 font-medium text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                        {passwordScore >= 4 ? 'Strong password' : passwordScore >= 2 ? 'Fair' : 'Weak'}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#737686] pointer-events-none">
                        lock
                      </span>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                        className="w-full h-9 pl-9 pr-10 text-xs text-[#191c1e] bg-[#f2f4f6] focus:bg-white rounded-lg outline-none border border-transparent focus:border-[#2563eb] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-2.5 text-[#737686] hover:text-[#191c1e]"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showSignupPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>

                    {/* 4 strength bars */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <div
                        className={`h-1 rounded-full transition-all ${
                          passwordScore >= 1 ? 'bg-emerald-600' : 'bg-gray-200'
                        }`}
                      ></div>
                      <div
                        className={`h-1 rounded-full transition-all ${
                          passwordScore >= 2 ? 'bg-emerald-600' : 'bg-gray-200'
                        }`}
                      ></div>
                      <div
                        className={`h-1 rounded-full transition-all ${
                          passwordScore >= 3 ? 'bg-emerald-600' : 'bg-gray-200'
                        }`}
                      ></div>
                      <div
                        className={`h-1 rounded-full transition-all ${
                          passwordScore >= 4 ? 'bg-emerald-600' : 'bg-gray-200'
                        }`}
                      ></div>
                    </div>
                    <span className="text-[10px] text-[#434655]">
                      Min. 8 chars, including mixed casing & security symbols
                    </span>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1 text-left">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-[#191c1e]">Confirm Password</label>
                      {passwordsMatch && (
                        <span className="text-emerald-700 flex items-center gap-1 font-medium text-[11px]">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Passwords match
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#737686] pointer-events-none">
                        lock_reset
                      </span>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                        className="w-full h-9 pl-9 pr-10 text-xs text-[#191c1e] bg-[#f2f4f6] focus:bg-white rounded-lg outline-none border border-transparent focus:border-[#2563eb] transition-all"
                      />
                      {passwordsMatch && (
                        <span className="absolute right-3 text-emerald-600">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="pt-1 text-left">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => {
                          setTermsAccepted(e.target.checked);
                          if (e.target.checked) setTermsError(false);
                        }}
                        className="mt-0.5 h-4 w-4 rounded accent-[#2563eb]"
                      />
                      <span className="text-xs text-[#434655] leading-snug">
                        I agree to the StockSense{' '}
                        <a href="#" className="text-[#004ac6] hover:underline font-medium">
                          Master Services Agreement
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-[#004ac6] hover:underline font-medium">
                          Privacy Policy
                        </a>
                        .
                      </span>
                    </label>
                    {termsError && (
                      <p className="text-[11px] text-red-600 mt-1">
                        You must accept the Master Services Agreement to continue.
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-10 bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <span>Create Account</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>

                  <div className="text-center pt-1 text-xs text-[#434655]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="text-[#004ac6] font-semibold hover:underline ml-1"
                    >
                      Log in
                    </button>
                  </div>
                </form>
              )}

              {/* Organization domain notice */}
              <div className="mt-4 pt-3 bg-[#f2f4f6] rounded-lg p-2.5 flex items-center gap-2 text-left border border-gray-100">
                <span className="material-symbols-outlined text-[#2563eb] text-[20px] flex-shrink-0">
                  hub
                </span>
                <div className="min-w-0 text-xs">
                  <p className="font-semibold text-[#191c1e] truncate">
                    Organization domain verified for auto-provisioning
                  </p>
                  <p className="text-[11px] text-[#434655] truncate">
                    New accounts are automatically associated with active company tenant clusters.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: CREDENTIAL RECOVERY & DUAL-FACTOR CHALLENGE (Screen 7) */}
        {/* ============================================================== */}
        {authView === 'recovery' && (
          <div className="w-full max-w-6xl mx-auto py-2">
            {/* Notification Banner */}
            <div className="mb-4 mx-auto w-full max-w-2xl bg-white shadow-xs rounded-lg p-3 flex items-center justify-between gap-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563eb] text-[18px]">verified</span>
                <span className="text-xs text-[#191c1e]">
                  {feedbackMsg}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#434655] font-tabular">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Session #SS-9241</span>
              </div>
            </div>

            {/* 3-Step Milestone Progress Bar */}
            <div className="w-full bg-white rounded-xl shadow-xs p-4 md:p-6 mb-6 border border-gray-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#004ac6]">
                      Enterprise Access Control
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#f2f4f6] text-[#434655] text-xs">
                      Self-Service Recovery
                    </span>
                  </div>
                  <h1 className="text-[20px] font-bold text-[#191c1e] tracking-tight mt-0.5">
                    Credential Recovery & Dual-Factor Challenge
                  </h1>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#434655] bg-[#f2f4f6] px-3 py-1.5 rounded-lg border border-gray-200">
                  <span className="material-symbols-outlined text-[16px] text-[#4d556b]">history</span>
                  <span>Standard ISO/IEC 27001 Protocol</span>
                </div>
              </div>

              {/* 3 Milestones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f2f4f6]/70 border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold">
                      Step 1 • Complete
                    </p>
                    <p className="text-xs font-semibold text-[#191c1e] truncate">Account Identification</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/70 border border-blue-200">
                  <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0">
                    2
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] uppercase tracking-wider text-[#004ac6] font-bold">
                        Step 2 • Active
                      </p>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></span>
                    </div>
                    <p className="text-xs font-semibold text-[#191c1e] truncate">Multi-Factor OTP</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f2f4f6]/40 opacity-75 border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs flex-shrink-0 font-medium">
                    3
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-[#434655] font-medium">
                      Step 3 • Next
                    </p>
                    <p className="text-xs font-medium text-[#434655] truncate">Set Strong Password</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Account Lookup Completed Card */}
              <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                      Step 1 • Completed
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                  </div>
                  <h2 className="text-sm font-bold text-[#191c1e] mb-1">Account Lookup</h2>
                  <p className="text-xs text-[#434655] mb-3">
                    Validated directory match in Logistiq Supply Chain portal.
                  </p>
                  <div className="space-y-3 mb-3">
                    <div>
                      <label className="block text-[11px] text-[#434655] mb-1 font-medium">
                        Corporate Email
                      </label>
                      <div className="w-full px-3 py-1.5 rounded-lg bg-[#f2f4f6] text-[#191c1e] text-xs flex items-center justify-between border border-gray-200">
                        <span className="truncate">e.vance@logistiq.com</span>
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#434655] mb-1 font-medium">
                        Target Directory
                      </label>
                      <div className="px-3 py-1.5 rounded-lg bg-[#f2f4f6] text-[#434655] text-xs flex items-center gap-1.5 border border-gray-200">
                        <span className="material-symbols-outlined text-[15px]">domain</span>
                        <span className="truncate">US-East Supply Logistics AD</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('Editing identity will invalidate currently dispatched OTP.')}
                    className="w-full py-2 px-3 rounded-lg bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Edit Account ID</span>
                  </button>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-2 text-[#004ac6]">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                    <span className="text-xs font-bold">StockSense Safeguard</span>
                  </div>
                  <p className="text-xs text-[#434655] leading-relaxed">
                    Temporary OTP hashes expire permanently upon consumption or timeout. Maximum 5 attempts
                    allowed per 15-minute challenge window.
                  </p>
                </div>
              </div>

              {/* Center Column: OTP Action Hero Card */}
              <div className="lg:col-span-6 order-1 lg:order-2">
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-gray-200 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-[#2563eb]"></div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563eb] shadow-sm mb-4">
                      <span className="material-symbols-outlined text-[30px]">shield_with_heart</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#004ac6] text-[10px] uppercase font-bold tracking-wider mb-2">
                      Step 2 of 3 • Action Required
                    </span>
                    <h2 className="text-[24px] font-bold text-[#191c1e] tracking-tight mb-2">
                      Enter verification code
                    </h2>
                    <p className="text-xs text-[#434655] max-w-md mx-auto mb-6">
                      We sent a 6-digit one-time code to{' '}
                      <strong className="text-[#191c1e]">e.vance@logistiq.com</strong>. Enter it below to
                      verify your enterprise identity.
                    </p>
                  </div>

                  <form onSubmit={handleOtpVerify} className="space-y-6">
                    {/* 6 Boxed OTP Digits */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-box-${idx}`}
                          type="text"
                          maxLength={1}
                          pattern="[0-9]"
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          placeholder={idx === 5 ? '•' : ''}
                          className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-lg border-2 transition-all focus:outline-none shadow-xs font-mono ${
                            idx === 5
                              ? 'border-[#2563eb] bg-white text-[#2563eb]'
                              : digit
                              ? 'border-gray-300 bg-white text-[#191c1e]'
                              : 'border-gray-200 bg-[#f2f4f6]'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Timer & Resend */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#f2f4f6] p-3 rounded-lg text-xs">
                      <div className="flex items-center gap-2 text-[#434655] font-tabular">
                        <span className="material-symbols-outlined text-[18px] text-[#505f76]">schedule</span>
                        <span>
                          Valid for{' '}
                          <strong className="text-[#191c1e]">
                            0:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#434655]">Didn't receive code?</span>
                        <button
                          type="button"
                          disabled={!resendActive}
                          onClick={handleResendOtp}
                          className={`font-semibold ${
                            resendActive
                              ? 'text-[#2563eb] hover:underline cursor-pointer'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Resend OTP
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-2">
                      <button
                        type="submit"
                        className={`w-full h-11 px-6 rounded-lg text-white text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 ${
                          recoveryVerified
                            ? 'bg-emerald-600'
                            : 'bg-[#2563eb] hover:bg-[#004ac6]'
                        }`}
                      >
                        <span>
                          {recoveryVerified ? 'Code Confirmed! Proceeding...' : 'Verify & Continue'}
                        </span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>

                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setAuthView('login')}
                          className="inline-flex items-center gap-1 text-xs text-[#505f76] hover:text-[#191c1e] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                          <span>Return to Enterprise Login</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* FIDO2 physical key */}
                  <div className="mt-6 pt-3 flex items-center justify-between text-xs text-[#434655] bg-[#f2f4f6] -mx-6 md:-mx-8 -mb-6 md:-mb-8 px-6 md:px-8 py-3 border-t border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#004ac6]">key</span>
                      <span>Use FIDO2 / YubiKey physical key instead</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('FIDO2 WebAuthn prompt activated: Insert security key into USB port...')}
                      className="text-[#2563eb] font-semibold hover:underline"
                    >
                      Switch Method
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Step 3 Preview Card */}
              <div className="lg:col-span-3 flex flex-col gap-4 order-3">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 opacity-90">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-[#434655] text-[10px] font-bold uppercase tracking-wider">
                      Step 3 • Preview
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-gray-400">hourglass_empty</span>
                  </div>
                  <h2 className="text-sm font-bold text-[#191c1e] mb-1">Set New Password</h2>
                  <p className="text-xs text-[#434655] mb-3">Next up after 6-digit confirmation.</p>

                  <div className="space-y-3 mb-3 pointer-events-none opacity-80">
                    <div>
                      <label className="block text-[11px] text-[#434655] mb-1 font-medium">New Password</label>
                      <div className="w-full px-3 py-2 rounded-lg bg-[#f2f4f6] text-[#434655] text-xs flex items-center justify-between border border-gray-200 font-mono">
                        <span>••••••••••••</span>
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#434655] mb-1 font-medium">
                        Confirm New Password
                      </label>
                      <div className="w-full px-3 py-2 rounded-lg bg-[#f2f4f6] text-[#434655] text-xs flex items-center justify-between border border-gray-200 font-mono">
                        <span>••••••••••••</span>
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f2f4f6] rounded-lg p-3 mb-3 border border-gray-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#434655] mb-2">
                      Policy Requirements
                    </p>
                    <ul className="space-y-1.5 text-xs text-[#434655]">
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <span className="material-symbols-outlined text-[15px]">check_circle</span>
                        <span>At least 12 characters</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <span className="material-symbols-outlined text-[15px]">check_circle</span>
                        <span>1+ uppercase & 1+ number</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-gray-500">
                        <span className="material-symbols-outlined text-[15px]">radio_button_unchecked</span>
                        <span>1+ special character (!@#$)</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed"
                  >
                    Update Password
                  </button>
                </div>

                <div className="bg-[#f2f4f6] rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#505f76]">support_agent</span>
                    <span className="text-xs font-bold text-[#191c1e]">Need IT Dispatch?</span>
                  </div>
                  <p className="text-xs text-[#434655] mb-2">
                    Locked out of multi-factor device? Request emergency unlock from the warehouse admin desk.
                  </p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('IT Dispatch Support Ticket #TIC-8841 generated.');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#2563eb] font-semibold hover:underline"
                  >
                    <span>Contact SysAdmin Desk</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer matching Screenshot 5 & 6 */}
      <footer className="relative z-10 w-full bg-white/60 backdrop-blur-xs border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#434655]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#505f76]">shield_lock</span>
            <span>SOC 2 Type II Certified • 256-bit TLS Encryption • FIPS 140-2</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <a href="#" className="hover:text-[#191c1e]">Privacy Policy</a>
              <a href="#" className="hover:text-[#191c1e]">Terms of Service</a>
              <a href="#" className="hover:text-[#191c1e]">Security Whitepaper</a>
            </nav>
            <span className="font-mono text-[11px] text-gray-400">© 2025 StockSense Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

