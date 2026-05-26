import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Spinner, Alert, Badge, Row, Col, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingBag, FaCheckCircle, FaTruck, FaHome, FaTimesCircle } from 'react-icons/fa';
import moment from 'moment';
import { MyContext } from '../../../../Context/Context';

const PharmacyOrderTracker = () => {
  const { trackOrder } = useContext(MyContext);
  const navigate = useNavigate();
  
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setOrder(null);
      
      const orderData = await trackOrder(orderId);
      
      if (!orderData?.success) {
        throw new Error(orderData?.message || 'Order not found');
      }
      
      setOrder(orderData.data);
    } catch (err) {
      console.error('Error tracking order:', err);
      setError(err.message || 'Failed to track order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { id: 0, label: 'Order Placed', icon: <FaShoppingBag /> },
      { id: 1, label: 'Vendor Accepted', icon: <FaCheckCircle /> },
      { id: 2, label: 'Assigned to Driver', icon: <FaTruck /> },
      { id: 3, label: 'Out for Delivery', icon: <FaTruck /> },
      { id: 4, label: 'Driver Arrived', icon: <FaHome /> },
      { id: 5, label: 'Delivered', icon: <FaCheckCircle /> }
    ];

    return steps.map(step => ({
      ...step,
      active: step.id <= (order?.status || 0),
      current: step.id === (order?.status || 0)
    }));
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">Track Your Order</h1>
          <p className="text-muted">Enter your order ID to check the status</p>
        </Col>
      </Row>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleTrackOrder}>
            <Row className="g-3 align-items-center">
              <Col md={8}>
                <Form.Control
                  type="text"
                  placeholder="Enter your order ID (e.g. ORD123456)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={!orderId.trim() || loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" size="sm" animation="border" className="me-2" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <FaSearch className="me-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-4">
          <FaTimesCircle className="me-2" />
          {error}
        </Alert>
      )}

      {order && (
        <Card className="shadow-sm">
          <Card.Body>
            <Row className="mb-4">
              <Col>
                <h4 className="mb-1">Order #{order.orderId || order._id}</h4>
                <p className="text-muted mb-0">
                  Placed on {moment(order.createdAt).format('DD MMMM YYYY, hh:mm A')}
                </p>
              </Col>
              <Col md="auto">
                <Button
                  variant="outline-primary"
                  onClick={() => navigate(`/pharmacy/orders/${order._id}`)}
                >
                  View Full Details
                </Button>
              </Col>
            </Row>

            <div className="timeline-horizontal mb-4">
              {getStatusSteps().map((step) => (
                <div
                  key={step.id}
                  className={`timeline-step ${step.active ? 'active' : ''} ${step.current ? 'current' : ''}`}
                >
                  <div className="timeline-icon">
                    {step.icon}
                  </div>
                  <div className="timeline-label">
                    {step.label}
                    {step.current && order.updatedAt && (
                      <div className="timeline-date small">
                        {moment(order.updatedAt).format('DD MMM, hh:mm A')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Row className="g-3">
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <h6 className="mb-3">Delivery Details</h6>
                    <p className="mb-1">
                      <strong>Address:</strong> {order.address}
                    </p>
                    <p className="mb-1">
                      <strong>Delivery Slot:</strong> {order.timeSlot}
                    </p>
                    <p className="mb-0">
                      <strong>Delivery Date:</strong> {moment(order.dateSlot).format('DD MMMM YYYY')}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <h6 className="mb-3">Order Summary</h6>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Subtotal:</span>
                      <span>₹{order.subTotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    {order.couponDiscount > 0 && (
                      <div className="d-flex justify-content-between mb-1 text-success">
                        <span>Discount:</span>
                        <span>-₹{order.couponDiscount?.toFixed(2) || '0.00'}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between mb-1">
                      <span>Delivery:</span>
                      <span>
                        {order.deliveryCharges === 0 ? (
                          <span className="text-success">FREE</span>
                        ) : (
                          `₹${order.deliveryCharges?.toFixed(2) || '0.00'}`
                        )}
                      </span>
                    </div>
                    {order.isRapidDelivery && (
                      <div className="d-flex justify-content-between mb-1">
                        <span>Rapid Delivery:</span>
                        <span>₹{order.rapidDeliveryFee?.toFixed(2) || '0.00'}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between fw-bold mt-2 pt-2 border-top">
                      <span>Total:</span>
                      <span>₹{order.grandTotal?.toFixed(2) || '0.00'}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default PharmacyOrderTracker;