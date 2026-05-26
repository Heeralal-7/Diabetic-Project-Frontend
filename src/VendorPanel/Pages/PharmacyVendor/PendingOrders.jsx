import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Table, Button, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';

// --- 1. Reusable Confirmation Modal ---
const ConfirmationModal = ({ show, onClose, onConfirm, title, message }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          No
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// --- 2. Prescription Viewer Modal with Zoom ---
const PrescriptionModal = ({ show, onClose, imageUrl }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (show) setScale(1);
  }, [show]);

  const zoomIn = () => setScale(prev => prev + 0.2);
  const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.2));
  const resetZoom = () => setScale(1);

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Prescription View</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflow: 'hidden', textAlign: 'center' }}>
        <div className="d-flex justify-content-center gap-2 mb-3">
          <Button variant="outline-primary" size="sm" onClick={zoomOut}><i className="bi bi-dash-lg"></i> Zoom Out</Button>
          <Button variant="outline-secondary" size="sm" onClick={resetZoom}>Reset</Button>
          <Button variant="outline-primary" size="sm" onClick={zoomIn}><i className="bi bi-plus-lg"></i> Zoom In</Button>
        </div>
        <div style={{ width: '100%', height: '60vh', overflow: 'auto', border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
            <img 
                src={imageUrl} 
                alt="Full Prescription" 
                style={{ 
                    maxWidth: '100%', 
                    transform: `scale(${scale})`, 
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease-in-out'
                }} 
            />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

// --- 3. Main Component ---
const PendingOrders = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState(null);
  const [actionType, setActionType] = useState(''); 

  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  const {
    pendingOrders,
    loading,
    fetchPendingOrders,
    acceptOrder,
    rejectOrder
  } = useContext(MyContext);

  const loadPendingOrders = useCallback(() => {
    fetchPendingOrders();
  }, [fetchPendingOrders]);

  useEffect(() => {
    loadPendingOrders();
  }, [loadPendingOrders]);

  const handleAcceptConfirmation = (orderId) => {
    setOrderToConfirm(orderId);
    setActionType('accept');
    setShowConfirmModal(true);
  };

  const handleRejectConfirmation = (orderId) => {
    setOrderToConfirm(orderId);
    setActionType('reject');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!orderToConfirm) return;
    setShowConfirmModal(false);
    if (actionType === 'accept') {
      await acceptOrder(orderToConfirm);
    } else if (actionType === 'reject') {
      await rejectOrder(orderToConfirm);
    }
    loadPendingOrders();
    setOrderToConfirm(null);
    setActionType('');
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setOrderToConfirm(null);
    setActionType('');
  };

  const handleOpenImage = (imgUrl) => {
      const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${process.env.REACT_APP_API_URL}${imgUrl}`;
      setPreviewImageUrl(fullUrl);
      setShowImageModal(true);
  };

  const handleCloseImage = () => {
      setShowImageModal(false);
      setPreviewImageUrl('');
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-0">
        <h5 className="card-title mb-4">Pending Orders</h5>

        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : pendingOrders.length > 0 ? (
                pendingOrders.map(order => (
                  <React.Fragment key={order._id}>
                    <tr>
                      <td>
                        <Link to={`/pharmacy/orders/${order._id}`} className="text-primary">
                          #{order._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td>{order.patientDetails?.name || 'N/A'}</td>
                      <td>{order.items.length}</td>
                      <td>₹{order.grandTotal?.toFixed(2) || '0.00'}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Badge bg="warning">{order.statusText || 'Pending'}</Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAcceptConfirmation(order._id)}
                            disabled={loading}
                          >
                            <i className="bi bi-check"></i> Accept
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectConfirmation(order._id)}
                            disabled={loading}
                          >
                            <i className="bi bi-x"></i> Reject
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          >
                            <i className={`bi bi-chevron-${expandedOrder === order._id ? 'up' : 'down'}`}></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrder === order._id && (
                      <tr>
                        <td colSpan="7" className="p-0">
                          <div className="p-3 bg-light">
                            
                            <h6 className="mb-3 border-bottom pb-2">Order Details</h6>
                            
                            {/* ✅ Updated Layout: 3 Columns Row (Customer | Order Info | Prescription) */}
                            <div className="row g-3">
                                
                                {/* Column 1: Customer Details */}
                                <div className="col-md-4">
                                    <h6 className="text-muted small text-uppercase fw-bold mb-2">Customer Info</h6>
                                    <p className="mb-1"><strong>Name:</strong> {order.patientDetails?.name || "N/A"}</p>
                                    <p className="mb-1"><strong>Phone:</strong> {order.patientDetails?.phone || "N/A"}</p>
                                    <p className="mb-1">
                                      <strong>Address:</strong>{" "}
                                      {order.patientDetails
                                        ? [
                                            order.patientDetails.address,
                                            order.patientDetails.city,
                                            order.patientDetails.state,
                                            order.patientDetails.pinCode,
                                          ].filter(Boolean).join(", ")
                                        : "N/A"}
                                    </p>
                                    <p className="mb-0"><strong>Slot:</strong> {order.dateSlot} ({order.timeSlot})</p>
                                </div>

                                {/* Column 2: Order Financials */}
                                <div className="col-md-4">
                                    <h6 className="text-muted small text-uppercase fw-bold mb-2">Order Info</h6>
                                    <p className="mb-1"><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                    <p className="mb-1"><strong>Subtotal:</strong> ₹{order.subTotal?.toFixed(2) || '0.00'}</p>
                                    {order.extraDistanceCharges > 0 && (
                                      <p className="text-muted small mb-1">
                                        <strong>Extra Distance:</strong> +₹{order.extraDistanceCharges.toFixed(2)}
                                      </p>
                                    )}
                                    {order.coupon && (
                                      <p className="mb-1"><strong>Coupon:</strong> {order.coupon.code} (-{order.coupon.discountValue}%)</p>
                                    )}
                                    <p className="mb-0"><strong>Grand Total:</strong> ₹{order.grandTotal?.toFixed(2) || '0.00'}</p>
                                </div>

                                {/* Column 3: Prescription Thumbnail */}
                                <div className="col-md-4 text-center border-start">
                                    <h6 className="text-muted small text-uppercase fw-bold mb-2">Prescription</h6>
                                    {order.prescriptionImage ? (
                                        <div 
                                            className="d-inline-block" 
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleOpenImage(order.prescriptionImage)}
                                        >
                                            <div style={{ 
                                                width: '120px', 
                                                height: '100px', 
                                                borderRadius: '8px', 
                                                overflow: 'hidden', 
                                                border: '2px solid #0d6efd',
                                                position: 'relative',
                                                margin: '0 auto'
                                            }}>
                                                <img 
                                                    src={order.prescriptionImage.startsWith('http') ? order.prescriptionImage : `${process.env.REACT_APP_API_URL}${order.prescriptionImage}`}
                                                    alt="Prescription Thumbnail"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    textAlign: 'center',
                                                    padding: '2px 0'
                                                }}>
                                                    Click to View
                                                </div>
                                            </div>
                                            <small className="text-primary mt-1 d-block">View Full Image</small>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center border rounded bg-white text-muted" style={{ height: '100px', width: '120px', margin: '0 auto' }}>
                                            <small>No Prescription</small>
                                        </div>
                                    )}
                                </div>

                            </div>
                            
                            <h6 className="mt-4 mb-2">Items</h6>
                            <Table size="sm" className="bg-white table-bordered">
                              <thead>
                                <tr className="table-light">
                                  <th>Product</th>
                                  <th>Type</th>
                                  <th>Quantity</th>
                                  <th>Unit Price</th>
                                  <th>Discount</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item, index) => (
                                  <tr key={index}>
                                    <td>{item.itemName}</td>
                                    <td>{item.itemType}</td>
                                    <td>{item.quantity}</td>
                                    <td>₹{item.unitPrice?.toFixed(2) || '0.00'}</td>
                                    <td>{item.discount}%</td>
                                    <td>₹{item.totalPrice?.toFixed(2) || '0.00'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <i className="bi bi-inbox fs-1 text-muted"></i>
                    <p className="mt-2 mb-0">No pending orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmAction}
        title={actionType === 'accept' ? 'Confirm Acceptance' : 'Confirm Rejection'}
        message={
          actionType === 'accept'
            ? 'Are you sure you want to accept this order?'
            : 'Are you sure you want to reject this order?'
        }
      />

      <PrescriptionModal 
        show={showImageModal} 
        onClose={handleCloseImage} 
        imageUrl={previewImageUrl} 
      />

    </div>
  );
};

export default PendingOrders;