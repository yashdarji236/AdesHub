import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Search,
  Layers,
  Code2,
  Sliders,
  ExternalLink,
  Plus,
  Minus
} from 'lucide-react';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

// 1. Hero Radial Wheel Cards Data
const HERO_CARDS = [
  {
    id: 'flick-cards',
    title: 'Flick Cards Slider',
    category: 'Sliders & Marquees',
    type: 'flick-cards'
  },
  {
    id: 'face-follow',
    title: 'Face Follow Cursor (Mascot)',
    category: 'Cursor Animations',
    type: 'face-follow'
  },
  {
    id: 'locomotive',
    title: 'Locomotive Smooth Scroll Setup',
    category: 'Scroll Animations',
    type: 'locomotive'
  },
  {
    id: 'logo-wall',
    title: 'Logo Wall Cycle',
    category: 'Sliders & Marquees',
    type: 'logo-wall'
  },
  {
    id: 'matterjs',
    title: 'Falling 2D Objects (MatterJS)',
    category: 'Physics & Canvas',
    type: 'matterjs'
  },
  {
    id: '3d-carousel',
    title: '3D Image Carousel',
    category: 'WebGL & 3D',
    type: '3d-carousel'
  },
  {
    id: 'momentum-hover',
    title: 'Momentum Based Hover (Inertia)',
    category: 'Hover Interactions',
    type: 'momentum-hover'
  },
  {
    id: 'pixelate',
    title: 'Pixelate Image Render Effect',
    category: 'Shaders & Canvas',
    type: 'pixelate'
  },
  {
    id: 'directional-list',
    title: 'Directional List Hover',
    category: 'Hover Interactions',
    type: 'directional-list'
  }
];

// 2. Products 3D Carousel Data (Section 5)
const PRODUCT_SLIDES = [
  {
    id: 'vault',
    theme: 'dark',
    title: 'The Vault',
    desc: 'Our ever-growing dashboard packed with ready-to-go components.',
    badge: 'PART OF THE MEMBERSHIP',
    buttonText: 'Discover',
    link: '/login',
    previewType: 'dashboard'
  },
  {
    id: 'ptc',
    theme: 'lime',
    title: 'Page Transition Course',
    desc: 'Learn how to create page transitions that take your websites to the next level.',
    badge: 'PART OF THE MEMBERSHIP',
    buttonText: 'Discover',
    link: '/login',
    previewType: 'video'
  },
  {
    id: 'buttons',
    theme: 'dark',
    title: 'Buttons',
    desc: '100 fully accessible buttons made together with Eduard Bodak.',
    badge: 'PART OF THE MEMBERSHIP',
    buttonText: 'Discover',
    link: '/login',
    previewType: 'sphere'
  },
  {
    id: 'easings',
    theme: 'light',
    title: 'Easings',
    desc: 'Ready-to-paste easings for CSS and GSAP inside the Osmo Vault.',
    badge: 'PART OF THE MEMBERSHIP',
    buttonText: 'Discover',
    link: '/login',
    previewType: 'curve'
  },
  {
    id: 'icons',
    theme: 'dark',
    title: 'Icons',
    desc: 'A uniform library of clean, scalable SVG icons you can copy or download in seconds.',
    badge: 'PART OF THE MEMBERSHIP',
    buttonText: 'Discover',
    link: '/login',
    previewType: 'icons'
  },
  {
    id: 'community',
    theme: 'purple',
    title: 'Community',
    desc: 'Connect with the people who love building great websites as much as you do.',
    badge: 'PART OF THE MEMBERSHIP',
    buttonText: 'Discover',
    link: '/login',
    previewType: 'avatars'
  }
];

// 3. Showcase Websites ("Made with Osmo")
const SHOWCASE_ITEMS = [
  {
    id: 'minal',
    name: 'Minal Studio',
    tagline: 'We design striking bespoke identities to build future ready brands',
    bg: '#141416',
    textColor: '#ffffff',
    usedCount: '5 RESOURCES USED',
    author: '@HUMPHREYSTUDIO | @TOMCHEAL',
    previewImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'peak',
    name: 'PEAK',
    tagline: 'PERFORMANCE MARKETING FOR GROWING BRANDS',
    bg: '#b8ff22',
    textColor: '#121214',
    usedCount: '7 RESOURCES USED',
    author: '@EDMONTACKE',
    previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'nodeck',
    name: 'Nodeck',
    tagline: 'A CONSULTING COMPANY FOR STARTUPS THAT SELL THINKING, NOT SLIDES',
    bg: '#ff708a',
    textColor: '#ffffff',
    usedCount: '3 RESOURCES USED',
    author: '@BOGDAN_KOLOMEYETS',
    previewImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'mammut',
    name: 'Mammut Studios',
    tagline: 'Built to grow & designed to stand out',
    bg: '#e8f5e9',
    textColor: '#121214',
    usedCount: '8 RESOURCES USED',
    author: '@MARCELSTEPENDAL | @MAMMUT_STUDIOS',
    previewImage: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1000&auto=format&fit=crop&q=80'
  }
];

const Home = () => {
  // Navigation & UI States
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [billingAnnually, setBillingAnnually] = useState(true);
  const [founderIndex, setFounderIndex] = useState(0); // 0: Dennis, 1: Ilja

  // Drag & Cursor States
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorText, setCursorText] = useState('Drag');
  const [isDragging, setIsDragging] = useState(false);
  const [mouseCoord, setMouseCoord] = useState({ x: 0, y: 0 });

  // Hero Radial Wheel State
  const wheelRef = useRef(null);
  const [heroRadius, setHeroRadius] = useState(1280);
  const rotationStateRef = useRef({
    currentAngle: 0,
    targetAngle: 0,
    velocity: 0.05,
    isPointerDown: false,
    lastPointerX: 0,
    pointerVelocityX: 0,
    isHovered: false
  });

  // Product Slider State
  const productWheelRef = useRef(null);
  const [activeProductTab, setActiveProductTab] = useState(0);
  const productRotationRef = useRef({
    currentAngle: 0,
    targetAngle: 0,
    velocity: 0,
    isPointerDown: false,
    lastPointerX: 0
  });

  // Showcase Slider State
  const showcaseWheelRef = useRef(null);
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  const lenisRef = useRef(null);

  // Responsive radius setup
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setHeroRadius(850);
      else if (w < 1024) setHeroRadius(1050);
      else setHeroRadius(1280);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      setIsScrolled(e.scroll > 50);

      // Hero wheel scroll boost
      if (rotationStateRef.current) {
        const scrollSpeed = Math.abs(e.velocity) || 0;
        const dir = e.velocity >= 0 ? 1 : -1;
        rotationStateRef.current.velocity = (0.05 + scrollSpeed * 0.04) * dir;
      }
    });

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  // Hero Radial Wheel RAF Loop
  useEffect(() => {
    let animId;
    const state = rotationStateRef.current;

    const loop = () => {
      if (!state.isPointerDown) {
        const baseSpeed = state.isHovered ? 0.015 : 0.05;
        state.velocity += (baseSpeed - state.velocity) * 0.05;
        state.currentAngle += state.velocity;
      } else {
        state.currentAngle += (state.targetAngle - state.currentAngle) * 0.35;
      }

      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${state.currentAngle}deg)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Global Pointer Tracker for Magnetic Cursor & Pupils
  const handlePointerMove = useCallback((e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    setCursorPos({ x: clientX, y: clientY });
    setMouseCoord({
      x: (clientX / window.innerWidth - 0.5) * 2,
      y: (clientY / window.innerHeight - 0.5) * 2
    });

    // Hero Drag
    const state = rotationStateRef.current;
    if (state.isPointerDown) {
      const deltaX = clientX - state.lastPointerX;
      state.pointerVelocityX = deltaX;
      state.lastPointerX = clientX;
      state.targetAngle += deltaX * 0.075;
    }

    // Product Slider Drag
    const pState = productRotationRef.current;
    if (pState.isPointerDown) {
      const deltaX = clientX - pState.lastPointerX;
      pState.lastPointerX = clientX;
      pState.targetAngle += deltaX * 0.06;
      if (productWheelRef.current) {
        productWheelRef.current.style.transform = `rotate(${pState.targetAngle}deg)`;
      }
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    const state = rotationStateRef.current;
    if (state.isPointerDown) {
      state.isPointerDown = false;
      setIsDragging(false);
      state.velocity = state.pointerVelocityX * 0.06;
      state.velocity = Math.max(-1.2, Math.min(1.2, state.velocity));
    }

    const pState = productRotationRef.current;
    if (pState.isPointerDown) {
      pState.isPointerDown = false;
      setIsDragging(false);
    }
  }, []);

  // Toggle Founder Card
  const toggleFounder = () => {
    setFounderIndex((prev) => (prev === 0 ? 1 : 0));
  };

  // Product Tab Switch
  const handleProductTabClick = (idx) => {
    setActiveProductTab(idx);
    const anglePerItem = 360 / PRODUCT_SLIDES.length;
    const target = -idx * anglePerItem;
    productRotationRef.current.targetAngle = target;
    gsap.to(productRotationRef.current, {
      targetAngle: target,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => {
        if (productWheelRef.current) {
          productWheelRef.current.style.transform = `rotate(${productRotationRef.current.targetAngle}deg)`;
        }
      }
    });
  };

  // Showcase Navigation
  const nextShowcase = () => {
    setShowcaseIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
  };
  const prevShowcase = () => {
    setShowcaseIndex((prev) => (prev - 1 + SHOWCASE_ITEMS.length) % SHOWCASE_ITEMS.length);
  };

  // Render Visual for Hero Cards
  const renderHeroCardVisual = (card) => {
    switch (card.type) {
      case 'matterjs':
        return (
          <div className="card-matterjs">
            <div className="matterjs-brand">MatterJS</div>
            <div className="matter-sim-balls">
              <div className="m-ball m-ball-orange"><div className="m-eyes"><span /><span /></div><div className="m-smile" /></div>
              <div className="m-ball m-ball-blue"><div className="m-eyes"><span /><span /></div><div className="m-smile" /></div>
              <div className="m-ball m-ball-yellow"><div className="m-eyes"><span /><span /></div><div className="m-smile" /></div>
              <div className="m-ball m-ball-pink"><div className="m-eyes"><span /><span /></div></div>
              <div className="m-ball m-ball-green"><div className="m-eyes"><span /><span /></div><div className="m-smile" /></div>
            </div>
          </div>
        );
      case '3d-carousel':
        return (
          <div className="card-3d-planes">
            <div className="plane p-left"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60" alt="" /></div>
            <div className="plane p-center"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60" alt="" /></div>
            <div className="plane p-right"><img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=60" alt="" /></div>
          </div>
        );
      case 'momentum-hover':
        return (
          <div className="card-team-grid">
            <div className="avatar"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60" alt="" /><span className="dot dot-g" /></div>
            <div className="avatar"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60" alt="" /><span className="dot dot-y" /></div>
            <div className="avatar"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60" alt="" /><span className="award-tag">Award</span></div>
            <div className="avatar"><img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60" alt="" /><span className="dot dot-g" /></div>
          </div>
        );
      case 'pixelate':
        return (
          <div className="card-pixelate">
            <div className="pixel-grid" />
            <span className="pixel-text">Pixelate Render</span>
          </div>
        );
      case 'directional-list':
        return (
          <div className="card-dir-list">
            <div className="dir-row"><span>Touch On Sky</span><span>2026</span></div>
            <div className="dir-row active"><span>Directional Hover</span><ArrowRight size={12} /></div>
            <div className="dir-row"><span>Sound Wave</span><span>NEW</span></div>
          </div>
        );
      case 'flick-cards':
        return (
          <div className="card-flick">
            <div className="flick-card c3" />
            <div className="flick-card c2" />
            <div className="flick-card c1">
              <span className="flick-badge">HOT</span>
              <h4>ZV210</h4>
            </div>
          </div>
        );
      case 'face-follow':
        return (
          <div className="card-face">
            <div className="face-mascot">
              <div className="eyes">
                <div className="eye"><div className="pupil" style={{ transform: `translate(${mouseCoord.x * 5}px, ${mouseCoord.y * 5}px)` }} /></div>
                <div className="eye"><div className="pupil" style={{ transform: `translate(${mouseCoord.x * 5}px, ${mouseCoord.y * 5}px)` }} /></div>
              </div>
              <div className="smile" />
            </div>
          </div>
        );
      case 'locomotive':
        return (
          <div className="card-loco">
            <div className="loco-gauge"><span className="speed">120 FPS</span></div>
            <span className="loco-text">Satisfying, isn't it?</span>
          </div>
        );
      case 'logo-wall':
        return (
          <div className="card-logowall">
            <div className="wall-cell">AWWWARDS</div>
            <div className="wall-cell active">FWA</div>
            <div className="wall-cell">WEBFLOW</div>
            <div className="wall-cell active">GSAP</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="osmo-page" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      {/* =========================================================
          1. HEADER (PINNED & MORPHING ON SCROLL)
          ========================================================= */}
      <header className={`osmo-nav-wrapper ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-box">
            <div className="nav-left">
              <button
                className="nav-menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle Menu"
              >
                <div className="hamburger-bars">
                  <span className="bar" />
                  <span className="bar" />
                </div>
                <span className="menu-label">Menu</span>
              </button>
            </div>

            <div className="nav-center">
              <Link to="/" className="nav-logo">
                {isScrolled ? (
                  <span className="nav-star-icon">
                    <svg viewBox="0 0 187 187" fill="currentColor">
                      <path d="M126.049 76.7471L167.276 35.5197L150.805 19.0486L109.577 60.276C107.82 62.0398 104.808 60.7915 104.808 58.3009V0H81.517V70.3375C81.517 76.511 76.511 81.517 70.3375 81.517H0V104.808H58.3009C60.7915 104.808 62.0398 107.82 60.276 109.577L19.0548 150.805L35.5259 167.276L76.7533 126.049C78.5109 124.291 81.5232 125.533 81.5232 128.024V186.324H104.814V115.987C104.814 109.813 109.82 104.808 115.993 104.808H186.331V81.517H128.03C125.539 81.517 124.291 78.5047 126.055 76.7471H126.049Z" />
                    </svg>
                  </span>
                ) : (
                  <span className="nav-wordmark">OSMO</span>
                )}
              </Link>
            </div>

            <div className="nav-right">
              <Link to="/login" className="nav-login-btn">
                Login
              </Link>
              <Link to="/login" className="nav-join-btn">
                Join
              </Link>
            </div>
          </div>

          {/* Under-Navbar Neon Marquee Ticker (Hidden when scrolled) */}
          {!isScrolled && (
            <div className="nav-ticker-bar">
              <div className="ticker-track">
                <div className="ticker-inner">
                  {[...Array(4)].map((_, i) => (
                    <span key={i} className="ticker-item">
                      * EXPLORE PROJECTS BUILT WITH OSMO
                    </span>
                  ))}
                </div>
                <div className="ticker-inner" aria-hidden="true">
                  {[...Array(4)].map((_, i) => (
                    <span key={`dup-${i}`} className="ticker-item">
                      * EXPLORE PROJECTS BUILT WITH OSMO
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Fullscreen Expandable Menu Modal */}
      {menuOpen && (
        <div className="menu-modal-overlay">
          <div className="modal-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-tag">NAVIGATION</span>
              <button className="modal-close" onClick={() => setMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-grid">
              <div className="modal-col">
                <h4>Our Products</h4>
                <ul>
                  <li><a href="#vault" onClick={() => setMenuOpen(false)}>The Vault <span className="pill-lime">NEW</span></a></li>
                  <li><a href="#products" onClick={() => setMenuOpen(false)}>Page Transition Course</a></li>
                  <li><a href="#products" onClick={() => setMenuOpen(false)}>Button Pack <span className="pill-purple">50+</span></a></li>
                  <li><a href="#products" onClick={() => setMenuOpen(false)}>Icon Library</a></li>
                  <li><a href="#products" onClick={() => setMenuOpen(false)}>Creative Community</a></li>
                </ul>
              </div>
              <div className="modal-col">
                <h4>Explore</h4>
                <ul>
                  <li><a href="#platform" onClick={() => setMenuOpen(false)}>The Platform</a></li>
                  <li><a href="#showcase" onClick={() => setMenuOpen(false)}>Showcase</a></li>
                  <li><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a></li>
                  <li><a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          2. HERO SECTION (MASSIVE TITLE & ZERO GAP BOTTOM WHEEL)
          ========================================================= */}
      <section className="section-hero">
        <div className="hero-grid-line" />

        <div className="hero-top-text">
          <h1 className="hero-main-title">
            <span className="title-nowrap">
              <span>Dev Toolkit</span>
              <span className="hero-star-sparkle">
                <svg viewBox="0 0 187 187" fill="currentColor">
                  <path d="M126.049 76.7471L167.276 35.5197L150.805 19.0486L109.577 60.276C107.82 62.0398 104.808 60.7915 104.808 58.3009V0H81.517V70.3375C81.517 76.511 76.511 81.517 70.3375 81.517H0V104.808H58.3009C60.7915 104.808 62.0398 107.82 60.276 109.577L19.0548 150.805L35.5259 167.276L76.7533 126.049C78.5109 124.291 81.5232 125.533 81.5232 128.024V186.324H104.814V115.987C104.814 109.813 109.82 104.808 115.993 104.808H186.331V81.517H128.03C125.539 81.517 124.291 78.5047 126.055 76.7471H126.049Z" />
                </svg>
              </span>
              <span>Built to Flex</span>
            </span>
          </h1>

          <p className="hero-subtitle">
            Platform packed with <span className="badge badge-pill">Webflow</span> &{' '}
            <span className="badge">HTML</span> resources,{' '}
            <span className="badge">icons</span> ,{' '}
            <span className="badge badge-pill">easings</span> and a page transition{' '}
            <span className="badge">course</span>
          </p>
        </div>

        {/* Bottom Touching Radial Wheel (Zero gap at bottom) */}
        <div
          className="hero-radial-stage"
          onPointerDown={(e) => {
            rotationStateRef.current.isPointerDown = true;
            rotationStateRef.current.lastPointerX = e.clientX || 0;
            setIsDragging(true);
          }}
          onMouseEnter={() => {
            setCursorVisible(true);
            setCursorText('Drag');
            rotationStateRef.current.isHovered = true;
          }}
          onMouseLeave={() => {
            setCursorVisible(false);
            rotationStateRef.current.isHovered = false;
            handlePointerUp();
          }}
        >
          <div className="radial-deco-arc" />

          <div className="radial-wheel" ref={wheelRef}>
            {HERO_CARDS.map((card, i) => {
              const angle = i * (360 / HERO_CARDS.length);
              return (
                <div
                  key={card.id}
                  className="radial-card-slot"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-${heroRadius}px) translate(-50%, -50%)`
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="hero-card">
                    <div className="hero-card-media">{renderHeroCardVisual(card)}</div>
                    <div className="hero-card-label">
                      <span>{card.title}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          3. SHOWREEL SECTION ("PLAY REEL")
          ========================================================= */}
      <section className="section-showreel">
        <div className="showreel-container">
          <p className="showreel-statement">
            Osmo is an ever-growing platform with Webflow & HTML resources. Get exclusive access to
            the elements, techniques and code behind award-winning work.
          </p>

          <div className="showreel-player-row">
            <div className="reel-faded-text">Play</div>

            <div className="reel-card-preview">
              <div className="reel-card-header">
                <span>Osmo In use</span>
                <span className="reel-time">00:48</span>
              </div>
              <div className="reel-media">
                <img
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80"
                  alt="Showreel Preview"
                />
                <div className="reel-brand-overlay">
                  <span>FLOW</span>
                </div>
              </div>
            </div>

            <div className="reel-faded-text">Reel</div>

            {/* Handwritten scribble */}
            <div className="scribble-annotation reel-scribble">
              <span>See what it can do!</span>
              <svg viewBox="0 0 100 40" fill="none" stroke="currentColor">
                <path d="M10 20 Q50 35 90 10 M80 5 L90 10 L85 20" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. DUAL FOUNDERS & LATEST UPDATES SECTION
          ========================================================= */}
      <section className="section-founders-updates">
        <div className="founders-container">
          <div className="join-badge-row">
            <div className="avatars-cluster">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60" alt="" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60" alt="" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60" alt="" />
            </div>
            <span>Join 3k+ others</span>
          </div>

          <div className="founders-grid">
            {/* Left Card: Founder (Dennis / Ilja toggle) */}
            <div className="founder-purple-card" onClick={toggleFounder}>
              <div className="card-top-scribble">
                <span>Created by</span>
              </div>
              <h2 className="founder-name">
                {founderIndex === 0 ? (
                  <>Dennis<br /><span className="founder-sub">Snellenberg</span></>
                ) : (
                  <>Ilja<br /><span className="founder-sub">van Eck</span></>
                )}
              </h2>

              <div className="founder-circle-cutout">
                <img
                  src={
                    founderIndex === 0
                      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80'
                  }
                  alt="Founder Portrait"
                />
              </div>

              <button className="founder-about-btn">About us</button>
            </div>

            {/* Right Card: Latest Updates & Weekly Drop */}
            <div className="latest-updates-card">
              <div className="updates-topbar">
                <span className="osmo-tag-mini">OSMO SUPPLY B.V.</span>
                <span className="updates-heading">Latest updates<br />from Osmo</span>
              </div>

              <div className="update-inner-box">
                <div className="update-badges">
                  <span className="badge-dark">4 DAYS AGO</span>
                  <span className="badge-lime">NEW RESOURCE</span>
                </div>
                <h3 className="update-title">Section Anchor Dock</h3>
                <span className="update-cat">NAVIGATION</span>

                <div className="update-preview-visual">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
                    alt="Section Anchor Dock"
                  />
                  <div className="mini-dock-preview">
                    <span>Making it feel right</span>
                    <button className="mini-dock-btn">Explore</button>
                  </div>
                </div>
              </div>

              <div className="scribble-annotation updates-scribble">
                <span>New stuff is<br />added every week!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. THE PLATFORM (THE VAULT) DASHBOARD
          ========================================================= */}
      <section className="section-platform" id="platform">
        <div className="platform-container">
          <div className="platform-title-row">
            <div className="platform-heading-wrap">
              <h2 className="platform-heading">The platform</h2>
              <div className="scribble-annotation platform-scribble">
                <span>( The Vault )</span>
                <svg viewBox="0 0 40 30" fill="none" stroke="currentColor">
                  <path d="M5 5 Q20 25 35 15 M30 5 L35 15 L25 20" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <p className="platform-desc">
              Built by two award-winning creative developers, our vault gives you access to the
              techniques, components, code, and tools behind our projects. Build, tweak, and make them
              your own.
            </p>
          </div>

          {/* Detailed Interactive Dashboard UI */}
          <div className="vault-dashboard-mockup">
            <div className="dashboard-sidebar">
              <div className="sidebar-brand">
                <span className="s-logo">OSMO</span>
                <span className="s-star">✱</span>
              </div>
              <div className="sidebar-search">
                <Search size={14} />
                <span>Search</span>
                <span className="s-key">⌘K</span>
              </div>
              <div className="sidebar-section">
                <span className="s-sec-title">The Vault</span>
                <div className="s-menu-item active"><Sliders size={14} /> Utilities & Scripts</div>
                <div className="s-menu-item"><Layers size={14} /> Scroll Animations</div>
                <div className="s-menu-item"><Code2 size={14} /> Buttons</div>
                <div className="s-menu-item">Video & Audio</div>
                <div className="s-menu-item">Sliders & Marquees</div>
                <div className="s-menu-item">Cursor Animations</div>
                <div className="s-menu-item">Hover Interactions</div>
                <div className="s-menu-item">Navigation</div>
                <div className="s-menu-item">Icons</div>
                <div className="s-menu-item">Learn</div>
                <div className="s-menu-item">Easings</div>
              </div>
              <div className="sidebar-user">
                <span className="user-dot" /> Dennis Snellenberg
              </div>
            </div>

            <div className="dashboard-main">
              <div className="dashboard-hero-box">
                <span className="user-greeting">Hello Dennis 👋</span>
                <h3 className="vault-welcome-h">Welcome to the Vault</h3>
                <div className="vault-search-bar">
                  <Search size={16} />
                  <span>parallax</span>
                </div>
              </div>

              {/* Scribble in dashboard */}
              <div className="scribble-annotation tips-scribble">
                <span>Tips and tricks!</span>
              </div>

              <div className="dashboard-cards-grid">
                <div className="dash-card">
                  <div className="dash-card-img"><img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80" alt="" /></div>
                  <span className="dash-card-title">Footer Parallax Effect</span>
                </div>
                <div className="dash-card">
                  <div className="dash-card-img"><img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80" alt="" /></div>
                  <span className="dash-card-title">Stacking Cards Parallax</span>
                </div>
                <div className="dash-card">
                  <div className="dash-card-img"><img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80" alt="" /></div>
                  <span className="dash-card-title">Locomotive Smooth Scroll</span>
                </div>
              </div>
            </div>
          </div>

          <div className="platform-bottom-bar">
            <p>We built Osmo to help creative developers work smarter, faster, and better.</p>
            <Link to="/login" className="purple-pill-btn">
              About the Vault
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          6. "A GROWING TOOLKIT" 3D PRODUCT CAROUSEL SLIDER
          ========================================================= */}
      <section className="section-products-slider" id="products">
        <div className="products-slider-header">
          <h2 className="slider-main-h">A growing toolkit for creative developers</h2>
          <p className="slider-sub">Access everything with a single membership:</p>
        </div>

        {/* Tab Filters */}
        <div className="product-tab-buttons">
          {PRODUCT_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              className={`ptab-btn ${activeProductTab === i ? 'is-active' : ''}`}
              onClick={() => handleProductTabClick(i)}
            >
              {slide.title}
            </button>
          ))}
        </div>

        {/* 3D Radial Stage with Products */}
        <div
          className="products-3d-stage"
          onPointerDown={(e) => {
            productRotationRef.current.isPointerDown = true;
            productRotationRef.current.lastPointerX = e.clientX || 0;
            setIsDragging(true);
          }}
          onMouseEnter={() => {
            setCursorVisible(true);
            setCursorText('Drag');
          }}
          onMouseLeave={() => {
            setCursorVisible(false);
            handlePointerUp();
          }}
        >
          <div className="products-deco-arc" />

          <div className="products-wheel" ref={productWheelRef}>
            {PRODUCT_SLIDES.map((slide, i) => {
              const angle = i * (360 / PRODUCT_SLIDES.length);
              return (
                <div
                  key={slide.id}
                  className="product-card-slot"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-880px) translate(-50%, -50%)`
                  }}
                  onClick={() => handleProductTabClick(i)}
                >
                  <div className={`product-big-card theme-${slide.theme}`}>
                    <span className="pcard-badge">{slide.badge}</span>
                    <span className="pcard-star">✱</span>
                    <h3 className="pcard-title">{slide.title}</h3>
                    <p className="pcard-desc">{slide.desc}</p>

                    <div className="pcard-media-preview">
                      <img
                        src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80"
                        alt=""
                      />
                    </div>

                    <button className="pcard-btn">{slide.buttonText}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          7. "WHY OSMO?" SECTION & LOGO TICKER
          ========================================================= */}
      <section className="section-why-osmo" id="why-osmo">
        <div className="why-container">
          <div className="why-top-row">
            <div className="why-logo-block">
              <div className="os-badge-box">
                <span className="os-text">OS</span>
                <span className="os-star">✱</span>
              </div>
            </div>

            <div className="why-content-block">
              <div className="scribble-annotation why-scribble">
                <span>Why Osmo?</span>
                <svg viewBox="0 0 40 30" fill="none" stroke="currentColor">
                  <path d="M5 5 Q20 25 35 15" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <h2 className="why-headline">
                Level up your game and join a community of creatives who love building great websites
                as much as you do.
              </h2>

              <div className="why-rows-list">
                <div className="why-row">
                  <h4 className="why-row-title">Build faster and better</h4>
                  <p className="why-row-p">
                    Our resources save you hours of rebuilding from scratch. Each one is made for
                    real-world projects, so you can focus on shipping work that stands out.
                  </p>
                </div>
                <div className="why-row">
                  <h4 className="why-row-title">Speed up your process</h4>
                  <p className="why-row-p">
                    These aren’t stripped-down templates. Every resource is built to be fast,
                    flexible, and production-ready, so you can ship beautiful work without trading
                    quality for time.
                  </p>
                </div>
                <div className="why-row">
                  <h4 className="why-row-title">A living and growing system</h4>
                  <p className="why-row-p">
                    We keep adding new resources, ideas, and techniques every week. The Vault evolves
                    with you and your needs, so your toolkit never stops expanding.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trusted by Industry Giants Marquee */}
          <div className="trusted-giants-wrap">
            <div className="trusted-eyebrow">
              <span className="line" />
              <span className="t-badge">TRUSTED BY INDUSTRY GIANTS</span>
              <span className="line" />
            </div>

            <div className="trusted-ticker">
              <div className="trusted-track">
                {['superpower', 'tonik', 'webflow', 'HELLO MONDAY / DEPT', 'UI8', 'AWWWARDS', 'GSAP'].map(
                  (brand, i) => (
                    <span key={i} className="trusted-brand">
                      {brand}
                    </span>
                  )
                )}
              </div>
              <div className="trusted-track" aria-hidden="true">
                {['superpower', 'tonik', 'webflow', 'HELLO MONDAY / DEPT', 'UI8', 'AWWWARDS', 'GSAP'].map(
                  (brand, i) => (
                    <span key={`dup-${i}`} className="trusted-brand">
                      {brand}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          8. COMMUNITY GLOBE & REVIEW CARD
          ========================================================= */}
      <section className="section-community-review">
        <div className="comm-container">
          <div className="comm-grid">
            {/* Left: Global Radar Globe */}
            <div className="comm-globe-card">
              <div className="globe-tag">Connect Worldwide</div>
              <div className="globe-radar-visual">
                <div className="radar-circle rc1" />
                <div className="radar-circle rc2" />
                <div className="radar-circle rc3" />
                <div className="radar-map-pin" />
              </div>
              <div className="scribble-annotation globe-scribble">
                <span>Osmo's Global Community</span>
              </div>
            </div>

            {/* Right: Purple Review Card */}
            <div className="comm-review-card">
              <h3 className="review-quote">Osmo empowered me to take on any creative challenge</h3>
              <p className="review-body">
                Thanks to Osmo, I've won my first major awards and signed clients I once only dreamed
                of. Their powerful, easy-to-use effects feature cutting-edge code that has expanded my
                development skills. Joining this community is an easy choice for developers at any level
                who want to grow and succeed!
              </p>

              <div className="review-author">
                <img
                  src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80"
                  alt="Dang Nguyen"
                />
                <div>
                  <h5 className="author-name">Dang Nguyen</h5>
                  <span className="author-role">HEAD OF CREATIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          9. MEMBERSHIP PRICING CARDS
          ========================================================= */}
      <section className="section-pricing" id="pricing">
        <div className="pricing-container">
          <div className="pricing-top-badge">
            <span>ONE PLAN (012) REGULAR UPDATES | INCLUDES 01 COMMUNITY</span>
          </div>

          <h2 className="pricing-heading">Everything you need in one membership</h2>

          <div className="pricing-toggle-wrap">
            <div className="pricing-toggle">
              <button
                className={!billingAnnually ? 'active' : ''}
                onClick={() => setBillingAnnually(false)}
              >
                Quarterly
              </button>
              <button
                className={billingAnnually ? 'active' : ''}
                onClick={() => setBillingAnnually(true)}
              >
                Annually
              </button>
            </div>
            <div className="scribble-annotation save-scribble">
              <span>Save 20% per year</span>
            </div>
          </div>

          <div className="pricing-cards-grid">
            {/* Solo Card */}
            <div className="price-card solo-card">
              <span className="p-user-badge">1 USER</span>
              <h3 className="p-plan-name">Solo</h3>
              <div className="p-cost">
                <span className="p-amount">{billingAnnually ? '€20 EUR' : '€25 EUR'}</span>
                <span className="p-freq">Per month, billed annually</span>
              </div>
              <Link to="/login" className="p-btn-black">Become a member</Link>
              <div className="p-feature-tag">205 Vault Resources, added weekly</div>
              <a href="#pricing" className="p-benefits-link">View all benefits</a>
            </div>

            {/* Team Card */}
            <div className="price-card team-card">
              <div className="team-header-row">
                <span className="p-user-badge">MIN 2 USERS</span>
                <span className="scribble-team-save">Save an extra 20% per user!</span>
              </div>
              <h3 className="p-plan-name">Team</h3>
              <div className="p-cost">
                <span className="p-amount">{billingAnnually ? '€16 EUR' : '€20 EUR'}</span>
                <span className="p-freq">Per person/month, billed annually</span>
              </div>
              <Link to="/login" className="p-btn-purple">Sign up your team</Link>
              <div className="p-feature-tag">205 Vault Resources, added weekly</div>
              <a href="#pricing" className="p-benefits-link">View all benefits</a>
            </div>
          </div>

          <div className="pricing-full-btn-wrap">
            <button className="view-full-pricing-btn">View full pricing</button>
          </div>
        </div>
      </section>

      {/* =========================================================
          10. "MADE WITH OSMO" SHOWCASE SLIDER
          ========================================================= */}
      <section className="section-madewith" id="showcase">
        <div className="madewith-container">
          <div className="madewith-title-row">
            <span className="mw-word">Made</span>
            <span className="mw-star">✱</span>
            <span className="mw-word">with</span>
            <span className="mw-word">Osmo</span>
            <div className="scribble-annotation talented-scribble">
              <span>These folks are talented</span>
            </div>
          </div>

          {/* Showcase Card Slider */}
          <div className="showcase-slider-wrapper">
            <div
              className="showcase-card"
              style={{ backgroundColor: SHOWCASE_ITEMS[showcaseIndex].bg, color: SHOWCASE_ITEMS[showcaseIndex].textColor }}
            >
              <div className="showcase-card-header">
                <span className="sc-name">{SHOWCASE_ITEMS[showcaseIndex].name}</span>
                <div className="sc-nav-links">
                  <span>Work</span>
                  <span>About</span>
                  <span>Contact</span>
                </div>
              </div>

              <div className="showcase-card-body">
                <h3 className="sc-tagline">{SHOWCASE_ITEMS[showcaseIndex].tagline}</h3>
              </div>

              <div className="showcase-card-footer">
                <span className="sc-author">{SHOWCASE_ITEMS[showcaseIndex].author}</span>
                <span className="sc-resources-badge">{SHOWCASE_ITEMS[showcaseIndex].usedCount}</span>
              </div>
            </div>

            <div className="showcase-controls">
              <button onClick={prevShowcase} className="sc-nav-btn"><ChevronLeft size={20} /></button>
              <button onClick={nextShowcase} className="sc-nav-btn"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="madewith-cta-wrap">
            <Link to="/login" className="explore-showcase-btn">Explore showcase</Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          11. READY TO LEVEL UP? + FOOTER
          ========================================================= */}
      <section className="section-cta-footer">
        <div className="cta-footer-container">
          {/* Dual CTA Cards */}
          <div className="cta-dual-grid">
            <div className="cta-circle-card">
              <div className="spinning-circle-text">
                <span>BUILT TO FLEX ✱ WE'LL SEE YOU THERE!</span>
              </div>
              <div className="center-shoe-graphic" />
            </div>

            <div className="cta-purple-card">
              <div className="cta-users-row">
                <div className="avatars-cluster">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60" alt="" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60" alt="" />
                </div>
                <span>Join 3k+ others</span>
              </div>

              <h2 className="cta-giant-h">Ready to level up?</h2>
              <p className="cta-sub">Become a member to unlock the full Osmo toolkit today.</p>

              <div className="cta-buttons-row">
                <Link to="/login" className="cta-black-btn">Become a member</Link>
                <a href="#faq" className="cta-white-btn">FAQs</a>
              </div>
            </div>
          </div>

          {/* Newsletter & Sitemap Grid */}
          <div className="footer-sitemap-grid">
            <div className="newsletter-box">
              <h3>Subscribe to the Osmo Newsletter</h3>
              <form onSubmit={(e) => e.preventDefault()} className="newsletter-form">
                <input type="text" placeholder="First name" className="n-input" />
                <input type="email" placeholder="yourname@email.com" className="n-input" />
                <div className="n-checkbox">
                  <input type="checkbox" id="privacy" defaultChecked />
                  <label htmlFor="privacy">I agree to the <a href="#privacy">Privacy Policy</a></label>
                </div>
                <button type="submit" className="n-submit-btn">Get updates</button>
              </form>
            </div>

            <div className="sitemap-cols">
              <div className="s-col">
                <h4>Product</h4>
                <a href="#platform">The Vault</a>
                <a href="#products">Page Transition Course</a>
                <a href="#products">Button Pack <span className="pill-purple">NEW</span></a>
                <a href="#products">Icon Library</a>
                <a href="#products">Community</a>
                <a href="#products">Easings <span className="pill-gray">NEW</span></a>
              </div>
              <div className="s-col">
                <h4>Community</h4>
                <a href="#showcase">Showcase</a>
                <a href="#why-osmo">About Osmo</a>
                <a href="#updates">Updates</a>
              </div>
              <div className="s-col">
                <h4>Membership</h4>
                <a href="#pricing">Collection</a>
                <a href="#pricing">Pricing</a>
                <a href="#faq">FAQs</a>
                <a href="#support">Support</a>
              </div>
            </div>
          </div>

          {/* Social Links Bar */}
          <div className="footer-actions-bar">
            <div className="footer-auth-buttons">
              <Link to="/login" className="f-login-btn">Login</Link>
              <Link to="/login" className="f-join-btn">Join Osmo</Link>
            </div>

            <div className="footer-social-icons">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* Giant Bottom OSMOSMO Typography */}
          <div className="giant-brand-typography">
            <span>OSMOSMO</span>
          </div>

          <div className="footer-legal-bar">
            <div className="legal-links">
              <a href="#licensing">LICENSING</a>
              <a href="#faqs">FAQS</a>
              <a href="#privacy">PRIVACY</a>
              <a href="#cookies">COOKIES</a>
            </div>
            <div className="legal-copy">
              <span>© 2026 OSMO SUPPLY B.V.</span>
            </div>
            <div className="legal-credits">
              <span>CREATED BY <span className="credit-tag">DENNIS</span> <span className="credit-tag">ILJA</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Drag Cursor Bubble */}
      {cursorVisible && (
        <div
          className={`custom-drag-bubble ${isDragging ? 'is-active' : ''}`}
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`
          }}
        >
          <div className="drag-arrows">
            <span className="arrow-l">◄</span>
            <span className="drag-label">{cursorText}</span>
            <span className="arrow-r">►</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
