import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MyContext } from '../../../Context/Context';

// ✅ HELPER: Haversine Formula for Client-side Distance Calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

// ✅ HELPER: Get distance value safely
const getDistanceValue = (shop) => {
  if (!shop?.distance) return Infinity;
  if (typeof shop.distance === 'number') return shop.distance;
  return shop.distance.onRoadValue ||
    shop.distance.on_road_value ||
    shop.distance.onRoad?.value ||
    shop.distance.roadDistance ||
    shop.distance.value ||
    Infinity;
};

// 🌟 PHARMACY SHOPPING BANNERS (Mohali Themed)
const heroBanners = [
  {
    id: 1,
    title: "Medicines Delivered to Your Door in Mohali",
    subtitle: "Browse trusted pharmacies near Nijjar Chowk and get fast, reliable doorstep delivery.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=90&w=2800",
    badge: "🛒 Mohali Pharmacy Shopping"
  },
  {
    id: 2,
    title: "100% Genuine. Always Verified.",
    subtitle: "Every store near Phase 7, Mohali is certified and quality-checked for your safety.",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=90&w=2800",
    badge: "✅ Verified Sellers in Mohali"
  },
  {
    id: 3,
    title: "Save More on Every Order Near You",
    subtitle: "Exclusive discounts on prescriptions, vitamins, and everyday health essentials.",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=90&w=2800",
    badge: "💊 Best Health Prices"
  }
];

// 🌟 Mohali Specific Popular Locations
const popularLocations = [
  { name: "Nijjar Chowk", lat: 30.6791, lng: 76.7265, address: "Nijjar Chowk, Phase 7, Mohali" },
  { name: "Phase 7", lat: 30.6812, lng: 76.7243, address: "Phase 7, Mohali" },
  { name: "Phase 8", lat: 30.6895, lng: 76.7290, address: "Phase 8, Mohali" },
  { name: "Sector 70", lat: 30.6678, lng: 76.7174, address: "Sector 70, Mohali" },
  { name: "Airport Road", lat: 30.6725, lng: 76.7321, address: "Airport Road, Mohali" },
  { name: "Phase 3B2", lat: 30.6943, lng: 76.7367, address: "Phase 3B2, Mohali" }
];

