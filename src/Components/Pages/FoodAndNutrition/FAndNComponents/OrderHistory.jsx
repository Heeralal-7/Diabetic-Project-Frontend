import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../../../../Context/Context';
import { useNavigate } from 'react-router-dom';
import { 
  FaUtensils, FaMotorcycle, FaCheckCircle, FaTimesCircle, 
  FaUser, FaPhone, FaMapMarkerAlt, FaInfoCircle,
  FaMoneyBillWave, FaUndo, FaShoppingBag, FaClock, FaStore, 
  FaReceipt, FaRoad, FaBolt, FaCreditCard, FaExclamationTriangle, 
  FaFileInvoiceDollar, FaRegCreditCard, FaUniversity 
} from 'react-icons/fa';

const OrderHistory = () => {
  const { 
    getOrder, 
    orderLoading, 
    orderError,
    checkCancellationCharge,
    cancelOrderUser,
    submitRefundDetailsUser 
  } = useContext(MyContext);
  
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allOrdersLoaded, setAllOrdersLoaded] = useState(false);
  const [cancellationData, setCancellationData] = useState({
    showCard: false,
    orderId: null,
    info: null,
    loading: false
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showRefundInputModal, setShowRefundInputModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async () => {
    const result = await getOrder(page, 50);
    
    if (result.success === 1 && result.details) {
      const sortedOrders = result.details.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      if (page === 1) {
        setOrders(sortedOrders);
      } else {
        setOrders(prev => {
          const combined = [...prev, ...sortedOrders];
          const uniqueOrders = combined.filter((order, index, self) => 
            index === self.findIndex(o => o._id === order._id)
          );
          return uniqueOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
      }
      
      setHasMore(result.details.length >= 20);
      
      if (result.details.length === 0) {
        setAllOrdersLoaded(true);
      }
    } else {
      setHasMore(false);
      setAllOrdersLoaded(true);
    }
  };

  const refreshOrders = () => {
    setPage(1);
    setOrders([]);
    setAllOrdersLoaded(false);
    setHasMore(true);
    fetchOrders();
  };

  const loadMoreOrders = () => {
    if (!orderLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // --- Cancellation Logic ---
  const handleCheckCancellation = async (order) => {
    const orderId = order._id;
    try {
      setCancellationData(prev => ({ ...prev, loading: true, orderId, showCard: false }));
      const info = await checkCancellationCharge(orderId, 'food');
      setCancellationData({ showCard: true, orderId, info, loading: false });
    } catch (error) {
      alert(error.message);
      setCancellationData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCancelOrder = async (order) => {
    const orderId = order._id;
    const reason = prompt("Please enter cancellation reason:");
    if (!reason) return;

    try {
      setCancellationData(prev => ({ ...prev, loading: true }));
      const result = await cancelOrderUser(orderId, 'food', reason);
      
      // ✅ LOGIC UPDATE: Separate Alert for COD vs Online
      if (order.paymentMethod === 'cod') {
        alert("Order cancelled successfully! No payment was deducted.");
      } else {
        alert(`Order cancelled! Refund Process Initiated: ₹${result.refundAmount}.`);
      }

      refreshOrders();
      closeCancellationCard();
      if (showOrderDetails) closeOrderDetails();
    } catch (error) {
      alert(error.message);
    } finally {
      setCancellationData(prev => ({ ...prev, loading: false }));
    }
  };

  const closeCancellationCard = () => {
    setCancellationData({ showCard: false, orderId: null, info: null, loading: false });
  };

  // --- Helpers ---
  const isOrderCancellable = (order) => {
    const cancellableStatuses = ['0', '1']; 
    return cancellableStatuses.includes(order.status) && order.cancellationStatus !== 'cancelled';
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (error) { return 'Invalid Date'; }
  };

  const getStatusBadge = (order) => {
    const statusConfig = {
      '0': { text: 'Pending', class: 'bg-warning text-dark', icon: <FaUtensils size={14} /> },
      '1': { text: 'Accepted', class: 'bg-primary', icon: <FaCheckCircle size={14} /> },
      '2': { text: 'Driver Assigned', class: 'bg-warning', icon: <FaMotorcycle size={14} /> },
      '3': { text: 'Start Order', class: 'bg-warning', icon: <FaMotorcycle size={14} /> },
      '4': { text: 'Arrived Order', class: 'bg-info', icon: <FaUtensils size={14} /> },
      '5': { text: 'Delivered', class: 'bg-success', icon: <FaCheckCircle size={14} /> },
      '6': { text: 'Order Return', class: 'bg-secondary', icon: <FaUser size={14} /> },
      '8': { text: 'Cancelled', class: 'bg-danger', icon: <FaTimesCircle size={14} /> },
      '9': { text: 'Rejected by vendor', class: 'bg-danger', icon: <FaTimesCircle size={14} /> },
    };

    if (order.cancellationStatus === 'cancelled') {
      return <span className="badge bg-danger d-inline-flex align-items-center py-1 px-2"><FaTimesCircle size={14} className="me-1" /> Cancelled</span>;
    }

    const config = statusConfig[order.status] || { text: 'Processing', class: 'bg-secondary', icon: <FaInfoCircle size={14} /> };
    return (
      <span className={`badge ${config.class} d-inline-flex align-items-center py-1 px-2`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getPaymentStatus = (order) => {
    if (order.cancellationStatus === 'cancelled' && order.refundStatus === 'completed') {
      return { text: 'Refunded', class: 'bg-info', icon: <FaMoneyBillWave size={14} /> };
    }
    
    if (order.cancellationStatus === 'cancelled' && order.refundStatus === 'pending') {
      return { text: 'Refund Pending', class: 'bg-warning text-dark', icon: <FaClock size={14} /> };
    }

    if (order.cancellationStatus === 'cancelled') {
      return { text: 'Cancelled', class: 'bg-danger', icon: <FaTimesCircle size={14} /> };
    }

    if (order.paymentMethod === 'cod' && order.status === '7') {
      return { text: 'Paid (COD)', class: 'bg-success', icon: <FaCheckCircle size={14} /> };
    }
    if (order.paymentDetails?.status === 'completed' || order.type === "1") {
      return { text: 'Paid', class: 'bg-success', icon: <FaCheckCircle size={14} /> };
    }
    return { text: 'Pending', class: 'bg-warning text-dark', icon: <FaInfoCircle size={14} /> };
  };

  // Calculation Logic
  const getOrderCalculations = (order) => {
    let itemsTotal = 0;
    
    const processedItems = order.items?.map(item => {
        const baseAmount = parseFloat(item.FoodItem?.amount || 0);
        const savedDiscountedPrice = parseFloat(item.discountedPrice);
        const effectivePrice = (savedDiscountedPrice > 0) ? savedDiscountedPrice : baseAmount;
        
        const extraItemsTotal = item.extraItems?.reduce((sum, extra) => sum + (parseFloat(extra.price) || 0), 0) || 0;
        const quantity = item.quantity || 1;
        
        const finalItemTotal = (effectivePrice + extraItemsTotal) * quantity;
        itemsTotal += finalItemTotal;

        let discountPercent = parseFloat(item.FoodItem?.discountPercentage || 0);
        if(savedDiscountedPrice > 0 && baseAmount > 0) {
           discountPercent = Math.round(((baseAmount - savedDiscountedPrice) / baseAmount) * 100);
        }

        return {
            name: `${item.FoodItem?.foodName || 'Item'} ${item.FoodItem?.foodSubCategory || ''}`,
            quantity: quantity,
            originalPrice: baseAmount,
            effectivePrice: effectivePrice,
            extraTotal: extraItemsTotal,
            total: finalItemTotal,
            extras: item.extraItems || [],
            discountPercent: discountPercent
        };
    }) || [];

    const dc = order.deliveryCharges || {};
    const baseDelivery = parseFloat(dc.baseDeliveryCharge || 0);
    const distanceCharge = parseFloat(dc.distanceCharge || 0);
    const rapidCharge = parseFloat(dc.rapidDeliveryCharge || 0);
    const taxAmount = parseFloat(dc.taxAmount || 0);
    const totalDelivery = parseFloat(dc.totalDeliveryCharge || 0);
    
    const distance = parseFloat(dc.distance || 0);
    const freeRadius = parseFloat(dc.freeDeliveryRadius || 10);

    const cancellationCharge = parseFloat(order.cancellationCharge || 0);
    const finalBillAmount = parseFloat(order.price || 0);

    return {
        items: processedItems,
        itemsTotal,
        delivery: {
            base: baseDelivery,
            distance: distanceCharge,
            rapid: rapidCharge,
            tax: taxAmount,
            total: totalDelivery,
            km: distance,
            freeRadius: freeRadius
        },
        cancellationCharge,
        finalBillAmount
    };
  };

  const getAddressString = (items) => {
    if (!items || !items.length || !items[0].address) return 'Address not available';
    const address = items[0].address;
    if (Array.isArray(address)) {
      return address.filter(p => p && p.trim() !== '').join(', ');
    }
    return 'Address format not recognized';
  };

  const printInvoice = (order) => {
    const calc = getOrderCalculations(order);
    const paymentStatus = getPaymentStatus(order);
    const customerAddress = getAddressString(order.items);
    const orderIdShort = order._id?.slice(-8)?.toUpperCase();
    const invoiceDate = formatDate(order.createdAt);
    const vendorName = order.vendorId?.name || 'Restaurant Name';
    const customerName = order.items?.[0]?.address?.[0] || 'Customer';
    const customerPhone = order.items?.[0]?.address?.[2] || 'N/A';
    
    const getItemRows = () => {
        return calc.items.map(item => {
            const isDiscounted = item.discountPercent > 0;
            return `
                <tr>
                    <td>
                        ${item.name} 
                        ${item.extras.length > 0 ? '<br/><span style="font-size:10px; color:#666;">Extras: ' + item.extras.map(e => e.name).join(', ') + '</span>' : ''}
                        <div style="margin-top: 5px;">
                            ${isDiscounted ? `<span style="text-decoration: line-through; color: #999; margin-right: 5px;">₹${item.originalPrice.toFixed(2)}</span>` : ''}
                            <span style="font-weight: bold;">₹${item.effectivePrice.toFixed(2)}</span>
                            ${isDiscounted ? `<span style="color: green; margin-left: 5px;">(${item.discountPercent}% off)</span>` : ''}
                        </div>
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">₹${item.effectivePrice.toFixed(2)}</td>
                    <td class="text-right">₹${item.total.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
    };

    const invoiceContent = `
      <html>
        <head>
          <title>Invoice #${orderIdShort}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
            .header h1 { color: #333; margin-bottom: 5px; }
            .header p { margin: 0; font-size: 14px; }
            .details-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .bill-to, .invoice-details { width: 48%; }
            table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; margin-bottom: 20px; }
            table td { padding: 8px; vertical-align: top; }
            .item-table thead { background: #eee; }
            .total-row td { font-weight: bold; border-top: 1px solid #ccc; }
            .grand-total-row td { font-weight: bold; border-top: 2px solid #333; border-bottom: 2px solid #333; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <h1>INVOICE</h1>
              <p><strong>Order ID:</strong> #${orderIdShort}</p>
              <p><strong>Date:</strong> ${invoiceDate}</p>
            </div>
            
            <div class="details-section">
              <div class="bill-to">
                <strong>Billed To:</strong><br/>
                ${customerName}<br/>
                ${customerAddress}<br/>
                ${customerPhone}
              </div>
              <div class="invoice-details text-right">
                <strong>From:</strong><br/>
                ${vendorName}<br/>
                ${order.vendorId?.address || ''}<br/>
                ${order.vendorId?.phone || ''}
              </div>
            </div>

            <table>
              <thead>
                <tr class="item-table">
                  <th>Item Description (MRP & Price)</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${getItemRows()}
                <tr class="total-row">
                  <td colspan="3" class="text-right">Item Subtotal</td>
                  <td class="text-right">₹${calc.itemsTotal.toFixed(2)}</td>
                </tr>
                ${calc.delivery.total > 0 ? `
                  <tr class="total-row" style="font-weight: normal;">
                    <td colspan="3" class="text-right">Delivery Charges</td>
                    <td class="text-right">₹${calc.delivery.total.toFixed(2)}</td>
                  </tr>
                ` : ''}
                ${order.cancellationCharge > 0 ? `
                  <tr class="total-row" style="color: red; font-weight: normal;">
                    <td colspan="3" class="text-right">Cancellation Fee</td>
                    <td class="text-right">-₹${order.cancellationCharge.toFixed(2)}</td>
                  </tr>
                ` : ''}
                <tr class="grand-total-row">
                  <td colspan="3" class="text-right">GRAND TOTAL</td>
                  <td class="text-right">₹${calc.finalBillAmount.toFixed(2)}</td>
                </tr>
                 <tr style="font-weight: bold; background-color: #f0f8ff;">
                  <td colspan="3" class="text-right">Payment Status</td>
                  <td class="text-right">${paymentStatus.text}</td>
                </tr>
              </tbody>
            </table>
            <p style="margin-top: 30px; text-align: center; color: #666;">Thank you for your order!</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  };
  
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
    closeCancellationCard();
  };

  const RefundInputModal = ({ order, onClose }) => {
      const [mode, setMode] = useState('bank');
      const [details, setDetails] = useState({
          bankName: '', accountNumber: '', ifsc: '', accountHolderName: '', upiId: ''
      });
      const [loading, setLoading] = useState(false);

      const handleInputChange = (e) => {
          const { name, value } = e.target;
          setDetails(prev => ({ ...prev, [name]: value }));
      };

      const handleSubmit = async () => {
          if (mode === 'bank' && (!details.accountNumber || !details.ifsc || !details.accountHolderName)) {
              alert('Please fill all required bank details.');
              return;
          }
          if (mode === 'upi' && !details.upiId) {
              alert('Please enter a valid UPI ID.');
              return;
          }

          setLoading(true);
          try {
              const submissionDetails = mode === 'bank' 
                  ? { 
                      accountNumber: details.accountNumber, 
                      ifsc: details.ifsc, 
                      accountHolderName: details.accountHolderName, 
                      bankName: details.bankName || 'N/A' 
                    }
                  : { upiId: details.upiId };
              
              const orderType = 'food'; 
              
              const result = await submitRefundDetailsUser(order._id, orderType, mode, submissionDetails);
              
              if (result.success) {
                  alert(result.message);
                  onClose();
                  refreshOrders();
              } else {
                  alert(result.message || 'Failed to submit details.');
              }
          } catch (error) {
              alert(error.message || 'An error occurred during submission.');
          } finally {
              setLoading(false);
          }
      };

      return (
          <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060}}>
              <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                      <div className="modal-header">
                          <h5 className="modal-title fw-bold text-primary">Submit Refund Details</h5>
                          <button type="button" className="btn-close" onClick={onClose}></button>
                      </div>
                      <div className="modal-body">
                          <div className="alert alert-info small d-flex align-items-center mb-3">
                              <FaInfoCircle className="me-2 flex-shrink-0" />
                              <p className="mb-0">Your order was COD. Please provide your bank/UPI details to receive the refund of ₹{order.refundAmount}.</p>
                          </div>
                          {/* ... inputs ... */}
                      </div>
                  </div>
              </div>
          </div>
      );
  };


  // --- Modal Component (Order Details) ---
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    const calc = getOrderCalculations(order);
    const paymentStatus = getPaymentStatus(order);
    const isCancellable = isOrderCancellable(order);
    const customerName = order.items?.[0]?.address?.[0] || 'Customer';
    const customerPhone = order.items?.[0]?.address?.[2] || 'N/A';
    const deliverySlot = order.items?.[0]?.foodSlot || 'N/A';
    const deliveryDate = order.items?.[0]?.date || 'N/A';

    // ✅ LOGIC UPDATE: We only need refund details if NOT COD.
    // If it is COD, we assume the user hasn't paid, so no refund is pending.
    const isOnlineRefundPending = 
        order.paymentMethod !== 'cod' && 
        order.cancellationStatus === 'cancelled' && 
        order.refundStatus === 'pending';
    
    // For COD, we only show refund logic if specifically set by backend (rare) or completed
    const isCodCancelled = order.paymentMethod === 'cod' && order.cancellationStatus === 'cancelled';

    return (
      <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                <FaReceipt className="me-2 text-primary" />
                Order #{order._id?.slice(-8)?.toUpperCase()}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {/* Top Banner */}
              <div className="card mb-3 border-0 bg-light">
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Status: </strong> {getStatusBadge(order)}
                        <div className="small text-muted mt-1">Placed on: {formatDate(order.createdAt)}</div>
                    </div>
                    <div className="text-end">
                        <div className="mb-1">
                            <strong>Payment: </strong> <span className={`badge ${paymentStatus.class}`}>{paymentStatus.text}</span>
                        </div>
                        {order.paymentMethod && <div className="small text-muted mb-1">{order.paymentMethod.toUpperCase()}</div>}
                        
                        {order.paymentId && (
                            <div className="small text-secondary" style={{fontSize: '0.8rem'}}>
                                <FaCreditCard size={10} className="me-1"/>
                                ID: <span className="font-monospace">{order.paymentId}</span>
                            </div>
                        )}
                    </div>
                </div>
              </div>

              {/* Vendor & Customer Info */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold text-muted small"><FaStore className="me-1" /> RESTAURANT</h6>
                  <div className="p-3 border rounded bg-white h-100">
                    <p className="mb-1 fw-bold">{order.vendorId?.name || 'Restaurant Name'}</p>
                    <p className="mb-1 small text-muted">{order.vendorId?.address}</p>
                    <p className="mb-0 small text-muted"><FaPhone size={10} /> {order.vendorId?.phone}</p>
                  </div>
                </div>
                <div className="col-md-6">
                    <h6 className="fw-bold text-muted small"><FaUser className="me-1" /> DELIVERY TO</h6>
                    <div className="p-3 border rounded bg-white h-100">
                        <p className="mb-1 fw-bold">{customerName}</p>
                        <p className="mb-1 small text-muted">{getAddressString(order.items)}</p>
                        <p className="mb-0 small text-muted">Phone: {customerPhone}</p>
                        <hr className="my-2"/>
                        <p className="mb-0 small text-primary"><FaClock size={10} /> {deliveryDate} | {deliverySlot}</p>
                    </div>
                </div>
              </div>

              {/* ✅ REFUND INFORMATION SECTION */}
              {order.cancellationStatus === 'cancelled' && (
                <div className="alert alert-warning mb-4">
                    <h6 className="fw-bold alert-heading mb-2">
                        <FaExclamationTriangle className="me-2"/> Order Cancelled
                    </h6>
                    <div className="bg-white p-3 rounded border">
                        
                        {/* 1. IF COD CANCELLED: SHOW SIMPLE MESSAGE (No Refund Logic) */}
                        {isCodCancelled && (
                             <div className="text-dark">
                                <FaInfoCircle className="me-2 text-primary" />
                                <strong>Note:</strong> This was a COD order. Since no payment was made, no refund is required.
                             </div>
                        )}

                        {/* 2. IF ONLINE PAYMENT: SHOW REFUND DETAILS */}
                        {!isCodCancelled && (
                            <>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Refund Status:</span>
                                    <span className={`fw-bold text-uppercase ${order.refundStatus === 'completed' ? 'text-success' : 'text-warning'}`}>
                                        {order.refundStatus || 'PENDING'}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Refund Amount:</span>
                                    <span className="fw-bold text-dark">₹{order.refundAmount}</span>
                                </div>
                                
                                {order.refundStatus === 'completed' && order.refundId && (
                                     <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Refund Ref ID:</span>
                                        <span className="font-monospace small text-dark">{order.refundId}</span>
                                    </div>
                                )}

                                {order.cancellationCharge > 0 && (
                                     <div className="d-flex justify-content-between mb-2 small text-danger">
                                        <span>Cancellation Fee Deducted:</span>
                                        <span>-₹{order.cancellationCharge}</span>
                                    </div>
                                )}
                                
                                {order.refundStatus === 'pending' && (
                                    <div className="mt-3 small text-muted bg-light p-2 rounded">
                                        <FaInfoCircle className="me-1 text-primary"/> 
                                        <strong>Note:</strong> Online refund will reflect in your account within 24 hours.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
              )}

              {/* Cancellation Confirmation Card */}
              {isCancellable && (
                <div className="mb-3">
                  <button onClick={() => handleCheckCancellation(order)} className="btn btn-outline-danger btn-sm w-100" disabled={cancellationData.loading}>
                    <FaUndo className="me-1" /> {cancellationData.loading ? 'Checking...' : 'Cancel Order'}
                  </button>
                </div>
              )}

              {cancellationData.showCard && cancellationData.orderId === order._id && (
                <div className="card border-danger mb-3">
                    <div className="card-body">
                        <h6 className="text-danger fw-bold">Cancel this order?</h6>
                        <div className="d-flex justify-content-between small mb-2">
                            <span>Cancellation Charge:</span> <span className="text-danger">₹{cancellationData.info?.cancellationCharge}</span>
                        </div>
                        <div className="d-flex justify-content-between small mb-3">
                            <span>Refund Amount:</span> <span className="text-success fw-bold">₹{cancellationData.info?.refundAmount}</span>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-danger btn-sm flex-grow-1" onClick={() => handleCancelOrder(order)}>Confirm Cancel</button>
                            <button className="btn btn-light btn-sm flex-grow-1" onClick={closeCancellationCard}>Close</button>
                        </div>
                    </div>
                </div>
              )}

              {/* Items Table */}
              <h6 className="fw-bold text-muted small"><FaUtensils className="me-1" /> ITEMS</h6>
              <div className="table-responsive border rounded mb-3">
                <table className="table table-sm table-borderless mb-0">
                  <thead className="table-light border-bottom">
                    <tr>
                      <th className="ps-3 py-2">Item</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-end pe-3 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.items.map((item, idx) => (
                      <tr key={idx} className="border-bottom">
                        <td className="ps-3 py-2">
                          <div className="fw-medium">{item.name}</div>
                          {item.extras.length > 0 && (
                            <div className="small text-muted">
                              Extras: {item.extras.map(e => e.name).join(', ')}
                            </div>
                          )}
                          <div className="small text-muted mt-1">
                             {item.discountPercent > 0 && (
                               <span className="text-decoration-line-through me-1">
                                 ₹{item.originalPrice}
                               </span>
                             )}
                             <span className="fw-bold text-dark">₹{item.effectivePrice}</span>
                             
                             {item.discountPercent > 0 && (
                               <span className="text-success ms-1 small">({item.discountPercent}% off)</span>
                             )}
                             
                             {item.extraTotal > 0 && ` + ₹${item.extraTotal} extras`}
                          </div>
                        </td>
                        <td className="text-center py-2 align-middle">{item.quantity}</td>
                        <td className="text-end pe-3 py-2 align-middle fw-medium">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bill Summary */}
              <div className="row justify-content-end">
                <div className="col-md-7">
                    <div className="p-3 bg-light rounded">
                        <div className="d-flex justify-content-between mb-2">
                            <span>Item Total</span>
                            <span>₹{calc.itemsTotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="border-top border-bottom py-2 my-2">
                            <div className="small fw-bold text-muted mb-1">DELIVERY CHARGES</div>
                            
                            <div className="d-flex justify-content-between small mb-1">
                                <span>Base Delivery</span>
                                <span>₹{calc.delivery.base.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between fw-medium mt-1">
                                <span>Total Delivery</span>
                                <span>₹{calc.delivery.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {calc.delivery.tax > 0 && (
                            <div className="d-flex justify-content-between mb-1 small">
                                <span>Tax</span>
                                <span>₹{calc.delivery.tax.toFixed(2)}</span>
                            </div>
                        )}
                        
                        <div className="d-flex justify-content-between fw-bold fs-5 text-dark mt-2 border-top pt-2">
                            <span>Total Bill</span>
                            <span>₹{calc.finalBillAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-info" 
                onClick={() => printInvoice(order)}
              >
                <FaFileInvoiceDollar className="me-1" /> Generate Invoice
              </button>

              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---
  if (orderLoading && orders.length === 0) {
    return <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-2">Loading orders...</p></div>;
  }

  if (orderError) {
    return <div className="text-center py-5"><div className="alert alert-danger d-inline-block">{orderError}</div><br/><button className="btn btn-primary mt-2" onClick={refreshOrders}>Retry</button></div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container py-5 text-center">
        <FaShoppingBag className="fs-1 text-muted mb-3" />
        <h4>No Orders Yet</h4>
        <p className="text-muted">Looks like you haven't placed any food orders.</p>
        <button className="btn btn-primary" onClick={() => navigate('/shop/FoodAndNurition')}>Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="container-fluid container-xl py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold"><FaShoppingBag className="me-2 text-primary" /> My Orders</h2>
        <button onClick={refreshOrders} className="btn btn-outline-primary btn-sm"><FaClock className="me-1" /> Refresh</button>
      </div>

      <div className="row">
        {orders.map((order) => {
          const calc = getOrderCalculations(order);
          const paymentStatus = getPaymentStatus(order);
          const firstItemName = calc.items[0]?.name || 'Food Item';
          const remainingItems = calc.items.length - 1;

          // ✅ LOGIC UPDATE: No red alert for COD cancellations
          const needsRefundInput = 
            order.paymentMethod !== 'cod' && // <-- CHANGED THIS
            order.cancellationStatus === 'cancelled' && 
            order.refundStatus === 'pending' && 
            (!order.refundBeneficiaryDetails || Object.keys(order.refundBeneficiaryDetails).length === 0 || !order.refundBeneficiaryDetails.mode);


          return (
            <div key={order._id} className="col-lg-6 mb-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-bottom-0 pt-3 px-3 d-flex justify-content-between">
                    <div>
                        <span className="fw-bold text-primary">#{order._id?.slice(-8).toUpperCase()}</span>
                        <div className="small text-muted">{formatDate(order.createdAt)}</div>
                    </div>
                    <div>{getStatusBadge(order)}</div>
                </div>
                
                <div className="card-body px-3 py-2">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                            <div className="bg-light p-2 rounded-circle me-3 text-primary">
                                <FaStore />
                            </div>
                            <div>
                                <h6 className="mb-0 fw-bold">{order.vendorId?.name || 'Restaurant'}</h6>
                                <small className="text-muted">{order.vendorId?.city}</small>
                            </div>
                        </div>
                        <div className="text-end">
                            <h6 className="mb-0 fw-bold text-success">₹{calc.finalBillAmount.toFixed(2)}</h6>
                            <small className={`badge ${paymentStatus.class} rounded-pill`}>{paymentStatus.text}</small>
                        </div>
                    </div>
                    
                    {needsRefundInput && (
                        <div className="alert alert-danger p-2 mb-2 text-center small fw-bold">
                            <FaInfoCircle className="me-1" /> Refund Details Required!
                        </div>
                    )}

                    <div className="bg-light p-2 rounded mb-3">
                        <div className="d-flex align-items-start">
                            <FaUtensils className="mt-1 me-2 text-muted" size={12} />
                            <div className="small text-dark">
                                <span className="fw-medium">{firstItemName}</span>
                                {remainingItems > 0 && <span className="text-muted"> + {remainingItems} more</span>}
                            </div>
                        </div>
                    </div>

                    {cancellationData.showCard && cancellationData.orderId === order._id && (
                        <div className="card border-danger mb-2">
                            <div className="card-body p-2">
                                <div className="d-flex justify-content-between small">
                                    <span>Refund: <span className="fw-bold text-success">₹{cancellationData.info?.refundAmount}</span></span>
                                    <button className="btn btn-danger btn-sm py-0" onClick={() => handleCancelOrder(order)}>Confirm</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="card-footer bg-white border-top-0 pb-3 px-3">
                    <button className="btn btn-outline-primary btn-sm w-100" onClick={() => viewOrderDetails(order)}>
                        View Details
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center mt-3">
          <button className="btn btn-primary btn-sm" onClick={loadMoreOrders} disabled={orderLoading}>
            {orderLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {showOrderDetails && <OrderDetailsModal order={selectedOrder} onClose={closeOrderDetails} />}
      {showRefundInputModal && selectedOrder && (
          <RefundInputModal 
              order={selectedOrder} 
              onClose={() => {
                  setShowRefundInputModal(false);
                  setSelectedOrder(null);
                  refreshOrders();
              }} 
          />
      )}
    </div>
  );
};

export default OrderHistory;