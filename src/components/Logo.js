// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const React = require('react');

/**
 * Logo component
 * Props:
 * - name: application name (string)
 * - height: desired logo height in px (number)
 * - showTagline: boolean to show/hide tagline
 */
function Logo({ name = 'Apolo TV', height = 64, showTagline = false }) {
  // Base dimensions from the SVG: mascot area ~200px height at default scale
  const scale = height / 64; // approximate scale factor
  const fontSize = Math.max(14, Math.round(24 * scale));
  const titleSize = Math.max(20, Math.round(42 * scale));

  const svgWidth = Math.min(1200, Math.max(300, 12 * name.length * scale + 300));

  return (
    React.createElement('svg', {
      width: svgWidth,
      height: height,
      viewBox: '0 0 1200 300',
      preserveAspectRatio: 'xMinYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
    },
      // transparent background
      React.createElement('rect', { width: '1200', height: '300', fill: 'transparent' }),

      // mascot group (keeps original shapes)
      React.createElement('g', { transform: 'translate(40,10) scale(0.45)', id: 'mascot' },
        React.createElement('rect', { x: 96, y: 120, width: 320, height: 280, rx: 95, fill: '#FF5A45' }),
        React.createElement('line', { x1: 200, y1: 120, x2: 145, y2: 55, stroke: '#FF5A45', strokeWidth: 28, strokeLinecap: 'round' }),
        React.createElement('line', { x1: 312, y1: 120, x2: 367, y2: 55, stroke: '#FF5A45', strokeWidth: 28, strokeLinecap: 'round' }),
        React.createElement('line', { x1: 175, y1: 390, x2: 150, y2: 440, stroke: '#FF5A45', strokeWidth: 28, strokeLinecap: 'round' }),
        React.createElement('line', { x1: 337, y1: 390, x2: 362, y2: 440, stroke: '#FF5A45', strokeWidth: 28, strokeLinecap: 'round' }),
        React.createElement('rect', { x: 145, y: 180, width: 222, height: 165, rx: 58, fill: '#F4F1EA', stroke: '#F8CEC2', strokeWidth: 10 }),
        React.createElement('circle', { cx: 205, cy: 248, r: 20, fill: '#FF5A45' }),
        React.createElement('circle', { cx: 307, cy: 248, r: 20, fill: '#FF5A45' }),
        React.createElement('path', { d: 'M235 305 Q256 327 285 304', stroke: '#F8CEC2', strokeWidth: 16, strokeLinecap: 'round', fill: 'none' }),
        React.createElement('path', { d: 'M228 297 Q256 325 280 297', stroke: '#FF5A45', strokeWidth: 16, strokeLinecap: 'round', fill: 'none' }),
      ),

      // wordmark
      React.createElement('g', { id: 'wordmark', transform: 'translate(420,150)' },
        React.createElement('text', {
          x: 0, y: 24,
          fontFamily: "Poppins, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial",
          fontWeight: 700,
          fontSize: titleSize,
          fill: '#FF5A45',
          letterSpacing: 1,
        }, name),
        showTagline && React.createElement('text', {
          x: 0, y: 64,
          fontFamily: "Poppins, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial",
          fontWeight: 500,
          fontSize: fontSize,
          fill: '#6b6b6b', opacity: 0.9,
        }, 'Stream smarter • Watch together')
      )
    )
  );
}

module.exports = Logo;
