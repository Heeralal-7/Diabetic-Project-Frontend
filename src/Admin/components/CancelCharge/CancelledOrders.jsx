import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../../Context/Context'; 
import { RefreshCcw, ArrowLeft, ArrowRight, DollarSign, AlertCircle, Info, CheckCircle, Clock, History, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const CancelledOrders = () => {
  const { getCancelledOrdersAdmin, processRefundAdmin } = useContext(MyContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState(''); 
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ totalCancelled: 0, totalRefunds: 0, totalCharges: 0 });
  const [viewTab, setViewTab] = useState('pending');

  // Refund Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  
  // Manual Refund Inputs
  const [manualTxnId, setManualTxnId] = useState('');
  const [manualMode, setManualMode] = useState('Bank Transfer');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const typeParam = filterType === '' ? null : filterType;
      const data = await getCancelledOrdersAdmin(page, 10, typeParam);

      if (data) {
        // Ensuring map safety
        const ordersArray = data.orders || [];
        setOrders(ordersArray);
        setSummary(data.summary);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [page, filterType, viewTab]); 

  const openRefundModal = (order) => {
    if(order.refundStatus === 'completed') return;
    setSelectedOrder(order);
    
    // Pre-fill if details exist
    setManualTxnId(order.manualRefundDetails?.adminTransactionId || ''); 
    setManualMode(order.manualRefundDetails?.refundedByMode || 'Bank Transfer');
    setShowModal(true);
  };

  const handleProcessRefund = async () => {
    if(!selectedOrder) return;

    // ✅ UPDATED VALIDATION: 
    // Only require Transaction ID if it is COD AND Refund Amount is greater than 0
    if (selectedOrder.paymentMethod === 'cod' && selectedOrder.refundAmount > 0 && !manualTxnId.trim()) {
        toast.error("Please enter the Transaction ID/Reference Number");
        return;
    }

    try {
      setRefundLoading(true);
      
      const result = await processRefundAdmin(
          selectedOrder._id, 
          selectedOrder.orderType, 
          manualTxnId, 
          manualMode   
      );
      
      if(result.success) {
          toast.success(result.message);
          setShowModal(false);
          fetchOrders(); 
      }
    } catch (error) {
      toast.error(error.message || "Refund failed");
    } finally {
      setRefundLoading(false);
    }
  };

  const getOrderCategoryObj = (order) => {
    if (order.orderType === 'food') return { label: 'FOOD', className: 'badge bg-warning text-dark' };
    if (order.orderType === 'pharmacy') return { label: 'PHARMACY', className: 'badge bg-success' };
    if (order.serviceType === 'Lab Test' || order.orderType === 'lab') return { label: 'LAB TEST', className: 'badge bg-info text-dark' };
    if (order.clinicId) return { label: 'CLINIC', className: 'badge bg-dark' };
    return { label: 'DOCTOR', className: 'badge bg-primary' };
  };

  const displayedOrders = orders.filter(order => {
      if (viewTab === 'pending') return order.refundStatus !== 'completed';
      if (viewTab === 'completed') return order.refundStatus === 'completed';
      return true;
  });

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="container">
        
        <div className="mb-4">
          <h2 className="fw-bold text-dark">Cancelled Orders & Refunds</h2>
          <p className="text-muted">Manage cancellations and verify Razorpay/COD refunds.</p>
        </div>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">
            <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-body d-flex align-items-center justify-content-between">
                        <div>
                            <p className="text-muted small mb-1 fw-bold text-uppercase">Total Cancelled</p>
                            <h3 className="fw-bold mb-0">{summary.totalCancelled || 0}</h3>
                        </div>
                        <div className="rounded-circle bg-danger bg-opacity-10 p-3 text-danger"><AlertCircle size={24} /></div>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-body d-flex align-items-center justify-content-between">
                        <div>
                            <p className="text-muted small mb-1 fw-bold text-uppercase">Refunds Pending Amount</p>
                            <h3 className="fw-bold text-primary mb-0">₹{summary.totalRefunds?.toLocaleString() || 0}</h3>
                        </div>
                        <div className="rounded-circle bg-primary bg-opacity-10 p-3 text-primary"><RefreshCcw size={24} /></div>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-body d-flex align-items-center justify-content-between">
                        <div>
                            <p className="text-muted small mb-1 fw-bold text-uppercase">Charges Collected</p>
                            <h3 className="fw-bold text-success mb-0">₹{summary.totalCharges?.toLocaleString() || 0}</h3>
                        </div>
                        <div className="rounded-circle bg-success bg-opacity-10 p-3 text-success"><DollarSign size={24} /></div>
                    </div>
                </div>
            </div>
        </div>

        {/* View Tabs */}
        <div className="d-flex gap-3 mb-3">
            <button 
                onClick={() => setViewTab('pending')}
                className={`btn d-flex align-items-center gap-2 rounded-pill px-4 ${viewTab === 'pending' ? 'btn-primary' : 'btn-white border bg-white text-secondary'}`}
            >
                <Clock size={16} /> Pending Refunds
            </button>
            <button 
                onClick={() => setViewTab('completed')}
                className={`btn d-flex align-items-center gap-2 rounded-pill px-4 ${viewTab === 'completed' ? 'btn-success text-white' : 'btn-white border bg-white text-secondary'}`}
            >
                <History size={16} /> Refunded History
            </button>
        </div>

        {/* TABLE SECTION */}
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 border-bottom-0">
                <div className="d-flex gap-2 overflow-auto">
                    {['', 'food', 'pharmacy', 'doctor', 'lab'].map((type) => (
                    <button
                        key={type}
                        onClick={() => { setFilterType(type); setPage(1); }}
                        className={`btn btn-sm fw-medium ${filterType === type ? 'btn-dark' : 'btn-light text-secondary'}`}
                    >
                        {type === '' ? 'All Orders' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                    ))}
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-muted small text-uppercase">
                        <tr>
                            <th className="ps-4 py-3">Order Info</th>
                            <th className="py-3">Customer</th>
                            <th className="py-3">Type</th>
                            <th className="py-3">Pay Mode</th>
                            <th className="py-3">Payment ID</th>
                            <th className="text-end py-3 text-primary">Refund Amt</th>
                            <th className="py-3 text-center">User Bank Info</th>
                            <th className="text-center py-3 pe-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="border-top-0">
                        {loading ? (
                            <tr><td colSpan="9" className="text-center py-5 text-muted">Loading orders...</td></tr>
                        ) : displayedOrders.length === 0 ? (
                            <tr><td colSpan="9" className="text-center py-5 text-muted">No {viewTab} orders found.</td></tr>
                        ) : (
                            displayedOrders.map((order) => {
                                const category = getOrderCategoryObj(order);
                                const hasBankDetails = order.refundBeneficiaryDetails && (order.refundBeneficiaryDetails.accountNumber || order.refundBeneficiaryDetails.upiId);
                                const isCodNoRefund = order.paymentMethod === 'cod' && (order.refundAmount <= 0);
                                
                                return (
                                <tr key={order._id}>
                                    <td className="ps-4">
                                        <div className="d-flex flex-col">
                                            <span className="fw-bold text-dark">#{order._id.slice(-6).toUpperCase()}</span>
                                            <div className="mt-1"><span className={category.className} style={{fontSize: '0.7rem'}}>{category.label}</span></div>
                                            <small className="text-muted">{new Date(order.cancelledAt).toLocaleDateString()}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className="fw-medium text-dark">{order.userId?.name || 'Guest'}</span>
                                            <small className="text-muted">{order.userId?.phone || 'N/A'}</small>
                                        </div>
                                    </td>
                                    <td>{order.orderType}</td>
                                    <td>
                                        <span className={`badge ${order.paymentMethod === 'cod' ? 'bg-secondary' : 'bg-info'}`}>
                                            {order.paymentMethod === 'cod' ? 'COD' : 'ONLINE'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="font-monospace text-dark small">
                                            {order.paymentId || (order.paymentMethod === 'cod' ? 'COD' : 'N/A')}
                                        </span>
                                    </td>
                                    <td className="text-end text-primary fw-bold">
                                        ₹{order.refundAmount?.toFixed(2)}
                                    </td>
                                    
                                    <td className="text-center">
                                        {order.paymentMethod === 'cod' ? (
                                            isCodNoRefund ? 
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary border">Not Required</span> :
                                            (hasBankDetails ? 
                                            <span className="badge bg-success bg-opacity-10 text-success border border-success">Details Provided</span> :
                                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">Waiting for User</span>)
                                        ) : (
                                            <span className="text-muted small">Auto (Source)</span>
                                        )}
                                    </td>

                                    <td className="text-center pe-4">
                                        {order.refundStatus === 'completed' ? (
                                            <div className="d-flex flex-column align-items-center">
                                                <span className="badge bg-light text-success border d-flex align-items-center gap-1">
                                                    <CheckCircle size={12} /> Refunded
                                                </span>
                                                <small className="text-muted font-monospace" style={{fontSize: '0.7rem'}}>
                                                    {order.refundId}
                                                </small>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => openRefundModal(order)}
                                                className="btn btn-sm btn-outline-primary"
                                                // ✅ DISABLED LOGIC UPDATE:
                                                // Disable only if COD AND Refund Needed AND No Details
                                                disabled={order.paymentMethod === 'cod' && order.refundAmount > 0 && !hasBankDetails}
                                            >
                                                {order.paymentMethod === 'cod' && order.refundAmount > 0 && !hasBankDetails ? 'Waiting...' : 'Process'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>
             
             <div className="card-footer bg-white border-top py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">Page {page} of {totalPages}</span>
                    <div className="d-flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-outline-secondary btn-sm"><ArrowLeft size={16} /></button>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-outline-secondary btn-sm"><ArrowRight size={16} /></button>
                    </div>
                </div>
            </div>

        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedOrder && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-header bg-light">
                        <h5 className="modal-title fw-bold">Initiate Refund</h5>
                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                    </div>

                    <div className="modal-body p-4">
                        {/* Summary Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
                             <div>
                                 <small className="text-muted d-block">Refund Amount</small>
                                 <h3 className="text-primary fw-bold mb-0">₹{selectedOrder.refundAmount.toFixed(2)}</h3>
                             </div>
                             <div className="text-end">
                                 <small className="text-muted d-block">Cancellation Charge</small>
                                 <span className="text-danger fw-bold">- ₹{selectedOrder.cancellationCharge.toFixed(2)}</span>
                             </div>
                        </div>

                        {/* ONLINE PAYMENT LOGIC */}
                        {selectedOrder.paymentMethod !== 'cod' && (
                            <div className="alert alert-info d-flex gap-2">
                                <CreditCard size={20} />
                                <div>
                                    <strong>Online Payment detected.</strong>
                                    <p className="mb-0 small">Refund will be automatically credited to the original source via Razorpay.</p>
                                    <p className="mb-0 small fw-bold mt-1">Payment ID: {selectedOrder.paymentId || 'N/A'}</p>
                                </div>
                            </div>
                        )}

                        {/* ✅ COD PAYMENT LOGIC */}
                        {selectedOrder.paymentMethod === 'cod' && (
                            <div>
                                {selectedOrder.refundAmount > 0 ? (
                                    <>
                                        {/* CASE 1: COD With Refund (Returned Items etc) */}
                                        <div className="alert alert-warning d-flex gap-2 mb-3">
                                            <Banknote size={20} />
                                            <div>
                                                <strong>COD Order - Manual Refund Required</strong>
                                                <p className="mb-0 small">Please transfer money manually to the user and enter details below.</p>
                                            </div>
                                        </div>

                                        {/* USER BANK DETAILS */}
                                        <h6 className="fw-bold border-bottom pb-2 mb-3">User's Beneficiary Details</h6>
                                        
                                        {selectedOrder.refundBeneficiaryDetails ? (
                                            <div className="bg-white border rounded p-3 mb-3">
                                                {selectedOrder.refundBeneficiaryDetails.mode === 'upi' ? (
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">UPI ID:</span>
                                                        <span className="fw-bold">{selectedOrder.refundBeneficiaryDetails.upiId}</span>
                                                    </div>
                                                ) : (
                                                    <div className="small">
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <span className="text-muted">Bank:</span>
                                                            <span className="fw-bold">{selectedOrder.refundBeneficiaryDetails.bankName}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <span className="text-muted">A/C No:</span>
                                                            <span className="fw-bold font-monospace fs-6">{selectedOrder.refundBeneficiaryDetails.accountNumber}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <span className="text-muted">IFSC:</span>
                                                            <span className="fw-bold">{selectedOrder.refundBeneficiaryDetails.ifsc}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between">
                                                            <span className="text-muted">Holder:</span>
                                                            <span className="fw-bold">{selectedOrder.refundBeneficiaryDetails.accountHolderName}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="alert alert-danger small mb-3">
                                                User has not provided bank details yet. Please contact user or wait.
                                            </div>
                                        )}

                                        {/* ADMIN INPUTS */}
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Payment Mode Used</label>
                                            <select 
                                                className="form-select" 
                                                value={manualMode} 
                                                onChange={(e) => setManualMode(e.target.value)}
                                                disabled={!selectedOrder.refundBeneficiaryDetails}
                                            >
                                                <option>Bank Transfer (IMPS/NEFT)</option>
                                                <option>UPI</option>
                                                <option>Cash</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Transaction Ref ID (Required)</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="Enter Bank/UPI Transaction ID"
                                                value={manualTxnId}
                                                onChange={(e) => setManualTxnId(e.target.value)}
                                                disabled={!selectedOrder.refundBeneficiaryDetails}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* CASE 2: COD With 0 Refund (Cancelled before delivery) */}
                                        <div className="alert alert-secondary d-flex gap-2 mb-3">
                                            <ShieldCheck size={20} />
                                            <div>
                                                <strong>No Refund Required</strong>
                                                <p className="mb-0 small">This was a COD order cancelled before payment collection. No refund transaction is needed.</p>
                                            </div>
                                        </div>
                                        <p className="text-muted small">Click "Mark as Settled" to close this ticket and remove it from the pending list.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                        <button type="button" className="btn btn-light border" onClick={() => setShowModal(false)} disabled={refundLoading}>Close</button>
                        
                        {/* Button Logic Updated */}
                        <button 
                            type="button" 
                            className="btn btn-primary"
                            onClick={handleProcessRefund}
                            // Disabled ONLY if:
                            // 1. Loading
                            // 2. COD AND RefundNeeded AND No Bank Details
                            disabled={
                                refundLoading || 
                                (selectedOrder.paymentMethod === 'cod' && selectedOrder.refundAmount > 0 && !selectedOrder.refundBeneficiaryDetails)
                            }
                        >
                            {refundLoading ? 'Processing...' : (selectedOrder.refundAmount <= 0 ? 'Mark as Settled' : 'Confirm Refund Completed')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CancelledOrders;