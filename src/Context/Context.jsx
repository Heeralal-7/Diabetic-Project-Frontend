//Contex.jsx
import React, { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
    return localStorage.getItem("token");  // ✅ Correct key
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
// const getAvailableSlots = async (data) => {
//   try {
//     const token = localStorage.getItem('token');
//     if (!token) throw new Error('No authentication token found');

//     const response = await axios.post(
//       `${process.env.REACT_APP_API_URL}/food-Order/avail`,
//       data,
//       { 
//         headers: { 
//           token,
//           'Content-Type': 'application/json' // Add content type
//         } 
//       }
//     );
    
//     console.log("Slots API Response:", response.data); // Debug log
    
//     if (response.data.success === 1) { // Changed from just 'success' to 'success === 1'
//       return response.data.data;
//     }
//     throw new Error(response.data.message || 'Failed to fetch slots');
//   } catch (error) {
//     console.error("Error fetching available slots:", error);
//     throw error;
//   }
// };

// In your Context.js file
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
console.log('Context functions:', {
fetchAddresses: !!fetchAddresses,
addNewAddress: !!addNewAddress,
updateAddress: !!updateAddress,
deleteAddress: !!deleteAddress
});
    const response = await axios.post(
      
      `${process.env.REACT_APP_API_URL}/patient/new`,
      addressData,
      { 
        headers: { 
          token,
          'Content-Type': 'application/json'
        } 
      }
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

    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/patient/update/${addressId}`,
      addressData,
      { 
        headers: { 
          token,
          'Content-Type': 'application/json'
        } 
      }
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

    console.log("Requesting slots with:", data); // Debug log
    
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/food-Order/avail`,
      data,
      { headers: { token } }
    );

    console.log("Slots API Response:", response.data); // Debug log

    if (response.data.success === 1) {
      return response.data.data; // Return the data property from response
    }
    throw new Error(response.data.message || 'Failed to fetch slots');
  } catch (error) {
    console.error("Error fetching slots:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
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

const getTopKitchen = async () => {
  try {
    const userToken = getUserToken();
    const { data } = await axios.get(`${URL}/topKitchen/kitchen`, {
      headers: {
        token: userToken,
      },
    });

    console.log("Top kitchen API response", data);

    if (data?.success === 1 && Array.isArray(data.vendors)) {
      setKitchen(data.vendors);  // ✅ Set correct key
    } else {
      console.log("No kitchen data found.");
    }
  } catch (error) {
    console.error("Error fetching top kitchen:", error);
  }
};



  



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
  const getAdmin = async () => {
    try {
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
  };

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

  //  this api gets the doctor details like how many doctors are there
  const getDoctors = async () => {
    console.log("Starting getDoctors...");
    if (!tokenS?.token) {
      console.error("Token not found!");
      setDoctor([]);
      return;
    }

    try {
      const { data } = await axios.get(`${URL}/doctorAccess/getDoctors`, {
        headers: { token: tokenS.token },
      });

      console.log("getDoctors API response:", data);

      if (data.success === 1) {
        setDoctor(data.data); // data.data is an array
        console.log("Doctors set:", data.data);
      } else {
        setDoctor([]);
        console.warn("No doctors found or API success=0");
      }
    } catch (error) {
      console.error("getDoctors error:", error.message);
      setDoctor([]);
    }
  };

  const getDoctor = async () => {
    try {
      const { data } = await axios.get(`${URL}/doctor/get`);
      setDoctor(data.details);
    } catch (error) {
      console.log(error.message);
    }
  };
  const getdoctorProfile = async (id) => {
    try {
      const { data } = await axios.get(`${URL}/doctor/website/${id}`);
      setPDoctor(data.details);
    } catch (error) {
      console.log(error.message);
    }
  };

  const getAllVendorList = async (page, LIMIT) => {
    try {
      const { data } = await axios.get(
        `${URL}/admin-vendor-all?page=${page}&limit=${LIMIT}`,
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
    const { data } = await axios.get(
      `${URL}/admin-vendor-all/search-test?q=${q}`,
      {
        headers: {
          token: tokenS.token,
        },
      }
    );
    if (data.success === 1) {
      setSearchTest(data.details);
    } else {
      toast.error("Something went wrong");
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
      `${URL}/vendor-document/vendordoc?id=${id}`,
      {
        headers: {
          token: tokenS.token,
        },
      }
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
    const token = tokenS?.token;
    
    if (!token) {
      toast.error("Authentication token not found");
      throw new Error("Authentication token not found");
    }

    const response = await axios.patch(
      `${URL}/vendor-document/approveVendorDocumentField/${documentId}`,
      { field },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'token': token
        }
      }
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
    const token = tokenS?.token;
    
    if (!token) {
      toast.error("Authentication token not found");
      throw new Error("Authentication token not found");
    }

    const response = await axios.patch(
      `${URL}/vendor-document/rejectVendorDocumentField/${documentId}`,
      { field, rejectReason },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'token': token
        }
      }
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

  const getAllFoodVendors = async (page = 1, limit = 10) => {
    try {
      const { data } = await axios.get(
        `${URL}/admin-food/FoodVendors?page=${page}&limit=${limit}`,
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
      console.error("Error fetching food vendors", error);
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
  const getPharmacist = async (page, limit) => {
    try {
      const { data } = await axios.get(
        `${URL}/admin-pharmacy-all/vendors?page=${page}&limit=${limit}`,
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

useEffect(()=>{
  fetchinactivepharmacy(1,10)
},[])


  //get all user list
  const [userList, setUserList] = useState([]);
  const userS = async () => {
    try {
      const { data } = await axios.get(`${URL}/admin-user/all`, {
        headers: {
          token: tokenS.token,
        },
      });
      if (data.success === 1) {
        setUserList(data.details);
      }
    } catch (error) {
      console.log(error);
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
  const fetchDoctorStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${URL}/qualification/getDoctorStats`); // Replace with your API endpoint
      if (response.data.success) {
        setDoctorStats(response.data.details);
      } else {
        setError(response.data.message || "Failed to fetch doctor stats");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // fetch user stats   fetchuserstats userstats  send to dashboard
const [userstats, setuserstats] = useState([]);

const fetchuserstats = async()=>{
setLoading(true);
setError(null);
try {
  const response = await axios.get(`${URL}/admin-user/allusersdata`,{
    headers :{
      token :tokenS.token,
    }
  });
  if(response.data.success){
    setuserstats(response.data.details);
  } else{
    setError(response.data.message || "failed to  fetch user stats");
  }
} catch (error) {
  setError(err.message || "An error occurred");
} finally{
  setLoading(false);
}
};
// fetch vendor-lab 
// get data of labs last 12 months  labstats fetchlabstats
const [labstats,setlabstats] = useState([]);
const fetchlabstats = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await axios.get(`${URL}/admin-vendor-all/getlabstats`, {
      headers: {
        token: tokenS.token, // Ensure tokenS.token is valid
      },
    });

    if (response.data.success) {
      setlabstats(response.data.data); // Correctly set `data`
    } else {
      setError(response.data.message || "Failed to fetch lab stats");
    }
  } catch (error) {
    setError(error.message || "An error occurred");
  } finally {
    setLoading(false);
  }
};

// fetch vendor-pharmacystats
//get data of 12 month 
// export = pharmacystats fetchpharmacystats
const [pharmacystats, setpharmacystats] = useState([]);
const fetchpharmacystats = async()=>{
  setLoading(true)
  setError(null);
  try {
    const response  = await axios.get(`${URL}/admin-pharmacy-all/getpharmacystats`,{
      headers:{
        token: tokenS.token
      }
    })
    if(response.data.success){
        setpharmacystats(response.data.details)
    } else{
      setError(response.data.message || "error in api ")
    }
  } catch (error) {
    setError(error.message || "an error ")
  } finally{
    setLoading(false)

  }
}

// Fetch food vendor stats - get data for last 12 months
const fetchfoodstats = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get(`${URL}/admin-food/getfoodstatus`, {
      headers: { token: tokenS.token }
    });
    setFoodstats(response.data.data || []); // Changed from .details to .data
  } catch (err) {
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

  if (!tokenS?.token) {
    console.error("Token not found for coupons!");
    toast.error("Authentication required");
    return [];
  }

  try {
    const { data } = await axios.get(
      `${URL}/doctorAccess/getCouponsByDoctorId?id=${id}`,
      {
        headers: { token: tokenS.token },
      }
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
    
    const response = await axios.patch(
      `${URL}/doctorAccess/verifyDoctorAccount?id=${id}`,
      {
        doctorId: id,
      },
      {
        headers: {
             token: tokenS.token
          },
      }
    );
    
    console.log("approve api check");
    console.log("API Response:", response.data);
    setApproveDoctorAccount(response.data);
    
    // Show success toast
    toast.success(response.data.message || "Doctor account approved successfully.");
    
    // Return the response data with success flag
    return {
      success: true,
      message: response.data.message || "Doctor account approved successfully.",
      data: response.data
    };
  } catch (error) {
    console.error("Error verifying doctor account:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to verify doctor account.";
    
    // Show error toast
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
////// Approve Doctor End //////

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

    const response = await axios.patch(
      `${URL}/doctorAccess/rejectDoctorAccount`,
      { rejectReason: trimmedReason },
      {
         headers: {
             token: tokenS.token
          },
        params: { id },
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
////// Reject Doctor End /////


  ////// Reject Doctor Document End /////

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
/////// Medicines End  ///////

// ******** Update Medicines *******
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
  // ******** Update Medicines End *******

  // ******** Create Specialist Doctor *******
    const [specialists, setSpecialists] = useState('');

    const createSpecialist = async (specialistData) => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${URL}/specialists/create`,
                {
                    specialists: specialistData.name, // Send the name as specialists
                },
                {
                    headers: { token: tokenS.token },
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
 
 
















////////////////////////////// vendor panel food //////////////////////////////////////////////////////////
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
    setLoading(true);
    setError(null);
    
    const foodToken = sessionStorage.getItem('foodtoken');
    if (!foodToken) throw new Error('Vendor not authenticated');

    const tokenData = JSON.parse(foodToken);
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
    setError(error.message);
    return { success: 0, message: error.message };
  } finally {
    setLoading(false);
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
      setLoading(true);
      setError(null);
      
      const token = getVendorToken();
      const response = await axios.get(`${URL}/vendor-order/get-order`, {
        params: { status, page, limit },
        headers: { token }
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
      setError(error.message);
      return {
        success: 0,
        message: error.message
      };
    } finally {
      setLoading(false);
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

    console.log("Vendor order history response:", response.data);

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






  //  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);

  // Get vendor token
  // const getVendorToken = () => {
  //   const tokenData = sessionStorage.getItem('foodtoken');
  //   if (!tokenData) {
  //     throw new Error('Vendor not authenticated - please login again');
  //   }
    
  //   try {
  //     const parsedToken = JSON.parse(tokenData);
  //     if (!parsedToken.token) {
  //       throw new Error('Invalid token format');
  //     }
  //     return parsedToken.token;
  //   } catch (error) {
  //     console.error('Error parsing token:', error);
  //     throw new Error('Invalid token data');
  //   }
  // };

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
    getFoodCategory, // function to fetch food categories
    foodCategory,
    yourmind,
     Mealcategory,
     Discount,
      getdiscountfood, 
      kitchen,
      getTopKitchen,
      getDoctors,
      getDoctor,
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
    specialists,
    setSpecialists,
    createSpecialist,
    addCategory,
    addMeal,
    addMealWithoutImage,

      mealItems, mealLoading, mealError, getMealDetails,mealMeta,
        cravingMealDetails,
  getCravingMealByFoodName,

  addExtraItemsToCraving,
  addToCartCraving,
  updateCartQuantity,
  getCartData,

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


   availabilities,
        createAvailability,
        getVendorAvailabilities,
        getAvailabilityByDateRange,
        deleteAvailability,

        selectedServices, setSelectedServices,

        isUploading,
        uploadMedicineExcel,
        products,
        fetchAllProducts,
  };

  return (
    <>
      <MyContext.Provider value={valData}>{children}</MyContext.Provider>
    </>
  );
};

export default Context;
