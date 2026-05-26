import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';

const SciencePage = () => {
  const { sciencePage, loading, getSciencePageContent } = useContext(MyContext);
  const [imageUrl] = useState(`${process.env.REACT_APP_API_URL}`);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    getSciencePageContent();
  }, []);

  const pageData = sciencePage || {};

  // Hero Slider Images logic (API image + fallbacks)
  const heroImages = [
    pageData.heroBackgroundImage
      ? `${imageUrl}/uploads/science/${pageData.heroBackgroundImage}`
      : 'https://images.pexels.com/photos/8460159/pexels-photo-8460159.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'https://images.pexels.com/photos/4031821/pexels-photo-4031821.jpeg?auto=compress&cs=tinysrgb&w=1600'
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [heroImages.length]);

  if (loading && !sciencePage) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '50px', height: '50px' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '20px', color: '#6c757d', fontWeight: 500 }}>Loading science data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .science-page {
          --primary: #0ea5e9; --primary-dark: #0284c7; --primary-light: #e0f2fe;
          --secondary: #8b5cf6; --secondary-dark: #7c3aed; --accent: #f59e0b;
          --white: #ffffff; --black: #0f172a;
          --gray-50: #f8fafc; --gray-100: #f1f5f9; --gray-200: #e2e8f0;
          --gray-300: #cbd5e1; --gray-400: #94a3b8; --gray-500: #64748b;
          --gray-600: #475569; --gray-700: #334155; --gray-800: #1e293b;
          --gray-900: #0f172a;
          --radius-md: 16px; --radius-lg: 24px; --radius-xl: 32px;
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
          --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
          font-family: 'Inter', sans-serif;
          background: var(--gray-50); color: var(--gray-900);
        }

        /* Hero Section */
        .hero-premium { position: relative; min-height: 100vh; overflow: hidden; }
        .hero-slideshow { position: absolute; inset: 0; z-index: 0; }
        .hero-slide { position: absolute; inset: 0; background-size: cover; background-position: center; transition: opacity 1.5s ease; opacity: 0; }
        .hero-slide.active { opacity: 1; }
        .hero-overlay-gradient { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 100%); z-index: 1; }
        .hero-content { position: relative; z-index: 10; display: flex; align-items: center; min-height: 100vh; padding: 120px 0 80px; }
        
        .hero-badge { display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.12); backdrop-filter: blur(10px); padding: 8px 20px; border-radius: 50px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.2); }
        .badge-text { font-size: 0.7rem; font-weight: 700; letter-spacing: 2px; color: rgba(255,255,255,0.9); text-transform: uppercase; }
        
        .hero-title { font-size: 3.8rem; font-weight: 800; line-height: 1.1; margin-bottom: 20px; color: white; }
        .title-gradient { background: linear-gradient(135deg, #38bdf8, #a78bfa, #fbbf24); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .hero-description { font-size: 1rem; line-height: 1.6; color: rgba(255,255,255,0.85); margin-bottom: 30px; max-width: 550px; }
        
        /* Impact Cards */
        .impact-grid-modern { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 30px; }
        .impact-card-modern { background: var(--white); border-radius: var(--radius-lg); overflow: hidden; transition: all 0.4s ease; box-shadow: var(--shadow-md); position: relative; }
        .impact-card-modern:hover { transform: translateY(-10px); box-shadow: var(--shadow-xl); }
        .impact-image-modern { height: 220px; width: 100%; position: relative; background: var(--gray-200); }
        .impact-image-modern img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .impact-card-modern:hover .impact-image-modern img { transform: scale(1.1); }
        .impact-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); display: flex; align-items: flex-end; padding: 20px; }
        .impact-number-modern { font-size: 2.5rem; font-weight: 800; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
        .impact-content-modern { padding: 24px; }
        .impact-text-modern { color: var(--gray-600); line-height: 1.6; font-size: 0.95rem; font-weight: 500; }

        /* Team Cards */
        .team-section-modern { background: var(--white); padding: 80px 0; }
        .team-grid-modern { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-top: 50px; }
        .team-card-modern { background: var(--white); border-radius: var(--radius-lg); padding: 30px 20px; text-align: center; transition: all 0.3s; box-shadow: var(--shadow-md); border: 1px solid var(--gray-200); }
        .team-card-modern:hover { transform: translateY(-8px); box-shadow: var(--shadow-xl); border-color: var(--primary); }
        .team-avatar-modern { width: 100px; height: 100px; margin: 0 auto 20px; border-radius: 50%; background-size: cover; background-position: center; border: 3px solid var(--primary-light); }
        .team-name-modern { font-size: 1.2rem; font-weight: 700; color: var(--gray-800); margin-bottom: 8px;}
        .team-institution-modern { font-size: 0.85rem; color: var(--gray-500); font-weight: 500; }

        /* Research Showcase */
        .research-showcase { background: var(--gray-100); padding: 80px 0; }
        .research-horizontal { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .research-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .gallery-item { border-radius: var(--radius-lg); overflow: hidden; height: 250px; }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .gallery-item:hover img { transform: scale(1.05); }

        /* Clinical/Stats Cards */
        .clinical-section-modern { background: var(--gray-50); padding: 80px 0; }
        .clinical-grid-modern { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin: 50px 0; }
        .clinical-card-modern { background: var(--white); border-radius: var(--radius-lg); padding: 30px 20px; text-align: center; transition: all 0.3s; box-shadow: var(--shadow-md); border: 1px solid var(--gray-200); }
        .clinical-card-modern:hover { transform: translateY(-5px); box-shadow: var(--shadow-xl); border-color: var(--secondary); }
        .clinical-percent-modern { font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 10px; }
        .clinical-desc-modern { font-size: 0.9rem; color: var(--gray-600); margin-bottom: 15px; line-height: 1.5; font-weight: 600;}
        .clinical-source-modern { display: inline-block; padding: 4px 12px; background: var(--primary-light); border-radius: 20px; font-size: 0.75rem; color: var(--primary); font-weight: 700; }

        /* Grant Section */
        .grant-section-modern { padding: 100px 0; position: relative; background-size: cover; background-position: center; color: white; text-align: center; }
        .grant-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(14,165,233,0.85), rgba(139,92,246,0.85)); }
        .grant-content { position: relative; z-index: 2; max-width: 800px; margin: 0 auto; }
        .grant-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 15px; }

        /* Generic Section Headers */
        .section-header { text-align: center; margin-bottom: 50px; }
        .section-badge { display: inline-flex; background: linear-gradient(135deg, var(--primary-light), var(--white)); padding: 6px 16px; border-radius: 50px; margin-bottom: 20px; color: var(--primary); font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; }
        .section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 20px; color: var(--gray-800); }
        .section-subtitle { font-size: 1.1rem; color: var(--gray-600); max-width: 700px; margin: 0 auto; line-height: 1.6; }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.2rem; }
          .research-horizontal { grid-template-columns: 1fr; }
          .grant-title { font-size: 1.8rem; }
        }
      `}</style>

      <div className="science-page">
        {/* ========== HERO SECTION ========== */}
        <section className="hero-premium">
          <div className="hero-slideshow">
            {heroImages.map((imgUrl, index) => (
              <div
                key={index}
                className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                style={{ backgroundImage: `url(${imgUrl})` }}
              />
            ))}
          </div>
          <div className="hero-overlay-gradient"></div>

          <div className="hero-content">
            <div className="container">
              <div className="row">
                <div className="col-lg-8">
                  <div className="hero-badge">
                    <span className="badge-text">SCIENTIFIC REVIEW COMMITTEE</span>
                  </div>
                  <h1 className="hero-title">
                    {pageData.heroTitle || (
                      <>Pioneering the <br /><span className="title-gradient">Future of Medicine</span></>
                    )}
                  </h1>
                  <p className="hero-description">
                    {pageData.heroSubtitle || "A specialized committee of top diabetes experts nationwide, dedicated to driving breakthroughs and distributing vital funding to transformative medical research."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== IMPACT CARDS SECTION ========== */}
        <section className="container py-5 mt-4">
          <div className="section-header">
            <div className="section-badge">🎯 MEASURABLE OUTCOMES</div>
            <h2 className="section-title">{pageData.impactTitle || "Our Impact"}</h2>
            <p className="section-subtitle">Transforming research through cutting-edge science and dedicated expertise.</p>
          </div>

          <div className="impact-grid-modern">
            {(pageData.impactCards || []).map((card, index) => (
              <div key={card._id || index} className="impact-card-modern">
                <div className="impact-image-modern">
                  <img 
                    src={card.image?.startsWith('http') ? card.image : `${imageUrl}/uploads/science/${card.image}`} 
                    alt={card.description}
                    onError={(e) => { e.target.src = 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=600'; }}
                  />
                  <div className="impact-overlay">
                    <div className="impact-number-modern">{card.number || `0${index + 1}`}</div>
                  </div>
                </div>
                <div className="impact-content-modern">
                  <p className="impact-text-modern">{card.description}</p>
                </div>
              </div>
            ))}
            {(!pageData.impactCards || pageData.impactCards.length === 0) && (
               <p className="text-center text-muted w-100">No impact data available.</p>
            )}
          </div>
        </section>

        {/* ========== RESEARCH SHOWCASE ========== */}
        <div className="research-showcase">
          <div className="container">
            <div className="research-horizontal">
              <div className="research-gallery">
                {(pageData.researchImages && pageData.researchImages.length > 0 ? pageData.researchImages.slice(0, 4) : []).map((img, index) => (
                  <div key={index} className="gallery-item">
                    <img 
                      src={`${imageUrl}/uploads/science/${img}`} 
                      alt={`Research ${index + 1}`}
                      onError={(e) => { e.target.src = 'https://images.pexels.com/photos/4031821/pexels-photo-4031821.jpeg?auto=compress&cs=tinysrgb&w=600'; }}
                    />
                  </div>
                ))}
              </div>
              
              <div>
                <div className="section-badge">💰 RESEARCH INVESTMENT</div>
                <h2 className="section-title" style={{ textAlign: 'left', fontSize: '2rem' }}>
                  {pageData.researchTitle || "DRC has distributed Approximately $3M to research"}
                </h2>
                <p className="section-subtitle" style={{ textAlign: 'left', margin: 0 }}>
                  {pageData.researchDescription || "This funding has enabled key discoveries and advancements, showcasing our commitment to driving forward the research necessary to understand, manage, and ultimately cure this challenging condition."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========== CLINICAL EVIDENCE (STATISTICS) ========== */}
        <div className="clinical-section-modern">
          <div className="container">
            <div className="section-header">
              <div className="section-badge">📊 CLINICAL EVIDENCE</div>
              <h2 className="section-title">
                {pageData.statsTitle || "Clinically proven health impact published globally"}
              </h2>
            </div>

            <div className="clinical-grid-modern">
              {(pageData.statistics || []).map((stat, index) => (
                <div key={stat._id || index} className="clinical-card-modern">
                  <div className="clinical-percent-modern">{stat.percentage}</div>
                  <div className="clinical-desc-modern">{stat.description}</div>
                  <span className="clinical-source-modern"><i className="fas fa-bookmark me-1"></i> {stat.source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========== TEAM SECTION ========== */}
        <div className="team-section-modern">
          <div className="container">
            <div className="section-header">
              <div className="section-badge">👥 EXPERT COMMITTEE</div>
              <h2 className="section-title">Meet Our <span>Scientific Leaders</span></h2>
            </div>
            
            <div className="team-grid-modern">
              {(pageData.teamCards || []).map((member, index) => {
                // Generate a dynamic avatar based on name initials via ui-avatars
                const avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff&size=150`;
                
                return (
                  <div key={member._id || index} className="team-card-modern">
                    <div className="team-avatar-modern" style={{ backgroundImage: `url(${avatarSrc})` }}></div>
                    <h3 className="team-name-modern">{member.name}</h3>
                    <div className="team-institution-modern"><i className="fas fa-university me-2 text-primary"></i>{member.institution}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========== GRANT SECTION ========== */}
        <div 
          className="grant-section-modern"
          style={{
            backgroundImage: pageData.grantBackgroundImage ? `url(${imageUrl}/uploads/science/${pageData.grantBackgroundImage})` : 'url(https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=1600)'
          }}
        >
          <div className="grant-overlay"></div>
          <div className="container grant-content">
            <div className="section-badge mb-3 text-white" style={{background: 'rgba(255,255,255,0.2)'}}>RESEARCH FUNDING</div>
            <h2 className="grant-title">
              {pageData.grantTitle || "We grant up to $75,000 to support each research project"}
            </h2>
            <p className="text-white fs-5 opacity-75">
              {pageData.grantSubtitle || "#InnovativeDiabetesResearch"}
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default SciencePage;