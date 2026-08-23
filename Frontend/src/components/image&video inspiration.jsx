import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  X,
  ExternalLink,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Eye,
  Layers,
  Film,
  Compass,
} from 'lucide-react';
import { getInspirations } from '../services/inspirationService';
import './image&video inspiration.css';

// Popular inspiration suggestion chips
const POPULAR_TAGS = [
  'Creative Ads',
  'Gym & Fitness',
  'Fashion & Luxury',
  'Food & Beverage',
  'Automotive',
  'Tech & 3D',
  'Minimalist Poster',
  'Cyberpunk Neon',
  'Coffee Brand',
  'Streetwear',
];

// Staggered heights for skeleton cards
const SKELETON_HEIGHTS = [
  240, 360, 280, 420, 200, 320, 260, 390, 220, 340, 300, 440, 210, 350, 270,
];

export const ImageVideoInspiration = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active media mode ('image' | 'video')
  const activeType = searchParams.get('type') === 'video' ? 'video' : 'image';
  const initialQuery = searchParams.get('query') || '';

  // State
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Active hovered video id for hover preview
  const [hoveredVideoId, setHoveredVideoId] = useState(null);

  // Lightbox Modal state
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // Sentinel ref for infinite scrolling
  const sentinelRef = useRef(null);

  // Show quick toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Download high-resolution media directly to device
  const handleDownloadMedia = async (mediaItem, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!mediaItem) return;

    const isVid = mediaItem.type === 'video';
    const mediaUrl = isVid
      ? mediaItem.video
      : (mediaItem.fullImage || mediaItem.image);

    if (!mediaUrl) {
      showToast('Media download URL is not available');
      return;
    }

    const cleanTitle = (mediaItem.alt || mediaItem.photographer || mediaItem.creator || 'adshub-media')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const extension = isVid ? 'mp4' : 'jpg';
    const filename = `${cleanTitle || 'adshub-media'}_${Date.now()}.${extension}`;

    setDownloadingId(mediaItem.id);
    showToast(`Downloading ${isVid ? 'video' : 'image'}...`);

    try {
      // Step 1: Attempt direct client-side fetch & blob download
      const response = await fetch(mediaUrl, { mode: 'cors' });
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
        showToast('Download completed!');
        setDownloadingId(null);
        return;
      }
    } catch (directErr) {
      console.warn('Direct blob download failed, falling back to proxy...', directErr);
    }

    // Step 2: Fallback to server proxy download endpoint to enforce attachment headers
    try {
      const proxyUrl = `http://localhost:3000/api/inspiration/download?url=${encodeURIComponent(
        mediaUrl
      )}&filename=${encodeURIComponent(filename)}`;

      const a = document.createElement('a');
      a.href = proxyUrl;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Download initiated!');
    } catch (proxyErr) {
      console.error('Proxy download failed, opening direct URL:', proxyErr);
      window.open(mediaUrl, '_blank');
      showToast('Media opened in new tab');
    } finally {
      setDownloadingId(null);
    }
  };

  // Sync state when URL params change
  useEffect(() => {
    const urlQuery = searchParams.get('query') || '';
    setQueryInput(urlQuery);
    setSearchQuery(urlQuery);
  }, [searchParams]);

  // Fetch inspirations
  const fetchMedia = useCallback(
    async (targetType, targetQuery, targetPage, isAppend = false) => {
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await getInspirations({
          type: targetType,
          query: targetQuery,
          page: targetPage,
          perPage: 28,
        });

        if (data && data.success) {
          const newResults = data.results || [];
          if (isAppend) {
            setItems((prev) => {
              // Deduplicate by ID
              const existingIds = new Set(prev.map((i) => i.id));
              const filtered = newResults.filter((i) => !existingIds.has(i.id));
              return [...prev, ...filtered];
            });
          } else {
            setItems(newResults);
          }
          setHasMore(newResults.length > 0 && targetPage < (data.totalPages || 50));
        } else {
          setError(data?.message || 'Failed to load inspirations');
        }
      } catch (err) {
        console.error('Error fetching inspirations:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Something went wrong while connecting to the inspiration feed.'
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Trigger search on type, query, or initial mount
  useEffect(() => {
    setPage(1);
    fetchMedia(activeType, searchQuery, 1, false);
  }, [activeType, searchQuery, fetchMedia]);

  // Load next page
  const handleLoadMore = () => {
    if (!isLoading && !isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMedia(activeType, searchQuery, nextPage, true);
    }
  };

  // Infinite scroll observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { rootMargin: '400px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [hasMore, isLoading, isLoadingMore, page, activeType, searchQuery]);

  // Switch between Images and Videos
  const handleTypeChange = (newType) => {
    if (newType === activeType) return;
    const params = new URLSearchParams(searchParams);
    params.set('type', newType);
    if (searchQuery) params.set('query', searchQuery);
    setSearchParams(params);
  };

  // Submit search query
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const clean = queryInput.trim();
    const params = new URLSearchParams(searchParams);
    params.set('type', activeType);
    if (clean) {
      params.set('query', clean);
    } else {
      params.delete('query');
    }
    setSearchParams(params);
    setSearchQuery(clean);
  };

  // Handle clicking a suggestion chip
  const handleChipClick = (tag) => {
    setQueryInput(tag);
    const params = new URLSearchParams(searchParams);
    params.set('type', activeType);
    params.set('query', tag);
    setSearchParams(params);
    setSearchQuery(tag);
  };

  // Clear search input
  const handleClearSearch = () => {
    setQueryInput('');
    const params = new URLSearchParams(searchParams);
    params.set('type', activeType);
    params.delete('query');
    setSearchParams(params);
    setSearchQuery('');
  };

  // Copy link or URL
  const handleCopy = (e, text, label = 'URL') => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  // Navigate to editor with this prompt / reference URL in the input box
  const handleUseInEditor = (item) => {
    if (!item) return;
    const mediaUrl = item.type === 'video' ? item.video : (item.fullImage || item.image || item.thumbnail);
    const promptText =
      item.type === 'image'
        ? `Inspiration style inspired by "${item.alt || 'Commercial Poster'}": high-converting layout with cinematic lighting and modern branding. URL: ${mediaUrl}`
        : `Dynamic motion ad inspired by "${item.creator || 'Creator'}": viral product presentation hook with energetic pacing. URL: ${mediaUrl}`;

    navigate('/editor', {
      state: {
        referencePrompt: promptText,
        mediaUrl: mediaUrl,
        url: mediaUrl,
        referenceMedia: item,
        projectCategory: 'Poster Ad',
        projectName: item.alt ? item.alt.slice(0, 28) : 'Inspiration Ad'
      }
    });
  };

  return (
    <div className="pin-app-layout">
      {/* ====================================================================
          STICKY TOPBAR: Brand, Back Button, Search Bar, Mode Tabs
          ==================================================================== */}
      <header className="pin-header">
        <div className="pin-header-top">
          {/* Left Brand & Back */}
          <div className="pin-brand-group">
            <Link to="/dashboard" className="pin-back-btn" title="Back to Dashboard">
              <ArrowLeft size={16} />
              <span>Dashboard</span>
            </Link>

            <Link to="/inspiration" className="pin-brand-logo">
              <Compass size={22} color="#0d99ff" />
              <span>AdsHub</span>
              <span className="pin-brand-badge">Inspiration</span>
            </Link>
          </div>

          {/* Center: Pinterest Search Bar */}
          <div className="pin-search-container">
            <form className="pin-search-form" onSubmit={handleSearchSubmit}>
              <Search size={18} className="pin-search-icon" />
              <input
                type="text"
                className="pin-search-input"
                placeholder={`Search ${activeType === 'image' ? 'creative images' : 'trending videos'} (e.g. gym, coffee, luxury cars, minimal)...`}
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
              />
              {queryInput && (
                <button
                  type="button"
                  className="pin-search-clear"
                  onClick={handleClearSearch}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </form>
          </div>

          {/* Right: Images vs Videos Mode Switcher */}
          <div className="pin-type-switch">
            <button
              type="button"
              className={`pin-type-btn ${activeType === 'image' ? 'active' : ''}`}
              onClick={() => handleTypeChange('image')}
            >
              <ImageIcon size={16} />
              <span>Images</span>
            </button>

            <button
              type="button"
              className={`pin-type-btn ${activeType === 'video' ? 'active video-active' : ''}`}
              onClick={() => handleTypeChange('video')}
            >
              <VideoIcon size={16} />
              <span>Videos</span>
            </button>
          </div>
        </div>

        {/* Category Suggestion Chips Row */}
        <div className="pin-chips-row">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`pin-chip ${searchQuery.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleChipClick(tag)}
            >
              <Sparkles size={12} />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ====================================================================
          MAIN FEED: Masonry Grid, Skeletons, Video Cards, Image Cards
          ==================================================================== */}
      <main className="pin-main-viewport">
        {/* Feed Header */}
        <div className="pin-feed-header">
          <h2 className="pin-feed-title">
            {searchQuery
              ? `Showing ${activeType === 'image' ? 'Image' : 'Video'} results for "${searchQuery}"`
              : `Explore trending ${activeType === 'image' ? 'photo' : 'video'} inspirations`}
          </h2>
          {!isLoading && items.length > 0 && (
            <span className="pin-feed-count">{items.length} inspirations loaded</span>
          )}
        </div>

        {/* 1. SKELETON LOADING STATE */}
        {isLoading && (
          <div className="pin-masonry-grid">
            {SKELETON_HEIGHTS.map((height, idx) => (
              <div
                key={idx}
                className="pin-skeleton-card"
                style={{ height: `${height}px` }}
              >
                <div className="pin-skeleton-shimmer" />
              </div>
            ))}
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!isLoading && error && (
          <div className="pin-state-container">
            <div className="pin-state-icon-wrap">
              <RefreshCw size={32} />
            </div>
            <h3 className="pin-state-title">Something went wrong</h3>
            <p className="pin-state-subtitle">{error}</p>
            <button
              type="button"
              className="pin-retry-btn"
              onClick={() => fetchMedia(activeType, searchQuery, 1, false)}
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!isLoading && !error && items.length === 0 && (
          <div className="pin-state-container">
            <div className="pin-state-icon-wrap">
              <Search size={32} />
            </div>
            <h3 className="pin-state-title">No inspirations found</h3>
            <p className="pin-state-subtitle">
              We couldn't find any {activeType === 'image' ? 'images' : 'videos'} matching "
              {searchQuery}". Try exploring another keyword:
            </p>
            <div className="pin-state-chips">
              {['Gym', 'Fashion', 'Food', 'Cars', 'Business', 'Tech', 'Marketing'].map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="pin-chip"
                    onClick={() => handleChipClick(tag)}
                  >
                    <span>{tag}</span>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* 4. TRUE PINTEREST MASONRY GRID */}
        {!isLoading && items.length > 0 && (
          <div className="pin-masonry-grid">
            {items.map((item) => (
              <PinCard
                key={`${item.type}-${item.id}`}
                item={item}
                isHovered={hoveredVideoId === item.id}
                onMouseEnter={() => setHoveredVideoId(item.id)}
                onMouseLeave={() => setHoveredVideoId(null)}
                onClick={() => setSelectedMedia(item)}
                onCopy={handleCopy}
                onUseInEditor={handleUseInEditor}
                onDownload={handleDownloadMedia}
              />
            ))}
          </div>
        )}

        {/* Infinite Scroll Sentinel & Load More button */}
        {!isLoading && items.length > 0 && (
          <div ref={sentinelRef} className="pin-load-more-wrap">
            {isLoadingMore && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="pin-spinner" />
                <span style={{ fontSize: '13px', color: 'var(--pin-text-secondary)' }}>
                  Loading more inspirations...
                </span>
              </div>
            )}
            {!isLoadingMore && hasMore && (
              <button
                type="button"
                className="pin-load-more-btn"
                onClick={handleLoadMore}
              >
                <span>Load More Inspirations</span>
              </button>
            )}
            {!hasMore && (
              <span style={{ fontSize: '13px', color: 'var(--pin-text-muted)', marginTop: '20px' }}>
                ✨ You've reached the end of the collection
              </span>
            )}
          </div>
        )}
      </main>

      {/* ====================================================================
          LIGHTBOX MEDIA MODAL (High-Res Preview & Quick Actions)
          ==================================================================== */}
      {selectedMedia && (
        <div className="pin-modal-overlay" onClick={() => setSelectedMedia(null)}>
          <div
            className="pin-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="pin-modal-close-btn"
              onClick={() => setSelectedMedia(null)}
              title="Close modal"
            >
              <X size={18} />
            </button>

            {/* Media side */}
            <div className="pin-modal-media-side">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.fullImage || selectedMedia.image}
                  alt={selectedMedia.alt}
                  className="pin-modal-img"
                />
              ) : (
                <video
                  src={selectedMedia.video}
                  poster={selectedMedia.thumbnail}
                  controls
                  autoPlay
                  className="pin-modal-video"
                />
              )}
            </div>

            {/* Info side */}
            <div className="pin-modal-info-side">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Creator Profile */}
                <div className="pin-modal-creator-header">
                  {selectedMedia.avatar ? (
                    <img
                      src={selectedMedia.avatar}
                      alt={selectedMedia.photographer || selectedMedia.creator}
                      className="pin-modal-avatar"
                    />
                  ) : (
                    <div
                      className="pin-modal-avatar"
                      style={{
                        background: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '700',
                      }}
                    >
                      {(selectedMedia.photographer || selectedMedia.creator || 'C')[0]}
                    </div>
                  )}
                  <div className="pin-modal-creator-meta">
                    <h3>{selectedMedia.photographer || selectedMedia.creator}</h3>
                    <p>
                      {selectedMedia.type === 'image'
                        ? 'High-Resolution Image'
                        : 'HD Video'}
                    </p>
                  </div>
                </div>

                {/* Caption / Title */}
                {selectedMedia.alt && (
                  <h2 className="pin-modal-title">{selectedMedia.alt}</h2>
                )}

                {/* Dimensions & Meta */}
                <div style={{ fontSize: '12px', color: 'var(--pin-text-muted)', display: 'flex', gap: '14px' }}>
                  <span>
                    Resolution: {selectedMedia.width} × {selectedMedia.height}
                  </span>
                  {selectedMedia.duration > 0 && (
                    <span>Duration: {selectedMedia.duration}s</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pin-modal-actions-row">
                <button
                  type="button"
                  className="pin-modal-primary-btn"
                  onClick={() => {
                    handleUseInEditor(selectedMedia);
                    setSelectedMedia(null);
                  }}
                >
                  <Sparkles size={16} />
                  <span>Use in AdsHub Editor</span>
                </button>

                <button
                  type="button"
                  className="pin-modal-download-btn"
                  onClick={(e) => handleDownloadMedia(selectedMedia, e)}
                  disabled={downloadingId === selectedMedia.id}
                >
                  {downloadingId === selectedMedia.id ? (
                    <>
                      <div className="pin-btn-spinner" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Download {selectedMedia.type === 'image' ? 'Image' : 'Video'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="pin-modal-secondary-btn"
                  onClick={(e) =>
                    handleCopy(
                      e,
                      selectedMedia.type === 'image' ? selectedMedia.image : selectedMedia.video,
                      'Media Link'
                    )
                  }
                >
                  <Copy size={16} />
                  <span>Copy Direct URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="pin-toast">
          <Check size={16} color="#0d99ff" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// INDIVIDUAL PIN CARD (Masonry Item with Natural Aspect Ratio & Hover Preview)
// ============================================================================
const PinCard = ({
  item,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onCopy,
  onUseInEditor,
  onDownload,
}) => {
  const videoRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Play video muted on hover, pause & reset on mouse leave
  useEffect(() => {
    if (item.type !== 'video' || !videoRef.current) return;
    if (isHovered) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay prevented or aborted
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isHovered, item.type]);

  const isVideo = item.type === 'video';

  return (
    <div className="pin-card-wrapper">
      <div
        className={`pin-card ${isVideo && isHovered ? 'is-video-hovered' : ''}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        {/* Media Frame */}
        <div
          className="pin-media-container"
          style={{
            backgroundColor: item.color || '#202026',
            minHeight: '180px',
          }}
        >
          {/* Image poster / Main image */}
          <img
            src={item.thumbnail || item.image}
            alt={item.alt || 'Inspiration'}
            className="pin-media-img"
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 1 : 0.8 }}
          />

          {/* Video element for hover playback */}
          {isVideo && item.video && (
            <video
              ref={videoRef}
              src={item.video}
              muted
              loop
              playsInline
              preload="none"
              className="pin-media-video"
            />
          )}

          {/* Video Badges */}
          {isVideo && (
            <>
              <div className="pin-video-badge">
                <Play size={11} fill="#fff" />
                <span>VIDEO</span>
                {isHovered && <span className="pin-video-play-pulse" />}
              </div>
              {item.duration > 0 && (
                <div className="pin-video-duration">
                  {Math.floor(item.duration / 60)}:
                  {String(item.duration % 60).padStart(2, '0')}
                </div>
              )}
            </>
          )}

          {/* Hover Overlay with Action Buttons */}
          <div className="pin-overlay">
            {/* Top row actions */}
            <div className="pin-overlay-top">
              <button
                type="button"
                className="pin-action-btn-circle"
                title="Use in Editor"
                onClick={(e) => {
                  e.stopPropagation();
                  onUseInEditor(item);
                }}
              >
                <Sparkles size={16} />
              </button>

              <button
                type="button"
                className="pin-action-btn-circle"
                title="Download"
                onClick={(e) => onDownload(item, e)}
              >
                <Download size={16} />
              </button>

              <button
                type="button"
                className="pin-action-btn-circle"
                title="Copy Direct Link"
                onClick={(e) =>
                  onCopy(
                    e,
                    isVideo ? item.video : item.image,
                    isVideo ? 'Video URL' : 'Image URL'
                  )
                }
              >
                <Copy size={16} />
              </button>
            </div>

            {/* Bottom creator attribution */}
            <div className="pin-overlay-bottom">
              <div className="pin-creator-info">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.photographer || item.creator}
                    className="pin-creator-avatar"
                  />
                ) : (
                  <div
                    className="pin-creator-avatar"
                    style={{
                      background: '#444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                    }}
                  >
                    {(item.photographer || item.creator || 'C')[0]}
                  </div>
                )}
                <span className="pin-creator-name">
                  {item.photographer || item.creator}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Under-Card Caption */}
        {item.alt && (
          <div className="pin-meta-caption">
            <p className="pin-meta-title">{item.alt}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageVideoInspiration;
