import React from 'react'
import { Link } from 'react-router-dom';

const VendorDashboard = () => {
  const vendorImages = [
    "https://via.placeholder.com/50",
    "https://via.placeholder.com/50",
    "https://via.placeholder.com/50",
    "https://via.placeholder.com/50",
    "https://via.placeholder.com/50",
  ];
  return (
    <>
       <div className="container-fluid">
        <div className="row">
         <div className="d-grid gap-3" style={{gridTemplateColumns:"repeat(auto-fill, minmax(16rem, 1fr))"}}>
            <Link to="">
              {/* Simple card */}
              <div className="card h-100">
                {/* card body */}
                <div className="card-body">
                  {/* heading */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">Lab</h3>
                  </div>

                  {/* Static Project Number */}
                  <div className="lh-sm">
                    <h4 className="mb-3 fw-bold">6</h4>
                  </div>

                  {/* Static Vendor List */}
                  <div className="d-flex">
                    {vendorImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Vendor ${index + 1}`}
                        style={{
                          borderRadius: "50%",
                          height: "50px",
                          width: "50px",
                          marginLeft: index === 0 ? "0" : "-10px", // Adjust margin for overlapping effect
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
            <Link to="">
              {/* Simple card */}
              <div className="card h-100">
                {/* card body */}
                <div className="card-body">
                  {/* heading */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">Lab</h3>
                  </div>

                  {/* Static Project Number */}
                  <div className="lh-sm">
                    <h4 className="mb-3 fw-bold">5</h4>
                  </div>

                  {/* Static Vendor List */}
                  <div className="d-flex">
                    {vendorImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Vendor ${index + 1}`}
                        style={{
                          borderRadius: "50%",
                          height: "50px",
                          width: "50px",
                          marginLeft: index === 0 ? "0" : "-10px", // Adjust margin for overlapping effect
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
            <Link to="">
              {/* Simple card */}
              <div className="card h-100">
                {/* card body */}
                <div className="card-body">
                  {/* heading */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">Lab</h3>
                  </div>

                  {/* Static Project Number */}
                  <div className="lh-sm">
                    <h4 className="mb-3 fw-bold">5</h4>
                  </div>

                  {/* Static Vendor List */}
                  <div className="d-flex">
                    {vendorImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Vendor ${index + 1}`}
                        style={{
                          borderRadius: "50%",
                          height: "50px",
                          width: "50px",
                          marginLeft: index === 0 ? "0" : "-10px", // Adjust margin for overlapping effect
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
         </div>
        </div>
      </div> 
    </>
  )
}

export default VendorDashboard
