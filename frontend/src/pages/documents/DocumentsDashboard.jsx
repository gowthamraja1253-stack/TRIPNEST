import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileBox, FileText, Ticket, Hotel, Image as ImageIcon, 
  UploadCloud, Plus, Download, Trash2, Eye, Filter, X, 
  Sparkles, CheckCircle, HardDrive, Search, FolderOpen
} from 'lucide-react';
import { documentService } from '../../services/documentService';
import { tripService } from '../../services/tripService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SEO from '../../components/ui/SEO';
import { useToast } from '../../components/ui/ToastProvider';

const CATEGORIES = [
  { id: 'ALL', label: 'All Media & Docs', icon: FileBox },
  { id: 'TRAVEL_DOCUMENT', label: 'Travel Documents', icon: FileText, desc: 'Passports, Visas, IDs' },
  { id: 'TICKET', label: 'Tickets', icon: Ticket, desc: 'Flight, Train, Bus passes' },
  { id: 'HOTEL_BOOKING', label: 'Hotel Bookings', icon: Hotel, desc: 'Hotels, Airbnb vouchers' },
  { id: 'TRAVEL_PHOTO', label: 'Travel Photos', icon: ImageIcon, desc: 'Photos & memories' },
];

export default function DocumentsDashboard() {
  const [documents, setDocuments] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedTripId, setSelectedTripId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTripId, setUploadTripId] = useState('');
  const [uploadCategory, setUploadCategory] = useState('TRAVEL_DOCUMENT');
  const [uploadName, setUploadName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Preview Lightbox Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  const { addToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsData, userTrips] = await Promise.all([
        documentService.getDocuments({
          tripId: selectedTripId || undefined,
          category: activeCategory !== 'ALL' ? activeCategory : undefined
        }),
        tripService.getTrips()
      ]);

      setDocuments(docsData || []);
      setTrips(userTrips || []);
      if (!uploadTripId && userTrips && userTrips.length > 0) {
        setUploadTripId(userTrips[0].id);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      addToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCategory, selectedTripId]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadTripId) {
      addToast('Please select a trip first.', 'warning');
      return;
    }
    if (!selectedFile) {
      addToast('Please select a file to upload.', 'warning');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('tripId', uploadTripId);
      formData.append('category', uploadCategory);
      if (uploadName) {
        formData.append('name', uploadName);
      }
      formData.append('file', selectedFile);

      await documentService.uploadDocument(formData);
      addToast('File uploaded successfully!', 'success');
      setShowUploadModal(false);
      
      // Reset form
      setUploadName('');
      setSelectedFile(null);
      await loadData();
    } catch (err) {
      console.error('Failed to upload document:', err);
      addToast('Failed to upload file. Please check backend connection.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId, docName) => {
    if (!window.confirm(`Are you sure you want to delete "${docName}"?`)) return;
    try {
      await documentService.deleteDocument(docId);
      addToast('Document deleted', 'success');
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Failed to delete document:', err);
      addToast('Failed to delete document', 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImageFile = (doc) => {
    const type = (doc.fileType || doc.name || '').toLowerCase();
    return type.includes('image') || type.endsWith('.jpg') || type.endsWith('.jpeg') || type.endsWith('.png') || type.endsWith('.webp');
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.tripName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate Statistics
  const totalFiles = documents.length;
  const totalBytes = documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);

  const resolveFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    const host = baseUrl.replace(/\/api\/v1\/?$/, '');
    return `${host}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 w-full overflow-hidden">
      <SEO title="Travel Documents & Media" description="Upload, manage, and view all travel documents, tickets, hotel bookings, and photos." />

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text flex items-center gap-3">
            <FolderOpen className="text-primary shrink-0" size={30} />
            <span className="truncate">Media & Document Management</span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm sm:text-base">
            Store and organize all your travel documents, flight tickets, hotel vouchers, and trip photos in one secure place.
          </p>
        </div>
        <Button variant="primary" glow onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          <UploadCloud size={18} /> Upload Document
        </Button>
      </div>

      {/* ── Storage Overview Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-[20px] p-5 border border-border shadow-sm flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileBox size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider truncate">Total Documents & Photos</p>
            <p className="text-xl font-heading font-bold text-text truncate">{totalFiles} Files</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface rounded-[20px] p-5 border border-border shadow-sm flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <HardDrive size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider truncate">Storage Space Used</p>
            <p className="text-xl font-heading font-bold text-text truncate">{formatFileSize(totalBytes)}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface rounded-[20px] p-5 border border-border shadow-sm flex items-center gap-4 min-w-0 sm:col-span-2 lg:col-span-1">
          <div className="w-11 h-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider truncate">Storage Mode</p>
            <p className="text-xl font-heading font-bold text-text truncate">Local Storage</p>
          </div>
        </motion.div>
      </div>

      {/* ── Filter Bar & Category Tabs ── */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 max-w-full">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-xs font-semibold transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                    : 'bg-surface border-border text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <cat.icon size={15} /> {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Trip Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-xs outline-none focus:border-primary w-full sm:w-48"
              />
            </div>

            <select
              value={selectedTripId}
              onChange={e => setSelectedTripId(e.target.value)}
              className="p-2 bg-surface border border-border rounded-xl text-xs outline-none focus:border-primary text-text font-medium flex-1 sm:flex-initial"
            >
              <option value="">All Trips</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.destination || t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Document Grid / List ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" className="text-primary" />
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocs.map(doc => {
            const isImg = isImageFile(doc);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface rounded-[20px] border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                {/* Header / Thumbnail */}
                <div className="relative h-44 bg-black/10 dark:bg-white/10 flex items-center justify-center overflow-hidden border-b border-border/50">
                  {isImg ? (
                    <img src={resolveFileUrl(doc.fileUrl)} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-primary p-4 text-center">
                      {doc.category === 'TICKET' ? <Ticket size={48} /> : doc.category === 'HOTEL_BOOKING' ? <Hotel size={48} /> : <FileText size={48} />}
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-primary/10 rounded-full">
                        {doc.fileType ? doc.fileType.split('/')[1] || 'DOC' : 'FILE'}
                      </span>
                    </div>
                  )}

                  {/* Top Right Category Pill */}
                  <span className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full z-10 border border-white/20">
                    {doc.category ? doc.category.replace('_', ' ') : 'DOC'}
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-heading font-bold text-text text-base truncate mb-1" title={doc.name}>
                      {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-primary truncate">
                      {doc.tripName || 'General Trip'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-secondary border-t border-border/40 pt-2">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recent'}</span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex gap-2 pt-1 border-t border-border/40">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="flex-1 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 border border-border"
                    >
                      <Eye size={14} /> Preview
                    </button>

                    <a
                      href={resolveFileUrl(doc.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Download size={14} /> Download
                    </a>

                    <button
                      onClick={() => handleDelete(doc.id, doc.name)}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-200"
                      title="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface rounded-[24px] border border-border p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-xl font-heading font-bold text-text">No media or documents found</h3>
          <p className="text-text-secondary text-sm">
            Upload your flight tickets, hotel vouchers, passport scans, or trip photos to keep them safe and accessible.
          </p>
          <Button variant="primary" glow onClick={() => setShowUploadModal(true)}>
            <Plus size={18} className="mr-1" /> Upload First Document
          </Button>
        </div>
      )}

      {/* ── Upload Modal ── */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !isUploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-[24px] p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <UploadCloud size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-text">Upload Media & Documents</h3>
                    <p className="text-xs text-text-secondary">Supported: PDF, PNG, JPG, WEBP, DOCX</p>
                  </div>
                </div>
                <button onClick={() => setShowUploadModal(false)} disabled={isUploading} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-1.5">Select Trip</label>
                  <select
                    value={uploadTripId}
                    onChange={e => setUploadTripId(e.target.value)}
                    required
                    className="w-full p-3 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-sm font-medium outline-none focus:border-primary"
                  >
                    {trips.length === 0 ? (
                      <option value="">No Trips Found - Please Create a Trip First</option>
                    ) : (
                      trips.map(t => (
                        <option key={t.id} value={t.id}>{t.destination || t.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-1.5">Document Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.filter(c => c.id !== 'ALL').map(cat => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setUploadCategory(cat.id)}
                        className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold text-left transition-all ${
                          uploadCategory === cat.id ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-border bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        <cat.icon size={16} />
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Custom Document Name (Optional)"
                  placeholder="e.g. Flight Ticket to Paris"
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                />

                <div>
                  <label className="block text-sm font-semibold text-text mb-1.5">Select File</label>
                  <div className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-6 text-center bg-black/5 dark:bg-white/5 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      required
                      onChange={e => setSelectedFile(e.target.files[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud size={36} className="mx-auto text-primary mb-2" />
                    <p className="text-sm font-semibold text-text">
                      {selectedFile ? selectedFile.name : 'Click or Drag file here to upload'}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {selectedFile ? formatFileSize(selectedFile.size) : 'Up to 20MB per file'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                  <Button variant="outline" type="button" onClick={() => setShowUploadModal(false)} disabled={isUploading}>
                    Cancel
                  </Button>
                  <Button variant="primary" glow type="submit" disabled={isUploading || !selectedFile || !uploadTripId}>
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Image Lightbox Preview Modal ── */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-dark rounded-2xl overflow-hidden border border-white/20 p-2 shadow-2xl flex flex-col items-center"
            >
              <button
                onClick={() => setPreviewDoc(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
              >
                <X size={20} />
              </button>
              {previewDoc?.fileType?.startsWith('image/') ? (
                <img src={resolveFileUrl(previewDoc.fileUrl)} alt={previewDoc.name} className="max-h-[80vh] w-auto object-contain rounded-xl" />
              ) : (
                <iframe src={resolveFileUrl(previewDoc.fileUrl)} title={previewDoc.name} className="w-[85vw] max-w-4xl h-[75vh] bg-white rounded-xl border-none" />
              )}
              <div className="p-3 text-white text-center">
                <p className="font-bold text-base">{previewDoc.name}</p>
                <p className="text-xs text-gray-400">{previewDoc.tripName} · {formatFileSize(previewDoc.fileSize)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
