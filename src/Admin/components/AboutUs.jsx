// components/Admin/AboutUsEditor.js
import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from '../../Context/Context';

const AboutUsEditor = () => {
  const { aboutUsData, loading, error, getAdminAboutUs, updateAboutUs, uploadImage, clearError } = useContext(MyContext);
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroDescription: '',
    heroImage: '',
    mainTitle: '',
    mainDescription: '',
    mainImage: '',
    leftFeatures: [],
    rightFeatures: [],
    additionalContent: '',
    priorityStatement: '',
    moreAboutTitle: '',
    moreAboutDescription: '',
    moreAboutImage: '',
    moreAboutSideImage: '',
    moreAboutSideDescription: '',
    stats: {
      patientReviews: '',
      googleRating: ''
    },
    cards: [],
    missionVision: [],
    insuranceTitle: '',
    insuranceLogos: [],
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAboutUs();
  }, []);

  useEffect(() => {
    if (aboutUsData) {
      setFormData(aboutUsData);
    }
  }, [aboutUsData]);

  const loadAboutUs = async () => {
    await getAdminAboutUs();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it's an uploaded image path
    if (imagePath.startsWith('/uploads')) {
      return `${process.env.REACT_APP_API_URL || ''}${imagePath}`;
    }

    return imagePath;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (fieldName, index, value) => {
    const newArray = [...(formData[fieldName] || [])];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [fieldName]: newArray
    }));
  };

  const handleObjectArrayChange = (fieldName, index, field, value) => {
    const newArray = [...(formData[fieldName] || [])];
    newArray[index] = {
      ...newArray[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      [fieldName]: newArray
    }));
  };

  const addArrayItem = (fieldName, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), defaultValue]
    }));
  };

  const addObjectArrayItem = (fieldName, defaultObject = {}) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), defaultObject]
    }));
  };

  const removeArrayItem = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const result = await uploadImage(file);
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: result.data.imageUrl
        }));
      }
    }
  };

  const handleInsuranceLogoUpload = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const result = await uploadImage(file);
      if (result.success) {
        const newLogos = [...(formData.insuranceLogos || [])];
        newLogos[index] = result.data.imageUrl;
        setFormData(prev => ({
          ...prev,
          insuranceLogos: newLogos
        }));
      }
    }
  };

  const handleCardImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const result = await uploadImage(file);
      if (result.success) {
        const newCards = [...(formData.cards || [])];
        newCards[index] = {
          ...newCards[index],
          image: result.data.imageUrl
        };
        setFormData(prev => ({
          ...prev,
          cards: newCards
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await updateAboutUs(formData);
      if (result.success) {
        alert('About Us updated successfully!');
      }
    } catch (err) {
      console.error('Error updating About Us:', err);
    }

    setSaving(false);
  };

  if (loading && !formData.heroTitle) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading About Us Editor...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Edit About Us Page</h2>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={clearError}></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Hero Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>Hero Section</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Hero Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="heroTitle"
                  value={formData.heroTitle || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Hero Description</label>
                <textarea
                  className="form-control"
                  name="heroDescription"
                  rows="3"
                  value={formData.heroDescription || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-12">
                <label className="form-label">Hero Image</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => handleImageUpload(e, 'heroImage')}
                  accept="image/*"
                />
                {formData.heroImage && (
                  <div className="mt-2">
                    <img 
                      src={getImageUrl(formData.heroImage)} 
                      alt="Hero Preview" 
                      className="img-thumbnail" 
                      style={{ maxHeight: '150px', maxWidth: '100%' }} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>Statistics</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Patient Reviews</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.stats?.patientReviews || ''}
                  onChange={(e) => handleNestedChange('stats', 'patientReviews', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Google Rating</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.stats?.googleRating || ''}
                  onChange={(e) => handleNestedChange('stats', 'googleRating', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>Main Content Section</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Main Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="mainTitle"
                  value={formData.mainTitle || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label">Main Description</label>
                <textarea
                  className="form-control"
                  name="mainDescription"
                  rows="3"
                  value={formData.mainDescription || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label">Main Image</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => handleImageUpload(e, 'mainImage')}
                  accept="image/*"
                />
                {formData.mainImage && (
                  <div className="mt-2">
                    <img 
                      src={getImageUrl(formData.mainImage)} 
                      alt="Main Content Preview" 
                      className="img-thumbnail" 
                      style={{ maxHeight: '150px', maxWidth: '100%' }} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Left Features</label>
                {(formData.leftFeatures || []).map((feature, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      value={feature}
                      onChange={(e) => handleArrayChange('leftFeatures', index, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => removeArrayItem('leftFeatures', index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => addArrayItem('leftFeatures')}
                >
                  + Add Feature
                </button>
              </div>

              <div className="col-md-6">
                <label className="form-label">Right Features</label>
                {(formData.rightFeatures || []).map((feature, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      value={feature}
                      onChange={(e) => handleArrayChange('rightFeatures', index, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => removeArrayItem('rightFeatures', index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => addArrayItem('rightFeatures')}
                >
                  + Add Feature
                </button>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-12">
                <label className="form-label">Priority Statement</label>
                <input
                  type="text"
                  className="form-control"
                  name="priorityStatement"
                  value={formData.priorityStatement || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* More About Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>More About Section</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="moreAboutTitle"
                  value={formData.moreAboutTitle || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="moreAboutDescription"
                  rows="3"
                  value={formData.moreAboutDescription || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Main Image</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => handleImageUpload(e, 'moreAboutImage')}
                  accept="image/*"
                />
                {formData.moreAboutImage && (
                  <div className="mt-2">
                    <img 
                      src={getImageUrl(formData.moreAboutImage)} 
                      alt="More About Preview" 
                      className="img-thumbnail" 
                      style={{ maxHeight: '150px', maxWidth: '100%' }} 
                    />
                  </div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Side Image</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => handleImageUpload(e, 'moreAboutSideImage')}
                  accept="image/*"
                />
                {formData.moreAboutSideImage && (
                  <div className="mt-2">
                    <img 
                      src={getImageUrl(formData.moreAboutSideImage)} 
                      alt="More About Side Preview" 
                      className="img-thumbnail" 
                      style={{ maxHeight: '150px', maxWidth: '100%' }} 
                    />
                  </div>
                )}
              </div>
              <div className="col-md-12">
                <label className="form-label">Side Description</label>
                <textarea
                  className="form-control"
                  name="moreAboutSideDescription"
                  rows="3"
                  value={formData.moreAboutSideDescription || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>Feature Cards</h5>
          </div>
          <div className="card-body">
            {(formData.cards || []).map((card, index) => (
              <div key={index} className="card mb-3">
                <div className="card-header">
                  <h6>Card {index + 1}</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={card.title || ''}
                        onChange={(e) => handleObjectArrayChange('cards', index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Background Color</label>
                      <input
                        type="color"
                        className="form-control"
                        value={card.backgroundColor || '#ffffff'}
                        onChange={(e) => handleObjectArrayChange('cards', index, 'backgroundColor', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={card.description || ''}
                        onChange={(e) => handleObjectArrayChange('cards', index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-md-12">
                      <label className="form-label">Image</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => handleCardImageUpload(e, index)}
                        accept="image/*"
                      />
                      {card.image && (
                        <div className="mt-2">
                          <img 
                            src={getImageUrl(card.image)} 
                            alt={`Card ${index + 1} Preview`} 
                            className="img-thumbnail" 
                            style={{ maxHeight: '150px', maxWidth: '100%' }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm mt-2"
                    onClick={() => removeArrayItem('cards', index)}
                  >
                    Remove Card
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => addObjectArrayItem('cards', {
                title: '',
                description: '',
                image: '',
                backgroundColor: '#ffffff'
              })}
            >
              + Add Card
            </button>
          </div>
        </div>

        {/* Mission Vision Values Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>Mission, Vision & Values</h5>
          </div>
          <div className="card-body">
            {(formData.missionVision || []).map((item, index) => (
              <div key={index} className="card mb-3">
                <div className="card-header">
                  <h6>{item.type?.toUpperCase() || `Item ${index + 1}`}</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <label className="form-label">Type</label>
                      <select
                        className="form-control"
                        value={item.type || ''}
                        onChange={(e) => handleObjectArrayChange('missionVision', index, 'type', e.target.value)}
                      >
                        <option value="mission">Mission</option>
                        <option value="vision">Vision</option>
                        <option value="values">Values</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={item.title || ''}
                        onChange={(e) => handleObjectArrayChange('missionVision', index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Background Color</label>
                      <input
                        type="color"
                        className="form-control"
                        value={item.backgroundColor || '#ffffff'}
                        onChange={(e) => handleObjectArrayChange('missionVision', index, 'backgroundColor', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <label className="form-label">Icon (Font Awesome class)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={item.icon || ''}
                        onChange={(e) => handleObjectArrayChange('missionVision', index, 'icon', e.target.value)}
                        placeholder="fa-shield, fa-eye, fa-heart"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={item.description || ''}
                        onChange={(e) => handleObjectArrayChange('missionVision', index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm mt-2"
                    onClick={() => removeArrayItem('missionVision', index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => addObjectArrayItem('missionVision', {
                type: 'mission',
                title: '',
                description: '',
                icon: '',
                backgroundColor: '#ffffff'
              })}
            >
              + Add Mission/Vision/Value
            </button>
          </div>
        </div>

        {/* Insurance Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>Insurance Section</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Insurance Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="insuranceTitle"
                  value={formData.insuranceTitle || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <label className="form-label">Insurance Logos</label>
                {(formData.insuranceLogos || []).map((logo, index) => (
                  <div key={index} className="mb-3 p-3 border rounded">
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={logo}
                        onChange={(e) => handleArrayChange('insuranceLogos', index, e.target.value)}
                        placeholder="Logo URL"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeArrayItem('insuranceLogos', index)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="input-group">
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => handleInsuranceLogoUpload(e, index)}
                        accept="image/*"
                      />
                    </div>
                    {logo && (
                      <div className="mt-2">
                        <img
                          src={getImageUrl(logo)}
                          alt={`Insurance Logo ${index + 1}`}
                          className="img-thumbnail"
                          style={{ maxHeight: '80px', maxWidth: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => addArrayItem('insuranceLogos', '')}
                >
                  + Add Insurance Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Content */}
        <div className="card mb-4">
          <div className="card-header">
            <h5>Additional Content</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12">
                <label className="form-label">Additional Content</label>
                <textarea
                  className="form-control"
                  name="additionalContent"
                  rows="5"
                  value={formData.additionalContent || ''}
                  onChange={handleInputChange}
                  placeholder="Any additional content for the About Us page..."
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AboutUsEditor;