import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RevenueSummary = () => {
  const [summary, setSummary] = useState({
    foodRevenue: 0,
    pharmacyRevenue: 0,
    labRevenue: 0,
    doctorRevenue: 0,
    clinicRevenue: 0,
    membershipRevenue: 0,
    foodOrders: 0,
    pharmacyOrders: 0,
    labOrders: 0,
    doctorOrders: 0,
    clinicOrders: 0,
    membershipOrders: 0,
    foodEarnings: 0,
    pharmacyEarnings: 0,
    labEarnings: 0,
    doctorEarnings: 0,
    clinicEarnings: 0,
    membershipEarnings: 0,
    totalRevenue: 0,
    totalEarnings: 0,
    doctorFreeConsultations: {
      count: 0,
      paidCount: 0,
      originalConsultationFees: 0,
      earnings: 0,
      cutoffPercentage: 20,
      doctorPaidEarnings: 0,
      paidCutoffPercentage: 5,
      freePercentage: 0
    },
    clinicFreeConsultations: {
      count: 0,
      paidCount: 0,
      originalConsultationFees: 0,
      earnings: 0,
      cutoffPercentage: 20,
      clinicPaidEarnings: 0,
      paidCutoffPercentage: 5,
      freePercentage: 0
    },
    breakdownPercentages: {
      food: 0,
      pharmacy: 0,
      lab: 0,
      doctor: 0,
      clinic: 0,
      membership: 0
    }
  });
  
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const getToken = () => {
    const data = sessionStorage.getItem("admin");
    return data ? JSON.parse(data).token : null;
  };

  const fetchRevenueSummary = async (start = '', end = '') => {
    try {
      setLoading(true);
      const token = getToken();
      
      const params = {};
      if (start && end) {
        params.startDate = start;
        params.endDate = end;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin-revenue/revenue-summary`,
        { 
          headers: { token },
          params
        }
      );
      
      if (response.data.success) {
        const data = response.data.data || {};
        console.log("Revenue summary data:", data);
        
        // Set summary with default values to prevent undefined
        setSummary({
          foodRevenue: data.foodRevenue || 0,
          pharmacyRevenue: data.pharmacyRevenue || 0,
          labRevenue: data.labRevenue || 0,
          doctorRevenue: data.doctorRevenue || 0,
          clinicRevenue: data.clinicRevenue || 0,
          membershipRevenue: data.membershipRevenue || 0,
          foodOrders: data.foodOrders || 0,
          pharmacyOrders: data.pharmacyOrders || 0,
          labOrders: data.labOrders || 0,
          doctorOrders: data.doctorOrders || 0,
          clinicOrders: data.clinicOrders || 0,
          membershipOrders: data.membershipOrders || 0,
          foodEarnings: data.foodEarnings || 0,
          pharmacyEarnings: data.pharmacyEarnings || 0,
          labEarnings: data.labEarnings || 0,
          doctorEarnings: data.doctorEarnings || 0,
          clinicEarnings: data.clinicEarnings || 0,
          membershipEarnings: data.membershipEarnings || 0,
          totalRevenue: data.totalRevenue || 0,
          totalEarnings: data.totalEarnings || 0,
          doctorFreeConsultations: data.doctorFreeConsultations || {
            count: 0,
            paidCount: 0,
            originalConsultationFees: 0,
            earnings: 0,
            cutoffPercentage: 20,
            doctorPaidEarnings: 0,
            paidCutoffPercentage: 5,
            freePercentage: 0
          },
          clinicFreeConsultations: data.clinicFreeConsultations || {
            count: 0,
            paidCount: 0,
            originalConsultationFees: 0,
            earnings: 0,
            cutoffPercentage: 20,
            clinicPaidEarnings: 0,
            paidCutoffPercentage: 5,
            freePercentage: 0
          },
          breakdownPercentages: data.breakdownPercentages || {
            food: 0,
            pharmacy: 0,
            lab: 0,
            doctor: 0,
            clinic: 0,
            membership: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching revenue summary:', error);
      alert('Error fetching revenue summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueSummary();
  }, []);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dateRange.startDate && dateRange.endDate) {
      fetchRevenueSummary(dateRange.startDate, dateRange.endDate);
    } else {
      alert('Please select both start and end dates');
    }
  };

  const handleShowAllData = () => {
    setDateRange({ startDate: '', endDate: '' });
    fetchRevenueSummary();
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num) => {
    return parseInt(num || 0).toLocaleString('en-IN');
  };

  // 🚨 CALCULATE TOTALS
  const totalOrders = 
    (summary.foodOrders || 0) +
    (summary.pharmacyOrders || 0) +
    (summary.labOrders || 0) +
    (summary.doctorOrders || 0) +
    (summary.clinicOrders || 0) +
    (summary.membershipOrders || 0);

  const averageOrderValue = totalOrders > 0 ? (summary.totalRevenue || 0) / totalOrders : 0;

  // 🚨 FREE CONSULTATION STATS
  const totalFreeConsultations = 
    (summary.doctorFreeConsultations?.count || 0) + 
    (summary.clinicFreeConsultations?.count || 0);
  
  const totalFreeConsultationRevenue = 
    (summary.doctorFreeConsultations?.originalConsultationFees || 0) + 
    (summary.clinicFreeConsultations?.originalConsultationFees || 0);
  
  const totalFreeConsultationEarnings = 
    (summary.doctorFreeConsultations?.earnings || 0) + 
    (summary.clinicFreeConsultations?.earnings || 0);

  // 🚨 MEDICAL SERVICES TOTALS
  const medicalServicesTotalRevenue = 
    (summary.doctorRevenue || 0) + 
    (summary.clinicRevenue || 0) + 
    (summary.membershipRevenue || 0);
  
  const medicalServicesTotalEarnings = 
    (summary.doctorEarnings || 0) + 
    (summary.clinicEarnings || 0) + 
    (summary.membershipEarnings || 0);

  // 🚨 CALCULATE PAID REVENUE FOR DOCTOR AND CLINIC
  const doctorPaidRevenue = (summary.doctorRevenue || 0) - (summary.doctorFreeConsultations?.originalConsultationFees || 0);
  const clinicPaidRevenue = (summary.clinicRevenue || 0) - (summary.clinicFreeConsultations?.originalConsultationFees || 0);

  // 🚨 CATEGORIES ARRAY WITH FREE CONSULTATION INFO
  const categories = [
    { 
      key: 'food', 
      label: 'Food Revenue', 
      icon: 'fas fa-utensils', 
      color: 'primary',
      revenue: summary.foodRevenue,
      earnings: summary.foodEarnings,
      orders: summary.foodOrders,
      percentage: summary.breakdownPercentages?.food || 0
    },
    { 
      key: 'pharmacy', 
      label: 'Pharmacy Revenue', 
      icon: 'fas fa-pills', 
      color: 'success',
      revenue: summary.pharmacyRevenue,
      earnings: summary.pharmacyEarnings,
      orders: summary.pharmacyOrders,
      percentage: summary.breakdownPercentages?.pharmacy || 0
    },
    { 
      key: 'lab', 
      label: 'Lab Revenue', 
      icon: 'fas fa-flask', 
      color: 'info',
      revenue: summary.labRevenue,
      earnings: summary.labEarnings,
      orders: summary.labOrders,
      percentage: summary.breakdownPercentages?.lab || 0
    },
    { 
      key: 'doctor', 
      label: 'Doctor Revenue', 
      icon: 'fas fa-user-md', 
      color: 'warning',
      revenue: summary.doctorRevenue,
      earnings: summary.doctorEarnings,
      orders: summary.doctorOrders,
      percentage: summary.breakdownPercentages?.doctor || 0,
      // 🚨 FREE CONSULTATION INFO
      freeConsultations: summary.doctorFreeConsultations?.count || 0,
      originalConsultationFees: summary.doctorFreeConsultations?.originalConsultationFees || 0,
      freeConsultationEarnings: summary.doctorFreeConsultations?.earnings || 0,
      paidConsultations: summary.doctorFreeConsultations?.paidCount || (summary.doctorOrders - (summary.doctorFreeConsultations?.count || 0)),
      paidConsultationEarnings: summary.doctorFreeConsultations?.doctorPaidEarnings || 0,
      paidConsultationRevenue: doctorPaidRevenue,
      freeConsultationCutoff: summary.doctorFreeConsultations?.cutoffPercentage || 20,
      paidConsultationCutoff: summary.doctorFreeConsultations?.paidCutoffPercentage || 5,
      freePercentage: summary.doctorFreeConsultations?.freePercentage || 0
    },
    { 
      key: 'clinic', 
      label: 'Clinic Revenue', 
      icon: 'fas fa-hospital', 
      color: 'danger',
      revenue: summary.clinicRevenue,
      earnings: summary.clinicEarnings,
      orders: summary.clinicOrders,
      percentage: summary.breakdownPercentages?.clinic || 0,
      // 🚨 FREE CONSULTATION INFO
      freeConsultations: summary.clinicFreeConsultations?.count || 0,
      originalConsultationFees: summary.clinicFreeConsultations?.originalConsultationFees || 0,
      freeConsultationEarnings: summary.clinicFreeConsultations?.earnings || 0,
      paidConsultations: summary.clinicFreeConsultations?.paidCount || (summary.clinicOrders - (summary.clinicFreeConsultations?.count || 0)),
      paidConsultationEarnings: summary.clinicFreeConsultations?.clinicPaidEarnings || 0,
      paidConsultationRevenue: clinicPaidRevenue,
      freeConsultationCutoff: summary.clinicFreeConsultations?.cutoffPercentage || 20,
      paidConsultationCutoff: summary.clinicFreeConsultations?.paidCutoffPercentage || 5,
      freePercentage: summary.clinicFreeConsultations?.freePercentage || 0
    },
    { 
      key: 'membership', 
      label: 'Membership Revenue', 
      icon: 'fas fa-crown', 
      color: 'info',
      revenue: summary.membershipRevenue,
      earnings: summary.membershipEarnings,
      orders: summary.membershipOrders,
      percentage: summary.breakdownPercentages?.membership || 0
    }
  ];

  return (
    <div className="card shadow mb-4">
      <style>
        {`
          .free-consultation-info {
            background: #e8f5e9;
            border-left: 4px solid #28a745;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.85rem;
            margin-top: 5px;
          }
          
          .free-consultation-badge {
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 0.7rem;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-left: 5px;
          }
          
          .clinic-free-badge {
            background: linear-gradient(45deg, #dc3545, #fd7e14);
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 0.7rem;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-left: 5px;
          }
          
          .cutoff-badge {
            background: linear-gradient(45deg, #6f42c1, #e83e8c);
            color: white;
            border-radius: 4px;
            padding: 1px 6px;
            font-size: 0.65rem;
            font-weight: bold;
            margin-left: 5px;
          }
          
          .medical-services-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #dee2e6;
          }
          
          .platform-earnings-card {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border: 1px solid #90caf9;
          }
          
          .revenue-card {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .revenue-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          
          .stat-badge {
            font-size: 0.7rem;
            padding: 2px 6px;
            border-radius: 10px;
          }
        `}
      </style>

      <div className="card-header py-3 d-flex justify-content-between align-items-center">
        <div>
          <h6 className="m-0 font-weight-bold text-primary">Revenue Summary</h6>
          <small className="text-muted">
            {dateRange.startDate && dateRange.endDate 
              ? `Showing data from ${new Date(dateRange.startDate).toLocaleDateString()} to ${new Date(dateRange.endDate).toLocaleDateString()}`
              : 'Showing complete data (all time)'
            }
          </small>
        </div>
        
        <div className="d-flex gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowFilter(!showFilter)}
          >
            {showFilter ? 'Hide Filter' : 'Show Filter'}
          </button>
          
          {(dateRange.startDate || dateRange.endDate) && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleShowAllData}
            >
              Show All Data
            </button>
          )}
          
          {/* 🚨 FREE CONSULTATION SUMMARY BADGE */}
          {totalFreeConsultations > 0 && (
            <span className="badge bg-success">
              <i className="fas fa-crown me-1"></i>
              {totalFreeConsultations} Free Consultations
            </span>
          )}
        </div>
      </div>

      {/* Date Filter */}
      {showFilter && (
        <div className="card-body border-bottom">
          <form onSubmit={handleSubmit}>
            <div className="row align-items-end">
              <div className="col-md-3">
                <label className="form-label small">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </div>
              <div className="col-md-4">
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || !dateRange.startDate || !dateRange.endDate}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        Loading...
                      </>
                    ) : (
                      'Apply Filter'
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setDateRange({ startDate: '', endDate: '' });
                      setShowFilter(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="card-body">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <div className="mt-2">Loading revenue data...</div>
          </div>
        ) : (
          <div className="row">
            {/* Category Cards - First Row (4 cards) */}
            {categories.slice(0, 4).map((category) => (
              <div className="col-xl-3 col-md-6 mb-4" key={category.key}>
                <div
                  className={`card h-100 revenue-card border-${category.color}`}
                  style={{ boxShadow: 'none', borderWidth: '2px' }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div
                          className={`text-xs font-weight-bold text-${category.color} text-uppercase mb-1`}
                        >
                          {category.label}
                          {/* 🚨 FREE CONSULTATION BADGES */}
                          {category.freeConsultations > 0 && (
                            <span className={`${category.key === 'clinic' ? 'clinic-free-badge' : 'free-consultation-badge'} ms-2`}>
                              <i className="fas fa-crown"></i> {category.freeConsultations} Free
                            </span>
                          )}
                        </div>
      
                        <div className="h5 mb-1 font-weight-bold text-gray-800">
                          {formatCurrency(category.revenue)}
                        </div>
      
                        <div className="mt-2">
                          <div className="d-flex justify-content-between small">
                            <span className="text-success">
                              <i className="fas fa-rupee-sign fa-xs me-1"></i>
                              {formatCurrency(category.earnings)}
                            </span>
                            <span className="text-info">
                              <i className="fas fa-shopping-cart fa-xs me-1"></i>
                              {formatNumber(category.orders)}
                            </span>
                          </div>
      
                          {/* 🚨 FREE CONSULTATION INFO FOR DOCTOR */}
                          {category.freeConsultations > 0 && (
                            <div className="free-consultation-info mt-2">
                              <div className="d-flex justify-content-between">
                                <span className="text-muted">Free Consults:</span>
                                <span className="fw-bold">{category.freeConsultations}</span>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span className="text-muted">Original Fees:</span>
                                <span>{formatCurrency(category.originalConsultationFees)}</span>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span className="text-muted">Earnings:</span>
                                <span className="text-success">{formatCurrency(category.freeConsultationEarnings)}</span>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span className="text-muted">Cutoff:</span>
                                <span className="fw-bold">{category.freeConsultationCutoff}%</span>
                              </div>
                            </div>
                          )}

                          {category.orders > 0 && (
                            <div className="small text-muted mt-2">
                              Avg:{' '}
                              {formatCurrency(
                                (category.revenue || 0) / (category.orders || 1)
                              )}
                            </div>
                          )}
                        </div>
                      </div>
      
                      <div className="ps-2">
                        <i className={`${category.icon} fa-2x text-${category.color}`}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      
            {/* 🚨 CLINIC REVENUE CARD WITH FREE CONSULTATION INFO */}
            <div className="col-xl-3 col-md-6 mb-4">
              <div
                className="card h-100 revenue-card border-danger"
                style={{ boxShadow: 'none', borderWidth: '2px' }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                        Clinic Revenue
                        {summary.clinicFreeConsultations?.count > 0 && (
                          <span className="clinic-free-badge ms-2">
                            <i className="fas fa-crown"></i> {summary.clinicFreeConsultations?.count} Free
                          </span>
                        )}
                      </div>
      
                      <div className="h5 mb-1 font-weight-bold text-gray-800">
                        {formatCurrency(summary.clinicRevenue)}
                      </div>
      
                      <div className="mt-2">
                        <div className="d-flex justify-content-between small">
                          <span className="text-success">
                            <i className="fas fa-rupee-sign fa-xs me-1"></i>
                            {formatCurrency(summary.clinicEarnings)}
                          </span>
                          <span className="text-info">
                            <i className="fas fa-shopping-cart fa-xs me-1"></i>
                            {formatNumber(summary.clinicOrders)}
                          </span>
                        </div>
      
                        {/* 🚨 FREE CONSULTATION INFO FOR CLINIC */}
                        {summary.clinicFreeConsultations?.count > 0 && (
                          <div className="free-consultation-info mt-2">
                            <div className="d-flex justify-content-between">
                              <span className="text-muted">Free Consults:</span>
                              <span className="fw-bold">{summary.clinicFreeConsultations?.count}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span className="text-muted">Original Fees:</span>
                              <span>{formatCurrency(summary.clinicFreeConsultations?.originalConsultationFees)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span className="text-muted">Earnings:</span>
                              <span className="text-success">{formatCurrency(summary.clinicFreeConsultations?.earnings)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span className="text-muted">Cutoff:</span>
                              <span className="fw-bold">{summary.clinicFreeConsultations?.cutoffPercentage}%</span>
                            </div>
                          </div>
                        )}

                        {summary.clinicOrders > 0 && (
                          <div className="small text-muted mt-2">
                            Avg:{' '}
                            {formatCurrency(
                              (summary.clinicRevenue || 0) / (summary.clinicOrders || 1)
                            )}
                          </div>
                        )}
                      </div>
                    </div>
      
                    <div className="ps-2">
                      <i className="fas fa-hospital fa-2x text-danger"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      
            {/* 🚨 MEMBERSHIP REVENUE CARD */}
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card revenue-card border-info h-100"
                style={{ boxShadow: 'none', borderWidth: '2px' }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                        <i className="fas fa-crown me-1"></i>
                        Membership Revenue
                      </div>
                      <div className="h5 mb-1 font-weight-bold text-gray-800">
                        {formatCurrency(summary.membershipRevenue)}
                      </div>
                      <div className="mt-2">
                        <div className="d-flex justify-content-between small">
                          <span className="text-success">
                            <i className="fas fa-rupee-sign fa-xs me-1"></i>
                            {formatCurrency(summary.membershipEarnings)}
                          </span>
                          <span className="text-info">
                            <i className="fas fa-shopping-cart fa-xs me-1"></i>
                            {formatNumber(summary.membershipOrders)}
                          </span>
                        </div>
                        {summary.membershipOrders > 0 && (
                          <div className="small text-muted mt-1">
                            Avg: {formatCurrency((summary.membershipRevenue || 0) / (summary.membershipOrders || 1))}
                          </div>
                        )}
                        
                        {/* 🚨 FREE CONSULTATION EARNINGS SUMMARY */}
                        {totalFreeConsultationEarnings > 0 && (
                          <div className="small text-success mt-1">
                            <i className="fas fa-stethoscope me-1"></i>
                            +{formatCurrency(totalFreeConsultationEarnings)} from free consults
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ps-2">
                      <i className="fas fa-crown fa-2x text-info"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      
            {/* 🚨 MEDICAL SERVICES SUMMARY CARD */}
            <div className="col-xl-6 col-md-6 mb-4">
              <div className="card medical-services-card h-100"
                style={{ boxShadow: 'none', borderWidth: '2px' }}>
                <div className="card-body">
                  <h5 className="card-title mb-3 text-dark">
                    <i className="fas fa-stethoscope me-2 text-primary"></i>
                    Medical Services Summary
                  </h5>
                  
                  <div className="row text-center">
                    <div className="col-6 col-md-3 mb-3">
                      <div className="h6 font-weight-bold text-primary">{formatCurrency(medicalServicesTotalRevenue)}</div>
                      <div className="small text-muted">Total Revenue</div>
                    </div>
                    
                    <div className="col-6 col-md-3 mb-3">
                      <div className="h6 font-weight-bold text-success">{formatCurrency(medicalServicesTotalEarnings)}</div>
                      <div className="small text-muted">Total Earnings</div>
                    </div>
                    
                    <div className="col-6 col-md-3 mb-3">
                      <div className="h6 font-weight-bold">{formatNumber(
                        (summary.doctorOrders || 0) + 
                        (summary.clinicOrders || 0) + 
                        (summary.membershipOrders || 0)
                      )}</div>
                      <div className="small text-muted">Total Orders</div>
                    </div>
                    
                    <div className="col-6 col-md-3 mb-3">
                      <div className="h6 font-weight-bold text-success">
                        {totalFreeConsultations}
                      </div>
                      <div className="small text-muted">Free Consultations</div>
                    </div>
                  </div>
                  
                  {/* 🚨 FREE CONSULTATION BREAKDOWN */}
                  {totalFreeConsultations > 0 && (
                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="alert alert-success py-2 px-3 mb-0" style={{fontSize: '0.8rem'}}>
                          <i className="fas fa-info-circle me-2"></i>
                          <strong>Free Consultation Stats:</strong> 
                          <div className="d-flex flex-wrap gap-3 mt-1">
                            <div>
                              <strong>Doctor:</strong> {summary.doctorFreeConsultations?.count || 0} consultations
                            </div>
                            <div>
                              <strong>Clinic:</strong> {summary.clinicFreeConsultations?.count || 0} consultations
                            </div>
                            <div>
                              <strong>Total Fees:</strong> {formatCurrency(totalFreeConsultationRevenue)}
                            </div>
                            <div>
                              <strong>Total Earnings:</strong> {formatCurrency(totalFreeConsultationEarnings)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 🚨 PLATFORM TOTAL SUMMARY CARD */}
            <div className="col-xl-6 col-md-6 mb-4">
              <div className="card platform-earnings-card border-gray text-white h-100"
                style={{ boxShadow: 'none', borderWidth: '2px' }}>
                <div className="card-body text-black">
                  <h5 className="card-title mb-4 text-dark">
                    <i className="fas fa-chart-line me-2"></i>
                    Platform Total Summary
                  </h5>
                  <div className="row text-center">
                    <div className="col-6 col-md-3 mb-3">
                      <div className="h6 font-weight-bold text-dark">{formatCurrency(summary.totalRevenue)}</div>
                      <div className="small text-muted">Total Revenue</div>
                    </div>
                    <div className="col-6 col-md-3 mb-3">
                      <div className="h6 font-weight-bold text-success">{formatCurrency(summary.totalEarnings)}</div>
                      <div className="small text-muted">Total Earnings</div>
                    </div>
                    <div className="col-6 col-md-3 mb-3">
                      <div className="h6 text-dark">{formatNumber(totalOrders)}</div>
                      <div className="small text-muted">Total Orders</div>
                    </div>
                    <div className="col-6 col-md-3 mb-3">
                      <div className="h6 font-weight-bold text-dark">{formatCurrency(averageOrderValue)}</div>
                      <div className="small text-muted">Avg Order Value</div>
                    </div>
                  </div>
                 
                  {summary.totalRevenue > 0 && (
                    <div className="row mt-3">
                      <div className="col-12 text-center">
                        <div className="small text-dark">
                          Platform Earnings Rate: <strong>{((summary.totalEarnings / summary.totalRevenue) * 100).toFixed(2)}%</strong>
                        </div>
                        
                        {/* 🚨 FREE CONSULTATION IMPACT */}
                        {totalFreeConsultationEarnings > 0 && (
                          <div className="small text-success mt-2">
                            <i className="fas fa-crown me-1"></i>
                            <strong>{totalFreeConsultations} free consultations</strong> contributed {formatCurrency(totalFreeConsultationEarnings)} 
                            <span className="ms-2">
                              ({((totalFreeConsultationEarnings / summary.totalEarnings) * 100).toFixed(1)}% of total earnings)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 🚨 CATEGORY DISTRIBUTION */}
            <div className="col-12 mt-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="m-0 font-weight-bold text-dark">Category Distribution</h6>
                  {totalFreeConsultations > 0 && (
                    <div className="d-flex gap-2">
                      <span className="badge bg-success stat-badge">
                        <i className="fas fa-user-md me-1"></i>
                        Doctor: {summary.doctorFreeConsultations?.count || 0} Free
                      </span>
                      <span className="badge bg-danger stat-badge">
                        <i className="fas fa-hospital me-1"></i>
                        Clinic: {summary.clinicFreeConsultations?.count || 0} Free
                      </span>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    {categories.map((category) => (
                      <div className="col-md-2 col-sm-4 col-6 mb-3" key={category.key}>
                        <div className={`text-${category.color}`}>
                          <div className="h5">
                            {category.percentage.toFixed(1)}%
                          </div>
                          <div className="small">
                            {category.label.replace(' Revenue', '')}
                            {category.freeConsultations > 0 && (
                              <span className="cutoff-badge ms-1" title={`${category.freeConsultations} free consultations`}>
                                {category.freeConsultations}F
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 🚨 DETAILED BREAKDOWN TABLE */}
            <div className="col-12 mt-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="m-0 font-weight-bold text-dark">Detailed Breakdown</h6>
                  {totalFreeConsultations > 0 && (
                    <div className="d-flex gap-2">
                      <span className="badge bg-success">
                        <i className="fas fa-user-md me-1"></i>
                        Doctor: {summary.doctorFreeConsultations?.count || 0} Free
                      </span>
                      <span className="badge bg-danger">
                        <i className="fas fa-hospital me-1"></i>
                        Clinic: {summary.clinicFreeConsultations?.count || 0} Free
                      </span>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="thead-light">
                        <tr>
                          <th>Category</th>
                          <th className="text-end">Revenue</th>
                          <th className="text-end">Orders</th>
                          <th className="text-end">Paid/Free</th>
                          <th className="text-end">Avg. Order Value</th>
                          <th className="text-end">Admin Earnings</th>
                          <th className="text-end">Earnings %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((category) => (
                          <tr key={category.key}>
                            <td>
                              <i className={`${category.icon} text-${category.color} me-2`}></i>
                              {category.label.replace(' Revenue', '')}
                              {category.freeConsultations > 0 && (
                                <span className={`${category.key === 'clinic' ? 'clinic-free-badge' : 'free-consultation-badge'} ms-2`}>
                                  {category.freeConsultations} Free
                                </span>
                              )}
                            </td>
                            <td className="text-end">
                              {formatCurrency(category.revenue)}
                              {category.freeConsultations > 0 && (
                                <div className="small text-muted">
                                  (Free: {formatCurrency(category.originalConsultationFees)})
                                </div>
                              )}
                            </td>
                            <td className="text-end">{formatNumber(category.orders)}</td>
                            <td className="text-end">
                              {category.freeConsultations > 0 ? (
                                <>
                                  <div className="text-success">{category.paidConsultations} Paid</div>
                                  <div className="text-info">{category.freeConsultations} Free</div>
                                  <div className="small text-muted">
                                    {category.freePercentage.toFixed(1)}% free
                                  </div>
                                </>
                              ) : '-'}
                            </td>
                            <td className="text-end">
                              {formatCurrency((category.revenue || 0) / (category.orders || 1))}
                            </td>
                            <td className="text-end text-success">
                              {formatCurrency(category.earnings)}
                              {category.freeConsultations > 0 && (
                                <div className="small text-success">
                                  (Free: {formatCurrency(category.freeConsultationEarnings)})
                                  <br />
                                  (Paid: {formatCurrency(category.paidConsultationEarnings)})
                                </div>
                              )}
                            </td>
                            <td className="text-end">
                              {category.revenue > 0 ? ((category.earnings / category.revenue) * 100).toFixed(1) : 0}%
                              {category.freeConsultations > 0 && (
                                <div className="small text-muted">
                                  Free: {category.freeConsultationCutoff}%
                                  <br />
                                  Paid: {category.paidConsultationCutoff}%
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        
                        <tr className="table-active font-weight-bold">
                          <td>
                            <i className="fas fa-stethoscope text-secondary me-2"></i>
                            Medical Services Total
                            {totalFreeConsultations > 0 && (
                              <div className="d-inline-flex gap-2 ms-2">
                                <span className="free-consultation-badge">
                                  <i className="fas fa-user-md"></i> {summary.doctorFreeConsultations?.count || 0}
                                </span>
                                <span className="clinic-free-badge">
                                  <i className="fas fa-hospital"></i> {summary.clinicFreeConsultations?.count || 0}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="text-end">
                            {formatCurrency(medicalServicesTotalRevenue)}
                            {totalFreeConsultationRevenue > 0 && (
                              <div className="small text-muted">
                                (Free Consult Fees: {formatCurrency(totalFreeConsultationRevenue)})
                              </div>
                            )}
                          </td>
                          <td className="text-end">
                            {formatNumber(
                              (summary.doctorOrders || 0) + 
                              (summary.clinicOrders || 0) + 
                              (summary.membershipOrders || 0)
                            )}
                          </td>
                          <td className="text-end">
                            <div className="text-success">
                              {((summary.doctorOrders - (summary.doctorFreeConsultations?.count || 0)) + 
                                (summary.clinicOrders - (summary.clinicFreeConsultations?.count || 0)))} Paid
                            </div>
                            <div className="text-info">{totalFreeConsultations} Free</div>
                          </td>
                          <td className="text-end">
                            {formatCurrency(
                              medicalServicesTotalRevenue / 
                              ((summary.doctorOrders || 0) + 
                               (summary.clinicOrders || 0) + 
                               (summary.membershipOrders || 0) || 1)
                            )}
                          </td>
                          <td className="text-end text-success">
                            {formatCurrency(medicalServicesTotalEarnings)}
                            {totalFreeConsultationEarnings > 0 && (
                              <div className="small text-success">
                                (Free Consults: {formatCurrency(totalFreeConsultationEarnings)})
                              </div>
                            )}
                          </td>
                          <td className="text-end">
                            {medicalServicesTotalRevenue > 0 ? 
                              (medicalServicesTotalEarnings / medicalServicesTotalRevenue * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                        
                        <tr className="table-primary font-weight-bold">
                          <td>
                            PLATFORM TOTAL
                            {totalFreeConsultations > 0 && (
                              <div className="d-inline-flex gap-2 ms-2">
                                <span className="free-consultation-badge bg-primary">
                                  <i className="fas fa-crown"></i> {totalFreeConsultations} Free Consultations
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="text-end">{formatCurrency(summary.totalRevenue)}</td>
                          <td className="text-end">{formatNumber(totalOrders)}</td>
                          <td className="text-end">
                            {totalFreeConsultations > 0 && (
                              <div className="small">
                                {totalOrders - totalFreeConsultations} Paid<br />
                                {totalFreeConsultations} Free
                              </div>
                            )}
                          </td>
                          <td className="text-end">{formatCurrency(averageOrderValue)}</td>
                          <td className="text-end text-success">{formatCurrency(summary.totalEarnings)}</td>
                          <td className="text-end">
                            {summary.totalRevenue > 0 ? ((summary.totalEarnings / summary.totalRevenue) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueSummary;