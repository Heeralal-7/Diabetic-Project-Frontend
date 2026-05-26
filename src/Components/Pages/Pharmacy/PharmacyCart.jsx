import React, { useState, useEffect,useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import { Link } from 'react-router-dom';
import { Modal, Button, Badge, Alert } from 'react-bootstrap';

const PharmacyCart = () => {
  const { 
    cartItems1: cartItems, 
    loading, 
    error, 
    fetchCartItems, 
    updateCartQuantity1,
    removeCartItem1,
    checkout,
    confirmOrder
  } = useContext(MyContext);

  const [deliverySlot, setDeliverySlot] = useState('morning');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [isRapidDelivery, setIsRapidDelivery] = useState(false);
  const [address, setAddress] = useState('');
  const [coupon, setCoupon] = useState('');

  const slots = [
    { id: 'morning', label: 'Morning (9AM - 12PM)' },
    { id: 'afternoon', label: 'Afternoon (12PM - 4PM)' },
    { id: 'evening', label: 'Evening (4PM - 9PM)' }
  ];

  // Calculate cart totals
  const calculateTotals = () => {
    const subTotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
    const tax = subTotal * 0.05; // 5% tax
    const deliveryCharge = subTotal > 300 ? 0 : 50;
    const rapidDeliveryCharge = isRapidDelivery ? 100 : 0;
    const total = subTotal + tax + deliveryCharge + rapidDeliveryCharge;
    
    return {
      subTotal: subTotal.toFixed(2),
      tax: tax.toFixed(2),
      deliveryCharge: deliveryCharge.toFixed(2),
      rapidDeliveryCharge: rapidDeliveryCharge.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const totals = calculateTotals();

  // Handle checkout
  const handleCheckout = async () => {
    try {
      const cartIds = cartItems.map(item => item._id);
      const result = await checkout(cartIds, isRapidDelivery);
      
      if (result.success) {
        setCheckoutData(result.data);
        setShowCheckout(true);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  // Handle order confirmation
  const handleConfirmOrder = async () => {
    try {
      const result = await confirmOrder({
        address,
        timeSlot: isRapidDelivery ? 'Rapid Delivery' : deliverySlot,
        dateSlot: new Date().toLocaleDateString(),
        coupon,
        isRapidDelivery
      });
      
      if (result.success) {
        // Order confirmed successfully
        setShowCheckout(false);
        // Redirect to order confirmation page
        window.location.href = `/pharmacy/order/${result.data.orderId}`;
      }
    } catch (error) {
      console.error("Order confirmation error:", error);
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (itemId, action) => {
    await updateCartQuantity1(itemId, action);
  };

  // Handle item removal
  const handleRemoveItem = async (itemId) => {
    await removeCartItem1(itemId);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  if (loading && cartItems.length === 0) {
    return <div className="text-center py-5">Loading your cart...</div>;
  }

  if (error) {
    return (
      <div className="container py-5">
        <Alert variant="danger">
          Error loading cart: {error}
          <Button variant="link" onClick={fetchCartItems}>Retry</Button>
        </Alert>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h3>Your cart is empty</h3>
        <p>Browse our products and add items to your cart</p>
        <Link to="/pharmacy" className="btn btn-primary">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid container-xl py-4">
      <div className="row">
        {/* Cart Items */}
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in your Cart
              </h4>
            </div>
            <div className="card-body">
              {cartItems.map(item => (
                <div key={item._id} className="border-bottom pb-3 mb-3">
                  <div className="row">
                    <div className="col-md-2">
                      <img
                        src={item.itemDetails.image || 'default-pharmacy-image.png'}
                        className="img-fluid rounded"
                        alt={item.itemDetails.name}
                        style={{ maxHeight: '100px' }}
                      />
                    </div>
                    <div className="col-md-6">
                      <h5>{item.itemDetails.name}</h5>
                      <p className="text-muted small mb-1">
                        {item.itemType === 'medicine' ? 'Medicine' : 'Product'}
                      </p>
                      <p className="mb-1">
                        <span className="fw-bold">₹{item.vendorPrice}</span>
                        {item.discountPercent > 0 && (
                          <span className="text-success ms-2">
                            {item.discountPercent}% OFF
                          </span>
                        )}
                      </p>
                      <p className="small text-muted">
                        Sold by: {item.vendorDetails.shopName}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleQuantityChange(item._id, 'decrease')}
                            disabled={item.quantity <= 1 || loading}
                          >
                            -
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleQuantityChange(item._id, 'increase')}
                            disabled={item.quantity >= item.stockAvailable || loading}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={loading}
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                      <div className="mt-2 text-end">
                        <h5 className="mb-0">₹{(item.vendorPrice * item.quantity).toFixed(2)}</h5>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-white">
              <h4 className="mb-0">Order Summary</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h5>Delivery Address</h5>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter your delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <h5>Delivery Slot</h5>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rapidDelivery"
                    checked={isRapidDelivery}
                    onChange={() => setIsRapidDelivery(!isRapidDelivery)}
                  />
                  <label className="form-check-label" htmlFor="rapidDelivery">
                    Rapid Delivery (₹100 extra)
                  </label>
                </div>
                
                {!isRapidDelivery && (
                  <select
                    className="form-select"
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                  >
                    {slots.map(slot => (
                      <option key={slot.id} value={slot.id}>{slot.label}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-3">
                <h5>Apply Coupon</h5>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter coupon code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary">Apply</button>
                </div>
              </div>

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{totals.subTotal}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (5%):</span>
                  <span>₹{totals.tax}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery:</span>
                  <span>₹{totals.deliveryCharge}</span>
                </div>
                {isRapidDelivery && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Rapid Delivery:</span>
                    <span>₹{totals.rapidDeliveryCharge}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between fw-bold fs-5 mt-3">
                  <span>Total:</span>
                  <span>₹{totals.total}</span>
                </div>

                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={handleCheckout}
                  disabled={loading || !address}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {checkoutData && (
            <>
              <div className="mb-4">
                <h5>Delivery Address</h5>
                <p>{address}</p>
              </div>
              
              <div className="mb-4">
                <h5>Delivery Time</h5>
                <p>
                  {isRapidDelivery ? 'Rapid Delivery (Will be assigned soon)' : 
                   `${deliverySlot} on ${new Date().toLocaleDateString()}`}
                </p>
              </div>
              
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => (
                      <tr key={item._id}>
                        <td>{item.itemDetails.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.vendorPrice}</td>
                        <td>₹{(item.vendorPrice * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between">
                  <span>Subtotal:</span>
                  <span>₹{totals.subTotal}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Tax:</span>
                  <span>₹{totals.tax}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Delivery:</span>
                  <span>₹{totals.deliveryCharge}</span>
                </div>
                {isRapidDelivery && (
                  <div className="d-flex justify-content-between">
                    <span>Rapid Delivery:</span>
                    <span>₹{totals.rapidDeliveryCharge}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
                  <span>Total:</span>
                  <span>₹{totals.total}</span>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckout(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmOrder} disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Order'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PharmacyCart;