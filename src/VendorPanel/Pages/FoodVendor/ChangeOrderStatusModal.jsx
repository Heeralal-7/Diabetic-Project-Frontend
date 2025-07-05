import React, { useState } from 'react';
import { Modal, Button, Spinner, Badge, ListGroup, Form } from 'react-bootstrap';

const ChangeOrderStatusModal = ({ show, onHide, onConfirm, order, loading }) => {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleStatusChange = (status) => {
    if (status === '2') { // Rejected
      if (!rejectionReason.trim()) {
        alert('Please enter a rejection reason');
        return;
      }
      onConfirm(status, rejectionReason);
    } else { // Accepted
      onConfirm(status);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Manage Order #{order?._id?.substring(0, 8)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <h5>Order Information</h5>
          <p><strong>Customer:</strong> {order?.userId?.name || 'N/A'}</p>
          <p><strong>Order Type:</strong> {order?.items[0]?.quantity > 1 ? 'Bulk' : 'Single'}</p>
          <p><strong>Total Items:</strong> {order?.items?.length}</p>
        </div>

        <div className="mb-3">
          <h5>Items</h5>
          <ListGroup>
            {order?.items?.map((item, index) => (
              <ListGroup.Item key={index}>
                <div className="d-flex justify-content-between">
                  <div>
                    <strong>{item.FoodItem?.foodName}</strong> (x{item.quantity})
                    <div className="text-muted small">
                      Price: ₹{item.price} • Total: ₹{item.price * item.quantity}
                    </div>
                    {item.extraItems?.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">Extras:</small>
                        {item.extraItems.map((extra, i) => (
                          <Badge bg="secondary" className="me-1" key={i}>
                            {extra.name} (₹{extra.price})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        <div className="mb-3">
          <h5>Total Amount: ₹{order?.price || '0.00'}</h5>
        </div>

        <Form.Group className="mb-3" controlId="rejectionReason">
          <Form.Label>Rejection Reason (Required if rejecting)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            disabled={loading}
          />
        </Form.Group>

        <div className="d-grid gap-2 mt-4">
          <Button 
            variant="success" 
            onClick={() => handleStatusChange('1')} // '1' for accepted
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Accept Order'}
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleStatusChange('2')} // '2' for rejected
            disabled={loading || !rejectionReason.trim()}
          >
            {loading ? <Spinner size="sm" /> : 'Reject Order'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ChangeOrderStatusModal;