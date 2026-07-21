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

            var count = parseInt(localStorage.getItem('auraOrderAlertCount') || '0') + 1;
            localStorage.setItem('auraOrderAlertCount', count);
        });
    };

    window.playStoreSound = function() {
        tryPlay(function(ctx) {
            var now = ctx.currentTime;
            var o = ctx.createOscillator();
            var g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(660, now);
            o.frequency.linearRampToValueAtTime(880, now + 0.15);
            o.frequency.linearRampToValueAtTime(660, now + 0.3);
            g.gain.setValueAtTime(0.15, now);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            o.start(now);
            o.stop(now + 0.4);
        });
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });

    setInterval(function() {
        var lastCount = parseInt(localStorage.getItem('auraOrderAlertLastCount') || '0');
        var currentCount = parseInt(localStorage.getItem('auraOrderAlertCount') || '0');
        if (currentCount > lastCount) {
            localStorage.setItem('auraOrderAlertLastCount', currentCount);
            if (document.visibilityState !== 'hidden') {
                window.playOrderSound();
            }
        }
    }, 2000);
})();
