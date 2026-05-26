import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Alert, Spinner, Badge, FormControl, InputGroup, Button, Modal } from 'react-bootstrap';

const SampleCollected = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Upload Report States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reportFile, setReportFile] = useState(null);

  // Test Details Modal States
  const [showTestDetailsModal, setShowTestDetailsModal] = useState(false);
  const [selectedOrderTests, setSelectedOrderTests] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  useEffect(() => {
    fetchSampleCollectedOrders();
  }, []);

  const fetchSampleCollectedOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        throw new Error("Authentication token not found");
      }
      
      const parsedVerify = JSON.parse(verify);
      const token = parsedVerify.token;

      const generalOrdersResponse = await axios.get(
        `${URL}/all-appointments/getallaapointments?type=0&status=6&page=1&limit=100`,
        { headers: { token: token } }
      );

      const prescriptionOrdersResponse = await axios.get(
        `${URL}/all-appointments/getallaapointments?type=1&status=6&page=1&limit=100`,
        { headers: { token: token } }
      );

      let combinedOrders = [];
      if (generalOrdersResponse.data.success) {
        combinedOrders = [...combinedOrders, ...(generalOrdersResponse.data.details || [])];
      }

      if (prescriptionOrdersResponse.data.success) {
        combinedOrders = [...combinedOrders, ...(prescriptionOrdersResponse.data.details || [])];
      }

      combinedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(combinedOrders);
      setLoading(false);

    } catch (error) {
      console.error("Error fetching sample collected orders:", error);
      setError(error.message || "An unknown error occurred while fetching orders.");
      setLoading(false);
    }
  };

  // --- Helper Functions ---
  const getAllTestNames = (order) => {
    if (order.testId && order.testId.length > 0) {
      return order.testId.map(test => test.testName).join(', ');
    } else if (order.packageId && order.packageId.packageName) {
      return order.packageId.packageName;
    } else if (order.testName) {
      return order.testName;
    }
    return 'Test/Package';
  };

  const hasMultipleTests = (order) => {
    return order.testId && order.testId.length > 1;
  };

  const getCustomerName = (order) => {
    return order.name || 'N/A';
  };

  const getPrice = (order) => {
    if (order.price !== undefined && order.price !== null) return order.price;
    if (order.amount !== undefined && order.amount !== null) return order.amount;
    return 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // --- Upload Report Logic ---
  const handleUploadReport = (order) => {
    setSelectedOrder(order);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    setReportFile(e.target.files[0]);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setShowUploadModal(false);
    setReportFile(null);
  };

  const submitReport = async () => {
    if (!reportFile) {
      alert("Please select a report file to upload.");
      return;
    }

    try {
      const verify = sessionStorage.getItem("labtoken");
      if (!verify) throw new Error("Authentication token not found");
      const parsedVerify = JSON.parse(verify);
      
      const formData = new FormData();
      formData.append('report', reportFile);
      
      const response = await axios.patch(
        `${URL}/all-appointments/report/${selectedOrder._id}`,
        formData,
        {
          headers: {
            'token': parsedVerify.token,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      
      if (response.data.success) {
        alert("Report uploaded successfully");
        setShowUploadModal(false);
        setReportFile(null);
        setSelectedOrder(null);
        fetchSampleCollectedOrders();
      } else {
        alert("Failed to upload report: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading report:", error);
      alert("Error uploading report: " + (error.message || "An unknown error occurred"));
    }
  };

  // --- Modal Logic ---
  const handleShowTestDetails = (order) => {
    setSelectedOrderTests(order.testId || []);
    setSelectedOrderDetails(order);
    setShowTestDetailsModal(true);
  };

  // --- Search Logic ---
  const filteredOrders = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (!lowerCaseSearchTerm) return orders;

    return orders.filter(order => {
      const orderId = order._id?.slice(-6).toLowerCase();
      const customerName = getCustomerName(order).toLowerCase();
      const testName = getAllTestNames(order).toLowerCase();
      const driverName = (order.driverId?.name || '').toLowerCase();

      return (
        orderId.includes(lowerCaseSearchTerm) ||
        customerName.includes(lowerCaseSearchTerm) ||
        testName.includes(lowerCaseSearchTerm) ||
        driverName.includes(lowerCaseSearchTerm)
      );
    });
  }, [orders, searchTerm]);

  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" size="lg">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container-fluid my-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h3 className="card-title mb-0">Sample Collected (Pending Upload)</h3>
            </div>
            <div className="card-body">
              <InputGroup className="mb-3">
                <FormControl
                  placeholder="Search by Order ID, Customer, Test, or Driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-dark" onClick={() => setSearchTerm('')}>Clear</Button>
              </InputGroup>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No orders found with status 'Sample Collected' (Status 6).</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Test/Package</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Driver</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id}>
                          <td><strong>{order._id.slice(-6)}</strong></td>
                          <td>{getCustomerName(order)}</td>
                          <td>
                            <span 
                              className={hasMultipleTests(order) ? "text-primary cursor-pointer text-decoration-underline" : ""}
                              onClick={() => handleShowTestDetails(order)}
                            >
                              {getAllTestNames(order)}
                              {hasMultipleTests(order) && (
                                <Badge bg="secondary" className="ms-1">+{order.testId.length - 1}</Badge>
                              )}
                            </span>
                          </td>
                          <td><Badge bg="primary">Sample Collected</Badge></td>
                          <td>₹{getPrice(order)}</td>
                          <td>{formatDate(order.date)}</td>
                          <td>
                            <Badge bg={order.driverId ? "success" : "warning text-dark"}>
                              {order.driverId?.name || 'Not Assigned'}
                            </Badge>
                          </td>
                          <td>
                            <div className="btn-group">
                                <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleShowTestDetails(order)}>Details</button>
                                <button className="btn btn-sm btn-primary" onClick={() => handleUploadReport(order)}>
                                <i className="fas fa-upload me-1"></i> Upload Report
                                </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Report Modal */}
      {showUploadModal && selectedOrder && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Report - #{selectedOrder._id.slice(-6)}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="reportFile" className="form-label">Select Report File</label>
                  <input type="file" className="form-control" id="reportFile" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"/>
                </div>
                <Alert variant="info"><small>Uploading a report will mark this order as completed.</small></Alert>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={submitReport} disabled={!reportFile}>Upload Report</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED Test Details Modal (Matching PendingOrders) */}
      <Modal show={showTestDetailsModal} onHide={() => setShowTestDetailsModal(false)} centered size="xl">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">
            <i className="fas fa-vial me-2 text-primary"></i>
            Test Details – {selectedOrderTests.length || 1} Item(s)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrderDetails && (
            <>
              <div className="row g-3 mb-4">
                {/* --- ORDER INFO --- */}
                <div className="col-md-6">
                  <div className="p-3 border rounded bg-light h-100">
                    <h6 className="border-bottom pb-2 mb-3 fw-bold">Order Information</h6>
                    <div className="row">
                      <div className="col-6">
                        <p className="mb-2"><small className="text-muted">Order ID</small><br /><strong>{selectedOrderDetails._id?.slice(-6)}</strong></p>
                        <p className="mb-2"><small className="text-muted">Customer</small><br /><strong>{getCustomerName(selectedOrderDetails)}</strong></p>
                        <p className="mb-0"><small className="text-muted">Phone</small><br /><strong>{selectedOrderDetails.phone || "N/A"}</strong></p>
                      </div>
                      <div className="col-6">
                        <p className="mb-2"><small className="text-muted">Date</small><br /><strong>{formatDate(selectedOrderDetails.date)}</strong></p>
                        <p className="mb-2"><small className="text-muted">Time Slot</small><br /><strong>{selectedOrderDetails.timeSlot || "N/A"}</strong></p>
                        <p className="mb-0"><small className="text-muted">Service Type</small><br /><strong>{selectedOrderDetails.serviceType || "N/A"}</strong></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- PRICING SUMMARY (Same Logic as PendingOrders) --- */}
                <div className="col-md-6">
                  {(() => {
                    const mrp = selectedOrderTests.reduce((t, test) => t + Number(test.amount ?? 0), 0);
                    const vendorDiscountAmount = selectedOrderTests.reduce((t, test) => {
                      const price = Number(test.amount ?? 0);
                      const percent = Number(test.discountPercentage ?? 0);
                      return t + (price * percent) / 100;
                    }, 0);
                    const vendorPrice = mrp - vendorDiscountAmount;
                    const couponPercent = Number(selectedOrderDetails?.couponId?.percentageDiscount ?? 0);
                    const couponDiscountAmount = (vendorPrice * couponPercent) / 100;
                    const priceAfterCoupon = vendorPrice - couponDiscountAmount;
                    const deliveryCharges = Number(selectedOrderDetails?.deliveryCharges ?? 0);
                    const finalPrice = priceAfterCoupon + deliveryCharges;

                    return (
                      <div className="p-3 border rounded bg-white h-100 shadow-sm">
                        <h6 className="border-bottom pb-2 mb-3 fw-bold">Pricing Summary</h6>
                        <div className="d-flex justify-content-between mb-2"><span className="text-muted">MRP</span><span>₹{mrp.toFixed(2)}</span></div>
                        <div className="d-flex justify-content-between mb-2 text-success"><span>Vendor Discount</span><span>-₹{vendorDiscountAmount.toFixed(2)}</span></div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Coupon {selectedOrderDetails?.couponId?.couponCode && `(${selectedOrderDetails.couponId.couponCode})`}</span>
                          <span className="text-success">-₹{couponDiscountAmount.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Delivery Charges</span><span>+₹{deliveryCharges.toFixed(2)}</span></div>
                        <div className="pt-3 border-top text-center">
                          <small className="text-muted">Final Amount Payable</small>
                          <div className="fs-4 fw-bold text-primary">₹{finalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* --- TESTS TABLE --- */}
              <div className="table-responsive">
                <table className="table table-sm table-hover table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Test Name</th>
                      <th>Category</th>
                      <th>Organ</th>
                      <th>Sample</th>
                      <th>MRP</th>
                      <th>Discount</th>
                      <th>Vendor Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderTests.length > 0 ? (
                      selectedOrderTests.map((test) => {
                        const mrp = Number(test.amount ?? 0);
                        const disc = (mrp * Number(test.discountPercentage ?? 0)) / 100;
                        return (
                          <tr key={test._id}>
                            <td><strong>{test.testName}</strong></td>
                            <td>{test.testCategory || "N/A"}</td>
                            <td>{test.organ || "N/A"}</td>
                            <td>{test.sampleRequired || "N/A"}</td>
                            <td className="text-muted text-decoration-line-through">₹{mrp.toFixed(2)}</td>
                            <td className="text-success">{test.discountPercentage}%</td>
                            <td className="fw-bold text-primary">₹{(mrp - disc).toFixed(2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan="7" className="text-center py-3">{selectedOrderDetails.testName || 'No individual test details available'}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowTestDetailsModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SampleCollected;