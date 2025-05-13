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
import { AddTest} from "./VendorPanel/Pages/LabVendor/AddTest";
import AddPackages from "./VendorPanel/Pages/LabVendor/AddPackages";
import Test from "./VendorPanel/Pages/LabVendor/Test";
import VendorForgotPass from "./VendorPanel/ForgotPass";
import VendorDashboard from "./VendorPanel/Pages/LabVendor/Dashboard";
import Package from "./VendorPanel/Pages/LabVendor/Package";
import Banner from "./Admin/components/Banners"
import ViewFood from "./Admin/components/Vendor/Food/viewFood";
// import AddFoodCategory from "./Admin/components/Food-category";
// import Protectpharmacy from "./ProtectVendorPharmacy";
import FoodDashboard from "./VendorPanel/Pages/FoodVendor/FoodDashboard";
import PharmacyDashboard from "./VendorPanel/Pages/PharmacyVendor/PharmacyDashboard";
import IndexFood from "./VendorPanel/Pages/FoodVendor/IndexFood";
import Ongoing from "./VendorPanel/Pages/FoodVendor/Ongoing";
import Pending from "./VendorPanel/Pages/FoodVendor/Pending";
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
              }/>
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
          <Route path="/pharmacy-dashboard" element={<PharmacyDashboard />} />
  
          {/* Medicines */}
          <Route path="/pharmacy-dashboard/add-medicine" element={<AddMedicine />} />
          <Route path="/pharmacy-dashboard/ongoing-medicines" element={<OngoingMedicines />} />
          <Route path="/pharmacy-dashboard/out-of-stock" element={<OutOfStock />} />
  
          {/* Orders */}
          <Route path="/pharmacy-dashboard/today-orders" element={<PharTodayOrders />} />
          <Route path="/pharmacy-dashboard/track-orders" element={<PharTrackOrders />} />
  
          {/* Promotions */}
          <Route path="/pharmacy-dashboard/coupons" element={<PharCoupons />} />
          <Route path="/pharmacy-dashboard/generate-coupon" element={<PharGenerateCoupon />} />
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
              path="/food-dashboard" 
              element={
                  <FoodDashboard />
              }
            />
            <Route
              path="/food-dashboard/ongoing"
              element={
                  <Ongoing />
              }
            />
            <Route
              path="/food-dashboard/pending"
              element={
                  <Pending />
              }
            />
            <Route
              path="/food-dashboard/reject"
              element={
                  <Reject />
              }
            />
            <Route
              path="/food-dashboard/today-orders"
              element={
                  <TodayOrders />
              }
            />
            <Route
              path="/food-dashboard/track-orders"
              element={
                  <TrackOrders />
              }
            />
            <Route
              path="/food-dashboard/coupons"
              element={
                  <Coupons />
              }
            />
            <Route
              path="/food-dashboard/generate-coupon"
              element={
                  <GenerateCoupon />
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