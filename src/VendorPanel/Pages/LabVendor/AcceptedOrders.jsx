import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Alert, Spinner, Badge, FormControl, InputGroup, Button, Modal } from 'react-bootstrap';

const AcceptedOrders = ({ refreshKey, onRefresh, isRefreshingAll }) => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State for the confirmation modal
  const [showAssignConfirmModal, setShowAssignConfirmModal] = useState(false);
  const [orderToAssignDriver, setOrderToAssignDriver] = useState(null);

  // State for the test details modal
  const [showTestDetailsModal, setShowTestDetailsModal] = useState(false);
  const [selectedOrderTests, setSelectedOrderTests] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  useEffect(() => {
    fetchAcceptedOrders();
    fetchDrivers();
  }, [refreshKey]);

  const fetchAcceptedOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        throw new Error("Authentication token not found");
      }
      
      const parsedVerify = JSON.parse(verify);
      const token = parsedVerify.token;
      
      // Fetch General Accepted Orders (type=0, status=1)
      const generalOrdersResponse = await axios.get(
        `${URL}/all-appointments/getallaapointments?type=0&status=1&page=1&limit=100`,
        { headers: { token: token } }
      );

      // Fetch Prescription Accepted Orders (type=1, status=1)
      const prescriptionOrdersResponse = await axios.get(
        `${URL}/all-appointments/getallaapointments?type=1&status=1&page=1&limit=100`,
        { headers: { token: token } }
      );

      let combinedOrders = [];
      if (generalOrdersResponse.data.success) {
        combinedOrders = [...combinedOrders, ...(generalOrdersResponse.data.details || [])];
      } else {
        console.error("API returned success: false for general accepted orders.");
      }

      if (prescriptionOrdersResponse.data.success) {
        combinedOrders = [...combinedOrders, ...(prescriptionOrdersResponse.data.details || [])];
      } else {
        console.error("API returned success: false for prescription accepted orders.");
      }

      setOrders(combinedOrders);
      setLoading(false);

      if (combinedOrders.length === 0 && !generalOrdersResponse.data.success && !prescriptionOrdersResponse.data.success) {
          setError("Failed to load any accepted orders.");
      }

    } catch (error) {
      console.error("Error fetching accepted orders:", error);
      setError(error.message || "Failed to load accepted orders. Please try again later.");
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        console.warn("Authentication token not found for driver fetch.");
        return;
      }
      const parsedVerify = JSON.parse(verify);
      const token = parsedVerify.token;
      
      const response = await axios.get(
        `${URL}/driver/get-driver`, 
        {
          headers: {
            token: token,
          },
        }
      );
      console.log("Drivers fetched successfully:", response.data.details);

      if (response.data.success) {
        setDrivers(response.data.details || []);
      } else {
        setDrivers([]); 
        console.error("API returned success: false for drivers.");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setError(error.message || "Failed to load driver list.");
      setDrivers([]); 
    }
  };

  // Function to handle showing test details modal
  const handleShowTestDetails = (order) => {
    setSelectedOrderTests(order.testId || []);
    setSelectedOrderDetails(order);
    setShowTestDetailsModal(true);
  };

  // --- Driver Assignment Logic ---
  const handleAssignDriverClick = (orderId) => {
    const driverId = selectedDriver[orderId];
    if (!driverId) {
      alert("Please select a driver first.");
      return;
    }
    setOrderToAssignDriver({ orderId, driverId });
    setShowAssignConfirmModal(true);
  };

  const assignDriver = async () => {
    if (!orderToAssignDriver) return;

    const { orderId, driverId } = orderToAssignDriver;

    try {
      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        throw new Error("Authentication token not found");
      }
      
      const parsedVerify = JSON.parse(verify);
      const token = parsedVerify.token;
      
      console.log(`Assigning Driver ID ${driverId} to Order ID ${orderId}`);
      
      const response = await axios.patch(
        `${URL}/all-appointments/assign`, 
        {
          appointmentId: orderId,
          driverId: driverId
        },
        {
          headers: {
            token: token,
          },
        }
      );
      
      console.log("Assign driver API Response:", response.data);

      if (response.data.success) {
        alert("Driver assigned successfully!");
        fetchAcceptedOrders();
        setSelectedDriver(prev => {
            const newState = {...prev};
            delete newState[orderId]; 
            return newState;
        });
        setShowAssignConfirmModal(false);
        setOrderToAssignDriver(null);
      } else {
        alert("Failed to assign driver: " + (response.data.message || "Unknown error"));
        setShowAssignConfirmModal(false);
        setOrderToAssignDriver(null);
      }
    } catch (error) {
      console.error("Error assigning driver:", error);
      if (error.response) {
        alert("Error assigning driver: " + (error.response.data.message || `Server responded with status ${error.response.status}`));
      } else {
        alert("Error assigning driver: " + (error.message || "An unknown error occurred"));
      }
      setError(error.message || "An error occurred during driver assignment.");
      setShowAssignConfirmModal(false);
      setOrderToAssignDriver(null);
    }
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
            <div className="card-header bg-info text-white">
              <h3 className="card-title mb-0">Accepted Orders</h3>
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
                  <p className="text-muted">No accepted orders found matching your search.</p>
                </div>
              ) : (
               <div className="table-responsive">
  <table className="table table-hover">
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Order Type</th>
        <th>Test/Package Name</th>
        <th>Service Type</th>
        <th>Amount</th>
        <th>Date</th>
        <th>Driver Assignment</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {filteredOrders.map((order) => (
        <tr
          key={order._id}
          style={{ cursor: 'pointer' }}
          title="Click to view order details"
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

          <td>{order.serviceType || 'N/A'}</td>

          <td>₹{getPrice(order)}</td>

          <td>{formatDate(order.date)}</td>

          {/* ================= DRIVER ASSIGNMENT ================= */}
          <td
            onClick={(e) => e.stopPropagation()} // ⛔ stop row click
          >
            {order.driverId ? (
              <span className="badge bg-success">
                {order.driverId.name ||
                  order.driverId.phoneNumber ||
                  'Driver Assigned'}
              </span>
            ) : (
              <select
                className="form-select form-select-sm"
                value={selectedDriver[order._id] || ''}
                onChange={(e) =>
                  setSelectedDriver({
                    ...selectedDriver,
                    [order._id]: e.target.value,
                  })
                }
                aria-label="Select Driver for this order"
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} ({driver.phoneNumber || 'No phone'})
                  </option>
                ))}
              </select>
            )}
          </td>

          {/* ================= ACTIONS ================= */}
          <td onClick={(e) => e.stopPropagation()}>
            {!order.driverId && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleAssignDriverClick(order._id)}
                disabled={!selectedDriver[order._id]}
                title="Assign Driver to this Order"
              >
                Assign Driver
              </button>
            )}
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

      {/* Confirmation Modal for Assigning Driver */}
      <Modal show={showAssignConfirmModal} onHide={() => setShowAssignConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Driver Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to assign this driver to the order? This action cannot be undone.
          {orderToAssignDriver && (
            <>
              <p><strong>Order ID:</strong> {orderToAssignDriver.orderId.slice(-6)}</p>
              <p><strong>Driver:</strong> {drivers.find(d => d._id === orderToAssignDriver.driverId)?.name || 'Unknown Driver'}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={assignDriver}>
            Yes, Assign Driver
          </Button>
        </Modal.Footer>
      </Modal>

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
    {/* ================= ORDER + PRICING ================= */}
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
                  Pricing Summary
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

export default AcceptedOrders;
