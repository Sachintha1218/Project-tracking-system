import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, MessageSquare, Send, Loader2, AlertCircle, UploadCloud, File as FileIcon, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { client } from '../lib/sanity';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Material {
  id: string;
  _key: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  assetId?: string;
}

export interface Milestone {
  id: string;
  _key: string;
  title: string;
  status: 'Done' | 'Current' | 'Pending' | 'In Revision';
  startDate: string;
  endDate: string;
  clientComment?: string | null;
  materials?: Material[];
}

interface TimelineProps {
  milestones: Milestone[];
  projectDocId: string;
}

interface SanityMilestone {
  _key: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  clientComment?: string;
  materials?: SanityMaterial[];
}

interface SanityMaterial {
  _key: string;
  _type: string;
  fileName: string;
  uploadedBy: string;
  file: { _type: string; asset: { _type: string; _ref: string } };
}

const MilestoneItem: React.FC<{ initialMilestone: Milestone; index: number; projectDocId: string }> = ({
  initialMilestone,
  index,
  projectDocId,
}) => {
  const [milestone, setMilestone] = useState(initialMilestone);
  const [comment, setComment] = useState(milestone.clientComment || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRevision, setIsRevision] = useState(false);
  const [materials, setMaterials] = useState<Material[]>(milestone.materials || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      // Upload file to Sanity asset store
      const asset = await client.assets.upload('file', file, { filename: file.name });

      const newMaterialKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const newSanityMaterial: SanityMaterial = {
        _key: newMaterialKey,
        _type: 'material',
        fileName: file.name,
        uploadedBy: 'Client',
        file: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } },
      };

      // Fetch current doc and append to the correct milestone's materials
      const doc = await client.getDocument<{ milestones: SanityMilestone[] }>(projectDocId);
      if (!doc) throw new Error('Project not found');

      const updatedMilestones = doc.milestones.map(m => {
        if (m._key === milestone._key) {
          return { ...m, materials: [newSanityMaterial, ...(m.materials || [])] };
        }
        return m;
      });

      await client.patch(projectDocId).set({ milestones: updatedMilestones }).commit();

      setMaterials(prev => [{
        id: newMaterialKey,
        _key: newMaterialKey,
        fileName: file.name,
        uploadedBy: 'Client',
        fileUrl: asset.url,
        assetId: asset._id,
      }, ...prev]);
    } catch (e) {
      console.error(e);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (materialKey: string, assetId?: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      const doc = await client.getDocument<{ milestones: SanityMilestone[] }>(projectDocId);
      if (!doc) throw new Error('Project not found');

      const updatedMilestones = doc.milestones.map(m => {
        if (m._key === milestone._key) {
          return { ...m, materials: (m.materials || []).filter(mat => mat._key !== materialKey) };
        }
        return m;
      });

      await client.patch(projectDocId).set({ milestones: updatedMilestones }).commit();

      // Delete the Sanity asset too
      if (assetId) await client.delete(assetId);

      setMaterials(prev => prev.filter(m => m._key !== materialKey));
    } catch (e) {
      console.error(e);
      alert('Delete failed. Please try again.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update comment and optionally status using Sanity path notation
      const patch: Record<string, string> = {
        [`milestones[_key=="${milestone._key}"].clientComment`]: comment,
      };
      if (isRevision) {
        patch[`milestones[_key=="${milestone._key}"].status`] = 'In Revision';
      }

      await client.patch(projectDocId).set(patch).commit();

      setMilestone(prev => ({
        ...prev,
        clientComment: comment,
        status: isRevision ? 'In Revision' : prev.status,
      }));
      setIsEditing(false);
      setIsRevision(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isEven = index % 2 === 0;
  const isDone = milestone.status === 'Done';
  const isCurrent = milestone.status === 'Current';
  const isPending = milestone.status === 'Pending';
  const isInRevision = milestone.status === 'In Revision';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className={cn(
        "relative flex items-center justify-between md:justify-normal",
        isEven ? "md:flex-row-reverse" : "md:flex-row"
      )}
    >
      {/* Timeline dot */}
      <div
        className={cn(
          "absolute left-[-19px] md:left-1/2 md:transform md:-translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-4 border-[#0A192F] flex items-center justify-center shadow-md z-10 bg-[#1E2D4A]",
          isDone && "text-green-400 border-[#0A192F] bg-[#1E2D4A]",
          isCurrent && "text-primary-blue bg-[#0A192F]",
          isPending && "text-gray-500",
          isInRevision && "text-orange-400 border-[#0A192F] bg-[#1E2D4A]"
        )}
      >
        {isDone && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
        {isCurrent && (
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-blue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-blue"></span>
          </div>
        )}
        {isInRevision && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-orange-100 stroke-orange-500" />}
        {isPending && <Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
      </div>

      {/* Content Box */}
      <div className={cn(
        "w-full md:w-[calc(50%-2.5rem)]",
        isEven ? "md:pl-10" : "md:pr-10 md:text-right"
      )}>
        <div className={cn(
          "p-4 sm:p-5 rounded-2xl bg-[#0A192F] shadow-[0_20px_50px_rgba(10,25,47,0.5)] border border-[#1E2D4A] transition-all duration-300 hover:shadow-[0_25px_60px_rgba(10,25,47,0.6)]",
          isCurrent && "ring-2 ring-primary-blue/30 shadow-primary-blue/20",
          isInRevision && "ring-2 ring-orange-500/30 shadow-orange-500/20"
        )}>
          <div className={cn(
            "flex flex-col gap-1",
            isEven ? "items-start" : "md:items-end items-start"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                isDone && "bg-green-500/10 text-green-400 border-green-500/20",
                isCurrent && "bg-primary-blue/10 text-primary-blue border-primary-blue/20",
                isPending && "bg-white/5 text-gray-400 border-white/10",
                isInRevision && "bg-orange-500/10 text-orange-400 border-orange-500/20"
              )}>
                {milestone.status}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{milestone.title}</h3>
            <div className="flex items-center text-xs sm:text-sm text-blue-200/70 mt-1.5 sm:mt-2 gap-1.5 flex-wrap">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70 flex-shrink-0" />
              <span className="leading-tight">{milestone.startDate} &mdash; {milestone.endDate}</span>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E2D4A] text-left">
            <button
              onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <h4 className="text-xs sm:text-sm font-semibold text-blue-200 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-blue" />
                Feedbacks
              </h4>
              {isFeedbackOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {isFeedbackOpen && (
              <div className="mt-3 sm:mt-4">
                {!isEditing && (
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-primary-blue font-medium hover:text-blue-400 transition-all"
                    >
                      {comment ? 'Edit' : 'Add Comment'}
                    </button>
                  </div>
                )}

                {isEditing ? (
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full text-sm p-3 border border-white/10 bg-white/5 text-white rounded-xl focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue outline-none resize-none transition-all placeholder-gray-500"
                      rows={3}
                      placeholder="Add your comments or feedback..."
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs sm:text-sm text-blue-200/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isRevision}
                          onChange={(e) => setIsRevision(e.target.checked)}
                          className="w-4 h-4 bg-white/10 text-primary-blue rounded border-white/20 focus:ring-primary-blue"
                        />
                        Submit as a revision
                      </label>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setComment(milestone.clientComment || '');
                            setIsEditing(false);
                          }}
                          className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-3 py-1.5 text-xs bg-primary-blue text-white rounded-lg flex items-center gap-1.5 hover:bg-blue-600 transition-colors disabled:opacity-70"
                          disabled={isSaving}
                        >
                          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                 ) : (
                  <p className="text-xs sm:text-sm text-blue-100 italic whitespace-pre-wrap">
                    {comment || <span className="text-gray-500">No comment provided yet.</span>}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Materials Section */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E2D4A] text-left">
            <button
              onClick={() => setIsMaterialsOpen(!isMaterialsOpen)}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <h4 className="text-xs sm:text-sm font-semibold text-blue-200 flex items-center gap-2">
                <FileIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                Materials and References
              </h4>
              {isMaterialsOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {isMaterialsOpen && (
              <div className="mt-3 sm:mt-4 space-y-4">

                {/* Project Manager Materials */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">From your Project Manager</p>
                  {(() => {
                    const companyMaterials = materials.filter(m => m.uploadedBy === 'Company');
                    return companyMaterials.length > 0 ? (
                      <ul className="space-y-2">
                        {companyMaterials.map(m => (
                          <li key={m._key} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
                            <div className="bg-purple-500/20 p-1.5 rounded-md text-purple-300 flex-shrink-0 border border-purple-500/30">
                              <FileIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <a
                              href={m.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs sm:text-sm font-medium text-white hover:text-purple-300 truncate flex-1"
                            >
                              {m.fileName}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500 italic">No materials provided by your project manager.</p>
                    );
                  })()}
                </div>

                {/* Client Uploads */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Uploads</p>
                  {(() => {
                    const clientMaterials = materials.filter(m => m.uploadedBy === 'Client');
                    return clientMaterials.length > 0 ? (
                      <ul className="space-y-2 mb-3">
                        {clientMaterials.map(m => (
                          <li key={m._key} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg border border-primary-blue/20 bg-primary-blue/5 hover:bg-primary-blue/10 transition-colors group">
                            <div className="bg-primary-blue/20 p-1.5 rounded-md text-primary-blue flex-shrink-0 border border-primary-blue/30">
                              <FileIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <a
                              href={m.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs sm:text-sm font-medium text-white hover:text-primary-blue truncate flex-1"
                            >
                              {m.fileName}
                            </a>
                            <button
                              onClick={() => handleDelete(m._key, m.assetId)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete this file"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500 italic mb-3">No references uploaded yet.</p>
                    );
                  })()}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-xs px-3 py-2 sm:py-1.5 rounded-lg border border-dashed border-primary-blue/50 text-primary-blue bg-primary-blue/10 hover:bg-primary-blue hover:text-white flex items-center gap-2 transition-colors disabled:opacity-50 w-full sm:w-auto justify-center sm:justify-start"
                    >
                      {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                      {isUploading ? 'Uploading...' : 'Upload your references'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for the other side in desktop view */}
      <div className="hidden md:block w-[calc(50%-2.5rem)]"></div>
    </motion.div>
  );
};

export const Timeline: React.FC<TimelineProps> = ({ milestones, projectDocId }) => {
  return (
    <div className="relative pl-10 sm:pl-8 md:pl-0">
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#1E2D4A] transform -translate-x-1/2"></div>
      <div className="md:hidden absolute left-[15px] top-0 bottom-0 w-0.5 bg-[#1E2D4A]"></div>

      <div className="space-y-8 sm:space-y-12">
        {milestones.map((milestone, index) => (
          <MilestoneItem
            key={milestone._key}
            initialMilestone={milestone}
            index={index}
            projectDocId={projectDocId}
          />
        ))}
      </div>
    </div>
  );
};
