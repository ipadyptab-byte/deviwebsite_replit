// import ContactForm from '../../component/contactForm/ContactForm';
// import StoreLocation from '../../component/storeLocation/StoreLocation';
import bg from '../../images/contact_us_bg.jpg';
import store from '../../images/store.png';
import './ContactUs.css';

export default function ContactUsPage(params) {
    return (
        <>
            <div style={{
                height: '60vh',
                width: '100%',
                background: `url(${bg}) no-repeat 70%`,
                backgroundAttachment: 'fixed',
            }}>
                <div className='contact-us-title'>
                    <h4>GET IN TOUCH</h4>
                    <h1>Contact Us</h1>
                </div>
            </div>
            <div className='contact-us-content'>
                <div className='contact-us-left-container'>
                    <h1>Tell us your next jewellery needs or express your interest in one of our Gold Investment Schemes</h1><br />
                    <p>We are available to talk about your both custom and ready-made Jewellery needs. Use one of the listed contact information or chat with us directly via WhatsApp chat button on bottom right corner of our website.</p>
                    <div className='store-info'>
                        <div className='store-info-block'>
                            <span class="material-symbols-outlined contact-us-icons">
                                location_on
                            </span>
                            <div className='store-info-inner-block'>
                                <h2>Store Location</h2>
                                <p>Moti Chowk Raj Path, Bhavani Peth, Satara, Maharashtra 415002 (IN)</p>
                                <a className='get-direction' href="https://maps.google.com/maps?ll=17.68364,73.990646&amp;z=16&amp;t=m&amp;hl=en-US&amp;gl=US&amp;mapclient=embed&amp;daddr=DEVI%20JEWELLERS%20Moti%20Chowk%20Rajpath%20Rd%2C%20Bhavani%20Peth%20Satara%2C%20Maharashtra%20415002@17.6836397,73.9906457">Get Directions</a>
                            </div>
                        </div>
                        <div className='store-info-block'>
                            <span class="material-symbols-outlined contact-us-icons">
                                call
                            </span>
                            <div className='store-info-inner-block'>
                                <h2>Call Number</h2>
                                <p>(02162) 236 771</p>
                                <p>+91 9881236771</p>
                            </div>
                        </div>
                        <div className='store-info-block'>
                            <span class="material-symbols-outlined contact-us-icons">
                                mail
                            </span>
                            <div className='store-info-inner-block'>
                                <h2>Email</h2>
                                <a className='mail' href="mailto:reachus@devi-jewellers.com">reachus@devi-jewellers.com</a>
                            </div>
                        </div>
                        <div className='store-info-block'>
                            <span class="material-symbols-outlined contact-us-icons">
                                schedule
                            </span>
                            <div className='store-info-inner-block'>
                                <h2>Working hours</h2>
                                <p>Sunday – Friday</p>
                                <p>10:30 am – 08:00 pm</p>
                            </div>
                        </div>

                    </div>
                </div>
                <div className='contact-us-right-container'>
                    <img className='store-image' width={'346'} height={'593'} src={store} alt='store' />
                </div>
            </div>
            {/* <div className='contact-us-end-section'>
                <StoreLocation />
                <ContactForm />
            </div> */}
        </>);
}