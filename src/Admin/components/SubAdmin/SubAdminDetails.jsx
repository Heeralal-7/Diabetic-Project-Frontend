import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';

const SubAdminDetails = () => {
  const { id } = useParams();
  const { currentSubAdmin, getSubAdminById, loading, updateSubAdminStatus } = useContext(MyContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (id) {
      getSubAdminById(id);
    }
  }, [id]);

  // Function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path from backend, prepend the base URL
    if (imagePath.startsWith('/')) {
      // Remove the /api part if it's already in URL
      const baseUrl = URL.replace('/api', '');
      return `${baseUrl}${imagePath}`;
    }
    
    return `${URL}/${imagePath}`;
  };

  const handleStatusToggle = async () => {
    if (currentSubAdmin) {
      const result = await updateSubAdminStatus(id, !currentSubAdmin.isActive);
      if (result.success) {
        // Status updated successfully
      }
    }
  };

  if (loading && !currentSubAdmin) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading sub-admin details...</p>
        </div>
      </div>
    );
  }

  if (!currentSubAdmin) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h3>Sub-Admin Not Found</h3>
                <p className="text-muted">The requested sub-admin could not be found.</p>
                <button
                  onClick={() => navigate('/dashboard/subadmins')}
                  className="btn btn-primary"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subAdminImageUrl = getImageUrl(currentSubAdmin.image);
  const createdByImageUrl = currentSubAdmin.createdBy?.image ? getImageUrl(currentSubAdmin.createdBy.image) : null;

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <button
                    onClick={() => navigate('/dashboard/subadmins')}
                    className="btn btn-outline-secondary me-3"
                  >
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <div>
                    <h4 className="mb-0">Sub-Admin Details</h4>
                    <p className="text-muted mb-0">Manage sub-admin information and permissions</p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Link
                    to={`/dashboard/subadmins/${id}/edit`}
                    className="btn btn-success"
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit Permissions
                  </Link>
                  <button
                    onClick={handleStatusToggle}
                    className={`btn ${currentSubAdmin.isActive ? 'btn-warning' : 'btn-success'}`}
                  >
                    <i className={`fas ${currentSubAdmin.isActive ? 'fa-pause' : 'fa-play'} me-2`}></i>
                    {currentSubAdmin.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  {subAdminImageUrl ? (
                    <img
                      src={subAdminImageUrl}
                      alt={currentSubAdmin.name}
                      className="rounded-circle border"
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'cover',
                        border: '3px solid #dee2e6'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`rounded-circle d-flex align-items-center justify-content-center bg-primary text-white ${subAdminImageUrl ? 'd-none' : ''}`}
                    style={{ 
                      width: '80px', 
                      height: '80px',
                      fontSize: '24px'
                    }}
                  >
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <div className="col">
                  <h3 className="mb-1">{currentSubAdmin.name}</h3>
                  <p className="text-muted mb-2">
                    <i className="fas fa-envelope me-2"></i>
                    {currentSubAdmin.email}
                  </p>
                  <div className="d-flex gap-2 flex-wrap">
                    <span className={`badge ${currentSubAdmin.isActive ? 'bg-success' : 'bg-danger'}`}>
                      <i className={`fas ${currentSubAdmin.isActive ? 'fa-check' : 'fa-times'} me-1`}></i>
                      {currentSubAdmin.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="badge bg-secondary">
                      <i className="fas fa-user me-1"></i>
                      Created by: {currentSubAdmin.createdBy?.name || 'System'}
                    </span>
                    <span className="badge bg-info">
                      <i className="fas fa-id-badge me-1"></i>
                      ID: {currentSubAdmin._id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                {['details', 'permissions', 'location'].map(tab => (
                  <li key={tab} className="nav-item">
                    <button
                      className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      <i className={`fas fa-${getTabIcon(tab)} me-2`}></i>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-body">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="row">
                  <div className="col-md-6">
                    <h5 className="mb-3">
                      <i className="fas fa-info-circle me-2 text-primary"></i>
                      Basic Information
                    </h5>
                    <dl className="row">
                      <dt className="col-sm-4">Full Name</dt>
                      <dd className="col-sm-8">{currentSubAdmin.name}</dd>

                      <dt className="col-sm-4">Email</dt>
                      <dd className="col-sm-8">{currentSubAdmin.email}</dd>

                      <dt className="col-sm-4">Status</dt>
                      <dd className="col-sm-8">
                        <span className={`badge ${currentSubAdmin.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {currentSubAdmin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </dd>

                      <dt className="col-sm-4">Profile Image</dt>
                      <dd className="col-sm-8">
                        {subAdminImageUrl ? (
                          <div className="d-flex align-items-center">
                            <img
                              src={subAdminImageUrl}
                              alt="Profile"
                              className="rounded-circle me-2"
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                objectFit: 'cover' 
                              }}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2Yzc1N2QiLz4KPHBhdGggZD0iTTIwIDIyQzIyLjIwOTEgMjIgMjQgMjAuMjA5MSAyNCAxOEMyNCAxNS43OTA5IDIyLjIwOTEgMTQgMjAgMTRDMTcuNzkwOSAxNCAxNiAxNS43OTA5IDE2IDE4QzE2IDIwLjIwOTEgMTcuNzkwOSAyMiAyMCAyMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNiAyNkMyNiAyOC4yMDkxIDIzLjMxMzcgMzAgMjAgMzBDMTYuNjg2MyAzMCAxNCAyOC4yMDkxIDE0IDI2QzE0IDIzLjc5MDkgMTYuNjg2MyAyMiAyMCAyMkMyMy4zMTM3IDIyIDI2IDIzLjc5MDkgMjYgMjZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                              }}
                            />
                            <span className="text-muted small">Image available</span>
                          </div>
                        ) : (
                          <span className="text-muted">No profile image</span>
                        )}
                      </dd>
                    </dl>
                  </div>
                  <div className="col-md-6">
                    <h5 className="mb-3">
                      <i className="fas fa-history me-2 text-primary"></i>
                      Account Information
                    </h5>
                    <dl className="row">
                      <dt className="col-sm-4">Created By</dt>
                      <dd className="col-sm-8">
                        <div className="d-flex align-items-center">
                          {createdByImageUrl && (
                            <img
                              src={createdByImageUrl}
                              alt={currentSubAdmin.createdBy?.name}
                              className="rounded-circle me-2"
                              style={{ 
                                width: '30px', 
                                height: '30px', 
                                objectFit: 'cover' 
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <span>{currentSubAdmin.createdBy?.name || 'System'}</span>
                        </div>
                      </dd>

                      <dt className="col-sm-4">Created At</dt>
                      <dd className="col-sm-8">
                        {new Date(currentSubAdmin.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>

                      <dt className="col-sm-4">Last Updated</dt>
                      <dd className="col-sm-8">
                        {new Date(currentSubAdmin.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </dl>
                  </div>
                </div>
              )}

              {/* Permissions Tab */}
              {activeTab === 'permissions' && (
                <div>
                  <h5 className="mb-3">
                    <i className="fas fa-shield-alt me-2 text-primary"></i>
                    Module Permissions
                  </h5>
                  
                  {/* Vendors Permissions */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="fas fa-store me-2"></i>
                        Vendors Management
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {currentSubAdmin.permissions?.vendors && Object.entries(currentSubAdmin.permissions.vendors).map(([vendorType, perms]) => (
                          <div key={vendorType} className="col-md-4 mb-3">
                            <div className="card h-100">
                              <div className="card-header bg-white">
                                <h6 className="mb-0 text-capitalize">
                                  <i className={`fas ${
                                    vendorType === 'lab' ? 'fa-flask' : 
                                    vendorType === 'pharmacy' ? 'fa-pills' : 'fa-utensils'
                                  } me-2`}></i>
                                  {vendorType} Vendors
                                </h6>
                              </div>
                              <div className="card-body">
                                {Object.entries(perms).map(([permission, hasAccess]) => (
                                  <div key={permission} className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-capitalize">{permission.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className={`badge ${hasAccess ? 'bg-success' : 'bg-danger'}`}>
                                      {hasAccess ? 'Allowed' : 'Denied'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Other Modules */}
                  <div className="row">
                    {['clinics', 'doctors', 'users'].map(module => (
                      currentSubAdmin.permissions?.[module] && (
                        <div key={module} className="col-md-4 mb-3">
                          <div className="card h-100">
                            <div className="card-header bg-light">
                              <h6 className="mb-0 text-capitalize">
                                <i className={`fas ${
                                  module === 'clinics' ? 'fa-clinic-medical' : 
                                  module === 'doctors' ? 'fa-user-md' : 'fa-users'
                                } me-2`}></i>
                                {module}
                              </h6>
                            </div>
                            <div className="card-body">
                              {Object.entries(currentSubAdmin.permissions[module]).map(([permission, hasAccess]) => (
                                <div key={permission} className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="text-capitalize">{permission.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className={`badge ${hasAccess ? 'bg-success' : 'bg-danger'}`}>
                                    {hasAccess ? 'Allowed' : 'Denied'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Location Access Tab */}
              {activeTab === 'location' && (
                <div>
                  <h5 className="mb-3">
                    <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                    Location Access
                  </h5>
                  <div className="row">
                    {['countries', 'states', 'cities'].map(locationType => (
                      <div key={locationType} className="col-md-4 mb-3">
                        <div className="card h-100">
                          <div className="card-header bg-light">
                            <h6 className="mb-0 text-capitalize">
                              <i className={`fas ${
                                locationType === 'countries' ? 'fa-globe' :
                                locationType === 'states' ? 'fa-map' :
                                'fa-city'
                              } me-2`}></i>
                              {locationType}
                            </h6>
                          </div>
                          <div className="card-body">
                            {currentSubAdmin.locationAccess?.[locationType]?.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1">
                                {currentSubAdmin.locationAccess[locationType].map((location, index) => (
                                  <span key={index} className="badge bg-primary me-1 mb-1">
                                    {location}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted mb-0">
                                <i className="fas fa-info-circle me-1"></i>
                                No restrictions - Access to all {locationType}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for tab icons
const getTabIcon = (tab) => {
  switch (tab) {
    case 'details': return 'info-circle';
    case 'permissions': return 'shield-alt';
    case 'location': return 'map-marker-alt';
    default: return 'circle';
  }
};

export default SubAdminDetails;