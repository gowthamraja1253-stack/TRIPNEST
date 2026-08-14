import { motion } from 'framer-motion';

export default function AITypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full justify-start mb-4"
    >
      <div className="bg-white dark:bg-surface border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5 h-11">
        <motion.div 
          className="w-1.5 h-1.5 bg-primary rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }}
        />
        <motion.div 
          className="w-1.5 h-1.5 bg-primary/70 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }}
        />
        <motion.div 
          className="w-1.5 h-1.5 bg-primary/40 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
