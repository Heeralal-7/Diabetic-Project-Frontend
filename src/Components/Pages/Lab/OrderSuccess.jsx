import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFlask, FaCalendarCheck, FaUserMd, FaFileMedical } from 'react-icons/fa';
import logo from "../../Assets/img/Logo.png";

const LabOrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Debugging: Console me check karein ki data kaisa aa raha hai
  useEffect(() => {
    console.log('LabOrderSuccess Received State:', state);
  }, [state]);

  // ✅ IMPROVED: Get Appointment ID (Multiple possible sources check)
  const getAppointmentId = () => {
    if (!state) return 'Generating...';

    // Priority based checking for appointment/order ID
    // 1. First check for appointment specific IDs
    if (state?.appointmentId) {
      return state.appointmentId;
    }
    
    // 2. Check booking data
    if (state?.bookingData?._id) {
      return state.bookingData._id;
    }
    
    if (state?.bookingData?.appointmentId) {
      return state.bookingData.appointmentId;
    }
    
    if (state?.bookingData?.bookingId) {
      return state.bookingData.bookingId;
    }
    
    // 3. Check order result structure
    if (state?.orderResult?.appointment?._id) {
      return state.orderResult.appointment._id;
    }
    
    if (state?.orderResult?.appointmentId) {
      return state.orderResult.appointmentId;
    }
    
    if (state?.orderResult?.order?._id) {
      return state.orderResult.order._id;
    }
    
    if (state?.orderResult?.data?._id) {
      return state.orderResult.data._id;
    }
    
    if (state?.orderResult?.data?.appointment?._id) {
      return state.orderResult.data.appointment._id;
    }
    
    // 4. Check state root level
    if (state?.orderId) {
      return state.orderId;
    }
    
    if (state?.orderResult?._id) {
      return state.orderResult._id;
    }
    
    // 5. Generate a temporary ID if nothing found
    return `LAB-${Date.now().toString().slice(-8)}`;
  };

  // ✅ IMPROVED: Get Payment ID (Handles Razorpay snake_case & COD)
  const getPaymentId = () => {
    if (!state) return 'Processing...';

    // Check for COD first
    const paymentMethod = state.paymentMethod || 
                         state.orderResult?.order?.paymentMethod ||
                         state.bookingData?.paymentMethod;
    
    if (paymentMethod === 'cod' || paymentMethod === 'COD') {
      return 'COD - Pay at Sample Collection';
    }

    // Check Online Payment IDs
    return (
      state.paymentId ||
      state.razorpayPaymentId ||                 // camelCase
      state.razorpay_payment_id ||               // snake_case (Razorpay default)
      state.orderResult?.paymentId ||
      state.orderResult?.razorpayPaymentId ||
      state.orderResult?.razorpay_payment_id ||
      state.orderResult?.order?.paymentId ||
      state.bookingData?.paymentId ||
      'Processing...'
    );
  };

  // Format address
  const formatAddress = (address) => {
    if (!address) return 'Address not available';
    
    if (typeof address === 'string') {
      return address;
    }
    
    if (Array.isArray(address)) {
      const addressParts = [
        address[4], // address
        address[7], // city
        address[6], // state
        address[8]  // pinCode
      ].filter(part => part && part.trim() !== '');
      
      return addressParts.join(', ') || 'Address not available';
    }
    
    // Object handling (e.g., from DB)
    if (typeof address === 'object') {
      const parts = [];
      if (address.address) parts.push(address.address);
      if (address.street) parts.push(address.street);
      if (address.landmark) parts.push(address.landmark);
      if (address.locality) parts.push(address.locality);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.pincode) parts.push(address.pincode);
      if (address.zipCode) parts.push(address.zipCode);
      
      return parts.length > 0 ? parts.join(', ') : 'Address not available';
    }
    
    return 'Address format not recognized';
  };

  // Get patient name
  const getPatientName = () => {
    // Check multiple possible sources
    if (state?.patientName) {
      return state.patientName;
    }
    
    if (state?.bookingData?.patientName) {
      return state.bookingData.patientName;
    }
    
    if (state?.bookingData?.selectedAddress?.name) {
      return state.bookingData.selectedAddress.name;
    }
    
    if (state?.bookingData?.selectedAddress?.fullName) {
      return state.bookingData.selectedAddress.fullName;
    }
    
    if (state?.orderResult?.patientDetails?.name) {
      return state.orderResult.patientDetails.name;
    }
    
    if (state?.orderResult?.order?.patientName) {
      return state.orderResult.order.patientName;
    }
    
    return 'Patient';
  };

  // Get patient phone
  const getPatientPhone = () => {
    if (state?.patientPhone) {
      return state.patientPhone;
    }
    
    if (state?.bookingData?.patientPhone) {
      return state.bookingData.patientPhone;
    }
    
    if (state?.bookingData?.selectedAddress?.phone) {
      return state.bookingData.selectedAddress.phone;
    }
    
    if (state?.orderResult?.patientDetails?.phone) {
      return state.orderResult.patientDetails.phone;
    }
    
    if (state?.orderResult?.order?.patientPhone) {
      return state.orderResult.order.patientPhone;
    }
    
    return 'Not available';
  };

  // Get patient email
  const getPatientEmail = () => {
    if (state?.patientEmail) {
      return state.patientEmail;
    }
    
    if (state?.bookingData?.patientEmail) {
      return state.bookingData.patientEmail;
    }
    
    if (state?.bookingData?.selectedAddress?.email) {
      return state.bookingData.selectedAddress.email;
    }
    
    return 'Not provided';
  };

  // Get patient age and gender
  const getPatientAgeGender = () => {
    const age = state?.patientAge || 
                state?.bookingData?.patientAge || 
                state?.orderResult?.patientDetails?.age || 
                'Not specified';
    
    const gender = state?.patientGender || 
                   state?.bookingData?.patientGender || 
                   state?.orderResult?.patientDetails?.gender || 
                   'Not specified';
    
    return `${age} years, ${gender}`;
  };

  // Get total amount
  const getTotalAmount = () => {
    return state?.finalTotal || 
           state?.grandTotal || 
           state?.price || 
           state?.bookingData?.totalAmount || 
           state?.orderResult?.order?.grandTotal || 
           state?.orderResult?.order?.price || 
           0;
  };

  // Get original amount before discount
  const getOriginalAmount = () => {
    return state?.baseCartTotal || 
           state?.originalTotal || 
           state?.bookingData?.originalTotal || 
           (getTotalAmount() + (getDiscountAmount() || 0));
  };

  // Get discount amount
  const getDiscountAmount = () => {
    return state?.discountAmount || 
           state?.bookingData?.discountAmount || 
           state?.orderResult?.order?.discount || 
           0;
  };

  // Get delivery/collection charges
  const getCollectionCharges = () => {
    return state?.deliveryCharges || 
           state?.homeCollectionCharges || 
           state?.bookingData?.collectionCharges || 
           state?.deliveryCalculation?.totalDelivery || 
           0;
  };

  // Get appointment date
  const getAppointmentDate = () => {
    const dateStr = state?.appointmentDate || 
                    state?.bookingDate || 
                    state?.bookingData?.selectedDate || 
                    state?.orderResult?.order?.appointmentDate || 
                    state?.orderResult?.order?.createdAt || 
                    state?.orderResult?.createdAt;
                    
    if (dateStr) {
      // If it's just a date string like "2025-01-01"
      if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return dateStr;
    }
    return new Date().toLocaleDateString();
  };

  // Get appointment time
  const getAppointmentTime = () => {
    return state?.appointmentTime || 
           state?.bookingData?.selectedSlot || 
           state?.bookingData?.selectedSession || 
           state?.orderResult?.order?.appointmentTime || 
           'Morning (9 AM - 1 PM)';
  };

  // Get appointment status
  const getAppointmentStatus = () => {
    return state?.appointmentStatus || 
           state?.bookingData?.status || 
           state?.orderResult?.order?.status || 
           state?.orderResult?.status || 
           'scheduled';
  };

  // Get payment status
  const getPaymentStatus = () => {
    const status = state?.paymentStatus || 
                   state?.orderResult?.order?.paymentStatus || 
                   state?.orderResult?.paymentStatus ||
                   state?.bookingData?.paymentStatus;
    
    // Logic: If Payment ID exists, it's likely completed/paid
    if (!status && (state?.paymentId || state?.razorpayPaymentId)) {
      return 'completed';
    }
    
    // Check if COD
    const paymentMethod = state?.paymentMethod || 
                         state?.orderResult?.order?.paymentMethod ||
                         state?.bookingData?.paymentMethod;
    
    if (paymentMethod === 'cod' || paymentMethod === 'COD') {
      return 'pending';
    }
    
    return status || 'completed';
  };

  // Get sample collection type
  const getCollectionType = () => {
    return state?.collectionType || 
           state?.bookingData?.collectionType || 
           state?.serviceType || 
           'Home Collection';
  };

  // Get test names as array
  const getTestNames = () => {
    if (state?.bookingData?.cartItems) {
      return state.bookingData.cartItems.map(item => 
        item.testName || item.packageName || 'Test'
      );
    }
    
    if (state?.tests) {
      return state.tests;
    }
    
    if (state?.selectedTests) {
      return state.selectedTests;
    }
    
    return ['Lab Test'];
  };

  // Get instructions
  const getInstructions = () => {
    return state?.instructions || 
           state?.bookingData?.instructions || 
           state?.orderResult?.order?.instructions || 
           [];
  };

  // Calculate test count
  const getTestCount = () => {
    if (state?.bookingData?.cartItems) {
      return state.bookingData.cartItems.length;
    }
    
    if (state?.tests) {
      return state.tests.length;
    }
    
    if (state?.selectedTests) {
      return state.selectedTests.length;
    }
    
    return 1;
  };

  // Handle navigation
  const handleViewAppointments = () => {
    navigate('/venders/labs/orders');
  };

  const handleContinueBooking = () => {
    navigate('/venders/labs');
  };

  const handleDownloadReport = () => {
    // Placeholder for download report functionality
    alert('Report download feature will be available soon!');
  };

