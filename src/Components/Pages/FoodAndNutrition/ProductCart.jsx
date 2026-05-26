import React, { useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AddAddress from "../Shop/ShopComponents/AddAddress";
import CartOffers from "../Shop/ShopComponents/CartOffers";
import { MyContext } from "../../../Context/Context";
import moment from "moment";
import axios from "axios";

const ProductCart = () => {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
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
  const [forceUpdate, setForceUpdate] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [deliveryChargesData, setDeliveryChargesData] = useState(null);
  const [calculatingCharges, setCalculatingCharges] = useState(false);
  
  // ✅ STATE FOR MEMBERSHIP
  const [membershipData, setMembershipData] = useState({
    hasActiveMembership: false,
    isFreeDelivery: false,
    remainingDeliveries: 0,
    message: ""
  });
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [apiUrl] = useState(process.env.REACT_APP_API_URL || "http://localhost:5000");
  const [initialized, setInitialized] = useState(false);

  // ✅ NEW: State for tracking if rapid delivery should be free
  const [isRapidDeliveryFree, setIsRapidDeliveryFree] = useState(false);

  // ✅ Refs to prevent multiple calculations
  const isCalculatingRef = useRef(false);
  const lastCalculationRef = useRef({
    key: '',
    subtotal: 0,
    isRapid: false,
    membershipApplied: false,
    rapidFree: false
  });

  const {
    getAvailableSlots,
    getCartData,
    bookOrder,
    removeCartItem,
    updateCartQuantity,
    addNewAddress,
    updateAddress,
    deleteAddress,
    fetchAddresses,
    foodDeliveryCharges,
    loadingCharges,
    fetchUserFoodDeliveryCharges: fetchFoodDeliveryCharges,
    calculateFoodDeliveryCharges: calculateDeliveryChargesAPI
  } = useContext(MyContext);

  // ✅ Check membership for free delivery
  const checkMembershipForDelivery = useCallback(async () => {
    try {
      setCheckingMembership(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log("No token found, skipping membership check");
        setMembershipData({
          hasActiveMembership: false,
          isFreeDelivery: false,
          remainingDeliveries: 0,
          message: "Please login to check membership"
        });
        return;
      }

      console.log("Checking membership for delivery...");
      const response = await axios.post(
        `${apiUrl}/user-membership/check-delivery`,
        { type: 'food' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Membership API Response:", response.data);
      
      if (response.data.success === 1) {
        setMembershipData(response.data.data);
        console.log('✅ Membership delivery check successful:', response.data.data);
      } else {
        console.log('Membership API returned success 0:', response.data.message);
        setMembershipData({
          hasActiveMembership: false,
          isFreeDelivery: false,
          remainingDeliveries: 0,
          message: response.data.message || "No active membership"
        });
      }
    } catch (error) {
      console.error('Error checking membership for delivery:', error);
      setMembershipData({
        hasActiveMembership: false,
        isFreeDelivery: false,
        remainingDeliveries: 0,
        message: "Failed to check membership status"
      });
    } finally {
      setCheckingMembership(false);
    }
  }, [apiUrl]);

  // ✅ LOGIC: Check if rapid delivery should be free based on membership
  const checkRapidDeliveryFreeEligibility = useCallback(() => {
    // Rapid delivery is free when:
    // 1. User has active membership
    // 2. User has remaining free deliveries
    // 3. Membership is currently providing free delivery
    
    const shouldBeFree = (
      membershipData.hasActiveMembership &&
      membershipData.isFreeDelivery &&
      membershipData.remainingDeliveries > 0
    );
    
    setIsRapidDeliveryFree(shouldBeFree);
    
    if (shouldBeFree) {
      console.log('✅ Rapid delivery is FREE due to active membership with remaining deliveries');
    } else {
      console.log('ℹ️ Rapid delivery is NOT free:', {
        hasActiveMembership: membershipData.hasActiveMembership,
        isFreeDelivery: membershipData.isFreeDelivery,
        remainingDeliveries: membershipData.remainingDeliveries
      });
    }
    
    return shouldBeFree;
  }, [membershipData]);

  // ✅ Get user's current location
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setLocationLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationLoading(false);
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          console.log("User location obtained:", location);
          resolve(location);
        },
        (error) => {
          setLocationLoading(false);
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'Unknown location error.';
              break;
          }
          
          console.warn("Location error:", errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  // ✅ UPDATED: Calculate delivery charges with extra distance charges per km
  const calculateDeliveryCharges = useCallback(async (subtotal, vendorLocation, userLocation, isRapid, currentMembershipData) => {
    if (!vendorLocation || !userLocation || !foodDeliveryCharges) {
      console.log("Missing data for delivery calculation");
      return {
        baseDelivery: 0,
        rapidDeliveryFee: 0,
        totalDelivery: 0,
        distance: 0,
        distanceText: '0 km',
        duration: null,
        durationText: null,
        freeRadiusUsed: false,
        extraDistance: 0,
        extraCharges: 0,
        freeDeliveryEligible: false,
        taxAmount: 0,
        finalTotal: subtotal,
        distanceCalculationType: 'unknown'
      };
    }

    // ✅ Check if rapid delivery should be free
    const isRapidFree = checkRapidDeliveryFreeEligibility();
    
    // ✅ Prevent duplicate calculations
    const currentCalcKey = `${subtotal}-${userLocation.latitude}-${userLocation.longitude}-${isRapid}-${currentMembershipData.isFreeDelivery}-${isRapidFree}`;
    if (isCalculatingRef.current) {
      console.log("Already calculating, skipping...");
      return;
    }

    if (lastCalculationRef.current.key === currentCalcKey) {
      console.log("Same calculation parameters, skipping...");
      return;
    }

    try {
      isCalculatingRef.current = true;
      setCalculatingCharges(true);
      
      console.log("Calculating delivery charges with:", {
        isRapid,
        isRapidFree,
        membership: currentMembershipData,
        deliverySettings: foodDeliveryCharges
      });
      
      const calculationData = {
        userLocation: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        },
        vendorLocation: {
          latitude: vendorLocation.latitude,
          longitude: vendorLocation.longitude
        },
        cartTotal: subtotal,
        deliverySettings: foodDeliveryCharges,
        isRapidDelivery: isRapid
      };

      const result = await calculateDeliveryChargesAPI(calculationData);
      console.log("Delivery charges API result:", result);
      
      // ✅ NEW: Calculate extra distance charges per kilometer if not provided by API
      let finalResult = { ...result };
      
      // If API didn't calculate extra charges, calculate them manually
      if (result.extraDistance > 0 && (result.extraCharges === 0 || !result.extraCharges)) {
        const perKmCharge = foodDeliveryCharges.perKmCharge || 5;
        const extraCharges = Math.round(result.extraDistance * perKmCharge * 100) / 100; // Round to 2 decimal places
        console.log(`📏 Manual extra charges calculation: ${result.extraDistance} km × ₹${perKmCharge}/km = ₹${extraCharges}`);
        finalResult.extraCharges = extraCharges;
      }
      
      // ✅ Apply membership free delivery if eligible
      
      // Track what discounts are applied
      let membershipDiscount = 0;
      let rapidDiscount = 0;
      let extraChargesAfterMembership = finalResult.extraCharges || 0;
      
      // 1. Apply membership free delivery (base delivery)
      if (currentMembershipData.isFreeDelivery && currentMembershipData.remainingDeliveries > 0) {
        console.log('✅ Applying membership free delivery. Base delivery:', result.baseDelivery);
        
        membershipDiscount = result.baseDelivery;
        finalResult.originalBaseDelivery = result.baseDelivery;
        finalResult.baseDelivery = 0; // Free base delivery
        
        // ✅ IMPORTANT: Membership covers only base delivery, NOT extra distance charges
        // Extra distance charges are always applied regardless of membership
        console.log(`ℹ️ Membership discount: ₹${membershipDiscount} (Base delivery only)`);
        console.log(`ℹ️ Extra charges still apply: ₹${extraChargesAfterMembership}`);
      } else {
        finalResult.originalBaseDelivery = result.baseDelivery;
      }
      
      // 2. Apply rapid delivery free if eligible
      if (isRapid && isRapidFree) {
        console.log('✅ Rapid delivery is FREE due to membership');
        rapidDiscount = result.rapidDeliveryFee || 0;
        finalResult.originalRapidDeliveryFee = result.rapidDeliveryFee || 0;
        finalResult.rapidDeliveryFee = 0; // Free rapid delivery
      } else {
        finalResult.originalRapidDeliveryFee = result.rapidDeliveryFee || 0;
      }
      
      // ✅ Calculate total delivery with ALL components
      // Total Delivery = Base Delivery + Extra Distance Charges + Rapid Delivery Fee
      const totalDelivery = finalResult.baseDelivery + extraChargesAfterMembership + finalResult.rapidDeliveryFee;
      
      finalResult.totalDelivery = totalDelivery;
      
      // ✅ Calculate final total including everything
      finalResult.finalTotal = subtotal + finalResult.totalDelivery + finalResult.taxAmount;
      
      // Add membership info
      finalResult.membershipApplied = currentMembershipData.isFreeDelivery && currentMembershipData.remainingDeliveries > 0;
      finalResult.rapidFreeApplied = isRapid && isRapidFree;
      finalResult.membershipDiscount = membershipDiscount;
      finalResult.rapidDiscount = rapidDiscount;
      finalResult.totalMembershipDiscount = membershipDiscount + rapidDiscount;
      finalResult.membershipRemainingDeliveries = currentMembershipData.remainingDeliveries;
      finalResult.perKmCharge = foodDeliveryCharges.perKmCharge || 5; // Store per km charge for display
      
      // Ensure no NaN values
      finalResult.baseDelivery = finalResult.baseDelivery || 0;
      finalResult.rapidDeliveryFee = finalResult.rapidDeliveryFee || 0;
      finalResult.extraCharges = extraChargesAfterMembership || 0;
      finalResult.totalDelivery = finalResult.totalDelivery || 0;
      finalResult.finalTotal = finalResult.finalTotal || (subtotal + finalResult.totalDelivery + finalResult.taxAmount);
      
      console.log("✅ Final delivery charges calculation:");
      console.log("  Subtotal: ₹" + subtotal.toFixed(2));
      console.log("  Base Delivery: ₹" + finalResult.baseDelivery.toFixed(2));
      console.log("  Extra Distance Charges: ₹" + finalResult.extraCharges.toFixed(2) + 
                  ` (${finalResult.extraDistance} km × ₹${finalResult.perKmCharge}/km)`);
      console.log("  Rapid Delivery Fee: ₹" + finalResult.rapidDeliveryFee.toFixed(2));
      console.log("  Total Delivery: ₹" + finalResult.totalDelivery.toFixed(2));
      console.log("  Tax: ₹" + finalResult.taxAmount.toFixed(2));
      console.log("  Final Total: ₹" + finalResult.finalTotal.toFixed(2));
      console.log("  Membership Discount: ₹" + finalResult.totalMembershipDiscount.toFixed(2));
      
      setDeliveryChargesData(finalResult);
      
      // Store last calculation
      lastCalculationRef.current = {
        key: currentCalcKey,
        subtotal,
        isRapid,
        membershipApplied: currentMembershipData.isFreeDelivery,
        rapidFree: isRapidFree
      };
      
      return finalResult;
      
    } catch (error) {
      console.error('Error calculating delivery charges:', error);
      
      // ✅ FALLBACK: Manual calculation with extra distance charges
      console.log("⚠️ Using fallback calculation method");
      
      // Calculate distance (simplified - straight line distance)
      const toRad = (value) => (value * Math.PI) / 180;
      const R = 6371; // Earth's radius in km
      
      const lat1 = userLocation.latitude;
      const lon1 = userLocation.longitude;
      const lat2 = vendorLocation.latitude;
      const lon2 = vendorLocation.longitude;
      
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = Math.round(R * c * 10) / 10; // Round to 1 decimal place
      
      console.log(`📍 Calculated distance: ${distance} km`);
      
      // Get delivery settings
      const freeDeliveryRadius = foodDeliveryCharges.freeDeliveryRadius || 10;
      const perKmCharge = foodDeliveryCharges.perKmCharge || 5;
      const baseDeliveryCharge = foodDeliveryCharges.baseDeliveryCharge || 50;
      const freeDeliveryThreshold = foodDeliveryCharges.freeDeliveryThreshold || 300;
      const rapidDeliveryCharge = foodDeliveryCharges.rapidDeliveryCharge || 100;
      const taxPercentage = foodDeliveryCharges.taxPercentage || 2;
      
      let baseDelivery = 0;
      let extraDistance = 0;
      let extraCharges = 0;
      let rapidDeliveryFee = isRapid ? rapidDeliveryCharge : 0;
      let totalDelivery = 0;
      
      // ✅ Calculate extra distance charges per kilometer beyond free radius
      if (distance > freeDeliveryRadius) {
        extraDistance = Math.round((distance - freeDeliveryRadius) * 10) / 10; // Round to 1 decimal
        extraCharges = Math.round(extraDistance * perKmCharge * 100) / 100; // Round to 2 decimals
        console.log(`📏 Extra distance: ${extraDistance} km beyond ${freeDeliveryRadius} km free radius`);
        console.log(`💰 Extra charges:  ₹${extraCharges}`);
      }
      
      // Calculate base delivery
      if (subtotal >= freeDeliveryThreshold) {
        baseDelivery = 0;
        console.log("✅ Free base delivery due to order amount");
      } else {
        baseDelivery = baseDeliveryCharge;
      }
      
      // ✅ Apply membership discounts
      let membershipDiscount = 0;
      let rapidDiscount = 0;
      
      // Check if rapid delivery should be free
      const isRapidFree = checkRapidDeliveryFreeEligibility();
      
      // Apply membership free delivery (base delivery only)
      if (currentMembershipData.isFreeDelivery && currentMembershipData.remainingDeliveries > 0) {
        console.log("✅ Applying membership free delivery (base delivery only)");
        membershipDiscount = baseDelivery;
        baseDelivery = 0;
        
        // Note: Extra distance charges still apply even with membership
        console.log(`ℹ️ Extra distance charges still apply with membership: ₹${extraCharges}`);
      }
      
      // Apply rapid delivery free
      if (isRapid && isRapidFree) {
        console.log("✅ Rapid delivery is FREE due to membership");
        rapidDiscount = rapidDeliveryFee;
        rapidDeliveryFee = 0;
      }
      
      // ✅ Calculate total delivery with all components
      totalDelivery = baseDelivery + extraCharges + rapidDeliveryFee;
      
      const taxAmount = Math.round((subtotal * taxPercentage) / 100 * 100) / 100;
      const finalTotal = Math.round((subtotal + totalDelivery + taxAmount) * 100) / 100;
      
      const fallbackResult = {
        baseDelivery: baseDelivery,
        rapidDeliveryFee: rapidDeliveryFee,
        totalDelivery: totalDelivery,
        distance: distance,
        distanceText: `${distance} km`,
        duration: null,
        durationText: null,
        freeRadiusUsed: distance <= freeDeliveryRadius,
        extraDistance: extraDistance,
        extraCharges: extraCharges,
        freeDeliveryEligible: subtotal >= freeDeliveryThreshold,
        taxAmount: taxAmount,
        finalTotal: finalTotal,
        distanceCalculationType: 'fallback',
        membershipApplied: currentMembershipData.isFreeDelivery && currentMembershipData.remainingDeliveries > 0,
        rapidFreeApplied: isRapid && isRapidFree,
        membershipRemainingDeliveries: currentMembershipData.remainingDeliveries,
        membershipDiscount: membershipDiscount,
        rapidDiscount: rapidDiscount,
        totalMembershipDiscount: membershipDiscount + rapidDiscount,
        originalBaseDelivery: baseDeliveryCharge,
        originalRapidDeliveryFee: isRapid ? rapidDeliveryCharge : 0,
        perKmCharge: perKmCharge,
        freeDeliveryRadius: freeDeliveryRadius
      };
      
      console.log("✅ Fallback calculation complete:", fallbackResult);
      setDeliveryChargesData(fallbackResult);
      return fallbackResult;
    } finally {
      setCalculatingCharges(false);
      isCalculatingRef.current = false;
    }
  }, [calculateDeliveryChargesAPI, foodDeliveryCharges, checkRapidDeliveryFreeEligibility]);

  // Calculate delivery charges and totals
  const {
    currentTotal,
    discountedPrice,
    displayTotal,
    totalQuantity,
    outOfStockItemsExist,
    deliveryCharge,
    taxAmount,
    finalTotal,
    distanceInfo
  } = useMemo(() => {
    let total = 0;
    let totalQty = 0;
    let hasOutOfStock = false;

    // Calculate cart total
    cartItems.forEach(item => {
      if (item.FoodItem?.status === "1") {
        hasOutOfStock = true;
        return;
      }

      const price = parseFloat(item.FoodItem?.amount) || 0;
      const discount = parseFloat(item.FoodItem?.discountPercentage) || 0;
      const discountedPrice = price - (price * discount / 100);
      const addonsPrice = (item.extraItems?.reduce((sum, addon) =>
        sum + (parseFloat(addon?.price) || 0), 0) || 0) * item.quantity;
      total += (discountedPrice * item.quantity) + addonsPrice;
      totalQty += (item.quantity || 0);
    });

    // Calculate coupon discount
    let discPrice = 0;
    if (appliedCoupon) {
      if (appliedCoupon.percentageDiscount) {
        discPrice = (total * parseFloat(appliedCoupon.percentageDiscount)) / 100;
      } else if (appliedCoupon.fixedAmountDiscount) {
        discPrice = Math.min(parseFloat(appliedCoupon.fixedAmountDiscount), total);
      }
    }

    const subtotalAfterDiscount = Math.max(0, total - discPrice);

    // Use pre-calculated delivery charges data if available
    if (deliveryChargesData && !calculatingCharges) {
      return {
        currentTotal: total,
        discountedPrice: discPrice,
        displayTotal: subtotalAfterDiscount,
        totalQuantity: totalQty,
        outOfStockItemsExist: hasOutOfStock,
        deliveryCharge: deliveryChargesData.totalDelivery || 0,
        taxAmount: deliveryChargesData.taxAmount || 0,
        finalTotal: deliveryChargesData.finalTotal || subtotalAfterDiscount,
        distanceInfo: deliveryChargesData
      };
    }

    // If no delivery charges calculated yet, return basic values
    const basicResult = {
      currentTotal: total,
      discountedPrice: discPrice,
      displayTotal: subtotalAfterDiscount,
      totalQuantity: totalQty,
      outOfStockItemsExist: hasOutOfStock,
      deliveryCharge: 0,
      taxAmount: 0,
      finalTotal: subtotalAfterDiscount,
      distanceInfo: {
        baseDelivery: 0,
        rapidDeliveryFee: 0,
        totalDelivery: 0,
        distance: 0,
        distanceText: '0 km',
        freeRadiusUsed: false,
        extraDistance: 0,
        extraCharges: 0,
        freeDeliveryEligible: false,
        membershipApplied: false,
        rapidFreeApplied: false,
        membershipDiscount: 0,
        rapidDiscount: 0,
        totalMembershipDiscount: 0,
        membershipRemainingDeliveries: membershipData.remainingDeliveries,
        perKmCharge: foodDeliveryCharges?.perKmCharge || 5
      }
    };
    
    return basicResult;
  }, [cartItems, appliedCoupon, deliveryChargesData, calculatingCharges, membershipData.remainingDeliveries, foodDeliveryCharges]);

  const loadCartData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading cart data...");
      const cartData = await getCartData();

      if (!cartData) {
        throw new Error("Failed to load cart data. Please try again.");
      }

      if (cartData.success !== 1) {
        throw new Error(cartData.message || "Your cart is empty");
      }

      if (!cartData.details || cartData.details.length === 0) {
        console.log("Cart is empty");
        setCartItems([]);
        setVendorId("");
        return;
      }

      const vendorIdFromCart = cartData.details[0]?.FoodItem?.vendorId;
      if (!vendorIdFromCart) {
        throw new Error("Vendor information not found in cart items");
      }

      console.log("Vendor ID found:", vendorIdFromCart);
      setVendorId(vendorIdFromCart);
      setCartItems(cartData.details);

    } catch (err) {
      console.error("Error loading cart:", err);
      setError(err.message || "Failed to load cart data");
      setCartItems([]);
      setVendorId("");
    } finally {
      setIsLoading(false);
    }
  }, [getCartData]);

  const loadAddresses = useCallback(async () => {
    try {
      console.log("Loading addresses...");
      const data = await fetchAddresses();
      if (!data) {
        throw new Error("Failed to load addresses");
      }
      console.log("Addresses loaded:", data.length);
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddress(prev =>
          prev && data.some(addr => addr._id === prev._id)
          ? data.find(addr => addr._id === prev._id)
          : data[0]
        );
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
      setError(prev => prev || err.message);
      setAddresses([]);
      setSelectedAddress(null);
    }
  }, [fetchAddresses]);

  // ✅ Main initialization - run only once
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (!mounted) return;
      
      console.log("=== STARTING INITIALIZATION ===");
      
      try {
        // Step 1: Fetch delivery charges settings
        console.log("Step 1: Fetching delivery charges settings...");
        if (fetchFoodDeliveryCharges) {
          await fetchFoodDeliveryCharges();
        }
        
        // Step 2: Load cart data
        console.log("Step 2: Loading cart data...");
        await loadCartData();
        
        // Step 3: Load addresses
        console.log("Step 3: Loading addresses...");
        await loadAddresses();
        
        // Step 4: Get user location
        console.log("Step 4: Getting user location...");
        try {
          await getCurrentLocation();
        } catch (locationError) {
          console.warn('Could not get user location:', locationError.message);
          // Continue with null location
        }
        
        // Step 5: Check membership status
        console.log("Step 5: Checking membership status...");
        await checkMembershipForDelivery();
        
        // Step 6: Check rapid delivery free eligibility
        console.log("Step 6: Checking rapid delivery free eligibility...");
        checkRapidDeliveryFreeEligibility();
        
        // Step 7: Mark as initialized
        setInitialized(true);
        console.log("=== INITIALIZATION COMPLETE ===");
        
      } catch (error) {
        console.error("Initialization error:", error);
        setError(error.message);
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Update rapid delivery free eligibility when membership changes
  useEffect(() => {
    if (initialized) {
      checkRapidDeliveryFreeEligibility();
    }
  }, [membershipData, initialized, checkRapidDeliveryFreeEligibility]);

  // ✅ Calculate delivery charges when needed
  useEffect(() => {
    if (!initialized) {
      console.log("Not initialized yet, skipping delivery calculation");
      return;
    }
    
    if (cartItems.length === 0) {
      console.log("Cart is empty, skipping delivery calculation");
      return;
    }
    
    if (!userLocation || !foodDeliveryCharges || !vendorId) {
      console.log("Missing data for delivery calculation");
      return;
    }
    
    const vendor = cartItems[0]?.FoodItem;
    if (!vendor || !vendor.vendorLatitude || !vendor.vendorLongitude) {
      console.log("No vendor location data");
      return;
    }

    const vendorLocation = {
      latitude: parseFloat(vendor.vendorLatitude),
      longitude: parseFloat(vendor.vendorLongitude)
    };

    console.log("=== CALCULATING DELIVERY CHARGES ===");
    console.log("Current membership data:", membershipData);
    console.log("Rapid delivery free:", isRapidDeliveryFree);
    console.log("Per km charge:", foodDeliveryCharges?.perKmCharge);

    calculateDeliveryCharges(
      displayTotal,
      vendorLocation,
      userLocation,
      isRapidDelivery,
      membershipData
    );
    
  }, [initialized, cartItems, displayTotal, userLocation, isRapidDelivery, foodDeliveryCharges, vendorId, calculateDeliveryCharges, membershipData, isRapidDeliveryFree]);

  const fetchAvailableSlots = useCallback(async (date, vendorId) => {
    try {
      if (!vendorId) {
        console.log("No vendorId available, skipping slot fetch");
        return;
      }

      console.log("Fetching available slots for vendor:", vendorId, "date:", date);
      const slotsData = await getAvailableSlots({
        startDate: date,
        vendorId
      });

      if (!slotsData) {
        console.warn("No slots data returned from API");
        return;
      }

      const now = moment();
      const today = now.format("YYYY-MM-DD");
      const currentTime = now.format("HH:mm");

      const filteredSlots = {
        morning: slotsData.morning ? slotsData.morning.filter(slot => {
          if (date !== today) return true;
          return slot.endTime > currentTime;
        }) : [],
        afternoon: slotsData.afternoon ? slotsData.afternoon.filter(slot => {
          if (date !== today) return true;
          return slot.endTime > currentTime;
        }) : [],
        evening: slotsData.evening ? slotsData.evening.filter(slot => {
          if (date !== today) return true;
          return slot.endTime > currentTime;
        }) : []
      };

      console.log("Filtered slots:", filteredSlots);
      setAvailableSlots(filteredSlots);
      setSelectedSlot(null);

    } catch (err) {
      console.error("Slot fetch error:", err);
      setError(prev => prev || `Failed to load delivery slots: ${err.message}`);
      setAvailableSlots({ morning: [], afternoon: [], evening: [] });
      setSelectedSlot(null);
    }
  }, [getAvailableSlots]);

  // Fetch slots when vendorId or date changes
  useEffect(() => {
    if (vendorId && initialized) {
      console.log("Vendor ID available, fetching slots...");
      fetchAvailableSlots(selectedDate, vendorId);
    }
  }, [vendorId, selectedDate, fetchAvailableSlots, initialized]);

  // ✅ UPDATED: Handle rapid delivery change with free logic
  const handleRapidDeliveryChange = (e) => {
    const newIsRapid = e.target.checked;
    
    // If rapid delivery is being enabled and should be free, show message
    if (newIsRapid && isRapidDeliveryFree) {
      console.log("Enabling free rapid delivery due to membership");
    }
    
    setIsRapidDelivery(newIsRapid);
  };

  // Handle quantity change
  const handleQuantityChange = async (type, cartItemId, foodItemId) => {
    try {
      setUpdatingItems(prev => ({ ...prev, [`${type}-${cartItemId}`]: true }));

      const currentItem = cartItems.find(item => item._id === cartItemId);
      if (!currentItem) throw new Error("Item not found in cart");

      if (currentItem.FoodItem?.status === "1") {
        alert("This item is currently out of stock and its quantity cannot be updated.");
        return;
      }

      const newQuantity = type === 'inc'
        ? currentItem.quantity + 1
        : Math.max(1, currentItem.quantity - 1);

      const updatedItems = cartItems.map(item =>
        item._id === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);

      await updateCartQuantity(foodItemId, newQuantity);

    } catch (error) {
      // Revert to original cart items on error
      setCartItems(prevItems => prevItems.map(item =>
        item._id === cartItemId ? { ...item, quantity: cartItems.find(orig => orig._id === cartItemId).quantity } : item
      ));
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

  // ✅ UPDATED: Handle checkout with rapid delivery free logic and extra charges
  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    if (!selectedSlot) {
      alert("Please select a delivery time slot");
      return;
    }

    // Check for out of stock items
    if (outOfStockItemsExist) {
      alert("Please remove all 'Out of Stock' items from your cart before proceeding to checkout.");
      return;
    }

    const itemsForCheckout = cartItems.filter(item => item.FoodItem?.status !== "1");

    if (itemsForCheckout.length === 0) {
      alert("Your cart is empty or all items are out of stock.");
      return;
    }

    try {
      setIsCheckingOut(true);

      // ✅ Calculate updated membership deliveries
      let updatedRemainingDeliveries = membershipData.remainingDeliveries;
      let membershipWasApplied = false;
      let rapidWasFree = false;
      
      if (membershipData.isFreeDelivery && membershipData.remainingDeliveries > 0) {
        // Membership is being applied for this order
        membershipWasApplied = true;
        
        // Check if rapid delivery is free
        if (isRapidDelivery && isRapidDeliveryFree) {
          rapidWasFree = true;
        }
        
        // Decrement deliveries only once per order (not for both base and rapid)
        updatedRemainingDeliveries = membershipData.remainingDeliveries - 1;
        console.log(`✅ Membership applied. Reducing from ${membershipData.remainingDeliveries} to ${updatedRemainingDeliveries}`);
        
        // ✅ Update local state immediately for better UX
        setMembershipData(prev => ({
          ...prev,
          remainingDeliveries: updatedRemainingDeliveries,
          isFreeDelivery: updatedRemainingDeliveries > 0,
          message: updatedRemainingDeliveries > 0 
            ? `Free delivery applied! (${updatedRemainingDeliveries} deliveries remaining)` 
            : "Membership delivery limit reached"
        }));
      }

      // Prepare order data to pass to payment page
      const orderData = {
        cartItems: itemsForCheckout,
        vendorId: vendorId,
        address: [
          selectedAddress.name,
          selectedAddress.dob,
          selectedAddress.phone,
          selectedAddress.gender,
          selectedAddress.address,
          selectedAddress.country,
          selectedAddress.state,
          selectedAddress.city,
          selectedAddress.pinCode,
          selectedAddress.pic,
        ],
        date: moment(selectedDate).format("DD/MM/YYYY"),
        foodTime: selectedSlot.mealType,
        foodSlot: `${selectedSlot.startTime}-${selectedSlot.endTime}`,
        price: finalTotal,
        deliveryCharge: deliveryCharge,
        taxAmount: taxAmount,
        couponId: appliedCoupon?._id,
        discount: discountedPrice,
        rapid: isRapidDelivery,
        rapidFree: rapidWasFree,
        orderType: totalQuantity >= 2 ? "Bulk" : "Single",
        foodIds: itemsForCheckout.map(item => item._id),
        distanceInfo: distanceInfo,
        membershipApplied: membershipData.isFreeDelivery,
        membershipRemainingDeliveries: updatedRemainingDeliveries,
        membershipWasApplied: membershipWasApplied,
        rapidWasFree: rapidWasFree,
        membershipOriginalCount: membershipData.remainingDeliveries,
        membershipDiscount: distanceInfo.totalMembershipDiscount || 0,
        originalTotal: currentTotal,
        baseDeliveryCharge: distanceInfo.baseDelivery,
        extraDistanceCharges: distanceInfo.extraCharges,
        extraDistance: distanceInfo.extraDistance,
        perKmCharge: distanceInfo.perKmCharge,
        rapidDeliveryFee: distanceInfo.rapidDeliveryFee,
        membershipDiscount: distanceInfo.totalMembershipDiscount || 0,
        extraChargesCalculation: distanceInfo.extraDistance > 0 ? 
          `${distanceInfo.extraDistance} km × ₹${distanceInfo.perKmCharge}/km = ₹${distanceInfo.extraCharges}` : 
          "No extra distance charges"
      };

      console.log("✅ Order details with extra charges:", {
        total: finalTotal,
        baseDelivery: distanceInfo.baseDelivery,
        extraDistance: distanceInfo.extraDistance,
        extraCharges: distanceInfo.extraCharges,
        perKmCharge: distanceInfo.perKmCharge,
        calculation: orderData.extraChargesCalculation
      });
      
      console.log("✅ Navigating to payment with order data:", orderData);
      
      navigate('/shop/FoodAndNurition/payment', {
        state: orderData
      });

    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.message || "Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleAddNewAddress = async (newAddress) => {
    try {
      const addedAddress = await addNewAddress(newAddress);
      if (addedAddress) {
        const updatedAddresses = await fetchAddresses();
        setAddresses(updatedAddresses);
        setSelectedAddress(addedAddress);
        setForceUpdate(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error adding new address:", error);
      alert("Failed to add new address");
    }
  };

  const handleUpdateAddress = async (addressId, updatedData) => {
    try {
      await updateAddress(addressId, updatedData);
      const updatedAddresses = await fetchAddresses();
      setAddresses(updatedAddresses);
      if (selectedAddress && selectedAddress._id === addressId) {
        setSelectedAddress(updatedAddresses.find(addr => addr._id === addressId));
      }
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Failed to update address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId);
      const updatedAddresses = await fetchAddresses();
      setAddresses(updatedAddresses);
      if (selectedAddress && selectedAddress._id === addressId) {
        setSelectedAddress(updatedAddresses.length > 0 ? updatedAddresses[0] : null);
      }
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address");
    }
  };

  // ✅ Handle when user returns to cart after order
  useEffect(() => {
    const handleReturnToCart = () => {
      console.log("User returned to cart, refreshing membership data...");
      checkMembershipForDelivery();
    };

    if (locationState?.fromPayment) {
      handleReturnToCart();
    }
  }, [locationState, checkMembershipForDelivery]);

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

            {cartItems.map((item) => {
              const isOutOfStock = item.FoodItem?.status === "1";
              return (
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
                          <h5 className="card-title">
                            {item.FoodItem?.foodName || 'Unknown Item'} {item.FoodItem?.foodSubCategory || 'Unknown Item'}
                            {isOutOfStock && (
                              <span className="badge bg-danger ms-2">Out of Stock</span>
                            )}
                          </h5>
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
                          <span className="text-muted">{item.FoodItem?.vendorName}</span>
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
                              disabled={updatingItems[`dec-${item._id}`] || item.quantity <= 1 || isOutOfStock}
                            >
                              {updatingItems[`dec-${item._id}`] ? '...' : '-'}
                            </button>
                            <span className="mx-2 fw-bold">{item.quantity}</span>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleQuantityChange('inc', item._id, item.FoodItem._id)}
                              disabled={updatingItems[`inc-${item._id}`] || isOutOfStock}
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
              );
            })}
          </div>
        </div>

        <div className="col-md-10 mx-auto col-lg-5 mt-lg-0 my-3">
          <div className="px-sm-3 FoodCartBox">
            {/* Membership Status Banner */}
            {checkingMembership ? (
              <div className="alert alert-info mb-3">
                <div className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  <small>Checking membership benefits...</small>
                </div>
              </div>
            ) : membershipData.hasActiveMembership && (
              <div className={`alert ${membershipData.isFreeDelivery ? 'alert-success' : 'alert-warning'} mb-3`}>
                <div className="d-flex align-items-center">
                  <i className="ri-medal-line fs-5 me-2"></i>
                  <div>
                    <strong>Membership Plan Active</strong>
                    <div className="small">
                      {membershipData.isFreeDelivery ? (
                        <>
                          <span className="d-block">Free delivery applied! ({membershipData.remainingDeliveries} deliveries remaining)</span>
                          <small className="text-muted">
                            Base delivery charges waived from your membership
                            {isRapidDeliveryFree && " • Rapid delivery is also FREE!"}
                          </small>
                        </>
                      ) : (
                        <span>Membership delivery limit exceeded</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state for delivery charges */}
            {(loadingCharges || calculatingCharges) && (
              <div className="alert alert-info mb-3">
                <div className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  <small>Calculating delivery charges...</small>
                </div>
              </div>
            )}

            {locationLoading && (
              <div className="alert alert-info mb-3">
                <small>Getting your location for accurate delivery charges...</small>
              </div>
            )}

            {/* ✅ UPDATED: Distance Information with Extra Charges Details */}
            {distanceInfo.distance > 0 && (
              <div className="alert alert-info mb-3">
                <div className="small">
                  <strong>Distance to Restaurant:</strong> {distanceInfo.distanceText}
                  {distanceInfo.durationText && (
                    <div><strong>Estimated Time:</strong> {distanceInfo.durationText}</div>
                  )}
                  
                  {/* Free Radius Information */}
                  {distanceInfo.freeDeliveryRadius && (
                    <div className="mt-1">
                      <strong>Free Delivery Radius:</strong> {distanceInfo.freeDeliveryRadius} km
                    </div>
                  )}
                  
                  {/* Extra Distance Charges Calculation */}
                  {distanceInfo.extraDistance > 0 && (
                    <div className="mt-1 border-top pt-1">
                      <strong>Extra Distance Charges:</strong>
                      <div className="ms-2">
                        <div>
                          • Extra Distance: {distanceInfo.extraDistance} km beyond free radius
                        </div>
                        <div>
                          • Rate: ₹{distanceInfo.perKmCharge || 5}/km
                        </div>
                        <div className="fw-bold">
                          • Extra Charges: ₹{distanceInfo.extraCharges.toFixed(2)}
                          <span className="text-muted ms-1">
                            {/* ({distanceInfo.extraDistance} km × ₹{distanceInfo.perKmCharge || 5}/km) */}
                          </span>
                        </div>
                        {distanceInfo.membershipApplied && (
                          <div className="text-success small mt-1">
                            <i className="ri-information-line me-1"></i>
                            Membership covers base delivery only. Extra distance charges still apply.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {distanceInfo.freeRadiusUsed && distanceInfo.extraDistance === 0 && (
                    <div className="text-success mt-1">
                      <i className="ri-checkbox-circle-line me-1"></i>
                      Within free delivery radius - No extra distance charges
                    </div>
                  )}
                  
                  {distanceInfo.distanceCalculationType === 'straight_line' && (
                    <div className="text-warning mt-1">
                      <small>Note: Using approximate distance</small>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedAddress && (
              <div className="card my-2">
                <div className="card-body">
                  <h6 className="fw-bold mb-2">Delivery Address </h6>
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

                {/* ✅ UPDATED: Delivery Charge with detailed breakdown including extra charges */}
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-medium">
                    Delivery Charge:
                    {distanceInfo.freeDeliveryEligible && (
                      <span className="text-success ms-1 small">(Free Base Delivery!)</span>
                    )}
                    {distanceInfo.membershipApplied && (
                      <span className="text-success ms-1 small">(Membership Free Delivery!)</span>
                    )}
                    {distanceInfo.rapidFreeApplied && (
                      <span className="text-success ms-1 small">(Free Rapid Delivery!)</span>
                    )}
                  </span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <span className="text-success">FREE</span>
                    ) : (
                      `₹${deliveryCharge.toFixed(2)}`
                    )}
                  </span>
                </div>

                {/* ✅ UPDATED: Delivery Charge Detailed Breakdown */}
                {deliveryCharge > 0 && (
                  <div className="small text-muted mt-1 ps-2 border-start border-secondary">
                    {/* Base Delivery */}
                    {distanceInfo.originalBaseDelivery > 0 && distanceInfo.membershipApplied && (
                      <div className="text-success">
                        <div>Base Delivery: ₹{distanceInfo.originalBaseDelivery.toFixed(2)} → FREE (Membership)</div>
                      </div>
                    )}
                    {distanceInfo.baseDelivery > 0 && !distanceInfo.membershipApplied && (
                      <div>Base Delivery: ₹{distanceInfo.baseDelivery.toFixed(2)}</div>
                    )}
                    
                    {/* Extra Distance Charges */}
                    {distanceInfo.extraCharges > 0 && (
                      <div className="mt-1">
                        <div className="fw-medium">Extra Distance Charges:</div>
                        <div className="ms-2">
                          <div className="text-muted">
                            {/* {distanceInfo.extraDistance} km × ₹{distanceInfo.perKmCharge || 5}/km */}
                          </div>
                          <div className="fw-bold">
                            ₹{distanceInfo.extraCharges.toFixed(2)}
                          </div>
                          {distanceInfo.membershipApplied && (
                            <div className="text-success small">
                              <i className="ri-information-line me-1"></i>
                              Extra distance charges apply even with membership
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Rapid Delivery */}
                    {distanceInfo.originalRapidDeliveryFee > 0 && distanceInfo.rapidFreeApplied && (
                      <div className="text-success mt-1">
                        <div>Rapid Delivery: ₹{distanceInfo.originalRapidDeliveryFee.toFixed(2)} → FREE (Membership)</div>
                      </div>
                    )}
                    {distanceInfo.rapidDeliveryFee > 0 && !distanceInfo.rapidFreeApplied && (
                      <div className="mt-1">Rapid Delivery: ₹{distanceInfo.rapidDeliveryFee.toFixed(2)}</div>
                    )}
                    
                    {/* Summary */}
                    <div className="mt-2 pt-2 border-top small">
                      <div className="d-flex justify-content-between">
                        <span>Total Delivery:</span>
                        <span className="fw-bold">₹{deliveryCharge.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tax */}
                {taxAmount > 0 && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-medium">Tax ({(foodDeliveryCharges?.taxPercentage || 0)}%):</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Final Total */}
                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                  <span className="fw-bold fs-6">Total Amount:</span>
                  <span className="fw-bold fs-5 text-mainRed">₹{finalTotal.toFixed(2)}</span>
                </div>

                {/* ✅ UPDATED: Membership Savings with extra charges note */}
                {distanceInfo.totalMembershipDiscount > 0 && (
                  <div className="mt-2">
                    <small className="text-success">
                      <i className="ri-money-rupee-circle-line me-1"></i>
                      Membership saved you ₹{distanceInfo.totalMembershipDiscount.toFixed(2)}!
                      {distanceInfo.rapidFreeApplied && " (Including free rapid delivery)"}
                      {distanceInfo.extraCharges > 0 && (
                        <span className="d-block text-muted small mt-1">
                          <i className="ri-information-line me-1"></i>
                          Extra distance charges (₹{distanceInfo.extraCharges.toFixed(2)}) still apply
                        </span>
                      )}
                    </small>
                  </div>
                )}

                {/* Free Delivery Message */}
                {foodDeliveryCharges && displayTotal < foodDeliveryCharges.freeDeliveryThreshold && !membershipData.isFreeDelivery && (
                  <div className="mt-2">
                    <small className="text-success">
                      Add ₹{(foodDeliveryCharges.freeDeliveryThreshold - displayTotal).toFixed(2)} more for FREE base delivery!
                    </small>
                  </div>
                )}

                {/* Membership Delivery Limit Info */}
                {membershipData.isFreeDelivery && membershipData.remainingDeliveries > 0 && (
                  <div className="mt-2">
                    <small className="text-info">
                      <i className="ri-information-line me-1"></i>
                      {membershipData.remainingDeliveries} free deliveries remaining in your membership
                      {isRapidDeliveryFree && " • Rapid delivery is also FREE!"}
                    </small>
                  </div>
                )}

                {/* ✅ Warning if last free delivery */}
                {membershipData.isFreeDelivery && membershipData.remainingDeliveries === 1 && (distanceInfo.membershipApplied || distanceInfo.rapidFreeApplied) && (
                  <div className="mt-2">
                    <small className="text-warning">
                      <i className="ri-alert-line me-1"></i>
                      This will use your last free delivery from membership
                    </small>
                  </div>
                )}
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

            {/* ✅ UPDATED: Delivery Options Section */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Delivery Options</h6>

                <div className="mb-3">
                  <label className="form-label">Delivery Date</label>
                  <input
                    type="date"
                    className="form-control mb-3"
                    min={moment().format("YYYY-MM-DD")}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />

                  <label className="form-label">Meal Type</label>

<div className="row text-center mb-3">

  {[
    { type: "morning", label: "Morning"},
    { type: "afternoon", label: "Afternoon"},
    { type: "evening", label: "Evening" }
  ].map((meal) => (

    <div className="col-4" key={meal.type}>

      <div
        onClick={() => setSelectedMealType(meal.type)}
        className={`border rounded p-3 ${
          selectedMealType === meal.type
            ? "bg-danger text-white"
            : "bg-light"
        }`}
        style={{ cursor: "pointer" }}
      >

        <div style={{ fontSize: "22px" }}>
          {meal.icon}
        </div>

        <div className="fw-semibold mt-1">
          {meal.label}
        </div>

      </div>

    </div>

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
                    <div className="alert alert-warning">No slots available for selected date/meal type</div>
                  )}
                </div>

                {/* ✅ UPDATED: Rapid Delivery Option */}
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rapidDelivery"
                    checked={isRapidDelivery}
                    onChange={handleRapidDeliveryChange}
                    disabled={checkingMembership}
                  />
                  <label className="form-check-label" htmlFor="rapidDelivery">
                    <strong>Rapid Delivery</strong> 
                    {isRapidDeliveryFree && membershipData.isFreeDelivery ? (
                      <span className="text-success ms-1">(FREE with membership!)</span>
                    ) : (
                      <span className="text-danger ms-1">
                        (+₹{foodDeliveryCharges?.rapidDeliveryCharge || 0})
                      </span>
                    )}
                    <small className="d-block text-muted">Faster delivery with priority handling</small>
                    {isRapidDeliveryFree && membershipData.isFreeDelivery && (
                      <small className="d-block text-success">
                        <i className="ri-medal-line me-1"></i>
                        Free rapid delivery included with your active membership
                      </small>
                    )}
                  </label>
                </div>

                {/* ✅ UPDATED: Delivery Charges Info with Extra Charges Details */}
                {foodDeliveryCharges && (
                  <div className="bg-light p-2 rounded small">
                    <div className="d-flex justify-content-between">
                      <span>Free Delivery Radius:</span>
                      <span>{foodDeliveryCharges.freeDeliveryRadius} km</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Extra Charges per km:</span>
                      <span className="text-danger">₹{foodDeliveryCharges.perKmCharge}/km beyond free radius</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Free Base Delivery Above:</span>
                      <span>₹{foodDeliveryCharges.freeDeliveryThreshold}</span>
                    </div>
                    {distanceInfo.extraDistance > 0 && (
                      <div className="mt-1 p-1 bg-white rounded border">
                        <div className="d-flex justify-content-between fw-medium">
                          <span>Current Extra Distance:</span>
                          <span>{distanceInfo.extraDistance} km</span>
                        </div>
                        <div className="d-flex justify-content-between text-danger">
                          <span>Extra Charges:</span>
                          <span>₹{distanceInfo.extraCharges.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    {membershipData.hasActiveMembership && (
                      <>
                        <div className="d-flex justify-content-between text-success mt-1">
                          <span>Membership Free Deliveries:</span>
                          <span>{membershipData.remainingDeliveries} remaining</span>
                        </div>
                        <div className="text-success small mt-1">
                          <i className="ri-information-line me-1"></i>
                          Membership covers base delivery charge {isRapidDeliveryFree && "AND rapid delivery"}
                          <div className="text-warning small mt-1">
                            <i className="ri-alert-line me-1"></i>
                            Extra distance charges still apply with membership
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              className="btn bg-mainRed text-light w-100 py-3 fs-5 rounded-2"
              disabled={!selectedAddress || !selectedSlot || isCheckingOut || cartItems.length === 0 || outOfStockItemsExist || calculatingCharges}
              onClick={handleCheckout}
            >
              {isCheckingOut ? 'Processing...' : calculatingCharges ? 'Calculating...' : `Pay ₹${finalTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      <AddAddress
        onAddressChange={setSelectedAddress}
        addresses={addresses}
        addNewAddress={handleAddNewAddress}
        updateAddress={handleUpdateAddress}
        deleteAddress={handleDeleteAddress}
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
