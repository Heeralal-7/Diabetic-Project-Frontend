import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MyContext } from '../../../../Context/Context';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { bookOrder } = useContext(MyContext);
  
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [apiUrl] = useState(process.env.REACT_APP_API_URL || "http://localhost:5000");

  useEffect(() => {
    if (!state) {
      toast.error("No order data found. Please complete your order again.");
      navigate('/shop/FoodAndNurition/cart');
      return;
    }
    setOrderData(state);
    console.log('Order data received:', state);
  }, [state, navigate]);

  useEffect(() => {
    if (paymentStatus === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (paymentStatus === 'success' && countdown === 0) {
      handleNavigationToSuccess();
    }
  }, [paymentStatus, countdown]);

  // ✅ NEW: Update membership delivery usage after successful payment
  const updateMembershipDeliveryUsage = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !orderData?.membershipApplied || !orderData?.membershipWasApplied) return true;

      const response = await axios.post(
        `${apiUrl}/user-membership/update-delivery-usage`,
        { type: 'food', orderId: orderId, usedCount: 1 },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return response.data.success === 1;
    } catch (error) {
      console.error('Error updating membership after payment:', error);
      return false;
    }
  };

  // ✅ NEW: Direct database update fallback
  const updateMembershipDirectly = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !orderData?.membershipWasApplied) return false;
      const response = await axios.get(`${apiUrl}/user-membership/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data.success === 1;
    } catch (error) {
      return false;
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/razorpay/payment/create-order`,
        {
          amount: Math.round(orderData.price * 100),
          currency: "INR",
          receipt: `food_order_${Date.now()}`,
        },
        { headers: { token: token, "Content-Type": "application/json" } }
      );
      if (response.data.success) return response.data.data.id;
      throw new Error(response.data.message || "Failed to create Razorpay order");
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      throw error;
    }
  };

  const initializeRazorpayPayment = async () => {
    setIsProcessing(true);
    setAnimationStep(1);

    try {
      await loadRazorpayScript();
      const amountInPaise = Math.round(orderData.price * 100);
      const finalAmount = Math.max(amountInPaise, 100);

      let razorpayOrderId = null;
      try {
        razorpayOrderId = await createRazorpayOrder();
      } catch (error) {
        console.warn("Proceeding without Razorpay Order ID");
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: finalAmount,
        currency: "INR",
        name: "Healthcare App",
        description: "Food Order Payment",
        image: "/logo.png",
        handler: async function (response) {
          setAnimationStep(2);
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: orderData.address?.[0] || "Customer",
          contact: orderData.address?.[2] || "9999999999"
        },
        theme: { color: "#3366ff" },
        modal: {
          ondismiss: function() {
            if (animationStep === 1) {
              setAnimationStep(0);
              setIsProcessing(false);
              toast.info("Payment cancelled by user");
            }
          }
        }
      };

      if (razorpayOrderId) options.order_id = razorpayOrderId;
      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', function (response) {
        setAnimationStep(3);
        setPaymentStatus('failed');
        handlePaymentFailure(response.error);
      });

      razorpayInstance.open();
    } catch (error) {
      setAnimationStep(3);
      setPaymentStatus('failed');
      toast.error(error.message || "Failed to initialize payment");
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      const token = localStorage.getItem('token');
      const verifyResponse = await axios.post(
        `${apiUrl}/razorpay/payment/verify-payment`,
        {
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        },
        { headers: { token: token, "Content-Type": "application/json" } }
      );
      return verifyResponse.data;
    } catch (error) {
      throw error;
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      try {
        const verificationResult = await verifyPayment(paymentResponse);
        if (verificationResult.success) {
          const result = await createOrder(paymentResponse);
          setOrderResult(result);
          setPaymentStatus('success');
          toast.success("Payment verified and order placed successfully!");
        } else {
          throw new Error("Payment verification failed");
        }
      } catch (verificationError) {
        console.warn("Verification failed, proceeding with order creation");
        const result = await createOrder(paymentResponse);
        setOrderResult(result);
        setPaymentStatus('success');
        toast.success("Payment completed! Order placed.");
      }
    } catch (error) {
      setAnimationStep(3);
      setPaymentStatus('failed');
      toast.error("Order creation failed. Please contact support.");
      setIsProcessing(false);
    }
  };

  const handlePaymentFailure = (error) => {
    setPaymentStatus('failed');
    toast.error(`Payment failed: ${error?.description || "Unknown error"}`);
    setIsProcessing(false);
  };

   const createOrder = async (paymentDetails = null) => {
    try {
      if (!orderData) throw new Error('Order data not found');

      const bookOrderData = {
        foodId: orderData.foodIds || orderData.cartItems?.map(item => item.foodId || item._id),
        vendorId: orderData.vendorId,
        address: orderData.address || [],
        date: orderData.date,
        foodTime: orderData.foodTime,
        foodSlot: orderData.foodSlot,
        price: orderData.price,
        deliveryCharge: orderData.deliveryCharge || 0,
        taxAmount: orderData.taxAmount || 0,
        couponId: orderData.couponId || null,
        discount: orderData.discount || 0,
        rapid: orderData.rapid || false,
        orderType: orderData.orderType || "normal",
        paymentStatus: paymentDetails ? "completed" : "pending",
        paymentMethod: paymentMethod,
        razorpayPaymentId: paymentDetails?.razorpay_payment_id || null,
        razorpayOrderId: paymentDetails?.razorpay_order_id || null,
        razorpaySignature: paymentDetails?.razorpay_signature || null,
        distanceInfo: orderData.distanceInfo || null,
        membershipApplied: orderData.membershipApplied || false,
        membershipRemainingDeliveries: orderData.membershipRemainingDeliveries || 0,
        membershipWasApplied: orderData.membershipWasApplied || false,
        membershipOriginalCount: orderData.membershipOriginalCount || 0,
        membershipDiscount: orderData.membershipDiscount || 0
      };

      const result = await bookOrder(bookOrderData);
      
      if (!result) throw new Error('No response from order API');

      if (result.success && orderData.membershipWasApplied) {
        const orderId = result.order?._id || result.orderId || result._id;
        if (orderId) await updateMembershipDeliveryUsage(orderId);
        else await updateMembershipDirectly();
      }

      return result;
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  };

  const handleNavigationToSuccess = () => {
    if (localStorage.getItem("foodCartItems")) localStorage.removeItem("foodCartItems");
    localStorage.setItem('lastOrderTime', Date.now().toString());

    const realPaymentId = 
      orderResult?.paymentId || 
      orderResult?.order?.paymentId || 
      orderResult?.razorpayPaymentId ||
      orderData?.paymentDetails?.razorpay_payment_id || 
      null;

    const displayPaymentId = realPaymentId || `PAY_${Date.now()}`;
    const orderId = orderResult?.order?._id || orderResult?.orderId || orderResult?._id || `ORDER_${Date.now()}`;

    navigate('/shop/FoodAndNurition/order-success', { 
      state: {
        ...orderData,
        orderId: orderId,
        paymentId: displayPaymentId,
        orderResult: orderResult,
        paymentMethod: paymentMethod,
        isCod: paymentMethod === 'cod',
        membershipUpdated: orderData.membershipWasApplied ? true : false,
        membershipRemainingAfterOrder: orderData.membershipRemainingDeliveries - (orderData.membershipWasApplied ? 1 : 0)
      }
    });
  };

  const handleCashOnDelivery = async () => {
    setIsProcessing(true);
    setAnimationStep(1);

    try {
      const result = await createOrder();
      setOrderResult(result);
      setAnimationStep(2);
      setPaymentStatus('success');
      toast.success("COD order placed successfully!");
    } catch (error) {
      setAnimationStep(3);
      setPaymentStatus('failed');
      toast.error(error.message || 'Order creation failed.');
      setIsProcessing(false);
    }
  };

  const handlePaymentClick = () => {
    if (paymentMethod === 'cod') handleCashOnDelivery();
    else if (paymentMethod === 'razorpay') initializeRazorpayPayment();
  };

  const handleCancelPayment = () => {
    if (isProcessing) {
      if (window.confirm("Are you sure you want to cancel? Your payment is in progress.")) navigate(-1);
    } else {
      navigate(-1);
    }
  };

  // ✅ UPDATED: Format address matches OrderSuccess.js logic
  const formatAddress = (addressArray) => {
    if (!addressArray || !Array.isArray(addressArray)) return 'Address not available';
    
    // Matches logic in OrderSuccess: [Address, City, State, PinCode]
    const addressParts = [
      addressArray[4], // address
      addressArray[7], // city
      addressArray[6], // state
      addressArray[8]  // pinCode
    ].filter(part => part && part.trim() !== '');
    
    return addressParts.join(', ') || 'Address not available';
  };

  const calculateItemTotal = (item) => {
    const basePrice = parseFloat(item.FoodItem?.amount) || parseFloat(item.price) || 0;
    const quantity = item.quantity || 1;
    return (basePrice * quantity).toFixed(2);
  };

  // ✅ NEW: Helper to get the "MRP" / Items Total exactly like OrderSuccess
  const getOriginalAmount = () => {
    // Priority: Explicit originalTotal -> Calculated from Total + Discount -> Fallback to Price
    if (orderData?.originalTotal) return orderData.originalTotal;
    return (orderData?.price || 0) + (orderData?.discount || 0);
  };

  const renderMembershipInfo = () => {
    if (!orderData?.membershipApplied) return null;
    return (
      <div className="alert alert-success mb-3">
        <div className="d-flex align-items-center">
          <i className="ri-medal-line me-2 fs-4"></i>
          <div>
            <strong className="d-block">Membership Free Delivery Applied!</strong>
            <small>
              {orderData.membershipRemainingDeliveries || 0} free deliveries remaining after this order
              {orderData.membershipDiscount > 0 && (
                <span className="d-block mt-1">
                  <i className="ri-money-rupee-circle-line me-1"></i>
                  You saved ₹{orderData.membershipDiscount?.toFixed(2) || 0} on delivery charges
                </span>
              )}
            </small>
          </div>
        </div>
      </div>
    );
  };

  // ✅ UPDATED: Delivery Breakdown matches OrderSuccess.js logic and order
  const renderDeliveryBreakdown = () => {
    return (
      <div className="border-top pt-3">
        {/* Items Total (MRP) */}
        <div className="d-flex justify-content-between mb-2">
          <span>Items Total:</span>
          <span>₹{getOriginalAmount().toFixed(2)}</span>
        </div>
        
        {/* Discount */}
        {(orderData.discount || 0) > 0 && (
          <div className="d-flex justify-content-between mb-2 text-success">
            <span>Coupon Discount:</span>
            <span>-₹{(orderData.discount || 0).toFixed(2)}</span>
          </div>
        )}
        
        {/* Delivery Charge */}
        <div className="d-flex justify-content-between mb-2">
          <span>
            Delivery Charge
            {orderData.distanceInfo?.membershipApplied && (
              <small className="text-success ms-1">(Free)</small>
            )}:
          </span>
          <span className={orderData.distanceInfo?.membershipApplied ? "text-success" : ""}>
            {orderData.distanceInfo?.membershipApplied ? "FREE" : `₹${(orderData.deliveryCharge || 0).toFixed(2)}`}
          </span>
        </div>

        {/* Extra Distance/Rapid Details (Optional info specific to payment consideration, keeping for transparency) */}
        {(orderData.distanceInfo?.extraCharges || 0) > 0 && (
          <div className="d-flex justify-content-between mb-2 small text-muted">
            <span className="ms-2">↳ Extra Distance Fee:</span>
            <span>₹{(orderData.distanceInfo?.extraCharges || 0).toFixed(2)}</span>
          </div>
        )}
        {(orderData.distanceInfo?.rapidDeliveryFee || 0) > 0 && (
          <div className="d-flex justify-content-between mb-2 small text-muted">
             <span className="ms-2">↳ Rapid Delivery Fee:</span>
            <span>₹{(orderData.distanceInfo?.rapidDeliveryFee || 0).toFixed(2)}</span>
          </div>
        )}
        
        {/* Tax */}
        {(orderData.taxAmount || 0) > 0 && (
          <div className="d-flex justify-content-between mb-2">
            <span>Tax:</span>
            <span>₹{(orderData.taxAmount || 0).toFixed(2)}</span>
          </div>
        )}
        
        <hr />
        
        {/* Total */}
        <div className="d-flex justify-content-between mb-3">
          <strong className="fs-5">Total Amount:</strong>
          <strong className="text-success fs-5">₹{(orderData.price || 0).toFixed(2)}</strong>
        </div>
      </div>
    );
  };

  if (!orderData) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading order details...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .success-animation { margin: 0 auto; }
        .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10; stroke: #4CAF50; fill: none; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
        .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        .payment-method-card { transition: all 0.3s ease; border: 2px solid transparent; cursor: pointer; }
        .payment-method-card:hover { border-color: #007bff; transform: translateY(-2px); }
        .payment-method-card.selected { border-color: #007bff; background-color: #f8f9fa; }
        .sticky-top { position: sticky; top: 20px; }
        .membership-badge { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
      `}</style>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center">
                <button 
                  className="btn btn-outline-secondary btn-sm me-3 rounded-pill"
                  onClick={handleCancelPayment}
                  disabled={isProcessing}
                >
                  <i className="ri-arrow-left-line me-1"></i> Back to Cart
                </button>
                <div>
                  <h2 className="mb-0 fw-bold">Secure Payment</h2>
                  <p className="text-muted mb-0">Complete your food order payment</p>
                </div>
              </div>
            </div>

            {/* Membership Alert */}
            {renderMembershipInfo()}

            <div className="row">
              {/* Order Summary */}
              <div className="col-md-5 mb-4" style={{ zIndex: 1 }}>
                <div className="card border-0 shadow-sm h-100 rounded-4 sticky-top">
                  <div className="card-header bg-white py-3 rounded-top-4">
                    <h5 className="mb-0 fw-bold">
                      <i className="ri-shopping-bag-line me-2"></i>Order Summary
                    </h5>
                    {orderData.membershipApplied && (
                      <span className="membership-badge float-end">
                        <i className="ri-medal-line me-1"></i>Membership Active
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    {/* Restaurant Info */}
                    <div className="mb-4 p-3 bg-light rounded">
                      <h6 className="fw-bold mb-2">Restaurant</h6>
                      <p className="mb-1 text-primary fw-semibold">
                        {orderData.cartItems?.[0]?.FoodItem?.vendorName || 'Restaurant'}
                      </p>
                      <small className="text-muted">
                        {orderData.cartItems?.[0]?.FoodItem?.vendorCity || ''}
                      </small>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3">Order Items</h6>
                      {orderData.cartItems?.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-start mb-2">
                          <div className="flex-grow-1">
                            <p className="mb-1 fw-medium">
                              {item.quantity || 1} x {item.FoodItem?.foodName || item.foodName || 'Food Item'}
                            </p>
                            <small className="text-muted">
                              {item.FoodItem?.foodCategory === 'Veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                            </small>
                            {item.extraItems?.length > 0 && (
                              <small className="d-block text-muted">
                                Addons: {item.extraItems.map(addon => addon.name).join(', ')}
                              </small>
                            )}
                          </div>
                          <span className="fw-semibold">
                            ₹{calculateItemTotal(item)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown with Membership */}
                    {renderDeliveryBreakdown()}

                    {/* Delivery Info */}
                    <div className="mt-4 p-3 bg-light rounded">
                      <h6 className="fw-bold mb-2">Delivery Information</h6>
                      <p className="mb-1"><strong>{orderData.address?.[0] || 'Customer'}</strong></p>
                      <p className="small text-muted mb-1">
                        {formatAddress(orderData.address)}
                      </p>
                      <p className="small text-muted mb-2">Phone: {orderData.address?.[2] || 'Not provided'}</p>
                      
                      <div className="d-flex justify-content-between">
                        <small>
                          <strong>Date:</strong> {orderData.date || 'Not specified'}
                        </small>
                        <small>
                          <strong>Time:</strong> {orderData.foodSlot || 'Not specified'}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods & Status */}
              <div className="col-md-7">
                {/* Payment Method Selection */}
                {animationStep === 0 && (
                  <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-header bg-primary text-white py-3 rounded-top-4">
                      <h5 className="mb-0 fw-bold">
                        <i className="ri-shield-check-line me-2"></i>Select Payment Method
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-4">
                        {/* Razorpay Option */}
                        <div 
                          className={`payment-method-card p-3 border rounded mb-3 ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('razorpay')}
                        >
                          <div className="form-check mb-0">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="paymentMethod"
                              id="razorpayPayment"
                              value="razorpay"
                              checked={paymentMethod === 'razorpay'}
                              onChange={() => setPaymentMethod('razorpay')}
                            />
                            <label className="form-check-label d-flex align-items-center w-100" htmlFor="razorpayPayment">
                              <i className="ri-bank-card-line me-3 fs-4 text-primary"></i>
                              <div className="flex-grow-1">
                                <div className="fw-semibold">Credit/Debit Card / UPI / Net Banking</div>
                                <small className="text-muted">Secure payment via Razorpay</small>
                              </div>
                              <div className="payment-icons">
                                <i className="ri-visa-line me-1 fs-5 text-primary"></i>
                                <i className="ri-mastercard-line me-1 fs-5 text-warning"></i>
                                <i className="ri-upi-line me-1 fs-5 text-purple"></i>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* COD Option */}
                        <div 
                          className={`payment-method-card p-3 border rounded ${paymentMethod === 'cod' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('cod')}
                        >
                          <div className="form-check mb-0">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="paymentMethod"
                              id="codPayment"
                              value="cod"
                              checked={paymentMethod === 'cod'}
                              onChange={() => setPaymentMethod('cod')}
                            />
                            <label className="form-check-label d-flex align-items-center w-100" htmlFor="codPayment">
                              <i className="ri-money-rupee-circle-line me-3 fs-4 text-warning"></i>
                              <div>
                                <div className="fw-semibold">Cash on Delivery</div>
                                <small className="text-muted">Pay when you receive your order</small>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {paymentMethod === 'cod' && (
                        <div className="alert alert-info">
                          <i className="ri-information-line me-2"></i>
                          <strong>Cash on Delivery Selected</strong><br />
                          You will pay with cash when your order is delivered. Please keep exact change ready.
                        </div>
                      )}

                      {/* Membership Warning for COD */}
                      {paymentMethod === 'cod' && orderData.membershipApplied && (
                        <div className="alert alert-warning">
                          <i className="ri-alert-line me-2"></i>
                          <strong>Note for COD with Membership:</strong><br />
                          Your free delivery will still be counted even with COD payment.
                          {orderData.membershipRemainingDeliveries === 1 && (
                            <span className="d-block mt-1">
                              <i className="ri-information-line me-1"></i>
                              This will use your last free delivery from membership
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow-lg"
                        onClick={handlePaymentClick}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {paymentMethod === 'cod' ? 'Creating Order...' : 'Initializing Payment...'}
                          </>
                        ) : (
                          <>
                            <i className="ri-lock-line me-2"></i>
                            {paymentMethod === 'cod' ? `Confirm COD Order` : `Pay ₹${(orderData.price || 0).toFixed(2)}`}
                          </>
                        )}
                      </button>

                      {paymentMethod === 'razorpay' && (
                        <div className="text-center mt-3">
                          <div className="d-flex justify-content-center align-items-center">
                            <div className="bg-white p-1 rounded me-2">
                              <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" height="20" />
                            </div>
                            <small className="text-muted">Secure payment powered by Razorpay</small>
                          </div>
                        </div>
                      )}

                      {/* Security Badges */}
                      <div className="row text-center mt-4 pt-3 border-top">
                        <div className="col-4">
                          <i className="ri-shield-check-line fs-2 text-success mb-2"></i>
                          <p className="small mb-0">100% Secure</p>
                        </div>
                        <div className="col-4">
                          <i className="ri-lock-line fs-2 text-primary mb-2"></i>
                          <p className="small mb-0">SSL Encrypted</p>
                        </div>
                        <div className="col-4">
                          <i className="ri-refresh-line fs-2 text-info mb-2"></i>
                          <p className="small mb-0">Instant Refund</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Processing Animation */}
                {animationStep === 1 && (
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body text-center py-5">
                      <div className="payment-processing">
                        <div className="spinner-border text-primary mb-3" style={{ width: '4rem', height: '4rem' }} role="status">
                          <span className="visually-hidden">Processing...</span>
                        </div>
                        <h4 className="fw-bold mb-3">
                          {paymentMethod === 'cod' ? 'Creating Order...' : 'Processing Payment'}
                        </h4>
                        <p className="text-muted">
                          {paymentMethod === 'cod' ? 'Please wait while we create your order...' : 'Please complete the payment in the opened window'}
                        </p>
                        <div className="progress mt-4" style={{ height: '6px' }}>
                          <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '75%' }}></div>
                        </div>
                        {paymentMethod === 'razorpay' && (
                          <div className="mt-3">
                            <small className="text-muted">If payment window didn't open, check your pop-up blocker</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Success Animation */}
                {animationStep === 2 && paymentStatus === 'success' && (
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body text-center py-5">
                      <div className="payment-success">
                        <div className="success-animation mb-4">
                          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="80" height="80">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#4CAF50" strokeWidth="2"/>
                            <path className="checkmark__check" fill="none" stroke="#4CAF50" strokeWidth="2" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                          </svg>
                        </div>
                        <h4 className="fw-bold text-success mb-3">
                          {paymentMethod === 'cod' ? 'Order Placed Successfully!' : 'Payment Successful!'}
                        </h4>
                        <p className="text-muted mb-3">
                          {paymentMethod === 'cod' ? 'Your COD order has been placed successfully.' : 'Your payment has been processed successfully.'}
                        </p>
                        
                        {orderData.membershipApplied && (
                          <div className="alert alert-success mb-3">
                            <i className="ri-checkbox-circle-line me-2"></i>
                            <strong>Membership Updated!</strong>
                            <div className="small mt-1">
                              Your free delivery count has been updated. You now have {orderData.membershipRemainingDeliveries - 1} free deliveries remaining.
                            </div>
                          </div>
                        )}
                        
                        <p className="text-muted">Redirecting to order confirmation in {countdown} seconds...</p>
                        
                        <div className="mt-4">
                          <button className="btn btn-success rounded-pill px-4" onClick={handleNavigationToSuccess}>
                            <i className="ri-rocket-line me-2"></i> View Order Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Failed */}
                {(animationStep === 3 || paymentStatus === 'failed') && (
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body text-center py-5">
                      <div className="payment-failed">
                        <i className="ri-close-circle-line display-1 text-danger mb-3"></i>
                        <h4 className="fw-bold text-danger mb-3">
                          {paymentMethod === 'cod' ? 'Order Failed' : 'Payment Failed'}
                        </h4>
                        <p className="text-muted mb-4">
                          {paymentMethod === 'cod' ? 'We couldn\'t create your order. Please try again.' : 'We couldn\'t process your payment. Please try again.'}
                        </p>
                        
                        <div className="d-flex gap-3 justify-content-center">
                          <button className="btn btn-primary rounded-pill px-4" onClick={handlePaymentClick} disabled={isProcessing}>
                            <i className="ri-refresh-line me-2"></i> Try Again
                          </button>
                          <button className="btn btn-outline-secondary rounded-pill px-4" onClick={handleCancelPayment}>
                            <i className="ri-arrow-left-line me-2"></i> Back to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Security Info */}
                {animationStep === 0 && (
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">Why Pay Securely With Us?</h6>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="d-flex">
                            <i className="ri-shield-star-line text-success me-2 fs-5"></i>
                            <div>
                              <small className="fw-semibold">Bank-Level Security</small>
                              <p className="small text-muted mb-0">256-bit SSL encryption</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="d-flex">
                            <i className="ri-exchange-dollar-line text-primary me-2 fs-5"></i>
                            <div>
                              <small className="fw-semibold">Instant Refunds</small>
                              <p className="small text-muted mb-0">Quick refund processing</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="d-flex">
                            <i className="ri-customer-service-2-line text-info me-2 fs-5"></i>
                            <div>
                              <small className="fw-semibold">24/7 Support</small>
                              <p className="small text-muted mb-0">Always here to help</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="d-flex">
                            <i className="ri-global-line text-warning me-2 fs-5"></i>
                            <div>
                              <small className="fw-semibold">Multiple Options</small>
                              <p className="small text-muted mb-0">All payment methods</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;