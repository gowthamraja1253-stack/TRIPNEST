import { motion } from 'framer-motion';
import MarkdownText from './MarkdownText';

export default function AIMessage({ role, content }) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div 
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-primary text-white rounded-br-none shadow-sm' 
            : 'bg-white dark:bg-surface border border-border text-text shadow-sm rounded-bl-none'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <MarkdownText content={content} />
        )}
      </div>
    </motion.div>
  );
}
