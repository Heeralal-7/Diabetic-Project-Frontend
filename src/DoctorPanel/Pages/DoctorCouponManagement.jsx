import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context';

const DoctorCouponManagement = () => {
  const { 
    coupons1, 
    loading, 
    error, 
    createCoupon1, 
    editCoupon1, // ✅ New edit function
    getCoupons1, 
    getCouponsByStatus1,
    deleteCoupon1,
    setError 
  } = useContext(MyContext);

  const [activeTab, setActiveTab] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [filteredCoupons, setFilteredCoupons] = useState([]);

  // Form state for create
  const [formData, setFormData] = useState({
    couponCode: '',
    description: '',
    percentageDiscount: '',
    fixedAmountDiscount: '',
    couponApplied: '',
    limitRedeem: '',
    startDate: '',
    expireDate: ''
  });

  // Form state for edit
  const [editFormData, setEditFormData] = useState({
    couponCode: '',
    description: '',
    percentageDiscount: '',
    fixedAmountDiscount: '',
    couponApplied: '',
    limitRedeem: '',
    startDate: '',
    expireDate: ''
  });

  // Fetch coupons on component mount
  useEffect(() => {
    getCoupons1();
  }, []);

  // ✅ Frontend side filtering based on expiration
  useEffect(() => {
    const now = new Date();
    
    let filtered = [];
    switch (activeTab) {
      case 'all':
        filtered = coupons1;
        break;
      case 'active':
        filtered = coupons1.filter(coupon => {
          const expireDate = new Date(coupon.expireDate);
          return expireDate >= now;
        });
        break;
      case 'expired':
        filtered = coupons1.filter(coupon => {
          const expireDate = new Date(coupon.expireDate);
          return expireDate < now;
        });
        break;
      default:
        filtered = coupons1;
    }
    
    setFilteredCoupons(filtered);
  }, [coupons1, activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (error) setError(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
    if (error) setError(null);
  };

  // ✅ Open edit form with coupon data
  const handleEditClick = (coupon) => {
    setEditingCoupon(coupon);
    setEditFormData({
      couponCode: coupon.couponCode || '',
      description: coupon.description || '',
      percentageDiscount: coupon.percentageDiscount || '',
      fixedAmountDiscount: coupon.fixedAmountDiscount || '',
      couponApplied: coupon.couponApplied || '',
      limitRedeem: coupon.limitRedeem || '',
      startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
      expireDate: coupon.expireDate ? coupon.expireDate.split('T')[0] : ''
    });
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  // ✅ Close edit form
  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingCoupon(null);
    setEditFormData({
      couponCode: '',
      description: '',
      percentageDiscount: '',
      fixedAmountDiscount: '',
      couponApplied: '',
      limitRedeem: '',
      startDate: '',
      expireDate: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Frontend validation
    const expireDate = new Date(formData.expireDate);
    const currentDate = new Date();
    
    if (expireDate <= currentDate) {
      setError('Expire date must be in the future');
      return;
    }
    
    try {
      await createCoupon1(formData);
      setShowCreateForm(false);
      setFormData({
        couponCode: '',
        description: '',
        percentageDiscount: '',
        fixedAmountDiscount: '',
        couponApplied: '',
        limitRedeem: '',
        startDate: '',
        expireDate: ''
      });
    } catch (err) {
      console.error('Error creating coupon:', err);
    }
  };

  // ✅ Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingCoupon) return;
    
    // ✅ Frontend validation for edit
    const expireDate = new Date(editFormData.expireDate);
    const currentDate = new Date();
    
    if (expireDate <= currentDate) {
      setError('Expire date must be in the future');
      return;
    }
    
    try {
      await editCoupon1(editingCoupon._id, editFormData);
      setShowEditForm(false);
      setEditingCoupon(null);
      setEditFormData({
        couponCode: '',
        description: '',
        percentageDiscount: '',
        fixedAmountDiscount: '',
        couponApplied: '',
        limitRedeem: '',
        startDate: '',
        expireDate: ''
      });
    } catch (err) {
      console.error('Error updating coupon:', err);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon1(couponId);
      } catch (err) {
        console.error('Error deleting coupon:', err);
      }
    }
  };

  // ✅ Check if coupon is expired (frontend side)
  const isCouponExpired = (expireDate) => {
    return new Date(expireDate) < new Date();
  };

  // ✅ Get coupon status text and color
  const getCouponStatus = (coupon) => {
    const isExpired = isCouponExpired(coupon.expireDate);
    
    if (isExpired) {
      return { text: 'Expired', color: 'danger', badge: 'bg-danger' };
    } else {
      const startDate = new Date(coupon.startDate);
      const currentDate = new Date();
      
      if (startDate > currentDate) {
        return { text: 'Upcoming', color: 'warning', badge: 'bg-warning' };
      } else {
        return { text: 'Active', color: 'success', badge: 'bg-success' };
      }
    }
  };

  // ✅ Calculate days remaining until expiration
  const getDaysRemaining = (expireDate) => {
    const currentDate = new Date();
    const expire = new Date(expireDate);
    const diffTime = expire - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) return <div className="text-center py-4">Loading coupons...</div>;

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">Coupon Management</h4>
                <small className="text-muted">
                  Expiration is checked automatically on frontend
                </small>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setShowEditForm(false);
                }}
                disabled={showEditForm}
              >
                {showCreateForm ? 'Cancel' : 'Create New Coupon'}
              </button>
            </div>

            <div className="card-body">
              {/* Error Message */}

              {/* Create Coupon Form */}
              {showCreateForm && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Create New Coupon</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Coupon Code *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="couponCode"
                            value={formData.couponCode}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Description *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Percentage Discount</label>
                          <input
                            type="number"
                            className="form-control"
                            name="percentageDiscount"
                            value={formData.percentageDiscount}
                            onChange={handleChange}
                            placeholder="e.g., 10"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Fixed Amount Discount</label>
                          <input
                            type="number"
                            className="form-control"
                            name="fixedAmountDiscount"
                            value={formData.fixedAmountDiscount}
                            onChange={handleChange}
                            placeholder="e.g., 50"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Coupon Applied For *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="couponApplied"
                            value={formData.couponApplied}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Limit Redeem *</label>
                          <input
                            type="number"
                            className="form-control"
                            name="limitRedeem"
                            value={formData.limitRedeem}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Start Date *</label>
                          <input
                            type="date"
                            className="form-control"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Expire Date *</label>
                          <input
                            type="date"
                            className="form-control"
                            name="expireDate"
                            value={formData.expireDate}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <div className="text-end">
                        <button type="submit" className="btn btn-success">Create Coupon</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Coupon Form */}
              {showEditForm && editingCoupon && (
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5>Edit Coupon - {editingCoupon.couponCode}</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={handleCancelEdit}
                    ></button>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleEditSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Coupon Code *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="couponCode"
                            value={editFormData.couponCode}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Description *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Percentage Discount</label>
                          <input
                            type="number"
                            className="form-control"
                            name="percentageDiscount"
                            value={editFormData.percentageDiscount}
                            onChange={handleEditChange}
                            placeholder="e.g., 10"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Fixed Amount Discount</label>
                          <input
                            type="number"
                            className="form-control"
                            name="fixedAmountDiscount"
                            value={editFormData.fixedAmountDiscount}
                            onChange={handleEditChange}
                            placeholder="e.g., 50"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Coupon Applied For *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="couponApplied"
                            value={editFormData.couponApplied}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Limit Redeem *</label>
                          <input
                            type="number"
                            className="form-control"
                            name="limitRedeem"
                            value={editFormData.limitRedeem}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Start Date *</label>
                          <input
                            type="date"
                            className="form-control"
                            name="startDate"
                            value={editFormData.startDate}
                            onChange={handleEditChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Expire Date *</label>
                          <input
                            type="date"
                            className="form-control"
                            name="expireDate"
                            value={editFormData.expireDate}
                            onChange={handleEditChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <div className="text-end">
                        <button type="submit" className="btn btn-success me-2">Update Coupon</button>
                        <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    All Coupons ({coupons1.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                  >
                    Active ({coupons1.filter(c => !isCouponExpired(c.expireDate)).length})
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'expired' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expired')}
                  >
                    Expired ({coupons1.filter(c => isCouponExpired(c.expireDate)).length})
                  </button>
                </li>
              </ul>

              {/* Coupons List */}
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Description</th>
                      <th>Discount</th>
                      <th>Applied For</th>
                      <th>Limit</th>
                      <th>Start Date</th>
                      <th>Expire Date</th>
                      <th>Status</th>
                      <th>Days Left</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center py-4">
                          No coupons found in {activeTab} category
                        </td>
                      </tr>
                    ) : (
                      filteredCoupons.map((coupon) => {
                        const status = getCouponStatus(coupon);
                        const daysRemaining = getDaysRemaining(coupon.expireDate);
                        const isExpired = isCouponExpired(coupon.expireDate);
                        
                        return (
                          <tr key={coupon._id} className={status.color === 'danger' ? 'table-danger' : ''}>
                            <td>
                              <strong>{coupon.couponCode}</strong>
                            </td>
                            <td>{coupon.description}</td>
                            <td>
                              {coupon.percentageDiscount ? 
                                `${coupon.percentageDiscount}%` : 
                                `₹${coupon.fixedAmountDiscount || 0}`
                              }
                            </td>
                            <td>{coupon.couponApplied}</td>
                            <td>{coupon.limitRedeem}</td>
                            <td>{formatDate(coupon.startDate)}</td>
                            <td>{formatDate(coupon.expireDate)}</td>
                            <td>
                              <span className={`badge ${status.badge}`}>
                                {status.text}
                              </span>
                            </td>
                            <td>
                              {status.text === 'Active' ? (
                                <span className={`badge ${daysRemaining <= 3 ? 'bg-warning' : 'bg-info'}`}>
                                  {daysRemaining} days
                                </span>
                              ) : status.text === 'Expired' ? (
                                <span className="badge bg-secondary">Expired</span>
                              ) : (
                                <span className="badge bg-secondary">Soon</span>
                              )}
                            </td>
                            <td>
                              <div className="btn-group">
                                <button 
                                  className="btn btn-sm btn-outline-primary me-1"
                                  onClick={() => handleEditClick(coupon)}
                                  title="Edit coupon"
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteCoupon(coupon._id)}
                                  title="Delete coupon"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCouponManagement;