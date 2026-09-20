(function(){
  var MC = window.MC, $ = MC.$, reduce = MC.reduce;
  var screens = ['scrLogin','scrReg','scrOtp','scrMfa','scrRecover','scrNewPass','scrDone'];
  var tabs = $('authTabs'), flow = null, target = '', history = [];

  /* — контакт: телефон или почта — */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function digits(v){ return String(v || '').replace(/\D/g, ''); }
  function isPhone(v){ return /^[+\d\s()\-]+$/.test(v.trim()) && digits(v).length >= 10; }
  function normPhone(v){ var d = digits(v); if (d.length === 11 && (d[0] === '8' || d[0] === '7')) d = '7' + d.slice(1); if (d.length === 10) d = '7' + d; return d.length === 11 ? '+' + d : null; }
  function fmtPhone(d){ return '+' + d[0] + ' ' + d.slice(1,4) + ' ' + d.slice(4,7) + '-' + d.slice(7,9) + '-' + d.slice(9,11); }
  function parseId(v){
    v = String(v || '').trim();
    if (!v) return { err: 'Укажите телефон или почту.' };
    if (v.indexOf('@') >= 0) return EMAIL.test(v) ? { kind: 'email', value: v.toLowerCase(), pretty: v.toLowerCase() } : { err: 'Проверьте почту — например, mail@example.ru.' };
    if (isPhone(v)) { var p = normPhone(v); return p ? { kind: 'phone', value: p, pretty: fmtPhone(p.slice(1)) } : { err: 'Номер должен содержать 11 цифр: +7 900 000-00-00.' }; }
    return { err: 'Похоже ни на телефон, ни на почту.' };
  }
  function maskId(id){ return id.kind === 'email' ? id.value.replace(/^(.{2})[^@]*(@.*)$/, '$1•••$2') : id.pretty.replace(/(\+\d \d{3}) \d{3}-\d{2}/, '$1 •••-••'); }
  // живое форматирование телефона при вводе цифр
  ['loginId','regId','recId'].forEach(function(id){
    var el = $(id);
    el.addEventListener('input', function(){
      var v = el.value; if (v.indexOf('@') >= 0 || /[a-zA-Zа-яА-Я]/.test(v)) return;
      var d = digits(v); if (!d) return;
      if (d[0] === '8') d = '7' + d.slice(1); if (d[0] !== '7' && d.length <= 10) d = '7' + d;
      d = d.slice(0, 11); var out = '+' + d[0];
      if (d.length > 1) out += ' ' + d.slice(1,4); if (d.length > 4) out += ' ' + d.slice(4,7); if (d.length > 7) out += '-' + d.slice(7,9); if (d.length > 9) out += '-' + d.slice(9,11);
      el.value = out;
    });
  });

  /* — экраны — */
  function show(id, push){
    var cur = screens.filter(function(s){ return !$(s).hidden; })[0];
    if (push !== false && cur && cur !== id) history.push(cur);
    screens.forEach(function(s){ $(s).hidden = s !== id; });
    var tabbed = id === 'scrLogin' || id === 'scrReg';
    tabs.hidden = !tabbed;
    $('tabLogin').setAttribute('aria-selected', id === 'scrLogin' ? 'true' : 'false');
    $('tabReg').setAttribute('aria-selected', id === 'scrReg' ? 'true' : 'false');
    var f = $(id).querySelector('input:not([type=checkbox]):not([disabled])'); if (f && !reduce) setTimeout(function(){ f.focus(); }, 60);
  }
  function back(){ var prev = history.pop() || 'scrLogin'; stopTimer(); show(prev, false); }
  $('tabLogin').addEventListener('click', function(){ show('scrLogin'); });
  $('tabReg').addEventListener('click', function(){ show('scrReg'); });
  document.querySelectorAll('[data-tab]').forEach(function(b){ b.addEventListener('click', function(){ show(b.dataset.tab === 'reg' ? 'scrReg' : 'scrLogin'); }); });
  document.querySelectorAll('[data-back]').forEach(function(b){ b.addEventListener('click', back); });
  $('toRecover').addEventListener('click', function(){ $('recId').value = $('loginId').value; show('scrRecover'); });

  /* — показать/скрыть пароль — */
  document.querySelectorAll('[data-eye]').forEach(function(b){
    b.addEventListener('click', function(){ var i = $(b.dataset.eye); var show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль'); b.style.color = show ? 'var(--accent)' : ''; i.focus(); });
  });

  /* — сила пароля — */
  function score(p){ var s = 0; if (p.length >= 8) s++; if (/[a-zа-я]/.test(p) && /[A-ZА-Я]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^\w\s]/.test(p) || p.length >= 14) s++; return p.length < 8 ? Math.min(s, 1) : s; }
  function meter(inputId, hintId){
    var i = $(inputId), m = i.closest('.field').querySelector('.pw-meter'), h = $(hintId);
    i.addEventListener('input', function(){
      var s = score(i.value); m.setAttribute('data-score', i.value ? s : 0);
      h.className = 'hint'; h.textContent = !i.value ? 'Буквы и цифры, от 8 символов.' : s <= 1 ? 'Слабый: добавьте цифры и заглавные.' : s === 2 ? 'Средний: ещё бы символ или длиннее.' : s === 3 ? 'Хороший пароль.' : 'Отличный пароль.';
    });
  }
  meter('regPass', 'regPassHint'); meter('newPass', 'newPassHint');

  /* — ошибки полей — */
  function fieldErr(inputId, hintId, msg){
    var i = $(inputId), h = $(hintId);
    if (msg) { i.setAttribute('aria-invalid', 'true'); h.className = 'hint err'; h.textContent = msg; i.focus(); }
    else { i.removeAttribute('aria-invalid'); h.className = 'hint'; }
    return !msg;
  }
  function alertBox(id, msg){ var a = $(id); a.hidden = !msg; if (msg) $(id + 'Text').textContent = msg; }
  function busy(btn, on, text){ btn.classList.toggle('is-loading', on); btn.disabled = on; if (text && !on) btn.textContent = text; }

  /* — прототип «сервера»: аккаунты с 2FA — те, где в контакте есть «mfa» или телефон оканчивается на 77 — */
  function hasMfa(id){ return /mfa/i.test(id.value) || /77$/.test(id.value); }

  /* — вход по паролю — */
  $('scrLogin').addEventListener('submit', function(e){
    e.preventDefault(); alertBox('loginErr', '');
    var id = parseId($('loginId').value);
    if (!fieldErr('loginId', 'loginIdHint', id.err)) return;
    $('loginIdHint').textContent = 'Тот, что указывали при заказе.';
    if (!fieldErr('loginPass', 'loginPassHint', $('loginPass').value.length < 8 ? 'Пароль не короче 8 символов.' : '')) return;
    var btn = $('loginBtn'); busy(btn, true);
    setTimeout(function(){
      busy(btn, false, 'Войти');
      if (/^wrong/i.test($('loginPass').value)) { alertBox('loginErr', 'Неверный пароль. После 5 попыток вход блокируется на 15 минут.'); return; }
      target = id.pretty; flow = 'login';
      if (hasMfa(id)) { show('scrMfa'); resetOtp('mfaBoxes'); } else done('Вы вошли', 'Сессия создана. Переходим в кабинет…');
    }, reduce ? 0 : 700);
  });

  /* — вход по коду — */
  $('loginOtp').addEventListener('click', function(){
    alertBox('loginErr', '');
    var id = parseId($('loginId').value);
    if (!fieldErr('loginId', 'loginIdHint', id.err)) return;
    flow = 'login-otp'; target = id.pretty; startOtp(id, 'Код для входа');
  });

  /* — регистрация — */
  $('scrReg').addEventListener('submit', function(e){
    e.preventDefault(); alertBox('regErr', '');
    var id = parseId($('regId').value);
    if (!fieldErr('regId', 'regIdHint', id.err)) return;
    $('regIdHint').textContent = 'Сюда придёт код подтверждения и реквизиты карт.';
    if (!fieldErr('regPass', 'regPassHint', score($('regPass').value) < 2 ? 'Пароль слишком простой: от 8 символов, буквы и цифры.' : '')) return;
    var agree = $('agreeOffer'); agree.closest('.check').classList.toggle('is-invalid', !agree.checked);
    if (!agree.checked) { alertBox('regErr', 'Без согласия с офертой создать аккаунт нельзя.'); return; }
    if (/taken/i.test(id.value)) { alertBox('regErr', 'Такой контакт уже зарегистрирован. Войдите или восстановите пароль.'); return; }
    flow = 'register'; target = id.pretty; startOtp(id, 'Подтвердите контакт');
  });

  /* — восстановление — */
  $('scrRecover').addEventListener('submit', function(e){
    e.preventDefault();
    var id = parseId($('recId').value);
    if (!fieldErr('recId', 'recIdHint', id.err)) return;
    flow = 'recover'; target = id.pretty; startOtp(id, 'Код для восстановления');
  });
  $('scrNewPass').addEventListener('submit', function(e){
    e.preventDefault();
    if (!fieldErr('newPass', 'newPassHint', score($('newPass').value) < 2 ? 'Пароль слишком простой: от 8 символов, буквы и цифры.' : '')) return;
    done('Пароль обновлён', 'Все прежние сессии завершены. Вы вошли на этом устройстве.');
  });

  /* — OTP: 6 полей, автопереход, вставка, таймер повтора — */
  function boxes(gid){ return Array.prototype.slice.call($(gid).querySelectorAll('input')); }
  function wireOtp(gid, btnId, onFull){
    var bs = boxes(gid), btn = $(btnId);
    function code(){ return bs.map(function(b){ return b.value; }).join(''); }
    function sync(){ bs.forEach(function(b){ b.classList.toggle('is-filled', !!b.value); }); btn.disabled = code().length !== 6; $(gid).classList.remove('is-err'); }
    bs.forEach(function(b, i){
      b.addEventListener('input', function(){
        var v = digits(b.value);
        if (v.length > 1) { v.split('').slice(0, 6 - i).forEach(function(ch, k){ bs[i + k].value = ch; }); var n = Math.min(5, i + v.length); bs[n].focus(); }
        else { b.value = v; if (v && i < 5) bs[i + 1].focus(); }
        sync(); if (code().length === 6) onFull(code());
      });
      b.addEventListener('keydown', function(e){
        if (e.key === 'Backspace' && !b.value && i > 0) { bs[i - 1].value = ''; bs[i - 1].focus(); sync(); }
        if (e.key === 'ArrowLeft' && i > 0) bs[i - 1].focus(); if (e.key === 'ArrowRight' && i < 5) bs[i + 1].focus();
      });
      b.addEventListener('focus', function(){ b.select(); });
    });
    return { code: code, sync: sync };
  }
  function resetOtp(gid){ boxes(gid).forEach(function(b){ b.value = ''; b.classList.remove('is-filled'); }); $(gid).classList.remove('is-err', 'is-ok'); }
  var timer = null, left = 0;
  function startTimer(){
    left = 59; $('otpResend').disabled = true; tick();
    clearInterval(timer); timer = setInterval(function(){ left--; tick(); if (left <= 0) { clearInterval(timer); $('otpResend').disabled = false; $('otpTimer').textContent = ''; } }, 1000);
  }
  function stopTimer(){ clearInterval(timer); }
  function tick(){ $('otpTimer').textContent = left > 0 ? 'через 0:' + ('0' + left).slice(-2) : ''; }
  function startOtp(id, title){
    $('otpTitle').textContent = title; $('otpTarget').textContent = maskId(id);
    $('otpText').firstChild.textContent = (id.kind === 'phone' ? 'Отправили SMS с 6 цифрами на ' : 'Отправили письмо с 6 цифрами на ');
    alertBox('otpErr', ''); resetOtp('otpBoxes'); show('scrOtp'); startTimer();
    toast(id.kind === 'phone' ? 'SMS отправлено' : 'Письмо отправлено', 'Прототип: код не приходит, введите любые 6 цифр.');
  }
  var otp = wireOtp('otpBoxes', 'otpBtn', function(){ $('scrOtp').requestSubmit(); });
  $('scrOtp').addEventListener('submit', function(e){
    e.preventDefault(); var c = otp.code(); if (c.length !== 6) return;
    var btn = $('otpBtn'); busy(btn, true);
    setTimeout(function(){
      busy(btn, false, 'Подтвердить');
      if (c === '000000') { $('otpBoxes').classList.add('is-err'); alertBox('otpErr', 'Код не подошёл. Осталось попыток: 2.'); boxes('otpBoxes')[0].focus(); return; }
      $('otpBoxes').classList.add('is-ok'); stopTimer();
      if (flow === 'recover') show('scrNewPass');
      else if (flow === 'register') done('Аккаунт создан', 'Контакт подтверждён, сессия создана. Реквизиты будущих карт будут приходить сюда и в кабинет.');
      else done('Вы вошли', 'Сессия создана. Переходим в кабинет…');
    }, reduce ? 0 : 600);
  });
  $('otpResend').addEventListener('click', function(){ resetOtp('otpBoxes'); alertBox('otpErr', ''); startTimer(); toast('Код отправлен повторно', 'Предыдущий код больше не действует.'); boxes('otpBoxes')[0].focus(); });

  /* — 2FA — */
  var mfa = wireOtp('mfaBoxes', 'mfaBtn', function(){ $('scrMfa').requestSubmit(); });
  $('scrMfa').addEventListener('submit', function(e){
    e.preventDefault(); var c = mfa.code(); if (c.length !== 6) return;
    var btn = $('mfaBtn'); busy(btn, true);
    setTimeout(function(){
      busy(btn, false, 'Подтвердить');
      if (c === '000000') { $('mfaBoxes').classList.add('is-err'); alertBox('mfaErr', 'Код не подошёл. Проверьте время на устройстве или запросите SMS.'); return; }
      $('mfaBoxes').classList.add('is-ok'); done('Вы вошли', 'Вход подтверждён вторым фактором. Устройство запомнено на 30 дней.');
    }, reduce ? 0 : 600);
  });
  $('mfaSms').addEventListener('click', function(){ var id = parseId($('loginId').value); flow = 'login-otp'; startOtp(id, 'Код для входа'); });
  $('mfaBackup').addEventListener('click', function(){ toast('Резервный код', 'Прототип: введите любые 6 цифр в поля выше.'); boxes('mfaBoxes')[0].focus(); });

  /* — успех — */
  function done(title, text){
    $('doneTitle').textContent = title; $('doneText').textContent = text;
    var ua = navigator.userAgent, dev = /iPhone|Android/i.test(ua) ? 'Телефон' : /Mac/i.test(ua) ? 'Mac' : /Windows/i.test(ua) ? 'Windows' : 'Браузер';
    $('doneDevice').textContent = dev + ' · ' + (/Chrome/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : /Firefox/i.test(ua) ? 'Firefox' : 'браузер');
    $('doneTime').textContent = new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + ' · ' + target;
    $('mfaOffer').hidden = flow !== 'register';
    try { localStorage.setItem('mc-session', JSON.stringify({ id: target, at: Date.now() })); } catch (e) {}
    stopTimer(); show('scrDone');
  }
  $('mfaOn').addEventListener('change', function(){ toast(this.checked ? '2FA будет включена' : '2FA выключена', this.checked ? 'В кабинете покажем QR для приложения-аутентификатора.' : 'Вход только по паролю или коду.'); });

  function toast(title, body){
    var st = $('toasts'); var t = document.createElement('div'); t.className = 'toast toast-info';
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg><div><b>' + title + '</b>' + body + '</div><button type="button" class="x" aria-label="Закрыть">×</button>';
    t.querySelector('.x').addEventListener('click', function(){ t.remove(); }); st.appendChild(t); setTimeout(function(){ t.remove(); }, 4500);
  }

  if (location.hash === '#register') show('scrReg', false);
  MC.initReveal();
})();
