import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface ConfettiCelebrationProps {
  show: boolean;
  duration?: number;
  onComplete?: () => void;
}

export function ConfettiCelebration({ 
  show, 
  duration = 7000, 
  onComplete 
}: ConfettiCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { width, height } = useWindowSize();
  
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      <Confetti 
        width={width} 
        height={height} 
        recycle={false}
        numberOfPieces={500}
        gravity={0.15}
        tweenDuration={duration}
        initialVelocityY={-10}
        colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']}
      />
    </div>
  );
} 