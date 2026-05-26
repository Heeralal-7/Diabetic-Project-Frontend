import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { MyContext } from "../../../Context/Context";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// --- Custom Hook for Vendor-Specific Cart ---
const useVendorCart = (vendorId) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!vendorId) return;
    const storedCart = localStorage.getItem("labCartItems");
    const cartData = storedCart ? JSON.parse(storedCart) : {};
    const items = cartData[vendorId] || [];
    setCartItems(prev => JSON.stringify(prev) !== JSON.stringify(items) ? items : prev);
  }, [vendorId]);

  const clearCart = () => {
    setCartItems([]);
    const storedCart = localStorage.getItem("labCartItems");
    const cartData = storedCart ? JSON.parse(storedCart) : {};
    delete cartData[vendorId];
    localStorage.setItem("labCartItems", JSON.stringify(cartData));
  };

  return { cartItems, clearCart };
};

const calculateDiscountedPrice = (amount, discountPercentage) => {
  const finalAmount = Number(amount);
  const discount = Number(discountPercentage);
  if (isNaN(finalAmount) || finalAmount <= 0) return finalAmount || 0;
  if (isNaN(discount) || discount < 0 || discount > 100) return finalAmount;
  return Math.round(finalAmount * (1 - discount / 100));
};

const formatDistance = (distance) => {
  if (!distance || distance === 0) return "0 km";
  if (distance < 1) return `${Math.round(distance * 1000)} m`;
  if (distance < 10) return `${distance.toFixed(1)} km`;
  return `${Math.round(distance)} km`;
};

const formatExtraDistance = (extraDistance) => {
  if (!extraDistance || extraDistance === 0) return "0 km";
  return `${extraDistance.toFixed(1)} km`;
};

