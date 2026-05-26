import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Card, Col, Row, Spinner, Alert } from 'react-bootstrap';
import { MyContext } from '../../../Context/Context';

const AddMedicine = () => {
    const { addMedicine } = useContext(MyContext);

    const initialFormState = {
        categoryName: '',
        name: '',
        manufacturers: '',
        salt_composition: '',
        packaging: '',
        primary_use: '',
        description: '',
        salt_synonyms: '',
        storage: '',
        introduction: '',
        use_of: '',
        benefits: '',
        side_effect: '',
        how_to_use: '',
        how_works: '',
        safety_advise: '',
        if_miss: '',
        alternate_brand: '',
        manufacturer_address: '',
        mrp: '',
        discountPercentage: '',
        stock: '',
        prescription_required: 'false',
        image_url: '' // comma separated URLs
    };

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [calculatedBestPrice, setCalculatedBestPrice] = useState('');

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Auto calculate bestPrice
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
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Convert image_url (comma separated) → array
        const imageArray = formData.image_url
            .split(',')
            .map((url) => url.trim())
            .filter((u) => u !== '');

        const payload = {
            ...formData,
            image_url: imageArray,
            bestPrice: calculatedBestPrice, // backend wants bestPrice
            primaryUse: formData.primary_use, 
            saltComposition: formData.salt_composition,
            saltSynonyms: formData.salt_synonyms,
            useOf: formData.use_of,
            sideEffects: formData.side_effect,
            howToUse: formData.how_to_use,
            howItWorks: formData.how_works,
            safetyAdvice: formData.safety_advise,
            ifMissed: formData.if_miss,
            alternativeAddress: formData.alternate_brand,
            manufacturingAddress: formData.manufacturer_address,
            prescription: formData.prescription_required
        };

        const result = await addMedicine(payload);

        setLoading(false);

        if (result.success) {
            setMessage({ type: 'success', text: result.message || 'Medicine added successfully!' });
            setFormData(initialFormState);
            setCalculatedBestPrice('');
        } else {
            setMessage({ type: 'danger', text: result.message || result.error || 'Error occurred!' });
        }
    };

    return (
        <Card className="shadow-sm mt-4">
            <Card.Body>
                <Card.Title as="h4" className="mb-4 text-primary">Add New Medicine</Card.Title>

                {message.text && <Alert variant={message.type}>{message.text}</Alert>}

                <Form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <h5 className="mb-3 mt-4 border-bottom pb-2">Basic Information</h5>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Medicine Name</Form.Label>
                                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Manufacturers</Form.Label>
                                <Form.Control type="text" name="manufacturers" value={formData.manufacturers} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Salt Composition</Form.Label>
                                <Form.Control type="text" name="salt_composition" value={formData.salt_composition} onChange={handleChange} />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Packaging</Form.Label>
                                <Form.Control type="text" name="packaging" value={formData.packaging} onChange={handleChange} required />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Category Name</Form.Label>
                                <Form.Control type="text" name="categoryName" value={formData.categoryName} onChange={handleChange} required />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Primary Use</Form.Label>
                                <Form.Control type="text" name="primary_use" value={formData.primary_use} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Pricing & Stock */}
                    <h5 className="mb-3 mt-4 border-bottom pb-2">Pricing & Stock</h5>
                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>MRP (₹)</Form.Label>
                                <Form.Control type="number" name="mrp" value={formData.mrp} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Discount (%)</Form.Label>
                                <Form.Control type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Best Price (Auto)</Form.Label>
                                <Form.Control type="text" value={calculatedBestPrice} readOnly disabled />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Stock</Form.Label>
                                <Form.Control type="number" name="stock" value={formData.stock} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Detailed Info */}
                    <h5 className="mb-3 mt-4 border-bottom pb-2">Detailed Information</h5>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} required />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Introduction</Form.Label>
                                <Form.Control as="textarea" rows={3} name="introduction" value={formData.introduction} onChange={handleChange} required />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Use Of</Form.Label>
                                <Form.Control as="textarea" rows={2} name="use_of" value={formData.use_of} onChange={handleChange} />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Benefits</Form.Label>
                                <Form.Control as="textarea" rows={2} name="benefits" value={formData.benefits} onChange={handleChange} />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Side Effects</Form.Label>
                                <Form.Control as="textarea" rows={2} name="side_effect" value={formData.side_effect} onChange={handleChange} />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>How To Use</Form.Label>
                                <Form.Control as="textarea" rows={2} name="how_to_use" value={formData.how_to_use} onChange={handleChange} />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>How It Works</Form.Label>
                                <Form.Control as="textarea" rows={2} name="how_works" value={formData.how_works} onChange={handleChange} />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Safety Advice</Form.Label>
                                <Form.Control as="textarea" rows={2} name="safety_advise" value={formData.safety_advise} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Other Details */}
                    <h5 className="mb-3 mt-4 border-bottom pb-2">Other Details</h5>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Storage</Form.Label>
                                <Form.Control type="text" name="storage" value={formData.storage} onChange={handleChange} />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>If Missed</Form.Label>
                                <Form.Control type="text" name="if_miss" value={formData.if_miss} onChange={handleChange} />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Alternate Brand</Form.Label>
                                <Form.Control type="text" name="alternate_brand" value={formData.alternate_brand} onChange={handleChange} />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Manufacturer Address</Form.Label>
                                <Form.Control type="text" name="manufacturer_address" value={formData.manufacturer_address} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Images & Prescription */}
                    <h5 className="mb-3 mt-4 border-bottom pb-2">Links & Settings</h5>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Medicine Image URLs</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    placeholder="url1, url2, url3..."
                                />
                                <Form.Text className="text-muted">
                                    Multiple image links ko comma se alag karein.
                                </Form.Text>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Prescription Required?</Form.Label><br />
                                <Form.Check inline type="radio" label="Yes" name="prescription_required" value="true"
                                    checked={formData.prescription_required === 'true'}
                                    onChange={handleChange} />
                                <Form.Check inline type="radio" label="No" name="prescription_required" value="false"
                                    checked={formData.prescription_required === 'false'}
                                    onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button variant="primary" type="submit" disabled={loading} className="px-4 mt-4">
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" /> Adding...
                            </>
                        ) : (
                            'Add Medicine'
                        )}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default AddMedicine;
