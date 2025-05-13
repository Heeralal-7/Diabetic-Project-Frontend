import React, { useEffect } from "react";
import "../../Assets/Css/Blog.css";
import { Link } from "react-router-dom";
import Aos from "aos";


const Blogs = () => {
  useEffect(() => {
    Aos.init();
  }, [])
  return (
    <>
      <section className="showcase">
        <div className="overlay">
          <h2 className="display-5">Blogs</h2>
          <p className="fs-6">DiabetesWala Blogs</p>
        </div>
      </section>
   

      <section className="CardSection">
        <h2 className="BlogCardHeading">
          leading companies
          have trusted us
        </h2>
        <div className="cardsCont">
          <Link data-aos="zoom-in-down"  data-aos-easing="linear" data-aos-duration="1200" to='/Blogs/BlogPage' className="Blogcard text-current text-decoration-none">
            <div className="Blogcard-inner" style={{ backgroundColor: "#fff" }}>
              <div className="BlogCardbox `">
                <div className="imgBox">
                  <img
                    className="BlogCardImg"
                    src="https://img.freepik.com/free-photo/portrait-smiling-young-woman-doctor-healthcare-medical-worker-pointing-fingers-left-showing-clini_1258-88108.jpg?t=st=1716547565~exp=1716551165~hmac=e1cdcb9cf11f6c15285e750cf861cac60bbbc3b9fb18c3f7e9a92f71b0eda44e&w=740"
                    alt="Trust & Co."
                  />
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
            <div className="content">
              <h3>The best recreation areas for general immunity</h3>
              <p>
                Fill out the form and the algorithm will offer the right team of
                experts
              </p>
              <div className="w-100">
                <button  className="btn icon-box btn-outline-secondary">
                  view More
                </button>
              
              </div>
            </div>
          </Link>
          <Link data-aos="zoom-in-down"  data-aos-easing="linear" data-aos-duration="1200" to='/Blogs/BlogPage' className="Blogcard text-current text-decoration-none">
            <div className="Blogcard-inner" style={{ backgroundColor: "#fff" }}>
              <div className="BlogCardbox `">
                <div className="imgBox">
                  <img
                    className="BlogCardImg"
                    src="https://img.freepik.com/free-photo/portrait-smiling-young-woman-doctor-healthcare-medical-worker-pointing-fingers-left-showing-clini_1258-88108.jpg?t=st=1716547565~exp=1716551165~hmac=e1cdcb9cf11f6c15285e750cf861cac60bbbc3b9fb18c3f7e9a92f71b0eda44e&w=740"
                    alt="Trust & Co."
                  />
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
            <div className="content">
              <h3>The best recreation areas for general immunity</h3>
              <p>
                Fill out the form and the algorithm will offer the right team of
                experts
              </p>
              <div className="w-100">
                <button  className="btn icon-box btn-outline-secondary btn-outline-secondary">
                  view More
                </button>
              
              </div>
            </div>
          </Link>
          <Link data-aos="zoom-in-down"  data-aos-easing="linear" data-aos-duration="1200" to='/Blogs/BlogPage' className="Blogcard text-current text-decoration-none">
            <div className="Blogcard-inner" style={{ backgroundColor: "#fff" }}>
              <div className="BlogCardbox `">
                <div className="imgBox">
                  <img
                    className="BlogCardImg"
                    src="https://img.freepik.com/free-photo/portrait-smiling-young-woman-doctor-healthcare-medical-worker-pointing-fingers-left-showing-clini_1258-88108.jpg?t=st=1716547565~exp=1716551165~hmac=e1cdcb9cf11f6c15285e750cf861cac60bbbc3b9fb18c3f7e9a92f71b0eda44e&w=740"
                    alt="Trust & Co."
                  />
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
            <div className="content">
              <h3>The best recreation areas for general immunity</h3>
              <p>
                Fill out the form and the algorithm will offer the right team of
                experts
              </p>
              <div className="w-100">
                <button  className="btn icon-box btn-outline-secondary btn-outline-secondary">
                  view More
                </button>
              
              </div>
            </div>
          </Link>
          <Link data-aos="zoom-in-down"  data-aos-easing="linear" data-aos-duration="1200" to='/Blogs/BlogPage' className="Blogcard text-current text-decoration-none">
            <div className="Blogcard-inner" style={{ backgroundColor: "#fff" }}>
              <div className="BlogCardbox `">
                <div className="imgBox">
                  <img
                    className="BlogCardImg"
                    src="https://img.freepik.com/free-photo/portrait-smiling-young-woman-doctor-healthcare-medical-worker-pointing-fingers-left-showing-clini_1258-88108.jpg?t=st=1716547565~exp=1716551165~hmac=e1cdcb9cf11f6c15285e750cf861cac60bbbc3b9fb18c3f7e9a92f71b0eda44e&w=740"
                    alt="Trust & Co."
                  />
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
            <div className="content">
              <h3>The best recreation areas for general immunity</h3>
              <p>
                Fill out the form and the algorithm will offer the right team of
                experts
              </p>
              <div className="w-100">
                <button  className="btn icon-box btn-outline-secondary btn-outline-secondary">
                  view More
                </button>
              
              </div>
            </div>
          </Link>
          <Link data-aos="zoom-in-down"  data-aos-easing="linear" data-aos-duration="1200" to='/Blogs/BlogPage' className="Blogcard text-current text-decoration-none">
            <div className="Blogcard-inner" style={{ backgroundColor: "#fff" }}>
              <div className="BlogCardbox `">
                <div className="imgBox">
                  <img
                    className="BlogCardImg"
                    src="https://img.freepik.com/free-photo/portrait-smiling-young-woman-doctor-healthcare-medical-worker-pointing-fingers-left-showing-clini_1258-88108.jpg?t=st=1716547565~exp=1716551165~hmac=e1cdcb9cf11f6c15285e750cf861cac60bbbc3b9fb18c3f7e9a92f71b0eda44e&w=740"
                    alt="Trust & Co."
                  />
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
            <div className="content">
              <h3>The best recreation areas for general immunity</h3>
              <p>
                Fill out the form and the algorithm will offer the right team of
                experts
              </p>
              <div className="w-100">
                <button  className="btn icon-box btn-outline-secondary btn-outline-secondary">
                  view More
                </button>
              
              </div>
            </div>
          </Link>
          <Link data-aos="zoom-in-down"  data-aos-easing="linear" data-aos-duration="1200" to='/Blogs/BlogPage' className="Blogcard text-current text-decoration-none">
            <div className="Blogcard-inner" style={{ backgroundColor: "#fff" }}>
              <div className="BlogCardbox `">
                <div className="imgBox">
                  <img
                    className="BlogCardImg"
                    src="https://img.freepik.com/free-photo/portrait-smiling-young-woman-doctor-healthcare-medical-worker-pointing-fingers-left-showing-clini_1258-88108.jpg?t=st=1716547565~exp=1716551165~hmac=e1cdcb9cf11f6c15285e750cf861cac60bbbc3b9fb18c3f7e9a92f71b0eda44e&w=740"
                    alt="Trust & Co."
                  />
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
            <div className="content">
              <h3>The best recreation areas for general immunity</h3>
              <p>
                Fill out the form and the algorithm will offer the right team of
                experts
              </p>
              <div className="w-100">
                <button  className="btn icon-box btn-outline-secondary btn-outline-secondary">
                  view More
                </button>
              
              </div>
            </div>
          </Link>

        </div>
      </section>
    </>
  );
};

export default Blogs;
