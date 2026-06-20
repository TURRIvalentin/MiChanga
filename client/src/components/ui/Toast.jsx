import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const types = {
  success: { icon: CheckCircle, bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon_: 'text-green-500' },
  error: { icon: AlertCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon_: 'text-red-500' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', icon_: 'text-yellow-500' },
  info: { icon: Info, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon_: 'text-blue-500' },
};

export default function Toast({ message, type = 'info', onClose }) {
  const { icon: Icon, bg, text, icon_ } = types[type] || types.info;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bg} animate-in slide-in-from-right duration-200`}>
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${icon_}`} />
      <p className={`text-sm font-medium flex-1 ${text}`}>{message}</p>
      <button onClick={onClose} className={`${text} opacity-70 hover:opacity-100 transition-opacity shrink-0`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
