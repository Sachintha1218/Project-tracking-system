import React, { useState, useRef } from 'react';
import { UploadCloud, File, Trash2, Loader2, Building, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Material {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
}

const MaterialList = ({ title, items, icon: Icon, colorClass, onDelete }: { title: string, items: Material[], icon: React.ElementType, colorClass: string, onDelete: (id: string) => void }) => (
  <div className="mb-6 last:mb-0">
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-5 h-5 ${colorClass}`} />
      <h3 className="text-sm font-bold text-dark-slate uppercase tracking-wider">{title} ({items.length})</h3>
    </div>
    
    {items.length === 0 ? (
      <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">No materials uploaded yet.</div>
    ) : (
      <ul className="space-y-3">
        <AnimatePresence>
          {items.map(material => (
            <motion.li 
              key={material.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-blue-50 p-2 rounded-lg text-primary-blue">
                  <File className="w-5 h-5" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <a 
                    href={`http://localhost:5001${material.fileUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-dark-slate hover:text-primary-blue truncate transition-colors"
                  >
                    {material.fileName}
                  </a>
                  <span className="text-xs text-gray-400">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => onDelete(material.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Delete material"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    )}
  </div>
);

interface MaterialUploadProps {
  projectId: string;
  materials: Material[];
  onUploadComplete: (newMaterial: Material) => void;
  onDeleteComplete: (materialId: string) => void;
}

export const MaterialUpload: React.FC<MaterialUploadProps> = ({ projectId, materials, onUploadComplete, onDeleteComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploaderType, setUploaderType] = useState<'Client' | 'Company'>('Client');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploaderType);

    try {
      const response = await fetch(`http://localhost:5001/api/project/${projectId}/materials`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const newMaterial = await response.json();
      onUploadComplete(newMaterial);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/materials/${materialId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete material');
      }

      onDeleteComplete(materialId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred during deletion.');
    }
  };

  // Group materials
  const clientMaterials = materials.filter(m => m.uploadedBy === 'Client');
  const companyMaterials = materials.filter(m => m.uploadedBy === 'Company');

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dark-slate flex items-center gap-2">
            Materials & References
          </h2>
          <p className="text-gray-500 text-sm mt-1">Upload and manage project files</p>
        </div>
        
        <div className="bg-gray-50 flex p-1 rounded-xl border border-gray-100">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${uploaderType === 'Client' ? 'bg-white shadow-sm text-primary-blue' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setUploaderType('Client')}
          >
            Upload as Client
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${uploaderType === 'Company' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setUploaderType('Company')}
          >
            Upload as Company
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="md:col-span-1">
          <div 
            className="border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-primary-blue animate-spin mb-3" />
                <span className="text-sm font-semibold text-primary-blue">Uploading...</span>
              </div>
            ) : (
              <>
                <div className="bg-white p-3 rounded-full shadow-sm mb-4 text-primary-blue">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-dark-slate mb-1">Click to Upload</h3>
                <p className="text-xs text-gray-500 mb-3">Any file type up to 50MB</p>
                <span className="text-xs font-bold px-3 py-1 bg-white rounded-full text-gray-600 border border-gray-100">
                  Uploading as {uploaderType}
                </span>
              </>
            )}
          </div>
          {error && (
            <p className="text-red-500 text-xs mt-3 font-medium text-center">{error}</p>
          )}
        </div>

        {/* Files List */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <MaterialList 
            title="Client Uploads" 
            items={clientMaterials} 
            icon={User} 
            colorClass="text-primary-blue" 
            onDelete={handleDelete}
          />
          <MaterialList 
            title="Company Uploads" 
            items={companyMaterials} 
            icon={Building} 
            colorClass="text-purple-600" 
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};
