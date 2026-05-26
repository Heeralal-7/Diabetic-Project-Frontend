import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Link } from 'react-router-dom';

const SubAdminList = () => {
  const {
    subAdmins,
    loading,
    totalPages,
    currentPage,
    totalCount,
    getAllSubAdmins,
    updateSubAdminStatus,
    deleteSubAdmin
  } = useContext(MyContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPageLocal, setCurrentPageLocal] = useState(1);
  const [limit] = useState(10);

  const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    getAllSubAdmins(currentPageLocal, limit, searchTerm);
  }, [currentPageLocal, searchTerm]);

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

  const handleStatusToggle = async (id, currentStatus) => {
    const result = await updateSubAdminStatus(id, !currentStatus);
    if (result.success) {
      // Success handled in context
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete sub-admin "${name}"?`)) {
      const result = await deleteSubAdmin(id);
      if (result.success) {
        getAllSubAdmins(currentPageLocal, limit, searchTerm);
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPageLocal(1);
  };

  const handlePageChange = (page) => {
    setCurrentPageLocal(page);
  };

  if (loading && subAdmins.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading sub-admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Sub-Admins Management
              </h4>
              <Link
                to="/dashboard/subadmins/create"
                className="btn btn-primary"
              >
                <i className="fas fa-plus me-2"></i>
                Create New Sub-Admin
              </Link>
            </div>
            <div className="card-body">
              {/* Search Box */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-md-6 d-flex align-items-center justify-content-end">
                  <span className="text-muted">
                    Showing {subAdmins.length} of {totalCount} sub-admins
                  </span>
                </div>
              </div>

              {/* Sub-Admins Table */}
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Created By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subAdmins.map((subAdmin) => {
                      const imageUrl = getImageUrl(subAdmin.image);
                      return (
                        <tr key={subAdmin._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={subAdmin.name}
                                  className="rounded-circle me-3"
                                  style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    objectFit: 'cover',
                                    border: '2px solid #dee2e6'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`rounded-circle d-flex align-items-center justify-content-center text-white me-3 ${imageUrl ? 'd-none' : ''}`}
                                style={{ 
                                  width: '40px', 
                                  height: '40px',
                                  backgroundColor: '#6c757d',
                                  fontSize: '14px'
                                }}
                              >
                                <i className="fas fa-user"></i>
                              </div>
                              <div>
                                <div className="fw-bold">{subAdmin.name}</div>
                                <small className="text-muted">ID: {subAdmin._id}</small>
                              </div>
                            </div>
                          </td>
                          <td>{subAdmin.email}</td>
                          <td>
                            <button
                              onClick={() => handleStatusToggle(subAdmin._id, subAdmin.isActive)}
                              className={`btn btn-sm ${subAdmin.isActive ? 'btn-success' : 'btn-danger'}`}
                            >
                              <i className={`fas ${subAdmin.isActive ? 'fa-check' : 'fa-times'} me-1`}></i>
                              {subAdmin.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td>
                            {subAdmin.createdBy ? (
                              <div className="d-flex align-items-center">
                                {subAdmin.createdBy.image && (
                                  <img
                                    src={getImageUrl(subAdmin.createdBy.image)}
                                    alt={subAdmin.createdBy.name}
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
                                <span>{subAdmin.createdBy.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted">System</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <Link
                                to={`/dashboard/subadmins/${subAdmin._id}`}
                                className="btn btn-outline-primary btn-sm"
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </Link>
                              <Link
                                to={`/dashboard/subadmins/${subAdmin._id}/edit`}
                                className="btn btn-outline-success btn-sm"
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </Link>
                              <button
                                onClick={() => handleDelete(subAdmin._id, subAdmin.name)}
                                className="btn btn-outline-danger btn-sm"
                                title="Delete"
                                disabled={!subAdmin.isDeletable}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {subAdmins.length === 0 && !loading && (
                  <div className="text-center py-5">
                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5>No sub-admins found</h5>
                    <p className="text-muted">
                      {searchTerm 
                        ? `No sub-admins match "${searchTerm}"` 
                        : 'No sub-admins have been created yet.'
                      }
                    </p>
                    {!searchTerm && (
                      <Link
                        to="/dashboard/subadmins/create"
                        className="btn btn-primary mt-2"
                      >
                        <i className="fas fa-plus me-2"></i>
                        Create First Sub-Admin
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="d-flex justify-content-center mt-4">
                  <ul className="pagination">
                    <li className={`page-item ${currentPageLocal === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPageLocal - 1)}
                        disabled={currentPageLocal === 1}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${page === currentPageLocal ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPageLocal === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPageLocal + 1)}
                        disabled={currentPageLocal === totalPages}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubAdminList;