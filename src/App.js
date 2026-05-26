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
import ProtectDoctor from "./ProtectDoctor"; // Assuming ProtectDoctor.jsx is in the src folder
import ProtectClinic from "./ProtectClinic";
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
import PharTodayOrders from "./VendorPanel/Pages/PharmacyVendor/PharTodayOrders";
import PharTrackOrders from "./VendorPanel/Pages/PharmacyVendor/PharTrackOrders";
import PharCoupons from "./VendorPanel/Pages/PharmacyVendor/PharCoupons";
import PharGenerateCoupon from "./VendorPanel/Pages/PharmacyVendor/PharGenerateCoupon";
import IndexPharmacy from "./VendorPanel/Pages/PharmacyVendor/IndexPharmacy";
import Services from "./Admin/components/AddService/Service";
import MedicineProduct from "./Admin/components/Medicine/MedicineProduct";
import MyAvailabilityPharmacy from "./VendorPanel/Pages/PharmacyVendor/AvailabilityPharmacy";
import AddDriver from "./VendorPanel/Pages/PharmacyVendor/CreateDriver.jsx";
import DriversList from "./VendorPanel/Pages/PharmacyVendor/DriverList";
import MedicineDetailsPage from "./VendorPanel/Pages/PharmacyVendor/MedicineDetailsPage.jsx"

////////////////////////// food and pharmacy vendor routes end //////////////////////


import Doctor from "./Admin/components/Doctor/Doctor";
import ViewDoctor from "./Admin/components/Doctor/InfoDoctor";
import Medicines from "./Admin/components/Medicine/Medicine";
import PendingMedicines from "./Admin/components/Vendor/Pharmacy/PendingMedicines";
import Specialist from "./Admin/components/SpecialistDoctor/Specialist";
import UploadFood from "./Admin/components/Vendor/Food/UploadFood";
import FoodId from "./Admin/components/Vendor/Food/FoodId";

import ProtectPharmacy from "./PharmacyProtect";

import ProtectFood from "./ProtectFood";
import Insurance from "./Admin/components/insurance/Insurance";
import DeliveryCharges from "./Admin/components/DeliveryCharges/DeliveryCharges";
import FoodDeliveryCharges from "./Admin/components/DeliveryCharges/FoodDelivery";
import ProductsList from "./VendorPanel/Pages/PharmacyVendor/ProductsList";
import MedicinesList from "./VendorPanel/Pages/PharmacyVendor/MedicinesList";
import VendorProfile from "./VendorPanel/Pages/PharmacyVendor/VendorProfile.jsx";
import ChangePasswordVendor from "./VendorPanel/Pages/PharmacyVendor/ChangePassword.jsx";
import PendingOrders from "./VendorPanel/Pages/LabVendor/PendingOrders.jsx";
import CompletedOrders from "./VendorPanel/Pages/LabVendor/CompletedOrders.jsx";
import Revenue from "./VendorPanel/Pages/LabVendor/Revenue.jsx";
import AcceptedOrdersLab from "./VendorPanel/Pages/LabVendor/AcceptedOrders.jsx"
import AssignedOrdersLab from "./VendorPanel/Pages/LabVendor/AssignedOrders.jsx"
import VendorDocuments from "./VendorPanel/Pages/PharmacyVendor/VendorDocuments.jsx";
import RevenuePharmacy from "./VendorPanel/Pages/PharmacyVendor/Revenue.jsx";

