'use client'
import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-800/80 backdrop-blur border-t border-gray-600/50 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Main content */}
          <div className="text-center">
            <p className="text-gray-300 text-sm md:text-base mb-1">
              Created by{" "}
              <a
                href="https://danglorioso.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300 underline decoration-blue-400/30 hover:decoration-blue-300/60 underline-offset-2"
              >
                Dan Glorioso
              </a>
              .
            </p>
            <p className="text-gray-400 text-xs">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>

          {/* Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 max-w-5xl">
            <p className="text-amber-200/90 text-xs md:text-sm text-center leading-relaxed">
              ⚠️ <span className="font-semibold">Disclaimer:</span> This website is not intended for operational use and should not be relied upon for flight planning or aviation decision-making.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

