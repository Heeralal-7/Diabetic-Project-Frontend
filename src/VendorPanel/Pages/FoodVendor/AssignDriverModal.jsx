import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

const AssignDriverModal = ({ show, onHide, onConfirm, drivers, loading }) => {
  const [selectedDriver, setSelectedDriver] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDriver) {
      onConfirm(selectedDriver);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Driver</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Select Driver</Form.Label>
            <Form.Select 
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Choose a driver</option>
              {drivers.map(driver => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} - {driver.status}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Assign Driver'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AssignDriverModal;