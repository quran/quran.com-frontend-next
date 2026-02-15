import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import NewCollectionForm from './NewCollectionForm';

vi.mock('@/dls/Button/Button', () => {
  const Button = ({ children, isDisabled, onClick, isLoading, ...props }) => (
    <button {...props} type="button" onClick={onClick} disabled={isDisabled || isLoading}>
      {children}
    </button>
  );

  return {
    default: Button,
    ButtonSize: { Medium: 'medium' },
    ButtonType: { Primary: 'primary' },
    ButtonVariant: { Outlined: 'outlined' },
  };
});

vi.mock('@/icons/chevron-left.svg', () => ({
  default: () => <svg data-testid="chevron-left-icon" />,
}));

vi.mock('@/icons/close.svg', () => ({
  default: () => <svg data-testid="close-icon" />,
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key }),
}));

const makeProps = (overrides: Partial<React.ComponentProps<typeof NewCollectionForm>> = {}) => ({
  newCollectionName: '',
  isSubmittingCollection: false,
  onNameChange: vi.fn(),
  onBack: vi.fn(),
  onCancel: vi.fn(),
  onCreate: vi.fn().mockResolvedValue(undefined),
  onClose: vi.fn(),
  ...overrides,
});

afterEach(() => {
  cleanup();
});

describe('NewCollectionForm', () => {
  it('disables create when name is empty or whitespace', () => {
    const { rerender } = render(<NewCollectionForm {...makeProps()} />);

    expect(screen.getByRole('button', { name: 'create' }).hasAttribute('disabled')).toBe(true);

    rerender(<NewCollectionForm {...makeProps({ newCollectionName: '   ' })} />);
    expect(screen.getByRole('button', { name: 'create' }).hasAttribute('disabled')).toBe(true);
  });

  it('enables create for valid length and disables when name exceeds 255 chars', () => {
    const { rerender } = render(<NewCollectionForm {...makeProps({ newCollectionName: 'a' })} />);

    expect(screen.getByRole('button', { name: 'create' }).hasAttribute('disabled')).toBe(false);

    rerender(<NewCollectionForm {...makeProps({ newCollectionName: 'a'.repeat(256) })} />);
    expect(screen.getByRole('button', { name: 'create' }).hasAttribute('disabled')).toBe(true);
  });

  it('sets maxLength to 255 on the collection name input', () => {
    render(<NewCollectionForm {...makeProps()} />);
    expect(screen.getByLabelText('form.title:').getAttribute('maxLength')).toBe('255');
  });

  it('propagates input changes through onNameChange', () => {
    const onNameChange = vi.fn();
    render(<NewCollectionForm {...makeProps({ onNameChange })} />);

    fireEvent.change(screen.getByLabelText('form.title:'), {
      target: { value: 'My collection' },
    });

    expect(onNameChange).toHaveBeenCalledWith('My collection');
  });

  it('submits on Enter when collection name is valid', () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<NewCollectionForm {...makeProps({ newCollectionName: 'a', onCreate })} />);

    fireEvent.keyDown(screen.getByLabelText('form.title:'), { key: 'Enter' });

    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('does not submit on Enter when invalid or submitting', () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <NewCollectionForm {...makeProps({ newCollectionName: 'a'.repeat(256), onCreate })} />,
    );

    fireEvent.keyDown(screen.getByLabelText('form.title:'), { key: 'Enter' });
    expect(onCreate).not.toHaveBeenCalled();

    rerender(
      <NewCollectionForm
        {...makeProps({ newCollectionName: 'Valid name', isSubmittingCollection: true, onCreate })}
      />,
    );

    fireEvent.keyDown(screen.getByLabelText('form.title:'), { key: 'Enter' });
    expect(onCreate).not.toHaveBeenCalled();
  });
});
