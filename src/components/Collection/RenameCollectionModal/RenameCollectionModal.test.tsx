/* eslint-disable react/no-multi-comp */
import React from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RenameCollectionModal from './RenameCollectionModal';

import { RuleType } from 'types/FieldRule';

let capturedFormFields: Array<{ field: string; defaultValue?: string; rules?: unknown[] }> = [];

vi.mock('@/components/FormBuilder/FormBuilder', () => ({
  default: ({ formFields }) => {
    capturedFormFields = formFields;
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
      if (key === 'collection:collection-name') return 'Collection name';
      return key;
    },
  }),
}));

afterEach(() => {
  cleanup();
  capturedFormFields = [];
});

describe('RenameCollectionModal', () => {
  it('applies required + min(1) + max(255) validation rules to name field', () => {
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
      { type: RuleType.Required, value: true, errorMessage: 'Required' },
      { type: RuleType.MinimumLength, value: 1, errorMessage: 'MIN_1' },
      { type: RuleType.MaximumLength, value: 255, errorMessage: 'MAX_255' },
    ]);
  });
});
