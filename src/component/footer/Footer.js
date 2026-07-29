import React from 'react';
import './Footer.scss';
import { Link } from 'react-router-dom';
import { LiaFacebookF, LiaTwitter, LiaInstagram } from "react-icons/lia";
import { AiFillYoutube } from "react-icons/ai";
import { IconContext } from "react-icons";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return (
    <div className="footer_container">
      <div className="mx_width footer_wapper">
        <div className="footer_links">
          <Link to="/privacy-policy" className="footer_link">Privacy Policy</Link>
          <span className="divider">|</span>
          <Link to="/terms-conditions" className="footer_link">Terms & Conditions</Link>
        </div>
        <div className="copyright">© 2026 Devi Jewellers. All rights reserved.</div>
        <div className="footer_social">
          <div className="icon_container">
            <IconContext.Provider value={{className: "icon" }}>
              <LiaFacebookF />
            </IconContext.Provider>
          </div>
          <div className="icon_container">
            <IconContext.Provider value={{className: "icon" }}>
              <LiaTwitter />
            </IconContext.Provider>
          </div>
          <div className="icon_container">
            <IconContext.Provider value={{className: "icon" }}>
              <LiaInstagram />
            </IconContext.Provider>
          </div>
          <div className="icon_container">
            <IconContext.Provider value={{className: "icon" }}>
              <AiFillYoutube />
            </IconContext.Provider>
          </div>
        </div>
        <div className="backToTop" onClick={scrollToTop}>Back to Top</div>
      </div>
    </div>
  )
}

export default Footer;
