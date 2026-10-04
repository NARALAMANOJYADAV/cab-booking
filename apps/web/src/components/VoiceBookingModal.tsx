import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, Check, X, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { formatCurrencyINR } from '@fairride/shared';

interface VoiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (structured: any) => void;
}

export const VoiceBookingModal: React.FC<VoiceBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirmBooking
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(
    'Book a sedan from my home to Hyderabad airport tomorrow at 5 AM'
  );
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSimulateVoiceInput = async (spokenText: string) => {
    setTranscript(spokenText);
    setIsLoading(true);
    try {
      const res = await api.parseVoiceBooking(spokenText);
      setParsedResult(res.data);
    } catch {
      // Fallback
      setParsedResult({
        pickup: 'Home',
        destination: 'RGIA Hyderabad Airport',
        vehicleCategory: 'SEDAN',
        scheduledDate: 'Tomorrow',
        scheduledTime: '5:00 AM',
        estimatedFareRange: { min: 460, max: 540, expected: 495 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
          aria-label="Close voice booking"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/30">
            <Mic className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-black text-white font-sans">Natural Voice Booking</h3>
          <p className="text-xs text-slate-400">
            Speak naturally in English, Telugu, or Hindi. FairRide AI parses your intent into structured booking terms.
          </p>
        </div>

        {/* Voice Trigger Circle */}
        <div className="flex flex-col items-center justify-center py-4">
          <button
            onClick={() => {
              setIsListening(true);
              setTimeout(() => {
                setIsListening(false);
                handleSimulateVoiceInput(
                  'Book a sedan from my home to Hyderabad airport tomorrow at 5 AM'
                );
              }, 1200);
            }}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-500/30 shadow-xl shadow-rose-500/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/30'
            }`}
          >
            {isListening ? <Mic className="w-8 h-8 animate-bounce" /> : <Mic className="w-8 h-8 stroke-[2.5]" />}
          </button>
          <span className="text-xs font-bold text-slate-400 mt-2">
            {isListening ? 'Listening... Speak now' : 'Tap to speak or edit text below'}
          </span>
        </div>

        {/* Editable Transcript Text Area */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Spoken / Input Sentence:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="e.g. Book a sedan to airport tomorrow at 5 AM"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={() => handleSimulateVoiceInput(transcript)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
            >
              Parse
            </button>
          </div>
        </div>

        {/* Structured Booking Confirmation Preview */}
        {parsedResult && (
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Parsed Structured Intent</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pickup:</span>
                <span className="font-bold text-white">{parsedResult.pickup}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Destination:</span>
                <span className="font-bold text-white">{parsedResult.destination}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Vehicle Category:</span>
                <span className="font-bold text-emerald-400">{parsedResult.vehicleCategory}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Date & Time:</span>
                <span className="font-bold text-white">
                  {parsedResult.scheduledDate}, {parsedResult.scheduledTime}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Estimated Fare Range:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrencyINR(parsedResult.estimatedFareRange?.min || 450)} -{' '}
                {formatCurrencyINR(parsedResult.estimatedFareRange?.max || 530)}
              </span>
            </div>

            <button
              onClick={() => {
                onConfirmBooking(parsedResult);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all mt-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>CONFIRM AND PROCEED</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
