// components/Admin/SciencePageEditor.js
import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from '../../Context/Context';

// Helper component for better image handling
const ImageWithFallback = ({ src, alt, className, style, fallbackText = "Image not available" }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div 
        className={`bg-light d-flex align-items-center justify-content-center ${className}`}
        style={{...style, minHeight: '100px'}}
      >
        <span className="text-muted small">{fallbackText}</span>
      </div>
    );
  }

  // Helper function to get image URL
  const getImageUrl = (filename) => {
    if (!filename) return null;
    // Check if it's already a full URL
    if (filename.startsWith('http')) return filename;
    // Return local uploaded image URL
    return `${process.env.REACT_APP_API_URL}/uploads/${filename}`;
  };

  return (
    <img 
      src={getImageUrl(src)} 
      alt={alt}
      className={className}
      style={style}
      onError={() => setImgError(true)}
    />
  );
};

const SciencePageEditor = () => {
  const { 
    sciencePage, 
    loading, 
    error, 
    updateSciencePageContent, 
    addSciencePageItem,
    removeSciencePageItem,
    uploadScienceImages, 
    clearError,
    getSciencePageContent
  } = useContext(MyContext);
  
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroBackgroundImage: '',
    impactTitle: '',
    grantTitle: '',
    grantSubtitle: '',
    grantBackgroundImage: '',
    researchTitle: '',
    researchDescription: '',
    researchImages: [],
    statsTitle: ''
  });
  
  const [impactCards, setImpactCards] = useState([]);
  const [teamCards, setTeamCards] = useState([]);
  const [statistics, setStatistics] = useState([]);
  
  const [uploadLoading, setUploadLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeSection, setActiveSection] = useState('hero');
  const [uploadError, setUploadError] = useState('');

  // Initialize form data when sciencePage is loaded
  useEffect(() => {
    if (sciencePage) {
      console.log('Science Page Data:', sciencePage);
      
      setFormData({
        heroTitle: sciencePage.heroTitle || '',
        heroSubtitle: sciencePage.heroSubtitle || '',
        heroBackgroundImage: sciencePage.heroBackgroundImage || '',
        impactTitle: sciencePage.impactTitle || '',
        grantTitle: sciencePage.grantTitle || '',
        grantSubtitle: sciencePage.grantSubtitle || '',
        grantBackgroundImage: sciencePage.grantBackgroundImage || '',
        researchTitle: sciencePage.researchTitle || '',
        researchDescription: sciencePage.researchDescription || '',
        researchImages: sciencePage.researchImages || [],
        statsTitle: sciencePage.statsTitle || ''
      });

      setImpactCards(sciencePage.impactCards || []);
      setTeamCards(sciencePage.teamCards || []);
      setStatistics(sciencePage.statistics || []);
    }
  }, [sciencePage]);

  // Refresh data when component mounts
  useEffect(() => {
    getSciencePageContent();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (arrayType, index, field, value) => {
    const setters = {
      impactCards: setImpactCards,
      teamCards: setTeamCards,
      statistics: setStatistics
    };
    
    const setter = setters[arrayType];
    if (setter) {
      setter(prev => prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ));
    }
  };

  const handleAddItem = async (type, defaultItem) => {
    try {
      const result = await addSciencePageItem(type, defaultItem);
      if (result.success === 1) {
        setSuccessMessage(`${type} added successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
        getSciencePageContent();
      }
    } catch (error) {
      console.error('Add item error:', error);
    }
  };

  const handleRemoveItem = async (type, index) => {
    try {
      const result = await removeSciencePageItem(type, index);
      if (result.success === 1) {
        setSuccessMessage(`${type} removed successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
        getSciencePageContent();
      }
    } catch (error) {
      console.error('Remove item error:', error);
    }
  };

  // FIXED: Image Upload Handler
  const handleImageUpload = async (field, files) => {
    setUploadLoading(true);
    setUploadError('');
    clearError();
    
    try {
      const uploadFormData = new FormData();
      
      // Handle single file uploads
      if (field === 'heroBackgroundImage' || field === 'grantBackgroundImage') {
        if (!files) {
          throw new Error('No file selected');
        }
        uploadFormData.append(field, files);
      } 
      // Handle multiple research images
      else if (field === 'researchImages') {
        if (!files || files.length === 0) {
          throw new Error('No files selected');
        }
        Array.from(files).forEach(file => {
          uploadFormData.append('researchImages', file);
        });
      }

      console.log('Uploading files for field:', field, 'Files:', files);

      const result = await uploadScienceImages(uploadFormData);
      
      if (result.success === 1) {
        setSuccessMessage('Images uploaded successfully!');
        
        // Update the local state with uploaded images
        if (field === 'researchImages') {
          const newImages = result.data
            .filter(item => item.type === 'researchImage')
            .map(item => item.filename);
          
          setFormData(prev => ({
            ...prev,
            researchImages: [...prev.researchImages, ...newImages]
          }));
        } else {
          const uploadedFile = result.data.find(item => item.type === field);
          if (uploadedFile) {
            setFormData(prev => ({
              ...prev,
              [field]: uploadedFile.filename
            }));
          }
        }
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setUploadError(error.message || 'Failed to upload images');
    } finally {
      setUploadLoading(false);
    }
  };

  const removeImage = (field, index = null) => {
    if (index !== null) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    clearError();
    setUploadError('');

    try {
      // Prepare update data
      const updateData = {
        ...formData,
        impactCards,
        teamCards,
        statistics
      };

      console.log('Submitting data:', updateData);

      const result = await updateSciencePageContent(updateData);
      if (result.success === 1) {
        setSuccessMessage('Science page updated successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
        getSciencePageContent();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const navigationItems = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'impact', label: 'Impact Cards' },
    { id: 'grant', label: 'Grant Section' },
    { id: 'team', label: 'Team Members' },
    { id: 'research', label: 'Research Section' },
    { id: 'stats', label: 'Statistics' }
  ];

  // Default templates for new items
  const defaultTemplates = {
    impactCard: {
      image: "",
      number: "",
      description: "",
    },
    teamCard: {
      name: "",
      designation: "",
      institution: "",
    },
    statistic: {
      percentage: "",
      description: "",
      source: "",
    }
  };

  if (loading && !sciencePage) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading science page editor...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Science Page Editor</h2>
        <div>
          <button 
            type="button" 
            className="btn btn-outline-secondary me-2" 
            onClick={getSciencePageContent}
            disabled={loading}
          >
            Refresh Data
          </button>
          <button className="btn btn-outline-primary me-2" onClick={() => window.open('/science', '_blank')}>
            View Live Page
          </button>
          <button type="submit" form="science-page-form" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Science Page'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={clearError}></button>
        </div>
      )}

      {uploadError && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Upload Issue:</strong> {uploadError}
          <button type="button" className="btn-close" onClick={() => setUploadError('')}></button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}

      <div className="row">
        {/* Navigation Sidebar */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Page Sections</h5>
            </div>
            <div className="list-group list-group-flush">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`list-group-item list-group-item-action ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">Content Summary</h6>
            </div>
            <div className="card-body">
              <small>
                <div>Impact Cards: {impactCards.length}</div>
                <div>Team Members: {teamCards.length}</div>
                <div>Statistics: {statistics.length}</div>
                <div>Research Images: {formData.researchImages.length}</div>
              </small>
            </div>
          </div>

          {/* Current Data Preview */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">Current Data</h6>
            </div>
            <div className="card-body">
              <small>
                <div><strong>Hero Title:</strong> {formData.heroTitle}</div>
                <div><strong>Impact Title:</strong> {formData.impactTitle}</div>
                <div><strong>Grant Title:</strong> {formData.grantTitle}</div>
                <div><strong>Research Title:</strong> {formData.researchTitle}</div>
                <div><strong>Stats Title:</strong> {formData.statsTitle}</div>
              </small>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-md-9">
          <form id="science-page-form" onSubmit={handleSubmit}>
            {/* Hero Section */}
            {activeSection === 'hero' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Hero Section</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Hero Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.heroTitle}
                      onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                      placeholder="Enter hero title"
                    />
                    <div className="form-text">Current: {formData.heroTitle || 'Empty'}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Hero Subtitle</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.heroSubtitle}
                      onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                      placeholder="Enter hero subtitle"
                    />
                    <div className="form-text">Current: {formData.heroSubtitle || 'Empty'}</div>
                  </div>

                </div>
              </div>
            )}

            {/* Impact Cards */}
            {activeSection === 'impact' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Impact Cards</h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAddItem('impactCard', defaultTemplates.impactCard)}
                  >
                    Add Card
                  </button>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Impact Section Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.impactTitle}
                      onChange={(e) => handleInputChange('impactTitle', e.target.value)}
                      placeholder="Enter impact section title"
                    />
                    <div className="form-text">Current: {formData.impactTitle || 'Empty'}</div>
                  </div>
                  
                  {impactCards.map((card, index) => (
                    <div key={card._id || index} className="card mb-3 border-primary">
                      <div className="card-header d-flex justify-content-between align-items-center bg-light">
                        <h6 className="mb-0">Impact Card #{index + 1}</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveItem('impactCard', index)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Image URL</label>
                            <input
                              type="text"
                              className="form-control"
                              value={card.image}
                              onChange={(e) => handleArrayChange('impactCards', index, 'image', e.target.value)}
                              placeholder="Enter image URL"
                            />
                            {card.image && (
                              <div className="mt-2">
                                <ImageWithFallback
                                  src={card.image}
                                  alt="Impact card"
                                  className="img-thumbnail"
                                  style={{maxHeight: '80px', maxWidth: '100%'}}
                                  fallbackText="Impact card image"
                                />
                              </div>
                            )}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Number/Value</label>
                            <input
                              type="text"
                              className="form-control"
                              value={card.number}
                              onChange={(e) => handleArrayChange('impactCards', index, 'number', e.target.value)}
                              placeholder="Enter number/value"
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={card.description}
                            onChange={(e) => handleArrayChange('impactCards', index, 'description', e.target.value)}
                            placeholder="Enter description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grant Section */}
            {activeSection === 'grant' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Grant Section</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Grant Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.grantTitle}
                      onChange={(e) => handleInputChange('grantTitle', e.target.value)}
                      placeholder="Enter grant title"
                    />
                    <div className="form-text">Current: {formData.grantTitle || 'Empty'}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Grant Subtitle/Hashtag</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.grantSubtitle}
                      onChange={(e) => handleInputChange('grantSubtitle', e.target.value)}
                      placeholder="Enter grant subtitle or hashtag"
                    />
                    <div className="form-text">Current: {formData.grantSubtitle || 'Empty'}</div>
                  </div>
                  {/* <div className="mb-3">
                    <label className="form-label">Grant Background Image</label>
                    {formData.grantBackgroundImage && (
                      <div className="mb-2">
                        <ImageWithFallback
                          src={formData.grantBackgroundImage}
                          alt="Grant background"
                          className="img-thumbnail me-2"
                          style={{maxHeight: '100px'}}
                          fallbackText="Grant image not available"
                        />
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeImage('grantBackgroundImage')}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleImageUpload('grantBackgroundImage', file);
                        }
                      }}
                      disabled={uploadLoading}
                    />
                    <div className="form-text">
                      {uploadLoading ? 'Uploading...' : 'Upload a new grant background image'}
                    </div>
                  </div> */}
                </div>
              </div>
            )}

            {/* Team Members */}
            {activeSection === 'team' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Team Members</h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAddItem('teamCard', defaultTemplates.teamCard)}
                  >
                    Add Member
                  </button>
                </div>
                <div className="card-body">
                  {teamCards.map((member, index) => (
                    <div key={member._id || index} className="card mb-3 border-success">
                      <div className="card-header d-flex justify-content-between align-items-center bg-light">
                        <h6 className="mb-0">Team Member #{index + 1}</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveItem('teamCard', index)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={member.name}
                              onChange={(e) => handleArrayChange('teamCards', index, 'name', e.target.value)}
                              placeholder="Enter team member name"
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Designation</label>
                            <input
                              type="text"
                              className="form-control"
                              value={member.designation}
                              onChange={(e) => handleArrayChange('teamCards', index, 'designation', e.target.value)}
                              placeholder="Enter designation"
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Institution</label>
                            <input
                              type="text"
                              className="form-control"
                              value={member.institution}
                              onChange={(e) => handleArrayChange('teamCards', index, 'institution', e.target.value)}
                              placeholder="Enter institution"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Research Section */}
            {activeSection === 'research' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Research Section</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Research Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.researchTitle}
                      onChange={(e) => handleInputChange('researchTitle', e.target.value)}
                      placeholder="Enter research title"
                    />
                    <div className="form-text">Current: {formData.researchTitle || 'Empty'}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Research Description</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.researchDescription}
                      onChange={(e) => handleInputChange('researchDescription', e.target.value)}
                      placeholder="Enter research description"
                    />
                    <div className="form-text">Current: {formData.researchDescription || 'Empty'}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Research Images</label>
                    <div className="mb-2">
                      {formData.researchImages.map((image, index) => (
                        <div key={index} className="d-inline-block me-2 mb-2 position-relative">
                          <ImageWithFallback
                            src={image}
                            alt={`Research ${index + 1}`}
                            className="img-thumbnail"
                            style={{maxHeight: '80px'}}
                            fallbackText="Research image"
                          />
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger position-absolute top-0 end-0"
                            onClick={() => removeImage('researchImages', index)}
                            style={{transform: 'translate(50%, -50%)'}}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          handleImageUpload('researchImages', files);
                        }
                      }}
                      disabled={uploadLoading}
                    />
                    <div className="form-text">
                      {uploadLoading ? 'Uploading...' : 'Select multiple research images (Ctrl+click to select multiple)'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            {activeSection === 'stats' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Statistics</h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAddItem('statistic', defaultTemplates.statistic)}
                  >
                    Add Statistic
                  </button>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Statistics Section Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.statsTitle}
                      onChange={(e) => handleInputChange('statsTitle', e.target.value)}
                      placeholder="Enter statistics section title"
                    />
                    <div className="form-text">Current: {formData.statsTitle || 'Empty'}</div>
                  </div>
                  
                  {statistics.map((stat, index) => (
                    <div key={stat._id || index} className="card mb-3 border-warning">
                      <div className="card-header d-flex justify-content-between align-items-center bg-light">
                        <h6 className="mb-0">Statistic #{index + 1}</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveItem('statistic', index)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Percentage/Value</label>
                            <input
                              type="text"
                              className="form-control"
                              value={stat.percentage}
                              onChange={(e) => handleArrayChange('statistics', index, 'percentage', e.target.value)}
                              placeholder="Enter percentage or value"
                            />
                          </div>
                          <div className="col-md-5 mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                              className="form-control"
                              rows="2"
                              value={stat.description}
                              onChange={(e) => handleArrayChange('statistics', index, 'description', e.target.value)}
                              placeholder="Enter description"
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Source</label>
                            <input
                              type="text"
                              className="form-control"
                              value={stat.source}
                              onChange={(e) => handleArrayChange('statistics', index, 'source', e.target.value)}
                              placeholder="Enter source"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SciencePageEditor;