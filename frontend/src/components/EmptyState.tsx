import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '../config';

const EmptyState = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-12 text-center py-12 border border-gray-200 bg-gray-50"
    >
      <div className="flex justify-center mb-6">
        <ShieldCheck className="w-12 h-12 text-black stroke-1" />
      </div>
      <h3 className="text-lg font-bold text-black uppercase tracking-wider mb-2">
        {APP_CONFIG.ui.results.emptyState}
      </h3>
      <p className="text-sm text-gray-500 font-mono">
        {APP_CONFIG.ui.results.emptyStateParagraph}
      </p>
    </motion.div>
  );
};

export default EmptyState;