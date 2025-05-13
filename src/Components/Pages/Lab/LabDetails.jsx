import React, { useContext, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { MyContext } from "../../../Context/Context";
// import ImgSlide1 from "../Assets/img/ClinicSlideImg1.jpg";
// import ImgSlide2 from "../Assets/img/ClinicSlideImg2.jpg";
// import ImgSlide3 from "../Assets/img/ClinicSlideImg3.jpg";

const LabDetails = () => {
  const { getVendortest, test } = useContext(MyContext);

  const { id } = useParams();

  useEffect(() => {
    getVendortest(id);
  }, [id]);
  return (
    <>
      <div className="container-fluid container-xl">
        <div className="row">
          <div className="col-md-12">
            <div className="w-100 text-dark">
              <div className="d-flex align-items-center justify-content-between">
                <h1 className="display-5 my-3 px-3">Lab Details :-</h1>
                <Link
                  to="/venders/labs"
                  className="btn btn-hoverBlue btn-light rounded-circle shadow me-3"
                >
                  <i className="ri-arrow-go-back-line fs-5 text-current fw-bold "></i>
                </Link>
              </div>
            </div>
          </div>
          {/* <div className="col-md-10 mx-auto">
            <div
              id="dvnsdfvns"
              className="carousel slide carousel-fade"
              data-bs-ride="true"
            >
              <div className="carousel-indicators">
                <button
                  type="button"
                  data-bs-target="#dvnsdfvns"
                  data-bs-slide-to="0"
                  className="active"
                  aria-current="true"
                  aria-label="Slide 1"
                ></button>
                <button
                  type="button"
                  data-bs-target="#dvnsdfvns"
                  data-bs-slide-to="1"
                  aria-label="Slide 2"
                ></button>
                <button
                  type="button"
                  data-bs-target="#dvnsdfvns"
                  data-bs-slide-to="2"
                  aria-label="Slide 3"
                ></button>
              </div>
              <div className="carousel-inner rounded-4">
                <div className="carousel-item active">
                  <div
                    className="ClinicPageBanner"
                    style={{ backgroundImage: `url(${ImgSlide1})` }}
                  >
                    <div className=" d-flex justify-content-center flex-column align-items-center h-100">
                      <h1 className="display-5 fw-bold text-white text-center pt-5">
                        Bringing Health
                        <br />
                        to life for the whole family
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="carousel-item">
                  <div
                    className="ClinicPageBanner"
                    style={{ backgroundImage: `url(${ImgSlide2})` }}
                  >
                    <div className=" d-flex justify-content-center flex-column align-items-center h-100">
                      <h1 className="display-5 fw-bold text-white text-center pt-5">
                        Bringing Health
                        <br />
                        to life for the whole family
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="carousel-item">
                  <div
                    className="ClinicPageBanner"
                    style={{ backgroundImage: `url(${ImgSlide3})` }}
                  >
                    <div className=" d-flex justify-content-center flex-column align-items-center h-100">
                      <h1 className="display-5 fw-bold text-white text-center pt-5">
                        Bringing Health
                        <br />
                        to life for the whole family
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#dvnsdfvns"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                />
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#dvnsdfvns"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                />
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div> */}
        </div>
      </div>
      <div className="container-fluid container-xl">
        <div className="row">
          <div className="col-xl-8">
            <h4>Description</h4>
            <p className="lh-sm text-justify fst-italic fw-semibold text-body-secondary    ">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae
              natus dolores eligendi minima neque doloribus maiores earum
              perspiciatis vero magni rem veniam sit, qui deleniti corrupti ex
              unde ea numquam omnis porro optio. Quidem porro perspiciatis eaque
              nisi dolorum iusto ab, et inventore optio, suscipit non iure tam,
              culpa quasi perspiciatis eos!
            </p>
            <div className="labTestCardssss py-5">
              {test.length > 0 ? (
                test.map((v) => (
                  <div key={v._id} className="labTestCarddd px-sm-4">
                    <div className="row">
                      <p className="small-desc col-sm-8 px-1">
                        <p className="labTestCarddd-title">
                          <i className="ri-flask-fill text-info fs-2"></i>H3N2
                          Plus Influenza Profile
                        </p>
                        <div
                          className="d-flex link-danger gap-3 justify-content-between px-3 shadow-sm bg-primary-subtle text-mainRed py-1 rounded-1 fw-semibold w-100"
                          style={{ maxWidth: "300px" }}
                          data-bs-toggle="offcanvas"
                          data-bs-target="#noOfTestDetails"
                          aria-controls="noOfTestDetails"
                        >
                          <span className="">Includes 4 Test</span>
                          <span className="">Show All</span>
                        </div>
                      </p>
                      <div className="col-sm-4 px-1">
                        <button className="btn icon-box btn-outline-light border-0 btn-sm px-4 rounded-2">
                          Book Lab Test
                        </button>
                      </div>
                    </div>
                    <div className="go-corner">
                      <div className="go-arrow">
                        <i className="ri-arrow-right-double-fill"></i>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="d-flex justify-content-center align-items-center">
                  <h1 className="display-6 text-center fw-bold">
                    No test added yet
                  </h1>
                </div>
              )}
              {/* <div className="labTestCarddd px-sm-4">
                <div className="row">
                  <p className="small-desc col-sm-8 px-1">
                    <p className="labTestCarddd-title">
                      <i className="ri-flask-fill text-info fs-2"></i>H3N2 Plus
                      Influenza Profile
                    </p>
                    <div
                      className="d-flex link-danger gap-3 justify-content-between px-3 shadow-sm bg-primary-subtle text-mainRed py-1 rounded-1 fw-semibold w-100"
                      style={{ maxWidth: "300px" }}
                      data-bs-toggle="offcanvas"
                      data-bs-target="#noOfTestDetails"
                      aria-controls="noOfTestDetails"
                    >
                      <span className="">Includes 4 Test</span>
                      <span className="">Show All</span>
                    </div>
                  </p>
                  <div className="col-sm-4 px-1">
                    <button className="btn icon-box btn-outline-light border-0 btn-sm px-4 rounded-2">
                      Book Lab Test
                    </button>
                  </div>
                </div>
                <div className="go-corner">
                  <div className="go-arrow">
                    <i className="ri-arrow-right-double-fill"></i>
                  </div>
                </div>
              </div>
              <div className="labTestCarddd px-sm-4">
                <div className="row">
                  <p className="small-desc col-sm-8 px-1">
                    <p className="labTestCarddd-title">
                      <i className="ri-flask-fill text-info fs-2"></i>H3N2 Plus
                      Influenza Profile
                    </p>
                    <div
                      className="d-flex link-danger gap-3 justify-content-between px-3 shadow-sm bg-primary-subtle text-mainRed py-1 rounded-1 fw-semibold w-100"
                      style={{ maxWidth: "300px" }}
                      data-bs-toggle="offcanvas"
                      data-bs-target="#noOfTestDetails"
                      aria-controls="noOfTestDetails"
                    >
                      <span className="">Includes 4 Test</span>
                      <span className="">Show All</span>
                    </div>
                  </p>
                  <div className="col-sm-4 px-1">
                    <button className="btn icon-box btn-outline-light border-0 btn-sm px-4 rounded-2">
                      Book Lab Test
                    </button>
                  </div>
                </div>
                <div className="go-corner">
                  <div className="go-arrow">
                    <i className="ri-arrow-right-double-fill"></i>
                  </div>
                </div>
              </div>
              <div className="labTestCarddd px-sm-4">
                <div className="row">
                  <p className="small-desc col-sm-8 px-1">
                    <p className="labTestCarddd-title">
                      <i className="ri-flask-fill text-info fs-2"></i>H3N2 Plus
                      Influenza Profile
                    </p>
                    <div
                      className="d-flex link-danger gap-3 justify-content-between px-3 shadow-sm bg-primary-subtle text-mainRed py-1 rounded-1 fw-semibold w-100"
                      style={{ maxWidth: "300px" }}
                      data-bs-toggle="offcanvas"
                      data-bs-target="#noOfTestDetails"
                      aria-controls="noOfTestDetails"
                    >
                      <span className="">Includes 4 Test</span>
                      <span className="">Show All</span>
                    </div>
                  </p>
                  <div className="col-sm-4 px-1">
                    <button className="btn icon-box btn-outline-light border-0 btn-sm px-4 rounded-2">
                      Book Lab Test
                    </button>
                  </div>
                </div>
                <div className="go-corner">
                  <div className="go-arrow">
                    <i className="ri-arrow-right-double-fill"></i>
                  </div>
                </div>
              </div>
              <div className="labTestCarddd px-sm-4">
                <div className="row">
                  <p className="small-desc col-sm-8 px-1">
                    <p className="labTestCarddd-title">
                      <i className="ri-flask-fill text-info fs-2"></i>H3N2 Plus
                      Influenza Profile
                    </p>
                    <div
                      className="d-flex link-danger gap-3 justify-content-between px-3 shadow-sm bg-primary-subtle text-mainRed py-1 rounded-1 fw-semibold w-100"
                      style={{ maxWidth: "300px" }}
                      data-bs-toggle="offcanvas"
                      data-bs-target="#noOfTestDetails"
                      aria-controls="noOfTestDetails"
                    >
                      <span className="">Includes 4 Test</span>
                      <span className="">Show All</span>
                    </div>
                  </p>
                  <div className="col-sm-4 px-1">
                    <button className="btn icon-box btn-outline-light border-0 btn-sm px-4 rounded-2">
                      Book Lab Test
                    </button>
                  </div>
                </div>
                <div className="go-corner">
                  <div className="go-arrow">
                    <i className="ri-arrow-right-double-fill"></i>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
          <div className="col-xl-4 WidthCart CustomScrollBa2">
            <nav className="navbar  navbar-expand-xl">
              <div className="container-fluid flex-lg-column px-xl-0">
                <div
                  className="offcanvas offcanvas-bottom offcanHeight rounded-top-5"
                  tabIndex={-1}
                  id="ProductCart"
                  aria-labelledby="ProductCartLabel"
                >
                  <div className="offcanvas-header">
                    <h3 className="offcanvas-title fs-1" id="ProductCartLabel">
                      Your Cart
                    </h3>
                    <button
                      type="button"
                      className="btn-close shadow-none border-0"
                      data-bs-dismiss="offcanvas"
                      aria-label="Close"
                    />
                  </div>
                  <div className="offcanvas-body py-0 flex-column px-1 pt-xl-5 px-sm-3">
                    <ul className="navbar-nav flex-column justify-content-xl-start w-100 flex-grow-1">
                      <div
                        className="p-2 sticky-top bg-white d-none text-center d-xl-block"
                        style={{ minWidth: "25vw" }}
                      >
                        {/* <h4 className="text-start text-xl-center">
                        Cart is empty
                      </h4> */}
                        <h5 className="text-start ">2 Item in Cart</h5>
                      </div>
                      <div className="w-100 d-flex flex-wrap pb-5 mb-5 px-1 pb-xl-0 mb-xl-0">
                        {/* <div className="labTestCarddd px-sm-4">
                          <div className="row">
                            <p className="small-desc col-sm-8 px-1">
                              <p className="labTestCarddd-title">
                                <i className="ri-flask-fill text-info fs-2"></i>H3N2
                                Plus Influenza Profile
                              </p>
                              <div
                                className="d-flex link-danger gap-3 justify-content-between px-3 shadow-sm bg-primary-subtle text-mainRed py-1 rounded-1 fw-semibold w-100"
                                style={{ maxWidth: "300px" }}
                              >
                                <span className="">Includes</span>
                                <span className="">4 Test</span>
                              </div>
                            </p>
                            <div className="col-sm-4 px-1">
                              <button className="btn icon-box btn-outline-light border-0 btn-sm px-4 rounded-2">
                                Book Lab Test
                              </button>
                            </div>
                          </div>
                          <div className="go-corner">
                            <div className="go-arrow">
                              <i className="ri-arrow-right-double-fill"></i>
                            </div>
                          </div>
                        </div> */}
                        <div
                          className="w-100 py-2 "
                          style={{ borderBottom: "1px dashed #9d969a" }}
                        >
                          <ul
                            className="border rounded-2 list-group"
                            style={{ listStyle: "number" }}
                          >
                            <li className="d-flex p-2 lh-sm">
                              <span className="w-75">
                                Covid-19 RTPCR Test (Coronavirus SARS - CoV2)
                              </span>
                              <span className="fw-semibold">
                                ₹<span>780</span>
                              </span>
                            </li>
                            <li className="d-flex p-2 lh-sm">
                              <span className="w-75">
                                Covid-19 RTPCR Test (Coronavirus SARS - CoV2)
                              </span>
                              <span className="fw-semibold">
                                ₹<span>780</span>
                              </span>
                            </li>
                            <li className="d-flex p-2 lh-sm">
                              <span className="w-75">
                                Covid-19 RTPCR Test (Coronavirus SARS - CoV2)
                              </span>
                              <span className="fw-semibold">
                                ₹<span>780</span>
                              </span>
                            </li>
                            <li className="d-flex p-2 lh-sm">
                              <span className="w-75">
                                Covid-19 RTPCR Test (Coronavirus SARS - CoV2)
                              </span>
                              <span className="fw-semibold">
                                ₹<span>780</span>
                              </span>
                            </li>
                            <li className="d-flex p-2 lh-sm">
                              <span className="w-75">
                                Covid-19 RTPCR Test (Coronavirus SARS - CoV2)
                              </span>
                              <span className="fw-semibold">
                                ₹<span>780</span>
                              </span>
                            </li>
                          </ul>
                        </div>
                        <div className="w-100 p-3 mb-1">
                          <div className="d-flex justify-content-between">
                            <span>Total</span>
                            <span>₹4,900</span>
                          </div>
                        </div>
                      </div>
                      {/* <Link className="btn icon-box btn-outline-secondary rounded-2 px-5 mt-3">View Your Cart</Link> */}
                    </ul>
                    <div className="w-100 p-3 py-2 shadow fixed-bottom bg-white  d-flex cartBtnnn align-items-center">
                      <div
                        className="d-flex flex-column w-100"
                        style={{ maxWidth: "90px" }}
                      >
                        <div className="">
                          <i className="ri-shopping-cart-line fs-3"></i>
                          <span
                            className="badge bg-danger rounded-circle  translate-middle-y"
                            style={{
                              width: "26px",
                              height: "26px",
                              padding: "7px 0px",
                            }}
                          >
                            5
                          </span>
                        </div>
                        <div className="fw-bold fs-7">
                          ₹ <span>78500</span>
                        </div>
                      </div>
                      <div className="w-100">
                        <Link
                          to="/venders/labs/Lab-details/Cart"
                          className="btn btn-outline-secondary rounded-1 icon-box w-100"
                        >
                          View Cart
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            <div className="fixed-bottom d-xl-none">
              <button
                className="CartIconButton float-end me-4 mb-3"
                data-bs-toggle="offcanvas"
                data-bs-target="#ProductCart"
                aria-controls="ProductCart"
                aria-label="Toggle navigation"
              >
                <div className="Iconnn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M4.00488 16V4H2.00488V2H5.00488C5.55717 2 6.00488 2.44772 6.00488 3V15H18.4433L20.4433 7H8.00488V5H21.7241C22.2764 5 22.7241 5.44772 22.7241 6C22.7241 6.08176 22.7141 6.16322 22.6942 6.24254L20.1942 16.2425C20.083 16.6877 19.683 17 19.2241 17H5.00488C4.4526 17 4.00488 16.5523 4.00488 16ZM6.00488 23C4.90031 23 4.00488 22.1046 4.00488 21C4.00488 19.8954 4.90031 19 6.00488 19C7.10945 19 8.00488 19.8954 8.00488 21C8.00488 22.1046 7.10945 23 6.00488 23ZM18.0049 23C16.9003 23 16.0049 22.1046 16.0049 21C16.0049 19.8954 16.9003 19 18.0049 19C19.1095 19 20.0049 19.8954 20.0049 21C20.0049 22.1046 19.1095 23 18.0049 23Z"></path>
                  </svg>
                </div>

                <div className="textcjsdbcjk">Your Cart</div>
              </button>
            </div>
          </div>
          {/* medical tests list offcanvas*/}
          <div
            className="offcanvas offcanvas-end noBackdrop"
            tabIndex={-1}
            id="noOfTestDetails"
            aria-labelledby="noOfTestDetailsLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title lh-sm" id="noOfTestDetailsLabel">
                <p className="mb-0 d-flex gap-2">
                  <i className="ri-flask-fill text-info fs-2"></i>
                  <span>
                    <span> H3N2 Plus Influenza Profile</span>
                    <br />
                    <span className="fs-6 fw-normal text-secondary">
                      4 Test
                    </span>
                  </span>
                </p>
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              />
            </div>
            <div className="offcanvas-body">
              <ul className="">
                <li>
                  Influenza Panel (Influenza A, B & H1N1)
                  <ul>
                    <li>Influenza A Virus</li>
                    <li>Influenza A Virus</li>
                    <li>H1N1 Virus</li>
                  </ul>
                </li>
                <li>H3N2 test</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LabDetails;
