import React, { useState, useEffect, useContext } from 'react';
import { Table, Card, Spinner, Alert, Form, Col, Button } from 'react-bootstrap';
import { MyContext } from '../../../Context/Context';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  // Handle ISO format (2025-07-09T13:18:04.912Z)
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate.toLocaleDateString('en-GB');
  }

  // Handle DD/MM/YYYY format (09/07/2025)
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const formattedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    if (!isNaN(formattedDate.getTime())) {
      return formattedDate.toLocaleDateString('en-GB');
    }
  }

  return 'Invalid Date';
};

const PharCoupons = () => {
  const { coupon1, loading, error, getCouponsByVendor, deleteCoupon } = useContext(MyContext);
  const [statusFilter, setStatusFilter] = useState('1');
  const [displayedCoupons, setDisplayedCoupons] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        console.log('Fetching coupons with status:', statusFilter);
        const response = await getCouponsByVendor(statusFilter);

        // Debug the full response
        console.log('API Response:', response);
        
        // Handle both direct response and response.data cases
        const data = response?.data || response;
        
        if (!data) {
          throw new Error('Empty response from server');
        }

        if (data.success !== 1) {
          throw new Error(data.message || 'API request failed');
        }

        if (!Array.isArray(data.details)) {
          console.warn('Unexpected data format - details is not an array:', data);
          throw new Error('Invalid data format received');
        }

        setDisplayedCoupons(data.details);
        setApiError(null);
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setApiError(err.message);
        setDisplayedCoupons([]);
      }
    };

    fetchCoupons();
  }, [statusFilter]);

  // Debug renders
  useEffect(() => {
    console.log('Current state:', {
      loading,
      error,
      apiError,
      displayedCoupons: displayedCoupons.length,
      contextCoupons: coupon1.length
    });
  }, [loading, error, apiError, displayedCoupons, coupon1]);

  const handleDeleteCoupon = async (couponId) => {
    setDeleteLoadingId(couponId);
    try {
      const result = await deleteCoupon(couponId);
      if (result.success) {
        // Refresh the coupons list
        const response = await getCouponsByVendor(statusFilter);
        const data = response?.data || response;
        setDisplayedCoupons(data.details);
      } else {
        setApiError(result.message);
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  if (apiError?.includes('token') || apiError?.includes('auth')) {
    return (
      <Card className="auth-error-card">
        <Card.Body className="text-center p-4">
          <Alert variant="danger">
            <h4>Authentication Required</h4>
            <p>{apiError}</p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <Button
                variant="primary"
                onClick={() => window.location.href = '/pharmacy/login'}
              >
                Login
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </div>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm mt-4">
      <Card.Body>
        <Card.Title as="h4" className="mb-4">Coupon Management</Card.Title>

        <Form.Group as={Col} md="4" className="mb-4">
          <Form.Label>Filter by Status</Form.Label>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
            <option value="2">Expired</option>
          </Form.Select>
        </Form.Group>

        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading coupons...</p>
          </div>
        )}

        {apiError && !loading && (
          <Alert variant="warning">
            <Alert.Heading>Error</Alert.Heading>
            <p>{apiError}</p>
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Alert>
        )}

        {!loading && !apiError && (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Discount</th>
                  <th>Start Date</th>
                  <th>Expiry</th>
                  {/* <th>Uses Left</th> */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedCoupons.length > 0 ? (
                  displayedCoupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td className="fw-bold">{coupon.couponCode}</td>
                      <td>{coupon.description || '-'}</td>
                      <td>
                        {coupon.percentageDiscount !== "0"
                          ? `${coupon.percentageDiscount}%`
                          : `₹${coupon.fixedAmountDiscount}`}
                      </td>
                      <td>{formatDate(coupon.startDate)}</td>
                      <td>{formatDate(coupon.expireDate)}</td>
                      {/* <td>{coupon.limitRedeem}</td> */}
                      <td>
<Button
  variant="danger"
  size="sm"
  onClick={() => {
    if (window.confirm('Are you sure you want to delete this?')) {
      handleDeleteCoupon(coupon._id);
    }
  }}
  disabled={deleteLoadingId === coupon._id}
>
  {deleteLoadingId === coupon._id ? (
    <Spinner as="span" animation="border" size="sm" role="status" />
  ) : (
    'Delete'
  )}
</Button>

                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No coupons found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PharCoupons;