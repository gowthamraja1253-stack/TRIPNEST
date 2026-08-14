import { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function AIInput({ input, setInput, onSend, isLoading }) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'; // base height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 bg-background border-t border-border">
      <div className="relative flex items-end gap-2 bg-white dark:bg-surface border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 rounded-2xl p-2 transition-all shadow-sm">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask TripNest AI anything..."
          className="flex-1 max-h-[120px] min-h-[44px] bg-transparent text-sm text-text placeholder-text-muted resize-none focus:outline-none py-3 px-2 leading-relaxed"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-primary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors mb-0.5"
          aria-label="Send message"
        >
          <Send size={18} className={input.trim() && !isLoading ? "ml-0.5" : ""} />
        </button>
      </div>
      <p className="text-center text-[10px] text-text-muted mt-2">
        AI can make mistakes. Verify important travel information.
      </p>
    </div>
  );
}
