import { motion } from 'framer-motion';
import { info } from '../data';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-6 lg:px-8 pt-32 pb-20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-light tracking-tight mb-8"
        >
          {info.name}
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-6 text-lg md:text-xl text-gray-700 font-light"
        >
          <p>{info.title}</p>
          <p className="max-w-2xl mx-auto">{info.description}</p>
          <p className="text-base">{info.location}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