const handleDownloadReceipt = async () => {

  const receiptHTML = `
  <div id="receipt">

    <style>

      body{
        font-family: Arial, sans-serif;
        background:#f7f7f7;
        padding:20px;
      }

      .receipt-container{
        max-width:800px;
        margin:auto;
        background:#fff;
        padding:30px;
        border-radius:10px;
        box-shadow:0 4px 12px rgba(0,0,0,0.08);
      }

      .header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        border-bottom:2px solid #eee;
        padding-bottom:15px;
        margin-bottom:20px;
      }

      .logo{
        height:60px;
      }

      .title{
        font-size:22px;
        font-weight:bold;
        color:#28a745;
      }

      h3{
        margin-top:25px;
        margin-bottom:10px;
        color:#333;
        border-bottom:1px solid #eee;
        padding-bottom:5px;
      }

      table{
        width:100%;
        border-collapse:collapse;
        margin-top:10px;
      }

      th,td{
        padding:10px;
        border-bottom:1px solid #eee;
        text-align:left;
      }

      th{
        background:#f5f5f5;
        width:40%;
      }

      .total{
        font-weight:bold;
        color:#28a745;
        font-size:16px;
      }

      .footer{
        margin-top:30px;
        text-align:center;
        font-size:12px;
        color:#888;
      }

    </style>

    <div class="receipt-container">

      <div class="header">
 <div>
    <img class="logo" src="${logo}" />
  </div>

  <div class="title">
    Lab Appointment Receipt
  </div>
</div>

      <h3>Patient Details</h3>

      <table>
        <tr>
          <th>Name</th>
          <td>${patientName}</td>
        </tr>
        <tr>
          <th>Phone</th>
          <td>${patientPhone}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td>${patientEmail}</td>
        </tr>
        <tr>
          <th>Age & Gender</th>
          <td>${patientAgeGender}</td>
        </tr>
      </table>

      <h3>Payment Details</h3>

      <table>
        <tr>
          <th>Payment ID</th>
          <td>${paymentId}</td>
        </tr>
        <tr>
          <th>Payment Status</th>
          <td>${paymentStatus}</td>
        </tr>
      </table>

      <h3>Price Details</h3>

      <table>
        <tr>
          <th>Tests Price</th>
          <td>₹${Number(originalAmount).toFixed(2)}</td>
        </tr>
        <tr>
          <th>Discount</th>
          <td>₹${Number(discountAmount).toFixed(2)}</td>
        </tr>
        <tr>
          <th>Collection Charges</th>
          <td>₹${Number(collectionCharges).toFixed(2)}</td>
        </tr>
        <tr class="total">
          <th>Total Paid</th>
          <td>₹${Number(totalAmount).toFixed(2)}</td>
        </tr>
      </table>

      <div class="footer">
        Thank you for choosing our diagnostic services.<br/>
        Appointment ID: ${appointmentId}
      </div>

    </div>

  </div>
  `;

  const element = document.createElement("div");
  element.innerHTML = receiptHTML;

  const html2pdf = (await import("html2pdf.js")).default;

  html2pdf().from(element).save("lab_receipt.pdf");

};
  

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
      case 'booked':
        return 'bg-success';
      case 'pending':
      case 'awaiting_confirmation':
        return 'bg-warning';
      case 'sample_collected':
      case 'sample_received':
        return 'bg-info';
      case 'processing':
      case 'in_progress':
        return 'bg-primary';
      case 'completed':
      case 'reported':
        return 'bg-success';
      case 'cancelled':
      case 'rejected':
        return 'bg-danger';
      case 'rescheduled':
        return 'bg-secondary';
      default:
        return 'bg-success';
    }
  };

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-success';
      case 'pending':
      case 'awaiting_payment':
        return 'bg-warning';
      case 'failed':
      case 'declined':
        return 'bg-danger';
      case 'refunded':
      case 'partially_refunded':
        return 'bg-info';
      default:
        return 'bg-success';
    }
  };

  // Format status text
  const formatStatusText = (status) => {
    const statusMap = {
      'scheduled': 'Scheduled',
      'confirmed': 'Confirmed',
      'pending': 'Pending Confirmation',
      'sample_collected': 'Sample Collected',
      'processing': 'Processing',
      'completed': 'Completed',
      'reported': 'Report Ready',
      'cancelled': 'Cancelled',
      'rescheduled': 'Rescheduled'
    };
    
    return statusMap[status?.toLowerCase()] || status || 'Scheduled';
  };

  // Safety check if accessed directly without state
  if (!state) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <h4>No Appointment Information Found</h4>
          <p>Please book a test first.</p>
          <button className="btn btn-primary" onClick={handleContinueBooking}>
            <FaFlask className="me-2" /> Go to Lab Booking
          </button>
        </div>
      </div>
    );
  }

  // Calculate values
  const appointmentId = getAppointmentId();
  const paymentId = getPaymentId();
  const patientName = getPatientName();
  const patientPhone = getPatientPhone();
  const patientEmail = getPatientEmail();
  const patientAgeGender = getPatientAgeGender();
  const totalAmount = getTotalAmount();
  const originalAmount = getOriginalAmount();
  const discountAmount = getDiscountAmount();
  const collectionCharges = getCollectionCharges();
  const appointmentDate = getAppointmentDate();
  const appointmentTime = getAppointmentTime();
  const appointmentStatus = getAppointmentStatus();
  const paymentStatus = getPaymentStatus();
  const collectionType = getCollectionType();
  const testNames = getTestNames();
  const testCount = getTestCount();
  const instructions = getInstructions();

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Success Header */}
          <div className="text-center mb-5">
            <div className="success-icon mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 className="text-success fw-bold">Appointment Confirmed!</h1>
            <p className="text-muted fs-5">
              Your lab tests have been scheduled successfully. {paymentStatus === 'pending' ? 'Please keep cash ready for sample collection.' : 'Your payment was successful.'}
            </p>
        
          </div>

          {/* Appointment Summary Card */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <FaCalendarCheck className="me-2" /> Appointment Summary
              </h5>
              <span className={`badge ${getStatusBadgeColor(appointmentStatus)} float-end fs-6`}>
                {formatStatusText(appointmentStatus)}
              </span>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Appointment ID:</strong> 
                    <div className="mt-1 font-monospace text-primary fw-bold text-break">
                      {appointmentId}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Payment ID:</strong> 
                    <div className="mt-1 font-monospace text-info text-break">
                      {paymentId}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Appointment Date:</strong> 
                    <div className="mt-1">
                      <i className="ri-calendar-line me-1"></i>
                      {appointmentDate}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Collection Type:</strong> 
                    <div className="mt-1">
                      <span className={`badge ${collectionType === 'Home Collection' ? 'bg-info' : 'bg-secondary'}`}>
                        {collectionType}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Payment Status:</strong> 
                    <div className="mt-1">
                      <span className={`badge ${getPaymentStatusBadgeColor(paymentStatus)} fs-6`}>
                        {paymentStatus?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Total Amount:</strong> 
                    <div className="mt-1 fs-5 text-success fw-bold">
                      ₹{Number(totalAmount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-top pt-3 mt-3">
                <h6 className="fw-bold mb-3">Price Breakdown</h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tests Total ({testCount} tests):</span>
                      <span>₹{Number(originalAmount).toFixed(2)}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Discount:</span>
                        <span>-₹{Number(discountAmount).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    {collectionCharges > 0 ? (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Home Collection Charges:</span>
                        <span>₹{Number(collectionCharges).toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Home Collection Charges:</span>
                        <span>FREE</span>
                      </div>
                    )}
                    
                    {state?.tax && state.tax > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tax (GST):</span>
                        <span>₹{Number(state.tax).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between mt-3 pt-2 border-top fw-bold">
                      <span>Total Amount:</span>
                      <span className="text-success">₹{Number(totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lab Information */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <FaFlask className="me-2" /> Lab Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Lab Name:</strong> 
                    <div className="mt-1 fw-bold text-primary">
                      {state?.bookingData?.lab?.name || 
                       state?.labName || 
                       state?.orderResult?.lab?.name || 
                       'Diagnostic Lab'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Phone:</strong> 
                    <div className="mt-1">
                      <i className="ri-phone-line me-1"></i>
                      {state?.bookingData?.lab?.phone || 
                       state?.labPhone || 
                       state?.orderResult?.lab?.phone || 
                       'Not available'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Email:</strong> 
                    <div className="mt-1">
                      <i className="ri-mail-line me-1"></i>
                      {state?.bookingData?.lab?.email || 
                       state?.labEmail || 
                       state?.orderResult?.lab?.email || 
                       'Not available'}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Lab Address:</strong> 
                    <div className="mt-1 text-muted">
                      <i className="ri-map-pin-line me-1"></i>
                      {state?.bookingData?.lab?.address || 
                       state?.labAddress || 
                       state?.orderResult?.lab?.address || 
                       'Address not available'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Accreditation:</strong> 
                    <div className="mt-1">
                      <span className="badge bg-success">
                        {state?.bookingData?.lab?.accreditation || 
                         state?.labAccreditation || 
                         'NABL Approved'}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Report Timeline:</strong> 
                    <div className="mt-1">
                      <i className="ri-time-line me-1"></i>
                      {state?.bookingData?.lab?.reportTimeline || 
                       state?.reportTimeline || 
                       '24-48 hours'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <FaUserMd className="me-2" /> Patient Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Patient Name:</strong> 
                    <div className="mt-1 fw-semibold">{patientName}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Phone:</strong> 
                    <div className="mt-1">
                      <i className="ri-phone-line me-1"></i>
                      {patientPhone}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Email:</strong> 
                    <div className="mt-1">
                      <i className="ri-mail-line me-1"></i>
                      {patientEmail}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong className="text-muted">Age & Gender:</strong> 
                    <div className="mt-1">
                      <i className="ri-user-line me-1"></i>
                      {patientAgeGender}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-muted">Collection Address:</strong> 
                    <div className="mt-1 p-3 bg-light rounded">
                      <i className="ri-home-line me-1"></i>
                      {formatAddress(state?.bookingData?.selectedAddress || 
                                    state?.patientAddress || 
                                    state?.address)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Details */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <FaFileMedical className="me-2" /> Test Details
              </h5>
              <span className="badge bg-info float-end">
                {testCount} {testCount === 1 ? 'Test' : 'Tests'}
              </span>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <strong className="text-muted">Selected Tests:</strong> 
                <div className="mt-2">
                  {testNames.map((test, index) => (
                    <span key={index} className="badge bg-light text-dark border me-2 mb-2">
                      {test}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th width="50%">Test Name</th>
                      <th className="text-center">Type</th>
                      <th className="text-end">Original Price</th>
                      <th className="text-end">Discounted Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state?.bookingData?.cartItems?.map((item, index) => {
                      const originalPrice = parseFloat(item.amount || item.price || 0);
                      const discountPercentage = parseFloat(item.discountPercentage || 0);
                      const discountedPrice = originalPrice - (originalPrice * (discountPercentage / 100));
                      
                      return (
                        <tr key={index}>
                          <td>
                            <strong>{item.testName || item.packageName || 'Lab Test'}</strong>
                            {item.testDescription && (
                              <div className="text-muted small mt-1">{item.testDescription}</div>
                            )}
                          </td>
                          <td className="text-center">
                            <span className={`badge ${item.testType === 'package' ? 'bg-warning' : 'bg-info'}`}>
                              {item.testType === 'package' ? 'Package' : 'Single Test'}
                            </span>
                          </td>
                          <td className="text-end">
                            {discountPercentage > 0 ? (
                              <span className="text-decoration-line-through text-muted">
                                ₹{originalPrice.toFixed(2)}
                              </span>
                            ) : (
                              <span>₹{originalPrice.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="text-end fw-bold text-success">
                            ₹{discountedPrice.toFixed(2)}
                            {discountPercentage > 0 && (
                              <div className="text-danger small">
                                -{discountPercentage}% OFF
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    
                    {/* Fallback if cartItems not available */}
                    {(!state?.bookingData?.cartItems || state.bookingData.cartItems.length === 0) && (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          <div className="text-muted">
                            <FaFlask className="fs-1 mb-2" />
                            <p>Test details will be updated soon</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Appointment Schedule */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-calendar-line me-2"></i> Appointment Schedule
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-primary mb-2">
                      <i className="ri-calendar-event-line fs-1"></i>
                    </div>
                    <strong className="text-muted d-block">Date</strong>
                    <div className="mt-1 fs-5 fw-bold">{appointmentDate}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-primary mb-2">
                      <i className="ri-time-line fs-1"></i>
                    </div>
                    <strong className="text-muted d-block">Time Slot</strong>
                    <div className="mt-1 fs-5 fw-bold">{appointmentTime}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-primary mb-2">
                      <i className="ri-truck-line fs-1"></i>
                    </div>
                    <strong className="text-muted d-block">Collection Type</strong>
                    <div className="mt-1 fs-5 fw-bold">{collectionType}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Instructions */}
          {instructions.length > 0 && (
            <div className="card shadow-sm border-0 mb-4 border-warning">
              <div className="card-header bg-warning bg-opacity-10 py-3 border-bottom">
                <h5 className="card-title mb-0 fw-bold">
                  <i className="ri-alert-line me-2"></i> Important Instructions
                </h5>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="mb-2">{instruction}</li>
                  ))}
                  
                  {/* Default instructions */}
                  <li className="mb-2">Fasting requirements: 10-12 hours overnight fasting for blood tests</li>
                  <li className="mb-2">Please carry your ID proof and this appointment confirmation</li>
                  <li className="mb-2">Our phlebotomist will call you 30 minutes before arrival</li>
                  {collectionType === 'Home Collection' && (
                    <li className="mb-2">Please ensure someone is available at the address during the scheduled time</li>
                  )}
                  {paymentStatus === 'pending' && (
                    <li className="mb-2 text-danger fw-bold">Please keep exact change ready for cash payment</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title mb-0 fw-bold">
                <i className="ri-information-line me-2"></i> What Happens Next?
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                    <i className="ri-checkbox-circle-line fs-4"></i>
                  </div>
                  <h6 className="fw-bold">Appointment Confirmed</h6>
                  <p className="small text-muted">Your appointment is confirmed and scheduled</p>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                    <i className="ri-user-follow-line fs-4"></i>
                  </div>
                  <h6 className="fw-bold">Phlebotomist Assigned</h6>
                  <p className="small text-muted">Trained professional will collect your sample</p>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                    <i className="ri-blood-line fs-4"></i>
                  </div>
                  <h6 className="fw-bold">Sample Collection</h6>
                  <p className="small text-muted">Sample will be collected as per schedule</p>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                    <i className="ri-file-text-line fs-4"></i>
                  </div>
                  <h6 className="fw-bold">Report Delivery</h6>
                  <p className="small text-muted">Report will be shared via email/SMS</p>
                </div>
              </div>
            </div>
          </div>

        {/* Action Buttons */}

<div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">

  <button 
    className="btn btn-primary me-md-2 px-4 py-2"
    onClick={handleViewAppointments}
  >
    <i className="ri-list-check me-2"></i>
    View All Appointments
  </button>

  <button 
    className="btn btn-outline-secondary px-4 py-2 me-md-2"
    onClick={handleContinueBooking}
  >
    <FaFlask className="me-2" />
    Book More Tests
  </button>

  <button 
    className="btn btn-outline-success px-4 py-2 me-md-2"
    onClick={handleDownloadReceipt}
  >
    <i className="ri-download-line me-2"></i>
    Download Receipt
  </button>

  <button 
    className="btn btn-outline-dark px-4 py-2"
    onClick={handleDownloadReceipt}
  >
    <i className="ri-printer-line me-2"></i>
    Print Receipt
  </button>

</div>

          {/* Footer Note */}
          <div className="text-center mt-5 pt-4 border-top">
            <small className="text-muted">
              <i className="ri-shield-check-line me-1"></i>
              Your data is secure and confidential. Reports are only shared with you.
            </small>
            <div className="mt-2">
              <small className="text-muted">
                Appointment ID: <span className="fw-bold">{appointmentId}</span> | 
                Date: <span className="fw-bold">{appointmentDate}</span>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabOrderSuccess;
