---
trigger: model_decision
description: Guidelines for optimizing performance by minimizing client-side operations and using server-side rendering.
globs: **/*.{js,jsx,ts,tsx}
---
- Optimize Web Vitals (LCP, CLS, FID).
- Use dynamic loading for non-critical components using @src/components/dls/Spinner/Spinner.tsx