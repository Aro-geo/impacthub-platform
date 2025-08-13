import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAI } from '@/hooks/useAI';
import { Accessibility, Mic, Volume2, Languages, Image, Loader2 } from 'lucide-react';

const AccessibilityTools = () => {
  const [selectedTool, setSelectedTool] = useState('text-to-speech');
  const [inputText, setInputText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [result, setResult] = useState('');
  const [isListening, setIsListening] = useState(false);

  const { translateText, generateAltText, loading } = useAI();

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'sw', name: 'Swahili' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
  ];

  // Text-to-Speech functionality
  const handleTextToSpeech = () => {
    if (!inputText.trim()) return;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(inputText);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Get available voices and use a natural sounding one if available
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Natural') || 
        voice.name.includes('Enhanced') ||
        voice.lang.startsWith('en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesis.speak(utterance);
      setResult('Speaking text...');
    } else {
      setResult('Text-to-speech not supported in this browser');
    }
  };

  // Speech-to-Text functionality
  const handleSpeechToText = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setResult('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setResult('Listening... Please speak now.');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setResult(`Recognized: "${transcript}"`);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setResult(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Translation functionality
  const handleTranslation = async () => {
    if (!inputText.trim() || !targetLanguage) return;

    const languageName = languages.find(lang => lang.code === targetLanguage)?.name || targetLanguage;
    const translatedText = await translateText(inputText, languageName);
    
    if (translatedText) {
      setResult(translatedText);
    }
  };

  // Alt text generation
  const handleAltTextGeneration = async () => {
    if (!imageDescription.trim()) return;

    const altText = await generateAltText(imageDescription);
    
    if (altText) {
      setResult(altText);
    }
  };

  const tools = [
    {
      id: 'text-to-speech',
      name: 'Text-to-Speech',
      icon: Volume2,
      description: 'Convert text to natural speech'
    },
    {
      id: 'speech-to-text',
      name: 'Speech-to-Text',
      icon: Mic,
      description: 'Convert speech to text'
    },
    {
      id: 'translator',
      name: 'Language Translator',
      icon: Languages,
      description: 'Translate text to different languages'
    },
    {
      id: 'alt-text',
      name: 'Alt Text Generator',
      icon: Image,
      description: 'Generate alt text for images'
    }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Accessibility className="h-6 w-6 text-purple-600" />
          AI Accessibility Tools
        </CardTitle>
        <CardDescription>
          AI-powered tools to make content more accessible for everyone
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tool Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "outline"}
              className="h-auto p-4 flex-col gap-2"
              onClick={() => setSelectedTool(tool.id)}
            >
              <tool.icon className="h-5 w-5" />
              <span className="text-xs text-center">{tool.name}</span>
            </Button>
          ))}
        </div>

        {/* Tool Interface */}
        <div className="space-y-4">
          {/* Text-to-Speech */}
          {selectedTool === 'text-to-speech' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Text to Speak</Label>
                <Textarea
                  placeholder="Enter text to convert to speech..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleTextToSpeech} disabled={!inputText.trim()}>
                <Volume2 className="mr-2 h-4 w-4" />
                Speak Text
              </Button>
            </div>
          )}

          {/* Speech-to-Text */}
          {selectedTool === 'speech-to-text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Recognized Text</Label>
                <Textarea
                  placeholder="Click 'Start Listening' and speak..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleSpeechToText} 
                disabled={isListening}
                className={isListening ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                {isListening ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Listening...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Start Listening
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Language Translator */}
          {selectedTool === 'translator' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Text to Translate</Label>
                <Textarea
                  placeholder="Enter text to translate..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Language</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleTranslation} 
                disabled={loading || !inputText.trim() || !targetLanguage}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="mr-2 h-4 w-4" />
                    Translate Text
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Alt Text Generator */}
          {selectedTool === 'alt-text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image Description</Label>
                <Textarea
                  placeholder="Describe the image you want to generate alt text for..."
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleAltTextGeneration} 
                disabled={loading || !imageDescription.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Image className="mr-2 h-4 w-4" />
                    Generate Alt Text
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800 text-lg">Result</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-900">{result}</p>
            </CardContent>
          </Card>
        )}

        {/* Accessibility Tips */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Accessibility Best Practices:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <h5 className="font-medium mb-2">For Content Creators:</h5>
                <ul className="space-y-1">
                  <li>• Always provide alt text for images</li>
                  <li>• Use clear, simple language</li>
                  <li>• Ensure good color contrast</li>
                  <li>• Structure content with proper headings</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">For Users:</h5>
                <ul className="space-y-1">
                  <li>• Use screen readers when available</li>
                  <li>• Adjust text size for comfort</li>
                  <li>• Enable high contrast mode if needed</li>
                  <li>• Use keyboard navigation when helpful</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default AccessibilityTools;