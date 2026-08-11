import { motion } from 'framer-motion';
import { info } from '../data';

const GeneralInfo = () => {
  return (
    <section id="info" className="py-20 px-6 lg:px-8 bg-white ml-64 md:ml-80">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-medium mb-12"
        >
          소개
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8 text-lg font-light leading-relaxed"
        >
          <p>
            {info.description}
          </p>
          
          {info.clients.length > 0 && (
            <div>
              <p className="mb-4">주요 클라이언트</p>
              <ul className="list-none space-y-2">
                {info.clients.map((client, index) => (
                  <li key={index} className="text-gray-700">
                    {client}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default GeneralInfo;

