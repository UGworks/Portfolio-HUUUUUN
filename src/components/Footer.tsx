import { motion } from 'framer-motion';
import { info } from '../data';

const Footer = () => {
  return (
    <footer id="contact" className="py-20 px-6 lg:px-8 border-t border-gray-200 bg-white ml-64 md:ml-80">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-lg font-light">문의</p>
          <a
            href={`mailto:${info.email}`}
            className="text-xl hover:opacity-70 transition-opacity inline-block"
          >
            {info.email}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500"
        >
          <p>© {new Date().getFullYear()} {info.name}. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

