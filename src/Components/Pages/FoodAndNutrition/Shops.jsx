import React, { useEffect, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';

//src/Components/Pages/FoodAndNutrition/Shops.jsx
const AllMeals = () => {
  const {
    kitchen,
    getTopKitchen,
    userLocation,
    getUserLocation, // ✅ Context se function liya
    distanceLimit,
    clearLocation
  } = useContext(MyContext);
 
  const navigate = useNavigate();
  const imageUrl = `${process.env.REACT_APP_API_URL}/`;
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false); // ✅ Location loading state

  // Helper: Haversine Formula for Client-side Distance Calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  };
 
  // 1. Fetch Data on Location Change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Initial fetch with location only (no search term)
        await getTopKitchen(userLocation, "");
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userLocation]);

  // 2. ✅ Handle Use Current Location (Button Action)
  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      if (typeof getUserLocation === 'function') {
        await getUserLocation();
        setShowAllRestaurants(false); // Reset to "Near Me" mode
        setSearchQuery(""); // Clear search if any
      }
    } catch (error) {
      console.error("Location error:", error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  // 3. Handle Search (Re-fetch from API)
  const handleSearchSubmit = async (e) => {
    if(e) e.preventDefault();
    try {
        setLoading(true);
        // Call API with search term
        await getTopKitchen(userLocation, searchQuery);
        
        // If user searches, automatically show all results (ignore distance limit visually)
        if(searchQuery) setShowAllRestaurants(true);
    } catch (error) {
        console.error('Search error:', error);
    } finally {
        setLoading(false);
    }
  };

  // 4. Distance limit & Search filter function
  const filterByDistanceLimit = useMemo(() => {
    return (shops) => {
      if (!shops || !Array.isArray(shops)) return shops;
      
      const limitKm = Number(distanceLimit?.foodLimit || 50);

      const filtered = shops.filter((shop) => {
        let onRoadDistanceKm = null;

        // A. Check Backend Distance
        if (typeof shop.distance === 'number') {
           onRoadDistanceKm = shop.distance;
        } else if (typeof shop.distance === 'object' && shop.distance !== null) {
           onRoadDistanceKm = shop.distance.value || shop.distance.onRoadValue; 
        }

        // B. Backup: Calculate Client-side Distance if missing
        if ((onRoadDistanceKm === null || onRoadDistanceKm === undefined) && userLocation && shop.location?.coordinates) {
             const shopLong = shop.location.coordinates[0]; 
             const shopLat = shop.location.coordinates[1];
             const calculatedDist = calculateDistance(userLocation.latitude, userLocation.longitude, shopLat, shopLong);
             
             if (calculatedDist !== null) {
                 onRoadDistanceKm = calculatedDist;
                 shop.distance = calculatedDist; // Attach for UI display
             }
        }

        // C. Search Logic (Overrides Distance Limit)
        if (searchQuery) {
             const nameToMatch = shop.name ? shop.name.toLowerCase() : "";
             const searchToMatch = searchQuery.toLowerCase();
             
             if (nameToMatch.includes(searchToMatch)) {
                 return true; 
             }
             return nameToMatch.includes(searchToMatch);
        }

        // D. Normal Logic (No Search)
        // If no distance and no search, hide it (unless showAll is forced)
        if (onRoadDistanceKm === undefined || onRoadDistanceKm === null) {
          return showAllRestaurants || !userLocation; 
        }

        const shopDistKm = Number(onRoadDistanceKm);
        const isWithinLimit = shopDistKm <= limitKm;

        // Tag for UI
        if (typeof shop.distance === 'object') {
            shop.distance.isWithinLimit = isWithinLimit;
        }

        // Filter Decision
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
  }, [userLocation, distanceLimit, showAllRestaurants, searchQuery]);

  // Handle show all restaurants
  const handleShowAllRestaurants = () => {
    setShowAllRestaurants(true);
  };

  // Handle clear location
  const handleClearLocation = () => {
    if (clearLocation) {
      clearLocation();
    }
    setShowAllRestaurants(true); 
    setSearchQuery('');
    getTopKitchen(null, ""); // Fetch all without location
  };

  // Sort and filter kitchens
  const sortedAndFilteredKitchens = useMemo(() => {
    if (!kitchen || !Array.isArray(kitchen)) return [];
    
    // First apply distance/search limit filter
    let filtered = filterByDistanceLimit(kitchen);
    
    // Sort based on criteria
    return [...filtered].sort((a, b) => {
      if (sortBy === "distance" && userLocation) {
        const getDist = (item) => {
            if (typeof item.distance === 'number') return item.distance;
            return item.distance?.value || 999999;
        };
        const aDist = getDist(a);
        const bDist = getDist(b);
        return aDist - bDist;
      } else if (sortBy === "rating") {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      } else if (sortBy === "name") {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });
  }, [kitchen, sortBy, userLocation, filterByDistanceLimit]);

  const handleCardClick = (vendor) => {
    navigate(`/shop/FoodAndNurition/Products/${vendor._id}`);
  };

  // Get address for display
  const getAddress = (vendor) => {
    const parts = [];
    if (vendor.address) parts.push(vendor.address);
    if (vendor.city) parts.push(vendor.city);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  // Get distance display
  const getDistanceDisplay = (vendor) => {
    if (vendor.distance === undefined || vendor.distance === null) return null;
    
    if (typeof vendor.distance === 'number') {
        return {
            text: `${Number(vendor.distance).toFixed(1)} km`,
            color: 'success',
            icon: 'fas fa-road',
            isAccurate: true
        };
    }

    if (typeof vendor.distance === 'object') {
        if (vendor.distance.calculationMethod === 'ON_ROAD' || vendor.distance.value) {
            return {
                text: vendor.distance.text || `${vendor.distance.value} km`,
                color: 'success',
                icon: 'fas fa-road',
                isAccurate: true
            };
        }
        if (vendor.distance.calculationMethod === 'STRAIGHT_LINE') {
            return {
                text: vendor.distance.text || `${vendor.distance.value} km`,
                color: 'info',
                icon: 'fas fa-ruler',
                isAccurate: false
            };
        }
    }
    
    return null;
  };
 
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading restaurants...</p>
      </div>
    );
  }
 
  return (
    <div className="container">
      <style>
        {`
          .restaurants-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }
          @media (max-width: 768px) {
            .restaurants-grid {
              grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
              gap: 15px;
            }
          }
          .restaurant-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
            height: 100%;
            background: #fff;
          }
          .restaurant-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-color: #007bff;
          }
          .restaurant-image {
            height: 180px;
            width: 100%;
            object-fit: cover;
          }
          .distance-badge {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 12px;
          }
          .distance-limit-badge {
            background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
        `}
      </style>
      
      <div className="row">
        <div className="col-12 mt-4">
         
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="h2 fw-bold mb-3">All Restaurants</h1>
            
            {/* Distance Limit Info */}
            <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
              {userLocation && distanceLimit?.foodLimit && !showAllRestaurants && !searchQuery && (
                <span className="distance-limit-badge">
                  <i className="fas fa-info-circle"></i>
                  Showing restaurants within {distanceLimit.foodLimit} km
                </span>
              )}

              {(showAllRestaurants || searchQuery) && (
                <span className="badge bg-warning text-dark">
                  <i className="fas fa-eye"></i>
                  Showing All Restaurants
                </span>
              )}
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="input-group mb-3" style={{ maxWidth: '400px' }}>
              <span className="input-group-text bg-white">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search restaurants (e.g. Dominos)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Search</button>
              {searchQuery && (
                <button 
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                      setSearchQuery('');
                      getTopKitchen(userLocation, ""); // Clear search
                      setShowAllRestaurants(false);
                  }}
                >
                  Clear
                </button>
              )}
            </form>
            
            {/* Sort Options & Controls */}
            <div className="d-flex align-items-center mb-3 gap-2 flex-wrap">
              <span className="me-2">Sort by:</span>
              <div className="btn-group me-3">
                <button 
                  className={`btn btn-sm ${sortBy === 'distance' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSortBy('distance')}
                  disabled={!userLocation && sortBy === 'distance'}
                >
                  Distance
                </button>
                {/* <button 
                  className={`btn btn-sm ${sortBy === 'rating' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSortBy('rating')}
                >
                  Rating
                </button> */}
                <button 
                  className={`btn btn-sm ${sortBy === 'name' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSortBy('name')}
                >
                  Name
                </button>
              </div>

              {/* ✅ New: Use Location Button */}
              <button 
                className="btn btn-sm btn-primary" 
                onClick={handleUseCurrentLocation} 
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                    <><i className="fas fa-spinner fa-spin me-2"></i>Loading...</>
                ) : (
                    <><i className="fas fa-location-crosshairs me-2"></i>{userLocation ? "Update Location" : "Use My Location"}</>
                )}
              </button>
              
              {userLocation && distanceLimit?.foodLimit && !showAllRestaurants && !searchQuery && (
                <button className="btn btn-sm btn-outline-secondary" onClick={handleShowAllRestaurants}>
                  <i className="fas fa-eye me-1"></i>
                  Show All
                </button>
              )}

              {userLocation && !showAllRestaurants && !searchQuery && (
                <button className="btn btn-sm btn-outline-danger" onClick={handleClearLocation}>
                  <i className="fas fa-times me-1"></i>
                  Clear Location
                </button>
              )}
              
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-3">
            <p className="text-muted">
              Showing {sortedAndFilteredKitchens.length} of {kitchen.length} restaurants
              {searchQuery && ` matching "${searchQuery}"`}
              {userLocation && distanceLimit?.foodLimit && !showAllRestaurants && !searchQuery && 
                ` (within ${distanceLimit.foodLimit} km)`
              }
            </p>
          </div>

          {/* Restaurants Grid */}
          <div className="restaurants-grid mb-5">
            {sortedAndFilteredKitchens.length === 0 ? (
              <div className="col-12 text-center py-5">
                <i className="fas fa-utensils fs-1 text-muted mb-3"></i>
                <h5>No restaurants found</h5>
                <p className="text-muted mb-3">
                  {searchQuery 
                    ? `No restaurants match "${searchQuery}"`
                    : userLocation && distanceLimit?.foodLimit && !showAllRestaurants
                      ? `No restaurants found within ${distanceLimit.foodLimit} km`
                      : userLocation
                        ? 'No restaurants available near your location'
                        : 'Enable location to see nearby restaurants'
                  }
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  {searchQuery && (
                      <button className="btn btn-outline-primary" onClick={() => { setSearchQuery(''); getTopKitchen(userLocation, ""); }}>
                          Clear Search
                      </button>
                  )}
                  {/* ✅ Enable Location Button in Empty State */}
                  {!userLocation && (
                    <button className="btn btn-primary" onClick={handleUseCurrentLocation}>
                        <i className="fas fa-location-crosshairs me-2"></i>Enable Location
                    </button>
                  )}
                  {userLocation && distanceLimit?.foodLimit && !showAllRestaurants && !searchQuery && (
                    <button className="btn btn-outline-primary" onClick={handleShowAllRestaurants}>
                      <i className="fas fa-eye me-2"></i>Show All Restaurants
                    </button>
                  )}
                </div>
              </div>
            ) : (
              sortedAndFilteredKitchens.map((vendor) => {
                const distanceInfo = getDistanceDisplay(vendor);
                
                return (
                  <div 
                    key={vendor._id}
                    className="restaurant-card"
                    onClick={() => handleCardClick(vendor)}
                  >
                    {/* Restaurant Image */}
                    <div className="position-relative">
                      <img
                        src={vendor.image ? `${imageUrl}${vendor.image}` : '/default-restaurant.jpg'}
                        className="restaurant-image"
                        alt={vendor.name || "Restaurant"}
                        onError={(e) => {
                          e.target.src = '/default-restaurant.jpg';
                        }}
                      />
                      
                      {/* Distance Badge */}
                      {distanceInfo && (
                        <div className="position-absolute top-0 start-0 m-2">
                          <span 
                            className={`badge bg-${distanceInfo.color} text-white distance-badge`}
                          >
                            <i className={`${distanceInfo.icon} me-1`}></i>
                            {distanceInfo.text}
                          </span>
                        </div>
                      )}
                      
                      {/* Rating Badge */}
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-warning text-dark">
                          <i className="fas fa-star me-1"></i>
                          {vendor.rating || '4.5'}
                        </span>
                      </div>

                      {/* Outside Limit Warning */}
                      {(showAllRestaurants || searchQuery) && distanceLimit?.foodLimit && vendor.distance?.isWithinLimit === false && (
                        <div className="position-absolute bottom-0 end-0 m-2">
                          <span className="badge bg-warning text-dark">
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            Outside Limit
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-3">
                      {/* Restaurant Name */}
                      <h6 className="fw-bold mb-2 text-truncate">
                        {vendor.name || "Restaurant"}
                      </h6>
                      
                      {/* Address */}
                      <p className="small text-muted mb-2 text-truncate">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {getAddress(vendor)}
                      </p>
                      
                      {/* Distance Details (if available) */}
                      {distanceInfo && distanceInfo.isAccurate && vendor.distance?.durationText && (
                        <p className="small text-muted mb-0">
                          <i className="fas fa-clock me-1"></i>
                          {vendor.distance.durationText}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
 
export default AllMeals;
