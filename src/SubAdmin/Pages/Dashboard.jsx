import React, { useState, useContext, useEffect, useRef } from 'react';
import { MyContext } from '../../Context/Context';
import { Tab, Tabs, Alert, Spinner, Badge, Button, Card, Row, Col, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';

// Chart.js components register करें
ChartJS.register(
  Title, Tooltip, Legend, ArcElement, 
  CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement
);

const SubAdminDashboard = () => {
  const { 
    getSubAdminDashboardStats,
    getSubAdminRecentRegistrations,
    getSubAdminVerificationRequests,
    getSubAdminProfile,
    getSubAdminMonthlyStats
  } = useContext(MyContext);
  
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState({});
  const [verificationRequests, setVerificationRequests] = useState({});
  const [subAdminProfile, setSubAdminProfile] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // डैशबोर्ड डेटा लोड करें
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsResponse, profileResponse, monthlyResponse] = await Promise.all([
        getSubAdminDashboardStats(),
        getSubAdminProfile(),
        getSubAdminMonthlyStats()
      ]);

      if (statsResponse.success) {
        setDashboardData(statsResponse.data);
      } else {
        setError(statsResponse.message || 'Failed to load dashboard stats');
      }

      if (profileResponse.success) {
        setSubAdminProfile(profileResponse.data);
      }

      if (monthlyResponse.success) {
        setMonthlyStats(monthlyResponse.data);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Last 12 months generate करने का function
  const getLast12Months = () => {
    const months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const monthName = monthNames[date.getMonth()];
      months.push({
        year,
        month,
        label: `${monthName} ${year}`,
        key: `${year}-${month}`
      });
    }
    
    return months;
  };

  const loadDataForTab = (type) => {
    if (!recentRegistrations[type]) {
      loadRecentRegistrations(type);
    }
    if ((type === 'clinics' || type === 'doctors') && !verificationRequests[type]) {
      loadVerificationRequests(type);
    }
  };
  
  const loadRecentRegistrations = async (type) => {
    try {
      const response = await getSubAdminRecentRegistrations(type, 5);
      if (response.success) {
        setRecentRegistrations(prev => ({
          ...prev,
          [type]: response.data
        }));
      }
    } catch (err) {
      console.error('Error loading recent registrations:', err);
    }
  };

  const loadVerificationRequests = async (type) => {
    try {
      const response = await getSubAdminVerificationRequests(type);
      if (response.success) {
        setVerificationRequests(prev => ({
          ...prev,
          [type]: response.data
        }));
      }
    } catch (err) {
      console.error('Error loading verification requests:', err);
    }
  };

  const handleCardClick = (path) => {
    navigate(path);
  };

  // Chart Data Preparation Functions - LAST 12 MONTHS DATA
  const prepareDoctorBarChartData = () => {
    if (!stats?.permissions?.doctors) return null;
    
    const last12Months = getLast12Months();
    
    const barChartData = {
      labels: last12Months.map(month => month.label),
      datasets: [
        {
          label: "Number of Doctors",
          data: last12Months.map(month => {
            const stat = (monthlyStats?.doctors || []).find(d => 
              d.year === month.year && d.month === month.month
            );
            return stat ? stat.count : 0;
          }),
          backgroundColor: last12Months.map((_, index) =>
            index < 6 ? "#3D3F96" : "red"
          ),
          borderColor: "#1e88e5",
          borderWidth: 1,
        },
      ],
    };
    
    return barChartData;
  };

  const prepareUserBarChartData = () => {
    if (!stats?.permissions?.users) return null;
    
    const last12Months = getLast12Months();
    
    const barChartData1 = {
      labels: last12Months.map(month => month.label),
      datasets: [
        {
          label: "Number of Users",
          data: last12Months.map(month => {
            const stat = (monthlyStats?.users || []).find(u => 
              u.year === month.year && u.month === month.month
            );
            return stat ? stat.count : 0;
          }),
          backgroundColor: last12Months.map((_, index) =>
            index % 2 === 0 ? "red" : "#3D3F96"
          ),
          borderColor: "#1e88e5",
          borderWidth: 1,
        },
      ],
    };
    
    return barChartData1;
  };

  const prepareLabDoughnutChartData = () => {
    if (!stats?.permissions?.vendors?.lab) return null;
    
    const last12Months = getLast12Months();
    
    const doughnutChartData = {
      labels: last12Months.map(month => month.label),
      datasets: [
        {
          label: "Monthly Lab Stats",
          data: last12Months.map(month => {
            const stat = (monthlyStats?.vendors?.lab || []).find(v => 
              v.year === month.year && v.month === month.month
            );
            return stat ? stat.count : 0;
          }),
          backgroundColor: last12Months.map((_, index) =>
            index % 2 === 0 ? "#3D3F96" : "red"
          ),
          hoverOffset: 8,
        },
      ],
    };

    return doughnutChartData;
  };

  const preparePharmacyBarChartData = () => {
    if (!stats?.permissions?.vendors?.pharmacy) return null;
    
    const last12Months = getLast12Months();
    
    const barChartData3 = {
      labels: last12Months.map(month => month.label),
      datasets: [
        {
          label: "Number of Pharmacies",
          data: last12Months.map(month => {
            const stat = (monthlyStats?.vendors?.pharmacy || []).find(p => 
              p.year === month.year && p.month === month.month
            );
            return stat ? stat.count : 0;
          }),
          backgroundColor: last12Months.map((_, index) =>
            index % 2 === 0 ? "red" : "#3D3F96"
          ),
          borderColor: "#1e88e5",
          borderWidth: 1,
        },
      ],
    };

    return barChartData3;
  };

  const prepareFoodBarChartData = () => {
    if (!stats?.permissions?.vendors?.food) return null;
    
    const last12Months = getLast12Months();
    
    const barChartData4 = {
      labels: last12Months.map(month => month.label),
      datasets: [
        {
          label: "Number of Food Vendors",
          data: last12Months.map(month => {
            const stat = (monthlyStats?.vendors?.food || []).find(f => 
              f.year === month.year && f.month === month.month
            );
            return stat ? stat.count : 0;
          }),
          backgroundColor: last12Months.map((_, index) =>
            index % 2 === 0 ? "#e74c3c" : "#3498db"
          ),
          borderColor: "#1e88e5",
          borderWidth: 1,
        },
      ],
    };

    return barChartData4;
  };

  // Chart Options - EXACT SAME AS ADMIN DASHBOARD
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 18,
            family: "Arial",
          },
          color:"black",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        title: {
          display: true,
          text: "Doctors",
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  const barChartOptions1 = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 18,
            family: "Arial",
          },
          color: "#333",
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        title: {
          display: true,
          text: "Users",
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          font: {
            size: 12,
            family: "Arial",
          },
          color: "#333",
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (tooltipItem) {
            const count = tooltipItem.raw;
            const month = tooltipItem.chart.data.labels[tooltipItem.dataIndex];
            return `${month}: ${count} labs`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  const barChartOptions3 = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 18,
            family: "Arial",
          },
          color: "#333",
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        title: {
          display: true,
          text: "Pharmacies",
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  const barChartOptions4 = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 18,
            family: "Arial",
          },
          color: "#333",
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        title: {
          display: true,
          text: "Food Vendors",
        },
        ticks: {
          stepSize: 1,
          beginAtZero: true,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  // डैशबोर्ड आँकड़े कार्ड
  const StatCard = ({ title, value, icon, color, change, onClick }) => (
    <Col md={3} className="mb-3">
      <Card 
        className={`border-0 bg-${color} bg-opacity-10`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="card-title text-muted">{title}</h6>
              <h3 className="mb-0">{value || 0}</h3>
              {change && (
                <small className="text-muted">{change}</small>
              )}
            </div>
            <div className={`bg-${color} bg-opacity-25 p-3 rounded`}>
              <i className={`bi ${icon} fs-2 text-${color}`}></i>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  // हाल के पंजीकरण की तालिका
  const RecentTable = ({ type, data }) => (
    <Card className="border-0">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Recent {type.charAt(0).toUpperCase() + type.slice(1)}</h5>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={() => loadRecentRegistrations(type)}
        >
          Refresh
        </Button>
      </Card.Header>
      <Card.Body>
        {!data || data.length === 0 ? (
          <p className="text-muted text-center">No recent {type} found</p>
        ) : (
          <Table responsive>
             <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.name || item.business || item.clinicName}</td>
                  <td>{item.email}</td>
                  <td>
                    <Badge 
                      bg={
                        item.isActive !== undefined ? 
                        (item.isActive ? 'success' : 'warning') :
                        item.Accountverify === '1' ? 'success' :
                        item.Accountverify === '0' ? 'warning' : 'danger'
                      }
                    >
                      {item.isActive !== undefined ? 
                        (item.isActive ? 'Active' : 'Inactive') :
                        item.Accountverify === '1' ? 'Verified' :
                        item.Accountverify === '0' ? 'Pending' : 'Rejected'
                      }
                    </Badge>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );

  // सत्यापन अनुरोधों की तालिका
  const VerificationTable = ({ type, data }) => (
    <Card className="border-0 mt-4">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Pending {type} Verifications</h5>
        <Button 
          variant="outline-warning" 
          size="sm"
          onClick={() => loadVerificationRequests(type)}
        >
          Refresh
        </Button>
      </Card.Header>
      <Card.Body>
        {!data || data.length === 0 ? (
          <p className="text-muted text-center">No pending verifications</p>
        ) : (
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.name || item.clinicName}</td>
                  <td>{item.email}</td>
                  <td>{item.phoneNumber || item.phone}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" onClick={() => navigate(`/admin/${type}/verify/${item._id}`)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <div className="container-fluid my-4 text-center">
        <Spinner animation="border" role="status" className="me-2" />
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid my-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={loadDashboardData}>
          Retry
        </Button>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const doctorBarChartData = prepareDoctorBarChartData();
  const userBarChartData = prepareUserBarChartData();
  const labDoughnutChartData = prepareLabDoughnutChartData();
  const pharmacyBarChartData = preparePharmacyBarChartData();
  const foodBarChartData = prepareFoodBarChartData();

  // Total calculations for summary
  const totalDoctors = (monthlyStats?.doctors || []).reduce((total, stat) => total + stat.count, 0);
  const totalUsers = (monthlyStats?.users || []).reduce((total, stat) => total + stat.count, 0);
  const totalLabs = (monthlyStats?.vendors?.lab || []).reduce((total, stat) => total + stat.count, 0);
  const totalPharmacies = (monthlyStats?.vendors?.pharmacy || []).reduce((total, stat) => total + stat.count, 0);
  const totalFoodVendors = (monthlyStats?.vendors?.food || []).reduce((total, stat) => total + stat.count, 0);

  // Check which vendor permissions are available
  const hasLabPermission = stats?.permissions?.vendors?.lab;
  const hasPharmacyPermission = stats?.permissions?.vendors?.pharmacy;
  const hasFoodPermission = stats?.permissions?.vendors?.food;
  const hasDoctorPermission = stats?.permissions?.doctors;
  const hasUserPermission = stats?.permissions?.users;

  // Calculate how many vendor charts to show for proper layout
  const vendorChartsCount = [hasLabPermission, hasPharmacyPermission, hasFoodPermission].filter(Boolean).length;

  return (
    <div className="container-fluid my-4">
      {/* हैडर */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>SubAdmin Dashboard</h2>
          {subAdminProfile && (
            <p className="text-muted mb-0">
              Welcome back, <strong>{subAdminProfile.name}</strong>
            </p>
          )}
        </div>
        <div>
          <Button variant="outline-primary" size="sm" onClick={loadDashboardData}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </Button>
        </div>
      </div>

      {/* डैशबोर्ड आँकड़े */}
      {stats && (
        <Row className="mb-4">
          {/* उपयोगकर्ता आँकड़े */}
          {stats.permissions?.users && (
            <StatCard
              title="Total Users"
              value={stats.users.total}
              icon="bi-people"
              color="primary"
              change={`${stats.recentActivities?.newUsers || 0} new`}
              onClick={() => handleCardClick('/subadmin-dashboard/user')}
            />
          )}

          {/* लैब वेंडर आँकड़े */}
          {stats.permissions?.vendors?.lab && (
            <StatCard
              title="Lab Vendors"
              value={stats.vendors.byType.lab}
              icon="bi-eyedropper"
              color="info"
              onClick={() => handleCardClick('/subadmin-dashboard/lab')}
            />
          )}

          {/* फ़ूड वेंडर आँकड़े */}
          {stats.permissions?.vendors?.food && (
            <StatCard
              title="Food Vendors"
              value={stats.vendors.byType.food}
              icon="bi-egg-fried"
              color="success"
              onClick={() => handleCardClick('/subadmin-dashboard/food')}
            />
          )}

          {/* फ़ार्मेसी वेंडर आँकड़े */}
          {stats.permissions?.vendors?.pharmacy && (
            <StatCard
              title="Pharmacy Vendors"
              value={stats.vendors.byType.pharmacy}
              icon="bi-capsule"
              color="danger"
              onClick={() => handleCardClick('/subadmin-dashboard/pharmacy')}
            />
          )}

          {/* डॉक्टर आँकड़े */}
          {stats.permissions?.doctors && (
            <StatCard
              title="Total Doctors"
              value={stats.doctors.total}
              icon="bi-person-badge"
              color="secondary"
              change={`${stats.recentActivities?.newDoctors || 0} new`}
              onClick={() => handleCardClick('/subadmin-dashboard/doctor')}
            />
          )}

          {/* क्लिनिक आँकड़े */}
          {stats.permissions?.clinics && (
            <StatCard
              title="Total Clinics"
              value={stats.clinics.total}
              icon="bi-hospital"
              color="warning"
              change={`${stats.recentActivities?.newClinics || 0} new`}
              onClick={() => handleCardClick('/subadmin-dashboard/clinic')}
            />
          )}
        </Row>
      )}

      {/* विस्तृत दृश्यों के लिए टैब */}
      <Tabs activeKey={activeTab} onSelect={(k) => {setActiveTab(k); loadDataForTab(k);}} className="mb-3">
        {/* अवलोकन टैब */}
        <Tab eventKey="overview" title="Overview">
          {/* Charts Section - PERMISSION BASED */}
          <div className="container">
            {/* Doctors and Users Row */}
            <div className="row">
              {/* Doctors Chart - Only if permission exists */}
              {hasDoctorPermission && (
                <div className="col-md-6 border py-3 border-2 d-flex justify-content-center align-items-center">
                  <div className="chart-container">
                    <div className="leftside-chart">
                      {doctorBarChartData ? (
                        <Bar data={doctorBarChartData} options={barChartOptions} />
                      ) : (
                        <p className="text-center">No Doctor data available for chart</p>
                      )}
                    </div>
                    <p className="chart-summary">
                      Total Doctors: {totalDoctors}
                    </p>
                  </div>
                </div>
              )}

              {/* Users Chart - Only if permission exists */}
              {hasUserPermission && (
                <div className="col-md-6 border py-3 border-2 d-flex justify-content-center align-items-center">
                  <div className="chart-container">
                    <div className="rightside-chart">
                      {userBarChartData ? (
                        <Bar data={userBarChartData} options={barChartOptions1} />
                      ) : (
                        <p className="text-center">No User data available for chart</p>
                      )}
                    </div>
                    <p className="chart-summary">
                      Total Users: {totalUsers}
                    </p>
                  </div>
                </div>
              )}

              {/* If only one chart in this row, center it */}
              {(hasDoctorPermission && !hasUserPermission) && (
                <div className="col-md-3"></div>
              )}
              {(!hasDoctorPermission && hasUserPermission) && (
                <div className="col-md-3"></div>
              )}
            </div>

            {/* Vendor Charts Section - Only show if at least one vendor permission exists */}
            {(hasLabPermission || hasPharmacyPermission || hasFoodPermission) && (
              <>
                <h4 className="py-3 text-center abhiii">
                  Vendor Charts
                </h4>

                <div className="row justify-content-center">
                  {/* Labs Chart - Only if permission exists */}
                  {hasLabPermission && (
                    <div className={`col-md-${vendorChartsCount === 1 ? '6' : '6'} border py-3 border-2 d-flex justify-content-center align-items-center`}>
                      <div className="chart-container">
                        <div className="leftside-chart">
                          {labDoughnutChartData ? (
                            <Doughnut data={labDoughnutChartData} options={doughnutChartOptions} />
                          ) : (
                            <p className="text-center">No Lab data available for chart</p>
                          )}
                        </div>
                        <p className="chart-summary">
                          Total Labs: {totalLabs}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pharmacy Chart - Only if permission exists */}
                  {hasPharmacyPermission && (
                    <div className={`col-md-${vendorChartsCount === 1 ? '6' : '6'} border py-3 border-2 d-flex justify-content-center align-items-center`}>
                      <div className="chart-container">
                        <div className="rightside-chart">
                          {pharmacyBarChartData ? (
                            <Bar data={pharmacyBarChartData} options={barChartOptions3} />
                          ) : (
                            <p className="text-center">No Pharmacy data available for chart</p>
                          )}
                        </div>
                        <p className="chart-summary">
                          Total Pharmacies: {totalPharmacies}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Food Vendors Chart - Show in separate row if all three permissions exist */}
                  {hasFoodPermission && vendorChartsCount === 3 && (
                    <div className="row d-flex justify-content-center mt-3">
                      <div className="col-md-8 border py-3 border-2 d-flex justify-content-center align-items-center">
                        <div className="chart-container">
                          <div className="rightside-chart">
                            {foodBarChartData ? (
                              <Bar data={foodBarChartData} options={barChartOptions4} />
                            ) : (
                              <p className="text-center">No Food Vendor data available for chart</p>
                            )}
                          </div>
                          <p className="chart-summary">
                            Total Food Vendors: {totalFoodVendors}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Food Vendors Chart - Show in same row if only two permissions exist */}
                  {hasFoodPermission && vendorChartsCount === 2 && (
                    <div className="col-md-6 border py-3 border-2 d-flex justify-content-center align-items-center">
                      <div className="chart-container">
                        <div className="rightside-chart">
                          {foodBarChartData ? (
                            <Bar data={foodBarChartData} options={barChartOptions4} />
                          ) : (
                            <p className="text-center">No Food Vendor data available for chart</p>
                          )}
                        </div>
                        <p className="chart-summary">
                          Total Food Vendors: {totalFoodVendors}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Show message if no chart permissions */}
            {!hasDoctorPermission && !hasUserPermission && !hasLabPermission && !hasPharmacyPermission && !hasFoodPermission && (
              <div className="row">
                <div className="col-md-12 text-center py-5">
                  <h4 className="text-muted">No chart permissions available</h4>
                  <p>You don't have permissions to view any charts.</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <Row className="mt-4">
            <Col md={12}>
              <Card className="border-0">
                <Card.Header className="bg-white">
                  <h5 className="mb-0 abhiii">Recent Activities Summary</h5>
                </Card.Header>
                <Card.Body>
                  <div className="list-group list-group-flush">
                    {stats?.recentActivities?.newUsers > 0 && hasUserPermission && (
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>New Users</span>
                        <Badge bg="primary">{stats.recentActivities.newUsers}</Badge>
                      </div>
                    )}
                    {stats?.recentActivities?.newVendors > 0 && (hasLabPermission || hasPharmacyPermission || hasFoodPermission) && (
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>New Vendors</span>
                        <Badge bg="success">{stats.recentActivities.newVendors}</Badge>
                      </div>
                    )}
                    {stats?.recentActivities?.newClinics > 0 && stats?.permissions?.clinics && (
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>New Clinics</span>
                        <Badge bg="warning">{stats.recentActivities.newClinics}</Badge>
                      </div>
                    )}
                    {stats?.recentActivities?.newDoctors > 0 && hasDoctorPermission && (
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>New Doctors</span>
                        <Badge bg="info">{stats.recentActivities.newDoctors}</Badge>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        {/* अन्य टैब्स वही रहेंगे (permission based) */}
        {stats?.permissions?.vendors && (
          <Tab eventKey="vendors" title="Vendors">
            <Row>
              <Col md={8}><RecentTable type="vendors" data={recentRegistrations.vendors} /></Col>
              <Col md={4}>
                <Card className="border-0">
                  <Card.Header className="bg-white"><h5 className="mb-0">Vendor Statistics</h5></Card.Header>
                  <Card.Body>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between"><span>Total:</span> <strong>{stats.vendors.total}</strong></li>
                      <li className="list-group-item d-flex justify-content-between"><span>Active:</span> <strong>{stats.vendors.active}</strong></li>
                      {stats.permissions.vendors.lab && <li className="list-group-item d-flex justify-content-between"><span>Lab:</span> <strong>{stats.vendors.byType?.lab || 0}</strong></li>}
                      {stats.permissions.vendors.pharmacy && <li className="list-group-item d-flex justify-content-between"><span>Pharmacy:</span> <strong>{stats.vendors.byType?.pharmacy || 0}</strong></li>}
                      {stats.permissions.vendors.food && <li className="list-group-item d-flex justify-content-between"><span>Food:</span> <strong>{stats.vendors.byType?.food || 0}</strong></li>}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        )}

        {/* क्लिनिक और डॉक्टर टैब्स वही रहेंगे (permission based) */}
        
      </Tabs>

      {/* CSS Styles - EXACT SAME AS ADMIN DASHBOARD */}
      <style jsx>{`
        .vendor-avatar {
          border-radius: 50%;
          height: 50px;
          width: 50px;
          margin-left: -10px;
          object-fit: cover;
        }
        .chart-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          width: 100%;
          height: auto;
        }
        .chart-summary {
          padding: 20px;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
        }
        .refresh-btn {
          margin-top: 20px;
          padding: 10px 20px;
          border-radius: 20px;
          background-color: #3D3F96;
          color: white;
          border: none;
          cursor: pointer;
        }
        .refresh-btn:hover {
          background-color: #2A2C77;
        }
        .abhiii {
          color: #3D3F96 !important;
          font-weight: bold;
        }
        .abhiii:hover {
          color: red !important;
          transition: 2s !important;
          transform: scale(1.2) !important;
        }
        .rightside-chart label {
          font-weight: 900 !important;
        }
        .notification-list-scroll {
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default SubAdminDashboard;