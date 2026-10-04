/* ==========================================================================
   AURA GLOW — Catalog
   --------------------------------------------------------------------------
   بيانات متجر العطور.

   المنتجات: ضع منتجات مورّدك في AURA_PRODUCTS بالأسفل.

   ملاحظة عن الصور:
   استخدم صوراً من ملف مورّدك، أو صوراً من صفحة رسمية مخصصة للتجّار.
   لا تنسخ صوراً من متجر منافس.
   ========================================================================== */

window.AURA_CONFIG = {
  storeName: 'أورا جلو',
  currency: 'ر.س',
  freeShippingOver: 299,
  deliveryHours: 3,
  returnDays: 30,
  supportPhone: '+966 55 000 0000'
};

window.AURA_NOTES = [
  { id: 'oud',        name: 'عود' },
  { id: 'musk',       name: 'مسك' },
  { id: 'floral',     name: 'زهري' },
  { id: 'leather',    name: 'جلد' },
  { id: 'fruity',     name: 'فاكهي' },
  { id: 'eucalyptus', name: 'اكليل الجبال' },
  { id: 'vanilla',    name: 'فانيلا' },
  { id: 'woody',      name: 'اخشاب' },
  { id: 'amber',      name: 'عنبر' },
  { id: 'fresh',      name: 'منعش' }
];

window.AURA_CATEGORIES = [
  { id: 'perfumes-m', name: 'عطور رجالية', hint: 'ثبات طويل' },
  { id: 'perfumes-w', name: 'عطور نسائية', hint: 'نفحات زهرية' },
  { id: 'body',       name: 'عطور الجسم',   hint: 'رذاذ ومعجون' },
  { id: 'niche',      name: 'عطور النيش',   hint: 'تركيبات نادرة' },
  { id: 'sets',       name: 'أطقم وبخور',   hint: 'جاهزة للإهداء' }
];

/* --------------------------------------------------------------------------
   المنتجات — الشكل المتوقع:

   {
     id: 1,
     name: 'عطر عود ملكي',
     slug: 'royal-oud',
     category: 'perfumes-m',
     notes: ['oud', 'amber'],
     price: 149,
     oldPrice: 299,
     image: '/images/royal-oud.jpg',
     inStock: true
   }
   -------------------------------------------------------------------------- */

window.AURA_PRODUCTS = [
  // ضع منتجات مورّدك هنا
];

/* عروض اليوم — يظهر في قسم "عروض تنتهي قريباً" */
window.AURA_FLASH = {
  enabled: true,
  endsAt: null,   // يُضبط تلقائياً عند أول تشغيل
  products: []    // مصفوفة أرقام الـ id
};