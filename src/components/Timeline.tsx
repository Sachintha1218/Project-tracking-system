import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, MessageSquare, Send, Loader2, AlertCircle, UploadCloud, File as FileIcon, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Material {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Milestone {
  id: number;
  title: string;
  status: 'Done' | 'Current' | 'Pending' | 'In Revision';
  startDate: string;
  endDate: string;
  clientComment?: string | null;
  materials?: Material[];
}

interface TimelineProps {
  milestones: Milestone[];
}

const MilestoneItem: React.FC<{ initialMilestone: Milestone; index: number }> = ({ initialMilestone, index }) => {
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', 'Client');

    try {
      const res = await fetch(`http://localhost:5001/api/milestones/${milestone.id}/materials`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const newMaterial = await res.json();
        setMaterials(prev => [newMaterial, ...prev]);
        alert("Material uploaded successfully.");
      } else {
        alert("Failed to upload material.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this reference?')) return;
    try {
      const res = await fetch(`http://localhost:5001/api/materials/${materialId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMaterials(prev => prev.filter(m => m.id !== materialId));
      } else {
        alert("Failed to delete material.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during deletion.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:5001/api/milestones/${milestone.id}/comment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, isRevision })
      });
      if (res.ok) {
        setIsEditing(false);
        const updated = await res.json();
        setMilestone(updated);
        setComment(updated.clientComment || '');
        setIsRevision(false);
      }
    } catch (err) {
      console.error(err);
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
          "absolute left-[-19px] md:left-1/2 md:transform md:-translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md z-10 bg-white",
          isDone && "text-primary-blue",
          isCurrent && "text-primary-blue",
          isPending && "text-gray-400",
          isInRevision && "text-orange-500"
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
          "p-4 sm:p-5 rounded-2xl bg-white shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl",
          isCurrent && "ring-2 ring-primary-blue/20 shadow-primary-blue/10",
          isInRevision && "ring-2 ring-orange-500/20 shadow-orange-500/10"
        )}>
          <div className={cn(
            "flex flex-col gap-1",
            isEven ? "items-start" : "md:items-end items-start"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                isDone && "bg-green-100 text-green-700",
                isCurrent && "bg-blue-100 text-primary-blue",
                isPending && "bg-gray-100 text-gray-600",
                isInRevision && "bg-orange-100 text-orange-600"
              )}>
                {milestone.status}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-dark-slate leading-snug">{milestone.title}</h3>
            <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2 gap-1.5 flex-wrap">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70 flex-shrink-0" />
              <span className="leading-tight">{milestone.startDate} &mdash; {milestone.endDate}</span>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 text-left">
            <button
              onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
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
                      className="text-xs text-primary-blue font-medium hover:underline transition-all"
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
                      className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none resize-none transition-all"
                      rows={3}
                      placeholder="Add your comments or feedback..."
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isRevision}
                          onChange={(e) => setIsRevision(e.target.checked)}
                          className="w-4 h-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue"
                        />
                        Submit as a revision
                      </label>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setComment(milestone.clientComment || '');
                            setIsEditing(false);
                          }}
                          className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-3 py-1.5 text-xs bg-primary-blue text-white rounded-lg flex items-center gap-1.5 hover:bg-blue-600 transition-colors disabled:opacity-70"
                          disabled={isSaving}
                        >
                          {isSaving ? <Loader2 className="w-3 h-3 animate-spin"/> : <Send className="w-3 h-3" />}
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-600 italic whitespace-pre-wrap">
                    {comment || <span className="text-gray-400">No comment provided yet.</span>}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Materials Section */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 text-left">
            <button 
              onClick={() => setIsMaterialsOpen(!isMaterialsOpen)}
              className="w-full flex items-center justify-between text-left focus:outline-none"
            >
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
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
                          <li key={m.id} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg border border-gray-100 bg-purple-50 hover:bg-purple-100 transition-colors">
                            <div className="bg-purple-100 p-1.5 rounded-md text-purple-600 flex-shrink-0">
                              <FileIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <a href={`http://localhost:5001${m.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-medium text-dark-slate hover:text-primary-blue truncate flex-1">
                              {m.fileName}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No materials provided by your project manager.</p>
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
                          <li key={m.id} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg border border-gray-100 bg-blue-50 hover:bg-blue-100 transition-colors group">
                            <div className="bg-blue-100 p-1.5 rounded-md text-primary-blue flex-shrink-0">
                              <FileIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <a href={`http://localhost:5001${m.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-medium text-dark-slate hover:text-primary-blue truncate flex-1">
                              {m.fileName}
                            </a>
                            <button 
                              onClick={() => handleDelete(m.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete this reference"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400 italic mb-3">No references uploaded yet.</p>
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
                      className="text-xs px-3 py-2 sm:py-1.5 rounded-lg border border-dashed border-primary-blue text-primary-blue bg-blue-50/50 hover:bg-primary-blue hover:text-white flex items-center gap-2 transition-colors disabled:opacity-50 w-full sm:w-auto justify-center sm:justify-start"
                    >
                      {isUploading ? <Loader2 className="w-3 h-3 animate-spin"/> : <UploadCloud className="w-3 h-3" />}
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

export const Timeline: React.FC<TimelineProps> = ({ milestones }) => {
  return (
    <div className="relative pl-10 sm:pl-8 md:pl-0">
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>
      <div className="md:hidden absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-8 sm:space-y-12">
        {milestones.map((milestone, index) => (
          <MilestoneItem key={milestone.id} initialMilestone={milestone} index={index} />
        ))}
      </div>
    </div>
  );
};
