---
applyTo: '**/*.ts,**/*.tsx'
---

# TypeScript Code Review Standards

Guidelines for TypeScript code reviews specific to the Quran.com frontend.

## Type Safety

- Flag any usage of `any` type - suggest `unknown` or specific types instead
- Require explicit return types for all exported/public functions
- Flag implicit `any` in function parameters
- Ensure strict null checks are handled properly

## Interface vs Type

- Prefer `interface` for object shape definitions
- Use `type` only for unions, intersections, and mapped types
- Flag `type` usage where `interface` is more appropriate

```typescript
// Good
interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
}

// Bad
type UserPreferences = {
  theme: 'light' | 'dark';
  fontSize: number;
};
```

## Enums for Constants

- Require enums when the same raw values appear multiple times
- Flag repeated string/number literals that should be enums

```typescript
// Good
enum ReadingMode {
  READING = 'reading',
  TRANSLATION = 'translation',
  LISTENING = 'listening',
}

// Bad - repeated strings
const mode1 = 'reading';
const mode2 = 'translation';
```

## Naming Conventions

- Use `PascalCase` for types, interfaces, enums, and components
- Use `camelCase` for variables, functions, and methods
- Use `UPPER_SNAKE_CASE` for constants
- Prefix Props interfaces with component name: `ButtonProps`, `ModalProps`

## Error Handling

- Flag unhandled Promise rejections
- Require try-catch blocks for async operations
- Ensure error types are properly typed, not `any`

```typescript
// Good
try {
  const data = await fetchVerses(chapterId);
  return data;
} catch (error) {
  logError('Failed to fetch verses', error);
  return fallbackData;
}

// Bad - no error handling
const data = await fetchVerses(chapterId);
return data;
```

## Imports

- Flag unused imports
- Ensure imports are alphabetized within groups
- Group order: React → External packages → Internal modules → Types
