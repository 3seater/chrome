import { useEffect, useRef } from 'react';
import './AsciiTrail.css';

export default function GlowTrail({
  glowSize = 60,
  fadeSpeed = 0.012,
  trailLength = 100,
  density = 2
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const prevMouseRef = useRef({ x: -100, y: -100 });
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Calculate distance moved
      const dx = mouseRef.current.x - prevMouseRef.current.x;
      const dy = mouseRef.current.y - prevMouseRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Add particles based on movement
      const particlesToAdd = Math.min(Math.floor(distance / density), 15);
      
      for (let i = 0; i < particlesToAdd; i++) {
        const t = i / particlesToAdd;
        const x = prevMouseRef.current.x + dx * t;
        const y = prevMouseRef.current.y + dy * t;
        
        particlesRef.current.push({
          x: x,
          y: y,
          opacity: 1.0,
          size: glowSize * (0.8 + Math.random() * 0.4)
        });
      }
      
      // Limit particles
      if (particlesRef.current.length > trailLength) {
        particlesRef.current = particlesRef.current.slice(-trailLength);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.opacity -= fadeSpeed;
        
        if (particle.opacity <= 0) return false;
        
        // Draw glowing circle
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity * 0.8})`);
        gradient.addColorStop(0.3, `rgba(255, 255, 255, ${particle.opacity * 0.4})`);
        gradient.addColorStop(0.6, `rgba(255, 255, 255, ${particle.opacity * 0.1})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        return true;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [glowSize, fadeSpeed, trailLength, density]);

  return <canvas ref={canvasRef} className="ascii-trail-canvas" />;
}

