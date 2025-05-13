import React, { createContext, useEffect, useState } from "react";
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

  //doctor
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

  // Vendor

  // Get all vendor lists
  
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

  // Vendor documents
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

  //active or disable vendor
  // const vendorStatus = async (value ,id) => {
  //   try {
  //     console.log(value)
  //     console.log(id)
  //     const {data} = await axios.put(`${URL}/admin-vendor-all/active/${id}`, value , {
  //       headers: {
  //         token: tokenS.token,
  //       },
       
  //     });
  //     if(data.success === 1){
  //       console.log("Hii")
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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





  //get all food category

  // Get user token from local storage




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
    getDoctor,
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
    foodCategory

  
  };

  return (
    <>
      <MyContext.Provider value={valData}>{children}</MyContext.Provider>
    </>
  );
};

export default Context;
