import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { MyContext } from "../../../Context/Context"; // Adjust path as needed
import "bootstrap/dist/css/bootstrap.min.css";

// ==========================================
// 1. HALF STAR COMPONENT (For Input)
// ==========================================
const VendorHalfStar = ({ index, rating, hoverRating, setHover, setRating }) => {
  const fullStarValue = index + 1;
  const halfStarValue = index + 0.5;
  
  const displayRating = hoverRating || rating;
  const isHalfActive = displayRating >= halfStarValue;
  const isActive = displayRating >= fullStarValue;

  return (
    <div style={{ display: 'flex', position: 'relative', width: '2.5rem', height: '2.5rem', cursor: 'pointer' }}>
      {/* Left Half (0.5) */}
      <span
        onMouseEnter={() => setHover(halfStarValue)}
        onMouseLeave={() => setHover(0)}
        onClick={() => setRating(halfStarValue)}
        style={{ 
          position: 'absolute', left: 0, width: '50%', overflow: 'hidden', zIndex: 2,
          color: isHalfActive ? '#ffc107' : '#e4e5e9', fontSize: '2.5rem', lineHeight: 1, transition: 'color 0.2s'
        }}
      >★</span>
      {/* Full Star (1.0) */}
      <span
        onMouseEnter={() => setHover(fullStarValue)}
        onMouseLeave={() => setHover(0)}
        onClick={() => setRating(fullStarValue)}
        style={{ 
          position: 'absolute', left: 0, width: '100%', zIndex: 1,
          color: isActive ? '#ffc107' : '#e4e5e9', fontSize: '2.5rem', lineHeight: 1, transition: 'color 0.2s'
        }}
      >★</span>
    </div>
  );
};

