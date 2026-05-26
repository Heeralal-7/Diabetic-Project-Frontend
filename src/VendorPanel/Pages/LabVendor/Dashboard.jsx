import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Tab, Tabs, Alert, Spinner, Badge, Button } from 'react-bootstrap';

// Import components for each tab
import VendorPendingOrders from './PendingOrders';
import VendorAcceptedOrders from './AcceptedOrders';
import VendorCompletedOrders from './CompletedOrders';
import VendorRevenueReport from './Revenue';
import VendorAssignedOrders from './AssignedOrders';
import { MyContext } from '../../../Context/Context';
import SampleCollected from './SampleCollected';
import LabOrderHistory from './LabOrderHistory';

const VendorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Set 'revenueReport' as the default key to make it active on load
  const [key, setKey] = useState('revenueReport'); 
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const { vendorError } = useContext(MyContext);

  const URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  // Effect to fetch overview data (currently commented out, but shows intent)
  useEffect(() => {
    // If you want to fetch some summary data for the overview cards on dashboard load:
    // const fetchOverviewData = async () => { ... };
    // if (key === 'overview') { fetchOverviewData(); }
    // For now, leaving it as is since overview data is mock.
    setLoading(false); // Set loading false as overview data is mock
  }, [key]); // Re-fetch only when the 'overview' tab is active

  const handleRefresh = async () => {
    setIsRefreshingAll(true);
    // Increment refreshKey to trigger re-fetches in child components that depend on it
    setRefreshKey(prev => prev + 1); 
    setTimeout(() => {
      setIsRefreshingAll(false);
    }, 500); // Reset loading state after a short delay
  };

  const vendorImages = [
    "https://via.placeholder.com/50",
    "https://via.placeholder.com/50",
    "https://via.placeholder.com/50",
    "https://via.placeholder.com/50",
    "https://via.placeholder.com/50",
  ];

  // Mock overview data (replace with actual API calls if needed)
  const overviewData = {
    pending: 5,
    accepted: 12,
    completed: 50,
    revenue: 1250.50,
  };

  // Handle initial loading state for the *currently active* tab
  // This ensures that if the dashboard loads directly into a data-heavy tab, it shows a spinner.
  if (loading && key !== 'overview') { // Avoid showing spinner if it's just the mock overview loading
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" size="lg">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Handle error state for the *currently active* tab
  if (error && key !== 'overview') {
    return (
      <div className="container-fluid">
        <Alert variant="danger" className="mt-3">
          Error loading dashboard section: {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Vendor Dashboard</h2>
        <div>
          <Badge bg="info" className="fs-6 me-2">
            {new Date().toLocaleDateString()}
          </Badge>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshingAll}
          >
            {isRefreshingAll ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              'Refresh All'
            )}
          </Button>
        </div>
      </div>

      {vendorError && <Alert variant="danger">{vendorError}</Alert>}

      <Tabs activeKey={key} onSelect={(k) => setKey(k)} id="vendor-dashboard-tabs" className="mb-3">
        
        {/* Revenue Report Tab - Set as default */}
        <Tab eventKey="revenueReport" title="Revenue Report">
          <VendorRevenueReport
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
        
        {/* Overview Tab */}
        {/* <Tab eventKey="overview" title="Overview">
          <div className="row mt-3 g-4">
            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
              <Link to="/panel/pending-orders" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h4 className="mb-2 text-primary">Pending Orders</h4>
                      <h1 className="mb-3 display-6 fw-bold">{overviewData.pending || 0}</h1>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge bg-warning me-2">New</span>
                      <div className="d-flex">
                        {vendorImages.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Vendor ${index + 1}`}
                            className="rounded-circle"
                            style={{ height: "40px", width: "40px", marginLeft: index === 0 ? "0" : "-10px", border: "2px solid white" }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
              <Link to="/panel/accepted-orders" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h4 className="mb-2 text-info">Accepted Orders</h4>
                      <h1 className="mb-3 display-6 fw-bold">{overviewData.accepted || 0}</h1>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge bg-info me-2">Processing</span>
                      <div className="d-flex">
                        {vendorImages.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Vendor ${index + 1}`}
                            className="rounded-circle"
                            style={{ height: "40px", width: "40px", marginLeft: index === 0 ? "0" : "-10px", border: "2px solid white" }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
              <Link to="/panel/completed-orders" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h4 className="mb-2 text-success">Completed Orders</h4>
                      <h1 className="mb-3 display-6 fw-bold">{overviewData.completed || 0}</h1>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge bg-success me-2">Done</span>
                      <div className="d-flex">
                        {vendorImages.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Vendor ${index + 1}`}
                            className="rounded-circle"
                            style={{ height: "40px", width: "40px", marginLeft: index === 0 ? "0" : "-10px", border: "2px solid white" }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
              <Link to="/panel/revenue" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h4 className="mb-2 text-primary">Total Revenue</h4>
                      <h1 className="mb-3 display-6 fw-bold">₹{overviewData.revenue?.toFixed(2) || '0.00'}</h1>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge bg-primary me-2">Earnings</span>
                      <div className="d-flex">
                        {vendorImages.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Vendor ${index + 1}`}
                            className="rounded-circle"
                            style={{ height: "40px", width: "40px", marginLeft: index === 0 ? "0" : "-10px", border: "2px solid white" }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </Tab> */}

        {/* Order Management Tabs */}
        <Tab eventKey="pendingOrders" title={
          <>
            Pending Orders <Badge bg="danger">New</Badge>
          </>
        }>
          <VendorPendingOrders
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
        <Tab eventKey="acceptedOrders" title="Accepted Orders">
          <VendorAcceptedOrders
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
        <Tab eventKey="assignedOrders" title="Assigned Orders">
          <VendorAssignedOrders
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
        <Tab eventKey="sampleCollected" title="Sample Collected">
          <SampleCollected
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
        <Tab eventKey="completedOrdersTab" title="Completed Orders">
          <VendorCompletedOrders
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
        <Tab eventKey="labOrderHistory" title="Order History">
          <LabOrderHistory
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default VendorDashboard;