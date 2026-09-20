# ТЗ · адаптация сайта под mobile / tablet / iPad

## Цель
Собрать единый responsive-слой поверх текущего desktop-first интерфейса без дублирования страниц и без размножения CSS-файлов.

## Базовая архитектура
- База: `style.v60.css`
- Header logic: `components/header/header.js`
- Interactive layer: `script.v57.js`
- Принцип: desktop остается baseline, ниже добавляются breakpoint-override правила.

## Контрольные классы экранов
- Desktop XL: `1440+`
- Desktop / notebook: `1200–1439`
- Small desktop / tablet landscape: `992–1199`
- Tablet / iPad portrait: `768–991`
- Mobile large: `576–767`
- Mobile standard: `0–575`

## Scope адаптации
### 1. Header
- Сохранить единый desktop header как baseline.
- На `<=1080` отключить desktop-nav, search и desktop CTA внутри shell.
- На `<=1080` включить mobile menu.
- В mobile menu добавить:
  - поиск
  - CTA «Виртуальная карта»
  - базовые маршруты
- На mobile при открытом меню блокировать скролл body.

### 2. Hero / first screen
- Все hero-grid переводить в одну колонку на tablet/mobile.
- Текстовый блок всегда идет первым.
- Визуальный glass / galaxy-блок уходит ниже.
- Снижать min-height visual-части и паддинги карточек.

### 3. Карточные сетки
- `category-grid`, `services-grid`, `section-grid`, `service-grid`, `feature-grid`, `route-grid`, `buy-grid`
  - tablet: 2 колонки
  - mobile: 1 колонка
- Контроль высоты, паддингов, бейджей и декоративных visual-элементов.

### 4. Контентные страницы
- `contacts`, `support`, `faq`, `how-it-works`, `documents`, `virtual-card`
- На tablet/mobile все составные hero-grid и secondary-grid переводятся в 1 колонку.
- Нижние CTA и inline fields выравниваются по ширине контейнера.

### 5. Footer
- Desktop: 4 колонки
- Tablet: 2 колонки
- Mobile: 1 колонка

### 6. Touch behavior
- Hover-only сценарии не должны быть обязательными на touch-экранах.
- Dropdown каталога на desktop остается hover-first.
- На tablet/mobile пользователь работает через mobile menu.
- FAQ должен раскрываться по tap, а не через hover.

## Что сделано в первой итерации
- Добавлен единый responsive foundation в `style.v60.css`
- Добавлены breakpoints: `1280 / 1120 / 900 / 720 / 560 / 420 / 767`
- Header mobile menu перестроен: поиск + CTA + список маршрутов
- Body lock при открытом mobile menu
- Hero-grid переведены в одну колонку на tablet/mobile
- Карточные сетки переведены в 2/1 колонки по классам экранов
- Footer переведен в 2/1 колонки
- Mobile dock ограничен мобильным диапазоном

## Контрольный QA-чеклист
Проверять в DevTools по ширинам:
- `390 x 844`
- `430 x 932`
- `768 x 1024`
- `820 x 1180`
- `1024 x 768`
- `1366 x 768`
- `1440 x 900`

### Приоритет проверки
1. `index.html`
2. `catalog.html`
3. `virtual-card.html`
4. `contacts.html`
5. `support.html`
6. `faq.html`
7. `documents.html`

## Формат замечаний
`ширина / страница / блок / что сломано`

Пример:
- `390 / index / hero / кнопка ушла под бейджи`
- `768 / contacts / cards / кнопки не на одном уровне`
- `1024 / header / menu / shell слишком высокий`
