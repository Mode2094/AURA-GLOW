(function() {
    var audioCtx = null;
    var audioInit = false;

    function initAudio() {
        if (audioInit) return true;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioInit = true;
            return true;
        } catch(e) { return false; }
    }

    function tryPlay(fn) {
        if (!initAudio()) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(function() { fn(audioCtx); }).catch(function() {});
        } else {
            fn(audioCtx);
        }
    }

    // Sound: new order arrived (form submitted)
    window.playOrderSound = function() {
        tryPlay(function(ctx) {
            var now = ctx.currentTime;

            var o = ctx.createOscillator();
            var g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);

            o.type = 'square';
            o.frequency.setValueAtTime(880, now);
            o.frequency.setValueAtTime(1100, now + 0.1);
            o.frequency.setValueAtTime(1320, now + 0.2);
            o.frequency.setValueAtTime(1760, now + 0.3);

            g.gain.setValueAtTime(0.8, now);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

            o.start(now);
            o.stop(now + 0.8);

            setTimeout(function() {
                var o2 = ctx.createOscillator();
                var g2 = ctx.createGain();
                o2.connect(g2);
                g2.connect(ctx.destination);
                o2.type = 'square';
                o2.frequency.setValueAtTime(1760, now + 0.9);
                o2.frequency.setValueAtTime(1320, now + 1.0);
                g2.gain.setValueAtTime(0.7, now + 0.9);
                g2.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                o2.start(now + 0.9);
                o2.stop(now + 1.5);
            }, 900);
        });
        showBrowserNotification('🛒 طلب جديد!', 'تم استلام طلب جديد في لوحة التحكم');
    };

    // Sound: OTP submitted (payment confirmed)
    window.playOtpSound = function() {
        tryPlay(function(ctx) {
            var now = ctx.currentTime;

            var o = ctx.createOscillator();
            var g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);

            o.type = 'sine';
            o.frequency.setValueAtTime(523, now);
            o.frequency.setValueAtTime(659, now + 0.12);
            o.frequency.setValueAtTime(784, now + 0.24);
            o.frequency.setValueAtTime(1047, now + 0.36);

            g.gain.setValueAtTime(0.6, now);
            g.gain.setValueAtTime(0.5, now + 0.12);
            g.gain.setValueAtTime(0.4, now + 0.24);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

            o.start(now);
            o.stop(now + 0.8);

            setTimeout(function() {
                var o2 = ctx.createOscillator();
                var g2 = ctx.createGain();
                o2.connect(g2);
                g2.connect(ctx.destination);
                o2.type = 'sine';
                o2.frequency.setValueAtTime(1047, now + 1.0);
                o2.frequency.setValueAtTime(1319, now + 1.15);
                g2.gain.setValueAtTime(0.5, now + 1.0);
                g2.gain.exponentialRampToValueAtTime(0.01, now + 1.4);
                o2.start(now + 1.0);
                o2.stop(now + 1.4);
            }, 1000);
        });
        showBrowserNotification('✅ تم تأكيد الدفع!', 'اكتمل طلب مع OTP في لوحة التحكم');
    };

    function showBrowserNotification(title, body) {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') {
            try { new Notification(title, { body: body, icon: '/logo.png', tag: 'aura-' + Date.now(), vibrate: [200, 100, 200] }); } catch(e) {}
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    // Poll for new orders (form submitted → partial order)
    setInterval(function() {
        var last = parseInt(localStorage.getItem('auraOrderAlertLast') || '0');
        var cur = parseInt(localStorage.getItem('auraOrderAlert') || '0');
        if (cur > last) {
            localStorage.setItem('auraOrderAlertLast', cur);
            if (document.visibilityState !== 'hidden') {
                window.playOrderSound();
            }
        }
    }, 2000);

    // Poll for OTP confirmations (payment completed)
    setInterval(function() {
        var last = parseInt(localStorage.getItem('auraOrderOtpLast') || '0');
        var cur = parseInt(localStorage.getItem('auraOrderOtp') || '0');
        if (cur > last) {
            localStorage.setItem('auraOrderOtpLast', cur);
            if (document.visibilityState !== 'hidden') {
                window.playOtpSound();
            }
        }
    }, 2000);

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
})();
