import Aos from "aos";
import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../../Context/Context";

const Doctors = () => {
  useEffect(() => {
    Aos.init();
  });

  const {getDoctor, doctor} = useContext(MyContext)

  useEffect(()=>{
    getDoctor()
  },[])
  const imageUrl = `${process.env.REACT_APP_API_URL}/`;

  return (
    <>
      <div className="container-fluid container-xl py-4">
        <div className="">
          <h1 className="display-5 mb-4">Our Doctors :-</h1>
          <div className="row">
            <div className="col-12">
              <div className="CardContainerrr">
                {
                  doctor && doctor.map((d)=>(
                    <Link
                  className="Customcard1"
                  key={d._id}
                  data-aos="fade-up"
                  data-aos-easing="ease-out-cubic"
                  data-aos-duration="2000"
                  to={`/Doctors/Profile/${d._id}`}
                >
                  <div
                    className="img"
                  >
                  <img 
                  src={`${imageUrl}${d.image}`}
                  alt={`Dr. ${d.name}`}
          
                /></div>
                  <div className="text">
                    <p className="fs-6 fw-bold mb-0"> {d.name} </p>
                    <p className="fs-6 fw-semibold mb-0">
                      {d.address}
                    </p>
                    <p className="fst-italic fw-medium mb-1">
                      6 Video - 40 min
                    </p>
                    <div className="icon-box btn border-0 rounded-2 btn-outline-secondary">
                      <p className="span text-nowrap mb-0">
                        <i className="fa-regular mx-2 text-current fa-clock fa-spin"></i>
                        Book Appointment
                      </p>
                    </div>
                  </div>
                </Link>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doctors;
