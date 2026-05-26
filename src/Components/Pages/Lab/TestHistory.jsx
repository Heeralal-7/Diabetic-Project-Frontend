import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../../../Context/Context';
import { Link } from 'react-router-dom';

const LabTestHistory = () => {
  const { labTestHistory, getLabTestHistory, loading } = useContext(MyContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    getLabTestHistory(currentPage, itemsPerPage);
  }, [currentPage]);

  const formatDate = (dateString) => {
    // Note: The fixed response uses a full date string like "2025-06-07 00:00:00.000" or a simple string "04/10/2025".
    // The existing logic should handle these.
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString.split(' ')[0]; // Fallback if date is not parsable
    }
  };
  
  // Helper function to extract Test/Package Name from the fixed response structure
  const getTestOrPackageName = (test) => {
      // The fixed response shows 'testId' as an array of objects: [{ _id, testName }]
      if (Array.isArray(test.testId) && test.testId.length > 0) {
          // Map to get all test names and join them
          const testNames = test.testId
              .map(t => typeof t === 'object' && t !== null && t.testName ? t.testName : null)
              .filter(name => name);
              
          if (testNames.length > 0) {
              return testNames.join(', ');
          }
      }
      
      // If 'testName' or 'packageName' is present at the top level, use it as a fallback
      return test.packageName || test.testName || 'N/A';
  };

  const getStatusBadge = (status) => {
    // Based on the fixed response structure's status codes
    const statusMap = {
      '0': { class: 'bg-warning', text: 'Pending' }, // Not started
      '1': { class: 'bg-info', text: 'Confirmed' }, // Booking confirmed
      '2': { class: 'bg-success', text: 'Completed' }, // Sample collected/test completed (old logic)
      '3': { class: 'bg-secondary', text: 'Cancelled' }, // Cancelled
      '8': { class: 'bg-primary', text: 'Delivered' } // Report Delivered/Final Completion (from fixed response examples)
      // Note: Status '5' (Delivered) and '6' (Rejected) are also possible as seen in the doctor order history example, but sticking to lab test map.
    };
    
    const statusInfo = statusMap[status] || { class: 'bg-secondary', text: 'Unknown' };
    return <span className={`badge ${statusInfo.class} text-white`}>{statusInfo.text}</span>;
  };

  const totalPages = Math.ceil((labTestHistory?.length || 0) / itemsPerPage);

  return (
    <div className="container-fluid container-xl py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb bg-transparent mb-3">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/profile">Profile</Link></li>
          <li className="breadcrumb-item active">Lab Test History</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-5 fw-bold">Lab Test History</h1>
        <Link to="/venders/labs" className="btn btn-outline-primary">
          Book New Test
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your test history...</p>
        </div>
      ) : (labTestHistory && labTestHistory.length === 0) ? (
        <div className="text-center py-5">
          <i className="ri-file-list-line fs-1 text-muted mb-3"></i>
          <h4 className="text-muted">No Test History Found</h4>
          <p className="text-muted">You haven't taken any lab tests yet.</p>
          <Link to="/venders/labs" className="btn btn-primary mt-3">
            Book Your First Test
          </Link>
        </div>
      ) : (
        <>
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-primary text-white rounded-top-3">
              <h5 className="mb-0 fw-bold">
                <i className="ri-history-line me-2"></i>
                Your Lab Test Records
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 ps-4">Test Name</th>
                      <th className="border-0">Lab</th>
                      <th className="border-0">Date</th>
                      <th className="border-0">Time Slot</th>
                      <th className="border-0">Amount</th>
                      <th className="border-0">Status</th>
                      <th className="border-0 text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labTestHistory.map((test) => (
                      <tr key={test._id} className="border-bottom">
                        <td className="ps-4">
                          <div>
                            {/* FIX: Use helper function to get test name(s) from testId or packageName */}
                            <h6 className="mb-1 fw-semibold">{getTestOrPackageName(test)}</h6> 
                            {/* FIX: Use serviceType instead of non-existent testType */}
                            <small className="text-muted">{test.serviceType || 'Test'}</small> 
                          </div>
                        </td>
                        <td>
                          {/* vendorId object is available in the fixed response */}
                          {test.vendorId ? (
                            <div>
                              <p className="mb-1 fw-medium">{test.vendorId.name}</p>
                              <small className="text-muted">{test.vendorId.city}</small>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <span className="fw-medium">{formatDate(test.date)}</span> {/* Correct */}
                        </td>
                        <td>
                          <span className="text-info fw-medium">{test.timeSlot}</span> {/* Correct */}
                        </td>
                        <td>
                          <span className="fw-bold text-success">₹{test.price}</span> {/* Correct */}
                        </td>
                        <td>
                          {getStatusBadge(test.status)} {/* Correct */}
                        </td>
                        <td className="text-end pe-4">
                          <div className="btn-group">
                            <button 
                              className="btn btn-sm btn-outline-primary rounded-pill me-2"
                              onClick={() => {/* Add view details functionality */}}
                            >
                              <i className="ri-eye-line me-1"></i> View
                            </button>
                            {/* FIX: Check for status '8' which corresponds to 'Delivered' (Report Available) in the fixed response */}
                            {test.status === '8' && test.report && (
                              <Link 
                                to={test.report} // Assuming test.report holds the URL
                                target="_blank"
                                className="btn btn-sm btn-outline-success rounded-pill"
                              >
                                <i className="ri-download-line me-1"></i> Report
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LabTestHistory;