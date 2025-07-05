import React, { useContext, useEffect, useState } from 'react';
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
      request: request.trim() || undefined // Send undefined if empty
    };

    // First add/update the main item
    const response = await addToCartCraving(selectedItem._id, mainItemPayload);

    // Then handle addons if any
    if (selectedAddons.length > 0) {
      const addonsPayload = {
        extraItems: selectedAddons.map(addon => ({
          name: addon.name,
          price: addon.price
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

  if (initialLoad || mealLoading) {
    return <div className="text-center py-5">Loading meal details...</div>;
  }

  if (mealError) {
    return <div className="alert alert-danger m-3">{mealError}</div>;
  }

  if (!mealMeta || mealItems.length === 0) {
    return <div className="alert alert-warning m-3">No meal data found!</div>;
  }

  return (
    <>
      <div className="container-xl container-fluid">
        <div className="row">
          <div className="col-12 mt-4">
            <div className="mb-5">
              <Carousel slideData={CarouselData} id='carousel3' autoplay="carousel" />
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
              <div className="d-flex flex-wrap gap-1 gap-md-3" role="group" aria-label="Basic example">
                <button 
                  className="btn border btn-light rounded-pill px-3 fw-semibold text-nowrap"
                  data-bs-toggle="offcanvas" 
                  data-bs-target="#Filter" 
                  aria-controls="Filter"
                >
                  Filter <i className="ri-equalizer-2-line fw-lighter"></i>
                </button>
                <FilterOffcanvas mainTitle="Filter" />
                <button 
                  className="btn border btn-light rounded-pill px-3 fw-semibold text-nowrap"
                  data-bs-toggle="dropdown" 
                  data-bs-auto-close="outside" 
                  aria-expanded="false"
                >
                  Sort By <i className="ri-arrow-down-s-line fw-lighter"></i>
                </button>
                <ul className="dropdown-menu activeRedColor px-3" style={{minWidth:"180px"}}>
                  <div className="form-check mt-2">
                    <input className="form-check-input" type="radio" name="Sorting" id="Radio1" />
                    <label className="form-check-label" htmlFor="Radio1">
                      Relevance(Default)
                    </label>
                  </div>
                  <div className="form-check mt-2">
                    <input className="form-check-input" type="radio" name="Sorting" id="Radio2" />
                    <label className="form-check-label" htmlFor="Radio2">
                      Rating
                    </label>
                  </div>
                  <div className="form-check mt-2">
                    <input className="form-check-input" type="radio" name="Sorting" id="Radio3" />
                    <label className="form-check-label" htmlFor="Radio3">
                      Cost:LowtoHigh
                    </label>
                  </div>
                  <div className="form-check mt-2">
                    <input className="form-check-input" type="radio" name="Sorting" id="Radio4" />
                    <label className="form-check-label" htmlFor="Radio4">
                      Cost:HightoLow
                    </label>
                  </div>
                </ul>
                <div className="w-auto text-nowrap">
                  <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="btnradio1">
                    Veg
                    <svg width="14" className='ms-2' height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#199339" />
                      <circle cx="7" cy="7" r="3.5" fill="#199339" />
                    </svg>
                  </label>
                </div>
                <div className="w-auto text-nowrap">
                  <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="btnradio2">
                    Non-Veg
                    <svg width="14" className='ms-2' height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="13" height="13" fill="white" stroke="#EB3239" />
                      <path d="M7 3.5L10.7889 10.0625H3.21114L7 3.5Z" fill="#EB3239" />
                    </svg>
                  </label>
                </div>
                <div className="w-auto text-nowrap">
                  <input type="radio" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" />
                  <label className="btn btn-outline-light border rounded-pill text-dark" htmlFor="btnradio3">
                    Fast Delivery
                  </label>
                </div>
              </div>
            </div>
            
            <div className="card mb-4">
              <div className="row g-0">
                <div className="col-md-4">
                  <img 
                    src={mealMeta.image?.[0] ? `${process.env.REACT_APP_API_URL}${mealMeta.image[0]}` : FoodAndNurtImg1} 
                    className="img-fluid rounded-start h-100 object-fit-cover" 
                    alt={mealMeta.foodName} 
                  />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <h3 className="card-title">{mealMeta.foodName}</h3>
                    <p className="text-muted">{mealMeta.calorie} kcal</p>
                    <p className="card-text">{mealMeta.description}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <h4 className="mb-3">Meal Options</h4>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {mealItems.map((item) => (
                <div className="col" key={item._id}>
                  <div className="card h-100 cursor-pointer" onClick={() => handleItemClick(item)}>
                    <img 
                      src={item.image?.[0] ? `${process.env.REACT_APP_API_URL}${item.image[0]}` : FoodAndNurtImg2} 
                      className="card-img-top object-fit-cover" 
                      style={{height: "200px"}} 
                      alt={item.foodName} 
                    />
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{item.foodName}</h5>
                        <span className={`badge ${item.foodCategory === 'Veg' ? 'bg-success' : 'bg-danger'}`}>
                          {item.foodSubCategory}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-bold">Price:</span>
                        <span className="fw-bold">
                          ₹{item.amount}
                          {item.discountPercentage > 0 && (
                            <span className="text-success ms-2 fs-6">
                              ({item.discountPercentage}% off)
                            </span>
                          )}
                        </span>
                      </div>
                      <button 
                        className="btn btn-primary w-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        {selectedItem && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedItem.foodName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="col-md-6 mb-3 mb-md-0">
                  <img
                    src={selectedItem.image?.[0] ? `${process.env.REACT_APP_API_URL}${selectedItem.image[0]}` : FoodAndNurtImg3}
                    className="img-fluid rounded"
                    alt={selectedItem.foodName}
                  />
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
                    ₹{selectedItem.amount}
                    {selectedItem.discountPercentage > 0 && (
                      <span className="text-success ms-2 fs-6">
                        ({selectedItem.discountPercentage}% off)
                      </span>
                    )}
                  </h4>
                  <p className="text-muted mb-2">
                    {selectedItem.calorie} kcal | {selectedItem.foodType}
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
                  
                  {selectedItem.addons?.length > 0 && (
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
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                  Close
                </Button>
                <Button 
                  variant="primary" 
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