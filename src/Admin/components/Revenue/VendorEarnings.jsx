import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const VendorEarnings = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorDetails, setVendorDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [period, setPeriod] = useState('all');
  const [totals, setTotals] = useState({});
  const [debugInfo, setDebugInfo] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [cutoffSettings, setCutoffSettings] = useState(null);

  const getToken = () => {
    const data = sessionStorage.getItem("admin");
    return data ? JSON.parse(data).token : null;
  };

  // ✅ Fetch cutoff settings
  const fetchCutoffSettings = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin-revenue/cutoff-settings`,
        { headers: { token } }
      );
      setCutoffSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching cutoff settings:', error);
    }
  };

  // ✅ Format vendor display name
  const getVendorDisplayName = (vendor) => {
    let name = vendor.name || 'Unknown Vendor';
    
    if (vendor.type === 'doctor' && vendor.hasClinic && vendor.clinicName) {
      name = `${vendor.name} (${vendor.clinicName})`;
    }
    
    return name;
  };

  // ✅ Format vendor type
  const getVendorDisplayType = (vendor) => {
    if (vendor.type === 'doctor') {
      if (vendor.hasClinic) {
        return 'clinic-doctor';
      }
      return 'doctor';
    }
    return vendor.type;
  };

  // ✅ Format shop name
  const getVendorDisplayShopName = (vendor) => {
    if (vendor.type === 'doctor' && vendor.hasClinic && vendor.clinicName) {
      return `${vendor.clinicName}`;
    }
    return vendor.shopName || 'N/A';
  };

  // Fetch all vendors with earnings
  const fetchVendorEarnings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin-revenue/vendor-earnings`,
        { 
          headers: { token },
          params: { period }
        }
      );
      
      setVendors(response.data.data || []);
      setTotals(response.data.totals || {});
      setDebugInfo(response.data.debug || null);
      setCutoffSettings(response.data.cutoffSettings || null);
      
      // Prepare chart data
      prepareChartData(response.data.data || []);
      prepareTimeSeriesData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vendor earnings:', error);
      alert('Error fetching vendor earnings: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor details
  const fetchVendorDetails = async (vendorId) => {
    try {
      setDetailsLoading(true);
      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin-revenue/vendor-earnings/${vendorId}`,
        { 
          headers: { token },
          params: { period }
        }
      );
      
      setVendorDetails(response.data.data);
      setSelectedVendor(vendorId);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      alert('Error fetching vendor details: ' + (error.response?.data?.message || error.message));
    } finally {
      setDetailsLoading(false);
    }
  };

  // ✅ Prepare data for vendor type distribution chart
  const prepareChartData = (vendorsData) => {
    const typeData = vendorsData.reduce((acc, vendor) => {
      const displayType = getVendorDisplayType(vendor);
      const typeKey = displayType || 'unknown';
      
      if (!acc[typeKey]) {
        acc[typeKey] = {
          type: typeKey.replace('-', ' ').toUpperCase(),
          typeKey: typeKey,
          count: 0,
          totalEarnings: 0,
          todayEarnings: 0,
          weeklyEarnings: 0,
          monthlyEarnings: 0,
          totalOrders: 0
        };
      }
      
      acc[typeKey].count++;
      acc[typeKey].totalEarnings += vendor.totalEarnings || 0;
      acc[typeKey].todayEarnings += vendor.todayEarnings || 0;
      acc[typeKey].weeklyEarnings += vendor.weeklyEarnings || 0;
      acc[typeKey].monthlyEarnings += vendor.monthlyEarnings || 0;
      acc[typeKey].totalOrders += vendor.orders?.total || 0;
      
      return acc;
    }, {});

    // Transform to array
    const dataArray = Object.values(typeData).map(item => ({
      ...item,
      percentage: totals.totalEarnings > 0 ? 
        ((item.totalEarnings / totals.totalEarnings) * 100).toFixed(1) : '0.0'
    }));

    setChartData(dataArray);
  };

  // ✅ Prepare time series data
  const prepareTimeSeriesData = (vendorsData) => {
    const timeData = [
      { 
        period: 'Today', 
        earnings: totals.todayEarnings || 0, 
        orders: vendorsData.reduce((sum, v) => sum + (v.orders?.today || 0), 0)
      },
      { 
        period: 'This Week', 
        earnings: totals.weeklyEarnings || 0, 
        orders: vendorsData.reduce((sum, v) => sum + (v.orders?.weekly || 0), 0)
      },
      { 
        period: 'This Month', 
        earnings: totals.monthlyEarnings || 0, 
        orders: vendorsData.reduce((sum, v) => sum + (v.orders?.monthly || 0), 0)
      },
      { 
        period: 'Total', 
        earnings: totals.totalEarnings || 0, 
        orders: vendorsData.reduce((sum, v) => sum + (v.orders?.total || 0), 0)
      }
    ];
    
    setTimeSeriesData(timeData);
  };

  // ✅ Get top performers
  const getTopPerformers = (count = 8) => {
    return vendors
      .filter(v => v.totalEarnings > 0)
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, count)
      .map(vendor => ({
        name: getVendorDisplayName(vendor).length > 12 ? 
          getVendorDisplayName(vendor).substring(0, 12) + '...' : 
          getVendorDisplayName(vendor),
        earnings: vendor.totalEarnings,
        orders: vendor.orders?.total || 0,
        type: getVendorDisplayType(vendor)
      }));
  };

  // ✅ Get earnings distribution
  const getEarningsDistribution = () => {
    const distribution = [
      { range: '₹0 - ₹1,000', count: vendors.filter(v => v.totalEarnings > 0 && v.totalEarnings <= 1000).length },
      { range: '₹1,001 - ₹5,000', count: vendors.filter(v => v.totalEarnings > 1000 && v.totalEarnings <= 5000).length },
      { range: '₹5,001 - ₹10,000', count: vendors.filter(v => v.totalEarnings > 5000 && v.totalEarnings <= 10000).length },
      { range: '₹10,001 - ₹20,000', count: vendors.filter(v => v.totalEarnings > 10000 && v.totalEarnings <= 20000).length },
      { range: '₹20,001+', count: vendors.filter(v => v.totalEarnings > 20000).length },
      { range: 'No Earnings', count: vendors.filter(v => 
        !v.totalEarnings || 
        v.totalEarnings === 0
      ).length }
    ];
    return distribution;
  };

  useEffect(() => {
    fetchVendorEarnings();
    fetchCutoffSettings();
  }, [period]);

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // ✅ Vendor type badge
  const getVendorTypeBadge = (vendor) => {
    const displayType = getVendorDisplayType(vendor);
    
    const typeMap = {
      'food': { variant: 'primary', icon: 'fa-utensils' },
      'pharmacy': { variant: 'success', icon: 'fa-pills' },
      'lab': { variant: 'info', icon: 'fa-flask' },
      'doctor': { variant: 'warning', icon: 'fa-user-md' },
      'clinic-doctor': { variant: 'danger', icon: 'fa-hospital-user' },
      'clinic': { variant: 'secondary', icon: 'fa-hospital' }
    };
    
    const typeConfig = typeMap[displayType] || { variant: 'secondary', icon: 'fa-store' };
    
    let displayText = displayType?.replace('-', ' ').toUpperCase() || 'UNKNOWN';
    
    return (
      <span className={`badge bg-${typeConfig.variant} d-inline-flex align-items-center`}>
        <i className={`fas ${typeConfig.icon} me-1`}></i>
        {displayText}
      </span>
    );
  };

  // ✅ Get vendor type color
  const getVendorTypeColor = (vendor) => {
    const displayType = getVendorDisplayType(vendor);
    
    const colorMap = {
      'food': '#4e73df',
      'pharmacy': '#1cc88a',
      'lab': '#36b9cc',
      'doctor': '#f6c23e',
      'clinic-doctor': '#e74a3b',
      'clinic': '#6c757d'
    };
    return colorMap[displayType] || '#858796';
  };

  // ✅ Chart colors
  const CHART_COLORS = {
    food: '#4e73df',
    pharmacy: '#1cc88a',
    lab: '#36b9cc',
    doctor: '#f6c23e',
    'clinic-doctor': '#e74a3b',
    clinic: '#6c757d',
    primary: '#4e73df',
    success: '#1cc88a',
    info: '#36b9cc',
    warning: '#f6c23e',
    danger: '#e74a3b',
    secondary: '#858796',
  };

  // ✅ Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 border shadow-sm rounded">
          <p className="font-weight-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="mb-0" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Earnings') || entry.name.includes('Revenue') 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ✅ Clinic vendor earnings data
  const getClinicEarningsData = (vendorDetails) => {
    if (!vendorDetails || !vendorDetails.earnings) return null;
    
    const earnings = vendorDetails.earnings;
    
    return {
      totalEarnings: earnings.summary?.totalEarnings || 0,
      totalRevenue: earnings.summary?.totalRevenue || 0,
      totalOrders: earnings.summary?.totalOrders || 0,
      
      todayEarnings: earnings.summary?.todayEarnings || 0,
      todayRevenue: earnings.summary?.todayRevenue || 0,
      todayOrders: earnings.summary?.todayOrders || 0,
      
      weeklyEarnings: earnings.summary?.weeklyEarnings || 0,
      weeklyRevenue: earnings.summary?.weeklyRevenue || 0,
      weeklyOrders: earnings.summary?.weeklyOrders || 0,
      
      monthlyEarnings: earnings.summary?.monthlyEarnings || 0,
      monthlyRevenue: earnings.summary?.monthlyRevenue || 0,
      monthlyOrders: earnings.summary?.monthlyOrders || 0,
      
      cutoffPercentage: earnings.summary?.cutoffPercentage || (cutoffSettings?.clinicCutoff || 5),
      adminEarnings: earnings.summary?.adminEarnings || 0
    };
  };

  // ✅ Doctor vendor earnings
  const getDoctorEarningsData = (vendorDetails) => {
    if (!vendorDetails || !vendorDetails.earnings) return null;
    
    const earnings = vendorDetails.earnings;
    const vendor = vendorDetails.vendor;
    
    return {
      totalEarnings: earnings.total?.earnings || 0,
      totalRevenue: earnings.total?.revenue || 0,
      totalOrders: earnings.total?.orders || 0,
      
      todayEarnings: earnings.today?.earnings || 0,
      todayRevenue: earnings.today?.revenue || 0,
      todayOrders: earnings.today?.orders || 0,
      
      weeklyEarnings: earnings.weekly?.earnings || 0,
      weeklyRevenue: earnings.weekly?.revenue || 0,
      weeklyOrders: earnings.weekly?.orders || 0,
      
      monthlyEarnings: earnings.monthly?.earnings || 0,
      monthlyRevenue: earnings.monthly?.revenue || 0,
      monthlyOrders: earnings.monthly?.orders || 0,
      
      cutoffPercentage: earnings.cutoffPercentage || (cutoffSettings?.doctorCutoff || 5),
      adminEarnings: (earnings.total?.revenue || 0) * ((earnings.cutoffPercentage || 5) / 100),
      
      // ✅ Free consultation stats
      freeConsultationStats: vendor?.freeConsultationStats || null
    };
  };

  // ✅ Get earnings data based on vendor type
  const getEarningsData = (vendorDetails) => {
    if (!vendorDetails) return null;
    
    const vendorType = vendorDetails.vendor?.type;
    
    if (vendorType === 'doctor') {
      return getDoctorEarningsData(vendorDetails);
    } else if (vendorType === 'clinic') {
      return getClinicEarningsData(vendorDetails);
    } else {
      const earnings = vendorDetails.earnings || {};
      return {
        totalEarnings: earnings.summary?.totalEarnings || 0,
        totalRevenue: earnings.summary?.totalRevenue || 0,
        totalOrders: earnings.summary?.totalOrders || 0,
        
        todayEarnings: earnings.summary?.todayEarnings || 0,
        todayRevenue: earnings.summary?.todayRevenue || 0,
        todayOrders: earnings.summary?.todayOrders || 0,
        
        weeklyEarnings: earnings.summary?.weeklyEarnings || 0,
        weeklyRevenue: earnings.summary?.weeklyRevenue || 0,
        weeklyOrders: earnings.summary?.weeklyOrders || 0,
        
        monthlyEarnings: earnings.summary?.monthlyEarnings || 0,
        monthlyRevenue: earnings.summary?.monthlyRevenue || 0,
        monthlyOrders: earnings.summary?.monthlyOrders || 0,
        
        cutoffPercentage: (cutoffSettings && vendorType) ? 
          `${getCutoffPercentage(vendorType)}%` : '5%',
        adminEarnings: earnings.summary?.adminEarnings || 0
      };
    }
  };

  // ✅ Get cutoff percentage for vendor type
  const getCutoffPercentage = (vendorType) => {
    if (!cutoffSettings) return 5;
    
    switch (vendorType) {
      case 'food': return cutoffSettings.foodCutoff || 5;
      case 'pharmacy': return cutoffSettings.pharmacyCutoff || 5;
      case 'lab': return cutoffSettings.labCutoff || 5;
      case 'doctor': return cutoffSettings.doctorCutoff || 5;
      case 'clinic': return cutoffSettings.clinicCutoff || 5;
      case 'membership': return cutoffSettings.membershipCutoff || 20;
      default: return 5;
    }
  };

  // ✅ Cutoff Settings Display
  const CutoffSettingsPanel = () => {
    if (!cutoffSettings) return null;
    
    const cutoffData = [
      { type: 'Food', percentage: cutoffSettings.foodCutoff || 5, color: CHART_COLORS.food },
      { type: 'Pharmacy', percentage: cutoffSettings.pharmacyCutoff || 5, color: CHART_COLORS.pharmacy },
      { type: 'Lab', percentage: cutoffSettings.labCutoff || 5, color: CHART_COLORS.lab },
      { type: 'Doctor', percentage: cutoffSettings.doctorCutoff || 5, color: CHART_COLORS.doctor },
      { type: 'Clinic', percentage: cutoffSettings.clinicCutoff || 5, color: CHART_COLORS.clinic },
      { type: 'Membership', percentage: cutoffSettings.membershipCutoff || 20, color: CHART_COLORS.secondary },
    ];
    
    return (
      <div className="card border-info mb-4">
        <div className="card-header bg-info text-white">
          <h6 className="m-0 font-weight-bold">
            <i className="fas fa-percentage me-2"></i>
            Platform Cutoff Settings
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            {cutoffData.map((item, index) => (
              <div key={index} className="col-md-4 mb-3">
                <div 
                  className="border rounded p-3 text-center"
                  style={{ 
                    background: `${item.color}10`,
                    borderLeft: `4px solid ${item.color}`
                  }}
                >
                  <div className="h4 mb-1" style={{ color: item.color }}>
                    {item.percentage}%
                  </div>
                  <div className="text-muted small">{item.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ✅ Dashboard Graphs
  const DashboardGraphs = () => {
    if (vendors.length === 0) return null;
    
    return (
      <>
        {/* Cutoff Settings */}
        <CutoffSettingsPanel />
        
        {/* Main Charts Row */}
        <div className="row mb-4">
          {/* Vendor Type Distribution */}
          <div className="col-xl-4 col-md-6 mb-4">
            <div className="card shadow h-100">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">
                  Vendor Type Distribution
                </h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count, percentage }) => 
                        `${type}\n${count} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getVendorTypeColor({ type: entry.typeKey }) || CHART_COLORS.secondary} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Earnings by Vendor Type */}
          <div className="col-xl-8 col-md-6 mb-4">
            <div className="card shadow h-100">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-success">
                  Earnings by Vendor Type
                </h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="totalEarnings" name="Total Earnings" fill={CHART_COLORS.primary} />
                    <Bar dataKey="todayEarnings" name="Today Earnings" fill={CHART_COLORS.success} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Performing Vendors */}
          <div className="col-xl-6 col-md-12 mb-4">
            <div className="card shadow h-100">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-warning">
                  Top Performing Vendors
                </h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={getTopPerformers()} 
                    layout="vertical"
                    margin={{ left: 100, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="earnings" 
                      name="Total Earnings" 
                      fill={CHART_COLORS.warning}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Earnings Distribution */}
          <div className="col-xl-6 col-md-12 mb-4">
            <div className="card shadow h-100">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-secondary">
                  Earnings Distribution
                </h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={getEarningsDistribution()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Vendor Count" fill={CHART_COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ✅ Vendor Details Panel
  const VendorDetailsPanel = () => {
    if (!vendorDetails || !vendorDetails.vendor) return null;

    const vendor = vendorDetails.vendor;
    const earningsData = getEarningsData(vendorDetails);
    const recentOrders = vendorDetails.recentOrders || [];

    // Prepare vendor-specific chart data
    const vendorChartData = [
      { period: 'Today', earnings: earningsData?.todayEarnings || 0, revenue: earningsData?.todayRevenue || 0 },
      { period: 'This Week', earnings: earningsData?.weeklyEarnings || 0, revenue: earningsData?.weeklyRevenue || 0 },
      { period: 'This Month', earnings: earningsData?.monthlyEarnings || 0, revenue: earningsData?.monthlyRevenue || 0 },
      { period: 'Total', earnings: earningsData?.totalEarnings || 0, revenue: earningsData?.totalRevenue || 0 }
    ];

    // Get vendor icon
    const getVendorIcon = (type) => {
      const iconMap = {
        'food': 'fa-utensils',
        'pharmacy': 'fa-pills',
        'lab': 'fa-flask',
        'doctor': 'fa-user-md',
        'clinic': 'fa-hospital',
        'clinic-doctor': 'fa-hospital-user'
      };
      return iconMap[type] || 'fa-store';
    };

    return (
      <div className="col-lg-6">
        <div className="card shadow mb-4">
          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 className="m-0 font-weight-bold text-primary">
              <i className={`fas ${getVendorIcon(vendor.type)} me-2`}></i>
              Vendor Analytics: {getVendorDisplayName(vendor)}
              <small className="text-muted ms-2">({getVendorDisplayType(vendor)})</small>
            </h6>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSelectedVendor(null);
                setVendorDetails(null);
              }}
            >
              <i className="fas fa-times me-1"></i>
              Close
            </button>
          </div>
          <div className="card-body">
            {detailsLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading vendor details...</p>
              </div>
            ) : (
              <>
                {/* Vendor Information */}
                <div className="card bg-light mb-4">
                  <div className="card-header">
                    <h6 className="m-0 font-weight-bold text-dark">
                      <i className="fas fa-info-circle me-2"></i>
                      Vendor Information
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <strong>Name:</strong> {vendor.name}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Type:</strong> {getVendorTypeBadge(vendor)}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Email:</strong> {vendor.email || 'N/A'}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Phone:</strong> {vendor.phone || 'N/A'}
                      </div>
                      {getVendorDisplayShopName(vendor) && getVendorDisplayShopName(vendor) !== 'N/A' && (
                        <div className="col-12 mb-2">
                          <strong>Business/Clinic Name:</strong> {getVendorDisplayShopName(vendor)}
                        </div>
                      )}
                      
                      {/* ✅ Free Consultation Information for Doctors */}
                      {vendor.type === 'doctor' && vendor.freeConsultationStats && (
                        <div className="col-12 mb-2">
                          <div className="border rounded p-3 bg-white">
                            <h6 className="mb-2">Consultation Information</h6>
                            <div className="row">
                              <div className="col-md-6">
                                <strong>Total Consultations:</strong> {vendor.freeConsultationStats.totalCount}
                              </div>
                              <div className="col-md-6">
                                <strong>Paid Consultations:</strong> {vendor.freeConsultationStats.paidCount}
                              </div>
                              <div className="col-md-6">
                                <strong>Free Consultations:</strong> {vendor.freeConsultationStats.count}
                              </div>
                              <div className="col-md-6">
                                <strong>Membership Cutoff:</strong> {vendor.freeConsultationStats.membershipCutoffPercentage}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {vendor.qualification && (
                        <div className="col-md-6 mb-2">
                          <strong>Qualification:</strong> {vendor.qualification}
                        </div>
                      )}
                      {vendor.specialist && (
                        <div className="col-md-6 mb-2">
                          <strong>Specialist:</strong> {vendor.specialist}
                        </div>
                      )}
                      <div className="col-12">
                        <strong>Status:</strong> 
                        <span className={`badge ${vendor.isActive ? 'bg-success' : 'bg-danger'} ms-2`}>
                          {vendor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendor Performance Chart */}
                <div className="card border-primary mb-4">
                  <div className="card-header bg-primary text-white">
                    <h6 className="m-0 font-weight-bold">
                      <i className="fas fa-chart-line me-2"></i>
                      Performance Overview
                    </h6>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={vendorChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="earnings" name="Vendor Earnings" fill={CHART_COLORS.primary} />
                        <Bar dataKey="revenue" name="Total Revenue" fill={CHART_COLORS.success} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Earnings Summary */}
                <div className="card border-success mb-4">
                  <div className="card-header bg-success text-white">
                    <h6 className="m-0 font-weight-bold">
                      <i className="fas fa-chart-line me-2"></i>
                      Earnings Summary
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="border rounded p-3 text-center bg-success bg-opacity-10">
                          <div className="text-success fw-bold h5">
                            {formatCurrency(earningsData?.totalEarnings || 0)}
                          </div>
                          <small className="text-muted">Vendor Earnings</small>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="border rounded p-3 text-center bg-info bg-opacity-10">
                          <div className="text-info fw-bold h5">
                            {earningsData?.totalOrders || 0}
                          </div>
                          <small className="text-muted">Total Orders</small>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <hr />
                        <div className="row">
                          <div className="col-md-6 mb-2">
                            <strong>Today:</strong> {formatCurrency(earningsData?.todayEarnings || 0)}
                            <span className="badge bg-primary ms-2">
                              {earningsData?.todayOrders || 0} orders
                            </span>
                          </div>
                          <div className="col-md-6 mb-2">
                            <strong>This Week:</strong> {formatCurrency(earningsData?.weeklyEarnings || 0)}
                            <span className="badge bg-info ms-2">
                              {earningsData?.weeklyOrders || 0} orders
                            </span>
                          </div>
                          <div className="col-md-6 mb-2">
                            <strong>This Month:</strong> {formatCurrency(earningsData?.monthlyEarnings || 0)}
                            <span className="badge bg-warning ms-2">
                              {earningsData?.monthlyOrders || 0} orders
                            </span>
                          </div>
                          <div className="col-md-6 mb-2">
                            <strong>Platform Cutoff:</strong> {earningsData?.cutoffPercentage || '5%'}
                          </div>
                          <div className="col-12 mb-2">
                            <strong>Total Revenue:</strong> 
                            <span className="fw-bold text-primary ms-2">
                              {formatCurrency(earningsData?.totalRevenue || 0)}
                            </span>
                          </div>
                          <div className="col-12 mb-2">
                            <strong>Admin Earnings:</strong> 
                            <span className="fw-bold text-warning ms-2">
                              {formatCurrency(earningsData?.adminEarnings || 0)}
                            </span>
                          </div>
                          
                          {/* ✅ Free Consultation Financials for Doctors */}
                          {vendor.type === 'doctor' && earningsData?.freeConsultationStats && (
                            <>
                              <div className="col-12 mt-3">
                                <h6 className="border-bottom pb-2">Consultation Financials</h6>
                              </div>
                              <div className="col-md-6 mb-2">
                                <strong>Free Consultations Value:</strong> 
                                <span className="ms-2">
                                  {formatCurrency(earningsData.freeConsultationStats.originalRevenue || 0)}
                                </span>
                              </div>
                              <div className="col-md-6 mb-2">
                                <strong>Doctor Payout (Free):</strong> 
                                <span className="ms-2">
                                  {formatCurrency(earningsData.freeConsultationStats.doctorPayout || 0)}
                                </span>
                              </div>
                              <div className="col-md-6 mb-2">
                                <strong>Admin Earnings (Free):</strong> 
                                <span className="ms-2">
                                  {formatCurrency(earningsData.freeConsultationStats.adminEarnings || 0)}
                                </span>
                              </div>
                              <div className="col-md-6 mb-2">
                                <strong>Applied Cutoff:</strong> 
                                <span className="ms-2">
                                  {earningsData.freeConsultationStats.membershipCutoffPercentage || 20}%
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="card">
                  <div className="card-header">
                    <h6 className="m-0 font-weight-bold">
                      <i className="fas fa-receipt me-2"></i>
                      Recent Orders ({recentOrders.length})
                    </h6>
                  </div>
                  <div className="card-body">
                    {recentOrders.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm table-striped">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.map((order, index) => (
                              <tr key={index}>
                                <td className="font-monospace small">
                                  {order.orderId || order._id?.toString().slice(-8) || 'N/A'}
                                </td>
                                <td>
                                  {order.customer?.name || 'N/A'}
                                  {order.customer?.email && (
                                    <div className="text-muted small">{order.customer.email}</div>
                                  )}
                                </td>
                                <td className="fw-bold text-success">
                                  {formatCurrency(order.amount || 0)}
                                </td>
                                <td>
                                  <span className={`badge ${
                                    order.status === '7' || order.status === '8' ? 'bg-success' : 
                                    order.status === '3' ? 'bg-warning' : 
                                    order.status === '1' ? 'bg-info' : 
                                    order.status === '0' ? 'bg-secondary' : 'bg-danger'
                                  }`}>
                                    {order.status === '7' || order.status === '8' ? 'Completed' : 
                                     order.status === '3' ? 'Confirmed' : 
                                     order.status === '1' ? 'Pending' : 
                                     order.status === '0' ? 'Cancelled' : `Status ${order.status}`}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge bg-${order.type === 'food' ? 'primary' : order.type === 'pharmacy' ? 'success' : order.type === 'lab' ? 'info' : order.type === 'clinic' ? 'danger' : 'warning'}`}>
                                    {order.type || 'doctor'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <i className="fas fa-receipt fa-2x text-muted mb-2"></i>
                        <p className="text-muted">No recent orders found</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Vendor Earnings Dashboard</h1>
        <div className="d-flex">
          <select 
            className="form-select form-select-sm me-2 w-auto"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button 
            className="btn btn-primary btn-sm"
            onClick={fetchVendorEarnings}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" />
                Refreshing...
              </>
            ) : (
              <>
                <i className="fas fa-sync me-1"></i>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dashboard Graphs */}
      <DashboardGraphs />

      <div className="row">
        {/* Vendor List */}
        <div className={`col-lg-${selectedVendor ? '6' : '12'}`}>
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 font-weight-bold text-primary">
                Vendor List {vendors.length > 0 && `(${vendors.length} vendors)`}
              </h6>
              <div className="d-flex align-items-center">
                <span className="text-muted me-2 small">Period:</span>
                <select 
                  className="form-select form-select-sm w-auto"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading vendor earnings...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="thead-dark">
                      <tr>
                        <th>Vendor Name</th>
                        <th>Type</th>
                        <th>Business/Clinic Name</th>
                        <th>Total Earnings</th>
                        <th>Today</th>
                        <th>Orders</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((vendor) => (
                        <tr 
                          key={vendor._id} 
                          className={selectedVendor === vendor._id ? 'table-active' : ''}
                          style={{ 
                            borderLeft: `4px solid ${getVendorTypeColor(vendor)}`
                          }}
                        >
                          <td>
                            <div>
                              <strong className="d-block">{getVendorDisplayName(vendor)}</strong>
                              {vendor.email && vendor.email !== 'N/A' && (
                                <div className="text-muted small">{vendor.email}</div>
                              )}
                              {vendor.type === 'doctor' && vendor.hasClinic && (
                                <div className="mt-1">
                                  <small className="badge bg-light text-dark border">
                                    <i className="fas fa-hospital me-1"></i>
                                    Clinic ID: {vendor.clinicId}
                                  </small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {getVendorTypeBadge(vendor)}
                          </td>
                          <td>
                            <div>
                              <span className="fw-medium">{getVendorDisplayShopName(vendor)}</span>
                              {vendor.type === 'doctor' && vendor.qualification && (
                                <div className="text-muted small mt-1">
                                  {vendor.qualification} • {vendor.specialist}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="fw-bold text-success">
                            {formatCurrency(vendor.totalEarnings)}
                          </td>
                          <td className={vendor.todayEarnings > 0 ? 'fw-bold text-primary' : 'text-muted'}>
                            {formatCurrency(vendor.todayEarnings)}
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span className="badge bg-info mb-1">Total: {vendor.orders?.total || 0}</span>
                              {vendor.todayEarnings > 0 && (
                                <span className="badge bg-success">Today: {vendor.orders?.today || 0}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${vendor.isActive ? 'bg-success' : 'bg-danger'}`}>
                              {vendor.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => fetchVendorDetails(vendor._id)}
                              disabled={detailsLoading && selectedVendor === vendor._id}
                              title="View detailed earnings"
                            >
                              {detailsLoading && selectedVendor === vendor._id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-eye me-1"></i>
                                  Details
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {vendors.length === 0 && !loading && (
                    <div className="text-center py-5">
                      <i className="fas fa-store fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">No vendors found</h5>
                      <p className="text-muted">
                        {debugInfo?.vendorsInDB > 0 
                          ? 'Vendors found but no earnings data available.' 
                          : 'No vendors found in the system.'
                        }
                      </p>
                      <button 
                        className="btn btn-primary"
                        onClick={fetchVendorEarnings}
                      >
                        <i className="fas fa-sync me-1"></i>
                        Refresh Data
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Details Panel */}
        <VendorDetailsPanel />
      </div>
    </div>
  );
};

export default VendorEarnings;