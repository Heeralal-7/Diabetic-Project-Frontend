import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const LabPayment = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Payment ID store karne ke liye state
  const [generatedPaymentId, setGeneratedPaymentId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [animationStep, setAnimationStep] = useState(0);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const storedPaymentData = localStorage.getItem("labBookingPaymentData");
    if (storedPaymentData) {
      setPaymentData(JSON.parse(storedPaymentData));
    } else {
      toast.error("Payment data not found. Please start over.");
      navigate('/venders/labs');
    }
  }, [navigate]);

  useEffect(() => {
    if (paymentStatus === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (paymentStatus === 'success' && countdown === 0) {
      handleBookingConfirmation();
    }
  }, [paymentStatus, countdown]);

  const initializePayment = async () => {
    setLoading(true);
    setAnimationStep(1);

    try {
      await loadRazorpayScript();

      const amountInPaise = Math.round(paymentData.finalTotal * 100);
      const finalAmount = Math.max(amountInPaise, 100);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: finalAmount,
        currency: "INR",
        name: "Healthcare App",
        description: "Lab Tests Booking",
        image: "/logo.png",
        handler: async function (response) {
          console.log("Payment success response:", response);
          setAnimationStep(2);
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: paymentData.bookingData.selectedAddress?.name || "Customer",
          email: paymentData.bookingData.selectedAddress?.email || "customer@example.com",
          contact: paymentData.bookingData.selectedAddress?.phone || "9999999999"
        },
        theme: { color: "#3366ff" }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (response) {
        setAnimationStep(3);
        handlePaymentFailure(response.error);
      });

      razorpayInstance.open();

    } catch (error) {
      console.error("Payment init error:", error);
      setAnimationStep(3);
      toast.error(error.message || "Failed to initialize payment");
      setLoading(false);
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

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      setGeneratedPaymentId(paymentResponse.razorpay_payment_id);

      const token = localStorage.getItem('token');
      // Verify API call (Optional depending on your backend)
      await axios.post(
        `${process.env.REACT_APP_API_URL}/razorpay/payment/verify-payment`,
        {
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        },
        { headers: { token: token, "Content-Type": "application/json" } }
      );

      setPaymentStatus('success');
      toast.success("Payment verified successfully!");

    } catch (error) {
      console.warn("Verification failed, but proceeding locally");
      setGeneratedPaymentId(paymentResponse.razorpay_payment_id);
      setPaymentStatus('success');
    }
  };

  const handlePaymentFailure = (error) => {
    console.error("Payment failed:", error);
    setPaymentStatus('failed');
    toast.error(`Payment failed: ${error.description || "Unknown error"}`);
  };

  // Test Payment Helper
  const initializeTestPayment = async () => {
    setLoading(true);
    setAnimationStep(1);
    try {
      await loadRazorpayScript();
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: 100,
        currency: "INR",
        name: "Test Payment",
        handler: function (response) {
          setGeneratedPaymentId(response.razorpay_payment_id || "pay_test_123456");
          setAnimationStep(2);
          setPaymentStatus('success');
        },
        theme: { color: "#3366ff" }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) { setLoading(false); }
  };

  const handleBookingConfirmation = async () => {
    try {
      const token = localStorage.getItem('token');

      const labImageUrl = paymentData.bookingData.lab.image
        ? `${process.env.REACT_APP_API_URL}/${paymentData.bookingData.lab.image}`
        : '/placeholder.png';

      const testIds = paymentData.bookingData.cartItems.map(item => item._id);
      const testNames = paymentData.bookingData.cartItems.map(item => item.testName || item.packageName).join(', ');

      // Base Payload
      const bookingPayload = {
        vendorId: paymentData.vendorId || paymentData.bookingData.lab._id,
        doctorId: paymentData.bookingData.lab.doctorId,
        serviceType: paymentData.bookingData.serviceType || "Lab Test",
        name: paymentData.bookingData.selectedAddress?.name || paymentData.bookingData.selectedAddress?.fullName,
        address: paymentData.bookingData.selectedAddress?.address,
        phone: paymentData.bookingData.selectedAddress?.phone,
        date: paymentData.bookingData.selectedDate,
        price: paymentData.finalTotal,
        test: testIds,
        testName: testNames,
        startime: paymentData.bookingData.selectedSlot?.split(' - ')[0],
        endtime: paymentData.bookingData.selectedSlot?.split(' - ')[1],
        sampleRequired: paymentData.bookingData.cartItems[0]?.sampleRequired || "N/A",
        type: paymentData.bookingData.type,
        gender: paymentData.bookingData.selectedAddress?.gender,
        country: paymentData.bookingData.selectedAddress?.country,
        state: paymentData.bookingData.selectedAddress?.state,
        city: paymentData.bookingData.selectedAddress?.city,
        dob: paymentData.bookingData.selectedAddress?.dob,
        pinCode: paymentData.bookingData.selectedAddress?.pinCode,
        day: paymentData.bookingData.selectedSession,
        image: labImageUrl,
        prescriptionImage: paymentData.bookingData.prescriptionFiles?.[0]?.url || null,
        testId: testIds,
        paymentStatus: "completed",
        paymentId: generatedPaymentId
      };

      // ✅ COUPON LOGIC ADDED HERE
      // Backend expects "couponCode" in body to search and link couponId
      if (paymentData.appliedCoupon) {
        // Try to get code from either property structure
        const cCode = paymentData.appliedCoupon.couponCode || paymentData.appliedCoupon.code || paymentData.appliedCoupon.title;
        bookingPayload.couponCode = cCode; 
        bookingPayload.discountAmount = paymentData.discountAmount;
      } else {
        bookingPayload.couponCode = ""; // Send empty string if no coupon
      }

      // Delivery Charges logic
      if (paymentData.deliveryCalculation) {
        bookingPayload.deliveryCharges = paymentData.deliveryCalculation.totalDelivery;
        bookingPayload.distance = paymentData.deliveryCalculation.distance;
        bookingPayload.freeDeliveryEligible = paymentData.deliveryCalculation.freeDeliveryEligible;
        // Rapid delivery fields
        bookingPayload.isRapidDelivery = paymentData.isRapidDelivery;
        bookingPayload.rapidDeliveryFee = paymentData.deliveryCalculation.rapidDeliveryFee;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/lab-appointment/appointment`,
        bookingPayload,
        { headers: { token: token, "Content-Type": "application/json" } }
      );

      if (response.data.success === 1) {
        localStorage.removeItem("labBookingPaymentData");
        localStorage.removeItem("bookingConfirmationData");

        const storedCart = localStorage.getItem("labCartItems");
        if (storedCart) {
          const cartData = JSON.parse(storedCart);
          delete cartData[paymentData.vendorId];
          localStorage.setItem("labCartItems", JSON.stringify(cartData));
        }

        toast.success('Appointment booked successfully!');

        navigate('/venders/labs/order-success', {
          state: {
            ...paymentData,
            orderResult: response.data,
            orderId: response.data.order?._id || response.data._id,
            paymentId: generatedPaymentId
          }
        });
      } else {
        throw new Error(response.data.message || "Booking failed");
      }
    } catch (error) {
      console.error("Booking confirmation error:", error);
      toast.error(error.message || "Booking confirmation failed.");
    }
  };

  const handleCancelPayment = () => {
    localStorage.removeItem("labBookingPaymentData");
    navigate(-1);
  };

  if (!paymentData) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading payment details...</p>
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
      `}</style>

      <div className="container-fluid container-xl px-3">
        <div className="d-flex align-items-center justify-content-between my-4">
          <h1 className="display-5 fw-bold">Complete Your Payment</h1>
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={handleCancelPayment} disabled={loading}>
            <i className="ri-arrow-left-s-line me-1"></i>Back to Cart
          </button>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-5 mb-4">
            <div className="card shadow-sm border-0 rounded-4 sticky-top" style={{ top: '100px' }}>
              <div className="card-header bg-light border-bottom rounded-top-4">
                <h5 className="mb-0 fw-bold">Payment Summary</h5>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <h6 className="text-primary mb-1">{paymentData.bookingData.lab?.name || "Lab"}</h6>
                  <p className="mb-1 small"><strong>Patient:</strong> {paymentData.bookingData.selectedAddress?.name}</p>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total Amount:</span>
                  <span className="text-success">₹{paymentData.finalTotal}</span>
                </div>
                {/* Debug Button - Remove in production */}
                {/* <button className="btn btn-sm btn-outline-warning mt-3 w-100" onClick={initializeTestPayment}>Test Payment (Fake)</button> */}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0 fw-bold"><i className="ri-shield-check-line me-2"></i>Secure Payment</h5>
              </div>

              <div className="card-body p-4">
                {animationStep === 0 && (
                  <div className="text-center py-4">
                    <i className="ri-wallet-3-line display-1 text-primary mb-3"></i>
                    <h4 className="fw-bold mb-3">Ready to Pay</h4>
                    <button className="btn btn-primary btn-lg rounded-pill px-5 py-3 shadow-lg" onClick={initializePayment} disabled={loading}>
                      {loading ? "Processing..." : `Pay ₹${paymentData.finalTotal}`}
                    </button>
                    <div className="mt-3"><small><a href="#" onClick={initializeTestPayment} style={{textDecoration:'none', color:'#666'}}>Try Test Payment</a></small></div>
                  </div>
                )}

                {animationStep === 1 && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <h4 className="fw-bold">Processing Payment...</h4>
                  </div>
                )}

                {animationStep === 2 && paymentStatus === 'success' && (
                  <div className="text-center py-5">
                    <div className="success-animation mb-4">
                      <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="80" height="80">
                        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#4CAF50" strokeWidth="2" />
                        <path className="checkmark__check" fill="none" stroke="#4CAF50" strokeWidth="2" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                      </svg>
                    </div>
                    <h4 className="fw-bold text-success">Payment Successful!</h4>
                    <p>Redirecting in {countdown} seconds...</p>
                    <button className="btn btn-success mt-3" onClick={handleBookingConfirmation}>Confirm Now</button>
                  </div>
                )}

                {animationStep === 3 && (
                  <div className="text-center py-5">
                    <i className="ri-close-circle-line display-1 text-danger mb-3"></i>
                    <h4 className="fw-bold text-danger">Payment Failed</h4>
                    <button className="btn btn-primary mt-3" onClick={initializePayment}>Try Again</button>
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

export default LabPayment;