//..................... Doctor Panel ...............................
import DoctorDashboard from "./DoctorPanel/Pages/DoctorDashboard.jsx";
import DoctorLogin from "./DoctorPanel/DoctorLogin.jsx";
import DoctorRegister from "./DoctorPanel/DoctorRegister";
import DoctorProfile from "./DoctorPanel/Pages/DoctorProfile.jsx";
import IndexDoctor from "./DoctorPanel/Pages/IndexDoctor.jsx"
import DoctorEditProfile from "./DoctorPanel/Pages/DoctorEditProfile.jsx";
import DoctorAppointments from "./DoctorPanel/Pages/DoctorAppointments.jsx";
import DoctorConsultationHistory from "./DoctorPanel/Pages/DoctorConsultationHistory.jsx";
import DoctorPatients from "./DoctorPanel/Pages/DoctorPatients.jsx";
import DoctorDocuments from "./DoctorPanel/Pages/DoctorDocuments.jsx";
import DoctorChangePassword from "./DoctorPanel/Pages/ChangePasswordPage.jsx"
import DoctorCouponManagement from "./DoctorPanel/Pages/DoctorCouponManagement.jsx";
import DoctorAvailability from "./DoctorPanel/Pages/DoctorAvailability.jsx";
import ConsultationFeesComponent from "./DoctorPanel/Pages/ConsultationFees.jsx";
import DoctorPrescription from "./DoctorPanel/Pages/DoctorPrescription.jsx";
import PrivacyPolicyManagement from "./DoctorPanel/Pages/PrivacyPolicy.jsx";
import DoctorRatings from "./DoctorPanel/Pages/DoctorRatings.jsx";
import QualificationsManagement from "./DoctorPanel/Pages/Qualification.jsx";
import RevenueDoctor from "./DoctorPanel/Pages/RevenueDoctor.jsx";
import ClinicLogin from "./ClinicPanel/ClinicLogin.jsx";
import ClinicRegister from "./ClinicPanel/ClinicRegister.jsx";
import ClinicDashboard from "./ClinicPanel/Pages/ClinicDashboard.jsx";
import IndexClinic from "./ClinicPanel/Pages/IndexClinic.jsx";
import ClinicProfile from "./ClinicPanel/Pages/ClinicProfile.jsx";
import ClinicEditProfile from "./ClinicPanel/Pages/ClinicEditProfile.jsx";
import ClinicDoctors from "./ClinicPanel/Pages/ClinicDoctors.jsx";
import ClinicDocuments from "./ClinicPanel/Pages/Documents.jsx";
import ClinicAchievements from "./ClinicPanel/Pages/Achievements.jsx";
import ClinicServices from "./ClinicPanel/Pages/Services.jsx";
import ClinicAppointmentHistory from "./ClinicPanel/Pages/Appointments.jsx";
import ClinicChangePassword from "./ClinicPanel/Pages/ChangePassword.jsx";
import ClinicTimings from "./ClinicPanel/Pages/Timings.jsx";
import ClinicRevenue from "./ClinicPanel/Pages/Revenue.jsx";
import VideoCallComponent from "./DoctorPanel/Pages/VideoCall.jsx";
import OrderRevenue from "./VendorPanel/Pages/FoodVendor/FoodRevenue.jsx";
import AdminClinicTable from "./Admin/components/Clinic/Clinic.jsx";
import ViewAdminClinic from "./Admin/components/Clinic/ClinicInfo.jsx";
import LabTestCreate from "./Admin/components/Vendor/Lab/LabTestCreate.jsx";
import LabDeliveryCharges from "./Admin/components/DeliveryCharges/LabDelivery.js";
import SubAdminList from "./Admin/components/SubAdmin/SubAdminList.jsx";
import CreateSubAdmin from "./Admin/components/SubAdmin/CreateSubAdmin.jsx";
import SubAdminDetails from "./Admin/components/SubAdmin/SubAdminDetails.jsx";
import EditSubAdmin from "./Admin/components/SubAdmin/EditSubAdmin.jsx";

/////////////////////////////    SUB-ADMIN PANEL           ///////////////////////////////////////////
import { SubAdminLogin } from "./SubAdmin/Login.jsx";
import IndexSubAdmin from "./SubAdmin/Pages/Index.jsx";
import SubAdminDashboard from "./SubAdmin/Pages/Dashboard.jsx";
// import UserManagement from "./SubAdminPanel/Pages/UserManagement";
// import ContentManagement from "./SubAdminPanel/Pages/ContentManagement";
// import VendorApprovals from "./SubAdminPanel/Pages/VendorApprovals";
// import SupportTickets from "./SubAdminPanel/Pages/SupportTickets";
// import AnalyticsReports from "./SubAdminPanel/Pages/AnalyticsReports";
import ProtectSubAdmin from "./ProtectSubAdmin.jsx";
import SubAdminClinicTable from "./SubAdmin/Pages/Clinic/SubAdminClinicTable.jsx";
import ViewSubAdminClinic from "./SubAdmin/Pages/Clinic/ViewSubAdminClinic.jsx";
import SubadminSpecialists from "./SubAdmin/Pages/Clinic/Specialists.jsx";
import DoctorSubadmin from "./SubAdmin/Pages/Doctor/Doctor.jsx";
import ViewDoctorSubadmin from "./SubAdmin/Pages/Doctor/ViewDoctor.jsx";
import InsuranceTypeSubadmin from "./SubAdmin/Pages/Doctor/InsuranceType.jsx";
import UserManagementSubadmin from "./SubAdmin/Pages/User/UserSubadmin.jsx";
import UserBlogsSubadmin from "./SubAdmin/Pages/User/Blogs.jsx";
import ViewFoodSubadmin from "./SubAdmin/Pages/Vendor/Food/ViewFood.jsx";
import UploadFoodSubadmin from "./SubAdmin/Pages/Vendor/Food/UploadFood.jsx";
import FoodIdSubadmin from "./SubAdmin/Pages/Vendor/Food/Food.jsx";
import FoodDeliveryChargesSubadmin from "./SubAdmin/Pages/Vendor/Food/FoodDeliveryCharges.jsx";
import UserLabSubadmin from "./SubAdmin/Pages/Vendor/Lab/UserLab.jsx";
import LabDeliveryChargesSubadmin from "./SubAdmin/Pages/Vendor/Lab/LabDelivery.jsx";
import ViewLabSubadmin from "./SubAdmin/Pages/Vendor/Lab/ViewUserLab.jsx";
import CreateTestSubadmin from "./SubAdmin/Pages/Vendor/Lab/CreateTest.jsx";
import PharmacySubadmin from "./SubAdmin/Pages/Vendor/Pharmacy/UserPharmacy.jsx";
import ApprovalMedicineSubadmin from "./SubAdmin/Pages/Vendor/Pharmacy/MedicineApproval.jsx"
import PharmacyViewSubadmin from "./SubAdmin/Pages/Vendor/Pharmacy/ViewUserPhar.jsx";
import DeliveryChargesSubadmin from "./SubAdmin/Pages/Vendor/Pharmacy/DeliveryCharges.jsx";
import MedicineSubadmin from "./SubAdmin/Pages/Vendor/Pharmacy/Medicines.jsx";
import MedicineProductsSubadmin from "./SubAdmin/Pages/Vendor/Pharmacy/MedicineProduct.jsx";


