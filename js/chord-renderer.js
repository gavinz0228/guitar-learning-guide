/**
 * Chord Renderer - SVG Guitar Chord Diagram Generator
 * Pure JavaScript, no dependencies.
 *
 * renderChord(containerId, chordData) renders a chord diagram
 * into the specified container element.
 *
 * chordData format:
 * {
 *   name: "C",
 *   fullName: "C Major",
 *   category: "major",
 *   frets: [-1, 3, 2, 0, 1, 0],  // 6th string to 1st string
 *   fingers: [0, 3, 2, 0, 1, 0], // 0 = no finger
 *   notes: ["C", "E", "G"]
 * }
 */
(function () {
  'use strict';

  // --- Constants ---
  var WIDTH = 150;
  var HEIGHT = 180;
  var MARGIN_TOP = 36;       // space for top marker (X/O) and chord name
  var MARGIN_BOTTOM = 24;    // space for chord name at bottom
  var GRID_LEFT = 28;
  var GRID_RIGHT = 122;
  var GRID_TOP = MARGIN_TOP + 4;
  var GRID_BOTTOM = HEIGHT - MARGIN_BOTTOM;
  var STRING_SPACING = (GRID_RIGHT - GRID_LEFT) / 5; // ~18.8px
  var FRET_SPACING = (GRID_BOTTOM - GRID_TOP) / 4;   // 5 frets -> 4 gaps

  // Colors
  var THEME_COLOR = '#e63946';
  var GRID_COLOR = '#666666';
  var TEXT_COLOR = '#f0e6d0';
  var DOT_COLOR = '#ffffff';
  var ROOT_DOT_COLOR = THEME_COLOR;
  var MUTED_COLOR = '#999999';
  var BG_COLOR = 'transparent';

  /**
   * Render a chord diagram into a container element.
   * @param {string|HTMLElement} containerId - Container element or its ID
   * @param {Object} chordData - Chord data object
   */
  window.renderChord = function (containerId, chordData) {
    var container = (typeof containerId === 'string')
      ? document.getElementById(containerId)
      : containerId;

    if (!container) {
      console.error('Chord renderer: container not found:', containerId);
      return;
    }

    // Clear previous content
    container.innerHTML = '';

    // Create SVG element
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', WIDTH);
    svg.setAttribute('height', HEIGHT);
    svg.setAttribute('viewBox', '0 0 ' + WIDTH + ' ' + HEIGHT);
    svg.setAttribute('class', 'chord-diagram');
    container.appendChild(svg);

    // --- 1. Chord Name at top (large) ---
    drawText(svg, WIDTH / 2, 16, chordData.name, {
      'font-size': '17px',
      'font-weight': 'bold',
      'fill': TEXT_COLOR,
      'text-anchor': 'middle',
      'font-family': 'system-ui, sans-serif'
    });

    // --- 2. Fretboard grid ---
    // Vertical string lines (6 strings)
    for (var s = 0; s < 6; s++) {
      var x = GRID_LEFT + s * STRING_SPACING;
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', GRID_TOP);
      line.setAttribute('x2', x);
      line.setAttribute('y2', GRID_BOTTOM);
      line.setAttribute('stroke', GRID_COLOR);
      line.setAttribute('stroke-width', (s === 0 || s === 5) ? 2 : 1.2);
      svg.appendChild(line);
    }

    // Horizontal fret lines (5 frets = 4 spaces)
    for (var f = 0; f < 5; f++) {
      var y = GRID_TOP + f * FRET_SPACING;
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', GRID_LEFT);
      line.setAttribute('y1', y);
      line.setAttribute('x2', GRID_RIGHT);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', GRID_COLOR);
      line.setAttribute('stroke-width', 1);
      svg.appendChild(line);
    }

    // Thicker top fret line (nut)
    var nutLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    nutLine.setAttribute('x1', GRID_LEFT);
    nutLine.setAttribute('y1', GRID_TOP);
    nutLine.setAttribute('x2', GRID_RIGHT);
    nutLine.setAttribute('y2', GRID_TOP);
    nutLine.setAttribute('stroke', GRID_COLOR);
    nutLine.setAttribute('stroke-width', 2.5);
    svg.appendChild(nutLine);

    // --- 3. Fret markers (X, O) above strings ---
    var frets = chordData.frets;
    for (var s2 = 0; s2 < 6; s2++) {
      var xPos = GRID_LEFT + s2 * STRING_SPACING;
      var yPos = MARGIN_TOP - 8;

      if (frets[s2] === -1) {
        // X - muted string
        drawText(svg, xPos, yPos, '✕', {
          'font-size': '11px',
          'fill': MUTED_COLOR,
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-family': 'system-ui, sans-serif'
        });
      } else if (frets[s2] === 0) {
        // O - open string
        drawText(svg, xPos, yPos, '○', {
          'font-size': '12px',
          'fill': TEXT_COLOR,
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-family': 'system-ui, sans-serif'
        });
      }
    }

    // --- 4. Fingering dots on fretboard ---
    var fingers = chordData.fingers;

    for (var s3 = 0; s3 < 6; s3++) {
      var fretNum = frets[s3];
      if (fretNum <= 0) continue; // skip muted/open strings

      var xDot = GRID_LEFT + s3 * STRING_SPACING;
      // fret 1 = top, fret 2 = second space, etc.
      var yDot = GRID_TOP + (fretNum - 1) * FRET_SPACING + FRET_SPACING / 2;

      // Determine if this note is the root note (first in notes array)
      var isRoot = (s3 === 0 && frets[s3] > 0) ? false : false;
      // Actually determine root by checking if the note matches chordData.notes[0]
      // Simple heuristic: mark the lowest fretted string's note as root-ish
      // For now, use white dots with theme-colored outline for all, and theme color for root

      var fingerNum = fingers[s3] || 0;

      // Draw dot
      var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', xDot);
      dot.setAttribute('cy', yDot);
      dot.setAttribute('r', 7);
      dot.setAttribute('fill', DOT_COLOR);
      dot.setAttribute('stroke', THEME_COLOR);
      dot.setAttribute('stroke-width', 1.5);
      svg.appendChild(dot);

      // Draw finger number inside the dot
      if (fingerNum > 0) {
        drawText(svg, xDot, yDot + 0.5, String(fingerNum), {
          'font-size': '8px',
          'font-weight': 'bold',
          'fill': '#1a1a1a',
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-family': 'system-ui, sans-serif'
        });
      }
    }

    // --- 5. Chord full name at bottom ---
    drawText(svg, WIDTH / 2, HEIGHT - 6, chordData.fullName, {
      'font-size': '11px',
      'fill': TEXT_COLOR,
      'text-anchor': 'middle',
      'font-family': 'system-ui, sans-serif'
    });
  };

  /**
   * Helper to draw SVG text
   */
  function drawText(svg, x, y, content, attrs) {
    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    for (var key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        text.setAttribute(key, attrs[key]);
      }
    }
    text.textContent = content;
    svg.appendChild(text);
  }

})();
