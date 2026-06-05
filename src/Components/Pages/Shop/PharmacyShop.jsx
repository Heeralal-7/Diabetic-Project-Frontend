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

  // API base URL fixed from env
  const API_URL = process.env.REACT_APP_API_URL;

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

  const handlePopularLocation = useCallback((lat, lng) => {
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

  return (
    <div className="pharm-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .pharm-wrapper { background: linear-gradient(180deg, #f8fafc 0%, #f3f7fb 100%); min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; padding-bottom: 5rem; overflow-x: hidden; }
        .hero-section { position: relative; width: 100%; height: 450px; border-radius: 0 0 40px 40px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); margin-bottom: 3rem; }
        .hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease-in-out; }
        .hero-slide.active { opacity: 1; z-index: 2; }
        .hero-img-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(9, 9, 9, 0.4) 100%, rgba(12, 59, 46, 0.3) 0%); }
        .hero-content { position: relative; z-index: 3; height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 0 8%; max-width: 1320px; margin: 0 auto; }
        .hero-title { font-size: 2.8rem; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 1rem; }
        .hero-subtitle { font-size: 1.1rem; color: #d1fae5; max-width: 550px; }

        .cmd-panel { background: #fff; border-radius: 24px; padding: 1.2rem 1.5rem; box-shadow: 0 10px 40px rgba(0,0,0,0.06); margin-top: -60px; position: relative; z-index: 100; border: 1px solid #e2e8f0; }
        .s-input { width: 100%; padding: 12px 15px 12px 42px; border-radius: 14px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.95rem; outline: none; transition: 0.2s; }
        .tb { padding: 10px 20px; border-radius: 12px; font-weight: 700; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; transition: 0.2s; }
        .tb-green { background: #10b981; color: #fff; }
        .tb-light { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

        .feature-strip { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; margin: 2.5rem 0; }
        .feat-card { display: flex; align-items: center; gap: 12px; background: #fff; padding: 1rem 1.4rem; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.02); min-width: 220px; }
        .feat-ico { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #fff; }
        .ico-a { background: #10b981; } .ico-b { background: #6366f1; } .ico-c { background: #f59e0b; }

        .location-section { background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 24px; padding: 1.5rem; margin: 2rem 0; color: white; }
        .popular-locations { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 15px; justify-content: center; }
        .location-chip { background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); padding: 8px 18px; border-radius: 40px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border: 1px solid rgba(255,255,255,0.3); }
        .location-chip:hover { background: rgba(255,255,255,0.35); transform: translateY(-2px); }
        .manual-location-input { display: flex; gap: 12px; margin-top: 15px; flex-wrap: wrap; }
        .loc-input { flex: 1; padding: 10px 15px; border-radius: 14px; border: none; outline: none; font-size: 0.9rem; }
        .loc-submit-btn { background: white; color: #059669; border: none; padding: 10px 24px; border-radius: 14px; font-weight: 800; }

        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; margin-top: 2rem; }
        .screenshot-card { background: #fff; border-radius: 28px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #eef2f7; transition: transform 0.25s ease; }
        .screenshot-card:hover { transform: translateY(-6px); }

        .card-img-container { width: 100%; height: 230px; background: #f8fafc; position: relative; padding: 14px 14px 0; }
        .card-image-box { width: 100%; height: 100%; border-radius: 22px; overflow: hidden; position: relative; }
        .card-image-box img { width: 100%; height: 100%; object-fit: cover; }
        
        .rating-badge { position: absolute; bottom: 18px; right: 18px; background: rgba(255,255,255,0.95); color: #f59e0b; padding: 3px 10px; border-radius: 999px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px; box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
        .card-body-content { padding: 1rem 1.2rem; }
        .shop-name-title { font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; }
        .mini-chip { padding: 7px 12px; border-radius: 999px; background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; font-size: 0.72rem; font-weight: 800; }
        .view-shop-btn { width: 100%; border: none; background: #3D3F96; color: #fff; border-radius: 18px; padding: 12px; font-weight: 800; font-size: 0.85rem; margin-top: 15px; }

        @media (max-width: 768px) { .hero-title { font-size: 2rem; } .hero-section { height: 360px; } .cards-grid { grid-template-columns: 1fr; } }
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
                  type="text" className="s-input shadow-none"
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
                {locationLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-location-arrow"></i>} {userLocation ? '📍 Mohali Active' : '📍 Set Location'}
              </button>
              <button className="tb tb-light" onClick={toggleLocationInput}>
                <i className="fas fa-pen-alt"></i> Change Area
              </button>
            </div>
          </div>
        </div>

        {/* RESTORED LOCATION SECTION */}
        <div className="location-section text-center">
          <h5 className="fw-bold mb-3 text-white"><i className="fas fa-map-marker-alt me-2"></i> Popular Areas in Mohali</h5>
          <div className="popular-locations">
            {popularLocations.map((loc, i) => (
              <div key={i} className="location-chip" onClick={() => handlePopularLocation(loc.lat, loc.lng)}>
                {loc.name}
              </div>
            ))}
          </div>

          {showLocationInput && (
            <div className="manual-location-input">
              <input type="number" placeholder="Lat" className="loc-input" onChange={e => manualLocationRef.current.lat = e.target.value} />
              <input type="number" placeholder="Lng" className="loc-input" onChange={e => manualLocationRef.current.lng = e.target.value} />
              <button className="loc-submit-btn" onClick={handleManualSubmit}>Set</button>
            </div>
          )}
        </div>

        {/* FEATURE STRIP */}
        <div className="feature-strip">
          <div className="feat-card">
            <div className="feat-ico ico-a"><i className="fas fa-truck-fast"></i></div>
            <div><h6>Fast Delivery</h6><span>15-20 min delivery</span></div>
          </div>
          <div className="feat-card">
            <div className="feat-ico ico-b"><i className="fas fa-shield-check"></i></div>
            <div><h6>Verified Stores</h6><span>100% Genuine Medicine</span></div>
          </div>
          <div className="feat-card">
            <div className="feat-ico ico-c"><i className="fas fa-clock"></i></div>
            <div><h6>24/7 Support</h6><span>Emergency medical care</span></div>
          </div>
        </div>

        {/* PHARMACY GRID */}
        <div className="cards-grid">
          {filteredAndSortedShops.map((shop, index) => {
            const dist = getDistanceValue(shop);

            // ✅ FIX: Correct API Image logic restore
            const rawImg = shop?.shop_image || shop?.image?.url || shop?.image || shop?.profileImage || shop?.shopImage;
            let shopImg = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000";

            if (rawImg) {
              const imagePath = (typeof rawImg === 'object') ? (rawImg.url || rawImg.secure_url) : rawImg;
              if (imagePath) {
                shopImg = (imagePath.startsWith('http') || imagePath.startsWith('data:')) 
                  ? imagePath 
                  : `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
              }
            }

            return (
              <div key={shop._id || index} className="screenshot-card">
                <div className="card-img-container">
                  <div className="card-image-box">
                    <img src={shopImg} alt={shop.name} onError={(e) => { e.target.src = "https://via.placeholder.com/400x250?text=Pharmacy"; }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
                  </div>
                  <div className="rating-badge">
                    <i className="fas fa-star"></i> {shop.rating || '4.8'}
                  </div>
                </div>

                <div className="card-body-content text-start">
                  <div className="d-flex justify-content-between mb-3 align-items-start">
                    <h6 className="shop-name-title text-truncate" style={{maxWidth:'180px'}}>{shop.name}</h6>
                    <div className="mini-chip"><i className="fas fa-store"></i> {shop.city || 'Mohali'}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', fontWeight: 800 }}>
                    <i className="fas fa-map-marker-alt text-primary"></i> <span className="text-truncate">{shop.address || 'Address not available'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, marginTop: '8px' }}>
                    <i className="fas fa-truck text-success"></i> <span>MOHALI • {dist !== Infinity ? `${dist} km away` : 'Fast Delivery'}</span>
                  </div>

                  <button className="view-shop-btn shadow-sm" onClick={() => window.location.href = `/Pharmacy/${shop._id}`}>
                    Book Now <i className="fas fa-arrow-right ms-2"></i>
                  </button>
                  
                  <div className="d-flex justify-content-between mt-3">
                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '5px 10px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: 800 }}>MOHALI VERIFIED</span>
                    <span style={{ background: '#fffbeb', color: '#b45309', padding: '5px 10px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: 800 }}>10% OFF</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAndSortedShops.length === 0 && !loading && (
          <div className="text-center py-5">
            <h3 className="text-muted">No Stores Found in Mohali</h3>
          </div>
        )}
      </div>

      <button className="btn btn-success shadow-lg rounded-circle" onClick={handleRefresh} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '55px', height: '55px', zIndex: 1000 }}>
        <i className="fas fa-sync-alt"></i>
      </button>
    </div>
  );
});

export default PharmacyShopsPage;