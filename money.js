/* Shared currency formatter — one source of truth for every page. */
(function (g) {
  'use strict';

  function auraMoney(n, withUnit) {
    var unit = withUnit === false ? '' : ' ر.س';
    var v = Number(n);
    if (!isFinite(v)) v = 0;
    var neg = v < 0;
    v = Math.abs(v);

    var whole = Math.floor(v);
    var frac = Math.round((v - whole) * 100);
    var s = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (frac > 0) {
      s += '.' + (frac < 10 ? '0' + frac : frac);
    }
    return (neg ? '-' : '') + s + unit;
  }

  g.auraMoney = auraMoney;
})(typeof window !== 'undefined' ? window : globalThis);