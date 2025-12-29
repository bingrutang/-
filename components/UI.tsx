import React, { useRef } from 'react';
import { AppContextType, AppMode } from '../types';

interface UIProps {
  appState: AppContextType;
}

const UI: React.FC<UIProps> = ({ appState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      appState.addUserPhoto(url);
    }
  };

  const getStatusText = () => {
    switch (appState.mode) {
      case AppMode.TREE: return "CONVERGED STATE";
      case AppMode.CLOUD: return "DISPERSED STATE";
      case AppMode.FOCUS: return "MEMORY FOCUS";
      default: return "";
    }
  };

  const getGestureHint = () => {
    if (appState.gesture.isFist) return "Fist Detected: Forming Tree...";
    if (appState.gesture.isPinching) return "Pinch Detected: Selecting Memory...";
    if (appState.gesture.isOpen) return "Open Hand: Releasing Magic...";
    return "Show hand to control";
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
           <h1 className="text-4xl text-[#D4AF37] tracking-widest drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">
             LUMIÈRE
           </h1>
           <p className="text-white/60 font-light tracking-wider text-sm mt-1 uppercase">
             Gesture Controlled Christmas
           </p>
        </div>

        {/* Upload Button */}
        <div className="relative group">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="border border-[#D4AF37] text-[#D4AF37] px-6 py-2 rounded-full uppercase text-xs tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Add Memory
          </button>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleUpload} 
          />
        </div>
      </div>

      {/* Center Status */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
         <h2 className="text-6xl text-white/10 font-bold uppercase tracking-[1em] whitespace-nowrap blur-sm animate-pulse">
            {getStatusText()}
         </h2>
      </div>

      {/* Footer / Instructions */}
      <div className="flex justify-between items-end">
        <div className="space-y-2 max-w-md">
           <div className="flex items-center space-x-2">
             <div className={`w-3 h-3 rounded-full ${appState.gesture.isFist ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-white/20'}`} />
             <span className="text-xs text-[#D4AF37] uppercase tracking-widest">Fist: Tree</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className={`w-3 h-3 rounded-full ${appState.gesture.isOpen ? 'bg-blue-500 shadow-[0_0_10px_blue]' : 'bg-white/20'}`} />
             <span className="text-xs text-[#D4AF37] uppercase tracking-widest">Open: Cloud & Rotate</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className={`w-3 h-3 rounded-full ${appState.gesture.isPinching ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-white/20'}`} />
             <span className="text-xs text-[#D4AF37] uppercase tracking-widest">Pinch: Focus Photo</span>
           </div>
        </div>

        <div className="text-right">
          <p className="text-[#D4AF37] text-lg fancy-font animate-pulse">
            {getGestureHint()}
          </p>
        </div>
      </div>

    </div>
  );
};

export default UI;
