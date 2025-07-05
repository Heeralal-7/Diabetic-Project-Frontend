import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Form, 
  Spinner, 
  Alert,
  Badge,
  Accordion
} from 'react-bootstrap';
import moment from 'moment';
import { MyContext } from '../../../Context/Context';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AvailabilityManagement = () => {
  const {
    loading,
    error,
    availabilities,
    createAvailability,
    getVendorAvailabilities,
    getAvailabilityByDateRange,
    deleteAvailability
  } = useContext(MyContext);

  const [showForm, setShowForm] = useState(false);
  const [dateRangeAvailability, setDateRangeAvailability] = useState([]);
  const [dateRangeLoading, setDateRangeLoading] = useState(false);
  const [dateRangeError, setDateRangeError] = useState(null);
  const [formError, setFormError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    day: 'Morning',
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: ''
  });

  // Date range state for viewing availability
  const [dateRange, setDateRange] = useState({
    startDate: moment().format('DD/MM/YYYY'),
    endDate: moment().add(7, 'days').format('DD/MM/YYYY')
  });

  // Time slots for selection
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = moment({ hour, minute }).format('HH:mm');
      timeSlots.push(time);
    }
  }

  // Period options
  const periodOptions = [
    { value: 'Morning', label: 'Morning (01:00 - 12:00)' },
    { value: 'Afternoon', label: 'Afternoon (12:00 - 18:00)' },
    { value: 'Evening', label: 'Evening (18:00 - 24:00)' }
  ];

  // Load availabilities on component mount
  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    await getVendorAvailabilities();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date changes (for date range viewing)
  const handleDateChange = (date, field) => {
    const formattedDate = moment(date).format('DD/MM/YYYY');
    setDateRange(prev => ({
      ...prev,
      [field]: formattedDate
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate form data
    if (!formData.startTime || !formData.endTime || !formData.startDate || !formData.endDate) {
      setFormError('Please fill all fields');
      return;
    }

    // Validate time range
    const startMoment = moment(formData.startTime, 'HH:mm');
    const endMoment = moment(formData.endTime, 'HH:mm');
    
    if (endMoment.isSameOrBefore(startMoment)) {
      setFormError('End time must be after start time');
      return;
    }

    // Create availability
    const result = await createAvailability(formData);
    
    if (result.success === 1) {
      setFormData({
        day: 'Morning',
        startTime: '',
        endTime: '',
        startDate: '',
        endDate: ''
      });
      setShowForm(false);
      await fetchAvailabilities(); // Refresh the list
    } else {
      setFormError(result.message || 'Failed to create availability');
    }
  };

  // Handle viewing availability by date range
  const handleViewByDateRange = async () => {
    try {
      setDateRangeLoading(true);
      setDateRangeError(null);
      
      const result = await getAvailabilityByDateRange(
        dateRange.startDate,
        dateRange.endDate
      );
      
      if (result.success === 1) {
        setDateRangeAvailability(result.details);
      } else {
        setDateRangeError(result.message);
      }
    } catch (error) {
      setDateRangeError(error.message);
    } finally {
      setDateRangeLoading(false);
    }
  };

  // Handle delete availability
  const handleDeleteAvailability = async (id) => {
    try {
      if (window.confirm('Are you sure you want to delete this availability slot?')) {
        const result = await deleteAvailability(id);
        if (result.success === 1) {
          await fetchAvailabilities(); // Refresh the list
        }
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  // Format time to AM/PM
  const formatTime = (time) => {
    return moment(time, 'HH:mm').format('hh:mm A');
  };

  // Format date for display
  const formatDate = (dateStr) => {
    return moment(dateStr, 'DD/MM/YYYY').format('MMM Do, YYYY');
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>My Availability</h5>
              <Button 
                variant={showForm ? 'secondary' : 'primary'} 
                size="sm"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : 'Add New Availability'}
              </Button>
            </Card.Header>
            <Card.Body>
              {/* Add Availability Form */}
              {showForm && (
                <div className="mb-4 p-3 border rounded bg-light">
                  <h6>Add New Availability Slot</h6>
                  {formError && <Alert variant="danger" className="mb-3">{formError}</Alert>}
                  <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group controlId="day">
                          <Form.Label>Day Period</Form.Label>
                          <Form.Select
                            name="day"
                            value={formData.day}
                            onChange={handleInputChange}
                            required
                          >
                            {periodOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group controlId="startTime">
                          <Form.Label>Start Time</Form.Label>
                          <Form.Select
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select start time</option>
                            {timeSlots.map(time => (
                              <option key={`start-${time}`} value={time}>
                                {formatTime(time)}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group controlId="endTime">
                          <Form.Label>End Time</Form.Label>
                          <Form.Select
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select end time</option>
                            {timeSlots.map(time => (
                              <option key={`end-${time}`} value={time}>
                                {formatTime(time)}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group controlId="startDate">
                          <Form.Label>Start Date</Form.Label>
                          <DatePicker
                            selected={formData.startDate ? moment(formData.startDate, 'DD/MM/YYYY').toDate() : null}
                            onChange={(date) => {
                              const formattedDate = moment(date).format('DD/MM/YYYY');
                              setFormData(prev => ({
                                ...prev,
                                startDate: formattedDate
                              }));
                            }}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                            placeholderText="Select start date"
                            minDate={new Date()}
                            required
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group controlId="endDate">
                          <Form.Label>End Date</Form.Label>
                          <DatePicker
                            selected={formData.endDate ? moment(formData.endDate, 'DD/MM/YYYY').toDate() : null}
                            onChange={(date) => {
                              const formattedDate = moment(date).format('DD/MM/YYYY');
                              setFormData(prev => ({
                                ...prev,
                                endDate: formattedDate
                              }));
                            }}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                            placeholderText="Select end date"
                            minDate={formData.startDate ? moment(formData.startDate, 'DD/MM/YYYY').toDate() : new Date()}
                            required
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={12} className="text-end">
                        <Button variant="primary" type="submit" disabled={loading}>
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            'Create Availability Slot'
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}

              {/* Date Range Filter Section */}
              <div className="mb-4 p-3 border rounded">
                <h6>Filter by Date Range</h6>
                <Row className="g-3 align-items-center">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <DatePicker
                        selected={dateRange.startDate ? moment(dateRange.startDate, 'DD/MM/YYYY').toDate() : null}
                        onChange={(date) => handleDateChange(date, 'startDate')}
                        dateFormat="dd/MM/yyyy"
                        className="form-control"
                        placeholderText="Select start date"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <DatePicker
                        selected={dateRange.endDate ? moment(dateRange.endDate, 'DD/MM/YYYY').toDate() : null}
                        onChange={(date) => handleDateChange(date, 'endDate')}
                        dateFormat="dd/MM/yyyy"
                        className="form-control"
                        placeholderText="Select end date"
                        minDate={moment(dateRange.startDate, 'DD/MM/YYYY').toDate()}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button 
                      variant="info" 
                      onClick={handleViewByDateRange}
                      disabled={dateRangeLoading}
                    >
                      {dateRangeLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        'Filter Availability'
                      )}
                    </Button>
                  </Col>
                </Row>
              </div>



              {/* Availability Summary */}
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <h6>All Availability Slots</h6>
                <Badge bg="info" pill>
                  Total Slots: {availabilities.length}
                </Badge>
              </div>


                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Day Period</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Time Slot</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availabilities.map((avail) => (
                      <tr key={avail._id}>
                        <td>
                          <Badge bg="info">{avail.day}</Badge>
                        </td>
                        <td>{formatDate(avail.startDate)}</td>
                        <td>{formatDate(avail.endDate)}</td>
                        <td>
                          {formatTime(avail.startTime)} - {formatTime(avail.endTime)}
                        </td>
                        <td>
                          <Badge bg="success">Active</Badge>
                        </td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteAvailability(avail._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>


              {/* Filtered Availability Section */}
              {dateRangeAvailability.length > 0 && (
                <>
                  <h6 className="mt-5 mb-3">
                    Filtered Availability from {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
                  </h6>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Day Period</th>
                        <th>Date</th>
                        <th>Time Slot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateRangeAvailability.map((avail, index) => (
                        <tr key={`range-${index}`}>
                          <td>
                            <Badge bg="info">{avail.day}</Badge>
                          </td>
                          <td>
                            {formatDate(avail.startDate)} {avail.startDate !== avail.endDate && `to ${formatDate(avail.endDate)}`}
                          </td>
                          <td>
                            {formatTime(avail.startTime)} - {formatTime(avail.endTime)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AvailabilityManagement;