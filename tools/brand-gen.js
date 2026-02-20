#!/usr/bin/env node
'use strict';

const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

/* ── Font Registration ── */
// Manrope must be installed as a system font (Windows user fonts dir + registry).
// canvas 3.x registerFont is unreliable on Windows, so we rely on system install.
// The fonts are bundled in tools/fonts/ for portability; install them via:
//   1. Copy *.ttf to %LOCALAPPDATA%\Microsoft\Windows\Fonts\
//   2. Register in HKCU\Software\Microsoft\Windows NT\CurrentVersion\Fonts
// On macOS/Linux, registerFont works — attempt it as a fallback.
const fontsDir = path.join(__dirname, 'fonts');
try {
  registerFont(path.join(fontsDir, 'Manrope-Regular.ttf'), { family: 'Manrope', weight: 'normal', style: 'normal' });
  registerFont(path.join(fontsDir, 'Manrope-SemiBold.ttf'), { family: 'Manrope', weight: '600', style: 'normal' });
  registerFont(path.join(fontsDir, 'Manrope-Bold.ttf'), { family: 'Manrope', weight: 'bold', style: 'normal' });
} catch (e) {
  // Non-fatal — system font install is the primary mechanism
}

/* ── Brand Tokens ── */
const C = {
  charcoal: '#1C1917',
  charcoalLight: '#292524',
  ember: '#E8450D',
  emberDark: '#C53D0A',
  sand: '#F5F0EB',
  stone: '#78716C',
  slate: '#44403C',
  white: '#FFFFFF',
};

/* ── Shared Images ── */
let wordmarkImg = null;
let markImg = null; // offscreen canvas with "Al" crop

/* ── Utilities ── */

function getNoiseTile() {
  const s = 256;
  const c = createCanvas(s, s);
  const x = c.getContext('2d');
  const d = x.createImageData(s, s);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.random() > 0.5 ? 255 : 0;
    d.data[i] = v; d.data[i + 1] = v; d.data[i + 2] = v;
    d.data[i + 3] = 7;
  }
  x.putImageData(d, 0, 0);
  return c;
}

function drawNoise(ctx, w, h) {
  const tile = getNoiseTile();
  const pat = ctx.createPattern(tile, 'repeat');
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, w, h);
}

