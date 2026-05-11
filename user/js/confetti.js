/* ═══════════════════════════════════════════════════════════════════
   Libas Collection — Premium Cinematic Confetti & Welcome Popup
   ═══════════════════════════════════════════════════════════════════ */

function triggerConfettiAndWelcome(username, message = "Welcome to Libas Collection!") {
    // 1. Create the Luxury Welcome Popup
    const popup = document.createElement('div');
    popup.innerHTML = `
        <div style="position:fixed;top:40px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,rgba(24,6,38,0.95),rgba(59,7,100,0.95));backdrop-filter:blur(10px);border:1px solid rgba(212,175,55,0.4);border-radius:16px;padding:24px 36px;box-shadow:0 20px 50px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.1);z-index:99999;text-align:center;min-width:320px;animation:slideDownPop 0.6s cubic-bezier(0.2, 1, 0.3, 1) forwards;">
            <div style="font-size:36px;margin-bottom:12px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3))">🎉</div>
            <div style="font-family:'Cinzel',serif;font-size:22px;font-weight:700;background:linear-gradient(90deg,#C9A020,#E8CC6A,#C9A020);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:1px;margin-bottom:6px">Hi, ${username}!</div>
            <div style="font-family:'Lato',sans-serif;font-size:14px;color:rgba(255,255,255,0.85);font-weight:400">${message}</div>
        </div>
        <style>
            @keyframes slideDownPop {
                0% { top: -120px; opacity: 0; transform: translateX(-50%) scale(0.9); }
                100% { top: 40px; opacity: 1; transform: translateX(-50%) scale(1); }
            }
            @keyframes slideUpFade {
                0% { top: 40px; opacity: 1; transform: translateX(-50%) scale(1); }
                100% { top: -120px; opacity: 0; transform: translateX(-50%) scale(0.9); }
            }
        </style>
    `;
    document.body.appendChild(popup);

    // Remove popup after 4 seconds
    setTimeout(() => {
        popup.children[0].style.animation = 'slideUpFade 0.5s cubic-bezier(0.2, 1, 0.3, 1) forwards';
        setTimeout(() => popup.remove(), 500);
    }, 4000);

    // 2. Create Cinematic Canvas Confetti
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '99998';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    
    function setCanvasSize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const colors = [
        '#D4AF37', '#E8CC6A', '#C9A020', // Golds
        '#3B0764', '#6D28D9', '#4C1D95', // Purples
        '#ffffff', '#f8f4ee', // Whites/Creams
        '#10B981', '#F43F5E'  // Vibrant accents
    ];
    
    const particleCount = window.innerWidth < 600 ? 250 : 450; // Heavy density, scale by device
    const particles = [];

    class Particle {
        constructor(isLeft) {
            this.x = isLeft ? -20 : width + 20; // Start slightly off-screen
            this.y = height + 20;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            // Mix of tiny, medium, and large pieces
            const sizeMultiplier = Math.random();
            this.w = sizeMultiplier * 10 + 6;  // 6 to 16
            this.h = sizeMultiplier * 14 + 10; // 10 to 24
            
            // Physics
            this.drag = 0.95 + (Math.random() * 0.02); // 0.95 to 0.97
            this.gravity = Math.random() * 0.15 + 0.1; // 0.1 to 0.25
            
            // Trajectory calculations to cover the screen cinematically
            const targetX = (width / 2) * (Math.random() * 1.2 + 0.4);
            const targetY = height * (Math.random() * 0.8 + 0.5);
            
            const baseVx = targetX * (1 - this.drag);
            const baseVy = targetY * (1 - this.drag);
            
            this.vx = isLeft ? baseVx : -baseVx;
            this.vy = -baseVy;
            
            // Add explosive spread
            this.vx += (Math.random() - 0.5) * 15;
            this.vy += (Math.random() - 0.5) * 15;
            
            // Rotations and drifting
            this.tiltAngle = Math.random() * Math.PI * 2;
            this.tiltSpeed = (Math.random() * 0.08) + 0.02;
            this.spinAngle = Math.random() * Math.PI * 2;
            this.spinSpeed = (Math.random() * 0.1) - 0.05;
            
            this.wobblePhase = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.05 + 0.02;
            this.wobbleAmp = Math.random() * 2 + 1;
            
            this.opacity = 1;
        }

        update() {
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.vy += this.gravity;
            
            this.x += this.vx + Math.sin(this.wobblePhase) * this.wobbleAmp;
            this.y += this.vy;
            
            this.tiltAngle += this.tiltSpeed;
            this.spinAngle += this.spinSpeed;
            this.wobblePhase += this.wobbleSpeed;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.spinAngle);
            ctx.globalAlpha = this.opacity;
            
            // Simulate 3D flipping via Y-axis scaling
            const scaleY = Math.abs(Math.cos(this.tiltAngle));
            ctx.scale(1, scaleY);
            
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
            
            // Premium glossy reflection on the top half
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h / 2);
            
            ctx.restore();
        }
    }

    // Initialize cannon blasts
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(i % 2 === 0));
    }

    let startTime = null;
    const duration = 6000; // 6 seconds total
    let animationFrameId;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            // Smooth fade out during the last 1.5 seconds
            if (elapsed > duration - 1500) {
                p.opacity = Math.max(0, 1 - (elapsed - (duration - 1500)) / 1500);
            }
            p.update();
            p.draw(ctx);
        });
        
        if (elapsed < duration) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', setCanvasSize);
            canvas.remove();
        }
    }
    
    animationFrameId = requestAnimationFrame(animate);
}

// Auto-check on load (if redirect happened after signup)
document.addEventListener('DOMContentLoaded', () => {
    const welcomeUser = sessionStorage.getItem('libas_welcome_user');
    if (welcomeUser) {
        sessionStorage.removeItem('libas_welcome_user');
        setTimeout(() => triggerConfettiAndWelcome(welcomeUser), 300);
    }
});
