import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AddAddress from "../Shop/ShopComponents/AddAddress";
import CartOffers from "../Shop/ShopComponents/CartOffers";
import { MyContext } from "../../../Context/Context";
import moment from "moment";

const ProductCart = () => {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const [currentDate] = useState(moment().format("DD/MM/YYYY"));
  const [selectedMealType, setSelectedMealType] = useState("morning");
  const [availableSlots, setAvailableSlots] = useState({
    morning: [], afternoon: [], evening: []
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [vendorId, setVendorId] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isRapidDelivery, setIsRapidDelivery] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});

  const { 
    getAvailableSlots,
    getCartData,
    bookOrder,
    addToCartCraving,
    decreaseCartItem,
    removeCartItem,
    addNewAddress,
    updateAddress,
    deleteAddress,
    fetchAddresses,
    updateCartQuantity
  } = useContext(MyContext);

  // Memoized cart calculations
  const { currentTotal, discountedPrice, displayTotal, totalQuantity } = useMemo(() => {
    const currentTotal = cartItems.reduce((total, item) => {
      const price = parseFloat(item.FoodItem?.amount) || 0;
      const discount = parseFloat(item.FoodItem?.discountPercentage) || 0;
      const discountedPrice = price - (price * discount / 100);
      const addonsPrice = (item.extraItems?.reduce((sum, addon) => 
        sum + (parseFloat(addon?.price) || 0), 0) || 0) * item.quantity;
      return total + (discountedPrice * item.quantity) + addonsPrice;
    }, 0);

    let discountedPrice = 0;
    if (appliedCoupon) {
      if (appliedCoupon.percentageDiscount) {
        discountedPrice = (currentTotal * parseFloat(appliedCoupon.percentageDiscount)) / 100;
      } else if (appliedCoupon.fixedAmountDiscount) {
        discountedPrice = Math.min(parseFloat(appliedCoupon.fixedAmountDiscount), currentTotal);
      }
    }

    const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return {
      currentTotal,
      discountedPrice,
      displayTotal: Math.max(0, currentTotal - discountedPrice),
      totalQuantity
    };
  }, [cartItems, appliedCoupon]);

  const loadCartData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cartData = await getCartData();
      
      if (!cartData) {
        throw new Error("Failed to load cart data. Please try again.");
      }
      
      if (cartData.success !== 1) {
        throw new Error(cartData.message || "Your cart is empty");
      }

      if (!cartData.details || cartData.details.length === 0) {
        setCartItems([]);
        setVendorId("");
        return;
      }

      const vendorIdFromCart = cartData.details[0]?.FoodItem?.vendorId;
      if (!vendorIdFromCart) {
        throw new Error("Vendor information not found in cart items");
      }
      
      setVendorId(vendorIdFromCart);
      setCartItems(cartData.details);
    } catch (err) {
      setError(err.message || "Failed to load cart data");
      setCartItems([]);
      setVendorId("");
    } finally {
      setIsLoading(false);
    }
  }, [getCartData]);

  const loadAddresses = useCallback(async () => {
    try {
      const data = await fetchAddresses();
      if (!data) {
        throw new Error("Failed to load addresses");
      }
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddress(prev => 
          prev && data.some(addr => addr._id === prev._id) 
            ? data.find(addr => addr._id === prev._id) 
            : data[0]
        );
      }
    } catch (err) {
      setError(prev => prev || err.message);
      setAddresses([]);
      setSelectedAddress(null);
    }
  }, [fetchAddresses]);

  useEffect(() => {
    loadCartData();
    loadAddresses();
  }, [loadCartData, loadAddresses]);

  const fetchAvailableSlots = useCallback(async (date, vendorId) => {
    try {
      if (!vendorId) return;
      
      const slotsData = await getAvailableSlots({ startDate: date, vendorId });
      if (!slotsData) {
        throw new Error("Failed to fetch delivery slots");
      }
      
      setAvailableSlots({
        morning: slotsData.morning || [],
        afternoon: slotsData.afternoon || [],
        evening: slotsData.evening || []
      });
    } catch (err) {
      setError(prev => prev || err.message);
      setAvailableSlots({ morning: [], afternoon: [], evening: [] });
    }
  }, [getAvailableSlots]);

  useEffect(() => {
    if (vendorId) fetchAvailableSlots(currentDate, vendorId);
  }, [vendorId, currentDate, fetchAvailableSlots]);

