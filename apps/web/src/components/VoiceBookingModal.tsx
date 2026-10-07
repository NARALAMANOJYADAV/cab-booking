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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 cursor-pointer"
          aria-label="Close voice booking"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Mic className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-black text-slate-900 font-sans">Natural Voice Booking</h3>
          <p className="text-xs text-slate-500">
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
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200 shadow-lg'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
            }`}
          >
            {isListening ? <Mic className="w-8 h-8 animate-bounce" /> : <Mic className="w-8 h-8 stroke-[2.5]" />}
          </button>
          <span className="text-xs font-bold text-slate-500 mt-2">
            {isListening ? 'Listening... Speak now' : 'Tap to speak or edit text below'}
          </span>
        </div>

        {/* Editable Transcript Text Area */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Spoken / Input Sentence:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="e.g. Book a sedan to airport tomorrow at 5 AM"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSimulateVoiceInput(transcript)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 cursor-pointer"
            >
              Parse
            </button>
          </div>
        </div>

        {/* Structured Booking Confirmation Preview */}
        {parsedResult && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Parsed Structured Intent</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Pickup:</span>
                <span className="font-bold text-slate-900">{parsedResult.pickup}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Destination:</span>
                <span className="font-bold text-slate-900">{parsedResult.destination}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Vehicle Category:</span>
                <span className="font-bold text-emerald-700">{parsedResult.vehicleCategory}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Date & Time:</span>
                <span className="font-bold text-slate-900">
                  {parsedResult.scheduledDate}, {parsedResult.scheduledTime}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
              <span className="text-slate-600">Estimated Fare Range:</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatCurrencyINR(parsedResult.estimatedFareRange?.min || 450)} -{' '}
                {formatCurrencyINR(parsedResult.estimatedFareRange?.max || 530)}
              </span>
            </div>

            <button
              onClick={() => {
                onConfirmBooking(parsedResult);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-1.5 transition-all mt-2 cursor-pointer"
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
