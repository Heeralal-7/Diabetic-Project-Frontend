import React, { useState } from 'react';
import RevenueSummary from './RevenueSummary';
import AdminSummary from './RevenueAdmin';
import CutoffSettingsPanel from './CutoffSettings';
import VendorEarnings from './VendorEarnings';

const Revenue = () => {
  const [activeTab, setActiveTab] = useState('revenue');

  const tabs = [
    { key: 'revenue', label: 'Revenue Summary', icon: 'fas fa-chart-bar' },
    { key: 'admin-summary', label: 'All Orders', icon: 'fas fa-tachometer-alt' },
    { key: 'vendor-earnings', label: 'Vendor Earnings', icon: 'fas fa-store' },
    { key: 'cutoff-settings', label: 'Cutoff Settings', icon: 'fas fa-cog' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'revenue':
        return <RevenueSummary />;
      case 'admin-summary':
        return <AdminSummary />;
      case 'vendor-earnings':
        return <VendorEarnings />;
      case 'cutoff-settings':
        return <CutoffSettingsPanel />;
      default:
        return <RevenueSummary />;
    }
  };

  return (
    <div className="container-fluid">
      {/* Page Header with Stats */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-sm-flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="h3 mb-0 text-gray-800">Revenue Management</h1>
              <p className="text-muted mt-1">Manage platform revenue, cutoff settings, and vendor earnings</p>
            </div>
            <div className="d-none d-sm-inline-block">
              <div className="badge bg-primary text-white px-3 py-2">
                <i className="fas fa-info-circle me-2"></i>
                <span>Free consultations use Membership cutoff</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Doctor Orders
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">Mixed</div>
                  <div className="text-xs text-muted mt-1">
                    Paid + Free Consultations
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-user-md fa-2x text-primary"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Membership Cutoff
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">20%</div>
                  <div className="text-xs text-muted mt-1">
                    Used for free consultations
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-crown fa-2x text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Doctor Cutoff
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">5%</div>
                  <div className="text-xs text-muted mt-1">
                    Used for paid consultations
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-stethoscope fa-2x text-info"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Cutoff Logic
                  </div>
                  <div className="h6 mb-0 font-weight-bold text-gray-800">Automatic</div>
                  <div className="text-xs text-muted mt-1">
                    Smart cutoff selection
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-brain fa-2x text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="alert alert-info mb-4">
        <div className="d-flex align-items-center">
          <i className="fas fa-lightbulb fa-2x me-3"></i>
          <div>
            <h6 className="mb-1">Smart Cutoff System</h6>
            <p className="mb-0">
              <strong>Free Consultations:</strong> Use <span className="badge bg-success">Membership Cutoff (20%)</span> &nbsp;|&nbsp;
              <strong>Paid Consultations:</strong> Use <span className="badge bg-info">Doctor Cutoff (5%)</span>
            </p>
            <small className="text-muted">
              The system automatically detects free consultations and applies the appropriate cutoff percentage.
            </small>
          </div>
        </div>
      </div>

      {/* Navigation Tabs with Enhanced UI */}
      <div className="card shadow mb-4">
        <div className="card-header py-3 bg-white">
          <div className="row">
            <div className="col-md-8">
              <ul className="nav nav-pills nav-fill">
                {tabs.map((tab) => (
                  <li key={tab.key} className="nav-item">
                    <button
                      className={`nav-link ${activeTab === tab.key ? 'active' : ''} d-flex align-items-center justify-content-center`}
                      onClick={() => setActiveTab(tab.key)}
                      style={{ minWidth: '120px' }}
                    >
                      <i className={`${tab.icon} me-2`}></i>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-4 text-end">
              <div className="dropdown">
                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <i className="fas fa-question-circle me-2"></i>Help
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#"><i className="fas fa-book me-2"></i>Documentation</a></li>
                  <li><a className="dropdown-item" href="#"><i className="fas fa-video me-2"></i>Tutorial</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="#"><i className="fas fa-phone me-2"></i>Contact Support</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          <div className="p-4">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-light">
            <div className="card-body">
              <h6 className="card-title text-muted">
                <i className="fas fa-info-circle me-2"></i>Cutoff System Information
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Membership Cutoff:</strong> Applied to FREE consultations
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Doctor Cutoff:</strong> Applied to PAID consultations
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Clinic Cutoff:</strong> Applied to clinic appointments
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="fas fa-database me-2 text-primary"></i>
                      Original consultation fee stored for all appointments
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-chart-pie me-2 text-primary"></i>
                      Separate revenue tracking for free vs paid
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-eye me-2 text-primary"></i>
                      Detailed financial breakdown available
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        .nav-pills .nav-link {
          color: #6c757d;
          border-radius: 0.375rem;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        
        .nav-pills .nav-link:hover {
          background-color: #f8f9fa;
          border-color: #dee2e6;
        }
        
        .nav-pills .nav-link.active {
          background-color: #4e73df;
          color: white;
          box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
        }
        
        .nav-fill .nav-item {
          flex: 1;
          text-align: center;
        }
        
        .card {
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .card-header {
          border-bottom: 1px solid #e3e6f0;
        }
        
        .border-left-primary {
          border-left: 0.25rem solid #4e73df !important;
        }
        
        .border-left-success {
          border-left: 0.25rem solid #1cc88a !important;
        }
        
        .border-left-info {
          border-left: 0.25rem solid #36b9cc !important;
        }
        
        .border-left-warning {
          border-left: 0.25rem solid #f6c23e !important;
        }
        
        .badge {
          border-radius: 1rem;
          font-weight: 500;
        }
        
        .dropdown-toggle {
          border-radius: 0.375rem;
        }
        
        @media (max-width: 768px) {
          .nav-pills .nav-link {
            margin-bottom: 0.5rem;
          }
          
          .card-body {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Revenue;