import Fotter from "./Components/Includes/Fotter";
import Header from "./Components/Includes/Header";
import MainRoutes from "./Components/Routes/MainRoutes";
import "./Components/Assets/Css/Style.css";
import "./Components/Assets/Css/Animations.css";
import "./Components/Assets/Css/FoodAndNutrition.css";
import "./Components/Assets/Css/Blog.css";
import "./Components/Assets/Css/CareProgram.css";
import "./Components/Assets/Css/Pharmacy.css";
import "./Components/Assets/Css/Registration.css";
import "aos/dist/aos.css";
import "slick-carousel/slick/slick.css";
import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Admin from "./Admin/Admin";
import AdminLogin from "./Admin/components/Login";
import Protect from "./Protect";
import Protectlab from "./ProtectVenodrLab";
import Abc from "./Admin/components/Users";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import User from "./Admin/components/Vendor/Lab/User";
import ViewUser from "./Admin/components/Vendor/Lab/viewUser";
import Dashboard from "./Admin/components/dashboard";
import GetBlog from "./Admin/components/Blog/GetBlog";
import GetParticularBlog from "./Admin/components/Blog/GetParticularBlog";
import AddBlog from "./Admin/components/Blog/AddBlog";
import AddBlogSubHeading from "./Admin/components/Blog/AddBlogSubHeading";
import Userpharmacy from "./Admin/components/Vendor/Pharmacy/Userpharmacy";
import Edit from "./Admin/includes/Edit";
import ChangePassword from "./Admin/includes/ChangePassword";
import Viewuser from "./Admin/components/Vendor/Pharmacy/Viewuser";
import Banned from "./Admin/components/Banned";
import { VendorLogin } from "./VendorPanel/Login";
import VendorRegistration from "./VendorPanel/Register";
import Index from "./VendorPanel/Pages/LabVendor/Index";
import { AddTest } from "./VendorPanel/Pages/LabVendor/AddTest";
import AddPackages from "./VendorPanel/Pages/LabVendor/AddPackages";
import Test from "./VendorPanel/Pages/LabVendor/Test";
import VendorForgotPass from "./VendorPanel/ForgotPass";
import VendorDashboard from "./VendorPanel/Pages/LabVendor/Dashboard";
import Package from "./VendorPanel/Pages/LabVendor/Package";
import Banner from "./Admin/components/Banners"
import ViewFood from "./Admin/components/Vendor/Food/viewFood";
// import AddFoodCategory from "./Admin/components/Food-category";
// import Protectpharmacy from "./ProtectVendorPharmacy";

/////////////////////////////    FOOD AND PHARMACY VENDOR           ///////////////////////////////////////////
import FoodDashboard from "./VendorPanel/Pages/FoodVendor/FoodDashboard";
import PharmacyDashboard from "./VendorPanel/Pages/PharmacyVendor/PharmacyDashboard";
import IndexFood from "./VendorPanel/Pages/FoodVendor/IndexFood";
import Ongoing from "./VendorPanel/Pages/FoodVendor/Ongoing";
import MyAvailability from "./VendorPanel/Pages/FoodVendor/AvailabilityManagement";
import Pending from "./VendorPanel/Pages/FoodVendor/Pending";
import AcceptedOrders from "./VendorPanel/Pages/FoodVendor/AcceptedOrders";
import assignDriverToOrder from "./VendorPanel/Pages/FoodVendor/AssignDriverModal";
import Reject from "./VendorPanel/Pages/FoodVendor/Reject";
import TodayOrders from "./VendorPanel/Pages/FoodVendor/TodayOrders";
import Coupons from "./VendorPanel/Pages/FoodVendor/Coupons";
import TrackOrders from "./VendorPanel/Pages/FoodVendor/TrackOrders";
import GenerateCoupon from "./VendorPanel/Pages/FoodVendor/Generatecoupon";
import AddMedicine from "./VendorPanel/Pages/PharmacyVendor/AddMedicine";
import OngoingMedicines from "./VendorPanel/Pages/PharmacyVendor/OngoingMedicines";
import OutOfStock from "./VendorPanel/Pages/PharmacyVendor/OutOfStock";
import PharTodayOrders from "./VendorPanel/Pages/PharmacyVendor/PharTodayOrders";
import PharTrackOrders from "./VendorPanel/Pages/PharmacyVendor/PharTrackOrders";
import PharCoupons from "./VendorPanel/Pages/PharmacyVendor/PharCoupons";
import PharGenerateCoupon from "./VendorPanel/Pages/PharmacyVendor/PharGenerateCoupon";
import IndexPharmacy from "./VendorPanel/Pages/PharmacyVendor/IndexPharmacy";
import Services from "./Admin/components/AddService/Service";
import MedicineProduct from "./Admin/components/Medicine/MedicineProduct";
////////////////////////// food and pharmacy vendor routes end //////////////////////