import AdminVideoUpload from "./Admin/components/Video/VideoUpload.jsx";
import MembershipPlansList from "./Admin/components/Doctor/Membership.jsx";
import AboutUsEditor from "./Admin/components/AboutUs.jsx";
import SciencePageEditor from "./Admin/components/SciencePage.jsx";
import AdminCancellationSettings from "./Admin/components/CancelCharge/CancelCharge.jsx";
import AdminCancelledOrders from "./Admin/components/CancelCharge/CancelledOrders.jsx";
import SubAdminProfile from "./SubAdmin/Pages/Profile.jsx";
import Subadminpassword from "./SubAdmin/Pages/ChangePassword.jsx";
import SubadminAboutUsEditor from "./SubAdmin/Pages/User/AboutUs.jsx";
import SubadminScienceEditor from "./SubAdmin/Pages/User/Science.jsx";
import ContactAdmin from "./Admin/components/ContactUs.jsx";
import FooterManagement from "./Admin/components/FooterManagement.jsx";
import CutoffSettingsPanel from "./Admin/components/Revenue/CutoffSettings.jsx";
import DashboardRevenue from "./Admin/components/Revenue/DashboardRevenue.jsx";
import RevenueAdmin from "./Admin/components/Revenue/RevenueAdmin.jsx";
import VendorEarnings from "./Admin/components/Revenue/VendorEarnings.jsx";
import AdminSummary from "./Admin/components/Revenue/RevenueSummary.jsx";
import UploadBrandImage from "./Admin/components/Vendor/Pharmacy/UploadBrandImage.jsx";
import UploadSubBrandImage from "./SubAdmin/Pages/Vendor/Pharmacy/UploadSubBrandImage.jsx";
import FooterContent from "./SubAdmin/Pages/User/FooterContent.jsx";
import VideoUpload from "./SubAdmin/Pages/User/VideoUpload.jsx";
import ContactUs from "./SubAdmin/Pages/User/ContactUs.jsx";
import MaxDistManage from "./Admin/components/MaxLimit.jsx";
import MaxDistManageSub from "./SubAdmin/Pages/User/MaxLimit.jsx";
import SubAdminCancellationSettings from "./SubAdmin/Pages/User/CancellationCharges.jsx";
import MembershipPlansListSub from "./SubAdmin/Pages/Doctor/Membership.jsx";
import CareProgramAdmin from "./Admin/components/CareProgramPage.jsx";
import CareProgramAdminSub from "./SubAdmin/Pages/User/CareProgramSubadmin.jsx";
import AdminPayoutPanel from "./Admin/components/Revenue/AdminPayoutPanel.jsx";
import BankSettings from "./VendorPanel/Pages/PharmacyVendor/BankSettings.js";
import PendingMedicinesProducts from "./Admin/components/Vendor/Pharmacy/PendingMedicineProduct.jsx";
import BankSettingsDoctor from "./DoctorPanel/Pages/DoctorBankDetai.jsx";
import BankSettingsClinic from "./ClinicPanel/Pages/ClinicBankDetail.jsx";
import PendingMedicinesSubadmin from "./SubAdmin/Pages/Vendor/Pharmacy/MedicineApproval.jsx";
import PendingMedicinesProductSub from "./SubAdmin/Pages/Vendor/Pharmacy/MedicineProductApprove.jsx";
import SampleCollected from "./VendorPanel/Pages/LabVendor/SampleCollected.jsx";
import LabOrderHistory from "./VendorPanel/Pages/LabVendor/LabOrderHistory.jsx";

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

  const doctorPanelPath = pathname.startsWith("/doctor"); //Doctor Panel
  const doctorLoginPath = pathname.startsWith("/doctors"); //Doctor Login

  const clinicPanelPath = pathname.startsWith("/clinic");
  const clinicLoginPath = pathname.startsWith("/clinics"); // For login/register pages

  const subAdminPanelPath = pathname.startsWith("/subadmin-dashboard");
  const subAdminLoginPath = pathname.startsWith("/subadmin"); // For login pages

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
            
              path="/dashboard/cutoff-settings"
              element={
                <Protect>
                  <CutoffSettingsPanel />
                </Protect>
              }
            />
            <Route
            
              path="/dashboard/payout-settings"
              element={
                <Protect>
                  <AdminPayoutPanel />
                </Protect>
              }
            />
            <Route
            
              path="/dashboard/revenue-page"
              element={
                <Protect>
                  <DashboardRevenue />
                </Protect>
              }
            />
            <Route
              path="/dashboard/revenue"
              element={
                <Protect>
                  <RevenueAdmin />
                </Protect>
              }
            />
            <Route
              path="/dashboard/upload-brand-image"
              element={
                <Protect>
                  <UploadBrandImage />
                </Protect>
              }
            />
            <Route
              path="/dashboard/vendor-earnings"
              element={
                <Protect>
                  <VendorEarnings />
                </Protect>
              }
            />
            <Route
              path="/dashboard/admin-summary"
              element={
                <Protect>
                  <AdminSummary />
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
              path="/dashboard/lab/test-create"
              element={
                <Protect>
                  <LabTestCreate />
                </Protect>
              }
            />
            <Route
              path="/dashboard/lab/delivery-charges"
              element={
                <Protect>
                  <LabDeliveryCharges />
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
              path="/dashboard/footer-create"
              element={
                <Protect>
                  <FooterManagement />
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
              path="/dashboard/pending-medicines-products"
              element={
                <Protect>
                  <PendingMedicinesProducts/>
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
            <Route
              path="/dashboard/pending-medicines"
              element={
                <Protect>
                  <PendingMedicines />
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
              path="/dashboard/clinic/specialist"
              element={
                <Protect>
                  <Specialist />
                </Protect>
              } />
            <Route
              path="/dashboard/doctor/insurance"
              element={
                <Protect>
                  <Insurance />
                </Protect>
              } />
            <Route
              path="/dashboard/delivery-charges"
              element={
                <Protect>
                  <DeliveryCharges />
                </Protect>
              } />
              <Route
              path="/dashboard/delivery-charges/food"
              element={
                <Protect>
                  <FoodDeliveryCharges />
                </Protect>
              } />
            <Route
              path="/dashboard/admin/clinic"
              element={
                <Protect>
                  <AdminClinicTable />
                </Protect>
              } />
            <Route
              path="/dashboard/video-upload"
              element={
                <Protect>
                  <AdminVideoUpload />
                </Protect>
              } />
            <Route
              path="/dashboard/admin/clinic-more-info/:clinicId"
              element={
                <Protect>
                  <ViewAdminClinic />
                </Protect>
              } />
            <Route
              path="/dashboard/subadmins"
              element={
                <Protect>
                  <SubAdminList />
                </Protect>
              } />
            <Route
              path="/dashboard/subadmins/create"
              element={
                <Protect>
                  <CreateSubAdmin />
                </Protect>
              } />
            <Route
              path="/dashboard/subadmins/:id"
              element={
                <Protect>
                  <SubAdminDetails />
                </Protect>
              } />
            <Route
              path="/dashboard/subadmins/:id/edit"
              element={
                <Protect>
                  <EditSubAdmin />
                </Protect>
              } />

              <Route
              path="/dashboard/membership-plans"
              element={
                <Protect>
                  <MembershipPlansList />
                </Protect>
              } />
              <Route
              path="/dashboard/care-program-page"
              element={
                <Protect>
                  <CareProgramAdmin />
                </Protect>
              } />
              <Route
              path="/dashboard/about-us"
              element={
                <Protect>
                  <AboutUsEditor />
                </Protect>
              } />
              <Route
              path="/dashboard/contact-admin"
              element={
                <Protect>
                  <ContactAdmin/>
                </Protect>
              } />
              <Route
              path="/dashboard/science-page"
              element={
                <Protect>
                  <SciencePageEditor />
                </Protect>
              } />
              <Route
              path="/dashboard/max-distance"
              element={
                <Protect>
                  <MaxDistManage />
                </Protect>
              } />
              <Route
              path="/dashboard/cancel-charge"
              element={
                <Protect>
                  <AdminCancellationSettings />
                </Protect>
              } />
              <Route
              path="/dashboard/cancel-orders"
              element={
                <Protect>
                  <AdminCancelledOrders />
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
              path="/panel/pending-orders"
              element={
                <Protectlab>
                  <PendingOrders />
                </Protectlab>
              }
            />
            <Route
              path="/panel/accepted-orders"
              element={
                <Protectlab>
                  <AcceptedOrdersLab />
                </Protectlab>
              }
            />
            <Route
              path="/panel/completed-orders"
              element={
                <Protectlab>
                  <CompletedOrders />
                </Protectlab>
              }
            />
            <Route
              path="/panel/revenue"
              element={
                <Protectlab>
                  <Revenue />
                </Protectlab>
              }
            />
            <Route
              path="/panel/assigned-orders"
              element={
                <Protectlab>
                  <AssignedOrdersLab />
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
              path="/panel/services/SampleCollected"
              element={
                <Protectlab>
                  <SampleCollected />
                </Protectlab>
              }
            />
            <Route
              path="/panel/services/LabOrderHistory"
              element={
                <Protectlab>
                  <LabOrderHistory />
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
            <Route
              path="/panel/coupons"
              element={
                <Protectlab>
                  <PharCoupons />
                </Protectlab>
              }
            />
            <Route
              path="/panel/generate-coupon"
              element={
                <Protectlab>
                  <PharGenerateCoupon />
                </Protectlab>
              }
            />
            <Route
              path="/panel/drivers"
              element={
                <Protectlab>
                  <DriversList />
                </Protectlab>
              }
            />
            <Route
              path="/panel/add-driver"
              element={
                <Protectlab>
                  <AddDriver />
                </Protectlab>
              }
            />
            <Route
              path="/panel/My-Availability"
              element={
                <Protectlab>
                  <MyAvailabilityPharmacy />
                </Protectlab>
              }
            />
            <Route path="/panel/edit-profile" element={
              <Protectlab>
                <VendorProfile />
              </Protectlab>
            } />
            <Route path="/panel/password" element={
              <Protectlab>
                <ChangePasswordVendor />
              </Protectlab>
            } />
            <Route path="/panel/documents" element={
              <Protectlab>
                <VendorDocuments />
              </Protectlab>
            } />
            <Route path="/panel/bank-settings" element={
              <Protectlab>
                <BankSettings />
              </Protectlab>
            } />

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

          {/* Orders */}
          <Route path="/pharmacy-dashboard/today-orders" element={
            <ProtectPharmacy>
              <PharTodayOrders />
            </ProtectPharmacy>
          } />
          <Route path="/pharmacy-dashboard/shop-management" element={
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
          <Route
            path="/pharmacy-dashboard/my-availability"
            element={
              <ProtectPharmacy>
                <MyAvailabilityPharmacy />
              </ProtectPharmacy>
            }
          />
          <Route
            path="/pharmacy-dashboard/all-products"
            element={
              <ProtectPharmacy>
                <ProductsList />
              </ProtectPharmacy>
            }
          />
          <Route
            path="/pharmacy-dashboard/all-Medicines"
            element={
              <ProtectPharmacy>
                <MedicinesList />
              </ProtectPharmacy>
            }
          />
          <Route
            path="/pharmacy-dashboard/add-driver"
            element={
              <ProtectPharmacy>
                <AddDriver />
              </ProtectPharmacy>
            }
          />
          <Route
            path="/pharmacy-dashboard/drivers"
            element={
              <ProtectPharmacy>
                <DriversList />
              </ProtectPharmacy>
            }
          />
          <Route path="/pharmacy-dashboard/edit-profile" element={
            <ProtectPharmacy>
              <VendorProfile />
            </ProtectPharmacy>
          } />
          <Route path="/pharmacy-dashboard/password" element={
            <ProtectPharmacy>
              <ChangePasswordVendor />
            </ProtectPharmacy>
          } />
          <Route path="/pharmacy-dashboard/medicines/:id" element={
            <ProtectPharmacy>
              <MedicineDetailsPage />
            </ProtectPharmacy>
          } />
          <Route path="/pharmacy-dashboard/documents" element={
            <ProtectPharmacy>
              <VendorDocuments />
            </ProtectPharmacy>
          } />
          <Route path="/pharmacy-dashboard/revenue" element={
            <ProtectPharmacy>
              <RevenuePharmacy />
            </ProtectPharmacy>
          } />
          <Route path="/pharmacy-dashboard/bank-settings" element={
            <ProtectPharmacy>
              <BankSettings />
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
              path="/food-dashboard"
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
                  <PharCoupons />
                </ProtectFood>
              }
            />
            <Route
              path="/food-dashboard/generate-coupon"
              element={
                <ProtectFood>
                  <PharGenerateCoupon />
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
            <Route
              path="/food-dashboard/drivers"
              element={
                <ProtectFood>
                  <DriversList />
                </ProtectFood>
              }
            />
            <Route
              path="/food-dashboard/add-driver"
              element={
                <ProtectFood>
                  <AddDriver />
                </ProtectFood>
              }
            />
            <Route path="/food-dashboard/edit-profile" element={
              <ProtectFood>
                <VendorProfile />
              </ProtectFood>
            } />
            <Route path="/food-dashboard/password" element={
              <ProtectFood>
                <ChangePasswordVendor />
              </ProtectFood>
            } />
            <Route path="/food-dashboard/documents" element={
              <ProtectFood>
                <VendorDocuments />
              </ProtectFood>
            } />
            <Route path="/food-dashboard/Revenue" element={
              <ProtectFood>
                <OrderRevenue />
              </ProtectFood>
            } />
            <Route path="/food-dashboard/bank-settings" element={
              <ProtectFood>
                <BankSettings />
              </ProtectFood>
            } />

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

  /////////////////////////////////// doctor panel start/////////////////////
  const DoctorLoginRoute = () => {
    return (
      <>
        <Routes>
          <Route path="/doctors/login" element={<DoctorLogin />} />
          <Route path="/doctors/register" element={<DoctorRegister />} />
        </Routes>
      </>
    );
  };

  const DoctorPanel = () => {
    return (
      <IndexDoctor>
        <Routes>

          <Route
            path="/doctor/dashboard"
            element={
              <ProtectDoctor>
                <DoctorDashboard />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectDoctor>
                <DoctorProfile />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/edit-profile"
            element={
              <ProtectDoctor>
                <DoctorEditProfile />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/change-password"
            element={
              <ProtectDoctor>
                <DoctorChangePassword />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectDoctor>
                <DoctorAppointments />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/consultation-history"
            element={
              <ProtectDoctor>
                <DoctorConsultationHistory />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectDoctor>
                <DoctorPatients />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/bank-settings"
            element={
              <ProtectDoctor>
                <BankSettingsDoctor />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/documents"
            element={
              <ProtectDoctor>
                <DoctorDocuments />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/coupon"
            element={
              <ProtectDoctor>
                <DoctorCouponManagement />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/availability"
            element={
              <ProtectDoctor>
                <DoctorAvailability />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/fees"
            element={
              <ProtectDoctor>
                <ConsultationFeesComponent />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/Prescription"
            element={
              <ProtectDoctor>
                <DoctorPrescription />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/policy"
            element={
              <ProtectDoctor>
                <PrivacyPolicyManagement />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/rating"
            element={
              <ProtectDoctor>
                <DoctorRatings />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/qualification"
            element={
              <ProtectDoctor>
                <QualificationsManagement />
              </ProtectDoctor>
            }
          />
          <Route
            path="/doctor/revenue"
            element={
              <ProtectDoctor>
                <RevenueDoctor />
              </ProtectDoctor>
            }
          />
          
        </Routes>
      </IndexDoctor>
    );
  };

  ///////////////////////////////////// clinic panel start/////////////////////
  const ClinicLoginRoute = () => {
    return (
      <>
        <Routes>
          <Route path="/clinics/login" element={<ClinicLogin />} />
          <Route path="/clinics/register" element={<ClinicRegister />} />
        </Routes>
      </>
    );
  };

  const ClinicPanel = () => {
    return (
      <IndexClinic>
        <Routes>
          <Route
            path="/clinic/dashboard"
            element={
              <ProtectClinic>
                <ClinicDashboard />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/profile"
            element={
              <ProtectClinic>
                <ClinicProfile />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/edit-profile"
            element={
              <ProtectClinic>
                <ClinicEditProfile />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/doctors"
            element={
              <ProtectClinic>
                <ClinicDoctors />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/documents"
            element={
              <ProtectClinic>
                <ClinicDocuments />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/achievements"
            element={
              <ProtectClinic>
                <ClinicAchievements />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/services"
            element={
              <ProtectClinic>
                <ClinicServices />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/appointments"
            element={
              <ProtectClinic>
                <ClinicAppointmentHistory />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/change-password"
            element={
              <ProtectClinic>
                <ClinicChangePassword />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/Timings"
            element={
              <ProtectClinic>
                <ClinicTimings />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/revenue"
            element={
              <ProtectClinic>
                <ClinicRevenue />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/bank-settings"
            element={
              <ProtectClinic>
                <BankSettingsClinic />
              </ProtectClinic>
            }
          />
          <Route
            path="/clinic/video-consultation"
            element={
              <ProtectClinic>
                <VideoCallComponent />
              </ProtectClinic>
            }
          />
        </Routes>
      </IndexClinic>
    );
  };

  ////////////////////////////////////// Sub-Admin Routes Start //////////////////////

  // Sub-Admin Login Route
  const SubAdminLoginRoute = () => {
    return (
      <>
        <Routes>
          <Route path="/subadmin/login" element={<SubAdminLogin />} />
        </Routes>
      </>
    );
  };

  // Sub-Admin Panel Routes
  const SubAdminPanel = () => {
    return (
      <IndexSubAdmin>
        <Routes>
          <Route
            path="/subadmin-dashboard"
            element={
              <ProtectSubAdmin>
                <SubAdminDashboard />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/edit-profile"
            element={
              <ProtectSubAdmin>
                <SubAdminProfile />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/password"
            element={
              <ProtectSubAdmin>
                <Subadminpassword />
              </ProtectSubAdmin>
            }
          />

          <Route
            path="/subadmin-dashboard/Clinic"
            element={
              <ProtectSubAdmin>
                <SubAdminClinicTable />
              </ProtectSubAdmin>
            } />
          <Route
            path="/subadmin-dashboard/Clinic/:clinicId"
            element={
              <ProtectSubAdmin>
                <ViewSubAdminClinic />
              </ProtectSubAdmin>
            } />
          <Route
            path="/subadmin-dashboard/Clinic/specialists"
            element={
              <ProtectSubAdmin>
                <SubadminSpecialists />
              </ProtectSubAdmin>
            } />
          
          <Route
            path="/subadmin-dashboard/brand-images/pharmacy"
            element={
              <ProtectSubAdmin>
                <UploadSubBrandImage />
              </ProtectSubAdmin>
            } />
          
          <Route
            path="/subadmin-dashboard/membership-plans"
            element={
              <ProtectSubAdmin>
                <MembershipPlansListSub />
              </ProtectSubAdmin>
            } />
          
          <Route
            path="/subadmin-dashboard/max-distance"
            element={
              <ProtectSubAdmin>
                <MaxDistManageSub />
              </ProtectSubAdmin>
            } />
          
          <Route
            path="/subadmin-dashboard/footer"
            element={
              <ProtectSubAdmin>
                <FooterContent />
              </ProtectSubAdmin>
            } />
          <Route
            path="/subadmin-dashboard/video-upload"
            element={
              <ProtectSubAdmin>
                <VideoUpload />
              </ProtectSubAdmin>
            } />
          <Route
            path="/subadmin-dashboard/contactUs"
            element={
              <ProtectSubAdmin>
                <ContactUs />
              </ProtectSubAdmin>
            } />
          <Route
            path="/subadmin-dashboard/doctor"
            element={
              <ProtectSubAdmin>
                <DoctorSubadmin />
              </ProtectSubAdmin>
            } />
          <Route
            path="/subadmin-dashboard/ViewDoctor/:id"
            element={
              <ProtectSubAdmin>
                <ViewDoctorSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/doctor/insurance"
            element={
              <ProtectSubAdmin>
                <InsuranceTypeSubadmin />
              </ProtectSubAdmin>
            } />

          <Route
            path="/subadmin-dashboard/user"
            element={
              <ProtectSubAdmin>
                <UserManagementSubadmin />
              </ProtectSubAdmin>
            } />
          <Route
            path="/subadmin-dashboard/user/blogs"
            element={
              <ProtectSubAdmin>
                <UserBlogsSubadmin />
              </ProtectSubAdmin>
            } />
          <Route
            path="/subadmin-dashboard/user/about-us"
            element={
              <ProtectSubAdmin>
                <SubadminAboutUsEditor />
              </ProtectSubAdmin>
            } />
          <Route
            path="/subadmin-dashboard/user/science"
            element={
              <ProtectSubAdmin>
                <SubadminScienceEditor />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/food"
            element={
              <ProtectSubAdmin>
                <ViewFoodSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            
            path="/subadmin-dashboard/cancellation-settings"
            element={
              <ProtectSubAdmin>
                <SubAdminCancellationSettings />
              </ProtectSubAdmin>
            } />

            <Route
            path="/subadmin-dashboard/upload-food"
            element={
              <ProtectSubAdmin>
                <UploadFoodSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/food/:id"
            element={
              <ProtectSubAdmin>
                <FoodIdSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/food/delivery-charges"
            element={
              <ProtectSubAdmin>
                <FoodDeliveryChargesSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/lab"
            element={
              <ProtectSubAdmin>
                <UserLabSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/lab/delivery-charges"
            element={
              <ProtectSubAdmin>
                <LabDeliveryChargesSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/lab/ViewLab/:id"
            element={
              <ProtectSubAdmin>
                <ViewLabSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/labtest"
            element={
              <ProtectSubAdmin>
                <CreateTestSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/care-program-page"
            element={
              <ProtectSubAdmin>
                <CareProgramAdminSub />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/pharmacy"
            element={
              <ProtectSubAdmin>
                <PharmacySubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/pharmacy/approve-medicine"
            element={
              <ProtectSubAdmin>
                <ApprovalMedicineSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/pharmacy/view/:id"
            element={
              <ProtectSubAdmin>
                <PharmacyViewSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/pharmacy/delivery-charges"
            element={
              <ProtectSubAdmin>
                <DeliveryChargesSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/pharmacy/medicine"
            element={
              <ProtectSubAdmin>
                <MedicineSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/pharmacy/medicine-products"
            element={
              <ProtectSubAdmin>
                <MedicineProductsSubadmin />
              </ProtectSubAdmin>
            } />
            <Route
            path="/subadmin-dashboard/pharmacy/medicine-products-approve"
            element={
              <ProtectSubAdmin>
                <PendingMedicinesProductSub />
              </ProtectSubAdmin>
            } />
      


          {/* <Route
            path="/subadmin-dashboard/all-users"
            element={
              <ProtectSubAdmin>
                <UserManagement />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/new-users"
            element={
              <ProtectSubAdmin>
                <UserManagement />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/user-reports"
            element={
              <ProtectSubAdmin>
                <UserManagement />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/blog-posts"
            element={
              <ProtectSubAdmin>
                <ContentManagement />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/health-articles"
            element={
              <ProtectSubAdmin>
                <ContentManagement />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/faq-management"
            element={
              <ProtectSubAdmin>
                <ContentManagement />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/vendor-approvals"
            element={
              <ProtectSubAdmin>
                <VendorApprovals />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/all-vendors"
            element={
              <ProtectSubAdmin>
                <VendorApprovals />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/vendor-performance"
            element={
              <ProtectSubAdmin>
                <VendorApprovals />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/open-tickets"
            element={
              <ProtectSubAdmin>
                <SupportTickets />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/resolved-tickets"
            element={
              <ProtectSubAdmin>
                <SupportTickets />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/analytics"
            element={
              <ProtectSubAdmin>
                <AnalyticsReports />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/email-templates"
            element={
              <ProtectSubAdmin>
                <AnalyticsReports />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/notification-settings"
            element={
              <ProtectSubAdmin>
                <AnalyticsReports />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/edit-profile"
            element={
              <ProtectSubAdmin>
                <UserManagement />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/password"
            element={
              <ProtectSubAdmin>
                <UserManagement />
              </ProtectSubAdmin>
            }
          />
          <Route
            path="/subadmin-dashboard/activity-log"
            element={
              <ProtectSubAdmin>
                <UserManagement />
              </ProtectSubAdmin>
            }
          /> */}
        </Routes>
      </IndexSubAdmin>
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
              : doctorLoginPath
                ? DoctorLoginRoute()
                : clinicLoginPath
                  ? ClinicLoginRoute()
                  : foodVendorPath
                    ? foodRoutes()
                    : pharmacyVendorPath
                      ? pharmacyRoutes()
                      : doctorPanelPath
                        ? DoctorPanel()
                        : clinicPanelPath
                          ? ClinicPanel()
                          : subAdminPanelPath
                            ? SubAdminPanel()
                            : subAdminLoginPath
                              ? SubAdminLoginRoute()
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