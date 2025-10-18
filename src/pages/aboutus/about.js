import React from 'react';
import Aboutushero from '../../component/about/aboutushero';
import AboutSection from '../../component/about/AboutSection'
import AboutInfoSection from '../../component/about/aboutinfo';
import InvestmentSection from '../../component/about/InvestmentSection';
import StoreInfoSection from '../../component/about/StoreInfoSection';


const About = () => {
    return (
        <>
            <Aboutushero />
            <AboutSection />
            <AboutInfoSection />
            <InvestmentSection />
            <StoreInfoSection />
        </>
    )
}

export default About