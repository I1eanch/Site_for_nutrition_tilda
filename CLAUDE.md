# CLAUDE.md

Guidance for Claude Code working in **Tilda-форке** проекта «Сам себе нутрициолог».

## Что это за репо

**Форк** основного проекта `Site_for_nutrition`, адаптированный для встраивания в Tilda через iframe. Основной проект (`I1eanch/Site_for_nutrition`) живёт независимо; форк сделан по принципу «ничего не трогать в основном». Все правки для Tilda-версии делаются только здесь.

Тот же код Astro, но:
- Цены переведены в рубли (₽), тенге и доллары убраны
- Кнопки тарифов ведут на checkout-URL `iandmyhealth.ru/kyrs/*`
- Добавлен билд-скрипт `build-tilda.mjs`, который превращает `dist/` в готовый для iframe `tilda-dist/full-page.html` с инлайн CSS/JS и ссылками на jsDelivr/GitHub Pages
- Button-компонент поддерживает проп `target` (нужен `target="_top"` для кликов через iframe)

## Три репо в системе

| Репо | Назначение |
|---|---|
| `I1eanch/Site_for_nutrition` | Основной проект, **не трогаем** |
| `I1eanch/Site_for_nutrition_tilda` (этот) | Исходники Tilda-версии |
| `I1eanch/nutrition-tilda-assets` | Публичный хостинг: `page.html` + картинки, раздаётся через GitHub Pages и jsDelivr |

## Как это собрано (архитектура)

```
Astro src/ → npm run build → dist/
            ↓
         node build-tilda.mjs
            ↓
         tilda-dist/
           ├ full-page.html  (→ залить в nutrition-tilda-assets как page.html)
           └ tilda-t123-iframe.html  (→ вставить в T123 блок Tilda)
```

- `full-page.html` инлайнит Tailwind CSS и два GSAP-скрипта, GSAP тянется с cdn.jsdelivr.net, картинки — с cdn.jsdelivr.net/gh/I1eanch/nutrition-tilda-assets/
- GitHub Pages отдаёт `page.html` по адресу `https://i1eanch.github.io/nutrition-tilda-assets/page.html` с правильным `Content-Type: text/html`
- На Tilda-странице стоит T123-блок с iframe, указывающим на этот URL
- iframe общается с родительской Tilda через `postMessage`:
  - `{type:'ssn-iframe-height', height: N}` — iframe сообщает свою высоту → обёртка ресайзит iframe-элемент
  - `{type:'ssn-iframe-scroll', y: N}` — клик по якорю внутри iframe → обёртка скроллит родительскую страницу

Файл `tilda-dist/tilda-t123-iframe.html` — это содержимое T123-блока на Tilda: iframe + `<script>`-мост для postMessage. При изменениях этого моста — обновить блок в Tilda **руками**.

## Команды

```bash
npm run dev         # dev-сервер (проверка локально)
npm run build       # production-сборка Astro → dist/
node build-tilda.mjs  # превращает dist/ в tilda-dist/
```

Нет тестов, линтеров, CI.

## Процесс обновления контента

1. Правим `.astro` в `src/components/`
2. `npm run build && node build-tilda.mjs`
3. Пушим `tilda-dist/full-page.html` в `nutrition-tilda-assets` как `page.html` (есть скрипт-заготовка в истории чата — обычный git clone → cp → commit → push)
4. GitHub Pages пересобирается ~1 минуту
5. Tilda-страница подтягивается автоматически (может потребоваться хард-релоад для браузерного кэша)

Содержимое T123-блока **обновлять руками** только если меняется `tilda-t123-iframe.html` (редко — это тонкая обёртка iframe).

## Известные ограничения iframe-подхода

- **SEO = 0.** Поисковики видят пустую Tilda-страницу с iframe. Для SEO-трафика подход не годится — только для платного/соцсетей.
- **Формы.** CTA-кнопки `#pricing` — это якоря, не реальные формы. Кнопки тарифов ведут на checkout внешнего домена. Если нужна форма заявки — либо добавить внутрь iframe, либо вынести на отдельную Tilda-страницу с нативным T-Form.
- **Аналитика Tilda** (Metrika, GA в настройках страницы) трекает только Tilda-обёртку, не внутренность iframe. Счётчик нужен **внутри** iframe — добавить в `Layout.astro` или через `build-tilda.mjs`.
- **OG-теги и meta** для соцсетей — задаются в настройках Tilda-страницы (HTML-код в HEAD), а не из нашего HTML.
- **Три точки отказа**: tilda.ws + github.io + cdn.jsdelivr.net. Падение любого → частичная поломка.
- **Made on Tilda** штамп внизу — убирается только на платном тарифе Tilda.

## Навигация и GSAP внутри iframe

