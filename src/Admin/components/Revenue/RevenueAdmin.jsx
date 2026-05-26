import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminRevenueDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({});
  const [cutoffSettings, setCutoffSettings] = useState({});
  const [freeConsultationStats, setFreeConsultationStats] = useState({});
  const [showRevenueSummary, setShowRevenueSummary] = useState(false);
  const [revenueSummary, setRevenueSummary] = useState(null);

  const getToken = () => {
    const data = sessionStorage.getItem("admin");
    if (!data) return null;
    try {
      return JSON.parse(data).token;
    } catch {
      return null;
    }
  };

  // Fetch all orders with pagination - UPDATED WITH FREE CONSULTATION LOGIC
  const fetchAllOrders = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin-revenue/all-orders?page=${page}&limit=${limit}`,
        { headers: { token } }
      );
      
      if (response.data.success) {
        setOrders(response.data.data);
        setSummary(response.data.summary || {});
        setPagination(response.data.pagination || {});
        setCutoffSettings(response.data.cutoffSettings || {});
        
        // ✅ UPDATE FREE CONSULTATION STATS
        if (response.data.freeConsultationStats) {
          setFreeConsultationStats(response.data.freeConsultationStats);
        }
        
        // Update stats from the response
        setStats({
          totalRevenue: response.data.totalRevenue,
          adminEarnings: response.data.totalAdminEarnings,
          totalOrders: response.data.totalOrders,
          freeConsultationStats: response.data.freeConsultationStats
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders by type - UPDATED WITH FREE CONSULTATION LOGIC
  const fetchOrdersByType = async (type, page = 1, limit = 10) => {
    try {
      setLoading(true);
      const token = getToken();
      
      // ✅ MEMBERSHIP KE LIYE ALAG ENDPOINT
      const endpoint = type === 'membership' 
        ? `${process.env.REACT_APP_API_URL}/admin-revenue/membership-orders?page=${page}&limit=${limit}`
        : `${process.env.REACT_APP_API_URL}/admin-revenue/${type}-orders?page=${page}&limit=${limit}`;
      
      const response = await axios.get(endpoint, { headers: { token } });
      
      if (response.data.success) {
        setOrders(response.data.data);
        setPagination(response.data.pagination || {});
        
        // ✅ UPDATE FREE CONSULTATION STATS FOR DOCTOR AND CLINIC
        if (type === 'doctor' || type === 'clinic') {
          const freeStats = response.data.freeConsultationStats || 
                          response.data.clinicFreeConsultations ||
                          response.data.doctorFreeConsultations;
          
          if (freeStats) {
            setFreeConsultationStats({
              [type]: freeStats
            });
          }
        }
        
        // Update stats for individual tabs
        setStats({
          totalRevenue: response.data.totalRevenue,
          adminEarnings: response.data.totalAdminEarnings,
          totalOrders: response.data.totalOrders
        });
      }
    } catch (error) {
      console.error(`Error fetching ${type} orders:`, error);
      alert(`Error fetching ${type} orders`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch Revenue Summary
  const fetchRevenueSummary = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin-revenue/revenue-summary`,
        { headers: { token } }
      );
      
      if (response.data.success) {
        setRevenueSummary(response.data.data);
        setShowRevenueSummary(true);
      }
    } catch (error) {
      console.error('Error fetching revenue summary:', error);
      alert('Error fetching revenue summary');
    } finally {
      setLoading(false);
    }
  };

  // Update individual order cutoff - UPDATED WITH FREE CONSULTATION LOGIC
  const updateOrderCutoff = async (orderId, orderType, cutoffPercentage) => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/orders/${orderId}/cutoff`,
        { cutoffPercentage, orderType },
        { headers: { token } }
      );
      
      if (response.data.success) {
        alert('Order cutoff updated successfully!');
        // Refresh current tab
        if (activeTab === 'all') {
          fetchAllOrders(pagination.currentPage || 1, pagination.limit || 10);
        } else {
          fetchOrdersByType(activeTab, pagination.currentPage || 1, pagination.limit || 10);
        }
      }
    } catch (error) {
      console.error('Error updating order cutoff:', error);
      alert('Error updating order cutoff');
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (activeTab === 'all') {
      fetchAllOrders(newPage, pagination.limit || 10);
    } else {
      fetchOrdersByType(activeTab, newPage, pagination.limit || 10);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchAllOrders(pagination.currentPage || 1, pagination.limit || 10);
    } else {
      fetchOrdersByType(activeTab, pagination.currentPage || 1, pagination.limit || 10);
    }
  }, [activeTab]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00';
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  // ✅ NEW: Function to calculate free consultation percentage
  const calculateFreePercentage = (freeCount, totalCount) => {
    if (!totalCount || totalCount === 0) return '0%';
    const percentage = ((freeCount / totalCount) * 100).toFixed(2);
    return `${percentage}%`;
  };

  return (
    <div className="container-fluid py-4">
      <style>
        {`
          .free-consultation-badge {
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
            border-radius: 20px;
            padding: 2px 8px;
            font-size: 0.7rem;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-left: 5px;
          }
          
          .membership-cutoff-badge {
            background: linear-gradient(45deg, #6f42c1, #e83e8c);
            color: white;
            border-radius: 4px;
            padding: 1px 6px;
            font-size: 0.65rem;
            font-weight: bold;
          }
          
          .doctor-cutoff-badge {
            background: linear-gradient(45deg, #007bff, #00bcd4);
            color: white;
            border-radius: 4px;
            padding: 1px 6px;
            font-size: 0.65rem;
            font-weight: bold;
          }
          
          .clinic-cutoff-badge {
            background: linear-gradient(45deg, #dc3545, #fd7e14);
            color: white;
            border-radius: 4px;
            padding: 1px 6px;
            font-size: 0.65rem;
            font-weight: bold;
          }
          
          .financial-breakdown {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 12px;
            margin-top: 8px;
            font-size: 0.85rem;
          }
          
          .financial-breakdown h6 {
            font-size: 0.8rem;
            font-weight: bold;
            color: #495057;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          
          .financial-item {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
            border-bottom: 1px dashed #dee2e6;
            font-size: 0.8rem;
          }
          
          .financial-item:last-child {
            border-bottom: none;
            font-weight: bold;
            color: #28a745;
          }
          
          .revenue-card {
            transition: all 0.3s ease;
          }
          
          .revenue-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          
          .free-consultation-card {
            background: linear-gradient(135deg, #f0fff4, #d1f2eb);
            border: 1px solid #c3e6cb;
          }
          
          .paid-consultation-card {
            background: linear-gradient(135deg, #fff0f0, #f8d7da);
            border: 1px solid #f5c6cb;
          }
        `}
      </style>

      {/* Stats Cards - UPDATED WITH FREE CONSULTATION INFO */}
      <div className="row mb-4">
        {/* Total Revenue */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div
            className="card h-100 py-2 shadow revenue-card"
            style={{
              background: 'linear-gradient(135deg, #4e73df, #224abe)',
              color: '#fff'
            }}
          >
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">
                    Total Revenue
                  </div>
                  <div className="h5 mb-0 font-weight-bold">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  {freeConsultationStats && freeConsultationStats.totalFreeConsultations > 0 && (
                    <small className="text-white-50">
                      {freeConsultationStats.totalFreeConsultations} free consultations
                    </small>
                  )}
                </div>
                <div className="col-auto">
                  <i className="fas fa-rupee-sign fa-2x text-white-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Earnings */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div
            className="card h-100 py-2 shadow revenue-card"
            style={{
              background: 'linear-gradient(135deg, #1cc88a, #17a673)',
              color: '#fff'
            }}
          >
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">
                    Admin Earnings
                  </div>
                  <div className="h5 mb-0 font-weight-bold">
                    {formatCurrency(stats.adminEarnings)}
                  </div>
                  {freeConsultationStats && freeConsultationStats.totalFreeConsultationRevenue > 0 && (
                    <small className="text-white-50">
                      {formatCurrency(freeConsultationStats.totalFreeConsultationRevenue)} from free consults
                    </small>
                  )}
                </div>
                <div className="col-auto">
                  <i className="fas fa-chart-line fa-2x text-white-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div
            className="card h-100 py-2 shadow revenue-card"
            style={{
              background: 'linear-gradient(135deg, #6f42c1, #9f7aea)',
              color: '#fff'
            }}
          >
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">
                    Total Orders
                  </div>
                  <div className="h5 mb-0 font-weight-bold">
                    {stats.totalOrders || 0}
                  </div>
                  {freeConsultationStats && freeConsultationStats.totalFreeConsultations > 0 && (
                    <small className="text-white-50">
                      Free: {freeConsultationStats.totalFreeConsultations} | 
                      Paid: {stats.totalOrders - freeConsultationStats.totalFreeConsultations}
                    </small>
                  )}
                </div>
                <div className="col-auto">
                  <i className="fas fa-shopping-cart fa-2x text-white-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cutoff Settings */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div
            className="card h-100 py-2 shadow revenue-card"
            style={{
              background: 'linear-gradient(135deg, #f6c23e, #e83e8c)',
              color: '#fff'
            }}
          >
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">
                    Current Cutoff Settings
                  </div>
                  <div className="h6 mb-0 font-weight-bold">
                    Food: {cutoffSettings.foodCutoff || 10}% | Pharm: {cutoffSettings.pharmacyCutoff || 5}%
                    <br />
                    Lab: {cutoffSettings.labCutoff || 5}% | Doctor: {cutoffSettings.doctorCutoff || 5}%
                    <br />
                    Clinic: {cutoffSettings.clinicCutoff || 5}% | <span className="text-warning">Membership: {cutoffSettings.membershipCutoff || 20}%</span>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-cog fa-2x text-white-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Consultation Summary Section */}
      {(freeConsultationStats && (freeConsultationStats.doctor || freeConsultationStats.clinic || freeConsultationStats.totalFreeConsultations > 0)) && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-crown me-2"></i>
                  Free Consultation Summary
                  <button 
                    className="btn btn-light btn-sm float-end"
                    onClick={fetchRevenueSummary}
                    disabled={loading}
                  >
                    <i className="fas fa-chart-bar me-1"></i>
                    View Detailed Report
                  </button>
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Doctor Free Consultations */}
                  {freeConsultationStats.doctor && freeConsultationStats.doctor.count > 0 && (
                    <div className="col-md-6 mb-3">
                      <div className="card free-consultation-card">
                        <div className="card-body">
                          <h6 className="card-title text-success">
                            <i className="fas fa-user-md me-2"></i>
                            Doctor Free Consultations
                          </h6>
                          <div className="row">
                            <div className="col-6">
                              <p className="mb-1">
                                <strong>Count:</strong> {freeConsultationStats.doctor.count}
                              </p>
                              <p className="mb-1">
                                <strong>Percentage:</strong> {calculateFreePercentage(freeConsultationStats.doctor.count, freeConsultationStats.doctor.paidCount + freeConsultationStats.doctor.count)}
                              </p>
                            </div>
                            <div className="col-6">
                              <p className="mb-1">
                                <strong>Revenue:</strong> {formatCurrency(freeConsultationStats.doctor.revenue)}
                              </p>
                              <p className="mb-1">
                                <strong>Earnings:</strong> {formatCurrency(freeConsultationStats.doctor.earnings || (freeConsultationStats.doctor.revenue * (cutoffSettings.membershipCutoff || 20) / 100))}
                              </p>
                            </div>
                          </div>
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Using Membership Cutoff ({cutoffSettings.membershipCutoff || 20}%)
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Clinic Free Consultations */}
                  {freeConsultationStats.clinic && freeConsultationStats.clinic.count > 0 && (
                    <div className="col-md-6 mb-3">
                      <div className="card free-consultation-card">
                        <div className="card-body">
                          <h6 className="card-title text-success">
                            <i className="fas fa-hospital me-2"></i>
                            Clinic Free Consultations
                          </h6>
                          <div className="row">
                            <div className="col-6">
                              <p className="mb-1">
                                <strong>Count:</strong> {freeConsultationStats.clinic.count}
                              </p>
                              <p className="mb-1">
                                <strong>Percentage:</strong> {calculateFreePercentage(freeConsultationStats.clinic.count, freeConsultationStats.clinic.paidCount + freeConsultationStats.clinic.count)}
                              </p>
                            </div>
                            <div className="col-6">
                              <p className="mb-1">
                                <strong>Revenue:</strong> {formatCurrency(freeConsultationStats.clinic.revenue)}
                              </p>
                              <p className="mb-1">
                                <strong>Earnings:</strong> {formatCurrency(freeConsultationStats.clinic.earnings || (freeConsultationStats.clinic.revenue * (cutoffSettings.membershipCutoff || 20) / 100))}
                              </p>
                            </div>
                          </div>
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Using Membership Cutoff ({cutoffSettings.membershipCutoff || 20}%)
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total Summary */}
                  {freeConsultationStats.totalFreeConsultations > 0 && (
                    <div className="col-12">
                      <div className="card bg-light">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-3 text-center">
                              <h4 className="text-primary">{freeConsultationStats.totalFreeConsultations}</h4>
                              <p className="mb-0">Total Free Consultations</p>
                            </div>
                            <div className="col-md-3 text-center">
                              <h4 className="text-success">{formatCurrency(freeConsultationStats.totalFreeConsultationRevenue)}</h4>
                              <p className="mb-0">Original Value</p>
                            </div>
                            <div className="col-md-3 text-center">
                              <h4 className="text-danger">{formatCurrency(freeConsultationStats.totalFreeConsultationRevenue * (cutoffSettings.membershipCutoff || 20) / 100)}</h4>
                              <p className="mb-0">Admin Earnings ({cutoffSettings.membershipCutoff || 20}%)</p>
                            </div>
                            <div className="col-md-3 text-center">
                              <h4 className="text-warning">{formatCurrency(freeConsultationStats.totalFreeConsultationRevenue * (100 - (cutoffSettings.membershipCutoff || 20)) / 100)}</h4>
                              <p className="mb-0">Provider Payout</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Summary Modal */}
      {showRevenueSummary && revenueSummary && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-chart-bar me-2"></i>
                  Detailed Revenue Summary
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowRevenueSummary(false)}
                ></button>
              </div>
              <div className="modal-body">
                <RevenueSummaryModal data={revenueSummary} cutoffSettings={cutoffSettings} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Type Tabs - UPDATED WITH FREE CONSULTATION INDICATOR */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <div className="d-flex justify-content-between align-items-center">
            <ul className="nav nav-pills card-header-pills">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Orders ({summary.total || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'food' ? 'active' : ''}`}
                  onClick={() => setActiveTab('food')}
                >
                  Food ({summary.food || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'pharmacy' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pharmacy')}
                >
                  Pharmacy ({summary.pharmacy || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'lab' ? 'active' : ''}`}
                  onClick={() => setActiveTab('lab')}
                >
                  Lab ({summary.lab || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'doctor' ? 'active' : ''}`}
                  onClick={() => setActiveTab('doctor')}
                >
                  <i className="fas fa-user-md me-1"></i>
                  Doctor ({summary.doctor || 0})
                  {freeConsultationStats.doctor && freeConsultationStats.doctor.count > 0 && (
                    <span className="badge bg-success ms-1">
                      {freeConsultationStats.doctor.count} Free
                    </span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'clinic' ? 'active' : ''}`}
                  onClick={() => setActiveTab('clinic')}
                >
                  <i className="fas fa-hospital me-1"></i>
                  Clinic ({summary.clinic || 0})
                  {freeConsultationStats.clinic && freeConsultationStats.clinic.count > 0 && (
                    <span className="badge bg-success ms-1">
                      {freeConsultationStats.clinic.count} Free
                    </span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'membership' ? 'active' : ''}`}
                  onClick={() => setActiveTab('membership')}
                >
                  <i className="fas fa-crown me-1"></i>
                  Membership ({summary.membership || 0})
                </button>
              </li>
            </ul>
            
            {/* Free Consultation Info Badge */}
            {(freeConsultationStats.doctor || freeConsultationStats.clinic) && (
              <div className="alert alert-success py-1 px-3 mb-0" style={{fontSize: '0.8rem'}}>
                <i className="fas fa-info-circle me-1"></i>
                Free Consults: 
                {(freeConsultationStats.doctor?.count || 0) + (freeConsultationStats.clinic?.count || 0)}
              </div>
            )}
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th>Order ID</th>
                      <th>Type</th>
                      <th>Customer</th>
                      <th>Doctor/Clinic/Plan</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Cutoff %</th>
                      <th>Admin Earnings</th>
                      <th>Payout</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <OrderRow 
                        key={`${order.orderType}-${order._id}`} 
                        order={order} 
                        onUpdateCutoff={updateOrderCutoff}
                      />
                    ))}
                  </tbody>
                </table>
                
                {orders.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">No orders found</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <span className="text-muted">
                      Showing {orders.length} of {pagination.totalOrders || stats.totalOrders} orders
                      {pagination.currentPage && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
                    </span>
                  </div>
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPrevPage}
                        >
                          Previous
                        </button>
                      </li>
                      
                      {[...Array(pagination.totalPages)].map((_, index) => (
                        <li 
                          key={index + 1} 
                          className={`page-item ${pagination.currentPage === index + 1 ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      
                      <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Revenue Summary Modal Component
const RevenueSummaryModal = ({ data, cutoffSettings }) => {
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  return (
    <div>
      {/* Overall Summary */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h4 className="mb-2">{formatCurrency(data.totalRevenue)}</h4>
              <p className="mb-0">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h4 className="mb-2">{formatCurrency(data.totalEarnings)}</h4>
              <p className="mb-0">Total Admin Earnings</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h4 className="mb-2">{data.totalOrders || 0}</h4>
              <p className="mb-0">Total Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Free Consultation Breakdown */}
      {(data.doctorFreeConsultations || data.clinicFreeConsultations) && (
        <div className="card mb-4">
          <div className="card-header bg-warning">
            <h5 className="mb-0">
              <i className="fas fa-crown me-2"></i>
              Free Consultation Analysis
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              {data.doctorFreeConsultations && (
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header bg-success text-white">
                      <h6 className="mb-0">Doctor Free Consultations</h6>
                    </div>
                    <div className="card-body">
                      <p><strong>Count:</strong> {data.doctorFreeConsultations.count}</p>
                      <p><strong>Original Value:</strong> {formatCurrency(data.doctorFreeConsultations.originalConsultationFees)}</p>
                      <p><strong>Admin Earnings:</strong> {formatCurrency(data.doctorFreeConsultations.earnings)} ({data.doctorFreeConsultations.cutoffPercentage}%)</p>
                      <p><strong>Paid Consultations:</strong> {data.doctorFreeConsultations.paidCount}</p>
                      <p><strong>Paid Earnings:</strong> {formatCurrency(data.doctorFreeConsultations.doctorPaidEarnings)} ({data.doctorFreeConsultations.paidCutoffPercentage}%)</p>
                    </div>
                  </div>
                </div>
              )}
              
              {data.clinicFreeConsultations && (
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header bg-danger text-white">
                      <h6 className="mb-0">Clinic Free Consultations</h6>
                    </div>
                    <div className="card-body">
                      <p><strong>Count:</strong> {data.clinicFreeConsultations.count}</p>
                      <p><strong>Original Value:</strong> {formatCurrency(data.clinicFreeConsultations.originalConsultationFees)}</p>
                      <p><strong>Admin Earnings:</strong> {formatCurrency(data.clinicFreeConsultations.earnings)} ({data.clinicFreeConsultations.cutoffPercentage}%)</p>
                      <p><strong>Paid Consultations:</strong> {data.clinicFreeConsultations.paidCount}</p>
                      <p><strong>Paid Earnings:</strong> {formatCurrency(data.clinicFreeConsultations.clinicPaidEarnings)} ({data.clinicFreeConsultations.paidCutoffPercentage}%)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="row">
        {data.breakdownPercentages && (
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Revenue Breakdown (%)</h5>
              </div>
              <div className="card-body">
                <div className="progress mb-3" style={{height: '25px'}}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{width: `${data.breakdownPercentages.food || 0}%`}}
                  >
                    Food: {data.breakdownPercentages.food || 0}%
                  </div>
                  <div 
                    className="progress-bar bg-success" 
                    style={{width: `${data.breakdownPercentages.pharmacy || 0}%`}}
                  >
                    Pharmacy: {data.breakdownPercentages.pharmacy || 0}%
                  </div>
                  <div 
                    className="progress-bar bg-info" 
                    style={{width: `${data.breakdownPercentages.lab || 0}%`}}
                  >
                    Lab: {data.breakdownPercentages.lab || 0}%
                  </div>
                  <div 
                    className="progress-bar bg-warning" 
                    style={{width: `${data.breakdownPercentages.doctor || 0}%`}}
                  >
                    Doctor: {data.breakdownPercentages.doctor || 0}%
                  </div>
                  <div 
                    className="progress-bar bg-danger" 
                    style={{width: `${data.breakdownPercentages.clinic || 0}%`}}
                  >
                    Clinic: {data.breakdownPercentages.clinic || 0}%
                  </div>
                  <div 
                    className="progress-bar bg-purple" 
                    style={{width: `${data.breakdownPercentages.membership || 0}%`}}
                  >
                    Membership: {data.breakdownPercentages.membership || 0}%
                  </div>
                </div>
                
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><span className="badge bg-primary">Food</span></td>
                      <td>{formatCurrency(data.foodRevenue)}</td>
                      <td>{data.foodOrders} orders</td>
                      <td>{data.foodCutoffPercentage}% cutoff</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-success">Pharmacy</span></td>
                      <td>{formatCurrency(data.pharmacyRevenue)}</td>
                      <td>{data.pharmacyOrders} orders</td>
                      <td>{data.pharmacyCutoffPercentage}% cutoff</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-info">Lab</span></td>
                      <td>{formatCurrency(data.labRevenue)}</td>
                      <td>{data.labOrders} orders</td>
                      <td>{data.labCutoffPercentage}% cutoff</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-warning">Doctor</span></td>
                      <td>{formatCurrency(data.doctorRevenue)}</td>
                      <td>{data.doctorOrders} orders</td>
                      <td>{data.doctorCutoffPercentage}% cutoff</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-danger">Clinic</span></td>
                      <td>{formatCurrency(data.clinicRevenue)}</td>
                      <td>{data.clinicOrders} orders</td>
                      <td>{data.clinicCutoffPercentage}% cutoff</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-purple">Membership</span></td>
                      <td>{formatCurrency(data.membershipRevenue)}</td>
                      <td>{data.membershipOrders} orders</td>
                      <td>{data.membershipCutoffPercentage}% cutoff</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Cutoff Settings */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Current Cutoff Settings</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Service Type</th>
                    <th>Cutoff %</th>
                    <th>Applied For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Food</td>
                    <td>{cutoffSettings.foodCutoff || 10}%</td>
                    <td>All food orders</td>
                  </tr>
                  <tr>
                    <td>Pharmacy</td>
                    <td>{cutoffSettings.pharmacyCutoff || 5}%</td>
                    <td>All pharmacy orders</td>
                  </tr>
                  <tr>
                    <td>Lab</td>
                    <td>{cutoffSettings.labCutoff || 5}%</td>
                    <td>All lab tests</td>
                  </tr>
                  <tr>
                    <td>Doctor (Paid)</td>
                    <td>{cutoffSettings.doctorCutoff || 5}%</td>
                    <td>Paid consultations only</td>
                  </tr>
                  <tr>
                    <td>Doctor (Free)</td>
                    <td>{cutoffSettings.membershipCutoff || 20}%</td>
                    <td>Free consultations only</td>
                  </tr>
                  <tr>
                    <td>Clinic (Paid)</td>
                    <td>{cutoffSettings.clinicCutoff || 5}%</td>
                    <td>Paid clinic visits</td>
                  </tr>
                  <tr>
                    <td>Clinic (Free)</td>
                    <td>{cutoffSettings.membershipCutoff || 20}%</td>
                    <td>Free clinic visits</td>
                  </tr>
                  <tr>
                    <td>Membership</td>
                    <td>{cutoffSettings.membershipCutoff || 20}%</td>
                    <td>All membership sales</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🚨 UPDATED: Individual Order Row Component with FREE CONSULTATION LOGIC
const OrderRow = ({ order, onUpdateCutoff }) => {
  const [customCutoff, setCustomCutoff] = useState(order.cutoffPercentage || (order.orderType === 'membership' ? 20 : 5));
  const [editing, setEditing] = useState(false);

  const handleSaveCutoff = () => {
    onUpdateCutoff(order._id, order.orderType, customCutoff);
    setEditing(false);
  };

  // 🚨 Check if this is a FREE consultation
  const isFreeConsultation = order.isFreeConsultation || false;
  const cutoffType = order.cutoffType || (isFreeConsultation ? 'membership' : order.orderType);

  const getStatusBadge = (order) => {
    const orderType = order.orderType;
    
    // ✅ MEMBERSHIP ORDER STATUS
    if (orderType === 'membership') {
      const status = order.paymentStatus || 'completed';
      const statusMap = {
        'completed': { variant: 'success', text: 'Completed' },
        'pending': { variant: 'warning', text: 'Pending' },
        'failed': { variant: 'danger', text: 'Failed' },
        'refunded': { variant: 'info', text: 'Refunded' }
      };
      
      const statusInfo = statusMap[status.toLowerCase()] || { variant: 'secondary', text: status };
      return <span className={`badge bg-${statusInfo.variant}`}>{statusInfo.text}</span>;
    }
    
    // Other order types...
    let status = order.status;
    let variant = 'secondary';

    if (typeof status === 'number' || (typeof status === 'string' && !isNaN(status))) {
      const statusNum = parseInt(status);
      const numericStatusMap = {
        0: { variant: 'warning', text: 'Pending' },
        1: { variant: 'info', text: 'Confirmed' },
        2: { variant: 'success', text: 'Delivered' },
        3: { variant: 'danger', text: 'Cancelled' },
        4: { variant: 'secondary', text: 'Processing' },
        5: { variant: 'primary', text: 'Out for Delivery' },
        6: { variant: 'danger', text: 'Rejected' },
        7: { variant: 'info', text: 'Accepted' },
        8: { variant: 'success', text: 'Completed' }
      };
      
      const statusInfo = numericStatusMap[statusNum] || { variant: 'secondary', text: 'Unknown' };
      return <span className={`badge bg-${statusInfo.variant}`}>{statusInfo.text}</span>;
    } 
    else if (typeof status === 'string') {
      const stringStatusMap = {
        'pending': { variant: 'warning', text: 'Pending' },
        'confirmed': { variant: 'info', text: 'Confirmed' },
        'delivered': { variant: 'success', text: 'Delivered' },
        'cancelled': { variant: 'danger', text: 'Cancelled' },
        'processing': { variant: 'secondary', text: 'Processing' },
        'out_for_delivery': { variant: 'primary', text: 'Out for Delivery' },
        'rejected': { variant: 'danger', text: 'Rejected' },
        'accepted': { variant: 'info', text: 'Accepted' },
        'completed': { variant: 'success', text: 'Completed' },
        'scheduled': { variant: 'info', text: 'Scheduled' },
        'in_progress': { variant: 'primary', text: 'In Progress' }
      };
      
      const statusInfo = stringStatusMap[status.toLowerCase()] || { variant: 'secondary', text: status };
      return <span className={`badge bg-${statusInfo.variant}`}>{statusInfo.text}</span>;
    }
    else if (order.orderStatus && typeof order.orderStatus === 'string') {
      const orderStatusMap = {
        'confirmed': { variant: 'info', text: 'Confirmed' },
        'pending': { variant: 'warning', text: 'Pending' },
        'delivered': { variant: 'success', text: 'Delivered' },
        'cancelled': { variant: 'danger', text: 'Cancelled' }
      };
      
      const statusInfo = orderStatusMap[order.orderStatus.toLowerCase()] || { variant: 'secondary', text: order.orderStatus };
      return <span className={`badge bg-${statusInfo.variant}`}>{statusInfo.text}</span>;
    }
    
    return <span className="badge bg-secondary">Unknown</span>;
  };

  const getCutoffBadge = (cutoffType) => {
    const badges = {
      'membership': <span className="membership-cutoff-badge">Membership Cutoff</span>,
      'doctor': <span className="doctor-cutoff-badge">Doctor Cutoff</span>,
      'clinic': <span className="clinic-cutoff-badge">Clinic Cutoff</span>,
      'food': <span className="badge bg-primary">Food Cutoff</span>,
      'pharmacy': <span className="badge bg-success">Pharmacy Cutoff</span>,
      'lab': <span className="badge bg-info">Lab Cutoff</span>
    };
    
    return badges[cutoffType] || null;
  };

  return (
    <tr style={isFreeConsultation ? {backgroundColor: '#f0fff4'} : {}}>
      <td>
        <strong>{order.displayId || order._id?.substring(0, 8)}...</strong>
        <br />
        <small className="text-muted">{order._id}</small>
        {isFreeConsultation && (
          <div className="free-consultation-badge mt-1">
            <i className="fas fa-crown"></i> FREE Consultation
          </div>
        )}
      </td>
      <td>
        <span className={`badge bg-${getTypeColor(order.orderType)}`}>
          {order.orderType?.toUpperCase()}
          {order.orderType === 'membership' && <i className="fas fa-crown ms-1"></i>}
        </span>
        {getCutoffBadge(cutoffType)}
      </td>
      <td>{getCustomerName(order)}</td>
      <td>
        {getPlanOrVendorName(order)}
        {order.financialBreakdown && (
          <div className="financial-breakdown">
            <div className="financial-item">
              <span>Consultation Fee:</span>
              <span>₹{parseFloat(order.financialBreakdown.originalConsultationFee || 0).toFixed(2)}</span>
            </div>
            <div className="financial-item">
              <span>Membership Discount:</span>
              <span className="text-success">-₹{parseFloat(order.financialBreakdown.membershipDiscount || 0).toFixed(2)}</span>
            </div>
            <div className="financial-item">
              <span>Amount Paid:</span>
              <span className="fw-bold">₹{parseFloat(order.financialBreakdown.amountPaid || 0).toFixed(2)}</span>
            </div>
          </div>
        )}
      </td>
      <td>{formatDate(order.createdAt || order.orderDate || order.date)}</td>
      <td className="fw-bold text-primary">
        ₹{parseFloat(order.originalPrice || order.grandTotal || order.price || order.pricePaid || 0).toFixed(2)}
        {isFreeConsultation && (
          <div className="text-success small">FREE with Membership</div>
        )}
      </td>
      <td>
        {editing ? (
          <div className="input-group input-group-sm">
            <input
              type="number"
              className="form-control"
              value={customCutoff}
              onChange={(e) => setCustomCutoff(parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              style={{width: '80px'}}
            />
            <button 
              className="btn btn-success btn-sm"
              onClick={handleSaveCutoff}
            >
              ✓
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setCustomCutoff(order.cutoffPercentage || (order.orderType === 'membership' ? 20 : 5));
                setEditing(false);
              }}
            >
              ✗
            </button>
          </div>
        ) : (
          <div>
            <span 
              className={`fw-bold ${isFreeConsultation ? 'text-danger' : 'text-info'} cursor-pointer`}
              onClick={() => setEditing(true)}
              title="Click to edit"
              style={{cursor: 'pointer'}}
            >
              {order.cutoffPercentage || (order.orderType === 'membership' ? 20 : 5)}%
            </span>
            {isFreeConsultation && (
              <div className="text-muted small">(Membership)</div>
            )}
          </div>
        )}
      </td>
      <td className="fw-bold text-success">
        ₹{parseFloat(order.cutoffAmount || order.adminEarnings || 0).toFixed(2)}
        {isFreeConsultation && (
          <div className="text-muted small">from Membership</div>
        )}
      </td>
      <td className="fw-bold text-warning">
        ₹{parseFloat(order.vendorPayout || ((order.originalPrice || 0) - (order.cutoffAmount || 0)) || 0).toFixed(2)}
      </td>
      <td>
        {getStatusBadge(order)}
        {order.paymentStatus === 'free' && (
          <div className="text-success small mt-1">Free Consultation</div>
        )}
      </td>
      <td>
        <button 
          className="btn btn-info btn-sm"
          onClick={() => setEditing(!editing)}
          disabled={editing}
        >
          {editing ? 'Editing...' : 'Edit Cutoff'}
        </button>
      </td>
    </tr>
  );
};

// Helper functions - UPDATED
const getTypeColor = (type) => {
  const colorMap = {
    'food': 'primary',
    'pharmacy': 'success', 
    'lab': 'info',
    'doctor': 'warning',
    'clinic': 'danger',
    'membership': 'purple',
    'unknown': 'secondary'
  };
  return colorMap[type] || 'secondary';
};

const getCustomerName = (order) => {
  if (order.userId?.name) return order.userId.name;
  if (order.patientDetails?.name) return order.patientDetails.name;
  if (order.patient?.name) return order.patient.name;
  if (order.name) return order.name;
  if (order.userDetails?.name) return order.userDetails.name;
  return 'N/A';
};

// ✅ UPDATED: Plan/Vendor name extractor
const getPlanOrVendorName = (order) => {
  if (order.orderType === 'membership') {
    if (order.planDetails?.planName) return order.planDetails.planName;
    if (order.membershipId?.planName) return order.membershipId.planName;
    return 'Membership Plan';
  }
  
  if (order.orderType === 'doctor') {
    if (order.doctor?.name) return order.doctor.name;
    if (order.doctorDetails?.name) return order.doctorDetails.name;
    if (order.appointment?.doctorDetails?.name) return order.appointment.doctorDetails.name;
    if (order.doctorId?.name) return order.doctorId.name;
    return 'Doctor Consultation';
  }
  
  if (order.orderType === 'clinic') {
    if (order.clinicDetails?.name) return order.clinicDetails.name;
    if (order.clinicDetails?.clinicName) return order.clinicDetails.clinicName;
    if (order.clinicId?.name) return order.clinicId.name;
    if (order.clinicId?.clinicName) return order.clinicId.clinicName;
    if (order.doctorDetails?.name) return `${order.doctorDetails.name} (Clinic)`;
    return 'Clinic Visit';
  }
  
  return getVendorName(order);
};

// Vendor name extraction
const getVendorName = (order) => {
  if (order.orderType) {
    switch (order.orderType) {
      case 'food':
        if (order.vendorId?.name) return order.vendorId.name;
        if (order.vendorId?.shopName) return order.vendorId.shopName;
        return 'Food Vendor';
        
      case 'pharmacy':
        if (order.items && order.items.length > 0) {
          const firstItem = order.items[0];
          if (firstItem?.vendorId?.name) return firstItem.vendorId.name;
          if (firstItem?.vendorId?.shopName) return firstItem.vendorId.shopName;
        }
        if (order.vendorId?.name) return order.vendorId.name;
        if (order.vendorId?.shopName) return order.vendorId.shopName;
        return 'Pharmacy Vendor';
        
      case 'lab':
        if (order.vendorId?.name) return order.vendorId.name;
        if (order.vendorId?.labName) return order.vendorId.labName;
        return 'Lab';
        
      case 'doctor':
        if (order.doctor?.name) return order.doctor.name;
        if (order.doctorDetails?.name) return order.doctorDetails.name;
        if (order.appointment?.doctorDetails?.name) return order.appointment.doctorDetails.name;
        if (order.doctorId?.name) return order.doctorId.name;
        return 'Doctor';
        
      case 'clinic':
        if (order.clinicDetails?.name) return order.clinicDetails.name;
        if (order.clinicDetails?.clinicName) return order.clinicDetails.clinicName;
        if (order.clinicId?.name) return order.clinicId.name;
        if (order.clinicId?.clinicName) return order.clinicId.clinicName;
        if (order.doctorDetails?.name) return `${order.doctorDetails.name} (Clinic)`;
        if (order.doctor?.name) return `${order.doctor.name} (Clinic)`;
        return 'Clinic';
        
      default:
        break;
    }
  }
  
  return 'N/A';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return 'Invalid Date';
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Date Error';
  }
};

export default AdminRevenueDashboard;