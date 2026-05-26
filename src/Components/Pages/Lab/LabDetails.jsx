import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { MyContext } from "../../../Context/Context";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as bootstrap from "bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

// --- RATING STAR COMPONENT ---
const VendorHalfStar = ({ index, rating, hoverRating, setHover, setRating }) => {
  const fullStarValue = index + 1;
  const halfStarValue = index + 0.5;
  const displayRating = hoverRating || rating;
  const isHalfActive = displayRating >= halfStarValue;
  const isActive = displayRating >= fullStarValue;

  return (
    <div style={{ display: 'flex', position: 'relative', width: '2rem', height: '2rem' }}>
      <span
        className="cl-star-cursor"
        onMouseEnter={() => setHover(halfStarValue)}
        onMouseLeave={() => setHover(0)}
        onClick={() => setRating(halfStarValue)}
        style={{
          position: 'absolute', left: 0, width: '50%', overflow: 'hidden', zIndex: 2,
          color: isHalfActive ? '#ffc107' : '#e4e5e9', fontSize: '2rem', lineHeight: 1, cursor: 'pointer'
        }}
      >★</span>
      <span
        className="cl-star-cursor"
        onMouseEnter={() => setHover(fullStarValue)}
        onMouseLeave={() => setHover(0)}
        onClick={() => setRating(fullStarValue)}
        style={{
          position: 'absolute', left: 0, width: '100%', zIndex: 1,
          color: isActive ? '#ffc107' : '#e4e5e9', fontSize: '2rem', lineHeight: 1, cursor: 'pointer'
        }}
      >★</span>
    </div>
  );
};

// --- Custom Hook for Vendor-Specific Cart ---
const useVendorCart = (vendorId) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("labCartItems");
    const cartData = storedCart ? JSON.parse(storedCart) : {};
    setCartItems(cartData[vendorId] || []);
  }, [vendorId]);

  useEffect(() => {
    const storedCart = localStorage.getItem("labCartItems");
    const cartData = storedCart ? JSON.parse(storedCart) : {};
    cartData[vendorId] = cartItems;
    localStorage.setItem("labCartItems", JSON.stringify(cartData));
  }, [cartItems, vendorId]);

  const addToCart = (item) => {
    const itemWithVendor = { ...item, vendorId: vendorId };
    setCartItems(prev => {
      if (prev.some(cartItem => cartItem._id === item._id)) return prev;
      return [...prev, itemWithVendor];
    });
    toast.success("✨ Item added to cart!");
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item._id !== itemId));
    toast.info("🗑️ Item removed from cart");
  };

  const clearCart = () => {
    setCartItems([]);
    const storedCart = localStorage.getItem("labCartItems");
    const cartData = storedCart ? JSON.parse(storedCart) : {};
    delete cartData[vendorId];
    localStorage.setItem("labCartItems", JSON.stringify(cartData));
  };

  const isItemInCart = (itemId) => cartItems.some(item => item._id === itemId);

  return { cartItems, addToCart, removeFromCart, clearCart, isItemInCart };
};

