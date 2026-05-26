// src/Pages/Blogs/Blogs.js
import React, { useEffect, useContext, useState, useRef } from "react";
import "../../Assets/Css/Blog.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import Aos from "aos";
import { MyContext } from "../../../Context/Context";

const Blogs = () => {
  const { tabType } = useParams(); // Get tabType from URL
  const navigate = useNavigate();

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Initialize AOS animations
  useEffect(() => {
    Aos.init({ duration: 800, once: true });
    Aos.refresh();
  }, []);

  // Consume context
  const {
    blogs,
    loading,
    error,
    getBlogs,
    searchTerm,
    selectedTab,
    TAB_TYPES,
    filterBlogsByType,
    searchBlogs,
    resetToAllBlogs,
    setSearchTerm,
  } = useContext(MyContext);

  const URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Sync URL with selected tab
  useEffect(() => {
    if (tabType) {
      if (tabType === 'all') {
        resetToAllBlogs();
      } else {
        filterBlogsByType(tabType);
      }
    } else {
      resetToAllBlogs();
    }
  }, [tabType]);

  // Initial data fetch
  useEffect(() => {
    getBlogs();
  }, []);

  // --- Search Bar Logic ---
  const searchInputRef = useRef(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchBlogs(debouncedSearchTerm);
    } else {
      if (!selectedTab) {
        resetToAllBlogs();
      }
    }
  }, [debouncedSearchTerm]);

  const handleSearchInputChange = (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    const handler = setTimeout(() => {
      setDebouncedSearchTerm(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  // --- Tab Logic with Routing ---
  const handleTabClick = (type) => {
    if (selectedTab === type) {
      navigate('/blogs');
      resetToAllBlogs();
    } else {
      navigate(`/blogs/${type}`);
      filterBlogsByType(type);
    }
  };

  const handleAllTabClick = () => {
    navigate('/blogs');
    resetToAllBlogs();
  };

  const blogsArray = Array.isArray(blogs) ? blogs : [];

  // --- Carousel Data & Logic ---
  const heroSlides = [
    {
      title: "Discover Our Latest Insights",
      subtitle: "Explore expert articles, tips, and breakthroughs in medical research from the DiabetesWala team.",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=2000&q=80"
    },
    {
      title: "Nutrition & Wellness",
      subtitle: "Learn how to balance your diet and live a healthier life with our expert guides.",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=2000&q=80"
    },
    {
      title: "Medical Breakthroughs",
      subtitle: "Stay updated with the latest technological advancements and research in healthcare.",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=2000&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        :root {
          /* REQUESTED THEME COLORS */
          --blog-primary: #3d3f96;         
          --blog-primary-light: #5a5db8;   
          --blog-primary-soft: #eef0f8;    
          
          --blog-dark: #1e204d;            
          --blog-text: #4b5563;            
          --blog-text-light: #9ca3af;      
          
          --blog-bg: #f3f4f6;              /* Slightly darker gray to make glass pop */
          --blog-white: #ffffff;           
          --blog-border: #e5e7eb;          
        }

        .premium-blogs-wrapper {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--blog-bg);
          min-height: 100vh;
          padding-bottom: 100px;
          position: relative;
          overflow-x: hidden;
        }

        /* ═════════ CAROUSEL HERO SECTION ═════════ */
        .blog-hero-carousel {
          position: relative;
          width: 100%;
          height: 65vh;
          min-height: 500px;
          background: #000;
          overflow: hidden;
          z-index: 10;
        }
        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1s ease-in-out;
          background-size: cover;
          background-position: center;
        }
        .hero-slide.active {
          opacity: 1;
          z-index: 1;
        }
        /* Black Overlay */
        .hero-black-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.9) 100%);
          z-index: 2;
        }
        .hero-content {
          position: relative;
          z-index: 3;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: white;
          padding: 0 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        .hero-badge {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 8px 24px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 20px;
          text-shadow: 0 10px 20px rgba(0,0,0,0.5);
        }
        .hero-subtitle {
          font-size: 1.15rem;
          color: rgba(255,255,255,0.8);
          max-width: 600px;
          line-height: 1.6;
        }
        .hero-dots {
          position: absolute;
          bottom: 70px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 4;
        }
        .hero-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.4s ease;
        }
        .hero-dot.active {
          background: var(--blog-primary);
          width: 35px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(61, 63, 150, 0.6);
        }

        /* ═════════ CONTROLS (SEARCH & TABS) ═════════ */
        .blog-controls-container {
          position: relative;
          z-index: 20;
          max-width: 1250px;
          margin: -40px auto 50px;
          background: var(--blog-white);
          border-radius: 16px;
          padding: 20px 30px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.06);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .search-wrapper {
          position: relative;
          flex: 1;
          min-width: 280px;
        }
        .search-wrapper i.search-icon {
          position: absolute;
          left: 20px; top: 50%;
          transform: translateY(-50%);
          color: var(--blog-text-light);
        }
        .premium-search-input {
          width: 100%;
          background: var(--blog-bg);
          border: 1px solid var(--blog-border);
          border-radius: 50px;
          padding: 14px 45px;
          font-size: 1rem;
          color: var(--blog-dark);
          transition: all 0.3s ease;
          outline: none;
        }
        .premium-search-input:focus {
          border-color: var(--blog-primary);
          background: var(--blog-white);
          box-shadow: 0 0 0 4px var(--blog-primary-soft);
        }
        .clear-search-btn {
          position: absolute;
          right: 15px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: var(--blog-text-light);
          cursor: pointer;
          transition: 0.3s;
        }
        .clear-search-btn:hover { color: #ef4444; }

        .tabs-wrapper {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .premium-tab-btn {
          background: transparent;
          color: var(--blog-text);
          border: 1px solid var(--blog-border);
          padding: 10px 24px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: capitalize;
        }
        .premium-tab-btn:hover {
          border-color: var(--blog-primary);
          color: var(--blog-primary);
        }
        .premium-tab-btn.active {
          background: var(--blog-primary);
          color: var(--blog-white);
          border-color: var(--blog-primary);
          box-shadow: 0 4px 15px rgba(61, 63, 150, 0.25);
        }

        /* ═════════ REDESIGNED GLASSMORPHISM CARDS ═════════ */
        
        /* Background Blobs to make Glassmorphism visible */
        .glass-background-blobs {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          overflow: hidden;
          z-index: 1;
          pointer-events: none;
        }
        .blob-1 {
          position: absolute;
          top: 10%; left: -5%;
          width: 500px; height: 500px;
          background: rgba(61, 63, 150, 0.15); /* #3d3f96 tinted */
          border-radius: 50%;
          filter: blur(80px);
        }
        .blob-2 {
          position: absolute;
          bottom: 20%; right: -5%;
          width: 400px; height: 400px;
          background: rgba(20, 184, 166, 0.12); /* Teal tinted */
          border-radius: 50%;
          filter: blur(80px);
        }

        .cards-container {
          position: relative;
          z-index: 5;
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 20px 80px;
        }
        .section-header {
          font-family: 'Outfit', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--blog-dark);
          text-align: center;
          margin-bottom: 50px;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 40px;
        }

        /* The Glass Card */
        .glass-editorial-card {
          /* Glassmorphism Background & Blur */
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          
          /* Borders & Shadows */
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          padding: 16px; /* Padding to float the image inside the glass */
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
          
          display: flex;
          flex-direction: column;
          height: 100%;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        
        .glass-editorial-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 20px 40px 0 rgba(61, 63, 150, 0.15);
          border-color: var(--blog-white);
        }

        /* Card Image */
        .ec-image-box {
          width: 100%;
          height: 220px;
          overflow: hidden;
          position: relative;
          border-radius: 16px; /* Rounded inner image */
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .ec-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }
        .glass-editorial-card:hover .ec-image {
          transform: scale(1.08);
        }
        
        /* Category Badge */
        .ec-category-tag {
          position: absolute;
          top: 16px; left: 16px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          color: var(--blog-primary);
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          z-index: 2;
        }

        /* Content Area */
        .ec-content {
          padding: 24px 10px 10px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        
        /* Star Rating */
        .ec-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 12px;
        }
        .ec-rating i {
          color: #F59E0B; /* Golden Yellow for Stars */
          font-size: 0.9rem;
        }
        .ec-rating-text {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--blog-text);
          margin-left: 4px;
        }

        .ec-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--blog-dark);
          line-height: 1.3;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.3s ease;
        }
        .glass-editorial-card:hover .ec-title {
          color: var(--blog-primary);
        }

        .ec-excerpt {
          font-size: 0.95rem;
          color: var(--blog-text);
          line-height: 1.6;
          margin-bottom: 24px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        /* Glass Card Footer */
        .ec-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          margin-top: auto;
        }
        
        .ec-read-more {
          font-weight: 700;
          color: var(--blog-primary);
          font-size: 0.95rem;
        }

        /* Circular Arrow Button */
        .ec-arrow-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--blog-white);
          color: var(--blog-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          transition: all 0.4s ease;
        }
        
        .glass-editorial-card:hover .ec-arrow-circle {
          background: var(--blog-primary);
          color: var(--blog-white);
          transform: rotate(-45deg);
          box-shadow: 0 6px 15px rgba(61, 63, 150, 0.4);
        }

        /* ═════════ LOADING & EMPTY STATES ═════════ */
        .state-container {
          text-align: center;
          padding: 80px 20px;
        }
        .premium-spinner {
          width: 50px; height: 50px;
          border: 3px solid var(--blog-primary-soft);
          border-top-color: var(--blog-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Responsive */
        @media (max-width: 992px) {
          .blog-controls-container { flex-direction: column; margin: -30px 20px 40px; }
          .search-wrapper { width: 100%; }
          .tabs-wrapper { width: 100%; justify-content: center; }
        }
        @media (max-width: 768px) {
          .blog-hero-carousel { height: 50vh; min-height: 400px; }
          .hero-title { font-size: 2.2rem; }
          .cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="premium-blogs-wrapper">

        {/* Abstract Background Blobs for Glass Effect */}
        <div className="glass-background-blobs">
          <div className="blob-1"></div>
          <div className="blob-2"></div>
        </div>

        {/* ═════════ CAROUSEL HERO OVER BLACK ═════════ */}
        <div className="blog-hero-carousel">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Black overlay */}
              <div className="hero-black-overlay"></div>

              <div className="hero-content">
                <div className="hero-badge">Knowledge Hub</div>
                <h1 className="hero-title" data-aos="fade-up">{slide.title}</h1>
                <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="100">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}

          {/* Carousel Dots */}
          <div className="hero-dots">
            {heroSlides.map((_, index) => (
              <div
                key={index}
                className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              ></div>
            ))}
          </div>
        </div>

        {/* ═════════ SEARCH & TABS ═════════ */}
        <div className="blog-controls-container">
          {/* Search */}
          <div className="search-wrapper">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              ref={searchInputRef}
              type="text"
              className="premium-search-input"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={handleClearSearch} title="Clear search">
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="tabs-wrapper">
            <button
              className={`premium-tab-btn ${!tabType || tabType === 'all' ? 'active' : ''}`}
              onClick={handleAllTabClick}
            >
              All Articles
            </button>
            {TAB_TYPES.map((type) => (
              <button
                key={type}
                className={`premium-tab-btn ${tabType === type ? 'active' : ''}`}
                onClick={() => handleTabClick(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* ═════════ REDESIGNED GLASSMORPHISM CARDS GRID ═════════ */}
        <section className="cards-container">

          {/* Loading State */}
          {loading && (
            <div className="state-container">
              <div className="premium-spinner"></div>
              <h4 className="text-muted mt-3">Fetching Articles...</h4>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && blogsArray.length === 0 && (
            <div className="state-container" data-aos="fade-in">
              <i className="fa-regular fa-folder-open mb-3" style={{ fontSize: '4rem', color: 'var(--blog-text-light)' }}></i>
              <h3 className="mb-2">No Articles Found</h3>
              <p className="text-muted">Try adjusting your search or selecting a different category.</p>
            </div>
          )}

          {/* Section Title */}
          {!loading && blogsArray.length > 0 && (
            <h2 className="section-header" data-aos="fade-up">
              {tabType && tabType !== 'all' ? `${tabType} Articles` : "Recent Publications"}
            </h2>
          )}

          {/* Cards Grid */}
          <div className="cards-grid">
            {blogsArray.map((blog, index) => {

              // Generate a random high rating between 4.5 and 5.0 for UI display
              // (If rating data doesn't exist in your API)
              const fakeRating = (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1);

              return (
                <Link
                  key={blog._id || index}
                  to={`/blogs/${tabType || 'all'}/blog/${blog._id}`}
                  className="glass-editorial-card"
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  <div className="ec-image-box">
                    <div className="ec-category-tag">
                      {tabType && tabType !== 'all' ? tabType : "Article"}
                    </div>
                    <img
                      className="ec-image"
                      src={
                        blog.blogimage
                          ? `${URL}${blog.blogimage}`
                          : "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={blog.title || "Blog Image"}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                  </div>

                  <div className="ec-content">
                    {/* Star Rating Section */}
                    <div className="ec-rating">
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star-half-stroke"></i>
                      <span className="ec-rating-text">{blog.rating || fakeRating}</span>
                    </div>

                    <h3 className="ec-title">{blog.title || "Untitled Insight"}</h3>
                    <p className="ec-excerpt">
                      {blog.description
                        ? blog.description
                        : "Click to read more about this detailed medical insight from our experts. Explore breakthroughs and more."}
                    </p>

                    <div className="ec-footer">
                      <span className="ec-read-more">Read Article</span>
                      <div className="ec-arrow-circle">
                        <i className="fa-solid fa-arrow-right"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </>
  );
};

export default Blogs;
