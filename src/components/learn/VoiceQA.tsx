import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import { Mic, Volume2, Loader2, MessageCircle, Globe, MicOff } from 'lucide-react';

const VoiceQA = () => {
  const [isListening, setIsListening] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  
  const { getHomeworkHelp, translateText, loading } = useAI();
  const recognitionRef = useRef<any>(null);

  const languages = [
    'English', 'Spanish', 'French', 'Arabic', 'Hindi', 'Swahili', 
    'Portuguese', 'Mandarin', 'Bengali', 'Urdu'
  ];

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = getLanguageCode(selectedLanguage);

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setIsListening(false);
      
      // Get AI answer
      await getAIAnswer(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const getLanguageCode = (language: string) => {
    const codes: { [key: string]: string } = {
      'English': 'en-US',
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'Arabic': 'ar-SA',
      'Hindi': 'hi-IN',
      'Swahili': 'sw-KE',
      'Portuguese': 'pt-BR',
      'Mandarin': 'zh-CN',
      'Bengali': 'bn-BD',
      'Urdu': 'ur-PK'
    };
    return codes[language] || 'en-US';
  };

  const getAIAnswer = async (userQuestion: string) => {
    try {
      // Get answer in English first
      const englishAnswer = await getHomeworkHelp(userQuestion, 'General Knowledge');
      
      if (englishAnswer) {
        // Translate to selected language if not English
        if (selectedLanguage !== 'English') {
          const translatedAnswer = await translateText(englishAnswer, selectedLanguage);
          setAnswer(translatedAnswer || englishAnswer);
        } else {
          setAnswer(englishAnswer);
        }
      } else {
        setAnswer('I apologize, but I could not generate an answer right now. Please try asking your question in a different way, or check if the AI service is working properly.');
      }
    } catch (error) {
      console.error('Error getting AI answer:', error);
      setAnswer('Sorry, there was a problem connecting to the AI service. Please check your internet connection and try again. If the problem persists, the AI service might be temporarily unavailable.');
    }
  };

  const speakAnswer = () => {
    if (!answer) return;

    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(answer);
      utterance.rate = 0.7; // Slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Set language
      utterance.lang = getLanguageCode(selectedLanguage);
      
      // Get available voices and use appropriate one
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(getLanguageCode(selectedLanguage).split('-')[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsPlaying(false);
      };

      speechSynthesis.speak(utterance);
    }
  };

  const clearConversation = () => {
    setQuestion('');
    setAnswer('');
    setIsPlaying(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <MessageCircle className="h-8 w-8 text-blue-600" />
          Ask Me Anything
        </CardTitle>
        <CardDescription className="text-lg">
          Ask questions in your language and get answers with voice support
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-3">
          <label className="text-lg font-medium text-gray-900">Choose Your Language:</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {languages.map((lang) => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? "default" : "outline"}
                onClick={() => setSelectedLanguage(lang)}
                className="text-sm"
              >
                <Globe className="mr-1 h-3 w-3" />
                {lang}
              </Button>
            ))}
          </div>
        </div>

        {/* Voice Input */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Ask Your Question</h3>
            <p className="text-gray-600">Press the microphone and speak clearly</p>
          </div>
          
          <div className="flex justify-center">
            {!isListening ? (
              <Button
                onClick={startListening}
                size="lg"
                className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-xl"
              >
                <Mic className="h-12 w-12" />
              </Button>
            ) : (
              <Button
                onClick={stopListening}
                size="lg"
                className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl animate-pulse"
              >
                <MicOff className="h-12 w-12" />
              </Button>
            )}
          </div>
          
          {isListening && (
            <div className="text-red-600 font-medium text-lg animate-pulse">
              🎤 Listening... Speak now!
            </div>
          )}
        </div>

        {/* Question Display */}
        {question && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">Q</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Your Question:</h4>
                  <p className="text-blue-800 text-lg">{question}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Answer Display */}
        {answer && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">A</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">Answer:</h4>
                    <Button
                      onClick={speakAnswer}
                      disabled={isPlaying}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isPlaying ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Speaking...
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-1 h-3 w-3" />
                          Listen
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-green-800 text-lg leading-relaxed whitespace-pre-line">
                    {answer}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-600">Getting your answer...</p>
          </div>
        )}

        {/* Action Buttons */}
        {(question || answer) && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={clearConversation}
              variant="outline"
              size="lg"
            >
              Ask New Question
            </Button>
          </div>
        )}

        {/* Help Text */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-yellow-900 mb-2">💡 Tips for Better Results:</h4>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• Speak clearly and slowly</li>
              <li>• Ask simple, direct questions</li>
              <li>• Use your native language</li>
              <li>• Make sure you're in a quiet place</li>
              <li>• Ask about learning, health, work, or daily life</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default VoiceQA;