import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context';

const QualificationsManagement = () => {
  const {
    qualifications,
    qualificationsLoading,
    error,
    setError,
    getQualifications
  } = useContext(MyContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQualifications, setFilteredQualifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch qualifications on component mount
  useEffect(() => {
    getQualifications();
  }, []);

  // Filter qualifications based on search term and category
  useEffect(() => {
    let filtered = qualifications;

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(qualification =>
        qualification.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qualification.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qualification.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(qualification =>
        qualification.category === selectedCategory
      );
    }

    setFilteredQualifications(filtered);
  }, [searchTerm, selectedCategory, qualifications]);

  // Get unique categories for filter
  const categories = ['all', ...new Set(qualifications.map(q => q.category).filter(Boolean))];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (error) setError(null);
  };

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Refresh qualifications list
  const handleRefresh = () => {
    getQualifications();
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">Qualifications Management</h4>
                <small className="text-muted">Browse available medical qualifications</small>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleRefresh}
                disabled={qualificationsLoading}
              >
                {qualificationsLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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

              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search qualifications by name, description, or category..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    {searchTerm && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-center">
                  <small className="text-muted">
                    Showing {filteredQualifications.length} of {qualifications.length} qualifications
                  </small>
                </div>
              </div>

              {/* Qualifications Grid */}
              {qualificationsLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading qualifications...</span>
                  </div>
                  <p className="mt-3">Loading qualifications...</p>
                </div>
              ) : filteredQualifications.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="fas fa-graduation-cap fa-3x text-muted"></i>
                  </div>
                  <h5 className="text-muted">
                    {searchTerm || selectedCategory !== 'all' ? 'No qualifications found matching your filters' : 'No qualifications available'}
                  </h5>
                  <p className="text-muted">
                    {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search terms or category filter' : 'Qualifications will appear here once they are added to the system'}
                  </p>
                  {(searchTerm || selectedCategory !== 'all') && (
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                    >
                      Show All Qualifications
                    </button>
                  )}
                </div>
              ) : (
                <div className="row">
                  {filteredQualifications.map((qualification, index) => (
                    <div key={qualification._id || index} className="col-xl-4 col-lg-6 col-md-6 mb-4">
                      <div className="card h-100 qualification-card">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                          <h6 className="mb-0 text-truncate">
                            <i className="fas fa-graduation-cap me-2"></i>
                            {qualification.name || 'Unnamed Qualification'}
                          </h6>
                          {qualification.category && (
                            <span className="badge bg-light text-dark small">{qualification.category}</span>
                          )}
                        </div>
                        <div className="card-body">
                          {qualification.image && (
                            <div className="text-center mb-3">
                              <img
                                src={qualification.image}
                                alt={qualification.name}
                                className="img-fluid rounded"
                                style={{ maxHeight: '120px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          <p className="card-text small text-muted">
                            {qualification.description ? (
                              qualification.description.length > 150 ? (
                                <>
                                  {qualification.description.substring(0, 150)}...
                                  <span 
                                    className="text-primary cursor-pointer"
                                    onClick={(e) => {
                                      const fullText = e.target.nextSibling;
                                      const readMore = e.target;
                                      readMore.style.display = 'none';
                                      fullText.style.display = 'inline';
                                    }}
                                  > Read more
                                  </span>
                                  <span style={{display: 'none'}}>
                                    {qualification.description.substring(150)}
                                    <span 
                                      className="text-primary cursor-pointer"
                                      onClick={(e) => {
                                        const fullText = e.target.parentElement;
                                        const readMore = fullText.previousSibling;
                                        fullText.style.display = 'none';
                                        readMore.style.display = 'inline';
                                      }}
                                    > Show less
                                    </span>
                                  </span>
                                </>
                              ) : (
                                qualification.description
                              )
                            ) : (
                              <span className="text-muted">No description available</span>
                            )}
                          </p>

                          {/* Qualification Details */}
                          <div className="qualification-details">
                            {qualification.duration && (
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Duration:</small>
                                <small className="fw-bold">{qualification.duration}</small>
                              </div>
                            )}
                            
                            {qualification.recognizedBy && (
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Recognized By:</small>
                                <small className="fw-bold text-end">{qualification.recognizedBy}</small>
                              </div>
                            )}

                            {qualification.level && (
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Level:</small>
                                <small className="fw-bold">{qualification.level}</small>
                              </div>
                            )}

                            {qualification.credits && (
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Credits:</small>
                                <small className="fw-bold text-success">{qualification.credits}</small>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="card-footer bg-transparent">
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {qualification.validity ? `Valid until: ${qualification.validity}` : 'No expiry date'}
                            </small>
                            <div className="btn-group">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                title="View Details"
                                disabled={!qualification._id}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-info"
                                title="More Info"
                                disabled={!qualification._id}
                              >
                                <i className="fas fa-info-circle"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Statistics Card */}
              {qualifications.length > 0 && (
                <div className="card mt-4">
                  <div className="card-header">
                    <h6 className="mb-0">Qualifications Statistics</h6>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-md-3 col-6 mb-3">
                        <div className="border rounded p-3">
                          <h4 className="text-primary mb-1">{qualifications.length}</h4>
                          <small className="text-muted">Total Qualifications</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <div className="border rounded p-3">
                          <h4 className="text-success mb-1">
                            {categories.length - 1}
                          </h4>
                          <small className="text-muted">Categories</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <div className="border rounded p-3">
                          <h4 className="text-info mb-1">
                            {qualifications.filter(q => q.duration).length}
                          </h4>
                          <small className="text-muted">With Duration</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <div className="border rounded p-3">
                          <h4 className="text-warning mb-1">
                            {qualifications.filter(q => q.recognizedBy).length}
                          </h4>
                          <small className="text-muted">Recognized</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .qualification-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .qualification-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .qualification-details {
          border-top: 1px solid #e9ecef;
          padding-top: 10px;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default QualificationsManagement;