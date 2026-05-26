// src/pages/DoctorDocuments.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { MyContext } from '../../Context/Context'; // Adjust the path as necessary

const DoctorDocuments = () => {
  // Use loading and error from context directly
  const { loading, error, getDoctorProfile, updateDoctorDocuments } = useContext(MyContext);
  const [documents, setDocuments] = useState([]);
  const [profileDetails, setProfileDetails] = useState(null); // State to hold raw profile details
  const [selectedImage, setSelectedImage] = useState(null); // State for modal image view

  // Refs for file inputs to manage form state without controlled components for files
  const licenceImageRef = useRef(null);
  const accreditationRef = useRef(null);
  const aadharCardRef = useRef(null); // Single ref for multiple files
  const panCardRef = useRef(null); // Single ref for multiple files
  const drivingLicenceRef = useRef(null); // Single ref for multiple files
  const doctorCertificateRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'YOUR_API_BASE_URL'; // Define your API base URL

  useEffect(() => {
    const fetchDoctorDataAndDocuments = async () => {
      try {
        console.log("Attempting to fetch doctor profile...");
        const responseData = await getDoctorProfile();

        if (responseData && responseData.success) {
          console.log("Doctor profile fetched successfully:", responseData);
          setProfileDetails(responseData.details);
          const extractedDocs = extractDocumentsFromProfile(responseData.details);
          setDocuments(extractedDocs);
          console.log("Extracted documents:", extractedDocs);
        } else {
          console.error("Failed to fetch doctor profile or response indicates failure:", responseData);
          // Error state should be managed by the context
        }
      } catch (err) {
        console.error("Error in fetchDoctorDataAndDocuments:", err);
        // Error state should be managed by the context
      }
    };

    fetchDoctorDataAndDocuments();
  }, []); // Depend on getDoctorProfile from context

  // Helper to extract document info for display
  const extractDocumentsFromProfile = (details) => {
    if (!details) {
      console.log("No details found to extract documents from.");
      return [];
    }

    const extracted = [];

    // Mapping specific fields
    if (details.certificateImage) {
      extracted.push({ id: 'certificate-image', name: 'Certificate Image', type: 'Image', url: details.certificateImage, status: details.CertificateStatus });
    }
    if (details.licenceCertificate) {
      extracted.push({ id: 'license-certificate', name: 'License Certificate', type: 'Image', url: details.licenceCertificate, status: details.licenceCertificateStatus });
    }
    if (details.signature) {
      extracted.push({ id: 'signature', name: 'Signature', type: 'Image', url: details.signature, status: details.signatureStatus });
    }

    // Mapping documents from myDocumentId
    if (details.myDocumentId) {
      const myDocs = details.myDocumentId;
      if (myDocs.licenceNo) {
        extracted.push({ id: 'license-no-doc', name: 'License Number Document', type: 'Document', url: myDocs.licenceNo, status: myDocs.licenceNoStatus });
      }
      if (myDocs.accreditation) {
        extracted.push({ id: 'accreditation-doc', name: 'Accreditation Document', type: 'Document', url: myDocs.accreditation, status: myDocs.accreditationStatus });
      }
      if (myDocs.aadharCard && myDocs.aadharCard.length > 0) {
        myDocs.aadharCard.forEach((card, index) => {
          extracted.push({ id: `aadhar-card-${index}`, name: `Aadhar Card (${index + 1})`, type: 'Image', url: card, status: myDocs.aadharCardStatus });
        });
      }
      if (myDocs.panCard && myDocs.panCard.length > 0) {
        myDocs.panCard.forEach((card, index) => {
          extracted.push({ id: `pan-card-${index}`, name: `Pan Card (${index + 1})`, type: 'Image', url: card, status: myDocs.panCardStatus });
        });
      }
      if (myDocs.drivingLicence && myDocs.drivingLicence.length > 0) {
        myDocs.drivingLicence.forEach((doc, index) => {
          extracted.push({ id: `driving-license-${index}`, name: `Driving License (${index + 1})`, type: 'Image', url: doc, status: myDocs.drivingLicenceStatus });
        });
      }
      if (myDocs.doctorCertificate) {
        extracted.push({ id: 'doctor-certificate-doc', name: 'Doctor Certificate', type: 'Image', url: myDocs.doctorCertificate, status: myDocs.doctorCertificateStatus });
      }
    }
    return extracted;
  };

  // Handle image click to open modal
  const handleImageClick = (doc) => {
    setSelectedImage(doc);
  };

  // Close modal
  const closeModal = () => {
    setSelectedImage(null);
  };
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
          // Agar content type image nahi hai, toh .txt extension add karein
          // Agar aapko pata hai ki yeh .txt hona chahiye, toh is part ko modify karein
          if (contentType && contentType.includes('text/plain')) {
             // Agar yeh text/plain hai, toh filename ko .txt se end karein
             if (!filename.endsWith('.txt')) {
               filename += '.txt';
             }
          } else if (!filename.includes('.')) {
             // Agar koi extension nahi hai aur yeh image nahi hai, toh .txt use karein
             filename += '.txt';
          }
        } else {
          // Agar image hai, toh sahi extension set karein
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
        link.setAttribute('download', filename); // Use determined filename
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

  // Handle document upload/update
  const handleDocumentUpload = async (event) => {
    event.preventDefault();

    const formData = new FormData();

    // Append files to formData only if they are selected
    if (licenceImageRef.current?.files?.[0]) {
      formData.append('licenceImage', licenceImageRef.current.files[0]);
    }
    if (accreditationRef.current?.files?.[0]) {
      formData.append('accreditation', accreditationRef.current.files[0]);
    }
    if (doctorCertificateRef.current?.files?.[0]) {
      formData.append('doctorCertificate', doctorCertificateRef.current.files[0]);
    }

    // For array fields, append multiple files
    if (aadharCardRef.current?.files) {
      Array.from(aadharCardRef.current.files).forEach(file => {
        formData.append('aadharCard', file);
      });
    }
    if (panCardRef.current?.files) {
      Array.from(panCardRef.current.files).forEach(file => {
        formData.append('panCard', file);
      });
    }
    if (drivingLicenceRef.current?.files) {
      Array.from(drivingLicenceRef.current.files).forEach(file => {
        formData.append('drivingLicence', file);
      });
    }

    // Check if any files were actually appended
    if (formData.entries().next().done) {
      alert("Please select files to upload.");
      return;
    }

    const response = await updateDoctorDocuments(formData);
    if (response) {
      alert("Documents updated successfully!");
      // Optionally re-fetch profile to show updated statuses/links
      const updatedData = await getDoctorProfile();
      if (updatedData && updatedData.success) {
        setProfileDetails(updatedData.details);
        const extractedDocs = extractDocumentsFromProfile(updatedData.details);
        setDocuments(extractedDocs);
      }
    } else {
      // Error is already set in context, but you can show a user-friendly alert
      alert("Failed to update documents. Please check the error message.");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case '3':
        return <span className="badge bg-success">Verified</span>;
      case '1':
        return <span className="badge bg-warning">Pending</span>;
      case '2':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Not Specified</span>;
    }
  };

  // Display message if no documents were extracted or found
  if (documents.length === 0 && profileDetails) {
    return (
      <div className="container-fluid py-2" >
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h1 className="h3 mb-0">📋 My Documents</h1>
              </div>
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-folder-open fa-4x text-muted mb-3"></i>
                  <h4 className="text-muted">No Documents Found</h4>
                  <p className="text-muted">No documents found or extracted from your profile. Please upload your documents to get started.</p>
                </div>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => document.getElementById('upload-section').scrollIntoView({ behavior: 'smooth' })}
                >
                  <i className="fas fa-upload me-2"></i>Upload Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the main interface
  return (
    <div className="container-fluid py-2" style={{ marginTop: '30px' }}>
      <div className="row justify-content-center">
        <div className="col-lg-12">
          {/* Header */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header text-white" style={{ backgroundColor: '#3D4097' }}>
              <h1 className="h3 mb-0">📋 My Documents</h1>
              <small className="opacity-75">Manage and view your uploaded documents</small>
            </div>
          </div>

          {/* Display Existing Documents */}
          {documents.length > 0 && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-light">
                <h2 className="h5 mb-0">📁 Uploaded Documents</h2>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {documents.map((doc) => (
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

          {/* Document Upload Form */}
          <div className="card shadow-sm border-0" id="upload-section">
            <div className="card-header bg-success text-white">
              <h2 className="h5 mb-0">📤 Upload/Update Documents</h2>
              <small className="opacity-75">Select and upload your documents</small>
            </div>
            <div className="card-body">
              <form onSubmit={handleDocumentUpload} encType="multipart/form-data">
                <div className="row g-4">
                  {/* Single File Uploads */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="licenceImage" className="form-label fw-semibold">
                        <i className="fas fa-id-card me-2 text-primary"></i>License Image
                      </label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="licenceImage" 
                        ref={licenceImageRef}
                        accept="image/*"
                      />
                      <div className="form-text">Upload your license image (JPG, PNG, PDF)</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="accreditation" className="form-label fw-semibold">
                        <i className="fas fa-certificate me-2 text-primary"></i>Accreditation Document
                      </label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="accreditation" 
                        ref={accreditationRef}
                        accept="image/*,.pdf"
                      />
                      <div className="form-text">Upload your accreditation document</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="doctorCertificate" className="form-label fw-semibold">
                        <i className="fas fa-user-md me-2 text-primary"></i>Doctor Certificate
                      </label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="doctorCertificate" 
                        ref={doctorCertificateRef}
                        accept="image/*,.pdf"
                      />
                      <div className="form-text">Upload your doctor certificate</div>
                    </div>
                  </div>

                  {/* Multiple File Uploads */}
                  <div className="col-12">
                    <hr className="my-4" />
                    <h6 className="text-muted mb-3">
                      <i className="fas fa-layer-group me-2"></i>Multiple Document Uploads
                    </h6>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="aadharCard" className="form-label fw-semibold">
                        <i className="fas fa-id-card-alt me-2 text-primary"></i>Aadhar Cards
                        <span className="badge bg-info ms-2">Multiple</span>
                      </label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="aadharCard" 
                        ref={aadharCardRef}
                        accept="image/*,.pdf"
                        multiple
                      />
                      <div className="form-text">Select multiple Aadhar card images</div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="panCard" className="form-label fw-semibold">
                        <i className="fas fa-credit-card me-2 text-primary"></i>PAN Cards
                        <span className="badge bg-info ms-2">Multiple</span>
                      </label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="panCard" 
                        ref={panCardRef}
                        accept="image/*,.pdf"
                        multiple
                      />
                      <div className="form-text">Select multiple PAN card images</div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="drivingLicence" className="form-label fw-semibold">
                        <i className="fas fa-car me-2 text-primary"></i>Driving Licenses
                        <span className="badge bg-info ms-2">Multiple</span>
                      </label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="drivingLicence" 
                        ref={drivingLicenceRef}
                        accept="image/*,.pdf"
                        multiple
                      />
                      <div className="form-text">Select multiple driving license images</div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="d-flex gap-3">
                      <button 
                        type="submit" 
                        className="btn btn-success btn-lg px-4" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt me-2"></i>Update Documents
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={() => {
                          // Reset all file inputs
                          licenceImageRef.current.value = '';
                          accreditationRef.current.value = '';
                          doctorCertificateRef.current.value = '';
                          aadharCardRef.current.value = '';
                          panCardRef.current.value = '';
                          drivingLicenceRef.current.value = '';
                        }}
                      >
                        <i className="fas fa-undo me-2"></i>Clear All
                      </button>
                    </div>
                  </div>
                </div>
              </form>
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
                      {getStatusBadge(selectedImage.status)}
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
                        src={`${API_BASE_URL}${selectedImage.url}`}
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
        </div>
      </div>

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

export default DoctorDocuments;