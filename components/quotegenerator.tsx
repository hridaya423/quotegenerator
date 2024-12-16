/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Twitter, Facebook, Copy, RefreshCw, Volume2, VolumeX, Sparkles } from 'lucide-react';

type Quote = {
  text: string;
  author: string;
  category?: string;
};

const QUOTE_SOURCES = [
    {
      name: 'Quotable',
      url: 'https://api.quotable.io/random?tags=inspirational|wisdom',
      transform: (data: any): Quote => ({
        text: data.content,
        author: data.author,
        category: data.tags?.[0] || 'Inspiration'
      })
    },
    {
      name: 'ZenQuotes',
      url: 'https://zenquotes.io/api/wisdom',
      transform: (data: any[]): Quote => ({
        text: data[0].q,
        author: data[0].a,
        category: 'Wisdom'
      })
    }
  ];
  
  const FALLBACK_QUOTES: Quote[] = [
    {
      text: "In the middle of difficulty lies opportunity.",
      author: "Albert Einstein",
      category: "Inspiration"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "Motivation"
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      category: "Courage"
    }
  ];
  
  const BACKGROUND_IMAGES = [
    'https://images.unsplash.com/photo-1501510913930-edc42f83723b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1464822759424-9994c25fd5c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1470071459604-3c5c5a9a07d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80'
  ];
  
  // Particle system for background animation
  const ParticleBackground: React.FC<{ active: boolean }> = ({ active }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
  
    useEffect(() => {
      if (!active || !canvasRef.current) return;
  
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  
      const particles: { 
        x: number; 
        y: number; 
        radius: number; 
        speedX: number; 
        speedY: number; 
        color: string 
      }[] = [];
  
      const createParticles = () => {
        for (let i = 0; i < 150; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            color: `hsla(${Math.random() * 360}, 70%, 60%, ${Math.random() * 0.5 + 0.2})`
          });
        }
      };
  
      const animateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        particles.forEach((p, index) => {
          p.x += p.speedX;
          p.y += p.speedY;
  
          // Wrap around the canvas
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
  
          // Draw particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.closePath();
        });
  
        requestAnimationFrame(animateParticles);
      };
  
      createParticles();
      animateParticles();
  
      const resizeHandler = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
  
      window.addEventListener('resize', resizeHandler);
      return () => {
        window.removeEventListener('resize', resizeHandler);
      };
    }, [active]);
  
    return (
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 opacity-30 pointer-events-none" 
      />
    );
  };
const QuoteGenerator: React.FC = () => {
    const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
  
    // Memoized color gradient for dynamic background
    const gradientColors = useMemo(() => {
      const hue = Math.floor(Math.random() * 360);
      return `linear-gradient(135deg, 
        hsla(${hue}, 70%, 60%, 0.3), 
        hsla(${(hue + 120) % 360}, 70%, 60%, 0.3)
      )`;
    }, [currentQuote]);

  const fetchQuoteFromSource = async (source: any) => {
    try {
      const response = await fetch(source.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`${source.name} API request failed`);
      }

      const data = await response.json();
      return source.transform(data);
    } catch (err) {
      console.error(`Error fetching from ${source.name}:`, err);
      return null;
    }
  };

  const fetchQuote = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try multiple quote sources
      let quote: Quote | null = null;
      for (const source of QUOTE_SOURCES) {
        quote = await fetchQuoteFromSource(source);
        if (quote) break;
      }

      // Fallback to local quotes if all sources fail
      if (!quote) {
        quote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        setError('Unable to fetch quote. Using a local backup.');
      }

      // Set background image
      const randomImage = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
      setBackgroundImage(randomImage);
      
      setCurrentQuote(quote);
      setIsLoading(false);
    } catch (error) {
      console.error('Comprehensive quote fetch error:', error);
      
      // Final fallback
      const fallbackQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      const randomImage = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
      
      setCurrentQuote(fallbackQuote);
      setBackgroundImage(randomImage);
      setError('Unable to fetch quote. Using a local backup.');
      setIsLoading(false);
    }
  };


  const toggleSound = () => {
    if (audioRef.current) {
      if (isSoundEnabled) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsSoundEnabled(!isSoundEnabled);
    }
  };

  const copyQuoteToClipboard = () => {
    if (currentQuote) {
      navigator.clipboard.writeText(`"${currentQuote.text}" - ${currentQuote.author}`);
    }
  };

  const shareOnTwitter = () => {
    if (currentQuote) {
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${currentQuote.text}" - ${currentQuote.author}`)}`;
      window.open(twitterShareUrl, '_blank');
    }
  };

  const shareOnFacebook = () => {
    if (currentQuote) {
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`"${currentQuote.text}" - ${currentQuote.author}`)}`;
      window.open(facebookShareUrl, '_blank');
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="animate-pulse text-4xl font-light text-gray-600">
          Crafting your moment of zen...
        </div>
      </div>
    );
  }

  return (
    <div 
    className="min-h-screen relative overflow-hidden flex items-center justify-center"
    style={{ 
      background: `
        ${gradientColors}, 
        linear-gradient(
          rgba(255,255,255,0.2), 
          rgba(255,255,255,0.2)
        ), 
        url(${backgroundImage})
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay'
    }}
  >
    {/* Particle Background */}
    <ParticleBackground active={!isLoading} />

    {/* Glowing Animated Quote Container */}
    <div 
      className="relative z-10 bg-white/40 backdrop-blur-xl rounded-3xl p-10 max-w-xl w-full mx-4 shadow-2xl 
      transition-all duration-1000 ease-in-out transform hover:scale-[1.02] 
      animate-subtle-float border-2 border-white/20
      ring-4 ring-white/10 hover:ring-white/30"
    >
      {/* Sparkling Effect */}
      <div className="absolute -top-4 -right-4 text-yellow-400 animate-pulse">
        <Sparkles className="w-10 h-10" />
      </div>

      <div className="text-center relative overflow-hidden">
        {currentQuote && (
          <div className="animate-quote-reveal">
            <blockquote 
              className="text-3xl font-light italic text-gray-900 mb-6 relative 
              bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <span className="absolute text-7xl text-blue-400/30 -left-2 -top-4">&quot;</span>
              {currentQuote.text}
              <span className="absolute text-7xl text-blue-400/30 -right-2 -bottom-4">&quot;</span>
            </blockquote>
            
            <p className="text-xl font-semibold text-gray-800 mb-4 
              bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
              - {currentQuote.author}
            </p>
            
            {currentQuote.category && (
              <div 
                className="inline-block px-4 py-2 rounded-full text-sm mb-6 
                bg-gradient-to-r from-blue-700 to-purple-700 
                text-transparent bg-clip-text font-bold 
                animate-category-pulse"
              >
                {currentQuote.category}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default QuoteGenerator;