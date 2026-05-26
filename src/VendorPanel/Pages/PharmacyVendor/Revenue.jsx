import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Alert, Spinner, Badge, Table, Button, Form, Modal } from 'react-bootstrap';

// Import Chart.js and react-chartjs-2 components
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

// Register Chart.js components
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

const OrderRevenue = ({ refreshKey }) => {
  // --- ANALYTICS STATE ---
  const [revenueData, setRevenueData] = useState({
    // Standard Stats
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    ordersCount: 0,
    // Detailed Stats
    totalNetEarning: 0,
    totalAdminShare: 0,
    currentCutoff: 0,
    // Graph Data
    revenueByDate: {},
    netEarningByDate: {},
    monthlyRevenueData: {},
    monthlyNetData: {},
    monthlyAdminData: {},
    // Order List Data
    recentOrders: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- PAYOUT STATE ---
  const [payoutTab, setPayoutTab] = useState('analytics'); // 'analytics' or 'payout'
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  
  // Payout Summary State
  const [payoutStats, setPayoutStats] = useState({ totalAmount: 0, count: 0 }); // Available
  const [payoutSummary, setPayoutSummary] = useState({
    pendingRequestAmount: 0,
    totalPaidAmount: 0,
    paidBreakdown: { today: 0, week: 0, month: 0, year: 0 }
  });
  const [payoutHistory, setPayoutHistory] = useState([]);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [vendorType, setVendorType] = useState('pharmacy'); // Detected from token

  // API Base URL
  const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; 

  // ==========================================
  // 1. TOKEN HELPER (As Requested)
  // ==========================================
  const getAllVendorToken = useCallback(() => {
    const tokenNames = ['Pharmacytoken', 'foodtoken', 'labtoken'];

    for (const name of tokenNames) {
      try {
        const tokenData = sessionStorage.getItem(name);

        if (tokenData && tokenData !== 'null') {
          const parsed = JSON.parse(tokenData);
          
          if (parsed && parsed.token) {
            // Logic to determine type based on the token key name
            let type = 'pharmacy';
            if (name === 'foodtoken') type = 'food';
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
  // 2. DATA FETCHING EFFECTS
  // ==========================================

  useEffect(() => {
    // Detect type on mount
    try {
        const { type } = getAllVendorToken();
        setVendorType(type);
    } catch (e) {
        console.error(e);
        setError("Authentication failed. Please login.");
    }

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

  // ==========================================
  // 3. HELPERS
  // ==========================================

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
    if (['8', '7', 'completed', 'delivered', '5'].includes(s)) return <Badge bg="success">Completed</Badge>;
    if (['1', 'confirmed'].includes(s)) return <Badge bg="info">Confirmed</Badge>;
    if (['2', 'processing'].includes(s)) return <Badge bg="primary">Processing</Badge>;
    if (['0', 'pending'].includes(s)) return <Badge bg="warning" text="dark">Pending</Badge>;
    if (['9', 'cancelled'].includes(s)) return <Badge bg="danger">Cancelled</Badge>;
    return <Badge bg="secondary">{status}</Badge>;
  };

  const getPayoutStatusBadge = (status) => {
      if(status === 'approved') return <Badge bg="success">Paid</Badge>;
      if(status === 'rejected') return <Badge bg="danger">Rejected</Badge>;
      return <Badge bg="warning" text="dark">Pending</Badge>;
  };

  // ==========================================
  // 4. API CALLS - ANALYTICS
  // ==========================================

  const fetchOrderRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { token, type } = getAllVendorToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Dynamically switch endpoints based on vendor type
      let endpointPrefix = 'pharmacy-vendor-revenue'; // default
      if (type === 'food') endpointPrefix = 'food-vendor-revenue';
      // Add lab logic if you have a specific lab analytics route

      const statsPromise = axios.get(`${URL}/${endpointPrefix}/stats`, { headers });
      const ordersPromise = axios.get(`${URL}/${endpointPrefix}/orders?limit=2000`, { headers });

      const [statsRes, ordersRes] = await Promise.all([statsPromise, ordersPromise]);

      if (statsRes.data.success) {
        const stats = statsRes.data.data;
        const orders = ordersRes.data.data || [];
        const cutoff = statsRes.data.cutoffPercentage || 0;
        const now = new Date();

        // --- PROCESS GRAPH DATA ---
        const monthlyRevenueAggregated = {};
        const monthlyNetAggregated = {};
        const monthlyAdminAggregated = {};

        // Init 12 Months
        for (let i = 0; i < 12; i++) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthLabel = monthDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
          monthlyRevenueAggregated[monthLabel] = 0;
          monthlyNetAggregated[monthLabel] = 0;
          monthlyAdminAggregated[monthLabel] = 0;
        }

        // Init 7 Days
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

        // Aggregate Orders
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

            // Daily Data
            if (orderTimestamp >= sevenDaysAgo.getTime()) {
                if (revenueByDate.hasOwnProperty(orderDateString)) {
                    revenueByDate[orderDateString] += gross;
                    netEarningByDate[orderDateString] += net;
                }
            }

            // Monthly Data
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

        setRevenueData({
          totalRevenue: stats.total.revenue,
          monthlyRevenue: stats.monthly.revenue,
          weeklyRevenue: stats.weekly.revenue,
          dailyRevenue: stats.today.revenue,
          ordersCount: stats.total.count,
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
        throw new Error(statsRes.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load revenue data. Please check your connection.");
      setLoading(false);
    }
  };

  // ==========================================
  // 5. API CALLS - PAYOUTS
  // ==========================================

  const fetchEligiblePayouts = async () => {
      try {
          setPayoutLoading(true);
          const { token, type } = getAllVendorToken();
          
          const res = await axios.get(`${URL}/vendor-payout/payout-eligible`, {
              params: { type: type }, // Backend extracts VendorID from Token Middleware
              headers: { Authorization: `Bearer ${token}` }
          });
          
          if(res.data.success) {
              setEligibleOrders(res.data.orders);
              // Use totalPayableAmount if available
              setPayoutStats({
                  totalAmount: res.data.totalPayableAmount || res.data.totalAmount,
                  count: res.data.count
              });
              setSelectedOrderIds([]); 
          }
          setPayoutLoading(false);
      } catch (err) {
          console.error("Error fetching eligible payouts", err);
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
            setPayoutSummary(res.data.data);
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
        if(res.data.success) {
            setPayoutHistory(res.data.data);
        }
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
              vendorType: type, 
              orderIds: selectedOrderIds
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          setShowSuccessModal(true);
          setPayoutLoading(false);
          // Refresh Data
          fetchEligiblePayouts();
          fetchPayoutSummary();
          fetchPayoutHistory();
      } catch (err) {
          console.error("Error requesting payout", err);
          alert(err.response?.data?.message || "Failed to submit request");
          setPayoutLoading(false);
      }
  };

  // ==========================================
  // 6. UI HANDLERS
  // ==========================================

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
  // 7. CHART CONFIGURATION
  // ==========================================

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monthly Income Breakdown', font: { size: 16 } },
      tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ₹${c.parsed.y.toFixed(2)}` } }
    },
    scales: { x: { grid: { display: false } }, y: { stacked: true, beginAtZero: true } }
  };

  // Sort Months
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
      { label: 'Net Earning', data: sortedMonthLabels.map(m => revenueData.monthlyNetData[m] || 0), backgroundColor: '#198754' },
      { label: 'Admin Commission', data: sortedMonthLabels.map(m => revenueData.monthlyAdminData[m] || 0), backgroundColor: '#dc3545' },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Trend', font: { size: 16 } }
    },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }
  };

  const lineChartSortedDates = Object.keys(revenueData.revenueByDate).sort();
  const chartDataLine = {
    labels: lineChartSortedDates,
    datasets: [
      { label: 'Gross', data: lineChartSortedDates.map(d => revenueData.revenueByDate[d] || 0), borderColor: '#0d6efd', backgroundColor: 'rgba(13, 110, 253, 0.1)', fill: true },
      { label: 'Net', data: lineChartSortedDates.map(d => revenueData.netEarningByDate[d] || 0), borderColor: '#198754', backgroundColor: 'rgba(25, 135, 84, 0.1)', fill: true },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Distribution', font: { size: 16 } },
      tooltip: { callbacks: { label: (c) => `${c.label}: ₹${c.parsed.toFixed(2)}` } }
    },
  };

  const chartDataPie = {
    labels: ['Net Earning', 'Admin Commission'],
    datasets: [{
        data: [revenueData.totalNetEarning, revenueData.totalAdminShare],
        backgroundColor: ['#198754', '#dc3545'],
        borderColor: ['#fff', '#fff'], borderWidth: 2,
    }],
  };

  // ==========================================
  // 8. RENDER
  // ==========================================

  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" size="lg"><span className="visually-hidden">Loading...</span></Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="m-3"><strong>Error:</strong> {error}</Alert>;
  }

  return (
    <div className="container-fluid my-4">
      <div className="row">
        <div className="col-12">
          {/* HEADER & TABS */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Order Revenue & Payouts</h2>
            <div className="bg-white p-1 rounded border shadow-sm">
                <Button 
                    variant={payoutTab === 'analytics' ? 'primary' : 'light'} 
                    onClick={() => setPayoutTab('analytics')}
                    className="me-1 fw-bold"
                >
                    <i className="bi bi-graph-up me-2"></i> Analytics
                </Button>
                <Button 
                    variant={payoutTab === 'payout' ? 'primary' : 'light'} 
                    onClick={() => setPayoutTab('payout')}
                    className="fw-bold"
                >
                    <i className="bi bi-wallet2 me-2"></i> Payouts
                </Button>
            </div>
          </div>

          {/* === VIEW 1: ANALYTICS === */}
          {payoutTab === 'analytics' ? (
            <>
              {/* Top Row: Total Stats */}
              <div className="row">
                <div className="col-md-3 mb-4">
                  <div className="card bg-primary text-white h-100 shadow-sm">
                    <div className="card-body d-flex flex-column justify-content-between">
                      <h5 className="card-title">Total Revenue</h5>
                      <h2 className="card-text display-8 fw-bold">₹{revenueData.totalRevenue.toFixed(2)}</h2>
                      <p className="card-text">From {revenueData.ordersCount} orders</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-4">
                  <div className="card bg-success text-white h-100 shadow-sm">
                    <div className="card-body d-flex flex-column justify-content-between">
                      <h5 className="card-title">Monthly Revenue</h5>
                      <h2 className="card-text display-8 fw-bold">₹{revenueData.monthlyRevenue.toFixed(2)}</h2>
                      <p className="card-text">Last 30 days</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-4">
                  <div className="card bg-info text-white h-100 shadow-sm">
                    <div className="card-body d-flex flex-column justify-content-between">
                      <h5 className="card-title">Weekly Revenue</h5>
                      <h2 className="card-text display-8 fw-bold">₹{revenueData.weeklyRevenue.toFixed(2)}</h2>
                      <p className="card-text">Last 7 days</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-4">
                  <div className="card bg-warning text-dark h-100 shadow-sm">
                    <div className="card-body d-flex flex-column justify-content-between">
                      <h5 className="card-title">Daily Revenue</h5>
                      <h2 className="card-text display-8 fw-bold">₹{revenueData.dailyRevenue.toFixed(2)}</h2>
                      <p className="card-text">Last 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Row: Detailed Breakdown */}
              <div className="row">
                <div className="col-md-3 mb-4">
                  <div className="card border-primary h-100 shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title text-primary">Gross Revenue</h6>
                      <h3 className="fw-bold">₹{revenueData.totalRevenue.toFixed(2)}</h3>
                      <small className="text-muted">Total Sales Volume</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-4">
                  <div className="card border-success h-100 shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title text-success">Net Earnings</h6>
                      <h3 className="fw-bold">₹{revenueData.totalNetEarning.toFixed(2)}</h3>
                      <small className="text-muted">Your Profit</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-4">
                  <div className="card border-danger h-100 shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title text-danger">Admin Commission</h6>
                      <h3 className="fw-bold">₹{revenueData.totalAdminShare.toFixed(2)}</h3>
                      <small className="text-muted">Deducted Amount</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-4">
                  <div className="card border-secondary h-100 shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title text-secondary">Current Plan</h6>
                      <h3 className="fw-bold">{revenueData.currentCutoff}%</h3>
                      <small className="text-muted">Commission Rate</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphs */}
              <div className="row">
                <div className="col-lg-6 mb-4">
                  <div className="card shadow-sm h-100">
                    <div className="card-body" style={{ height: '400px' }}>
                      {sortedMonthLabels.length > 0 ? <Bar options={barChartOptions} data={chartDataMonthly} /> : <p className="text-center py-5">No monthly data.</p>}
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 mb-4">
                  <div className="card shadow-sm h-100">
                    <div className="card-body" style={{ height: '400px' }}>
                      {revenueData.totalRevenue > 0 ? <Pie options={pieChartOptions} data={chartDataPie} /> : <p className="text-center py-5">No revenue data.</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12 mb-4">
                  <div className="card shadow-sm h-100">
                    <div className="card-body" style={{ height: '400px' }}>
                      {lineChartSortedDates.length > 0 ? <Line options={lineChartOptions} data={chartDataLine} /> : <p className="text-center py-5">No daily trend data.</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white"><h5 className="mb-0">Recent Order History</h5></div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Order ID</th><th>Date</th><th>Customer</th><th>Status</th>
                                            <th className="text-end">Total</th><th className="text-end text-danger">Admin</th><th className="text-end text-success">Your Earning</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenueData.recentOrders.length > 0 ? (
                                            revenueData.recentOrders.slice(0, 10).map((order, index) => (
                                                <tr key={index}>
                                                    <td className="fw-bold text-primary">{order.orderId || order._id.slice(-8).toUpperCase()}</td>
                                                    <td><div>{order.displayDate}</div><small className="text-muted">{order.displayTime}</small></td>
                                                    <td>{order.customerName || order.patientDetails?.name || 'N/A'}</td>
                                                    <td>{getStatusBadge(order.status || order.orderStatus)}</td>
                                                    <td className="text-end fw-bold">₹{order.gross.toFixed(2)}</td>
                                                    <td className="text-end text-danger">-₹{order.admin.toFixed(2)}</td>
                                                    <td className="text-end text-success fw-bold">₹{order.net.toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="7" className="text-center py-4 text-muted">No orders found.</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </>
          ) : (
            // === VIEW 2: PAYOUTS ===
            <>
                <div className="alert alert-info border-info d-flex align-items-center mb-4">
                    <i className="bi bi-info-circle-fill me-2 fs-4"></i>
                    <div><strong>Payout Policy:</strong> Orders become eligible for withdrawal <strong>7 days after completion</strong>.</div>
                </div>

                {/* Summary Cards */}
                <div className="row mb-4">
                    <div className="col-md-4 mb-3">
                        <div className="card bg-white border-start border-4 border-success shadow-sm h-100">
                            <div className="card-body">
                                <h6 className="text-muted text-uppercase mb-2">Available for Withdrawal</h6>
                                <h2 className="text-success fw-bold">₹{payoutStats.totalAmount.toFixed(2)}</h2>
                                <span className="badge bg-light text-dark border">{payoutStats.count} orders eligible</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3"><div className="card bg-white border-start border-4 border-warning shadow-sm h-100"><div className="card-body"><h6 className="text-muted text-uppercase mb-2">Pending Requests</h6><h2 className="text-warning fw-bold">₹{payoutSummary.pendingRequestAmount.toFixed(2)}</h2><span className="text-muted small">Awaiting admin approval</span></div></div></div>
                    <div className="col-md-4 mb-3"><div className="card bg-white border-start border-4 border-primary shadow-sm h-100"><div className="card-body"><h6 className="text-muted text-uppercase mb-2">Total Paid Out</h6><h2 className="text-primary fw-bold">₹{payoutSummary.totalPaidAmount.toFixed(2)}</h2><span className="text-muted small">Lifetime earnings withdrawn</span></div></div></div>
                </div>

                <div className="row mb-5 g-2">
                     <div className="col-6 col-md-3"><div className="card bg-light border-0 shadow-sm"><div className="card-body text-center p-3"><small className="text-muted d-block text-uppercase" style={{fontSize:'0.75rem'}}>Paid Today</small><strong className="fs-5 text-dark">₹{payoutSummary.paidBreakdown.today.toFixed(2)}</strong></div></div></div>
                     <div className="col-6 col-md-3"><div className="card bg-light border-0 shadow-sm"><div className="card-body text-center p-3"><small className="text-muted d-block text-uppercase" style={{fontSize:'0.75rem'}}>Paid This Week</small><strong className="fs-5 text-dark">₹{payoutSummary.paidBreakdown.week.toFixed(2)}</strong></div></div></div>
                     <div className="col-6 col-md-3"><div className="card bg-light border-0 shadow-sm"><div className="card-body text-center p-3"><small className="text-muted d-block text-uppercase" style={{fontSize:'0.75rem'}}>Paid This Month</small><strong className="fs-5 text-dark">₹{payoutSummary.paidBreakdown.month.toFixed(2)}</strong></div></div></div>
                     <div className="col-6 col-md-3"><div className="card bg-light border-0 shadow-sm"><div className="card-body text-center p-3"><small className="text-muted d-block text-uppercase" style={{fontSize:'0.75rem'}}>Paid This Year</small><strong className="fs-5 text-dark">₹{payoutSummary.paidBreakdown.year.toFixed(2)}</strong></div></div></div>
                </div>

                <hr className="my-5" />

                {/* Selection Action */}
                <div className="row mb-4 align-items-end">
                    <div className="col-md-8"><h4 className="mb-1">Select Orders</h4><p className="text-muted mb-0">Choose orders to include in your payout request.</p></div>
                    <div className="col-md-4 text-end">
                        <div className="card bg-light border-success">
                            <div className="card-body p-3 d-flex justify-content-between align-items-center">
                                <div><small className="d-block text-muted">Selected Total</small><strong className="fs-4 text-success">₹{getSelectedTotal().toFixed(2)}</strong></div>
                                <Button variant="success" disabled={selectedOrderIds.length === 0 || payoutLoading} onClick={submitPayoutRequest} className="fw-bold px-4">{payoutLoading ? <Spinner size="sm" animation="border" /> : 'Request Payout'}</Button>
                            </div>
                        </div>
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
                                                    
                                                    {/* UPDATED BREAKDOWN */}
                                                    <td className="text-end">₹{parseFloat(order.originalAmount || order.amount).toFixed(2)}</td>
                                                    <td className="text-end text-danger">
                                                        -₹{parseFloat(order.adminEarnings || 0).toFixed(2)}
                                                        {order.cutoffPercentage && <div className="small text-muted" style={{fontSize: '0.75rem'}}>({order.cutoffPercentage}%)</div>}
                                                    </td>
                                                    <td className="text-end fw-bold text-success">
                                                        ₹{parseFloat(order.payableAmount || order.amount).toFixed(2)}
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
                <div className="card shadow-sm"><div className="card-body p-0"><div className="table-responsive"><Table hover className="mb-0 align-middle"><thead className="bg-light"><tr><th>Date</th><th>Orders Included</th><th className="text-end">Total Amount</th><th className="text-center">Status</th><th>Admin Note / Transaction ID</th></tr></thead><tbody>{payoutHistory.length > 0 ? (payoutHistory.map((req, idx) => (<tr key={idx}><td>{new Date(req.createdAt).toLocaleDateString()} <br/><small className="text-muted">{new Date(req.createdAt).toLocaleTimeString()}</small></td><td>{req.totalOrders} Orders</td><td className="text-end fw-bold">₹{parseFloat(req.totalAmount).toFixed(2)}</td><td className="text-center">{getPayoutStatusBadge(req.status)}</td><td>{req.status === 'approved' ? (<div className="text-success small"><strong>Paid via:</strong> {req.transactionId || 'Bank Transfer'}</div>) : req.status === 'rejected' ? (<span className="text-danger small">{req.adminNote}</span>) : (<span className="text-muted small">-</span>)}</td></tr>))) : (<tr><td colSpan="5" className="text-center py-4 text-muted">No payout history found.</td></tr>)}</tbody></Table></div></div></div>
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

export default OrderRevenue;