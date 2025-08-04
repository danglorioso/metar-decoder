'use client'
import React from 'react'

export default function Footer() {
  return (
    <footer className="text-neutral-400 text-center p-4 w-full bg-gray-950 border-t border-neutral-800">
      <p className="mb-2 leading-tight">
        Website created by{" "}
        <a
          href="https://danglorioso.com"
          target="_blank" // Open in new tab
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 transition-colors duration-300"
        >
          Dan Glorioso
        </a>
        .
      </p>
      <p className="text-sm text-neutral-500 leading-tight">
        Copyright © {new Date().getFullYear()}. All rights reserved.
      </p>
    </footer>
  );
};

