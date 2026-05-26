import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context';

const PrivacyPolicyManagement = () => {
  const {
    privacyPolicy,
    privacyLoading,
    error,
    setError,
    createPrivacyPolicy,
    getPrivacyPolicy,
    updatePrivacyPolicy
  } = useContext(MyContext);

  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState('privacy');
  const [editorContent, setEditorContent] = useState({
    privacyPolicy: '',
    termsAndCondition: '',
    paymentPolicy: '',
    aboutUs: ''
  });

  // Inline CSS styles
  const styles = {
    policyContent: {
      lineHeight: '1.6',
      fontSize: '14px',
    },
    policyContentBr: {
      marginBottom: '8px',
      display: 'block',
      content: '""',
    },
    navTabsNavLink: {
      color: '#495057',
      fontWeight: '500',
    },
    navTabsNavLinkActive: {
      fontWeight: '600',
    },
    cardHeaderH5: {
      fontSize: '1.1rem',
      fontWeight: '600',
    },
  };

  // Fetch privacy policy on component mount
  useEffect(() => {
    getPrivacyPolicy();
  }, []);

  // Update editor content when privacy policy data changes
  useEffect(() => {
    if (privacyPolicy) {
      setEditorContent({
        privacyPolicy: privacyPolicy.privacyPolicy?.replace(/<br>/g, '\n') || '',
        termsAndCondition: privacyPolicy.termsAndCondition?.replace(/<br>/g, '\n') || '',
        paymentPolicy: privacyPolicy.paymentPolicy?.replace(/<br>/g, '\n') || '',
        aboutUs: privacyPolicy.aboutUs?.replace(/<br>/g, '\n') || ''
      });
    }
  }, [privacyPolicy]);

  // Handle editor content changes
  const handleEditorChange = (e) => {
    const { value } = e.target;
    setEditorContent(prev => ({
      ...prev,
      [activeTab]: value
    }));
    if (error) setError(null);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Save policy content
  const handleSavePolicy = async () => {
    if (!editorContent[activeTab].trim()) {
      setError(`Please enter ${getTabLabel(activeTab)} content`);
      return;
    }

    try {
      // Since your API currently only accepts privacyPolicy, we'll use that
      // You might need to update your backend to handle different policy types
      const response = await createPrivacyPolicy(editorContent[activeTab]);
      
      if (response.success) {
        setShowEditor(false);
        // Reset editor content to current saved state
        if (privacyPolicy) {
          setEditorContent({
            privacyPolicy: privacyPolicy.privacyPolicy?.replace(/<br>/g, '\n') || '',
            termsAndCondition: privacyPolicy.termsAndCondition?.replace(/<br>/g, '\n') || '',
            paymentPolicy: privacyPolicy.paymentPolicy?.replace(/<br>/g, '\n') || '',
            aboutUs: privacyPolicy.aboutUs?.replace(/<br>/g, '\n') || ''
          });
        }
      }
    } catch (err) {
      console.error('Error saving policy:', err);
    }
  };

  // Get tab label for display
  const getTabLabel = (tab) => {
    const labels = {
      privacy: 'Privacy Policy',
      termsAndCondition: 'Terms & Conditions',
      paymentPolicy: 'Payment Policy',
      aboutUs: 'About Us'
    };
    return labels[tab] || tab;
  };

  // Format content for display (convert newlines to breaks)
  const formatContent = (content) => {
    if (!content) return 'No content available.';
    return content.split('\n').map((line, index) => (
      <span key={index} style={styles.policyContentBr}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">Policy Management</h4>
                <small className="text-muted">Manage your privacy policy, terms, and other policies</small>
              </div>
              {/* <button
                className="btn btn-primary"
                onClick={() => setShowEditor(!showEditor)}
                disabled={privacyLoading}
              >
                {showEditor ? 'Cancel Editing' : 'Edit Policies'}
              </button> */}
            </div>

            <div className="card-body">
              {/* Error Message Display */}


              {/* Editor Mode */}
              {showEditor ? (
                <div className="card">
                  <div className="card-header">
                    <h5 style={styles.cardHeaderH5}>Edit Policy Content</h5>
                  </div>
                  <div className="card-body">
                    {/* Tab Navigation */}
                    <ul className="nav nav-tabs mb-3">
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'privacy' ? 'active' : ''}`}
                          onClick={() => handleTabChange('privacy')}
                          style={activeTab === 'privacy' ? { ...styles.navTabsNavLink, ...styles.navTabsNavLinkActive } : styles.navTabsNavLink}
                        >
                          Privacy Policy
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'termsAndCondition' ? 'active' : ''}`}
                          onClick={() => handleTabChange('termsAndCondition')}
                          style={activeTab === 'termsAndCondition' ? { ...styles.navTabsNavLink, ...styles.navTabsNavLinkActive } : styles.navTabsNavLink}
                        >
                          Terms & Conditions
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'paymentPolicy' ? 'active' : ''}`}
                          onClick={() => handleTabChange('paymentPolicy')}
                          style={activeTab === 'paymentPolicy' ? { ...styles.navTabsNavLink, ...styles.navTabsNavLinkActive } : styles.navTabsNavLink}
                        >
                          Payment Policy
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'aboutUs' ? 'active' : ''}`}
                          onClick={() => handleTabChange('aboutUs')}
                          style={activeTab === 'aboutUs' ? { ...styles.navTabsNavLink, ...styles.navTabsNavLinkActive } : styles.navTabsNavLink}
                        >
                          About Us
                        </button>
                      </li>
                    </ul>

                    {/* Editor Content */}
                    {/* <div className="mb-3">
                      <label className="form-label">
                        <strong>{getTabLabel(activeTab)} Content</strong>
                      </label>
                      <textarea
                        className="form-control"
                        rows={15}
                        value={editorContent[activeTab]}
                        onChange={handleEditorChange}
                        placeholder={`Enter your ${getTabLabel(activeTab).toLowerCase()} content here...`}
                      />
                      <small className="text-muted">
                        Use new lines for paragraphs. Each new line will be converted to a line break.
                      </small>
                    </div> */}

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success"
                        onClick={handleSavePolicy}
                        disabled={privacyLoading}
                      >
                        {privacyLoading ? 'Saving...' : `Save ${getTabLabel(activeTab)}`}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowEditor(false);
                          // Reset to original content
                          if (privacyPolicy) {
                            setEditorContent({
                              privacyPolicy: privacyPolicy.privacyPolicy?.replace(/<br>/g, '\n') || '',
                              termsAndCondition: privacyPolicy.termsAndCondition?.replace(/<br>/g, '\n') || '',
                              paymentPolicy: privacyPolicy.paymentPolicy?.replace(/<br>/g, '\n') || '',
                              aboutUs: privacyPolicy.aboutUs?.replace(/<br>/g, '\n') || ''
                            });
                          }
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="row">
                  {/* Privacy Policy Card */}
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-primary text-white">
                        <h5 style={styles.cardHeaderH5}>Privacy Policy</h5>
                      </div>
                      <div className="card-body">
                        {privacyLoading ? (
                          <div className="text-center py-3">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : privacyPolicy ? (
                          <div className="policy-content" style={styles.policyContent}>
                            {formatContent(editorContent.privacyPolicy)}
                          </div>
                        ) : (
                          <div className="text-center text-muted py-4">
                            <i className="fas fa-file-alt fa-3x mb-3"></i>
                            <p>No privacy policy content available.</p>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setShowEditor(true);
                                setActiveTab('privacy');
                              }}
                            >
                              Create Privacy Policy
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions Card */}
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-success text-white">
                        <h5 style={styles.cardHeaderH5}>Terms & Conditions</h5>
                      </div>
                      <div className="card-body">
                        {privacyLoading ? (
                          <div className="text-center py-3">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : privacyPolicy ? (
                          <div className="policy-content" style={styles.policyContent}>
                            {formatContent(editorContent.termsAndCondition)}
                          </div>
                        ) : (
                          <div className="text-center text-muted py-4">
                            <i className="fas fa-scale-balanced fa-3x mb-3"></i>
                            <p>No terms and conditions available.</p>
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                setShowEditor(true);
                                setActiveTab('termsAndCondition');
                              }}
                            >
                              Create Terms
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Policy Card */}
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-warning text-dark">
                        <h5 style={styles.cardHeaderH5}>Payment Policy</h5>
                      </div>
                      <div className="card-body">
                        {privacyLoading ? (
                          <div className="text-center py-3">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : privacyPolicy ? (
                          <div className="policy-content" style={styles.policyContent}>
                            {formatContent(editorContent.paymentPolicy)}
                          </div>
                        ) : (
                          <div className="text-center text-muted py-4">
                            <i className="fas fa-credit-card fa-3x mb-3"></i>
                            <p>No payment policy available.</p>
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => {
                                setShowEditor(true);
                                setActiveTab('paymentPolicy');
                              }}
                            >
                              Create Payment Policy
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* About Us Card */}
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-info text-white">
                        <h5 style={styles.cardHeaderH5}>About Us</h5>
                      </div>
                      <div className="card-body">
                        {privacyLoading ? (
                          <div className="text-center py-3">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : privacyPolicy ? (
                          <div className="policy-content" style={styles.policyContent}>
                            {formatContent(editorContent.aboutUs)}
                          </div>
                        ) : (
                          <div className="text-center text-muted py-4">
                            <i className="fas fa-building fa-3x mb-3"></i>
                            <p>No about us content available.</p>
                            <button 
                              className="btn btn-info btn-sm"
                              onClick={() => {
                                setShowEditor(true);
                                setActiveTab('aboutUs');
                              }}
                            >
                              Create About Us
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
                {/* {!showEditor && (
                    <div className="card mt-4">
                    <div className="card-header">
                        <h6 className="mb-0">Quick Actions</h6>
                    </div>
                    <div className="card-body">
                        <div className="d-flex gap-2 flex-wrap">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => {
                            setShowEditor(true);
                            setActiveTab('privacy');
                            }}
                        >
                            <i className="fas fa-shield-alt me-2"></i>
                            Edit Privacy Policy
                        </button>
                        <button
                            className="btn btn-outline-success"
                            onClick={() => {
                            setShowEditor(true);
                            setActiveTab('termsAndCondition');
                            }}
                        >
                            <i className="fas fa-scale-balanced me-2"></i>
                            Edit Terms & Conditions
                        </button>
                        <button
                            className="btn btn-outline-warning"
                            onClick={() => {
                            setShowEditor(true);
                            setActiveTab('paymentPolicy');
                            }}
                        >
                            <i className="fas fa-credit-card me-2"></i>
                            Edit Payment Policy
                        </button>
                        <button
                            className="btn btn-outline-info"
                            onClick={() => {
                            setShowEditor(true);
                            setActiveTab('aboutUs');
                            }}
                        >
                            <i className="fas fa-building me-2"></i>
                            Edit About Us
                        </button>
                        </div>
                    </div>
                    </div>
                )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyManagement;
