import React, { useContext, useState } from "react";
import { MyContext } from "../../../Context/Context"; // adjust this path as per your project
 
function Insurance() {
  const { addInsuranceTypeSubadmin } = useContext(MyContext);
  const [insuranceType, setInsuranceType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
 
  const handleUpload = async () => {
    if (!insuranceType.trim()) {
      alert("Please enter insurance type");
      return;
    }
 
    setIsLoading(true);
 
    const payload = {
      addInsurance: insuranceType,
    };
 
    const result = await addInsuranceTypeSubadmin(payload);
 
    setIsLoading(false);
 
    if (result?.success === 1) {
      setInsuranceType("");
    }
  };
 
  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4 mb-md-5">
                  <h1 className="h3 fw-bold text-dark mb-0">Insurance Upload</h1>
                  <p className="text-muted mt-2">Subadmin Insurance Management</p>
                </div>
 
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="insuranceType" className="form-label fw-medium text-dark mb-2">
                      Insurance Type
                    </label>
                    <input
                      type="text"
                      value={insuranceType}
                      onChange={(e) => setInsuranceType(e.target.value)}
                      className="form-control shadow-none border border-1 form-control-lg bg-light rounded-3 px-3 py-3"
                      id="insuranceType"
                      placeholder="Enter insurance name"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
 
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-primary w-100 py-3 rounded-3 fw-medium"
                      onClick={handleUpload}
                      style={{ fontSize: '16px' }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            style={{ width: '16px', height: '16px' }}
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="me-2"
                            viewBox="0 0 16 16"
                          >
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 0 1-.708-.708l3-3z" />
                          </svg>
                          Create Insurance
                        </>
                      )}
                    </button>
                  </div>
                </div>
 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default Insurance;