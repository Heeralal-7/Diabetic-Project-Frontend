import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context';

const DoctorPrescription = () => {
  const {
    prescriptions,
    medicines4:medicines,
    insuranceList,
    selectedPrescription,
    loading,
    error,
    setError,
    getMedicineData,
    createDoctorPrescription,
    getAllPrescriptions,
    postponeAppointment1:postponeAppointment,
    getInsuranceList,
    downloadPrescription
  } = useContext(MyContext);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPostponeForm, setShowPostponeForm] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState([{ medicineId: '', dose: '', timing: '', days: '' }]);
  const [insuranceImage, setInsuranceImage] = useState(null);

  const [prescriptionData, setPrescriptionData] = useState({
    Advice: '',
    AnyAdvice: '',
    SpecialInstruction: '',
    NextAppoinment: '',
    UserId: '',
    addInsuranceTypeId: ''
  });

  const [postponeData, setPostponeData] = useState({
    StartDate: '',
    selectavailbilty: 'Morning',
    StartTime: '',
    EndTime: '',
    AppointmentId: ''
  });

  // Fetch insurance list on component mount
  useEffect(() => {
    getInsuranceList();
    getMedicineData();
  }, []);

  // Handle prescription form changes
  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  // Handle medicine selection changes
  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines[index][field] = value;
    setSelectedMedicines(updatedMedicines);
  };

  // Add new medicine row
  const addMedicineRow = () => {
    setSelectedMedicines([...selectedMedicines, { medicineId: '', dose: '', timing: '', days: '' }]);
  };

  // Remove medicine row
  const removeMedicineRow = (index) => {
    if (selectedMedicines.length > 1) {
      const updatedMedicines = selectedMedicines.filter((_, i) => i !== index);
      setSelectedMedicines(updatedMedicines);
    }
  };

  // Handle insurance image upload
  const handleInsuranceImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setInsuranceImage(file);
    }
  };

  // Handle postpone form changes
  const handlePostponeChange = (e) => {
    const { name, value } = e.target;
    setPostponeData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  // Fetch prescriptions for appointment
  const handleFetchPrescriptions = () => {
    if (!appointmentId.trim()) {
      setError('Please enter an Appointment ID');
      return;
    }
    getAllPrescriptions(appointmentId);
  };

  // Submit prescription form
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!prescriptionData.Advice || !appointmentId) {
      setError('Please fill all required fields');
      return;
    }

    const hasEmptyMedicine = selectedMedicines.some(med => 
      !med.medicineId || !med.dose || !med.timing || !med.days
    );

    if (hasEmptyMedicine) {
      setError('Please fill all medicine fields');
      return;
    }

    const prescriptionPayload = {
      ...prescriptionData,
      AppointmentId: appointmentId,
      MedicineId: selectedMedicines.map(med => med.medicineId),
      Dose: selectedMedicines.map(med => med.dose),
      Timeing: selectedMedicines.map(med => med.timing),
      Days: selectedMedicines.map(med => med.days),
      UserId: selectedPrescription?.userId?._id || ''
    };

    try {
      const response = await createDoctorPrescription(prescriptionPayload, insuranceImage);
      if (response.success) {
        setShowCreateForm(false);
        setPrescriptionData({
          Advice: '',
          AnyAdvice: '',
          SpecialInstruction: '',
          NextAppoinment: '',
          UserId: '',
          addInsuranceTypeId: ''
        });
        setSelectedMedicines([{ medicineId: '', dose: '', timing: '', days: '' }]);
        setInsuranceImage(null);
      }
    } catch (err) {
      console.error('Error submitting prescription:', err);
    }
  };

  // Submit postpone form
  const handlePostponeSubmit = async (e) => {
    e.preventDefault();
    
    if (!postponeData.StartDate || !postponeData.StartTime || !postponeData.EndTime) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const response = await postponeAppointment({
        ...postponeData,
        AppointmentId: appointmentId
      });
      if (response.success) {
        setShowPostponeForm(false);
        setPostponeData({
          StartDate: '',
          selectavailbilty: 'Morning',
          StartTime: '',
          EndTime: '',
          AppointmentId: ''
        });
      }
    } catch (err) {
      console.error('Error postponing appointment:', err);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">Prescription Management</h4>
                <small className="text-muted">Manage patient prescriptions and appointments</small>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  disabled={loading}
                >
                  {showCreateForm ? 'Cancel' : 'Create Prescription'}
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => setShowPostponeForm(!showPostponeForm)}
                  disabled={loading}
                >
                  {showPostponeForm ? 'Cancel' : 'Postpone Appointment'}
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Error Message Display */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Appointment ID Input */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5>Enter Appointment Details</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Appointment ID"
                        value={appointmentId}
                        onChange={(e) => setAppointmentId(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <button
                        className="btn btn-info w-100"
                        onClick={handleFetchPrescriptions}
                        disabled={loading || !appointmentId.trim()}
                      >
                        {loading ? 'Loading...' : 'Fetch Details'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Prescription Form */}
              {showCreateForm && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Create New Prescription</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handlePrescriptionSubmit}>
                      {/* Medicine Section */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6>Medicines</h6>
                          <button type="button" className="btn btn-sm btn-success" onClick={addMedicineRow}>
                            Add Medicine
                          </button>
                        </div>
                        
                        {selectedMedicines.map((medicine, index) => (
                          <div key={index} className="row mb-3 border-bottom pb-3">
                            <div className="col-md-3">
                              <label className="form-label">Medicine *</label>
                              <select
                                className="form-select"
                                value={medicine.medicineId}
                                onChange={(e) => handleMedicineChange(index, 'medicineId', e.target.value)}
                                required
                              >
                                <option value="">Select Medicine</option>
                                {medicines.map(med => (
                                  <option key={med._id} value={med._id}>{med.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Dose *</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="e.g., 1-0-1"
                                value={medicine.dose}
                                onChange={(e) => handleMedicineChange(index, 'dose', e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Timing *</label>
                              <select
                                className="form-select"
                                value={medicine.timing}
                                onChange={(e) => handleMedicineChange(index, 'timing', e.target.value)}
                                required
                              >
                                <option value="">Select Timing</option>
                                <option value="Before Meal">Before Meal</option>
                                <option value="After Meal">After Meal</option>
                                <option value="With Meal">With Meal</option>
                              </select>
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Days *</label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="e.g., 7"
                                value={medicine.days}
                                onChange={(e) => handleMedicineChange(index, 'days', e.target.value)}
                                min="1"
                                required
                              />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                              {selectedMedicines.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeMedicineRow(index)}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Advice Section */}
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Advice *</label>
                          <textarea
                            className="form-control"
                            name="Advice"
                            value={prescriptionData.Advice}
                            onChange={handlePrescriptionChange}
                            rows="3"
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Any Additional Advice</label>
                          <textarea
                            className="form-control"
                            name="AnyAdvice"
                            value={prescriptionData.AnyAdvice}
                            onChange={handlePrescriptionChange}
                            rows="3"
                          />
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Special Instructions</label>
                          <input
                            type="text"
                            className="form-control"
                            name="SpecialInstruction"
                            value={prescriptionData.SpecialInstruction}
                            onChange={handlePrescriptionChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Next Appointment Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="NextAppoinment"
                            value={prescriptionData.NextAppoinment}
                            onChange={handlePrescriptionChange}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      {/* Insurance Section */}
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Insurance Type</label>
                          <select
                            className="form-select"
                            name="addInsuranceTypeId"
                            value={prescriptionData.addInsuranceTypeId}
                            onChange={handlePrescriptionChange}
                          >
                            <option value="">Select Insurance</option>
                            {insuranceList.map(insurance => (
                              <option key={insurance._id} value={insurance._id}>{insurance.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Insurance Document</label>
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*,.pdf"
                            onChange={handleInsuranceImageChange}
                          />
                        </div>
                      </div>

                      <div className="text-end">
                        <button type="submit" className="btn btn-success" disabled={loading}>
                          {loading ? 'Creating...' : 'Create Prescription'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Postpone Appointment Form */}
              {showPostponeForm && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Postpone Appointment</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handlePostponeSubmit}>
                      <div className="row">
                        <div className="col-md-3 mb-3">
                          <label className="form-label">New Date *</label>
                          <input
                            type="date"
                            className="form-control"
                            name="StartDate"
                            value={postponeData.StartDate}
                            onChange={handlePostponeChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Session *</label>
                          <select
                            className="form-select"
                            name="selectavailbilty"
                            value={postponeData.selectavailbilty}
                            onChange={handlePostponeChange}
                            required
                          >
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Evening">Evening</option>
                          </select>
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Start Time *</label>
                          <input
                            type="time"
                            className="form-control"
                            name="StartTime"
                            value={postponeData.StartTime}
                            onChange={handlePostponeChange}
                            required
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">End Time *</label>
                          <input
                            type="time"
                            className="form-control"
                            name="EndTime"
                            value={postponeData.EndTime}
                            onChange={handlePostponeChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="text-end">
                        <button type="submit" className="btn btn-warning" disabled={loading}>
                          {loading ? 'Postponing...' : 'Postpone Appointment'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Prescriptions List */}
              <div className="card">
                <div className="card-header">
                  <h5>Prescription History</h5>
                </div>
                <div className="card-body">
                  {loading && prescriptions.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : prescriptions.length === 0 ? (
                    <div className="text-center py-4">
                      No prescriptions found for this appointment.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Advice</th>
                            <th>Medicines</th>
                            <th>Special Instructions</th>
                            <th>Next Appointment</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescriptions.map((prescription) => (
                            <tr key={prescription._id}>
                              <td>{prescription.Advice}</td>
                              <td>
                                {prescription.MedicineId && prescription.MedicineId.map(med => (
                                  <span key={med._id} className="badge bg-primary me-1">
                                    {med.name}
                                  </span>
                                ))}
                              </td>
                              <td>{prescription.SpecialInstruction || 'N/A'}</td>
                              <td>{prescription.NextAppoinment || 'Not scheduled'}</td>
                              <td>
                                {prescription.pdfUrl && (
                                  <button
                                    className="btn btn-info btn-sm"
                                    onClick={() => downloadPrescription(prescription.pdfUrl)}
                                  >
                                    Download PDF
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              {selectedPrescription && (
                <div className="card mt-4">
                  <div className="card-header">
                    <h5>Appointment Details</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Patient:</strong> {selectedPrescription.userId?.name || 'N/A'}</p>
                        <p><strong>Date:</strong> {selectedPrescription.date || 'N/A'}</p>
                        <p><strong>Time Slot:</strong> {selectedPrescription.timeSlot || 'N/A'}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Gender:</strong> {selectedPrescription.gender || 'N/A'}</p>
                        <p><strong>Address:</strong> {selectedPrescription.address || 'N/A'}</p>
                        <p><strong>Status:</strong> 
                          <span className={`badge ${selectedPrescription.PostponeStaus === '1' ? 'bg-warning' : 'bg-success'} ms-2`}>
                            {selectedPrescription.PostponeStaus === '1' ? 'Postponed' : 'Active'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPrescription;