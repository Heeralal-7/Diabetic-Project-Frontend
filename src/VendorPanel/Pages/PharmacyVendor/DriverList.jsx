// src/components/DriverList.js

import React, { useState, useContext, useEffect } from 'react';
import { Card, Table, Button, Spinner, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { MyContext } from '../../../Context/Context'; // पथ को सही करें

const DriverList = () => {
    const { drivers, getDrivers, updateDriver, deleteDriver, loading, error } = useContext(MyContext);

    const [showModal, setShowModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    // नई फ़ाइलों को स्टोर करने के लिए एक अलग स्टेट
    const [filesToUpload, setFilesToUpload] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        getDrivers();
    }, [getDrivers]);
    
    // कुछ सेकंड के बाद संदेश को साफ़ करें
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // मोडल खोलने के लिए
    const handleUpdateClick = (driver) => {
        setSelectedDriver({ ...driver });
        setFilesToUpload({}); // हर बार मोडल खोलने पर पुरानी चुनी हुई फ़ाइलों को साफ़ करें
        setShowModal(true);
    };

    // मोडल बंद करने के लिए
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDriver(null);
    };
    
    // मोडल में टेक्स्ट फ़ील्ड बदलने के लिए
    const handleModalChange = (e) => {
        const { name, value } = e.target;
        setSelectedDriver(prev => ({ ...prev, [name]: value }));
    };

    // मोडल में फ़ाइल चुनने के लिए
    const handleModalFileChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            setFilesToUpload(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    // अपडेट फॉर्म सबमिट करें
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const formData = new FormData();

        // 1. सभी टेक्स्ट डेटा को FormData में जोड़ें
        for (const key in selectedDriver) {
            // केवल आवश्यक और बदले हुए डेटा को भेजें
            if (key !== '_id' && key !== 'vendorId' && selectedDriver[key] !== null) {
                formData.append(key, selectedDriver[key]);
            }
        }

        // 2. सभी नई चुनी गई फ़ाइलों को FormData में जोड़ें
        for (const key in filesToUpload) {
            formData.append(key, filesToUpload[key]);
        }

        try {
            const result = await updateDriver(selectedDriver._id, formData);
            if (result.success === 1) {
                setMessage({ type: 'success', text: result.message || 'Driver updated successfully!' });
                handleCloseModal();
            } else {
                setMessage({ type: 'danger', text: result.message || 'Update failed.' });
            }
        } catch (err) {
            setMessage({ type: 'danger', text: err.message || 'An error occurred during update.' });
        }
    };

    const handleDeleteClick = async (driverId) => {
        if (window.confirm('Are you sure you want to delete this driver?')) {
            const result = await deleteDriver(driverId);
            setMessage({ type: result.success ? 'success' : 'danger', text: result.message });
        }
    };

    return (
        <Card className="shadow-sm mt-4">
            <Card.Body>
                <Card.Title as="h4" className="mb-4 text-primary">Driver List</Card.Title>
                
                {loading && !drivers.length ? (
                    <div className="text-center"><Spinner animation="border" /></div>
                ) : (
                    <Table striped bordered hover responsive>
                        {/* टेबल का aader और Body जैसा पहले था वैसा ही रहेगा */}
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Vehicle No.</th>
                                <th>Service</th>
                                <th>Status</th>
                                <th>Online</th>
                                <th>Busy</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.length > 0 ? (
                                drivers.map((driver, index) => (
                                    <tr key={driver._id}>
                                        <td>{index + 1}</td>
                                        <td>{driver.name}</td>
                                        <td>{driver.phoneNumber}</td>
                                        <td>{driver.vehicleNumber}</td>
                                        <td>{driver.serviceType || 'N/A'}</td>
                                        <td><Badge bg={driver.status === "1" ? 'success' : 'secondary'}>{driver.status === "1" ? 'Active' : 'Inactive'}</Badge></td>
                                        <td><Badge bg={driver.isOnline ? 'success' : 'secondary'}>{driver.isOnline ? 'Yes' : 'No'}</Badge></td>
                                        <td><Badge bg={driver.isBusy ? 'warning' : 'light'} text="dark">{driver.isBusy ? 'Yes' : 'No'}</Badge></td>
                                        <td>
                                            <Button variant="outline-primary" size="sm" onClick={() => handleUpdateClick(driver)}>Edit</Button>{' '}
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(driver._id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center">No drivers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                )}

                {/* अपडेट ड्राइवर मोडल (अब सभी फ़ील्ड्स के साथ) */}
                <Modal show={showModal} onHide={handleCloseModal} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Update Driver Details</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleUpdateSubmit}>
                        <Modal.Body>
                            {selectedDriver && (
                                <Row>
                                    {/* Text Fields */}
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Full Name</Form.Label><Form.Control type="text" name="name" value={selectedDriver.name || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={selectedDriver.email || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Phone Number</Form.Label><Form.Control type="text" name="phoneNumber" value={selectedDriver.phoneNumber || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Aadhar Card Number</Form.Label><Form.Control type="text" name="aadharCard" value={selectedDriver.aadharCard || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Driving Licence Number</Form.Label><Form.Control type="text" name="licenceNumber" value={selectedDriver.licenceNumber || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Qualification</Form.Label><Form.Control type="text" name="qualification" value={selectedDriver.qualification || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={4}><Form.Group className="mb-3"><Form.Label>Vehicle Type</Form.Label><Form.Control type="text" name="vehicleType" value={selectedDriver.vehicleType || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={4}><Form.Group className="mb-3"><Form.Label>Vehicle Number</Form.Label><Form.Control type="text" name="vehicleNumber" value={selectedDriver.vehicleNumber || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={4}><Form.Group className="mb-3"><Form.Label>Service Type</Form.Label><Form.Control type="text" name="serviceType" value={selectedDriver.serviceType || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={12}><Form.Group className="mb-3"><Form.Label>Address</Form.Label><Form.Control type="text" name="address" value={selectedDriver.address || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={4}><Form.Group className="mb-3"><Form.Label>City</Form.Label><Form.Control type="text" name="city" value={selectedDriver.city || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={4}><Form.Group className="mb-3"><Form.Label>State</Form.Label><Form.Control type="text" name="state" value={selectedDriver.state || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={4}><Form.Group className="mb-3"><Form.Label>Country</Form.Label><Form.Control type="text" name="country" value={selectedDriver.country || ''} onChange={handleModalChange} /></Form.Group></Col>
                                    <Col md={4}><Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select name="status" value={selectedDriver.status} onChange={handleModalChange}><option value="0">Inactive</option><option value="1">Active</option></Form.Select></Form.Group></Col>
                                    
                                    <hr className="my-4" />
                                    <h5 className="mb-3">Update Documents</h5>

                                    {/* File Fields */}
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Driver Image</Form.Label><Form.Control type="file" name="image" onChange={handleModalFileChange} /><Form.Text muted>Current: {selectedDriver.image || 'None'}</Form.Text></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Driving Licence Document</Form.Label><Form.Control type="file" name="drivingLicence" onChange={handleModalFileChange} /><Form.Text muted>Current: {selectedDriver.drivingLicenceNumber || 'None'}</Form.Text></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Vehicle RC Document</Form.Label><Form.Control type="file" name="rc" onChange={handleModalFileChange} /><Form.Text muted>Current: {selectedDriver.rc || 'None'}</Form.Text></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Certificate Document</Form.Label><Form.Control type="file" name="certificate" onChange={handleModalFileChange} /><Form.Text muted>Current: {selectedDriver.certificate || 'None'}</Form.Text></Form.Group></Col>

                                </Row>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </Card.Body>
        </Card>
    );
};

export default DriverList;