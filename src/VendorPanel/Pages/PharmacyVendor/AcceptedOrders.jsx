import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Table, Button, Badge, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';

// --- Reusable Prescription Modal ---
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

const AcceptedOrders = () => {
    const [selectedDrivers, setSelectedDrivers] = useState({});
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [reassigningOrderId, setReassigningOrderId] = useState(null);

    // Image Viewer State
    const [showImageModal, setShowImageModal] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState('');

    const {
        acceptedOrders,
        loading,
        error,
        availableDrivers,
        fetchAcceptedOrders,
        assignDriverToOrder2,
        fetchAvailableDrivers
    } = useContext(MyContext);

    useEffect(() => {
        fetchAcceptedOrders();
        fetchAvailableDrivers();
    }, [fetchAcceptedOrders, fetchAvailableDrivers]);
    
    const trulyAvailableDrivers = useMemo(() => {
        if (Array.isArray(availableDrivers)) {
            return availableDrivers.filter(driver => !driver.isBusy);
        }
        return [];
    }, [availableDrivers]);

    const handleAssignDriver = async (orderId) => {
        const driverId = selectedDrivers[orderId];
        if (!driverId) {
            alert("Please select a driver first.");
            return;
        }

        try {
            const result = await assignDriverToOrder2(orderId, driverId);
            if (result.success) {
                alert('Driver assigned/updated successfully!');
                fetchAcceptedOrders();
                fetchAvailableDrivers(); 
                setSelectedDrivers(prev => ({ ...prev, [orderId]: '' }));
                if (reassigningOrderId === orderId) {
                    setReassigningOrderId(null);
                }
            } else {
                alert(`Error: ${result.message || 'Failed to assign driver.'}`);
            }
        } catch (err) {
            console.error('Error assigning driver:', err);
            alert('An unexpected error occurred.');
        }
    };

    const handleCancelReassign = (orderId) => {
        setReassigningOrderId(null);
        setSelectedDrivers(prev => ({ ...prev, [orderId]: '' }));
    };

    // Handlers for Image Viewer
    const handleOpenImage = (imgUrl) => {
        const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${process.env.REACT_APP_API_URL}${imgUrl}`;
        setPreviewImageUrl(fullUrl);
        setShowImageModal(true);
    };
  
    const handleCloseImage = () => {
        setShowImageModal(false);
        setPreviewImageUrl('');
    };

    if (error && acceptedOrders.length === 0) {
        return (
            <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                    <Alert variant="danger"><strong>Error:</strong> {error}</Alert>
                    <Button variant="primary" onClick={fetchAcceptedOrders}>Try Again</Button>
                </div>
            </div>
        );
    }
    
    if (loading && acceptedOrders.length === 0) {
        return (
            <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                    <Spinner animation="border" /><p className="mt-2">Loading Accepted Orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card shadow-sm border-0">
            <div className="card-body p-0">
                <h5 className="card-title mb-4">Accepted Orders</h5>
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Driver</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {acceptedOrders.length > 0 ? (
                                acceptedOrders.map(order => (
                                    <React.Fragment key={order._id}>
                                        <tr>
                                            <td>
                                                <Link to={`/pharmacy/orders/${order._id}`} className="fw-bold text-primary">
                                                    #{order._id?.slice(-6).toUpperCase() || 'N/A'}
                                                </Link>
                                            </td>
                                            <td>{order.patientDetails?.name || 'N/A'}</td>
                                            <td>₹{order.grandTotal?.toFixed(2) || '0.00'}</td>
                                            <td>
                                                <Badge bg={order.status === 2 ? "warning" : "info"}>
                                                    {order.statusText || 'Accepted'}
                                                </Badge>
                                            </td>
                                            <td>
                                                {reassigningOrderId === order._id || !order.driverAssignedId ? (
                                                    <Form.Select
                                                        size="sm"
                                                        value={selectedDrivers[order._id] || ''}
                                                        onChange={(e) => setSelectedDrivers(prev => ({ ...prev, [order._id]: e.target.value }))}
                                                    >
                                                        <option value="">{reassigningOrderId === order._id ? "Select New Driver" : "Select Driver"}</option>
                                                        {trulyAvailableDrivers.length > 0 ? (
                                                            trulyAvailableDrivers.map(driver => (
                                                                <option key={driver._id} value={driver._id}>
                                                                    {driver.name} ({driver.status})
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option disabled>No drivers available</option>
                                                        )}
                                                    </Form.Select>
                                                ) : (
                                                    <span>{order.driverAssignedId.name}</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    {reassigningOrderId === order._id ? (
                                                        <>
                                                            <Button variant="success" size="sm" disabled={!selectedDrivers[order._id]} onClick={() => handleAssignDriver(order._id)}>Save</Button>
                                                            <Button variant="secondary" size="sm" onClick={() => handleCancelReassign(order._id)}>Cancel</Button>
                                                        </>
                                                    ) : order.driverAssignedId ? (
                                                        <>
                                                            {order.canReassign && (
                                                                <Button variant="outline-primary" size="sm" onClick={() => setReassigningOrderId(order._id)}>Re-assign</Button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <Button variant="primary" size="sm" disabled={!selectedDrivers[order._id] || loading || trulyAvailableDrivers.length === 0} onClick={() => handleAssignDriver(order._id)}>
                                                            Assign
                                                        </Button>
                                                    )}
                                                    <Button variant="outline-secondary" size="sm" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                                                        <i className={`bi bi-chevron-${expandedOrder === order._id ? 'up' : 'down'}`}></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedOrder === order._id && (
                                            <tr>
                                                <td colSpan="6" className="p-0">
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

                                                        <h6 className="mt-4 mb-2">Order Items</h6>
                                                        <Table size="sm" bordered className="bg-white">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th>Product</th>
                                                                    <th>Qty</th>
                                                                    <th>Unit Price</th>
                                                                    <th>Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.items?.map((item, index) => (
                                                                    <tr key={item._id || index}>
                                                                        <td>{item.itemName || 'N/A'}</td>
                                                                        <td>{item.quantity || 0}</td>
                                                                        <td>₹{item.unitPrice?.toFixed(2) || '0.00'}</td>
                                                                        <td>₹{((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}</td>
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
                                    <td colSpan="6" className="text-center py-4">
                                        <p className="mb-0">No accepted orders found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>

            {/* ✅ PRESCRIPTION VIEWER MODAL */}
            <PrescriptionModal 
                show={showImageModal} 
                onClose={handleCloseImage} 
                imageUrl={previewImageUrl} 
            />
        </div>
    );
};

export default AcceptedOrders;