import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Spinner, Card, Container, Row, Col } from 'react-bootstrap';
 
const BankSettingsDoctor = () => {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  });
 
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showConfirmAccount, setShowConfirmAccount] = useState(false);
  const [isIndependentDoctor, setIsIndependentDoctor] = useState(true);
 
  const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
 
  // Get Doctor Token Helper
  const getDoctorToken = useCallback(() => {
    // Doctor token ko sessionStorage se lekar aao
    // Aapke system me doctor token kis key me store hai - 'doctortoken', 'doctorToken', etc.
    const possibleKeys = ['doctortoken', 'doctorToken', 'doctor-token'];
   
    for (const key of possibleKeys) {
      const tokenData = sessionStorage.getItem(key);
      if (tokenData && tokenData !== 'null') {
        try {
          const parsed = JSON.parse(tokenData);
          if (parsed?.token) {
            return parsed.token;
          }
        } catch (error) {
          console.error(`Error parsing ${key}:`, error);
        }
      }
    }
   
    return null;
  }, []);
 
  // Fetch Existing Bank Details for Doctor
  useEffect(() => {
    const fetchBankDetails = async () => {
      const token = getDoctorToken();
      if (!token) {
        setFetchLoading(false);
        setMessage({ type: 'danger', text: 'Authentication required. Please login again.' });
        return;
      }
 
      try {
        const res = await axios.get(`${URL}/vendor-payout/doctor/get-bank-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
 
        // Agar doctor independent nahi hai to error aayega
        if (res.data.success === false && res.data.message?.includes("managed by your Clinic")) {
          setIsIndependentDoctor(false);
          setMessage({
            type: 'warning',
            text: res.data.message || 'Bank details are managed by your Clinic.'
          });
        } else if (res.data.success && res.data.data) {
          const bank = res.data.data;
          setFormData({
            accountHolderName: bank.accountHolderName || '',
            accountNumber: bank.accountNumber || '',
            confirmAccountNumber: bank.accountNumber || '', // Pre-fill confirm
            ifscCode: bank.ifscCode || '',
            bankName: bank.bankName || '',
            upiId: bank.upid || bank.upiId || '' // API response ke hisaab se
          });
        }
      } catch (err) {
        console.error('Error fetching bank details:', err);
        // Check if error is about independent doctor
        if (err.response?.data?.message?.includes("managed by your Clinic")) {
          setIsIndependentDoctor(false);
          setMessage({
            type: 'warning',
            text: err.response.data.message
          });
        } else {
          setMessage({
            type: 'warning',
            text: err.response?.data?.message || 'Could not fetch existing bank details'
          });
        }
      } finally {
        setFetchLoading(false);
      }
    };
 
    fetchBankDetails();
  }, [getDoctorToken, URL]);
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
 
    // Validation
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setMessage({ type: 'danger', text: 'Account numbers do not match!' });
      return;
    }
 
    const token = getDoctorToken();
    if (!token) {
      setMessage({ type: 'danger', text: 'Authentication required. Please login again.' });
      return;
    }
 
    setLoading(true);
 
    try {
      // Prepare data according to your backend controller structure
      const bankDetails = {
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        bankName: formData.bankName,
        upiId: formData.upiId || ""
      };
 
      const res = await axios.put(
        `${URL}/vendor-payout/doctor/update-bank-details`,
        { bankDetails },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
 
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message || 'Bank details updated successfully!' });
        // Update confirm account number to match
        setFormData(prev => ({
          ...prev,
          confirmAccountNumber: formData.accountNumber
        }));
      } else {
        setMessage({ type: 'danger', text: res.data.message || 'Update failed' });
      }
    } catch (err) {
      console.error('Error updating bank details:', err);
     
      // Check if error is about independent doctor
      if (err.response?.data?.message?.includes("cannot update bank details") ||
          err.response?.data?.message?.includes("managed by your Clinic")) {
        setIsIndependentDoctor(false);
        setMessage({
          type: 'danger',
          text: err.response.data.message
        });
      } else {
        setMessage({
          type: 'danger',
          text: err.response?.data?.message || 'Update failed. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };
 
  if (fetchLoading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading bank details...</p>
      </div>
    );
  }
 
  // Agar doctor independent nahi hai to different UI show karo
  if (!isIndependentDoctor) {
    return (
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0 rounded-4">
              <div className="card-header bg-warning text-dark py-3 rounded-top-4">
                <h4 className="mb-0"><i className="fas fa-university me-2"></i> Bank Details Management</h4>
              </div>
              <Card.Body className="p-4 text-center">
                <Alert variant="warning" className="mb-4">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <h5 className="alert-heading">Bank Details Managed by Clinic</h5>
                  <p className="mb-0">
                    Your bank details are managed by your clinic. Please contact your clinic administrator
                    for any updates or changes to your payout information.
                  </p>
                </Alert>
                <div className="mt-4">
                  <i className="fas fa-building fa-3x text-muted mb-3"></i>
                  <p className="text-muted">
                    As a clinic-affiliated doctor, your earnings and bank details are managed through
                    your clinic's administrative system.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
 
  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0 rounded-4">
            <div className="card-header bg-primary text-white py-3 rounded-top-4">
              <h4 className="mb-0"><i className="fas fa-university me-2"></i> Payout Bank Settings</h4>
            </div>
            <Card.Body className="p-4">
             
              <Alert variant="info" className="mb-4">
                <i className="fas fa-info-circle me-2"></i>
                These details will be used by the Admin to transfer your earnings via Razorpay. Please ensure they are correct.
              </Alert>
 
              {message.text && (
                <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
                  {message.text}
                </Alert>
              )}
 
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Account Holder Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="accountHolderName"
                    placeholder="e.g. Dr. Rahul Kumar"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    required
                    disabled={!isIndependentDoctor}
                  />
                </Form.Group>
 
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Bank Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="bankName"
                    placeholder="e.g. HDFC Bank"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                    disabled={!isIndependentDoctor}
                  />
                </Form.Group>
 
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Account Number</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type={showAccountNumber ? "text" : "password"}
                          name="accountNumber"
                          placeholder="Enter Account No."
                          value={formData.accountNumber}
                          onChange={handleChange}
                          required
                          disabled={!isIndependentDoctor}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowAccountNumber(!showAccountNumber)}
                          disabled={!isIndependentDoctor}
                        >
                          <i className={`fas fa-eye${showAccountNumber ? '-slash' : ''}`}></i>
                        </button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Confirm Account Number</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type={showConfirmAccount ? "text" : "password"}
                          name="confirmAccountNumber"
                          placeholder="Re-enter Account No."
                          value={formData.confirmAccountNumber}
                          onChange={handleChange}
                          required
                          disabled={!isIndependentDoctor}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowConfirmAccount(!showConfirmAccount)}
                          disabled={!isIndependentDoctor}
                        >
                          <i className={`fas fa-eye${showConfirmAccount ? '-slash' : ''}`}></i>
                        </button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
 
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">IFSC Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="ifscCode"
                        placeholder="e.g. HDFC0001234"
                        value={formData.ifscCode}
                        onChange={(e) => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                        maxLength={11}
                        required
                        disabled={!isIndependentDoctor}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">UPI ID (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="upiId"
                        placeholder="e.g. name@okicici"
                        value={formData.upiId}
                        onChange={handleChange}
                        disabled={!isIndependentDoctor}
                      />
                    </Form.Group>
                  </Col>
                </Row>
 
                <div className="d-grid mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={loading || !isIndependentDoctor}
                    className="rounded-pill fw-bold"
                  >
                    {loading ? <Spinner size="sm" animation="border" /> : 'Save Bank Details'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
 
export default BankSettingsDoctor;
 