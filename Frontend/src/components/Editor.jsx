import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutGrid,
  Users,
  Search,
  FileText,
  Gift,
  MoreVertical,
  Plus,
  Minus,
  Maximize2,
  Lock,
  Unlock,
  Send,
  ArrowLeft,
  Sparkles,
  Layers,
  Wand2,
  Bot,
  Image as ImageIcon,
  Video,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { generateAdImage } from '../services/aiService';
import './Editor.css';

const GENRE_DETAILS = {
  'Poster Ad': {
    category: 'Poster Ad',
    title: 'Poster Ad Creative Architecture',
    description: 'High-impact visual composition designed for maximum audience capture. Features dynamic illustrative artwork, balanced typography, and vivid contrast engineered for instant brand engagement and cultural recall.',
    imageUrl: '/samples/cricket_ad.jpg',
    tags: ['4:5 Poster Ratio', 'High Contrast Graphic Art', 'Dynamic Subject Lockup']
  },
  'Meme Ad': {
    category: 'Meme Ad',
    title: 'Viral Meme & Pop-Culture Ad Format',
    description: 'Relatable pop-culture and sports illustration format crafted for social virality. Combines high-energy visual hooks with expressive character art to spark community reactions and organic shares.',
    imageUrl: '/samples/cricket_ad.jpg',
    tags: ['Pop-Culture Hook', 'Viral Social Aesthetic', 'Community Engagement']
  },
  'Brand Ad': {
    category: 'Brand Ad',
    title: 'Campaign Illustration & Brand Storytelling',
    description: 'Artistic campaign illustration engineered for brand storytelling and emotional connection. Emphasizes refined character detailing, thematic color harmony, and memorable creative identity.',
    imageUrl: '/samples/cricket_ad.jpg',
    tags: ['Custom Illustrated Art', 'Campaign Storytelling', 'Brand Creative Authority']
  }
};

