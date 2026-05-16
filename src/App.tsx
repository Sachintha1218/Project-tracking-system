import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { Search, Loader2, Compass, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, User, Waypoints, Vault, Gauge, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dashboard, type ProjectData } from './components/Dashboard';
import { FloatingIndustryElement, CodeBrackets, CloudNode, TechCircuit, Megaphone, GrowthChart, MarketingTarget } from './components/IndustryIcons';
import TypingHint from './components/TypingHint';
import { client } from './lib/sanity';
import { getSessionValue, setSessionValue, removeSessionValue } from './lib/cookie';

type Step = 'lookup' | 'password' | 'dashboard';

const PROJECT_LOOKUP_QUERY = `*[_type == "project" && projectId.current == $id][0]{ 
  _id, 
  title, 
  clientName 
}`;

const PROJECT_FULL_QUERY = `*[_type == "project" && projectId.current == $id][0]{
  "_id": _id,
  "id": projectId.current,
  title,
  clientName,
  category,
  status,
  progress,
  password,
  "milestones": milestones[]{
    "id": _key,
    "_key": _key,
    title,
    status,
    startDate,
    endDate,
    clientComment,
    "materials": materials[]{
      "id": _key,
      "_key": _key,
      fileName,
      uploadedBy,
      "fileUrl": file.asset->url,
      "assetId": file.asset->_id
    }
  }
}`;

