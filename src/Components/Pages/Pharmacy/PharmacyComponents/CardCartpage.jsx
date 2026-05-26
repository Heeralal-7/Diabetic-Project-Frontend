import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../../../Context/Context';

const CardCartPage = React.memo(({ item, isMedicine = false, onViewAll }) => {
  const DUMMY_IMAGE = "https://cdn.pixabay.com/photo/2020/03/18/15/16/blood-4944423_1280.jpg";
  const [imageUrl, setImageUrl] = useState(DUMMY_IMAGE);
  const [quantity, setQuantity] = useState(1);
  const [apiError, setApiError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  
  const { 
    addToCart,
    fetchVendorsByProduct,
    fetchVendorsByMedicine,
  } = useContext(MyContext);

  const parsePrice = useCallback((price) => {
    if (price === undefined || price === null) return 0;
    const num = typeof price === 'string' ? parseFloat(price) : Number(price);
    return isNaN(num) ? 0 : num;
  }, []);

  const itemData = React.useMemo(() => {
    if (!item) return null;

    const basePrice = parsePrice(item.basePrice || item.vendorPrice);
    const discount = parsePrice(item.discount || 0);
    const finalPrice = basePrice - (basePrice * discount / 100);

    return {
      id: item.productId || item._id,
      name: item.name || 'Product',
      category: item.category || 'Health Product',
      stockAvailable: item.stock || 0,
      vendorId: item.vendorId,
      isAvailable: (item.stock || 0) > 0,
      image: item.image,
      images: item.images,
      image_url: item.image_url,
      url: item.url,
      basePrice: basePrice,
      discount: discount,
      finalPrice: finalPrice,
      description: item.description,
      ...(isMedicine && {
        manufacturer: item.manufacturer,
        saltComposition: item.salt_composition,
        packaging: item.packaging,
        prescriptionRequired: item.prescription_required === "YES"
      })
    };
  }, [item, isMedicine, parsePrice]);

  useEffect(() => {
    if (!item) return;
    
    let img = "";

    // Check image sources in order of priority
    if (item.image_url) {
      img = item.image_url;
    } else if (item.image && typeof item.image === "string") {
      img = item.image;
    } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      img = item.images[0];
    } else if (item.url) {
      img = item.url;
    }

    // Only use dummy image if no image was found
    if (!img || img.trim() === "") {
      img = DUMMY_IMAGE;
    }

    setImageUrl(img);
  }, [item]);

  const handleImageError = () => {
    setImageUrl(DUMMY_IMAGE);
  };

  const handleAddToCart = useCallback(async () => {
    if (!itemData || !itemData.isAvailable) return;

    setIsAddingToCart(true);
    setApiError(null);

    try {
      const result = await addToCart(
        itemData.vendorId,
        itemData.id,
        quantity,
        isMedicine
      );

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        throw new Error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsAddingToCart(false);
    }
  }, [addToCart, itemData, quantity, isMedicine]);

  const handleViewDetails = () => {
    if (isMedicine) {
      navigate(`/medicine/details/${itemData.id}`);
    } else {
      navigate(`/product/details/${itemData.id}`);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      // Default behavior if onViewAll not provided
      if (isMedicine) {
        navigate('/pharmacy/medicines');
      } else {
        navigate('/pharmacy/products');
      }
    }
  };

  const handleViewCart = () => {
    setShowSuccessModal(false);
    navigate('/pharmacy/cart');
  };

  const handleContinueShopping = () => {
    setShowSuccessModal(false);
  };

  if (!item || !itemData) {
    return (
      <div className="card h-100 border-0 shadow-sm">
        <div className="card-body text-center">
          <p className="text-muted">Product information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card h-100 border-0 shadow-sm">
          <div 
            className="position-relative" 
            style={{ height: '200px', overflow: 'hidden', cursor: 'pointer' }}
            onClick={handleViewDetails}
          >
            <img
              src={imageUrl}
              className="card-img-top h-100 object-fit-cover"
              alt={itemData.name}
              onError={handleImageError}
              loading="lazy"
            />
            {itemData.discount > 0 && (
              <div className="position-absolute top-0 start-0 m-2">
                <span className="badge bg-danger">{itemData.discount}% OFF</span>
              </div>
            )}
          </div>

          <div className="card-body">
            <h6 
              className="card-title text-truncate"
              style={{ cursor: 'pointer' }}
              onClick={handleViewDetails}
            >
              {itemData.name}
            </h6>
            
            {isMedicine && (
              <>
                {itemData.manufacturer && (
                  <p className="small text-muted mb-1 text-truncate">{itemData.manufacturer}</p>
                )}
                {itemData.saltComposition && (
                  <p className="small text-muted mb-1 text-truncate">Contains: {itemData.saltComposition}</p>
                )}
                {itemData.packaging && (
                  <p className="small text-muted mb-2 text-truncate">{itemData.packaging}</p>
                )}
              </>
            )}

            <div className="d-flex align-items-center mb-2">
              <span className="text-danger fw-bold">₹{itemData.finalPrice.toFixed(2)}</span>
              {itemData.discount > 0 && (
                <del className="text-muted small ms-2">₹{itemData.basePrice.toFixed(2)}</del>
              )}
            </div>
            
            <p className="small mb-2">
              {itemData.isAvailable ? (
                <span className="text-success">In Stock ({itemData.stockAvailable})</span>
              ) : (
                <span className="text-danger">Out of Stock</span>
              )}
            </p>

            <div className="d-flex gap-2">
              <button 
                className={`btn btn-sm flex-grow-1 ${itemData.isAvailable ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (itemData.isAvailable) handleAddToCart();
                }}
                disabled={!itemData.isAvailable || isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <Spinner as="span" size="sm" animation="border" className="me-2" />
                    Adding...
                  </>
                ) : (
                  itemData.isAvailable ? 'Add to Cart' : 'Out of Stock'
                )}
              </button>
            </div>

            {apiError && (
              <Alert variant="danger" className="mt-2 mb-0 p-2 small">
                {apiError}
              </Alert>
            )}
          </div>

          {/* Success Modal */}
          <Modal show={showSuccessModal} onHide={handleContinueShopping} centered>
            <Modal.Header closeButton>
              <Modal.Title>Success!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="text-center">
                <i className="fas fa-check-circle text-success display-4 mb-3"></i>
                <p>Item has been added to your cart successfully!</p>
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
              <Button variant="outline-secondary" onClick={handleContinueShopping}>
                Continue Shopping
              </Button>
              <Button variant="primary" onClick={handleViewCart}>
                View Cart
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
});

export default CardCartPage;