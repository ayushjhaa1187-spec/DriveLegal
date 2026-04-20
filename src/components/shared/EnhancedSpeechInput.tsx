'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Square, RotateCcw, AlertCircle } from 'lucide-react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

interface EnhancedSpeechInputProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  language?: string;
  className?: string;
  placeholder?: string;
  legalTermsMode?: boolean;
}

const LEGAL_CORRECTIONS: Record<string, string> = {
  'bns': 'BNS',
  'ipc': 'IPC',
  'cmvr': 'CMVR',
  'mva': 'MVA',
  'section': 'Section',
  'article': 'Article',
  'rto': 'RTO',
  'fir': 'FIR',
  'challan': 'challan',
};

function applyLegalCorrections(text: string): string {
  return text.split(' ').map(word => {
    const lower = word.toLowerCase().replace(/[^a-z]/g, '');
    return LEGAL_CORRECTIONS[lower] || word;
  }).join(' ');
}

export default function EnhancedSpeechInput({
  onTranscript,
  language = 'en-IN',
  className = '',
  placeholder = 'Click mic to start speaking...',
  legalTermsMode = true,
}: EnhancedSpeechInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setError('');
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        let text = result[0].transcript;
        if (legalTermsMode) text = applyLegalCorrections(text);
        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }
      if (finalText) {
        setTranscript(prev => prev + finalText);
        onTranscript(transcript + finalText, true);
      }
      setInterimTranscript(interimText);
      if (interimText) onTranscript(interimText, false);
    };

    recognition.onerror = (event: SpeechRecognitionError) => {
      setIsListening(false);
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone permissions.');
          break;
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        case 'network':
          setError('Network error. Speech recognition requires an internet connection.');
          break;
        default:
          setError(`Recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, legalTermsMode, onTranscript, transcript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handleReset = () => {
    stopListening();
    setTranscript('');
    setInterimTranscript('');
    setError('');
    onTranscript('', true);
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 text-sm text-amber-600 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span>Speech recognition is not supported in this browser. Please use Chrome or Edge.</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isListening
              ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isListening ? (
            <><Square className="w-4 h-4" /> Stop Recording</>
          ) : (
            <><Mic className="w-4 h-4" /> Start Recording</>
          )}
        </button>
        {(transcript || interimTranscript) && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
        {legalTermsMode && (
          <span className="text-xs text-gray-400 ml-auto">Legal terms mode: ON</span>
        )}
      </div>

      <div className="relative min-h-[80px] p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm">
        {!transcript && !interimTranscript && (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <span className="text-gray-900 dark:text-gray-100">{transcript}</span>
        {interimTranscript && (
          <span className="text-gray-400 italic"> {interimTranscript}</span>
        )}
        {isListening && (
          <span className="inline-block w-2 h-4 bg-red-500 ml-0.5 animate-pulse align-middle" />
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isListening && (
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
          Listening in {language}...
        </div>
      )}
    </div>
  );
}