const PharmacyShopsPage = React.memo(() => {
  const {
    pharmacyShops = [],
    loading,
    hasMorePharmacies: hasMore,
    userLocation,
    fetchPharmacyShops: fetchShops,
    getUserLocation,
    setManualLocation,
    clearLocation,
    distanceLimit
  } = useContext(MyContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('distance');
  const [showAllPharmacies, setShowAllPharmacies] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNearbyAlert, setShowNearbyAlert] = useState(false);

  const initialLoadDone = useRef(false);
  const lastFetchedCoords = useRef(null);
  const manualLocationRef = useRef({ lat: '', lng: '' });

  // Mohali Nijjar Chowk coordinates
  const nijjarChowkCoords = { latitude: 30.6791, longitude: 76.7265 };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroBanners.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const filteredAndSortedShops = useMemo(() => {
    if (!pharmacyShops || !Array.isArray(pharmacyShops)) return [];
    let result = [...pharmacyShops];

    if (userLocation && distanceLimit?.pharmacyLimit && !showAllPharmacies) {
      const limitKm = Number(distanceLimit.pharmacyLimit);
      result = result.filter((shop) => {
        let dist = getDistanceValue(shop);
        if ((dist === Infinity || dist === null) && userLocation && shop.location?.coordinates) {
          const shopLong = shop.location.coordinates[0];
          const shopLat = shop.location.coordinates[1];
          const calculatedDist = calculateDistance(userLocation.latitude, userLocation.longitude, shopLat, shopLong);
          if (calculatedDist !== null) { dist = calculatedDist; shop.distance = calculatedDist; }
        }
        if (dist === Infinity || dist === null) return false;
        return dist <= limitKm;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(shop =>
        shop?.name?.toLowerCase().includes(query) ||
        shop?.city?.toLowerCase().includes(query) ||
        shop?.area?.toLowerCase().includes(query) ||
        (shop?.address && shop.address.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'distance' && userLocation) return (getDistanceValue(a) - getDistanceValue(b));
      else if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      else if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return result;
  }, [pharmacyShops, searchQuery, sortBy, userLocation, distanceLimit, showAllPharmacies]);

  const handleShowAllPharmacies = useCallback(() => setShowAllPharmacies(true), []);
  const handleClearLocation = useCallback(() => {
    if (clearLocation) clearLocation();
    setShowAllPharmacies(true);
    lastFetchedCoords.current = null;
    if (fetchShops) fetchShops(1, null);
  }, [clearLocation, fetchShops]);

  const handleGetLocation = useCallback(async () => {
    if (!getUserLocation) return;
    setLocationLoading(true);
    try {
      await getUserLocation();
      setShowAllPharmacies(false);
      setShowNearbyAlert(true);
      setTimeout(() => setShowNearbyAlert(false), 4000);
    }
    catch (error) {
      console.error(error);
      // Fallback to Mohali Nijjar Chowk if location fails
      if (setManualLocation && fetchShops) {
        setManualLocation(nijjarChowkCoords.latitude, nijjarChowkCoords.longitude);
        setShowLocationInput(false);
        setShowAllPharmacies(false);
        lastFetchedCoords.current = { latitude: nijjarChowkCoords.latitude, longitude: nijjarChowkCoords.longitude };
        fetchShops(1, { latitude: nijjarChowkCoords.latitude, longitude: nijjarChowkCoords.longitude });
      }
    }
    finally { setLocationLoading(false); }
  }, [getUserLocation, setManualLocation, fetchShops]);

  const handleSortChange = useCallback(() => {
    setSortBy(prev => prev === 'distance' ? 'rating' : prev === 'rating' ? 'name' : 'distance');
  }, []);

  const toggleLocationInput = useCallback(() => setShowLocationInput(prev => !prev), []);

  const handleManualSubmit = useCallback(() => {
    const lat = parseFloat(manualLocationRef.current.lat);
    const lng = parseFloat(manualLocationRef.current.lng);
    if (!isNaN(lat) && !isNaN(lng) && setManualLocation && fetchShops) {
      setManualLocation(lat, lng);
      setShowLocationInput(false);
      setShowAllPharmacies(false);
      lastFetchedCoords.current = { latitude: lat, longitude: lng };
      fetchShops(1, { latitude: lat, longitude: lng });
      setPage(1);
    }
  }, [setManualLocation, fetchShops]);

  const handlePopularLocation = useCallback((lat, lng, name) => {
    if (setManualLocation && fetchShops) {
      setManualLocation(lat, lng);
      setShowLocationInput(false);
      setShowAllPharmacies(false);
      lastFetchedCoords.current = { latitude: lat, longitude: lng };
      fetchShops(1, { latitude: lat, longitude: lng });
      setPage(1);
    }
  }, [setManualLocation, fetchShops]);

  const handleRefresh = useCallback(async () => {
    if (!fetchShops) return;
    setPage(1);
    lastFetchedCoords.current = null;
    await fetchShops(1, userLocation);
  }, [fetchShops, userLocation]);

  useEffect(() => {
    const loadData = async () => {
      if (!initialLoadDone.current && !userLocation && fetchShops) {
        await fetchShops(1, null);
        initialLoadDone.current = true;
        return;
      }
      if (userLocation && fetchShops) {
        const { latitude, longitude } = userLocation;
        if (lastFetchedCoords.current?.latitude === latitude && lastFetchedCoords.current?.longitude === longitude) return;
        await fetchShops(1, userLocation);
        lastFetchedCoords.current = { latitude, longitude };
      }
    };
    loadData();
  }, [fetchShops, userLocation]);

  if (!initialLoadDone.current && loading && pharmacyShops.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: '#f0faf7' }}>
        <div className="spinner-border" style={{ color: '#10b981', width: '3.5rem', height: '3.5rem' }} role="status"></div>
      </div>
    );
  }

  return (
    <div className="pharm-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .pharm-wrapper {
          background: linear-gradient(180deg, #f8fafc 0%, #f3f7fb 100%);
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding-bottom: 5rem;
          overflow-x: hidden;
        }

        .hero-section {
          position: relative; width: 100%; height: 450px;
          border-radius: 0 0 40px 40px; overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          margin-bottom: 3rem;
        }
        .hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease-in-out; }
        .hero-slide.active { opacity: 1; z-index: 2; }
        .hero-img-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(9, 9, 9, 0.4) 100%, rgba(12, 59, 46, 0.3) 0%);
        }
        .hero-content {
          position: relative; z-index: 3; height: 100%;
          display: flex; flex-direction: column; justify-content: center;
          padding: 0 8%; max-width: 1320px; margin: 0 auto;
        }
        .hero-title { font-size: 2.8rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 1rem; }
        .hero-subtitle { font-size: 1.1rem; color: #d1fae5; max-width: 550px; }

        .cmd-panel {
          background: #fff; border-radius: 24px;
          padding: 1.2rem 1.5rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
          margin-top: -60px; position: relative; z-index: 100;
          border: 1px solid #e2e8f0;
        }
        .s-input {
          width: 100%; padding: 12px 15px 12px 42px;
          border-radius: 14px; border: 1px solid #e2e8f0;
          background: #f8fafc; font-size: 0.95rem; outline: none; transition: 0.2s;
        }
        .s-input:focus { border-color: #10b981; background: #fff; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }

        .tb {
          padding: 10px 20px; border-radius: 12px;
          font-weight: 700; font-size: 0.88rem;
          display: inline-flex; align-items: center; gap: 8px;
          border: none; cursor: pointer; transition: 0.2s;
        }
        .tb-green { background: #10b981; color: #fff; }
        .tb-light { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

        .feature-strip {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem;
          margin: 2.5rem 0;
        }
        .feat-card {
          display: flex; align-items: center; gap: 12px;
          background: #fff; padding: 1rem 1.4rem;
          border-radius: 20px; border: 1px solid #f1f5f9;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02); min-width: 220px;
        }
        .feat-ico {
          width: 44px; height: 44px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; color: #fff;
        }
        .ico-a { background: #10b981; }
        .ico-b { background: #6366f1; }
        .ico-c { background: #f59e0b; }

        .location-section {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          border-radius: 24px;
          padding: 1.5rem;
          margin: 2rem 0;
          color: white;
        }
        .popular-locations {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 15px;
          justify-content: center;
        }
        .location-chip {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          padding: 8px 18px;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .location-chip:hover {
          background: rgba(255,255,255,0.35);
          transform: translateY(-2px);
        }
        .manual-location-input {
          display: flex;
          gap: 12px;
          margin-top: 15px;
          flex-wrap: wrap;
        }
        .loc-input {
          flex: 1;
          padding: 10px 15px;
          border-radius: 14px;
          border: none;
          outline: none;
          font-size: 0.9rem;
        }
        .loc-submit-btn {
          background: white;
          color: #059669;
          border: none;
          padding: 10px 24px;
          border-radius: 14px;
          font-weight: 800;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 14px;
          margin-top: 2rem;
        }

        .screenshot-card {
          background: #fff;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          border: 1px solid #eef2f7;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .screenshot-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
        }

        .card-img-container {
          width: 100%;
          height: 230px;
          background: #f8fafc;
          position: relative;
          padding: 14px 14px 0;
        }
        .card-image-box {
          width: 100%;
          height: 100%;
          border-radius: 22px;
          overflow: hidden;
          position: relative;
        }
        .card-img-container img {
          width: 100%; height: 100%; object-fit: cover;
          display: block;
        }
        .rating-badge {
          position: absolute;
          bottom: 18px;
          right: 18px;
          background: rgba(255,255,255,0.95);
          color: #f59e0b;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          backdrop-filter: blur(10px);
        }

        .card-body-content {
          padding: 1rem 1.2rem 0.9rem;
        }

        .shop-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .shop-name-title {
          font-size: 16px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          line-height: 1.35;
        }

        .mini-chip {
          white-space: nowrap;
          padding: 7px 12px;
          border-radius: 999px;
          background: #fff7ed;
          color: #ea580c;
          border: 1px solid #fed7aa;
          font-size: 0.72rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .divider-line {
          height: 1px;
          background: #eef2f7;
          width: 100%;
          margin: 14px 0;
        }

        .data-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
        }
        .data-row i {
          margin-top: 3px;
          font-size: 0.9rem;
          width: 18px;
          text-align: center;
        }
        .data-row span {
          font-size: 0.7rem;
          color: #475569;
          line-height: 1.45;
          font-weight: 800;
        }

        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin: 18px 0 10px;
        }

        .price-box {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .price-now {
          font-size: 1.7rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
        }
        .price-old {
          font-size: 1rem;
          color: #94a3b8;
          text-decoration: line-through;
          font-weight: 600;
        }

        .save-chip {
          background: #fee2e2;
          color: #e11d48;
          border: 1px solid #fecdd3;
          padding: 8px 12px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.8rem;
        }

        .view-shop-btn {
          width: 100%;
          border: none;
          background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
          color: #fff;
          border-radius: 18px;
          padding: 8px 8px;
          font-weight: 800;
          font-size: 0.7rem;
          margin-top: 5px;
          transition: 0.3s;
          box-shadow: 0 10px 22px rgba(99, 102, 241, 0.25);
        }
        .view-shop-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 26px rgba(99, 102, 241, 0.32);
        }

        .card-footer-badges {
          padding:6px;
          display: flex;
          gap: 5px;
          justify-content:space-between;
          
        }
        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }
        .b-verified { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }
        .b-delivery { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
        .b-offers { background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; }

        .refresh-fab {
          position: fixed; bottom: 28px; right: 28px;
          width: 54px; height: 54px; border-radius: 50%;
          background: #10b981; color: #fff; border: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; box-shadow: 0 8px 25px rgba(16,185,129,0.3);
          z-index: 1000; cursor: pointer; transition: 0.3s;
        }

        .nearby-alert {
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 600;
          z-index: 1000;
          animation: slideUp 0.3s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 2rem; }
          .hero-section { height: 360px; }
          .cards-grid { grid-template-columns: 1fr; }
          .card-img-container { height: 210px; }
          .shop-name-title { font-size: 1.05rem; }
          .popular-locations { gap: 8px; }
          .location-chip { padding: 6px 12px; font-size: 0.75rem; }
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="hero-section">
        {heroBanners.map((banner, index) => (
          <div key={banner.id} className={`hero-slide ${index === currentSlide ? 'active' : ''}`}>
            <div className="hero-img-bg" style={{ backgroundImage: `url(${banner.image})` }} />
            <div className="hero-overlay" />
            <div className="hero-content">
              <div style={{ marginBottom: '10px' }}>
                <span style={{ background: '#10b981', padding: '6px 12px', borderRadius: '40px', fontSize: '0.8rem', fontWeight: 600 }}>📍 Serving Mohali & Nearby Areas</span>
              </div>
              <h1 className="hero-title">{banner.title}</h1>
              <p className="hero-subtitle">{banner.subtitle}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        {/* COMMAND PANEL */}
        <div className="cmd-panel">
          <div className="row g-3 align-items-center">
            <div className="col-lg-6">
              <div style={{ position: 'relative' }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                <input
                  type="text" className="s-input"
                  placeholder="Search pharmacy store in Mohali..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-lg-6 d-flex flex-wrap gap-2 justify-content-lg-end">
              <button className="tb tb-light" onClick={handleSortChange}>
                <i className="fas fa-sort-amount-down"></i> {sortBy === 'distance' ? 'Nearest' : sortBy === 'rating' ? 'Top Rated' : 'A–Z'}
              </button>
              <button className="tb tb-green" onClick={handleGetLocation} disabled={locationLoading}>
                {locationLoading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Getting Location...</>
                ) : (
                  <><i className="fas fa-location-arrow"></i> {userLocation ? '📍 Mohali' : '📍 Set Location'}</>
                )}
              </button>
              <button className="tb tb-light" onClick={toggleLocationInput}>
                <i className="fas fa-pen-alt"></i> Change Area
              </button>
            </div>
          </div>
        </div>

        

        {/* FEATURE STRIP */}
        <div className="feature-strip">
          <div className="feat-card">
            <div className="feat-ico ico-a"><i className="fas fa-truck-fast"></i></div>
            <div><h6>Fast Delivery in Mohali</h6><span>15-20 min delivery</span></div>
          </div>
          <div className="feat-card">
            <div className="feat-ico ico-b"><i className="fas fa-shield-check"></i></div>
            <div><h6>Verified Stores</h6><span>100% Genuine Medicine</span></div>
          </div>
          <div className="feat-card">
            <div className="feat-ico ico-c"><i className="fas fa-clock"></i></div>
            <div><h6>24/7 Availability</h6><span>Emergency support</span></div>
          </div>
        </div>

        {/* PHARMACY GRID */}
        <div className="cards-grid">
          {filteredAndSortedShops.map((shop, index) => {
            const dist = getDistanceValue(shop);

            let shopImg = shop?.shop_image || shop?.image?.url || shop?.image || shop?.profileImage || shop?.shopImage;

            if (shopImg && typeof shopImg === 'object') {
              shopImg = shopImg.url || shopImg.secure_url;
            }

            const fallbackImg = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000";

            const rating = shop.rating || '4.8';
            const category = shop?.speciality || shop?.category || shop?.type || 'Pharmacy Store';
            const area = shop?.area || shop?.city || 'Phase 7, Mohali';

            return (
              <div key={shop._id || index} className="screenshot-card">
                <div className="card-img-container">
                  <div className="card-image-box">
                    <img
                      src={shopImg || fallbackImg}
                      alt={shop.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImg;
                      }}
                    />
                    {/* Add overlay to card image */}
                    <div className="hero-overlay" />
                  </div>
                  <div className="rating-badge">
                    <i className="fas fa-star" style={{ color: '#f59e0b' }}></i> {rating}
                  </div>
                </div>

                <div className="card-body-content">
                  <div className="shop-top-row">
                    <h6 className="shop-name-title">{shop.name}</h6>
                    <div className="mini-chip">
                      <i className="fas fa-store"></i> {area}
                    </div>
                  </div>

                  <div className="data-row" style={{ marginBottom: '8px' }}>
                    <i className="fas fa-user-md" style={{ color: '#10b981' }}></i>
                    <span>{category}</span>
                  </div>

                  <div className="data-row">
                    <i className="fas fa-truck" style={{ color: '#10b981' }}></i>
                    <span>MOHALI • {dist !== Infinity ? `${dist} km away` : 'Near Nijjar Chowk'}</span>
                  </div>

                  <div className="divider-line"></div>

                  <button
                    className="view-shop-btn"
                    onClick={() => window.location.href = `/Pharmacy/${shop._id}`}
                  >
                    Book Now <i className="fas fa-arrow-right ms-1"></i>
                  </button>
                  <div className="card-footer-badges mt-3">
                    <span className="badge-pill b-verified">
                      <i className="fas fa-check-circle"></i> MOHALI VERIFIED
                    </span>

                    <span className="badge-pill b-offers">
                      <i className="fas fa-tag"></i>  10% OFF
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAndSortedShops.length === 0 && !loading && (
          <div className="text-center py-5">
            <i className="fas fa-store-slash" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
            <h3 className="text-muted mt-3">No Pharmacies Found in Mohali</h3>
            <p className="text-muted">Try changing your location or check back later</p>
          </div>
        )}
      </div>

      <button className="refresh-fab" onClick={handleRefresh}>
        <i className="fas fa-sync-alt"></i>
      </button>

      {showNearbyAlert && (
        <div className="nearby-alert">
          <i className="fas fa-check-circle me-2"></i> Showing pharmacies near Nijjar Chowk, Mohali
        </div>
      )}
    </div>
  );
});

export default PharmacyShopsPage;
