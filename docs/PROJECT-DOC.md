# Редизайн store.marscap.ru — база и страницы

Стек-решение: **Nuxt + PrimeVue 4 (styled mode, пресет Aura + свои токены)**. Mantine отклонён — React-only.
Исходники сайта: `C:\Users\fedor\Downloads\store.marscap.ru` (статический HTML, не Nuxt). Папка сайта подключена: `device_bash` работает (mnt/store.marscap.ru), stage/commit работают.

## Процесс (решено 15.09)

Страницы делаем по одной как отдельные артефакты **из одной общей базы**, интегрируем в сайт разом в конце. База растёт по ходу: новый компонент на странице → в базу. **Дизайн-система** — отдельный светлый документ без галактики и шапки сайта, единственный источник правды по токенам и компонентам.

Сборка: `build/build.py` (`python3 build.py cursor …` — собирает virtual-card, virtual-card-pv, styleguide, design-system, index, section ai, how и указанные сервисы):
- `base/head.html`, `base/base.css` (токены обеих тем + базовые компоненты + мобильный блок), `base/lib.css` (компоненты для остальных страниц: select/textarea/checkbox/radio/switch, tabs, pager, stepper, side-nav, user-chip, dropdown menu, drawer, icon-btn, карточки cat/svc/num/kpi/info/link/doc, accordion, check-marks, kv-chip, methods, qr, divider, note, dialog, tooltip — подключается на все страницы), `base/shell-top.html`, `base/footer.html`, `base/showcase.html`, `base/after.html`, `base/paybar.html`, `base/common.js`, `galaxy-bg.v58.js`.
- PrimeVue: `base/pv-preset.js` (`window.MARSCAP_PRESET` → `definePreset(Aura, …)`), `base/pv-bridge.css` (мост к виду Marscap), `pages/virtual-card-pv.html|js` (Vue 3.5.13 + PrimeVue 4.5.5 UMD + @primeuix/themes 1.2.5 с jsdelivr; `darkModeSelector: '.mc-dark'`, `cssLayer:false`).
- Дизайн-система: `pages/ds/00-shell, 01-foundations, 02-controls, 03-components, 04-templates.html`, `pages/ds.css|js`; `scheme_css()` в build.py генерирует токены обеих тем как классы для превью (`.ds[data-preview="dark"] .ds-demo`, `.ds-demo.is-dark/.is-light`). Выход `_proto/ds-marscap.html` (фрагмент для артефакта), копия полного документа — `_proto/design-system.html` в папке сайта.
- Выход: `_proto/vc.html`, `_proto/vc-primevue.html`, `_proto/service/<slug>.html`, `_proto/index.html`, `_proto/sec-<cid>.html`, `_proto/how.html`, `_proto/sg-marscap.html` (старая версия гайда), `_proto/ds-marscap.html`.

Проверка страниц: Playwright (`NODE_PATH=$(npm root -g)`), скриншоты 1400 и 390 (тестовую обёртку делать с `<meta name="viewport">`, иначе мобильный рендер не сработает); Google Fonts в контейнере не грузятся (фолбэк). Для CDN-библиотек — встроенный браузер  на вкладке cdn.jsdelivr.net (страницу можно вписать через `document.write` из gzip+base64). Перепубликация артефакта из другой сессии: сначала `Artifact read` по URL, потом publish.

## Страницы

