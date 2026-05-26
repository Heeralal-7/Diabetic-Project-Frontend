import React, { useContext, useState, useEffect } from 'react';
import { MyContext } from '../../../../Context/Context';
 
function UploadSubBrandImage() {
  const {
    brandsSub,
    loadingSub,
    errorSub,
    getAllBrandsSub,
    createBrandSub,
    updateBrandSub,
    deleteBrandSub,
    clearErrorSub
  } = useContext(MyContext);
 
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formError, setFormError] = useState('');
  // Agar backend me 'brandName' required nahi hai toh hata sakte hain,
  // par agar hai toh ye state rakhein.
  const [brandName, setBrandName] = useState('');
 
  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);
 
  const fetchBrands = async () => {
    try {
      await getAllBrandsSub();
    } catch (err) {
      console.error('Failed to load brands:', err);
    }
  };
 
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setFormError('Invalid file type. Only JPEG, PNG, WEBP, GIF images are allowed.');
        return;
      }
 
      if (file.size > 5 * 1024 * 1024) {
        setFormError('File size too large. Maximum 5MB allowed.');
        return;
      }
 
      setImageFile(file);
      setFormError('');
     
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
 
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    // Validation
    if (!imageFile && !editingBrand) {
      setFormError('Please select an image');
      return;
    }
 
    const formData = new FormData();
    // Agar backend brandName maangta hai:
    if (brandName) {
      formData.append('brandName', brandName);
    }
   
    if (imageFile) {
      formData.append('brandImage', imageFile);
    }
 
    try {
      if (editingBrand) {
        await updateBrandSub(editingBrand._id, formData);
      } else {
        await createBrandSub(formData);
      }
     
      // Success: Reset form
      setShowForm(false);
      setEditingBrand(null);
      setImageFile(null);
      setPreviewUrl('');
      setFormError('');
      setBrandName('');
     
    } catch (err) {
      console.error('Operation Error:', err);
      // Error is handled in context, but we set local form error too
      setFormError(err.message || 'Failed to process request');
    }
  };
 
  // Handle edit
  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.brandName || '');
    setPreviewUrl(brand.brandImageUrl || brand.brandImage);
    setShowForm(true);
    setFormError('');
    clearErrorSub(); // Clear any global errors
  };
 
  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand image?')) {
      try {
        await deleteBrandSub(id);
      } catch (err) {
        console.error('Delete Error:', err);
        alert(err.message || 'Failed to delete image. Please try again.');
      }
    }
  };
 
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
                  <h4 className="card-title mb-1">Brand Images Management (Subadmin)</h4>
                  <p className="text-muted mb-0">Upload and manage brand images</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-primary fs-6">
                    {brandsSub.length} {brandsSub.length === 1 ? 'Image' : 'Images'}
                  </span>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                        setShowForm(true);
                        setEditingBrand(null);
                        setPreviewUrl('');
                        setImageFile(null);
                    }}
                    disabled={loadingSub}
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
 
      {/* Global Error Display */}
      {errorSub && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error!</strong> {errorSub}
              <button
                type="button"
                className="btn-close"
                onClick={clearErrorSub}
              ></button>
            </div>
          </div>
        </div>
      )}
 
      {/* Grid */}
      <div className="row">
        {loadingSub && brandsSub.length === 0 ? (
          // Loader
          <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
          </div>
        ) : brandsSub.length === 0 ? (
          // Empty State
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-images text-muted" style={{fontSize: '3rem'}}></i>
                <h5 className="mt-3">No Images Found</h5>
              </div>
            </div>
          </div>
        ) : (
          // List
          brandsSub.map((brand) => (
            <div key={brand._id} className="col-md-6 col-lg-4 col-xl-3 mb-4">
              <div className="card shadow-sm h-100">
                <div className="position-relative" style={{height: '200px', overflow: 'hidden', backgroundColor: '#f8f9fa'}}>
                  <img
                    src={brand.brandImageUrl || brand.brandImage}
                    alt="Brand"
                    className="card-img-top h-100 object-fit-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>
               
                <div className="card-body">
                  <p className="text-muted small mb-2">
                    <i className="bi bi-clock me-1"></i>
                    {formatDate(brand.createdAt)}
                  </p>
                 
                  <div className="d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(brand)}
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(brand._id)}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
 
      {/* Modal */}
      {showForm && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingBrand ? 'Edit Image' : 'Upload Image'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger">{formError}</div>}
                 
                  {/* Image Input */}
                  <div className="mb-3">
                    <label className="form-label">Select Image</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                        // Required only if creating new
                        required={!editingBrand}
                    />
                  </div>
 
                  {/* Preview */}
                  {previewUrl && (
                    <div className="mb-3 text-center">
                        <img src={previewUrl} alt="Preview" className="img-thumbnail" style={{maxHeight: '200px'}} />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loadingSub}>
                    {loadingSub ? 'Processing...' : (editingBrand ? 'Update' : 'Upload')}
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
 
export default UploadSubBrandImage;
 