// src/components/VendorDocuments/VendorDocuments.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Form, Button, Alert, Spinner, Table, Card, Badge, Row, Col } from 'react-bootstrap';
import { MyContext } from '../../../Context/Context'; // Assuming MyContext is here

const VendorDocuments = () => {
  const [selectedFiles, setSelectedFiles] = useState({
    registration: null,
    licence: null,
    accreditation: null,
    aadharCard: [],
    panCard: [],
    drivingLicence: [],
  });
  const [documentStatuses, setDocumentStatuses] = useState({});
  const [documentRejectReasons, setDocumentRejectReasons] = useState({}); // New state for reject reasons
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    vendorDocumentDetails,
    documentLoading, // Note: documentLoading from context is not directly used here, but kept for potential future use or if it controls other UI elements.
    documentError,
    fetchVendorDocuments,
    updateVendorDocument,
  } = useContext(MyContext);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // Effect to fetch vendor documents when the component mounts
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchVendorDocuments();
      } catch (err) {
        setError(err.message || 'Failed to load vendor documents.');
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, [fetchVendorDocuments]); // Depend on fetchVendorDocuments to re-run if it changes

  // Effect to process fetched vendorDocumentDetails
  useEffect(() => {
    if (vendorDocumentDetails && vendorDocumentDetails.length > 0) {
      const doc = vendorDocumentDetails[0];
      setDocumentStatuses({
        registrationNoStatus: doc.registrationNoStatus,
        licenceNoStatus: doc.licenceNoStatus,
        accreditationStatus: doc.accreditationStatus,
        aadharCardStatus: doc.aadharCardStatus,
        panCardStatus: doc.panCardStatus,
        drivingLicenceStatus: doc.drivingLicenceStatus,
      });
      // Extract reject reasons if they exist
      if (doc.rejectReasons) {
        setDocumentRejectReasons(doc.rejectReasons);
      }
      setLoading(false); // Ensure loading is false if data is processed
    } else if (vendorDocumentDetails && vendorDocumentDetails.length === 0) {
      // Handle case where no documents are found
      setDocumentStatuses({});
      setDocumentRejectReasons({});
      setLoading(false);
    } else if (documentError) {
      // Handle errors from fetching documents
      setError(documentError);
      setLoading(false);
    }
  }, [vendorDocumentDetails, documentError]); // Re-run when vendorDocumentDetails or documentError changes

  // Handler for file input changes
  const handleFileChange = useCallback((event) => {
    const { name, files } = event.target;
    if (files.length > 0) {
      if (name === 'aadharCard' || name === 'panCard' || name === 'drivingLicence') {
        // For multi-file inputs, store as an array
        setSelectedFiles(prev => ({ ...prev, [name]: Array.from(files) }));
      } else {
        // For single-file inputs, store the first file
        setSelectedFiles(prev => ({ ...prev, [name]: files[0] }));
      }
    } else {
      // Clear the selected file if the input is cleared
      if (name === 'aadharCard' || name === 'panCard' || name === 'drivingLicence') {
        setSelectedFiles(prev => ({ ...prev, [name]: [] }));
      } else {
        setSelectedFiles(prev => ({ ...prev, [name]: null }));
      }
    }
  }, []); // No dependencies, function is stable

  // Handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    let hasFilesToUpload = false; // Flag to check if any file is selected

    // Append selected files to FormData
    if (selectedFiles.registration) {
      formData.append('register', selectedFiles.registration);
      hasFilesToUpload = true;
    }
    if (selectedFiles.licence) {
      formData.append('licence', selectedFiles.licence);
      hasFilesToUpload = true;
    }
    if (selectedFiles.accreditation) {
      formData.append('accreditation', selectedFiles.accreditation);
      hasFilesToUpload = true;
    }
    if (selectedFiles.aadharCard && selectedFiles.aadharCard.length > 0) {
      selectedFiles.aadharCard.forEach(file => formData.append('addharCard', file));
      hasFilesToUpload = true;
    }
    if (selectedFiles.panCard && selectedFiles.panCard.length > 0) {
      selectedFiles.panCard.forEach(file => formData.append('panCard', file));
      hasFilesToUpload = true;
    }
    if (selectedFiles.drivingLicence && selectedFiles.drivingLicence.length > 0) {
      selectedFiles.drivingLicence.forEach(file => formData.append('drivingLicence', file));
      hasFilesToUpload = true;
    }

    // Prevent submission if no files are selected
    if (!hasFilesToUpload) {
      alert('Please select at least one document to upload.');
      setLoading(false);
      return;
    }

    try {
      const result = await updateVendorDocument(formData);
      if (result.success) {
        alert('Documents updated successfully!');
        // Re-fetch documents to get the latest status from the backend
        fetchVendorDocuments();
        // Clear selected files after successful upload
        setSelectedFiles({
          registration: null, licence: null, accreditation: null,
          aadharCard: [], panCard: [], drivingLicence: [],
        });

        // Update local state to immediately show 'Pending' status for newly uploaded files
        // This provides instant UI feedback before the fetchVendorDocuments call updates the UI.
        setDocumentStatuses(prevStatuses => {
          const newStatuses = { ...prevStatuses };
          if (selectedFiles.registration) newStatuses.registrationNoStatus = '0';
          if (selectedFiles.licence) newStatuses.licenceNoStatus = '0';
          if (selectedFiles.accreditation) newStatuses.accreditationStatus = '0';
          if (selectedFiles.aadharCard && selectedFiles.aadharCard.length > 0) newStatuses.aadharCardStatus = '0';
          if (selectedFiles.panCard && selectedFiles.panCard.length > 0) newStatuses.panCardStatus = '0';
          if (selectedFiles.drivingLicence && selectedFiles.drivingLicence.length > 0) newStatuses.drivingLicenceStatus = '0';
          return newStatuses;
        });

      } else {
        // Set error message if the update failed
        setError(result.message || 'Failed to update documents.');
      }
    } catch (err) {
      console.error('Error submitting documents:', err);
      setError(err.message || 'An unexpected error occurred while submitting documents.');
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

  // Helper function to render status badges and rejection reasons
  const renderStatusCell = (status, rejectReasonKey) => {
    let statusBadge;
    let reason = '';

    switch (status) {
      case '1': // Verified
        statusBadge = <Badge bg="success">Verified</Badge>;
        break;
      case '0': // Pending
        statusBadge = <Badge bg="warning text-dark">Pending</Badge>;
        break;
      case '2': // Rejected
        statusBadge = <Badge bg="danger">Rejected</Badge>;
        // Look up rejection reason from the map, provide a default if not found
        reason = documentRejectReasons[rejectReasonKey] || 'No specific reason provided.';
        break;
      default: // Unknown or initial state
        statusBadge = <Badge bg="secondary">Unknown</Badge>;
    }

    return (
      <div>
        {statusBadge}
        {/* Display rejection reason only if it exists */}
        {reason && <div className="text-muted mt-1" style={{ fontSize: '0.8em' }}>{reason}</div>}
      </div>
    );
  };

  // Helper function to render links to uploaded files
  const renderFileLinks = (fileUrls) => {
    // Ensure fileUrls is treated as an array, even if it's a single string URL
    const urls = Array.isArray(fileUrls) ? fileUrls : (fileUrls ? [fileUrls] : []);

    if (urls.length === 0) {
      return 'No files uploaded';
    }
    return urls.map((fileUrl, index) => {
      // Extract filename from URL for display, fallback to "File X"
      const filename = fileUrl.split('/').pop() || `File ${index + 1}`;
      return (
        <a
          key={index}
          href={`${API_BASE_URL}${fileUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="me-2 d-block mb-1 text-decoration-none" // Bootstrap classes for spacing and link styling
        >
          {filename}
        </a>
      );
    });
  };

  // Main render logic for the component
  return (
    <div className="container my-4">
      <h2 className="mb-4">Vendor Document Management</h2>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Current Document Status Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Current Document Status</h5>
        </Card.Header>
        <Card.Body>
          {/* Spinner while loading initial data */}
          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          {/* Table to display document statuses */}
          {!loading && (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Status</th>
                  <th>Uploaded Files</th>
                </tr>
              </thead>
              <tbody>
                {vendorDocumentDetails.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4">No document information available. Please upload documents.</td>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <td>Registration Certificate</td>
                      <td>{renderStatusCell(documentStatuses.registrationNoStatus, 'registrationNoStatus')}</td>
                      {/* Handle single file URLs which might be strings or arrays */}
                      <td>{renderFileLinks(vendorDocumentDetails[0]?.registrationNo)}</td>
                    </tr>
                    <tr>
                      <td>Business Licence</td>
                      <td>{renderStatusCell(documentStatuses.licenceNoStatus, 'licenceNoStatus')}</td>
                      <td>{renderFileLinks(vendorDocumentDetails[0]?.licenceNo)}</td>
                    </tr>
                    <tr>
                      <td>Accreditation Certificate</td>
                      <td>{renderStatusCell(documentStatuses.accreditationStatus, 'accreditationStatus')}</td>
                      <td>{renderFileLinks(vendorDocumentDetails[0]?.accreditation)}</td>
                    </tr>
                    <tr>
                      <td>Aadhar Card</td>
                      <td>{renderStatusCell(documentStatuses.aadharCardStatus, 'aadharCardStatus')}</td>
                      <td>{renderFileLinks(vendorDocumentDetails[0]?.aadharCard)}</td> {/* Expects array */}
                    </tr>
                    <tr>
                      <td>PAN Card</td>
                      <td>{renderStatusCell(documentStatuses.panCardStatus, 'panCardStatus')}</td>
                      <td>{renderFileLinks(vendorDocumentDetails[0]?.panCard)}</td> {/* Expects array */}
                    </tr>
                    <tr>
                      <td>Driving Licence</td>
                      <td>{renderStatusCell(documentStatuses.drivingLicenceStatus, 'drivingLicenceStatus')}</td>
                      <td>{renderFileLinks(vendorDocumentDetails[0]?.drivingLicence)}</td> {/* Expects array */}
                    </tr>
                  </>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Upload / Update Documents Section */}
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Upload / Update Documents</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Registration */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Registration Certificate</Form.Label>
                  <Form.Control type="file" name="registration" onChange={handleFileChange} />
                  <Form.Text className="text-muted">Upload your registration certificate.</Form.Text>
                </Form.Group>
              </Col>

              {/* Licence */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Business Licence</Form.Label>
                  <Form.Control type="file" name="licence" onChange={handleFileChange} />
                  <Form.Text className="text-muted">Upload your business licence.</Form.Text>
                </Form.Group>
              </Col>

              {/* Accreditation */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Accreditation Certificate</Form.Label>
                  <Form.Control type="file" name="accreditation" onChange={handleFileChange} />
                  <Form.Text className="text-muted">Upload accreditation certificate.</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              {/* Aadhar Card */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Aadhar Card</Form.Label>
                  <Form.Control type="file" name="aadharCard" multiple onChange={handleFileChange} />
                  <Form.Text className="text-muted">Upload front and back of Aadhar Card.</Form.Text>
                </Form.Group>
              </Col>

              {/* PAN Card */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>PAN Card</Form.Label>
                  <Form.Control type="file" name="panCard" multiple onChange={handleFileChange} />
                  <Form.Text className="text-muted">Upload PAN Card.</Form.Text>
                </Form.Group>
              </Col>

              {/* Driving Licence */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Driving Licence</Form.Label>
                  <Form.Control type="file" name="drivingLicence" multiple onChange={handleFileChange} />
                  <Form.Text className="text-muted">Upload Driving Licence.</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Submit Button */}
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Documents'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VendorDocuments;