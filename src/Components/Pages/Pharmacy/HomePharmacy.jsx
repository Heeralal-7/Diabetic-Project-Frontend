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

const DATA_CACHE_KEY = 'pharmacy_home_data_v2_clean';

const HomePharmacy = () => {
  const context = useContext(MyContext);
  const {
    products1,
    medicines1,
    popularProducts1,
    popularMedicines1,
    loading,
    fetchProducts,
    fetchMedicines,
    fetchPopularProducts,
    fetchPopularMedicines,
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
  const initialDataFetchedRef = useRef(false);

  // ORIGINAL PREMIUM CSS RESTORED
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

    :root {
      --primary: #1e3a8a;
      --primary-light: #3b82f6;
      --primary-dark: #0f172a;
      --secondary: #0ea5e9;
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
    
    /* Hero Carousel */
    .premium-hero-wrapper {
      position: relative; width: 100%; height: 620px;
      border-radius: var(--radius-xl); overflow: hidden;
      background: var(--primary-dark); margin-top: 1rem;
    }
    .premium-hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1; }
    .premium-hero-slide.active { opacity: 1; z-index: 2; }
    .premium-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; filter: brightness(0.85); transform: scale(1.05); }
    .ken-burns { animation: kenBurns 10s ease-out forwards; }
    @keyframes kenBurns { 0% { transform: scale(1.05); } 100% { transform: scale(1.15); } }
    .premium-hero-gradient { position: absolute; inset: 0; background: linear-gradient(110deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.7) 45%, transparent 100%); }
    .premium-hero-content { position: relative; z-index: 3; height: 100%; display: flex; align-items: center; padding: 0 6rem; }
    .premium-hero-title { color: white; font-size: 4.2rem; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -1.5px; }
    .premium-hero-desc { color: #e2e8f0; font-size: 1.25rem; line-height: 1.6; margin-bottom: 1.5rem; max-width: 90%; }
    .btn-modern-primary { background: linear-gradient(135deg, var(--primary-light), var(--secondary)); color: white !important; border: none; padding: 16px 25px !important; font-weight: 700; font-size: 16px; }
    
    /* Trust Badges */
    .trust-badges-wrapper { margin-top: -60px; position: relative; z-index: 10; padding: 0 2rem; }
    .trust-badges { background: white; border-radius: var(--radius-lg); padding: 24px 40px; display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; box-shadow: var(--shadow-xl); border: 1px solid var(--gray-100); }
    .trust-badge { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 200px; padding: 10px; border-right: 1px solid var(--gray-100); }
    .trust-badge:last-child { border-right: none; }
    
    /* Search Box */
    .modern-search-box { background: white; border-radius: 60px; padding: 8px 8px 8px 28px; box-shadow: var(--shadow-md); display: flex; align-items: center; border: 2px solid transparent; transition: all 0.3s ease; }
    .modern-search-input { border: none; outline: none; background: transparent; padding: 16px 20px; font-size: 16px; width: 100%; font-weight: 500; }
    
    /* Promo Banner */
    .modern-promo-card { background: radial-gradient(at 0% 0%, rgba(30, 58, 138, 1) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.8) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.6) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(15, 23, 42, 1) 0px, transparent 50%); background-color: var(--primary-dark); border-radius: var(--radius-xl); padding: 56px; color: white; position: relative; overflow: hidden; }

    /* Brand Grid */
    .elite-brand-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 24px; margin-top: 40px; }
    .elite-brand-card { background: white; border-radius: var(--radius-md); padding: 36px 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--gray-100); display: flex; flex-direction: column; align-items: center; text-align: center; transition: all 0.4s ease; cursor: pointer; position: relative; }
    .elite-brand-card:hover { transform: translateY(-8px); border-color: rgba(14, 165, 233, 0.3); }
    .elite-brand-img-wrap { width: 90px; height: 90px; margin-bottom: 24px; transition: transform 0.5s ease; filter: grayscale(100%) opacity(0.7); }
    .elite-brand-card:hover .elite-brand-img-wrap { transform: scale(1.15); filter: grayscale(0%) opacity(1); }
    
    .floating-cart-btn, .all-orders-btn { position: fixed; z-index: 1050; right: 2rem; border-radius: 50px; transition: all 0.4s; display: flex; align-items: center; gap: 10px; font-weight: 600; backdrop-filter: blur(10px); }
    .all-orders-btn { bottom: 6rem; background: white; color: var(--primary) !important; border: 1px solid var(--gray-200); padding: 12px 24px; box-shadow: var(--shadow-md); }
    .floating-cart-btn { bottom: 2rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white !important; padding: 14px 28px; box-shadow: 0 10px 25px rgba(14, 165, 233, 0.5); }
    
    @media (max-width: 768px) {
      .premium-hero-wrapper { height: 520px; border-radius: 0; }
      .premium-hero-content { padding: 0 1.5rem; text-align: center; }
      .premium-hero-title { font-size: 2.5rem; }
      .trust-badges-wrapper { margin-top: -30px; }
    }
  `;

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
      } catch (err) { console.error('Error:', err); }
    };
    fetchAllData();
  }, []);

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
  }, [products1, medicines1, popularProducts1, popularMedicines1, brands]);

  const HeroSlidesData = useMemo(() => [
    { image: PharmacyImg, captionTitle: "Your Health, Delivered Instantly", captionText: "Find top-rated medicines and wellness products at your fingertips.", buttonText: "Shop Now" },
    { image: PharmacyImg2, captionTitle: "Trust in Every Prescription", captionText: "Only ISO-certified, verified medical products for your safety.", buttonText: "Explore More" },
    { image: PharmacyImg1, captionTitle: "24/7 Wellness Support", captionText: "Guidance on wellness and supplements anytime you need it.", buttonText: "Wellness Guide" }
  ], []);

  const validBrands = useMemo(() => (displayData.brands || []).filter(brand => brand && brand._id), [displayData.brands]);

  return (
    <div className="modern-health-app pt-1">
      <style>{styles}</style>

      {/* Floating Buttons */}
      <Link to="/pharmacy/order-history" className="all-orders-btn">
        <i className="ri-history-line fs-5"></i> All Orders
      </Link>
      <Link to="/pharmacy/cart" className="floating-cart-btn">
        <i className="ri-shopping-bag-3-fill fs-5"></i> View Cart
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
                  <div className="trust-badge-icon"><i className="ri-shield-check-fill fs-2 text-primary"></i></div>
                  <div className="trust-badge-text-wrap">
                    <h6 className='m-0 fw-bold'>100% Genuine</h6>
                    <p className='m-0 small text-muted'>Verified Products</p>
                  </div>
                </div>
                <div className="trust-badge">
                  <div className="trust-badge-icon"><i className="ri-24-hours-line fs-2 text-primary"></i></div>
                  <div className="trust-badge-text-wrap">
                    <h6 className='m-0 fw-bold'>24/7 Support</h6>
                    <p className='m-0 small text-muted'>Always Here</p>
                  </div>
                </div>
                <div className="trust-badge">
                  <div className="trust-badge-icon"><i className="ri-secure-payment-fill fs-2 text-primary"></i></div>
                  <div className="trust-badge-text-wrap">
                    <h6 className='m-0 fw-bold'>Secure Payment</h6>
                    <p className='m-0 small text-muted'>Encrypted Setup</p>
                  </div>
                </div>
                <div className="trust-badge">
                  <div className="trust-badge-icon"><i className="ri-flashlight-fill fs-2 text-primary"></i></div>
                  <div className="trust-badge-text-wrap">
                    <h6 className='m-0 fw-bold'>Fast Delivery</h6>
                    <p className='m-0 small text-muted'>At your doorstep</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Container */}
            <div className="container-xl mt-5 pt-3">
              {/* Search Box */}
              <div className="modern-search-box mb-5">
                <i className="ri-search-2-line fs-3 text-primary ms-3"></i>
                <input
                  type="text"
                  className="modern-search-input"
                  placeholder="Search for medicines or wellness products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn-modern-primary rounded-pill px-5 py-3">Search</button>
              </div>

              {/* Promo Banner */}
              <div className="modern-promo-card mb-5">
                <div className="position-relative z-1">
                  <h3 className="fw-bolder mb-3 text-white" style={{ fontSize: '2.5rem' }}>Upload Prescription. <br/> Save Time & Money.</h3>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-4 mb-5">
                    <p className="fs-5 mb-0" style={{ color: '#e0e7ff', maxWidth: '500px' }}>Get up to <span className="text-white fw-bold fs-3 mx-1">25% OFF</span> on medicines when you upload a prescription.</p>
                    <button className="btn bg-white rounded-pill px-5 py-3 fw-bolder shadow-lg" style={{ color: 'var(--primary)' }}>Upload Now <i className="ri-upload-cloud-2-line ms-2"></i></button>
                  </div>
                  <div className="pt-4 border-top border-light border-opacity-25 d-flex justify-content-between flex-wrap gap-3">
                    <span className="small fw-semibold"><i className="ri-shield-check-fill me-1"></i> 100% Genuine Quality Guarantee</span>
                    <span className="small fw-semibold"><i className="ri-truck-fill me-1"></i> Free Delivery on Orders ₹499+</span>
                    <button className="btn btn-link text-white text-decoration-none small fw-bold" data-bs-toggle="modal" data-bs-target="#howItWorksModal">How it works <i className="ri-arrow-right-line ms-1"></i></button>
                  </div>
                </div>
                <HowItWorks modalId="howItWorksModal" />
              </div>

              {/* Dynamic Product Carousels */}
              {displayData.medicines?.length > 0 && <div className="mb-5"><CardsCarousel autoplay={true} loop={true} mainTittle="Top Medicines" items={displayData.medicines.slice(0, 10)} isMedicine={true} noOfSlides={[4, 3, 2, 2, 1, 1]} /></div>}
              {displayData.products?.length > 0 && <div className="mb-5"><CardsCarousel autoplay={true} loop={true} mainTittle="Wellness Products" items={displayData.products.slice(0, 10)} noOfSlides={[4, 3, 2, 2, 1, 1]} /></div>}
              {displayData.popMedicines?.length > 0 && <div className="mb-5"><CardsCarousel autoplay={true} loop={true} mainTittle="Most Prescribed" items={displayData.popMedicines.slice(0, 10)} isMedicine={true} noOfSlides={[4, 3, 2, 2, 1, 1]} /></div>}
              {displayData.popProducts?.length > 0 && <div className="mb-5"><CardsCarousel autoplay={true} loop={true} mainTittle="Trending Products" items={displayData.popProducts.slice(0, 10)} noOfSlides={[4, 3, 2, 2, 1, 1]} /></div>}

              {/* Premium Brands Section (Fully Restored Design) */}
              <div className="mt-5 pb-5">
                <div className="text-center mb-5">
                  <span className="badge bg-primary bg-opacity-10 text-primary border px-4 py-2 rounded-pill fw-bold mb-3 text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Global Partnerships</span>
                  <h2 className="modern-section-title">Trusted Health Brands</h2>
                  <div className="section-decoration mx-auto"></div>
                </div>

                {loadingBrand && validBrands.length === 0 ? (
                  <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : (
                  <div className="elite-brand-grid">
                    {validBrands.map((brand, idx) => {
                      const robustBrandName = brand.brandName || brand.name || "Top Partner";
                      const rawBrandImg = brand.brandImageUrl || brand.brandImage || brand.image || brand.logo;
                      let robustBrandImage = rawBrandImg;
                      if (rawBrandImg && !rawBrandImg.startsWith('http')) {
                        robustBrandImage = `${process.env.REACT_APP_API_URL}/${rawBrandImg.replace(/^\//, '')}`;
                      }
                      return (
                        <div className="elite-brand-card" key={`brand-${idx}`} style={{ animation: `fadeInUp 0.5s ease forwards ${idx * 0.05}s`, opacity: 0 }}>
                          <div className="elite-brand-img-wrap">
                            <OptimizedImage src={robustBrandImage} fallbackSrc="https://via.placeholder.com/150" alt={robustBrandName} style={{ objectFit: "contain" }} />
                          </div>
                          <div className="elite-brand-name fw-bold">{robustBrandName}</div>
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
    </div>
  );
};

export default React.memo(HomePharmacy);