const Editor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  const projectCategory = location.state?.projectCategory || 'Poster Ad';
  const projectName = location.state?.projectName || `${projectCategory} Project`;
  const projectId = location.state?.projectId || location.state?.id || null;
  const currentGenre = GENRE_DETAILS[projectCategory] || GENRE_DETAILS['Poster Ad'];

  const [activeTab, setActiveTab] = useState('my-projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const [attachedImages, setAttachedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState(null);
  const [generationError, setGenerationError] = useState(null);

  const fileInputRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Canvas ready for "${projectName}". Type your creative prompt below to generate your custom AI ad artwork.`
    }
  ]);

  // Canvas Viewport Pan & Zoom States (Hand Movement)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const userInitial = user?.firstName ? user.firstName[0].toUpperCase() : 'N';

  // Zoom handlers
  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.5));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.4));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const toggleLock = () => setIsLocked((prev) => !prev);

  // Canvas Mouse Pan (Hand Movement Drag)
  const handleCanvasMouseDown = (e) => {
    if (isLocked) return;
    if (
      e.target.closest('.stitch-canvas-controls') ||
      e.target.closest('button') ||
      e.target.closest('input') ||
      e.target.closest('textarea') ||
      e.target.closest('a')
    ) {
      return;
    }
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleCanvasMouseMove = (e) => {
    if (!isPanning || isLocked) return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y
    });
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // Wheel Zoom Listener
  useEffect(() => {
    const handleWheel = (e) => {
      if (isLocked) return;
      if (!canvasRef.current || !canvasRef.current.contains(e.target)) return;
      e.preventDefault();
      const zoomFactor = 1.06;
      setZoom((prevZoom) => {
        if (e.deltaY < 0) {
          return Math.min(prevZoom * zoomFactor, 2.5);
        } else {
          return Math.max(prevZoom / zoomFactor, 0.4);
        }
      });
    };

    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isLocked]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random()}`,
            name: file.name,
            url: event.target.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (id) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Trigger prompt submission and Backend AI generation
  const handleSendPrompt = async (e) => {
    e?.preventDefault();
    if ((!prompt.trim() && attachedImages.length === 0) || isGenerating) return;

    const userText = prompt.trim();
    const uploaded = [...attachedImages];

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText || '(Image Reference Attached)',
      images: uploaded
    };

    setMessages((prev) => [...prev, newMsg]);
    setPrompt('');
    setAttachedImages([]);
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Call backend AI generation endpoint
      const result = await generateAdImage({
        prompt: userText || `Creative ${projectCategory} design`,
        projectId,
        category: projectCategory
      });

      if (result && result.imageUrl) {
        setGeneratedAd({
          imageUrl: result.imageUrl,
          prompt: userText || `Creative ${projectCategory}`,
          category: projectCategory,
          createdAt: new Date()
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: `✨ Generated your "${projectCategory}" creative successfully! Your ad artwork is now rendered on the canvas.`
          }
        ]);
      } else {
        throw new Error('No image URL returned from AI service');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to generate image from AI service. Please verify server connection.';
      setGenerationError(errMsg);

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          isError: true,
          text: `⚠️ ${errMsg}`
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download generated image
  const handleDownloadImage = () => {
    if (!generatedAd?.imageUrl) return;
    const a = document.createElement('a');
    a.href = generatedAd.imageUrl;
    a.download = `${projectName.replace(/\s+/g, '_')}_ad.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="stitch-app-layout"
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
    >
      {/* ====================================================================
          TOP NAVBAR
          ==================================================================== */}
      <header className="stitch-topbar">
        <div className="stitch-topbar-left">
          <button
            className="stitch-back-btn"
            onClick={() => navigate('/dashboard')}
            title="Return to Dashboard"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>

          <div className="stitch-logo-block">
            <span className="stitch-logo-text">AdsHub</span>
            <span className="stitch-beta-badge">BETA</span>
          </div>

          <div className="stitch-project-pill">
            <span className="stitch-project-name">{projectName}</span>
            <span className="stitch-category-tag">{projectCategory}</span>
          </div>
        </div>

        <div className="stitch-topbar-right">
          <button className="stitch-nav-icon-link" title="Documentation">
            <FileText size={16} />
            <span>Docs</span>
          </button>

          {/* Discord Icon SVG */}
          <button className="stitch-nav-icon-btn" title="Community Discord">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </button>

          {/* X (Twitter) Icon SVG */}
          <button className="stitch-nav-icon-btn" title="Follow us on X">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>

          <button className="stitch-nav-icon-btn" title="Special Perks">
            <Gift size={18} />
          </button>

          <button className="stitch-nav-icon-btn" title="More Options">
            <MoreVertical size={18} />
          </button>

          {/* User Profile Avatar */}
          <div className="stitch-user-avatar" title={user?.email || 'User Account'}>
            <span>{userInitial}</span>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN WORKSPACE LAYOUT (LEFT PANEL + CENTRAL CANVAS)
          ==================================================================== */}
      <div className="stitch-workspace-body">
        {/* LEFT FLOATING SIDEBAR PANEL (#202124) */}
        <aside className="stitch-left-sidebar">
          {/* Top Pill Tabs */}
          <div className="stitch-tabs-row">
            <button
              className={`stitch-tab-btn ${activeTab === 'my-projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-projects')}
            >
              <LayoutGrid size={15} />
              <span>My projects</span>
            </button>

            <button
              className={`stitch-tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
              onClick={() => setActiveTab('shared')}
            >
              <Users size={15} />
              <span>Shared with me</span>
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="stitch-search-wrap">
            <Search size={15} className="stitch-search-icon" />
            <input
              type="text"
              placeholder="Search projects"
              className="stitch-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Messages & Chat Stream */}
          <div className="stitch-prompt-stream">
            {messages.map((m) => (
              <div key={m.id} className={`stitch-msg-item ${m.sender} ${m.isError ? 'error' : ''}`}>
                <div className="stitch-msg-header">
                  {m.isError ? <AlertCircle size={13} /> : <Bot size={13} />}
                  <span>{m.sender === 'user' ? 'You' : 'AdsHub AI'}</span>
                </div>
                {m.images && m.images.length > 0 && (
                  <div className="stitch-msg-images-grid">
                    {m.images.map((img) => (
                      <img key={img.id} src={img.url} alt="Attached upload" className="stitch-msg-img-thumb" />
                    ))}
                  </div>
                )}
                <p className="stitch-msg-body">{m.text}</p>
              </div>
            ))}

            {isGenerating && (
              <div className="stitch-msg-item assistant generating">
                <Sparkles size={14} className="stitch-sparkle-spin" />
                <span>Calling AI Engine & generating ad asset...</span>
              </div>
            )}
          </div>

          {/* Left Panel Prompt Input and Send Button at Bottom */}
          <div className="stitch-left-bottom-prompt">
            <form className="stitch-input-form" onSubmit={handleSendPrompt}>
              <div className="stitch-prompt-input-container">
                {/* Image Previews if any are attached */}
                {attachedImages.length > 0 && (
                  <div className="stitch-image-previews-row">
                    {attachedImages.map((img) => (
                      <div key={img.id} className="stitch-img-preview-chip">
                        <img src={img.url} alt={img.name} className="stitch-img-thumb" />
                        <button
                          type="button"
                          className="stitch-img-remove-btn"
                          onClick={() => handleRemoveImage(img.id)}
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Textarea for Prompt */}
                <textarea
                  className="stitch-left-textarea"
                  placeholder={`Describe your ${projectCategory} idea... (e.g. Bold sports poster with vibrant neon energy)`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  }}
                />

                {/* Bottom Action Row: + Upload Image Button (Left) and Send Button (Right) */}
                <div className="stitch-prompt-actions-bar">
                  <div className="stitch-actions-left">
                    <button
                      type="button"
                      className="stitch-attach-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload Reference Image"
                    >
                      <Plus size={16} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="stitch-send-btn"
                    disabled={(!prompt.trim() && attachedImages.length === 0) || isGenerating}
                    title="Send Prompt"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </aside>

        {/* ====================================================================
            CENTER CANVAS WORKSPACE (#1E1E1E) WITH HAND PANNING & SKELETON
            ==================================================================== */}
        <main
          className={`stitch-center-canvas ${isPanning ? 'panning' : ''} ${isLocked ? 'locked' : ''}`}
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
        >
          {/* Subtle Dotted Canvas Grid with Pan/Zoom movement */}
          <div
            className="stitch-dotted-grid-bg"
            style={{
              backgroundPosition: `${pan.x}px ${pan.y}px`
            }}
          />

          {/* Pannable & Zoomable Transform Layer */}
          <div
            className="stitch-canvas-transform-wrapper"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            <div className="stitch-canvas-inner-content">
              {/* Hero Headline & Action Buttons */}
              <div className="stitch-hero-section">
                <h1 className="stitch-hero-title">Welcome to AdsHub.</h1>

                <div className="stitch-hero-actions">
                  <button
                    className="stitch-hero-btn"
                    title="Image Inspiration"
                    onClick={() => setPrompt(`High-impact cinematic ${projectCategory} with dynamic lighting, clean typography, and bold product focus.`)}
                  >
                    <ImageIcon size={18} />
                    <span>Image inspiration</span>
                  </button>

                  <button
                    className="stitch-hero-btn"
                    title="Video Inspiration"
                    onClick={() => setPrompt(`Motion-ready viral ${projectCategory} composition with energetic framing and pop-culture visual hooks.`)}
                  >
                    <Video size={18} />
                    <span>Video inspiration</span>
                  </button>
                </div>
              </div>

              {/* ================================================================
                  CANVAS STATES: SIMPLE SKELETON | PURE IMAGE | FRESH SHOWCASE
                  ================================================================ */}
              <div className="stitch-genre-card-wrapper">
                {/* 1. SIMPLE & CLEAN SKELETON LOADER (Minimalist Image Box) */}
                {isGenerating && (
                  <div className="stitch-canvas-simple-skeleton">
                    <div className="stitch-skeleton-simple-shimmer" />
                    <div className="stitch-skeleton-center-minimal">
                      <Sparkles size={22} className="stitch-sparkle-spin" />
                      <span>Generating image...</span>
                    </div>
                  </div>
                )}

                {/* 2. GENERATED PURE IMAGE (No Card Wrapper, Just the Image) */}
                {!isGenerating && generatedAd && (
                  <div className="stitch-canvas-image-frame">
                    <img
                      src={generatedAd.imageUrl}
                      alt={generatedAd.prompt}
                      className="stitch-canvas-pure-image"
                    />
                    <div className="stitch-image-overlay-actions">
                      <button
                        className="stitch-image-action-btn"
                        onClick={handleDownloadImage}
                        title="Download image"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. FRESH / INITIAL SHOWCASE CARD (Disappears Once Generated) */}
                {!isGenerating && !generatedAd && (
                  <div className="stitch-genre-card">
                    <div className="stitch-genre-image-box">
                      <img
                        src={currentGenre.imageUrl}
                        alt={currentGenre.title}
                        className="stitch-genre-card-img"
                      />
                      <div className="stitch-genre-badge">{currentGenre.category}</div>
                    </div>

                    <div className="stitch-genre-text-block">
                      <h3 className="stitch-genre-heading">{currentGenre.title}</h3>
                      <p className="stitch-genre-text">{currentGenre.description}</p>
                      <div className="stitch-genre-specs">
                        {currentGenre.tags.map((tag, idx) => (
                          <span key={idx} className="stitch-genre-spec-pill">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floating Canvas Controls (Bottom-Left) */}
          <div className="stitch-canvas-controls" onClick={(e) => e.stopPropagation()}>
            <button className="stitch-control-btn" onClick={zoomIn} title="Zoom In">
              <Plus size={16} />
            </button>
            <div className="stitch-control-divider" />
            <button className="stitch-control-btn" onClick={zoomOut} title="Zoom Out">
              <Minus size={16} />
            </button>
            <div className="stitch-control-divider" />
            <button className="stitch-control-btn" onClick={resetZoom} title="Reset View (100%)">
              <Maximize2 size={15} />
            </button>
            <div className="stitch-control-divider" />
            <button
              className={`stitch-control-btn ${isLocked ? 'locked' : ''}`}
              onClick={toggleLock}
              title={isLocked ? 'Unlock Canvas' : 'Lock Canvas'}
            >
              {isLocked ? '🔒' : '🔓'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Editor;