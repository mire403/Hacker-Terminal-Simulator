import React from 'react';

const CRTOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden h-full w-full">
      {/* Scanlines - static repeating lines */}
      <div 
        className="absolute inset-0 w-full h-full opacity-20"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.4))',
          backgroundSize: '100% 4px'
        }}
      />
      
      {/* Moving Scanline Bar */}
       <div 
        className="absolute inset-0 w-full h-[100px] opacity-10 bg-gradient-to-b from-transparent via-green-500 to-transparent"
        style={{
          animation: 'scan 8s linear infinite'
        }}
      />

      {/* Vignette - dark corners */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)'
        }}
      />
      
      {/* Tint removed to prevent green washing/flashing issues */}
    </div>
  );
};

export default CRTOverlay;