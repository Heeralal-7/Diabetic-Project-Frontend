import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Aos from "aos";
import { MyContext } from "../../../Context/Context";
import PatientModalsAndSelection from "./PatientModal";
import axios from 'axios';

const DoctorsProfile = () => {
  // =======================================================
  // UTILITY FUNCTIONS
  // =======================================================
  const navigate = useNavigate();

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        return payload.userId || payload.id || payload._id;
      }
    } catch (error) {
      console.error("Error getting user ID from token:", error);
    }
    return null;
  };

  const isCurrentUserRating = (rating) => {
    const currentUserId = getCurrentUserId();
    const ratingUserId = rating.user?._id || rating.userId || rating.user;

    if (currentUserId && ratingUserId) {
      return currentUserId.toString() === ratingUserId.toString();
    }
    return false;
  };

  const formatDateForAPI = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDisplayDate = (apiDate) => {
    if (!apiDate) return '';
    try {
      const [day, month, year] = apiDate.split('/');
      return new Date(`${month}/${day}/${year}`).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return apiDate;
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const currentYear = new Date().getFullYear();

    if (dob.length > 4 && (dob.includes('/') || dob.includes('-'))) {
      let birthDate;
      const parts = dob.split('/');

      if (parts.length === 3) {
        birthDate = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
      } else {
        birthDate = new Date(dob);
      }

      if (birthDate instanceof Date && !isNaN(birthDate.getTime())) {
        let age = currentYear - birthDate.getFullYear();
        const m = new Date().getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) {
          age--;
        }
        return age > 0 ? age : 0;
      }
    }

    const year = parseInt(dob);
    if (!isNaN(year) && year > 1900 && year <= currentYear) {
      return currentYear - year;
    }

    return '';
  };

  // =======================================================
  // RATINGS HELPER FUNCTIONS
  // =======================================================

  const formatRatingDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      return dateString;
    }
  };

  const renderStars = (rating, size = '1.2rem') => {
    const floatRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(floatRating);
    const hasHalfStar = floatRating % 1 !== 0 && floatRating % 1 >= 0.25 && floatRating % 1 <= 0.75;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div style={{ display: 'flex', color: '#ffb822', gap: '4px', alignItems: 'center' }}>
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="bi bi-star-fill shadow-sm" style={{ fontSize: size }}></i>
        ))}
        {hasHalfStar && (
          <i className="bi bi-star-half shadow-sm" style={{ fontSize: size }}></i>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="bi bi-star" style={{ fontSize: size, color: '#e2e8f0' }}></i>
        ))}
      </div>
    );
  };

  const calculateDistribution = (ratingUser) => {
    if (!ratingUser || !ratingUser.ratingStatistics) return {};

    const { starBreakdown, totalRatings } = ratingUser.ratingStatistics;
    const distribution = {};

    for (let i = 1; i <= 5; i++) {
      const count = starBreakdown[i.toString()] || 0;
      distribution[i] = totalRatings > 0 ? ((count / totalRatings) * 100).toFixed(1) : 0;
    }

    return distribution;
  };

  // =======================================================
  // CONTEXT AND STATE
  // =======================================================
  useEffect(() => {
    Aos.init();
  }, []);

  const {
    getdoctorProfile,
    pDoctor,
    loading,
    getAvailabiltyOfVendorAndTimeInUser,
    appointment1: appointment,
    getAllUserAppointments,
    applyCoupon,
    getCoupon,
    fetchAddresses,
    addNewAddress,
    updateAddress,
    deleteAddress,
    checkMembershipForAppointment,
    getActiveMembership,
    activeMembership
  } = useContext(MyContext);

  const { id } = useParams();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDay, setSelectedDay] = useState("Morning");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [paymentType, setPaymentType] = useState("online");
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);

  // Ratings & Feedback States
  const [ratingUser, setRatingsUser] = useState(null);
  const [ratingsLoadingUser, setRatingsLoadingUser] = useState(false);
  const [errorRating, setErrorRating] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingDescription, setRatingDescription] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // EDIT RATING STATES
  const [showEditRatingModal, setShowEditRatingModal] = useState(false);
  const [editingRatingDetails, setEditingRatingDetails] = useState(null);
  const [editRatingValue, setEditRatingValue] = useState(0);
  const [editDescription, setEditDescription] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Membership states
  const [membershipCheck, setMembershipCheck] = useState({
    hasActiveMembership: false,
    isFreeConsultation: false,
    consultationsRemaining: 0,
    membershipDetails: null
  });
  const [useMembership, setUseMembership] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  // Edit Patient State
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editPatientData, setEditPatientData] = useState({
    name: "", dob: "", phone: "", gender: "", address: "", country: "", state: "", city: "", pinCode: "", problemDescription: "", pic: null
  });

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponList, setShowCouponList] = useState(false);

  const [bookingData, setBookingData] = useState({
    problemDescription: "",
    age: "",
    patientId: ""
  });

  const [newPatientData, setNewPatientData] = useState({
    name: "", dob: "", phone: "", gender: "", address: "", country: "", state: "", city: "", pinCode: "", problemDescription: "", pic: null
  });

  // DOCTOR'S CLINIC ID
  const [doctorClinicId, setDoctorClinicId] = useState(null);
  const [hasDoctorClinic, setHasDoctorClinic] = useState(false);
  const [clinicLoading, setClinicLoading] = useState(false);

  // =======================================================
  // DATA FETCHING/LOADING LOGIC
  // =======================================================

  const loadPatients = async () => {
    try {
      setPatientLoading(true);
      const result = await fetchAddresses();
      if (result) {
        setPatients(result);
      } else {
        console.log("No patients/addresses found.");
        setPatients([]);
      }
    } catch (error) {
      console.error("Error loading patients/addresses:", error);
      setPatients([]);
    } finally {
      setPatientLoading(false);
    }
  };

  const loadCoupons = async (doctorId) => {
    if (!doctorId || typeof doctorId !== 'string' || doctorId.trim() === "") {
      console.error("loadCoupons called with invalid Doctor ID:", doctorId);
      setAvailableCoupons([]);
      return;
    }

    try {
      const result = await getCoupon(doctorId);
      if (result.success === 1 && result.coupons) {
        setAvailableCoupons(result.coupons);
      } else {
        setAvailableCoupons([]);
      }
    } catch (error) {
      console.error("Error loading coupons:", error);
      setAvailableCoupons([]);
    }
  };

  const getRatings = async (doctorId) => {
    setRatingsLoadingUser(true);
    setErrorRating(null);

    try {
      const Token = localStorage.getItem("token");

      if (!Token) {
        throw new Error("Authentication Token is missing in localStorage.");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user-rating/getratings`,
        {
          params: { doctorId: doctorId },
          headers: {
            token: Token,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data.success === 1) {
        setRatingsUser(response.data.data);
      } else {
        setErrorRating(response.data.message || "Failed to fetch rating data (API success: 0)");
      }
    } catch (err) {
      let errorMessage = "Error fetching rating details (Network/Server)";
      if (err.response) {
        errorMessage = err.response.data?.message || `Server Error (Status ${err.response.status})`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setErrorRating(errorMessage);
    } finally {
      setRatingsLoadingUser(false);
    }
  };

  const checkDoctorClinic = async (doctorId) => {
    setClinicLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user-appointment/${doctorId}/clinic-info`,
        {
          headers: {
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Clinic API Response:", response.data);

      if (response.data.success === 1) {
        const clinicData = response.data.data || response.data;
        const clinicId = clinicData.clinicId || clinicData.ClinicId || clinicData.data?.clinicId || null;
        const isValidClinic = clinicId && clinicId !== "" && clinicId !== "null" && clinicId !== "undefined";

        setDoctorClinicId(isValidClinic ? clinicId : null);
        setHasDoctorClinic(isValidClinic);

        console.log("✅ Doctor Clinic Info:", { doctorId, clinicId: isValidClinic ? clinicId : null, hasClinic: isValidClinic, responseData: clinicData });
        return { clinicId: isValidClinic ? clinicId : null, hasClinic: isValidClinic };
      } else {
        console.log("No clinic found for doctor:", response.data.message);
        setDoctorClinicId(null);
        setHasDoctorClinic(false);
        return { clinicId: null, hasDoctorClinic: false };
      }
    } catch (error) {
      console.error("❌ Error checking doctor clinic:", error);
      setDoctorClinicId(null);
      setHasDoctorClinic(false);
      return { clinicId: null, hasDoctorClinic: false };
    } finally {
      setClinicLoading(false);
    }
  };

  const submitRating = async () => {
    if (newRating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!ratingDescription.trim()) {
      alert('Please enter a description');
      return;
    }

    setSubmittingRating(true);
    try {
      const Token = localStorage.getItem("token");

      const ratingData = {
        rating: newRating.toString(),
        description: ratingDescription,
        doctorId: id
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user-rating`,
        ratingData,
        {
          headers: {
            token: Token,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data.success === 1) {
        await getRatings(id);
        setShowRatingForm(false);
        setNewRating(0);
        setRatingDescription('');
        alert('Rating submitted successfully!');
      } else {
        alert(response.data.message || 'Failed to submit rating');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error submitting rating';
      alert(errorMessage);
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleUpdateRating = async () => {
    if (editRatingValue === 0) {
      alert('Please select a rating');
      return;
    }

    if (!editDescription.trim()) {
      alert('Please enter a description');
      return;
    }

    if (!editingRatingDetails?._id) return;

    setSubmittingEdit(true);
    try {
      const Token = localStorage.getItem("token");

      const ratingData = {
        rating: editRatingValue.toString(),
        description: editDescription,
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/user-rating/edit/${editingRatingDetails._id}`,
        ratingData,
        {
          headers: {
            token: Token,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data.success === 1) {
        await getRatings(id);
        setShowEditRatingModal(false);
        alert('Rating updated successfully!');
      } else {
        alert(response.data.message || 'Failed to update rating');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error updating rating';
      alert(errorMessage);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm("Are you sure you want to delete this rating?")) {
      return;
    }

    try {
      const Token = localStorage.getItem("token");

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/user-rating/delete/${ratingId}`,
        {
          headers: {
            token: Token,
          },
        }
      );

      if (response.data.success === 1) {
        await getRatings(id);
        alert('Rating deleted successfully!');
      } else {
        alert(response.data.message || 'Failed to delete rating');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error deleting rating';
      alert(errorMessage);
    }
  };

  const checkMembershipStatus = async () => {
    try {
      const result = await checkMembershipForAppointment(id);
      if (result.success) {
        setMembershipCheck(result.data);
      }
    } catch (error) {
      console.error("Error checking membership:", error);
    }
  };

  useEffect(() => {
    if (id && typeof id === 'string' && id.trim() !== "") {
      getdoctorProfile(id);
      loadPatients();
      loadCoupons(id);
      checkMembershipStatus();
      getActiveMembership();
      getRatings(id);
      checkDoctorClinic(id);
    }
  }, [id]);

  useEffect(() => {
    if (membershipCheck.hasActiveMembership && membershipCheck.isFreeConsultation) {
      setUseMembership(true);
    }
  }, [membershipCheck]);

  const imageUrl = `${process.env.REACT_APP_API_URL}`;

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        fullDate: formatDateForAPI(date)
      });
    }
    return dates;
  };

  // =======================================================
  // STAR INPUT SUB-COMPONENT
  // =======================================================
  const HalfStar = ({ index, rating, hoverRating, setHover, setRating }) => {
    const fullStarValue = index + 1;
    const halfStarValue = index + 0.5;

    const displayRating = hoverRating || rating;
    const isActive = displayRating >= fullStarValue;
    const isHalfActive = displayRating >= halfStarValue;

    return (
      <div style={{ display: 'flex', position: 'relative', width: '2.5rem' }}>
        <span
          className={`star-input`}
          onMouseEnter={() => setHover(halfStarValue)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setRating(halfStarValue)}
          style={{
            cursor: 'pointer',
            color: isHalfActive ? '#ffc107' : '#e4e5e9',
            fontSize: '2.5rem',
            transition: 'all 0.2s ease',
            position: 'absolute',
            left: '0',
            width: '50%',
            overflow: 'hidden',
            direction: 'ltr',
            zIndex: 2,
          }}
        >
          ★
        </span>

        <span
          className={`star-input`}
          onMouseEnter={() => setHover(fullStarValue)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setRating(fullStarValue)}
          style={{
            cursor: 'pointer',
            color: isActive ? '#ffc107' : '#e4e5e9',
            fontSize: '2.5rem',
            transition: 'all 0.2s ease',
            position: 'absolute',
            left: '0',
            width: '100%',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          ★
        </span >
      </div>
    );
  };

  // =======================================================
  // UI HANDLERS
  // =======================================================

  const handleEditClick = (ratingItem) => {
    setEditingRatingDetails(ratingItem);
    setEditRatingValue(parseFloat(ratingItem.rating));
    setEditDescription(ratingItem.description);
    setShowEditRatingModal(true);
  };

  const handleDateSelect = async (date, dayName) => {
    setSelectedDate(date);
    setSelectedTime("");
    try {
      const result = await getAvailabiltyOfVendorAndTimeInUser({
        doctorId: id,
        day: selectedDay,
        startDate: date
      });

      if (result.success === 1) {
        const slots = result.details[selectedDay] || [];
        setAvailableSlots(slots);
      } else {
        setAvailableSlots([]);
        console.log("No slots available:", result.message);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    if (selectedDate && id) {
      handleDateSelect(selectedDate, selectedDay);
    }
  }, [selectedDay, id]);

  const handleTimeSelect = (time) => {
    setSelectedTime(time);

    if (membershipCheck.hasActiveMembership && membershipCheck.isFreeConsultation) {
      setShowMembershipModal(true);
    } else {
      setShowPatientModal(true);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);

    const calculatedAge = calculateAge(patient.dob);

    setBookingData(prev => ({
      ...prev,
      patientId: patient._id,
      age: calculatedAge || patient.age || ""
    }));
    setShowPatientModal(false);
    setShowBookingModal(true);
  };

  const handleMembershipConfirm = (useMembershipForAppointment) => {
    setUseMembership(useMembershipForAppointment);
    setShowMembershipModal(false);
    setShowPatientModal(true);
  };

  const handleAddPatient = async () => {
    if (!newPatientData.name || !newPatientData.dob || !newPatientData.gender) {
      alert("Please fill all required fields (Name, Date of Birth, Gender)");
      return;
    }

    const formData = new FormData();
    for (const key in newPatientData) {
      if (newPatientData[key] !== null) {
        if (key === 'pic' && newPatientData.pic instanceof File) {
          formData.append(key, newPatientData.pic);
        } else if (key !== 'pic') {
          formData.append(key, newPatientData[key]);
        }
      }
    }

    formData.append('problemDescription', newPatientData.problemDescription);

    try {
      setPatientLoading(true);
      const result = await addNewAddress(formData);
      if (result.success === 1) {
        alert("Patient/Address added successfully!");
        setShowAddPatientModal(false);
        setShowPatientModal(true);
        setNewPatientData({
          name: "", dob: "", phone: "", gender: "", address: "", country: "", state: "", city: "", pinCode: "", problemDescription: "", pic: null
        });
        await loadPatients();
      } else {
        alert(result.message || "Failed to add patient/address");
      }
    } catch (error) {
      console.error("Error adding patient/address:", error);
      alert("Error adding patient/address. Please try again.");
    } finally {
      setPatientLoading(false);
    }
  };

  const handleEditPatientStart = (patient) => {
    setEditingPatient(patient);

    let dobForInput = patient.dob;

    if (patient.dob) {
      const parts = patient.dob.split('/');
      if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2) {
        dobForInput = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (patient.dob.length > 4 && !isNaN(new Date(patient.dob).getTime())) {
        dobForInput = new Date(patient.dob).toISOString().split('T')[0];
      } else {
        const year = parseInt(patient.dob);
        if (!isNaN(year)) {
          dobForInput = `${year}-01-01`;
        } else {
          dobForInput = patient.dob;
        }
      }
    }

    setEditPatientData({
      ...patient,
      dob: dobForInput,
      pic: null,
      problemDescription: patient.problemDescription || ""
    });
    setShowPatientModal(false);
    setShowEditPatientModal(true);
  };

  const handleUpdatePatient = async () => {
    if (!editPatientData.name || !editPatientData.dob || !editPatientData.gender || !editingPatient?._id) {
      alert("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    for (const key in editPatientData) {
      if (editPatientData[key] !== null &&
        !['_id', 'userId', 'createdAt', 'updatedAt', '__v', 'age'].includes(key)
      ) {
        if (key === 'pic' && editPatientData.pic instanceof File) {
          formData.append(key, editPatientData.pic);
        } else if (key === 'pic' && editPatientData.pic === null) {
          // Do nothing
        } else if (key !== 'pic') {
          formData.append(key, editPatientData[key]);
        }
      }
    }

    try {
      setPatientLoading(true);
      const result = await updateAddress(editingPatient._id, formData);
      if (result.success === 1) {
        alert("Patient/Address updated successfully!");
        setShowEditPatientModal(false);
        setEditingPatient(null);
        await loadPatients();
        setShowPatientModal(true);
      } else {
        alert(result.message || "Failed to update patient/address");
      }
    } catch (error) {
      console.error("Error updating patient/address:", error);
      alert("Error updating patient/address. Please try again.");
    } finally {
      setPatientLoading(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to delete this patient record?")) {
      return;
    }

    try {
      setPatientLoading(true);
      const result = await deleteAddress(patientId);
      if (result.success === 1) {
        alert("Patient/Address deleted successfully!");
        await loadPatients();
        if (selectedPatient?._id === patientId) {
          setSelectedPatient(null);
        }
      } else {
        alert(result.message || "Failed to delete patient/address");
      }
    } catch (error) {
      console.error("Error deleting patient/address:", error);
      alert("Error deleting patient/address. Please try again.");
    } finally {
      setPatientLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter coupon code");
      return;
    }

    if (!id || typeof id !== 'string' || id.trim() === "") {
      setCouponError("Doctor profile not fully loaded. Cannot apply coupon.");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const baseAmount = useMembership ? 0 : parseInt(paymentType === "online" ? getConsultationFee() : getOfflineConsultationFee());

      const couponData = {
        couponCode: couponCode.trim(),
        doctorId: id,
        price: baseAmount
      };

      const result = await applyCoupon(couponData);

      if (result.success === 1) {
        if (result.discountedPrice !== null && result.discountedPrice !== undefined) {
          const discountAmount = baseAmount - Math.floor(result.discountedPrice);
          const percentageDiscount = Math.round((discountAmount / baseAmount) * 100);

          setAppliedCoupon({
            couponCode: couponCode.trim(),
            originalPrice: baseAmount,
            discountedPrice: result.discountedPrice,
            percentageDiscount: percentageDiscount,
            _id: result.coupon?._id || null
          });
          setCouponError("");
        } else {
          setAppliedCoupon(null);
          setCouponError("Coupon applied, but discounted price is missing in response.");
        }
      } else {
        setAppliedCoupon(null);
        setCouponError(result.message || "Invalid coupon code");
      }
    } catch (error) {
      setCouponError("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const calculateDiscount = (baseAmount, coupon) => {
    if (!coupon || !coupon.discountedPrice) return 0;

    const discount = baseAmount - Math.floor(coupon.discountedPrice);
    return discount > 0 ? discount : 0;
  };

  const calculateFinalAmount = () => {
    if (useMembership) {
      return 0;
    }

    const baseAmount = parseInt(paymentType === "online" ? getConsultationFee() : getOfflineConsultationFee());

    if (!appliedCoupon || appliedCoupon.discountedPrice === null || appliedCoupon.discountedPrice === undefined) return baseAmount;

    const finalAmount = Math.floor(appliedCoupon.discountedPrice);

    return finalAmount > 0 ? finalAmount : 0;
  };

  const getDiscountText = (coupon) => {
    if (!coupon) return "Discount";

    if (coupon.percentageDiscount) {
      return `${coupon.percentageDiscount}% OFF`;
    }

    const baseAmount = useMembership ? 0 : parseInt(paymentType === "online" ? getConsultationFee() : getOfflineConsultationFee());
    const discount = baseAmount - Math.floor(coupon.discountedPrice);

    return `₹${discount} OFF`;
  };

  const handleBookAppointment = async () => {
    if (!selectedTime || !bookingData.problemDescription || !bookingData.age || !selectedPatient) {
      alert("Please fill all required fields and select a patient");
      return;
    }

    setBookingLoading(true);

    const originalPrice = parseInt(paymentType === "online" ? getConsultationFee() : getOfflineConsultationFee());
    const finalAmount = calculateFinalAmount();

    let discountValue = 0;
    if (appliedCoupon && appliedCoupon.discountedPrice) {
      discountValue = originalPrice - finalAmount;
    }

    const isFreeConsultation = useMembership || false;

    const resolvedClinicId = doctorClinicId || pDoctor?.ClinicId || null;
    const isClinicAppointment = !!(resolvedClinicId && resolvedClinicId !== "" && resolvedClinicId !== "null" && resolvedClinicId !== "undefined");
    const appointmentStatus = isClinicAppointment ? "9" : "0";

    console.log("📊 Appointment Type Check:", {
      resolvedClinicId,
      isClinicAppointment,
      status: appointmentStatus
    });

    if (paymentType === "online" && !isFreeConsultation) {
      const paymentPayload = {
        doctorId: id,
        doctorName: pDoctor.name,
        doctorImage: pDoctor.image ? `${imageUrl}${pDoctor.image}` : null,
        doctorSpecialist: pDoctor.specialist?.specialists || "Specialist",
        patientId: selectedPatient._id,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        age: bookingData.age,
        problemDescription: bookingData.problemDescription,
        date: selectedDate,
        displayDate: formatDisplayDate(selectedDate),
        time: selectedTime,
        day: selectedDay,
        serviceType: pDoctor?.specialist?.specialists || "General Consultation",
        originalPrice: originalPrice,
        finalAmount: finalAmount,
        discountAmount: discountValue,
        couponId: appliedCoupon ? appliedCoupon._id : null,
        hasDoctorClinic: isClinicAppointment,
        clinicId: resolvedClinicId,
        appointmentStatus: appointmentStatus
      };

      console.log("🚀 Saving Payment Data:", paymentPayload);
      localStorage.setItem("doctorBookingPaymentData", JSON.stringify(paymentPayload));

      setShowBookingModal(false);
      setShowPatientModal(false);
      setBookingLoading(false);

      navigate(`/Doctors/payment`);
      return;
    }

    if (isFreeConsultation) {
      const bookingPayload = {
        doctorId: id,
        serviceType: pDoctor?.specialist?.specialists || "General Consultation",
        date: selectedDate,
        price: String(originalPrice),
        startime: selectedTime,
        type: paymentType === "online" ? "online" : "offline",
        day: selectedDay,
        patientId: selectedPatient._id,
        problemDescription: bookingData.problemDescription,
        age: parseInt(bookingData.age),
        status: appointmentStatus,
        ...(isClinicAppointment && { clinicId: resolvedClinicId }),
        doctorModelHasClinic: isClinicAppointment,
        useMembership: true,
        isFreeConsultation: true,
        userMembershipId: activeMembership?._id || null,
        paymentStatus: "free",
        isPaid: false,
        paymentMethod: "membership"
      };

      try {
        const result = await appointment(bookingPayload);
        if (result.success === 1) {
          alert(`✅ FREE Consultation booked successfully!`);
          setShowBookingModal(false);
          setShowPatientModal(false);
          navigate("/Doctors/history");
        } else {
          alert(result.message || "Failed to book free consultation.");
        }
      } catch (error) {
        console.error("Free booking error:", error);
        alert("Error booking free consultation.");
      }
      setBookingLoading(false);
      return;
    }

    const offlinePayload = {
      doctorId: id,
      serviceType: pDoctor?.specialist?.specialists || "General Consultation",
      date: selectedDate,
      price: String(originalPrice),
      startime: selectedTime,
      type: "offline",
      day: selectedDay,
      patientId: selectedPatient._id,
      problemDescription: bookingData.problemDescription,
      age: parseInt(bookingData.age),
      status: appointmentStatus,
      ...(isClinicAppointment && { clinicId: resolvedClinicId }),
      doctorModelHasClinic: isClinicAppointment,
      paymentStatus: "pending",
      isPaid: false,
      paymentMethod: "cash"
    };

    try {
      const result = await appointment(offlinePayload);
      if (result.success === 1) {
        alert(`Appointment booked successfully!\nPlease visit at scheduled time.`);
        setShowBookingModal(false);
        setShowPatientModal(false);
        navigate("/Doctors/history");
      } else {
        alert(result.message || "Failed to book appointment.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Error booking appointment.");
    } finally {
      setBookingLoading(false);
    }
  };

  const getConsultationFee = () => {
    if (pDoctor?.ConsultationFeesId?.onlineFees) {
      return pDoctor.ConsultationFeesId.onlineFees;
    }
    if (pDoctor?.ConsultationFeesId?.price) {
      return pDoctor.ConsultationFeesId.price;
    }
    return "500";
  };

  const getOfflineConsultationFee = () => {
    if (pDoctor?.ConsultationFeesId?.offlineFees) {
      return pDoctor.ConsultationFeesId.offlineFees;
    }
    if (pDoctor?.ConsultationFeesId?.date) {
      return pDoctor.ConsultationFeesId.date;
    }
    return "600";
  };

  useEffect(() => {
    if (showBookingModal) {
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponError("");
    }
  }, [paymentType, showBookingModal, useMembership]);


  // =======================================================
  // UI RENDER
  // =======================================================

  if (loading && !pDoctor) {
    return (
      <div className="container-fluid container-xl py-5" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 fw-bold text-muted fs-5">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (!pDoctor) {
    return (
      <div className="container-fluid container-xl py-5">
        <div className="text-center py-5">
          <i className="bi bi-person-exclamation display-1 text-muted"></i>
          <h2 className="mt-4 fw-bold">Doctor not found</h2>
          <Link to="/doctors" className="btn btn-primary rounded-pill px-4 py-2 mt-3 shadow-sm">
            <i className="bi bi-arrow-left me-2"></i> Back to Doctors
          </Link>
        </div>
      </div>
    );
  }

  const dates = generateDates();
  const baseAmount = useMembership ? 0 : parseInt(paymentType === "online" ? getConsultationFee() : getOfflineConsultationFee());
  const finalAmount = calculateFinalAmount();
  const discountAmount = baseAmount - finalAmount;
  const distribution = calculateDistribution(ratingUser);

  return (
    <>
      <style>
        {`
          body {
            background-color: #f4f7fb;
            font-family: 'Inter', sans-serif;
          }

          /* General Premium Card Styles */
          .premium-card {
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0,0,0,0.02);
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          /* Hero Section */
          .hero-img-container {
            width: 200px;
            height: 200px;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
            position: relative;
          }
          .hero-img-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          /* Info List items */
          .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .info-list li {
            padding: 16px;
            border-bottom: 1px solid #edf2f7;
            display: flex;
            align-items: center;
          }
          .info-list li:last-child {
            border-bottom: none;
          }
          .info-list li i {
            font-size: 1.5rem;
            color: #3b82f6;
            width: 40px;
            text-align: center;
            margin-right: 15px;
            background: #eff6ff;
            padding: 8px;
            border-radius: 12px;
          }

          /* Booking Section */
          .booking-header {
            background: linear-gradient(135deg, #3e4097 0%, #3e4097 100%);
            color: white;
            padding: 24px;
            border-radius: 20px 20px 0 0;
          }
          
          /* Custom Radio Buttons for Time of Day */
          .time-day-radio input[type="radio"] {
            display: none;
          }
          .time-day-radio label {
            padding: 12px 20px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            color: #64748b;
            transition: all 0.2s ease;
            flex: 1;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
          }
          .time-day-radio input[type="radio"]:checked + label {
            background: #3e4097;
            color: #ffffff;
            border-color: #3e4097;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
          }

          /* Date Pills */
          .date-slider {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            padding-bottom: 10px;
            scrollbar-width: thin;
          }
          .date-pill {
            min-width: 80px;
            padding: 16px 12px;
            border-radius: 16px;
            border: 2px solid #e2e8f0;
            background: #ffffff;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .date-pill:hover {
            border-color: #93c5fd;
            transform: translateY(-2px);
          }
          .date-pill.active {
            border-color: #3e4097;
            background: #eff6ff;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.15);
          }
          .date-pill .day { font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .date-pill.active .day { color: #3e4097; }
          .date-pill .date { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 4px 0; line-height: 1; }
          .date-pill.active .date { color: #1d4ed8; }
          .date-pill .month { font-size: 0.8rem; color: #64748b; font-weight: 500; }

          /* Time Slots */
          .time-slot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 12px;
          }
          .time-btn {
            background: #ffffff;
            border: 2px solid #e2e8f0;
            color: #334155;
            padding: 12px;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
          }
          .time-btn:hover {
            border-color: #93c5fd;
            color: #3e4097;
            background: #eff6ff;
          }
          .time-btn.selected {
            background: #10b981;
            color: white;
            border-color: #10b981;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }

          /* Ratings Custom Bars */
          .rating-bar-container {
            height: 10px;
            border-radius: 10px;
            background-color: #e2e8f0;
            overflow: hidden;
            flex-grow: 1;
            margin: 0 15px;
          }
          .rating-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #f59e0b, #fbbf24);
            border-radius: 10px;
            transition: width 0.5s ease-in-out;
          }

          /* Badges */
          .badge-clinic { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-weight: 600; display: inline-flex; align-items: center; }
          .badge-independent { background: #e0f2fe; color: #0369a1; padding: 8px 16px; border-radius: 20px; font-weight: 600; display: inline-flex; align-items: center; }
          
          /* Membership Ribbon */
          .membership-ribbon {
            background: linear-gradient(90deg, #fef2f2 0%, #fee2e2 100%);
            border-left: 5px solid #ef4444;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.1);
          }
          .pulse-icon { animation: pulse 2s infinite; }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      <div className="container-xl py-4 py-lg-5">

        {/* Top Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="fw-bold mb-0 text-dark">Doctor Profile</h2>
          <Link to="/doctors" className="btn btn-white border bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
            <i className="bi bi-arrow-left fs-5 text-dark"></i>
          </Link>
        </div>

        {/* Membership Alert Banner */}
        {membershipCheck.hasActiveMembership && (
          <div className="membership-ribbon mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div>
              <h5 className="fw-bold text-danger mb-1">
                <i className="fas fa-crown me-2 pulse-icon"></i>
                Active Membership: {activeMembership?.membership?.planName}
              </h5>
              <p className="mb-0 text-dark opacity-75 fw-semibold">
                {membershipCheck.consultationsRemaining} free consultations remaining • Valid until {new Date(activeMembership?.membership?.endDate).toLocaleDateString()}
              </p>
            </div>
            {membershipCheck.isFreeConsultation && (
              <div className="mt-3 mt-md-0">
                <span className="badge bg-danger rounded-pill px-4 py-3 shadow-sm fs-6">
                  <i className="fas fa-bolt me-2"></i> FREE CONSULTATION
                </span>
              </div>
            )}
          </div>
        )}

        <div className="row g-4">
          {/* ========================================== */}
          {/* MAIN COLUMN (LEFT) */}
          {/* ========================================== */}
          <div className="col-lg-8">

            {/* 1. Hero Card */}
            <div className="premium-card p-4 mb-4" data-aos="fade-up">
              <div className="row align-items-center">
                <div className="col-md-auto mb-4 mb-md-0 d-flex justify-content-center">
                  <div className="hero-img-container">
                    <img
                      src={pDoctor.image ? `${imageUrl}${pDoctor.image}` : "https://placehold.co/600x600?text=Doctor+Image"}
                      alt={`Dr. ${pDoctor.name}`}
                      onError={(e) => { e.target.src = "https://placehold.co/600x600?text=Doctor+Image"; }}
                    />
                  </div>
                </div>
                <div className="col-md text-center text-md-start">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start">
                    <div>
                      <h2 className="fw-bolder text-dark mb-1">Dr. {pDoctor.name || 'Unknown'}</h2>
                      <h5 className="text-primary fw-bold mb-3">{pDoctor.specialist?.specialists || "Specialist"}</h5>
                    </div>
                    <div className="bg-light px-4 py-2 rounded-4 text-center mt-2 mt-md-0">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <i className="bi bi-star-fill text-warning fs-4"></i>
                        <span className="fs-4 fw-bolder">{parseFloat(ratingUser?.ratingStatistics?.averageRating || 0).toFixed(1)}</span>
                      </div>
                      <span className="text-muted small fw-semibold">{ratingUser?.ratingStatistics?.totalRatings || 0} Reviews</span>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 mb-3 mt-2">
                    {clinicLoading ? (
                      <span className="badge bg-secondary p-2 rounded-pill"><span className="spinner-border spinner-border-sm me-1"></span> Checking Clinic</span>
                    ) : hasDoctorClinic ? (
                      <span className="badge-clinic"><i className="fas fa-hospital me-2"></i> Associated with Clinic</span>
                    ) : (
                      <span className="badge-independent"><i className="fas fa-user-md me-2"></i> Independent Practice</span>
                    )}
                    <span className="badge bg-light text-dark border p-2 rounded-pill fw-bold"><i className="fas fa-graduation-cap text-primary me-2"></i>{pDoctor.qualification?.qualification || "Qualified"}</span>
                    <span className="badge bg-light text-dark border p-2 rounded-pill fw-bold"><i className="fas fa-briefcase text-success me-2"></i>{pDoctor.experience || "Experienced"}</span>
                  </div>

                  <div className="p-3 bg-light rounded-4 mt-3">
                    <h6 className="fw-bold mb-2">About Dr. {pDoctor.name}</h6>
                    <p className="text-muted mb-0 small lh-lg">
                      {pDoctor.About || `Highly qualified specialist with extensive experience in providing top-notch medical care and patient consultations.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Info Grid (Education & Contact) */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="premium-card h-100" data-aos="fade-up" data-aos-delay="100">
                  <div className="p-4 border-bottom bg-light bg-opacity-50">
                    <h5 className="fw-bold mb-0 d-flex align-items-center text-dark">
                      <i className="bi bi-award text-primary fs-3 me-3"></i> Credentials
                    </h5>
                  </div>
                  <ul className="info-list">
                    <li><i className="bi bi-journal-medical"></i><div><small className="text-muted d-block fw-bold text-uppercase">Qualification</small><span className="fw-semibold text-dark fs-6">{pDoctor.qualification?.qualification || "Not specified"}</span></div></li>
                    <li><i className="bi bi-heart-pulse"></i><div><small className="text-muted d-block fw-bold text-uppercase">Specialization</small><span className="fw-semibold text-dark fs-6">{pDoctor.specialist?.specialists || "General Medicine"}</span></div></li>
                    <li><i className="bi bi-clock-history"></i><div><small className="text-muted d-block fw-bold text-uppercase">Experience</small><span className="fw-semibold text-dark fs-6">{pDoctor.experience || "Not specified"}</span></div></li>
                    <li><i className="bi bi-people"></i><div><small className="text-muted d-block fw-bold text-uppercase">Patients Treated</small><span className="fw-semibold text-dark fs-6">{pDoctor.patientstreated || "0"}</span></div></li>
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="premium-card h-100" data-aos="fade-up" data-aos-delay="200">
                  <div className="p-4 border-bottom bg-light bg-opacity-50">
                    <h5 className="fw-bold mb-0 d-flex align-items-center text-dark">
                      <i className="bi bi-geo-alt text-danger fs-3 me-3"></i> Location & Contact
                    </h5>
                  </div>
                  <ul className="info-list">
                    <li><i className="bi bi-building"></i><div><small className="text-muted d-block fw-bold text-uppercase">Address</small><span className="fw-semibold text-dark fs-6">{pDoctor.address || "Not specified"}</span></div></li>
                    <li><i className="bi bi-map"></i><div><small className="text-muted d-block fw-bold text-uppercase">City & State</small><span className="fw-semibold text-dark fs-6">{pDoctor.city || "Not specified"}, {pDoctor.state || ""}</span></div></li>
                    <li><i className="bi bi-telephone"></i><div><small className="text-muted d-block fw-bold text-uppercase">Phone Number</small><span className="fw-semibold text-dark fs-6">{pDoctor.phoneNumber || "Not available"}</span></div></li>
                    <li><i className="bi bi-envelope"></i><div><small className="text-muted d-block fw-bold text-uppercase">Email ID</small><span className="fw-semibold text-dark fs-6 text-break">{pDoctor.email || "Not available"}</span></div></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Ratings & Reviews */}
            <div className="premium-card mb-4 mb-lg-0" data-aos="fade-up" data-aos-delay="300">
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-50">
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center">
                  <i className="bi bi-chat-right-text text-primary fs-3 me-3"></i> Patient Reviews
                </h5>
                <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => setShowRatingForm(!showRatingForm)} disabled={ratingsLoadingUser}>
                  {showRatingForm ? <><i className="bi bi-x-circle me-2"></i>Cancel</> : <><i className="bi bi-pencil-square me-2"></i>Write Review</>}
                </button>
              </div>

              <div className="p-4">
                {/* Rating Form */}
                {showRatingForm && (
                  <div className="bg-white p-4 rounded-4 mb-5 border border-primary border-opacity-25 shadow-sm">
                    <h5 className="fw-bold mb-4">Share Your Experience</h5>
                    <div className="row g-4">
                      <div className="col-md-5 border-end">
                        <label className="fw-bold text-muted text-uppercase small mb-3">Overall Rating *</label>
                        <div className="d-flex">
                          {[...Array(5)].map((_, index) => (
                            <HalfStar key={index} index={index} rating={newRating} hoverRating={hoverRating} setHover={setHoverRating} setRating={setNewRating} />
                          ))}
                        </div>
                        <div className="mt-3 fw-bold text-warning fs-5">
                          {newRating > 0 ? `${newRating.toFixed(1)} out of 5` : 'Click to rate'}
                        </div>
                      </div>
                      <div className="col-md-7">
                        <label className="fw-bold text-muted text-uppercase small mb-3">Detailed Feedback *</label>
                        <textarea className="form-control bg-light border-0 rounded-4 p-3" rows="3" value={ratingDescription} onChange={(e) => setRatingDescription(e.target.value)} placeholder="How was your visit?" required></textarea>
                        <div className="mt-3 text-end">
                          <button className="btn btn-success rounded-pill px-5 fw-bold shadow-sm" onClick={submitRating} disabled={submittingRating || newRating === 0 || !ratingDescription.trim()}>
                            {submittingRating ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send me-2"></i>}
                            Post Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating Summary and List */}
                {ratingsLoadingUser ? (
                  <div className="text-center py-5"><div className="spinner-border text-primary fs-3"></div></div>
                ) : errorRating ? (
                  <div className="alert alert-danger rounded-4"><i className="bi bi-exclamation-triangle me-2"></i>{errorRating}</div>
                ) : ratingUser ? (
                  <div className="row">
                    <div className="col-lg-4 mb-4 mb-lg-0 text-center text-lg-start border-end-lg pe-lg-4">
                      <h1 className="display-1 fw-bolder text-dark mb-0">{parseFloat(ratingUser.ratingStatistics?.averageRating || "0.0").toFixed(1)}</h1>
                      <div className="d-flex justify-content-center justify-content-lg-start my-2">
                        {renderStars(parseFloat(ratingUser.ratingStatistics?.averageRating || 0), '1.5rem')}
                      </div>
                      <p className="text-muted fw-semibold mb-4">Based on {ratingUser.ratingStatistics?.totalRatings || 0} reviews</p>

                      <div className="mt-4">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="d-flex align-items-center mb-2">
                            <span className="fw-bold text-muted" style={{ width: '20px' }}>{star}</span>
                            <i className="bi bi-star-fill text-warning mx-1 fs-6"></i>
                            <div className="rating-bar-container">
                              <div className="rating-bar-fill" style={{ width: `${distribution[star] || 0}%` }}></div>
                            </div>
                            <span className="text-muted fw-bold small text-end" style={{ width: '40px' }}>{distribution[star] || 0}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-lg-8 ps-lg-4">
                      <h5 className="fw-bold mb-4">Patient Feedback</h5>
                      {ratingUser.ratings && ratingUser.ratings.length > 0 ? (
                        <div className="d-flex flex-column gap-3" style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                          {ratingUser.ratings.map((rating) => (
                            <div key={rating._id} className="bg-light p-4 rounded-4 border border-light">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center">
                                  <div className="rounded-circle bg-primary bg-gradient text-white d-flex align-items-center justify-content-center fw-bold fs-5 me-3 shadow-sm" style={{ width: '45px', height: '45px' }}>
                                    {rating.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <h6 className="mb-0 fw-bold fs-6">{rating.user?.name || 'Anonymous Patient'}</h6>
                                    <small className="text-muted fw-semibold">{formatRatingDate(rating.createdAt)}</small>
                                  </div>
                                </div>
                                <div className="text-end">
                                  {renderStars(parseFloat(rating.rating), '1rem')}
                                  {isCurrentUserRating(rating) && (
                                    <div className="mt-2">
                                      <button className="btn btn-sm btn-outline-primary rounded-pill me-2" onClick={() => handleEditClick(rating)}><i className="bi bi-pencil"></i></button>
                                      <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDeleteRating(rating._id)}><i className="bi bi-trash"></i></button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-dark opacity-75 mb-0 fw-medium lh-base">
                                {rating.description && rating.description.trim() !== "" ? `"${rating.description}"` : "No written feedback provided."}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-5 bg-light rounded-4">
                          <i className="bi bi-chat-square-quote display-3 text-secondary opacity-50 mb-3"></i>
                          <h5 className="fw-bold">No Reviews Yet</h5>
                          <p className="text-muted">Be the first to leave a review for Dr. {pDoctor.name}.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

          </div>

          {/* ========================================== */}
          {/* SIDEBAR BOOKING WIDGET (RIGHT) */}
          {/* ========================================== */}
          <div className="col-lg-4">
            <div className="premium-card position-sticky" style={{ top: '20px' }} data-aos="fade-left">

              {/* Header */}
              <div className="booking-header">
                <h4 className="fw-bold mb-3 d-flex align-items-center">
                  <i className="bi bi-calendar2-check me-2 fs-3"></i> Book Appointment
                </h4>
                <div className="bg-white bg-opacity-25 rounded-4 p-3 backdrop-blur shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold"><i className="bi bi-camera-video me-2"></i>Digital Consult</span>
                    <span className="fs-5 fw-bolder">₹ {getConsultationFee()}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold"><i className="bi bi-building me-2"></i>Clinic Visit</span>
                    <span className="fs-5 fw-bolder">₹ {getOfflineConsultationFee()}</span>
                  </div>
                  {membershipCheck.hasActiveMembership && membershipCheck.isFreeConsultation && (
                    <div className="mt-3 pt-2 border-top border-light border-opacity-50 text-warning text-center fw-bold">
                      <i className="fas fa-gift me-2"></i> Free with Membership
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4">

                {/* Day Selection */}
                <h6 className="fw-bold text-dark text-uppercase small mb-3 letter-spacing">Select Shift</h6>
                <div className="d-flex gap-2 time-day-radio mb-4">
                  {['Morning', 'Afternoon', 'Evening'].map(day => (
                    <React.Fragment key={day}>
                      <input
                        type="radio"
                        name="day-time"
                        id={`btn-check-${day}`}
                        checked={selectedDay === day}
                        onChange={() => setSelectedDay(day)}
                      />
                      <label htmlFor={`btn-check-${day}`}>
                        <i className={`bi fs-4 ${day === 'Morning' ? 'bi-sunrise' : day === 'Afternoon' ? 'bi-sun' : 'bi-moon-stars'}`}></i>
                        {day}
                      </label>
                    </React.Fragment>
                  ))}
                </div>

                {/* Date Selection */}
                <h6 className="fw-bold text-dark text-uppercase small mb-3 letter-spacing">Select Date</h6>
                <div className="date-slider mb-4">
                  {dates.map((dateObj, index) => (
                    <div
                      key={index}
                      className={`date-pill ${selectedDate === dateObj.fullDate ? 'active' : ''}`}
                      onClick={() => handleDateSelect(dateObj.fullDate, dateObj.day)}
                    >
                      <div className="day">{dateObj.day}</div>
                      <div className="date">{dateObj.date}</div>
                      <div className="month">{dateObj.month}</div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="animate__animated animate__fadeIn">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold text-dark text-uppercase small mb-0 letter-spacing">Time Slots</h6>
                      <span className="badge bg-light border text-primary fw-bold px-3 py-2 rounded-pill">{formatDisplayDate(selectedDate)}</span>
                    </div>

                    {availableSlots.length > 0 ? (
                      <>
                        <div className="time-slot-grid">
                          {availableSlots.map((slot, index) => (
                            <div
                              key={index}
                              className={`time-btn ${selectedTime === slot ? 'selected' : ''}`}
                              onClick={() => handleTimeSelect(slot)}
                            >
                              {slot}
                            </div>
                          ))}
                        </div>
                        {selectedTime && (
                          <div className="mt-4 pt-3 border-top text-center animate__animated animate__fadeInUp">
                            <button
                              className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow"
                              onClick={() => {
                                if (membershipCheck.hasActiveMembership && membershipCheck.isFreeConsultation) {
                                  setShowMembershipModal(true);
                                } else {
                                  handleTimeSelect(selectedTime);
                                }
                              }}
                            >
                              Proceed to Book <i className="bi bi-arrow-right-circle ms-2"></i>
                            </button>
                            <small className="text-muted mt-2 d-block fw-semibold">Selected: {selectedTime}</small>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4 bg-light rounded-4">
                        <i className="bi bi-calendar-x fs-1 text-secondary opacity-50 mb-2"></i>
                        <p className="text-muted fw-semibold mb-0">No slots available for {selectedDay}.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* MODALS */}
      {/* ======================================================= */}

      {/* Membership Confirmation Modal */}
      {showMembershipModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-warning border-0 p-4 pb-0">
                <button type="button" className="btn-close" onClick={() => setShowMembershipModal(false)}></button>
              </div>
              <div className="modal-body text-center p-4 pt-0">
                <div className="mb-4 mt-n3">
                  <div className="bg-white rounded-circle d-inline-flex justify-content-center align-items-center shadow mb-3" style={{ width: '90px', height: '90px', marginTop: '-45px' }}>
                    <i className="fas fa-gift fa-3x text-warning"></i>
                  </div>
                  <h3 className="fw-bolder">Free Consultation!</h3>
                  <p className="text-muted mt-2 px-3 fw-semibold">
                    You have <strong className="text-dark fs-5">{membershipCheck.consultationsRemaining}</strong> free consultations remaining. Would you like to use one now?
                  </p>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <button className="btn btn-warning text-dark w-100 py-3 fw-bold rounded-pill shadow" onClick={() => { setUseMembership(true); setShowMembershipModal(false); setShowPatientModal(true); }}>
                      <i className="fas fa-crown me-2"></i> Apply Free Visit
                    </button>
                    <small className="text-success d-block mt-2 fw-bold">Pay ₹0 today</small>
                  </div>
                  <div className="col-12 col-sm-6">
                    <button className="btn btn-light bg-white border w-100 py-3 fw-bold rounded-pill shadow-sm" onClick={() => { setUseMembership(false); setShowMembershipModal(false); setShowPatientModal(true); }}>
                      Pay Normally
                    </button>
                    <small className="text-muted d-block mt-2 fw-semibold">Standard fees apply</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Modals Component */}
      <PatientModalsAndSelection
        patients={patients} patientLoading={patientLoading} selectedPatient={selectedPatient}
        imageUrl={imageUrl} calculateAge={calculateAge} showPatientModal={showPatientModal}
        setShowPatientModal={setShowPatientModal} handlePatientSelect={handlePatientSelect}
        handleEditPatientStart={handleEditPatientStart} handleDeletePatient={handleDeletePatient}
        showAddPatientModal={showAddPatientModal} setShowAddPatientModal={setShowAddPatientModal}
        newPatientData={newPatientData} setNewPatientData={setNewPatientData} handleAddPatient={handleAddPatient}
        showEditPatientModal={showEditPatientModal} setShowEditPatientModal={setShowEditPatientModal}
        editingPatient={editingPatient} setEditingPatient={setEditingPatient} editPatientData={editPatientData}
        setEditPatientData={setEditPatientData} handleUpdatePatient={handleUpdatePatient}
      />

      {/* Main Booking Modal */}
      {showBookingModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

              <div className="modal-header bg-light border-bottom p-4">
                <h4 className="modal-title fw-bolder text-dark">
                  {useMembership ? <span className="text-success"><i className="fas fa-crown me-2"></i>Confirm Free Booking</span> : "Confirm Appointment"}
                </h4>
                <button type="button" className="btn-close bg-white shadow-sm rounded-circle p-2" onClick={() => { setShowBookingModal(false); setAppliedCoupon(null); setCouponCode(""); setCouponError(""); setUseMembership(false); }} disabled={bookingLoading}></button>
              </div>

              <div className="modal-body p-4 bg-white">
                <div className="row g-4">
                  {/* Left Column: Form & Info */}
                  <div className="col-md-7 border-end-md pe-md-4">

                    {/* Status Alerts */}
                    {clinicLoading ? (
                      <div className="alert alert-secondary py-2 d-flex align-items-center fw-bold"><span className="spinner-border spinner-border-sm me-3"></span> Verifying Location...</div>
                    ) : hasDoctorClinic ? (
                      <div className="alert alert-success py-2 d-flex align-items-center fw-bold border-0 shadow-sm"><i className="fas fa-hospital fs-4 me-3 text-success"></i> Clinic Appointment Confirmed</div>
                    ) : (
                      <div className="alert alert-primary py-2 d-flex align-items-center fw-bold border-0 shadow-sm"><i className="fas fa-user-md fs-4 me-3 text-primary"></i> Independent Practice Confirmed</div>
                    )}

                    {/* Patient Card */}
                    <div className="p-3 bg-light rounded-4 mb-4 border border-light shadow-sm d-flex align-items-center">
                      <img src={selectedPatient?.pic ? `${imageUrl}${selectedPatient.pic}` : "https://placehold.co/100"} className="rounded-circle shadow-sm me-3" style={{ width: '60px', height: '60px', objectFit: 'cover' }} alt="Patient" />
                      <div>
                        <small className="text-muted fw-bold text-uppercase d-block mb-1">Selected Patient</small>
                        <h6 className="fw-bolder mb-1 fs-5 text-dark">{selectedPatient?.name}</h6>
                        <span className="badge bg-white text-dark border me-2 shadow-sm">{bookingData.age} Years</span>
                        <span className="badge bg-white text-dark border shadow-sm">{selectedPatient?.gender}</span>
                      </div>
                    </div>

                    {/* Form Inputs */}
                    <div className="mb-4">
                      <label className="fw-bolder small text-dark mb-2 text-uppercase">Describe your health issue *</label>
                      <textarea className="form-control rounded-4 shadow-sm border p-3" value={bookingData.problemDescription} onChange={(e) => setBookingData({ ...bookingData, problemDescription: e.target.value })} placeholder="Please provide brief details..." disabled={bookingLoading} required rows="3" />
                    </div>

                    <div className="mb-3 w-50">
                      <label className="fw-bolder small text-dark mb-2 text-uppercase">Patient Age *</label>
                      <input type="number" className="form-control rounded-pill shadow-sm border px-3 py-2" value={bookingData.age} onChange={(e) => setBookingData({ ...bookingData, age: e.target.value })} min="1" max="120" disabled={bookingLoading} required />
                    </div>
                  </div>

                  {/* Right Column: Payment & Summary */}
                  <div className="col-md-5">

                    {/* Payment Types (Hide if Free) */}
                    {!useMembership && (
                      <div className="mb-4">
                        <label className="fw-bolder small text-dark mb-2 text-uppercase">Mode of Consultation *</label>
                        <div className="d-flex flex-column gap-2">
                          <label className={`btn text-start p-3 rounded-4 border ${paymentType === "online" ? "btn-primary shadow" : "bg-light border-light"}`} onClick={() => setPaymentType("online")} style={{ cursor: 'pointer' }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bolder fs-6"><i className="bi bi-camera-video-fill me-2"></i>Digital Consult</span>
                              <input type="radio" className="form-check-input mt-0 shadow-sm" checked={paymentType === "online"} readOnly />
                            </div>
                            <span className={`d-block mt-1 fw-bold ${paymentType === "online" ? "text-white" : "text-primary"}`}>₹ {getConsultationFee()}</span>
                          </label>
                          <label className={`btn text-start p-3 rounded-4 border ${paymentType === "offline" ? "btn-primary shadow" : "bg-light border-light"}`} onClick={() => setPaymentType("offline")} style={{ cursor: 'pointer' }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bolder fs-6"><i className="bi bi-building-fill me-2"></i>Clinic Visit</span>
                              <input type="radio" className="form-check-input mt-0 shadow-sm" checked={paymentType === "offline"} readOnly />
                            </div>
                            <span className={`d-block mt-1 fw-bold ${paymentType === "offline" ? "text-white" : "text-primary"}`}>₹ {getOfflineConsultationFee()}</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Coupons (Hide if Free) */}
                    {!useMembership && (
                      <div className="mb-4 bg-light p-3 rounded-4 border">
                        <div className="d-flex justify-content-between mb-3 align-items-center">
                          <span className="fw-bolder small text-dark text-uppercase">Apply Offer</span>
                          {availableCoupons.length > 0 && (
                            <span className="text-primary small fw-bold text-decoration-underline" style={{ cursor: 'pointer' }} onClick={() => setShowCouponList(!showCouponList)}>
                              {showCouponList ? 'Hide Offers' : 'View Offers'}
                            </span>
                          )}
                        </div>

                        {showCouponList && availableCoupons.length > 0 && (
                          <div className="mb-3 d-flex flex-column gap-2">
                            {availableCoupons.map((c) => (
                              <div key={c._id} className="p-2 border border-warning rounded-3 bg-white shadow-sm" style={{ cursor: 'pointer' }} onClick={() => { setCouponCode(c.couponCode); setShowCouponList(false); }}>
                                <div className="d-flex justify-content-between align-items-center"><span className="badge bg-warning text-dark fs-6">{c.couponCode}</span><span className="text-success fw-bolder">{getDiscountText(c)}</span></div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!appliedCoupon ? (
                          <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                            <input type="text" className="form-control border-0 px-3 fw-bold" placeholder="Enter Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} disabled={couponLoading} />
                            <button className="btn btn-dark px-4 fw-bold" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                              {couponLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Apply'}
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-between align-items-center bg-success bg-opacity-10 text-success p-3 rounded-pill border border-success fw-bold shadow-sm">
                            <span><i className="bi bi-check-circle-fill me-2 fs-5"></i> {appliedCoupon.couponCode} Applied</span>
                            <i className="bi bi-x-circle-fill text-danger fs-5" style={{ cursor: 'pointer' }} onClick={handleRemoveCoupon}></i>
                          </div>
                        )}
                        {couponError && <small className="text-danger d-block mt-2 fw-bold"><i className="bi bi-exclamation-circle-fill me-1"></i>{couponError}</small>}
                      </div>
                    )}

                    {/* Receipt Card */}
                    <div className="bg-dark text-white p-4 rounded-4 shadow-lg">
                      <h6 className="fw-bolder mb-3 border-bottom border-secondary pb-2 text-uppercase letter-spacing text-light opacity-75">Booking Summary</h6>
                      <div className="d-flex justify-content-between mb-2 small"><span className="opacity-75">Date & Time</span><span className="fw-bold">{selectedDate} at {selectedTime}</span></div>
                      <div className="d-flex justify-content-between mb-2 small"><span className="opacity-75">Doctor</span><span className="fw-bold">Dr. {pDoctor.name}</span></div>

                      <div className="mt-3 pt-3 border-top border-secondary">
                        {useMembership ? (
                          <>
                            <div className="d-flex justify-content-between mb-1 small text-light opacity-75"><span>Consultation Fee</span><span>₹ {paymentType === "online" ? getConsultationFee() : getOfflineConsultationFee()}</span></div>
                            <div className="d-flex justify-content-between mb-1 small text-warning fw-bold"><span>Membership Applied</span><span>-₹ {paymentType === "online" ? getConsultationFee() : getOfflineConsultationFee()}</span></div>
                            <div className="d-flex justify-content-between mt-3 pt-2 border-top border-secondary fs-4"><strong>Total Payable</strong><strong className="text-warning">₹ 0</strong></div>
                          </>
                        ) : (
                          <>
                            <div className="d-flex justify-content-between mb-1 small text-light opacity-75"><span>Consultation Fee</span><span className={appliedCoupon ? 'text-decoration-line-through' : ''}>₹ {baseAmount}</span></div>
                            {appliedCoupon && discountAmount > 0 && <div className="d-flex justify-content-between mb-1 small text-success fw-bold"><span>Coupon Discount</span><span>-₹ {discountAmount}</span></div>}
                            <div className="d-flex justify-content-between mt-3 pt-2 border-top border-secondary fs-4"><strong>Total Payable</strong><strong className="text-success">₹ {finalAmount}</strong></div>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light border-top p-4 d-flex justify-content-between">
                <button type="button" className="btn btn-outline-dark rounded-pill px-4 fw-bold bg-white" onClick={() => { setShowBookingModal(false); setShowPatientModal(true); if (!useMembership) { setAppliedCoupon(null); setCouponCode(""); } }} disabled={bookingLoading}>
                  Back
                </button>
                <button type="button" className="btn btn-primary rounded-pill px-5 py-2 shadow-lg fw-bolder fs-6" onClick={handleBookAppointment} disabled={bookingLoading || !bookingData.problemDescription || !bookingData.age || !selectedPatient}>
                  {bookingLoading ? <><span className="spinner-border spinner-border-sm me-2"></span> Processing Please Wait...</> :
                    (useMembership ? `Confirm Free Booking Now` : paymentType === "online" ? `Pay ₹${finalAmount} & Book` : `Confirm Booking`)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rating Modal */}
      {showEditRatingModal && editingRatingDetails && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-bottom-0 p-4">
                <h5 className="modal-title fw-bolder"><i className="bi bi-pencil-square me-2"></i>Edit Your Review</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditRatingModal(false)} disabled={submittingEdit}></button>
              </div>
              <div className="modal-body p-4 bg-white">
                <div className="mb-4 text-center p-3 bg-light rounded-4 border">
                  <label className="fw-bolder small text-dark mb-3 text-uppercase">Update Rating</label>
                  <div className="d-flex justify-content-center">
                    {[...Array(5)].map((_, index) => (
                      <HalfStar key={index} index={index} rating={editRatingValue} hoverRating={0} setHover={() => { }} setRating={setEditRatingValue} />
                    ))}
                  </div>
                  <div className="mt-3 text-warning fw-bolder fs-5">{editRatingValue.toFixed(1)} Stars</div>
                </div>
                <div>
                  <label className="fw-bolder small text-dark mb-2 text-uppercase">Update Description</label>
                  <textarea className="form-control bg-light border shadow-sm rounded-4 p-3" rows="4" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required disabled={submittingEdit}></textarea>
                </div>
              </div>
              <div className="modal-footer bg-light border-top p-4">
                <button type="button" className="btn btn-outline-dark rounded-pill px-4 fw-bold bg-white" onClick={() => setShowEditRatingModal(false)} disabled={submittingEdit}>Cancel</button>
                <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleUpdateRating} disabled={submittingEdit || editRatingValue === 0 || !editDescription.trim()}>
                  {submittingEdit ? <><span className="spinner-border spinner-border-sm me-2"></span> Updating...</> : <><i className="bi bi-check2-circle me-2"></i> Update Review</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorsProfile;
