import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Modal, Button, Alert, Spinner, Tabs, Tab, Carousel, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../../../Context/Context';

const PharmacyItemCard = React.memo(({ item, isMedicine = false }) => {
  const [showVendors, setShowVendors] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const DUMMY_IMAGE = "https://cdn.pixabay.com/photo/2020/03/18/15/16/blood-4944423_1280.jpg";
  const [apiError, setApiError] = useState(null);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const navigate = useNavigate();

  const {
    addToCart,
    fetchVendorsByProduct,
    fetchVendorsByMedicine,
    getUserLocation: getCurrentUserLocation
  } = useContext(MyContext);

  // Helper function to check if prescription is required
  const isPrescriptionRequired = useCallback(() => {
    if (!item || !item.prescription_required) return false;
    
    const prescriptionValue = item.prescription_required;
    const value = prescriptionValue.toString().toLowerCase().trim();
    
    // Check for Yes/No or true/false
    return value === 'yes' || value === 'true';
  }, [item]);

  // Get user location on component mount
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
              setLocationError('');
            },
            (error) => {
              console.log('Geolocation error:', error);
              setLocationError('Location access denied. Showing all pharmacies.');
            }
          );
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    getUserLocation();
  }, []);

  // Manual location refresh function
  const handleRefreshLocation = useCallback(async () => {
    try {
      setIsGettingLocation(true);
      setLocationError('');
      
      if (typeof getCurrentUserLocation === 'function') {
        const location = await getCurrentUserLocation();
        setUserLocation(location);
        // Refresh vendors with new location
        await fetchVendorsData();
      } else {
        // Fallback to basic geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
              setLocationError('');
              // Refresh vendors with new location
              fetchVendorsData();
            },
            (error) => {
              console.log('Geolocation error:', error);
              setLocationError('Unable to get your location.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        }
      }
    } catch (error) {
      console.error('Error refreshing location:', error);
      setLocationError('Failed to update location.');
    } finally {
      setIsGettingLocation(false);
    }
  }, [getCurrentUserLocation]);

  const parsePrice = useCallback((price) => {
    if (price === undefined || price === null) return 0;
    const num = typeof price === 'string' ? parseFloat(price) : Number(price);
    return isNaN(num) ? 0 : num;
  }, []);

  const itemData = React.useMemo(() => {
    if (!item) return null;

    const getAllImages = () => {
      if (Array.isArray(item.image_url) && item.image_url.length > 0) {
        return item.image_url.filter(img => typeof img === 'string' && img.trim());
      }
      if (Array.isArray(item.images) && item.images.length > 0) {
        return item.images.filter(img => typeof img === 'string' && img.trim());
      }
      if (typeof item.image === 'string' && item.image.trim()) {
        return [item.image];
      }
      return [DUMMY_IMAGE];
    };

    const allImages = getAllImages();

    const commonData = {
      id: item._id || item.productId || item.medicineId,
      name: item.name || 'Product',
      category: item.category || item.bread_crumb?.split('>')[0]?.trim() || 'Health Product',
      stockAvailable: item.stockFromVendor || item.totalStock || 0,
      vendorId: item.vendorId,
      isAvailable: (item.stockFromVendor || item.totalStock || 0) > 0,
      displayImage: allImages[0] || DUMMY_IMAGE,
      allImages: allImages,
      manufacturer: item.manufacturers || item.manufacturer,
      packaging: item.packaging,
      prescriptionRequired: isPrescriptionRequired(),
      description: item.description,
      primaryUse: item.primary_use,
      storage: item.storage,
      introduction: item.introduction,
      useOf: item.use_of,
      benefits: item.benefits,
      sideEffect: item.side_effect,
      howToUse: item.how_to_use,
      howWorks: item.how_works,
      safetyAdvice: item.safety_advise,
      alternateBrand: item.alternate_brand,
    };

    if (isMedicine) {
      return {
        ...commonData,
        price: parsePrice(item.vendorPrice || item.best_price),
        mrp: parsePrice(item.mrp),
        discount: parsePrice(item.discount || item.discont_percent),
        finalPrice: parsePrice(item.vendorPrice || item.best_price),
        saltComposition: item.salt_composition || "",
      };
    } else {
      return {
        ...commonData,
        price: parsePrice(item.vendorPrice || item.best_price),
        mrp: parsePrice(item.mrp),
        discount: parsePrice(item.discount),
        finalPrice: parsePrice(item.vendorPrice),
      };
    }
  }, [item, isMedicine, parsePrice, isPrescriptionRequired]);

  // Helper function to get distance display
  const getDistanceDisplay = (vendor) => {
    if (!vendor?.distance) return null;
    
    if (vendor.distance.status === 'NO_LOCATION') {
      return { text: 'Location unavailable', color: 'text-danger' };
    }
    
    if (vendor.distance.status === 'ERROR') {
      return { text: 'Distance N/A', color: 'text-warning' };
    }
    
    let badgeColor = 'secondary';
    let icon = 'fas fa-route';
    let infoText = '';
    
    if (vendor.distance.calculationMethod === 'ON_ROAD') {
      badgeColor = 'success';
      icon = 'fas fa-road';
      infoText = 'On-road distance';
    } else if (vendor.distance.calculationMethod === 'STRAIGHT_LINE') {
      badgeColor = 'info';
      icon = 'fas fa-ruler';
      infoText = 'Straight-line distance';
    }
    
    return {
      text: vendor.distance.text,
      duration: vendor.distance.durationText,
      badgeColor,
      icon,
      infoText,
      value: vendor.distance.value
    };
  };

  // Fetch vendors with distance calculation
  const fetchVendorsData = useCallback(async () => {
    if (!itemData?.id) return;

    setIsLoadingVendors(true);
    setApiError(null);
    setSelectedVendor(null);

    try {
      let vendorsData = [];

      if (isMedicine) {
        vendorsData = await fetchVendorsByMedicine(itemData.id, userLocation);
      } else {
        vendorsData = await fetchVendorsByProduct(itemData.id, userLocation);
      }

      console.log('Received vendors with distance data:', vendorsData);

      if (vendorsData.length > 0) {
        // Sort by distance if available
        const sortedVendors = [...vendorsData].sort((a, b) => {
          const aDist = a.distance?.value ?? Infinity;
          const bDist = b.distance?.value ?? Infinity;
          
          if (!aDist && !bDist) return 0;
          if (!aDist) return 1;
          if (!bDist) return -1;
          return aDist - bDist;
        });

        setVendors(sortedVendors);
        setSelectedVendor(sortedVendors[0]);

        // Show info about distance calculation
        const vendorsWithDistance = sortedVendors.filter(v => 
          v.distance?.status === 'OK' || v.distance?.status === 'FALLBACK'
        ).length;
        
        if (userLocation) {
          if (vendorsWithDistance === 0) {
            setApiError('No nearby pharmacies have this item in stock');
          } else if (vendorsWithDistance < sortedVendors.length) {
            setApiError(`Showing ${vendorsWithDistance} nearby pharmacies with accurate distances`);
          } else {
            setApiError(`Found ${vendorsWithDistance} nearby pharmacies`);
          }
        } else {
          setApiError('Enable location to see distances to pharmacies');
        }
      } else {
        setApiError('Currently no pharmacies have this item in stock');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setApiError(error.message || 'Failed to load pharmacy information');
    } finally {
      setIsLoadingVendors(false);
    }
  }, [itemData?.id, isMedicine, fetchVendorsByMedicine, fetchVendorsByProduct, userLocation]);

  const handleShowVendors = useCallback(() => {
    if (!itemData.isAvailable) return;
    setShowVendors(true);
    if (vendors.length === 0) {
      fetchVendorsData();
    }
  }, [fetchVendorsData, vendors.length, itemData?.isAvailable]);

  const handleAddToCart = useCallback(async () => {
    if (!selectedVendor || !itemData) return;

    setIsAddingToCart(true);
    setApiError(null);

    try {
      const result = await addToCart(
        selectedVendor.vendorId,
        itemData.id,
        quantity,
        isMedicine
      );

      if (result.success) {
        setShowVendors(false);
        navigate('/pharmacy/cart');
        return { success: true, message: result.message };
      }
      throw new Error(result.message || "Failed to add to cart");
    } catch (error) {
      console.error('Error adding to cart:', error);
      setApiError(error.message);
      return { success: false, message: error.message };
    } finally {
      setIsAddingToCart(false);
    }
  }, [addToCart, itemData, quantity, selectedVendor, isMedicine, navigate]);

  if (!item || !itemData) {
    return (
      <div className="card h-100 border-0 shadow-sm">
        <div className="card-body text-center">
          <p className="text-muted">Product information not available</p>
        </div>
      </div>
    );
  }

  const requiresPrescription = isPrescriptionRequired();

  return (
    <>
      <style>
        {`
          .product-detail-modal {
            max-width: 1140px !important;
            width: 100% !important;
            margin: auto; 
          }
          .product-detail-modal .modal-content {
            max-width: 1140px !important;
            width: 100% !important;
            flex: 1 1 auto;
          }
          .carousel-item img {
              height: 300px;
              object-fit: cover;
          }
          .distance-badge {
            font-size: 0.75rem;
            padding: 4px 8px;
            border-radius: 12px;
          }
          .vendor-card {
            transition: all 0.3s ease;
            border: 1px solid #dee2e6;
          }
          .vendor-card:hover {
            border-color: #007bff;
            box-shadow: 0 2px 8px rgba(0,123,255,0.1);
          }
          .selected-vendor {
            border-color: #28a745 !important;
            background-color: rgba(40, 167, 69, 0.05);
          }
          .rx-badges {
            position: absolute;
            top: 10px;
            color: black;
            right: 10px;
            z-index: 100;
            font-weight: bold;
            font-size: 0.8rem;
            background-color: rgba(255, 249, 74, 0.54) !important;
            padding: 5px 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }
          .off {
            background-color:rgba(63, 183, 121, 0.79);
            color: white;
        }
        `}
      </style>
      
      <div className="card h-100 border-0 shadow-sm position-relative">
        {/* Rx Badge - Top right corner */}
        {requiresPrescription && (
          <Badge  className="rx-badges" >
            <i className="fas fa-prescription me-1"></i>
          </Badge>
        )}
        
        <div 
          className="position-relative" 
          style={{ height: '200px', overflow: 'hidden', cursor: itemData.isAvailable ? 'pointer' : 'default' }}
          onClick={handleShowVendors}
        >
          <img
            src={itemData.displayImage}
            className="card-img-top h-100 object-fit-cover"
            alt={itemData.name || "Pharmacy Product"}
            onError={(e) => { e.target.onerror = null; e.target.src = DUMMY_IMAGE; }}
            loading="lazy"
          />
          {itemData.discount > 0 && (
            <div className="position-absolute top-0 start-0 m-2">
              <span className="badge off">{itemData.discount}% OFF</span>
            </div>
          )}
        </div>

        <div 
          className="card-body" 
          style={{ cursor: itemData.isAvailable ? 'pointer' : 'default' }}
          onClick={handleShowVendors}
        >
          <h6 className="card-title text-truncate">{itemData.name}</h6>

          {itemData.manufacturer && (
            <p className="small text-muted mb-1 text-truncate">
              <strong>By:</strong> {itemData.manufacturer}
            </p>
          )}

          {itemData.packaging && (
            <p className="small text-muted mb-2 text-truncate">
              <strong>Packaging:</strong> {itemData.packaging}
            </p>
          )}

          {/* Prescription Status in Card Body */}
          {/* {requiresPrescription && (
            <div className="mb-2">
              <small className="badge bg-warning text-dark">
                <i className="fas fa-prescription me-1"></i>
                Prescription Required
              </small>
            </div>
          )} */}

          <div className="d-flex align-items-center mb-2">
            <span className="text-danger fw-bold">₹{itemData.finalPrice.toFixed(2)}</span>
            {itemData.mrp > itemData.finalPrice && (
              <del className="text-muted small ms-2">₹{itemData.mrp.toFixed(2)}</del>
            )}
          </div>

          <button
            className={`btn btn-sm w-100 ${itemData.isAvailable ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
            onClick={(e) => {
                e.stopPropagation();
                if (itemData.isAvailable) handleShowVendors();
            }}
            disabled={!itemData.isAvailable}
          >
            {itemData.isAvailable ? 'Add To Cart' : 'Out of Stock'}
          </button>
        </div>

        <Modal show={showVendors} onHide={() => setShowVendors(false)} centered size="xl" dialogClassName="product-detail-modal">
          <Modal.Header closeButton>
            <Modal.Title>
              {itemData.name}
              
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {/* Location Status */}
            <div className="mb-3">
              {userLocation ? (
                <div className="alert alert-info d-flex justify-content-between align-items-center py-2 mb-0">
                  <div>
                    <i className="fas fa-map-marker-alt me-2"></i>
                    <strong>Your location:</strong> 
                    <span className="ms-2">
                      {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                    </span>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleRefreshLocation}
                    disabled={isGettingLocation}
                  >
                    {isGettingLocation ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-1"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sync-alt me-1"></i>
                        Refresh
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="alert alert-warning d-flex justify-content-between align-items-center py-2 mb-0">
                  <div>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Location not available. Enable location to see distances.
                  </div>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleRefreshLocation}
                    disabled={isGettingLocation}
                  >
                    {isGettingLocation ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-1"></i>
                        Getting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-location-crosshairs me-1"></i>
                        Enable Location
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {apiError && (
              <Alert variant={apiError.includes('Found') || apiError.includes('Showing') ? 'info' : 'danger'} className="mb-3">
                {apiError}
              </Alert>
            )}

            {locationError && (
              <Alert variant="warning" className="mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {locationError}
              </Alert>
            )}

            <div className="row mb-3">
              <div className="col-md-4">
                {itemData.allImages.length > 1 ? (
                  <Carousel>
                    {itemData.allImages.map((img, index) => (
                      <Carousel.Item key={index}>
                        <img
                          className="d-block w-100 rounded"
                          src={img}
                          alt={`${itemData.name} - view ${index + 1}`}
                          onError={(e) => { e.target.onerror = null; e.target.src = DUMMY_IMAGE; }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <img
                    src={itemData.displayImage}
                    className="img-fluid rounded"
                    alt={itemData.name || "Pharmacy Product"}
                    onError={(e) => { e.target.onerror = null; e.target.src = DUMMY_IMAGE; }}
                    style={{ maxHeight: "300px", objectFit: "cover", width: "100%" }}
                  />
                )}
              </div>
              <div className="col-md-8">
                {/* Prescription Requirement in Modal */}
                {requiresPrescription && (
                  <div className="mb-3">
                    <Alert variant="warning" className="py-2">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      <strong>Important:</strong> This medicine requires a valid doctor's prescription.
                    </Alert>
                  </div>
                )}
                
                {itemData.manufacturer && <p className="small mb-1"><strong>Manufacturer:</strong> {itemData.manufacturer}</p>}
                {itemData.saltComposition && <p className="small mb-1"><strong>Composition:</strong> {itemData.saltComposition}</p>}
                {itemData.packaging && <p className="small mb-2"><strong>Packaging:</strong> {itemData.packaging}</p>}
                {itemData.category && <p className="small mb-2"><strong>Category:</strong> {itemData.category}</p>}
                {itemData.primaryUse && <p className="small mb-2"><strong>Primary Use:</strong> {itemData.primaryUse}</p>}
                {itemData.storage && <p className="small mb-2"><strong>Storage:</strong> {itemData.storage}</p>}
                {itemData.storage && <p className="small mb-2">
                  {requiresPrescription && (
                <Badge bg="warning" text="dark" className="">
                  <i className="fas fa-prescription me-1"></i>
                  Prescription Required
                </Badge>
              )}</p>}
              </div>
            </div>
            
            <Tabs defaultActiveKey="vendors" id="item-details-tabs" className="mb-3">
              <Tab eventKey="vendors" title="Pharmacies & Quantity">
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">
                      Available Pharmacies 
                      {userLocation && vendors.length > 0 && (
                        <span className="badge bg-info ms-2">
                          Sorted by distance
                        </span>
                      )}
                    </h5>
                    {vendors.length > 0 && (
                      <small className="text-muted">
                        {vendors.filter(v => v.distance?.status === 'OK' || v.distance?.status === 'FALLBACK').length} with distance info
                      </small>
                    )}
                  </div>

                  {isLoadingVendors ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" role="status" />
                      <p className="mt-2">Checking nearby pharmacies...</p>
                    </div>
                  ) : vendors.length > 0 ? (
                    <div className="row row-cols-1 g-3">
                      {vendors.map((vendor) => {
                        const distanceInfo = getDistanceDisplay(vendor);
                        
                        return (
                          <div
                            key={vendor.vendorId}
                            className={`col vendor-card rounded p-3 ${selectedVendor?.vendorId === vendor.vendorId ? "selected-vendor" : ""}`}
                            onClick={() => setSelectedVendor(vendor)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1 d-flex align-items-center">
                                  {vendor.shopName || vendor.name || "Pharmacy"}
                                  {selectedVendor?.vendorId === vendor.vendorId && (
                                    <i className="fas fa-check-circle text-success ms-2"></i>
                                  )}
                                </h6>
                                
                                {/* Address */}
                                {vendor.address && (
                                  <p className="small text-muted mb-1">
                                    <i className="fas fa-map-marker-alt me-1"></i>
                                    {vendor.address}
                                    {(vendor.city || vendor.state) && (
                                      <span className="ms-1">
                                        ({[vendor.city, vendor.state].filter(Boolean).join(', ')})
                                      </span>
                                    )}
                                  </p>
                                )}
                                
                                {/* Distance Information */}
                                {distanceInfo && (
                                  <div className="mb-2">
                                    <span className={`badge bg-${distanceInfo.badgeColor} distance-badge me-2`}>
                                      <i className={`${distanceInfo.icon} me-1`}></i>
                                      {distanceInfo.text}
                                    </span>
                                    
                                    {distanceInfo.duration && (
                                      <span className="badge bg-secondary distance-badge me-2">
                                        <i className="fas fa-clock me-1"></i>
                                        {distanceInfo.duration}
                                      </span>
                                    )}
                                    
                                    {distanceInfo.infoText && (
                                      <small className="text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        {distanceInfo.infoText}
                                      </small>
                                    )}
                                  </div>
                                )}
                                
                                {/* Stock and Price */}
                                <div className="d-flex align-items-center gap-3">
                                  <span className="badge bg-light text-dark">
                                    <i className="fas fa-cubes me-1"></i>
                                    Stock: {vendor.stock || 0}
                                  </span>
                                  <span className="badge bg-light text-dark">
                                    <i className="fas fa-tag me-1"></i>
                                    Price: ₹{vendor.vendorPrice || "N/A"}
                                  </span>
                                  {vendor.discount > 0 && (
                                    <span className="badge bg-success">
                                      {vendor.discount}% OFF
                                    </span>
                                  )}
                                </div>
                                
                                {/* Contact Info */}
                                <div className="mt-2">
                                  {vendor.contact && (
                                    <small className="text-muted me-3">
                                      <i className="fas fa-phone me-1"></i>
                                      {vendor.contact}
                                    </small>
                                  )}
                                  {vendor.email && (
                                    <small className="text-muted">
                                      <i className="fas fa-envelope me-1"></i>
                                      {vendor.email}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-store-slash fs-1 text-muted mb-3"></i>
                      <h5>No Pharmacies Available</h5>
                      <p className="text-muted mb-3">This item is currently not available at any pharmacies.</p>
                      <button className="btn btn-sm btn-outline-primary" onClick={fetchVendorsData}>
                        <i className="fas fa-sync-alt me-2"></i>Refresh Availability
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max={selectedVendor?.stock || itemData.stockAvailable || 1}
                    value={quantity}
                    onChange={(e) => {
                      const maxQty = selectedVendor?.stock || itemData.stockAvailable || 1;
                      const newQty = Math.max(1, Math.min(parseInt(e.target.value) || 1, maxQty));
                      setQuantity(newQty);
                    }}
                    disabled={!selectedVendor}
                  />
                  <small className="text-muted">Available: {selectedVendor?.stock || itemData.stockAvailable}</small>
                </div>
              </Tab>
              
              {/* Rest of the tabs remain the same */}
              {(itemData.introduction || itemData.description) && (
                <Tab eventKey="description" title="Description">
                  <div className="p-3 border rounded">
                    <h6 className="fw-bold">Introduction</h6>
                    <p className="small">{itemData.introduction || 'N/A'}</p>
                    <h6 className="fw-bold mt-3">Description</h6>
                    <p className="small">{itemData.description || 'N/A'}</p>
                  </div>
                </Tab>
              )}

              {(itemData.benefits || itemData.sideEffect) && (
                <Tab eventKey="benefits" title="Benefits & Side Effects">
                  <div className="p-3 border rounded">
                    <h6 className="fw-bold">Benefits</h6>
                    <p className="small">{itemData.benefits || 'N/A'}</p>
                    <h6 className="fw-bold mt-3">Side Effects</h6>
                    <p className="small">{itemData.sideEffect || 'N/A'}</p>
                  </div>
                </Tab>
              )}

              {(itemData.howToUse || itemData.howWorks) && (
                <Tab eventKey="usage" title="How to Use">
                  <div className="p-3 border rounded">
                    <h6 className="fw-bold">How to Use</h6>
                    <p className="small">{itemData.howToUse || 'N/A'}</p>
                    <h6 className="fw-bold mt-3">How it Works</h6>
                    <p className="small">{itemData.howWorks || 'N/A'}</p>
                  </div>
                </Tab>
              )}

              {itemData.safetyAdvice && (
                  <Tab eventKey="safety" title="Safety Advice">
                    <div className="p-3 border rounded">
                      <h6 className="fw-bold">Safety Advice</h6>
                      <p className="small">{itemData.safetyAdvice}</p>
                      {itemData.alternateBrand && (
                          <>
                              <h6 className="fw-bold mt-3">Alternate Brands</h6>
                              <p className="small">{itemData.alternateBrand}</p>
                          </>
                      )}
                    </div>
                  </Tab>
              )}
            </Tabs>

            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Price:</span>
                <span>₹{selectedVendor ? selectedVendor.vendorPrice : itemData.finalPrice.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Quantity:</span>
                <span>{quantity}</span>
              </div>
              {selectedVendor?.discount > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Discount:</span>
                  <span className="text-success">{selectedVendor.discount}% OFF</span>
                </div>
              )}
              <div className="d-flex justify-content-between align-items-center border-top pt-2">
                <h5 className="mb-0">Total:</h5>
                <h4 className="mb-0 text-primary">
                  ₹{((selectedVendor ? parseFloat(selectedVendor.vendorPrice) : itemData.finalPrice) * quantity).toFixed(2)}
                </h4>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowVendors(false)} disabled={isAddingToCart}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleAddToCart} 
              disabled={isAddingToCart || !selectedVendor || isLoadingVendors}
            >
              {isAddingToCart ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Adding...</>
              ) : (
                "Add to Cart"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
});

export default PharmacyItemCard;
