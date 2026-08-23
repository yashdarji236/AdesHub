import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutGrid,
  Users,
  Search,
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
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  X
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

  const incomingPrompt =
    location.state?.referencePrompt ||
    location.state?.prompt ||
    location.state?.mediaUrl ||
    location.state?.url ||
    '';

  const incomingMediaUrl =
    location.state?.mediaUrl ||
    location.state?.url ||
    location.state?.referenceMedia?.fullImage ||
    location.state?.referenceMedia?.image ||
    location.state?.referenceMedia?.video ||
    '';

  const incomingMedia = location.state?.referenceMedia || null;

  const [activeTab, setActiveTab] = useState('my-projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [prompt, setPrompt] = useState(incomingPrompt);
  const [attachedImages, setAttachedImages] = useState(() => {
    if (incomingMediaUrl) {
      return [
        {
          id: `ref-img-${Date.now()}`,
          name: incomingMedia?.alt ? incomingMedia.alt.slice(0, 24) : 'Inspiration Reference',
          url: incomingMediaUrl
        }
      ];
    }
    return [];
  });
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

  // Sync incoming inspiration reference state into the input box on mount or navigation change
  useEffect(() => {
    if (
      location.state?.referencePrompt ||
      location.state?.mediaUrl ||
      location.state?.url ||
      location.state?.referenceMedia
    ) {
      const pText =
        location.state?.referencePrompt ||
        location.state?.prompt ||
        location.state?.mediaUrl ||
        location.state?.url ||
        '';

      const mUrl =
        location.state?.mediaUrl ||
        location.state?.url ||
        location.state?.referenceMedia?.fullImage ||
        location.state?.referenceMedia?.image ||
        location.state?.referenceMedia?.video ||
        '';

      if (pText) {
        setPrompt(pText);
      }

      if (mUrl) {
        setAttachedImages((prev) => {
          const already = prev.some((img) => img.url === mUrl);
          if (already) return prev;
          return [
            ...prev,
            {
              id: `ref-img-${Date.now()}`,
              name: location.state?.referenceMedia?.alt
                ? location.state.referenceMedia.alt.slice(0, 24)
                : 'Inspiration Reference',
              url: mUrl
            }
          ];
        });
      }

      // Add assistant message in chat stream
      setMessages((prev) => {
        const hasMsg = prev.some((m) => m.id === 'inspiration-loaded-msg');
        if (hasMsg) return prev;
        return [
          ...prev,
          {
            id: 'inspiration-loaded-msg',
            sender: 'assistant',
            text: `✨ Inspiration reference loaded into the prompt input below. You can refine your prompt and click Send to generate your ad artwork.`
          }
        ];
      });

      // Pulse input and focus textarea
      setIsInputPulsing(true);
      setTimeout(() => setIsInputPulsing(false), 1500);
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [location.state]);

  // Prompts for Other AI Modal State
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);
  const [copiedModelId, setCopiedModelId] = useState(null);
  const [activeModelFilter, setActiveModelFilter] = useState('all');

  // Active theme / creative idea for building model-specific prompts
  const activeCreativeIdea =
    prompt.trim() ||
    generatedAd?.prompt ||
    `${projectCategory} commercial advertisement with bold brand layout and creative product framing`;

  const OTHER_AI_MODELS = [
    {
      id: 'midjourney',
      name: 'Midjourney v6.1',
      category: 'Photorealistic Image',
      badge: 'Midjourney',
      color: '#0d99ff',
      siteUrl: 'https://www.midjourney.com',
      prompt: `/imagine prompt: High-impact commercial ${projectCategory} ad visual of ${activeCreativeIdea}, master advertising composition, dynamic cinematic lighting, Hasselblad H6D-100c 80mm lens photography, 8k resolution, crisp commercial color grading, award-winning art direction --ar 4:5 --v 6.1 --style raw --s 250`,
      tips: 'Best for ultra-detailed aesthetic lighting, commercial studio photography, and high aesthetic score.'
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT (DALL·E 3)',
      category: 'Creative Ad Composition',
      badge: 'OpenAI DALL-E 3',
      color: '#10a37f',
      siteUrl: 'https://chatgpt.com',
      prompt: `Create a professional, high-converting commercial ad visual for ${projectCategory}. The creative theme is "${activeCreativeIdea}". Use balanced negative space for clean headline typography, bold color harmony with rich depth, vivid textures, and studio commercial lighting tailored for premium marketing campaigns.`,
      tips: 'Best for conceptual storytelling, following complex instructions, and clean graphic layouts.'
    },
    {
      id: 'flux',
      name: 'FLUX.1 [dev/schnell]',
      category: 'Next-Gen Photorealism',
      badge: 'Black Forest Labs',
      color: '#ff6b00',
      siteUrl: 'https://replicate.com/black-forest-labs/flux-1.1-pro',
      prompt: `masterpiece, professional commercial ${projectCategory} banner ad, theme of ${activeCreativeIdea}, hyper-detailed surfaces, volumetric soft rim lighting, ultra sharp focus, vibrant cinematic palette, 8k photorealistic capture, award winning commercial photography`,
      negativePrompt: 'blurry, low quality, deformed, watermark, distorted, oversaturated, amateur',
      tips: 'Best for crisp anatomical rendering, high-speed generation, and photorealistic realism.'
    },
    {
      id: 'ideogram',
      name: 'Ideogram 2.0',
      category: 'Typography & Poster Ad',
      badge: 'Ideogram',
      color: '#e11d48',
      siteUrl: 'https://ideogram.ai',
      prompt: `A stunning graphic design commercial poster for ${projectCategory}, featuring "${activeCreativeIdea}". Prominent bold stylized headline typography, modern Swiss graphic design layout, harmonious corporate color balance, vector-meets-photo hybrid aesthetic, clean typography lockup, 4:5 aspect ratio.`,
      tips: 'Best in the world for rendering crisp readable text, bold headlines, and graphic posters.'
    },
    {
      id: 'runway',
      name: 'Runway Gen-3 / Luma Dream',
      category: 'Motion Video Ad',
      badge: 'Video AI',
      color: '#8b5cf6',
      siteUrl: 'https://runwayml.com',
      prompt: `Cinematic commercial video shot of ${activeCreativeIdea}. Slow dynamic tracking camera dolly in, anamorphic lens flare, professional 4K commercial color grade, hyper-realistic fluid motion, subtle depth of field, 60fps smooth advertisement motion.`,
      tips: 'Best for converting static ad concepts into viral video hooks and social reels.'
    }
  ];

  const filteredAiModels =
    activeModelFilter === 'all'
      ? OTHER_AI_MODELS
      : OTHER_AI_MODELS.filter((m) => m.id === activeModelFilter);

  const handleCopyAiPrompt = (modelId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedModelId(modelId);
    setTimeout(() => setCopiedModelId(null), 2500);
  };

  // Canvas Viewport Pan & Zoom States (Hand Movement)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Moveable / Draggable Image on Canvas State
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isImageSelected, setIsImageSelected] = useState(true);
  const imageDragStart = useRef({ x: 0, y: 0 });
  const imageFrameRef = useRef(null);

  // Chat Input and Animation Refs
  const chatInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [flyingGhost, setFlyingGhost] = useState(null);
  const [isInputPulsing, setIsInputPulsing] = useState(false);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  const userInitial = user?.firstName ? user.firstName[0].toUpperCase() : 'N';

  // Zoom handlers
  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.5));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.4));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImagePos({ x: 0, y: 0 });
  };
  const toggleLock = () => setIsLocked((prev) => !prev);

  // Canvas Mouse Pan (Hand Movement Drag)
  const handleCanvasMouseDown = (e) => {
    if (isLocked) return;
    if (
      e.target.closest('.stitch-canvas-controls') ||
      e.target.closest('.stitch-image-floating-toolbar') ||
      e.target.closest('.stitch-canvas-image-frame') ||
      e.target.closest('.stitch-genre-card') ||
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

  // Image Dragging on Canvas (Moveable image)
  const handleImageMouseDown = (e) => {
    if (isLocked) return;
    if (
      e.target.closest('button') ||
      e.target.closest('.stitch-image-floating-toolbar') ||
      e.target.closest('.stitch-image-overlay-actions')
    ) {
      return;
    }
    e.stopPropagation();
    setIsDraggingImage(true);
    setIsImageSelected(true);
    imageDragStart.current = {
      x: e.clientX - imagePos.x * zoom,
      y: e.clientY - imagePos.y * zoom
    };
  };

  // Unified Mouse Move Handler (Canvas Pan & Image Drag)
  const handleMouseMove = (e) => {
    if (isDraggingImage && !isLocked) {
      setImagePos({
        x: (e.clientX - imageDragStart.current.x) / zoom,
        y: (e.clientY - imageDragStart.current.y) / zoom
      });
      return;
    }

    if (isPanning && !isLocked) {
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y
      });
    }
  };

  // Unified Mouse Up Handler
  const handleMouseUp = () => {
    setIsDraggingImage(false);
    setIsPanning(false);
  };

  // Drag and drop image files onto canvas from desktop
  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCanvas(true);
  };

  const handleCanvasDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCanvas(false);
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCanvas(false);

    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith('image/')
    );
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImages((prev) => [
          ...prev,
          {
            id: `drop-img-${Date.now()}-${Math.random()}`,
            name: file.name,
            url: event.target.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    setIsInputPulsing(true);
    setTimeout(() => setIsInputPulsing(false), 1200);
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

  // Download generated image or current artwork
  const handleDownloadImage = async (e) => {
    if (e) e.stopPropagation();
    const targetUrl = generatedAd?.imageUrl || currentGenre.imageUrl;
    if (!targetUrl) return;

    const filename = `${projectName.replace(/\s+/g, '_')}_ad.jpg`;

    try {
      const response = await fetch(targetUrl, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        return;
      }
    } catch (err) {
      console.warn('Direct blob download fallback to direct anchor:', err);
    }

    // Direct fallback
    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Re-generate image variation (Generate Again)
  const handleGenerateAgain = async (e) => {
    if (e) e.stopPropagation();
    if (isGenerating) return;

    const targetPrompt =
      generatedAd?.prompt ||
      prompt.trim() ||
      `Creative ${projectCategory} ad with vivid lighting, bold contrast and high conversion branding`;

    setIsGenerating(true);
    setGenerationError(null);

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: `🔄 Generate variation: ${targetPrompt}`
      }
    ]);

    try {
      const result = await generateAdImage({
        prompt: targetPrompt,
        projectId,
        category: projectCategory
      });

      if (result && result.imageUrl) {
        setGeneratedAd({
          imageUrl: result.imageUrl,
          prompt: targetPrompt,
          category: projectCategory,
          createdAt: new Date()
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: `✨ Generated a fresh new variation for your "${projectCategory}" creative!`
          }
        ]);
      } else {
        throw new Error('No image URL returned from AI service');
      }
    } catch (err) {
      console.error('Error generating variation:', err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to generate variation. Please verify backend connection.';
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

  // Edit in Chat (Smooth Animated Glide from Canvas to Chat Input)
  const handleEditInChat = (e) => {
    if (e) e.stopPropagation();
    const activeImageUrl = generatedAd?.imageUrl || currentGenre.imageUrl;
    if (!activeImageUrl) return;

    if (imageFrameRef.current && chatInputRef.current) {
      const startRect = imageFrameRef.current.getBoundingClientRect();
      const endRect = chatInputRef.current.getBoundingClientRect();

      // Launch flying ghost clone
      setFlyingGhost({
        imageUrl: activeImageUrl,
        startX: startRect.left,
        startY: startRect.top,
        startWidth: startRect.width,
        startHeight: startRect.height,
        endX: endRect.left + 16,
        endY: endRect.top + 16,
        endWidth: 54,
        endHeight: 54,
        animating: false
      });

      // Animate smoothly to destination on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlyingGhost((prev) => (prev ? { ...prev, animating: true } : null));
        });
      });

      // Complete flight, attach image and focus textarea
      setTimeout(() => {
        setFlyingGhost(null);

        setAttachedImages((prev) => {
          const alreadyExists = prev.some((img) => img.url === activeImageUrl);
          if (alreadyExists) return prev;
          return [
            ...prev,
            {
              id: `edit-img-${Date.now()}`,
              name: `${projectName} (Canvas Ref)`,
              url: activeImageUrl
            }
          ];
        });

        setIsInputPulsing(true);
        setTimeout(() => setIsInputPulsing(false), 1400);

        if (!prompt) {
          setPrompt('Edit: ');
        }
        textareaRef.current?.focus();
      }, 520);
    } else {
      // Direct attachment fallback
      setAttachedImages((prev) => [
        ...prev,
        {
          id: `edit-img-${Date.now()}`,
          name: `${projectName} (Canvas Ref)`,
          url: activeImageUrl
        }
      ]);
      if (!prompt) {
        setPrompt('Edit: ');
      }
      textareaRef.current?.focus();
    }
  };

  return (
    <div
      className="stitch-app-layout"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Animated Flying Ghost Element for Edit Transition */}
      {flyingGhost && (
        <img
          src={flyingGhost.imageUrl}
          alt="Flying reference"
          className="stitch-flying-ghost-img"
          style={{
            left: flyingGhost.animating ? `${flyingGhost.endX}px` : `${flyingGhost.startX}px`,
            top: flyingGhost.animating ? `${flyingGhost.endY}px` : `${flyingGhost.startY}px`,
            width: flyingGhost.animating ? `${flyingGhost.endWidth}px` : `${flyingGhost.startWidth}px`,
            height: flyingGhost.animating ? `${flyingGhost.endHeight}px` : `${flyingGhost.startHeight}px`,
            opacity: flyingGhost.animating ? 0.9 : 1,
            transform: flyingGhost.animating ? 'scale(0.95)' : 'scale(1)'
          }}
        />
      )}
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
          <button
            type="button"
            className="stitch-other-ai-btn"
            onClick={() => setIsPromptsModalOpen(true)}
            title="Generate & Copy Prompts for Other AI Models (Midjourney, ChatGPT, FLUX, Ideogram...)"
          >
            <Sparkles size={15} color="#8ab4f8" />
            <span>Prompts for other AI</span>
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
          <div
            ref={chatInputRef}
            className={`stitch-left-bottom-prompt ${isInputPulsing ? 'input-pulsing' : ''}`}
          >
            <form className="stitch-input-form" onSubmit={handleSendPrompt}>
              <div className="stitch-prompt-input-container">
                {/* Image Previews if any are attached */}
                {attachedImages.length > 0 && (
                  <div className="stitch-image-previews-row">
                    {attachedImages.map((img) => (
                      <div key={img.id} className="stitch-img-preview-chip">
                        <img src={img.url} alt={img.name} className="stitch-img-thumb" />
                        <span className="stitch-img-chip-label">{img.name}</span>
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
                  ref={textareaRef}
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
          className={`stitch-center-canvas ${isPanning ? 'panning' : ''} ${isLocked ? 'locked' : ''} ${isDragOverCanvas ? 'drag-over' : ''}`}
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
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

                {/* 2. GENERATED PURE IMAGE (Moveable / Draggable with Floating Options Toolbar) */}
                {!isGenerating && generatedAd && (
                  <div
                    ref={imageFrameRef}
                    className={`stitch-canvas-image-frame ${isDraggingImage ? 'is-dragging' : ''} ${isImageSelected ? 'is-selected' : ''}`}
                    style={{
                      transform: `translate(${imagePos.x}px, ${imagePos.y}px)`
                    }}
                    onMouseDown={handleImageMouseDown}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImageSelected(true);
                    }}
                  >
                    {/* Floating Options Toolbar (Download, Generate again, Edit) */}
                    <div className="stitch-image-floating-toolbar" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="stitch-toolbar-btn download"
                        onClick={handleDownloadImage}
                        title="Download image"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </button>

                      <div className="stitch-toolbar-divider" />

                      <button
                        type="button"
                        className="stitch-toolbar-btn generate"
                        onClick={handleGenerateAgain}
                        disabled={isGenerating}
                        title="Generate again (variation)"
                      >
                        <RefreshCw size={14} className={isGenerating ? 'stitch-spin' : ''} />
                        <span>Generate again</span>
                      </button>

                      <div className="stitch-toolbar-divider" />

                      <button
                        type="button"
                        className="stitch-toolbar-btn edit"
                        onClick={handleEditInChat}
                        title="Edit image in chat"
                      >
                        <Sparkles size={14} color="#8ab4f8" />
                        <span>Edit</span>
                      </button>
                    </div>

                    {/* Move drag handle pill on hover */}
                    <div className="stitch-drag-handle-pill">
                      <span>⠿ Drag & Drop to Move</span>
                    </div>

                    <img
                      src={generatedAd.imageUrl}
                      alt={generatedAd.prompt}
                      className="stitch-canvas-pure-image"
                      draggable={false}
                    />
                  </div>
                )}

                {/* 3. FRESH / INITIAL SHOWCASE CARD (Moveable & Interactive) */}
                {!isGenerating && !generatedAd && (
                  <div
                    ref={imageFrameRef}
                    className={`stitch-genre-card ${isDraggingImage ? 'is-dragging' : ''} ${isImageSelected ? 'is-selected' : ''}`}
                    style={{
                      transform: `translate(${imagePos.x}px, ${imagePos.y}px)`
                    }}
                    onMouseDown={handleImageMouseDown}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImageSelected(true);
                    }}
                  >
                    {/* Floating Options Toolbar */}
                    <div className="stitch-image-floating-toolbar" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="stitch-toolbar-btn download"
                        onClick={handleDownloadImage}
                        title="Download image"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </button>

                      <div className="stitch-toolbar-divider" />

                      <button
                        type="button"
                        className="stitch-toolbar-btn generate"
                        onClick={handleGenerateAgain}
                        disabled={isGenerating}
                        title="Generate ad"
                      >
                        <RefreshCw size={14} className={isGenerating ? 'stitch-spin' : ''} />
                        <span>Generate again</span>
                      </button>

                      <div className="stitch-toolbar-divider" />

                      <button
                        type="button"
                        className="stitch-toolbar-btn edit"
                        onClick={handleEditInChat}
                        title="Edit in chat"
                      >
                        <Sparkles size={14} color="#8ab4f8" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="stitch-drag-handle-pill">
                      <span>⠿ Drag & Drop to Move</span>
                    </div>

                    <div className="stitch-genre-image-box">
                      <img
                        src={currentGenre.imageUrl}
                        alt={currentGenre.title}
                        className="stitch-genre-card-img"
                        draggable={false}
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

      {/* ====================================================================
          PROMPTS FOR OTHER AI MODAL DIALOG
          ==================================================================== */}
      {isPromptsModalOpen && (
        <div
          className="stitch-other-ai-modal-overlay"
          onClick={() => setIsPromptsModalOpen(false)}
        >
          <div
            className="stitch-other-ai-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="stitch-other-ai-header">
              <div className="stitch-other-ai-title-wrap">
                <div className="stitch-other-ai-icon-pill">
                  <Sparkles size={20} color="#8ab4f8" />
                </div>
                <div>
                  <h2 className="stitch-other-ai-heading">Prompts for Other AI</h2>
                  <p className="stitch-other-ai-subheading">
                    Export high-converting ad prompts engineered for Midjourney, ChatGPT, FLUX.1, Ideogram & Video AI.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="stitch-other-ai-close-btn"
                onClick={() => setIsPromptsModalOpen(false)}
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Model Filter Tabs */}
            <div className="stitch-other-ai-tabs-row">
              {[
                { id: 'all', label: 'All AI Models' },
                { id: 'midjourney', label: 'Midjourney v6.1' },
                { id: 'chatgpt', label: 'ChatGPT (DALL·E 3)' },
                { id: 'flux', label: 'FLUX.1' },
                { id: 'ideogram', label: 'Ideogram 2.0' },
                { id: 'runway', label: 'Runway (Video)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`stitch-other-ai-tab ${activeModelFilter === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveModelFilter(tab.id)}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Models Prompt List */}
            <div className="stitch-other-ai-body">
              {filteredAiModels.map((model) => {
                const isCopied = copiedModelId === model.id;
                return (
                  <div key={model.id} className="stitch-other-ai-card">
                    <div className="stitch-other-ai-card-header">
                      <div className="stitch-other-ai-model-meta">
                        <span
                          className="stitch-other-ai-badge"
                          style={{
                            borderColor: `${model.color}60`,
                            color: model.color,
                            backgroundColor: `${model.color}15`
                          }}
                        >
                          {model.badge}
                        </span>
                        <h3 className="stitch-other-ai-model-name">{model.name}</h3>
                        <span className="stitch-other-ai-category">{model.category}</span>
                      </div>

                      <div className="stitch-other-ai-actions">
                        <a
                          href={model.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="stitch-other-ai-link-btn"
                          title={`Open ${model.name}`}
                        >
                          <ExternalLink size={13} />
                          <span>Open {model.name.split(' ')[0]}</span>
                        </a>

                        <button
                          type="button"
                          className={`stitch-other-ai-copy-btn ${isCopied ? 'copied' : ''}`}
                          onClick={() => handleCopyAiPrompt(model.id, model.prompt)}
                          title="Copy prompt to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check size={14} color="#34d399" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy Prompt</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Prompt Box */}
                    <div className="stitch-other-ai-prompt-box">
                      <code>{model.prompt}</code>
                    </div>

                    {model.negativePrompt && (
                      <div className="stitch-other-ai-neg-box">
                        <span className="stitch-neg-label">Negative prompt:</span>
                        <code>{model.negativePrompt}</code>
                      </div>
                    )}

                    {/* Pro Tip */}
                    <div className="stitch-other-ai-tip">
                      <span className="stitch-tip-badge">Pro Tip</span>
                      <span>{model.tips}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;