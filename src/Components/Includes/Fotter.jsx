import React from 'react'
import img1 from '../Assets/img/Logo.png'
import img2 from '../Assets/img/Accessible.svg';
import img3 from '../Assets/img/Affordable.svg'; 
import img5 from '../Assets/img/Easy.svg'; 
import fimg1 from '../Assets/img/visa.png';
import fimg2 from '../Assets/img/MasterCard.png';
import fimg3 from '../Assets/img/american.png';
import fimg4 from '../Assets/img/rupay.png';
import fimg5 from '../Assets/img/CashOnDelivery.png';
import fimg6 from '../Assets/img/Netbanking.png';
import { Link } from 'react-router-dom';


const Fotter = () => {
  return (
    <>
       <footer>
        <div className="container px-3 py-4 border-top">
          <div className="row">
            <div className="col-md col-6">
              <h6 className="fw-bold text-primary-emphasis link-primary">SHOP PRODUCTS</h6>
              <ul className="list-unstyled">
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Monitoring Devices</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Strips and Accessories</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Ayurveda and Medicines</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Guilt Free Food</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Detox Drinks</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Medicines</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Lab Tests</Link></li>
              </ul>
            </div>
            <div className="col-md col-6">
              <h6 className="fw-bold text-primary-emphasis link-primary">BLOG</h6>
              <ul className="list-unstyled">
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Diabetic Basics</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Diabetes Care &amp; Management</Link>
                </li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Diabetes Diet</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Diabetic Lifestyle</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Exercise For Diabetes</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Nutrition</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Tips &amp; Tricks</Link></li>
              </ul>
            </div>
            <div className="col-md col-6">
              <h6 className="fw-bold text-primary-emphasis link-primary">QUICK LINKS</h6>
              <ul className="list-unstyled">
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">About Us</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Contact Us</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Privacy Policy</Link></li>
                <li><Link to="/" className="text-decoration-none fw-semibold link-secondary">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
            <div className="col-md col-6">
              <h6 className="fw-bold text-primary-emphasis link-primary">SOCIAL LINKS</h6>
            
              <ul className="d-flex gap-3 align-items-center nav text-current">
                <li><Link to="/"><i className="fa-brands fs-3 fa-square-facebook" /></Link></li>
                <li><Link to="/"><i className="fa-brands fs-3 fa-square-instagram" /></Link></li>
                <li><Link to="/"><i className="fa-brands fs-3 fa-square-x-twitter" /></Link></li>
                <li><Link to="/"><i className="fa-brands fs-3 fa-square-youtube" /></Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container ">
          <div className="row justify-content-center">
            <div className="w-100 d-flex flex-wrap">
              <div className="mx-auto" style={{maxWidth: '300px'}}>
                <div className="row">
                  <div className="w-auto">
                    <img src={img5} width="60px" alt="" />
                  </div>
                  <div className="col-8">
                    <h2 className="text-colorrr">
                      Easy</h2>
                    <h6 className="text-muted fw-senibold text-secondary">We make good health simple</h6>
                  </div>
                </div>
              </div>
              <div className="mx-auto" style={{maxWidth: '300px'}}>
                <div className="row">
                  <div className="w-auto">
                    <img src={img3} width="60px" alt="" />
                  </div>
                  <div className="col-8">
                    <h2 className="text-colorrr">
                      Affordable</h2>
                    <h6 className="text-muted fw-senibold text-secondary">Everyone deserves to be healthy</h6>
                  </div>
                </div>
              </div>
              <div className="mx-auto" style={{maxWidth: '300px'}}>
                <div className="row">
                  <div className="w-auto">
                    <img src={img2} width="60px" alt="" />
                  </div>
                  <div className="col-8">
                    <h2 className="text-colorrr">Accessible</h2>
                    <h6 className="text-muted fw-senibold text-secondary">Quality healthcare access for all</h6>
                  </div>
                </div>
              </div>
              <div className="mx-auto" style={{maxWidth: '300px'}}>
                <div className="row">
                  <div className="w-auto">
                    <img src={img2} width="60px" alt="" />
                  </div>
                  <div className="col-8">
                    <h2 className="text-colorrr">Accessible</h2>
                    <h6 className="text-muted fw-senibold text-secondary">Quality healthcare access for all</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-5 w-100 border-top py-3 flex-wrap">
            <div className="col col-sm d-flex align-items-center">
              <h6 className="fw-semibold mb-0 me-3">Know more about </h6>
              <img src={img1} width="90px" alt="" />
            </div>
            <div className="col-sm ">
              <div className="d-flex justify-content-end align-items-center flex-wrap">
                <img src={fimg1} width="70px" alt="" />
                <img src={fimg2} width="70px" alt="" />
                <img src={fimg3} width="70px" alt="" />
                <img src={fimg4} width="70px" alt="" />
                <img src={fimg5} width="70px" alt="" />
                <img src={fimg6} width="70px" alt="" />
              </div>
            </div>
          </div>
        </div>
      </footer>   
    </>
  )
}

export default Fotter