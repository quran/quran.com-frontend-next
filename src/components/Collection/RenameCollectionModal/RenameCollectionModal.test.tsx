/* eslint-disable react/no-multi-comp */
import React from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RenameCollectionModal from './RenameCollectionModal';

import { RuleType } from 'types/FieldRule';

let capturedFormFields: Array<{ field: string; defaultValue?: string; rules?: unknown[] }> = [];
let capturedOnSubmit: ((data: { name: string }) => void) | undefined;

vi.mock('@/components/FormBuilder/FormBuilder', () => ({
  default: ({ formFields, onSubmit }) => {
    capturedFormFields = formFields;
    capturedOnSubmit = onSubmit;
    return <div data-testid="form-builder" />;
  },
}));

vi.mock('@/dls/Modal/Modal', () => {
  const Modal = ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null);
  Modal.Body = ({ children }) => <div>{children}</div>;

  return { default: Modal };
});

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === 'common:errors.min') return `MIN_${params?.min}`;
      if (key === 'common:errors.max') return `MAX_${params?.max}`;
      if (key === 'common:errors.required') return `REQUIRED_${params?.fieldName}`;
      if (key === 'collection:collection-name') return 'Collection name';
      return key;
    },
  }),
}));

afterEach(() => {
  cleanup();
  capturedFormFields = [];
  capturedOnSubmit = undefined;
});

describe('RenameCollectionModal', () => {
  it('applies required + min(1) + max(255) + non-whitespace validation rules to name field', () => {
    render(
      <RenameCollectionModal
        isOpen
        defaultValue="My collection"
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(capturedFormFields).toHaveLength(1);
    expect(capturedFormFields[0].field).toBe('name');
    expect(capturedFormFields[0].defaultValue).toBe('My collection');
    expect(capturedFormFields[0].rules).toEqual([
      { type: RuleType.Required, value: true, errorMessage: 'REQUIRED_Collection name' },
      { type: RuleType.MinimumLength, value: 1, errorMessage: 'MIN_1' },
      { type: RuleType.MaximumLength, value: 255, errorMessage: 'MAX_255' },
      {
        name: 'hasNonWhitespace',
        type: RuleType.Regex,
        value: '\\S',
        errorMessage: 'REQUIRED_Collection name',
      },
    ]);
  });

  it('trims the submitted name before forwarding it', () => {
    const onSubmit = vi.fn();
    render(
      <RenameCollectionModal
        isOpen
        defaultValue="My collection"
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    );

    expect(capturedOnSubmit).toBeDefined();
    capturedOnSubmit?.({ name: '  New name  ' });

    expect(onSubmit).toHaveBeenCalledWith({ name: 'New name' });
  });

  it('does not submit whitespace-only names', () => {
    const onSubmit = vi.fn();
    render(
      <RenameCollectionModal
        isOpen
        defaultValue="My collection"
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    );

    expect(capturedOnSubmit).toBeDefined();
    capturedOnSubmit?.({ name: '   ' });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
