import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../Context/Context";
import { Link } from "react-router-dom";
import download from "../Assests/images/download.jpeg";
import Loading from "../../Components/Loading";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import "chart.js/auto";
import "../Assests/css/Admin.css";
import AOS from 'aos';

const Dashboard = () => {
  const {
    vendorLists,
    getAllVendorList,
    getVendor,
    isLoading,
    pharmacy,
    getPharmacist,
    userS,
    userList,
    getfirstuser,
    firstuser,
    error,
    doctorStats,
    fetchDoctorStats,
    loading,
    fetchuserstats,
    userstats,
    labstats,
    fetchlabstats,
    pharmacystats,
    fetchpharmacystats,
    fetchfoodstats,
    foodstats,
    foodVendors,
    getAllFoodVendors,
    doctors,
    getDoctors,
    adminClinic,
    getAdminClinic,
    fetchclinicstats,
    clinicstats,
    // Global filter-related props
    globalFilters,
    availableLocations,
    loadingFilters,
    updateGlobalFilters,
    clearGlobalFilters,
    refreshAllData,
    fetchLocationData
  } = useContext(MyContext);
  
  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement);

  const [activeTab, setActiveTab] = useState("vendor");
  const URL = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    // Set India as default country on component mount
    if (!globalFilters.country) {
      handleFilterChange('country', 'India');
    }
    
    // Initial data fetch
    refreshAllData();
    fetchLocationData();
    
    AOS.init({
      duration: 1000, 
      easing: 'ease-in-out', 
      once: true, 
    });
  }, []);

  // Filter change handler
  const handleFilterChange = async (filterType, value) => {
    const newFilters = { 
      ...globalFilters, 
      [filterType]: value,
      // Reset dependent filters
      ...(filterType === 'country' && { state: '', city: '' }),
      ...(filterType === 'state' && { city: '' })
    };
    
    await updateGlobalFilters(newFilters);
  };

  // Clear all filters (but keep India as default)
  const clearFilters = async () => {
    await updateGlobalFilters({
      country: 'India',
      state: '',
      city: ''
    });
  };

  // Check if any custom filters are applied (other than default India)
  const hasCustomFilters = () => {
    return globalFilters.state || globalFilters.city || (globalFilters.country && globalFilters.country !== 'India');
  };

  if (isLoading) {
    return <Loading />;
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Function to handle image errors
  const handleImageError = (e) => {
    e.target.src = download;
  };

  // Chart Data for doctor
  const barChartData = {
    labels: (doctorStats || []).map((stat) => {
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      return `${monthNames[stat.month - 1]} ${stat.year}`;
    }),
    datasets: [
      {
        label: "Number of Doctors",
        data: (doctorStats || []).map((stat) => stat.count),
        backgroundColor: (doctorStats || []).map((_, index) =>
          index < 6 ? "#3D3F96" : "red"
        ),
        borderColor: "#1e88e5",
        borderWidth: 1,
      },
    ],
  };
  
  // Chart Options doctor
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 18,
            family: "Arial",
          },
          color:"black",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Doctors",
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };
  
  // Chart Data for users
  const barChartData1 = {
    labels: (userstats || []).map((stat) => {
      const monthName = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      return `${monthName[stat.month - 1]} ${stat.year}`;
    }),
    datasets: [
      {
        label: "Number of Users",
        data: (userstats || []).map((stat) => stat.count),
        backgroundColor: (userstats || []).map((_, index) =>
          index % 2 === 0 ? "red" : "#3D3F96"
        ),
        borderColor: "#1e88e5",
        borderWidth: 1,
        height:"350px,"
      },
    ],
  };
  
  // Chart Options for users
  const barChartOptions1 = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 18,
            family: "Arial",
          },
          color: "#333",
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Users",
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  // Doughnut Chart for Labs
  const doughnutChartData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Monthly Lab Stats",
        data: (labstats || []).map((stat) => stat.count),
        backgroundColor: (labstats || []).map((_, index) =>
          index % 2 === 0 ? "#3D3F96" : "red"
        ),
        hoverOffset: 8,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          font: {
            size: 14,
            family: "Arial",
          },
          color: "#333",
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem) {
            const count = tooltipItem.raw;
            const month = doughnutChartData.labels[tooltipItem.dataIndex];
            return `${month}: ${count} labs`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  // Chart Data for Pharmacy
  const barChartData3 = {
    labels: (pharmacystats || []).map((stat) => {
      const monthName = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      return `${monthName[stat.month - 1]} ${stat.year}`;
    }),
    datasets: [
      {
        label: "Number of Pharmacies",
        data: (pharmacystats || []).map((stat) => stat.count),
        backgroundColor: (pharmacystats || []).map((_, index) =>
          index % 2 === 0 ? "red" : "#3D3F96"
        ),
        borderColor: "#1e88e5",
        borderWidth: 1,
      },
    ],
  };

  // Chart Options for Pharmacy
  const barChartOptions3 = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 18,
            family: "Arial",
          },
          color: "#333",
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Pharmacies",
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  // Chart Data for Food Vendors
  const barChartData4 = {
    labels: (foodstats || []).map((stat) => {
      const monthName = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      return `${monthName[stat.month - 1]} ${stat.year}`;
    }),
    datasets: [
      {
        label: "Number of Food Vendors",
        data: (foodstats || []).map((stat) => stat.count),
        backgroundColor: (foodstats || []).map((_, index) =>
          index % 2 === 0 ? "#e74c3c" : "#3498db"
        ),
        borderColor: "#1e88e5",
        borderWidth: 1,
      },
    ],
  };

  // Chart Options for Food Vendors
  const barChartOptions4 = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 18,
            family: "Arial",
          },
          color: "#333",
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Food Vendors",
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  // Chart Data for Clinics
  const clinicChartData = {
    labels: (clinicstats?.data || []).map((stat) => {
      const monthName = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      return `${monthName[stat.month - 1]} ${stat.year}`;
    }),
    datasets: [
      {
        label: "Number of Clinics",
        data: (clinicstats?.data || []).map((stat) => stat.count),
        backgroundColor: (clinicstats?.data || []).map((_, index) =>
          index % 2 === 0 ? "#27ae60" : "#2ecc71"
        ),
        borderColor: "#16a085",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart Options for Clinics
  const clinicChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 18,
            family: "Arial",
          },
          color: "#333",
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Clinics",
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  // Doughnut Chart for Clinic Status Distribution
  const clinicStatusData = {
    labels: ["Verified", "Pending", "Rejected"],
    datasets: [
      {
        label: "Clinic Status",
        data: [
          (adminClinic?.data?.clinics || adminClinic || []).filter(clinic => clinic.Accountverify === "1").length,
          (adminClinic?.data?.clinics || adminClinic || []).filter(clinic => clinic.Accountverify === "0").length,
          (adminClinic?.data?.clinics || adminClinic || []).filter(clinic => clinic.Accountverify === "2").length,
        ],
        backgroundColor: ["#27ae60", "#f39c12", "#e74c3c"],
        hoverOffset: 8,
      },
    ],
  };

  const clinicStatusOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          font: {
            size: 14,
            family: "Arial",
          },
          color: "#333",
        },
      },
    },
  };

  return (
    <>
      <div>
        {/* Global Filters Section */}
        <div className="container-fluid mb-4">
          <div className="row filter-section" data-aos="fade-down">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title mb-0" style={{ color: "#3D3F96" }}>
                      <i className="fas fa-globe me-2"></i>
                      Global Location Filters
                    </h5>
                    {hasCustomFilters() && (
                      <span className="badge bg-primary">
                        Active Filters
                      </span>
                    )}
                  </div>
                  
                  <div className="row g-3 align-items-end">
                    {/* Country Filter */}
                    <div className="col-md-3">
                      <label className="form-label fw-bold">Country</label>
                      <select 
                        className="form-select"
                        value={globalFilters.country || 'India'}
                        onChange={(e) => handleFilterChange('country', e.target.value)}
                        disabled={loadingFilters}
                      >
                        <option value="India">India</option>
                        {availableLocations.countries
                          .filter(country => country !== 'India')
                          .map(country => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {/* State Filter */}
                    <div className="col-md-3">
                      <label className="form-label fw-bold">State</label>
                      <select 
                        className="form-select"
                        value={globalFilters.state}
                        onChange={(e) => handleFilterChange('state', e.target.value)}
                        disabled={loadingFilters || !globalFilters.country}
                      >
                        <option value="">All States</option>
                        {availableLocations.states.map(state => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City Filter */}
                    <div className="col-md-3">
                      <label className="form-label fw-bold">City</label>
                      <select 
                        className="form-select"
                        value={globalFilters.city}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                        disabled={loadingFilters || !globalFilters.state}
                      >
                        <option value="">All Cities</option>
                        {availableLocations.cities.map(city => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-md-3 d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary me-2"
                        onClick={clearFilters}
                        disabled={loadingFilters}
                      >
                        <i className="fas fa-times me-1"></i>
                        Reset
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={refreshAllData}
                        disabled={loadingFilters}
                      >
                        {loadingFilters ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-1"></i>
                            Applying...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-sync-alt me-1"></i>
                            Refresh
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {hasCustomFilters() && (
                    <div className="mt-3 p-3 bg-light rounded">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            <strong>Currently Applied Filters:</strong>
                          </small>
                          <span className="badge bg-secondary ms-2">
                            Country: {globalFilters.country}
                          </span>
                          {globalFilters.state && (
                            <span className="badge bg-primary ms-2">
                              State: {globalFilters.state}
                            </span>
                          )}
                          {globalFilters.city && (
                            <span className="badge bg-success ms-2">
                              City: {globalFilters.city}
                            </span>
                          )}
                        </div>
                        <small className="text-success">
                          <i className="fas fa-check-circle me-1"></i>
                          All data is filtered accordingly
                        </small>
                      </div>
                    </div>
                  )}

                  {/* Default Filter Info */}
                  {/* {!hasCustomFilters() && (
                    <div className="mt-3 p-3 bg-info bg-opacity-10 rounded">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-info-circle text-info me-2"></i>
                        <small className="text-info">
                          <strong>Default Filter:</strong> Showing data for India. Use filters above to view data for other locations.
                        </small>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="">
          <div className="app-content-area">
            <div
              className="bg-primary pt-10 pb-21 mx-n4"
              style={{ marginTop: "-5rem", backgroundColor: "#3D3F96" }}
            />

            <div className="container-fluid">
              <div className="row">
                <div className="col-md-12">
                  <ul
                    className="nav nav-pills mb-3"
                    id="pills-tab"
                    role="tablist"
                  >
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link px-5 py-3 rounded-3 mx-2 ${
                          activeTab === "vendor" ? "active" : ""
                        }`}
                        id="pills-home-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#pills-home"
                        type="button"
                        role="tab"
                        aria-controls="pills-home"
                        aria-selected={activeTab === "vendor"}
                        style={{
                          backgroundColor:
                            activeTab === "vendor" ? "#3D3F96" : "",
                          color: activeTab === "vendor" ? "white" : "#3D3F96",
                        }}
                        onClick={() => handleTabClick("vendor")}
                      >
                        Vendor
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link px-5 py-3 rounded-3 mx-2 ${
                          activeTab === "user" ? "active" : ""
                        }`}
                        id="pills-profile-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#pills-profile"
                        type="button"
                        role="tab"
                        aria-controls="pills-profile"
                        aria-selected={activeTab === "user"}
                        style={{
                          backgroundColor:
                            activeTab === "user" ? "#3D3F96" : "",
                          color: activeTab === "user" ? "white" : "#3D3F96",
                        }}
                        onClick={() => handleTabClick("user")}
                      >
                        User
                      </button>
                    </li>
                    
                  </ul>
                  <div className="tab-content" id="pills-tabContent">
                    {/* Vendor Tab Content */}
                    <div
                      className="tab-pane fade show active"
                      id="pills-home"
                      role="tabpanel"
                      aria-labelledby="pills-home-tab"
                    >
                      <div className="container-fluid mt-n22 ">
                        <div className="row">
                          <div className="col-12">
                            {/* <h1 className="display-6 fw-bold mb-5 px-3">
                              Vendors:
                            </h1> */}
                          </div>
                          
                          {/* Lab Vendor Card */}
                          <Link
                            to="/dashboard/lab/user"
                            className="col-xl-3 col-lg-6 col-md-12 col-12 mb-5"
                          >
                            <div className="card h-100 card-lift">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h3 className="mb-0">Lab</h3>
                                  </div>
                                  <div className="icon-shape icon-md bg-primary-soft text-primary rounded-2">
                                    <i className="fas fa-flask fa-lg"></i>
                                  </div>
                                </div>
                                <div className="lh-sm">
                                  <h4 className="mb-3 fw-bold">
                                    {vendorLists?.length || 0}
                                  </h4>
                                </div>
                                {(vendorLists || []).length > 0 ? (
                                  vendorLists
                                    .slice(0, 5)
                                    .map((vendor, index) => (
                                      <img
                                        key={index}
                                        src={
                                          vendor.image
                                            ? `${URL}/${vendor.image}`
                                            : download
                                        }
                                        alt={`Vendor ${index}`}
                                        className="vendor-avatar"
                                        onError={handleImageError}
                                      />
                                    ))
                                ) : (
                                  <img
                                    src={download}
                                    alt="Fallback Vendor"
                                    className="vendor-avatar"
                                  />
                                )}
                              </div>
                            </div>
                          </Link>
                          
                          {/* Pharmacy Vendor Card */}
                          <Link
                            to="/dashboard/pharmacy"
                            className="col-xl-3 col-lg-6 col-md-12 col-12 mb-5"
                          >
                            <div className="card h-100 card-lift">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h3 className="mb-0">Pharmacy</h3>
                                  </div>
                                  <div className="icon-shape icon-md bg-primary-soft text-primary rounded-2">
                                    <i className="fas fa-prescription-bottle fa-lg"></i>
                                  </div>
                                </div>
                                <div className="lh-sm">
                                  <h4 className="mb-3 fw-bold">
                                    {pharmacy?.length || 0}
                                  </h4>
                                </div>
                                {(pharmacy || []).length > 0 ? (
                                  pharmacy.slice(0, 5).map((vendor, index) => (
                                    <img
                                      key={index}
                                      src={
                                        vendor.image
                                          ? `${URL}/${vendor.image}`
                                          : download
                                      }
                                      alt={`Vendor ${index}`}
                                      className="vendor-avatar"
                                      onError={handleImageError}
                                    />
                                  ))
                                ) : (
                                  <img
                                    src={download}
                                    alt="Fallback Vendor"
                                    className="vendor-avatar"
                                  />
                                )}
                              </div>
                            </div>
                          </Link>

                          {/* Clinic Vendor Card */}
                          <Link
                            to="/dashboard/admin/clinic"
                            className="col-xl-3 col-lg-6 col-md-12 col-12 mb-5"
                          >
                            <div className="card h-100 card-lift">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h3 className="mb-0">Clinic</h3>
                                  </div>
                                  <div className="icon-shape icon-md bg-primary-soft text-primary rounded-2">
                                    <i className="fas fa-clinic-medical fa-lg"></i>
                                  </div>
                                </div>
                                <div className="lh-sm">
                                  <h4 className="mb-3 fw-bold">
                                    {adminClinic?.data?.clinics?.length || adminClinic?.length || 0}
                                  </h4>
                                </div>
                                {((adminClinic?.data?.clinics || adminClinic) || []).length > 0 ? (
                                  (adminClinic?.data?.clinics || adminClinic)
                                    .slice(0, 5)
                                    .map((clinic, index) => (
                                      <img
                                        key={index}
                                        src={
                                          clinic.image
                                            ? `${URL}/${clinic.image}`
                                            : download
                                        }
                                        alt={`Clinic ${index}`}
                                        className="vendor-avatar"
                                        onError={handleImageError}
                                      />
                                    ))
                                ) : (
                                  <img
                                    src={download}
                                    alt="Fallback Clinic"
                                    className="vendor-avatar"
                                  />
                                )}
                              </div>
                            </div>
                          </Link>
                          
                          {/* Food Vendor Card */}
                          <Link
                            to="/dashboard/viewFood"
                            className="col-xl-3 col-lg-6 col-md-12 col-12 mb-5"
                          >
                            <div className="card h-100 card-lift">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h3 className="mb-0">Food</h3>
                                  </div>
                                  <div className="icon-shape icon-md bg-primary-soft text-primary rounded-2">
                                    <i className="fas fa-utensils fa-lg"></i>
                                  </div>
                                </div>
                                <div className="lh-sm">
                                  <h4 className="mb-3 fw-bold">
                                    {foodVendors?.length || 0}
                                  </h4>
                                </div>
                                {(foodVendors || []).length > 0 ? (
                                  foodVendors
                                    .slice(0, 5)
                                    .map((vendor, index) => (
                                      <img
                                        key={index}
                                        src={
                                          vendor.image
                                            ? `${URL}/${vendor.image}`
                                            : download
                                        }
                                        alt={`Vendor ${index}`}
                                        className="vendor-avatar"
                                        onError={handleImageError}
                                      />
                                    ))
                                ) : (
                                  <img
                                    src={download}
                                    alt="Fallback Vendor"
                                    className="vendor-avatar"
                                  />
                                )}
                              </div>
                            </div>
                          </Link>
                          
                          {/* Doctors Card */}
                          <Link
                            to="/dashboard/doctor"
                            className="col-xl-3 col-lg-6 col-md-12 col-12 mb-5"
                          >
                            <div className="card h-100 card-lift">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h3 className="mb-0">Doctors</h3>
                                  </div>
                                  <div className="icon-shape icon-md bg-primary-soft text-primary rounded-2">
                                    <i className="fas fa-user-md fa-lg"></i>
                                  </div>
                                </div>
                                <div className="lh-sm">
                                  <h4 className="mb-3 fw-bold">
                                    {doctors?.length 
                                      ? doctors.length 
                                      : (doctorStats || []).reduce((total, stat) => total + stat.count, 0)
                                    }
                                  </h4>
                                </div>
                                <div className="d-flex">
                                  {(doctors || []).length > 0 ? (
                                    doctors.slice(0, 3).map((doctor, index) => (
                                      <img
                                        key={index}
                                        src={
                                          doctor.image
                                            ? `${URL}/${doctor.image}`
                                            : download
                                        }
                                        alt={`Doctor ${index}`}
                                        className="vendor-avatar"
                                        style={{
                                          marginLeft: index === 0 ? "0" : "-10px",
                                        }}
                                        onError={handleImageError}
                                      />
                                    ))
                                  ) : (
                                    [...Array(3)].map((_, index) => (
                                      <img
                                        key={index}
                                        src={download}
                                        alt="Doctor"
                                        className="vendor-avatar"
                                        style={{
                                          marginLeft: index === 0 ? "0" : "-10px",
                                        }}
                                      />
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* User Tab Content */}
                    <div
                      className="tab-pane fade"
                      id="pills-profile"
                      role="tabpanel"
                      aria-labelledby="pills-profile-tab"
                    >
                      <div className="container-fluid mt-n22 ">
                        <div className="row">
                          <div className="col-12">
                            {/* <h1 className="display-6 fw-bold mb-5">Users:</h1> */}
                          </div>
                          <Link
                            to="/dashboard/active"
                            className="col-xl-3 col-lg-6 col-md-12 col-12 mb-5"
                          >
                            <div className="card h-100 card-lift">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h3 className="mb-0">Users</h3>
                                  </div>
                                  <div className="icon-shape icon-md bg-primary-soft text-primary rounded-2">
                                    <i className="fas fa-users fa-lg"></i>
                                  </div>
                                </div>
                                <div className="lh-sm">
                                  <h4 className="mb-3 fw-bold">
                                    {userList?.length || 0}
                                  </h4>
                                </div>
                                <div className="d-flex">
                                  {(userList || []).length > 0 ? (
                                    userList
                                      .slice(0, 3)
                                      .map((vendor, index) => (
                                        <img
                                          key={index}
                                          src={
                                            vendor.image
                                              ? `${URL}/${vendor.image}`
                                              : download
                                          }
                                          alt={`User ${index}`}
                                          className="vendor-avatar"
                                          style={{
                                            marginLeft: index === 0 ? "0" : "-10px",
                                          }}
                                          onError={handleImageError}
                                        />
                                      ))
                                  ) : (
                                    <img
                                      src={download}
                                      alt="Fallback User"
                                      className="vendor-avatar"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="container">
        <div className="row">
          {/* Doctors Chart */}
          <div className="col-md-6 border py-3 border-2 d-flex justify-content-center align-items-center">
            {loading && <p>Loading chart data...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
              <div className="chart-container">
                <div className="leftside-chart" data-aos="flip-left"
                  data-aos-easing="ease-out-cubic"
                  data-aos-duration="2000">
                  {(doctorStats || []).length > 0 ? (
                    <Bar data={barChartData} options={barChartOptions} />
                  ) : (
                    <p className="text-center">No Doctor data available for chart</p>
                  )}
                </div>
                <p className="chart-summary">
                  Total Doctors:{" "}
                  {(doctorStats || []).reduce((total, stat) => total + stat.count, 0)}
                </p>
              </div>
            )}
          </div>

          {/* Users Chart */}
          <div className="col-md-6 border py-3 border-2 d-flex justify-content-center align-items-center">
            {loading && <p>Loading chart data...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
              <div className="chart-container">
                <div className="rightside-chart" data-aos="flip-left"
                  data-aos-easing="ease-out-cubic"
                  data-aos-duration="2000">
                  {(userstats || []).length > 0 ? (
                    <Bar data={barChartData1} options={barChartOptions1} />
                  ) : (
                    <p className="text-center">No User data available for chart</p>
                  )}
                </div>
                <p className="chart-summary">
                  Total Users:{" "}
                  {(userstats || []).reduce((total, stat) => total + stat.count, 0)}
                </p>
              </div>
            )}
          </div>
        </div>

        <h4 className="py-3 text-center abhiii" data-aos="flip-left"
          data-aos-easing="ease-out-cubic"
          data-aos-duration="2000">
          Charts of Pharmacies and Labs
        </h4>

        <div className="row justify-content-center">
          {/* Labs Chart */}
          <div className="col-md-6 border py-3 border-2 d-flex justify-content-center align-items-center">
            {loading && <p>Loading chart data...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
              <div className="chart-container">
                <div className="leftside-chart" data-aos="fade-right">
                  {(labstats || []).length > 0 ? (
                    <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                  ) : (
                    <p className="text-center">No Lab data available for chart</p>
                  )}
                </div>
                <p className="chart-summary">
                  Total Labs:{" "}
                  {(labstats || []).reduce((total, stat) => total + stat.count, 0)}
                </p>
              </div>
            )}
          </div>

          {/* Pharmacy Chart */}
          <div className="col-md-6 border py-3 border-2 d-flex justify-content-center align-items-center">
            {loading && <p>Loading chart data...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
              <div className="chart-container">
                <div className="rightside-chart" data-aos="fade-right"
                  data-aos-offset="300"
                  data-aos-easing="ease-in-sine">
                  {(pharmacystats || []).length > 0 ? (
                    <Bar data={barChartData3} options={barChartOptions3} />
                  ) : (
                    <p className="text-center">No Pharmacy data available for chart</p>
                  )}
                </div>
                <p className="chart-summary">
                  Total Pharmacies:{" "}
                  {(pharmacystats || []).reduce((total, stat) => total + stat.count, 0)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Food Vendors Chart */}
        <div className="row d-flex justify-content-center">
          <h3 className="py-3 text-center">Food Vendors</h3>
          <div className="col-md-8 border py-3 border-2 d-flex justify-content-center align-items-center">
            {loading && <p>Loading food vendor data...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
              <div className="chart-container">
                <div className="rightside-chart" 
                  data-aos="fade-right"
                  data-aos-offset="300"
                  data-aos-easing="ease-in-sine">
                  {(foodstats || []).length > 0 ? (
                    <Bar data={barChartData4} options={barChartOptions4} />
                  ) : (
                    <p className="text-center">No Food Vendor data available for chart</p>
                  )}
                </div>
                <p className="chart-summary">
                  Total Food Vendors:{" "}
                  {(foodstats || []).reduce((total, stat) => total + stat.count, 0)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recently Registered Users Table */}
        <div className="row">
          <div data-aos="zoom-out-down">
            <h4 className="py-3 text-center abhiii" data-aos="flip-left"
              data-aos-easing="ease-out-cubic"
              data-aos-duration="2000">
              Recently Registered Users
            </h4>
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="text-white" style={{ backgroundColor: "#3D3F96" }}>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(firstuser || []).length > 0 ? (
                    firstuser.map((user, index) => (
                      <tr key={index}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.number}</td>
                        <td>
                          {user.registeredDate
                            ? new Date(user.registeredDate).toLocaleString()
                            : "No Registration Data"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No users to display
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-center mt-3">
              <button
                onClick={getfirstuser}
                className="refresh-btn"
              >
                Refresh Users
              </button>
            </div>
          </div>
        </div>

        {/* Recently Registered Clinics Table */}
        <div className="row mt-5">
          <div data-aos="zoom-out-down">
            <h4 className="py-3 text-center abhiii" data-aos="flip-left"
              data-aos-easing="ease-out-cubic"
              data-aos-duration="2000">
              Recently Registered Clinics
            </h4>
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="text-white" style={{ backgroundColor: "#27ae60" }}>
                  <tr>
                    <th>Clinic Name</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {((adminClinic?.data?.clinics || adminClinic) || []).length > 0 ? (
                    (adminClinic?.data?.clinics || adminClinic).slice(0, 5).map((clinic, index) => (
                      <tr key={index}>
                        <td>{clinic.clinicName}</td>
                        <td>{clinic.name}</td>
                        <td>{clinic.email}</td>
                        <td>{clinic.phoneNumber}</td>
                        <td>{clinic.city}</td>
                        <td>
                          <span className={`badge ${
                            clinic.Accountverify === "1" ? "bg-success" :
                            clinic.Accountverify === "2" ? "bg-danger" : "bg-warning"
                          }`}>
                            {clinic.Accountverify === "1" ? "Verified" :
                             clinic.Accountverify === "2" ? "Rejected" : "Pending"}
                          </span>
                        </td>
                        <td>
                          {clinic.createdAt
                            ? new Date(clinic.createdAt).toLocaleString()
                            : "No Registration Data"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No clinics to display
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-center mt-3">
              <button
                onClick={getAdminClinic}
                className="refresh-btn"
                style={{ backgroundColor: "#27ae60" }}
              >
                Refresh Clinics
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .filter-section {
          margin-top: 20px;
        }
        .vendor-avatar {
          border-radius: 50%;
          height: 50px;
          width: 50px;
          margin-left: -10px;
          object-fit: cover;
        }
        .chart-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          width: 100%;
          height: auto;
        }
        .chart-summary {
          padding: 20px;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
        }
        .refresh-btn {
          margin-top: 20px;
          padding: 10px 20px;
          border-radius: 20px;
          background-color: #3D3F96;
          color: white;
          border: none;
          cursor: pointer;
        }
        .refresh-btn:hover {
          background-color: #2A2C77;
        }
        .abhiii {
          color: #3D3F96;
          font-weight: bold;
        }
      `}</style>
    </>
  );
};

export default Dashboard;