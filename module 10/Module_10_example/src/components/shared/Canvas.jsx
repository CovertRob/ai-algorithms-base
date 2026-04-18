import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

/**
 * Reusable Canvas component using Pixi.js for high-performance rendering
 * Manages Pixi application lifecycle and provides drawing context
 */
const Canvas = ({ onSetup, width = 800, height = 600, className = '' }) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;

    // Mark as initialized
    initializedRef.current = true;

    // Create Pixi application
    const app = new PIXI.Application();

    // Initialize Pixi
    const initPixi = async () => {
      try {
        await app.init({
          width,
          height,
          backgroundColor: 0xffffff,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        // Clear container first
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          // Add canvas to DOM
          containerRef.current.appendChild(app.canvas);
          appRef.current = app;

          // Call setup function with app context
          if (onSetup) {
            onSetup(app);
          }
        }
      } catch (error) {
        console.error('Failed to initialize Pixi:', error);
        initializedRef.current = false;
      }
    };

    initPixi();

    // Cleanup
    return () => {
      if (appRef.current) {
        try {
          appRef.current.destroy(true, {
            children: true,
            texture: true,
            baseTexture: true,
          });
        } catch (error) {
          console.error('Error destroying Pixi app:', error);
        }
        appRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [width, height, onSetup]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};

export default Canvas;
