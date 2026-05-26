import React, { useEffect, useContext, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../../Context/Context";
import Aos from "aos";
import "aos/dist/aos.css";

const Clinic = () => {
  const {
    clinic,
    getUserClinic,
    userLocation,
    getUserLocation,
    clearLocation,
    distanceLimit
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");

  const URL = process.env.REACT_APP_API_URL;
  const PRIMARY_COLOR = "#414399";

  useEffect(() => {
    Aos.init({ duration: 800, once: true });
    const initializeClinics = async () => {
      setLoading(true);
      try {
        if (userLocation) {
          await getUserClinic(userLocation, searchTerm);
        } else {
          await getCurrentLocation();
        }
      } catch (error) {
        console.error("Error initializing clinics:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeClinics();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError('');
      if (typeof getUserLocation === 'function') {
        const location = await getUserLocation();
        if (location) await getUserClinic(location, searchTerm);
      } else if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        await getUserClinic(location, searchTerm);
      } else {
        setLocationError('Location not supported');
        await getUserClinic(null, searchTerm);
      }
    } catch (error) {
      setLocationError('Unable to get location. Showing all clinics.');
      await getUserClinic(null, searchTerm);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    await getUserClinic(userLocation, searchTerm);
    setLoading(false);
  };

  const filteredAndSortedClinics = useMemo(() => {
    let processedClinics = Array.isArray(clinic) ? [...clinic] : [];
    if (userLocation && distanceLimit?.clinicLimit) {
      const limitKm = Number(distanceLimit.clinicLimit);
      processedClinics = processedClinics.filter((c) => Number(c.distance) <= limitKm);
    }
    return processedClinics.sort((a, b) => (Number(a.distance) || Infinity) - (Number(b.distance) || Infinity));
  }, [clinic, userLocation, distanceLimit]);

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return "https://placehold.co/600x400/414399/ffffff?text=Clinic+Image";
    return `${URL}${imagePath}`;
  }, [URL]);

  const getSpecialists = useCallback((specialistsId) => {
    if (!specialistsId || specialistsId.length === 0) return ["General Care"];
    return specialistsId.slice(0, 2).map((spec) => spec.specialists || spec);
  }, []);

  const getDistanceDisplay = useCallback((clinicItem) => {
    if (!userLocation) return { show: false };
    if (clinicItem.distance !== undefined && clinicItem.distance !== null) {
      return {
        text: `${Number(clinicItem.distance).toFixed(1)} km`,
        icon: 'fas fa-location-arrow',
        badgeColor: PRIMARY_COLOR,
        show: true
      };
    }
    return { show: false };
  }, [userLocation]);

  return (
    <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <style>{`
        .hero-gradient {
            background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #6a6cd1 100%);
            padding: 80px 0 120px 0;
            color: white;
            border-radius: 0 0 40px 40px;
        }
        .clinic-search-box {
            background: white;
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            margin-top: -60px;
            position: relative;
            z-index: 10;
        }
        .clinic-card-vibrant {
            border: none;
            border-radius: 25px;
            overflow: hidden;
            transition: all 0.4s ease;
            background: white;
        }
        .clinic-card-vibrant:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(65, 67, 153, 0.15) !important;
        }
        .profile-img-container {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            border: 4px solid white;
            overflow: hidden;
            position: absolute;
            bottom: -30px;
            left: 20px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            background: white;
        }
        .spec-badge {
            background: #eef2ff;
            color: ${PRIMARY_COLOR};
            padding: 5px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .btn-view {
            background: ${PRIMARY_COLOR};
            color: white;
            border-radius: 12px;
            padding: 8px 20px;
            font-weight: 600;
            border: none;
            transition: 0.3s;
        }
        .btn-view:hover {
            background: #32347a;
            color: white;
            transform: scale(1.05);
        }
        .verified-tick {
            background: #1DA1F2;
            color: white;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            border: 2px solid white;
        }
      `}</style>

      {/* Hero Header */}
      <div className="hero-gradient px-3">
        <div className="container-xl">
          <div className="row align-items-center">
            <div className="col-lg-7" data-aos="fade-right">
              <h1 className="display-4 fw-bold mb-3">Premium Healthcare <br />Near You</h1>
              <p className="lead opacity-75">Discover top-rated clinics and certified medical professionals in your neighborhood.</p>
            </div>
            <div className="col-lg-5 text-lg-end" data-aos="fade-left">
              <div className="d-inline-flex gap-2 bg-white bg-opacity-10 p-2 rounded-pill">
                <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={getCurrentLocation} disabled={locationLoading} style={{ color: PRIMARY_COLOR }}>
                  {locationLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-crosshairs me-2"></i>}
                  {userLocation ? 'Location Active' : 'Use My Location'}
                </button>
                {userLocation && (
                  <button className="btn btn-outline-light rounded-pill border-0" onClick={() => { clearLocation(); getUserClinic(null, searchTerm); }}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-xl">
        {/* Search Bar Box */}
        <div className="clinic-search-box mx-auto col-lg-10" data-aos="zoom-in">
          <form onSubmit={handleSearch} className="row g-3 align-items-center">
            <div className="col-md-8">
              <div className="input-group input-group-lg bg-light rounded-3 overflow-hidden border-0">
                <span className="input-group-text bg-light border-0"><i className="fas fa-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control border-0 bg-light shadow-none"
                  placeholder="Search clinics, doctors or specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <button className="btn btn-lg w-100 text-white fw-bold shadow-sm" type="submit" style={{ backgroundColor: PRIMARY_COLOR, borderRadius: '12px' }}>
                Search Clinics
              </button>
            </div>
          </form>
          {userLocation && distanceLimit?.clinicLimit && (
            <div className="mt-2 small text-muted px-2">
              <i className="fas fa-info-circle me-1" style={{ color: PRIMARY_COLOR }}></i>
              Optimized for clinics within <b>{distanceLimit.clinicLimit} km</b> of your area.
            </div>
          )}
        </div>

        {locationError && (
          <div className="alert alert-warning mt-4 rounded-4 shadow-sm border-0"><i className="fas fa-exclamation-triangle me-2"></i>{locationError}</div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-grow" style={{ color: PRIMARY_COLOR }} role="status"></div>
            <h5 className="mt-3 fw-bold text-muted">Searching for best clinics...</h5>
          </div>
        ) : (
          <div className="row g-4 mt-4">
            {filteredAndSortedClinics.length > 0 ? (
              filteredAndSortedClinics.map((clinicItem, index) => {
                const dist = getDistanceDisplay(clinicItem);
                const specs = getSpecialists(clinicItem.SpecialistsId);

                return (
                  <div key={clinicItem._id} className="col-sm-6 col-lg-4 col-xl-3" data-aos="fade-up" data-aos-delay={index * 50}>
                    <div className="card h-100 clinic-card-vibrant shadow-sm">
                      {/* Banner Image */}
                      <div className="position-relative" style={{ height: "140px" }}>
                        <img
                          src={getImageUrl(clinicItem.posterimage || clinicItem.image)}
                          className="w-100 h-100"
                          alt={clinicItem.name}
                          style={{ objectFit: "cover" }}
                          onError={(e) => { e.target.src = "https://placehold.co/600x400/414399/ffffff?text=Clinic"; }}
                        />
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)' }}></div>

                        {/* Distance Label */}
                        {dist.show && (
                          <div className="position-absolute top-0 start-0 m-2">
                            <span className="badge backdrop-blur shadow-sm py-2 px-3" style={{ background: 'rgba(255,255,255,0.9)', color: PRIMARY_COLOR, borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
                              <i className="fas fa-map-marker-alt me-1"></i> {dist.text}
                            </span>
                          </div>
                        )}

                        {/* Profile Pic Overlap */}
                        <div className="profile-img-container">
                          <img
                            src={getImageUrl(clinicItem.image)}
                            alt="Profile"
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => { e.target.src = "https://placehold.co/85/414399/ffffff?text=C"; }}
                          />
                        </div>

                        {/* Verified Status */}
                        {clinicItem.Accountverify === "1" && (
                          <div className="position-absolute" style={{ bottom: '-30px', left: '75px', zIndex: 11 }}>
                            <div className="verified-tick" title="Verified Professional"><i className="fas fa-check"></i></div>
                          </div>
                        )}
                      </div>

                      <div className="card-body pt-5 px-3">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ fontSize: '17px' }}>{clinicItem.name}</h6>
                        </div>
                        <p className="text-muted small mb-3"><i className="fas fa-map-marker-alt me-1 text-danger"></i> {clinicItem.city || 'Available Nearby'}</p>

                        <div className="d-flex flex-wrap gap-2 mb-4" style={{ minHeight: '28px' }}>
                          {specs.map((s, i) => (
                            <span key={i} className="spec-badge">{s}</span>
                          ))}
                        </div>

                        <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top border-light">
                          <div className="d-flex align-items-center">
                            <div className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                            <span className="text-muted" style={{ fontSize: '12px', fontWeight: '600' }}>Available Now</span>
                          </div>
                          <Link to={`/Clinic/Doctors/${clinicItem._id}`} className="btn-view text-decoration-none small">
                            View Clinic
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center py-5 mt-4">
                <div className="mb-4">
                  <div className="bg-white shadow-sm d-inline-block p-4 rounded-circle mb-3">
                    <i className="fas fa-hospital-alt fa-3x" style={{ color: '#d1d5db' }}></i>
                  </div>
                  <h3 className="fw-bold text-dark">No Clinics Found</h3>
                  <p className="text-muted">We couldn't find any clinics matching your current search or location.</p>
                  <button className="btn btn-outline-primary px-4 fw-bold mt-2" onClick={async () => { setSearchTerm(""); clearLocation(); await getUserClinic(null, ""); }}>
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="py-5"></div>
    </div>
  );
};

export default Clinic;
