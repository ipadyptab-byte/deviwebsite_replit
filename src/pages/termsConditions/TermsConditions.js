import React, { useEffect } from 'react';
import './TermsConditions.scss';

const TermsConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms_page_wrapper">
      <div className="mx_width">
        <div style={{ width: '100%' }}>
          <div className="terms_header">
            <h1>Terms & Conditions</h1>
            <span className="effective_date">Effective Date: 28 July 2026</span>
          </div>

          <div className="terms_body">
            <p className="intro_text">
              Welcome to <strong>Devi Jewellers</strong>. By accessing or using this website, you agree to these Terms & Conditions.
            </p>

            <div className="terms_section">
              <h2>Website Usage</h2>
              <p>You agree to use this website only for lawful purposes.</p>
            </div>

            <div className="terms_section">
              <h2>Customer Communication</h2>
              <p>
                You agree to receive communication through emails, telephone and SMS or RCS and WhatsApp.
              </p>
            </div>

            <div className="terms_section">
              <h2>Product Information</h2>
              <p>We strive to provide accurate product descriptions, images and pricing.</p>
              <p>However:</p>
              <ul>
                <li>Product colours may vary due to screen settings.</li>
                <li>Jewellery weight may vary slightly.</li>
                <li>Designs may be modified without notice.</li>
                <li>Availability is subject to stock.</li>
              </ul>
            </div>

            <div className="terms_section">
              <h2>Gold & Silver Rates</h2>
              <p>
                Rates displayed are indicative and may change multiple times during the day.
              </p>
              <p>
                Final billing shall be based on the rate applicable at the showroom at the time of purchase.
              </p>
            </div>

            <div className="terms_section">
              <h2>Hallmark Jewellery</h2>
              <p>
                Gold jewellery sold by Devi Jewellers complies with applicable BIS Hallmark regulations wherever required.
              </p>
            </div>

            <div className="terms_section">
              <h2>Pricing</h2>
              <p>
                Prices displayed on the website may change without notice due to fluctuations in precious metal markets.
              </p>
            </div>

            <div className="terms_section">
              <h2>Orders</h2>
              <p>We reserve the right to:</p>
              <ul>
                <li>Accept or reject any order</li>
                <li>Cancel orders due to pricing errors</li>
                <li>Refuse fraudulent transactions</li>
              </ul>
            </div>

            <div className="terms_section">
              <h2>Jewellery Schemes</h2>
              <p>
                Participation in savings or investment schemes is governed by the specific rules applicable to each scheme.
              </p>
              <p>
                Customers are advised to read the individual scheme terms before enrolling.
              </p>
            </div>

            <div className="terms_section">
              <h2>Intellectual Property</h2>
              <p>All content on this website, including:</p>
              <ul>
                <li>Logo</li>
                <li>Images</li>
                <li>Product photographs</li>
                <li>Videos</li>
                <li>Text</li>
                <li>Graphics</li>
              </ul>
              <p>
                is the property of Devi Jewellers and may not be copied or reproduced without written permission.
              </p>
            </div>

            <div className="terms_section">
              <h2>Limitation of Liability</h2>
              <p>Devi Jewellers shall not be liable for:</p>
              <ul>
                <li>Website interruptions</li>
                <li>Technical errors</li>
                <li>Typographical mistakes</li>
                <li>Temporary unavailability</li>
                <li>Indirect or consequential damages</li>
              </ul>
            </div>

            <div className="terms_section">
              <h2>Governing Law</h2>
              <p>These Terms shall be governed by the laws of India.</p>
              <p>
                Any disputes shall be subject to the exclusive jurisdiction of the courts located in Satara, Maharashtra.
              </p>
            </div>

            <div className="terms_section">
              <h2>Contact</h2>
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

export default TermsConditions;