- Все `.rv` и `.stagger-grid > *` форсированы в `opacity: 1 !important` через CSS в `build-tilda.mjs` — ScrollTrigger не работает внутри iframe со `scrolling="no"` (родитель скроллит, iframe стоит на месте), поэтому GSAP-анимации появления отключены. Контент показывается сразу без плавного reveal.
- Якорные клики (`a[href^="#"]`) перехватываются в iframe, считается `getBoundingClientRect().top + scrollY` целевого элемента, отправляется в родителя через `postMessage`. Родитель скроллит `window` к `iframe.offsetTop + y - 70` (70 = запас под Tilda-шапку).
- Кнопки тарифов имеют `target="_top"` — открывают checkout в родительском окне, заменяя Tilda+iframe. Иначе checkout грузится внутри iframe с шапкой Tilda сверху.

## Цены (важно при правках)

Все цены в **рублях**, без валютных альтернатив:

| Где | Старая цена (перечёркнута) | Акционная |
|---|---|---|
| Pricing, тариф «Самостоятельный» | 47 980 ₽ | **23 990 ₽** |
| Pricing, тариф «С поддержкой кураторов» | 59 980 ₽ | **29 990 ₽** |
| Сравнительная карточка «Программа» | 59 980 ₽ | 29 990 ₽ |
| FinalCTA | 59 980 ₽ | 29 990 ₽ |
| «Путь по кругу» | 8 000+ / 5 000+ / 10 000+ / 4 000+ / Итого 27 000+ ₽ | — |

**Не трогалось:** `src/pages/legal/oferta.astro` — там остались тенге (юридический документ, правки только с согласованием).

Checkout-URL'ы:
- Самостоятельный: `https://iandmyhealth.ru/kyrs/samnytri`
- С поддержкой: `https://iandmyhealth.ru/kyrs/samnytr`

## Структура исходников

Проект использует **Astro 6 + Tailwind CSS v4 + GSAP** (ScrollTrigger). Архитектура идентична основному проекту.

- `src/pages/index.astro` — главная страница, собирает секции в AIDA-нарративе
- `src/components/` — по одному `.astro` на секцию
- `src/components/ui/Button.astro` — кнопка с пропами `variant` (primary/brand/outline/ghost), `href`, `target`, `fullWidth`
- `src/layouts/Layout.astro` — обёртка: meta, шрифты, GSAP-инициализация
- `src/styles/global.css` — Tailwind `@theme` с дизайн-токенами
- `build-tilda.mjs` — сборщик Tilda-версии (CSS/JS инлайн, картинки → jsDelivr, добавляется postMessage-мост)
- `tilda-dist/` — выход `build-tilda.mjs`, в git игнорится

## Порядок секций — нарратив

Nav → Hero → Pain `#symptoms` → Insight → Results → Program `#program` → Format → Bonuses → About `#about` → Speakers → Pricing `#pricing` → FAQ → FinalCTA → Footer

Перестановка ломает AIDA-нарратив. Навигация якорно связана с `#symptoms`, `#program`, `#about`, `#pricing`.

## Дизайн-токены

Все токены в `src/styles/global.css` `@theme`:
- `--color-brand` `#18E299` — акцент, CTA
- `--color-brand-deep` `#0fa76e` — тёмный акцент
- `--color-primary` `#0d0d0d` — текст, тёмные карточки
- `--color-gray-*`, `--color-red-soft`, `--color-green-soft`, `--color-border`, `--color-border-md`

Правило: использовать Tailwind-утилиты с токенами (`bg-brand`, `text-primary`), не хардкодить hex.

**Типографика:** Inter 400–800, Geist Mono 400–600 — через Google Fonts в `Layout.astro`.
**Tracking-токены:** `--tracking-display/section/subhead/mono/label` через `tracking-[--tracking-*]`.

## Принципы работы с контентом

- **Нарратив «одна причина — много симптомов»** — якорь оффера. Тексты hero/insight/FAQ/finalCTA должны его поддерживать.
- **Медицинские заявления** (кейсы в Results) юридически чувствительны. Не усиливать без согласования.
- **Язык болей (Pain)** — от первого лица клиента. Сохранять голос («стыдно…», «врезаются…»), не клинические термины.

## Домен и публикация на Tilda

- Тестовый URL: `https://learn-majestic-nightjar.tilda.ws/`
- Основной домен (в настройке): `nutrmyself.iandmyhealth.ru` — A-запись должна указывать на `176.57.67.34`, SSL Tilda выпускает автоматически через Let's Encrypt
- При подключении домена важно: Cloudflare-прокси выключить (серое облачко), иначе Tilda не сможет выпустить свой SSL и будет конфликт с Cloudflare-сертификатом

## Мобильные устройства

- Адаптив внутри iframe работает за счёт Tailwind responsive-классов (`max-md:*` на 768px)
- При повороте устройства ResizeObserver в iframe пересчитывает высоту и шлёт новое значение в Tilda-обёртку
- iOS Safari 15+ ок; на Safari 14 и ниже `scrolling="no"` может глючить
- Первый рендер на мобильном ~2–4 сек на 3G (Tilda + iframe + GSAP с CDN + картинки)

## Язык общения

Пользователь требует отвечать **всегда на русском языке**. Код, пути, имена файлов и команды — остаются как есть.
