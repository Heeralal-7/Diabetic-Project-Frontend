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
  Tabs,
  Tab
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

  const [dateRangeAvailability, setDateRangeAvailability] = useState([]);
  const [dateRangeLoading, setDateRangeLoading] = useState(false);
  const [dateRangeError, setDateRangeError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [activeTab, setActiveTab] = useState('allSlots');

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
  // Add 00:00 for the end of the evening shift
  timeSlots.push('00:00'); 
  for (let hour = 1; hour < 24; hour++) {
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

  // Handle form submission with improved validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validate form data presence
    if (!formData.startTime || !formData.endTime || !formData.startDate || !formData.endDate) {
      setFormError('Please fill all fields');
      return;
    }

    // 2. Core time validation
    const startMoment = moment(formData.startTime, 'HH:mm');
    const endMoment = moment(formData.endTime, 'HH:mm');

    if (formData.endTime !== '00:00' && endMoment.isSameOrBefore(startMoment)) {
      setFormError('End time must be after start time.');
      return;
    }
    if (formData.startTime === formData.endTime) {
      setFormError('Start and end time cannot be the same.');
      return;
    }

    // 3. Period-specific validation
    let periodValid = true;
    switch (formData.day) {
      case 'Morning':
        const morningStart = moment('01:00', 'HH:mm');
        const morningEnd = moment('12:00', 'HH:mm');
        if (startMoment.isBefore(morningStart) || endMoment.isAfter(morningEnd) || endMoment.isSame(morningStart)) {
          periodValid = false;
        }
        break;

      case 'Afternoon':
        const afternoonStart = moment('12:00', 'HH:mm');
        const afternoonEnd = moment('18:00', 'HH:mm');
        if (startMoment.isBefore(afternoonStart) || endMoment.isAfter(afternoonEnd) || endMoment.isSame(afternoonStart)) {
          periodValid = false;
        }
        break;

      case 'Evening':
        const eveningStart = moment('18:00', 'HH:mm');
        if (startMoment.isBefore(eveningStart)) {
          periodValid = false;
        }
        if (formData.endTime !== '00:00' && endMoment.isBefore(eveningStart)) {
          periodValid = false;
        }
        break;

      default:
        periodValid = false;
    }

    if (!periodValid) {
      const periodLabel = periodOptions.find(p => p.value === formData.day)?.label || formData.day;
      setFormError(`Selected time does not fall within the ${periodLabel} period.`);
      return;
    }

    // If all validations pass, proceed
    const result = await createAvailability(formData);

    if (result.success === 1) {
      setFormData({
        day: 'Morning',
        startTime: '',
        endTime: '',
        startDate: '',
        endDate: ''
      });
      await fetchAvailabilities();
      setActiveTab('allSlots');
    } else {
      setFormError(result.message || 'Failed to create availability');
    }
  };

  // Handle viewing availability by date range
  const handleViewByDateRange = async () => {
    try {
      setDateRangeLoading(true);
      setDateRangeError(null);
      const result = await getAvailabilityByDateRange(dateRange.startDate, dateRange.endDate);
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
          await fetchAvailabilities();
        }
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  // Format time to AM/PM
  const formatTime = (time) => {
    if (time === '00:00') return '12:00 AM';
    if (time === '12:00') return '12:00 PM';
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
            <Card.Header>
              <h5 className="mb-0">Availability Management</h5>
            </Card.Header>
            <Card.Body>
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4" id="availability-tabs">
                <Tab eventKey="allSlots" title={<span><i className="fas fa-calendar-alt me-2"></i>All Slots</span>}>
                  <div className="mt-4">
                    <Card className="mb-4 shadow-sm">
                      <Card.Body>
                        <h6 className="mb-3"><i className="fas fa-filter me-2"></i>Filter by Date Range</h6>
                        <Row className="g-3 align-items-center">
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Start Date</Form.Label>
                              <DatePicker selected={dateRange.startDate ? moment(dateRange.startDate, 'DD/MM/YYYY').toDate() : null} onChange={(date) => handleDateChange(date, 'startDate')} dateFormat="dd/MM/yyyy" className="form-control" placeholderText="Select start date" />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>End Date</Form.Label>
                              <DatePicker selected={dateRange.endDate ? moment(dateRange.endDate, 'DD/MM/YYYY').toDate() : null} onChange={(date) => handleDateChange(date, 'endDate')} dateFormat="dd/MM/yyyy" className="form-control" placeholderText="Select end date" minDate={moment(dateRange.startDate, 'DD/MM/YYYY').toDate()} />
                            </Form.Group>
                          </Col>
                          <Col md={4} className="d-flex align-items-end">
                            <Button variant="primary" onClick={handleViewByDateRange} disabled={dateRangeLoading} className="w-100">
                              {dateRangeLoading ? <Spinner animation="border" size="sm" /> : <><i className="fas fa-search me-2"></i>Filter</>}
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5><i className="fas fa-list me-2"></i>All Availability Slots</h5>
                      <Badge bg="primary" pill>Total: {availabilities.length}</Badge>
                    </div>

                    {/* {error && <Alert variant="danger">{error}</Alert>} */}
                    {loading ? (
                      <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Loading availability slots...</p></div>
                    ) : availabilities.length === 0 ? (
                      <Alert variant="info">No availability slots found. Add a new slot to get started.</Alert>
                    ) : (
                      <>
                        <div className="table-responsive">
                          <Table striped bordered hover className="mb-0">
                            <thead className="table-dark">
                              <tr><th>Day Period</th><th>Date Range</th><th>Time Slot</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                              {availabilities.map((avail) => (
                                <tr key={avail._id}>
                                  <td><Badge bg="info" className="text-capitalize">{avail.day}</Badge></td>
                                  <td>{formatDate(avail.startDate)} {avail.startDate !== avail.endDate && `to ${formatDate(avail.endDate)}`}</td>
                                  <td>{formatTime(avail.startTime)} - {formatTime(avail.endTime)}</td>
                                  <td><Badge bg="success">Active</Badge></td>
                                  <td><Button variant="outline-danger" size="sm" onClick={() => handleDeleteAvailability(avail._id)}><i className="fas fa-trash-alt me-1"></i>Delete</Button></td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>

                        {dateRangeError && <Alert variant="danger" className="mt-4">{dateRangeError}</Alert>}
                        {dateRangeAvailability.length > 0 && (
                          <div className="mt-5">
                            <h5 className="mb-3"><i className="fas fa-calendar-check me-2"></i>Filtered Results: {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}</h5>
                            <div className="table-responsive">
                              <Table striped bordered hover>
                                <thead className="table-primary">
                                  <tr><th>Day Period</th><th>Date</th><th>Time Slot</th></tr>
                                </thead>
                                <tbody>
                                  {dateRangeAvailability.map((avail, index) => (
                                    <tr key={`range-${index}`}>
                                      <td><Badge bg="info" className="text-capitalize">{avail.day}</Badge></td>
                                      <td>{formatDate(avail.startDate)} {avail.startDate !== avail.endDate && `to ${formatDate(avail.endDate)}`}</td>
                                      <td>{formatTime(avail.startTime)} - {formatTime(avail.endTime)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Tab>
                <Tab eventKey="addSlot" title={<span><i className="fas fa-plus-circle me-2"></i>Add New Slot</span>}>
                  <div className="mt-4">
                    <Card className="shadow-sm">
                      <Card.Body>
                        <h5 className="mb-4"><i className="fas fa-calendar-plus me-2"></i>Create New Availability Slot</h5>
                        {formError && <Alert variant="danger" className="mb-4">{formError}</Alert>}
                        <Form onSubmit={handleSubmit}>
                          <Row className="g-3">
                            <Col md={12}>
                              <Form.Group controlId="day" className="mb-3">
                                <Form.Label><i className="fas fa-sun me-2"></i>Day Period</Form.Label>
                                <Form.Select name="day" value={formData.day} onChange={handleInputChange} required>
                                  {periodOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group controlId="startTime" className="mb-3">
                                <Form.Label><i className="fas fa-clock me-2"></i>Start Time</Form.Label>
                                <Form.Select name="startTime" value={formData.startTime} onChange={handleInputChange} required>
                                  <option value="">Select start time</option>
                                  {timeSlots.map(time => <option key={`start-${time}`} value={time}>{formatTime(time)}</option>)}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group controlId="endTime" className="mb-3">
                                <Form.Label><i className="fas fa-clock me-2"></i>End Time</Form.Label>
                                <Form.Select name="endTime" value={formData.endTime} onChange={handleInputChange} required>
                                  <option value="">Select end time</option>
                                  {timeSlots.map(time => <option key={`end-${time}`} value={time}>{formatTime(time)}</option>)}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group controlId="startDate" className="mb-3">
                                <Form.Label><i className="fas fa-calendar-day me-2"></i>Start Date</Form.Label>
                                <DatePicker selected={formData.startDate ? moment(formData.startDate, 'DD/MM/YYYY').toDate() : null} onChange={(date) => setFormData(prev => ({ ...prev, startDate: moment(date).format('DD/MM/YYYY') }))} dateFormat="dd/MM/yyyy" className="form-control" placeholderText="Select start date" minDate={new Date()} required />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group controlId="endDate" className="mb-3">
                                <Form.Label><i className="fas fa-calendar-day me-2"></i>End Date</Form.Label>
                                <DatePicker selected={formData.endDate ? moment(formData.endDate, 'DD/MM/YYYY').toDate() : null} onChange={(date) => setFormData(prev => ({ ...prev, endDate: moment(date).format('DD/MM/YYYY') }))} dateFormat="dd/MM/yyyy" className="form-control" placeholderText="Select end date" minDate={formData.startDate ? moment(formData.startDate, 'DD/MM/YYYY').toDate() : new Date()} required />
                              </Form.Group>
                            </Col>
                            <Col xs={12} className="mt-4">
                              <Button variant="primary" type="submit" disabled={loading} className="w-100 py-2">
                                {loading ? <><Spinner animation="border" size="sm" className="me-2" />Creating Slot...</> : <><i className="fas fa-save me-2"></i>Create Availability Slot</>}
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </Card.Body>
                    </Card>
                    <div className="mt-4">
                      <Card className="border-primary">
                        <Card.Header className="bg-primary text-white"><i className="fas fa-info-circle me-2"></i>Quick Tips</Card.Header>
                        <Card.Body>
                          <ul className="mb-0 ps-3">
                            <li><b>Morning:</b> 01:00 AM to 12:00 PM</li>
                            <li><b>Afternoon:</b> 12:00 PM to 06:00 PM</li>
                            <li><b>Evening:</b> 06:00 PM to 12:00 AM (midnight)</li>
                            <li>Ensure your selected times fall within the chosen period.</li>
                          </ul>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AvailabilityManagement;