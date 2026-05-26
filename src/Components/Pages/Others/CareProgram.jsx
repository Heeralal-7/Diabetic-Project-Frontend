import React, { useEffect, useState, useContext } from "react";
import $ from "jquery";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../../Context/Context";

// Restored Imports
import banner1 from "../../Assets/img/CareProgramBanner.gif";
import CareImg1 from "../../Assets/img/CareImg1.png";
import CareImg2 from "../../Assets/img/CareImg2.png";
import CareImg3 from "../../Assets/img/CareImg3.png";
import Aos from "aos";
import CardSlider from "./CareProgramIntro";

// ==========================================
// NEW SUPERB HIGH QUALITY HD IMAGES (UPDATED 4K)
// ==========================================
const hqDoctorImg = "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=100&w=1600&auto=format&fit=crop"; // Premium Doctor Consulting (Professional)
const hqDietitianImg = "https://images.unsplash.com/photo-1593013820725-635188bf20eb?q=100&w=1600&auto=format&fit=crop"; // Dietitian Desk with Diet Plan & Healthy Food
const hqYogaImg = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=100&w=1600&auto=format&fit=crop"; // Premium Bright Yoga Pose

// Fallback HD Images Array to ensure different images
const hdImagesArray = [hqDoctorImg, hqDietitianImg, hqYogaImg];
// Awesome Icons for Features (Using Remix Icons natively supported by your app)
const featureIconsArray = ["ri-stethoscope-line", "ri-leaf-line", "ri-mental-health-line"];

