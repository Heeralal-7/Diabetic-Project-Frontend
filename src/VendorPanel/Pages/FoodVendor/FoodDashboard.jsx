import React, { useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Tab, Tabs, Alert, Spinner, Badge, Button } from 'react-bootstrap';

// Import Order Management Components
import PendingOrders from './Pending';
import AcceptedOrders from './AcceptedOrders';
import AssignedOrders from './AssignedOrders';
import OrderHistory from './OrderHistory';

import AddMeal from './AddMeal';
import AddCategory from './AddCategory';

// Import Food Management Components
import AllFoods from './AllFoods';
import AddFood from './AddFood';
import RemovedFoods from './RemovedFoods';

const FoodDashboard = () => {
  const { error } = useContext(MyContext);
  const [key, setKey] = useState('allFoods');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshingAll(true);
    // Increment refreshKey to trigger updates in all components
    setRefreshKey(prev => prev + 1);
    
    // Add a small delay to ensure all components have started refreshing
    setTimeout(() => {
      setIsRefreshingAll(false);
    }, 500);
  };

  const handleFoodAdded = () => {
    setKey('allFoods');
    handleRefresh();
  };

  return (
    <div className="container-fluid my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Management Dashboard</h2>
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
            
      {/* {error && <Alert variant="danger">{error}</Alert>} */}

      <Tabs activeKey={key} onSelect={(k) => setKey(k)} id="main-dashboard-tabs" className="mb-3">
        {/* Food Management Tabs */}
        <Tab eventKey="allFoods" title="All Foods">
          <AllFoods 
            refreshKey={refreshKey} 
            onRefresh={handleRefresh} 
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
        <Tab eventKey="addFood" title="Add New Food">
          <AddFood onFoodAdded={handleFoodAdded} />
        </Tab>
        <Tab eventKey="removedFoods" title="Removed Foods">
          <RemovedFoods 
            refreshKey={refreshKey} 
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>

        {/* Order Management Tabs */}
        <Tab eventKey="pending" title={
          <>
            Pending Orders <Badge bg="danger">New</Badge>
          </>
        }>
          <PendingOrders 
            refreshKey={refreshKey} 
            onRefresh={handleRefresh} 
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
        <Tab eventKey="accepted" title="Accepted Orders">
          <AcceptedOrders 
            refreshKey={refreshKey} 
            onRefresh={handleRefresh} 
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
        <Tab eventKey="assigned" title="Assigned Orders">
          <AssignedOrders 
            refreshKey={refreshKey} 
            onRefresh={handleRefresh} 
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
        <Tab eventKey="history" title="Order History">
          <OrderHistory 
            refreshKey={refreshKey} 
            onRefresh={handleRefresh} 
            isRefreshingAll={isRefreshingAll}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default FoodDashboard;