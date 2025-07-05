import React, { useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Tab, Tabs, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import PendingOrders from './Pending';
import AcceptedOrders from './AcceptedOrders';
import AssignedOrders from './AssignedOrders';
import OrderHistory from './OrderHistory';

const FoodDashboard = () => {
  const { loading, error } = useContext(MyContext);
  const [key, setKey] = useState('pending');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    // Increment refreshKey to force child components to refresh
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Food Orders Management</h2>
        <div>
          <Badge bg="info" className="fs-6 me-2">
            {new Date().toLocaleDateString()}
          </Badge>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh All
          </Button>
        </div>
      </div>
            
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
          <Tab eventKey="pending" title={
            <>
              Pending Orders <Badge bg="danger">New</Badge>
            </>
          }>
            <PendingOrders refreshKey={refreshKey} onRefresh={handleRefresh} />
          </Tab>
          <Tab eventKey="accepted" title="Accepted Orders">
            <AcceptedOrders refreshKey={refreshKey} onRefresh={handleRefresh} />
          </Tab>
          <Tab eventKey="assigned" title="Assigned Orders">
            <AssignedOrders refreshKey={refreshKey} onRefresh={handleRefresh} />
          </Tab>
          <Tab eventKey="history" title="Order History">
            <OrderHistory refreshKey={refreshKey} onRefresh={handleRefresh} />
          </Tab>
        </Tabs>
      )}
    </div>
  );
};

export default FoodDashboard;