import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Alert, Spinner, Badge, Table, Button, Form, Modal } from 'react-bootstrap';

// Import Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler
);

const FoodRevenue = ({ refreshKey }) => {
  // --- ANALYTICS STATE ---
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    ordersCount: 0,
    totalNetEarning: 0,
    totalAdminShare: 0,
    currentCutoff: 0,
    revenueByDate: {},
    netEarningByDate: {},
    monthlyRevenueData: {},
    monthlyNetData: {},
    monthlyAdminData: {},
    recentOrders: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- PAYOUT STATE ---
  const [payoutTab, setPayoutTab] = useState('analytics');
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  
  // Payout Summary State
  const [payoutStats, setPayoutStats] = useState({ totalAmount: 0, count: 0 });
  const [payoutSummary, setPayoutSummary] = useState({
    pendingRequestAmount: 0,
    totalPaidAmount: 0,
    paidBreakdown: { today: 0, week: 0, month: 0, year: 0 }
  });
  const [payoutHistory, setPayoutHistory] = useState([]);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [vendorType, setVendorType] = useState('food');

  // API Base URL
  const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

  // ==========================================
  // 1. TOKEN HELPER
  // ==========================================
  const getAllVendorToken = useCallback(() => {
    const tokenNames = ['foodtoken', 'Pharmacytoken', 'labtoken'];

    for (const name of tokenNames) {
      try {
        const tokenData = sessionStorage.getItem(name);
        if (tokenData && tokenData !== 'null') {
          const parsed = JSON.parse(tokenData);
          if (parsed && parsed.token) {
            let type = 'food';
            if (name === 'Pharmacytoken') type = 'pharmacy';
            if (name === 'labtoken') type = 'lab';
            return { token: parsed.token, type: type };
          }
        }
      } catch (err) {
        console.warn(`Warning: Could not process '${name}'.`, err.message);
      }
    }
    throw new Error("No vendor token found. Please login again.");
  }, []);

  // ==========================================
  // 2. EFFECTS & HELPERS
  // ==========================================

  useEffect(() => {
    try {
        const { type } = getAllVendorToken();
        setVendorType(type);
    } catch(e) { console.log(e); }

    fetchOrderRevenueData();
    // eslint-disable-next-line
  }, [refreshKey]);

  useEffect(() => {
    if (payoutTab === 'payout') {
        fetchEligiblePayouts();
        fetchPayoutSummary();
        fetchPayoutHistory();
    }
    // eslint-disable-next-line
  }, [payoutTab]);

  const getOrderDate = (order) => {
    if (order.createdAt) return new Date(order.createdAt);
    if (order._id) {
        const timestamp = parseInt(order._id.substring(0, 8), 16) * 1000;
        return new Date(timestamp);
    }
    return new Date();
  };

  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    if (s === '7' || s === '5' || s === 'completed' || s === 'delivered') return <Badge bg="success">Completed</Badge>;
    if (s === '1' || s === 'confirmed') return <Badge bg="info">Confirmed</Badge>;
    if (s === '2' || s === 'preparing') return <Badge bg="primary">Preparing</Badge>;
    if (s === '3' || s === 'ready') return <Badge bg="primary">Ready</Badge>;
    if (s === '4' || s === 'out_for_delivery') return <Badge bg="warning" text="dark">Out for Delivery</Badge>;
    if (s === '0' || s === 'pending') return <Badge bg="warning" text="dark">Pending</Badge>;
    if (s === '9' || s === 'cancelled' || s === 'rejected') return <Badge bg="danger">Cancelled</Badge>;
    return <Badge bg="secondary">Status: {status}</Badge>;
  };

  const getPayoutStatusBadge = (status) => {
      if(status === 'approved') return <Badge bg="success">Paid</Badge>;
      if(status === 'rejected') return <Badge bg="danger">Rejected</Badge>;
      return <Badge bg="warning" text="dark">Pending</Badge>;
  };

  // ==========================================
  // 3. API CALLS - ANALYTICS
  // ==========================================

  const fetchOrderRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { token } = getAllVendorToken();
      const headers = { Authorization: `Bearer ${token}` };

      const statsPromise = axios.get(`${URL}/food-vendor-revenue/stats`, { headers });
      const ordersPromise = axios.get(`${URL}/food-vendor-revenue/orders?limit=2000`, { headers });

      const [statsRes, ordersRes] = await Promise.all([statsPromise, ordersPromise]);

      if (statsRes.data.success) {
        const stats = statsRes.data.data || {};
        const orders = ordersRes.data.data || [];
        const cutoff = statsRes.data.cutoffPercentage || 0;
        const now = new Date();

        const monthlyRevenueAggregated = {};
        const monthlyNetAggregated = {};
        const monthlyAdminAggregated = {};

        for (let i = 0; i < 12; i++) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthLabel = monthDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
          monthlyRevenueAggregated[monthLabel] = 0;
          monthlyNetAggregated[monthLabel] = 0;
          monthlyAdminAggregated[monthLabel] = 0;
        }

        const revenueByDate = {};
        const netEarningByDate = {};
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        sevenDaysAgo.setHours(0,0,0,0); 

        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
          const dateString = dayDate.toISOString().split('T')[0];
          revenueByDate[dateString] = 0;
          netEarningByDate[dateString] = 0;
        }

        let calcTotalNet = 0;
        let calcTotalAdmin = 0;

        const processedOrdersList = orders.map(order => {
            const dateObj = getOrderDate(order);
            const orderTimestamp = dateObj.getTime();
            const gross = parseFloat(order.totalAmount) || 0;
            const net = parseFloat(order.yourEarning) || 0;
            const admin = parseFloat(order.adminCommission) || 0;

            calcTotalNet += net;
            calcTotalAdmin += admin;

            const orderDateString = dateObj.toISOString().split('T')[0];
            const orderMonthLabel = dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric' });

            if (orderTimestamp >= sevenDaysAgo.getTime() && revenueByDate.hasOwnProperty(orderDateString)) {
                revenueByDate[orderDateString] += gross;
                netEarningByDate[orderDateString] += net;
            }

            if (monthlyRevenueAggregated.hasOwnProperty(orderMonthLabel)) {
                monthlyRevenueAggregated[orderMonthLabel] += gross;
                monthlyNetAggregated[orderMonthLabel] += net;
                monthlyAdminAggregated[orderMonthLabel] += admin;
            }

            return {
                ...order,
                displayDate: dateObj.toLocaleDateString(),
                displayTime: dateObj.toLocaleTimeString(),
                gross, net, admin
            };
        });

        // ✅ SAFE DATA SETTING (Added fallbacks || 0)
        setRevenueData({
          totalRevenue: stats.total?.revenue || 0,
          monthlyRevenue: stats.monthly?.revenue || 0,
          weeklyRevenue: stats.weekly?.revenue || 0,
          dailyRevenue: stats.today?.revenue || 0,
          ordersCount: stats.total?.count || 0,
          totalNetEarning: calcTotalNet,
          totalAdminShare: calcTotalAdmin,
          currentCutoff: cutoff,
          revenueByDate,
          netEarningByDate,
          monthlyRevenueData: monthlyRevenueAggregated,
          monthlyNetData: monthlyNetAggregated,
          monthlyAdminData: monthlyAdminAggregated,
          recentOrders: processedOrdersList
        });

      } else {
        throw new Error(statsRes.data.message || "Failed to fetch stats");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load revenue data.");
      setLoading(false);
    }
  };

  // ==========================================
  // 4. API CALLS - PAYOUTS
  // ==========================================

  const fetchEligiblePayouts = async () => {
      try {
          setPayoutLoading(true);
          const { token, type } = getAllVendorToken();
          
          const res = await axios.get(`${URL}/vendor-payout/payout-eligible`, {
              params: { type: type }, // 'food'
              headers: { Authorization: `Bearer ${token}` }
          });
          
          if(res.data.success) {
              setEligibleOrders(res.data.orders || []);
              // ✅ SAFE FALLBACK FOR TOTAL AMOUNT
              setPayoutStats({
                  totalAmount: res.data.totalPayableAmount || res.data.totalAmount || 0,
                  count: res.data.count || 0
              });
              setSelectedOrderIds([]); 
          }
          setPayoutLoading(false);
      } catch (err) {
          console.error("Error fetching payouts", err);
          setPayoutLoading(false);
      }
  };

  const fetchPayoutSummary = async () => {
    try {
        const { token } = getAllVendorToken();
        const res = await axios.get(`${URL}/vendor-payout/payout-summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if(res.data.success) {
            // ✅ Ensure deep nesting safety
            const data = res.data.data || {};
            const breakdown = data.paidBreakdown || {};
            setPayoutSummary({
                pendingRequestAmount: data.pendingRequestAmount || 0,
                totalPaidAmount: data.totalPaidAmount || 0,
                paidBreakdown: {
                    today: breakdown.today || 0,
                    week: breakdown.week || 0,
                    month: breakdown.month || 0,
                    year: breakdown.year || 0
                }
            });
        }
    } catch (err) {
        console.error("Error fetching payout summary", err);
    }
  };

  const fetchPayoutHistory = async () => {
    try {
        const { token } = getAllVendorToken();
        const res = await axios.get(`${URL}/vendor-payout/payout-history`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if(res.data.success) setPayoutHistory(res.data.data || []);
    } catch (err) {
        console.error("Error fetching payout history", err);
    }
  };

  const submitPayoutRequest = async () => {
      if(selectedOrderIds.length === 0) return;
      try {
          setPayoutLoading(true);
          const { token, type } = getAllVendorToken();
          await axios.post(`${URL}/vendor-payout/request-payout`, {
              vendorType: type, // 'food'
              orderIds: selectedOrderIds
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setShowSuccessModal(true);
          setPayoutLoading(false);
          fetchEligiblePayouts();
          fetchPayoutSummary();
          fetchPayoutHistory();
      } catch (err) {
          alert(err.response?.data?.message || "Failed to submit request");
          setPayoutLoading(false);
      }
  };

  // UI Handlers
  const handleSelectAll = (e) => {
      if(e.target.checked) setSelectedOrderIds(eligibleOrders.map(o => o.id));
      else setSelectedOrderIds([]);
  };

  const handleSelectOrder = (id) => {
      if(selectedOrderIds.includes(id)) setSelectedOrderIds(selectedOrderIds.filter(item => item !== id));
      else setSelectedOrderIds([...selectedOrderIds, id]);
  };

  const getSelectedTotal = () => {
      return eligibleOrders
        .filter(o => selectedOrderIds.includes(o.id))
        .reduce((sum, current) => sum + (current.payableAmount || current.amount || 0), 0);
  };

  // ==========================================
  // 5. CHART CONFIGURATIONS
  // ==========================================
  const sortedMonthLabels = Object.keys(revenueData.monthlyRevenueData).sort((a, b) => {
    const monthMap = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
    return monthMap.indexOf(monthA) - monthMap.indexOf(monthB);
  });

  const chartDataMonthly = {
    labels: sortedMonthLabels,
    datasets: [
      { label: 'Your Net Earning', data: sortedMonthLabels.map(m => revenueData.monthlyNetData[m] || 0), backgroundColor: '#198754' },
      { label: 'Admin Commission', data: sortedMonthLabels.map(m => revenueData.monthlyAdminData[m] || 0), backgroundColor: '#dc3545' },
    ],
  };

  const lineChartSortedDates = Object.keys(revenueData.revenueByDate).sort();
  const chartDataLine = {
    labels: lineChartSortedDates,
    datasets: [
      { label: 'Gross Revenue', data: lineChartSortedDates.map(d => revenueData.revenueByDate[d] || 0), borderColor: '#0d6efd', backgroundColor: 'rgba(13, 110, 253, 0.1)', fill: true, tension: 0.3 },
      { label: 'Net Earning', data: lineChartSortedDates.map(d => revenueData.netEarningByDate[d] || 0), borderColor: '#198754', backgroundColor: 'rgba(25, 135, 84, 0.1)', fill: true, tension: 0.3 },
    ],
  };

  const chartDataPie = {
    labels: ['Your Net Earning', 'Admin Commission'],
    datasets: [{ data: [revenueData.totalNetEarning, revenueData.totalAdminShare], backgroundColor: ['#198754', '#dc3545'], borderColor: ['#fff', '#fff'], borderWidth: 2 }],
  };

  // ==========================================
  // 6. RENDER
  // ==========================================

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="m-3"><strong>Error:</strong> {error}</Alert>;

  return (
    <div className="container-fluid my-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Food Revenue & Payouts</h2>
            <div className="bg-white p-1 rounded border shadow-sm">
                <Button variant={payoutTab === 'analytics' ? 'primary' : 'light'} onClick={() => setPayoutTab('analytics')} className="me-1 fw-bold"><i className="bi bi-graph-up me-2"></i> Analytics</Button>
                <Button variant={payoutTab === 'payout' ? 'primary' : 'light'} onClick={() => setPayoutTab('payout')} className="fw-bold"><i className="bi bi-wallet2 me-2"></i> Payouts</Button>
            </div>
          </div>

          {/* === VIEW 1: ANALYTICS === */}
          {payoutTab === 'analytics' ? (
            <>
              {/* Stats Cards - Added fallbacks to 0 */}
              <div className="row mb-4">
                <div className="col-md-3"><div className="card bg-primary text-white h-100 shadow-sm"><div className="card-body"><h5>Total Revenue</h5><h2>₹{(revenueData.totalRevenue || 0).toFixed(2)}</h2></div></div></div>
                <div className="col-md-3"><div className="card bg-success text-white h-100 shadow-sm"><div className="card-body"><h5>Monthly Revenue</h5><h2>₹{(revenueData.monthlyRevenue || 0).toFixed(2)}</h2></div></div></div>
                <div className="col-md-3"><div className="card bg-info text-white h-100 shadow-sm"><div className="card-body"><h5>Weekly Revenue</h5><h2>₹{(revenueData.weeklyRevenue || 0).toFixed(2)}</h2></div></div></div>
                <div className="col-md-3"><div className="card bg-warning text-dark h-100 shadow-sm"><div className="card-body"><h5>Daily Revenue</h5><h2>₹{(revenueData.dailyRevenue || 0).toFixed(2)}</h2></div></div></div>
              </div>
              
              {/* Detailed Cards */}
              <div className="row mb-4">
                <div className="col-md-3"><div className="card border-primary h-100 shadow-sm"><div className="card-body"><h6 className="text-primary">Gross Revenue</h6><h3>₹{(revenueData.totalRevenue || 0).toFixed(2)}</h3></div></div></div>
                <div className="col-md-3"><div className="card border-success h-100 shadow-sm"><div className="card-body"><h6 className="text-success">Net Earnings</h6><h3>₹{(revenueData.totalNetEarning || 0).toFixed(2)}</h3></div></div></div>
                <div className="col-md-3"><div className="card border-danger h-100 shadow-sm"><div className="card-body"><h6 className="text-danger">Admin Commission</h6><h3>₹{(revenueData.totalAdminShare || 0).toFixed(2)}</h3></div></div></div>
                <div className="col-md-3"><div className="card border-secondary h-100 shadow-sm"><div className="card-body"><h6 className="text-secondary">Current Plan</h6><h3>{revenueData.currentCutoff}%</h3></div></div></div>
              </div>

              {/* Charts */}
              <div className="row mb-4">
                <div className="col-lg-6"><div className="card shadow-sm h-100"><div className="card-body" style={{ height: '400px' }}><Bar options={{responsive:true,maintainAspectRatio:false}} data={chartDataMonthly} /></div></div></div>
                <div className="col-lg-6"><div className="card shadow-sm h-100"><div className="card-body" style={{ height: '400px' }}><Pie options={{responsive:true,maintainAspectRatio:false}} data={chartDataPie} /></div></div></div>
              </div>
              <div className="row mb-4"><div className="col-12"><div className="card shadow-sm"><div className="card-body" style={{ height: '400px' }}><Line options={{responsive:true,maintainAspectRatio:false}} data={chartDataLine} /></div></div></div></div>

              {/* Recent Orders */}
              <div className="row"><div className="col-12"><div className="card shadow-sm"><div className="card-header bg-white"><h5 className="mb-0">Recent Order History</h5></div><div className="card-body p-0"><div className="table-responsive"><Table hover className="mb-0 align-middle"><thead className="bg-light"><tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Status</th><th className="text-end">Total</th><th className="text-end text-danger">Admin</th><th className="text-end text-success">Net</th></tr></thead><tbody>{revenueData.recentOrders.length > 0 ? (revenueData.recentOrders.map((o,i)=>(<tr key={i}><td className="fw-bold text-primary">{o.orderId || o._id.slice(-8)}</td><td><div>{o.displayDate}</div><small className="text-muted">{o.displayTime}</small></td><td>{o.customerName}</td><td>{getStatusBadge(o.status)}</td><td className="text-end fw-bold">₹{o.gross.toFixed(2)}</td><td className="text-end text-danger">-₹{o.admin.toFixed(2)}</td><td className="text-end text-success fw-bold">₹{o.net.toFixed(2)}</td></tr>))) : (<tr><td colSpan="7" className="text-center py-4">No orders found.</td></tr>)}</tbody></Table></div></div></div></div></div>
            </>
          ) : (
            // === VIEW 2: PAYOUTS (NEW) ===
            <>
                <div className="alert alert-info border-info d-flex align-items-center mb-4"><i className="bi bi-info-circle-fill me-2 fs-4"></i><div><strong>Payout Policy:</strong> Orders become eligible for withdrawal <strong>7 days after completion</strong>.</div></div>

                {/* Summary Cards - Added fallbacks */}
                <div className="row mb-4">
                    <div className="col-md-4 mb-3"><div className="card bg-white border-start border-4 border-success shadow-sm h-100"><div className="card-body"><h6 className="text-muted text-uppercase mb-2">Available for Withdrawal</h6><h2 className="text-success fw-bold">₹{(payoutStats.totalAmount || 0).toFixed(2)}</h2><span className="badge bg-light text-dark border">{payoutStats.count || 0} orders eligible</span></div></div></div>
                    <div className="col-md-4 mb-3"><div className="card bg-white border-start border-4 border-warning shadow-sm h-100"><div className="card-body"><h6 className="text-muted text-uppercase mb-2">Pending Requests</h6><h2 className="text-warning fw-bold">₹{(payoutSummary.pendingRequestAmount || 0).toFixed(2)}</h2><span className="text-muted small">Awaiting admin approval</span></div></div></div>
                    <div className="col-md-4 mb-3"><div className="card bg-white border-start border-4 border-primary shadow-sm h-100"><div className="card-body"><h6 className="text-muted text-uppercase mb-2">Total Paid Out</h6><h2 className="text-primary fw-bold">₹{(payoutSummary.totalPaidAmount || 0).toFixed(2)}</h2><span className="text-muted small">Lifetime earnings withdrawn</span></div></div></div>
                </div>

                {/* Breakdown - Added fallbacks */}
                <div className="row mb-5 g-2">
                     <div className="col-6 col-md-3"><div className="card bg-light border-0 shadow-sm"><div className="card-body text-center p-3"><small className="text-muted d-block text-uppercase" style={{fontSize:'0.75rem'}}>Paid Today</small><strong className="fs-5 text-dark">₹{(payoutSummary.paidBreakdown.today || 0).toFixed(2)}</strong></div></div></div>
                     <div className="col-6 col-md-3"><div className="card bg-light border-0 shadow-sm"><div className="card-body text-center p-3"><small className="text-muted d-block text-uppercase" style={{fontSize:'0.75rem'}}>Paid This Week</small><strong className="fs-5 text-dark">₹{(payoutSummary.paidBreakdown.week || 0).toFixed(2)}</strong></div></div></div>
                     <div className="col-6 col-md-3"><div className="card bg-light border-0 shadow-sm"><div className="card-body text-center p-3"><small className="text-muted d-block text-uppercase" style={{fontSize:'0.75rem'}}>Paid This Month</small><strong className="fs-5 text-dark">₹{(payoutSummary.paidBreakdown.month || 0).toFixed(2)}</strong></div></div></div>
                     <div className="col-6 col-md-3"><div className="card bg-light border-0 shadow-sm"><div className="card-body text-center p-3"><small className="text-muted d-block text-uppercase" style={{fontSize:'0.75rem'}}>Paid This Year</small><strong className="fs-5 text-dark">₹{(payoutSummary.paidBreakdown.year || 0).toFixed(2)}</strong></div></div></div>
                </div>

                <hr className="my-5" />

                {/* Request Action */}
                <div className="row mb-4 align-items-end">
                    <div className="col-md-8"><h4 className="mb-1">Select Orders</h4><p className="text-muted mb-0">Choose orders to include in your payout request.</p></div>
                    <div className="col-md-4 text-end">
                        <div className="card bg-light border-success"><div className="card-body p-3 d-flex justify-content-between align-items-center"><div><small className="d-block text-muted">Selected Total</small><strong className="fs-4 text-success">₹{(getSelectedTotal() || 0).toFixed(2)}</strong></div><Button variant="success" disabled={selectedOrderIds.length === 0 || payoutLoading} onClick={submitPayoutRequest} className="fw-bold px-4">{payoutLoading ? <Spinner size="sm" animation="border" /> : 'Request Payout'}</Button></div></div>
                    </div>
                </div>

                {/* ELIGIBLE ORDERS TABLE - UPDATED */}
                <div className="card shadow-sm mb-5">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                        <h6 className="mb-0 fw-bold">Eligible Orders ({eligibleOrders.length})</h6>
                        <div><Form.Check type="checkbox" id="select-all" label="Select All" checked={eligibleOrders.length > 0 && selectedOrderIds.length === eligibleOrders.length} onChange={handleSelectAll} disabled={eligibleOrders.length === 0}/></div>
                    </div>
                    <div className="card-body p-0">
                        {payoutLoading && eligibleOrders.length === 0 ? (
                             <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Checking eligibility...</p></div>
                        ) : (
                            <div className="table-responsive" style={{maxHeight: '400px', overflowY: 'auto'}}>
                                <Table hover className="mb-0 align-middle">
                                    <thead className="bg-light sticky-top">
                                        <tr>
                                            <th style={{width: '50px'}} className="text-center">#</th>
                                            <th>Order ID</th>
                                            <th>Accepted / Completed Date</th>
                                            <th>Status</th>
                                            {/* UPDATED HEADERS */}
                                            <th className="text-end">Total Price</th>
                                            <th className="text-end">Admin Fee</th>
                                            <th className="text-end">Net Payout</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {eligibleOrders.length > 0 ? (
                                            eligibleOrders.map((order) => (
                                                <tr key={order.id} className={selectedOrderIds.includes(order.id) ? "table-active" : ""}>
                                                    <td className="text-center"><Form.Check type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={() => handleSelectOrder(order.id)}/></td>
                                                    <td className="fw-bold text-primary">{order.orderId}</td>
                                                    <td>{new Date(order.date).toLocaleDateString()}<span className="text-muted ms-2 small">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></td>
                                                    <td>{getStatusBadge(order.status)}</td>
                                                    
                                                    {/* UPDATED BREAKDOWN COLUMNS WITH SAFETY CHECKS */}
                                                    <td className="text-end">₹{parseFloat(order.originalAmount || order.amount || 0).toFixed(2)}</td>
                                                    <td className="text-end text-danger">
                                                        -₹{parseFloat(order.adminEarnings || 0).toFixed(2)}
                                                        {order.cutoffPercentage && <div className="small text-muted" style={{fontSize: '0.75rem'}}>({order.cutoffPercentage}%)</div>}
                                                    </td>
                                                    <td className="text-end fw-bold text-success">
                                                        ₹{parseFloat(order.payableAmount || order.amount || 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="7" className="text-center py-5 text-muted"><div className="mb-3"><i className="bi bi-check2-circle fs-1 text-success"></i></div><h5>No Eligible Orders</h5><p className="mb-0">All settled! Orders appear here 7 days after completion.</p></td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>

                {/* History Table */}
                <h4 className="mb-3">Request History</h4>
                <div className="card shadow-sm"><div className="card-body p-0"><div className="table-responsive"><Table hover className="mb-0 align-middle"><thead className="bg-light"><tr><th>Date</th><th>Orders Included</th><th className="text-end">Total Amount</th><th className="text-center">Status</th><th>Admin Note / Transaction ID</th></tr></thead><tbody>{payoutHistory.length > 0 ? (payoutHistory.map((req, idx) => (<tr key={idx}><td>{new Date(req.createdAt).toLocaleDateString()} <br/><small className="text-muted">{new Date(req.createdAt).toLocaleTimeString()}</small></td><td>{req.totalOrders} Orders</td><td className="text-end fw-bold">₹{parseFloat(req.totalAmount || 0).toFixed(2)}</td><td className="text-center">{getPayoutStatusBadge(req.status)}</td><td>{req.status === 'approved' ? (<div className="text-success small"><strong>Paid via:</strong> {req.transactionId || 'Bank Transfer'}</div>) : req.status === 'rejected' ? (<span className="text-danger small">{req.adminNote}</span>) : (<span className="text-muted small">-</span>)}</td></tr>))) : (<tr><td colSpan="5" className="text-center py-4 text-muted">No payout history found.</td></tr>)}</tbody></Table></div></div></div>
            </>
          )}
        </div>
      </div>

      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white"><Modal.Title>Request Submitted!</Modal.Title></Modal.Header>
        <Modal.Body className="text-center py-4"><div className="mb-3"><i className="bi bi-check-circle-fill text-success" style={{fontSize: '3rem'}}></i></div><h4>Payout Request Sent</h4><p className="text-muted">Your request has been sent to the admin for approval. <br/>Once approved, the status will change to "Paid".</p></Modal.Body>
        <Modal.Footer><Button variant="success" onClick={() => setShowSuccessModal(false)}>Close</Button></Modal.Footer>
      </Modal>
    </div>
  );
};

export default FoodRevenue;