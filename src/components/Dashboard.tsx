import React from 'react';
import { motion } from 'framer-motion';
import { Box, Globe, Smartphone, PenTool, BarChart3, Search, MessageSquare, Tag, User, CheckCircle, Activity, FolderGit2, Calendar } from 'lucide-react';
import { Timeline, type Milestone } from './Timeline';


export interface ProjectData {
  _id: string;
  id: string;
  title: string;
  clientName: string;
  category: string;
  status: string;
  progress: number;
  milestones: Milestone[];
}

interface DashboardProps {
  data: ProjectData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const calculateDuration = () => {
    if (!data.milestones || data.milestones.length === 0) return null;
    
    const dates = data.milestones.flatMap(m => [
      new Date(m.startDate).getTime(),
      new Date(m.endDate).getTime()
    ]).filter(t => !isNaN(t));

    if (dates.length === 0) return null;

    const start = Math.min(...dates);
    const end = Math.max(...dates);
    
    const diffMs = end - start;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

    const formatDate = (d: number) => new Date(d).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    let durationText = `${diffDays} Days`;
    if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      durationText = `${months} Month${months > 1 ? 's' : ''}${remainingDays > 0 ? `, ${remainingDays} Day${remainingDays > 1 ? 's' : ''}` : ''}`;
    }
    
    return {
      durationText,
      range: `${formatDate(start)} - ${formatDate(end)}`
    };
  };

  const projectDuration = calculateDuration();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-10 py-4 sm:py-8 px-2 sm:px-4 relative">
      {/* Dashboard Background Decorative Elements - Removed to maintain pure white root */}

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="bg-[#0A192F] rounded-3xl p-5 sm:p-8 shadow-[0_20px_50px_rgba(10,25,47,0.5)] border border-[#1E2D4A] flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 group hover:shadow-[0_25px_60px_rgba(10,25,47,0.6)] transition-all"
      >
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-inner border border-white/10 flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <Box size={24} strokeWidth={1.5} className="sm:hidden" />
            <Box size={32} strokeWidth={1.5} className="hidden sm:block" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-black tracking-[0.1em] text-white/50 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">{data.id}</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[10px] sm:text-xs font-bold text-white border border-white/10">
                {(() => {
                  const cat = data.category.toLowerCase();
                  if (cat.includes('web')) return <Globe size={12} strokeWidth={2.5} />;
                  if (cat.includes('app') || cat.includes('mobile')) return <Smartphone size={12} strokeWidth={2.5} />;
                  if (cat.includes('design') || cat.includes('ux')) return <PenTool size={12} strokeWidth={2.5} />;
                  if (cat.includes('marketing')) return <BarChart3 size={12} strokeWidth={2.5} />;
                  if (cat.includes('seo')) return <Search size={12} strokeWidth={2.5} />;
                  if (cat.includes('social')) return <MessageSquare size={12} strokeWidth={2.5} />;
                  return <Tag size={12} strokeWidth={2.5} />;
                })()}
                <span className="uppercase tracking-wider">{data.category}</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight break-words mb-2 tracking-tight">
              {data.title}
            </h1>
            <div className="flex items-center gap-2 text-blue-200/70 hover:text-white transition-colors group/client cursor-default">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/client:bg-white/10 transition-all shadow-sm">
                <User size={16} strokeWidth={2.5} className="group-hover/client:text-white" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-blue-200 group-hover/client:text-white transition-colors">{data.clientName}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-3 sm:p-4 w-full md:min-w-[200px] md:w-auto border border-white/10">
          <div className="text-xs sm:text-sm text-blue-200/70 mb-1 font-medium">Current Status</div>
          <div className="flex items-center gap-2">
            {data.status === 'Completed' ? (
              <CheckCircle className="text-green-400 w-4 h-4 sm:w-5 sm:h-5" />
            ) : data.status === 'In Progress' ? (
              <Activity className="text-primary-blue w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <FolderGit2 className="text-purple-400 w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="text-base sm:text-lg font-bold text-white">{data.status}</span>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.5, delay: 0.2, type: 'spring', bounce: 0.4 }}
        className="bg-[#0A192F] rounded-3xl p-5 sm:p-8 shadow-[0_20px_50px_rgba(10,25,47,0.5)] border border-[#1E2D4A] group hover:shadow-[0_25px_60px_rgba(10,25,47,0.6)] transition-all"
      >
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">Overall Progress</h2>
          <span className="text-2xl sm:text-3xl font-black text-primary-blue">{data.progress}%</span>
        </div>
        <div className="relative w-full h-4 bg-white/5 rounded-full overflow-hidden shadow-inner mb-4 border border-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-primary-blue rounded-full"
          >
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 animate-[pulse_2s_ease-in-out_infinite] skew-x-12 transform -translate-x-2"></div>
          </motion.div>
        </div>

        {/* Project Duration - NEW */}
        {projectDuration && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 mt-2 border-t border-white/10 relative">
            <div className="flex items-center gap-2 group/duration">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/10 group-hover/duration:scale-110 transition-transform">
                <Calendar size={14} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200/70 leading-none mb-1">Project Duration</div>
                <div className="text-sm font-black text-white leading-none">{projectDuration.durationText}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200/70 leading-none mb-1">Project Timeline</div>
              <div className="text-xs font-bold text-blue-200 leading-none">{projectDuration.range}</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Timeline Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 px-2 text-center md:text-left">Project Timeline</h2>
        <Timeline milestones={data.milestones} projectDocId={data._id} />
      </motion.div>
    </div>
  );
};