// --- Time Utility Functions ---
const parseTime = (timeStr) => {
  if (!timeStr) return new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const generateTimeSlots = (startTimeStr, endTimeStr, slotDurationMinutes) => {
  if (!startTimeStr || !endTimeStr) return [];
  let current = parseTime(startTimeStr);
  const end = parseTime(endTimeStr);
  const slots = [];

  let duration = Number(slotDurationMinutes);
  if (isNaN(duration) || duration <= 0) {
    duration = 30;
  }

  while (current < end) {
    const slotStart = formatTime(current);
    const nextTime = new Date(current.getTime());
    nextTime.setMinutes(nextTime.getMinutes() + duration);

    if (nextTime <= end) {
      const slotEnd = formatTime(nextTime);
      slots.push(`${slotStart} - ${slotEnd}`);
      current = nextTime;
    } else {
      break;
    }
  }
  return slots;
};

const LabDetails = () => {
  const navigate = useNavigate();
  const {
    getVendortest, test, vendor, getVendor, fetchAddresses, addNewAddress,
    getVendorAvailability, getVendorTimeSlots,
    vendorRatings, ratingLoading, getVendorRatings, addVendorRating,
    editVendorRating, deleteVendorRating
  } = useContext(MyContext);

  const { id } = useParams();
  const location = useLocation();

  const [packages21, setPackages21] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vendorAvailability, setVendorAvailability] = useState([]);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingDescription, setRatingDescription] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRatingItem, setEditingRatingItem] = useState(null);
  const [editRatingVal, setEditRatingVal] = useState(0);
  const [editDesc, setEditDesc] = useState('');
  const { cartItems, addToCart, removeFromCart, clearCart, isItemInCart } = useVendorCart(id);
  const [vendorForSlots, setVendorForSlots] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSession, setSelectedSession] = useState("morning");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showFinalBookingModal, setShowFinalBookingModal] = useState(false);
  const [prescriptionFiles, setPrescriptionFiles] = useState([]);
  const [lab, setLab] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "", phone: "", address: "", city: "", state: "", pinCode: ""
  });
  const [pendingItem, setPendingItem] = useState(null);
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  const themeColor = "#3d3f96";
  const URL = process.env.REACT_APP_API_URL;
  const imageUrl = process.env.REACT_APP_API_URL;

  const calculateDiscountedPrice = (amount, discountPercentage) => {
    const finalAmount = Number(amount);
    const discount = Number(discountPercentage);
    if (isNaN(finalAmount) || finalAmount <= 0) return finalAmount || 0;
    if (isNaN(discount) || discount < 0 || discount > 100) return finalAmount;
    return Math.round(finalAmount * (1 - discount / 100));
  };

  const getNext3Dates = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const value = `${year}-${month}-${day}`;
      const label = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      result.push({ label, value });
    }
    return result;
  };

  const sessions = [
    { label: "morning", uiLabel: "Morning", apiDay: "Morning", icon: "fa-sun", time: "6:00 AM - 12:00 PM", gradient: "linear-gradient(135deg, #f093fb, #f5576c)" },
    { label: "afternoon", uiLabel: "Afternoon", apiDay: "Afternoon", icon: "fa-sun", time: "12:00 PM - 5:00 PM", gradient: "linear-gradient(135deg, #4facfe, #00f2fe)" },
    { label: "evening", uiLabel: "Evening", apiDay: "Evening", icon: "fa-moon", time: "5:00 PM - 10:00 PM", gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
  ];

  const dates = getNext3Dates();

  useEffect(() => {
    if (dates.length > 0 && !selectedDate) setSelectedDate(dates[0].value);
  }, [dates]);

  const cartTotal = cartItems.reduce((acc, item) => acc + calculateDiscountedPrice(item.amount, item.discountPercentage), 0);

  const openCartModal = () => {
    const cartOffcanvas = document.getElementById("ProductCart");
    if (cartOffcanvas) {
      const bsOffcanvas = new bootstrap.Offcanvas(cartOffcanvas);
      bsOffcanvas.show();
    }
  };

  const getUserToken = () => localStorage.getItem("token");

  const fetchPackages21 = async (vendorId, page = 1, limit = 10) => {
    try {
      const userToken = getUserToken();
      setLoading(true);
      const res = await axios.get(`${URL}/labnear/package/${vendorId}?page=${page}&limit=${limit}`, { headers: { token: userToken } });
      if (res.data.success) setPackages21(res.data.details);
      else setError(res.data.message || "Failed to fetch packages");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorAvailability = async (vendorId) => {
    try {
      const availability = await getVendorAvailability(vendorId);
      setVendorAvailability(availability || []);
    } catch (error) {
      console.error('Error fetching vendor availability:', error);
      setVendorAvailability([]);
    }
  };

  // FIXED: Generate slots from availability data
  const generateSlotsFromAvailability = () => {
    if (!selectedDate || vendorAvailability.length === 0) {
      setAvailableSlots([]);
      return;
    }

    const selectedSessionConfig = sessions.find(s => s.label === selectedSession);
    if (!selectedSessionConfig) {
      setAvailableSlots([]);
      return;
    }

    const sessionAvailability = vendorAvailability.find(avail =>
      avail.day === selectedSessionConfig.apiDay
    );

    if (sessionAvailability && sessionAvailability.startTime && sessionAvailability.endTime) {
      const slots = generateTimeSlots(
        sessionAvailability.startTime,
        sessionAvailability.endTime,
        sessionAvailability.slotTime || 30
      );
      setAvailableSlots(slots);
      console.log("Generated slots from availability:", slots);
    } else {
      setAvailableSlots([]);
    }
  };

  // FIXED: Fetch time slots with proper API handling
  const fetchTimeSlots = async () => {
    if (!selectedDate || !vendorForSlots?._id) return;

    try {
      setSlotsLoading(true);
      setSlotsError(null);

      // Try to get slots from API first
      const slots = await getVendorTimeSlots(
        vendorForSlots._id,
        selectedDate,
        selectedDate
      );

      console.log("API Response:", slots);

      let slotStrings = [];

      if (slots && slots.length > 0 && slots[0]) {
        const selectedSessionConfig = sessions.find(s => s.label === selectedSession);
        if (selectedSessionConfig) {
          // Try both possible response formats
          if (slots[0][selectedSessionConfig.apiDay]) {
            slotStrings = slots[0][selectedSessionConfig.apiDay];
          } else if (slots[0].slots && slots[0].slots[selectedSessionConfig.apiDay]) {
            slotStrings = slots[0].slots[selectedSessionConfig.apiDay];
          } else if (Array.isArray(slots[0])) {
            slotStrings = slots[0];
          }
        }
      }

      if (slotStrings.length > 0) {
        setAvailableSlots(slotStrings);
        console.log("Slots from API:", slotStrings);
      } else if (vendorAvailability.length > 0) {
        // Fallback to generated slots
        console.log("No API slots, generating from availability");
        generateSlotsFromAvailability();
      } else {
        setAvailableSlots([]);
      }

      setSelectedSlot("");
    } catch (err) {
      console.error("fetchSlots error:", err);
      setSlotsError("Failed to load time slots");
      // Fallback to generated slots on error
      if (vendorAvailability.length > 0) {
        generateSlotsFromAvailability();
      }
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getVendortest(id);
      fetchPackages21(id);
      fetchVendorAvailability(id);
      getVendorRatings(id);
    }
  }, [id]);

  useEffect(() => {
    getVendor();
  }, []);

  useEffect(() => {
    if (vendor && vendor.length > 0) {
      const selectedVendor = vendor.find((v) => v._id === id);
      setLab(selectedVendor);
      setVendorForSlots(selectedVendor);
    }
  }, [vendor, id]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (typeof fetchAddresses === "function") {
        try {
          const res = await fetchAddresses();
          setAddresses(res || []);
        } catch (e) {
          console.error("fetchAddresses error:", e);
        }
      }
    };
    loadAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (selectedDate && vendorForSlots) {
      fetchTimeSlots();
    }
  }, [selectedDate, selectedSession, vendorForSlots]);

  const getCartType = () => {
    if (cartItems.length === 0) return null;
    const item = cartItems[0];
    if (item.packageName) return "PACKAGE";
    if (item.testCategory === "Pathology") return "PATHOLOGY";
    if (item.testCategory === "Radiology") return "RADIOLOGY";
    return null;
  };

  const handleShowDetails = (testItem) => {
    if (isItemInCart(testItem._id)) {
      toast.info("This item is already in your cart");
      openCartModal();
      return;
    }
    let incomingType = null;
    if (testItem.packageName) incomingType = "PACKAGE";
    else if (testItem.testCategory === "Pathology") incomingType = "PATHOLOGY";
    else if (testItem.testCategory === "Radiology") incomingType = "RADIOLOGY";

    const currentCartType = getCartType();

    if (currentCartType && currentCartType !== incomingType) {
      setPendingItem(testItem);
      setShowClearCartModal(true);
      return;
    }
    addToCart(testItem);
    openCartModal();
  };

  const pathologyTests = test?.filter((t) => t.testCategory === "Pathology") || [];
  const radiologyTests = test?.filter((t) => t.testCategory === "Radiology") || [];

  const handleSlotSelect = (slot) => setSelectedSlot(slot);
  const openDetailModal = () => { if (selectedSlot) setShowDetailModal(true); };
  const closeDetailModal = () => setShowDetailModal(false);

  const handleProceedToBook = async () => {
    setShowDetailModal(false);
    try {
      if (typeof fetchAddresses !== "function") throw new Error("fetchAddresses not available");
      const res = await fetchAddresses();
      setAddresses(res || []);
      setShowAddressModal(true);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setShowAddressModal(true);
    }
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    setShowAddressModal(false);
    setShowFinalBookingModal(true);
  };

  const closeAddressModal = () => setShowAddressModal(false);
  const handlePrescriptionUpload = (e) => setPrescriptionFiles(Array.from(e.target.files));
  const closeFinalBookingModal = () => { setShowFinalBookingModal(false); setPrescriptionFiles([]); };

  const handleFinalBookingSubmit = () => {
    const requiresPrescription = cartItems.some(item => item.prescription === true);
    if (requiresPrescription && prescriptionFiles.length === 0) {
      toast.error("Please upload prescription as it is required for selected tests.");
      return;
    }
    const bookingData = {
      lab, cartItems, selectedDate, selectedSession, selectedSlot, selectedAddress,
      prescriptionFiles, cartTotal, imageUrl, vendorId: id
    };
    localStorage.setItem("bookingConfirmationData", JSON.stringify(bookingData));
    navigate(`/venders/labs/Lab-details/Cart?vendorId=${id}&confirmed=true`);
    closeFinalBookingModal();
  };

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        return payload.userId || payload.id || payload._id;
      }
    } catch (e) { console.error(e); }
    return null;
  };

  const isOwner = (rating) => {
    const currentId = getCurrentUserId();
    const ratingUserId = rating.user?._id || rating.userId || rating.user;
    return currentId && ratingUserId && currentId.toString() === ratingUserId.toString();
  };

  const renderStars = (rating) => {
    const floatR = parseFloat(rating) || 0;
    const full = Math.floor(floatR);
    const half = floatR % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <div className="d-flex text-warning" style={{ gap: '3px' }}>
        {[...Array(full)].map((_, i) => <i key={`f${i}`} className="fas fa-star"></i>)}
        {half && <i className="fas fa-star-half-alt"></i>}
        {[...Array(empty)].map((_, i) => <i key={`e${i}`} className="far fa-star"></i>)}
      </div>
    );
  };

  const getDistribution = () => {
    if (!vendorRatings?.ratingStatistics) return {};
    const { starBreakdown, totalRatings } = vendorRatings.ratingStatistics;
    const dist = {};
    for (let i = 1; i <= 5; i++) {
      const count = starBreakdown?.[i] || 0;
      dist[i] = totalRatings > 0 ? ((count / totalRatings) * 100).toFixed(1) : 0;
    }
    return dist;
  };

  const handleSubmitRating = async () => {
    if (newRating === 0 || !ratingDescription.trim()) {
      toast.error("Please provide rating and feedback.");
      return;
    }
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      toast.error("Please login to submit a review.");
      return;
    }
    const alreadyRated = vendorRatings?.ratings?.some(r => {
      const rUserId = r.user?._id || r.userId || r.user;
      return rUserId && rUserId.toString() === currentUserId.toString();
    });
    if (alreadyRated) {
      toast.error("You have already rated this lab!");
      return;
    }
    setSubmittingRating(true);
    try {
      const data = { rating: newRating.toString(), description: ratingDescription, vendorId: id };
      const res = await addVendorRating(data);
      if (res.data.success === 1) {
        toast.success("Rating submitted successfully!");
        setShowRatingForm(false);
        setNewRating(0);
        setRatingDescription('');
        getVendorRatings(id);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Error submitting rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRatingItem) return;
    setSubmittingRating(true);
    try {
      const data = { rating: editRatingVal.toString(), description: editDesc };
      const res = await editVendorRating(editingRatingItem._id, data);
      if (res.data.success === 1) {
        toast.success("Rating updated successfully!");
        setShowEditModal(false);
        getVendorRatings(id);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Error updating rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDelete = async (rid) => {
    if (!window.confirm("Delete this rating?")) return;
    try {
      const res = await deleteVendorRating(rid);
      if (res.data.success === 1) {
        toast.success("Deleted successfully");
        getVendorRatings(id);
      }
    } catch (error) {
      toast.error("Error deleting");
    }
  };

  const startEdit = (item) => {
    setEditingRatingItem(item);
    setEditRatingVal(parseFloat(item.rating));
    setEditDesc(item.description);
    setShowEditModal(true);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await addNewAddress(formData);
      if (res.success === 1) {
        toast.success("Address created successfully!");
        closeModal();
        if (typeof fetchAddresses === "function") {
          const updatedAddresses = await fetchAddresses();
          setAddresses(updatedAddresses || []);
        }
        setFormData({ name: "", phone: "", address: "", city: "", state: "", pinCode: "" });
      } else {
        toast.error(res.message || "Failed to create address");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create address");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.openSlotModal) setShowDetailModal(true);
  }, [location.state]);

  if (!lab) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="text-center">
          <div className="spinner-border text-white" style={{ width: "3rem", height: "3rem" }} role="status"></div>
          <p className="mt-3 text-white">Loading Lab Details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
          
          * {
            font-family: 'Inter', sans-serif;
          }
          
          :root {
            --theme-primary: #3d3f96;
            --theme-primary-dark: #2d2f6e;
            --theme-primary-light: #5a5cb8;
            --theme-gradient: linear-gradient(135deg, #3d3f96 0%, #5a5cb8 100%);
            --theme-gradient-light: linear-gradient(135deg, #3d3f9620, #5a5cb820);
          }
          
          body {
            background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          }
          
          .glass-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 50px rgba(61, 63, 150, 0.15);
          }
          
          .gradient-text {
            background: var(--theme-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .btn-premium {
            background: var(--theme-gradient);
            color: white;
            border: none;
            border-radius: 60px;
            padding: 14px 36px;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 20px rgba(61, 63, 150, 0.3);
            position: relative;
            overflow: hidden;
          }
          
          .btn-premium::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
          }
          
          .btn-premium:hover::before {
            width: 300px;
            height: 300px;
          }
          
          .btn-premium:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(61, 63, 150, 0.4);
          }
          
          .btn-outline-premium {
            border: 2px solid var(--theme-primary);
            color: var(--theme-primary);
            background: transparent;
            border-radius: 60px;
            padding: 12px 30px;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .btn-outline-premium:hover {
            background: var(--theme-primary);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(61, 63, 150, 0.2);
          }
          
          .service-card-premium {
            background: white;
            border-radius: 28px;
            overflow: hidden;
            transition: all 0.4s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            height: 100%;
          }
          
          .service-card-premium:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(61, 63, 150, 0.15);
          }
          
          .service-header-premium {
            padding: 28px;
            color: white;
            position: relative;
            overflow: hidden;
          }
          
          .service-header-premium.pathology { background: linear-gradient(135deg, #3d3f96, #5a5cb8); }
          .service-header-premium.radiology { background: linear-gradient(135deg, #2d6a4f, #40916c); }
          .service-header-premium.packages { background: linear-gradient(135deg, #e76f51, #f4a261); }
          
          .service-header-premium h4 {
            margin: 0;
            font-weight: 800;
            position: relative;
            z-index: 1;
          }
          
          .service-header-premium i {
            position: absolute;
            right: -10px;
            bottom: -10px;
            font-size: 90px;
            opacity: 0.12;
            transform: rotate(-10deg);
          }
          
          .date-card-premium {
            background: white;
            border-radius: 24px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid #eef2f6;
          }
          
          .date-card-premium:hover {
            border-color: var(--theme-primary);
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .date-card-premium.active {
            background: var(--theme-gradient);
            border-color: var(--theme-primary);
            color: white;
            transform: translateY(-5px);
          }
          
          .date-card-premium.active .text-muted {
            color: rgba(255, 255, 255, 0.8) !important;
          }
          
          .slot-btn-premium {
            border-radius: 60px;
            padding: 12px 28px;
            border: 2px solid #e0e0e0;
            background: white;
            transition: all 0.3s ease;
            font-weight: 600;
            font-size: 14px;
          }
          
          .slot-btn-premium:hover {
            border-color: var(--theme-primary);
            color: var(--theme-primary);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }
          
          .slot-btn-premium.active {
            background: var(--theme-gradient);
            border-color: var(--theme-primary);
            color: white;
            box-shadow: 0 5px 15px rgba(61, 63, 150, 0.3);
          }
          
          .session-card {
            padding: 18px;
            border-radius: 20px;
            background: white;
            border: 2px solid #eef2f6;
            transition: all 0.3s ease;
            cursor: pointer;
            text-align: center;
          }
          
          .session-card:hover {
            border-color: var(--theme-primary);
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          }
          
          .session-card.active {
            background: var(--theme-gradient);
            border-color: var(--theme-primary);
            color: white;
          }
          
          .session-card.active i {
            color: white !important;
          }
          
          .cart-float {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 1050;
            background: var(--theme-gradient);
            border-radius: 70px;
            padding: 16px 32px;
            box-shadow: 0 15px 35px rgba(61, 63, 150, 0.4);
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
            color: white;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
            backdrop-filter: blur(10px);
          }
          
          .cart-float:hover {
            transform: scale(1.08);
            box-shadow: 0 20px 45px rgba(61, 63, 150, 0.5);
          }
          
          .rating-card-premium {
            background: var(--theme-gradient);
            border-radius: 32px;
            padding: 40px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
          }
          
          .rating-card-premium::before {
            content: '★★★★★';
            position: absolute;
            bottom: -20px;
            right: -20px;
            font-size: 120px;
            opacity: 0.08;
            font-family: monospace;
          }
          
          .rating-number {
            font-size: 80px;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 10px;
          }
          
          .test-row {
            transition: all 0.25s ease;
            border-radius: 16px;
            padding: 12px;
          }
          
          .test-row:hover {
            background: var(--theme-gradient-light);
            transform: translateX(8px);
          }
          
          .breadcrumb-premium {
            background: transparent;
            padding: 20px 0;
          }
          
          .breadcrumb-premium .breadcrumb-item a {
            color: var(--theme-primary);
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
          }
          
          .breadcrumb-premium .breadcrumb-item a:hover {
            color: var(--theme-primary-dark);
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .modal-premium .modal-content {
            border-radius: 32px;
            overflow: hidden;
            border: none;
          }
          
          .progress-bar-custom {
            background: var(--theme-gradient);
            border-radius: 10px;
          }
          
          .time-slots-container {
            max-height: 300px;
            overflow-y: auto;
            padding: 10px;
          }
          
          .time-slots-container::-webkit-scrollbar {
            width: 6px;
          }
          
          .time-slots-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          
          .time-slots-container::-webkit-scrollbar-thumb {
            background: var(--theme-primary);
            border-radius: 10px;
          }
        `}
      </style>

      {/* Floating Cart Button */}
      <button className="cart-float animate-float" onClick={openCartModal}>
        <i className="fas fa-shopping-cart fa-lg"></i>
        <span>My Cart</span>
        {cartItems.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#ff4757',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {cartItems.length}
          </span>
        )}
      </button>

      <div className="container py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb breadcrumb-premium">
            <li className="breadcrumb-item"><Link to="/"><i className="fas fa-home me-1"></i>Home</Link></li>
            <li className="breadcrumb-item"><Link to="/venders/labs"><i className="fas fa-flask me-1"></i>Labs</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{lab.name}</li>
          </ol>
        </nav>

        {/* Lab Header Card */}
        <div className="glass-card mb-5">
          <div className="row g-0">
            <div className="col-md-4">
              <div style={{ height: "100%", minHeight: "350px", overflow: "hidden" }}>
                <img
                  src={lab.image ? `${imageUrl}${lab.image}` : "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=2070&auto=format&fit=crop"}
                  alt={lab.name}
                  className="img-fluid w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="col-md-8">
              <div className="p-4 p-lg-5">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                  <h1 className="display-4 fw-bold gradient-text mb-0">{lab.name}</h1>
                  <div className="d-flex gap-2">
                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
                      <i className="fas fa-star me-1"></i>
                      {parseFloat(vendorRatings?.ratingStatistics?.averageRating || 0).toFixed(1)} ★
                    </span>
                    {vendorAvailability.length > 0 ? (
                      <span className="badge bg-success px-3 py-2 rounded-pill">
                        <i className="fas fa-check-circle me-1"></i>Available
                      </span>
                    ) : (
                      <span className="badge bg-warning px-3 py-2 rounded-pill">
                        <i className="fas fa-clock me-1"></i>Check Availability
                      </span>
                    )}
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3 p-2 rounded-3" style={{ background: "var(--theme-gradient-light)" }}>
                      <i className="fas fa-briefcase fa-fw me-2" style={{ color: themeColor }}></i>
                      <div><strong>Business Type:</strong> {lab.business || "N/A"}</div>
                    </div>
                    <div className="d-flex align-items-center mb-3 p-2 rounded-3" style={{ background: "var(--theme-gradient-light)" }}>
                      <i className="fas fa-phone fa-fw me-2" style={{ color: themeColor }}></i>
                      <div><strong>Phone:</strong> {lab.phone || "N/A"}</div>
                    </div>
                    <div className="d-flex align-items-center mb-3 p-2 rounded-3" style={{ background: "var(--theme-gradient-light)" }}>
                      <i className="fas fa-envelope fa-fw me-2" style={{ color: themeColor }}></i>
                      <div><strong>Email:</strong> {lab.email || "N/A"}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3 p-2 rounded-3" style={{ background: "var(--theme-gradient-light)" }}>
                      <i className="fas fa-map-marker-alt fa-fw me-2" style={{ color: themeColor }}></i>
                      <div><strong>Address:</strong> {lab.address || "N/A"}, {lab.city || ""}</div>
                    </div>
                    <div className="d-flex align-items-center mb-3 p-2 rounded-3" style={{ background: "var(--theme-gradient-light)" }}>
                      <i className="fas fa-users fa-fw me-2" style={{ color: themeColor }}></i>
                      <div><strong>Total Reviews:</strong> {vendorRatings?.ratingStatistics?.totalRatings || 0} reviews</div>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3 flex-wrap">
                  <button className="btn-premium" onClick={() => document.getElementById('consultSection')?.scrollIntoView({ behavior: 'smooth' })}>
                    <i className="fas fa-calendar-check me-2"></i>Book Appointment
                  </button>
                  <button className="btn-outline-premium" onClick={() => document.getElementById('labTestsSection')?.scrollIntoView({ behavior: 'smooth' })}>
                    <i className="fas fa-flask me-2"></i>View Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <section className="mb-5" id="labTestsSection">
          <div className="text-center mb-5">
            <div className="d-inline-block px-4 py-2 rounded-pill mb-3" style={{ background: "var(--theme-gradient-light)" }}>
              <span className="fw-semibold" style={{ color: themeColor }}>Our Specialties</span>
            </div>
            <h2 className="display-5 fw-bold gradient-text mb-3">Medical Services</h2>
            <p className="text-muted fs-5">Comprehensive diagnostic solutions tailored for your health needs</p>
          </div>

          <div className="row g-4">
            {/* Pathology Tests */}
            <div className="col-md-6 col-lg-4">
              <div className="service-card-premium">
                <div className="service-header-premium pathology">
                  <h4><i className="fas fa-microscope me-2"></i>Pathology Tests</h4>
                  <i className="fas fa-flask"></i>
                </div>
                <div className="p-4">
                  {pathologyTests.slice(0, 5).map((v) => (
                    <div key={v._id} className="test-row d-flex justify-content-between align-items-center border-bottom">
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">{v.testName}</h6>
                        <small className="text-muted"><i className="fas fa-tag me-1"></i>{v.testType}</small>
                      </div>
                      <div className="text-end">
                        {Number(v.discountPercentage) > 0 && (
                          <small className="text-muted text-decoration-line-through d-block">₹{v.amount}</small>
                        )}
                        <strong className="text-success fs-5">₹{calculateDiscountedPrice(v.amount, v.discountPercentage)}</strong>
                        <button
                          className={`btn btn-sm rounded-pill mt-1 small w-75 ${isItemInCart(v._id) ? 'btn-success' : 'btn-outline-premium'}`}
                          onClick={() => handleShowDetails(v)}
                          disabled={isItemInCart(v._id)}
                        >
                          {isItemInCart(v._id) ? <><i className="fas fa-check me-1"></i>Added</> : <><i className="fas fa-cart-plus me-1"></i>Add</>}
                        </button>
                      
                      </div>
                      
                    </div>
                    
                  ))}
                  {pathologyTests.length === 0 && <p className="text-center text-muted py-4">No tests available</p>}
                </div>
                <div className="my-3 text-center ">
                  <Link to={`/Lab/PathologyTests/${id}`}>
                    <button
                      style={{ backgroundColor: '#5355b0', border: 'none' }}
                      className="text-white py-2 px-4 rounded-pill"
                    >
                      <span><i class="fa-solid fa-eye"></i></span> View more
                    </button>
                  </Link>
                  
                </div>
              </div>
            </div>

            {/* Radiology Tests */}
            <div className="col-md-6 col-lg-4">
              <div className="service-card-premium">
                <div className="service-header-premium radiology">
                  <h4><i className="fas fa-x-ray me-2"></i>Radiology Tests</h4>
                  <i className="fas fa-camera"></i>
                </div>
                <div className="p-4">
                  {radiologyTests.slice(0, 5).map((v) => (
                    <div key={v._id} className="test-row d-flex justify-content-between align-items-center border-bottom">
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">{v.testName}</h6>
                        <small className="text-muted"><i className="fas fa-tag me-1"></i>{v.testType}</small>
                      </div>
                      <div className="text-end">
                        {Number(v.discountPercentage) > 0 && (
                          <small className="text-muted text-decoration-line-through d-block">₹{v.amount}</small>
                        )}
                        <strong className="text-success fs-5">₹{calculateDiscountedPrice(v.amount, v.discountPercentage)}</strong>
                        <button
                          className={`btn btn-sm rounded-pill mt-1 w-75 ${isItemInCart(v._id) ? 'btn-success' : 'btn-outline-premium'}`}
                          onClick={() => handleShowDetails(v)}
                          disabled={isItemInCart(v._id)}
                        >
                          {isItemInCart(v._id) ? <><i className="fas fa-check me-1"></i>Added</> : <><i className="fas fa-cart-plus me-1"></i>Add</>}
                        </button>
                      </div>
                    </div>
                  ))}
                  {radiologyTests.length === 0 && <p className="text-center text-muted py-4">No tests available</p>}
                </div>
              <div className="text-center">
                  <Link to={`/Lab/RadiologyTests/${id}`}>
                    <button
                      style={{ backgroundColor: '#5355b0', border: 'none' }}
                      className="text-white py-2 px-4 rounded-pill"
                    >
                      <span><i class="fa-solid fa-eye"></i></span> View more
                    </button>
                  </Link>
              </div>
              </div>
            </div>

            {/* Packages */}
            <div className="col-md-6 col-lg-4">
              <div className="service-card-premium">
                <div className="service-header-premium packages">
                  <h4><i className="fas fa-gift me-2"></i>Health Packages</h4>
                  <i className="fas fa-boxes"></i>
                </div>
                <div className="p-4">
                  {packages21.slice(0, 5).map((pkg) => (
                    <div key={pkg._id} className="test-row d-flex justify-content-between align-items-center border-bottom">
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">{pkg.packageName}</h6>
                        <small className="text-muted"><i className="fas fa-flask me-1"></i>Full Body Checkup</small>
                      </div>
                      <div className="text-end">
                        {Number(pkg.discountPercentage) > 0 && (
                          <small className="text-muted text-decoration-line-through d-block">₹{pkg.amount}</small>
                        )}
                        <strong className="text-danger fs-5">₹{calculateDiscountedPrice(pkg.amount, pkg.discountPercentage)}</strong>
                        <button
                          className={`btn btn-sm rounded-pill mt-1 w-75 ${isItemInCart(pkg._id) ? 'btn-success' : 'btn-outline-premium'}`}
                          onClick={() => handleShowDetails(pkg)}
                          disabled={isItemInCart(pkg._id)}
                        >
                          {isItemInCart(pkg._id) ? <><i className="fas fa-check me-1"></i>Added</> : <><i className="fas fa-cart-plus me-1"></i>Add</>}
                        </button>
                      </div>
                    </div>
                  ))}
                  {packages21.length === 0 && <p className="text-center text-muted py-4">No packages available</p>}
                </div>
              <div className="text-center">
                  <Link to={`/Lab/TestPackages/${id}`}>
                    <button
                      style={{ backgroundColor: '#5355b0', border: 'none' }}
                      className="text-white py-2 px-4 rounded-pill"
                    >
                      <span><i class="fa-solid fa-eye"></i></span> View more
                    </button>
                  </Link>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="consultSection" className="glass-card mb-5">
          <div className="p-4 p-lg-5">
            <div className="text-center mb-5">
              <div className="d-inline-block px-4 py-2 rounded-pill mb-3" style={{ background: "var(--theme-gradient-light)" }}>
                <span className="fw-semibold" style={{ color: themeColor }}>Schedule Appointment</span>
              </div>
              <h2 className="display-5 fw-bold gradient-text mb-3">Book Your Slot</h2>
              <p className="text-muted">Choose your preferred date and time for the lab test</p>
            </div>

            {vendorAvailability.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                <h4>No Availability Found</h4>
                <p className="text-muted">Please check back later for available slots.</p>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {/* Date Selection */}
                  <div className="col-lg-3">
                    <h5 className="fw-bold mb-3"><i className="fas fa-calendar-alt me-2" style={{ color: themeColor }}></i>Select Date</h5>
                    <div className="d-flex flex-lg-column gap-3">
                      {dates.map((dateObj, idx) => (
                        <div
                          key={idx}
                          className={`date-card-premium ${selectedDate === dateObj.value ? "active" : ""}`}
                          onClick={() => setSelectedDate(dateObj.value)}
                        >
                          <div className="display-6 fw-bold">{new Date(dateObj.value).getDate()}</div>
                          <div className="fw-semibold">{new Date(dateObj.value).toLocaleDateString("en-GB", { month: "short" })}</div>
                          <div className="small opacity-75">{new Date(dateObj.value).toLocaleDateString("en-GB", { weekday: "short" })}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Session & Slot */}
                  <div className="col-lg-9">
                    <h5 className="fw-bold mb-3"><i className="fas fa-clock me-2" style={{ color: themeColor }}></i>Select Session</h5>
                    <div className="row g-3 mb-4">
                      {sessions.map((s) => (
                        <div className="col-md-4" key={s.label}>
                          <div className={`session-card ${selectedSession === s.label ? "active" : ""}`} onClick={() => setSelectedSession(s.label)}>
                            <i className={`fas ${s.icon} fa-2x mb-2 d-block`} style={{ color: themeColor }}></i>
                            <div className="fw-bold">{s.uiLabel}</div>
                            <small className="opacity-75">{s.time}</small>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h5 className="fw-bold mb-3"><i className="fas fa-hourglass-half me-2" style={{ color: themeColor }}></i>Available Slots</h5>
                    <div className="bg-light p-4 rounded-4" style={{ background: "#f8f9fa", borderRadius: "24px" }}>
                      {slotsLoading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border" style={{ color: themeColor }}></div>
                          <p className="mt-3">Loading available slots...</p>
                        </div>
                      ) : slotsError ? (
                        <div className="text-center py-5 text-danger">{slotsError}</div>
                      ) : availableSlots.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="fas fa-clock fa-2x mb-2" style={{ color: themeColor }}></i>
                          <p className="text-muted">No slots available for this session</p>
                        </div>
                      ) : (
                        <div className="time-slots-container d-flex flex-wrap gap-2 justify-content-center">
                          {availableSlots.map((slot, idx) => (
                            <button
                              key={idx}
                              className={`slot-btn-premium ${selectedSlot === slot ? "active" : ""}`}
                              onClick={() => handleSlotSelect(slot)}
                            >
                              <i className="fas fa-clock me-1"></i> {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center mt-5">
                  <button
                    className="btn-premium btn-lg px-5"
                    onClick={openDetailModal}
                    disabled={!selectedSlot || slotsLoading || cartItems.length === 0}
                  >
                    <i className="fas fa-calendar-check me-2"></i>
                    {cartItems.length === 0 ? "Add Tests to Continue" : "Proceed to Book"}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Rating Section */}
        <section className="mb-5">
          <div className="glass-card">
            <div className="p-4 p-lg-5">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                  <h3 className="fw-bold gradient-text mb-0"><i className="fas fa-star me-2"></i>Patient Reviews</h3>
                  <p className="text-muted mb-0">What our patients say about us</p>
                </div>
                <button className="btn-outline-premium" onClick={() => setShowRatingForm(!showRatingForm)}>
                  <i className={`fas fa-${showRatingForm ? 'times' : 'pen'} me-2`}></i>
                  {showRatingForm ? "Cancel" : "Write a Review"}
                </button>
              </div>

              {showRatingForm && (
                <div className="bg-light p-4 rounded-4 mb-5" style={{ borderRadius: "24px" }}>
                  <h5 className="fw-bold mb-3">Share Your Experience</h5>
                  <div className="mb-3 d-flex gap-1 justify-content-center">
                    {[...Array(5)].map((_, i) => (
                      <VendorHalfStar key={i} index={i} rating={newRating} hoverRating={hoverRating} setHover={setHoverRating} setRating={setNewRating} />
                    ))}
                  </div>
                  <small className="d-block mb-3 text-center fw-bold" style={{ color: themeColor }}>
                    {newRating > 0 ? `${newRating} / 5 Stars` : "Click on stars to rate"}
                  </small>
                  <textarea
                    className="form-control mb-3"
                    rows="4"
                    placeholder="Write your feedback here..."
                    value={ratingDescription}
                    onChange={(e) => setRatingDescription(e.target.value)}
                    style={{ borderRadius: "16px", resize: "none" }}
                  ></textarea>
                  <button className="btn-premium w-100" onClick={handleSubmitRating} disabled={submittingRating || newRating === 0}>
                    {submittingRating ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}

              {ratingLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: themeColor }}></div>
                </div>
              ) : (
                <div className="row g-4">
                  <div className="col-lg-4">
                    <div className="rating-card-premium">
                      <div className="rating-number">{parseFloat(vendorRatings?.ratingStatistics?.averageRating || 0).toFixed(1)}</div>
                      <div className="d-flex justify-content-center mb-2">{renderStars(vendorRatings?.ratingStatistics?.averageRating)}</div>
                      <p className="mb-0 opacity-75">
                        <i className="fas fa-users me-1"></i>
                        {vendorRatings?.ratingStatistics?.totalRatings || 0} Verified Reviews
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-8">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="d-flex align-items-center gap-2 mb-2">
                        <span className="fw-bold" style={{ width: '45px' }}>
                          {star} <i className="fas fa-star text-warning"></i>
                        </span>
                        <div className="flex-grow-1 bg-light rounded-pill overflow-hidden" style={{ height: '10px' }}>
                          <div
                            className="h-100 rounded-pill progress-bar-custom"
                            style={{ width: `${getDistribution()[star] || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-muted" style={{ width: '50px' }}>{getDistribution()[star]}%</span>
                      </div>
                    ))}

                    <hr className="my-4" />

                    {vendorRatings?.ratings?.length > 0 && (
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="fw-bold mb-0"><i className="fas fa-comments me-2"></i>Recent Reviews</h5>
                        <select
                          className="form-select form-select-sm w-auto rounded-pill"
                          value={visibleLimit}
                          onChange={(e) => setVisibleLimit(Number(e.target.value))}
                          style={{ borderRadius: "30px", padding: "8px 16px" }}
                        >
                          <option value={5}>Show 5</option>
                          <option value={10}>Show 10</option>
                          <option value={20}>Show 20</option>
                        </select>
                      </div>
                    )}

                    {vendorRatings?.ratings?.length > 0 ? (
                      vendorRatings.ratings.slice(0, visibleLimit).map(rating => (
                        <div key={rating._id} className="border-bottom pb-3 mb-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex gap-3">
                              <div
                                className="rounded-circle text-white d-flex align-items-center justify-content-center"
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`
                                }}
                              >
                                <span className="fw-bold fs-4">
                                  {rating.user?.name?.charAt(0).toUpperCase() || "U"}
                                </span>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-1">{rating.user?.name || "Anonymous User"}</h6>
                                <div className="d-flex gap-2">{renderStars(rating.rating)}</div>
                              </div>
                            </div>
                            <small className="text-muted">
                              <i className="far fa-calendar-alt me-1"></i>
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          <p className="text-muted mb-2 ps-5">{rating.description}</p>
                          {isOwner(rating) && (
                            <div className="d-flex gap-2 ps-5 mt-2">
                              <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => startEdit(rating)}>
                                <i className="fas fa-edit me-1"></i>Edit
                              </button>
                              <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDelete(rating._id)}>
                                <i className="fas fa-trash me-1"></i>Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-5">
                        <i className="fas fa-comment-dots fa-3x text-muted mb-3"></i>
                        <h5>No Reviews Yet</h5>
                        <p className="text-muted">Be the first to share your experience!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Cart Offcanvas */}
      <div className="offcanvas offcanvas-bottom" tabIndex="-1" id="ProductCart" style={{ height: "70vh", maxWidth: "550px", margin: "0 auto", borderRadius: "32px 32px 0 0" }}>
        <div className="offcanvas-header border-0" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, color: "white", borderRadius: "32px 32px 0 0" }}>
          <div>
            <h4 className="fw-bold mb-0"><i className="fas fa-shopping-cart me-2"></i>Your Cart</h4>
            <small>{cartItems.length} item{cartItems.length !== 1 && "s"} added</small>
          </div>
          <button className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body" style={{ paddingBottom: "130px", background: "#f8f9fa" }}>
          {cartItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
              <h5>Your cart is empty</h5>
              <p className="text-muted">Add tests or packages to continue</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const finalPrice = calculateDiscountedPrice(item.amount, item.discountPercentage);
              return (
                <div key={item._id} className="card border-0 shadow-sm mb-3 rounded-4">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="fw-bold mb-1">{item.testName || item.packageName}</h6>
                        {item.discountPercentage > 0 && (
                          <span className="badge bg-success mb-2">{item.discountPercentage}% OFF</span>
                        )}
                      </div>
                      <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => removeFromCart(item._id)} style={{ width: '34px', height: '34px' }}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <div className="mt-2">
                      {item.discountPercentage > 0 && (
                        <small className="text-muted text-decoration-line-through me-2">₹{item.amount}</small>
                      )}
                      <strong className="fs-5" style={{ color: themeColor }}>₹{finalPrice}</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="position-absolute bottom-0 start-0 w-100 bg-white border-top p-3" style={{ borderRadius: "0 0 32px 32px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-semibold fs-5">Total Amount</span>
              <span className="fw-bold fs-2" style={{ color: themeColor }}>₹{cartTotal}</span>
            </div>
            <button
              className="btn-premium w-100 py-3"
              data-bs-dismiss="offcanvas"
              onClick={() => document.getElementById("consultSection")?.scrollIntoView({ behavior: "smooth" })}
            >
              Proceed to Book <i className="fas fa-arrow-right ms-2"></i>
            </button>
          </div>
        )}
      </div>

      {/* Slot Confirmation Modal */}
      {showDetailModal && (
        <div className="modal fade show d-block modal-premium" style={{ background: "rgba(0,0,0,0.7)" }} onClick={closeDetailModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, color: "white" }}>
                <h5 className="modal-title fw-bold"><i className="fas fa-calendar-check me-2"></i>Confirm Appointment</h5>
                <button className="btn-close btn-close-white" onClick={closeDetailModal}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3 p-3 bg-light rounded-3 d-flex align-items-center">
                  <i className="fas fa-calendar-alt fa-2x me-3" style={{ color: themeColor }}></i>
                  <div>
                    <small className="text-muted d-block">Selected Date</small>
                    <strong className="fs-5">{selectedDate}</strong>
                  </div>
                </div>
                <div className="p-3 bg-light rounded-3 d-flex align-items-center">
                  <i className="fas fa-clock fa-2x me-3" style={{ color: themeColor }}></i>
                  <div>
                    <small className="text-muted d-block">Time Slot</small>
                    <strong className="fs-5">{selectedSlot}</strong>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light rounded-pill px-4" onClick={closeDetailModal}>Cancel</button>
                <button className="btn-premium px-4" onClick={handleProceedToBook}>Continue <i className="fas fa-arrow-right ms-1"></i></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal fade show d-block modal-premium" style={{ background: "rgba(0,0,0,0.7)" }} onClick={closeAddressModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, color: "white" }}>
                <h5 className="modal-title fw-bold"><i className="fas fa-user-md me-2"></i>Select Patient</h5>
                <button className="btn-close btn-close-white" onClick={closeAddressModal}></button>
              </div>
              <div className="modal-body p-4">
                {addresses.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-users fa-2x text-muted mb-2"></i>
                    <p>No patients found. Please add a patient.</p>
                  </div>
                )}
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`border rounded-3 p-3 mb-3 cursor-pointer transition ${selectedAddress?._id === addr._id ? "border-primary bg-primary-subtle" : "border-light"}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedAddress(addr)}
                  >
                    <div className="d-flex align-items-center">
                      <input type="radio" className="form-check-input me-3" checked={selectedAddress?._id === addr._id} readOnly />
                      <div>
                        <h6 className="mb-1 fw-bold">{addr.name}</h6>
                        <small className="text-muted">
                          <i className="fas fa-map-marker-alt me-1"></i>{addr.city || "N/A"} |
                          <i className="fas fa-phone ms-2 me-1"></i>{addr.phone || "N/A"}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="btn-outline-premium w-100 mt-2 py-2" onClick={openModal}>
                  <i className="fas fa-plus me-2"></i>Add New Patient
                </button>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light rounded-pill px-4" onClick={closeAddressModal}>Cancel</button>
                <button className="btn-premium px-4" onClick={() => handleSelectAddress(selectedAddress)} disabled={!selectedAddress}>
                  Continue <i className="fas fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showModal && (
        <div className="modal fade show d-block modal-premium" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, color: "white" }}>
                <h5 className="modal-title fw-bold"><i className="fas fa-user-plus me-2"></i>Add New Patient</h5>
                <button className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-4">
                <input className="form-control mb-3 rounded-3" name="name" placeholder="Full Name" onChange={handleChange} required />
                <input className="form-control mb-3 rounded-3" name="phone" placeholder="Phone Number" onChange={handleChange} required />
                <input className="form-control mb-3 rounded-3" name="address" placeholder="Address" onChange={handleChange} />
                <input className="form-control rounded-3" name="city" placeholder="City" onChange={handleChange} />
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light rounded-pill px-4" onClick={closeModal}>Cancel</button>
                <button className="btn-premium px-4" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Save Patient"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Booking Modal */}
      {showFinalBookingModal && (
        <div className="modal fade show d-block modal-premium" style={{ background: "rgba(0,0,0,0.7)" }} onClick={closeFinalBookingModal}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, color: "white" }}>
                <h5 className="modal-title fw-bold"><i className="fas fa-file-invoice me-2"></i>Review Your Booking</h5>
                <button className="btn-close btn-close-white" onClick={closeFinalBookingModal}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="bg-light p-3 rounded-3">
                      <h6 className="fw-bold mb-3"><i className="fas fa-hospital me-2" style={{ color: themeColor }}></i>Appointment Details</h6>
                      <p><strong>Lab:</strong> {lab.name}</p>
                      <p><strong>Date:</strong> {selectedDate}</p>
                      <p><strong>Time Slot:</strong> {selectedSlot}</p>
                      <p><strong>Patient:</strong> {selectedAddress?.name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light p-3 rounded-3">
                      <h6 className="fw-bold mb-3"><i className="fas fa-flask me-2" style={{ color: themeColor }}></i>Selected Services</h6>
                      <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                        {cartItems.map((i) => (
                          <div key={i._id} className="d-flex justify-content-between py-2 border-bottom">
                            <span>{i.testName || i.packageName}</span>
                            <strong>₹{calculateDiscountedPrice(i.amount, i.discountPercentage)}</strong>
                          </div>
                        ))}
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong className="fs-5">Total Amount</strong>
                        <strong className="fs-4" style={{ color: themeColor }}>₹{cartTotal}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                {cartItems.some(i => i.prescription) && (
                  <div className="mt-4">
                    <label className="form-label fw-semibold"><i className="fas fa-prescription-bottle me-2"></i>Upload Prescription</label>
                    <input type="file" multiple onChange={handlePrescriptionUpload} className="form-control rounded-3" />
                    {prescriptionFiles.length > 0 && (
                      <small className="text-success mt-2 d-block">
                        <i className="fas fa-check-circle me-1"></i>{prescriptionFiles.length} file(s) selected
                      </small>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light rounded-pill px-4" onClick={closeFinalBookingModal}>Back</button>
                <button className="btn-premium px-4" onClick={handleFinalBookingSubmit}>
                  Confirm & Pay <i className="fas fa-credit-card ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Modal */}
      {showClearCartModal && (
        <div className="modal fade show d-block modal-premium" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, color: "white" }}>
                <h5 className="modal-title fw-bold"><i className="fas fa-exclamation-triangle me-2"></i>Clear Cart?</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowClearCartModal(false)}></button>
              </div>
              <div className="modal-body text-center p-4">
                <i className="fas fa-shopping-cart fa-3x text-warning mb-3"></i>
                <p>You cannot add different test types together.</p>
                <p className="fw-bold">Do you want to clear the cart and add this item?</p>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <button className="btn btn-danger rounded-pill px-4" onClick={() => { clearCart(); addToCart(pendingItem); openCartModal(); setPendingItem(null); setShowClearCartModal(false); }}>
                  Yes, Clear Cart
                </button>
                <button className="btn btn-light rounded-pill px-4" onClick={() => { setPendingItem(null); setShowClearCartModal(false); }}>
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rating Modal */}
      {showEditModal && (
        <div className="modal fade show d-block modal-premium" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, color: "white" }}>
                <h5 className="modal-title fw-bold"><i className="fas fa-edit me-2"></i>Edit Review</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3 d-flex gap-1 justify-content-center">
                  {[...Array(5)].map((_, i) => (
                    <VendorHalfStar key={i} index={i} rating={editRatingVal} hoverRating={0} setHover={() => { }} setRating={setEditRatingVal} />
                  ))}
                </div>
                <textarea className="form-control rounded-3" rows="4" value={editDesc} onChange={(e) => setEditDesc(e.target.value)}></textarea>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light rounded-pill" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-premium" onClick={handleUpdate} disabled={submittingRating}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LabDetails;
