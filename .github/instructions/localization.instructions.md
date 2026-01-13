---
applyTo: 'src/components/**/*.tsx,src/pages/**/*.tsx'
---

# Localization Review Standards

Guidelines for internationalization in the Quran.com frontend.

## Text Content

- Flag ALL hardcoded user-facing strings - must use `next-translate`
- Only English locale files should be modified - other locales use Lokalise

```tsx
// Good
import useTranslation from 'next-translate/useTranslation';

const { t } = useTranslation('common');
return <p>{t('verse.bookmark-added')}</p>;

// Bad - hardcoded string
return <p>Bookmark added successfully</p>;
```

## Translation Keys

- Use descriptive, hierarchical key names
- Group related translations under common prefixes

```typescript
// Good
t('reading.settings.font-size');
t('reading.settings.theme');

// Bad
t('fontSize');
t('themeOption');
```

## RTL Support

- Flag CSS that may break RTL layouts
- Use logical properties instead of physical ones
- Ensure text alignment respects direction

```scss
// Good - logical properties
margin-inline-start: 1rem;
padding-inline-end: 0.5rem;

// Bad - physical properties (breaks RTL)
margin-left: 1rem;
padding-right: 0.5rem;
```

## Dynamic Content

- Ensure interpolation is used for dynamic values in translations
- Flag string concatenation with translated text

```typescript
// Good
t('verse.ayah-number', { number: verseNumber });

// Bad - string concatenation
t('verse.ayah') + ' ' + verseNumber;
```
