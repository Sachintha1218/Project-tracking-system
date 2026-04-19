import React from 'react';
import { motion } from 'framer-motion';
import { Timeline, type Milestone } from './Timeline';
import { FolderGit2, CheckCircle, Activity, Box, User, Tag } from 'lucide-react';

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
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-10 py-4 sm:py-8 px-2 sm:px-4 relative">
      {/* Dashboard Background Decorative Elements */}
      <div className="absolute top-[20%] right-[-5%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-purple-200/40 blur-[80px] sm:blur-[100px] opacity-60 pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-[30%] left-[-10%] w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full bg-blue-200/40 blur-[90px] sm:blur-[120px] opacity-70 pointer-events-none -z-10"></div>
      <div className="absolute top-[60%] left-[20%] w-[250px] h-[250px] rounded-full bg-teal-100/30 blur-[70px] opacity-50 pointer-events-none -z-10"></div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="bg-white/80 backdrop-blur-lg rounded-3xl p-5 sm:p-8 shadow-xl shadow-gray-200/50 border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 group hover:shadow-2xl hover:shadow-blue-200/40 transition-all"
      >
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-primary-blue shadow-inner border border-blue-200/50 flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <Box size={24} strokeWidth={1.5} className="sm:hidden" />
            <Box size={32} strokeWidth={1.5} className="hidden sm:block" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-black tracking-[0.1em] text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{data.id}</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[10px] sm:text-xs font-bold text-primary-blue border border-blue-100/50">
                <Tag size={12} strokeWidth={2.5} />
                <span className="uppercase tracking-wider">{data.category}</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-dark-slate leading-tight break-words mb-2 tracking-tight">
              {data.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 hover:text-primary-blue transition-colors group/client cursor-default">
              <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover/client:bg-blue-50 group-hover/client:border-blue-100 transition-colors">
                <User size={12} strokeWidth={2.5} className="group-hover/client:text-primary-blue" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.05em] text-gray-400">Client:</span>
              <span className="text-xs sm:text-sm font-extrabold text-gray-700 group-hover/client:text-dark-slate transition-colors">{data.clientName}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 w-full md:min-w-[200px] md:w-auto border border-gray-100">
          <div className="text-xs sm:text-sm text-gray-500 mb-1 font-medium">Current Status</div>
          <div className="flex items-center gap-2">
            {data.status === 'Completed' ? (
              <CheckCircle className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
            ) : data.status === 'In Progress' ? (
              <Activity className="text-primary-blue w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <FolderGit2 className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="text-base sm:text-lg font-bold text-dark-slate">{data.status}</span>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.5, delay: 0.2, type: 'spring', bounce: 0.4 }}
        className="bg-white/80 backdrop-blur-lg rounded-3xl p-5 sm:p-8 shadow-xl shadow-gray-200/50 border border-white/60 group hover:shadow-2xl hover:shadow-blue-200/40 transition-all"
      >
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-dark-slate">Overall Progress</h2>
          <span className="text-2xl sm:text-3xl font-black text-primary-blue">{data.progress}%</span>
        </div>
        <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-primary-blue rounded-full"
          >
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 animate-[pulse_2s_ease-in-out_infinite] skew-x-12 transform -translate-x-2"></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Timeline Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-dark-slate mb-6 sm:mb-8 px-2 text-center md:text-left">Project Timeline</h2>
        <Timeline milestones={data.milestones} projectDocId={data._id} />
      </motion.div>
    </div>
  );
};
