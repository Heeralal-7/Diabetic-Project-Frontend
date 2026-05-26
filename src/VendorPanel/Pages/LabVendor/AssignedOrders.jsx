import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Alert, Spinner, Badge, FormControl, InputGroup, Button, Modal } from 'react-bootstrap';

const AssignedOrders = ({ refreshKey, onRefresh, isRefreshingAll }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State for the test details modal
  const [showTestDetailsModal, setShowTestDetailsModal] = useState(false);
  const [selectedOrderTests, setSelectedOrderTests] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  useEffect(() => {
    fetchAssignedOrders();
  }, [refreshKey]);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        throw new Error("Authentication token not found");
      }
      
      const parsedVerify = JSON.parse(verify);
      const token = parsedVerify.token;

      // Fetch General Assigned Orders (type=0, status=3: pending for reports)
      const generalOrdersResponse = await axios.get(
        `${URL}/all-appointments/getallaapointments?type=0&status=2&page=1&limit=100`,
        { headers: { token: token } }
      );

      // Fetch Prescription Assigned Orders (type=1, status=3: pending for reports)
      const prescriptionOrdersResponse = await axios.get(
        `${URL}/all-appointments/getallaapointments?type=1&status=2&page=1&limit=100`,
        { headers: { token: token } }
      );

      let combinedOrders = [];
      if (generalOrdersResponse.data.success) {
        combinedOrders = [...combinedOrders, ...(generalOrdersResponse.data.details || [])];
      } else {
        console.error("API returned success: false for general assigned orders.");
      }

      if (prescriptionOrdersResponse.data.success) {
        combinedOrders = [...combinedOrders, ...(prescriptionOrdersResponse.data.details || [])];
      } else {
        console.error("API returned success: false for prescription assigned orders.");
      }

      setOrders(combinedOrders);
      setLoading(false);

      if (combinedOrders.length === 0 && !generalOrdersResponse.data.success && !prescriptionOrdersResponse.data.success) {
          setError("Failed to load any assigned orders.");
      }

    } catch (error) {
      console.error("Error fetching assigned orders:", error);
      setError(error.message || "An unknown error occurred while fetching orders.");
      setLoading(false);
    }
  };

  // Function to handle showing test details modal
  const handleShowTestDetails = (order) => {
    setSelectedOrderTests(order.testId || []);
    setSelectedOrderDetails(order);
    setShowTestDetailsModal(true);
  };

  // Updated function to get all test names
  const getAllTestNames = (order) => {
    if (order.testId && order.testId.length > 0) {
      // Return all test names joined by comma
      return order.testId.map(test => test.testName).join(', ');
    } else if (order.packageId && order.packageId.packageName) {
      return order.packageId.packageName;
    } else if (order.testName) {
      return order.testName;
    }
    return 'Test/Package';
  };

  // Function to check if order has multiple tests
  const hasMultipleTests = (order) => {
    return order.testId && order.testId.length > 1;
  };

  // Function to get customer name - UPDATED to use order.name
  const getCustomerName = (order) => {
    return order.name || 'N/A';
  };

  // Helper to get Price
  const getPrice = (order) => {
    if (order.price !== undefined && order.price !== null) {
      return order.price;
    } else if (order.amount !== undefined && order.amount !== null) {
      return order.amount;
    }
    return 0;
  };

  // --- Report Upload Logic ---

  const handleUploadReport = (order) => {
    setSelectedOrder(order);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    setReportFile(e.target.files[0]);
  };

  const submitReport = async () => {
    if (!reportFile) {
      alert("Please select a report file to upload.");
      return;
    }

    try {
      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        throw new Error("Authentication token not found");
      }
      
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
      
      console.log("Report upload API Response:", response.data);

      if (response.data.success) {
        alert("Report uploaded successfully");
        setShowUploadModal(false);
        setReportFile(null);
        setSelectedOrder(null);
        fetchAssignedOrders();
      } else {
        alert("Failed to upload report: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading report:", error);
      if (error.response) {
        alert("Error uploading report: " + (error.response.data.message || `Server responded with status ${error.response.status}`));
      } else {
        alert("Error uploading report: " + (error.message || "An unknown error occurred"));
      }
    }
  };

  // --- Order Details Modal Logic ---

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setShowUploadModal(false);
    setReportFile(null);
  };

  // Helper to determine and display order type using a Badge
  const getOrderTypeBadge = (order) => {
    if (order.type === '0' || order.type === 0) { 
      return <Badge bg="primary me-1">General</Badge>;
    } else if (order.type === '1' || order.type === 1) {
      return <Badge bg="secondary me-1">Prescription</Badge>;
    }
    return <Badge bg="light text-dark me-1">Unknown Type</Badge>; 
  };

  // Function to calculate total amount from individual tests
  const calculateTotalFromTests = (tests) => {
    if (!tests || tests.length === 0) return 0;
    return tests.reduce((total, test) => {
      const amount = parseFloat(test.amount) || 0;
      return total + amount;
    }, 0);
  };

  // Function to calculate total discounted amount from individual tests
  const calculateTotalDiscountedAmount = (tests) => {
    if (!tests || tests.length === 0) return 0;
    return tests.reduce((total, test) => {
      const discountedAmount = parseFloat(test.discountedAmount) || 0;
      return total + discountedAmount;
    }, 0);
  };

  // Format date to remove time part if present
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Handle dates with time (e.g., "2025-06-07 00:00:00.000")
    if (dateString.includes(' ')) {
      const datePart = dateString.split(' ')[0];
      return new Date(datePart).toLocaleDateString();
    }
    
    // Handle date-only strings
    return new Date(dateString).toLocaleDateString();
  };

  // Memoized filtering logic for search
  const filteredOrders = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (!lowerCaseSearchTerm) {
      return orders;
    }
    return orders.filter(order => {
      const orderId = order._id?.slice(-6).toLowerCase();
      const customerName = getCustomerName(order).toLowerCase(); // Updated
      const testPackageName = getAllTestNames(order).toLowerCase();
      const serviceType = (order.serviceType || '').toLowerCase();
      const driverName = (order.driverId?.name || '').toLowerCase();

      return (
        orderId.includes(lowerCaseSearchTerm) ||
        customerName.includes(lowerCaseSearchTerm) ||
        testPackageName.includes(lowerCaseSearchTerm) ||
        serviceType.includes(lowerCaseSearchTerm) ||
        driverName.includes(lowerCaseSearchTerm)
      );
    });
  }, [orders, searchTerm]);

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" size="lg">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <Alert variant="danger" className="mt-3">
          <strong>Error:</strong> {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid my-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h3 className="card-title mb-0">Assigned Orders (Pending Report)</h3>
            </div>
            <div className="card-body">
              {/* Search Input Group */}
              <InputGroup className="mb-3">
                <FormControl
                  placeholder="Search orders (ID, Customer, Test/Package, Service, Driver)"
                  aria-label="Search orders"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                  Clear
                </Button>
              </InputGroup>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No assigned orders pending report found matching your search.</p>
                </div>
              ) : (
               <div className="table-responsive">
  <table className="table table-hover">
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Order Type</th>
        <th>Test/Package</th>
        <th>Service Type</th>
        <th>Amount</th>
        <th>Date</th>
        <th>Driver</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {filteredOrders.map((order) => (
        <tr
          key={order._id}
          style={{ cursor: "pointer" }}
          title="Click to view test / package details"
          onClick={() => handleShowTestDetails(order)}
        >
          <td>{order._id.slice(-6)}</td>

          <td>{getCustomerName(order)}</td>

          <td>{getOrderTypeBadge(order)}</td>

          <td>
            {getAllTestNames(order)}
            {hasMultipleTests(order) && (
              <Badge bg="info" className="ms-1">
                {order.testId.length}
              </Badge>
            )}
          </td>

          <td>{order.serviceType || "N/A"}</td>

          <td>₹{getPrice(order)}</td>

          <td>{formatDate(order.date)}</td>

          {/* ================= DRIVER ================= */}
          <td onClick={(e) => e.stopPropagation()}>
            {order.driverId ? (
              <span className="badge bg-success">
                {order.driverId.name ||
                  order.driverId.phoneNumber ||
                  "Driver Assigned"}
              </span>
            ) : (
              <span className="badge bg-secondary">
                No Driver Assigned Yet
              </span>
            )}
          </td>

          {/* ================= ACTIONS ================= */}
          <td onClick={(e) => e.stopPropagation()}>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-info me-2"
                title="View Order Details"
                onClick={() => viewOrderDetails(order)}
              >
                View Details
              </button>

              <button
                className="btn btn-sm btn-primary"
                title="Upload Report for this Order"
                onClick={() => handleUploadReport(order)}
              >
                Upload Report
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

      {/* Order Details Modal */}
      {selectedOrder && !showUploadModal && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} role="dialog" aria-labelledby="orderDetailsModalLabel">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="orderDetailsModalLabel">Order Details - #{selectedOrder._id.slice(-6)}</h5>
                <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Customer Information</h6>
                    <p><strong>Name:</strong> {getCustomerName(selectedOrder)}</p> {/* Updated */}
                    <p><strong>Phone:</strong> {selectedOrder.phone || 'N/A'}</p>
                    <p><strong>Gender:</strong> {selectedOrder.gender || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> {selectedOrder.dob || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Service Type:</strong> {selectedOrder.serviceType || 'N/A'}</p>
                    <p><strong>Test/Package:</strong> {getAllTestNames(selectedOrder)}</p>
                    <p><strong>Amount:</strong> ₹{getPrice(selectedOrder)}</p>
                    <p><strong>Date:</strong> {formatDate(selectedOrder.date)}</p>
                    <p><strong>Time Slot:</strong> {selectedOrder.timeSlot || 'N/A'}</p>
                    <p><strong>Driver:</strong> {selectedOrder.driverId?.name || (selectedOrder.driverId ? 'Driver Assigned' : 'N/A')}</p>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-12">
                    <h6>Address Information</h6>
                    <p>
                      {selectedOrder.address && `${selectedOrder.address}, `}
                      {selectedOrder.city && `${selectedOrder.city}, `}
                      {selectedOrder.state && `${selectedOrder.state}, `}
                      {selectedOrder.country && `${selectedOrder.country} - `}
                      {selectedOrder.pinCode || ''}
                    </p>
                  </div>
                </div>
                {selectedOrder.sampleRequired && selectedOrder.sampleRequired.length > 0 && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <h6>Sample Details</h6>
                      <p><strong>Sample Required:</strong> {selectedOrder.sampleRequired.join(', ')}</p>
                      {selectedOrder.sampleCollected && selectedOrder.sampleCollected.length > 0 && (
                        <p><strong>Sample Collected:</strong> {selectedOrder.sampleCollected.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Report Modal */}
      {showUploadModal && selectedOrder && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} role="dialog" aria-labelledby="uploadReportModalLabel">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="uploadReportModalLabel">Upload Report for Order #{selectedOrder._id.slice(-6)}</h5>
                <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="reportFile" className="form-label">Select Report File</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    id="reportFile" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <div className="form-text">
                    Supported formats: PDF, Word, JPEG, PNG
                  </div>
                </div>
                <Alert variant="info">
                  Uploading a report will mark this order as completed and potentially trigger other backend actions.
                </Alert>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={submitReport}
                  disabled={!reportFile}
                >
                  Upload Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Test Details Modal */}
     <Modal
  style={{ width: "120%" }}
  show={showTestDetailsModal}
  onHide={() => setShowTestDetailsModal(false)}
  centered
  size="xl"
>
  <Modal.Header closeButton className="bg-light">
    <Modal.Title className="fw-bold">
      <i className="fas fa-vial me-2 text-primary"></i>
      Test Details – {selectedOrderTests?.length || 0} Test
      {selectedOrderTests?.length !== 1 ? "s" : ""}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>

     {/* ================= TEST LIST ================= */}
    <h6 className="border-bottom pb-2 mb-3 fw-bold">
      Order Information
    </h6>

    {selectedOrderTests?.length > 0 ? (
      <div className="table-responsive">
        <table className="table table-sm table-hover table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Test Name</th>
              <th>Category</th>
              <th>Organ</th>
              <th>Sample Required</th>
              <th>Sample Collected</th>
              <th>Type</th>
              <th>MRP</th>
              <th>Discount</th>
              <th>Vendor Price</th>
            </tr>
          </thead>

          <tbody>
            {selectedOrderTests.map((test, index) => {
              const mrp = Number(test.amount ?? 0);
              const percent = Number(test.discountPercentage ?? 0);
              const discountAmount = (mrp * percent) / 100;
              const finalPrice = mrp - discountAmount;

              return (
                <tr key={test._id}>
                  <td className="fw-bold">{index + 1}</td>
                  <td>
                    <strong>{test.testName}</strong><br />
                    <small className="text-muted">
                      ID: {test._id?.slice(-6)}
                    </small>
                  </td>
                  <td>{test.testCategory || "N/A"}</td>
                  <td>{test.organ || "N/A"}</td>
                  <td>{test.sampleRequired || "N/A"}</td>
                  <td>{test.sampleCollected || "N/A"}</td>
                  <td>
                    <Badge bg={test.testType === "Walk In" ? "primary" : "secondary"}>
                      {test.testType || "N/A"}
                    </Badge>
                  </td>
                  <td className="text-muted text-decoration-line-through">
                    ₹{mrp.toFixed(2)}
                  </td>
                  <td className="text-success fw-bold">
                    {percent}% (-₹{discountAmount.toFixed(2)})
                  </td>
                  <td className="fw-bold text-primary">
                    ₹{finalPrice.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-4 text-muted">
        No test details available
      </div>
    )}
    
    {selectedOrderDetails && (
      <div className="row g-3 mb-4">
        {/* ================= ORDER INFORMATION ================= */}
        <div className="col-md-6">
          <div className="p-3 border rounded bg-light h-100">
            <h6 className="border-bottom pb-2 mb-3 fw-bold">
              Order Information
            </h6>

            <div className="row">
              <div className="col-6">
                <p className="mb-2">
                  <small className="text-muted">Order ID</small><br />
                  <strong>{selectedOrderDetails._id?.slice(-6)}</strong>
                </p>

                <p className="mb-2">
                  <small className="text-muted">Customer</small><br />
                  <strong>{getCustomerName(selectedOrderDetails)}</strong>
                </p>

                <p className="mb-2">
                  <small className="text-muted">Phone</small><br />
                  <strong>{selectedOrderDetails.phone || "N/A"}</strong>
                </p>

                <p className="mb-0">
                  <small className="text-muted">Gender</small><br />
                  <strong>{selectedOrderDetails.gender || "N/A"}</strong>
                </p>
              </div>

              <div className="col-6">
                <p className="mb-2">
                  <small className="text-muted">Date</small><br />
                  <strong>
                    {selectedOrderDetails.date
                      ? new Date(selectedOrderDetails.date).toLocaleDateString()
                      : "N/A"}
                  </strong>
                </p>

                <p className="mb-2">
                  <small className="text-muted">Time Slot</small><br />
                  <strong>{selectedOrderDetails.timeSlot || "N/A"}</strong>
                </p>

                <p className="mb-2">
                  <small className="text-muted">Service Type</small><br />
                  <strong>{selectedOrderDetails.serviceType || "N/A"}</strong>
                </p>

                <p className="mb-0">
                  <small className="text-muted">Driver</small><br />
                  {selectedOrderDetails.driverId ? (
                    <Badge bg="success">
                      {selectedOrderDetails.driverId.name || "Assigned"}
                    </Badge>
                  ) : (
                    <Badge bg="warning">Not Assigned</Badge>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <small className="text-muted">Address</small>
              <p className="mb-0">
                <strong>
                  {selectedOrderDetails.address && `${selectedOrderDetails.address}, `}
                  {selectedOrderDetails.city && `${selectedOrderDetails.city}, `}
                  {selectedOrderDetails.state && `${selectedOrderDetails.state}, `}
                  {selectedOrderDetails.country && `${selectedOrderDetails.country} - `}
                  {selectedOrderDetails.pinCode || ""}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* ================= PRICING SUMMARY ================= */}
        <div className="col-md-6">
          {(() => {
            const mrp = selectedOrderTests.reduce(
              (t, test) => t + Number(test.amount ?? 0),
              0
            );

            const vendorDiscountAmount = selectedOrderTests.reduce(
              (t, test) => {
                const price = Number(test.amount ?? 0);
                const percent = Number(test.discountPercentage ?? 0);
                return t + (price * percent) / 100;
              },
              0
            );

            const vendorPrice = mrp - vendorDiscountAmount;

            const couponPercent = Number(
              selectedOrderDetails?.couponId?.percentageDiscount ?? 0
            );

            const couponDiscountAmount =
              (vendorPrice * couponPercent) / 100;

            const priceAfterCoupon =
              vendorPrice - couponDiscountAmount;

            const deliveryCharges = Number(
              selectedOrderDetails?.deliveryCharges ?? 0
            );

            const finalPrice =
              priceAfterCoupon + deliveryCharges;

            return (
              <div className="p-3 border rounded bg-white h-100">
                <h6 className="border-bottom pb-2 mb-3 fw-bold">
                  Pricing & Status
                </h6>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">MRP</span>
                  <span>₹{mrp.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Vendor Discount</span>
                  <span>-₹{vendorDiscountAmount.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2 fw-bold">
                  <span>Vendor Price</span>
                  <span>₹{vendorPrice.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Coupon</span>
                  {selectedOrderDetails?.couponId?.couponCode ? (
                    <Badge bg="success">
                      {selectedOrderDetails.couponId.couponCode} ({couponPercent}%)
                    </Badge>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </div>

                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscountAmount.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2 fw-bold text-primary">
                  <span>Discounted Price (After Coupon)</span>
                  <span>₹{priceAfterCoupon.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Delivery Charges</span>
                  <span>+₹{deliveryCharges.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-top text-center mb-2">
                  <small className="text-muted">Final Amount</small>
                  <div className="fs-4 fw-bold text-primary">
                    ₹{finalPrice.toFixed(2)}
                  </div>
                </div>

                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Order Status</span>
                  <Badge bg="info">Accepted</Badge>
                </div>

                <div className="d-flex justify-content-between">
                  <span className="text-muted">Payment Status</span>
                  <Badge bg={selectedOrderDetails.isPaid ? "success" : "warning"}>
                    {selectedOrderDetails.isPaid ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    )}

   

    {/* ================= SAMPLE COLLECTION ================= */}
    {selectedOrderDetails?.sampleRequired && (
      <div className="mt-4 p-3 border rounded bg-light">
        <h6 className="border-bottom pb-2 fw-bold">
          <i className="fas fa-syringe me-2"></i>
          Sample Collection Information
        </h6>

        <p>
          <strong>Sample Required:</strong>{" "}
          {selectedOrderDetails.sampleRequired.length
            ? selectedOrderDetails.sampleRequired.join(", ")
            : "N/A"}
        </p>

        <p>
          <strong>Sample Collected:</strong>{" "}
          {selectedOrderDetails.sampleCollected?.length
            ? selectedOrderDetails.sampleCollected.join(", ")
            : "Not collected yet"}
        </p>
      </div>
    )}
  </Modal.Body>

  <Modal.Footer className="bg-light">
    <Button
      variant="secondary"
      onClick={() => setShowTestDetailsModal(false)}
    >
      <i className="fas fa-times me-1"></i>
      Close
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};

export default AssignedOrders;
