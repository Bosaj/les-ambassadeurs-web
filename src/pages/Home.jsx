import React from 'react';
import Hero from '../components/Hero';
import Mission from '../components/Mission';
import Programs from '../components/Programs';
import Impact from '../components/Impact';
import Branches from '../components/Branches';
import News from '../components/News';
import GetInvolved from '../components/GetInvolved';
import About from '../components/About';
import Team from '../components/Team';
import Partners from '../components/Partners';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Newsletter from '../components/Newsletter';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Hero />
            <Mission />
            <Programs />
            <Impact />
            <Branches />
            <News />
            <GetInvolved />
            <About />
            <Team />
            <Partners />
            <Testimonials />
            <Contact />
            <Newsletter />
        </motion.div>
    );
};

export default Home;
