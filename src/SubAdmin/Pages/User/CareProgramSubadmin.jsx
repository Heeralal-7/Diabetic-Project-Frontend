import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../../Context/Context"; 
import "bootstrap/dist/css/bootstrap.min.css";

const CareProgramAdminSub = () => {
  const { 
      careProgramDataSub, 
      carePageLoadingSub, 
      carePageErrorSub,
      fetchCareProgramDataSub,
      updateCareProgramSub, 
      addItemToSectionSub, 
      deleteItemFromSectionSub,
      updateIndividualItemSub
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
  
  // Image previews and files state
  const [imagePreviews, setImagePreviews] = useState({});
  const [imageFiles, setImageFiles] = useState({});

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

  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  // Sync Data when fetched
  useEffect(() => {
    if (careProgramDataSub) {
      console.log("🔥 Setting formData from fetched sub-admin data:", careProgramDataSub);
      console.log("📊 Stats Data Structure:", {
        statsSection: careProgramDataSub.statsSection,
        stats: careProgramDataSub.stats,
        statistics: careProgramDataSub.statistics,
        allKeys: Object.keys(careProgramDataSub)
      });
      
      // Format the data properly for stats - SAME AS ADMIN
      const formattedData = { ...careProgramDataSub };
      
      // Ensure statsSection structure exists (same as admin)
      if (!formattedData.statsSection) {
        formattedData.statsSection = {
          title: "Why Members Choose Us?",
          stats: []
        };
      }
      
      // Move stats to statsSection if they exist at root level
      if (formattedData.stats && Array.isArray(formattedData.stats)) {
        formattedData.statsSection.stats = [...formattedData.stats];
      }
      else if (formattedData.statistics && Array.isArray(formattedData.statistics)) {
        formattedData.statsSection.stats = [...formattedData.statistics];
      }
      
      setFormData(formattedData);
    }
  }, [careProgramDataSub]);

  // Initial fetch
  useEffect(() => {
    console.log("Loading sub-admin data from API...");
    console.log("API URL:", `${URL}/care/sub/get-all`);
    
    fetchCareProgramDataSub();
  }, []);

  // --- HELPER FUNCTIONS ---
  
  // Get stats from correct location - SAME AS ADMIN
  const getStatsData = () => {
    if (!formData) return [];
    
    // Check in statsSection.stats (same as admin)
    if (formData.statsSection?.stats && Array.isArray(formData.statsSection.stats)) {
      return formData.statsSection.stats;
    }
    
    // Check in root level stats
    if (formData.stats && Array.isArray(formData.stats)) {
      return formData.stats;
    }
    
    return [];
  };

  // Get stats title - SAME AS ADMIN
  const getStatsTitle = () => {
    if (!formData) return "Why Members Choose Us?";
    
    if (formData.statsSection?.title) {
      return formData.statsSection.title;
    }
    else if (formData.statsTitle) {
      return formData.statsTitle;
    }
    else {
      return "Why Members Choose Us?";
    }
  };

  // Handle stat text change - SAME AS ADMIN
  const handleStatTextChange = (value) => {
    setFormData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        statsSection: {
          ...(prev.statsSection || { stats: [] }),
          title: value
        }
      };
    });
  };

  // Handle stat array change - SAME AS ADMIN
  const handleStatArrayChange = (index, key, value) => {
    setFormData(prev => {
      if (!prev) return prev;
      
      const currentStats = getStatsData();
      if (index >= currentStats.length) return prev;
      
      const updatedStats = [...currentStats];
      updatedStats[index] = { 
        ...updatedStats[index], 
        [key]: value 
      };
      
      // Update in statsSection (same as admin)
      return {
        ...prev,
        statsSection: {
          ...(prev.statsSection || { title: "Why Members Choose Us?" }),
          stats: updatedStats
        }
      };
    });
  };

  // Handle image file selection with preview
  const handleImageSelect = (type, id, file, index) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result;
      const key = `${type}-${id || index}`;
      
      // Store preview
      setImagePreviews(prev => ({
        ...prev,
        [key]: previewUrl
      }));
      
      // Store file
      setImageFiles(prev => ({
        ...prev,
        [key]: file
      }));
    };
    reader.readAsDataURL(file);
  };

  // Get image URL with preview support
  const getDisplayImageUrl = (item, type, id, index) => {
    const key = `${type}-${id || index}`;
    
    // First check if we have a preview
    if (imagePreviews[key]) {
      return imagePreviews[key];
    }
    
    // Then check if item has a URL
    if (item?.image?.url) {
      return getImageUrl(item.image.url);
    }
    
    // Default placeholder
    if (type === 'doctor') {
      return "https://via.placeholder.com/100?text=Doctor";
    } else {
      return "https://via.placeholder.com/80?text=Feature";
    }
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

      console.log("Saving all sub-admin data...", formData);
      
      await updateCareProgramSub(dataToSend);
      
      setMainFiles({});
      
      // Refresh data
      await fetchCareProgramDataSub();
      
      alert("All changes saved successfully!");
      
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new doctor - SAME AS ADMIN
  const handleAddDoctor = async () => {
    if (!newDoctor.name.trim()) {
      alert("Doctor name is required!");
      return;
    }

    // Use same format as admin
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
      const result = await addItemToSectionSub("doctor", fd);
      
      if (result.success) {
        setNewDoctor({ 
          name: "", 
          testimonial: "", 
          location: "", 
          bgColor: "#e7faf8", 
          borderColor: "success",
          image: null,
          imagePreview: null
        });
        
        setShowDoctorModal(false);
        await fetchCareProgramDataSub();
        alert("Doctor added successfully!");
      } else {
        throw new Error(result.error || "Failed to add doctor");
      }
      
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert(`Failed to add doctor: ${error.message}`);
    }
  };

  // Add new feature - SAME AS ADMIN
  const handleAddFeature = async () => {
    if (!newFeature.title.trim()) {
      alert("Feature title is required!");
      return;
    }

    // Use same format as admin
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
      const result = await addItemToSectionSub("feature", fd);
      
      if (result.success) {
        setNewFeature({ 
          title: "", 
          description: "", 
          number: "", 
          image: null,
          imagePreview: null
        });
        
        setShowFeatureModal(false);
        await fetchCareProgramDataSub();
        alert("Feature added successfully!");
      } else {
        throw new Error(result.error || "Failed to add feature");
      }
      
    } catch (error) {
      console.error("Error adding feature:", error);
      alert(`Failed to add feature: ${error.message}`);
    }
  };

  // Add new stat - FIXED: Use SAME format as admin { stat: newStat }
  const handleAddStat = async () => {
    if (!newStat.value.trim()) {
      alert("Stat value is required!");
      return;
    }

    try {
      // Use SAME format as admin: { stat: newStat }
      const result = await addItemToSectionSub("stat", { stat: newStat });
      
      if (result.success) {
        setNewStat({ value: "", label: "", color: "primary" });
        await fetchCareProgramDataSub();
        alert("Stat added successfully!");
      } else {
        throw new Error(result.error || "Failed to add stat");
      }
      
    } catch (error) {
      console.error("Error adding stat:", error);
      alert(`Failed to add stat: ${error.message}`);
    }
  };

  // Delete stat
  const handleDeleteStat = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stat?")) return;
    
    try {
      const result = await deleteItemFromSectionSub("stat", id);
      
      if (result.success) {
        alert("Stat deleted successfully!");
        await fetchCareProgramDataSub();
      } else {
        throw new Error(result.error || "Failed to delete stat");
      }
      
    } catch (error) {
      console.error("Error deleting stat:", error);
      alert(`Failed to delete stat: ${error.message}`);
    }
  };

  // Update individual item (doctor/feature) with image - SAME AS ADMIN FORMAT
  const handleUpdateItem = async (type, id, itemData, index) => {
    const fd = new FormData();
    
    if (type === 'doctor') {
      fd.append('doctorId', id);
      // Use same format as admin
      Object.keys(itemData).forEach(key => {
        if (key !== 'image' && key !== '_id' && key !== '__v') {
          if (typeof itemData[key] === 'object') {
            fd.append(key, JSON.stringify(itemData[key]));
          } else {
            fd.append(key, itemData[key] || "");
          }
        }
      });
    } 
    else if (type === 'feature') {
      fd.append('featureId', id);
      // Use same format as admin
      Object.keys(itemData).forEach(key => {
        if (key !== 'image' && key !== '_id' && key !== '__v') {
          if (typeof itemData[key] === 'object') {
            fd.append(key, JSON.stringify(itemData[key]));
          } else {
            fd.append(key, itemData[key] || "");
          }
        }
      });
    }
    else if (type === 'stat') {
      fd.append('statId', id);
      const stats = getStatsData();
      const stat = stats.find(s => s._id === id) || stats[index];
      if (stat) {
        // For stats, use same format
        fd.append("value", stat.value || "");
        fd.append("label", stat.label || "");
        fd.append("color", stat.color || "primary");
      }
    }

    // Add image file if exists
    const imageKey = `${type}-${id || index}`;
    if (imageFiles[imageKey]) {
      fd.append("image", imageFiles[imageKey]);
    }

    try {
      const result = await updateIndividualItemSub(type, fd);
      
      if (result.success) {
        alert(`${type} updated successfully!`);
        // Clear preview after successful update
        if (imageFiles[imageKey]) {
          setImageFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[imageKey];
            return newFiles;
          });
          setImagePreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[imageKey];
            return newPreviews;
          });
        }
        await fetchCareProgramDataSub();
      } else {
        throw new Error(result.error || `Failed to update ${type}`);
      }
      
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      alert(`Failed to update ${type}: ${error.message}`);
    }
  };

  // Delete item
  const handleDeleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      const result = await deleteItemFromSectionSub(type, id);
      
      if (result.success) {
        alert(`${type} deleted successfully!`);
        await fetchCareProgramDataSub();
      } else {
        throw new Error(result.error || `Failed to delete ${type}`);
      }
      
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}: ${error.message}`);
    }
  };

  // Handle text change for doctors and features - SAME AS ADMIN
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
    updatedArray[index] = { 
      ...updatedArray[index], 
      [key]: value 
    };
    
    setFormData(prev => ({
      ...prev,
      [section]: { 
        ...prev[section], 
        [arrayName]: updatedArray 
      }
    }));
  };

  const handleRefreshData = async () => {
    console.log("Manual refresh requested");
    await fetchCareProgramDataSub();
  };

  // Modal handlers
  const openDoctorModal = () => setShowDoctorModal(true);
  const closeDoctorModal = () => {
    setShowDoctorModal(false);
    setNewDoctor({ 
      name: "", 
      testimonial: "", 
      location: "", 
      bgColor: "#e7faf8", 
      borderColor: "success",
      image: null,
      imagePreview: null
    });
  };

  const openFeatureModal = () => setShowFeatureModal(true);
  const closeFeatureModal = () => {
    setShowFeatureModal(false);
    setNewFeature({ 
      title: "", 
      description: "", 
      number: "", 
      image: null,
      imagePreview: null
    });
  };

  // Handle file input change for new doctor/feature in modal
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

  // --- RENDER FUNCTIONS ---

  // Loading state
  if (carePageLoadingSub && !formData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 fs-5">Loading Sub-Admin Care Program...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (carePageErrorSub) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow-lg">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-3 fs-3"></i>
            <div>
              <h4 className="alert-heading">⚠️ Error Loading Data</h4>
              <p className="mb-1"><strong>Error:</strong> {carePageErrorSub}</p>
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

  // Get stats data
  const stats = getStatsData();
  const statsTitle = getStatsTitle();

  // Main content
  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container bg-white rounded shadow-lg p-4">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <div>
            <h3 className="text-primary m-0">
              <i className="bi bi-heart-pulse me-2"></i>
              Care Program (Sub-Admin)
            </h3>
            <small className="text-muted">Manage your diabetes care program content</small>
            <div className="text-success small mt-1">
              <i className="bi bi-check-circle-fill me-1"></i>
              Stats Loaded: {stats.length}
            </div>
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

        {/* Tabs Navigation */}
        <ul className="nav nav-tabs mb-4" id="adminTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <i className="bi bi-bar-chart me-1"></i> Stats ({stats.length})
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'doctors' ? 'active' : ''}`}
              onClick={() => setActiveTab('doctors')}
            >
              <i className="bi bi-people me-1"></i> Doctors ({formData.doctorSlider?.doctors?.length || 0})
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              <i className="bi bi-stars me-1"></i> Features ({formData.programFeatures?.features?.length || 0})
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content p-3 border rounded bg-light">
          
          {/* STATS SECTION - FIXED */}
          {activeTab === 'stats' && (
            <div className="tab-pane fade show active">
              <div className="mb-4">
                <label className="form-label fw-bold">Section Title</label>
                <input 
                  type="text" 
                  className="form-control mb-3"
                  value={statsTitle}
                  onChange={(e) => handleStatTextChange(e.target.value)}
                  placeholder="Why Members Choose Us?"
                />
              </div>
              
              <div className="mb-4">
                <h5>Statistics List ({stats.length})</h5>
                {stats.length === 0 ? (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No statistics added yet. Add your first stat below.
                  </div>
                ) : (
                  <div className="row g-3">
                    {stats.map((stat, index) => (
                      <div className="col-md-4" key={stat._id || `stat-${index}`}>
                        <div className="card h-100 border-primary">
                          <div className="card-body">
                            <div className="mb-2">
                              <label className="form-label small">Value</label>
                              <input 
                                type="text" 
                                className="form-control form-control-sm"
                                value={stat.value || ""}
                                onChange={(e) => handleStatArrayChange(index, "value", e.target.value)}
                                placeholder="50k+"
                              />
                            </div>
                            
                            <div className="mb-2">
                              <label className="form-label small">Label</label>
                              <input 
                                type="text" 
                                className="form-control form-control-sm"
                                value={stat.label || ""}
                                onChange={(e) => handleStatArrayChange(index, "label", e.target.value)}
                                placeholder="Consultation Done"
                              />
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label small">Color</label>
                              <select 
                                className="form-select form-select-sm"
                                value={stat.color || "primary"}
                                onChange={(e) => handleStatArrayChange(index, "color", e.target.value)}
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
                                onClick={() => stat._id && handleDeleteStat(stat._id)}
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
              
              {/* Add New Stat Form - SAME AS ADMIN */}
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
                    onClick={openDoctorModal}
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
                              <div className="text-center">
                                <div className="mb-2">
                                  <img 
                                    src={getDisplayImageUrl(doctor, 'doctor', doctor._id, index)}
                                    className="rounded-circle"
                                    width="80"
                                    height="80"
                                    style={{objectFit: 'cover'}}
                                    alt={doctor.name}
                                  />
                                </div>
                                <input 
                                  type="file" 
                                  className="form-control form-control-sm" 
                                  accept="image/*"
                                  style={{width: '120px'}}
                                  onChange={(e) => handleImageSelect('doctor', doctor._id, e.target.files[0], index)}
                                />
                                <small className="text-muted d-block mt-1">
                                  {imagePreviews[`doctor-${doctor._id || index}`] ? 
                                    "New image selected" : 
                                    "Choose new image"}
                                </small>
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
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="mt-3 d-flex justify-content-end gap-2">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleUpdateItem(
                                  "doctor", 
                                  doctor._id, 
                                  {
                                    name: doctor.name,
                                    testimonial: doctor.testimonial,
                                    location: doctor.location,
                                    bgColor: doctor.bgColor || "#e7faf8",
                                    borderColor: doctor.borderColor || "success"
                                  },
                                  index
                                )}
                              >
                                <i className="bi bi-save"></i> Update
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
                    onClick={openFeatureModal}
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
                              <div className="text-center" style={{width: '100px'}}>
                                <div className="mb-2">
                                  <img 
                                    src={getDisplayImageUrl(feature, 'feature', feature._id, index)}
                                    className="rounded"
                                    width="80"
                                    height="80"
                                    style={{objectFit: 'cover'}}
                                    alt={feature.title}
                                  />
                                </div>
                                <input 
                                  type="file" 
                                  className="form-control form-control-sm" 
                                  accept="image/*"
                                  onChange={(e) => handleImageSelect('feature', feature._id, e.target.files[0], index)}
                                />
                                <small className="text-muted d-block mt-1">
                                  {imagePreviews[`feature-${feature._id || index}`] ? 
                                    "New image selected" : 
                                    "Choose new image"}
                                </small>
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
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="mt-3 d-flex justify-content-end gap-2">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleUpdateItem(
                                  "feature", 
                                  feature._id, 
                                  {
                                    title: feature.title,
                                    description: feature.description,
                                    number: feature.number
                                  },
                                  index
                                )}
                              >
                                <i className="bi bi-save"></i> Update
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODALS */}

        {/* Add Doctor Modal */}
        {showDoctorModal && (
          <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Add New Doctor</h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={closeDoctorModal}
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
                    <div className="col-12">
                      <label className="form-label">Doctor Photo</label>
                      <input 
                        type="file" 
                        className="form-control"
                        accept="image/*"
                        onChange={handleNewDoctorImageChange}
                      />
                      {newDoctor.imagePreview && (
                        <div className="mt-2">
                          <img 
                            src={newDoctor.imagePreview}
                            alt="Preview"
                            className="img-thumbnail"
                            style={{maxWidth: '100px', maxHeight: '100px'}}
                          />
                          <small className="d-block text-success mt-1">Image preview</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeDoctorModal}
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
        )}

        {/* Add Feature Modal */}
        {showFeatureModal && (
          <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">Add New Feature</h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={closeFeatureModal}
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
                    <div className="col-12">
                      <label className="form-label">Feature Image</label>
                      <input 
                        type="file" 
                        className="form-control"
                        accept="image/*"
                        onChange={handleNewFeatureImageChange}
                      />
                      {newFeature.imagePreview && (
                        <div className="mt-2">
                          <img 
                            src={newFeature.imagePreview}
                            alt="Preview"
                            className="img-thumbnail"
                            style={{maxWidth: '100px', maxHeight: '100px'}}
                          />
                          <small className="d-block text-success mt-1">Image preview</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeFeatureModal}
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
        )}

      </div>
    </div>
  );
};

export default CareProgramAdminSub;
