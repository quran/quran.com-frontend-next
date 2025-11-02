import React, { useCallback, useRef } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';

import styles from './Card.module.scss';

interface CardProps {
  children: React.ReactNode;
  link?: string;
  isNewTab?: boolean;
  className?: string;
  linkClassName?: string;
  onClick?: () => void;
  shouldPrefetch?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  link,
  isNewTab = false,
  className,
  linkClassName,
  onClick,
}) => {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  /**
   * Determine if an event target is a nested interactive element that should keep control.
   */
  const shouldIgnoreEvent = useCallback(
    (target: EventTarget | null) => {
      if (!link) return false;
      if (!(target instanceof HTMLElement)) return false;
      if (!cardRef.current) return false;
      const interactiveElement = target.closest(
        'a, button, input, textarea, select, [role="button"], [role="link"]',
      );
      return Boolean(interactiveElement && interactiveElement !== cardRef.current);
    },
    [link],
  );

  /**
   * Trigger navigation using Next.js for internal routes or the browser for external URLs.
   */
  const navigate = useCallback(() => {
    if (!link) return;

    if (isNewTab) {
      if (typeof window !== 'undefined') {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    const isInternal = link.startsWith('/') || link.startsWith('#');

    if (isInternal) {
      router.push(link);
      return;
    }

    if (typeof window !== 'undefined') {
      window.location.href = link;
    }
  }, [isNewTab, link, router]);

  /**
   * Handle mouse clicks on the card while respecting nested controls.
   */
  const handleCardClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!link) {
        onClick?.();
        return;
      }

      onClick?.();

      if (event.defaultPrevented || shouldIgnoreEvent(event.target)) return;

      event.preventDefault();

      navigate();
    },
    [link, navigate, onClick, shouldIgnoreEvent],
  );

  /**
   * Provide keyboard accessibility for the card when it acts like a link.
   */
  const handleCardKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!link) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.();
        navigate();
      }
    },
    [link, navigate, onClick],
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={cardRef}
      role={link ? 'link' : undefined}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={link ? 0 : undefined}
      className={classNames(
        styles.card,
        className,
        { [styles.cardWithLink]: Boolean(link) },
        link ? linkClassName : undefined,
      )}
      onClick={link ? handleCardClick : onClick}
      onKeyDown={link ? handleCardKeyDown : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