import Doctor from "./Admin/components/Doctor/Doctor";
import ViewDoctor from "./Admin/components/Doctor/InfoDoctor";
import Medicines from "./Admin/components/Medicine/Medicine";
import Specialist from "./Admin/components/SpecialistDoctor/Specialist";
import UploadFood from "./Admin/components/Vendor/Food/UploadFood";
import FoodId from "./Admin/components/Vendor/Food/FoodId";

/////////////////////////////    SUB ADMIN           ///////////////////////////////////////////
import Dashboard1 from "./Sub-Admin/components/dashboard";
import Users1 from "./Sub-Admin/components/Users";
import SubAdminLogin from "./Sub-Admin/components/Login";
import BannedSub from "./Sub-Admin/components/Banned";
import SubServicesAdmin from "./Sub-Admin/components/AddService/Service";
import SubAdmin from "./Sub-Admin/SubAdmin";
import DoctorSA from "./Sub-Admin/components/Doctor/Doctor";
import ViewDoctorSA from "./Admin/components/Doctor/InfoDoctor";
import FoodIdSA from "./Sub-Admin/components/Vendor/Food/FoodId";
import UploadFoodSA from "./Sub-Admin/components/Vendor/Food/UploadFood";
import ViewFoodSA from "./Sub-Admin/components/Vendor/Food/viewFood";
import LabUser from "./Sub-Admin/components/Vendor/Lab/User";
import ViewUserSA from "./Sub-Admin/components/Vendor/Lab/viewUser";
import UserpharmacySA from "./Sub-Admin/components/Vendor/Pharmacy/Userpharmacy";
import ViewUserPharmacy from "./Sub-Admin/components/Vendor/Pharmacy/Viewuser";
import SpecialistUploadFormSA from "./Sub-Admin/components/SpecialistDoctor/Specialist";
import MedicinesSA from "./Sub-Admin/components/Medicine/Medicine";
import AddBlogSA from "./Sub-Admin/components/Blog/AddBlog";
import AddBlogSubHeadingSA from "./Sub-Admin/components/Blog/AddBlogSubHeading";
import GetBlogSA from "./Sub-Admin/components/Blog/GetBlog";
import GetParticularBlogSA from "./Sub-Admin/components/Blog/GetParticularBlog";
import BannersSA from "./Sub-Admin/components/Banners";
import EditSA from "./Sub-Admin/includes/Edit";
import ProtectPharmacy from "./PharmacyProtect";

