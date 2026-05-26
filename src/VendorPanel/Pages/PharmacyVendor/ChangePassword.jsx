// src/components/ChangePassword.js

import React, { useState, useContext } from 'react';
import { Form, Button, Card, Col, Row, Spinner, Alert } from 'react-bootstrap';
import { MyContext } from '../../../Context/Context'; // पथ को सही करें

const ChangePassword = () => {
    const { changePassword2, loading } = useContext(MyContext);
    
    const initialFormState = {
        oldpassword: '',
        password: '',
        confirmpassword: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.password !== formData.confirmpassword) {
            setMessage({ type: 'danger', text: 'New password and confirm password do not match.' });
            return;
        }

        try {
            const result = await changePassword2(formData);
            if (result.success === 1) {
                setMessage({ type: 'success', text: result.message });
                setFormData(initialFormState); // सफ़लता पर फ़ॉर्म रीसेट करें
            } else {
                setMessage({ type: 'danger', text: result.message || 'Failed to change password.' });
            }
        } catch (err) {
            setMessage({ type: 'danger', text: err.message || 'An unexpected error occurred.' });
        }
    };

    return (
        <Card className="shadow-sm mt-4">
            <Card.Header>
                <Card.Title as="h4" className="mb-0 text-primary">Change Password</Card.Title>
            </Card.Header>
            <Card.Body>
                {message.text && <Alert variant={message.type}>{message.text}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Old Password</Form.Label>
                                <Form.Control type="password" name="oldpassword" value={formData.oldpassword} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Confirm New Password</Form.Label>
                                <Form.Control type="password" name="confirmpassword" value={formData.confirmpassword} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button variant="primary" type="submit" disabled={loading} className="px-4 mt-2">
                        {loading ? <><Spinner as="span" animation="border" size="sm" /> Changing...</> : 'Change Password'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ChangePassword;