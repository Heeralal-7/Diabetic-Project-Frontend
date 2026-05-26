import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MyContext } from '../../../../Context/Context';
import { FaUtensils, FaMotorcycle, FaCheckCircle, FaTimesCircle, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { getOrderById, orderLoading } = useContext(MyContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        console.log('Fetching order details for ID:', orderId);
        
        if (!orderId) {
          setError('Order ID is missing');
          setLoading(false);
          return;
        }

        const result = await getOrderById(orderId);
        console.log('Order details result:', result);

        if (result.success === 1 && result.order) {
          setOrder(result.order);
        } else {
          setError(result.message || 'Order not found');
        }
        
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to fetch order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, []);

  // Calculate total of all items without any charges
  const calculateItemsSubtotal = (order) => {
    if (!order?.items || order.items.length === 0) return 0;
    
    return order.items.reduce((total, item) => {
      const basePrice = parseFloat(item.FoodItem?.amount || item.amount || 0);
      const discountPercentage = parseFloat(item.FoodItem?.discountPercentage || 0);
      const quantity = item.quantity || 1;
      
      // Calculate extra items total
      const extraItemsTotal = item.extraItems?.reduce((extraTotal, extra) => {
        return extraTotal + (parseFloat(extra.price) || 0);
      }, 0) || 0;
      
      // Apply discount to base price
      const discountedBasePrice = discountPercentage > 0 
        ? basePrice - (basePrice * discountPercentage / 100)
        : basePrice;
      
      return total + ((discountedBasePrice + extraItemsTotal) * quantity);
    }, 0);
  };

  // Calculate delivery charges (difference between final price and items subtotal)
  const calculateDeliveryCharges = (order) => {
    const itemsSubtotal = calculateItemsSubtotal(order);
    const finalTotal = parseFloat(order?.price || 0);
    
    if (finalTotal > itemsSubtotal) {
      return finalTotal - itemsSubtotal;
    }
    return 0;
  };

  // Get final order total from API
  const getOrderTotal = (order) => {
    return parseFloat(order?.price || 0);
  };

  // Calculate discount percentage for the order
  const getOrderDiscount = (order) => {
    return parseFloat(order?.items?.[0]?.FoodItem?.discountPercentage || 0);
  };

  // Calculate individual item price with discount
  const calculateItemPrice = (item) => {
    if (!item) return 0;
    
    const basePrice = parseFloat(item.FoodItem?.amount || item.amount || 0);
    const discountPercentage = parseFloat(item.FoodItem?.discountPercentage || 0);
    const quantity = item.quantity || 1;
    
    // Calculate extra items total
    const extraItemsTotal = item.extraItems?.reduce((extraTotal, extra) => {
      return extraTotal + (parseFloat(extra.price) || 0);
    }, 0) || 0;
    
    // Apply discount to base price
    const discountedBasePrice = discountPercentage > 0 
      ? basePrice - (basePrice * discountPercentage / 100)
      : basePrice;
    
    return (discountedBasePrice + extraItemsTotal) * quantity;
  };

  // Calculate original item price without discount
  const calculateOriginalItemPrice = (item) => {
    if (!item) return 0;
    
    const basePrice = parseFloat(item.FoodItem?.amount || item.amount || 0);
    const quantity = item.quantity || 1;
    
    // Calculate extra items total
    const extraItemsTotal = item.extraItems?.reduce((extraTotal, extra) => {
      return extraTotal + (parseFloat(extra.price) || 0);
    }, 0) || 0;
    
    return (basePrice + extraItemsTotal) * quantity;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      '0': { text: 'Pending', class: 'bg-warning text-dark', icon: <FaUtensils className="me-1" /> },
      '1': { text: 'Accepted', class: 'bg-primary', icon: <FaCheckCircle className="me-1" /> },
      '2': { text: 'Rejected', class: 'bg-danger', icon: <FaTimesCircle className="me-1" /> },
      '3': { text: 'Preparing', class: 'bg-info', icon: <FaUtensils className="me-1" /> },
      '4': { text: 'On the way', class: 'bg-warning', icon: <FaMotorcycle className="me-1" /> },
      '5': { text: 'At your door', class: 'bg-secondary', icon: <FaUser className="me-1" /> },
      '6': { text: 'Delivered', class: 'bg-success', icon: <FaCheckCircle className="me-1" /> },
      '7': { text: 'Cancelled', class: 'bg-danger', icon: <FaTimesCircle className="me-1" /> }
    };

    const config = statusConfig[status] || { text: 'Unknown', class: 'bg-secondary' };
    return (
      <span className={`badge ${config.class} d-inline-flex align-items-center py-1 px-2`}>
        {config.icon} {config.text}
      </span>
    );
  };

  // Show discount badge
  const DiscountBadge = ({ discountPercentage }) => {
    if (!discountPercentage || discountPercentage <= 0) return null;
    
    return (
      <span className="badge bg-success ms-2">
        {discountPercentage}% OFF
      </span>
    );
  };

  // Safe helper functions
  const getAddressString = (order) => {
    if (!order?.items?.[0]?.address) return 'Address not available';
    
    const address = order.items[0].address;
    if (Array.isArray(address)) {
      const addressParts = [
        address[4], // address
        address[7], // city
        address[6], // state
        address[8]  // pinCode
      ].filter(part => part && part.trim() !== '');
      
      return addressParts.join(', ') || 'Address not available';
    }
    return 'Address format not recognized';
  };

  const getCustomerName = (order) => {
    if (!order?.items?.[0]?.address) return 'Customer';
    const address = order.items[0].address;
    if (Array.isArray(address)) {
      return address[0] || 'Customer';
    }
    return 'Customer';
  };

  const getCustomerPhone = (order) => {
    if (!order?.items?.[0]?.address) return 'Phone not available';
    const address = order.items[0].address;
    if (Array.isArray(address)) {
      return address[2] || 'Phone not available';
    }
    return 'Phone not available';
  };

  const getDeliveryTimeInfo = (order) => {
    if (!order?.items?.[0]) return { time: 'N/A', slot: 'N/A', date: 'N/A' };
    
    const firstItem = order.items[0];
    return {
      time: firstItem.foodTime || 'N/A',
      slot: firstItem.foodSlot || 'N/A',
      date: firstItem.date || 'N/A'
    };
  };

  const getFoodItemName = (item) => {
    if (!item) return 'Food Item';

    // If FoodItem object exists
    if (item.FoodItem && typeof item.FoodItem === 'object') {
      const name = item.FoodItem.foodName || item.FoodItem.name || 'Food Item';
      const sub = item.FoodItem.foodSubCategory || '';
      return sub ? `${name} ${sub}` : name;
    }

    // If FoodItem is flat object
    const name = item.foodName || 'Food Item';
    const sub = item.foodSubCategory || '';

    return sub ? `${name} ${sub}` : name;
  };

  const getItemDiscountPercentage = (item) => {
    return parseFloat(item.FoodItem?.discountPercentage || 0);
  };

  if (loading || orderLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading order details...</p>
        <p className="text-muted small">Order ID: {orderId}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <i className="ri-error-warning-line me-2 fs-4"></i>
          <h5>Order Not Found</h5>
          <p className="mb-2">{error || 'The order you are looking for does not exist.'}</p>
          <p className="text-muted small mb-3">Order ID: {orderId}</p>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <button className="btn btn-outline-danger" onClick={() => navigate(-1)}>
              <i className="ri-arrow-left-line me-2"></i>Go Back
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/shop/FoodAndNurition/orders')}>
              <i className="ri-list-check me-2"></i>View All Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const deliveryInfo = getDeliveryTimeInfo(order);
  const orderTotal = getOrderTotal(order);
  const itemsSubtotal = calculateItemsSubtotal(order);
  const deliveryCharges = calculateDeliveryCharges(order);
  const discountPercentage = getOrderDiscount(order);
  const hasDiscount = discountPercentage > 0;
  const customerName = getCustomerName(order);
  const customerPhone = getCustomerPhone(order);
  const addressString = getAddressString(order);
  const hasDeliveryCharges = deliveryCharges > 0;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="ri-arrow-left-line me-2"></i> Back
        </button>
        <h4 className="mb-0 fw-bold">Order Details</h4>
        <div></div>
      </div>

      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body">
          {/* Order Header */}
          <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
            <div>
              <h6 className="text-muted small fw-bold mb-1">ORDER ID</h6>
              <h5 className="text-primary mb-2">#{order._id?.slice(-8).toUpperCase() || 'N/A'}</h5>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {getStatusBadge(order.status)}
                {order.rapid && (
                  <span className="badge bg-warning text-dark">
                    <i className="ri-flashlight-line me-1"></i>Rapid Delivery
                  </span>
                )}
                <span className="badge bg-light text-dark border">
                  {order.orderType || 'Single'}
                </span>
                {hasDiscount && (
                  <DiscountBadge discountPercentage={discountPercentage} />
                )}
              </div>
            </div>
            <div className="text-end">
              <h6 className="text-muted small fw-bold mb-1">TOTAL AMOUNT</h6>
              <h3 className="text-success mb-0">₹{orderTotal.toFixed(2)}</h3>
              {hasDeliveryCharges && (
                <small className="text-muted d-block">
                  Includes ₹{deliveryCharges.toFixed(2)} delivery charges
                </small>
              )}
              <small className="text-muted">{formatDate(order.createdAt)}</small>
            </div>
          </div>

          {/* Order Information */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <h6 className="text-muted mb-3 fw-bold">
                <i className="ri-store-line me-2"></i>RESTAURANT INFORMATION
              </h6>
              <div className="bg-light p-3 rounded">
                <h6 className="fw-bold text-primary mb-2">{order.vendorId?.name || 'Restaurant'}</h6>
                <p className="mb-1 small">
                  <i className="ri-phone-line me-2"></i>
                  {order.vendorId?.phone || 'Phone not available'}
                </p>
                <p className="mb-0 small text-muted">
                  <i className="ri-map-pin-line me-2"></i>
                  {order.vendorId?.address || 'Address not available'}
                </p>
              </div>
            </div>
            
            <div className="col-md-6 mb-3">
              <h6 className="text-muted mb-3 fw-bold">
                <i className="ri-truck-line me-2"></i>DELIVERY INFORMATION
              </h6>
              <div className="bg-light p-3 rounded">
                <p className="mb-2 small">
                  <FaUser className="me-2" /> 
                  <strong>Name:</strong> {customerName}
                </p>
                <p className="mb-2 small">
                  <FaPhone className="me-2" /> 
                  <strong>Phone:</strong> {customerPhone}
                </p>
                <p className="mb-0 small">
                  <FaMapMarkerAlt className="me-2" /> 
                  <strong>Address:</strong> {addressString}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Time */}
          <div className="row mb-4">
            <div className="col-12">
              <h6 className="text-muted mb-3 fw-bold">
                <i className="ri-time-line me-2"></i>DELIVERY SCHEDULE
              </h6>
              <div className="bg-light p-3 rounded">
                <div className="row">
                  <div className="col-md-4">
                    <p className="mb-1"><strong>Date:</strong> {deliveryInfo.date}</p>
                  </div>
                  <div className="col-md-4">
                    <p className="mb-1"><strong>Time:</strong> {deliveryInfo.time}</p>
                  </div>
                  <div className="col-md-4">
                    <p className="mb-0"><strong>Slot:</strong> {deliveryInfo.slot}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <h6 className="text-muted mb-3 fw-bold">
            <i className="ri-restaurant-line me-2"></i>ORDER ITEMS
          </h6>
          {order.items && order.items.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => {
                    const itemDiscount = getItemDiscountPercentage(item);
                    const itemTotal = calculateItemPrice(item);
                    const originalItemTotal = calculateOriginalItemPrice(item);
                    const hasItemDiscount = itemDiscount > 0;
                    
                    return (
                      <tr key={index}>
                        <td>
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <strong>{getFoodItemName(item)}</strong>
                              {hasItemDiscount && (
                                <DiscountBadge discountPercentage={itemDiscount} />
                              )}
                            </div>
                            {item.request && (
                              <div className="text-muted small mb-1">
                                <i className="ri-chat-1-line me-1"></i>
                                {item.request}
                              </div>
                            )}
                            {item.extraItems?.length > 0 && (
                              <div className="text-muted small">
                                <i className="ri-add-circle-line me-1"></i>
                                {item.extraItems.map(e => e.name).join(', ')} 
                                {item.extraItems.some(e => e.price) && (
                                  <span className="ms-1">
                                    (₹{item.extraItems.reduce((sum, e) => sum + (parseFloat(e.price) || 0), 0)})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center align-middle">
                          <span className="badge bg-primary rounded-pill">{item.quantity || 1}</span>
                        </td>
                        <td className="text-end align-middle">
                          {hasItemDiscount ? (
                            <div>
                              <small className="text-decoration-line-through text-muted d-block">
                                ₹{parseFloat(item.FoodItem?.amount || item.amount || 0).toFixed(2)}
                              </small>
                              <span className="text-success">
                                ₹{(parseFloat(item.FoodItem?.amount || item.amount || 0) * (1 - itemDiscount/100)).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            `₹${parseFloat(item.FoodItem?.amount || item.amount || 0).toFixed(2)}`
                          )}
                        </td>
                        <td className="text-end align-middle fw-bold">
                          {hasItemDiscount ? (
                            <div>
                              <small className="text-decoration-line-through text-muted d-block">
                                ₹{originalItemTotal.toFixed(2)}
                              </small>
                              <span className="text-success">₹{itemTotal.toFixed(2)}</span>
                            </div>
                          ) : (
                            `₹${itemTotal.toFixed(2)}`
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <td colSpan="3" className="text-end fw-bold">Items Subtotal:</td>
                    <td className="text-end fw-bold">₹{itemsSubtotal.toFixed(2)}</td>
                  </tr>
                  
                  {hasDeliveryCharges && (
                    <tr>
                      <td colSpan="3" className="text-end fw-bold">
                        <i className="ri-truck-line me-1 text-primary"></i>
                        Delivery Charges:
                      </td>
                      <td className="text-end fw-bold text-primary">
                        +₹{deliveryCharges.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  
                  <tr>
                    <td colSpan="3" className="text-end fw-bold fs-5">Grand Total:</td>
                    <td className="text-end fw-bold fs-5 text-success">₹{orderTotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="alert alert-info text-center">
              <i className="ri-information-line me-2"></i>
              No items found in this order
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center">
        <button className="btn btn-primary me-3 px-4" onClick={() => navigate('/shop/FoodAndNurition')}>
          <i className="ri-restaurant-line me-2"></i>Order Again
        </button>
        <button className="btn btn-outline-secondary me-3 px-4" onClick={() => navigate(-1)}>
          <i className="ri-arrow-left-line me-2"></i>Go Back
        </button>
        <button className="btn btn-outline-primary px-4" onClick={() => navigate('/shop/FoodAndNurition/orders')}>
          <i className="ri-list-check me-2"></i>All Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;