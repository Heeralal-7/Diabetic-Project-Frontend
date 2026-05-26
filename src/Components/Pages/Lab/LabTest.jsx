import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../../Context/Context";
import '../../Assets/Css/LebTest.css';

const LabTest = () => {
    const {
        vendor,
        getVendor1: getVendor,
        packages,
        getAllPackages,
        organs,
        getAllOrgans,
        loading,
        getUserLocation: getUserLocationFromContext,
        setManualLocation,
        clearLocation,
        distanceLimit
    } = useContext(MyContext);

    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [showLocationInput, setShowLocationInput] = useState(false);
    const [manualLat, setManualLat] = useState('');
    const [manualLng, setManualLng] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    const navigate = useNavigate();
    const imageUrl = process.env.REACT_APP_API_URL;

    // New Color Scheme - Light Black/White with #3D3F96
    const colors = {
        primary: '#3D3F96',      // Main theme color
        primaryLight: '#5B5DB8',  // Lighter version
        primaryDark: '#2D2F6E',   // Darker version
        primarySoft: '#EEEEF5',   // Very soft version for backgrounds
        dark: '#111827',          // Light black / Dark gray
        darkLight: '#1F2937',     // Slightly lighter dark
        gray: '#6B7280',          // Medium gray
        grayLight: '#9CA3AF',     // Light gray
        softBg: '#F9FAFB',        // Almost white background
        white: '#FFFFFF',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
    };

    const organColors = [
        { bg: '#FFE4E1', iconBg: '#FFB6C1', text: '#8B0000' },
        { bg: '#E0F7FA', iconBg: '#B2EBF2', text: '#006064' },
        { bg: '#FFF3E0', iconBg: '#FFE0B2', text: '#E65100' },
        { bg: '#E8F5E9', iconBg: '#C8E6C9', text: '#1B5E20' },
        { bg: '#F3E5F5', iconBg: '#E1BEE7', text: '#4A148C' },
        { bg: '#FFEBEE', iconBg: '#FFCDD2', text: '#B71C1C' },
        { bg: '#E3F2FD', iconBg: '#BBDEFB', text: '#0D47A1' },
        { bg: '#FFF8E1', iconBg: '#FFECB3', text: '#E65100' },
    ];

    const packageImages = [
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1581093458791-9d4b3b80bc96?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=500&h=300&fit=crop",
        "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=500&h=300&fit=crop",
    ];

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getUserLocation = useCallback(async (customSearch = searchTerm) => {
        try {
            setIsGettingLocation(true);
            setLocationError('');
            let location;
            if (typeof getUserLocationFromContext === 'function') {
                location = await getUserLocationFromContext();
            } else if (navigator.geolocation) {
                location = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                        reject
                    );
                });
            } else {
                throw new Error('Geolocation not supported');
            }
            setUserLocation(location);
            if (location) {
                const response = await getVendor(location.latitude, location.longitude, 1, 10, customSearch);
                if (response && response.pagination) setPagination(response.pagination);
            }
        } catch (error) {
            setLocationError('Unable to get your location. Showing default/all labs.');
            const response = await getVendor(null, null, 1, 10, customSearch);
            if (response && response.pagination) setPagination(response.pagination);
            setUserLocation(null);
        } finally {
            setIsGettingLocation(false);
        }
    }, [getVendor, getUserLocationFromContext, searchTerm]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const lat = userLocation ? userLocation.latitude : null;
        const lng = userLocation ? userLocation.longitude : null;
        getVendor(lat, lng, 1, 10, searchTerm).then(response => {
            if (response && response.pagination) setPagination(response.pagination);
        });
    };

    const handleManualLocationSubmit = async (e) => {
        e.preventDefault();
        setLocationError('');
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        if (isNaN(lat) || isNaN(lng)) { setLocationError('Please enter valid coordinates'); return; }
        const location = { latitude: lat, longitude: lng };
        setUserLocation(location);
        if (typeof setManualLocation === 'function') setManualLocation(lat, lng);
        setShowLocationInput(false);
        setManualLat('');
        setManualLng('');
        const response = await getVendor(lat, lng, 1, 10, searchTerm);
        if (response && response.pagination) setPagination(response.pagination);
    };

    const handleLoadMore = async () => {
        if (!pagination || !pagination.hasMore) return;
        const nextPage = pagination.page + 1;
        const lat = userLocation ? userLocation.latitude : null;
        const lng = userLocation ? userLocation.longitude : null;
        const response = await getVendor(lat, lng, nextPage, 10, searchTerm);
        if (response && response.pagination) setPagination(response.pagination);
    };

    useEffect(() => {
        const initializeData = () => {
            Promise.allSettled([getAllPackages(1, 10), getAllOrgans(), getUserLocation(searchTerm)]);
        };
        initializeData();
    }, []);

    const filteredAndSortedVendors = useMemo(() => {
        let processedVendors = Array.isArray(vendor) ? [...vendor] : [];
        if (userLocation) {
            processedVendors = processedVendors.map(v => {
                let dist = null;
                if (v.location && v.location.coordinates && Array.isArray(v.location.coordinates)) {
                    const [vLng, vLat] = v.location.coordinates;
                    dist = calculateDistance(userLocation.latitude, userLocation.longitude, vLat, vLng);
                }
                return { ...v, calculatedDistance: dist };
            });
            processedVendors.sort((a, b) => {
                if (a.calculatedDistance !== null && b.calculatedDistance !== null) return a.calculatedDistance - b.calculatedDistance;
                return 0;
            });
        } else {
            processedVendors.sort((a, b) => {
                const nameA = a.name || a.email || '';
                const nameB = b.name || b.email || '';
                return nameA.localeCompare(nameB);
            });
        }
        return processedVendors;
    }, [vendor, userLocation]);

    const renderStarRating = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        for (let i = 0; i < fullStars; i++) stars.push(<i key={`full-${i}`} className="fas fa-star" style={{ color: colors.warning }}></i>);
        if (hasHalfStar) stars.push(<i key="half" className="fas fa-star-half-alt" style={{ color: colors.warning }}></i>);
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) stars.push(<i key={`empty-${i}`} className="far fa-star" style={{ color: colors.warning }}></i>);
        return stars;
    };

    const getDistanceDisplay = (vendor) => {
        if (vendor.calculatedDistance !== undefined && vendor.calculatedDistance !== null) {
            return { text: `${vendor.calculatedDistance.toFixed(1)} km`, icon: 'fas fa-map-marker-alt' };
        }
        if (vendor.distance) {
            const distVal = vendor.distance.onRoadValue || vendor.distance.value || vendor.distance;
            if (distVal) return { text: `${Number(distVal).toFixed(1)} km`, icon: 'fas fa-map-marker-alt' };
        }
        return null;
    };

    const handleVendorClick = (vendorId) => navigate(`/venders/labs/Lab-details/${vendorId}`);
    const handleAllOrdersClick = () => navigate('/venders/labs/orders');

    const handleClearSearch = () => {
        setSearchTerm('');
        const lat = userLocation ? userLocation.latitude : null;
        const lng = userLocation ? userLocation.longitude : null;
        getVendor(lat, lng, 1, 10, '').then(response => {
            if (response && response.pagination) setPagination(response.pagination);
        });
    };

    const formatCurrency = (amount) => Math.round(amount).toLocaleString('en-IN');

    return (
        <div style={{ backgroundColor: colors.softBg, minHeight: '100vh' }}>

            {/* ============================================
                HERO SECTION - Light Black Theme with #3D3F96
            ============================================ */}
            <div style={{
                position: 'relative',
                width: '100%',
                minHeight: '85vh',
                overflow: 'hidden',
                padding: '50px 0px',
                background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkLight} 50%, ${colors.primary} 100%)`
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.08,
                }} />

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, ${colors.dark}CC 0%, ${colors.darkLight}CC 50%, ${colors.primary}99 100%)`,
                }} />

                <div style={{ position: 'absolute', top: '15%', left: '-5%', width: '350px', height: '350px', borderRadius: '50%', background: `radial-gradient(circle, ${colors.primary}30, transparent)`, filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, ${colors.primaryLight}30, transparent)`, filter: 'blur(50px)' }} />

                <div className="container" style={{ position: 'relative', zIndex: 10, minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
                    <div className="row align-items-center">
                        <div className="col-lg-6" style={{ padding: '60px 0' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '50px',
                                padding: '8px 20px',
                                marginBottom: '28px',
                                border: '1px solid rgba(255,255,255,0.15)'
                            }}>
                                <span style={{ width: '8px', height: '8px', background: colors.success, borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500', letterSpacing: '0.5px' }}>✨ TRUSTED BY 50,000+ PATIENTS</span>
                            </div>

                            <h1 style={{
                                fontSize: '56px',
                                fontWeight: '800',
                                lineHeight: '1.1',
                                marginBottom: '20px',
                                color: 'white',
                                letterSpacing: '-1.5px'
                            }}>
                                Find the Best<br />
                                <span style={{ color: colors.primaryLight }}>
                                    Lab Tests
                                </span>
                                <br />Near You
                            </h1>

                            <p style={{
                                fontSize: '16px',
                                color: 'rgba(255,255,255,0.85)',
                                lineHeight: '1.6',
                                marginBottom: '32px',
                                maxWidth: '480px'
                            }}>
                                Book diagnostic tests from India's most trusted NABL-accredited labs.
                                Free home sample collection, accurate reports in 24 hours, and exclusive discounts up to 60%.
                            </p>

                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(12px)',
                                borderRadius: '60px',
                                padding: '6px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                marginBottom: '24px'
                            }}>
                                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ flex: 1, position: 'relative', paddingLeft: '20px' }}>
                                        <i className="fas fa-search" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }}></i>
                                        <input
                                            type="text"
                                            placeholder="Search for lab tests, packages, or labs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                width: '100%',
                                                background: 'transparent',
                                                border: 'none',
                                                padding: '14px 20px 14px 45px',
                                                color: 'white',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <button type="submit" style={{
                                        background: colors.white,
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '10px 28px',
                                        color: colors.primary,
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                        Search
                                    </button>
                                </form>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => getUserLocation(searchTerm)}
                                    style={{
                                        background: colors.white,
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '12px 28px',
                                        color: colors.primary,
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.2)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <i className="fas fa-location-dot"></i>
                                    {isGettingLocation ? 'Locating...' : (userLocation ? 'Update Location' : 'Use My Location')}
                                </button>
                                <button
                                    onClick={handleAllOrdersClick}
                                    style={{
                                        background: 'rgba(255,255,255,0.12)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255,255,255,0.25)',
                                        borderRadius: '50px',
                                        padding: '12px 28px',
                                        color: 'white',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <i className="fas fa-clipboard-list"></i>
                                    My Orders
                                </button>
                                <button
                                    onClick={() => setShowLocationInput(!showLocationInput)}
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '50px',
                                        padding: '12px 28px',
                                        color: 'white',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <i className="fas fa-map-marker-alt"></i> Manual
                                </button>
                            </div>

                            {showLocationInput && (
                                <div style={{
                                    marginTop: '20px',
                                    padding: '16px 20px',
                                    background: 'rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(12px)',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.15)'
                                }}>
                                    <form onSubmit={handleManualLocationSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            placeholder="Latitude"
                                            value={manualLat}
                                            onChange={(e) => setManualLat(e.target.value)}
                                            style={{ flex: 1, padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                                            required
                                        />
                                        <input
                                            type="number"
                                            step="0.0001"
                                            placeholder="Longitude"
                                            value={manualLng}
                                            onChange={(e) => setManualLng(e.target.value)}
                                            style={{ flex: 1, padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                                            required
                                        />
                                        <button type="submit" style={{ padding: '10px 24px', background: colors.white, border: 'none', borderRadius: '12px', color: colors.primary, fontWeight: '600', cursor: 'pointer' }}>Apply</button>
                                    </form>
                                </div>
                            )}

                            {locationError && (
                                <div style={{ marginTop: '16px', padding: '10px 16px', background: 'rgba(239,68,68,0.15)', borderRadius: '12px', borderLeft: `3px solid ${colors.error}` }}>
                                    <span style={{ color: '#fca5a5', fontSize: '12px' }}>{locationError}</span>
                                </div>
                            )}
                        </div>

                        <div className="col-lg-6 d-none d-lg-block">
                            <div style={{
                                background: 'rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                                borderRadius: '32px',
                                padding: '20px',
                                border: '1px solid rgba(255,255,255,0.15)',
                                marginLeft: '40px'
                            }}>
                                <div style={{
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <img
                                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop"
                                        alt="Doctor"
                                        style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: '20px',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                                    }}>
                                        <p style={{ color: 'white', fontSize: '14px', marginBottom: '4px' }}>👨‍⚕️ Dr. Sarah Johnson</p>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Chief Pathologist - 15+ years experience</p>
                                    </div>
                                </div>
                                <div style={{ padding: '20px', textAlign: 'center' }}>
                                    <i className="fas fa-quote-left" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px', marginBottom: '12px', display: 'block' }}></i>
                                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: '1.5', marginBottom: 0 }}>
                                        "Regular health checkups can prevent 80% of chronic diseases.
                                        We ensure accurate diagnosis with state-of-the-art technology."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50px',
                    background: colors.softBg,
                    clipPath: 'polygon(0% 100%, 100% 0%, 100% 100%, 0% 100%)'
                }} />
            </div>

            {/* ============================================
                QUICK FILTERS SECTION
            ============================================ */}
            <div className="container" style={{ marginTop: '-25px', position: 'relative', zIndex: 20 }}>
                <div style={{
                    background: colors.white,
                    borderRadius: '20px',
                    padding: '12px 24px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {userLocation && (
                            <span style={{ padding: '6px 16px', background: colors.primarySoft, borderRadius: '50px', fontSize: '13px', color: colors.primary }}>
                                <i className="fas fa-map-marker-alt me-2"></i>📍 Location Active
                            </span>
                        )}
                        {filteredAndSortedVendors.length > 0 && (
                            <span style={{ padding: '6px 16px', background: colors.primarySoft, borderRadius: '50px', fontSize: '13px', color: colors.primary }}>
                                <i className="fas fa-flask me-2"></i>{filteredAndSortedVendors.length} Labs Found
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['All Labs', 'Near Me', 'Top Rated', 'Most Booked'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '40px',
                                    background: activeTab === tab.toLowerCase().replace(' ', '') ? colors.primary : 'transparent',
                                    border: activeTab === tab.toLowerCase().replace(' ', '') ? 'none' : `1px solid ${colors.primary}40`,
                                    color: activeTab === tab.toLowerCase().replace(' ', '') ? 'white' : colors.primary,
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ============================================
                LABS GRID - Modern White Cards
            ============================================ */}
            <div className="container" style={{ padding: '60px 0' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px' }}>
                        <div className="spinner-border" style={{ width: '50px', height: '50px', color: colors.primary }} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p style={{ color: colors.gray, marginTop: '16px' }}>Finding the best labs for you...</p>
                    </div>
                ) : (
                    <>
                        {filteredAndSortedVendors.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px' }}>
                                <i className="fas fa-flask" style={{ fontSize: '60px', color: '#cbd5e1' }}></i>
                                <p style={{ color: colors.gray, marginTop: '16px' }}>No labs found</p>
                                <button onClick={() => { setSearchTerm(''); getUserLocation(''); }} style={{ marginTop: '20px', padding: '12px 32px', background: colors.primary, border: 'none', borderRadius: '50px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Refresh</button>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {filteredAndSortedVendors.map((v, idx) => {
                                    const distanceInfo = getDistanceDisplay(v);
                                    const rating = v.rating || 4.5;
                                    const totalRatings = v.totalRatings || 128;
                                    return (
                                        <div key={v._id} className="col-lg-3 col-md-4 col-sm-6">
                                            <div className="p-2"
                                                onClick={() => handleVendorClick(v._id)}
                                                style={{
                                                    background: colors.white,
                                                    borderRadius: '20px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                    height: '100%'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                                    e.currentTarget.style.boxShadow = `0 20px 35px -12px ${colors.primary}40`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                                }}
                                            >
                                                <div className="rounded-3" style={{ height: '180px', overflow: 'hidden' }}>
                                                    <img
                                                        src={v.image ? `${imageUrl}${v.image}` : "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=250&fit=crop"}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                                        alt={v.name}
                                                    />
                                                    {distanceInfo && (
                                                        <div style={{ top: '12px', right: '12px' }}>
                                                            <span style={{ background: 'rgba(0,0,0,0.7)', padding: '4px 12px', borderRadius: '50px', fontSize: '11px', color: 'white' }}>
                                                                <i className="fas fa-map-marker-alt me-1"></i>{distanceInfo.text}
                                                            </span>
                                                        </div>
                                                    )}

                                                </div>
                                                <div style={{
                                                    borderRadius: '50px',
                                                    padding: '15px 4px 0px 5px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <div className="" style={{ display: 'flex', gap: '2px' }}>{renderStarRating(rating)}</div>
                                                    <span style={{ fontSize: '11px', fontWeight: '600', color: colors.warning }}>{rating.toFixed(1)} ({totalRatings})</span>
                                                </div>
                                                <div className="p-2" style={{ paddingTop: ' 10px' }}>
                                                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: colors.dark, }}>
                                                        {v.vendorName || (v.email ? v.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') : "Diagnostic Center")}
                                                    </h4>

                                                    <p style={{ fontSize: '12px', color: colors.gray, marginBottom: '12px' }}>
                                                        <i className="fas fa-location-dot me-1"></i> {v.address || 'Address not available'}
                                                    </p>

                                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                                        <span style={{ fontSize: '11px', color: colors.success }}><i className="fas fa-check-circle me-1"></i>NABL Certified</span>
                                                        <span style={{ fontSize: '11px', color: colors.gray }}><i className="fas fa-clock me-1"></i>24hr Reports</span>
                                                    </div>
                                                    <button style={{
                                                        width: '100%',
                                                        padding: '10px',
                                                        borderRadius: '50px',
                                                        background: colors.primary,
                                                        border: 'none',
                                                        color: 'white',
                                                        fontWeight: '600',
                                                        fontSize: '13px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s'
                                                    }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = colors.primaryDark}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = colors.primary}>
                                                        View Details <i className="fas fa-arrow-right ms-1"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {pagination && pagination.hasMore && (
                            <div style={{ textAlign: 'center', marginTop: '48px' }}>
                                <button
                                    onClick={handleLoadMore}
                                    style={{
                                        padding: '12px 40px',
                                        borderRadius: '50px',
                                        background: 'white',
                                        border: `2px solid ${colors.primary}`,
                                        color: colors.primary,
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.color = 'white'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = colors.primary; }}
                                >
                                    <i className="fas fa-plus-circle me-2"></i>Load More Labs
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ============================================
                DOCTOR CURATED LAB PACKAGES
            ============================================ */}
            <div style={{ background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 100%)`, padding: '70px 0', margin: '20px 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <span style={{
                            background: 'rgba(255,255,255,0.12)',
                            padding: '6px 20px',
                            borderRadius: '50px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: 'white',
                            display: 'inline-block',
                            marginBottom: '16px'
                        }}>
                            <i className="fas fa-stethoscope me-2"></i> EXPERT RECOMMENDED
                        </span>
                        <h2 style={{ fontSize: '38px', fontWeight: '800', color: 'white', letterSpacing: '-1px' }}>Doctor Curated Lab Packages</h2>
                        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '500px', margin: '12px auto 0' }}>Expert-recommended health checkups for your well-being</p>
                    </div>
                    <div className="row g-4">
                        {packages && packages.slice(0, 4).map((pkg, idx) => (
                            <div key={pkg._id} className="col-md-6 col-lg-3">
                                <div
                                    onClick={() => navigate(`/lab-tests/package/${pkg.packageName}`)}
                                    style={{
                                        background: colors.white,
                                        borderRadius: '24px',
                                        padding: '28px 20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        height: '100%'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '20px',
                                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 20px'
                                    }}>
                                        <i className="fas fa-flask fa-2x" style={{ color: 'white' }}></i>
                                    </div>
                                    <h5 style={{ fontWeight: '700', marginBottom: '10px', color: colors.dark }}>{pkg.packageName}</h5>
                                    <p style={{ fontSize: '12px', color: colors.gray, marginBottom: '8px' }}>Starting at</p>
                                    <h4 style={{ fontWeight: '800', marginBottom: '20px', color: colors.primary }}>₹{formatCurrency(pkg.amount || 499)}</h4>
                                    <button style={{
                                        background: colors.primarySoft,
                                        color: colors.primary,
                                        borderRadius: '50px',
                                        padding: '10px 20px',
                                        border: 'none',
                                        fontWeight: '600',
                                        width: '100%',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = colors.primarySoft; e.currentTarget.style.color = colors.primary; }}>
                                        Book Now <i className="fas fa-arrow-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ============================================
                POPULAR TEST PACKAGES - Modified to show more items (slice(0, 6) instead of 3)
            ============================================ */}
            <div className="container" style={{ padding: '70px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <span style={{
                        background: colors.primarySoft,
                        padding: '6px 20px',
                        borderRadius: '50px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: colors.primary,
                        display: 'inline-block',
                        marginBottom: '16px'
                    }}>
                        <i className="fas fa-fire me-2" style={{ color: colors.primary }}></i> MOST POPULAR
                    </span>
                    <h2 style={{ fontSize: '38px', fontWeight: '800', color: colors.dark, letterSpacing: '-1px' }}>Popular Test Packages</h2>
                    <p style={{ color: colors.gray, maxWidth: '500px', margin: '12px auto 0' }}>Most booked diagnostic packages with great savings</p>
                </div>

                <div className="row g-4">
                    {/* Yahan packages.slice(0, 3) ko badal kar (0, 6) kiya gaya hai */}
                    {packages && packages.slice(0, 6).map((pkg, idx) => {
                        const testsCount = Array.isArray(pkg.addTest) ? pkg.addTest.length : 12;
                        const currentAmount = pkg.amount || 999;
                        const originalPrice = Math.round(currentAmount * 1.4);
                        const discount = Math.round(((originalPrice - currentAmount) / originalPrice) * 100);

                        return (
                            <div key={pkg._id} className="col-md-6 col-lg-4">
                                <div className="p-2" style={{ height: '100%' }}>
                                    <div
                                        onClick={() => navigate(`/lab-tests/package/${pkg.packageName}`)}
                                        style={{
                                            background: colors.white,
                                            borderRadius: '28px',
                                            cursor: 'pointer',
                                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                                            border: '1px solid rgba(0,0,0,0.03)',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-10px)';
                                            e.currentTarget.style.boxShadow = `0 25px 45px ${colors.primary}25`;
                                            e.currentTarget.style.border = `1px solid ${colors.primary}30`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.06)';
                                            e.currentTarget.style.border = '1px solid rgba(0,0,0,0.03)';
                                        }}
                                    >
                                        <div style={{ position: 'relative', height: '220px', borderRadius: '24px', overflow: 'hidden' }}>
                                            <img
                                                src={packageImages[idx % packageImages.length]}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                                alt={pkg.packageName}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
                                            }} />

                                            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                                <span style={{
                                                    background: 'rgba(255, 255, 255, 0.25)',
                                                    backdropFilter: 'blur(10px)',
                                                    WebkitBackdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                                    padding: '6px 14px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    color: 'white',
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                                                }}>
                                                    SAVE {discount}%
                                                </span>
                                            </div>

                                            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                                                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '8px', lineHeight: '1.2' }}>{pkg.packageName}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '8px' }}>
                                                        <i className="fas fa-star" style={{ color: colors.warning, fontSize: '12px' }}></i>
                                                        <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>4.9</span>
                                                    </div>
                                                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '500' }}>(2.5k+ bookings)</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '24px 16px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                                            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    background: 'rgba(61, 63, 150, 0.06)',
                                                    backdropFilter: 'blur(10px)',
                                                    WebkitBackdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(61, 63, 150, 0.12)',
                                                    padding: '8px 16px',
                                                    borderRadius: '12px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: colors.primary,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <i className="fas fa-flask"></i>{testsCount} Tests
                                                </span>
                                                <span style={{
                                                    background: 'rgba(107, 114, 128, 0.06)',
                                                    backdropFilter: 'blur(10px)',
                                                    WebkitBackdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(107, 114, 128, 0.12)',
                                                    padding: '8px 16px',
                                                    borderRadius: '12px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: colors.gray,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <i className="fas fa-clock"></i>24h Reports
                                                </span>
                                            </div>

                                            <div style={{ marginTop: 'auto' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '20px' }}>
                                                    <span style={{ fontSize: '30px', fontWeight: '800', color: colors.primary, lineHeight: '1' }}>₹{formatCurrency(currentAmount)}</span>
                                                    <span style={{ fontSize: '15px', color: colors.grayLight, textDecoration: 'line-through', marginBottom: '4px', fontWeight: '500' }}>₹{formatCurrency(originalPrice)}</span>
                                                </div>

                                                <button style={{
                                                    width: '100%',
                                                    padding: '14px',
                                                    borderRadius: '16px',
                                                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                                                    border: 'none',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    fontSize: '15px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s',
                                                    boxShadow: `0 8px 20px ${colors.primary}30`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = `0 12px 25px ${colors.primary}50`;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = `0 8px 20px ${colors.primary}30`;
                                                    }}>
                                                    Book Now <i className="fas fa-arrow-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ============================================
                FIND TEST BY ORGAN - Saara Data Dikhane Ke Liye `.map` kiya gaya hai bina `.slice()` ke
            ============================================ */}
            <div className="container" style={{ padding: '40px 0 80px' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '800', color: colors.dark }}>
                        <i className="fas fa-heartbeat me-3" style={{ color: colors.primary }}></i>Find Test by Organ
                    </h2>
                    <p style={{ color: colors.gray, marginTop: '12px' }}>Browse tests based on specific organs and systems</p>
                </div>
                <div className="row g-4">
                    {/* Yahan se .slice(0, 8) hata diya gaya hai, ab saare organs dikhenge */}
                    {organs && organs.map((organ, index) => {
                        const colorScheme = organColors[index % organColors.length];
                        return (
                            <div key={organ._id} className="col-4 col-md-3 col-lg-2">
                                <div
                                    onClick={() => navigate(`/lab-tests/organ/${organ.organName}`)}
                                    style={{
                                        background: colorScheme.bg,
                                        borderRadius: '20px',
                                        padding: '24px 12px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '20px',
                                        background: colorScheme.iconBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 12px'
                                    }}>
                                        <img
                                            src={organ.organImage ? `${imageUrl}${organ.organImage}` : "https://cdn-icons-png.flaticon.com/512/3094/3094820.png"}
                                            alt={organ.organName}
                                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: colorScheme.text }}>{organ.organName}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.2); }
                }
                .spinner-border {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LabTest;