import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import defaultPharmacyImg from '../../../Assets/img/pharmacy.png';
import axios from "axios";
 
const PharmacyCard = ({ data: pharmacy }) => {
 
  /* ------------------ Distance States ------------------ */
  const [distance, setDistance] = useState(null);
  const [loadingDistance, setLoadingDistance] = useState(false);
  const [geoError, setGeoError] = useState(null);
 
  /* ------------------ Ratings States ------------------ */
  const [ratingUser, setRatingsUser] = useState(null);
  const [ratingsLoadingUser, setRatingsLoadingUser] = useState(false);
  const [errorRating, setErrorRating] = useState(null);
 
  /* ------------------ Distance Calculator ------------------ */
  useEffect(() => {
    // First check if pharmacy has distance data from backend
    if (pharmacy?.distance) {
      // Use backend distance data
      const distanceValue = pharmacy.distance.value || pharmacy.distance;
      const distanceText = pharmacy.distance.text || `${distanceValue} km`;
     
      setDistance({
        value: distanceValue,
        text: distanceText,
        calculationMethod: pharmacy.distance.calculationMethod || 'BACKEND',
        duration: pharmacy.distance.duration,
        durationText: pharmacy.distance.durationText
      });
      setLoadingDistance(false);
      return;
    }
 
    // Fallback to frontend calculation
    if (!pharmacy?.latitude || !pharmacy?.longitude) {
      setLoadingDistance(false);
      return;
    }
 
    const getLocation = () => {
      if (!navigator.geolocation) {
        setGeoError('Geolocation not supported');
        setLoadingDistance(false);
        return;
      }
 
      setLoadingDistance(true);
 
      const success = (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const calculatedDistance = calculateDistance(
          userLat,
          userLng,
          parseFloat(pharmacy.latitude),
          parseFloat(pharmacy.longitude)
        );
       
        setDistance({
          value: calculatedDistance,
          text: `${calculatedDistance} km`,
          calculationMethod: 'STRAIGHT_LINE_FRONTEND'
        });
        setLoadingDistance(false);
      };
 
      const error = () => {
        setGeoError('Location access denied');
        setLoadingDistance(false);
      };
 
      navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    };
 
    getLocation();
  }, [pharmacy]);
 
  /* ------------------ Rating Fetcher ------------------ */
  const getRatings = async (id) => {
    setRatingsLoadingUser(true);
    setErrorRating(null);
 
    try {
      const Token = localStorage.getItem("token");
     
      const config = {
        params: { vendorId: id },
        headers: { "Content-Type": "application/json" }
      };
 
      if (Token) {
        config.headers.token = Token;
      }
 
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user-rating/getratings`,
        config
      );
 
      if (response.data.success === 1) {
        setRatingsUser(response.data.data);
      } else {
        setRatingsUser(null);
      }
 
    } catch (err) {
      console.error("Error fetching rating:", err);
    } finally {
      setRatingsLoadingUser(false);
    }
  };
 
  /* ------------------ Call getRatings when vendorId changes ------------------ */
  useEffect(() => {
    if (pharmacy?._id) {
      getRatings(pharmacy._id);
    }
  }, [pharmacy?._id]);
 
  /* ------------------ Helpers ------------------ */
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
 
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
 
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 
    return (R * c).toFixed(1);
  };
 
  const deg2rad = (deg) => deg * (Math.PI / 180);
 
  const getAddress = () => {
    try {
      const { address = "", city = "", state = "", country = "" } = pharmacy || {};
      return [address, city, state, country].filter(Boolean).join(", ") || "Address not available";
    } catch {
      return "Address not available";
    }
  };
 
  /* ------------------ UI ------------------ */
  if (!pharmacy || typeof pharmacy !== "object") {
    return (
      <div className="card h-100 shadow-sm">
        <div className="card-body text-center">
          <p className="text-muted">Invalid pharmacy data</p>
        </div>
      </div>
    );
  }
 
  // Calculate Average Rating Safely
  const averageRating = ratingUser?.ratingStatistics?.averageRating
    ? parseFloat(ratingUser.ratingStatistics.averageRating).toFixed(1)
    : "0.0";
 
  const totalRatings = ratingUser?.ratingStatistics?.totalRatings || 0;
 
  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="position-relative" style={{ height: "180px", overflow: "hidden" }}>
        <img
          src={`${process.env.REACT_APP_API_URL}${pharmacy.image}` || pharmacy.banner || defaultPharmacyImg}
          className="card-img-top h-100 object-fit-cover"
          alt={pharmacy.name || "Pharmacy"}
          onError={(e) => (e.target.src = defaultPharmacyImg)}
        />
 
        {/* Distance Badge - Top Left */}
        {loadingDistance && (
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-dark bg-opacity-75 text-white shadow-sm d-flex align-items-center gap-1 px-2 py-1">
              <i className="fas fa-spinner fa-spin me-1"></i>
              ...
            </span>
          </div>
        )}
 
        {distance && !loadingDistance && (
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-dark bg-opacity-75 text-white shadow-sm d-flex align-items-center gap-1 px-2 py-1">
              <i className="fas fa-route me-1"></i>
              {distance.text || `${distance.value} km`}
            </span>
          </div>
        )}
 
        {/* Favorite Button - Top Right */}
        {/* <div className="position-absolute top-0 end-0 m-2">
          <button className="btn btn-sm btn-light rounded-circle shadow-sm">
            <i className="far fa-heart"></i>
          </button>
        </div> */}
 
        {/* Rating Badge - Bottom Left */}
        <div className="position-absolute bottom-0 start-0 m-2">
          <span className="badge bg-warning text-dark shadow-sm d-flex align-items-center gap-1">
            <i className="fas fa-star"></i>
            {ratingsLoadingUser ? (
              "..."
            ) : (
              <span>
                {averageRating} <span className="fw-normal text-secondary" style={{fontSize: '0.8em'}}>({totalRatings})</span>
              </span>
            )}
          </span>
        </div>
      </div>
 
      <div className="card-body">
        <h5 className="card-title text-truncate" title={pharmacy.name}>{pharmacy.name || "Pharmacy"}</h5>
 
        <p className="card-text small text-muted mb-2 text-truncate">
          <i className="fas fa-map-marker-alt me-1 text-danger"></i> {getAddress()}
        </p>
 
        {/* Distance Details - Clean and Simple */}
        <div className="mb-3">
          {loadingDistance && (
            <p className="small text-muted mb-0">
              <i className="fas fa-spinner fa-spin me-1"></i> Calculating distance...
            </p>
          )}
         
          {distance && !loadingDistance && (
            <div className="small text-muted mb-0">
              <i className="fas fa-route me-1 text-primary"></i>
              {distance.text || `${distance.value} km`}
             
              {/* {distance.durationText && (
                <span className="ms-2">
                  <i className="fas fa-clock me-1"></i>
                  {distance.durationText}
                </span>
              )} */}
             
              {/* {distance.calculationMethod === 'ON_ROAD' && (
                <div className="text-success mt-1" style={{fontSize: '0.75rem'}}>
                  <i className="fas fa-check-circle me-1"></i>
                  On-road distance
                </div>
              )} */}
            </div>
          )}
         
          {geoError && (
            <p className="small text-danger mb-0" style={{fontSize: '0.75rem'}}>
              <i className="fas fa-exclamation-triangle me-1"></i>
              {geoError}
            </p>
          )}
        </div>
 
        <Link
          to={`/pharmacy/${pharmacy._id}`}
          className="btn btn-sm btn-outline-primary w-100 rounded-pill"
        >
          View Shop
        </Link>
      </div>
    </div>
  );
};
 
export default React.memo(PharmacyCard);
 