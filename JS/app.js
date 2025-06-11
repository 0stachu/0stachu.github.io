document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    const music = document.getElementById('background-music');
    const cursorDot = document.getElementById('cursor-dot');

    // --- Audio Interaction ---
    splashScreen.addEventListener('click', () => {
        music.volume = 0.1;
        const playPromise = music.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => { console.error("Audio play was prevented.", error); });
        }
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            mainContent.style.opacity = '1';
        }, 1000);
    });

    // --- Cursor & Background Animation ---
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let stars = [], shootingStars = [], trailParticles = [];
    
    class Star {
        constructor() {
            this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
            this.z = Math.random() * canvas.width; this.size = Math.random() * 2.5 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.5;
        }
        draw() {
            const parallaxFactor = 0.05;
            const parallaxX = (mouseX - canvas.width / 2) * parallaxFactor / this.z;
            const parallaxY = (mouseY - canvas.height / 2) * parallaxFactor / this.z;
            const perspective = canvas.width / this.z;
            const x = (this.x - canvas.width / 2 + parallaxX) * perspective + canvas.width / 2;
            const y = (this.y - canvas.height / 2 + parallaxY) * perspective + canvas.height / 2;
            const alpha = this.opacity * Math.abs(Math.sin(Date.now() * 0.0001 * this.size));
            if(x > 0 && x < canvas.width && y > 0 && y < canvas.height){
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath(); ctx.arc(x, y, this.size * perspective, 0, Math.PI * 2); ctx.fill();
            }
        }
        update() {
           this.z -= 0.15;
           if(this.z <= 0) { this.z = canvas.width; }
        }
    }
    
    class ShootingStar {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
            this.len = Math.random() * 80 + 10; this.speed = Math.random() * 10 + 6;
            this.size = Math.random() * 1 + 0.1; this.active = false;
            setTimeout(() => { this.active = true; }, Math.random() * 3000);
        }
        update() {
            if (this.active) {
                this.x -= this.speed;
                if (this.x < -this.len) { this.reset(); }
            }
        }
        draw() {
            if (this.active) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.beginPath();
                ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + this.len, this.y);
                ctx.lineWidth = this.size; ctx.stroke();
            }
        }
    }
    
    class TrailParticle {
        constructor(x, y) {
            this.x = x; this.y = y; this.size = Math.random() * 4 + 2; this.opacity = 1;
            this.vx = (Math.random() - 0.5) * 2; this.vy = (Math.random() - 0.5) * 2;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            this.size *= 0.96; this.opacity *= 0.96;
        }
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        }
    }
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createStars();
    }
    window.addEventListener('resize', resizeCanvas);

    function createStars() {
        stars = [];
        const starCount = Math.floor(canvas.width / 3);
        for (let i = 0; i < starCount; i++) { stars.push(new Star()); }
        shootingStars = [];
        for(let i=0; i<3; i++) { shootingStars.push(new ShootingStar()); }
    }

    function drawNebulae() {
        const nebulae = [
            { x: canvas.width * 0.2, y: canvas.height * 0.3, r1: 50, r2: 300, color1: 'rgba(79, 70, 229, 0.05)', color2: 'rgba(79, 70, 229, 0)' },
            { x: canvas.width * 0.8, y: canvas.height * 0.7, r1: 50, r2: 400, color1: 'rgba(124, 58, 237, 0.05)', color2: 'rgba(124, 58, 237, 0)' }
        ];
        nebulae.forEach(n => {
            let grad = ctx.createRadialGradient(n.x, n.y, n.r1, n.x, n.y, n.r2);
            grad.addColorStop(0, n.color1); grad.addColorStop(1, n.color2);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
    }
    
    window.addEventListener('mousemove', (e) => {
        trailParticles.push(new TrailParticle(e.clientX, e.clientY));
    });

    function animate() {
        requestAnimationFrame(animate);
        cursorDot.style.left = mouseX + 'px'; cursorDot.style.top = mouseY + 'px';
        ctx.fillStyle = '#0c0a14'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawNebulae();
        stars.forEach(s => { s.update(); s.draw(); });
        shootingStars.forEach(s => { s.update(); s.draw(); })
        for (let i = trailParticles.length - 1; i >= 0; i--) {
            const p = trailParticles[i]; p.update(); p.draw();
            if (p.opacity <= 0.01) { trailParticles.splice(i, 1); }
        }
    }
    
    resizeCanvas();
    animate();
});
