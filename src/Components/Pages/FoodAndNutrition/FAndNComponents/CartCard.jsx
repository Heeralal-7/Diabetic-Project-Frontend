import React, { useContext, useEffect, useState, useCallback } from 'react';
import { MyContext } from '../../../../Context/Context';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItems, setRemovingItems] = useState({});
  const [updatingItems, setUpdatingItems] = useState({});
  const { getCartData, removeCartItem, updateCartQuantity } = useContext(MyContext);
  const navigate = useNavigate();

  const fetchCartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCartData();
      
      if (!data) {
        throw new Error("Failed to fetch cart data");
      }
      
      if (data.success !== 1) {
        throw new Error(data.message || "Your cart is empty");
      }

      if (!data.details || data.details.length === 0) {
        setCartData(null);
        return;
      }

      setCartData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch cart data");
      setCartData(null);
    } finally {
      setLoading(false);
    }
  }, [getCartData]);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  const formatPrice = (price) => {
    return (parseFloat(price) || 0).toFixed(2);
  };

  const calculateCartTotals = useCallback((details) => {
    if (!details || details.length === 0) {
      return {
        totalFoodPrice: 0,
        totalAddonsPrice: 0,
        totalPrice: 0,
        totalQuantity: 0
      };
    }

    const totalFoodPrice = details.reduce((sum, item) => {
      const price = parseFloat(item.FoodItem?.amount) || 0;
      const discount = parseFloat(item.FoodItem?.discountPercentage) || 0;
      return sum + (price - (price * discount / 100)) * item.quantity;
    }, 0);

    const totalAddonsPrice = details.reduce((sum, item) => {
      return sum + (item.extraItems?.reduce((addonSum, addon) => 
        addonSum + (parseFloat(addon?.price) || 0), 0) * item.quantity || 0);
    }, 0);

    const totalQuantity = details.reduce((sum, item) => sum + item.quantity, 0);

    return {
      totalFoodPrice,
      totalAddonsPrice,
      totalPrice: totalFoodPrice + totalAddonsPrice,
      totalQuantity
    };
  }, []);

  const handleRemoveItem = async (foodItemId) => {
    try {
      setRemovingItems(prev => ({ ...prev, [foodItemId]: true }));
      const response = await removeCartItem(foodItemId);
      
      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to remove item");
      }

      setCartData(prev => {
        if (!prev) return null;
        const updatedDetails = prev.details.filter(item => item.FoodItem._id !== foodItemId);
        
        if (updatedDetails.length === 0) return null;
        
        return {
          ...prev,
          details: updatedDetails,
          cart: updatedDetails.length,
          ...calculateCartTotals(updatedDetails)
        };
      });
    } catch (error) {
      console.error('Error removing item:', error);
      alert(error.message);
    } finally {
      setRemovingItems(prev => ({ ...prev, [foodItemId]: false }));
    }
  };

  const handleQuantityChange = async (type, cartItemId, foodItemId) => {
    try {
      setUpdatingItems(prev => ({ ...prev, [`${type}-${cartItemId}`]: true }));
      
      // Find the current item first
      const currentItem = cartData.details.find(item => item._id === cartItemId);
      if (!currentItem) {
        throw new Error("Item not found in cart");
      }

      // Calculate the new quantity
      const newQuantity = type === 'inc' 
        ? currentItem.quantity + 1 
        : Math.max(1, currentItem.quantity - 1);

      // Optimistic UI update
      setCartData(prev => {
        if (!prev) return null;
        
        const updatedDetails = prev.details.map(item => 
          item._id === cartItemId ? { ...item, quantity: newQuantity } : item
        );
        
        return {
          ...prev,
          details: updatedDetails,
          ...calculateCartTotals(updatedDetails)
        };
      });

      // Make API call
      await updateCartQuantity(foodItemId, newQuantity);

    } catch (error) {
      // Revert on error
      setCartData(prev => {
        if (!prev) return null;
        
        const currentItem = prev.details.find(item => item._id === cartItemId);
        if (!currentItem) return prev;
        
        const updatedDetails = prev.details.map(item => 
          item._id === cartItemId ? { ...item, quantity: currentItem.quantity } : item
        );
        
        return {
          ...prev,
          details: updatedDetails,
          ...calculateCartTotals(updatedDetails)
        };
      });
      
      console.error(`Error ${type === 'inc' ? 'increasing' : 'decreasing'} quantity:`, error);
      alert(error.message);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [`${type}-${cartItemId}`]: false }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your cart...</p>
      </div>
    );
  }

  if (error || !cartData) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <h5>{error || "Your cart is empty"}</h5>
          <button 
            className="btn btn-primary mt-2" 
            onClick={() => navigate(-1)}
          >
            Continue Shopping
          </button>
          {error && (
            <button className="btn btn-outline-secondary ms-2 mt-2" onClick={fetchCartData}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-3" style={{ maxWidth: '1200px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 className="m-0">Your Cart ({cartData.cart} items)</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          Continue Shopping
        </button>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {cartData.details.map((cartItem) => {
            const foodItem = cartItem.FoodItem;
            const originalPrice = parseFloat(foodItem?.amount || 0);
            const discountPercentage = parseFloat(foodItem?.discountPercentage || 0);
            const discountedPrice = originalPrice * (1 - discountPercentage / 100);
            const isRemoving = removingItems[foodItem._id];
            const isIncreasing = updatingItems[`inc-${cartItem._id}`];
            const isDecreasing = updatingItems[`dec-${cartItem._id}`];

            return (
              <div key={cartItem._id} className="card mb-3">
                <div className="row g-0">
                  <div className="col-md-3">
                    <img 
                      src={process.env.REACT_APP_API_URL + (foodItem?.image?.[0] || '')} 
                      className="img-fluid rounded-start h-100 object-fit-cover"
                      alt={foodItem?.foodName}
                      onError={(e) => {
                        e.target.src = '/images/default-food.png';
                      }}
                    />
                  </div>
                  <div className="col-md-9">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <h5 className="card-title">{foodItem?.foodName || 'Unknown Item'}</h5>
                        <div>
                          <button 
                            className="btn btn-sm btn-outline-danger me-2"
                            onClick={() => handleRemoveItem(foodItem._id)}
                            disabled={isRemoving}
                          >
                            {isRemoving ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center mb-2">
                        <span className={`badge ${foodItem?.foodCategory === 'Veg' ? 'bg-success' : 'bg-danger'} me-2`}>
                          {foodItem?.foodCategory === 'Veg' ? 'Veg' : 'Non-Veg'}
                        </span>
                        <span className="text-muted">{foodItem?.foodSubCategory || 'Food'}</span>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <span className="text-decoration-line-through text-muted me-2">
                            ₹{formatPrice(originalPrice)}
                          </span>
                          <span className="fw-bold text-danger">
                            ₹{formatPrice(discountedPrice)}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleQuantityChange('dec', cartItem._id, foodItem._id)}
                            disabled={isDecreasing || cartItem.quantity <= 1}
                          >
                            {isDecreasing ? '...' : '-'}
                          </button>
                          <span className="mx-2 fw-bold">{cartItem.quantity}</span>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleQuantityChange('inc', cartItem._id, foodItem._id)}
                            disabled={isIncreasing}
                          >
                            {isIncreasing ? '...' : '+'}
                          </button>
                        </div>
                      </div>
                      
                      {cartItem.request && (
                        <div className="alert alert-info p-2 mb-2">
                          <strong>Special Request:</strong> {cartItem.request}
                        </div>
                      )}
                      
                      {cartItem.extraItems?.length > 0 && (
                        <div className="mt-2 pt-2 border-top">
                          <h6>Addons:</h6>
                          <ul className="list-unstyled">
                            {cartItem.extraItems.map((addon) => (
                              <li key={addon._id} className="d-flex justify-content-between">
                                <span>{addon.name}</span>
                                <span>₹{formatPrice(addon.price)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Order Summary</h5>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹{formatPrice(cartData.totalFoodPrice)}</span>
              </div>
              
              {cartData.totalAddonsPrice > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Addons:</span>
                  <span>₹{formatPrice(cartData.totalAddonsPrice)}</span>
                </div>
              )}
              
              <hr />
              
              <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                <span>Total:</span>
                <span>₹{formatPrice(cartData.totalPrice)}</span>
              </div>
              
              <button 
                className="btn btn-success w-100"
                onClick={() => navigate('/checkout', {
                  state: {
                    orderType: cartData.totalQuantity >= 2 ? "Bulk" : "Single"
                  }
                })}
                disabled={Object.values(removingItems).some(Boolean) || 
                          Object.values(updatingItems).some(Boolean)}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CartPage);