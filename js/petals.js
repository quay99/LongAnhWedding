/**
 * HIGH PERFORMANCE CANVAS FALLING ANIMATION (PETALS, LEAVES, HEARTS, GOLD GLITTER)
 * Tự động điều chỉnh hình dáng và màu sắc rơi dựa theo theme của website.
 */

class FallingPetals {
  constructor() {
    this.canvas = document.getElementById('falling-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.active = true;
    this.particles = [];
    this.maxParticles = 35; // Giới hạn số lượng hạt để giữ mượt trên di động
    this.theme = 'cream'; // cream, pink, blue, red, brown
    
    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.resizeCanvas();
    this.updateTheme();
    this.createParticles(true);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Theo dõi thuộc tính body để cập nhật theme rơi
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          this.updateTheme();
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
  }

  updateTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'cream';
    if (this.theme !== currentTheme) {
      this.theme = currentTheme;
      this.createParticles(false); // Tạo lại hạt phù hợp với theme mới
    }
  }

  toggle(state) {
    if (state !== undefined) {
      this.active = state;
    } else {
      this.active = !this.active;
    }
    
    if (this.active) {
      this.canvas.style.display = 'block';
      this.createParticles(true);
    } else {
      this.canvas.style.display = 'none';
      this.particles = [];
    }
  }

  createParticles(initial) {
    this.particles = [];
    const count = window.innerWidth < 768 ? this.maxParticles / 2 : this.maxParticles;
    
    for (let i = 0; i < count; i++) {
      this.particles.push(this.generateParticle(initial));
    }
  }

  generateParticle(randomY = false) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -20 - (Math.random() * 50),
      size: 8 + Math.random() * 12,
      speedX: -1 + Math.random() * 2,
      speedY: 1 + Math.random() * 1.5,
      opacity: 0.4 + Math.random() * 0.5,
      angle: Math.random() * Math.PI * 2,
      spinSpeed: -0.02 + Math.random() * 0.04,
      color: this.getParticleColor(),
      type: this.getParticleType()
    };
  }

  getParticleColor() {
    // Trả về bảng màu của hạt tương ứng với theme
    const colors = {
      cream: ['#C5A880', '#D4AF37', '#E5C494', '#F3E5D8'], // Vàng kim, lấp lánh
      pink: ['#F4C2C2', '#FFD1DC', '#E28D98', '#FFF0F2'],  // Cánh đào đào hồng
      blue: ['#8FA89B', '#AEC6CF', '#B2D8D0', '#E3ECE9'],  // Lá sage xanh, xô thơm
      red: ['#C82A36', '#FF4D4D', '#FF8080', '#FA3C4C'],   // Cánh hồng đỏ, trái tim
      brown: ['#A08266', '#C8AD7F', '#E4D3C5', '#8A6D56']  // Lá thu phong nâu vàng
    };
    
    const themeColors = colors[this.theme] || colors.cream;
    return themeColors[Math.floor(Math.random() * themeColors.length)];
  }

  getParticleType() {
    // Trả về loại hạt tương ứng với theme
    const types = {
      cream: 'glitter',  // Bụi vàng kim lấp lánh
      pink: 'petal',     // Cánh hoa
      blue: 'leaf',      // Lá xanh
      red: 'heart',      // Trái tim & Cánh hoa đỏ
      brown: 'autumn'    // Lá phong rụng
    };
    return types[this.theme] || 'glitter';
  }

  drawParticle(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.angle);
    this.ctx.globalAlpha = p.opacity;
    this.ctx.fillStyle = p.color;

    switch (p.type) {
      case 'petal': // Cánh hoa đào
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
        this.ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
        this.ctx.fill();
        break;

      case 'leaf': // Lá cây thon dài
      case 'autumn':
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size / 2);
        this.ctx.quadraticCurveTo(-p.size / 3, 0, 0, p.size / 2);
        this.ctx.quadraticCurveTo(p.size / 3, 0, 0, -p.size / 2);
        this.ctx.fill();
        break;

      case 'heart': // Trái tim nhỏ lãng mạn
        const size = p.size * 0.7;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size / 4);
        this.ctx.bezierCurveTo(-size / 2, -size * 0.8, -size, -size * 0.3, 0, size * 0.75);
        this.ctx.bezierCurveTo(size, -size * 0.3, size / 2, -size * 0.8, 0, -size / 4);
        this.ctx.fill();
        break;

      case 'glitter': // Hạt bụi kim lấp lánh
      default:
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 3.5, 0, Math.PI * 2);
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
        this.ctx.fill();
        break;
    }

    this.ctx.restore();
  }

  updateParticle(p) {
    p.y += p.speedY;
    p.x += p.speedX;
    p.angle += p.spinSpeed;
    
    // Nếu hạt rơi khỏi màn hình thì reset lên đỉnh đầu
    if (p.y > this.canvas.height + 20 || p.x < -20 || p.x > this.canvas.width + 20) {
      Object.assign(p, this.generateParticle(false));
    }
  }

  animate() {
    if (this.active) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        this.drawParticle(p);
        this.updateParticle(p);
      }
    }
    requestAnimationFrame(() => this.animate());
  }
}

// Khởi tạo đối tượng fallingPetals khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
  window.fallingPetals = new FallingPetals();
});
