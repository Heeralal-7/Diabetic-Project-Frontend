import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { MyContext } from "../../../../Context/Context";
import { Container, Row, Col, Button, Alert, Spinner, Modal, Form, Offcanvas, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaMapMarkerAlt, FaTag, FaInfoCircle, FaMedal, FaRocket, FaRupeeSign, FaPrescription, FaFileUpload } from "react-icons/fa";
import moment from "moment";
import PharmacyAddress from "./PharmacyAddress";
import PharmacyCoupon from "./PharmacyCoupon";
import CardCartpage from "./CardCartpage";
import "./PharmacyCart.css";
import axios from "axios";

const PharmacyCartPage = () => {
  const {
    cartItems1: cartItems,
    loading: contextLoading,
    fetchCartItems,
    updateCartQuantity1,
    removeCartItem1,
    checkout,
    fetchAddresses,
    addNewAddress,
    updateAddress,
    deleteAddress,
    getAvailableSlots,
    getUserId,
    fetchVendorProducts,
    fetchVendorMedicines
  } = useContext(MyContext);

  const navigate = useNavigate();

  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({ id: null, text: "" });
  const [deliverySlot, setDeliverySlot] = useState("morning");
  const [isRapidDelivery, setIsRapidDelivery] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [orderSummary, setOrderSummary] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [showAddressOffcanvas, setShowAddressOffcanvas] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState({
    morning: [],
    afternoon: [],
    evening: [],
    date: ""
  });
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [slotLoading, setSlotLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendorMedicines, setVendorMedicines] = useState([]);
  const [showVendorItems, setShowVendorItems] = useState(false);
  const [loadingVendorItems, setLoadingVendorItems] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Prescription State
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  
  const [membershipData, setMembershipData] = useState({
    hasActiveMembership: false,
    isFreeDelivery: false,
    remainingDeliveries: 0,
    message: ""
  });
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [apiUrl] = useState(process.env.REACT_APP_API_URL || "http://localhost:5000");

  const vendorId = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return null;
    
    const firstVendorId = cartItems[0]?.vendorId;
    if (firstVendorId) {
      const allSameVendor = cartItems.every(item => item?.vendorId === firstVendorId);
      return allSameVendor ? firstVendorId : null;
    }
    
    const fallbackVendorId = cartItems[0]?.vendorDetails?._id;
    if (fallbackVendorId) {
      const allSameVendor = cartItems.every(item => {
        const itemVendorId = item?.vendorDetails?._id;
        return itemVendorId === fallbackVendorId;
      });
      return allSameVendor ? fallbackVendorId : null;
    }
    
    return null;
  }, [cartItems]);

  const deliverySlots = [
    { id: "morning", label: "Morning (6AM - 12PM)" },
    { id: "afternoon", label: "Afternoon (12PM - 4PM)" },
    { id: "evening", label: "Evening (4PM - 9PM)" },
  ];

  // Helper function to check if prescription is required
  const isPrescriptionRequired = useCallback((item) => {
    if (!item || !item.prescription_required) return false;
    
    const prescriptionValue = item.prescription_required;
    const value = prescriptionValue.toString().toLowerCase().trim();
    
    // Check for Yes/No or true/false
    return value === 'yes' || value === 'true';
  }, []);

  // Check if ANY item in cart requires prescription
  const cartRequiresPrescription = useMemo(() => {
    return cartItems.some(item => 
      item.itemType === "medicine" && 
      item.itemDetails && 
      isPrescriptionRequired(item.itemDetails)
    );
  }, [cartItems, isPrescriptionRequired]);

  const checkPharmacyMembership = useCallback(async () => {
    try {
      setCheckingMembership(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMembershipData({
          hasActiveMembership: false,
          isFreeDelivery: false,
          remainingDeliveries: 0,
          message: "Please login to check membership"
        });
        return;
      }

      const response = await axios.post(
        `${apiUrl}/user-membership/check-delivery`,
        { type: 'pharmacy' },
        {
          headers: {
            "Content-Type": "application/json",
            token: token
          }
        }
      );

      if (response.data.success === 1) {
        setMembershipData(response.data.data);
      } else {
        setMembershipData({
          hasActiveMembership: false,
          isFreeDelivery: false,
          remainingDeliveries: 0,
          message: response.data.message || "No active membership for pharmacy"
        });
      }
    } catch (error) {
      console.error('Error checking pharmacy membership:', error);
      setMembershipData({
        hasActiveMembership: false,
        isFreeDelivery: false,
        remainingDeliveries: 0,
        message: "Failed to check pharmacy membership"
      });
    } finally {
      setCheckingMembership(false);
    }
  }, [apiUrl]);

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
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          setLocationLoading(false);
          let errorMessage = 'Failed to get location';
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

  const requestLocationPermission = useCallback(async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted' || permission.state === 'prompt') {
          return true;
        } else {
          throw new Error('Location permission denied.');
        }
      }
      return true;
    } catch (error) {
      console.error('Location permission error:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const initializeCart = async () => {
      try {
        setLocalLoading(true);
        setAuthError(null);
        setError(null);
        
        const token = sessionStorage.getItem("token")|| localStorage.getItem("token");
        if (!token) {
          setAuthError("Please login to access your cart");
          return;
        }

        await fetchCartItems();
        await loadAddresses();
        
        if (cartItems && cartItems.length > 0) {
          try {
            await requestLocationPermission();
          } catch (locationError) {
            console.warn('Location permission warning:', locationError.message);
          }
        }
        
        setAuthError(null);
        setError(null);
      } catch (error) {
        setError(error.message || "Failed to load cart");
      } finally {
        setLocalLoading(false);
        setInitialized(true);
      }
    };

    initializeCart();
  }, []);

  useEffect(() => {
    if (initialized && cartItems && cartItems.length > 0) {
      checkPharmacyMembership();
    }
  }, [initialized, cartItems, checkPharmacyMembership]);

  useEffect(() => {
    if (vendorId && initialized) {
      loadAvailableSlots();
    }
  }, [vendorId, selectedDate, initialized]);

  const fetchVendorItems = useCallback(async () => {
    try {
      if (!vendorId) return;
      
      setLoadingVendorItems(true);
      setError(null);
      
      const [productsResult, medicinesResult] = await Promise.all([
        fetchVendorProducts(),
        fetchVendorMedicines()
      ]);
      
      if (productsResult?.success) {
        setVendorProducts(productsResult.data.map(item => ({
          ...item,
          stock: item.stock || item.stockFromVendor || item.totalStock || 0,
          isAvailable: (item.stock || item.stockFromVendor || item.totalStock || 0) > 0
        })) || []);
      }
      
      if (medicinesResult?.success) {
        setVendorMedicines(medicinesResult.data.map(item => ({
          ...item,
          stock: item.stock || item.stockFromVendor || item.totalStock || 0,
          isAvailable: (item.stock || item.stockFromVendor || item.totalStock || 0) > 0
        })) || []);
      }
      
      setShowVendorItems(true);
    } catch (error) {
      console.error('Error fetching vendor items:', error);
      setError('Failed to load vendor items');
    } finally {
      setLoadingVendorItems(false);
    }
  }, [vendorId, fetchVendorProducts, fetchVendorMedicines]);

  const loadAddresses = async () => {
    try {
      setAddressLoading(true);
      const addresses = await fetchAddresses();
      setAddresses(addresses || []);
      
      if (addresses?.length > 0) {
        const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
        setDeliveryAddress({
          id: defaultAddress._id,
          text: `${defaultAddress.name}, ${defaultAddress.address}, ${defaultAddress.city}, ${defaultAddress.state} - ${defaultAddress.pinCode}`
        });
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      setError("Failed to load addresses");
    } finally {
      setAddressLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setSlotLoading(true);
      const slots = await getAvailableSlots({
        startDate: selectedDate,
        vendorId: vendorId
      });
      
      const formattedSlots = {
        morning: slots?.morning || [],
        afternoon: slots?.afternoon || [],
        evening: slots?.evening || [],
        date: slots?.date || ""
      };
      
      setAvailableSlots(formattedSlots);
      
      if (formattedSlots[deliverySlot]?.length === 0) {
        const availableSlot = ["morning", "afternoon", "evening"].find(
          slot => formattedSlots[slot]?.length > 0
        );
        if (availableSlot) {
          setDeliverySlot(availableSlot);
        }
      }
    } catch (error) {
      console.error("Error loading slots:", error);
      setError("Failed to load available slots");
      setAvailableSlots({
        morning: [],
        afternoon: [],
        evening: [],
        date: ""
      });
    } finally {
      setSlotLoading(false);
    }
  };

  const totals = useMemo(() => {
    const result = {
      subTotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      taxPercentage: 0
    };

    if (!cartItems || cartItems.length === 0) return result;

    result.subTotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.vendorPrice || 0) * (item.quantity || 1),
      0
    );
    
    if (appliedCoupon) {
      result.discount = appliedCoupon.percentageDiscount 
        ? result.subTotal * (appliedCoupon.percentageDiscount / 100)
        : Math.min(appliedCoupon.fixedAmountDiscount || 0, result.subTotal);
    }
    
    result.tax = parseFloat((result.subTotal * (result.taxPercentage / 100))).toFixed(2);
    result.total = parseFloat((result.subTotal + parseFloat(result.tax) - result.discount)).toFixed(2);

    return {
      subTotal: result.subTotal.toFixed(2),
      tax: result.tax,
      discount: result.discount.toFixed(2),
      total: result.total,
      taxPercentage: result.taxPercentage
    };
  }, [cartItems, appliedCoupon]);

  const handleApplyCoupon = async () => {
    try {
      setCouponError("");
      
      if (!couponCode.trim()) {
        throw new Error("Please enter a coupon code");
      }

      if (!vendorId) {
        throw new Error("Coupons can only be applied when all items are from the same pharmacy");
      }

      throw new Error("Please browse available coupons to apply");
      
    } catch (error) {
      setCouponError(error.message);
    }
  };

  const handleCouponApplied = (coupon) => {
    try {
      const expiryDate = moment(coupon.expireDate, "DD/MM/YYYY");
      if (expiryDate.isBefore(moment(), 'day')) {
        throw new Error("This coupon has expired");
      }

      setCouponCode(coupon.couponCode);
      setAppliedCoupon({
        ...coupon,
        _id: coupon.couponId || coupon._id
      });
      setCouponError("");
      setShowCouponModal(false);
    } catch (error) {
      setCouponError(error.message);
    }
  };

  const handleCheckout = async () => {
    try {
      if (!deliveryAddress.id) {
        throw new Error("Please select a delivery address");
      }

      setLocalLoading(true);
      setError(null);
      
      const cartIds = cartItems.map((item) => item._id.toString());
      
      const selectedPatientAddress = addresses.find(a => a._id === deliveryAddress.id);
      
      let userLocation = null;
      try {
        userLocation = await getCurrentLocation();
      } catch (locationError) {
        console.warn('Could not get user location:', locationError);
        if (selectedPatientAddress && selectedPatientAddress.latitude && selectedPatientAddress.longitude) {
          userLocation = {
            latitude: selectedPatientAddress.latitude,
            longitude: selectedPatientAddress.longitude
          };
        } else {
          userLocation = {
            latitude: 28.6139,
            longitude: 77.2090
          };
        }
      }
      
      const checkoutPayload = {
        userId: getUserId(),
        cartIds,
        isRapidDelivery,
        couponCode: appliedCoupon ? appliedCoupon.couponCode : null,
        userLocation,
        addressId: deliveryAddress.id
      };

      const result = await checkout(checkoutPayload);
      
      if (result?.success) {
        setOrderSummary(result.data);
        setShowCheckoutModal(true);
      } else {
        throw new Error(result?.message || "Checkout failed");
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message || "Checkout failed. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrescriptionFile(file);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      // 1. Check Prescription
      let prescriptionImageUrl = "";
      
      if (cartRequiresPrescription) {
        if (!prescriptionFile) {
          alert("Please upload your prescription to proceed with this order.");
          return;
        }

        // Upload Prescription
        setUploadingPrescription(true);
        const formData = new FormData();
        formData.append('image', prescriptionFile); // Backend expecting 'req.file', standard name 'image' or 'file'

        try {
          const uploadRes = await axios.post(`${apiUrl}/shops/uploadPrescription`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'token': localStorage.getItem('token')
            }
          });

          if (uploadRes.data.success) {
            prescriptionImageUrl = uploadRes.data.imageUrl;
          } else {
            throw new Error(uploadRes.data.message || "Failed to upload prescription");
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          setUploadingPrescription(false);
          alert("Failed to upload prescription. Please try again.");
          return;
        }
        setUploadingPrescription(false);
      }

      // 2. Proceed with Order
      setLocalLoading(true);
      setError(null);
      
      if (!orderSummary) {
        throw new Error("Order summary is missing. Please complete checkout first.");
      }

      const selectedPatientAddress = addresses.find(a => a._id === deliveryAddress.id);
      
      let updatedRemainingDeliveries = membershipData.remainingDeliveries;
      let membershipWasApplied = false;
      
      if (membershipData.isFreeDelivery && 
          membershipData.remainingDeliveries > 0 &&
          orderSummary.deliveryCalculation?.membershipApplied) {
        membershipWasApplied = true;
        updatedRemainingDeliveries = membershipData.remainingDeliveries - 1;
      }

      const paymentPageData = {
        orderSummary: orderSummary,
        items: orderSummary.items,
        grandTotal: orderSummary.grandTotal,
        subTotal: orderSummary.subTotal,
        deliveryCharges: orderSummary.deliveryCharges,
        couponDiscount: orderSummary.couponDiscount,
        tax: orderSummary.tax,
        rapidDeliveryFee: orderSummary.rapidDeliveryFee,
        rapidDeliveryDiscount: orderSummary.deliveryCalculation?.rapidDeliveryDiscount || 0,
        extraDistanceCharges: orderSummary.extraDistanceCharges || 0,
        
        address: deliveryAddress.text,
        addressId: deliveryAddress.id,
        addressName: selectedPatientAddress?.name,
        phone: selectedPatientAddress?.phone,
        patientAddress: selectedPatientAddress,
        isRapidDelivery: isRapidDelivery,
        timeSlot: deliverySlot,
        dateSlot: selectedDate,
        
        vendorId: vendorId,
        vendorDetails: cartItems[0]?.vendorDetails,
        
        coupon: appliedCoupon,
        couponCode: appliedCoupon ? appliedCoupon.couponCode : null,
        
        membershipApplied: membershipData.isFreeDelivery,
        membershipRemainingDeliveries: updatedRemainingDeliveries,
        membershipWasApplied: membershipWasApplied,
        membershipOriginalCount: membershipData.remainingDeliveries,
        membershipDiscount: orderSummary.deliveryCalculation?.membershipDiscount || 0,
        membershipData: membershipData,
        
        distanceInfo: orderSummary.distanceInfo,
        cartIds: cartItems.map(item => item._id.toString()),
        userId: getUserId(),
        deliveryCalculation: orderSummary.deliveryCalculation,
        
        // Pass the uploaded prescription image URL
        prescriptionImage: prescriptionImageUrl
      };

      navigate('/pharmacy/payment', { 
        state: paymentPageData 
      });
      
    } catch (error) {
      console.error('Order confirmation error:', error);
      setError(error.message || "Failed to proceed to payment. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleAddressSelect = (address) => {
    if (address) {
      setDeliveryAddress({
        id: address._id,
        text: `${address.name}, ${address.address}, ${address.city}, ${address.state} - ${address.pinCode}`
      });
      setShowAddressOffcanvas(false);
    }
  };

  const handleAddNewAddress = async (newAddress) => {
    try {
      const addedAddress = await addNewAddress(newAddress);
      if (addedAddress) {
        const updatedAddresses = await fetchAddresses();
        setAddresses(updatedAddresses);
        handleAddressSelect(addedAddress);
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
      
      if (deliveryAddress.id === addressId) {
        const updatedAddress = updatedAddresses.find(addr => addr._id === addressId);
        if (updatedAddress) {
          handleAddressSelect(updatedAddress);
        }
      }
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
      
      if (deliveryAddress.id === addressId) {
        if (updatedAddresses.length > 0) {
          handleAddressSelect(updatedAddresses[0]);
        } else {
          setDeliveryAddress({ id: null, text: "" });
        }
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address");
    }
  };

  const renderDeliveryDateOptions = () => {
    const dates = [];
    const today = moment();
    
    for (let i = 0; i < 7; i++) {
      const date = today.clone().add(i, 'days');
      dates.push({
        value: date.format("YYYY-MM-DD"),
        label: date.format("ddd, D MMM"),
        isToday: i === 0
      });
    }
    
    return (
      <div className="mb-3">
        <h5>Delivery Date</h5>
        <div className="d-flex flex-wrap gap-2">
          {dates.map(date => (
            <Button
              key={date.value}
              variant={selectedDate === date.value ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setSelectedDate(date.value)}
            >
              {date.label} {date.isToday && "(Today)"}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderSlotOptions = () => {
    if (slotLoading) {
      return (
        <div className="text-center py-2">
          <Spinner animation="border" size="sm" />
          <p className="mt-2 small">Loading available slots...</p>
        </div>
      );
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = moment(selectedDate).isSame(moment(), 'day');

    const hasAvailableSlots = 
      availableSlots.morning?.length > 0 || 
      availableSlots.afternoon?.length > 0 || 
      availableSlots.evening?.length > 0;

    if (!hasAvailableSlots) {
      return (
        <Alert variant="warning" className="py-2 small">
          No delivery slots available for {moment(selectedDate).format("ddd, D MMM")}. 
          Please try another date.
        </Alert>
      );
    }

    return (
      <div className="slot-options">
        {deliverySlots.map((slot) => {
          const slotData = availableSlots[slot.id];
          let filteredSlots = slotData || [];
          
          if (isToday && slotData) {
            filteredSlots = slotData.filter(timeSlot => {
              const [startHour, startMinute] = timeSlot.startTime.split(':').map(Number);
              const slotStartMinutes = startHour * 60 + startMinute;
              return (slotStartMinutes - currentMinutes) >= 30;
            });
          }

          const isAvailable = filteredSlots.length > 0;
          const isSelected = deliverySlot === slot.id;
          
          return (
            <div 
              key={slot.id}
              className={`slot-option ${isSelected ? "selected" : ""} ${!isAvailable ? "disabled" : ""}`}
              onClick={() => isAvailable && setDeliverySlot(slot.id)}
            >
              <div className="slot-header">
                <Form.Check
                  type="radio"
                  id={`slot-${slot.id}`}
                  label={slot.label}
                  checked={isSelected}
                  onChange={() => {}}
                  disabled={!isAvailable}
                />
              </div>
              
              {isAvailable && filteredSlots.length > 0 && (
                <div className="slot-times">
                  {filteredSlots.map((timeSlot, index) => (
                    <span key={index} className="badge bg-light text-dark me-1 mb-1">
                      {timeSlot.startTime} - {timeSlot.endTime}
                    </span>
                  ))}
                </div>
              )}
              
              {!isAvailable && (
                <div className="slot-unavailable small text-muted">
                  {filteredSlots.length === 0 && slotData?.length > 0 ? 
                    "No slots available (less than 30 minutes remaining)" : 
                    "No slots available"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDistanceInfo = () => {
    if (!orderSummary?.distanceInfo) return null;

    const { distanceInfo } = orderSummary;
    const { deliveryCalculation } = orderSummary;
    
    return (
      <div className="mt-3 p-3 bg-light rounded small">
        <h6 className="mb-2 d-flex align-items-center">
          <FaMapMarkerAlt className="me-2 text-primary" />
          Delivery Distance Details
        </h6>
        <div className="row">
          <div className="col-6">
            <strong>Distance:</strong> {parseFloat(distanceInfo.distance).toFixed(1)} km
          </div>
          <div className="col-6">
            <strong>Free Radius:</strong> {distanceInfo.freeRadius} km
          </div>
        </div>
        
        {distanceInfo.extraDistance > 0 && (
          <div className="row mt-1">
            <div className="col-6">
              <strong>Extra Distance:</strong> {parseFloat(distanceInfo.extraDistance).toFixed(1)} km beyond free radius
            </div>
            <div className="col-6">
              <strong>Extra Charges:</strong> ₹{distanceInfo.extraCharges || 0}
              <div className="text-muted extra-small">
                (₹{distanceInfo.perKmCharge || 5} per extra km)
              </div>
            </div>
          </div>
        )}
        
        {deliveryCalculation?.rapidDeliveryApplied && (
          <div className="mt-2 p-2 bg-success text-white rounded">
            <div className="d-flex align-items-center">
              <FaRocket className="me-2" />
              <div>
                <strong>Rapid Delivery FREE with Membership!</strong>
                <div className="small">
                  Free pharmacy delivery available, so rapid delivery is also free
                  {deliveryCalculation.rapidDeliveryDiscount > 0 && (
                    <div className="mt-1">
                      <strong>Rapid Delivery Savings:</strong> ₹{deliveryCalculation.rapidDeliveryDiscount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isRapidDelivery && !deliveryCalculation?.rapidDeliveryApplied && deliveryCalculation?.rapidDeliveryFee > 0 && (
          <div className="mt-2 p-2 bg-warning rounded">
            <div className="d-flex align-items-center">
              <FaRocket className="me-2 text-dark" />
              <div>
                <strong>Rapid Delivery Charges Apply</strong>
                <div className="small text-dark">
                  Pharmacy membership delivery limit exhausted or no membership
                  <div className="mt-1">
                    <strong>Rapid Delivery Fee:</strong> ₹{deliveryCalculation.rapidDeliveryFee.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {deliveryCalculation?.membershipApplied ? (
          <div className="mt-2  text-white rounded">
  
            
          </div>
        ) : distanceInfo?.freeDeliveryEligible ? (
          <div className="mt-2 p-2 bg-success text-white rounded">
            <strong>🎉 Free Base Delivery Applied!</strong> 
            <div className="small">
              Base delivery charge waived (order above ₹{distanceInfo?.freeDeliveryThreshold || 0})
            </div>
          </div>
        ) : (
          <div className="mt-1 small text-muted">
            Add ₹{(distanceInfo?.freeDeliveryThreshold || 0) - (orderSummary?.subTotal || 0) > 0 
              ? ((distanceInfo?.freeDeliveryThreshold || 0) - (orderSummary?.subTotal || 0)).toFixed(2) 
              : '0.00'} more for free base delivery
          </div>
        )}
        
        {distanceInfo.extraDistance > 0 && (
          <div className="mt-2 p-2 bg-info text-white rounded">
            <FaInfoCircle className="me-1" />
            <strong>Important Note:</strong> Extra kilometer charges apply for distance beyond {distanceInfo.freeRadius}km free radius, 
            <strong> regardless of membership or order value.</strong> These charges are separate from base delivery.
          </div>
        )}
      </div>
    );
  };

  const renderRapidDeliveryToggle = () => {
    const isFreeRapidDelivery = membershipData.isFreeDelivery && 
                               membershipData.remainingDeliveries > 0 && 
                               isRapidDelivery;
    
    const isRapidDeliveryPaid = !membershipData.isFreeDelivery && isRapidDelivery;
    
    return (
      <div className="mb-3">
        <Form.Check
          type="checkbox"
          id="rapidDelivery"
          label={
            <div className="d-flex align-items-center">
              <FaRocket className="me-2 text-warning" />
              <span>
                Rapid Delivery 
                <span className="text-muted small ms-1">
                  (Faster delivery with additional charges)
                </span>
              </span>
              {isFreeRapidDelivery && (
                <span className="badge bg-success ms-2">
                  <FaMedal className="me-1" /> FREE with Membership
                </span>
              )}
              {isRapidDeliveryPaid && (
                <span className="badge bg-warning ms-2 text-dark">
                  <FaRupeeSign className="me-1" /> Paid
                </span>
              )}
            </div>
          }
          checked={isRapidDelivery}
          onChange={() => setIsRapidDelivery(!isRapidDelivery)}
          className="mb-2"
        />
        
        {isRapidDelivery && (
          <div className="ms-4">
            {isFreeRapidDelivery ? (
              <Alert variant="success" className="py-2 small">
                <FaMedal className="me-1" />
                <strong>Free Pharmacy Delivery Available = Rapid Delivery is FREE!</strong>
                <div className="small mt-1">
                  You have {membershipData.remainingDeliveries} free deliveries remaining
                </div>
              </Alert>
            ) : membershipData.isFreeDelivery && membershipData.remainingDeliveries === 0 ? (
              <Alert variant="warning" className="py-2 small">
                <FaMedal className="me-1" />
                <strong>Pharmacy membership delivery limit exhausted</strong>
                <div className="small mt-1">
                  Rapid delivery charges will apply. Base delivery charges also apply.
                  <div className="mt-1">
                    <strong>Note:</strong> Extra kilometer charges may still apply based on distance.
                  </div>
                </div>
              </Alert>
            ) : !membershipData.hasActiveMembership ? (
              <Alert variant="info" className="py-2 small">
                <FaRocket className="me-1" />
                <strong>Get a Pharmacy Membership for Free Rapid Deliveries!</strong>
                <div className="small mt-1">
                  Rapid delivery charges apply. Join our membership program for free deliveries.
                  <div className="mt-1">
                    <strong>Note:</strong> Extra kilometer charges may still apply based on distance.
                  </div>
                </div>
              </Alert>
            ) : (
              <Alert variant="info" className="py-2 small">
                <FaRocket className="me-1" />
                <strong>Rapid delivery charges apply</strong>
                <div className="small mt-1">
                  Standard delivery charges plus rapid delivery fee will be added.
                  <div className="mt-1">
                    <strong>Note:</strong> Extra kilometer charges may still apply based on distance.
                  </div>
                </div>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  };

  if (localLoading || !initialized) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading your cart...</p>
      </Container>
    );
  }

  if (authError) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger" className="shadow-sm">
          <h4 className="alert-heading">Authentication Required</h4>
          <p>{authError}</p>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <Button 
              onClick={() => navigate("/login")} 
              variant="primary"
              size="lg"
            >
              Login
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline-primary"
              size="lg"
            >
              Refresh
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="shadow-sm">
          <h4 className="alert-heading">Error Loading Cart</h4>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            onClick={() => {
              fetchCartItems();
              setError(null);
            }}
            className="mt-2"
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if ((!cartItems || cartItems.length === 0) && !localLoading && !authError && !error) {
    return (
      <Container className="py-5 text-center empty-cart-container">
        <div className="empty-cart-icon">
          <FaShoppingCart />
        </div>
        <h3 className="mt-3">Your cart is empty</h3>
        <p className="text-muted mb-4">Add some medicines or products to get started</p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/pharmacy/medicines" className="btn btn-primary px-4 py-2">
            Browse Medicines
          </Link>
          <Link to="/pharmacy/products" className="btn btn-outline-primary px-4 py-2">
            Browse Products
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4 pharmacy-cart-container">
      <h1 className="mb-4 text-primary">Your Shopping Cart</h1>

      {checkingMembership ? (
        <div className="mb-4">
          <div className="alert alert-info">
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              <small>Checking pharmacy membership benefits...</small>
            </div>
          </div>
        </div>
      ) : membershipData.hasActiveMembership && (
        <div className="mb-4">
          <div className={`alert ${membershipData.isFreeDelivery ? 'alert-success' : 'alert-warning'}`}>
            <div className="d-flex align-items-center">
              <FaMedal className="fs-5 me-2" />
              <div>
                <strong>Pharmacy Membership Plan Active</strong>
                <div className="small">
                  {membershipData.isFreeDelivery ? (
                    <>
                      <span className="d-block">Free pharmacy delivery available! ({membershipData.remainingDeliveries} deliveries remaining)</span>
                      <small className="text-muted">
                        Includes free base delivery{isRapidDelivery ? " and free rapid delivery" : ""}
                        <div className="mt-1">
                          <strong>Note:</strong> Extra kilometer charges may still apply based on distance.
                        </div>
                      </small>
                    </>
                  ) : (
                    <span>Pharmacy membership delivery limit exhausted</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Row>
        <Col lg={8} className="mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom-0">
              <h4 className="mb-0 d-flex align-items-center">
                <FaShoppingCart className="me-2" />
                {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
              </h4>
            </div>
            <div className="card-body p-0">
              {cartItems.map((item) => {
                const isMedicine = item.itemType === "medicine";
                const requiresPrescription = isMedicine && isPrescriptionRequired(item.itemDetails);
                
                return (
                  <div key={item._id} className="border-bottom p-3 cart-item">
                    <Row className="align-items-center">
                      <Col xs={4} md={2}>
                        <div className="cart-item-image-container d-flex justify-content-center position-relative" style={{ 
                          height: '120px',
                          width: '120px',
                          overflow: 'hidden',
                          borderRadius: '8px',
                          margin: '0 auto'
                        }}>
                          <img
                            src={item.itemDetails?.image_url || 
                                 item.itemDetails?.image || 
                                 item.itemDetails?.images?.[0] || 
                                 item.itemDetails?.url || 
                                 "https://cdn.pixabay.com/photo/2020/03/18/15/16/blood-4944423_1280.jpg"}
                            alt={item.itemDetails?.name}
                            className="img-fluid rounded cart-item-image shadow-sm"
                            onError={(e) => {
                              e.target.src = "https://cdn.pixabay.com/photo/2020/03/18/15/16/blood-4944423_1280.jpg";
                            }}
                            loading="lazy"
                          />
                        </div>
                      </Col>
                      <Col xs={9} md={6}>
                        <h5 className="mb-1 cart-item-title d-flex align-items-center">
                          {item.itemDetails?.name || "Unknown Item"}
                          {requiresPrescription && (
                            <Badge className="ms-2" 
                              style={{
                                backgroundColor: '#ffc107',
                                color: 'white',
                                fontSize: '0.7rem',
                                padding: '2px 6px'
                              }}>
                              <FaPrescription className="me-1" size={10} />
                              Prescription Required
                            </Badge>
                          )}
                        </h5>
                        <p className="small text-muted mb-1">
                          {isMedicine ? "Medicine" : "Product"}
                        </p>
                        <p className="mb-1">
                          <span className="fw-bold text-primary">
                            ₹{parseFloat(item.vendorPrice || 0).toFixed(2)}
                          </span>
                          {item.discountPercent > 0 && (
                            <span className="text-success ms-2 small">
                              {item.discountPercent}% OFF
                            </span>
                          )}
                        </p>
                        <p className="small text-muted mb-0">
                          Sold by: <span className="text-dark">{item.vendorDetails?.name || "Pharmacy"}</span>
                        </p>
                      </Col>
                      <Col xs={12} md={4} className="mt-2 mt-md-0">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center quantity-controls">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="quantity-btn"
                              onClick={() => updateCartQuantity1(item._id, "decrease")}
                              disabled={item.quantity <= 1 || contextLoading}
                            >
                              <FaMinus size={12} />
                            </Button>
                            <span className="mx-2 quantity-display">{item.quantity}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="quantity-btn"
                              onClick={() => updateCartQuantity1(item._id, "increase")}
                              disabled={item.quantity >= (item.stockAvailable || 10) || contextLoading}
                            >
                              <FaPlus size={12} />
                            </Button>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="remove-btn"
                            onClick={() => removeCartItem1(item._id)}
                            disabled={contextLoading}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                        <div className="mt-2 text-end">
                          <h5 className="mb-0 text-primary">
                            ₹{(parseFloat(item.vendorPrice || 0) * (item.quantity || 1)).toFixed(2)}
                          </h5>
                        </div>
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </div>
          </div>

          {vendorId && (
            <div className="card shadow-sm mt-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">More from {cartItems[0]?.vendorDetails?.shopName || "this pharmacy"}</h5>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => showVendorItems ? setShowVendorItems(false) : fetchVendorItems()}
                  disabled={loadingVendorItems}
                >
                  {showVendorItems ? 'Hide' : 'Show'} Items
                  {loadingVendorItems && <Spinner size="sm" className="ms-2" />}
                </Button>
              </div>
              
              {showVendorItems && (
                <div className="card-body">
                  {loadingVendorItems ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" />
                      <p className="mt-2">Loading pharmacy items...</p>
                    </div>
                  ) : (
                    <>
                      {vendorProducts.length > 0 && (
                        <div className="mb-4">
                          <h6 className="border-bottom pb-2 mb-3">Products</h6>
                          <Row className="g-3">
                            {vendorProducts.slice(0, 3).map(product => (
                              <Col key={product.productId} xs={6} md={4} lg={4}>
                                <CardCartpage 
                                  item={{
                                    ...product,
                                    stock: product.stock,
                                    isAvailable: product.isAvailable
                                  }} 
                                />
                              </Col>
                            ))}
                          </Row>
                          {vendorProducts.length > 4 && (
                            <div className="text-center mt-3">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => navigate(`/pharmacy/products`)}
                              >
                                View All {vendorProducts.length} Products
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {vendorMedicines.length > 0 && (
                        <div>
                          <h6 className="border-bottom pb-2 mb-3">Medicines</h6>
                          <Row className="g-3">
                            {vendorMedicines.slice(0, 3).map(medicine => (
                              <Col key={medicine.productId} xs={6} md={4} lg={4}>
                                <CardCartpage 
                                  item={{
                                    ...medicine,
                                    stock: medicine.stock,
                                    isAvailable: medicine.isAvailable
                                  }} 
                                  isMedicine 
                                />
                              </Col>
                            ))}
                          </Row>
                          {vendorMedicines.length > 4 && (
                            <div className="text-center mt-3">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => navigate(`/pharmacy/medicines`)}
                              >
                                View All {vendorMedicines.length} Medicines
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {(vendorProducts.length === 0 && vendorMedicines.length === 0) && (
                        <Alert variant="info" className="mb-0">
                          No additional products or medicines found from this pharmacy.
                        </Alert>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </Col>

        <Col style={{ position: 'sticky', top: '1rem' }} lg={4}>
          <div className="card shadow-sm sticky-top order-summary-card">
            <div className="card-header bg-white">
              <h4 className="mb-0">Order Summary</h4>
              {membershipData.hasActiveMembership && membershipData.isFreeDelivery && (
                <span className="badge bg-success float-end">
                  <FaMedal className="me-1" />Pharmacy Membership Active
                </span>
              )}
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5>Delivery Address</h5>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setShowAddressOffcanvas(true)}
                    className="p-0"
                  >
                    <FaMapMarkerAlt className="me-1" /> Change
                  </Button>
                </div>
                {deliveryAddress.text ? (
                  <div className="border rounded p-2 bg-light">
                    <p className="mb-0 small">
                      <strong>{addresses.find(a => a._id === deliveryAddress.id)?.name}</strong>
                      <br />
                      {deliveryAddress.text.replace(`${addresses.find(a => a._id === deliveryAddress.id)?.name}, `, '')}
                    </p>
                  </div>
                ) : (
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    onClick={() => setShowAddressOffcanvas(true)}
                  >
                    <FaMapMarkerAlt className="me-2" /> Add Delivery Address
                  </Button>
                )}
              </div>

              <div className="mb-3">
                <h5>Delivery Options</h5>
                {renderDeliveryDateOptions()}
                
                {renderRapidDeliveryToggle()}

                {!isRapidDelivery && (
                  <>
                    <h6 className="mb-2">Delivery Slot</h6>
                    {renderSlotOptions()}
                  </>
                )}
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5>Apply Coupon</h5>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setShowCouponModal(true)}
                    className="p-0"
                    disabled={!vendorId}
                  >
                    <FaTag className="me-1" /> Browse Offers
                  </Button>
                </div>
                
                <div className="input-group mb-2">
                  <Form.Control
                    type="text"
                    placeholder={vendorId ? "Enter coupon code" : "Browse offers to apply coupon"}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon || !vendorId}
                  />
                  <Button 
                    variant={appliedCoupon ? "success" : "outline-secondary"}
                    onClick={handleApplyCoupon}
                    disabled={!!appliedCoupon || !vendorId}
                  >
                    {appliedCoupon ? "Applied" : "Apply"}
                  </Button>
                </div>
                
                {appliedCoupon ? (
                  <Alert variant="success" className="py-2 small mb-2">
                    {appliedCoupon.description || `Coupon applied: ${couponCode}`}
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 ms-2"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode("");
                      }}
                    >
                      Remove
                    </Button>
                  </Alert>
                ) : couponError ? (
                  <Alert variant="danger" className="py-2 small mb-0">
                    {couponError}
                  </Alert>
                ) : !vendorId && cartItems.length > 0 ? (
                  <Alert variant="info" className="py-2 small mb-0">
                    Please ensure all items are from the same pharmacy to apply coupons
                  </Alert>
                ) : null}
              </div>

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{totals.subTotal}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Discount:</span>
                    <span>-₹{totals.discount}</span>
                  </div>
                )}
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery:</span>
                  <span className="text-muted small">
                    {locationLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Calculated by distance"
                    )}
                  </span>
                </div>
                
                {isRapidDelivery && membershipData.isFreeDelivery && membershipData.remainingDeliveries > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>
                      <FaRocket className="me-1" />
                      Rapid Delivery:
                    </span>
                    <span>FREE (Membership)</span>
                  </div>
                )}
          
                
                <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-2 border-top">
                  <span>Estimated Total:</span>
                  <span className="text-primary">₹{totals.total}</span>
                </div>

            

                <Button
                  variant="primary"
                  className="w-100 mt-3 py-2 checkout-btn"
                  onClick={handleCheckout}
                  disabled={!deliveryAddress.text.trim() || contextLoading || localLoading || locationLoading}
                >
                  {contextLoading || localLoading || locationLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      {locationLoading ? "Getting Location..." : "Processing..."}
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Offcanvas
        show={showAddressOffcanvas}
        onHide={() => setShowAddressOffcanvas(false)}
        placement="end"
        className="offcanHeightFull"
        backdrop="static"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Delivery Address</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {addressLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading addresses...</p>
            </div>
          ) : (
            <PharmacyAddress
              addresses={addresses}
              fetchAddresses={fetchAddresses}
              addNewAddress={handleAddNewAddress}
              updateAddress={handleUpdateAddress}
              deleteAddress={handleDeleteAddress}
              onAddressChange={handleAddressSelect}
            />
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <Modal 
        show={showCouponModal} 
        onHide={() => setShowCouponModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Available Pharmacy Coupons</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {vendorId ? (
            <PharmacyCoupon
              vendorId={vendorId}
              onCouponApplied={handleCouponApplied}
            />
          ) : (
            <Alert variant="info">
              Coupons are only available when all items in your cart are from the same pharmacy.
              Please adjust your cart to view available offers.
            </Alert>
          )}
        </Modal.Body>
      </Modal>

      <Modal 
        show={showCheckoutModal} 
        onHide={() => setShowCheckoutModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="w-100 text-center">
            <h4 className="mb-0">Confirm Your Order</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderSummary ? (
            <>
              <div className="mb-4">
                <h5 className="border-bottom pb-2">Delivery Details</h5>
                <p className="mb-1">
                  <strong>Name:</strong> {addresses.find(a => a._id === deliveryAddress.id)?.name}
                </p>
                <p className="mb-1">
                  <strong>Address:</strong> {deliveryAddress.text.replace(`${addresses.find(a => a._id === deliveryAddress.id)?.name}, `, '')}
                </p>
                <p className="mb-0">
                  <strong>Delivery Time:</strong>{" "}
                  {isRapidDelivery
                    ? "Rapid Delivery (Will be assigned soon)"
                    : `${deliverySlots.find((s) => s.id === deliverySlot)?.label}`}
                </p>
                
                {orderSummary.deliveryCalculation?.rapidDeliveryApplied && (
                  <div className="mt-3 p-2 bg-success text-white rounded">
                    <div className="d-flex align-items-center">
                      <FaRocket className="me-2" />
                      <div>
                        <strong>Rapid Delivery FREE with Membership!</strong>
                        <div className="small">
                          Free pharmacy delivery available, so rapid delivery is also free
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
              
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">Order Items</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Price</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderSummary.items.map((item) => {
                        const originalCartItem = cartItems.find(cartItem => 
                          cartItem._id.toString() === item.cartItemId || 
                          cartItem.itemDetails?._id === item.itemId ||
                          cartItem.itemDetails?.productId === item.itemId ||
                          cartItem.itemDetails?.medicineId === item.itemId
                        );
                        
                        const isMedicine = originalCartItem?.itemType === "medicine";
                        const requiresPrescription = isMedicine && originalCartItem?.itemDetails && 
                          isPrescriptionRequired(originalCartItem.itemDetails);
                        
                        return (
                          <tr key={item.itemId}>
                            <td>
                              <div className="d-flex align-items-center">
                                {item.itemName}
                                {requiresPrescription && (
                                  <Badge className="ms-2" 
                                    style={{
                                      backgroundColor: '#ffc107',
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      padding: '2px 6px'
                                    }}>
                                    <FaPrescription className="me-1" size={10} />
                                    
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">₹{item.unitPrice.toFixed(2)}</td>
                            <td className="text-end">₹{item.totalPrice.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Prescription Upload Section - Only visible if required */}
                {cartRequiresPrescription && (
                  <div className="mb-4 p-3 bg-light border rounded border-warning">
                    <div className="d-flex align-items-start">
                      <FaPrescription className="text-warning fs-3 me-3 mt-1" />
                      <div className="w-100">
                        <h6 className="fw-bold text-dark">Prescription Required</h6>
                        <p className="small text-muted mb-3">
                          Some items in your cart require a valid prescription. Please upload a clear image of your doctor's prescription to proceed.
                        </p>
                        
                        <Form.Group controlId="prescriptionUpload">
                          <Form.Control 
                            type="file" 
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            className="mb-2"
                          />
                        </Form.Group>
                        
                        {prescriptionFile && (
                          <div className="text-success small d-flex align-items-center mt-2">
                            <FaFileUpload className="me-1" />
                            File selected: {prescriptionFile.name}
                          </div>
                        )}
                        
                        {uploadingPrescription && (
                          <div className="mt-2 text-primary small d-flex align-items-center">
                            <Spinner size="sm" animation="border" className="me-2" />
                            Uploading prescription...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              
              </div>

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between">
                  <span>Subtotal:</span>
                  <span>₹{orderSummary.subTotal.toFixed(2)}</span>
                </div>
                
                {orderSummary.couponDetails && (
                  <div className="d-flex justify-content-between text-success">
                    <span>Discount:</span>
                    <span>-₹{orderSummary.couponDiscount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                
                <div className="d-flex justify-content-between">
                  <span>Tax ({orderSummary.taxPercentage || 0}%):</span>
                  <span>₹{orderSummary.tax?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="d-flex justify-content-between">
                  <span>Base Delivery:</span>
                  <span>
                    {orderSummary.deliveryCharges === 0 || (orderSummary.deliveryCalculation?.membershipApplied) ? (
                      <span className="text-success">
                        {orderSummary.deliveryCalculation?.membershipApplied ? "FREE (Membership)" : "FREE"}
                      </span>
                    ) : (
                      `₹${orderSummary.deliveryCharges?.toFixed(2) || '0.00'}`
                    )}
                  </span>
                </div>
                
                {orderSummary.deliveryCalculation?.extraCharges > 0 && (
                  <div className="d-flex justify-content-between">
                    <span>
                      <FaMapMarkerAlt size={12} className="me-1" />
                      Extra Distance ({parseFloat(orderSummary.deliveryCalculation?.extraDistance || 0).toFixed(1)}km):
                    </span>
                    <span>
                      ₹{orderSummary.deliveryCalculation.extraCharges?.toFixed(2) || '0.00'}
                      <div className="text-muted extra-small">
                        (₹{orderSummary.distanceInfo?.perKmCharge || 5} per extra km)
                      </div>
                    </span>
                  </div>
                )}
                
                {orderSummary.isRapidDelivery && (
                  <div className="d-flex justify-content-between">
                    <span>Rapid Delivery Fee:</span>
                    <span>
                      {orderSummary.deliveryCalculation?.rapidDeliveryApplied ? (
                        <span className="text-success">FREE (Membership)</span>
                      ) : (
                        `₹${orderSummary.rapidDeliveryFee?.toFixed(2) || '0.00'}`
                      )}
                    </span>
                  </div>
                )}
                
                {orderSummary.deliveryCalculation?.rapidDeliveryApplied && orderSummary.deliveryCalculation?.rapidDeliveryDiscount > 0 && (
                  <div className="d-flex justify-content-between text-success">
                    <span>
                      <FaRocket className="me-1" />
                      Rapid Delivery Savings:
                    </span>
                    <span>-₹{orderSummary.deliveryCalculation.rapidDeliveryDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                {orderSummary.deliveryCalculation?.membershipApplied && orderSummary.deliveryCalculation?.membershipDiscount > 0 && (
                  <div className="d-flex justify-content-between text-success">
                    <span>
                      <FaMedal className="me-1" />
                      Membership Savings:
                    </span>
                    <span>-₹{orderSummary.deliveryCalculation.membershipDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                {renderDistanceInfo()}
                
                <div className="d-flex justify-content-between fw-bold fs-5 mt-2 pt-2 border-top">
                  <span>Total Amount:</span>
                  <span className="text-primary">₹{orderSummary.grandTotal?.toFixed(2)}</span>
                </div>
              </div>
              
              {orderSummary.membershipData?.isFreeDelivery && 
               orderSummary.membershipData.remainingDeliveries === 1 && 
               (orderSummary.deliveryCalculation?.membershipApplied || orderSummary.deliveryCalculation?.rapidDeliveryApplied) && (
                <div className="alert alert-warning py-2 small mt-3">
                  <FaMedal className="me-1" />
                  This will use your last free pharmacy delivery from membership
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading order details...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowCheckoutModal(false)}
            className="px-4 py-2"
            disabled={uploadingPrescription}
          >
            Back to Cart
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmOrder} 
            disabled={contextLoading || localLoading || uploadingPrescription}
            className="px-4 py-2"
          >
            {uploadingPrescription ? (
               <>
                 <Spinner as="span" size="sm" animation="border" className="me-2" />
                 Uploading Prescription...
               </>
            ) : contextLoading || localLoading ? (
              <>
                <Spinner as="span" size="sm" animation="border" className="me-2" />
                Confirming...
              </>
            ) : (
              "Confirm & Proceed to Payment"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PharmacyCartPage;