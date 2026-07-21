# QA — BACKFIRE (جلسة 2026-07-21)

## أدوات

- Build: `node apps/dasssite/build.mjs` → **نجح**.
- Typecheck: `tsc --noEmit -p apps/dasssite/tsconfig.json` → **نجح، بلا أخطاء**.
- Tests: `vitest run apps/dasssite` → **32/32 passed · 0 failed · 0 skipped** (4 ملفات).
- المتصفح: معاينة esbuild + خادم fallback محلي لمسارات الـSPA + لقطات Chrome headless (لأن أداة اللقطة المدمجة كانت تنتهي مهلتها — حسب ترتيب البدائل في المهمة).

## عدم وجود overflow أفقي (فحص DOM حقيقي)

مسح كل المسارات عبر موجّه الـSPA عند **320×568**. النتيجة: `scrollWidth = 320` لكل مسار، `overflowX = false`:

`/` · `/create` · `/join` · `/how-to-play` · `/modes` · `/modes/mode?id=majlis` · `/modes/mode?id=siege` · `/modes/mode?id=hotel` · `/faq` · `/about` · `/pricing` · مسار غير موجود (404).

> ملاحظة: عنصر SVG `path` واحد يتجاوز إطاره الهندسي داخل `viewBox` مقصوص — لا يسبب تمرير الصفحة (scrollWidth ثابت 320). ليس overflow حقيقيًا.

## الدقات المُلتقطة (لقطات في `after/`)

| الصفحة | سطح المكتب | الجوال |
|--------|-----------|--------|
| الرئيسية | `home-desktop.png` (1280) | `home-mobile.png` (390) · `home-320.png` (320) |
| كيف تلعب | `how-desktop.png` | `how-mobile.png` |
| الأطوار | `modes-desktop.png` | `modes-mobile.png` · `modes-320.png` |
| الأسئلة | `faq-desktop.png` | — |
| تفاصيل طور | `mode-detail-siege-desktop.png` | — |
| إنشاء / انضمام | `create-desktop.png` · `join-desktop.png` | — |

## RTL و H1 و الحالة المُعطّلة

- `dir=rtl` و `lang=ar` على مستوى المستند.
- **H1 واحد لكل صفحة** (مؤكّد عبر عدّ `main h1` = 1 على كل المسارات).
- أزرار العوالم القادمة الخمسة كلها «قريبًا» **مُعطّلة** (`disabled`) — بلا زر «ابدأ».
- لا أخطاء console على الرئيسية (فحص `onlyErrors`).

## الحركة المخفّفة (prefers-reduced-motion)

مُطبّقة في الثلاثة CSS (`site-theme`, `modes-css`, `product-css`). الكتلة تُلغي انتقالات `[data-reveal]` ورسم الخطوط والـspinner، وتضبط `opacity:1; transform:none` — أي **يبقى المحتوى كاملًا ومقروءًا** بلا حركة. إضافةً إلى مسار `.dass-reduced-motion` من إعدادات المنتج.

## الأسماء

- الأسماء المخترعة الخمسة: **0 نتيجة** في مصدر `.ts` وفي `bundle.js` بعد البناء.
- الأسماء الصحيحة الخمسة موجودة في `bundle.js`: هجوم العمالقة · لعبة الأصدقاء · كايجي · كود غياس · جوجوتسو كايسن.

## أمان اللعبة

لم تُلمَس `packages/backfire` ولا `apps/bftv` ولا `apps/bfplayer` ولا `apps/dassserver`. كل التغييرات داخل `apps/dasssite` (الموقع) + `.claude/launch.json`.
