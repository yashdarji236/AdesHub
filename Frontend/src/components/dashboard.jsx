import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { createProject, getUserProjects } from '../services/projectService';
import {
  LayoutDashboard,
  Search,
  Home,
  Clock,
  History,
  Sparkles,
  Video,
  Image as ImageIcon,
  Plus,
  Grid,
  ChevronDown,
  ChevronRight,
  Bell,
  ArrowUpCircle,
  ArrowRight,
  LogOut,
  Folder,
  RefreshCw,
  X,
  Heart,
  Download,
  PenTool,
  Layout,
  Presentation,
  Layers,
  Check,
  Star,
  MoreVertical
} from 'lucide-react';
import './dashboard.css';

// Authentic Figma Brand Logo Icons
const FigmaDesignIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
  </svg>
);

const FigJamLogoIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#9747FF" />
    <path d="M7 6H17V10H7V6Z" fill="white" />
    <path d="M7 12H13V18H7V12Z" fill="white" />
    <circle cx="15.5" cy="15.5" r="2.5" fill="white" />
  </svg>
);

// Recommended resources dataset with requested Pinterest images
const COMMUNITY_RESOURCES = [
  {
    id: 'comm-1',
    title: 'Creative Flyer Design Showcase',
    author: 'by PIXELSDSN',
    likes: '4.8k',
    downloads: '142k',
    imageUrl: 'https://i.pinimg.com/736x/45/0c/d4/450cd46dd68e6725717f1957cb954fde.jpg'
  },
  {
    id: 'comm-2',
    title: 'Countdown Event Banner & Design',
    author: 'by Haywhy Graphics',
    likes: '3.9k',
    downloads: '128k',
    imageUrl: 'https://i.pinimg.com/736x/e3/f6/f5/e3f6f5bf92599e05309f4623e3c903d0.jpg'
  },
  {
    id: 'comm-3',
    title: 'Modern Abstract Poster & Branding',
    author: 'by SAMAD ADEJARE',
    likes: '5.2k',
    downloads: '185k',
    imageUrl: 'https://i.pinimg.com/736x/bc/5a/12/bc5a12d155749236c579e8660aa22d86.jpg'
  },
  {
    id: 'comm-4',
    title: 'Early Bird Ticket & Concert Layout',
    author: 'by Anointed Adekunle',
    likes: '3.6k',
    downloads: '98k',
    imageUrl: 'https://i.pinimg.com/736x/4b/29/ac/4b29ac9896ddfe78439e68cda4c8954e.jpg'
  }
];

// 3 Ad Types for Create Ad Modal Popup with requested Pinterest images
const AD_TYPES = [
  {
    id: 'poster-ad',
    num: '1',
    title: 'Poster ad',
    desc: 'High-impact visual flyers, event promotions & creative marketing posters',
    imageUrl: 'https://i.pinimg.com/736x/7f/dc/4e/7fdc4e58b5f2fd4d1c3dbfab0a9c81a0.jpg'
  },
  {
    id: 'meme-ad',
    num: '2',
    title: 'Meme ad',
    desc: 'Relatable, viral, and engaging social memes designed for high shareability',
    imageUrl: 'https://i.pinimg.com/736x/f9/25/8f/f9258f19f468e126f4478cb91b2f0ed9.jpg'
  },
  {
    id: 'brand-ad',
    num: '3',
    title: 'Brand ad',
    desc: 'Polished commercial branding, product showcases & brand storytelling',
    imageUrl: 'https://i.pinimg.com/736x/9e/a8/ca/9ea8ca06758565269bd066fcaadbcd67.jpg'
  }
];

