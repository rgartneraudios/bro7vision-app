// src/components/SequentialBackground.jsx
import React, { useState, useEffect, useRef } from 'react';

const SequentialBackground = ({ videos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  const handleEnded = () => {
    // Cuando termina uno, pasa al siguiente (y vuelve a 0 al final)
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  useEffect(() => {
    // Cuando cambia el índice, carga el nuevo video y dale play
    if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
    }
  }, [currentIndex]);

  return (
    <video
      ref={videoRef}
      src={videos[currentIndex]}
      autoPlay
      muted
      playsInline
      onEnded={handleEnded}
      className="w-full h-full object-cover animate-fadeIn transition-opacity duration-1000"
    />
  );
};

export default SequentialBackground;