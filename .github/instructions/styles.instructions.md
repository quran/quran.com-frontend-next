---
applyTo: '**/*.scss,**/*.module.scss'
---

# SCSS Styling Review Standards

Guidelines for styling in the Quran.com frontend.

## File Structure

- Each component should have its own `.module.scss` file
- Flag shared stylesheets that should be component-specific
- Co-locate styles with their components

## Responsive Design

- Use CSS media queries for responsive styling
- Flag JavaScript-based responsive logic that should be CSS
- Ensure mobile-first approach

```scss
// Good - CSS media queries
.container {
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

// Bad - should not rely on JS for this
```

## RTL Support

- Use logical CSS properties for RTL compatibility
- Flag physical directional properties

```scss
// Good
.icon {
  margin-inline-end: 0.5rem;
}

// Bad - breaks RTL
.icon {
  margin-right: 0.5rem;
}
```

## Design Tokens

- Use CSS variables for colors, spacing, and typography
- Flag hardcoded color values
- Ensure consistency with design system

```scss
// Good
.text {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

// Bad - hardcoded values
.text {
  color: #333333;
  font-size: 16px;
}
```

## Naming Conventions

- Use descriptive class names
- Follow BEM-like naming when appropriate
- Flag overly generic class names

## Layout Shifts

- Ensure elements have explicit dimensions when needed
- Flag layouts that may cause CLS (Cumulative Layout Shift)
- Use aspect-ratio for media containers
