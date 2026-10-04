/* ==========================================================================
   Product imagery — resolves what to show for a product.

   Priority:
     1. p.image  (a real photo — from your supplier feed or the brand's
                  official retailer assets). Used whenever present.
     2. Brand tile fallback. A stock photo of "some perfume bottle" is NOT
        what the customer receives, so we do not pass one off as the
        product. Instead we render a branded tile that looks intentional.
   ========================================================================== */

(function (g) {
  'use strict';

  /* deterministic hue from the brand name -> stable colour per brand */
  function hash(str) {
    var h = 0, s = String(str || '');
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function initials(brand, name) {
    var src = (brand || name || '?').trim();
    var words = src.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return src.slice(0, 2).toUpperCase();
  }

  /**
   * Brand tile markup for a product.
   * @param {object} p product
   * @param {object} opts { ratio: 'square'|'wide', dark:bool, font: 'sm'|'lg' }
   */
  function auraTile(p, opts) {
    opts = opts || {};
    var hue = hash(p.brand || p.name) % 360;
    var dark = opts.dark !== false;
    var ratio = opts.ratio === 'wide' ? '16/9' : '1/1';
    var big = opts.font === 'lg';

    var bg = dark
      ? 'background:linear-gradient(145deg,hsl(' + hue + ' 18% 16%),hsl(' + ((hue + 24) % 360) + ' 14% 9%))'
      : 'background:linear-gradient(145deg,hsl(' + hue + ' 22% 94%),hsl(' + ((hue + 24) % 360) + ' 18% 88%))';

    var fg = dark ? 'hsl(' + hue + ' 42% 88%)' : 'hsl(' + hue + ' 55% 24%)';
    var sub = dark ? 'hsl(' + hue + ' 20% 62%)' : 'hsl(' + hue + ' 25% 42%)';

    return '' +
      '<div class="aura-tile" role="img" aria-label="' + esc(p.name) + '" ' +
        'style="' + bg + ';aspect-ratio:' + ratio + '">' +
        '<div class="aura-tile-inner">' +
          '<span class="aura-tile-mark" style="color:' + fg + ';' +
            'font-size:' + (big ? '3rem' : '1.9rem') + '">' +
            esc(initials(p.brand, p.name)) + '</span>' +
          '<span class="aura-tile-brand" style="color:' + sub + '">' +
            esc(p.brand || 'عطر') + '</span>' +
          '<span class="aura-tile-hint" style="color:' + sub + '">' +
            'صورة المنتج قريباً</span>' +
        '</div>' +
      '</div>';
  }

  /**
   * Choose between a real <img> and the brand tile.
   * Returns an element (works with the store's DOM-based card builder).
   */
  function auraMedia(p, opts) {
    opts = opts || {};
    var doc = g.document;
    if (p.image) {
      var img = doc.createElement('img');
      img.src = p.image;
      img.alt = p.name || '';
      img.loading = 'lazy';
      img.className = opts.imgClass || 'w-full h-full object-contain p-4';
      img.onerror = function () { replaceWithTile(img, p, opts); };
      return img;
    }
    var holder = doc.createElement('div');
    holder.className = 'w-full h-full';
    holder.innerHTML = auraTile(p, opts);
    return holder;
  }

  function replaceWithTile(node, p, opts) {
    var parent = node && node.parentNode;
    if (!parent) return;
    var div = g.document.createElement('div');
    div.className = 'w-full h-full';
    div.innerHTML = auraTile(p, opts);
    parent.replaceChild(div, node);
  }

  /* markup-only variant for string-template pages */
  function auraMediaHTML(p, opts) {
    opts = opts || {};
    if (!p.image) return auraTile(p, opts);
    var cls = opts.imgClass || 'w-full h-full object-contain p-4';
    return '<img src="' + esc(p.image) + '" alt="' + esc(p.name || '') + '" ' +
           'loading="lazy" class="' + cls + '" ' +
           'onerror="this.outerHTML=window.auraTile?' +
           'window.auraTile(' + JSON.stringify(p).replace(/"/g, '&quot;') + '):this.outerHTML">';
  }

  g.auraTile = auraTile;
  g.auraMedia = auraMedia;
  g.auraMediaHTML = auraMediaHTML;

  g.document && g.document.addEventListener('DOMContentLoaded', function () {
    var s = g.document.createElement('style');
    s.textContent = [
      '.aura-tile{display:flex;align-items:center;justify-content:center;width:100%;overflow:hidden}',
      '.aura-tile-inner{display:flex;flex-direction:column;align-items:center;gap:.35rem;padding:1rem;text-align:center}',
      '.aura-tile-mark{font-weight:800;letter-spacing:.02em;line-height:1}',
      '.aura-tile-brand{font-size:.7rem;font-weight:700;line-height:1.2;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.aura-tile-hint{font-size:.6rem;opacity:.75;line-height:1.2}'
    ].join('');
    g.document.head.appendChild(s);
  });
})(window);