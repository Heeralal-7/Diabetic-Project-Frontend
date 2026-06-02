import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

const PremiumDoctorSection = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Environment variable se URL lena
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

    // 1. Fetch Doctors Data
    const fetchDoctors = async () => {
        try {
            // API Call carefully using axios
            const response = await axios.get(`${API_URL}/doctor/get`);
            if (response.data.success === 1) {
                setDoctors(response.data.details);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    // 2. Helper function to render stars based on rating
    const renderStars = (rating) => {
        const stars = [];
        const floorRating = Math.floor(rating || 0);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i 
                    key={i} 
                    className={`fas fa-star ${i <= floorRating ? 'text-warning' : 'text-muted'}`} 
                    style={{ fontSize: '0.8rem', marginRight: '2px' }}
                ></i>
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 fw-bold text-muted">Connecting with Specialists...</p>
            </div>
        );
    }

    return (
        <section id="doctors" className="py-5 doctors-section-bg border-top">
            <div className="container">
                {/* Section Header */}
                <div className="text-center mb-5">
                    <h2 className="brand-section-header">World‑Class <span>Doctors</span></h2>
                    <div className="luxury-divider" style={{ background: 'linear-gradient(90deg, transparent, #0A66C2, #38bdf8, transparent)' }}></div>
                    <p className="text-muted mt-3 fw-medium">Recognized specialists from global diabetes institutes</p>
                </div>

                <div className="row g-4 align-items-stretch">
                    {/* Left Highlight Card (Static) */}
                    <div className="col-lg-4">
                        <div className="clinic-highlight-card h-100">
                            <div className="mb-4 bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px' }}>
                                <i className="fas fa-clinic-medical fa-2x" style={{ color: '#0A66C2' }}></i>
                            </div>
                            <h3 className="fw-bold mb-3 text-white" style={{ fontSize: '2rem' }}>
                                DiabeticWala 
                            </h3>
                            <p className="text-white-50 mb-0" style={{ lineHeight: '1.6' }}>
                                Premium centers with cutting-edge diabetic care, 24/7 teleconsultation, and advanced metabolic wellness programs.
                            </p>
                        </div>
                    </div>

                    {/* Right Dynamic Doctors List */}
                    <div className="col-lg-8">
                        <div className="row g-4 h-100">
                            {doctors.slice(0, 3).map((doc) => (
                                <div className="col-md-4" key={doc._id}>
                                    <div 
                                        className="premium-doctor-card h-100" 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/Doctors/Profile/${doc._id}`)} // ID ke sath navigate karega
                                    >
                                        <div className="doctor-img-ring">
                                            {/* Image path formatting carefully */}
                                            <img 
                                                src={doc.image ? `${API_URL}${doc.image}` : "https://via.placeholder.com/150"} 
                                                alt={doc.name} 
                                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200"; }}
                                            />
                                        </div>
                                        <h5 className="doc-name text-truncate w-100 px-2">{doc.name}</h5>
                                        
                                        {/* Specialist / Qualification */}
                                        <div className="doc-specialty text-truncate w-100">
                                            {doc.specialist || doc.qualification || "General Physician"}
                                        </div>

                                        {/* Experience Display - JSON se 'experience' field fetch ki hai */}
                                        <div className="mb-2">
                                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                <i className="fas fa-briefcase me-1"></i> {doc.experience || 0}+ Yrs Experience
                                            </span>
                                        </div>

                                        {/* Star Rating Display - JSON se 'rating' field fetch ki hai */}
                                        <div className="doc-rating">
                                            {renderStars(doc.rating)}
                                            <span className="ms-1 small fw-bold text-dark">({doc.rating || "N/A"})</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PremiumDoctorSection;