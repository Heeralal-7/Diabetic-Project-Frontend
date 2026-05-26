import React, { useContext, useState, useEffect } from 'react';
import { MyContext } from '../../../../Context/Context';

function UploadBrandImage() {
  const { 
    brandsAdmin, 
    loadingBrandAdmin, 
    errorBrandAdmin, 
    getAllBrandsAdmin, 
    createBrand, 
    updateBrand, 
    deleteBrand 
  } = useContext(MyContext);

  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      await getAllBrandsAdmin();
    } catch (err) {
      console.error('Failed to load brands:', err);
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setFormError('Invalid file type. Only JPEG, PNG, WEBP, GIF images are allowed.');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError('File size too large. Maximum 5MB allowed.');
        return;
      }

      setImageFile(file);
      setFormError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission - FIXED TOKEN ISSUE
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile && !editingBrand) {
      setFormError('Please select an image');
      return;
    }

    const formData = new FormData();
    if (imageFile) {
      formData.append('brandImage', imageFile);
    }

    try {
      if (editingBrand) {
        await updateBrand(editingBrand._id, formData);
      } else {
        await createBrand(formData);
      }
      
      // Reset form
      setShowForm(false);
      setEditingBrand(null);
      setImageFile(null);
      setPreviewUrl('');
      setFormError('');
      
      // Refresh brands list
      fetchBrands();
      
    } catch (err) {
      console.error('Error:', err);
      setFormError(err.message || 'Failed to upload image');
    }
  };

  // Handle edit
  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setPreviewUrl(brand.brandImageUrl || brand.brandImage);
    setShowForm(true);
    setFormError('');
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand image?')) {
      try {
        await deleteBrand(id);
        fetchBrands();
      } catch (err) {
        console.error('Error deleting:', err);
        alert('Failed to delete image. Please try again.');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="card-title mb-1">Brand Images Management</h4>
                  <p className="text-muted mb-0">Upload and manage brand images for pharmacy</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-primary fs-6">
                    {brandsAdmin.length} {brandsAdmin.length === 1 ? 'Image' : 'Images'}
                  </span>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowForm(true)}
                  >
                    <i className="bi bi-cloud-upload me-2"></i>
                    Upload New Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errorBrandAdmin && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error!</strong> {errorBrandAdmin}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {}}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* BrandsAdmin Grid */}
      <div className="row">
        {loadingBrandAdmin && brandsAdmin.length === 0 ? (
          // Loading Skeleton
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="col-md-6 col-lg-4 col-xl-3 mb-4">
              <div className="card shadow-sm">
                <div className="placeholder-glow">
                  <div className="placeholder bg-secondary" style={{height: '200px'}}></div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mt-3">
                      <button className="btn btn-outline-primary disabled placeholder col-5"></button>
                      <button className="btn btn-outline-danger disabled placeholder col-5"></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : brandsAdmin.length === 0 ? (
          // Empty State
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-image text-muted" style={{fontSize: '4rem'}}></i>
                </div>
                <h5 className="card-title mb-3">No Brand Images Found</h5>
                <p className="text-muted mb-4">Get started by uploading your first brand image</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  <i className="bi bi-cloud-upload me-2"></i>
                  Upload Image
                </button>
              </div>
            </div>
          </div>
        ) : (
          // BrandsAdmin Cards
          brandsAdmin.map((brand) => (
            <div key={brand._id} className="col-md-6 col-lg-4 col-xl-3 mb-4">
              <div className="card shadow-sm h-100">
                {/* Image */}
                <div className="position-relative" style={{height: '200px', overflow: 'hidden'}}>
                  <img 
                    src={brand.brandImageUrl || brand.brandImage} 
                    alt="Brand" 
                    className="card-img-top h-100 object-fit-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200/cccccc/969696?text=Image+Error';
                    }}
                  />
                  <span className="badge bg-success position-absolute top-0 end-0 m-2">
                    Active
                  </span>
                </div>
                
                {/* Card Body */}
                <div className="card-body d-flex flex-column">
                  {/* Upload Date - Only this info shows now */}
                  <div className="d-flex align-items-center text-muted mb-3">
                    <i className="bi bi-calendar me-2"></i>
                    <small>{formatDate(brand.createdAt)}</small>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-auto d-flex justify-content-between">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleEdit(brand)}
                      disabled={loadingBrandAdmin}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </button>
                    
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(brand._id)}
                      disabled={loadingBrandAdmin}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload/Edit Modal */}
      {showForm && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingBrand ? 'Edit Brand Image' : 'Upload New Brand Image'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBrand(null);
                    setImageFile(null);
                    setPreviewUrl('');
                    setFormError('');
                  }}
                ></button>
              </div>
              
              {/* Modal Body */}
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Form Error Display */}
                  {formError && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                      <strong>Error!</strong> {formError}
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setFormError('')}
                      ></button>
                    </div>
                  )}
                  
                  {/* Image Upload */}
                  <div className="mb-3">
                    <label className="form-label">Brand Image *</label>
                    
                    {previewUrl ? (
                      <div className="text-center mb-3">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="img-fluid rounded mb-2"
                          style={{maxHeight: '250px'}}
                        />
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setImageFile(null);
                            setPreviewUrl('');
                          }}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="border rounded p-5 text-center"
                        style={{borderStyle: 'dashed', cursor: 'pointer'}}
                        onClick={() => document.getElementById('imageInput').click()}
                      >
                        <i className="bi bi-cloud-upload display-6 text-muted mb-3"></i>
                        <p className="text-muted mb-2">Click to upload image</p>
                        <p className="text-muted small">JPEG, PNG, WEBP, GIF up to 5MB</p>
                      </div>
                    )}
                    
                    <input 
                      id="imageInput"
                      type="file" 
                      className="form-control d-none"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>

                  {/* Help Text */}
                  <div className="text-muted small">
                    <p className="mb-1"><i className="bi bi-info-circle me-1"></i> Supported formats: JPEG, JPG, PNG, WEBP, GIF</p>
                    <p className="mb-0"><i className="bi bi-info-circle me-1"></i> Maximum file size: 5MB</p>
                  </div>
                </div>
                
                {/* Modal Footer */}
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingBrand(null);
                      setImageFile(null);
                      setPreviewUrl('');
                      setFormError('');
                    }}
                    disabled={loadingBrandAdmin}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loadingBrandAdmin || (!imageFile && !editingBrand)}
                  >
                    {loadingBrandAdmin ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {editingBrand ? 'Updating...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <i className={editingBrand ? 'bi bi-check-circle me-2' : 'bi bi-cloud-upload me-2'}></i>
                        {editingBrand ? 'Update Image' : 'Upload Image'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}

export default UploadBrandImage;
