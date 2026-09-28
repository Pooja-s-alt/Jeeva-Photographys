/**
 * JEEVA PHOTOGRAPHY - CLIENT-SIDE DATA STORE & SYNC LAYER (IndexedDB + localStorage)
 * Provides seamless storage for large media files (photos, videos from PC) and site data.
 */

const JeevaDB = (() => {
  const DB_NAME = 'JeevaPhotographyDB';
  const DB_VERSION = 1;
  const STORE_MEDIA = 'media_files'; // for large photo/video data from PC

  // Open / Init IndexedDB
  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_MEDIA)) {
          db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Media storage helpers (IndexedDB)
  async function saveMedia(id, dataUrl) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_MEDIA, 'readwrite');
        const store = tx.objectStore(STORE_MEDIA);
        store.put({ id, data: dataUrl, timestamp: Date.now() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('IndexedDB save failed, falling back:', e);
      return false;
    }
  }

  async function getMedia(id) {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_MEDIA, 'readonly');
        const store = tx.objectStore(STORE_MEDIA);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async function deleteMedia(id) {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_MEDIA, 'readwrite');
        const store = tx.objectStore(STORE_MEDIA);
        store.delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  // HOME / HERO DEFAULT DATA
  const DEFAULT_HOME = {
    studioNameScript: 'Jeeva',
    studioNameSerif: 'Photography',
    heroTitleLine1: 'Preserving Timeless Emotions.',
    heroTitleHighlight: 'Crafting Visual Legacies.',
    heroSubtitle: 'A masterclass fine-art studio dedicated to documenting unscripted emotion, royal wedding ceremonies & unforgettable life chapters with bespoke elegance.',
    heroSlide1: 'images/hero-slide-1.jpg',
    heroSlide2: 'images/hero-slide-2.jpg',
    heroSlide3: 'images/hero-slide-3.jpg',
    trust1Num: '16+',
    trust1Lbl: 'Years Mastery',
    trust2Num: '571+',
    trust2Lbl: 'Celebrations',
    trust3Num: '4K',
    trust3Lbl: 'Cinema Grade',
    trust4Num: '100%',
    trust4Lbl: 'Artisanal Finish',
    btn1Text: 'Explore Portfolio',
    btn2Text: 'Watch Highlights',
    btn3Text: 'Book a Session'
  };

  // ABOUT / FOUNDER DEFAULT DATA
  const DEFAULT_ABOUT = {
    sectionTag: 'About The Founder',
    headingAccent: 'Meet',
    headingName: 'Jeeva',
    expHeading: '16+ Years of Capturing Beautiful Stories',
    leadText1: 'With over 16 years of dedicated mastery in the photography field, Jeeva has been turning meaningful celebrations and authentic human connections into timeless visual heirlooms.',
    leadText2: 'From intimate ceremonies to grand destination weddings, every frame is crafted with a meticulous eye for natural light, heartfelt emotion, editorial composition, and soulful storytelling.',
    quoteText: '“Trusted by clients to capture their most meaningful moments.”',
    founderName: 'Jeeva',
    founderRole: 'Founder & Lead Artist',
    founderImage: 'images/founder.jpg',
    aboutImg2: 'images/about-2.jpg',
    aboutImg3: 'images/about-3.jpg',
    floatingBadgeNum: '571+',
    floatingBadgeLabel: 'Happy Clients',
    features: [
      'Cinematic Color Palette',
      'Candid Emotional Essence',
      'Heritage & Royal Venues',
      'Master Retouching & Framing'
    ]
  };

  // PACKAGES DEFAULT DATA (1. Engagement & Wedding, 2. Wedding, 3. Wedding & Reception)
  const PACKAGES_DATA_VERSION = 'v40-live-fixed-sync';
  const DEFAULT_PACKAGES = [
    // --- 1. ENGAGEMENT & WEDDING ---
    {
      id: 'pkg-engagement-wedding-premium',
      category: 'Engagement & Wedding',
      title: 'Premium Package - Engagement & Wedding',
      scriptTitle: 'Premium',
      subtitle: 'ENGAGEMENT & WEDDING',
      price: '1,20,000',
      currency: 'Rs',
      badge: 'PROMESSE',
      isPopular: false,
      mainImage: 'images/pkg-profile-premium.jpg',
      services: [
        {
          group: 'SERVICE',
          items: ['Pre wedding shoot (photos & videos + Drone)']
        },
        {
          group: 'ENGAGEMENT',
          items: [
            'One Traditional Photo & videos',
            'One Candid Photo',
            'Post wedding shoot (photos Only)'
          ]
        },
        {
          group: 'WEDDING',
          items: [
            'One Traditional Photo & videos',
            'One Candid Photo & videos',
            'Drone (Engagement & wedding)'
          ]
        }
      ],
      outputs: [
        'Cinematic highlight videos',
        'Two Premium Album (Engagement & Wedding)',
        'Reels one & 3mins pre wedding shoot videos',
        'Traditional videos pendrive copy two',
        'frame two (12 x 18)',
        'Calender two copy'
      ],
      features: [
        'Pre wedding shoot (photos & videos + Drone)',
        'Engagement: Traditional Photo & videos, Candid Photo, Post wedding shoot',
        'Wedding: Traditional Photo & videos, Candid Photo & videos, Drone',
        'Outputs: Cinematic highlight, 2 Premium Albums, Reels & 3min video, 2 Pendrives, 2 Frames (12x18), 2 Calendars'
      ]
    },
    {
      id: 'pkg-engagement-wedding-standard',
      category: 'Engagement & Wedding',
      title: 'Standard Package - Engagement & Wedding',
      scriptTitle: 'Standard',
      subtitle: 'ENGAGEMENT & WEDDING',
      price: '80,000',
      currency: 'Rs',
      badge: 'EVERYTHING',
      isPopular: true,
      popularBadge: 'Most Popular',
      mainImage: 'images/pkg-profile-standard.jpg',
      services: [
        {
          group: 'SERVICE',
          items: ['Pre wedding shoot (videos + Drone)']
        },
        {
          group: 'ENGAGEMENT',
          items: [
            'One Traditional Photo & videos'
          ]
        },
        {
          group: 'WEDDING',
          items: [
            'One Traditional Photo & videos',
            'One Candid Photo',
            'Post wedding shoot (photos Only)'
          ]
        }
      ],
      outputs: [
        'Two Premium Album (Engagement & Wedding)',
        'Reels one & 3mins pre wedding shoot videos',
        'Traditional videos pendrive copy two',
        'frame two (12 x 18)',
        'Calender two copy'
      ],
      features: [
        'Pre wedding shoot (videos + Drone)',
        'Engagement: Traditional Photo & videos',
        'Wedding: Traditional Photo & videos, Candid Photo, Post wedding shoot',
        'Outputs: 2 Premium Albums, Reels & 3min video, 2 Pendrives, 2 Frames (12x18), 2 Calendars'
      ]
    },
    {
      id: 'pkg-engagement-wedding-basic',
      category: 'Engagement & Wedding',
      title: 'Basic Package - Engagement & Wedding',
      scriptTitle: 'Basic',
      subtitle: 'ENGAGEMENT & WEDDING',
      price: '50,000',
      currency: 'Rs',
      badge: 'TIMELESS UNION',
      isPopular: false,
      mainImage: 'images/pkg-profile-basic.jpg',
      services: [
        {
          group: 'ENGAGEMENT',
          items: [
            'One Traditional Photo & videos'
          ]
        },
        {
          group: 'WEDDING',
          items: [
            'One Traditional Photo & videos',
            'One Candid Photo',
            'Post wedding shoot (photos Only)'
          ]
        }
      ],
      outputs: [
        'One Premium Album',
        'Reels one',
        'Traditional videos pendrive copy One',
        'frame two (12 x 18)',
        'Calender One copy'
      ],
      features: [
        'Engagement: Traditional Photo & videos',
        'Wedding: Traditional Photo & videos, Candid Photo, Post wedding shoot',
        'Outputs: 1 Premium Album, Reels one, 1 Pendrive copy, 2 Frames (12x18), 1 Calendar'
      ]
    },

    // --- 2. WEDDING ONLY ---
    {
      id: 'pkg-wedding-premium',
      category: 'Wedding',
      title: 'Premium Package - Wedding',
      scriptTitle: 'Premium',
      subtitle: 'WEDDING',
      price: '1,60,000',
      currency: 'Rs',
      badge: 'PROMESSE',
      isPopular: false,
      mainImage: 'images/pkg-profile-premium.jpg',
      services: [
        {
          group: 'SERVICE',
          items: ['Pre wedding shoot (photos & videos + Drone)']
        },
        {
          group: 'WEDDING',
          items: [
            'One Traditional Photo & videos',
            'One Candid Photo & videos',
            'Drone (wedding)',
            'LED screen (12 x 8)',
            'Post wedding (photos only)'
          ]
        }
      ],
      outputs: [
        'Cinematic highlight videos',
        'Two Premium Album',
        'Reels one & 3mins pre wedding shoot videos',
        'Traditional videos pendrive copy two',
        'frame two (12 x 18)',
        'Calender two copy'
      ],
      features: [
        'Pre wedding shoot (photos & videos + Drone)',
        'Wedding: Traditional Photo & videos, Candid Photo & videos, Drone (wedding), LED screen (12x8), Post wedding',
        'Outputs: Cinematic highlight, 2 Premium Albums, Reels & 3min video, 2 Pendrives, 2 Frames (12x18), 2 Calendars'
      ]
    },
    {
      id: 'pkg-wedding-standard',
      category: 'Wedding',
      title: 'Standard Package - Wedding',
      scriptTitle: 'Standard',
      subtitle: 'WEDDING',
      price: '1,00,000',
      currency: 'Rs',
      badge: 'EVERYTHING',
      isPopular: true,
      popularBadge: 'Most Popular',
      mainImage: 'images/pkg-profile-standard.jpg',
      services: [
        {
          group: 'SERVICE',
          items: ['Pre wedding shoot (videos + Drone)']
        },
        {
          group: 'WEDDING',
          items: [
            'One Traditional Photo & videos',
            'One Candid Photo & videos',
            'Drone',
            'Post wedding'
          ]
        }
      ],
      outputs: [
        'Cinematic highlight videos',
        'One Premium Album',
        'Reels one & 3mins pre wedding shoot videos',
        'Traditional videos pendrive copy two',
        'frame two (12 x 18)',
        'Calender two copy'
      ],
      features: [
        'Pre wedding shoot (videos + Drone)',
        'Wedding: Traditional Photo & videos, Candid Photo & videos, Drone, Post wedding',
        'Outputs: Cinematic highlight, 1 Premium Album, Reels & 3min video, 2 Pendrives, 2 Frames (12x18), 2 Calendars'
      ]
    },
    {
      id: 'pkg-wedding-basic',
      category: 'Wedding',
      title: 'Basic Package - Wedding',
      scriptTitle: 'Basic',
      subtitle: 'WEDDING',
      price: '80,000',
      currency: 'Rs',
      badge: 'TIMELESS UNION',
      isPopular: false,
      mainImage: 'images/pkg-profile-basic.jpg',
      services: [
        {
          group: 'WEDDING',
          items: [
            'One Traditional Photo & videos',
            'One Candid Photo& videos',
            'Post wedding'
          ]
        }
      ],
      outputs: [
        'One Premium Album',
        'Reels one',
        'Traditional videos pendrive copy One',
        'frame two (12 x 18)',
        'Calender One copy'
      ],
      features: [
        'Wedding: Traditional Photo & videos, Candid Photo & videos, Post wedding',
        'Outputs: 1 Premium Album, Reels one, 1 Pendrive copy, 2 Frames (12x18), 1 Calendar'
      ]
    },

    // --- 3. WEDDING & RECEPTION ---
    {
      id: 'pkg-wedding-reception-premium',
      category: 'Wedding & Reception',
      title: 'Premium Package - Wedding & Reception',
      scriptTitle: 'Premium',
      subtitle: 'WEDDING & RECEPTION',
      price: '2,00,000',
      currency: 'Rs',
      badge: 'PROMESSE',
      isPopular: false,
      mainImage: 'images/pkg-profile-premium.jpg',
      services: [
        {
          group: 'SERVICE',
          items: ['Pre wedding shoot (photos & videos + Drone)']
        },
        {
          group: 'WEDDING',
          items: [
            'One Traditional Photo & videos',
            'One Candid Photo & videos',
            'Drone (wedding or reception)'
          ]
        },
        {
          group: 'RECEPTION',
          items: [
            'One Traditional Photo & videos',
            'One Candid Photo',
            'Post wedding shoot (photos Only)'
          ]
        }
      ],
      outputs: [
        'Cinematic highlight videos',
        'Two Premium Album (Wedding & Reception)',
        'Reels one & 3mins pre wedding shoot videos',
        'Traditional videos pendrive copy two',
        'frame two (12 x 18)',
        'Calender two copy'
      ],
      features: [
        'Pre wedding shoot (photos & videos + Drone)',
        'Wedding: Traditional Photo & videos, Candid Photo & videos, Drone (wedding or reception)',
        'Reception: Traditional Photo & videos, Candid Photo, Post wedding shoot',
        'Outputs: Cinematic highlight, 2 Premium Albums (Wedding & Reception), Reels & 3min video, 2 Pendrives, 2 Frames (12x18), 2 Calendars'
      ]
    },
    {
      id: 'pkg-wedding-reception-standard',
      category: 'Wedding & Reception',
      title: 'Standard Package - Wedding & Reception',
      scriptTitle: 'Standard',
      subtitle: 'WEDDING & RECEPTION',
      price: '1,60,000',
      currency: 'Rs',
      badge: 'EVERYTHING',
      isPopular: true,
      popularBadge: 'Most Popular',
      mainImage: 'images/pkg-profile-standard.jpg',
      services: [
        {
          group: 'SERVICE',
          items: ['Pre wedding shoot (videos + Drone)']
        },
        {
          group: 'WEDDING',
          items: [
            'One Traditional Photo & videos',
            'One Candid Photo & videos'
          ]
        },
        {
          group: 'RECEPTION',
          items: [
            'One Traditional Photo & videos',
            'Post wedding shoot (photos Only)'
          ]
        }
      ],
      outputs: [
        'Cinematic highlight videos',
        'Two Premium Album (Wedding & Reception)',
        'Reels one & 3mins pre wedding shoot videos',
        'Traditional videos pendrive copy two',
        'frame two (12 x 18)',
        'Calender two copy'
      ],
      features: [
        'Pre wedding shoot (videos + Drone)',
        'Wedding: Traditional Photo & videos, Candid Photo & videos',
        'Reception: Traditional Photo & videos, Post wedding shoot',
        'Outputs: Cinematic highlight, 2 Premium Albums (Wedding & Reception), Reels & 3min video, 2 Pendrives, 2 Frames (12x18), 2 Calendars'
      ]
    },
    {
      id: 'pkg-wedding-reception-basic',
      category: 'Wedding & Reception',
      title: 'Basic Package - Wedding & Reception',
      scriptTitle: 'Basic',
      subtitle: 'WEDDING & RECEPTION',
      price: '1,00,000',
      currency: 'Rs',
      badge: 'TIMELESS UNION',
      isPopular: false,
      mainImage: 'images/pkg-profile-basic.jpg',
      services: [
        {
          group: 'WEDDING',
          items: [
            'One Traditional Photo & videos',
            'One Candid Photo& videos'
          ]
        },
        {
          group: 'RECEPTION',
          items: [
            'One Traditional Photo & videos',
            'Post wedding shoot (photos Only)'
          ]
        }
      ],
      outputs: [
        'One Premium Album',
        'Reels one',
        'Traditional videos pendrive copy One',
        'frame two (12 x 18)',
        'Calender One copy'
      ],
      features: [
        'Wedding: Traditional Photo & videos, Candid Photo & videos',
        'Reception: Traditional Photo & videos, Post wedding shoot',
        'Outputs: 1 Premium Album, Reels one, 1 Pendrive copy, 2 Frames (12x18), 1 Calendar'
      ]
    }
  ];

  // TESTIMONIALS DEFAULT DATA
  const DEFAULT_TESTIMONIALS = [
    {
      id: 1,
      name: 'Priya & Karthik',
      location: 'Grand Wedding, Ramanathapuram',
      text: '“Jeeva Photography captured every important moment beautifully. The photographs felt natural, emotional, and incredibly professional. We will always treasure these memories.”',
      stars: 5,
      avatar: ''
    },
    {
      id: 2,
      name: 'Arjun & Sneha',
      location: 'Grand Celebration, Paramakudi',
      text: '“The team has an extraordinary eye for candid shots. During our reception, they were completely unobtrusive yet captured the most priceless laughter and tears. Truly 16+ years of mastery!”',
      stars: 5,
      avatar: ''
    },
    {
      id: 3,
      name: 'Divya & Rohit',
      location: 'Pre-Wedding & Engagement',
      text: '“Our pre-wedding photoshoot in the hills looked like scenes straight out of a high-fashion magazine. Jeeva made us feel so comfortable and confident in front of the lens.”',
      stars: 5,
      avatar: ''
    }
  ];

  // SETTINGS DEFAULT DATA
  const DEFAULT_SETTINGS = {
    name: 'Jeeva Photography',
    tagline: 'Preserving Emotions & Visual Legacies for Over 16 Years',
    phone: '+91 95147 51045',
    whatsapp: '+91 95147 51045',
    email: 'jeevaphotography1820@gmail.com',
    instagram: '@__jeeva_photography__',
    instagramUrl: 'https://www.instagram.com/__jeeva_photography__',
    address: 'SB Tower Building, 1st Floor (Opp. Register Office), Vandikara Street, Ramanathapuram - 623504',
    hours: 'Mon - Sun, 9:00 AM - 8:30 PM',
    yearsExp: '16+',
    happyClients: '571+',
    momentsCaptured: '1000+',
    passionScore: '100%'
  };

  // LocalStorage Helpers
  function getLS(key, defaultVal) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  function setLS(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('localStorage set failed for key:', key, e);
    }
  }

  // HOME / HERO
  function getHome() {
    return getLS('jp_home', DEFAULT_HOME);
  }

  function saveHome(data) {
    const current = getHome();
    const merged = { ...current, ...data };
    setLS('jp_home', merged);
    window.dispatchEvent(new CustomEvent('jeeva:homeUpdated', { detail: merged }));
    return merged;
  }

  // ABOUT / FOUNDER
  function getAbout() {
    return getLS('jp_about', DEFAULT_ABOUT);
  }

  function saveAbout(data) {
    const current = getAbout();
    const merged = { ...current, ...data };
    setLS('jp_about', merged);
    window.dispatchEvent(new CustomEvent('jeeva:aboutUpdated', { detail: merged }));
    return merged;
  }

  // PORTFOLIO CRUD
  const PORTFOLIO_DATA_VERSION = 'v35-live-fixed-sync';
  function getPortfolio() {
    const storedVer = getLS('jp_portfolio_ver', null);
    if (storedVer !== PORTFOLIO_DATA_VERSION) {
      if (typeof PORTFOLIO_DATA !== 'undefined') {
        const base = JSON.parse(JSON.stringify(PORTFOLIO_DATA));
        setLS('jp_portfolio', base);
        setLS('jp_portfolio_ver', PORTFOLIO_DATA_VERSION);
        return base;
      }
    }
    if (typeof PORTFOLIO_DATA !== 'undefined') {
      const base = JSON.parse(JSON.stringify(PORTFOLIO_DATA));
      const custom = getLS('jp_portfolio', null);
      if (custom && Array.isArray(custom)) {
        // Find custom items added via admin (starts with p_)
        const userAdded = custom.filter(x => x && String(x.id).startsWith('p_'));
        if (userAdded.length) {
          return [...userAdded, ...base];
        }
      }
      return base;
    }
    const custom = getLS('jp_portfolio', null);
    if (custom && Array.isArray(custom)) return custom;
    return [];
  }

  function savePortfolio(list) {
    setLS('jp_portfolio', list);
    window.dispatchEvent(new CustomEvent('jeeva:portfolioUpdated', { detail: list }));
  }

  function addPortfolioItem(item) {
    const list = getPortfolio();
    if (!item.id) item.id = 'p_' + Date.now();
    list.unshift(item);
    savePortfolio(list);
    return item;
  }

  function updatePortfolioItem(id, updatedFields) {
    const list = getPortfolio();
    const idx = list.findIndex(x => String(x.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedFields };
      savePortfolio(list);
      return list[idx];
    }
    return null;
  }

  function deletePortfolioItem(id) {
    let list = getPortfolio();
    list = list.filter(x => String(x.id) !== String(id));
    savePortfolio(list);
    return true;
  }

  // VIDEOS CRUD
  // VIDEO_HIGHLIGHTS_DATA (video-data.js) is always the MASTER source of truth.
  // localStorage only stores EXTRA videos added via admin panel on top of the base set.
  function getVideos() {
    if (typeof VIDEO_HIGHLIGHTS_DATA !== 'undefined') {
      const base = JSON.parse(JSON.stringify(VIDEO_HIGHLIGHTS_DATA));
      // Merge any admin-added custom videos from localStorage (those NOT in base)
      const custom = getLS('jp_videos_extra', []);
      if (Array.isArray(custom) && custom.length) {
        // Filter: only include truly custom ones (ids not in base)
        const baseIds = new Set(base.map(v => v.id));
        const extras = custom.filter(v => !baseIds.has(v.id));
        return [...base, ...extras];
      }
      return base;
    }
    return [];
  }

  function saveVideos(list) {
    // Save only the EXTRA videos (not in base VIDEO_HIGHLIGHTS_DATA) to localStorage
    const baseIds = typeof VIDEO_HIGHLIGHTS_DATA !== 'undefined'
      ? new Set(VIDEO_HIGHLIGHTS_DATA.map(v => v.id))
      : new Set();
    const extras = list.filter(v => !baseIds.has(v.id));
    setLS('jp_videos_extra', extras);
    window.dispatchEvent(new CustomEvent('jeeva:videosUpdated', { detail: list }));
  }

  function addVideoItem(item) {
    if (!item.id) item.id = 'v_' + Date.now();
    const extras = getLS('jp_videos_extra', []);
    extras.unshift(item);
    setLS('jp_videos_extra', extras);
    const allVideos = getVideos();
    window.dispatchEvent(new CustomEvent('jeeva:videosUpdated', { detail: allVideos }));
    return item;
  }

  function updateVideoItem(id, updatedFields) {
    // Check if it's a base video (can't edit base directly - only affects display via data file)
    const baseIds = typeof VIDEO_HIGHLIGHTS_DATA !== 'undefined'
      ? new Set(VIDEO_HIGHLIGHTS_DATA.map(v => v.id))
      : new Set();
    if (baseIds.has(id)) {
      // For base videos, store override in extras with same id
      const extras = getLS('jp_videos_extra', []);
      const existingOverride = extras.findIndex(x => String(x.id) === String(id));
      if (existingOverride !== -1) {
        extras[existingOverride] = { ...extras[existingOverride], ...updatedFields };
      } else {
        const base = VIDEO_HIGHLIGHTS_DATA.find(v => String(v.id) === String(id));
        extras.push({ ...base, ...updatedFields });
      }
      setLS('jp_videos_extra', extras);
      const allVideos = getVideos();
      window.dispatchEvent(new CustomEvent('jeeva:videosUpdated', { detail: allVideos }));
      return updatedFields;
    }
    // Extra video edit
    const extras = getLS('jp_videos_extra', []);
    const idx = extras.findIndex(x => String(x.id) === String(id));
    if (idx !== -1) {
      extras[idx] = { ...extras[idx], ...updatedFields };
      setLS('jp_videos_extra', extras);
      const allVideos = getVideos();
      window.dispatchEvent(new CustomEvent('jeeva:videosUpdated', { detail: allVideos }));
      return extras[idx];
    }
    return null;
  }

  function deleteVideoItem(id) {
    let extras = getLS('jp_videos_extra', []);
    extras = extras.filter(x => String(x.id) !== String(id));
    setLS('jp_videos_extra', extras);
    const allVideos = getVideos();
    window.dispatchEvent(new CustomEvent('jeeva:videosUpdated', { detail: allVideos }));
    return true;
  }

  // TESTIMONIALS CRUD
  function getTestimonials() {
    return getLS('jp_test', DEFAULT_TESTIMONIALS);
  }

  function saveTestimonials(list) {
    setLS('jp_test', list);
    window.dispatchEvent(new CustomEvent('jeeva:testimonialsUpdated', { detail: list }));
  }

  function addTestimonial(item) {
    const list = getTestimonials();
    if (!item.id) item.id = 't_' + Date.now();
    list.unshift(item);
    saveTestimonials(list);
    return item;
  }

  function updateTestimonial(id, updatedFields) {
    const list = getTestimonials();
    const idx = list.findIndex(x => String(x.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedFields };
      saveTestimonials(list);
      return list[idx];
    }
    return null;
  }

  function deleteTestimonial(id) {
    let list = getTestimonials();
    list = list.filter(x => String(x.id) !== String(id));
    saveTestimonials(list);
    return true;
  }

  // PACKAGES CRUD
  function getPackages() {
    // Version-based cache reset: if data version changed, reload defaults
    const storedVer = getLS('jp_packages_ver', null);
    if (storedVer !== PACKAGES_DATA_VERSION) {
      setLS('jp_packages', DEFAULT_PACKAGES);
      setLS('jp_packages_ver', PACKAGES_DATA_VERSION);
      return DEFAULT_PACKAGES;
    }
    const list = getLS('jp_packages', DEFAULT_PACKAGES);
    if (!list || !list.length || !list.some(p => p.category === 'Wedding & Reception') || !list.some(p => p.category === 'Wedding') || !list.some(p => p.category === 'Engagement & Wedding')) {
      setLS('jp_packages', DEFAULT_PACKAGES);
      return DEFAULT_PACKAGES;
    }
    return list;
  }

  function savePackages(list) {
    setLS('jp_packages', list);
    window.dispatchEvent(new CustomEvent('jeeva:packagesUpdated', { detail: list }));
  }

  function addPackage(item) {
    const list = getPackages();
    if (!item.id) item.id = 'pkg_' + Date.now();
    list.push(item);
    savePackages(list);
    return item;
  }

  function updatePackage(id, updatedFields) {
    const list = getPackages();
    const idx = list.findIndex(x => String(x.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedFields };
      savePackages(list);
      return list[idx];
    }
    return null;
  }

  function deletePackage(id) {
    let list = getPackages();
    list = list.filter(x => String(x.id) !== String(id));
    savePackages(list);
    return true;
  }

  // ENQUIRIES CRUD
  function getEnquiries() {
    return getLS('jp_enquiries', []);
  }

  function saveEnquiries(list) {
    setLS('jp_enquiries', list);
    window.dispatchEvent(new CustomEvent('jeeva:enquiriesUpdated', { detail: list }));
  }

  function addEnquiry(item) {
    const list = getEnquiries();
    if (!item.id) item.id = Date.now();
    if (!item.submittedAt) item.submittedAt = new Date().toISOString();
    if (!item.status) item.status = 'New';
    list.unshift(item);
    saveEnquiries(list);
    return item;
  }

  function updateEnquiry(id, updatedFields) {
    const list = getEnquiries();
    const idx = list.findIndex(x => String(x.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedFields };
      saveEnquiries(list);
      return list[idx];
    }
    return null;
  }

  function deleteEnquiry(id) {
    let list = getEnquiries();
    list = list.filter(x => String(x.id) !== String(id));
    saveEnquiries(list);
    return true;
  }

  function clearAllEnquiries() {
    localStorage.removeItem('jp_enquiries');
    window.dispatchEvent(new CustomEvent('jeeva:enquiriesUpdated', { detail: [] }));
  }

  // SETTINGS
  function getSettings() {
    return getLS('jp_settings', DEFAULT_SETTINGS);
  }

  function saveSettings(settings) {
    const current = getSettings();
    const merged = { ...current, ...settings };
    setLS('jp_settings', merged);
    window.dispatchEvent(new CustomEvent('jeeva:settingsUpdated', { detail: merged }));
    return merged;
  }

  // AUTH CREDENTIALS
  function getAuth() {
    return {
      username: localStorage.getItem('jp_u') || 'admin',
      password: localStorage.getItem('jp_p') || 'jeeva2024'
    };
  }

  function setAuth(u, p) {
    if (u) localStorage.setItem('jp_u', u);
    if (p) localStorage.setItem('jp_p', p);
  }

  // COMPLETE BACKUP & RESTORE
  function exportFullBackup() {
    return {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      studio: 'Jeeva Photography',
      home: getHome(),
      about: getAbout(),
      portfolio: getPortfolio(),
      videos: getVideos(),
      testimonials: getTestimonials(),
      packages: getPackages(),
      enquiries: getEnquiries(),
      settings: getSettings()
    };
  }

  function importFullBackup(data) {
    if (!data || typeof data !== 'object') throw new Error('Invalid backup file format.');
    if (data.home && typeof data.home === 'object') saveHome(data.home);
    if (data.about && typeof data.about === 'object') saveAbout(data.about);
    if (data.portfolio && Array.isArray(data.portfolio)) savePortfolio(data.portfolio);
    if (data.videos && Array.isArray(data.videos)) saveVideos(data.videos);
    if (data.testimonials && Array.isArray(data.testimonials)) saveTestimonials(data.testimonials);
    if (data.packages && Array.isArray(data.packages)) savePackages(data.packages);
    if (data.enquiries && Array.isArray(data.enquiries)) saveEnquiries(data.enquiries);
    if (data.settings && typeof data.settings === 'object') saveSettings(data.settings);
    return true;
  }

  function resetToDefaults() {
    localStorage.removeItem('jp_home');
    localStorage.removeItem('jp_about');
    localStorage.removeItem('jp_portfolio');
    localStorage.removeItem('jp_videos_extra');
    localStorage.removeItem('jp_test');
    localStorage.removeItem('jp_packages');
    localStorage.removeItem('jp_settings');
    return true;
  }

  // Public API
  return {
    saveMedia,
    getMedia,
    deleteMedia,

    getHome,
    saveHome,
    getAbout,
    saveAbout,

    getPortfolio,
    savePortfolio,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,

    getVideos,
    saveVideos,
    addVideoItem,
    updateVideoItem,
    deleteVideoItem,

    getTestimonials,
    saveTestimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,

    getPackages,
    savePackages,
    addPackage,
    updatePackage,
    deletePackage,

    getEnquiries,
    saveEnquiries,
    addEnquiry,
    updateEnquiry,
    deleteEnquiry,
    clearAllEnquiries,

    getSettings,
    saveSettings,
    getAuth,
    setAuth,

    exportFullBackup,
    importFullBackup,
    resetToDefaults,

    DEFAULT_HOME,
    DEFAULT_ABOUT,
    DEFAULT_PACKAGES,
    DEFAULT_TESTIMONIALS,
    DEFAULT_SETTINGS
  };
})();

if (typeof window !== 'undefined') {
  window.JeevaDB = JeevaDB;
}
