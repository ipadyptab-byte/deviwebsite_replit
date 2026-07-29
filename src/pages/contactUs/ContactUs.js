// ContactUs.js
import { useState } from "react";
import bg from "../../images/contact_us_bg.jpg";
import store from "../../images/store.png";
import "./ContactUs.css";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    phone: "",
    position: "",
    startDate: "",
    resume: null,
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    alert(
      "Thank you for applying at Devi Jewellers. Our HR team will contact you if your profile matches our requirements."
    );

    setFormData({
      firstName: "",
      lastName: "",
      dob: "",
      email: "",
      phone: "",
      position: "",
      startDate: "",
      resume: null,
      agree: false,
    });

    e.target.reset();
  };

  return (
    <>
      {/* Hero Banner */}

      <div
        style={{
          height: "60vh",
          width: "100%",
          background: `url(${bg}) no-repeat center`,
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="contact-us-title">
          <h4>GET IN TOUCH</h4>
          <h1>Contact Us</h1>
        </div>
      </div>

      {/* Contact Section */}

      <div className="contact-us-content">
        <div className="contact-us-left-container">
          <h1>
            Tell us your next jewellery needs or express your interest in one of
            our Gold Investment Schemes
          </h1>

          <br />

          <p>
            We are available to discuss custom jewellery, ready-made jewellery,
            bridal collections, investment schemes and any enquiry you may have.
            You can also connect with us using the WhatsApp button available on
            our website.
          </p>

          <div className="store-info">
            {/* Location */}

            <div className="store-info-block">
              <span className="material-symbols-outlined contact-us-icons">
                location_on
              </span>

              <div className="store-info-inner-block">
                <h2>Store Location</h2>

                <p>
                  Moti Chowk, Rajpath Road,
                  <br />
                  Bhavani Peth,
                  <br />
                  Satara - 415002
                </p>

                <a
                  className="get-direction"
                  href="https://maps.google.com/maps?ll=17.68364,73.990646&z=16"
                  target="_blank"
                  rel="noreferrer"
                >
                  Get Directions
                </a>
              </div>
            </div>

            {/* Phone */}

            <div className="store-info-block">
              <span className="material-symbols-outlined contact-us-icons">
                call
              </span>

              <div className="store-info-inner-block">
                <h2>Call Us</h2>

                <p>(02162) 236771</p>
                <p>+91 9881236771</p>
              </div>
            </div>

            {/* Email */}

            <div className="store-info-block">
              <span className="material-symbols-outlined contact-us-icons">
                mail
              </span>

              <div className="store-info-inner-block">
                <h2>Email</h2>

                <a
                  className="mail"
                  href="mailto:reachus@devi-jewellers.com"
                >
                  reachus@devi-jewellers.com
                </a>
              </div>
            </div>

            {/* Working Hours */}

            <div className="store-info-block">
              <span className="material-symbols-outlined contact-us-icons">
                schedule
              </span>

              <div className="store-info-inner-block">
                <h2>Working Hours</h2>

                <p>Sunday - Friday</p>
                <p>10:30 AM - 08:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Store Image */}

        <div className="contact-us-right-container">
          <img
            src={store}
            className="store-image"
            alt="Devi Jewellers"
          />
        </div>
      </div>

      {/* Careers */}

      <section className="career-section">
        <h2>Join Our Team</h2>

        <p>
          We are always looking for talented and passionate people to join the
          Devi Jewellers family. Fill out the application form below and our HR
          team will contact you if your profile matches our requirements.
        </p>

        <form
          className="career-form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="form-grid">
            <div className="form-group">
              <label>First Name *</label>

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>

              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Position Applying For *</label>

              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              >
                <option value="">Select Position</option>
                <option>Sales Executive</option>
                <option>Customer Relationship Executive</option>
                <option>Cashier</option>
                <option>Marketing Executive</option>
                <option>Accountant</option>
                <option>Store Manager</option>
                <option>Jewellery Designer</option>
                <option>Goldsmith</option>
                <option>Inventory Executive</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Available Start Date</label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Upload Your Resume *</label>

              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
                required
              />

              <small>
                Accepted formats: PDF, DOC, DOCX (Maximum 5 MB)
              </small>
            </div>
          </div>

          <div className="career-checkbox">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              required
            />

            <label>
              I have read and agree to the{" "}
              <a href="/terms-and-conditions">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy-policy">
                Privacy Policy
              </a>.
            </label>
          </div>

          <button type="submit" className="career-btn">
            Apply Now
          </button>
        </form>
      </section>
    </>
  );
}
