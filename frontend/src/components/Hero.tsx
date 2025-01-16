import React from 'react';
import { ThreeDPhotoCarousel } from './ui/3d-carousel';
import Squares from './Squares';
import { Play, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen">
      {/* Animated Squares Background */}
      <div className="absolute inset-0 overflow-hidden">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='rgba(59, 130, 246, 0.1)'
          hoverFillColor='rgba(59, 130, 246, 0.1)'
        />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 font-medium text-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                N°1 in AI Thumbnails
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Viral Thumbnails
                </span>
                <br />
                in Seconds
              </h1>
              
              <p className="text-lg text-gray-400 mb-8 max-w-lg">
                Ideate & package your videos faster & cheaper.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25">
                  Try for Free
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full font-semibold border border-white/10 flex items-center gap-2 transition-all">
                  <Play className="w-4 h-4" />
                  Watch Demo
                  <span className="text-sm text-gray-400">68 sec</span>
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Trusted by</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">53,948</span>
                  <span>Users</span>
                </div>
              </div>
            </div>

            {/* Right Column - Carousel */}
            <div className="relative lg:-mr-32">
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent lg:hidden" />
              <ThreeDPhotoCarousel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}