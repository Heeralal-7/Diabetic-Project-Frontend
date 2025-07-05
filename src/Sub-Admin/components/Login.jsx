import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../Context/Context";
// import { useForm } from "react-hook-form";
const SubAdminLogin = () => {
  const { adminLogin } = useContext(MyContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const key = e.target.name;
    const value = e.target.value;
    setFormData({ ...formData, [key]: value });
  };

  return (
    <>
      <>
        {/* Login 2 - Bootstrap Brain Component */}
        <div
          className="bg-light py-3 py-md-5 "
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="container">
            <div className="row justify-content-md-center align-items-center">
              <div className="col-12 col-md-11 col-lg-8 col-xl-7 col-xxl-6">
                <div className="bg-white p-4 p-md-5 rounded shadow-sm">
                  <div className="row">
                    <div className="col-12">
                      <div className="mb-5">
                        <h3>Log in</h3>
                      </div>
                    </div>
                  </div>
                  <form
                    action=""
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (formData.email !== "" && formData.password !== "") {
                        adminLogin(formData);
                        setFormData({ email: "", password: "" });
                      }
                    }}
                  >
                    <div className="row gy-3 gy-md-4 overflow-hidden">
                      <div className="col-12">
                        <label htmlFor="email" className="form-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          id="email"
                          placeholder="Enter your email..."
                          required=""
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {formData.email === "" && (
                          <p style={{ color: "red" }}>
                            Please enter your email
                          </p>
                        )}
                      </div>
                      <div className="col-12">
                        <label htmlFor="password" className="form-label">
                          Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          id="password"
                          required=""
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                        />
                        {formData.password === "" && (
                          <p style={{ color: "red" }}>
                            Please enter your password
                          </p>
                        )}
                      </div>
                      <div className="col-12">
                        <div className="d-grid">
                          <button
                            className="btn btn-lg btn-primary"
                            type="submit"
                          >
                            Log in now
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default SubAdminLogin;
