import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Spinner, 
  Alert, 
  Image,
  Tabs,
  Tab,
  Modal,
  Badge,
  InputGroup
} from 'react-bootstrap';
import { MyContext } from '../../Context/Context';
import { 
  Upload, 
  Image as ImageIcon, 
  Bank,
  Trash,
  CheckCircle,
  XCircle,
  ArrowRepeat,
  Pencil,
  SortNumericDown,
  SortNumericUp
} from 'react-bootstrap-icons';

const FooterManagement = () => {
  const { 
    // Existing context values
    footerContent, 
    policies, 
    loading, 
    error, 
    createFooterContent, 
    updateFooterContent, 
    updatePolicies,
    clearError,
    getFooterContent,
    getPolicies,

    // ✅ Multiple banks logos context values
    banksLogos,
    banksLogosLoading,
    banksLogosError,
    banksLogosMessage,
    getBanksLogos,
    createBanksLogos,
    updateBankLogo,
    updateBankLogoImage,
    deleteBankLogo,
    deleteAllBanksLogos,
    reorderBanksLogos,
    clearBankLogosError
  } = useContext(MyContext);

  const [activeTab, setActiveTab] = useState('content');
  const [message, setMessage] = useState('');
  
  // Existing form states
  const [footerFormData, setFooterFormData] = useState({
    easyHeading: '',
    easyContent: '',
    easyIcon: null,
    affordableHeading: '',
    affordableContent: '',
    affordableIcon: null,
    accessibleHeading: '',
    accessibleContent: '',
    accessibleIcon: null
  });
  const [policyFormData, setPolicyFormData] = useState({
    privacyPolicy: '',
    termsAndConditions: ''
  });
  const [previewUrls, setPreviewUrls] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // ✅ Bank Logos multiple states
  const [multipleLogosFiles, setMultipleLogosFiles] = useState([]);
  const [multipleLogosPreview, setMultipleLogosPreview] = useState([]);
  const [logoEdits, setLogoEdits] = useState({});
  const [editLogoName, setEditLogoName] = useState('');
  const [editLogoOrder, setEditLogoOrder] = useState(0);
  const [editLogoActive, setEditLogoActive] = useState(true);
  const [replaceLogoFile, setReplaceLogoFile] = useState(null);
  const [replaceLogoPreview, setReplaceLogoPreview] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [logoToDelete, setLogoToDelete] = useState(null);
  const [logoToEdit, setLogoToEdit] = useState(null);
  const [logoToReplace, setLogoToReplace] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  // Base URL for image display
  const Base_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

  // ✅ Fetch banks logos on component mount
  useEffect(() => {
    const fetchBanksLogos = async () => {
      try {
        await getBanksLogos();
      } catch (error) {
        console.error('Error fetching bank logos on mount:', error);
      }
    };
    
    fetchBanksLogos();
  }, []);

  // Initialize forms with existing data
  useEffect(() => {
    if (footerContent?.data) {
      const content = footerContent.data;
      setFooterFormData({
        easyHeading: content.easyHeading || '',
        easyContent: content.easyContent || '',
        easyIcon: null,
        affordableHeading: content.affordableHeading || '',
        affordableContent: content.affordableContent || '',
        affordableIcon: null,
        accessibleHeading: content.accessibleHeading || '',
        accessibleContent: content.accessibleContent || '',
        accessibleIcon: null
      });
    }

    if (policies) {
      setPolicyFormData({
        privacyPolicy: policies.privacyPolicy || '',
        termsAndConditions: policies.termsAndConditions || ''
      });
    }
  }, [footerContent, policies]);

  // Function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If imagePath already contains full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Remove leading slash if present to avoid double slash
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Construct full URL
    return `${Base_URL}/${cleanPath}`;
  };

  // ==================== BANK LOGOS MULTIPLE HANDLERS ====================

  // ✅ Handle multiple files selection
  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setMessage('Only image files are allowed');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setMessage('File size exceeds 10MB limit: ' + file.name);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setMessage('No valid image files selected');
      return;
    }

    setMultipleLogosFiles(validFiles);
    clearBankLogosError();
    setMessage('');

    // Create previews
    const previews = validFiles.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      name: file.name,
      file: file
    }));

    setMultipleLogosPreview(previews);
  };

  // ✅ Handle multiple logos submit
  const handleMultipleLogosSubmit = async (e) => {
    e.preventDefault();
    clearBankLogosError();
    setMessage('');

    if (multipleLogosFiles.length === 0) {
      setMessage('Please select at least one logo image');
      return;
    }

    try {
      const formData = new FormData();
      
      // Add all files to formData
      multipleLogosFiles.forEach((file, index) => {
        formData.append('banksLogos', file);
      });

      await createBanksLogos(formData);
      
      // Clear form
      setMultipleLogosFiles([]);
      setMultipleLogosPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh logos
      await getBanksLogos();
      
      setMessage('Logos uploaded successfully!');
      
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Failed to upload logos'));
    }
  };

  // ✅ Handle refresh logos
  const handleRefreshLogos = async () => {
    try {
      setMessage('');
      await getBanksLogos();
      setMessage('Logos refreshed successfully!');
    } catch (err) {
      setMessage('Error refreshing logos: ' + (err.response?.data?.error || err.message));
    }
  };

  // ✅ Handle logo edit click
  const handleLogoEditClick = (logo) => {
    setLogoToEdit(logo);
    setEditLogoName(logo.name || '');
    setEditLogoOrder(logo.order || 0);
    setEditLogoActive(logo.isActive !== undefined ? logo.isActive : true);
    setShowEditModal(true);
  };

  // ✅ Handle logo update
  const handleUpdateLogo = async () => {
    try {
      if (!logoToEdit) return;

      const updateData = {
        name: editLogoName,
        order: editLogoOrder,
        isActive: editLogoActive
      };

      await updateBankLogo(logoToEdit._id, updateData);
      setShowEditModal(false);
      setMessage('Logo updated successfully!');
      
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Failed to update logo'));
    }
  };

  // ✅ Handle logo image replace click
  const handleLogoReplaceClick = (logo) => {
    setLogoToReplace(logo);
    setReplaceLogoFile(null);
    setReplaceLogoPreview('');
    setShowReplaceModal(true);
  };

  // ✅ Handle replace file change
  const handleReplaceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage('Only image files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setMessage('File size exceeds 10MB limit');
        return;
      }

      setReplaceLogoFile(file);
      setReplaceLogoPreview(URL.createObjectURL(file));
      setMessage('');
    }
  };

  // ✅ Handle replace logo image
  const handleReplaceLogoImage = async () => {
    try {
      if (!logoToReplace || !replaceLogoFile) {
        setMessage('Please select a new image');
        return;
      }

      const formData = new FormData();
      formData.append('banksLogo', replaceLogoFile);

      await updateBankLogoImage(logoToReplace._id, formData);
      setShowReplaceModal(false);
      setMessage('Logo image replaced successfully!');
      
      // Refresh logos
      await getBanksLogos();
      
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Failed to replace logo image'));
    }
  };

  // ✅ Handle delete logo click
  const handleDeleteLogoClick = (logoId) => {
    setLogoToDelete(logoId);
    setShowDeleteModal(true);
  };

  // ✅ Handle confirm delete logo
  const handleConfirmDeleteLogo = async () => {
    try {
      await deleteBankLogo(logoToDelete);
      setShowDeleteModal(false);
      setMessage('Logo deleted successfully!');
      
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Failed to delete logo'));
    }
  };

  // ✅ Handle delete all logos
  const handleDeleteAllLogos = async () => {
    try {
      await deleteAllBanksLogos();
      setShowDeleteAllModal(false);
      setMessage('All logos deleted successfully!');
      
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Failed to delete all logos'));
    }
  };

  // ✅ Handle reorder logos (move up)
  const handleMoveLogoUp = async (logoId, currentOrder) => {
    if (currentOrder <= 0) return;
    
    try {
      const logoOrders = banksLogos.map(logo => ({
        logoId: logo._id,
        order: logo._id === logoId ? currentOrder - 1 : 
               logo.order === currentOrder - 1 ? currentOrder : logo.order
      }));

      await reorderBanksLogos(logoOrders);
      setMessage('Logo order updated!');
      
    } catch (err) {
      setMessage('Error updating logo order');
    }
  };

  // ✅ Handle reorder logos (move down)
  const handleMoveLogoDown = async (logoId, currentOrder) => {
    if (currentOrder >= banksLogos.length - 1) return;
    
    try {
      const logoOrders = banksLogos.map(logo => ({
        logoId: logo._id,
        order: logo._id === logoId ? currentOrder + 1 : 
               logo.order === currentOrder + 1 ? currentOrder : logo.order
      }));

      await reorderBanksLogos(logoOrders);
      setMessage('Logo order updated!');
      
    } catch (err) {
      setMessage('Error updating logo order');
    }
  };

  // ✅ Handle logo edit field change
  const handleLogoEditChange = (logoId, field, value) => {
    setLogoEdits(prev => ({
      ...prev,
      [logoId]: {
        ...prev[logoId],
        [field]: value
      }
    }));
  };

  // ✅ Handle save logo edits
  const handleSaveLogoEdit = async (logo) => {
    try {
      const edits = logoEdits[logo._id];
      if (!edits) return;

      const updateData = {
        name: edits.name !== undefined ? edits.name : logo.name,
        order: edits.order !== undefined ? edits.order : logo.order,
        isActive: edits.isActive !== undefined ? edits.isActive : logo.isActive
      };

      await updateBankLogo(logo._id, updateData);
      
      // Clear edits for this logo
      setLogoEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[logo._id];
        return newEdits;
      });
      
      setMessage('Logo updated successfully!');
      
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Failed to update logo'));
    }
  };

  // ==================== EXISTING HANDLERS ====================

  const handleFooterInputChange = (e) => {
    const { name, value } = e.target;
    setFooterFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFooterFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls(prev => ({
        ...prev,
        [fieldName]: previewUrl
      }));
      
      // Clear any previous error for this field
      setImageErrors(prev => ({
        ...prev,
        [fieldName]: false
      }));
    }
  };

  const handleFooterSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    clearError();
    
    try {
      const submitData = new FormData();
      
      // Add text fields
      Object.keys(footerFormData).forEach(key => {
        if (footerFormData[key] && typeof footerFormData[key] !== 'object') {
          submitData.append(key, footerFormData[key]);
        }
      });

      // Add files
      if (footerFormData.easyIcon) submitData.append('easyIcon', footerFormData.easyIcon);
      if (footerFormData.affordableIcon) submitData.append('affordableIcon', footerFormData.affordableIcon);
      if (footerFormData.accessibleIcon) submitData.append('accessibleIcon', footerFormData.accessibleIcon);

      if (footerContent?.data?._id) {
        await updateFooterContent(footerContent.data._id, submitData);
        setMessage('Footer content updated successfully!');
      } else {
        await createFooterContent(submitData);
        setMessage('Footer content created successfully!');
      }

      // Refresh data
      await getFooterContent();
      setPreviewUrls({});
      
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Something went wrong'));
    }
  };

  const handlePolicyInputChange = (e) => {
    const { name, value } = e.target;
    setPolicyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    clearError();
    
    try {
      await updatePolicies(policyFormData);
      await getPolicies();
      setMessage('Policies updated successfully!');
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Something went wrong'));
    }
  };

  const handleImageError = (fieldName) => {
    setImageErrors(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleImageLoad = (fieldName) => {
    setImageErrors(prev => ({
      ...prev,
      [fieldName]: false
    }));
  };

  // ==================== RENDER FUNCTIONS ====================

  // ✅ Render Bank Logos Tab
  const renderBankLogosTab = () => {
    return (
      <div className="pt-3">
        {/* Messages */}
        {(banksLogosError || banksLogosMessage || message) && (
          <Alert 
            variant={banksLogosError || message.includes('Error') ? 'danger' : 'success'} 
            dismissible 
            onClose={() => { 
              clearBankLogosError();
              setMessage(''); 
            }}
            className="mb-4"
          >
            {banksLogosError || banksLogosMessage || message}
          </Alert>
        )}

        {/* Upload Multiple Logos Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0 d-flex align-items-center">
              <Upload className="me-2" />
              Upload Multiple Bank Logos
              {banksLogosLoading && (
                <Spinner animation="border" size="sm" className="ms-2" />
              )}
            </h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleMultipleLogosSubmit}>
              <Form.Group className="mb-4">
                <Form.Label>
                  <strong>
                    <Upload className="me-2" />
                    Select Bank Logo Images (Multiple)
                  </strong>
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleFilesChange}
                  disabled={banksLogosLoading}
                  ref={fileInputRef}
                />
                <Form.Text className="text-muted">
                  Select multiple images (JPEG, PNG, GIF, SVG, WebP) | Max 10MB per file | Max 20 files at once
                </Form.Text>
              </Form.Group>

              {/* Preview Section */}
              {multipleLogosPreview.length > 0 && (
                <Card className="mb-4 border-success">
                  <Card.Header className="bg-success bg-opacity-10">
                    <h6 className="mb-0 text-success d-flex align-items-center">
                      <CheckCircle className="me-2" />
                      {multipleLogosPreview.length} Logo(s) Ready for Upload
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="ms-auto"
                        onClick={() => {
                          setMultipleLogosFiles([]);
                          setMultipleLogosPreview([]);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Clear All
                      </Button>
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {multipleLogosPreview.map((preview, index) => (
                        <Col lg={2} md={3} sm={4} xs={6} key={preview.id} className="mb-3">
                          <Card className="h-100">
                            <Card.Body className="text-center p-2">
                              <Image 
                                src={preview.url}
                                alt={`Logo ${index + 1}`}
                                style={{ 
                                  maxWidth: '100%', 
                                  height: '80px',
                                  objectFit: 'contain'
                                }}
                                thumbnail
                              />
                              <small className="text-muted d-block mt-2 text-truncate">
                                {preview.name}
                              </small>
                              <Badge bg="info" className="mt-1">
                                #{index + 1}
                              </Badge>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              )}

              <div className="text-end">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={banksLogosLoading || multipleLogosFiles.length === 0}
                  className="px-4 py-2"
                >
                  {banksLogosLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="me-2" />
                      Upload {multipleLogosFiles.length} Logo(s)
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Display Current Logos */}
        <Card className="shadow-sm">
          <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex align-items-center">
              <Bank className="me-2" />
              Current Bank Logos 
              {banksLogosLoading ? (
                <Spinner animation="border" size="sm" className="ms-2" />
              ) : (
                <>
                  <Badge bg="light" text="dark" className="ms-2">
                    {banksLogos?.length || 0} Total
                  </Badge>
                  <Badge bg="success" className="ms-1">
                    {banksLogos?.filter(logo => logo.isActive).length || 0} Active
                  </Badge>
                </>
              )}
            </h5>
            <div>
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={handleRefreshLogos}
                disabled={banksLogosLoading}
                className="me-2"
              >
                <ArrowRepeat size={14} className="me-1" />
                Refresh
              </Button>
              {banksLogos && banksLogos.length > 0 && (
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => setShowDeleteAllModal(true)}
                  disabled={banksLogosLoading}
                >
                  <Trash size={14} className="me-1" />
                  Delete All
                </Button>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            {banksLogosLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading bank logos...</p>
              </div>
            ) : !banksLogos || banksLogos.length === 0 ? (
              <div className="text-center py-5">
                <Bank size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No Bank Logos Uploaded</h5>
                <p className="text-muted mb-0">Upload bank logos using the form above</p>
                <small className="text-muted">You can upload multiple logos at once</small>
              </div>
            ) : (
              <Row>
                {banksLogos
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((logo, index) => {
                    const currentEdits = logoEdits[logo._id] || {};
                    const hasChanges = 
                      currentEdits.name !== undefined && currentEdits.name !== logo.name ||
                      currentEdits.order !== undefined && currentEdits.order !== logo.order ||
                      currentEdits.isActive !== undefined && currentEdits.isActive !== logo.isActive;

                    return (
                      <Col lg={3} md={4} sm={6} key={logo._id || index} className="mb-4">
                        <Card className="h-100 shadow-sm">
                          <Card.Body className="p-3">
                            {/* Logo Image */}
                            <div className="position-relative text-center mb-3">
                              <Image 
                                src={getImageUrl(logo.url)}
                                alt={logo.name || `Bank Logo ${index + 1}`}
                                style={{ 
                                  maxWidth: '100%', 
                                  height: '120px',
                                  objectFit: 'contain'
                                }}
                                className="mb-2"
                                thumbnail
                                onError={() => setImageErrors(prev => ({...prev, [logo._id]: true}))}
                              />
                              
                              {/* Status Badges */}
                              <div className="position-absolute top-0 start-0">
                                <Badge bg={(currentEdits.isActive !== undefined ? currentEdits.isActive : logo.isActive) ? 'success' : 'secondary'}>
                                  {(currentEdits.isActive !== undefined ? currentEdits.isActive : logo.isActive) ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <div className="position-absolute top-0 end-0">
                                <Badge bg="info">#{index + 1}</Badge>
                              </div>
                              
                              {/* Image Error State */}
                              {imageErrors[logo._id] && (
                                <div className="position-absolute top-50 start-50 translate-middle">
                                  <div className="text-center">
                                    <XCircle size={32} className="text-danger mb-2" />
                                    <small className="text-danger d-block">Failed to load</small>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Logo Name */}
                            <Form.Group className="mb-3">
                              <Form.Label className="small text-muted">Logo Name</Form.Label>
                              <InputGroup size="sm">
                                <Form.Control
                                  type="text"
                                  value={currentEdits.name !== undefined ? currentEdits.name : logo.name || ''}
                                  onChange={(e) => handleLogoEditChange(logo._id, 'name', e.target.value)}
                                  placeholder="Enter logo name"
                                />
                              </InputGroup>
                            </Form.Group>
                            
                            {/* Active Status & Order */}
                            <Row className="mb-3">
                              <Col xs={6}>
                                <Form.Check
                                  type="switch"
                                  id={`active-switch-${logo._id}`}
                                  label="Active"
                                  checked={currentEdits.isActive !== undefined ? currentEdits.isActive : logo.isActive}
                                  onChange={(e) => handleLogoEditChange(logo._id, 'isActive', e.target.checked)}
                                />
                              </Col>
                              <Col xs={6}>
                                <Form.Select
                                  size="sm"
                                  value={currentEdits.order !== undefined ? currentEdits.order : logo.order || 0}
                                  onChange={(e) => handleLogoEditChange(logo._id, 'order', parseInt(e.target.value))}
                                >
                                  {banksLogos.map((_, idx) => (
                                    <option key={idx} value={idx}>{idx + 1}</option>
                                  ))}
                                </Form.Select>
                              </Col>
                            </Row>
                            
                            {/* Action Buttons */}
                            <div className="d-grid gap-2">
                              {/* Save Changes Button */}
                              {hasChanges && (
                                <Button 
                                  variant="success" 
                                  size="sm"
                                  onClick={() => handleSaveLogoEdit(logo)}
                                  disabled={banksLogosLoading}
                                >
                                  <CheckCircle size={14} className="me-1" />
                                  Save Changes
                                </Button>
                              )}
                              
                              {/* Action Buttons Group */}
                              <div className="btn-group w-100" role="group">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => handleLogoEditClick(logo)}
                                  title="Edit Details"
                                >
                                  <Pencil size={14} />
                                </Button>
                                <Button 
                                  variant="outline-warning" 
                                  size="sm"
                                  onClick={() => handleLogoReplaceClick(logo)}
                                  title="Replace Image"
                                >
                                  <Upload size={14} />
                                </Button>
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  onClick={() => handleMoveLogoUp(logo._id, logo.order || 0)}
                                  disabled={(logo.order || 0) === 0 || banksLogosLoading}
                                  title="Move Up"
                                >
                                  <SortNumericUp size={14} />
                                </Button>
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  onClick={() => handleMoveLogoDown(logo._id, logo.order || 0)}
                                  disabled={(logo.order || 0) >= banksLogos.length - 1 || banksLogosLoading}
                                  title="Move Down"
                                >
                                  <SortNumericDown size={14} />
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleDeleteLogoClick(logo._id)}
                                  title="Delete"
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                          <Card.Footer className="text-center py-2 bg-light">
                            <small className="text-muted">
                              Uploaded: {logo.uploadedAt ? new Date(logo.uploadedAt).toLocaleDateString() : 'N/A'}
                            </small>
                          </Card.Footer>
                        </Card>
                      </Col>
                    );
                  })}
              </Row>
            )}
          </Card.Body>
          {banksLogos && banksLogos.length > 0 && (
            <Card.Footer className="text-center">
              <small className="text-muted">
                Showing {banksLogos.length} logo(s). Click on logo cards to edit details.
              </small>
            </Card.Footer>
          )}
        </Card>
      </div>
    );
  };

  // Existing renderFooterSection function
  const renderFooterSection = (title, prefix) => {
    const existingImagePath = footerContent?.data?.[`${prefix}Icon`];
    const existingImageUrl = getImageUrl(existingImagePath);
    const previewImage = previewUrls[`${prefix}Icon`];
    const displayImage = previewImage || existingImageUrl;
    const hasError = imageErrors[`${prefix}Icon`];

    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{title}</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Heading</Form.Label>
                <Form.Control
                  type="text"
                  name={`${prefix}Heading`}
                  value={footerFormData[`${prefix}Heading`]}
                  onChange={handleFooterInputChange}
                  placeholder={`Enter ${title.toLowerCase()} heading`}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name={`${prefix}Content`}
                  value={footerFormData[`${prefix}Content`]}
                  onChange={handleFooterInputChange}
                  placeholder={`Enter ${title.toLowerCase()} content`}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <Upload className="me-2" />
                  Icon
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, `${prefix}Icon`)}
                />
                <Form.Text className="text-muted">
                  Upload an icon image (JPEG, PNG, GIF, SVG, WebP) - Max 10MB
                </Form.Text>
              </Form.Group>
              
              {existingImagePath && !previewImage && (
                <div className="mt-2 p-2 bg-light rounded">
                  <small className="text-muted">
                    <strong>Current Image:</strong> {existingImagePath.split('/').pop()}
                  </small>
                </div>
              )}
            </Col>
            <Col md={6}>
              {displayImage ? (
                <div className="mt-2 text-center">
                  <p className="mb-2">
                    <strong>
                      {previewImage ? 'New Preview' : 'Current Image'}
                    </strong>
                  </p>
                  
                  <div className="position-relative d-inline-block">
                    <Image 
                      src={displayImage}
                      alt={`${title} icon`}
                      style={{ 
                        maxWidth: '150px', 
                        maxHeight: '150px',
                        minWidth: '100px',
                        minHeight: '100px',
                        border: 'none',
                        borderRadius: '10px',
                        objectFit: 'contain',
                        backgroundColor: '#f8f9fa'
                      }}
                      thumbnail
                      onError={() => handleImageError(`${prefix}Icon`)}
                      onLoad={() => handleImageLoad(`${prefix}Icon`)}
                    />
                    
                    {hasError && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light rounded">
                        <div className="text-center">
                          <ImageIcon size={32} className="text-danger mb-2" />
                          <br />
                          <small className="text-danger">Failed to load</small>
                        </div>
                      </div>
                    )}
                  </div>

                  {previewImage && (
                    <div className="mt-2">
                      <small className="text-success">
                        <strong>✓ New image selected</strong>
                      </small>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center mt-4 p-4 border rounded bg-light">
                  <ImageIcon size={48} className="text-muted mb-3" />
                  <p className="text-muted mb-0">No icon uploaded yet</p>
                  <small className="text-muted">Upload an image to see preview</small>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Footer Content Management</h2>

          {(error || message) && (
            <Alert 
              variant={error || message.includes('Error') ? 'danger' : 'success'} 
              dismissible 
              onClose={() => { 
                clearError(); 
                setMessage(''); 
              }}
            >
              {error || message}
            </Alert>
          )}

          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => {
                  setActiveTab(k);
                  clearError();
                  clearBankLogosError();
                  setMessage('');
                  
                  // Refresh data when switching to bank logos tab
                  if (k === 'bank-logos') {
                    handleRefreshLogos();
                  }
                }}
                className="mb-3"
              >
                <Tab eventKey="content" title="📱 Footer Content">
                  <div className="pt-3">
                    <Form onSubmit={handleFooterSubmit}>
                      {renderFooterSection('Easy to Use', 'easy')}
                      {renderFooterSection('Affordable Pricing', 'affordable')}
                      {renderFooterSection('24/7 Accessible', 'accessible')}

                      <div className="text-end mt-4">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={loading}
                          className="px-4 py-2"
                          size="lg"
                        >
                          {loading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              {footerContent?.data ? 'Updating...' : 'Creating...'}
                            </>
                          ) : (
                            <>
                              <Upload className="me-2" />
                              {footerContent?.data ? 'Update Footer Content' : 'Create Footer Content'}
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Tab>

                <Tab eventKey="bank-logos" title="🏦 Bank Logos">
                  {renderBankLogosTab()}
                </Tab>

                <Tab eventKey="policies" title="📄 Policies">
                  <div className="pt-3">
                    <Form onSubmit={handlePolicySubmit}>
                      <Form.Group className="mb-4">
                        <Form.Label>
                          <strong>Privacy Policy</strong>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={8}
                          name="privacyPolicy"
                          value={policyFormData.privacyPolicy}
                          onChange={handlePolicyInputChange}
                          placeholder="Enter privacy policy content..."
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>
                          <strong>Terms and Conditions</strong>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={8}
                          name="termsAndConditions"
                          value={policyFormData.termsAndConditions}
                          onChange={handlePolicyInputChange}
                          placeholder="Enter terms and conditions content..."
                        />
                      </Form.Group>

                      <div className="text-end">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={loading}
                          className="px-4 py-2"
                          size="lg"
                        >
                          {loading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Upload className="me-2" />
                              Update Policies
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Single Logo Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <Trash className="me-2" />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <Trash size={48} className="text-danger mb-3" />
            <h5>Are you sure you want to delete this logo?</h5>
            <p className="text-danger mt-3">
              <strong>This action cannot be undone!</strong>
            </p>
            <p className="text-muted">
              The logo will be permanently removed from the system.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDeleteLogo}
            disabled={banksLogosLoading}
          >
            {banksLogosLoading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <Trash className="me-2" />
            )}
            Delete Logo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete All Logos Modal */}
      <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <Trash className="me-2" />
            Delete All Logos
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <XCircle size={64} className="text-danger mb-3" />
            <h4 className="text-danger">⚠️ Warning!</h4>
            <h5>Are you sure you want to delete ALL bank logos?</h5>
            <p className="text-danger mt-3">
              <strong>This will permanently delete {banksLogos?.length || 0} logo(s).</strong>
            </p>
            <p className="text-muted">
              This action cannot be undone. All bank logos will be removed from the system.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAllLogos}
            disabled={banksLogosLoading}
          >
            {banksLogosLoading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <Trash className="me-2" />
            )}
            Delete All {banksLogos?.length || 0} Logo(s)
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Logo Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <Pencil className="me-2" />
            Edit Logo Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {logoToEdit && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Logo Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editLogoName}
                  onChange={(e) => setEditLogoName(e.target.value)}
                  placeholder="Enter logo name"
                />
              </Form.Group>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Order Position</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max={banksLogos?.length - 1 || 0}
                      value={editLogoOrder}
                      onChange={(e) => setEditLogoOrder(parseInt(e.target.value))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={editLogoActive ? 'active' : 'inactive'}
                      onChange={(e) => setEditLogoActive(e.target.value === 'active')}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              {logoToEdit.url && (
                <div className="text-center mb-3">
                  <Image 
                    src={getImageUrl(logoToEdit.url)}
                    alt="Current Logo"
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '100px',
                      objectFit: 'contain'
                    }}
                    thumbnail
                  />
                  <small className="text-muted d-block mt-2">
                    Current Logo
                  </small>
                </div>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateLogo}
            disabled={banksLogosLoading}
          >
            {banksLogosLoading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <CheckCircle className="me-2" />
            )}
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Replace Logo Image Modal */}
      <Modal show={showReplaceModal} onHide={() => setShowReplaceModal(false)} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <Upload className="me-2" />
            Replace Logo Image
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {logoToReplace && (
            <>
              <div className="text-center mb-4">
                <h6>Current Logo</h6>
                <Image 
                  src={getImageUrl(logoToReplace.url)}
                  alt="Current Logo"
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '100px',
                    objectFit: 'contain'
                  }}
                  thumbnail
                  className="mb-3"
                />
                
                <h6 className="mt-4">Select New Image</h6>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleReplaceFileChange}
                  ref={replaceFileInputRef}
                  className="mb-3"
                />
                
                {replaceLogoPreview && (
                  <div className="mt-3">
                    <h6>New Preview</h6>
                    <Image 
                      src={replaceLogoPreview}
                      alt="New Logo Preview"
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '100px',
                        objectFit: 'contain'
                      }}
                      thumbnail
                    />
                  </div>
                )}
              </div>
              
              <Alert variant="info">
                <small>
                  <strong>Note:</strong> This will replace the current logo image. 
                  The logo name and other details will remain unchanged.
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReplaceModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="warning" 
            onClick={handleReplaceLogoImage}
            disabled={banksLogosLoading || !replaceLogoFile}
          >
            {banksLogosLoading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <Upload className="me-2" />
            )}
            Replace Image
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FooterManagement;
