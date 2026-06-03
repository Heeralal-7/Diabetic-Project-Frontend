import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LabCard from './LabCard'; // Sahi path check karlein
import { useNavigate } from 'react-router-dom';

const LabNearMe = () => {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    const fetchLabs = async () => {
        try {
            setLoading(true);
            // Location logic (Optional) - Agar user ki location leni hai toh payload mein bhej sakte hain
            const payload = {}; 
            
            // POST API Call
            const response = await axios.post(`${API_URL}/labnear/near`, payload);
            
            if (response.data.success === 1) {
                setLabs(response.data.details);
            }
        } catch (error) {
            console.error("Error fetching labs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLabs();
    }, []);

    const handleLabClick = (id) => navigate(`/venders/labs/Lab-details/${id}`);

    const colors = { primary: '#3D3F96' }; // Theme Color

    return (
        <section className="py-5" style={{ backgroundColor: '#F9FAFB' }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <h2 style={{ fontWeight: '800', color: '#111827' }}>Diagnostic Labs <span>Near You</span></h2>
                        <div style={{ width: '60px', height: '4px', background: '#3D3F96', marginTop: '10px' }}></div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2 text-muted">Finding best labs...</p>
                    </div>
                ) : (
                    <div className="row">
                        {labs.length > 0 ? (
                            labs.map((lab) => (
                                <LabCard 
                                    key={lab._id} 
                                    vendor={lab} 
                                    imageUrl={API_URL} 
                                    colors={colors} 
                                    onClick={handleLabClick} 
                                />
                            ))
                        ) : (
                            <div className="text-center py-5">
                                <p>No labs found in your area.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default LabNearMe;