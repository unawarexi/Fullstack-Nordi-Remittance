// Random style generator for fonts, weights, and colors
import { useState, useEffect } from "react";

// Random style generator for fonts, weights, and colors
const getRandomStyle = () => {
    const fonts = ['font-sans', 'font-serif', 'font-mono'];
    const weights = ['font-light', 'font-semibold', 'font-bold', 'font-extrabold'];
    const colors = ['text-amber-500', 'text-white', 'text-gray-200', 'text-slate-100'];
  
    return {
      fontFamily: fonts[Math.floor(Math.random() * fonts.length)],
      fontWeight: weights[Math.floor(Math.random() * weights.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
    };
};
  

const Slider = ({ slides, currentIndex, handlePaginationClick }) => {
    // Generate random styles for heading and description every time the slide changes
    const [headingStyle, setHeadingStyle] = useState(getRandomStyle());
    const [descriptionStyle, setDescriptionStyle] = useState(getRandomStyle());
  
    useEffect(() => {
      // Change styles randomly when the current index changes
      setHeadingStyle(getRandomStyle());
      setDescriptionStyle(getRandomStyle());
    }, [currentIndex]);


}