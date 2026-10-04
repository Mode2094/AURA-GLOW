(function() {
    var container = document.createElement('div');
    container.id = 'social-proof-container';
    container.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:360px;width:100%;pointer-events:none';
    document.body.appendChild(container);

    var names = [
        'نورة القحطاني',
        'محمد العتيبي',
        'سارة الدوسري',
        'فهد الشمري',
        'ريم الزهراني',
        'عبدالله الحربي',
        'لمياء الغامدي',
        'خالد المطيري',
        'هند السبيعي',
        'ماجد العنزي',
        'منى الصقر',
        'طارق البلوي',
        'أروى الجهني',
        'بندر الخالدي',
        'جواهر العسيري',
        'سلطان الرشيد',
        'شهد المالكي',
        'عمر الشمراني',
        'دانة البقمي',
        'يزن الفهد',
        'أمل الزهراني',
        'تميم القرني',
        'غادة العمري',
        'بدر السبيعي',
        'رغد الأحمدي',
        'مشاري العنزي',
        'لمى الشهراني',
        'عزام الراشد',
        'جواهر الدوسري',
        'تركي المانع',
        'سعاد الحازمي',
        'إبراهيم النفيعي',
        'مها الرشيد',
        'عصام البلوي',
        'نوف الزعابي',
        'سلطان الشهري',
        'رنا الفيفي',
        'فهد الزهراني',
        'أريج السالم',
        'مشعل الخالدي',
        'دلال المطيري',
        'نايف العتيبي',
        'وجدان السعدي',
        'راشد الزيد',
        'منال العمري',
        'ثامر الشامي',
        'ياسر المالكي',
        'هيا الزهراني',
        'زياد الأنصاري',
        'ملاك الحربي',
        'روان السبيعي',
        'فارس العتيبي',
        'ملاك الحازمي',
        'سعد البقمي',
        'غيداء العسيري',
        'أنس الرشيد',
        'ريم السالم',
        'بشار السهلي',
        'أمل الزمر',
        'وليد المالكي',
        'نجاة العتيبي',
        'حصة العرفاني',
        'لطيفة الحمد',
        'مشعل الغامدي',
        'عبير السالم'
    ];

    var adjectives = ['الآن', 'قبل دقيقة', 'قبل دقيقتين', 'قبل 3 دقائق', 'قبل 4 دقائق', 'قبل 5 دقائق', 'قبل 6 دقائق', 'قبل 7 دقائق', 'قبل 8 دقائق', 'قبل 9 دقائق', 'قبل 10 دقائق', 'قبل 12 دقيقة', 'قبل 15 دقيقة', 'قبل 18 دقيقة', 'قبل 20 دقيقة', 'قبل 25 دقيقة', 'قبل 30 دقيقة'];

    function getProducts() {
        return [
            { name:"كريم الشاي الأخضر", price: 24 },
            { name:"زيت الجوجوبا العضوي", price: 27 },
            { name:"سيروم التقشير بالأحماض", price: 20 },
            { name:"سيروم الكولاجين للعين", price: 35 },
            { name:"لصقات حب الشباب", price: 21 },
            { name:"سيروم الرش الأول", price: 17 },
            { name:"سيروم فيتامين سي المضيء", price: 18 },
            { name:"سيروم الكولاجين المجدد", price: 7 },
            { name:"مرهم الكبريت لحب الشباب", price: 5 },
            { name:"تونر التقشير بحمض الساليسيليك", price: 10 },
            { name:"سيروم فيتامين سي 20%", price: 23 },
            { name:"أمبولة السنتيلا المهدئة", price: 11 },
            { name:"سيروم الريتينول المشد", price: 11 },
            { name:"سيروم النياسيناميد 10%", price: 19 },
            { name:"سيروم مخاط القواقع 96%", price: 11 },
            { name:"سيروم الببتيدات المتعددة", price: 7 },
            { name:"سيروم حمض الهيالورونيك", price: 20 },
            { name:"سيروم فيتامين سي المضيء", price: 7 },
            { name:"كريم البيكنوجينول", price: 6 },
        ];
    }

    function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function createNotification() {
        var products = getProducts();
        var name = randomItem(names);
        var product = randomItem(products);
        var time = randomItem(adjectives);

        var el = document.createElement('div');
        el.style.cssText = 'background:white;border:1px solid #e7e5e4;border-radius:16px;padding:12px 16px;box-shadow:0 8px 24px rgba(0,0,0,0.1);display:flex;align-items:center;gap:10px;transform:translateX(-120%);opacity:0;transition:all 0.5s ease;pointer-events:auto;max-width:340px';
        var boughtText = 'اشترى';
        var timeText = time;
        var priceText = window.auraMoney ? window.auraMoney(product.price) : product.price + ' ر.س';
        el.innerHTML = '<span style="font-size:24px;flex-shrink:0">🛒</span><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px;color:#292524;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + name + '</div><div style="font-size:11px;color:#78716c;line-height:1.4">' + boughtText + ' <strong style="color:#b45309">' + product.name + '</strong> - ' + priceText + '</div><div style="font-size:10px;color:#a8a29e;margin-top:2px">🕐 ' + timeText + '</div></div><button onclick="this.parentElement.remove()" style="background:none;border:none;color:#d4d4d4;font-size:22px;cursor:pointer;padding:0 8px;flex-shrink:0;font-weight:bold">&times;</button>';

        container.appendChild(el);
        setTimeout(function() { el.style.transform = 'translateX(0)'; el.style.opacity = '1'; }, 50);
        setTimeout(function() { el.style.transform = 'translateX(-120%)'; el.style.opacity = '0'; setTimeout(function() { if (el.parentElement) el.remove(); }, 500); }, 6000);
    }

    function startSocialProof() {
        setTimeout(function() {
            createNotification();
            var interval = setInterval(function() {
                if (document.hidden) return;
                createNotification();
            }, 15000 + Math.random() * 20000);
        }, 3000);
    }

    if (document.readyState === 'complete') startSocialProof();
    else window.addEventListener('load', startSocialProof);
})();
