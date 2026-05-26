import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MyContext } from '../../../../Context/Context';
import defaultPharmacyImg from '../../../Assets/img/pharmacy.png';
import { Button, Alert, Spinner, Badge } from 'react-bootstrap';
// Icons import
import {
  FaStar, FaStarHalfAlt, FaRegStar,
  FaMapMarkerAlt, FaPhone, FaDirections, FaClock,
  FaPlusCircle, FaCheckCircle, FaExclamationTriangle,
  FaPencilAlt, FaTrash, FaUser
} from 'react-icons/fa';
import axios from 'axios';

// =======================================================
// 1. HELPER FUNCTIONS
// =======================================================

const formatRatingDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  } catch (error) {
    return dateString;
  }
};

const renderStars = (rating, size = 18) => {
  const floatRating = parseFloat(rating) || 0;
  const fullStars = Math.floor(floatRating);
  const hasHalfStar = floatRating % 1 !== 0 && floatRating % 1 >= 0.25 && floatRating % 1 <= 0.75;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={{ display: 'flex', color: '#ffb822', gap: '4px', alignItems: 'center' }}>
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} size={size} className="shadow-sm" />
      ))}
      {hasHalfStar && (
        <FaStarHalfAlt size={size} className="shadow-sm" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} size={size} color="#e2e8f0" />
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
// 2. STAR RATING INPUT COMPONENT
// =======================================================
const StarRatingInput = ({ rating, setRating, disabled = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '6px', cursor: disabled ? 'default' : 'pointer' }}>
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index} style={{ cursor: disabled ? 'default' : 'pointer', margin: 0 }}>
            <input
              type="radio"
              name="rating"
              style={{ display: 'none' }}
              value={ratingValue}
              onClick={() => !disabled && setRating(ratingValue)}
            />
            <FaStar
              size={32}
              color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              onMouseEnter={() => !disabled && setHover(ratingValue)}
              onMouseLeave={() => !disabled && setHover(0)}
              style={{ transition: 'all 0.2s ease', transform: ratingValue <= (hover || rating) ? 'scale(1.1)' : 'scale(1)' }}
            />
          </label>
        );
      })}
    </div>
  );
};

// =======================================================
// 3. MAIN COMPONENT
// =======================================================

const PharmacyProfile = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const {
    pharmacyShops = [],
    fetchPharmacyShops,
    fetchVendorAvailability,
  } = useContext(MyContext);

  const [vendor, setVendor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // =======================================================
  // RATINGS STATE
  // =======================================================

  const [ratingUser, setRatingsUser] = useState(null);
  const [ratingsLoadingUser, setRatingsLoadingUser] = useState(false);
  const [errorRating, setErrorRating] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);

  const [newRating, setNewRating] = useState(0);
  const [ratingDescription, setRatingDescription] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // EDIT RATING STATES
  const [showEditRatingModal, setShowEditRatingModal] = useState(false);
  const [editingRatingDetails, setEditingRatingDetails] = useState(null);
  const [editRatingValue, setEditRatingValue] = useState(0);
  const [editDescription, setEditDescription] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // =======================================================
  // RATING API LOGIC
  // =======================================================

  const getRatings = async (id) => {
    setRatingsLoadingUser(true);
    setErrorRating(null);
    try {
      const Token = localStorage.getItem("token");
      const headers = Token ? { token: Token, 'Content-Type': 'application/json' } : {};

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user-rating/getratings`,
        {
          params: { vendorId: id },
          headers: headers,
        }
      );

      if (response.data.success === 1) {
        setRatingsUser(response.data.data);
      } else {
        setRatingsUser(null);
      }
    } catch (err) {
      console.error("Error fetching ratings", err);
    } finally {
      setRatingsLoadingUser(false);
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
      if (!Token) {
        alert("Please login to submit a rating");
        navigate('/login');
        return;
      }

      const ratingData = {
        rating: newRating.toString(),
        description: ratingDescription,
        vendorId: vendorId
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user-rating`,
        ratingData,
        {
          headers: { token: Token, 'Content-Type': 'application/json' },
        }
      );

      if (response.data.success === 1) {
        await getRatings(vendorId);
        setShowRatingForm(false);
        setNewRating(0);
        setRatingDescription('');
        alert('Rating submitted successfully!');
      } else {
        alert(response.data.message || 'Failed to submit rating');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleUpdateRating = async () => {
    if (editRatingValue === 0) return alert('Please select a rating');
    if (!editDescription.trim()) return alert('Please enter a description');
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
        { headers: { token: Token, 'Content-Type': 'application/json' } }
      );

      if (response.data.success === 1) {
        await getRatings(vendorId);
        setShowEditRatingModal(false);
        alert('Rating updated successfully!');
      } else {
        alert(response.data.message || 'Failed to update rating');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating rating');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm("Are you sure you want to delete this rating?")) return;

    try {
      const Token = localStorage.getItem("token");
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/user-rating/delete/${ratingId}`,
        { headers: { token: Token } }
      );

      if (response.data.success === 1) {
        await getRatings(vendorId);
        alert('Rating deleted successfully!');
      } else {
        alert(response.data.message || 'Failed to delete rating');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting rating');
    }
  };

  const handleEditClick = (ratingItem) => {
    setEditingRatingDetails(ratingItem);
    setEditRatingValue(parseFloat(ratingItem.rating));
    setEditDescription(ratingItem.description);
    setShowEditRatingModal(true);
  };

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.id;
      }
    } catch (error) { console.error(error); }
    return null;
  };

  const isCurrentUserRating = (rating) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;
    return rating.user?._id === currentUserId || rating.userId === currentUserId;
  };

  // =======================================================
  // USE EFFECT
  // =======================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        let foundVendor = pharmacyShops.find(shop => shop._id === vendorId);

        if (!foundVendor) {
          await fetchPharmacyShops();
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (vendorId) fetchData();
  }, [vendorId, fetchPharmacyShops]);

  useEffect(() => {
    if (pharmacyShops.length > 0 && vendorId) {
      const found = pharmacyShops.find(shop => shop._id === vendorId);
      if (found) {
        setVendor(found);
        setIsLoading(false);

        fetchVendorAvailability(vendorId).then(data => setAvailability(data || [])).catch(e => console.error(e));
        getRatings(vendorId);
      } else if (!isLoading) {
        // Not found fallback
      }
    } else if (pharmacyShops.length === 0 && !isLoading) {
      fetchPharmacyShops().then(() => setIsLoading(false));
    }
  }, [pharmacyShops, vendorId]);

  const getAddress = () => {
    if (!vendor) return 'Address not available';
    const { address = '', city = '', state = '', country = '' } = vendor;
    return [address, city, state, country].filter(part => part?.trim()).join(', ') || 'Address not available';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultPharmacyImg;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_API_URL}${imagePath}`;
  };

  const distribution = calculateDistribution(ratingUser);

  // =======================================================
  // RENDER
  // =======================================================

  if (isLoading && !vendor) {
    return (
      <div className="container-fluid container-xl py-5" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 fw-bold text-muted fs-5">Loading pharmacy details...</p>
        </div>
      </div>
    );
  }

  if (apiError && !vendor) {
    return (
      <div className="container py-5">
        <Alert variant="danger" className="rounded-4 border-0 shadow-sm p-4 text-center">
          <FaExclamationTriangle size={40} className="text-danger mb-3" />
          <h4 className="fw-bold">Error Loading Pharmacy</h4>
          <p className="text-muted">{apiError}</p>
          <div className="mt-4">
            <Button variant="primary" onClick={() => window.location.reload()} className="rounded-pill px-4 me-2 shadow-sm">Retry</Button>
            <Button variant="light" onClick={() => navigate('/pharmacy')} className="rounded-pill px-4 shadow-sm border">Back to Directory</Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!vendor && !isLoading) {
    return (
      <div className="container py-5">
        <Alert variant="warning" className="rounded-4 border-0 shadow-sm p-5 text-center">
          <i className="bi bi-shop display-1 text-warning mb-3"></i>
          <h3 className="fw-bold mt-2">Pharmacy Not Found</h3>
          <p className="text-muted">The pharmacy you are looking for does not exist or has been removed.</p>
          <Button variant="dark" onClick={() => navigate('/pharmacy')} className="rounded-pill px-4 mt-3 shadow-sm">
            Browse All Pharmacies
          </Button>
        </Alert>
      </div>
    );
  }

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
            width: 180px;
            height: 180px;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
            position: relative;
            background: #fff;
          }
          .hero-img-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          /* Info List items */
          .info-list { list-style: none; padding: 0; margin: 0; }
          .info-list li { padding: 16px; border-bottom: 1px solid #edf2f7; display: flex; align-items: center; justify-content: space-between; }
          .info-list li:last-child { border-bottom: none; }

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

          /* Quick Action Buttons */
          .quick-action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 14px 20px;
            border-radius: 16px;
            font-weight: 700;
            transition: all 0.2s;
            text-decoration: none;
            flex: 1;
            text-align: center;
          }
          .btn-call { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
          .btn-call:hover { background: #2563eb; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
          
          .btn-dir { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
          .btn-dir:hover { background: #16a34a; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(22,163,74,0.2); }
        `}
      </style>

      <div className="container-xl py-4 py-lg-5">

        {/* Top Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="fw-bold mb-0 text-dark">Pharmacy Profile</h2>
          <Link to="/pharmacy" className="btn btn-white border bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
            <i className="bi bi-arrow-left fs-5 text-dark"></i>
          </Link>
        </div>

        <div className="row g-4">
          {/* ========================================== */}
          {/* MAIN COLUMN (LEFT) */}
          {/* ========================================== */}
          <div className="col-lg-8">

            {/* 1. Hero Card */}
            <div className="premium-card p-4 mb-4">
              <div className="row align-items-center">
                <div className="col-md-auto mb-4 mb-md-0 d-flex justify-content-center">
                  <div className="hero-img-container">
                    <img
                      src={getImageUrl(vendor.image)}
                      alt={vendor.name || 'Pharmacy'}
                      onError={(e) => e.target.src = defaultPharmacyImg}
                    />
                  </div>
                </div>
                <div className="col-md text-center text-md-start">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start">
                    <div>
                      <h2 className="fw-bolder text-dark mb-1">{vendor.name || 'Pharmacy'}</h2>
                      {vendor.labName && <h6 className="text-primary fw-bold mb-3 d-flex align-items-center justify-content-center justify-content-md-start"><i className="bi bi-building me-2"></i>{vendor.labName}</h6>}
                    </div>
                    <div className="bg-light px-4 py-2 rounded-4 text-center mt-2 mt-md-0 border">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <FaStar className="text-warning fs-4" />
                        <span className="fs-4 fw-bolder">{parseFloat(ratingUser?.ratingStatistics?.averageRating || vendor.rating || 0).toFixed(1)}</span>
                      </div>
                      <span className="text-muted small fw-semibold">{ratingUser?.ratingStatistics?.totalRatings || 0} Reviews</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-light rounded-4 border d-flex align-items-start text-start">
                    <FaMapMarkerAlt className="text-danger mt-1 me-3 fs-5" />
                    <div>
                      <span className="d-block fw-bold text-dark mb-1">Registered Address</span>
                      <span className="text-muted small lh-sm">{getAddress()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Banner Image (If exists) */}
            {vendor.banner && (
              <div className="premium-card mb-4 overflow-hidden border-0 bg-dark">
                <img
                  src={getImageUrl(vendor.banner)}
                  alt="Pharmacy Banner"
                  style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', opacity: '0.9' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}

            {/* 3. About Section (If exists) */}
            {vendor.timings?.[0]?.description && (
              <div className="premium-card p-4 mb-4">
                <h5 className="fw-bold text-dark d-flex align-items-center mb-3">
                  <i className="bi bi-info-circle-fill text-primary fs-4 me-3"></i> About Us
                </h5>
                <p className="text-muted mb-0 lh-lg" style={{ fontSize: '0.95rem' }}>
                  {vendor.timings[0].description}
                </p>
              </div>
            )}

            {/* 4. Ratings & Reviews */}
            <div className="premium-card mb-4 mb-lg-0">
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-50">
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center">
                  <FaStar className="text-warning fs-3 me-3" /> Patient Reviews
                </h5>
                <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center" onClick={() => setShowRatingForm(!showRatingForm)} disabled={ratingsLoadingUser}>
                  {showRatingForm ? <><FaPlusCircle className="me-2" style={{ transform: 'rotate(45deg)' }} /> Cancel</> : <><FaPencilAlt className="me-2" /> Write Review</>}
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
                        <StarRatingInput rating={newRating} setRating={setNewRating} />
                        <div className="mt-3 fw-bold text-warning fs-5">
                          {newRating > 0 ? `${newRating.toFixed(1)} out of 5` : 'Click to rate'}
                        </div>
                      </div>
                      <div className="col-md-7">
                        <label className="fw-bold text-muted text-uppercase small mb-3">Detailed Feedback *</label>
                        <textarea className="form-control bg-light border-0 rounded-4 p-3" rows="3" value={ratingDescription} onChange={(e) => setRatingDescription(e.target.value)} placeholder="How was your experience?" required></textarea>
                        <div className="mt-3 text-end">
                          <button className="btn btn-success rounded-pill px-5 fw-bold shadow-sm" onClick={submitRating} disabled={submittingRating || newRating === 0 || !ratingDescription.trim()}>
                            {submittingRating ? <span className="spinner-border spinner-border-sm me-2"></span> : <FaCheckCircle className="me-2" />}
                            Post Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating Summary and List */}
                {ratingsLoadingUser ? (
                  <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : errorRating ? (
                  <div className="alert alert-danger rounded-4"><FaExclamationTriangle className="me-2" />{errorRating}</div>
                ) : ratingUser ? (
                  <div className="row">
                    <div className="col-lg-4 mb-4 mb-lg-0 text-center text-lg-start border-end-lg pe-lg-4">
                      <h1 className="display-1 fw-bolder text-dark mb-0">{parseFloat(ratingUser.ratingStatistics?.averageRating || "0.0").toFixed(1)}</h1>
                      <div className="d-flex justify-content-center justify-content-lg-start my-2">
                        {renderStars(parseFloat(ratingUser.ratingStatistics?.averageRating || 0), 22)}
                      </div>
                      <p className="text-muted fw-semibold mb-4">Based on {ratingUser.ratingStatistics?.totalRatings || 0} reviews</p>

                      <div className="mt-4">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="d-flex align-items-center mb-2">
                            <span className="fw-bold text-muted" style={{ width: '20px' }}>{star}</span>
                            <FaStar className="text-warning mx-1 fs-6" />
                            <div className="rating-bar-container">
                              <div className="rating-bar-fill" style={{ width: `${distribution[star] || 0}%` }}></div>
                            </div>
                            <span className="text-muted fw-bold small text-end" style={{ width: '40px' }}>{distribution[star] || 0}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-lg-8 ps-lg-4">
                      <h5 className="fw-bold mb-4">Customer Feedback</h5>
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
                                    <h6 className="mb-0 fw-bold fs-6">{rating.user?.name || 'Anonymous User'}</h6>
                                    <small className="text-muted fw-semibold">{formatRatingDate(rating.createdAt)}</small>
                                  </div>
                                </div>
                                <div className="text-end">
                                  {renderStars(parseFloat(rating.rating), 14)}
                                  {isCurrentUserRating(rating) && (
                                    <div className="mt-2">
                                      <button className="btn btn-sm btn-outline-primary rounded-pill me-2" onClick={() => handleEditClick(rating)}><FaPencilAlt /></button>
                                      <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDeleteRating(rating._id)}><FaTrash /></button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-dark opacity-75 mb-0 fw-medium lh-base">
                                {rating.description && rating.description.trim() !== "" ? `"${rating.description}"` : "No written feedback provided."}
                              </p>
                              <div className="text-end mt-2">
                                <span className="text-success small fw-bold"><FaCheckCircle className="me-1" /> Verified</span>
                              </div>
                            </div>
                          ))}
                            </div>
                          ) : (
                            <div className="text-center py-5 bg-light rounded-4">
                              <i className="bi bi-chat-square-quote display-3 text-secondary opacity-50 mb-3"></i>
                              <h5 className="fw-bold">No Reviews Yet</h5>
                              <p className="text-muted">Be the first to leave a review for this pharmacy.</p>
                            </div>
                          )}
                        </div>
                      </div>
                ) : null}
              </div>
            </div>

          </div>

          {/* ========================================== */}
          {/* SIDEBAR WIDGET (RIGHT) */}
          {/* ========================================== */}
          <div className="col-lg-4">

            {/* Action Widget */}
            <div className="premium-card p-4 mb-4 bg-white">
              <h5 className="fw-bold text-dark d-flex align-items-center mb-4 pb-2 border-bottom">
                <i className="bi bi-lightning-charge-fill text-warning fs-4 me-2"></i> Quick Actions
              </h5>

              <div className="d-flex flex-column gap-3">
                {vendor.phone ? (
                  <a href={`tel:${vendor.phone}`} className="quick-action-btn btn-call">
                    <FaPhone className="me-2 fs-5" /> Call Pharmacy
                  </a>
                ) : (
                  <div className="quick-action-btn bg-light text-muted border" style={{ cursor: 'not-allowed' }}>
                    <FaPhone className="me-2 fs-5" /> Phone Not Available
                  </div>
                )}

                {(vendor.latitude && vendor.longitude) ? (
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}`} target="_blank" rel="noopener noreferrer" className="quick-action-btn btn-dir">
                    <FaDirections className="me-2 fs-5" /> Get Directions
                  </a>
                ) : (
                  <div className="quick-action-btn bg-light text-muted border" style={{ cursor: 'not-allowed' }}>
                    <FaDirections className="me-2 fs-5" /> Location Not Available
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours Widget */}
            <div className="premium-card position-sticky" style={{ top: '20px' }}>
              <div className="p-4 border-bottom bg-light bg-opacity-50">
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center">
                  <FaClock className="text-primary fs-4 me-3" /> Business Hours
                </h5>
              </div>
              <div className="p-2">
                {vendor.timings && vendor.timings.length > 0 ? (
                  <ul className="info-list">
                    {vendor.timings.map((timing, i) => (
                      <li key={i}>
                        <span className="fw-bold text-secondary">{timing.day}</span>
                        {timing.isClosed ?
                          <span className="badge bg-danger rounded-pill px-3 shadow-sm">Closed</span> :
                          <span className="text-success fw-bold bg-success bg-opacity-10 px-3 py-1 rounded-pill">{timing.openingTime} - {timing.closingTime}</span>
                        }
                      </li>
                    ))}
                  </ul>
                ) : availability.length > 0 ? (
                    <ul className="info-list">
                      {availability.map((slot, i) => (
                      <li key={i}>
                        <span className="fw-bold text-secondary">{slot.day}</span>
                        <span className="text-success fw-bold bg-success bg-opacity-10 px-3 py-1 rounded-pill">{slot.startTime} - {slot.endTime}</span>
                      </li>
                    ))}
                    </ul>
                  ) : (
                  <div className="text-center py-4">
                    <p className="text-muted mb-0 fw-semibold">Business hours not specified</p>
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

      {/* Edit Rating Modal */}
      {showEditRatingModal && editingRatingDetails && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-bottom-0 p-4">
                <h5 className="modal-title fw-bolder"><FaPencilAlt className="me-2" />Edit Your Review</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditRatingModal(false)} disabled={submittingEdit}></button>
              </div>
              <div className="modal-body p-4 bg-white">
                <div className="mb-4 text-center p-3 bg-light rounded-4 border">
                  <label className="fw-bolder small text-dark mb-3 text-uppercase">Update Rating</label>
                  <div className="d-flex justify-content-center">
                    <StarRatingInput rating={editRatingValue} setRating={setEditRatingValue} disabled={submittingEdit} />
                  </div>
                  <div className="mt-3 text-warning fw-bolder fs-5">{editRatingValue.toFixed(1)} Stars</div>
                </div>
                <div>
                  <label className="fw-bolder small text-dark mb-2 text-uppercase">Update Feedback</label>
                  <textarea className="form-control bg-light border shadow-sm rounded-4 p-3" rows="4" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required disabled={submittingEdit}></textarea>
                </div>
              </div>
              <div className="modal-footer bg-light border-top p-4">
                <button type="button" className="btn btn-outline-dark rounded-pill px-4 fw-bold bg-white" onClick={() => setShowEditRatingModal(false)} disabled={submittingEdit}>Cancel</button>
                <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleUpdateRating} disabled={submittingEdit || editRatingValue === 0 || !editDescription.trim()}>
                  {submittingEdit ? <><Spinner size="sm" className="me-2" /> Updating...</> : <><FaCheckCircle className="me-2" /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PharmacyProfile;
