(function(){
  var MC = window.MC, rub = MC.rub;
  var RATE = MC.RATE;
  var total = function(d){ return MC.charged(d) * RATE; };  // формула сайта
  var Preset = PrimeVue.definePreset(PrimeUIX.Themes.Aura, window.MARSCAP_PRESET);
  var pvOptions = { theme: { preset: Preset, options: { darkModeSelector: '.mc-dark', cssLayer: false } }, ripple: false };
  function reg(app){
    app.component('p-button', PrimeVue.Button); app.component('p-select-button', PrimeVue.SelectButton);
    app.component('p-input-text', PrimeVue.InputText); app.component('p-input-number', PrimeVue.InputNumber);
    app.component('p-message', PrimeVue.Message); app.component('p-toast', PrimeVue.Toast);
    app.component('p-icon-field', PrimeVue.IconField); app.component('p-input-icon', PrimeVue.InputIcon);
    app.component('p-tabs', PrimeVue.Tabs); app.component('p-tab-list', PrimeVue.TabList); app.component('p-tab', PrimeVue.Tab);
  }

  /* — конфигуратор — */
  var order = Vue.createApp({
    data: function(){ return { mode: 'fixed', den: 50, custom: 50, denoms: [{usd:50},{usd:75},{usd:100},{usd:150},{usd:200}], modes: [{label:'Из списка', value:'fixed'},{label:'Своя сумма', value:'custom'}], email: '', emailErr: false, paying: false }; },
    computed: { amount: function(){ return this.mode === 'fixed' ? this.den : Math.min(200, Math.max(50, +this.custom || 0)); } },
    methods: {
      rub: rub, total: total,
      pay: function(){
        var self = this, ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email.trim());
        if (!ok) { this.emailErr = true; this.$nextTick(function(){ var el = document.getElementById('email'); if (el) el.focus(); }); return; }
        this.paying = true;
        setTimeout(function(){
          self.paying = false;
          self.$toast.add({ severity: 'success', summary: 'Прототип', detail: 'Здесь откроется окно СБП на ' + rub(total(self.amount)) + '.', life: 5000 });
        }, 1200);
      }
    }
  });
  order.use(PrimeVue.Config, pvOptions); order.use(PrimeVue.ToastService); reg(order); order.mount('#vcApp');

  /* — витрина — */
  var C = MC.CATALOG;
  var show = Vue.createApp({
    data: function(){ return { cat: 'all', q: '', shown: 20, services: C.services, catName: C.catName, cats: [{ id:'all', name:'Все', icon:C.allIcon, count:C.services.length }].concat(C.categories) }; },
    computed: {
      filtered: function(){ var q = this.q.trim().toLowerCase(), cat = this.cat; return this.services.filter(function(s){ return (cat === 'all' || s.c === cat) && (!q || s.n.toLowerCase().indexOf(q) !== -1); }); },
      visible: function(){ return this.filtered.slice(0, this.shown); },
      countText: function(){ if (!this.filtered.length) return ''; return this.q ? 'Найдено ' + this.filtered.length : 'Показано ' + this.visible.length + ' из ' + this.filtered.length; }
    },
    watch: { cat: function(){ this.shown = 20; }, q: function(){ this.shown = 20; } }
  });
  show.use(PrimeVue.Config, pvOptions); reg(show); show.mount('#showcaseApp');

  MC.initReveal();
})();
