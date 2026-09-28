/* ==========================================================================
   JEEVA PHOTOGRAPHY - LIGHTBOX ENGINE
   ========================================================================== */

class Lightbox {
  constructor() {
    this.modal = document.getElementById('lightboxModal');
    this.image = document.getElementById('lightboxImage');
    this.category = document.getElementById('lightboxCategory');
    this.title = document.getElementById('lightboxTitle');
    this.closeBtn = document.getElementById('lightboxClose');
    this.prevBtn = document.getElementById('lightboxPrev');
    this.nextBtn = document.getElementById('lightboxNext');
    
    this.currentIndex = 0;
    this.activeList = [];

    this.init();
  }

  init() {
    if (!this.modal) return;

    this.closeBtn.addEventListener('click', () => this.close());
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());

    // Backdrop click to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.modal.classList.contains('active')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }

  open(list, index = 0) {
    this.activeList = list;
    this.currentIndex = index;
    this.render();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  next() {
    if (this.activeList.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.activeList.length;
    this.render();
  }

  prev() {
    if (this.activeList.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.activeList.length) % this.activeList.length;
    this.render();
  }

  render() {
    const item = this.activeList[this.currentIndex];
    if (!item) return;

    this.image.style.opacity = '0';
    setTimeout(() => {
      this.image.src = item.fullImage || item.image;
      this.image.alt = item.title;
      this.category.textContent = item.categoryLabel || item.category;
      this.title.textContent = item.title;
      this.image.style.opacity = '1';
    }, 150);
  }
}

// Global Lightbox instance initialized in main.js
window.LightboxInstance = null;
