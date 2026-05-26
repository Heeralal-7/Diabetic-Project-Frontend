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

    // If imagePath already contains full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Remove any leading slashes
    const cleanPath = imagePath.replace(/^\/+/, '');
    
    // If it starts with uploads, construct full URL
    if (cleanPath.startsWith('uploads/')) {
      return `${BASE_URL}/${cleanPath}`;
    }

    // If it's a simple filename or path, construct full URL
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

  // ✅ Update bank logos data when context changes - FIXED DEPENDENCY
  useEffect(() => {
    if (banksLogos && Array.isArray(banksLogos) && bankLogosData.length === 0) {
      // Filter only active logos and sort by order
      const activeLogos = banksLogos
        .filter(logo => logo.isActive)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setBankLogosData(activeLogos);
    }
  }, [banksLogos, bankLogosData.length]);

  // ✅ Function to render footer sections with icons - MEMOIZED
  const renderFooterSection = useCallback((iconPath, heading, content, defaultIcon) => {
    const imageUrl = getImageUrl(iconPath);
    
    return (
      
      <div className="mx-auto" style={{ maxWidth: '300px' }}>
        <div className="row">
          <div className="w-auto">
            <img 
              src={imageUrl || defaultIcon} 
              width="60px" 
              height="60px"
              alt={heading || "Section icon"} 
              onError={(e) => {
                e.target.src = defaultIcon;
              }}
              style={{ 
                objectFit: 'contain',
                padding: '5px'
              }}
            />
          </div>
          <div className="col-8">
            <h2 className="text-colorrr" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {heading || "Default Heading"}
            </h2>
            <h6 className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>
              {content || "Default content description goes here."}
            </h6>
          </div>
        </div>
      </div>
    );
  }, [getImageUrl]);

  // ✅ Function to render bank logos - MEMOIZED
  const renderBankLogos = useCallback(() => {
    if (banksLogosLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading bank logos...</span>
        </div>
      );
    }

    if (!bankLogosData || bankLogosData.length === 0) {
      // ✅ If no bank logos uploaded, show default payment images
      return (
        <>
          <img src={fimg1} width="70px" alt="Visa" className="me-3 mb-2" />
          <img src={fimg2} width="70px" alt="MasterCard" className="me-3 mb-2" />
          <img src={fimg3} width="70px" alt="American Express" className="me-3 mb-2" />
          <img src={fimg4} width="70px" alt="RuPay" className="me-3 mb-2" />
          <img src={fimg5} width="70px" alt="Cash on Delivery" className="me-3 mb-2" />
          <img src={fimg6} width="70px" alt="Net Banking" className="me-3 mb-2" />
        </>
      );
    }

    // ✅ Render uploaded bank logos
    return bankLogosData.map((logo) => {
      const imageUrl = getImageUrl(logo.url);
      
      return (
        <img 
          key={logo._id}
          src={imageUrl || fimg1}
          width="70px" 
          height="40px"
          alt={logo.name || `Bank Logo`}
          className="me-3 mb-2"
          style={{ 
            objectFit: 'contain',
            borderRadius: '5px',
            backgroundColor: '#f8f9fa',
            padding: '5px'
          }}
          title={logo.name || ''}
          onError={(e) => {
            e.target.src = fimg1;
          }}
        />
      );
    });
  }, [banksLogosLoading, bankLogosData, getImageUrl]);

  return (
    <>
      {/* INTERNAL CSS FIX */}
      <style>
        {`
          footer {
            position: relative;
            z-index: 99;
          }
          footer a, footer i {
            position: relative;
            z-index: 99;
          }
          
          .bank-logo-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            align-items: center;
            gap: 1rem;
          }
          
          .footer-section-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2rem;
            padding: 2rem 0;
          }
          
          @media (max-width: 768px) {
            .bank-logo-container {
              justify-content: center;
            }
            
            .footer-section-container {
              gap: 1.5rem;
            }
          }
          
          .text-colorrr {
            color: #2c3e50;
            margin-bottom: 0.5rem;
          }
        `}
      </style>

      <footer>
        <div className="container px-3 py-4 border-top">
          <div className="row">
            {/* SHOP PRODUCTS */}
            <div className="col-md col-6">
              <h6 className="fw-bold text-primary-emphasis">SHOP PRODUCTS</h6>
              <ul className="list-unstyled">
                <li><Link to="/all-craving-categories" className="fw-semibold link-secondary text-decoration-none">Food Category</Link></li>
                <li><Link to="/all-meals" className="fw-semibold link-secondary text-decoration-none">Food Shops</Link></li>
                <li><Link to="/all-mind-categories" className="fw-semibold link-secondary text-decoration-none">Meal Type</Link></li>
                <li><Link to="/pharmacy-shop" className="fw-semibold link-secondary text-decoration-none">Medicine Shop</Link></li>
                <li><Link to="/pharmacy/products" className="fw-semibold link-secondary text-decoration-none">Medicine Products</Link></li>
                <li><Link to="/pharmacy/medicines" className="fw-semibold link-secondary text-decoration-none">Medicines</Link></li>
                <li><Link to="/venders/labs" className="fw-semibold link-secondary text-decoration-none">Lab Tests</Link></li>
              </ul>
            </div>

            {/* BLOG */}
            <div className="col-md col-6">
              <h6 className="fw-bold text-primary-emphasis">BLOG</h6>
              <ul className="list-unstyled">
                <li>
                  <Link 
                    to="/blogs/Doctor%20Tips" 
                    className="fw-semibold link-secondary text-decoration-none"
                  >
                    Doctor Tips
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/blogs/Mind%20&%20Body" 
                    className="fw-semibold link-secondary text-decoration-none"
                  >
                    Mind & Body
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/blogs/Monitoring" 
                    className="fw-semibold link-secondary text-decoration-none"
                  >
                    Monitoring
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/blogs/Food%20Lab" 
                    className="fw-semibold link-secondary text-decoration-none"
                  >
                    Food Lab
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/blogs/Recipes" 
                    className="fw-semibold link-secondary text-decoration-none"
                  >
                    Recipes
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/blogs/Food%20&%20Nutrition" 
                    className="fw-semibold link-secondary text-decoration-none"
                  >
                    Food & Nutrition
                  </Link>
                </li>
              </ul>
            </div>

            {/* QUICK LINKS */}
            <div className="col-md col-6">
              <h6 className="fw-bold text-primary-emphasis">QUICK LINKS</h6>
              <ul className="list-unstyled">
                <li><Link to="/AboutUs" className="fw-semibold link-secondary text-decoration-none">About Us</Link></li>
                <li><a href="/privacy-policy" className="fw-semibold link-secondary text-decoration-none">Privacy Policy</a></li>
                <li><a href="/term-conditions" className="fw-semibold link-secondary text-decoration-none">Terms & Conditions</a></li>
              </ul>
            </div>

            {/* CONTACT + SOCIAL */}
            <div className="col-md col-6">
              <h6 className="fw-bold text-primary-emphasis">Contact Us</h6>

              <ul className="list-unstyled mb-2">
                <li>
                  <Link to="/contact-us" className="fw-semibold link-secondary text-decoration-none">
                    Contact Us
                  </Link>
                </li>
              </ul>

              <div className="d-flex gap-3 align-items-center">
                {/* Facebook */}
                <a
                  href={contactData?.facebookLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    opacity: contactData?.facebookLink ? 1 : 0.4,
                    pointerEvents: contactData?.facebookLink ? "auto" : "none"
                  }}
                >
                  <i className="fa-brands fs-3 fa-square-facebook"></i>
                </a>

                {/* Instagram */}
                <a
                  href={contactData?.instaLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    opacity: contactData?.instaLink ? 1 : 0.4,
                    pointerEvents: contactData?.instaLink ? "auto" : "none"
                  }}
                >
                  <i className="fa-brands fs-3 fa-square-instagram"></i>
                </a>

                {/* Twitter (X) */}
                <a
                  href={contactData?.twitterLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    opacity: contactData?.twitterLink ? 1 : 0.4,
                    pointerEvents: contactData?.twitterLink ? "auto" : "none"
                  }}
                >
                  <i className="fa-brands fs-3 fa-square-x-twitter"></i>
                </a>

                {/* YouTube */}
                <a
                  href={contactData?.youtubeLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    opacity: contactData?.youtubeLink ? 1 : 0.4,
                    pointerEvents: contactData?.youtubeLink ? "auto" : "none"
                  }}
                >
                  <i className="fa-brands fs-3 fa-square-youtube"></i>
                </a>

                {/* LinkedIn */}
                <a
                  href={contactData?.linkedinLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    opacity: contactData?.linkedinLink ? 1 : 0.4,
                    pointerEvents: contactData?.linkedinLink ? "auto" : "none"
                  }}
                >
                  <i className="fa-brands fa-linkedin fs-3"></i>
                </a>
              </div>
            </div>

            {/* Download App */}
            <div className="col-md col-6">
              <h6 className="fw-bold text-primary-emphasis">Download App</h6>

              <div className="d-flex flex-column gap-2 mt-2">
                <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://onemg.gumlet.io/marketing/6284f3d0-a998-4e94-8cea-91f0961895fc.png"
                    alt="Google Play"
                    style={{ width: "150px", borderRadius: "8px" }}
                  />
                </a>

                <a href="https://www.apple.com/in/app-store/" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://onemg.gumlet.io/marketing/45552652-1551-4004-984b-89af60d89e50.png"
                    alt="App Store"
                    style={{ width: "150px", borderRadius: "8px" }}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ ICON ROWS SECTION - IMPROVED */}
        <div className="container">
  {footerLoading ? (
    <div className="d-flex justify-content-center align-items-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading footer content...</span>
      </div>
      <span className="ms-3">Loading footer content...</span>
    </div>
  ) : footerContentUser && footerContentUser.easyHeading ? (
    <>
      <div className="row justify-content-center">
        <div className="footer-section-container">

          {/* Easy */}
          {renderFooterSection(
            footerContentUser?.easyIcon,
            footerContentUser?.easyHeading,
            footerContentUser?.easyContent,
            img5
          )}

          {/* Affordable */}
          {renderFooterSection(
            footerContentUser?.affordableIcon,
            footerContentUser?.affordableHeading,
            footerContentUser?.affordableContent,
            img3
          )}

          {/* Accessible */}
          {renderFooterSection(
            footerContentUser?.accessibleIcon,
            footerContentUser?.accessibleHeading,
            footerContentUser?.accessibleContent,
            img2
          )}

        </div>
      </div>

      {/* BANK LOGOS */}
      <div className="row mt-5 w-100 border-top py-3 flex-wrap">
        <div className="col-sm">
          <div className="d-flex flex-column align-items-end">

            <div className="bank-logo-container">
              {renderBankLogos()}
            </div>

            {!banksLogosLoading && bankLogosData.length === 0 && (
              <div className="mt-2 text-muted small">
                <em>
                  Upload bank logos in admin panel to customize this section
                </em>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  ) : (
    // DEFAULT CONTENT
    <div className="row justify-content-center">
      <div className="footer-section-container">

        <div className="mx-auto" style={{ maxWidth: "300px" }}>
          <div className="row">
            <div className="w-auto">
              <img src={img5} width="60px" alt="Easy to use icon" />
            </div>
            <div className="col-8">
              <h2 className="text-colorrr">Easy</h2>
              <h6 className="text-muted fw-semibold">
                We make good health simple
              </h6>
            </div>
          </div>
        </div>

        <div className="mx-auto" style={{ maxWidth: "300px" }}>
          <div className="row">
            <div className="w-auto">
              <img src={img3} width="60px" alt="Affordable icon" />
            </div>
            <div className="col-8">
              <h2 className="text-colorrr">Affordable</h2>
              <h6 className="text-muted fw-semibold">
                Everyone deserves to be healthy
              </h6>
            </div>
          </div>
        </div>

        <div className="mx-auto" style={{ maxWidth: "300px" }}>
          <div className="row">
            <div className="w-auto">
              <img src={img2} width="60px" alt="Accessible icon" />
            </div>
            <div className="col-8">
              <h2 className="text-colorrr">Accessible</h2>
              <h6 className="text-muted fw-semibold">
                Quality healthcare access for all
              </h6>
            </div>
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