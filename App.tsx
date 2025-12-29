import React, { useState, useEffect, useCallback } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import HandTracker from './components/HandTracker';
import { AppMode, AppContextType, HandGesture } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TREE);
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  
  // Default neutral gesture
  const [gesture, setGesture] = useState<HandGesture>({
    isFist: false,
    isOpen: false,
    isPinching: false,
    handPosition: { x: 0.5, y: 0.5 },
    rotation: 0,
  });

  const addUserPhoto = (url: string) => {
    setUserPhotos(prev => [...prev, url]);
  };

  // State Machine Logic driven by Gesture
  useEffect(() => {
    // Debounce state changes slightly or require sustained gesture could go here
    // For now, direct mapping for responsiveness
    
    if (gesture.isPinching && userPhotos.length > 0) {
       // Prioritize interaction with content
       setMode(AppMode.FOCUS);
    } else if (gesture.isFist) {
       setMode(AppMode.TREE);
    } else if (gesture.isOpen) {
       setMode(AppMode.CLOUD);
    }
    // If no specific gesture, maintain previous state or drift? 
    // We maintain previous state to prevent flickering.

  }, [gesture.isFist, gesture.isOpen, gesture.isPinching, userPhotos.length]);

  const appState: AppContextType = {
    mode,
    setMode,
    userPhotos,
    addUserPhoto,
    gesture,
    setGesture
  };

  return (
    <div className="w-screen h-screen relative bg-black overflow-hidden select-none">
      <Scene appState={appState} />
      <UI appState={appState} />
      <HandTracker setGesture={setGesture} />
    </div>
  );
};

export default App;
