import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../../../Context/Context';
import { Link } from 'react-router-dom';
import { 
  FaFlask, FaCalendarAlt, FaClock, FaMapMarkerAlt, 
  FaFileInvoiceDollar, FaInfoCircle, FaTimes, FaCheck,
  FaDownload, FaExclamationTriangle, FaHospitalUser,
  FaVial, FaUserMd, FaPhoneAlt, FaEnvelope, FaTag, FaTruck, FaBolt, FaPercentage
} from 'react-icons/fa';

// --- Status Config ---
const STATUS_CONFIG = {
  '0': { text: 'Pending', bg: '#fff3cd', color: '#856404', icon: FaClock },
  '1': { text: 'Accepted', bg: '#cff4fc', color: '#055160', icon: FaCheck },
  '2': { text: 'Driver Assigned', bg: '#e2e3e5', color: '#41464b', icon: FaClock },
  '3': { text: 'Sample Collected', bg: '#d1e7dd', color: '#0f5132', icon: FaVial },
  '10': { text: 'Cancelled', bg: '#f8d7da', color: '#842029', icon: FaTimes },
  '4': { text: 'Driver Start', bg: '#e2e3e5', color: '#41464b', icon: FaClock },
  '5': { text: 'Sample Collected', bg: '#d1e7dd', color: '#0f5132', icon: FaCheck },
  '6': { text: ' Sample Delivered', bg: '#d1e7dd', color: '#0f5132', icon: FaCheck },
  '7': { text: 'Rejected by Driver', bg: '#f8d7da', color: '#842029', icon: FaExclamationTriangle },
  '9': { text: 'Rejected by vendor', bg: '#f8d7da', color: '#842029', icon: FaExclamationTriangle },
  '8': { text: 'Report Ready', bg: '#d1e7dd', color: '#0f5132', icon: FaFileInvoiceDollar },
};

