// src/ClinicPanel/Pages/ClinicAchievements.jsx
import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context';
import { toast } from 'react-toastify';

const ClinicAchievements = () => {
  const { 
    clinicAchievements, 
    getClinicAchievements, 
    uploadClinicAchievements, 
    deleteClinicAchievements,
    loading 
  } = useContext(MyContext);
  
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      await getClinicAchievements();
    } catch (error) {
      toast.error('Failed to load achievements');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    try {
      const response = await uploadClinicAchievements(selectedFiles);
      if (response.success) {
        toast.success('Achievements uploaded successfully');
        setSelectedFiles([]);
        // Clear file input
        document.getElementById('achievementFiles').value = '';
      }
    } catch (error) {
      toast.error('Failed to upload achievements');
    }
  };

  const handleDeleteImage = async (imagePath) => {
    try {
      const response = await deleteClinicAchievements(imagePath);
      if (response.success) {
        toast.success('Image deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all achievement images?')) {
      try {
        const response = await deleteClinicAchievements(null, true);
        if (response.success) {
          toast.success('All achievements deleted successfully');
        }
      } catch (error) {
        toast.error('Failed to delete achievements');
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Clinic Achievements</h1>
            {clinicAchievements.length > 0 && (
              <button 
                className="btn btn-outline-danger"
                onClick={handleDeleteAll}
              >
                <i className="bi bi-trash me-2"></i>
                Delete All
              </button>
            )}
          </div>

          {/* Upload Section */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">Upload Achievement Images</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <input
                    type="file"
                    id="achievementFiles"
                    className="form-control"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <div className="form-text">
                    You can select multiple images. Supported formats: JPG, PNG, GIF
                  </div>
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleUpload}
                    disabled={loading || selectedFiles.length === 0}
                  >
                    {loading ? 'Uploading...' : 'Upload Images'}
                  </button>
                </div>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-3">
                  <p className="text-success">
                    <i className="bi bi-info-circle me-2"></i>
                    {selectedFiles.length} file(s) selected for upload
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Achievements Gallery */}
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Achievement Gallery</h5>
              <span className="badge bg-light text-dark">
                {clinicAchievements.length} Images
              </span>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : clinicAchievements.length > 0 ? (
                <div className="row">
                  {clinicAchievements.map((imagePath, index) => (
                    <div key={index} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                      <div className="card h-100">
                        <img
                          src={`${process.env.REACT_APP_API_URL}${imagePath}`}
                          alt={`Achievement ${index + 1}`}
                          className="card-img-top"
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <div className="card-body text-center">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteImage(imagePath)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-trophy display-1 text-muted"></i>
                  <h4 className="text-muted mt-3">No Achievements Yet</h4>
                  <p className="text-muted">Upload your clinic's achievement images to showcase your success.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicAchievements;