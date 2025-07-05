import React, { useContext } from 'react';
import { MyContext } from '../../../Context/Context';
const Services = () => {
  const { selectedServices, setSelectedServices } = useContext(MyContext);

  const handleCheckboxChange = (service) => {
    setSelectedServices(prev => {
      const newState = {
        ...prev,
        [service]: !prev[service]
      };
     
      if (service === 'fullAccess' && !prev.fullAccess) {
        newState.labVendor = true;
        newState.pharmacy = true;
        newState.user = true;
        newState.foodVendor = true;
        newState.doctor = true;
        newState.addblog = true;
      }
      else if (service === 'fullAccess' && prev.fullAccess) {
        newState.labVendor = false;
        newState.pharmacy = false;
        newState.user = false;
        newState.foodVendor = false;
        newState.doctor = false;
        newState.addblog = false;
      }
     
      return newState;
    });
  };

  const handleSave = () => {
    // Changes are already saved via useEffect in ServicesProvider
    alert('Preferences saved successfully!');
  };

  const ServiceOption = ({ id, label, checked }) => (
    <div
      className={`p-3 border rounded mb-3 ${checked ? 'border-primary bg-light' : 'border-secondary'}`}
      onClick={() => handleCheckboxChange(id)}
      style={{ 
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input shadow-none"
          id={id}
          checked={checked}
          onChange={() => {}}
          style={{
            width: '1.5em',
            height: '1.5em',
            marginRight: '0.75rem',
            cursor: 'pointer'
          }}
        />
        <label
          className="form-check-label fs-5"
          htmlFor={id}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          {label}
        </label>
      </div>
    </div>
  );
 
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-sm-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3 shadow">
              <h2 className="card-title text-center mb-4">Select Services</h2>
             
              <div className="mb-4">
                <ServiceOption 
                  id="labVendor" 
                  label="Lab Vendor" 
                  checked={selectedServices.labVendor} 
                />
                <ServiceOption 
                  id="pharmacy" 
                  label="Pharmacy" 
                  checked={selectedServices.pharmacy} 
                />
                <ServiceOption 
                  id="user" 
                  label="User" 
                  checked={selectedServices.user} 
                />
                <ServiceOption 
                  id="foodVendor" 
                  label="Food Vendor" 
                  checked={selectedServices.foodVendor} 
                />
                <ServiceOption 
                  id="doctor" 
                  label="Doctor" 
                  checked={selectedServices.doctor} 
                />
                <ServiceOption 
                  id="addblog" 
                  label="addblog" 
                  checked={selectedServices.blog} 
                />
                <div className="mt-4 pt-3 border-top">
                  <ServiceOption 
                    id="fullAccess" 
                    label="Full Access (Select All)" 
                    checked={selectedServices.fullAccess} 
                  />
                </div>
              </div>
             
              <div className="d-grid gap-2">
                <button className="btn btn-primary btn-lg" onClick={handleSave}>
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
 
export default Services;