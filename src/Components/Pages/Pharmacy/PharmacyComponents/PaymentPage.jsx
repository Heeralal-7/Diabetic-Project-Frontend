import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MyContext } from '../../../../Context/Context';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaClock, FaShoppingBag, 
  FaRupeeSign, FaTag, FaShieldAlt, FaLock, FaSync, 
  FaCheckCircle, FaMedal, FaRocket, FaFilePrescription 
} from 'react-icons/fa';

const PharmacyPaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { confirmOrder } = useContext(MyContext);
  
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
      navigate('/pharmacy/cart');
      return;
    }
    setOrderData(state);
  }, [state, navigate]);

  useEffect(() => {
    if (paymentStatus === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (paymentStatus === 'success' && countdown === 0) {
      handleNavigationToSuccess();
    }
  }, [paymentStatus, countdown]);

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      
      script.onload = () => {
        resolve(true);
      };
      
      script.onerror = () => {
        reject(new Error("Failed to load Razorpay"));
      };
      
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/razorpay/payment/create-order`,
        {
          amount: Math.round(orderData.grandTotal * 100),
          currency: "INR",
          receipt: `pharmacy_order_${Date.now()}`,
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        return response.data.data.id;
      } else {
        throw new Error(response.data.message || "Failed to create Razorpay order");
      }
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
      
      const amountInPaise = Math.round(orderData.grandTotal * 100);
      const finalAmount = Math.max(amountInPaise, 100);

      let razorpayOrderId;
      try {
        razorpayOrderId = await createRazorpayOrder();
      } catch (orderError) {
        console.error("Failed to create Razorpay order, proceeding without order_id:", orderError);
        razorpayOrderId = null;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: finalAmount,
        currency: "INR",
        name: "Healthcare Pharmacy",
        description: "Pharmacy Order Payment",
        image: "/logo.png",
        handler: async function (response) {
          setAnimationStep(2);
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: orderData.address?.split(',')[0] || "Customer",
          email: "customer@example.com",
          contact: orderData.phone || "9999999999"
        },
        notes: {
          order_type: "pharmacy_order",
          vendor_id: orderData.vendorId,
          membership_applied: orderData.membershipApplied || false,
          rapid_delivery: orderData.isRapidDelivery || false
        },
        theme: {
          color: "#3366ff"
        },
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

      if (razorpayOrderId) {
        options.order_id = razorpayOrderId;
      }

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', function (response) {
        setAnimationStep(3);
        setPaymentStatus('failed');
        handlePaymentFailure(response.error);
      });

      razorpayInstance.open();
      
    } catch (error) {
      console.error("Payment initialization error:", error);
      setAnimationStep(3);
      setPaymentStatus('failed');
      toast.error(error.message || "Failed to initialize payment");
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const verifyResponse = await axios.post(
        `${apiUrl}/razorpay/payment/verify-payment`,
        {
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      return verifyResponse.data;
    } catch (error) {
      console.error("Payment verification error:", error);
      throw error;
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      try {
        const verificationResult = await verifyPayment(paymentResponse);

        if (verificationResult.success) {
          const orderResult = await createPharmacyOrder(paymentResponse);
          setOrderResult(orderResult);
          setPaymentStatus('success');
          toast.success("Payment verified and order placed successfully!");
        } else {
          throw new Error("Payment verification failed");
        }
      } catch (verificationError) {
        console.error("Payment verification error:", verificationError);
        const orderResult = await createPharmacyOrder(paymentResponse);
        setOrderResult(orderResult);
        setPaymentStatus('success');
        toast.success("Payment completed! Order placed successfully.");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
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

  // ✅ Updated Function to send paymentId and paymentDetails
  const createPharmacyOrder = async (paymentDetails = null) => {
    try {
      if (!orderData) {
        throw new Error('Order data not found');
      }

      const extraDistanceCharges = orderData.extraDistanceCharges || 
                                  orderData.orderSummary?.extraDistanceCharges || 
                                  orderData.deliveryCalculation?.extraCharges || 0;

      // ✅ Prepare correct payload
      const orderPayload = {
        userId: orderData.userId,
        cartIds: orderData.cartIds,
        address: orderData.address,
        timeSlot: orderData.timeSlot,
        dateSlot: orderData.dateSlot,
        coupon: orderData.couponCode,
        isRapidDelivery: orderData.isRapidDelivery,
        orderSummary: {
          ...orderData.orderSummary,
          extraDistanceCharges: extraDistanceCharges 
        },
        paymentStatus: paymentDetails ? "completed" : "pending",
        paymentMethod: paymentMethod,
        
        // ✅ HERE IS THE FIX: Send paymentId specifically for the schema
        paymentId: paymentDetails ? paymentDetails.razorpay_payment_id : null,
        
        // ✅ Send full payment details object
        paymentDetails: paymentDetails || {},
        
        razorpayPaymentId: paymentDetails?.razorpay_payment_id || null,
        razorpayOrderId: paymentDetails?.razorpay_order_id || null,
        membershipApplied: orderData.membershipApplied || false,
        membershipRemainingDeliveries: orderData.membershipRemainingDeliveries || 0,
        membershipWasApplied: orderData.membershipWasApplied || false,
        
        prescriptionImage: orderData.prescriptionImage || ""
      };

      const orderResult = await confirmOrder(orderPayload);
      
      if (!orderResult) {
        throw new Error('No response from order API');
      }

      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Order creation failed');
      }

      return orderResult;

    } catch (error) {
      console.error('Pharmacy order creation error:', error);
      throw error;
    }
  };

  const handleNavigationToSuccess = () => {
    const storedCart = localStorage.getItem("pharmacyCartItems");
    if (storedCart) {
      localStorage.removeItem("pharmacyCartItems");
    }
    
    const orderId = orderResult?.data?.orderId || 
                   orderResult?.order?._id || 
                   orderResult?.orderId || 
                   `PHARMACY_ORDER_${Date.now()}`;

    navigate('/pharmacy/order-success', { 
      state: {
        ...orderData,
        orderId: orderId,
        paymentId: orderResult?.paymentId || orderResult?.razorpayPaymentId || `PAY_${Date.now()}`,
        orderResult: orderResult,
        paymentMethod: paymentMethod,
        isCod: paymentMethod === 'cod',
        razorpayPaymentId: orderResult?.razorpayPaymentId,
        paymentStatus: 'completed',
        items: orderData.items,
        vendorDetails: orderData.vendorDetails,
        address: orderData.address,
        phone: orderData.phone,
        grandTotal: orderData.grandTotal,
        subTotal: orderData.subTotal,
        deliveryCharges: orderData.deliveryCharges,
        couponDiscount: orderData.couponDiscount,
        tax: orderData.tax,
        rapidDeliveryFee: orderData.rapidDeliveryFee,
        rapidDeliveryDiscount: orderData.rapidDeliveryDiscount || 0,
        isRapidDelivery: orderData.isRapidDelivery,
        timeSlot: orderData.timeSlot,
        dateSlot: orderData.dateSlot,
        distanceInfo: orderData.distanceInfo,
        membershipApplied: orderData.membershipApplied,
        membershipRemainingDeliveries: orderData.membershipRemainingDeliveries,
        membershipDiscount: orderData.membershipDiscount,
        membershipData: orderData.membershipData,
        totalMembershipSavings: (orderData.membershipDiscount || 0) + (orderData.rapidDeliveryDiscount || 0),
        extraDistanceCharges: orderData.extraDistanceCharges || 
                            orderData.orderSummary?.extraDistanceCharges || 
                            orderData.deliveryCalculation?.extraCharges || 0,
        prescriptionImage: orderData.prescriptionImage || ""
      }
    });
  };

  const handleCashOnDelivery = async () => {
    setIsProcessing(true);
    setAnimationStep(1);

    try {
      const orderResult = await createPharmacyOrder();
      setOrderResult(orderResult);
      
      setAnimationStep(2);
      setPaymentStatus('success');
      toast.success("COD order placed successfully!");
      
    } catch (error) {
      console.error('COD Pharmacy Order creation error:', error);
      setAnimationStep(3);
      setPaymentStatus('failed');
      toast.error(error.message || 'Order creation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePaymentClick = () => {
    if (paymentMethod === 'cod') {
      handleCashOnDelivery();
    } else if (paymentMethod === 'razorpay') {
      initializeRazorpayPayment();
    }
  };

  const handleCancelPayment = () => {
    if (isProcessing) {
      if (window.confirm("Are you sure you want to cancel? Your payment is in progress.")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Address not available';
    return address;
  };

  const calculateItemTotal = (item) => {
    const price = parseFloat(item.unitPrice) || parseFloat(item.price) || parseFloat(item.vendorPrice) || 0;
    const quantity = item.quantity || 1;
    return (price * quantity).toFixed(2);
  };

  if (!orderData) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading order details...</p>
      </Container>
    );
  }

  // ... (Rest of your UI render remains the same as provided in your paste)
  return (
    <Container className="py-4 pharmacy-payment-container">
      {/* ... styles and JSX ... */}
      <style>{`
        .success-animation { margin: 0 auto; }
        .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10; stroke: #4CAF50; fill: none; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
        .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        .payment-method-card { transition: all 0.3s ease; border: 2px solid transparent; cursor: pointer; }
        .payment-method-card:hover { border-color: #007bff; transform: translateY(-2px); }
        .payment-method-card.selected { border-color: #007bff; background-color: #f8f9fa; }
        .sticky-top { position: sticky; top: 20px; }
        .pharmacy-payment-container { min-height: 100vh; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); }
        .membership-badge { background: linear-gradient(45deg, #FFD700, #FFA500); color: #000; font-weight: bold; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; }
        .savings-badge { background: linear-gradient(45deg, #28a745, #20c997); color: white; font-weight: bold; padding: 4px 10px; border-radius: 15px; font-size: 0.7rem; }
        .extra-km-badge { background: linear-gradient(45deg, #6c757d, #495057); color: white; font-weight: bold; padding: 4px 10px; border-radius: 15px; font-size: 0.7rem; }
      `}</style>

      <Row className="justify-content-center">
        <Col lg={10}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <Button variant="outline-secondary" size="sm" className="me-3 rounded-pill" onClick={handleCancelPayment} disabled={isProcessing}>
                <FaShoppingBag className="me-1" /> Back to Cart
              </Button>
              <div>
                <h2 className="mb-0 fw-bold text-primary"><FaShieldAlt className="me-2" />Secure Pharmacy Payment</h2>
                <p className="text-muted mb-0">Complete your medicine order payment</p>
              </div>
            </div>
          </div>

          <Row>
            <Col md={5} className="mb-4" style={{ zIndex: 1 }}>
               {/* ... Order Summary Card ... */}
               <Card className="border-0 shadow-sm h-100 rounded-4 sticky-top">
                <Card.Header className="bg-white py-3 rounded-top-4">
                  <h5 className="mb-0 fw-bold"><FaShoppingBag className="me-2" />Order Summary</h5>
                  {orderData.membershipApplied && <span className="membership-badge float-end"><FaMedal className="me-1" /> Membership Applied</span>}
                  {orderData.isRapidDelivery && <span className="badge bg-warning text-dark float-end me-2"><FaRocket className="me-1" /> Rapid Delivery</span>}
                </Card.Header>
                <Card.Body>
                  <div className="mb-4 p-3 bg-light rounded">
                    <h6 className="fw-bold mb-2">Pharmacy</h6>
                    <p className="mb-1 text-primary fw-semibold">{orderData.vendorDetails?.shopName || orderData.vendorName || 'Pharmacy'}</p>
                    <small className="text-muted">{orderData.vendorDetails?.address || orderData.vendorCity || ''}</small>
                  </div>
                  {/* ... Rest of Summary ... */}
                  <div className="d-flex justify-content-between mb-3">
                      <strong className="fs-5">Total Amount:</strong>
                      <strong className="text-primary fs-5">
                        <FaRupeeSign size={14} className="me-1" />
                        {(orderData.grandTotal || 0).toFixed(2)}
                      </strong>
                    </div>
                </Card.Body>
               </Card>
            </Col>

            <Col md={7}>
               {/* ... Payment Options Card (Logic remains the same) ... */}
               {animationStep === 0 && (
                <Card className="border-0 shadow-sm rounded-4 mb-4">
                  <Card.Header className="bg-primary text-white py-3 rounded-top-4">
                    <h5 className="mb-0 fw-bold"><FaLock className="me-2" />Select Payment Method</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-4">
                      <div className={`payment-method-card p-3 border rounded mb-3 ${paymentMethod === 'razorpay' ? 'selected' : ''}`} onClick={() => setPaymentMethod('razorpay')}>
                        <div className="form-check mb-0">
                          <input className="form-check-input" type="radio" name="paymentMethod" id="razorpayPayment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} />
                          <label className="form-check-label d-flex align-items-center w-100" htmlFor="razorpayPayment">
                            <div className="bg-primary rounded p-2 me-3"><FaLock className="text-white fs-4" /></div>
                            <div className="flex-grow-1"><div className="fw-semibold">Credit/Debit Card / UPI / Net Banking</div><small className="text-muted">Secure payment via Razorpay</small></div>
                          </label>
                        </div>
                      </div>
                      <div className={`payment-method-card p-3 border rounded ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')}>
                         <div className="form-check mb-0">
                          <input className="form-check-input" type="radio" name="paymentMethod" id="codPayment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                          <label className="form-check-label d-flex align-items-center w-100" htmlFor="codPayment">
                            <div className="bg-warning rounded p-2 me-3"><FaRupeeSign className="text-white fs-4" /></div>
                            <div><div className="fw-semibold">Cash on Delivery</div><small className="text-muted">Pay when you receive your medicines</small></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    <Button variant="primary" className="w-100 py-3 fw-bold rounded-pill shadow-lg" onClick={handlePaymentClick} disabled={isProcessing} size="lg">
                      {isProcessing ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Processing...</> : <><FaLock className="me-2" />{paymentMethod === 'cod' ? `Confirm COD Order` : `Pay ₹${(orderData.grandTotal || 0).toFixed(2)}`}</>}
                    </Button>
                  </Card.Body>
                </Card>
               )}
               
               {/* ... Processing and Success States ... */}
               {animationStep === 1 && (
                <Card className="border-0 shadow-sm rounded-4"><Card.Body className="text-center py-5"><Spinner animation="border" variant="primary" /><h4 className="mt-3">Processing...</h4></Card.Body></Card>
               )}

               {animationStep === 2 && paymentStatus === 'success' && (
                <Card className="border-0 shadow-sm rounded-4"><Card.Body className="text-center py-5"><h4 className="text-success">Success! Redirecting...</h4></Card.Body></Card>
               )}
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default PharmacyPaymentPage;