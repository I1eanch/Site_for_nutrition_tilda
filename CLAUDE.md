# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Проект

Одностраничный лендинг для онлайн-программы **«Сам себе нутрициолог»** (Академия натуропатии «Система здоровья», автор — Марина Жигульская). Коммерческая цель — продажа 30-дневной программы восстановления здоровья женщинам 40+.

## Команды

```bash
npm run dev       # запуск dev-сервера (Astro)
npm run build     # production-сборка → dist/
npm run preview   # предпросмотр production-сборки
```

Нет тестов, линтеров, CI. Проверка — визуально в браузере.

## Структура

Проект использует **Astro 6 + Tailwind CSS v4 + GSAP** (ScrollTrigger).

- `src/pages/index.astro` — единственная страница, собирает секции в AIDA-нарративе
- `src/components/` — по одному `.astro`-компоненту на секцию лендинга
- `src/components/ui/` — переиспользуемые UI-примитивы: `Button.astro` (4 варианта: primary/brand/outline/ghost), `Badge.astro`, `SectionLabel.astro`
- `src/layouts/Layout.astro` — обёртка: meta, шрифты, GSAP-инициализация (scroll-reveal `.rv`, stagger `.stagger-grid`, counter `[data-count]`, hero glow)
- `src/styles/global.css` — Tailwind `@theme` с дизайн-токенами, FAQ-аккордеон, табы
- `src/assets/` — фото спикеров и фоновые изображения секций
- `Reference.html` — **эталонный макет** (исходный монолитный HTML). Используется как справочник по контенту и структуре; НЕ обслуживается Astro
- `Маркетинговый_аудит.md` — подробный аудит лендинга с приоритизированным планом правок
- `Exphoto/` — исходные фотографии спикеров и автора

## Порядок секций — это нарратив

Структура следует AIDA + StoryBrand. **Перестановка секций ломает нарратив:**

Nav → Hero → Pain `#symptoms` → Insight → Results → Program `#program` → Format → Bonuses → About `#about` → Speakers → Pricing `#pricing` → FAQ → FinalCTA → Footer

Навигация якорно связана с `#symptoms`, `#program`, `#about`, `#pricing`.

## Стек и дизайн-токены

**Tailwind CSS v4** через `@tailwindcss/vite`. Все токены в `src/styles/global.css` `@theme`:
- `--color-brand` `#18E299` — основной акцент, CTA
- `--color-brand-deep` `#0fa76e` — тёмный акцент
- `--color-primary` `#0d0d0d` — текст, тёмные карточки
- `--color-gray-*` — нейтральная шкала (50–900)
- `--color-red-soft`, `--color-green-soft` — до/после, бейджи скидок
- `--color-border`, `--color-border-md` — полупрозрачные рамки

**Правило:** для новых элементов **всегда использовать Tailwind-утилиты с токенами** (`bg-brand`, `text-primary`, `border-border-md`), не хардкодить hex.

**Типографика:** Inter (400–800) для текста, Geist Mono для моно-меток. Подключены через Google Fonts в `Layout.astro`.

**Tracking-токены:** `--tracking-display`, `--tracking-section`, `--tracking-subhead`, `--tracking-mono`, `--tracking-label` — применяются через `tracking-[--tracking-*]`.

## Анимации (GSAP)

Вся инициализация GSAP — в `<script>` внутри `Layout.astro`:
- `.rv` — scroll-reveal (opacity + translateY, once)
- `.stagger-grid` — дочерние элементы появляются с задержкой
- `[data-count]` — счётчик-анимация цифр
- `.hero-glow` — пульсирующий зелёный градиент в hero

Добавление новых анимаций: либо расширять скрипт в `Layout.astro`, либо писать `<script>` в конкретном компоненте. Библиотеки кроме GSAP не тянуть.

## Принципы работы с контентом

Проект — **коммерческий лендинг**, изменения в текстах оцениваются с маркетинговой точки зрения:

- **Нарратив «одна причина — много симптомов»** — якорь всего оффера. Тексты в hero, insight, FAQ, final-CTA должны поддерживать эту идею. Не размывать её.
- **Медицинские заявления** (кейсы в Results, про «операцию не понадобилась», «узлы рассосались») юридически чувствительны. Не усиливать формулировки без согласования.
- **Язык болей** (Pain) написан от первого лица клиента — при добавлении новых симптомов сохранять голос («стыдно…», «врезаются…», «к вечеру нет сил…»), не клинические термины.
- **Цены указаны в ₸/₽/$** — при правке одной суммы обновлять все три валюты одновременно (см. `Pricing.astro`).

## Язык общения

Пользователь требует отвечать **всегда на русском языке**. Код, пути, имена файлов и команды — остаются как есть.