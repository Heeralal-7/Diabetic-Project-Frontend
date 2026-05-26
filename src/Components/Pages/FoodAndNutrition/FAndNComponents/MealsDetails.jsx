import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Carousel from "../FAndNComponents/Carousel";
import FoodAndNurtImg from "../../../Assets/img/FoodAndNutrition/FoodAndNurtImg.png";
import FoodAndNurtImg1 from "../../../Assets/img/FoodAndNutrition/FoodAndNurtImg1.png";
import FoodAndNurtImg2 from "../../../Assets/img/FoodAndNutrition/FoodAndNurtImg2.png";
import FoodAndNurtImg3 from "../../../Assets/img/FoodAndNutrition/FoodAndNurtImg3.png";
import FoodAndNurtImg4 from "../../../Assets/img/FoodAndNutrition/FoodAndNurtImg4.png";
import FilterOffcanvas from "../FAndNComponents/FilterOffcanvas";
import { MyContext } from '../../../../Context/Context';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Carousel as ProductCarousel } from 'react-bootstrap';
import ProductItemCard from "../FAndNComponents/ProductItemCard";

const MealDetails = () => {
  const { id: mealId } = useParams();
  const navigate = useNavigate();
  const {
    mealItems,
    mealLoading,
    mealError,
    getMealDetails,
    mealMeta,
    addToCartCraving,
    addExtraItemsToCraving
  } = useContext(MyContext);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [radio, setRadio] = useState(new Date().toLocaleDateString('en-US', { weekday: 'short' }));
  const [initialLoad, setInitialLoad] = useState(true);
  const [request, setRequest] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ UPDATED STATES for Filters and Sorting
  const [foodTypeFilter, setFoodTypeFilter] = useState('All'); // 'All', 'Veg', 'Non-veg'
  const [sortBy, setSortBy] = useState('Relevance'); // 'Relevance', 'Rating', 'Cost:LowtoHigh', 'Cost:HightoLow'
  const [statusFilter, setStatusFilter] = useState('All'); // Example: 'All', 'Available', 'OutOfStock' (Assuming a 'status' field)

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const CarouselData = [
    {
      image: FoodAndNurtImg1,
      captionTitle: "Healthy food for you",
      captionText: "Etiam in ex nec lobortis food luctus. Etiam iaculis healthy.",
      buttonText: "Order Now",
    },
    {
      image: FoodAndNurtImg2,
      captionTitle: "Nutritious Meals",
      captionText: "Aliquam euismod bibendum laoreet. Pellentesque ac bibendum.",
      buttonText: "Discover More",
    },
    {
      image: FoodAndNurtImg3,
      captionTitle: "Fresh and Organic",
      captionText: "Curabitur consequat orci vitae arcu interdum, vel tincidunt.",
      buttonText: "Shop Now",
    },
    {
      image: FoodAndNurtImg4,
      captionTitle: "Delicious and Healthy",
      captionText: "Vivamus vitae magna vel mauris fermentum scelerisque.",
      buttonText: "Get Started",
    },
    {
      image: FoodAndNurtImg,
      captionTitle: "Balanced Diet",
      captionText: "Suspendisse potenti. Praesent et risus non quam condimentum.",
      buttonText: "Learn More",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (mealId) {
        await getMealDetails(mealId);
        setInitialLoad(false);
      }
    };

    fetchData();
  }, [mealId]);

  useEffect(() => {
    if (selectedItem) {
      calculateTotal();
    }
  }, [quantity, selectedAddons, selectedItem]);

  const calculateTotal = () => {
    if (!selectedItem) return;
    
    const itemPrice = parseFloat(selectedItem.amount) || 0;
    const discountPercentage = parseFloat(selectedItem.discountPercentage) || 0;
    const discountedPrice = itemPrice - (itemPrice * discountPercentage / 100);
    
    const addonsTotal = selectedAddons.reduce((sum, addon) => {
      return sum + (parseFloat(addon.price) || 0);
    }, 0);
    
    setTotalPrice((discountedPrice * quantity) + addonsTotal);
  };

  const handleAddonToggle = (addon) => {
    setSelectedAddons(prev => {
      const existingIndex = prev.findIndex(a => a._id === addon._id);
      if (existingIndex > -1) {
        return prev.filter(a => a._id !== addon._id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setSelectedAddons([]);
    setRequest('');
    setShowModal(true);
  };

  const handleAddToCart = async () => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthError('Please login to add items to cart');
        navigate('/UserLogin');
        return;
      }

      const mainItemPayload = {
        vendorId: selectedItem.vendorId, 
        quantity: quantity,
        request: request.trim() || undefined
      };

      await addToCartCraving(selectedItem._id, mainItemPayload);

      if (selectedAddons.length > 0) {
        const addonsPayload = {
          extraItems: selectedAddons.map(addon => ({
            name: addon.name,
            price: addon.price,
            _id: addon._id 
          }))
        };

        await addExtraItemsToCraving(selectedItem._id, addonsPayload);
      }

      setShowModal(false);
      navigate('/shop/FoodAndNurition/cart');
    } catch (error) {
      console.error('Error in add to cart flow:', error);
      
      if (error.response?.status === 401) {
        setAuthError('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/UserLogin');
      } else {
        const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to add item to cart';
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter and sort logic with search
  const filteredAndSortedMealItems = [...mealItems]
    .filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          item.foodName?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.foodSubCategory?.toLowerCase().includes(query) ||
          item.ingredients?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Food Type Filter
      if (foodTypeFilter !== 'All') {
        return item.foodCategory?.toLowerCase() === foodTypeFilter.toLowerCase();
      }
      
      // Status Filter
      if (statusFilter !== 'All') {
        // Implement status filter logic if needed
        return true;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort By Logic
      if (sortBy === 'Rating') {
        return (b.rating || 0) - (a.rating || 0); 
      } else if (sortBy === 'Cost:LowtoHigh') {
        const priceA = (parseFloat(a.amount) || 0) * (1 - (parseFloat(a.discountPercentage) || 0) / 100);
        const priceB = (parseFloat(b.amount) || 0) * (1 - (parseFloat(b.discountPercentage) || 0) / 100);
        return priceA - priceB;
      } else if (sortBy === 'Cost:HightoLow') {
        const priceA = (parseFloat(a.amount) || 0) * (1 - (parseFloat(a.discountPercentage) || 0) / 100);
        const priceB = (parseFloat(b.amount) || 0) * (1 - (parseFloat(b.discountPercentage) || 0) / 100);
        return priceB - priceA;
      }
      return 0;
    });

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled in the filter logic above
  };

  if (initialLoad || mealLoading) {
    return (
      <div className="container-xl container-fluid text-center py-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Fetching meal details...</p>
      </div>
    );
  }

  if (mealError) {
    return <div className="alert alert-danger m-3">{mealError}</div>;
  }

  if (!mealMeta || mealItems.length === 0) {
    return (
      <div className="container-xl container-fluid text-center py-5">
        <p className="display-6 mb-4 fw-semibold">No meal data found!</p>
        <p>It seems this meal has no options, or there was an issue fetching them.</p>
        <p>Meal ID: {mealId}</p>
      </div>
    );
  }

  return (
    <>
      <div className="container-xl container-fluid">
        <div className="row">
          <div className="col-12 mt-4">
            <div className="mb-5">
              <Carousel slideData={CarouselData} id='carousel3' autoplay="carousel" />
            </div>

            {/* Meal Meta Info */}
            <div className="mb-4 p-3 bg-light rounded-3 shadow-sm">
              <div className="row g-0">
                <div className="col-md-4">
                  <img 
                    src={mealMeta.image?.[0] ? `${process.env.REACT_APP_API_URL}${mealMeta.image[0]}` : FoodAndNurtImg1} 
                    className="img-fluid rounded-start h-100 object-fit-cover" 
                    alt={mealMeta.foodName} 
                    style={{ maxHeight: '250px', width: '100%' }}
                  />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <h3 className="card-title fw-bold text-danger">{mealMeta.foodName}</h3>
                    <p className="text-muted mb-2">
                      <span className="fw-semibold">{mealMeta.calorie} calorie</span> | {mealMeta.foodType}
                      {mealMeta.vendorName && <span className="ms-3">by {mealMeta.vendorName}</span>}
                    </p>
                    <p className="card-text">{mealMeta.description}</p>
                    {mealMeta.ingredients && <p className="text-muted small">Ingredients: {mealMeta.ingredients}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3 d-flex gap-2 flex-wrap">
              {daysOfWeek.map((d, i) => (
                <div key={i}>
                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="days" 
                    id={`day${i}`} 
                    autoComplete="off"
                    checked={d === radio} 
                    onChange={() => setRadio(d)} 
                  />
                  <label 
                    className={`btn ${d === radio ? 'customRadioBorderRed active' : 'customRadioBorderRed'}`} 
                    htmlFor={`day${i}`}
                  >
                    {d}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="w-100 mb-4">
              <div className="d-flex flex-wrap gap-1 gap-md-3 align-items-center" role="group" aria-label="Basic example">
                {/* Search Form */}
                <form className="d-flex me-auto" onSubmit={handleSearch}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control rounded-pill"
                      placeholder="Search meal items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ minWidth: '200px' }}
                    />
                    <button 
                      className="btn btn-outline-secondary rounded-pill ms-2"
                      type="submit"
                    >
                      <i className="ri-search-line"></i>
                    </button>
                  </div>
                </form>
                
                {/* Sort By Dropdown */}
                <div className="dropdown-ii">
                  <button 
                    className="btn border btn-light rounded-pill px-3 fw-semibold text-nowrap dropdown-toggle"
                    type="button"
                    id="sortByDropdown" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    Sort By: {sortBy === 'Cost:LowtoHigh' ? 'Cost: Low to High' : sortBy === 'Cost:HightoLow' ? 'Cost: High to Low' : sortBy} 
                  </button>
                  <ul className="dropdown-menu activeRedColor px-3" aria-labelledby="sortByDropdown" style={{minWidth:"180px"}}>
                    <li>
                      <div className="form-check mt-2">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="Sorting" 
                          id="sortRadio1" 
                          checked={sortBy === 'Relevance'}
                          onChange={() => setSortBy('Relevance')}
                        />
                        <label className="form-check-label" htmlFor="sortRadio1">
                          Relevance (Default)
                        </label>
                      </div>
                    </li>
                    <li>
                      <div className="form-check mt-2">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="Sorting" 
                          id="sortRadio2" 
                          checked={sortBy === 'Rating'}
                          onChange={() => setSortBy('Rating')}
                        />
                        <label className="form-check-label" htmlFor="sortRadio2">
                          Rating
                        </label>
                      </div>
                    </li>
                    <li>
                      <div className="form-check mt-2">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="Sorting" 
                          id="sortRadio3" 
                          checked={sortBy === 'Cost:LowtoHigh'}
                          onChange={() => setSortBy('Cost:LowtoHigh')}
                        />
                        <label className="form-check-label" htmlFor="sortRadio3">
                          Cost: Low to High
                        </label>
                      </div>
                    </li>
                    <li>
                      <div className="form-check mt-2">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="Sorting" 
                          id="sortRadio4" 
                          checked={sortBy === 'Cost:HightoLow'}
                          onChange={() => setSortBy('Cost:HightoLow')}
                        />
                        <label className="form-check-label" htmlFor="sortRadio4">
                          Cost: High to Low
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Food Type Filters */}
                <div className="w-auto text-nowrap">
                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="foodTypeFilter" 
                    id="allFilter" 
                    autoComplete="off" 
                    checked={foodTypeFilter === 'All'}
                    onChange={() => setFoodTypeFilter('All')}
                  />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="allFilter">
                    All
                  </label>
                </div>

                <div className="w-auto text-nowrap">
                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="foodTypeFilter" 
                    id="vegFilter" 
                    autoComplete="off" 
                    checked={foodTypeFilter === 'Veg'}
                    onChange={() => setFoodTypeFilter('Veg')}
                  />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="vegFilter">
                    Veg
                    <svg width="14" className='ms-2' height="14" viewBox="0 0 14 14" fill="None" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#199339" />
                      <circle cx="7" cy="7" r="3.5" fill="#199339" />
                    </svg>
                  </label>
                </div>
                
                <div className="w-auto text-nowrap">
                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="foodTypeFilter" 
                    id="nonVegFilter" 
                    autoComplete="off" 
                    checked={foodTypeFilter === 'Non-veg'}
                    onChange={() => setFoodTypeFilter('Non-veg')}
                  />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="nonVegFilter">
                    Non-Veg
                    <svg width="14" className='ms-2' height="14" viewBox="0 0 14 14" fill="None" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#EB3239" />
                      <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" />
                    </svg>
                  </label>
                </div>
              </div>
            </div>
            
            <h4 className="mb-3">Meal Options</h4>
            {searchQuery && (
              <p className="text-muted mb-3">
                Showing results for "{searchQuery}" ({filteredAndSortedMealItems.length} items found)
              </p>
            )}
            <div className="ProductCardItemsWrapper row g-4">
              {filteredAndSortedMealItems.length > 0 ? (
                filteredAndSortedMealItems.map((product) => (
                  <ProductItemCard key={product._id} Data={product} onItemClick={handleItemClick} />
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">
                    No {foodTypeFilter !== 'All' ? foodTypeFilter.toLowerCase() : ''} items 
                    {searchQuery ? ` matching "${searchQuery}"` : ''} 
                    found for this meal with the current filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        {selectedItem && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedItem.foodName} {selectedItem.foodSubCategory}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {authError && <div className="alert alert-danger">{authError}</div>}
              <div className="row">
                <div className="col-md-6 mb-3 mb-md-0">
                  {selectedItem.image && selectedItem.image.length > 0 ? (
                    <ProductCarousel interval={null} variant="dark">
                      {selectedItem.image.map((imgUrl, index) => (
                        <ProductCarousel.Item key={index}>
                          <img
                            className="d-block w-100 rounded"
                            style={{ height: '350px', objectFit: 'cover' }}
                            src={`${process.env.REACT_APP_API_URL}${imgUrl}`}
                            alt={`${selectedItem.foodName} - slide ${index + 1}`}
                          />
                        </ProductCarousel.Item>
                      ))}
                    </ProductCarousel>
                  ) : (
                    <img
                      src={FoodAndNurtImg3}
                      className="img-fluid rounded"
                      style={{ height: '350px', objectFit: 'cover', width: '100%' }}
                      alt="No image available"
                    />
                  )}
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className={`fw-bold ${selectedItem.foodCategory?.toLowerCase() === 'veg' ? 'text-success' : 'text-danger'}`}>
                      {selectedItem.foodCategory}
                    </span>
                    <span className="text-muted">•</span>
                    <span className="text-muted">{selectedItem.foodSubCategory}</span>
                  </div>
                  
                  <h4 className="mb-2">
                    {selectedItem.discountPercentage > 0 ? (
                      <>
                        <span className="text-decoration-line-through text-muted me-2">
                          ₹{selectedItem.amount}
                        </span>
                        ₹{(selectedItem.amount - (selectedItem.amount * selectedItem.discountPercentage / 100)).toFixed(2)}
                        <span className="text-success ms-2 fs-6">
                          ({selectedItem.discountPercentage}% off)
                        </span>
                      </>
                    ) : (
                      <>₹{selectedItem.amount}</>
                    )}
                  </h4>
                  <p className="text-muted mb-2">
                    {selectedItem.calorie} calorie | {selectedItem.ingredients}
                  </p>
                  <p className="mb-3">{selectedItem.description}</p>
                  
                  <div className="mb-3">
                    <label htmlFor="request" className="form-label">Special Request (Optional)</label>
                    <textarea
                      id="request"
                      className="form-control"
                      rows="2"
                      placeholder="Any special instructions (e.g. extra spicy, no onions)"
                      value={request}
                      onChange={(e) => setRequest(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span>Quantity:</span>
                    <div className="d-flex align-items-center">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={quantity}
                        min="1"
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="form-control text-center mx-2"
                        style={{width: "60px"}}
                      />
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {selectedItem.addons && Array.isArray(selectedItem.addons) && selectedItem.addons.length > 0 && (
                    <div className="mb-4">
                      <h6>Addons:</h6>
                      <div className="border rounded overflow-auto" style={{maxHeight: "200px"}}>
                        {selectedItem.addons.map((addon) => {
                          const isSelected = selectedAddons.some(a => a._id === addon._id);
                          
                          return (
                            <div 
                              key={addon._id}
                              className={`p-3 border-bottom ${isSelected ? 'bg-light' : ''}`}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input me-2"
                                    checked={isSelected}
                                    onChange={() => handleAddonToggle(addon)}
                                    id={`addon-${addon._id}`}
                                  />
                                  <label className="form-check-label" htmlFor={`addon-${addon._id}`}>
                                    {addon.name} - ₹{addon.price}
                                    {addon.calorie && (
                                      <span className="text-muted ms-2 fs-7">
                                        ({addon.calorie} kcal)
                                      </span>
                                    )}
                                  </label>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <h5 className="mb-0">Total: ₹{totalPrice.toFixed(2)}</h5>
              <div>
                <Button variant="secondary border-0" onClick={() => setShowModal(false)} className="me-2">
                  Close
                </Button>
                <Button 
                  variant="primary bg-danger border-0" 
                  onClick={handleAddToCart}
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  );
};

export default MealDetails;