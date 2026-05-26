import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Alert, Spinner, Badge, FormControl, InputGroup, Button, Modal } from 'react-bootstrap';

const LabOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State for the test details modal
  const [showTestDetailsModal, setShowTestDetailsModal] = useState(false);
  const [selectedOrderTests, setSelectedOrderTests] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  useEffect(() => {
    fetchHistoryOrders();
  }, []);

  const fetchHistoryOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const verify = sessionStorage.getItem("labtoken");
      if (!verify) throw new Error("Authentication token not found");
      
      const parsedVerify = JSON.parse(verify);
      const token = parsedVerify.token;

      const statusesToFetch = ['7', '8', '9'];
      const typesToFetch = ['0', '1'];
      
      const promises = [];
      statusesToFetch.forEach(status => {
        typesToFetch.forEach(type => {
          promises.push(
            axios.get(
              `${URL}/all-appointments/getallaapointments?type=${type}&status=${status}&page=1&limit=100`,
              { headers: { token: token } }
            ).then(res => ({ ...res.data, fetchedStatus: status, fetchedType: type }))
             .catch(err => ({ success: false, error: err }))
          );
        });
      });

      const responses = await Promise.all(promises);
      let combinedOrders = [];
      
      responses.forEach(response => {
        if (response.success && response.details) {
          combinedOrders = [...combinedOrders, ...response.details];
        }
      });

      const validOrders = combinedOrders.filter(order => 
        ['7', '8', '9'].includes(String(order.status))
      );

      validOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(validOrders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching history orders:", error);
      setError(error.message || "An unknown error occurred.");
      setLoading(false);
    }
  };

  // --- Helper Functions ---
  const getAllTestNames = (order) => {
    if (order.testId && order.testId.length > 0) {
      return order.testId.map(test => test.testName).join(', ');
    } else if (order.packageId && order.packageId.packageName) {
      return order.packageId.packageName;
    }
    return order.testName || 'Test/Package';
  };

  const hasMultipleTests = (order) => order.testId && order.testId.length > 1;
  const getCustomerName = (order) => order.name || (order.userId && order.userId.name) || 'N/A';
  const getPrice = (order) => order.price ?? order.amount ?? 0;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  const getStatusBadge = (status) => {
    const s = String(status);
    if (s === '8') return <Badge bg="success">Order Completed</Badge>;
    if (s === '7') return <Badge bg="danger">Driver Rejected</Badge>;
    if (s === '9') return <Badge bg="danger">Rejected by Vendor</Badge>;
    return <Badge bg="secondary">Status: {s}</Badge>;
  };

  // --- Actions ---
  const handleShowTestDetails = (order) => {
    setSelectedOrderTests(order.testId || []);
    setSelectedOrderDetails(order);
    setShowTestDetailsModal(true);
  };

  // --- Search Logic ---
  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return orders;
    return orders.filter(order => {
      const orderId = order._id?.slice(-6).toLowerCase();
      const customer = getCustomerName(order).toLowerCase();
      const tests = getAllTestNames(order).toLowerCase();
      return orderId.includes(term) || customer.includes(term) || tests.includes(term);
    });
  }, [orders, searchTerm]);

  // --- Styles ---
  const stickyHeaderStyle = {
    position: 'sticky',
    top: 0,
    backgroundColor: '#f8f9fa',
    zIndex: 10,
    boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.1)'
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <div className="container-fluid my-4">
      <div className="card shadow-sm">
        <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
          <h3 className="card-title mb-0">Order History (Completed & Rejected)</h3>
          <Badge bg="light" text="dark">{filteredOrders.length} Orders</Badge>
        </div>
        <div className="card-body">
          <InputGroup className="mb-3">
            <FormControl 
              placeholder="Search by Order ID, Customer, or Test..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <Button variant="outline-dark" onClick={() => setSearchTerm('')}>Clear</Button>
          </InputGroup>

          <div className="table-responsive" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={stickyHeaderStyle}>Order ID</th>
                  <th style={stickyHeaderStyle}>Customer</th>
                  <th style={stickyHeaderStyle}>Test/Package</th>
                  <th style={stickyHeaderStyle}>Status</th>
                  <th style={stickyHeaderStyle}>Amount</th>
                  <th style={stickyHeaderStyle}>Date</th>
                  <th style={stickyHeaderStyle}>Driver</th>
                  <th style={stickyHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr 
                    key={order._id} 
                    onClick={() => handleShowTestDetails(order)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <td><strong>{order._id.slice(-6)}</strong></td>
                    <td>{getCustomerName(order)}</td>
                    <td>
                      {getAllTestNames(order)}
                      {hasMultipleTests(order) && (
                        <Badge bg="info" className="ms-1">+{order.testId.length - 1} More</Badge>
                      )}
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>₹{getPrice(order)}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>
                      {/* Driver logic kept exactly the same */}
                      {order.driverId ? (
                        <small>{order.driverId.name || 'Assigned'}</small>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <Button variant="outline-info" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleShowTestDetails(order);
                      }}>View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- ENHANCED TEST DETAILS MODAL (Matching PendingOrders) --- */}
      <Modal show={showTestDetailsModal} onHide={() => setShowTestDetailsModal(false)} centered size="xl">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">
            <i className="fas fa-history me-2 text-primary"></i>
            Order History Details – #{selectedOrderDetails?._id.slice(-6)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrderDetails && (
            <>
              <div className="row g-3 mb-4">
                {/* Information Column */}
                <div className="col-md-6">
                  <div className="p-3 border rounded bg-light h-100">
                    <h6 className="border-bottom pb-2 mb-3 fw-bold text-uppercase small">General Information</h6>
                    <div className="row">
                      <div className="col-6">
                        <p className="mb-2"><small className="text-muted">Customer Name</small><br /><strong>{getCustomerName(selectedOrderDetails)}</strong></p>
                        <p className="mb-2"><small className="text-muted">Phone Number</small><br /><strong>{selectedOrderDetails.phone || "N/A"}</strong></p>
                        <p className="mb-0"><small className="text-muted">Status</small><br />{getStatusBadge(selectedOrderDetails.status)}</p>
                      </div>
                      <div className="col-6">
                        <p className="mb-2"><small className="text-muted">Appointment Date</small><br /><strong>{formatDate(selectedOrderDetails.date)}</strong></p>
                        <p className="mb-2"><small className="text-muted">Service Type</small><br /><strong>{selectedOrderDetails.serviceType || "N/A"}</strong></p>
                        <p className="mb-0"><small className="text-muted">Payment</small><br /><strong>{selectedOrderDetails.isPaid ? <span className="text-success">Paid</span> : <span className="text-danger">Pending</span>}</strong></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Summary Column */}
                <div className="col-md-6">
                  {(() => {
                    const mrp = selectedOrderTests.reduce((t, test) => t + Number(test.amount ?? 0), 0);
                    const vendorDiscount = selectedOrderTests.reduce((t, test) => {
                      const p = Number(test.amount ?? 0);
                      const d = Number(test.discountPercentage ?? 0);
                      return t + (p * d) / 100;
                    }, 0);
                    const vendorPrice = mrp - vendorDiscount;
                    const couponPercent = Number(selectedOrderDetails?.couponId?.percentageDiscount ?? 0);
                    const couponDiscount = (vendorPrice * couponPercent) / 100;
                    const delivery = Number(selectedOrderDetails?.deliveryCharges ?? 0);
                    const final = vendorPrice - couponDiscount + delivery;

                    return (
                      <div className="p-3 border rounded bg-white h-100 shadow-sm">
                        <h6 className="border-bottom pb-2 mb-3 fw-bold text-uppercase small">Pricing Summary</h6>
                        <div className="d-flex justify-content-between mb-1"><span className="text-muted">Total MRP</span><span>₹{mrp.toFixed(2)}</span></div>
                        <div className="d-flex justify-content-between mb-1 text-success"><span>Vendor Discount</span><span>-₹{vendorDiscount.toFixed(2)}</span></div>
                        <div className="d-flex justify-content-between mb-1 text-success"><span>Coupon Discount</span><span>-₹{couponDiscount.toFixed(2)}</span></div>
                        <div className="d-flex justify-content-between mb-1"><span className="text-muted">Delivery Charges</span><span>+₹{delivery.toFixed(2)}</span></div>
                        <div className="pt-2 border-top mt-2 text-center">
                          <small className="text-muted">TOTAL AMOUNT</small>
                          <div className="fs-3 fw-bold text-primary">₹{final.toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Tests Table */}
              <h6 className="fw-bold mb-3">Included Tests</h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Test Name</th>
                      <th>Category</th>
                      <th>Sample Required</th>
                      <th>MRP</th>
                      <th>Discount</th>
                      <th>Final Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderTests.length > 0 ? selectedOrderTests.map((test) => {
                      const mrp = Number(test.amount ?? 0);
                      const disc = (mrp * Number(test.discountPercentage ?? 0)) / 100;
                      return (
                        <tr key={test._id}>
                          <td><strong>{test.testName}</strong></td>
                          <td>{test.testCategory || "N/A"}</td>
                          <td>{test.sampleRequired || "N/A"}</td>
                          <td className="text-decoration-line-through text-muted small">₹{mrp.toFixed(2)}</td>
                          <td className="text-success small">{test.discountPercentage}%</td>
                          <td className="fw-bold">₹{(mrp - disc).toFixed(2)}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="6" className="text-center py-2 text-muted">
                           {selectedOrderDetails.testName || selectedOrderDetails.packageName || "No item details available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Reason Section (If Rejected) */}
              {(selectedOrderDetails.status === '7' || selectedOrderDetails.status === '9' || selectedOrderDetails.rejectionReason) && (
                <div className="mt-3 p-3 bg-danger bg-opacity-10 border border-danger rounded">
                  <h6 className="text-danger fw-bold mb-1">Rejection Reason / Note:</h6>
                  <p className="mb-0 text-dark">{selectedOrderDetails.rejectionReason || selectedOrderDetails.description || "No specific reason provided."}</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTestDetailsModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LabOrderHistory;