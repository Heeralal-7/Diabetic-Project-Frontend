import Aos from "aos";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaYoutube } from "react-icons/fa";
import { BsPlayFill } from "react-icons/bs";

const Videos = () => {
  const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const [videosData, setVideosData] = useState(null);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Aos.init();
    fetchAllVideos();
  }, []);

  const fetchAllVideos = async () => {
    try {
      setLoading(true);
      
      // Fetch uploaded videos
      const videosResponse = await axios.get(`${URL}/upload-videos/getVideo`, {});
      
      // Fetch YouTube links
      const youtubeResponse = await axios.get(`${URL}/upload-videos/get-youtube-links`, {});

      if (videosResponse.data.success === 1) {
        setVideosData(videosResponse.data.details[0]);
      }

      if (youtubeResponse.data.success === 1) {
        setYoutubeLinks(youtubeResponse.data.youtubeLinks || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to get full video URL
  const getVideoUrl = (videoPath) => {
    if (!videoPath) return '';
    return `${URL}${videoPath}`;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center py-4">
          <div className="spinner-border text-primary" style={{width: '2rem', height: '2rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 small text-muted">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger text-center py-2" role="alert">
          <small>Error loading videos</small>
        </div>
      </div>
    );
  }

  // Count total videos
  const uploadedVideosCount = videosData ? 
    [videosData.video1, videosData.video2, videosData.video3, 
     videosData.video4, videosData.video5, videosData.video6].filter(v => v).length : 0;
  
  const totalVideos = uploadedVideosCount + youtubeLinks.length;

  if (totalVideos === 0) {
    return (
      <div className="container py-4">
        <div className="text-center py-3">
          <div className="alert alert-info py-2">
            <small className="fw-medium">No videos available</small>
          </div>
        </div>
      </div>
    );
  }

  // Filter uploaded videos that exist
  const uploadedVideos = [];
  if (videosData) {
    for (let i = 1; i <= 6; i++) {
      const videoKey = `video${i}`;
      if (videosData[videoKey]) {
        uploadedVideos.push({
          number: i,
          url: videosData[videoKey]
        });
      }
    }
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .video-card {
              transition: all 0.2s ease;
              border: 1px solid #dee2e6;
              border-radius: 10px;
              overflow: hidden;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            .video-card:hover {
              border-color: #0d6efd;
              box-shadow: 0 6px 12px rgba(0,0,0,0.08);
            }
            .video-thumbnail {
              position: relative;
              overflow: hidden;
              height: 200px;
              background: #f8f9fa;
              flex-shrink: 0;
            }
            .video-thumbnail img,
            .video-thumbnail video {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .youtube-badge {
              position: absolute;
              top: 10px;
              left: 10px;
              background: #FF0000;
              color: white;
              padding: 3px 10px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              z-index: 2;
            }
            .uploaded-badge {
              position: absolute;
              top: 10px;
              left: 10px;
              background: #0d6efd;
              color: white;
              padding: 3px 10px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              z-index: 2;
            }
            .play-button {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: rgba(255, 255, 255, 0.9);
              width: 50px;
              height: 50px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FF0000;
              font-size: 24px;
              opacity: 0;
              transition: opacity 0.2s ease;
              z-index: 2;
            }
            .video-thumbnail:hover .play-button {
              opacity: 1;
            }
            .video-content {
              padding: 15px;
              flex: 1;
              display: flex;
              flex-direction: column;
            }
            .video-title {
              font-size: 15px;
              font-weight: 600;
              color: #333;
              margin-bottom: 8px;
              line-height: 1.3;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              height: 40px;
              flex-shrink: 0;
            }
            .video-meta {
              font-size: 13px;
              color: #6c757d;
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 15px;
              flex-shrink: 0;
            }
            .video-button {
              margin-top: auto;
              padding: 8px 16px;
              font-size: 14px;
              border-radius: 5px;
              width: 100%;
              text-align: center;
            }
            .total-videos-badge {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 20px;
              padding: 6px 15px;
              font-size: 14px;
              font-weight: 600;
              color: #0d6efd;
            }
            .section-divider {
              border: none;
              height: 1px;
              background: #dee2e6;
              margin: 25px 0;
            }
            .compact-header {
              padding: 15px 0;
              margin-bottom: 15px;
            }
            .uploaded-row {
              margin-bottom: 20px;
            }
            .card-content-wrapper {
              flex: 1;
              display: flex;
              flex-direction: column;
              min-height: 150px;
            }
          `,
        }}
      />
      
      <div className="container py-3">
        {/* Compact Header with Total Videos Only */}
        <div className="compact-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h4 fw-bold mb-1">Health Videos</h2>
              <p className="text-muted small mb-0">Browse our health and wellness video collection</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="total-videos-badge">
                {totalVideos} Videos
              </div>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={fetchAllVideos}
                disabled={loading}
                style={{padding: '6px 15px', fontSize: '14px', borderRadius: '5px'}}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Uploaded Videos - 2 Rows of 3 */}
        {(uploadedVideos.length > 0) && (
          <div className="mb-4">
            <h6 className="fw-semibold mb-3 text-primary">
              <i className="fas fa-video me-2"></i>
              Uploaded Health Videos
            </h6>
            
            {/* First Row - 3 videos */}
            {uploadedVideos.length > 0 && (
              <div className="row g-3 uploaded-row">
                {uploadedVideos.slice(0, 3).map((video) => (
                  <div key={video.number} className="col-md-4" data-aos="fade-up">
                    <div className="video-card">
                      <div className="video-thumbnail">
                        <div className="uploaded-badge">Video {video.number}</div>
                        <video
                          src={getVideoUrl(video.url)}
                          controls
                        ></video>
                      </div>
                      <div className="video-content">
                        <div className="video-title">Health Education Video {video.number}</div>
                        <div className="video-meta">
                          <i className="fas fa-video text-primary"></i>
                          <span>Uploaded Video</span>
                        </div>
                        <a 
                          href={getVideoUrl(video.url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary video-button"
                        >
                          <i className="fas fa-play me-1"></i>
                          Watch Full Video
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Second Row - Next 3 videos */}
            {uploadedVideos.length > 3 && (
              <div className="row g-3">
                {uploadedVideos.slice(3, 6).map((video) => (
                  <div key={video.number} className="col-md-4" data-aos="fade-up" data-aos-delay="100">
                    <div className="video-card">
                      <div className="video-thumbnail">
                        <div className="uploaded-badge">Video {video.number}</div>
                        <video
                          src={getVideoUrl(video.url)}
                          controls
                        ></video>
                      </div>
                      <div className="video-content">
                        <div className="video-title">Health Education Video {video.number}</div>
                        <div className="video-meta">
                          <i className="fas fa-video text-primary"></i>
                          <span>Uploaded Video</span>
                        </div>
                        <a 
                          href={getVideoUrl(video.url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary video-button"
                        >
                          <i className="fas fa-play me-1"></i>
                          Watch Full Video
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Divider if both sections exist */}
        {(uploadedVideos.length > 0 && youtubeLinks.length > 0) && (
          <hr className="section-divider" />
        )}

        {/* YouTube Videos Section - Same Card Size */}
        {youtubeLinks.length > 0 && (
          <div className="mb-4">
            <h6 className="fw-semibold mb-3 text-danger">
              <FaYoutube className="me-2" />
              YouTube Health Videos
            </h6>
            <div className="row g-3">
              {youtubeLinks.map((link, index) => (
                <div key={link._id} className="col-md-4" data-aos="fade-up" data-aos-delay={index * 50}>
                  <div className="video-card">
                    <div className="video-thumbnail">
                      <div className="youtube-badge">
                        <FaYoutube className="me-1" />
                        YouTube
                      </div>
                      <img
                        src={getYouTubeThumbnail(link.url)}
                        alt={link.title}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200/FF0000/FFFFFF?text=YouTube';
                        }}
                      />
                      <div 
                        className="play-button"
                        onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                      >
                        <BsPlayFill />
                      </div>
                    </div>
                    <div className="video-content">
                      <div className="video-title" title={link.title}>
                        {link.title.length > 50 ? link.title.substring(0, 50) + '...' : link.title}
                      </div>
                      <div className="video-meta">
                        <FaYoutube className="text-danger" />
                        <span>YouTube Video</span>
                        <span className="ms-2 text-muted">•</span>
                        <span>{new Date(link.addedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
                      </div>
                      <button
                        className="btn btn-danger video-button"
                        onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                      >
                        <FaYoutube className="me-1" />
                        Watch on YouTube
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center mt-4 pt-4 border-top">
          <p className="text-muted small mb-2">
            <i className="fas fa-info-circle me-1"></i>
            For medical advice, please consult healthcare professionals
          </p>
          <div className="text-muted" style={{fontSize: '12px'}}>
            Total {totalVideos} videos available • Updated just now
          </div>
        </div>
      </div>
    </>
  );
};

export default Videos;
