/* eslint-disable react/no-multi-comp */
import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EditCollectionModal from './EditCollectionModal';

vi.mock('@/dls/Button/Button', () => {
  const Button = ({ children, isDisabled, onClick }) => (
    <button type="button" onClick={onClick} disabled={isDisabled}>
      {children}
    </button>
  );

  return {
    default: Button,
    ButtonType: { Primary: 'primary', Secondary: 'secondary' },
    ButtonSize: { Medium: 'medium' },
  };
});

vi.mock('@/dls/Modal/Modal', () => {
  const Modal = ({ isOpen, children }) => (isOpen ? <div>{children}</div> : null);
  Modal.Body = ({ children }) => <div>{children}</div>;

  return { default: Modal };
});

vi.mock('@/icons/close.svg', () => ({
  default: () => <svg data-testid="close-icon" />,
}));

vi.mock('next-translate/useTranslation', () => ({
  default: (namespace?: string) => ({
    t: (key: string) => `${namespace ? `${namespace}:` : ''}${key}`,
  }),
}));

afterEach(() => {
  cleanup();
});

const makeProps = (overrides: Partial<React.ComponentProps<typeof EditCollectionModal>> = {}) => ({
  isOpen: true,
  defaultValue: '',
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  ...overrides,
});

describe('EditCollectionModal', () => {
  it('disables submit for empty and whitespace-only names', () => {
    const { rerender } = render(<EditCollectionModal {...makeProps()} />);
    expect(screen.getByRole('button', { name: 'common:edit' }).hasAttribute('disabled')).toBe(true);

    rerender(<EditCollectionModal {...makeProps({ defaultValue: '   ' })} />);
    expect(screen.getByRole('button', { name: 'common:edit' }).hasAttribute('disabled')).toBe(true);
  });

  it('enables submit for valid names and disables for values over 255 chars', () => {
    const { rerender } = render(<EditCollectionModal {...makeProps({ defaultValue: 'abc' })} />);
    expect(screen.getByRole('button', { name: 'common:edit' }).hasAttribute('disabled')).toBe(
      false,
    );

    rerender(<EditCollectionModal {...makeProps({ defaultValue: 'a'.repeat(256) })} />);
    expect(screen.getByRole('button', { name: 'common:edit' }).hasAttribute('disabled')).toBe(true);
  });

  it('sets maxLength=255 on the input', () => {
    render(<EditCollectionModal {...makeProps({ defaultValue: 'abc' })} />);
    expect(screen.getByLabelText('common:form.title:').getAttribute('maxLength')).toBe('255');
  });

  it('submits trimmed name on Enter when valid and blocks invalid values', () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <EditCollectionModal {...makeProps({ defaultValue: '  Valid Name  ', onSubmit })} />,
    );

    fireEvent.keyDown(screen.getByLabelText('common:form.title:'), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Valid Name' });

    const invalidSubmit = vi.fn();
    rerender(
      <EditCollectionModal
        {...makeProps({ defaultValue: 'a'.repeat(256), onSubmit: invalidSubmit })}
      />,
    );
    fireEvent.keyDown(screen.getByLabelText('common:form.title:'), { key: 'Enter' });
    expect(invalidSubmit).not.toHaveBeenCalled();
  });
});
