import React from 'react';
import { useLocation } from 'react-router-dom';
import HomeSlider from './HomeSliderComponent';

export default function HomeSliderGate() {
  const location = useLocation();
  const path = location && location.pathname ? location.pathname : '';
  if (path !== '/home') return null;
  return <HomeSlider />;
}

