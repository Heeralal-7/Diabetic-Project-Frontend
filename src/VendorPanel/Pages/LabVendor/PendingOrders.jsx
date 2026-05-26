import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Tab, Tabs, Alert, Spinner, Badge, FormControl, InputGroup, Button, Modal } from 'react-bootstrap';

const PendingOrders = ({ refreshKey, onRefresh, isRefreshingAll }) => {
  const [generalPendingOrders, setGeneralPendingOrders] = useState([]);
  const [prescriptionPendingOrders, setPrescriptionPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [key, setKey] = useState('general');
  const [generalSearchTerm, setGeneralSearchTerm] = useState('');
  const [prescriptionSearchTerm, setPrescriptionSearchTerm] = useState('');

  // State for the confirmation modal
  const [showAcceptConfirmModal, setShowAcceptConfirmModal] = useState(false);
  const [orderToAccept, setOrderToAccept] = useState(null);

  // State for the test details modal
  const [showTestDetailsModal, setShowTestDetailsModal] = useState(false);
  const [selectedOrderTests, setSelectedOrderTests] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  useEffect(() => {
    fetchPendingOrders();
  }, [refreshKey]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        throw new Error("Authentication token not found");
      }
      
      const parsedVerify = JSON.parse(verify);
      const token = parsedVerify.token;
      
      // Fetch General Pending Orders (type=0, status=0)
      const generalResponse = await axios.get(
        `${URL}/all-appointments/getallaapointments?type=0&status=0&page=1&limit=100`,
        { headers: { token: token } }
      );

      // Fetch Prescription Pending Orders (type=1, status=0)
      const prescriptionResponse = await axios.get(
        `${URL}/all-appointments/getallaapointments?type=1&status=0&page=1&limit=100`,
        { headers: { token: token } }
      );

      if (generalResponse.data.success) {
        setGeneralPendingOrders(generalResponse.data.details || []);
      } else {
        setGeneralPendingOrders([]);
        console.error("Error fetching general pending orders:", generalResponse.data.message);
      }

      if (prescriptionResponse.data.success) {
        setPrescriptionPendingOrders(prescriptionResponse.data.details || []);
      } else {
        setPrescriptionPendingOrders([]);
        console.error("Error fetching prescription pending orders:", prescriptionResponse.data.message);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      setError(error.message || "An unknown error occurred while fetching orders.");
      setLoading(false);
    }
  };

  const handleAcceptOrder = (orderId, orderType) => {
    setOrderToAccept({ id: orderId, type: orderType });
    setShowAcceptConfirmModal(true);
  };

  // Function to handle showing test details modal
  const handleShowTestDetails = (order) => {
    setSelectedOrderTests(order.testId || []);
    setSelectedOrderDetails(order);
    setShowTestDetailsModal(true);
  };

  const updateOrderStatus = async (orderId, newStatusValue, orderType) => {
    try {
      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        throw new Error("Authentication token not found");
      }
      
      const parsedVerify = JSON.parse(verify);
      const token = parsedVerify.token;
      
      console.log(`Attempting to update order ID ${orderId} (Type: ${orderType}) to status: ${newStatusValue}`);
      
      const response = await axios.patch(
        `${URL}/all-appointments/updatestatus`,
        {
          appointmentId: orderId,
          type: newStatusValue // 1 for accept, 2 for reject
        },
        {
          headers: {
            token: token,
          },
        }
      );
      
      console.log("API Response:", response.data);

      if (response.data.success) {
        alert(`Order ${newStatusValue === 1 ? 'accepted' : 'rejected'} successfully`);
        fetchPendingOrders(); 
      } else {
        alert("Failed to update order status: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      if (error.response) {
        alert("Error updating order status: " + (error.response.data.message || `Server responded with status ${error.response.status}`));
      } else if (error.request) {
        alert("Error updating order status: No response from server. Please check your connection.");
      } else {
        alert("Error updating order status: " + error.message);
      }
      setError(error.message || "An error occurred during the update.");
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

  // Function to get customer name - UPDATED to use order.name instead of userId.name
  const getCustomerName = (order) => {
    return order.name || 'N/A';
  };

  const getPrice = (order) => {
    if (order.price !== undefined && order.price !== null) {
      return order.price;
    } else if (order.amount !== undefined && order.amount !== null) {
      return order.amount;
    }
    return 0;
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

  // Memoized filtering for General Pending Orders
  const filteredGeneralOrders = useMemo(() => {
    const lowerCaseSearchTerm = generalSearchTerm.toLowerCase();
    if (!lowerCaseSearchTerm) {
      return generalPendingOrders;
    }
    return generalPendingOrders.filter(order => {
      const orderId = order._id?.slice(-6).toLowerCase();
      const customerName = getCustomerName(order).toLowerCase(); // Updated to use getCustomerName
      const testPackageName = getAllTestNames(order).toLowerCase();
      const serviceType = (order.serviceType || '').toLowerCase();

      return (
        orderId.includes(lowerCaseSearchTerm) ||
        customerName.includes(lowerCaseSearchTerm) ||
        testPackageName.includes(lowerCaseSearchTerm) ||
        serviceType.includes(lowerCaseSearchTerm)
      );
    });
  }, [generalPendingOrders, generalSearchTerm]);

  // Memoized filtering for Prescription Pending Orders
  const filteredPrescriptionOrders = useMemo(() => {
    const lowerCaseSearchTerm = prescriptionSearchTerm.toLowerCase();
    if (!lowerCaseSearchTerm) {
      return prescriptionPendingOrders;
    }
    return prescriptionPendingOrders.filter(order => {
      const orderId = order._id?.slice(-6).toLowerCase();
      const customerName = getCustomerName(order).toLowerCase(); // Updated to use getCustomerName
      const testPackageName = getAllTestNames(order).toLowerCase();
      const serviceType = (order.serviceType || '').toLowerCase();

      return (
        orderId.includes(lowerCaseSearchTerm) ||
        customerName.includes(lowerCaseSearchTerm) ||
        testPackageName.includes(lowerCaseSearchTerm) ||
        serviceType.includes(lowerCaseSearchTerm)
      );
    });
  }, [prescriptionPendingOrders, prescriptionSearchTerm]);

  const renderOrderTable = (orders, orderType, searchTerm, setSearchTerm, filteredOrders) => (
    <div className="card-body">
      {/* Search Input Group */}
      <InputGroup className="mb-3">
        <FormControl
          placeholder={`Search ${orderType === '0' ? 'General' : 'Prescription'} pending orders...`}
          aria-label={`Search ${orderType === '0' ? 'General' : 'Prescription'} pending orders`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
          Clear
        </Button>
      </InputGroup>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted">No pending orders of this type found matching your search.</p>
        </div>
      ) : (
       <div className="table-responsive">
  <table className="table table-hover">
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Test/Package Name</th>
        <th>Service Type</th>
        <th>Amount</th>
        <th>Date</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {filteredOrders.map((order) => (
        <tr
          key={order._id}
          style={{ cursor: 'pointer' }}
          onClick={() => handleShowTestDetails(order)}
          title="Click to view order details"
        >
          <td>{order._id.slice(-6)}</td>

          <td>{getCustomerName(order)}</td>

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

          <td>
            {order.date
              ? new Date(order.date).toLocaleDateString()
              : 'N/A'}
          </td>

          <td>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-success me-2"
                title="Accept Order"
                onClick={(e) => {
                  e.stopPropagation(); // ⛔ prevent row click
                  handleAcceptOrder(order._id, orderType);
                }}
              >
                Accept
              </button>

              <button
                className="btn btn-sm btn-danger"
                title="Reject Order"
                onClick={(e) => {
                  e.stopPropagation(); // ⛔ prevent row click
                  updateOrderStatus(order._id, 2, orderType);
                }}
              >
                Reject
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
  );

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
          Error loading orders: {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid my-4">
      <div className="row">
        <div className="col-12">
          <Tabs activeKey={key} onSelect={(k) => setKey(k)} id="pending-orders-tabs" className="mb-3">
            <Tab eventKey="general" title={
              <>
                General Pending Orders <Badge bg="primary">{generalPendingOrders.length}</Badge>
              </>
            }>
              <div className="card">
                {renderOrderTable(
                  generalPendingOrders, 
                  '0', 
                  generalSearchTerm, 
                  setGeneralSearchTerm, 
                  filteredGeneralOrders
                )}
              </div>
            </Tab>

            <Tab eventKey="prescription" title={
              <>
                Prescription Pending Orders <Badge bg="info">{prescriptionPendingOrders.length}</Badge>
              </>
            }>
              <div className="card">
                {renderOrderTable(
                  prescriptionPendingOrders, 
                  '1', 
                  prescriptionSearchTerm, 
                  setPrescriptionSearchTerm, 
                  filteredPrescriptionOrders
                )}
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>

      {/* Confirmation Modal for Accepting Order */}
      <Modal show={showAcceptConfirmModal} onHide={() => setShowAcceptConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Order Acceptance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to accept this order? This action cannot be undone.
          {orderToAccept && (
            <p><strong>Order ID:</strong> {orderToAccept.id.slice(-6)}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAcceptConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={() => {
            if (orderToAccept) {
              updateOrderStatus(orderToAccept.id, 1, orderToAccept.type);
              setShowAcceptConfirmModal(false);
              setOrderToAccept(null);
            }
          }}>
            Yes, Accept Order
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
      Test Details – {selectedOrderTests.length} Test
      {selectedOrderTests.length !== 1 ? "s" : ""}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
   

    {/* ================= HEADER CHANGED HERE ================= */}
    <h6 className="border-bottom pb-2 mb-3 fw-bold">
      Order Information
    </h6>

    {selectedOrderTests.length > 0 ? (
      <div className="table-responsive">
        <table className="table table-sm table-hover table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Test Name</th>
              <th>Category</th>
              <th>Organ</th>
              <th>Sample</th>
              <th>Type</th>
              <th>MRP</th>
              <th>Discount</th>
              <th>Vendor Price</th>
            </tr>
          </thead>

          <tbody>
            {selectedOrderTests.map((test, index) => {
              const mrp = Number(test.amount ?? 0);
              const percent = Number(
                test.discountPercentage ?? 0
              );
              const discountAmount =
                (mrp * percent) / 100;
              const finalPrice = mrp - discountAmount;

              return (
                <tr key={test._id}>
                  <td className="fw-bold">{index + 1}</td>
                  <td>
                    <strong>{test.testName}</strong>
                    <br />
                   
                  </td>
                  <td>{test.testCategory || "N/A"}</td>
                  <td>{test.organ || "N/A"}</td>
                  <td>{test.sampleRequired || "N/A"}</td>
                  <td>
                    <span className="badge bg-secondary">
                      {test.testType || "N/A"}
                    </span>
                  </td>
                  <td className="text-muted text-decoration-line-through">
                    ₹{mrp.toFixed(2)}
                  </td>
                  <td className="text-success fw-bold">
                    {percent}% (-₹
                    {discountAmount.toFixed(2)})
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
        {/* ================= ORDER INFO ================= */}
        <div className="col-md-6">
          <div className="p-3 border rounded bg-light h-100">
            <h6 className="border-bottom pb-2 mb-3 fw-bold">
              Order Information
            </h6>

            <div className="row">
              <div className="col-6">
                <p className="mb-2">
                  <small className="text-muted">Order ID</small>
                  <br />
                  <strong>{selectedOrderDetails._id?.slice(-6)}</strong>
                </p>
                <p className="mb-2">
                  <small className="text-muted">Customer</small>
                  <br />
                  <strong>{getCustomerName(selectedOrderDetails)}</strong>
                </p>
                <p className="mb-0">
                  <small className="text-muted">Phone</small>
                  <br />
                  <strong>{selectedOrderDetails.phone || "N/A"}</strong>
                </p>
              </div>

              <div className="col-6">
                <p className="mb-2">
                  <small className="text-muted">Date</small>
                  <br />
                  <strong>
                    {selectedOrderDetails.date
                      ? new Date(
                          selectedOrderDetails.date
                        ).toLocaleDateString()
                      : "N/A"}
                  </strong>
                </p>
                <p className="mb-2">
                  <small className="text-muted">Time Slot</small>
                  <br />
                  <strong>
                    {selectedOrderDetails.timeSlot || "N/A"}
                  </strong>
                </p>
                <p className="mb-0">
                  <small className="text-muted">Service Type</small>
                  <br />
                  <strong>
                    {selectedOrderDetails.serviceType || "N/A"}
                  </strong>
                </p>
              </div>
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
                const percent = Number(
                  test.discountPercentage ?? 0
                );
                return t + (price * percent) / 100;
              },
              0
            );

            const vendorPrice = mrp - vendorDiscountAmount;

            const couponPercent = Number(
              selectedOrderDetails?.couponId?.percentageDiscount ??
                0
            );

            const couponDiscountAmount =
              (vendorPrice * couponPercent) / 100;

            const priceAfterCoupon =
              vendorPrice - couponDiscountAmount;

            const deliveryCharges = Number(
              selectedOrderDetails?.deliveryCharges ?? 0
            );

            const finalPrice =
              priceAfterCoupon != null
                ? priceAfterCoupon + deliveryCharges
                : Number(selectedOrderDetails?.price ?? 0);

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
                  <span>
                    -₹{vendorDiscountAmount.toFixed(2)}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2 fw-bold">
                  <span>Vendor Price</span>
                  <span>₹{vendorPrice.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Coupon</span>
                  {selectedOrderDetails?.couponId?.couponCode ? (
                    <span className="badge bg-success">
                      {
                        selectedOrderDetails.couponId
                          .couponCode
                      }{" "}
                      ({couponPercent}%)
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </div>

                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Coupon Discount</span>
                  <span>
                    -₹{couponDiscountAmount.toFixed(2)}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2 fw-bold text-primary">
                  <span>
                    Discounted Price (After Coupon)
                  </span>
                  <span>
                    ₹{priceAfterCoupon.toFixed(2)}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">
                    Delivery Charges
                  </span>
                  <span>
                    +₹{deliveryCharges.toFixed(2)}
                  </span>
                </div>

                <div className="pt-3 border-top text-center">
                  <small className="text-muted">
                    Final Amount Payable
                  </small>
                  <div className="fs-4 fw-bold text-primary">
                    ₹{finalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    )}
    {/* ================= SAMPLE COLLECTION ================= */}
    {selectedOrderDetails?.sampleRequired && (
      <div className="mt-4 p-3 bg-light border rounded">
        <h6 className="border-bottom pb-2 fw-bold">
          <i className="fas fa-syringe me-2"></i>
          Sample Collection
        </h6>
        <p>
          <strong>Required:</strong>{" "}
          {selectedOrderDetails.sampleRequired.join(", ")}
        </p>
        <p>
          <strong>Collected:</strong>{" "}
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

export default PendingOrders;
