// src/components/PharGenerateCoupon.js

import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Card, Col, Row, Spinner, Alert } from 'react-bootstrap';
import { MyContext } from '../../../Context/Context'; // सुनिश्चित करें कि यह पथ सही है

const PharGenerateCoupon = () => {
    // 1. Context से `createCoupon` फ़ंक्शन प्राप्त करें
    const { createCoupon } = useContext(MyContext);

    // 2. फॉर्म के लिए प्रारंभिक स्थिति
    const initialFormState = {
        couponCode: '',
        description: '',
        percentageDiscount: '',
        fixedAmountDiscount: '',
        couponApplied: '',
        limitRedeem: '',
        startDate: '',
        expireDate: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // 3. कुछ सेकंड के बाद संदेश को अपने आप हटाने के लिए useEffect
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // 4. इनपुट फ़ील्ड में बदलाव को संभालें
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // तारीख को DD/MM/YYYY फॉर्मेट में बदलने के लिए एक हेल्पर फ़ंक्शन
    const formatDate = (dateString) => {
        if (!dateString) return ''; // यदि तारीख खाली है तो कुछ न करें
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };
    
    // 5. फॉर्म सबमिट को संभालें
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // सबमिट करने से पहले तारीखों को DD/MM/YYYY फॉर्मेट में बदलें
        const dataToSubmit = {
            ...formData,
            startDate: formatDate(formData.startDate),
            expireDate: formatDate(formData.expireDate),
        };

        // Context फ़ंक्शन को कॉल करें
        const result = await createCoupon(dataToSubmit);
        
        setLoading(false);

        if (result.success === 1) {
            setMessage({ type: 'success', text: result.message || 'कूपन सफलतापूर्वक बनाया गया!' });
            setFormData(initialFormState); // फॉर्म स्थिति को रीसेट करें
        } else {
            setMessage({ type: 'danger', text: result.message || 'एक अनजानी त्रुटि हुई।' });
        }
    };

    return (
        <Card className="shadow-sm mt-4">
            <Card.Body>
                <Card.Title as="h4" className="mb-4 text-primary">Generate New Coupon</Card.Title>
                
                {message.text && <Alert variant={message.type}>{message.text}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Coupon Code</Form.Label><Form.Control type="text" name="couponCode" value={formData.couponCode} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Coupon Applied On</Form.Label><Form.Control type="text" name="couponApplied" value={formData.couponApplied} onChange={handleChange} required placeholder="e.g., Credit Card, Debit Card, UPI etc " /></Form.Group></Col>
                    </Row>
                    <Row>
                        <Col md={12}><Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} required /></Form.Group></Col>
                    </Row>
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Percentage Discount (%)</Form.Label><Form.Control type="number" name="percentageDiscount" value={formData.percentageDiscount} onChange={handleChange} placeholder="e.g., 15 (leave blank if fixed amount)" /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Fixed Amount Discount (₹)</Form.Label><Form.Control type="number" name="fixedAmountDiscount" value={formData.fixedAmountDiscount} onChange={handleChange} placeholder="e.g., 100 (leave blank if percentage)" /></Form.Group></Col>
                    </Row>
                    <Row>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Limit for Redeem</Form.Label><Form.Control type="number" name="limitRedeem" value={formData.limitRedeem} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Start Date</Form.Label><Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Expiry Date</Form.Label><Form.Control type="date" name="expireDate" value={formData.expireDate} onChange={handleChange} required /></Form.Group></Col>
                    </Row>

                    <Button variant="primary" type="submit" disabled={loading} className="px-4 mt-3">
                        {loading ? <><Spinner as="span" animation="border" size="sm" /> Generating...</> : 'Generate Coupon'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default PharGenerateCoupon;