function App() {
  const [step, setStep] = useState<Step>('lookup');
  const [projectId, setProjectId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [projectPreview, setProjectPreview] = useState<{ title: string; clientName: string } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Persistence: Check for saved credentials on mount
  const performLogin = useCallback(async (id: string, pw: string) => {
    setLoading(true);
    setError('');
    try {
      const project = await client.fetch(PROJECT_FULL_QUERY, { id: id.trim() });
      if (project && project.password === pw) {
        const { password: _pw, ...safeProject } = project;
        setProjectData(safeProject as ProjectData);
        setStep('dashboard');
      } else {
        // If saved credentials are no longer valid, clear them
        handleReset();
      }
    } catch (err) {
      console.error('Auto-login failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedId = getSessionValue('prj_auth_id');
    const savedPw = getSessionValue('prj_auth_pw');

    if (savedId && savedPw) {
      setProjectId(savedId);
      setPassword(savedPw);
      performLogin(savedId, savedPw).finally(() => {
        setIsInitializing(false);
      });
    } else {
      setIsInitializing(false);
    }
  }, [performLogin]);

  // Typing hint behaviour: attach to any visible .search-pill .typing and restart when `step` changes
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // leave this effect in place as a safety fallback — main hint is rendered via TypingHint component
    return () => { cleanups.forEach(fn => fn()); };
  }, [step]);

  // Refs for inputs to pass to TypingHint
  const projectInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  // Step 1: Check that the project ID exists
  const handleIdSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId.trim()) {
      setError('Please enter a Project ID');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await client.fetch(PROJECT_LOOKUP_QUERY, { id: projectId.trim() });
      if (!result) throw new Error('Project not found. Please check your Project ID.');
      setProjectPreview({ title: result.title, clientName: result.clientName });
      setStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify password and fetch full project data
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const project = await client.fetch(PROJECT_FULL_QUERY, { id: projectId.trim() });
      if (!project) throw new Error('Project not found.');
      if (project.password !== password) throw new Error('Incorrect password. Please try again.');
      
      // Save credentials for session persistence
      setSessionValue('prj_auth_id', projectId.trim());
      setSessionValue('prj_auth_pw', password);

      const { password: _pw, ...safeProject } = project;
      setProjectData(safeProject as ProjectData);
      setStep('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    removeSessionValue('prj_auth_id');
    removeSessionValue('prj_auth_pw');
    setProjectData(null);
    setProjectPreview(null);
    setProjectId('');
    setPassword('');
    setError('');
    setShowPassword(false);
    setStep('lookup');
  };

  const handleBackToId = () => {
    setPassword('');
    setError('');
    setShowPassword(false);
    setStep('lookup');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent selection:bg-primary-blue selection:text-white">
      {/* ── Animated Background ── */}

      {/* Full-viewport animated gradient (soft, behind other bg elements) */}
      <div className="absolute inset-0 -z-20 animated-gradient" aria-hidden="true" />

      {/* Animated Scrolling Dot Grid */}
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '32px 32px'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#4A90E2 2px, transparent 2px)', backgroundSize: '32px 32px' }}
      />

      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none animate-scanline" 
           style={{ backgroundImage: 'linear-gradient(rgba(74, 144, 226, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(74, 144, 226, 0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }} 
      />

      {/* Dynamic Flowing Glowing Orbs / Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <motion.div
          animate={{ x: ['-20%', '20%', '-20%'], y: ['-20%', '10%', '-20%'], scale: [1, 1.05, 1] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[300px] h-[300px] sm:w-[800px] sm:h-[800px] rounded-full blur-[80px] sm:blur-[150px] -z-10"
          style={{ backgroundColor: 'rgba(74,144,226,0.06)' }}
        />
        <motion.div
          animate={{ x: ['20%', '-20%', '20%'], y: ['20%', '-10%', '20%'], scale: [1, 1.08, 1] }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[250px] h-[250px] sm:w-[700px] sm:h-[700px] rounded-full blur-[80px] sm:blur-[150px] -z-10"
          style={{ backgroundColor: 'rgba(124,58,237,0.04)' }}
        />
        <motion.div
          animate={{ x: ['-10%', '10%', '-10%'], y: ['-10%', '20%', '-10%'], scale: [1, 1.05, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-0 right-10 w-[200px] h-[200px] sm:w-[500px] sm:h-[500px] rounded-full blur-[100px] -z-10"
          style={{ backgroundColor: 'rgba(124,58,237,0.03)' }}
        />
        <motion.div
          animate={{ x: ['10%', '-30%', '10%'], y: ['-10%', '30%', '-10%'], scale: [1.05, 1, 1.05] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-0 sm:left-1/4 w-[200px] h-[200px] sm:w-[500px] sm:h-[500px] rounded-full blur-[70px] sm:blur-[120px] -z-10"
          style={{ backgroundColor: 'rgba(6,182,212,0.04)' }}
        />
      </div>

      

      {/* --- Digital Industry Floating Elements --- */}
      <FloatingIndustryElement 
        className="absolute top-[15%] left-[10%] w-12 h-12 text-blue-400 opacity-20 hidden lg:block industry-glow-blue"
        delay={1}
        duration={12}
      >
        <CodeBrackets />
      </FloatingIndustryElement>

      <FloatingIndustryElement 
        className="absolute top-[40%] right-[15%] w-16 h-16 text-purple-400 opacity-15 hidden lg:block industry-glow-purple"
        delay={3}
        duration={15}
        y={[0, 40, 0]}
        rotate={[0, -20, 0]}
      >
        <CloudNode />
      </FloatingIndustryElement>

      <FloatingIndustryElement 
        className="absolute bottom-[20%] left-[20%] w-14 h-14 text-teal-400 opacity-10 hidden lg:block"
        delay={5}
        duration={18}
      >
        <TechCircuit />
      </FloatingIndustryElement>

      {/* --- Marketing Industry Floating Elements --- */}
      <FloatingIndustryElement 
        className="absolute top-[25%] right-[25%] w-10 h-10 text-orange-400 opacity-20 hidden lg:block"
        delay={2}
        duration={14}
        rotate={[0, 45, 0]}
      >
        <Megaphone />
      </FloatingIndustryElement>

      <FloatingIndustryElement 
        className="absolute bottom-[35%] left-[5%] w-12 h-12 text-green-400 opacity-15 hidden lg:block"
        delay={4}
        duration={16}
        scale={[1, 1.2, 1]}
      >
        <GrowthChart />
      </FloatingIndustryElement>

      <FloatingIndustryElement 
        className="absolute top-[60%] left-[-2%] w-14 h-14 text-red-400 opacity-10 hidden lg:block"
        delay={6}
        duration={20}
      >
        <MarketingTarget />
      </FloatingIndustryElement>

      <nav className="relative z-10 w-full px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center cursor-pointer" onClick={handleReset}>
          <img src="/logo.png" alt="Sisenco Digital" className="h-12 sm:h-16 w-auto object-contain drop-shadow-sm" />
        </div>
        {step === 'dashboard' && (
          <button
            onClick={handleReset}
            className="text-xs sm:text-sm font-medium text-gray-500 hover:text-dark-slate transition-colors"
          >
            Find Another
          </button>
        )}
      </nav>

      <main className="relative z-10 w-full px-4 pt-8 pb-20">
        <AnimatePresence mode="wait">
          {isInitializing ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-2 border-blue-100/50 border-t-primary-blue shadow-lg shadow-blue-100/20"
                />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <motion.img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-full h-auto object-contain"
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
              <p className="mt-8 text-dark-slate font-black text-xs tracking-[0.2em] uppercase opacity-40">
                Loading...
              </p>
            </motion.div>
          ) : (
            <>
          {/* ── STEP 1: Project ID ── */}
          {step === 'lookup' && (
            <motion.div
              key="lookup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-xl mx-auto mt-10 sm:mt-20 relative z-10"
            >
              {/* ── Creative Hero Graphics ── */}
              <motion.div
                animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -left-6 sm:-top-20 sm:-left-32 w-24 h-24 sm:w-48 sm:h-48 -z-10 pointer-events-none opacity-40 sm:opacity-80"
              >
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="100" cy="100" r="80" fill="url(#paint0_radial)" />
                  <path d="M160 60C160 82.0914 142.091 100 120 100C97.9086 100 80 82.0914 80 60" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.3" filter="blur(2px)"/>
                  <circle cx="80" cy="70" r="15" fill="white" opacity="0.4" filter="blur(4px)"/>
                  <defs>
                    <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(70 60) rotate(45) scale(120)">
                      <stop stopColor="#93C5FD"/>
                      <stop offset="0.6" stopColor="#3B82F6"/>
                      <stop offset="1" stopColor="#1E3A8A"/>
                    </radialGradient>
                  </defs>
                </svg>
              </motion.div>

              

              <motion.div animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-2 right-4 sm:-top-6 sm:right-10 text-primary-blue pointer-events-none w-4 h-4 sm:w-6 sm:h-6 opacity-60 sm:opacity-100">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor"/></svg>
              </motion.div>
              <motion.div animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.9, 1.5, 0.9] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute bottom-8 -left-4 sm:bottom-16 sm:-left-12 text-teal-400 pointer-events-none w-3 h-3 sm:w-4 sm:h-4 opacity-70 sm:opacity-100">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor"/></svg>
              </motion.div>

              {/* Hero card with embedded search (desktop) */}
              <div className="hero-card max-w-xl mx-auto mt-6 sm:mt-10 relative z-10">
                {/* Animated Robot Mascot */}
                <motion.div
                  initial={{ y: 0, scale: 1 }}
                  animate={{ y: [0, -18, 0], scale: [1, 1.04, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex justify-center mb-2"
                  style={{ zIndex: 10 }}
                >
                  <img
                    src="/robot-mascot2.png"
                    alt="Robot Mascot"
                    style={{ width: 96, height: 96, objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(74,144,226,0.10))' }}
                  />
                </motion.div>
                <h1 className="hero-title hero-title-large">
                  Track your <span className="gradient-text">project</span>.
                </h1>
                <p className="hero-sub mt-3">Elevate your workflow. Measure every milestone live with Sisenco Digital.</p>

                <div className="search-wrapper">
                  {/* Desktop search pill */}
                  <form onSubmit={handleIdSubmit} className="hidden sm:block">
                    <div className={`search-pill ${projectId ? 'input-has-value' : ''}`}>
                      <div className="search-icon">
                          <Search size={18} />
                        </div>
                      <TypingHint hint="Type your Project ID" inputRef={projectInputRef} />
                      <input
                        type="text"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="search-input"
                        ref={projectInputRef}
                        aria-label="Project ID"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="search-arrow"
                        aria-label="Continue"
                      >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowRight size={18} />}
                      </button>
                    </div>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-center mt-4 font-medium text-sm">{error}</motion.p>
                    )}
                  </form>

                  {/* Mobile fallback: stacked input transformed into a pill with circular arrow CTA */}
                  <form onSubmit={handleIdSubmit} className="sm:hidden mt-4">
                    <div className={`mobile-stack search-pill relative ${projectId ? 'input-has-value' : ''}`}>
                      <div className="search-icon">
                        <Search size={18} />
                      </div>
                      <TypingHint hint="Type your Project ID" inputRef={projectInputRef} />
                      <input
                        type="text"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="search-input"
                        ref={projectInputRef}
                        aria-label="Project ID"
                      />
                      <button type="submit" disabled={loading} className="search-arrow" aria-label="Continue">
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowRight size={18} />}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              

              {/* Decorative Features / Stats for the bottom area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0 opacity-90 relative"
              >

                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-2xl shadow-gray-200/40 flex flex-col items-center text-center group hover:-translate-y-2 hover:bg-white/80 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100/50 text-primary-blue flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Waypoints size={20} strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-bold text-dark-slate mb-1.5">Tracking Advantages</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">Optimize workflows with real-time data and complete transparency.</p>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-2xl shadow-gray-200/40 flex flex-col items-center text-center group hover:-translate-y-2 hover:bg-white/80 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100/50 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Vault size={20} strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-bold text-dark-slate mb-1.5">Enterprise Security</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">Protect your sensitive data with enterprise-grade encryption.</p>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-2xl shadow-gray-200/40 flex flex-col items-center text-center group hover:-translate-y-2 hover:bg-white/80 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100/50 text-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Gauge size={20} strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-bold text-dark-slate mb-1.5">Delivery Precision</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">Ensure on-time delivery with real-time milestone monitoring.</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 2: Password ── */}
          {step === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-md mx-auto mt-10 sm:mt-20"
            >
              <div className="hero-card rounded-3xl p-8 sm:p-10">
                  <div className="flex justify-center mb-6 relative">
                    <div className="w-16 h-16 rounded-2xl bg-white/6 border border-white/6 flex items-center justify-center shadow-inner relative z-10">
                      <Lock className="w-7 h-7 text-white" strokeWidth={1.6} />
                    </div>
                  </div>

                  <div className="text-center mb-7">
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Enter Password</h2>
                    <div className="bg-white/6 rounded-2xl p-4 mb-4 border border-white/8">
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{color:'rgba(210,220,235,0.6)'}}>Accessing Project</p>
                      <p className="text-white text-base sm:text-lg font-bold leading-tight mb-2">{projectPreview?.title}</p>
                      <div className="flex items-center justify-center gap-1.5 text-white bg-white/3 py-1.5 px-3 rounded-full w-fit mx-auto border border-white/6">
                        <User size={14} strokeWidth={2.5} />
                        <span className="text-xs font-bold uppercase tracking-wide">{projectPreview?.clientName}</span>
                      </div>
                    </div>
                    <p className="text-white text-sm font-medium leading-relaxed">
                      Access to project <span className="font-bold">{projectId}</span> is protected.
                      <br />Please enter your password to continue.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className={`search-pill ${password ? 'input-has-value' : ''}`}>
                    <div className="search-icon">
                      <Lock size={16} />
                    </div>
                    <TypingHint hint="Enter your password" inputRef={passwordInputRef} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                        className="search-input"
                        aria-label="Password"
                        placeholder="Enter your password"
                        ref={passwordInputRef}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="pill-eye"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>

                      <button type="submit" disabled={loading} className="search-arrow" aria-label="Continue">
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowRight size={18} />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p key="pw-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm font-medium text-center">{error}</motion.p>
                      )}
                    </AnimatePresence>

                  </form>

                  <button type="button" onClick={handleBackToId} className="mt-5 w-full flex items-center justify-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors font-medium">
                    <ArrowLeft size={15} />
                    Change Project ID
                  </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Dashboard ── */}
          {step === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Dashboard data={projectData!} />
            </motion.div>
          )}

            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
