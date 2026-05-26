import React, { useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';

const OrganTests = () => {
  const { organName } = useParams();
  const { testsByOrgan, getParticularLabTests, loading } = useContext(MyContext);

  useEffect(() => {
    if (organName) {
      getParticularLabTests(organName, 1, 50);
    }
  }, [organName]);

  const imageUrl = process.env.REACT_APP_API_URL;

  return (
    <div className="container-fluid container-xl py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb bg-transparent mb-3">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/venders/labs">Labs</Link></li>
          <li className="breadcrumb-item active">{organName} Tests</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-5 fw-bold">{organName} Tests</h1>
        <Link to="/venders/labs" className="btn btn-outline-primary">
          Back to Labs
        </Link>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="row">
        {testsByOrgan.length === 0 && !loading ? (
          <div className="col-12 text-center py-5">
            <i className="ri-flask-line fs-1 text-muted mb-3"></i>
            <h4 className="text-muted">No tests found for {organName}</h4>
          </div>
        ) : (
          testsByOrgan.map((test) => {
            const amount = parseFloat(test.amount) || 0;
            const discount = parseFloat(test.discountPercentage) || 0;
            const discountedAmount = discount > 0
              ? Math.round(amount - (amount * discount) / 100)
              : amount;

            return (
              <div key={test._id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm border-0 rounded-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title fw-bold text-primary">{test.testName}</h5>
                      <span className="badge bg-warning text-dark">
                        {test.prescription ? 'Prescription Required' : 'No Prescription'}
                      </span>
                    </div>
                         <div className="mb-3">
                      <div >
 
                        <span><small className="fw-semibold bg-success btn-sm text-white rounded-pill px-3 align-items-center ">
                          {test.vendorId.name}</small></span>
                      </div>
                    </div>
 
                    <p className="card-text text-muted small mb-3">
                      {test.description || 'Comprehensive test for accurate diagnosis'}
                    </p>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Test Type</small>
                        <small className="fw-semibold">{test.testType}</small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Sample Required</small>
                        <small className="fw-semibold">{test.sampleRequired}</small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Category</small>
                        <small className="fw-semibold">{test.testCategory}</small>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div>
                        {discount > 0 && (
                          <small className="text-decoration-line-through text-muted me-2">
                            ₹{amount}
                          </small>
                        )}
                        <span className="h5 mb-0 fw-bold text-success">
                          ₹{discountedAmount}
                        </span>
                        {discount > 0 && (
                          <small className="text-danger ms-2">({discount}% off)</small>
                        )}
                      </div>
                      <Link
                        to={`/venders/labs/Lab-details/${test.vendorId?._id}`}
                        className="btn btn-primary btn-sm rounded-pill"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrganTests;
