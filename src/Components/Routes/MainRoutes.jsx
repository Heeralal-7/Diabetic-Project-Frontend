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
import LabDetails from "../Pages/Lab/LabDetails";
import LabTestCart from "../Pages/Lab/LabTestCart";
import ShopMain from "../Pages/Shop/ShopMain";
import ShopCart from "../Pages/Shop/ShopCart";
import HomeFoodAndNurtion from "../Pages/FoodAndNutrition/HomeFoodAndNurtion";
import ProductsItems from "../Pages/FoodAndNutrition/ProductsItems";
import ProductCart from "../Pages/FoodAndNutrition/ProductCart";
import ProductItem from "../Pages/Shop/ProductItem";
import HomePharmacy from "../Pages/Pharmacy/HomePharmacy";
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

const MainRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Blogs" element={<ProtectUser><Blogs /></ProtectUser>} />
        <Route path="/Clinic" element={<Clinic />} />
        <Route path="/Clinic/International" element={<ClinicPage1 />} />
        <Route path="/Clinic/DoctorProfile" element={<DoctorsProfile />} />
        <Route path="/Clinic/National" element={<ClinicPage1 />} />
        <Route path="/Clinic/State" element={<ClinicPage1 />} />
        <Route path="/Clinic/City" element={<ClinicPage1 />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/Doctors" element={<Doctors />} />
        <Route path="/Doctors/Profile/:id" element={<DoctorsProfile />} />
        <Route path="/Blogs/BlogPage" element={<BlogPage />} />
        <Route path="/Science" element={<Science />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/venders/labs" element={<LabTest />} />
        <Route path="/venders/labs/Lab-details/:id" element={<LabDetails />} />
        <Route
          path="/venders/labs/Lab-details/Cart"
          element={<LabTestCart />}
        />
        <Route path="/CareProgram" element={<CareProgram />} />
        <Route path="/shop/BuyMedicine" element={<ShopMain />} />
        <Route path="/shop/BuyMedicine/ProductCart" element={<ShopCart />} />
        <Route path="/shop/BuyMedicine/Product" element={<ProductItem />} />
        <Route path="/shop/FoodAndNurition" element={<HomeFoodAndNurtion />} />
        <Route
          path="/shop/FoodAndNurition/Products"
          element={<ProductsItems />}
        />
        <Route path="/shop/FoodAndNurition/meal/:id" element={<MealDetails />} />
        <Route path="/foodname/:foodName" element={<CravingFoodDetails />} />
        <Route path="/shop/FoodAndNurition/meal/cart" element={<CartPage />} />
        <Route path="/shop/FoodAndNurition/order-success" element={<OrderSuccess />} />
        <Route path="/shop/FoodAndNurition/orders" element={<OrderHistory />} />
        <Route path="/shop/FoodAndNurition/order-details/:id" element={<OrderDetails />} />




        <Route path="/shop/FoodAndNurition/Cart" element={<ProductCart />} />
        <Route path="/Pharmacy" element={<HomePharmacy />} />
        <Route path="/Pharmacy/shop-details" element={<PharmacyProfile />} />
        <Route
          path="/Pharmacy/shop/Product"
          element={<PharmacyProductItem />}
        />
        <Route path="/Pharmacy/shop/Cart" element={<PharmacyCart />} />
        <Route path="/UserLogin" element={<Login />} />
        <Route path="/otp-verify" element={<OtpVerify />} />
        <Route path="/update-profile" element={<Register />} />
        <Route path="/DiabeticType" element={<RegisterStep2  />} />
        <Route path="/CaregiverDetails" element={<CaregiverDetails />} />
        {/* <Route path="/ForgotPassword" element={<ForgotPassword />} /> */}
      </Routes>
    </>
  );
};

export default MainRoutes;
