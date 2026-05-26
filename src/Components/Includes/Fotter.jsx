import React, { useContext, useEffect, useState, useCallback } from 'react'
import img1 from '../Assets/img/Logo.png'
import img2 from '../Assets/img/Accessible.svg';
import img3 from '../Assets/img/Affordable.svg';
import img5 from '../Assets/img/Easy.svg';
import fimg1 from '../Assets/img/visa.png';
import fimg2 from '../Assets/img/MasterCard.png';
import fimg3 from '../Assets/img/american.png';
import fimg4 from '../Assets/img/rupay.png';
import fimg5 from '../Assets/img/CashOnDelivery.png';
import fimg6 from '../Assets/img/Netbanking.png';
import { Link } from 'react-router-dom';
import { MyContext } from '../../Context/Context';

const Fotter = () => {
  const {
    contactData,
    fetchContactData,
    footerContentUser,
    getFooterContentUser,
    banksLogos,
    getBanksLogosPublic,
    banksLogosLoading
  } = useContext(MyContext);

  const [bankLogosData, setBankLogosData] = useState([]);
  const [footerLoading, setFooterLoading] = useState(true);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  // Base URL for image display
  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

  // ✅ Function to get full image URL - MEMOIZED
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) {
      return null;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    const cleanPath = imagePath.replace(/^\/+/, '');
    if (cleanPath.startsWith('uploads/')) {
      return `${BASE_URL}/${cleanPath}`;
    }
    return `${BASE_URL}/uploads/${cleanPath}`;
  }, [BASE_URL]);

  // ✅ Fetch all data once when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      if (hasFetchedData) return;

      setFooterLoading(true);
      try {
        await fetchContactData();
        await getFooterContentUser();
        await getBanksLogosPublic();
        setHasFetchedData(true);
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setFooterLoading(false);
      }
    };

    fetchAllData();
  }, [fetchContactData, getFooterContentUser, getBanksLogosPublic, hasFetchedData]);

  // ✅ Update bank logos data when context changes
  useEffect(() => {
    if (banksLogos && Array.isArray(banksLogos) && bankLogosData.length === 0) {
      const activeLogos = banksLogos
        .filter(logo => logo.isActive)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      setBankLogosData(activeLogos);
    }
  }, [banksLogos, bankLogosData.length]);

  // ✅ Function to render footer sections with icons - REDESIGNED UI
  const renderFooterSection = useCallback((iconPath, heading, content, defaultIcon) => {
    const imageUrl = getImageUrl(iconPath);

    return (
      <div className="col-lg-4 col-md-6 mb-4">
        <div className="feature-card h-100">
          <div className="feature-icon-wrapper">
            <img
              src={imageUrl || defaultIcon}
              alt={heading || "Section icon"}
              onError={(e) => { e.target.src = defaultIcon; }}
              style={{ width: '45px', height: '45px', objectFit: 'contain' }}
            />
          </div>
          <div className="feature-text">
            <h3 className="feature-title">
              {heading || "Default Heading"}
            </h3>
            <p className="feature-desc">
              {content || "Default content description goes here."}
            </p>
          </div>
        </div>
      </div>
    );
  }, [getImageUrl]);

  // ✅ Function to render bank logos
  const renderBankLogos = useCallback(() => {
    if (banksLogosLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50px' }}>
          <div className="spinner-border spinner-border-sm text-light" role="status"></div>
          <span className="ms-2 text-white-50 small">Loading logos...</span>
        </div>
      );
    }

    if (!bankLogosData || bankLogosData.length === 0) {
      return (
        <div className="bank-logo-container">
          <img src={fimg1} alt="Visa" className="bank-logo-img" />
          <img src={fimg2} alt="MasterCard" className="bank-logo-img" />
          <img src={fimg3} alt="American Express" className="bank-logo-img" />
          <img src={fimg4} alt="RuPay" className="bank-logo-img" />
          <img src={fimg5} alt="Cash on Delivery" className="bank-logo-img" />
          <img src={fimg6} alt="Net Banking" className="bank-logo-img" />
        </div>
      );
    }

    return (
      <div className="bank-logo-container">
        {bankLogosData.map((logo) => {
          const imageUrl = getImageUrl(logo.url);
          return (
            <img
              key={logo._id}
              src={imageUrl || fimg1}
              alt={logo.name || `Bank Logo`}
              className="bank-logo-img"
              title={logo.name || ''}
              onError={(e) => { e.target.src = fimg1; }}
            />
          );
        })}
      </div>
    );
  }, [banksLogosLoading, bankLogosData, getImageUrl]);

  return (
    <>
      <style>
        {`
          :root {
            --theme-color: #3d3f96;
            --text-light: rgba(255, 255, 255, 0.75);
            --text-white: #ffffff;
            --border-light: rgba(255, 255, 255, 0.15);
          }

          .custom-footer {
            background-color: var(--theme-color);
            color: var(--text-white);
            position: relative;
            z-index: 99;
            padding-top: 4rem;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }

          /* Headings */
          .footer-heading {
            color: var(--text-white);
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            padding-bottom: 0.5rem;
          }
          
          .footer-heading::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 40px;
            height: 3px;
            background-color: rgba(255, 255, 255, 0.5);
            border-radius: 2px;
          }

          /* Links */
          .footer-links {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .footer-links li {
            margin-bottom: 0.8rem;
          }

          .footer-links a {
            color: var(--text-light);
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            display: inline-block;
          }

          .footer-links a:hover {
            color: var(--text-white);
            transform: translateX(6px);
          }

          /* Social Icons */
          .social-container {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 1rem;
          }

          .social-icon-box {
            width: 42px;
            height: 42px;
            background-color: rgba(255, 255, 255, 0.1);
            color: var(--text-white);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            transition: all 0.3s ease;
            font-size: 1.2rem;
            border: 1px solid transparent;
          }

          .social-icon-box:hover {
            background-color: var(--text-white);
            color: var(--theme-color);
            transform: translateY(-4px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          }

          /* Feature Cards (Middle Section) */
          .feature-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-light);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, background 0.3s ease;
            border-bottom: 3px solid transparent;
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .feature-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.1);
            border-bottom-color: #ffffff;
          }

          /* White background so dark images/SVGs stay visible */
          .feature-icon-wrapper {
            background: #ffffff; 
            padding: 12px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .feature-title {
            color: var(--text-white);
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 0.3rem;
          }

          .feature-desc {
            color: var(--text-light);
            font-size: 0.85rem;
            margin: 0;
            line-height: 1.4;
          }

          /* Bank Logos */
          .bank-logo-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            align-items: center;
            gap: 12px;
          }
          
          @media (max-width: 768px) {
            .bank-logo-container {
              justify-content: center;
              margin-top: 1rem;
            }
          }

          .bank-logo-img {
            object-fit: contain;
            border-radius: 6px;
            background-color: #ffffff;
            padding: 6px;
            transition: all 0.3s ease;
            height: 40px;
            max-width: 70px;
          }

          .bank-logo-img:hover {
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            transform: scale(1.05);
          }

          /* App Download Images */
          .app-download-img {
            width: 140px;
            border-radius: 6px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            display: block;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .app-download-img:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 12px rgba(0,0,0,0.2);
          }

          /* Bottom Bar */
          .bottom-bar {
            background-color: rgba(0, 0, 0, 0.15);
            padding: 1.5rem 0;
            margin-top: 3rem;
            border-top: 1px solid var(--border-light);
          }
        `}
      </style>

      <footer className="custom-footer">
        <div className="container px-3">
          <div className="row gy-4">

            {/* SHOP PRODUCTS */}
            <div className="col-lg col-md-4 col-sm-6 col-12">
              <h6 className="footer-heading">SHOP PRODUCTS</h6>
              <ul className="footer-links">
                <li><Link to="/all-craving-categories">Food Category</Link></li>
                <li><Link to="/all-meals">Food Shops</Link></li>
                <li><Link to="/all-mind-categories">Meal Type</Link></li>
                <li><Link to="/pharmacy-shop">Medicine Shop</Link></li>
                <li><Link to="/pharmacy/products">Medicine Products</Link></li>
                <li><Link to="/pharmacy/medicines">Medicines</Link></li>
                <li><Link to="/venders/labs">Lab Tests</Link></li>
              </ul>
            </div>

            {/* BLOG */}
            <div className="col-lg col-md-4 col-sm-6 col-12">
              <h6 className="footer-heading">BLOG</h6>
              <ul className="footer-links">
                <li><Link to="/blogs/Doctor%20Tips">Doctor Tips</Link></li>
                <li><Link to="/blogs/Mind%20&%20Body">Mind & Body</Link></li>
                <li><Link to="/blogs/Monitoring">Monitoring</Link></li>
                <li><Link to="/blogs/Food%20Lab">Food Lab</Link></li>
                <li><Link to="/blogs/Recipes">Recipes</Link></li>
                <li><Link to="/blogs/Food%20&%20Nutrition">Food & Nutrition</Link></li>
              </ul>
            </div>

            {/* QUICK LINKS */}
            <div className="col-lg col-md-4 col-sm-6 col-12">
              <h6 className="footer-heading">QUICK LINKS</h6>
              <ul className="footer-links">
                <li><Link to="/AboutUs">About Us</Link></li>
                <li><a href="/privacy-policy">Privacy Policy</a></li>
                <li><a href="/term-conditions">Terms & Conditions</a></li>
                <li><Link to="/contact-us">Contact Us</Link></li>
              </ul>
            </div>

            {/* CONTACT & SOCIAL */}
            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
              <h6 className="footer-heading">Connect With Us</h6>
              <p className="small mb-3" style={{ color: 'var(--text-light)' }}>
                Stay updated with our latest news and offers.
              </p>

              <div className="social-container">
                <a href={contactData?.facebookLink || "#"} target="_blank" rel="noopener noreferrer"
                  className="social-icon-box"
                  style={{ opacity: contactData?.facebookLink ? 1 : 0.4, pointerEvents: contactData?.facebookLink ? "auto" : "none" }}>
                  <i className="fa-brands fa-facebook-f"></i>
                </a>

                <a href={contactData?.instaLink || "#"} target="_blank" rel="noopener noreferrer"
                  className="social-icon-box"
                  style={{ opacity: contactData?.instaLink ? 1 : 0.4, pointerEvents: contactData?.instaLink ? "auto" : "none" }}>
                  <i className="fa-brands fa-instagram"></i>
                </a>

                <a href={contactData?.twitterLink || "#"} target="_blank" rel="noopener noreferrer"
                  className="social-icon-box"
                  style={{ opacity: contactData?.twitterLink ? 1 : 0.4, pointerEvents: contactData?.twitterLink ? "auto" : "none" }}>
                  <i className="fa-brands fa-x-twitter"></i>
                </a>

                <a href={contactData?.youtubeLink || "#"} target="_blank" rel="noopener noreferrer"
                  className="social-icon-box"
                  style={{ opacity: contactData?.youtubeLink ? 1 : 0.4, pointerEvents: contactData?.youtubeLink ? "auto" : "none" }}>
                  <i className="fa-brands fa-youtube"></i>
                </a>

                <a href={contactData?.linkedinLink || "#"} target="_blank" rel="noopener noreferrer"
                  className="social-icon-box"
                  style={{ opacity: contactData?.linkedinLink ? 1 : 0.4, pointerEvents: contactData?.linkedinLink ? "auto" : "none" }}>
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
              </div>
            </div>

            {/* DOWNLOAD APP */}
            <div className="col-lg col-md-6 col-sm-6 col-12">
              <h6 className="footer-heading">Download App</h6>
              <div className="d-flex flex-column gap-3 mt-3">
                <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                  <img src="https://onemg.gumlet.io/marketing/6284f3d0-a998-4e94-8cea-91f0961895fc.png" alt="Google Play" className="app-download-img" />
                </a>
                <a href="https://www.apple.com/in/app-store/" target="_blank" rel="noopener noreferrer">
                  <img src="https://onemg.gumlet.io/marketing/45552652-1551-4004-984b-89af60d89e50.png" alt="App Store" className="app-download-img" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ✅ FEATURES SECTION */}
        <div className="container mt-5">
          {footerLoading ? (
            <div className="d-flex justify-content-center align-items-center py-4">
              <div className="spinner-border text-light" role="status"></div>
              <span className="ms-3 fw-semibold text-white">Loading features...</span>
            </div>
          ) : footerContentUser ? (
            <div className="row justify-content-center">
              {renderFooterSection(footerContentUser.easyIcon, footerContentUser.easyHeading, footerContentUser.easyContent, img5)}
              {renderFooterSection(footerContentUser.affordableIcon, footerContentUser.affordableHeading, footerContentUser.affordableContent, img3)}
              {renderFooterSection(footerContentUser.accessibleIcon, footerContentUser.accessibleHeading, footerContentUser.accessibleContent, img2)}
            </div>
          ) : (
            // Default Features Layout
            <div className="row justify-content-center">
              <div className="col-lg-4 col-md-6 mb-4">
                <div className="feature-card h-100">
                  <div className="feature-icon-wrapper">
                    <img src={img5} alt="Easy to use" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                  </div>
                  <div className="feature-text">
                    <h3 className="feature-title">Easy to Use</h3>
                    <p className="feature-desc">Simple and intuitive interface for all users.</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 mb-4">
                <div className="feature-card h-100">
                  <div className="feature-icon-wrapper">
                    <img src={img3} alt="Affordable" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                  </div>
                  <div className="feature-text">
                    <h3 className="feature-title">Affordable</h3>
                    <p className="feature-desc">Competitive pricing for everyone.</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 mb-4">
                <div className="feature-card h-100">
                  <div className="feature-icon-wrapper">
                    <img src={img2} alt="Accessible" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                  </div>
                  <div className="feature-text">
                    <h3 className="feature-title">Accessible</h3>
                    <p className="feature-desc">Available anytime, anywhere.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        
      </footer>
    </>
  )
}

export default React.memo(Fotter);
