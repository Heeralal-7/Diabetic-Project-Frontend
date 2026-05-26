import React, { useState } from 'react';
import { Tab, Tabs, Badge, Button, Card } from 'react-bootstrap'; // Card को import किया गया
import PendingOrders from './PendingOrders';
import AcceptedOrders from './AcceptedOrders';
import ActiveOrders from './ActiveOrders';
import OrderHistory from './OrderHistory';
import MedicinesList from './MedicinesList';
import ProductsList from './ProductsList';
import VendorProductsList from './VendorProductsList';
import VendorMedicinesList from './VendorMedicinesList';

const PharmacyDashboard = () => {
  const [key, setKey] = useState('vendor-medicines');
  const [refreshKey, setRefreshKey] = useState(0);

  // यह फ़ंक्शन state को अपडेट करके सभी कंपोनेंट्स को रिफ्रेश करता है
  // जो 'refreshKey' प्रॉप का उपयोग कर रहे हैं।
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // हर टैब के कंटेंट को रेंडर करने के लिए एक हेल्पर फ़ंक्शन
  // इसमें एक टाइटल और एक समर्पित रिफ्रेश बटन होता है।
  const renderTabContent = (title, Component) => (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{title}</h5>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={handleRefresh}
        >
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </Button>
      </Card.Header>
      <Card.Body>
        <Component refreshKey={refreshKey} />
      </Card.Body>
    </Card>
  );


  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pharmacy Management</h2>
        <div>
          <Badge bg="info" className="fs-6 me-2">
            {new Date().toLocaleDateString()}
          </Badge>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={handleRefresh}
          >
            Refresh All
          </Button>
        </div>
      </div>
            
     <div className="">
       <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mt-0">
        {/* Your Stock Tabs */}
        <Tab className='p-0' eventKey="vendor-medicines" title={<>Your Medicines <Badge bg="success">In Stock</Badge></>}>
          {renderTabContent("Your Medicines In Stock", VendorMedicinesList)}
        </Tab>
        <Tab eventKey="vendor-products" title={<>Your Products <Badge bg="success">In Stock</Badge></>}>
          {renderTabContent("Your Products In Stock", VendorProductsList)}
        </Tab>

        {/* All Items Tabs */}
        <Tab eventKey="medicines" title="All Medicines">
          {renderTabContent("All Available Medicines", MedicinesList)}
        </Tab>
        <Tab eventKey="products" title="All Products">
          {renderTabContent("All Available Products", ProductsList)}
        </Tab> 
                
        {/* Order Management Tabs */}
        <Tab eventKey="pending" title={<>Pending Orders <Badge bg="danger">New</Badge></>}>
          {/* अब PendingOrders को refreshKey मिलेगा और इसका अपना रिफ्रेश बटन भी होगा */}
          {renderTabContent("Pending Orders", PendingOrders)}
        </Tab>
        <Tab eventKey="accepted" title="Accepted Orders">
          {/* अब AcceptedOrders को refreshKey मिलेगा और इसका अपना रिफ्रेश बटन भी होगा */}
          {renderTabContent("Accepted Orders", AcceptedOrders)}
        </Tab>
        <Tab eventKey="active" title="Active Orders">
          {/* अब ActiveOrders को refreshKey मिलेगा और इसका अपना रिफ्रेश बटन भी होगा */}
          {renderTabContent("Active Orders", ActiveOrders)}
        </Tab>
        <Tab eventKey="history" title="Order History">
          {/* अब OrderHistory को refreshKey मिलेगा और इसका अपना रिफ्रेश बटन भी होगा */}
          {renderTabContent("Order History", OrderHistory)}
        </Tab>
      </Tabs>
     </div>
    </div>
  );
};

export default PharmacyDashboard;