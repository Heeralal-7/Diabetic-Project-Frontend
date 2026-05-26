import React, { useState, useContext } from 'react';
import { MyContext } from '../../../../Context/Context';

const UserOrderCard = ({ orderId, orderType, orderAmount }) => {
  const { checkCancellationCharge, cancelOrderUser } = useContext(MyContext);
  const [cancellationInfo, setCancellationInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckCancellation = async () => {
    try {
      setLoading(true);
      const info = await checkCancellationCharge(orderId, orderType);
      setCancellationInfo(info);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt("Please enter cancellation reason:");
    if (!reason) return;

    try {
      setLoading(true);
      const result = await cancelOrderUser(orderId, orderType, reason);
      alert(`Order cancelled! Refund: ₹${result.refundAmount}`);
      // Refresh orders list
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-card">
      <h3>Order #{orderId}</h3>
      <p>Amount: ₹{orderAmount}</p>
      <p>Type: {orderType}</p>
      
      <button onClick={handleCheckCancellation} disabled={loading}>
        {loading ? 'Checking...' : 'Check Cancellation Charge'}
      </button>
      
      {cancellationInfo && (
        <div className="cancellation-info">
          <p>Charge: ₹{cancellationInfo.cancellationCharge}</p>
          <p>Refund: ₹{cancellationInfo.refundAmount}</p>
          <button onClick={handleCancelOrder} disabled={loading}>
            {loading ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}
    </div>
  );
};
export default UserOrderCard;