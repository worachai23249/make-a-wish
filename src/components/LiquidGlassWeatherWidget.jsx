import React from 'react';
import { Droplets, Wind, Sparkles, MapPin } from 'lucide-react';

export default function LiquidGlassWeatherWidget({ location = "Make a Wish", mood = "Partly Cloudy", temp = "72°", humidity = "55%", wind = "8 mph" }) {
  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] mx-auto select-none group">
      {/* 3D Liquid Frosted Glass Card Container (Matching Image 1) */}
      <div 
        className="relative rounded-[36px] p-6 text-white overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(147, 197, 253, 0.72) 0%, rgba(96, 165, 250, 0.62) 50%, rgba(59, 130, 246, 0.75) 100%)',
          backdropFilter: 'blur(32px) saturate(220%)',
          WebkitBackdropFilter: 'blur(32px) saturate(220%)',
          border: '1.5px solid rgba(255, 255, 255, 0.85)',
          boxShadow: `
            0 24px 48px -12px rgba(37, 99, 235, 0.35),
            0 8px 20px -4px rgba(37, 99, 235, 0.20),
            inset 0 2.5px 3px 0 rgba(255, 255, 255, 0.95),
            inset 2px 0 3px 0 rgba(255, 255, 255, 0.8),
            inset 0 -2.5px 4px 0 rgba(29, 78, 216, 0.25),
            inset 0 0 28px 0 rgba(255, 255, 255, 0.45)
          `
        }}
      >
        {/* ==================== 💧 3D REALISTIC WATER DROPLETS ==================== */}
        {/* Top-left droplets */}
        <div 
          className="absolute top-4 left-6 w-2.5 h-3 rounded-full opacity-90 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 30%, rgba(96,165,250,0.2) 70%, rgba(29,78,216,0.35) 100%)',
            boxShadow: 'inset 1px 1px 1.5px rgba(255,255,255,0.9), inset -1px -1px 1.5px rgba(29,78,216,0.4), 1px 2px 3px rgba(30,64,175,0.3)'
          }}
        />
        <div 
          className="absolute top-8 left-4 w-1.5 h-1.5 rounded-full opacity-80 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(29,78,216,0.3) 100%)',
            boxShadow: '1px 1.5px 2px rgba(30,64,175,0.3)'
          }}
        />

        {/* Top-right droplets */}
        <div 
          className="absolute top-5 right-7 w-2 h-2.5 rounded-full opacity-85 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(29,78,216,0.35) 100%)',
            boxShadow: 'inset 1px 1px 1.5px rgba(255,255,255,0.9), 1px 2px 3px rgba(30,64,175,0.25)'
          }}
        />
        <div 
          className="absolute top-10 right-4 w-2.5 h-2.5 rounded-full opacity-90 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(29,78,216,0.4) 100%)',
            boxShadow: 'inset 1px 1px 1.5px rgba(255,255,255,0.9), 1px 2px 3px rgba(30,64,175,0.3)'
          }}
        />

        {/* Mid-right & bottom droplets */}
        <div 
          className="absolute top-28 right-5 w-3 h-3.5 rounded-full opacity-90 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(29,78,216,0.4) 100%)',
            boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.95), 1px 2px 4px rgba(30,64,175,0.35)'
          }}
        />
        <div 
          className="absolute bottom-12 right-6 w-2 h-2 rounded-full opacity-80 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(29,78,216,0.3) 100%)',
            boxShadow: '1px 1.5px 2px rgba(30,64,175,0.25)'
          }}
        />
        <div 
          className="absolute bottom-14 left-5 w-2 h-2.5 rounded-full opacity-80 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(29,78,216,0.35) 100%)',
            boxShadow: 'inset 1px 1px 1.5px rgba(255,255,255,0.9), 1px 2px 3px rgba(30,64,175,0.25)'
          }}
        />

        {/* ==================== 🌤️ CONTENT LAYER ==================== */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Location Title */}
          <div className="text-base font-semibold tracking-wide text-white/95 drop-shadow-sm flex items-center gap-1.5">
            {location}
          </div>

          {/* 3D Sun & Cloud Graphic */}
          <div className="relative my-3 w-28 h-20 flex items-center justify-center">
            {/* 3D Radiant Sun */}
            <div 
              className="absolute top-1 right-5 w-12 h-12 rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #FDE047 0%, #F59E0B 75%, #D97706 100%)',
                boxShadow: '0 0 24px 6px rgba(245, 158, 11, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.85)'
              }}
            />

            {/* 3D Fluffy Cloud */}
            <div 
              className="absolute bottom-1 w-24 h-14 rounded-full"
              style={{
                background: 'radial-gradient(circle at 40% 30%, #FFFFFF 0%, #F1F5F9 60%, #CBD5E1 100%)',
                boxShadow: `
                  0 8px 18px -2px rgba(15, 23, 42, 0.22),
                  inset 0 3px 4px rgba(255, 255, 255, 0.95),
                  inset 0 -2px 3px rgba(148, 163, 184, 0.4)
                `
              }}
            >
              {/* Cloud Puffs */}
              <div 
                className="absolute -top-3 left-3 w-10 h-10 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 40% 30%, #FFFFFF 0%, #E2E8F0 90%)',
                  boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.95)'
                }}
              />
              <div 
                className="absolute -top-5 left-8 w-12 h-12 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 40% 30%, #FFFFFF 0%, #E2E8F0 90%)',
                  boxShadow: 'inset 0 2.5px 3px rgba(255, 255, 255, 0.95)'
                }}
              />
            </div>
          </div>

          {/* Temperature */}
          <div 
            className="text-4xl font-extrabold tracking-tighter text-white drop-shadow-md leading-none"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            {temp}
          </div>

          {/* Condition */}
          <div className="text-xs font-semibold text-white/90 mt-1 drop-shadow-sm">
            {mood}
          </div>

          {/* Bottom Stats (Humidity & Wind) */}
          <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/25 text-[11px] font-medium text-white/85">
            <span className="flex items-center gap-1">
              <Droplets size={12} className="text-white/90" /> {humidity}
            </span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1">
              <Wind size={12} className="text-white/90" /> {wind}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