const handleQuantityChange = async (type, cartItemId, foodItemId) => {
  try {
    setUpdatingItems(prev => ({ ...prev, [`${type}-${cartItemId}`]: true }));
    
    const currentItem = cartItems.find(item => item._id === cartItemId);
    if (!currentItem) throw new Error("Item not found in cart");

    // Calculate the new quantity
    const newQuantity = type === 'inc' 
      ? currentItem.quantity + 1 
      : Math.max(1, currentItem.quantity - 1);

    // Optimistic UI update
    const updatedItems = cartItems.map(item => 
      item._id === cartItemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);

    // Make API call
    await updateCartQuantity(foodItemId, newQuantity);

  } catch (error) {
    // Revert on error
    setCartItems(cartItems);
    console.error(`Error ${type === 'inc' ? 'increasing' : 'decreasing'} quantity:`, error);
    alert(error.message);
  } finally {
    setUpdatingItems(prev => ({ ...prev, [`${type}-${cartItemId}`]: false }));
  }
};

  const handleRemoveItem = async (cartItemId, foodItemId) => {
    try {
      setUpdatingItems(prev => ({ ...prev, [`rem-${cartItemId}`]: true }));
      const response = await removeCartItem(foodItemId);
      
      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to remove item");
      }

      const updatedItems = cartItems.filter(item => item._id !== cartItemId);
      setCartItems(updatedItems);
      
      if (updatedItems.length === 0) {
        setVendorId("");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert(error.message);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [`rem-${cartItemId}`]: false }));
    }
  };

  const handleApplyCoupon = useCallback((coupon) => {
    if (!coupon) return;
    
    const expiryDate = moment(coupon.expireDate, "DD/MM/YYYY");
    if (expiryDate.isBefore(moment(), 'day')) {
      alert("This coupon has expired");
      return;
    }

    if (coupon.minOrderValue && currentTotal < coupon.minOrderValue) {
      alert(`Minimum order value of ₹${coupon.minOrderValue} required for this coupon`);
      return;
    }

    setAppliedCoupon(coupon);
  }, [currentTotal]);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }
    
    if (!selectedSlot) {
      alert("Please select a delivery time slot");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    
    try {
      setIsCheckingOut(true);
      
      const orderData = {
        foodId: cartItems.map(item => item._id),
        vendorId: vendorId,
        address: [
          selectedAddress.address,
          selectedAddress.city,
          selectedAddress.state,
          selectedAddress.pinCode
        ],
        date: currentDate,
        foodTime: selectedSlot.mealType,
        foodSlot: `${selectedSlot.startTime}-${selectedSlot.endTime}`,
        price: displayTotal,
        couponId: appliedCoupon?._id,
        discount: discountedPrice,
        rapid: isRapidDelivery,
        orderType: totalQuantity >= 2 ? "Bulk" : "Single"
      };

      const result = await bookOrder(orderData);
      if (!result || result.success !== 1) {
        throw new Error(result?.message || "Checkout failed");
      }

      navigate('/shop/FoodAndNurition/order-success', { 
        state: { 
          orderId: result.data._id,
          total: displayTotal,
          originalTotal: currentTotal,
          discount: discountedPrice,
          address: selectedAddress,
          deliverySlot: selectedSlot,
          coupon: appliedCoupon
        }
      });
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.message || "Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-mainRed" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your cart...</p>
      </div>
    );
  }

  if (error || !cartItems || cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <h5>{error || "Your cart is empty"}</h5>
          <button 
            className="btn btn-outline-mainRed mt-2" 
            onClick={() => navigate('/shop/FoodAndNurition')}
          >
            Browse Menu
          </button>
          {error && (
            <button className="btn btn-outline-secondary ms-2 mt-2" onClick={loadCartData}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid container-xl pt-lg-4 pb-3">
      <div className="row">
        <div className="col-md-10 mx-auto col-lg-7 pt-lg-2">
          <div className="FoodCart border rounded-3 pb-3 mt-4 mt-lg-0">
            <div className="d-none d-lg-flex px-3 py-3 border-bottom align-items-center">
              <i className="ri-map-pin-range-fill fs-5 me-2"></i>
              <span className="fw-semibold">
                Deliver to {selectedAddress?.addressType || 'Home'} ({selectedAddress?.pinCode || 'Select Address'})
              </span>
              <button className="btn btn-link ms-auto fw-bold" data-bs-toggle="offcanvas" data-bs-target="#addAddress">
                Change Address
              </button>
            </div>

            {cartItems.map((item) => (
              <div key={item._id} className="card mb-3">
                <div className="row g-0">
                  <div className="col-md-3">
                    <img 
                      src={process.env.REACT_APP_API_URL + (item.FoodItem?.image?.[0] || '')} 
                      className="img-fluid rounded-start h-100 object-fit-cover"
                      alt={item.FoodItem?.foodName} 
                      onError={(e) => {
                        e.target.src = '/images/default-food.png';
                      }}
                    />
                  </div>
                  <div className="col-md-9">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <h5 className="card-title">{item.FoodItem?.foodName || 'Unknown Item'}</h5>
                        <div>
                          <button 
                            className="btn btn-sm btn-outline-danger me-2"
                            onClick={() => handleRemoveItem(item._id, item.FoodItem._id)}
                            disabled={updatingItems[`rem-${item._id}`]}
                          >
                            {updatingItems[`rem-${item._id}`] ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center mb-2">
                        <span className={`badge ${item.FoodItem?.foodCategory === 'Veg' ? 'bg-success' : 'bg-danger'} me-2`}>
                          {item.FoodItem?.foodCategory === 'Veg' ? 'Veg' : 'Non-Veg'}
                        </span>
                        <span className="text-muted">{item.FoodItem?.foodSubCategory || 'Food'}</span>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <span className="text-decoration-line-through text-muted me-2">
                            ₹{(parseFloat(item.FoodItem?.amount) || 0).toFixed(2)}
                          </span>
                          <span className="fw-bold text-danger">
                            ₹{((parseFloat(item.FoodItem?.amount) || 0) * (1 - (parseFloat(item.FoodItem?.discountPercentage) || 0) / 100)).toFixed(2)}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleQuantityChange('dec', item._id, item.FoodItem._id)}
                            disabled={updatingItems[`dec-${item._id}`] || item.quantity <= 1}
                          >
                            {updatingItems[`dec-${item._id}`] ? '...' : '-'}
                          </button>
                          <span className="mx-2 fw-bold">{item.quantity}</span>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleQuantityChange('inc', item._id, item.FoodItem._id)}
                            disabled={updatingItems[`inc-${item._id}`]}
                          >
                            {updatingItems[`inc-${item._id}`] ? '...' : '+'}
                          </button>
                        </div>
                      </div>
                      
                      {item.request && (
                        <div className="alert alert-info p-2 mb-2">
                          <strong>Special Request:</strong> {item.request}
                        </div>
                      )}
                      
                      {item.extraItems?.length > 0 && (
                        <div className="mt-2 pt-2 border-top">
                          <h6>Addons:</h6>
                          <ul className="list-unstyled">
                            {item.extraItems.map((addon) => (
                              <li key={addon._id} className="d-flex justify-content-between">
                                <span>{addon.name}</span>
                                <span>₹{(parseFloat(addon.price) || 0).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-10 mx-auto col-lg-5 mt-lg-0 my-3">
          <div className="px-sm-3 FoodCartBox">
            {selectedAddress && (
              <div className="card my-2">
                <div className="card-body">
                  <h6 className="fw-bold mb-2">Delivery Address</h6>
                  <p className="mb-1">
                    <strong>{selectedAddress.name}</strong> ({selectedAddress.addressType})
                  </p>
                  <p className="small text-muted mb-1">
                    {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pinCode}
                  </p>
                  <p className="small text-muted mb-0">Phone: {selectedAddress.phone}</p>
                  <button 
                    className="btn btn-sm btn-link text-mainBlue mt-2 p-0"
                    data-bs-toggle="offcanvas" 
                    data-bs-target="#addAddress"
                  >
                    Change Address
                  </button>
                </div>
              </div>
            )}

            {appliedCoupon && (
              <div className="card my-2">
                <div className="card-body">
                  <h6 className="fw-bold mb-2">Coupon Applied</h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-0">
                        <strong>{appliedCoupon.couponCode}</strong> - {appliedCoupon.description}
                      </p>
                      <p className="mb-0 text-success">
                        You saved ₹{discountedPrice.toFixed(2)}
                      </p>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setAppliedCoupon(null)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="border rounded-3 mb-3">
              <div className="p-3 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-medium">Subtotal:</span>
                  <span>₹{currentTotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-medium">Discount:</span>
                    <span className="text-danger">-₹{discountedPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="fw-bold">Total:</span>
                  <span className="fw-bold fs-5">₹{displayTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3">
                <button 
                  className="btn bg-mainRed text-light w-100 mb-2"
                  data-bs-toggle="offcanvas" 
                  data-bs-target="#CartOffers"
                >
                  <i className="ri-coupon-2-line me-2"></i>
                  {appliedCoupon ? 'Change Coupon' : 'Apply Coupon'}
                </button>
              </div>
            </div>

            <div className="card mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Delivery Options</h6>
                
                <div className="mb-3">
                  <label className="form-label">Meal Type</label>
                  <div className="d-flex gap-2 mb-3">
                    {['morning', 'afternoon', 'evening'].map((type) => (
                      <button
                        key={type}
                        className={`btn ${selectedMealType === type ? 'btn-mainRed' : 'btn-outline-secondary'} flex-grow-1`}
                        onClick={() => setSelectedMealType(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>

                  <label className="form-label">Available Slots</label>
                  {availableSlots[selectedMealType]?.length > 0 ? (
                    <select 
                      className="form-select"
                      value={selectedSlot ? `${selectedSlot.startTime}-${selectedSlot.endTime}` : ""}
                      onChange={(e) => {
                        const [startTime, endTime] = e.target.value.split('-');
                        setSelectedSlot({ mealType: selectedMealType, startTime, endTime });
                      }}
                    >
                      <option value="">Select a time slot</option>
                      {availableSlots[selectedMealType].map((slot, index) => (
                        <option 
                          key={index} 
                          value={`${slot.startTime}-${slot.endTime}`}
                        >
                          {moment(slot.startTime, "HH:mm").format("h:mm A")} - {moment(slot.endTime, "HH:mm").format("h:mm A")}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="alert alert-warning">No slots available</div>
                  )}
                </div>

                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rapidDelivery"
                    checked={isRapidDelivery}
                    onChange={(e) => setIsRapidDelivery(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rapidDelivery">
                    <strong>Rapid Delivery</strong> (Additional charge may apply)
                  </label>
                </div>
              </div>
            </div>

            <button 
              className="btn bg-mainRed text-light w-100 py-3 fs-5 rounded-2"
              disabled={!selectedAddress || !selectedSlot || isCheckingOut}
              onClick={handleCheckout}
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>

      <AddAddress
        onAddressChange={setSelectedAddress}
        addresses={addresses}
        addNewAddress={addNewAddress}
        updateAddress={updateAddress}
        deleteAddress={deleteAddress}
        fetchAddresses={fetchAddresses}
      />
      
      {vendorId && (
        <CartOffers 
          vendorId={vendorId}
          onCouponApplied={handleApplyCoupon}
          key={vendorId}
        />
      )}
    </div>
  );
};

export default React.memo(ProductCart);