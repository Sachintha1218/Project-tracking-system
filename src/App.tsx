import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Search, Loader2, Compass, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, User, Route, LineChart, Users } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Dashboard, type ProjectData } from './components/Dashboard';
import { FloatingIndustryElement, CodeBrackets, CloudNode, TechCircuit, Megaphone, GrowthChart, MarketingTarget } from './components/IndustryIcons';
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

  // --- Interactive Mouse Tracking ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Normalize coordinates around the center of the screen
    mouseX.set(clientX - innerWidth / 2);
    mouseY.set(clientY - innerHeight / 2);
  }, [mouseX, mouseY]);

  // Parallax offsets
  const mascotX = useTransform(smoothMouseX, [-1000, 1000], [-50, 50]);
  const mascotY = useTransform(smoothMouseY, [-1000, 1000], [-50, 50]);
  const mascotRotate = useTransform(smoothMouseX, [-1000, 1000], [-10, 10]);
  
  const titleX = useTransform(smoothMouseX, [-1000, 1000], [-10, 10]);
  const titleY = useTransform(smoothMouseY, [-1000, 1000], [-10, 10]);

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
    <div 
      className="min-h-screen relative overflow-hidden bg-[#ffffff] selection:bg-primary-blue selection:text-white"
      onMouseMove={handleMouseMove}
    >
      {/* ── Animated Background ── */}

      {/* ── Background ── */}

      {/* --- Robot Background Mascots (Semi-transparent) --- */}
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[30%] w-40 h-40 pointer-events-none -z-10 grayscale"
      >
        <img src="/robot-mascot.png" alt="" className="w-full h-full object-contain" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 40, 0], x: [0, 20, 0], opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[10%] left-[15%] w-48 h-48 pointer-events-none -z-10 grayscale"
      >
        <img src="/robot-mascot.png" alt="" className="w-full h-full object-contain" />
      </motion.div>

      <motion.div
        animate={{ rotate: [0, 10, 0], opacity: [0.04, 0.06, 0.04] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute top-[50%] left-[5%] w-32 h-32 pointer-events-none -z-10 grayscale"
      >
        <img src="/robot-mascot.png" alt="" className="w-full h-full object-contain" />
      </motion.div>

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
          {/* ── STEP 1: Projec          {/* ── STEP 1: Project ID ── */}
          {step === 'lookup' && (
            <motion.div
              key="lookup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full min-h-[70vh] flex flex-col items-center justify-center relative z-10 px-4 mt-8 lg:mt-12"
            >
              {/* CENTERED HERO SECTION - DARK BLUE RECTANGLE */}
              <div className="relative z-10 flex flex-col items-center max-w-3xl w-full pt-20 lg:pt-32">
                
                {/* Mascot floating in front of the dark blue card */}
                <div className="absolute -top-10 right-0 sm:-top-16 sm:-right-8 md:-top-24 md:-right-12 lg:-top-32 lg:-right-20 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[250px] md:h-[250px] lg:w-[320px] lg:h-[320px] pointer-events-none z-20 opacity-100">
                  <motion.div 
                    style={{ x: mascotX, y: mascotY, rotate: mascotRotate }}
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-full h-full p-4"
                  >
                    <img src="/robot-mascot.png" alt="Sisenco Mascot" className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.2)]" />
                  </motion.div>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="w-full max-w-2xl mx-auto bg-[#0A192F] p-8 md:p-12 rounded-[2rem] shadow-[0_20px_50px_rgba(10,25,47,0.5)] border border-[#1E2D4A] mb-10 text-center"
                >
                  <motion.div 
                    style={{ x: titleX, y: titleY }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8"
                  >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight drop-shadow-sm mb-4">
                      Track your project.
                    </h1>
                    <p className="text-blue-200 text-base md:text-lg leading-relaxed max-w-xl mx-auto opacity-90">
                      Enter your Project ID. See everything.
                    </p>
                  </motion.div>

                  {/* Desktop form */}
                  <form onSubmit={handleIdSubmit} className="hidden sm:block relative w-full mb-2">
                    <div className="relative flex items-center">
                      <div className="absolute left-6 text-gray-400">
                        <Search size={24} />
                      </div>
                      <input
                        type="text"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        placeholder="e.g. SDPR0000"
                        className="w-full pl-16 pr-40 py-6 text-lg bg-white/10 rounded-full outline-none focus:ring-2 focus:ring-primary-blue transition-all font-medium text-white placeholder-gray-400 border border-white/10"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 bottom-2 px-8 bg-primary-blue text-white font-bold rounded-full hover:bg-blue-500 active:scale-95 transition-all shadow-lg flex items-center justify-center disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed text-base"
                      >
                        {loading ? <Loader2 className="animate-spin w-5 h-5 mx-2" /> : 'Track Project'}
                      </button>
                    </div>
                  </form>

                  {/* Mobile form */}
                  <form onSubmit={handleIdSubmit} className="sm:hidden flex flex-col gap-3">
                    <div className="relative flex items-center bg-white/10 rounded-2xl border border-white/10">
                      <div className="absolute left-4 text-gray-400">
                        <Search size={20} />
                      </div>
                      <input
                        type="text"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        placeholder="e.g. SDPR1001"
                        className="w-full pl-12 pr-4 py-4 text-base bg-transparent rounded-2xl outline-none font-medium text-white placeholder-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary-blue text-white font-bold rounded-2xl hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-base"
                    >
                      {loading ? (
                        <><Loader2 className="animate-spin w-5 h-5" /> Searching...</>
                      ) : (
                        <><Compass className="w-5 h-5" /> Track Project</>
                      )}
                    </button>
                  </form>
                </motion.div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 font-medium text-sm text-center -mt-6 mb-8 z-20 relative">
                    {error}
                  </motion.p>
                )}
              </div>

              {/* BOTTOM FEATURE GRID */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="w-full max-w-5xl relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center pb-8 px-4"
              >
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center cursor-default transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary-blue flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Route size={24} strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-dark-slate mb-3">Campaign Tracking</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    From brief to launch, track every milestone, deadline, deliverable, and approval — all in one place.
                  </p>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center cursor-default transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <LineChart size={24} strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-dark-slate mb-3">Performance Analytics</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Get live updates on ad spend, clicks, and conversions across all campaigns, turning real-time data into smarter, faster decisions.
                  </p>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center cursor-default transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Users size={24} strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-dark-slate mb-3">Team Collaboration</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Assign tasks, log revisions, share creative assets, and comment on milestones — keeping your SEO, paid, and social teams aligned without the email chaos.
                  </p>
                </motion.div>
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
              className="w-full max-w-md mx-auto mt-20 sm:mt-32 relative"
            >
              {/* Mascot floating in front of the dark blue card */}
              <div className="absolute -top-16 -right-8 w-32 h-32 sm:-top-20 sm:-right-12 sm:w-40 sm:h-40 pointer-events-none z-20 opacity-100 hidden sm:block">
                <motion.div
                  style={{ x: mascotX, y: mascotY, rotate: mascotRotate }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-full h-full"
                >
                  <img 
                    src="/robot-mascot.png" 
                    alt="Robot security" 
                    className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.2)]" 
                  />
                </motion.div>
              </div>

              <div className="bg-[#0A192F] rounded-[2rem] shadow-[0_20px_50px_rgba(10,25,47,0.5)] border border-[#1E2D4A] p-8 sm:p-10 relative z-10">
                <div className="flex justify-center mb-6 relative">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-inner relative z-10">
                    <Lock className="w-7 h-7 text-white" strokeWidth={1.8} />
                  </div>
                </div>

                <div className="text-center mb-7">
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Enter Password</h2>
                  <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                    <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Accessing Project</p>
                    <p className="text-white text-base sm:text-lg font-bold leading-tight mb-2">{projectPreview?.title}</p>
                    <div className="flex items-center justify-center gap-1.5 text-primary-blue bg-primary-blue/20 py-1.5 px-3 rounded-full w-fit mx-auto border border-primary-blue/30">
                      <User size={14} strokeWidth={2.5} />
                      <span className="text-xs font-bold uppercase tracking-wide">{projectPreview?.clientName}</span>
                    </div>
                  </div>
                  <p className="text-blue-200/80 text-xs font-medium leading-relaxed">
                    Access to project <span className="font-bold text-white">{projectId}</span> is protected.
                    <br />Please enter your password to continue.
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoFocus
                      className="w-full pl-5 pr-12 py-4 text-base bg-white/10 border border-white/10 rounded-2xl outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue transition-all font-medium text-white placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        key="pw-error"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-sm font-medium text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-blue text-white font-bold rounded-2xl hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-base mt-2"
                  >
                    {loading ? (
                      <><Loader2 className="animate-spin w-5 h-5" /> Verifying...</>
                    ) : (
                      <><ShieldCheck className="w-5 h-5" /> Access Timeline</>
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleBackToId}
                  className="mt-5 w-full flex items-center justify-center gap-1.5 text-sm text-blue-200/80 hover:text-white transition-colors font-medium"
                >
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
