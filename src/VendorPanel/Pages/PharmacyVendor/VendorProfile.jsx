import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Card, Col, Row, Spinner, Alert, Image } from 'react-bootstrap';
import { MyContext } from '../../../Context/Context'; // सुनिश्चित करें कि पथ सही है

const VendorProfile = () => {
    // कॉन्टेक्स्ट से आवश्यक डेटा और फ़ंक्शन प्राप्त करें
    const { vendorProfile, getVendorProfile, updateVendorProfile, loading, error } = useContext(MyContext);
    
    // UI मोड (देखें या संपादित करें) को नियंत्रित करने के लिए नया स्टेट
    const [isEditing, setIsEditing] = useState(false);

    // फ़ॉर्म डेटा और फ़ाइलों के लिए स्टेट
    const [formData, setFormData] = useState({});
    const [files, setFiles] = useState({ avatar: null, banner: null });

    // संदेशों के लिए स्टेट (जैसे 'प्रोफ़ाइल अपडेट हो गई')
    const [message, setMessage] = useState({ type: '', text: '' });

    // ❗ महत्वपूर्ण: अपना API बेस URL यहाँ डालें, ताकि इमेज सही से लोड हों
    const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    // कंपोनेंट लोड होने पर प्रोफ़ाइल डेटा फ़ेच करें
    useEffect(() => {
        getVendorProfile();
    }, [getVendorProfile]);

    // जब कॉन्टेक्स्ट से प्रोफ़ाइल डेटा आए, तो फ़ॉर्म को भरें
    useEffect(() => {
        if (vendorProfile) {
            setFormData({
                name: vendorProfile.name || '',
                email: vendorProfile.email || '',
                phone: vendorProfile.phone || '',
                altrphone: vendorProfile.altrphone || '',
                labName: vendorProfile.labName || '',
                business: vendorProfile.business || '',
                address: vendorProfile.address || '',
                city: vendorProfile.city || '',
                state: vendorProfile.state || '',
                country: vendorProfile.country || '',
            });
        }
    }, [vendorProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    };
    
    // संपादन मोड को सक्रिय करें
    const handleEditClick = () => {
        setIsEditing(true);
        setMessage({ type: '', text: '' }); // पुराने संदेशों को साफ़ करें
    };

    // संपादन रद्द करें
    const handleCancelClick = () => {
        setIsEditing(false);
        // यदि उपयोगकर्ता ने कुछ बदला है तो फ़ॉर्म को मूल स्थिति में लाएं
        if (vendorProfile) setFormData(vendorProfile);
        setFiles({ avatar: null, banner: null });
    };

    // फ़ॉर्म सबमिट करें
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (files.avatar) data.append('avatar', files.avatar);
        if (files.banner) data.append('banner', files.banner);

        try {
            const result = await updateVendorProfile(data);
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setIsEditing(false); // सफ़लता पर वापस व्यू मोड में जाएं
            } else {
                setMessage({ type: 'danger', text: result.message || 'Update failed.' });
            }
        } catch (err) {
            setMessage({ type: 'danger', text: err.message || 'An unexpected error occurred.' });
        }
    };

    // प्रारंभिक लोडिंग के लिए स्पिनर दिखाएं
    if (loading && !vendorProfile) {
        return <div className="text-center mt-5"><Spinner animation="border" /> <p>Loading Profile...</p></div>;
    }

    return (
        <Card className="shadow-sm mt-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title as="h4" className="mb-0 text-primary">My Profile</Card.Title>
                {/* एडिट और कैंसिल बटन को यहाँ दिखाएं */}
                {!isEditing ? (
                    <Button variant="primary" onClick={handleEditClick}>Edit Profile</Button>
                ) : (
                    <div>
                        <Button variant="secondary" className="me-2" onClick={handleCancelClick}>Cancel</Button>
                        <Button variant="success" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </Card.Header>
            <Card.Body>
                {/* केवल संबंधित संदेश दिखाएं */}
                {message.text && <Alert variant={message.type}>{message.text}</Alert>}
                {/* यदि प्रोफ़ाइल लोड करने में ही त्रुटि हो तो यह दिखाएं */}
                {error && !vendorProfile && <Alert variant="danger">Could not load profile data: {error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-4">
                        <Col md={4} className="text-center">
                            <h5>Profile Picture</h5>
                            <Image 
                                src={vendorProfile?.image ? `${URL.replace('/api', '')}${vendorProfile.image}` : 'https://via.placeholder.com/150'} 
                                roundedCircle 
                                thumbnail 
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            {isEditing && (
                                <Form.Group className="my-3">
                                    <Form.Label>Change Avatar</Form.Label>
                                    <Form.Control type="file" name="avatar" onChange={handleFileChange} />
                                </Form.Group>
                            )}
                        </Col>
                        <Col md={8}>
                            <h5>Banner Image</h5>
                            <Image 
                                src={vendorProfile?.banner ? `${URL.replace('/api', '')}${vendorProfile.banner}` : 'https://via.placeholder.com/800x200'} 
                                fluid 
                                thumbnail 
                                style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                            />
                             {isEditing && (
                                <Form.Group className="my-3">
                                    <Form.Label>Change Banner</Form.Label>
                                    <Form.Control type="file" name="banner" onChange={handleFileChange} />
                                </Form.Group>
                            )}
                        </Col>
                    </Row>
                    <hr />
                    <Row>
                        {Object.keys(formData).map((key) => (
                            <Col md={6} key={key}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-capitalize">{key.replace(/([A-Z])/g, ' $1')}</Form.Label>
                                    <Form.Control
                                        type={key === 'email' ? 'email' : 'text'}
                                        name={key}
                                        value={formData[key]}
                                        onChange={handleChange}
                                        readOnly={!isEditing} // यह फ़ील्ड को रीड-ओनली बनाता है
                                        plaintext={!isEditing} // यह इसे सादे टेक्स्ट की तरह दिखाता है
                                    />
                                </Form.Group>
                            </Col>
                        ))}
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default VendorProfile;