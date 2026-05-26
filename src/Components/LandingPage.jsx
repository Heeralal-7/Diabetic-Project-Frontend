import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../Context/Context';
import { gsap } from "gsap";
import { Spinner, Modal, Button } from 'react-bootstrap';
import img9 from "./Assets/img/horizontlBnner1.png";
import MedicineComponent from './landingpageComponents/MedicineComponent';
import img16 from "./Assets/img/img10.png";
import img17 from "./Assets/img/img11.png"; 
import img4 from "./Assets/img/DoctorImg.png";

import img10 from "./Assets/img/horizontlBnner2.png";
import img11 from "./Assets/img/horizontlBnner3.png";
import img12 from "./Assets/img/horizontlBnner4.png";
import vedio1 from "./Assets/vedios/docVedio.mp4";

// ==========================================
// 1. TESTIMONIAL CARD SLIDER
// ==========================================
const CardSlider = () => {
  const sliderRef = useRef(null);
  const animationRef = useRef(null);
  const [sliderData, setSliderData] = useState([]);
 
  const {
    carePageLoadingUser,
    careProgramDataUser,
    fetchCareProgramDataUser,
  } = useContext(MyContext);
 
  useEffect(() => {
    fetchCareProgramDataUser?.();
    // eslint-disable-next-line
  },[]);
 
  useEffect(() => {
    if (careProgramDataUser?.doctorSlider?.doctors && careProgramDataUser.doctorSlider.doctors.length > 0) {
      const processedData = careProgramDataUser.doctorSlider.doctors
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((doctor, idx) => ({
          id: doctor._id || `doctor-${idx}`,
          name: doctor.name || "Unknown Doctor",
          description: doctor.testimonial || "No testimonial available",
          city: doctor.location || "Unknown City",
          image: doctor.image?.url
            ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${doctor.image.url}`
            : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200",
          bgColor: doctor.bgColor || "#e7faf8",
          borderColor: doctor.borderColor || "success",
          number: idx + 1,
        }));
      setSliderData(processedData);
    }
  },[careProgramDataUser]);
 
  useEffect(() => {
    if (!sliderRef.current || sliderData.length === 0) return;
 
    const slider = sliderRef.current;
    const wrapper = slider.parentElement;
    const cardHeight = 150; 
    const gap = 20; 
    const totalHeight = (cardHeight + gap) * sliderData.length;
 
    gsap.set(slider, { y: 0 });
    const tl = gsap.timeline({ repeat: -1 });
 
    tl.to(slider, {
      y: -totalHeight,
      duration: sliderData.length * 3, 
      ease: "none",
      onComplete: () => { gsap.set(slider, { y: 0 }); }
    });
 
    animationRef.current = tl;
 
    const handleMouseEnter = () => tl.pause();
    const handleMouseLeave = () => tl.resume();
 
    wrapper.addEventListener('mouseenter', handleMouseEnter);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
 
    return () => {
      wrapper.removeEventListener('mouseenter', handleMouseEnter);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) animationRef.current.kill();
    };
  }, [sliderData]);
 
  const heading = careProgramDataUser?.doctorSlider?.altText || "Treat, Control & Reverse* Diabetes with our Doctor-led Program";
  const sideImageUrl = careProgramDataUser?.doctorSlider?.sideImage?.url || "";
  const sideImage = sideImageUrl ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${sideImageUrl}` : "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=700";
  const sideImageHeight = careProgramDataUser?.doctorSlider?.sideImage?.height || "700px";
 
  if (carePageLoadingUser) {
    return (
      <div className="container py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading Testimonials...</p>
      </div>
    );
  }
 
  if (sliderData.length === 0) return null;
 
  return (
    <section className="py-5 bg-white">
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="text-center mb-5">
            <h2 className="diabetic-landing-section-title">{heading}</h2>
            <div className="luxury-divider"></div>
          </div>
 
          <div className="col-md-5 d-flex justify-content-start align-items-center">
            <div className="slider-wrapper w-100" style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
              <div className="slider-fade-top" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to bottom, white, transparent)', zIndex: 10, pointerEvents: 'none' }}></div>
              <div className="slider-container" ref={sliderRef} style={{ width: '100%' }}>
                {[...sliderData, ...sliderData].map((item, index) => {
                  const actualIndex = index >= sliderData.length ? (index - sliderData.length) + 1 : index + 1;
                  return (
                    <div key={`${item.id}-${index}`} className={`slider-card border-${item.borderColor} border-1 border shadow-sm`} style={{ backgroundColor: item.bgColor, padding: '20px', borderRadius: '12px', display: 'flex', marginBottom: '20px', position: 'relative' }}>
                      <div className="card-number" style={{ position: 'absolute', right: '15px', bottom: '15px', width: '25px', height: '25px', backgroundColor: 'white', color: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '1px solid #ddd' }}>
                        {actualIndex}
                      </div>
                      <div className="card-image flex-shrink-0" style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200"; }} />
                      </div>
                      <div className="card-content ms-3 flex-grow-1">
                        <h5 className="fw-bold mb-1" style={{ color: '#3d3f96' }}>{item.name}</h5>
                        <p className="small text-muted mb-1">{item.description}</p>
                        <p className="small fw-bold text-uppercase mb-0">{item.city}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="slider-fade-bottom" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, white, transparent)', zIndex: 10, pointerEvents: 'none' }}></div>
            </div>
          </div>
 
          <div className="col-md-5 text-center mt-4 mt-md-0">
            <img src={sideImage} alt="Testimonial" className="img-fluid rounded-4 shadow-lg" style={{ maxHeight: sideImageHeight, objectFit: 'cover' }} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=700"; }} />
          </div>
        </div>
      </div>
    </section>
  );
};


// ==========================================
// 2. MAIN LANDING PAGE COMPONENT
// ==========================================

const DEFAULT_PRODUCT_IMAGE = "https://via.placeholder.com/300?text=Product";
const DEFAULT_BRAND_IMAGE = "https://via.placeholder.com/100?text=Brand";
const DEFAULT_SHOP_IMAGE = "https://via.placeholder.com/300?text=Pharmacy";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

const LandingPage = () => {
  const navigate = useNavigate();
  const {
    brands, getAllBrands,
    kitchen, getTopKitchen,
    userLocation, getUserLocation,
    getUserToken, addToCart
  } = useContext(MyContext);

  const [heroCarouselIndex, setHeroCarouselIndex] = useState(0);
  const [bannerCarouselIndex, setBannerCarouselIndex] = useState(0);
  
  // Refs for horizontal scrolling buttons
  const foodScrollRef = useRef(null);
  const brandScrollRef = useRef(null);
  const horizontalScrollRef = useRef(null); // Ref preserved

  // --- Modal States ---
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const[isProcessing, setIsProcessing] = useState(false);
  const initialDataFetchedRef = useRef(false);

  const heroImages =[
    "https://plus.unsplash.com/premium_photo-1702599120667-d86c2eb51ada?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1612215033461-f2185845eb4d?w=600&auto=format&fit=crop&q=60",
    "https://plus.unsplash.com/premium_photo-1681842883882-b5c1c9f37869?w=600&auto=format&fit=crop&q=60"
  ];
  const bannerImages =[
    "https://img.freepik.com/free-photo/team-doctors-standing-together-hospital-premises_107420-84769.jpg",
    "https://img.freepik.com/free-photo/medium-shot-middle-aged-doctor-explaining-diagnosis-via-tablet-pc_1098-19316.jpg",
    "https://img.freepik.com/free-photo/womam-customer-with-headache-pharmacy_1303-25550.jpg"
  ];

  // ===============================================
  // INITIAL DATA FETCHING (Only required APIs)
  // ===============================================
  useEffect(() => {
    if (initialDataFetchedRef.current) return;
    const fetchAllData = async () => {
      try {
        initialDataFetchedRef.current = true;
        await Promise.allSettled([
          getAllBrands && getAllBrands()
        ]);
        getUserLocation?.();
      } catch (err) {
        console.error('Error in initial fetch:', err);
      }
    };
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Fetch Food Data based on Location
  useEffect(() => {
    if (userLocation?.latitude) {
      getTopKitchen?.(userLocation, "");
    } else {
      getTopKitchen?.(null, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[userLocation?.latitude, userLocation?.longitude]);

  // ===============================================
  // SCROLL BUTTON LOGIC (Left/Right)
  // ===============================================
  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -350, behavior: 'smooth' });
  };
  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: 350, behavior: 'smooth' });
  };

  // --- Modals & Cart ---
  const confirmAddToCart = async () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    try {
      const itemId = selectedItem._id || selectedItem.Id || selectedItem.productId;
      if (addToCart) {
        await addToCart(itemId, quantity); 
        setShowBuyModal(false); 
        navigate("/pharmacy/cart"); 
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
      alert("Something went wrong while adding to cart!");
    } finally {
      setIsProcessing(false);
    }
  };

  const getImagePath = (item) => {
    const fallbackImg = DEFAULT_PRODUCT_IMAGE;
    if (!item) return fallbackImg;

    let img = item.image_url || item.image || item.productImage || (item.images && item.images[0]) || item.thumbnail;
    if (Array.isArray(img) && img.length > 0) img = img[0];
    if (img && typeof img === 'object' && img.url) img = img.url;
    if (!img || img === "null" || img === "undefined") return fallbackImg;

    const imgStr = String(img);
    if (imgStr.startsWith('http') || imgStr.startsWith('data:')) return imgStr;

    const baseUrl = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/$/, '') : "";
    return `${baseUrl}/${imgStr.replace(/^\//, '')}`;
  };

  // Carousel auto-slide controls
  useEffect(() => {
    const interval = setInterval(() => setHeroCarouselIndex((prev) => (prev + 1) % heroImages.length), 4000);
    return () => clearInterval(interval);
  },[heroImages.length]);
  
  useEffect(() => {
    const interval = setInterval(() => setBannerCarouselIndex((prev) => (prev + 1) % bannerImages.length), 5000);
    return () => clearInterval(interval);
  },[bannerImages.length]);

  const goToPrevHero = () => setHeroCarouselIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const goToNextHero = () => setHeroCarouselIndex((prev) => (prev + 1) % heroImages.length);

  const features =[
    { id: 1, title: 'One-Stop Destination for Diabetes Care', desc: 'Discover glucometers, supplements, and healthy snacks—handpicked to make diabetes management simple.', img: 'https://images.unsplash.com/photo-1599814516324-66aa0bf16425?w=600' },
    { id: 2, title: 'Trusted Healthcare Products', desc: 'Only highest-quality, tested supplies from trusted brands. Shop with confidence.', img: 'https://media.istockphoto.com/id/1311515424/photo/portrait-of-handsome-latin-man-choosing-to-buy-medicine-browsing-through-the-shelf.webp?a=1&b=1&s=612x612&w=0&k=20&c=HoruKGPOc_yUAHheDeOZsmROcQW3-uKT_M09n22aNwI=' },
    { id: 3, title: 'Home Delivery of All Essentials', desc: 'Get all your diabetes essentials delivered straight to your doorstep—uninterrupted health routine.', img: 'https://media.istockphoto.com/id/2204300725/photo/portrait-of-delivery-person-wearing-uniform-stock-photo.webp?a=1&b=1&s=612x612&w=0&k=20&c=i_-JLb-6RxQWdwFIldNkhXPS8hB4-0Z_XbO6eFjfFAQ=' }
  ];

  return (
    <div>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #ffffff; color: #1a1a2e; overflow-x: hidden; }
        .diabetic-landing-text-primary { color: #3d3f96; }
        .diabetic-landing-bg-light { background-color: #f8f9ff; }
        .diabetic-landing-bg-by-need { background: linear-gradient(125deg, #2c2e70 0%, #4245a3 100%); }
        .diabetic-landing-btn-primary { background: linear-gradient(135deg, #3d3f96 0%, #5a5db5 100%); border: none; color: white; transition: all 0.4s; box-shadow: 0 20px 30px -12px rgba(61,63,150,0.4); font-weight: 600; }
        .diabetic-landing-btn-primary:hover { background: linear-gradient(135deg, #2a2c6e 0%, #3d3f96 100%); transform: translateY(-4px); color: white; }
        .diabetic-landing-btn-outline { border: 2px solid #3d3f96; color: #3d3f96; background: transparent; transition: all 0.3s; font-weight: 600; }
        .diabetic-landing-btn-outline:hover { background: #3d3f96; color: white; transform: translateY(-3px); }
        .diabetic-landing-card { border-radius: 20px; border: 1px solid #eef2ff; transition: all 0.3s ease; background: rgba(255,255,255,0.98); overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.04); display: flex; flex-direction: column; height: 100%; }
        .diabetic-landing-card:hover { transform: translateY(-8px); box-shadow: 0 20px 35px rgba(61,63,150,0.15); border-color: #3d3f96; }
        .diabetic-landing-section-title { font-weight: 800; font-size: 2.5rem; letter-spacing: -0.02em; background: linear-gradient(125deg, #2c2e70, #3d3f96); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .diabetic-landing-hero { position: relative; background: linear-gradient(112deg, rgba(8,8,28,0.88) 0%, rgba(0,0,0,0.75) 100%), url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&h=900&fit=crop'); background-size: cover; background-position: center 35%; background-attachment: fixed; padding: 130px 0 110px; }
        .hero-carousel-img { height: 480px; object-fit: cover; border-radius: 36px; box-shadow: 0 30px 50px -15px rgba(0,0,0,0.45); }
        .banner-carousel-img { height: 580px; object-fit: cover; width: 100%; }
        .luxury-divider { width: 80px; height: 3px; background: linear-gradient(90deg, #3d3f96, #c0c2f0, #3d3f96); margin: 1.2rem auto; border-radius: 4px; }
        .diabetic-landing-card-img-top { height: 200px; object-fit: contain; width: 100%; transition: transform 0.5s ease; padding: 15px; background: #f9fafb; }
        .diabetic-landing-card:hover .diabetic-landing-card-img-top { transform: scale(1.05); }
        
        .carousel-dots { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
        .carousel-dot { width: 10px; height: 10px; border-radius: 50%; background: #cbd0ff; cursor: pointer; transition: 0.25s; }
        .carousel-dot.active { background: #3d3f96; transform: scale(1.2); box-shadow: 0 0 0 3px rgba(61,63,150,0.25); }
        .carousel-dot-dark { background: rgba(255,255,255,0.5); }
        .carousel-dot-dark.active { background: #ffffff; }
        .carousel-nav-btn { background: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 18px rgba(0,0,0,0.12); color: #3d3f96; border: none; transition: 0.25s; cursor: pointer; }
        .carousel-nav-btn:hover { background: #3d3f96; color: white; transform: scale(1.08); }
        
        /* 🚀 NATURAL SCROLLING RESTORED */
        .horizontal-scroll-container { 
            overflow-x: auto; 
            -webkit-overflow-scrolling: touch; 
            scrollbar-width: none; 
            padding-bottom: 20px;
            scroll-behavior: smooth;
        }
        .horizontal-scroll-container::-webkit-scrollbar { display: none; }
        
        .food-card { cursor: pointer; transition: transform 0.3s; }
        
        /* 🔥 BRAND CIRCLE CSS */
        .brand-circle-img { 
            width: 150px; 
            height: 150px; 
            border-radius: 50%; 
            object-fit: contain; 
            background: white; 
            padding: 20px; 
            box-shadow: 0 10px 20px rgba(0,0,0,0.05); 
            border: 1px solid #eef2ff; 
            margin: 0 auto;
            transition: border-color 0.3s ease;
        }
        .brand-circle-img:hover { border-color: #3d3f96; }
        
        .brand-item-wrapper { width: 140px; }
        @media (min-width: 992px) {
            .brand-item-wrapper {
                flex: 0 0 calc(16.666% - 1.5rem); 
                max-width: calc(16.666% - 1.5rem);
            }
        }

        /* 🏆 AWARDS SECTION - STRICTLY 400px WITH FULL SCROLL 🏆 */
        .awards-scroll-section {
            height: 400px;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none; /* Hide scrollbar for clean look */
            background-color: #f8f9ff;
        }
        .awards-scroll-section::-webkit-scrollbar { display: none; }
        .awards-slide {
            width: 100vw;
            max-width: 100vw;
            height: 100%;
            scroll-snap-align: center;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            white-space: normal;
            padding: 0 5%;
        }
        .awards-img {
            max-height: 280px;
            width: auto;
            max-width: 100%;
            object-fit: contain;
        }
        
        @media (max-width: 768px) { 
            .hero-carousel-img { height: 280px; } 
            .banner-carousel-img { height: 320px; } 
            .diabetic-landing-section-title { font-size: 2rem; } 
            .diabetic-landing-hero { padding: 80px 0 60px; background-attachment: scroll; } 
            .brand-circle-img { width: 100px; height: 100px; padding: 12px; } 
            /* Ensure awards section stays 400px and fits on mobile */
            .awards-img { max-height: 160px; } 
            .awards-slide h4 { font-size: 1.4rem !important; margin-bottom: 10px !important; }
            .awards-slide p { font-size: 0.85rem !important; line-height: 1.4; margin-bottom: 10px !important; }
        }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* 1. HERO SECTION */}
      <section className="diabetic-landing-hero" style={{ marginTop: '76px' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 mb-3 mb-lg-0">
              <span className="diabetic-landing-badge-lux mb-4 d-inline-block"><i className="fas fa-crown me-2"></i> World-Class Diabetes Care</span>
              <h1 className="display-3 fw-bold mb-3 text-white">Control Diabetes,<br /> Live <span style={{color: '#cbd0ff'}}>Limitless</span></h1>
              <p className="lead text-white mb-4">Personalized solutions, world-class endocrinologists, and medical-grade products.</p>
              <div className="d-flex flex-wrap gap-3">
                <a href="#products" className="btn diabetic-landing-btn-primary btn-lg px-5 py-3 rounded-pill">Shop Now <i className="fas fa-arrow-right ms-2"></i></a>
                <a href="#doctors" className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill">Book Consult</a>
              </div>
            </div>
            <div className="col-lg-6">
              <img src={heroImages[heroCarouselIndex]} className="d-block w-100 hero-carousel-img" alt="Hero" />
              <div className="carousel-dots mt-3">
                {heroImages.map((_, idx) => (
                  <div key={idx} className={`carousel-dot ${heroCarouselIndex === idx ? 'active' : ''}`} onClick={() => setHeroCarouselIndex(idx)}></div>
                ))}
              </div>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button className="carousel-nav-btn" onClick={goToPrevHero}><i className="fas fa-chevron-left"></i></button>
                <button className="carousel-nav-btn" onClick={goToNextHero}><i className="fas fa-chevron-right"></i></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <MedicineComponent />
      </section>

      {/* 2. TRENDING BRANDS (Circled UI) UPDATED */}
      <section className=" diabetic-landing-bg-light">
        <div className="container">
          
          {/* img12 added here - Responsive & 450px height */}
          <div className="mb-5 text-center">
             <img 
               src={img16} 
               alt="Trending Banner" 
               className="img-fluid rounded-4 shadow-sm w-100" 
               style={{ height: '580px', objectFit: 'cover' }} 
             />
          </div>

          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <h2 className="diabetic-landing-section-title">Trending <span style={{ color: '#3d3f96' }}>Brands</span></h2>
              <div className="luxury-divider" style={{ margin: '0.5rem 0' }}></div>
            </div>
            <Link to="/brands" className="btn btn-outline-primary rounded-pill d-none d-md-block">View all &rarr;</Link>
          </div>
          <div className="position-relative">
            <div ref={brandScrollRef} className="horizontal-scroll-container d-flex gap-4 pb-4 justify-content-start">
              {(brands ||[]).map((brand, idx) => (
                <div key={brand._id || idx} className="flex-shrink-0 text-center brand-item-wrapper" style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/pharmacy?brand=${brand._id}`}>
                  <img src={brand.brandImageUrl || brand.brandImage || DEFAULT_BRAND_IMAGE} className="brand-circle-img" alt={brand.brandName || brand.name} onError={(e) => e.target.src = DEFAULT_BRAND_IMAGE} />
                  <div className="mt-3 fw-bold text-truncate px-2" style={{fontSize: '1rem'}}>{brand.brandName || brand.name || "Brand"}</div>
                </div>
              ))}
            </div>
            <button className="carousel-nav-btn position-absolute start-0 top-50 translate-middle-y ms-2 shadow-lg" onClick={() => scrollLeft(brandScrollRef)}><i className="fas fa-chevron-left"></i></button>
            <button className="carousel-nav-btn position-absolute end-0 top-50 translate-middle-y me-2 shadow-lg" onClick={() => scrollRight(brandScrollRef)}><i className="fas fa-chevron-right"></i></button>
          </div>
        </div>
      </section>

      {/* 4. BANNER CAROUSEL */}
      <div className="container-fluid p-0 position-relative">
        <img src={bannerImages[bannerCarouselIndex]} className="banner-carousel-img" alt="Banner" />
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 w-100 text-center">
            <div className="carousel-dots mt-3 mb-3">
            {bannerImages.map((_, idx) => (
                <div key={idx} className={`carousel-dot carousel-dot-dark ${bannerCarouselIndex === idx ? 'active' : ''}`} onClick={() => setBannerCarouselIndex(idx)}></div>
            ))}
            </div>
        </div>
      </div>

      {/* 5. FOOD & NUTRITION (Restaurants Near You) */}
      {kitchen && kitchen.length > 0 && (
        <section className="py-5 bg-white">
          <div className="container">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <h2 className="diabetic-landing-section-title">Restaurants <span style={{ color: '#3d3f96' }}>Near You</span></h2>
                <div className="luxury-divider" style={{ margin: '0.5rem 0' }}></div>
              </div>
              <Link to="/all-meals" className="btn btn-outline-primary rounded-pill d-none d-md-block">Explore Food &rarr;</Link>
            </div>
            <div className="position-relative">
              <div ref={foodScrollRef} className="horizontal-scroll-container d-flex gap-4 pb-4">
                {kitchen.map((vendor, idx) => {
                  let dist = vendor.distance || vendor.distance?.value;
                  if (!dist && userLocation && vendor.location?.coordinates) {
                    dist = calculateDistance(userLocation.latitude, userLocation.longitude, vendor.location.coordinates[1], vendor.location.coordinates[0]);
                  }
                  
                  let vendorImg = vendor.image;
                  if (Array.isArray(vendorImg)) vendorImg = vendorImg[0];
                  if (vendorImg && typeof vendorImg === 'object' && vendorImg.url) vendorImg = vendorImg.url;
                  
                  let vendorImage = DEFAULT_SHOP_IMAGE;
                  if (vendorImg && typeof vendorImg === 'string' && vendorImg !== "null" && vendorImg !== "undefined") {
                      if(vendorImg.startsWith('http') || vendorImg.startsWith('data:')) {
                          vendorImage = vendorImg;
                      } else {
                          const baseUrl = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/$/, '') : "";
                          vendorImage = `${baseUrl}/${vendorImg.replace(/^\//, '')}`;
                      }
                  }

                  return (
                    <div key={vendor._id || idx} className="food-card flex-shrink-0" style={{ width: '280px' }} onClick={() => window.location.href = `/shop/FoodAndNurition/Products/${vendor._id}`}>
                      <div className="diabetic-landing-card h-100 p-0 border-0 border">
                        <div className="position-relative">
                          <img src={vendorImage} className="w-100" style={{ height: '180px', objectFit:'cover' }} alt={vendor.name} onError={(e) => e.target.src = DEFAULT_SHOP_IMAGE} />
                          {dist !== null && dist !== undefined && !isNaN(dist) && (
                            <span className="badge bg-success position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow"><i className="fas fa-route me-1"></i>{Number(dist).toFixed(1)} km</span>
                          )}
                        </div>
                        <div className="p-4 d-flex flex-column flex-grow-1">
                          <h6 className="fw-bold mb-1 text-truncate">{vendor.name || "Restaurant"}</h6>
                          <p className="small text-muted text-truncate mb-3"><i className="fas fa-map-marker-alt me-1 text-danger"></i> {vendor.address || vendor.city || "Address not available"}</p>
                          <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                            <span className="text-success small fw-bold">Available</span>
                            <button className="btn btn-sm btn-warning rounded-pill px-3 fw-bold" onClick={(e) => { e.stopPropagation(); window.location.href = `/food-shop/rating/${vendor._id}`; }}>Rate</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="carousel-nav-btn position-absolute start-0 top-50 translate-middle-y ms-2 shadow-lg" onClick={() => scrollLeft(foodScrollRef)}><i className="fas fa-chevron-left"></i></button>
              <button className="carousel-nav-btn position-absolute end-0 top-50 translate-middle-y me-2 shadow-lg" onClick={() => scrollRight(foodScrollRef)}><i className="fas fa-chevron-right"></i></button>
            </div>
          </div>
        </section>
      )}

      {/* 6. DOCTORS SECTION */}
      <section id="doctors" className="py-5 bg-white border-top">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="diabetic-landing-section-title">World‑Class <span style={{ color: '#3d3f96' }}>Doctors</span></h2>
            <div className="luxury-divider"></div>
            <p className="text-muted mt-3">Recognized specialists from global diabetes institutes</p>
          </div>
          <div className="row g-4 align-items-center">
            <div className="col-lg-4">
              <div className="bg-light p-4 rounded-4 shadow-sm border" style={{ borderLeft: '6px solid #3d3f96 !important' }}>
                <i className="fas fa-clinic-medical fa-2x diabetic-landing-text-primary mb-3"></i>
                <h3 className="fw-bold mb-3">DiabeticWala <span className="text-primary">Clinics</span></h3>
                <p className="text-muted">Premium centers with cutting-edge diabetic care, 24/7 teleconsultation, and advanced metabolic wellness programs.</p>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="row">
                {[
                  { name: "Dr. Ankit Sharma", specialty: "Endocrinologist", img: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.5 },
                  { name: "Dr. Neha Verma", specialty: "Diabetologist", img: "https://randomuser.me/api/portraits/women/44.jpg", rating: 5 },
                  { name: "Dr. Rohan Iyer", specialty: "Cardio-diabetic", img: "https://randomuser.me/api/portraits/men/75.jpg", rating: 5 }
                ].map((doc, i) => (
                  <div className="col-md-4 mb-4 text-center" key={i}>
                    <img src={doc.img} className="rounded-circle mb-3 shadow" style={{ width: '140px', height: '140px', objectFit: 'cover', border: '5px solid #eef2ff' }} alt={doc.name} />
                    <h5 className="fw-bold">{doc.name}</h5>
                    <p className="text-muted small">{doc.specialty}</p>
                    <div className="mb-3">{Array(5).fill().map((_, i) => <i key={i} className={`fas fa-star ${i < Math.floor(doc.rating) ? 'text-warning' : 'far fa-star text-warning'}`}></i>)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW IMG11 SECTION BELOW DOCTORS */}
      <section className="py-4 bg-light border-bottom">
        <div className="container-fluid text-center">
          <img 
            src={img17} 
            alt="Medical Banner" 
            className="img-fluid rounded-4 shadow" 
            style={{ width: '100%', maxHeight: '580px', objectFit: 'cover' }} 
          />
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <CardSlider />

      {/* 8. WHY CHOOSE US */}
      <div className="container-fluid py-5 bg-white">
        <div className="container">
          <h2 className="diabetic-landing-section-title text-center mb-5">Why Choose <span style={{ color: '#3d3f96' }}>Diabetic Wala</span></h2>
          <div className="row g-4">
            {features.map(f => (
              <div className="col-md-4" key={f.id}>
                <div className="diabetic-landing-card h-100 border-0 p-0 shadow">
                  <img src={f.img} className="card-img-top w-100" style={{ height: '260px', objectFit: 'cover' }} alt={f.title} />
                  <div className="p-4 flex-grow-1" style={{ backgroundColor: '#3d3f96' }}>
                    <h5 className="text-white fw-bold mb-3">{f.title}</h5>
                    <p className="text-white-50 mb-0 small" style={{ lineHeight: '1.6' }}>{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* 🏆 HORIZONTAL SCROLL SECTION (Natively scrollable, fixed 400px height) 🏆 */}
      <section className="awards-scroll-section position-relative" ref={horizontalScrollRef}>
        <div className="d-flex h-100 align-items-center" style={{ width: 'max-content' }}>
          
          {/* SLIDE 1 */}
          <div className="awards-slide container">
            <div className="row w-100 align-items-center mx-0 flex-md-row flex-column-reverse">
              <div className="col-md-6 px-2 px-md-4 text-center text-md-start">
                <h4 className="fw-bold display-6 mb-2" style={{ color: "#141414" }}>
                  Awards and <br className="d-md-block d-none" /> Recognitions
                </h4>
                <p className="text-muted fst-italic fw-semibold" style={{ fontSize: '1rem' }}>
                  DiabetesWala was awarded the National Startup Award 2021 in the Healthcare category by Prime Minister Narendra Modi for bringing access to healthcare to India. Recently, Dr Navneet Agrawal, our Chief Clinical Officer, was awarded the Diabetologist of the Year (National Winner)-2023.
                </p>
              </div>
              <div className="col-md-6 text-center mb-3 mb-md-0" style={{ maxHeight: '380px' }}>
                <img src={img9} className="awards-img"  loading="lazy" alt="DiabetesWala National Startup Award Winner 2021" />
              </div>
            </div>
          </div>

          {/* SLIDE 2 */}
          <div className="awards-slide container">
            <div className="row w-100 align-items-center mx-0 flex-md-row flex-column-reverse">
              <div className="col-md-6 px-2 px-md-4 text-center text-md-start">
                <h4 className="fw-bold display-6 mb-2" style={{ color: "#141414" }}>
                  DiabetesWala <br className="d-md-block d-none" /> featured on BBC World News
                </h4>
                <p className="text-muted fst-italic fw-semibold" style={{ fontSize: '1rem' }}>
                  In their exclusive story on diabetes the BBC World News covered a Diabetes Awareness Camp organized by DiabetesWala
                </p>
                <div className="mt-2">
                  <button className="btn rounded-pill border-0 bg-primary-subtle px-4 fw-bold text-primary">
                    Watch on Youtube
                  </button>
                </div>
              </div>
              <div className="col-md-6 text-center mb-3 mb-md-0">
                <img src={img10} className="awards-img" loading="lazy" alt="News Channel" />
              </div>
            </div>
          </div>

          {/* SLIDE 3 */}
          <div className="awards-slide container">
            <div className="row w-100 align-items-center mx-0 flex-md-row flex-column-reverse">
              <div className="col-md-6 px-2 px-md-4 text-center text-md-start">
                <h4 className="fw-bold display-6 mb-2" style={{ color: "#141414" }}>
                  Consult top <br className="d-md-block d-none" /> diabetologists
                </h4>
                <p className="text-muted fst-italic fw-semibold" style={{ fontSize: '1rem' }}>
                  Get access to India's top diabetes doctors. Our medical team is led by National Award winner Diabetologist. Experience high quality care via video consultations. DiabetesWala’s doctors are committed to support you in your treatment for diabetes.
                </p>
                <div className="mt-2">
                  <button className="btn rounded-pill border-0 bg-primary-subtle px-4 fw-bold text-primary">
                    Watch on Youtube
                  </button>
                </div>
              </div>
              <div className="col-md-6 text-center mb-3 mb-md-0">
                <img src={img11} className="awards-img" loading="lazy" alt="Doctors" />
              </div>
            </div>
          </div>

          {/* SLIDE 4 */}
          <div className="awards-slide container">
            <div className="row w-100 align-items-center mx-0 flex-md-row flex-column-reverse">
              <div className="col-md-6 px-2 px-md-4 text-center text-md-start">
                <h4 className="fw-bold display-6 mb-2" style={{ color: "#141414" }}>
                  Complete health plans <br className="d-md-block d-none" /> with our specialized subscription
                </h4>
                <p className="text-muted fst-italic fw-semibold" style={{ fontSize: '1rem' }}>
                  Get access to India's top diabetes doctors. Our medical team is led by National Award winner Diabetologist. Experience high quality care via video consultations. DiabetesWala’s doctors are committed to support you in your treatment for diabetes.
                </p>
                <div className="mt-2">
                  <button className="btn rounded-pill border-0 bg-primary-subtle px-4 fw-bold text-primary">
                    Watch on Youtube
                  </button>
                </div>
              </div>
              <div className="col-md-6 text-center mb-3 mb-md-0">
                <img src={img12} className="awards-img" loading="lazy" alt="Plans" />
              </div>
            </div>
          </div>

        </div>

        {/* Swipe instruction for Desktop users (optional UX enhancement) */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 text-muted small d-none d-md-block" style={{ pointerEvents: 'none', opacity: 0.7 }}>
          <i className="fas fa-arrows-alt-h me-2"></i> Scroll horizontally to see more
        </div>
      </section>
      {/* horizontal scroll section end */}


      {/* ADD TO CART MODAL */}
      <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)} centered size="md">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5" style={{ color: '#3d3f96' }}>Add to Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {selectedItem && (
            <div className="d-flex align-items-center gap-4">
              <div className="bg-light p-2 rounded-4 border shadow-sm" style={{ width: '100px', height: '100px', flexShrink: 0 }}>
                <img src={getImagePath(selectedItem)} alt={selectedItem.name} className="w-100 h-100 object-fit-contain rounded-3" onError={(e) => e.target.src = DEFAULT_PRODUCT_IMAGE} />
              </div>
              <div className="w-100">
                <h6 className="fw-bold mb-1">{selectedItem.name || 'Product'}</h6>
                <div className="text-success fw-bold fs-5 mb-3">
                  ₹{parseFloat(selectedItem.best_price || selectedItem.salePrice || selectedItem.price || selectedItem.mrp || 0).toFixed(2)}
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted small fw-bold">Qty:</span>
                  <div className="d-flex align-items-center border rounded-pill overflow-hidden">
                    <button className="btn btn-light rounded-0 px-3 fw-bold" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span className="px-3 fw-bold bg-white">{quantity}</span>
                    <button className="btn btn-light rounded-0 px-3 fw-bold" onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-white">
          <Button variant="light" onClick={() => setShowBuyModal(false)} className="rounded-pill px-4 fw-bold shadow-sm">Cancel</Button>
          <Button variant="primary" onClick={confirmAddToCart} disabled={isProcessing} className="diabetic-landing-btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2">
            {isProcessing ? <Spinner size="sm" animation="border" /> : <i className="fas fa-shopping-cart"></i>}
            {isProcessing ? "Adding..." : "Confirm & Add"}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default LandingPage;