import { useState, useEffect, useRef, useCallback } from 'react';

type Status = 'idle' | 'listening' | 'processing' | 'error';

interface SpeechToTextOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

const LANG_TO_BCP47: Record<string, string> = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', zh: 'zh-CN',
  ja: 'ja-JP', ru: 'ru-RU', pt: 'pt-BR', it: 'it-IT', hi: 'hi-IN',
  ar: 'ar-SA', ko: 'ko-KR', tr: 'tr-TR', vi: 'vi-VN', pl: 'pl-PL',
  nl: 'nl-NL', sv: 'sv-SE', no: 'nb-NO', fi: 'fi-FI', da: 'da-DK',
  id: 'id-ID', ms: 'ms-MY', th: 'th-TH', el: 'el-GR', he: 'he-IL',
  cs: 'cs-CZ', hu: 'hu-HU', ro: 'ro-RO', uk: 'uk-UA', bg: 'bg-BG',
  hr: 'hr-HR', sk: 'sk-SK', sl: 'sl-SI', et: 'et-EE', lv: 'lv-LV',
  lt: 'lt-LT', fa: 'fa-IR', bn: 'bn-BD', pa: 'pa-IN', te: 'te-IN',
  ta: 'ta-IN', mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN',
  sw: 'sw-KE', am: 'am-ET', yo: 'yo-NG', ig: 'ig-NG', ha: 'ha-NG',
};

export function getLangBCP47(code: string): string {
  return LANG_TO_BCP47[code] || `${code}-${code.toUpperCase()}`;
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function useSpeechToText(options: SpeechToTextOptions = {}) {
  const { language = 'en-US', continuous = false, interimResults = true } = options;

  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<any>(null);
  const isSupported = !!SpeechRecognitionAPI;

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setStatus('idle');
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setStatus('error');
      setErrorMessage('Speech recognition not supported');
      return;
    }

    if (recognitionRef.current) {
      stopListening();
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => setStatus('listening');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setTranscript(prev => (prev ? prev + ' ' + final : final));
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setStatus('error');
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone permission denied');
      } else if (event.error === 'network') {
        setErrorMessage('Network error');
      } else {
        setErrorMessage(event.error || 'Unknown error');
      }
    };

    recognition.onend = () => {
      setStatus('idle');
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage('');
    recognition.start();
  }, [language, continuous, interimResults, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    status,
    transcript,
    interimTranscript,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    resetTranscript,
  };
}
