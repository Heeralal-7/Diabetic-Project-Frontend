import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context';

const DoctorRatings = () => {
  const {
    ratings,
    ratingsLoading,
    error,
    setError,
    getDoctorRating,
    getRatingFeedback,
    getAllRatingData
  } = useContext(MyContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState('summary');

  // Fetch rating data on component mount
  useEffect(() => {
    getAllRatingData(currentPage, itemsPerPage);
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getRatingFeedback(newPage, itemsPerPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    getRatingFeedback(1, newLimit);
  };

  // Refresh data
  const handleRefresh = () => {
    getAllRatingData(currentPage, itemsPerPage);
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star text-warning"></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-warning"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-warning"></i>);
      }
    }
    return stars;
  };

  // Calculate rating percentages
  const calculatePercentage = (count) => {
    const total = ratings.excellent + ratings.good + ratings.average + ratings.belowAverage + ratings.poor;
    return total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  };

  // Get rating label and color
  const getRatingInfo = (rating) => {
    if (rating >= 4) return { label: 'Excellent', color: 'success', bg: 'bg-success' };
    if (rating >= 3) return { label: 'Good', color: 'info', bg: 'bg-info' };
    if (rating >= 2) return { label: 'Average', color: 'warning', bg: 'bg-warning' };
    if (rating >= 1) return { label: 'Below Average', color: 'orange', bg: 'bg-orange' };
    return { label: 'Poor', color: 'danger', bg: 'bg-danger' };
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">Ratings & Feedback</h4>
                <small className="text-muted">Manage and view patient ratings and feedback</small>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleRefresh}
                disabled={ratingsLoading}
              >
                {ratingsLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt me-2"></i>
                    Refresh
                  </>
                )}
              </button>
            </div>

            <div className="card-body">
              {/* Error Message Display */}
              {/* {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )} */}

              {/* Tab Navigation */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('summary')}
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    Rating Summary
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feedback')}
                  >
                    <i className="fas fa-comments me-2"></i>
                    Patient Feedback
                    {ratings.feedbacks.length > 0 && (
                      <span className="badge bg-primary ms-2">{ratings.feedbacks.length}</span>
                    )}
                  </button>
                </li>
              </ul>

              {/* Loading State */}
              {ratingsLoading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading ratings...</span>
                  </div>
                  <p className="mt-3">Loading ratings and feedback...</p>
                </div>
              )}

              {/* Rating Summary Tab */}
              {!ratingsLoading && activeTab === 'summary' && (
                <div className="row">
                  {/* Overall Rating Card */}
                  <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card text-center h-100">
                      <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Overall Rating</h5>
                      </div>
                      <div className="card-body">
                        <div className="display-4 fw-bold text-primary mb-2">
                          {ratings.overallRating.toFixed(1)}
                        </div>
                        <div className="mb-3">
                          {renderStars(ratings.overallRating)}
                        </div>
                        <p className="text-muted mb-0">
                          Based on {ratings.pagination.totalFeedbacks} reviews
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating Distribution Card */}
                  <div className="col-lg-8 col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header">
                        <h5 className="mb-0">Rating Distribution</h5>
                      </div>
                      <div className="card-body">
                        {[
                          { rating: 5, count: ratings.excellent, label: 'Excellent' },
                          { rating: 4, count: ratings.good, label: 'Good' },
                          { rating: 3, count: ratings.average, label: 'Average' },
                          { rating: 2, count: ratings.belowAverage, label: 'Below Average' },
                          { rating: 1, count: ratings.poor, label: 'Poor' }
                        ].map((item, index) => (
                          <div key={index} className="row align-items-center mb-3">
                            <div className="col-2">
                              <span className="badge bg-primary">{item.rating} Stars</span>
                            </div>
                            <div className="col-8">
                              <div className="progress" style={{ height: '20px' }}>
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{ 
                                    width: `${calculatePercentage(item.count)}%`,
                                    backgroundColor: getRatingInfo(item.rating).bg.replace('bg-', '')
                                  }}
                                  aria-valuenow={calculatePercentage(item.count)}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                >
                                  {calculatePercentage(item.count)}%
                                </div>
                              </div>
                            </div>
                            <div className="col-2 text-end">
                              <small className="text-muted">{item.count}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Statistics Cards */}
                  <div className="col-12">
                    <div className="row">
                      <div className="col-md-3 col-6 mb-3">
                        <div className="card text-center border-success">
                          <div className="card-body">
                            <h3 className="text-success mb-1">{ratings.excellent}</h3>
                            <small className="text-muted">Excellent Ratings</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <div className="card text-center border-info">
                          <div className="card-body">
                            <h3 className="text-info mb-1">{ratings.good}</h3>
                            <small className="text-muted">Good Ratings</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <div className="card text-center border-warning">
                          <div className="card-body">
                            <h3 className="text-warning mb-1">{ratings.average}</h3>
                            <small className="text-muted">Average Ratings</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <div className="card text-center border-danger">
                          <div className="card-body">
                            <h3 className="text-danger mb-1">
                              {ratings.belowAverage + ratings.poor}
                            </h3>
                            <small className="text-muted">Needs Improvement</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Tab */}
              {!ratingsLoading && activeTab === 'feedback' && (
                <div>
                  {/* Filters and Pagination Controls */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <label className="me-2 mb-0">Show:</label>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: '80px' }}
                          value={itemsPerPage}
                          onChange={handleItemsPerPageChange}
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                        </select>
                        <span className="ms-2 text-muted">
                          {ratings.feedbacks.length} feedbacks
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-end">
                        {/* Pagination will go here */}
                      </div>
                    </div>
                  </div>

                  {/* Feedback List */}
                  {ratings.feedbacks.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <i className="fas fa-comment-slash fa-3x text-muted"></i>
                      </div>
                      <h5 className="text-muted">No Feedback Yet</h5>
                      <p className="text-muted">Patient feedback will appear here once they submit ratings.</p>
                    </div>
                  ) : (
                    <div className="row">
                      {ratings.feedbacks.map((feedback, index) => (
                        <div key={feedback._id || index} className="col-12 mb-4">
                          <div className="card">
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-8">
                                  <div className="d-flex align-items-center mb-3">
                                    {feedback.userId?.image ? (
                                      <img
                                        src={feedback.userId.image}
                                        alt={feedback.userId.name}
                                        className="rounded-circle me-3"
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <div className="rounded-circle bg-secondary me-3 d-flex align-items-center justify-content-center"
                                        style={{ width: '50px', height: '50px' }}>
                                        <i className="fas fa-user text-white"></i>
                                      </div>
                                    )}
                                    <div>
                                      <h6 className="mb-1">{feedback.userId?.name || 'Anonymous'}</h6>
                                      <div className="text-warning">
                                        {renderStars(feedback.rating)}
                                        <span className="ms-2 text-muted">
                                          ({feedback.rating}/5)
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {feedback.feedback && (
                                    <blockquote className="blockquote mb-0">
                                      <p className="mb-0" style={{ fontStyle: 'italic' }}>
                                        "{feedback.feedback}"
                                      </p>
                                    </blockquote>
                                  )}
                                  
                                  {!feedback.feedback && (
                                    <p className="text-muted mb-0">No written feedback provided.</p>
                                  )}
                                </div>
                                <div className="col-md-4 text-md-end">
                                  <small className="text-muted">
                                    {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'Date not available'}
                                  </small>
                                  <div className="mt-2">
                                    <span className={`badge ${getRatingInfo(feedback.rating).bg}`}>
                                      {getRatingInfo(feedback.rating).label}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {ratings.feedbacks.length > 0 && ratings.pagination.totalPages > 1 && (
                    <nav aria-label="Feedback pagination">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {[...Array(ratings.pagination.totalPages)].map((_, index) => (
                          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${currentPage === ratings.pagination.totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === ratings.pagination.totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .progress-bar {
          transition: width 0.6s ease;
        }
        .card {
          transition: transform 0.2s ease-in-out;
        }
        .card:hover {
          transform: translateY(-2px);
        }
        .bg-orange {
          background-color: #fd7e14 !important;
        }
      `}</style>
    </div>
  );
};

export default DoctorRatings;