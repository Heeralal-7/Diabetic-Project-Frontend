import Aos from "aos";
import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../../Context/Context";
import '../../Assets/Css/LebTest.css'
import bg1 from '../../Assets/img/LabTest/Group 1000009586.jpg'
import bg2 from '../../Assets/img/LabTest/Group 1000009587.jpg'
import bg3 from '../../Assets/img/LabTest/Group 1000009588.jpg'
import bg4 from '../../Assets/img/LabTest/Group 1000009589.jpg'

const LabTest = () => {
  useEffect(() => {
    Aos.init();
  }, []);

  const { vendor, getVendor } = useContext(MyContext);


  useEffect(() => {
    getVendor();
  }, []);

  const packages = [
    "Diabetes",
    "Full Body Check Up",
    "Womens Health",
    "Womens Health",
    "Healthy Men",
    "Senior Citizen Checkup",
    "Senior Citizen Checkup",
  ];

  const organs = [
  { name: "Stomach", img: "https://www.shutterstock.com/shutterstock/photos/1931442815/display_1500/stock-vector-human-stomach-internal-organ-anatomy-vector-cartoon-flat-icon-illustration-isolated-on-white-1931442815.jpg" },
  { name: "Heart", img: "https://www.shutterstock.com/shutterstock/photos/2482198365/display_1500/stock-vector-illustration-of-real-human-heart-2482198365.jpg" },
  { name: "Kidney", img: "https://www.shutterstock.com/shutterstock/photos/2504385259/display_1500/stock-vector-kidney-cancer-starts-in-the-kidneys-similar-diseases-include-renal-cell-carcinoma-wilms-tumor-2504385259.jpg" },
  { name: "Liver", img: "https://www.shutterstock.com/shutterstock/photos/2493999905/display_1500/stock-vector-realistic-liver-anatomy-structure-vector-hepatic-system-organ-digestive-gallbladder-organ-human-2493999905.jpg" },
  { name: "Bones & Joints", img: "https://www.shutterstock.com/shutterstock/photos/2518806781/display_1500/stock-vector-bone-joint-human-knee-bone-joint-line-icon-bone-joint-outline-icon-orthopedic-health-anatomy-leg-2518806781.jpg" },
  { name: "Lungs", img: "https://www.shutterstock.com/shutterstock/photos/2598043673/display_1500/stock-vector-lungs-human-internal-organ-illustration-of-human-lungs-vector-illustration-2598043673.jpg" },
];


  const testPackages = [
  {
    title: "Diabetes",
    rating: 4.5,
    testsIncluded: 1,
    price: 2550,
    image: "https://via.placeholder.com/50", // Replace with your test tube image
  },
  {
    title: "Full Body Checkup",
    rating: 4.7,
    testsIncluded: 89,
    price: 3499,
    image: "https://via.placeholder.com/50",
  },
  {
    title: "Heart Risk",
    rating: 4.3,
    testsIncluded: 12,
    price: 1299,
    image: "https://via.placeholder.com/50",
  },
  {
    title: "Liver Function Test",
    rating: 4.6,
    testsIncluded: 8,
    price: 899,
    image: "https://via.placeholder.com/50",
  },
  {
    title: "Kidney Screening",
    rating: 4.4,
    testsIncluded: 10,
    price: 999,
    image: "https://via.placeholder.com/50",
  },
  {
    title: "Senior Citizen Panel",
    rating: 4.8,
    testsIncluded: 55,
    price: 2799,
    image: "https://via.placeholder.com/50",
  }
  // You can add more test packages here
];




  const imageUrl = process.env.REACT_APP_API_URL

  return (
    <div className="container-fluid container-xl py-4">
      {/* top Crousel start */}
      <div className="row">
        <div className="col-md-12">
          <div id="carouselExampleAutoplaying" className="carousel slide carousel-fade" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img src={bg1} className="d-block w-100 rounded-4" style={{ height: "400px" }} alt="Slide 1" />
              </div>
              <div className="carousel-item">
                <img src={bg2} className="d-block w-100 rounded-4" style={{ height: "400px" }} alt="Slide 2" />
              </div>
              <div className="carousel-item">
                <img src={bg3} className="d-block w-100 rounded-4" style={{ height: "400px" }} alt="Slide 3" />
              </div>
              <div className="carousel-item">
                <img src={bg4} className="d-block w-100 rounded-4" style={{ height: "400px" }} alt="Slide 3" />
              </div>
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselExampleAutoplaying"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselExampleAutoplaying"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </div>
      {/* top Crousel end */}

      <div className="">
        <h1 className="display-5 mb-4">Our Labs :- </h1>
      </div>
      <div className="row">
        {vendor.length === 0 && <div className="text-center">No Labs added yet</div>}
        <div className="col-12">
          <div className="CardContainerrr" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }} >
            {vendor && (vendor.map((v) => (
              <Link key={v._id} to={`/venders/labs/Lab-details/${v._id}`} data-aos="zoom-in-down" data-aos-easing="linear" data-aos-duration="1200" className="Blogcard LabTestCard text-current text-decoration-none">
                <div className="Blogcard-inner" style={{ backgroundColor: "#fff" }} >
                  <div className="BlogCardbox">
                    <div className="imgBox">
                      <img className="BlogCardImg" src={`${imageUrl}${v.image}`} alt="Trust & Co." />
                    </div>
                    <div className="BlogCardIcon">
                      <span className="BlogCardIconBox text-decoration-none">
                        <span className="material-symbols-outlined">
                          arrow_outward
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="content px-3">
                  <h3>{v.name}</h3>
                  <p>We do all kind of MRI & CT Scan for the patient</p>
                  <h3 className="LabCardSubtitle">Starting from <span className="fs-5 fw-bold text-dark">$80</span></h3>
                  <div className="w-100">
                    <button className="btn icon-box px-4 rounded-1 btn-outline-secondary">
                      Schedule a test
                    </button>
                  </div>
                </div>
              </Link>
            )))

            }
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <h1 className="display-5 my-4 ">Doctor curated lab packages</h1>
        </div>
        <div className="col-md-12">
          <div className="container py-3">
            <div className="d-flex flex-wrap gap-3 ">
              {packages.map((title, index) => (
                <Link
                  key={index}
                  className="card border-0  text-center p-2"
                  style={{ width: "300px" }}
                >

                  <div className="image-container rounded-3">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Doctor"
                      className="mt-3 rounded-3 mb-2 zoom-hover"
                    />
                  </div>
                  <p className="mb-1 fw-medium">{title}</p>
                </Link>
              ))}
            </div>
            <button className="btn btn-outline-secondary mt-3">See All</button>
          </div>

        </div>

      </div>

      <div className="row">
        <div className="col-md-12">
          <h1 className="display-5 my-4 ">Popular Test Packages packages</h1>
             

      <div
        className="d-flex flex-row overflow-auto"
        style={{ gap: "15px", paddingBottom: "10px" }}
      >
        {testPackages.map((pkg, idx) => (
          <div
            key={idx}
            className="card shadow-sm p-3"
            style={{ width: "300px", minWidth: "300px", borderRadius: "12px" }}
          >
            <div className="d-flex align-items-center mb-2">
              <img
                src={pkg.image}
                alt="icon"
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: "#f8d7da",
                  borderRadius: "50%",
                  padding: "8px",
                  marginRight: "12px",
                }}
              />
              <div>
                <h6 className="mb-1">{pkg.title}</h6>
                <div style={{ fontSize: "0.9rem", color: "#888" }}>
                  ★ ★ ★ ★ ☆ ({pkg.rating})
                </div>
              </div>
            </div>
            <div className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
              Included {pkg.testsIncluded} Tests
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-danger fw-bold">₹ {pkg.price.toFixed(2)}</div>
              <a href="#" className="text-danger fw-medium" style={{ fontSize: "0.9rem" }}>
                View Package
              </a>
            </div>
          </div>
        ))}
      </div>

        </div>
      </div>

      <div className="row">
        <div className="col-md-12 py-4">
          <h1 className="display-5 my-4 ">Find Test by Organ</h1>
           <div className="row">
        {organs.map((organ, idx) => (
          <div key={idx} className="col-3 text-center mb-4">
            <Link
              className="mx-auto mb-2"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#f9f9f9",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow:"hidden",
              }}
            >
              <img src={organ.img} alt={organ.name} style={{ width: "110px" }} />
            </Link>
            <div style={{ fontSize: "0.95rem" }}>{organ.name}</div>
          </div>
        ))}
      </div>

      

        </div>
      </div>
    </div>
  );
};

export default LabTest;
