import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';

const PackageDetails = () => {
  const { packageName } = useParams();
  const { packageCollection, getPackageCollection, loading } = useContext(MyContext);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    if (packageName) {
      getPackageCollection(packageName, 1, 10);
    }
  }, [packageName]);

  useEffect(() => {
    if (packageCollection) {
      setSelectedPackage(packageCollection);
    }
  }, [packageCollection]);

  // Frontend पर discounted amount calculate करने का function
  const calculateDiscountedAmount = (amount, discountPercentage) => {
    const originalAmount = parseFloat(amount);
    const discount = parseFloat(discountPercentage);
    
    if (isNaN(originalAmount) || isNaN(discount)) {
      return originalAmount;
    }
    
    const discountedAmount = originalAmount - (originalAmount * discount / 100);
    return discountedAmount.toFixed(2);
  };

  const imageUrl = process.env.REACT_APP_API_URL;

  if (loading) {
    return (
      <div className="container-fluid container-xl py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPackage) {
    return (
      <div className="container-fluid container-xl py-5">
        <div className="text-center py-5">
          <i className="ri-inbox-line fs-1 text-muted mb-3"></i>
          <h4 className="text-muted">Package not found</h4>
          <Link to="/venders/labs" className="btn btn-primary mt-3">
            Back to Labs
          </Link>
        </div>
      </div>
    );
  }

  // Frontend पर final price calculate करें
  const finalPrice = calculateDiscountedAmount(
    selectedPackage.amount, 
    selectedPackage.discountPercentage
  );

  // Lab ID get करने का safe function
  const getLabId = () => {
    return selectedPackage.vendorId?._id || selectedPackage.vendorId;
  };

  // Debugging के लिए
  console.log('Lab ID:', getLabId());
  console.log('Vendor ID object:', selectedPackage.vendorId);

  return (
    <div className="container-fluid container-xl py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb bg-transparent mb-3">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/venders/labs">Labs</Link></li>
          <li className="breadcrumb-item active">{selectedPackage.packageName}</li>
        </ol>
      </nav>

      <div className="row">
        {/* Package Details */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-header bg-primary text-white rounded-top-3">
              <h2 className="h4 mb-0 fw-bold">{selectedPackage.packageName}</h2>
            </div>
            <div className="card-body p-4">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5 className="fw-bold text-primary mb-3">Package Details</h5>
                  <p className="text-muted mb-3">{selectedPackage.description}</p>
                  
                  <div className="mb-3">
                    <h6 className="fw-semibold">Precautions:</h6>
                    <p className="text-muted small">{selectedPackage.precautions}</p>
                  </div>

                  <div className="mb-3">
                    <h6 className="fw-semibold">Test Types:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedPackage.testType?.map((type, index) => (
                        <span key={index} className="badge bg-info">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <h5 className="fw-bold text-primary mb-3">Sample Information</h5>
                  
                  {selectedPackage.sampleRequired?.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-semibold">Samples Required:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedPackage.sampleRequired.map((sample, index) => (
                          <span key={index} className="badge bg-warning text-dark">
                            {sample}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPackage.sampleCollected?.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-semibold">Samples Collected:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedPackage.sampleCollected.map((sample, index) => (
                          <span key={index} className="badge bg-success">
                            {sample}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <h6 className="fw-semibold">Method:</h6>
                    <span className="badge bg-secondary">{selectedPackage.method}</span>
                  </div>
                </div>
              </div>

              {/* Included Tests */}
              <div className="mb-4">
                <h5 className="fw-bold text-primary mb-3">Tests Included</h5>
                <div className="bg-light rounded p-3">
                  {Array.isArray(selectedPackage.addTest) ? (
                    selectedPackage.addTest.map((test, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <i className="ri-checkbox-circle-fill text-success me-2"></i>
                        <span>{test}</span>
                      </div>
                    ))
                  ) : (
                    <div className="d-flex align-items-center">
                      <i className="ri-checkbox-circle-fill text-success me-2"></i>
                      <span>{selectedPackage.addTest}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

         {/* Pricing & Action - fixed overlap issue */}
<div className="col-lg-4">
  <div
    className="card shadow-sm border-0 rounded-3 sticky-top"
    style={{
      top: '120px', // Adjust this depending on your header height
      zIndex: 1, // Keeps it below the header
      position: 'sticky',
    }}
  >
    <div className="card-header bg-success text-white rounded-top-3">
      <h5 className="mb-0 fw-bold">Package Pricing</h5>
    </div>
    <div className="card-body p-4">
      <div className="text-center mb-4">
        {selectedPackage.discountPercentage > 0 && (
          <div className="mb-2">
            <span className="text-decoration-line-through text-muted h5">
              ₹{selectedPackage.amount}
            </span>
            <span className="badge bg-danger ms-2">
              {selectedPackage.discountPercentage}% OFF
            </span>
          </div>
        )}
        <h2 className="text-success fw-bold">₹{finalPrice}</h2>
        <small className="text-muted">Inclusive of all taxes</small>
 
        {selectedPackage.discountPercentage > 0 && (
          <div className="mt-2">
            <small className="text-success fw-semibold">
              You save: ₹
              {(
                parseFloat(selectedPackage.amount) - parseFloat(finalPrice)
              ).toFixed(2)}
            </small>
          </div>
        )}
      </div>
 
      <div className="d-grid gap-3">
        <Link
          to={`/venders/labs/Lab-details/${getLabId()}`}
          className="btn btn-primary btn-lg rounded-pill"
        >
          Book This Package
        </Link>
      </div>
 
      {selectedPackage.vendorId && (
        <div className="mt-4 pt-4 border-top">
          <h6 className="fw-bold mb-3">Offered By</h6>
          <div className="d-flex align-items-center">
            <img
              src={`${imageUrl}${selectedPackage.vendorId.image}`}
              alt={selectedPackage.vendorId.name}
              className="rounded-circle me-3"
              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
            />
            <div>
              <h6 className="mb-1 fw-semibold">{selectedPackage.vendorId.name}</h6>
              <small className="text-muted">{selectedPackage.vendorId.city}</small>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default PackageDetails;