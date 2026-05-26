import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Card, Col, Row, Spinner, Alert } from 'react-bootstrap';
import { MyContext } from '../../../Context/Context';

const AddHospitalProduct = () => {
    const { addHospitalProduct } = useContext(MyContext);

    const initialFormState = {
        categoryName: '', name: '', manufacturers: '', packaging: '',
        primaryUse: 'Hospital Equipment', description: '', storage: '',
        introduction: '', useOf: '', benefits: '', sideEffects: '',
        howToUse: '', howItWorks: '', safetyAdvice: '', ifMissed: 'N/A',
        alternativeBrand: '', manufacturerAddress: '', quantity: '',
        mrp: '', discountPercentage: '', prescriptionRequired: 'false',
        image_url: '' // ⭐⭐⭐ ADDED: Field for image URLs ⭐⭐⭐
    };

    const [formData, setFormData] = useState(initialFormState);
    // const [files, setFiles] = useState([]); // ⭐⭐⭐ REMOVED: No longer needed ⭐⭐⭐
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [calculatedBestPrice, setCalculatedBestPrice] = useState('');

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);
    
    useEffect(() => {
        const { mrp, discountPercentage } = formData;
        const numericMrp = parseFloat(mrp);
        const numericDiscount = parseFloat(discountPercentage);
        if (!isNaN(numericMrp) && !isNaN(numericDiscount) && numericMrp > 0) {
            const bestPrice = numericMrp * (1 - numericDiscount / 100);
            setCalculatedBestPrice(bestPrice.toFixed(2));
        } else {
            setCalculatedBestPrice('');
        }
    }, [formData.mrp, formData.discountPercentage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // ⭐⭐⭐ REMOVED: handleFileChange is no longer needed ⭐⭐⭐
    // const handleFileChange = (e) => { setFiles(e.target.files); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // ⭐⭐⭐ CHANGE: Send a JSON object instead of FormData ⭐⭐⭐
        const payload = { ...formData };
        
        const result = await addHospitalProduct(payload);
        setLoading(false);

        if (result.success) {
            setMessage({ type: 'success', text: result.message || 'Product safaltapoorvak joda gaya!' });
            setFormData(initialFormState);
            setCalculatedBestPrice('');
        } else {
            setMessage({ type: 'danger', text: result.message || result.error || 'Ek anjaani truti hui.' });
        }
    };

    return (
        <Card className="shadow-sm mt-4">
            <Card.Body>
                <Card.Title as="h4" className="mb-4 text-primary">Add New Hospital Product</Card.Title>
                
                {message.text && <Alert variant={message.type}>{message.text}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    {/* All other form sections remain the same */}
                    <h5 className="mb-3 mt-4 border-bottom pb-2">Basic Information</h5>
                    <Row>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Product Name</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Manufacturers</Form.Label><Form.Control type="text" name="manufacturers" value={formData.manufacturers} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Packaging</Form.Label><Form.Control type="text" name="packaging" value={formData.packaging} onChange={handleChange} required placeholder="e.g., 1 unit in 1 box" /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Category Name</Form.Label><Form.Control type="text" name="categoryName" value={formData.categoryName} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Primary Use</Form.Label><Form.Control type="text" name="primaryUse" value={formData.primaryUse} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Alternative Brand</Form.Label><Form.Control type="text" name="alternativeBrand" value={formData.alternativeBrand} onChange={handleChange} /></Form.Group></Col>
                    </Row>
                    
                    {/* Pricing & Stock Section */}
                     <h5 className="mb-3 mt-4 border-bottom pb-2">Pricing & Stock</h5>
                    <Row>
                        <Col md={3}><Form.Group className="mb-3"><Form.Label>MRP (₹)</Form.Label><Form.Control type="number" step="0.01" name="mrp" value={formData.mrp} onChange={handleChange} required placeholder="e.g., 100.00" /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-3"><Form.Label>Discount (%)</Form.Label><Form.Control type="number" step="0.01" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} required placeholder="e.g., 10" /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-3"><Form.Label>Calculated Best Price (₹)</Form.Label><Form.Control type="text" value={calculatedBestPrice} readOnly disabled placeholder="Auto-calculated" /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-3"><Form.Label>Quantity in Stock</Form.Label><Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} required /></Form.Group></Col>
                    </Row>
                    
                    {/* Detailed Information Section */}
                     <h5 className="mb-3 mt-4 border-bottom pb-2">Detailed Information</h5>
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Introduction</Form.Label><Form.Control as="textarea" rows={3} name="introduction" value={formData.introduction} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Use Of</Form.Label><Form.Control as="textarea" rows={2} name="useOf" value={formData.useOf} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Benefits</Form.Label><Form.Control as="textarea" rows={2} name="benefits" value={formData.benefits} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Side Effects</Form.Label><Form.Control as="textarea" rows={2} name="sideEffects" value={formData.sideEffects} onChange={handleChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>How To Use</Form.Label><Form.Control as="textarea" rows={2} name="howToUse" value={formData.howToUse} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>How It Works</Form.Label><Form.Control as="textarea" rows={2} name="howItWorks" value={formData.howItWorks} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Safety Advice</Form.Label><Form.Control as="textarea" rows={2} name="safetyAdvice" value={formData.safetyAdvice} onChange={handleChange} required /></Form.Group></Col>
                    </Row>
                    
                     {/* Other Details Section */}
                    <h5 className="mb-3 mt-4 border-bottom pb-2">Other Details</h5>
                    <Row>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Storage</Form.Label><Form.Control type="text" name="storage" value={formData.storage} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>If Missed</Form.Label><Form.Control type="text" name="ifMissed" value={formData.ifMissed} onChange={handleChange} /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Manufacturer Address</Form.Label><Form.Control type="text" name="manufacturerAddress" value={formData.manufacturerAddress} onChange={handleChange} required /></Form.Group></Col>
                    </Row>
                    
                    {/* Section 5: Files and Prescription */}
                    <h5 className="mb-3 mt-4 border-bottom pb-2">Links & Settings</h5>
                    <Row className="align-items-center">
                        <Col md={6}>
                            {/* ⭐⭐⭐ CHANGE: File input to a textarea for URLs ⭐⭐⭐ */}
                            <Form.Group className="mb-3">
                                <Form.Label>Product Image URLs</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.png"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Multiple image links ko comma (,) se alag karein.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Prescription Required?</Form.Label>
                                <div>
                                    <Form.Check inline type="radio" label="Yes" name="prescriptionRequired" value="true" checked={formData.prescriptionRequired === 'true'} onChange={handleChange} />
                                    <Form.Check inline type="radio" label="No" name="prescriptionRequired" value="false" checked={formData.prescriptionRequired === 'false'} onChange={handleChange} />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Button variant="primary" type="submit" disabled={loading} className="px-4 mt-4">
                        {loading ? <><Spinner as="span" animation="border" size="sm" /> Adding...</> : 'Add Hospital Product'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default AddHospitalProduct;