import React, { useEffect, useMemo, useRef, useState } from 'react';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return true;
  if (!window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Scroll-reveal wrapper using IntersectionObserver.
 * - Adds class `cc-reveal--in` once when element enters viewport.
 * - Uses CSS variables for delay: `--cc-reveal-i` and `--cc-reveal-delay-step`.
 */
export default function Reveal({
  as: Tag = 'div',
  className = '',
  style,
  children,
  index,
  once = true,
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.12,
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  const mergedStyle = useMemo(() => {
    if (index == null) return style;
    return { ...(style || {}), '--cc-reveal-i': Number(index) || 0 };
  }, [style, index]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { root: null, rootMargin, threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once, rootMargin, threshold]);

  const cls =
    `cc-reveal ${inView ? 'cc-reveal--in' : ''} ${className || ''}`.trim();

  return (
    <Tag ref={ref} className={cls} style={mergedStyle}>
      {children}
    </Tag>
  );
}

