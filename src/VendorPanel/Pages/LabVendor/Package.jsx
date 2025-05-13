import axios from "axios";
import React, { useState, useEffect } from "react";

const Package = () => {
  const [activeTab, setActiveTab] = useState("Ongoing");
  const [allTests, setAllTests] = useState([]);

  const URL = process.env.REACT_APP_API_URL;

  const statusMap = {
    Ongoing: 0,
    OnHold: 0,
    Closed: 1,
  };

  useEffect(() => {
    getalltest(statusMap[activeTab]);
  }, [activeTab]);

  const getalltest = async (status) => {
    try {
      const verify = JSON.parse(sessionStorage.getItem("labtoken"));

      const { data } = await axios.get(
        `${URL}/package/all-package?status=${status}`,
        {
          headers: {
            token: verify.token,
          },
        }
      );

      if (data.success) {
        setAllTests(data.details);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const remove = async (id) => {
    try {
      const verify = JSON.parse(sessionStorage.getItem("labtoken"));
      const { data } = await axios.patch(
        `${URL}/package/status/${id}`,
        {},
        {
          headers: {
            token: verify.token,
          },
        }
      );
      if (data.success) {
        getalltest(statusMap[activeTab]);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const icons = [
    "https://via.placeholder.com/50?text=Blood",
    "https://via.placeholder.com/50?text=Urine",
    "https://via.placeholder.com/50?text=Saliva",
  ];

  const getRandomIcon = () => {
    return icons[Math.floor(Math.random() * icons.length)];
  };

  return (
    <>
      <ul
        className="nav nav-pills gap-3 navAndTabs1 mb-3"
        id="pills-tab"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Ongoing" ? "active" : ""}`}
            id="ongoing-tab"
            data-bs-toggle="pill"
            data-bs-target="#ongoing"
            type="button"
            role="tab"
            aria-controls="ongoing"
            aria-selected={activeTab === "Ongoing"}
            onClick={() => setActiveTab("Ongoing")}
          >
            Ongoing
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "OnHold" ? "active" : ""}`}
            id="onhold-tab"
            data-bs-toggle="pill"
            data-bs-target="#onhold"
            type="button"
            role="tab"
            aria-controls="onhold"
            aria-selected={activeTab === "OnHold"}
            onClick={() => setActiveTab("OnHold")}
          >
            On-Hold
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "Closed" ? "active" : ""}`}
            id="closed-tab"
            data-bs-toggle="pill"
            data-bs-target="#closed"
            type="button"
            role="tab"
            aria-controls="closed"
            aria-selected={activeTab === "Closed"}
            onClick={() => setActiveTab("Closed")}
          >
            Closed
          </button>
        </li>
      </ul>

      <div className="tab-content" id="pills-tabContent">
        {/* Ongoing Tab */}
        <div
          className={`tab-pane fade ${
            activeTab === "Ongoing" ? "show active" : ""
          }`}
          id="ongoing"
          role="tabpanel"
          aria-labelledby="ongoing-tab"
        >
          <div className="p-2">
            <div
              className="d-grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))",
              }}
            >
              {allTests.map((pkg) => (
                <div className="card test-card p-2" key={pkg.id}>
                  <div
                    className="d-flex align-items-start"
                    style={{ minHeight: "150px" }}
                  >
                    <img
                      src={getRandomIcon()}
                      alt={pkg.name}
                      className="icon-img me-3"
                    />
                    <div>
                      <h5 className="card-title">{pkg.name}</h5>
                      <p className="text-muted mb-1">
                        Test Type:{" "}
                        <span className="fw-bold">{pkg.testType}</span>
                      </p>
                      <p className="text-muted mb-1">
                        Price: <span className="fw-bold">₹{pkg.price}</span>
                      </p>
                      <p className="text-muted mb-1">
                        Sample Required:{" "}
                        <span className="fw-bold">{pkg.sampleRequired}</span>
                      </p>
                      <p className="text-muted mb-1">
                        Sample Collected In:{" "}
                        <span className="fw-bold">{pkg.sampleCollection}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-muted mb-1">
                      <span className="fw-bold">Description:</span>{" "}
                      {pkg.description}
                    </p>
                    <p className="text-muted mb-1">
                      <span className="fw-bold multiLineTrunc">
                        Precautions:
                      </span>{" "}
                      <p className="multiLineTrunc">{pkg.precautions}</p>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* On-Hold Tab */}
        <div
          className={`tab-pane fade ${
            activeTab === "OnHold" ? "show active" : ""
          }`}
          id="onhold"
          role="tabpanel"
          aria-labelledby="onhold-tab"
        >
          <div className="p-2">
            <div
              className="d-grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))",
              }}
            >
              {allTests.map((pkg) => (
                <div className="card test-card p-2" key={pkg.id}>
                  <div
                    className="d-flex align-items-start"
                    style={{ minHeight: "150px" }}
                  >
                    <img
                      src={getRandomIcon()}
                      alt={pkg.name}
                      className="icon-img me-3"
                    />
                    <div style={{ minHeight: "80px" }}>
                      <h5 className="card-title">{pkg.name}</h5>
                      <p className="text-muted mb-1">
                        Test Type:{" "}
                        <span className="fw-bold">{pkg.testType}</span>
                      </p>
                      <p className="text-muted mb-1">
                        Price: <span className="fw-bold">₹{pkg.price}</span>
                      </p>
                      <p className="text-muted mb-1">
                        Sample Required:{" "}
                        <span className="fw-bold">{pkg.sampleRequired}</span>
                      </p>
                      <p className="text-muted mb-1">
                        Sample Collected In:{" "}
                        <span className="fw-bold">{pkg.sampleCollection}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3" style={{ minHeight: "97px" }}>
                    <p className="text-muted mb-1">
                      <span className="fw-bold">Description:</span>{" "}
                      {pkg.description}
                    </p>
                    <p className="text-muted mb-1">
                      <span className="fw-bold multiLineTrunc">
                        Precautions:
                      </span>{" "}
                      <p className="multiLineTrunc">{pkg.precautions}</p>
                    </p>
                  </div>
                  <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-outline-primary w-45">
                      Edit
                    </button>
                    <button
                      className="btn btn-outline-danger w-45"
                      onClick={() => remove(pkg._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closed Tab */}
        <div
          className={`tab-pane fade ${
            activeTab === "Closed" ? "show active" : ""
          }`}
          id="closed"
          role="tabpanel"
          aria-labelledby="closed-tab"
        >
          <div className="p-2">
            <div
              className="d-grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))",
              }}
            >
              {allTests.map((pkg) => (
                <div className="card test-card p-2" key={pkg.id}>
                  <div
                    className="d-flex align-items-start"
                    style={{ minHeight: "150px" }}
                  >
                    <img
                      src={getRandomIcon()}
                      alt={pkg.name}
                      className="icon-img me-3"
                    />
                    <div style={{ minHeight: "80px" }}>
                      <h5 className="card-title">{pkg.name}</h5>
                      <p className="text-muted mb-1">
                        Test Type:{" "}
                        <span className="fw-bold">{pkg.testType}</span>
                      </p>
                      <p className="text-muted mb-1">
                        Price: <span className="fw-bold">₹{pkg.price}</span>
                      </p>
                      <p className="text-muted mb-1">
                        Sample Required:{" "}
                        <span className="fw-bold">{pkg.sampleRequired}</span>
                      </p>
                      <p className="text-muted mb-1">
                        Sample Collected In:{" "}
                        <span className="fw-bold">{pkg.sampleCollection}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3" style={{ minHeight: "97px" }}>
                    <p className="text-muted mb-1">
                      <span className="fw-bold">Description:</span>{" "}
                      {pkg.description}
                    </p>
                    <p className="text-muted mb-1">
                      <span className="fw-bold multiLineTrunc">
                        Precautions:
                      </span>{" "}
                      <p className="multiLineTrunc">{pkg.precautions}</p>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Package;
