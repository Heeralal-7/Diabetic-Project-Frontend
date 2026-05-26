// src/components/CreateDriver.js
 
import React, { useState, useContext } from 'react';
import { Form, Button, Card, Col, Row, Spinner, Alert } from 'react-bootstrap';
import { MyContext } from '../../../Context/Context'; 
 
const CreateDriver = () => {
    const { createDriver, loading } = useContext(MyContext);
 
    const initialFormData = {
        name: '', email: '', ctrCode: '', phoneNumber: '', qualification: '',
        vehicleNumber: '', vehicleType: '', serviceType: '', 
        licenceNumber: '', aadharCard: '', address: '', country: '',
        state: '', city: '', password: '', image: null,
        drivingLicence: null, rc: null, certificate: null,
    };
 
    const [formData, setFormData] = useState(initialFormData);
    const [message, setMessage] = useState({ type: '', text: '' });
 
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
 
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files[0] }));
    };
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
 
        const data = new FormData();
        for (const key in formData) {
            if (formData[key]) {
                data.append(key, formData[key]);
            }
        }
 
        try {
            const result = await createDriver(data);
            if (result.success === 1) {
                setMessage({ type: 'success', text: result.message });
                e.target.reset();
                setFormData(initialFormData);
            } else {
                setMessage({ type: 'danger', text: result.message || 'Failed to create driver.' });
            }
        } catch (err) {
            setMessage({ type: 'danger', text: err.message || 'An unexpected error occurred.' });
        }
    };
 
    return (
        <Card className="shadow-sm mt-4">
            <Card.Body>
                <Card.Title as="h4" className="mb-4 text-primary">Register New Driver</Card.Title>
               
                {message.text && <Alert variant={message.type}>{message.text}</Alert>}
 
                <Form onSubmit={handleSubmit}>
                    
                    <Row>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Full Name</Form.Label><Form.Control type="text" name="name" onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" name="password" onChange={handleChange} required /></Form.Group></Col>
                    </Row>
                    <Row>
                        <Col md={2}><Form.Group className="mb-3"><Form.Label>Country Code</Form.Label><Form.Control type="text" name="ctrCode" placeholder="+91" onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Phone Number</Form.Label><Form.Control type="text" name="phoneNumber" onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Aadhar Card Number</Form.Label><Form.Control type="text" name="aadharCard" onChange={handleChange} required /></Form.Group></Col>
                    </Row>
 
                   
                    <Row>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Vehicle Type</Form.Label><Form.Control type="text" name="vehicleType" placeholder="e.g., Bike, Car" onChange={handleChange} required /></Form.Group></Col>
                       
                       
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Service Type</Form.Label>
                                <Form.Select
                                    name="serviceType"
                                    onChange={handleChange}
                                    value={formData.serviceType}
                                    required
                                >
                                    <option value="">Select Service Type</option>
                                    <option value="Pharmacy">Pharmacy</option>
                                    <option value="Lab">Lab</option>
                                    <option value="Food">Food</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
 
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Vehicle Number</Form.Label><Form.Control type="text" name="vehicleNumber" onChange={handleChange} required /></Form.Group></Col>
                    </Row>
                    <Row>
                       <Col md={6}><Form.Group className="mb-3"><Form.Label>Driving Licence Number</Form.Label><Form.Control type="text" name="licenceNumber" onChange={handleChange} required /></Form.Group></Col>
                       <Col md={6}><Form.Group className="mb-3"><Form.Label>Qualification</Form.Label><Form.Control type="text" name="qualification" onChange={handleChange} /></Form.Group></Col>
                    </Row>
 
                   
                    <Row>
                        <Col md={12}><Form.Group className="mb-3"><Form.Label>Address</Form.Label><Form.Control type="text" name="address" onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>City</Form.Label><Form.Control type="text" name="city" onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>State</Form.Label><Form.Control type="text" name="state" onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Country</Form.Label><Form.Control type="text" name="country" onChange={handleChange} required /></Form.Group></Col>
                    </Row>
                   
               
                    <Row>
                        <Col md={3}><Form.Group className="mb-3"><Form.Label>Driver Image</Form.Label><Form.Control type="file" name="image" onChange={handleFileChange} /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-3"><Form.Label>Driving Licence</Form.Label><Form.Control type="file" name="drivingLicence" onChange={handleFileChange} /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-3"><Form.Label>Vehicle RC</Form.Label><Form.Control type="file" name="rc" onChange={handleFileChange} /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-3"><Form.Label>Qualification Certificate</Form.Label><Form.Control type="file" name="certificate" onChange={handleFileChange} /></Form.Group></Col>
                    </Row>
 
                    <Button variant="primary" type="submit" disabled={loading} className="px-4 mt-3">
                        {loading ? <><Spinner as="span" animation="border" size="sm" /> Registering...</> : 'Register Driver'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};
 
export default CreateDriver;