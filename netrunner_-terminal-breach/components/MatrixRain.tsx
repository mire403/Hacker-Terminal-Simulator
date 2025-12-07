import React, { useEffect, useRef } from 'react';

const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Replaced Japanese with requested text
    const customText = 'Made By Haoze Zheng '; 
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    // Repeat custom text to give it weight in the random selection
    const alphabet = customText.repeat(3) + latin + nums;

    const fontSize = 16;
    const columns = width / fontSize;

    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start randomly off-screen
    }

    const draw = () => {
      // Dark fade for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px 'Fira Code', monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        
        // Make the leading character white (head of the stream), others default to green
        // Since we are drawing over a faded canvas, drawing bright white now creates the head
        ctx.fillStyle = '#FFF'; 
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // We re-draw the previous character in Green to ensure the "trail" is green
        // (Optional visual enhancement: overwriting the white head from previous frame if we tracked it, 
        // but standard fade works well enough. To make it pop, we just draw White here.)
        // Actually, to get a proper matrix look:
        // The loop is just drawing the *current* bottom pixel. 
        // We rely on the fade rect to dim previous ones. 
        // To make the trail green, we can't easily change previous pixels.
        // A simple hack: Draw White. Next frame, the black overlay makes it Grey. 
        // To get Green trails, we strictly draw Green, but occasionally White.
        
        // Simpler Matrix Logic for Canvas:
        // Draw the character.
        const isHead = Math.random() > 0.95; // Occasional bright sparkles
        ctx.fillStyle = isHead ? '#FFF' : '#0F0';
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      const newColumns = width / fontSize;
      if (newColumns > drops.length) {
         for (let i = drops.length; i < newColumns; i++) drops[i] = Math.random() * -100;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ opacity: 0.4 }} 
    />
  );
};

export default MatrixRain;