// src/components/ShopTimings.jsx

import React, { useState, useContext, useEffect } from 'react';
import { 
    Form, Button, Col, Row, Spinner, Alert 
} from 'react-bootstrap';
import { MyContext } from '../../../Context/Context'; // Apna sahi path yahan dein

// -- Time Conversion Helper Functions --
// Yeh zaroori hain, isliye inhe rakha gaya hai
const to24Hour = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return '';
    const lowerCaseTime = timeStr.toLowerCase();
    if (!lowerCaseTime.includes('am') && !lowerCaseTime.includes('pm')) {
        return timeStr;
    }
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (isNaN(hours) || isNaN(parseInt(minutes, 10))) return '';
    if (period.toLowerCase() === 'pm' && hours !== 12) {
        hours += 12;
    }
    if (period.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
    }
    return `${String(hours).padStart(2, '0')}:${minutes}`;
};

const to12Hour = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    if (isNaN(h) || isNaN(parseInt(minutes, 10))) return '';
    const period = h >= 12 ? 'PM' : 'AM';
    let adjustedHours = h % 12;
    if (adjustedHours === 0) adjustedHours = 12;
    return `${String(adjustedHours).padStart(2, '0')}:${minutes} ${period}`;
};


//================================================
//          SHOP TIMINGS COMPONENT
//================================================
const ShopTimings = () => {
    // Context se zaroori functions aur state lein
    const { 
        shopTimings, getShopTimings, bulkUpdateShopTimings, 
        loadingTimings, errorTimings, loadingAction, errorAction 
    } = useContext(MyContext);
    
    // Local state
    const [timings, setTimings] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Component load hone par timings fetch karein
    useEffect(() => {
        getShopTimings();
    }, []);

    // Jab context se data badle, to local state update karein
    useEffect(() => {
        setTimings(shopTimings ? JSON.parse(JSON.stringify(shopTimings)) : []);
    }, [shopTimings]);

    // Handlers
    const handleTimeChange = (index, field, value) => {
        const updatedTimings = [...timings];
        updatedTimings[index][field] = to12Hour(value);
        setTimings(updatedTimings);
    };

    const handleToggleClose = (index) => {
        const updatedTimings = [...timings];
        updatedTimings[index].isClosed = !updatedTimings[index].isClosed;
        setTimings(updatedTimings);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({type: '', text: ''});
        const result = await bulkUpdateShopTimings(timings);
        if (result.success) {
            setMessage({type: 'success', text: "Shop timings have been updated successfully!"});
        } else {
            setMessage({type: 'danger', text: result.message || "Failed to update timings."});
        }
    };
    
    return (
        <div className="container mt-4">
            <h3>Manage Shop Timings</h3>
            <hr />

            {/* Messages aur errors dikhane ke liye Alerts */}
            {message.text && <Alert variant={message.type} onClose={() => setMessage({type: '', text: ''})} dismissible>{message.text}</Alert>}
            {errorTimings && <Alert variant="danger">Error fetching timings: {errorTimings}</Alert>}
            {errorAction && <Alert variant="danger">Error updating timings: {errorAction}</Alert>}

            {/* Loading state ke liye Spinner */}
            {loadingTimings ? (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                    <p>Loading Timings...</p>
                </div>
            ) : (
                <Form onSubmit={handleSubmit}>
                    {timings.map((t, index) => (
                        // Har din ke liye ek simple row
                        <Row key={index} className="mb-3 p-3 border rounded align-items-center">
                            <Col xs={12} md={2}>
                                <strong>{t.day}</strong>
                            </Col>
                            <Col xs={6} md={3}>
                                <Form.Label>Opening Time</Form.Label>
                                <Form.Control 
                                    type="time" 
                                    value={t.isClosed ? '' : to24Hour(t.openingTime)} 
                                    onChange={e => handleTimeChange(index, 'openingTime', e.target.value)} 
                                    disabled={t.isClosed} 
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <Form.Label>Closing Time</Form.Label>
                                <Form.Control 
                                    type="time" 
                                    value={t.isClosed ? '' : to24Hour(t.closingTime)} 
                                    onChange={e => handleTimeChange(index, 'closingTime', e.target.value)} 
                                    disabled={t.isClosed} 
                                />
                            </Col>
                            <Col xs={12} md={4} className="mt-3 mt-md-0">
                                <Form.Check 
                                    type="switch" 
                                    id={`switch-${t.day}`} 
                                    label={t.isClosed ? "Closed" : "Open"} 
                                    checked={!t.isClosed} 
                                    onChange={() => handleToggleClose(index)} 
                                />
                            </Col>
                        </Row>
                    ))}
                    
                    {/* Submit Button */}
                    <Button variant="primary" type="submit" disabled={loadingAction} className="mt-3">
                        {loadingAction ? <><Spinner as="span" size="sm" /> Saving...</> : 'Save All Changes'}
                    </Button>
                </Form>
            )}
        </div>
    );
};

export default ShopTimings;