import React from "react";

const LabCard = ({ vendor, imageUrl, colors, onClick }) => {
    if (!vendor) return null;

    const renderStarRating = (rating) => {
        const stars = [];
        const floorRating = Math.floor(rating || 4.0);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <i key={i} 
                   className={`${i < floorRating ? "fas" : "far"} fa-star`} 
                   style={{ color: '#F59E0B', fontSize: '0.8rem', marginRight: '2px' }}>
                </i>
            );
        }
        return stars;
    };

    const name = vendor.vendorName || vendor.name || "Diagnostic Center";
    const rating = vendor.rating || 4.0;
    const totalRatings = vendor.totalRatings || 0;

    return (
        <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div className="p-2 h-100" onClick={() => onClick(vendor._id)}
                style={{ background: '#fff', borderRadius: '20px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <div style={{ height: '160px', overflow: 'hidden', borderRadius: '15px' }}>
                    <img src={vendor.image ? `${imageUrl}${vendor.image}` : "https://via.placeholder.com/300"} 
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={name} 
                         onError={(e) => e.target.src = "https://via.placeholder.com/300"} />
                </div>
                <div className="p-2">
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <div>{renderStarRating(rating)}</div>
                        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{rating} ({totalRatings})</span>
                    </div>
                    <h5 style={{ fontSize: '15px', fontWeight: '800', marginTop: '10px', color: '#111827' }} className="text-truncate">{name}</h5>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '15px' }} className="text-truncate">
                        <i className="fas fa-map-marker-alt me-1"></i> {vendor.address || vendor.city || "Location N/A"}
                    </p>
                    <button className="btn btn-primary w-100" style={{ borderRadius: '50px', background: '#3D3F96', border: 'none', fontWeight: '600', fontSize: '13px' }}>
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};


export default LabCard;