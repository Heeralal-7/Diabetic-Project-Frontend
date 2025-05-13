import { React, useEffect } from "react";
import { Link,useLocation, useNavigate } from "react-router-dom";
import img1 from "../Assets/img/Logo.png";
import $ from "jquery";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate()

  const logout = ()=>{
    localStorage.removeItem('UserToken')
    navigate('/')
    
  }

  useEffect(() => {
    const handleLinkClick = function () {
      const path = $(this).attr("href");
      sessionStorage.setItem("activePath", path);
      $(".nav-link").removeClass("active");
      $(this).addClass("active");
    };

    // Get the active path from sessionStorage
    const activePath =
      sessionStorage.getItem("activePath") || location.pathname;
    $(".nav-link").each(function () {
      if ($(this).attr("href") === activePath) {
        $(this).addClass("active");
      } else {
        $(this).removeClass("active");
      }
    });

    // Use jQuery to handle click events
    $(".nav-link").on("click", handleLinkClick);

    // Cleanup event listeners on component unmount
    return () => {
      $(".nav-link").off("click", handleLinkClick);
    };
  }, [location]);
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `.fs-small{
              font-size: 0.85rem;
            }
            .fixed-top {
              position: fixed;
              top: 0;
              right: 0;
              left: 0;
              z-index: 1000 !important;
          }
            `,
        }}
      />
      <nav
        className="navbar fixed-top fw-bold navbar-expand-lg bg-primary-subtle shadow-sm"
        id="navbar"
      >
        <div className="container-fluid">
          <Link className="navbar-brand" to="/" style={{ maxWidth: "180px" }}>
            <img style={{ width: "100%" }} src={img1} alt="" />
          </Link>

          <div
            className="offcanvas CustomHeaderOffcan offcanvas-end py-lg-2 OffCanWidth"
            tabIndex={-1}
            id="offcanvasNavbar"
            aria-labelledby="topNavBar"
          >
            <div className="offcanvas-header">
              <h5
                className="offcanvas-title"
                id="topNavBar"
                style={{ maxWidth: "200px" }}
              >
                <img style={{ width: "100%" }} src={img1} alt="" />
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              />
            </div>
            <div className="offcanvas-body ps-4">
              <form
                className="d-flex mx-auto align-items-center btn-group flex-grow-1 d-lg-none d-xl-flex"
                style={{ maxWidth: "700px" }}
                role="search"
              >
                <input
                  className="form-control  shadow-none rounded-end-0 border"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
                <button
                  className="btn border-mainBlue border border-2 btn-hoverBlue shadow-none text-nowrap"
                  type="submit"
                >
                  <i className="fa fa-search" aria-hidden="true" />
                </button>
              </form>
              <ul className="navbar-nav CustomNav text-nowrap align-items-start flex-grow-1 align-items-lg-center justify-content-end fs-small">
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" aria-current="page" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Doctors">
                    Doctor
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Clinic">
                    Clinic
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/venders/labs">
                    Labs
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Pharmacy">
                    Pharmacy
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <button
                    className="nav-link text-start"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Shop
                    <i
                      className="fa fa-chevron-down ms-1 fs-7 CurrentColor"
                      aria-hidden="true"
                    />
                  </button>
                  <ul
                    className="dropdown-menu border-0 shadow-sm"
                    style={{ top: "31px" }}
                  >
                    <li className="w-100" data-bs-dismiss="offcanvas">
                      <Link className="dropdown-item" to="/shop/BuyMedicine">
                        Buy Medicine
                      </Link>
                    </li>
                    <li className="w-100" data-bs-dismiss="offcanvas">
                      <Link
                        className="dropdown-item"
                        to="/shop/FoodAndNurition"
                      >
                        Food & Nurition
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/CareProgram">
                    Care Program
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Science">
                    Science
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/AboutUs">
                    About Us
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/Blogs">
                    Blogs
                  </Link>
                </li>
                <li className="nav-item" data-bs-dismiss="offcanvas">
                  <Link className="nav-link" to="/videos">
                    Videos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <button
              className="navbar-toggler border-0 fw-bold shadow-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
              aria-controls="offcanvasNavbar"
              aria-label="Toggle navigation"
            >
              <i className="fa-solid fa-bars-staggered"></i>
            </button>
            <div className="dropdown ">
              <button
                className="btn py-1 shadow-none border-0 border rounded-circle main-bg-dark d-xl-block ms-xl-0 my-xl-0 w-100 my-2 "
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/64/64572.png"
                  className="imgFilter"
                  width={30}
                  alt=""
                />
              </button>
              <div
                className="dropdown-menu profileDropdwn  rounded-4 DropdwnScale me-5"
                style={{ marginTop: "65px" }}
              >
                <div className="border-bottom px-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="w-auto link-dark">
                      <Link to="/UserLogin" className="fw-bold fs-5 textBlack">
                        hey User
                      </Link>
                      <br />
                      <Link to="update-profile" className="fw-medium link-danger fs-7">
                        View Profile
                      </Link>
                    </div>
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/64/64572.png"
                      className=" imgFilter"
                      width={30}
                      alt=""
                    />
                  </div>
                </div>
                <div className="py-3 px-2 d-flex flex-column">
                  <button className="btn border-0 fw-bold  w-100 rounded-bottom-0 text-start">
                    <i className="ri-login-circle-line fw-medium fs-4" />
                    <Link to="/UserLogin" className="ms-3">
                      Login
                    </Link>
                  </button>
                  <button className="btn border-0 fw-bold  w-100 rounded-bottom-0 text-start" onClick={logout}>
                    <i className="ri-logout-circle-line fw-medium fs-4" />
                    <span className="ms-3">Log out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};


export default Header;
