import { motion } from 'framer-motion';
import { Project } from '../types';

interface ProjectsGridProps {
  projects: Project[];
}

const ProjectsGrid = ({ projects }: ProjectsGridProps) => {
  return (
    <section id="works" className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-medium mb-12 text-center md:text-left"
        >
          프로젝트
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden bg-gray-100">
                {project.video ? (
                  <motion.video
                    src={project.video}
                    className="w-full h-auto object-cover"
                    loop
                    muted
                    playsInline
                    onMouseEnter={(e) => {
                      const video = e.currentTarget;
                      video.play();
                    }}
                    onMouseLeave={(e) => {
                      const video = e.currentTarget;
                      video.pause();
                      video.currentTime = 0;
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  />
                ) : (
                  <motion.img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-auto object-cover"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </div>
              <div className="mt-3">
                <h3 className="text-base font-normal mb-0.5">{project.title}</h3>
                <p className="text-sm text-gray-500 font-light">{project.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsGrid;

