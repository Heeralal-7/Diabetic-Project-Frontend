import React, { useState, useContext, useEffect } from "react";
import { MyContext } from "../../../../Context/Context";
import moment from "moment";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { FaSearch, FaTag } from "react-icons/fa";
import "./PharmacyCoupon.css";

const PharmacyCoupon = ({ 
  vendorId, 
  onCouponApplied,
  mainTitle = "Pharmacy Coupons & Offers",
  submitBtn = "bg-primary text-light"
}) => {
  const { getCoupons } = useContext(MyContext);
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!vendorId || typeof vendorId !== 'string' || vendorId.trim() === '') {
      setCouponError("Pharmacy information not available");
      return;
    }
    fetchCoupons();
  }, [vendorId, retryCount]);

  const fetchCoupons = async () => {
    try {
      setCouponLoading(true);
      setCouponError(null);
      
      const response = await getCoupons(vendorId);
      
      if (response?.success === 1) {
        setCoupons(response.data || []);
      } else {
        throw new Error(response?.message || "Failed to fetch pharmacy coupons");
      }
    } catch (error) {
      console.error("Pharmacy coupon fetch error:", error);
      setCouponError(error.message || "Failed to load pharmacy coupons");
      
      if (retryCount < 3 && error.message.includes('network')) {
        setTimeout(() => setRetryCount(c => c + 1), 2000);
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = (coupon) => {
    if (!coupon) return;
    
    const expiryDate = moment(coupon.expireDate, "DD/MM/YYYY");
    if (expiryDate.isBefore(moment(), 'day')) {
      setCouponError("This pharmacy coupon has expired");
      return;
    }

    setSelectedCoupon(coupon);
    if (onCouponApplied) {
      onCouponApplied({
        ...coupon,
        couponId: coupon._id  // Send both code and ID
      });
    }
  };

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
    <div className="pharmacy-coupon-container">
      <div className="pharmacy-coupon-header">
        <h5 className="pharmacy-coupon-title">{mainTitle}</h5>
      </div>
      
      <div className="pharmacy-coupon-body">
        <div className="pharmacy-coupon-search mb-3">
          <div className="input-group">
            <Form.Control
              type="text"
              placeholder="Search pharmacy coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary">
              <FaSearch />
            </Button>
          </div>
        </div>

        <div className="pharmacy-coupon-list">
          {couponLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading pharmacy coupons...</p>
            </div>
          ) : couponError ? (
            <Alert variant="danger" className="text-center">
              <p>{couponError}</p>
              {couponError.includes('login') ? (
                <a href="/login" className="btn btn-sm btn-outline-danger">
                  Login
                </a>
              ) : (
                <Button 
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setRetryCount(c => c + 1)}
                  disabled={!vendorId || vendorId.trim() === ""}
                >
                  Retry
                </Button>
              )}
            </Alert>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-4">
              {searchTerm ? (
                <>
                  <p>No pharmacy coupons match your search</p>
                  <Button 
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </Button>
                </>
              ) : (
                <p>No coupons available for this pharmacy</p>
              )}
            </div>
          ) : (
            filteredCoupons.map((coupon) => {
              const daysRemaining = calculateDaysRemaining(coupon.expireDate);
              const isExpired = daysRemaining <= 0;
              const isApplied = selectedCoupon?._id === coupon._id;

              return (
                <div key={coupon._id} className={`pharmacy-coupon-card ${isApplied ? 'pharmacy-coupon-applied' : ''}`}>
                  <div className="pharmacy-coupon-card-header">
                    <div className="pharmacy-coupon-icon">
                      <FaTag />
                    </div>
                    <div className="pharmacy-coupon-details">
                      <h6 className="pharmacy-coupon-code">{coupon.couponCode}</h6>
                      <p className="pharmacy-coupon-desc">{coupon.description}</p>
                      <div className="pharmacy-coupon-meta">
                        {coupon.couponApplied && (
                          <span className="pharmacy-coupon-applied-on">
                            Applied on: {coupon.couponApplied}
                          </span>
                        )}
                        <span className={`pharmacy-coupon-expiry ${isExpired ? 'text-danger' : 'text-success'}`}>
                          {isExpired ? 'Expired' : `Expires in ${daysRemaining} days`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pharmacy-coupon-card-footer">
                    <div className="pharmacy-coupon-discount">
                      {coupon.percentageDiscount ? 
                        `${coupon.percentageDiscount}% OFF` : 
                        `₹${coupon.fixedAmountDiscount || '0'} OFF`}
                    </div>
                    <Button
                      variant={isApplied ? "success" : "primary"}
                      size="sm"
                      onClick={() => !isExpired && handleApplyCoupon(coupon)}
                      disabled={isApplied || isExpired}
                    >
                      {isApplied ? 'Applied' : isExpired ? 'Expired' : 'Apply'}
                    </Button>
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

export default PharmacyCoupon;