import React from 'react';

const PharCoupons = () => {
  return (
    <div>
      <h2>Coupons</h2>
      <p>Here you can manage the available coupons for your pharmacy. You can create new discount codes, manage their validity, and see how many times each coupon has been redeemed.</p>
      <table>
        <thead>
          <tr>
            <th>Coupon Code</th>
            <th>Discount</th>
            <th>Validity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>PHARMA10</td>
            <td>10%</td>
            <td>2025-05-10</td>
          </tr>
          <tr>
            <td>FREEDELIVERY</td>
            <td>Free Delivery</td>
            <td>2025-05-15</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PharCoupons;
