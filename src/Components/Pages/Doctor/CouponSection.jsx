import React, { useState, useContext } from 'react';
import { MyContext } from '../../../Context/Context';

const CouponSection = ({ doctorId, price, onCouponApplied }) => {
  const { applyCoupon, getCoupon, coupons3, loading } = useContext(MyContext);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showAvailable, setShowAvailable] = useState(false);
  const [message, setMessage] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setMessage('Please enter a coupon code');
      return;
    }
    
    setMessage('');
    try {
      const result = await applyCoupon({
        couponCode: couponCode.trim(),
        doctorId,
        price: parseFloat(price)
      });
      
      if (result.success === 1) {
        setAppliedCoupon(result);
        setMessage('Coupon applied successfully!');
        if (onCouponApplied) {
          onCouponApplied(result);
        }
      } else {
        setMessage(result.message || 'Failed to apply coupon');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setMessage('Error applying coupon. Please try again.');
    }
  };

  const handleShowAvailable = async () => {
    if (!showAvailable) {
      try {
        await getCoupon(doctorId);
      } catch (error) {
        setMessage('Error loading coupons');
      }
    }
    setShowAvailable(!showAvailable);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setMessage('');
    if (onCouponApplied) {
      onCouponApplied(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Apply Coupon</h5>
      </div>
      <div className="card-body">
        {message && (
          <div className={`alert ${appliedCoupon ? 'alert-success' : 'alert-danger'} mb-3`}>
            {message}
          </div>
        )}

        {appliedCoupon ? (
          <div className="alert alert-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6>Coupon Applied Successfully!</h6>
                <p className="mb-1">Original Price: ₹{appliedCoupon.originalPrice}</p>
                <p className="mb-1">Discounted Price: ₹{appliedCoupon.discountedPrice}</p>
                <p className="mb-0">You saved: ₹{appliedCoupon.originalPrice - appliedCoupon.discountedPrice}</p>
              </div>
              <button 
                className="btn btn-sm btn-outline-danger"
                onClick={removeCoupon}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={loading}
              />
              <button 
                className="btn btn-primary"
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
              >
                {loading ? 'Applying...' : 'Apply'}
              </button>
            </div>
            
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={handleShowAvailable}
              disabled={loading}
            >
              {showAvailable ? 'Hide Available Coupons' : 'Show Available Coupons'}
            </button>

            {showAvailable && coupons3 && coupons3.length > 0 && (
              <div className="mt-3">
                <h6>Available Coupons:</h6>
                <div className="row">
                  {coupons3.map(coupon => (
                    <div key={coupon._id} className="col-12 mb-2">
                      <div className="card">
                        <div className="card-body py-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{coupon.couponCode}</strong>
                              <br />
                              <small>{coupon.percentageDiscount} off</small>
                            </div>
                            <div>
                              <small className="text-muted">
                                Valid until: {coupon.expireDate}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showAvailable && coupons3 && coupons3.length === 0 && (
              <div className="mt-3">
                <p className="text-muted">No coupons available for this doctor.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CouponSection;