| Страница | Артефакт | Статус |
|---|---|---|
| Дизайн-система | «Дизайн-система Marscap» v3 | v1.0, 16.09: 24 раздела — принципы; цвета, типографика, сетка, радиусы/тени/слои, движение, иконки; кнопки, поля, выбор, навигация (header+dropdown, drawer, crumbs, tabs, pager, stepper, side-nav, footer), карточки, таблицы/ведомости, статусы, сообщения/диалоги/тултип, загрузки, пустые, аккордеон/списки/QR; структура страницы, готовые блоки, карта страниц; PrimeVue-маппинг + пресет + nuxt.config, текст, доступность. Превью в обеих темах, кнопка «Код» у каждого демо. Git-бандл/zip для GitHub `Fridrix19/Marscap-design-system` — в `_proto/` (push из сессии заблокирован) |
| virtual-card | «Виртуальная карта Marscap» v20 | принят; мобильная версия (нижний таббар + лист «Ещё», липкая плашка оплаты), сжатые тексты, новый логотип |
| virtual-card · PrimeVue | «Виртуальная карта · PrimeVue» v2 | проверена в браузере 15.09: оба Vue-приложения монтируются, SelectButton/InputNumber/InputText/Button/Tabs/IconField/Toast работают, валидация, тост, светлая тема — 0 ошибок. Визуально совпадает с v13 (так задумано: пресет + мост). Копия `_proto/vc-primevue.html` в папке сайта |
| service/cursor | «Cursor AI — Marscap» v15 | принят; логотип в строке с h1 (`.svc-inline`), галактика на месте визуала (десктоп `cx .66 cy .42 size 2.4`, мобайл `m_cy .21 m_size .9`) |
| index | «Marscap — главная» v5 | сделана: hero с 3D-картой, категории (4 колонки, карта на 2), популярное, 4 шага + why, FAQ на всю ширину, поддержка + CTA. `pages/index.html|js|css` |
| catalog | «Каталог — Marscap» v1 | хаб: карта (широкая карточка) + 6 направлений (описание, 5 логотипов популярных, «+N», «от $X»), ниже поиск по всем 139 сервисам с чипами категорий (showcase, по 24). `pages/catalog.html|js|css`, `CATALOG_META` |
| section/* — все 6 | ai v6, games, entertainment, design, work, international | один шаблон `pages/section.html|js|css`; подкатегории и описания — `pages/section-<cid>.json` (все 139 сервисов покрыты), лиды — `SECTION_META`. Собираются с `base='../../'` |
| service/* — все 139 | без артефактов, только файлы `_proto/service/<slug>/index.html` | один шаблон, отдельный файл на сервис. `SVC_META` вручную только для cursor; остальным лид собирается из описания в section-json. 61 сервис с планами из `payment-flow.v2.js`, модель цены — см. раздел «Расчёт и тарифы»; заголовки/строки расчёта зависят от источника модели (`ORDER_TITLE`, `STEP1_*`, `ROW_PLAN_LABEL`). `python3 build.py all` собирает все в `_proto/service/<slug>.html` |
| support | «Поддержка — Marscap» v4 | выбор ситуации (6) → чек-лист + готовое обращение с подстановкой почты, Telegram/Max/mailto, копирование; каналы связи. `pages/support.html|js|css` |
| faq | «Частые вопросы — Marscap» v6 | 17 вопросов в 5 темах: поиск с подсветкой, фильтр, «Спросите нас», популярные (`#q-<id>`). `pages/faq.html|js|css` |
| contacts | «Контакты — Marscap» v4 | чипы тем → рекомендуемый канал, копирование адресов, статус онлайн по МСК (9–22), часы, реквизиты-заглушки (`LEGAL` в build.py). `pages/contacts.html|js|css` |
| how-it-works | «Как это работает — Marscap» v5 | сделана 16.09 (трасса в hero убрана, галактика как на сервисе): hero с неоновой трассой из 4 узлов (SVG-путь, бегущая искра, пульс узлов), интерактивные шаги с «экраном» (автопрокрутка 7 с, пауза при наведении, набор текста, псевдо-QR, степпер банка, письмо с мини-картой), схема «Вы → Marscap → Сервис» с бегущими частицами, анатомия письма с подсветкой по наведению, таймлайн + recovery, CTA. `pages/how.html|js|css`, `build_how()`, nav='how' (`{{CUR_HOW}}`), галактика десктоп `cx .815 cy .27 size 1.5`, мобайл `m_cx .8 m_cy .21 m_size .8` |
| login | «Вход и регистрация — Marscap» v1 | по ТЗ 8.2 «Вход/регистрация»: телефон/e-mail (автоопределение, маска +7), пароль (глазок, индикатор силы), OTP из 6 полей (автопереход, вставка, таймер повтора 59 с, маскированный контакт), вход по коду без пароля, восстановление → OTP → новый пароль, step-up 2FA (код приложения / SMS / резервный), экран успеха с устройством и временем, предложение включить 2FA после регистрации. Прототипные правила: 2FA у аккаунтов с «mfa» в контакте или телефоном на …77; пароль «wrong…» → ошибка; контакт с «taken» → занят; код 000000 → неверный. `pages/login.html|js|css`, nav='none', `#register` открывает вкладку регистрации, сессия пишется в `localStorage('mc-session')` |
| dashboard | «Личный кабинет — Marscap» v1 | по ТЗ 8.2, один файл с боковой навигацией и экранами по hash (`#overview`, `#new`, `#orders`, `#order:MC-1042`, `#cards`, `#payments[:refunds]`, `#kyc`, `#profile[:security|sessions|consents]`, `#support[:T-207|new]`, `#docs`), на мобильном — свой нижний бар (Обзор/Заказы/Заказ/Карты/Ещё) и лист «Ещё». Обзор: блок «требует действия» (заказ ждёт KYC, заказ ждёт оплаты, подозрительный вход), 4 KPI-кнопки, активные заказы с прогрессом, быстрый заказ (номиналы 50–200, `MC.charged`; поиск сервиса → страница сервиса), карты, уведомления. Новый заказ: 6 шагов (продукт → параметры → расчёт с требованиями → документы/KYC → hosted-оплата СБП → статус); демо-правило: ≥$150 требует расширенную верификацию. Заказы: фильтры/поиск, карточка с деталями, вертикальным таймлайном, квитанцией, действиями по статусу и «Написать по заказу» (тикет с привязкой). Карты: маскированные визуалы, «Показать реквизиты» через step-up код (любые 6 цифр кроме 000000) с автоскрытием через 60 с, заморозка, связанные заказы. Платежи (таблица, квитанция-модалка) и возвраты (запрос на платёж). Верификация: статус/уровни, hosted-проверка, drag&drop загрузка. Профиль: контакты (смена через код), пароль, 2FA с QR, устройства/сессии (подозрительная), согласия. Поддержка: тикеты, диалог, вложения, автоответ. Документы: принятые версии с историей акцепта, квитанции и акты. Без сессии — демо-режим; «Выйти» чистит `mc-session`. `pages/dashboard.html|js|css` (+ `login.css` для OTP/индикатора), `build_dashboard()`, nav='none', галактика слева внизу за боковой колонкой |
| buy/checkout (QR СБП), buy/status, pricing, documents, 404 | — | очередь. `roadmap` и `support-and-trust` — заглушки-дубли, не переносим |

## Мобильная версия (≤760px, принята 16.09)

Шапка скрыта, вместо неё `.m-top` (логотип + тема) и нижний `.tabbar` (Каталог / Карта / Как это / Поддержка / Ещё) с листом `#moreSheet` (FAQ, документы, вход, переключатель темы). На страницах с `class="config"` — липкая `.paybar` (итог + «Оплатить»), вставляется в build автоматически. Галактика на мобильном настраивается per-page (`m_cx`, `m_cy`, `m_size` в `assemble`); буфер canvas DPR-scaled, частицы уменьшены (`dotK`). Логотип `main_logotype.svg` (без подложки) — в шапке, `.m-top`, на лицевой стороне карты (белый).

## Навигация и структура прототипа (17.09)

`_proto/` в папке сайта повторяет структуру сайта: `index, catalog, virtual-card, how-it-works, support, faq, contacts, login, dashboard, design-system, vc-primevue.html`, `section/<id>/index.html`, `service/<slug>/index.html`, `legal-files/`. Все ссылки шапки, таббара, листа «Ещё», футера, крошек и карточек — реальные относительные; вложенные страницы собираются с `base='../../'` (`{{BASE}}` в шаблонах, `window.MC_BASE` для JS-ссылок на сервисы). Ещё не существующая цель: `pricing.html`. `background/galaxy/galaxy-bg.v58.js` в папке сайта обновлён (DPR-буфер, dotK).

Шапка: активный раздел — утопленная тёмно-синяя плашка с объёмными буквами и неоновой кромкой снизу; «Войти» — стеклянная кнопка с градиентной кромкой и иконкой; выбранные чипы-фильтры — синий градиент; на таббаре активный пункт — тёмная капсула за иконкой. Кнопки в подвале карточек (`.card-foot .btn`) всегда во всю ширину.

## Инвентарь оригинала (16.09)

index: hero + KPI, category-card, service-card, reason-card (6), step-card (4), faq-item (8), support-card (3). catalog/section: category-card, services-grid. how-it-works: flow-card, info-panel. pricing/roadmap: feature-card, mini-panel. support/contacts/documents: action-link-card, contacts-card, documents-card, hero-badges. buy/*: buy-step, payment-chip, payment-check, payment-qr-card, payment-summary. login: tabs, form-group, error. dashboard: sidebar, user-info, nav-link, logout. header: nav-dropdown, mobile-menu. Всё это покрыто в lib.css и в дизайн-системе.

## Темы

Тёмная по умолчанию; светлая — `html[data-mc-theme="light"]` + класс `mc-dark` для PrimeVue, выбор в `localStorage('mc-theme')`, ранний inline-скрипт в shell-top против мигания. Переключение гасит transition на кадр. Галактика в светлой теме — та же, через CSS `invert(1) hue-rotate(180deg) saturate(1.15)` на canvas. Карта всегда тёмно-синяя. Светлые логотипы в hero светлой темы — тёмная кромка drop-shadow, без подложки.

Светлые роли: bg #F5F7FB, panel #FDFDFF, surface #EDF0F6, surface-2 #E4E8EF, line #DBDEE5, line-strong #CACED6, text #0E1420, text-2 #384050, text-3 #596070, text-4 #5E6776, accent #0244BE (hover #1A5FE5), status ok #006B35 / warn #9A5B00 / err #B8262A.

## Расчёт и тарифы — 1:1 с исходником (сверено 19.09)

Источник правды — `payment-flow.v2.js`. Формула одна для всего (`computeChargedUsd`): `usd ≤ 45 → (usd + 5) × 1.2`, иначе `usd × 1.3`; пустое/0 → базовые $20; итог × курс ЦБ (в прототипе 80.2254, живой с cbr.ru). В базе — `MC.charged()`.
Модель цены сервиса (`get_model` в build.py = `getModel` в JS): **1)** workbook `SERVICE_PRICING` (65 записей; ключи `magicstudio/nightmare-ai/opus/weshop-ai` не совпадают со slug страниц — в оригинале они выпадали в дефолт, у нас привязаны через `WB_ALIAS`; все планы non-numeric → тип `reference`, «по запросу»: evernote, sentry) → **2)** `STATIC_MODELS` (39, файл `pages/static-models.json`; `behance` — free) → **3)** дефолт раздела `SECTION_DEFAULTS`: ai 20, work 15, design 15, entertainment 12, games 20, international «Покупка 50$». Итого по 139: workbook 63 + 2 reference, static 21 + 1 free, дефолт 52.
Виртуальная карта: номиналы **50 / 75 / 100 / 150 / 200**, произвольный **$50–$200** (как в `STATIC_MODELS['virtual-card']`), формула та же (≥$50 → ×1.3). Все тексты «от $5 до $500» заменены на $50–$200.
Цены в карточках разделов/каталога/«Популярное» считаются из модели (`all_prices` → `{v, m}`; « / мес» только если в priceText есть month/мес). Free-план в workbook (usd 0) считается как $20 → 2 407 ₽ — так в исходнике.

## Требования заказчика (14–16.09)

- Тёмно-синяя палитра; земля `#090D18`. Светлая тема с переключателем в шапке.
- Карта в hero 3D: вращается + левитирует. Галактика (v58) под картой: `data-cx-factor=.56 data-cy-factor=.74 data-dx=400 data-dy=-100`, мобайл `.5/.355`.
- Страница сервиса: логотип в строке с заголовком (размер заголовка), без рамки и подложки; галактика занимает место визуала.
- Иконки/изображения сервисов никогда не менять; светлые логотипы в плитках — на тёмной подложке (`icon-lum.json`).
- Кикеры — Inter 600, без черты. Onest — заголовки, Golos Text — текст, JetBrains Mono — только цифры.
- Блок оплаты = конфигуратор (покупка) + витрина сервисов (демонстрация с поиском, без покупки).
- Дизайн-система — официальный документ: без галактики и шапки, светлая тема, все компоненты новых и будущих страниц.
- Тексты — коротко и по делу, без «воды». Страница раздела изолирует свою категорию (никаких чужих категорий).
- Контентные страницы (how-it-works и т.п.) — не голый текст: интерактив, иконки, неон/свечение в рамках UI.

## Фон: galaxy v58 (принят)

`background/galaxy/galaxy-bg.v58.js` в папке сайта (drop-in, автозапуск, `if (running) return` в start). Статичные слои в offscreen, пакетная отрисовка, 30 fps, буфер 0.8× на десктопе и DPR (≤2) на мобильном, пауза при blur. Замер без GPU: 22,6 → 4,2 мс/кадр. Параметры canvas: `data-cx-factor`, `data-cy-factor`, `data-dx`, `data-dy`, `data-size` (масштаб), `data-dot` (размер частиц).

## Токены (тёмная) → PrimeVue `definePreset`

```
ink-950 #090D18  ink-900 #0E1420  ink-850 #171E2C  ink-800 #222A3A  ink-700 #384050
ink-600 #596070  ink-500 #7D8391  ink-400 #9FA5B0  ink-300 #C0C4CD  ink-200 #DBDEE5  ink-100 #EEF0F4
blue-700 #0244BE  blue-600 #1A5FE5  blue-500 #3D7EFC  blue-400 #699FFF  blue-300 #97BEFF  blue-200 #C2D8FF
cyan-300 #52CFF3  violet-400 #B082F7  ok-400 #63D18F  warn-400 #EEB154  err-400 #F97770  line #262E3D  line-strong #303848
```

## Аудит исходной страницы (14.09, кратко)

HIGH: футер 2.8:1; reduced-motion игнорируется (закрыто v58); главная кнопка disabled по умолчанию, 3.18:1; нет видимого h1 на мобильном. MEDIUM: две дизайн-системы (`mts-*` из JS), тема ломается при скролле, заголовки не убывают по уровню, контент дублируется трижды, копирайт «про сайт», CSS 734 КБ без токенов.

## Открытые вопросы

- Ролл-аут: статика или сразу Nuxt (рекомендация 16.09: TypeScript — Nuxt 3 + Nitro, Drizzle + PostgreSQL, Redis/BullMQ; Laravel не закреплён).
- Лиды и группировка планов для остальных 138 сервисов; подкатегории для остальных разделов (`section-<cid>.json`).
- Где живёт реальная оплата: `buy/checkout` — фронт-заглушка или ходит в Laravel `~/back`?
- GitHub push дизайн-системы — репозиторий нужно добавить в источники сессии.
