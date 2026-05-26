import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MyContext } from '../../../Context/Context'; // Adjust path
import { Container, Row, Col, Card, Spinner, Button, Badge, ListGroup } from 'react-bootstrap';
import { BsArrowLeft, BsExclamationCircle } from 'react-icons/bs';

const DUMMY_IMAGE = "https://cdn.pixabay.com/photo/2020/03/18/15/16/blood-4944423_1280.jpg";

const DetailItem = ({ label, value }) => {
    if (!value && typeof value !== 'boolean') return null;

    const renderValue = () => {
        if (typeof value === 'boolean') {
            return <Badge bg={value ? 'success' : 'danger'}>{value ? 'Yes' : 'No'}</Badge>;
        }
        if (typeof value === 'string' && value.includes('|')) {
            return (
                <ListGroup variant="flush">
                    {value.split('|').map((item, index) => (
                        <ListGroup.Item key={index} className="px-0 py-1 bg-transparent border-0">{item.trim()}</ListGroup.Item>
                    ))}
                </ListGroup>
            );
        }
        return value;
    };

    return (
        <div className="mb-3">
            <p className="text-muted mb-1 fs-sm">{label}</p>
            <p className="fw-medium mb-0">{renderValue()}</p>
        </div>
    );
};

const MedicineDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { vendorMedicines, loading, fetchVendorMedicines2 } = useContext(MyContext);
    const [medicine, setMedicine] = useState(null);

    useEffect(() => {
        const findMedicine = () => {
            if (vendorMedicines.length > 0) {
                const found = vendorMedicines.find(m => m.Id === id);
                setMedicine(found);
            }
        };

        if (vendorMedicines.length === 0) {
            fetchVendorMedicines2();
        }
        findMedicine();
    }, [id, vendorMedicines, fetchVendorMedicines2]);
    
    const getMedicineImage = (med) => {
        if (!med) return DUMMY_IMAGE;
        const imageUrl = med.image_url || med.image || '';
        return imageUrl.startsWith('http') ? imageUrl : DUMMY_IMAGE;
    };

    if (loading && !medicine) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" />
                <span className="ms-3">Loading Medicine Details...</span>
            </div>
        );
    }

    if (!medicine) {
        return (
            <Container className="text-center py-5">
                 <BsExclamationCircle size={50} className="text-danger mb-3" />
                 <h2>Medicine Not Found</h2>
                 <p className="text-muted">The medicine with ID #{id} could not be found or does not exist.</p>
                 <Button variant="primary" onClick={() => navigate('/vendor/medicines')}>
                     <BsArrowLeft className="me-2" />
                     Back to Medicines List
                 </Button>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <Button variant="light" className="mb-3" onClick={() => navigate(-1)}>
                <BsArrowLeft className="me-2" /> Back to List
            </Button>
            
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Row>
                        <Col md={4} className="text-center mb-4 mb-md-0">
                            <img
                                src={getMedicineImage(medicine)}
                                alt={medicine.name}
                                className="img-fluid rounded"
                                style={{ maxHeight: '350px', border: '1px solid #eee' }}
                                onError={(e) => { e.target.src = DUMMY_IMAGE; }}
                            />
                        </Col>
                        <Col md={8}>
                            <h2 className="mb-2">{medicine.name || 'N/A'}</h2>
                            <p className="text-muted mb-4">by {medicine.manufacturers || 'Unknown Manufacturer'}</p>
                            
                            <Row>
                                <Col sm={6} md={4}><DetailItem label="Medicine ID" value={`#${medicine.Id}`} /></Col>
                                <Col sm={6} md={4}><DetailItem label="Salt Composition" value={medicine.salt_composition} /></Col>
                                <Col sm={6} md={4}><DetailItem label="Packaging" value={medicine.packaging} /></Col>
                                <Col sm={6} md={4}><DetailItem label="MRP" value={`₹${parseFloat(medicine.mrp || 0).toFixed(2)}`} /></Col>
                                <Col sm={6} md={4}><DetailItem label="Best Price" value={`₹${parseFloat(medicine.best_price || 0).toFixed(2)}`} /></Col>
                                <Col sm={6} md={4}><DetailItem label="Prescription?" value={medicine.prescription_required === 'YES' || medicine.prescription_required === 'true'} /></Col>
                            </Row>
                             <hr/>
                            <DetailItem label="Primary Use(s)" value={medicine.use_of || medicine.primary_use} />

                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Row className="mt-4">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                       <Card.Body>
                          <h4 className="card-title">Medical Information</h4>
                          <hr/>
                           <Row>
                               <Col md={6}><DetailItem label="Introduction" value={medicine.introduction} /></Col>
                               <Col md={6}><DetailItem label="How to Use" value={medicine.how_to_use} /></Col>
                               <Col md={6}><DetailItem label="How It Works" value={medicine.how_works} /></Col>
                               <Col md={6}><DetailItem label="Benefits" value={medicine.benefits} /></Col>
                               <Col md={6}><DetailItem label="Common Side Effects" value={medicine.side_effect} /></Col>
                               <Col md={6}><DetailItem label="Safety Advice" value={medicine.safety_advise} /></Col>
                               <Col md={6}><DetailItem label="Storage" value={medicine.storage} /></Col>
                               <Col md={6}><DetailItem label="If You Miss a Dose" value={medicine.if_miss} /></Col>
                               <Col md={12}><DetailItem label="Alternate Brands" value={medicine.alternate_brand} /></Col>
                               <Col md={12}><DetailItem label="Full Description" value={medicine.description} /></Col>
                           </Row>
                       </Card.Body>
                    </Card>
                </Col>
            </Row>

        </Container>
    );
};

export default MedicineDetailsPage;