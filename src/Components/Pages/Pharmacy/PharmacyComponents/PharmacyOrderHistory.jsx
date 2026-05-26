import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../../Context/Context';
import { Link } from 'react-router-dom';
import { 
  FaPills, FaShoppingBag, FaSearch, FaMapMarkerAlt, 
  FaCalendarAlt, FaClock, FaCheck, FaTimes, FaInfoCircle, 
  FaFileInvoiceDollar, FaExclamationTriangle, FaUser, 
  FaTruck, FaPrescriptionBottleAlt, FaPercentage,
  FaMedal, FaRupeeSign, FaFilePrescription, FaEye
} from 'react-icons/fa';
import moment from 'moment';

// --- 1. Status Configuration ---
const STATUS_CONFIG = {
  '0': { text: 'Pending', bg: '#fff3cd', color: '#856404', icon: FaClock },
  '1': { text: 'Accepted', bg: '#cff4fc', color: '#055160', icon: FaCheck },
  '2': { text: 'Driver Assigned', bg: '#e2e3e5', color: '#383d41', icon: FaUser },
  '3': { text: 'Out for Delivery', bg: '#fff3cd', color: '#856404', icon: FaTruck },
  '4': { text: 'Driver Arrived', bg: '#d1e7dd', color: '#0f5132', icon: FaMapMarkerAlt },
  '5': { text: 'Delivered', bg: '#d1e7dd', color: '#0f5132', icon: FaCheck },
  '6': { text: 'Cancelled', bg: '#f8d7da', color: '#842029', icon: FaTimes },
  '9': { text: 'Return Order', bg: '#cff4fc', color: '#055160', icon: FaCheck },
 
};

const StatusBadge = ({ status, isCancelled }) => {
  if (isCancelled) {
    return (
      <span className="badge rounded-pill px-3 py-2 border border-danger bg-danger bg-opacity-10 text-danger">
        <FaTimes className="me-1" /> Cancelled
      </span>
    );
  }
  const config = STATUS_CONFIG[status] || { text: 'Processing', bg: '#e2e3e5', color: '#6c757d', icon: FaInfoCircle };
  const Icon = config.icon;
  
  return (
    <span className="badge rounded-pill px-3 py-2 border" style={{ backgroundColor: config.bg, color: config.color, borderColor: config.color }}>
      <Icon className="me-1" /> {config.text}
    </span>
  );
};

// --- 2. Main Component ---