import ProtectFood from "./ProtectFood";
import Insurance from "./Admin/components/insurance/Insurance";
function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const adminPath = pathname.startsWith("/dashboard");
  const adminLoginPath = pathname.startsWith("/admin");
  const vendorPath = pathname.startsWith("/panel");
  const vendorLoginPath = pathname.startsWith("/vendordashboard");

  const foodVendorPath = pathname.startsWith("/food-dashboard");
  const pharmacyVendorPath = pathname.startsWith("/pharmacy-dashboard");


  const websiteRoutes = () => {
    return (
      <>
        <Header />
        <main style={{ marginTop: "70px" }} className=" ">
          <MainRoutes />
        </main>
        <Fotter />
      </>
    );
  };

  ////////////////////////////////// admin routes start/////////////////////
  const adminRoutes = () => {
    return (
      <>
        <Admin>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <Protect>
                  <Dashboard />
                </Protect>
              }
            />

            <Route
              path="/dashboard/active"
              element={
                <Protect>
                  <Abc />
                </Protect>
              }
            />
            <Route
              path="/dashboard/lab/user"
              element={
                <Protect>
                  <User />
                </Protect>
              }
            />
            <Route
              path="/dashboard/getblogs"
              element={
                <Protect>
                  <GetBlog />
                </Protect>
              }
            />
            <Route
              path="/dashboard/lab/userview/:id"
              element={
                <Protect>
                  <ViewUser />
                </Protect>
              }
            />
            <Route
              path="/dashboard/getblogs/:id"
              element={
                <Protect>
                  <GetParticularBlog />
                </Protect>
              }
            />
            <Route
              path="/dashboard/addblog"
              element={
                <Protect>
                  <AddBlog />
                </Protect>
              }
            />
            <Route
              path="/dashboard/addblogSubheading"
              element={
                <Protect>
                  <AddBlogSubHeading />
                </Protect>
              }
            />
            <Route
              path="/dashboard/pharmacy"
              element={
                <Protect>
                  <Userpharmacy />
                </Protect>
              }
            />
            <Route
              path="/dashboard/edit"
              element={
                <Protect>
                  <Edit />
                </Protect>
              }
            />
            <Route
              path="/dashboard/password"
              element={
                <Protect>
                  <ChangePassword />
                </Protect>
              }
            />
            <Route
              path="/dashboard/pharmacy/viewuser/:id"
              element={
                <Protect>
                  <Viewuser />
                </Protect>
              }
            />
            <Route
              path="/dashboard/banned"
              element={
                <Protect>
                  <Banned />
                </Protect>
              }
            />
            <Route
              path="/dashboard/banner"
              element={
                <Protect>
                  <Banner />
                </Protect>
              }
            />
            <Route
              path="/dashboard/viewFood"
              element={
                <Protect>
                  <ViewFood />
                </Protect>
              } />
            <Route
              path="/dashboard/CategoryFood"
              element={
                <Protect>
                  <UploadFood />
                </Protect>
              } />
            <Route
              path="/dashboard/ViewFood/:id"
              element={
                <Protect>
                  <FoodId />
                </Protect>
              } />

            <Route
              path="/dashboard/Services"
              element={
                <Protect>
                  <Services />
                </Protect>
              } />
            <Route
              path="/dashboard/Doctor"
              element={
                <Protect>
                  <Doctor />
                </Protect>
              } />
            <Route
              path="/dashboard/ViewDoctor/:id"
              element={
                <Protect>
                  <ViewDoctor />
                </Protect>
              } />
            <Route
              path="/dashboard/Medicines"
              element={
                <Protect>
                  <Medicines />
                </Protect>
              } />
              {/* medicine-product */}
            <Route
              path="/dashboard/medicine-product"
              element={
                <Protect>
                  <MedicineProduct />
                </Protect>
              }
            />
            <Route
              path="/dashboard/specialist"
              element={
                <Protect>
                  <Specialist />
                </Protect>
              } />
                          <Route
              path="/dashboard/insurance"
              element={
                <Protect>
                  <Insurance />
                </Protect>
              } />
          </Routes>
        </Admin>
      </>
    );
  };

  const adminLoginRoute = () => {
    return (
      <>
        <Routes>
          <Route
            path="/admin"
            element={
              <Protect>
                <AdminLogin />
              </Protect>
            }
          />
        </Routes>
      </>
    );
  };
  ////////////////////////////////// admin routes end/////////////////////

  ////////////////////////////////// vendor + lab routes start/////////////////////
  const LabRoutes = () => {
    return (
      <>
        <Index>
          <Routes>
            {/* lab admin route */}
            <Route
              path="/panel"
              element={
                <Protectlab>
                  <VendorDashboard />
                </Protectlab>
              }
            />
            <Route
              path="/panel/services/AddTest"
              element={
                <Protectlab>
                  <AddTest />
                </Protectlab>
              }
            />
            <Route
              path="/panel/services/AddPackages"
              element={
                <Protectlab>
                  <AddPackages />
                </Protectlab>
              }
            />
            <Route
              path="/panel/services/tests"
              element={
                <Protectlab>
                  <Test />
                </Protectlab>
              }
            />
            <Route
              path="/panel/services/packages"
              element={
                <Protectlab>
                  <Package />
                </Protectlab>
              }
            />
          </Routes>
        </Index>
      </>
    );
  };

  ////////////////////////////////// pharmacy vendor routes start/////////////////////
  const pharmacyRoutes = () => {
    return (
      <IndexPharmacy>
        <Routes>
          <Route path="/pharmacy-dashboard" element={
            <ProtectPharmacy>
              <PharmacyDashboard />
            </ProtectPharmacy>
          } />

          {/* Medicines */}
          <Route path="/pharmacy-dashboard/add-medicine" element={
            <ProtectPharmacy>
              <AddMedicine />
            </ProtectPharmacy>
          } />
          <Route path="/pharmacy-dashboard/ongoing-medicines" element={
            <ProtectPharmacy>
              <OngoingMedicines />
            </ProtectPharmacy>
          } />
          <Route path="/pharmacy-dashboard/out-of-stock" element={
            <ProtectPharmacy>
              <OutOfStock />
            </ProtectPharmacy>
          } />

          {/* Orders */}
          <Route path="/pharmacy-dashboard/today-orders" element={
            <ProtectPharmacy>
              <PharTodayOrders />
            </ProtectPharmacy>
          } />
          <Route path="/pharmacy-dashboard/track-orders" element={
            <ProtectPharmacy>
              <PharTrackOrders />
            </ProtectPharmacy>
          } />

          {/* Promotions */}
          <Route path="/pharmacy-dashboard/coupons" element={
            <ProtectPharmacy>
              <PharCoupons />
            </ProtectPharmacy>
          } />
          <Route path="/pharmacy-dashboard/generate-coupon" element={
            <ProtectPharmacy>
              <PharGenerateCoupon />
            </ProtectPharmacy>
          } />
        </Routes>
      </IndexPharmacy>
    );
  };

  ////////////////////////////////// food vendor routes start/////////////////////
  const foodRoutes = () => {
    return (
      <>
        <IndexFood>
          <Routes>
            <Route
              path="/food-dashboard/viewFood"
              element={
                <ProtectFood>
                  <FoodDashboard />
                </ProtectFood>
              }
            />
            <Route
              path="/food-dashboard/ongoing"
              element={
                <ProtectFood>
                  <Ongoing />
                </ProtectFood>
              }
            />
            <Route
              path="/food-dashboard/accepted-orders"
              element={
                <ProtectFood>
                  <AcceptedOrders />
                </ProtectFood>
              }
            />
            <Route
              path="/food-dashboard/assign-driver"
              element={
                <ProtectFood>
                  <assignDriverToOrder />
                </ProtectFood>
              }
            />
            <Route
              path="/food-dashboard/reject"
              element={
                <ProtectFood>
                  <Reject />
                </ProtectFood>
              }
            />
            <Route
              path="/food-dashboard/today-orders"
              element={
                <ProtectFood>
                  <TodayOrders />
                </ProtectFood>
              }
            />
            <Route
              path="/food-dashboard/track-orders"
              element={
                <ProtectFood>
                  <TrackOrders />
                </ProtectFood>
              }
            />
            <Route
              path="/food-dashboard/coupons"
              element={
                <ProtectFood>
                  <Coupons />
                </ProtectFood>
              }
            />
            <Route
              path="/food-dashboard/generate-coupon"
              element={
                <ProtectFood>
                  <GenerateCoupon />
                </ProtectFood>
              }
            />
            <Route
              path="/food-dashboard/my-availability"
              element={
                <ProtectFood>
                  <MyAvailability />
                </ProtectFood>
              }
            />

          </Routes>
        </IndexFood>
      </>
    );
  };

  const vendorLoginRoute = () => {
    return (
      <>
        <Routes>
          <Route
            path="/vendordashboard"
            element={
              <Protectlab>
                <VendorLogin />
              </Protectlab>
            }
          />
          <Route
            path="/vendordashboard/vendorregister"
            element={<VendorRegistration />}
          />
          <Route
            path="/vendordashboard/ForgotPass"
            element={<VendorForgotPass />}
          />
        </Routes>
      </>
    );
  };
  ////////////////////////////////// vendor routes end/////////////////////

  ////////////////////////////////////// Sub-Admin Start //////////////////////
  <Routes>
    <Route
      path="/Dashboard1"
      element={
        <Protect>
          <Dashboard1 />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/Users1"
      element={
        <Protect>
          <Users1 />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/subbanned"
      element={
        <Protect>
          <BannedSub />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/services"
      element={
        <Protect>
          <SubServicesAdmin />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/SubAdmin"
      element={
        <Protect>
          <SubAdmin />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/SubAdmin"
      element={
        <Protect>
          <SubAdmin />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/doctor"
      element={
        <Protect>
          < DoctorSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/viewdoctor"
      element={
        <Protect>
          < ViewDoctorSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/foodId"
      element={
        <Protect>
          < FoodIdSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/uploadfood"
      element={
        <Protect>
          < UploadFoodSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/uploadfood"
      element={
        <Protect>
          < UploadFoodSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/viewfood"
      element={
        <Protect>
          < ViewFoodSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/labuser"
      element={
        <Protect>
          < LabUser />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/viewlabuser"
      element={
        <Protect>
          < ViewUserSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/userpharmacy"
      element={
        <Protect>
          < UserpharmacySA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/viewuserpharmacy"
      element={
        <Protect>
          < ViewUserPharmacy />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/specialist"
      element={
        <Protect>
          <  SpecialistUploadFormSA />
        </Protect>
      }
    />

    <Route
      path="/Dashboard1/medicine"
      element={
        <Protect>
          <  MedicinesSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/addblog"
      element={
        <Protect>
          <  AddBlogSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/addblogsubheading"
      element={
        <Protect>
          <  AddBlogSubHeadingSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/getblog"
      element={
        <Protect>
          <  GetBlogSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/banners"
      element={
        <Protect>
          <  BannersSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/getperticularblog"
      element={
        <Protect>
          <  GetParticularBlogSA />
        </Protect>
      }
    />
    <Route
      path="/Dashboard1/edit"
      element={
        <Protect>
          <  EditSA />
        </Protect>
      }
    />



  </Routes>

  const subAdminLoginRoute = () => {
    return (
      <>
        <Routes>
          <Route
            path="/Subadmin"
            element={
              <Protect>
                < SubAdminLogin />
              </Protect>
            }
          />
        </Routes>
      </>
    );
  };



  ////////////////////////////////////// Sub-Admin End ////////////////////////


  return (
    <>
      {adminPath
        ? adminRoutes()
        : adminLoginPath
          ? adminLoginRoute()
          : vendorPath
            ? LabRoutes()
            : vendorLoginPath
              ? vendorLoginRoute()
              : foodVendorPath
                ? foodRoutes()
                : pharmacyVendorPath
                  ? pharmacyRoutes()
                  : websiteRoutes()}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;