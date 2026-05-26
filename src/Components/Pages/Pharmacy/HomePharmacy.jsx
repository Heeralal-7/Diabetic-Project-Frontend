import React, { useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';
import Carousel from '../FoodAndNutrition/FAndNComponents/Carousel';
import HowItWorks from './PharmacyComponents/HowItWorks';
import CardsCarousel from './PharmacyComponents/CardsCarousel';

// Import images
import PharmacyImg from '../../Assets/img/Pharmacy/PharmacyImg.png';
import PharmacyImg1 from '../../Assets/img/Pharmacy/PharmacyImg1.png';
import PharmacyImg2 from '../../Assets/img/Pharmacy/PharmacyImg2.png';
import PharmacyImg3 from '../../Assets/img/Pharmacy/PharmacyImg3.png';
import PharmacyImg4 from '../../Assets/img/Pharmacy/PharmacyImg4.png';
import PharmacyImg5 from '../../Assets/img/Pharmacy/PharmacyImg5.png';

// Optimized Image Component
const OptimizedImage = React.memo(({ src, alt, className, style, fallbackSrc }) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) {
      setImgSrc(fallbackSrc);
      setLoaded(true);
      return;
    }
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setLoaded(true);  
    };
    img.onerror = () => {
      setImgSrc(fallbackSrc);
      setLoaded(true);
    };
  }, [src, fallbackSrc]);

  return (
    <div className={`position-relative w-100 h-100 d-flex align-items-center justify-content-center opt-img-wrapper ${className || ''}`} style={style}>
      <img
        src={imgSrc}
        alt={alt}
        className={`opt-img ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: style?.objectFit || 'cover',
          transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s ease'
        }}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
});

// Premium Hero Carousel Component
const PremiumHeroCarousel = ({ slides, interval = 6000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 300);
    }, interval);
    return () => clearInterval(timer);
  }, [slides.length, interval]);

  return (
    <div className="premium-hero-wrapper mb-5 shadow-2xl">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`premium-hero-slide ${index === currentIndex ? 'active' : ''}`}
        >
          {/* Added ken-burns animation class */}
          <div className={`premium-hero-bg ${index === currentIndex ? 'ken-burns' : ''}`} style={{ backgroundImage: `url(${slide.image})` }}></div>
          <div className="premium-hero-gradient"></div>

          <div className="premium-hero-content container-xl">
            <div className="premium-hero-text-box">
              <div className="premium-badge-tag mb-4 shadow-sm">
                <span className="pulse-dot"></span> Certified Healthcare Network
              </div>
              <h1 className="premium-hero-title">{slide.captionTitle}</h1>
              <p className="premium-hero-desc">{slide.captionText}</p>
              <div className="d-flex gap-3 mt-4 animate-slide-up-btn">
                <button className="btn-modern-primary rounded-pill ">
                  {slide.buttonText} <i className="ri-arrow-right-up-line ms-2"></i>
                </button>
                <button className="btn-glass rounded-pill d-none d-sm-flex align-items-center">
                  <i className="ri-play-circle-line me-2 fs-5"></i> Watch Video
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="premium-hero-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`premium-hero-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></button>
        ))}
      </div>

      <button
        className="hero-nav-arrow hero-nav-prev shadow-lg"
        onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
      >
        <i className="ri-arrow-left-s-line"></i>
      </button>
      <button
        className="hero-nav-arrow hero-nav-next shadow-lg"
        onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
      >
        <i className="ri-arrow-right-s-line"></i>
      </button>
    </div>
  );
};