const PharmacyOrderHistory = () => {
  const { fetchOrderHistory, checkCancellationCharge, cancelOrderUser } = useContext(MyContext);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Local state for cancellation UI
  const [cancelState, setCancelState] = useState({
    loadingId: null,
    info: {},
    showCard: {}
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrderHistory();
      if (Array.isArray(data)) {
        const sortedOrders = data.sort((a, b) => new Date(b.createdAt || b.dateSlot) - new Date(a.createdAt || a.dateSlot));
        setOrders(sortedOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCancellation = async (e, order) => {
    e.preventDefault();
    e.stopPropagation();
    const id = order._id || order.orderId;
    setCancelState(prev => ({ ...prev, loadingId: id }));
    
    try {
      const info = await checkCancellationCharge(id, 'pharmacy');
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
    const id = order._id || order.orderId;
    const reason = prompt("Reason for cancellation:");
    if (!reason) return;

    setCancelState(prev => ({ ...prev, loadingId: id }));

    try {
      const result = await cancelOrderUser(id, 'pharmacy', reason);
      alert(`✅ Order Cancelled. Refund: ₹${result.refundAmount}`);
      loadOrders();
      setCancelState(prev => ({ 
        ...prev, 
        loadingId: null, 
        showCard: { ...prev.showCard, [id]: false } 
      }));
    } catch (error) {
      alert(error.message);
      setCancelState(prev => ({ ...prev, loadingId: null }));
    }
  };

  const closeCancelCard = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setCancelState(prev => ({ ...prev, showCard: { ...prev.showCard, [id]: false } }));
  };

  const openDetailsModal = (e, order) => {
    e.preventDefault();
    setSelectedOrder(order);
  };

  const formatDate = (date) => date ? moment(date).format('DD MMM YYYY, hh:mm A') : 'N/A';

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && order.status < 5 && order.status !== 6) ||
      (filterStatus === 'completed' && order.status === 5) ||
      (filterStatus === 'cancelled' && (order.status === 6 || order.cancellationStatus === 'cancelled'));

    const matchesSearch = searchTerm === '' || 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some(i => i.itemName?.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const isInitialLoading = loading && orders.length === 0;

  return (
    <div className="container-xl py-5" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="row align-items-center mb-4">
        <div className="col-md-5">
          <h2 className="fw-bold text-dark mb-1">Pharmacy Orders</h2>
          <p className="text-muted mb-0">Track your medicine deliveries</p>
        </div>
        <div className="col-md-7 mt-3 mt-md-0 d-flex flex-wrap justify-content-md-end gap-2">
           <div className="position-relative">
             <input 
                type="text" 
                className="form-control shadow-sm ps-4" 
                placeholder="Search medicines..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
             <FaSearch className="position-absolute text-muted" style={{top: '12px', left: '12px', fontSize: '12px'}} />
           </div>
           
           <select className="form-select shadow-sm w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="active">Active</option>
            <option value="completed">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <Link to="/pharmacy" className="btn btn-primary shadow-sm"><FaPills className="me-2"/> Buy Medicines</Link>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
           <FaShoppingBag size={40} className="text-muted mb-3 mx-auto" />
           <h4 className="text-muted">No Orders Found</h4>
           <Link to="/pharmacy" className="btn btn-outline-primary mt-2">Browse Pharmacy</Link>
        </div>
      ) : (
        <div className="row g-4">
          {filteredOrders.map((order) => {
            const id = order._id || order.orderId;
            const isCancellable = ['0', '1', '2'].includes(String(order.status)) && order.cancellationStatus !== 'cancelled';
            const showCancel = cancelState.showCard[id];
            const isLoading = cancelState.loadingId === id;
            const info = cancelState.info[id];
            const itemCount = order.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;
            const membershipApplied = order.membershipApplied || order.orderSummary?.membershipData?.isFreeDelivery || false;
            const membershipDiscount = order.membershipDiscount || order.orderSummary?.deliveryCalculation?.membershipDiscount || 0;

            return (
              <div key={id} className="col-lg-6 col-xl-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 hover-card">
                  <div className="card-header bg-white border-bottom-0 pt-3 px-3 pb-0 d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-muted small">#{String(id).slice(-6).toUpperCase()}</span>
                    <div className="d-flex align-items-center gap-2">
                      {membershipApplied && (
                        <span className="badge bg-warning text-dark border-0" style={{ fontSize: '0.7rem' }}><FaMedal /> PRO</span>
                      )}
                      <StatusBadge status={order.status} isCancelled={order.cancellationStatus === 'cancelled'} />
                    </div>
                  </div>

                  <div className="card-body px-3 pt-2">
                    <h5 className="fw-bold text-dark mb-1 text-truncate">{order.vendor?.name || order.vendorName || "Pharmacy Store"}</h5>
                    <div className="text-muted small mb-2"><FaCalendarAlt className="me-1" /> {formatDate(order.createdAt || order.dateSlot)}</div>
                    
                    <div className="row g-2 mb-3 bg-light rounded-3 p-2 mx-0">
                      <div className="col-6 border-end">
                        <small className="text-muted d-block">Items</small>
                        <span className="fw-medium text-dark">{itemCount} Medicines</span>
                      </div>
                      <div className="col-6 ps-3">
                        <small className="text-muted d-block">Total</small>
                        <span className="fw-bold text-success">₹{order.grandTotal?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Quick Items Preview & Prescription Indicator */}
                    <div className="mb-3">
                        <div className="d-flex flex-wrap gap-1 align-items-center">
                            {order.items?.slice(0, 2).map((item, i) => (
                                <span key={i} className="badge bg-white text-secondary border">
                                    {item.itemName?.substring(0, 15)}{item.itemName?.length > 15 ? '...' : ''}
                                </span>
                            ))}
                            {order.items?.length > 2 && <span className="badge bg-light text-muted border">+{order.items.length - 2} more</span>}
                        </div>
                        {order.prescriptionImage && (
                          <div className="mt-2 text-primary small">
                            <FaFilePrescription className="me-1" /> Prescription Attached
                          </div>
                        )}
                    </div>

                    {/* Cancellation Card */}
                    {showCancel && info && (
                      <div className="alert alert-danger p-3 mb-3 shadow-sm">
                        <h6 className="fw-bold text-danger"><FaExclamationTriangle className="me-2"/> Cancel Order?</h6>
                        <div className="d-flex justify-content-between small mb-2 border-bottom pb-2">
                          <span>Cancellation Fee:</span><span className="text-danger fw-bold">₹{info.cancellationCharge}</span>
                        </div>
                        <div className="d-flex justify-content-between small mb-3">
                          <span>Refund Amount:</span><span className="text-success fw-bold">₹{info.refundAmount}</span>
                        </div>
                        <div className="d-grid gap-2">
                            <button className="btn btn-danger btn-sm fw-bold" onClick={(e) => handleCancelOrder(e, order)} disabled={isLoading}>
                                {isLoading ? 'Processing...' : 'Confirm'}
                            </button>
                            <button className="btn btn-light btn-sm border" onClick={(e) => closeCancelCard(e, id)} disabled={isLoading}>Close</button>
                        </div>
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-auto">
                      <button className="btn btn-primary w-100 py-2 rounded-3" onClick={(e) => openDetailsModal(e, order)}>
                        <FaFileInvoiceDollar className="me-2" /> Details
                      </button>
                      {isCancellable && !showCancel && (
                        <button className="btn btn-outline-danger w-100 py-2 rounded-3" onClick={(e) => handleCheckCancellation(e, order)} disabled={isLoading}>
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

      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

// --- 3. Order Details Modal (Updated) ---

const OrderDetailsModal = ({ order, onClose }) => {
    const itemCount = order.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;
    const membershipApplied = order.membershipApplied || order.orderSummary?.membershipData?.isFreeDelivery || false;
    const membershipDiscount = order.membershipDiscount || order.orderSummary?.deliveryCalculation?.membershipDiscount || 0;
    const extraDistanceCharges = order.extraDistanceCharges || order.deliveryCalculation?.extraCharges || 0;
    const extraDistance = order.distanceInfo?.extraDistance || order.deliveryCalculation?.extraDistance || 0;

    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg rounded-3">
            
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title d-flex align-items-center">
                <FaPills className="me-2" /> Order Details
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
  
            <div className="modal-body bg-light">
              
              <div className="card border-0 shadow-sm mb-3">
                  <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                          <h6 className="mb-0 text-muted">Order ID</h6>
                          <span className="fw-bold text-dark">#{order._id?.slice(-8).toUpperCase() || order.orderId?.slice(-8).toUpperCase()}</span>
                      </div>
                      <StatusBadge status={order.status} isCancelled={order.cancellationStatus === 'cancelled'} />
                  </div>
              </div>

              {/* ✅ PRESCRIPTION SECTION ADDED */}
              {order.prescriptionImage && (
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-white fw-bold text-primary">
                    <FaFilePrescription className="me-2" /> Prescription Uploaded
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div style={{ width: '80px', height: '80px', overflow: 'hidden', borderRadius: '8px' }} className="me-3 border">
                        <img 
                          src={`${process.env.REACT_APP_API_URL}${order.prescriptionImage}`}
                          alt="Prescription" 
                          className="w-100 h-100" 
                          style={{ objectFit: 'cover' }} 
                        />
                      </div>
                      <div>
                        <p className="mb-1 small text-muted">A prescription was uploaded for this order.</p>
                        <a href={`${process.env.REACT_APP_API_URL}${order.prescriptionImage}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                          <FaEye className="me-1" /> View Full Image
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <div className="row g-3 mb-3">
                  <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                          <div className="card-header bg-white fw-bold text-primary"><FaUser className="me-2"/> Customer Info</div>
                         <div className="card-body pt-2">
                          <h6 className="fw-bold mb-1">{order.patientDetails?.name || "Guest User"}</h6>
                          <p className="text-muted small mb-0">📞 {order.patientDetails?.phone || "N/A"}</p>
                          <p className="text-muted small mb-0 mt-2"><FaMapMarkerAlt className="me-1" /> Address:</p>
                          <div className="bg-light p-2 rounded small text-secondary mt-1 border">
                            {order.patientDetails?.address || order.address || order.deliveryAddress}
                            {order.patientDetails?.city && `, ${order.patientDetails.city}`}
                            {order.patientDetails?.pinCode && ` - ${order.patientDetails.pinCode}`}
                          </div>
                        </div>
                      </div>
                  </div>
                  <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                          <div className="card-header bg-white fw-bold text-success"><FaClock className="me-2"/> Timing & Slot</div>
                          <div className="card-body pt-2">
                              <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">Order Date:</span>
                                <span className="fw-medium">{moment(order.createdAt).format('DD MMM YYYY, hh:mm A')}</span>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">Delivery Slot:</span>
                                <span className="fw-medium">{order.dateSlot || 'N/A'}, {order.timeSlot || 'Any Time'}</span>
                              </div>
                              {order.isRapidDelivery && <span className="badge bg-warning text-dark w-100">⚡ Rapid Delivery</span>}
                          </div>
                      </div>
                  </div>
              </div>
  
              {/* Items Table */}
              <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-white fw-bold d-flex justify-content-between">
                      <span><FaPrescriptionBottleAlt className="me-2 text-warning"/> Items</span>
                      <span className="badge bg-light text-dark border">{itemCount} Items</span>
                  </div>
                  <div className="table-responsive">
                      <table className="table table-hover mb-0 align-middle">
                          <thead className="table-light small">
                              <tr><th>Medicine Name</th><th className="text-center">Qty</th><th className="text-end">Unit Price</th><th className="text-end">Total</th></tr>
                          </thead>
                          <tbody>
                              {order.items?.map((item, idx) => (
                                  <tr key={idx}>
                                      <td>
                                          <div className="fw-medium">{item.itemName || item.name}</div>
                                          {item.prescriptionRequired && <span className="badge bg-danger bg-opacity-10 text-danger ultra-small" style={{fontSize: '0.65rem'}}>Rx Required</span>}
                                      </td>
                                      <td className="text-center">{item.quantity || 1}</td>
                                      <td className="text-end text-muted small">₹{(item.unitPrice || 0).toFixed(2)}</td>
                                      <td className="text-end fw-bold">₹{((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
  
              {/* ✅ PRICE BREAKDOWN WITH EXTRA DISTANCE */}
              <div className="card border-0 shadow-sm mb-3">
                  <div className="card-body">
                      <div className="d-flex justify-content-between mb-2 text-muted">
                          <span>Item Total</span>
                          <span>₹{(order.subTotal || 0).toFixed(2)}</span>
                      </div>
                      
                      {order.tax > 0 && (
                        <div className="d-flex justify-content-between mb-2 text-muted small"><span>Tax</span><span>+ ₹{(order.tax || 0).toFixed(2)}</span></div>
                      )}

                      {/* Delivery Section */}
                      <div className="border-top border-bottom my-2 py-2 bg-light rounded px-2">
                        <div className="d-flex justify-content-between mb-1 small text-muted">
                            <span>Base Delivery Fee</span>
                            <span className={membershipApplied || order.deliveryCharges === 0 ? "text-success text-decoration-line-through" : ""}>
                              {membershipApplied ? "Waived (Membership)" : `₹${(order.deliveryCharges || 0).toFixed(2)}`}
                            </span>
                        </div>
                        
                        {/* Extra Distance Charge Explicitly Shown */}
                        {extraDistanceCharges > 0 && (
                          <div className="d-flex justify-content-between mb-1 small text-dark">
                              <span>
                                <FaMapMarkerAlt className="me-1 text-primary" size={10} /> 
                                Extra Distance Charges ({extraDistance}km)
                              </span>
                              <span>+ ₹{extraDistanceCharges.toFixed(2)}</span>
                          </div>
                        )}

                        {order.isRapidDelivery && !membershipApplied && (
                           <div className="d-flex justify-content-between mb-1 small text-dark">
                             <span>Rapid Delivery Fee</span>
                             <span>+ ₹{(order.deliveryCalculation?.rapidDeliveryFee || 0).toFixed(2)}</span>
                           </div>
                        )}
                      </div>

                      {/* Discounts */}
                      {membershipApplied && membershipDiscount > 0 && (
                        <div className="d-flex justify-content-between mb-2 text-success">
                            <span><FaMedal className="me-1" /> Membership Savings</span>
                            <span>- ₹{membershipDiscount.toFixed(2)}</span>
                        </div>
                      )}
  
                      {order.couponDiscount > 0 && (
                          <div className="d-flex justify-content-between mb-2 text-success">
                              <span><FaPercentage className="me-1"/>Coupon Discount</span>
                              <span>- ₹{(order.couponDiscount || 0).toFixed(2)}</span>
                          </div>
                      )}
  
                      <hr className="my-2"/>
                      <div className="d-flex justify-content-between fw-bold fs-5 text-dark">
                          <span>Grand Total</span>
                          <span className="text-success">₹{(order.grandTotal || 0).toFixed(2)}</span>
                      </div>
                  </div>
              </div>
  
            </div>
            <div className="modal-footer bg-white">
              <button type="button" className="btn btn-secondary px-4" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default PharmacyOrderHistory;