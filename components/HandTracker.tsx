import React, { useEffect, useRef, useState } from 'react';
import { detectGesture } from '../services/gestureService';
import { AppContextType, HandGesture } from '../types';

// Declare globals for the script loaded in index.html
declare global {
  interface Window {
    vision: any;
  }
}

interface HandTrackerProps {
  setGesture: AppContextType['setGesture'];
}

const HandTracker: React.FC<HandTrackerProps> = ({ setGesture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const lastVideoTimeRef = useRef(-1);
  const handLandmarkerRef = useRef<any>(null);

  useEffect(() => {
    // 1. Start Camera immediately
    const startWebcam = async () => {
      try {
        // Request camera with specific constraints for better performance/compatibility
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for data to load to avoid black frames
          videoRef.current.onloadeddata = () => {
             setCameraActive(true);
             // Start the prediction loop immediately, it will wait for model inside
             predictWebcam();
          };
        }
      } catch (err) {
        console.error("Camera access denied or failed:", err);
      }
    };

    // 2. Initialize MediaPipe Model
    const initMediaPipe = async () => {
      try {
        const { HandLandmarker, FilesetResolver } = window.vision || {};
        
        if (!HandLandmarker) {
          console.warn("MediaPipe script not loaded yet, retrying...");
          setTimeout(initMediaPipe, 500);
          return;
        }

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setModelLoaded(true);

      } catch (error) {
        console.error("Error initializing MediaPipe:", error);
      }
    };

    startWebcam();
    initMediaPipe();
  }, []);

  const predictWebcam = () => {
    // If video or model isn't ready, just loop again
    if (!videoRef.current || !handLandmarkerRef.current) {
       requestAnimationFrame(predictWebcam);
       return;
    }
    
    let startTimeMs = performance.now();
    
    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
      
      if (results.landmarks) {
        const gestureData = detectGesture(results.landmarks);
        if (gestureData) {
          setGesture({
            ...gestureData,
          });
        }
      }
    }
    
    requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-xl overflow-hidden border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] bg-black/50 backdrop-blur-sm w-32 h-24 transition-all duration-500">
       {/* Mirror the video */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-500 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {/* Loading States Overlay */}
      {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/70 animate-pulse font-mono bg-black/80">
              STARTING CAM...
          </div>
      )}
      {cameraActive && !modelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#D4AF37] animate-pulse font-mono bg-black/40">
              LOADING AI...
          </div>
      )}

      <div className="absolute top-1 left-2 text-[10px] text-white/80 font-mono drop-shadow-md">VISION</div>
    </div>
  );
};

export default HandTracker;