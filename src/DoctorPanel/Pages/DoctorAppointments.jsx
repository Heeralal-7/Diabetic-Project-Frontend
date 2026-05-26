import React, { useEffect, useState, useContext } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Nav,
  Tab,
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { MyContext } from "../../Context/Context";
import VideoCallComponent from "./VideoCall.jsx";
import AudioCallComponent from "./AudioCall.jsx";
import ChatComponent from "./Chat.jsx";
import "../css/DoctorAppointments.css";

// Helper function for date formatting (frontend display)
const formatDateForFrontend = (dateString) => {
  if (!dateString) return "N/A";

  if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return dateString;
  }
  
  let date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function for date formatting (backend/database format: DD/MM/YYYY)
const formatDateForBackend = (dateObj) => {
  if (!(dateObj instanceof Date && !isNaN(dateObj.getTime()))) return "";
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to convert 24-hour time (HH:MM) to 12-hour format (HH:MM AM/PM) for the database
const formatTimeForBackendPostpone = (time24hr) => {
  if (!time24hr || !time24hr.match(/^\d{2}:\d{2}$/)) return "";
  
  const [hours, minutes] = time24hr.split(':');
  let h = parseInt(hours, 10);
  const m = minutes;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h === 0 ? 12 : h; 
  
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
};


const DoctorAppointments = () => {
  const {
    getDoctorAppointments,
    acceptOrRejectAppointment,
    postponeAppointment, 
    markPaymentDone,
    fetchMedicineData,
    getInsuranceList,
    createFinalPrescription,
    getExistingPrescription,
    sendCallNotification,
    endCall,
    deleteAppointment, // Fetched from context
    loading,
    error,
  } = useContext(MyContext);

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState({
    pending: [],
    accepted: [],
    postponed: [],
    rejected: [],
    done: [],
  });

  // Modals states
  const [showPrescribe, setShowPrescribe] = useState(false);
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [prescriptionDetails, setPrescriptionDetails] = useState(null);
  const [fetchingPrescription, setFetchingPrescription] = useState(false);

  // Call and Chat states
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedApptForDetails, setSelectedApptForDetails] = useState(null);
  const [activeCallTab, setActiveCallTab] = useState(null);

  // Prescription Form State 
  const [adviceInvestigation, setAdviceInvestigation] = useState("");
  const [anyAdvice, setAnyAdvice] = useState("");
  const [specialInstruction, setSpecialInstruction] = useState("");
  const [nextAppointment, setNextAppointment] = useState(""); 
  
  const [medicationDetails, setMedicationDetails] = useState([{
    MedicineId: "", 
    Dose: "",       
    Timeing: "",    
    Days: "",       
  }]);

  // Dropdown Data States
  const [medicineList, setMedicineList] = useState([]);
  const [insuranceList, setInsuranceList] = useState([]);

  // Insurance State for Prescription
  const [addInsuranceTypeId, setAddInsuranceTypeId] = useState("");
  const [insuranceImage, setInsuranceImage] = useState(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  // Postpone Form State
  const [newPostponeDate, setNewPostponeDate] = useState("");
  const [newPostponeStartTime, setNewPostponeStartTime] = useState("");
  const [newPostponeEndTime, setNewPostponeEndTime] = useState("");

  // Fetch appointments and filter them
  const fetchAndFilterAppointments = async () => {
    const data = await getDoctorAppointments();
    if (data) {
      // ✅ LOGIC ADDED: Sort data to show LATEST FIRST
      const sortedData = data.sort((a, b) => {
        const timeA = a.appointment?.createdAt ? new Date(a.appointment.createdAt).getTime() : 0;
        const timeB = b.appointment?.createdAt ? new Date(b.appointment.createdAt).getTime() : 0;
        
        if (timeA !== timeB && timeA > 0 && timeB > 0) {
          return timeB - timeA; // Descending by createdAt
        }
        
        // Fallback: Use MongoDB _id for sorting chronologically if createdAt is missing
        const idA = a.appointment?._id || "";
        const idB = b.appointment?._id || "";
        return idB.localeCompare(idA); 
      });

      const pending = sortedData.filter(appt => appt.appointment?.status === "0");
      const accepted = sortedData.filter(appt => appt.appointment?.status === "1");
      const postponed = sortedData.filter(appt => appt.appointment?.status === "6");
      const rejected = sortedData.filter(appt => appt.appointment?.status === "2");
      const done = sortedData.filter(appt => appt.appointment?.status === "3");

      setFilteredAppointments({
        pending,
        accepted,
        postponed,
        rejected,
        done,
      });
      setAppointments(sortedData);
    }
  };

  // Fetch dropdown data (Medicines and Insurance)
  const fetchDropdownData = async () => {
    setMedicineList([]);
    setInsuranceList([]);
    
    // 1. Fetch Medicines
    try {
      const medResult = await fetchMedicineData();
      if (medResult && medResult.success === 1) {
        setMedicineList(medResult.details);
      }
    } catch (error) {
      console.error("Error fetching medicine list:", error);
    }

    // 2. Fetch Insurance
    try {
      const insResult = await getInsuranceList();
      if (insResult && insResult.success === 1) {
        setInsuranceList(insResult.details);
      }
    } catch (error) {
      console.error("Error fetching insurance list:", error);
    }
  };
  
  useEffect(() => {
    fetchAndFilterAppointments();
  }, []);

  // --- Action Handlers ---
  const handleAcceptReject = async (appt, status) => {
    const ok = await acceptOrRejectAppointment(appt.appointment._id, status);
    if (ok) {
      fetchAndFilterAppointments();
    }
  };

  const handleOpenPostponeModal = (appt) => {
    setSelectedAppt(appt);
    setShowPostponeModal(true);
    setNewPostponeDate("");
    setNewPostponeStartTime("");
    setNewPostponeEndTime("");
  };

  const handlePostponeSubmit = async () => {
    if (!selectedAppt) {
      toast.error("No appointment selected for postponement.");
      return;
    }
    if (!newPostponeDate || !newPostponeStartTime || !newPostponeEndTime) {
      toast.error("Please fill in all date and time fields.");
      return;
    }

    const [startH, startM] = newPostponeStartTime.split(':').map(Number);
    const [endH, endM] = newPostponeEndTime.split(':').map(Number);
    const startTimeInMinutes = startH * 60 + startM;
    const endTimeInMinutes = endH * 60 + endM;

    if (endTimeInMinutes <= startTimeInMinutes) {
        toast.error("End time must be after start time.");
        return;
    }

    let tempDate;
    try {
        tempDate = new Date(`${newPostponeDate}T00:00:00`); 
        if (isNaN(tempDate.getTime())) throw new Error("Invalid date");
    } catch (e) {
        toast.error("Invalid date selected.");
        return;
    }
    
    const appointmentId = selectedAppt.appointment._id;
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formattedDay = daysOfWeek[tempDate.getDay()];

    const finalPostponeData = {
        day: formattedDay,
        date: formatDateForBackend(tempDate), 
        startTime: newPostponeStartTime, 
        endTime: newPostponeEndTime,     
        appointmentId: appointmentId,
    };

    try {
      const response = await postponeAppointment(finalPostponeData);
      if (response) {
        fetchAndFilterAppointments();
        setShowPostponeModal(false);
        setSelectedAppt(null);
      }
    } catch (error) {
      console.error("Error postponing appointment:", error);
      toast.error("An error occurred while postponing the appointment.");
    }
  };

  const handleClosePostponeModal = () => {
    setShowPostponeModal(false);
    setNewPostponeDate("");
    setNewPostponeStartTime("");
    setNewPostponeEndTime("");
    setSelectedAppt(null);
  };

  const handlePaymentDone = async (appt) => {
    const ok = await markPaymentDone(appt.appointment._id, appt?.appointment?.paymentDetails?.upiRef || "UPI123456");
    if (ok) {
      fetchAndFilterAppointments();
    }
  };

  // Delete Appointment Handler
  const handleDeleteAppointment = async (appt) => {
    const appointmentId = appt.appointment?._id;
    if (!appointmentId) return;

    // Confirm before delete
    const confirmDelete = window.confirm("Are you sure you want to delete this appointment? This action cannot be undone.");
    if (confirmDelete) {
      const success = await deleteAppointment(appointmentId);
      if (success) {
        fetchAndFilterAppointments(); // Refresh list after successful delete
      }
    }
  };

  const handleOpenPrescribeModal = (appt) => {
    setSelectedAppt(appt);
    fetchDropdownData(); 
    setShowPrescribe(true);

    setAdviceInvestigation(""); setAnyAdvice(""); setSpecialInstruction(""); setNextAppointment("");
    setAddInsuranceTypeId(""); setInsuranceImage(null);
    setMedicationDetails([{ MedicineId: "", Dose: "", Timeing: "", Days: "" }]);
    setPrescriptionLoading(false);
  };

  const handleMedicineChange = (index, field, value) => {
    const newDetails = medicationDetails.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setMedicationDetails(newDetails);
  };

  const handleAddMedicine = () => {
    setMedicationDetails([...medicationDetails, {
      MedicineId: "", Dose: "", Timeing: "", Days: ""
    }]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicationDetails.length > 1) {
      setMedicationDetails(medicationDetails.filter((_, i) => i !== index));
    } else {
      toast.warn("Must have at least one medicine entry.");
    }
  };

  const handleCreateFinalPrescription = async () => {
    if (!selectedAppt || !selectedAppt.appointment?.userId) {
      toast.error("No appointment or User ID selected.");
      return;
    }

    const requiredFields = [
      { value: adviceInvestigation, name: "Advice & Investigation" },
      { value: nextAppointment, name: "Next Appointment Date" },
      ...medicationDetails.flatMap((med, i) => [
        { value: med.MedicineId, name: `Medicine ${i + 1} Name` },
        { value: med.Dose, name: `Medicine ${i + 1} Dose` },
        { value: med.Timeing, name: `Medicine ${i + 1} Timing` },
        { value: med.Days, name: `Medicine ${i + 1} Days` },
      ])
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        toast.error(`Please enter: ${field.name}`);
        return;
      }
    }

    setPrescriptionLoading(true);

    const formData = new FormData();
    formData.append("appointmentId", selectedAppt.appointment._id);
    formData.append("UserId", selectedAppt.appointment.userId._id || selectedAppt.appointment.userId); 
    
    formData.append("Advice", adviceInvestigation);
    formData.append("AnyAdvice", anyAdvice);
    formData.append("SpecialInstruction", specialInstruction);
    formData.append("NextAppoinment", nextAppointment); 
    
    medicationDetails.forEach(med => {
      formData.append("MedicineId", med.MedicineId);
      formData.append("Dose", med.Dose);
      formData.append("Timeing", med.Timeing);
      formData.append("Days", med.Days);
    });

    if (addInsuranceTypeId) formData.append("addInsuranceTypeId", addInsuranceTypeId);
    if (insuranceImage) formData.append("insuranceImage", insuranceImage);

    try {
      const response = await createFinalPrescription(formData); 
      
      if (response && response.success === 1) {
        await handleAcceptReject(selectedAppt, 3);
        handleClosePrescribeModal();
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast.error("An error occurred while creating the prescription.");
    } finally {
      setPrescriptionLoading(false);
    }
  };
  
  const handleClosePrescribeModal = () => {
    setShowPrescribe(false);
    setSelectedAppt(null);
    setPrescriptionLoading(false);
  };


  // --- Call/Chat Handlers ---

  const initiateCall = async (appt, type) => {
    const appointment = appt.appointment;
    if (appointment?.status !== "1") {
      toast.warn(`Appointment must be accepted to start a ${type} call.`);
      return;
    }

    const patientRegId = getPatientRegId(appt); 
    const channelName = appointment._id; // Using appointment ID as channel name

    if (!patientRegId) {
        toast.error("Patient device not registered for notifications.");
        return;
    }
    
    try {
        toast.info(`Sending ${type} call invitation...`);
        // 1. Send FCM notification to patient (which includes Agora token generation)
        const notificationResult = await sendCallNotification(
            patientRegId, 
            channelName, 
            type, 
            appointment._id
        );

        if (notificationResult?.success) {
            // 2. Start the UI only if notification sending was successful
            setSelectedAppt(appt);
            setActiveCallTab(type === 'video' ? 'videoCall' : 'audioCall');
            toast.success("Call initiated. Waiting for patient to join.");
        } else {
            toast.error(notificationResult?.message || "Failed to send call notification.");
        }
    } catch (error) {
        console.error(`Error starting ${type} call:`, error);
        toast.error(`Error starting ${type} call.`);
    }
  };

  const handleStartVideoCall = (appt) => initiateCall(appt, 'video');
  const handleStartAudioCall = (appt) => initiateCall(appt, 'audio');

  const handleStartChat = (appt) => {
     if (appt.appointment?.status !== "1") {
      toast.warn("Appointment must be accepted to start a chat.");
      return;
    }
    setSelectedAppt(appt);
    setActiveCallTab('chat');
  };

  const handleCallEnd = async () => {
    if (selectedAppt && activeCallTab !== 'chat') {
        const appointmentId = selectedAppt.appointment._id;
        try {
            await endCall(appointmentId);
            toast.success("Call ended and status updated.");
            // Refresh appointments to show updated callStatus
            fetchAndFilterAppointments(); 
        } catch (error) {
            toast.error("Failed to end call status on server.");
        }
    }
    setActiveCallTab(null);
    setSelectedAppt(null);
  };


  // Handle row click to open Details Modal and fetch Prescription
  const handleRowClick = async (appt) => {
    setSelectedApptForDetails(appt);
    setPrescriptionDetails(null);
    setShowDetailsModal(true);

    if (appt.appointment?.status === "3" || appt.appointment?.prescribe) {
        setFetchingPrescription(true);
        try {
            const appointmentId = appt.appointment._id;
            const prescriptionResult = await getExistingPrescription(appointmentId);
            if (prescriptionResult?.success === 1 && prescriptionResult.prescriptionDetails.length > 0) {
                // If the API returns multiple, pick the last one or the most relevant
                setPrescriptionDetails(prescriptionResult.prescriptionDetails[0]); 
            } else {
                setPrescriptionDetails({ message: "No final prescription found for this appointment." });
            }
        } catch (error) {
            setPrescriptionDetails({ message: "Failed to load prescription details." });
        } finally {
            setFetchingPrescription(false);
        }
    }
  };


  // Data structure helper
  const getAppointmentData = (appt) => {
    if (appt?.appointment) {
      return {
        appointment: appt.appointment,
        patient: appt.patient || {},
        user: appt.user || {}
      };
    }
    return {
      appointment: appt,
      patient: {},
      user: {}
    };
  };

  // TEMPORARY: Always return regId for testing
const getPatientRegId = (appt) => {
  // Aapke response ke hisaab se: appt.user.regId mein token hai
  const token = appt?.user?.regId;

  if (token) {
    console.log("Found Patient Token:", token);
    return token;
  } else {
    console.warn("RegId not found for this user in database.");
    return "";
  }
};
  
  // TEMPORARY: Always return true for testing
  const isPatientOnline = (appt) => {
    return true;
  };

  // Render table rows for a given appointment list
  const renderAppointmentsTable = (appointmentList) => (
    <Table striped bordered hover responsive className="appointments-table">
      <thead>
        <tr>
          <th>Patient</th>
          <th>Service</th>
          <th>Date</th>
          <th>Time</th>
          <th>Payment Status</th>
          <th>Problem Description</th>
          <th>Call/Chat</th>
          <th>Actions</th>
          <th>Delete</th> {/* Separate Delete Column */}
        </tr>
      </thead>
      <tbody>
        {appointmentList.length === 0 ? (
          <tr>
            <td colSpan="9" className="text-center">No appointments found in this category.</td>
          </tr>
        ) : (
          appointmentList.map((appt, i) => {
            const appointmentData = getAppointmentData(appt);
            const { appointment, patient, user } = appointmentData;
            
            const isAccepted = appointment?.status === "1" || appointment?.status === 1;
            const isDone = appointment?.status === "3" || appointment?.status === 3;
            const isPostponed = appointment?.status === "6" || appointment?.status === 6;
            const isRejected = appointment?.status === "2" || appointment?.status === 2;
            const isPending = appointment?.status === "0" || appointment?.status === 0;
            const isOnline = isPatientOnline(appt);

            return (
              <tr
                key={i}
                onClick={() => handleRowClick(appt)}
                className="clickable-row"
              >
                <td>
                  <div>
                    <strong>{patient?.name || "N/A"}</strong>
                    {isOnline && <Badge bg="success" className="ms-1">Online</Badge>}
                  </div>
                </td>
                <td>{appointment?.serviceType || "N/A"}</td>
                <td>{formatDateForFrontend(appointment?.date)}</td>
                <td>{appointment?.timeSlot || "N/A"}</td>
                <td>
                  {appointment?.isPaid ? 
                    <Badge bg="success">Paid</Badge> : 
                    <Badge bg="warning">Unpaid</Badge>
                  }
                  {appointment?.paymentDetails?.upiRef && ` (${appointment.paymentDetails.upiRef})`}
                </td>
                <td className="problem-description">
                  {appointment?.problemDescription ? 
                    appointment.problemDescription.length > 50 ? 
                      `${appointment.problemDescription.substring(0, 50)}...` : 
                      appointment.problemDescription 
                    : "N/A"}
                </td>
                
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="call-chat-buttons">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStartVideoCall(appt)}
                      disabled={!isAccepted || isDone || isPostponed || isRejected}
                    >
                      <i className="fas fa-video"></i> Video
                    </Button>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleStartAudioCall(appt)}
                      disabled={!isAccepted || isDone || isPostponed || isRejected}
                    >
                      <i className="fas fa-phone"></i> Audio
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleStartChat(appt)}
                      disabled={!isAccepted || isDone || isPostponed || isRejected}
                    >
                      <i className="fas fa-comment"></i> Chat
                    </Button>
                  </div>
                </td>

                <td onClick={(e) => e.stopPropagation()}>
                  <div className="management-buttons">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleAcceptReject(appt, 1)}
                      disabled={!isPending}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleAcceptReject(appt, 2)}
                      disabled={!isPending}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleOpenPostponeModal(appt)}
                      disabled={isRejected || isDone}
                    >
                      Postpone
                    </Button>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handlePaymentDone(appt)}
                      disabled={appointment?.isPaid || isDone}
                    >
                      Mark Paid
                    </Button>
                   {isAccepted&&( <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenPrescribeModal(appt)}
                      disabled={isDone}
                    >
                      Prescribe
                    </Button>
                    )}
                  </div>
                </td>

                {/* Delete Action Column Data */}
                <td onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDeleteAppointment(appt)}
                    title="Delete Appointment"
                  >
                    <i className="fas fa-trash"></i> Delete
                  </Button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </Table>
  );

  // Render call/chat interface
  const renderCallInterface = () => {
    if (!selectedAppt || !activeCallTab) return null;

    const appointmentData = getAppointmentData(selectedAppt);
    const { appointment, patient, user } = appointmentData;

    const patientWithRegId = {
      ...patient,
      regId: getPatientRegId(selectedAppt)
    };

    return (
      <div className="call-chat-interface">
        <div className="call-header bg-primary text-white p-3 mb-3 rounded">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">
                {activeCallTab === 'videoCall' && <i className="fas fa-video me-2"></i>}
                {activeCallTab === 'audioCall' && <i className="fas fa-phone me-2"></i>}
                {activeCallTab === 'chat' && <i className="fas fa-comment me-2"></i>}
                {activeCallTab === 'videoCall' ? 'Video Call' : 
                 activeCallTab === 'audioCall' ? 'Audio Call' : 'Chat'} 
                with {patient?.name || 'Patient'}
              </h4>
              <small>Appointment: {formatDateForFrontend(appointment?.date)} | {appointment?.timeSlot}</small>
              <br />
              <small>Patient Status: Online</small>
            </div>
            <Button variant="light" onClick={handleCallEnd}>
              <i className="fas fa-times"></i> Close
            </Button>
          </div>
        </div>

        {activeCallTab === 'videoCall' && (
          <VideoCallComponent
            appointment={appointment}
            patientData={patientWithRegId}
            onCallEnd={handleCallEnd}
          />
        )}

        {activeCallTab === 'audioCall' && (
          <AudioCallComponent
            appointment={appointment}
            patientData={patientWithRegId}
            onCallEnd={handleCallEnd}
          />
        )}

        {activeCallTab === 'chat' && (
          <ChatComponent
            patientData={patientWithRegId}
            appointment={appointment}
            // Assuming ChatComponent handles its own sendChatNotification using the context function
          />
        )}
      </div>
    );
  };

  // If call/chat is active, show only that interface
  if (activeCallTab) {
    return (
      <div className="container mt-4">
        {renderCallInterface()}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3>Doctor Appointments</h3>

      {loading && <Spinner animation="border" />}

      <Tab.Container id="doctor-appointments-tabs" defaultActiveKey="pending">
        <Nav variant="tabs" className="custom-nav-tabs">
          <Nav.Item>
            <Nav.Link eventKey="pending">Pending ({filteredAppointments.pending.length})</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="accepted">Accepted ({filteredAppointments.accepted.length})</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="postponed">Postponed ({filteredAppointments.postponed.length})</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="rejected">Rejected ({filteredAppointments.rejected.length})</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="done">Completed ({filteredAppointments.done.length})</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="pending">
            {renderAppointmentsTable(filteredAppointments.pending)}
          </Tab.Pane>
          <Tab.Pane eventKey="accepted">
            {renderAppointmentsTable(filteredAppointments.accepted)}
          </Tab.Pane>
          <Tab.Pane eventKey="postponed">
            {renderAppointmentsTable(filteredAppointments.postponed)}
          </Tab.Pane>
          <Tab.Pane eventKey="rejected">
            {renderAppointmentsTable(filteredAppointments.rejected)}
          </Tab.Pane>
          <Tab.Pane eventKey="done">
            {renderAppointmentsTable(filteredAppointments.done)}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Prescribe Modal - UPDATED FOR createDoctorPrescription API */}
      <Modal show={showPrescribe} onHide={handleClosePrescribeModal} centered size="xl">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Create Final Prescription</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Form>
            <div className="row">
                <div className="col-md-4">
                    <Form.Group className="mb-3">
                    <Form.Label>Advice & Investigation <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type="text"
                        value={adviceInvestigation}
                        onChange={(e) => setAdviceInvestigation(e.target.value)}
                        placeholder="e.g., Blood test, X-ray"
                        required
                    />
                    </Form.Group>
                </div>
                <div className="col-md-4">
                    <Form.Group className="mb-3">
                    <Form.Label>Any Advice</Form.Label>
                    <Form.Control
                        type="text"
                        value={anyAdvice}
                        onChange={(e) => setAnyAdvice(e.target.value)}
                        placeholder="e.g., Diet changes"
                    />
                    </Form.Group>
                </div>
                <div className="col-md-4">
                    <Form.Group className="mb-3">
                    <Form.Label>Special Instruction</Form.Label>
                    <Form.Control
                        type="text"
                        value={specialInstruction}
                        onChange={(e) => setSpecialInstruction(e.target.value)}
                        placeholder="e.g., Rest for 3 days"
                    />
                    </Form.Group>
                </div>
            </div>

            <div className="row">
                <div className="col-md-4">
                    <Form.Group className="mb-3">
                    <Form.Label>Next Appointment <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type="date"
                        value={nextAppointment}
                        onChange={(e) => setNextAppointment(e.target.value)}
                        required
                    />
                    </Form.Group>
                </div>
                {/* Insurance Selection */}
                <div className="col-md-4">
                    <Form.Group className="mb-3">
                        <Form.Label>Insurance Type</Form.Label>
                        <Form.Control
                            as="select"
                            value={addInsuranceTypeId}
                            onChange={(e) => setAddInsuranceTypeId(e.target.value)}
                        >
                            <option value="">Select Insurance (Optional)</option>
                            {insuranceList.map(ins => (
                                <option key={ins._id} value={ins._id}>{ins.addInsurance}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </div>
                <div className="col-md-4">
                    <Form.Group className="mb-3">
                        <Form.Label>Insurance Image (Optional)</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={(e) => setInsuranceImage(e.target.files[0])}
                        />
                        <Form.Text className="text-muted">
                           {insuranceImage ? insuranceImage.name : 'Upload insurance card image.'}
                        </Form.Text>
                    </Form.Group>
                </div>
            </div>

            <h5 className="mt-4 mb-3">Medication Details <span className="text-danger">*</span></h5>
            
            {medicationDetails.map((med, index) => (
                <div key={index} className="border p-3 mb-3 rounded shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6>Medicine {index + 1}</h6>
                        {medicationDetails.length > 1 && (
                            <Button variant="danger" size="sm" onClick={() => handleRemoveMedicine(index)}>
                                <i className="fas fa-trash"></i> Remove
                            </Button>
                        )}
                    </div>
                    <div className="row">
                        <div className="col-md-3">
                            <Form.Group className="mb-3">
                                <Form.Label>Medicine Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    as="select"
                                    value={med.MedicineId}
                                    onChange={(e) => handleMedicineChange(index, 'MedicineId', e.target.value)}
                                    required
                                >
                                    <option value="">Select Medicine</option>
                                    {medicineList.map(item => (
                                        <option key={item._id} value={item._id}>{item.name}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </div>
                        <div className="col-md-3">
                            <Form.Group className="mb-3">
                                <Form.Label>Dose <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={med.Dose}
                                    onChange={(e) => handleMedicineChange(index, 'Dose', e.target.value)}
                                    placeholder="e.g., 1 tablet"
                                    required
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-3">
                            <Form.Group className="mb-3">
                                <Form.Label>Timing <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={med.Timeing}
                                    onChange={(e) => handleMedicineChange(index, 'Timeing', e.target.value)}
                                    placeholder="e.g., M-A-E or After Meal"
                                    required
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-3">
                            <Form.Group className="mb-3">
                                <Form.Label>Duration (Days) <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    value={med.Days}
                                    onChange={(e) => handleMedicineChange(index, 'Days', e.target.value)}
                                    placeholder="e.g., 7"
                                    required
                                />
                            </Form.Group>
                        </div>
                    </div>
                </div>
            ))}
            
            <Button variant="outline-primary" onClick={handleAddMedicine} className="mb-3">
                <i className="fas fa-plus"></i> Add Another Medicine
            </Button>
            
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={handleClosePrescribeModal} disabled={prescriptionLoading}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleCreateFinalPrescription} disabled={prescriptionLoading}>
            {prescriptionLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating PDF...
              </>
            ) : (
              'Create & Finalize Prescription'
            )}
          </Button>
        </Modal.Footer>
      </Modal>


      {/* Postpone Modal */}
      <Modal show={showPostponeModal} onHide={handleClosePostponeModal} centered size="md">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Postpone Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>New Date</Form.Label>
              <Form.Control
                type="date"
                value={newPostponeDate}
                onChange={(e) => setNewPostponeDate(e.target.value)}
                required
              />
            </Form.Group>
            <div className="row">
                <div className="col-md-6">
                    <Form.Group className="mb-3">
                    <Form.Label>Start Time</Form.Label>
                    <Form.Control
                        type="time"
                        value={newPostponeStartTime}
                        onChange={(e) => setNewPostponeStartTime(e.target.value)}
                        required
                    />
                    </Form.Group>
                </div>
                <div className="col-md-6">
                    <Form.Group className="mb-3">
                    <Form.Label>End Time</Form.Label>
                    <Form.Control
                        type="time"
                        value={newPostponeEndTime}
                        onChange={(e) => setNewPostponeEndTime(e.target.value)}
                        required
                    />
                    </Form.Group>
                </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={handleClosePostponeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePostponeSubmit}>
            Postpone Appointment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Appointment Details Modal - ENHANCED FOR PRESCRIPTION HISTORY */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="xl" centered>
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Appointment Details & Order History</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedApptForDetails && (
            <div className="appointment-details-content">
              
              {/* Appointment Information Section */}
              <section className="mb-4 border-bottom pb-3">
                <h4><i className="fas fa-calendar-alt me-2"></i> Appointment Information</h4>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <strong>Service Type:</strong> {selectedApptForDetails?.appointment?.serviceType || 'N/A'}
                  </div>
                  <div className="col-md-3 mb-3">
                    <strong>Date:</strong> {formatDateForFrontend(selectedApptForDetails?.appointment?.date)}
                  </div>
                  <div className="col-md-3 mb-3">
                    <strong>Time Slot:</strong> {selectedApptForDetails?.appointment?.timeSlot || 'N/A'}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <strong>Price:</strong> {selectedApptForDetails?.appointment?.price || 'N/A'}
                  </div>
                  <div className="col-md-4 mb-3">
                    <strong>Payment Status:</strong>
                    <span className={`badge ms-1 ${selectedApptForDetails?.appointment?.isPaid ? 'bg-success' : 'bg-warning'}`}>
                      {selectedApptForDetails?.appointment?.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <div className="col-md-4 mb-3">
                    <strong>Appointment Status:</strong>
                    <span className={`ms-1 badge ${
                      selectedApptForDetails?.appointment?.status === "1" ? "bg-primary" :
                      selectedApptForDetails?.appointment?.status === "2" ? "bg-danger" :
                      selectedApptForDetails?.appointment?.status === "6" ? "bg-info" : 
                      selectedApptForDetails?.appointment?.status === "3" ? "bg-success" : "bg-secondary"
                    }`}>
                      {selectedApptForDetails?.appointment?.status === "1" ? "Accepted" :
                       selectedApptForDetails?.appointment?.status === "2" ? "Rejected" :
                       selectedApptForDetails?.appointment?.status === "6" ? "Postponed" : 
                       selectedApptForDetails?.appointment?.status === "3" ? "Done" : "Pending"}
                    </span>
                  </div>
                </div>
                <p className="mt-3"><strong>Problem Description:</strong> {selectedApptForDetails?.appointment?.problemDescription || 'N/A'}</p>
              </section>

              {/* Patient Information Section */}
              <section className="mb-4 border-bottom pb-3">
                <h4><i className="fas fa-user-alt me-2"></i> Patient Information</h4>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <strong>Name:</strong> {selectedApptForDetails?.patient?.name || 'N/A'}
                  </div>
                  <div className="col-md-4 mb-3">
                    <strong>DOB:</strong> {selectedApptForDetails?.patient?.dob || 'N/A'}
                  </div>
                  <div className="col-md-4 mb-3">
                    <strong>Phone:</strong> {selectedApptForDetails?.patient?.phone || 'N/A'}
                  </div>
                </div>
                <p><strong>Address:</strong> {selectedApptForDetails?.patient?.address || 'N/A'}, {selectedApptForDetails?.patient?.city || 'N/A'}, {selectedApptForDetails?.patient?.state || 'N/A'}, {selectedApptForDetails?.patient?.country || 'N/A'} - {selectedApptForDetails?.patient?.pinCode || 'N/A'}</p>
              </section>

              {/* Prescription Details Section (Order History) */}
              <section className="mb-4">
                <h4><i className="fas fa-file-prescription me-2"></i> Prescription Details (Order History)</h4>
                
                {selectedApptForDetails?.appointment?.status !== "3" && (
                    <Alert variant="info">Prescription is only available for **Done** appointments.</Alert>
                )}

                {selectedApptForDetails?.appointment?.status === "3" && fetchingPrescription && (
                    <div className="text-center py-3"><Spinner animation="border" size="sm" /> Loading Prescription...</div>
                )}

                {selectedApptForDetails?.appointment?.status === "3" && !fetchingPrescription && prescriptionDetails?.message && (
                    <Alert variant="warning">{prescriptionDetails.message}</Alert>
                )}

                {selectedApptForDetails?.appointment?.status === "3" && !fetchingPrescription && prescriptionDetails?._id && (
                    <div>
                        <div className="row">
                            <div className="col-md-6 mb-3"><strong>Advice & Investigation:</strong> {prescriptionDetails.adviceInvestigation || 'N/A'}</div>
                            <div className="col-md-6 mb-3"><strong>Next Appointment:</strong> {formatDateForFrontend(prescriptionDetails.nextAppointment)}</div>
                            <div className="col-md-6 mb-3"><strong>Any Advice:</strong> {prescriptionDetails.anyAdvice || 'N/A'}</div>
                            <div className="col-md-6 mb-3"><strong>Special Instruction:</strong> {prescriptionDetails.specialInstruction || 'N/A'}</div>
                        </div>

                        <h6 className="mt-3">Medications:</h6>
                        <Table bordered size="sm">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Dose</th>
                                    <th>Timing</th>
                                    <th>Days</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {/* Assuming MedicineId is an array of populated objects with 'name' */}
                                    <td>{prescriptionDetails.MedicineId?.map(m => m.name).join(', ') || 'N/A'}</td>
                                    <td>{Array.isArray(prescriptionDetails.Dose) ? prescriptionDetails.Dose.join(', ') : prescriptionDetails.Dose || 'N/A'}</td>
                                    <td>{Array.isArray(prescriptionDetails.Timeing) ? prescriptionDetails.Timeing.join(', ') : prescriptionDetails.Timeing || 'N/A'}</td>
                                    <td>{Array.isArray(prescriptionDetails.Days) ? prescriptionDetails.Days.join(', ') : prescriptionDetails.Days || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </Table>
                        
                        {prescriptionDetails.pdfUrl && (
                            <div className="mt-3">
                                {/* Ensure REACT_APP_API_URL is available in environment variables */}
                                <Button variant="success" href={`${process.env.REACT_APP_API_URL}${prescriptionDetails.pdfUrl}`} target="_blank">
                                    <i className="fas fa-file-pdf me-2"></i> View Prescription PDF
                                </Button>
                            </div>
                        )}
                    </div>
                )}
              </section>

              {/* User Information Section */}
              <section className="mb-4">
                <h4><i className="fas fa-info-circle me-2"></i> User Information (Booked By)</h4>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <strong>Name:</strong> {selectedApptForDetails?.user?.name || 'N/A'}
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Email:</strong> {selectedApptForDetails?.user?.email || 'N/A'}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <strong>Occupation:</strong> {selectedApptForDetails?.user?.occupation || 'N/A'}
                  </div>
                  <div className="col-md-4 mb-3">
                    <strong>Phone:</strong> {selectedApptForDetails?.user?.number || 'N/A'}
                  </div>
                  <div className="col-md-4 mb-3">
                    <strong>Blood Group:</strong> {selectedApptForDetails?.user?.bloodgroup || 'N/A'}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <strong>Diabetic Type:</strong> {selectedApptForDetails?.user?.diabteticType || 'N/A'}
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Diabetic Duration:</strong> {selectedApptForDetails?.user?.diabeticduration || 'N/A'}
                  </div>
                </div>
                <p><strong>Daily Activity:</strong> {selectedApptForDetails?.user?.dailyactivity || 'N/A'}</p>
              </section>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;