const FoodShopRatingManager = () => {
  const { vendorId } = useParams();

  // Context Destructuring
  const { 
    vendorRatings,      
    ratingLoading,      
    getVendorRatings,   
    addVendorRating,    
    editVendorRating,   
    deleteVendorRating  
  } = useContext(MyContext);

  // States
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination State
  const [visibleLimit, setVisibleLimit] = useState(5);

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  // Get User ID from Token
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

  // Check Ownership
  const isOwner = (ratingItem) => {
    const currentId = getCurrentUserId();
    const ratingUserId = ratingItem.user?._id || ratingItem.userId || ratingItem.user;
    if (currentId && ratingUserId) {
        return currentId.toString() === ratingUserId.toString();
    }
    return false;
  };

  // Render Read-Only Stars
  const renderStars = (val) => {
    const floatR = parseFloat(val) || 0;
    const full = Math.floor(floatR);
    const half = floatR % 1 >= 0.25 && floatR % 1 <= 0.75;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <div className="d-flex text-warning" style={{ gap: '2px' }}>
        {[...Array(full)].map((_, i) => <i key={`f${i}`} className="ri-star-fill">★</i>)}
        {half && <i className="ri-star-half-line">★</i>}
        {[...Array(empty)].map((_, i) => <i key={`e${i}`} className="ri-star-line" style={{color: '#e4e5e9'}}>★</i>)}
      </div>
    );
  };

  // Calculate Stats Distribution
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

  // ==========================================
  // HANDLERS
  // ==========================================

  useEffect(() => {
    if (vendorId) {
      getVendorRatings(vendorId);
    }
  }, [vendorId]);

  const handleSubmit = async () => {
    if (rating === 0 || !description.trim()) {
      return alert("Please provide both rating stars and feedback description.");
    }

    const currentUserId = getCurrentUserId();
    if (!currentUserId) return alert("Please login to perform this action.");

    // Check Duplicate if Adding New
    if (!isEditing) {
        const alreadyRated = vendorRatings?.ratings?.some(r => {
            const rUserId = r.user?._id || r.userId || r.user;
            return rUserId && rUserId.toString() === currentUserId.toString();
        });
        if (alreadyRated) return alert("You have already rated this vendor!");
    }

    setSubmitting(true);
    try {
      const data = {
        rating: rating.toString(),
        description: description,
        vendorId: vendorId // Sending VendorId
      };

      let res;
      if (isEditing) {
        res = await editVendorRating(editId, data);
      } else {
        res = await addVendorRating(data);
      }

      if (res.data.success === 1) {
        alert(isEditing ? "Rating updated!" : "Rating submitted!");
        resetForm();
        getVendorRatings(vendorId);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error processing request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rating?")) return;
    try {
      const res = await deleteVendorRating(id);
      if (res.data.success === 1) {
        alert("Deleted successfully");
        getVendorRatings(vendorId);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert("Error deleting");
    }
  };

  const handleEditStart = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setRating(parseFloat(item.rating));
    setDescription(item.description);
    setShowForm(true); // Open form
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setRating(0);
    setDescription("");
  };

  const distribution = getDistribution();

  // ==========================================
  // INTERNAL CSS (Styled to match LabDetails)
  // ==========================================
  const styles = `
    .cl-rating-card {
      background: #fff;
      border: none;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    }
    .cl-rating-header {
      background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
      color: white;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cl-rating-body {
      padding: 2rem;
    }
    .cl-rating-summary {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      border: 1px solid #e9ecef;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .cl-rating-avg {
      font-size: 4rem;
      font-weight: 800;
      color: #0d6efd;
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    .cl-distribution-row {
      display: flex;
      align-items: center;
      margin-bottom: 0.8rem;
    }
    .cl-distribution-bar-bg {
      background: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
      height: 10px;
      flex-grow: 1;
      margin: 0 15px;
    }
    .cl-distribution-fill {
      background: #ffc107;
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }
    .cl-feedback-item {
      border-bottom: 1px solid #eee;
      padding: 1.5rem 0;
    }
    .cl-feedback-item:last-child {
      border-bottom: none;
    }
    .cl-avatar {
      width: 50px;
      height: 50px;
      background: linear-gradient(45deg, #0d6efd, #0dcaf0);
      color: white;
      font-weight: bold;
      font-size: 1.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .cl-add-form {
      border: 1px solid #dee2e6;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      overflow: hidden;
      background-color: #fff;
    }
    .cl-add-form-header {
      background: #f8f9fa;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #dee2e6;
      font-weight: bold;
      color: #0d6efd;
    }
    /* Simple Star Icons via CSS if FontAwesome/RemixIcon not loaded */
    .ri-star-fill:before { content: "★"; }
    .ri-star-half-line:before { content: "★"; opacity: 0.5; }
    .ri-star-line:before { content: "☆"; }
  `;

  return (
    <>
      <style>{styles}</style>
      
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark">Vendor Ratings & Reviews</h2>
            <Link to="/venders/labs" className="btn btn-outline-secondary rounded-pill px-4">
                &larr; Back to List
            </Link>
        </div>

        {/* --- MAIN CARD --- */}
        <div className="cl-rating-card">
          
          {/* Header */}
          <div className="cl-rating-header">
            <div>
              <h4 className="mb-0 fw-bold">Customer Feedback</h4>
              <small className="opacity-75">Vendor ID: {vendorId}</small>
            </div>
            <button 
              className={`btn btn-sm fw-bold px-4 rounded-pill py-2 ${showForm ? 'btn-light text-primary' : 'btn-light'}`}
              onClick={() => {
                  if(showForm) resetForm(); 
                  else setShowForm(true);
              }}
            >
              {showForm ? "Cancel" : isEditing ? "Edit Rating" : "Write a Review"}
            </button>
          </div>

          <div className="cl-rating-body">
            
            {/* ADD/EDIT FORM */}
            {showForm && (
              <div className="cl-add-form">
                <div className="cl-add-form-header">
                  {isEditing ? "Update Your Review" : "Share Your Experience"}
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted text-uppercase">Your Rating</label>
                    <div className="d-flex gap-2">
                        {[...Array(5)].map((_, i) => (
                          <VendorHalfStar 
                            key={i} 
                            index={i} 
                            rating={rating} 
                            hoverRating={hoverRating} 
                            setHover={setHoverRating} 
                            setRating={setRating} 
                          />
                        ))}
                    </div>
                    <div className="mt-2 text-primary fw-bold">
                        {rating > 0 ? `${rating} / 5 Stars` : "Select stars above"}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted text-uppercase">Feedback Description</label>
                    <textarea 
                        className="form-control" 
                        rows="4" 
                        placeholder="Tell us what you liked or didn't like..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ resize: 'none' }}
                    ></textarea>
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                        className="btn btn-primary btn-lg rounded-pill px-5" 
                        onClick={handleSubmit} 
                        disabled={submitting || rating === 0}
                    >
                      {submitting ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
                    </button>
                    {isEditing && (
                        <button className="btn btn-outline-secondary btn-lg rounded-pill px-4" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CONTENT AREA */}
            {ratingLoading ? (
               <div className="text-center py-5">
                   <div className="spinner-border text-primary" role="status"></div>
                   <p className="mt-2 text-muted">Loading reviews...</p>
               </div>
            ) : (
              <div className="row g-5">
                
                {/* LEFT: SUMMARY BOX */}
                <div className="col-lg-4">
                   <div className="cl-rating-summary">
                     <div className="cl-rating-avg">
                        {parseFloat(vendorRatings?.ratingStatistics?.averageRating || 0).toFixed(1)}
                     </div>
                     <div className="d-flex justify-content-center mb-3 text-warning fs-3">
                        {renderStars(vendorRatings?.ratingStatistics?.averageRating)}
                     </div>
                     <p className="text-muted fw-bold mb-0">
                        {vendorRatings?.ratingStatistics?.totalRatings || 0} Verified Ratings
                     </p>
                   </div>
                </div>

                {/* RIGHT: LIST & BARS */}
                <div className="col-lg-8">
                   
                   {/* Distribution Bars */}
                   <div className="mb-5 px-2">
                     {[5,4,3,2,1].map(star => (
                       <div key={star} className="cl-distribution-row">
                         <span className="fw-bold text-dark" style={{width:'40px'}}>{star} ★</span>
                         <div className="cl-distribution-bar-bg">
                           <div className="cl-distribution-fill" style={{width: `${distribution[star] || 0}%`}}></div>
                         </div>
                         <span className="text-muted fw-bold" style={{width:'45px', textAlign:'right'}}>
                            {distribution[star]}%
                         </span>
                       </div>
                     ))}
                   </div>

                   <hr className="my-4"/>

                   {/* Pagination / Sort Control */}
                   {vendorRatings?.ratings?.length > 0 && (
                      <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0">Recent Reviews</h5>
                          <div className="d-flex align-items-center">
                              <span className="small text-muted me-2">Show:</span>
                              <select 
                                  className="form-select form-select-sm w-auto border-secondary" 
                                  value={visibleLimit} 
                                  onChange={(e) => setVisibleLimit(Number(e.target.value))}
                              >
                                  <option value={5}>5</option>
                                  <option value={10}>10</option>
                                  <option value={20}>20</option>
                                  <option value={50}>50</option>
                              </select>
                          </div>
                      </div>
                   )}

                   {/* Reviews List */}
                   {vendorRatings?.ratings?.length > 0 ? (
                      <div>
                        {vendorRatings.ratings.slice(0, visibleLimit).map(ratingItem => (
                          <div key={ratingItem._id} className="cl-feedback-item">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="d-flex gap-3">
                                <div className="cl-avatar">
                                  {ratingItem.user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-1 text-dark">
                                    {ratingItem.user?.name || "Anonymous User"}
                                  </h6>
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="text-warning fs-6">
                                        {renderStars(ratingItem.rating)}
                                    </div>
                                    <span className="badge bg-light text-dark border rounded-pill px-2">Verified</span>
                                  </div>
                                </div>
                              </div>
                              
                              <small className="text-muted fw-semibold">
                                {new Date(ratingItem.createdAt).toLocaleDateString()}
                              </small>
                            </div>
                            
                            <p className="text-secondary mb-3 mt-3 ps-5 ms-2" style={{lineHeight: '1.6'}}>
                                {ratingItem.description}
                            </p>

                            {/* Edit/Delete Buttons (Only for Owner) */}
                            {isOwner(ratingItem) && (
                              <div className="d-flex gap-2 justify-content-end">
                                <button 
                                    className="btn btn-sm btn-outline-primary px-3 rounded-pill" 
                                    onClick={() => handleEditStart(ratingItem)}
                                >
                                  Edit
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-danger px-3 rounded-pill" 
                                    onClick={() => handleDelete(ratingItem._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                   ) : (
                      <div className="text-center py-5 bg-light rounded-3">
                        <div className="display-4 text-muted mb-3">💬</div>
                        <h5 className="text-muted">No reviews yet</h5>
                        <p className="text-muted small">Be the first to share your experience with this vendor!</p>
                      </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodShopRatingManager;
