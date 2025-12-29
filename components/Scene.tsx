import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import TreeParticles from './TreeParticles';
import { AppContextType } from '../types';

interface SceneProps {
  appState: AppContextType;
}

const Scene: React.FC<SceneProps> = ({ appState }) => {
  return (
    <div className="w-full h-full absolute top-0 left-0 bg-[#050505]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 18], fov: 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: false }} // Optimizations
      >
        <color attach="background" args={['#050505']} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} color="#D4AF37" />
        <spotLight position={[10, 20, 10]} angle={0.5} penumbra={1} intensity={2} castShadow color="#fff" />
        <pointLight position={[-10, 0, -10]} intensity={1} color="#B22222" />
        <pointLight position={[0, 10, 0]} intensity={1} color="#2F5A3B" />

        {/* Floating dust/magic */}
        <Sparkles count={200} scale={20} size={4} speed={0.4} opacity={0.5} color="#D4AF37" />

        <TreeParticles appState={appState} />

        <Environment preset="city" />
        
        {/* Post Processing for Glow and Film Look */}
        <EffectComposer disableNormalPass>
          <Bloom 
             luminanceThreshold={0.5} 
             luminanceSmoothing={0.9} 
             height={300} 
             intensity={1.5} 
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} />
      </Canvas>
    </div>
  );
};

export default Scene;
