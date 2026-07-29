import React, { useEffect } from 'react';
import './PrivacyPolicy.scss';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy_page_wrapper">
      <div className="mx_width">
        <div style={{ width: '100%' }}>
          <div className="policy_header">
            <h1>Privacy Policy</h1>
            <span className="effective_date">Effective Date: 28 July 2026</span>
          </div>

          <div className="policy_body">
            <p className="intro_text">
              At <strong>Devi Jewellers</strong>, we value your privacy and are committed to protecting your personal information.
            </p>

            <div className="policy_section">
              <h2>Information We Collect</h2>
              <p>We may collect:</p>
              <ul>
                <li>Name</li>
                <li>Mobile Number</li>
                <li>Email Address</li>
                <li>Postal Address</li>
                <li>Enquiry details</li>
                <li>Device information (IP address, browser type, cookies)</li>
                <li>Website usage analytics</li>
              </ul>
            </div>

            <div className="policy_section">
              <h2>How We Use Your Information</h2>
              <p>Your information is used to:</p>
              <ul>
                <li>Respond to enquiries</li>
                <li>Process jewellery orders and requests</li>
                <li>Contact customers regarding purchases or schemes</li>
                <li>Send promotional offers (only where permitted)</li>
                <li>Improve our website and customer experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div className="policy_section">
              <h2>Cookies</h2>
              <p>
                Our website may use cookies to improve browsing experience and analyse website traffic.
              </p>
            </div>

            <div className="policy_section">
              <h2>Information Sharing</h2>
              <p>We do not sell or rent your personal information.</p>
              <p>Information may only be shared with:</p>
              <ul>
                <li>Delivery partners</li>
                <li>Payment providers (if online payments are enabled)</li>
                <li>Government authorities when legally required</li>
              </ul>
            </div>

            <div className="policy_section">
              <h2>Data Security</h2>
              <p>
                We use reasonable administrative and technical measures to protect customer information from unauthorized access or misuse.
              </p>
            </div>

            <div className="policy_section">
              <h2>Gold Rate Disclaimer</h2>
              <p>
                Gold and silver prices displayed on the website are indicative and may change without prior notice. Final billing will be based on the prevailing showroom rate at the time of purchase.
              </p>
            </div>

            <div className="policy_section">
              <h2>Customer Rights</h2>
              <p>Customers may request:</p>
              <ul>
                <li>Access to their personal information</li>
                <li>Correction of incorrect information</li>
                <li>Deletion of personal information (subject to legal requirements)</li>
              </ul>
            </div>

            <div className="policy_section">
              <h2>Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for their privacy practices.
              </p>
            </div>

            <div className="policy_section">
              <h2>Changes to this Policy</h2>
              <p>
                We may update this Privacy Policy from time to time without prior notice.
              </p>
            </div>

            <div className="policy_section">
              <h2>Contact Us</h2>
              <div className="contact_card">
                <p><strong>Devi Jewellers</strong></p>
                <p>Rajpath Road, Bhavani Peth, Moti Chowk, Satara – 415002</p>
                <p>Phone: <a href="tel:+919881236771">+91 98812 36771</a></p>
                <p>Email: <a href="mailto:info@devi-jewellers.com">info@devi-jewellers.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
