// components/AboutUs/AboutUs.js
import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';
import Slider from "react-slick";

const AboutUs = () => {
  const { aboutUsData, loading, error, getAboutUs } = useContext(MyContext);
  const [localData, setLocalData] = useState(null);

  // Settings for Testimonial Slider
  const testimonialSliderSettings = {
    className: "center customSlider1",
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 1000,
    autoplaySpeed: 4000,
    cssEase: "cubic-bezier(0.87, 0, 0.13, 1)",
    pauseOnHover: true,
    arrows: false,
  };

  // Settings for Hero Carousel
  const heroSliderSettings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    fade: true, // Premium fade effect for hero section
    speed: 1200,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    arrows: false,
    appendDots: dots => (
      <div style={{ position: 'absolute', bottom: '40px', width: '100%' }}>
        <ul className="hero-custom-dots"> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <div className="hero-dot-indicator"></div>
    )
  };

  // Function to get complete image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) {
      return `${process.env.REACT_APP_API_URL || ''}${imagePath}`;
    }
    return imagePath;
  };

  // Function to handle image errors
  const handleImageError = (e, fallbackImage) => {
    e.target.src = fallbackImage || "https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/03/about.png";
  };

  useEffect(() => {
    loadAboutUs();
  }, []);

  useEffect(() => {
    if (aboutUsData) {
      setLocalData(aboutUsData);
    }
  }, [aboutUsData]);

  const loadAboutUs = async () => {
    await getAboutUs();
  };

  if (loading && !localData) {
    return (
      <div className="premium-loading">
        <div className="premium-spinner"></div>
        <p>Loading About Us...</p>
      </div>
    );
  }

  if (!localData) {
    return (
      <div className="text-center py-5">
        <h5>No About Us content available</h5>
      </div>
    );
  }

  // Array of images for the Hero Carousel (Uses API image first, then falls back to premium placeholders)
  const heroCarouselImages = [
    getImageUrl(localData.mainImage) || 'https://images.unsplash.com/photo-1551076805-e18690c5e531?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1538108149393-cebb47ac194a?auto=format&fit=crop&w=2000&q=80'
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        :root {
          /* REQUESTED THEME COLORS */
          --color-brand: #3d3f96;         /* Deep Indigo */
          --color-brand-light: #5a5db8;   /* Lighter Indigo */
          --color-brand-dark: #2a2b6e;    /* Dark Indigo */
          --color-brand-soft: #eef0f8;    /* Very light tinted background */
          
          --color-dark: #1e204d;          /* Deep Navy Text */
          --color-text: #4b5563;          /* Main Body Text */
          --color-text-light: #9ca3af;    /* Muted Text */
          
          --color-bg-light: #f9fafb;      /* Main Background */
          --color-white: #ffffff;         /* Pure White */
          --color-border: #e5e7eb;        /* Soft Border */
          
          --shadow-soft: 0 10px 30px -10px rgba(30, 32, 77, 0.08);
          --shadow-hover: 0 20px 40px -10px rgba(61, 63, 150, 0.2);
          
          --border-radius-lg: 24px;
          --border-radius-md: 16px;
        }

        .about-wrapper {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--color-text);
          background-color: var(--color-bg-light);
          overflow-x: hidden;
        }

        /* Loading State */
        .premium-loading {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: var(--color-bg-light);
        }
        .premium-spinner {
          width: 50px; height: 50px;
          border: 3px solid var(--color-brand-soft);
          border-top-color: var(--color-brand);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Typography */
        h1, h2, h3, h4, h5, h6 { color: var(--color-dark); font-family: 'Outfit', sans-serif; }
        
        .section-eyebrow {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--color-brand);
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .section-eyebrow::before {
          content: '';
          width: 40px; height: 2px;
          background: var(--color-brand);
          border-radius: 2px;
        }

        /* ═══════════════════════════════
           HERO CAROUSEL SECTION (OVER BLACK)
        ═══════════════════════════════ */
        .hero-slider-wrapper {
          position: relative;
          background-color: #000;
          overflow: hidden;
        }
        .hero-slide {
          position: relative;
          padding: 200px 0 160px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          text-align: center;
          outline: none;
        }
        /* Black Gradient Overlay */
        .hero-slide::before {
          content: '';
          position: absolute; inset: 0;
         background: linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 100%);
          z-index: 1;
        }
        .about-hero-content {
          position: relative; 
          z-index: 2;
    padding: 0px 100px;
    max-width:800px;
       
         
        }
        .about-hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(3.5rem, 6vw, 5rem);
          color: var(--color-white);
          font-weight: 800;
          line-height: 1.1;
    
          text-shadow: 0 10px 30px rgba(0,0,0,0.5);
          transform: translateY(20px);
          opacity: 0;
          animation: fadeUp 1s forwards 0.5s;
        }
        .about-hero-title-accent {
          color: var(--color-brand-light);
        }
        .about-hero-subtitle {
          color: rgba(255,255,255,0.8);
          font-size: 1.2rem;
          line-height: 1.8;
          font-family: 'Plus Jakarta Sans', sans-serif;
          text-shadow: 0 4px 10px rgba(0,0,0,0.3);
          transform: translateY(20px);
          opacity: 0;
          animation: fadeUp 1s forwards 0.8s;
        
          margin: 0 auto;
        }

        @keyframes fadeUp {
          to { transform: translateY(0); opacity: 1; }
        }

        /* Custom Hero Dots */
        .hero-custom-dots {
          display: flex;
          justify-content: center;
          gap: 12px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .hero-custom-dots li { margin: 0; }
        .hero-dot-indicator {
          width: 30px;
          height: 4px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          transition: all 0.4s ease;
          cursor: pointer;
        }
        .hero-custom-dots li.slick-active .hero-dot-indicator {
          background-color: var(--color-brand-light);
          width: 45px;
          box-shadow: 0 0 10px rgba(90, 93, 184, 0.5);
        }

        /* ═══════════════════════════════
           INTRO / SPLIT SECTION
        ═══════════════════════════════ */
        .intro-section {
          position: relative;
          padding: 120px 0;
          background-color: var(--color-white);
          background-image: radial-gradient(var(--color-bg-light) 2px, transparent 2px);
          background-size: 30px 30px;
          z-index: 1;
        }
        .image-showcase {
          position: relative;
          border-radius: var(--border-radius-lg);
          padding-bottom: 40px; 
          padding-right: 40px;
        }
        .image-showcase-inner {
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(30, 32, 77, 0.1);
          position: relative;
          z-index: 2;
        }
        .image-showcase-inner img {
          width: 100%; height: auto; object-fit: cover;
          transition: transform 0.7s ease;
        }
        .image-showcase:hover .image-showcase-inner img {
          transform: scale(1.05);
        }
        
        .premium-stat-badge {
          position: absolute;
          bottom: 0; right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          padding: 24px 32px;
          border-radius: var(--border-radius-md);
          box-shadow: 0 20px 40px rgba(30, 32, 77, 0.1);
          border: 1px solid rgba(255,255,255,0.8);
          text-align: center;
          border-left: 5px solid var(--color-brand);
          z-index: 5;
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .premium-stat-badge h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 2.8rem; font-weight: 800;
          color: var(--color-brand); margin: 0; line-height: 1;
        }
        .premium-stat-badge p {
          font-size: 0.8rem; font-weight: 700;
          color: var(--color-text); margin: 8px 0 0;
          letter-spacing: 1px; text-transform: uppercase;
        }

        .intro-features-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px; margin: 30px 0;
        }
        .feature-item {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 0.95rem; font-weight: 600; color: var(--color-dark);
        }
        .feature-icon {
          color: var(--color-brand); font-size: 1.2rem; margin-top: 2px;
        }

        .priority-box {
          background: linear-gradient(90deg, var(--color-bg-light), transparent);
          border-left: 4px solid var(--color-brand);
          padding: 24px; border-radius: 0 12px 12px 0;
          margin-top: 30px;
        }
        .priority-box h5 { margin: 0; font-size: 1.1rem; color: var(--color-brand-dark); font-weight: 700;}

        /* ═══════════════════════════════
           PREMIUM CARDS SECTION
        ═══════════════════════════════ */
        .cards-section {
          position: relative;
          padding: 100px 0;
          background: var(--color-bg-light);
          background-image: url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=2000&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          z-index: 1;
        }
        .cards-section::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(249, 250, 251, 0.92); 
          z-index: -1;
        }
        .premium-card {
          background: var(--color-white);
          border-radius: var(--border-radius-lg);
          padding: 40px 30px;
          height: 100%;
          transition: all 0.4s ease;
          border: 1px solid var(--color-border);
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-soft);
        }
        .premium-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
          background: var(--color-brand);
          transform: scaleX(0); transform-origin: left; transition: transform 0.4s ease;
        }
        .premium-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-hover);
          border-color: rgba(61, 63, 150, 0.2);
        }
        .premium-card:hover::before { transform: scaleX(1); }
        
        .premium-card-icon-wrap {
          width: 70px; height: 70px;
          border-radius: 16px;
          background: var(--color-brand-soft);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px; transition: 0.4s;
        }
        .premium-card:hover .premium-card-icon-wrap {
          background: var(--color-brand);
        }
        .premium-card:hover .premium-card-icon-wrap img { filter: brightness(0) invert(1); }

        /* ═══════════════════════════════
           MORE ABOUT SECTION
        ═══════════════════════════════ */
        .more-about-section {
          padding: 120px 0;
          background: var(--color-white);
        }
        .more-about-img {
          border-radius: var(--border-radius-lg);
          box-shadow: 0 20px 40px rgba(30, 32, 77, 0.1);
        }

        /* ═══════════════════════════════
           MISSION / VISION SECTION
        ═══════════════════════════════ */
        .mission-section {
          position: relative;
          padding: 120px 0;
          background: var(--color-dark);
          background-image: url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=2000&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          z-index: 1;
        }
        /* Deep Indigo gradient over image */
        .mission-section::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(30, 32, 77, 0.95) 0%, rgba(61, 63, 150, 0.85) 100%);
          z-index: -1;
        }
        .mission-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--border-radius-lg);
          padding: 40px 30px;
          height: 100%;
          text-align: center;
          transition: all 0.4s ease;
        }
        .mission-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-8px);
          border-color: rgba(255,255,255,0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .mission-card-icon-wrap {
          width: 80px; height: 80px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
          background: rgba(255,255,255,0.1);
        }
        .mission-card h4 { color: var(--color-white); font-weight: 700; }
        .mission-card p { color: #e2e8f0; }

        /* ═══════════════════════════════
           TESTIMONIALS SECTION
        ═══════════════════════════════ */
        .testimonial-section {
          position: relative;
          padding: 140px 0;
          background-image: url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          color: var(--color-white);
          z-index: 1;
        }
        /* Dark Indigo overlay */
        .testimonial-section::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(30, 32, 77, 0.9);
          z-index: -1;
        }
        .testimonial-card {
          text-align: center;
          padding: 40px;
        }
        .testimonial-quote-icon {
          font-size: 3.5rem; color: var(--color-brand-light); opacity: 0.6;
          margin-bottom: 24px;
        }
        .testimonial-text {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          line-height: 1.6; font-style: italic; margin-bottom: 30px;
          color: var(--color-white);
        }
        .testimonial-author {
          font-size: 1.1rem; font-weight: 700; color: var(--color-brand-light);
          text-transform: uppercase; letter-spacing: 2px;
        }
        .testimonial-section .slick-dots li button:before { color: var(--color-white); opacity: 0.3; font-size: 14px; }
        .testimonial-section .slick-dots li.slick-active button:before { color: var(--color-brand-light); opacity: 1; }

        /* ═══════════════════════════════
           INSURANCE PARTNERS
        ═══════════════════════════════ */
        .insurance-section {
          padding: 100px 0;
          background: var(--color-bg-light);
          background-image: radial-gradient(var(--color-border) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .insurance-box {
          background: var(--color-white);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-md);
          padding: 30px; height: 100%;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease; filter: grayscale(100%); opacity: 0.6;
          box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        }
        .insurance-box:hover {
          filter: grayscale(0%); opacity: 1;
          box-shadow: var(--shadow-soft); border-color: var(--color-brand-light);
          transform: translateY(-5px);
        }

        @media (max-width: 768px) {
          .image-showcase { padding-right: 0; padding-bottom: 60px; }
          .premium-stat-badge { right: 50%; transform: translateX(50%); bottom: 0; width: 80%; }
          .intro-features-list { grid-template-columns: 1fr; }
          .cards-section, .mission-section, .testimonial-section { background-attachment: scroll; } 
        }
      `}</style>

      <div className="about-wrapper">

        {/* ══════ PREMIUM CAROUSEL HERO SECTION ══════ */}
        <div className="hero-slider-wrapper">
          <Slider {...heroSliderSettings}>
            {heroCarouselImages.map((imgSrc, index) => (
              <div key={index}>
                <div
                  className="hero-slide"
                  style={{ backgroundImage: `url(${imgSrc})` }}
                >
                  <div className="about-hero-content">
                    <h1 className="about-hero-title text-start">
                      {localData.heroTitle ? (
                        <>
                          {localData.heroTitle.split(' ').slice(0, -1).join(' ')} <br />
                          <span className="about-hero-title-accent">{localData.heroTitle.split(' ').slice(-1)}</span>
                        </>
                      ) : (
                        <>About <span className="about-hero-title-accent">Us</span></>
                      )}
                    </h1>
                    <p className="about-hero-subtitle text-start p-0">
                      {localData.mainDescription || "Embrace a world of comprehensive healthcare where your well-being takes center stage. At DiabetesWala, we're dedicated to providing personalized and compassionate medical services."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* ══════ INTRO / SPLIT SECTION ══════ */}
        <section className="intro-section">
          <div className="container">
            <div className="row align-items-center g-5">

              <div className="col-lg-6">
                <div className="image-showcase">
                  <div className="image-showcase-inner">
                    <img
                      src={getImageUrl(localData.heroImage) || "https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/03/about.png"}
                      alt="About DiabetesWala"
                      onError={(e) => handleImageError(e, "https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/03/about.png")}
                    />
                  </div>

                  <div className="premium-stat-badge">
                    <h2>{localData.stats?.patientReviews || "5k+"}</h2>
                    <p>Patient<br />Reviews</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 ps-lg-5">
                <div className="section-eyebrow">About DiabetesWala</div>
                <h2 className="display-5 fw-bold mb-4" style={{ lineHeight: '1.2' }}>
                  {localData.mainTitle || "We Provide Finest Patient Care & Amenities"}
                </h2>

                <p className="text-muted fs-5 mb-4">
                  {localData.additionalContent || "We are dedicated to offering world-class care and pioneering treatments to ensure the healthiest outcomes for all our patients."}
                </p>

                <div className="intro-features-list">
                  {(localData.leftFeatures || []).map((feature, index) => (
                    <div key={`left-${index}`} className="feature-item">
                      <i className="fa-solid fa-check-circle feature-icon"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                  {(localData.rightFeatures || []).map((feature, index) => (
                    <div key={`right-${index}`} className="feature-item">
                      <i className="fa-solid fa-check-circle feature-icon"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="priority-box">
                  <h5>{localData.priorityStatement || "YOUR HEALTH IS OUR TOP PRIORITY"}</h5>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════ CARDS SECTION ══════ */}
        {localData.cards && localData.cards.length > 0 && (
          <section className="cards-section">
            <div className="container">
              <div className="row g-4">
                {localData.cards.map((card, index) => (
                  <div key={card._id || index} className="col-md-4">
                    <div className="premium-card">
                      {card.image && (
                        <div className="premium-card-icon-wrap">
                          <img
                            src={getImageUrl(card.image)}
                            width="35px"
                            alt={card.title}
                            onError={(e) => handleImageError(e, "https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/03/img1.png")}
                          />
                        </div>
                      )}
                      <h4 className="fw-bold mb-3">{card.title}</h4>
                      <p className="text-muted m-0">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════ MORE ABOUT SECTION ══════ */}
        {(localData.moreAboutTitle || localData.moreAboutDescription) && (
          <section className="more-about-section">
            <div className="container">
              <div className="row align-items-center g-5 flex-row-reverse">
                <div className="col-lg-6">
                  {localData.moreAboutImage && (
                    <img
                      src={getImageUrl(localData.moreAboutImage)}
                      className="img-fluid more-about-img w-100"
                      alt="More About Us"
                      onError={(e) => handleImageError(e, "https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/03/about.png")}
                    />
                  )}
                </div>
                <div className="col-lg-6 pe-lg-5">
                  <div className="section-eyebrow">Discover More</div>
                  <h2 className="display-6 fw-bold mb-4">{localData.moreAboutTitle}</h2>
                  <p className="text-muted fs-5 mb-4">{localData.moreAboutDescription}</p>
                  {localData.moreAboutSideDescription && (
                    <div className="p-4 rounded-4 shadow-sm border-start border-4" style={{ backgroundColor: 'var(--color-bg-light)', borderColor: 'var(--color-brand)' }}>
                      <p className="text-muted m-0 fst-italic">{localData.moreAboutSideDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════ MISSION / VISION SECTION ══════ */}
        {localData.missionVision && localData.missionVision.length > 0 && (
          <section className="mission-section">
            <div className="container">
              <div className="row g-4 justify-content-center">
                {localData.missionVision.map((item, index) => (
                  <div key={item._id || index} className="col-md-4">
                    <div className="mission-card" style={{ borderTop: `4px solid ${item.backgroundColor || 'var(--color-brand-light)'}` }}>
                      <div className="mission-card-icon-wrap">
                        <i className={`fa-solid ${item.icon} text-white fs-2`} style={{ color: item.backgroundColor || 'white' }} />
                      </div>
                      <h4 className="fw-bold mb-3">{item.title}</h4>
                      <p className="m-0">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════ TESTIMONIALS SECTION ══════ */}
        {localData.testimonials && localData.testimonials.length > 0 && (
          <section className="testimonial-section">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-9">
                  <div className="text-center mb-5">
                    <div className="section-eyebrow justify-content-center" style={{ color: 'var(--color-brand-light)' }}>
                      Patient Stories
                    </div>
                  </div>

                  <Slider {...testimonialSliderSettings}>
                    {localData.testimonials.map((testimonial, index) => (
                      <div key={index} className="testimonial-card">
                        <i className="fa-solid fa-quote-left testimonial-quote-icon"></i>
                        <h3 className="testimonial-text">"{testimonial.text}"</h3>
                        {testimonial.author && (
                          <div className="testimonial-author">{testimonial.author}</div>
                        )}
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════ INSURANCE SECTION ══════ */}
        {localData.insuranceLogos && localData.insuranceLogos.length > 0 && (
          <section className="insurance-section">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-4 mb-5 mb-lg-0">
                  <div className="section-eyebrow">Partnerships</div>
                  <h2 className="display-6 fw-bold">
                    {localData.insuranceTitle || "Our Accepted Insurance Providers"}
                  </h2>
                  <p className="text-muted mt-3">
                    We work with a wide range of insurance providers to ensure you get the care you need without the financial stress.
                  </p>
                </div>

                <div className="col-lg-8">
                  <div className="row g-3 justify-content-center">
                    {localData.insuranceLogos.map((logo, index) => (
                      <div key={index} className="col-6 col-sm-4 col-md-3">
                        <div className="insurance-box">
                          <img
                            src={getImageUrl(logo)}
                            className="img-fluid"
                            alt={`Insurance Partner ${index + 1}`}
                            onError={(e) => handleImageError(e, "https://themes.hibootstrap.com/hospa/wp-content/uploads/2024/04/partner1.png")}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </>
  );
};

export default AboutUs;
