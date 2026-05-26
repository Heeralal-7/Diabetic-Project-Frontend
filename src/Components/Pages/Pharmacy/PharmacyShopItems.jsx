import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePharmacy } from './PharmacyContext';
import PharmacyCard from './PharmacyCard';
import CardsCarousel from './CardsCarousel';
import { Tab, Tabs } from 'react-bootstrap';

const PharmacyShopItems = () => {
  const { shopId } = useParams();
  const { 
    products, 
    medicines, 
    vendorProducts, 
    vendorMedicines,
    loading, 
    fetchVendorProducts,
    fetchVendorMedicines
  } = usePharmacy();
  
  const [activeTab, setActiveTab] = useState('products');
  const [shopDetails, setShopDetails] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch shop details here
    setShopDetails({
      _id: shopId,
      name: "Deep Brothers Medicos",
      image: "https://img.freepik.com/free-vector/pharmacy-paper-bag-medicine_603843-3825.jpg",
      address: "sco 41 block-c market, Desumanjra Rd",
      city: "Chandigarh",
      state: "Punjab",
      rating: 4.5,
      open24hrs: true
    });

    // Fetch vendor-specific products and medicines
    fetchVendorProducts();
    fetchVendorMedicines();
  }, [shopId]);

  if (loading && !shopDetails) {
    return <div className="text-center py-5">Loading shop details...</div>;
  }

  if (!shopDetails) {
    return <div className="text-center py-5">Shop not found</div>;
  }

  return (
    <div className="container-fluid container-xl px-lg-4 py-4">
      {/* Shop Header */}
      <div className="row mb-4">
        <div className="col-md-3">
          <img 
            src={shopDetails.image} 
            alt={shopDetails.name}
            className="img-fluid rounded"
            style={{ maxHeight: '200px', objectFit: 'cover' }}
          />
        </div>
        <div className="col-md-9">
          <h1>{shopDetails.name}</h1>
          <p className="text-muted">
            <i className="fas fa-map-marker-alt me-2" />
            {shopDetails.address}, {shopDetails.city}, {shopDetails.state}
          </p>
          <div className="d-flex align-items-center mb-2">
            <span className="badge bg-warning text-dark me-2">
              <i className="fas fa-star me-1" />
              {shopDetails.rating}
            </span>
            {shopDetails.open24hrs && (
              <span className="badge bg-success me-2">Open 24 Hours</span>
            )}
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary">
              <i className="fas fa-directions me-2" />
              Get Directions
            </button>
            <button className="btn btn-outline-secondary">
              <i className="fas fa-phone me-2" />
              Call Shop
            </button>
          </div>
        </div>
      </div>

      {/* Shop Content */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="products" title="Products">
          <div className="row mt-4">
            {vendorProducts.length > 0 ? (
              vendorProducts.map(product => (
                <div key={product._id} className="col-md-4 col-lg-3 mb-4">
                  <PharmacyCard data={product} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <p>No products available from this vendor</p>
              </div>
            )}
          </div>
        </Tab>
        
        <Tab eventKey="medicines" title="Medicines">
          <div className="row mt-4">
            {vendorMedicines.length > 0 ? (
              vendorMedicines.map(medicine => (
                <div key={medicine._id} className="col-md-4 col-lg-3 mb-4">
                  <PharmacyCard data={medicine} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <p>No medicines available from this vendor</p>
              </div>
            )}
          </div>
        </Tab>
        
        <Tab eventKey="about" title="About">
          <div className="row mt-4">
            <div className="col-md-6">
              <h3>About {shopDetails.name}</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie 
                vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.
              </p>
              <h5 className="mt-4">Timings</h5>
              <p>Monday - Saturday: 9:00 AM - 9:00 PM</p>
              <p>Sunday: 10:00 AM - 8:00 PM</p>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fas fa-map-marker-alt me-2" />
                    Visit the Shop
                  </h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {shopDetails.name}
                  </h6>
                  <p className="card-text">
                    {shopDetails.address}, {shopDetails.city}, {shopDetails.state}
                  </p>
                  <button className="btn btn-primary">
                    <i className="fas fa-directions me-2" />
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>

      {/* Popular Items from this Shop */}
      {vendorProducts.length > 0 && (
        <div className="mt-5">
          <CardsCarousel 
            autoplay={true} 
            loop={true} 
            mainTittle="Popular Products from this Shop" 
            items={vendorProducts.slice(0, 8)}
            noOfSlides={[4, 3, 2, 1, 1, 1]}
          />
        </div>
      )}
    </div>
  );
};

export default PharmacyShopItems;