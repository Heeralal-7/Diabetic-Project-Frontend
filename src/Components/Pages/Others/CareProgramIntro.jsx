import React, { useEffect, useRef, useContext, useState } from "react";
import { gsap } from "gsap";
import { MyContext } from "../../../Context/Context";
 
const CardSlider = ({ cardSliderData = [] }) => {
  const sliderRef = useRef(null);
  const animationRef = useRef(null);
  const [sliderData, setSliderData] = useState([]);
 
  const {
    carePageLoadingUser,
    carePageErrorUser,
    careProgramDataUser,
    fetchCareProgramDataUser,
  } = useContext(MyContext);
 
  // API call on mount
  useEffect(() => {
    console.log(" Fetching care program data...");
    fetchCareProgramDataUser();
  }, []);
 
  // Process API data
  useEffect(() => {
    if (careProgramDataUser?.doctorSlider?.doctors && careProgramDataUser.doctorSlider.doctors.length > 0) {
      console.log(" Processing API data...");
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
          number: idx + 1, // Numbering starting from 1
        }));
     
      console.log(" Total doctors loaded:", processedData.length);
      setSliderData(processedData);
    }
  }, [careProgramDataUser]);
 
  // Bottom to Top Slider Animation
  useEffect(() => {
    if (!sliderRef.current || sliderData.length === 0) {
      console.log("⏸️ Waiting for slider data...");
      return;
    }
 
    console.log("▶️ Starting bottom-to-top animation...");
 
    const slider = sliderRef.current;
    const wrapper = slider.parentElement;
    const cards = slider.children;
    const cardHeight = 150; // Height of each card
    const gap = 20; // Gap between cards
    const totalHeight = (cardHeight + gap) * sliderData.length;
 
    // Set initial positions
    gsap.set(slider, { y: 0 });
 
    // Create infinite loop animation
    const tl = gsap.timeline({ repeat: -1 });
 
    tl.to(slider, {
      y: -totalHeight,
      duration: sliderData.length * 3, // 3 seconds per card
      ease: "none",
      onComplete: () => {
        gsap.set(slider, { y: 0 });
      }
    });
 
    animationRef.current = tl;
 
    // Pause on hover
    const handleMouseEnter = () => {
      tl.pause();
    };
 
    const handleMouseLeave = () => {
      tl.resume();
    };
 
    // Mouse wheel scroll handler
    const handleWheel = (e) => {
      e.preventDefault();
     
      // Get current y position
      const currentY = gsap.getProperty(slider, "y");
      const delta = e.deltaY;
     
      // Calculate new position
      let newY = currentY - delta;
     
      // Wrap around for infinite scroll
      if (newY < -totalHeight) {
        newY = 0;
      } else if (newY > 0) {
        newY = -totalHeight;
      }
     
      // Animate to new position
      gsap.to(slider, {
        y: newY,
        duration: 0.3,
        ease: "power2.out"
      });
    };
 
    wrapper.addEventListener('mouseenter', handleMouseEnter);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    wrapper.addEventListener('wheel', handleWheel, { passive: false });
 
    return () => {
      wrapper.removeEventListener('mouseenter', handleMouseEnter);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
      wrapper.removeEventListener('wheel', handleWheel);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [sliderData]);
 
  // Get heading and side image from API
  const heading = careProgramDataUser?.doctorSlider?.altText ||
    "Treat, Control & Reverse* Diabetes with our Doctor-led Program";
 
  const sideImageUrl = careProgramDataUser?.doctorSlider?.sideImage?.url || "";
  const sideImage = sideImageUrl
    ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${sideImageUrl}`
    : "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=700";
 
  const sideImageHeight = careProgramDataUser?.doctorSlider?.sideImage?.height || "700px";
  const sideImageAlt = careProgramDataUser?.doctorSlider?.sideImage?.altText || "Doctor";
 
  // Loading state
  if (carePageLoadingUser) {
    return (
      <div className="container">
        <div className="row justify-content-center align-items-center" style={{ minHeight: "600px" }}>
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading Care Program Data...</p>
          </div>
        </div>
      </div>
    );
  }
 
  // Error state
  if (carePageErrorUser) {
    console.error(" Error:", carePageErrorUser);
  }
 
  // No data state
  if (sliderData.length === 0) {
    return (
      <div className="container">
        <div className="row justify-content-center align-items-center" style={{ minHeight: "600px" }}>
          <div className="col-12 text-center">
            <p className="text-muted">No doctor testimonials available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <>
      <style>
        {`
          .slider-wrapper {
            position: relative;
            height: 600px;
            overflow: hidden;
            margin-top: 50px;
            padding: 0 10px;
          }
 
          .slider-container {
            position: relative;
            width: 100%;
          }
 
          .slider-card {
            width: 100%;
            max-width: 480px;
            padding: 20px 30px;
            border-radius: 10px;
            background: #fff;
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            box-shadow: 0 4px 9px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            transform-origin: center;
            position: relative; /* For absolute positioning of number */
          }
 
          .slider-card:hover {
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
            transform: scale(1.01);
          }
 
          /* Numbering in bottom-right corner */
          .card-number {
            position: absolute;
            right: 15px;
            bottom: 15px;
            width: 25px;
            height: 25px;
            background-color: white; /* White background */
            color: #333; /* Dark text for contrast */
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            border: 1px solid #ddd; /* Light border for visibility */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
 
          .card-image {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            overflow: hidden;
            box-shadow: 0 4px 9px rgba(0, 0, 0, 0.15);
            flex-shrink: 0;
          }
 
          .card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
 
          .card-content {
            margin-left: 20px;
            flex: 1;
          }
 
          .card-title {
            font-size: 16px;
            color: #4a4545;
            margin: 0;
          }
 
          .card-desc {
            font-size: 15px;
            color: #696d74;
            margin-top: 8px;
          }
 
          .card-city {
            font-size: 12px;
            font-weight: 600;
            color: #696d74;
            text-transform: uppercase;
            margin-top: 8px;
          }
 
          .slider-fade-top {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 80px;
            background: linear-gradient(to bottom, white, transparent);
            z-index: 10;
            pointer-events: none;
          }
 
          .slider-fade-bottom {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 80px;
            background: linear-gradient(to top, white, transparent);
            z-index: 10;
            pointer-events: none;
          }
 
          @media (max-width: 768px) {
            .slider-card {
              max-width: 100%;
              padding: 15px 20px;
            }
           
            .slider-wrapper {
              height: 500px;
            }
           
            h1.text-center {
              font-size: 1.8rem;
            }
 
            .card-number {
              right: 10px;
              bottom: 10px;
              width: 22px;
              height: 22px;
              font-size: 11px;
            }
          }
        `}
      </style>
 
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <h1 className="text-center pt-5 fw-semibold">
            {heading}
          </h1>
 
          <div className="col-md-5 d-flex justify-content-start align-items-center">
            <div className="slider-wrapper">
              <div className="slider-fade-top"></div>
              <div className="slider-container" ref={sliderRef}>
                {/* Render all cards twice for seamless loop */}
                {[...sliderData, ...sliderData].map((item, index) => {
                  // Calculate actual index number (for the second set of cards)
                  const actualIndex = index >= sliderData.length
                    ? (index - sliderData.length) + 1
                    : index + 1;
                 
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className={`slider-card border-${item.borderColor} border-1 border`}
                      style={{ backgroundColor: item.bgColor }}
                    >
                      {/* Numbering in bottom-right corner */}
                      <div className="card-number">
                        {actualIndex}
                      </div>
                      <div className="card-image">
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            console.error(" Image load error:", item.image);
                            e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200";
                          }}
                        />
                      </div>
                      <div className="card-content">
                        <h4 className="card-title fw-semibold text-black">
                          {item.name}
                        </h4>
                        <p className="card-desc fw-semibold text-black">
                          {item.description}
                        </p>
                        <p className="card-city fw-semibold text-black">
                          {item.city}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="slider-fade-bottom"></div>
            </div>
          </div>
 
          <div className="col-md-5 text-center">
            <img
              src={sideImage}
              height={sideImageHeight}
              alt={sideImageAlt}
              className="img-fluid"
              style={{ maxHeight: sideImageHeight, width: "auto" }}
              onError={(e) => {
                console.error(" Side image load error:", sideImage);
                e.target.src = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=700";
              }}
            />
          </div>
        </div>
 
        {/* Debug Info */}
        <div className="row mt-4">
          <div className="col-12 text-center">
            <small className="text-muted">
              Total Testimonials: {sliderData.length}
            </small>
          </div>
        </div>
      </div>
    </>
  );
};
 
export default CardSlider;
 