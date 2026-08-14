import { motion } from 'framer-motion';

export default function LoginSuccessAnim() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-8 w-full"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center w-full"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold text-[#10b981] mb-12 tracking-wide"
        >
          Verified successfully
        </motion.h2>
        
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
          {/* Outer glowing square */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
            className="absolute inset-0 rounded-[28px] border-[3px] border-[#10b981] shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          />
          
          {/* Inner animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.6 }}
            className="w-16 h-16 bg-[#10b981] rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center"
          >
            <motion.svg 
              className="w-10 h-10 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>

          {/* Particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#10b981] rounded-full"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ 
                scale: [0, 1.2, 0],
                x: Math.cos(i * (Math.PI / 4)) * 90,
                y: Math.sin(i * (Math.PI / 4)) * 90
              }}
              transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
            />
          ))}
          
          {/* Extra smaller particles */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`small-${i}`}
              className="absolute w-1 h-1 bg-[#34d399] rounded-full"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                x: Math.cos(i * (Math.PI / 2) + Math.PI/4) * 60,
                y: Math.sin(i * (Math.PI / 2) + Math.PI/4) * 60
              }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