// Initial files list (empty by default so user starts with Create New Ad box)
const INITIAL_FILES = [];

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('recently-viewed');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommunitySection, setShowCommunitySection] = useState(true);
  const [files, setFiles] = useState(INITIAL_FILES);
  const [orgFilter, setOrgFilter] = useState('All organizations');
  const [fileTypeFilter, setFileTypeFilter] = useState('All files');
  const [viewMode, setViewMode] = useState('grid');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCreateAdModal, setShowCreateAdModal] = useState(false);
  const [showNameProjectModal, setShowNameProjectModal] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Fetch saved user projects from MongoDB on component load
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const data = await getUserProjects();
        if (data.success && Array.isArray(data.projects)) {
          const loadedCards = data.projects.map((p) => {
            const dateObj = new Date(p.createdAt);
            const formattedDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
              id: p._id,
              title: p.projectName,
              edited: `Created ${formattedDate} at ${formattedTime}`,
              type: 'design',
              thumb: 'wireframe',
              tab: 'recently-viewed',
              starred: false,
              format: p.projectCategory,
              createdAt: p.createdAt,
            };
          });
          setFiles(loadedCards);
        }
      } catch (error) {
        console.error('Error fetching user projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // Filter files
  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'recently-viewed' ||
      (activeTab === 'shared-files' && f.id === 'file-7') ||
      (activeTab === 'shared-projects' && f.starred);
    const matchesType =
      fileTypeFilter === 'All files' ||
      (fileTypeFilter === 'Design files' && f.type === 'design') ||
      (fileTypeFilter === 'FigJam boards' && f.type === 'figjam');
    return matchesSearch && matchesTab && matchesType;
  });

  const handleCreateFile = (type) => {
    const newFile = {
      id: `file-${Date.now()}`,
      title: type === 'figjam' ? 'New FigJam board' : type === 'slides' ? 'New Deck' : 'Untitled',
      edited: 'Edited just now',
      type: type === 'figjam' ? 'figjam' : 'design',
      thumb: type === 'figjam' ? 'figjam-basics' : 'wireframe',
      tab: 'recently-viewed',
      starred: false
    };
    setFiles([newFile, ...files]);
  };

  const handleOpenCreateAdModal = () => {
    setShowCreateAdModal(true);
  };

  const handleSelectAdType = (adType) => {
    setSelectedAdType(adType.id);
    setProjectName(`${adType.title} Campaign`);
    setShowCreateAdModal(false);
    setShowNameProjectModal(true);
  };

  const handleSaveAndGoToEditor = async () => {
    if (isSaving) return;
    const chosen = AD_TYPES.find((a) => a.id === selectedAdType);
    const finalTitle = projectName.trim() || `${chosen?.title || 'Ad'} #${files.length + 1}`;
    const categoryTitle = chosen?.title || 'Poster ad';

    setIsSaving(true);
    try {
      // 1. Store in Database via Backend API
      const res = await createProject({
        projectName: finalTitle,
        projectCategory: categoryTitle,
      });

      const created = res.project;
      const now = new Date(created?.createdAt || Date.now());
      const formattedDate = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 2. Generate and prepend new project card to Dashboard list
      const newAd = {
        id: created?._id || `ad-${Date.now()}`,
        title: created?.projectName || finalTitle,
        edited: `Created ${formattedDate} at ${formattedTime}`,
        type: 'design',
        thumb: 'wireframe',
        tab: 'recently-viewed',
        starred: false,
        format: created?.projectCategory || categoryTitle,
        createdAt: created?.createdAt || now,
      };

      setFiles((prev) => [newAd, ...prev]);
    } catch (err) {
      console.error('Failed to create project in backend:', err);
      // Fallback local addition if network fails
      const fallbackAd = {
        id: `ad-${Date.now()}`,
        title: finalTitle,
        edited: 'Created just now',
        type: 'design',
        thumb: 'wireframe',
        tab: 'recently-viewed',
        starred: false,
        format: categoryTitle,
      };
      setFiles((prev) => [fallbackAd, ...prev]);
    } finally {
      setIsSaving(false);
      // 3. Stay on dashboard & close modal
      setShowNameProjectModal(false);
      setProjectName('');
      setSelectedAdType(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleStarFile = (id, e) => {
    e?.stopPropagation();
    setFiles(files.map(f => f.id === id ? { ...f, starred: !f.starred } : f));
  };

  return (
    <div className="figma-app-layout">
      {/* ====================================================================
          LEFT SIDEBAR (#2C2C2C)
          ==================================================================== */}
      <aside className="figma-sidebar">
        <div className="figma-sidebar-scroll">
          {/* User Profile / Workspace Header */}
          <div className="figma-profile-row">
            <div className="figma-profile-badge" title="Switch workspace">
              <div className="figma-avatar-n">
                {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </div>
              <span className="figma-username">{user?.displayName || 'User'}</span>
              <ChevronDown size={13} color="#b3b3b3" />
            </div>
            <button className="figma-bell-icon-btn" title="Activity & Notifications">
              <Bell size={15} />
            </button>
          </div>

          {/* Search Box */}
          <div className="figma-search-container">
            <Search size={13} className="figma-search-icon" />
            <input
              type="text"
              placeholder="Search"
              className="figma-search-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Navigation Items (Dashboard, Home, History, Video Inspirations, Image Inspirations) */}
          <div className="figma-nav-group">
            <button
              className={`figma-nav-btn ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveNav('dashboard')}
            >
              <div className="figma-nav-btn-content">
                <LayoutDashboard size={15} className="figma-nav-icon-svg" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              className={`figma-nav-btn ${activeNav === 'home' ? 'active' : ''}`}
              onClick={() => setActiveNav('home')}
            >
              <div className="figma-nav-btn-content">
                <Home size={15} className="figma-nav-icon-svg" />
                <span>Home</span>
              </div>
            </button>

            <button
              className={`figma-nav-btn ${activeNav === 'history' ? 'active' : ''}`}
              onClick={() => setActiveNav('history')}
            >
              <div className="figma-nav-btn-content">
                <History size={15} className="figma-nav-icon-svg" />
                <span>History</span>
              </div>
            </button>

            <button
              className={`figma-nav-btn ${activeNav === 'video-inspirations' ? 'active' : ''}`}
              onClick={() => setActiveNav('video-inspirations')}
            >
              <div className="figma-nav-btn-content">
                <Video size={15} className="figma-nav-icon-svg" />
                <span>Video Inspirations</span>
              </div>
            </button>

            <button
              className={`figma-nav-btn ${activeNav === 'image-inspirations' ? 'active' : ''}`}
              onClick={() => setActiveNav('image-inspirations')}
            >
              <div className="figma-nav-btn-content">
                <ImageIcon size={15} className="figma-nav-icon-svg" />
                <span>Image Inspirations</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Logout Button */}
        <div className="figma-sidebar-footer">
          <button
            className="figma-btn-logout-full"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ====================================================================
          MAIN VIEWPORT
          ==================================================================== */}
      <main className="figma-main-content">
        {/* Top Header Actions Bar */}
        <header className="figma-header-bar">
          <h1 className="figma-header-title">
            {activeNav === 'dashboard'
              ? 'Dashboard'
              : activeNav === 'home'
              ? 'Home'
              : activeNav === 'history'
              ? 'History'
              : activeNav === 'video-inspirations'
              ? 'Video Inspirations'
              : activeNav === 'image-inspirations'
              ? 'Image Inspirations'
              : 'Inspirations'}
          </h1>

          <div className="figma-creation-pills">
            <button
              className="figma-pill-create-btn"
              onClick={() => handleCreateFile('design')}
              title="New Design File"
            >
              <span className="figma-pill-icon-wrap blue">
                <PenTool size={14} />
              </span>
              <span>Design</span>
            </button>

            <button
              className="figma-pill-create-btn"
              onClick={() => handleCreateFile('figjam')}
              title="New FigJam Board"
            >
              <span className="figma-pill-icon-wrap purple">
                <Layout size={14} />
              </span>
              <span>FigJam</span>
            </button>

            <button
              className="figma-pill-create-btn"
              onClick={() => handleCreateFile('slides')}
              title="New Slides Deck"
            >
              <span className="figma-pill-icon-wrap orange">
                <Presentation size={14} />
              </span>
              <span>Slides</span>
            </button>

            <button
              className="figma-pill-create-btn"
              onClick={() => handleCreateFile('design')}
              title="New AI Make File"
            >
              <span className="figma-pill-icon-wrap white">
                <Sparkles size={14} />
              </span>
              <span>Make</span>
            </button>

            <button className="figma-pill-create-btn" title="More creations">
              <span>More</span>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>

        {/* Recommended resources from Community */}
        {showCommunitySection && (
          <section className="figma-comm-section-wrap">
            <div className="figma-comm-section-top">
              <h2 className="figma-comm-section-heading">Recommended resources from Community</h2>
              <div className="figma-comm-top-actions">
                <button
                  className="figma-icon-action-btn"
                  title="Refresh resources"
                  onClick={() => setFiles([...files].reverse())}
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  className="figma-icon-action-btn"
                  title="Dismiss section"
                  onClick={() => setShowCommunitySection(false)}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="figma-comm-grid-row">
              {COMMUNITY_RESOURCES.map((item) => (
                <div key={item.id} className="figma-comm-box">
                  <div className="figma-comm-banner-art">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="figma-comm-img"
                    />
                  </div>
                  <div className="figma-comm-meta-box">
                    <div className="figma-comm-title-text">{item.title}</div>
                    <div className="figma-comm-stats-row">
                      <span>{item.author}</span>
                      <span className="figma-comm-stat-item">
                        <Heart size={12} /> {item.likes}
                      </span>
                      <span className="figma-comm-stat-item">
                        <Download size={12} /> {item.downloads}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Side Card 5: Our Blooms Pink Box */}
              <div className="figma-comm-box" style={{ alignItems: 'center', textAlign: 'center' }}>
                <div className="figma-comm-banner-art figma-art-blooms" style={{ width: '100%' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#111', background: '#fff', padding: '4px 8px', borderRadius: '4px' }}>
                    Our Blooms®
                  </span>
                </div>
                <a href="#community" className="figma-see-more-link-btn">
                  See more resources
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Tabs & Filters Toolbar */}
        <div className="figma-filter-section">
          <div className="figma-main-tabs">
            <button
              className={`figma-tab-pill ${activeTab === 'recently-viewed' ? 'active' : ''}`}
              onClick={() => setActiveTab('recently-viewed')}
            >
              Recently viewed
            </button>
            <button
              className={`figma-tab-pill ${activeTab === 'shared-files' ? 'active' : ''}`}
              onClick={() => setActiveTab('shared-files')}
            >
              Shared files
            </button>
            <button
              className={`figma-tab-pill ${activeTab === 'shared-projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('shared-projects')}
            >
              Shared projects
            </button>
          </div>

          <div className="figma-filter-dropdowns">
            <button className="figma-dropdown-selector">
              <span>{orgFilter}</span>
              <ChevronDown size={11} />
            </button>

            <button className="figma-dropdown-selector">
              <span>{fileTypeFilter}</span>
              <ChevronDown size={11} />
            </button>

            <div className="figma-view-controls">
              <button
                className={`figma-view-icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Grid size={14} />
              </button>
              <button
                className={`figma-view-icon-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <Layers size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Files View (Grid or List) with Create New Ad Box */}
        {viewMode === 'grid' ? (
          <div className="figma-files-gallery-grid">
            {/* Create Box with + icon */}
            <div
              className="figma-create-ad-card"
              onClick={handleOpenCreateAdModal}
              title="Create new ad"
            >
              <div className="figma-create-ad-canvas">
                <div className="figma-create-ad-plus-icon">
                  <Plus size={36} strokeWidth={2.2} />
                </div>
              </div>
              <div className="figma-create-ad-footer">
                <span className="figma-create-ad-title">create new ad</span>
              </div>
            </div>

            {/* Dynamically created ad cards or Skeleton loaders */}
            {isLoadingProjects ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={`skel-card-${idx}`} className="figma-skeleton-box">
                  <div className="figma-skeleton-canvas">
                    <div className="figma-skeleton-inner-wire" />
                  </div>
                  <div className="figma-skeleton-bottom">
                    <div className="figma-skeleton-icon" />
                    <div className="figma-skeleton-lines">
                      <div className="figma-skeleton-line-title" />
                      <div className="figma-skeleton-line-subtitle" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="figma-file-box"
                  onClick={() => navigate(`/editor/${file.id}`, { state: { projectName: file.title, projectCategory: file.format } })}
                  title={`Open ${file.title} in Editor`}
                >
                  <div className="figma-file-canvas-preview">
                    <div className="figma-canvas-wireframe">
                      <div className="figma-wireframe-sheet">
                        <div className="figma-wire-head"></div>
                        <div className="figma-wire-rect"></div>
                        <div className="figma-wire-head" style={{ width: '40%', background: '#cbd5e1' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="figma-file-card-bottom">
                    <div className="figma-file-type-badge design">
                      <FigmaDesignIcon size={14} />
                    </div>
                    <div className="figma-file-title-block">
                      <span className="figma-file-name-line">{file.title}</span>
                      <span className="figma-file-edited-line">{file.edited}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="figma-files-list-view">
            <div
              className="figma-list-item-row create-new"
              onClick={handleOpenCreateAdModal}
              style={{ cursor: 'pointer', border: '1px dashed #4a4a4a', borderRadius: '8px' }}
            >
              <div className="figma-list-item-name" style={{ color: '#ffffff', fontWeight: 600 }}>
                <Plus size={16} />
                <span>create new ad</span>
              </div>
              <span style={{ color: '#888' }}>New Ad Project</span>
              <span style={{ color: '#888' }}>Click to choose type</span>
              <span></span>
            </div>

            {isLoadingProjects ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={`skel-list-${idx}`} className="figma-skeleton-list-item" />
              ))
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="figma-list-item-row"
                  onClick={() => navigate(`/editor/${file.id}`, { state: { projectName: file.title, projectCategory: file.format } })}
                  style={{ cursor: 'pointer' }}
                  title={`Open ${file.title} in Editor`}
                >
                  <div className="figma-list-item-name">
                    <FigmaDesignIcon size={16} />
                    <span>{file.title}</span>
                  </div>
                  <span style={{ color: '#aaa' }}>Ad Project</span>
                  <span style={{ color: '#888' }}>{file.edited}</span>
                  <button
                    style={{ background: 'transparent', border: 'none', color: file.starred ? '#facc15' : '#666', cursor: 'pointer' }}
                    onClick={(e) => toggleStarFile(file.id, e)}
                  >
                    <Star size={16} fill={file.starred ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Step 1: Which Type of Ad Modal Popup */}
      {showCreateAdModal && (
        <div
          className="figma-modal-backdrop"
          onClick={() => {
            setShowCreateAdModal(false);
            setSelectedAdType(null);
          }}
        >
          <div
            className="figma-create-ad-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="figma-modal-header">
              <div>
                <h2 className="figma-modal-title">Which type of ad you want to create?</h2>
                <p className="figma-modal-subtitle">
                  Select an ad format below to get started with tailored creative templates and high-converting layouts.
                </p>
              </div>
              <button
                className="figma-modal-close-btn"
                onClick={() => {
                  setShowCreateAdModal(false);
                  setSelectedAdType(null);
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* 3 Ad Types Grid */}
            <div className="figma-ad-types-grid">
              {AD_TYPES.map((adType) => (
                <div
                  key={adType.id}
                  className={`figma-ad-type-card ${selectedAdType === adType.id ? 'selected' : ''}`}
                  onClick={() => handleSelectAdType(adType)}
                  title={`Select ${adType.title}`}
                >
                  <div className="figma-ad-type-thumb-wrap">
                    <img
                      src={adType.imageUrl}
                      alt={adType.title}
                      className="figma-ad-type-img"
                    />
                    <span className="figma-ad-type-badge">{adType.num}</span>
                  </div>
                  <div className="figma-ad-type-info">
                    <h3 className="figma-ad-type-name">{adType.num}. {adType.title}</h3>
                    <p className="figma-ad-type-desc">{adType.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions Footer */}
            <div className="figma-modal-actions">
              <button
                className="figma-btn-modal-cancel"
                onClick={() => {
                  setShowCreateAdModal(false);
                  setSelectedAdType(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Name Your Project Modal Popup */}
      {showNameProjectModal && (
        <div
          className="figma-modal-backdrop"
          onClick={() => setShowNameProjectModal(false)}
        >
          <div
            className="figma-name-project-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="figma-modal-header">
              <div>
                <h2 className="figma-modal-title">Name your project</h2>
                <p className="figma-modal-subtitle">
                  Give your new ad campaign a clear title to easily organize your creative assets and workspace.
                </p>
              </div>
              <button
                className="figma-modal-close-btn"
                onClick={() => setShowNameProjectModal(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Format Preview Pill */}
            {selectedAdType && (
              <div className="figma-name-selected-format-pill">
                <span className="figma-format-pill-label">Selected Ad Format:</span>
                <span className="figma-format-pill-badge">
                  {AD_TYPES.find((a) => a.id === selectedAdType)?.num}. {AD_TYPES.find((a) => a.id === selectedAdType)?.title}
                </span>
              </div>
            )}

            {/* Project Name Form Input */}
            <div className="figma-name-input-block">
              <label className="figma-name-input-label" htmlFor="project-name-input">
                Project Name
              </label>
              <input
                id="project-name-input"
                type="text"
                className="figma-name-input-field"
                placeholder="e.g., Summer Brand Campaign 2026"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && projectName.trim()) {
                    handleSaveAndGoToEditor();
                  }
                }}
              />
            </div>

            {/* Modal Actions Footer */}
            <div className="figma-modal-actions">
              <button
                className="figma-btn-modal-cancel"
                onClick={() => {
                  setShowNameProjectModal(false);
                  setShowCreateAdModal(true);
                }}
              >
                Cancel
              </button>
              <button
                className="figma-btn-modal-save-editor"
                disabled={!projectName.trim() || isSaving}
                onClick={handleSaveAndGoToEditor}
              >
                <span>{isSaving ? 'Saving...' : 'Save & go to editor'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            style={{
              backgroundColor: '#2c2c2c',
              border: '1px solid #444444',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '440px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Upgrade to Professional</h3>
              <button
                style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }}
                onClick={() => setShowUpgradeModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#b3b3b3', lineHeight: 1.5, marginBottom: '20px' }}>
              Unlock unlimited files, shared team libraries, advanced prototyping, and dev mode seats for your team.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '12.5px', color: '#e5e5e5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#0d99ff" /> Unlimited Figma & FigJam files
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#0d99ff" /> Team libraries & design system publishing
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#0d99ff" /> Dev Mode inspection & code export
              </div>
            </div>
            <button
              className="figma-btn-upgrade-full"
              onClick={() => setShowUpgradeModal(false)}
            >
              Start 14-Day Free Trial
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;