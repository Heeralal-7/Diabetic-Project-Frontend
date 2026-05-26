//Admin/src/components/Vendor/Lab/LabTestCreate.jsx
 
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MyContext } from '../../../../Context/Context';
 
function LabTestCreate() {
  const { createTest, createStatus } = React.useContext(MyContext);
 
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState('');
 
  // Effect to show toast when createStatus changes
  React.useEffect(() => {
    if (createStatus?.message) {
      if (createStatus.success === 1) {
        toast.success(createStatus.message, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(createStatus.message, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  }, [createStatus]);
 
  const handleSubmit = async (e) => {  
    e.preventDefault();
    await createTest(name, category);
    setName('');
    setCategory('');
  };
 
  return (
    <div className="container mt-5 d-flex py-5 justify-content-center">
      <div className="card shadow-lg p-4" style={{ width: '30rem', borderRadius: '15px' }}>
        <div className="card-body">
          <h4 className="card-title text-center mb-4 text-primary fw-bold">
            Create Lab Test
          </h4>
          <form onSubmit={handleSubmit}>    
            <div className="mb-3">
              <label className="form-label fw-semibold">Test Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter test name"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Category</label>  
              <input
                type="text"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              <i className="bi bi-plus-circle me-2"></i>Create Test
            </button>
          </form>
 
          {/* Remove the alert section since we're using toastify */}
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
 