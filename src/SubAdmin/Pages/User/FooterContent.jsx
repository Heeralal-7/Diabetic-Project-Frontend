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
import { MyContext } from '../../../Context/Context';
import axios from 'axios';
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

function FooterContent() {
  const { 
    // Existing footer context values
    getPolicy,
    createPolicy,
    updatePolicy,
    getContent,
    createContent,
    updateContent,
    loadingFooter,
    errorFooter,
    footerData,
    policyData,
    clearError
  } = useContext(MyContext);

  // ✅ LOCAL STATE FOR BANKS LOGO
  const [banksLogoData, setBanksLogoData] = useState([]);
  const [banksLogoLoading, setBanksLogoLoading] = useState(false);
  const [banksLogoError, setBanksLogoError] = useState(null);
  const [banksLogoMessage, setBanksLogoMessage] = useState('');

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

  // ✅ AUTO-CLEAR MESSAGES EFFECT
  useEffect(() => {
    let timer;
    if (banksLogoError || banksLogoMessage || message || errorFooter) {
      timer = setTimeout(() => {
        setBanksLogoError(null);
        setBanksLogoMessage('');
        setMessage('');
        clearError();
      }, 5000); // 5 seconds
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [banksLogoError, banksLogoMessage, message, errorFooter]);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await getPolicy();
      await getContent();
      await getBanksLogo(); // ✅ Local function call karo
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // ✅ GET BANKS LOGO FUNCTION
  const getBanksLogo = async () => {
    const token = sessionStorage.getItem('subadmintoken');
    setBanksLogoLoading(true);
    setBanksLogoError(null);
    setBanksLogoMessage('');

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/footerSub/get-banks-logo`,
        {
          headers: {
            token: token
          }
        }
      );

      if (response.data.success) {
        // API response ke according data access karo
        const logos = response.data.data?.banksLogos || [];
        setBanksLogoData(logos);
        setBanksLogoMessage('Bank logos loaded successfully');
      } else {
        setBanksLogoError(response.data.error || 'Failed to fetch logos');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Network error';
      setBanksLogoError(errorMsg);
      console.error('Error fetching bank logos:', error);
    } finally {
      setBanksLogoLoading(false);
    }
  };

  // ✅ CREATE BANKS LOGO FUNCTION
  const createBanksLogo = async (formData) => {
    const token = sessionStorage.getItem('subadmintoken');
    setBanksLogoLoading(true);
    setBanksLogoError(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/footerSub/create-banks-logo`,
        formData,
        {
          headers: {
            'token': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setBanksLogoMessage('Logos uploaded successfully');
        await getBanksLogo(); // Refresh list
        return response.data;
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setBanksLogoError(errorMsg);
      throw error;
    } finally {
      setBanksLogoLoading(false);
    }
  };

  // ✅ UPDATE BANKS LOGO FUNCTION
  const updateBanksLogo = async (id, updateData) => {
    const token = sessionStorage.getItem('subadmintoken');
    setBanksLogoLoading(true);
    setBanksLogoError(null);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/footerSub/update-banks-logo/${id}`,
        updateData,
        {
          headers: {
            'token': token
          }
        }
      );

      if (response.data.success) {
        setBanksLogoMessage('Logo updated successfully');
        await getBanksLogo(); // Refresh list
        return response.data;
      } else {
        throw new Error(response.data.error || 'Update failed');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setBanksLogoError(errorMsg);
      throw error;
    } finally {
      setBanksLogoLoading(false);
    }
  };

  // ✅ UPDATE BANKS LOGO IMAGE FUNCTION
  const updateBanksLogoImage = async (id, formData) => {
    const token = sessionStorage.getItem('subadmintoken');
    setBanksLogoLoading(true);
    setBanksLogoError(null);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/footerSub/update-banks-logo-image/${id}`,
        formData,
        {
          headers: {
            'token': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setBanksLogoMessage('Logo image replaced successfully');
        await getBanksLogo(); // Refresh list
        return response.data;
      } else {
        throw new Error(response.data.error || 'Image replacement failed');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setBanksLogoError(errorMsg);
      throw error;
    } finally {
      setBanksLogoLoading(false);
    }
  };

  // ✅ DELETE BANKS LOGO FUNCTION
  const deleteBanksLogo = async (id) => {
    const token = sessionStorage.getItem('subadmintoken');
    setBanksLogoLoading(true);
    setBanksLogoError(null);

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/footerSub/delete-banks-logo/${id}`,
        {
          headers: {
            'token': token
          }
        }
      );

      if (response.data.success) {
        setBanksLogoMessage('Logo deleted successfully');
        await getBanksLogo(); // Refresh list
        return response.data;
      } else {
        throw new Error(response.data.error || 'Delete failed');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setBanksLogoError(errorMsg);
      throw error;
    } finally {
      setBanksLogoLoading(false);
    }
  };

  // ✅ DELETE ALL BANKS LOGO FUNCTION
  const deleteAllBanksLogo = async () => {
    const token = sessionStorage.getItem('subadmintoken');
    setBanksLogoLoading(true);
    setBanksLogoError(null);

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/footerSub/delete-all-banks-logo`,
        {
          headers: {
            'token': token
          }
        }
      );

      if (response.data.success) {
        setBanksLogoMessage('All logos deleted successfully');
        setBanksLogoData([]);
        return response.data;
      } else {
        throw new Error(response.data.error || 'Delete all failed');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setBanksLogoError(errorMsg);
      throw error;
    } finally {
      setBanksLogoLoading(false);
    }
  };

  // ✅ REORDER BANKS LOGO FUNCTION
  const reorderBanksLogo = async (logoOrders) => {
    const token = sessionStorage.getItem('subadmintoken');
    setBanksLogoLoading(true);
    setBanksLogoError(null);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/footerSub/reorder-banks-logo`,
        { logoOrders },
        {
          headers: {
            'token': token
          }
        }
      );

      if (response.data.success) {
        setBanksLogoMessage('Logo order updated successfully');
        await getBanksLogo(); // Refresh list
        return response.data;
      } else {
        throw new Error(response.data.error || 'Reorder failed');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setBanksLogoError(errorMsg);
      throw error;
    } finally {
      setBanksLogoLoading(false);
    }
  };

  // ✅ CLEAR BANKS LOGO ERROR FUNCTION
  const clearBanksLogoError = () => {
    setBanksLogoError(null);
    setBanksLogoMessage('');
  };

  // ✅ Initialize forms with existing data
  useEffect(() => {
    if (footerData) {
      setFooterFormData({
        easyHeading: footerData.easyHeading || '',
        easyContent: footerData.easyContent || '',
        easyIcon: null,
        affordableHeading: footerData.affordableHeading || '',
        affordableContent: footerData.affordableContent || '',
        affordableIcon: null,
        accessibleHeading: footerData.accessibleHeading || '',
        accessibleContent: footerData.accessibleContent || '',
        accessibleIcon: null
      });
    }

    if (policyData) {
      setPolicyFormData({
        privacyPolicy: policyData.privacyPolicy || '',
        termsAndConditions: policyData.termsAndConditions || ''
      });
    }
  }, [footerData, policyData]);

  // ✅ Function to get full image URL (Corrected)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If already a full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Remove query parameters for display
    const cleanPath = imagePath.split('?')[0];
    
    // Ensure it starts with a slash
    const formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    return `${Base_URL}${formattedPath}`;
  };

  // ==================== BANKS LOGOS HANDLERS ====================

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

      await createBanksLogo(formData);
      
      // Clear form
      setMultipleLogosFiles([]);
      setMultipleLogosPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  // ✅ Handle refresh logos
  const handleRefreshLogos = async () => {
    try {
      setMessage('');
      await getBanksLogo();
    } catch (err) {
      console.error('Refresh error:', err);
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

      await updateBanksLogo(logoToEdit._id, updateData);
      setShowEditModal(false);
      
    } catch (err) {
      console.error('Update error:', err);
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

      await updateBanksLogoImage(logoToReplace._id, formData);
      setShowReplaceModal(false);
      
    } catch (err) {
      console.error('Replace error:', err);
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
      await deleteBanksLogo(logoToDelete);
      setShowDeleteModal(false);
      
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // ✅ Handle delete all logos
  const handleDeleteAllLogos = async () => {
    try {
      await deleteAllBanksLogo();
      setShowDeleteAllModal(false);
      
    } catch (err) {
      console.error('Delete all error:', err);
    }
  };

  // ✅ Handle reorder logos (move up)
  const handleMoveLogoUp = async (logoId, currentOrder) => {
    if (currentOrder <= 0) return;
    
    try {
      const logoOrders = banksLogoData.map(logo => ({
        logoId: logo._id,
        order: logo._id === logoId ? currentOrder - 1 : 
               logo.order === currentOrder - 1 ? currentOrder : logo.order
      }));

      await reorderBanksLogo(logoOrders);
      
    } catch (err) {
      console.error('Move up error:', err);
    }
  };

  // ✅ Handle reorder logos (move down)
  const handleMoveLogoDown = async (logoId, currentOrder) => {
    if (currentOrder >= banksLogoData.length - 1) return;
    
    try {
      const logoOrders = banksLogoData.map(logo => ({
        logoId: logo._id,
        order: logo._id === logoId ? currentOrder + 1 : 
               logo.order === currentOrder + 1 ? currentOrder : logo.order
      }));

      await reorderBanksLogo(logoOrders);
      
    } catch (err) {
      console.error('Move down error:', err);
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

      await updateBanksLogo(logo._id, updateData);
      
      // Clear edits for this logo
      setLogoEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[logo._id];
        return newEdits;
      });
      
    } catch (err) {
      console.error('Save edit error:', err);
    }
  };

  // ==================== EXISTING FOOTER HANDLERS ====================

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

      let response;
      if (footerData && footerData._id) {
        response = await updateContent(footerData._id, submitData);
      } else {
        response = await createContent(submitData);
      }

      if (response.success) {
        setMessage('Footer content updated successfully!');
        await getContent();
      }

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
      let response;
      if (policyData) {
        response = await updatePolicy(policyFormData);
      } else {
        response = await createPolicy(policyFormData);
      }

      if (response.success) {
        setMessage('Policies updated successfully!');
        await getPolicy();
      }
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

  // ✅ Render Bank Logos Tab (Admin design ke according)
  const renderBankLogosTab = () => {
    return (
      <div className="pt-3">
        {/* Messages - Auto clear after 5 seconds */}
        {(banksLogoError || banksLogoMessage) && (
          <Alert 
            variant={banksLogoError ? 'danger' : 'success'} 
            className="mb-4"
          >
            {banksLogoError || banksLogoMessage}
          </Alert>
        )}

        {/* Upload Multiple Logos Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0 d-flex align-items-center">
              <Upload className="me-2" />
              Upload Multiple Bank Logos
              {banksLogoLoading && (
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
                  disabled={banksLogoLoading}
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
                  disabled={banksLogoLoading || multipleLogosFiles.length === 0}
                  className="px-4 py-2"
                >
                  {banksLogoLoading ? (
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
              {banksLogoLoading ? (
                <Spinner animation="border" size="sm" className="ms-2" />
              ) : (
                <>
                  <Badge bg="light" text="dark" className="ms-2">
                    {banksLogoData?.length || 0} Total
                  </Badge>
                  <Badge bg="success" className="ms-1">
                    {banksLogoData?.filter(logo => logo.isActive).length || 0} Active
                  </Badge>
                </>
              )}
            </h5>
            <div>
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={handleRefreshLogos}
                disabled={banksLogoLoading}
                className="me-2"
              >
                <ArrowRepeat size={14} className="me-1" />
                Refresh
              </Button>
              {banksLogoData && banksLogoData.length > 0 && (
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => setShowDeleteAllModal(true)}
                  disabled={banksLogoLoading}
                >
                  <Trash size={14} className="me-1" />
                  Delete All
                </Button>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            {banksLogoLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading bank logos...</p>
              </div>
            ) : !banksLogoData || banksLogoData.length === 0 ? (
              <div className="text-center py-5">
                <Bank size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No Bank Logos Uploaded</h5>
                <p className="text-muted mb-0">Upload bank logos using the form above</p>
                <small className="text-muted">You can upload multiple logos at once</small>
              </div>
            ) : (
              <Row>
                {banksLogoData
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((logo, index) => {
                    const currentEdits = logoEdits[logo._id] || {};
                    const hasChanges = 
                      currentEdits.name !== undefined && currentEdits.name !== logo.name ||
                      currentEdits.order !== undefined && currentEdits.order !== logo.order ||
                      currentEdits.isActive !== undefined && currentEdits.isActive !== logo.isActive;

                    const imageUrl = getImageUrl(logo.url);

                    return (
                      <Col lg={3} md={4} sm={6} key={logo._id || index} className="mb-4">
                        <Card className="h-100 shadow-sm">
                          <Card.Body className="p-3">
                            {/* Logo Image */}
                            <div className="position-relative text-center mb-3">
                              <Image 
                                src={imageUrl}
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
                                  {banksLogoData.map((_, idx) => (
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
                                  disabled={banksLogoLoading}
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
                                  disabled={(logo.order || 0) === 0 || banksLogoLoading}
                                  title="Move Up"
                                >
                                  <SortNumericUp size={14} />
                                </Button>
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  onClick={() => handleMoveLogoDown(logo._id, logo.order || 0)}
                                  disabled={(logo.order || 0) >= banksLogoData.length - 1 || banksLogoLoading}
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
          {banksLogoData && banksLogoData.length > 0 && (
            <Card.Footer className="text-center">
              <small className="text-muted">
                Showing {banksLogoData.length} logo(s). Click on logo cards to edit details.
              </small>
            </Card.Footer>
          )}
        </Card>
      </div>
    );
  };

  // Existing renderFooterSection function
  const renderFooterSection = (title, prefix) => {
    const existingImagePath = footerData?.[`${prefix}Icon`];
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

          {/* Auto-clear messages */}
          {(errorFooter || message) && (
            <Alert 
              variant={errorFooter || message.includes('Error') ? 'danger' : 'success'} 
              className="mb-4"
            >
              {errorFooter || message}
            </Alert>
          )}

          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => {
                  setActiveTab(k);
                  clearError();
                  clearBanksLogoError();
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
                          disabled={loadingFooter}
                          className="px-4 py-2"
                          size="lg"
                        >
                          {loadingFooter ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              {footerData ? 'Updating...' : 'Creating...'}
                            </>
                          ) : (
                            <>
                              <Upload className="me-2" />
                              {footerData ? 'Update Footer Content' : 'Create Footer Content'}
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
                          disabled={loadingFooter}
                          className="px-4 py-2"
                          size="lg"
                        >
                          {loadingFooter ? (
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
            disabled={banksLogoLoading}
          >
            {banksLogoLoading ? (
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
              <strong>This will permanently delete {banksLogoData?.length || 0} logo(s).</strong>
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
            disabled={banksLogoLoading}
          >
            {banksLogoLoading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <Trash className="me-2" />
            )}
            Delete All {banksLogoData?.length || 0} Logo(s)
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
                      max={banksLogoData?.length - 1 || 0}
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
            disabled={banksLogoLoading}
          >
            {banksLogoLoading ? (
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
            disabled={banksLogoLoading || !replaceLogoFile}
          >
            {banksLogoLoading ? (
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
}

export default FooterContent;