function drawEmberGlow(ctx, w, h, cx, cy, radius, opacity) {
  cx = cx ?? w * 0.5;
  cy = cy ?? h * 0.5;
  radius = radius ?? Math.max(w, h) * 0.45;
  opacity = opacity ?? 0.12;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0, 'rgba(232, 69, 13, ' + opacity + ')');
  g.addColorStop(1, 'rgba(232, 69, 13, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * node-canvas lacks ctx.letterSpacing, so we draw char-by-char.
 * emFactor: spacing in em (e.g. 0.12 for '0.12em')
 */
function fillTextSpaced(ctx, text, x, y, emFactor) {
  if (!emFactor) {
    ctx.fillText(text, x, y);
    return;
  }
  const fontSize = parseFloat(ctx.font.match(/(\d+(?:\.\d+)?)px/)?.[1] || 16);
  const spacing = fontSize * emFactor;
  // Measure total width for alignment
  let totalWidth = 0;
  for (const ch of text) {
    totalWidth += ctx.measureText(ch).width + spacing;
  }
  totalWidth -= spacing; // no trailing space

  let startX = x;
  if (ctx.textAlign === 'center') {
    startX = x - totalWidth / 2;
  } else if (ctx.textAlign === 'right') {
    startX = x - totalWidth;
  }

  const savedAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  let cx = startX;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  ctx.textAlign = savedAlign;
}

/* ── Wordmark Renderer (PNG-based) ── */
function drawWordmark(ctx, x, topY, fontSize, theme, align, shadow) {
  if (!wordmarkImg) return { width: 0, height: 0 };

  const scale = (fontSize * 1.15) / 121;
  const dw = 632 * scale;
  const dh = 121 * scale;

  let dx = x;
  if (align === 'center') dx = x - dw / 2;
  else if (align === 'right') dx = x - dw;

  if (shadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = fontSize * 0.15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  ctx.drawImage(wordmarkImg, 81, 90, 632, 121, dx, topY, dw, dh);

  if (shadow) ctx.restore();

  return { width: dw, height: dh };
}

/* ── Mark Renderer ("Al" only, PNG-based) ── */
function drawMark(ctx, cx, cy, fontSize, theme, shadow) {
  if (!markImg) return;

  const scale = fontSize / 118;
  const dw = 119 * scale;
  const dh = 118 * scale;

  if (shadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = fontSize * 0.08;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  ctx.drawImage(markImg, 0, 0, 119, 118, cx - dw / 2, cy - dh / 2, dw, dh);

  if (shadow) ctx.restore();
}

/* ── Template Definitions ── */
const TEMPLATES = {
  'linkedin-banner': {
    label: 'LinkedIn Banner',
    width: 1584, height: 396,
    defaultTheme: 'dark', defaultGlow: true,
    sizes: { logo: 36, eyebrow: 13, title: 46, subtitle: 22 },
    fields: [
      { id: 'eyebrow', label: 'Eyebrow', default: '' },
      { id: 'title', label: 'Title', default: 'AI Transformation for SMBs' },
      { id: 'subtitle', label: 'Subtitle', default: 'Strategy \u00b7 Implementation \u00b7 Results' },
    ],
    render(ctx, w, h, f, opts) {
      const isDark = opts.theme !== 'light';
      const textColor = isDark ? C.white : C.charcoal;
      const mutedColor = isDark ? C.stone : C.slate;
      const pad = 80;
      const cx = w * opts.position;
      const maxW = w - pad * 2;
      const v = f._visible;

      const wmSize = f._sizes.logo;
      const eyeSize = f._sizes.eyebrow;
      const titleSize = f._sizes.title;
      const subSize = f._sizes.subtitle;
      const gap1 = 28, gap2 = 12, gap3 = 14;

      const showLogo = v.logo !== false;
      const hasEye = v.eyebrow !== false && f.eyebrow && f.eyebrow.trim();
      const showTitle = v.title !== false;
      const hasSub = v.subtitle !== false && f.subtitle && f.subtitle.trim();

      ctx.font = '700 ' + titleSize + 'px Manrope';
      const titleLines = showTitle ? wrapText(ctx, f.title || '', maxW) : [];
      const titleH = titleLines.length * (titleSize * 1.25);

      const wmH = showLogo ? wmSize * 1.15 : 0;
      const eyeH = hasEye ? eyeSize + gap2 : 0;
      const totalH = wmH + (showLogo ? gap1 : 0) + eyeH + titleH + (hasSub ? gap3 + subSize : 0);
      let y = (h - totalH) / 2;

      if (showLogo) {
        drawWordmark(ctx, cx, y, wmSize, opts.theme, 'center', opts.shadow);
        y += wmH + gap1;
      }

      if (hasEye) {
        ctx.font = '600 ' + eyeSize + 'px Manrope';
        ctx.fillStyle = C.ember;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        fillTextSpaced(ctx, f.eyebrow.toUpperCase(), cx, y, 0.12);
        y += eyeSize + gap2;
      }

      if (showTitle) {
        ctx.font = '700 ' + titleSize + 'px Manrope';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        titleLines.forEach((line, i) => {
          ctx.fillText(line, cx, y + i * titleSize * 1.25);
        });
        y += titleH;
      }

      if (hasSub) {
        y += gap3;
        ctx.font = '400 ' + subSize + 'px Manrope';
        ctx.fillStyle = mutedColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(f.subtitle, cx, y);
      }
      ctx.textAlign = 'left';
    }
  },

  'og-image': {
    label: 'OG Image (Link Preview)',
    width: 1200, height: 630,
    defaultTheme: 'dark', defaultGlow: true,
    sizes: { logo: 34, eyebrow: 15, title: 54, subtitle: 26 },
    fields: [
      { id: 'eyebrow', label: 'Eyebrow', default: '' },
      { id: 'title', label: 'Title', default: 'AI Transformation for SMBs' },
      { id: 'subtitle', label: 'Subtitle', default: 'Build AI-capable organizations, not just AI-equipped employees' },
    ],
    render(ctx, w, h, f, opts) {
      const isDark = opts.theme !== 'light';
      const textColor = isDark ? C.white : C.charcoal;
      const mutedColor = isDark ? C.stone : C.slate;
      const pad = 72;
      const cx = w * opts.position;
      const maxW = w - pad * 2;
      const v = f._visible;

      const wmSize = f._sizes.logo;
      const eyeSize = f._sizes.eyebrow;
      const titleSize = f._sizes.title;
      const subSize = f._sizes.subtitle;
      const gap1 = 36, gap2 = 16, gap3 = 20;

      const showLogo = v.logo !== false;
      const hasEye = v.eyebrow !== false && f.eyebrow && f.eyebrow.trim();
      const showTitle = v.title !== false;
      const hasSub = v.subtitle !== false && f.subtitle && f.subtitle.trim();

      ctx.font = '700 ' + titleSize + 'px Manrope';
      const titleLines = showTitle ? wrapText(ctx, f.title || '', maxW) : [];
      const titleH = titleLines.length * (titleSize * 1.2);

      ctx.font = '400 ' + subSize + 'px Manrope';
      const subLines = hasSub ? wrapText(ctx, f.subtitle, maxW) : [];
      const subH = subLines.length * (subSize * 1.35);

      const wmH = showLogo ? wmSize * 1.15 : 0;
      const eyeH = hasEye ? eyeSize + gap2 : 0;
      const totalH = wmH + (showLogo ? gap1 : 0) + eyeH + titleH + (hasSub ? gap3 + subH : 0);
      let y = (h - totalH) / 2;

      if (showLogo) {
        drawWordmark(ctx, cx, y, wmSize, opts.theme, 'center', opts.shadow);
        y += wmH + gap1;
      }

      if (hasEye) {
        ctx.font = '600 ' + eyeSize + 'px Manrope';
        ctx.fillStyle = C.ember;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        fillTextSpaced(ctx, f.eyebrow.toUpperCase(), cx, y, 0.12);
        y += eyeSize + gap2;
      }

      if (showTitle) {
        ctx.font = '700 ' + titleSize + 'px Manrope';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        titleLines.forEach((line, i) => {
          ctx.fillText(line, cx, y + i * titleSize * 1.2);
        });
        y += titleH;
      }

      if (hasSub) {
        y += gap3;
        ctx.font = '400 ' + subSize + 'px Manrope';
        ctx.fillStyle = mutedColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        subLines.forEach((line, i) => {
          ctx.fillText(line, cx, y + i * subSize * 1.35);
        });
      }
      ctx.textAlign = 'left';
    }
  },

  'social-square': {
    label: 'Social Square (1080x1080)',
    width: 1080, height: 1080,
    defaultTheme: 'dark', defaultGlow: true,
    sizes: { logo: 28, eyebrow: 15, title: 50, subtitle: 24 },
    fields: [
      { id: 'eyebrow', label: 'Eyebrow', default: 'ALPHASMB' },
      { id: 'title', label: 'Title', default: 'Transform Your Business with AI' },
      { id: 'subtitle', label: 'Subtitle', default: 'Strategy calls now available' },
    ],
    render(ctx, w, h, f, opts) {
      const isDark = opts.theme !== 'light';
      const textColor = isDark ? C.white : C.charcoal;
      const mutedColor = isDark ? C.stone : C.slate;
      const pad = 90;
      const cx = w * opts.position;
      const maxW = w - pad * 2;
      const v = f._visible;

      const wmSize = f._sizes.logo;
      const eyeSize = f._sizes.eyebrow;
      const titleSize = f._sizes.title;
      const subSize = f._sizes.subtitle;
      const gap1 = 60, gap2 = 16, gap3 = 20;

      const showLogo = v.logo !== false;
      const hasEye = v.eyebrow !== false && f.eyebrow && f.eyebrow.trim();
      const showTitle = v.title !== false;
      const hasSub = v.subtitle !== false && f.subtitle && f.subtitle.trim();

      ctx.font = '700 ' + titleSize + 'px Manrope';
      const titleLines = showTitle ? wrapText(ctx, f.title || '', maxW) : [];
      const titleH = titleLines.length * (titleSize * 1.2);

      const wmH = showLogo ? wmSize * 1.15 : 0;
      const eyeH = hasEye ? eyeSize + gap2 : 0;
      const subH = hasSub ? gap3 + subSize : 0;
      const totalH = wmH + (showLogo ? gap1 : 0) + eyeH + titleH + subH;
      let y = (h - totalH) / 2;

      if (showLogo) {
        drawWordmark(ctx, cx, y, wmSize, opts.theme, 'center', opts.shadow);
        y += wmH + gap1;
      }

      if (hasEye) {
        ctx.font = '600 ' + eyeSize + 'px Manrope';
        ctx.fillStyle = C.ember;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        fillTextSpaced(ctx, f.eyebrow.toUpperCase(), cx, y, 0.12);
        y += eyeSize + gap2;
      }

      if (showTitle) {
        ctx.font = '700 ' + titleSize + 'px Manrope';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        titleLines.forEach((line, i) => {
          ctx.fillText(line, cx, y + i * titleSize * 1.2);
        });
        y += titleH;
      }

      if (hasSub) {
        y += gap3;
        ctx.font = '400 ' + subSize + 'px Manrope';
        ctx.fillStyle = mutedColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(f.subtitle, cx, y);
      }
      ctx.textAlign = 'left';
    }
  },

  'social-landscape': {
    label: 'Social Landscape (1200x628)',
    width: 1200, height: 628,
    defaultTheme: 'dark', defaultGlow: true,
    sizes: { logo: 34, eyebrow: 15, title: 54, subtitle: 26 },
    fields: [
      { id: 'eyebrow', label: 'Eyebrow', default: '' },
      { id: 'title', label: 'Title', default: 'AI Transformation for SMBs' },
      { id: 'subtitle', label: 'Subtitle', default: 'Strategy \u00b7 Implementation \u00b7 Results' },
    ],
    render(ctx, w, h, f, opts) {
      TEMPLATES['og-image'].render(ctx, w, h, f, opts);
    }
  },

  'article-header': {
    label: 'Article Header (1200x400)',
    width: 1200, height: 400,
    defaultTheme: 'dark', defaultGlow: true,
    sizes: { logo: 24, eyebrow: 14, title: 44 },
    fields: [
      { id: 'eyebrow', label: 'Eyebrow', default: 'INSIGHT' },
      { id: 'title', label: 'Title', default: 'Why Most AI Implementations Fail' },
    ],
    render(ctx, w, h, f, opts) {
      const isDark = opts.theme !== 'light';
      const textColor = isDark ? C.white : C.charcoal;
      const pad = 64;
      const cx = w * opts.position;
      const maxW = w - pad * 2 - 200;
      const v = f._visible;

      const eyeSize = f._sizes.eyebrow;
      const titleSize = f._sizes.title;
      const gap = 14;
      const showLogo = v.logo !== false;
      const hasEye = v.eyebrow !== false && f.eyebrow && f.eyebrow.trim();
      const showTitle = v.title !== false;

      ctx.font = '700 ' + titleSize + 'px Manrope';
      const titleLines = showTitle ? wrapText(ctx, f.title || '', maxW) : [];
      const titleH = titleLines.length * (titleSize * 1.2);

      const eyeH = hasEye ? eyeSize + gap : 0;
      const totalH = eyeH + titleH;
      let y = (h - totalH) / 2;

      if (hasEye) {
        ctx.font = '600 ' + eyeSize + 'px Manrope';
        ctx.fillStyle = C.ember;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        fillTextSpaced(ctx, f.eyebrow.toUpperCase(), cx, y, 0.12);
        y += eyeSize + gap;
      }

      if (showTitle) {
        ctx.font = '700 ' + titleSize + 'px Manrope';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        titleLines.forEach((line, i) => {
          ctx.fillText(line, cx, y + i * titleSize * 1.2);
        });
      }

      if (showLogo) {
        const wmSize = f._sizes.logo;
        drawWordmark(ctx, w - pad, h - pad - wmSize, wmSize, opts.theme, 'right', opts.shadow);
      }
      ctx.textAlign = 'left';
    }
  },

  'quote-card': {
    label: 'Quote Card (1080x1080)',
    width: 1080, height: 1080,
    defaultTheme: 'dark', defaultGlow: true,
    sizes: { logo: 24, quote: 34, attribution: 20 },
    fields: [
      { id: 'quote', label: 'Quote', default: 'The goal isn\u2019t to replace your team with AI \u2014 it\u2019s to make your team irreplaceable because of AI.' },
      { id: 'attribution', label: 'Attribution', default: 'Zach Henderson' },
    ],
    render(ctx, w, h, f, opts) {
      const isDark = opts.theme !== 'light';
      const textColor = isDark ? C.white : C.charcoal;
      const mutedColor = isDark ? C.stone : C.slate;
      const pad = 100;
      const cx = w * opts.position;
      const maxW = w - pad * 2;
      const v = f._visible;

      const showLogo = v.logo !== false;
      const showQuote = v.quote !== false;
      const hasAttr = v.attribution !== false && f.attribution && f.attribution.trim();

      // Decorative open quote
      if (showQuote) {
        ctx.font = '700 280px Manrope';
        ctx.fillStyle = isDark ? 'rgba(232, 69, 13, 0.07)' : 'rgba(232, 69, 13, 0.1)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('\u201C', cx, 80);
      }

      const quoteSize = f._sizes.quote;
      const quoteLH = quoteSize * 1.5;
      ctx.font = '400 ' + quoteSize + 'px Manrope';
      const quoteLines = showQuote ? wrapText(ctx, f.quote || '', maxW) : [];
      const quoteH = quoteLines.length * quoteLH;

      const attrSize = f._sizes.attribution;
      const wmSize = f._sizes.logo;
      const gap1 = 32, gap2 = 48;
      const attrH = hasAttr ? gap1 + attrSize : 0;
      const wmH = showLogo ? gap2 + wmSize * 1.15 : 0;
      const totalH = quoteH + attrH + wmH;
      let y = (h - totalH) / 2;

      if (showQuote) {
        ctx.font = '400 ' + quoteSize + 'px Manrope';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        quoteLines.forEach((line, i) => {
          ctx.fillText(line, cx, y + i * quoteLH);
        });
        y += quoteH;
      }

      if (hasAttr) {
        y += gap1;
        ctx.font = '600 ' + attrSize + 'px Manrope';
        ctx.fillStyle = mutedColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('\u2014 ' + f.attribution, cx, y);
        y += attrSize;
      }

      if (showLogo) {
        y += gap2;
        drawWordmark(ctx, cx, y, wmSize, opts.theme, 'center', opts.shadow);
      }
      ctx.textAlign = 'left';
    }
  },

  'x-header': {
    label: 'X/Twitter Header (1500x500)',
    width: 1500, height: 500,
    defaultTheme: 'dark', defaultGlow: true,
    sizes: { logo: 38, eyebrow: 14, title: 48, subtitle: 24 },
    fields: [
      { id: 'eyebrow', label: 'Eyebrow', default: '' },
      { id: 'title', label: 'Title', default: 'AI Transformation for SMBs' },
      { id: 'subtitle', label: 'Subtitle', default: 'Strategy \u00b7 Implementation \u00b7 Results' },
    ],
    render(ctx, w, h, f, opts) {
      TEMPLATES['linkedin-banner'].render(ctx, w, h, f, opts);
    }
  },

  'facebook-cover': {
    label: 'Facebook Cover (820x312)',
    width: 820, height: 312,
    defaultTheme: 'dark', defaultGlow: true,
    sizes: { logo: 22, eyebrow: 11, title: 30, subtitle: 16 },
    fields: [
      { id: 'eyebrow', label: 'Eyebrow', default: '' },
      { id: 'title', label: 'Title', default: 'AI Transformation for SMBs' },
      { id: 'subtitle', label: 'Subtitle', default: 'Strategy \u00b7 Implementation \u00b7 Results' },
    ],
    render(ctx, w, h, f, opts) {
      const isDark = opts.theme !== 'light';
      const textColor = isDark ? C.white : C.charcoal;
      const mutedColor = isDark ? C.stone : C.slate;
      const pad = 48;
      const cx = w * opts.position;
      const maxW = w - pad * 2;
      const v = f._visible;

      const wmSize = f._sizes.logo;
      const eyeSize = f._sizes.eyebrow;
      const titleSize = f._sizes.title;
      const subSize = f._sizes.subtitle;
      const gap1 = 18, gap2 = 8, gap3 = 10;

      const showLogo = v.logo !== false;
      const hasEye = v.eyebrow !== false && f.eyebrow && f.eyebrow.trim();
      const showTitle = v.title !== false;
      const hasSub = v.subtitle !== false && f.subtitle && f.subtitle.trim();

      ctx.font = '700 ' + titleSize + 'px Manrope';
      const titleLines = showTitle ? wrapText(ctx, f.title || '', maxW) : [];
      const titleH = titleLines.length * (titleSize * 1.25);

      const wmH = showLogo ? wmSize * 1.15 : 0;
      const eyeH = hasEye ? eyeSize + gap2 : 0;
      const totalH = wmH + (showLogo ? gap1 : 0) + eyeH + titleH + (hasSub ? gap3 + subSize : 0);
      let y = (h - totalH) / 2;

      if (showLogo) {
        drawWordmark(ctx, cx, y, wmSize, opts.theme, 'center', opts.shadow);
        y += wmH + gap1;
      }

      if (hasEye) {
        ctx.font = '600 ' + eyeSize + 'px Manrope';
        ctx.fillStyle = C.ember;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        fillTextSpaced(ctx, f.eyebrow.toUpperCase(), cx, y, 0.12);
        y += eyeSize + gap2;
      }

      if (showTitle) {
        ctx.font = '700 ' + titleSize + 'px Manrope';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        titleLines.forEach((line, i) => {
          ctx.fillText(line, cx, y + i * titleSize * 1.25);
        });
        y += titleH;
      }

      if (hasSub) {
        y += gap3;
        ctx.font = '400 ' + subSize + 'px Manrope';
        ctx.fillStyle = mutedColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(f.subtitle, cx, y);
      }
      ctx.textAlign = 'left';
    }
  },

  'story': {
    label: 'Story (1080x1920)',
    width: 1080, height: 1920,
    defaultTheme: 'dark', defaultGlow: true,
    sizes: { logo: 36, eyebrow: 18, title: 72, subtitle: 32 },
    fields: [
      { id: 'eyebrow', label: 'Eyebrow', default: 'ALPHASMB' },
      { id: 'title', label: 'Title', default: 'Transform Your Business with AI' },
      { id: 'subtitle', label: 'Subtitle', default: 'Book a free strategy call' },
    ],
    render(ctx, w, h, f, opts) {
      const isDark = opts.theme !== 'light';
      const textColor = isDark ? C.white : C.charcoal;
      const mutedColor = isDark ? C.stone : C.slate;
      const pad = 80;
      const cx = w * opts.position;
      const maxW = w - pad * 2;
      const v = f._visible;

      const wmSize = f._sizes.logo;
      const eyeSize = f._sizes.eyebrow;
      const titleSize = f._sizes.title;
      const subSize = f._sizes.subtitle;
      const gap1 = 80, gap2 = 24, gap3 = 32;

      const showLogo = v.logo !== false;
      const hasEye = v.eyebrow !== false && f.eyebrow && f.eyebrow.trim();
      const showTitle = v.title !== false;
      const hasSub = v.subtitle !== false && f.subtitle && f.subtitle.trim();

      ctx.font = '700 ' + titleSize + 'px Manrope';
      const titleLines = showTitle ? wrapText(ctx, f.title || '', maxW) : [];
      const titleH = titleLines.length * (titleSize * 1.2);

      const wmH = showLogo ? wmSize * 1.15 : 0;
      const eyeH = hasEye ? eyeSize + gap2 : 0;
      const totalH = wmH + (showLogo ? gap1 : 0) + eyeH + titleH + (hasSub ? gap3 + subSize : 0);
      let y = (h - totalH) / 2;

      if (showLogo) {
        drawWordmark(ctx, cx, y, wmSize, opts.theme, 'center', opts.shadow);
        y += wmH + gap1;
      }

      if (hasEye) {
        ctx.font = '600 ' + eyeSize + 'px Manrope';
        ctx.fillStyle = C.ember;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        fillTextSpaced(ctx, f.eyebrow.toUpperCase(), cx, y, 0.12);
        y += eyeSize + gap2;
      }

      if (showTitle) {
        ctx.font = '700 ' + titleSize + 'px Manrope';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        titleLines.forEach((line, i) => {
          ctx.fillText(line, cx, y + i * titleSize * 1.2);
        });
        y += titleH;
      }

      if (hasSub) {
        y += gap3;
        ctx.font = '400 ' + subSize + 'px Manrope';
        ctx.fillStyle = mutedColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(f.subtitle, cx, y);
      }
      ctx.textAlign = 'left';
    }
  },

  'profile-picture': {
    label: 'Profile Picture (400x400)',
    width: 400, height: 400,
    defaultTheme: 'dark', defaultGlow: false,
    sizes: { logo: 140 },
    fields: [],
    render(ctx, w, h, f, opts) {
      if (f._visible.logo === false) return;
      drawMark(ctx, w * opts.position, h / 2, f._sizes.logo, opts.theme, opts.shadow);
    }
  },

  'favicon': {
    label: 'Favicon',
    width: 512, height: 512,
    defaultTheme: 'dark', defaultGlow: false,
    sizes: { logo: 450 },
    fields: [
      { id: 'dimension', label: 'Dimension', default: '512' },
    ],
    getDimensions(fields) {
      const dim = parseInt(fields.dimension) || 512;
      return { width: dim, height: dim };
    },
    render(ctx, w, h, f, opts) {
      if (f._visible.logo === false) return;
      drawMark(ctx, w * opts.position, h / 2, f._sizes.logo, opts.theme, opts.shadow);
    }
  },

  'wordmark': {
    label: 'Wordmark Export',
    width: 1200, height: 300,
    defaultTheme: 'dark', defaultGlow: false,
    sizes: { logo: 72 },
    fields: [],
    render(ctx, w, h, f, opts) {
      if (f._visible.logo === false) return;
      const fontSize = f._sizes.logo;
      const dh = fontSize * 1.15;
      const topY = (h - dh) / 2;
      drawWordmark(ctx, w * opts.position, topY, fontSize, opts.theme, 'center', opts.shadow);
    }
  },

  'mark': {
    label: 'Mark Export ("Al")',
    width: 512, height: 512,
    defaultTheme: 'dark', defaultGlow: false,
    sizes: { logo: 160 },
    fields: [],
    render(ctx, w, h, f, opts) {
      if (f._visible.logo === false) return;
      drawMark(ctx, w * opts.position, h / 2, f._sizes.logo, opts.theme, opts.shadow);
    }
  },
};

/* ── CLI Argument Parsing ── */
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--list') {
      args.list = true;
    } else if (arg === '--glow') {
      args.glow = true;
    } else if (arg === '--no-glow') {
      args.glow = false;
    } else if (arg === '--shadow') {
      args.shadow = true;
    } else if (arg === '--no-shadow') {
      args.shadow = false;
    } else if (arg.startsWith('--') && i + 1 < argv.length) {
      const key = arg.slice(2);
      args[key] = argv[++i];
    }
  }
  return args;
}

