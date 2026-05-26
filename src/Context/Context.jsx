//Contex.jsx
import React, { createContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";

export const MyContext = createContext();
const URL = process.env.REACT_APP_API_URL;

const Context = ({ children }) => {
  const [dum, setDum] = useState(1);
  const [isFilled, setIsFilled] = useState(false);
  const [vendor, setVendor] = useState([]);
  const [test, setTest] = useState([]);
  const [vendorLists, setVendorLists] = useState([]);
  const [lengthD, setLengthD] = useState(0);
  const [searchData, setSearchData] = useState([]);
  const [doctor, setDoctor] = useState([]);
  const [pDoctor, setPDoctor] = useState("");
  const [coupon, setCoupon] = useState([]);
  const [searchTest, setSearchTest] = useState([]);
  const [packages, setPackages] = useState([]);
  const [blog, setBlog] = useState([]);
  const [blogLength, setBlogLength] = useState(0);
  const [blogSearch, setBlogSearch] = useState([]);
  const [foodstats, setFoodstats] = useState([]);
  const [categories, setCategories] = useState([]);
  
  
  
  const [message, setMessage] = useState(''); // add food category message

  const tokenS = JSON.parse(sessionStorage.getItem("admin"));
  
const getUserToken = () => {
  // First try localStorage
  let token = localStorage.getItem('token');
  
  // If not found in localStorage, try sessionStorage or cookies
  if (!token) {
    token = sessionStorage.getItem('token') || 
            document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  }

  if (!token) {
    console.warn('No authentication token found');
    return null;
  }

  // Basic token validation
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp < Date.now() / 1000) {
      console.warn('Token expired');
      localStorage.removeItem('token');
      return null;
    }
    return token;
  } catch (error) {
    console.error('Invalid token format:', error);
    localStorage.removeItem('token');
    return null;
  }
};
  
const getAdminToken = () => {
    try {
      const adminData = JSON.parse(sessionStorage.getItem("admin"));
      return adminData?.token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

const getAllVendorToken = useCallback(() => {
  const tokenNames = ['Pharmacytoken', 'foodtoken', 'labtoken'];

  // एक-एक करके टोकन के नाम खोजें
  for (const name of tokenNames) {
    try {
      const tokenData = sessionStorage.getItem(name);

      // जांचें कि टोकन डेटा मौजूद है और "null" स्ट्रिंग नहीं है
      if (tokenData && tokenData !== 'null') {
        const parsed = JSON.parse(tokenData);
        
        // यदि पार्सिंग सफल होती है और टोकन प्रॉपर्टी मौजूद है, तो तुरंत टोकन स्ट्रिंग लौटा दें
        if (parsed && parsed.token) {
          return parsed.token; // मिला पहला वैध टोकन लौटाएं
        }
      }
    } catch (err) {
      // चेतावनी लॉग करें लेकिन अगले टोकन पर आगे बढ़ें
      console.warn(`चेतावनी: '${name}' टोकन को संसाधित नहीं किया जा सका।`, err.message);
    }
  }

  // यदि लूप किसी भी टोकन को खोजे बिना समाप्त हो जाता है, तो त्रुटि फेंकें।
  // यह कोड तभी चलेगा जब कोई भी टोकन नहीं मिलेगा।
  throw new Error("कोई भी वेंडर टोकन नहीं मिला। कृपया दोबारा लॉग इन करें।");
}, []);


// Process Refund (Admin)
const processRefundAdmin = async (orderId, orderType, manualTransactionId, refundMode) => {
  try {
    setLoading(true);
    const adminToken = getAdminToken(); // Assuming a function to get Admin token
    if (!adminToken) throw new Error("Admin token not found");

    const payload = {
        orderId,
        orderType,
        // ✅ NEW: Include these parameters for the backend to validate and save
        manualTransactionId, 
        refundMode
    };

    // Replace your existing axios call for process-refund
    const { data } = await axios.post(`${URL}/razorpay/payment/process-refund`, 
      payload,
      {
        headers: { 
          token: adminToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (data?.success) {
      return data;
    } else {
      throw new Error(data?.message || "Failed to process refund");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred.";
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};




  //get all food category
  const [foodCategory, setFoodCategory] = useState([]);

  
  const getFoodCategory = async () => {
    try {
      const res = await axios.get(`${URL}/food/getCategory`);
      if (res.data.success === 1) {
        setFoodCategory(res.data.data);

      } else {
        console.warn("⚠️ API failed:", res.data.message);
      }
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
    }
  };

// user food foodname / craving details
const [cravingMealDetails, setCravingMealDetails] = useState([]);

const getCravingMealByFoodName = async (foodName) => {
  try {
    const Token = localStorage.getItem("token"); // ✅ no JSON.parse here

    const { data } = await axios.get(
      `${URL}/craving/foodname`,
      {
        params: { food: foodName },
        headers: { token: Token }
      }
    );

    if (data.success) {
      setCravingMealDetails(data.details);
    } else {
      setCravingMealDetails([]);
    }
  } catch (error) {
    console.error("Error fetching craving meal by food name:", error);
    setCravingMealDetails([]);
  }
};

  //user foodandnutrition api getmeals
const [mealItems, setMealItems] = useState([]);
const [mealLoading, setMealLoading] = useState(false);
const [mealError, setMealError] = useState(null);
const [mealMeta, setMealMeta] = useState(null);

const getMealDetails = async (mealId) => {
setMealLoading(true);
setMealError(null);
try {
  const Token = localStorage.getItem("token"); // ✅ use same method as in getCravingMealByFoodName

  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/craving/getMeal`,
    {
      params: { id: mealId },
      headers: { token: Token }, // ✅ sending token in headers
    }
  );

  console.log("Meal Response from Context:", response.data);

  if (response.data.success) {
    setMealItems(response.data.items);
    setMealMeta(response.data.items[0]); // optional: first meal metadata
  } else {
    setMealError("Failed to fetch meal items");
  }
} catch (err) {
  setMealError("Error fetching meal details");
  console.error("Context API Error:", err);
} finally {
  setMealLoading(false);
}
};

const addExtraItemsToCraving = async (foodItemId, extraItemsData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/craving/addExtraItems/${foodItemId}`,
      extraItemsData,
      { 
        headers: { 
          'Content-Type': 'application/json',
          'token': token 
        } 
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error adding extra items:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

const getCartData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/craving/getcart`,
      { headers: { token } }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching cart data:', error);
    throw error;
  }
};

// for cart button only
 const [cartData1, setCartData1] = useState(null);
  const getCartData1 = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/craving/getcart`,
        { headers: { token } }
      );

      setCartData1(response.data); // यहाँ पूरा cart data store कर रहे हैं
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

// In your Context provider
const removeCartItem = async (foodItemId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/food-Order/deleteCartItem`,
      { id: foodItemId },
      { headers: { token } }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};
const addToCartCraving = async (foodItemId, payload = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    // Complete payload with all required fields
    const completePayload = {
      quantity: payload.quantity || 1, // Default to 1 if not specified
      request: payload.request || undefined, // Send undefined if empty
      vendorId: payload.vendorId || undefined, // Required field
      // Include any other fields your API expects
      ...payload // Spread any additional properties
    };

    // Remove undefined values to avoid sending empty fields
    const cleanPayload = Object.fromEntries(
      Object.entries(completePayload).filter(([_, value]) => value !== undefined)
    );

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/craving/cartfood/${foodItemId}`,
      cleanPayload,
      { 
        headers: { 
          token,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error in addToCartCraving:', error.response?.data || error.message);
    throw error;
  }
};
// In your Context API file
const updateCartQuantity = async (foodItemId, newQuantity) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/craving/updateQuantity`,
      { foodItemId, quantity: newQuantity },
      { 
        headers: { 
          token,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update quantity");
    }

    return response.data;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
};
const decreaseCartItem = async (foodItemId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.patch(
      `${process.env.REACT_APP_API_URL}/craving/remove`,
      { foodItemId },
      { headers: { token } }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error decreasing cart item quantity:', error);
    throw error;
  }
};

// In your Context.js file
const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/patient/fetch`,
        { headers: { token } }
      );
      
      if (response.data.success === 1) {
        return response.data.details;
      }
      throw new Error(response.data.message || 'Failed to fetch addresses');
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
};

const addNewAddress = async (addressData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    // Don't set Content-Type header manually - axios will set it automatically for FormData
    const config = {
      headers: {
        token: token
      }
    };

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/patient/new`,
      addressData,
      config
    );
    
    if (response.data.success === 1) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to add address');
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

const updateAddress = async (addressId, addressData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    // Don't set Content-Type header manually - axios will set it automatically for FormData
    const config = {
      headers: {
        token: token
      }
    };

    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/patient/update/${addressId}`,
      addressData,
      config
    );
    
    if (response.data.success === 1) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to update address');
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

const deleteAddress = async (addressId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/patient/delete/${addressId}`,
      { headers: { token } }
    );
    
    if (response.data.success === 1) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to delete address');
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};
const getAvailableSlots = async (data) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    // Convert date format from YYYY-MM-DD to DD/MM/YYYY
    const formattedDate = moment(data.startDate, 'YYYY-MM-DD').format('DD/MM/YYYY');
    
    console.log("Requesting slots with payload:", {
      startDate: formattedDate,
      vendorId: data.vendorId
    });

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/food-Order/avail`,
      {
        startDate: formattedDate,
        vendorId: data.vendorId
      },
      {
        headers: { 
          token,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Slots API Response:", response.data);

    if (response.data.success === 1) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch slots');
  } catch (error) {
    console.error("Detailed API Error:", {
      message: error.message,
      request: error.config?.data,
      response: {
        status: error.response?.status,
        data: error.response?.data
      }
    });
    
    // Throw a more informative error
    const errorMessage = error.response?.data?.message || 
                       error.message || 
                       'Failed to fetch available slots';
    throw new Error(errorMessage);
  }
};

const [coupons, setCoupons] = useState([]);
const [couponLoading, setCouponLoading] = useState(false);
const [couponError, setCouponError] = useState(null);

const getCoupons = async (vendorId) => {
  try {
    console.log("getCoupons called with vendorId:", vendorId);
    
    // Enhanced validation
    if (!vendorId || typeof vendorId !== 'string' || vendorId.trim() === '') {
      console.error("Invalid vendorId in getCoupons:", vendorId);
      throw new Error("Valid vendor ID is required");
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found");
      throw new Error('Authentication required');
    }
    
    const trimmedVendorId = vendorId.trim();
    console.log("Fetching coupons for vendor (trimmed):", trimmedVendorId);
    
    // Updated API call with proper parameter name
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/user-coupons/get-coupon`,
      {
        params: { 
          id: trimmedVendorId // Changed from vendorId to id to match backend
        },
        headers: { token }
      }
    );

    console.log("Coupons API Response:", response.data);

    if (response.data.success !== 1) {
      throw new Error(response.data.message || "Failed to fetch coupons");
    }

    return {
      success: 1,
      message: "Coupons fetched successfully",
      data: response.data.data || []
    };
    
  } catch (error) {
    console.error("Full error in getCoupons:", {
      message: error.message,
      vendorId: vendorId,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    throw error;
  }
};

const [orderLoading, setOrderLoading] = useState(false);
const [orderError, setOrderError] = useState(null);

const bookOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    setOrderLoading(true);
    setOrderError(null);

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/food-Order/order`,
      orderData,
      {
        headers: { 
          token,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success !== 1) {
      throw new Error(response.data.message || "Failed to place order");
    }

    return {
      success: 1,
      message: "Order placed successfully",
      data: response.data.order
    };
    
  } catch (error) {
    console.error("Error placing order:", error);
    setOrderError(error.response?.data?.message || error.message);
    
    return {
      success: 0,
      message: error.response?.data?.message || error.message
    };
  } finally {
    setOrderLoading(false);
  }
};

// In your Context/Context.js
const getOrder = async (page = 1, limit = 5, orderId = null) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    setOrderLoading(true);
    setOrderError(null);

    let url = `${process.env.REACT_APP_API_URL}/food-Order/getOrder`;
    let params = {};
    let response;

    if (orderId) {
      // Fetch specific order by ID
      url = `${url}/${orderId}`;
      response = await axios.get(url, {
        headers: { 
          token,
          'Content-Type': 'application/json'
        }
      });

      // Handle case where order details might be in different response structure
      const orderDetails = response.data.details || response.data.order || response.data;
      
      return {
        success: 1,
        message: "Order fetched successfully",
        details: orderDetails ? [orderDetails] : []
      };
    } else {
      // Fetch paginated orders
      params = { page, limit };
      response = await axios.get(url, {
        params,
        headers: { 
          token,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: 1,
        message: "Orders fetched successfully",
        details: response.data.details || []
      };
    }
    
  } catch (error) {
    console.error("Error fetching orders:", error);
    setOrderError(error.response?.data?.message || error.message);
    
    return {
      success: 0,
      message: error.response?.data?.message || error.message,
      details: []
    };
  } finally {
    setOrderLoading(false);
  }
};
// Context mein yeh add karo
const getOrderById = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    setOrderLoading(true);
    setOrderError(null);

    // Try multiple endpoints
    const endpoints = [
  
      `${process.env.REACT_APP_API_URL}/food-Order/getOrder/${orderId}`,
     
    ];

    let response;
    let lastError;

    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        response = await axios.get(endpoint, {
          headers: { 
            token,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response from', endpoint, ':', response.data);

        // Check if response is successful
        if (response.data.success === 1 || response.data.order) {
          const orderData = response.data.order || response.data.details || response.data.data || response.data;
          
          return {
            success: 1,
            message: response.data.message || "Order fetched successfully",
            order: orderData,
            details: Array.isArray(orderData) ? orderData : [orderData]
          };
        }
      } catch (error) {
        console.log('Endpoint failed:', endpoint, error.response?.data || error.message);
        lastError = error;
        continue;
      }
    }

    // If all endpoints failed, try to get from orders list as fallback
    console.log('All endpoints failed, trying to fetch from orders list...');
    const ordersResult = await getOrder(1, 100);
    if (ordersResult.success === 1 && ordersResult.details) {
      const foundOrder = ordersResult.details.find(order => order._id === orderId);
      if (foundOrder) {
        return {
          success: 1,
          message: "Order found in orders list",
          order: foundOrder,
          details: [foundOrder]
        };
      }
    }

    throw new Error(lastError?.response?.data?.message || lastError?.message || 'Order not found');

  } catch (error) {
    console.error("Error fetching order by ID:", error);
    setOrderError(error.message);
    
    return {
      success: 0,
      message: error.message,
      order: null,
      details: []
    };
  } finally {
    setOrderLoading(false);
  }
};

const [Mealcategory, setMealcategory] = useState([]);
const yourmind = async () => {
  try {
    const res = await axios.get(`${URL}/admin-food/getmeal`);
    console.log("API full response:", res);  // Log the entire response to check its structure
    console.log("API response data:", res.data);  // Log just the 'data' part
    console.log("API response details:", res.data.details);  // Log 'details' which contains the actual data
    
    if (res.data.success === 1) {
      if (res.data.details && Array.isArray(res.data.details)) {
        console.log("Meal data found:", res.data.details);
        setMealcategory(res.data.details);  // Use 'details' instead of 'data'
      } else {
        console.warn("Unexpected data structure, 'details' is not an array or missing:", res.data.details);
        setMealcategory([]);  // Fallback to empty array
      }
    } else {
      console.warn("API Error:", res.data.message);
      setMealcategory([]);  // Fallback to empty array if API success flag is not 1
    }
  } catch (error) {
    console.log("Error fetching API:", error);
    setMealcategory([]);  // Fallback in case of error
  }
};

const [Discount,setDiscount] = useState([]);

const getdiscountfood = async () => {
  try {
    const userToken = getUserToken();

    if (!userToken) {
      console.error("Token is missing or null.");
      return;
    }

    const { data } = await axios.get(`${URL}/food-Order/getdiscountorder`, {
      headers: {
        token: userToken,  // ✅ use the string directly
      },
    });

    if (data && data.success === 1) {
      setDiscount(data.details);
    } else {
      console.log("No discount items found.");
    }
  } catch (error) {
    console.error("Error fetching discount food:", error);
  }
};

const [kitchen , setKitchen] = useState([]);

const getTopKitchen = async (userLocation = null, searchQuery = "") => {
  try {
    setLoading(true);
    const userToken = getUserToken();
   
    // 1. Prepare Payload (Location + Search)
    const payload = {
      latitude: userLocation?.latitude || "",
      longitude: userLocation?.longitude || "",
      search: searchQuery // ✅ Added Search Parameter
    };
 
    console.log('🚀 Fetching Kitchens with payload:', payload);
 
    // 2. POST Request
    const { data } = await axios.post(`${URL}/topKitchen/kitchen`, payload, {
      headers: {
        token: userToken,
        'Content-Type': 'application/json'
      },
    });
 
    if (data?.success === 1) {
      // ✅ Map 'details' from API response
      const fetchedVendors = data.details || [];
     
      // Optional: If API returns a distance limit, update context
      if (data.distanceLimit) {
        // setDistanceLimit logic if you have a setter for it
      }
 
      setKitchen(fetchedVendors);
    } else {
      // If search returns nothing, set empty array
      if (data?.message?.includes("No")) {
          setKitchen([]);
      }
      console.log("⚠️ API Message:", data?.message);
    }
  } catch (error) {
    console.error("❌ Error fetching top kitchen:", error);
    setKitchen([]);
  } finally {
    setLoading(false);
  }
};
 

// 1. Get Kitchen by Category (categoryKitchen)
const getKitchenByCategory = async (foodName, page = 1, limit = 5) => {
  try {
    const userToken = getUserToken();
    const { data } = await axios.get(`${URL}/topKitchen/catekitchen`, {
      params: { foodName, page, limit },
      headers: {
        token: userToken,
      },
    });

    console.log(`Kitchen by category (${foodName}) API response`, data);

    if (data?.success === 1 && Array.isArray(data.details)) {
      // You would typically update a state here, e.g., setCategoryKitchenData(data.details);
      return data.details;
    } else {
      console.log(`No kitchen data found for category: ${foodName}.`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching kitchen by category (${foodName}):`, error);
    throw error; // Re-throw to handle in UI
  }
};

// 2. Get Particular Kitchen's Food (particularfood)
const [particularFoodItems, setParticularFoodItems] = useState([]);

const getParticularKitchenFood = async (vendorId, page = 1, limit = 5, foodCategory = '') => {
  try {
    const userToken = getUserToken();
    const params = { page, limit };
    if (foodCategory) {
      params.foodCategory = foodCategory;
    }
    const { data } = await axios.get(`${URL}/topKitchen/particular/${vendorId}`, {
      params,
      headers: {
        token: userToken,
      },
    });

    console.log(`Particular kitchen food (${vendorId}) API response`, data);

    if (data?.success === 1 && Array.isArray(data.details)) {
      setParticularFoodItems(data.details); // Make sure this line exists
      return data.details;
    } else {
      console.log(`No food data found for vendor ID: ${vendorId}.`);
      setParticularFoodItems([]); // Set empty array if no data
      return [];
    }
  } catch (error) {
    console.error(`Error fetching particular kitchen food for vendor ID (${vendorId}):`, error);
    setParticularFoodItems([]); // Set empty array on error
    throw error;
  }
};

// 3. Search Food (searchfood)
const searchFood1 = async (q, vendorId, foodCategory = '', page = 1, limit = 5) => {
  try {
    const userToken = getUserToken();
    const params = { q, vendorId, page, limit };
    if (foodCategory) {
      params.foodCategory = foodCategory;
    }
    const { data } = await axios.get(`${URL}/topKitchen/search`, {
      params,
      headers: {
        token: userToken,
      },
    });

    console.log(`Search food API response (query: ${q}, vendor: ${vendorId}, category: ${foodCategory})`, data);

    if (data?.success === 1 && Array.isArray(data.details)) {
      // You would typically update a state here, e.g., setSearchResults(data.details);
      return {
        totalCount: data.totalCount,
        details: data.details
      };
    } else {
      console.log("No search results found.");
      return { totalCount: 0, details: [] };
    }
  } catch (error) {
    console.error("Error searching food:", error);
    throw error;
  }
};

// 4. Food Menu (foodMenu)
const getFoodMenu = async (vendorId) => {
  try {
    const userToken = getUserToken();
    const { data } = await axios.get(`${URL}/topKitchen/menu/${vendorId}`, {
      headers: {
        token: userToken,
      },
    });

    console.log(`Food menu API response for vendor ID (${vendorId})`, data);

    if (data?.success === 1 && Array.isArray(data.details)) {
      // You would typically update a state here, e.g., setFoodMenu(data.details);
      return data.details;
    } else {
      console.log(`No food menu found for vendor ID: ${vendorId}.`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching food menu for vendor ID (${vendorId}):`, error);
    throw error;
  }
};


///////////////// blog user /////////////////////////////////////////////////////////////////////////////////////////////////////
// ------------ GET Blogs --------------
const [blogs, setBlogs] = useState([]);
  const [initialBlogs, setInitialBlogs] = useState([]); // To store all blogs for reset purposes
  const TAB_TYPES = [
    "Doctor Tips",
    "Mind & Body",
    "Monitoring",
    "Food Lab",
    "Recipes",
    "Food & Nutrition",
  ];
 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState(""); // Represents the currently active tab type, '' for 'All'
 
  const getAuthToken = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Authentication token not found.");
            setLoading(false); // Ensure loading is false if token is missing
        }
        return token;
    };
 
    // Fetches all blogs initially
    const getBlogs = async () => {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) return; // Exit if no token
 
        try {
            const res = await axios.get(`${URL}/blogs`, {
                headers: { token: token },
            });
            console.log("Fetched blogs:", res.data);
            // Store fetched blogs in both initialBlogs and blogs state
            setInitialBlogs(res.data.details || []);
            setBlogs(res.data.details || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch blogs");
            console.error("Error fetching initial blogs:", err);
        } finally {
            setLoading(false);
        }
    };
 
    // Filters blogs based on the selected type
    const filterBlogsByType = async (type) => {
        setSelectedTab(type);
        setSearchTerm(''); // Clear search term when filtering by tab
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) return;
 
        try {
            const res = await axios.get(`${URL}/blogs/filterblog?type=${type}`, {
                params: { type: type }, // Pass type as a query parameter
                headers: { token: token },
            });
            setBlogs(res.data.details || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to filter blogs");
            console.error("Error filtering blogs:", err);
        } finally {
            setLoading(false);
        }
    };
 
    // Searches blogs based on a query string
    const searchBlogs = async (query) => {
        setSearchTerm(query);
        setSelectedTab(''); // Clear tab selection when searching
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) return;
 
        try {
            const res = await axios.get(`${URL}/blogs/user-blog`, {
                params: { q: query }, // Pass query as a 'q' parameter
                headers: { token: token },
            });
            setBlogs(res.data.details || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to search blogs");
            console.error("Error searching blogs:", err);
        } finally {
            setLoading(false);
        }
    };
 
    // Resets filters to show all blogs (clears search and tab filters)
    const resetToAllBlogs = () => {
        setSearchTerm('');
        setSelectedTab('');
        setBlogs(initialBlogs); // Reset to the originally fetched list
    };
 
  // ------------ GET Blogs END -----------


///////////////// pharmacy user /////////////////////////////////////////////////////////////////////////////////////////////////////
const [pharmacyShops, setPharmacyShops] = useState([]);
const [hasMorePharmacies, setHasMore] = useState(true); 

const fetchPharmacyShops = async (page = 1, location = null, search = "") => {
  try {
    setLoading(true);
    const token = getUserToken(); // Ensure you have this function to get token
 
    // Build Payload for POST
    const payload = {
      page: page,
      search: search, // Added search parameter
      latitude: location?.latitude || "",
      longitude: location?.longitude || ""
    };
 
    console.log("💊 Fetching Pharmacies Payload:", payload);
 
    // Changed to POST request
    const { data } = await axios.post(`${URL}/shops/get`, payload, {
      headers: {
        token: token,
        'Content-Type': 'application/json'
      }
    });
 
    if (data?.success === 1) {
      const validShops = Array.isArray(data.details) ?
        data.details.filter(shop => shop?._id) : [];
     
      // If it's page 1, replace data. If > 1, append data.
      setPharmacyShops(prev => page === 1 ? validShops : [...prev, ...validShops]);
      setHasMore(validShops.length > 0);
 
      // Save distance limit if provided by API (optional based on your API)
      if (data.distanceLimit) {
        setDistanceLimit(prev => ({ ...prev, pharmacyLimit: data.distanceLimit }));
      }
     
    } else {
       // Only clear if it's a search that returned nothing, otherwise keep old data or show error
       if(page === 1 && data?.message === "No pharmacies found") {
           setPharmacyShops([]);
       }
       // Optional: Log error but don't break UI
       console.log("Pharmacy fetch message:", data?.message);
    }
  } catch (error) {
    console.error("API Call Failed:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
 
const [products1, setProducts1] = useState([]);
const [medicines1, setMedicines1] = useState([]);
const [popularProducts1, setPopularProducts1] = useState([]);
const [popularMedicines1, setPopularMedicines1] = useState([]);
const [cartItems1, setCartItems1] = useState([]);
const [vendors, setVendors] = useState([]);
const [selectedProduct, setSelectedProduct] = useState(null);
const [selectedMedicine, setSelectedMedicine] = useState(null);
const [orderHistory, setOrderHistory] = useState([]);
const [trackedOrder, setTrackedOrder] = useState(null);
const [vendorAvailability, setVendorAvailability] = useState([]);

const getUserId = () => {
  const userId = localStorage.getItem('userId');
  console.log('Retrieved user ID:', userId);
  return userId;
};

// Fetch all pharmacy products
const fetchProducts = async () => {
  try {

    setLoading(true);
    const token = getUserToken();
    const { data } = await axios.get(`${URL}/shops/getProducts`, {
      headers: { token }
    });
    
    if (data?.success === 1) {

      setProducts1(data.data || []);
    } else {
      throw new Error(data?.message || "Failed to fetch products");
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// Fetch all medicines
const fetchMedicines = async () => {
  try {
    // console.log('Fetching medicines...');
    setLoading(true);
    const token = getUserToken();
    const { data } = await axios.get(`${URL}/shops/medicine/getMedicines`, {
      headers: { token }
    });
    
    // console.log('Medicines API response:', data);
    
    if (data?.success === 1) {
      setMedicines1(data.data || []);
    } else {
      throw new Error(data?.message || "Failed to fetch medicines");
    }
  } catch (error) {
    console.error('Error fetching medicines:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// Fetch popular products
const fetchPopularProducts = useCallback(async () => {
  try {
    // console.log('Fetching popular products...');
    setLoading(true);
    const token = getUserToken();
    const { data } = await axios.get(`${URL}/shops/popularProducts`, {
      headers: { token }
    });

    // console.log('Popular Products API Response:', data);
    
    if (data?.success === 1) {
      setPopularProducts1(data.data || []);
    } else {
      throw new Error(data?.message || "Failed to fetch popular products");
    }
  } catch (error) {
    console.error('Error fetching popular products:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
}, []);

// Fetch popular medicines
const fetchPopularMedicines = useCallback(async () => {
  try {
    setLoading(true);
    const token = getUserToken();
    const { data } = await axios.get(`${URL}/shops/medicine/popularMedicines`, {
      headers: { token }
    });
    
    // console.log('Popular Medicines API response:', data);
    
    if (data?.success === 1) {
      setPopularMedicines1(data.data || []);
    } else {
      throw new Error(data?.message || "Failed to fetch popular medicines");
    }
  } catch (error) {
    console.error('Error fetching popular medicines:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
}, []);

// Fetch cart items
const fetchCartItems = useCallback(async () => {
  try {

    setLoading(true);
    setError(null);

    const token = getUserToken();
    const userId = getUserId();

    if (!token || !userId) {

      setCartItems1([]);
      setError('Please log in to view your cart.');
      return;
    }

    const { data } = await axios.get(`${URL}/shops/getCart`, {
      params: { userId },
      headers: { token }
    });

    if (data?.success === 1) {
      setCartItems1(data.data || []);
    } else {
      throw new Error(data?.message || "Failed to fetch cart items");
    }
  } catch (error) {
    console.error('Fetch error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    setCartItems1([]);
    setError(error.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
}, []);
 // Empty dependency array for stable reference

// Fetch vendors by product - Updated to send user location
const fetchVendorsByProduct = async (productId, userLocation = null) => {
  try {
    // console.log(`Fetching vendors for product ${productId}...`, userLocation ? 'with location' : 'without location');
    const token = getUserToken();
    
    // Build query params
    const params = { productId };
    
    // Add user location if available
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      params.userLat = userLocation.latitude;
      params.userLng = userLocation.longitude;
    }

    const { data } = await axios.get(`${URL}/shops/getVendorDetails`, {
      params,
      headers: { token }
    });
    
    
    if (data?.success === 1) {
      console.log(`Found ${data.vendors?.length || 0} vendors for product`);
      return data.vendors || [];
    }
    throw new Error(data?.message || "Failed to fetch vendors");
  } catch (error) {
    console.error('Error fetching vendors by product:', error);
    throw error;
  }
};

// Fetch vendors by medicine - Updated to send user location
const fetchVendorsByMedicine = async (medicineId, userLocation = null) => {
  try {
    const token = getUserToken();
    
    // Build query params
    const params = { medicineId };
    
    // Add user location if available
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      params.userLat = userLocation.latitude;
      params.userLng = userLocation.longitude;
    }

    const { data } = await axios.get(`${URL}/shops/medicine/getVendorDetails`, {
      params,
      headers: { token }
    });
    
    
    if (data?.success === 1) {
      console.log(`Found ${data.vendors?.length || 0} vendors for medicine`);
      return data.vendors || [];
    }
    throw new Error(data?.message || "Failed to fetch vendors");
  } catch (error) {
    console.error('Error fetching vendors by medicine:', error);
    throw error;
  }
};

// Add to cart
const addToCart = async (vendorId, productId, quantity, isMedicine = false) => {
  try {
    const token = getUserToken();
    const userId = getUserId();

    // First check for vendor conflict
    const conflictCheck = await axios.post(`${URL}/shops/checkCartVendor`, {
      userId,
      vendorId
    }, { headers: { token } });

    if (conflictCheck.data.success === 0) {
      const shouldProceed = window.confirm(
        "Your cart contains items from another vendor. Do you want to replace them?"
      );
      if (!shouldProceed) {
        return { success: false, message: "Cancelled by user" };
      }
      // Clear existing cart if user confirms
      await axios.delete(`${URL}/shops/clearCart`, {
        params: { userId },
        headers: { token }
      });
    }

    // Add new item to cart
    const { data } = await axios.post(`${URL}/shops/addToCart`, {
      vendorId,
      productId,
      quantity,
      userId,
      isMedicine
    }, { headers: { token } });

    if (data?.success === 1) {
      await fetchCartItems(); // Refresh cart items
      return { success: true, message: data.message };
    } else {
      throw new Error(data?.message || "Failed to add to cart");
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    setError(error.message);
    return { success: false, message: error.message };
  }
};

// Update cart quantity
const updateCartQuantity1 = async (cartItemId, action) => {
  try {
    console.log(`Updating cart quantity - item: ${cartItemId}, action: ${action}`);
    setLoading(true);
    const token = getUserToken();
    const userId = getUserId();
    
    const { data } = await axios.patch(`${URL}/shops/updateCartQuantity`, {
      cartItemId,
      action,
      userId
    }, { headers: { token } });

    console.log('Update cart quantity API response:', data);
    
    if (data?.success === 1) {
      console.log('Quantity updated, refreshing cart...');
      await fetchCartItems();
      return { success: true, message: data.message };
    } else {
      throw new Error(data?.message || "Failed to update quantity");
    }
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    setError(error.message);
    return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
};

// Remove cart item
const removeCartItem1 = async (cartId) => {
  try {
    console.log(`Removing cart item ${cartId}...`);
    setLoading(true);
    const token = getUserToken();
    const { data } = await axios.delete(`${URL}/shops/removeCart`, {
      params: { cartId },
      headers: { token }
    });

    console.log('Remove cart item API response:', data);
    
    if (data?.success === 1) {
      console.log('Item removed, refreshing cart...');
      await fetchCartItems();
      return { success: true, message: data.message };
    } else {
      throw new Error(data?.message || "Failed to remove item");
    }
  } catch (error) {
    console.error('Error removing cart item:', error);
    setError(error.message);
    return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
};

// Checkout
// In your context file, update the checkout function
const checkout = async (payload) => {
  try {
    setLoading(true);
    const token = getUserToken();
    const userId = getUserId();
    
    // Get user's current location
    let userLocation = null;
    try {
      userLocation = await getCurrentLocation();
    } catch (locationError) {
      console.warn('Could not get user location:', locationError);
      // You might want to handle this differently - maybe ask user to enter location manually
    }
    
    const { data } = await axios.post(`${URL}/shops/checkout`, {
      userId,
      userLocation, // Add user location to payload
      ...payload
    }, { headers: { token } });

    if (data?.success === 1) {
      return { 
        success: true, 
        data: data.orderSummary,
        appliedCoupon: data.appliedCoupon
      };
    } else {
      throw new Error(data?.message || "Failed to process checkout");
    }
  } catch (error) {
    console.error('Checkout error:', error);
    setError(error.message);
    return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
};

// Add location utility function
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

// Confirm order
const confirmOrder = async (orderData) => {
  try {
    console.log('Confirming order with data:', orderData);
    setLoading(true);
    const token = getUserToken();
    const userId = getUserId();
    
    const { data } = await axios.post(`${URL}/shops/confirmOrder`, {
      userId,
      ...orderData
    }, { headers: { token } });

    console.log('Confirm order API response:', data);
    
    if (data?.success === 1) {
      console.log('Order confirmed successfully, refreshing cart...');
      await fetchCartItems();
      return { success: true, data: data };
    } else {
      throw new Error(data?.message || "Failed to confirm order");
    }
  } catch (error) {
    console.error('Error confirming order:', error);
    setError(error.message);
    return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
};

// Fetch order history
const fetchOrderHistory = async () => {
  try {
    console.log('Fetching order history...');
    const token = getUserToken();
    const userId = getUserId();
    
    if (!token) {
      console.error('No token found');
      throw new Error('Please login to view order history');
    }

    if (!userId) {
      console.error('No user ID found');
      throw new Error('User information not found');
    }

    console.log('Making API request with:', { userId, token: token ? 'exists' : 'missing' });
    
    const response = await axios.get(`${URL}/shops/order-history`, {
      params: { 
        userId: userId.toString()
      },
      headers: { 
        token: token
      }
    });

    console.log('Order history API response:', response);
    console.log('Response data:', response.data);
    
    if (response.data?.success === 1) {
      const orders = response.data.data || [];
      console.log(`User has ${orders.length} orders in history`);
      return orders;
    } else {
      console.error('API returned success 0:', response.data);
      throw new Error(response.data?.message || "Failed to fetch order history");
    }
  } catch (error) {
    console.error('Error in fetchOrderHistory:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    throw new Error(error.response?.data?.message || error.message || "Failed to load order history");
  }
};

// Track order
// In your Context provider file
const trackOrder = useCallback(async (orderId) => {
  try {
    console.log(`Tracking order ${orderId}...`);
    setLoading(true);
    const token = getUserToken();
    
    const { data } = await axios.get(`${URL}/shops/track-order`, {
      params: { orderId },
      headers: { token }
    });

    if (data?.success === 1) {
      return { success: true, data: data.data };
    } else {
      throw new Error(data?.message || "Failed to track order");
    }
  } catch (error) {
    console.error('Error tracking order:', error);
    return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
}, []); // Add any dependencies this function needs

// Fetch vendor products (products from the same vendor as items in user's cart)
const fetchVendorProducts = useCallback(async () => {
  try {
    console.log('Fetching vendor products...');
    setLoading(true);
    const token = getUserToken();
    const userId = getUserId();
    
    const { data } = await axios.get(`${URL}/shops/vendor/products`, {
      params: { userId },
      headers: { token }
    });

    console.log('Vendor products API response:', data);
    
    if (data?.success === 1) {
      console.log(`Found ${data.data?.length || 0} vendor products`);
      return { 
        success: true, 
        data: data.data || [],
        vendorId: data.vendorId 
      };
    } else {
      throw new Error(data?.message || "Failed to fetch vendor products");
    }
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    setError(error.message);
    return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
}, []);

// Fetch vendor medicines (medicines from the same vendor as items in user's cart)
const fetchVendorMedicines = useCallback(async () => {
  try {
    console.log('Fetching vendor medicines...');
    setLoading(true);
    const token = getUserToken();
    const userId = getUserId();
    
    const { data } = await axios.get(`${URL}/shops/vendor/medicines`, {
      params: { userId },
      headers: { token }
    });

    console.log('Vendor medicines API response:', data);
    
    if (data?.success === 1) {
      console.log(`Found ${data.data?.length || 0} vendor medicines`);
      return { 
        success: true, 
        data: data.data || [],
        vendorId: data.vendorId 
      };
    } else {
      throw new Error(data?.message || "Failed to fetch vendor medicines");
    }
  } catch (error) {
    console.error('Error fetching vendor medicines:', error);
    setError(error.message);
    return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
}, []);


// Fetch vendor availability
// In your Context.jsx or wherever you're managing the state:

const [fetchedVendors, setFetchedVendors] = useState(new Set());

const fetchVendorAvailability = useCallback(async (vendorId) => {
  try {
    // Skip if we've already fetched this vendor's availability
    if (fetchedVendors.has(vendorId)) return;
    
    setLoading(true);
    const token = getUserToken();
    
    const { data } = await axios.get(`${URL}/shops/getVendorAvailability`, {
      params: { vendorId },
      headers: { token }
    });

    
    if (data?.success === 1) {
      console.log('Vendor availability details:', data.details);
      setVendorAvailability(prev => [...prev, ...data.details]);
      setFetchedVendors(prev => new Set(prev).add(vendorId));
    } else {
      // Even if no slots found, mark as fetched to prevent re-fetching
      setFetchedVendors(prev => new Set(prev).add(vendorId));
    }
  } catch (error) {
    console.error('Error fetching vendor availability:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
}, [getUserToken, fetchedVendors]);




/////////////////////// admin panel start /////////////////////////////////


  // ✅ ADMIN CANCELLATION APIs

  // 1. Get cancellation settings (Admin)
  const getCancellationSettings = async () => {
    try {
      setLoading(true);
      const adminToken = getAdminToken();
      if (!adminToken) throw new Error("Admin token not found");

      const { data } = await axios.get(`${URL}/admin-cancel-charge/cancellation-settings`, {
        headers: { token: adminToken }
      });

      if (data?.success) {
        return data.data;
      } else {
        throw new Error(data?.message || "Failed to fetch cancellation settings");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 2. Update cancellation settings (Admin)
  const updateCancellationSettings = async (settings) => {
    try {
      setLoading(true);
      const adminToken = getAdminToken();
      if (!adminToken) throw new Error("Admin token not found");

      const { data } = await axios.put(`${URL}/admin-cancel-charge/cancellation-settings`, settings, {
        headers: { 
          token: adminToken,
          'Content-Type': 'application/json'
        }
      });

      if (data?.success) {
        return data.data;
      } else {
        throw new Error(data?.message || "Failed to update cancellation settings");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 3. Calculate cancellation charge (Admin)
  const calculateCancellationCharge = async (orderId, orderType) => {
    try {
      setLoading(true);
      const adminToken = getAdminToken();
      if (!adminToken) throw new Error("Admin token not found");

      const { data } = await axios.post(`${URL}/admin-cancel-charge/calculate-cancellation-charge`, 
        { orderId, orderType },
        {
          headers: { 
            token: adminToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (data?.success) {
        return data.data;
      } else {
        throw new Error(data?.message || "Failed to calculate cancellation charge");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 4. Cancel order (Admin)
  const cancelOrderAdmin = async (orderId, orderType, cancellationReason) => {
    try {
      setLoading(true);
      const adminToken = getAdminToken();
      if (!adminToken) throw new Error("Admin token not found");

      const { data } = await axios.post(`${URL}/admin-cancel-charge/cancel-order`, 
        { orderId, orderType, cancellationReason },
        {
          headers: { 
            token: adminToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (data?.success) {
        return data.data;
      } else {
        throw new Error(data?.message || "Failed to cancel order");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 5. Get all cancelled orders (Admin)
  const getCancelledOrdersAdmin = async (page = 1, limit = 10, orderType = null) => {
    try {
      setLoading(true);
      const adminToken = getAdminToken();
      if (!adminToken) throw new Error("Admin token not found");

      const { data } = await axios.get(`${URL}/admin-cancel-charge/cancelled-orders`, {
        headers: { token: adminToken },
        params: { page, limit, orderType }
      });

      if (data?.success) {
        return {
          orders: data.data,
          summary: data.summary,
          pagination: data.pagination
        };
      } else {
        throw new Error(data?.message || "Failed to fetch cancelled orders");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };






const [filters, setFilters] = useState({
  country: '',
  state: '', 
  city: ''
});



// Master function jo sabhi APIs ko refresh karegi
const refreshAllDataWithFilters = async (currentFilters) => {
  console.log("🔄 Refreshing ALL data with filters:", currentFilters);
  
  try {
    // Sabhi APIs ko ek saath call karein with filters
    await Promise.all([
      getAllVendorList(currentFilters),
      getDoctors(currentFilters),
      getPharmacist(currentFilters),
      userS(currentFilters),
      getAllFoodVendors(currentFilters),
      getAdminClinic(currentFilters),
      fetchDoctorStats(currentFilters),
      fetchuserstats(currentFilters),
      fetchlabstats(currentFilters),
      fetchpharmacystats(currentFilters),
      fetchfoodstats(currentFilters),
      fetchclinicstats(currentFilters)
    ]);
    
    console.log("✅ ALL data refreshed with new filters");
  } catch (error) {
    console.error("❌ Error refreshing data:", error);
  }
};

// Main update filters function
const updateFilters = async (newFilters) => {
  console.log("🎯 Updating global filters:", newFilters);
  
  const updatedFilters = { ...filters, ...newFilters };
  setFilters(updatedFilters);
  
  // Sabhi data ko naye filters ke saath refresh karein
  await refreshAllDataWithFilters(updatedFilters);
};

// Location data fetch function



// Global Filters State
   const [globalFilters, setGlobalFilters] = useState(() => {
    try {
      const savedFilters = localStorage.getItem('globalLocationFilters');
      return savedFilters ? JSON.parse(savedFilters) : {
        country: '',
        state: '', 
        city: ''
      };
    } catch (error) {
      console.error("Error loading filters from localStorage:", error);
      return {
        country: '',
        state: '', 
        city: ''
      };
    }
  });

  const [availableLocations, setAvailableLocations] = useState({
    countries: ['India'],
    states: [],
    cities: []
  });

  const [loadingFilters, setLoadingFilters] = useState(false);

  // Global Filters Update Function - localStorage mein save karein
  const updateGlobalFilters = async (newFilters) => {
  console.log("🌍 Updating global filters:", newFilters);
  
  const updatedFilters = { ...globalFilters, ...newFilters };
  setGlobalFilters(updatedFilters);
  
  // ✅ Save to localStorage (non-blocking)
  try {
    localStorage.setItem('globalLocationFilters', JSON.stringify(updatedFilters));
  } catch (error) {
    console.error("Error saving filters to localStorage:", error);
  }
  
  // ✅ Debounced refresh - fast response
  setTimeout(() => {
    refreshAllData(updatedFilters);
  }, 100); // Small delay for better UX
};

// ✅ Optimized refresh function
const refreshAllData = async (filters = globalFilters) => {
  console.log("🔄 Fast refreshing data with filters:", filters);
  setLoadingFilters(true);
  
  try {
    // ✅ Parallel API calls for faster loading
    await Promise.all([
      getAllVendorList(filters),
      getPharmacist(filters),
      userS(filters),
      getAllFoodVendors(filters),
      getDoctors(filters),
      getAdminClinic(filters),
      // Stats APIs - separate call for better performance
      ...(Object.keys(filters).some(key => filters[key]) ? [
        fetchDoctorStats(filters),
        fetchuserstats(filters),
        fetchlabstats(filters),
        fetchpharmacystats(filters),
        fetchfoodstats(filters),
        fetchclinicstats(filters)
      ] : [])
    ]);
    console.log("✅ All data refreshed quickly");
  } catch (error) {
    console.error("❌ Error refreshing data:", error);
  } finally {
    setLoadingFilters(false);
  }
};

  // Clear all filters
  const clearGlobalFilters = async () => {
    const emptyFilters = { country: '', state: '', city: '' };
    setGlobalFilters(emptyFilters);
    try {
      localStorage.setItem('globalLocationFilters', JSON.stringify(emptyFilters));
      console.log("🗑️ Filters cleared from localStorage");
    } catch (error) {
      console.error("Error clearing filters from localStorage:", error);
    }
    await refreshAllData(emptyFilters);
  };

const fetchLocationData = async () => {
    try {
      const tokens = JSON.parse(sessionStorage.getItem("admin"));
      const { data } = await axios.get(`${URL}/admin/location/dashboard/locations`, {
        headers: { token: tokens?.token }
      });
      
      if (data.success) {
        setAvailableLocations(data.data);
      } else {
        // Fallback data
        setAvailableLocations({
          countries: ["India", "USA", "UK", "Canada", "Australia"],
          states: ["Punjab", "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"],
          cities: ["Mohali", "Chandigarh", "Delhi", "Mumbai", "Bangalore"]
        });
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setAvailableLocations({
        countries: ["India", "USA", "UK", "Canada", "Australia"],
        states: ["Punjab", "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"],
        cities: ["Mohali", "Chandigarh", "Delhi", "Mumbai", "Bangalore"]
      });
    }
  };


const getDoctors = async (filters = globalFilters) => {
    console.log("🚀 Starting getDoctors with filters:", filters);
    
    if (!tokenS?.token) {
      console.error("❌ Token not found!");
      setDoctor([]);
      return;
    }

    try {
      const queryParams = new URLSearchParams();
      
      if (filters.country && filters.country.trim() !== '') {
        queryParams.append('country', filters.country.trim());
      }
      if (filters.state && filters.state.trim() !== '') {
        queryParams.append('state', filters.state.trim());
      }
      if (filters.city && filters.city.trim() !== '') {
        queryParams.append('city', filters.city.trim());
      }

      const queryString = queryParams.toString();
      const apiUrl = `${process.env.REACT_APP_API_URL}/doctorAccess/getDoctors${queryString ? `?${queryString}` : ''}`;
      
      console.log("📡 Making API call to:", apiUrl);

      const { data } = await axios.get(apiUrl, {
        headers: { 
          token: tokenS.token,
          'Content-Type': 'application/json'
        },
      });

      console.log("✅ API Response:", {
        success: data.success,
        message: data.message,
        doctorsCount: data.data?.length,
        appliedFilters: data.appliedFilters
      });

      if (data.success === 1) {
        setDoctor(data.data);
        console.log(`🎯 Doctors updated: ${data.data.length} doctors found`);
      } else {
        setDoctor([]);
        console.warn("⚠️ No doctors found or API returned success=0");
      }
    } catch (error) {
      console.error("❌ getDoctors API error:", error.response?.data || error.message);
      setDoctor([]);
    }
  };












 const [locations, setLocations] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationPagination, setLocationPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  // 1. Add Location
  const addLocation = async (locationData) => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      const tokens = JSON.parse(sessionStorage.getItem("admin"));
      const { data } = await axios.post(`${URL}/admin/location/add`, locationData, {
        headers: {
          token: tokens?.token,
          'Content-Type': 'application/json'
        }
      });

      if (data.success === 1) {
        toast.success("Location added successfully");
        // Refresh locations list
        await getAllLocations();
        return { success: true, data: data.data };
      } else {
        setLocationError(data.message);
        toast.error(data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setLocationError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLocationLoading(false);
    }
  };

  // 2. Get All Locations with Pagination and Filters
  const getAllLocations = async (page = 1, limit = 50, filters = {}) => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      const tokens = JSON.parse(sessionStorage.getItem("admin"));
      const queryParams = new URLSearchParams();
      
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.state) queryParams.append('state', filters.state);

      const { data } = await axios.get(`${URL}/admin/location/all?${queryParams}`, {
        headers: { token: tokens?.token }
      });

      if (data.success === 1) {
        setLocations(data.data.locations || []);
        setLocationPagination({
          currentPage: data.data.currentPage,
          totalPages: data.data.totalPages,
          total: data.data.total
        });
        return { success: true, data: data.data };
      } else {
        setLocationError(data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setLocationError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLocationLoading(false);
    }
  };

  // 3. Get All Countries
  const getCountries = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      const tokens = JSON.parse(sessionStorage.getItem("admin"));
      const { data } = await axios.get(`${URL}/admin/location/countries`, {
        headers: { token: tokens?.token }
      });

      if (data.success === 1) {
        return { success: true, data: data.data };
      } else {
        setLocationError(data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setLocationError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLocationLoading(false);
    }
  };

  // 4. Get States by Country
  const getStatesByCountry = async (country) => {
    try {
      if (!country) {
        return { success: true, data: [] };
      }

      setLocationLoading(true);
      setLocationError(null);

      const tokens = JSON.parse(sessionStorage.getItem("admin"));
      const { data } = await axios.get(`${URL}/admin/location/states/${encodeURIComponent(country)}`, {
        headers: { token: tokens?.token }
      });

      if (data.success === 1) {
        return { success: true, data: data.data };
      } else {
        setLocationError(data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setLocationError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLocationLoading(false);
    }
  };

  // 5. Get Cities by State and Country
  const getCitiesByState = async (country, state) => {
    try {
      if (!country || !state) {
        return { success: true, data: [] };
      }

      setLocationLoading(true);
      setLocationError(null);

      const tokens = JSON.parse(sessionStorage.getItem("admin"));
      const { data } = await axios.get(
        `${URL}/admin/location/cities/${encodeURIComponent(country)}/${encodeURIComponent(state)}`, 
        {
          headers: { token: tokens?.token }
        }
      );

      if (data.success === 1) {
        return { success: true, data: data.data };
      } else {
        setLocationError(data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setLocationError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLocationLoading(false);
    }
  };



//    const fetchLocationData = async () => {
//   try {
//     const tokens = JSON.parse(sessionStorage.getItem("admin"));
//     const { data } = await axios.get(`${URL}/admin/location/dashboard/locations`, {
//       headers: { token: tokens?.token }
//     });
    
//     if (data.success) {
//       setAvailableLocations(data.data);
//     } else {
//       // Fallback: If the API fails, use empty arrays
//       setAvailableLocations({
//         countries: [],
//         states: [],
//         cities: []
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching locations:", error);
//     // Fallback to empty arrays
//     setAvailableLocations({
//       countries: [],
//       states: [],
//       cities: []
//     });
//   }
// };

// Cascading states fetch function
const fetchStatesForCountry = async (country) => {
  try {
    const tokens = JSON.parse(sessionStorage.getItem("admin"));
    const { data } = await axios.get(`${URL}/admin/location/dashboard/states?country=${country}`, {
      headers: { token: tokens?.token }
    });
    
    if (data.success) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
};

// Cascading cities fetch function
const fetchCitiesForState = async (country, state) => {
  try {
    const tokens = JSON.parse(sessionStorage.getItem("admin"));
    const { data } = await axios.get(`${URL}/admin/location/dashboard/cities?country=${country}&state=${state}`, {
      headers: { token: tokens?.token }
    });
    
    if (data.success) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};





// ✅ CREATE MEMBERSHIP PLAN (UPDATED WITH DISCOUNT MATRIX)
const createMembershipPlan = async (planData) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/admin/membership/create`,
      planData,
      { headers: { token: adminToken } }
    );

    if (response.data.success === 1) {
      console.log('✅ Membership plan created:', response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to create membership plan');
  } finally {
    setLoading(false);
  }
};

// ✅ GET ALL MEMBERSHIP PLANS (UPDATED)
const getAdminMembershipPlans = async (filters = {}) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const { status = 'active', page = 1, limit = 10, search = '' } = filters;

    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);

    const queryString = queryParams.toString();
    const apiUrl = `${process.env.REACT_APP_API_URL}/admin/membership/all${queryString ? `?${queryString}` : ''}`;

    console.log("📡 Fetching membership plans:", apiUrl);

    const response = await axios.get(apiUrl, {
      headers: { token: adminToken }
    });

    if (response.data.success === 1) {
      setMembershipPlans(response.data.data.plans || []);
      console.log(`✅ Fetched ${response.data.data.plans?.length} membership plans`);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch membership plans');
  } finally {
    setLoading(false);
  }
};

// ✅ GET SINGLE MEMBERSHIP PLAN BY ID (UPDATED)
const getMembershipPlanById = async (id) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/admin/membership/${id}`,
      { headers: { token: adminToken } }
    );

    if (response.data.success === 1) {
      console.log('✅ Membership plan fetched:', response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch membership plan');
  } finally {
    setLoading(false);
  }
};

// ✅ UPDATE MEMBERSHIP PLAN (UPDATED)
const updateMembershipPlan = async (id, updateData) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/admin/membership/update/${id}`,
      updateData,
      { headers: { token: adminToken } }
    );

    if (response.data.success === 1) {
      console.log('✅ Membership plan updated:', response.data.data);
      // Refresh the plans list
      await getAdminMembershipPlans();
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to update membership plan');
  } finally {
    setLoading(false);
  }
};

// ✅ TOGGLE MEMBERSHIP PLAN STATUS (UPDATED)
const toggleMembershipPlanStatus = async (id) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.patch(
      `${process.env.REACT_APP_API_URL}/admin/membership/toggle-status/${id}`,
      {},
      { headers: { token: adminToken } }
    );

    if (response.data.success === 1) {
      console.log('✅ Membership plan status toggled:', response.data.data);
      // Refresh the plans list
      await getAdminMembershipPlans();
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to toggle membership plan status');
  } finally {
    setLoading(false);
  }
};

// ✅ GET ACTIVE MEMBERSHIP PLANS (For dropdown/selection)
const getActiveMembershipPlans = async () => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/admin/membership/active/plans`,
      { headers: { token: adminToken } }
    );

    if (response.data.success === 1) {
      console.log('✅ Active membership plans fetched:', response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch active membership plans');
  } finally {
    setLoading(false);
  }
};

// ✅ GET DISCOUNT MATRIX FOR PLAN
const getPlanDiscountMatrix = async (planId) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/admin/membership/discount-matrix/${planId}`,
      { headers: { token: adminToken } }
    );

    if (response.data.success === 1) {
      console.log('✅ Discount matrix fetched for plan:', planId);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch discount matrix');
  } finally {
    setLoading(false);
  }
};

// ✅ UPDATE DISCOUNT MATRIX
const updateDiscountMatrix = async (planId, discountData) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/admin/membership/discount-matrix/${planId}`,
      discountData,
      { headers: { token: adminToken } }
    );

    if (response.data.success === 1) {
      console.log('✅ Discount matrix updated for plan:', planId);
      // Refresh the plans list
      await getAdminMembershipPlans();
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to update discount matrix');
  } finally {
    setLoading(false);
  }
};

// ✅ CALCULATE DISCOUNT PREVIEW
const calculateDiscountPreview = async (data) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/admin/membership/calculate-preview`,
      data,
      { headers: { token: adminToken } }
    );

    if (response.data.success === 1) {
      console.log('✅ Discount preview calculated:', response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to calculate discount preview');
  } finally {
    setLoading(false);
  }
};

///////////// admin about us........................
 const [aboutUsData, setAboutUsData] = useState(null);

  // ✅ GET ABOUT US DATA (Public)
  const getAboutUs = async () => {
    setLoading(true);
    clearError();
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/about-us`
      );

      if (response.data.success === 1) {
        setAboutUsData(response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch About Us data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET ABOUT US DATA (Admin)
  const getAdminAboutUs = async () => {
    setLoading(true);
    clearError();
    try {
      const adminToken = getAdminToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/about-us`,
        { headers: { token: adminToken } }
      );

      if (response.data.success === 1) {
        setAboutUsData(response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch About Us data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE ABOUT US (Admin)
  const updateAboutUs = async (formData) => {
    setLoading(true);
    clearError();
    try {
      const adminToken = getAdminToken();
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/about-us`,
        formData,
        {
          headers: {
            token: adminToken,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success === 1) {
        setAboutUsData(response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      return handleError(error, 'Failed to update About Us');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPLOAD IMAGE (Admin)
  const uploadImage = async (file) => {
    setLoading(true);
    clearError();
    try {
      const adminToken = getAdminToken();
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/about-us/upload`,
        formData,
        {
          headers: {
            token: adminToken,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success === 1) {
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      return handleError(error, 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

// amdin science user .........
const [sciencePage, setSciencePage] = useState(null);

// ✅ GET SCIENCE PAGE CONTENT (Public - for both admin and user)
const getSciencePageContent = async () => {
  setLoading(true);
  clearError();
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/admin/science-page`
    );

    if (response.data.success === 1) {
      setSciencePage(response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch science page content');
  } finally {
    setLoading(false);
  }
};

// ✅ UPDATE SCIENCE PAGE CONTENT (Admin only)
const updateSciencePageContent = async (updateData) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/admin/science-page`,
      updateData,
      { headers: { token: adminToken } }
    );

    if (response.data.success === 1) {
      setSciencePage(response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to update science page');
  } finally {
    setLoading(false);
  }
};




// ✅ ADD NEW SCIENCE PAGE ITEM (Admin only)
const addSciencePageItem = async (type, data) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/admin/science-page/add-item`,
      { type, data },
      { headers: { token: adminToken } }
    );

    if (response.data.success === 1) {
      setSciencePage(response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to add item');
  } finally {
    setLoading(false);
  }
};

// ✅ REMOVE SCIENCE PAGE ITEM (Admin only)
const removeSciencePageItem = async (type, index) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/admin/science-page/remove-item`,
      {
        headers: { token: adminToken },
        data: { type, index }
      }
    );

    if (response.data.success === 1) {
      setSciencePage(response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to remove item');
  } finally {
    setLoading(false);
  }
};

// ✅ UPLOAD SCIENCE PAGE IMAGES (Admin only) - FIXED VERSION
const uploadScienceImages = async (formData) => {
  setLoading(true);
  clearError();
  try {
    const adminToken = getAdminToken();
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/admin/science-page/upload`,
      formData,
      { 
        headers: { 
          token: adminToken,
          'Content-Type': 'multipart/form-data'
        } 
      }
    );

    if (response.data.success === 1) {
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Upload error details:', error.response?.data || error.message);
    return handleError(error, 'Failed to upload images');
  } finally {
    setLoading(false);
  }
};








const [banners, setBanners] = useState([]);
 // ✅ GET ALL BANNERS
  const fetchAllBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get(`${URL}/banner-image/get-banner`);
      
      if (data.success) {
        setBanners(data.details || []);
        return { success: true, data: data.details };
      } else {
        setError(data.message || "Failed to fetch banners");
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch banners";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET BANNERS BY TYPE
  const fetchBannersByType = async (type) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert type to string since API returns type as string
      const typeString = type.toString();
      
      const { data } = await axios.get(`${URL}/banner-image/get-banner`);
      
      if (data.success) {
        const typeBanners = data.details.filter(banner => banner.type === typeString);
        return { success: true, data: typeBanners };
      } else {
        setError(data.message || "Failed to fetch banners");
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch banners";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE BANNERS
  const updateBanners = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAdminToken();
      if (!token) {
        setError("Authentication required");
        return { success: false, message: "Authentication required" };
      }

      const { data } = await axios.patch(
        `${URL}/banner-image/updated-banner`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token: token,
          },
        }
      );

      if (data.success) {
        await fetchAllBanners(); // Refresh banners
        return { 
          success: true, 
          message: data.message, 
          data: data.details,
          details: data.details 
        };
      } else {
        setError(data.message || "Failed to update banners");
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to update banners";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // ✅ REMOVE SPECIFIC BANNER IMAGE
  const removeBannerImage = async (bannerId, imageField) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAdminToken();
      if (!token) {
        setError("Authentication required");
        return { success: false, message: "Authentication required" };
      }

      const { data } = await axios.put(
        `${URL}/banner-image/removebann`,
        { bannerId, imageField },
        {
          headers: {
            token: token,
          },
        }
      );

      if (data.success) {
        await fetchAllBanners(); // Refresh banners
        return { success: true, message: data.message, data: data.data };
      } else {
        setError(data.message || "Failed to remove banner");
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to remove banner";
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };



/////////////////////// admin panel end /////////////////////////////////



////////////////// admin //////////////////////////////////////////////////////////////////////////////////////////////////////

  const adminLogin = async (value) => {
    try {
      const { data } = await axios.post(`${URL}/admin/login`, value);
      if (data.success === 1) {
        console.log("Returned token:", data.details.token);
        sessionStorage.setItem("admin", JSON.stringify(data.details));
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1000);
        toast.success("Logged in successfully");
      } else {
        toast.error("Unauthorized");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //get admin for dashboard
  const [admin, setAdmin] = useState([]);
  const getAdmin = useCallback(async () => {
    try {
      const tokenS = JSON.parse(sessionStorage.getItem("admin"));
      const { data } = await axios.get(`${URL}/admin/getadmin`, {
        headers: {
          token: tokenS.token,
        },
      });

      if (data.success === 1) {
        setAdmin(data.details);
      }
    } catch (error) {
      console.log(error);
    }
  },[]);

  //update Admin details
  const updateAdmin = async (value) => {
    try {
      const { data } = await axios.patch(`${URL}/admin/edit`, value, {
        headers: {
          token: tokenS.token,
        },
      });

      if (data.success === 1) {
        toast.success("Updated successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //change password
  const changePassword = async (value) => {
    try {
      const { data } = await axios.patch(`${URL}/admin/change`, value, {
        headers: {
          token: tokenS.token,
        },
      });
      if (data.success === 1) {
        toast.success("Password updated successfully");
        return { success: true };
      } else {
        // If the backend returns an error, like "old password is incorrect"
        return {
          success: false,
          message: data.message || "Password update failed",
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    }
  };

  //vendor
  const getVendor = async () => {
    try {
      const { data } = await axios.get(`${URL}/website`);

      setVendor(data.details);
    } catch (error) {
      console.log(error.message);
    }
  }; 

  //get particular vendor test
  const getVendortest = async (id)=> {
     try {
       const { data } = await axios.get(`${URL}/website/website/${id}`);
 
       setTest(data.details);
     } catch (error) {
       console.log(error.message);
     }
   };

  //get vendor Packages
  const getVendorPackages = async (id)=> {
    try {
      const { data } = await axios.get(
        `${URL}/vendor-package/vendor-package/${id}`
      );
      setPackages(data.details);
    } catch (error) {
      console.log(error);
    }
  };

  //get  all vendor Coupons
  const getVendorCoupon = async (id) => {
    try {
      const { data } = await axios.get(`${URL}/vendor-coupon/getcoupon/${id}`);
      // setisLoading(false);
      setCoupon(data.details);
    } catch (error) {
      console.log(error.message);
    }
  };

//////////////// clinic user ////////////////////

// =============== get user clinic ===================
  const [clinic, setClinic] = useState([]);
 
const getUserClinic = async (userLocation = null, searchQuery = "") => {
  try {
    setLoading(true);
    setError(null);
 
    // Prepare Payload for POST request
    const payload = {
      latitude: userLocation?.latitude || "",
      longitude: userLocation?.longitude || "",
      search: searchQuery // Added search parameter
    };
 
    console.log('📍 Fetching clinics with payload:', payload);
 
    // Changed to POST as requested
    const response = await axios.post(`${URL}/userClinic/getAllClinic`, payload);
 
    console.log("Get clinic response:", response.data);
 
    if (response.data.success === 1) {
      const fetchedClinics = response.data.details || [];
     
      if (response.data.distanceLimit) {
        setDistanceLimit({ clinicLimit: response.data.distanceLimit });
      }
 
      setClinic(fetchedClinics);
     
    } else {
      setClinic([]);
      // Only show error if it's not a successful empty search
      if(response.data.message !== "Clinics fetched successfully") {
          setError(response.data.message || "No clinic details found");
      }
    }
 
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch clinic details';
    setError(errorMessage);
    console.error("Error fetching clinic details:", err);
    setClinic([]);
  } finally {
    setLoading(false);
  }
};
 

// =========== Rating Fetch api Start ======
// Apni Context File (e.g., Context.js) mein ye add karein:
 
const [clinicRatings, setClinicRatings] = useState(null);
const [ratingLoading, setRatingLoading] = useState(false);
 
// 1. Get Ratings
const getClinicRatings = async (ClinicId) => {
  setRatingLoading(true);
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/user-rating/getratings`,
      {
        params: { ClinicId: ClinicId }, // VendorId ki jagah ClinicId
        headers: { token: token }
      }
    );
    if (response.data.success === 1) {
      setClinicRatings(response.data.data);
    }
  } catch (error) {
    console.error("Error fetching ratings:", error);
  } finally {
    setRatingLoading(false);
  }
};
 
// 2. Add Rating
const addClinicRating = async (data) => {
  const token = localStorage.getItem("token");
  return await axios.post(
    `${process.env.REACT_APP_API_URL}/user-rating`,
    data,
    { headers: { token: token } }
  );
};
 
// 3. Edit Rating
const editClinicRating = async (id, data) => {
  const token = localStorage.getItem("token");
  return await axios.put(
    `${process.env.REACT_APP_API_URL}/user-rating/edit/${id}`,
    data,
    { headers: { token: token } }
  );
};
 
// 4. Delete Rating
const deleteClinicRating = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.delete(
    `${process.env.REACT_APP_API_URL}/user-rating/delete/${id}`,
    { headers: { token: token } }
  );
};
 
// -------------------------------------------------
// Context.js ke andar states:
const [vendorRatings, setVendorRatings] = useState(null);
 
// Functions:
const getVendorRatings = async (vendorId) => {
  setRatingLoading(true);
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/user-rating/getratings`,
      { params: { vendorId: vendorId }, headers: { token: token } }
    );
    if (response.data.success === 1) {
      setVendorRatings(response.data.data);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setRatingLoading(false);
  }
};
 
const addVendorRating = async (data) => {
  const token = localStorage.getItem("token");
  return await axios.post(`${process.env.REACT_APP_API_URL}/user-rating`, data, { headers: { token: token } });
};
 
const editVendorRating = async (id, data) => {
  const token = localStorage.getItem("token");
  return await axios.put(`${process.env.REACT_APP_API_URL}/user-rating/edit/${id}`, data, { headers: { token: token } });
};
 
const deleteVendorRating = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.delete(`${process.env.REACT_APP_API_URL}/user-rating/delete/${id}`, { headers: { token: token } });
};
 
 
// ===========  Rating Fetch api End ======
 
 
 
  // ============== get user clinic doctor ===================
  const [clinicDoctor, setClinicDoctor] = useState([]);
 
  const getClinicDoctors1 = async (clinicId) => {
    try {
      setLoading(true);
      setError(null);
      const token = getUserToken();
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setPrivacyLoading(false);
        return { success: 0, message: 'Authentication token not found.' };
      }
 
 
      const response = await axios.get(`${URL}/userClinic/getDoctor`, {
        params: { clinicId },
        headers: { 'Content-Type': 'application/json',
          token:token,
         }  
      });
      console.log("Get clinic doctors response:", response.data.details);
 
      if (response.data.success) {
        setClinicDoctor(response.data.details || []);
      } else {
        setClinicDoctor([]);
        setError("No doctors found for this clinic");
      }
 
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch clinic doctors';
      setError(errorMessage);
      console.error("Error fetching clinic doctors:", err);
      setClinicDoctor([]);
      return { success: 0, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }



  //////////// lab user ///////////////////////
  

  const [testsByOrgan, setTestsByOrgan] = useState([]);
  const [packageCollection, setPackageCollection] = useState(null);
  const [vendorTests, setVendorTests] = useState([]);
  const [vendorPackages, setVendorPackages] = useState([]);
  const [prescribedTests, setPrescribedTests] = useState([]);
  const [popularPackages, setPopularPackages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [currentLabTests, setCurrentLabTests] = useState([]);
  const [labTestHistory, setLabTestHistory] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [organs, setOrgans] = useState([]);

  const getVendor1 = async (latitude, longitude, page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      // POST request with body parameters
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/labnear/near`,
        {
          latitude: latitude || null,
          longitude: longitude || null,
          page,
          limit,
          search: search
        },
        {
          headers: {
            'Content-Type': 'application/json',
            token: userToken
          }
        }
      );
     
      if (response.data.success === 1) {
        // Response में data details array में है, data field में नहीं
        setVendor(response.data.details || []); // यहाँ change किया है
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };
 

  const getVendorTests = async (vendorId) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/labnear/test/${vendorId}`, {
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setVendorTests(response.data.details);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch vendor tests');
    } finally {
      setLoading(false);
    }
  };

  // Get vendor packages
  const getVendorPackages1 = async (vendorId, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/labnear/package/${vendorId}`, {
        params: { page, limit },
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setVendorPackages(response.data.details);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch vendor packages');
    } finally {
      setLoading(false);
    }
  };

  // Get all packages
  const getAllPackages = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/labnear/package`, {
        params: { page, limit },
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setPackages(response.data.details);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const getParticularLabTests = async (organ, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/labnear/parttest`, {
        params: { organ, page, limit },
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setTestsByOrgan(response.data.data);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch tests by organ');
    } finally {
      setLoading(false);
    }
  };

  // Get package collection according to category
  const getPackageCollection = async (packageName, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/labnear/getcollectionPackage`, {
        params: { packageName, page, limit },
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setPackageCollection(response.data.data);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch package collection');
    } finally {
      setLoading(false);
    }
  };

  // Get prescribed tests
  const getPrescribedTests = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/onSearch/presTest`, {
        params: { page, limit },
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setPrescribedTests(response.data.details);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch prescribed tests');
    } finally {
      setLoading(false);
    }
  };

  // Get popular packages
  const getPopularPackages = async () => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/onSearch/package`, {
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setPopularPackages(response.data.data);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch popular packages');
    } finally {
      setLoading(false);
    }
  };

  // Search tests and packages
  const searchTestsAndPackages = async (query) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/onSearch/search`, {
        params: { q: query },
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setSearchResults(response.data.details);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to search');
    } finally {
      setLoading(false);
    }
  };

  // Get selected lab tests
  const getSelectedLabTests = async (testName) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/onSearch/selected`, {
        params: { testName },
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setSelectedLabTests(response.data.details);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch selected lab tests');
    } finally {
      setLoading(false);
    }
  };

  // Get current lab tests for user
  const getCurrentLabTests = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/labtest/data`, {
        params: { page, limit },
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setCurrentLabTests(response.data.details);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch current lab tests');
    } finally {
      setLoading(false);
    }
  };

  // Get lab test history
  const getLabTestHistory = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/labtest/history`, {
        params: { page, limit },
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setLabTestHistory(response.data.details);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch lab test history');
    } finally {
      setLoading(false);
    }
  };

  // Get user order history
  const getUserOrderHistory = async () => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/lab-appointment/userorderHistory`, {
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setUserOrders(response.data.details);
      }
      console.log('User orders set in state:', response.data.details);
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch user orders');
    } finally {
      setLoading(false);
    }
  };

  const getLabOrderDetails = async (orderId) => {
  try {
    const token = getUserToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/lab-appointment/getOrderDetails/${orderId}`,
      {
        headers: { token }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching lab order details:', error);
    throw error;
  }
};

  // Get all active orders
  const getAllActiveOrders = async () => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/lab-appointment/getAllActiveOrderss`, {
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setActiveOrders(response.data.data);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch active orders');
    } finally {
      setLoading(false);
    }
  };

  // Apply coupon
  const applyCoupon1 = async (couponCode, vendorId, price) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/apply/coupon`, 
        { couponCode, vendorId, price },
        {
          headers: { 
            'Content-Type': 'application/json',
            token: userToken 
          }
        }
      );
      
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  // Book appointment for test
  const bookAppointment = async (appointmentData) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/lab-appointment/appointment`, 
        appointmentData,
        {
          headers: { 
            'Content-Type': 'application/json',
            token: userToken 
          }
        }
      );
      
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // Book appointment for package
  const bookPackageAppointment = async (appointmentData) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/lab-appointment/appointment/package`, 
        appointmentData,
        {
          headers: { 
            'Content-Type': 'application/json',
            token: userToken 
          }
        }
      );
      
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to book package appointment');
    } finally {
      setLoading(false);
    }
  };

  // Get all organs
  const getAllOrgans = async () => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/labnear/getAllOrgans`, {
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        setOrgans(response.data.data);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch organs');
    } finally {
      setLoading(false);
    }
  };

// Get vendor availability
const getVendorAvailability = async (vendorId) => {
  setLoading(true);
  try {
    const userToken = getUserToken();
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/labnear/available/${vendorId}`, {
      headers: { 
        'Content-Type': 'application/json',
        token: userToken 
      }
    });
    console.log('Vendor availability response:', response.data);
    
    if (response.data.success === 1) {
      return response.data.details;
    }
    return [];
  } catch (error) {
    console.error('Error fetching vendor availability:', error);
    return [];
  } finally {
    setLoading(false);
  }
};

// Get vendor start and end dates
const getVendorStartEndDates = async (vendorId) => {
  setLoading(true);
  try {
    const userToken = getUserToken();
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/labnear/startdate/${vendorId}`, {
      headers: { 
        'Content-Type': 'application/json',
        token: userToken 
      }
    });
    console.log('Vendor start/end dates response:', response.data);
    
    if (response.data.success === 1) {
      return response.data.details;
    }
    return [];
  } catch (error) {
    console.error('Error fetching vendor dates:', error);
    return [];
  } finally {
    setLoading(false);
  }
};

// Get vendor time slots
const getVendorTimeSlots = async (vendorId, startDate, endDate) => {
  setLoading(true);
  try {
    const userToken = getUserToken();
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/labnear/time/${vendorId}`, 
      { startDate, endDate },
      {
        headers: { 
          'Content-Type': 'application/json',
          token: userToken 
        }
      }
    );
    console.log('Vendor time slots response hhhhhhhhhhhhhhhh:', response.data);
    
    if (response.data.success === 1) {
      return response.data.details;
    }
    return [];
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return [];
  } finally {
    setLoading(false);
  }
};


// =================Admin Max dist limit==============
// State for distance limits
const [distanceLimits, setDistanceLimits] = useState(null);
const [distanceLoading, setDistanceLoading] = useState(false);
const [distanceError, setDistanceError] = useState(null);
 
// Notification state
const [notification, setNotification] = useState({
  show: false,
  type: 'info',
  title: '',
  message: ''
});
 
// Show notification function
const showNotification = (title, message, type = 'info') => {
  setNotification({ show: true, type, title, message });
  setTimeout(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, 5000);
};
 
const hideNotification = () => {
  setNotification(prev => ({ ...prev, show: false }));
};
 
// GET Distance Limits
const getDistanceLimits = async () => {
  setDistanceLoading(true);
  try {
    const response = await axios.get(`${URL}/distance/get-distance-limit`, {
      headers: {
        'Content-Type': 'application/json',
        token: tokenS.token || '',
      }
    });
 
    if (response.data.success === 1) {
      setDistanceLimits(response.data.data);
 
    } else {
      setDistanceError(response.data.message);
    }
  } catch (error) {
    setDistanceError(error.response?.data?.message || error.message);
  } finally {
    setDistanceLoading(false);
  }
};
 
// UPDATE Distance Limits
const updateDistanceLimits = async (id, updatedData) => {
  setDistanceLoading(true);
  try {
    const response = await axios.put(
      `${URL}/distance/update-distance-limit/${id}`,
      updatedData,
      {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token || '',
        }
      }
    );
 
    if (response.data.success === 1) {
      setDistanceLimits(response.data.data);
      showNotification('Success', 'Distance limits updated successfully', 'success');
      return { success: true };
    } else {
      showNotification('Error', response.data.message, 'error');
      return { success: false };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    showNotification('Error', errorMsg, 'error');
    return { success: false };
  } finally {
    setDistanceLoading(false);
  }
};
 
// =================Admin Max dist limit End==============
   
 ////// doctor user ///////////////////////////
  const [appointments, setAppointments] = useState([]);
  const [members, setMembers] = useState([]);
  const [coupons3, setCoupons3] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
const [userLocation, setUserLocation] = useState(null);

   const handleError = (error, defaultMessage = 'Something went wrong') => {
    console.error('API Error:', error);
    return {
      success: 0,
      message: error.response?.data?.message || error.message || defaultMessage
    };
  };
  // Improved geolocation function
  // Context.js में
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        // Location context में सेव करें
        setUserLocation(location);
        
        // Location के साथ doctors fetch करें
        getDoctor(location.latitude, location.longitude);
        
        resolve(location);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

  // Get doctors with distance calculation
 // Context.js में getDoctor function
 const getDoctor = async (lat = null, lng = null) => {
  const token = getUserToken();
  setLoading(true);
  try {
 
    const url = `${process.env.REACT_APP_API_URL}/user-doctor`;
   
    // Request Body tayyar karein
    const payload = {};
 
    // Logic: Agar function call karte waqt lat/lng diya hai (Manual Location)
    if (lat && lng) {
      payload.latitude = lat;
      payload.longitude = lng;
    }
    // Agar nahi diya, toh Context mein saved UserLocation use karein
    else if (userLocation) {
      payload.latitude = userLocation.latitude;
      payload.longitude = userLocation.longitude;
    }
    console.log("Fetching Doctors with payload:", payload);
 
    // GET ki jagah POST use karein
    const response = await axios.post(url, payload,
      {
        headers: {
          'Content-Type': 'application/json',
          token: token || ''
        }
      }
    );
 
    if (response.data.success === 1) {
      // Backend ab filtered aur distance ke saath data bhej raha hai
      setDoctor(response.data.details);
     
      
    } else {
      setDoctor([]);
      console.log("No doctors found or success is 0");
    }
  } catch (error) {
    console.error("Error fetching doctors:", error);
    setDoctor([]);
  } finally {
    setLoading(false);
  }
};

  // Manual location setter
  const setManualLocation = useCallback((lat, lng) => {
    const location = { latitude: lat, longitude: lng };
    setUserLocation(location);
    getDoctor(lat, lng);
  }, [getDoctor]);

  // Clear location and show all doctors
  const clearLocation = useCallback(() => {
    setUserLocation(null);
    getDoctor(); // Fetch without location
  }, [getDoctor]);

  const getdoctorProfile = async (id) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/doctor/website/${id}`);
      console.log('Doctor Profile API response:', data);
      if (data.success === 1) {
        setPDoctor(data.details);
      }
      return data;
    } catch (error) {
      console.log(error.message);
      return handleError(error, 'Failed to fetch doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const getAllDoctor = async (page = 1, latitude, longitude) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const params = { page, ...(latitude && { latitude }), ...(longitude && { longitude }) };
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/user-doctor`, { 
        params,
        headers: { token: userToken }
      });
      
      if (response.data.success === 1) {
        setDoctor(response.data.details);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch all doctors');
    } finally {
      setLoading(false);
    }
  };

  const createMember = async (memberData) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const formData = new FormData();
      
      Object.keys(memberData).forEach(key => {
        if (key === 'image' && memberData[key]) {
          formData.append('image', memberData[key]);
        } else {
          formData.append(key, memberData[key]);
        }
      });

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/user-add-member`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          token: userToken 
        }
      });
      
      if (response.data.success === 1) {
        getAllMemberOfPatients();
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  const getAllMemberOfPatients = async () => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/user-add-member/getAll`, {}, {
        headers: { token: userToken },
      });
      
      console.log('Get Members API response:', response.data);
      if (response.data.success === 1) {
        setMembers(response.data.details);
      }
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const addpatient = async (patientData) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const formData = new FormData();
      
      Object.keys(patientData).forEach(key => {
        if (key === 'pic' && patientData[key]) {
          formData.append('file', patientData[key]);
        } else {
          formData.append(key, patientData[key]);
        }
      });

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/user-add-member/addpatient`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          token: userToken 
        }
      });
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

 // Context.jsx में appointment function
// Context.js में appointment1 function को update करें:

const appointment1 = async (data) => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      return { success: 0, message: "Authentication token not found " };
    }

    // 🚨 ADD doctorModelHasClinic field if not present
    const requestData = {
      ...data,
      
      // 🚨 Add doctorModelHasClinic if clinicId exists
      ...(data.clinicId && { doctorModelHasClinic: true }),
      
      // Ensure required fields are included
      price: data.price || data.finalAmount || data.originalPrice || 0,
      age: data.age || data.patientAge || "",
      
      // Ensure other required fields
      serviceType: data.serviceType || "General Consultation",
      startime: data.startime || data.time || "",
      type: data.type || (data.paymentType === "online" ? "online" : "offline"),
      day: data.day || "Morning",
      
      // Add timestamp
      timestamp: new Date().toISOString(),
      source: "react_frontend"
    };

    console.log("📤 SENDING TO API (WITH doctorModelHasClinic):", {
      clinicId: requestData.clinicId,
      doctorModelHasClinic: requestData.doctorModelHasClinic || false,
      hasClinic: !!(requestData.clinicId)
    });

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/user-appointment/appointmentReact`,
      requestData,
      {
        headers: {
          token: token,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Appointment API response:", response.data);
    
    if (response.data.success === 1) {
      console.log("✅ Appointment created successfully!");
    }
    
    return response.data;
    
  } catch (error) {
    console.error("❌ Appointment API error:", error);
    
    if (error.response) {
      console.error("Error response:", error.response.data);
      
      let errorMessage = error.response.data.message || "Appointment creation failed";
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = `Missing fields: ${error.response.data.errors.join(', ')}`;
      }
      
      return {
        success: 0,
        message: errorMessage,
        error: error.response.data
      };
    }
    
    return {
      success: 0,
      message: error.message || "Network error occurred"
    };
  }
};

  const getAllUserAppointments = async (type, status, page = 1) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      const params = { type, status, page };

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/user-appointment/getAllDoctorAppointments`, {
        params,
        headers: { token: userToken },
      });

      console.log('heera Appointments:', response.data);

      if (response.data.success === 1) {
        setAppointments(response.data.details);
      }

      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

 // Apply Coupon - POST
const applyCoupon = async (couponData) => {
  setLoading(true);
  try {
    const userToken = getUserToken();
    const response = await axios.post(
      `${URL}/user-applycoupon/apply`,
      couponData,
      {
        headers: { token: userToken },
      }
    );
    console.log('Apply Coupon API response:', response.data);
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to apply coupon');
  } finally {
    setLoading(false);
  }
};

const getCoupon = async (doctorId) => {
  setLoading(true);
  try {
    const userToken = getUserToken();
    const response = await axios.get(
      `${URL}/user-applycoupon/getCoupon`,
      {
        headers: { token: userToken },
        params: { doctorId: doctorId }, // ✅ Key: doctorId, Value: doctorId. Yehi chahiye.
      }
    );
    console.log('Get Coupon API response:', response.data);
    if (response.data.success === 1) {
      // setCoupons3(response.data.coupons); // Agar yeh context mein hai to.
    }
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to fetch coupons');
  } finally {
    setLoading(false);
  }
};


  const getAvailabiltyOfVendorAndTimeInUser = async (availabilityData) => {
    setLoading(true);
    try {
      const userToken = getUserToken();

      if (!userToken) {
        console.warn("User token not found");
        return { success: 0, message: "User not authenticated" };
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user-doctor-availablity`,
        {
          doctorId: availabilityData.doctorId,
          day: availabilityData.day,
          startDate: availabilityData.startDate,
        },
        {
          headers: {
            token: userToken,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Availability API response:", response.data);

      if (response.data.success === 1) {
        setAvailableSlots(response.data.details);
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching availability:", error);
      return handleError(error, "Failed to fetch available slots");
    } finally {
      setLoading(false);
    }
  };

//................ /user memmbership ....................
  // ✅ MEMBERSHIP STATES
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [activeMembership, setActiveMembership] = useState(null);
  const [membershipHistory, setMembershipHistory] = useState([]);
  const [membershipLoading, setMembershipLoading] = useState(false);

  // ✅ GET ALL MEMBERSHIP PLANS
  const getMembershipPlans = async (page = 1, limit = 10, search = '') => {
    setMembershipLoading(true);
    try {
      const userToken = getUserToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user-membership/plans`,
        {
          params: { page, limit, search },
          headers: { token: userToken }
        }
      );

      if (response.data.success) {
        setMembershipPlans(response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch membership plans');
    } finally {
      setMembershipLoading(false);
    }
  };

  // ✅ GET ACTIVE MEMBERSHIP
  const getActiveMembership = async () => {
    try {
      const userToken = getUserToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user-membership/active`,
        { headers: { token: userToken } }
      );

      if (response.data.success) {
        setActiveMembership(response.data.data);
        return response.data;
      } else if (response.data.message === "No active membership found") {
        setActiveMembership(null);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch active membership');
    }
  };

  // ✅ PURCHASE MEMBERSHIP
  const purchaseMembership = async (membershipData) => {
    setMembershipLoading(true);
    try {
      const userToken = getUserToken();
      
      console.log("📤 PURCHASING MEMBERSHIP:", membershipData);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user-membership/purchase`,
        membershipData,
        { headers: { token: userToken } }
      );

      console.log('Membership purchase response:', response.data);
      
      if (response.data.success) {
        // Refresh active membership after purchase
        await getActiveMembership();
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      return handleError(error, 'Failed to purchase membership');
    } finally {
      setMembershipLoading(false);
    }
  };

  // ✅ GET MEMBERSHIP HISTORY
  const getMembershipHistory = async (page = 1, limit = 10) => {
    try {
      const userToken = getUserToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user-membership/history`,
        {
          params: { page, limit },
          headers: { token: userToken }
        }
      );

      if (response.data.success) {
        setMembershipHistory(response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      return handleError(error, 'Failed to fetch membership history');
    }
  };

  // ✅ CHECK MEMBERSHIP FOR APPOINTMENT
  const checkMembershipForAppointment = async (doctorId = null) => {
    try {
      const userToken = getUserToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user-membership/check-appointment`,
        {
          params: { doctorId },
          headers: { token: userToken }
        }
      );

      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to check membership');
    }
  };

  // ✅ CALCULATE DISCOUNTED PRICE
  const calculateDiscountedPrice = async (calculationData) => {
    try {
      const userToken = getUserToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user-membership/calculate-price`,
        calculationData,
        { headers: { token: userToken } }
      );

      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to calculate price');
    }
  };

  // ✅ GET MEMBERSHIP BENEFITS
  const getMembershipBenefits = async () => {
    try {
      const userToken = getUserToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user-membership/benefits`,
        { headers: { token: userToken } }
      );

      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to fetch membership benefits');
    }
  };

  // ✅ UPDATE APPOINTMENT FUNCTION TO SUPPORT MEMBERSHIP
  const appointment = async (appointmentData) => {
    setLoading(true);
    try {
      const userToken = getUserToken();
      
      // Check if user wants to use membership
      const membershipCheck = await checkMembershipForAppointment(appointmentData.doctorId);
      
      let finalAppointmentData = { ...appointmentData };
      
      if (membershipCheck.success && membershipCheck.data.hasActiveMembership && membershipCheck.data.isFreeConsultation) {
        // User has active membership with free consultations available
        finalAppointmentData.useMembership = true;
        finalAppointmentData.price = "0"; // Set price to 0 for free consultation
      }

      console.log("📤 SENDING TO API:", {
        url: `${process.env.REACT_APP_API_URL}/user-appointment/appointmentReact`,
        data: finalAppointmentData,
        usingMembership: finalAppointmentData.useMembership || false
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user-appointment/appointmentReact`,
        finalAppointmentData,
        { headers: { token: userToken } }
      );

      console.log('Appointment API response:', response.data);
      return response.data;
    } catch (error) {
      return handleError(error, 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD ACTIVE MEMBERSHIP ON APP START
  useEffect(() => {
    const initializeMembership = async () => {
      await getActiveMembership();
    };
    initializeMembership();
  }, []);








  ////////////////////  admin panel ////////////////////////////

  const getAllVendorList = async (filters = globalFilters, page = 1, LIMIT = 10) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', LIMIT);
      
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.city) queryParams.append('city', filters.city);

      const { data } = await axios.get(
        `${URL}/admin-vendor-all?${queryParams}`,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );
      if (data.success === 1) {
        setVendorLists(data.details);
        setLengthD(data.pages);
      } else {
        toast.error("Unauthorized");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Search Vendor
  const searchVendor = async (q, page, limit) => {
    const { data } = await axios.get(
      `${URL}/admin-vendor-all/search?q=${q}&page=${page}&limit=${limit}`,
      {
        headers: {
          token: tokenS.token,
        },
      }
    );
    if (data.success === 1) {
      setSearchData([data.details]);
    }
  };

  //serach vendor test
  const searchVendorTest = async (q) => {
  // Get token safely from storage or context
  const tokenS = JSON.parse(localStorage.getItem("admin") || "null");

  if (!tokenS || !tokenS.token) {
    console.warn("No token found. Skipping vendor search.");
    return;
  }

  try {
    const { data } = await axios.get(
      `${URL}/admin-vendor-all/search-test?q=${q}`,
      {
        headers: { token: tokenS.token },
      }
    );

    if (data.success === 1) {
      setSearchTest(data.details);
    } else {
      toast.error("Something went wrong");
    }
  } catch (error) {
    console.error("Error during searchVendorTest:", error);
    toast.error("Failed to search vendors");
  }
};


  //Vendor

  const testFF = async () => {
    const options = {
      method: "GET",
      url: "https://youtube-video-and-shorts-downloader.p.rapidapi.com/",
      params: {
        url: "https://youtu.be/acQkX0QgNP0",
      },
      headers: {
        "x-rapidapi-key": "6c850a587bmsh053a2b3b1d06bf3p15d6f2jsnd858cdaa65c1",
        "x-rapidapi-host": "youtube-video-and-shorts-downloader.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  // Vendor documents in admin panel
  const [documents, setDocuments] = useState(null);
  const vendorDocuments = async (id) => {
    const { data } = await axios.get(
      `${URL}/vendor-document/vendordoc?id=${id}`
    );

    if (data.success === 1) {
      setDocuments(data.details);
      toast.success("Documents fetched successfully...");
    } else {
      toast.error("Something went wrong");
    }
  };
    // Approve a specific document field
const approveVendorDocumentField = async (documentId, field) => {
  try {
    setLoading(true);
    

    const response = await axios.patch(
      `${URL}/vendor-document/approveVendorDocumentField/${documentId}`,
      { field }
    );
    
    // Update local state immediately
    setDocuments(prevDocs => {
      return prevDocs.map(doc => {
        if (doc._id === documentId) {
          return {
            ...doc,
            [field]: "1", // Set status to approved
            rejectReasons: {
              ...doc.rejectReasons,
              [field]: undefined // Clear rejection reason if any
            }
          };
        }
        return doc;
      });
    });

    toast.success("Document field approved successfully");
    return response.data;
  } catch (error) {
    console.error('Error approving document field:', error);
    toast.error(error.response?.data?.message || "Failed to approve document");
    throw error;
  } finally {
    setLoading(false);
  }
};

// Reject a specific document field
const rejectVendorDocumentField = async (documentId, field, rejectReason) => {
  try {
    setLoading(true);
   

    const response = await axios.patch(
      `${URL}/vendor-document/rejectVendorDocumentField/${documentId}`,
      { field, rejectReason }
    );
    
    // Update local state immediately
    setDocuments(prevDocs => {
      return prevDocs.map(doc => {
        if (doc._id === documentId) {
          return {
            ...doc,
            [field]: "2", // Set status to rejected
            rejectReasons: {
              ...doc.rejectReasons,
              [field]: rejectReason // Set rejection reason
            }
          };
        }
        return doc;
      });
    });

    toast.success("Document field rejected successfully");
    return response.data;
  } catch (error) {
    console.error('Error rejecting document field:', error);
    toast.error(error.response?.data?.message || "Failed to reject document");
    throw error;
  } finally {
    setLoading(false);
  }
};

  //admin blog
  const adminBlog = async (page, limit) => {
    try {
      const { data } = await axios.get(
        `${URL}/admin-blog/getadminblog?page=${page}&limit=${limit}`,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );
      if (data.success === 1) {
        setBlog(data.details);
        setBlogLength(data.pages);
        console.log(data.details);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //search blog
  const searchBlog = async (q) => {
    try {
      const { data } = await axios.get(`${URL}/admin-blog/search-blog?${q}`, {
        headers: {
          token: tokenS.token,
        },
      });
      if (data.success === 1) {
        setBlogSearch(data.details);
      }
    } catch (error) {
      console.log(error);
    }
  };

// Get all food vendors
const [foodVendors, setFoodVendors] = useState([]);
const [foodVendorLength, setFoodVendorLength] = useState(0);

  // Context/Context.js mein getAllFoodVendors function ko update karein

const getAllFoodVendors = async (filters = globalFilters, page = 1, limit = 10, status = 'all') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    // ALWAYS apply global filters - yeh important hai
    if (filters.country && filters.country.trim() !== '') {
      queryParams.append('country', filters.country.trim());
    }
    if (filters.state && filters.state.trim() !== '') {
      queryParams.append('state', filters.state.trim());
    }
    if (filters.city && filters.city.trim() !== '') {
      queryParams.append('city', filters.city.trim());
    }

    // Status filter
    if (status !== 'all') {
      queryParams.append('status', status);
    }

    console.log("🍕 Fetching food vendors with filters:", filters, "Page:", page);

    const { data } = await axios.get(
      `${URL}/admin-food/FoodVendors?${queryParams}`,
      {
        headers: {
          token: tokenS.token,
        },
      }
    );
    
    console.log("✅ Food vendors API response:", {
      success: data.success,
      count: data.details?.length,
      totalLength: data.totalLength,
      appliedFilters: data.appliedFilters
    });

    if (data.success === 1) {
      setFoodVendors(data.details || []);
      setFoodVendorLength(data.totalLength || 0);
      console.log(`✅ Food vendors fetched: ${data.details?.length || 0} found`);
    } else {
      console.warn("⚠️ Food vendors API returned success=0");
      setFoodVendors([]);
      setFoodVendorLength(0);
    }
  } catch (error) {
    console.error("❌ Error fetching food vendors:", error.message);
    setFoodVendors([]);
    setFoodVendorLength(0);
  }
};


  
  // Toggle food vendor status
  const toggleFoodVendorStatus = async (vendorId) => {
    try {
      const { data } = await axios.put(
        `${URL}/admin-vendor-all/active/${vendorId}`,
        {},
        {
          headers: {
            token: tokenS.token,
          },
        }
      );
  
      if (data.success === 1) {
        // Remove vendor from list if disabled
        if (!data.details.isActive) {
          setFoodVendors((prev) =>
            prev.filter((vendor) => vendor._id !== vendorId)
          );
        } else {
          // Optionally, fetch again or show a toast that status is active
          getAllFoodVendors(); // only if re-fetching is needed
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error toggling vendor status", error);
      return false;
    }
  };
  // Get all disabled/inactive food vendors
  const [inactiveFoodVendors, setInactiveFoodVendors] = useState([]);
  const [inactiveFoodLength, setInactiveFoodLength] = useState(0);
  
  const getInactiveFoodVendors = async (page = 1, limit = 10) => {
    try {
      const { data } = await axios.get(
        `${URL}/admin-food/inactivefood?page=${page}&limit=${limit}`,
       
      );
      if (data.success === 1) {
        setInactiveFoodVendors(data.details);
        setInactiveFoodLength(data.pages);
      }
    } catch (error) {
      console.error("Error fetching inactive food vendors", error);
    }
  };
  // Search food vendors
  const searchFoodVendors = async (query, page = 1, limit = 10) => {
    try {
      const { data } = await axios.get(
        `${URL}/admin-food/search?q=${query}&page=${page}&limit=${limit}`,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );
      if (data.success === 1) {
        setFoodVendors(data.details);
        setFoodVendorLength(data.pages);
      }
    } catch (error) {
      console.error("Error searching food vendors", error);
    }
  };

  //create blog
  // const [createBlog, setCreateBlog] = useState("");

  const addBlog = async (value) => {
    try {
      console.log(value);
      const { data } = await axios.post(
        `${URL}/admin-blog/create-blog`,
        value,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );

      if (data.success === 1) {
        console.log(data);
        sessionStorage.setItem("blog", JSON.stringify(data._id));
        toast.success("successfully");
      } else {
        toast.error("Unauthorized");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addSubheading = async (value) => {
    try {
      const mainFormId = JSON.parse(sessionStorage.getItem("blog"));

      console.log("Retrieved mainFormId:", mainFormId); // Check the value of mainFormId

      const requestData = { ...value, mainFormId: mainFormId };

      const { data } = await axios.post(
        `${URL}/admin-blog/add-subheading`,
        requestData,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );
      console.log(data);
      if (data.success === 1) {
        toast.success("successfully");
      } else {
        toast.error("Unauthorized");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //get particular blog
  const [particularBlog, setParticularBlog] = useState([]);

  const partBlog = async (id) => {
    try {
      const { data } = await axios.get(`${URL}/admin-blog/get-blog/${id}`, {
        headers: {
          token: tokenS.token,
        },
      });
      if (data.success === 1) {
        sessionStorage.setItem("parBlog", JSON.stringify(data.details._id));
        setParticularBlog(data.details);
        console.log(data.details);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //update subheading
  const updateSub = async (value, id) => {
    try {
      const mainFormId = JSON.parse(sessionStorage.getItem("parBlog"));
      console.log(value);

      const reqData = { ...value, mainFormId };

      const { data } = await axios.patch(
        `${URL}/admin-blog/update-subheading/${id}`,
        reqData,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );

      if (data.success === 1) {
        toast.success("successfully");
      } else {
        toast.error("Unauthorized");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // add subheading when update
  const addSubheadingUpdate = async (value) => {
    try {
      const mainFormId = JSON.parse(sessionStorage.getItem("parBlog"));

      console.log("Retrieved mainFormId:", mainFormId); // Check the value of mainFormId

      const requestData = { ...value, mainFormId: mainFormId };

      const { data } = await axios.post(
        `${URL}/admin-blog/add-subheading`,
        requestData,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );
      console.log(data);
      if (data.success === 1) {
        toast.success("successfully");
      } else {
        toast.error("Unauthorized");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //delete subheading
  const deleteSub = async (mainFormId, subheadingId) => {
    try {
      const { data } = await axios.delete(
        `${URL}/admin-blog/remove/${mainFormId}/${subheadingId}`,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );

      if (data.success === 1) {
        toast.success("successfully");
      } else {
        toast.error("Unauthorized");
      }
    } catch (error) {
      console.log(error);
    }
  };

//update mainform
const mainform = async (value, id) => {
  try {
    const formData = new FormData();
    
    // Append all fields to formData
    formData.append('title', value.title);
    formData.append('description', value.description);
    formData.append('conclusion', value.conclusion);
    formData.append('created_by', value.created_by);
    formData.append('type', value.type);
    
    // Only append the image if it's a File object (new image selected)
    if (value.blogimage instanceof File) {
      formData.append('blogimage', value.blogimage);
    } else if (typeof value.blogimage === 'string') {
      // If it's a string (existing image path), send it as is
      formData.append('blogimagePath', value.blogimage);
    }

    await axios.patch(`${URL}/admin-blog/update-blog/${id}`, formData, {
      headers: {
        'token': tokenS.token,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    toast.success("Blog updated successfully");
  } catch (error) {
    console.log(error);
    toast.error("Error updating blog");
  }
};

const [vendorstats, setVendorstatus] = useState([]);
const [isDisableUser, setIsDisable] = useState(false);
const vendorStatus = async (id) => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.put(
      `${URL}/admin-vendor-all/active/${id}`,
      {}, // No body required for toggle
      {
        headers: {
          token: tokenS.token,
        },
      }
    );

    if (response.data.success) {
      setVendorstatus(response.data.details);
      setIsDisable((prev) => !prev); // Toggle the frontend state
    } else {
      setError(response.data.message || "Error in API");
    }
  } catch (error) {
    setError(error.message || "An error occurred");
  } finally {
    setLoading(false);
  }
};
  //get getPharmacist     
  const [pharmacy, setPharmacy] = useState([]);
  const [pharmacyLength, setPharmacyLength] = useState(0);
   const getPharmacist = async (filters = globalFilters, page = 1, limit = 10) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.city) queryParams.append('city', filters.city);

      const { data } = await axios.get(
        `${URL}/admin-pharmacy-all/vendors?${queryParams}`,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );
      if (data.success === 1) {
        setPharmacy(data.details);
        setPharmacyLength(data.pages);
      }
    } catch (error) {
      console.log(error);
    }
  };


  //get all active users
  const [users, setUsers] = useState([]);
  const [userLength, setUserLength] = useState(0);
  const getallusers = async (page, limit) => {
    try {
      const { data } = await axios.get(
        `${URL}/admin-user/active?page=${page}&limit=${limit}`,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );
      if (data.success === 1) {
        setUsers(data.details);
        setUserLength(data.pages);
      }
    } catch (error) {
      console.log(error);
    }
  };

     
  const [firstuser,setfirstuser] = useState([]);
  const [error,seterror] = useState(null);
  const getfirstuser = async () => {
    try {
      const response = await axios.get(`${URL}/admin-user/firstlogin`, {
        headers: {
          token: tokenS.token,
        },
      });
      if (response.data.success) {
        console.log(response.data.details); // Debug response details
        setfirstuser(response.data.details);
      } else {
        seterror(response.data.message);
      }
    } catch (error) {
      seterror(error.message);
    }
  };
  
useEffect(()=>{
  getfirstuser();
  
},[])

  //get inactive user
  const [inactiveUser, setInactiveUser] = useState([]);
  const [inactivelength, setInactivelength] = useState(0);
  const getinactiveUser = async (page, limit) => {
    try {
      const { data } = await axios.get(
        `${URL}/admin-user/inactive?page=${page}&limit=${limit}`,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );
      if (data.success === 1) {
        setInactiveUser(data.details);
        setInactivelength(data.pages);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // endpoint:admin-vendor-all/inActivlabs      `${URL}/admin-vendor-all/inActivlabs?page=${page}&limit=${limit}`
 // get all inactive labs
const [inactivelabs, setinactivelabs] = useState([]);
const [inactivelengths, setinactivelengths ] = useState([])
const getinactivelabs = async (page, limit) => {
  try {
    const { data } = await axios.get(
      `${URL}/admin-vendor-all/inActivlabs?page=${page}&limit=${limit}`,
      {
        headers: {
          token: tokenS.token, // Use your token
        },
      }
    );
    if (data.success === 1) {
     
      setinactivelabs(data.details);
      setinactivelengths(data.pages);
   
    } else {
      console.error("API Error:", data.message);
    }
  } catch (error) {
    console.error("Error in API call:", error.message);
  }
};



const [inActivePharmacy, setinActivePharmacy] = useState([]);

const fetchinactivepharmacy = async (page, limit) => {
  try {
      const { data } = await axios.get(
          `${URL}/admin-pharmacy-all/inActivePharmacy?page=${page}&limit=${limit}`,
          {
              headers: {
                  token: tokenS.token,
              },
          }
      );

      console.log("API Response:", data); // Ensure this logs the response
      if (data.success === 1) {
          setinActivePharmacy(data.details); // Update state
          setPharmacyLength(data.pages); // Update pagination length
      } else {
          console.log("API Error:", data.message);
      }
  } catch (error) {
      console.error("API Call Failed:", error.message);
  }
};


  //get all user list
  const [userList, setUserList] = useState([]);

const userS = async (filters = globalFilters, page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    // ALWAYS apply global filters
    if (filters.country && filters.country.trim() !== '') {
      queryParams.append('country', filters.country.trim());
    }
    if (filters.state && filters.state.trim() !== '') {
      queryParams.append('state', filters.state.trim());
    }
    if (filters.city && filters.city.trim() !== '') {
      queryParams.append('city', filters.city.trim());
    }

    console.log("👥 Frontend: Fetching users with filters:", filters, "Page:", page);

    const { data } = await axios.get(`${URL}/admin-user/all?${queryParams}`, {
      headers: {
        token: tokenS.token,
      },
    });
    
    console.log("✅ Users API response:", {
      success: data.success,
      count: data.data?.users?.length,
      totalUsers: data.data?.pagination?.totalUsers,
      appliedFilters: data.appliedFilters
    });

    if (data.success === 1) {
      setUserList(data.data?.users || []);
      setUserLength(data.data?.pagination?.totalPages || 1);
      console.log(`✅ Users fetched: ${data.data?.users?.length || 0} found`);
    } else {
      console.warn("⚠️ Users API returned success=0");
      setUserList([]);
      setUserLength(1);
    }
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    setUserList([]);
    setUserLength(1);
  }
};


  //delete main blog
  const deletemainform = async (id) => {
    try {
      const { data } = await axios.delete(
        `${URL}/admin-blog/delete-blog/${id}`,
        {
          headers: {
            token: tokenS.token,
          },
        }
      );

      if (data.success === 1) {
        toast.success("Blog removed successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };


  const [doctorStats, setDoctorStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState(null);

  // Fetch doctor stats
  const fetchDoctorStats = async (filters = globalFilters) => {
  setLoading(true);
  setError(null);
  try {
    const queryParams = new URLSearchParams();
    
    // ✅ Add global filters to query params
    if (filters.country && filters.country.trim() !== '') {
      queryParams.append('country', filters.country.trim());
    }
    if (filters.state && filters.state.trim() !== '') {
      queryParams.append('state', filters.state.trim());
    }
    if (filters.city && filters.city.trim() !== '') {
      queryParams.append('city', filters.city.trim());
    }

    const queryString = queryParams.toString();
    const apiUrl = `${URL}/qualification/getDoctorStats${queryString ? `?${queryString}` : ''}`;

    console.log("📊 Fetching doctor stats with filters:", filters);

    const response = await axios.get(apiUrl);
    
    console.log("✅ Doctor stats API response:", {
      success: response.data.success,
      statsCount: response.data.details?.length,
      totalDoctors: response.data.totalDoctors,
      appliedFilters: response.data.appliedFilters
    });

    if (response.data.success) {
      setDoctorStats(response.data.details || []);
      console.log(`📈 Doctor stats updated: ${response.data.totalDoctors} total doctors with current filters`);
    } else {
      setError(response.data.message || "Failed to fetch doctor stats");
      console.warn("⚠️ Doctor stats API returned success=0");
    }
  } catch (err) {
    console.error("❌ Error fetching doctor stats:", err.message);
    setError(err.message || "An error occurred");
  } finally {
    setLoading(false);
  }
};

  // fetch user stats   fetchuserstats userstats  send to dashboard
const [userstats, setuserstats] = useState([]);

const fetchuserstats = async (filters = globalFilters) => {
  setLoading(true);
  setError(null);
  try {
    const queryParams = new URLSearchParams();
    
    // ✅ Add global filters to query params
    if (filters.country && filters.country.trim() !== '') {
      queryParams.append('country', filters.country.trim());
    }
    if (filters.state && filters.state.trim() !== '') {
      queryParams.append('state', filters.state.trim());
    }
    if (filters.city && filters.city.trim() !== '') {
      queryParams.append('city', filters.city.trim());
    }

    const queryString = queryParams.toString();
    const apiUrl = `${URL}/admin-user/allusersdata${queryString ? `?${queryString}` : ''}`;

    console.log("📊 Fetching user stats with filters:", filters);

    const response = await axios.get(apiUrl, {
      headers: {
        token: tokenS.token,
      }
    });
    
    console.log("✅ User stats API response:", {
      success: response.data.success,
      statsCount: response.data.details?.length,
      totalUsers: response.data.totalUsers,
      appliedFilters: response.data.appliedFilters
    });

    if (response.data.success) {
      setuserstats(response.data.details || []);
      console.log(`📈 User stats updated: ${response.data.totalUsers} total users with current filters`);
    } else {
      setError(response.data.message || "Failed to fetch user stats");
      console.warn("⚠️ User stats API returned success=0");
    }
  } catch (error) {
    console.error("❌ Error fetching user stats:", error.message);
    setError(error.message || "An error occurred");
  } finally {
    setLoading(false);
  }
};

// fetch vendor-lab 
// get data of labs last 12 months  labstats fetchlabstats
const [labstats,setlabstats] = useState([]);
const fetchlabstats = async (filters = globalFilters) => {
  setLoading(true);
  setError(null);

  try {
    const queryParams = new URLSearchParams();
    
    // ✅ Add global filters to query params
    if (filters.country && filters.country.trim() !== '') {
      queryParams.append('country', filters.country.trim());
    }
    if (filters.state && filters.state.trim() !== '') {
      queryParams.append('state', filters.state.trim());
    }
    if (filters.city && filters.city.trim() !== '') {
      queryParams.append('city', filters.city.trim());
    }

    const queryString = queryParams.toString();
    const apiUrl = `${URL}/admin-vendor-all/getlabstats${queryString ? `?${queryString}` : ''}`;

    console.log("📊 Fetching lab stats with filters:", filters);

    const response = await axios.get(apiUrl, {
      headers: {
        token: tokenS.token,
      },
    });

    console.log("✅ Lab stats API response:", {
      success: response.data.success,
      statsCount: response.data.data?.length,
      totalLabs: response.data.totalLabs,
      appliedFilters: response.data.appliedFilters
    });

    if (response.data.success) {
      setlabstats(response.data.data || []);
      console.log(`📈 Lab stats updated: ${response.data.totalLabs} total labs with current filters`);
    } else {
      setError(response.data.message || "Failed to fetch lab stats");
      console.warn("⚠️ Lab stats API returned success=0");
    }
  } catch (error) {
    console.error("❌ Error fetching lab stats:", error.message);
    setError(error.message || "An error occurred");
  } finally {
    setLoading(false);
  }
};

// fetch vendor-pharmacystats
//get data of 12 month 
// export = pharmacystats fetchpharmacystats
const [pharmacystats, setpharmacystats] = useState([]);
const fetchpharmacystats = async (filters = globalFilters) => {
  setLoading(true)
  setError(null);
  try {
    const queryParams = new URLSearchParams();
    
    // ✅ Add global filters to query params
    if (filters.country && filters.country.trim() !== '') {
      queryParams.append('country', filters.country.trim());
    }
    if (filters.state && filters.state.trim() !== '') {
      queryParams.append('state', filters.state.trim());
    }
    if (filters.city && filters.city.trim() !== '') {
      queryParams.append('city', filters.city.trim());
    }

    const queryString = queryParams.toString();
    const apiUrl = `${URL}/admin-pharmacy-all/getpharmacystats${queryString ? `?${queryString}` : ''}`;

    console.log("📊 Fetching pharmacy stats with filters:", filters);

    const response = await axios.get(apiUrl, {
      headers: {
        token: tokenS.token
      }
    });

    console.log("✅ Pharmacy stats API response:", {
      success: response.data.success,
      statsCount: response.data.details?.length,
      totalPharmacies: response.data.totalPharmacies,
      appliedFilters: response.data.appliedFilters
    });

    if(response.data.success){
        setpharmacystats(response.data.details || []);
        console.log(`📈 Pharmacy stats updated: ${response.data.totalPharmacies} total pharmacies with current filters`);
    } else{
      setError(response.data.message || "Error in pharmacy stats API");
      console.warn("⚠️ Pharmacy stats API returned success=0");
    }
  } catch (error) {
    console.error("❌ Error fetching pharmacy stats:", error.message);
    setError(error.message || "An error occurred while fetching pharmacy stats");
  } finally{
    setLoading(false)
  }
}

// Fetch food vendor stats - get data for last 12 months
const fetchfoodstats = async (filters = globalFilters) => {
  setLoading(true);
  setError(null);
  try {
    const queryParams = new URLSearchParams();
    
    // ✅ Add global filters to query params
    if (filters.country && filters.country.trim() !== '') {
      queryParams.append('country', filters.country.trim());
    }
    if (filters.state && filters.state.trim() !== '') {
      queryParams.append('state', filters.state.trim());
    }
    if (filters.city && filters.city.trim() !== '') {
      queryParams.append('city', filters.city.trim());
    }

    const queryString = queryParams.toString();
    const apiUrl = `${URL}/admin-food/getfoodstatus${queryString ? `?${queryString}` : ''}`;

    console.log("🍕 Fetching food stats with filters:", filters);

    const response = await axios.get(apiUrl, {
      headers: { 
        token: tokenS.token 
      }
    });
    
    console.log("✅ Food stats API response:", {
      success: response.data.success,
      statsCount: response.data.data?.length,
      totalFoodVendors: response.data.totalFoodVendors,
      appliedFilters: response.data.appliedFilters
    });

    if (response.data.success) {
      setFoodstats(response.data.data || []);
      console.log(`📈 Food stats updated: ${response.data.totalFoodVendors} total food vendors with current filters`);
    } else {
      setError(response.data.message || "Failed to fetch food vendor stats");
      console.warn("⚠️ Food stats API returned success=0");
    }
  } catch (err) {
    console.error("❌ Error fetching food stats:", err.message);
    setError(err.message || "Failed to load food vendor data");
    setFoodstats([]);
  } finally {
    setLoading(false);
  }
};




// Add food category
  const addFoodCategory = async (formData) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/admin-food/addCategory', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message);
      return res.data;
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
      return { success: 0, message: err.message };
    } finally {
      setLoading(false);
    }
  };
// **************************************************************************




// in this we give id and get the docuemtns details accoridng to that id 
const [DoctorDocument,setDoctorDocument] = useState("")
// get doctor documents
const getDoctorDocuments = async (id) => {
  console.log("Starting getDoctorDocuments with id:", id);
  if (!tokenS?.token) {
    console.error("Token not found for documents!");
    return null;
  }

  try {
    const { data } = await axios.get(
      `${URL}/doctorAccess/getDocumentByDoctorId/${id}`,
      {
        headers: { token: tokenS.token },
      }
    );

    console.log("getDoctorDocuments API response:", data);

    if (data.success === 1) {
      return { success: true, data: data.data };
    } else {
      console.error("Failed to fetch documents: API returned success=0");
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("getDoctorDocuments error:", error.message);
    return { success: false, message: error.message };
  }
};

// Updated rejectDoctorDocument in Context
const rejectDoctorDocument = async (documentId, fieldName, rejectReason) => {
  try {
    setLoading(true);
    const response = await axios.patch(
      `${URL}/doctorAccess/rejectDocumentField/${documentId}`,
      {
        field: fieldName,
        rejectReason: rejectReason || "Document rejected by admin"
      },
      {
        headers: {
          token: tokenS.token
        },
      }
    );
    
    if (response.data.success === 1) {
      toast.success(response.data.message || "Document rejected successfully");
      return { success: true, message: response.data.message, data: response.data };
    } else {
      toast.error(response.data.message || "Failed to reject document");
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error rejecting document:", error);
    toast.error(error.response?.data?.message || error.message || "Failed to reject document");
    return { 
      success: false, 
      message: error.response?.data?.message || error.message 
    };
  } finally {
    setLoading(false);
  }
};

// Updated approveDoctorDocument in Context
const approveDoctorDocument = async (documentId, fieldName) => {
  try {
    setLoading(true);
    const response = await axios.patch(
      `${URL}/doctorAccess/approveDocumentField/${documentId}`,
      {
        field: fieldName
      },
      {
        headers: {
          token: tokenS.token
        },
      }
    );
    
    if (response.data.success === 1) {
      toast.success(response.data.message || "Document approved successfully");
      return { success: true, message: response.data.message, data: response.data };
    } else {
      toast.error(response.data.message || "Failed to approve document");
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error approving document:", error);
    toast.error(error.response?.data?.message || error.message || "Failed to approve document");
    return { 
      success: false, 
      message: error.response?.data?.message || error.message 
    };
  } finally {
    setLoading(false);
  }
};

const [doctorCoupon, setDoctorCoupon] = useState([]);
const getDoctorCoupon = async (id) => {
  console.log("Calling getDoctorCoupon with doctor ID:", id);

 

  try {
    const { data } = await axios.get(
      `${URL}/doctorAccess/getCouponsByDoctorId?id=${id}`,
   
    );

    console.log("getDoctorCoupon response:", data);

    if (data.success === 1) {
      setDoctorCoupon(data.details || []);
      return data.details || [];
    } else {
      console.warn("No coupons found in response.");
      toast.warning(data.message || "No coupons found");
      setDoctorCoupon([]);
      return [];
    }
  } catch (error) {
    console.error("getDoctorCoupon error:", error.message);
    toast.error(error.response?.data?.message || "Failed to fetch coupons");
    setDoctorCoupon([]);
    return [];
  }
};




  ///// Approve Doctor//////
  const [ApproveDoctorAccount, setApproveDoctorAccount] = useState("");
 
  const getApproveDoctorAccount = async (id) => {
    if (!id) {
      console.error("Doctor ID is required");
      toast.error("Doctor ID is missing");
      return { success: false, message: "Doctor ID is missing" };
    }
 
    try {
      setLoading(true);
      console.log("Making API call to approve doctor:", id);
 
      // ✅ FIXED: Backend expects route parameter, so use this format
      const response = await axios.patch(
        `${URL}/doctorAccess/verifyDoctorAccount/${id}`,  // Route parameter format
        {}, // Empty body since we're using route params
        {
          headers: {
            token: tokenS.token
          },
        }
      );
 
      console.log("API Response:", response.data);
      setApproveDoctorAccount(response.data);
 
      toast.success(response.data.message || "Doctor account approved successfully.");
 
      return {
        success: true,
        message: response.data.message,
        data: response.data
      };
    } catch (error) {
      console.error("Error verifying doctor account:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to verify doctor account.";
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message
      };
    } finally {
      setLoading(false);
    }
  };
  ///////// Reject Doctor  /////
  const [RejectDoctorAccount, setRejectDoctorAccount] = useState("");
 
  const getRejectDoctorAccount = async (id, reason) => {
    console.log("getRejectDoctorAccount called with:", { id, reason });
 
    if (!id) {
      console.error("Doctor ID is required");
      toast.error("Doctor ID is missing");
      return { success: false, message: "Doctor ID is missing" };
    }
 
    if (!reason) {
      console.error("Rejection reason is null or undefined");
      toast.error("Rejection reason is required");
      return { success: false, message: "Rejection reason is required" };
    }
 
    const trimmedReason = reason.trim();
    if (trimmedReason === "") {
      console.error("Rejection reason is empty after trimming");
      toast.error("Rejection reason cannot be empty");
      return { success: false, message: "Rejection reason cannot be empty" };
    }
 
    try {
      setLoading(true);
      console.log("Sending PATCH to reject doctor with:", { id, rejectReason: trimmedReason });
 
      // ✅ FIXED: Backend expects route parameter + body for rejectReason
      const response = await axios.patch(
        `${URL}/doctorAccess/rejectDoctorAccount/${id}`,  // Route parameter format
        {
          rejectReason: trimmedReason  // Send in request body
        },
        {
          headers: {
            token: tokenS.token
          },
        }
      );
 
      console.log("Reject API Response:", response.data);
      setRejectDoctorAccount(response.data);
 
      if (response.data.success) {
        toast.success(response.data.message || "Doctor account rejected successfully.");
        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
        };
      } else {
        toast.error(response.data.message || "Failed to reject doctor account.");
        return {
          success: false,
          message: response.data.message,
        };
      }
    } catch (error) {
      console.error("Error rejecting doctor account:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to reject doctor account.";
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message,
      };
    } finally {
      setLoading(false);
    }
  };
 
  // Approve All Documents
  const approveAllDocuments = async (documentId) => {
    try {
      setLoading(true);
      const documentFields = [
        'panCard',
        'aadharCard', 
        'drivingLicence',
        'doctorCertificate',
        'licenceNo',
        'accreditation',
        'registrationNo'
      ];

      const promises = documentFields.map(field => 
        approveDoctorDocument(documentId, field)
      );

      await Promise.all(promises);
      toast.success("All documents approved successfully");
      
      // Refresh the documents
      if (doctor && doctor.length > 0) {
        await getDoctorDocuments(doctor[0]._id);
      }
    } catch (error) {
      console.error("Error approving all documents:", error);
      toast.error("Error approving all documents");
    } finally {
      setLoading(false);
    }
  };

    // Reject All Documents
  const rejectAllDocuments = async (documentId, rejectReason = "All documents rejected by admin") => {
    try {
      setLoading(true);
      const documentFields = [
        'panCard',
        'aadharCard', 
        'drivingLicence',
        'doctorCertificate',
        'licenceNo',
        'accreditation',
        'registrationNo'
      ];

      const promises = documentFields.map(field => 
        rejectDoctorDocument(documentId, field, rejectReason)
      );

      await Promise.all(promises);
      toast.success("All documents rejected successfully");
      
      // Refresh the documents
      if (doctor && doctor.length > 0) {
        await getDoctorDocuments(doctor[0]._id);
      }
    } catch (error) {
      console.error("Error rejecting all documents:", error);
      toast.error("Error rejecting all documents");
    } finally {
      setLoading(false);
    }
  };
  /////// Doctor Coupon  Start ////////


/////// Medicines Start  ///////
const [Medicines, setMedicines] = useState([]);

const getMedicines = async () => {
  console.log("Starting getMedicines...");
  if (!tokenS?.token) {
    console.error("Token not found!");
    setMedicines([]);
    return;
  }
  try {
    const { data } = await axios.get(`${URL}/admin-medicine/get-all-medicine`, {
      headers: { token: tokenS.token },
    });
    console.log("getMedicines API response:", data);
    if (data.success === 1) {
      setMedicines(data.details); 
      console.log("Medicines set:", data.details);
    } else {
      setMedicines([]);
      console.warn("No medicines found or API success=0");
    }
  } catch (error) {
    console.error("getMedicines error:", error.message); // Fixed console message
    setMedicines([]);
  }
};

  const updateMedicine = async (medicineId, medicineData) => {
    try {
      const response = await axios.patch(
        `${URL}/admin-medicine/update-medicine?Id=${medicineId}`,
        medicineData,
        {
          headers: { token: tokenS.token },
        }
      );
      
      if (response.status === 200) {
        toast.success("Medicine updated successfully!");
        return {
          success: true,
          data: response.data,
          message: "Medicine updated successfully"
        };
      }
    } catch (error) {
      console.error("Error updating medicine:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to update medicine";
      
      toast.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  };

  // Function to delete a single medicine by its ID
const deleteMedicineAdmin = async (medicineId) => {
  try {
    // Send a DELETE request to the server endpoint
    const response = await axios.delete(
      `${URL}/admin-medicine/delete-medicine/${medicineId}`,
      {
        headers: { token: tokenS.token }, // Include the auth token
      }
    );

    // Check if the API call was successful
    if (response.data.success === 1) {
      toast.success("Medicine deleted successfully!");
      // After successful deletion, refresh the medicine list to update the UI
      getMedicines(); 
      return { success: true, message: "Medicine deleted successfully." };
    } else {
      // Handle cases where the API returns a failure message
      toast.error(response.data.message || "Failed to delete medicine.");
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error deleting medicine:", error);
    
    // Extract and display a user-friendly error message
    const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
    toast.error(errorMessage);
    
    return { success: false, message: errorMessage };
  }
};

// --- NEW ---
// Function to delete multiple medicines based on an array of IDs
const deleteMultipleMedicinesAdmin = async (medicineIds) => {
  // Validate that there are IDs to delete
  if (!medicineIds || medicineIds.length === 0) {
    toast.warn("Please select medicines to delete.");
    return { success: false, message: "No medicine IDs provided." };
  }

  try {
    // Send a DELETE request with the array of IDs in the request body
    const response = await axios.delete(
      `${URL}/admin-medicine/delete-multiple-medicines`,
      {
        headers: { token: tokenS.token },
        // For axios.delete, the body must be nested inside a 'data' property
        data: { ids: medicineIds },
      }
    );

    if (response.data.success === 1) {
      toast.success(response.data.message || "Medicines deleted successfully!");
      // Refresh the medicine list to reflect the changes
      getMedicines();
      return { success: true, message: response.data.message };
    } else {
      toast.error(response.data.message || "Failed to delete selected medicines.");
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error deleting multiple medicines:", error);

    const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
    toast.error(errorMessage);

    return { success: false, message: errorMessage };
  }
};
const [pendingMedicines, setPendingMedicines] = useState([]);
const getPendingMedicines = async () => {
  console.log("Starting getPendingMedicines...");
  
  if (!tokenS?.token) {
    console.error("Token not found!");
    setPendingMedicines([]);
    return;
  }

  try {
    const { data } = await axios.get(`${URL}/admin-medicine/pending-medicine`, {
      headers: { token: tokenS.token },
    });

    console.log("getPendingMedicines API response:", data);

    if (data.success === 1) {
      setPendingMedicines(data.details);
      console.log("Pending medicines set:", data.details);
    } else {
      setPendingMedicines([]);
      console.warn("API success=0 OR no pending medicines found");
    }
  } catch (error) {
    console.error("getPendingMedicines error:", error.message);
    setPendingMedicines([]);
  }
};
const approveMedicine = async (id) => {
  console.log("Starting approveMedicine for ID:", id);

  if (!tokenS?.token) {
    console.error("Token not found!");
    return;
  }

  try {
    const { data } = await axios.patch(
      `${URL}/admin-medicine/approve-medicine/${id}`,
      {},
      {
        headers: { token: tokenS.token },
      }
    );

    console.log("approveMedicine API response:", data);

    if (data.success === 1) {
      console.log("Medicine approved successfully:", data.details);

      // Optional: Refresh pending list
      getPendingMedicines(); 
    } else {
      console.warn("Failed to approve medicine. success=0");
    }
  } catch (error) {
    console.error("approveMedicine error:", error.message);
  }
};
const rejectMedicine = async (id) => {
  console.log("Starting rejectMedicine for ID:", id);

  if (!tokenS?.token) {
    console.error("Token not found!");
    return;
  }

  try {
    const { data } = await axios.patch(
      `${URL}/admin-medicine/reject-medicine/${id}`,
      {},
      {
        headers: { token: tokenS.token },
      }
    );

    console.log("rejectMedicine API response:", data);

    if (data.success === 1) {
      console.log("Medicine rejected successfully:", data.details);

      // Optional: Refresh pending list
      getPendingMedicines();
    } else {
      console.warn("Failed to reject medicine. success=0");
    }
  } catch (error) {
    console.error("rejectMedicine error:", error.message);
  }
};









  // ******** Create Specialist Doctor *******
    const [specialists, setSpecialists] = useState('');

  const createSpecialist = async (specialistData) => {
      setLoading(true);
     
      const formData = new FormData();
      formData.append('specialists', specialistData.name); // Key: 'specialists' (from req.body)
     
      // 2. Append the file if it exists
      if (specialistData.imageFile) {
          // Key: 'specialistImage' (MUST match the multer field name in your route: upload.single('specialistImage'))
          formData.append('specialistImage', specialistData.imageFile);
      }
     
      try {
        const response = await axios.post(
          `${URL}/specialists/create`,
          formData, // Send the FormData object
          {
            headers: {
              token: tokenS.token,
              // 3. IMPORTANT: Axios automatically sets the correct Content-Type: multipart/form-data
              // when sending a FormData object, so we don't need to manually set it.
            },
          }
        );
   
        if (response.data.success === 1) {
          toast.success(response.data.message || "Specialist created successfully!");
   
          return {
            success: true,
            data: response.data
          };
        } else {
          toast.error(response.data.message || "Failed to create specialist");
          return {
            success: false,
            message: response.data.message
          };
        }
      } catch (error) {
        // Handle the case where API returns 'error.message' as string
        let errorMessage = "Something went wrong";
   
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message === 'error.message'
            ? "An error occurred while creating specialist"
            : error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
   
        toast.error(errorMessage);
        console.error("Create specialist error:", error);
        return {
          success: false,
          message: errorMessage
        };
      } finally {
        setLoading(false);
      }
    };

    // ******** Create Specialist Doctor End*******

   // ********** Add Food Category API *******
    const addCategory = async (categoryData) => {
        try {
            const formData = new FormData();
            formData.append('name', categoryData.name);
            formData.append('category', categoryData.category);
            
            // Append image file if provided
            if (categoryData.foodImage) {
                formData.append('foodImage', categoryData.foodImage);
            }

            const response = await axios.post(
                `${URL}/admin-food/addCategory`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        ...(tokenS && { 'Authorization': `Bearer ${tokenS.token}` })
                    }
                }
            );

            if (response.data.success === 1) {
                toast.success(response.data.message || 'Category created successfully');
                return { success: true, data: response.data };
            } else {
                toast.error(response.data.message || 'Failed to create category');
                return { success: false, message: response.data.message };
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Network error occurred';
            toast.error(errorMessage);
            console.error('Add Category Error:', error);
            return { success: false, message: errorMessage };
        }
    };
    // ********** Add Food Category End *******
    
     // ********** Add Meal *******
    const addMeal = async (mealData) => {
        try {
            // Create FormData to handle file upload
            const formData = new FormData();
            formData.append('name', mealData.name);
            
            if (mealData.image) {
                formData.append('MealImage', mealData.image); 
            }
            
            const response = await axios.post(
                `${URL}/admin-food/addmeal`, // Changed back to lowercase 'addmeal'
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        ...(tokenS && { 'Authorization': `Bearer ${tokenS.token}` })
                    }
                }
            );
            
            if (response.data.success === 1) {
                toast.success(response.data.message || "Meal added successfully!");
                return {
                    success: true,
                    data: response.data.details,
                    message: response.data.message
                };
            } else {
                toast.error(response.data.message || "Failed to add meal");
                return {
                    success: false,
                    message: response.data.message
                };
            }
            
        } catch (error) {
            console.error("Error adding meal:", error);
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            toast.error(errorMessage);
            return {
                success: false,
                message: errorMessage
            };
        }
    };
    
    // Alternative method without file upload (if you only need name)
    const addMealWithoutImage = async (name) => {
        try {
            const response = await axios.post(
                `${URL}/admin-food/addmeal`, 
                { name },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(tokenS && { 'Authorization': `Bearer ${tokenS.token}` })             
                    }
                }
            );
            
            if (response.data.success === 1) {
                toast.success(response.data.message || "Meal added successfully!");
                return {
                    success: true,
                    data: response.data.details,
                    message: response.data.message
                };
            } else {
                toast.error(response.data.message || "Failed to add meal");
                return {
                    success: false,
                    message: response.data.message
                };
            }
            
        } catch (error) {
            console.error("Error adding meal:", error);
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            toast.error(errorMessage);
            return {
                success: false,
                message: errorMessage
            };
        }
    };
    
 // Insurance api Start admin ***************
  const addInsuranceType = async (formData) => {
    try {
      const { data } = await axios.post(
        `${URL}/doctorAccess/addInsuranceType`,
        formData,
        {
          headers: { token: tokenS.token },
 
        }
      );
      toast.success("Insurance added successfully");
      return data;
    } catch (error) {
      console.error("API error:", error);
      toast.error("Failed to add insurance");
    }
  };
  // Insurance api End  ***************
 
  /////////// services preferences state management admin panel ////////////
  // State to manage selected services
  const [selectedServices, setSelectedServices] = useState({
    labVendor: false,
    pharmacy: false,
    user: false,
    foodVendor: false,
    doctor: false,
    fullAccess: false
  });

  // Load saved preferences on initial render
  useEffect(() => {
    const savedServices = localStorage.getItem('selectedServices');
    if (savedServices) {
      setSelectedServices(JSON.parse(savedServices));
    }
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
  }, [selectedServices])



// Medicine Product Excel Function Start//////////////
  // Fetch all products
  const [uploadProgress, setUploadProgress] = useState(0);
  const [products, setProducts] = useState([]);
 
 const fetchAllProducts = useCallback(async () => {
  setLoading(true);
  try {
    const response = await axios.get(
      `${URL}/upload-excel-hospital/get-all-product`,
      {
        headers: { token: tokenS.token },
      }
    );
    if (response.data.success) {
      setProducts(response.data.details);
      toast.success(`${response.data.totalCount} products loaded successfully`);
    } else {
      toast.error(response.data.message || "Failed to fetch products");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch products");
    console.error("Fetch products error:", error);
  } finally {
    setLoading(false);
  }
},); // Add dependencies

const [isUploading, setIsUploading] = useState(false);
 
  // Upload Medicine Excel Function
  const uploadMedicineExcel = async (file) => {
    if (!file) {
      toast.error("Please select a file");
      return { success: false };
    }
 
    try {
      setIsUploading(true);
      const token = JSON.parse(sessionStorage.getItem("admin"))?.token;
 
      if (!token) {
        toast.error("Authorization token missing. Please login again.");
        return { success: false };
      }
 
      const formData = new FormData();
      formData.append("file", file);
 
      const response = await axios.post(
        `${URL}/admin-medicine/upload-medicine-excel`,
        formData,
        {
          headers: { token: tokenS.token },
         
        }
      );
 
      if (response.data.success === 1) {
        toast.success(response.data.message);
        return { success: true, data: response.data };
      } else {
        toast.error(response.data.message || "Upload failed");
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Upload error:", error);
 
      // Detailed error handling
      let errorMsg = "Excel upload failed";
 
      if (error.response) {
        errorMsg =
          error.response.data?.error ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMsg = "No response from server. Check your network connection.";
      } else {
        // Something happened in setting up the request
        errorMsg = error.message || "Request setup error";
      }
 
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsUploading(false);
    }
  };
  // Upload Medicine Excel Function End//////////////////
  const uploadProductExcel = async (file) => {
    if (!file) {
      toast.error("Please select a file");
      return { success: false };
    }
 
    try {
      setIsUploading(true);
      const token = JSON.parse(sessionStorage.getItem("admin"))?.token;
 
      if (!token) {
        toast.error("Authorization token missing. Please login again.");
        return { success: false };
      }
 
      const formData = new FormData();
      formData.append("file", file);
 
      const response = await axios.post(
        `${URL}/upload-excel-hospital/upload-product-excel`,
        formData,
        {
          headers: { token: tokenS.token },
         
        }
      );
 
      if (response.data.success === 1) {
        toast.success(response.data.message);
        return { success: true, data: response.data };
      } else {
        toast.error(response.data.message || "Upload failed");
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Upload error:", error);
 
      // Detailed error handling
      let errorMsg = "Excel upload failed";
 
      if (error.response) {
        errorMsg =
          error.response.data?.error ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMsg = "No response from server. Check your network connection.";
      } else {
        // Something happened in setting up the request
        errorMsg = error.message || "Request setup error";
      }
 
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsUploading(false);
    }
  };
  const updateMedicineProduct = useCallback(async (productId, productData) => {
    setLoading(true); // Use the global loading state for inline edits
    try {
      const response = await axios.put(
        `${URL}/upload-excel-hospital/update-product/${productId}`,
        productData, // The data to update is sent in the request body

      );

      if (response.data.success) {
        toast.success('Product updated successfully!');
        fetchAllProducts(); // Refresh the product list to show the updated data
        return { success: true };
      } else {
        toast.error(response.data.message || 'Failed to update product');
        return { success: false };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred during the update.');
      console.error("Update product error:", error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [fetchAllProducts]);

  const [isDeleting, setIsDeleting] = useState(false); // For loading state on delete
   // NEW: Delete a single medicine
  const deleteMedicine = async (medicineId) => {
    const token = JSON.parse(sessionStorage.getItem("admin"))?.token;
    if (!token) return { success: false };

    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${URL}/admin-medicine/delete-medicine/${medicineId}`,
        {
          headers: { token: token },
        }
      );

      if (response.data.success === 1) {
        toast.success(response.data.message);
        return { success: true };
      } else {
        toast.error(response.data.message || "Delete failed");
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "An error occurred while deleting.";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsDeleting(false);
    }
  };

  // NEW: Delete multiple medicines
  const deleteMultipleMedicines = async (ids) => {
    const token = JSON.parse(sessionStorage.getItem("admin"))?.token;
    if (!token) return { success: false };

    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${URL}/admin-medicine/delete-multiple-medicine`,
        {
          headers: { token: token },
          data: { ids: ids }, // Send IDs in the request body
        }
      );

      if (response.data.success === 1) {
        toast.success(response.data.message);
        return { success: true };
      } else {
        toast.error(response.data.message || "Delete failed");
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "An error occurred during bulk delete.";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete a single product
  const deleteProduct = async (productId) => {
    const token = JSON.parse(sessionStorage.getItem("admin"))?.token;
    if (!token) return { success: false };

    setIsDeleting(true);
    try {
      const response = await axios.delete(`${URL}/upload-excel-hospital/delete-product/${productId}`, {
        headers: { token: token },
      });

      if (response.data.success === 1) {
        toast.success(response.data.message);
        return { success: true };
      } else {
        toast.error(response.data.message || "Failed to delete product.");
        return { success: false };
      }
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error(error.response?.data?.message || "An error occurred during deletion.");
      return { success: false };
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete multiple products
  const deleteMultipleProducts = async (ids) => {
    const token = JSON.parse(sessionStorage.getItem("admin"))?.token;
    if (!token) return { success: false };

    setIsDeleting(true);
    try {
      const response = await axios.delete(`${URL}/upload-excel-hospital/delete-multiple-products`, {
        headers: { token: token },
        data: { ids: ids }, // Send IDs in the request body
      });

      if (response.data.success === 1) {
        toast.success(response.data.message);
        return { success: true };
      } else {
        toast.error(response.data.message || "Failed to delete products.");
        return { success: false };
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error(error.response?.data?.message || "An error occurred during bulk deletion.");
      return { success: false };
    } finally {
      setIsDeleting(false);
    }
  };




 
  // Delivery Charges State
  const [deliveryCharges, setDeliveryCharges] = useState({
    food: null,
    lab: null,
    pharmacy: null
  });
  const [loadingCharges, setLoadingCharges] = useState(false);
  const [chargesError, setChargesError] = useState(null);

  // Fetch all delivery charges
  const fetchDeliveryCharges = async () => {
    setLoadingCharges(true);
    setChargesError(null);
    try {
      const response = await axios.get(`${URL}/admin-delivery-charges/get`, {
        headers: {
          token: tokenS.token,
        }
      });
      if (response.data.success) {
        setDeliveryCharges(response.data.data);
      } else {
        setChargesError(response.data.message || "Failed to fetch delivery charges");
      }
    } catch (error) {
      setChargesError(error.message || "An error occurred");
    } finally {
      setLoadingCharges(false);
    }
  };

  // Update delivery charges
  const updateDeliveryCharges = async (chargesData) => {
  try {
    setLoadingCharges(true);
    setChargesError(null);
    
    
    
    const { data } = await axios.patch(`${URL}/admin-delivery-charges/update`, chargesData, {
      headers: { 
                  token: tokenS.token,
        'Content-Type': 'application/json'
      }
    });

    if (data?.success === 1) {
      setDeliveryCharges(data.data);
      return { success: true, message: "Delivery charges updated successfully" };
    } else {
      throw new Error(data?.message || "Failed to update delivery charges");
    }
  } catch (error) {
    console.error('Update delivery charges error:', error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to update delivery charges";
    setChargesError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setLoadingCharges(false);
  }
};

// Delivery Charges State for Food

const [foodDeliveryCharges, setFoodDeliveryCharges] = useState(null);

// Fetch food delivery charges
const fetchFoodDeliveryCharges = async () => {
  setLoadingCharges(true);
  setChargesError(null);
  try {
    const response = await axios.get(`${URL}/admin-food-delivery-charges/get`, {
      headers: {
        token: tokenS.token,
      }
    });
    console.log("Food Delivery Charges Response:", response.data);
    if (response.data.success) {
      setFoodDeliveryCharges(response.data.data);
    } else {
      setChargesError(response.data.message || "Failed to fetch food delivery charges");
    }
  } catch (error) {
    setChargesError(error.message || "An error occurred while fetching delivery charges");
  } finally {
    setLoadingCharges(false);
  }
};

// Update food delivery charges using PATCH
const updateFoodDeliveryCharges = async (updatedCharges) => {
  setLoadingCharges(true);
  setChargesError(null);
  try {
    const response = await axios.patch(
      `${URL}/admin-food-delivery-charges/update`,
      updatedCharges,
      {
        headers: {
          token: tokenS.token,
        }
      }
    );
    if (response.data.success) {
      setFoodDeliveryCharges(response.data.data); // Update state with new charges
      return { success: true, data: response.data.data };
    } else {
      setChargesError(response.data.message || "Failed to update food delivery charges");
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred while updating delivery charges";
    setChargesError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setLoadingCharges(false);
  }
};
// user food delivery charges calculation function
const calculateFoodDeliveryCharges = async (calculationData) => {
  try {
    const userToken = getUserToken();

    const response = await axios.post(
      `${URL}/admin-food-delivery-charges/calculate`,
      calculationData,
      {
        headers: {
          token: userToken,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response;

    // API returns: success: true
    if (data?.success === true) {
      return data.data;
    } else {
      return {
        error: true,
        message: data?.message || "Failed to calculate delivery charges",
        fallbackUsed: true,
      };
    }
  } catch (error) {
    console.error("Calculate delivery charges error:", error);

    // =============================
    //  SPECIAL HANDLING FOR GOOGLE MAPS ERROR
    // =============================

    const googleError =
      error?.response?.data?.error ||
      error?.response?.data?.data?.error ||
      error?.message;

    if (
      googleError?.includes("REQUEST_DENIED") ||
      googleError?.includes("OVER_QUERY_LIMIT") ||
      googleError?.includes("ZERO_RESULTS") ||
      googleError?.includes("API error")
    ) {
      console.warn("⚠ Google Maps API failed, using fallback straight line distance.");

      return {
        success: false,
        fallbackUsed: true,
        distanceCalculationType: "straight_line",
        message: "Google Maps API failed (fallback used)",
      };
    }

    // Other errors (network, server, invalid data)
    return {
      success: false,
      fallbackUsed: false,
      message: googleError || "Something went wrong",
    };
  }
};
/////////////// for user food delivery charges //////////
const fetchUserFoodDeliveryCharges = async () => {
  setLoadingCharges(true);
  setChargesError(null);
  const userToken = getUserToken();
  try {
    const response = await axios.get(`${URL}/user/food-delivery-charges/get`, {
      headers: {
        token: userToken,
      }
    });
    console.log("......................Food Delivery Charges Response:", response.data);
    if (response.data.success) {
      setFoodDeliveryCharges(response.data.data);
    } else {
      setChargesError(response.data.message || "Failed to fetch food delivery charges");
      // Fallback to default values if API fails
      setFoodDeliveryCharges({
        baseDeliveryCharge: 50,
        freeDeliveryThreshold: 300,
        rapidDeliveryCharge: 100,
        taxPercentage: 2,
        lastUpdated: null
      });
    }
  } catch (error) {
    console.error("Error fetching delivery charges:", error);
    setChargesError(error.message || "An error occurred while fetching delivery charges");
    // Fallback to default values on error
    setFoodDeliveryCharges({
      baseDeliveryCharge: 50,
      freeDeliveryThreshold: 300,
      rapidDeliveryCharge: 100,
      taxPercentage: 2,
      lastUpdated: null
    });
  } finally {
    setLoadingCharges(false);
  }
};


// ===============================
// LAB DELIVERY CHARGES STATES ADMIN
// ===============================
const [labDeliveryCharges, setLabDeliveryCharges] = useState(null);

// Fetch lab delivery charges
const fetchLabDeliveryCharges = async () => {
  setLoadingCharges(true);
  setChargesError(null);

  try {
    const response = await axios.get(
      `${URL}/admin-lab-delivery-charges/get`,
      {
        headers: {
          token: tokenS.token,
        }
      }
    );

    console.log("Lab Delivery Charges Response:", response.data);

    if (response.data.success) {
      setLabDeliveryCharges(response.data.data);
    } else {
      setChargesError(
        response.data.message || "Failed to fetch lab delivery charges"
      );
    }

  } catch (error) {
    setChargesError(
      error.message || "An error occurred while fetching lab delivery charges"
    );
  } finally {
    setLoadingCharges(false);
  }
};


// Update lab delivery charges using PATCH
const updateLabDeliveryCharges = async (updatedCharges) => {
  setLoadingCharges(true);
  setChargesError(null);

  try {
    const response = await axios.patch(
      `${URL}/admin-lab-delivery-charges/update`,
      updatedCharges,
      {
        headers: {
          token: tokenS.token,
        }
      }
    );

    if (response.data.success) {
      setLabDeliveryCharges(response.data.data);
      return { success: true, data: response.data.data };
    } else {
      setChargesError(
        response.data.message || "Failed to update lab delivery charges"
      );
      return { success: false, message: response.data.message };
    }

  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An error occurred while updating lab delivery charges";

    setChargesError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setLoadingCharges(false);
  }
};


// User lab delivery charges calculation function
const calculateLabDeliveryCharges = async (calculationData) => {
  try {
    const userToken = getUserToken();

    const response = await axios.post(
      `${URL}/admin-lab-delivery-charges/calculate`,
      calculationData,
      {
        headers: {
          token: userToken,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response;

    if (data?.success === true) {
      return data.data;
    } else {
      return {
        error: true,
        message: data?.message || "Failed to calculate lab delivery charges",
        fallbackUsed: true,
      };
    }

  } catch (error) {
    console.error("Calculate lab delivery charges error:", error);

    const googleError =
      error?.response?.data?.error ||
      error?.response?.data?.data?.error ||
      error?.message;

    if (
      googleError?.includes("REQUEST_DENIED") ||
      googleError?.includes("OVER_QUERY_LIMIT") ||
      googleError?.includes("ZERO_RESULTS") ||
      googleError?.includes("API error")
    ) {
      console.warn("⚠ Google Maps API failed, using fallback straight line distance.");

      return {
        success: false,
        fallbackUsed: true,
        distanceCalculationType: "straight_line",
        message: "Google Maps API failed (fallback used)",
      };
    }

    return {
      success: false,
      fallbackUsed: false,
      message: googleError || "Something went wrong",
    };
  }
};

const fetchUserLabDeliveryCharges = async () => {
  setLoadingCharges(true);
  setChargesError(null);

  const userToken = getUserToken();

  try {
    const response = await axios.get(
      `${URL}/admin-lab-delivery-charges/getforUser`,
      {
        headers: {
          token: userToken,
        }
      }
    );

    console.log("......................Lab Delivery Charges Response:", response.data);

    if (response.data.success) {
      setLabDeliveryCharges(response.data.data);
    } else {
      setChargesError(
        response.data.message || "Failed to fetch lab delivery charges"
      );

      // Fallback default values
      setLabDeliveryCharges({
        baseDeliveryCharge: 50,
        freeDeliveryThreshold: 300,
        rapidDeliveryCharge: 100,
        taxPercentage: 0,
        lastUpdated: null
      });
    }

  } catch (error) {
    console.error("Error fetching lab delivery charges:", error);

    setChargesError(
      error.message || "An error occurred while fetching lab delivery charges"
    );

    // Fallback default values
    setLabDeliveryCharges({
      baseDeliveryCharge: 50,
      freeDeliveryThreshold: 300,
      rapidDeliveryCharge: 100,
      taxPercentage: 0,
      lastUpdated: null
    });
  } finally {
    setLoadingCharges(false);
  }
};














  const [subAdmins, setSubAdmins] = useState([]);
  const [currentSubAdmin, setCurrentSubAdmin] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Get token from sessionStorage
  

 // Create Sub-Admin
// Create Sub-Admin
const createSubAdmin = async (subAdminData, file = null) => {
  try {
    setLoading(true);
    const token = getAdminToken();

    if (!token) {
      toast.error("Authorization token missing. Please login again.");
      return { success: false };
    }

    const formData = new FormData();
    
    // Append all subAdminData fields
    Object.keys(subAdminData).forEach(key => {
      if (key === 'permissions' || key === 'locationAccess') {
        // Stringify objects for FormData
        formData.append(key, JSON.stringify(subAdminData[key]));
      } else {
        formData.append(key, subAdminData[key]);
      }
    });

    // Append file if exists
    if (file) {
      formData.append('image', file);
    }

    // Debug: Log what's being sent
    console.log('Sending FormData:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/admin/subadmin/create`,
      formData,
      {
        headers: {
          'token': token,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data.success === 1) {
      toast.success(response.data.message);
      return { success: true, data: response.data.data };
    } else {
      toast.error(response.data.message || "Failed to create sub-admin");
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    console.error("Create sub-admin error:", error);
    
    let errorMsg = "Failed to create sub-admin";
    if (error.response) {
      console.log('Server response:', error.response.data);
      errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMsg = "No response from server. Check your network connection.";
    } else {
      errorMsg = error.message || "Request setup error";
    }

    toast.error(errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    setLoading(false);
  }
};

  // Get All Sub-Admins
  const getAllSubAdmins = async (page = 1, limit = 10, search = "") => {
    try {
      setLoading(true);
      const token = getAdminToken();

      if (!token) {
        toast.error("Authorization token missing. Please login again.");
        return { success: false };
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/subadmin/all`,
        {
          headers: { token },
          params: { page, limit, search }
        }
      );

      if (response.data.success === 1) {
        setSubAdmins(response.data.data.subAdmins);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(response.data.data.currentPage);
        setTotalCount(response.data.data.total);
        return { success: true, data: response.data.data };
      } else {
        toast.error(response.data.message || "Failed to fetch sub-admins");
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Get sub-admins error:", error);
      
      let errorMsg = "Failed to fetch sub-admins";
      if (error.response) {
        errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = "No response from server. Check your network connection.";
      } else {
        errorMsg = error.message || "Request setup error";
      }

      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get Sub-Admin by ID
  const getSubAdminById = async (id) => {
    try {
      setLoading(true);
      const token = getAdminToken();

      if (!token) {
        toast.error("Authorization token missing. Please login again.");
        return { success: false };
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/subadmin/${id}`,
        { headers: { token } }
      );

      if (response.data.success === 1) {
        setCurrentSubAdmin(response.data.data);
        return { success: true, data: response.data.data };
      } else {
        toast.error(response.data.message || "Failed to fetch sub-admin details");
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Get sub-admin error:", error);
      
      let errorMsg = "Failed to fetch sub-admin details";
      if (error.response) {
        errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = "No response from server. Check your network connection.";
      } else {
        errorMsg = error.message || "Request setup error";
      }

      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update Sub-Admin Permissions
  const updateSubAdminPermissions = async (id, permissionsData) => {
    try {
      setLoading(true);
      const token = getAdminToken();

      if (!token) {
        toast.error("Authorization token missing. Please login again.");
        return { success: false };
      }

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/subadmin/permissions/${id}`,
        permissionsData,
        { headers: { token } }
      );

      if (response.data.success === 1) {
        toast.success(response.data.message);
        // Update local state
        setSubAdmins(prev => 
          prev.map(subAdmin => 
            subAdmin._id === id ? response.data.data : subAdmin
          )
        );
        if (currentSubAdmin && currentSubAdmin._id === id) {
          setCurrentSubAdmin(response.data.data);
        }
        return { success: true, data: response.data.data };
      } else {
        toast.error(response.data.message || "Failed to update permissions");
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Update permissions error:", error);
      
      let errorMsg = "Failed to update permissions";
      if (error.response) {
        errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = "No response from server. Check your network connection.";
      } else {
        errorMsg = error.message || "Request setup error";
      }

      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update Sub-Admin Status
  const updateSubAdminStatus = async (id, isActive) => {
    try {
      setLoading(true);
      const token = getAdminToken();

      if (!token) {
        toast.error("Authorization token missing. Please login again.");
        return { success: false };
      }

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/subadmin/status/${id}`,
        { isActive },
        { headers: { token } }
      );

      if (response.data.success === 1) {
        toast.success(response.data.message);
        // Update local state
        setSubAdmins(prev => 
          prev.map(subAdmin => 
            subAdmin._id === id ? response.data.data : subAdmin
          )
        );
        if (currentSubAdmin && currentSubAdmin._id === id) {
          setCurrentSubAdmin(response.data.data);
        }
        return { success: true, data: response.data.data };
      } else {
        toast.error(response.data.message || "Failed to update status");
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Update status error:", error);
      
      let errorMsg = "Failed to update status";
      if (error.response) {
        errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = "No response from server. Check your network connection.";
      } else {
        errorMsg = error.message || "Request setup error";
      }

      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Delete Sub-Admin
  const deleteSubAdmin = async (id) => {
    try {
      setLoading(true);
      const token = getAdminToken();

      if (!token) {
        toast.error("Authorization token missing. Please login again.");
        return { success: false };
      }

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/admin/subadmin/${id}`,
        { headers: { token } }
      );

      if (response.data.success === 1) {
        toast.success(response.data.message);
        // Remove from local state
        setSubAdmins(prev => prev.filter(subAdmin => subAdmin._id !== id));
        if (currentSubAdmin && currentSubAdmin._id === id) {
          setCurrentSubAdmin(null);
        }
        return { success: true };
      } else {
        toast.error(response.data.message || "Failed to delete sub-admin");
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Delete sub-admin error:", error);
      
      let errorMsg = "Failed to delete sub-admin";
      if (error.response) {
        errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = "No response from server. Check your network connection.";
      } else {
        errorMsg = error.message || "Request setup error";
      }

      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Clear current sub-admin
  const clearCurrentSubAdmin = () => {
    setCurrentSubAdmin(null);
  };

// =============================================
// SUB-ADMIN MEMBERSHIP FUNCTIONS
// =============================================
 
// ✅ GET ALL MEMBERSHIP PLANS (SUB-ADMIN)
const getSubMembershipPlans = async (filters = {}) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoading(true);
  clearError();
  try {
     
    const { status = 'active', page = 1, limit = 10, search = '' } = filters;
 
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
 
    const queryString = queryParams.toString();
    const apiUrl = `${process.env.REACT_APP_API_URL}/membership/sub/membership-plans${queryString ? `?${queryString}` : ''}`;
 
    console.log("📡 Fetching sub-admin membership plans:", apiUrl);
 
    const response = await axios.get(apiUrl, {
      headers: {
        token: token,
        'Content-Type': 'application/json'
      }
    });
 
    if (response.data.success === 1) {
      setMembershipPlans(response.data.data.plans || []);
      console.log(`✅ Fetched ${response.data.data.plans?.length} membership plans`);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch membership plans');
  } finally {
    setLoading(false);
  }
};
 
// ✅ CREATE MEMBERSHIP PLAN (SUB-ADMIN)
const createSubMembershipPlan = async (planData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoading(true);
  clearError();
  try {
 
   
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/membership/sub/create-membership-plans`,
      planData,
      {
        headers: {
          token: token,
          'Content-Type': 'application/json'
        }
      }
    );
 
    if (response.data.success === 1) {
      console.log('✅ Membership plan created:', response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to create membership plan');
  } finally {
    setLoading(false);
  }
};
 
// ✅ GET SINGLE MEMBERSHIP PLAN BY ID (SUB-ADMIN)
const getSubMembershipPlanById = async (id) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoading(true);
  clearError();
  try {
   
   
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/membership/sub/membership-plansById/${id}`,
      {
        headers: {
          token:token,
          'Content-Type': 'application/json'
        }
      }
    );
 
    if (response.data.success === 1) {
      console.log('✅ Membership plan fetched:', response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch membership plan');
  } finally {
    setLoading(false);
  }
};
 
// ✅ UPDATE MEMBERSHIP PLAN (SUB-ADMIN)
const updateSubMembershipPlan = async (id, updateData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoading(true);
  clearError();
  try {
 
   
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/membership/sub/membership-update/${id}`,
      updateData,
      {
        headers: {
          token:token,
          'Content-Type': 'application/json'
        }
      }
    );
 
    if (response.data.success === 1) {
      console.log('✅ Membership plan updated:', response.data.data);
      // Refresh the plans list
      await getSubMembershipPlans();
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to update membership plan');
  } finally {
    setLoading(false);
  }
};
 
// ✅ TOGGLE MEMBERSHIP PLAN STATUS (SUB-ADMIN)
const toggleSubMembershipPlanStatus = async (id) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoading(true);
  clearError();
  try {
 
   
    const response = await axios.patch(
      `${process.env.REACT_APP_API_URL}/membership/sub/toggle-status/${id}`,
      {},
      {
        headers: {
          token:token,
          'Content-Type': 'application/json'
        }
      }
    );
 
    if (response.data.success === 1) {
      console.log('✅ Membership plan status toggled:', response.data.data);
      // Refresh the plans list
      await getSubMembershipPlans();
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to toggle membership plan status');
  } finally {
    setLoading(false);
  }
};
 
// ✅ GET ACTIVE MEMBERSHIP PLANS (SUB-ADMIN)
const getSubActiveMembershipPlans = async () => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoading(true);
  clearError();
  try {
   
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/membership/sub/active/plans`,
      {
        headers: {
          token:token,
          'Content-Type': 'application/json'
        }
      }
    );
 
    if (response.data.success === 1) {
      console.log('✅ Active membership plans fetched:', response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch active membership plans');
  } finally {
    setLoading(false);
  }
};
 
// ✅ GET DISCOUNT MATRIX FOR PLAN (SUB-ADMIN)
const getSubPlanDiscountMatrix = async (planId) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoading(true);
  clearError();
  try {
 
   
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/membership/sub/discount-matrix/${planId}`,
      {
        headers: {
          token:token,
          'Content-Type': 'application/json'
        }
      }
    );
 
    if (response.data.success === 1) {
      console.log('✅ Discount matrix fetched for plan:', planId);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch discount matrix');
  } finally {
    setLoading(false);
  }
};
 
// ✅ UPDATE DISCOUNT MATRIX (SUB-ADMIN)
const updateSubDiscountMatrix = async (planId, discountData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoading(true);
  clearError();
  try {
   
   
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/membership/sub/membership-update/${planId}`,
      discountData,
      {
        headers: {
          token:token,
          'Content-Type': 'application/json'
        }
      }
    );
 
    if (response.data.success === 1) {
      console.log('✅ Discount matrix updated for plan:', planId);
      // Refresh the plans list
      await getSubMembershipPlans();
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to update discount matrix');
  } finally {
    setLoading(false);
  }
};
 
// ✅ CALCULATE DISCOUNT PREVIEW (SUB-ADMIN)
const calculateSubDiscountPreview = async (data) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoading(true);
  clearError();
  try {
   
   
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/membership/sub/calculate-preview`,
      data,
      {
        headers: {
          token:token,
          'Content-Type': 'application/json'
        }
      }
    );
 
    if (response.data.success === 1) {
      console.log('✅ Discount preview calculated:', response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, 'Failed to calculate discount preview');
  } finally {
    setLoading(false);
  }
};
 
 
 







///////////////////////////// sub admin panel ////////////// 

const loginSubAdmin = async (loginData) => {
  try {
    const response = await fetch(`${URL}/admin/subadmin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();
    
    if (data.success) {
      // Store token and subadmin data
      sessionStorage.setItem('subadmintoken', data.data.token);
      sessionStorage.setItem('subadminData', JSON.stringify(data.data.subAdmin));
      
      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } else {
      return {
        success: false,
        message: data.message
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred'
    };
  }
};

const getSubAdminDashboardStats = async () => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const response = await fetch(`${URL}/subadmin/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred'
    };
  }
};

const getSubAdminRecentRegistrations = async (type, limit = 5) => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const response = await fetch(`${URL}/subadmin/dashboard/recent?type=${type}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred'
    };
  }
};

const getSubAdminVerificationRequests = async (type) => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const response = await fetch(`${URL}/subadmin/dashboard/verification-requests?type=${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred'
    };
  }
};

const getSubAdminProfile = async () => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const response = await fetch(`${URL}/subadmin/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred'
    };
  }
};

const updateSubAdminProfile = async (profileData) => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const formData = new FormData();
    if (profileData.name) formData.append('name', profileData.name);
    if (profileData.email) formData.append('email', profileData.email);
    if (profileData.image) formData.append('image', profileData.image);

    const response = await fetch(`${URL}/subadmin/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred'
    };
  }
};
const changeSubAdminPassword = async (passwordData) => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: 0, message: 'No token found' };
    }

    const response = await fetch(`${URL}/subadmin/change-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: 0, 
        message: data.message || `HTTP error! status: ${response.status}` 
      };
    }
    
    return data;
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: 0,
      message: 'Network error occurred: ' + error.message
    };
  }
};

const getSubAdminActivities = async (page = 1, limit = 10) => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const response = await fetch(`${URL}/subadmin/activities?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred'
    };
  }
};
const getSubAdminMonthlyStats = async () => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    // नए API एंडपॉइंट को कॉल करें
    const response = await fetch(`${URL}/subadmin/dashboard/monthly-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sub-admin monthly stats:", error);
    return {
      success: false,
      message: 'Network error occurred while fetching monthly stats'
    };
  }
};

//============ SubAdmin Clinic Get ==================
const [subAdminClinic, setSubAdminClinic] = useState([]);

const getSubAdminClinic = async () => {
  try {
    setLoading(true);
    setError(null);

    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      setError("Authentication token not found.");
      setSubAdminClinic([]);
      setLoading(false);
      return;
    }

    const response = await axios.get(`${URL}/subadmin/clinic`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }   
    });
    console.log("Get subadmin clinic response:", response.data);

    if (response.data.success) {
      setSubAdminClinic(response.data.data.clinics || []);
    } else {
      setSubAdminClinic([]);
      setError("No clinic details found");
    }

  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch clinic details';
    setError(errorMessage);
    console.error("Error fetching clinic details:", err);
    setSubAdminClinic([]);
  } finally {
    setLoading(false);
  }
}

// Approve clinic for subadmin
const approveSubAdminClinic = async (clinicId) => {
  try {
    setLoading(true);
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'Authentication token not found' };
    }
    
    const response = await axios.put(
      `${URL}/subadmin/clinic/${clinicId}/approve`,
      {},
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }   
      }
    );

    if (response.data.success) {
      setSubAdminClinic(prevClinics => 
        prevClinics.map(clinic => 
          clinic._id === clinicId 
            ? { 
                ...clinic, 
                Accountverify: '1',
                rejectReason: '' 
              }
            : clinic
        )
      );
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }

  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to approve clinic';
    console.error("Error approving clinic:", err);
    return { success: false, message: errorMessage };
  } finally {
    setLoading(false);
  }
};

// Reject clinic for subadmin
const rejectSubAdminClinic = async (clinicId, rejectReason) => {
  try {
    setLoading(true);
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'Authentication token not found' };
    }
    
    const response = await axios.put(
      `${URL}/subadmin/clinic/${clinicId}/reject`,
      { rejectReason },
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }   
      }
    );

    if (response.data.success) {
      setSubAdminClinic(prevClinics => 
        prevClinics.map(clinic => 
          clinic._id === clinicId 
            ? { 
                ...clinic, 
                Accountverify: '2',
                rejectReason: rejectReason 
              }
            : clinic
        )
      );
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }

  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to reject clinic';
    console.error("Error rejecting clinic:", err);
    return { success: false, message: errorMessage };
  } finally {
    setLoading(false);
  }
};

// SubAdmin clinic documents state
const [subAdminClinicDocuments, setSubAdminClinicDocuments] = useState(null);
const [subAdminDocumentsLoading, setSubAdminDocumentsLoading] = useState(false);
const [subAdminDocumentsError, setSubAdminDocumentsError] = useState(null);

// Get clinic documents for subadmin
const getSubAdminClinicDocument = async (clinicId) => {
  try {
    setSubAdminDocumentsLoading(true);
    setSubAdminDocumentsError(null);
    
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      setSubAdminDocumentsError('Authentication token not found');
      return { success: false, message: 'Authentication token not found' };
    }
    
    const response = await axios.get(
      `${URL}/subadmin/clinic/${clinicId}/documents`,
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }   
      }
    );
    console.log("Get subadmin clinic documents response:", response.data);

    if (response.data.success) {
      setSubAdminClinicDocuments(response.data.data);
      return { success: true, data: response.data.data };
    } else {
      setSubAdminDocumentsError(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch clinic documents';
    setSubAdminDocumentsError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setSubAdminDocumentsLoading(false);
  }
};

// Approve document field for subadmin
const approveSubAdminDocumentField = async (clinicId, field) => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'Authentication token not found' };
    }
    
    const response = await axios.put(
      `${URL}/subadmin/clinic/${clinicId}/documents/approve-field`,
      { field },
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }   
      }
    );

    if (response.data.success) {
      setSubAdminClinicDocuments(prev => ({
        ...prev,
        [field]: "1"
      }));
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to approve document';
    return { success: false, message: errorMessage };
  }
};

// Reject document field for subadmin
const rejectSubAdminDocumentField = async (clinicId, field, rejectReason) => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'Authentication token not found' };
    }
    
    const response = await axios.put(
      `${URL}/subadmin/clinic/${clinicId}/documents/reject-field`,
      { field, rejectReason },
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }   
      }
    );

    if (response.data.success) {
      setSubAdminClinicDocuments(prev => ({
        ...prev,
        [field]: "2",
        rejectReasons: {
          ...prev.rejectReasons,
          [field]: rejectReason
        }
      }));
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to reject document';
    return { success: false, message: errorMessage };
  }
};

const addInsuranceTypeSubadmin = async (formData) => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      toast.error("Authentication token not found");
      return { success: 0, message: "Authentication token not found" };
    }

    const { data } = await axios.post(
      `${URL}/doctorAccess/addInsuranceType`,
      formData,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (data.success) {
      toast.success("Insurance added successfully");
    } else {
      toast.error(data.message || "Failed to add insurance");
    }
    
    return data;
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error.response?.data?.message || "Failed to add insurance";
    toast.error(errorMessage);
    return { 
      success: 0, 
      message: errorMessage 
    };
  }
};



//============ SubAdmin Specialists Context Functions ==================

const [subAdminSpecialists, setSubAdminSpecialists] = useState([]);
const [subAdminSpecialistsLoading, setSubAdminSpecialistsLoading] = useState(false);
const [subAdminSpecialistsError, setSubAdminSpecialistsError] = useState(null);

// GET ALL SPECIALISTS FOR SUBADMIN
const getSubAdminSpecialists = async (page = 1, limit = 10, search = "") => {
  try {
    setSubAdminSpecialistsLoading(true);
    setSubAdminSpecialistsError(null);

    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      setSubAdminSpecialistsError('Authentication token not found');
      return { success: false, message: 'Authentication token not found' };
    }

    const response = await axios.get(
      `${URL}/subadmin/specialists`,
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }   
      }
    );

    if (response.data.success) {
      setSubAdminSpecialists(response.data.data.specialists || []);
      return { 
        success: true, 
        data: response.data.data,
        pagination: response.data.data.pagination 
      };
    } else {
      setSubAdminSpecialists([]);
      setSubAdminSpecialistsError(response.data.message);
      return { success: false, message: response.data.message };
    }

  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch specialists';
    setSubAdminSpecialistsError(errorMessage);
    setSubAdminSpecialists([]);
    return { success: false, message: errorMessage };
  } finally {
    setSubAdminSpecialistsLoading(false);
  }
}

// CREATE SPECIALIST FOR SUBADMIN
const createSubAdminSpecialist = async (formData) => {
  try {
    setSubAdminSpecialistsLoading(true);
    setSubAdminSpecialistsError(null);
    
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      setSubAdminSpecialistsError('Authentication token not found');
      return { success: false, message: 'Authentication token not found' };
    }

    const response = await axios.post(
      `${URL}/subadmin/specialists`,
      formData,
      {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }   
      }
    );

    if (response.data.success) {
      // Add new specialist to the list
      setSubAdminSpecialists(prev => [response.data.data, ...prev]);
      return { success: true, message: response.data.message, data: response.data.data };
    } else {
      setSubAdminSpecialistsError(response.data.message);
      return { success: false, message: response.data.message };
    }

  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to create specialist';
    setSubAdminSpecialistsError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setSubAdminSpecialistsLoading(false);
  }
};

// UPDATE SPECIALIST FOR SUBADMIN
const updateSubAdminSpecialist = async (id, formData) => {
  try {
    setSubAdminSpecialistsLoading(true);
    setSubAdminSpecialistsError(null);
    
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      setSubAdminSpecialistsError('Authentication token not found');
      return { success: false, message: 'Authentication token not found' };
    }

    const response = await axios.put(
      `${URL}/subadmin/specialists/${id}`,
      formData,
      {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }   
      }
    );

    if (response.data.success) {
      // Update specialist in the list
      setSubAdminSpecialists(prev => 
        prev.map(specialist => 
          specialist._id === id ? response.data.data : specialist
        )
      );
      return { success: true, message: response.data.message, data: response.data.data };
    } else {
      setSubAdminSpecialistsError(response.data.message);
      return { success: false, message: response.data.message };
    }

  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to update specialist';
    setSubAdminSpecialistsError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setSubAdminSpecialistsLoading(false);
  }
};

// DELETE SPECIALIST FOR SUBADMIN
const deleteSubAdminSpecialist = async (id) => {
  try {
    setSubAdminSpecialistsLoading(true);
    setSubAdminSpecialistsError(null);
    
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      setSubAdminSpecialistsError('Authentication token not found');
      return { success: false, message: 'Authentication token not found' };
    }

    const response = await axios.delete(
      `${URL}/subadmin/specialists/${id}`,
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }   
      }
    );

    if (response.data.success) {
      // Remove specialist from the list
      setSubAdminSpecialists(prev => prev.filter(specialist => specialist._id !== id));
      return { success: true, message: response.data.message };
    } else {
      setSubAdminSpecialistsError(response.data.message);
      return { success: false, message: response.data.message };
    }

  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to delete specialist';
    setSubAdminSpecialistsError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setSubAdminSpecialistsLoading(false);
  }
};

// GET SPECIALIST STATISTICS FOR SUBADMIN
const getSubAdminSpecialistStats = async () => {
  try {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      return { success: false, message: 'Authentication token not found' };
    }

    const response = await axios.get(
      `${URL}/subadmin/specialists/stats`,
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }   
      }
    );

    if (response.data.success) {
      return { success: true, data: response.data.data };
    } else {
      return { success: false, message: response.data.message };
    }

  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch statistics';
    return { success: false, message: errorMessage };
  }
};

const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState(null);
  
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [doctorDetailsLoading, setDoctorDetailsLoading] = useState(false);
  const [doctorDetailsError, setDoctorDetailsError] = useState(null);
  
  const [doctorStatsLoading, setDoctorStatsLoading] = useState(false);
  const [doctorStatsError, setDoctorStatsError] = useState(null);

  const [doctorDocuments, setDoctorDocuments] = useState(null);
  const [doctorDocumentsLoading, setDoctorDocumentsLoading] = useState(false);
  const [doctorDocumentsError, setDoctorDocumentsError] = useState(null);

  // ✅ GET AUTH HEADER
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('subadmintoken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // ✅ GET ALL DOCTORS
  const getDoctorsSubadmin = async (filters = {}) => {
    try {
      setDoctorsLoading(true);
      setDoctorsError(null);

      const {
        page = 1,
        limit = 10,
        search = "",
        verification = "",
        specialist = "",
        country = "",
        state = "",
        city = "",
        sortBy = "createdAt",
        sortOrder = "desc"
      } = filters;

      const response = await axios.get(
        `${URL}/subadmin/doctor`,
        {
          params: {
            page,
            limit,
            search,
            verification,
            specialist,
            country,
            state,
            city,
            sortBy,
            sortOrder
          },
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setDoctors(response.data.data.doctors || []);
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.data.pagination,
          stats: response.data.data.stats,
          filters: response.data.data.filters
        };
      } else {
        setDoctors([]);
        setDoctorsError(response.data.message);
        return { success: false, message: response.data.message };
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch doctors';
      setDoctorsError(errorMessage);
      setDoctors([]);
      return { success: false, message: errorMessage };
    } finally {
      setDoctorsLoading(false);
    }
  };

  // ✅ GET DOCTOR BY ID
  const getDoctorById = async (id) => {
    try {
      setDoctorDetailsLoading(true);
      setDoctorDetailsError(null);

      const response = await axios.get(
        `${URL}/subadmin/doctor/${id}`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setDoctorDetails(response.data.data);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        setDoctorDetails(null);
        setDoctorDetailsError(response.data.message);
        return { success: false, message: response.data.message };
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch doctor details';
      setDoctorDetailsError(errorMessage);
      setDoctorDetails(null);
      return { success: false, message: errorMessage };
    } finally {
      setDoctorDetailsLoading(false);
    }
  };

  // ✅ UPDATE DOCTOR VERIFICATION
  const updateDoctorVerification = async (id, status, reason = "") => {
    try {
      setDoctorsLoading(true);

      const response = await axios.put(
        `${URL}/subadmin/doctor/${id}/verification`,
        { status, reason },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        // Update local state
        setDoctors(prev => prev.map(doctor => 
          doctor._id === id 
            ? { ...doctor, Accountverify: status }
            : doctor
        ));
        
        if (doctorDetails && doctorDetails._id === id) {
          setDoctorDetails(prev => ({ ...prev, Accountverify: status }));
        }

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return { success: false, message: response.data.message };
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update verification';
      return { success: false, message: errorMessage };
    } finally {
      setDoctorsLoading(false);
    }
  };

  // ✅ DELETE DOCTOR
  const deleteDoctor = async (id) => {
    try {
      setDoctorsLoading(true);

      const response = await axios.delete(
        `${URL}/subadmin/doctor/${id}`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        // Remove from local state
        setDoctors(prev => prev.filter(doctor => doctor._id !== id));
        if (doctorDetails && doctorDetails._id === id) {
          setDoctorDetails(null);
        }

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return { success: false, message: response.data.message };
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete doctor';
      return { success: false, message: errorMessage };
    } finally {
      setDoctorsLoading(false);
    }
  };

  // ✅ GET DOCTOR STATISTICS
  const getDoctorStats = async () => {
    try {
      setDoctorStatsLoading(true);
      setDoctorStatsError(null);

      const response = await axios.get(
        `${URL}/subadmin/doctor/stats`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setDoctorStats(response.data.data);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        setDoctorStats(null);
        setDoctorStatsError(response.data.message);
        return { success: false, message: response.data.message };
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch doctor statistics';
      setDoctorStatsError(errorMessage);
      setDoctorStats(null);
      return { success: false, message: errorMessage };
    } finally {
      setDoctorStatsLoading(false);
    }
  };

  // ✅ GET MONTHLY DOCTOR STATS
  const getMonthlyDoctorStats = async () => {
    try {
      setDoctorStatsLoading(true);

      const response = await axios.get(
        `${URL}/subadmin/doctor/monthly-stats`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        return {
          success: true,
          data: response.data.details
        };
      } else {
        return { success: false, message: response.data.message };
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch monthly stats';
      return { success: false, message: errorMessage };
    } finally {
      setDoctorStatsLoading(false);
    }
  };

  // ✅ GET DOCTOR DOCUMENTS
  const getDoctorDocumentsSubadmin = async (id) => {
    try {
      setDoctorDocumentsLoading(true);
      setDoctorDocumentsError(null);

      const response = await axios.get(
        `${URL}/subadmin/doctor/${id}/documents`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        setDoctorDocuments(response.data.data);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        setDoctorDocuments(null);
        setDoctorDocumentsError(response.data.message);
        return { success: false, message: response.data.message };
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch doctor documents';
      setDoctorDocumentsError(errorMessage);
      setDoctorDocuments(null);
      return { success: false, message: errorMessage };
    } finally {
      setDoctorDocumentsLoading(false);
    }
  };

  // ✅ APPROVE DOCUMENT FIELD
  const approveDocumentFieldSubadmin = async (id, field) => {
    try {
      const response = await axios.patch(
        `${URL}/subadmin/doctor/${id}/documents/approve`,
        { field },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        // Update local documents state
        if (doctorDocuments) {
          setDoctorDocuments(prev => ({
            ...prev,
            [field]: "1"
          }));
        }

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return { success: false, message: response.data.message };
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to approve document';
      return { success: false, message: errorMessage };
    }
  };

  // ✅ REJECT DOCUMENT FIELD
  const rejectDocumentFieldSubadmin = async (id, field, rejectReason) => {
    try {
      const response = await axios.patch(
        `${URL}/subadmin/doctor/${id}/documents/reject`,
        { field, rejectReason },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        // Update local documents state
        if (doctorDocuments) {
          setDoctorDocuments(prev => ({
            ...prev,
            [field]: "2",
            rejectReasons: {
              ...prev.rejectReasons,
              [field]: rejectReason
            }
          }));
        }

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return { success: false, message: response.data.message };
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reject document';
      return { success: false, message: errorMessage };
    }
  };

  // ✅ VERIFY DOCTOR ACCOUNT
  const verifyDoctorAccount = async (id) => {
    try {
      const response = await axios.patch(
        `${URL}/subadmin/doctor/${id}/verify`,
        {},
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        // Update local state
        setDoctors(prev => prev.map(doctor => 
          doctor._id === id 
            ? { ...doctor, Accountverify: "1" }
            : doctor
        ));
        
        if (doctorDetails && doctorDetails._id === id) {
          setDoctorDetails(prev => ({ ...prev, Accountverify: "1" }));
        }

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return { success: false, message: response.data.message };
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to verify doctor account';
      return { success: false, message: errorMessage };
    }
  };

  // ✅ REJECT DOCTOR ACCOUNT
  const rejectDoctorAccount = async (id, rejectReason) => {
    try {
      const response = await axios.patch(
        `${URL}/subadmin/doctor/${id}/reject`,
        { rejectReason },
        {
          headers: getAuthHeaders()
        }
      );

      if (response.data.success) {
        // Update local state
        setDoctors(prev => prev.map(doctor => 
          doctor._id === id 
            ? { ...doctor, Accountverify: "2", rejectReason }
            : doctor
        ));
        
        if (doctorDetails && doctorDetails._id === id) {
          setDoctorDetails(prev => ({ ...prev, Accountverify: "2", rejectReason }));
        }

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return { success: false, message: response.data.message };
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reject doctor account';
      return { success: false, message: errorMessage };
    }
  };

const [usersLoading, setUsersLoading] = useState(false);
const [usersError, setUsersError] = useState(null);
const [userStats, setUserStats] = useState(null);
const [recentUsers, setRecentUsers] = useState([]);
// ✅ GET ALL USERS
const getUsersSubadmin = async (params = {}) => {
  try {
    setUsersLoading(true);
    setUsersError(null);

    const response = await axios.get(`${URL}/subadmin/user`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
        country: params.country || "",
        state: params.state || "",
        city: params.city || "",
        status: params.status || "",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc"
      },
      headers: getAuthHeaders()
    });
    console.log("Get users response:", response.data);

    if (response.data.success) {
      setUsers(response.data.data.users || []);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setUsers([]);
      setUsersError(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch users';
    setUsersError(errorMessage);
    setUsers([]);
    return { success: false, message: errorMessage };
  } finally {
    setUsersLoading(false);
  }
};

// ✅ GET ACTIVE USERS
const getActiveUsersSubadmin = async (params = {}) => {
  try {
    setUsersLoading(true);
    setUsersError(null);

    const response = await axios.get(`${URL}/subadmin/user/active`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
        country: params.country || "",
        state: params.state || "",
        city: params.city || ""
      },
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      setUsers(response.data.data.users || []);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setUsers([]);
      setUsersError(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch active users';
    setUsersError(errorMessage);
    setUsers([]);
    return { success: false, message: errorMessage };
  } finally {
    setUsersLoading(false);
  }
};

// ✅ GET INACTIVE USERS
const getInactiveUsersSubadmin = async (params = {}) => {
  try {
    setUsersLoading(true);
    setUsersError(null);

    const response = await axios.get(`${URL}/subadmin/user/inactive`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
        country: params.country || "",
        state: params.state || "",
        city: params.city || ""
      },
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      setUsers(response.data.data.users || []);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setUsers([]);
      setUsersError(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch inactive users';
    setUsersError(errorMessage);
    setUsers([]);
    return { success: false, message: errorMessage };
  } finally {
    setUsersLoading(false);
  }
};

// ✅ GET RECENT USERS (First 5)
const getRecentUsersSubadmin = async () => {
  try {
    setUsersLoading(true);
    setUsersError(null);

    const response = await axios.get(`${URL}/subadmin/user/recent/first-five`, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      setRecentUsers(response.data.data || []);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setRecentUsers([]);
      setUsersError(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch recent users';
    setUsersError(errorMessage);
    setRecentUsers([]);
    return { success: false, message: errorMessage };
  } finally {
    setUsersLoading(false);
  }
};

// ✅ GET USER REGISTRATION STATS
const getUserStatsSubadmin = async () => {
  try {
    setUsersLoading(true);
    setUsersError(null);

    const response = await axios.get(`${URL}/subadmin/user/stats/registration`, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      setUserStats(response.data.data || []);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setUserStats([]);
      setUsersError(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch user stats';
    setUsersError(errorMessage);
    setUserStats([]);
    return { success: false, message: errorMessage };
  } finally {
    setUsersLoading(false);
  }
};

// ✅ GET USER BY ID
const getUserByIdSubadmin = async (userId) => {
  try {
    setUsersLoading(true);
    setUsersError(null);

    if (!userId) {
      setUsersError("User ID is required");
      return { success: false, message: "User ID is required" };
    }

    const response = await axios.get(`${URL}/subadmin/user/${userId}`, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setUsersError(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch user details';
    setUsersError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setUsersLoading(false);
  }
};

// ✅ UPDATE USER STATUS
const updateUserStatusSubadmin = async (userId, isActive) => {
  try {
    setUsersLoading(true);
    setUsersError(null);

    if (!userId) {
      setUsersError("User ID is required");
      return { success: false, message: "User ID is required" };
    }

    const response = await axios.put(
      `${URL}/subadmin/user/${userId}/status`,
      { isActive },
      { headers: getAuthHeaders() }
    );

    if (response.data.success) {
      // Update local state if needed
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isActive } : user
        )
      );
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setUsersError(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to update user status';
    setUsersError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setUsersLoading(false);
  }
};

// ✅ DELETE USER
const deleteUserSubadmin = async (userId) => {
  try {
    setUsersLoading(true);
    setUsersError(null);

    if (!userId) {
      setUsersError("User ID is required");
      return { success: false, message: "User ID is required" };
    }

    const response = await axios.delete(`${URL}/subadmin/user/${userId}`, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      // Remove from local state
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setUsersError(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to delete user';
    setUsersError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setUsersLoading(false);
  }
};

  const [foodVendorsLoading, setFoodVendorsLoading] = useState(false);
  const [foodVendorsError, setFoodVendorsError] = useState(null);
  
  const [foodVendorDetail, setFoodVendorDetail] = useState(null);
  const [foodVendorDetailLoading, setFoodVendorDetailLoading] = useState(false);
  const [foodVendorDetailError, setFoodVendorDetailError] = useState(null);
  
  const [foodStats, setFoodStats] = useState(null);
  const [foodStatsLoading, setFoodStatsLoading] = useState(false);
  const [foodStatsError, setFoodStatsError] = useState(null);
  
  const [foodCategories, setFoodCategories] = useState([]);
  const [foodCategoriesLoading, setFoodCategoriesLoading] = useState(false);
  const [foodCategoriesError, setFoodCategoriesError] = useState(null);
  
  const [meals, setMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [mealsError, setMealsError] = useState(null);

  // ✅ GET ALL FOOD VENDORS
  const getFoodVendors = async (filters = {}) => {
    try {
      setFoodVendorsLoading(true);
      setFoodVendorsError(null);

      const {
        page = 1,
        limit = 10,
        search = "",
        status = "",
        country = "",
        state = "",
        city = "",
        sortBy = "createdAt",
        sortOrder = "desc"
      } = filters;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        status,
        country,
        state,
        city,
        sortBy,
        sortOrder
      });

      const response = await axios.get(
        `${URL}/subadmin/vendor/food?${params.toString()}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setFoodVendors(response.data.data);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setFoodVendorsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch food vendors';
      setFoodVendorsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFoodVendorsLoading(false);
    }
  };

  // ✅ GET SINGLE FOOD VENDOR DETAILS
  const getFoodVendorById = async (vendorId) => {
    try {
      setFoodVendorDetailLoading(true);
      setFoodVendorDetailError(null);

      if (!vendorId) {
        setFoodVendorDetailError("Vendor ID is required");
        return { success: false, message: "Vendor ID is required" };
      }

      const response = await axios.get(
        `${URL}/subadmin/vendor/food/${vendorId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setFoodVendorDetail(response.data.data);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setFoodVendorDetailError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch food vendor details';
      setFoodVendorDetailError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFoodVendorDetailLoading(false);
    }
  };

  // ✅ GET FOOD VENDORS STATISTICS
  const getFoodVendorsStats = async () => {
    try {
      setFoodStatsLoading(true);
      setFoodStatsError(null);

      const response = await axios.get(
        `${URL}/subadmin/vendor/food/stats`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setFoodStats(response.data.data);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setFoodStatsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch food vendors statistics';
      setFoodStatsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFoodStatsLoading(false);
    }
  };

  // ✅ CREATE FOOD CATEGORY
  const createFoodCategory = async (categoryData, imageFile) => {
    try {
      setFoodCategoriesLoading(true);
      setFoodCategoriesError(null);

      const formData = new FormData();
      formData.append('name', categoryData.name);
      formData.append('category', categoryData.category);
      formData.append('calorie', categoryData.calorie);
      if (imageFile) {
        formData.append('foodImage', imageFile);
      }

      const response = await axios.post(
        `${URL}/subadmin/vendor/food/addCategory`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        // Refresh categories list
        await getFoodCategories();
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setFoodCategoriesError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create food category';
      setFoodCategoriesError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFoodCategoriesLoading(false);
    }
  };

  // ✅ GET FOOD CATEGORIES
  const getFoodCategoriesSubadmin = async (filters = {}) => {
    try {
      setFoodCategoriesLoading(true);
      setFoodCategoriesError(null);

      const { page = 1, limit = 10, search = "" } = filters;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search
      });

      const response = await axios.get(
        `${URL}/subadmin/vendor/food/getcategory?${params.toString()}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setFoodCategories(response.data.data);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setFoodCategoriesError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch food categories';
      setFoodCategoriesError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFoodCategoriesLoading(false);
    }
  };

  // ✅ GET FOOD VENDORS LISTS (ACTIVE)
  const getFoodVendorsListsSubadmin = async (filters = {}) => {
    try {
      setFoodVendorsLoading(true);
      setFoodVendorsError(null);

      const { page = 1, limit = 10 } = filters;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await axios.get(
        `${URL}/subadmin/vendor/food/lists/FoodVendors?${params.toString()}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        return {
          success: true,
          data: response.data,
          message: response.data.message
        };
      } else {
        setFoodVendorsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch food vendors list';
      setFoodVendorsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFoodVendorsLoading(false);
    }
  };

  // ✅ GET INACTIVE FOOD VENDORS
  const getInactiveFoodVendorsSubadmin = async (filters = {}) => {
    try {
      setFoodVendorsLoading(true);
      setFoodVendorsError(null);

      const { page = 1, limit = 10, search = "", country = "", state = "", city = "" } = filters;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        country,
        state,
        city
      });

      const response = await axios.get(
        `${URL}/subadmin/vendor/food/lists/inactivefood?${params.toString()}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setFoodVendorsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch inactive food vendors';
      setFoodVendorsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFoodVendorsLoading(false);
    }
  };

  // ✅ GET FOOD VENDORS STATUS (12 MONTHS DATA)
  const getFoodVendorsStatus = async () => {
    try {
      setFoodStatsLoading(true);
      setFoodStatsError(null);

      const response = await axios.get(
        `${URL}/subadmin/vendor/food/stats/getfoodstatus`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setFoodStatsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch food vendors status';
      setFoodStatsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFoodStatsLoading(false);
    }
  };

  // ✅ ADD MEAL
  const addMealSubadmin = async (mealData, imageFile) => {
    try {
      setMealsLoading(true);
      setMealsError(null);

      const formData = new FormData();
      formData.append('name', mealData.name);
      if (imageFile) {
        formData.append('MealImage', imageFile);
      }

      const response = await axios.post(
        `${URL}/subadmin/vendor/food/meals/addmeal`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        // Refresh meals list
        await getMeals();
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setMealsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add meal';
      setMealsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setMealsLoading(false);
    }
  };

  // ✅ GET MEALS
  const getMealsSubadmin = async () => {
    try {
      setMealsLoading(true);
      setMealsError(null);

      const response = await axios.get(
        `${URL}/subadmin/vendor/food/meals/getmeal`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setMeals(response.data.details);
        return {
          success: true,
          data: response.data.details,
          message: response.data.message
        };
      } else {
        setMealsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch meals';
      setMealsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setMealsLoading(false);
    }
  };

  // ✅ UPDATE FOOD VENDOR STATUS
  const updateFoodVendorStatus = async (vendorId, isActive) => {
    try {
      setFoodVendorsLoading(true);
      setFoodVendorsError(null);

      if (!vendorId) {
        setFoodVendorsError("Vendor ID is required");
        return { success: false, message: "Vendor ID is required" };
      }

      const response = await axios.patch(
        `${URL}/subadmin/vendor/food/${vendorId}/status`,
        { isActive },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        // Update local state
        setFoodVendors(prevVendors =>
          prevVendors.map(vendor =>
            vendor._id === vendorId ? { ...vendor, isActive } : vendor
          )
        );
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setFoodVendorsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update food vendor status';
      setFoodVendorsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFoodVendorsLoading(false);
    }
  };



  const [userPermissions, setUserPermissions] = useState({});
 // ✅ CHECK IF USER IS SUB-ADMIN
  const isSubAdmin = () => {
    return localStorage.getItem('subadminToken') !== null;
  };

  // ✅ GET USER PERMISSIONS
  const getUserPermissions = () => {
    if (isSubAdmin()) {
      const subAdminData = JSON.parse(localStorage.getItem('subadminData') || '{}');
      return subAdminData.permissions || {};
    }
    return null;
  };

  // ✅ CHECK FOOD VENDOR PERMISSION
  const hasFoodVendorPermission = (action = 'view') => {
    if (!isSubAdmin()) return true; // Admin has all permissions
    
    const permissions = getUserPermissions();
    return permissions?.vendors?.food?.[action] || false;
  };

  // ✅ FETCH FOOD DELIVERY CHARGES (SUB-ADMIN & ADMIN)
  const fetchFoodDeliveryChargesSub = async () => {
    setLoadingCharges(true);
    setChargesError(null);
    
    try {
      // Determine endpoint based on user type
      const endpoint = `${URL}/subadmin-food-delivery-charges/get`
        

      const response = await axios.get(endpoint, {
        headers: getAuthHeaders()
      });
      
      console.log("Food Delivery Charges Response:", response.data);
      
      if (response.data.success) {
        setFoodDeliveryCharges(response.data.data);
        
        // Store permissions if available
        if (response.data.permissions) {
          setUserPermissions(response.data.permissions);
        }
        
        return {
          success: true,
          data: response.data.data,
          permissions: response.data.permissions
        };
      } else {
        setChargesError(response.data.message || "Failed to fetch food delivery charges");
        return { 
          success: false, 
          message: response.data.message 
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "An error occurred while fetching delivery charges";
      setChargesError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setLoadingCharges(false);
    }
  };

  // ✅ UPDATE FOOD DELIVERY CHARGES (SUB-ADMIN & ADMIN)
  const updateFoodDeliveryChargesSub = async (updatedCharges) => {
    // ✅ CHECK PERMISSION FOR SUB-ADMIN
    if (isSubAdmin() && !hasFoodVendorPermission('edit')) {
      const errorMsg = "You don't have permission to update food delivery charges";
      setChargesError(errorMsg);
      return { 
        success: false, 
        message: errorMsg 
      };
    }

    setLoadingCharges(true);
    setChargesError(null);
    
    try {
      // Determine endpoint based on user type
            const endpoint = `${URL}/subadmin-food-delivery-charges/update`


      const response = await axios.patch(endpoint, updatedCharges, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setFoodDeliveryCharges(response.data.data);
        
        // Show success message
        if (response.data.updatedBy) {
          console.log(`Charges updated by: ${response.data.updatedBy.subAdminName}`);
        }
        
        return { 
          success: true, 
          data: response.data.data,
          updatedBy: response.data.updatedBy 
        };
      } else {
        setChargesError(response.data.message || "Failed to update food delivery charges");
        return { 
          success: false, 
          message: response.data.message 
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "An error occurred while updating delivery charges";
      setChargesError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setLoadingCharges(false);
    }
  };

  // ✅ GET FOOD DELIVERY CHARGES HISTORY (SUB-ADMIN & ADMIN)
  const getFoodDeliveryChargesHistory = async (filters = {}) => {
    // ✅ CHECK PERMISSION FOR SUB-ADMIN
    if (isSubAdmin() && !hasFoodVendorPermission('view')) {
      const errorMsg = "You don't have permission to view food delivery charges history";
      setChargesError(errorMsg);
      return { 
        success: false, 
        message: errorMsg 
      };
    }

    setLoadingCharges(true);
    setChargesError(null);
    
    try {
      const { page = 1, limit = 10 } = filters;
      
      // Determine endpoint based on user type
            const endpoint = `${URL}/subadmin-food-delivery-charges/get`


      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await axios.get(`${endpoint}?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          permissions: response.data.permissions
        };
      } else {
        setChargesError(response.data.message);
        return { 
          success: false, 
          message: response.data.message 
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to fetch delivery charges history";
      setChargesError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setLoadingCharges(false);
    }
  };

  // ✅ CLEAR CHARGES ERROR
  const clearChargesError = () => {
    setChargesError(null);
  };

  // ✅ GET CURRENT USER TYPE AND PERMISSIONS
  const getCurrentUserInfo = () => {
    const isSubAdminUser = isSubAdmin();
    const permissions = getUserPermissions();
    
    return {
      isSubAdmin: isSubAdminUser,
      isAdmin: !isSubAdminUser,
      permissions: permissions,
      canEditFoodCharges: isSubAdminUser ? hasFoodVendorPermission('edit') : true,
      canViewFoodCharges: isSubAdminUser ? hasFoodVendorPermission('view') : true
    };
  };



  // ✅ CLEAR FUNCTIONS
const clearFoodVendorsError = () => {
  setFoodVendorsError(null);
};

const clearFoodVendorDetail = () => {
  setFoodVendorDetail(null);
  setFoodVendorDetailError(null);
};

const clearFoodStatsError = () => {
  setFoodStatsError(null);
};

const clearFoodCategoriesError = () => {
  setFoodCategoriesError(null);
};

const clearMealsError = () => {
  setMealsError(null);
};


const [labVendors, setLabVendors] = useState([]);
  const [labVendorsLoading, setLabVendorsLoading] = useState(false);
  const [labVendorsError, setLabVendorsError] = useState(null);
  const [labVendorStats, setLabVendorStats] = useState(null);
  const [labVendorStatsLoading, setLabVendorStatsLoading] = useState(false);
  const [labVendorStatsError, setLabVendorStatsError] = useState(null);
  const [currentLabVendor, setCurrentLabVendor] = useState(null);
  const [labVendorLoading, setLabVendorLoading] = useState(false);
  const [labVendorError, setLabVendorError] = useState(null);

  // ✅ GET ALL LAB VENDORS
  const getLabVendorsSubadmin = async (filters = {}) => {
    try {
      setLabVendorsLoading(true);
      setLabVendorsError(null);

      const {
        page = 1,
        limit = 10,
        search = "",
        status = "",
        country = "",
        state = "",
        city = "",
        sortBy = "createdAt",
        sortOrder = "desc"
      } = filters;

      const params = {
        page,
        limit,
        search,
        status,
        country,
        state,
        city,
        sortBy,
        sortOrder
      };

      const response = await axios.get(`${URL}/subadmin/vendor/lab`, {
        headers: getAuthHeaders(),
        params
      });

      if (response.data.success) {
        setLabVendors(response.data.data);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setLabVendorsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch lab vendors';
      setLabVendorsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLabVendorsLoading(false);
    }
  };

  // ✅ GET LAB VENDOR STATISTICS
  const getLabVendorsStatsSubadmin = async () => {
    try {
      setLabVendorStatsLoading(true);
      setLabVendorStatsError(null);

      const response = await axios.get(`${URL}/subadmin/vendor/lab/stats`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setLabVendorStats(response.data.data);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setLabVendorStatsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch lab vendors statistics';
      setLabVendorStatsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLabVendorStatsLoading(false);
    }
  };

  // ✅ GET SINGLE LAB VENDOR BY ID
  const getLabVendorByIdSubadmin = async (vendorId) => {
    try {
      setLabVendorLoading(true);
      setLabVendorError(null);

      if (!vendorId) {
        setLabVendorError("Vendor ID is required");
        return { success: false, message: "Vendor ID is required" };
      }

      const response = await axios.get(`${URL}/subadmin/vendor/lab/${vendorId}`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setCurrentLabVendor(response.data.data);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setLabVendorError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch lab vendor details';
      setLabVendorError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLabVendorLoading(false);
    }
  };

  // ✅ SEARCH VENDOR TESTS
  const searchVendorTestSubadmin = async (searchQuery) => {
    try {
      setLabVendorsLoading(true);
      setLabVendorsError(null);

      if (!searchQuery) {
        setLabVendorsError("Search query is required");
        return { success: false, message: "Search query is required" };
      }

      const response = await axios.get(`${URL}/subadmin/vendor/lab/search-tests`, {
        headers: getAuthHeaders(),
        params: { q: searchQuery }
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setLabVendorsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to search vendor tests';
      setLabVendorsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLabVendorsLoading(false);
    }
  };

  // ✅ UPDATE LAB VENDOR STATUS
  const updateLabVendorStatusSubadmin = async (vendorId) => {
    try {
      setLabVendorsLoading(true);
      setLabVendorsError(null);

      if (!vendorId) {
        setLabVendorsError("Vendor ID is required");
        return { success: false, message: "Vendor ID is required" };
      }

      const response = await axios.put(`${URL}/subadmin/vendor/lab/status/${vendorId}`, {}, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        // Update local state
        setLabVendors(prevVendors => 
          prevVendors.map(vendor => 
            vendor._id === vendorId 
              ? { ...vendor, isActive: response.data.data.isActive }
              : vendor
          )
        );

        // Update current vendor if it's the one being updated
        if (currentLabVendor && currentLabVendor._id === vendorId) {
          setCurrentLabVendor(prev => ({
            ...prev,
            isActive: response.data.data.isActive
          }));
        }

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setLabVendorsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update vendor status';
      setLabVendorsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLabVendorsLoading(false);
    }
  };

  // ✅ GET INACTIVE LABS
  const getInactiveLabsSubadmin = async (filters = {}) => {
    try {
      setLabVendorsLoading(true);
      setLabVendorsError(null);

      const {
        page = 1,
        limit = 10,
        country = "",
        state = "",
        city = ""
      } = filters;

      const params = {
        page,
        limit,
        country,
        state,
        city
      };

      const response = await axios.get(`${URL}/subadmin/vendor/lab/inactive`, {
        headers: getAuthHeaders(),
        params
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        setLabVendorsError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch inactive labs';
      setLabVendorsError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLabVendorsLoading(false);
    }
  };
  

  // ✅ CLEAR ERRORS
  const clearLabVendorErrors = () => {
    setLabVendorsError(null);
    setLabVendorError(null);
    setLabVendorStatsError(null);
  };

  // ✅ CLEAR CURRENT VENDOR
  const clearCurrentLabVendor = () => {
    setCurrentLabVendor(null);
  };

  // ✅ REFRESH LAB VENDORS DATA
  const refreshLabVendors = async (filters = {}) => {
    return await getLabVendorsSubadmin(filters);
  };

  const [tests, setTests] = useState([]);
const [testsLoading, setTestsLoading] = useState(false);
const [testsError, setTestsError] = useState(null);
const [testStats, setTestStats] = useState(null);
const [testStatsLoading, setTestStatsLoading] = useState(false);
const [testStatsError, setTestStatsError] = useState(null);
const [currentTest, setCurrentTest] = useState(null);
const [testLoading, setTestLoading] = useState(false);
const [testError, setTestError] = useState(null);
  // ✅ CREATE TEST
const createTestSubadmin = async (testData) => {
    try {
        setTestsLoading(true);
        setTestsError(null);

        const { name, category } = testData;

        if (!name || !category) {
            setTestsError("All fields are required");
            return { success: false, message: "All fields are required" };
        }

        const response = await axios.post(`${URL}/subadmin/vendor/labtest/create`, 
            { name, category },
            { headers: getAuthHeaders() }
        );

        if (response.data.success) {
            // Add to local state
            setTests(prev => [response.data.data, ...prev]);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } else {
            setTestsError(response.data.message);
            return { success: false, message: response.data.message };
        }
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to create test';
        setTestsError(errorMessage);
        return { success: false, message: errorMessage };
    } finally {
        setTestsLoading(false);
    }
};
// ✅ GET ALL TESTS
const getTestsSubadmin = async (filters = {}) => {
    try {
        setTestsLoading(true);
        setTestsError(null);

        const {
            page = 1,
            limit = 10,
            search = "",
            category = "",
            sortBy = "createdAt",
            sortOrder = "desc"
        } = filters;

        const params = {
            page,
            limit,
            search,
            category,
            sortBy,
            sortOrder
        };

        const response = await axios.get(`${URL}/subadmin/vendor/labtest/all`, {
            headers: getAuthHeaders(),
            params
        });

        if (response.data.success) {
            setTests(response.data.data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } else {
            setTestsError(response.data.message);
            return { success: false, message: response.data.message };
        }
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch tests';
        setTestsError(errorMessage);
        return { success: false, message: errorMessage };
    } finally {
        setTestsLoading(false);
    }
};

// ✅ GET TEST BY ID
const getTestByIdSubadmin = async (testId) => {
    try {
        setTestLoading(true);
        setTestError(null);

        if (!testId) {
            setTestError("Test ID is required");
            return { success: false, message: "Test ID is required" };
        }

        const response = await axios.get(`${URL}/subadmin/vendor/labtest/${testId}`, {
            headers: getAuthHeaders()
        });

        if (response.data.success) {
            setCurrentTest(response.data.data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } else {
            setTestError(response.data.message);
            return { success: false, message: response.data.message };
        }
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch test details';
        setTestError(errorMessage);
        return { success: false, message: errorMessage };
    } finally {
        setTestLoading(false);
    }
};

// ✅ UPDATE TEST
const updateTestSubadmin = async (testId, testData) => {
    try {
        setTestsLoading(true);
        setTestsError(null);

        if (!testId) {
            setTestsError("Test ID is required");
            return { success: false, message: "Test ID is required" };
        }

        const { name, category } = testData;

        if (!name || !category) {
            setTestsError("All fields are required");
            return { success: false, message: "All fields are required" };
        }

        const response = await axios.put(`${URL}/subadmin/vendor/labtest/update/${testId}`, 
            { name, category },
            { headers: getAuthHeaders() }
        );

        if (response.data.success) {
            // Update local state
            setTests(prevTests => 
                prevTests.map(test => 
                    test._id === testId ? response.data.data : test
                )
            );

            // Update current test if it's the one being updated
            if (currentTest && currentTest._id === testId) {
                setCurrentTest(response.data.data);
            }

            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } else {
            setTestsError(response.data.message);
            return { success: false, message: response.data.message };
        }
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to update test';
        setTestsError(errorMessage);
        return { success: false, message: errorMessage };
    } finally {
        setTestsLoading(false);
    }
};

// ✅ DELETE TEST
const deleteTestSubadmin = async (testId) => {
    try {
        setTestsLoading(true);
        setTestsError(null);

        if (!testId) {
            setTestsError("Test ID is required");
            return { success: false, message: "Test ID is required" };
        }

        const response = await axios.delete(`${URL}/subadmin/vendor/labtest/delete/${testId}`, {
            headers: getAuthHeaders()
        });

        if (response.data.success) {
            // Remove from local state
            setTests(prevTests => prevTests.filter(test => test._id !== testId));
            
            // Clear current test if it's the one being deleted
            if (currentTest && currentTest._id === testId) {
                setCurrentTest(null);
            }

            return {
                success: true,
                message: response.data.message
            };
        } else {
            setTestsError(response.data.message);
            return { success: false, message: response.data.message };
        }
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete test';
        setTestsError(errorMessage);
        return { success: false, message: errorMessage };
    } finally {
        setTestsLoading(false);
    }
};

// ✅ GET TEST STATISTICS
const getTestStatsSubadmin = async () => {
    try {
        setTestStatsLoading(true);
        setTestStatsError(null);

        const response = await axios.get(`${URL}/subadmin/vendor/labtest/stats`, {
            headers: getAuthHeaders()
        });

        if (response.data.success) {
            setTestStats(response.data.data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } else {
            setTestStatsError(response.data.message);
            return { success: false, message: response.data.message };
        }
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch test statistics';
        setTestStatsError(errorMessage);
        return { success: false, message: errorMessage };
    } finally {
        setTestStatsLoading(false);
    }
};

// ✅ CLEAR TEST ERRORS
const clearTestErrors = () => {
    setTestsError(null);
    setTestError(null);
    setTestStatsError(null);
};

// ✅ CLEAR CURRENT TEST
const clearCurrentTest = () => {
    setCurrentTest(null);
};

// ✅ VENDOR MANAGEMENT STATE (SUBADMIN)
const [vendorsSub, setVendorsSub] = useState([]);
const [vendorsLoadingSub, setVendorsLoadingSub] = useState(false);
const [vendorsErrorSub, setVendorsErrorSub] = useState(null);

// ✅ PRODUCT MANAGEMENT STATE (SUBADMIN)
const [productsSub, setProductsSub] = useState([]);
const [productsLoadingSub, setProductsLoadingSub] = useState(false);
const [productsErrorSub, setProductsErrorSub] = useState(null);

// ✅ MEDICINE MANAGEMENT STATE (SUBADMIN)
const [medicinesSub, setMedicinesSub] = useState([]);
const [medicinesLoadingSub, setMedicinesLoadingSub] = useState(false);
const [medicinesErrorSub, setMedicinesErrorSub] = useState(null);

// ✅ DELIVERY CHARGES STATE (SUBADMIN)
const [deliveryChargesSub, setDeliveryChargesSub] = useState(null);
const [deliveryChargesLoadingSub, setDeliveryChargesLoadingSub] = useState(false);
const [deliveryChargesErrorSub, setDeliveryChargesErrorSub] = useState(null);

// State for pagination and filters
const [paginationSub, setPaginationSub] = useState({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  hasNext: false,
  hasPrev: false
});

// State for stats
const [statsSub, setStatsSub] = useState({
  vendors: {},
  products: {},
  medicines: {}
});

// ✅ VENDOR MANAGEMENT FUNCTIONS (SUBADMIN)

// Get all pharmacy vendors
const getPharmacyVendorsSubadmin = async (filters = {}) => {
  try {
    setVendorsLoadingSub(true);
    setVendorsErrorSub(null);

    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      country = "",
      state = "",
      city = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = filters;

    const params = {
      page,
      limit,
      search,
      status,
      country,
      state,
      city,
      sortBy,
      sortOrder
    };

    const response = await axios.get(`${URL}/subadmin/pharmacy`, {
      headers: getAuthHeaders(),
      params
    });
    console.log("Vendor List Response:", response);

    if (response.data.success) {
      setVendorsSub(response.data.data.vendors);
      setPaginationSub(response.data.data.pagination);
      setStatsSub(prev => ({
        ...prev,
        vendors: response.data.data.stats
      }));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setVendorsErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch pharmacy vendors';
    setVendorsErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setVendorsLoadingSub(false);
  }
};

// Get single pharmacy vendor by ID
const getPharmacyVendorByIdSubadmin = async (vendorId) => {
  try {
    setVendorsLoadingSub(true);
    setVendorsErrorSub(null);

    if (!vendorId) {
      setVendorsErrorSub("Vendor ID is required");
      return { success: false, message: "Vendor ID is required" };
    }

    const response = await axios.get(`${URL}/subadmin/pharmacy/${vendorId}`, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setVendorsErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch vendor details';
    setVendorsErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setVendorsLoadingSub(false);
  }
};

// Get pharmacy vendors statistics
const getPharmacyVendorsStatsSubadmin = async () => {
  try {
    setVendorsLoadingSub(true);
    setVendorsErrorSub(null);

    const response = await axios.get(`${URL}/subadmin/pharmacy/stats`, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      setStatsSub(prev => ({
        ...prev,
        vendors: response.data.data.stats
      }));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setVendorsErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch vendor statistics';
    setVendorsErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setVendorsLoadingSub(false);
  }
};

// Get all vendors (legacy)
const getAllVendorsListsSubadmin = async (filters = {}) => {
  try {
    setVendorsLoadingSub(true);
    setVendorsErrorSub(null);

    const { page = 1, limit = 10, search = "", country = "", state = "", city = "" } = filters;

    const params = {
      page,
      limit,
      search,
      country,
      state,
      city
    };

    const response = await axios.get(`${URL}/subadmin/pharmacy/vendors/all`, {
      headers: getAuthHeaders(),
      params
    });
    console.log("Vendor List Response:", response);

    if (response.data.success) {
      setVendorsSub(response.data.details);
      setPaginationSub(prev => ({
        ...prev,
        currentPage: page,
        totalPages: response.data.pages,
        totalItems: response.data.details.length
      }));
      
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } else {
      setVendorsErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch vendors list';
    setVendorsErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setVendorsLoadingSub(false);
  }
};

// Get monthly pharmacy stats
const getPharmacyStatsSubadmin = async () => {
  try {
    setVendorsLoadingSub(true);
    setVendorsErrorSub(null);

    const response = await axios.get(`${URL}/subadmin/pharmacy/vendors/stats/monthly`, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.details,
        message: response.data.message
      };
    } else {
      setVendorsErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch monthly stats';
    setVendorsErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setVendorsLoadingSub(false);
  }
};

// Get inactive pharmacies
const getInactivePharmaciesSubadmin = async (filters = {}) => {
  try {
    setVendorsLoadingSub(true);
    setVendorsErrorSub(null);

    const { page = 1, limit = 10, country = "", state = "", city = "" } = filters;

    const params = {
      page,
      limit,
      country,
      state,
      city
    };

    const response = await axios.get(`${URL}/subadmin/pharmacy/vendors/inactive`, {
      headers: getAuthHeaders(),
      params
    });

    if (response.data.success) {
      setVendorsSub(response.data.details);
      setPaginationSub(prev => ({
        ...prev,
        currentPage: page,
        totalPages: response.data.pages,
        totalItems: response.data.details.length
      }));
      
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } else {
      setVendorsErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch inactive pharmacies';
    setVendorsErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setVendorsLoadingSub(false);
  }
};

// Update vendor status (enable/disable)
const updateVendorStatusSubadmin = async (vendorId) => {
  try {
    setVendorsLoadingSub(true);
    setVendorsErrorSub(null);

    if (!vendorId) {
      setVendorsErrorSub("Vendor ID is required");
      return { success: false, message: "Vendor ID is required" };
    }

    const response = await axios.patch(`${URL}/subadmin/pharmacy/vendors/${vendorId}/status`, {}, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      // Update local state
      setVendorsSub(prevVendors => 
        prevVendors.map(vendor => 
          vendor._id === vendorId ? { ...vendor, isActive: !vendor.isActive } : vendor
        )
      );
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setVendorsErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to update vendor status';
    setVendorsErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setVendorsLoadingSub(false);
  }
};



// ✅ PRODUCT MANAGEMENT FUNCTIONS (SUBADMIN)

// Upload product Excel
const uploadProductExcelSubadmin = async (file) => {
  try {
    setProductsLoadingSub(true);
    setProductsErrorSub(null);

    if (!file) {
      setProductsErrorSub("File is required");
      return { success: false, message: "File is required" };
    }

    const formData = new FormData();
    formData.append('productFile', file);

    const response = await axios.post(`${URL}/subadmin/pharmacy/products/upload`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setProductsErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to upload product Excel';
    setProductsErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setProductsLoadingSub(false);
  }
};

// Get all products
const getAllProductsSubadmin = async () => {
  try {
    setProductsLoadingSub(true);
    setProductsErrorSub(null);

    const response = await axios.get(`${URL}/subadmin/pharmacy/products/all`, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      setProductsSub(response.data.details);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } else {
      setProductsErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch products';
    setProductsErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setProductsLoadingSub(false);
  }
};
const updateProductSubadmin = useCallback(async (productId, updateData) => {
    try {
      // 1. Set loading state and clear previous errors
      setProductsLoadingSub(true);
      setProductsErrorSub(null);

      // 2. Make the PUT request to the update endpoint
      const response = await axios.put(
        `${URL}/subadmin/pharmacy/products/${productId}`,
        updateData,
        {
          headers: getAuthHeaders()
        }
      );

      // 3. Handle success response from the API
      if (response.data.success) {
        toast.success(response.data.message || 'Product updated successfully!');
        
        // IMPORTANT: Refresh the product list to ensure UI is in sync
        await getAllProductsSubadmin();
        
        return { success: true, message: response.data.message };
      } 
      // 4. Handle failure response from the API
      else {
        setProductsErrorSub(response.data.message);
        toast.error(response.data.message || 'Could not update product.');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      // 5. Handle network or server errors
      const errorMessage = err.response?.data?.message || 'An error occurred while updating the product';
      setProductsErrorSub(errorMessage);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      // 6. Ensure loading state is turned off
      setProductsLoadingSub(false);
    }
  }, [getAllProductsSubadmin]); // Add getAllProductsSubadmin as a dependency


// Delete single product
const deleteProductSubadmin = async (productId) => {
  try {
    setProductsLoadingSub(true);
    setProductsErrorSub(null);

    if (!productId) {
      setProductsErrorSub("Product ID is required");
      return { success: false, message: "Product ID is required" };
    }

    const response = await axios.delete(`${URL}/subadmin/pharmacy/products/${productId}`, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      // Remove from local state
      setProductsSub(prevProducts => prevProducts.filter(product => product._id !== productId));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setProductsErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to delete product';
    setProductsErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setProductsLoadingSub(false);
  }
};

// Delete multiple products
const deleteMultipleProductsSubadmin = async (productIds) => {
  try {
    setProductsLoadingSub(true);
    setProductsErrorSub(null);

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      setProductsErrorSub("Product IDs array is required");
      return { success: false, message: "Product IDs array is required" };
    }

    const response = await axios.delete(`${URL}/subadmin/pharmacy/products/bulk/delete`, {
      headers: getAuthHeaders(),
      data: { ids: productIds }
    });

    if (response.data.success) {
      // Remove from local state
      setProductsSub(prevProducts => 
        prevProducts.filter(product => !productIds.includes(product._id))
      );
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setProductsErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to delete products';
    setProductsErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setProductsLoadingSub(false);
  }
};

// ✅ MEDICINE MANAGEMENT FUNCTIONS (SUBADMIN)

// Upload medicine Excel
const uploadMedicineExcelSubadmin = async (file) => {
  try {
    setMedicinesLoadingSub(true);
    setMedicinesErrorSub(null);

    if (!file) {
      setMedicinesErrorSub("File is required");
      return { success: false, message: "File is required" };
    }

    const formData = new FormData();
    formData.append('medicineFile', file);

    const response = await axios.post(`${URL}/subadmin/pharmacy/medicines/upload`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setMedicinesErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to upload medicine Excel';
    setMedicinesErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setMedicinesLoadingSub(false);
  }
};

// Get all medicines
const getAllMedicinesSubadmin = async () => {
  try {
    setMedicinesLoadingSub(true);
    setMedicinesErrorSub(null);

    const response = await axios.get(`${URL}/subadmin/pharmacy/medicines/all`, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      setMedicinesSub(response.data.details);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } else {
      setMedicinesErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch medicines';
    setMedicinesErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setMedicinesLoadingSub(false);
  }
};

// Update medicine
const updateMedicineSubadmin = async (medicineId, updateData) => {
  try {
    setMedicinesLoadingSub(true);
    setMedicinesErrorSub(null);

    if (!medicineId) {
      setMedicinesErrorSub("Medicine ID is required");
      return { success: false, message: "Medicine ID is required" };
    }

    const response = await axios.put(`${URL}/subadmin/pharmacy/medicines/update?Id=${medicineId}`, updateData, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      // Update local state
      setMedicinesSub(prevMedicines => 
        prevMedicines.map(medicine => 
          medicine._id === medicineId ? response.data.details : medicine
        )
      );
      
      return {
        success: true,
        data: response.data.details,
        message: response.data.message
      };
    } else {
      setMedicinesErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to update medicine';
    setMedicinesErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setMedicinesLoadingSub(false);
  }
};

// Get pending medicines
const [pendingMedicinesSub,setPendingMedicinesSub] = useState([]);
// Get pending medicines (SUBADMIN)
const getPendingMedicinesSubadmin = async () => {
  try {
    setMedicinesLoadingSub(true);
    setMedicinesErrorSub(null);

    const response = await axios.get(
      `${URL}/subadmin/pharmacy/medicines/pending`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success === 1) {
      setPendingMedicinesSub(response.data.details); // <-- store list
      return {
        success: 1,
        data: response.data.details,
        message: response.data.message,
      };
    } else {
      setMedicinesErrorSub(response.data.message);
      return { success: 0, message: response.data.message };
    }
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || "Failed to fetch pending medicines";
    setMedicinesErrorSub(errorMessage);
    return { success: 0, message: errorMessage };
  } finally {
    setMedicinesLoadingSub(false);
  }
};

// Approve medicine (SUBADMIN)
const approveMedicineSubadmin = async (medicineId) => {
  try {
    setMedicinesLoadingSub(true);
    setMedicinesErrorSub(null);

    const response = await axios.patch(
      `${URL}/subadmin/pharmacy/medicines/approve/${medicineId}`,
      {},
      { headers: getAuthHeaders() }
    );

    if (response.data.success === 1) {
      return {
        success: 1,
        data: response.data.details,
        message: response.data.message,
      };
    } else {
      setMedicinesErrorSub(response.data.message);
      return { success: 0, message: response.data.message };
    }
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || "Failed to approve medicine";
    setMedicinesErrorSub(errorMessage);
    return { success: 0, message: errorMessage };
  } finally {
    setMedicinesLoadingSub(false);
  }
};

// Reject medicine (SUBADMIN)
const rejectMedicineSubadmin = async (medicineId) => {
  try {
    setMedicinesLoadingSub(true);
    setMedicinesErrorSub(null);

    const response = await axios.patch(
      `${URL}/subadmin/pharmacy/medicines/reject/${medicineId}`,
      {},
      { headers: getAuthHeaders() }
    );

    if (response.data.success === 1) {
      return {
        success: 1,
        data: response.data.details,
        message: response.data.message,
      };
    } else {
      setMedicinesErrorSub(response.data.message);
      return { success: 0, message: response.data.message };
    }
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || "Failed to reject medicine";
    setMedicinesErrorSub(errorMessage);
    return { success: 0, message: errorMessage };
  } finally {
    setMedicinesLoadingSub(false);
  }
};

// ✅ DELETE A SINGLE MEDICINE (SUB-ADMIN)
const deleteMedicineSubadmin = async (medicineId) => {
  try {
    setMedicinesLoadingSub(true);
    setMedicinesErrorSub(null);

    if (!medicineId) {
      const errorMessage = "Medicine ID is required for deletion";
      setMedicinesErrorSub(errorMessage);
      return { success: false, message: errorMessage };
    }

    const response = await axios.delete(`${URL}/subadmin/pharmacy/medicines/${medicineId}`, {
      headers: getAuthHeaders()
    });

    if (response.data.success) {
      // Remove the deleted medicine from the local state
      setMedicinesSub(prevMedicines =>
        prevMedicines.filter(medicine => medicine._id !== medicineId)
      );
      
      return {
        success: true,
        message: response.data.message
      };
    } else {
      setMedicinesErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to delete medicine';
    setMedicinesErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setMedicinesLoadingSub(false);
  }
};
const deleteMultipleMedicinesSubadmin = async (medicineIds) => {
  try {
    setMedicinesLoadingSub(true);
    setMedicinesErrorSub(null);

    if (!medicineIds || !Array.isArray(medicineIds) || medicineIds.length === 0) {
      const errorMessage = "An array of medicine IDs is required for bulk deletion";
      setMedicinesErrorSub(errorMessage);
      return { success: false, message: errorMessage };
    }

    const response = await axios.delete(`${URL}/subadmin/pharmacy/medicines/bulk/delete`, {
      headers: getAuthHeaders(),
      data: { ids: medicineIds } // Send the array of IDs in the request body
    });

    if (response.data.success) {
      // Remove all deleted medicines from the local state
      setMedicinesSub(prevMedicines =>
        prevMedicines.filter(medicine => !medicineIds.includes(medicine._id))
      );
      
      return {
        success: true,
        message: response.data.message
      };
    } else {
      setMedicinesErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to delete medicines';
    setMedicinesErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setMedicinesLoadingSub(false);
  }
};

// ✅ DELIVERY CHARGES FUNCTIONS (SUBADMIN)

// Get delivery charges
const getDeliveryChargesSubadmin = async () => {
  try {
    setLoadingCharges(true);
    setChargesError(null);
    
    const token = getUserToken();
    
    const { data } = await axios.get(`${URL}/subadmin/pharmacy/delivery-charges`, {
      headers: getAuthHeaders(),
    });

    if (data?.success === 1) {
      setDeliveryChargesSub(data.data);
      return { success: true, data: data.data };
    } else {
      throw new Error(data?.message || "Failed to fetch delivery charges");
    }
  } catch (error) {
    console.error('Get delivery charges error:', error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch delivery charges";
    setChargesError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setLoadingCharges(false);
  }
};

const updateDeliveryChargesSubadmin = async (chargesData) => {
  try {
    setLoadingCharges(true);
    setChargesError(null);
    
    const token = getUserToken();
    
    console.log('Making PATCH request to subadmin delivery charges');
    
    const { data } = await axios.patch(
      `${URL}/subadmin/pharmacy/delivery-charges/update`, 
      chargesData, 
      {
              headers: getAuthHeaders(),
              contentType: 'application/json'

      }
    );

    if (data?.success === 1) {
      setDeliveryChargesSub(data.data);
      return { success: true, message: "Delivery charges updated successfully" };
    } else {
      throw new Error(data?.message || "Failed to update delivery charges");
    }
  } catch (error) {
    console.error('Update delivery charges error:', error);
    console.error('Error response:', error.response);
    
    const errorMessage = error.response?.data?.message || error.message || "Failed to update delivery charges";
    setChargesError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setLoadingCharges(false);
  }
};


// Get delivery charges history
const getDeliveryChargesHistorySubadmin = async (page = 1, limit = 10) => {
  try {
    setDeliveryChargesLoadingSub(true);
    setDeliveryChargesErrorSub(null);

    const params = { page, limit };

    const response = await axios.get(`${URL}/subadmin/pharmacy/delivery-charges/history`, {
      headers: getAuthHeaders(),
      params
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      setDeliveryChargesErrorSub(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch delivery charges history';
    setDeliveryChargesErrorSub(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setDeliveryChargesLoadingSub(false);
  }
};

// Clear errors
const clearErrorsSubadmin = () => {
  setVendorsErrorSub(null);
  setProductsErrorSub(null);
  setMedicinesErrorSub(null);
  setDeliveryChargesErrorSub(null);
};



const getSubAdminToken = () => {
  const subAdmin = JSON.parse(sessionStorage.getItem("subadmin"));
  return subAdmin?.token;
};

// 👉 About Us State
const [subAdminAboutUsData, setSubAdminAboutUsData] = useState(null);


const getSubAdminAboutUs = async () => {
  setLoading(true);
  clearError();

  try {

    const response = await axios.get(
      `${URL}/subadmin/about-us/get`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success === 1) {
      setSubAdminAboutUsData(response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, "Failed to fetch About Us data");
  } finally {
    setLoading(false);
  }
};


const updateSubAdminAboutUs = async (formData) => {
  setLoading(true);
  clearError();

  try {
    const token = getAuthHeaders();

    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/subadmin/about-us/update`,
      formData,
      { headers: getAuthHeaders() }
    );

    if (response.data.success === 1) {
      setSubAdminAboutUsData(response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, "Failed to update About Us");
  } finally {
    setLoading(false);
  }
};


const uploadSubAdminAboutUsImage = async (file) => {
  setLoading(true);
  clearError();

  try {
    const token = getAuthHeaders();
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/subadmin/about-us/upload`,
      formData,
      { headers: getAuthHeaders() }
    );

    if (response.data.success === 1) {
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    return handleError(error, "Failed to upload image");
  } finally {
    setLoading(false);
  }
};

////....... scinece sub admin ..........
 const getSubAdminSciencePage = async () => {
    setLoading(true);
    clearError();

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/subadmin/science`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success === 1) {
        setSciencePage(response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      return handleError(err, "Failed to fetch science page content");
    } finally {
      setLoading(false);
    }
  };

  const updateSubAdminSciencePage = async (updateData) => {
    setLoading(true);
    clearError();

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/subadmin/science`,
        updateData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success === 1) {
        setSciencePage(response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      return handleError(err, "Failed to update science page");
    } finally {
      setLoading(false);
    }
  };


  const addSubAdminSciencePageItem = async (type, data) => {
    setLoading(true);
    clearError();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/subadmin/science/add-item`,
        { type, data },
        { headers: getAuthHeaders() }
      );

      if (response.data.success === 1) {
        setSciencePage(response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      return handleError(err, "Failed to add science page item");
    } finally {
      setLoading(false);
    }
  };


  const removeSubAdminSciencePageItem = async (type, index) => {
    setLoading(true);
    clearError();

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/subadmin/science/remove-item`,
        {
          headers: getAuthHeaders(),
          data: { type, index },
        }
      );

      if (response.data.success === 1) {
        setSciencePage(response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      return handleError(err, "Failed to remove science page item");
    } finally {
      setLoading(false);
    }
  };

 
  const uploadSubAdminScienceImages = async (formData) => {
    setLoading(true);
    clearError();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/subadmin/science/upload`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success === 1) {
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      return handleError(err, "Failed to upload science page images");
    } finally {
      setLoading(false);
    }
  };
/// blogs sub admin .........

// STATE
const [subAdminBlogs, setSubAdminBlogs] = useState([]);
const [subAdminBlogDetails, setSubAdminBlogDetails] = useState(null);
const [subAdminSubheadings, setSubAdminSubheadings] = useState([]);


const getSubAdminBlogs = async (page = 1, limit = 10) => {
  setLoading(true);
  clearError();

  try {
    const response = await axios.get(
      `${URL}/subadmin/blogs/getadminblog?page=${page}&limit=${limit}`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success === 1) {
      setSubAdminBlogs(response.data.details);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    return handleError(err, "Failed to fetch blogs");
  } finally {
    setLoading(false);
  }
};


const searchSubAdminBlogs = async (query) => {
  setLoading(true);
  clearError();

  try {
    const response = await axios.get(
      `${URL}/subadmin/blogs/search-blog?q=${query}`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success === 1) {
      setSubAdminBlogs(response.data.details);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    return handleError(err, "Failed to search blogs");
  } finally {
    setLoading(false);
  }
};


const createSubAdminBlog = async (formData) => {
  setLoading(true);
  clearError();

  try {
    const response = await axios.post(
      `${URL}/subadmin/blogs/create-blog`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (err) {
    return handleError(err, "Failed to create blog");
  } finally {
    setLoading(false);
  }
};


const getSubAdminBlogDetails = async (id) => {
  setLoading(true);
  clearError();

  try {
    const response = await axios.get(
      `${URL}/subadmin/blogs/get-blog/${id}`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success === 1) {
      setSubAdminBlogDetails(response.data.details);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    return handleError(err, "Failed to fetch blog details");
  } finally {
    setLoading(false);
  }
};


const deleteSubAdminBlog = async (id) => {
  setLoading(true);
  clearError();

  try {
    const response = await axios.delete(
      `${URL}/subadmin/blogs/delete-blog/${id}`,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (err) {
    return handleError(err, "Failed to delete blog");
  } finally {
    setLoading(false);
  }
};


const updateSubAdminBlog = async (id, formData) => {
  setLoading(true);
  clearError();

  try {
    const response = await axios.patch(
      `${URL}/subadmin/blogs/update-blog/${id}`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (err) {
    return handleError(err, "Failed to update blog");
  } finally {
    setLoading(false);
  }
};


const createSubAdminSubheading = async (data) => {
  setLoading(true);
  clearError();

  try {
    const response = await axios.post(
      `${URL}/subadmin/blogs/add-subheading`,
      data,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (err) {
    return handleError(err, "Failed to add subheading");
  } finally {
    setLoading(false);
  }
};


const getSubAdminSubheadingList = async (blogId) => {
  setLoading(true);
  clearError();

  try {
    const response = await axios.get(
      `${URL}/subadmin/blogs/get/${blogId}`,
      { headers: getAuthHeaders() }
    );

    if (response.data.success === 1) {
      setSubAdminSubheadings(response.data.details);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    return handleError(err, "Failed to fetch subheadings");
  } finally {
    setLoading(false);
  }
};


const updateSubAdminSubheading = async (id, body) => {
  setLoading(true);
  clearError();

  try {
    const response = await axios.patch(
      `${URL}/subadmin/blogs/update-subheading/${id}`,
      body,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (err) {
    return handleError(err, "Failed to update subheading");
  } finally {
    setLoading(false);
  }
};


const deleteSubAdminSubheading = async (mainFormId, subheadingId) => {
  setLoading(true);
  clearError();

  try {
    const response = await axios.delete(
      `${URL}/subadmin/blogs/remove/${mainFormId}/${subheadingId}`,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (err) {
    return handleError(err, "Failed to delete subheading");
  } finally {
    setLoading(false);
  }
};


 // Fetch lab delivery charges
  const fetchLabDeliveryChargesSub = async () => {
    setLoadingCharges(true);
    clearError();

    try {
      const response = await axios.get(
        `${URL}/subadmin-lab-delivery-charges/get`,
        { headers: getAuthHeaders() }
      );

      console.log("Lab Delivery Charges Response:", response.data);

      if (response.data.success) {
        setLabDeliveryCharges(response.data.data);
        return response.data;
      } else {
        return handleError(
          new Error(response.data.message),
          "Failed to fetch lab delivery charges"
        );
      }

    } catch (error) {
      return handleError(error, "An error occurred while fetching lab delivery charges");
    } finally {
      setLoadingCharges(false);
    }
  };

  // Update lab delivery charges using PATCH
  const updateLabDeliveryChargesSub = async (updatedCharges) => {
    setLoadingCharges(true);
    clearError();

    try {
      const response = await axios.patch(
        `${URL}/subadmin-lab-delivery-charges/update`,
        updatedCharges,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setLabDeliveryCharges(response.data.data);
        return { success: true, data: response.data.data };
      } else {
        return handleError(
          new Error(response.data.message),
          "Failed to update lab delivery charges"
        );
      }

    } catch (error) {
      return handleError(error, "An error occurred while updating lab delivery charges");
    } finally {
      setLoadingCharges(false);
    }
  };

// ============ Brand Images Subadmin Start ==============
 
const [brandsSub, setBrandsSub] = useState([]);
  const [loadingSub, setLoadingSub] = useState(false);
  const [errorSub, setErrorSub] = useState(null);
 
  // =============================================
  // BRANDS API FUNCTIONS (SUBADMIN - UNIQUE NAMES)
  // =============================================
 
  // 1. GET ALL BRANDS (SUBADMIN)
  const getAllBrandsSub = async () => {
    setLoadingSub(true);
    setErrorSub(null);
    const token = sessionStorage.getItem('subadmintoken');
    console.log('🔄 getAllBrandsSub called with Token:', token);
   
    try {
     
      const response = await axios.get(
        `${URL}/subadmin/upload-image-brand/sub/get-all`,
        {
          headers: {
            token: token
          }
        }
      );
     
      console.log('✅ Brands response:', response.data);
     
      if (response.data.success) {
        setBrandsSub(response.data.data || []);
      } else {
        setErrorSub(response.data.message || 'Failed to fetch brands');
      }
     
      return response.data;
    } catch (error) {
      console.error('❌ Get Brands Error:', error);
      const errorMsg = error.response?.data?.message ||
                      error.response?.data?.error ||
                      error.message ||
                      'Failed to fetch brands';
      setErrorSub(errorMsg);
      throw error;
    } finally {
      setLoadingSub(false);
    }
  };
 
  // 2. CREATE BRAND (SUBADMIN)
  const createBrandSub = async (formData) => {
    console.log('🔄 createBrandSub called');
    setLoadingSub(true);
    setErrorSub(null);
    const token = sessionStorage.getItem('subadmintoken');
    try {
      const response = await axios.post(
        `${URL}/subadmin/upload-image-brand/sub/add`,
        formData,
        {
          headers: {
            token: token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log('🔄 createBrandSub response received',getAuthHeaders);
     
      console.log('✅ Create brand response:', response.data);
     
      if (response.data.success) {
        // Refresh the brands list
        await getAllBrandsSub();
      }
     
      return response.data;
    } catch (error) {
      console.error('❌ Create Brand Error:', error);
      const errorMsg = error.response?.data?.message ||
                      error.response?.data?.error ||
                      error.message ||
                      'Failed to create brand';
      setErrorSub(errorMsg);
      throw error;
    } finally {
      setLoadingSub(false);
    }
  };
 
  // 3. UPDATE BRAND (SUBADMIN)
  const updateBrandSub = async (id, formData) => {
    setLoadingSub(true);
    setErrorSub(null);
    const token = sessionStorage.getItem('subadmintoken');
    try {
 
     
      const response = await axios.put(
        `${URL}/subadmin/upload-image-brand/sub/update/${id}`,
        formData,
        {
          headers: {
            token: token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
     
      console.log('✅ Update brand response:', response.data);
     
      if (response.data.success) {
        // Refresh the brands list
        await getAllBrandsSub();
      }
     
      return response.data;
    } catch (error) {
      console.error('❌ Update Brand Error:', error);
      const errorMsg = error.response?.data?.message ||
                      error.response?.data?.error ||
                      error.message ||
                      'Failed to update brand';
      setErrorSub(errorMsg);
      throw error;
    } finally {
      setLoadingSub(false);
    }
  };
 
  // 4. DELETE BRAND (SUBADMIN)
// 4. DELETE BRAND (SUBADMIN) - FIXED
const deleteBrandSub = async (id) => {
  console.log('🔄 deleteBrandSub called for ID:', id);
  setLoadingSub(true);
  setErrorSub(null);
 
  const token = sessionStorage.getItem('subadmintoken');
 
  // Safety check: Agar token nahi hai to request mat bhejo
  if (!token) {
      console.error("Token missing for delete request");
      setErrorSub("Authentication failed. Please login again.");
      setLoadingSub(false);
      return;
  }
 
  try {
    // Axios DELETE syntax: axios.delete(url, { headers: ... })
    // Notice: Yahan humne 'Content-Type' hata diya hai
    const response = await axios.delete(
      `${URL}/subadmin/upload-image-brand/sub/delete/${id}`,
      {
        headers: {
          token: token
        }
      }
    );
   
    console.log('✅ Delete response:', response.data);
 
    if (response.data.success) {
      // Remove from local state immediately (Optimistic UI update)
      setBrandsSub(prev => prev.filter(brand => brand._id !== id));
    } else {
       throw new Error(response.data.message || "Delete failed from server");
    }
   
    return response.data;
  } catch (error) {
    console.error('❌ Delete Brand Error:', error);
    const errorMsg = error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Failed to delete brand';
    setErrorSub(errorMsg);
    throw error;
  } finally {
    setLoadingSub(false);
  }
};
 
  // =============================================
  // CLEAR ERROR FUNCTION
  // =============================================
  const clearErrorSub = () => {
    setErrorSub(null);
  };
// ============ Brand Images Subadmin End ==============
// ===========  Footer Management for Subadmin ==============
const [loadingFooter, setLoadingFooter] = useState(false);
const [errorFooter, setErrorFooter] = useState(null);
const [footerData, setFooterData] = useState(null);
const [policyData, setPolicyData] = useState(null);

// ✅ Banks Logos States (same naming convention as your existing state)
const [banksLogoData, setBanksLogoData] = useState([]);
const [banksLogoLoading, setBanksLogoLoading] = useState(false);
const [banksLogoError, setBanksLogoError] = useState(null);
const [banksLogoMessage, setBanksLogoMessage] = useState('');

// Clear bank logos error function
const clearBanksLogoError = () => {
  setBanksLogoError(null);
  setBanksLogoMessage('');
};

// =============================================
// BANKS LOGOS APIs
// =============================================

// ✅ GET ALL BANKS LOGOS
// ✅ GET BANKS LOGO FUNCTION
const getBanksLogo = async () => {
  const token = sessionStorage.getItem('subadmintoken');
  setBanksLogoLoading(true);
  setBanksLogoError(null);
  setBanksLogoMessage('');

  try {
    console.log('Fetching banks logos from:', `${process.env.REACT_APP_API_URL}/footerSub/get-banks-logo`);
    console.log('Token:', token ? 'Present' : 'Missing');
    
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/footerSub/get-banks-logo`,
      {
        headers: {
          token: token
        }
      }
    );

    console.log('API Response:', response.data);

    if (response.data.success) {
      const logos = response.data.data?.banksLogos || response.data.data || [];
      console.log('Logos data:', logos);
      setBanksLogoData(logos);
      setBanksLogoMessage('Bank logos loaded successfully');
    } else {
      console.log('API returned success false:', response.data.error);
      setBanksLogoError(response.data.error || 'Failed to fetch logos');
    }
  } catch (error) {
    console.error('Error fetching bank logos:', error);
    console.error('Error response:', error.response);
    const errorMsg = error.response?.data?.error || error.message || 'Network error';
    setBanksLogoError(errorMsg);
  } finally {
    setBanksLogoLoading(false);
  }
};

// ✅ CREATE MULTIPLE BANKS LOGOS
const createBanksLogo = async (formData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setBanksLogoLoading(true);
  setBanksLogoError(null);
  setBanksLogoMessage('');

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/footerSub/create-banks-logo`,
      formData,
      {
        headers: {
          token: token,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data.success) {
      setBanksLogoMessage(response.data.message || 'Logos uploaded successfully');
      // Refresh logos
      await getBanksLogo();
    }

    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    setBanksLogoError(errorMsg);
    throw error;
  } finally {
    setBanksLogoLoading(false);
  }
};

// ✅ UPDATE BANK LOGO DETAILS
const updateBanksLogo = async (logoId, updateData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setBanksLogoLoading(true);
  setBanksLogoError(null);
  setBanksLogoMessage('');

  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/footerSub/update-banks-logo/${logoId}`,
      updateData,
      {
        headers: {
          token: token,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      setBanksLogoMessage(response.data.message || 'Logo updated successfully');
      // Update local state
      setBanksLogoData(prevLogos =>
        prevLogos.map(logo =>
          logo._id === logoId
            ? { ...logo, ...updateData }
            : logo
        )
      );
    }

    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    setBanksLogoError(errorMsg);
    throw error;
  } finally {
    setBanksLogoLoading(false);
  }
};

// ✅ UPDATE BANK LOGO IMAGE
const updateBanksLogoImage = async (logoId, formData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setBanksLogoLoading(true);
  setBanksLogoError(null);
  setBanksLogoMessage('');

  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/footerSub/update-banks-logo-image/${logoId}`,
      formData,
      {
        headers: {
          token: token,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data.success) {
      setBanksLogoMessage(response.data.message || 'Logo image updated successfully');
      // Refresh logos
      await getBanksLogo();
    }

    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    setBanksLogoError(errorMsg);
    throw error;
  } finally {
    setBanksLogoLoading(false);
  }
};

// ✅ DELETE SINGLE BANK LOGO
const deleteBanksLogo = async (logoId) => {
  const token = sessionStorage.getItem('subadmintoken');
  setBanksLogoLoading(true);
  setBanksLogoError(null);
  setBanksLogoMessage('');

  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/footerSub/delete-banks-logo/${logoId}`,
      {
        headers: {
          token: token
        }
      }
    );

    if (response.data.success) {
      setBanksLogoMessage(response.data.message || 'Logo deleted successfully');
      // Remove from local state
      setBanksLogoData(prevLogos =>
        prevLogos.filter(logo => logo._id !== logoId)
      );
    }

    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    setBanksLogoError(errorMsg);
    throw error;
  } finally {
    setBanksLogoLoading(false);
  }
};

// ✅ DELETE ALL BANK LOGOS
const deleteAllBanksLogo = async () => {
  const token = sessionStorage.getItem('subadmintoken');
  setBanksLogoLoading(true);
  setBanksLogoError(null);
  setBanksLogoMessage('');

  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/footerSub/delete-all-banks-logo`,
      {
        headers: {
          token: token
        }
      }
    );

    if (response.data.success) {
      setBanksLogoMessage(response.data.message || 'All logos deleted successfully');
      // Clear local state
      setBanksLogoData([]);
    }

    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    setBanksLogoError(errorMsg);
    throw error;
  } finally {
    setBanksLogoLoading(false);
  }
};

// ✅ REORDER BANK LOGOS
const reorderBanksLogo = async (logoOrders) => {
  const token = sessionStorage.getItem('subadmintoken');
  setBanksLogoLoading(true);
  setBanksLogoError(null);
  setBanksLogoMessage('');

  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/footerSub/reorder-banks-logo`,
      { logoOrders },
      {
        headers: {
          token: token,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      setBanksLogoMessage(response.data.message || 'Logos reordered successfully');
      // Update local state with new order
      const updatedLogos = logoOrders.map(orderItem => {
        const logo = banksLogoData.find(l => l._id === orderItem.logoId);
        return logo ? { ...logo, order: orderItem.order } : null;
      }).filter(Boolean);

      setBanksLogoData(updatedLogos);
    }

    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    setBanksLogoError(errorMsg);
    throw error;
  } finally {
    setBanksLogoLoading(false);
  }
};

// =============================================
// EXISTING FOOTER APIs
// =============================================

// 1. GET POLICY
const getPolicy = async () => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoadingFooter(true);
  setErrorFooter(null);

  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/footerSub/get-policy`,
      {
        headers: {
          token: token
        }
      }
    );

    if (response.data.success) {
      setPolicyData(response.data);
    }

    return response.data;
  } catch (error) {
    setErrorFooter(error.response?.data?.error || error.message);
    throw error;
  } finally {
    setLoadingFooter(false);
  }
};

// 2. CREATE POLICY
const createPolicy = async (policyData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoadingFooter(true);
  setErrorFooter(null);

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/footerSub/create-policy`,
      policyData,
      {
        headers: {
          token: token,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    setErrorFooter(error.response?.data?.error || error.message);
    throw error;
  } finally {
    setLoadingFooter(false);
  }
};

// 3. UPDATE POLICY
const updatePolicy = async (policyData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoadingFooter(true);
  setErrorFooter(null);

  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/footerSub/update-policy`,
      policyData,
      {
        headers: {
          token: token,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    setErrorFooter(error.response?.data?.error || error.message);
    throw error;
  } finally {
    setLoadingFooter(false);
  }
};

// 4. GET FOOTER CONTENT
const getContent = async () => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoadingFooter(true);
  setErrorFooter(null);

  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/footerSub/get-footer`,
      {
        headers: {
          token: token
        }
      }
    );

    if (response.data.success) {
      setFooterData(response.data.data);
    }

    return response.data;
  } catch (error) {
    setErrorFooter(error.response?.data?.error || error.message);
    throw error;
  } finally {
    setLoadingFooter(false);
  }
};

// 5. CREATE FOOTER CONTENT
const createContent = async (formData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoadingFooter(true);
  setErrorFooter(null);

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/footerSub/create-footer`,
      formData,
      {
        headers: {
          token: token,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    setErrorFooter(error.response?.data?.error || error.message);
    throw error;
  } finally {
    setLoadingFooter(false);
  }
};

// 6. UPDATE FOOTER CONTENT
const updateContent = async (id, formData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoadingFooter(true);
  setErrorFooter(null);

  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/footerSub/update-footer/${id}`,
      formData,
      {
        headers: {
          token: token,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    setErrorFooter(error.response?.data?.error || error.message);
    throw error;
  } finally {
    setLoadingFooter(false);
  }
};

// Clear error function

// END
 // ============ Video Management for Subadmin ==============
const [loadingVideo, setLoadingVideo] = useState(false);
const [errorVideo, setErrorVideo] = useState(null);
const [videos, setVideos] = useState(null); // ⚠️ CHANGED: array se null kiya
 
// =============================================
// 1. CREATE VIDEO
// =============================================
const createVideo = async (formData) => {
  const token = sessionStorage.getItem('subadmintoken');
 
  if (!token) {
    const error = 'Authentication token not found';
    setErrorVideo(error);
    throw new Error(error);
  }
 
  setLoadingVideo(true);
  setErrorVideo(null);
 
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/video/video/subAdmin`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // ⚠️ FIXED: Proper Authorization header
        }
      }
    );
   
    console.log('Create Video Response:', response.data);
   
    // After creation, fetch updated videos
    if (response.data.success === 1) {
      await getVideos();
    }
   
    return response.data;
  } catch (error) {
    console.error('Create Video Error:', error);
    const errorMsg = error.response?.data?.message || error.message;
    setErrorVideo(errorMsg);
    throw error;
  } finally {
    setLoadingVideo(false);
  }
};
 
// =============================================
// 2. UPDATE VIDEO
// =============================================
const updateVideo = async (id, formData) => {
  const token = sessionStorage.getItem('subadmintoken');
 
  if (!token) {
    const error = 'Authentication token not found';
    setErrorVideo(error);
    throw new Error(error);
  }
 
  setLoadingVideo(true);
  setErrorVideo(null);
 
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/video/update/subAdmin/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // ⚠️ FIXED: Proper Authorization header
        }
      }
    );
   
    console.log('Update Video Response:', response.data);
   
    // After update, fetch updated videos
    if (response.data.success === 1) {
      await getVideos();
    }
   
    return response.data;
  } catch (error) {
    console.error('Update Video Error:', error);
    const errorMsg = error.response?.data?.message || error.message;
    setErrorVideo(errorMsg);
    throw error;
  } finally {
    setLoadingVideo(false);
  }
};
 
// =============================================
// 3. GET VIDEOS - FIXED VERSION
// =============================================
const getVideos = async () => {
  const token = sessionStorage.getItem('subadmintoken');
 
  if (!token) {
    const error = 'Authentication token not found. Please login again.';
    setErrorVideo(error);
    console.error(error);
    return;
  }
 
  setLoadingVideo(true);
  setErrorVideo(null);
 
  try {
    console.log('🔍 Fetching videos from:', `${process.env.REACT_APP_API_URL}/video/getVideo/subAdmin`);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
   
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/video/getVideo/subAdmin`,
      {
        headers: {
          'Authorization': `Bearer ${token}`, // ⚠️ FIXED: Proper Authorization header
          'Content-Type': 'application/json'
        }
      }
    );
   
    console.log('✅ Full API Response:', response.data);
    console.log('📊 Response structure:', {
      success: response.data.success,
      hasVideos: !!response.data.videos,
      hasData: !!response.data.data,
      hasDetails: !!response.data.details,
      responseKeys: Object.keys(response.data)
    });
   
    // Handle different response structures
    if (response.data.success === 1 || response.data.success === true) {
      let videoData = null;
     
      // Case 1: response.data.videos array
      if (response.data.videos && Array.isArray(response.data.videos) && response.data.videos.length > 0) {
        videoData = response.data.videos[0];
        console.log('📹 Found videos in array:', videoData);
      }
      // Case 2: response.data.videos single object
      else if (response.data.videos && typeof response.data.videos === 'object' && !Array.isArray(response.data.videos)) {
        videoData = response.data.videos;
        console.log('📹 Found videos as object:', videoData);
      }
      // Case 3: response.data.data
      else if (response.data.data) {
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          videoData = response.data.data[0];
        } else if (typeof response.data.data === 'object') {
          videoData = response.data.data;
        }
        console.log('📹 Found data:', videoData);
      }
      // Case 4: response.data.details
      else if (response.data.details) {
        if (Array.isArray(response.data.details) && response.data.details.length > 0) {
          videoData = response.data.details[0];
        } else if (typeof response.data.details === 'object') {
          videoData = response.data.details;
        }
        console.log('📹 Found details:', videoData);
      }
      // Case 5: Direct video properties
      else if (response.data.video1 || response.data.video2 || response.data._id) {
        videoData = response.data;
        console.log('📹 Found direct video data:', videoData);
      }
     
      if (videoData) {
        setVideos(videoData);
        console.log('✅ Videos set successfully:', videoData);
      } else {
        setVideos(null);
        console.warn('⚠️ No video data found in response');
        setErrorVideo('No videos found');
      }
    } else {
      throw new Error(response.data.message || 'Failed to fetch videos');
    }
   
    return response.data;
  } catch (error) {
    console.error('❌ Get Videos Error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
   
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch videos';
    setErrorVideo(errorMsg);
    setVideos(null);
    throw error;
  } finally {
    setLoadingVideo(false);
  }
};
 // =========== Contact us ===========
const [loadingContact, setLoadingContact] = useState(false);
const [errorContact, setErrorContact] = useState(null);
const [contactDataSub, setContactDataSub] = useState(null);
 
// =============================================
// 1. GET CONTACT DETAILS
// =============================================
const getContact = async () => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoadingContact(true);
  setErrorContact(null);
 
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/contactUsSub/get-contact`,
      {
        headers: {
          token: token
        }
      }
    );
   
    if (response.data.success) {
      setContactDataSub(response.data.data);
    }
   
    return response.data;
  } catch (error) {
    setErrorContact(error.response?.data?.message || error.message);
    throw error;
  } finally {
    setLoadingContact(false);
  }
};
 
// =============================================
// 2. ADD CONTACT DETAILS
// =============================================
const addContact = async (contactData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoadingContact(true);
  setErrorContact(null);
 
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/contactUsSub/create-contact`,
      contactData,
      {
        headers: {
          token: token,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    setErrorContact(error.response?.data?.message || error.message);
    throw error;
  } finally {
    setLoadingContact(false);
  }
};
 
// =============================================
// 3. UPDATE CONTACT DETAILS
// =============================================
const updateContact = async (contactData) => {
  const token = sessionStorage.getItem('subadmintoken');
  setLoadingContact(true);
  setErrorContact(null);
 
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/contactUsSub/update-contact`,
      contactData,
      {
        headers: {
          token: token,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    setErrorContact(error.response?.data?.message || error.message);
    throw error;
  } finally {
    setLoadingContact(false);
  }
};
 
 // ============ YouTube Management for Subadmin ==============
const [youtubeLoading, setYoutubeLoading] = useState(false);
const [youtubeError, setYoutubeError] = useState(null);
const [youtubeLinks, setYoutubeLinks] = useState([]);
 
// =============================================
// 1. ADD YOUTUBE LINK
// =============================================
const addYoutubeLink = async (youtubeData) => {
  const token = sessionStorage.getItem('subadmintoken');
 
  if (!token) {
    const error = 'Authentication token not found';
    setYoutubeError(error);
    throw new Error(error);
  }
 
  setYoutubeLoading(true);
  setYoutubeError(null);
 
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/video/add-youtube-link/subAdmin`,
      youtubeData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
   
    console.log('Add YouTube Link Response:', response.data);
   
    if (response.data.success === 1) {
      // Refresh YouTube links
      await getYoutubeLinks();
    }
   
    return response.data;
  } catch (error) {
    console.error('Add YouTube Link Error:', error);
    const errorMsg = error.response?.data?.message || error.message;
    setYoutubeError(errorMsg);
    throw error;
  } finally {
    setYoutubeLoading(false);
  }
};
 
// =============================================
// 2. GET YOUTUBE LINKS
// =============================================
const getYoutubeLinks = async () => {
  const token = sessionStorage.getItem('subadmintoken');
 
  if (!token) {
    const error = 'Authentication token not found';
    setYoutubeError(error);
    console.error(error);
    return;
  }
 
  setYoutubeLoading(true);
  setYoutubeError(null);
 
  try {
    console.log('🔍 Fetching YouTube links from:', `${process.env.REACT_APP_API_URL}/video/get-youtube-links/subAdmin`);
   
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/upload-videos/get-youtube-links`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
   
    console.log('✅ YouTube Links Response:', response.data);
   
    if (response.data.success === 1) {
      setYoutubeLinks(response.data.youtubeLinks || []);
    } else {
      setYoutubeLinks([]);
      setYoutubeError(response.data.message || 'No YouTube links found');
    }
   
    return response.data;
  } catch (error) {
    console.error('❌ Get YouTube Links Error:', error);
   
    let errorMsg = 'Failed to fetch YouTube links';
    if (error.response?.status === 401) {
      errorMsg = 'Unauthorized. Please login again.';
    } else if (error.response?.status === 403) {
      errorMsg = 'Access forbidden. Check subadmin permissions.';
    } else {
      errorMsg = error.response?.data?.message || error.message || 'Failed to fetch YouTube links';
    }
   
    setYoutubeError(errorMsg);
    setYoutubeLinks([]);
    throw error;
  } finally {
    setYoutubeLoading(false);
  }
};
 
// =============================================
// 3. UPDATE YOUTUBE LINK
// =============================================
const updateYoutubeLink = async (linkId, youtubeData) => {
  const token = sessionStorage.getItem('subadmintoken');
 
  if (!token) {
    const error = 'Authentication token not found';
    setYoutubeError(error);
    throw new Error(error);
  }
 
  setYoutubeLoading(true);
  setYoutubeError(null);
 
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/video/update-youtube-link/subAdmin/${linkId}`,
      youtubeData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
   
    console.log('Update YouTube Link Response:', response.data);
   
    if (response.data.success === 1) {
      // Refresh YouTube links
      await getYoutubeLinks();
    }
   
    return response.data;
  } catch (error) {
    console.error('Update YouTube Link Error:', error);
    const errorMsg = error.response?.data?.message || error.message;
    setYoutubeError(errorMsg);
    throw error;
  } finally {
    setYoutubeLoading(false);
  }
};
 
// =============================================
// 4. DELETE YOUTUBE LINK
// =============================================
const deleteYoutubeLink = async (linkId) => {
  const token = sessionStorage.getItem('subadmintoken');
 
  if (!token) {
    const error = 'Authentication token not found';
    setYoutubeError(error);
    throw new Error(error);
  }
 
  setYoutubeLoading(true);
  setYoutubeError(null);
 
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/video/delete-youtube-link/subAdmin/${linkId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
   
    console.log('Delete YouTube Link Response:', response.data);
   
    if (response.data.success === 1) {
      // Refresh YouTube links
      await getYoutubeLinks();
    }
   
    return response.data;
  } catch (error) {
    console.error('Delete YouTube Link Error:', error);
    const errorMsg = error.response?.data?.message || error.message;
    setYoutubeError(errorMsg);
    throw error;
  } finally {
    setYoutubeLoading(false);
  }
};
 // =========== distance Limit for subadmin ==============
const [distanceLimitSub, setDistanceLimitSub] = useState(null);
const [loadingDistanceSub, setLoadingDistanceSub] = useState(false);
const [errorDistanceSub, setErrorDistanceSub] = useState(null);
// Fetch distance limit
const fetchDistanceLimitSub = async () => {
  setLoadingDistanceSub(true);
  setErrorDistanceSub(null);
  try {
    const token = sessionStorage.getItem('subadmintoken');
    const response = await axios.get(
      `${URL}/distance/subadmin/get-distance-limit`,
      { headers: { token: token } }
    );  
    if (response.data.success) {
      setDistanceLimitSub(response.data.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    setErrorDistanceSub(error.message);
    throw error;
  } finally {
    setLoadingDistanceSub(false);
  }
};
// Update distance limit
// Update distance limit
const updateDistanceLimitSub = async (id, newLimitSub) => {
  setLoadingDistanceSub(true);
  setErrorDistanceSub(null);
 
  try {
    const token = sessionStorage.getItem('subadmintoken');
 
    const response = await axios.put(
      `${URL}/distance/subadmin/update-distance-limit/${id}`,
      newLimitSub,
      { headers: { token: token } }
    );
 
    return response.data;
 
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    setErrorDistanceSub(errorMsg);
    throw new Error(errorMsg);
 
  } finally {
    setLoadingDistanceSub(false);
  }
};



const [loadingCancellationSettingsSub, setLoadingCancellationSettingsSub] = useState(false);
  const [errorCancellationSettingsSub, setErrorCancellationSettingsSub] = useState(null);
  
  const [loadingUpdateSettingsSub, setLoadingUpdateSettingsSub] = useState(false);
  const [errorUpdateSettingsSub, setErrorUpdateSettingsSub] = useState(null);
  
  // =============================================
  // SUBADMIN CANCELLATION APIS (ONLY GET & UPDATE)
  // =============================================
  
  // ✅ GET - Fetch cancellation settings for subadmin
  const getCancellationSettingsSub = async () => {
    setLoadingCancellationSettingsSub(true);
    setErrorCancellationSettingsSub(null);
    try {
      const token = sessionStorage.getItem('subadmintoken');
      if (!token) {
        throw new Error('SubAdmin token not found. Please login again.');
      }
      
      const response = await axios.get(
        `${URL}/subadmin-cancellation/cancellation-settings`,
        { 
          headers: { 
            token: token,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        return response.data.data; // Return only settings data
      } else {
        throw new Error(response.data.message || 'Failed to fetch settings');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setErrorCancellationSettingsSub(errorMessage);
      throw error;
    } finally {
      setLoadingCancellationSettingsSub(false);
    }
  };
  
  // ✅ PUT - Update cancellation settings for subadmin
  const updateCancellationSettingsSub = async (settingsData) => {
    setLoadingUpdateSettingsSub(true);
    setErrorUpdateSettingsSub(null);
    try {
      const token = sessionStorage.getItem('subadmintoken');
      if (!token) {
        throw new Error('SubAdmin token not found. Please login again.');
      }
      
      const response = await axios.put(
        `${URL}/subadmin-cancellation/update-settings`,
        settingsData,
        { 
          headers: { 
            'Content-Type': 'application/json',
            token: token,
            
          } 
        }
      );
      
      if (response.data.success) {
        return response.data; // Return success response
      } else {
        throw new Error(response.data.message || 'Failed to update settings');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setErrorUpdateSettingsSub(errorMessage);
      throw error;
    } finally {
      setLoadingUpdateSettingsSub(false);
    }
  };
// =========== distance Limit for subadmin end ==============
  
// ============ Sub-Admin Care Program ============
const [careProgramDataSub, setCareProgramDataSub] = useState(null);
const [carePageLoadingSub, setCarePageLoadingSub] = useState(false);
const [carePageErrorSub, setCarePageErrorSub] = useState(null);
 
// Helper function to get sub-admin token
const getSubAdminTokenY = () => {
  const token = sessionStorage.getItem('subadmintoken');
  if (!token) {
    throw new Error('Sub-admin authentication token not found');
  }
  return token;
};
 
// 1. GET ALL DATA (Sub-Admin)
const fetchCareProgramDataSub = async () => {
  setCarePageLoadingSub(true);
  setCarePageErrorSub(null);
  try {
    const token = getSubAdminTokenY();
   
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/care/sub/get-all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
   
    console.log("📥 Sub-Admin Care Program API Response:", response.data);
   
    if (response.data.success) {
      setCareProgramDataSub(response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch data");
    }
  } catch (error) {
    console.error("❌ Error fetching sub-admin care program data:", error);
    let errorMessage = "Error loading data";
   
    if (error.response) {
      errorMessage = error.response.data?.message || `Server Error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = "No response from server.";
    } else {
      errorMessage = error.message;
    }
   
    setCarePageErrorSub(errorMessage);
    return null;
  } finally {
    setCarePageLoadingSub(false);
  }
};
 
// 2. MAIN UPDATE API (Text + Images) - Sub-Admin
const updateCareProgramSub = async (formData) => {
  setCarePageLoadingSub(true);
  try {
    const token = getSubAdminTokenY();
   
    const { data } = await axios.put(`${process.env.REACT_APP_API_URL}/care/sub/update`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
 
    if (data.success) {
      console.log("✅ Care Program Updated Successfully:", data.data);
      setCareProgramDataSub(data.data);
      return { success: true, data: data.data };
    } else {
      throw new Error(data.message || "Update failed");
    }
  } catch (error) {
    console.error("❌ Update Error:", error);
    const errorMsg = error.response?.data?.message || error.message || "Failed to update content";
    setCarePageErrorSub(errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    setCarePageLoadingSub(false);
  }
};
 
// 3. ADD ITEMS (Feature, Doctor, Stat) - Sub-Admin
// 3. ADD ITEMS (Feature, Doctor, Stat) - Sub-Admin - FIXED VERSION
const addItemToSectionSub = async (type, itemData) => {
  let endpoint = "";
  if (type === "feature") endpoint = "/care/sub/add-feature";
  if (type === "doctor") endpoint = "/care/sub/add-doctor";
  if (type === "stat") endpoint = "/care/sub/add-stat";
 
  try {
    const token = getSubAdminTokenY();
   
    // Debug log
    console.log(`📤 Sub-admin adding ${type}:`, {
      endpoint,
      itemData,
      typeOfData: typeof itemData
    });
   
    // STATS KE LIYE application/json USE KARENGE
    // Doctor/Feature ke liye multipart/form-data (kyunki unme images hain)
    const isStat = type === "stat";
   
    let headers = {
      'Authorization': `Bearer ${token}`
    };
   
    let dataToSend = itemData;
   
    if (isStat) {
      // Stats ke liye application/json
      headers['Content-Type'] = 'application/json';
      // Data already JSON format me hai
    } else {
      // Doctor/Feature ke liye FormData (kyunki unme images hain)
      headers['Content-Type'] = 'multipart/form-data';
     
      // Agar itemData FormData nahi hai, to convert karenge
      if (!(itemData instanceof FormData)) {
        const formData = new FormData();
        Object.keys(itemData).forEach(key => {
          if (itemData[key] !== null && itemData[key] !== undefined) {
            formData.append(key, itemData[key]);
          }
        });
        dataToSend = formData;
      }
    }
   
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}${endpoint}`,
      dataToSend,
      { headers }
    );
 
    if (response.data.success) {
      console.log(`✅ ${type} added successfully:`, response.data.data);
      await fetchCareProgramDataSub(); // Refresh data
      return { success: true, data: response.data.data };
    } else {
      throw new Error(response.data.message || `Error adding ${type}`);
    }
  } catch (error) {
    console.error(`❌ Error adding ${type}:`, error);
    console.error('Error details:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.message || error.message || `Error adding ${type}`;
    return { success: false, error: errorMsg };
  }
};
 
// 4. DELETE ITEMS - Sub-Admin
const deleteItemFromSectionSub = async (type, id) => {
  let endpoint = "";
  if (type === "feature") endpoint = `/care/sub/feature/${id}`;
  if (type === "doctor") endpoint = `/care/sub/doctor/${id}`;
  if (type === "stat") endpoint = `/care/sub/stat/${id}`;
 
  try {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
 
    const token = getSubAdminTokenY();
   
    const { data } = await axios.delete(`${process.env.REACT_APP_API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
 
    if (data.success) {
      console.log(`✅ ${type} deleted successfully`);
      await fetchCareProgramDataSub(); // Refresh data
      return { success: true, message: `${type} deleted successfully` };
    } else {
      throw new Error(data.message || `Error deleting ${type}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting ${type}:`, error);
    const errorMsg = error.response?.data?.message || error.message || `Error deleting ${type}`;
    return { success: false, error: errorMsg };
  }
};
 
// 5. UPDATE INDIVIDUAL ITEM - Sub-Admin
const updateIndividualItemSub = async (type, formData) => {
  const endpoint = `/care/sub/${type}/update`;
  try {
    const token = getSubAdminTokenY();
   
    const { data } = await axios.post(`${process.env.REACT_APP_API_URL}${endpoint}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
   
    if (data.success) {
      console.log(`✅ ${type} updated successfully:`, data.data);
      await fetchCareProgramDataSub();
      return { success: true, data: data.data };
    } else {
      throw new Error(data.message || `Update failed for ${type}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${type}:`, error);
    const errorMsg = error.response?.data?.message || error.message || `Update failed for ${type}`;
    return { success: false, error: errorMsg };
  }
};
 
// 6. TOGGLE PUBLISH - Sub-Admin
const togglePublishStatusSub = async (status) => {
  try {
    const token = getSubAdminTokenY();
   
    const { data } = await axios.put(
      `${process.env.REACT_APP_API_URL}/care/sub/toggle-publish`,
      { isPublished: status },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
   
    if (data.success) {
      console.log(`✅ Page ${status ? 'Published' : 'Unpublished'}:`, data.data);
      setCareProgramDataSub(prev => ({ ...prev, isPublished: status }));
      return { success: true, data: data.data };
    } else {
      throw new Error(data.message || "Error changing status");
    }
  } catch (error) {
    console.error("❌ Error changing publish status:", error);
    const errorMsg = error.response?.data?.message || error.message || "Error changing status";
    return { success: false, error: errorMsg };
  }
};
 
// 7. UPDATE SECTION - Sub-Admin
const updateSectionSub = async (section, data) => {
  try {
    const token = getSubAdminTokenY();
   
    const response = await axios.patch(
      `${process.env.REACT_APP_API_URL}/care/sub/update-section`,
      { section, data },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
   
    if (response.data.success) {
      console.log(`✅ Section ${section} updated:`, response.data.data);
      setCareProgramDataSub(response.data.data);
      return { success: true, data: response.data.data };
    } else {
      throw new Error(response.data.message || "Error updating section");
    }
  } catch (error) {
    console.error(`❌ Error updating section ${section}:`, error);
    const errorMsg = error.response?.data?.message || error.message || "Error updating section";
    return { success: false, error: errorMsg };
  }
};
 
// 8. UPLOAD SINGLE IMAGE - Sub-Admin
const uploadImageSub = async (type, file) => {
  let endpoint = "";
  if (type === "banner") endpoint = "/care/sub/upload/banner";
  else if (type === "doctor") endpoint = "/care/sub/upload/doctor";
  else if (type === "feature") endpoint = "/care/sub/upload/feature";
  else if (type === "side-image") endpoint = "/care/sub/upload/side-image";
 
  try {
    const token = getSubAdminTokenY();
    const formData = new FormData();
    formData.append(type === 'banner' ? 'bannerImage' :
                    type === 'doctor' ? 'doctorImage' :
                    type === 'feature' ? 'featureImage' : 'sideImage', file);
 
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}${endpoint}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
 
    if (data.success) {
      console.log(`✅ ${type} image uploaded:`, data.data);
      return { success: true, data: data.data };
    } else {
      throw new Error(data.message || "Upload failed");
    }
  } catch (error) {
    console.error(`❌ Error uploading ${type} image:`, error);
    const errorMsg = error.response?.data?.message || error.message || "Upload failed";
    return { success: false, error: errorMsg };
  }
};
 
// 9. GET ITEM BY ID - Sub-Admin
const getItemByIdSub = async (type, id) => {
  let endpoint = "";
  if (type === "feature") endpoint = `/care/sub/feature/${id}`;
  if (type === "doctor") endpoint = `/care/sub/doctor/${id}`;
  if (type === "stat") endpoint = `/care/sub/stat/${id}`;
 
  try {
    const token = getSubAdminTokenY();
   
    const { data } = await axios.get(`${process.env.REACT_APP_API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
 
    if (data.success) {
      return { success: true, data: data.data };
    } else {
      throw new Error(data.message || "Failed to fetch item");
    }
  } catch (error) {
    console.error(`❌ Error fetching ${type}:`, error);
    const errorMsg = error.response?.data?.message || error.message || "Failed to fetch item";
    return { success: false, error: errorMsg };
  }
};
 
// 10. REORDER ITEMS - Sub-Admin
const reorderItemsSub = async (type, itemIds) => {
  let endpoint = "";
  if (type === "features") endpoint = "/care/sub/reorder/features";
  else if (type === "doctors") endpoint = "/care/sub/reorder/doctors";
  else if (type === "stats") endpoint = "/care/sub/reorder/stats";
 
  try {
    const token = getSubAdminTokenY();
   
    const { data } = await axios.put(
      `${process.env.REACT_APP_API_URL}${endpoint}`,
      { [type === 'features' ? 'featureIds' :
         type === 'doctors' ? 'doctorIds' : 'statIds']: itemIds },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
 
    if (data.success) {
      console.log(`✅ ${type} reordered successfully`);
      await fetchCareProgramDataSub();
      return { success: true, data: data.data };
    } else {
      throw new Error(data.message || "Reorder failed");
    }
  } catch (error) {
    console.error(`❌ Error reordering ${type}:`, error);
    const errorMsg = error.response?.data?.message || error.message || "Reorder failed";
    return { success: false, error: errorMsg };
  }
};
 
// 11. CLEAR ERROR - Sub-Admin
const clearCareProgramErrorSub = () => {
  setCarePageErrorSub(null);
};
 
 
const [pendingProductsSub, setPendingProductsSub] = useState([]);
 
// 1. GET API: Fetch All Products
const getPendingMedicineProductsSub = async () => {
  try {
    console.log("Fetching products...");
    const token = sessionStorage.getItem('subadmintoken');
    // Agar proxy set nahi hai to pura URL dalein
    const response = await axios.get(`${URL}/subadmin/pharmacy/products/allSub`,
      {
        headers: { token: token }
      }
    );
   
    if (response.data.success === 1) {
      // Sirf wahi products filter karein jinka status abhi decision nahi hua (Optional)
      // Agar saare dikhane hain to filter hata dein.
      // Abhi ke liye API se jo 'details' aa rahi hain wo set kar rahe hain.
      setPendingProductsSub(response.data.details);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};
 
// 2. PUT API: Update Status (Approve = 0, Reject = 1)
 
 
const updateProductStatusSub = async (id, statusValue) => {
  try {
    const token = sessionStorage.getItem('subadmintoken'); // Token fetch
   
    const payload = {
      productId: id,
      onStatus: statusValue, // 0 for Approve, 1 for Reject
    };
 
    // 1. API Call
    const response = await axios.put(`${URL}/subadmin/pharmacy/update-product-status`, payload,
      {
        headers: { token: token }
      }
    );
 
    if (response.data.success === 1) {
      alert(response.data.message);
 
      setPendingProductsSub(prevProducts => prevProducts.filter(item => item._id !== id));
     
      // Optional: Background me fresh data bhi manga sakte hain (safety ke liye)
      // getPendingMedicineProductsSub();
 
    } else {
      alert("Failed to update status: " + response.data.message);
    }
  } catch (error) {
    console.error("Error updating status:", error);
    alert(error.response?.data?.message || "Something went wrong");
  }
};
 
 
 
 
 
 




////////////////////////////// sub admin panel end...... //////////////////////////////////




////////////////////////////// vendor panel food panel //////////////////////////////////////////////////////////
// Get ordered food for vendor
// Get ordered food for vendor
  // Common function to get token with error handling
  const getToken = () => {
    const token = sessionStorage.getItem('foodtoken');
    if (!token) {
      throw new Error('Vendor not authenticated');
    }
    return token;
  };

  // Get food orders for vendor
// Get food orders for vendor
const getFoodOrdersForVendor = async (orderType) => {
  try {
    setLoading(true);
    setError(null);
    
    const foodToken = sessionStorage.getItem('foodtoken');
    if (!foodToken) throw new Error('Vendor not authenticated');

    const tokenData = JSON.parse(foodToken);
    const response = await axios.get(`${URL}/vendor-order/order`, {
      params: { orderType },
      headers: { token: tokenData.token }
    });

    if (response.data.success === 1) {
      // Return all orders without filtering, we'll filter in the component
      return {
        success: 1,
        message: "Fetched successfully",
        details: response.data.details,
        totalCount: response.data.details.length
      };
    }
    throw new Error(response.data.message || "Failed to fetch orders");
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    setError(error.message);
    return { success: 0, message: error.message };
  } finally {
    setLoading(false);
  }
};
const getBulkFoodOrdersForVendor = async () => {
  try {
    // If you have setLoading/setError states in your actual context, keep them
    // setLoading(true);
    // setError(null);

    const foodToken = sessionStorage.getItem('foodtoken');
    if (!foodToken) throw new Error('Vendor not authenticated');

    const tokenData = JSON.parse(foodToken);

    // No changes needed here. The token will be sent in the header,
    // and the backend will extract the vendor ID from it.
    const response = await axios.get(`${URL}/food-Order/getordertype`, {
      headers: { token: tokenData.token }
    });

    if (response.data.success === 1) {
      return {
        success: 1,
        message: "Fetched successfully",
        details: response.data.details,
        totalCount: response.data.totalCount
      };
    }
    throw new Error(response.data.message || "Failed to fetch bulk orders");
  } catch (error) {
    console.error("Error fetching bulk orders:", error);
    // setError(error.message); // If you have setError state
    return { success: 0, message: error.message };
  } finally {
    // setLoading(false); // If you have setLoading state
  }
};

// 1. Order Status Update
const updateFoodOrderStatus = async (id, status, reason) => {
  try {
    const token = getVendorToken();
    const response = await axios.patch(
      `${URL}/vendor-order/status/${id}?status=${status}`,
      { rejectionReason: reason }, // Body mein reason bhejo
      { headers: { token } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 2. Driver Assignment
const assignDriverToOrder = async (orderId, driverId) => {
  try {
    const token = getVendorToken();
    const response = await axios.post(
      `${URL}/vendor-order/assign-driver`,
      { orderId, driverId }, // Body mein orderId aur driverId bhejo
      { headers: { token } }
    );
    return response.data;

  } catch (error) {
    throw error;
  }
};

  // Get vendor orders by status
const getVendorOrdersByStatus = async (status, page = 1, limit = 10) => {
  try {
    // Assuming setLoading and setError are states managed in your Context Provider
    // For example:
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);
    setLoading(true);
    setError(null);
    
    const token = getVendorToken(); // This function should retrieve the JWT token
    if (!token) throw new Error('Vendor not authenticated');

    const response = await axios.get(`${URL}/vendor-order/get-order`, {
      params: { status, page, limit },
      headers: { token: token } // Sending the token in the header
    });

    if (response.data.success === 1) {
      return {
        success: 1,
        message: "Orders fetched successfully",
        details: response.data.details
      };
    }
    throw new Error(response.data.message || "Failed to fetch orders");
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    setError(error.message); // Update context error state
    return {
      success: 0,
      message: error.message
    };
  } finally {
    setLoading(false); // Update context loading state
  }
};

// Get vendor order history
const getVendorOrderHistory = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = getVendorToken();
    
    const response = await axios.get(`${URL}/vendor-order/orderHistory`, {
      headers: { token }
    });
    if (response.data.success === 1) {
      // The backend already populates the data, so no need for additional formatting
      return {
        success: 1,
        message: "Order history fetched successfully",
        details: response.data.orders
      };
    }
    throw new Error(response.data.message || "Failed to fetch order history");
  } catch (error) {
    console.error("Error fetching order history:", error);
    setError(error.message);
    return { success: 0, message: error.message };
  } finally {
    setLoading(false);
  }
};

// Common function to get vendor token with validation
const getVendorToken = () => {
  const tokenData = sessionStorage.getItem('foodtoken');
  if (!tokenData) {
    throw new Error('Vendor not authenticated - please login again');
  }
  
  try {
    const parsedToken = JSON.parse(tokenData);
    if (!parsedToken.token) {
      throw new Error('Invalid token format');
    }
    return parsedToken.token;
  } catch (error) {
    console.error('Error parsing token:', error);
    throw new Error('Invalid token data');
  }
};


// Updated getVendorAcceptedOrders function in context
const getVendorAcceptedOrders = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = getVendorToken();
    const response = await axios.get(`${URL}/vendor-order/accepted-orders`, {
      headers: { token }
    });

    if (response.data.success === 1) {
      return {
        success: 1,
        message: "Accepted orders fetched successfully",
        details: response.data.details,
        totalCount: response.data.details.length
      };
    }
    throw new Error(response.data.message || "Failed to fetch accepted orders");
  } catch (error) {
    console.error("Error fetching accepted orders:", error);
    setError(error.message);
    return { success: 0, message: error.message };
  } finally {
    setLoading(false);
  }
};
  // Get order with driver details
  const getOrderWithDriverDetails = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      const response = await axios.get(
        `${URL}/vendor-order/order-with-driver/${orderId}`,
        { headers: { token } }
      );

      if (response.data.success === 1) {
        return {
          success: 1,
          message: "Order with driver fetched successfully",
          details: response.data.details
        };
      }
      throw new Error(response.data.message || "Failed to fetch order details");
    } catch (error) {
      console.error("Error fetching order with driver:", error);
      setError(error.message);
      return {
        success: 0,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };

  // Get online drivers
 const getOnlineDriversForVendor = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = getVendorToken();
    const response = await axios.get(`${URL}/vendor-order/online-drivers`, {
      headers: { token }
    });

    if (response.data.success === 1) {
      // Add status text and ensure driver object is properly formatted
      const modifiedDrivers = response.data.details.map(driver => ({
        ...driver,
        status: driver.isBusy ? "Busy" : "Available"
      }));
      
      return {
        success: 1,
        message: "Online drivers fetched successfully",
        details: modifiedDrivers
      };
    }
    throw new Error(response.data.message || "Failed to fetch online drivers");
  } catch (error) {
    console.error("Error fetching online drivers:", error);
    setError(error.message);
    return { success: 0, message: error.message };
  } finally {
    setLoading(false);
  }
};

  // Get driver order history
  const getDriverOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getVendorToken();
      const response = await axios.get(`${URL}/vendor-order/orderHistorydriver`, {
        headers: { token }
      });

      if (response.data.success === 1) {
        // Format the response
        const formattedOrders = response.data.details.map(order => ({
          _id: order._id,
          orderId: order.orderId,
          status: order.status === "5" ? "Delivered" : "Rejected",
          statusText: order.status === "5" ? "Delivered" : "Rejected",
          totalAmount: order.totalAmount,
          deliveryAddress: order.deliveryAddress,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          rejectionReason: order.rejectionReason || null,
          user: order.userId,
          vendor: order.vendorId,
          driver: order.driverId,
          items: order.items.map(item => ({
            foodItem: item.FoodItem,
            quantity: item.quantity,
            price: item.price
          }))
        }));

        return {
          success: 1,
          message: "Order history fetched successfully",
          count: formattedOrders.length,
          details: formattedOrders
        };
      }
      throw new Error(response.data.message || "Failed to fetch driver history");
    } catch (error) {
      console.error("Error fetching driver order history:", error);
      setError(error.message);
      return {
        success: 0,
        message: error.message
      };
    } finally {
      setLoading(false);
    }
  };










// For: /admin-food/addCategory
const createCategory = async (formData) => {
  try {
    const { data } = await axios.post(`${URL}/admin-food/addCategory`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        token : tokenS.token
      }
    });
    return data;
  } catch (error) {
    console.error("Error creating category:", error);
    return error.response.data || { success: 0, message: "Failed to create category" };
  }
};
// For: /admin-food/getcategory
const getCategory = async () => {
  try {
    // Assuming tokenS is available in the scope
    const { data } = await axios.get(`${URL}/admin-food/getcategory`, {
      headers: { 
        token : tokenS.token
      }
    });
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return error.response.data || { success: 0, message: "Failed to fetch categories" };
  }
};
// For: /admin-food/addmeal
const addMeal1 = async (formData) => {
  try {
    const { data } = await axios.post(`${URL}/admin-food/addmeal`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        token : tokenS.token
      }
    });
    return data;
  } catch (error) {
    console.error("Error adding meal:", error);
    return error.response.data || { success: 0, message: "Failed to add meal" };
  }
};
// For: /admin-food/getmeal
const getMeals = async () => {
  try {
    // Assuming you have a configured 'api' instance for making calls
    const token = getVendorToken();
    const { data } = await axios.get(`${URL}/admin-food/getmeal`, {
      headers: { token }
    });
    return data;
  } catch (error) {
    // Handle error appropriately
    console.error("Error fetching meals:", error);
    return { success: 0, message: "Failed to fetch meals" };
  }
};

// For: /admin-food/FoodVendors
const getFoodVendorsLists = async (page = 1, limit = 10) => {
  try {
    const token = getVendorToken();
    const { data } = await axios.get(`${URL}/admin-food/FoodVendors?page=${page}&limit=${limit}`, {
      headers: { token }
    });
    return data;
  } catch (error) {
    console.error("Error fetching active vendors:", error);
    return { success: 0, message: "Failed to fetch active vendors" };
  }
};

// For: /admin-food/inactivefood
const getInactiveFoodVendors1 = async (page = 1, limit = 10) => {
  try {
    const token = getVendorToken();
    const { data } = await axios.get(`${URL}/admin-food/inactivefood?page=${page}&limit=${limit}`, {
      headers: { token }
    });
    return data;
  } catch (error) {
    console.error("Error fetching inactive vendors:", error);
    return { success: 0, message: "Failed to fetch inactive vendors" };
  }
};

// For: /admin-food/getfoodstatus
const getFoodVendorStats = async () => {
  try {
    const token = getVendorToken();
    const { data } = await axios.get(`${URL}/admin-food/getfoodstatus`, {
      headers: { token }
    });
    return data;
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    return { success: 0, message: "Failed to fetch vendor stats" };
  }
};

const getmealvendor = async () => {
  try {
    // Set loading state to true before starting the API call.
    setLoading(true);

    // Retrieve the vendor's authentication token.
    const token = getVendorToken();

    // Make the GET request to the '/food/getmeals' endpoint.
    // The token is passed in the request headers for authorization.
    const response = await axios.get(`${URL}/food/getmeals`, {
      headers: { token }
    });

    // Return the data part of the response on success.
    return response.data;

  } catch (err) {
    // If an error occurs, update the error state with the message.
    // It prioritizes the error message from the API response, otherwise uses the general error message.
    setError(err.response?.data?.message || err.message);

    // Return a standardized error object.
    return { success: 0, message: err.message };

  } finally {
    // Set loading state to false after the API call is complete (either success or failure).
    setLoading(false);
  }
};
const getFood = async (page = 1, limit = 10, foodCategory = "all") => {
    try {
      setLoading(true);
      const token = getVendorToken();
      const response = await axios.get(`${URL}/food/getfood`, {
        params: { page, limit, foodCategory },
        headers: { token }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return { success: 0, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Creates a new food item.
   * @param {FormData} foodData - The form data containing all food details and images.
   * @returns {object} The API response.
   */
  const createFood = async (foodData) => {
    try {
      setLoading(true);
      const token = getVendorToken();
      const response = await axios.post(`${URL}/food/addfood`, foodData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token
        }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return { success: 0, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Edits an existing food item.
   * @param {string} id - The ID of the food item to edit.
   * @param {FormData} foodData - The form data with updated details.
   * @returns {object} The API response.
   */
  const editFood = async (id, foodData) => {
    try {
      setLoading(true);
      const token = getVendorToken();
      const response = await axios.patch(`${URL}/food/edit/${id}`, foodData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token
        }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return { success: 0, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Updates the status of a food item to "removed" (status: 1).
   * @param {string} id - The ID of the food item.
   * @returns {object} The API response.
   */
  const updateFoodStatus = async (id) => {
    try {
      setLoading(true);
      const token = getVendorToken();
      const response = await axios.patch(`${URL}/food/status/${id}`, {}, { headers: { token } });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return { success: 0, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Fetches all food items with status 1 (removed items).
   * @returns {object} The API response with removed food list.
   */
  const getRemovedData = async () => {
    try {
      setLoading(true);
      const token = getVendorToken();
      const response = await axios.get(`${URL}/food/deleteStatus`, { headers: { token } });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return { success: 0, message: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * @description Searches for food items based on a query.
   * @param {string} q - The search query.
   * @returns {object} The API response with search results.
   */
  const searchFood = async (q) => {
    try {
      setLoading(true);
      const token = getVendorToken();
      const response = await axios.get(`${URL}/food/search`, {
          params: { q, vendorId: 'your_vendor_id' }, // vendorId should be dynamic
          headers: { token }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return { success: 0, message: err.message };
    } finally {
      setLoading(false);
    }
  };


  // --- CATEGORY MANAGEMENT FUNCTIONS ---

  /**
   * @description Fetches all unique food categories.
   * @returns {object} The API response with category list.
   */
  const getFoodCategories = useCallback(async () => {
    try {
      setLoading(true);
      // This endpoint is public, so no token is needed.
      const response = await axios.get(`${URL}/food/getCategory`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return { success: 0, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * @description Fetches sub-categories for a given category name.
   * @param {string} name - The name of the parent category.
   * @returns {object} The API response with sub-category list.
   */
  const getFoodSubcategories = async (name) => {
    try {
      setLoading(true);
      const token = getVendorToken();
      const response = await axios.get(`${URL}/food/getSubCategory`, {
        params: { name },
        headers: { token }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return { success: 0, message: err.message };
    } finally {
      setLoading(false);
    }
  };



  //  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);


  // Create availability
  const createAvailability = async (availabilityData) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getVendorToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/food-available/available`,
        availabilityData,
        { headers: { token } }
      );

      if (response.data.success === 1) {
        // Refresh availabilities after creation
        await getVendorAvailabilities();
        return {
          success: 1,
          message: response.data.message,
          data: response.data.data
        };
      }
      throw new Error(response.data.message || "Failed to create availability");
    } catch (error) {
      console.error("Error creating availability:", error);
      setError(error.message);
      return { success: 0, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get vendor availabilities
  const getVendorAvailabilities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getVendorToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/food-available/startdate`,
        { headers: { token } }
      );

      if (response.data.success === 1) {
        setAvailabilities(response.data.details || []);
        return {
          success: 1,
          message: "Availabilities fetched successfully",
          details: response.data.details
        };
      }
      throw new Error(response.data.message || "Failed to fetch availabilities");
    } catch (error) {
      console.error("Error fetching availabilities:", error);
      setError(error.message);
      return { success: 0, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get availability by date range
  const getAvailabilityByDateRange = async (startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getVendorToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/food-available/timeavailability`,
        { startDate, endDate },
        { headers: { token } }
      );

      if (response.data.success === 1) {
        return {
          success: 1,
          message: "Availability fetched successfully",
          details: response.data.details
        };
      }
      throw new Error(response.data.message || "No availability found");
    } catch (error) {
      console.error("Error fetching availability by date:", error);
      setError(error.message);
      return { success: 0, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete availability
  const deleteAvailability = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getVendorToken();
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/food-available/remove/${id}`,
        { headers: { token } }
      );

      if (response.data.success === 1) {
        // Refresh availabilities after deletion
        await getVendorAvailabilities();
        return {
          success: 1,
          message: "Availability deleted successfully"
        };
      }
      throw new Error(response.data.message || "Failed to delete availability");
    } catch (error) {
      console.error("Error deleting availability:", error);
      setError(error.message);
      return { success: 0, message: error.message };
    } finally {
      setLoading(false);
    }
  };

////////////////////// Vendor panel pharmacy //////////////////////////////////////////////

const [products2, setProducts2] = useState([]);
const [medicines2, setMedicines2] = useState([]);
const [vendorProducts, setVendorProducts] = useState([]);
const [vendorMedicines, setVendorMedicines] = useState([]);

const [pendingOrders, setPendingOrders] = useState([]);
const [acceptedOrders, setAcceptedOrders] = useState([]);
const [activeOrders, setActiveOrders] = useState([]);
const [orderHistory2, setOrderHistory2] = useState([]);
const [availableDrivers, setAvailableDrivers] = useState([]);

const [loading2, setLoading2] = useState(false);
const [error2, setError2] = useState(null);
const [availabilities2, setAvailabilities2] = useState([]);
const hasFetched = useRef(false); // Track if we've already fetched

const getPharmacyToken = useCallback(() => {
  try {
    const tokenData = sessionStorage.getItem("Pharmacytoken");

    if (!tokenData || tokenData === "null") {
      throw new Error("Pharmacy token not found. Please log in again.");
    }
    
    const parsed = JSON.parse(tokenData);
    
    if (!parsed || !parsed.token) {
      throw new Error("Token format is invalid. Please log in again.");
    }
    
    return parsed.token;
  } catch (err) {
    
    console.error("Error in getPharmacyToken:", err.message);
    throw err; // Error ko dobara throw karein
  }
}, []); 

const getPharmacyVendorId = useCallback(() => {
  try {
    const vendorId = sessionStorage.getItem("pharmacyVendorId");

    // Zyada majboot check
    if (!vendorId || vendorId === "null" || vendorId === "undefined") {
      throw new Error("Vendor ID not found. Please log in again.");
    }
    return vendorId;
  } catch (err) {
    console.error("Error in getPharmacyVendorId:", err.message);
    throw err;
  }
}, []);
const fetchProducts2 = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const token = getPharmacyToken();
      // URL mein query params add kiye hain (?page=...&search=...)
      // NOTE: Make sure your API accepts 'search' query param, otherwise remove &search=${search}
      const response = await axios.get(`${URL}/Products/getProducts?page=${page}&limit=10&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProducts2(response.data.details || []);
        // Ye line sabse important hai Pagination ke liye:
        setTotalPages(response.data.totalPages || 1); 
        setTotalCount(response.data.totalCount || 0);
      } else {
        setProducts2([]);
        setTotalPages(1);
        setError(response.data.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(err.message);
      setProducts2([]);
    } finally {
      setLoading(false);
    }
}, [getPharmacyToken]);

const updateProductStock = useCallback(async (productId, stock, discount_seller) => {
    setLoading(true);
    setError(null);
    try {
      const token = getPharmacyToken();
      const response = await axios.post(
        `${URL}/Products/update-stock`,
        { productId, stock, discount_seller },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update local state to reflect changes
        setProducts2(prevProducts => 
          prevProducts.map(product => 
            product._id === productId 
              ? { 
                  ...product, 
                  stock,
                  discount_seller,
                  best_price: response.data.details.vendorPrice || product.best_price
                } 
              : product
          )
        );
        return { success: true };
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [getPharmacyToken]);

const [vendorTotalPages, setVendorTotalPages] = useState(1);
const [vendorTotalCount, setVendorTotalCount] = useState(0);

const fetchVendorProducts2 = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const token = getPharmacyToken();
      // Hum page aur limit bhej rahe hain
      const response = await axios.get(`${URL}/Products/vendor-products?page=${page}&limit=10&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const resData = response.data;

      if (resData.success) {
        // Data nikalo (details ya data field se)
        const products = resData.details || resData.data || [];
        setVendorProducts(products);

        // Total Count nikalo (totalCount ya total se, ya array length se)
        const count = resData.totalCount || resData.total || products.length || 0;
        setVendorTotalCount(count);

        // Total Pages nikalo
        // Agar backend pages nahi bhejta, to hum count/10 karke nikal lenge
        const pages = resData.totalPages || Math.ceil(count / 10) || 1;
        setVendorTotalPages(pages);

      } else {
        throw new Error(resData.message || "Failed to fetch vendor products");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setVendorProducts([]);
    } finally {
      setLoading(false);
    }
}, [getPharmacyToken])


const fetchMedicines2 = useCallback(async (page = 1, limit = 5000) => {
  setLoading(true);
  setError(null);
  try {
    const token = getPharmacyToken();
    const response = await axios.get(`${URL}/services/getMedicine`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      setMedicines2(response.data.details || []);
    } else {
      setMedicines2([]);
      setError(response.data.message || "Failed to fetch medicines");
    }
  } catch (err) {
    setError(err.message);
    setMedicines2([]);
  } finally {
    setLoading(false);
  }
}, [getPharmacyToken]);


const [medicines3, setMedicines3] = useState([]);
// 1. Nayi Medicine add karne ke liye function
const addMedicine = useCallback(async (medicineData) => {
    // Sahi API endpoint
    const url = `${URL}/services/create`;
    console.log(`[Context] Attempting to POST to: ${url}`);
    
    try {
        const token = getPharmacyToken();
        const response = await axios.post(url, medicineData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                // FormData ke liye Content-Type set karna acchi practice hai
                'Content-Type': 'multipart/form-data',
            }
        });

        console.log("[Context] API Success Response for Add Medicine:", response.data);
        
        // Success aur 'details' object ki maujoodgi check karein
        if (response.data.success && response.data.details) {
            
            // --- MUKHYA SUDHAAR: STATE UPDATE ---
            const newMedicine = response.data.details;
            
            // Nayi add hui medicine ko local state array ke shuruaat mein jodein
            setMedicines3(prevMedicines => [newMedicine, ...prevMedicines]);
            
            // Component ko success message dikhane ke liye return karein
            return { success: true, message: response.data.message };
        } else {
            // Un-successful ya galat format waale response ko handle karein
            return { success: false, error: response.data.message || "Medicine jodne mein vifal rahe" };
        }
    } catch (err) {
        console.error("[Context] API Error for Add Medicine:", err.response ? err.response.data : err.message);
        const errorMessage = err.response?.data?.message || err.message || "Ek anjaan network truti hui";
        return { success: false, error: errorMessage };
    }
    // useCallback ke dependency array mein setMedicines jodein
}, [getPharmacyToken, setMedicines3]);


const [hospitalProducts, setHospitalProducts] = useState([]); 
const addHospitalProduct = useCallback(async (productData) => {
 
  const url = `${URL}/Products/hospital/create`;
  console.log(`[Context] Attempting to POST to: ${url}`);
 
  try {
      const token = getPharmacyToken();
     
      const response = await axios.post(url, productData, {
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
          }
      });
 
      console.log("[Context] API Success Response for Add Hospital Product:", response.data);
 
      // ⭐⭐⭐ SECOND FIX: Backend 'data' bhej raha hai, 'details' nahi ⭐⭐⭐
      // Hum check kar rahe hain ki response me 'data' hai ya 'details' (safety ke liye)
      const responsePayload = response.data.data || response.data.details;
 
      if (response.data.success) {
         
          // Check if payload exists
          if (responsePayload) {
              // Agar backend array bhejta hai to pehla item lo, agar object bhejta hai to wahi use karo
              // Aapka controller 'data' me single object bhej raha hai (create method returns object)
              const newProduct = Array.isArray(responsePayload) ? responsePayload[0] : responsePayload;
             
              // Add the newly created product to the beginning of the local state array
              setHospitalProducts(prevProducts => [newProduct, ...prevProducts]);
          }
         
          // Return success
          return { success: true, message: response.data.message };
 
      } else {
          // Handle logical failure from backend
          return { success: false, error: response.data.message || "Failed to add hospital product" };
      }
 
  } catch (err) {
      console.error("[Context] API Error for Add Hospital Product:", err.response ? err.response.data : err.message);
     
      // Error message extraction
      const errorMessage = err.response?.data?.message || err.message || "An unknown network error occurred";
      return { success: false, error: errorMessage };
  }
}, [getPharmacyToken, setHospitalProducts]);
 

const updateMedicineStock = useCallback(async (medicineId, stock, discount_seller) => {
  setLoading(true);
  setError(null);
  try {
    const token = getPharmacyToken();
    const response = await axios.post(
      `${URL}/services/medicine/update-stock`,
      { medicineId, stock, discount_seller },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success) {
      setMedicines2(prevMedicines => 
        prevMedicines.map(medicine => 
          medicine._id === medicineId 
            ? { 
                ...medicine, 
                stock,
                discount_seller,
                best_price: response.data.details.vendorPrice || medicine.best_price
              } 
            : medicine
        )
      );
      return { success: true };
    } else {
      throw new Error(response.data.message || "Update failed");
    }
  } catch (err) {
    setError(err.message);
    return { success: false, error: err.message };
  } finally {
    setLoading(false);
  }
}, [getPharmacyToken]);

const fetchVendorMedicines2 = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const token = getPharmacyToken();
    const response = await axios.get(`${URL}/services/vendor-medicine`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // console.log("Vendor Medicines response:", response.data);

    if (response.data.success) {
      const transformedMedicines = response.data.details.map(item => ({
        ...item,
        best_price: item.vendorPrice || item.bestPrice || item.best_price,
        stock: item.vendorStock,
        discount_seller: item.vendorDiscount,
        for_sale: item.vendorStock > 0 ? 'ADD TO CART' : 'SOLD OUT'
      }));
      
      setVendorMedicines(transformedMedicines);
      return transformedMedicines;
    } else {
      throw new Error(response.data.message || "Failed to fetch vendor medicines");
    }
  } catch (err) {
    setError(err.message);
    setVendorMedicines([]);
    throw err;
  } finally {
    setLoading(false);
  }
}, [getPharmacyToken]);

// Get vendor pending orders
const fetchPendingOrders = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const token = getPharmacyToken();
    const vendorId = getPharmacyVendorId();
    
    const response = await axios.get(`${URL}/Products/vendor-orders`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { vendorId }
    });

    if (response.data.success) {
      setPendingOrders(response.data.data || []);
    } else {
      setPendingOrders([]);
      setError(response.data.message || "Failed to fetch pending orders");
    }
  } catch (err) {
    setError(err.message);
    setPendingOrders([]);
  } finally {
    setLoading(false);
  }
}, [getPharmacyToken, getPharmacyVendorId]);

const acceptOrder = useCallback(async (orderId) => {
  setLoading(true);
  setError(null);
  try {
    const token = getPharmacyToken();
    const vendorId = getPharmacyVendorId();
    
    const response = await axios.patch(`${URL}/Products/accept-orders`, {
      orderId,
      vendorId
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to accept order");
    }
    
    return { success: true };
  } catch (err) {
    setError(err.message);
    return { success: false, error: err.message };
  } finally {
    setLoading(false);
  }
}, [getPharmacyToken, getPharmacyVendorId]);

const rejectOrder = useCallback(async (orderId) => {
  setLoading(true);
  setError(null);
  try {
    const token = getPharmacyToken();
    const vendorId = getPharmacyVendorId();
    
    const response = await axios.patch(`${URL}/Products/reject-orders`, {
      orderId,
      vendorId
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to reject order");
    }
    
    return { success: true };
  } catch (err) {
    setError(err.message);
    return { success: false, error: err.message };
  } finally {
    setLoading(false);
  }
}, [getPharmacyToken, getPharmacyVendorId]);

// Accept vendor order
const fetchAcceptedOrders = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const token = getPharmacyToken();
    const vendorId = getPharmacyVendorId();
    
    const response = await axios.get(`${URL}/Products/get-accepted-orders`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { vendorId }
    });
    if (response.data.success) {
      setAcceptedOrders(response.data.data || []);
    } else {
      setAcceptedOrders([]);
      setError(response.data.message || "Failed to fetch accepted orders");
    }
  } catch (err) {
    setError(err.message);
    setAcceptedOrders([]);
  } finally {
    setLoading(false);
  }
}, [getPharmacyToken, getPharmacyVendorId]);

// Get active orders
const fetchActiveOrders = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const token = getPharmacyToken();
    const vendorId = getPharmacyVendorId();
    
    const response = await axios.get(`${URL}/Products/active-orders`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { vendorId }
    });

    if (response.data.success) {
      setActiveOrders(response.data.data || []);
    } else {
      setActiveOrders([]);
      setError(response.data.message || "Failed to fetch active orders");
    }
  } catch (err) {
    setError(err.message);
    setActiveOrders([]);
  } finally {
    setLoading(false);
  }
}, [getPharmacyToken, getPharmacyVendorId]);

// Get order history (rejected and delivered)
const fetchOrderHistory2 = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const token = getPharmacyToken();
        const vendorId = getPharmacyVendorId();

        // Add validation for token and vendorId
        if (!token) {
            throw new Error("Authentication token not found. Please login again.");
        }
        if (!vendorId) {
            throw new Error("Vendor ID not found. Please login again.");
        }

        const response = await axios.get(`${URL}/Products/rejected-and-delivered-orders`, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: { vendorId }
        });

        if (response.data.success) {
            setOrderHistory2(response.data.data || []);
        } else {
            setOrderHistory2([]);
            setError(response.data.message || "Failed to fetch order history");
        }
    } catch (err) {
        console.error("Failed to fetch order history:", err);
        // Provide a more user-friendly error message
        const errorMessage = err.response?.data?.message || 
                            err.message || 
                            "Failed to fetch order history due to an unknown error";
        setError(errorMessage);
        setOrderHistory2([]);
    } finally {
        setLoading(false);
    }
}, [getPharmacyToken, getPharmacyVendorId]);
// Get available drivers
const fetchAvailableDrivers = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const token = getPharmacyToken();
    const vendorId = getPharmacyVendorId();
    
    const response = await axios.get(`${URL}/vendor-order/online-drivers`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { vendorId }
    });

    if (response.data.success) {
      // YEH LINE GALAT HAI:
      // setAvailableDrivers(response.data.data || []); 
      
      // ISE ISSE BADLEIN:
      setAvailableDrivers(response.data.details || []); // 'details' ka upyog karein
    } else {
      setAvailableDrivers([]);
      setError(response.data.message || "Failed to fetch drivers");
    }
  } catch (err) {
    setError(err.message);
    setAvailableDrivers([]);
  } finally {
    setLoading(false);
  }
}, [getPharmacyToken, getPharmacyVendorId]);

const assignDriverToOrder2 = useCallback(async (orderId, driverId) => {
  setLoading(true);
  setError(null);
  try {
    const token = getPharmacyToken();
    const vendorId = getPharmacyVendorId();
    
    const response = await axios.patch(`${URL}/Products/assign-driver`, {
      orderId,
      driverId,
      vendorId
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to assign driver");
    }
    
    return { success: true };
  } catch (err) {
    setError(err.message);
    return { success: false, error: err.message };
  } finally {
    setLoading(false);
  }
}, [getPharmacyToken, getPharmacyVendorId]);


// Get order with driver details
const fetchOrderWithDriver = useCallback(async (orderId) => {
  setLoading(true);
  setError(null);
  try {
    const token = getPharmacyToken();
    // const vendorId = getPharmacyVendorId();

    const response = await axios.get(`${URL}/Products/get-driver-order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return { success: true, data: response.data.data };
    } else {
      throw new Error(response.data.message || "Failed to fetch order details");
    }
  } catch (err) {
    setError(err.message);
    return { success: false, error: err.message };
  } finally {
    setLoading(false);
  }
}, [getPharmacyToken, getPharmacyVendorId]);



const createAvailability2 = async (availabilityData) => {
  try {
    setLoading2(true);
    setError2(null);
    
    const token = getAllVendorToken();
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/food-available/available`,
      availabilityData,
      { headers: { token } }
    );

    if (response.data.success === 1) {
      // Refresh availabilities after creation
      await getVendorAvailabilities2();
      return {
        success: 1,
        message: response.data.message,
        data: response.data.data
      };
    }
    throw new Error(response.data.message || "Failed to create availability");
  } catch (error) {
    console.error("Error creating availability:", error);
    setError2(error.message);
    return { success: 0, message: error.message };
  } finally {
    setLoading2(false);
  }
};

const getVendorAvailabilities2 = async () => {
  try {
    setLoading2(true);
    setError2(null);
    
    const token = getAllVendorToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/food-available/startdate`,
      { headers: { token } }
    );

    if (response.data.success === 1) {
      setAvailabilities2(response.data.details || []);
      return {
        success: 1,
        message: "Availabilities fetched successfully",
        details: response.data.details
      };
    }
    throw new Error(response.data.message || "Failed to fetch availabilities");
  } catch (error) {
    console.error("Error fetching availabilities:", error);
    setError2(error.message);
    return { success: 0, message: error.message };
  } finally {
    setLoading2(false);
  }
};

const getAvailabilityByDateRange2 = async (startDate, endDate) => {
  try {
    setLoading2(true);
    setError2(null);
    
    const token = getAllVendorToken();
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/food-available/timeavailability`,
      { startDate, endDate },
      { headers: { token } }
    );

    if (response.data.success === 1) {
      return {
        success: 1,
        message: "Availability fetched successfully",
        details: response.data.details
      };
    }
    throw new Error(response.data.message || "No availability found");
  } catch (error) {
    console.error("Error fetching availability by date:", error);
    setError2(error.message);
    return { success: 0, message: error.message };
  } finally {
    setLoading2(false);
  }
};

const deleteAvailability2 = async (id) => {
  try {
    setLoading2(true);
    setError2(null);
    
    const token = getAllVendorToken();
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/food-available/remove/${id}`,
      { headers: { token } }
    );

    if (response.data.success === 1) {
      // Refresh availabilities after deletion
      await getVendorAvailabilities2();
      return {
        success: 1,
        message: "Availability deleted successfully"
      };
    }
    throw new Error(response.data.message || "Failed to delete availability");
  } catch (error) {
    console.error("Error deleting availability:", error);
    setError2(error.message);
    return { success: 0, message: error.message };
  } finally {
    setLoading2(false);
  }
};
  // States
 
  const [shopTimings, setShopTimings] = useState([]);
  const [currentShopStatus, setCurrentShopStatus] = useState(null);
  const [loadingTimings, setLoadingTimings] = useState(false);
  const [errorTimings, setErrorTimings] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorAction, setErrorAction] = useState(null);

  const getShopTimings = async () => {
    console.log("CONTEXT: Fetching shop timings");
    try {
      setLoadingTimings(true);
      setErrorTimings(null);
      const token = getPharmacyToken();
      const response = await axios.get(`${URL}/services/shop-timing/get`, {
        headers: { token }
      });
      console.log("CONTEXT: getShopTimings API Response:", response.data);

      if (response.data.success === 1) {
        setShopTimings(response.data.data);
        return { success: 1, data: response.data.data };
      }
      throw new Error(response.data.message || "Failed to fetch timings");
    } catch (error) {
      console.error("CONTEXT ERROR fetching shop timings:", error);
      setErrorTimings(error.message);
      return { success: 0, message: error.message };
    } finally {
      setLoadingTimings(false);
    }
  };
 const bulkUpdateShopTimings = async (timings) => {
    console.log("CONTEXT: Bulk updating timings with PATCH request:", timings);
    try {
      setLoadingAction(true);
      setErrorAction(null);
      const token = getPharmacyToken();
      //
      // ===== YAHAN FIX KIYA GAYA HAI: POST -> PATCH =====
      //
      const response = await axios.patch(`${URL}/services/shop-timing/bulk-update`, { timings }, {
        headers: { token }
      });
      // ===============================================
      //
      console.log("CONTEXT: bulkUpdateShopTimings API Response:", response.data);

      if (response.data.success === 1) {
        await getShopTimings();
        return { success: 1, message: response.data.message, data: response.data.data };
      }
      throw new Error(response.data.message || "Failed to bulk update timings");
    } catch (error) {
      console.error("CONTEXT ERROR bulk updating timings:", error);
      setErrorAction(error.message);
      return { success: 0, message: error.response?.data?.message || error.message };
    } finally {
      setLoadingAction(false);
    }
  };
  const addOrUpdateShopTiming = async (timingData) => {
    try {
      setLoadingAction(true);
      setErrorAction(null);
      const token = getPharmacyToken();
      const response = await axios.post(`${URL}/services/shop-timing/add`, timingData, {
        headers: { token }
      });

      if (response.data.success === 1) {
        await getShopTimings(); // Refresh timings
        return { success: 1, message: response.data.message, data: response.data.data };
      }
      throw new Error(response.data.message || "Failed to update timing");
    } catch (error) {
      console.error("Error updating shop timing:", error);
      setErrorAction(error.message);
      return { success: 0, message: error.message };
    } finally {
      setLoadingAction(false);
    }
  };
  const deleteShopTiming = async (id) => {
    try {
        setLoadingAction(true);
        setErrorAction(null);
        const token = getPharmacyToken();
        const response = await axios.delete(`${URL}/services/shop-timing/delete/${id}`, {
            headers: { token },
        });

        if (response.data.success === 1) {
            await getShopTimings(); // Refresh list
            return { success: 1, message: response.data.message };
        }
        throw new Error(response.data.message || "Failed to delete timing.");
    } catch (error) {
        console.error("Error deleting timing:", error);
        setErrorAction(error.message);
        return { success: 0, message: error.message };
    } finally {
        setLoadingAction(false);
    }
  };
  const getCurrentShopStatus = async () => {
    try {
        setLoadingTimings(true); // Reuse timings loading state
        setErrorTimings(null);
        const token = getPharmacyToken();
        const response = await axios.get(`${URL}/services/shop-timing/current-status`, {
            headers: { token },
        });

        if (response.data.success === 1) {
            setCurrentShopStatus(response.data.data);
            return { success: 1, data: response.data.data };
        }
        throw new Error(response.data.message || "Failed to get shop status.");
    } catch (error) {
        console.error("Error getting shop status:", error);
        setErrorTimings(error.message);
        return { success: 0, message: error.message };
    } finally {
        setLoadingTimings(false);
    }
  };


  const[coupon1, setCoupon1] = useState([]);
const getCouponsByVendor = async (status) => {
  setLoading(true);
  setError(null);
  
  try {
    const token = getAllVendorToken();
    if (!token) throw new Error("No authentication token");

    const response = await axios.get(`${URL}/coupon`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { status },
    });

    // Return the complete response
    return response;
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};
 
const getCouponsByStatus = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAllVendorToken();
      if (!token) {
        throw new Error("Authentication token not available.");
      }
      const response = await axios.get(`${URL}/coupon/coupon-status`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status },
      });
      console.log("Coupons by status response:", response.data);

      if (response.data && response.data.success === 1) {
        setCoupon1(response.data.details || []);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch coupons by status.');
      }
    } catch (err) {
      const msg = err.response ? err.response.data.message : err.message;
      setError(msg);
      setCoupon1([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAllVendorToken]);

  const createCoupon = async (couponData) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAllVendorToken();
       if (!token) {
        throw new Error("Authentication token not available.");
      }
      const response = await axios.post(`${URL}/coupon/create`, couponData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      await getCouponsByVendor('all'); 
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response ? err.response.data.message : err.message;
      setError(errorMessage);
      throw err; 
    } finally {
      setLoading(false);
    }
  };
const deleteCoupon = useCallback(async (couponId) => {
  setLoading(true);
  setError(null);

  try {
    const token = getAllVendorToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await axios.delete(`${URL}/coupon/delete/${couponId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data?.success === 1) {
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data?.message || 'Failed to delete coupon');
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    setError(msg || 'Failed to delete coupon');
    return { success: false, message: msg };
  } finally {
    setLoading(false);
  }
}, [getAllVendorToken]);





  const [drivers, setDrivers] = useState([]);
  // (POST: /driver/create-driver)
  const createDriver = async (driverData) => {
      setLoading(true);
      setError(null);
      try {
          const token = getAllVendorToken();
          const response = await axios.post(`${URL}/driver/create-driver`, driverData, {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data', // फ़ाइल अपलोड के लिए
              },
          });
          await getDrivers(); // ड्राइवर बनाने के बाद सूची को रिफ्रेश करें
          return response.data;
      } catch (err) {
          const errorMessage = err.response ? err.response.data.message : err.message;
          setError(errorMessage);
          throw err;
      } finally {
          setLoading(false);
      }
  };
  //(GET: /driver/get-driver)
  const getDrivers = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
          const token = getAllVendorToken();
          const response = await axios.get(`${URL}/driver/get-driver`, {
              headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success === 1) {
              setDrivers(response.data.details || []);
          } else {
              setDrivers([]);
              throw new Error(response.data.message || 'Failed to fetch drivers.');
          }
          return response.data;
      } catch (err) {
          const errorMessage = err.response ? err.response.data.message : err.message;
          setError(errorMessage);
      } finally {
          setLoading(false);
      }
  }, [getAllVendorToken, URL]);
    //(PATCH: /driver/update-driver/:id)
  const updateDriver = async (driverId, driverData) => {
    setLoading(true);
    setError(null);
    try {
        const token = getAllVendorToken();
        // यह URL अब आपके ठीक किए गए बैकएंड राउट से मेल खाता है
        const response = await axios.patch(`${URL}/driver/update-driver/${driverId}`, driverData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        await getDrivers(); // सूची को ताज़ा करें
        return response.data;
    } catch (err) {
        const errorMessage = err.response ? err.response.data.message : err.message;
        setError(errorMessage);
        throw err;
    } finally {
        setLoading(false);
    }
  };
  //(DELETE: /driver/delete-driver/:id)
  const deleteDriver = async (driverId) => {
      setLoading(true);
      setError(null);
      try {
          const token = getAllVendorToken();
          const response = await axios.delete(`${URL}/driver/delete-driver/${driverId}`, {
              headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.data?.success === 1) {
              // UI से ड्राइवर को तुरंत हटाने के लिए फ़िल्टर करें
              setDrivers(prev => prev.filter(driver => driver._id !== driverId));
              return { success: true, message: response.data.message };
          } else {
              throw new Error(response.data?.message || 'Failed to delete driver.');
          }
      } catch (err) {
          const msg = err.response?.data?.message || err.message;
          setError(msg);
          return { success: false, message: msg };
      } finally {
          setLoading(false);
      }
  };


const [vendorProfile, setVendorProfile] = useState(null);

const getVendorProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getAllVendorToken();
            const response = await axios.get(`${URL}/vendor/profile`, { // GET का उपयोग
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Vendor Profile response:", response.data);
            if (response.data.success === 1) {
                setVendorProfile(response.data.details);
            } else {
                throw new Error(response.data.message);
            }
            return response.data;
        } catch (err) {
            const errorMessage = err.response ? err.response.data.message : err.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [getAllVendorToken, URL]);

 const updateVendorProfile = async (profileData) => {
        setLoading(true);
        setError(null);
        try {
            const token = getAllVendorToken();
            const response = await axios.patch(`${URL}/vendor/updateprofile`, profileData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            // प्रोफ़ाइल अपडेट होने के बाद ताज़ा डेटा फिर से फ़ेच करें
            if (response.data.success) {
                await getVendorProfile();
            }
            return response.data;
        } catch (err) {
            const errorMessage = err.response ? err.response.data.message : err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

const changePassword2 = async (passwordData) => {
        setLoading(true);
        setError(null);
        try {
            const token = getAllVendorToken();
            const response = await axios.patch(`${URL}/vendor/change-password`, passwordData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err) {
            const errorMessage = err.response ? err.response.data.message : err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- Document Management States ---
  const [vendorDocumentDetails, setVendorDocumentDetails] = useState([]);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState(null);

  // Re-use or adapt your existing token fetching logic

  // --- Fetch Vendor Documents ---
  const fetchVendorDocuments = useCallback(async () => {
    setDocumentLoading(true);
    setDocumentError(null);
    try {
      const token = getAllVendorToken();
      const response = await axios.get(`${URL}/document`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setVendorDocumentDetails(response.data.details || []);
      } else {
        // Handle API error response that indicates success: false
        throw new Error(response.data.message || 'Failed to fetch documents.');
      }
    } catch (error) {
      console.error("Error fetching vendor documents:", error);
      setDocumentError(error.message || 'Failed to fetch vendor documents.');
      throw error; // Re-throw to allow component to catch it
    } finally {
      setDocumentLoading(false);
    }
  }, [URL, getAllVendorToken]); // Add dependencies

  // --- Update Vendor Documents ---
  const updateVendorDocument = useCallback(async (formData) => {
    try {
      const token = getAllVendorToken();
      const response = await axios.post(`${URL}/document/update`, formData, {
        headers: {
          token: token,
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      // Return the response data so the component can check success/message
      return response.data;

    } catch (error) {
      console.error("Error updating vendor documents:", error);
      // You might want to set documentError here too, or let the component handle it
      throw error; // Re-throw to allow component to catch it
    }
  }, [URL, getAllVendorToken]); // Add dependencies



 ////////////////////////////////////////// lab vendor panel //////////////////////////////////////////////////////////

////////////////////////////////////////// doctor panel ////////////////////////////////////////////////////////////
const getDoctorToken = () => {
  const doctorTokenData = sessionStorage.getItem('doctortoken');
  if (doctorTokenData) {
    const parsedData = JSON.parse(doctorTokenData);
    return parsedData.token || parsedData;
  }
  return null;
};

 const [doctorData, setDoctorData] = useState(null); 
   const [activeCalls, setActiveCalls] = useState([]);


  // --- Authentication related functions ---
  const registerDoctor = async (formData, files) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/doctor/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log("Doctor registration response:", response.data);
      // Handle successful registration (e.g., show toast, redirect)
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err; // Re-throw to handle in component
    } finally {
      setLoading(false);
    }
  }; 

  const loginDoctor = async (email, password, regId, loginType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/doctor/login`, { email, password, regId, loginType });
      if (response.data.success) {
        sessionStorage.setItem('doctortoken', JSON.stringify(response.data.details));
        // You might want to set doctor details here as well
        // setDoctorData(response.data.details); // Assuming details contains doctor info
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const otpSentToDcotor = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/doctor/email-otp-sent`, { email });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const otpSentToPhone = async (phone, ctrcode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/doctor/phone-otp-sent`, { phone, ctrcode });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/doctor/email-otp-verify`, { email, otp });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOtp = async (phone, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/doctor/phone-otp-verify`, { phone, otp });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const otpForForget = async (ctrCode, phoneNumber) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/doctor/otp`, { ctrCode, phoneNumber });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyForgotOtp = async (ctrCode, phoneNumber, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/doctor/verify-otp`, { ctrCode, phoneNumber, otp });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (ctrCode, password, phoneNumber) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/doctor/reset`, { ctrCode, password, phoneNumber });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword1 = async (oldpassword, password, confirmpassword) => {
    setLoading(true);
    setError(null);
        const token = getDoctorToken();
        if (!token) {
          setError('Authentication token not found. Please log in.');
          return;
        }
    try {
      const response = await axios.post(`${URL}/doctor/password`, { oldpassword, password, confirmpassword }, {
        headers: {
          token: token,
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logoutDoctor = async () => {
        setLoading(true);
        setError(null);
        try {

            sessionStorage.removeItem('doctortoken'); // Remove token from storage
            setDoctorData(null); // Clear doctor data from state
            // Optionally clear other auth-related state
        } catch (err) {
            console.error("Error during logout:", err);
            setError("Logout failed. Please try again.");
            // Even if there's an error clearing from storage, we'll still try to clear state
            setDoctorData(null);
            sessionStorage.removeItem('doctortoken');
            throw err; // Re-throw to be caught by the component
        } finally {
            setLoading(false);
        }
    };


  // --- Profile related functions ---
  const getDoctorProfile = async () => {
    setLoading(true);
      setError(null);
      const token = getDoctorToken(); // Get token using the helper
      if (!token) {
        setError('Authentication token not found. Please log in.');
        // Optionally redirect to login
        return;
      }
      try {
        const response = await axios.get(`${URL}/doctor/get-doctor`, {
          headers: {
            token: token,
          },
        });
        console.log("Fetched doctor profile:", response.data);
      if (response.data.success) {
        setDoctorData(response.data.details); // Store fetched doctor data
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctor profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorProfile = async (formData) => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }
    try {
      const response = await axios.patch(`${URL}/doctor/update-doctor`, formData, {
        headers: {
          token: token,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        // Update local state if profile was updated successfully
        // You might want to re-fetch the profile here or merge the updates
        await getDoctorProfile(token); // Re-fetch to ensure state consistency
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update doctor profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUsersWhoMessagedDoctor = async () => {
    setLoading(true);
    setError(null);
        const token = getDoctorToken();
        if (!token) {
          setError('Authentication token not found. Please log in.');
          return;
        }
    try {
      const response = await axios.get(`${URL}/doctor/getUsersWhoMessagedDoctor`, {
        headers: {
          token: token,
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      throw err;
    } finally {
      setLoading(false);
    }
  };
    // Update Doctor Documents
  const updateDoctorDocuments = async (formData) => {
    // formData should be a FormData object containing files and potentially other fields
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return null;
    }

    try {
      console.log("Sending document update request with formData:", formData);
      const response = await axios.post(`${URL}/doctor-document/update`, formData, {
        headers: {
          token: token,
          'Content-Type': 'multipart/form-data', // Important for FormData
        },
      });
      console.log("Document update response:", response.data);

      if (response.data.success) {
        // Optionally, re-fetch doctor profile to reflect updated documents/statuses
        // await getDoctorProfile();
        return response.data; // Return success response
      } else {
        setError(response.data.message || 'Failed to update documents');
        return null;
      }
    } catch (err) {
      console.error("Axios error updating doctor documents:", err);
      setError(err.response?.data?.message || 'Failed to update documents');
      return null;
    } finally {
      setLoading(false);
    }
  };

    // --- Appointment APIs ---

 const getDoctorAppointments = async (queryParams = {}) => {
  const token = getDoctorToken();
  if (!token) {
    setError("Authentication token missing. Please log in.");
    return null;
  }
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get(`${URL}/appointments`, {
      headers: { token },   // ✅ shorthand
      params: queryParams,
    });
    console.log("Fetched doctor appointments:", response.data);
    if (response.data.success) {
      return response.data.details;
    } else {
      setError(response.data.message);
      return null;
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch appointments');
    if (err.response?.status === 401) { logoutDoctor(); }
    return null;
  } finally {
    setLoading(false);
  }
};

// DELETE APPOINTMENT API
const deleteAppointment = async (appointmentId) => {
  const token = getDoctorToken(); // Token get karne ka aapka existing function
  if (!token) {
    setError("Authentication token missing. Please log in.");
    return false;
  }
  setLoading(true);
  setError(null);
  
  try {
    const response = await axios.delete(`${URL}/appointments/delete`, {
      headers: { token },   // ✅ Headers me token
      params: { appointmentId }, // ✅ Query parameter me appointmentId (req.query)
    });
    
    console.log("Delete appointment response:", response.data);
    if (response.data.success === 1) {
      toast.success(response.data.message);
      return true; // Success
    } else {
      toast.error(response.data.message);
      return false;
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete appointment');
    if (err.response?.status === 401) { logoutDoctor(); }
    return false;
  } finally {
    setLoading(false);
  }
};

// Ise Context Provider me return pass karna mat bhooliyega:
// value={{ ...existingFunctions, deleteAppointment }}

  const acceptOrRejectAppointment = async (appointmentId, status) => {
    const token = getDoctorToken();
    if (!token) { setError("Authentication token missing. Please log in."); return false; }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.patch(`${URL}/appointments/accept-reject?appointmentId=${appointmentId}&status=${status}`, null, {
        headers: { token: token },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        return true; // Indicate success
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status');
      toast.error(err.response?.data?.message || 'Failed to update appointment status');
      if (err.response?.status === 401) { logoutDoctor(); /* navigate('/doctor/login'); */ }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const postponeAppointment = async (appointmentDetails) => {
    const token = getDoctorToken();
    if (!token) { setError("Authentication token missing. Please log in."); return false; }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/appointments/postponed`, appointmentDetails, {
        headers: {
          token: token,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        return true;
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to postpone appointment');
      toast.error(err.response?.data?.message || 'Failed to postpone appointment');
      if (err.response?.status === 401) { logoutDoctor(); /* navigate('/doctor/login'); */ }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = async (appointmentId) => {
    const token = getDoctorToken();
    if (!token) { setError("Authentication token missing. Please log in."); return null; }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${URL}/appointments/getpayment?appointmentId=${appointmentId}`, {
        headers: { token: token, },
      });
      if (response.data.success) {
        return response.data; // Contains isPaid, paymentDetails
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
        return null;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get payment status');
      toast.error(err.response?.data?.message || 'Failed to get payment status');
      if (err.response?.status === 401) { logoutDoctor(); /* navigate('/doctor/login'); */ }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const markPaymentDone = async (appointmentId, upiRef) => {
    const token = getDoctorToken();
    if (!token) { setError("Authentication token missing. Please log in."); return false; }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/appointments/paymentDone`, { appointmentId, upiRef }, {
        headers: {
          token: token,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        toast.success("Payment marked as done.");
        return true;
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark payment as done');
      toast.error(err.response?.data?.message || 'Failed to mark payment as done');
      if (err.response?.status === 401) { logoutDoctor(); /* navigate('/doctor/login'); */ }
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to add prescribe - this might need a more complex UI flow later
  const addPrescribe = async (appointmentId, prescribeData) => {
      const token = getDoctorToken();
      if (!token) { setError("Authentication token missing. Please log in."); return false; }
      setLoading(true);
      setError(null);
      try {
          const response = await axios.post(`${URL}/appointments/prescribe`, {
              ...prescribeData,
              appointmentId: appointmentId, // Ensure this is correctly sent if backend expects it
          }, {
              headers: {
                  token: token,
                  'Content-Type': 'application/json',
              },
          });
          if (response.data.success) {
              toast.success(response.data.message);
              return true;
          } else {
              setError(response.data.message);
              toast.error(response.data.message);
              return false;
          }
      } catch (err) {
          setError(err.response?.data?.message || 'Failed to add prescription');
          toast.error(err.response?.data?.message || 'Failed to add prescription');
          if (err.response?.status === 401) { logoutDoctor(); /* navigate('/doctor/login'); */ }
          return false;
      } finally {
          setLoading(false);
      }
  };
  
  const [coupons1, setCoupons1] = useState([]);


  const createCoupon1 = async (couponData) => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }
    try {
      const response = await axios.post(`${URL}/doctor-coupon/create`, couponData, {
        headers: { token: token },
      });
      if (response.data.success) {
        // Refresh coupons list after creation
        await getCoupons1(); // ✅ getCoupons1 call kiya
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET ALL COUPONS (getCoupons1 name use kiya)
  const getCoupons1 = async () => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }
    try {
      const response = await axios.get(`${URL}/doctor-coupon/all`, {
        headers: { token: token },
      });
      if (response.data.success) {
        setCoupons1(response.data.details || []); // ✅ setCoupons1 use kiya
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch coupons');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET COUPONS BY STATUS (getCouponsByStatus1 name use kiya)
  const getCouponsByStatus1 = async (status) => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }
    try {
      const response = await axios.get(`${URL}/doctor-coupon/coupon-status`, {
        headers: { token: token },
        params: { status: status }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch coupons by status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE COUPON STATUS (updateCouponStatus1 name use kiya)
  const updateCouponStatus1 = async (couponId, status) => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }
    try {
      const response = await axios.put(`${URL}/doctor-coupon/update-status/${couponId}`, 
        { status: status },
        { headers: { token: token } }
      );
      if (response.data.success) {
        // Refresh coupons list after update
        await getCoupons1(); // ✅ getCoupons1 call kiya
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update coupon status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE COUPON (deleteCoupon1 name use kiya)
  const deleteCoupon1 = async (couponId) => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }
    try {
      const response = await axios.delete(`${URL}/doctor-coupon/delete/${couponId}`, {
        headers: { token: token }
      });
      if (response.data.success) {
        // Remove from local state - coupons1 use kiya
        setCoupons1(coupons1.filter(coupon => coupon._id !== couponId)); // ✅ coupons1 use kiya
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  };
// ✅ EDIT COUPON - New function added
  const editCoupon1 = async (couponId, couponData) => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }
    try {
      const response = await axios.put(`${URL}/doctor-coupon/edit/${couponId}`, couponData, {
        headers: { token: token },
      });
      
      if (response.data.success) {
        // Refresh coupons list after edit
        await getCoupons1();
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ FORCE EXPIRE COUPON - New function added
  const expireCoupon1 = async (couponId) => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }
    try {
      const response = await axios.put(`${URL}/doctor-coupon/expire/${couponId}`, {}, {
        headers: { token: token },
      });
      
      if (response.data.success) {
        // Update local state immediately
        setCoupons1(prevCoupons => 
          prevCoupons.map(coupon => 
            coupon._id === couponId 
              ? { ...coupon, status: '2', isExpired: true, frontendStatus: 'expired' }
              : coupon
          )
        );
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to expire coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  };

// ==================== AVAILABILITY FUNCTIONS ====================
const [availability1, setAvailability1] = useState([]);
const [timeSlots, setTimeSlots] = useState(null);


// Improved token validation
const validateToken = () => {
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    return null;
  }
  return token;
};

// Helper to format dates for backend (DD/MM/YYYY) with validation
const formatDateForBackend = (dateString) => {
  if (!dateString) {
    console.error('Empty date string provided');
    return '';
  }
  
  try {
    const date = moment(dateString);
    if (!date.isValid()) {
      console.error('Invalid date:', dateString);
      return '';
    }
    return date.format('DD/MM/YYYY');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Helper to format dates for display
const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return moment(dateString, 'DD/MM/YYYY').format('DD MMM YYYY');
  } catch (error) {
    console.error('Date display formatting error:', error);
    return 'Invalid Date';
  }
};

// ✅ CREATE AVAILABILITY (Completely Fixed)
const createAvailability1 = async (availabilityData) => {
  // Clear previous errors
  setError(null);
  
  // Validate input data
  if (!availabilityData.startDate || !availabilityData.endDate || 
      !availabilityData.startTime || !availabilityData.endTime) {
    const errorMsg = 'Missing required fields';
    setError(errorMsg);
    return { success: 0, message: errorMsg };
  }

  const token = validateToken();
  if (!token) {
    setLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  // Format dates with validation
  const formattedStartDate = formatDateForBackend(availabilityData.startDate);
  const formattedEndDate = formatDateForBackend(availabilityData.endDate);

  if (!formattedStartDate || !formattedEndDate) {
    const errorMsg = 'Invalid date format';
    setError(errorMsg);
    return { success: 0, message: errorMsg };
  }

  const formattedData = {
    ...availabilityData,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  };

  setLoading(true);

  try {
    console.log('Sending availability data:', formattedData);
    
    const response = await axios.post(
      `${URL}/doctor-availability/create`, 
      formattedData, 
      {
        headers: { 
          token: token,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log("Create availability response:", response.data);
    
    if (response.data.success) {
      // Wait a bit before refreshing to ensure server processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      await getAllStartAndEndDate1();
    }
    
    return response.data;
  } catch (err) {
    console.error("Error creating availability:", err);
    
    let errorMessage = 'Failed to create availability';
    if (err.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    } else if (err.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    
    setError(errorMessage);
    return { 
      success: 0, 
      message: errorMessage,
      status: err.response?.status 
    };
  } finally {
    setLoading(false);
  }
};

// ✅ GET ALL START AND END DATES (Fixed)
const getAllStartAndEndDate1 = async () => {
  const token = validateToken();
  if (!token) {
    setLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  setLoading(true);
  setError(null);

  try {
    const response = await axios.get(`${URL}/doctor-availability/dates`, {
      headers: { 
        token: token 
      },
      timeout: 10000
    });

    if (response.data.success) {
      setAvailability1(response.data.details || []);
    } else {
      setError(response.data.message || 'Failed to fetch availability dates');
    }
    return response.data;
  } catch (err) {
    console.error("Error fetching availability dates:", err);
    
    let errorMessage = 'Failed to fetch availability dates';
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    
    setError(errorMessage);
    return { success: 0, message: errorMessage };
  } finally {
    setLoading(false);
  }
};

// ✅ DELETE AVAILABILITY (Fixed)
const deleteAvailability1 = async (availabilityId) => {
  if (!availabilityId) {
    setError('Invalid availability ID');
    return false;
  }

  const token = validateToken();
  if (!token) {
    return false;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await axios.delete(
      `${URL}/doctor-availability/delete/${availabilityId}`, 
      {
        headers: { token: token },      }
    );
    
    if (response.data.success) {
      // Small delay to ensure server processes the delete
      await new Promise(resolve => setTimeout(resolve, 300));
      await getAllStartAndEndDate1();
      return true;
    } else {
      setError(response.data.message || 'Failed to delete availability');
      return false;
    }
  } catch (err) {
    console.error("Error deleting availability:", err);
    
    let errorMessage = 'Failed to delete availability';
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    
    setError(errorMessage);
    return false;
  } finally {
    setLoading(false);
  }
};
//---- consultation fees -----
  const [fees, setFees] = useState(null);

   // Create fees
  const createFees = async (feesData) => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    try {
      const response = await axios.post(`${URL}/fees/create`, feesData, {
        headers: { token: token },
      });
      
      if (response.data.success) {
        setFees(response.data.data);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create fees');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get fees
  const getFees = async () => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    try {
      const response = await axios.get(`${URL}/fees/get`, {
        headers: { token: token },
      });
      
      if (response.data.success) {
        setFees(response.data.details[0]); // Assuming it returns an array
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch fees');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update fees
  const updateFees = async (id, feesData) => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    try {
      const response = await axios.patch(`${URL}/fees/update/${id}`, feesData, {
        headers: { token: token },
      });
      
      if (response.data.success) {
        // Update local state
        setFees(prev => prev ? { ...prev, ...feesData } : null);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update fees');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete fees
  const deleteFees = async (id) => {
    setLoading(true);
    setError(null);
    const token = getDoctorToken();
    
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    try {
      const response = await axios.delete(`${URL}/fees/delete/${id}`, {
        headers: { token: token },
      });
      
      if (response.data.success) {
        setFees(null);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete fees');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

///doctor-Prescription
// ==================== PRESCRIPTION FUNCTIONS ====================
const [prescriptions, setPrescriptions] = useState([]);
const [medicines4, setMedicines4] = useState([]);
const [insuranceList, setInsuranceList] = useState([]);
const [selectedPrescription, setSelectedPrescription] = useState(null);

// ✅ GET MEDICINE DATA
const getMedicineData = async (page = 1, limit = 10) => {
  setLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    const response = await axios.get(`${URL}/doctor-Prescription/getMedicineData`, {
      headers: { token: token },
      params: { page, limit }
    });

    if (response.data.success) {
      setMedicines(response.data.details || []);
    }
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch medicines';
    setError(errorMessage);
    console.error("Error fetching medicines:", err);
    return { success: 0, message: errorMessage };
  } finally {
    setLoading(false);
  }
};

// ✅ CREATE PRESCRIPTION
const createDoctorPrescription = async (prescriptionData, insuranceImageFile = null) => {
  setLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    const formData = new FormData();
    
    // Append all prescription data
    Object.keys(prescriptionData).forEach(key => {
      if (Array.isArray(prescriptionData[key])) {
        prescriptionData[key].forEach(item => {
          formData.append(key, item);
        });
      } else {
        formData.append(key, prescriptionData[key]);
      }
    });

    // Append insurance image if provided
    if (insuranceImageFile) {
      formData.append('insuranceImage', insuranceImageFile);
    }

    const response = await axios.post(`${URL}/doctor-Prescription/createDoctorPrescription`, formData, {
      headers: { 
        token: token,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      // Refresh prescriptions list
      await getAllPrescriptions(prescriptionData.AppointmentId);
    }
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to create prescription';
    setError(errorMessage);
    console.error("Error creating prescription:", err);
    return { success: 0, message: errorMessage };
  } finally {
    setLoading(false);
  }
};

// ✅ GET ALL PRESCRIPTIONS
const getAllPrescriptions = async (appointmentId) => {
  setLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    const response = await axios.get(`${URL}/doctor-Prescription/getAllPrescription`, {
      headers: { token: token },
      params: { AppointmentId: appointmentId }
    });

    if (response.data.success) {
      setPrescriptions(response.data.prescriptionDetails || []);
      setSelectedPrescription(response.data.appointmentDetails || null);
    }
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch prescriptions';
    setError(errorMessage);
    console.error("Error fetching prescriptions:", err);
    return { success: 0, message: errorMessage };
  } finally {
    setLoading(false);
  }
};

// ✅ POSTPONE APPOINTMENT
const postponeAppointment1 = async (postponeData) => {
  setLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    const response = await axios.post(`${URL}/doctor-Prescription/Postpone`, postponeData, {
      headers: { token: token }
    });

    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to postpone appointment';
    setError(errorMessage);
    console.error("Error postponing appointment:", err);
    return { success: 0, message: errorMessage };
  } finally {
    setLoading(false);
  }
};

// ✅ GET INSURANCE LIST
const getInsuranceList = async () => {
  setLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    const response = await axios.get(`${URL}/doctor-Prescription/getInsurance`, {
      headers: { token: token }
    });

    if (response.data.success) {
      setInsuranceList(response.data.details || []);
    }
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch insurance list';
    setError(errorMessage);
    console.error("Error fetching insurance list:", err);
    return { success: 0, message: errorMessage };
  } finally {
    setLoading(false);
  }
};

// ✅ DOWNLOAD PRESCRIPTION PDF
const downloadPrescription = (pdfUrl) => {
  if (pdfUrl) {
    window.open(`${URL}${pdfUrl}`, '_blank');
  }
};

// 1. Get Medicine Data - Maps to /doctor-Prescription/getMedicineData
const fetchMedicineData = async (page = 1, limit = 10) => {
  const token = getDoctorToken();
  if (!token) {
    setError("Authentication token missing. Please log in.");
    return null;
  }
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get(`${URL}/doctor-Prescription/getMedicineData`, {
      headers: { token },
      params: { page, limit },
    });
    if (response.data.success) {
      return response.data; // Contains success, message, totalCount, currentPage, pageSize, details (list)
    } else {
      setError(response.data.message);
      toast.error(response.data.message);
      return null;
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch medicine data');
    toast.error(err.response?.data?.message || 'Failed to fetch medicine data');
    if (err.response?.status === 401) { logoutDoctor(); }
    return null;
  } finally {
    setLoading(false);
  }
};

// // 2. Get Insurance List - Maps to /doctor-Prescription/getInsurance
// const getInsuranceList1 = async () => {
//   const token = getDoctorToken();
//   if (!token) {
//     setError("Authentication token missing. Please log in.");
//     return null;
//   }
//   setLoading(true);
//   setError(null);
//   try {
//     const response = await axios.get(`${URL}/doctor-Prescription/getInsurance`, {
//       headers: { token },
//     });
//     if (response.data.success) {
//       return response.data; // Contains success, message, details (list)
//     } else {
//       setError(response.data.message);
//       toast.error(response.data.message);
//       return null;
//     }
//   } catch (err) {
//     setError(err.response?.data?.message || 'Failed to fetch insurance list');
//     toast.error(err.response?.data?.message || 'Failed to fetch insurance list');
//     if (err.response?.status === 401) { logoutDoctor(); }
//     return null;
//   } finally {
//     setLoading(false);
//   }
// }; 

// 3. Create Final Prescription (Including File Upload) - Maps to /doctor-Prescription/createDoctorPrescription
const createFinalPrescription = async (formData) => {
  const token = getDoctorToken();
  if (!token) {
    setError("Authentication token missing. Please log in.");
    return null;
  }
  // Note: We avoid setting the global loading state here, relying on the component's internal 'prescriptionLoading' state.
  setError(null);
  try {
    const response = await axios.post(`${URL}/doctor-Prescription/createDoctorPrescription`, formData, {
      headers: {
        token: token,
        // When using FormData, set the Content-Type to 'multipart/form-data'
        // Axios handles this automatically if you pass a FormData object, 
        // but explicit setting can be safer if you have issues:
        // 'Content-Type': 'multipart/form-data', 
      },
    });

    if (response.data.success) {
      return response.data; // Contains success, message, pdfUrl, details
    } else {
      setError(response.data.message);
      toast.error(response.data.message);
      return null;
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to create prescription');
    toast.error(err.response?.data?.message || 'Failed to create prescription');
    if (err.response?.status === 401) { logoutDoctor(); }
    return null;
  }
};

// 4. Get Existing Prescription - Maps to /doctor-Prescription/getAllPrescription
const getExistingPrescription = async (appointmentId) => {
  const token = getDoctorToken();
  if (!token) {
    setError("Authentication token missing. Please log in.");
    return null;
  }
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get(`${URL}/doctor-Prescription/getAllPrescription?AppointmentId=${appointmentId}`, {
      headers: { token },
    });
    if (response.data.success) {
      return response.data; // Contains success, message, appointmentDetails, prescriptionDetails
    } else {
      setError(response.data.message);
      toast.error(response.data.message);
      return null;
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch existing prescription');
    toast.error(err.response?.data?.message || 'Failed to fetch existing prescription');
    if (err.response?.status === 401) { logoutDoctor(); }
    return null;
  } finally {
    setLoading(false);
  }
};
  

// ==================== PRIVACY POLICY FUNCTIONS ====================
const [privacyPolicy, setPrivacyPolicy] = useState(null);
const [privacyLoading, setPrivacyLoading] = useState(false);

// ✅ CREATE PRIVACY POLICY
const createPrivacyPolicy = async (privacyPolicyData) => {
  setPrivacyLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setPrivacyLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    const response = await axios.post(`${URL}/doctor-privacy/create`, {
      privacyPolicy: privacyPolicyData
    }, {
      headers: { token: token }
    });

    if (response.data.success) {
      // Refresh privacy policy after creation
      await getPrivacyPolicy();
    }
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to create privacy policy';
    setError(errorMessage);
    console.error("Error creating privacy policy:", err);
    return { success: 0, message: errorMessage };
  } finally {
    setPrivacyLoading(false);
  }
};

// ✅ GET PRIVACY POLICY
const getPrivacyPolicy = async () => {
  setPrivacyLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setPrivacyLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    const response = await axios.get(`${URL}/doctor-privacy`, {
      headers: { token: token }
    });

    if (response.data.success) {
      setPrivacyPolicy(response.data.details);
    } else {
      setPrivacyPolicy(null);
    }
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch privacy policy';
    setError(errorMessage);
    console.error("Error fetching privacy policy:", err);
    setPrivacyPolicy(null);
    return { success: 0, message: errorMessage };
  } finally {
    setPrivacyLoading(false);
  }
};

// ✅ UPDATE PRIVACY POLICY (if your API supports update)
const updatePrivacyPolicy = async (policyData) => {
  setPrivacyLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setPrivacyLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    // Assuming you have an update endpoint
    const response = await axios.put(`${URL}/doctor-privacy/update`, {
      privacyPolicy: policyData
    }, {
      headers: { token: token }
    });
    console.log("Update privacy policy response:", response.data);

    if (response.data.success) {
      await getPrivacyPolicy();
    }
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to update privacy policy';
    setError(errorMessage);
    console.error("Error updating privacy policy:", err);
    return { success: 0, message: errorMessage };
  } finally {
    setPrivacyLoading(false);
  }
};

// ==================== SPECIALISTS FUNCTIONS ====================
const [specialists1, setSpecialists1] = useState([]);
const [specialistsLoading, setSpecialistsLoading] = useState(false);

// ✅ GET SPECIALISTS
const getSpecialists = async () => {
  setSpecialistsLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setSpecialistsLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    const response = await axios.get(`${URL}/specialiazation`, {
      headers: { token: token }
    });

    if (response.data.success) {
      setSpecialists1(response.data.details || []);
    } else {
      setSpecialists1([]);
    }
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch specialists';
    setError(errorMessage);
    console.error("Error fetching specialists:", err);
    setSpecialists([]);
    return { success: 0, message: errorMessage };
  } finally {
    setSpecialistsLoading(false);
  }
};

// ==================== RATING & FEEDBACK FUNCTIONS ====================
const [ratings, setRatings] = useState({
  overallRating: 0,
  excellent: 0,
  good: 0,
  average: 0,
  belowAverage: 0,
  poor: 0,
  feedbacks: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalFeedbacks: 0
  }
});
const [ratingsLoading, setRatingsLoading] = useState(false);

// ✅ GET DOCTOR RATING SUMMARY
const getDoctorRating = async () => {
  setRatingsLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setRatingsLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    const response = await axios.get(`${URL}/doctor-rating/rating`, {
      headers: { token: token }
    });
    console.log("Doctor rating response:", response.data);

    if (response.data.success) {
      setRatings(prev => ({
        ...prev,
        overallRating: response.data.overallRating || 0,
        excellent: response.data.excellent || 0,
        good: response.data.good || 0,
        average: response.data.average || 0,
        belowAverage: response.data.belowAverage || 0,
        poor: response.data.poor || 0
      }));
    }
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch ratings';
    setError(errorMessage);
    console.error("Error fetching doctor ratings:", err);
    return { success: 0, message: errorMessage };
  } finally {
    setRatingsLoading(false);
  }
};

// ✅ GET RATING FEEDBACK
const getRatingFeedback = async (page = 1, limit = 5) => {
  setRatingsLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setRatingsLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    const response = await axios.get(`${URL}/doctor-rating/feedback`, {
      headers: { token: token },
      params: { page, limit }
    });
    console.log("Rating feedback response:", response.data);

    if (response.data.success) {
      setRatings(prev => ({
        ...prev,
        feedbacks: response.data.details || [],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(response.data.details?.length / limit) || 1,
          totalFeedbacks: response.data.details?.length || 0
        }
      }));
    }
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch feedback';
    setError(errorMessage);
    console.error("Error fetching rating feedback:", err);
    return { success: 0, message: errorMessage };
  } finally {
    setRatingsLoading(false);
  }
};

// ✅ GET ALL RATING DATA (Combined function)
const getAllRatingData = async (page = 1, limit = 5) => {
  await getDoctorRating();
  await getRatingFeedback(page, limit);
};

// ==================== QUALIFICATION FUNCTIONS ====================
const [qualifications, setQualifications] = useState([]);
const [qualificationsLoading, setQualificationsLoading] = useState(false);

// ✅ GET QUALIFICATIONS
const getQualifications = async () => {
  setQualificationsLoading(true);
  setError(null);
  const token = getDoctorToken();
  if (!token) {
    setError('Authentication token not found. Please log in.');
    setQualificationsLoading(false);
    return { success: 0, message: 'Authentication token not found.' };
  }

  try {
    const response = await axios.get(`${URL}/qualification`, {
      headers: { token: token }
    });
    console.log("Qualifications response:", response.data);

    if (response.data.success) {
      setQualifications(response.data.details || []);
    } else {
      setQualifications([]);
    }
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch qualifications';
    setError(errorMessage);
    console.error("Error fetching qualifications:", err);
    setQualifications([]);
    return { success: 0, message: errorMessage };
  } finally {
    setQualificationsLoading(false);
  }
};

// Context.jsx में ये functions add करें

// Send call notification to patient
const sendCallNotification = async (patientRegId, channelName, type, appointmentId) => {
  const token = getDoctorToken();
  if (!token) throw new Error('No authentication token');

  try {
    const response = await axios.post(
      `${URL}/fire/firebaseNotification`,
      {
        regId: patientRegId,
        channelName: channelName,
        doctorId: doctorData?._id,
        type: type, // "video" or "audio"
        appointmentId: appointmentId
      },
      {
        headers: { token: token },
      }
    );
    return response.data;
  } catch (err) {
    console.error('Error sending call notification:', err);
    throw err;
  }
};

// End call
const endCall = async (appointmentId) => {
  const token = getDoctorToken();
  if (!token) throw new Error('No authentication token');

  try {
    const response = await axios.post(
      `${URL}/fire/EndCall`,
      { appointmentId },
      {
        headers: { token: token },
      }
    );
    return response.data;
  } catch (err) {
    console.error('Error ending call:', err);
    throw err;
  }
};

// Send chat notification
const sendChatNotification = async (patientRegId, message, chatType = "text") => {
  const token = getDoctorToken();
  if (!token) throw new Error('No authentication token');

  try {
    const response = await axios.post(
      `${URL}/fire/sendChatNotification`,
      {
        regId: patientRegId,
        senderId: doctorData?._id,
        senderType: "doctor",
        message: message,
        chatType: chatType
      },
      {
        headers: { token: token },
      }
    );
    return response.data;
  } catch (err) {
    console.error('Error sending chat notification:', err);
    throw err;
  }
};

  // Initialize doctor data on component mount
  useEffect(() => {
    const initializeDoctorData = async () => {
      const token = getDoctorToken();
      if (token) {
        await getDoctorProfile();
      }
    };
    initializeDoctorData();
  }, []);


/////////////////////////// clinic panel ///////////////////////////


const [clinicData, setClinicData] = useState(null);
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const [clinicAchievements, setClinicAchievements] = useState([]);
  const [clinicSpecialists, setClinicSpecialists] = useState([]);
  const [allSpecialists, setAllSpecialists] = useState([]); // Add this state


  // Get auth token for clinic
  const getClinicToken = () => {
    const tokenInfo = sessionStorage.getItem('clinictoken');
    return tokenInfo ? JSON.parse(tokenInfo) : null;
  };
// Clinic Login Function
  const loginClinic = async (email, password, regId, loginType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${URL}/Clinic/loginDoctor`, { 
        email, 
        password, 
        regId, 
        loginType 
      });
      
      if (response.data.success) {
        sessionStorage.setItem('clinictoken', JSON.stringify(response.data.details));
        setClinicData(response.data.details);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clinic Registration Function
  const registerClinic = async (clinicData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // Append all fields
      Object.keys(clinicData).forEach(key => {
        if (key === 'image' || key === 'certificate' || key === 'licenceImage') {
          if (clinicData[key]) {
            formData.append(key, clinicData[key]);
          }
        } else {
          formData.append(key, clinicData[key]);
        }
      });

      const response = await axios.post(`${URL}/Clinic/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Clinic Profile
  const getClinicProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = JSON.parse(sessionStorage.getItem('clinictoken'));
      const response = await axios.get(`${URL}/Clinic/getClinic`, {
        headers: {
          token: tokenInfo?.token
        }
      });
      
      if (response.data.success) {
        setClinicData(response.data.details);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update Clinic Profile
  const updateClinicProfile = async (updateData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(updateData).forEach(key => {
        if (key === 'image' || key === 'posterimage' || key === 'clinicImages') {
          if (updateData[key]) {
            if (Array.isArray(updateData[key])) {
              updateData[key].forEach(file => {
                formData.append(key, file);
              });
            } else {
              formData.append(key, updateData[key]);
            }
          }
        } else {
          formData.append(key, updateData[key]);
        }
      });

      const tokenInfo = JSON.parse(sessionStorage.getItem('clinictoken'));
      const response = await axios.patch(`${URL}/Clinic/update-doctor`, formData, {
        headers: {
          token: tokenInfo?.token,
        }
      });
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // sessionStorage.removeItem('doctortoken');
    sessionStorage.removeItem('clinictoken');
    setDoctorData(null);
    setClinicData(null);
    setError(null);
  };

  // Get Clinic Doctors
  const getClinicDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = getClinicToken();
      const response = await axios.get(`${URL}/Clinic/getDoctor`, {
        headers: {
          token: tokenInfo?.token,
        }
      }); 
      console.log("Clinic doctors response:", response.data);
      
      if (response.data.success) {
        setClinicDoctors(response.data.details);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctors');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Edit Clinic Doctor
 // Context में editClinicDoctor function को fix करें
const editClinicDoctor = async (doctorId, formData) => {
  setLoading(true);
  setError(null);
  try {
    const tokenInfo = getClinicToken();
    
    // DEBUG: FormData content check
    console.log("FormData being sent:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await axios.put(
      `${URL}/Clinic/editclinicDoctor?doctorId=${doctorId}`,
      formData,
      {
        headers: {
          'token': tokenInfo?.token,
          'Content-Type': 'multipart/form-data', // ✅ IMPORTANT: Add this
        }
      }
    );
    
    console.log("Edit clinic doctor response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Edit clinic doctor error:", err);
    setError(err.response?.data?.message || 'Failed to update doctor');
    throw err;
  } finally {
    setLoading(false);
  }
};

// Add Doctor Function
// Update the addDoctor function in your MyContext.js
// Update the addDoctor function in your MyContext.js
const addDoctor = async (formData) => {
  setLoading(true);
  setError(null);
  try {
    // Get clinic token and extract clinic ID
    const clinicTokenInfo = sessionStorage.getItem('clinictoken');
    if (!clinicTokenInfo) {
      throw new Error('Clinic authentication required');
    }

    const parsedToken = JSON.parse(clinicTokenInfo);
    console.log('Full token object:', parsedToken);

    // Extract token
    const token = parsedToken.token || parsedToken.accessToken || parsedToken.access_token;
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Decode JWT token to get clinic ID
    let clinicId = null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decodedToken = JSON.parse(jsonPayload);
      console.log('Decoded JWT payload:', decodedToken);
      
      clinicId = decodedToken.id || decodedToken.clinicId || decodedToken.userId || decodedToken._id;
      
      if (!clinicId) {
        console.log('Available decoded token properties:', Object.keys(decodedToken));
        throw new Error('Clinic ID not found in decoded token');
      }
    } catch (error) {
      console.error('Error decoding JWT:', error);
      throw new Error('Invalid authentication token');
    }

    console.log('Found Clinic ID:', clinicId);

    // Add clinicId and loginType to formData
    formData.append('clinicId', clinicId.toString());
    formData.append('loginType', 'clinic');

    // Debug: Log what's being sent
    console.log("Final FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await axios.post(`${URL}/doctor/register`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000,
    });
    
    console.log("Doctor registration response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Doctor registration error:", err);
    const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.message || 
                        'Doctor registration failed';
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};


  // Delete Clinic Doctor
  const deleteClinicDoctor = async (doctorId) => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = getClinicToken();
      const response = await axios.delete(`${URL}/Clinic/deleteDoctor`, {
        headers: {
          token: tokenInfo?.token,
        },
        params: { _id: doctorId }
      });
      
      if (response.data.success) {
        // Remove from local state
        setClinicDoctors(prev => prev.filter(doctor => doctor._id !== doctorId));
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload Achievement Images
  const uploadClinicAchievements = async (files) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('achievementImages', file);
      });

      const tokenInfo = getClinicToken();
      const response = await axios.post(`${URL}/Clinic/uploadAchievement`, formData, {
        headers: {
          token: tokenInfo?.token,

        }
      });
      
      if (response.data.success) {
        setClinicAchievements(response.data.images);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload achievements');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Clinic Achievements
  const getClinicAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = getClinicToken();
      const response = await axios.get(`${URL}/Clinic/getClinicAchievement`, {
        headers: {
          token: tokenInfo?.token,
        }
      });
      
      if (response.data.success) {
        setClinicAchievements(response.data.achievementImages);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch achievements');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete Achievement Images
  const deleteClinicAchievements = async (imagePath = null, all = false) => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = getClinicToken();
      const response = await axios.delete(`${URL}/Clinic/deleteAchievementImages`, {
        headers: {
          token: tokenInfo?.token,
        },
        data: { imagePath, all }
      });
      
      if (response.data.success) {
        await getClinicAchievements(); // Refresh achievements
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete achievements');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add Clinic Services/Specialists
const addClinicServices = async (specialists) => {
  setLoading(true);
  setError(null);
  try {
    const tokenInfo = getClinicToken();
    const response = await axios.post(`${URL}/Clinic/service`, 
      { specialists },
      {
        headers: {
        token: tokenInfo?.token,
        }
      }
    );
    
    return response.data;
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to add services');
    throw err;
  } finally {
    setLoading(false);
  }
};

// Get Clinic Specialists
const getClinicSpecialists = async () => {
  setLoading(true);
  setError(null);
  try {
    const tokenInfo = getClinicToken();
    const response = await axios.get(`${URL}/Clinic/getClinicSpecialists`, {
      headers: {
        token: tokenInfo?.token,
      }
    });
    
    if (response.data.success) {
      setClinicSpecialists(response.data.specialists);
    }
    return response.data;
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch specialists');
    throw err;
  } finally {
    setLoading(false);
  }
};

// Remove Clinic Specialist
const removeClinicSpecialist = async (specialistId) => {
  setLoading(true);
  setError(null);
  try {
    const tokenInfo = getClinicToken();
    const response = await axios.delete(`${URL}/Clinic/removeSpecialistFromClinic`, {
      headers: {
        token: tokenInfo?.token,
      },
      data: { specialistId }
    });
    
    if (response.data.success) {
      await getClinicSpecialists(); // Refresh specialists
    }
    return response.data;
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to remove specialist');
    throw err;
  } finally {
    setLoading(false);
  }
};

// Get All Specialists (for dropdown)
const getAllSpecialists = async () => {
  setLoading(true);
  setError(null);
  try {
    const tokenInfo = getClinicToken();
    const response = await axios.get(`${URL}/Clinic/getAllSpecialists`, {
      headers: {
        token: tokenInfo?.token,
      }
    });
    console.log("All specialists response:", response.data);  
    
    if (response.data && response.data.success) {
      setAllSpecialists(response.data.data || response.data.specialists || []);
    }
    return response.data;
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch all specialists');
    // Empty array set karo error case mein
    setAllSpecialists([]);
    throw err;
  } finally {
    setLoading(false);
  }
};

 // Update Clinic Timings - POST method use karo
const updateClinicTimings = async (timingsData) => {
  setLoading(true);
  setError(null);
  try {
    const tokenInfo = getClinicToken();
    const response = await axios.post(`${URL}/Clinic/updateClinicTimings`, 
      timingsData,
      {
        headers: {
          token: tokenInfo?.token,
        }
      }
    );
    
    return response.data;
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to update timings');
    throw err;
  } finally {
    setLoading(false);
  }
};

  // Change Clinic Password
  const changeClinicPassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = getClinicToken();
      const response = await axios.put(`${URL}/Clinic/change-password`, 
        passwordData,
        {
          headers: {
          token: tokenInfo?.token,
          }
        }
      );
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Clinic Documents
const getClinicDocuments = async () => {
  setLoading(true);
  setError(null);
  try {
    const tokenInfo = getClinicToken();
    const response = await axios.get(`${URL}/Clinic-Documnet/update`, {
      headers: {
          token: tokenInfo?.token,
      }
    });
    
    return response.data;
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch documents');
    throw err;
  } finally {
    setLoading(false);
  }
};

// Update Clinic Documents
const updateClinicDocuments = async (documentsData) => {
  setLoading(true);
  setError(null);
  try {
    const formData = new FormData();
    
    // Append file fields
    const fileFields = [
      'licenceImage', 'accreditation', 'doctorCertificate'
    ];
    
    const arrayFileFields = [
      'aadharCard', 'panCard', 'drivingLicence'
    ];

    // Append single files
    fileFields.forEach(field => {
      if (documentsData[field]) {
        formData.append(field, documentsData[field]);
      }
    });

    // Append array files
    arrayFileFields.forEach(field => {
      if (documentsData[field] && Array.isArray(documentsData[field])) {
        documentsData[field].forEach(file => {
          formData.append(field, file);
        });
      }
    });

    const tokenInfo = getClinicToken();
    const response = await axios.post(`${URL}/Clinic-Documnet/update`, formData, {
      headers: {
          token: tokenInfo?.token,

      }
    });
    console.log("Update clinic documents response:", response.data);  
    
    return response.data;
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to update documents');
    throw err;
  } finally {
    setLoading(false);
  }
};

// Clinic Appointments Functions
  const getAllClinicAppointments = async (type = '', page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = getClinicToken();
      const response = await axios.get(`${URL}/ClinicAppointment/getAllClinicAppointments`, {
        headers: { token: tokenInfo?.token },
        params: { type, page }
      });
      console.log("Clinic appointments response:", response.data);
      
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptOrRejectAppointmentClinic = async (appointmentId, status, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = getClinicToken();
      const response = await axios.post(
        `${URL}/ClinicAppointment/acceptOrRejctAppointment?appointmentId=${appointmentId}&status=${status}`,
        { reason },
        { headers: { token: tokenInfo?.token } }
      );
      console.log("Accept/Reject appointment response:", response.data);
      
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to update appointment');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reassignDoctor = async (appointmentId, doctorId) => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = getClinicToken();
      const response = await axios.post(
        `${URL}/ClinicAppointment/reassignDoctor`,
        { appointmentId, doctorid: doctorId },
        { headers: { token: tokenInfo?.token } }
      );
      
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to reassign doctor');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reassign doctor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getClinicOrderHistory = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = getClinicToken();
      const response = await axios.get(`${URL}/ClinicAppointment/getClinicOrderHistory`, {
        headers: { token: tokenInfo?.token },
        params: { page }
      });
      console.log("Clinic order history response:", response.data);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch order history');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order history');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getClinicRating = async () => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = getClinicToken();
      const response = await axios.get(`${URL}/ClinicAppointment/getClinicRating`, {
        headers: { token: tokenInfo?.token }
      });
      console.log("Clinic rating response:", response.data);
      
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch clinic ratings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch clinic ratings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRatingFeedbackClinic = async (page = 1, limit = 5) => {
    setLoading(true);
    setError(null);
    try {
      const tokenInfo = getClinicToken();
      const response = await axios.get(`${URL}/ClinicAppointment/getRatingFeedbackclinic`, {
        headers: { token: tokenInfo?.token },
        params: { page, limit }
      });
      console.log("Clinic rating feedback response:", response.data);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch feedback');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch feedback');
      throw err;
    } finally {
      setLoading(false);
    }
  };


// ************  Clinic API fetch Strat ****************

  //============ Admin Clinic Get ==================
  const [adminClinic, setAdminClinic] = useState([]);
  const [clinicStats, setClinicStats] = useState([]);


  const getAdminClinic = async (filters = globalFilters) => {
    try {
      setLoading(true);
      setError(null);

      const tokens = JSON.parse(sessionStorage.getItem("admin"));
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.city) queryParams.append('city', filters.city);

      const response = await axios.get(`${URL}/admin-clinic/clinics?${queryParams}`, {
        headers: { 
          'Content-Type': 'application/json',
          token: tokens.token, 
        }   
      });
      console.log("Get admin clinic response:", response.data);

      if (response.data.success) {
        setAdminClinic(response.data.data.clinics || []);
      } else {
        setAdminClinic([]);
        setError("No clinic details found");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch clinic details';
      setError(errorMessage);
      console.error("Error fetching clinic details:", err);
      setAdminClinic([]);
    } finally {
      setLoading(false);
    }
  };

const fetchclinicstats = async () => {
  try {
    setLoading(true);
    setError(null);

    // ✅ Get admin token from sessionStorage
    const tokens = JSON.parse(sessionStorage.getItem("admin"));

    // ✅ API Call
    const response = await axios.get(`${URL}/admin-clinic/clinics/stats`, {
      headers: {
        "Content-Type": "application/json",
        token: tokens?.token,
      },
    });

    console.log("Get Admin Clinic Stats Response:from context", response.data);

    if (response.data.success) {
      // ✅ Save the stats array (same structure as food stats)
      setClinicStats(response.data.data || []);
    } else {
      setClinicStats([]);
      setError("No clinic statistics found");
    }

  } catch (err) {
    const errorMessage =
      err.response?.data?.message || "Failed to fetch clinic statistics";
    setError(errorMessage);
    console.error("Error fetching clinic statistics:", err);
    setClinicStats([]);
  } finally {
    setLoading(false);
  }
};


  // In your Context file
const approveClinic = async (clinicId) => {
  try {
    setLoading(true);
    const tokens = JSON.parse(sessionStorage.getItem("admin"));
    
    const response = await axios.patch(
      `${URL}/admin-clinic/approve/${clinicId}`,
      {}, // Empty body for approve
      {
        headers: { 
          'Content-Type': 'application/json',
          token: tokens.token, 
        }   
      }
    );

    if (response.data.success) {
      // Update the local state to reflect the change immediately
      setAdminClinic(prevClinics => 
        prevClinics.map(clinic => 
          clinic._id === clinicId 
            ? { 
                ...clinic, 
                Accountverify: '1',
                rejectReason: '' 
              }
            : clinic
        )
      );
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }

  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to approve clinic';
    console.error("Error approving clinic:", err);
    return { success: false, message: errorMessage };
  } finally {
    setLoading(false);
  }
};

const rejectClinic = async (clinicId, rejectReason) => {
  try {
    setLoading(true);
    const tokens = JSON.parse(sessionStorage.getItem("admin"));
    
    const response = await axios.patch(
      `${URL}/admin-clinic/reject/${clinicId}`,
      { rejectReason },
      {
        headers: { 
          'Content-Type': 'application/json',
          token: tokens.token, 
        }   
      }
    );

    if (response.data.success) {
      // Update the local state to reflect the change immediately
      setAdminClinic(prevClinics => 
        prevClinics.map(clinic => 
          clinic._id === clinicId 
            ? { 
                ...clinic, 
                Accountverify: '2',
                rejectReason: rejectReason 
              }
            : clinic
        )
      );
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }

  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to reject clinic';
    console.error("Error rejecting clinic:", err);
    return { success: false, message: errorMessage };
  } finally {
    setLoading(false);
  }
};

// In your Context file
const [clinicDocuments, setClinicDocuments] = useState(null);
const [documentsLoading, setDocumentsLoading] = useState(false);
const [documentsError, setDocumentsError] = useState(null);

// Get clinic documents
const getClinicDocument = async (clinicId) => {
  try {
    setDocumentsLoading(true);
    setDocumentsError(null);
    
    const tokens = JSON.parse(sessionStorage.getItem("admin"));
    const response = await axios.get(
      `${URL}/admin-clinic/getDocumentByClinicId/${clinicId}`,
      {
        headers: { 
          'Content-Type': 'application/json',
          token: tokens.token, 
        }   
      }
    );
    console.log("Get clinic documents response:", response.data);

    if (response.data.success) {
      setClinicDocuments(response.data.data);
      return { success: true, data: response.data.data };
    } else {
      setDocumentsError(response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch clinic documents';
    setDocumentsError(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    setDocumentsLoading(false);
  }
};

const approveDocumentField = async (clinicId, field) => {
  try {
    const tokens = JSON.parse(sessionStorage.getItem("admin"));
    const response = await axios.patch(
      `${URL}/admin-clinic/approveClinicDocumentField/${clinicId}`,
      { field },
      {
        headers: { 
          'Content-Type': 'application/json',
          token: tokens.token, 
        }   
      }
    );

    if (response.data.success) {
      // Update local state correctly
      setClinicDocuments(prev => ({
        ...prev,
        [field]: "1" // Set to approved status
      }));
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to approve document';
    return { success: false, message: errorMessage };
  }
};

const rejectDocumentField = async (clinicId, field, rejectReason) => {
  try {
    const tokens = JSON.parse(sessionStorage.getItem("admin"));
    const response = await axios.patch(
      `${URL}/admin-clinic/rejectClinicDocumentField/${clinicId}`,
      { field, rejectReason },
      {
        headers: { 
          'Content-Type': 'application/json',
          token: tokens.token, 
        }   
      }
    );

    if (response.data.success) {
      // Update local state correctly
      setClinicDocuments(prev => ({
        ...prev,
        [field]: "2", // Set to rejected status
        rejectReasons: {
          ...prev.rejectReasons,
          [field]: rejectReason
        }
      }));
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to reject document';
    return { success: false, message: errorMessage };
  }
};


  // ************  Clinic API fetch End  ********************

    // ============== Create Test (POST) ===================
  const [createStatus, setCreateStatus] = useState({ success: null, message: '' });
 
  const createTest = async (name, category) => {
    setCreateStatus({ success: null, message: '' });
    try {
     
     
      const tokenS = JSON.parse(sessionStorage.getItem("admin"));
      if (!tokenS) {
        setCreateStatus({ success: 0, message: 'Authentication token not found. Please log in.' });
        return { success: 0, message: 'Authentication token not found.' };
      }
 
 
      const response = await axios.post(`${URL}/admin-test/create`, {
        name,
        category
      }, {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token,
         }  
      });
     
      console.log("Create test response:", response.data);
 
        if (response.data.success === 1) {
        setCreateStatus({ success: 1, message: response.data.message || 'Test created successfully!' });
       
      } else {
        setCreateStatus({ success: 0, message: response.data.message || 'Failed to create test (API returned success: 0).' });
      }
      return response.data;
 
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Network error during test creation.';
      setCreateStatus({ success: 0, message: errorMessage });
      console.error("Error creating test:", err);
      return { success: 0, message: errorMessage };
    } finally {
     
    }
  }
  
  //==============   contact Us ===============
const [contactData, setContactData] = useState(null);
const [contactDataAdmin, setContactDataAdmin] = useState(null);
 
 
  // Fetch contact data
  const fetchContactData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${URL}/admin/get-contact-user`); // user controller
      setContactData(response.data);
      return { success: true, data: response.data };
     
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch contact data';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };
  // Fetch contact data Admin
  const fetchContactDataAdmin = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${URL}/admin/get-contact`,
        {
          headers: {
            'Content-Type': 'application/json',
            token: tokenS.token,
           }  
          }
      );
      setContactDataAdmin(response.data);
      return { success: true, data: response.data };
     
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch contact data';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };
 
  // Update contact data
  const updateContactData = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`${URL}/admin/update-contact`, data,
        {
          headers: {
            'Content-Type': 'application/json',
            token: tokenS.token,
           }  
          },
        );
      setContactData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update contact data';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };
 
  // Create contact data
  const createContactData = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${URL}/admin/create-contact`, data,
        {
          headers: {
            'Content-Type': 'application/json',
            token: tokenS.token,
           }  
          }
      );
      setContactData(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create contact data';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };
 
  // Clear errors
 
  useEffect(() => {
    fetchContactData();
  }, []);
 
  useEffect(() => {
    fetchContactDataAdmin();
  }, []);
//  ================ Contact Us  End ================
 // ============ Footer Started ============
const [footerContent, setFooterContent] = useState(null);
const [policies, setPolicies] = useState({ privacyPolicy: '', termsAndConditions: '' });
const [footerContentUser, setFooterContentUser] = useState(null);
const [policiesUser, setPoliciesUser] = useState({ privacyPolicy: '', termsAndConditions: '' });

// ✅ MULTIPLE Bank Logos States (Rename from single to plural)
const [banksLogos, setBanksLogos] = useState([]); // Array of logos
const [bankLogosLoading, setBankLogosLoading] = useState(false);
const [bankLogosError, setBankLogosError] = useState('');
const [bankLogosMessage, setBankLogosMessage] = useState('');

// ✅ Clear Bank Logos Errors/Messages
const clearBankLogosError = () => {
  setBankLogosError('');
  setBankLogosMessage('');
};

// ==================== MULTIPLE BANK LOGOS CRUD FUNCTIONS ====================

// ✅ GET Multiple Bank Logos (Admin - with token)
const getBanksLogos = async () => {
  try {
    setBankLogosLoading(true);
    setBankLogosError('');
    
    const response = await axios.get(`${URL}/footer-content/get-banks-logo`, 
      {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token,
        }  
      }
    );
    
    if (response.data.success) {
      // Now expecting array of logos
      setBanksLogos(response.data.data.banksLogos || []);
    }
    
    return response.data;
  } catch (err) {
    const errMsg = err.response?.data?.error || 'Failed to fetch bank logos';
    setBankLogosError(errMsg);
    throw err;
  } finally {
    setBankLogosLoading(false);
  }
};

// ✅ GET Multiple Bank Logos (Public - without token)
const getBanksLogosPublic = async () => {
  try {
    setBankLogosLoading(true);
    setBankLogosError('');
    
    const response = await axios.get(`${URL}/footer-content/get-banks-logo-user`);
    
    if (response.data.success) {
      setBanksLogos(response.data.data.banksLogos || []);
    }
    
    return response.data;
  } catch (err) {
    const errMsg = err.response?.data?.error || 'Failed to fetch bank logos';
    setBankLogosError(errMsg);
    throw err;
  } finally {
    setBankLogosLoading(false);
  }
};

// ✅ CREATE Multiple Bank Logos (Upload multiple at once)
const createBanksLogos = async (formData) => {
  try {
    setBankLogosLoading(true);
    setBankLogosError('');
    setBankLogosMessage('');
    
    const response = await axios.post(
      `${URL}/footer-content/create-banks-logo`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: tokenS.token,
        }
      }
    );
    
    if (response.data.success) {
      setBanksLogos(response.data.data.banksLogos || []);
      setBankLogosMessage(response.data.message || 'Bank logos uploaded successfully!');
    }
    
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.error || 'Failed to create bank logos';
    setBankLogosError(errMsg);
    throw error;
  } finally {
    setBankLogosLoading(false);
  }
};

// ✅ UPDATE Single Bank Logo Details (name, order, status)
const updateBankLogo = async (logoId, updateData) => {
  try {
    setBankLogosLoading(true);
    setBankLogosError('');
    setBankLogosMessage('');
    
    const response = await axios.put(
      `${URL}/footer-content/update-banks-logo/${logoId}`, 
      updateData,
      {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token,
        }
      }
    );
    
    if (response.data.success) {
      // Update in local state
      setBanksLogos(prev => prev.map(logo => 
        logo._id === logoId ? { ...logo, ...updateData } : logo
      ));
      setBankLogosMessage('Bank logo updated successfully!');
    }
    
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.error || 'Failed to update bank logo';
    setBankLogosError(errMsg);
    throw error;
  } finally {
    setBankLogosLoading(false);
  }
};

// ✅ UPDATE Single Bank Logo Image (Replace image only)
const updateBankLogoImage = async (logoId, formData) => {
  try {
    setBankLogosLoading(true);
    setBankLogosError('');
    setBankLogosMessage('');
    
    const response = await axios.put(
      `${URL}/footer-content/update-banks-logo-image/${logoId}`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: tokenS.token,
        }
      }
    );
    
    if (response.data.success) {
      // Update in local state
      setBanksLogos(prev => prev.map(logo => 
        logo._id === logoId ? { ...logo, ...response.data.data.logo } : logo
      ));
      setBankLogosMessage('Bank logo image replaced successfully!');
    }
    
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.error || 'Failed to update bank logo image';
    setBankLogosError(errMsg);
    throw error;
  } finally {
    setBankLogosLoading(false);
  }
};

// ✅ DELETE Single Bank Logo
const deleteBankLogo = async (logoId) => {
  try {
    setBankLogosLoading(true);
    setBankLogosError('');
    setBankLogosMessage('');
    
    const response = await axios.delete(
      `${URL}/footer-content/delete-banks-logo/${logoId}`, 
      {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token,
        }  
      }
    );
    
    if (response.data.success) {
      // Remove from local state
      setBanksLogos(prev => prev.filter(logo => logo._id !== logoId));
      setBankLogosMessage('Bank logo deleted successfully!');
    }
    
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.error || 'Failed to delete bank logo';
    setBankLogosError(errMsg);
    throw error;
  } finally {
    setBankLogosLoading(false);
  }
};

// ✅ DELETE ALL Bank Logos
const deleteAllBanksLogos = async () => {
  try {
    setBankLogosLoading(true);
    setBankLogosError('');
    setBankLogosMessage('');
    
    const response = await axios.delete(
      `${URL}/footer-content/delete-all-banks-logo`, 
      {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token,
        }  
      }
    );
    
    if (response.data.success) {
      setBanksLogos([]);
      setBankLogosMessage('All bank logos deleted successfully!');
    }
    
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.error || 'Failed to delete all bank logos';
    setBankLogosError(errMsg);
    throw error;
  } finally {
    setBankLogosLoading(false);
  }
};

// ✅ REORDER Bank Logos
const reorderBanksLogos = async (logoOrders) => {
  try {
    setBankLogosLoading(true);
    setBankLogosError('');
    setBankLogosMessage('');
    
    const response = await axios.put(
      `${URL}/footer-content/reorder-banks-logo`, 
      { logoOrders },
      {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token,
        }
      }
    );
    
    if (response.data.success) {
      setBanksLogos(response.data.data.banksLogos || []);
      setBankLogosMessage('Bank logos reordered successfully!');
    }
    
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.error || 'Failed to reorder bank logos';
    setBankLogosError(errMsg);
    throw error;
  } finally {
    setBankLogosLoading(false);
  }
};

// ============ Existing Footer Functions (Keep as is) ============

// Get Footer Content
const getFooterContent = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${URL}/footer-content/get-footer`,
      {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token,
        }  
      }
    );
    setFooterContent(response.data);
    return response.data;
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to fetch footer content');
  } finally {
    setLoading(false);
  }
};

// Get Footer ContentUser
const getFooterContentUser = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${URL}/footer-content/get-footer-user`);
    setFooterContentUser(response.data);
    return response.data;
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to fetch footer content');
  } finally {
    setLoading(false);
  }
};

// Get Policies (Admin)
const getPolicies = async () => {
  // FIX: Agar tokenS null hai ya token nahi hai, to yahi ruk jao.
  if (!tokenS || !tokenS.token) {
    return; 
  }

  try {
    setLoading(true);
    const response = await axios.get(`${URL}/footer-content/get-policy`,
      {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token, // Ab yeh safe hai kyunki upar check laga diya
        }  
      }
    );
        
    // Logic as per your code
    if (response.data.data) {
      setPolicies(response.data.data);
    } else if (response.data.privacyPolicy !== undefined) {
      setPolicies(response.data);
    } else {
      setPolicies({ 
        privacyPolicy: '', 
        termsAndConditions: '' 
      });
    }
    
    return response.data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to fetch policies';
    setError(errorMsg);
    console.error('Error fetching policies:', err);
    return null;
  } finally {
    setLoading(false);
  }
};


// Get Policies User
const getPoliciesUser = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${URL}/footer-content/get-policy-user`);
    // Yahan par response.data.data ko set karna hoga
    setPoliciesUser(response.data.data);  // <-- Yeh change karein
    return response.data.data;
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to fetch policies');
    throw err;
  } finally {
    setLoading(false);
  }
};

// Create Footer Content
const createFooterContent = async (formData) => {
  try {
    setLoading(true);
    const response = await axios.post(`${URL}/footer-content/create-footer`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        token: tokenS.token,
      }  
    });
    setFooterContent(response.data);
    return response.data;
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to create footer content');
    throw err;
  } finally {
    setLoading(false);
  }
};

// Update Footer Content
const updateFooterContent = async (id, formData) => {
  try {
    setLoading(true);
    const response = await axios.put(`${URL}/footer-content/update-footer/${id}`, formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: tokenS.token,
        }  
      });
    setFooterContent(response.data.data);
    return response.data;
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to update footer content');
    throw err;
  } finally {
    setLoading(false);
  }
};


// Update Policies
const updatePolicies = async (policyData) => {
  try {
    setLoading(true);
    const response = await axios.put(
      `${URL}/footer-content/update-policy`, 
      policyData, 
      {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token,
        }  
      }
    );
    
    // ✅ Fix: Response structure check करें
    console.log('Update policies response:', response.data);
    
    if (response.data.data) {
      setPolicies(response.data.data);
    } else {
      setPolicies(policyData);
    }
    
    return response.data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to update policies';
    setError(errorMsg);
    throw err;
  } finally {
    setLoading(false);
  }
};

// ============ Footer End ============

 // =========== Appointment History ==============
  const [appointmentsData, setAppointmentsData] = useState(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [errorAppointments, setErrorAppointments] = useState(null);
  const [currentPageAppointment, setCurrentPageAppointment] = useState(1);
  const [totalPagesAppointment, setTotalPagesAppointment] = useState(1);
  const [totalOrdersAppointment, setTotalOrdersAppointment] = useState(0);

  // Get token from localStorage or cookies
 

  // Get Order History with Pagination
  const getOrderHistory = async (page = 1, status = 'all', limit = 10) => {
    setLoadingAppointments(true);
    setErrorAppointments(null);
    
    try {
      const token = localStorage.getItem('token');
      // Build query params
      const params = {
        page,
        limit
      };
      
      // Add status only if not 'all'
      if (status && status !== 'all') {
        params.status = status;
      }
      
      const response = await axios.get(`${URL}/user-appointment/order-history`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success === 1) {
        setAppointmentsData(response.data);
        setCurrentPageAppointment(response.data.currentPage || 1);
        setTotalPagesAppointment(response.data.totalPages || 1);
        setTotalOrdersAppointment(response.data.totalOrders || 0);
      } else {
        throw new Error(response.data.message || 'Failed to fetch appointments');
      }
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setErrorAppointments(
        error.response?.data?.message || 
        error.message || 
        'Failed to load appointments. Please try again.'
      );
      // Reset to defaults on error
      setAppointmentsData({ data: [] });
      setCurrentPageAppointment(1);
      setTotalPagesAppointment(1);
      setTotalOrdersAppointment(0);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Refresh Current Page
  const refreshCurrentPage = async () => {
    if (currentPageAppointment && appointmentsData) {
      await getOrderHistory(
        currentPageAppointment, 
        // Extract current status from appointments data or use default
        'all', // You might want to track current status in state
        appointmentsData.data?.length || 10
      );
    }
  };

  // Clear appointments data
  const clearAppointments = () => {
    setAppointmentsData(null);
    setErrorAppointments(null);
    setCurrentPageAppointment(1);
    setTotalPagesAppointment(1);
    setTotalOrdersAppointment(0);
  };
 
  // Load data on component mount
  useEffect(() => {
    getFooterContent();
    getPolicies();
    getPoliciesUser();
  }, []);
// ============ Footer Ended============
 // ============ Brand Images ==============
// ==== BRAND IMAGES CONTEXT ====
const [brands, setBrands] = useState([]);
const [loadingBrand, setLoadingBrand] = useState(false);
const [errorBrand, setErrorBrand] = useState(null);
const [brandsAdmin, setBrandsAdmin] = useState([]);
const [loadingBrandAdmin, setLoadingBrandAdmin] = useState(false);
const [errorBrandAdmin, setErrorBrandAdmin] = useState(null);
 
 
 
// GET ALL BRANDS
const getAllBrands = async () => {
  const token = localStorage.getItem("token")
  setLoadingBrand(true);
  setErrorBrand(null);
  try {
    const response = await axios.get(`${URL}/brand-images-pharmacy/get-all-data`,
      {
        headers: {
          'Content-Type': 'application/json',
          token: token,
         }
      }
    );
    setBrands(response.data.data || response.data);
    return response.data;
  } catch (err) {
    setErrorBrand(err.response?.data?.message || 'Failed to fetch brands');
    console.error('Error fetching brands:', err);
    throw err;
  } finally {
    setLoadingBrand(false);
  }
};
const getAllBrandsAdmin = async () => {
 
  setLoadingBrandAdmin(true);
  setErrorBrandAdmin(null);
  try {
    const response = await axios.get(`${URL}/brand-images-pharmacy/get-all`,
      {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token,
         }
      }
    );
    setBrandsAdmin(response.data.data || response.data);
    return response.data;
  } catch (err) {
    setErrorBrandAdmin(err.response?.data?.message || 'Failed to fetch brands');
    console.error('Error fetching brands:', err);
    throw err;
  } finally {
    setLoadingBrandAdmin(false);
  }
};
 
// CREATE BRAND (With admin middleware) - FIXED
const createBrand = async (formData) => {
  setLoadingBrand(true);
  setErrorBrand(null);
  try {
    // DEBUG: Check what we're getting
    const adminData = sessionStorage.getItem("admin");
 
    const tokenS = JSON.parse(adminData);
 
    // Get token - MULTIPLE ATTEMPTS
    let token = null;
   
    // Method 1: Direct access
    if (tokenS && tokenS.token) {
      token = tokenS.token;
   
    }
    // Method 2: Nested access
    else if (tokenS && tokenS.data && tokenS.data.token) {
      token = tokenS.data.token;
     
    }
    // Method 3: User object
    else if (tokenS && tokenS.user && tokenS.user.token) {
      token = tokenS.user.token;
    }
    // Method 4: Check all string properties
    else if (tokenS) {
      for (let key in tokenS) {
        if (typeof tokenS[key] === 'string' &&
            tokenS[key].length > 100 &&
            tokenS[key].includes('.')) {
          token = tokenS[key];
          console.log(`Found token in property: ${key}`);
          break;
        }
      }
    }
   
   
   
    if (!token) {
      throw new Error('Token not found. Please login again.');
    }
 
    // Make API call
    const response = await axios.post(
      `${URL}/brand-images-pharmacy/add`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: token.trim(), // Trim whitespace
        }
      }
    );
   
    console.log('Upload successful:', response.data);
    setBrands(prev => [response.data.brand, ...prev]);
    return response.data;
   
  } catch (err) {
   
    const errorMsg = err.response?.data?.message ||
                     err.response?.data?.error ||
                     err.message ||
                     'Failed to create brand';
   
    setErrorBrand(errorMsg);
    throw new Error(errorMsg);
  } finally {
    setLoadingBrand(false);
  }
};
 
// UPDATE BRAND - FIXED
const updateBrand = async (id, formData) => {
  setLoadingBrand(true);
  setErrorBrand(null);
  try {
    const tokenS = JSON.parse(sessionStorage.getItem("admin"));
    const token = tokenS?.token;
   
    if (!token) {
      throw new Error('Token not found. Please login again.');
    }
 
    const response = await axios.put(
      `${URL}/brand-images-pharmacy/update/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: token.trim(),
        }
      }
    );
   
    setBrands(prev => prev.map(brand =>
      brand._id === id ? response.data.brand : brand
    ));
   
    return response.data;
  } catch (err) {
    const errorMsg = err.response?.data?.message ||
                     err.response?.data?.error ||
                     err.message ||
                     'Failed to update brand';
   
    setErrorBrand(errorMsg);
    throw new Error(errorMsg);
  } finally {
    setLoadingBrand(false);
  }
};
 
// DELETE BRAND - FIXED
const deleteBrand = async (id) => {
  setLoadingBrand(true);
  setErrorBrand(null);
  try {
    const tokenS = JSON.parse(sessionStorage.getItem("admin"));
    const token = tokenS?.token;
   
    if (!token) {
      throw new Error('Token not found. Please login again.');
    }
 
    await axios.delete(
      `${URL}/brand-images-pharmacy/delete/${id}`,
      {
        headers: {
          token: token.trim(),
        }
      }
    );
   
    setBrands(prev => prev.filter(brand => brand._id !== id));
   
    return { success: true, message: 'Brand deleted successfully' };
  } catch (err) {
    const errorMsg = err.response?.data?.message ||
                     err.response?.data?.error ||
                     err.message ||
                     'Failed to delete brand';
   
    setErrorBrand(errorMsg);
    throw new Error(errorMsg);
  } finally {
    setLoadingBrand(false);
  }
};
 
 
 /// user panel start
// ✅ USER CANCELLATION APIs

  // ✅ User Cancellation APIs को update करें
const checkCancellationCharge = async (orderId, orderType) => {
  try {
    setLoading(true);
    const userToken = getUserToken();
    if (!userToken) throw new Error("User token not found");

    const { data } = await axios.post(`${URL}/user-cancel-charge/check-cancellation-charge`, 
      { orderId, orderType },
      {
        headers: { 
          token: userToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (data?.success) {
      return data.data;
    } else {
      throw new Error(data?.message || "Failed to check cancellation charge");
    }
  } catch (error) {
    setError(error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};

const cancelOrderUser = async (orderId, orderType, cancellationReason) => {
  try {
    setLoading(true);
    const userToken = getUserToken();
    if (!userToken) throw new Error("User token not found");

    const { data } = await axios.post(`${URL}/user-cancel-charge/cancel-order`, 
      { orderId, orderType, cancellationReason },
      {
        headers: { 
          token: userToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (data?.success) {
      return data.data;
    } else {
      throw new Error(data?.message || "Failed to cancel order");
    }
  } catch (error) {
    setError(error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};
const submitRefundDetailsUser = async (orderId, orderType, mode, bankDetails) => {
  try {
    setLoading(true);
    const userToken = getUserToken();
    if (!userToken) throw new Error("User token not found");

    // The bankDetails structure depends on the mode ('bank' or 'upi')
    const payload = {
        orderId,
        orderType,
        mode,
        bankDetails
    };

    const { data } = await axios.post(`${URL}/user-cancel-charge/submit-refund-details`, 
      payload,
      {
        headers: { 
          token: userToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (data?.success) {
      return data; // Return the full response for the success message
    } else {
      throw new Error(data?.message || "Failed to submit refund details.");
    }
  } catch (error) {
    // Note: In the UI, we used 'alert(error.message)', so throwing the specific message is best.
    const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred.";
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  // 3. Get user's cancelled orders
  const getMyCancelledOrders = async (page = 1, limit = 10, orderType = null) => {
    try {
      setLoading(true);
      const userToken = getUserToken();
      if (!userToken) throw new Error("User token not found");

      const { data } = await axios.get(`${URL}/user-cancel-charge/my-cancelled-orders`, {
        headers: { token: userToken },
        params: { page, limit, orderType }
      });

      if (data?.success) {
        return {
          orders: data.data,
          summary: data.summary,
          pagination: data.pagination
        };
      } else {
        throw new Error(data?.message || "Failed to fetch cancelled orders");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
 
  const [distanceLimit, setDistanceLimit] = useState(null); 
  
  // ... purani states (doctor, userLocation etc.)

  // 2. API Fetch Function
  const getDistanceLimit = async () => {
    try {
      const tokenUser = getUserToken();
      const { data } = await axios.get(`${URL}/distance/getUser-distance-limit`, {
        headers: { 
                  token: tokenUser,  // ✅ use the string directly
        }
      });
      console.log("Distance Limit Response:", data); 

      if (data && data.success === 1) {
        setDistanceLimit(data.data); // Pura object store kar rahe hain (doctorLimit, foodLimit etc.)
        console.log("Distance Limit Fetched:", data.data);
      }
    } catch (error) {
      console.error("Error fetching distance limit:", error);
    }
  };

  useEffect(() => { 
    getDistanceLimit();
    // ... baaki calls like getDoctor()
  }, []);
 
// ============ Care Program ============
const [careProgramData, setCareProgramData] = useState(null);
const [careProgramDataUser, setCareProgramDataUser] = useState(null);
const [carePageLoading, setCarePageLoading] = useState(false);
const [carePageError, setCarePageError] = useState(null);
const [carePageLoadingUser, setCarePageLoadingUser] = useState(false);
const [carePageErrorUser, setCarePageErrorUser] = useState(null);
 
// 1. GET ALL DATA
// Context.js - Update the fetch functions
const fetchCareProgramData = async () => {
  setCarePageLoading(true);
  setCarePageError(null);
  try {
    // Token optional bana dein
    const headers = {};
    if (tokenS && tokenS.token) {
      headers.token = tokenS.token;
    }
   
    const response = await axios.get(`${URL}/care-program/get-all`, {
      headers,
    });
   
    console.log("API Response:", response.data);
   
    if (response.data.success) {
      setCareProgramData(response.data.data);
      return response.data.data;
    } else {
      // throw new Error(response.data.message || "Failed to fetch data");
    }
  } catch (error) {
    console.error("Error fetching care program data:", error);
    let errorMessage = "Error loading data";
   
    if (error.response) {
      errorMessage = `Server Error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = "No response from server.";
    } else {
      errorMessage = error.message;
    }
   
    setCarePageError(errorMessage);
    return null;
  } finally {
    setCarePageLoading(false);
  }
};
const fetchCareProgramDataUser = async () => {
  setCarePageLoadingUser(true);
  try {
    // Admin route se fetch kar rahe hain
    const { data } = await axios.get(`${URL}/care-program/get`);
    if (data.success) {
      setCareProgramDataUser(data.data);
    }
    console.log("Care Program Data User:", data.data);
  } catch (error) {
    console.error("Error fetching data User careProgram:", error);
    setCarePageErrorUser(error.message);
  } finally {
    setCarePageLoadingUser(false);
  }
};
 
// 2. MAIN UPDATE API (Text + Images)
const updateCareProgram = async (formData) => {
  setCarePageLoading(true);
  try {
    const { data } = await axios.put(`${URL}/care-program/admin/update`, formData, {
      headers: {
        token: tokenS.token,
        "Content-Type": "multipart/form-data", // Zaroori hai images ke liye
      },
    });
 
    if (data.success) {
      toast.success("Care Program Updated Successfully");
      setCareProgramData(data.data); // State update taki UI refresh ho
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error("Update Error:", error);
    toast.error("Failed to update content");
    setCarePageError(error.message);
  } finally {
    setCarePageLoading(false);
  }
};
 
// 3. ADD ITEMS (Feature, Doctor, Stat)
const addItemToSection = async (type, itemData) => {
  // type: 'feature', 'doctor', or 'stat'
  let endpoint = "";
  if (type === "feature") endpoint = "/care-program/admin/add-feature";
  if (type === "doctor") endpoint = "/care-program/admin/add-doctor";
  if (type === "stat") endpoint = "/care-program/admin/add-stat";
 
  try {
    const { data } = await axios.post(`${URL}${endpoint}`, itemData, {
      headers: { token: tokenS.token },
    });
 
    if (data.success) {
      toast.success(`${type} added successfully`);
      fetchCareProgramData(); // Refresh data
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Error adding item");
  }
};
 
// 4. DELETE ITEMS
const deleteItemFromSection = async (type, id) => {
  let endpoint = "";
  if (type === "feature") endpoint = `/care-program/admin/feature/${id}`;
  if (type === "doctor") endpoint = `/care-program/admin/doctor/${id}`;
  if (type === "stat") endpoint = `/care-program/admin/stat/${id}`;
 
  try {
    if(!window.confirm("Are you sure you want to delete this?")) return;
 
    const { data } = await axios.delete(`${URL}${endpoint}`, {
      headers: { token: tokenS.token },
    });
 
    if (data.success) {
      toast.success(`${type} deleted successfully`);
      fetchCareProgramData(); // Refresh data
    }
  } catch (error) {
    console.log(error);
    toast.error("Error deleting item");
  }
};
const updateIndividualItem = async (type, formData) => {
  const endpoint = `/care-program/admin/${type}/update`;
  try {
     const { data } = await axios.post(`${URL}${endpoint}`, formData, {
         headers:
         {
           token: tokenS.token,
            "Content-Type": "multipart/form-data"
          },
     });
     if(data.success) {
         toast.success("Updated");
         await fetchCareProgramData();
     }
  } catch (error) {
      toast.error("Update Failed");
  }
};
 
 
// 5. TOGGLE PUBLISH
const togglePublishStatus = async (status) => {
  try {
    const { data } = await axios.put(
      `${URL}/care-program/admin/toggle-publish`,
      { isPublished: status },
      { headers: { token: tokenS.token } }
    );
    if (data.success) {
      toast.success(status ? "Page Published" : "Page Unpublished");
      setCareProgramData((prev) => ({ ...prev, isPublished: status }));
    }
  } catch (error) {
    toast.error("Error changing status");
  }
};
 
 
// ================== End of Care Program ==============  
// ========== admin medicine products========
 
 
const [pendingProducts, setPendingProducts] = useState([]);
 
// 1. GET API: Fetch All Products
const getPendingMedicineProducts = async () => {
  try {
    console.log("Fetching products...");
    // Agar proxy set nahi hai to pura URL dalein
    const response = await axios.get(`${URL}/upload-excel-hospital/get-all-product`,
      {
        headers: {
          'Content-Type': 'application/json',
          token: tokenS.token,
        }  
      }
    );
   
    if (response.data.success === 1) {
      // Sirf wahi products filter karein jinka status abhi decision nahi hua (Optional)
      // Agar saare dikhane hain to filter hata dein.
      // Abhi ke liye API se jo 'details' aa rahi hain wo set kar rahe hain.
      setPendingProducts(response.data.details);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};
 
// 2. PUT API: Update Status (Approve = 0, Reject = 1)
const updateProductStatus = async (id, statusValue) => {
  try {
    const payload = {
      productId: id,
      onStatus: statusValue, // 0 for Approve, 1 for Reject
    };
 
    const response = await axios.put(`${URL}/upload-excel-hospital/update-product-status`, payload,
      {
        headers: {
          token: tokenS.token,
        }  
      }
    );
 
    if (response.data.success === 1) {
      alert(response.data.message);
     
      // UI se item hatane ke liye ya update karne ke liye refresh karein
      getPendingMedicineProducts();
    } else {
      alert("Failed to update status");
    }
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Something went wrong");
  }
};
// ================== End of admin medicine products ==============
 
 
 
 
 


  const valData = {
    dum,
    setDum,
    isFilled,
    setIsFilled,
    adminLogin,
    vendor,
    setVendor,
    getVendor,
    test,
    setTest,
    getVendortest,
    vendorLists,
    getAllVendorList,
    setLengthD,
    lengthD,
    searchVendor,
    searchData,
    setDoctor,
    doctor,
    getdoctorProfile,


  // === Clinic user ====
    clinic, getUserClinic,

    clinicRatings, ratingLoading, getClinicRatings, addClinicRating, editClinicRating, deleteClinicRating,
    vendorRatings,getVendorRatings,addVendorRating,editVendorRating,deleteVendorRating,
 brands, loadingBrand, errorBrand, getAllBrands, createBrand, updateBrand, deleteBrand,
  // User Cancellation APIs
    checkCancellationCharge,
    cancelOrderUser,
    submitRefundDetailsUser, 
    getMyCancelledOrders,
  distanceLimit,
    getDistanceLimit,

  brandsAdmin, loadingBrandAdmin, errorBrandAdmin, getAllBrandsAdmin,
 
    // ===== clinicDoctor =====
    clinicDoctor, getClinicDoctors1,
    createContactData ,updateContactData,fetchContactData,contactData,contactDataAdmin,fetchContactDataAdmin,
 
 

    //// lab user   
 // States
    vendor,
    packages,
    testsByOrgan,
    packageCollection,
    vendorTests,
    vendorPackages,
    prescribedTests,
    popularPackages,
    searchResults,
    selectedLabTests,
    currentLabTests,
    labTestHistory,
    userOrders,
    activeOrders,
    loading,
    organs,
    
    // Functions
    getVendor1,
    getVendorTests,
    getVendorPackages1,
    getAllPackages,
    getParticularLabTests,
    getPackageCollection,
    getPrescribedTests,
    getPopularPackages,
    searchTestsAndPackages,
    getSelectedLabTests,
    getCurrentLabTests,
    getLabTestHistory,
    getUserOrderHistory,
    getLabOrderDetails,
    getAllActiveOrders,
    applyCoupon1,
    bookAppointment,
    bookPackageAppointment,
    getAllOrgans,
     getVendorAvailability,
  getVendorStartEndDates,
  getVendorTimeSlots,

  footerContent, footerContentUser,   policies,  policiesUser,  getFooterContentUser  ,getFooterContent,    getPolicies,  getPoliciesUser,    createFooterContent,
    updateFooterContent,updatePolicies,
 

members,
    appointments,
    coupons3,
    availableSlots,
    getDoctor,
    getAllDoctor,
    createMember,
    getAllMemberOfPatients,
    addpatient,
    appointment1,
    appointment,
    getAllUserAppointments,
    applyCoupon,
    getCoupon,
    getAvailabiltyOfVendorAndTimeInUser,

      getMembershipPlans,
    // getMembershipPlanById,
    purchaseMembership,
    getActiveMembership,
    getMembershipHistory,
    checkMembershipForAppointment,
    calculateDiscountedPrice,
    getMembershipBenefits,

    // Membership states
    membershipPlans,
    activeMembership,
    membershipHistory,
    membershipLoading,

    pDoctor,
    testFF,
    getVendorCoupon,
    setCoupon,
    coupon,
    searchVendorTest,
    setSearchTest,
    searchTest,
    getVendorPackages,
    packages,
    documents,
    vendorDocuments,
    approveVendorDocumentField,
    rejectVendorDocumentField,
    blog,
    adminBlog,
    blogLength,
    searchBlog,
    blogSearch,
    addBlog,
    addSubheading,
    partBlog,
    particularBlog,
    updateSub,
    addSubheadingUpdate,
    deleteSub,
    mainform,
    vendorStatus,
    vendorstats,
    getPharmacist,
    pharmacy,
    pharmacyLength,
    getAdmin,
    admin,
    updateAdmin,
    changePassword,
    getallusers,
    userLength,
    users,
    getinactiveUser,
    inactiveUser,
    inactivelength,
    userS,
    userList,
    deletemainform,
    getfirstuser,
    firstuser,
    error,
    doctorStats,
     fetchDoctorStats,
      loading,
      fetchuserstats ,
      userstats,
      labstats ,
      fetchlabstats,
      pharmacystats,
     fetchpharmacystats,
     isDisableUser,
     setIsDisable,
     getinactivelabs,
inactivelabs,
inactivelengths,
fetchinactivepharmacy ,
inActivePharmacy ,
setinActivePharmacy,


  foodVendors,
    foodVendorLength,
    getAllFoodVendors,
    toggleFoodVendorStatus,
    getInactiveFoodVendors,
    inactiveFoodVendors,
    inactiveFoodLength,
    searchFoodVendors,

    fetchfoodstats,
    foodstats,

    addFoodCategory, // add food category function
    message, // add food category message

     // add food category state
    categories, // food categories state
    setCategories, // food categories setter
    calculateFoodDeliveryCharges,
    getFoodCategory, // function to fetch food categories
    foodCategory,
    yourmind,
     Mealcategory,
     Discount,
      getdiscountfood, 
      kitchen,
      getTopKitchen,
      getKitchenByCategory,
      particularFoodItems,
      getParticularKitchenFood,
      searchFood1,
      getFoodMenu,
      // blog user
      searchTerm,
    blogs,
    getBlogs,
    selectedTab,
    TAB_TYPES,
    filterBlogsByType,
    searchBlogs,
    resetToAllBlogs,
    setSearchTerm,

      getDoctors,
      getDoctor,
      clearLocation,
      userLocation,
      setUserLocation,
      setManualLocation,getUserLocation,
      getDoctorCoupon,
      doctorCoupon,
      DoctorDocument,
      setLoading,
      getDoctorDocuments,
      getApproveDoctorAccount,
      getRejectDoctorAccount,
      approveDoctorDocument,
     rejectDoctorDocument,
     approveAllDocuments,
     rejectAllDocuments,
     Medicines,
     getMedicines,
     updateMedicine,
     deleteMedicineAdmin,
     deleteMultipleMedicinesAdmin,
     getPendingMedicines,
     pendingMedicines,
     approveMedicine,
     rejectMedicine,

    specialists,
    setSpecialists,
    createSpecialist,
    addCategory,
    addMeal,
    addMealWithoutImage,
    processRefundAdmin,

      mealItems, mealLoading, mealError, getMealDetails,mealMeta,
        cravingMealDetails,
  getCravingMealByFoodName,

  addExtraItemsToCraving,
  addToCartCraving,
  updateCartQuantity,
  getCartData,
  cartData1, getCartData1,

  removeCartItem,
  decreaseCartItem,
  getAvailableSlots,
  fetchAddresses,
  addNewAddress,
  updateAddress,
  deleteAddress,

  coupons,
  couponLoading,
  couponError,
  getCoupons,

  bookOrder,
  getOrder,
  getOrderById,
  orderLoading,
  orderError,
  addInsuranceType,
     // Add the new food vendor order functions
  getFoodOrdersForVendor,
  getBulkFoodOrdersForVendor,
  updateFoodOrderStatus,
  getVendorOrdersByStatus,
  getVendorOrderHistory,
  getVendorAcceptedOrders,
  assignDriverToOrder,
  getOrderWithDriverDetails,
  getOnlineDriversForVendor,
  getDriverOrderHistory,
      setError,
    getFood,
    getMeals,
    createCategory,
    getCategory,
  getFoodVendorsLists,
  getInactiveFoodVendors1,
  getFoodVendorStats,
  addMeal1,
    createFood,
    getmealvendor,
    editFood,
    updateFoodStatus,
    getRemovedData,
    searchFood,
    getFoodCategories,
    getFoodSubcategories,








   availabilities,
        createAvailability,
        getVendorAvailabilities,
        getAvailabilityByDateRange,
        deleteAvailability,

        selectedServices, setSelectedServices,

        isUploading,
        uploadMedicineExcel,
        uploadProductExcel,
        updateMedicineProduct,
        products,
        fetchAllProducts,
        isDeleting, // <-- Expose deleting state
        deleteMedicine, // <-- Expose new function
        deleteMultipleMedicines, // <-- Expose new function
        deleteProduct,
        deleteMultipleProducts,







 // State
  products1,
  medicines1,
  popularProducts1,
  popularMedicines1,
  cartItems1,
  pharmacyShops,
  hasMorePharmacies,
  loading,
  error,
  
  // Functions
  fetchProducts,
  fetchMedicines,
  fetchPopularProducts,
  fetchPopularMedicines,
  fetchPharmacyShops,
  fetchCartItems,
  fetchVendorsByProduct,
  fetchVendorsByMedicine,
  updateCartQuantity1,
  removeCartItem1,
  addToCart,
  checkout,
  confirmOrder,
  fetchOrderHistory,
  trackOrder,
  fetchVendorProducts,
  fetchVendorMedicines,

  fetchVendorAvailability,
  getUserToken,
  getUserId,

  //// admin panel 
  // Admin Cancellation APIs
    getCancellationSettings,
    updateCancellationSettings,
    calculateCancellationCharge,
    cancelOrderAdmin,
    getCancelledOrdersAdmin,

   // filter states
      filters,
      availableLocations,
      loadingFilters,
 // new filter functions
      updateFilters,
      refreshAllDataWithFilters,
      fetchLocationData,



       globalFilters,
    updateGlobalFilters,
    refreshAllData,
    clearGlobalFilters,
      
       createMembershipPlan,
    getAdminMembershipPlans,
    getMembershipPlanById,
    updateMembershipPlan,
    toggleMembershipPlanStatus,
    getActiveMembershipPlans,
    getPlanDiscountMatrix,
    updateDiscountMatrix,
    calculateDiscountPreview,



// admin about us
aboutUsData,
     getAboutUs,
    getAdminAboutUs,
    updateAboutUs,
    uploadImage,

    // admin science page
    sciencePage,
     getSciencePageContent,
     addSciencePageItem,
     removeSciencePageItem,
    updateSciencePageContent,
    uploadScienceImages,

    banners,
    fetchAllBanners,
    fetchBannersByType,

    updateBanners,
    removeBannerImage,

        // admin panel pharmacy delivery charges
                deliveryCharges,
        loadingCharges,
        chargesError,
        fetchDeliveryCharges,
        updateDeliveryCharges,

        /// food delivery charges
        foodDeliveryCharges,
        fetchFoodDeliveryCharges,
        updateFoodDeliveryCharges,
        fetchUserFoodDeliveryCharges,
        labDeliveryCharges,
        fetchLabDeliveryCharges,
        updateLabDeliveryCharges,
        calculateLabDeliveryCharges,
        fetchUserLabDeliveryCharges,


        loadingCharges,

        

        subAdmins,
    currentSubAdmin,
    totalPages,
    currentPage,
    totalCount,
    
    // Actions
    createSubAdmin,
    getAllSubAdmins,
    getSubAdminById,
    updateSubAdminPermissions,
    updateSubAdminStatus,
    deleteSubAdmin,
    clearCurrentSubAdmin,


    /////////////////////// sub admin panel /////////////////
    loginSubAdmin,
    getSubAdminDashboardStats,
    getSubAdminRecentRegistrations,
    getSubAdminVerificationRequests,
    getSubAdminProfile,
    updateSubAdminProfile,
    changeSubAdminPassword,
    getSubAdminActivities,
    getSubAdminMonthlyStats,
    
    subAdminClinic, 
    setSubAdminClinic,
    subAdminClinicDocuments, 
    setSubAdminClinicDocuments,
    subAdminDocumentsLoading, 
    subAdminDocumentsError,
    
    getSubAdminClinic,
    approveSubAdminClinic,
    rejectSubAdminClinic,
    getSubAdminClinicDocument,
    approveSubAdminDocumentField,
    rejectSubAdminDocumentField,
    addInsuranceTypeSubadmin,
    subAdminSpecialists, 
    setSubAdminSpecialists,
    getSubAdminSpecialists,
  createSubAdminSpecialist,
  updateSubAdminSpecialist,
  deleteSubAdminSpecialist,
  getSubAdminSpecialistStats,

  // States
    doctors,
    doctorsLoading,
    doctorsError,
    doctorDetails,
    doctorDetailsLoading,
    doctorDetailsError,
    doctorStats,
    doctorStatsLoading,
    doctorStatsError,
    doctorDocuments,
    doctorDocumentsLoading,
    doctorDocumentsError,

    // Functions
    getDoctorsSubadmin,
    getDoctorById,
    updateDoctorVerification,
    deleteDoctor,
    getDoctorStats,
    getMonthlyDoctorStats,
    getDoctorDocumentsSubadmin,
    approveDocumentFieldSubadmin,
    rejectDocumentFieldSubadmin,
    verifyDoctorAccount,
    rejectDoctorAccount,   
    // User Management States
      users,
      usersLoading,
      usersError,
      userStats,
      recentUsers,

      // User Management Functions
      getUsersSubadmin,
      getActiveUsersSubadmin,
      getInactiveUsersSubadmin,
      getRecentUsersSubadmin,
      getUserStatsSubadmin,
      getUserByIdSubadmin,
      updateUserStatusSubadmin,
      deleteUserSubadmin,

       // State
    foodVendors,
    foodVendorsLoading,
    foodVendorsError,
    foodVendorDetail,
    foodVendorDetailLoading,
    foodVendorDetailError,
    foodStats,
    foodStatsLoading,
    foodStatsError,
    foodCategories,
    foodCategoriesLoading,
    foodCategoriesError,
    meals,
    mealsLoading,
    mealsError,

    // Functions
    getFoodVendors,
    getFoodVendorById,
    getFoodVendorsStats,
    createFoodCategory,
    getFoodCategoriesSubadmin,
    getFoodVendorsListsSubadmin,
    getInactiveFoodVendorsSubadmin,
    getFoodVendorsStatus,
    addMealSubadmin,
    getMealsSubadmin,
    updateFoodVendorStatus,

fetchFoodDeliveryChargesSub,
updateFoodDeliveryChargesSub,
    getFoodDeliveryChargesHistory,
    clearChargesError,
    
    // User Info and Permissions
    getCurrentUserInfo,
    userPermissions,
    


    clearFoodVendorsError,
    clearFoodVendorDetail,
    clearFoodStatsError,
    clearFoodCategoriesError,
    clearMealsError,

    // State
    labVendors,
    labVendorsLoading,
    labVendorsError,
    labVendorStats,
    labVendorStatsLoading,
    labVendorStatsError,
    currentLabVendor,
    labVendorLoading,
    labVendorError,

    // Actions
    getLabVendorsSubadmin,
    getLabVendorsStatsSubadmin,
    getLabVendorByIdSubadmin,
    searchVendorTestSubadmin,
    updateLabVendorStatusSubadmin,
    getInactiveLabsSubadmin,
    clearLabVendorErrors,
    clearCurrentLabVendor,
    refreshLabVendors,
     // Test State
    tests,
    testsLoading,
    testsError,
    testStats,
    testStatsLoading,
    testStatsError,
    currentTest,
    testLoading,
    testError,

    // Test Actions
    createTestSubadmin,
    getTestsSubadmin,
    getTestByIdSubadmin,
    updateTestSubadmin,
    deleteTestSubadmin,
    getTestStatsSubadmin,
    clearTestErrors,
    clearCurrentTest,

    // ✅ SUBADMIN PHARMACY MANAGEMENT STATE
  vendorsSub,
  vendorsLoadingSub,
  vendorsErrorSub,
  productsSub,
  productsLoadingSub,
  productsErrorSub,
  medicinesSub,
  medicinesLoadingSub,
  medicinesErrorSub,
  deliveryChargesSub,
  deliveryChargesLoadingSub,
  deliveryChargesErrorSub,
  paginationSub,
  statsSub,

  // ✅ SUBADMIN VENDOR MANAGEMENT FUNCTIONS
  getPharmacyVendorsSubadmin,
  getPharmacyVendorByIdSubadmin,
  getPharmacyVendorsStatsSubadmin,
  getAllVendorsListsSubadmin,
  getPharmacyStatsSubadmin,
  getInactivePharmaciesSubadmin,
  updateVendorStatusSubadmin,

  // ✅ SUBADMIN PRODUCT MANAGEMENT FUNCTIONS
  uploadProductExcelSubadmin,
  getAllProductsSubadmin,
  updateProductSubadmin,
  deleteProductSubadmin,
  deleteMultipleProductsSubadmin,

  // ✅ SUBADMIN MEDICINE MANAGEMENT FUNCTIONS
  uploadMedicineExcelSubadmin,
  getAllMedicinesSubadmin,
  updateMedicineSubadmin,
  pendingMedicinesSub,
  getPendingMedicinesSubadmin,
  approveMedicineSubadmin,
  rejectMedicineSubadmin,
  deleteMedicineSubadmin,
  deleteMultipleMedicinesSubadmin,

  // ✅ SUBADMIN DELIVERY CHARGES FUNCTIONS
  getDeliveryChargesSubadmin,
  updateDeliveryChargesSubadmin,
  getDeliveryChargesHistorySubadmin,

  // ✅ SUBADMIN UTILITY FUNCTIONS
  clearErrorsSubadmin,

  // about us subadmin
    subAdminAboutUsData,
    getSubAdminAboutUs,
    updateSubAdminAboutUs,
    uploadSubAdminAboutUsImage,

    getSubAdminSciencePage,
    updateSubAdminSciencePage,
    addSubAdminSciencePageItem,
    removeSubAdminSciencePageItem,
    uploadSubAdminScienceImages,

    // blogs sub admin 
    subAdminBlogs,
  subAdminBlogDetails,
  subAdminSubheadings,

  getSubAdminBlogs,
  searchSubAdminBlogs,
  createSubAdminBlog,
  getSubAdminBlogDetails,
  deleteSubAdminBlog,
  updateSubAdminBlog,
  createSubAdminSubheading,
  getSubAdminSubheadingList,
  updateSubAdminSubheading,
  deleteSubAdminSubheading,
  fetchLabDeliveryChargesSub,
  updateLabDeliveryChargesSub,



        //////////////////////////// pharmacy vendor panel
        products2,
        fetchProducts2,
        updateProductStock,
        vendorProducts,
        fetchVendorProducts2,
          vendorTotalPages,     // (Zaroori hai VendorProductsList pagination ke liye)
    vendorTotalCount, 

        medicines2,
        fetchMedicines2,
        updateMedicineStock,
        fetchVendorMedicines2,
        vendorMedicines,
        medicines3,
        setMedicines3,


        pendingOrders,
        fetchPendingOrders,
        acceptOrder,
        rejectOrder,
        acceptedOrders,
        fetchAcceptedOrders,
        availableDrivers,
        fetchAvailableDrivers,
        assignDriverToOrder2,
        
        activeOrders,
        fetchActiveOrders,
        orderHistory2,
        fetchOrderHistory2,
        fetchOrderWithDriver,
        getPharmacyToken,
        getPharmacyVendorId,
        loading2,
        error2,
        addMedicine,
        addHospitalProduct,
        hospitalProducts,


        availabilities2,
        createAvailability2,
        getVendorAvailabilities2,
        getAvailabilityByDateRange2,
        deleteAvailability2,

        ///////////// pharmacy vendor shop timings
    shopTimings,
    currentShopStatus,
    loadingTimings,
    errorTimings,
    getShopTimings,
    addOrUpdateShopTiming,
    bulkUpdateShopTimings,
    deleteShopTiming,
    getCurrentShopStatus,
    loadingAction,
    errorAction,

    createCoupon, getCouponsByVendor, getCouponsByStatus,deleteCoupon,
    coupon1, setCoupon1,getAllVendorToken,
    drivers,createDriver,getDrivers,updateDriver,deleteDriver,

    vendorProfile,
            getVendorProfile,
            updateVendorProfile,
            changePassword2,
             vendorDocumentDetails,
    documentLoading,
    documentError,
    fetchVendorDocuments,
    updateVendorDocument,

            /////// doctor panel ////////
            getDoctorToken,
                registerDoctor,
    loginDoctor,
    otpSentToDcotor,
    otpSentToPhone,
    verifyEmailOtp,
    verifyPhoneOtp,
    otpForForget,
    verifyForgotOtp,
    resetPassword,
    changePassword1,
    logoutDoctor,

    // Profile
    getDoctorProfile,
    updateDoctorProfile,
    getUsersWhoMessagedDoctor,
            updateDoctorDocuments, // Add the new function

    // --- Appointment Functions ---
      getDoctorAppointments,
      acceptOrRejectAppointment,
      postponeAppointment,
      getPaymentStatus,
      markPaymentDone,
      addPrescribe,
      fetchMedicineData,
    createFinalPrescription,
    getExistingPrescription,

      coupons1,
       createCoupon1,
    getCoupons1,
    getCouponsByStatus1,
    updateCouponStatus1,
    deleteCoupon1,
    editCoupon1,
    expireCoupon1,

     // Availability Functions
     availability1,
    createAvailability1,
    getAllStartAndEndDate1,
    deleteAvailability1, // Renamed to match component usage
    timeSlots, // Expose timeSlots state
    formatDateForDisplay, // Expose display formatter
// consultation fees --------
    fees,
    createFees,
    getFees,
    updateFees,
    deleteFees,
    clearError,

     prescriptions,
  medicines4,
  insuranceList,
  selectedPrescription,
  getMedicineData,
  createDoctorPrescription,
  getAllPrescriptions,
  postponeAppointment1,
  getInsuranceList,
  downloadPrescription,

  privacyPolicy,
  privacyLoading,
  createPrivacyPolicy,
  getPrivacyPolicy,
  updatePrivacyPolicy,
  getSpecialists,
  specialists1,
  specialistsLoading,
  getSpecialists,


    ratings,
  ratingsLoading,
  getDoctorRating,
  getRatingFeedback,
  getAllRatingData,

   qualifications,
  qualificationsLoading,
  getQualifications,
  sendCallNotification,
    endCall,
    sendChatNotification,

    // State
    doctorData,

// clinic panel
clinicData,
clinicDoctors,
clinicAchievements,
clinicSpecialists,
getClinicToken,
loginClinic,
registerClinic,
getClinicProfile,
updateClinicProfile,
logout,

getClinicDoctors,
      editClinicDoctor,
      addDoctor,
      deleteClinicDoctor,
      uploadClinicAchievements,
      getClinicAchievements,
      deleteClinicAchievements,
      addClinicServices,
      getClinicSpecialists,
      removeClinicSpecialist,
      getAllSpecialists,
        allSpecialists, // Add this
      updateClinicTimings,
      changeClinicPassword,
      getClinicDocuments,
      updateClinicDocuments,

      getAllClinicAppointments,
    acceptOrRejectAppointmentClinic,
    reassignDoctor,
    getClinicOrderHistory,
    getClinicRating,
    getRatingFeedbackClinic,
  getAdminClinic,
  fetchclinicstats,
  clinicStats,
  adminClinic,
    rejectClinic,approveClinic,
    getClinicDocument,clinicDocuments,documentsLoading,documentsError,
    approveDocumentField,
    rejectDocumentField,
 createTest,createStatus,
   brandsSub,  loadingSub,errorSub,
    getAllBrandsSub,
    createBrandSub,
    updateBrandSub,
    deleteBrandSub,
     getPolicy,createPolicy,updatePolicy,getContent,createContent,updateContent,loadingFooter,errorFooter,footerData,policyData,
 getContact,
 addContact,
 updateContact,
 loadingContact,
 errorContact,
 contactDataSub,
 setContactDataSub,
 updateVideo,
 getVideos,
 loadingVideo,
 errorVideo,
 videos,
  getOrderHistory,
    refreshCurrentPage,
    loadingAppointments,
    errorAppointments,
    appointmentsData,
    currentPageAppointment,
    totalPagesAppointment,
    setCurrentPage,
      addYoutubeLink,
  getYoutubeLinks,
  updateYoutubeLink,
  deleteYoutubeLink,
  youtubeLoading,
  youtubeError,
  youtubeLinks,
  distanceLimits,distanceLoading,distanceError,notification,getDistanceLimits,updateDistanceLimits,showNotification,hideNotification,      distanceLimitSub,  errorDistanceSub,loadingDistanceSub,fetchDistanceLimitSub,updateDistanceLimitSub,
      getCancellationSettingsSub,
    updateCancellationSettingsSub,
    
    // SubAdmin Cancellation States
    loadingCancellationSettingsSub,
    errorCancellationSettingsSub,
    loadingUpdateSettingsSub,
    errorUpdateSettingsSub,
      // Bank Logos states (Updated)
  banksLogos, // Array of logos
  bankLogosLoading,
  bankLogosError,
  bankLogosMessage,
 
  // Bank Logos functions (Updated)
  getBanksLogos,
  getBanksLogosPublic,
  createBanksLogos,
  updateBankLogo,
  updateBankLogoImage,
  deleteBankLogo,
  deleteAllBanksLogos,
  reorderBanksLogos,
  clearBankLogosError,
 
  bankLogosLoading,bankLogosError,bankLogosMessage,reorderBanksLogo,deleteAllBanksLogo,deleteBanksLogo,updateBanksLogoImage,updateBanksLogo,createBanksLogo,getBanksLogo,clearBanksLogoError,
   // Membership Functions
  getSubMembershipPlans,
  createSubMembershipPlan,
  getSubMembershipPlanById,
  updateSubMembershipPlan,
  toggleSubMembershipPlanStatus,
  getSubActiveMembershipPlans,
  calculateSubDiscountPreview,
  getSubPlanDiscountMatrix,
  updateSubDiscountMatrix,
 
  // Common functions
  clearError,
  setLoading,
  setError,
  // Sub-Admin Care Program States
     careProgramDataSub,
     carePageLoadingSub,
     carePageErrorSub,
     
     // Sub-Admin Care Program Functions
     fetchCareProgramDataSub,
     updateCareProgramSub,
     addItemToSectionSub,
     deleteItemFromSectionSub,
     updateIndividualItemSub,
     togglePublishStatusSub,
     updateSectionSub,
     uploadImageSub,
     getItemByIdSub,
     reorderItemsSub,
     clearCareProgramErrorSub,
   // ============================ Care Program ============================
    careProgramData,
    carePageLoading,
    carePageError,
    fetchCareProgramData,
    updateCareProgram,
    addItemToSection,
    deleteItemFromSection,
    updateIndividualItem,
    togglePublishStatus,
    carePageLoadingUser,
    carePageErrorUser,
    careProgramDataUser,
    fetchCareProgramDataUser,
      updateProductStatus,
    pendingProducts,
    getPendingMedicineProducts,
    pendingProductsSub,
    getPendingMedicineProductsSub,
    updateProductStatusSub,
    deleteAppointment ,
 
 
    
 
  };

  return (
    <>
      <MyContext.Provider value={valData}>{children}</MyContext.Provider>
    </>
  );
};

export default Context;
