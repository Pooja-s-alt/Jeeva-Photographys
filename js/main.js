/* ==========================================================================
   JEEVA PHOTOGRAPHY - MAIN CONTROLLER SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lightbox
  window.LightboxInstance = new Lightbox();

  // 0. Automatic 2-Second Hero Background Slideshow
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides && heroSlides.length > 1) {
    let currentSlideIndex = 0;
    setInterval(() => {
      heroSlides[currentSlideIndex].classList.remove('active');
      currentSlideIndex = (currentSlideIndex + 1) % heroSlides.length;
      heroSlides[currentSlideIndex].classList.add('active');
    }, 2000);
  }

  // 1. Sticky Navigation & Scroll Effects
  const header = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // ScrollSpy active link tracking
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  // 3. Number Counter Animation using IntersectionObserver
  const statsElements = document.querySelectorAll('.stat-number');
  let statsCounted = false;

  const countUp = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2200; // ms
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * target);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    };
    requestAnimationFrame(update);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsCounted) {
        statsCounted = true;
        statsElements.forEach(el => countUp(el));
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // 4. Portfolio Filtering and Rendering
  const portfolioGrid = document.getElementById('portfolioGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  let currentCategory = 'all';

  const getPortfolioItems = () => {
    if (typeof PORTFOLIO_DATA !== 'undefined' && Array.isArray(PORTFOLIO_DATA) && PORTFOLIO_DATA.length > 0) {
      return PORTFOLIO_DATA;
    }
    if (typeof JeevaDB !== 'undefined' && typeof JeevaDB.getPortfolio === 'function') {
      return JeevaDB.getPortfolio();
    }
    return [];
  };

  const renderPortfolio = (category = 'all') => {
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = '';

    const allItems = getPortfolioItems();
    const filtered = category === 'all' 
      ? allItems 
      : allItems.filter(item => item.category === category);

    if (!filtered.length) {
      portfolioGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-dark-muted);padding:3rem">No photos in this category yet.</div>';
      return;
    }

    filtered.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `portfolio-item ${item.format || ''} reveal active`;
      card.innerHTML = `
        <img class="portfolio-thumb" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='images/hero-slide-1.jpg'" />
        <div class="portfolio-hover-overlay">
          <span class="portfolio-cat">${item.categoryLabel || item.category}</span>
          <h3 class="portfolio-caption">${item.title}</h3>
          <div class="portfolio-view-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.LightboxInstance.open(filtered, index);
      });

      portfolioGrid.appendChild(card);
    });
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter');
      renderPortfolio(currentCategory);
    });
  });

  // Initial render of portfolio
  renderPortfolio('all');

  // 4.5 Highlights & Cinematic Video Gallery Controller
  const videoGrid = document.getElementById('videoHighlightsGrid');
  const videoFilterBtns = document.querySelectorAll('.video-filter-btn');
  const cinemaModal = document.getElementById('videoCinemaModal');
  const cinemaPlayer = document.getElementById('cinemaVideoPlayer');
  const cinemaIframe = document.getElementById('cinemaIframePlayer');
  const cinemaCloseBtn = document.getElementById('videoCinemaClose');
  const cinemaCloseLink = document.getElementById('cinemaCloseBtn');
  const cinemaBackdrop = document.getElementById('videoCinemaBackdrop');
  const cinemaPrevBtn = document.getElementById('cinemaPrevBtn');
  const cinemaNextBtn = document.getElementById('cinemaNextBtn');
  const cinemaBadge = document.getElementById('cinemaBadge');
  const cinemaCat = document.getElementById('cinemaCat');
  const cinemaCount = document.getElementById('cinemaCount');
  const cinemaTitle = document.getElementById('cinemaTitle');
  const cinemaDesc = document.getElementById('cinemaDesc');
  const cinemaBookBtn = document.getElementById('cinemaBookBtn');
  const cinemaSwitcherList = document.getElementById('cinemaSwitcherList');

  let activeVideoList = [];
  let currentVideoIndex = 0;

  // Helper to parse YouTube, Vimeo, or direct MP4 video URLs
  const parseVideoSource = (src) => {
    if (!src) return { type: 'none', url: '' };
    const str = String(src).trim();

    // YouTube regex (supports watch?v=, youtu.be/, /embed/, /shorts/)
    const ytMatch = str.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const vidId = ytMatch[1];
      return {
        type: 'youtube',
        id: vidId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${vidId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        thumbnail: `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`,
        fallbackThumb: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`
      };
    }

    // Vimeo regex
    const vimeoMatch = str.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      const vidId = vimeoMatch[1];
      return {
        type: 'vimeo',
        id: vidId,
        embedUrl: `https://player.vimeo.com/video/${vidId}?autoplay=1&title=0&byline=0&portrait=0`,
        thumbnail: ''
      };
    }

    // Direct video file (MP4, WebM, etc.)
    return {
      type: 'direct',
      url: str
    };
  };

  const renderCinemaFilm = (index) => {
    if ((!cinemaPlayer && !cinemaIframe) || !activeVideoList.length) return;
    if (index < 0) index = 0;
    if (index >= activeVideoList.length) index = activeVideoList.length - 1;
    currentVideoIndex = index;

    const videoItem = activeVideoList[currentVideoIndex];
    if (!videoItem) return;

    // Pause any grid preview videos
    document.querySelectorAll('.video-preview-el').forEach(v => {
      try { v.pause(); } catch(e) {}
    });

    const parsed = parseVideoSource(videoItem.videoSrc);

    if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
      if (cinemaPlayer) {
        cinemaPlayer.pause();
        cinemaPlayer.style.display = 'none';
        cinemaPlayer.removeAttribute('src');
      }
      if (cinemaIframe) {
        cinemaIframe.style.display = 'block';
        cinemaIframe.src = parsed.embedUrl;
      }
    } else {
      if (cinemaIframe) {
        cinemaIframe.style.display = 'none';
        cinemaIframe.src = '';
      }
      if (cinemaPlayer) {
        cinemaPlayer.style.display = 'block';
        cinemaPlayer.pause();
        cinemaPlayer.src = videoItem.videoSrc || '';
        cinemaPlayer.load();
        const playPromise = cinemaPlayer.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('Cinema autoplay prevented; waiting for user interaction:', err);
          });
        }
      }
    }

    if (cinemaBadge) cinemaBadge.textContent = videoItem.badge || '4K Ultra HD';
    if (cinemaCat) cinemaCat.textContent = videoItem.categoryLabel || 'Wedding Film';
    if (cinemaCount) cinemaCount.textContent = `Film ${currentVideoIndex + 1} of ${activeVideoList.length}`;
    if (cinemaTitle) cinemaTitle.textContent = videoItem.title;
    if (cinemaDesc) cinemaDesc.textContent = videoItem.description;

    // Update mini film switcher strip
    if (cinemaSwitcherList) {
      cinemaSwitcherList.innerHTML = '';
      activeVideoList.forEach((item, idx) => {
        const chip = document.createElement('button');
        chip.className = `switcher-chip ${idx === currentVideoIndex ? 'active' : ''}`;
        chip.innerHTML = `
          <span class="switcher-chip-num">0${idx + 1}</span>
          <span>${item.couple || item.title.split('—')[0].trim()}</span>
        `;
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          renderCinemaFilm(idx);
        });
        cinemaSwitcherList.appendChild(chip);
      });
    }
  };

  const openCinemaModal = (list, index = 0) => {
    if (!cinemaModal || !list || !list.length) return;
    activeVideoList = list;
    cinemaModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCinemaFilm(index);
  };

  const closeCinemaModal = () => {
    if (!cinemaModal) return;
    if (cinemaPlayer) {
      try {
        cinemaPlayer.pause();
        cinemaPlayer.removeAttribute('src');
        cinemaPlayer.load();
      } catch (e) {}
    }
    if (cinemaIframe) {
      cinemaIframe.src = '';
      cinemaIframe.style.display = 'none';
    }
    cinemaModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  const nextCinemaFilm = () => {
    if (!activeVideoList.length) return;
    const nextIdx = (currentVideoIndex + 1) % activeVideoList.length;
    renderCinemaFilm(nextIdx);
  };

  const prevCinemaFilm = () => {
    if (!activeVideoList.length) return;
    const prevIdx = (currentVideoIndex - 1 + activeVideoList.length) % activeVideoList.length;
    renderCinemaFilm(prevIdx);
  };

  if (cinemaCloseBtn) cinemaCloseBtn.addEventListener('click', closeCinemaModal);
  if (cinemaCloseLink) {
    cinemaCloseLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeCinemaModal();
    });
  }
  if (cinemaBackdrop) cinemaBackdrop.addEventListener('click', closeCinemaModal);
  if (cinemaPrevBtn) cinemaPrevBtn.addEventListener('click', prevCinemaFilm);
  if (cinemaNextBtn) cinemaNextBtn.addEventListener('click', nextCinemaFilm);

  if (cinemaBookBtn) {
    cinemaBookBtn.addEventListener('click', () => {
      closeCinemaModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (cinemaModal && cinemaModal.classList.contains('active')) {
      if (e.key === 'Escape') closeCinemaModal();
      if (e.key === 'ArrowRight') nextCinemaFilm();
      if (e.key === 'ArrowLeft') prevCinemaFilm();
    }
  });

  const getVideoItems = () => {
    if (typeof JeevaDB !== 'undefined' && typeof JeevaDB.getVideos === 'function') {
      return JeevaDB.getVideos();
    }
    return typeof VIDEO_HIGHLIGHTS_DATA !== 'undefined' ? VIDEO_HIGHLIGHTS_DATA : [];
  };

  const renderHighlights = (filter = 'all') => {
    if (!videoGrid) return;
    videoGrid.innerHTML = '';

    const allVideos = getVideoItems();
    const filteredVideos = filter === 'all'
      ? allVideos
      : allVideos.filter(v => v.category === filter);

    if (!filteredVideos.length) {
      videoGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-dark-muted);padding:3rem">No films in this category yet.</div>';
      return;
    }

    filteredVideos.forEach((video, index) => {
      const isFeatured = filter === 'all' && index === 0;
      const card = document.createElement('div');
      card.className = `video-card ${isFeatured ? 'featured' : 'standard'} reveal active`;

      const parsed = parseVideoSource(video.videoSrc);
      const posterImg = video.poster || (parsed.type === 'youtube' ? parsed.thumbnail : 'images/hero-slide-1.jpg');

      let mediaHtml = '';
      if (parsed.type === 'direct') {
        mediaHtml = `
          <video 
            class="video-preview-el" 
            muted 
            loop 
            playsinline 
            preload="metadata"
            poster="${posterImg}"
          >
            <source src="${video.videoSrc}" type="video/mp4" />
          </video>
        `;
      } else {
        const fallback = parsed.fallbackThumb || 'images/hero-slide-1.jpg';
        mediaHtml = `
          <img 
            src="${posterImg}" 
            alt="${video.title}" 
            class="video-preview-img" 
            loading="lazy"
            onerror="if(this.src!=='${fallback}')this.src='${fallback}';"
          />
        `;
      }

      card.innerHTML = `
        <div class="video-media-box" data-video-src="${video.videoSrc}">
          ${mediaHtml}

          <div class="video-media-overlay">
            <div class="video-top-meta">
              <span class="video-badge">${video.badge}</span>
              <span class="video-duration-pill">${video.tag || video.duration}</span>
            </div>
            
            <div class="video-play-trigger" title="Play Full Film">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>

            <div class="video-preview-status">
              <span class="status-dot"></span> Click to watch full film
            </div>
          </div>
        </div>

        <div class="video-details-box">
          <div>
            <div class="video-couple-tag">${video.couple}</div>
            <h3 class="video-title">${video.title}</h3>
            <p class="video-desc">${video.description}</p>
          </div>

          <div class="video-card-footer">
            <button class="watch-film-btn" data-video-index="${index}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Watch Full Film
            </button>
            <a href="#contact" class="book-film-link">Inquire for Film →</a>
          </div>
        </div>
      `;

      // Hover to preview video playback (only if direct MP4)
      const mediaBox = card.querySelector('.video-media-box');
      const previewVideo = card.querySelector('.video-preview-el');

      if (mediaBox && previewVideo) {
        mediaBox.addEventListener('mouseenter', () => {
          try { previewVideo.play(); } catch(e) {}
        });
        mediaBox.addEventListener('mouseleave', () => {
          try { previewVideo.pause(); } catch(e) {}
        });
      }

      // Clicking anywhere on the card opens full view cinema
      card.addEventListener('click', (e) => {
        // If clicking on the book link, allow navigation to contact form
        if (e.target.closest('.book-film-link')) return;
        openCinemaModal(filteredVideos, index);
      });

      videoGrid.appendChild(card);
    });
  };

  videoFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      videoFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      renderHighlights(filter);
    });
  });

  // Initial render of highlights
  renderHighlights('all');

  // 4.8 Creative Space Lightbox Showcase Integration
  const studioCards = document.querySelectorAll('.studio-card');
  const STUDIO_GALLERY_DATA = [
    {
      title: "Master Editorial & Color Grading Suite — Dual 4K IPS Workspace",
      category: "The Creative Space",
      categoryLabel: "Color Grading Suite",
      fullImage: "images/studio-workspace.jpg"
    },
    {
      title: "Signature VIP Consultation Lounge & Glowing Emblem",
      category: "The Creative Space",
      categoryLabel: "VIP Lounge",
      fullImage: "images/studio-lounge-logo.jpg"
    },
    {
      title: "Creative Editing Suite & Vision Wall — Focus, Discipline & Vision",
      category: "The Creative Space",
      categoryLabel: "Creative Suite",
      fullImage: "images/studio-vintage-niche.jpg"
    },
    {
      title: "Artisanal Camera Gallery Wall on Architectural Fluted Paneling",
      category: "The Creative Space",
      categoryLabel: "Art & Acoustics",
      fullImage: "images/studio-camera-art.jpg"
    }
  ];

  studioCards.forEach((card) => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-studio-index'), 10) || 0;
      if (window.LightboxInstance) {
        window.LightboxInstance.open(STUDIO_GALLERY_DATA, idx);
      }
    });
  });

  // 5. Before / After Comparison Slider Logic
  const sliderContainer = document.getElementById('comparisonSlider');
  const afterWrapper = document.getElementById('afterWrapper');
  const sliderHandle = document.getElementById('sliderHandle');

  if (sliderContainer && afterWrapper && sliderHandle) {
    let isDragging = false;

    const setSliderPosition = (x) => {
      const rect = sliderContainer.getBoundingClientRect();
      let offsetX = x - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;

      const percentage = (offsetX / rect.width) * 100;
      afterWrapper.style.width = `${percentage}%`;
      sliderHandle.style.left = `${percentage}%`;
    };

    sliderContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setSliderPosition(e.clientX);
    });

    // Touch support for mobile devices
    sliderContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      setSliderPosition(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      setSliderPosition(e.touches[0].clientX);
    });
  }

  // 6. Scroll Reveal Animation for Elements
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => revealObserver.observe(el));

  // 7. Booking Enquiry Form Validation & Submission
  const bookingForm = document.getElementById('bookingForm');
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  const showToast = (msg, duration = 4000) => {
    if (!toast) return;
    toastMessage.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, duration);
  };

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      const service = document.getElementById('eventType').value;
      const date = document.getElementById('eventDate').value;
      const notes = document.getElementById('eventNotes').value.trim();

      if (!name || !phone || !email || !service || !date) {
        showToast('Please fill in all required fields before submitting.');
        return;
      }

      // Format WhatsApp Message
      const whatsappMsg = 
`*NEW PHOTOGRAPHY ENQUIRY - JEEVA PHOTOGRAPHY*
--------------------------------------------
*Client Name:* ${name}
*Phone Number:* ${phone}
*Email Address:* ${email}
*Selected Package:* ${service}
*Event Date:* ${date}
*Vision & Details:* ${notes ? notes : 'Standard Event Session'}
--------------------------------------------
Sent via Jeeva Photography Website`;

      const whatsappUrl = `https://wa.me/919514751045?text=${encodeURIComponent(whatsappMsg)}`;

      // Save enquiry to localStorage for Admin Portal
      const enquiry = {
        id: Date.now(),
        name,
        phone,
        email,
        service,
        date,
        notes: notes || 'Standard Event Session',
        submittedAt: new Date().toISOString(),
        status: 'New'
      };
      const existing = JSON.parse(localStorage.getItem('jp_enquiries') || '[]');
      existing.unshift(enquiry);
      localStorage.setItem('jp_enquiries', JSON.stringify(existing));

      // Show friendly confirmation toast
      showToast(`Thank you, ${name}! Redirecting your enquiry to WhatsApp...`);

      // Open WhatsApp chat in a new tab
      window.open(whatsappUrl, '_blank');

      // Reset form
      bookingForm.reset();
    });
  }

  // 8. Dynamic Testimonials Rendering
  const testimonialsContainer = document.getElementById('testimonialsGridContainer');
  const renderTestimonials = () => {
    if (!testimonialsContainer || typeof JeevaDB === 'undefined') return;
    const list = JeevaDB.getTestimonials();
    if (!list || !list.length) return;

    testimonialsContainer.innerHTML = list.map((item, idx) => {
      const starsStr = '★'.repeat(item.stars || 5) + '☆'.repeat(Math.max(0, 5 - (item.stars || 5)));
      return `
        <div class="testimonial-card reveal active">
          <div>
            <div class="testimonial-stars" style="color:var(--gold);">${starsStr}</div>
            <p class="testimonial-text">${item.text}</p>
          </div>
          <div class="testimonial-client">
            <div class="client-info">
              <h4>${item.name}</h4>
              <span>${item.location || ''}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  // 9. Dynamic Packages Rendering & Quick Booking Deep Links
  const packagesContainer = document.getElementById('packagesGridContainer');
  let activePackageCategory = 'Engagement & Wedding';

  window.setPackageCategory = (cat, btn) => {
    activePackageCategory = cat;
    document.querySelectorAll('.pkg-tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderPackages();
  };

  const attachPackageEvents = () => {
    const packageBtns = document.querySelectorAll('.select-package-btn');
    packageBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const packageVal = btn.getAttribute('data-package-val');
        const select = document.getElementById('eventType');
        if (select && packageVal) {
          select.value = packageVal;
        }
        const contactSec = document.getElementById('contact');
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: 'smooth' });
          if (select) select.focus();
        }
      };
    });

    const packageCards = document.querySelectorAll('.package-card');
    packageCards.forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest('.select-package-btn')) return;
        const packageVal = card.getAttribute('data-package');
        const select = document.getElementById('eventType');
        if (select && packageVal) {
          select.value = packageVal;
        }
        const contactSec = document.getElementById('contact');
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: 'smooth' });
          if (select) select.focus();
        }
      };
    });
  };

  const renderPackages = () => {
    if (!packagesContainer || typeof JeevaDB === 'undefined') return;
    const allPkgs = JeevaDB.getPackages();
    if (!allPkgs || !allPkgs.length) return;

    // Filter by active category
    const list = allPkgs.filter(p => (p.category || 'Engagement & Wedding') === activePackageCategory);
    const displayList = list.length ? list : allPkgs.slice(0, 3);

    packagesContainer.innerHTML = displayList.map(pkg => {
      // Build services HTML
      let servicesHtml = '';
      if (pkg.services && Array.isArray(pkg.services) && pkg.services.length) {
        servicesHtml = `
          <div class="pkg-block-section">
            <h4 class="pkg-main-section-title">SERVICE :</h4>
            ${pkg.services.map(s => `
              <div class="pkg-category-group">
                ${s.group && s.group !== 'SERVICE' ? `<span class="pkg-subgroup-label">${s.group}</span>` : ''}
                <ul class="pkg-square-list">
                  ${(s.items || []).map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        `;
      }

      // Build outputs HTML
      let outputsHtml = '';
      if (pkg.outputs && Array.isArray(pkg.outputs) && pkg.outputs.length) {
        outputsHtml = `
          <div class="pkg-block-section">
            <h4 class="pkg-main-section-title">OUTPUTS :</h4>
            <ul class="pkg-square-list">
              ${pkg.outputs.map(out => `<li>${out}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      // Fallback for simple features if services/outputs are not present
      const fallbackFeaturesHtml = (!servicesHtml && !outputsHtml && pkg.features && pkg.features.length) ? `
        <div class="pkg-block-section">
          <h4 class="pkg-main-section-title">COVERAGE :</h4>
          <ul class="pkg-square-list">
            ${pkg.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      ` : '';

      return `
        <div class="package-card ${pkg.isPopular ? 'popular-card' : ''} reveal active" data-package="${pkg.title} - Rs ${pkg.price}">
          ${pkg.isPopular ? `<div class="popular-badge-pill">${pkg.popularBadge || 'Most Popular'}</div>` : ''}
          <div class="package-header-wrap">
            <h3 class="package-script-title">${pkg.scriptTitle || pkg.title}</h3>
            <span class="package-subtitle-tag">${pkg.subtitle || pkg.category || 'WEDDING'}</span>
          </div>
          
          <div class="package-photo-frame">
            <div class="pkg-main-wrap">
              <img 
                src="${pkg.mainImage || 'images/hero-slide-2.jpg'}" 
                alt="${pkg.title}" 
                class="pkg-main-img" 
                loading="lazy"
                onerror="this.src='images/hero-slide-2.jpg'"
              />
              <div class="pkg-badge-overlay">${pkg.badge || 'PROMESSE'}</div>
            </div>
            <div class="pkg-price-pill">
              <span class="price-currency">${pkg.currency || 'Rs'}</span>
              <span class="price-amount">${pkg.price}</span>
            </div>
          </div>

          <div class="pkg-details-structured">
            ${servicesHtml}
            ${outputsHtml}
            ${fallbackFeaturesHtml}
          </div>

          <div class="package-btn-wrap">
            <a href="#contact" class="btn btn-primary select-package-btn" data-package-val="${pkg.title} - Rs ${pkg.price}">Book Now</a>
          </div>
        </div>
      `;
    }).join('');

    // Also update #eventType options in the booking form with all 3 categories
    const select = document.getElementById('eventType');
    if (select) {
      const currentVal = select.value;
      const engList = allPkgs.filter(p => p.category === 'Engagement & Wedding');
      const wedList = allPkgs.filter(p => p.category === 'Wedding');
      const recepList = allPkgs.filter(p => p.category === 'Wedding & Reception');
      const otherList = allPkgs.filter(p => p.category !== 'Engagement & Wedding' && p.category !== 'Wedding' && p.category !== 'Wedding & Reception');

      select.innerHTML = '<option value="" disabled selected>Select an experience / package</option>' +
        (engList.length ? `<optgroup label="Engagement & Wedding Packages">${engList.map(p => `<option value="${p.title} - Rs ${p.price}">${p.title} — Rs ${p.price}</option>`).join('')}</optgroup>` : '') +
        (wedList.length ? `<optgroup label="Wedding Only Packages">${wedList.map(p => `<option value="${p.title} - Rs ${p.price}">${p.title} — Rs ${p.price}</option>`).join('')}</optgroup>` : '') +
        (recepList.length ? `<optgroup label="Wedding & Reception Packages">${recepList.map(p => `<option value="${p.title} - Rs ${p.price}">${p.title} — Rs ${p.price}</option>`).join('')}</optgroup>` : '') +
        (otherList.length ? `<optgroup label="Other Packages">${otherList.map(p => `<option value="${p.title} - Rs ${p.price}">${p.title} — Rs ${p.price}</option>`).join('')}</optgroup>` : '') +
        '<option value="Custom Bespoke Package">Custom Bespoke Photography & Cinema</option>';
      if (currentVal) select.value = currentVal;
    }

    attachPackageEvents();
  };

  // 10. Studio Settings Sync
  const updateStatsTargets = () => {
    if (typeof JeevaDB === 'undefined') return;
    const s = JeevaDB.getSettings();
    if (!s) return;
    const statsNums = document.querySelectorAll('.stat-number');
    if (statsNums.length >= 4) {
      if (s.yearsExp) statsNums[0].setAttribute('data-target', parseInt(s.yearsExp, 10) || 16);
      if (s.happyClients) statsNums[1].setAttribute('data-target', parseInt(s.happyClients, 10) || 571);
      if (s.momentsCaptured) statsNums[2].setAttribute('data-target', parseInt(s.momentsCaptured, 10) || 1000);
      if (s.passionScore) statsNums[3].setAttribute('data-target', parseInt(s.passionScore, 10) || 100);
    }
  };

  const syncStudioSettings = () => {
    if (typeof JeevaDB === 'undefined') return;
    const s = JeevaDB.getSettings();
    if (!s) return;

    // Update phone links
    if (s.phone) {
      document.querySelectorAll('a[href^="tel:"]').forEach(a => a.href = `tel:${s.phone}`);
      document.querySelectorAll('.footer-phone-text, .header-phone-text').forEach(el => el.textContent = s.phone);
    }
    // Update WhatsApp links
    if (s.whatsapp) {
      const waNum = s.whatsapp.replace(/\D/g, '');
      document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.includes('text=')) {
          a.href = `https://wa.me/${waNum}`;
        }
      });
    }
    // Update Instagram
    if (s.instagramUrl) {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(a => a.href = s.instagramUrl);
    }

    updateStatsTargets();
  };

  // 11. Dynamic Home / Hero Section Rendering
  const renderHome = () => {
    if (typeof JeevaDB === 'undefined') return;
    const h = JeevaDB.getHome();
    if (!h) return;

    // Studio Names
    const scriptName = document.querySelector('.hero-name-script');
    if (scriptName && h.studioNameScript) scriptName.textContent = h.studioNameScript;
    const serifName = document.querySelector('.hero-name-serif');
    if (serifName && h.studioNameSerif) serifName.textContent = h.studioNameSerif;

    // Hero Title & Subtitle
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && (h.heroTitleLine1 || h.heroTitleHighlight)) {
      heroTitle.innerHTML = `${escapeHtmlSafe(h.heroTitleLine1 || 'Preserving Timeless Emotions.')}<br /><span class="highlight">${escapeHtmlSafe(h.heroTitleHighlight || 'Crafting Visual Legacies.')}</span>`;
    }

    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && h.heroSubtitle) {
      heroSubtitle.textContent = h.heroSubtitle;
    }

    // Hero Background Slideshow Images
    const heroImgs = document.querySelectorAll('.hero-bg-img');
    if (heroImgs.length >= 1 && h.heroSlide1) heroImgs[0].src = h.heroSlide1;
    if (heroImgs.length >= 2 && h.heroSlide2) heroImgs[1].src = h.heroSlide2;
    if (heroImgs.length >= 3 && h.heroSlide3) heroImgs[2].src = h.heroSlide3;

    // Hero Trust Bar
    const trustItems = document.querySelectorAll('.hero-trust-item');
    if (trustItems.length >= 4) {
      if (h.trust1Num) { const el = trustItems[0].querySelector('.trust-num'); if (el) el.textContent = h.trust1Num; }
      if (h.trust1Lbl) { const el = trustItems[0].querySelector('.trust-lbl'); if (el) el.textContent = h.trust1Lbl; }
      if (h.trust2Num) { const el = trustItems[1].querySelector('.trust-num'); if (el) el.textContent = h.trust2Num; }
      if (h.trust2Lbl) { const el = trustItems[1].querySelector('.trust-lbl'); if (el) el.textContent = h.trust2Lbl; }
      if (h.trust3Num) { const el = trustItems[2].querySelector('.trust-num'); if (el) el.textContent = h.trust3Num; }
      if (h.trust3Lbl) { const el = trustItems[2].querySelector('.trust-lbl'); if (el) el.textContent = h.trust3Lbl; }
      if (h.trust4Num) { const el = trustItems[3].querySelector('.trust-num'); if (el) el.textContent = h.trust4Num; }
      if (h.trust4Lbl) { const el = trustItems[3].querySelector('.trust-lbl'); if (el) el.textContent = h.trust4Lbl; }
    }
  };

  // 12. Dynamic About / Founder Section Rendering
  const renderAbout = () => {
    if (typeof JeevaDB === 'undefined') return;
    const ab = JeevaDB.getAbout();
    if (!ab) return;

    // Founder Image & Identity
    const founderImg = document.querySelector('.about-img-main');
    if (founderImg && ab.founderImage) founderImg.src = ab.founderImage;

    const founderName = document.querySelector('.founder-name');
    if (founderName && ab.founderName) founderName.textContent = ab.founderName;

    const founderRole = document.querySelector('.founder-role');
    if (founderRole && ab.founderRole) founderRole.textContent = ab.founderRole;

    const badgeNum = document.querySelector('.about-floating-badge .badge-num');
    if (badgeNum && ab.floatingBadgeNum) badgeNum.textContent = ab.floatingBadgeNum;

    const badgeLbl = document.querySelector('.about-floating-badge .badge-label');
    if (badgeLbl && ab.floatingBadgeLabel) badgeLbl.textContent = ab.floatingBadgeLabel;

    // Story & Headings
    const tagEl = document.querySelector('#about .section-tag');
    if (tagEl && ab.sectionTag) tagEl.textContent = ab.sectionTag;

    const headingEl = document.querySelector('#about .section-heading');
    if (headingEl && (ab.headingAccent || ab.founderName)) {
      headingEl.innerHTML = `<span class="script-accent">${escapeHtmlSafe(ab.headingAccent || 'Meet')}</span> ${escapeHtmlSafe(ab.founderName || 'Jeeva')}`;
    }

    const expHd = document.querySelector('#about h3');
    if (expHd && ab.expHeading) expHd.textContent = ab.expHeading;

    const leadParagraphs = document.querySelectorAll('#about .about-lead-text');
    if (leadParagraphs.length >= 1 && ab.leadText1) leadParagraphs[0].textContent = ab.leadText1;
    if (leadParagraphs.length >= 2 && ab.leadText2) leadParagraphs[1].textContent = ab.leadText2;

    const quoteBox = document.querySelector('.about-quote-box');
    if (quoteBox && ab.quoteText) quoteBox.textContent = ab.quoteText;

    // Features List
    const featuresContainer = document.querySelector('.about-features-list');
    if (featuresContainer && Array.isArray(ab.features) && ab.features.length) {
      featuresContainer.innerHTML = ab.features.map(f => `
        <div class="about-feature-item">
          <span class="feature-check-icon">✓</span>
          <span class="feature-item-text">${escapeHtmlSafe(f)}</span>
        </div>
      `).join('');
    }
  };

  function escapeHtmlSafe(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run initial dynamic sync renders safely
  if (typeof renderHome === 'function') renderHome();
  if (typeof renderAbout === 'function') renderAbout();
  if (typeof renderPackages === 'function') renderPackages();
  if (typeof syncStudioSettings === 'function') syncStudioSettings();

  // 13. Cross-Tab & Event Listeners for Live Synchronization with Admin Portal
  if (typeof renderHome === 'function') window.addEventListener('jeeva:homeUpdated', renderHome);
  if (typeof renderAbout === 'function') window.addEventListener('jeeva:aboutUpdated', renderAbout);
  if (typeof renderPortfolio === 'function') window.addEventListener('jeeva:portfolioUpdated', () => renderPortfolio(currentCategory));
  if (typeof renderHighlights === 'function') window.addEventListener('jeeva:videosUpdated', () => renderHighlights('all'));
  if (typeof renderPackages === 'function') window.addEventListener('jeeva:packagesUpdated', renderPackages);
  if (typeof syncStudioSettings === 'function') window.addEventListener('jeeva:settingsUpdated', syncStudioSettings);

  window.addEventListener('storage', (e) => {
    if (e.key === 'jp_home' && typeof renderHome === 'function') renderHome();
    if (e.key === 'jp_about' && typeof renderAbout === 'function') renderAbout();
    if (e.key === 'jp_portfolio' && typeof renderPortfolio === 'function') renderPortfolio(currentCategory);
    if (e.key === 'jp_videos' && typeof renderHighlights === 'function') renderHighlights('all');
    if (e.key === 'jp_packages' && typeof renderPackages === 'function') renderPackages();
    if (e.key === 'jp_settings' && typeof syncStudioSettings === 'function') syncStudioSettings();
  });
});
