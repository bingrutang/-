import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { AppContextType, AppMode, ParticleData } from '../types';
import { PARTICLE_COUNT, COLORS, TREE_HEIGHT, TREE_RADIUS, PLACEHOLDER_IMAGES } from '../constants';
import { easing } from 'maath';

interface TreeParticlesProps {
  appState: AppContextType;
}

const TreeParticles: React.FC<TreeParticlesProps> = ({ appState }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [dummyTextures, setDummyTextures] = useState<THREE.Texture[]>([]);
  
  // Load textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const loaded = PLACEHOLDER_IMAGES.map(url => loader.load(url));
    setDummyTextures(loaded);
  }, []);

  // Generate Particles Data
  const particles = useMemo(() => {
    const temp: ParticleData[] = [];
    const total = PARTICLE_COUNT + appState.userPhotos.length;

    for (let i = 0; i < total; i++) {
      // Determine type
      let type: 'SPHERE' | 'CUBE' | 'PHOTO' = 'SPHERE';
      const rand = Math.random();
      if (i < appState.userPhotos.length) type = 'PHOTO';
      else if (rand > 0.8) type = 'CUBE';

      // --- Tree Formation (Spiral Cone) ---
      // h goes from 0 to TREE_HEIGHT
      const t = i / total;
      const h = t * TREE_HEIGHT; 
      // Radius shrinks as height grows
      const r = (TREE_HEIGHT - h) / TREE_HEIGHT * TREE_RADIUS;
      const angle = h * 5 + i * 0.1; // Spiral
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const treePos = new THREE.Vector3(x, h - TREE_HEIGHT / 2, z);
      
      // Jitter tree pos slightly for natural look
      treePos.x += (Math.random() - 0.5) * 0.5;
      treePos.z += (Math.random() - 0.5) * 0.5;

      // --- Cloud Formation (Random Sphere) ---
      const cloudR = 8 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const cx = cloudR * Math.sin(phi) * Math.cos(theta);
      const cy = cloudR * Math.sin(phi) * Math.sin(theta);
      const cz = cloudR * Math.cos(phi);
      const cloudPos = new THREE.Vector3(cx, cy, cz);

      // Color Palette
      let color = COLORS.GOLD;
      if (Math.random() > 0.6) color = COLORS.RED;
      if (Math.random() > 0.8) color = COLORS.GREEN;
      if (type === 'PHOTO') color = COLORS.WHITE;

      temp.push({
        id: i,
        type,
        position: treePos.clone(), // Start at tree
        treePosition: treePos,
        cloudPosition: cloudPos,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        color,
        scale: Math.random() * 0.4 + 0.2,
      });
    }
    return temp;
  }, [appState.userPhotos.length]);

  // Load user photos into textures if available
  const userTextures = useMemo(() => {
    return appState.userPhotos.map(url => new THREE.TextureLoader().load(url));
  }, [appState.userPhotos]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const { mode, gesture } = appState;
    
    // Group Rotation based on hand gesture (in Cloud mode)
    if (mode === AppMode.CLOUD) {
       // Map 0-1 hand position to -1 to 1 rotation speed
       const rotSpeed = (gesture.handPosition.x - 0.5) * 2; 
       // Smoothly rotate the whole group
       easing.dampE(groupRef.current.rotation, [0, groupRef.current.rotation.y + rotSpeed * 0.02, 0], 0.1, delta);
    } else {
       // Slow automatic rotation in tree mode
       groupRef.current.rotation.y += delta * 0.1;
    }

    // Update each particle
    groupRef.current.children.forEach((child, index) => {
      const data = particles[index];
      if (!data) return;

      let targetPos = new THREE.Vector3();
      let targetScale = data.scale;
      let targetRot = data.rotation;

      // 1. Determine Target State
      if (mode === AppMode.TREE) {
        targetPos.copy(data.treePosition);
      } else if (mode === AppMode.CLOUD) {
        targetPos.copy(data.cloudPosition);
        // Add gentle floating noise
        targetPos.y += Math.sin(state.clock.elapsedTime + data.id) * 0.02;
      } else if (mode === AppMode.FOCUS) {
        // In focus mode, keep most in cloud, but bring one to front
        targetPos.copy(data.cloudPosition);
        
        // Simple logic: if pinch is active, bring the photo with index matching a modulus of time/gesture to front
        // For robustness without complex raycasting, we focus on the *first* photo if it exists
        if (data.type === 'PHOTO' && index === 0) {
            targetPos.set(0, 0, 6); // Front of camera
            targetScale = 3.5;
            targetRot = new THREE.Euler(0, 0, 0); // Face forward
        } else {
             // Push others back slightly/blur logic (simulated by scale)
             targetScale = data.scale * 0.5;
        }
      }

      // 2. Animate Transitions (Lerp)
      // Position
      easing.damp3(child.position, targetPos, 0.6, delta);
      // Scale
      const currentScale = child.scale.x; // Uniform scale
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 4);
      child.scale.setScalar(nextScale);
      // Rotation
      if (mode === AppMode.FOCUS && data.type === 'PHOTO' && index === 0) {
         easing.dampE(child.rotation, [0,0,0], 0.5, delta);
      } else {
         child.rotation.x += delta * 0.2;
         child.rotation.y += delta * 0.1;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => {
        // Assign texture
        let map = null;
        if (p.type === 'PHOTO') {
            if (i < userTextures.length) map = userTextures[i];
            else if (dummyTextures.length > 0) map = dummyTextures[i % dummyTextures.length];
        }

        return (
          <mesh key={p.id} position={p.position} rotation={p.rotation} castShadow receiveShadow>
            {p.type === 'SPHERE' && <sphereGeometry args={[1, 32, 32]} />}
            {p.type === 'CUBE' && <boxGeometry args={[1.2, 1.2, 1.2]} />}
            {p.type === 'PHOTO' && <boxGeometry args={[1.5, 1.5, 0.1]} />} {/* Photo Frame */}

            <meshStandardMaterial
              color={p.type === 'PHOTO' ? 'white' : p.color}
              metalness={0.6}
              roughness={0.2}
              emissive={p.color}
              emissiveIntensity={p.type === 'PHOTO' ? 0.1 : 0.4}
              map={map}
            />
          </mesh>
        );
      })}
      
      {/* Decorative Star at Top */}
      <mesh position={[0, TREE_HEIGHT / 2 + 1, 0]}>
         <octahedronGeometry args={[1.5, 0]} />
         <meshStandardMaterial color={COLORS.GOLD} emissive={COLORS.GOLD} emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  );
};

export default TreeParticles;