// Elite Shop Card Component
const EliteShopCard = ({ shop }) => {
  const rawImage = shop.image || shop.shopImage || shop.vendorImage;
  let imageUrl = PharmacyImg;

  if (rawImage) {
    if (rawImage.startsWith('http') || rawImage.startsWith('data:')) {
      imageUrl = rawImage;
    } else {
      const baseUrl = process.env.REACT_APP_API_URL || '';
      imageUrl = `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
    }
  }

  let distanceText = "NEARBY";
  if (shop.distance !== undefined && shop.distance !== null) {
    let distVal = typeof shop.distance === 'number' ? shop.distance : parseFloat(shop.distance.value);
    if (!isNaN(distVal)) distanceText = `${distVal.toFixed(1)} KM`;
  }

  const apiRating = shop.rating || shop.averageRating || 0;
  const ratingDisplay = Number(apiRating) > 0 ? Number(apiRating).toFixed(1) : "New";

  const renderStars = () => {
    if (ratingDisplay === "New") return null;
    const ratingNum = parseFloat(ratingDisplay);
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 >= 0.5;
    return (
      <div className="elite-stars px-2 py-1 bg-light rounded-pill border">
        <span className="fw-bold fs-7 me-1 text-dark">{ratingDisplay}</span>
        <i className="ri-star-fill text-warning fs-7"></i>
      </div>
    );
  };

  const shopName = shop.name || shop.shopName || 'Premium Pharmacy';
  const shopAddress = shop.address || shop.shopAddress || "Address not available";
  const shopLocation = shop.city ? `${shop.city}${shop.state ? `, ${shop.state}` : ''}` : "Local Area";

  return (
    <div className="elite-shop-card h-100 d-flex flex-column">
      <div className="elite-img-container">
        <OptimizedImage src={imageUrl} alt={shopName} fallbackSrc={PharmacyImg} />

        {/* Badges overlaid on image */}
        <div className="elite-badges-top d-flex justify-content-between w-100 p-3 position-absolute top-0 start-0 z-2">
          <div className="elite-distance-tag shadow-sm">
            <i className="ri-map-pin-2-fill me-1 text-primary"></i> {distanceText}
          </div>
          <div className="elite-wishlist-icon shadow-sm">
            <i className="ri-heart-3-line"></i>
          </div>
        </div>

        {/* Gradient overlay to make text pop if needed */}
        <div className="img-overlay-gradient"></div>
      </div>

      <div className="elite-card-body d-flex flex-column flex-grow-1">
        <div className="d-flex align-items-start justify-content-between mb-3 gap-2">
          <div>
            <h5 className="fw-bolder text-dark mb-1 elite-shop-title" title={shopName}>
              {shopName} <i className="ri-verified-badge-fill text-info ms-1 fs-6" title="Verified Partner"></i>
            </h5>
            <p className="fw-bold mb-0 text-primary" style={{ fontSize: '13px' }}>
              <i className="ri-map-2-line me-1"></i>{shopLocation}
            </p>
          </div>
          {renderStars()}
        </div>

        <div className="mb-4 elite-address-box bg-light rounded-3 p-2">
          <p className="mb-0 text-truncate text-muted" style={{ fontSize: '13px' }}>
            <i className="ri-map-pin-line me-1 text-secondary"></i> {shopAddress}
          </p>
        </div>

        <div className="d-flex gap-2 mb-4 flex-wrap mt-auto">
          <span className="elite-feature-tag tag-blue">
            <i className="ri-time-line"></i> 24/7 OPEN
          </span>
          <span className="elite-feature-tag tag-green">
            <i className="ri-truck-line"></i> DELIVERY
          </span>
          <span className="elite-feature-tag tag-purple">
            <i className="ri-shield-check-line"></i> SECURE
          </span>
        </div>

        <div className="mt-auto">
          <Link to={`/pharmacy/${shop._id}`} className="btn-elite-outline w-100 text-center d-flex align-items-center justify-content-center shadow-sm">
            Visit Pharmacy <i className="ri-arrow-right-line ms-2"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

const DATA_CACHE_KEY = 'pharmacy_home_data_v2_clean';

const HomePharmacy = () => {
  const context = useContext(MyContext);
  const {
    products1,
    medicines1,
    popularProducts1,
    popularMedicines1,
    pharmacyShops = [],
    loading,
    fetchProducts,
    fetchMedicines,
    fetchPopularProducts,
    fetchPopularMedicines,
    fetchPharmacyShops: getPharmacyShops,
    userLocation,
    getUserLocation,
    setManualLocation,
    clearLocation,
    distanceLimit,
    brands = [],
    loadingBrand,
    getAllBrands,
  } = context || {};

  const [displayData, setDisplayData] = useState(() => {
    const cached = localStorage.getItem(DATA_CACHE_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return { products: [], medicines: [], popProducts: [], popMedicines: [], brands: [] }; }
    }
    return { products: [], medicines: [], popProducts: [], popMedicines: [], brands: [] };
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleShops, setVisibleShops] = useState(6);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [isAutoLocationLoading, setIsAutoLocationLoading] = useState(false);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [showAllPharmacies, setShowAllPharmacies] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const cartItemCount = 0;

  const showAllPharmaciesRef = useRef(false);
  const distanceLimitRef = useRef(null);
  const userLocationRef = useRef(null);
  const hasFetchedShopsRef = useRef(false);
  const isFetchingShopsRef = useRef(false);
  const initialDataFetchedRef = useRef(false);

  useEffect(() => { showAllPharmaciesRef.current = showAllPharmacies; }, [showAllPharmacies]);
  useEffect(() => { distanceLimitRef.current = distanceLimit; }, [distanceLimit]);
  useEffect(() => { userLocationRef.current = userLocation; }, [userLocation]);

  // Completely Enhanced Modern CSS
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

    :root {
      --primary: #1e3a8a; /* Deep elegant blue */
      --primary-light: #3b82f6;
      --primary-dark: #0f172a;
      --secondary: #0ea5e9; /* Vibrant teal/cyan */
      --accent: #f59e0b;
      --success: #10b981;
      --danger: #ef4444;
      --gray-50: #f8fafc;
      --gray-100: #f1f5f9;
      --gray-200: #e2e8f0;
      --gray-300: #cbd5e1;
      --gray-600: #475569;
      --gray-800: #1e293b;
      --shadow-sm: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
      --shadow-md: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.02);
      --shadow-lg: 0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01);
      --shadow-xl: 0 25px 50px -12px rgba(0,0,0,0.15);
      --radius-sm: 12px;
      --radius-md: 20px;
      --radius-lg: 28px;
      --radius-xl: 36px;
      --font-heading: 'Plus Jakarta Sans', sans-serif;
      --font-body: 'Inter', sans-serif;
    }

    .modern-health-app {
      font-family: var(--font-body);
      background: #f8fafc;
      padding-bottom: 80px;
      color: var(--gray-800);
    }
    
    h1, h2, h3, h4, h5, h6, .font-heading {
      font-family: var(--font-heading);
    }

    /* Floating Buttons */
    .floating-cart-btn, .all-orders-btn {
      position: fixed;
      z-index: 1050;
      right: 2rem;
      border-radius: 50px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      backdrop-filter: blur(10px);
    }
    .all-orders-btn {
      bottom: 6rem;
      background: rgba(255,255,255,0.95);
      color: var(--primary) !important;
      border: 1px solid var(--gray-200);
      padding: 12px 24px;
      box-shadow: var(--shadow-md);
    }
    .floating-cart-btn {
      bottom: 2rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white !important;
      border: none;
      padding: 14px 28px;
      box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.5);
    }
    .floating-cart-btn:hover, .all-orders-btn:hover {
      transform: translateY(-5px) scale(1.05);
    }
    .cart-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: var(--danger);
      color: white;
      border-radius: 50%;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: bold;
      border: 2px solid white;
    }

    /* Premium Hero Section */
    .premium-hero-wrapper {
      position: relative;
      width: 100%;
      height: 620px;
      border-radius: var(--radius-xl);
      overflow: hidden;
      background: var(--primary-dark);
      margin-top: 1rem;
    }
    .premium-hero-slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1;
    }
    .premium-hero-slide.active {
      opacity: 1;
      z-index: 2;
    }
    .premium-hero-bg {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      filter: brightness(0.85);
      transform: scale(1.05);
    }
    .premium-hero-bg.ken-burns {
      animation: kenBurns 10s ease-out forwards;
    }
    @keyframes kenBurns {
      0% { transform: scale(1.05); }
      100% { transform: scale(1.15); }
    }
    .premium-hero-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(110deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.7) 45%, transparent 100%);
    }
    .premium-hero-content {
      position: relative;
      z-index: 3;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 6rem;
    }
    .premium-hero-text-box {
      max-width: 650px;
      animation: slideUpFade 0.8s ease forwards;
    }
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .premium-badge-tag {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: white;
      padding: 8px 20px;
      border-radius: 40px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      border: 1px solid rgba(255,255,255,0.25);
    }
    .pulse-dot {
      width: 10px;
      height: 10px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 12px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    .premium-hero-title {
      color: white;
      font-size: 4.2rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      letter-spacing: -1.5px;
      text-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .premium-hero-desc {
      color: #e2e8f0;
      font-size: 1.25rem;
      line-height: 1.6;
      font-weight: 400;
      margin-bottom: 1.5rem;
      max-width: 90%;
    }
    
    /* Buttons */
    .btn-modern-primary {
      background: linear-gradient(135deg, var(--primary-light), var(--secondary));
      color: white !important;
      border: none;
      padding: 16px 25px !important;
      font-weight: 700;
      font-size: 16px;
      transition: all 0.3s ease;
      font-family: var(--font-heading);
    }
    .btn-modern-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(14, 165, 233, 0.5);
    }
    .btn-glass {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      padding: 16px 32px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .btn-glass:hover {
      background: rgba(255,255,255,0.25);
      transform: translateY(-3px);
    }

    /* Carousel Nav */
    .hero-nav-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 50px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      cursor: pointer;
      z-index: 20;
      transition: all 0.3s ease;
      opacity: 0;
    }
    .premium-hero-wrapper:hover .hero-nav-arrow { opacity: 1; }
    .hero-nav-arrow:hover {
      background: white;
      color: var(--primary);
      transform: translateY(-50%) scale(1.1);
    }
    .hero-nav-prev { left: 30px; }
    .hero-nav-next { right: 30px; }
    .premium-hero-dots {
      position: absolute;
      bottom: 40px;
      left: 6rem;
      z-index: 10;
      display: flex;
      gap: 12px;
    }
    .premium-hero-dot {
      width: 10px;
      height: 10px;
      border-radius: 10px;
      background: rgba(255,255,255,0.4);
      border: none;
      cursor: pointer;
      transition: all 0.4s ease;
    }
    .premium-hero-dot.active {
      width: 36px;
      background: var(--secondary);
    }

    /* Overlapping Trust Badges */
    .trust-badges-wrapper {
      margin-top: -60px;
      position: relative;
      z-index: 10;
      padding: 0 2rem;
    }
    .trust-badges {
      background: white;
      border-radius: var(--radius-lg);
      padding: 24px 40px;
      display: flex;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--gray-100);
    }
    .trust-badge {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
      min-width: 200px;
      padding: 10px;
      border-right: 1px solid var(--gray-100);
    }
    .trust-badge:last-child { border-right: none; }
    .trust-badge-icon {
      width: 56px;
      height: 56px;
      background: var(--gray-50);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      font-size: 26px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
      transition: all 0.3s ease;
    }
    .trust-badge:hover .trust-badge-icon {
      background: var(--primary);
      color: white;
      transform: rotateY(10deg) scale(1.05);
    }
    .trust-badge-text-wrap h6 {
      margin: 0;
      font-weight: 700;
      color: var(--gray-800);
      font-size: 15px;
    }
    .trust-badge-text-wrap p {
      margin: 0;
      font-size: 13px;
      color: var(--gray-500);
    }

    /* Section Headers */
    .modern-section-title {
      font-size: 2.4rem;
      font-weight: 800;
      color: var(--gray-800);
      letter-spacing: -0.5px;
      margin-bottom: 0;
    }
    .section-decoration {
      width: 80px;
      height: 5px;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      border-radius: 5px;
      margin-top: 12px;
    }

    /* Filter & Search Bar */
    .modern-filter-bar {
      background: white;
      border-radius: 20px;
      padding: 16px 24px;
      box-shadow: var(--shadow-sm);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      border: 1px solid var(--gray-200);
    }
    .modern-pill-btn {
      background: white;
      border: 1px solid var(--gray-200);
      color: var(--gray-700);
      padding: 12px 28px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
    }
    .modern-pill-btn:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .dropdown-btn {
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: 50px;
      padding: 12px 24px;
      font-weight: 600;
      color: var(--gray-700);
      transition: all 0.2s;
    }
    .dropdown-btn:hover { background: var(--gray-100); }

    /* Category Tabs */
    .category-tabs {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 36px;
    }
    .category-tab {
      padding: 10px 28px;
      border-radius: 50px;
      background: white;
      border: 1px solid var(--gray-200);
      font-weight: 600;
      font-size: 14px;
      color: var(--gray-600);
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
    }
    .category-tab:hover {
      border-color: var(--secondary);
      color: var(--secondary);
      transform: translateY(-2px);
    }
    .category-tab.active {
      background: var(--primary-dark);
      color: white;
      border-color: transparent;
      box-shadow: 0 8px 15px rgba(15, 23, 42, 0.3);
    }

    /* Big Search Box */
    .modern-search-box {
      background: white;
      border-radius: 60px;
      padding: 8px 8px 8px 28px;
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }
    .modern-search-box:focus-within {
      box-shadow: var(--shadow-lg);
      border-color: var(--secondary);
    }
    .modern-search-input {
      border: none;
      outline: none;
      background: transparent;
      padding: 16px 20px;
      font-size: 16px;
      width: 100%;
      font-weight: 500;
      color: var(--gray-800);
    }
    .modern-search-input::placeholder { color: var(--gray-400); }

    /* Elite Shop Cards */
    .elite-shop-card {
      background: white;
      border-radius: var(--radius-md);
      padding: 16px;
      box-shadow: var(--shadow-sm);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid var(--gray-100);
      overflow: hidden;
    }
    .elite-shop-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl);
      border-color: var(--gray-200);
    }
    .elite-img-container {
      position: relative;
      height: 220px;
      border-radius: 14px;
      overflow: hidden;
      background: var(--gray-100);
    }
    .opt-img-wrapper { z-index: 1; }
    .elite-shop-card:hover .opt-img { transform: scale(1.1); }
    .img-overlay-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.1) 100%);
      z-index: 1;
      pointer-events: none;
    }
    .elite-distance-tag {
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(4px);
      color: var(--gray-800);
      font-weight: 800;
      font-size: 11px;
      padding: 6px 14px;
      border-radius: 30px;
      letter-spacing: 0.5px;
    }
    .elite-wishlist-icon {
      background: rgba(255,255,255,0.95);
      color: var(--gray-600);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 18px;
    }
    .elite-wishlist-icon:hover {
      background: var(--danger);
      color: white;
      transform: scale(1.1);
    }
    .elite-card-body { padding: 20px 8px 8px 8px; }
    .elite-shop-title { font-size: 1.25rem; letter-spacing: -0.3px; }
    .elite-feature-tag {
      font-size: 11px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 30px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.3px;  
    }
    .tag-blue { background: #e0f2fe; color: #0284c7; }
    .tag-green { background: #dcfce7; color: #16a34a; }
    .tag-purple { background: #f3e8ff; color: #9333ea; }
    .btn-elite-outline {
      display: block;
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      font-weight: 700;
      background: white;
      color: var(--primary);
      text-decoration: none;
      transition: all 0.3s ease;
      border: 2px solid var(--gray-100);
    }
    .btn-elite-outline:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      transform: translateY(-2px);
    }

    /* Mesh Gradient Promo Card */
    .modern-promo-card {
      background: 
        radial-gradient(at 0% 0%, rgba(30, 58, 138, 1) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.8) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.6) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(15, 23, 42, 1) 0px, transparent 50%);
      background-color: var(--primary-dark);
      border-radius: var(--radius-xl);
      padding: 56px;
      color: white;
      box-shadow: 0 25px 50px -12px rgba(30, 58, 138, 0.4);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .promo-offer-badge {
      position: absolute;
      top: 30px;
      right: 30px;
      background: linear-gradient(135deg, var(--danger), #fb923c);
      color: white;
      padding: 10px 24px;
      border-radius: 40px;
      font-weight: 800;
      font-size: 14px;
      transform: rotate(3deg);
      box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
      letter-spacing: 1px;
    }

    /* Brands Section */
    .elite-brand-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 24px;
      margin-top: 40px;
    }
    .elite-brand-card {
      background: white;
      border-radius: var(--radius-md);
      padding: 36px 24px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: all 0.4s ease;
      cursor: pointer;
      position: relative;
    }
    .elite-brand-card::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--radius-md);
      box-shadow: 0 15px 30px -5px rgba(14, 165, 233, 0.2);
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .elite-brand-card:hover {
      transform: translateY(-8px);
      border-color: rgba(14, 165, 233, 0.3);
    }
    .elite-brand-card:hover::after { opacity: 1; }
    .elite-brand-img-wrap {
      width: 90px;
      height: 90px;
      margin-bottom: 24px;
      transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      filter: grayscale(100%) opacity(0.7);
    }
    .elite-brand-card:hover .elite-brand-img-wrap {
      transform: scale(1.15);
      filter: grayscale(0%) opacity(1);
    }
    .elite-brand-name {
      font-weight: 700;
      font-size: 15px;
      color: var(--gray-800);
      line-height: 1.4;
      font-family: var(--font-heading);
    }

    @media (max-width: 992px) {
      .premium-hero-content { padding: 0 3rem; }
      .premium-hero-title { font-size: 3.2rem; }
      .trust-badges-wrapper { padding: 0 1rem; }
      .trust-badge { min-width: 45%; border-right: none; border-bottom: 1px solid var(--gray-100); padding-bottom: 20px;}
      .trust-badge:nth-last-child(-n+2) { border-bottom: none; }
    }
    @media (max-width: 768px) {
      .premium-hero-wrapper { height: 520px; border-radius: 0; margin-top: 0; }
      .premium-hero-content { padding: 0 1.5rem; text-align: center; justify-content: center;}
      .premium-hero-title { font-size: 2.5rem; }
      .premium-hero-desc { font-size: 1.1rem; margin: 0 auto 1.5rem auto; }
      .animate-slide-up-btn { justify-content: center; }
      .premium-hero-dots { left: 50%; transform: translateX(-50%); bottom: 20px; }
      .hero-nav-arrow { display: none; }
      .trust-badges-wrapper { margin-top: -30px; }
      .trust-badge { min-width: 100%; border-bottom: 1px solid var(--gray-100); }
      .trust-badge:last-child { border-bottom: none; }
      .modern-filter-bar { border-radius: 20px; flex-direction: column; align-items: stretch; }
      .modern-promo-card { padding: 40px 24px; border-radius: 20px; }
      .promo-offer-badge { top: 16px; right: 16px; padding: 8px 16px; font-size: 11px; }
    }
  `;

  // Initial data fetch
  useEffect(() => {
    if (initialDataFetchedRef.current) return;
    const fetchAllData = async () => {
      try {
        initialDataFetchedRef.current = true;
        await Promise.allSettled([
          fetchProducts && fetchProducts(),
          fetchMedicines && fetchMedicines(),
          fetchPopularProducts && fetchPopularProducts(),
          fetchPopularMedicines && fetchPopularMedicines(),
          getAllBrands && getAllBrands()
        ]);
      } catch (err) {
        console.error('Error in initial fetch:', err);
      }
    };
    fetchAllData();
  }, []);

  // Update displayData from context
  useEffect(() => {
    let shouldUpdate = false;
    const newData = { ...displayData };
    if (products1?.length > 0 && products1 !== displayData.products) { newData.products = products1; shouldUpdate = true; }
    if (medicines1?.length > 0 && medicines1 !== displayData.medicines) { newData.medicines = medicines1; shouldUpdate = true; }
    if (popularProducts1?.length > 0 && popularProducts1 !== displayData.popProducts) { newData.popProducts = popularProducts1; shouldUpdate = true; }
    if (popularMedicines1?.length > 0 && popularMedicines1 !== displayData.popMedicines) { newData.popMedicines = popularMedicines1; shouldUpdate = true; }
    if (brands?.length > 0 && brands !== displayData.brands) { newData.brands = brands; shouldUpdate = true; }
    if (shouldUpdate) {
      setDisplayData(newData);
      localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(newData));
    }
  }, [products1, medicines1, popularProducts1, popularMedicines1, brands, displayData]);

  // Auto location detection
  useEffect(() => {
    if (userLocation || localStorage.getItem('pharmacy_location_permission') === 'denied') return;
    const timer = setTimeout(async () => {
      if (!navigator.geolocation) return;
      setIsAutoLocationLoading(true);
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted') await getUserLocation();
      } catch (e) {
        console.log("Auto location skipped");
      } finally {
        setIsAutoLocationLoading(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [userLocation, getUserLocation]);

  const safeFetchShops = useCallback(async (customSearch = "") => {
    if (isFetchingShopsRef.current) return;
    try {
      isFetchingShopsRef.current = true;
      if (getPharmacyShops) await getPharmacyShops(1, userLocationRef.current, customSearch);
      hasFetchedShopsRef.current = true;
    } catch (err) {
      console.error(err);
    } finally {
      isFetchingShopsRef.current = false;
    }
  }, [getPharmacyShops]);

  useEffect(() => {
    if (!hasFetchedShopsRef.current && (userLocation || showAllPharmacies)) safeFetchShops(searchQuery);
  }, [userLocation, showAllPharmacies, safeFetchShops, searchQuery]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (getPharmacyShops) await getPharmacyShops(1, userLocation, searchQuery);
  };

  const filterPharmaciesByDistance = useCallback((shops) => {
    if (!shops || !Array.isArray(shops)) return [];
    const currentShowAll = showAllPharmaciesRef.current;
    const currentUserLocation = userLocationRef.current;
    const currentDistanceLimit = distanceLimitRef.current;
    if (currentShowAll || !currentUserLocation || !currentDistanceLimit?.pharmacyLimit) return shops;
    const limitKm = Number(currentDistanceLimit.pharmacyLimit);
    return shops.filter((shop) => {
      let distanceKm = null;
      if (typeof shop.distance === 'number') distanceKm = shop.distance;
      else if (shop.distance?.value) distanceKm = Number(shop.distance.value);
      if (distanceKm === null || isNaN(distanceKm)) return true;
      return distanceKm <= limitKm;
    });
  }, []);

  useEffect(() => {
    const filtered = filterPharmaciesByDistance(pharmacyShops);
    setFilteredPharmacies(filtered);
  }, [pharmacyShops, showAllPharmacies, userLocation, distanceLimit, filterPharmaciesByDistance]);

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    setIsAutoLocationLoading(true);
    try {
      await getUserLocation();
      localStorage.setItem('pharmacy_location_permission', 'granted');
      setShowAllPharmacies(false);
      hasFetchedShopsRef.current = false;
    } catch (error) {
      setShowLocationInput(true);
    } finally {
      setIsGettingLocation(false);
      setIsAutoLocationLoading(false);
    }
  };

  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    if (!manualLat || !manualLng) return;
    setManualLocation(manualLat, manualLng);
    setShowLocationInput(false);
    setShowAllPharmacies(false);
    hasFetchedShopsRef.current = false;
  };

  const handleClearLocation = () => {
    clearLocation();
    setShowAllPharmacies(true);
    hasFetchedShopsRef.current = false;
    setSearchQuery("");
    safeFetchShops("");
  };

  const sortedPharmacies = useMemo(() => {
    const searchFiltered = filteredPharmacies.filter(shop => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        shop?.name?.toLowerCase().includes(query) ||
        shop?.city?.toLowerCase().includes(query) ||
        shop?.state?.toLowerCase().includes(query)
      );
    });

    let filtered = [...searchFiltered];

    if (activeCategory === '24hr') {
      filtered = filtered.filter(shop => shop.open247 === true);
    } else if (activeCategory === 'delivery') {
      filtered = filtered.filter(shop => shop.deliveryAvailable === true);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "distance") {
        const distA = typeof a.distance === 'number' ? a.distance : (a.distance?.value || Infinity);
        const distB = typeof b.distance === 'number' ? b.distance : (b.distance?.value || Infinity);
        return distA - distB;
      }
      if (sortBy === "rating") {
        const ratingA = a.rating || a.averageRating || 0;
        const ratingB = b.rating || b.averageRating || 0;
        return ratingB - ratingA;
      }
      if (sortBy === "name") return (a.name || '').localeCompare(b.name || '');
      return 0;
    });
  }, [filteredPharmacies, searchQuery, sortBy, activeCategory]);

  const validBrands = useMemo(() => {
    if (!displayData.brands || !Array.isArray(displayData.brands)) return [];
    return displayData.brands.filter(brand => brand && brand._id);
  }, [displayData.brands]);

  const HeroSlidesData = useMemo(() => [
    { image: PharmacyImg, captionTitle: "Your Health, Delivered Instantly", captionText: "Find the nearest top-rated pharmacies and certified labs right at your fingertips.", buttonText: "Find Pharmacies" },
    { image: PharmacyImg2, captionTitle: "Trust in Every Prescription", captionText: "We connect you only with ISO-certified, verified medical partners globally.", buttonText: "Explore Network" },
    { image: PharmacyImg1, captionTitle: "24/7 Expert Consultations", captionText: "Connect with our experienced pharmacists anytime, anywhere for guidance.", buttonText: "Talk to an Expert" }
  ], []);

  return (
    <div className="modern-health-app pt-1">
      <style>{styles}</style>

      {/* Floating Buttons */}
      <Link to="/pharmacy/order-history" className="all-orders-btn">
        <i className="ri-history-line fs-5"></i> All Orders
      </Link>
      <Link to="/pharmacy/cart" className="floating-cart-btn">
        <i className="ri-shopping-bag-3-fill fs-5"></i> View Cart
        {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
      </Link>

      <div className="container-fluid px-0 px-md-4 px-lg-5">
        <div className="row m-0">
          <div className="col-12 p-0 p-md-2">

            {/* Premium Hero Carousel */}
            <PremiumHeroCarousel slides={HeroSlidesData} interval={6000} />

            {/* Overlapping Trust Badges */}
            <div className="container-xl trust-badges-wrapper mb-5">
              <div className="trust-badges">
                <div className="trust-badge">
                  <div className="trust-badge-icon"><i className="ri-shield-check-fill"></i></div>
                  <div className="trust-badge-text-wrap">
                    <h6>100% Genuine</h6>
                    <p>Verified Products</p>
                  </div>
                </div>
                <div className="trust-badge">
                  <div className="trust-badge-icon"><i className="ri-24-hours-line"></i></div>
                  <div className="trust-badge-text-wrap">
                    <h6>24/7 Support</h6>
                    <p>Always Here</p>
                  </div>
                </div>
                <div className="trust-badge">
                  <div className="trust-badge-icon"><i className="ri-secure-payment-fill"></i></div>
                  <div className="trust-badge-text-wrap">
                    <h6>Secure Payment</h6>
                    <p>Encrypted Setup</p>
                  </div>
                </div>
                <div className="trust-badge">
                  <div className="trust-badge-icon"><i className="ri-flashlight-fill"></i></div>
                  <div className="trust-badge-text-wrap">
                    <h6>Fast Delivery</h6>
                    <p>At your doorstep</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Container */}
            <div className="container-xl mt-5 pt-3">

              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} className="mb-5">
                <div className="modern-search-box">
                  <i className="ri-search-2-line fs-3 text-primary ms-3"></i>
                  <input
                    type="text"
                    className="modern-search-input"
                    placeholder="Search for tests, labs, pharmacies, or areas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn-modern-primary text-nowrap rounded-pill px-5 py-3" type="submit">Search Now</button>
                </div>
              </form>

              {/* Pharmacy Shops Section Header */}
              <div className="d-flex align-items-end justify-content-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="modern-section-title">Nearest Providers</h2>
                  <div className="section-decoration"></div>
                  {userLocation && distanceLimit?.pharmacyLimit && !showAllPharmacies && (
                    <span className="badge bg-primary bg-opacity-10 text-primary border px-3 py-2 rounded-pill mt-3 d-inline-block">
                      <i className="ri-focus-3-line me-1"></i> Within {distanceLimit.pharmacyLimit} km
                    </span>
                  )}
                </div>
                <Link to="/pharmacy-shop" className="modern-pill-btn mt-3 text-decoration-none">
                  View Directory <i className="ri-arrow-right-line ms-1"></i>
                </Link>
              </div>

              {isAutoLocationLoading && (
                <div className="auto-location-loading mb-4 d-flex align-items-center justify-content-center p-3 bg-white rounded-4 shadow-sm border">
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                  <div className="ms-2 fw-medium text-primary">Fetching high-accuracy GPS location...</div>
                </div>
              )}

              {/* Filter Bar */}
              <div className="modern-filter-bar mb-4">
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted fw-bold d-none d-md-block">Sort By:</span>
                  <div className="dropdown">
                    <button className="dropdown-btn d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                      {sortBy === "distance" ? "📍 Distance" : sortBy === "rating" ? "⭐ Top Rated" : "📝 Alphabetical"} <i className="ri-arrow-down-s-line"></i>
                    </button>
                    <ul className="dropdown-menu shadow-xl border-0 rounded-4 p-2 mt-2">
                      <li><button className="dropdown-item rounded-3 py-2 fw-medium" onClick={() => setSortBy("distance")}>Distance (Nearest)</button></li>
                      <li><button className="dropdown-item rounded-3 py-2 fw-medium" onClick={() => setSortBy("rating")}>Top Rated (Highest)</button></li>
                      <li><button className="dropdown-item rounded-3 py-2 fw-medium" onClick={() => setSortBy("name")}>Alphabetical (A-Z)</button></li>
                    </ul>
                  </div>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  {!userLocation && !isAutoLocationLoading && (
                    <button className="btn-modern-primary rounded-pill px-4 py-2" onClick={handleUseCurrentLocation} disabled={isGettingLocation}>
                      <i className="ri-focus-3-line me-1"></i> Detect Location
                    </button>
                  )}
                  {userLocation && !showAllPharmacies && (
                    <button className="modern-pill-btn py-2" onClick={() => { setShowAllPharmacies(true); if (!hasFetchedShopsRef.current) safeFetchShops(); }}>
                      Global View
                    </button>
                  )}
                  {!userLocation && (
                    <button className="btn btn-link text-decoration-none fw-bold text-muted" onClick={() => setShowLocationInput(true)}>Manual Entry</button>
                  )}
                  {userLocation && (
                    <button className="btn border-0 text-danger fw-bold rounded-pill px-4" style={{ background: '#fee2e2' }} onClick={handleClearLocation}>
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Category Tabs */}
              <div className="category-tabs">
                <button className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
                  All Pharmacies
                </button>
                <button className={`category-tab ${activeCategory === '24hr' ? 'active' : ''}`} onClick={() => setActiveCategory('24hr')}>
                  <i className="ri-time-line me-1"></i> 24/7 Open
                </button>
                <button className={`category-tab ${activeCategory === 'delivery' ? 'active' : ''}`} onClick={() => setActiveCategory('delivery')}>
                  <i className="ri-truck-line me-1"></i> Free Delivery
                </button>
              </div>

              {/* Manual Location Input */}
              {showLocationInput && (
                <div className="card mb-4 p-4 bg-white border-0 rounded-4 shadow-md ">
                  <form onSubmit={handleManualLocationSubmit}>
                    <div className="row g-3">
                      <div className="col-md-5">
                        <input type="number" step="any" className="form-control form-control-lg rounded-pill px-4 bg-light border-0" placeholder="Latitude" value={manualLat} onChange={e => setManualLat(e.target.value)} required />
                      </div>
                      <div className="col-md-5">
                        <input type="number" step="any" className="form-control form-control-lg rounded-pill px-4 bg-light border-0" placeholder="Longitude" value={manualLng} onChange={e => setManualLng(e.target.value)} required />
                      </div>
                      <div className="col-md-2">
                        <button type="submit" className="btn-modern-primary w-100 rounded-pill py-3">Find</button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Shops Grid */}
              {sortedPharmacies.length === 0 ? (
                <div className="text-center py-5  rounded-4 border shadow-sm my-4 ">
                  <div className="mb-3"><i className="ri-hospital-line display-1 text-muted opacity-25"></i></div>
                  <h4 className="fw-bold text-dark mb-2 font-heading">
                    {loading ? "Searching for premium providers..." : "No providers found."}
                  </h4>
                  <p className="text-muted fs-5">Please try adjusting your search filters or location settings.</p>
                  {searchQuery && (
                    <button className="modern-pill-btn mt-3" onClick={() => { setSearchQuery(""); safeFetchShops(""); }}>
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {sortedPharmacies.slice(0, visibleShops).map((shop, idx) => (
                      <div className="col" key={shop._id} style={{ animation: `fadeInUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${idx * 0.08}s`, opacity: 0 }}>
                        <EliteShopCard shop={shop} />
                      </div>
                    ))}
                  </div>
                  <style>{`
                    @keyframes fadeInUp {
                      from { opacity: 0; transform: translateY(30px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>
                </>
              )}

              {sortedPharmacies.length > visibleShops && (
                <div className="text-center mt-5">
                  <button className="modern-pill-btn px-5 py-3 shadow-md" onClick={() => setVisibleShops(prev => prev + 6)}>
                    Load More Providers <i className="ri-loader-4-line ms-1"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Mesh Gradient Promo Banner */}
            <div className="container-xl my-5 py-4">
              <div className="modern-promo-card">
                <div className="promo-offer-badge">
                  <i className="ri-flashlight-fill me-1"></i> LIMITED TIME
                </div>
                <div className="position-relative z-1">
                  <h3 className="fw-bolder mb-3 text-white" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>
                    Upload Prescription. <br className="d-none d-md-block" /> Save Time & Money.
                  </h3>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-4 mb-5 mt-4">
                    <p className="fs-5 mb-0 fw-medium" style={{ color: '#e0e7ff', maxWidth: '500px' }}>
                      Get up to <span className="text-white fw-bold fs-3 mx-1">25% OFF</span> on all authentic medicines when you upload a valid prescription.
                    </p>
                    {/* FIXED LINE HERE */}
                    <button className="btn bg-white rounded-pill px-5 py-3 fw-bolder shadow-lg" style={{ color: 'var(--primary)', fontSize: '16px' }}>
                      Upload Now <i className="ri-upload-cloud-2-line ms-2"></i>
                    </button>
                  </div>
                  <div className="pt-4 border-top border-light border-opacity-25 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <span className="fw-semibold"><i className="ri-shield-check-fill me-2 fs-4 text-info align-middle"></i> 100% Genuine Quality Guarantee</span>
                    <span className="fw-semibold"><i className="ri-truck-fill me-2 fs-4 text-info align-middle"></i> Free Delivery on Orders ₹499+</span>
                    <div>
                      <button className="btn btn-link text-white text-decoration-none fw-bold fs-6" data-bs-toggle="modal" data-bs-target="#howItWorksModal">
                        See how it works <i className="ri-arrow-right-line ms-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <HowItWorks modalId="howItWorksModal" />
              </div>
            </div>

            {/* Dynamic Product Carousels */}
            <div className="container-xl ">
              {displayData.medicines?.length > 0 && (
                <div className="mb-5 pt-4">
                  <CardsCarousel
                    autoplay={true} loop={true}
                    mainTittle="Top Medicines"
                    items={displayData.medicines.slice(0, 10)}
                    isMedicine={true} noOfSlides={[4, 3, 2, 2, 1, 1]}
                  />
                </div>
              )}

              {displayData.products?.length > 0 && (
                <div className="mb-5 ">
                  <CardsCarousel
                    autoplay={true} loop={true}
                    mainTittle="Wellness Products"
                    items={displayData.products.slice(0, 10)}
                    noOfSlides={[4, 3, 2, 2, 1, 1]}
                  />
                </div>
              )}

              {displayData.popMedicines?.length > 0 && (
                <div className="mb-5">
                  <CardsCarousel
                    autoplay={true} loop={true}
                    mainTittle="Most Prescribed"
                    items={displayData.popMedicines.slice(0, 10)}
                    isMedicine={true} noOfSlides={[4, 3, 2, 2, 1, 1]}
                  />
                </div>
              )}

              {displayData.popProducts?.length > 0 && (
                <div className="mb-5">
                  <CardsCarousel
                    autoplay={true} loop={true}
                    mainTittle="Trending Products"
                    items={displayData.popProducts.slice(0, 10)}
                    noOfSlides={[4, 3, 2, 2, 1, 1]}
                  />
                </div>
              )}
            </div>

            {/* Premium Brands Section */}
            <div className="container-xl mb-5 mt-5 pb-5 ">
              <div className="text-center mb-5">
                <span className="badge bg-primary bg-opacity-10 text-primary border px-4 py-2 rounded-pill fw-bold mb-3 text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>
                  Global Partnerships
                </span>
                <h2 className="modern-section-title">Trusted Health Brands</h2>
                <div className="section-decoration mx-auto"></div>
                <p className="text-muted fs-5 mx-auto mt-4" style={{ maxWidth: '650px' }}>
                  We source our diagnostic tests and medicines exclusively from verified industry-leading manufacturers.
                </p>
              </div>

              {loadingBrand && validBrands.length === 0 ? (
                <div className="d-flex justify-content-center py-5">
                  <div className="spinner-border text-primary" style={{ width: '3.5rem', height: '3.5rem', borderWidth: '4px' }}></div>
                </div>
              ) : validBrands.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
                  <p className="text-muted fs-5 fw-medium mb-0">No brand partners found at the moment.</p>
                </div>
              ) : (
                <div className="elite-brand-grid">
                  {validBrands.map((brand, idx) => {
                    const robustBrandName = brand.brandName || brand.name || brand.title || brand.companyName || "Top Partner";
                    const rawBrandImg = brand.brandImageUrl || brand.brandImage || brand.image || brand.logo || brand.img;
                    let robustBrandImage = rawBrandImg;

                    if (rawBrandImg && !rawBrandImg.startsWith('http') && !rawBrandImg.startsWith('data:')) {
                      const baseUrl = process.env.REACT_APP_API_URL || '';
                      robustBrandImage = `${baseUrl}${rawBrandImg.startsWith('/') ? '' : '/'}${rawBrandImg}`;
                    }

                    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(robustBrandName)}&background=1e3a8a&color=fff&size=200&font-size=0.4&bold=true`;

                    return (
                      <div className="elite-brand-card" key={`elite-brand-${brand._id}`} style={{ animation: `fadeInUp 0.5s ease forwards ${idx * 0.05}s`, opacity: 0 }}>
                        <div className="elite-brand-img-wrap" title={robustBrandName}>
                          <OptimizedImage
                            src={robustBrandImage}
                            fallbackSrc={fallbackAvatar}
                            alt={robustBrandName}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </div>
                        <div className="elite-brand-name">
                          {robustBrandName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HomePharmacy);
