import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';

import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Accordion,
  Badge,
  ListGroup
} from 'react-bootstrap';

import { MyContext } from '../../../Context/Context';

import { JournalText, ExclamationTriangle, CheckCircle, Clock } from 'react-bootstrap-icons';

const TermsConditions = () => {

  const { policiesUser, loading, error, getPoliciesUser } = useContext(MyContext);

  const [termsContent, setTermsContent] = useState('');

  // ✅ Prevent double API call (React 18 StrictMode fix)
  const hasFetched = useRef(false);

  // ✅ Stable date (won’t change on re-render)
  const today = useMemo(() => {
    return new Date().toLocaleDateString();
  }, []);

  // Load policies on component mount (only once)
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      getPoliciesUser();
    }
  }, [getPoliciesUser]);

  useEffect(() => {
    if (policiesUser && policiesUser.termsAndConditions) {
      setTermsContent(policiesUser.termsAndConditions);
    }
  }, [policiesUser]);

  // Function to format content with proper HTML
  const formatContent = (content) => {

    if (!content) return '';

    return content

      .replace(/### (.*?)\n/g, '<h4 class="text-success mt-4">$1</h4>')

      .replace(/## (.*?)\n/g, '<h3 class="text-success mt-4">$1</h3>')

      .replace(/# (.*?)\n/g, '<h2 class="text-success border-bottom pb-2">$1</h2>')

      .replace(/\n/g, '<br />')

      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>')

      .replace(/(<li>.*<\/li>)/g, '<ul class="mb-3">$1</ul>')

      .replace(/\[Important\]/g, '<span class="badge bg-warning text-dark">Important</span>')

      .replace(/\[Required\]/g, '<span class="badge bg-danger">Required</span>');
  };

  if (loading) {

    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Spinner animation="border" variant="success" />
            <p className="mt-3 text-muted">Loading Terms & Conditions...</p>
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
            <JournalText size={48} className="text-success mb-3" />
            <h1 className="display-5 fw-bold text-success">Terms & Conditions</h1>
            <p className="lead text-muted">
              Please read these terms carefully before using our services.
            </p>
            <div className="border-bottom mx-auto" style={{ width: '100px', borderColor: '#198754' }}></div>
          </div>

          {/* Important Notice */}
          <Alert variant="warning" className="mb-4">
            <div className="d-flex align-items-center">
              <ExclamationTriangle className="me-3" size={24} />
              <div>
                <strong>Important Legal Notice</strong>
                <p className="mb-0 small">
                  By accessing or using our services, you agree to be bound by these terms and conditions.
                </p>
              </div>
            </div>
          </Alert>

          {/* Last Updated & Version */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-2">
                    <Clock className="text-success me-2" />
                    <small className="text-muted">
                      <strong>Last Updated:</strong> {today}
                    </small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Terms Content */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0 py-4">
              <div className="d-flex align-items-center">
                <JournalText className="text-success me-3" size={24} />
                <h3 className="mb-0 text-dark">Terms of Service</h3>
              </div>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">

              {termsContent ? (
                <div
                  className="terms-content"
                  style={{
                    lineHeight: '1.8',
                    fontSize: '16px',
                    color: '#444'
                  }}
                  dangerouslySetInnerHTML={{ __html: formatContent(termsContent) }}
                />
              ) : (
                <div className="text-center py-5">
                  <JournalText size={48} className="text-muted mb-3" />
                  <h4 className="text-muted">Terms & Conditions Not Available</h4>
                  <p className="text-muted">
                    The terms and conditions content is currently being updated. Please check back later.
                  </p>
                </div>
              )}

            </Card.Body>
          </Card>

          {/* Acceptance Section */}
          {/* <Card className="mt-4 border-success">
            <Card.Body className="text-center">
              <h5 className="text-success mb-3">
                <CheckCircle className="me-2" />
                Acceptance of Terms
              </h5>
              <p className="text-muted mb-3">
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
              </p>
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <Badge bg="success" className="fs-6">Legally Binding</Badge>
                <Badge bg="primary" className="fs-6">User Agreement</Badge>
                <Badge bg="warning" text="dark" className="fs-6">Important Notice</Badge>
              </div>
            </Card.Body>
          </Card> */}

          {/* Contact Support */}
          {/* <Card className="mt-4 bg-light">
            <Card.Body className="text-center">
              <h6 className="mb-3">Need Clarification?</h6>
              <p className="text-muted small mb-0">
                If you have any questions about these terms, please contact our legal team at
                <strong> legal@yourcompany.com</strong>
              </p>
            </Card.Body>
          </Card> */}

        </Col>
      </Row>
    </Container>
  );
};

export default TermsConditions;