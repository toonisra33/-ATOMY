const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

code = code.replace(
  "import { X, Copy, Check, QrCode, Share2, Sparkles, Link as LinkIcon, Lock, Activity, ChevronDown, ChevronUp, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';",
  "import { X, Copy, Check, QrCode, Share2, Sparkles, Link as LinkIcon, Lock, Activity, ChevronDown, ChevronUp, Image as ImageIcon, Trash2, Loader2, Upload } from 'lucide-react';"
);

fs.writeFileSync('src/components/AffiliateModal.tsx', code);
