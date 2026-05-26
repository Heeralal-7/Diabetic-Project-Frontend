import React, { useEffect, useContext, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FoodAndNurtImg from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg.png';
import FoodAndNurtImg1 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg1.png';
import FoodAndNurtImg2 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg2.png';
import FoodAndNurtImg3 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg3.png';
import FoodAndNurtImg4 from '../../Assets/img/FoodAndNutrition/FoodAndNurtImg4.png';
import { MyContext } from '../../../Context/Context';
import axios from 'axios';

// Helper: Haversine Formula for Client-side Distance Calculation
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
  return Number((R * c).toFixed(2));
};

const RestaurantCardWithRating = ({ vendor, getDistanceDisplay, getAddress, imageUrl, handleRestaurantClick, handleRestaurantRating }) => {
  const [ratingStats, setRatingStats] = useState({ averageRating: '0.0', totalRatings: 0 });
  const [loadingRating, setLoadingRating] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const Token = localStorage.getItem("token");
        if (vendor._id) {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/user-rating/getratings`,
            {
              params: { vendorId: vendor._id },
              headers: Token ? { token: Token } : {}
            }
          );
          if (response.data.success === 1 && response.data.data) {
            setRatingStats(response.data.data.ratingStatistics);
          }
        }
      } catch (err) {
        console.error("Rating fetch error", err);
      } finally {
        setLoadingRating(false);
      }
    };
    fetchRating();
  }, [vendor._id]);

  const distanceInfo = getDistanceDisplay(vendor);

  return (
    <div className="modern-rest-card" onClick={() => handleRestaurantClick(vendor)}>
      <div className="modern-rest-img-wrapper">
        <img
          src={vendor.image ? `${imageUrl}${vendor.image}` : '/default-restaurant.jpg'}
          className="modern-rest-img"
          alt={vendor.name || "Restaurant"}
          onError={(e) => { e.target.src = '/default-restaurant.jpg'; }}
        />
        <div className="modern-rest-overlay"></div>
        <div className="modern-rest-badges-top">
          {distanceInfo && (
            <div className="modern-badge distance-badge">
              <i className={`${distanceInfo.icon} me-1`}></i>
              {distanceInfo.text}
            </div>
          )}
          <div className="modern-badge rating-badge">
            <i className="fas fa-star text-warning me-1"></i>
            {loadingRating ? (
              <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }}></span>
            ) : (
              <span className="fw-bold">{parseFloat(ratingStats.averageRating || 0).toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="modern-rest-content">
        <div className="modern-rest-header">
          <h3 className="modern-rest-title">{vendor.name || "Restaurant"}</h3>
        </div>
        <p className="modern-rest-address">
          <i className="fas fa-map-marker-alt text-muted me-2"></i>
          {getAddress(vendor)}
        </p>
        <div className="modern-rest-footer">
          <div className="modern-rest-time">
            <i className="fas fa-motorcycle me-2"></i>
            {distanceInfo && distanceInfo.text ? distanceInfo.text : '20-30 min'}
          </div>
          <button
            className="modern-rate-btn"
            onClick={(e) => handleRestaurantRating(e, vendor._id)}
          >
            <i className="fas fa-star"></i> Rate
          </button>
        </div>
      </div>
    </div>
  );
};

const HomeFoodAndNutrition = () => {
  const {
    foodCategory, getFoodCategory, yourmind, Mealcategory, Discount, getdiscountfood,
    kitchen, getTopKitchen, userLocation, getUserLocation, distanceLimit, clearLocation
  } = useContext(MyContext);

  const navigate = useNavigate();
  const imageUrl = `${process.env.REACT_APP_API_URL}/`;

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const CRAVING_LIMIT = 5;
  const RESTAURANT_LIMIT = 4;

  const carouselSlides = [
    {
      title: 'CRAVING SOMETHING',
      highlight: 'DELICIOUS?',
      description: 'Explore thousands of restaurants and order your favorite meals with exclusive discounts.',
      image: FoodAndNurtImg3,
      buttonLabel: 'Order Now',
      buttonLink: '/all-meals',
    },
    {
      title: 'HEALTHY MEALS',
      highlight: 'DELIVERED FRESH',
      description: 'Nutritious, balanced, and delicious meals prepared by expert chefs just for you.',
      image: FoodAndNurtImg2,
      buttonLabel: 'Explore Menu',
      buttonLink: '/shop/FoodAndNurition/meal',
    },
    {
      title: 'QUICK BITES',
      highlight: 'SNACK TIME!',
      description: 'Satisfy your hunger instantly with our wide range of snacks and quick bites.',
      image: FoodAndNurtImg4,
      buttonLabel: 'Order Snacks',
      buttonLink: '/all-meals',
    },
    {
      title: 'BIG SAVINGS',
      highlight: 'UP TO 50% OFF',
      description: 'Limited time deals on your favorite restaurants. Don\'t miss out on these offers!',
      image: FoodAndNurtImg,
      buttonLabel: 'View Offers',
      buttonLink: '/all-craving-categories',
    },
    {
      title: 'FAMILY PACKS',
      highlight: 'SHARE THE JOY',
      description: 'Perfect meals for the whole family. Great taste, great value, great memories!',
      image: FoodAndNurtImg1,
      buttonLabel: 'Order Now',
      buttonLink: '/shop/FoodAndNurition/meal',
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  useEffect(() => {
    getFoodCategory();
    yourmind();
    getdiscountfood();
    getTopKitchen(userLocation, "");
  }, [userLocation]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await getTopKitchen(userLocation, searchTerm);
    if (searchTerm) setShowAllRestaurants(true);
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      if (typeof getUserLocation === 'function') {
        await getUserLocation();
        setShowAllRestaurants(false);
      }
    } catch (error) {
      console.error("Location error:", error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleClearLocation = () => {
    if (clearLocation) clearLocation();
    setShowAllRestaurants(true);
    setSearchTerm("");
    getTopKitchen(null, "");
  };

  const filterByDistanceLimit = useMemo(() => {
    return (shops) => {
      if (!shops || !Array.isArray(shops)) return shops;
      const limitKm = Number(distanceLimit?.foodLimit || 50);
      const filtered = shops.filter((shop) => {
        let onRoadDistanceKm = null;
        if (typeof shop.distance === 'number') {
          onRoadDistanceKm = shop.distance;
        } else if (typeof shop.distance === 'object' && shop.distance !== null) {
          onRoadDistanceKm = shop.distance.value || shop.distance.onRoadValue;
        }
        if ((onRoadDistanceKm === null || onRoadDistanceKm === undefined) && userLocation && shop.location?.coordinates) {
          const shopLong = shop.location.coordinates[0];
          const shopLat = shop.location.coordinates[1];
          const calculatedDist = calculateDistance(userLocation.latitude, userLocation.longitude, shopLat, shopLong);
          if (calculatedDist !== null) {
            onRoadDistanceKm = calculatedDist;
            shop.distance = calculatedDist;
          }
        }
        if (searchTerm) {
          const nameToMatch = shop.name ? shop.name.toLowerCase() : "";
          const searchToMatch = searchTerm.toLowerCase();
          return nameToMatch.includes(searchToMatch);
        }
        if (onRoadDistanceKm === undefined || onRoadDistanceKm === null) {
          return showAllRestaurants || !userLocation;
        }
        const shopDistKm = Number(onRoadDistanceKm);
        const isWithinLimit = shopDistKm <= limitKm;
        if (typeof shop.distance === 'object') {
          shop.distance.isWithinLimit = isWithinLimit;
        }
        if ((showAllRestaurants && !distanceLimit?.foodLimit) || !userLocation) {
          return true;
        }
        if (!showAllRestaurants) {
          return isWithinLimit;
        }
        return true;
      });
      return filtered;
    };
  }, [userLocation, distanceLimit, showAllRestaurants, searchTerm]);

  const sortedKitchens = useMemo(() => {
    if (!kitchen || !Array.isArray(kitchen)) return [];
    let filteredKitchens = filterByDistanceLimit(kitchen);
    return [...filteredKitchens].sort((a, b) => {
      if (sortBy === "distance") {
        const getDist = (item) => {
          if (typeof item.distance === 'number') return item.distance;
          return item.distance?.value || 999999;
        };
        return getDist(a) - getDist(b);
      } else if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === "name") {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });
  }, [kitchen, sortBy, filterByDistanceLimit]);

  const getDistanceDisplay = (vendor) => {
    if (vendor.distance === undefined || vendor.distance === null) return null;
    if (typeof vendor.distance === 'number') {
      return { text: `${Number(vendor.distance).toFixed(1)} km`, icon: 'fas fa-location-dot', isAccurate: true };
    }
    if (typeof vendor.distance === 'object' && vendor.distance.value) {
      return { text: `${vendor.distance.value} km`, icon: 'fas fa-location-dot', isAccurate: true };
    }
    return null;
  };

  const getAddress = (vendor) => {
    const parts = [];
    if (vendor.address) parts.push(vendor.address);
    if (vendor.city) parts.push(vendor.city);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  const getLimitedData = (data, limit) => {
    if (!data || !Array.isArray(data)) return [];
    return data.slice(0, limit);
  };
  const hasMoreItems = (data, limit) => data && data.length > limit;

  const transformedMealsData = foodCategory?.map(c => ({
    id: c._id, CateTitle: c.name, image: `${imageUrl}${c.foodImage}`, discount: c.discount ? `${c.discount}% off` : "", discountSet: c.discount ? 1 : 0
  })) || [];
  const transformedMealData1 = Mealcategory?.map(m => ({
    id: m._id, CateTitle: m.name, image: `${imageUrl}${m.MealImage}`, discount: "", discountSet: 0
  })) || [];
  const transformedDiscountData = Discount?.map(i => ({
    id: i._id, CateTitle: i.name, image: `${imageUrl}${i.image}`, discount: i.discount ? `${i.discount}% off` : "", discountSet: i.discount ? 1 : 0
  })) || [];

  const limitedMealsData = getLimitedData(transformedMealsData, CRAVING_LIMIT);
  const limitedKitchens = getLimitedData(sortedKitchens, RESTAURANT_LIMIT);

  const handleRestaurantRating = (e, vendorId) => { e.stopPropagation(); navigate(`/food-shop/rating/${vendorId}`); };
  const handleCardClick1 = (item) => navigate(`/shop/FoodAndNurition/meal/${item.id}`);
  const handleCardClick = (item) => navigate(`/foodname/${item.CateTitle}`);
  const handleRestaurantClick = (vendor) => navigate(`/shop/FoodAndNurition/Products/${vendor._id}`);
  const handleAllOrdersClick = () => navigate('/shop/FoodAndNurition/orders');

  return (
    <div className="premium-food-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        :root {
          --fa-primary: #F97316; /* Vibrant Orange */
          --fa-primary-hover: #EA580C;
          --fa-primary-light: #FFEDD5;
          --fa-dark: #0F172A;
          --fa-dark-soft: #1E293B;
          --fa-text: #475569;
          --fa-text-light: #94A3B8;
          --fa-bg: #F8FAFC;
          --fa-white: #FFFFFF;
          --fa-border: #E2E8F0;
          --fa-shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          --fa-shadow-md: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
          --fa-shadow-hover: 0 20px 35px -5px rgba(249, 115, 22, 0.15);
          --fa-radius-lg: 24px;
          --fa-radius-md: 16px;
        }

        .premium-food-app {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--fa-bg);
          min-height: 100vh;
          padding-bottom: 100px;
        }

        /* ═════════ HERO CAROUSEL ═════════ */
        .modern-hero {
          position: relative;
          height: 80vh;
          min-height: 600px;
          margin-bottom: 60px;
          overflow: hidden;
        }
        .modern-carousel-item {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
          background-size: cover;
          background-position: center;
        }
        .modern-carousel-item.active {
          opacity: 1;
          z-index: 1;
        }
        .modern-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 100%);
          z-index: 2;
        }
        .modern-hero-content {
          position: relative;
          z-index: 3;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 8%;
          max-width: 1400px;
          margin: 0 auto;
        }
        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(249, 115, 22, 0.2);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(249, 115, 22, 0.4);
          color: var(--fa-primary);
          padding: 8px 20px;
          border-radius: 50px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 24px;
          align-self: flex-start;
        }
        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 800;
          color: var(--fa-white);
          line-height: 1.1;
          margin-bottom: 10px;
          max-width: 800px;
        }
        .hero-highlight {
          color: var(--fa-primary);
        }
        .hero-desc {
          font-size: 1.2rem;
          color: #CBD5E1;
          max-width: 500px;
          line-height: 1.6;
          margin-bottom: 40px;
        }
        .hero-btn {
          background: var(--fa-primary);
          color: var(--fa-white);
          border: none;
          padding: 16px 40px;
          border-radius: 50px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          align-self: flex-start;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hero-btn:hover {
          background: var(--fa-primary-hover);
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3);
        }
        .carousel-dots {
          position: absolute;
          bottom: 40px;
          left: 8%;
          display: flex;
          gap: 12px;
          z-index: 3;
        }
        .carousel-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: 0.4s ease;
        }
        .carousel-dot.active {
          width: 35px;
          border-radius: 10px;
          background: var(--fa-primary);
        }

        /* ═════════ SECTION HEADERS ═════════ */
        .modern-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid var(--fa-border);
        }
        .modern-section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--fa-dark);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .modern-section-title span.emoji {
          font-size: 2.5rem;
        }

        /* ═════════ SCROLLABLE CATEGORY CARDS ═════════ */
        .modern-scroll-container {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding: 10px 10px 30px 10px;
          scrollbar-width: none; /* Firefox */
        }
        .modern-scroll-container::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        
        .modern-category-card {
          flex: 0 0 auto;
          width: 240px;
          background: var(--fa-white);
          border-radius: var(--fa-radius-lg);
          overflow: hidden;
          box-shadow: var(--fa-shadow-sm);
          cursor: pointer;
          transition: all 0.4s ease;
          border: 1px solid var(--fa-border);
        }
        .modern-category-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--fa-shadow-md);
          border-color: var(--fa-primary-light);
        }
        .mc-img-box {
          height: 180px;
          position: relative;
          overflow: hidden;
        }
        .mc-img-box img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .modern-category-card:hover .mc-img-box img {
          transform: scale(1.1);
        }
        .mc-discount-badge {
          position: absolute;
          top: 15px; left: 15px;
          background: var(--fa-primary);
          color: white;
          padding: 6px 14px;
          border-radius: 50px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 0.8rem;
          box-shadow: 0 4px 10px rgba(249,115,22,0.3);
        }
        .mc-content {
          padding: 20px;
          text-align: center;
        }
        .mc-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--fa-dark);
          margin: 0;
          transition: color 0.3s;
        }
        .modern-category-card:hover .mc-title {
          color: var(--fa-primary);
        }

        /* ═════════ CONTROLS (SEARCH & FILTER) ═════════ */
        .modern-controls-bar {
          background: var(--fa-white);
          border-radius: var(--fa-radius-lg);
          padding: 20px;
          box-shadow: var(--fa-shadow-sm);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 40px;
          border: 1px solid var(--fa-border);
        }
        .mc-search-box {
          display: flex;
          align-items: center;
          background: var(--fa-bg);
          border-radius: 50px;
          padding: 5px 5px 5px 20px;
          flex: 1;
          min-width: 300px;
          border: 1px solid transparent;
          transition: border 0.3s;
        }
        .mc-search-box:focus-within {
          border-color: var(--fa-primary);
          background: var(--fa-white);
        }
        .mc-search-box input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--fa-dark);
        }
        .mc-search-btn {
          background: var(--fa-primary);
          color: white;
          border: none;
          width: 45px;
           height: 45px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: 0.3s;
        }
        .mc-search-btn:hover { background: var(--fa-primary-hover); }
        
        .mc-actions {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        .mc-select {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          color: var(--fa-dark);
          background: var(--fa-bg);
          border: 1px solid var(--fa-border);
          padding: 12px 20px;
          border-radius: 50px;
          outline: none;
          cursor: pointer;
        }
        .mc-btn-primary {
          background: var(--fa-dark);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 600;
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; transition: 0.3s;
        }
        .mc-btn-primary:hover { background: var(--fa-primary); }
        .mc-btn-outline {
          background: transparent;
          color: var(--fa-text);
          border: 1px solid var(--fa-border);
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 600;
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; transition: 0.3s;
        }
        .mc-btn-outline:hover {
          border-color: var(--fa-dark); color: var(--fa-dark);
        }

        /* ═════════ RESTAURANT CARDS ═════════ */
        .modern-restaurants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 30px;
        }

        .modern-rest-card {
          background: var(--fa-white);
          border-radius: var(--fa-radius-lg);
          overflow: hidden;
          box-shadow: var(--fa-shadow-sm);
          border: 1px solid var(--fa-border);
          transition: all 0.4s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .modern-rest-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--fa-shadow-hover);
          border-color: var(--fa-primary-light);
        }

        .modern-rest-img-wrapper {
          position: relative;
          height: 220px;
          overflow: hidden;
        }
        .modern-rest-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .modern-rest-card:hover .modern-rest-img {
          transform: scale(1.08);
        }
        .modern-rest-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 50%);
          pointer-events: none;
        }
        .modern-rest-badges-top {
          position: absolute;
          top: 15px; left: 15px; right: 15px;
          display: flex; justify-content: space-between;
        }
        .modern-badge {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(4px);
          padding: 6px 12px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex; align-items: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .distance-badge { color: var(--fa-dark); }
        .rating-badge { color: var(--fa-dark); }

        .modern-rest-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .modern-rest-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--fa-dark);
          margin-bottom: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .modern-rest-address {
          font-size: 0.95rem;
          color: var(--fa-text-light);
          margin-bottom: 20px;
          display: flex; align-items: flex-start;
          line-height: 1.4;
        }
        .modern-rest-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px dashed var(--fa-border);
        }
        .modern-rest-time {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          color: var(--fa-primary);
          font-size: 0.95rem;
        }
        .modern-rate-btn {
          background: var(--fa-bg);
          color: var(--fa-text);
          border: 1px solid var(--fa-border);
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }
        .modern-rate-btn:hover {
          background: var(--fa-primary);
          color: white;
          border-color: var(--fa-primary);
        }

        /* Empty State */
        .modern-empty-state {
          text-align: center;
          padding: 80px 20px;
          background: var(--fa-white);
          border-radius: var(--fa-radius-lg);
          border: 1px dashed var(--fa-border);
        }

        @media (max-width: 992px) {
          .modern-hero-content { padding: 0 5%; }
          .hero-title { font-size: 3.5rem; }
        }
        @media (max-width: 768px) {
          .modern-hero { height: 60vh; min-height: 500px; }
          .hero-title { font-size: 2.5rem; }
          .hero-desc { font-size: 1rem; margin-bottom: 30px; }
          .modern-section-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .modern-section-title { font-size: 1.8rem; }
          .modern-controls-bar { flex-direction: column; align-items: stretch; }
          .mc-actions { justify-content: space-between; }
        }
      `}</style>

      {/* ═════════ HERO CAROUSEL ═════════ */}
      <div className="modern-hero">
        {carouselSlides.map((slide, index) => (
          <div
            key={index}
            className={`modern-carousel-item ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="modern-hero-overlay"></div>
            <div className="modern-hero-content">
              <div className="hero-pill">
                <i className="fa-solid fa-bolt"></i> TRENDING NOW
              </div>
              <h1 className="hero-title">
                {slide.title} <br /> <span className="hero-highlight">{slide.highlight}</span>
              </h1>
              <p className="hero-desc">{slide.description}</p>
              <button
                className="hero-btn"
                onClick={() => navigate(slide.buttonLink)}
              >
                {slide.buttonLabel} <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        ))}
        <div className="carousel-dots">
          {carouselSlides.map((_, index) => (
            <div
              key={index}
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </div>

      <div className="container-fluid" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>

        {/* ═════════ HOT DISCOUNTS ═════════ */}
        {transformedDiscountData.length > 0 && (
          <div className="mb-5 pb-4">
            <div className="modern-section-header">
              <h2 className="modern-section-title"><span className="emoji">🔥</span> Hot Discounts</h2>
              <button className="mc-btn-outline" onClick={handleAllOrdersClick}>
                <i className="fas fa-list-alt"></i> My Orders
              </button>
            </div>
            <div className="modern-scroll-container">
              {transformedDiscountData.map((item) => (
                <div key={item.id} className="modern-category-card">
                  <div className="mc-img-box">
                    <img src={item.image} alt={item.CateTitle} />
                    {item.discountSet === 1 && (
                      <div className="mc-discount-badge">{item.discount}</div>
                    )}
                  </div>
                  <div className="mc-content">
                    <h6 className="mc-title">{item.CateTitle}</h6>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════ WHAT'S ON YOUR MIND ═════════ */}
        {transformedMealData1.length > 0 && (
          <div className="mb-5 pb-4">
            <div className="modern-section-header">
              <h2 className="modern-section-title"><span className="emoji">💭</span> What's on your mind?</h2>
              <Link to="/all-mind-categories" className="mc-btn-outline text-decoration-none">
                See More <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="modern-scroll-container">
              {transformedMealData1.map((meal) => (
                <div key={meal.id} className="modern-category-card" onClick={() => handleCardClick1(meal)}>
                  <div className="mc-img-box">
                    <img src={meal.image} alt={meal.CateTitle} />
                  </div>
                  <div className="mc-content">
                    <h6 className="mc-title">{meal.CateTitle}</h6>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════ CRAVING SOMETHING ═════════ */}
        {limitedMealsData.length > 0 && (
          <div className="mb-5 pb-4">
            <div className="modern-section-header">
              <h2 className="modern-section-title"><span className="emoji">🤤</span> Craving something?</h2>
              {hasMoreItems(transformedMealsData, CRAVING_LIMIT) && (
                <Link to="/all-craving-categories" className="mc-btn-outline text-decoration-none">
                  View All <i className="fas fa-arrow-right"></i>
                </Link>
              )}
            </div>
            <div className="modern-scroll-container">
              {limitedMealsData.map((category) => (
                <div key={category.id} className="modern-category-card" onClick={() => handleCardClick(category)}>
                  <div className="mc-img-box">
                    <img src={category.image} alt={category.CateTitle} />
                    {category.discountSet === 1 && (
                      <div className="mc-discount-badge">{category.discount}</div>
                    )}
                  </div>
                  <div className="mc-content">
                    <h6 className="mc-title">{category.CateTitle}</h6>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════ RESTAURANTS SECTION ═════════ */}
        <div className="mb-5 pb-5">
          <div className="modern-section-header">
            <h2 className="modern-section-title"><span className="emoji">🍽️</span> Restaurants Near You</h2>
            {hasMoreItems(sortedKitchens, RESTAURANT_LIMIT) && (
              <Link to="/all-meals" className="mc-btn-outline text-decoration-none">
                View All ({sortedKitchens.length}) <i className="fas fa-arrow-right"></i>
              </Link>
            )}
          </div>

          {/* Controls Bar */}
          <div className="modern-controls-bar">

            <div className="mc-search-box">
              <input
                type="text"
                placeholder="Search for restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
              />
              {searchTerm && (
                <i className="fa-solid fa-xmark text-muted me-3" style={{ cursor: 'pointer' }} onClick={() => { setSearchTerm(""); getTopKitchen(userLocation, ""); }}></i>
              )}
              <button className="mc-search-btn" onClick={handleSearchSubmit}>
                <i className="fas fa-search"></i>
              </button>
            </div>

            <div className="mc-actions">
              <select className="mc-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="distance">Sort by: Distance</option>
                <option value="rating">Sort by: Rating</option>
                <option value="name">Sort by: Name</option>
              </select>

              <button className="mc-btn-primary" onClick={handleUseCurrentLocation} disabled={isGettingLocation}>
                {isGettingLocation ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-location-crosshairs"></i>
                )}
                {userLocation ? "Update Loc" : "Use Location"}
              </button>

              {userLocation && (
                <button className="mc-btn-outline" onClick={handleClearLocation} style={{ color: '#EF4444', borderColor: '#EF4444' }}>
                  <i className="fas fa-times"></i> Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(userLocation || searchTerm) && (
            <div className="d-flex gap-2 mb-4 flex-wrap">
              {userLocation && distanceLimit?.foodLimit && !showAllRestaurants && !searchTerm && (
                <span className="badge bg-light text-dark border py-2 px-3 rounded-pill">
                  <i className="fas fa-map-marker-alt text-primary me-2"></i>
                  Showing within {distanceLimit.foodLimit} km
                </span>
              )}
              {searchTerm && (
                <span className="badge bg-light text-dark border py-2 px-3 rounded-pill">
                  <i className="fas fa-search text-primary me-2"></i>
                  Results for "{searchTerm}"
                </span>
              )}
            </div>
          )}

          {/* Restaurants Grid */}
          <div className="modern-restaurants-grid">
            {limitedKitchens.length > 0 ? (
              limitedKitchens.map((vendor) => (
                <RestaurantCardWithRating
                  key={vendor._id}
                  vendor={vendor}
                  getDistanceDisplay={getDistanceDisplay}
                  getAddress={getAddress}
                  imageUrl={imageUrl}
                  handleRestaurantClick={handleRestaurantClick}
                  handleRestaurantRating={handleRestaurantRating}
                />
              ))
            ) : (
              <div className="modern-empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="bg-light rounded-circle d-inline-flex p-4 mb-4">
                  <i className="fas fa-store-slash fs-1 text-muted"></i>
                </div>
                <h3 className="mb-3">No Restaurants Found</h3>
                <p className="text-muted mb-4">
                  {searchTerm ? `We couldn't find any matches for "${searchTerm}"` : "There are currently no restaurants available in this area."}
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  {searchTerm && (
                    <button className="mc-btn-outline" onClick={() => { setSearchTerm(""); getTopKitchen(userLocation, ""); }}>
                      Clear Search
                    </button>
                  )}
                  {!userLocation && (
                    <button className="mc-btn-primary" onClick={handleUseCurrentLocation}>
                      Enable Location to Explore
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFoodAndNutrition;