const CareProgram = () => {
  const navigate = useNavigate();
  const {
    getMembershipPlans,
    getActiveMembership,
    getMembershipBenefits,
    membershipLoading,
    activeMembership,
    fetchCareProgramDataUser,
    carePageLoadingUser,
    carePageErrorUser,
    careProgramDataUser,
  } = useContext(MyContext);

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [membershipBenefits, setMembershipBenefits] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Superb High Quality HD Images for Hero
  const heroSlides = [
    {
      id: 1,
      badge: "🔥 LIMITED TIME OFFER",
      title1: "Struggling with",
      title2: "Weight Loss?",
      desc: "Explore our expert-led Fat Loss management programs and transform your life today with exclusive discounts.",
      btnText: "Order Now",
      bgImg: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=100&w=2560&auto=format&fit=crop",
      highlightColor: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)"
    },
    {
      id: 2,
      badge: "🩺 PREMIUM CARE",
      title1: "Reverse your",
      title2: "Diabetes",
      desc: "Scientific programs designed by top doctors and dietitians to help you achieve normal blood sugar levels effortlessly.",
      btnText: "Explore Plans",
      bgImg: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=100&w=2560&auto=format&fit=crop",
      highlightColor: "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
    }
  ];

  const [diseaseIndex, setDiseaseIndex] = useState(0);

  // Superb High Quality HD Images for Diseases
  const diseases = [
    { id: 1, title: "Diabetes Reversal", desc: "Regulate blood sugar naturally with expert guidance.", img: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=100&w=1200&auto=format&fit=crop" },
    { id: 2, title: "Weight Management", desc: "Scientific fat loss programs tailored to your body.", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=100&w=1200&auto=format&fit=crop" },
    { id: 3, title: "Fatty Liver Care", desc: "Detoxify and heal your liver with precision nutrition.", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=100&w=1200&auto=format&fit=crop" },
    { id: 4, title: "PCOS & PCOD", desc: "Achieve hormonal balance through lifestyle changes.", img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=100&w=1200&auto=format&fit=crop" },
    { id: 5, title: "Heart Health", desc: "Manage cholesterol and blood pressure effectively.", img: "https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?q=100&w=1200&auto=format&fit=crop" }
  ];

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setActiveSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 6000);
    const diseaseInterval = setInterval(() => {
      setDiseaseIndex((prev) => (prev === diseases.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => {
      clearInterval(heroInterval);
      clearInterval(diseaseInterval);
    };
  }, [heroSlides.length, diseases.length]);

  useEffect(() => {
    Aos.init({ once: true, offset: 50, duration: 800, easing: 'ease-out-cubic' });
    fetchMembershipPlans();
    fetchMembershipBenefits();
    fetchCareProgramDataUser();
  }, []);

  const fetchMembershipPlans = async () => {
    const result = await getMembershipPlans(1, 10, '');
    if (result.success === 1) {
      setPlans(result.data.plans || []);
    }
  };

  const fetchMembershipBenefits = async () => {
    const result = await getMembershipBenefits();
    if (result.success === 1) {
      setMembershipBenefits(result.data);
    }
  };

  const handleCardMouseEnter = (index) => setHoveredCard(index);
  const handleCardMouseLeave = () => setHoveredCard(null);

  const handlePlanSelect = (plan, index) => {
    if (activeMembership) {
      if (activeMembership.membership?.planName === plan.planName) {
        navigate("/CareProgram/active");
        return;
      }
      alert(`You already have an active ${activeMembership.membership?.planName} membership.`);
      return;
    }
    setSelectedPlan(plan);
    setShowPurchaseModal(true);
  };

  const handleProceedToPayment = () => {
    if (!selectedPlan) return;
    const planDataStr = encodeURIComponent(JSON.stringify(selectedPlan));
    navigate(`/care-program/payment?planId=${selectedPlan._id}&planData=${planDataStr}`);
    setShowPurchaseModal(false);
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getDiscountedPrice = (plan) => {
    const basePrice = plan.price || 0;
    const discountPercentage = plan.discountPercentage || 0;
    return basePrice - (basePrice * discountPercentage / 100);
  };

  // Logic to properly map API data to icons and colors
  const getIconForStat = (label) => {
    const lowerLabel = (label || '').toLowerCase();
    if (lowerLabel.includes('consultation')) return 'ri-stethoscope-fill';
    if (lowerLabel.includes('saving') || lowerLabel.includes('rupee')) return 'ri-money-rupee-circle-fill';
    if (lowerLabel.includes('rating')) return 'ri-star-smile-fill';
    if (lowerLabel.includes('secure') || lowerLabel.includes('payment')) return 'ri-shield-check-fill';
    if (lowerLabel.includes('success')) return 'ri-heart-pulse-fill';
    if (lowerLabel.includes('support') || lowerLabel.includes('24')) return 'ri-customer-service-2-fill';
    return 'ri-bar-chart-box-fill';
  };

  const getColorClass = (color) => {
    const colorMap = {
      'success': '#10B981', 'primary': '#4F46E5', 'danger': '#EF4444',
      'warning': '#F59E0B', 'info': '#06B6D4', 'secondary': '#8B5CF6'
    };
    return colorMap[color] || color || '#4F46E5';
  };

  const getBgColorForStat = (hexColor) => {
    const bgMap = {
      '#10B981': '#D1FAE5', // Green bg
      '#4F46E5': '#EEF2FF', // Indigo bg
      '#EF4444': '#FEE2E2', // Red bg
      '#F59E0B': '#FEF3C7', // Yellow bg
      '#06B6D4': '#CFFAFE', // Cyan bg
      '#8B5CF6': '#EDE9FE', // Purple bg
    };
    return bgMap[hexColor] || '#EEF2FF';
  };

  const getStatsData = () => {
    if (careProgramDataUser?.statsSection?.stats && Array.isArray(careProgramDataUser.statsSection.stats) && careProgramDataUser.statsSection.stats.length > 0) {
      return careProgramDataUser.statsSection.stats
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((stat) => {
          const hex = getColorClass(stat.color);
          return {
            value: stat.value || '',
            label: stat.label || '',
            color: hex,
            bg: getBgColorForStat(hex),
            icon: getIconForStat(stat.label || '')
          };
        });
    }
    return [];
  };

  const apiStats = getStatsData();
  const statsToDisplay = apiStats.length > 0 ? apiStats : [
    { icon: "ri-stethoscope-fill", value: "50k+", label: "Consultations Done", color: "#4F46E5", bg: "#EEF2FF" },
    { icon: "ri-money-rupee-circle-fill", value: "₹1Cr+", label: "User Savings", color: "#10B981", bg: "#D1FAE5" },
    { icon: "ri-star-smile-fill", value: "4.8/5", label: "User Rating", color: "#F59E0B", bg: "#FEF3C7" },
    { icon: "ri-shield-check-fill", value: "100%", label: "Secure Payments", color: "#06B6D4", bg: "#CFFAFE" },
    { icon: "ri-heart-pulse-fill", value: "95%", label: "Success Rate", color: "#EF4444", bg: "#FEE2E2" },
    { icon: "ri-customer-service-2-fill", value: "24/7", label: "Support Available", color: "#8B5CF6", bg: "#EDE9FE" }
  ];

  const duplicatedStats = [...statsToDisplay, ...statsToDisplay];

  // Guaranteed Unique HD Images Map Logic
  const getFeaturesData = () => {
    const apiFeatures = careProgramDataUser?.programFeatures?.features || [];
    if (apiFeatures.length > 0) {
      return apiFeatures.map((feat, index) => ({
        id: feat._id || feat.id || index,
        title: feat.title,
        description: feat.description,
        image: feat.image?.url ? `${process.env.REACT_APP_API_URL || ""}${feat.image.url}` : hdImagesArray[index % hdImagesArray.length],
        icon: featureIconsArray[index % featureIconsArray.length]
      }));
    }
    return [
      { id: 1, title: "Medical advice from top Diabetologists", description: "Get convenient, virtual medical care. Our leading doctors guide you periodically during the program.", image: hqDoctorImg, icon: "ri-stethoscope-line", altText: "Medical advice" },
      { id: 2, title: "Expert Dietitians & Coaches", description: "Get personalized coaching support from our care team. Custom diet plans tailored to your body type.", image: hqDietitianImg, icon: "ri-leaf-line", altText: "Dietitians" },
      { id: 3, title: "Yoga & Fitness for Diabetes", description: "Exclusive video courses by expert therapists. Learn specific asanas and breathwork.", image: hqYogaImg, icon: "ri-mental-health-line", altText: "Yoga" }
    ];
  };

  const featuresToDisplay = getFeaturesData();

  const programFeaturesSection = {
    title: careProgramDataUser?.programFeatures?.title || "What do DiabetesWala Care programs include?",
    description: careProgramDataUser?.programFeatures?.description || "A Unique '360° Wellness Fingerprint'. Naturally control your blood sugar levels through doctor-led guidance, real-time tracking, and personalized nutrition.",
    isActive: careProgramDataUser?.programFeatures?.isActive !== false
  };

  const getDiseaseCardClass = (index) => {
    if (index === diseaseIndex) return 'dz-card dz-active';
    if (index === (diseaseIndex - 1 + diseases.length) % diseases.length) return 'dz-card dz-prev';
    if (index === (diseaseIndex + 1) % diseases.length) return 'dz-card dz-next';
    return 'dz-card dz-hidden';
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

          :root {
            --font-heading: 'Sora', sans-serif;
            --font-body: 'Plus Jakarta Sans', sans-serif;
            
            --bg-page: #FCFDFF;
            --brand-primary: #4F46E5; 
            --brand-dark: #1E1B4B;
            --text-main: #0F172A;
            --text-muted: #64748B;
            
            --accent-green: #10B981;
            --accent-gold: #F59E0B;
            
            --radius-xl: 40px;
            --radius-lg: 32px;
            --radius-md: 20px;
            
            --shadow-soft: 0 20px 40px -5px rgba(15, 23, 42, 0.05), 0 8px 16px -8px rgba(15, 23, 42, 0.05);
            --shadow-hover: 0 30px 60px -10px rgba(79, 70, 229, 0.12), 0 16px 32px -16px rgba(79, 70, 229, 0.1);
          }

          body {
            background-color: var(--bg-page);
            font-family: var(--font-body);
            color: var(--text-main);
            overflow-x: hidden;
          }

          h1, h2, h3, h4, h5, .font-heading {
            font-family: var(--font-heading);
          }

          /* ===== HERO ISLAND ===== */
          .hero-island-container {
            padding: 1.5rem;
            width: 100%;
            display: flex;
            justify-content: center;
          }

          .hero-island {
            position: relative;
            width: 100%;
            max-width: 1800px;
            height: 85vh;
            min-height: 600px;
            max-height: 800px;
            border-radius: var(--radius-xl);
            overflow: hidden;
            background: #000;
            box-shadow: 0 40px 80px rgba(0,0,0,0.15);
          }

          .hero-slide {
            position: absolute; inset: 0;
            opacity: 0; transform: scale(1.05);
            transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), transform 5s ease-out;
            background-size: cover;
            background-position: center;
          }
          .hero-slide.active {
            opacity: 1; transform: scale(1); z-index: 1;
          }

          .hero-slide::before {
            content: ''; position: absolute; inset: 0;
            background: linear-gradient(90deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.65) 45%, rgba(15,23,42,0.1) 100%);
            z-index: 2;
          }

          .hero-content {
            position: relative; z-index: 3;
            height: 100%; display: flex; align-items: center;
            padding: 0 6%;
          }

          .hero-badge {
            display: inline-flex; align-items: center; gap: 10px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.2);
            color: #fff; padding: 8px 20px; border-radius: 100px;
            font-size: 0.75rem; font-weight: 700;
            letter-spacing: 2px; text-transform: uppercase;
            margin-bottom: 2rem;
          }
          
          .hero-title-1 {
            font-size: clamp(2.5rem, 5vw, 4.5rem);
            font-weight: 800; color: #F8FAFC;
            line-height: 1.1; margin: 0; letter-spacing: -1.5px;
            text-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
          
          .hero-title-2 {
            font-size: clamp(2.5rem, 5vw, 4.5rem);
            font-weight: 900; line-height: 1.1; margin-bottom: 1.5rem;
            letter-spacing: -1.5px;
            text-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }

          .hero-desc {
            font-size: clamp(1.05rem, 1.3vw, 1.2rem);
            color: rgba(255,255,255,0.85);
            max-width: 520px; line-height: 1.7; margin-bottom: 3rem;
            font-weight: 400; text-shadow: 0 4px 10px rgba(0,0,0,0.3);
          }

          .btn-premium {
            background: #fff; color: var(--text-main);
            font-weight: 800; font-size: 1rem;
            padding: 16px 40px; border-radius: 100px;
            border: none; display: inline-flex; align-items: center; gap: 12px;
            transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
            text-decoration: none; font-family: var(--font-heading);
            cursor: pointer; box-shadow: 0 15px 30px rgba(0,0,0,0.2);
          }
          .btn-premium:hover {
            transform: translateY(-5px);
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
            color: var(--brand-primary);
          }

          .widget-container {
            position: absolute; right: 8%; top: 0; bottom: 0;
            display: flex; flex-direction: column; justify-content: center; gap: 2rem;
            z-index: 3; pointer-events: none;
          }
          .glass-widget {
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: var(--radius-md);
            padding: 20px 24px; color: white;
            animation: float 6s ease-in-out infinite;
            display: flex; align-items: center; gap: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          }
          .glass-widget:nth-child(2) { animation-delay: 3s; margin-left: -50px; }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }

          .hero-dots {
            position: absolute; bottom: 40px; left: 6%;
            display: flex; gap: 12px; z-index: 10;
          }
          .hero-dot {
            height: 6px; width: 6px; border-radius: 10px;
            background: rgba(255,255,255,0.3); border: none;
            transition: all 0.4s ease; cursor: pointer; padding: 0;
          }
          .hero-dot.active { width: 45px; background: #fff; }

          /* ===== ACTIVE ALERT BANNER ===== */
          .active-banner {
            background: #ffffff;
            border-radius: var(--radius-lg);
            padding: 24px 32px;
            box-shadow: var(--shadow-soft);
            border: 1px solid rgba(16, 185, 129, 0.2);
            position: relative; overflow: hidden;
            display: flex; align-items: center; justify-content: space-between;
          }
          .pulse-dot {
            width: 12px; height: 12px; border-radius: 50%;
            background: var(--accent-green);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            animation: pulse-ring 2s infinite cubic-bezier(0.66, 0, 0, 1);
          }
          @keyframes pulse-ring {
            100% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          }

          /* ===== SECTION HEADERS ===== */
          .section-header {
            text-align: center; margin: 6rem 0 4rem;
          }
          .eyebrow {
            display: inline-block; padding: 8px 20px;
            background: rgba(79, 70, 229, 0.1); color: var(--brand-primary);
            border-radius: 100px; font-size: 0.75rem; font-weight: 800;
            letter-spacing: 2px; text-transform: uppercase;
            margin-bottom: 1.5rem; font-family: var(--font-heading);
          }
          .section-title {
            font-size: clamp(2.5rem, 4vw, 3.5rem);
            font-weight: 800; color: var(--text-main);
            letter-spacing: -1.5px; margin-bottom: 1rem; line-height: 1.1;
          }
          .section-desc {
            font-size: 1.15rem; color: var(--text-muted);
            max-width: 600px; margin: 0 auto; line-height: 1.8;
          }

          /* ===== PRICING CARDS ===== */
          .plans-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2rem; max-width: 1300px; margin: 0 auto; padding: 0 1.5rem;
          }
          .plan-card {
            background: #ffffff;
            border-radius: var(--radius-lg);
            padding: 0.8rem;
            box-shadow: var(--shadow-soft);
            border: 1px solid rgba(0,0,0,0.04);
            transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            position: relative; display: flex; flex-direction: column;
            cursor: pointer; z-index: 1;
          }
          .plan-card:hover {
            transform: translateY(-10px);
            box-shadow: var(--shadow-hover);
            z-index: 2;
          }
          .plan-card.active-card {
            border: 2px solid var(--accent-green);
            background: linear-gradient(to bottom, #ffffff, #F0FDF4);
          }
          
          .plan-badge {
            position: absolute; top: -15px; right: 30px;
            background: var(--text-main); color: #fff;
            padding: 8px 16px; border-radius: 100px;
            font-size: 0.75rem; font-weight: 800; font-family: var(--font-heading);
            letter-spacing: 1px; text-transform: uppercase;
            box-shadow: 0 10px 20px rgba(0,0,0,0.15);
          }
          .plan-card.active-card .plan-badge { background: var(--accent-green); }

          .plan-icon-wrap {
            width: 40px; height: 40px; border-radius: 20px;
            background: #F1F5F9; color: var(--brand-primary);
            display: flex; align-items: center; justify-content: center;
            font-size: 1.4rem; margin-bottom: 1.5rem;
          }
          .plan-card.active-card .plan-icon-wrap { color: var(--accent-green); background: #fff; box-shadow: 0 10px 20px rgba(16,185,129,0.1); }
          
          .plan-price-block { margin-bottom: 0rem; }
          .price-large {
            font-size: 2.5rem; font-weight: 800; color: var(--text-main);
            font-family: var(--font-heading); line-height: 1; letter-spacing: -2px;
            display: flex; align-items: flex-start; gap: 5px;
          }
          .price-large span { font-size: 1.5rem; margin-top: 0.5rem; color: var(--text-muted); }
          
          .feature-list { list-style: none; padding: 0; margin: 0 0 2rem; flex-grow: 1; }
          .feature-list li {
            display: flex; align-items: flex-start; gap: 12px;
            margin-bottom: 0.6rem; color: var(--text-muted); font-size: 0.95rem; font-weight: 500;
          }
          .feature-list i { color: var(--brand-primary); font-size: 1.2rem; }
          .plan-card.active-card .feature-list i { color: var(--accent-green); }

          .btn-plan {
            width: 100%; padding: 16px; border-radius: 100px;
            font-weight: 700; font-size: 1rem; text-align: center;
            transition: all 0.3s ease; border: none; cursor: pointer;
            font-family: var(--font-heading);
          }
          .btn-primary-plan { background: var(--text-main); color: #fff; }
          .btn-primary-plan:hover { background: var(--brand-primary); box-shadow: 0 10px 20px rgba(79,70,229,0.2); }
          .btn-active-plan { background: var(--accent-green); color: #fff; }
          .btn-disabled-plan { background: #E2E8F0; color: #94A3B8; cursor: not-allowed; }

          /* ===== STATS MARQUEE (IMPROVED GLASS EFFECT) ===== */
          .stats-wrap {
            margin: 6rem 0; padding: 4rem 0; background: #fff;
            border-top: 1px solid rgba(0,0,0,0.03);
            border-bottom: 1px solid rgba(0,0,0,0.03);
            overflow: hidden; position: relative;
          }
          .stats-wrap::before, .stats-wrap::after {
            content: ''; position: absolute; top: 0; width: 150px; height: 100%; z-index: 2; pointer-events: none;
          }
          .stats-wrap::before { left: 0; background: linear-gradient(to right, #fff, transparent); }
          .stats-wrap::after { right: 0; background: linear-gradient(to left, #fff, transparent); }
          
          .stats-track {
            display: flex; gap: 2rem; width: max-content;
            animation: scroll 40s linear infinite;
          }
          .stats-track:hover { animation-play-state: paused; }
          @keyframes scroll { to { transform: translateX(-50%); } }

          /* Enhanced Stat Pill & Extra Glassy Icon Box */
          .stat-pill {
            padding: 15px 35px 15px 15px; border-radius: 100px;
            display: flex; align-items: center; gap: 18px;
            transition: transform 0.3s ease;
            box-shadow: 0 10px 20px rgba(0,0,0,0.04);
            border: 1px solid rgba(0,0,0,0.05);
          }
          .stat-pill:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); }
          
          /* Awesome Glassmorphism Effect for Remix Icons */
          .stat-icon-bx.glass-fx {
            width: 60px; height: 60px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
            /* Premium Frosted Glass Properties */
            background: rgba(255, 255, 255, 0.45);
            backdrop-filter: blur(16px) saturate(200%);
            -webkit-backdrop-filter: blur(16px) saturate(200%);
            border: 1px solid rgba(255, 255, 255, 0.8);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.8);
            z-index: 2;
          }
          .stat-text h4 { margin: 0; font-size: 1.5rem; font-weight: 900; color: var(--text-main); line-height: 1; }
          .stat-text p { margin: 0; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

          /* ===== 3D DISEASES CAROUSEL ===== */
          .aurora-section {
            background: var(--brand-dark);
            border-radius: var(--radius-xl);
            padding: 6rem 0; margin: 4rem 1.5rem;
            position: relative; overflow: hidden;
            box-shadow: 0 40px 80px rgba(0,0,0,0.2);
          }
          .aurora-orb-1 {
            position: absolute; top: -20%; left: -10%; width: 600px; height: 600px;
            background: rgba(79, 70, 229, 0.4); filter: blur(100px); border-radius: 50%; z-index: 0;
            animation: pulse 10s infinite alternate;
          }
          .aurora-orb-2 {
            position: absolute; bottom: -20%; right: -10%; width: 500px; height: 500px;
            background: rgba(16, 185, 129, 0.25); filter: blur(100px); border-radius: 50%; z-index: 0;
            animation: pulse 12s infinite alternate-reverse;
          }

          .dz-container {
            position: relative; height: 550px; perspective: 1200px;
            display: flex; justify-content: center; align-items: center; z-index: 2; margin-top: 3rem;
          }
          .dz-card {
            position: absolute; width: 360px; height: 500px;
            border-radius: var(--radius-lg); overflow: hidden;
            transition: all 0.8s cubic-bezier(0.25, 1, 0.5, 1);
            cursor: pointer; background: #000;
          }
          .dz-card img { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; transition: transform 0.8s ease; }
          
          .dz-info {
            position: absolute; bottom: 15px; left: 15px; right: 15px;
            background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 24px;
            color: #fff; transform: translateY(20px); opacity: 0; transition: all 0.5s ease 0.2s;
          }

          .dz-active {
            z-index: 10; transform: translateX(0) scale(1.05) translateZ(0);
            box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.2);
          }
          .dz-active img { opacity: 1; transform: scale(1.03); }
          .dz-active .dz-info { transform: translateY(0); opacity: 1; }

          .dz-prev { z-index: 5; transform: translateX(-80%) translateZ(-200px) rotateY(15deg) scale(0.85); opacity: 0.5; }
          .dz-next { z-index: 5; transform: translateX(80%) translateZ(-200px) rotateY(-15deg) scale(0.85); opacity: 0.5; }
          .dz-hidden { opacity: 0; pointer-events: none; transform: translateZ(-400px) scale(0.6); }

          .dz-controls {
            display: flex; justify-content: center; align-items: center; gap: 20px; z-index: 3; position: relative; margin-top: 2rem;
          }
          .ctrl-btn {
            width: 50px; height: 50px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.05); color: #fff; font-size: 1.5rem;
            backdrop-filter: blur(10px); cursor: pointer; transition: all 0.3s ease;
          }
          .ctrl-btn:hover { background: #fff; color: var(--text-main); transform: scale(1.1); }


          /* ==================================================== */
          /* ===== NEW OVERLAY GLASS DESIGN FOR LAST CARDS =====  */
          /* ==================================================== */
          .ed-overlay-card {
            position: relative;
            width: 100%;
            min-height: 500px;
            border-radius: var(--radius-xl);
            overflow: hidden;
            margin-bottom: 4rem;
            display: flex;
            align-items: center;
            box-shadow: var(--shadow-soft);
          }
          .ed-bg-image {
            position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;
            transition: transform 1.5s ease;
          }
          .ed-overlay-card:hover .ed-bg-image { transform: scale(1.04); }
          
          /* Dark elegant gradient depending on alignment */
          .ed-gradient-left { background: linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.65) 45%, transparent 100%); }
          .ed-gradient-right { background: linear-gradient(270deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.65) 45%, transparent 100%); }
          
          .ed-gradient-cover {
            position: absolute; inset: 0; z-index: 2;
          }

          /* Frosted glass text box hovering over image */
          .ed-glass-box {
            position: relative; z-index: 3;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: var(--radius-lg);
            padding: 3.5rem;
            max-width: 550px;
            margin: 0 4rem;
            color: #fff;
            box-shadow: 0 30px 60px rgba(0,0,0,0.2);
          }
          .ed-align-right { margin-left: auto; }

          .ed-num-glass {
            font-size: 5rem; font-weight: 900; font-family: var(--font-heading); line-height: 1;
            color: rgba(255,255,255,0.15); margin-bottom: 0.5rem; letter-spacing: -2px;
          }
          
          /* Beautiful title with icon alignment */
          .ed-title-glass {
            font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 800; color: #fff; 
            margin-bottom: 1.2rem; line-height: 1.2; letter-spacing: -1px;
            display: flex; align-items: center; gap: 12px;
          }
          .ed-title-icon {
            color: var(--accent-green);
            font-size: 2.2rem;
            background: rgba(16, 185, 129, 0.15);
            padding: 8px;
            border-radius: 12px;
          }

          .ed-desc-glass {
            font-size: 1.1rem; color: rgba(255,255,255,0.8); line-height: 1.7; margin-bottom: 2.5rem; font-weight: 400;
          }
          
          .btn-glass-link {
            display: inline-flex; align-items: center; gap: 10px; font-weight: 800; color: var(--text-main);
            text-decoration: none; font-size: 1rem; padding: 14px 28px; border-radius: 100px;
            background: #fff; transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          .btn-glass-link:hover {
            transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.2); background: var(--brand-primary); color: #fff;
          }

          /* ===== PURCHASE MODAL ===== */
          .modal-overlay-2026 {
            position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem;
          }
          .modal-sheet {
            background: #fff; border-radius: 36px; width: 100%; max-width: 650px;
            box-shadow: 0 50px 100px rgba(0,0,0,0.25); overflow: hidden;
            animation: sheetUp 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          }
          @keyframes sheetUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
          
          @media (max-width: 992px) {
            .hero-island { height: 75vh; min-height: 550px; border-radius: var(--radius-lg); }
            .widget-container { display: none; }
            .dz-card { width: 280px; height: 400px; }
            
            /* Responsive for Last Cards Overlay */
            .ed-gradient-cover { background: linear-gradient(0deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.7) 60%, transparent 100%) !important; }
            .ed-glass-box { margin: 2rem; padding: 2rem; margin-top: auto; }
            .ed-overlay-card { align-items: flex-end; min-height: 550px; }
          }
        `}
      </style>

      {/* ===== HERO ISLAND ===== */}
      <div className="hero-island-container">
        <div className="hero-island">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`hero-slide ${index === activeSlide ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide.bgImg})` }}
            >
              <div className="hero-content w-100">
                <div className="row w-100 align-items-center">
                  <div className="col-12 col-lg-8">
                    <div className="hero-badge">{slide.badge}</div>
                    <h1 className="hero-title-1">{slide.title1}</h1>
                    <h1
                      className="hero-title-2"
                      style={{
                        background: slide.highlightColor,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent'
                      }}
                    >
                      {slide.title2}
                    </h1>
                    <p className="hero-desc">{slide.desc}</p>
                    <button
                      className="btn-premium"
                      onClick={() => document.getElementById('programs-section').scrollIntoView({ behavior: 'smooth' })}
                    >
                      {slide.btnText} <i className="ri-arrow-right-line fs-5"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Glass Widgets */}
              <div className="widget-container">
                <div className="glass-widget">
                  <div style={{ background: 'rgba(16,185,129,0.2)', padding: '12px', borderRadius: '16px' }}>
                    <i className="ri-heart-pulse-fill" style={{ color: '#34D399', fontSize: '1.5rem' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 600, letterSpacing: '1px' }}>SUCCESS RATE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>95%</div>
                  </div>
                </div>
                <div className="glass-widget">
                  <div style={{ background: 'rgba(245,158,11,0.2)', padding: '12px', borderRadius: '16px' }}>
                    <i className="ri-user-smile-fill" style={{ color: '#FBBF24', fontSize: '1.5rem' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 600, letterSpacing: '1px' }}>HAPPY PATIENTS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>50,000+</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="hero-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`hero-dot ${index === activeSlide ? "active" : ""}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ===== ACTIVE ALERT BANNER ===== */}
      {activeMembership && (
        <div className="container" style={{ maxWidth: '1300px', marginTop: '2rem' }} data-aos="fade-up">
          <div className="active-banner">
            <div className="d-flex align-items-center gap-4">
              <div className="d-none d-md-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px' }}>
                <i className="ri-vip-crown-fill" style={{ color: 'var(--accent-green)', fontSize: '2rem' }}></i>
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <div className="pulse-dot"></div>
                  <h4 className="m-0 font-heading fw-bold" style={{ fontSize: '1.3rem' }}>Active Membership</h4>
                </div>
                <p className="m-0 text-muted fw-medium">
                  You are currently enrolled in the <strong className="text-dark">{activeMembership.membership?.planName}</strong>. Valid until {new Date(activeMembership.membership?.endDate).toLocaleDateString()}.
                </p>
              </div>
            </div>
            <Link to="/CareProgram/active" className="btn-premium d-none d-md-inline-flex" style={{ background: 'var(--text-main)', color: '#fff', padding: '14px 30px' }}>
              Dashboard <i className="ri-dashboard-line"></i>
            </Link>
          </div>
        </div>
      )}

      {/* ===== PRICING / PLANS ===== */}
      <div id="programs-section" className="container-fluid pb-5">
        <div className="section-header flex-column" data-aos="fade-up">
          <span className="eyebrow">Our Programs</span>
          <h2 className="section-title">Choose your health journey</h2>
          <p className="section-desc">Scientific plans designed by top doctors to help you reach your goals naturally and effectively.</p>
        </div>

        {membershipLoading && !plans.length && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--brand-primary)', width: '3rem', height: '3rem' }} />
          </div>
        )}

        <div className="plans-grid">
          {plans.map((plan, index) => {
            const discountedPrice = getDiscountedPrice(plan);
            const isBestSeller = index === 1 || plan.planName?.toLowerCase().includes('gold');
            const activeMem = activeMembership?.membership;
            const isCurrentPlan = activeMem && (activeMem.planName === plan.planName || activeMem.planId === plan._id);
            const isBtnDisabled = membershipLoading || (activeMembership && !isCurrentPlan);

            const planIcons = ['ri-leaf-fill', 'ri-vip-diamond-fill', 'ri-award-fill', 'ri-trophy-fill'];

            return (
              <div
                key={plan._id || index}
                className={`plan-card ${isCurrentPlan ? 'active-card' : ''}`}
                data-aos="fade-up" data-aos-delay={index * 100}
                style={{ opacity: (activeMembership && !isCurrentPlan) ? 0.6 : 1 }}
                onClick={() => handlePlanSelect(plan, index)}
              >
                {(isCurrentPlan || isBestSeller) && (
                  <div className="plan-badge">
                    {isCurrentPlan ? <><i className="ri-check-line"></i> Current</> : 'Most Popular'}
                  </div>
                )}

                <div className="plan-icon-wrap">
                  <i className={planIcons[index % planIcons.length]}></i>
                </div>

                <h4 className="font-heading fw-bold mb-3">{plan.planName}</h4>

                <div className="plan-price-block">
                  <div className="price-large">
                    <span>₹</span>{formatPrice(discountedPrice).replace('₹', '').trim()}
                  </div>
                  {plan.discountPercentage > 0 && (
                    <div className="d-flex align-items-center gap-2 ">
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontWeight: 600 }}>{formatPrice(plan.price)}</span>
                      <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800 }}>Save {plan.discountPercentage}%</span>
                    </div>
                  )}
                </div>

                <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '0 0 2rem 0' }}></div>

                <ul className="feature-list">
                  <li><i className="ri-stethoscope-line" style={{ fontSize: '1rem' }}></i> <strong>{plan.consultationLimit || 0}</strong> Consultations</li>
                  <li><i className="ri-calendar-check-line" style={{ fontSize: '1rem' }}></i> <strong>{plan.durationDays || 0}</strong> Days Validity</li>
                  {plan.labDeliveryLimit > 0 && <li><i className="ri-test-tube-line" style={{ fontSize: '1rem' }}></i> {plan.labDeliveryLimit} Free Lab Tests</li>}
                  {plan.foodDeliveryLimit > 0 && <li><i className="ri-restaurant-line" style={{ fontSize: '1rem' }}></i> {plan.foodDeliveryLimit} Custom Meals</li>}

                  {plan.features?.map((feat, idx) => (
                    <li key={idx}><i className="ri-checkbox-circle-fill" style={{ fontSize: '1rem' }}></i> {feat}</li>
                  ))}
                </ul>

                <button
                  className={`btn-plan ${isCurrentPlan ? 'btn-active-plan' : isBtnDisabled ? 'btn-disabled-plan' : 'btn-primary-plan'}`}
                  disabled={isBtnDisabled}
                  onClick={(e) => { e.stopPropagation(); handlePlanSelect(plan, index); }}
                >
                  {isCurrentPlan ? 'View Dashboard' : activeMembership ? 'Locked' : 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== STATS MARQUEE (UPDATED WITH GLASS EFFECT + REMIX ICONS) ===== */}
      {careProgramDataUser?.statsSection?.isActive && statsToDisplay.length > 0 && (
        <div className="stats-wrap">
          <div className="stats-track">
            {duplicatedStats.map((stat, idx) => (
              <div
                key={idx}
                className="stat-pill"
                style={{ background: `linear-gradient(135deg, ${stat.bg}, #ffffff)` }}
              >
                {/* Applied 'glass-fx' for the frosted glass effect on Icons */}
                <div
                  className="stat-icon-bx glass-fx"
                  style={{ color: stat.color }}
                >
                  <i className={stat.icon}></i>
                </div>
                <div className="stat-text">
                  <h4>{stat.value}</h4>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 3D DISEASES CAROUSEL ===== */}
      <div className="container-fluid p-0">
        <section className="aurora-section">
          <div className="aurora-orb-1"></div>
          <div className="aurora-orb-2"></div>

          <div className="position-relative text-center" style={{ zIndex: 2 }}>
            <span className="eyebrow" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>Specialized Care</span>
            <h2 className="section-title text-white">Conditions We Treat</h2>
            <p className="section-desc" style={{ color: 'rgba(255,255,255,0.7)' }}>Comprehensive care plans tailored for specific health challenges.</p>
          </div>

          <div className="dz-container">
            {diseases.map((disease, idx) => (
              <div key={disease.id} className={getDiseaseCardClass(idx)} onClick={() => setDiseaseIndex(idx)}>
                <img src={disease.img} alt={disease.title} />
                <div className="dz-info">
                  <h3 className="font-heading fw-bold m-0 mb-2" style={{ fontSize: '1.4rem' }}>{disease.title}</h3>
                  <p className="m-0 mb-3" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{disease.desc}</p>
                  <button className="btn" style={{ padding: '8px 20px', background: '#fff', color: 'var(--text-main)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }} onClick={(e) => { e.stopPropagation(); document.getElementById('programs-section').scrollIntoView({ behavior: 'smooth' }); }}>
                    View Plans
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="dz-controls">
            <button className="ctrl-btn" onClick={() => setDiseaseIndex(p => p === 0 ? diseases.length - 1 : p - 1)}>
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '2px' }}>
              <span className="text-white">0{diseaseIndex + 1}</span> / 0{diseases.length}
            </div>
            <button className="ctrl-btn" onClick={() => setDiseaseIndex(p => p === diseases.length - 1 ? 0 : p + 1)}>
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </section>
      </div>

      {/* ======================================================= */}
      {/* ===== REDESIGNED OVERLAY GLASS CARDS WITH AWESOME ICONS ===== */}
      {/* ======================================================= */}
      {programFeaturesSection.isActive && (
        <div className="container" style={{ maxWidth: '1400px', marginTop: '8rem', marginBottom: '4rem' }}>
          <div className="text-center mb-5 pb-4" data-aos="fade-up">
            <h2 className="section-title">{programFeaturesSection.title}</h2>
            <p className="section-desc">{programFeaturesSection.description}</p>
          </div>

          {featuresToDisplay.map((feature, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={feature.id || idx} className="ed-overlay-card py-5" data-aos="fade-up">

                {/* HD Image logic automatically handles differences */}
                <img src={feature.image} alt={feature.title} className="ed-bg-image" onError={(e) => { e.target.src = CareImg1; }} />

                {/* Gradient Cover to make text readable */}
                <div className={`ed-gradient-cover ${isEven ? 'ed-gradient-left' : 'ed-gradient-right'}`}></div>

                {/* Frosted Glass Content Box */}
                <div className={`ed-glass-box ${!isEven ? 'ed-align-right' : ''}`}>
                  <div className="ed-num-glass">0{idx + 1}</div>

                  {/* Title with corresponding premium icon */}
                  <h3 className="ed-title-glass">
                    <i className={`${feature.icon} ed-title-icon`}></i>
                    {feature.title}
                  </h3>

                  <p className="ed-desc-glass">{feature.description}</p>
                  <a
                    href="#programs-section"
                    className="btn-glass-link"
                    onClick={(e) => { e.preventDefault(); document.getElementById('programs-section').scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    Explore Plans <i className="ri-arrow-right-line"></i>
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ===== PURCHASE MODAL ===== */}
      {showPurchaseModal && selectedPlan && (
        <div className="modal-overlay-2026" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '2.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Checkout</div>
                  <h3 className="font-heading fw-bold m-0" style={{ fontSize: '2rem', letterSpacing: '-1px' }}>Confirm Order</h3>
                </div>
                <button onClick={() => setShowPurchaseModal(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-page)', border: 'none', fontSize: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div style={{ background: 'var(--bg-page)', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--brand-primary)', boxShadow: 'var(--shadow-soft)' }}>
                  <i className="ri-shield-check-fill"></i>
                </div>
                <div className="flex-grow-1">
                  <h4 className="font-heading fw-bold m-0 mb-1">{selectedPlan.planName}</h4>
                  <p className="m-0 text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{selectedPlan.durationDays} Days Access • {selectedPlan.consultationLimit} Consults</p>
                </div>
                <div className="text-end">
                  <div style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{formatPrice(selectedPlan.price)}</div>
                  <div className="font-heading fw-bold" style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>{formatPrice(getDiscountedPrice(selectedPlan))}</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '2.5rem', background: '#FAFAFA' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Payable</span>
                <span className="font-heading fw-bold" style={{ fontSize: '2.2rem', color: 'var(--brand-primary)' }}>{formatPrice(getDiscountedPrice(selectedPlan))}</span>
              </div>

              <button
                className="btn-premium w-100 justify-content-center"
                style={{ background: 'var(--text-main)', color: '#fff', padding: '20px', fontSize: '1.1rem', borderRadius: '20px' }}
                onClick={handleProceedToPayment}
              >
                Proceed to Secure Payment <i className="ri-lock-fill ms-2"></i>
              </button>
              <p className="text-center mt-3 mb-0 text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                <i className="ri-shield-keyhole-line me-1"></i> 256-bit encrypted secure checkout
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CareProgram;
