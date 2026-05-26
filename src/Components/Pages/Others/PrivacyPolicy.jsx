import React, { useState, useEffect, useContext } from 'react';
 
import {
 
  Container,
 
  Row,
 
  Col,
 
  Card,
 
  Spinner,
 
  Alert,
 
  Accordion
 
} from 'react-bootstrap';
 
import { MyContext } from '../../../Context/Context';
 
import { ShieldLock, InfoCircle, FileText } from 'react-bootstrap-icons';
 
const PrivacyPolicy = () => {
 
  const { policiesUser, loading, error, getPoliciesUser } = useContext(MyContext);
 
  const [privacyContent, setPrivacyContent] = useState('');
 
  // Load policies on component mount
 
  useEffect(() => {
 
    getPoliciesUser();
 
  }, []);
 
  useEffect(() => {
 
    if (policiesUser && policiesUser.privacyPolicy) {
 
      setPrivacyContent(policiesUser.privacyPolicy);
 
    }
 
  }, [policiesUser]);
 
  // Function to format content with proper HTML
 
  const formatContent = (content) => {
 
    if (!content) return '';
 
    // Replace markdown-like headers with HTML
 
    return content
 
      .replace(/### (.*?)\n/g, '<h4 class="text-primary mt-4">$1</h4>')
 
      .replace(/## (.*?)\n/g, '<h3 class="text-primary mt-4">$1</h3>')
 
      .replace(/# (.*?)\n/g, '<h2 class="text-primary border-bottom pb-2">$1</h2>')
 
      .replace(/\n/g, '<br />')
 
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
 
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
 
      .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>')
 
      .replace(/(<li>.*<\/li>)/g, '<ul class="mb-3">$1</ul>');
 
  };
 
  if (loading) {
 
    return (
<Container className="py-5">
<Row className="justify-content-center">
<Col md={8} className="text-center">
<Spinner animation="border" variant="primary" />
<p className="mt-3 text-muted">Loading Privacy Policy...</p>
</Col>
</Row>
</Container>
 
    );
 
  }
 
 
 
  return (
<Container className="py-5">
<Row className="justify-content-center">
<Col lg={10} xl={8}>
 
          {/* Header Section */}
<div className="text-center mb-5">
<ShieldLock size={48} className="text-primary mb-3" />
<h1 className="display-5 fw-bold text-primary">Privacy Policy</h1>
<p className="lead text-muted">
 
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
</p>
<div className="border-bottom mx-auto" style={{ width: '100px', borderColor: '#0d6efd' }}></div>
</div>
 
          {/* Last Updated Info */}
<Card className="mb-4 border-0 shadow-sm">
<Card.Body className="bg-light">
<div className="d-flex align-items-center">
<InfoCircle className="text-primary me-2" />
<small className="text-muted">
<strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', {
 
                    year: 'numeric',
 
                    month: 'long',
 
                    day: 'numeric'
 
                  })}
</small>
</div>
</Card.Body>
</Card>
 
          {/* Privacy Policy Content */}
<Card className="shadow-sm border-0">
<Card.Header className="bg-white border-0 py-4">
<div className="d-flex align-items-center">
<FileText className="text-primary me-3" size={24} />
<h3 className="mb-0 text-dark">Our Privacy Commitment</h3>
</div>
</Card.Header>
<Card.Body className="p-4 p-md-5">
 
              {privacyContent ? (
<div
 
                  className="privacy-content"
 
                  style={{
 
                    lineHeight: '1.8',
 
                    fontSize: '16px',
 
                    color: '#444'
 
                  }}
 
                  dangerouslySetInnerHTML={{ __html: formatContent(privacyContent) }}
 
                />
 
              ) : (
<div className="text-center py-5">
<FileText size={48} className="text-muted mb-3" />
<h4 className="text-muted">Privacy Policy Not Available</h4>
<p className="text-muted">
 
                    The privacy policy content is currently being updated. Please check back later.
</p>
</div>
 
              )}
</Card.Body>
</Card>
 
          {/* Quick Links Accordion */}
{/* <Accordion className="mt-4">
<Accordion.Item eventKey="0">
<Accordion.Header>
<strong>📋 Quick Privacy Overview</strong>
</Accordion.Header>
<Accordion.Body>
<Row>
<Col md={6}>
<h6 className="text-primary">Information We Collect</h6>
<ul className="text-muted small">
<li>Personal identification information</li>
<li>Usage data and analytics</li>
<li>Device and browser information</li>
</ul>
</Col>
<Col md={6}>
<h6 className="text-primary">Your Rights</h6>
<ul className="text-muted small">
<li>Access your personal data</li>
<li>Request data correction</li>
<li>Opt-out of communications</li>
</ul>
</Col>
</Row>
</Accordion.Body>
</Accordion.Item>
</Accordion> */}
 
          {/* Contact Information */}
{/* <Card className="mt-4 border-primary">
<Card.Body className="text-center">
<h5 className="text-primary mb-3">Questions About Our Privacy Policy?</h5>
<p className="text-muted mb-3">
 
                If you have any questions about our privacy practices, please contact us.
</p>
<div className="d-flex justify-content-center gap-3">
<span className="badge bg-primary">Email: privacy@yourcompany.com</span>
<span className="badge bg-secondary">Phone: +1 (555) 123-4567</span>
</div>
</Card.Body>
</Card> */}
</Col>
</Row>
</Container>
 
  );
 
};
 
export default PrivacyPolicy;
 
 