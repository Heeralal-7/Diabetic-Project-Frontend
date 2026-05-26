// components/SubAdmin/SubAdminSciencePageEditor.js
import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';

const SubAdminSciencePageEditor = () => {
  const { 
    sciencePage, 
    loading, 
    error, 
    getSubAdminSciencePage,
    updateSubAdminSciencePage,
    addSubAdminSciencePageItem,
    removeSubAdminSciencePageItem,
    uploadSubAdminScienceImages,
    clearError
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

  const defaultTemplates = {
    impactCard: { image: "", number: "", description: "" },
    teamCard: { name: "", designation: "", institution: "" },
    statistic: { percentage: "", description: "", source: "" }
  };

  useEffect(() => {
    getSubAdminSciencePage();
  }, []);

  useEffect(() => {
    if (sciencePage) {
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (arrayType, index, field, value) => {
    const setters = { impactCards: setImpactCards, teamCards: setTeamCards, statistics: setStatistics };
    const setter = setters[arrayType];
    if (setter) setter(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleAddItem = async (type, defaultItem) => {
    try {
      const result = await addSubAdminSciencePageItem(type, defaultItem);
      if (result.success === 1) {
        setSuccessMessage(`${type} added successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
        getSubAdminSciencePage();
      }
    } catch (error) {
      console.error('Add item error:', error);
    }
  };

  const handleRemoveItem = async (type, index) => {
    try {
      const result = await removeSubAdminSciencePageItem(type, index);
      if (result.success === 1) {
        setSuccessMessage(`${type} removed successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
        getSubAdminSciencePage();
      }
    } catch (error) {
      console.error('Remove item error:', error);
    }
  };

  const handleImageUpload = async (field, files) => {
    setUploadLoading(true);
    const uploadFormData = new FormData();
    if (Array.isArray(files)) files.forEach(file => uploadFormData.append(field, file));
    else uploadFormData.append(field, files);

    try {
      const result = await uploadSubAdminScienceImages(uploadFormData);
      if (result.success === 1) {
        if (field === 'researchImages') {
          const newImages = result.data.filter(item => item.type === 'researchImage').map(item => item.filename);
          setFormData(prev => ({ ...prev, researchImages: [...prev.researchImages, ...newImages] }));
        } else {
          const uploadedFile = result.data.find(item => item.type === field);
          if (uploadedFile) setFormData(prev => ({ ...prev, [field]: uploadedFile.filename }));
        }
        setSuccessMessage('Images uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const removeImage = (field, index = null) => {
    if (index !== null) setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    else setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    clearError();
    try {
      const updateData = { ...formData, impactCards, teamCards, statistics };
      const result = await updateSubAdminSciencePage(updateData);
      if (result.success === 1) {
        setSuccessMessage('Science page updated successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
        getSubAdminSciencePage();
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

  if (loading && !sciencePage) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading subadmin science page editor...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Subadmin Science Page Editor</h2>
        <div>
          <button type="button" className="btn btn-outline-secondary me-2" onClick={getSubAdminSciencePage} disabled={loading}>
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

      {/* {error && <div className="alert alert-danger">{error}</div>} */}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="row">
        <div className="col-md-3">
          <div className="card mb-3">
            <div className="card-header">Sections</div>
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
        </div>

        <div className="col-md-9">
          <form id="science-page-form" onSubmit={handleSubmit}>

            {/* Hero Section */}
            {activeSection === 'hero' && (
              <div className="card mb-3">
                <div className="card-header">Hero Section</div>
                <div className="card-body">
                  <input type="text" className="form-control mb-2" placeholder="Hero Title" value={formData.heroTitle} onChange={e => handleInputChange('heroTitle', e.target.value)} />
                  <textarea className="form-control mb-2" rows="2" placeholder="Hero Subtitle" value={formData.heroSubtitle} onChange={e => handleInputChange('heroSubtitle', e.target.value)} />
                  {formData.heroBackgroundImage && (
                    <div className="mb-2">
                      <img src={`${process.env.REACT_APP_API_URL}/uploads/science/${formData.heroBackgroundImage}`} alt="Hero" className="img-thumbnail me-2" style={{ maxHeight: '100px' }} />
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeImage('heroBackgroundImage')}>Remove</button>
                    </div>
                  )}
                  <input type="file" className="form-control" accept="image/*" onChange={e => handleImageUpload('heroBackgroundImage', e.target.files[0])} disabled={uploadLoading} />
                </div>
              </div>
            )}

            {/* Impact Cards Section */}
            {activeSection === 'impact' && (
              <div className="card mb-3">
                <div className="card-header d-flex justify-content-between">
                  Impact Cards
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => handleAddItem('impactCard', defaultTemplates.impactCard)}>Add Card</button>
                </div>
                <div className="card-body">
                  <input type="text" className="form-control mb-2" placeholder="Impact Title" value={formData.impactTitle} onChange={e => handleInputChange('impactTitle', e.target.value)} />
                  {impactCards.map((card, i) => (
                    <div key={i} className="card mb-2 border-primary">
                      <div className="card-header d-flex justify-content-between">
                        Card #{i + 1}
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem('impactCard', i)}>Remove</button>
                      </div>
                      <div className="card-body">
                        <input type="text" className="form-control mb-2" placeholder="Image URL" value={card.image} onChange={e => handleArrayChange('impactCards', i, 'image', e.target.value)} />
                        <input type="text" className="form-control mb-2" placeholder="Number/Value" value={card.number} onChange={e => handleArrayChange('impactCards', i, 'number', e.target.value)} />
                        <textarea className="form-control" rows="2" placeholder="Description" value={card.description} onChange={e => handleArrayChange('impactCards', i, 'description', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grant Section */}
            {activeSection === 'grant' && (
              <div className="card mb-3">
                <div className="card-header">Grant Section</div>
                <div className="card-body">
                  <input type="text" className="form-control mb-2" placeholder="Grant Title" value={formData.grantTitle} onChange={e => handleInputChange('grantTitle', e.target.value)} />
                  <textarea className="form-control mb-2" rows="2" placeholder="Grant Subtitle" value={formData.grantSubtitle} onChange={e => handleInputChange('grantSubtitle', e.target.value)} />
                  {formData.grantBackgroundImage && (
                    <div className="mb-2">
                      <img src={`${process.env.REACT_APP_API_URL}/uploads/science/${formData.grantBackgroundImage}`} alt="Grant" className="img-thumbnail me-2" style={{ maxHeight: '100px' }} />
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeImage('grantBackgroundImage')}>Remove</button>
                    </div>
                  )}
                  <input type="file" className="form-control" accept="image/*" onChange={e => handleImageUpload('grantBackgroundImage', e.target.files[0])} disabled={uploadLoading} />
                </div>
              </div>
            )}

            {/* Team Section */}
            {activeSection === 'team' && (
              <div className="card mb-3">
                <div className="card-header d-flex justify-content-between">
                  Team Members
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => handleAddItem('teamCard', defaultTemplates.teamCard)}>Add Member</button>
                </div>
                <div className="card-body">
                  {teamCards.map((card, i) => (
                    <div key={i} className="card mb-2 border-primary">
                      <div className="card-header d-flex justify-content-between">
                        Member #{i + 1}
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem('teamCard', i)}>Remove</button>
                      </div>
                      <div className="card-body">
                        <input type="text" className="form-control mb-2" placeholder="Name" value={card.name} onChange={e => handleArrayChange('teamCards', i, 'name', e.target.value)} />
                        <input type="text" className="form-control mb-2" placeholder="Designation" value={card.designation} onChange={e => handleArrayChange('teamCards', i, 'designation', e.target.value)} />
                        <input type="text" className="form-control" placeholder="Institution" value={card.institution} onChange={e => handleArrayChange('teamCards', i, 'institution', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Research Section */}
            {activeSection === 'research' && (
              <div className="card mb-3">
                <div className="card-header">Research Section</div>
                <div className="card-body">
                  <input type="text" className="form-control mb-2" placeholder="Research Title" value={formData.researchTitle} onChange={e => handleInputChange('researchTitle', e.target.value)} />
                  <textarea className="form-control mb-2" rows="2" placeholder="Research Description" value={formData.researchDescription} onChange={e => handleInputChange('researchDescription', e.target.value)} />
                  <div className="mb-2">
                    {formData.researchImages.map((img, i) => (
                      <div key={i} className="d-inline-block me-2 mb-2">
                        <img src={`${process.env.REACT_APP_API_URL}/uploads/science/${img}`} alt="Research" className="img-thumbnail" style={{ maxHeight: '100px' }} />
                        <button type="button" className="btn btn-sm btn-outline-danger d-block mt-1" onClick={() => removeImage('researchImages', i)}>Remove</button>
                      </div>
                    ))}
                  </div>
                  <input type="file" className="form-control" accept="image/*" multiple onChange={e => handleImageUpload('researchImages', Array.from(e.target.files))} disabled={uploadLoading} />
                </div>
              </div>
            )}

            {/* Statistics Section */}
            {activeSection === 'stats' && (
              <div className="card mb-3">
                <div className="card-header d-flex justify-content-between">
                  Statistics
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => handleAddItem('statistic', defaultTemplates.statistic)}>Add Statistic</button>
                </div>
                <div className="card-body">
                  <input type="text" className="form-control mb-2" placeholder="Statistics Title" value={formData.statsTitle} onChange={e => handleInputChange('statsTitle', e.target.value)} />
                  {statistics.map((stat, i) => (
                    <div key={i} className="card mb-2 border-primary">
                      <div className="card-header d-flex justify-content-between">
                        Statistic #{i + 1}
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem('statistic', i)}>Remove</button>
                      </div>
                      <div className="card-body">
                        <input type="text" className="form-control mb-2" placeholder="Percentage" value={stat.percentage} onChange={e => handleArrayChange('statistics', i, 'percentage', e.target.value)} />
                        <input type="text" className="form-control mb-2" placeholder="Description" value={stat.description} onChange={e => handleArrayChange('statistics', i, 'description', e.target.value)} />
                        <input type="text" className="form-control" placeholder="Source" value={stat.source} onChange={e => handleArrayChange('statistics', i, 'source', e.target.value)} />
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

export default SubAdminSciencePageEditor;
