import React from 'react'
import profileCover from '../../../Assets/img/Pharmacy/PharmacyProfileCover.png'

const PharmacyProfile = () => {
  return (
    <>
       <div className="container-fluid g-0">
          <div className="coverImgBox" style={{backgroundImage:`url(${profileCover})`}} />
        </div>
        {/* section medicos----direction and call */}
        <div className="container-xl container-fluid ">
          <div className="translate-middle-y" style={{maxHeight: '100px', maxWidth: '200px', marginTop: '-50px'}}>
            <img src="https://img.freepik.com/free-vector/pharmacy-paper-bag-medicine_603843-3825.jpg?semt=sph" className="img-fluid profileImg rounded-circle" alt="" />
          </div>
          <div className="row mt-5">
            <div className="col-12 mt-5 pt-5">
              <h3>Deep Brothers Medicos</h3>
              <p className="mb-1">
                <i className="ri-map-pin-range-fill" />
                sco 41 block-c market, Desumanjra Rd .<span style={{color: 'green'}}>
                  Open 24 hrs</span>
              </p>
            <div className="d-flex gap-2">
            <button className="btn text-danger border-RedLight btn-mainLightRed ">
                <i className="ri-direction-fill" />
                <b> Direction</b>
              </button>
              <button className="btn text-danger border-RedLight btn-mainLightRed ">
                <i className="ri-phone-line" />
                <b> Call</b>
              </button>
            </div>
            </div>
          </div>
        
        </div>
        {/* end of section direction and call */}
        {/* SEction 3 about  */}
        <div className="container-xl container-fluid my-5">
          <div className="row">
            <div className="col-md-4 mt-md-0 mt-3">
              <h1>About</h1>
              <p className="mb-1">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Blanditiis modi facilis distinctio quas? Architecto jhkhkj
                mvhgjgj mvhgjg gcgcgc aliqua.
              </p>
            </div>
            <div className="col-md-4 mt-md-0 mt-3">
              <h1>Timings</h1>
              <h5 className="fs-Xsmall">Mon to Sat</h5>
              <p className="mb-1">
                10:00 AM - 12:00 PM
              </p>
              <p className="mb-1">
                02:00 PM - 08:00 PM
              </p>
              <h5 className="fs-Xsmall">Sun</h5>
              <p className="mb-1">
                10:00 AM - 02:00 PM
              </p>
              {/* end of column */}
            </div>
            <div className="col-md-4 mt-md-0 mt-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title" style={{fontSize: '15px'}}>
                    <i className="ri-map-pin-range-fill" />
                    Visit the Shop
                  </h5>
                  <h6 className="card-subtitle mb-2" style={{paddingTop: '10px', fontSize: '20px', color: 'black'}}>
                    Deep Brothers Medicos
                  </h6>
                  <p className="mb-1">sco 41 block-c market, Desumanjra Rd</p>
                </div>
              </div>
            </div>
          </div>
        </div>   
    </>
  )
}

export default PharmacyProfile