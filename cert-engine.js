/**
 * cert-engine.js — High-Precision Certificate Engine
 * VELOWINGS LEARNING TECHNOLOGIES
 * Tagline: Learn. Build. Grow.
 * Statement: EMPOWERING STUDENTS FOR A SMARTER TOMORROW
 *
 * Renders high-fidelity, print-ready certificates at A4 landscape 300 DPI (3508 × 2480 px).
 * Features auto-scaling typography, elegant white & navy blue styling, and instant PNG/PDF generation.
 */
(function (window) {
  'use strict';

  /* ── CANVAS RESOLUTION (A4 Landscape at 300 DPI) ── */
  const FULL_W = 3508;
  const FULL_H = 2480;

  /* ── PRELOADED LOGO ASSETS ── */
  var _veloLogoImage = null;
  var _veloIconImage = null;
  if (typeof Image !== 'undefined') {
    _veloLogoImage = new Image();
    _veloLogoImage.src = 'logo.png';
    _veloIconImage = new Image();
    _veloIconImage.src = 'logo-icon.png';
  }

  /* ── EVENT METADATA ── */
  const EVENT_NAME = 'VELOWINGS LEARNING TECHNOLOGIES';
  const EVENT_TAGLINE = 'Learn. Build. Grow.';
  const EVENT_STATEMENT = 'EMPOWERING STUDENTS FOR A SMARTER TOMORROW';
  const EVENT_ORGANIZER = 'VELOWINGS LEARNING TECHNOLOGIES';

  /* ── PER-TEMPLATE CONFIGURATION ── */
  var CONFIGS = {
    participation: {
      nameX        : 1754,          // 50.0% of 3508 px (horizontal center)
      nameY        : 1195,          // 48.2% of 2480 px (touches the gold line directly)
      color        : '#000000',     // Pure Black (maximum visibility)
      titleColor   : '#0B2D5C',     // Deep Navy Blue
      accentColor  : '#1684D8',     // Bright Blue
      font         : 'Cinzel',
      fallbackFont : 'Playfair Display',
      weight       : '800',
      baseline     : 'middle',
      startSize    : 115,
      minSize      : 48,
      maxWidth     : 2400,
      letterSpacing: 5
    },
    winner1: {
      nameY        : 1420,
      color        : '#0B2D5C',
      titleColor   : '#0B2D5C',
      accentColor  : '#1684D8',
      font         : 'Poppins',
      fallbackFont : 'Inter',
      weight       : '700',
      baseline     : 'alphabetic',
      startSize    : 106,
      minSize      : 46,
      maxWidth     : 2400,
      letterSpacing: 2
    },
    winner2: {
      nameY        : 1420,
      color        : '#0B2D5C',
      titleColor   : '#0B2D5C',
      accentColor  : '#1684D8',
      font         : 'Poppins',
      fallbackFont : 'Inter',
      weight       : '700',
      baseline     : 'alphabetic',
      startSize    : 106,
      minSize      : 46,
      maxWidth     : 2400,
      letterSpacing: 2
    },
    winner3: {
      nameY        : 1420,
      color        : '#0B2D5C',
      titleColor   : '#0B2D5C',
      accentColor  : '#1684D8',
      font         : 'Poppins',
      fallbackFont : 'Inter',
      weight       : '700',
      baseline     : 'alphabetic',
      startSize    : 106,
      minSize      : 46,
      maxWidth     : 2400,
      letterSpacing: 2
    },
    judges: {
      nameY        : 1420,
      color        : '#0B2D5C',
      titleColor   : '#0B2D5C',
      accentColor  : '#1684D8',
      font         : 'Poppins',
      fallbackFont : 'Inter',
      weight       : '700',
      baseline     : 'alphabetic',
      startSize    : 106,
      minSize      : 46,
      maxWidth     : 2400,
      letterSpacing: 2
    }
  };

  /* ── IMAGE LOADER ── */
  function loadImg(src) {
    return new Promise(function (resolve) {
      if (!src) return resolve(null);
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  /* ── FONT LOADING HELPER ── */
  var _fontsPromise = null;
  function ensureFonts() {
    if (_fontsPromise) return _fontsPromise;
    _fontsPromise = (async function () {
      if (document.fonts && document.fonts.load) {
        try {
          await Promise.all([
            document.fonts.load('700 60px "Cinzel"'),
            document.fonts.load('700 60px "Playfair Display"'),
            document.fonts.load('700 60px "Times New Roman"'),
            document.fonts.load('700 60px "Poppins"'),
            document.fonts.load('600 60px "Poppins"'),
            document.fonts.load('600 60px "Inter"'),
            document.fonts.load('400 40px "Inter"')
          ]);
        } catch (e) {}
      }
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (e) {}
      }
    })().catch(function () {
      _fontsPromise = null;
    });
    return _fontsPromise;
  }

  /* ── AUTO-SCALING TYPOGRAPHY ── */
  function autoFontSize(ctx, text, maxW, startSz, minSz, weight, family) {
    var sz = startSz;
    ctx.font = weight + ' ' + sz + 'px "' + family + '", "Playfair Display", "Times New Roman", "Georgia", serif';
    while (ctx.measureText(text).width > maxW && sz > minSz) {
      sz -= 2;
      ctx.font = weight + ' ' + sz + 'px "' + family + '", "Playfair Display", "Times New Roman", "Georgia", serif';
    }
    return sz;
  }

  /* ── LETTER-SPACED TEXT RENDERER ── */
  function fillTextSpaced(ctx, text, x, y, spacing) {
    if (!spacing) { ctx.fillText(text, x, y); return; }
    var totalW = 0;
    var chars = text.split('');
    chars.forEach(function (ch) { totalW += ctx.measureText(ch).width + spacing; });
    totalW -= spacing;
    var curX = x - totalW / 2;
    chars.forEach(function (ch) {
      ctx.fillText(ch, curX + ctx.measureText(ch).width / 2, y);
      
      curX += ctx.measureText(ch).width + spacing;
    });
  }

  /* ── INDEXEDDB TEMPLATE GETTER ── */
  function getTplFromIndexedDB(key) {
    return new Promise(function (resolve) {
      if (typeof indexedDB === 'undefined') return resolve(null);
      try {
        var req = indexedDB.open('NextGenTemplatesDB', 1);
        req.onsuccess = function () {
          var d = req.result;
          if (!d.objectStoreNames.contains('templates')) return resolve(null);
          try {
            var tx = d.transaction('templates', 'readonly');
            var getReq = tx.objectStore('templates').get(key);
            getReq.onsuccess = function () { resolve(getReq.result || null); };
            getReq.onerror = function () { resolve(null); };
          } catch (e) { resolve(null); }
        };
        req.onerror = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
  }

  /* ── CORE RENDER ENGINE ── */
  async function render(canvasEl, templateUrl, name, templateKey, scale) {
    var key = templateKey || 'participation';
    var cfg = CONFIGS[key] || CONFIGS.participation;
    var sc = scale || 1;
    var W = Math.round(FULL_W * sc);
    var H = Math.round(FULL_H * sc);

    canvasEl.width = W;
    canvasEl.height = H;

    var ctx = canvasEl.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, W, H);

    // Resolve template URL: passed param -> IndexedDB (Admin Saved) -> LocalStorage -> Project Template Asset
    var effectiveTpl = templateUrl || '';
    if (!effectiveTpl) {
      try {
        effectiveTpl = await getTplFromIndexedDB(key) || '';
      } catch (e) {}
    }
    if (!effectiveTpl) {
      try {
        effectiveTpl = localStorage.getItem('tpl_' + key) || '';
      } catch (e) {}
    }
    // Default fallback to permanent official Velowings template if not explicitly cleared
    var isCleared = false;
    try {
      isCleared = (localStorage.getItem('tpl_cleared_' + key) === 'true');
    } catch (e) {}

    if (!effectiveTpl && !isCleared && (key === 'participation' || !templateKey)) {
      effectiveTpl = 'https://res.cloudinary.com/utmjfg3s/image/upload/v1791914460/xdwc0inggaepgkctcrrg.jpg';
    }

    var img = null;
    if (effectiveTpl) {
      img = await loadImg(effectiveTpl);
    }
    // High-reliability fallback to local file if network fails
    if (!img && effectiveTpl !== 'template-participation.jpg' && (key === 'participation' || !templateKey)) {
      img = await loadImg('template-participation.jpg');
    }

    if (img) {
      // High-resolution template background render
      ctx.drawImage(img, 0, 0, W, H);
    } else {
      // Procedural fallback certificate render
      _drawVelowingsCertificate(ctx, W, H, sc, key, name);
    }

    await ensureFonts();

    // Check for saved custom name position (both X and Y axis)
    try {
      // 1. Y-Axis
      var savedPxY = parseInt(localStorage.getItem('tpl_nameY_px_' + key), 10);
      var savedPctY = parseFloat(localStorage.getItem('tpl_nameY_' + key));
      if (savedPxY === 1337 || savedPxY === 1175 || savedPxY === 1130 || savedPxY === 1080 || savedPxY === 1150 || savedPxY === 1100) {
        savedPxY = 1195;
        savedPctY = 48.2;
        localStorage.setItem('tpl_nameY_' + key, '48.2');
        localStorage.setItem('tpl_nameY_px_' + key, '1195');
      }
      if (!isNaN(savedPxY) && savedPxY > 0) {
        cfg.nameY = savedPxY;
      } else if (!isNaN(savedPctY) && savedPctY > 0) {
        cfg.nameY = Math.round(FULL_H * (savedPctY / 100));
      } else {
        cfg.nameY = 1195;
      }

      // 2. X-Axis
      var savedPxX = parseInt(localStorage.getItem('tpl_nameX_px_' + key), 10);
      var savedPctX = parseFloat(localStorage.getItem('tpl_nameX_' + key));
      if (!isNaN(savedPxX) && savedPxX > 0) {
        cfg.nameX = savedPxX;
      } else if (!isNaN(savedPctX) && savedPctX > 0) {
        cfg.nameX = Math.round(FULL_W * (savedPctX / 100));
      } else if (cfg.nameX === undefined) {
        cfg.nameX = Math.round(FULL_W / 2);
      }
    } catch (e) {}

    /* Draw Recipient Name with dynamic scaling */
    var upperName = (name || 'LEARNER NAME').trim().toUpperCase();
    var maxW = Math.round(cfg.maxWidth * sc);
    var startSz = Math.round(cfg.startSize * sc);
    var minSz = Math.round(cfg.minSize * sc);

    var chosenFont = cfg.font || 'Cinzel';
    var fontSize = autoFontSize(ctx, upperName, maxW, startSz, minSz, cfg.weight, chosenFont);

    ctx.font = cfg.weight + ' ' + fontSize + 'px "' + chosenFont + '", "Playfair Display", "Times New Roman", "Georgia", serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = cfg.baseline || 'middle';

    // Add subtle text shadow for extra prominence
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 4 * sc;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2 * sc;

    var nameX = (cfg.nameX !== undefined && !isNaN(cfg.nameX)) ? Math.round(cfg.nameX * sc) : Math.round(W / 2);
    var nameY = Math.round(cfg.nameY * sc);

    if (cfg.letterSpacing) {
      fillTextSpaced(ctx, upperName, nameX, nameY, Math.round(cfg.letterSpacing * sc));
    } else {
      ctx.fillText(upperName, nameX, nameY);
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    return Math.round(fontSize / sc);
  }

  /* ── DRAW OFFICIAL VELOWINGS WHITE & BLUE CERTIFICATE ── */
  function _drawVelowingsCertificate(ctx, W, H, sc, templateKey, name) {
    // 1. Dominant Crisp White Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // 2. Subtle luxury pale blue background accent tint
    var bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#FFFFFF');
    bgGrad.addColorStop(0.5, '#F5FAFF');
    bgGrad.addColorStop(1, '#EDF7FF');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 3. Elegant Outer & Inner Navy/Blue Borders
    // Outer Border
    ctx.strokeStyle = '#0B2D5C';
    ctx.lineWidth = 14 * sc;
    ctx.strokeRect(60 * sc, 60 * sc, W - 120 * sc, H - 120 * sc);

    // Secondary Accent Border (Light Blue & Bright Blue)
    ctx.strokeStyle = '#D9EEFF';
    ctx.lineWidth = 4 * sc;
    ctx.strokeRect(88 * sc, 88 * sc, W - 176 * sc, H - 176 * sc);

    ctx.strokeStyle = '#1684D8';
    ctx.lineWidth = 2 * sc;
    ctx.strokeRect(102 * sc, 102 * sc, W - 204 * sc, H - 204 * sc);

    // 4. Modern Geometric Blue Corner Geometry (inspired by reference certificate)
    _drawCornerAccents(ctx, W, H, sc);

    // 5. Digital Circuit / Modern Tech Accent Line Traces
    _drawTechCircuitry(ctx, W, H, sc);

    // 6. Header Brand & Crest Emblem
    _drawHeaderBrand(ctx, W, H, sc);

    // 7. Certificate Title & Presentation Wording
    _drawCertificateTitles(ctx, W, H, sc, templateKey);

    // 8. Description & Official Learning Areas Box
    _drawCertificateContent(ctx, W, H, sc, templateKey);

    // 9. Signatures & Verification Bar
    _drawFooterAndSignatures(ctx, W, H, sc);
  }

  /* Corner Accents */
  function _drawCornerAccents(ctx, W, H, sc) {
    // Top-Left Geometric Triangles
    ctx.fillStyle = '#0B2D5C';
    ctx.beginPath();
    ctx.moveTo(60 * sc, 60 * sc);
    ctx.lineTo(260 * sc, 60 * sc);
    ctx.lineTo(60 * sc, 260 * sc);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1684D8';
    ctx.beginPath();
    ctx.moveTo(75 * sc, 75 * sc);
    ctx.lineTo(220 * sc, 75 * sc);
    ctx.lineTo(75 * sc, 220 * sc);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#D9EEFF';
    ctx.beginPath();
    ctx.moveTo(90 * sc, 90 * sc);
    ctx.lineTo(170 * sc, 90 * sc);
    ctx.lineTo(90 * sc, 170 * sc);
    ctx.closePath();
    ctx.fill();

    // Bottom-Right Geometric Triangles
    ctx.fillStyle = '#0B2D5C';
    ctx.beginPath();
    ctx.moveTo(W - 60 * sc, H - 60 * sc);
    ctx.lineTo(W - 260 * sc, H - 60 * sc);
    ctx.lineTo(W - 60 * sc, H - 260 * sc);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1684D8';
    ctx.beginPath();
    ctx.moveTo(W - 75 * sc, H - 75 * sc);
    ctx.lineTo(W - 220 * sc, H - 75 * sc);
    ctx.lineTo(W - 75 * sc, H - 220 * sc);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#D9EEFF';
    ctx.beginPath();
    ctx.moveTo(W - 90 * sc, H - 90 * sc);
    ctx.lineTo(W - 170 * sc, H - 90 * sc);
    ctx.lineTo(W - 90 * sc, H - 170 * sc);
    ctx.closePath();
    ctx.fill();

    // Top-Right & Bottom-Left Decorative Accent Notches
    ctx.strokeStyle = '#1684D8';
    ctx.lineWidth = 4 * sc;

    // Top Right
    ctx.beginPath();
    ctx.moveTo(W - 160 * sc, 88 * sc);
    ctx.lineTo(W - 88 * sc, 88 * sc);
    ctx.lineTo(W - 88 * sc, 160 * sc);
    ctx.stroke();

    // Bottom Left
    ctx.beginPath();
    ctx.moveTo(160 * sc, H - 88 * sc);
    ctx.lineTo(88 * sc, H - 88 * sc);
    ctx.lineTo(88 * sc, H - 160 * sc);
    ctx.stroke();
  }

  /* Circuit Line Traces */
  function _drawTechCircuitry(ctx, W, H, sc) {
    ctx.strokeStyle = '#D6E5F3';
    ctx.lineWidth = 2.5 * sc;

    // Left side traces
    ctx.beginPath();
    ctx.moveTo(130 * sc, 500 * sc);
    ctx.lineTo(180 * sc, 550 * sc);
    ctx.lineTo(180 * sc, 900 * sc);
    ctx.lineTo(140 * sc, 940 * sc);
    ctx.stroke();

    ctx.fillStyle = '#1684D8';
    ctx.beginPath(); ctx.arc(130 * sc, 500 * sc, 5 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(140 * sc, 940 * sc, 5 * sc, 0, Math.PI * 2); ctx.fill();

    // Right side traces
    ctx.strokeStyle = '#D6E5F3';
    ctx.beginPath();
    ctx.moveTo(W - 130 * sc, 600 * sc);
    ctx.lineTo(W - 180 * sc, 650 * sc);
    ctx.lineTo(W - 180 * sc, 1100 * sc);
    ctx.lineTo(W - 140 * sc, 1140 * sc);
    ctx.stroke();

    ctx.fillStyle = '#1684D8';
    ctx.beginPath(); ctx.arc(W - 130 * sc, 600 * sc, 5 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W - 140 * sc, 1140 * sc, 5 * sc, 0, Math.PI * 2); ctx.fill();
  }

  /* Header Brand */
  function _drawHeaderBrand(ctx, W, H, sc) {
    var brandY = 280 * sc;

    // Center VeloWings Emblem
    _drawVelowingsCrest(ctx, W / 2, brandY - 60 * sc, 50 * sc);

    // Organization Name: VELOWINGS LEARNING TECHNOLOGIES
    ctx.fillStyle = '#0B2D5C';
    ctx.font = '800 ' + Math.round(44 * sc) + 'px "Poppins", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    fillTextSpaced(ctx, 'VELOWINGS LEARNING TECHNOLOGIES', W / 2, brandY + 45 * sc, 3 * sc);

    // Official Tagline: Learn. Build. Grow.
    ctx.fillStyle = '#1684D8';
    ctx.font = '700 ' + Math.round(24 * sc) + 'px "Poppins", "Segoe UI", sans-serif';
    fillTextSpaced(ctx, 'Learn. Build. Grow.', W / 2, brandY + 95 * sc, 4 * sc);

    // Divider Line with central diamond
    ctx.strokeStyle = '#D6E5F3';
    ctx.lineWidth = 2 * sc;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 400 * sc, brandY + 125 * sc);
    ctx.lineTo(W / 2 - 40 * sc, brandY + 125 * sc);
    ctx.moveTo(W / 2 + 40 * sc, brandY + 125 * sc);
    ctx.lineTo(W / 2 + 400 * sc, brandY + 125 * sc);
    ctx.stroke();

    // Central diamond
    ctx.fillStyle = '#1684D8';
    ctx.beginPath();
    ctx.moveTo(W / 2, brandY + 115 * sc);
    ctx.lineTo(W / 2 + 10 * sc, brandY + 125 * sc);
    ctx.lineTo(W / 2, brandY + 135 * sc);
    ctx.lineTo(W / 2 - 10 * sc, brandY + 125 * sc);
    ctx.closePath();
    ctx.fill();
  }

  /* VeloWings Crest Drawing */
  function _drawVelowingsCrest(ctx, cx, cy, sz) {
    if (_veloIconImage && _veloIconImage.complete && _veloIconImage.naturalWidth > 0) {
      ctx.save();
      var w = sz * 2.8;
      var h = sz * 2.8;
      ctx.drawImage(_veloIconImage, cx - w / 2, cy - h / 2, w, h);
      ctx.restore();
      return;
    }
    ctx.save();
    // Wing left
    ctx.fillStyle = '#1684D8';
    ctx.beginPath();
    ctx.moveTo(cx - 5 * sz, cy - 2 * sz);
    ctx.lineTo(cx - 1 * sz, cy + 4 * sz);
    ctx.lineTo(cx - 2 * sz, cy + 4 * sz);
    ctx.lineTo(cx - 7 * sz, cy);
    ctx.closePath();
    ctx.fill();

    // Wing right
    ctx.fillStyle = '#0B2D5C';
    ctx.beginPath();
    ctx.moveTo(cx + 5 * sz, cy - 2 * sz);
    ctx.lineTo(cx + 1 * sz, cy + 4 * sz);
    ctx.lineTo(cx + 2 * sz, cy + 4 * sz);
    ctx.lineTo(cx + 7 * sz, cy);
    ctx.closePath();
    ctx.fill();

    // Core central V
    ctx.fillStyle = '#55B8F0';
    ctx.beginPath();
    ctx.moveTo(cx - 2 * sz, cy + 1 * sz);
    ctx.lineTo(cx, cy + 5 * sz);
    ctx.lineTo(cx + 2 * sz, cy + 1 * sz);
    ctx.closePath();
    ctx.fill();

    // Center crest circle
    ctx.fillStyle = '#1684D8';
    ctx.beginPath();
    ctx.arc(cx, cy - 1 * sz, 1.2 * sz, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy - 1 * sz, 0.6 * sz, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* Certificate Titles */
  function _drawCertificateTitles(ctx, W, H, sc, templateKey) {
    var titleY = 620 * sc;

    var mainTitle = 'CERTIFICATE';
    var subTitle = 'OF PARTICIPATION';
    if (templateKey && templateKey.startsWith('winner')) {
      subTitle = 'OF EXCELLENCE & MERIT';
    } else if (templateKey === 'judges') {
      subTitle = 'OF APPRECIATION';
    }

    // Main "CERTIFICATE"
    ctx.fillStyle = '#0B2D5C';
    ctx.font = '800 ' + Math.round(92 * sc) + 'px "Poppins", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    fillTextSpaced(ctx, mainTitle, W / 2, titleY, 8 * sc);

    // "OF PARTICIPATION" / "OF EXCELLENCE"
    ctx.fillStyle = '#1684D8';
    ctx.font = '700 ' + Math.round(44 * sc) + 'px "Poppins", "Segoe UI", sans-serif';
    fillTextSpaced(ctx, subTitle, W / 2, titleY + 75 * sc, 5 * sc);

    // Secondary Brand Statement: "EMPOWERING STUDENTS FOR A SMARTER TOMORROW"
    ctx.fillStyle = '#526780';
    ctx.font = '600 ' + Math.round(22 * sc) + 'px "Inter", "Segoe UI", sans-serif';
    fillTextSpaced(ctx, EVENT_STATEMENT, W / 2, titleY + 130 * sc, 3 * sc);

    // "This certificate is proudly presented to"
    ctx.fillStyle = '#142D4E';
    ctx.font = '500 ' + Math.round(28 * sc) + 'px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('This certificate is proudly presented to', W / 2, titleY + 220 * sc);

    // Elegant horizontal accent lines framing recipient area
    var lineY = titleY + 260 * sc;
    ctx.strokeStyle = '#D6E5F3';
    ctx.lineWidth = 2 * sc;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 500 * sc, lineY);
    ctx.lineTo(W / 2 + 500 * sc, lineY);
    ctx.stroke();

    // Underline below recipient name
    var underY = 1460 * sc;
    ctx.strokeStyle = '#1684D8';
    ctx.lineWidth = 3 * sc;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 450 * sc, underY);
    ctx.lineTo(W / 2 + 450 * sc, underY);
    ctx.stroke();
  }

  /* Certificate Content & 5 Learning Areas */
  function _drawCertificateContent(ctx, W, H, sc, templateKey) {
    var contentY = 1530 * sc;

    // Detailed citation
    ctx.fillStyle = '#142D4E';
    ctx.font = '400 ' + Math.round(26 * sc) + 'px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';

    var line1 = 'For successfully participating in the live educational webinar and digital technology sessions';
    var line2 = 'organized by VELOWINGS LEARNING TECHNOLOGIES, demonstrating dedication to learning,';
    var line3 = 'curiosity, and preparing for future technology-driven career opportunities.';

    if (templateKey && templateKey.startsWith('winner')) {
      line1 = 'For outstanding academic merit, active engagement, and exceptional achievement in';
      line2 = 'the technology learning sessions and project assessments conducted by';
      line3 = 'VELOWINGS LEARNING TECHNOLOGIES for empowering students for a smarter tomorrow.';
    } else if (templateKey === 'judges') {
      line1 = 'In grateful recognition of valuable mentorship, expert instruction, and leadership';
      line2 = 'contributed to empowering students and fostering technology excellence with';
      line3 = 'VELOWINGS LEARNING TECHNOLOGIES during the educational webinar series.';
    }

    ctx.fillText(line1, W / 2, contentY);
    ctx.fillText(line2, W / 2, contentY + 45 * sc);
    ctx.fillText(line3, W / 2, contentY + 90 * sc);

    // 5 Official Learning Areas Badge Pill (from certificate)
    var pillY = contentY + 160 * sc;
    var pillW = 1900 * sc;
    var pillH = 70 * sc;

    ctx.fillStyle = '#F5FAFF';
    ctx.strokeStyle = '#D6E5F3';
    ctx.lineWidth = 2 * sc;

    ctx.beginPath();
    ctx.roundRect(W / 2 - pillW / 2, pillY, pillW, pillH, 35 * sc);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0B2D5C';
    ctx.font = '700 ' + Math.round(20 * sc) + 'px "Poppins", "Segoe UI", sans-serif';
    ctx.fillText('CORE LEARNING AREAS:', W / 2 - pillW / 2 + 180 * sc, pillY + 44 * sc);

    ctx.fillStyle = '#1684D8';
    ctx.font = '600 ' + Math.round(19 * sc) + 'px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('AI Tools   •   Web Design   •   Non-Coding Careers   •   Digital Skills   •   Career Growth', W / 2 + 120 * sc, pillY + 44 * sc);

    // Dedicated Webinar Reference Block
    var webY = pillY + 110 * sc;
    ctx.fillStyle = '#526780';
    ctx.font = '500 ' + Math.round(20 * sc) + 'px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('Online Live Webinar  |  Date: October 15, 2026  |  Duration: 1 Hour  |  Mode: Online (Live Webinar)', W / 2, webY);
  }

  /* Signatures & Footer */
  function _drawFooterAndSignatures(ctx, W, H, sc) {
    var footerY = 2120 * sc;

    // Left Signature: Academic Lead
    ctx.strokeStyle = '#0B2D5C';
    ctx.lineWidth = 2.5 * sc;
    ctx.beginPath();
    ctx.moveTo(420 * sc, footerY);
    ctx.lineTo(880 * sc, footerY);
    ctx.stroke();

    // Stylized signature stroke
    ctx.strokeStyle = '#123F7A';
    ctx.lineWidth = 3.5 * sc;
    ctx.beginPath();
    ctx.moveTo(480 * sc, footerY - 25 * sc);
    ctx.bezierCurveTo(530 * sc, footerY - 80 * sc, 590 * sc, footerY - 10 * sc, 640 * sc, footerY - 60 * sc);
    ctx.bezierCurveTo(700 * sc, footerY - 15 * sc, 760 * sc, footerY - 85 * sc, 820 * sc, footerY - 35 * sc);
    ctx.stroke();

    ctx.fillStyle = '#0B2D5C';
    ctx.font = '700 ' + Math.round(22 * sc) + 'px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ACADEMIC DIRECTOR', 650 * sc, footerY + 36 * sc);

    ctx.fillStyle = '#526780';
    ctx.font = '500 ' + Math.round(18 * sc) + 'px "Inter", sans-serif';
    ctx.fillText('VELOWINGS LEARNING TECHNOLOGIES', 650 * sc, footerY + 68 * sc);

    // Center: Official Seal & Verification ID
    var certId = 'VLW-2026-OCT-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    _drawVelowingsSeal(ctx, W / 2, footerY - 40 * sc, 60 * sc);

    ctx.fillStyle = '#0B2D5C';
    ctx.font = '700 ' + Math.round(18 * sc) + 'px "Poppins", monospace';
    ctx.fillText('VERIFIED CREDENTIAL ID: ' + certId, W / 2, footerY + 50 * sc);

    ctx.fillStyle = '#1684D8';
    ctx.font = '600 ' + Math.round(16 * sc) + 'px "Inter", sans-serif';
    ctx.fillText('Official Educational Record · Issued: October 15, 2026', W / 2, footerY + 78 * sc);

    // Right Signature: Program Coordinator
    ctx.strokeStyle = '#0B2D5C';
    ctx.lineWidth = 2.5 * sc;
    ctx.beginPath();
    ctx.moveTo(W - 880 * sc, footerY);
    ctx.lineTo(W - 420 * sc, footerY);
    ctx.stroke();

    // Stylized signature stroke
    ctx.strokeStyle = '#123F7A';
    ctx.lineWidth = 3.5 * sc;
    ctx.beginPath();
    ctx.moveTo(W - 820 * sc, footerY - 30 * sc);
    ctx.bezierCurveTo(W - 770 * sc, footerY - 90 * sc, W - 710 * sc, footerY - 15 * sc, W - 660 * sc, footerY - 70 * sc);
    ctx.bezierCurveTo(W - 600 * sc, footerY - 20 * sc, W - 540 * sc, footerY - 80 * sc, W - 480 * sc, footerY - 30 * sc);
    ctx.stroke();

    ctx.fillStyle = '#0B2D5C';
    ctx.font = '700 ' + Math.round(22 * sc) + 'px "Poppins", sans-serif';
    ctx.fillText('PROGRAM COORDINATOR', W - 650 * sc, footerY + 36 * sc);

    ctx.fillStyle = '#526780';
    ctx.font = '500 ' + Math.round(18 * sc) + 'px "Inter", sans-serif';
    ctx.fillText('VELOWINGS LEARNING TECHNOLOGIES', W - 650 * sc, footerY + 68 * sc);

    // Bottom brand motto
    ctx.fillStyle = '#1684D8';
    ctx.font = '700 ' + Math.round(16 * sc) + 'px "Poppins", sans-serif';
    fillTextSpaced(ctx, 'LEARN  •  BUILD  •  GROW', W / 2, H - 90 * sc, 6 * sc);
  }

  /* Official Seal */
  function _drawVelowingsSeal(ctx, cx, cy, r) {
    ctx.save();
    // Outer dashed ring
    ctx.strokeStyle = '#1684D8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Inner gold/blue ring
    ctx.strokeStyle = '#0B2D5C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#F5FAFF';
    ctx.beginPath();
    ctx.arc(cx, cy, r - 9, 0, Math.PI * 2);
    ctx.fill();

    // Star / Wing emblem inside seal
    ctx.fillStyle = '#1684D8';
    ctx.font = 'bold ' + Math.round(r * 0.45) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', cx, cy - 6);

    ctx.fillStyle = '#0B2D5C';
    ctx.font = 'bold ' + Math.round(r * 0.22) + 'px "Poppins", sans-serif';
    ctx.fillText('VERIFIED', cx, cy + 18);
    ctx.restore();
  }

  /* ── PUBLIC API ── */

  /** Full 3508×2480 render (A4 300 DPI) */
  async function renderFull(canvasEl, templateUrl, name, templateKey) {
    return render(canvasEl, templateUrl, name, templateKey, 1);
  }

  /** Quarter-scale render for fast admin/portal preview */
  async function renderPreview(canvasEl, templateUrl, name, templateKey) {
    return render(canvasEl, templateUrl, name, templateKey, 0.25);
  }

  /** Download canvas as high-resolution PNG */
  function downloadPNG(canvasEl, filename) {
    var a = document.createElement('a');
    a.download = filename || 'VELOWINGS-LEARNING-TECHNOLOGIES-Certificate.png';
    a.href     = canvasEl.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /** Download canvas as A4 Landscape PDF */
  function downloadPDF(canvasEl, filename) {
    try {
      var _jspdf = window.jspdf;
      var jsPDF  = _jspdf ? _jspdf.jsPDF : null;
      if (!jsPDF) throw new Error('jsPDF library not loaded');
      var pw  = canvasEl.width  / 4;
      var ph  = canvasEl.height / 4;
      var pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [pw, ph] });
      pdf.addImage(canvasEl.toDataURL('image/png'), 'PNG', 0, 0, pw, ph);
      pdf.save(filename || 'VELOWINGS-LEARNING-TECHNOLOGIES-Certificate.pdf');
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('PDF export failed. Downloading high-resolution PNG instead.');
      downloadPNG(canvasEl, (filename || 'certificate').replace('.pdf', '.png'));
    }
  }

  function setNamePosition(key, x, y) {
    if (!key) key = 'participation';
    if (!CONFIGS[key]) CONFIGS[key] = {};
    if (x !== undefined && x !== null && !isNaN(x)) {
      var pxX = Math.round(parseFloat(x));
      CONFIGS[key].nameX = pxX;
      try {
        localStorage.setItem('tpl_nameX_px_' + key, pxX);
        localStorage.setItem('tpl_nameX_' + key, ((pxX / FULL_W) * 100).toFixed(1));
      } catch (e) {}
    }
    if (y !== undefined && y !== null && !isNaN(y)) {
      var pxY = Math.round(parseFloat(y));
      CONFIGS[key].nameY = pxY;
      try {
        localStorage.setItem('tpl_nameY_px_' + key, pxY);
        localStorage.setItem('tpl_nameY_' + key, ((pxY / FULL_H) * 100).toFixed(1));
      } catch (e) {}
    }
  }

  function getNamePosition(key) {
    if (!key) key = 'participation';
    var cfg = CONFIGS[key] || CONFIGS.participation;
    var x = (cfg.nameX !== undefined && !isNaN(cfg.nameX)) ? cfg.nameX : Math.round(FULL_W / 2);
    var y = (cfg.nameY !== undefined && !isNaN(cfg.nameY)) ? cfg.nameY : 1195;
    return {
      x: x,
      y: y,
      xPct: parseFloat(((x / FULL_W) * 100).toFixed(1)),
      yPct: parseFloat(((y / FULL_H) * 100).toFixed(1))
    };
  }

  window.CertEngine = {
    renderFull      : renderFull,
    renderPreview   : renderPreview,
    downloadPNG     : downloadPNG,
    downloadPDF     : downloadPDF,
    setNamePosition : setNamePosition,
    getNamePosition : getNamePosition,
    CONFIGS         : CONFIGS,
    FULL_W          : FULL_W,
    FULL_H          : FULL_H,
    EVENT_NAME      : EVENT_NAME,
    EVENT_TAGLINE   : EVENT_TAGLINE,
    EVENT_STATEMENT : EVENT_STATEMENT,
    EVENT_ORGANIZER : EVENT_ORGANIZER
  };

})(window);