function showList() {
  console.log('\nAvailable templates:\n');
  const maxId = Math.max(...Object.keys(TEMPLATES).map(k => k.length));
  for (const [id, tmpl] of Object.entries(TEMPLATES)) {
    const dims = tmpl.getDimensions
      ? '(dynamic)'
      : tmpl.width + 'x' + tmpl.height;
    const fields = tmpl.fields.map(f => f.id).join(', ') || '(none)';
    console.log('  ' + id.padEnd(maxId + 2) + dims.padEnd(14) + tmpl.label);
    if (tmpl.fields.length) {
      console.log('  ' + ''.padEnd(maxId + 2) + 'Fields: ' + fields);
    }
  }
  console.log('\nUsage:');
  console.log('  node tools/brand-gen.js --template og-image --title "My Title" --output my-og.png');
  console.log('  node tools/brand-gen.js --template favicon --dimension 32 --theme transparent --no-shadow --no-glow --output favicon.png');
  console.log('\nOptions:');
  console.log('  --template       Template name (required)');
  console.log('  --output         Output file path (default: {template}.png)');
  console.log('  --format         png | jpg (default: png)');
  console.log('  --theme          dark | light | transparent (default: template default)');
  console.log('  --glow/--no-glow Ember glow toggle (default: template default)');
  console.log('  --glow-opacity   1-50 percentage (default: 27 dark, 36 light)');
  console.log('  --shadow/--no-shadow  Logo glow toggle (default: on)');
  console.log('  --position       left | center | right (default: center)');
  console.log('  --title          Title text');
  console.log('  --subtitle       Subtitle text');
  console.log('  --eyebrow        Eyebrow text');
  console.log('  --quote          Quote text');
  console.log('  --attribution    Attribution text');
  console.log('  --dimension      Favicon dimension (16-512)');
  console.log('  --{field}-size   Size override (e.g. --title-size 60)');
  console.log('  --list           Show available templates');
  console.log('');
}