const StatusBadge = ({ status, isCancelled }) => {
  if (isCancelled) {
    return (
      <span className="badge rounded-pill px-3 py-2 border border-danger bg-danger bg-opacity-10 text-danger">
        <FaTimes className="me-1" /> Cancelled
      </span>
    );
  }
  const config = STATUS_CONFIG[status] || { text: 'Unknown', bg: '#e2e3e5', color: '#6c757d', icon: FaInfoCircle };
  const Icon = config.icon;
  return (
    <span className="badge rounded-pill px-3 py-2 border" style={{ backgroundColor: config.bg, color: config.color, borderColor: config.color }}>
      <Icon className="me-1" /> {config.text}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// Helper function to parse date and time slot for sorting
const getAppointmentDateTime = (order) => {
  if (!order.date) return new Date(0);
  
  const appointmentDate = new Date(order.date);
  
  // If time slot exists, try to extract time from it
  if (order.timeSlot) {
    const timeMatch = order.timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
      let [_, hours, minutes, period] = timeMatch;
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      
      // Convert to 24-hour format
      if (period.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
      }
      if (period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      
      appointmentDate.setHours(hours, minutes, 0, 0);
    }
  }
  
  return appointmentDate;
};

const UserOrderHistory = () => {
  const { 
    userOrders, getUserOrderHistory, getLabOrderDetails, loading,
    checkCancellationCharge, cancelOrderUser 
  } = useContext(MyContext);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Local state for UI updates
  const [cancelState, setCancelState] = useState({
    loadingId: null,
    info: {},
    showCard: {}
  });

  useEffect(() => { 
    getUserOrderHistory(); 
  }, []);

  // --- HANDLERS ---
  const handleCheckCancellation = async (e, order) => {
    e.preventDefault();
    e.stopPropagation();
    
    const id = order._id;
    setCancelState(prev => ({ ...prev, loadingId: id }));
    
    try {
      const type = order.serviceType?.toLowerCase().includes('doctor') ? 'doctor' : 'lab';
      const info = await checkCancellationCharge(id, type);
      
      setCancelState(prev => ({
        ...prev,
        info: { ...prev.info, [id]: info },
        showCard: { ...prev.showCard, [id]: true },
        loadingId: null
      }));
    } catch (error) {
      alert(error.message);
      setCancelState(prev => ({ ...prev, loadingId: null }));
    }
  };

  const handleCancelOrder = async (e, order) => {
    e.preventDefault();
    e.stopPropagation();
    
    const id = order._id;
    const reason = prompt("Please enter a reason for cancellation:");
    if (!reason) return;

    setCancelState(prev => ({ ...prev, loadingId: id }));

    try {
      const type = order.serviceType?.toLowerCase().includes('doctor') ? 'doctor' : 'lab';
      const result = await cancelOrderUser(id, type, reason);
      
      alert(`✅ Cancellation Successful. Refund: ₹${result.refundAmount}`);
      
      setCancelState(prev => ({ 
        ...prev, 
        loadingId: null,
        showCard: { ...prev.showCard, [id]: false } 
      }));

      getUserOrderHistory(); 

    } catch (error) {
      alert(error.message);
      setCancelState(prev => ({ ...prev, loadingId: null }));
    }
  };

  const closeCancelCard = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setCancelState(prev => ({
      ...prev,
      showCard: { ...prev.showCard, [id]: false }
    }));
  };

  const openDetailsModal = async (e, id) => {
    e.preventDefault();
    console.log("Opening details for order ID:", id);
    
    const orderFromList = userOrders?.find(o => o._id === id);
    if (orderFromList?.couponId) {
        setSelectedOrder(orderFromList);
        return;
    }
    
    const res = await getLabOrderDetails(id);
    if (res.success === 1) {
        setSelectedOrder(res.order);
    }
  };

  // Sort orders by appointment date and time slot (latest first)
  const sortedAndFilteredOrders = (userOrders || [])
    .slice()
    .sort((a, b) => {
      const dateA = getAppointmentDateTime(a);
      const dateB = getAppointmentDateTime(b);
      return dateB - dateA;
    })
    .filter(o => statusFilter === 'all' || String(o.status) === statusFilter);

  const isInitialLoading = loading && (!userOrders || userOrders.length === 0);

  return (
    <div className="container-xl py-5" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <h2 className="fw-bold text-dark mb-1">My Lab Appointments</h2>
        </div>
        <div className="col-md-6 mt-3 mt-md-0 d-flex justify-content-md-end gap-3">
          <select 
            className="form-select shadow-sm" 
            style={{ borderRadius: '8px', maxWidth: '200px' }}
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.text}</option>
            ))}
          </select>
          <Link to="/venders/labs" className="btn btn-primary shadow-sm" style={{ borderRadius: '8px' }}>
            + Book Test
          </Link>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading appointments...</p>
        </div>
      ) : sortedAndFilteredOrders.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
           <h4 className="text-muted">No Appointments Found</h4>
           <Link to="/venders/labs" className="btn btn-outline-primary mt-2">Book a Lab Test</Link>
        </div>
      ) : (
        <div className="row g-4">
          {loading && !isInitialLoading && (
            <div className="col-12 text-center">
                <small className="text-primary spinner-border spinner-border-sm me-2"></small>
                <small className="text-primary">Updating status...</small>
            </div>
          )}

          {sortedAndFilteredOrders.map((order) => {
            const id = order._id;
            const isCancellable = ['0', '1', '2'].includes(String(order.status)) && order.cancellationStatus !== 'cancelled';
            const showCancel = cancelState.showCard[id];
            const isLoading = cancelState.loadingId === id;
            const info = cancelState.info[id];

            // ✅ CHANGED: Calculation using 'appliedDiscountPercentage' (Frozen Value)
            // 1. Calculate Total Base Price (Sum of MRP of all tests)
            const totalBasePrice = order.testId?.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0;
            
            // 2. Get the Frozen Discount Percentage from Order Root
            // Note: Old orders might not have this field, so fallback to 0 or test-level (optional)
            const frozenPercentage = parseFloat(order.appliedDiscountPercentage) || 0;

            // 3. Calculate Total after Discount
            const testTotal = totalBasePrice - (totalBasePrice * frozenPercentage / 100);

            const deliveryCharges = parseFloat(order.deliveryCharges) || 0;
            const rapidFee = order.isRapidDelivery ? (parseFloat(order.rapidDeliveryFee) || 0) : 0;
            const tax = parseFloat(order.tax) || 0;
            
            // Final Price
            const finalPrice = testTotal + deliveryCharges + rapidFee + tax;

            return (
              <div key={id} className="col-lg-6 col-xl-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 hover-card">
                  <div className="card-header bg-white border-bottom-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-muted small">#{id.slice(-6).toUpperCase()}</span>
                    <StatusBadge status={order.status} isCancelled={order.cancellationStatus === 'cancelled'} />
                  </div>

                  <div className="card-body px-3 pt-2">
                    <h5 className="fw-bold text-dark mb-1 text-truncate">
                      {order.vendorId?.name || 'Lab Service'}
                    </h5>
                    <div className="text-muted small mb-3 text-truncate">
                      <FaMapMarkerAlt className="me-1"/> {order.vendorId?.address}, {order.vendorId?.city}
                    </div>

                    <div className="row g-2 mb-3 bg-light rounded-3 p-2 mx-0">
                      <div className="col-6 border-end">
                        <small className="text-muted d-block">Date</small>
                        <span className="fw-medium text-dark">{formatDate(order.date).split(',')[0]}</span>
                      </div>
                      <div className="col-6 ps-3">
                        <small className="text-muted d-block">Slot</small>
                        <span className="fw-medium text-dark">{order.timeSlot || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <small className="text-muted">Final Amount</small>
                            <div className="fw-bold text-success fs-5">₹{finalPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-end">
                             <small className="text-muted">Tests</small>
                             <div className="fw-bold text-primary">{order.testId?.length || 0} Tests</div>
                        </div>
                    </div>

                    {/* Cancellation Card */}
                    {showCancel && info && (
                      <div className="alert alert-danger p-3 mb-3 shadow-sm position-relative">
                        <h6 className="fw-bold text-danger d-flex align-items-center"><FaExclamationTriangle className="me-2"/> Cancel Order?</h6>
                        
                        <div className="d-flex justify-content-between small mb-2 border-bottom pb-2">
                          <span>Cancellation Fee:</span>
                          <span className="text-danger fw-bold">₹{info.cancellationCharge}</span>
                        </div>
                        <div className="d-flex justify-content-between small mb-3">
                          <span>Refund Amount:</span>
                          <span className="text-success fw-bold">₹{info.refundAmount}</span>
                        </div>
                        
                        <div className="d-grid gap-2">
                            <button 
                                type="button"
                                className="btn btn-danger btn-sm fw-bold" 
                                onClick={(e) => handleCancelOrder(e, order)} 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Confirm Cancellation'}
                            </button>
                            <button 
                                type="button"
                                className="btn btn-light btn-sm border" 
                                onClick={(e) => closeCancelCard(e, id)}
                                disabled={isLoading}
                            >
                                Go Back
                            </button>
                        </div>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button 
                        type="button"
                        className="btn btn-primary w-100 py-2 rounded-3"
                        onClick={(e) => openDetailsModal(e, id)}
                      >
                        <FaFileInvoiceDollar className="me-2" /> Details
                      </button>
                      
                      {isCancellable && !showCancel && (
                        <button 
                          type="button"
                          className="btn btn-outline-danger w-100 py-2 rounded-3"
                          onClick={(e) => handleCheckCancellation(e, order)}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Wait...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          userOrders={userOrders} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

// --- Details Modal with Accurate Price Breakdown ---
const OrderDetailsModal = ({ order, userOrders, onClose }) => {
    const cleanPath = (path) => path ? `${process.env.REACT_APP_API_URL}/${path.startsWith('/') ? path.slice(1) : path}` : null;
    const reportUrl = cleanPath(order.report);
    const isImage = order.report?.match(/\.(jpg|jpeg|png)$/i);

    // Ensure we have full order data including coupon
    const getCompleteOrder = () => {
        if (order?.couponId) return order;
        if (userOrders && order?._id) {
            const completeOrder = userOrders.find(o => o._id === order._id);
            if (completeOrder?.couponId) return completeOrder;
        }
        return order;
    };

    const completeOrder = getCompleteOrder();

    // ✅ CHANGED: Calculation using 'appliedDiscountPercentage' inside Modal
    const calculateTestTotals = () => {
        let totalMRP = 0;
        let totalDiscounted = 0;
        const breakdown = [];

        // Get Frozen Percentage for this Order
        const frozenPct = parseFloat(completeOrder.appliedDiscountPercentage) || 0;

        if (completeOrder.testId && completeOrder.testId.length > 0) {
            completeOrder.testId.forEach(test => {
                const mrp = parseFloat(test.amount) || 0;
                
                // Calculate discounted price based on Frozen Percentage
                const discounted = mrp - (mrp * frozenPct / 100);
                
                totalMRP += mrp;
                totalDiscounted += discounted;
                
                breakdown.push({
                    testName: test.testName,
                    mrp,
                    discounted,
                    // Display the frozen percentage here
                    discountPercent: frozenPct 
                });
            });
        }
        return { totalMRP, totalDiscounted, breakdown };
    };

    const { totalMRP, totalDiscounted, breakdown } = calculateTestTotals();
    const vendorDiscount = totalMRP - totalDiscounted;

    // Delivery charges
    const deliveryCharges = parseFloat(completeOrder.deliveryCharges) || 0;
    const rapidDeliveryFee = parseFloat(completeOrder.rapidDeliveryFee) || 0;
    const isRapidDelivery = completeOrder.isRapidDelivery || false;
    const tax = parseFloat(completeOrder.tax) || 0;

    // Coupon discount
    let couponDiscount = 0;
    let couponText = '';
    if (completeOrder.couponId && completeOrder.couponId._id) {
        const coupon = completeOrder.couponId;
        if (coupon.percentageDiscount && parseFloat(coupon.percentageDiscount) > 0) {
            const percent = parseFloat(coupon.percentageDiscount);
            couponDiscount = (totalDiscounted * percent) / 100;
            if (coupon.maxDiscount && parseFloat(coupon.maxDiscount) > 0) {
                couponDiscount = Math.min(couponDiscount, parseFloat(coupon.maxDiscount));
            }
            couponText = `${percent}% OFF`;
        } else if (coupon.fixedAmountDiscount && parseFloat(coupon.fixedAmountDiscount) > 0) {
            couponDiscount = parseFloat(coupon.fixedAmountDiscount);
            couponText = `₹${couponDiscount} OFF`;
        }
    }

    const priceAfterCoupon = totalDiscounted - couponDiscount;
    const finalPrice = priceAfterCoupon + deliveryCharges + rapidDeliveryFee + tax;

    // Cancellation
    const cancellationCharge = parseFloat(completeOrder.cancellationCharge) || 0;
    const refundAmount = parseFloat(completeOrder.refundAmount) || 0;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg rounded-3">
                    
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title d-flex align-items-center">
                            <FaFlask className="me-2" /> Order Details
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body bg-light">
                        {/* Status Card */}
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0 text-muted">Order ID</h6>
                                    <span className="fw-bold text-dark">#{completeOrder._id?.slice(-8).toUpperCase()}</span>
                                </div>
                                <StatusBadge status={completeOrder.status} isCancelled={completeOrder.cancellationStatus === 'cancelled'} />
                            </div>
                        </div>

                        {/* Cancelled Alert */}
                        {completeOrder.cancellationStatus === 'cancelled' && (
                            <div className="alert alert-danger d-flex align-items-center mb-3">
                                <FaExclamationTriangle className="me-3 fs-4" />
                                <div>
                                    <strong>Order Cancelled</strong>
                                    <div className="small">Refund Processed: ₹{refundAmount} | Charge: ₹{cancellationCharge}</div>
                                </div>
                            </div>
                        )}

                        {/* Info Grid */}
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white fw-bold text-primary">
                                        <FaHospitalUser className="me-2"/> Patient
                                    </div>
                                    <div className="card-body pt-2">
                                        <h6 className="fw-bold mb-1">{completeOrder.name}</h6>
                                        <p className="text-muted small mb-1">{completeOrder.phone}</p>
                                        <p className="text-muted small">{completeOrder.address}, {completeOrder.city} - {completeOrder.pinCode}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white fw-bold text-success">
                                        <FaFlask className="me-2"/> Lab Center
                                    </div>
                                    <div className="card-body pt-2">
                                        <h6 className="fw-bold mb-1">{completeOrder.vendorId?.name || 'Lab'}</h6>
                                        <p className="text-muted small mb-1">{completeOrder.vendorId?.phone}</p>
                                        <p className="text-muted small">{completeOrder.vendorId?.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phlebotomist */}
                        {completeOrder.driverId && (
                            <div className="card border-0 shadow-sm mb-3">
                                <div className="card-body d-flex align-items-center">
                                    <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3 text-info">
                                        <FaUserMd size={24}/>
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">Phlebotomist</h6>
                                        <div className="fw-bold text-dark">{completeOrder.driverId.name}</div>
                                        <div className="text-muted small">{completeOrder.driverId.phoneNumber}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Test Breakdown */}
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-header bg-white fw-bold">Tests Breakdown</div>
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light small">
                                        <tr>
                                            <th>Test Name</th>
                                            <th className="text-end">MRP (₹)</th>
                                            <th className="text-end">Discount</th>
                                            <th className="text-end">Price after Discount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {breakdown.map((test, idx) => (
                                            <tr key={idx}>
                                                <td className="fw-medium">{test.testName}</td>
                                                <td className="text-end text-muted">{test.mrp.toFixed(2)}</td>
                                                <td className="text-end text-success">
                                                    {test.discountPercent > 0 ? `${test.discountPercent}%` : '-'}
                                                </td>
                                                <td className="text-end fw-bold text-success">{test.discounted.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        {/* Totals row */}
                                        <tr className="table-active">
                                            <td className="fw-bold">Total</td>
                                            <td className="text-end fw-bold">{totalMRP.toFixed(2)}</td>
                                            <td className="text-end fw-bold text-danger">-₹{vendorDiscount.toFixed(2)}</td>
                                            <td className="text-end fw-bold text-success">{totalDiscounted.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-header bg-white fw-bold">Complete Price Breakdown</div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Total Test Price (after discount)</span>
                                    <span className="fw-bold">₹{totalDiscounted.toFixed(2)}</span>
                                </div>

                                {/* Coupon Discount if applied */}
                                {couponDiscount > 0 && (
                                    <>
                                        <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                            <div>
                                                <span className="fw-medium d-flex align-items-center">
                                                    <FaTag className="me-2 text-success" /> 
                                                    Coupon Discount
                                                </span>
                                                <div className="text-muted small">
                                                    {completeOrder.couponId?.couponCode} {couponText && `(${couponText})`}
                                                </div>
                                            </div>
                                            <span className="text-danger fw-bold">-₹{couponDiscount.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Price after Coupon</span>
                                            <span className="fw-bold">₹{priceAfterCoupon.toFixed(2)}</span>
                                        </div>
                                    </>
                                )}

                                {/* Delivery Charges */}
                                {deliveryCharges > 0 && (
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="d-flex align-items-center">
                                            <FaTruck className="me-2 text-info" /> Delivery Charges
                                        </span>
                                        <span>+ ₹{deliveryCharges.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Rapid Delivery Fee */}
                                {rapidDeliveryFee > 0 && (
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="d-flex align-items-center text-warning">
                                            <FaBolt className="me-2" /> Rapid Delivery Fee
                                        </span>
                                        <span>+ ₹{rapidDeliveryFee.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Tax */}
                                {tax > 0 && (
                                    <div className="d-flex justify-content-between mb-2 text-muted">
                                        <span>Tax</span>
                                        <span>+ ₹{tax.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Cancellation Charge */}
                                {cancellationCharge > 0 && (
                                    <div className="d-flex justify-content-between mb-2 text-danger">
                                        <span>Cancellation Charge</span>
                                        <span>- ₹{cancellationCharge.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Refund Amount */}
                                {refundAmount > 0 && (
                                    <div className="d-flex justify-content-between mb-3 text-success border-bottom pb-3">
                                        <span>Refund Amount</span>
                                        <span>+ ₹{refundAmount.toFixed(2)}</span>
                                    </div>
                                )}

                                <hr className="my-3" />
                                
                                {/* Final Total */}
                                <div className="d-flex justify-content-between fw-bold fs-5 text-dark">
                                    <span>
                                        {completeOrder.cancellationStatus === 'cancelled' ? 'Refund Amount' : 
                                         completeOrder.paymentStatus === 'pending' ? 'Total Payable' : 'Total Paid'}
                                    </span>
                                    <span className={completeOrder.cancellationStatus === 'cancelled' ? 'text-success' : 'text-dark'}>
                                        ₹{finalPrice.toFixed(2)}
                                    </span>
                                </div>

                                {/* Payment & Cancellation Status */}
                                <div className="row mt-3">
                                    <div className="col-md-6">
                                        <div className="d-flex justify-content-between small text-muted">
                                            <span>Payment Status:</span>
                                            <span className={`fw-medium ${
                                                completeOrder.paymentStatus === 'paid' ? 'text-success' : 
                                                completeOrder.paymentStatus === 'pending' ? 'text-warning' : 'text-danger'
                                            }`}>
                                                {completeOrder.paymentStatus?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    {completeOrder.cancellationStatus && completeOrder.cancellationStatus !== 'none' && (
                                        <div className="col-md-6">
                                            <div className="d-flex justify-content-between small text-muted">
                                                <span>Cancellation Status:</span>
                                                <span className={`fw-medium ${
                                                    completeOrder.cancellationStatus === 'cancelled' ? 'text-danger' : 'text-warning'
                                                }`}>
                                                    {completeOrder.cancellationStatus?.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Delivery Type Info */}
                                {isRapidDelivery && (
                                    <div className="alert alert-warning mt-2 py-2 small">
                                        <FaBolt className="me-2" />
                                        This order was processed with <strong>Rapid Delivery</strong>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Report */}
                        {reportUrl && (
                            <div className="card border-success mb-3">
                                <div className="card-header bg-success text-white fw-bold">
                                    <FaFileInvoiceDollar className="me-2"/> Report Available
                                </div>
                                <div className="card-body text-center">
                                    {isImage && (
                                        <img src={reportUrl} alt="Report Preview" className="img-fluid rounded border mb-3" style={{maxHeight: '150px'}} />
                                    )}
                                    <div className="d-flex justify-content-center gap-2">
                                        <a href={reportUrl} target="_blank" rel="noreferrer" className="btn btn-success">
                                            <FaDownload className="me-2"/> Download Report
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-header bg-white fw-bold">Additional Information</div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Service Type</small>
                                        <div className="fw-medium">{completeOrder.serviceType || 'N/A'}</div>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Method</small>
                                        <div className="fw-medium">{completeOrder.method || 'N/A'}</div>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Appointment Date</small>
                                        <div className="fw-medium">{formatDate(completeOrder.date).split(',')[0]}</div>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Time Slot</small>
                                        <div className="fw-medium">{completeOrder.timeSlot || 'N/A'}</div>
                                    </div>
                                    {completeOrder.sampleRequired && completeOrder.sampleRequired.length > 0 && (
                                        <div className="col-12 mb-2">
                                            <small className="text-muted">Sample Required</small>
                                            <div className="fw-medium">{completeOrder.sampleRequired.join(', ')}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-footer bg-white">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserOrderHistory;
