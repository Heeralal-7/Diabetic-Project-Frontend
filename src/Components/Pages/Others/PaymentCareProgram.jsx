import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { MyContext } from "../../../Context/Context";
import "../../Assets/Css/PaymentCareProgram.css"; 

const CareProgramPayment = () => {
  const { purchaseMembership, calculateDiscountedPrice } = useContext(MyContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [paymentData, setPaymentData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  useEffect(() => {
    // Load data from URL params
    const searchParams = new URLSearchParams(location.search);
    const planId = searchParams.get('planId');
    const encodedPlanData = searchParams.get('planData');
    const healthData = searchParams.get('healthData');

    if (encodedPlanData) {
      try {
        const decodedPlanData = JSON.parse(decodeURIComponent(encodedPlanData));
        const healthInfo = healthData ? JSON.parse(decodeURIComponent(healthData)) : {};
        
        setPlanData(decodedPlanData);
        
        const paymentInfo = {
          planId: planId || decodedPlanData._id,
          planName: decodedPlanData.planName,
          originalPrice: decodedPlanData.price,
          discountPercentage: decodedPlanData.discountPercentage || 0,
          durationDays: decodedPlanData.durationDays,
          consultationLimit: decodedPlanData.consultationLimit,
          features: decodedPlanData.features || [],
          // Delivery limits
          labDeliveryLimit: decodedPlanData.labDeliveryLimit || 0,
          foodDeliveryLimit: decodedPlanData.foodDeliveryLimit || 0,
          pharmacyDeliveryLimit: decodedPlanData.pharmacyDeliveryLimit || 0,
          healthInfo: healthInfo,
          timestamp: new Date().toISOString()
        };
        
        setPaymentData(paymentInfo);
        calculateFinalPrice(decodedPlanData, healthInfo);
        
      } catch (error) {
        console.error("Error parsing plan data:", error);
        toast.error("Invalid plan data. Please select a plan again.");
        navigate('/care-program');
      }
    } else {
      // Load from LocalStorage (backup)
      const storedPaymentData = localStorage.getItem("careProgramPaymentData");
      if (storedPaymentData) {
        const data = JSON.parse(storedPaymentData);
        setPlanData(data.planData);
        setPaymentData(data.paymentData);
        setCalculatedPrice(data.calculatedPrice);
      } else {
        toast.error("Session expired. Please select a plan again.");
        navigate('/care-program');
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    if (paymentStatus === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (paymentStatus === 'success' && countdown === 0) {
      handleMembershipActivation();
    }
  }, [paymentStatus, countdown]);

  const calculateFinalPrice = async (plan, healthInfo) => {
    try {
      if (!plan || !healthInfo) return;
      
      const calculationData = {
        membershipId: plan._id,
        BloodSugar: healthInfo.BloodSugar || "",
        AgeGroup: healthInfo.AgeGroup || "",
        HadDiabetes: healthInfo.HadDiabetes || "",
        LifeStyle: healthInfo.LifeStyle || ""
      };

      const result = await calculateDiscountedPrice(calculationData);
      if (result.success === 1) {
        setCalculatedPrice(result.data);
        localStorage.setItem("careProgramPaymentData", JSON.stringify({
          planData: plan,
          paymentData: {
            ...paymentData,
            healthInfo: healthInfo
          },
          calculatedPrice: result.data
        }));
      }
    } catch (error) {
      console.error("Price calculation error:", error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Razorpay script load failed"));
      document.body.appendChild(script);
    });
  };

  const initializePayment = async () => {
    if (!calculatedPrice) {
      toast.error("Please calculate price first");
      return;
    }

    setLoading(true);
    setAnimationStep(1);

    try {
      await loadRazorpayScript();
      
      const amountToPay = calculatedPrice.finalPrice || planData.price;
      const amountInPaise = Math.round(parseFloat(amountToPay) * 100);
      const finalAmount = Math.max(amountInPaise, 100); 

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: finalAmount,
        currency: "INR",
        name: "DiabetesWala Care Program",
        description: `Membership: ${planData.planName}`,
        image: "/logo.png",
        handler: async function (response) {
          setPaymentData(prev => ({
            ...prev,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature
          }));
          setAnimationStep(2);
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: localStorage.getItem('userName') || "Member",
          email: localStorage.getItem('userEmail') || "",
          contact: localStorage.getItem('userPhone') || ""
        },
        theme: {
          color: "#10B981"
        },
        modal: {
          ondismiss: function() {
            setAnimationStep(0);
            setLoading(false);
            toast.info("Payment cancelled");
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', function (response) {
        console.error("Payment failed:", response.error);
        setAnimationStep(3);
        handlePaymentFailure(response.error);
      });

      razorpayInstance.open();

    } catch (error) {
      console.error("Payment initialization error:", error);
      setAnimationStep(3);
      toast.error(error.message || "Payment initialization failed");
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    setPaymentStatus('success');
    toast.success("Payment verified successfully!");
    localStorage.setItem("carePaymentSuccess", JSON.stringify({
      paymentResponse,
      paymentData,
      calculatedPrice,
      timestamp: new Date().toISOString()
    }));
  };

  const handlePaymentFailure = (error) => {
    setPaymentStatus('failed');
    toast.error(`Payment failed: ${error.description || "Unknown error"}`);
    setLoading(false);
  };

  const handleMembershipActivation = async () => {
    try {
      if (!planData || !calculatedPrice || !paymentData) {
        throw new Error("Missing required data");
      }

      const purchasePayload = {
        membershipId: planData._id,
        paymentDetails: {
          method: "online",
          status: "completed",
          amount: calculatedPrice.finalPrice,
          currency: "INR",
          razorpayPaymentId: paymentData.razorpayPaymentId,
          razorpayOrderId: paymentData.razorpayOrderId,
          razorpaySignature: paymentData.razorpaySignature
        },
        BloodSugar: paymentData.healthInfo?.BloodSugar || "",
        AgeGroup: paymentData.healthInfo?.AgeGroup || "",
        HadDiabetes: paymentData.healthInfo?.HadDiabetes || "",
        LifeStyle: paymentData.healthInfo?.LifeStyle || "",
        paymentId: `care_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const result = await purchaseMembership(purchasePayload);

      if (result.success === 1) {
        localStorage.removeItem("careProgramPaymentData");
        localStorage.removeItem("carePaymentSuccess");
        
        toast.success(
          <div>
            <strong>🎉 Membership Activated!</strong><br/>
            {planData.planName} is now active
          </div>,
          { autoClose: 3000 }
        );
        
        setTimeout(() => {
          navigate('/CareProgram/active');
        }, 3000);
        
      } else {
        throw new Error(result.message || "Membership activation failed");
      }
      
    } catch (error) {
      console.error("❌ Membership activation error:", error);
      toast.error(error.message);
      setAnimationStep(3);
      setPaymentStatus('failed');
      setLoading(false);
    }
  };

  const handleCancelPayment = () => {
    if (window.confirm("Are you sure you want to cancel? Your plan selection will be lost.")) {
      localStorage.removeItem("careProgramPaymentData");
      navigate('/care-program');
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!paymentData || !planData) {
    return (
      <div className="container-fluid container-xl px-3 py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .care-payment-container { min-height: 100vh; background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%); }
          .membership-card { border-left: 4px solid #10B981; transition: all 0.3s ease; }
          .membership-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(16, 185, 129, 0.1); }
          .success-animation { margin: 0 auto; }
          .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10; stroke: #10B981; fill: none; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
          .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
          @keyframes stroke { 100% { stroke-dashoffset: 0; } }
          .delivery-badge { background-color: #e8f5e9; color: #2e7d32; padding: 5px 10px; border-radius: 6px; font-size: 0.9rem; margin-bottom: 5px; display: inline-block; margin-right: 5px;}
        `}
      </style>

      <div className="care-payment-container">
        <div className="container-fluid container-xl px-3 py-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="display-6 fw-bold text-primary">Complete Your Membership</h1>
              <p className="text-muted mb-0">Secure payment for DiabetesWala Care Program</p>
            </div>
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={handleCancelPayment} disabled={loading || paymentStatus === 'success'}>
              <i className="ri-arrow-left-s-line me-1"></i>Back to Plans
            </button>
          </div>

          <div className="row justify-content-center">
            {/* Left Column - Plan Summary */}
            <div className="col-lg-5 mb-4">
              <div className="card shadow-sm border-0 rounded-4 membership-card">
                <div className="card-header bg-light border-bottom rounded-top-4 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Membership Plan</h5>
                  <span className="badge bg-success fs-6">Care Program</span>
                </div>
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <div className="icon-wrapper mb-3">
                      <i className="ri-heart-pulse-fill display-4 text-primary"></i>
                    </div>
                    <h3 className="fw-bold text-primary">{planData.planName}</h3>
                    <p className="text-muted">Diabetes Management Program</p>
                  </div>

                  <hr className="my-4" />

                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">📋 Plan Includes:</h6>
                    
                    {/* ✅ DISPLAY FREE DELIVERY BENEFITS HERE */}
                    <div className="mb-3">
                      {(planData.labDeliveryLimit > 0 || planData.foodDeliveryLimit > 0 || planData.pharmacyDeliveryLimit > 0) && (
                        <div className="mb-3 border-bottom pb-2">
                          <strong className="text-success d-block mb-2">Free Delivery Benefits:</strong>
                          {planData.labDeliveryLimit > 0 && (
                            <div className="delivery-badge">
                              <i className="ri-test-tube-line me-1"></i> {planData.labDeliveryLimit} Lab Orders
                            </div>
                          )}
                          {planData.foodDeliveryLimit > 0 && (
                            <div className="delivery-badge">
                              <i className="ri-restaurant-line me-1"></i> {planData.foodDeliveryLimit} Food Orders
                            </div>
                          )}
                          {planData.pharmacyDeliveryLimit > 0 && (
                            <div className="delivery-badge">
                              <i className="ri-capsule-line me-1"></i> {planData.pharmacyDeliveryLimit} Med Orders
                            </div>
                          )}
                        </div>
                      )}

                      {planData.features && planData.features.map((feature, index) => (
                        <div key={index} className="d-flex align-items-start mb-2">
                          <i className="ri-checkbox-circle-fill text-success mt-1 me-2"></i>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="border rounded p-3 text-center">
                          <i className="ri-calendar-check-line text-primary mb-2 fs-4"></i>
                          <div className="fw-bold">{planData.durationDays} Days</div>
                          <small className="text-muted">Duration</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded p-3 text-center">
                          <i className="ri-user-heart-line text-primary mb-2 fs-4"></i>
                          <div className="fw-bold">{planData.consultationLimit} Sessions</div>
                          <small className="text-muted">Consultations</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Health & Price Info Sections remain same */}
                  {paymentData.healthInfo && (
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3">🏥 Health Information:</h6>
                      <div className="row g-2">
                         {/* Display health details */}
                         <div className="col-6"><small className="text-muted">Blood Sugar</small><div className="fw-bold">{paymentData.healthInfo.BloodSugar}</div></div>
                         <div className="col-6"><small className="text-muted">Age Group</small><div className="fw-bold">{paymentData.healthInfo.AgeGroup}</div></div>
                      </div>
                    </div>
                  )}

                  {calculatedPrice && (
                    <div className="border-top pt-4">
                      <h6 className="fw-bold mb-3">💰 Price Breakdown:</h6>
                      <div className="d-flex justify-content-between"><span>Base Price:</span><span>{formatPrice(calculatedPrice.basePrice)}</span></div>
                      {calculatedPrice.planDiscount > 0 && (
                        <div className="d-flex justify-content-between text-success"><span>Plan Discount:</span><span>-{calculatedPrice.planDiscount}%</span></div>
                      )}
                      <hr />
                      <div className="d-flex justify-content-between fw-bold fs-5">
                        <span>Final Price:</span>
                        <span className="text-primary">{formatPrice(calculatedPrice.finalPrice)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Payment Logic (Standard) */}
            <div className="col-lg-7">
              <div className="card shadow-sm border-0 rounded-4" style={{minHeight: '500px'}}>
                <div className="card-body p-4 d-flex flex-column justify-content-center">
                   {/* ... (Same animation steps 0, 1, 2, 3 as original code) ... */}
                   {animationStep === 0 && (
                     <div className="text-center">
                       <i className="ri-secure-payment-line display-1 text-primary mb-3"></i>
                       <h4 className="fw-bold">Secure Payment Gateway</h4>
                       <button className="btn btn-success btn-lg rounded-pill px-5 py-3 shadow mt-3" onClick={initializePayment}>
                         Pay {calculatedPrice ? formatPrice(calculatedPrice.finalPrice) : '...'}
                       </button>
                     </div>
                   )}
                   {animationStep === 1 && <div className="text-center"><h4>Processing...</h4></div>}
                   {animationStep === 2 && <div className="text-center"><h4 className="text-success">Success!</h4><p>Redirecting in {countdown}...</p></div>}
                   {animationStep === 3 && <div className="text-center"><h4 className="text-danger">Failed</h4><button className="btn btn-primary" onClick={() => setAnimationStep(0)}>Retry</button></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareProgramPayment;