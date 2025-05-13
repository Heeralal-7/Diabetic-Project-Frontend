import React from 'react';

const PharGenerateCoupon = () => {
  return (
    <div>
      <h2>Generate New Coupon</h2>
      <p>Use this form to create new coupons for your pharmacy. You can set the coupon code, discount percentage, expiration date, and usage limits to control how customers can redeem them.</p>
      <form>
        <label>Coupon Code:</label>
        <input type="text" placeholder="Enter coupon code" />
        
        <label>Discount:</label>
        <input type="number" placeholder="Enter discount percentage" />
        
        <label>Expiration Date:</label>
        <input type="date" />
        
        <label>Usage Limit:</label>
        <input type="number" placeholder="Enter usage limit" />
        
        <button type="submit">Generate Coupon</button>
      </form>
    </div>
  );
};

export default PharGenerateCoupon;
