//Admin/src/components/Vendor/Lab/LabTestCreate.jsx
 
import React, { useContext, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MyContext } from '../../../../Context/Context';
 
function LabTestCreate() {
  const { 
    // New subadmin context functions
    createTestSubadmin,
    testsLoading,
    testsError,
    clearTestErrors
  } = useContext(MyContext);
 
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
 
  // Effect to show toast when testsError changes
  useEffect(() => {
    if (testsError) {
      toast.error(testsError, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Clear error after showing
      clearTestErrors();
    }
  }, [testsError, clearTestErrors]);
 
  const handleSubmit = async (e) => {  
    e.preventDefault();
    
    // Validate inputs
    if (!name.trim() || !category.trim()) {
      toast.error('Please fill in all fields', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    setLocalLoading(true);
    
    try {
      const result = await createTestSubadmin({ name, category });
      
      if (result.success) {
        toast.success(result.message || 'Test created successfully!', {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Reset form
        setName('');
        setCategory('');
      } else {
        toast.error(result.message || 'Failed to create test', {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } catch (error) {
      toast.error('An unexpected error occurred', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || testsLoading;
 
  return (
    <div className="container mt-5 d-flex py-5 justify-content-center">
      <div className="card shadow-lg p-4" style={{ width: '30rem', borderRadius: '15px' }}>
        <div className="card-body">
          <h4 className="card-title text-center mb-4 text-primary fw-bold">
            Create Lab Test
          </h4>
          
          {/* Permissions Info */}
          <div className="alert alert-info mb-4">
            <small>
              <i className="bi bi-info-circle me-2"></i>
              You need <strong>Create</strong> permission in Tests to create new tests.
            </small>
          </div>
          
          <form onSubmit={handleSubmit}>    
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Test Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter test name"
                required
                disabled={isLoading}
                maxLength={100}
              />
              <div className="form-text">
                Enter a descriptive name for the test (max 100 characters)
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Category <span className="text-danger">*</span>
              </label>  
              <input
                type="text"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter category name"
                required
                disabled={isLoading}
                maxLength={50}
              />
              <div className="form-text">
                Specify the category for this test (max 50 characters)
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating Test...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Test
                </>
              )}
            </button>

            {/* Quick Tips */}
            <div className="mt-4 p-3 bg-light rounded">
              <h6 className="fw-semibold mb-2">
                <i className="bi bi-lightbulb me-2"></i>
                Quick Tips:
              </h6>
              <ul className="small mb-0">
                <li>Use clear and descriptive test names</li>
                <li>Group similar tests under the same category</li>
                <li>Test names should be unique and identifiable</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
     
      {/* Toastify Container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
 
export default LabTestCreate;