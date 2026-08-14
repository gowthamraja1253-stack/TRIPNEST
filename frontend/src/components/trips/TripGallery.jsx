import { useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../ui/ToastProvider';
import Button from '../ui/Button';

export default function TripGallery({ images }) {
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addToast('Photo uploaded successfully! (Feature coming soon to backend)', 'success');
    }
  };

  return (
    <div className="bg-surface rounded-[20px] border border-border/50 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading font-bold text-lg text-text">Trip Memory Gallery</h3>
        <Button variant="outline" size="sm" onClick={handleUploadClick} className="flex items-center gap-2">
          <UploadCloud size={16} /> Upload
        </Button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        multiple 
        accept="image/*"
      />

      {(!images || images.length === 0) ? (
        <div 
          onClick={handleUploadClick}
          className="border-2 border-dashed border-border/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-black/5 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
        >
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
            <ImageIcon className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h4 className="font-semibold text-text mb-1">Upload memories</h4>
          <p className="text-sm text-text-secondary">Drag and drop your photos here, or click to browse.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="relative rounded-xl overflow-hidden cursor-pointer group break-inside-avoid"
            >
              <img 
                src={img.url} 
                alt={img.caption || "Trip photo"} 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-semibold truncate drop-shadow-md">{img.caption || "Memory"}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
