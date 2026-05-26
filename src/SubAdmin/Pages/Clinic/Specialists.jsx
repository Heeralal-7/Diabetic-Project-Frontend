import { useState, useRef, useEffect, useContext } from 'react';
import { MyContext } from "../../../Context/Context";

function SubadminSpecialists() {
  const {
    getSubAdminSpecialists,
    createSubAdminSpecialist,
    updateSubAdminSpecialist,
    deleteSubAdminSpecialist,
    getSubAdminSpecialistStats,
    subAdminSpecialists,
    subAdminSpecialistsLoading,
    subAdminSpecialistsError
  } = useContext(MyContext);

  const [specialists, setSpecialists] = useState('');
  const [specialistImageFile, setSpecialistImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSpecialists: 0,
    limit: 10
  });
  
  // Refs
  const fileInputRef = useRef(null);

    const URL = process.env.REACT_APP_API_URL ;
  // Base URL for images - adjust according to your directory structure
  const IMAGE_BASE_URL = `${URL}/uploads/specialists/`; // Adjust this path

  // Load specialists and stats on component mount
  useEffect(() => {
    loadSpecialists();
    loadStats();
  }, []);

  const loadSpecialists = async (page = 1, limit = 10, search = "") => {
    const result = await getSubAdminSpecialists(page, limit, search);
    if (result.success) {
      setPagination(result.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalSpecialists: 0,
        limit: 10
      });
    } else {
      console.error('Failed to load specialists:', result.message);
    }
  };

  const loadStats = async () => {
    const result = await getSubAdminSpecialistStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  // Handler for file selection change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
   
    // Clear previous states
    setSpecialistImageFile(null);
    setImagePreviewUrl(null);

    if (file) {
      // Basic file type validation
      if (file.type.startsWith('image/')) {
        setSpecialistImageFile(file);
        // Create a local URL for image preview
        setImagePreviewUrl(URL.createObjectURL(file));
      } else {
        alert('Please select a valid image file (PNG, JPEG, etc.).');
        event.target.value = null; // Clear the input
      }
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, []);

  const handleUpload = async () => {
    if (!specialists.trim()) {
      alert('Please enter a specialist name');
      return;
    }
   
    if (!specialistImageFile) {
      alert('Please select a specialist image to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('specialists', specialists.trim());
      formData.append('image', specialistImageFile);

      const result = await createSubAdminSpecialist(formData);
     
      if (result.success) {
        setSpecialists('');
        setSpecialistImageFile(null);
        setImagePreviewUrl(null);
        if(fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        alert('Specialist created successfully!');
        loadSpecialists(); // Refresh list
        loadStats(); // Refresh stats
      } else {
        alert(`Failed to create specialist: ${result.message}`);
      }
     
    } catch (error) {
      console.error('Error in handleUpload:', error);
      alert('An error occurred while creating specialist');
    }
  };

  const handleEdit = (specialist) => {
    setSpecialists(specialist.specialists); // Note: field name is 'specialists' not 'name'
    setEditingId(specialist._id);
    // Show current image preview
    if (specialist.specialistImage) {
      setImagePreviewUrl(`${IMAGE_BASE_URL}${specialist.specialistImage}`);
    }
  };

  const handleUpdate = async () => {
    if (!specialists.trim() || !editingId) {
      alert('Please enter a specialist name');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('specialists', specialists.trim());
      if (specialistImageFile) {
        formData.append('image', specialistImageFile);
      }

      const result = await updateSubAdminSpecialist(editingId, formData);
     
      if (result.success) {
        setSpecialists('');
        setEditingId(null);
        setSpecialistImageFile(null);
        setImagePreviewUrl(null);
        if(fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        alert('Specialist updated successfully!');
        loadSpecialists(); // Refresh list
      } else {
        alert(`Failed to update specialist: ${result.message}`);
      }
     
    } catch (error) {
      console.error('Error in handleUpdate:', error);
      alert('An error occurred while updating specialist');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this specialist?')) {
      const result = await deleteSubAdminSpecialist(id);
      if (result.success) {
        alert('Specialist deleted successfully!');
        loadSpecialists(); // Refresh list
        loadStats(); // Refresh stats
      } else {
        alert(`Failed to delete specialist: ${result.message}`);
      }
    }
  };

  const cancelEdit = () => {
    setSpecialists('');
    setEditingId(null);
    setSpecialistImageFile(null);
    setImagePreviewUrl(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadSpecialists(newPage, pagination.limit);
    }
  };

  // Get full image URL
  const getImageUrl = (imageName) => {
    return `${IMAGE_BASE_URL}${imageName}`;
  };

  return (
    <div className="min-vh-100 bg-light p-3">
      <div className="container-fluid">
        {/* Stats Section */}
        {stats && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">Specialist Statistics</h5>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-primary bg-opacity-10 rounded-3">
                        <h3 className="text-primary mb-1">{pagination.totalSpecialists || 0}</h3>
                        <p className="text-muted mb-0">Total Specialists</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-success bg-opacity-10 rounded-3">
                        <h3 className="text-success mb-1">{stats.activeSpecialists || pagination.totalSpecialists || 0}</h3>
                        <p className="text-muted mb-0">Active Specialists</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-info bg-opacity-10 rounded-3">
                        <h3 className="text-info mb-1">{pagination.currentPage || 1}</h3>
                        <p className="text-muted mb-0">Current Page</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-3 bg-warning bg-opacity-10 rounded-3">
                        <h3 className="text-warning mb-1">{pagination.totalPages || 1}</h3>
                        <p className="text-muted mb-0">Total Pages</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row">
          {/* Create/Edit Form */}
          <div className="col-12 col-lg-5 mb-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold text-dark mb-0">
                    {editingId ? 'Edit Specialist' : 'Specialist Upload'}
                  </h1>
                </div>

                {/* Form */}
                <div className="row g-3">
                  {/* Specialist Input */}
                  <div className="col-12">
                    <label htmlFor="specialists" className="form-label fw-medium text-dark mb-2">
                      Specialist Doctor Name
                    </label>
                    <input
                      type="text"
                      className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3"
                      id="specialists"
                      placeholder="Enter specialist name"
                      value={specialists}
                      onChange={(e) => setSpecialists(e.target.value)}
                      disabled={subAdminSpecialistsLoading}
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  {/* Image Upload Input and Display */}
                  <div className="col-12">
                    <label htmlFor="specialistImageFile" className="form-label fw-medium text-dark mb-2">
                      Specialist Image
                    </label>
                    <input
                      type="file"
                      id="specialistImageFile"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/jpg, image/gif"
                      hidden
                    />
                   
                    {/* Custom File Button */}
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 py-2 rounded-3 fw-medium d-flex align-items-center justify-content-between"
                      onClick={() => !subAdminSpecialistsLoading && fileInputRef.current.click()}
                      disabled={subAdminSpecialistsLoading}
                      style={{ fontSize: '16px' }}
                    >
                      <span>
                        {specialistImageFile
                          ? specialistImageFile.name.length > 30
                            ? specialistImageFile.name.substring(0, 27) + '...'
                            : specialistImageFile.name
                          : 'Choose Image File'
                        }
                      </span>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 0 1-.708-.708l3-3z"/>
                      </svg>
                    </button>
                    {specialistImageFile && (
                      <small className="text-success mt-1 d-block">
                        File selected: {specialistImageFile.name}
                      </small>
                    )}
                  </div>
                 
                  {/* Image Preview Section */}
                  {imagePreviewUrl && (
                    <div className="col-12 mt-3 text-center">
                      <label className="form-label fw-medium text-dark mb-2">
                        Image Preview
                      </label>
                      <div className="border rounded-3 p-2 bg-white">
                        <img
                          src={imagePreviewUrl}
                          alt="Specialist Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            objectFit: 'contain'
                          }}
                          className="img-fluid rounded-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="col-12 mt-4">
                    {editingId ? (
                      <div className="row g-2">
                        <div className="col-6">
                          <button
                            type="button"
                            className="btn btn-success w-100 py-3 rounded-3 fw-medium"
                            onClick={handleUpdate}
                            disabled={subAdminSpecialistsLoading}
                            style={{ fontSize: '16px' }}
                          >
                            {subAdminSpecialistsLoading ? 'Updating...' : 'Update Specialist'}
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            type="button"
                            className="btn btn-secondary w-100 py-3 rounded-3 fw-medium"
                            onClick={cancelEdit}
                            disabled={subAdminSpecialistsLoading}
                            style={{ fontSize: '16px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary w-100 py-3 rounded-3 fw-medium"
                        onClick={handleUpload}
                        disabled={subAdminSpecialistsLoading}
                        style={{ fontSize: '16px' }}
                      >
                        {subAdminSpecialistsLoading ? (
                          <>
                            <div
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              style={{ width: '16px', height: '16px' }}
                            >
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg
                              width="20"
                              height="20"
                              fill="currentColor"
                              className="me-2"
                              viewBox="0 0 16 16"
                            >
                              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 0 1-.708-.708l3-3z"/>
                            </svg>
                            Upload Specialist
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specialists List */}
          <div className="col-12 col-lg-7">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Specialists List ({pagination.totalSpecialists})</h5>
                  <div>
                    <button 
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() => loadSpecialists()}
                      disabled={subAdminSpecialistsLoading}
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {subAdminSpecialistsError && (
                  <div className="alert alert-danger" role="alert">
                    {subAdminSpecialistsError}
                  </div>
                )}

                {subAdminSpecialistsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : subAdminSpecialists && subAdminSpecialists.length > 0 ? (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subAdminSpecialists.map((specialist) => (
                            <tr key={specialist._id}>
                              <td>
                                {specialist.specialistImage && (
                                  <img
                                    src={getImageUrl(specialist.specialistImage)}
                                    alt={specialist.specialists}
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      objectFit: 'cover',
                                      borderRadius: '8px'
                                    }}
                                    onError={(e) => {
                                      e.target.src = '/placeholder-image.jpg'; // Fallback image
                                    }}
                                  />
                                )}
                              </td>
                              <td className="align-middle fw-medium">{specialist.specialists}</td>
                              <td className="align-middle">
                                {new Date(specialist.createdAt).toLocaleDateString()}
                              </td>
                              <td className="align-middle">
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => handleEdit(specialist)}
                                    disabled={subAdminSpecialistsLoading}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDelete(specialist._id)}
                                    disabled={subAdminSpecialistsLoading}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div>
                          <small className="text-muted">
                            Page {pagination.currentPage} of {pagination.totalPages}
                          </small>
                        </div>
                        <div className="btn-group">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1 || subAdminSpecialistsLoading}
                          >
                            Previous
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages || subAdminSpecialistsLoading}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">No specialists found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubadminSpecialists;