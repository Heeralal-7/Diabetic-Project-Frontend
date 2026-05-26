import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context.jsx';
import { FaYoutube } from 'react-icons/fa';
import { BsPlayFill } from 'react-icons/bs';

function VideoUpload() {
  const { 
    // Video upload functions
    createVideo, 
    updateVideo, 
    getVideos, 
    loadingVideo, 
    errorVideo, 
    videos,
    
    // YouTube functions
    addYoutubeLink,
    getYoutubeLinks,
    updateYoutubeLink,
    deleteYoutubeLink,
    youtubeLoading,
    youtubeError,
    youtubeLinks
    
  } = useContext(MyContext);

  const [selectedVideos, setSelectedVideos] = useState({});
  const [updateLoading, setUpdateLoading] = useState({});
  const [toasts, setToasts] = useState([]);
  
  // YouTube form states
  const [showYoutubeForm, setShowYoutubeForm] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);

  const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Custom Toast function
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  // Custom Toast Container
  const CustomToastContainer = () => {
    const getToastClass = (type) => {
      const baseClass = 'alert alert-dismissible fade show shadow-sm';
      switch (type) {
        case 'success': return `${baseClass} alert-success`;
        case 'error': return `${baseClass} alert-danger`;
        case 'warning': return `${baseClass} alert-warning`;
        default: return `${baseClass} alert-info`;
      }
    };

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '400px'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} className={getToastClass(toast.type)} role="alert">
            {toast.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              aria-label="Close"
            />
          </div>
        ))}
      </div>
    );
  };

  // Fetch videos and YouTube links on component mount
  useEffect(() => {
    console.log('🎬 Component mounted, fetching videos...');
    getVideos();
    getYoutubeLinks();
  }, []);

  // Get full URL for video
  const getFullUrl = (path) => {
    if (!path) return '';
    // If path already has http, return as is
    if (path.startsWith('http')) return path;
    // Otherwise append to base URL
    return `${URL}${path}`;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
    }
    return '';
  };

  // Add/Update YouTube Link using Context
  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      showToast('Please enter YouTube URL', 'warning');
      return;
    }

    try {
      const youtubeData = {
        youtubeUrl: youtubeUrl.trim(),
        title: youtubeTitle.trim() || undefined
      };

      let response;
      
      if (isEditing) {
        response = await updateYoutubeLink(editingLinkId, youtubeData);
      } else {
        response = await addYoutubeLink(youtubeData);
      }

      if (response.success === 1) {
        showToast(
          isEditing 
            ? 'YouTube link updated successfully!' 
            : 'YouTube link added successfully!', 
          'success'
        );
        
        // Reset form
        setYoutubeUrl('');
        setYoutubeTitle('');
        setShowYoutubeForm(false);
        setIsEditing(false);
        setEditingLinkId(null);
        
      } else {
        throw new Error(response.message || 'Failed to save YouTube link');
      }
    } catch (error) {
      console.error('Error saving YouTube link:', error);
      showToast(error.message || 'Failed to save YouTube link', 'error');
    }
  };

  // Delete YouTube Link using Context
  const handleDeleteYoutubeLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this YouTube link?')) {
      return;
    }

    try {
      const response = await deleteYoutubeLink(linkId);

      if (response.success === 1) {
        showToast('YouTube link deleted successfully!', 'success');
      } else {
        throw new Error(response.message || 'Failed to delete YouTube link');
      }
    } catch (error) {
      console.error('Error deleting YouTube link:', error);
      showToast(error.message || 'Failed to delete YouTube link', 'error');
    }
  };

  // Edit YouTube Link
  const editYoutubeLink = (link) => {
    setYoutubeUrl(link.url);
    setYoutubeTitle(link.title);
    setIsEditing(true);
    setEditingLinkId(link._id);
    setShowYoutubeForm(true);
  };

  // Handle video file selection
  const handleVideoChange = (e, videoNumber) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        showToast('Video file is too large. Maximum size is 100MB.', 'error');
        e.target.value = '';
        return;
      }
      
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!validTypes.includes(file.type)) {
        showToast('Invalid file type. Please select MP4, WebM, or OGG.', 'error');
        e.target.value = '';
        return;
      }
      
      setSelectedVideos(prev => ({
        ...prev,
        [`video${videoNumber}`]: file
      }));
      
      console.log(`✅ Video ${videoNumber} selected:`, file.name);
    }
  };

  // Handle video upload/update using Context
  const handleVideoUpload = async (videoNumber) => {
    const videoFile = selectedVideos[`video${videoNumber}`];
    
    if (!videoFile) {
      showToast('Please select a video file', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append(`video${videoNumber}`, videoFile);

    console.log(`🚀 Uploading video ${videoNumber}...`);
    setUpdateLoading(prev => ({ ...prev, [videoNumber]: true }));

    try {
      let response;
      
      if (videos && videos._id) {
        // Update existing video
        console.log('📝 Updating existing video with ID:', videos._id);
        response = await updateVideo(videos._id, formData);
      } else {
        // Create new video
        console.log('➕ Creating new video');
        response = await createVideo(formData);
      }

      if (response && (response.success === 1 || response.success === true)) {
        showToast(`Video ${videoNumber} uploaded successfully! 🎉`, 'success');
        
        // Clear selected video
        setSelectedVideos(prev => {
          const newState = { ...prev };
          delete newState[`video${videoNumber}`];
          return newState;
        });
        
        // Clear file input
        const fileInput = document.getElementById(`video${videoNumber}`);
        if (fileInput) fileInput.value = '';
        
      } else {
        showToast(response?.message || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      showToast(error.message || 'Upload failed', 'error');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [videoNumber]: false }));
    }
  };

  // Reset form
  const resetForm = (videoNumber) => {
    setSelectedVideos(prev => {
      const newState = { ...prev };
      delete newState[`video${videoNumber}`];
      return newState;
    });
    
    const fileInput = document.getElementById(`video${videoNumber}`);
    if (fileInput) fileInput.value = '';
  };

  // Count uploaded videos
  const uploadedVideosCount = videos ? 
    [videos.video1, videos.video2, videos.video3, 
     videos.video4, videos.video5, videos.video6].filter(v => v).length : 0;
  
  const totalVideos = uploadedVideosCount + youtubeLinks.length;

  // YouTube Link Form Component
  const YoutubeLinkForm = () => {
    return (
      <div className="card mb-4">
        <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaYoutube className="me-2" />
            {isEditing ? 'Edit YouTube Link' : 'Add YouTube Link'}
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => {
              setShowYoutubeForm(false);
              setIsEditing(false);
              setEditingLinkId(null);
              setYoutubeUrl('');
              setYoutubeTitle('');
            }}
            aria-label="Close"
          />
        </div>
        <div className="card-body">
          <form onSubmit={handleYoutubeSubmit}>
            <div className="mb-3">
              <label htmlFor="youtubeUrl" className="form-label">
                YouTube URL *
              </label>
              <input
                type="url"
                id="youtubeUrl"
                className="form-control"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
              />
              <div className="form-text">
                Example: https://youtu.be/WUOMac13wjM or https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="youtubeTitle" className="form-label">
                Title (Optional)
              </label>
              <input
                type="text"
                id="youtubeTitle"
                className="form-control"
                placeholder="Enter video title"
                value={youtubeTitle}
                onChange={(e) => setYoutubeTitle(e.target.value)}
              />
            </div>
            
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-danger"
                disabled={!youtubeUrl.trim() || youtubeLoading}
              >
                {youtubeLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Processing...
                  </>
                ) : isEditing ? (
                  <>
                    <i className="fas fa-save me-1"></i>
                    Update Link
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-1"></i>
                    Add Link
                  </>
                )}
              </button>
              
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowYoutubeForm(false);
                  setIsEditing(false);
                  setEditingLinkId(null);
                  setYoutubeUrl('');
                  setYoutubeTitle('');
                }}
                disabled={youtubeLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // YouTube Links List Component
  const YoutubeLinksList = () => {
    if (youtubeLoading) {
      return (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-danger"></div>
          <p className="mt-2 small text-muted">Loading YouTube links...</p>
        </div>
      );
    }

    if (youtubeError) {
      return (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {youtubeError}
          <button 
            className="btn btn-sm btn-outline-danger ms-3" 
            onClick={() => getYoutubeLinks()}
          >
            <i className="fas fa-redo me-1"></i> Retry
          </button>
        </div>
      );
    }

    if (youtubeLinks.length === 0) {
      return (
        <div className="text-center py-3">
          <p className="text-muted small">No YouTube links added yet.</p>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setShowYoutubeForm(true)}
          >
            <FaYoutube className="me-1" />
            Add Your First YouTube Link
          </button>
        </div>
      );
    }

    return (
      <div className="row g-3">
        {youtubeLinks.map((link) => (
          <div key={link._id} className="col-md-6 col-lg-4">
            <div className="card h-100">
              <div className="card-body p-2">
                {/* Video Thumbnail */}
                <div className="mb-2">
                  <img
                    src={getYouTubeThumbnail(link.url)}
                    alt={link.title}
                    className="img-fluid rounded"
                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x120?text=No+Thumbnail';
                    }}
                  />
                </div>
                
                {/* Video Info */}
                <h6 className="card-title small" title={link.title}>
                  {link.title.length > 40 ? link.title.substring(0, 40) + '...' : link.title}
                </h6>
                
                <small className="text-muted d-block mb-2">
                  <FaYoutube className="me-1 text-danger" />
                  {link.videoId}
                </small>
                
                {/* Buttons */}
                <div className="d-flex justify-content-between">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-danger"
                  >
                    <FaYoutube className="me-1" />
                    Watch
                  </a>
                  
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => editYoutubeLink(link)}
                      title="Edit"
                      disabled={youtubeLoading}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteYoutubeLink(link._id)}
                      title="Delete"
                      disabled={youtubeLoading}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // VideoUploadForm Component
  const VideoUploadForm = ({ videoNumber }) => {
    const currentVideo = videos ? videos[`video${videoNumber}`] : null;
    const videoFile = selectedVideos[`video${videoNumber}`];
    const isUploading = updateLoading[videoNumber];

    return (
      <div className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Video {videoNumber}</h5>
          <span className={`badge ${currentVideo ? 'bg-success' : 'bg-warning'}`}>
            {currentVideo ? 'Uploaded' : 'Empty'}
          </span>
        </div>
        <div className="card-body">
          {/* Current Video Preview */}
          {currentVideo && (
            <div className="mb-3">
              <h6>Current Video:</h6>
              <div className="d-flex align-items-start gap-3 mb-2">
                <video
                  controls
                  className="rounded"
                  style={{ maxHeight: '150px', maxWidth: '200px' }}
                  src={getFullUrl(currentVideo)}
                  onError={(e) => {
                    console.error(`Error loading video ${videoNumber}:`, currentVideo);
                    e.target.style.display = 'none';
                  }}
                />
                <div>
                  <small className="text-muted d-block">File:</small>
                  <code className="d-block mb-1">{currentVideo.split('/').pop()}</code>
                  <button
                    className="btn btn-sm btn-outline-primary mt-1"
                    onClick={() => window.open(getFullUrl(currentVideo), '_blank')}
                  >
                    Open Video
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Form */}
          <div className="mb-3">
            <label htmlFor={`video${videoNumber}`} className="form-label">
              Upload New Video {videoNumber}
            </label>
            <input
              type="file"
              className="form-control"
              id={`video${videoNumber}`}
              accept="video/mp4,video/webm,video/ogg"
              onChange={(e) => handleVideoChange(e, videoNumber)}
              disabled={isUploading}
            />
            {videoFile && (
              <div className="mt-2">
                <small className="text-success">
                  <strong>Selected:</strong> {videoFile.name}
                  ({Math.round(videoFile.size / 1024 / 1024)}MB)
                </small>
              </div>
            )}
            <div className="form-text">
              Supported: MP4, WebM, OGG | Max: 100MB
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <button
              type="button"
              className="btn btn-success"
              onClick={() => handleVideoUpload(videoNumber)}
              disabled={isUploading || !videoFile}
            >
              {isUploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Uploading...
                </>
              ) : (
                `Upload Video ${videoNumber}`
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => resetForm(videoNumber)}
              disabled={isUploading}
            >
              Clear
            </button>

            {!currentVideo && !isUploading && (
              <span className="text-warning">
                <i className="fas fa-exclamation-triangle me-1"></i> No video uploaded
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      {/* Custom Toast Container */}
      <CustomToastContainer />

      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-primary">
              <i className="fas fa-video me-2"></i>
              Sub-Admin Video Management
            </h2>
            <div className="d-flex gap-2">
              <button
                className="btn btn-danger"
                onClick={() => setShowYoutubeForm(!showYoutubeForm)}
              >
                <FaYoutube className="me-2" />
                {showYoutubeForm ? 'Hide Form' : 'Add YouTube Link'}
              </button>
              
              <button
                className="btn btn-primary"
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  getVideos();
                  getYoutubeLinks();
                }}
                disabled={loadingVideo || youtubeLoading}
              >
                {loadingVideo || youtubeLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt me-2"></i>
                    Refresh All
                  </>
                )}
              </button>
            </div>
          </div>

          {/* YouTube Form Section */}
          {showYoutubeForm && <YoutubeLinkForm />}

          {/* YouTube Links Section */}
          <div className="card mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <FaYoutube className="me-2 text-danger" />
                YouTube Links ({youtubeLinks.length})
              </h5>
            </div>
            <div className="card-body">
              <YoutubeLinksList />
            </div>
          </div>

          {/* Videos Info */}
          {videos && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card bg-light">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <h6 className="card-title mb-1">
                          <i className="fas fa-info-circle me-2"></i>
                          Video Status
                        </h6>
                        <p className="mb-0">
                          <strong>Uploaded Files:</strong> {uploadedVideosCount}/6 videos
                        </p>
                        <p className="mb-0">
                          <strong>YouTube Links:</strong> {youtubeLinks.length} links
                        </p>
                        <p className="mb-0 fw-semibold text-primary">
                          <strong>Total Videos:</strong> {totalVideos}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex flex-wrap gap-1">
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <span
                              key={num}
                              className={`badge ${videos[`video${num}`] ? 'bg-success' : 'bg-secondary'}`}
                            >
                              V{num}
                            </span>
                          ))}
                          {youtubeLinks.length > 0 && (
                            <span className="badge bg-danger">
                              YT: {youtubeLinks.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loadingVideo && !videos && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading videos...</span>
              </div>
              <p>Loading videos...</p>
            </div>
          )}

          {/* Error State */}
          {errorVideo && !videos && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Error:</strong> {errorVideo}
              <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => getVideos()}>
                <i className="fas fa-redo me-1"></i> Retry
              </button>
            </div>
          )}

          {/* Video Upload Forms */}
          {!loadingVideo && videos && (
            <>
              <h4 className="mb-3">
                <i className="fas fa-upload me-2"></i>
                File Upload Section
              </h4>
              <div className="row">
                {[1, 2, 3, 4, 5, 6].map((videoNumber) => (
                  <div key={videoNumber} className="col-12 col-lg-6">
                    <VideoUploadForm videoNumber={videoNumber} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* No Videos State */}
          {!loadingVideo && !videos && !errorVideo && (
            <div className="text-center py-5">
              <div className="alert alert-info">
                <h5>
                  <i className="fas fa-info-circle me-2"></i>
                  No Videos Found
                </h5>
                <p>Start by uploading your first video or adding YouTube links.</p>
                <button className="btn btn-primary" onClick={() => getVideos()}>
                  <i className="fas fa-sync-alt me-2"></i>
                  Check Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoUpload;