/* ── Main ── */
async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.list || (!args.template && Object.keys(args).length === 0)) {
    showList();
    process.exit(0);
  }

  if (!args.template) {
    console.error('Error: --template is required. Use --list to see available templates.');
    process.exit(1);
  }

  const tmpl = TEMPLATES[args.template];
  if (!tmpl) {
    console.error('Error: Unknown template "' + args.template + '". Use --list to see available templates.');
    process.exit(1);
  }

  // Load wordmark image
  const imgPath = path.join(__dirname, '..', 'graphics', 'AlphaSMB-full-tpbg.png');
  try {
    wordmarkImg = await loadImage(imgPath);
    // Crop "Al" portion to offscreen canvas
    const crop = createCanvas(119, 118);
    crop.getContext('2d').drawImage(wordmarkImg, 81, 92, 119, 118, 0, 0, 119, 118);
    markImg = crop;
  } catch (e) {
    console.warn('Warning: Could not load wordmark image at ' + imgPath);
    console.warn('Logo rendering will be skipped.');
  }

  // Resolve options
  const theme = args.theme || tmpl.defaultTheme;
  const glow = args.glow !== undefined ? args.glow : tmpl.defaultGlow;
  const shadow = args.shadow !== undefined ? args.shadow : true;
  const format = args.format || 'png';

  const positionMap = { left: 0.33, center: 0.5, right: 0.66 };
  const position = positionMap[args.position] || 0.5;

  const defaultGlowOpacity = theme === 'light' ? 36 : 27;
  const glowOpacity = args['glow-opacity']
    ? parseInt(args['glow-opacity'], 10) / 100
    : defaultGlowOpacity / 100;

  // Build field values
  const fields = {};
  for (const f of tmpl.fields) {
    fields[f.id] = args[f.id] !== undefined ? args[f.id] : f.default;
  }

  // Build _sizes (template defaults + CLI overrides)
  fields._sizes = {};
  if (tmpl.sizes) {
    for (const [key, def] of Object.entries(tmpl.sizes)) {
      const override = args[key + '-size'];
      fields._sizes[key] = override ? parseInt(override, 10) : def;
    }
  }

  // All fields visible by default in CLI
  fields._visible = { logo: true };
  for (const f of tmpl.fields) {
    fields._visible[f.id] = true;
  }

  // Handle favicon dynamic dimensions
  let w = tmpl.width;
  let h = tmpl.height;
  if (tmpl.getDimensions) {
    const d = tmpl.getDimensions(fields);
    w = d.width;
    h = d.height;
    // Scale logo size to match dimension
    if (args.template === 'favicon' && !args['logo-size']) {
      fields._sizes.logo = Math.round(w * 0.88);
    }
  }

  // Create canvas and render
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const isTransparent = theme === 'transparent';

  // Background
  if (!isTransparent) {
    ctx.fillStyle = theme === 'light' ? C.sand : C.charcoal;
    ctx.fillRect(0, 0, w, h);
    if (glow) drawEmberGlow(ctx, w, h, w * position, h * 0.5, undefined, glowOpacity);
    drawNoise(ctx, w, h);
  }

  // Template content
  const effectiveTheme = isTransparent ? 'dark' : theme;
  tmpl.render(ctx, w, h, fields, { theme: effectiveTheme, glow, position, shadow });

  // Output
  const ext = format === 'jpg' ? '.jpg' : '.png';
  const outputPath = args.output || (args.template + ext);

  let buf;
  if (format === 'jpg') {
    // JPG needs white background behind transparency
    const jpgCanvas = createCanvas(w, h);
    const jctx = jpgCanvas.getContext('2d');
    jctx.fillStyle = '#FFFFFF';
    jctx.fillRect(0, 0, w, h);
    jctx.drawImage(canvas, 0, 0);
    buf = jpgCanvas.toBuffer('image/jpeg', { quality: 0.92 });
  } else {
    buf = canvas.toBuffer('image/png');
  }

  // Ensure output directory exists
  const outDir = path.dirname(path.resolve(outputPath));
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, buf);
  console.log('Saved: ' + path.resolve(outputPath) + ' (' + w + 'x' + h + ', ' + format + ')');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
