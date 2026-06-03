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
import PremiumDoctorSection from './HomePageDoctor';
import LabNearMe from './LabNearMe';

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
  }, []);

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
          bgColor: doctor.bgColor || "#ffffff",
          borderColor: doctor.borderColor || "success",
          number: idx + 1,
        }));
      setSliderData(processedData);
    }
  }, [careProgramDataUser]);

  useEffect(() => {
    if (!sliderRef.current || sliderData.length === 0) return;

    const slider = sliderRef.current;
    const wrapper = slider.parentElement;

    // PERFECT MATH FOR GSAP TO SLIDE PROPERLY
    const cardHeight = 180; // Fixed height defined in CSS
    const gap = 24;         // Margin bottom defined in CSS
    const totalHeight = (cardHeight + gap) * sliderData.length;

    gsap.set(slider, { y: 0 });
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(slider, {
      y: -totalHeight,
      duration: sliderData.length * 3.5,
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
        <Spinner animation="border" style={{ color: '#0A66C2' }} />
        <p className="mt-3 fw-bold text-muted">Loading Testimonials...</p>
      </div>
    );
  }

  if (sliderData.length === 0) return null;

  return (
    <section className="testimonial-modern-section py-5">
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="text-center mb-5">
            <h2 className="diabetic-landing-section-title" style={{ color: '#04102A' }}>{heading}</h2>
            <div className="luxury-divider" style={{ background: 'linear-gradient(90deg, transparent, #0A66C2, #38bdf8, transparent)' }}></div>
          </div>

          <div className="col-lg-5 col-md-6 d-flex justify-content-start align-items-center mb-4 mb-md-0">
            <div className="slider-wrapper w-100" style={{ position: 'relative', height: '540px', overflow: 'hidden', padding: '15px' }}>
              <div className="slider-fade-top" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to bottom, #FAFCFF, transparent)', zIndex: 10, pointerEvents: 'none' }}></div>

              <div className="slider-container" ref={sliderRef} style={{ width: '100%', paddingTop: '10px' }}>
                {[...sliderData, ...sliderData].map((item, index) => {
                  const actualIndex = index >= sliderData.length ? (index - sliderData.length) + 1 : index + 1;
                  return (
                    <div key={`${item.id}-${index}`} className="testimonial-modern-card">
                      <div className="testimonial-quote"><i className="fas fa-quote-right"></i></div>
                      <div className="t-badge-num">{actualIndex}</div>

                      <div className="testimonial-image-ring">
                        <img src={item.image} alt={item.name} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200"; }} />
                      </div>

                      <div className="ms-4 position-relative z-1 flex-grow-1">
                        <h5 className="t-name">{item.name}</h5>
                        <p className="t-desc">"{item.description}"</p>
                        <span className="t-city"><i className="fas fa-map-marker-alt me-1"></i> {item.city}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="slider-fade-bottom" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, #FAFCFF, transparent)', zIndex: 10, pointerEvents: 'none' }}></div>
            </div>
          </div>

          <div className="col-lg-6 col-md-6 text-center ps-lg-5">
            <div className="side-img-wrapper">
              <div className="side-img-backdrop"></div>
              <img src={sideImage} alt="Testimonial" className="img-fluid side-img-actual w-100" style={{ maxHeight: '530px', objectFit: 'cover' }} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=700"; }} />
            </div>
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
  const [isProcessing, setIsProcessing] = useState(false);
  const initialDataFetchedRef = useRef(false);

  // Arrays Setup
  const heroImages = [
    "https://plus.unsplash.com/premium_photo-1702599120667-d86c2eb51ada?w=600&auto=format&fit=crop&q=60",
    "https://plus.unsplash.com/premium_photo-1681843126728-04eab730febe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D",
    "https://plus.unsplash.com/premium_photo-1661306457973-31f717a7b215?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZG9jdG9yJTIwZGlhYmV0aWN8ZW58MHx8MHx8fDA%3D",
    "https://plus.unsplash.com/premium_photo-1681842883882-b5c1c9f37869?w=600&auto=format&fit=crop&q=60"
  ];

  const bannerImages = [
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
  }, []);

  // Fetch Food Data based on Location
  useEffect(() => {
    if (userLocation?.latitude) {
      getTopKitchen?.(userLocation, "");
    } else {
      getTopKitchen?.(null, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation?.latitude, userLocation?.longitude]);

  // ===============================================
  // SCROLL BUTTON LOGIC (Left/Right)
  // ===================================~============
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
  }, [heroImages.length]);

  useEffect(() => {
    const interval = setInterval(() => setBannerCarouselIndex((prev) => (prev + 1) % bannerImages.length), 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const goToPrevHero = () => setHeroCarouselIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const goToNextHero = () => setHeroCarouselIndex((prev) => (prev + 1) % heroImages.length);

  const features = [
    { id: 1, title: 'One-Stop Destination for Diabetes Care', desc: 'Discover glucometers, supplements, and healthy snacks—handpicked to make diabetes management simple.', img: 'https://images.unsplash.com/photo-1599814516324-66aa0bf16425?w=600' },
    { id: 2, title: 'Trusted Healthcare Products', desc: 'Only highest-quality, tested supplies from trusted brands. Shop with confidence.', img: 'https://media.istockphoto.com/id/1311515424/photo/portrait-of-handsome-latin-man-choosing-to-buy-medicine-browsing-through-the-shelf.webp?a=1&b=1&s=612x612&w=0&k=20&c=HoruKGPOc_yUAHheDeOZsmROcQW3-uKT_M09n22aNwI=' },
    { id: 3, title: 'Home Delivery of All Essentials', desc: 'Get all your diabetes essentials delivered straight to your doorstep—uninterrupted health routine.', img: 'https://media.istockphoto.com/id/2204300725/photo/portrait-of-delivery-person-wearing-uniform-stock-photo.webp?a=1&b=1&s=612x612&w=0&k=20&c=i_-JLb-6RxQWdwFIldNkhXPS8hB4-0Z_XbO6eFjfFAQ=' }
  ];

  return (
    <div>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #ffffff; color: #1a1a2e; overflow-x: hidden; }
        .diabetic-landing-text-primary { color: #939498; font-size:70px !important; }
        .diabetic-landing-bg-light { background-color: #f8f9ff; }
        .diabetic-landing-bg-by-need { background: linear-gradient(125deg, #2c2e70 0%, #4245a3 100%); }
        .diabetic-landing-btn-primary { background: linear-gradient(135deg, #3d3f96 0%, #5a5db5 100%); border: none; color: white; transition: all 0.4s; box-shadow: 0 20px 30px -12px rgba(61,63,150,0.4); font-weight: 600; }
        .diabetic-landing-btn-primary:hover { background: linear-gradient(135deg, #2a2c6e 0%, #3d3f96 100%); transform: translateY(-4px); color: white; }
        .diabetic-landing-btn-outline { border: 2px solid #3d3f96; color: #3d3f96; background: transparent; transition: all 0.3s; font-weight: 600; }
        .diabetic-landing-btn-outline:hover { background: #3d3f96; color: white; transform: translateY(-3px); }
        .diabetic-landing-section-title { font-weight: 800; font-size: 2.5rem; letter-spacing: -0.02em; background: linear-gradient(125deg, #2c2e70, #3d3f96); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .luxury-divider { width: 80px; height: 3px; background: linear-gradient(90deg, #3d3f96, #c0c2f0, #3d3f96); margin: 1.2rem auto; border-radius: 4px; }
        
        .carousel-dots { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
        .carousel-dot { width: 10px; height: 10px; border-radius: 50%; background: #cbd0ff; cursor: pointer; transition: 0.25s; }
        .carousel-dot.active { background: #3d3f96; transform: scale(1.2); box-shadow: 0 0 0 3px rgba(61,63,150,0.25); }
        .carousel-nav-btn { background: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 18px rgba(0,0,0,0.12); color: #3d3f96; border: none; transition: 0.25s; cursor: pointer; z-index: 10; }
        .carousel-nav-btn:hover { background: #3d3f96; color: white; transform: scale(1.08); }
        
        /* 🚀 NATURAL SCROLLING RESTORED */
        .horizontal-scroll-container { 
            overflow-x: auto; 
            -webkit-overflow-scrolling: touch; 
            scrollbar-width: none; 
            padding-bottom: 30px;
            scroll-behavior: smooth;
        }
        .horizontal-scroll-container::-webkit-scrollbar { display: none; }
        
        /* 🔥 PREMIUM BRANDS SECTION CSS (GLASSMORPHISM & PARALLAX) */
        .trending-brands-parallax {
            position: relative;
            background: url('https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=1920&auto=format&fit=crop&q=80') center center / cover no-repeat;
            background-attachment: fixed;
            padding: 120px 0;
            overflow: hidden;
            margin: 40px 0;
        }
        .trending-brands-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, rgba(4, 16, 42, 0.9) 0%, rgba(10, 102, 194, 0.85) 100%);
            z-index: 1;
        }
        .trending-content-z {
            position: relative;
            z-index: 2;
        }
        .premium-glass-brand-card {
            width: 180px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 24px;
            padding: 25px 15px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            text-decoration: none;
            height: 100%;
        }
        .premium-glass-brand-card:hover {
            transform: translateY(-10px);
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 15px 40px rgba(0,0,0,0.25);
        }
        .glass-brand-circle { 
            width: 100px; 
            height: 100px; 
            border-radius: 50%; 
            object-fit: contain; 
            background: rgba(255, 255, 255, 0.95); 
            padding: 15px; 
            margin-bottom: 18px;
            border: 2px solid transparent; 
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .premium-glass-brand-card:hover .glass-brand-circle {
            background: #ffffff;
            transform: scale(1.08);
            box-shadow: 0 10px 25px rgba(56, 189, 248, 0.4);
            border-color: #38bdf8;
        }
        .glass-brand-name {
            font-weight: 700;
            color: #ffffff;
            font-size: 1rem;
            text-align: center;
            width: 100%;
            transition: color 0.3s;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .premium-glass-brand-card:hover .glass-brand-name {
            color: #38bdf8;
        }
        
        .brand-section-header-glass { font-weight: 800; font-size: 2.8rem; color: #ffffff; letter-spacing: -0.5px; }
        .brand-section-header-glass span { color: #38bdf8; }
        .glass-view-btn {
            border: 2px solid rgba(255,255,255,0.3); color: #ffffff; background: rgba(255,255,255,0.1); 
            padding: 10px 28px; border-radius: 30px; font-weight: 600; 
            transition: all 0.3s; backdrop-filter: blur(5px); text-decoration: none;
        }
        .glass-view-btn:hover {
            border-color: #38bdf8; background: #38bdf8; color: #04102A; 
            transform: translateY(-2px); box-shadow: 0 8px 20px rgba(56,189,248,0.3);
        }
        .glass-nav-btn {
            background: rgba(255, 255, 255, 0.15); width: 44px; height: 44px; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            box-shadow: 0 8px 20px rgba(0,0,0,0.15); color: #ffffff; border: 1px solid rgba(255,255,255,0.3); 
            transition: 0.3s; cursor: pointer; z-index: 10; backdrop-filter: blur(10px);
        }
        .glass-nav-btn:hover {
            background: #38bdf8; color: #04102A; border-color: #38bdf8; transform: scale(1.1); 
        }

        /* ==========================================
           EXACT DESIGN - CONTAINER FLUID HERO SECTION CSS
           ========================================== */
        .hero-section-fluid {
            position: relative;
            width: 100%;
            background-color: #06152a; /* Exact dark navy from image */
            padding: 80px 0 120px;
            overflow: hidden;
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        /* The sweeping curved lighter background layer */
        .hero-section-fluid::before {
            content: '';
            position: absolute;
            top: -20%;
            left: -10%;
            width: 75%;
            height: 140%;
            background: radial-gradient(circle at 40% 40%, rgba(13, 62, 128, 0.5) 0%, transparent 60%);
            border-radius: 50%;
            z-index: 0;
            pointer-events: none;
        }

        .hero-dots-bg {
            position: absolute;
            top: 50px; right: 50px;
            width: 250px; height: 150px;
            background-image: radial-gradient(rgba(255,255,255,0.15) 2px, transparent 2px);
            background-size: 20px 20px;
            z-index: 0;
        }

        .hero-content-z {
            position: relative;
            z-index: 3;
            max-width: 1300px;
            margin: 0 auto;
        }

        .hero-badge-pill {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #94a3b8;
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 0.85rem;
            display: inline-flex;
            align-items: center;
            font-weight: 500;
            backdrop-filter: blur(5px);
        }
        .hero-badge-icon { color: #29b6f6; margin-right: 8px; }

        .hero-title-dark {
            color: #ffffff;
            font-weight: 900;
            font-size: 2.9rem;
            line-height: 1.1;
            letter-spacing: -1px;
        }
        .hero-text-highlight { color: #29b6f6; } 

        .hero-subtitle-dark {
            color: #cbd5e1;
            font-size: 1rem;
            line-height: 1.6;
            max-width: 90%;
            font-weight: 400;
        }

        .hero-btn-blue {
            background-color: #0e6ecc;
            color: white;
            border-radius: 30px;
            padding: 12px 32px;
            font-weight: 600;
            font-size: 0.95rem;
            border: none;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-flex; align-items: center; gap: 8px;
        }
        .hero-btn-blue:hover { background-color: #0b5aa6; color: white; }

        .hero-btn-outline {
            background-color: transparent;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 30px;
            padding: 12px 32px;
            font-weight: 600;
            font-size: 0.95rem;
            text-decoration: none;
            transition: all 0.3s;
        }
        .hero-btn-outline:hover { background-color: rgba(255, 255, 255, 0.1); color: white; border-color: white; }

        .hero-trust-box { display: flex; align-items: center; gap: 12px; }
        .hero-icon-blue-bg { 
            background-color: #0a2542; 
            color: #29b6f6; 
            width: 45px; height: 45px; 
            border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            font-size: 1.1rem; 
        }
        .hero-icon-green-bg { 
            background-color: #06322e; 
            color: #00d289; 
            width: 45px; height: 45px; 
            border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            font-size: 1.1rem; 
        }
        
        .hero-trust-title { color: white; font-weight: 700; font-size: 0.9rem; margin: 0; }
        .hero-trust-sub { color: #64748b; font-size: 0.8rem; margin: 0; }

        /* Exactly matching image frame styling */
        .hero-image-frame {
            position: relative;
            background: #ffffff;
            padding: 8px;
            border-radius: 28px;
            display: inline-block;
            width: 100%;
            max-width: 600px;
            z-index: 4;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        }
        .hero-img-inner {
            width: 100%;
            height: 420px;
            object-fit: cover;
            border-radius: 20px;
            display: block;
        }

        .hero-float-card {
            position: absolute;
            background: #ffffff;
            padding: 12px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            z-index: 10;
            animation: float-animation 3s ease-in-out infinite;
        }
        .float-tr { top: 30px; right: -40px; }
        .float-bl { bottom: 30px; left: -40px; }
        
        .fc-icon-green { background: #e0f8ee; color: #00d289; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; }
        .fc-icon-blue { background: #e3f2fd; color: #29b6f6; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; }
        .fc-title { color: #0F172A; font-weight: 800; font-size: 0.85rem; margin: 0; line-height: 1.2; }
        .fc-sub { color: #94a3b8; font-size: 0.7rem; margin: 0; font-weight: 500; }

        /* Navigation under the image */
        .hero-carousel-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            margin-top: 25px;
        }
        .hero-nav-circle {
            background: rgba(255,255,255,0.1);
            color: #94a3b8;
            width: 32px; height: 32px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            border: none;
            transition: 0.3s;
            cursor: pointer;
        }
        .hero-nav-circle:hover { background: rgba(255,255,255,0.2); color: white; }
        .hero-dots-container { display: flex; gap: 8px; }
        .h-dot-item { 
            width: 8px; height: 8px; 
            border-radius: 50%; 
            background: #334155; 
            cursor: pointer; 
            transition: 0.3s; 
        }
        .h-dot-item.active { background: #29b6f6; transform: scale(1.2); }
        
        /* ==========================================
           TESTIMONIAL PREMIUM DESIGN CSS 
           ========================================== */
        .testimonial-modern-section {
            background-color: #FAFCFF;
            border-top: 1px solid #eef2ff;
            border-bottom: 1px solid #eef2ff;
        }
        .testimonial-modern-card {
            background: #ffffff;
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 24px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            position: relative;
            display: flex;
            align-items: center;
            height: 180px; 
            transition: all 0.3s ease;
        }
        .testimonial-modern-card:hover {
            box-shadow: 0 15px 40px rgba(10, 102, 194, 0.1);
            border-color: #0A66C2;
            transform: translateY(-3px);
        }
        .testimonial-image-ring {
            width: 80px; height: 80px; border-radius: 50%;
            padding: 3px; background: linear-gradient(135deg, #0A66C2, #38bdf8);
            flex-shrink: 0;
            box-shadow: 0 8px 20px rgba(10, 102, 194, 0.2);
        }
        .testimonial-image-ring img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 3px solid white; }
        .testimonial-quote { position: absolute; right: 20px; top: 15px; font-size: 4rem; color: #f1f5f9; line-height: 1; z-index: 0; pointer-events: none; }
        .t-badge-num {
            position: absolute; left: -12px; top: -12px; 
            background: linear-gradient(135deg, #0A66C2, #38bdf8); color: white; 
            width: 36px; height: 36px;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-weight: 800; font-size: 1rem; border: 3px solid #ffffff;
            box-shadow: 0 4px 10px rgba(10, 102, 194, 0.3); z-index: 5;
        }
        .t-name { font-weight: 800; color: #04102A; font-size: 1.15rem; margin-bottom: 6px; }
        .t-desc { 
            color: #64748B; font-size: 0.95rem; line-height: 1.5; margin-bottom: 8px; font-style: italic; 
            display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
        }
        .t-city { color: #0A66C2; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; display: inline-flex; align-items: center; background: #f0f9ff; padding: 4px 12px; border-radius: 20px; }
        .side-img-wrapper { position: relative; z-index: 1; padding: 15px; }
        .side-img-backdrop { position: absolute; top: -5px; right: -5px; bottom: 35px; left: 35px; background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); border-radius: 35px; z-index: -1; }
        .side-img-actual { border-radius: 30px; box-shadow: 0 25px 50px rgba(4, 16, 42, 0.1); border: 8px solid white; }

        /* ==========================================
           RESTAURANTS NEAR YOU - HORIZONTAL CARDS CSS
           ========================================== */
        .view-all-link { color: #0A66C2; font-weight: 700; font-size: 0.95rem; text-decoration: none; transition: 0.3s; }
        .view-all-link:hover { color: #0855a3; text-decoration: underline; }
        .premium-restaurant-card {
            background: #ffffff; border-radius: 20px; padding: 12px; border: 1px solid #e2e8f0;
            box-shadow: 0 8px 20px rgba(0,0,0,0.03); display: flex; flex-direction: row; align-items: center;
            transition: all 0.3s ease; height: 100%; cursor: pointer;
        }
        .premium-restaurant-card:hover { box-shadow: 0 15px 35px rgba(10, 102, 194, 0.1); border-color: #0A66C2; transform: translateY(-3px); }
        .pr-img-wrapper { width: 150px; height: 120px; border-radius: 14px; overflow: hidden; position: relative; flex-shrink: 0; }
        .pr-img { width: 100%; height: 100%; object-fit: cover; }
        .pr-badge-top-right { position: absolute; top: 8px; right: 8px; background: #10B981; color: white; padding: 4px 8px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
        .pr-content { padding-left: 15px; display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; }
        .pr-title { font-weight: 800; color: #0F172A; font-size: 1.05rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pr-meta { color: #64748B; font-size: 0.8rem; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pr-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
        .pr-tag { background: #DCFCE7; color: #16A34A; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
        .pr-action-btn { background: transparent; border: 1px solid #E2E8F0; color: #0F172A; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; transition: 0.3s; }
        .pr-action-btn:hover { background: #F8FAFC; border-color: #CBD5E1; }

        /* ==========================================
           DOCTORS PREMIUM DESIGN CSS
           ========================================== */
        .doctors-section-bg { background-color: #FAFCFF; }
        .clinic-highlight-card {
            background: linear-gradient(135deg, rgba(4, 16, 42, 0.95) 0%, rgba(10, 102, 194, 0.95) 100%);
            border-radius: 28px; padding: 40px 30px; color: white; box-shadow: 0 20px 40px rgba(10, 102, 194, 0.2);
            height: 100%; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden;
        }
        .clinic-highlight-card::before { content: ''; position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; filter: blur(20px); }
        .premium-doctor-card {
            background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 24px; padding: 30px 15px; text-align: center;
            box-shadow: 0 10px 30px rgba(4, 16, 42, 0.05); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            height: 100%; display: flex; flex-direction: column; align-items: center;
        }
        .premium-doctor-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(10, 102, 194, 0.12); background: rgba(255, 255, 255, 0.9); border-color: #e0f2fe; }
        .doctor-img-ring { width: 120px; height: 120px; border-radius: 50%; padding: 4px; background: linear-gradient(135deg, #e0f2fe, #38bdf8); margin-bottom: 20px; transition: all 0.3s ease; }
        .premium-doctor-card:hover .doctor-img-ring { background: linear-gradient(135deg, #0A66C2, #38bdf8); transform: scale(1.05); }
        .doctor-img-ring img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 3px solid white; }
        .doc-name { font-weight: 800; color: #04102A; font-size: 1.15rem; margin-bottom: 8px; }
        .doc-specialty { color: #0A66C2; font-size: 0.85rem; font-weight: 600; background: #f0f9ff; padding: 6px 14px; border-radius: 20px; display: inline-block; margin-bottom: 15px; }
        .doc-rating { background: #fffbeb; padding: 6px 14px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px; }
            
        /* ==========================================
           🚀 NEW SECTION: LEFT IMAGE / RIGHT CONTENT
           ========================================== */
        .premium-split-section { position: relative; overflow: hidden; }
        .split-img-wrapper { position: relative; z-index: 1; padding: 20px; }
        .split-bg-shape { 
            position: absolute; top: 0; left: 0; width: 80%; height: 80%; 
            background: linear-gradient(135deg, #e0f2fe, #bae6fd); 
            border-radius: 30px; z-index: -1; transform: rotate(-5deg); 
        }
        .split-img { 
            width: 100%; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
            position: relative; z-index: 2; border: 8px solid white; 
            object-fit: cover; height: 480px; 
        }
        .floating-glass-card { 
            position: absolute; bottom: 40px; right: -20px; 
            background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); 
            padding: 15px 25px; border-radius: 16px; 
            box-shadow: 0 15px 35px rgba(0,0,0,0.1); z-index: 3; 
            border: 1px solid rgba(255,255,255,0.5); 
            animation: float-animation 3s ease-in-out infinite; 
        }
        .glass-icon-box { 
            width: 45px; height: 45px; background: #ffe4e6; border-radius: 12px; 
            display: flex; align-items: center; justify-content: center; font-size: 1.2rem; 
        }
        .check-list-item { 
            display: flex; align-items: center; gap: 12px; margin-bottom: 15px; 
            font-size: 1.05rem; color: #04102A; font-weight: 600; 
        }
        .check-list-item i { color: #10B981; font-size: 1.2rem; }
        @keyframes float-animation { 
            0% { transform: translateY(0px); } 
            50% { transform: translateY(-10px); } 
            100% { transform: translateY(0px); } 
        }

        /* ==========================================
           1st PARALLAX SECTION (STATS)
           ========================================== */
        .parallax-stats-section {
            position: relative;
            background: url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920&auto=format&fit=crop&q=80') center center / cover no-repeat;
            background-attachment: fixed;
            padding: 80px 0;
            margin: 40px 0;
        }
        .parallax-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, rgba(4, 16, 42, 0.9) 0%, rgba(10, 102, 194, 0.8) 100%);
            z-index: 1;
        }
        .stat-glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 30px 20px;
            border-radius: 20px;
            text-align: center;
            color: white;
            transition: 0.3s;
            position: relative;
            z-index: 2;
        }
        .stat-glass-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.15); border-color: #38bdf8; }
        .stat-number { font-size: 3rem; font-weight: 800; color: #38bdf8; margin-bottom: 5px; }
        .stat-text { font-size: 1.1rem; font-weight: 600; letter-spacing: 1px; }

        /* ==========================================
           2nd PARALLAX SECTION (CTA)
           ========================================== */
        .parallax-cta-section {
            position: relative;
            background: url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1920&auto=format&fit=crop&q=80') center center / cover no-repeat;
            background-attachment: fixed;
            padding: 100px 0;
        }
        .cta-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(4, 16, 42, 0.85);
            z-index: 1;
        }
        .cta-content {
            position: relative;
            z-index: 2;
            text-align: center;
            color: white;
            max-width: 800px;
            margin: 0 auto;
        }
        .cta-title { font-size: 3rem; font-weight: 800; margin-bottom: 20px; }
        .cta-desc { font-size: 1.2rem; color: #cbd5e1; margin-bottom: 30px; line-height: 1.6; }

        /* ==========================================
           SPECIALIZED CARE PROGRAMS
           ========================================== */
        .care-programs-section { background: #ffffff; padding: 90px 0; }
        .care-card-modern {
            background: #FAFCFF; border-radius: 24px; padding: 40px 30px;
            border: 1px solid #eef2ff; position: relative; overflow: hidden;
            transition: all 0.4s ease; height: 100%; z-index: 1;
            box-shadow: 0 10px 20px rgba(0,0,0,0.02);
        }
        .care-card-modern:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(10, 102, 194, 0.12);
            border-color: #38bdf8;
        }
        .care-card-bg-shape {
            position: absolute; top: -50px; right: -50px; width: 150px; height: 150px;
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            border-radius: 50%; z-index: -1; transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .care-card-modern:hover .care-card-bg-shape { transform: scale(1.8); }
        .care-icon-wrap {
            width: 70px; height: 70px; border-radius: 20px;
            background: white; box-shadow: 0 10px 25px rgba(10, 102, 194, 0.15);
            display: flex; align-items: center; justify-content: center;
            font-size: 2rem; color: #0A66C2; margin-bottom: 25px;
            transition: all 0.3s ease;
        }
        .care-card-modern:hover .care-icon-wrap { background: #0A66C2; color: white; transform: rotate(-5deg); }
        .care-card-title { font-size: 1.35rem; font-weight: 800; color: #04102A; margin-bottom: 15px; }
        .care-card-desc { font-size: 0.95rem; color: #64748B; line-height: 1.6; margin-bottom: 25px; }
        .care-card-link { font-weight: 700; color: #0A66C2; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: 0.3s; }
        .care-card-link:hover { color: #04102A; gap: 12px; }

        /* ==========================================
           🚀 UPGRADED "WHY CHOOSE US" CARDS WITH OVERLAY
           ========================================== */
        .wcu-card { 
            background: #ffffff; border-radius: 24px; overflow: hidden; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.05); transition: all 0.4s ease; 
            border: 1px solid #eef2ff; 
        }
        .wcu-card:hover { 
            transform: translateY(-10px); box-shadow: 0 20px 40px rgba(10, 102, 194, 0.15); 
            border-color: #0A66C2; 
        }
        .wcu-img-wrap { 
            position: relative; width: 100%; height: 260px; overflow: hidden; 
        }
        .wcu-img { 
            width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; 
        }
        .wcu-card:hover .wcu-img { transform: scale(1.1); }
        
        .wcu-overlay { 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background: linear-gradient(to bottom, rgba(4, 16, 42, 0.2), rgba(10, 102, 194, 0.8)); 
            opacity: 0; transition: all 0.4s ease; display: flex; align-items: center; justify-content: center; 
        }
        .wcu-card:hover .wcu-overlay { opacity: 1; }
        
        .wcu-icon { color: white; font-size: 3rem; transform: translateY(20px); transition: all 0.4s ease; opacity: 0; }
        .wcu-card:hover .wcu-icon { transform: translateY(0); opacity: 1; }
        
        .wcu-content { 
            padding: 30px; text-align: center; background: #fff; position: relative; z-index: 2; 
            border-top: 4px solid #0A66C2; 
        }
        .wcu-title { font-weight: 800; color: #04102A; font-size: 1.25rem; margin-bottom: 12px; transition: color 0.3s; }
        .wcu-card:hover .wcu-title { color: #0A66C2; }
        .wcu-desc { color: #64748B; font-size: 0.95rem; line-height: 1.6; margin: 0; }

        /* Responsive */
        @media (max-width: 991px) {
            .hero-section-fluid { padding: 100px 0 60px; text-align: center; }
            .hero-title-dark { font-size: 3.5rem; }
            .hero-subtitle-dark { max-width: 100%; margin: 0 auto; }
            .hero-btn-wrapper { justify-content: center; }
            .hero-trust-wrapper { justify-content: center; margin-top: 30px; flex-wrap: wrap; gap: 15px!important; }
            .hero-img-inner { height: 350px; }
            .hero-float-card { display: none; }
            .hero-dots-bg { display: none; }
            
            .side-img-backdrop { left: 15px; bottom: 15px; }
            .testimonial-modern-card { height: auto; padding-top: 30px; } 
            
            .clinic-highlight-card { padding: 30px 20px; text-align: center; margin-bottom: 20px; }
            
            .floating-glass-card { right: 10px; bottom: 20px; }
            
            .parallax-stats-section { background-attachment: scroll; padding: 50px 0; }
            .parallax-cta-section { background-attachment: scroll; padding: 60px 20px; }
            
            .trending-brands-parallax { background-attachment: scroll; padding: 80px 0; }
        }

        @media (max-width: 768px) { 
            .hero-title-dark { font-size: 2.8rem; }
            .diabetic-landing-section-title { font-size: 2rem; } 
            
            .testimonial-quote { font-size: 2rem; right: 15px; top: 15px; }
            .t-badge-num { left: -5px; top: -5px; } 
            
            .brand-section-header { font-size: 2rem; }
            
            .cta-title { font-size: 2rem; }
            .stat-number { font-size: 2.5rem; }
            
            .brand-section-header-glass { font-size: 2rem; }
            .split-img { height: 350px; }
        }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* 1. HERO SECTION (CONTAINER-FLUID FULL WIDTH + EXACT MATCH) */}
      <section className="hero-section-fluid" style={{ marginTop: '76px' }}>
        <div className="hero-dots-bg"></div>

        <div className="container-fluid px-4 px-lg-5 hero-content-z">
          <div className="row  align-items-center justify-content-between">
            <div className="col-lg-5 col-xl-5 mb-5 mb-lg-0 ps-lg-4">
              <div className="hero-badge-pill mb-4">
                <i className="fas fa-crown hero-badge-icon"></i> World-Class Diabetes Care
              </div>
              <h2 className="hero-title-dark mb-4">
                Control Diabetes<br /> Live <span className="hero-text-highlight">Limitless</span>
              </h2>
              <p className="hero-subtitle-dark mb-5">
                Personalized solutions, world-class endocrinologists, and medical-grade products.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-5 hero-btn-wrapper">
                <a href="/Pharmacy" className="hero-btn-blue">
                  Shop Now <i className="fas fa-arrow-right"></i>
                </a>
                <a href="/Doctors" className="hero-btn-outline">
                  Book Consult
                </a>
              </div>
              <div className="d-flex align-items-center gap-4 hero-trust-wrapper">
                <div className="hero-trust-box">
                  <div className="hero-icon-blue-bg">
                    <i className="fas fa-user-md"></i>
                  </div>
                  <div>
                    <p className="hero-trust-title">Verified</p>
                    <p className="hero-trust-sub">Doctors</p>
                  </div>
                </div>
                <div className="hero-trust-box">
                  <div className="hero-icon-green-bg">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <p className="hero-trust-title">Medical-Grade</p>
                    <p className="hero-trust-sub">Products</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-xl-6 text-center text-lg-end pe-lg-4">
              <div className="position-relative d-inline-block">
                <div className="hero-image-frame">
                  {/* Using the hero carousel logic existing in the state, but framed perfectly */}
                  <img src={heroImages[heroCarouselIndex]} className="hero-img-inner" alt="Diabetes Care" />

                  <div className="hero-float-card float-tr">
                    <div className="fc-icon-green"><i className="fas fa-heart"></i></div>
                    <div className="text-start">
                      <p className="fc-title">Glucose Tracked</p>
                      <p className="fc-sub">Real-time Monitoring</p>
                    </div>
                  </div>

                  <div className="hero-float-card float-bl">
                    <div className="fc-icon-blue"><i className="fas fa-shield-alt"></i></div>
                    <div className="text-start">
                      <p className="fc-title">24/7 Support</p>
                      <p className="fc-sub">Expert Care Team</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-carousel-controls">
                <button className="hero-nav-circle" onClick={goToPrevHero}><i className="fas fa-chevron-left fa-sm"></i></button>
                <div className="hero-dots-container">
                  {heroImages.map((_, idx) => (
                    <div key={idx} className={`h-dot-item ${heroCarouselIndex === idx ? 'active' : ''}`} onClick={() => setHeroCarouselIndex(idx)}></div>
                  ))}
                </div>
                <button className="hero-nav-circle" onClick={goToNextHero}><i className="fas fa-chevron-right fa-sm"></i></button>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section>
        <MedicineComponent />
      </section>

      {/* 🚀 NEW SECTION: LEFT IMAGE / RIGHT CONTENT (Replaced the 3rd Custom Banner) */}
      <section className="premium-split-section py-5 bg-light">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0 pe-lg-4">
              <div className="split-img-wrapper">
                <div className="split-bg-shape"></div>
                <img
                  src={img4}
                  alt="Professional Doctor Care"
                  className="split-img"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1576091160550-2173ff9e5fe3?w=800&auto=format&fit=crop"; }}
                />
                <div className="floating-glass-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="glass-icon-box"><i className="fas fa-heartbeat text-danger"></i></div>
                    <div className="text-start">
                      <h6 className="m-0 fw-bold text-dark">Personalized Care</h6>
                      <small className="text-muted fw-bold">24/7 Monitoring</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 ps-lg-5 text-start">
              <div className="hero-badge-pill mb-3" style={{ borderColor: '#0A66C2', color: '#0A66C2', backgroundColor: 'rgba(10, 102, 194, 0.05)' }}>
                <i className="fas fa-star me-2"></i> Premium Healthcare
              </div>
              <h2 className="brand-section-header mb-4" style={{ textAlign: 'left', fontSize: '2.8rem' }}>
                Advanced Care for a <br /><span style={{ color: '#0A66C2' }}>Healthier Tomorrow</span>
              </h2>
              <div className="luxury-divider ms-0" style={{ background: 'linear-gradient(90deg, #0A66C2, #38bdf8, transparent)', marginBottom: '1.5rem' }}></div>
              <p className="text-muted fs-5 mb-4" style={{ lineHeight: '1.7' }}>
                Experience a revolutionary approach to diabetes management. We combine cutting-edge technology, world-class endocrinologists, and holistic nutrition plans to help you regain control of your life effortlessly.
              </p>

              <ul className="list-unstyled mb-5">
                <li className="check-list-item"><i className="fas fa-check-circle"></i> Tailored diet and exercise routines</li>
                <li className="check-list-item"><i className="fas fa-check-circle"></i> Real-time glucose tracking and alerts</li>
                <li className="check-list-item"><i className="fas fa-check-circle"></i> Direct access to top-tier health specialists</li>
              </ul>

              <a href="/CareProgram" className="hero-btn-blue px-4 py-3" style={{ fontSize: '1rem' }}>
                Discover Our Plans <i className="fas fa-arrow-right ms-2"></i>
              </a>
            </div>
          </div>
        </div>
      </section>
{/* ----------------------------------------------------------------------------------------------- */}
      <section>
        <LabNearMe/>
      </section>

      {/* 2. TRENDING BRANDS (GLASSMORPHISM & PARALLAX BACKGROUND) */}
      <section className="trending-brands-parallax">
        <div className="trending-brands-overlay"></div>
        <div className="container trending-content-z">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h2 className="brand-section-header-glass">Trending <span>Brands</span></h2>
              <div className="luxury-divider" style={{ background: 'linear-gradient(90deg, #38bdf8, #e0f2fe, transparent)', margin: '0.5rem 0' }}></div>
            </div>
            {/* <Link to="/brands" className="glass-view-btn d-none d-md-block">View all <i className="fas fa-arrow-right ms-1"></i></Link> */}
          </div>

          <div className="position-relative">
            <div ref={brandScrollRef} className="horizontal-scroll-container d-flex gap-4 pb-4 pt-3 justify-content-start">
              {(brands || []).map((brand, idx) => (
                <div key={brand._id || idx} className="flex-shrink-0" onClick={() => window.location.href = `/pharmacy?brand=${brand._id}`}>
                  {/* Glassmorphism Brand Card */}
                  <div className="premium-glass-brand-card">
                    <img
                      src={brand.brandImageUrl || brand.brandImage || DEFAULT_BRAND_IMAGE}
                      className="glass-brand-circle"
                      alt={brand.brandName || brand.name}
                      onError={(e) => e.target.src = DEFAULT_BRAND_IMAGE}
                    />
                    <div className="glass-brand-name text-truncate">
                      {brand.brandName || brand.name || "Brand"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Glass Scroll Buttons */}
            <button className="glass-nav-btn position-absolute start-0 top-50 translate-middle-y ms-2" onClick={() => scrollLeft(brandScrollRef)}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="glass-nav-btn position-absolute end-0 top-50 translate-middle-y me-2" onClick={() => scrollRight(brandScrollRef)}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>


      {/* 5. FOOD & NUTRITION (Restaurants Near You - PERFECT HORIZONTAL DESIGN) */}
      {kitchen && kitchen.length > 0 && (
        <section className="py-5 bg-light">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="brand-section-header m-0" style={{ fontSize: '2rem' }}>Restaurants <span>Near You</span></h2>
              <Link to="/all-meals" className="view-all-link d-none d-md-block">View All <i className="fas fa-chevron-right ms-1" style={{ fontSize: '0.8rem' }}></i></Link>
            </div>

            <div className="position-relative">
              <div ref={foodScrollRef} className="horizontal-scroll-container d-flex gap-3 pb-4 pt-2">
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
                    if (vendorImg.startsWith('http') || vendorImg.startsWith('data:')) {
                      vendorImage = vendorImg;
                    } else {
                      const baseUrl = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/$/, '') : "";
                      vendorImage = `${baseUrl}/${vendorImg.replace(/^\//, '')}`;
                    }
                  }

                  return (
                    <div key={vendor._id || idx} className="food-card flex-shrink-0" style={{ width: '400px', maxWidth: '85vw' }} onClick={() => window.location.href = `/shop/FoodAndNurition/Products/${vendor._id}`}>
                      <div className="premium-restaurant-card">
                        <div className="pr-img-wrapper">
                          <img src={vendorImage} className="pr-img" alt={vendor.name} onError={(e) => e.target.src = DEFAULT_SHOP_IMAGE} />
                          {dist !== null && dist !== undefined && !isNaN(dist) && (
                            <div className="pr-badge-top-right">{Number(dist).toFixed(1)} km</div>
                          )}
                        </div>
                        <div className="pr-content">
                          <h6 className="pr-title">{vendor.name || "Restaurant"}</h6>
                          <div className="pr-meta mb-1 text-warning fw-bold" style={{ fontSize: '0.8rem' }}>
                            <i className="fas fa-star me-1"></i> 4.5 <span className="text-muted fw-normal">(100+)</span>
                          </div>
                          <p className="pr-meta mb-2">
                            <i className="fas fa-map-marker-alt me-1 opacity-50"></i> {vendor.address || vendor.city || "Address not available"}
                          </p>
                          <div className="pr-footer">
                            <span className="pr-tag">Available</span>
                            <button className="pr-action-btn" onClick={(e) => { e.stopPropagation(); window.location.href = `/food-shop/rating/${vendor._id}`; }}>Rate</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="carousel-nav-btn position-absolute start-0 top-50 translate-middle-y ms-1 shadow-lg" onClick={() => scrollLeft(foodScrollRef)} style={{ zIndex: 10 }}><i className="fas fa-chevron-left"></i></button>
              <button className="carousel-nav-btn position-absolute end-0 top-50 translate-middle-y me-1 shadow-lg" onClick={() => scrollRight(foodScrollRef)} style={{ zIndex: 10 }}><i className="fas fa-chevron-right"></i></button>
            </div>
          </div>
        </section>
      )}

      {/* PARALLAX SECTION 1: STATS */}
      <section className="parallax-stats-section">
        <div className="parallax-overlay"></div>
        <div className="container position-relative z-3">
          <div className="row g-4 justify-content-center">
            <div className="col-md-3 col-6">
              <div className="stat-glass-card">
                <div className="stat-number">50K+</div>
                <div className="stat-text">Happy Patients</div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-glass-card">
                <div className="stat-number">200+</div>
                <div className="stat-text">Top Doctors</div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-glass-card">
                <div className="stat-number">10K+</div>
                <div className="stat-text">Products</div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-glass-card">
                <div className="stat-number">98%</div>
                <div className="stat-text">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DOCTORS SECTION (FULLY UPGRADED PREMIUM DESIGN) */}
      <section id="doctors" className="py-5 doctors-section-bg ">
        <div className="container">
          <PremiumDoctorSection />
        </div>
      </section>

      {/* 7. TESTIMONIALS (FULLY UPGRADED PREMIUM DESIGN) */}
      <CardSlider />

      {/* PARALLAX SECTION 2: CTA */}
      <section className="parallax-cta-section">
        <div className="cta-overlay"></div>
        <div className="container position-relative z-3">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Health?</h2>
            <p className="cta-desc">Join thousands of patients who have successfully controlled and reversed their diabetes with our expert-led programs and premium healthcare products.</p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <a href="#doctors" className="hero-btn-blue px-5 py-3 fs-5">Book Consultation</a>
              <a href="/Pharmacy" className="hero-btn-outline px-5 py-3 fs-5">Shop Medicines</a>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALIZED CARE PROGRAMS */}
      <section className="care-programs-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="brand-section-header">Specialized <span>Care Programs</span></h2>
            <div className="luxury-divider" style={{ background: 'linear-gradient(90deg, transparent, #0A66C2, #38bdf8, transparent)' }}></div>
            <p className="text-muted mt-3 fw-medium">Expertly crafted programs tailored to your unique metabolic profile</p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="care-card-modern">
                <div className="care-card-bg-shape"></div>
                <div className="care-icon-wrap">
                  <i className="fas fa-leaf"></i>
                </div>
                <h4 className="care-card-title">Diabetes Reversal</h4>
                <p className="care-card-desc">
                  Scientifically backed programs focusing on dietary shifts, sustained weight management, and intensive coaching to reverse Type 2 diabetes.
                </p>
                <Link to="/CareProgram" className="care-card-link">Explore Program <i className="fas fa-arrow-right"></i></Link>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="care-card-modern">
                <div className="care-card-bg-shape"></div>
                <div className="care-icon-wrap">
                  <i className="fas fa-weight"></i>
                </div>
                <h4 className="care-card-title">Weight Management</h4>
                <p className="care-card-desc">
                  Holistic metabolic healing combining expert nutrition planning and medical tracking to help you achieve and maintain your ideal healthy weight.
                </p>
                <Link to="/CareProgram" className="care-card-link">Explore Program <i className="fas fa-arrow-right"></i></Link>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="care-card-modern">
                <div className="care-card-bg-shape"></div>
                <div className="care-icon-wrap">
                  <i className="fas fa-baby"></i>
                </div>
                <h4 className="care-card-title">Gestational Care</h4>
                <p className="care-card-desc">
                  Dedicated 24/7 care ensuring optimal blood sugar levels during pregnancy, safeguarding the health of both the mother and the newborn.
                </p>
                <Link to="/CareProgram" className="care-card-link">Explore Program <i className="fas fa-arrow-right"></i></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 8. UPGRADED: WHY CHOOSE US (WITH PREMIUM OVERLAYS & HOVER EFFECTS) */}
      <div className="container-fluid py-5 bg-white border-top">
        <div className="container my-4">
          <div className="text-center mb-5">
            <h2 className="brand-section-header">Why Choose <span>Diabetic Wala</span></h2>
            <div className="luxury-divider" style={{ background: 'linear-gradient(90deg, transparent, #0A66C2, #38bdf8, transparent)' }}></div>
          </div>
          <div className="row g-4">
            {features.map(f => (
              <div className="col-lg-4 col-md-6" key={f.id}>
                <div className="wcu-card h-100">
                  <div className="wcu-img-wrap">
                    <img src={f.img} className="wcu-img" alt={f.title} />
                    <div className="wcu-overlay">
                      <i className="fas fa-plus-circle wcu-icon"></i>
                    </div>
                  </div>
                  <div className="wcu-content h-100 flex-grow-1">
                    <h5 className="wcu-title">{f.title}</h5>
                    <p className="wcu-desc">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
