import React, { useState } from 'react';
const SubServicesAdmin = () => {
  // State to track selected services
  const [selectedServices, setSelectedServices] = useState({
    labVendor: false,
    pharmacy: false,
    user: false,
    foodVendor: false,
    doctor: false,
    fullAccess: false
  });
 
  // Handle checkbox changes
  const handleCheckboxChange = (service) => {
    setSelectedServices(prev => {
      const newState = {
        ...prev,
        [service]: !prev[service]
      };
     
      // If fullAccess is selected, select all others
      if (service === 'fullAccess' && !prev.fullAccess) {
        newState.labVendor = true;
        newState.pharmacy = true;
        newState.user = true;
        newState.foodVendor = true;
        newState.doctor = true;
      }
     
      return newState;
    });
  };
 
  return (
    <div className="container py-4 ">
      <div className="row justify-content-center">
        <div className="col-md-8  col-sm-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3 shadow">
              <h2 className="card-title text-center mb-4">Select Services</h2>
             
              <div className="mb-4">
                <div
                  className="p-3 border rounded mb-3 cursor-pointer"
                  onClick={() => handleCheckboxChange('labVendor')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input shadow-none"
                      id="labVendor"
                      checked={selectedServices.labVendor}
                      readOnly
                      style={{
                        width: '1.5em',
                        height: '1.5em',
                        marginRight: '0.75rem',
                        cursor: 'pointer'
                      }}
                    />
                    <label
                      className="form-check-label fs-5 shadow-none"
                      htmlFor="labVendor"
                      style={{ cursor: 'pointer' }}
                    >
                      Lab Vendor
                    </label>
                  </div>
                </div>
               
                <div
                  className="p-3 border rounded mb-3"
                  onClick={() => handleCheckboxChange('pharmacy')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input shadow-none"
                      id="pharmacy"
                      checked={selectedServices.pharmacy}
                      readOnly
                      style={{
                        width: '1.5em',
                        height: '1.5em',
                        marginRight: '0.75rem',
                        cursor: 'pointer'
                      }}
                    />
                    <label
                      className="form-check-label fs-5"
                      htmlFor="pharmacy"
                      style={{ cursor: 'pointer' }}
                    >
                      Pharmacy
                    </label>
                  </div>
                </div>
               
                <div
                  className="p-3 border rounded mb-3"
                  onClick={() => handleCheckboxChange('user')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input shadow-none"
                      id="user"
                      checked={selectedServices.user}
                      readOnly
                      style={{
                        width: '1.5em',
                        height: '1.5em',
                        marginRight: '0.75rem',
                        cursor: 'pointer'
                      }}
                    />
                    <label
                      className="form-check-label fs-5"
                      htmlFor="user"
                      style={{ cursor: 'pointer' }}
                    >
                      User
                    </label>
                  </div>
                </div>
               
                <div
                  className="p-3 border rounded mb-3"
                  onClick={() => handleCheckboxChange('foodVendor')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input shadow-none"
                      id="foodVendor"
                      checked={selectedServices.foodVendor}
                      readOnly
                      style={{
                        width: '1.5em',
                        height: '1.5em',
                        marginRight: '0.75rem',
                        cursor: 'pointer'
                      }}
                    />
                    <label
                      className="form-check-label fs-5"
                      htmlFor="foodVendor"
                      style={{ cursor: 'pointer' }}
                    >
                      Food Vendor
                    </label>
                  </div>
                </div>
               
                <div
                  className="p-3 border rounded mb-3"
                  onClick={() => handleCheckboxChange('doctor')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input shadow-none"
                      id="doctor"
                      checked={selectedServices.doctor}
                      readOnly
                      style={{
                        width: '1.5em',
                        height: '1.5em',
                        marginRight: '0.75rem',
                        cursor: 'pointer'
                      }}
                    />
                    <label
                      className="form-check-label fs-5"
                      htmlFor="doctor"
                      style={{ cursor: 'pointer' }}
                    >
                      Doctor
                    </label>
                  </div>
                </div>
               
                <div
                  className="p-3 border rounded mb-3"
                  onClick={() => handleCheckboxChange('fullAccess')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input shadow-none"
                      id="fullAccess"
                      checked={selectedServices.fullAccess}
                      readOnly
                      style={{
                        width: '1.5em',
                        height: '1.5em',
                        marginRight: '0.75rem',
                        cursor: 'pointer'
                      }}
                    />
                    <label
                      className="form-check-label fs-5"
                      htmlFor="fullAccess"
                      style={{ cursor: 'pointer' }}
                    >
                      Full Access
                    </label>
                  </div>
                </div>
              </div>
             
              <div className="d-grid gap-2">
                <button className="btn btn-primary btn-lg">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default  SubServicesAdmin;
 