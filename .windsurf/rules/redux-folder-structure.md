---
trigger: model_decision
description: Enforces specific folder structure conventions within the Redux store directory.
globs: src/redux/**/*
---
- Follow this folder structure:
  src/
    redux/
      actions/
      slices/
      RootState.ts
      store.ts
      migrations.ts