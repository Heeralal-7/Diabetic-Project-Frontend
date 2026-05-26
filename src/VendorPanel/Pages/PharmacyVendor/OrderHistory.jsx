import React, { useContext, useEffect, useState } from 'react';
import { Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MyContext } from '../../../Context/Context';

const OrderHistory = () => {
    // Get state and functions from Context
    const {
        orderHistory2,
        loading,
        error,
        fetchOrderHistory2
    } = useContext(MyContext);

    // State to manage which order's details are expanded
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Fetch data when the component mounts
    useEffect(() => {
        fetchOrderHistory2();
    }, [fetchOrderHistory2]);

    // Function to toggle the expanded view of an order
    const toggleOrderExpand = (orderId) => {
        setExpandedOrder(prev => (prev === orderId ? null : orderId));
    };

    // Currency formatter to display prices clearly
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    // --- Loading and Error States ---
    if (loading && !orderHistory2?.length) {
        return (
            <div className="card shadow-sm border-0">
                <div className="card-body text-center">
                    <Spinner animation="border" />
                    <p className="mt-2">Loading order history...</p>
                </div>
            </div>
        );
    }

  

    return (
        <div className="card shadow-sm border-0">
            <div className="card-body p-0">
                <h5 className="card-title mb-4">Order History (Delivered & Rejected)</h5>
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Driver</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderHistory2 && orderHistory2.length > 0 ? (
                                orderHistory2.map(order => (
                                    <React.Fragment key={order._id}>
                                        {/* Main Order Row */}
                                        <tr>
                                            <td>
                                                <Link to={`/pharmacy/orders/${order._id}`} className="fw-bold text-primary">
                                                    #{String(order._id).slice(-6).toUpperCase()}
                                                </Link>
                                            </td>
                                            <td>{order.user?.name || 'N/A'}</td>
                                            <td>
                                                <Badge bg={order.status === 5 ? 'success' : 'danger'}>
                                                    {order.statusText || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td>{order.driver?.name || 'Not Assigned'}</td>
                                            <td>{order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A'}</td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => toggleOrderExpand(order._id)}
                                                >
                                                    {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                                                </Button>
                                            </td>
                                        </tr>

                                        {/* Expanded view with order details */}
                                        {expandedOrder === order._id && (
                                            <tr>
                                                <td colSpan="6" className="p-3 bg-light-subtle">
                                                    <div className="row g-4">
                                                        {/* Order Details Column */}
                                                        <div className="col-md-6">
                                                            <h6>Order Details</h6>
                                                            <p className="mb-1"><strong>Reason/Note:</strong> {order.statusDetails?.reason || 'N/A'}</p>
                                                            <p className="mb-1"><strong>Order Placed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                                            <p className="mb-0"><strong>Status Changed:</strong> {order.statusDetails?.statusChangedAt ? new Date(order.statusDetails.statusChangedAt).toLocaleString() : 'N/A'}</p>
                                                        </div>

                                                        {/* Driver Details Column */}
                                                        <div className="col-md-6">
                                                            <h6>Driver Details</h6>
                                                            <p className="mb-1"><strong>Name:</strong> {order.driver?.name || 'N/A'}</p>
                                                            <p className="mb-1"><strong>Email:</strong> {order.driver?.email || 'N/A'}</p>
                                                            <p className="mb-0"><strong>Vehicle:</strong> {order.driver?.vehicleType ? `${order.driver.vehicleType} (${order.driver.vehicleNumber || 'N/A'})` : 'N/A'}</p>
                                                        </div>

                                                        {/* Items Table Column (full width) */}
                                                        <div className="col-12">
                                                            <h6 className="mt-3">Items in Order ({order.items?.length || 0})</h6>
                                                            {order.items?.length > 0 ? (
                                                                <Table size="sm" bordered responsive>
                                                                    <thead className="table-secondary">
                                                                        <tr>
                                                                            <th>Item Name</th>
                                                                            <th>Manufacturer</th>
                                                                            <th>Type</th>
                                                                            <th>Quantity</th>
                                                                            <th>Price</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {order.items.map((item, index) => (
                                                                            <tr key={item.details?._id || index}>
                                                                                <td>{item.details?.name || 'N/A'}</td>
                                                                                <td>{item.details?.manufacturers || 'N/A'}</td>
                                                                                <td>
                                                                                    <Badge pill bg={item.itemType === 'medicine' ? 'info' : 'secondary'}>
                                                                                        {item.itemType?.charAt(0).toUpperCase() + item.itemType?.slice(1) || 'N/A'}
                                                                                    </Badge>
                                                                                </td>
                                                                                <td>{item.quantity || 0}</td>
                                                                                <td>{item.price ? formatCurrency(item.price) : 'N/A'}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </Table>
                                                            ) : <p>No items found in this order.</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                // Message when no order history is found
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <p className="mb-0">No order history found.</p>
                                        <small>There are no delivered or rejected orders to display.</small>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;