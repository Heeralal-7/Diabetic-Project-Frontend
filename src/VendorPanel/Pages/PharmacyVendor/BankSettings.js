import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Spinner, Card, Container, Row, Col } from 'react-bootstrap';

const BankSettings = () => {
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
  const [vendorType, setVendorType] = useState('pharmacy'); // Default

  const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Token Helper (Same as your Payout page)
  const getAllVendorToken = useCallback(() => {
    const tokenNames = ['Pharmacytoken', 'foodtoken', 'labtoken', 'doctortoken']; // Add doctor/clinic tokens if stored differently
    for (const name of tokenNames) {
      const tokenData = sessionStorage.getItem(name);
      if (tokenData && tokenData !== 'null') {
        const parsed = JSON.parse(tokenData);
        if (parsed?.token) {
           let type = 'vandor'; // Default for DB
           if (name === 'foodtoken' || name === 'Pharmacytoken') type = 'vandor';
           // Logic to differentiate doctor/clinic if needed based on your auth logic
           // For now assuming 'vandor' works for food/pharmacy
           return { token: parsed.token, type };
        }
      }
    }
    return null;
  }, []);

  // Fetch Existing Details
  useEffect(() => {
    const fetchData = async () => {
      const auth = getAllVendorToken();
      if (!auth) return;

      try {
        // Mapping type for GET request
        // You might need to adjust 'type' param based on how you store tokens
        // For this example, I'll assume 'vandor' covers food/pharmacy
        const res = await axios.get(`${URL}/vendor-payout/get-bank-details?type=${auth.type}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });

        if (res.data.success && res.data.data) {
          const bank = res.data.data;
          setFormData({
            accountHolderName: bank.accountHolderName || '',
            accountNumber: bank.accountNumber || '',
            confirmAccountNumber: bank.accountNumber || '', // Pre-fill confirm
            ifscCode: bank.ifscCode || '',
            bankName: bank.bankName || '',
            upiId: bank.upiId || ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [getAllVendorToken, URL]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setMessage({ type: 'danger', text: 'Account numbers do not match!' });
      return;
    }

    setLoading(true);
    const auth = getAllVendorToken();

    try {
      await axios.put(
        `${URL}/vendor-payout/update-bank-details`,
        {
          userType: auth.type, // 'vandor', 'doctor', 'clinic'
          bankDetails: formData
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      setMessage({ type: 'success', text: 'Bank details updated successfully!' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

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
                    placeholder="e.g. Rahul Kumar"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    required
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
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Account Number</Form.Label>
                      <Form.Control
                        type="password"
                        name="accountNumber"
                        placeholder="Enter Account No."
                        value={formData.accountNumber}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Confirm Account Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="confirmAccountNumber"
                        placeholder="Re-enter Account No."
                        value={formData.confirmAccountNumber}
                        onChange={handleChange}
                        required
                      />
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
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid mt-4">
                  <Button variant="primary" size="lg" type="submit" disabled={loading} className="rounded-pill fw-bold">
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

export default BankSettings;