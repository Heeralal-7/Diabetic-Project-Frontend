import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Tab, Tabs, Alert, Spinner, Badge, FormControl, InputGroup, Button, Modal } from 'react-bootstrap';

const CompletedOrders = ({ refreshKey, onRefresh, isRefreshingAll }) => {
  const [generalCompletedOrders, setGeneralCompletedOrders] = useState([]);
  const [prescriptionCompletedOrders, setPrescriptionCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [key, setKey] = useState('general');
  const [generalSearchTerm, setGeneralSearchTerm] = useState('');
  const [prescriptionSearchTerm, setPrescriptionSearchTerm] = useState('');

  // State for the test details modal
  const [showTestDetailsModal, setShowTestDetailsModal] = useState(false);
  const [selectedOrderTests, setSelectedOrderTests] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  useEffect(() => {
    fetchCompletedOrders();
  }, [refreshKey]);

  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const verify = sessionStorage.getItem("labtoken");
      if (!verify) {
        throw new Error("Authentication token not found");
      }
      
      const parsedVerify = JSON.parse(verify);
      const token = parsedVerify.token;
      
      const response = await axios.get(
        `${URL}/all-appointments/venorderHistory`, 
        {
          headers: {
            token: token,
          },
        }
      );
      
      if (response.data.success) {
        const allOrders = response.data.details || [];
        
        // Only show completed orders (status 8)
        const allCompletedOrders = allOrders.filter(order => order.status === "8" || order.status === 8);
        
        // Split orders into general (type=0) and prescription (type=1)
        const general = allCompletedOrders.filter(order => order.type === '0' || order.type === 0);
        const prescription = allCompletedOrders.filter(order => order.type === '1' || order.type === 1);
        
        setGeneralCompletedOrders(general);
        setPrescriptionCompletedOrders(prescription);
      } else {
        setGeneralCompletedOrders([]);
        setPrescriptionCompletedOrders([]);
      }
      
      setLoading(false);
    } catch (error) {
      setError(error.message || "Failed to load completed orders.");
      setLoading(false);
    }
  };

  const handleShowTestDetails = (order) => {
    setSelectedOrderTests(order.testId || []);
    setSelectedOrderDetails(order);
    setShowTestDetailsModal(true);
  };

  const downloadReport = (reportUrl) => {
    if (reportUrl) {
      const fullReportUrl = reportUrl.startsWith('/') ? `${URL}${reportUrl}` : `${URL}/${reportUrl}`;
      window.open(fullReportUrl, '_blank'); 
    } else {
      alert("No report available for this order.");
    }
  };

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
    return order.price || order.amount || 0; 
  };

  const getOrderTypeBadge = (order) => {
    if (order.type === '0' || order.type === 0) { 
      return <Badge bg="primary me-1">General</Badge>;
    } else if (order.type === '1' || order.type === 1) {
      return <Badge bg="secondary me-1">Prescription</Badge>;
    }
    return <Badge bg="light text-dark me-1">Unknown Type</Badge>; 
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    if (dateString.includes(' ')) {
      const datePart = dateString.split(' ')[0];
      return new Date(datePart).toLocaleDateString();
    }
    return new Date(dateString).toLocaleDateString();
  };

  const filteredGeneralOrders = useMemo(() => {
    const lowerCaseSearchTerm = generalSearchTerm.toLowerCase();
    if (!lowerCaseSearchTerm) return generalCompletedOrders;
    return generalCompletedOrders.filter(order => {
      const orderId = order._id?.slice(-6).toLowerCase();
      const customerName = getCustomerName(order).toLowerCase();
      const testPackageName = getAllTestNames(order).toLowerCase();
      return (
        orderId.includes(lowerCaseSearchTerm) ||
        customerName.includes(lowerCaseSearchTerm) ||
        testPackageName.includes(lowerCaseSearchTerm)
      );
    });
  }, [generalCompletedOrders, generalSearchTerm]);

  const filteredPrescriptionOrders = useMemo(() => {
    const lowerCaseSearchTerm = prescriptionSearchTerm.toLowerCase();
    if (!lowerCaseSearchTerm) return prescriptionCompletedOrders;
    return prescriptionCompletedOrders.filter(order => {
      const orderId = order._id?.slice(-6).toLowerCase();
      const customerName = getCustomerName(order).toLowerCase();
      const testPackageName = getAllTestNames(order).toLowerCase();
      return (
        orderId.includes(lowerCaseSearchTerm) ||
        customerName.includes(lowerCaseSearchTerm) ||
        testPackageName.includes(lowerCaseSearchTerm)
      );
    });
  }, [prescriptionCompletedOrders, prescriptionSearchTerm]);

  const renderOrderTable = (orders, orderType, searchTerm, setSearchTerm, filteredOrders) => (
    <div className="card-body">
      <InputGroup className="mb-3">
        <FormControl
          placeholder={`Search ${orderType === '0' ? 'General' : 'Prescription'} completed orders...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>Clear</Button>
      </InputGroup>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted">No completed orders found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Test/Package Name</th>
                <th>Order Type</th>
                <th>Service Type</th>
                <th>Amount</th>
                <th>Completed Date</th>
                <th>Driver</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} style={{ cursor: "pointer" }} onClick={() => handleShowTestDetails(order)}>
                  <td>{order._id.slice(-6)}</td>
                  <td>{getCustomerName(order)}</td>
                  <td>
                    {getAllTestNames(order)}
                    {hasMultipleTests(order) && <Badge bg="info" className="ms-1">{order.testId.length}</Badge>}
                  </td>
                  <td>{getOrderTypeBadge(order)}</td>
                  <td>{order.serviceType || "N/A"}</td>
                  <td>₹{getPrice(order)}</td>
                  <td>{formatDate(order.date)}</td>
                  <td onClick={(e) => e.stopPropagation()}>{order.driverId?.name || "N/A"}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-sm btn-info" onClick={() => downloadReport(order.report)} disabled={!order.report}>
                      {order.report ? "Download" : "No Report"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) return <div className="container-fluid d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" /></div>;

  return (
    <div className="container-fluid my-4">
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="general" title={<>General Completed Orders <Badge bg="primary">{generalCompletedOrders.length}</Badge></>}>
          <div className="card">{renderOrderTable(generalCompletedOrders, '0', generalSearchTerm, setGeneralSearchTerm, filteredGeneralOrders)}</div>
        </Tab>
        <Tab eventKey="prescription" title={<>Prescription Completed Orders <Badge bg="info">{prescriptionCompletedOrders.length}</Badge></>}>
          <div className="card">{renderOrderTable(prescriptionCompletedOrders, '1', prescriptionSearchTerm, setPrescriptionSearchTerm, filteredPrescriptionOrders)}</div>
        </Tab>
      </Tabs>

      <Modal style={{ width: "120%" }} show={showTestDetailsModal} onHide={() => setShowTestDetailsModal(false)} centered size="xl">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">
            <i className="fas fa-vial me-2 text-primary"></i>
            Test Details – {selectedOrderTests?.length || (selectedOrderDetails?.testName ? 1 : 0)} Test(s)
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <h6 className="border-bottom pb-2 mb-3 fw-bold">Tests Included</h6>
          {selectedOrderTests?.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm table-hover table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Test Name</th>
                    <th>Category</th>
                    <th>Organ</th>
                    <th>Type</th>
                    <th>MRP</th>
                    <th>Final Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderTests.map((test, index) => {
                    const mrp = Number(test.amount ?? 0);
                    const discountedAmount = Number(test.discountedAmount ?? 0);
                    const saving = mrp - discountedAmount;

                    return (
                      <tr key={test._id}>
                        <td className="fw-bold">{index + 1}</td>
                        <td><strong>{test.testName}</strong><br /><small className="text-muted">ID: {test._id?.slice(-6)}</small></td>
                        <td>{test.testCategory || "N/A"}</td>
                        <td>{test.organ || "N/A"}</td>
                        <td><Badge bg={test.testType === "Walk In" ? "primary" : "secondary"}>{test.testType || "N/A"}</Badge></td>
                        <td className="text-muted text-decoration-line-through">₹{mrp.toFixed(2)}</td>
                        <td className="fw-bold text-primary">₹{discountedAmount.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">{selectedOrderDetails?.testName || "No test details available"}</div>
          )}

          {selectedOrderDetails && (
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="p-3 border rounded bg-light h-100">
                  <h6 className="border-bottom pb-2 mb-3 fw-bold">Order Information</h6>
                  <div className="row">
                    <div className="col-6">
                      <p className="mb-2"><small className="text-muted">Order ID</small><br /><strong>{selectedOrderDetails._id?.slice(-6)}</strong></p>
                      <p className="mb-2"><small className="text-muted">Customer</small><br /><strong>{selectedOrderDetails.name}</strong></p>
                      <p className="mb-2"><small className="text-muted">Phone</small><br /><strong>{selectedOrderDetails.phone}</strong></p>
                    </div>
                    <div className="col-6">
                      <p className="mb-2"><small className="text-muted">Date</small><br /><strong>{formatDate(selectedOrderDetails.date)}</strong></p>
                      <p className="mb-2"><small className="text-muted">Service Type</small><br /><strong>{selectedOrderDetails.serviceType}</strong></p>
                      <p className="mb-0"><small className="text-muted">Driver</small><br /><Badge bg="success">{selectedOrderDetails.driverId?.name || "N/A"}</Badge></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                {(() => {
                  const mrpTotal = selectedOrderTests.reduce((t, test) => t + Number(test.amount ?? 0), 0);
                  const finalAmount = Number(selectedOrderDetails.price ?? 0);

                  return (
                    <div className="p-3 border rounded bg-white h-100">
                      <h6 className="border-bottom pb-2 mb-3 fw-bold">Pricing & Status</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Total MRP</span>
                        <span>₹{mrpTotal.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Discount Applied</span>
                        <span>-₹{(mrpTotal - finalAmount > 0 ? mrpTotal - finalAmount : 0).toFixed(2)}</span>
                      </div>
                      <div className="pt-3 border-top text-center mb-2">
                        <small className="text-muted">Final Price (Paid/Payable)</small>
                        <div className="fs-4 fw-bold text-primary">₹{finalAmount.toFixed(2)}</div>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Payment Status</span>
                        <Badge bg={selectedOrderDetails.isPaid ? "success" : "warning"}>{selectedOrderDetails.isPaid ? "Paid" : "Pending"}</Badge>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {selectedOrderDetails?.sampleRequired?.length > 0 && (
            <div className="mt-4 p-3 border rounded bg-light">
              <h6 className="border-bottom pb-2 fw-bold"><i className="fas fa-syringe me-2"></i>Sample Collection Information</h6>
              <p><strong>Sample Required:</strong> {selectedOrderDetails.sampleRequired.join(", ")}</p>
              <p className="mb-0"><strong>Sample Collected:</strong> {selectedOrderDetails.sampleCollected?.length ? selectedOrderDetails.sampleCollected.join(", ") : "Not collected yet"}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowTestDetailsModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CompletedOrders;
