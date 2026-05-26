// src/ClinicPanel/Pages/ClinicDocuments.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { MyContext } from '../../Context/Context';
import { toast } from 'react-toastify';

const ClinicDocuments = () => {
  const { 
    loading, 
    getClinicProfile, 
    updateClinicDocuments 
  } = useContext(MyContext);
  
  const [documents, setDocuments] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    licenceImage: null,
    accreditation: null,
    doctorCertificate: null,
    aadharCard: [],
    panCard: [],
    drivingLicence: []
  });
  const [previewUrls, setPreviewUrls] = useState({});

  // Refs for file inputs
  const licenceImageRef = useRef(null);
  const accreditationRef = useRef(null);
  const doctorCertificateRef = useRef(null);
  const aadharCardRef = useRef(null);
  const panCardRef = useRef(null);
  const drivingLicenceRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'YOUR_API_BASE_URL';

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      console.log("Attempting to fetch clinic profile...");
      const responseData = await getClinicProfile();

      if (responseData && responseData.success) {
        console.log("Clinic profile fetched successfully:", responseData);
        setProfileDetails(responseData.details);
        // Set documents in the format expected by the first code
        setDocuments(extractDocumentsForDisplay(responseData.details));
      } else {
        console.error("Failed to fetch clinic profile or response indicates failure:", responseData);
        toast.error('Failed to load clinic documents');
      }
    } catch (err) {
      console.error("Error in fetchDocuments:", err);
      toast.error('Failed to load clinic documents');
    }
  };

  // Helper to extract document info in the format expected by the first code
  const extractDocumentsForDisplay = (details) => {
    if (!details) {
      console.log("No details found to extract documents from.");
      return null;
    }

    const extracted = {
      // Single document fields
      licenceImage: details.certificateImage || details.licenceCertificate || '',
      accreditation: details.myDocumentId?.accreditation || '',
      doctorCertificate: details.myDocumentId?.doctorCertificate || '',
      
      // Array fields
      aadharCard: details.myDocumentId?.aadharCard || [],
      panCard: details.myDocumentId?.panCard || [],
      drivingLicence: details.myDocumentId?.drivingLicence || [],

      // Status fields
      licenceImageStatus: details.CertificateStatus || details.licenceCertificateStatus || '2',
      accreditationStatus: details.myDocumentId?.accreditationStatus || '2',
      doctorCertificateStatus: details.myDocumentId?.doctorCertificateStatus || '2',
      aadharCardStatus: details.myDocumentId?.aadharCardStatus || '2',
      panCardStatus: details.myDocumentId?.panCardStatus || '2',
      drivingLicenceStatus: details.myDocumentId?.drivingLicenceStatus || '2'
    };

    console.log("Extracted documents for display:", extracted);
    return extracted;
  };

  // Original extract function for gallery view (from second code)
  const extractDocumentsFromProfile = (details) => {
    if (!details) {
      console.log("No details found to extract documents from.");
      return [];
    }

    const extracted = [];

    // 1. Mapping fields directly under 'details'
    if (details.certificateImage) {
      extracted.push({ id: 'clinic-certificate-image', name: 'Clinic Certificate Image', type: 'Image', url: details.certificateImage, status: details.CertificateStatus });
    }
    if (details.licenceCertificate) {
      extracted.push({ id: 'clinic-licence-doc', name: 'Clinic License Certificate', type: 'Image', url: details.licenceCertificate, status: details.licenceCertificateStatus });
    }

    // 2. Mapping documents nested under 'myDocumentId'
    if (details.myDocumentId) {
      const myDocs = details.myDocumentId;
      
      // Single document fields inside myDocumentId
      if (myDocs.licenceNo) {
        extracted.push({ id: 'clinic-licence-no-doc', name: 'Clinic License Number Doc', type: 'Document', url: myDocs.licenceNo, status: myDocs.licenceNoStatus });
      }
      if (myDocs.accreditation) {
        extracted.push({ id: 'clinic-accreditation-doc', name: 'Clinic Accreditation Doc', type: 'Document', url: myDocs.accreditation, status: myDocs.accreditationStatus });
      }
      if (myDocs.doctorCertificate) {
        extracted.push({ id: 'clinic-doctor-certificate-doc', name: 'Clinic Doctor Certificate Doc', type: 'Image', url: myDocs.doctorCertificate, status: myDocs.doctorCertificateStatus });
      }

      // Array fields inside myDocumentId
      if (myDocs.aadharCard && myDocs.aadharCard.length > 0) {
        myDocs.aadharCard.forEach((card, index) => {
          extracted.push({ id: `clinic-aadhar-card-${index}`, name: `Clinic Aadhar Card (${index + 1})`, type: 'Image', url: card, status: myDocs.aadharCardStatus });
        });
      }
      if (myDocs.panCard && myDocs.panCard.length > 0) {
        myDocs.panCard.forEach((card, index) => {
          extracted.push({ id: `clinic-pan-card-${index}`, name: `Clinic Pan Card (${index + 1})`, type: 'Image', url: card, status: myDocs.panCardStatus });
        });
      }
      if (myDocs.drivingLicence && myDocs.drivingLicence.length > 0) {
        myDocs.drivingLicence.forEach((doc, index) => {
          extracted.push({ id: `clinic-driving-license-${index}`, name: `Clinic Driving License (${index + 1})`, type: 'Image', url: doc, status: myDocs.drivingLicenceStatus });
        });
      }
    }
    
    // Include general clinic images if they should be displayed
  
    
    return extracted;
  };

 const handleFileChange = (field, files, isArray = false) => {
    if (isArray) {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        [field]: fileArray
      }));

      // Create preview URLs for array fields
      const urls = fileArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => ({
        ...prev,
        [field]: urls
      }));
      
      // *** MODIFICATION START: Set status to '0' (Pending) locally for array fields ***
      setDocuments(prevDocs => {
        if (!prevDocs) return null;
        return {
          ...prevDocs,
          [field]: fileArray.length > 0 ? prevDocs[field].concat(fileArray.map(f => URL.createObjectURL(f))) : prevDocs[field], // Keep existing or update if new files are added
          [`${field}Status`]: '0' // Set status to Pending for array fields if new files are present
        };
      });
      // *** MODIFICATION END ***

    } else {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));

      // Create preview URL for single file
      if (file) {
        setPreviewUrls(prev => ({
          ...prev,
          [field]: URL.createObjectURL(file)
        }));

        // *** MODIFICATION START: Set status to '0' (Pending) locally for single file fields ***
        setDocuments(prevDocs => {
          if (!prevDocs) return null;
          return {
            ...prevDocs,
            [field]: file ? URL.createObjectURL(file) : prevDocs[field], // Use preview URL for immediate feedback if needed, or keep original logic structure
            [`${field}Status`]: '0' // Set status to Pending
          };
        });
        // *** MODIFICATION END ***
      }
    }
  };

  const removeFile = (field, index = null) => {
    if (index !== null) {
      // Remove from array
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
      
      setPreviewUrls(prev => ({
        ...prev,
        [field]: prev[field]?.filter((_, i) => i !== index) || []
      }));
    } else {
      // Remove single file
      setFormData(prev => ({
        ...prev,
        [field]: null
      }));
      
      setPreviewUrls(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await updateClinicDocuments(formData);
      if (response && response.success) {
        toast.success('Documents updated successfully!');
        // Reset form
        setFormData({
          licenceImage: null,
          accreditation: null,
          doctorCertificate: null,
          aadharCard: [],
          panCard: [],
          drivingLicence: []
        });
        setPreviewUrls({});
        // Refresh documents
        fetchDocuments();
      } else {
        toast.error('Failed to update documents');
      }
    } catch (error) {
      toast.error('Failed to update documents');
    }
  };

  // Handle image click to open modal
  const handleImageClick = (doc) => {
    setSelectedImage(doc);
  };

  // Close modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  // Download logic
  const handleDownload = (docUrl, docName) => {
    if (!docUrl) {
      console.error("Document URL is missing for:", docName);
      alert("Download link not available for this document.");
      return;
    }
    const fullUrl = `${API_BASE_URL}${docUrl}`;
    console.log(`Attempting to download from: ${fullUrl}`);

    fetch(fullUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const disposition = response.headers.get('content-disposition');
        let filename = docName.replace(/[^a-zA-Z0-9]/g, '_') || 'document';
        if (disposition && disposition.includes('attachment')) {
          const filenameMatch = disposition.match(/filename="?(.+?)"?$/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          if (contentType && contentType.includes('text/plain')) {
             if (!filename.endsWith('.txt')) {
               filename += '.txt';
             }
          } else if (!filename.includes('.')) {
             filename += '.txt';
          }
        } else {
          const extension = contentType.split('/')[1];
          if (!filename.toLowerCase().endsWith(`.${extension}`)) {
            filename = filename.replace(/\.[^/.]+$/, '') + '.' + extension;
          }
        }

        return response.blob().then(blob => ({ blob, filename, contentType }));
      })
      .then(({ blob, filename, contentType }) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error("Download failed:", err);
        alert(`Failed to download ${docName}.`);
      });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case '1':
        return <span className="badge bg-success">Verified</span>;
      case '0':
        return <span className="badge bg-warning">Pending</span>;
      case '3':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Not Specified</span>;
    }
  };

  const DocumentField = ({ 
    title, 
    field, 
    isArray = false, 
    acceptedTypes = "image/*,.pdf,.doc,.docx",
    multiple = false 
  }) => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light">
        <h5 className="card-title mb-0">
          <i className={`fas ${
            field === 'licenceImage' ? 'fa-id-card' : 
            field === 'accreditation' ? 'fa-certificate' : 
            field === 'doctorCertificate' ? 'fa-user-md' : 
            field === 'aadharCard' ? 'fa-id-card-alt' : 
            field === 'panCard' ? 'fa-credit-card' : 
            'fa-file-alt'
          } me-2 text-primary`}></i>
          {title}
          {isArray && <span className="badge bg-info ms-2">Multiple</span>}
        </h5>
      </div>
      <div className="card-body">
        {/* Current Document Status */}
        {documents && documents[field] && (
          <div className="mb-3 p-3 border rounded bg-light">
            <strong>Current Document:</strong>
            {isArray && Array.isArray(documents[field]) ? (
              <div className="mt-2">
                {documents[field].map((doc, index) => (
                  doc && (
                    <div key={index} className="d-flex align-items-center justify-content-between mb-2 p-2 border rounded">
                      <div className="d-flex align-items-center">
                        <a 
                          href={`${API_BASE_URL}${doc}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary me-2"
                        >
                          <i className="fas fa-eye me-1"></i>
                          Document {index + 1}
                        </a>
                      </div>
                      {getStatusBadge(documents[`${field}Status`])}
                    </div>
                  )
                ))}
              </div>
            ) : documents[field] ? (
              <div className="d-flex align-items-center justify-content-between mt-2 p-2 border rounded">
                <a 
                  href={`${API_BASE_URL}${documents[field]}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  <i className="fas fa-eye me-1"></i>
                  View Document
                </a>
                {getStatusBadge(documents[`${field}Status`])}
              </div>
            ) : null}
          </div>
        )}

        {/* File Upload */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Upload New {title}:</label>
          <input
            type="file"
            className="form-control"
            accept={acceptedTypes}
            multiple={multiple}
            onChange={(e) => handleFileChange(field, e.target.files, isArray)}
          />
          <div className="form-text">
            <i className="fas fa-info-circle me-1"></i>
            Supported formats: JPG, PNG, PDF, DOC, DOCX
          </div>
        </div>

        {/* Preview */}
        {previewUrls[field] && (
          <div className="mt-3">
            <strong>Preview:</strong>
            <div className="mt-2">
              {isArray ? (
                <div className="row g-2">
                  {previewUrls[field].map((url, index) => (
                    <div key={index} className="col-md-3 col-6">
                      <div className="position-relative document-thumbnail">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="img-thumbnail"
                          style={{ width: '100%', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => handleImageClick({ url, name: `${title} ${index + 1}` })}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0"
                          onClick={() => removeFile(field, index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        <div className="overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 opacity-0">
                          <i className="fas fa-search-plus text-white"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="position-relative d-inline-block document-thumbnail">
                  <img
                    src={previewUrls[field]}
                    alt="Preview"
                    className="img-thumbnail"
                    style={{ width: '200px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => handleImageClick({ url: previewUrls[field], name: title })}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute top-0 end-0"
                    onClick={() => removeFile(field)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <div className="overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 opacity-0">
                    <i className="fas fa-search-plus text-white fa-2x"></i>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Get gallery documents for display
  const galleryDocuments = profileDetails ? extractDocumentsFromProfile(profileDetails) : [];

  return (
    <div className="container-fluid py-2" style={{ marginTop: '30px' }}>
      <div className="row justify-content-center">
        <div className="col-lg-12">
          {/* Header */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header text-white" style={{ backgroundColor: '#3D4097' }}>
              <h1 className="h3 mb-0">🏢 Clinic Documents</h1>
              <small className="opacity-75">Manage and view your uploaded clinic documents</small>
            </div>
          </div>

          {/* Display Existing Documents in Gallery View */}
          {galleryDocuments.length > 0 && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-light">
                <h2 className="h5 mb-0">📁 Uploaded Clinic Documents</h2>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {galleryDocuments.map((doc) => (
                    <div key={doc.id} className="col-lg-3 col-md-4 col-sm-6">
                      <div className="card border h-100 document-card">
                        <div className="position-relative">
                          {doc.url ? (
                            <div 
                              className="document-thumbnail"
                              onClick={() => handleImageClick(doc)}
                              style={{ cursor: 'pointer' }}
                            >
                              <img
                                src={`${API_BASE_URL}${doc.url}`}
                                alt={doc.name}
                                className="card-img-top"
                                style={{
                                  height: '150px',
                                  objectFit: 'cover',
                                  borderRadius: '0.375rem 0.375rem 0 0'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div 
                                className="d-none align-items-center justify-content-center bg-light"
                                style={{ height: '150px', borderRadius: '0.375rem 0.375rem 0 0' }}
                              >
                                <i className={`fas ${doc.type === 'Image' ? 'fa-image' : 'fa-file-alt'} fa-3x text-muted`}></i>
                              </div>
                              <div className="overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 opacity-0" style={{ transition: 'opacity 0.3s', borderRadius: '0.375rem 0.375rem 0 0' }}>
                                <i className="fas fa-search-plus text-white fa-2x"></i>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="d-flex align-items-center justify-content-center bg-light"
                              style={{ height: '150px', borderRadius: '0.375rem 0.375rem 0 0' }}
                            >
                              <i className={`fas ${doc.type === 'Image' ? 'fa-image' : 'fa-file-alt'} fa-3x text-muted`}></i>
                            </div>
                          )}
                          <div className="position-absolute top-0 end-0 m-2">
                            {getStatusBadge(doc.status)}
                          </div>
                        </div>
                        <div className="card-body p-3">
                          <h6 className="card-title mb-1 text-truncate" title={doc.name}>
                            {doc.name}
                          </h6>
                          <p className="card-text small text-muted mb-2">
                            <span className="badge bg-light text-dark">{doc.type}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upload Form Section */}
          <form onSubmit={handleSubmit}>
            {/* Medical License */}
            <DocumentField
              title="Medical License"
              field="licenceImage"
              acceptedTypes="image/*,.pdf"
            />

            {/* Accreditation Certificate */}
            <DocumentField
              title="Accreditation Certificate"
              field="accreditation"
              acceptedTypes="image/*,.pdf"
            />

            {/* Doctor Certificate */}
            <DocumentField
              title="Doctor Certificate"
              field="doctorCertificate"
              acceptedTypes="image/*,.pdf"
            />

            {/* Aadhar Card */}
            <DocumentField
              title="Aadhar Card"
              field="aadharCard"
              isArray={true}
              multiple={true}
              acceptedTypes="image/*,.pdf"
            />

            {/* PAN Card */}
            <DocumentField
              title="PAN Card"
              field="panCard"
              isArray={true}
              multiple={true}
              acceptedTypes="image/*,.pdf"
            />

            {/* Driving Licence */}
            <DocumentField
              title="Driving Licence"
              field="drivingLicence"
              isArray={true}
              multiple={true}
              acceptedTypes="image/*,.pdf"
            />

            {/* Submit Button */}
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">
                      <i className="fas fa-tasks me-2 text-primary"></i>
                      Document Status Summary
                    </h6>
                    <small className="text-muted">
                      Upload all required documents for verification
                    </small>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success btn-lg px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating Documents...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt me-2"></i>
                        Update Documents
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Documents Status Overview */}
          {documents && (
            <div className="card shadow-sm border-0 mt-4">
              <div className="card-header bg-light">
                <h5 className="card-title mb-0">
                  <i className="fas fa-clipboard-list me-2 text-primary"></i>
                  Documents Status Overview
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {[
                    { field: 'licenceImage', label: 'Medical License', icon: 'fa-id-card' },
                    { field: 'accreditation', label: 'Accreditation', icon: 'fa-certificate' },
                    { field: 'doctorCertificate', label: 'Doctor Certificate', icon: 'fa-user-md' },
                    { field: 'aadharCard', label: 'Aadhar Card', icon: 'fa-id-card-alt' },
                    { field: 'panCard', label: 'PAN Card', icon: 'fa-credit-card' },
                    { field: 'drivingLicence', label: 'Driving Licence', icon: 'fa-file-alt' }
                  ].map((doc, index) => (
                    <div key={index} className="col-md-6 col-lg-4">
                      <div className="d-flex justify-content-between align-items-center p-3 border rounded document-card">
                        <div className="d-flex align-items-center">
                          <i className={`fas ${doc.icon} me-3 text-primary`}></i>
                          <span className="fw-medium">{doc.label}</span>
                        </div>
                        <span className={`badge ${
                          documents[`${doc.field}Status`] === '1' 
                            ? 'bg-success' 
                            : (documents[doc.field] && 
                                (Array.isArray(documents[doc.field]) ? documents[doc.field].length > 0 : documents[doc.field]))
                              ? 'bg-warning' 
                              : 'bg-danger'
                        }`}>
                          {documents[`${doc.field}Status`] === '1' 
                            ? 'Verified' 
                            : (documents[doc.field] && 
                                (Array.isArray(documents[doc.field]) ? documents[doc.field].length > 0 : documents[doc.field]))
                              ? 'Pending' 
                              : 'Not Uploaded'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Image View */}
      {selectedImage && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={closeModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`fas ${selectedImage.type === 'Image' ? 'fa-image' : 'fa-file-alt'} me-2 text-primary`}></i>
                  {selectedImage.name}
                </h5>
                <div className="d-flex align-items-center gap-2">
                  {selectedImage.status && getStatusBadge(selectedImage.status)}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={closeModal}
                  ></button>
                </div>
              </div>
              <div className="modal-body text-center p-0">
                {selectedImage.url ? (
                  <img
                    src={selectedImage.url.includes('http') ? selectedImage.url : `${API_BASE_URL}${selectedImage.url}`}
                    alt={selectedImage.name}
                    className="img-fluid"
                    style={{ maxHeight: '70vh', width: 'auto' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="d-none align-items-center justify-content-center p-5">
                  <div className="text-center">
                    <i className={`fas ${selectedImage.type === 'Image' ? 'fa-image' : 'fa-file-alt'} fa-4x text-muted mb-3`}></i>
                    <p className="text-muted">Unable to load image</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex justify-content-between w-100">
                  <div>
                    <span className="badge bg-light text-dark me-2">{selectedImage.type}</span>
                    <small className="text-muted">Click outside to close</small>
                  </div>
                  <div>
                    {selectedImage.url ? (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleDownload(selectedImage.url, selectedImage.name)}
                      >
                        <i className="fas fa-download me-2"></i>Download
                      </button>
                    ) : (
                      <span className="text-muted">No download available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for hover effects */}
      <style jsx>{`
        .document-card:hover .overlay {
          opacity: 1 !important;
        }
        .document-thumbnail {
          position: relative;
        }
        .document-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .document-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default ClinicDocuments;