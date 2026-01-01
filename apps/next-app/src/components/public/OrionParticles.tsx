'use client';

import { useMemo } from 'react';

export default function OrionParticles() {
  const { eyeMouthParticles, backgroundParticles } = useMemo(() => {
    // Particules pour les yeux (2 yeux) - plus grosses et visibles
    const eyeParticles = Array.from({ length: 16 }).map((_, i) => {
      const eyeIndex = i < 8 ? 0 : 1; // 0 = œil gauche, 1 = œil droit
      const particleIndex = i % 8;
      const baseX = eyeIndex === 0 ? 42 : 58; // Position X approximative des yeux (en %)
      const baseY = 35; // Position Y approximative des yeux (en %)
      const angle = (particleIndex / 8) * 360;
      const radius = 2.5 + (particleIndex % 2) * 2;
      
      return {
        id: `eye-${i}`,
        x: baseX + Math.cos((angle * Math.PI) / 180) * radius,
        y: baseY + Math.sin((angle * Math.PI) / 180) * radius,
        delay: particleIndex * 0.12,
        size: 6 + Math.random() * 4, // 6-10px (plus grosses)
        duration: 2 + Math.random() * 1, // 2-3s
      };
    });

    // Particules pour la bouche (centre) - plus grosses et visibles
    const mouthParticles = Array.from({ length: 12 }).map((_, i) => {
      const baseX = 50; // Centre
      const baseY = 60; // Position Y approximative de la bouche (en %)
      const angle = (i / 12) * 360; // Répartition circulaire
      const radius = 3 + (i % 3) * 2;
      
      return {
        id: `mouth-${i}`,
        x: baseX + Math.cos((angle * Math.PI) / 180) * radius,
        y: baseY + Math.sin((angle * Math.PI) / 180) * radius,
        delay: i * 0.1,
        size: 5 + Math.random() * 4, // 5-9px (plus grosses)
        duration: 1.8 + Math.random() * 1.2, // 1.8-3s
      };
    });

    // Particules de fond qui remontent de bas en haut - plus nombreuses, plus grosses et plus visibles
    const backgroundParticles = Array.from({ length: 50 }).map((_, i) => {
      // Position X aléatoire entre 15% et 85% pour être derrière le robot
      const startX = 15 + Math.random() * 70;
      // Dérive horizontale aléatoire
      const driftX = (Math.random() - 0.5) * 40; // -20px à +20px
      
      return {
        id: `bg-${i}`,
        x: startX,
        driftX: driftX,
        delay: (i / 50) * 12, // Répartir sur 12 secondes
        size: 8 + Math.random() * 10, // 8-18px (beaucoup plus grosses)
        duration: 5 + Math.random() * 5, // 5-10s
      };
    });

    return {
      eyeMouthParticles: [...eyeParticles, ...mouthParticles],
      backgroundParticles,
    };
  }, []);

  return (
    <>
       {/* Background particles - behind the robot */}
       <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
         {backgroundParticles.map((particle) => (
           <div
             key={particle.id}
             className="absolute rounded-full orion-background-particle"
             style={{
               left: `${particle.x}%`,
               bottom: '0px',
               width: `${particle.size}px`,
               height: `${particle.size}px`,
               background: 'radial-gradient(circle, rgba(59, 130, 246, 1) 0%, rgba(59, 130, 246, 0.9) 40%, rgba(59, 130, 246, 0.6) 70%, rgba(59, 130, 246, 0.2) 100%)',
               boxShadow: '0 0 16px rgba(59, 130, 246, 1), 0 0 32px rgba(59, 130, 246, 0.9), 0 0 48px rgba(59, 130, 246, 0.6), 0 0 64px rgba(59, 130, 246, 0.3)',
               filter: 'blur(0.5px)',
               '--flow-duration': `${particle.duration}s`,
               '--flow-delay': `${particle.delay}s`,
               '--drift-x': `${particle.driftX}px`,
             } as React.CSSProperties}
           />
         ))}
       </div>

       {/* Eye and mouth particles - in front */}
       <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
         {eyeMouthParticles.map((particle) => (
           <div
             key={particle.id}
             className="absolute rounded-full orion-particle"
             style={{
               left: `${particle.x}%`,
               top: `${particle.y}%`,
               width: `${particle.size}px`,
               height: `${particle.size}px`,
               transform: 'translate(-50%, -50%)',
               background: 'radial-gradient(circle, rgba(59, 130, 246, 1) 0%, rgba(59, 130, 246, 0.8) 40%, rgba(59, 130, 246, 0.5) 70%, rgba(59, 130, 246, 0.2) 100%)',
               boxShadow: '0 0 16px rgba(59, 130, 246, 1), 0 0 32px rgba(59, 130, 246, 0.8), 0 0 48px rgba(59, 130, 246, 0.5), 0 0 64px rgba(59, 130, 246, 0.3)',
               filter: 'blur(0.3px)',
               '--duration': `${particle.duration}s`,
               '--delay': `${particle.delay}s`,
             } as React.CSSProperties}
           />
         ))}
       </div>
    </>
  );
}

