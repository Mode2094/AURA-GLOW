(function() {
    var container = document.createElement('div');
    container.id = 'social-proof-container';
    container.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:360px;width:100%;pointer-events:none';
    document.body.appendChild(container);

    var names = [
        'David Cohen','Sarah Levy','Michael Shapiro','Rachel Goldberg','Daniel Friedman','Rebecca Katz','Jacob Rosenberg','Hannah Weiss','Samuel Stein','Leah Abrams',
        'Noah Isaacson','Emma Feldman','Ethan Greenberg','Olivia Solomon','Benjamin Klein','Ava Schwartz','William Steinberg','Isabella Blumenthal','James Goldstein','Mia Silver',
        'Alexander Rosenberg','Sophia Weinstein','Joseph Kaufman','Charlotte Hirsch','Ryan Kaplan','Amelia Berger','Nathan Rosen','Harper Rosenstein','Aaron Mandel','Evelyn Horowitz',
        'Pedro Garcia','Maria Lopez','Jose Martinez','Carmen Rodriguez','Antonio Fernandez','Isabel Sanchez','Francisco Perez','Rosa Ramirez','Manuel Torres','Juana Flores',
        'Diego Rivera','Teresa Castillo','Jorge Cruz','Ana Ortiz','Carlos Morales','Marta Reyes','Alejandro Vargas','Patricia Mendoza','Miguel Soto','Elena Herrera',
        'Hans Mueller','Anna Schmidt','Peter Fischer','Klara Weber','Thomas Wagner','Ursula Hoffmann','Wolfgang Becker','Ingrid Richter','Klaus Schneider','Gertrud Zimmermann',
        'Heinrich Braun','Gisela Neumann','Friedrich Schwarz','Hildegard Zimmermann','Rudolf Lang','Margot Klein','Ernst Hofmann','Elsa Schafer','Gustav Koch','Lotte Bauer',
        'James Smith','Mary Johnson','Robert Williams','Patricia Brown','Michael Jones','Jennifer Garcia','David Martinez','Linda Robinson','Richard Clark','Barbara Lewis',
        'Joseph Walker','Susan Hall','Thomas Allen','Karen Young','Charles King','Lisa Wright','Christopher Scott','Margaret Adams','Daniel Baker','Betty Green',
        'Matthew Hill','Dorothy Nelson','Andrew Mitchell','Sandra Carter','Joshua Phillips','Ashley Campbell','Ethan Parker','Kimberly Evans','Ryan Edwards','Deborah Collins',
        'Oliver Taylor','Grace Thompson','Harry Anderson','Alice Thomas','Jack Jackson','Ella White','Charlie Harris','Ruby Martin','George Robinson','Daisy Lewis',
        'Liam Walker','Charlotte Hall','Noah Young','Amelia King','Ethan Wright','Emily Scott','Mason Green','Abigail Adams','Lucas Baker','Sophia Nelson',
        'John Black','Jane Brown','Alan Gray','Diana Fox','Steven Green','Laura Stone','Kevin Cross','Angela Brooks','Edward Hayes','Megan Price',
        'Brian Wood','Stephanie Cole','Scott Wells','Christine Hunt','Kevin Palmer','Julie Mills','Jeffrey Porter','Katherine Fox','Craig Ross','Judith Bishop',
        'David Ariav','Yael Barak','Eitan Dagan','Shira Elad','Avi Golan','Noga Halevi','Boaz Israeli','Tamar Kidron','Dov Levin','Anat Mizrahi',
        'Elad Navon','Ruth Oren','Gideon Peled','Yael Ronen','Amir Shemesh','Noa Tal','Yoni Ullman','Michal Vered','Ziv Yaron','Shani Zohar',
        'Klaus Seidel','Adelheid Klein','Dieter Krüger','Renate Lorenz','Bernd Vogel','Irmgard Schulze','Horst Berger','Monika Stark','Egon Graf','Erika Kuhn',
        'Mark Taylor','Laura Anderson','George Jackson','Nancy Scott','Chris Evans','Sarah King','Kevin Adams','Donna Hill','Tim Cook','Megan Mitchell',
        'Rafael Torres','Ana Garcia','Luis Fernandez','Carmen Martinez','Pablo Rodriguez','Elena Sanchez','Sergio Moreno','Rosa Jimenez','Adrian Lopez','Beatriz Ruiz',
        'Juan Carlos Silva','Maria Delgado','Alberto Vega','Laura Flores','Fernando Ramos','Pilar Crespo','Raul Gil','Cristina Ferrer','Enrique Soto','Mercedes Mendez',
        'Otto Fuchs','Leni Werner','Erich Bach','Trudi Hirsch','Arnold Kohl','Lieselotte Jung','Kurt Zimmermann','Hannelore Kraus','Rudi Engel','Lotte Gerber',
        'Jonathan Shapiro','Esther Rosen','Gideon Klein','Miriam Weiss','Yehuda Stern','Rivka Katz','Shimon Feldman','Bracha Cohen','Menachem Levy','Shoshana Goldberg',
        'William Harrison','Natalie West','Frank Mason','Catherine Hunt','Raymond Tucker','Denise Freeman','Dennis Pierce','Janet Carpenter','Henry Hawkins','Diane Palmer',
        'Tomas Navarro','Sofia Guerrero','Hector Morales','Daniela Vargas','Cesar Medina','Luisa Rios','Marco Delgado','Valentina Soto','Emilio Herrera','Carolina Vega'
    ];

    var adjectives = ['just now','1m ago','2m ago','3m ago','4m ago','5m ago','6m ago','7m ago','8m ago','9m ago','10m ago','12m ago','15m ago','18m ago','20m ago','25m ago','30m ago'];

    function getProducts() {
        var isHe = typeof window.currentLang === 'function' && window.currentLang() === 'he';
        if (isHe) {
                        return [
                { name:"קרם תה ירוק", price: 672 },
                { name:"שמן חוחובה אורגני", price: 757 },
                { name:"סרום פילינג חומצות", price: 565 },
                { name:"סרום עיניים קולגן", price: 1007 },
                { name:"מדבקות אקנה", price: 597 },
                { name:"סרום ספריי ראשון", price: 480 },
                { name:"סרום מבהיר ויטמין C", price: 506 },
                { name:"סרום קולגן מחייה", price: 203 },
                { name:"משחת אקנה גופרית", price: 144 },
                { name:"תמיסת פילינג חומצה סליצילית", price: 288 },
                { name:"סרום ויטמין C 20%", price: 656 },
                { name:"אמפולת סנטלה מרגיעה", price: 314 },
                { name:"סרום רטינול מתיחה", price: 314 },
                { name:"סרום מבהיר ניאצינמיד 10%", price: 533 },
                { name:"תמצית שבלול 96% לחות", price: 325 },
                { name:"סרום פפטידים מרובה", price: 203 },
                { name:"סרום חומצה היאלורונית", price: 554 },
                { name:"סרום ויטמין C מבהיר", price: 203 },
                { name:"קרם סרום פיקנוגנול", price: 160 },
            ];
        }
                    return [
                { name:"Green Tea Skin Cream", price: 672 },
                { name:"Organic Jojoba Oil", price: 757 },
                { name:"Glycolic + Lactic Acid Serum", price: 565 },
                { name:"Vegan Collagen Eye Serum", price: 1007 },
                { name:"Overnight Spot Patches", price: 597 },
                { name:"First Spray Serum", price: 480 },
                { name:"Glow Filter Serum", price: 506 },
                { name:"Collagen Serum", price: 203 },
                { name:"Sulfur Ointment", price: 144 },
                { name:"Clarifying Exfoliant", price: 288 },
                { name:"Vitamin C 20% Serum", price: 656 },
                { name:"Centella Ampoule", price: 314 },
                { name:"Retinol Shot", price: 314 },
                { name:"Niacinamide 10 Serum", price: 533 },
                { name:"Snail Mucin Essence", price: 325 },
                { name:"Multi-Peptide Serum", price: 203 },
                { name:"Hyaluronic Acid Serum", price: 554 },
                { name:"Vitamin C Classic", price: 203 },
                { name:"Pycnogenol Cream", price: 160 },
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
        var boughtText = (typeof window.currentLang === 'function' && window.currentLang() === 'he') ? 'קנה' : 'شرى';
        var timeText = time;
        if (typeof window.currentLang === 'function' && window.currentLang() === 'he') {
            var heTimes = { 'just now':'זה עתה', '1m ago':'לפני דקה', '2m ago':'לפני 2 דק', '3m ago':'לפני 3 דק', '4m ago':'לפני 4 דק', '5m ago':'לפני 5 דק', '6m ago':'לפני 6 דק', '7m ago':'לפני 7 דק', '8m ago':'לפני 8 דק', '9m ago':'לפני 9 דק', '10m ago':'לפני 10 דק', '12m ago':'לפני 12 דק', '15m ago':'לפני 15 דק', '18m ago':'לפני 18 דק', '20m ago':'לפני 20 דק', '25m ago':'לפני 25 דק', '30m ago':'לפני 30 דק' };
            timeText = heTimes[time] || time;
        }
        el.innerHTML = '<span style="font-size:24px;flex-shrink:0">🛒</span><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px;color:#292524;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + name + '</div><div style="font-size:11px;color:#78716c;line-height:1.4">' + boughtText + ' <strong style="color:#b45309">' + product.name + '</strong> - ' + product.price + '.00 ₪</div><div style="font-size:10px;color:#a8a29e;margin-top:2px">🕐 ' + timeText + '</div></div><button onclick="this.parentElement.remove()" style="background:none;border:none;color:#d4d4d4;font-size:22px;cursor:pointer;padding:0 8px;flex-shrink:0;font-weight:bold">&times;</button>';

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
