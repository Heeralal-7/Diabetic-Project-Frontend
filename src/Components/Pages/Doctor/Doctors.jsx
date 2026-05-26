import React, { useContext, useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../../Context/Context";
import Aos from "aos";
import "aos/dist/aos.css";
 
const Doctors = () => {
  const {
    getDoctor,
    doctor,
    loading,
    userLocation,
    setManualLocation,
    getUserLocation,
    distanceLimit,
    clearLocation
  } = useContext(MyContext);
 
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [filterDistance, setFilterDistance] = useState(50);
  const [locationError, setLocationError] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentActiveLocation, setCurrentActiveLocation] = useState(null);
 
  const navigate = useNavigate();
  const imageUrl = process.env.REACT_APP_API_URL;
  const PRIMARY_COLOR = "#414399";
 
  useEffect(() => {
    Aos.init({ duration: 800, once: true });
    const savedData = localStorage.getItem("myUserLocation");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setCurrentActiveLocation(parsedData);
        getDoctor(parsedData.latitude, parsedData.longitude, "");
      } catch (e) { console.error(e); }
    } else if (userLocation) {
      getDoctor(userLocation.latitude, userLocation.longitude, "");
      setCurrentActiveLocation(userLocation);
    } else {
      getDoctor(null, null, "");
    }
  }, []);
 
  useEffect(() => {
    if (userLocation?.latitude) {
      localStorage.setItem("myUserLocation", JSON.stringify({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      }));
      setCurrentActiveLocation(userLocation);
      getDoctor(userLocation.latitude, userLocation.longitude, searchQuery);
    }
  }, [userLocation]);
 
  useEffect(() => {
    if (distanceLimit?.doctorLimit) setFilterDistance(Number(distanceLimit.doctorLimit));
  }, [distanceLimit]);
 
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    getDoctor(currentActiveLocation?.latitude || null, currentActiveLocation?.longitude || null, searchQuery);
  };
 
  const handleClearSearch = () => {
    setSearchQuery("");
    getDoctor(currentActiveLocation?.latitude || null, currentActiveLocation?.longitude || null, "");
  };
 
  const filteredAndSortedDoctors = useMemo(() => {
    let processedDoctors = Array.isArray(doctor) ? [...doctor] : [];
    if (currentActiveLocation) {
      processedDoctors = processedDoctors.filter(doc => Number(doc.distance) <= filterDistance);
    }
    return processedDoctors.sort((a, b) => {
      if (sortBy === "distance") return (Number(a.distance) || Infinity) - (Number(b.distance) || Infinity);
      if (sortBy === "rating") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sortBy === "fee") {
        const feeA = a.ConsultationFeesId ? (a.ConsultationFeesId.onlineFees || a.ConsultationFeesId.offlineFees) : Infinity;
        const feeB = b.ConsultationFeesId ? (b.ConsultationFeesId.onlineFees || b.ConsultationFeesId.offlineFees) : Infinity;
        return feeA - feeB;
      }
      return 0;
    });
  }, [doctor, sortBy, filterDistance, currentActiveLocation]);
 
  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      setLocationError("");
      await getUserLocation();
    } catch (error) {
      setLocationError("Location access denied.");
      setShowLocationInput(true);
    } finally { setIsGettingLocation(false); }
  };
 
  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(manualLat), lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) return setLocationError("Invalid coordinates");
    const manualLoc = { latitude: lat, longitude: lng };
    localStorage.setItem("myUserLocation", JSON.stringify(manualLoc));
    setCurrentActiveLocation(manualLoc);
    if (setManualLocation) setManualLocation(lat, lng);
    getDoctor(lat, lng, searchQuery);
    setShowLocationInput(false);
  };
 
  const handleClearLocation = () => {
    localStorage.removeItem("myUserLocation");
    setCurrentActiveLocation(null);
    if (clearLocation) clearLocation();
    getDoctor(null, null, searchQuery);
  };
 
  const getProfileImage = (imgPath) => imgPath ? `${imageUrl}${imgPath}` : "https://placehold.co/600x600?text=Doctor";
 
  return (
    <div style={{ backgroundColor: "#f4f7fe", minHeight: "100vh", paddingBottom: "50px" }}>
      {/* Dynamic CSS */}
      <style>{`
        .custom-search-shadow { box-shadow: 0 10px 30px rgba(65, 67, 153, 0.1); }
        .doc-card { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); border: none !important; border-radius: 24px !important; overflow: hidden; background: #fff; }
        .doc-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
        .book-btn { background: ${PRIMARY_COLOR}; color: white; border-radius: 12px; padding: 12px; border: none; font-weight: 600; width: 100%; transition: 0.3s; }
        .book-btn:hover { background: #32347a; box-shadow: 0 5px 15px rgba(65, 67, 153, 0.3); }
        .filter-pill { background: white; border: 1px solid #eef2f6; padding: 8px 16px; border-radius: 100px; font-size: 14px; font-weight: 600; color: #64748b; }
        .status-dot { height: 8px; width: 8px; background: #10b981; border-radius: 50%; display: inline-block; margin-right: 6px; }
      `}</style>
 
      {/* Header & Hero Section */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #5a5dbd 100%)`, padding: "30px 0 50px 0", borderRadius: "0 0 50px 50px" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7 text-white" data-aos="fade-right">
              <h1 style={{ fontWeight: "850", fontSize: "3rem", marginBottom: "15px" }}>Search. Book. <span style={{ color: "#00d4ff" }}>Heal.</span></h1>
              <p style={{ opacity: 0.9, fontSize: "18px", maxWidth: "500px" }}>Connect with top-rated specialists in your area with one simple click.</p>
            </div>
            <div className="col-lg-5 d-flex justify-content-lg-end gap-3" data-aos="fade-left">
              <button className="btn btn-light" style={{ borderRadius: "15px", padding: "12px 25px", fontWeight: "700", color: PRIMARY_COLOR }} onClick={() => navigate("/Doctors/history")}>
                <i className="fas fa-calendar-alt me-2"></i> My Appointments
              </button>
            </div>
          </div>
        </div>
      </div>
 
      <div className="container" style={{ marginTop: "-50px" }}>
        {/* Floating Search Bar */}
        <div className="bg-white p-3 rounded-5  custom-search-shadow mb-5" data-aos="zoom-in">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
           
            <div className="col-md-5">
             
              <div className="input-group bg-light rounded-3 p-1">
                <span className="input-group-text border-0 bg-transparent text-muted"><i className="fas fa-search"></i></span>
                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none"
                  placeholder="Doctor Name, Specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <button type="button" className="btn w-100 h-100 d-flex text-white align-items-center justify-content-center bg-primary gap-2"
                style={{ background: currentActiveLocation ? "#eef2ff" : "#f8fafc", color: PRIMARY_COLOR, borderRadius: "12px", border: `1px solid ${PRIMARY_COLOR}22`, fontWeight: "600", padding: "12px" }}
                onClick={handleUseCurrentLocation}>
                {isGettingLocation ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-location-arrow"></i>}
                {currentActiveLocation ? "Location Set" : "Find Near Me"}
              </button>
            </div>
           
            <div className="col-md-2">
              <button type="submit" className="btn w-100 text-white" style={{ background: PRIMARY_COLOR, borderRadius: "12px", padding: "12px", fontWeight: "700" }}>Search</button>
            </div>
            <div className="col-md-2">
              {currentActiveLocation && (
                <button type="button" onClick={handleClearLocation} className="btn btn-outline-danger bg-danger text-white w-100" style={{ borderRadius: "12px", padding: "12px" }}>
                  <i className="fas fa-times me-2"></i>Clear
                </button>
              )}
            </div>
          </form>
        </div>
 
        {/* Filters & Control Panel */}
        <div className="d-flex flex-wrap gap-3 mb-4 align-items-center justify-content-between">
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <div className="filter-pill">
              <span className="me-2 text-muted">Sort:</span>
              <select className="border-0 bg-transparent fw-bold outline-none" style={{ color: PRIMARY_COLOR }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="distance">Nearest</option>
                <option value="rating">Top Rated</option>
                <option value="fee">Budget</option>
              </select>
            </div>
            {currentActiveLocation && (
              <div className="filter-pill d-flex align-items-center gap-3">
                <span className="text-muted">Radius: <b style={{ color: PRIMARY_COLOR }}>{filterDistance}km</b></span>
                <input type="range" min="1" max="100" value={filterDistance} onChange={(e) => setFilterDistance(Number(e.target.value))} style={{ accentColor: PRIMARY_COLOR, width: "100px" }} />
              </div>
            )}
          </div>
          <div className="text-muted small fw-bold">
            Showing {filteredAndSortedDoctors.length} Specialists
          </div>
        </div>
 
        {/* Location Error & Manual Input */}
        {locationError && <div className="alert alert-warning rounded-4 border-0 shadow-sm mb-4"><i className="fas fa-info-circle me-2"></i>{locationError}</div>}
        {showLocationInput && (
          <div className="card border-0 rounded-4 shadow-sm p-4 mb-4" data-aos="fade-down">
            <h6 className="fw-bold mb-3">Set Location Coordinates</h6>
            <form onSubmit={handleManualLocationSubmit} className="row g-3">
              <div className="col-md-5"><input type="number" step="any" className="form-control" placeholder="Lat" value={manualLat} onChange={(e) => setManualLat(e.target.value)} required /></div>
              <div className="col-md-5"><input type="number" step="any" className="form-control" placeholder="Lng" value={manualLng} onChange={(e) => setManualLng(e.target.value)} required /></div>
              <div className="col-md-2"><button className="btn btn-dark w-100">Set</button></div>
            </form>
          </div>
        )}
 
        {/* Doctors Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: PRIMARY_COLOR }}></div>
            <p className="mt-3 text-muted fw-bold">Finding best doctors...</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredAndSortedDoctors.length > 0 ? (
              filteredAndSortedDoctors.map((doc, idx) => (
                <div key={doc._id || idx} className="col-sm-6 col-lg-4 col-xl-3" data-aos="fade-up" data-aos-delay={idx * 50}>
                  <Link to={`/Doctors/Profile/${doc._id || doc.doctorId}`} className="text-decoration-none">
                    <div className="card doc-card h-100 shadow-sm">
                      <div style={{ position: "relative", height: "220px" }}>
                        <img src={getProfileImage(doc.image)} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", top: "15px", left: "15px", background: "rgba(255,255,255,0.9)", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", color: PRIMARY_COLOR }}>
                          <i className="fas fa-star text-warning me-1"></i> {doc.rating || "4.5"}
                        </div>
                        {doc.distance && (
                          <div style={{ position: "absolute", bottom: "15px", right: "15px", background: PRIMARY_COLOR, color: "white", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}>
                            {Number(doc.distance).toFixed(1)} km
                          </div>
                        )}
                      </div>
                      <div className="card-body p-4">
                        <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "800", color: "#8e9aaf", letterSpacing: "1px" }}>
                          {typeof doc.specialist === 'object' ? doc.specialist.name : doc.specialist || 'General'}
                        </span>
                        <h5 className="mt-1 mb-2 fw-bold text-dark">Dr. {doc.name}</h5>
                        <div className="d-flex align-items-center mb-3 text-muted small">
                          <i className="fas fa-map-marker-alt me-2" style={{ color: PRIMARY_COLOR }}></i>
                          <span className="text-truncate">{doc.address || "Medical Clinic, City"}</span>
                        </div>
                        <hr style={{ opacity: 0.05 }} />
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="small text-muted"><span className=""></span>Fee</span>
                          <span className="fw-bold" style={{ color: "#10b981", fontSize: "18px" }}>
                            ₹{doc.ConsultationFeesId?.onlineFees || doc.ConsultationFeesId?.offlineFees || "N/A"}
                          </span>
                        </div>
                        <button className="book-btn">Book Appointment</button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" width="100" style={{ opacity: 0.2 }} alt="empty" />
                <h5 className="mt-3 text-muted">No specialists found in this range</h5>
                <button onClick={handleClearSearch} className="btn btn-link text-primary fw-bold text-decoration-none">Reset all filters</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default Doctors;
 