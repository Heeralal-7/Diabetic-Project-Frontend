import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../Context/Context";
import { Link } from "react-router-dom";
import download from "../Assests/images/download.jpeg";
import Loading from "../../Components/Loading";
import { Bar,Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from "chart.js";
import "chart.js/auto";
import "../Assests/css/Admin.css";
import AOS from 'aos';
const Dashboard1 = () => {
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
    fetchuserstats ,
      userstats, 
      labstats ,
      fetchlabstats,
      pharmacystats,
      fetchpharmacystats,
      fetchfoodstats,
      foodstats,
  } = useContext(MyContext);
  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

  const [activeTab, setActiveTab] = useState("vendor");
  const URL = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    getAllVendorList();

    getVendor();
    getPharmacist();
    userS();
    fetchDoctorStats();
    fetchuserstats();
    fetchlabstats();
    fetchpharmacystats();
    AOS.init({
      duration: 1000, 
      easing: 'ease-in-out', 
      once: true, 
    });
    fetchfoodstats();

  }, []);


  if (isLoading) {
    return <Loading />;
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Chart Data for doctor
  const barChartData = {
    labels: doctorStats.map((stat) => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[stat.month - 1]} ${stat.year}`;
    }),
    datasets: [
      {
        label: "Number of Doctors",
        data: doctorStats.map((stat) => stat.count),
        backgroundColor: doctorStats.map((_, index) =>
          index < 6 ? "#3D3F96" : "red" // First 6 months red, next 6 months blue
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
            size: 18, // Set font size for legend
            family: "Arial", // Set font family for legend
            
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
          stepSize: 1, // Force Y-axis to increment by 1
          beginAtZero: true, // Ensure the axis starts at 0
          callback: function (value) {
            return Number.isInteger(value) ? value : null; // Display only whole numbers
          },
        },
      },
    },
  };
  
  
  const barChartData1 = {
    labels: userstats.map((stat) => {
      const monthName = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthName[stat.month - 1]} ${stat.year}`;
    }),
    datasets: [
      {
        label: "Number of Users",
        data: userstats.map((stat) => stat.count),
        backgroundColor: userstats.map((_, index) =>
          index % 2 === 0 ? "red" : "#3D3F96" // Alternate between red and blue
        ),
        borderColor: "#1e88e5",
        borderWidth: 1,
        height:"350px,"
      },
    ],
  };
  // Chart Options doctor
  const barChartOptions1 = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 18, // Set font size for legend
            family: "Arial", // Set font family for legend
          },
          color: "#333", // Set color for legend text
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
          stepSize: 1, // Increment by 1
          beginAtZero: true, // Start from 0
          callback: function (value) {
            return Number.isInteger(value) ? value : null; // Show only whole numbers
          },
        },
      },
    },
  };




  const doughnutChartData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Monthly Lab Stats",
        data: labstats.map((stat) => stat.count),
        backgroundColor: 
        userstats.map((_, index) =>
          index % 2 === 0 ? "#3D3F96" : "red" // Alternate between red and blue
        ),
        
        hoverOffset: 8, // Slightly enlarge segment on hover
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "right", // Display the legend on the right side
        labels: {
          font: {
            size: 14,
            family: "Arial",
          },
          color: "#333", // Legend text color
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem) {
            const count = tooltipItem.raw;
            const month = doughnutChartData.labels[tooltipItem.dataIndex];
            return `${month}: ${count} users`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };





  const barChartData3 = {
    labels: pharmacystats.map((stat) => {
      const monthName = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      return `${monthName[stat.month - 1]} ${stat.year}`;
    }),
    datasets: [
      {
        label: "Number of pharmacy",
        data: pharmacystats.map((stat) => stat.count),
        backgroundColor: pharmacystats.map((_, index) =>
          index % 2 === 0 ? "red" : "#3D3F96" // Alternate between red and blue
        ),
        borderColor: "#1e88e5",
        borderWidth: 1,
      },
    ],
  };

  // Chart Options
  const barChartOptions3 = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 18, // Set font size for legend
            family: "Arial", // Set font family for legend
          },
          color: "#333", // Set color for legend text
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
          stepSize: 1, // Increment by 1
          beginAtZero: true, // Start from 0
          callback: function (value) {
            return Number.isInteger(value) ? value : null; // Show only whole numbers
          },
        },
      },
    },
  };

// Create bar chart data for food vendors
const barChartData4 = {
  labels: foodstats.map((stat) => {
    const monthName = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${monthName[stat.month - 1]} ${stat.year}`;
  }),
  datasets: [
    {
      label: "Number of Food Vendors",
      data: foodstats.map((stat) => stat.count),
      backgroundColor: foodstats.map((_, index) =>
        index % 2 === 0 ? "#e74c3c" : "#3498db" // Alternate between red and blue
      ),
      borderColor: "#1e88e5",
      borderWidth: 1,
    },
  ],
};

// Chart Options (similar to pharmacy chart)
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
        text: "Vendors",
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








  return (
    <>
      <div>
        <div className="" style={{}}>
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
                          <Link
                            to="/dashboard/lab/user"
                            className="col-xl-3 col-lg-6 col-md-12 col-12 mb-5"
                          >
                            {/* card */}
                            <div className="card h-100 card-lift">
                              {/* card body */}
                              <div className="card-body">
                                {/* heading */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h3 className="mb-0">Lab </h3>
                                  </div>
                                  <div className="icon-shape icon-md bg-primary-soft text-primary rounded-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={20}
                                      height={20}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="feather feather-briefcase"
                                    >
                                      <rect
                                        x={2}
                                        y={7}
                                        width={20}
                                        height={14}
                                        rx={2}
                                        ry={2}
                                      />
                                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                  </div>
                                </div>
                                {/* project number */}
                                <div className="lh-sm">
                                  <h4 className=" mb-3 fw-bold">
                                    {vendorLists.length}
                                  </h4>
                                </div>
                                {vendorLists && vendorLists.length > 0 ? (
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
                                        className=""
                                        style={{
                                          borderRadius: "50%",
                                          height: "50px",
                                          width: "50px",
                                          marginLeft: "-10px",
                                        }}
                                      />
                                    ))
                                ) : (
                                  <img
                                    src={download}
                                    alt="Fallback Vendor"
                                    className=""
                                    style={{
                                      borderRadius: "50%",
                                      height: "50px",
                                      width: "50px",
                                      marginLeft: "-10px",
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/dashboard/pharmacy"
                            className="col-xl-3 col-lg-6 col-md-12 col-12 mb-5"
                          >
                            {/* card */}
                            <div className="card h-100 card-lift">
                              {/* card body */}
                              <div className="card-body">
                                {/* heading */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h3 className="mb-0">Pharmacy </h3>
                                  </div>
                                  <div className="icon-shape icon-md bg-primary-soft text-primary rounded-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={20}
                                      height={20}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="feather feather-briefcase"
                                    >
                                      <rect
                                        x={2}
                                        y={7}
                                        width={20}
                                        height={14}
                                        rx={2}
                                        ry={2}
                                      />
                                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                  </div>
                                </div>
                                {/* project number */}
                                <div className="lh-sm">
                                  <h4 className=" mb-3 fw-bold">
                                    {pharmacy.length}
                                  </h4>
                                </div>
                                {pharmacy && pharmacy.length > 0 ? (
                                  pharmacy.slice(0, 5).map((vendor, index) => (
                                    <img
                                      key={index}
                                      src={`${URL}/${vendor.image}`}
                                      alt={`Vendor ${index}`}
                                      className=""
                                      style={{
                                        borderRadius: "50%",
                                        height: "50px",
                                        width: "50px",
                                        marginLeft: "-10px",
                                      }}
                                    />
                                  ))
                                ) : (
                                  <img
                                    src="path/to/fallback/image.jpeg"
                                    alt="Fallback Vendor"
                                    className=""
                                    style={{
                                      borderRadius: "50%",
                                      height: "50px",
                                      width: "50px",
                                      marginLeft: "-10px",
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </Link>
                          <div className="col-xl-3 col-lg-6 col-md-12 col-12 mb-5">
                            {/* card */}
                            <div className="card h-100 card-lift">
                              {/* card body */}
                              <div className="card-body">
                                {/* heading */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h3 className="mb-0">Pharmacy </h3>
                                  </div>
                                  <div className="icon-shape icon-md bg-primary-soft text-primary rounded-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={20}
                                      height={20}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="feather feather-briefcase"
                                    >
                                      <rect
                                        x={2}
                                        y={7}
                                        width={20}
                                        height={14}
                                        rx={2}
                                        ry={2}
                                      />
                                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                  </div>
                                </div>
                                {/* project number */}
                                <div className="lh-sm">
                                  <h4 className=" mb-3 fw-bold">100</h4>
                                </div>
                                {vendorLists && vendorLists.length > 0 ? (
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
                                        className=""
                                        style={{
                                          borderRadius: "50%",
                                          height: "50px",
                                          width: "50px",
                                          marginLeft: "-10px",
                                        }}
                                      />
                                    ))
                                ) : (
                                  <img
                                    src="path/to/fallback/image.jpeg"
                                    alt="Fallback Vendor"
                                    className=""
                                    style={{
                                      borderRadius: "50%",
                                      height: "50px",
                                      width: "50px",
                                      marginLeft: "-10px",
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-3 col-lg-6 col-md-12 col-12 mb-5">
                            {/* card */}
                            <div className="card h-100 card-lift">
                              {/* card body */}
                              <div className="card-body">
                                {/* heading */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h3 className="mb-0">Lab </h3>
                                  </div>
                                  <div className="icon-shape icon-md bg-primary-soft text-primary rounded-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={20}
                                      height={20}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="feather feather-briefcase"
                                    >
                                      <rect
                                        x={2}
                                        y={7}
                                        width={20}
                                        height={14}
                                        rx={2}
                                        ry={2}
                                      />
                                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                  </div>
                                </div>
                                {/* project number */}
                                <div className="lh-sm">
                                  <h4 className=" mb-3 fw-bold">100</h4>
                                </div>
                                {vendorLists && vendorLists.length > 0 ? (
                                  vendorLists
                                    .slice(0, 5)
                                    .map((vendor, index) => (
                                      <img
                                        key={index}
                                        src={`${URL}/${vendor.image}`}
                                        alt={`Vendor ${index}`}
                                        className=""
                                        style={{
                                          borderRadius: "50%",
                                          height: "50px",
                                          width: "50px",
                                          marginLeft: "-10px",
                                        }}
                                      />
                                    ))
                                ) : (
                                  <img
                                    src="path/to/fallback/image.jpeg"
                                    alt="Fallback Vendor"
                                    className=""
                                    style={{
                                      borderRadius: "50%",
                                      height: "50px",
                                      width: "50px",
                                      marginLeft: "-10px",
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* row  */}

                        {/* row  */}
                      </div>
                    </div>
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
                            {/* card */}
                            <div className="card h-100 card-lift">
                              {/* card body */}
                              <div className="card-body">
                                {/* heading */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <h3 className="mb-0">Users </h3>
                                  </div>
                                  <div className="icon-shape icon-md bg-primary-soft text-primary rounded-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={20}
                                      height={20}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="feather feather-briefcase"
                                    >
                                      <rect
                                        x={2}
                                        y={7}
                                        width={20}
                                        height={14}
                                        rx={2}
                                        ry={2}
                                      />
                                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                  </div>
                                </div>
                                {/* project number */}
                                <div className="lh-sm">
                                  <h4 className=" mb-3 fw-bold">
                                    {userList.length}
                                  </h4>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {userList && userList.length > 0 ? (
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
                                          alt={`Vendor ${index}`}
                                          className=""
                                          style={{
                                            borderRadius: "50%",
                                            height: "50px",
                                            width: "50px",
                                            marginLeft:
                                              index === 0 ? "0" : "-10px", // Remove margin from the first image
                                            // objectFit: "cover", // Ensures image fills the circle area
                                          }}
                                        />
                                      ))
                                  ) : (
                                    <img
                                      src={download}
                                      alt="Fallback Vendor"
                                      className=""
                                      style={{
                                        borderRadius: "50%",
                                        height: "50px",
                                        width: "50px",
                                        marginLeft: "-10px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div
                      className="tab-pane fade"
                      id="pills-contact"
                      role="tabpanel"
                      aria-labelledby="pills-contact-tab"
                    >
                      ...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

   {/* <!-----------------------chart parts----------------------!>  */}

<div className="container" >
<div className="row " >

{/* Left Column */}
   {/* <!-----------------------chart of doctors----------------------!>  */}

<div className="col-md-6 border  py-3 border-2 d-flex justify-content-center align-items-center" > 
{loading && <p>Loading chart data...</p>}
{error && <p style={{ color: "red" }}>{error}</p>}
{!loading && !error && (
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
    width: "100%",
    height: "auto",
  }}
>
  <div className="leftside-chart" data-aos="flip-left"
     data-aos-easing="ease-out-cubic"
     data-aos-duration="2000">
    <Bar data={barChartData} options={barChartOptions} />
  </div>
  <p style={{ padding: "20px", fontSize: "18px", fontWeight: "bold" }}>
    Total Doctors:{" "}
    {doctorStats.reduce((total, stat) => total + stat.count, 0)}
  </p>
</div>
)}
</div>

                        {/* Right Column */}

   {/* <!-----------------------chart of users----------------------!>  */}
   <div className="col-md-6 border border-2   py-3 border-2 d-flex justify-content-center align-items-center" >
{loading && <p>Loading chart data...</p>}
{error && <p style={{ color: "red" }}>{error}</p>}
{!loading && !error && (
<div
style={{
display: "grid",
gridTemplateColumns: "1fr",
gap: "10px",
width: "100%",
height: "auto",
}}
>
<div className="rightside-chart" data-aos="flip-left"
     data-aos-easing="ease-out-cubic"
     data-aos-duration="2000">
<Bar data={barChartData1} options={barChartOptions1} />

</div>
<p style={{ padding: "20px", fontSize: "18px", fontWeight: "bold" }}>
Total Users:{" "}
{  userstats.reduce((total, stat) => total + stat.count, 0)}
</p>
</div>
)}
</div>


</div>



<h4 className="py-3 text-center abhiii" data-aos="flip-left"
     data-aos-easing="ease-out-cubic"
     data-aos-duration="2000" >charts of Pharmacies and Labs</h4>

<div className="row  justify-content-center" >

<div className="col-md-6 border py-3 border-2 d-flex justify-content-center align-items-center">
      {loading && <p>Loading chart data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "10px",
            width: "80%",
            height: "auto",
          }}
        >
          <div className="leftside-chart" data-aos="fade-right">
            {labstats.length > 0 ? (
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            ) : (
              <p>No data available for the chart</p>
            )}
          </div>
          <p style={{ padding: "20px", fontSize: "18px", fontWeight: "bold" }}>
            Total-labs:{" "}
            {labstats.reduce((total, stat) => total + stat.count, 0)}
          </p>
        </div>
      )}
    </div>


    <div className="col-md-6 border py-3 border-2 d-flex justify-content-center align-items-center">
      {loading && <p>Loading chart data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "10px",
            width: "100%",
            height: "auto",
          }}
        >
          <div className="rightside-chart" data-aos="fade-right"
     data-aos-offset="300"
     data-aos-easing="ease-in-sine">
            <Bar data={barChartData3} options={barChartOptions3} />
          </div>
          <p style={{ padding: "20px", fontSize: "18px", fontWeight: "bold" }}>
            Total Pharmacies:{" "}
            {pharmacystats.reduce((total, stat) => total + stat.count, 0)}
          </p>
        </div>
      )}
    </div>
</div>

{/* -------------------------- chart of food --------------------------------------*/}
<div className="row d-flex justify-content-center">
  <h3 className="py-3 text-center">Vendor</h3>

  {/* food chart last center */}

<div className="col-md-6 border py-3 border-2 d-flex justify-content-center align-items-center">
  {loading && <p>Loading food vendor data...</p>}
  {error && <p style={{ color: "red" }}>{error}</p>}
  {!loading && !error && (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "10px",
        width: "100%",
        height: "auto",
      }}
    >
      <div 
        className="rightside-chart" 
        data-aos="fade-right"
        data-aos-offset="300"
        data-aos-easing="ease-in-sine"
      >
        <Bar data={barChartData4} options={barChartOptions4} />
      </div>
      <p style={{ padding: "20px", fontSize: "18px", fontWeight: "bold" }}>
        Total Food Vendors:{" "}
        {foodstats.reduce((total, stat) => total + stat.count, 0)}
      </p>
    </div>
  )}
</div>

</div>
<div className="row">
   <div data-aos="zoom-out-down ">
        <h4 className="py-3 text-center abhiii"data-aos="flip-left"
     data-aos-easing="ease-out-cubic"
     data-aos-duration="2000">Recently Registered Users</h4>
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        <table
          border="1"
          className="table-bordered"
          style={{
            width: "100%",
            textAlign: "center",
            borderCollapse: "collapse",
            padding: "100px",
          }}
        >
          <thead className=" text-white "style={{ padding: "20px", fontSize: "18px", fontWeight: "bold", backgroundColor:"#3D3F96"}}>
            <tr className=""> 
              <th className="">Name</th>
              <th className="">Email</th>
              <th className="py-2">Phone</th>
              <th className="">Registered Date</th>
            </tr>
          </thead>
          <tbody>
            {firstuser.length > 0 ? (
              firstuser.map((user, index) => (
                <tr key={index} className="">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.number}</td>
                  <td className="p-3">
                    {user.registeredDate
                      ? new Date(user.registeredDate).toLocaleString()
                      : "No Registration Data"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No users to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <button
          onClick={getfirstuser}
          style={{ marginTop: "20px", padding: "10px 20px", borderRadius:"20px",backgroundColor:"#3D3F96",color:"white",border:"none",}}
        >
          Refresh Users
        </button>
      </div>

</div>

</div>


  {/* part of user first 5 login  */}
     



    </>
  );
};

export default Dashboard1;
