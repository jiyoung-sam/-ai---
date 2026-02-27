import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Scissors, Palette, Sparkles, RefreshCw, Download, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { editHairstyle, type HairstyleOptions } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LENGTH_OPTIONS = ['Short', 'Medium', 'Long', 'Pixie', 'Shoulder-length'];
const COLOR_OPTIONS = ['Black', 'Dark Brown', 'Light Brown', 'Blonde', 'Platinum', 'Red', 'Pink', 'Blue', 'Silver'];
const STYLE_OPTIONS = ['Straight', 'Wavy', 'Curly', 'Coily', 'Bob', 'Bangs', 'Layered', 'Undercut'];

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [options, setOptions] = useState<HairstyleOptions>({
    length: 'Medium',
    color: 'Dark Brown',
    style: 'Wavy',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const handleGenerate = async () => {
    if (!originalImage) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const mimeType = originalImage.split(';')[0].split(':')[1];
      const result = await editHairstyle(originalImage, mimeType, options);
      if (result) {
        setResultImage(result);
      } else {
        setError("AI could not generate the image. Please try different options.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while generating the hairstyle. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'new-hairstyle.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-black p-1.5 rounded-lg">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">AI Hairstyle Studio</h1>
          </div>
          <p className="text-sm text-gray-500 hidden sm:block italic font-serif">Craft your perfect look</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left: Original Image / Upload */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Original Photo
              </h2>
              {originalImage && (
                <button 
                  onClick={() => { setOriginalImage(null); setResultImage(null); }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
            
            <div 
              {...getRootProps()} 
              className={cn(
                "relative aspect-[3/4] rounded-3xl overflow-hidden border-2 border-dashed transition-all duration-300 group cursor-pointer",
                originalImage ? "border-transparent" : "border-gray-300 hover:border-black bg-white",
                isDragActive && "border-black bg-gray-50"
              )}
            >
              <input {...getInputProps()} />
              
              {originalImage ? (
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Upload your photo</p>
                    <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
                  </div>
                  <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                    Supports PNG, JPG (Max 5MB)
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right: Result Image */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Transformation
            </h2>
            
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100 border border-gray-200">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="relative w-20 h-20 mb-6">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-black border-t-transparent rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Scissors className="w-8 h-8 text-black" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Styling in progress...</h3>
                    <p className="text-sm text-gray-500 max-w-xs">Our AI is carefully applying your chosen hairstyle. This usually takes 10-20 seconds.</p>
                  </motion.div>
                ) : resultImage ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full h-full"
                  >
                    <img 
                      src={resultImage} 
                      alt="Result" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-6 right-6">
                      <button 
                        onClick={downloadResult}
                        className="bg-white/90 backdrop-blur-md text-black p-3 rounded-full shadow-lg hover:bg-white transition-all active:scale-95"
                        title="Download Result"
                      >
                        <Download className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div key="placeholder" className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                    <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">Select options below and click generate to see your new look</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}
          </section>
        </div>

        {/* Bottom: Controls */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Length */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Scissors className="w-3 h-3" /> Length
              </label>
              <div className="flex flex-wrap gap-2">
                {LENGTH_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setOptions(prev => ({ ...prev, length: opt }))}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      options.length === opt 
                        ? "bg-black text-white border-black shadow-md" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Palette className="w-3 h-3" /> Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setOptions(prev => ({ ...prev, color: opt }))}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      options.color === opt 
                        ? "bg-black text-white border-black shadow-md" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Style
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setOptions(prev => ({ ...prev, style: opt }))}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      options.style === opt 
                        ? "bg-black text-white border-black shadow-md" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">Current selection:</span> {options.length}, {options.color}, {options.style}
            </div>
            <button
              disabled={!originalImage || isGenerating}
              onClick={handleGenerate}
              className={cn(
                "w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl",
                !originalImage || isGenerating
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-black text-white hover:bg-gray-800 hover:shadow-2xl"
              )}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Apply Hairstyle
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-gray-400 text-sm">
        <p>© 2026 AI Hairstyle Studio. Powered by Gemini.</p>
      </footer>
    </div>
  );
}
