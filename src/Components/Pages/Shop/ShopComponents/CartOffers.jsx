import React, { useState, useContext, useEffect } from "react";
import { MyContext } from "../../../../Context/Context";
import moment from "moment";

const CartOffers = ({ 
  vendorId, 
  onCouponApplied,
  mainTitle = "Coupons & Offers",
  submitBtn = "bg-mainRed text-light"
}) => {
  const { getCoupons } = useContext(MyContext);
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log("CartOffers mounted with vendorId:", vendorId);
    
    if (!vendorId || typeof vendorId !== 'string' || vendorId.trim() === '') {
      console.error("Invalid vendorId:", vendorId);
      setCouponError("Vendor information not available");
      return;
    }

    fetchCoupons();
  }, [vendorId, retryCount]);

  const fetchCoupons = async () => {
    try {
      console.log("Starting to fetch coupons for vendor:", vendorId);
      
      if (!vendorId || vendorId.trim() === '') {
        throw new Error("Valid vendor ID is required");
      }
      
      setCouponLoading(true);
      setCouponError(null);
      
      const response = await getCoupons(vendorId);
      console.log("Coupons API Response:", response);
      
      if (response?.success === 1) {
        setCoupons(response.data || []);
      } else {
        throw new Error(response?.message || "Failed to fetch coupons");
      }
    } catch (error) {
      console.error("Coupon fetch error:", {
        error: error.message,
        vendorId: vendorId,
        stack: error.stack
      });
      setCouponError(error.message || "Failed to load coupons");
      
      // Auto-retry for network errors
      if (retryCount < 3 && error.message.includes('network')) {
        setTimeout(() => setRetryCount(c => c + 1), 2000);
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = (coupon) => {
    if (!coupon) return;
    
    // Validate coupon expiration
    const expiryDate = moment(coupon.expireDate, "DD/MM/YYYY");
    if (expiryDate.isBefore(moment(), 'day')) {
      setCouponError("This coupon has expired");
      return;
    }

    setSelectedCoupon(coupon);
    if (onCouponApplied) {
      onCouponApplied(coupon);
    }
  };

  // Filter coupons based on search term
  const filteredCoupons = coupons.filter(coupon => {
    const searchLower = searchTerm.toLowerCase();
    return (
      coupon.couponCode?.toLowerCase().includes(searchLower) ||
      coupon.description?.toLowerCase().includes(searchLower)
    );
  });

  const calculateDaysRemaining = (expireDate) => {
    if (!expireDate) return 0;
    return moment(expireDate, "DD/MM/YYYY").diff(moment(), 'days');
  };

  return (
    <div className="offcanvas CustomOffcan-lg-end offcanHeightFull noBackdrop" tabIndex={-1} id="CartOffers">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">{mainTitle}</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
      </div>
      
      <div className="offcanvas-body">
        {/* Search Bar */}
        <div className="d-flex border rounded-2 mb-3">
          <input
            className="form-control border-0 shadow-none"
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-sm border-0">
            <i className="ri-search-line"></i>
          </button>
        </div>

        {/* Coupon List */}
        <div className="OfferOfcanvasHeight">
          {couponLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-mainRed" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading coupons...</p>
            </div>
          ) : couponError ? (
            <div className="alert alert-danger">
              <p>{couponError}</p>
              {couponError.includes('login') ? (
                <a href="/login" className="btn btn-sm btn-outline-danger">
                  Login
                </a>
              ) : (
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setRetryCount(c => c + 1)}
                  disabled={!vendorId || vendorId.trim() === ""}
                >
                  Retry
                </button>
              )}
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-4">
              {searchTerm ? (
                <>
                  <p>No coupons match your search</p>
                  <button 
                    className="btn btn-sm btn-outline-mainRed"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <p>No coupons available for this vendor</p>
              )}
            </div>
          ) : (
            filteredCoupons.map((coupon) => {
              const daysRemaining = calculateDaysRemaining(coupon.expireDate);
              const isExpired = daysRemaining <= 0;
              const isApplied = selectedCoupon?._id === coupon._id;

              return (
                <div key={coupon._id} className="LabCartCoupon mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="fw-bold mb-1">{coupon.couponCode}</h6>
                      <p className="small mb-1">{coupon.description}</p>
                      <p className="small text-muted mb-0">
                        {coupon.couponApplied ? `Applied on: ${coupon.couponApplied}` : 'No minimum order'}
                      </p>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${isExpired ? 'bg-secondary' : 'bg-danger'}`}>
                        {isExpired ? 'Expired' : `Expires in ${daysRemaining} days`}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="fw-bold">
                      {coupon.percentageDiscount ? 
                        `${coupon.percentageDiscount}% OFF` : 
                        `₹${coupon.fixedAmountDiscount || '0'} OFF`}
                    </span>
                    <button
                      className={`btn btn-sm ${submitBtn} ${isApplied ? 'disabled' : ''}`}
                      onClick={() => !isExpired && handleApplyCoupon(coupon)}
                      disabled={isApplied || isExpired}
                    >
                      {isApplied ? 'Applied' : isExpired ? 'Expired' : 'Apply'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CartOffers;