import React, { useEffect, useContext, useState, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Aos from "aos";
import "aos/dist/aos.css";
import "../../Assets/Css/ClinicRating.css";
import { MyContext } from "../../../Context/Context";
import ImgSlide1 from "../../Assets/img/ClinicSlideImg1.jpg";
import ImgSlide2 from "../../Assets/img/ClinicSlideImg2.jpg";
import ImgSlide3 from "../../Assets/img/ClinicSlideImg3.jpg";

// Brand Color
const BRAND_COLOR = "#4c50a1";

// ==========================================
// STATIC HELPERS
// ==========================================
const URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const getImageUrl = (imagePath) => imagePath ? `${URL}${imagePath}` : "https://via.placeholder.com/300x400/eef2ff/4c50a1?text=Doctor";
const getClinicImageUrl = (imagePath) => imagePath ? `${URL}${imagePath}` : "https://via.placeholder.com/600x400/eef2ff/4c50a1?text=Clinic+Image";
const getSpecialistImageUrl = (imagePath) => imagePath ? `${URL}/uploads/specialists/${imagePath}` : "https://via.placeholder.com/100";

// Star Component
const ClinicHalfStar = React.memo(({ index, rating, hoverRating, setHover, setRating }) => {
  const displayRating = hoverRating || rating;
  const isHalfActive = displayRating >= index + 0.5;
  const isActive = displayRating >= index + 1;

  return (
    <div className="star-wrapper" style={{ cursor: 'pointer', position: 'relative', fontSize: '2rem', width: '1em', height: '1em' }}>
      <span style={{ color: '#e2e8f0', position: 'absolute' }}>★</span>
      <span onMouseEnter={() => setHover(index + 0.5)} onMouseLeave={() => setHover(0)} onClick={() => setRating(index + 0.5)}
        style={{ position: 'absolute', width: '50%', overflow: 'hidden', color: isHalfActive ? '#fbbf24' : 'transparent', zIndex: 2 }}>★</span>
      <span onMouseEnter={() => setHover(index + 1)} onMouseLeave={() => setHover(0)} onClick={() => setRating(index + 1)}
        style={{ position: 'absolute', width: '100%', color: isActive ? '#fbbf24' : 'transparent', zIndex: 1 }}>★</span>
    </div>
  );
});

const ClinicDoctors = () => {
  const { clinicId } = useParams();
  const navigate = useNavigate();

  const {
    clinicDoctor, getClinicDoctors1: getClinicDoctors, loading,
    clinic, getUserClinic, clinicRatings, ratingLoading,
    getClinicRatings, addClinicRating, editClinicRating, deleteClinicRating
  } = useContext(MyContext);

  // States
  const [zoomState, setZoomState] = useState({ show: false, img: null });
  const [visibleLimit, setVisibleLimit] = useState(6);
  const [ratingForm, setRatingForm] = useState({ show: false, value: 0, hover: 0, desc: '', submitting: false });
  const [editState, setEditState] = useState({ show: false, item: null, value: 0, desc: '' });

  // Logic & Memoization
  const currentUserId = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || payload._id;
    } catch (e) { return null; }
  }, []);

  const currentClinic = useMemo(() => {
    return clinic?.find(c => c._id === clinicId) || (clinic?.length > 0 ? clinic[0] : null);
  }, [clinic, clinicId]);

  const distribution = useMemo(() => {
    if (!clinicRatings?.ratingStatistics) return {};
    const { starBreakdown, totalRatings } = clinicRatings.ratingStatistics;
    const dist = {};
    for (let i = 1; i <= 5; i++) {
      dist[i] = totalRatings > 0 ? (((starBreakdown?.[i] || 0) / totalRatings) * 100).toFixed(1) : 0;
    }
    return dist;
  }, [clinicRatings]);

  useEffect(() => {
    Aos.init({ duration: 800, once: true });
    if (!clinic || clinic.length === 0) getUserClinic();
    if (clinicId) { getClinicDoctors(clinicId); getClinicRatings(clinicId); }
  }, [clinicId]);

  const renderStars = (rating) => (
    <div className="d-flex text-warning gap-1">
      {[...Array(5)].map((_, i) => {
        const starClass = rating >= i + 1 ? "ri-star-fill" : rating >= i + 0.5 ? "ri-star-half-fill" : "ri-star-line";
        return <i key={i} className={starClass}></i>;
      })}
    </div>
  );

  // API Handlers (Wapas Re-Add Kiye Gaye)
  const handleSubmitRating = async () => {
    if (ratingForm.value === 0 || !ratingForm.desc.trim()) return alert("Provide rating and feedback.");
    if (!currentUserId) return alert("Login required.");

    const alreadyRated = clinicRatings?.ratings?.some(r => (r.user?._id || r.userId || r.user) === currentUserId);
    if (alreadyRated) return alert("You have already rated this clinic!");

    setRatingForm(p => ({ ...p, submitting: true }));
    try {
      const res = await addClinicRating({ rating: ratingForm.value.toString(), description: ratingForm.desc, ClinicId: clinicId });
      if (res.data.success === 1) {
        setRatingForm({ show: false, value: 0, hover: 0, desc: '', submitting: false });
        getClinicRatings(clinicId);
      }
    } catch (error) { console.error(error); }
    finally { setRatingForm(p => ({ ...p, submitting: false })); }
  };

  const handleUpdate = async () => {
    if (!editState.item) return;
    setRatingForm(p => ({ ...p, submitting: true }));
    try {
      const res = await editClinicRating(editState.item._id, { rating: editState.value.toString(), description: editState.desc });
      if (res.data.success === 1) {
        setEditState({ show: false, item: null, value: 0, desc: '' });
        getClinicRatings(clinicId);
      }
    } catch (error) { console.error(error); }
    finally { setRatingForm(p => ({ ...p, submitting: false })); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this review?")) {
      try {
        const res = await deleteClinicRating(id);
        if (res.data.success === 1) {
          getClinicRatings(clinicId);
        }
      } catch (error) { console.error(error); }
    }
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><div className="spinner-grow" style={{ color: BRAND_COLOR }}></div></div>;

  return (
    <div className="clinic-redesign-wrapper bg-light">

      {/* 1. HERO SECTION */}
      <section className="hero-section position-relative bg-purple overflow-hidden">
        <div className="container-fluid p-0 h-100">
          <div className="row g-0 h-100">
            <div className="col-lg-6 d-flex flex-column justify-content-center p-5 bg-purple order-2 order-lg-1" data-aos="fade-right">
              <div className="brand-label mb-3 text-white">Healthcare Excellence</div>
              <h1 className="display-4 fw-bold mb-3 text-white">{currentClinic?.clinicName || "Premium Clinic"}</h1>
              <p className="lead mb-4 pe-lg-5 text-white">World-class medical facilities and top-rated specialists dedicated to your family's health.</p>
              <div className="d-flex gap-3">
                <button className="btn btn-brand btn-lg px-4 rounded-pill shadow-sm" onClick={() => document.getElementById('doctors').scrollIntoView()}>Find a Doctor</button>
                <div className="d-flex align-items-center gap-2 px-3 border-start">
                  <h4 className="fw-bold mb-0 text-white">{parseFloat(clinicRatings?.ratingStatistics?.averageRating || 0).toFixed(1)}</h4>
                  {renderStars(clinicRatings?.ratingStatistics?.averageRating)}
                </div>
              </div>
            </div>
            <div className="col-lg-6 order-1 bg-purple order-lg-2 position-relative">
              <div id="heroCarousel" className="carousel slide carousel-fade h-100" data-bs-ride="carousel">
                <div className="carousel-inner h-100">
                  {[ImgSlide1, ImgSlide2, ImgSlide3].map((img, i) => (
                    <div key={i} className={`carousel-item h-100 ${i === 0 ? "active" : ""}`}>
                      <img src={img} className="d-block w-100 h-100 object-fit-cover" alt="Clinic" style={{ height: '70vh' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="hero-shape d-none d-lg-block"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OVERVIEW CARDS */}
      <section className="container-fluid mt-n5 position-relative bg-purple" style={{ zIndex: 5 }}>
        <div className="container pb-5">
          <div className="row g-4">
            {[
              { title: "Verified Clinic", icon: "ri-shield-check-line", color: "#10b981", val: currentClinic?.Accountverify === "1" ? "MOH Verified" : "Verification Pending" },
              { title: "Emergency Call", icon: "ri-phone-fill", color: "#ef4444", val: currentClinic?.phoneNumber },
              { title: "Business Hours", icon: "ri-calendar-check-line", color: "#ffffff", val: `${currentClinic?.startDay} - ${currentClinic?.endDay}` }
            ].map((card, i) => (
              <div key={i} className="col-md-4" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="card border-0 shadow-lg rounded-4 p-3 h-100 bg-white">
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-circle shadow-sm" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                      <i className={`${card.icon} fs-4`}></i>
                    </div>
                    <div><h6 className="text-muted small fw-bold mb-0 text-uppercase">{card.title}</h6><p className="fw-bold mb-0 text-dark">{card.val}</p></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ABOUT & TIMING */}
      <section className="py-5 container mt-4">
        <div className="row g-5 align-items-center py-5">
          <div className="col-lg-7" data-aos="fade-up">
            <h6 className="text-brand fw-bold mb-2 text-uppercase ls-1">The Institution</h6>
            <h2 className="fw-bold mb-4">Committed to Your Wellness</h2>
            <p className="text-secondary fs-5 lh-lg mb-4">{currentClinic?.About}</p>
            <div className="row g-3">
              {['Modern Tech', 'Expert Doctors', '24/7 Service', 'Quality Care'].map(txt => (
                <div className="col-6" key={txt}><div className="d-flex align-items-center gap-2"><i className="ri-checkbox-circle-line text-success fs-4"></i><span className="fw-semibold">{txt}</span></div></div>
              ))}
            </div>
          </div>
          <div className="col-lg-5" data-aos="fade-left">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              <div className="p-4 text-white" style={{ backgroundColor: BRAND_COLOR }}>
                <h5 className="fw-bold mb-0"><i className="ri-time-line me-2"></i>Daily Schedule</h5>
              </div>
              <div className="p-4">
                <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                  <span className="text-primary">Morning</span>
                  <span className="fw-bold text-dark">{currentClinic?.MorningStartTime} - {currentClinic?.MorningEndTime}</span>
                </div>
                {currentClinic?.eveningStartTime && (
                  <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                    <span className="text-success">Evening</span>
                    <span className="fw-bold text-dark">{currentClinic?.eveningStartTime} - {currentClinic?.eveningEndTime}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between">
                  <span className="text-danger fw-bold">Clinic Holiday</span>
                  <span className="badge bg-danger-soft text-danger rounded-pill px-3">{currentClinic?.holiday || "Sunday"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DOCTORS GRID */}
      <section id="doctors" className="py-5 bg-purple shadow-sm">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-down">
            <h2 className="fw-bold text-white display-3">Meet Our Specialists</h2>
            <div className="brand-line mx-auto mt-2"></div>
          </div>

          <div className="row g-4">
            {clinicDoctor.map((doctor, index) => (
              <div key={doctor._id} className="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={index * 50}>
                <div className="doctor-card-premium h-100 rounded-4 overflow-hidden border bg-white shadow-hover p-1 transition">
                  <div className="image-box position-relative rounded-3">
                    <img src={getImageUrl(doctor.image)} alt={doctor.name} className="w-100 rounded-4" style={{ height: '300px', objectFit: 'cover' }} />
                    <div className="overlay-badge">{doctor.specialist || "General"}</div>
                  </div>
                  <div className="p-3 text-start">
                    <h5 className="fw-bold mb-1 text-dark">{doctor.name}</h5>
                    <p className="small text-muted mb-3">{doctor.qualification}</p>
                    <div className="d-flex justify-content-between small mb-4 text-secondary">
                      <span><i className="ri-history-line"></i> {doctor.experience || "0"}y Exp</span>
                      <span><i className="ri-map-pin-line"></i> {doctor.city}</span>
                    </div>
                    <button className="btn btn-brand w-100 rounded-pill py-2 fw-bold" onClick={() => navigate(`/Doctors/Profile/${doctor._id}`)}>
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CLINIC IMAGES & ACHIEVEMENTS */}
      {["Clinic Showcase", "Achievements"].map((section, idx) => (
        <section className={`py-5 ${idx === 1 ? 'bg-light' : 'bg-white'}`} key={idx}>
          <div className="container">
            <h2 className="text-center fw-bold mb-5">{section}</h2>
            <div className="row g-3">
              {(idx === 0 ? currentClinic?.clinicImages : currentClinic?.achievementImages)?.map((img, i) => (
                <div key={i} className="col-md-6 col-lg-4" data-aos="zoom-in">
                  <div className="card border-0 shadow-sm overflow-hidden rounded-4 gallery-card position-relative"
                    onClick={() => setZoomState({ show: true, img: getClinicImageUrl(img) })}>
                    <img src={getClinicImageUrl(img)} alt={section} className="img-fluid w-100" style={{ height: "280px", objectFit: "cover" }} />
                    <div className="gallery-overlay d-flex align-items-center justify-content-center">
                      <i className="ri-zoom-in-line text-white fs-1"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* 6. SPECIALTIES */}
      <section className="py-5 bg-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-5">Our Specialists Departments</h2>
          <div className="row g-4 justify-content-center">
            {currentClinic?.SpecialistsId?.map((spec) => (
              <div key={spec._id} className="col-6 col-md-3 col-lg-2" data-aos="zoom-in">
                <div className="spec-card shadow-sm rounded-4 p-3 bg-purple h-100 border-bottom border-3" style={{ borderColor: BRAND_COLOR }}>
                  <img src={getSpecialistImageUrl(spec.specialistImage)} alt={spec.specialists} className="rounded-circle mb-3 border p-1 bg-white" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                  <h6 className="fw-bold small mb-0 text-white">{spec.specialists}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. RATINGS & REVIEWS SECTION */}
      <section className="py-5 bg-light border-top">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 text-center bg-white sticky-top" style={{ top: '100px',zIndex:3 }}>
                <h5 className="fw-bold mb-4 text-brand text-uppercase">Patient Feedback</h5>
                <h1 className="display-3 fw-bold mb-0 text-dark">{parseFloat(clinicRatings?.ratingStatistics?.averageRating || 0).toFixed(1)}</h1>
                <div className="d-flex justify-content-center mb-2 fs-4">{renderStars(clinicRatings?.ratingStatistics?.averageRating)}</div>
                <p className="text-muted mb-4">{clinicRatings?.ratingStatistics?.totalRatings || 0} reviews total</p>

                <div className="mb-4 text-start">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="d-flex align-items-center mb-1 gap-2">
                      <small className="fw-bold" style={{ width: '15px' }}>{star}</small>
                      <div className="flex-grow-1 bg-light rounded-pill overflow-hidden" style={{ height: '8px' }}>
                        <div className="h-100 rounded-pill" style={{ width: `${distribution[star] || 0}%`, backgroundColor: BRAND_COLOR }}></div>
                      </div>
                      <small className="text-muted" style={{ width: '35px' }}>{Math.round(distribution[star] || 0)}%</small>
                    </div>
                  ))}
                </div>

                <button className="btn btn-brand w-100 rounded-pill py-2 shadow-sm" onClick={() => setRatingForm(p => ({ ...p, show: !p.show }))}>
                  {ratingForm.show ? "Cancel" : "Post a Review"}
                </button>
              </div>
            </div>

            <div className="col-lg-8">
              {ratingForm.show && (
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white animate__animated animate__fadeIn">
                  <h5 className="fw-bold mb-3">Add Your Review</h5>
                  <div className="d-flex gap-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <ClinicHalfStar key={i} index={i} rating={ratingForm.value} hoverRating={ratingForm.hover} setHover={(v) => setRatingForm(p => ({ ...p, hover: v }))} setRating={(v) => setRatingForm(p => ({ ...p, value: v }))} />
                    ))}
                  </div>
                  <textarea className="form-control border-light bg-light rounded-3 p-3 mb-3" rows="3" placeholder="Share your experience..." value={ratingForm.desc} onChange={(e) => setRatingForm(p => ({ ...p, desc: e.target.value }))}></textarea>
                  <button className="btn btn-brand px-5 rounded-pill shadow-sm" onClick={handleSubmitRating} disabled={ratingForm.submitting}>{ratingForm.submitting ? "Posting..." : "Submit Now"}</button>
                </div>
              )}

              <div className="review-feed">
                {clinicRatings?.ratings?.slice(0, visibleLimit).map(rating => (
                  <div key={rating._id} className="card border-0 shadow-sm rounded-4 p-4 mb-3 border-start border-4 bg-white" style={{ borderColor: BRAND_COLOR }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex gap-3 align-items-center">
                        <div className="avatar-letter">{rating.user?.name?.charAt(0).toUpperCase() || "U"}</div>
                        <div>
                          <h6 className="fw-bold mb-0">{rating.user?.name || "Anonymous Patient"}</h6>
                          <div className="small">{renderStars(rating.rating)}</div>
                        </div>
                      </div>
                      {/* USER EDIT/DELETE CONTROLS RE-ADDED HERE */}
                      {currentUserId === (rating.user?._id || rating.userId || rating.user) && (
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary border-0 rounded-circle"
                            onClick={() => setEditState({ show: true, item: rating, value: rating.rating, desc: rating.description })}>
                            <i className="ri-pencil-line"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                            onClick={() => handleDelete(rating._id)}>
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-secondary mb-0 fs-6 lh-base">{rating.description}</p>
                  </div>
                ))}
                {clinicRatings?.ratings?.length === 0 && <div className="text-center py-5 text-muted">No reviews yet.</div>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ZOOM MODAL */}
      {zoomState.show && (
        <div className="modal-zoom-overlay" onClick={() => setZoomState({ show: false, img: null })}>
          <img src={zoomState.img} alt="Zoomed" className="animate__animated animate__zoomIn rounded-4" />
        </div>
      )}

      {/* EDIT MODAL RE-ADDED HERE */}
      {editState.show && (
        <div className="custom-modal-overlay">
          <div className="card border-0 shadow-lg rounded-4 p-4 modal-content-custom">
            <h5 className="fw-bold mb-4">Edit Review</h5>
            <div className="d-flex justify-content-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => <ClinicHalfStar key={i} index={i} rating={editState.value} hoverRating={0} setHover={() => { }} setRating={(v) => setEditState(p => ({ ...p, value: v }))} />)}
            </div>
            <textarea className="form-control mb-4 bg-light p-3" rows="3" value={editState.desc} onChange={(e) => setEditState(p => ({ ...p, desc: e.target.value }))}></textarea>
            <div className="d-flex gap-2">
              <button className="btn btn-brand flex-fill rounded-pill" onClick={handleUpdate}>Update Review</button>
              <button className="btn btn-light flex-fill rounded-pill border" onClick={() => setEditState({ show: false, item: null, value: 0, desc: '' })}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .text-brand { color: ${BRAND_COLOR}; }
        .btn-brand { background-color: ${BRAND_COLOR}; color: white; border: none; transition: 0.3s; }
        .btn-brand:hover { background-color: #3b3f81; color: white; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .bg-danger-soft { background-color: #fee2e2; }
        .mt-n5 { margin-top: -60px; }
        .ls-1 { letter-spacing: 1px; }
        .bg-purple { background-color: ${BRAND_COLOR}; }
        .brand-line { width: 60px; height: 4px; background: white; border-radius: 10px; }
        
        .doctor-card-premium { transition: 0.4s; border-color: #f1f5f9 !important; }
        .doctor-card-premium:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important; }
        .overlay-badge { position: absolute; bottom: 12px; left: 12px; background: ${BRAND_COLOR}; color: white; padding: 4px 14px; border-radius: 50px; font-weight: bold; font-size: 0.7rem; }
        
        .gallery-card { cursor: pointer; }
        .gallery-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(76, 80, 161, 0.6); opacity: 0; transition: 0.3s; }
        .gallery-card:hover .gallery-overlay { opacity: 1; }
        
        .avatar-letter { width: 45px; height: 45px; border-radius: 10px; background: ${BRAND_COLOR}20; color: ${BRAND_COLOR}; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; }
        
        .modal-zoom-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 30px; cursor: pointer; }
        .modal-zoom-overlay img { max-width: 90%; max-height: 90%; }
        
        .custom-modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
        .modal-content-custom { width: 90%; max-width: 500px; }
        .object-fit-cover { object-fit: cover; }
        .icon-circle { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
   .hero-shape { position: absolute; top: 0; left: 0; width: 100px; height: 100%; background: white; transform: skewX(-5deg); margin-left: -50px; z-index: 1; }
      
      }
      `}</style>
    </div>
  );
};

export default ClinicDoctors;
