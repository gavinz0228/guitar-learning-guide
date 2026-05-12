/**
 * Fretboard Renderer - SVG Full Fretboard Diagram Generator
 * Pure JavaScript, no dependencies.
 *
 * Supports:
 *   - Full fretboard view (12+ frets)
 *   - CAGED shape overlay with colored dots
 *   - Root note highlighting
 *   - Interval labels
 *   - Scale note overlay
 */

(function () {
  'use strict';

  // --- Theme Colors ---
  var COLORS = {
    // CAGED shape colors
    C_SHAPE:  { fill: '#e63946', stroke: '#ff6b7a', label: 'C' },
    A_SHAPE:  { fill: '#2ec4b6', stroke: '#5eddd0', label: 'A' },
    G_SHAPE:  { fill: '#ff9f1c', stroke: '#ffb84d', label: 'G' },
    E_SHAPE:  { fill: '#7b2cbf', stroke: '#a05be0', label: 'E' },
    D_SHAPE:  { fill: '#457b9d', stroke: '#6a9fc4', label: 'D' },
    // Root note
    ROOT:     { fill: '#ffffff', stroke: '#e63946' },
    // Neutral
    DOT:      { fill: '#3a3a3a', stroke: '#666666' },
    TEXT:     '#f0e6d0',
    TEXT_DIM: '#888888',
    GRID:     '#555555',
    FRET_LABEL: '#666666',
    NUT:      '#888888',
    OPEN:     '#40c057',
    MUTED:    '#999999'
  };

  // --- Standard tuning notes (6th string to 1st) ---
  var STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

  // --- Note pool (all 12 notes) ---
  var ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // --- CAGED shape definitions (fret offsets from root) ---
  // Each shape defines which strings and frets to highlight
  // format: [string (0=lowE, 5=highE), fret_offset, role]
  var CAGED_SHAPES = {
    C: {
      name: 'C 型',
      rootStrings: [1, 4],  // A string, D string
      shape: [
        [2, 0, 'root'], [3, 1, '3rd'], [4, 0, '5th'],
        [5, 3, 'root'],
        [1, 3, 'root'], [0, 3, '5th']
      ],
      description: '以 C 和弦开放手型为基础，根音在 A 弦和 D 弦'
    },
    A: {
      name: 'A 型',
      rootStrings: [0, 3],  // lowE, D
      shape: [
        [0, 0, 'root'], [1, 2, '5th'], [2, 2, 'root'],
        [3, 2, '3rd'], [4, 0, '5th'],
        [5, 5, 'root']
      ],
      description: '以 A 和弦开放手型为基础，根音在低 E 弦和 D 弦'
    },
    G: {
      name: 'G 型',
      rootStrings: [0, 2, 5],  // lowE, A, highE
      shape: [
        [0, 3, 'root'], [1, 2, '3rd'], [2, 0, 'root'],
        [3, 0, '5th'], [4, 0, '3rd'], [5, 3, 'root']
      ],
      description: '以 G 和弦开放手型为基础，根音在低 E 弦、A 弦、高 E 弦'
    },
    E: {
      name: 'E 型',
      rootStrings: [0, 5],  // lowE, highE
      shape: [
        [0, 0, 'root'], [1, 2, '5th'], [2, 2, 'root'],
        [3, 1, '3rd'], [4, 0, '5th'], [5, 0, 'root']
      ],
      description: '以 E 和弦开放手型为基础，根音在低 E 弦和高 E 弦，最常用的封闭和弦手型'
    },
    D: {
      name: 'D 型',
      rootStrings: [1, 4],  // A, highE
      shape: [
        [1, 0, 'root'], [2, 2, '3rd'], [3, 3, '5th'],
        [4, 2, 'root'], [5, 5, '3rd']
      ],
      description: '以 D 和弦开放手型为基础，根音在 A 弦和高 E 弦'
    }
  };

  /**
   * Get note at (string, fret) position
   * @param {number} stringIndex - 0=low E, 5=high E
   * @param {number} fret - fret number (0=open)
   * @returns {string} note name
   */
  function getNoteAt(stringIndex, fret) {
    var open = STANDARD_TUNING[stringIndex];
    var idx = ALL_NOTES.indexOf(open);
    if (idx === -1) return '?';
    return ALL_NOTES[(idx + fret) % 12];
  }

  /**
   * Draw full fretboard SVG
   * @param {string|HTMLElement} container - Container element or ID
   * @param {Object} options
   *   - numFrets: number of frets to show (default 12)
   *   - startFret: first fret number (default 1, use 0 for open position)
   *   - cagedShape: one of 'C', 'A', 'G', 'E', 'D' or null
   *   - rootNote: root note for CAGED shape (e.g., 'C', 'G')
   *   - notes: array of {string, fret, label?, color?} for custom markers
   *   - highlightRoots: boolean, highlight root note positions
   *   - width: SVG width
   *   - height: SVG height
   *   - showLabels: show note labels on dots
   */
  window.renderFretboard = function (container, options) {
    var el = (typeof container === 'string')
      ? document.getElementById(container)
      : container;
    if (!el) { console.error('Fretboard renderer: container not found'); return; }

    el.innerHTML = '';

    // --- Defaults ---
    var opts = options || {};
    var numFrets = opts.numFrets || 12;
    var startFret = opts.startFret || 1;
    var cagedShape = opts.cagedShape || null;
    var rootNote = opts.rootNote || null;
    var highlightRoots = opts.highlightRoots !== undefined ? opts.highlightRoots : true;
    var showLabels = opts.showLabels !== undefined ? opts.showLabels : true;
    var width = opts.width || 680;
    var height = opts.height || 240;
    var customNotes = opts.notes || [];

    // --- Layout calculations ---
    var LEFT_MARGIN = 32;
    var RIGHT_MARGIN = 16;
    var TOP_MARGIN = 32;
    var BOTTOM_MARGIN = 20;

    var fretboardWidth = width - LEFT_MARGIN - RIGHT_MARGIN;
    var fretSpacing = fretboardWidth / numFrets;
    var stringSpacing = (height - TOP_MARGIN - BOTTOM_MARGIN) / 5;
    var GRID_TOP = TOP_MARGIN;
    var GRID_BOTTOM = height - BOTTOM_MARGIN;

    var svg = createSVG(width, height);

    // --- Background ---
    var bg = createSVGElement('rect');
    bg.setAttribute('x', '0');
    bg.setAttribute('y', '0');
    bg.setAttribute('width', width);
    bg.setAttribute('height', height);
    bg.setAttribute('fill', 'transparent');
    bg.setAttribute('rx', '4');
    svg.appendChild(bg);

    // --- Fret lines ---
    for (var f = 0; f <= numFrets; f++) {
      var x = LEFT_MARGIN + f * fretSpacing;
      var line = createSVGElement('line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', GRID_TOP);
      line.setAttribute('x2', x);
      line.setAttribute('y2', GRID_BOTTOM);
      if (f === 0 && startFret === 1) {
        // Nut - thick line
        line.setAttribute('stroke', COLORS.NUT);
        line.setAttribute('stroke-width', 4);
      } else {
        line.setAttribute('stroke', COLORS.GRID);
        line.setAttribute('stroke-width', 1);
      }
      svg.appendChild(line);
    }

    // --- Fret number labels ---
    for (var f2 = 0; f2 < numFrets; f2++) {
      var labelX = LEFT_MARGIN + (f2 + 0.5) * fretSpacing;
      var fretNum = startFret + f2;
      drawSVGText(svg, labelX, 14, String(fretNum), {
        'fill': COLORS.FRET_LABEL,
        'font-size': '11px',
        'font-family': 'system-ui, sans-serif',
        'text-anchor': 'middle',
        'font-weight': '600'
      });
    }

    // --- String lines ---
    for (var s = 0; s < 6; s++) {
      var y = GRID_TOP + s * stringSpacing;
      var line = createSVGElement('line');
      line.setAttribute('x1', LEFT_MARGIN);
      line.setAttribute('y1', y);
      line.setAttribute('x2', LEFT_MARGIN + numFrets * fretSpacing);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', COLORS.GRID);
      line.setAttribute('stroke-width', 1.5 - s * 0.15); // thinner for higher strings
      svg.appendChild(line);
    }

    // --- String labels (tuning) ---
    for (var s2 = 0; s2 < 6; s2++) {
      var labelY = GRID_TOP + s2 * stringSpacing;
      drawSVGText(svg, 14, labelY + 1, STANDARD_TUNING[s2], {
        'fill': COLORS.FRET_LABEL,
        'font-size': '9px',
        'font-family': 'system-ui, sans-serif',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'font-weight': '600'
      });
    }

    // --- Draw fret markers (dots on 3rd, 5th, 7th, 9th, 12th frets) ---
    // Calculate which frets are visible based on start
    for (var f3 = 0; f3 < numFrets; f3++) {
      var absoluteFret = startFret + f3;
      var markerX = LEFT_MARGIN + (f3 + 0.5) * fretSpacing;
      if (absoluteFret % 12 === 0) {
        // Double dots at 12th fret
        var dotY1 = GRID_TOP + 1.5 * stringSpacing;
        var dotY2 = GRID_TOP + 3.5 * stringSpacing;
        drawDot(svg, markerX, dotY1, 3, COLORS.FRET_LABEL, 0, 0);
        drawDot(svg, markerX, dotY2, 3, COLORS.FRET_LABEL, 0, 0);
      } else if ([3, 5, 7, 9, 15].indexOf(absoluteFret) !== -1) {
        var dotY = GRID_TOP + 2.5 * stringSpacing;
        drawDot(svg, markerX, dotY, 3, COLORS.FRET_LABEL, 0, 0);
      }
    }

    // --- Helper: get note name at position ---
    function getNote(s, fret) {
      var open = STANDARD_TUNING[s];
      var idx = ALL_NOTES.indexOf(open);
      return ALL_NOTES[(idx + fret) % 12];
    }

    // --- Draw CAGED shape if specified ---
    if (cagedShape && CAGED_SHAPES[cagedShape] && rootNote) {
      var shapeDef = CAGED_SHAPES[cagedShape];
      var color = COLORS[cagedShape + '_SHAPE'];

      // Calculate root fret offset
      // For each root string, find the fret where note == rootNote
      var rootFrets = {};
      shapeDef.rootStrings.forEach(function(str) {
        var open = STANDARD_TUNING[str];
        var noteIdx = ALL_NOTES.indexOf(open);
        if (noteIdx >= 0) {
          var rootIdx = ALL_NOTES.indexOf(rootNote);
          var fret = (rootIdx - noteIdx + 12) % 12;
          rootFrets[str] = fret;
        }
      });

      // Get the most common root fret
      var fretValues = Object.values(rootFrets);
      var rootFret = fretValues[0] || 0;

      // Adjust for startFret — only show if within range
      if (rootFret >= startFret && rootFret < startFret + numFrets) {
        var baseFret = rootFret;

        // Draw shape dots
        shapeDef.shape.forEach(function(point) {
          var str = point[0];
          var offset = point[1];
          var role = point[2];
          var fret = baseFret + offset;

          if (fret >= startFret && fret < startFret + numFrets) {
            var dotX = LEFT_MARGIN + (fret - startFret + 0.5) * fretSpacing;
            var dotY = GRID_TOP + str * stringSpacing;
            var isRoot = (role === 'root');
            var dotColor = isRoot ? COLORS.ROOT : color;
            var dotR = isRoot ? 9 : 7;

            // Glow for roots
            if (isRoot) {
              var glow = createSVGElement('circle');
              glow.setAttribute('cx', dotX);
              glow.setAttribute('cy', dotY);
              glow.setAttribute('r', 12);
              glow.setAttribute('fill', 'none');
              glow.setAttribute('stroke', COLORS.ROOT.stroke);
              glow.setAttribute('stroke-width', 2);
              glow.setAttribute('opacity', '0.4');
              svg.appendChild(glow);
            }

            drawDot(svg, dotX, dotY, dotR, dotColor.fill, dotColor.stroke, isRoot ? 2.5 : 1.5);

            // Role label inside dot
            var label = '';
            if (role === 'root') label = 'R';
            else if (role === '3rd') label = '3';
            else if (role === '5th') label = '5';
            else if (role === '7th') label = '7';

            if (showLabels && label) {
              drawSVGText(svg, dotX, dotY + 1, label, {
                'fill': isRoot ? '#1a1a1a' : '#fff',
                'font-size': isRoot ? '10px' : '8px',
                'font-family': 'system-ui, sans-serif',
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
                'font-weight': 'bold'
              });
            }
          }
        });

        // Draw shape label
        drawSVGText(svg, LEFT_MARGIN + numFrets * fretSpacing - 4, GRID_TOP - 4, cagedShape + ' Shape (' + rootNote + ')', {
          'fill': color.fill,
          'font-size': '12px',
          'font-family': 'system-ui, sans-serif',
          'text-anchor': 'end',
          'font-weight': 'bold'
        });
      } else {
        // Shape is outside visible range — show a hint
        drawSVGText(svg, LEFT_MARGIN + fretboardWidth / 2, GRID_TOP + 2.5 * stringSpacing, '该手型在指板外（根音在 ' + rootFret + ' 品）', {
          'fill': COLORS.TEXT_DIM,
          'font-size': '13px',
          'font-family': 'system-ui, sans-serif',
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-style': 'italic'
        });
      }
    }

    // --- Draw custom notes ---
    customNotes.forEach(function(note) {
      var str = note.string;
      var fret = note.fret;
      if (fret < startFret || fret >= startFret + numFrets) return;

      var dotX = LEFT_MARGIN + (fret - startFret + 0.5) * fretSpacing;
      var dotY = GRID_TOP + str * stringSpacing;
      var fill = note.color || COLORS.DOT.fill;
      var stroke = note.stroke || COLORS.DOT.stroke;

      drawDot(svg, dotX, dotY, note.r || 7, fill, stroke, 1.5);

      if (showLabels && note.label) {
        drawSVGText(svg, dotX, dotY + 1, note.label, {
          'fill': '#fff',
          'font-size': '8px',
          'font-family': 'system-ui, sans-serif',
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-weight': 'bold'
        });
      }
    });

    el.appendChild(svg);
  };

  // --- CAGED shape data (exported for page scripts) ---
  window.CAGED_SHAPES = CAGED_SHAPES;
  window.CAGED_COLORS = COLORS;

  // --- Helper functions ---
  function createSVG(w, h) {
    var svg = createSVGElement('svg');
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.style.display = 'block';
    svg.style.maxWidth = '100%';
    return svg;
  }

  function createSVGElement(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  function drawSVGText(svg, x, y, content, attrs) {
    var text = createSVGElement('text');
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

  function drawDot(svg, cx, cy, r, fill, stroke, strokeWidth) {
    var dot = createSVGElement('circle');
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
    dot.setAttribute('r', r);
    dot.setAttribute('fill', fill);
    if (stroke) {
      dot.setAttribute('stroke', stroke);
      dot.setAttribute('stroke-width', strokeWidth || 1.5);
    }
    svg.appendChild(dot);
  }

  // --- Utility: render multiple CAGED shapes across the fretboard ---
  /**
   * Render all CAGED positions for a given root note
   * @param {string} containerId
   * @param {string} rootNote - e.g., 'C', 'G', 'A'
   * @param {number} fretRangeStart - start fret for each view
   */
  window.renderAllCAGEDPositions = function(containerId, rootNote, numFrets) {
    var container = document.getElementById(containerId);
    if (!container) return;

    numFrets = numFrets || 8;
    var shapes = ['C', 'A', 'G', 'E', 'D'];
    var caged = window.CAGED_SHAPES;
    var colorMap = window.CAGED_COLORS;

    // Determine where each shape sits for this root
    // Based on root fret on specific strings
    var positions = [];
    shapes.forEach(function(shape) {
      var def = caged[shape];
      var rootStr = def.rootStrings[0];
      var open = STANDARD_TUNING[rootStr];
      var rootIdx = ALL_NOTES.indexOf(rootNote);
      var openIdx = ALL_NOTES.indexOf(open);
      var rootFret = (rootIdx - openIdx + 12) % 12;

      // If rootFret is 0, it means open position — show from fret 1
      var start = rootFret === 0 ? 1 : rootFret;
      positions.push({ shape: shape, startFret: start, rootFret: rootFret });
    });

    // Create a row for each shape
    positions.forEach(function(pos) {
      var row = document.createElement('div');
      row.className = 'caged-row';

      // Label
      var label = document.createElement('div');
      label.className = 'caged-row-label';
      var colorKey = pos.shape + '_SHAPE';
      var shapeColor = colorMap[colorKey];
      label.innerHTML = '<span class="shape-badge" style="background:' + shapeColor.fill + '">' + pos.shape + '</span> ' +
        caged[pos.shape].name;
      row.appendChild(label);

      // Fretboard
      var fbContainer = document.createElement('div');
      fbContainer.className = 'caged-fretboard';
      fbContainer.id = 'fb-' + pos.shape + '-' + rootNote;
      row.appendChild(fbContainer);
      container.appendChild(row);

      // Render
      window.renderFretboard(fbContainer, {
        numFrets: numFrets,
        startFret: pos.startFret,
        cagedShape: pos.shape,
        rootNote: rootNote,
        width: 680,
        height: 200,
        showLabels: true
      });
    });
  };

})();
