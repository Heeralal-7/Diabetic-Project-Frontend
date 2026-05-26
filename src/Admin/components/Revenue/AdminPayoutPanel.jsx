import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Badge, Spinner, Alert, Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';

const AdminPayoutPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  
  // Action State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // ✅ New Receipt Modal
  
  // Processing State
  const [actionLoading, setActionLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(''); // To show steps

  // Data
  const [paymentMode, setPaymentMode] = useState('razorpay'); 
  const [transactionId, setTransactionId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [successData, setSuccessData] = useState(null); // Store data for receipt

  const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

  const getToken = () => {
    const data = sessionStorage.getItem("admin");
    if (!data) return null;
    try { return JSON.parse(data).token; } catch { return null; }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const queryParam = filter === 'all' ? '' : `?status=${filter}`;
      const response = await axios.get(`${URL}/admin-payout/payout-requests${queryParam}`, { headers: { token } });
      if (response.data.success) setRequests(response.data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  // --- ACTIONS ---

  const handleApproveClick = (req) => {
    setSelectedRequest(req);
    const hasBankDetails = req.vendorId?.bankDetails?.accountNumber;
    setPaymentMode(hasBankDetails ? 'razorpay' : 'manual');
    setTransactionId('');
    setAdminNote('');
    setShowApproveModal(true);
  };

  // ✅ CONFIRM APPROVE (THE REAL EXPERIENCE)
  const confirmApprove = async () => {
    if (paymentMode === 'manual' && !transactionId) return alert("Enter Transaction ID");

    setActionLoading(true);
    
    // 1. Simulate "Connecting..." UI for better UX
    setProcessingStatus('Connecting to Banking Gateway...');
    
    // Artificial Delay for "Real Feel" (Only for Razorpay mode)
    if (paymentMode === 'razorpay') {
        await new Promise(r => setTimeout(r, 1500)); 
        setProcessingStatus('Processing Transfer...');
    }

    try {
      const token = getToken();
      const response = await axios.put(
        `${URL}/admin-payout/payout-request/approve/${selectedRequest._id}`,
        { 
            paymentMode, 
            transactionId: paymentMode === 'manual' ? transactionId : null,
            adminNote 
        },
        { headers: { token } }
      );

      if (response.data.success) {
        // Success! Show Receipt
        setProcessingStatus('Transfer Successful!');
        await new Promise(r => setTimeout(r, 500)); // Small pause

        setSuccessData({
            amount: selectedRequest.totalAmount,
            vendor: selectedRequest.vendorId?.name,
            txnId: response.data.data.transactionId,
            date: new Date().toLocaleString()
        });

        setShowApproveModal(false);
        setShowSuccessModal(true); // Open Success Receipt
        fetchRequests();
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Transfer Failed.");
    } finally {
      setActionLoading(false);
      setProcessingStatus('');
    }
  };

  // Reject Logic
  const handleRejectClick = (req) => { setSelectedRequest(req); setRejectReason(''); setShowRejectModal(true); };
  const confirmReject = async () => {
    if (!rejectReason) return alert("Enter reason");
    setActionLoading(true);
    try {
      const token = getToken();
      await axios.put(`${URL}/admin-payout/payout-request/reject/${selectedRequest._id}`, { reason: rejectReason }, { headers: { token } });
      setShowRejectModal(false);
      fetchRequests();
    } catch (e) { alert("Failed"); } finally { setActionLoading(false); }
  };

  const getBadgeColor = (status) => status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning';

  return (
    <div className="container mt-4">
      {/* Styles for Receipt Animation */}
      <style>{`
        .success-checkmark { width: 80px; height: 80px; margin: 0 auto; }
        .check-icon { width: 80px; height: 80px; position: relative; border-radius: 50%; box-sizing: content-box; border: 4px solid #4CAF50; }
        .check-icon::before { top: 3px; left: -2px; width: 30px; transform-origin: 100% 50%; border-radius: 100px 0 0 100px; }
        .check-icon::after { top: 0; left: 30px; width: 60px; transform-origin: 0 50%; border-radius: 0 100px 100px 0; animation: rotate-circle 4.25s ease-in; }
        .icon-line { height: 5px; background-color: #4CAF50; display: block; border-radius: 2px; position: absolute; z-index: 10; }
        .line-tip { top: 46px; left: 14px; width: 25px; transform: rotate(45deg); animation: icon-line-tip 0.75s; }
        .line-long { top: 38px; right: 8px; width: 47px; transform: rotate(-45deg); animation: icon-line-long 0.75s; }
        @keyframes icon-line-tip { 0% { width: 0; left: 1px; top: 19px; } 54% { width: 0; left: 1px; top: 19px; } 70% { width: 50px; left: -8px; top: 37px; } 84% { width: 17px; left: 21px; top: 48px; } 100% { width: 25px; left: 14px; top: 46px; } }
        @keyframes icon-line-long { 0% { width: 0; right: 46px; top: 54px; } 65% { width: 0; right: 46px; top: 54px; } 84% { width: 55px; right: 0px; top: 35px; } 100% { width: 47px; right: 8px; top: 38px; } }
      `}</style>

      <div className="card shadow-lg border-0">
        <div className="card-header bg-dark text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0"><i className="fas fa-wallet me-2"></i> Payout Management</h4>
            <Button variant="light" size="sm" onClick={fetchRequests} disabled={loading}><i className="fas fa-sync me-1"></i> Refresh</Button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="bg-light p-3 border-bottom">
            <Nav variant="pills" activeKey={filter} onSelect={(k) => setFilter(k)}>
              <Nav.Item><Nav.Link eventKey="pending" className="px-4">Pending</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="approved" className="px-4">Paid History</Nav.Link></Nav.Item>
              {/* <Nav.Item><Nav.Link eventKey="rejected" className="px-4">Rejected</Nav.Link></Nav.Item> */}
            </Nav>
          </div>

          <div className="p-3">
            {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr><th>Date</th><th>Vendor</th><th>Type</th><th className="text-end">Amount</th><th className="text-center">Status</th><th className="text-center">Action</th></tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req._id}>
                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td>{req.vendorId?.shopName || req.vendorId?.name}</td>
                        <td><Badge bg="secondary">{req.vendorModel}</Badge></td>
                        <td className="text-end fw-bold text-success">{formatCurrency(req.totalAmount)}</td>
                        <td className="text-center"><Badge bg={getBadgeColor(req.status)}>{req.status}</Badge></td>
                        <td className="text-center">
                          {req.status === 'pending' ? (
                            <>
                              <Button variant="success" size="sm" className="me-2" onClick={() => handleApproveClick(req)}>Pay</Button>
                              {/* <Button variant="danger" size="sm" onClick={() => handleRejectClick(req)}>Reject</Button> */}
                            </>
                          ) : (
                            <Button variant="outline-secondary" size="sm" disabled>Locked</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* APPROVE / PAY MODAL */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered backdrop="static " size="xl"style={{width: '100%',}}>
        <Modal.Header closeButton={!actionLoading} className="bg-success text-white " >
          <Modal.Title><i className="fas fa-money-bill-wave me-2"></i> Process Payout</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          {/* PROCESSING STATE VIEW */}
          {actionLoading ? (
             <div className="text-center py-5">
                 <Spinner animation="border" variant="success" style={{width: '3rem', height: '3rem'}} />
                 <h5 className="mt-3 text-muted">{processingStatus}</h5>
                 <p className="small text-muted">Please do not close this window.</p>
             </div>
          ) : (
             /* INPUT STATE VIEW */
             selectedRequest && (
              <>
                <div className="alert alert-light border text-center mb-3">
                    <p className="mb-1 text-muted">Paying Amount</p>
                    <h2 className="text-success fw-bold">{formatCurrency(selectedRequest.totalAmount)}</h2>
                    <p className="mb-0 small">To: <strong>{selectedRequest.vendorId?.name}</strong></p>
                </div>

                {/* Bank Details */}
                {selectedRequest.vendorId?.bankDetails?.accountNumber ? (
                    <div className="card bg-light mb-3 p-3 border-0">
                        <h6 className="text-muted mb-2"><i className="fas fa-university me-1"></i> Beneficiary Bank</h6>
                        <div className="row g-1 small">
                            <div className="col-6">A/C Holder Name: <strong>{selectedRequest.vendorId.bankDetails.accountHolderName}</strong></div>
                            <div className="col-6">Bank: <strong>{selectedRequest.vendorId.bankDetails.bankName}</strong></div>
                            <div className="col-6">IFSC: <strong>{selectedRequest.vendorId.bankDetails.ifscCode}</strong></div>
                            <div className="col-12">A/C: <strong className="font-monospace text-primary">{selectedRequest.vendorId.bankDetails.accountNumber}</strong></div>
                        </div>
                    </div>
                ) : (
                    <Alert variant="warning" className="small py-2">
                        <i className="fas fa-exclamation-triangle me-2"></i> Vendor bank details missing. Auto-transfer disabled.
                    </Alert>
                )}

                <label className="fw-bold mb-2">Payment Mode:</label>
                <div className="d-flex gap-2 mb-3">
                    <Button 
                        variant={paymentMode === 'razorpay' ? 'success' : 'outline-secondary'} 
                        className="flex-fill"
                        onClick={() => selectedRequest.vendorId?.bankDetails?.accountNumber && setPaymentMode('razorpay')}
                        style={{opacity: selectedRequest.vendorId?.bankDetails?.accountNumber ? 1 : 0.5}}
                    >
                        <i className="fas fa-bolt me-1"></i> Instant Transfer
                    </Button>
                    <Button 
                        variant={paymentMode === 'manual' ? 'primary' : 'outline-secondary'} 
                        className="flex-fill"
                        onClick={() => setPaymentMode('manual')}
                    >
                        <i className="fas fa-pen me-1"></i> Manual Entry
                    </Button>
                </div>

                {paymentMode === 'manual' && (
                    <Form.Group className="mb-3">
                        <Form.Label>Ref No / Transaction ID</Form.Label>
                        <Form.Control type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)} autoFocus />
                    </Form.Group>
                )}
              </>
             )
          )}
        </Modal.Body>
        <Modal.Footer>
          {!actionLoading && (
            <>
              <Button variant="secondary" onClick={() => setShowApproveModal(false)}>Cancel</Button>
              <Button variant="success" onClick={confirmApprove} disabled={paymentMode === 'manual' && !transactionId}>
                Confirm Transfer
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* SUCCESS RECEIPT MODAL */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Body className="text-center py-5">
            <div className="success-checkmark">
                <div className="check-icon">
                    <span className="icon-line line-tip"></span>
                    <span className="icon-line line-long"></span>
                </div>
            </div>
            <h3 className="text-success mt-4">Payment Successful!</h3>
            <p className="text-muted">Amount has been transferred successfully.</p>
            
            {successData && (
                <div className="card bg-light border-0 p-3 mt-4 text-start">
                    <div className="d-flex justify-content-between mb-2">
                        <span>Amount:</span>
                        <strong className="text-success">{formatCurrency(successData.amount)}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <span>Vendor:</span>
                        <strong>{successData.vendor}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <span>Transaction ID:</span>
                        <strong className="font-monospace user-select-all">{successData.txnId}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span>Date:</span>
                        <small>{successData.date}</small>
                    </div>
                </div>
            )}

            <Button variant="success" className="mt-4 px-5 rounded-pill" onClick={() => setShowSuccessModal(false)}>
                Done
            </Button>
        </Modal.Body>
      </Modal>

      {/* REJECT MODAL */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white"><Modal.Title>Reject Request</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form.Control as="textarea" rows={3} placeholder="Reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmReject} disabled={actionLoading}>Reject</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPayoutPanel;