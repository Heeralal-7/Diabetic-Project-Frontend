import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MyContext } from "../../../Context/Context"; 

const DoctorPayment = () => {
  const { appointment1: appointment } = useContext(MyContext);

  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const navigate = useNavigate();
  
  const [animationStep, setAnimationStep] = useState(0);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const storedPaymentData = localStorage.getItem("doctorBookingPaymentData");
    if (storedPaymentData) {
      setPaymentData(JSON.parse(storedPaymentData));
    } else {
      toast.error("Booking session expired. Please start over.");
      navigate('/doctors');
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
      
      let amountToPay = paymentData.finalAmount;
      if(!amountToPay || amountToPay == 0) amountToPay = paymentData.originalPrice;

      const amountInPaise = Math.round(parseFloat(amountToPay) * 100);
      const finalAmount = Math.max(amountInPaise, 100);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, 
        amount: finalAmount,
        currency: "INR",
        name: "Healthcare App",
        description: "Doctor Consultation Fee",
        image: "/logo.png",
        handler: async function (response) {
          console.log("Payment success response:", response);
          setPaymentData(prev => ({ 
            ...prev, 
            razorpayPaymentId: response.razorpay_payment_id 
          }));
          setAnimationStep(2);
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: paymentData.patientName || "Patient",
          contact: paymentData.patientPhone || "9999999999"
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
      console.error("Payment initialization error:", error);
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
    setPaymentStatus('success');
    toast.success("Payment verified successfully!");
  };

  const handlePaymentFailure = (error) => {
    setPaymentStatus('failed');
    toast.error(`Payment failed: ${error.description}`);
    setLoading(false);
  };

  // 🚨 UPDATED: handleBookingConfirmation with Clinic Status Logic
  // DoctorPayment.jsx में handleBookingConfirmation function

// DoctorPayment.jsx में handleBookingConfirmation

// DoctorPayment.jsx में handleBookingConfirmation

const handleBookingConfirmation = async () => {
  try {
    let bookingPrice = paymentData.finalAmount;
    if (!bookingPrice || bookingPrice == 0 || bookingPrice == "0") {
      bookingPrice = paymentData.originalPrice;
    }

    // 🚨 CHECK IF CLINIC EXISTS
    const hasClinic = !!(paymentData.clinicId);
    
    const appointmentPayload = {
      doctorId: paymentData.doctorId,
      serviceType: paymentData.serviceType || "Consultation",
      date: paymentData.date,
      price: String(bookingPrice),
      startime: paymentData.time,
      type: "Online", 
      day: paymentData.day,
      patientId: paymentData.patientId,
      problemDescription: paymentData.problemDescription,
      age: parseInt(paymentData.age),
      
      // 🚨 STATUS
      status: hasClinic ? "9" : "0",
      
      // 🚨 CLINIC INFO
      ...(paymentData.clinicId && { clinicId: paymentData.clinicId }),
      doctorModelHasClinic: hasClinic, // 🚨 ADD THIS
      
      // Payment info
      couponId: paymentData.couponId || null,
      paymentId: paymentData.razorpayPaymentId || `paid_${Date.now()}`,
      paymentStatus: "completed",
      isPaid: true,
      paymentMethod: "razorpay",

      // Membership flags
      useMembership: false,
      isFreeConsultation: false
    };

    console.log("✅ Payment Payload with doctorModelHasClinic:", {
      doctorModelHasClinic: appointmentPayload.doctorModelHasClinic,
      clinicId: appointmentPayload.clinicId || "None"
    });

    const result = await appointment(appointmentPayload);

    if (result.success === 1) {
      localStorage.removeItem("doctorBookingPaymentData");
      toast.success("Appointment booked successfully!");
      navigate('/Doctors');
    } else {
      throw new Error(result.message || "Booking failed");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    toast.error(`Failed: ${error.message}`);
    setAnimationStep(3); 
    setPaymentStatus('failed');
    setLoading(false);
  }
};

  const handleCancelPayment = () => {
    if (window.confirm("Are you sure you want to cancel?")) {
      localStorage.removeItem("doctorBookingPaymentData");
      navigate(-1);
    }
  };

  if (!paymentData) return <div className="p-5 text-center">Loading...</div>;

  return (
    <>
      <style>{`
        .success-animation { margin: 0 auto; }
        .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10; stroke: #4CAF50; fill: none; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
        .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        
        .clinic-badge {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border-radius: 20px;
          padding: 8px 16px;
          font-weight: bold;
          font-size: 0.875rem;
        }
        .independent-badge {
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          border-radius: 20px;
          padding: 8px 16px;
          font-weight: bold;
          font-size: 0.875rem;
        }
      `}</style>

      <div className="container-fluid container-xl px-3 py-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="display-6 fw-bold">Confirm & Pay</h1>
          <button 
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
            onClick={handleCancelPayment}
            disabled={loading && paymentStatus === 'success'}
          >
            <i className="ri-arrow-left-s-line me-1"></i>Cancel
          </button>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-5 mb-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-light border-bottom rounded-top-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Appointment Summary</h5>
                  {paymentData?.hasDoctorClinic ? (
                    <span className="clinic-badge">
                      <i className="fas fa-hospital me-1"></i>Clinic
                    </span>
                  ) : (
                    <span className="independent-badge">
                      <i className="fas fa-user-md me-1"></i>Independent
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                    <img 
                        src={paymentData.doctorImage || "https://placehold.co/100"} 
                        alt="Doctor" 
                        className="rounded-circle me-3"
                        style={{width: '60px', height: '60px', objectFit: 'cover'}} 
                        onError={(e) => { e.target.src = "https://placehold.co/100" }}
                    />
                    <div>
                        <h6 className="text-primary mb-0">Dr. {paymentData.doctorName}</h6>
                        <small className="text-muted">{paymentData.doctorSpecialist}</small>
                    </div>
                </div>

                {/* Clinic Status Info */}
                {paymentData?.hasDoctorClinic && (
                  <div className="alert alert-info mb-3 p-2">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-hospital text-info me-2"></i>
                      <small>This doctor is associated with a clinic. Appointment status will be 9.</small>
                    </div>
                  </div>
                )}

                <div className="mb-3 pb-3 border-bottom">
                  <div className="row g-2">
                    <div className="col-6">
                        <small className="text-muted d-block">Date</small>
                        <strong>{paymentData.displayDate}</strong>
                    </div>
                    <div className="col-6">
                        <small className="text-muted d-block">Time</small>
                        <strong>{paymentData.time}</strong>
                    </div>
                    <div className="col-12 mt-2">
                        <small className="text-muted d-block">Patient</small>
                        <strong>{paymentData.patientName}</strong>
                    </div>
                    <div className="col-12 mt-2">
                        <small className="text-muted d-block">Appointment Type</small>
                        <strong>
                          {paymentData?.hasDoctorClinic ? "Clinic Consultation" : "Online Consultation"}
                          <span className="ms-2 badge bg-secondary">
                            Status: {paymentData?.appointmentStatus || (paymentData?.hasDoctorClinic ? "9" : "0")}
                          </span>
                        </strong>
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <h6 className="fw-bold mb-2">Payment Details</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Consultation Fee:</span>
                    <span>₹{paymentData.originalPrice}</span>
                  </div>
                  
                  {paymentData.discountAmount > 0 && (
                    <div className="d-flex justify-content-between mb-2">
                      <span>Coupon Discount:</span>
                      <span className="text-success">- ₹{paymentData.discountAmount}</span>
                    </div>
                  )}
                  
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total To Pay:</span>
                    <span className="text-primary">₹{paymentData.finalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card shadow-sm border-0 rounded-4" style={{minHeight: '400px'}}>
              <div className="card-body p-4 d-flex flex-column justify-content-center">
                
                {animationStep === 0 && (
                  <div className="text-center">
                    <i className="ri-secure-payment-line display-1 text-primary mb-3"></i>
                    <h4 className="fw-bold mb-2">Secure Checkout</h4>
                    
                    {/* Status Info */}
                    <div className="alert alert-light mb-4">
                      <div className="d-flex justify-content-center align-items-center">
                        <div className="text-center">
                          <div className="fw-bold mb-1">
                            {paymentData?.hasDoctorClinic ? "Clinic Appointment" : "Online Consultation"}
                          </div>
                          <small className="text-muted">
                            Status: <span className="fw-bold">{paymentData?.appointmentStatus || (paymentData?.hasDoctorClinic ? "9" : "0")}</span>
                          </small>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      className="btn btn-primary btn-lg rounded-pill px-5 py-3 shadow w-100"
                      onClick={initializePayment}
                      disabled={loading}
                    >
                        <span className="fs-5">Pay ₹{paymentData.finalAmount}</span>
                    </button>
                    
                    <div className="mt-4 pt-3 border-top d-flex justify-content-center gap-3 text-muted">
                        <small><i className="ri-shield-check-line"></i> SSL Secure</small>
                        <small><i className="ri-bank-card-line"></i> All Cards Accepted</small>
                    </div>
                  </div>
                )}

                {animationStep === 1 && (
                  <div className="text-center">
                    <div className="spinner-border text-primary mb-4" style={{ width: '4rem', height: '4rem' }} role="status"></div>
                    <h4 className="fw-bold">Processing Payment</h4>
                    <p className="text-muted">Please do not close this window...</p>
                    <div className="alert alert-info mt-3">
                      <small>
                        <i className="ri-information-line me-1"></i>
                        Appointment will be created with status: 
                        <strong> {paymentData?.appointmentStatus || (paymentData?.hasDoctorClinic ? "9" : "0")}</strong>
                      </small>
                    </div>
                  </div>
                )}

                {animationStep === 2 && paymentStatus === 'success' && (
                  <div className="text-center">
                     <div className="success-animation mb-4">
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="80" height="80">
                          <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#4CAF50" strokeWidth="2"/>
                          <path className="checkmark__check" fill="none" stroke="#4CAF50" strokeWidth="2" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                      </div>
                    <h4 className="fw-bold text-success">Payment Successful!</h4>
                    <div className="alert alert-success mt-3">
                      <p className="mb-1">
                        <i className="ri-checkbox-circle-line me-1"></i>
                        Amount: <strong>₹{paymentData.finalAmount}</strong> paid successfully
                      </p>
                      <p className="mb-0">
                        <i className="ri-hospital-line me-1"></i>
                        Status: <strong>{paymentData?.appointmentStatus || (paymentData?.hasDoctorClinic ? "9" : "0")}</strong>
                      </p>
                    </div>
                    <p className="text-muted">Confirming appointment in {countdown} seconds...</p>
                  </div>
                )}

                {animationStep === 3 && (
                  <div className="text-center">
                    <i className="ri-error-warning-line display-1 text-danger mb-3"></i>
                    <h4 className="fw-bold text-danger">Payment Failed</h4>
                    <p className="text-muted mb-4">Something went wrong. Please try again.</p>
                    <button className="btn btn-primary rounded-pill px-4" onClick={() => { setAnimationStep(0); setLoading(false); }}>
                      Try Again
                    </button>
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

export default DoctorPayment;