"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export const EntryAnimation = ({ children, onAnimationComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [navbarPosition, setNavbarPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const calculateNavbarPosition = () => {
      const navbar = document.querySelector("nav");
      if (navbar) {
        const logo = navbar.querySelector("a");
        if (logo) {
          const logoRect = logo.getBoundingClientRect();
          setNavbarPosition({
            x: logoRect.left + logoRect.width / 2 - window.innerWidth / 2,
            y: logoRect.top + logoRect.height / 2 - window.innerHeight / 2,
          });
        }
      }
    };

    const timer = setTimeout(() => {
      calculateNavbarPosition();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setShowContent(true);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 800);
    }, 3500);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <>
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <motion.div
              className="flex items-center justify-center"
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: [0.9, 1.1, 1], opacity: [0, 1, 1], y: [10, 0, 0] }}
              exit={{
                scale: 0.6,
                x: navbarPosition.x,
                y: navbarPosition.y,
                opacity: 1,
              }}
              transition={{
                duration: 2.5,
                ease: "easeInOut",
                times: [0, 0.4, 1],
              }}
            >
              <motion.span
                className="text-7xl md:text-8xl lg:text-[9rem] font-bold text-white tracking-wider"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 1.2 }}
              >
                HIVOX
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
