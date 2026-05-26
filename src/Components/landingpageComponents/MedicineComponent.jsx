import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../Context/Context';
import PharmacyCard from '../Pages/Pharmacy/PharmacyComponents/Pharmacycard';
import CardsCarousel from '../Pages/Pharmacy/PharmacyComponents/CardsCarousel';
import img10 from '../Assets/img/img12.png';
// ==========================================
// 1. OPTIMIZED IMAGE COMPONENT (For Brands)
// ==========================================
const OptimizedImage = React.memo(({ src, alt, className = "", style, fallbackSrc }) => {
  const[imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setLoaded(true);
    };
    img.onerror = () => {
      if (fallbackSrc) setImgSrc(fallbackSrc);
      setLoaded(true);
    };
  },[src, fallbackSrc]);

  return (
    <div className="position-relative d-flex align-items-center justify-content-center" style={{ ...style, minHeight: style?.height }}>
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          position: 'absolute',
          width: '75%',
          height: '75%',
          objectFit: style?.objectFit || 'contain',
          transition: 'opacity 0.4s ease-in-out',
          mixBlendMode: 'multiply'
        }}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
});

const DATA_CACHE_KEY = 'pharmacy_home_data_v2_clean';

// ==========================================
// 2. MAIN COMPONENT (MedicineComponent)
// ==========================================
const MedicineComponent = () => {
  const context = useContext(MyContext);
  
  // Destructure Context
  const {
    products1, 
    medicines1, 
    popularProducts1, 
    popularMedicines1,
    pharmacyShops =[],
    loading, 
    fetchProducts,
    fetchMedicines,
    fetchPopularProducts,
    fetchPopularMedicines,
    fetchPharmacyShops,
    userLocation,
    distanceLimit,
    brands =[],
    loadingBrand,
    getAllBrands,
  } = context || {};

  // Local State for Display
  const [displayData, setDisplayData] = useState(() => {
    const cached = localStorage.getItem(DATA_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return { products:[], medicines: [], popProducts: [], popMedicines: [], brands:[] };
      }
    }
    return { products: [], medicines: [], popProducts: [], popMedicines: [], brands:[] };
  });

  const [visibleShops, setVisibleShops] = useState(4);
  const initialDataFetchedRef = useRef(false);
  const shopsFetchedRef = useRef(''); // Prevents infinite loop for shops

  // ------------------------------------------------------------------
  // DATA FETCH & CACHE LOGIC (Fixed Re-render Issue)
  // ------------------------------------------------------------------
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]); 

  // Safely update state without causing loops
  useEffect(() => {
    setDisplayData(prev => {
      let shouldUpdate = false;
      const newData = { ...prev };

      if (products1?.length > 0 && products1 !== prev.products) { newData.products = products1; shouldUpdate = true; }
      if (medicines1?.length > 0 && medicines1 !== prev.medicines) { newData.medicines = medicines1; shouldUpdate = true; }
      if (popularProducts1?.length > 0 && popularProducts1 !== prev.popProducts) { newData.popProducts = popularProducts1; shouldUpdate = true; }
      if (popularMedicines1?.length > 0 && popularMedicines1 !== prev.popMedicines) { newData.popMedicines = popularMedicines1; shouldUpdate = true; }
      if (brands?.length > 0 && brands !== prev.brands) { newData.brands = brands; shouldUpdate = true; }

      if (shouldUpdate) {
        localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(newData));
        return newData;
      }
      return prev;
    });
  },[products1, medicines1, popularProducts1, popularMedicines1, brands]);

  // ------------------------------------------------------------------
  // SHOPS & AUTO-LOCATION LOGIC (Fix: Auto fetch Lat/Long if blocked)
  // ------------------------------------------------------------------
  
  const lat = userLocation?.latitude;
  const lng = userLocation?.longitude;

  useEffect(() => {
    const locKey = `${lat || 'none'}-${lng || 'none'}`;
    
    // Prevent fetching multiple times for the same location
    if (shopsFetchedRef.current === locKey) return;

    const fetchShopsWithAutoFallback = async () => {
      let finalLocation = { latitude: lat, longitude: lng };

      // 🚀 Auto Location Logic: If GPS is off/blocked, get IP-based location automatically
      if (!lat || !lng) {
        try {
          // Free IP-based geolocation
          const ipResponse = await fetch('https://ipapi.co/json/');
          const ipData = await ipResponse.json();
          
          if (ipData && ipData.latitude && ipData.longitude) {
            finalLocation = { latitude: ipData.latitude, longitude: ipData.longitude };
            console.log("📍 Auto-detected fallback location via IP:", finalLocation);
          } else {
            finalLocation = null;
          }
        } catch (error) {
          console.error("IP Geolocation failed", error);
          finalLocation = null;
        }
      }

      if (fetchPharmacyShops) {
        fetchPharmacyShops(1, finalLocation, "");
        shopsFetchedRef.current = locKey; // Lock to prevent loop
      }
    };

    fetchShopsWithAutoFallback();
    
    // Only depend on primitive values (lat, lng) to break object-reference infinite loops
  },[lat, lng, fetchPharmacyShops]);


  // Sort & Filter Shops by Distance
  const sortedPharmacies = useMemo(() => {
    let shops = [...pharmacyShops];

    // Filter by distance limit if applicable
    if (lat && lng && distanceLimit?.pharmacyLimit) {
      const limitKm = Number(distanceLimit.pharmacyLimit);
      shops = shops.filter((shop) => {
        if (!shop?.distance) return true;
        let distanceKm = null;
        if (typeof shop.distance === 'number') distanceKm = shop.distance;
        else if (shop.distance?.value) distanceKm = Number(shop.distance.value);
        if (distanceKm === null || isNaN(distanceKm)) return true;
        return distanceKm <= limitKm;
      });
    }

    // Sort by Nearest First
    return shops.sort((a, b) => {
        const distA = typeof a.distance === 'number' ? a.distance : (a.distance?.value || Infinity);
        const distB = typeof b.distance === 'number' ? b.distance : (b.distance?.value || Infinity);
        return distA - distB;
    });
  }, [pharmacyShops, lat, lng, distanceLimit]);

  const validBrands = useMemo(() => {
    if (!displayData.brands || !Array.isArray(displayData.brands)) return[];
    return displayData.brands.filter(brand => brand && brand._id && (brand.brandImageUrl || brand.brandImage));
  }, [displayData.brands]);


  // ==========================================
  // 3. UI RENDERING
  // ==========================================
  return (
    <div className="premium-medicine-wrapper pb-5">
      
      {/* 🚀 GLOBAL PREMIUM CSS INJECTOR */}
      <style>{`
        .premium-medicine-wrapper {
          background-color: #f8fafc; /* Soft cool gray background */
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
        }

        /* ✨ Section Titles with Modern Underline */
        .premium-section-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: #0f172a;
          position: relative;
          margin-bottom: 0;
          letter-spacing: -0.5px;
          display: inline-block;
          padding-bottom: 8px;
        }
        .premium-section-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          height: 4px;
          width: 50px;
          background: linear-gradient(90deg, #3d3f96, #818cf8);
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        .premium-section-title:hover::after {
          width: 100px;
        }

        /* 🔘 Premium "See More" Buttons */
        .btn-premium-outline {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          color: #3d3f96;
          font-weight: 700;
          border-radius: 50px;
          padding: 8px 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        .btn-premium-outline:hover {
          background: linear-gradient(135deg, #3d3f96, #4f46e5);
          border-color: transparent;
          color: #ffffff !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(61, 63, 150, 0.2);
        }

        /* 🚀 Global Overrides for Imported Cards (PharmacyCard & Carousel) */
        .premium-medicine-wrapper .card,
        .premium-medicine-wrapper .beato-product-card {
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          border-radius: 20px !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03) !important;
          background: #ffffff !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          overflow: hidden;
          height: 100%;
        }
        .premium-medicine-wrapper .card:hover,
        .premium-medicine-wrapper .beato-product-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 20px 35px -10px rgba(61, 63, 150, 0.15) !important;
          border-color: #cbd5e1 !important;
        }

        /* Smooth Images inside cards */
        .premium-medicine-wrapper .card img,
        .premium-medicine-wrapper .beato-product-card img {
          border-top-left-radius: 20px !important;
          border-top-right-radius: 20px !important;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .premium-medicine-wrapper .card:hover img,
        .premium-medicine-wrapper .beato-product-card:hover img {
          transform: scale(1.04) !important;
        }

        
        /* Spacing adjustments */
        .premium-section {
          margin-bottom: 4rem;
          background: #ffffff;
          padding: 2.5rem 2rem;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }
        
        @media (max-width: 768px) {
          .premium-section { padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; }
          .premium-section-title { font-size: 1.5rem; }
          .brand-card-circle { max-width: 90px; }
        }
      `}</style>

      <div className="container-xl container-fluid pt-4">
        <div className="row">
          <div className="col-12 mt-2">
            
            

            {/* ================================================= */}
            {/* 2. MEDICINES FROM VENDOR */}
            {/* ================================================= */}
            {displayData.medicines?.length > 0 && (
              <div className="premium-section">
                <CardsCarousel 
                  autoplay={true} 
                  loop={true} 
                  mainTittle="Top Medicines" 
                  items={displayData.medicines.slice(0, 10)}
                  isMedicine={true}
                  noOfSlides={[4, 3, 2, 2, 1, 1]}
                />
              </div>
            )}
         {/* NEW IMG11 SECTION BELOW DOCTORS */}
               <section className="py-4 bg-light border-bottom">
                 <div className="container text-center">
                   <img 
                     src={img10} 
                     alt="Medical Banner" 
                     className="img-fluid rounded-4 shadow" 
                     style={{ width: '100%', maxHeight: '580px', objectFit: 'cover' }} 
                   />
                 </div>
               </section>

            {/* ================================================= */}
            {/* 3. PRODUCTS FROM VENDOR */}
            {/* ================================================= */}
            {displayData.products?.length > 0 && (
              <div className="premium-section">
                <CardsCarousel 
                  autoplay={true} 
                  loop={true} 
                  mainTittle="Healthcare Essentials" 
                  items={displayData.products.slice(0, 10)}
                  noOfSlides={[4, 3, 2, 2, 1, 1]}
                />
              </div>
            )}

        
            {/* 1. PHARMACIES NEARBY */}
            {/* ================================================= */}
            {/* <div className="premium-section">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
              <h2 className="premium-section-title">Pharmacies Nearby</h2>
              <Link to="/pharmacy-shop" className="btn-premium-outline">
                See more <i className="ri-arrow-right-line ms-2 fs-5"></i>
              </Link>
            </div>

            {sortedPharmacies.length === 0 ? (
              <div className="text-center py-5 rounded-4" style={{ backgroundColor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                <i className="ri-store-2-line text-slate-400" style={{ fontSize: '3.5rem', color: '#94a3b8' }}></i>
                <p className="mt-3 text-muted fw-medium fs-5">
                  {loading ? "Discovering nearby pharmacies..." : "No pharmacies found nearby."}
                </p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 pt-2">
                {sortedPharmacies.slice(0, visibleShops).map((shop) => (
                  <div className="col" key={shop._id}>
                    <PharmacyCard 
                      data={shop} 
                      showDistance={true}
                      userLocation={{ latitude: lat, longitude: lng }} 
                      showDistanceLimit={!!distanceLimit?.pharmacyLimit}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {sortedPharmacies.length > visibleShops && (
              <div className="text-center mt-5">
                <button className="btn-premium-outline" onClick={() => setVisibleShops(prev => prev + 4)}>
                  Load More Pharmacies <i className="ri-arrow-down-line ms-1"></i>
                </button>
              </div>
            )}
          </div> */}
            

        

          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MedicineComponent);