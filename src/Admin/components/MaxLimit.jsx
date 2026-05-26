import React, { useState, useEffect, useContext } from 'react';

import { MyContext } from '../../Context/Context';

import 'bootstrap/dist/css/bootstrap.min.css';

const MaxDistManage = () => {

    const {

        distanceLimits,

        distanceLoading,

        distanceError,

        notification,

        getDistanceLimits,

        updateDistanceLimits,

        hideNotification,

    } = useContext(MyContext);

    const [currentView, setCurrentView] = useState('view');


    const [editForm, setEditForm] = useState({

        doctorLimit: '',

        clinicLimit: '',

        foodLimit: '',

        pharmacyLimit: '',

        labLimit: '',

    });

    const [isSubmitting, setIsSubmitting] = useState(false);



    useEffect(() => {

        getDistanceLimits();

    }, []);

    useEffect(() => {

        if (distanceLimits) {

            setEditForm({

                doctorLimit: distanceLimits.doctorLimit || '',

                clinicLimit: distanceLimits.clinicLimit || '',

                foodLimit: distanceLimits.foodLimit || '',

                pharmacyLimit: distanceLimits.pharmacyLimit || '',

                labLimit: distanceLimits.labLimit || '',

            });

        }

    }, [distanceLimits]);



    const handleEditChange = (e) => {

        const { name, value } = e.target;

        setEditForm(prev => ({

            ...prev,

            [name]: value

        }));

    };

    const handleSwitchToEdit = () => {

        if (distanceLimits) {

            setEditForm({

                doctorLimit: distanceLimits.doctorLimit || '',

                clinicLimit: distanceLimits.clinicLimit || '',

                foodLimit: distanceLimits.foodLimit || '',

                pharmacyLimit: distanceLimits.pharmacyLimit || '',

                labLimit: distanceLimits.labLimit || '',

            });

            setCurrentView('edit');

        }

    };

    const handleSubmitEdit = async (e) => {

        e.preventDefault();

        if (!distanceLimits?._id) {

            alert('Error: Record ID missing. Please refresh.');

            return;

        }

        setIsSubmitting(true);

        const payload = {

            doctorLimit: Number(editForm.doctorLimit),

            clinicLimit: Number(editForm.clinicLimit),

            foodLimit: Number(editForm.foodLimit),

            pharmacyLimit: Number(editForm.pharmacyLimit),

            labLimit: Number(editForm.labLimit),

        };

        const result = await updateDistanceLimits(distanceLimits._id, payload);

        setIsSubmitting(false);

        if (result.success) {

            setCurrentView('view');

        }

    };



    const NotificationComponent = () => {

        if (!notification.show) return null;

        const bgClass = notification.type === 'error' ? 'bg-danger' : 'bg-success';

        return (
            <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${bgClass}`} style={{ zIndex: 1050 }}>
                <div className="d-flex">
                    <div className="toast-body">
                        <strong>{notification.title}:</strong> {notification.message}
                    </div>
                    <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={hideNotification}></button>
                </div>
            </div>

        );

    };

    return (
        <div className="container-fluid py-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary"><i className="fas fa-map-marker-alt me-2"></i>Distance Limits</h2>
                <button

                    className="btn btn-outline-primary"

                    onClick={() => getDistanceLimits()}

                    disabled={distanceLoading}
                >
                    <i className="fas fa-sync-alt me-1"></i> Refresh
                </button>
            </div>

            <NotificationComponent />

            {/* Loading State */}

            {distanceLoading && !distanceLimits && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p>Loading data...</p>
                </div>

            )}

            {/* Error State */}

            {distanceError && (
                <div className="alert alert-danger">{distanceError}</div>

            )}

            {/* Main Content */}

            {distanceLimits && !distanceLoading && (
                <div className="card shadow">
                    <div className="card-header bg-white py-3">
                        <ul className="nav nav-tabs card-header-tabs">
                            <li className="nav-item">
                                <button

                                    className={`nav-link ${currentView === 'view' ? 'active fw-bold' : ''}`}

                                    onClick={() => setCurrentView('view')}
                                >

                                    View Limits
                                </button>
                            </li>
                            <li className="nav-item">
                                <button

                                    className={`nav-link ${currentView === 'edit' ? 'active fw-bold' : ''}`}

                                    onClick={handleSwitchToEdit}
                                >

                                    Edit Limits
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="card-body p-4">

                        {currentView === 'view' ? (

                            // VIEW MODE
                            <div className="row g-4">

                                {[

                                    { label: 'Doctor Limit', val: distanceLimits.doctorLimit, icon: 'fa-user-md' },

                                    { label: 'Clinic Limit', val: distanceLimits.clinicLimit, icon: 'fa-hospital' },

                                    { label: 'Food Limit', val: distanceLimits.foodLimit, icon: 'fa-utensils' },

                                    { label: 'Pharmacy Limit', val: distanceLimits.pharmacyLimit, icon: 'fa-pills' },

                                    { label: 'Lab Limit', val: distanceLimits.labLimit, icon: 'fa-flask' },

                                ].map((item, idx) => (
                                    <div className="col-md-4" key={idx}>
                                        <div className="p-3 border rounded bg-light d-flex align-items-center">
                                            <div className="fs-2 text-primary me-3"><i className={`fas ${item.icon}`}></i></div>
                                            <div>
                                                <div className="text-muted small">{item.label}</div>
                                                <div className="h4 mb-0">{item.val} <small className="fs-6 text-muted">km</small></div>
                                            </div>
                                        </div>
                                    </div>

                                ))}
                                <div className="col-12 text-muted small mt-3">

                                    Last Updated: {new Date(distanceLimits.updatedAt).toLocaleString()}
                                </div>
                            </div>

                        ) : (

                            // EDIT MODE
                            <form onSubmit={handleSubmitEdit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Doctor Limit (km)</label>
                                        <input

                                            type="number"

                                            className="form-control"

                                            name="doctorLimit"

                                            value={editForm.doctorLimit}

                                            onChange={handleEditChange}

                                            required

                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Clinic Limit (km)</label>
                                        <input

                                            type="number"

                                            className="form-control"

                                            name="clinicLimit"

                                            value={editForm.clinicLimit}

                                            onChange={handleEditChange}

                                            required

                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Food Limit (km)</label>
                                        <input

                                            type="number"

                                            className="form-control"

                                            name="foodLimit"

                                            value={editForm.foodLimit}

                                            onChange={handleEditChange}

                                            required

                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Pharmacy Limit (km)</label>
                                        <input

                                            type="number"

                                            className="form-control"

                                            name="pharmacyLimit"

                                            value={editForm.pharmacyLimit}

                                            onChange={handleEditChange}

                                            required

                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Lab Limit (km)</label>
                                        <input

                                            type="number"

                                            className="form-control"

                                            name="labLimit"

                                            value={editForm.labLimit}

                                            onChange={handleEditChange}

                                            required

                                        />
                                    </div>
                                </div>

                                <div className="mt-4 d-flex gap-2 justify-content-end">
                                    <button

                                        type="button"

                                        className="btn btn-secondary"

                                        onClick={() => setCurrentView('view')}
                                    >

                                        Cancel
                                    </button>
                                    <button

                                        type="submit"

                                        className="btn btn-primary"

                                        disabled={isSubmitting}
                                    >

                                        {isSubmitting ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>

                        )}
                    </div>
                </div>

            )}
        </div>

    );

};

export default MaxDistManage;
