import * as THREE from 'three';
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: ThreeElements['ambientLight'];
      pointLight: ThreeElements['pointLight'];
      spotLight: ThreeElements['spotLight'];
      color: ThreeElements['color'];
      group: ThreeElements['group'];
      mesh: ThreeElements['mesh'];
      boxGeometry: ThreeElements['boxGeometry'];
      sphereGeometry: ThreeElements['sphereGeometry'];
      octahedronGeometry: ThreeElements['octahedronGeometry'];
      meshStandardMaterial: ThreeElements['meshStandardMaterial'];
    }
  }
}

export enum AppMode {
  TREE = 'TREE',
  CLOUD = 'CLOUD',
  FOCUS = 'FOCUS',
}

export interface ParticleData {
  id: number;
  type: 'SPHERE' | 'CUBE' | 'PHOTO';
  position: THREE.Vector3; // Current visual position
  treePosition: THREE.Vector3; // Target position in tree mode
  cloudPosition: THREE.Vector3; // Target position in cloud mode
  rotation: THREE.Euler;
  color: string;
  texture?: THREE.Texture;
  scale: number;
}

export interface HandGesture {
  isFist: boolean;
  isOpen: boolean;
  isPinching: boolean;
  handPosition: { x: number; y: number }; // Normalized 0-1
  rotation: number; // Approximate rotation of hand
}

export interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  userPhotos: string[];
  addUserPhoto: (url: string) => void;
  gesture: HandGesture;
  setGesture: (g: HandGesture) => void;
}