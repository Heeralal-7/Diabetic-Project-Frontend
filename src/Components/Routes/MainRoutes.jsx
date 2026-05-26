import React from "react";
import { Route, Routes } from "react-router-dom";
import Blogs from "../Pages/Blogs/Blogs";
import LandingPage from "../LandingPage";
import Videos from "../Pages/Others/Videos";
import Doctors from "../Pages/Doctor/Doctors";
import AboutUs from "../Pages/Others/AboutUs";
import DoctorsProfile from "../Pages/Doctor/DoctorsProfile";
import BlogPage from "../Pages/Blogs/BlogPage";
import Clinic from "../Pages/Clinic/Clinic";
import ClinicPage1 from "../Pages/Clinic/ClinicPage1";
import CareProgram from "../Pages/Others/CareProgram";
import Science from "../Pages/Others/Science";
import LabTest from "../Pages/Lab/LabTest";
import LabPayemnt from "../Pages/Lab/LabPayment";
import OrderSuccessLab from "../Pages/Lab/OrderSuccess";
import OrderHistoryLab from "../Pages/Lab/OrderHistory";

import LabDetails from "../Pages/Lab/LabDetails";
import LabTestCart from "../Pages/Lab/LabTestCart";
import ShopMain from "../Pages/Shop/ShopMain";
import ShopCart from "../Pages/Shop/ShopCart";
import HomeFoodAndNurtion from "../Pages/FoodAndNutrition/HomeFoodAndNurtion";
import ProductsItems from "../Pages/FoodAndNutrition/ProductsItems";
import ProductCart from "../Pages/FoodAndNutrition/ProductCart";
import ProductItem from "../Pages/Shop/ProductItem";
import HomePharmacy from "../Pages/Pharmacy/HomePharmacy";
import PharmacyPaymentPage from "../Pages/Pharmacy/PharmacyComponents/PaymentPage";
import PharmacyProfile from "../Pages/Pharmacy/PharmacyComponents/PharmacyProfile";
import PharmacyCart from "../Pages/Pharmacy/PharmacyCart";
import PharmacyProductItem from "../Pages/Pharmacy/PharmacyProductItem";
import {Login, OtpVerify } from "../Pages/Signup/Login";
import { CaregiverDetails, Register, RegisterStep2 } from "../Pages/Signup/Register";
import ProtectUser from "../../ProtectUser";
import MealDetails from "../Pages/FoodAndNutrition/FAndNComponents/MealsDetails";
import CravingFoodDetails from "../Pages/FoodAndNutrition/FAndNComponents/CravingFoodDetails";
import CartPage from "../Pages/FoodAndNutrition/FAndNComponents/CartCard";
import OrderSuccess from "../Pages/FoodAndNutrition/FAndNComponents/OrderSuccess";
import OrderHistory from "../Pages/FoodAndNutrition/FAndNComponents/OrderHistory";
import OrderDetails from "../Pages/FoodAndNutrition/FAndNComponents/OrderDetails";
import MedicinePage from "../Pages/Pharmacy/PharmacyComponents/MedicinePage";
import ProductsPage from "../Pages/Pharmacy/PharmacyComponents/ProductsPage";
import PharmacyCartPage from "../Pages/Pharmacy/PharmacyComponents/PharmacyCartPage";
import PharmacyOrderPage from "../Pages/Pharmacy/PharmacyComponents/PharmacyOrderPage";
import PharmacyOrderTracker from "../Pages/Pharmacy/PharmacyComponents/PharmacyOrderTracker";
import PharmacyOrderHistory from "../Pages/Pharmacy/PharmacyComponents/PharmacyOrderHistory";
import PopularMedicinePage from "../Pages/Pharmacy/PharmacyComponents/PopularMedicinePage";
import PopularProductsPage from "../Pages/Pharmacy/PharmacyComponents/PopularProductsPage";
import CartButton from "../Pages/FoodAndNutrition/FAndNComponents/CartButton";
import PaymentPage from "../Pages/FoodAndNutrition/FAndNComponents/PaymentPage";
import VendorDocuments from "../../VendorPanel/Pages/PharmacyVendor/VendorDocuments";
import OrganTests from "../Pages/Lab/OrganTests";
import PackageDetails from "../Pages/Lab/PackageDetails";
import UserOrderHistory from "../Pages/Lab/OrderHistory";
import LabTestHistory from "../Pages/Lab/TestHistory";
import ActiveMembership from "../Pages/Others/ActiveMembership";
import CareProgramPayment from "../Pages/Others/PaymentCareProgram";
import ContactUs from "../Pages/Others/ContactUs";
import PrivacyPolicy from "../Pages/Others/PrivacyPolicy";
import TermsConditions from "../Pages/Others/TermCondition";
import AllMindCategories from "../Pages/FoodAndNutrition/AllMindCategory";
import AllCravingCategories from "../Pages/FoodAndNutrition/CravingCategory";
import AllMeals from "../Pages/FoodAndNutrition/Shops";
import PharmacyShopsPage from "../Pages/Shop/PharmacyShop";
import FoodShopRatingManager from "../Pages/FoodAndNutrition/FoodShopRating";
import DoctorPayment from "../Pages/Doctor/DoctorPayment";
import AppoitmentHistory from "../Pages/Doctor/History";
import PathologyTests from "../Pages/Lab/PathologyTest";
import RadiologyTests from "../Pages/Lab/RadiologyTest";
import TestPackages from "../Pages/Lab/TestPackage";
import CardSlider from "../Pages/Others/CareProgramIntro";
import PatientVideoCall from "../Pages/Doctor/PatientVideoCall";
import IncomingCall from "../Pages/Doctor/IncomingCall";
import PatientDashboard from "../Pages/Doctor/PatientDashboard";
import MedicineComponent from "../landingpageComponents/MedicineComponent";


const MainRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/Blogs" element={<ProtectUser><Blogs /></ProtectUser>} /> */}
        {/* Blogs routes */}
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:tabType" element={<Blogs />} />
        <Route path="/blogs/:tabType/blog/:blogId" element={<BlogPage />} />
        
        {/* Legacy route for backward compatibility */}
        <Route path="/Blogs/BlogPage/:blogId" element={<BlogPage />} />
        {/*  */}
        <Route path="/Clinic" element={<Clinic />} />
        <Route path="/Clinic/Doctors/:clinicId" element={<ClinicPage1 />} />
        <Route path="/Clinic/DoctorProfile" element={<DoctorsProfile />} />
        <Route path="/Clinic/National" element={<ClinicPage1 />} />
        <Route path="/Clinic/State" element={<ClinicPage1 />} />
        <Route path="/Clinic/City" element={<ClinicPage1 />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/Doctors" element={<Doctors />} />
        <Route path="/Doctors/Profile/:id" element={<DoctorsProfile />} />
        <Route path="/Doctors/payment" element={<DoctorPayment />} />
        <Route path="/Doctors/history" element={<AppoitmentHistory />} />
        <Route path="/Doctors/patientVideoCall" element={<PatientVideoCall />} />
        <Route path="/Doctors/incomingCall" element={<IncomingCall />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/Blogs/BlogPage/:blogId" element={<BlogPage />} />
        <Route path="/Science" element={<Science />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/term-conditions" element={<TermsConditions />} />
        <Route path="/venders/labs" element={<LabTest />} />
        <Route path="/venders/labs/payment" element={<LabPayemnt />} />
        <Route path="/venders/labs/order-success" element={<OrderSuccessLab />} />
        <Route path="/venders/labs/orders" element={<OrderHistoryLab />} />

        <Route path="/venders/labs/Lab-details/:id" element={<LabDetails />} />
        <Route path="/lab-tests/organ/:organName" element={<OrganTests />} />
  <Route path="/lab-tests/package/:packageName" element={<PackageDetails />} />
        <Route
          path="/venders/labs/Lab-details/Cart"
          element={<LabTestCart />}
        />
          <Route path="/venders/labs/order-history" element={<UserOrderHistory />} />
          <Route path="/venders/labs/test-history" element={<LabTestHistory />} />   
          <Route path="/care-program-intro" element={< CardSlider/>} />

        <Route path="/CareProgram" element={<CareProgram />} />
        <Route path="/CareProgram/active" element={<ActiveMembership />} />
        <Route path="/care-program/payment" element={<CareProgramPayment />} />
        <Route path="/shop/BuyMedicine" element={<ShopMain />} />
        <Route path="/shop/BuyMedicine/ProductCart" element={<ShopCart />} />
        <Route path="/shop/BuyMedicine/Product" element={<ProductItem />} />
        <Route path="/shop/FoodAndNurition" element={<HomeFoodAndNurtion />} />
        <Route
          path="/shop/FoodAndNurition/Products/:vendorId"
          element={<ProductsItems />}
        />
        <Route path="/shop/FoodAndNurition/payment" element={<PaymentPage />} />
        <Route path="/shop/FoodAndNurition/meal/:id" element={<MealDetails />} />
        <Route path="/foodname/:foodName" element={<CravingFoodDetails />} />
        <Route path="/shop/FoodAndNurition/meal/cart" element={<CartPage />} />
        <Route path="/shop/FoodAndNurition/order-success" element={<OrderSuccess />} />
        <Route path="/shop/FoodAndNurition/orders" element={<OrderHistory />} />
        <Route path="/shop/FoodAndNurition/orders/:orderId" element={<OrderDetails />} />
        <Route path="/all-mind-categories" element={<AllMindCategories />} />
        <Route path="/all-craving-categories" element={<AllCravingCategories />} />
        <Route path="/all-meals" element={<AllMeals />} />
        <Route path="/pharmacy-shop" element={<PharmacyShopsPage />} />
        <Route path="/food-shop/rating/:vendorId" element={<FoodShopRatingManager />} />
        <Route path="/Lab/PathologyTests/:vendorId" element={<PathologyTests />} />
        <Route path="/Lab/RadiologyTests/:vendorId" element={<RadiologyTests />} />
        <Route path="/Lab/TestPackages/:vendorId" element={<TestPackages />} />
       




        <Route path="/shop/FoodAndNurition/Cart" element={<ProductCart />} />
        <Route path="/pharmacy" element={<HomePharmacy />} />
        <Route path="/pharmacy/page" element={<MedicineComponent />} />

        <Route path="/pharmacy/payment" element={<PharmacyPaymentPage />} />
        <Route path="/pharmacy/:vendorId" element={<PharmacyProfile />} />
        <Route
          path="/Pharmacy/shop/Product"
          element={<PharmacyProductItem />}
        />
        <Route path="/Pharmacy/shop/Cart" element={<PharmacyCart />} />
        <Route path="/pharmacy/medicines" element={<MedicinePage />} />
        <Route path="/pharmacy/products" element={<ProductsPage />} />
        <Route path="/pharmacy/popular-medicines" element={<PopularMedicinePage />} />
        <Route path="/pharmacy/popular-products" element={<PopularProductsPage />} />

        <Route path="/pharmacy/cart" element={<PharmacyCartPage />} />
        <Route path="/pharmacy/order-success" element={<PharmacyOrderPage />} />
        <Route path="/pharmacy/order-tracker" element={<PharmacyOrderTracker />} />
        <Route path="/pharmacy/order-history" element={<PharmacyOrderHistory />} />
        <Route path="/pharmacy/documents" element={<VendorDocuments />} />


        

        {/* Authentication Routes */}
        
        <Route path="/UserLogin" element={<Login />} />
        <Route path="/otp-verify" element={<OtpVerify />} />
        <Route path="/update-profile" element={<Register />} />
        <Route path="/DiabeticType" element={<RegisterStep2  />} />
        <Route path="/CaregiverDetails" element={<CaregiverDetails />} />
        {/* <Route path="/ForgotPassword" element={<ForgotPassword />} /> */}
      </Routes>
      <CartButton />
    </>
  );
};

export default MainRoutes;