const LabTestCart = () => {
  const { getVendor, fetchUserLabDeliveryCharges, calculateLabDeliveryCharges } = useContext(MyContext);
  const navigate = useNavigate();
  const location = useLocation();

  // --- State ---
  const [bookingData, setBookingData] = useState(null);
  const [vendorLocation, setVendorLocation] = useState(null);
  const [labDeliveryCharges, setLabDeliveryCharges] = useState(null);
  
  // --- New State for Test Selection ---
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());

  const [baseCartTotal, setBaseCartTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [priceAfterDiscount, setPriceAfterDiscount] = useState(0); 
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  
  const [couponLoadingLocal, setCouponLoadingLocal] = useState(false);
  const [couponErrorLocal, setCouponErrorLocal] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState(null);

  const [membershipData, setMembershipData] = useState({
    hasActiveMembership: false,
    isFreeDelivery: false,
    remainingDeliveries: 0,
    message: ""
  });
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [deliveryCalculation, setDeliveryCalculation] = useState(null);
  
  const lastDeliveryCalcInputsRef = useRef('');
  const isCalculatingRef = useRef(false);

  const [isRapidDelivery, setIsRapidDelivery] = useState(false);
  const [isRapidDeliveryFree, setIsRapidDeliveryFree] = useState(false);

  const getVendorId = useCallback(() => {
    const urlParams = new URLSearchParams(location.search);
    const vendorIdFromUrl = urlParams.get('vendorId');
    if (vendorIdFromUrl) return vendorIdFromUrl;
    if (bookingData?.lab?._id) return bookingData.lab._id;
    return null;
  }, [location.search, bookingData]);

  const vendorId = getVendorId();
  const { cartItems, clearCart } = useVendorCart(vendorId);

  // --- Toggle Selection Handler ---
  const handleToggleItem = (itemId) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // --- Calculations (Only for Selected Items) ---
  const calculatedTotal = useMemo(() => {
    if (!bookingData?.cartItems) return 0;
    return bookingData.cartItems.reduce((acc, item) => {
      // Only add to total if the item is in the selected set
      if (selectedItemIds.has(item._id)) {
        return acc + calculateDiscountedPrice(item.amount, item.discountPercentage);
      }
      return acc;
    }, 0);
  }, [bookingData?.cartItems, selectedItemIds]);

  useEffect(() => {
    setBaseCartTotal(calculatedTotal);
  }, [calculatedTotal]);

  const checkMembershipForLabDelivery = useCallback(async () => {
    try {
      setCheckingMembership(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setMembershipData({ hasActiveMembership: false, isFreeDelivery: false, remainingDeliveries: 0, message: "Please login" });
        return;
      }

      const response = await axios.post(
        `${API_URL}/user-membership/check-delivery`,
        { type: 'lab' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success === 1) {
        setMembershipData(response.data.data);
      } else {
        setMembershipData({ hasActiveMembership: false, isFreeDelivery: false, remainingDeliveries: 0, message: response.data.message });
      }
    } catch (error) {
      console.error('Lab membership check failed:', error);
    } finally {
      setCheckingMembership(false);
    }
  }, []);

  const checkRapidDeliveryFreeEligibility = useCallback(() => {
    const shouldBeFree = (
      membershipData.hasActiveMembership &&
      membershipData.isFreeDelivery &&
      membershipData.remainingDeliveries > 0
    );
    setIsRapidDeliveryFree(shouldBeFree);
    return shouldBeFree;
  }, [membershipData]);

  const fetchVendorLoc = useCallback(async (vId) => {
    try {
        if (!vId) return null;
        if (typeof getVendor === 'function') {
            const vData = await getVendor(vId);
            if (vData) {
                if (vData.location && vData.location.coordinates) {
                    return { latitude: parseFloat(vData.location.coordinates[1]), longitude: parseFloat(vData.location.coordinates[0]) };
                } else if (vData.latitude && vData.longitude) {
                    return { latitude: parseFloat(vData.latitude), longitude: parseFloat(vData.longitude) };
                }
            }
        }
        return { latitude: 30.7361847, longitude: 76.6647038 };
    } catch (e) {
        return { latitude: 30.7361847, longitude: 76.6647038 };
    }
  }, [getVendor]);

  const calculateDeliveryCharges = useCallback(async (subtotal, vLocation, uLocation, memData, chargesConfig) => {
    // If no items selected (subtotal 0), we might still calculate distance but charges might vary
    if (!vLocation || !uLocation || !chargesConfig) {
        return {
          baseDelivery: 0, rapidDeliveryFee: 0, totalDelivery: 0, distance: 0, distanceText: '0 km',
          freeRadiusUsed: false, extraDistance: 0, extraCharges: 0, freeDeliveryEligible: false,
          membershipApplied: false, membershipDiscount: 0, rapidFreeApplied: false, totalMembershipDiscount: 0
        };
    }

    const isRapidFree = checkRapidDeliveryFreeEligibility();
    const currentCalcKey = `${subtotal}-${uLocation.latitude}-${uLocation.longitude}-${isRapidDelivery}-${memData.isFreeDelivery}-${isRapidFree}`;
    
    if (isCalculatingRef.current) return;
    if (lastDeliveryCalcInputsRef.current === currentCalcKey && deliveryCalculation) return;

    try {
      isCalculatingRef.current = true;
      setCalculatingDelivery(true);
      setDeliveryError(null);
      
      let result = {};
      
      if (typeof calculateLabDeliveryCharges === "function") {
        const calculationData = {
          userLocation: uLocation,
          vendorLocation: vLocation,
          cartTotal: subtotal,
          deliverySettings: chargesConfig,
          isRapidDelivery: isRapidDelivery
        };
        
        result = await calculateLabDeliveryCharges(calculationData);
        if (result.distance) result.distanceText = formatDistance(result.distance);
        
        if (result.distance && chargesConfig.freeDeliveryRadius && result.extraCharges === undefined) {
          const freeRadius = chargesConfig.freeDeliveryRadius || 10;
          const perKmCharge = chargesConfig.perKmCharge || 5;
          if (result.distance > freeRadius) {
            result.extraDistance = parseFloat((result.distance - freeRadius).toFixed(1));
            result.extraCharges = Math.round(result.extraDistance * perKmCharge);
            result.freeRadiusUsed = false;
          } else {
            result.extraDistance = 0; result.extraCharges = 0; result.freeRadiusUsed = true;
          }
        }
      } else {
        // Fallback Logic
        const freeDeliveryRadius = chargesConfig.freeDeliveryRadius || 10;
        const perKmCharge = chargesConfig.perKmCharge || 5;
        const baseDeliveryCharge = chargesConfig.baseDeliveryCharge || 50;
        const freeDeliveryThreshold = chargesConfig.freeDeliveryThreshold || 599;
        const rapidDeliveryCharge = chargesConfig.rapidDeliveryCharge || 100;
        
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; 
        const lat1 = uLocation.latitude; const lon1 = uLocation.longitude;
        const lat2 = vLocation.latitude; const lon2 = vLocation.longitude;
        const dLat = toRad(lat2 - lat1); const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = parseFloat((R * c).toFixed(1));
        
        let baseDelivery = subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryCharge;
        let extraDistance = distance > freeDeliveryRadius ? parseFloat((distance - freeDeliveryRadius).toFixed(1)) : 0;
        let extraCharges = Math.round(extraDistance * perKmCharge);
        let rapidDeliveryFee = isRapidDelivery ? rapidDeliveryCharge : 0;
        
        result = {
          baseDelivery, rapidDeliveryFee, totalDelivery: baseDelivery + extraCharges + rapidDeliveryFee,
          distance, distanceText: formatDistance(distance), freeRadiusUsed: distance <= freeDeliveryRadius,
          extraDistance, extraCharges, freeDeliveryEligible: subtotal >= freeDeliveryThreshold,
          distanceCalculationType: 'fallback'
        };
      }
      
      let finalResult = { ...result };
      let membershipDiscount = 0;
      let rapidDiscount = 0;
      let extraChargesAfterMembership = finalResult.extraCharges || 0;
      
      if (memData.isFreeDelivery && memData.remainingDeliveries > 0) {
        membershipDiscount = result.baseDelivery;
        finalResult.originalBaseDelivery = result.baseDelivery;
        finalResult.baseDelivery = 0;
      } else {
        finalResult.originalBaseDelivery = result.baseDelivery;
      }
      
      if (isRapidDelivery && isRapidFree) {
        rapidDiscount = result.rapidDeliveryFee || 0;
        finalResult.originalRapidDeliveryFee = result.rapidDeliveryFee || 0;
        finalResult.rapidDeliveryFee = 0;
      } else {
        finalResult.originalRapidDeliveryFee = result.rapidDeliveryFee || 0;
      }
      
      finalResult.totalDelivery = finalResult.baseDelivery + extraChargesAfterMembership + finalResult.rapidDeliveryFee;
      
      finalResult.membershipApplied = memData.isFreeDelivery && memData.remainingDeliveries > 0;
      finalResult.rapidFreeApplied = isRapidDelivery && isRapidFree;
      finalResult.membershipDiscount = membershipDiscount;
      finalResult.rapidDiscount = rapidDiscount;
      finalResult.totalMembershipDiscount = membershipDiscount + rapidDiscount;
      finalResult.membershipRemainingDeliveries = memData.remainingDeliveries;
      finalResult.perKmCharge = chargesConfig.perKmCharge || 5;
      finalResult.freeDeliveryRadius = chargesConfig.freeDeliveryRadius || 10;
      
      // Safety checks
      finalResult.baseDelivery = finalResult.baseDelivery || 0;
      finalResult.rapidDeliveryFee = finalResult.rapidDeliveryFee || 0;
      finalResult.extraCharges = extraChargesAfterMembership || 0;
      finalResult.totalDelivery = finalResult.totalDelivery || 0;
      finalResult.distanceText = finalResult.distanceText || '0 km';
      
      setDeliveryCalculation(finalResult);
      lastDeliveryCalcInputsRef.current = currentCalcKey;
      return finalResult;
      
    } catch (error) {
      console.error('Lab Delivery calculation failed:', error);
      setDeliveryError("Standard lab delivery rates applied due to calculation error.");
      const fallbackResult = {
        baseDelivery: 50, rapidDeliveryFee: isRapidDelivery ? 100 : 0, totalDelivery: isRapidDelivery ? 150 : 50,
        distance: 0, distanceText: "Not available", freeRadiusUsed: false, extraDistance: 0, extraCharges: 0,
        freeDeliveryEligible: false, membershipApplied: false, membershipDiscount: 0, rapidFreeApplied: false,
        totalMembershipDiscount: 0, distanceCalculationType: 'error_fallback', perKmCharge: 5, freeDeliveryRadius: 10
      };
      setDeliveryCalculation(fallbackResult);
      return fallbackResult;
    } finally {
      setCalculatingDelivery(false);
      isCalculatingRef.current = false;
    }
  }, [calculateLabDeliveryCharges, isRapidDelivery, checkRapidDeliveryFreeEligibility, deliveryCalculation]);

  const handleRapidDeliveryChange = (e) => {
    setIsRapidDelivery(e.target.checked);
  };

  useEffect(() => {
    if (initialized) checkRapidDeliveryFreeEligibility();
  }, [membershipData, initialized, checkRapidDeliveryFreeEligibility]);

  // --- Initialization ---
  useEffect(() => {
    if (initialized) return;

    const initialize = async () => {
      const urlParams = new URLSearchParams(location.search);
      const dataFromUrl = urlParams.get('bookingData');
      const dataFromStorage = localStorage.getItem("bookingConfirmationData");

      let data = null;
      if (dataFromUrl) {
          try { data = JSON.parse(decodeURIComponent(dataFromUrl)); } catch(e){ console.error(e); }
      } else if (dataFromStorage) {
          try { data = JSON.parse(dataFromStorage); } catch(e){ console.error(e); }
      }

      if (!data && vendorId) {
          data = {
            cartItems: [],
            lab: { _id: vendorId, name: "Lab Details" },
            selectedDate: new Date().toISOString().split('T')[0],
            selectedSession: "Morning",
            selectedSlot: "09:00 - 10:00",
            selectedAddress: {},
            type: 0
          };
      }

      if (!data) {
          navigate('/venders/labs');
          return;
      }
      
      if((!data.cartItems || data.cartItems.length === 0) && cartItems.length > 0) {
          data.cartItems = cartItems;
      }

      // **IMPORTANT**: Initialize selected items to ALL items by default
      if (data.cartItems && data.cartItems.length > 0) {
          const allIds = new Set(data.cartItems.map(item => item._id));
          setSelectedItemIds(allIds);
      }

      if (data.type !== undefined && data.type !== null) {
          data.type = Number(data.type);
          if (isNaN(data.type)) data.type = 0;
      } else {
          data.type = 0;
      }

      setBookingData(data);

      let charges = null;
      try {
        if (typeof fetchUserLabDeliveryCharges === "function") {
            charges = await fetchUserLabDeliveryCharges();
        } 
        if(!charges) {
             const token = localStorage.getItem('token');
             const res = await axios.get(`${API_URL}/admin-lab-delivery-charges/getforUser`, { headers: { token }});
             if(res.data.success) charges = res.data.data;
        }
      } catch(e) { console.error(e); }
      
      const safeCharges = charges || {
          baseDeliveryCharge: 50, freeDeliveryThreshold: 599, freeDeliveryRadius: 10, perKmCharge: 5, rapidDeliveryCharge: 100
      };
      setLabDeliveryCharges(safeCharges);

      await checkMembershipForLabDelivery();

      if(data.lab?._id) {
          const loc = await fetchVendorLoc(data.lab._id);
          setVendorLocation(loc);
      }

      checkRapidDeliveryFreeEligibility();
      setInitialized(true);
    };

    initialize();
    // eslint-disable-next-line
  }, [initialized]);

  // --- Trigger Calculation ---
  useEffect(() => {
    if (!initialized || !bookingData || !labDeliveryCharges || !vendorLocation) return;

    const userLoc = {
      latitude: bookingData.selectedAddress?.latitude || 30.7333,
      longitude: bookingData.selectedAddress?.longitude || 76.7794
    };

    const currentInputsKey = JSON.stringify({
      baseCartTotal, vendorLocation, userLocation: userLoc, 
      membershipData, labDeliveryCharges, isRapidDelivery, isRapidDeliveryFree
    });

    if (lastDeliveryCalcInputsRef.current === currentInputsKey && deliveryCalculation) return;

    const runCalculation = async () => {
      try {
        await calculateDeliveryCharges(baseCartTotal, vendorLocation, userLoc, membershipData, labDeliveryCharges);
        lastDeliveryCalcInputsRef.current = currentInputsKey;
      } catch (error) {
        console.error(error);
      }
    };
    runCalculation();

  }, [
    baseCartTotal, initialized, membershipData, vendorLocation, labDeliveryCharges,
    calculateDeliveryCharges, isRapidDelivery, isRapidDeliveryFree, deliveryCalculation,
    bookingData?.selectedAddress?.latitude, bookingData?.selectedAddress?.longitude
  ]);

  // --- Final Total (UPDATED LOGIC: Discount First, Then Delivery) ---
  useEffect(() => {
    if (baseCartTotal !== null) {
      const delivery = deliveryCalculation?.totalDelivery || 0;
      
      // 1. Discount is applied to the Cart Total only
      const maxDiscount = Math.min(discountAmount, baseCartTotal);
      const subtotalAfterDiscount = Math.max(0, baseCartTotal - maxDiscount);
      
      setPriceAfterDiscount(subtotalAfterDiscount);
      
      // 2. Delivery is added to the already discounted price
      const total = subtotalAfterDiscount + delivery;
      
      setFinalTotal(total);
    }
  }, [baseCartTotal, deliveryCalculation, discountAmount]);

  // --- Coupons ---
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!vendorId) return;
      setCouponLoadingLocal(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/user-coupons/get-coupon`,
          { params: { id: String(vendorId).trim() }, headers: { token } }
        );
        if (response?.data?.success === 1) {
          setAvailableCoupons(response?.data?.data || []);
        }
      } catch (err) { setCouponErrorLocal("Failed to load coupons"); } 
      finally { setCouponLoadingLocal(false); }
    };
    fetchCoupons();
  }, [vendorId]);

  // --- Apply Coupon (UPDATED to handle percentageDiscount) ---
  const handleApplyCoupon = () => {
    setCouponErrorLocal(null);
    if (!couponCode) { setCouponErrorLocal("Please enter a coupon code."); return; }

    const matched = availableCoupons.find(c => {
      const code = c.code || c.couponCode || c.title || "";
      return code.trim().toLowerCase() === couponCode.trim().toLowerCase();
    });

    if (!matched) { setCouponErrorLocal("Invalid coupon code."); return; }

    const minVal = Number(matched.minCartValue || 0);
    if (baseCartTotal < minVal) { setCouponErrorLocal(`Min cart value ₹${minVal} required.`); return; }

    let discount = 0;
    
    // Check for both parameter styles
    const pct = Number(matched.percentageDiscount || matched.discountPercentage || 0);
    const amt = Number(matched.fixedAmountDiscount || matched.amount || 0);
    const max = Number(matched.maxDiscount || 0);

    if (pct > 0) discount = Math.round((baseCartTotal * pct) / 100);
    else if (amt > 0) discount = amt;

    if (max > 0 && discount > max) discount = max;
    if (discount > baseCartTotal) discount = baseCartTotal;

    setAppliedCoupon(matched);
    setDiscountAmount(discount);
    toast.success(`Coupon applied! You saved ₹${discount}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null); setCouponCode(""); setDiscountAmount(0); setCouponErrorLocal(null);
  };

  const handleBookAppointment = async () => {
    if (!bookingData) {
      setBookingError("Booking data is missing. Cannot proceed.");
      return;
    }

    // **Check: Must select at least one test**
    if (selectedItemIds.size === 0) {
      setBookingError("Please select at least one test to proceed.");
      toast.error("Please select at least one test to proceed.");
      return;
    }

    try {
        setIsBooking(true);
        setBookingError(null);

        // Filter: Only include selected items in the final order
        const selectedCartItems = bookingData.cartItems.filter(item => selectedItemIds.has(item._id));

        let updatedRemainingDeliveries = membershipData.remainingDeliveries;
        let membershipWasApplied = false;
        let rapidWasFree = false;
        
        if (membershipData.isFreeDelivery && membershipData.remainingDeliveries > 0) {
          membershipWasApplied = true;
          if (isRapidDelivery && isRapidDeliveryFree) rapidWasFree = true;
          updatedRemainingDeliveries = membershipData.remainingDeliveries - 1;
          
          setMembershipData(prev => ({
            ...prev,
            remainingDeliveries: updatedRemainingDeliveries,
            isFreeDelivery: updatedRemainingDeliveries > 0,
            message: updatedRemainingDeliveries > 0 
              ? `Free lab delivery applied! (${updatedRemainingDeliveries} deliveries remaining)` 
              : "Lab membership delivery limit reached"
          }));
        }

        const paymentData = {
          bookingData, vendorId, baseCartTotal, finalTotal,
          deliveryCalculation, appliedCoupon, discountAmount,
          priceAfterDiscount, // Added for payment page logic
          cartItems: selectedCartItems, // Only pass selected items
          isRapidDelivery, rapidWasFree,
          membershipApplied: membershipData.isFreeDelivery,
          membershipRemainingDeliveries: updatedRemainingDeliveries,
          membershipWasApplied: membershipWasApplied,
          membershipDiscount: deliveryCalculation?.totalMembershipDiscount || 0,
          extraDistance: deliveryCalculation?.extraDistance || 0,
          extraCharges: deliveryCalculation?.extraCharges || 0,
          perKmCharge: deliveryCalculation?.perKmCharge || 5,
          extraChargesCalculation: deliveryCalculation?.extraDistance > 0 ? 
            `${formatExtraDistance(deliveryCalculation.extraDistance)} × ₹${deliveryCalculation.perKmCharge}/km = ₹${deliveryCalculation.extraCharges}` : 
            "No extra distance charges"
        };

        localStorage.setItem("labBookingPaymentData", JSON.stringify(paymentData));
        navigate('/venders/labs/payment');

    } catch (error) {
        console.error("Error during handleBookAppointment:", error);
        setBookingError("An unexpected error occurred. Please try again.");
        setIsBooking(false);
    }
  };

  const handleCancelBooking = () => {
    if (vendorId) clearCart();
    localStorage.removeItem("bookingConfirmationData");
    navigate('/venders/labs');
  };

  if (!bookingData) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading lab booking details...</p>
      </div>
    );
  }

  const isValidType = bookingData.type !== undefined && bookingData.type !== null && [0, 1].includes(Number(bookingData.type));
  // **Disabled Logic**: Disabled if NO items are selected. (Time slot check is removed)
  const isBookButtonDisabled = isBooking || bookingSuccess || !isValidType || calculatingDelivery || selectedItemIds.size === 0;

  return (
    <>
      <div className="container-fluid container-xl px-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb bg-transparent mb-3">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/venders/labs">Labs</Link></li>
            <li className="breadcrumb-item"><Link to={`/venders/labs/Lab-details/${vendorId || bookingData.lab._id}`}>Lab Details</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Booking Confirmation</li>
          </ol>
        </nav>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="display-5 fw-bold">Confirm Your Lab Appointment</h1>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleCancelBooking}>
              <i className="ri-close-line me-1"></i>Cancel Booking
            </button>
            <Link to="/venders/labs" className="btn btn-outline-primary btn-sm rounded-pill px-3">
              <i className="ri-arrow-left-s-line me-1"></i>Back to Labs
            </Link>
          </div>
        </div>
      </div>

      {bookingSuccess && (
        <div className="container mt-4">
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <i className="ri-check-circle-line fs-3 me-3"></i>
            <div>
              <h4 className="alert-heading mb-0">Appointment Booked Successfully!</h4>
              <p className="mb-0">Your appointment has been confirmed. You will be redirected shortly.</p>
            </div>
          </div>
        </div>
      )}

      {bookingError && (
        <div className="container mt-4">
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="ri-error-warning-line fs-3 me-3"></i>
            <div>
              <h4 className="alert-heading mb-0">Booking Failed!</h4>
              <p className="mb-0">{bookingError}</p>
            </div>
          </div>
        </div>
      )}

      {vendorId && (
        <div className="container mt-3">
          <div className="alert alert-info d-flex align-items-center">
            <i className="ri-hospital-line me-2"></i>
            <div>
              <strong>Booking for: </strong> {bookingData.lab?.name || "Selected Lab"} 
              {cartItems.length > 0 && <span className="ms-2 badge bg-primary">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart</span>}
            </div>
          </div>
        </div>
      )}

      {checkingMembership ? (
        <div className="container mt-3">
          <div className="alert alert-info">
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              <small>Checking lab membership benefits...</small>
            </div>
          </div>
        </div>
      ) : membershipData.hasActiveMembership && (
        <div className="container mt-3">
          <div className={`alert ${membershipData.isFreeDelivery ? 'alert-success' : 'alert-warning'}`}>
            <div className="d-flex align-items-center">
              <i className="ri-medal-line fs-5 me-2"></i>
          
              
                <div className="small">
                  {membershipData.isFreeDelivery ? (
                    <>
                      <span className="d-block"><strong>Lab Membership Plan Active</strong> ({membershipData.remainingDeliveries} deliveries remaining)</span>
                    
                    </>
                  ) : (
                    <span>Lab membership delivery limit exceeded</span>
                  )}
                </div>
            
            </div>
          </div>
        </div>
      )}

      <div className="container mt-4">
        <div className="row mt-4">
          <div className="col-lg-4 order-2 order-lg-1" style={{ zIndex: 0 }}>
            <div className="card sticky-top shadow-sm border-0 rounded-4">
              <div className="card-header bg-light border-bottom rounded-top-4">
                <h5 className="mb-0 fw-bold">Booking Summary</h5>
                {membershipData.hasActiveMembership && (
                  <span className="badge bg-success float-end">
                    <i className="ri-medal-line me-1"></i>Lab Membership Active
                  </span>
                )}
              </div>
              <div className="card-body p-4">
                <div className="mb-3 pb-3 border-bottom">
                  <h6 className="text-primary mb-1">{bookingData.lab?.name || "Lab"}</h6>
                  <small className="text-muted">{bookingData.lab?.city || ""}, {bookingData.lab?.state || ""}</small>
                </div>

                <div className="mb-3 pb-3 border-bottom">
                  <p className="mb-1"><i className="ri-calendar-line me-2 text-info"></i><strong>Date:</strong> {bookingData.selectedDate}</p>
                  <p className="mb-1"><i className="ri-time-line me-2 text-info"></i><strong>Time:</strong> {bookingData.selectedSlot}</p>
                  <p className="mb-1"><i className="ri-sun-line me-2 text-info"></i><strong>Session:</strong> {bookingData.selectedSession}</p>
                </div>

                <div className="mb-3 pb-3 border-bottom">
                  <p className="mb-1"><i className="ri-flask-line me-2 text-info"></i><strong>Selected Tests:</strong> {selectedItemIds.size} item(s)</p>
                  <p className="mb-1"><i className="ri-user-line me-2 text-info"></i><strong>Patient:</strong> {bookingData.selectedAddress?.name || bookingData.selectedAddress?.fullName || 'N/A'}</p>
                </div>

                <div className="mb-3 pb-3 border-bottom">
                  <h6 className="fw-bold mb-3"><i className="ri-truck-line me-2 text-info"></i>Delivery Options</h6>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input" type="checkbox" id="labRapidDelivery"
                      checked={isRapidDelivery} onChange={handleRapidDeliveryChange}
                      disabled={checkingMembership || calculatingDelivery}
                    />
                    <label className="form-check-label" htmlFor="labRapidDelivery">
                      <strong>Rapid Sample Collection</strong> 
                      {isRapidDeliveryFree && membershipData.isFreeDelivery ? (
                        <span className="text-success ms-1">(FREE with membership!)</span>
                      ) : (
                        <span className="text-danger ms-1"> (+₹{labDeliveryCharges?.rapidDeliveryCharge || 100}) </span>
                      )}
                    </label>
                  </div>

                  {labDeliveryCharges && (
                    <div className="bg-light p-2 rounded small">
                      <div className="d-flex justify-content-between"><span>Free Delivery Radius:</span><span>{labDeliveryCharges.freeDeliveryRadius} km</span></div>
                      <div className="d-flex justify-content-between"><span>Extra Charges per km:</span><span className="text-danger">₹{labDeliveryCharges.perKmCharge}/km beyond free radius</span></div>
                      <div className="d-flex justify-content-between"><span>Free Base Delivery Above:</span><span>₹{labDeliveryCharges.freeDeliveryThreshold}</span></div>
                      {deliveryCalculation?.extraDistance > 0 && (
                        <div className="mt-1 p-1 bg-white rounded border">
                          <div className="d-flex justify-content-between fw-medium"><span>Current Extra Distance:</span><span>{formatExtraDistance(deliveryCalculation.extraDistance)}</span></div>
                          <div className="d-flex justify-content-between text-danger"><span>Extra Charges:</span><span>₹{deliveryCalculation.extraCharges}</span></div>
                        </div>
                      )}
                
                    </div>
                  )}
                </div>

                {deliveryCalculation && (
                  <div className="mb-3 pb-3 border-bottom">
                    <h6 className="fw-bold mb-2"><i className="ri-truck-line me-2 text-info"></i>Delivery Charges</h6>
                    <div className="small">
                      <div className="d-flex justify-content-between mb-1"><span>Distance:</span><span>{deliveryCalculation.distanceText}</span></div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Base Delivery: {deliveryCalculation.membershipApplied && <small className="text-success ms-1">(Membership Free)</small>}</span>
                        <span className={deliveryCalculation.membershipApplied ? "text-success" : ""}>{deliveryCalculation.membershipApplied ? "FREE" : `₹${deliveryCalculation.baseDelivery}`}</span>
                      </div>
                      
                      {deliveryCalculation.extraCharges > 0 && (
                        <div className="mb-1">
                          <div className="d-flex justify-content-between">
                            <span>Extra Distance ({formatExtraDistance(deliveryCalculation.extraDistance)}):</span>
                            <span>₹{deliveryCalculation.extraCharges}</span>
                          </div>
                          {deliveryCalculation.membershipApplied && <div className="text-success small mt-1"><i className="ri-information-line me-1"></i>Extra distance charges apply even with membership</div>}
                        </div>
                      )}
                      
                      {deliveryCalculation.rapidDeliveryFee > 0 && (
                        <div className="d-flex justify-content-between mb-1">
                          <span>Rapid Collection: {deliveryCalculation.rapidFreeApplied && <small className="text-success ms-1">(Free with Membership)</small>}</span>
                          <span className={deliveryCalculation.rapidFreeApplied ? "text-success" : ""}>{deliveryCalculation.rapidFreeApplied ? "FREE" : `₹${deliveryCalculation.rapidDeliveryFee}`}</span>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between fw-bold mt-2 pt-2 border-top">
                        <span>Total Delivery:</span>
                        <span className={deliveryCalculation.freeDeliveryEligible || deliveryCalculation.membershipApplied ? "text-success" : ""}>
                          {deliveryCalculation.freeDeliveryEligible || deliveryCalculation.membershipApplied ? "FREE" : `₹${deliveryCalculation.totalDelivery}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {calculatingDelivery && (
                  <div className="mb-3 text-center">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    <small className="text-muted">Calculating delivery charges...</small>
                  </div>
                )}

                {deliveryError && (
                  <div className="alert alert-warning py-2 small mb-3" role="alert">
                    <i className="ri-error-warning-line me-1"></i> {deliveryError}
                  </div>
                )}

                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Apply Coupon</h6>
                  <div className="d-flex mb-2">
                    <input
                      type="text" className="form-control me-2 rounded-pill ps-3" placeholder="Enter coupon code"
                      value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={!!appliedCoupon || isBooking || selectedItemIds.size === 0} 
                    />
                    {!appliedCoupon ? (
                      <button className="btn btn-outline-primary rounded-pill px-3" onClick={handleApplyCoupon} disabled={couponLoadingLocal || !vendorId || !couponCode || isBooking || selectedItemIds.size === 0}>Apply</button>
                    ) : (
                      <button className="btn btn-outline-danger rounded-pill px-3" onClick={handleRemoveCoupon} disabled={isBooking}>Remove</button>
                    )}
                  </div>

                  {!appliedCoupon && !couponLoadingLocal && availableCoupons && availableCoupons.length > 0 && (
                    <div className="mt-2">
                      <small className="text-muted d-block mb-2">Available offers:</small>
                      <div className="d-flex flex-wrap gap-2">
                        {availableCoupons.slice(0, 3).map((c, idx) => (
                            <button
                              key={idx} className="btn btn-sm btn-light border rounded-pill px-3"
                              onClick={() => { setCouponCode(c.code || c.couponCode || ""); handleApplyCoupon(); }} type="button" disabled={isBooking || selectedItemIds.size === 0}
                            >
                              {c.title ?? c.name ?? c.code ?? c.couponCode ?? `Offer ${idx + 1}`}
                            </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {couponLoadingLocal && <small className="text-muted">Loading offers...</small>}
                  {couponErrorLocal && <div className="alert alert-danger py-2 mt-3 small" role="alert"><i className="ri-error-warning-line me-1"></i> {couponErrorLocal}</div>}

                  {appliedCoupon && (
                    <div className="alert alert-success py-2 mt-3 d-flex justify-content-between align-items-center" role="alert">
                      <div><i className="ri-check-line me-1"></i><strong>Applied:</strong> {appliedCoupon.code ?? appliedCoupon.couponCode ?? appliedCoupon.title ?? appliedCoupon.name}<div className="ms-4"><small>Saved ₹{discountAmount}</small></div></div>
                    </div>
                  )}
                </div>

                <div className="mb-4 pt-3 border-top">
                    <div className="d-flex justify-content-between mb-2"><span>Cart Total:</span><span>₹{baseCartTotal}</span></div>
                    
                    <div className="d-flex justify-content-between mb-2"><span>Coupon Discount:</span><span className={discountAmount > 0 ? "text-danger" : ""}>{discountAmount > 0 ? `- ₹${discountAmount}` : "₹0"}</span></div>
                    
                    {discountAmount > 0 && (
                      <div className="d-flex justify-content-between mb-2 pb-2 border-bottom fw-medium text-secondary">
                        <span>Price after Discount:</span>
                        <span>₹{priceAfterDiscount}</span>
                      </div>
                    )}
                    
                    {deliveryCalculation && (
                      <div className="d-flex justify-content-between mb-2 mt-2">
                        <span>Delivery Charges:</span>
                        <span className={deliveryCalculation.freeDeliveryEligible || deliveryCalculation.membershipApplied ? "text-success" : ""}>
                          {deliveryCalculation.freeDeliveryEligible || deliveryCalculation.membershipApplied ? "FREE" : `+ ₹${deliveryCalculation.totalDelivery}`}
                        </span>
                      </div>
                    )}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 fw-bold fs-4 text-success border-top pt-3">
                  <span>Total Payable:</span><span>₹{finalTotal}</span>
                </div>

                {membershipData.isFreeDelivery && membershipData.remainingDeliveries === 1 && (deliveryCalculation?.membershipApplied || deliveryCalculation?.rapidFreeApplied) && (
                  <div className="alert alert-warning py-2 small mb-3"><i className="ri-alert-line me-1"></i>This will use your last free lab delivery from membership</div>
                )}
                
                {selectedItemIds.size === 0 && (
                    <div className="alert alert-danger py-2 small mb-3 text-center">
                        <i className="ri-error-warning-line me-1"></i>Please select at least one test from the list.
                    </div>
                )}

                <div className="d-grid gap-2">
                  <button 
                    className={`btn btn-lg rounded-pill py-3 shadow-lg ${isBookButtonDisabled ? 'btn-secondary' : 'btn-primary'}`} 
                    onClick={handleBookAppointment} 
                    disabled={isBookButtonDisabled} 
                    type="button"
                  >
                    {isBooking ? "Processing..." : selectedItemIds.size === 0 ? "Select a Test to Proceed" : "Proceed to Payment"}
                  </button>
                </div>
                <div className="mt-3 text-center"><small className="text-muted"><i className="ri-shield-check-line me-1"></i>Your booking is secured.</small></div>
              </div>
            </div>
          </div>

          <div className="col-lg-8 order-1 order-lg-2 mb-4 mb-lg-0">
            <div className="card mb-4 shadow-sm border-0 rounded-4">
              <div className="card-header bg-primary-subtle border-bottom rounded-top-4">
                <h5 className="mb-0 fw-bold"><i className="ri-hospital-line me-2"></i>Lab Information</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-4 align-items-center">
                  <div className="col-md-3">
                    <img
                      src={bookingData.lab?.image ? `${process.env.REACT_APP_API_URL}/${bookingData.lab.image}` : '/placeholder-lab.png'} 
                      alt={bookingData.lab?.name || "Lab"} className="img-fluid rounded w-100" style={{ maxHeight: "150px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="col-md-9">
                    <h5 className="fw-bold mb-1">{bookingData.lab?.name || "Lab"}</h5>
                    <p className="text-muted small mb-1"><i className="ri-map-pin-line me-1"></i>{bookingData.lab?.address || ""}, {bookingData.lab?.city || ""}, {bookingData.lab?.state || ""}</p>
                    <p className="text-muted small"><i className="ri-phone-line me-1"></i>{bookingData.lab?.ctrcode || ""} {bookingData.lab?.phone || ""}</p>
                    <p className="text-muted small"><i className="ri-mail-line me-1"></i>{bookingData.lab?.email || ""}</p>
                    {labDeliveryCharges && (
                      <div className="mt-2">
                        <small className="text-muted"><i className="ri-truck-line me-1"></i>Free delivery on orders above ₹{labDeliveryCharges.freeDeliveryThreshold}{membershipData.hasActiveMembership && <span className="text-success ms-2">• Membership: {membershipData.remainingDeliveries} free deliveries remaining</span>}</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4 shadow-sm border-0 rounded-4">
              <div className="card-header bg-success-subtle border-bottom rounded-top-4">
                <h5 className="mb-0 fw-bold"><i className="ri-flask-line me-2"></i>Selected Tests & Packages</h5>
              </div>
              <div className="card-body p-4">
                <div className="alert alert-info py-2 small mb-3">
                    <i className="ri-information-line me-1"></i> Check the box to include the test in your booking.
                </div>
                {bookingData.cartItems.map((item) => {
                    const originalPrice = Number(item.amount);
                    const discountPct = Number(item.discountPercentage);
                    const calculatedPrice = calculateDiscountedPrice(item.amount, item.discountPercentage);
                    const isSelected = selectedItemIds.has(item._id);

                    return (
                        <div key={item._id} className={`row py-3 border-bottom align-items-center ${!isSelected ? 'opacity-50' : ''}`} style={{transition: 'opacity 0.3s'}}>
                            <div className="col-md-1 d-flex justify-content-center">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={isSelected}
                                    onChange={() => handleToggleItem(item._id)}
                                    style={{ transform: "scale(1.2)", cursor: "pointer" }}
                                />
                            </div>
                            <div className="col-md-7">
                                <h6 className="fw-semibold mb-1" style={{ cursor: "pointer" }} onClick={() => handleToggleItem(item._id)}>{item.testName || item.packageName}</h6>
                                {item.testType && <small className="text-muted d-block mb-1">Type: {item.testType}</small>}
                                {item.testCategory && <small className="text-muted d-block mb-1">Category: {item.testCategory}</small>}
                                {item.prescription && <span className="badge bg-warning text-dark mt-1">Prescription Required</span>}
                            </div>
                            <div className="col-md-4 text-end">
                                {discountPct > 0 && (
                                    <>
                                        <p className="mb-1 text-decoration-line-through text-muted small">₹{originalPrice}</p>
                                        <p className="mb-1 text-danger small">-{discountPct}% OFF</p>
                                    </>
                                )}
                                <h5 className={`fw-bold ${isSelected ? 'text-success' : 'text-muted'}`}>₹{calculatedPrice}</h5>
                            </div>
                        </div>
                    );
                })}
                <div className="text-end mt-4 pt-4 border-top fw-bold fs-4">
                  Tests & Packages Total: <span className="text-success">₹{baseCartTotal}</span>
                </div>
              </div>
            </div>

            {deliveryCalculation && (
              <div className="card mb-4 shadow-sm border-0 rounded-4">
                <div className="card-header bg-info-subtle border-bottom rounded-top-4">
                  <h5 className="mb-0 fw-bold"><i className="ri-truck-line me-2"></i>Delivery Charges Details</h5>
                </div>
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <h6 className="fw-semibold mb-2">Distance Information</h6>
                        <p className="mb-1"><strong>Distance:</strong> {deliveryCalculation.distanceText}</p>
                        <p className="mb-1"><strong>Calculation Type:</strong> <span className={`badge ms-2 ${deliveryCalculation.distanceCalculationType === 'on_road' ? 'bg-success' : 'bg-warning'}`}>{deliveryCalculation.distanceCalculationType === 'on_road' ? 'On Road' : 'Straight Line'}</span></p>
                        {deliveryCalculation.freeDeliveryRadius && <p className="mb-1"><strong>Free Delivery Radius:</strong> {deliveryCalculation.freeDeliveryRadius} km</p>}
                        {deliveryCalculation.durationText && <p className="mb-1"><strong>Estimated Time:</strong> {deliveryCalculation.durationText}</p>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <h6 className="fw-semibold mb-2">Charges Breakdown</h6>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Base Delivery:</span>
                          <span className={deliveryCalculation.membershipApplied ? "text-success" : ""}>{deliveryCalculation.membershipApplied ? "FREE (Membership)" : `₹${deliveryCalculation.baseDelivery}`}</span>
                        </div>
                        
                        {deliveryCalculation.extraCharges > 0 && (
                          <div className="mb-1 border-start border-info ps-2">
                            <div className="d-flex justify-content-between mb-1">
                              <span>Extra Distance ({formatExtraDistance(deliveryCalculation.extraDistance)}):</span>
                              <span>₹{deliveryCalculation.extraCharges}</span>
                            </div>
                            {deliveryCalculation.membershipApplied && <div className="text-success small mt-1"><i className="ri-information-line me-1"></i>Extra distance charges apply even with membership</div>}
                          </div>
                        )}
                        
                        {deliveryCalculation.originalRapidDeliveryFee > 0 && deliveryCalculation.rapidFreeApplied && (
                          <div className="d-flex justify-content-between mb-1 text-success"><span>Rapid Collection:</span><span>₹{deliveryCalculation.originalRapidDeliveryFee} → FREE (Membership)</span></div>
                        )}
                        {deliveryCalculation.rapidDeliveryFee > 0 && !deliveryCalculation.rapidFreeApplied && (
                          <div className="d-flex justify-content-between mb-1"><span>Rapid Collection:</span><span>₹{deliveryCalculation.rapidDeliveryFee}</span></div>
                        )}
                        
                        {deliveryCalculation.totalMembershipDiscount > 0 && (
                          <div className="d-flex justify-content-between mb-1 text-success"><span>Membership Discount:</span><span>- ₹{deliveryCalculation.totalMembershipDiscount}</span></div>
                        )}
                        
                        <hr />
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total Delivery:</span>
                          <span className={deliveryCalculation.freeDeliveryEligible || deliveryCalculation.membershipApplied ? "text-success" : ""}>
                            {deliveryCalculation.freeDeliveryEligible || deliveryCalculation.membershipApplied ? "FREE" : `₹${deliveryCalculation.totalDelivery}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {bookingData.prescriptionFiles && bookingData.prescriptionFiles.length > 0 && (
              <div className="card mb-4 shadow-sm border-0 rounded-4">
                <div className="card-header bg-secondary-subtle border-bottom rounded-top-4">
                  <h5 className="mb-0 fw-bold text-secondary"><i className="ri-file-text-line me-2"></i>Uploaded Prescriptions</h5>
                </div>
                <div className="card-body p-4">
                  <ul className="list-group list-group-flush">
                    {bookingData.prescriptionFiles.map((file, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center small px-0">
                        <div className="text-truncate" style={{ maxWidth: "80%" }}><i className="ri-file-line me-2"></i> {file.name}</div>
                        <span className="badge bg-success rounded-pill">Uploaded</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LabTestCart;