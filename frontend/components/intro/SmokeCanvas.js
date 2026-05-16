import { useEffect, useRef } from 'react';

export default function SmokeCanvas({ opacity = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let animId;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    // Smoke particles
    const particles = [];
    const NUM = 60;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * W;
        this.y = H + Math.random() * 200;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -(Math.random() * 0.8 + 0.2);
        this.size = Math.random() * 180 + 60;
        this.opacity = Math.random() * 0.12 + 0.03;
        this.fade = Math.random() * 0.002 + 0.001;
        this.life = 1;
        this.hue = Math.random() > 0.7 ? 40 : 0; // occasional warm smoke
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.size += 0.5;
        this.life -= this.fade;
        if (this.life <= 0 || this.y < -this.size) this.reset();
      }

      draw() {
        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        );
        const alpha = this.opacity * this.life;
        grad.addColorStop(0, `hsla(${this.hue}, 0%, 20%, ${alpha})`);
        grad.addColorStop(0.4, `hsla(${this.hue}, 5%, 10%, ${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < NUM; i++) {
      const p = new Particle();
      p.y = Math.random() * H; // spread initial positions
      particles.push(p);
    }

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
}
