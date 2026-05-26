import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Carousel from "./FAndNComponents/Carousel";
import FilterOffcanvas from "./FAndNComponents/FilterOffcanvas";
import ProductItemCard from "./FAndNComponents/ProductItemCard";
import { MyContext } from '../../../Context/Context';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Carousel as ProductCarousel } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

// Image imports
import FoodAndNurtImg from "../../Assets/img/FoodAndNutrition/FoodAndNurtImg.png";
import FoodAndNurtImg1 from "../../Assets/img/FoodAndNutrition/FoodAndNurtImg1.png";
import FoodAndNurtImg2 from "../../Assets/img/FoodAndNutrition/FoodAndNurtImg2.png";
import FoodAndNurtImg3 from "../../Assets/img/FoodAndNutrition/FoodAndNurtImg3.png";
import FoodAndNurtImg4 from "../../Assets/img/FoodAndNutrition/FoodAndNurtImg4.png";
import SearchIcon from "../../Assets/img/FoodAndNutrition/Categorie.png";

const ProductsItems = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const {
    getParticularKitchenFood,
    particularFoodItems,
    loading: itemsLoading,
    error: itemsError,
    addToCartCraving,
    addExtraItemsToCraving,
    searchFood1,
    getFoodMenu
  } = useContext(MyContext);

  // Local states
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [radio, setRadio] = useState("Sun"); // Day of week radio
  const [specialRequest, setSpecialRequest] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [foodMenu, setFoodMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  // const [categoryMapping, setCategoryMapping] = useState({}); // Not strictly needed with the updated findItemsForCategory

  // ✅ NEW STATES for Filters and Sorting - Copied from MealDetails
  const [foodTypeFilter, setFoodTypeFilter] = useState('All'); // 'All', 'Veg', 'Non-veg'
  const [sortBy, setSortBy] = useState('Relevance'); // 'Relevance', 'Rating', 'Cost:LowtoHigh', 'Cost:HightoLow'
  const [statusFilter, setStatusFilter] = useState('All'); // Example: 'All', 'Available', 'OutOfStock' (Assuming a 'status' field)


  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    console.log("ProductsItems Component Mounted. Vendor ID:", vendorId);
    if (vendorId) {
      getParticularKitchenFood(vendorId);
      fetchFoodMenu();
    }
  }, [vendorId]); // Added getParticularKitchenFood and fetchFoodMenu to dependencies

  useEffect(() => {
    if (selectedItem) {
      calculateTotal();
    }
  }, [quantity, selectedAddons, selectedItem]);

  const fetchFoodMenu = async () => {
    try {
      const menu = await getFoodMenu(vendorId);
      if (menu && menu.details && Array.isArray(menu.details)) {
        setFoodMenu(menu.details);
      } else if (Array.isArray(menu)) {
        setFoodMenu(menu);
      }
    } catch (error) {
      console.error("Error fetching food menu:", error);
    }
  };

  // Function to find matching items for a category
  const findItemsForCategory = (category, itemsToFilter) => {
    if (category === 'All') return itemsToFilter;
    
    return itemsToFilter.filter(item => {
      // Check if foodSubCategory matches exactly
      if (item.foodSubCategory?.toLowerCase() === category?.toLowerCase()) return true;
      
      // Check if foodSubCategory contains the category name (more flexible)
      if (item.foodSubCategory && category && 
          item.foodSubCategory.toLowerCase().includes(category.toLowerCase())) {
        return true;
      }
      
      // Check if foodName contains the category name
      if (item.foodName && category && 
          item.foodName.toLowerCase().includes(category.toLowerCase())) {
        return true;
      }
      
      return false;
    });
  };

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
    setSpecialRequest('');
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

      if (!selectedItem.vendorId) {
        throw new Error("Vendor ID is missing from the selected item.");
      }

      const mainItemPayload = {
        vendorId: selectedItem.vendorId,
        quantity: quantity,
        request: specialRequest.trim() || undefined
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchFood1(searchQuery, vendorId);
      setSearchResults(results.details || []);
    } catch (error) {
      console.error("Error searching food:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    // When a category is selected, clear search results to prioritize category view
    setSearchQuery('');
    setSearchResults([]);
  };

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

  // ✅ NEW: Filtered and Sorted particularFoodItems logic
  const filteredAndSortedItems = [...(particularFoodItems || [])] // Create a shallow copy and handle null/undefined
    .filter(item => {
      // 1. Food Type Filter (Veg/Non-veg)
      if (foodTypeFilter === 'All') return true;
      return item.foodCategory?.toLowerCase() === foodTypeFilter.toLowerCase();
    })
    .filter(item => {
      // 2. Status Filter (Example) - Assuming 'status' field exists
      // You would replace 'Available'/'OutOfStock' with actual values from your data
      if (statusFilter === 'All') return true;
      // return item.status === statusFilter; // Uncomment and adapt if you have a status field
      return true; // For now, always return true if status filter is not fully implemented
    })
    .sort((a, b) => {
      // 3. Sort By Logic
      if (sortBy === 'Rating') {
        // Assuming 'rating' field exists, e.g., item.rating (number)
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
      // 'Relevance' (default) - no specific sort needed if data comes pre-ordered by relevance
      return 0; 
    });


  // Determine which items to display
  let itemsToRender = [];
  if (searchQuery.trim() && searchResults.length > 0) {
    itemsToRender = searchResults;
  } else {
    itemsToRender = findItemsForCategory(selectedCategory, filteredAndSortedItems);
  }


  if (itemsLoading) {
    return (
      <div className="container-xl container-fluid text-center py-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Fetching delicious meals...</p>
      </div>
    );
  }

  if (!particularFoodItems || particularFoodItems.length === 0) {
    return (
      <div className="container-xl container-fluid text-center py-5">
        <p className="display-6 mb-4 fw-semibold">No food items found for this kitchen.</p>
        <p>It seems this kitchen hasn't added any meals yet, or there was an issue fetching them.</p>
        <p>Vendor ID: {vendorId}</p>
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
            
            {/* Kitchen Name Header */}
            <div className="mb-4">
              <h2 className="fw-bold text-danger">Diabeteswala</h2>
              <p className="text-muted">Healthy meals for diabetic patients</p>
            </div>
            
            {/* Search and Menu Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
              <div className="d-flex flex-column flex-md-row gap-3 w-100">
                {/* Search Form */}
                <Form onSubmit={handleSearch} className="w-100">
                  <InputGroup className="rounded-pill overflow-hidden shadow-sm">
                    <InputGroup.Text className="bg-white border-0">
                      <img src={SearchIcon} alt="Search" width="20" height="20" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search for dishes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 py-2"
                    />
                    <Button 
                      variant="outline-secondary" 
                      type="submit"
                      className="border-0 bg-white text-dark"
                      disabled={isSearching}
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </InputGroup>
                </Form>
                
                {/* Food Menu Button */}
                <Button 
                  variant="outline-danger" 
                  className="rounded-pill px-4 text-nowrap"
                  onClick={() => setShowFoodMenu(!showFoodMenu)}
                >
                  {showFoodMenu ? 'Hide Menu' : 'Show Menu'} <i className="ri-menu-line ms-1"></i>
                </Button>
              </div>
            </div>
            
            {/* Food Menu Section */}
            {showFoodMenu && foodMenu.length > 0 && (
              <div className="mb-4 p-3 bg-light rounded-3 shadow-sm">
                <h5 className="mb-3">Food Categories</h5>
                <div className="d-flex flex-wrap gap-2">
                  <span 
                    className={`badge rounded-pill py-2 px-3 cursor-pointer ${selectedCategory === 'All' ? 'bg-danger' : 'bg-secondary'}`}
                    onClick={() => filterByCategory('All')}
                  >
                    All ({particularFoodItems.length})
                  </span>
                  {foodMenu.map((categoryObj, index) => {
                    // Count items for the category from the currently filtered/sorted set (not the original particularFoodItems)
                    const categoryItems = findItemsForCategory(categoryObj._id, filteredAndSortedItems);
                    return (
                      <span 
                        key={index}
                        className={`badge rounded-pill py-2 px-3 cursor-pointer ${selectedCategory === categoryObj._id ? 'bg-danger' : 'bg-secondary'}`}
                        onClick={() => filterByCategory(categoryObj._id)}
                      >
                        {categoryObj._id} ({categoryItems.length})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Days Filter */}
            <div className="mb-3 d-flex gap-2 flex-wrap">
              {daysOfWeek.map((d, i) => (
                <div key={i}>
                  <input type="radio" className="btn-check" name="days" id={`day${i}`} autoComplete="off"
                    checked={d === radio} onChange={() => setRadio(d)} />
                  <label className="btn customRadioBorderRed" htmlFor={`day${i}`} onClick={() => setRadio(d)}>
                    {d}
                  </label>
                </div>
              ))}
            </div>
            
            {/* Filter and Sort Section */}
            <div className="w-100 mb-4">
              <div className="d-flex flex-wrap gap-1 gap-md-3 align-items-center" role="group" aria-label="Basic example">
                {/* Keep the Filter Offcanvas if needed, or remove it if not used for craving */}
                {/* <button className="btn border btn-light rounded-pill px-3 fw-semibold text-nowrap"
                  data-bs-toggle="offcanvas" data-bs-target="#Filter" aria-controls="Filter">
                  Filter <i className="ri-equalizer-2-line fw-lighter"></i>
                </button>
                <FilterOffcanvas mainTitle="Filter" /> */}
                
                {/* ✅ FIXED: Sort By Dropdown with controlled state - Copied from MealDetails */}
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
                
                {/* ✅ NEW: All Filter Button - Copied from MealDetails */}
                {/* Removed this specific 'All' filter as the category filter already provides an 'All' option */}
                {/* <div className="w-auto text-nowrap">
                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="foodTypeFilter" 
                    id="allFoodTypeFilter" 
                    autoComplete="off" 
                    checked={foodTypeFilter === 'All'}
                    onChange={() => setFoodTypeFilter('All')}
                  />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="allFoodTypeFilter">
                    All Food Types
                  </label>
                </div> */}

                {/* ✅ MODIFIED: Veg Filter - Copied from MealDetails */}
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
                    <svg width="14" className='ms-2' height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#199339" />
                      <circle cx="7" cy="7" r="3.5" fill="#199339" />
                    </svg>
                  </label>
                </div>
                
                {/* ✅ MODIFIED: Non-Veg Filter - Copied from MealDetails */}
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
                    <svg width="14" className='ms-2' height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#EB3239" />
                      <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" />
                    </svg>
                  </label>
                </div>
                {/* ✅ NEW: All Filter Button - Copied from MealDetails */}
{/* Removed this specific 'All' filter as the category filter already provides an 'All' option */}
<div className="w-auto text-nowrap">
  <input 
    type="radio" 
    className="btn-check" 
    name="foodTypeFilter" 
    id="allFoodTypeFilter" 
    autoComplete="off" 
    checked={foodTypeFilter === 'All'}
    onChange={() => setFoodTypeFilter('All')}
  />
  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="allFoodTypeFilter">
    All Food Types
  </label>
</div>
                
                {/* ✅ NEW: Status Filter Example (e.g., Available/Out of Stock) - Copied from MealDetails */}
                {/* Uncomment and adapt if you have a 'status' field for your craving items */}
                {/*
                <div className="w-auto text-nowrap">
                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="statusFilter" 
                    id="statusAll" 
                    autoComplete="off" 
                    checked={statusFilter === 'All'}
                    onChange={() => setStatusFilter('All')}
                  />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="statusAll">
                    All Status
                  </label>
                </div>
                <div className="w-auto text-nowrap">
                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="statusFilter" 
                    id="statusAvailable" 
                    autoComplete="off" 
                    checked={statusFilter === 'Available'}
                    onChange={() => setStatusFilter('Available')}
                  />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="statusAvailable">
                    Available
                  </label>
                </div>
                <div className="w-auto text-nowrap">
                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="statusFilter" 
                    id="statusOutOfStock" 
                    autoComplete="off" 
                    checked={statusFilter === 'OutOfStock'}
                    onChange={() => setStatusFilter('OutOfStock')}
                  />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="statusOutOfStock">
                    Out of Stock
                  </label>
                </div>
                */}

                {/* ✅ COMMENTED OUT: Static Fast Delivery Button - Copied from MealDetails */}
                {/*
                <div className="w-auto text-nowrap">
                  <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="btnradio3">
                    Fast Delivery
                  </label>
                </div>
                */}
              </div>
            </div>
            
            {/* Search Results Info */}
            {searchQuery.trim() && (
              <div className="alert alert-info mb-4">
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} results for "${searchQuery}"`
                  : `No results found for "${searchQuery}"`
                }
                <Button 
                  variant="link" 
                  className="p-0 ms-2" 
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setSelectedCategory('All'); // Reset category filter when clearing search
                  }}
                >
                  Clear search
                </Button>
              </div>
            )}
            
            {/* Products Grid */}
            <div className="w-100 mb-4">
              <div className="ProductCardItemsWrapper row g-4">
                {itemsToRender.length > 0 ? (
                  itemsToRender.map((product) => (
                    <ProductItemCard key={product._id} Data={product} onItemClick={handleItemClick} />
                  ))
                ) : (
                  <div className="col-12 text-center py-5">
                    <p className="text-muted">No items found for the current filters or search query.</p>
                    {searchQuery.trim() && <p className="text-muted small">Search query: "{searchQuery}"</p>}
                    {selectedCategory !== 'All' && <p className="text-muted small">Selected category: {selectedCategory}</p>}
                    {foodTypeFilter !== 'All' && <p className="text-muted small">Food type: {foodTypeFilter}</p>}
                    {/* Add other active filters here if needed */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        {selectedItem && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedItem.foodSubCategory} {selectedItem.foodName}</Modal.Title>
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
                    <span className={`fw-bold ${selectedItem.foodCategory === 'Veg' ? 'text-success' : 'text-danger'}`}>
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
                    {selectedItem.calorie} calorie 
                    <p>{selectedItem.ingredients}</p>
                  </p>
                  <p className="mb-3">{selectedItem.description}</p>

                  <div className="mb-3">
                    <label htmlFor="specialRequest" className="form-label">Special Request (Optional)</label>
                    <textarea
                      id="specialRequest"
                      className="form-control"
                      rows="2"
                      placeholder="Any special instructions (e.g. extra spicy, no onions)"
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
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

export default ProductsItems;