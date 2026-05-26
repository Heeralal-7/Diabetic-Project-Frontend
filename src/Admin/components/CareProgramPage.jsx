import React, { useContext, useEffect, useState, useRef } from "react";
import { MyContext } from "../../Context/Context"; 
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "bootstrap"; 

const CareProgramAdmin = () => {
  const { 
      careProgramData, 
      carePageLoading, 
      carePageError,
      fetchCareProgramData,
      updateCareProgram, 
      addItemToSection, 
      deleteItemFromSection,
      updateIndividualItem
  } = useContext(MyContext);

  const URL = process.env.REACT_APP_API_URL;

  // Get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === "") {
      return "https://via.placeholder.com/300x200?text=No+Image";
    }
    
    if (imagePath.startsWith('http') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    if (imagePath.includes(URL)) {
      return imagePath;
    }
    
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${URL}${cleanPath}`;
  };

  // --- LOCAL STATE ---
  const [formData, setFormData] = useState(null);
  const [mainFiles, setMainFiles] = useState({});
  const [activeTab, setActiveTab] = useState("stats");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- MODAL STATE ---
  const [newDoctor, setNewDoctor] = useState({ 
    name: "", 
    testimonial: "", 
    location: "", 
    bgColor: "#e7faf8", 
    borderColor: "success",
    image: null,
    imagePreview: null
  });
  
  const [newFeature, setNewFeature] = useState({ 
    title: "", 
    description: "", 
    number: "", 
    image: null,
    imagePreview: null
  });
  
  const [newStat, setNewStat] = useState({ 
    value: "", 
    label: "", 
    color: "primary" 
  });

  // State for image previews in existing items
  const [doctorImagePreviews, setDoctorImagePreviews] = useState({});
  const [featureImagePreviews, setFeatureImagePreviews] = useState({});

  const docModalRef = useRef(null);
  const featModalRef = useRef(null);

  // Sync Data when fetched
  useEffect(() => {
    if (careProgramData) {
      console.log("Setting formData from fetched data:", careProgramData);
      setFormData(careProgramData);
    }
  }, [careProgramData]);

  // Initial fetch
  useEffect(() => {
    console.log("Loading data from API...");
    console.log("API URL:", `${URL}/care-program/get-all`);
    
    fetchCareProgramData();
  }, []);

  // --- HANDLERS ---
  const handleTextChange = (section, key, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const handleNestedChange = (section, nestedKey, key, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedKey]: {
          ...prev[section][nestedKey],
          [key]: value
        }
      }
    }));
  };

  const handleArrayChange = (section, arrayName, index, key, value) => {
    if (!formData || !formData[section] || !formData[section][arrayName]) return;
    
    const updatedArray = [...formData[section][arrayName]];
    
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.');
      updatedArray[index] = { 
        ...updatedArray[index], 
        [parentKey]: {
          ...updatedArray[index][parentKey],
          [childKey]: value
        }
      };
    } else {
      updatedArray[index] = { 
        ...updatedArray[index], 
        [key]: value 
      };
    }
    
    setFormData(prev => ({
      ...prev,
      [section]: { 
        ...prev[section], 
        [arrayName]: updatedArray 
      }
    }));
  };

  // Handle image preview for new doctor
  const handleNewDoctorImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDoctor({
          ...newDoctor,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image preview for new feature
  const handleNewFeatureImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFeature({
          ...newFeature,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image preview for existing doctor
  const handleExistingDoctorImageChange = (e, doctorId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctorImagePreviews(prev => ({
          ...prev,
          [doctorId]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image preview for existing feature
  const handleExistingFeatureImageChange = (e, featureId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeatureImagePreviews(prev => ({
          ...prev,
          [featureId]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Get image for existing item (with preview)
  const getExistingImage = (item, type, id) => {
    // Check if we have a preview image
    if (type === 'doctor' && doctorImagePreviews[id]) {
      return doctorImagePreviews[id];
    }
    if (type === 'feature' && featureImagePreviews[id]) {
      return featureImagePreviews[id];
    }
    
    // Otherwise return the actual image URL
    return getImageUrl(item.image?.url);
  };

  // Global save - Save ALL changes at once
  const handleGlobalSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData) return;
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = new FormData();
      dataToSend.append("data", JSON.stringify(formData));
      
      if (mainFiles.bannerImage) {
        dataToSend.append("bannerImage", mainFiles.bannerImage);
      }
      if (mainFiles.sideImage) {
        dataToSend.append("sideImage", mainFiles.sideImage);
      }

      console.log("Saving all data...");
      
      await updateCareProgram(dataToSend);
      
      setMainFiles({});
      
      // Refresh data
      await fetchCareProgramData();
      
      alert("All changes saved successfully!");
      
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new doctor
  const handleAddDoctor = async () => {
    if (!newDoctor.name.trim()) {
      alert("Doctor name is required!");
      return;
    }

    const fd = new FormData();
    fd.append("data", JSON.stringify({
      name: newDoctor.name,
      testimonial: newDoctor.testimonial,
      location: newDoctor.location,
      bgColor: newDoctor.bgColor,
      borderColor: newDoctor.borderColor
    }));
    
    if (newDoctor.image) {
      fd.append("image", newDoctor.image);
    }

    try {
      await addItemToSection("doctor", fd);
      setNewDoctor({ 
        name: "", 
        testimonial: "", 
        location: "", 
        bgColor: "#e7faf8", 
        borderColor: "success",
        image: null,
        imagePreview: null
      });
      
      // Clear preview states
      setDoctorImagePreviews({});
      
      // Manually hide modal
      const modalElement = document.getElementById('addDoctorModal');
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }
      
      // Remove backdrop
      const backdrops = document.getElementsByClassName('modal-backdrop');
      while(backdrops.length > 0) {
        backdrops[0].parentNode.removeChild(backdrops[0]);
      }
      
      // Enable scrolling
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert("Failed to add doctor. Please try again.");
    }
  };

  // Add new feature
  const handleAddFeature = async () => {
    if (!newFeature.title.trim()) {
      alert("Feature title is required!");
      return;
    }

    const fd = new FormData();
    fd.append("data", JSON.stringify({ 
      title: newFeature.title, 
      description: newFeature.description, 
      number: newFeature.number
    }));
    
    if (newFeature.image) {
      fd.append("image", newFeature.image);
    }

    try {
      await addItemToSection("feature", fd);
      setNewFeature({ 
        title: "", 
        description: "", 
        number: "", 
        image: null,
        imagePreview: null
      });
      
      // Clear preview states
      setFeatureImagePreviews({});
      
      // Manually hide modal
      const modalElement = document.getElementById('addFeatureModal');
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }
      
      // Remove backdrop
      const backdrops = document.getElementsByClassName('modal-backdrop');
      while(backdrops.length > 0) {
        backdrops[0].parentNode.removeChild(backdrops[0]);
      }
      
      // Enable scrolling
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
    } catch (error) {
      console.error("Error adding feature:", error);
      alert("Failed to add feature. Please try again.");
    }
  };

  // Add new stat
  const handleAddStat = async () => {
    if (!newStat.value.trim()) {
      alert("Stat value is required!");
      return;
    }

    try {
      await addItemToSection("stat", { stat: newStat });
      setNewStat({ value: "", label: "", color: "primary" });
      
    } catch (error) {
      console.error("Error adding stat:", error);
      alert("Failed to add stat. Please try again.");
    }
  };

  // Update individual doctor/feature with image
  const handleUpdateItem = async (type, id, itemData, index) => {
    const fd = new FormData();
    
    if (type === 'doctor') fd.append('doctorId', id);
    if (type === 'feature') fd.append('featureId', id);
    if (type === 'stat') fd.append('statId', id);

    // Add all form data except image
    Object.keys(itemData).forEach(key => {
      if (key !== 'image' && key !== '_id' && key !== '__v' && key !== 'file' && key !== 'imagePreview') {
        if (typeof itemData[key] === 'object') {
          fd.append(key, JSON.stringify(itemData[key]));
        } else {
          fd.append(key, itemData[key]);
        }
      }
    });

    // Add image if selected
    if (type === 'doctor') {
      const fileInput = document.getElementById(`doctor-image-${id || index}`);
      if (fileInput && fileInput.files[0]) {
        fd.append("image", fileInput.files[0]);
      }
    }
    
    if (type === 'feature') {
      const fileInput = document.getElementById(`feature-image-${id || index}`);
      if (fileInput && fileInput.files[0]) {
        fd.append("image", fileInput.files[0]);
      }
    }

    try {
      await updateIndividualItem(type, fd);
      
      // Clear the preview after successful update
      if (type === 'doctor') {
        setDoctorImagePreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[id];
          return newPreviews;
        });
      }
      if (type === 'feature') {
        setFeatureImagePreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[id];
          return newPreviews;
        });
      }
      
      // Refresh data to show updated image
      await fetchCareProgramData();
      
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      alert(`Failed to update ${type}. Please try again.`);
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      await deleteItemFromSection(type, id);
      
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}. Please try again.`);
    }
  };

  const handleRefreshData = async () => {
    console.log("Manual refresh requested");
    await fetchCareProgramData();
  };

  // Fix for modal backdrop issue
  const handleModalClose = (modalId) => {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
    
    // Remove backdrop
    setTimeout(() => {
      const backdrops = document.getElementsByClassName('modal-backdrop');
      while(backdrops.length > 0) {
        backdrops[0].parentNode.removeChild(backdrops[0]);
      }
      
      // Enable scrolling
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 300);
  };

  // --- RENDER FUNCTIONS ---

  // Loading state
  if (carePageLoading && !formData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 fs-5">Loading Care Program Admin...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (carePageError) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow-lg">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3 fs-3"></i>
            <div>
              <h4 className="alert-heading">⚠️ Error Loading Data</h4>
              <p className="mb-1"><strong>Error:</strong> {carePageError}</p>
              <hr />
              <p className="mb-0">Please check if backend server is running.</p>
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-outline-danger" onClick={handleRefreshData}>
              <i className="bi bi-arrow-clockwise me-2"></i>Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!formData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4><i className="bi bi-exclamation-triangle me-2"></i>No Data Available</h4>
          <p>The server returned success but no data was loaded.</p>
          <div className="mt-3">
            <button className="btn btn-warning" onClick={handleRefreshData}>
              <i className="bi bi-arrow-clockwise me-2"></i>Refresh Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container bg-white rounded shadow-lg p-4">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <div>
            <h3 className="text-primary m-0">
              <i className="bi bi-heart-pulse me-2"></i>
              Care Program Admin
            </h3>
            <small className="text-muted">Manage your diabetes care program content</small>
            
          </div>
          <div className="d-flex gap-3 align-items-center">
            <div className="btn-group">
              <button 
                className="btn btn-primary d-flex align-items-center"
                onClick={handleGlobalSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    Save All Changes
                  </>
                )}
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={handleRefreshData}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Removed Hero, CTA, SEO */}
        <ul className="nav nav-tabs mb-4" id="adminTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <i className="bi bi-bar-chart me-1"></i> Stats
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'doctors' ? 'active' : ''}`}
              onClick={() => setActiveTab('doctors')}
            >
              <i className="bi bi-people me-1"></i> Doctors
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              <i className="bi bi-stars me-1"></i> Features
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content p-3 border rounded bg-light">
          
          {/* STATS SECTION */}
          {activeTab === 'stats' && (
            <div className="tab-pane fade show active">
              <div className="mb-4">
                <label className="form-label fw-bold">Section Title</label>
                <input 
                  type="text" 
                  className="form-control mb-3"
                  value={formData.statsSection?.title || ""}
                  onChange={(e) => handleTextChange("statsSection", "title", e.target.value)}
                  placeholder="Why Members Choose Us?"
                />
              </div>
              
              <div className="mb-4">
                <h5>Statistics List ({formData.statsSection?.stats?.length || 0})</h5>
                {!formData.statsSection?.stats || formData.statsSection.stats.length === 0 ? (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No statistics added yet. Add your first stat below.
                  </div>
                ) : (
                  <div className="row g-3">
                    {formData.statsSection.stats.map((stat, index) => (
                      <div className="col-md-4" key={stat._id || `stat-${index}`}>
                        <div className="card h-100 border-primary">
                          <div className="card-body">
                            <div className="mb-2">
                              <label className="form-label small">Value</label>
                              <input 
                                type="text" 
                                className="form-control form-control-sm"
                                value={stat.value || ""}
                                onChange={(e) => handleArrayChange("statsSection", "stats", index, "value", e.target.value)}
                                placeholder="50k+"
                              />
                            </div>
                            
                            <div className="mb-2">
                              <label className="form-label small">Label</label>
                              <input 
                                type="text" 
                                className="form-control form-control-sm"
                                value={stat.label || ""}
                                onChange={(e) => handleArrayChange("statsSection", "stats", index, "label", e.target.value)}
                                placeholder="Consultation Done"
                              />
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label small">Color</label>
                              <select 
                                className="form-select form-select-sm"
                                value={stat.color || "primary"}
                                onChange={(e) => handleArrayChange("statsSection", "stats", index, "color", e.target.value)}
                              >
                                <option value="primary">Blue (Primary)</option>
                                <option value="success">Green (Success)</option>
                                <option value="warning">Yellow (Warning)</option>
                                <option value="danger">Red (Danger)</option>
                                <option value="info">Cyan (Info)</option>
                                <option value="dark">Dark</option>
                              </select>
                            </div>
                            
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteItem("stat", stat._id)}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Add New Stat Form */}
              <div className="card border-success">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add New Statistic
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Value *</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={newStat.value}
                        onChange={(e) => setNewStat({...newStat, value: e.target.value})}
                        placeholder="50k+"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Label</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={newStat.label}
                        onChange={(e) => setNewStat({...newStat, label: e.target.value})}
                        placeholder="Consultation Done"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Color</label>
                      <select 
                        className="form-select"
                        value={newStat.color}
                        onChange={(e) => setNewStat({...newStat, color: e.target.value})}
                      >
                        <option value="primary">Blue</option>
                        <option value="success">Green</option>
                        <option value="warning">Yellow</option>
                        <option value="danger">Red</option>
                        <option value="info">Cyan</option>
                      </select>
                    </div>
                    <div className="col-md-1 d-flex align-items-end">
                      <button 
                        className="btn btn-success w-100"
                        onClick={handleAddStat}
                      >
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCTORS SECTION */}
          {activeTab === 'doctors' && (
            <div className="tab-pane fade show active">
            
              
              {/* Side Image */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Side Image</h5>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-4 text-center">
                      {formData.doctorSlider?.sideImage?.url ? (
                        <img 
                          src={getImageUrl(formData.doctorSlider.sideImage.url)}
                          className="img-fluid rounded"
                          style={{maxHeight: '150px'}}
                          alt={formData.doctorSlider.sideImage.altText || "Side image"}
                        />
                      ) : (
                        <div className="border rounded p-4 bg-light">
                          <i className="bi bi-image text-muted display-4"></i>
                          <p className="mt-2 text-muted small">No side image</p>
                        </div>
                      )}
                    </div>
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label">Upload New Side Image</label>
                        <input 
                          type="file" 
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => setMainFiles(prev => ({
                            ...prev, 
                            sideImage: e.target.files[0]
                          }))}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Alt Text</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={formData.doctorSlider?.sideImage?.altText || ""}
                          onChange={(e) => handleNestedChange("doctorSlider", "sideImage", "altText", e.target.value)}
                          placeholder="Side image description"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Doctors List */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Doctors List ({formData.doctorSlider?.doctors?.length || 0})</h5>
                  <button 
                    className="btn btn-success"
                    data-bs-toggle="modal"
                    data-bs-target="#addDoctorModal"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add New Doctor
                  </button>
                </div>
                
                {!formData.doctorSlider?.doctors || formData.doctorSlider.doctors.length === 0 ? (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No doctors added yet. Add your first doctor above.
                  </div>
                ) : (
                  <div className="row g-3">
                    {formData.doctorSlider.doctors.map((doctor, index) => (
                      <div className="col-md-6" key={doctor._id || `doctor-${index}`}>
                        <div className="card h-100">
                          <div className="card-body">
                            <div className="d-flex gap-3">
                              {/* Doctor Image */}
                              <div className="text-center" style={{width: '120px'}}>
                                <div className="mb-2">
                                  <img 
                                    src={getExistingImage(doctor, 'doctor', doctor._id || index)}
                                    className="rounded-circle"
                                    width="80"
                                    height="80"
                                    style={{objectFit: 'cover', border: '2px solid #0d6efd'}}
                                    alt={doctor.name}
                                    onError={(e) => {
                                      e.target.src = "https://via.placeholder.com/100?text=Doctor";
                                    }}
                                  />
                                </div>
                                <div className="d-flex flex-column gap-1">
                                  <input 
                                    type="file" 
                                    className="form-control form-control-sm" 
                                    id={`doctor-image-${doctor._id || index}`}
                                    accept="image/*"
                                    onChange={(e) => handleExistingDoctorImageChange(e, doctor._id || index)}
                                  />
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleUpdateItem('doctor', doctor._id, doctor, index)}
                                  >
                                    Update Image
                                  </button>
                                </div>
                              </div>
                              
                              {/* Doctor Info */}
                              <div className="flex-grow-1">
                                <div className="mb-2">
                                  <label className="form-label small">Name</label>
                                  <input 
                                    type="text" 
                                    className="form-control form-control-sm"
                                    value={doctor.name || ""}
                                    onChange={(e) => handleArrayChange("doctorSlider", "doctors", index, "name", e.target.value)}
                                    placeholder="Dr. Name"
                                  />
                                </div>
                                
                                <div className="mb-2">
                                  <label className="form-label small">Testimonial</label>
                                  <textarea 
                                    className="form-control form-control-sm"
                                    rows="2"
                                    value={doctor.testimonial || ""}
                                    onChange={(e) => handleArrayChange("doctorSlider", "doctors", index, "testimonial", e.target.value)}
                                    placeholder="Doctor's testimonial..."
                                  />
                                </div>
                                
                                <div className="mb-2">
                                  <label className="form-label small">Location</label>
                                  <input 
                                    type="text" 
                                    className="form-control form-control-sm"
                                    value={doctor.location || ""}
                                    onChange={(e) => handleArrayChange("doctorSlider", "doctors", index, "location", e.target.value)}
                                    placeholder="Location"
                                  />
                                </div>
                                
                                <div className="mt-3 d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleUpdateItem('doctor', doctor._id, doctor, index)}
                                  >
                                    <i className="bi bi-save me-1"></i>
                                    Save Changes
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteItem("doctor", doctor._id)}
                                  >
                                    <i className="bi bi-trash"></i> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FEATURES SECTION */}
          {activeTab === 'features' && (
            <div className="tab-pane fade show active">
              <div className="mb-4">
                <label className="form-label fw-bold">Section Title</label>
                <input 
                  type="text" 
                  className="form-control mb-3"
                  value={formData.programFeatures?.title || ""}
                  onChange={(e) => handleTextChange("programFeatures", "title", e.target.value)}
                  placeholder="Features"
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label fw-bold">Section Description</label>
                <textarea 
                  className="form-control mb-3"
                  rows="3"
                  value={formData.programFeatures?.description || ""}
                  onChange={(e) => handleTextChange("programFeatures", "description", e.target.value)}
                  placeholder="Describe your features..."
                />
              </div>
              
              {/* Features List */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Features List ({formData.programFeatures?.features?.length || 0})</h5>
                  <button 
                    className="btn btn-success"
                    data-bs-toggle="modal"
                    data-bs-target="#addFeatureModal"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add New Feature
                  </button>
                </div>
                
                {!formData.programFeatures?.features || formData.programFeatures.features.length === 0 ? (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No features added yet. Add your first feature above.
                  </div>
                ) : (
                  <div className="row g-3">
                    {formData.programFeatures.features.map((feature, index) => (
                      <div className="col-md-6" key={feature._id || `feature-${index}`}>
                        <div className="card h-100">
                          <div className="card-body">
                            <div className="d-flex gap-3">
                              {/* Feature Image */}
                              <div className="text-center" style={{width: '120px'}}>
                                <div className="mb-2">
                                  <img 
                                    src={getExistingImage(feature, 'feature', feature._id || index)}
                                    className="rounded"
                                    width="80"
                                    height="80"
                                    style={{objectFit: 'cover', border: '2px solid #198754'}}
                                    alt={feature.title}
                                    onError={(e) => {
                                      e.target.src = "https://via.placeholder.com/80?text=Feature";
                                    }}
                                  />
                                </div>
                                <div className="d-flex flex-column gap-1">
                                  <input 
                                    type="file" 
                                    className="form-control form-control-sm" 
                                    id={`feature-image-${feature._id || index}`}
                                    accept="image/*"
                                    onChange={(e) => handleExistingFeatureImageChange(e, feature._id || index)}
                                  />
                                  <button 
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleUpdateItem('feature', feature._id, feature, index)}
                                  >
                                    Update Image
                                  </button>
                                </div>
                              </div>
                              
                              {/* Feature Info */}
                              <div className="flex-grow-1">
                                <div className="mb-2">
                                  <label className="form-label small">Feature Number</label>
                                  <input 
                                    type="text" 
                                    className="form-control form-control-sm"
                                    value={feature.number || ""}
                                    onChange={(e) => handleArrayChange("programFeatures", "features", index, "number", e.target.value)}
                                    placeholder="1"
                                  />
                                </div>
                                
                                <div className="mb-2">
                                  <label className="form-label small">Title</label>
                                  <input 
                                    type="text" 
                                    className="form-control form-control-sm"
                                    value={feature.title || ""}
                                    onChange={(e) => handleArrayChange("programFeatures", "features", index, "title", e.target.value)}
                                    placeholder="Feature title"
                                  />
                                </div>
                                
                                <div className="mb-2">
                                  <label className="form-label small">Description</label>
                                  <textarea 
                                    className="form-control form-control-sm"
                                    rows="2"
                                    value={feature.description || ""}
                                    onChange={(e) => handleArrayChange("programFeatures", "features", index, "description", e.target.value)}
                                    placeholder="Feature description..."
                                  />
                                </div>
                                
                                <div className="mt-3 d-flex gap-2">
                                  <button 
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleUpdateItem('feature', feature._id, feature, index)}
                                  >
                                    <i className="bi bi-save me-1"></i>
                                    Save Changes
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteItem("feature", feature._id)}
                                  >
                                    <i className="bi bi-trash"></i> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODALS */}

        {/* Add Doctor Modal */}
        <div className="modal fade" id="addDoctorModal" ref={docModalRef} tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Add New Doctor</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => handleModalClose('addDoctorModal')}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Doctor Name *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Location</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={newDoctor.location}
                      onChange={(e) => setNewDoctor({...newDoctor, location: e.target.value})}
                      placeholder="New Delhi, India"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Testimonial</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={newDoctor.testimonial}
                      onChange={(e) => setNewDoctor({...newDoctor, testimonial: e.target.value})}
                      placeholder="Doctor's testimonial..."
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Doctor Photo</label>
                    <input 
                      type="file" 
                      className="form-control"
                      accept="image/*"
                      onChange={handleNewDoctorImageChange}
                    />
                    {newDoctor.imagePreview && (
                      <div className="mt-2">
                        <p className="small text-muted mb-1">Image Preview:</p>
                        <img 
                          src={newDoctor.imagePreview}
                          alt="Preview"
                          className="img-thumbnail"
                          style={{maxWidth: '150px', maxHeight: '150px'}}
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    {newDoctor.imagePreview ? (
                      <div className="mt-4 pt-4">
                        <p className="text-success">
                          <i className="bi bi-check-circle me-2"></i>
                          Image selected
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4">
                        <div className="border rounded p-4 text-center">
                          <i className="bi bi-person-bounding-box text-muted display-4"></i>
                          <p className="mt-2 text-muted small">Doctor image preview will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => handleModalClose('addDoctorModal')}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleAddDoctor}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Doctor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Feature Modal */}
        <div className="modal fade" id="addFeatureModal" ref={featModalRef} tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Add New Feature</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => handleModalClose('addFeatureModal')}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Feature Number</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={newFeature.number}
                      onChange={(e) => setNewFeature({...newFeature, number: e.target.value})}
                      placeholder="1"
                    />
                  </div>
                  <div className="col-md-9">
                    <label className="form-label">Title *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={newFeature.title}
                      onChange={(e) => setNewFeature({...newFeature, title: e.target.value})}
                      placeholder="Personalized Diet Plan"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={newFeature.description}
                      onChange={(e) => setNewFeature({...newFeature, description: e.target.value})}
                      placeholder="Describe this feature..."
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Feature Image</label>
                    <input 
                      type="file" 
                      className="form-control"
                      accept="image/*"
                      onChange={handleNewFeatureImageChange}
                    />
                    {newFeature.imagePreview && (
                      <div className="mt-2">
                        <p className="small text-muted mb-1">Image Preview:</p>
                        <img 
                          src={newFeature.imagePreview}
                          alt="Preview"
                          className="img-thumbnail"
                          style={{maxWidth: '150px', maxHeight: '150px'}}
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    {newFeature.imagePreview ? (
                      <div className="mt-4 pt-4">
                        <p className="text-success">
                          <i className="bi bi-check-circle me-2"></i>
                          Image selected
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4">
                        <div className="border rounded p-4 text-center">
                          <i className="bi bi-image text-muted display-4"></i>
                          <p className="mt-2 text-muted small">Feature image preview will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => handleModalClose('addFeatureModal')}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={handleAddFeature}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Feature
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CareProgramAdmin;
