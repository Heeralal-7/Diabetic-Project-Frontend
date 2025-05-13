import Aos from "aos";
import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../../Context/Context";

const LabTest = () => {
  useEffect(() => {
    Aos.init();
  }, []);

  const { vendor, getVendor } = useContext(MyContext);
   

  useEffect(() => {
    getVendor();
  }, []);


  const imageUrl = process.env.REACT_APP_API_URL

  return (
    <div className="container-fluid container-xl py-4">
      <div className="">
        <h1 className="display-5 mb-4">Our Labs :-</h1>
      </div>
      <div className="row">
      {vendor.length === 0 && <div className="text-center">No Labs added yet</div>}
        <div className="col-12">
          <div className="CardContainerrr" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }} >
            {vendor &&  (vendor.map((v) => (
              <Link key={v._id} to={`/venders/labs/Lab-details/${v._id}`} data-aos="zoom-in-down" data-aos-easing="linear" data-aos-duration="1200"  className="Blogcard LabTestCard text-current text-decoration-none">
                <div className="Blogcard-inner" style={{ backgroundColor: "#fff" }} >
                  <div className="BlogCardbox">
                    <div  className="imgBox">
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
    </div>
  );
};

export default LabTest;
