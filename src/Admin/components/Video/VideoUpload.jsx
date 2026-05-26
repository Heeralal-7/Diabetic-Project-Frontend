import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminVideoUpload = () => {
  const [videos, setVideos] = useState(null);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState({});
  const [toasts, setToasts] = useState([]);
  
  // YouTube form states
  const [showYoutubeForm, setShowYoutubeForm] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);

  const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Custom Toast function
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  // Custom Toast Container Component
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

  // Get Videos (existing function)
  const getVideos = async () => {
    try {
      setLoading(true);
      
      const tokenS = JSON.parse(sessionStorage.getItem("admin"));
      
      const response = await axios.get(`${URL}/upload-videos/getVideo`, {
        headers: {
          'Authorization': `Bearer ${tokenS?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success === 1) {
        if (response.data.details && response.data.details.length > 0) {
          setVideos(response.data.details[0]);
          showToast('Videos loaded successfully!', 'success');
        } else {
          setVideos(null);
          showToast('No videos found in database', 'warning');
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch videos';
      showToast(errorMsg, 'error');
      setVideos(null);
    } finally {
      setLoading(false);
    }
  };

  // Get YouTube Links (NEW function)
  const getYoutubeLinks = async () => {
    try {
      setYoutubeLoading(true);
      const tokenS = JSON.parse(sessionStorage.getItem("admin"));
      
      const response = await axios.get(`${URL}/upload-videos/get-youtube-links`, {
        headers: {
          'Authorization': `Bearer ${tokenS?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success === 1) {
        setYoutubeLinks(response.data.youtubeLinks || []);
      } else {
        setYoutubeLinks([]);
      }
    } catch (error) {
      console.error('Error fetching YouTube links:', error);
      setYoutubeLinks([]);
    } finally {
      setYoutubeLoading(false);
    }
  };

  // Add/Update YouTube Link (NEW function)
  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      showToast('Please enter YouTube URL', 'warning');
      return;
    }

    try {
      const tokenS = JSON.parse(sessionStorage.getItem("admin"));
      const token = tokenS?.token;

      if (!token) {
        showToast('Please login first', 'error');
        return;
      }

      const url = isEditing 
        ? `${URL}/upload-videos/update-youtube-link/${editingLinkId}`
        : `${URL}/upload-videos/add-youtube-link`;

      const method = isEditing ? 'put' : 'post';

      const response = await axios[method](
        url,
        {
          youtubeUrl: youtubeUrl.trim(),
          title: youtubeTitle.trim() || undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success === 1) {
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
        
        // Refresh YouTube links
        await getYoutubeLinks();
      } else {
        throw new Error(response.data.message || 'Failed to save YouTube link');
      }
    } catch (error) {
      console.error('Error saving YouTube link:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save YouTube link';
      showToast(errorMsg, 'error');
    }
  };

  // Delete YouTube Link (NEW function)
  const deleteYoutubeLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this YouTube link?')) {
      return;
    }

    try {
      const tokenS = JSON.parse(sessionStorage.getItem("admin"));
      const token = tokenS?.token;

      const response = await axios.delete(
        `${URL}/upload-videos/delete-youtube-link/${linkId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success === 1) {
        showToast('YouTube link deleted successfully!', 'success');
        await getYoutubeLinks();
      } else {
        throw new Error(response.data.message || 'Failed to delete YouTube link');
      }
    } catch (error) {
      console.error('Error deleting YouTube link:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete YouTube link';
      showToast(errorMsg, 'error');
    }
  };

  // Edit YouTube Link (NEW function)
  const editYoutubeLink = (link) => {
    setYoutubeUrl(link.url);
    setYoutubeTitle(link.title);
    setIsEditing(true);
    setEditingLinkId(link._id);
    setShowYoutubeForm(true);
  };

  // Update Single Video (existing function)
  const updateVideo = async (videoNumber, videoFile) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [videoNumber]: true }));

      const tokenS = JSON.parse(sessionStorage.getItem("admin"));
      const videoId = videos?._id;

      if (!videoId) {
        throw new Error('No video ID found. Please fetch videos first.');
      }

      if (!videoFile) {
        throw new Error('Please select a video file to upload');
      }

      const formData = new FormData();
      formData.append(`video${videoNumber}`, videoFile);

      const response = await axios.patch(
        `${URL}/upload-videos/videoupdate/${videoId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${tokenS?.token}`,
          },
          timeout: 30000
        }
      );

      if (response.data.success === 1) {
        showToast(`Video ${videoNumber} updated successfully! 🎉`, 'success');
        await getVideos();
      } else {
        throw new Error(response.data.message || 'Failed to update video');
      }
    } catch (error) {
      console.error(`Error updating video ${videoNumber}:`, error);
      
      let errorMsg = 'Unknown error occurred';
      if (error.response) {
        errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = 'No response from server. Check your connection.';
      } else {
        errorMsg = error.message;
      }
      
      showToast(`Failed to update video ${videoNumber}: ${errorMsg}`, 'error');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [videoNumber]: false }));
    }
  };

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    // Extract video ID from YouTube URL
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`;
    }
    return '';
  };

  // Function to get full URL (existing)
  const getFullUrl = (path) => {
    if (!path) return '';
    return `${URL}${path}`;
  };

  // Load both videos and YouTube links on mount
  useEffect(() => {
    getVideos();
    getYoutubeLinks();
  }, []);

  // Video Upload Form Component (existing - UNCHANGED)
  const VideoUploadForm = ({ videoNumber }) => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoFileName, setVideoFileName] = useState('');

    const currentVideo = videos ? videos[`video${videoNumber}`] : '';

    const handleVideoChange = (e) => {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoFileName(file ? file.name : '');
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!videoFile) {
        showToast('Please select a video file to update', 'warning');
        return;
      }

      // Check file size (max 100MB)
      if (videoFile.size > 100 * 1024 * 1024) {
        showToast('Video file is too large. Maximum size is 100MB.', 'error');
        return;
      }

      await updateVideo(videoNumber, videoFile);
    };

    const resetForm = () => {
      setVideoFile(null);
      setVideoFileName('');
      const videoInput = document.getElementById(`video${videoNumber}`);
      if (videoInput) videoInput.value = '';
    };

    return (
      <div className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Video {videoNumber}</h5>
          {videos && (
            <span className={`badge ${currentVideo ? 'bg-success' : 'bg-warning'}`}>
              {currentVideo ? 'Uploaded' : 'Empty'}
            </span>
          )}
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
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor={`video${videoNumber}`} className="form-label">
                Upload New Video {videoNumber}
              </label>
              <input
                type="file"
                className="form-control"
                id={`video${videoNumber}`}
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleVideoChange}
                disabled={updateLoading[videoNumber]}
              />
              {videoFileName && (
                <div className="mt-2">
                  <small className="text-success">
                    <strong>Selected:</strong> {videoFileName}
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
                type="submit"
                className="btn btn-success"
                disabled={updateLoading[videoNumber] || !videoFile}
              >
                {updateLoading[videoNumber] ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Uploading...
                  </>
                ) : (
                  `Update Video ${videoNumber}`
                )}
              </button>
              
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
                disabled={updateLoading[videoNumber]}
              >
                Clear
              </button>

              {!currentVideo && !updateLoading[videoNumber] && (
                <span className="text-warning">
                  <i className="fas fa-exclamation-triangle me-1"></i> No video uploaded
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  // YouTube Link Form Component (NEW)
  const YoutubeLinkForm = () => {
    return (
      <div className="card mb-4">
        <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fab fa-youtube me-2"></i>
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
                disabled={!youtubeUrl.trim()}
              >
                {isEditing ? (
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
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // YouTube Links List Component (NEW)
  const YoutubeLinksList = () => {
    if (youtubeLoading) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-danger"></div>
          <p className="mt-2">Loading YouTube links...</p>
        </div>
      );
    }

    if (youtubeLinks.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted">No YouTube links added yet.</p>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setShowYoutubeForm(true)}
          >
            <i className="fab fa-youtube me-1"></i>
            Add Your First YouTube Link
          </button>
        </div>
      );
    }

    return (
      <div className="row">
        {youtubeLinks.map((link, index) => (
          <div key={link._id} className="col-12 col-md-6 col-lg-4 mb-3">
            <div className="card h-100">
              <div className="card-body">
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
                <h6 className="card-title" title={link.title}>
                  {link.title.length > 30 ? link.title.substring(0, 30) + '...' : link.title}
                </h6>
                
                <small className="text-muted d-block mb-2">
                  <i className="fab fa-youtube me-1 text-danger"></i>
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
                    <i className="fab fa-youtube me-1"></i>
                    Watch
                  </a>
                  
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => editYoutubeLink(link)}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteYoutubeLink(link._id)}
                      title="Delete"
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

  return (
    <div className="container-fluid py-4">
      {/* Custom Toast Container */}
      <CustomToastContainer />

      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-primary">
              <i className="fas fa-video me-2"></i>
              Admin Video Management
            </h2>
            <div className="d-flex gap-2">
              <button
                className="btn btn-danger"
                onClick={() => setShowYoutubeForm(!showYoutubeForm)}
              >
                <i className="fab fa-youtube me-2"></i>
                {showYoutubeForm ? 'Hide Form' : 'Add YouTube Link'}
              </button>
              
              <button
                className="btn btn-primary"
                onClick={() => {
                  getVideos();
                  getYoutubeLinks();
                }}
                disabled={loading || youtubeLoading}
              >
                {loading || youtubeLoading ? (
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
                <i className="fab fa-youtube me-2 text-danger"></i>
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
                          <strong>Uploaded Files:</strong> {Object.keys(videos).filter(key => key.startsWith('video') && videos[key]).length}/6 videos
                        </p>
                        <p className="mb-0">
                          <strong>YouTube Links:</strong> {youtubeLinks.length} links
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
          {loading && !videos && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}>
                <span className="visually-hidden">Loading videos...</span>
              </div>
              <p>Loading videos...</p>
            </div>
          )}

          {/* Video Upload Forms */}
          {!loading && videos && (
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
          {!loading && !videos && (
            <div className="text-center py-5">
              <div className="alert alert-warning">
                <h5>No Videos Found</h5>
                <p>Please check if videos exist in the database or contact administrator.</p>
                <button className="btn btn-primary" onClick={getVideos}>
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVideoUpload;
