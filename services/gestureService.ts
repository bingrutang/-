// Helper to calculate Euclidean distance between two 3D points
const distance = (p1: any, p2: any) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
};

export const detectGesture = (landmarks: any[]) => {
  if (!landmarks || landmarks.length === 0) return null;
  const lm = landmarks[0]; // Assume one hand for simplicity

  // Fingertip indices: Thumb=4, Index=8, Middle=12, Ring=16, Pinky=20
  // Base indices: Thumb=2, Index=5, Middle=9, Ring=13, Pinky=17
  // Wrist: 0

  const thumbTip = lm[4];
  const indexTip = lm[8];
  const middleTip = lm[12];
  const ringTip = lm[16];
  const pinkyTip = lm[20];
  const wrist = lm[0];

  // 1. Detect Fist: Fingertips are close to the palm/base
  // Simple check: Tips below intermediate joints (y coordinate in screen space)
  // Or distance to wrist is small compared to open hand.
  const isFist = 
    distance(indexTip, wrist) < 0.15 && 
    distance(middleTip, wrist) < 0.15 &&
    distance(ringTip, wrist) < 0.15 &&
    distance(pinkyTip, wrist) < 0.15;

  // 2. Detect Open Hand: Tips are far from wrist
  const isOpen = 
    !isFist &&
    distance(indexTip, wrist) > 0.25 &&
    distance(middleTip, wrist) > 0.25 &&
    distance(pinkyTip, wrist) > 0.25;

  // 3. Detect Pinch: Thumb tip close to Index tip
  const pinchDist = distance(thumbTip, indexTip);
  const isPinching = pinchDist < 0.05;

  // 4. Calculate Rotation (Roll) approximation
  // Angle of the line from wrist to middle finger base relative to vertical
  const middleBase = lm[9];
  const dx = middleBase.x - wrist.x;
  const dy = middleBase.y - wrist.y;
  const rotation = Math.atan2(dy, dx);

  return {
    isFist,
    isOpen,
    isPinching,
    rotation,
    handPosition: { x: lm[9].x, y: lm[9].y }, // Use middle finger knuckle as center
  };
};
