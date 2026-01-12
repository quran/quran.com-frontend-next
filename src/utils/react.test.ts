import * as React from 'react';

import { it, expect, describe, vi } from 'vitest';

import mergeRefs from '@/utils/react';

// eslint-disable-next-line react-func/max-lines-per-function
describe('mergeRefs', () => {
  it('should merge function refs', () => {
    const ref1 = vi.fn();
    const ref2 = vi.fn();
    const mergedRef = mergeRefs(ref1, ref2);
    const node = document.createElement('div');

    mergedRef(node);

    expect(ref1).toHaveBeenCalledWith(node);
    expect(ref2).toHaveBeenCalledWith(node);
  });

  it('should merge ref objects', () => {
    const ref1 = React.createRef<HTMLDivElement>();
    const ref2 = React.createRef<HTMLDivElement>();
    const mergedRef = mergeRefs(ref1, ref2);
    const node = document.createElement('div');

    mergedRef(node);

    expect(ref1.current).toBe(node);
    expect(ref2.current).toBe(node);
  });

  it('should merge mixed function refs and ref objects', () => {
    const functionRef = vi.fn();
    const refObject = React.createRef<HTMLDivElement>();
    const mergedRef = mergeRefs(functionRef, refObject);
    const node = document.createElement('div');

    mergedRef(node);

    expect(functionRef).toHaveBeenCalledWith(node);
    expect(refObject.current).toBe(node);
  });

  it('should handle null refs', () => {
    const ref1 = vi.fn();
    const ref2 = null;
    const ref3 = React.createRef<HTMLDivElement>();
    const mergedRef = mergeRefs(ref1, ref2, ref3);
    const node = document.createElement('div');

    mergedRef(node);

    expect(ref1).toHaveBeenCalledWith(node);
    expect(ref3.current).toBe(node);
  });

  it('should handle undefined refs', () => {
    const ref1 = vi.fn();
    const ref2 = undefined;
    const ref3 = React.createRef<HTMLDivElement>();
    const mergedRef = mergeRefs(ref1, ref2, ref3);
    const node = document.createElement('div');

    mergedRef(node);

    expect(ref1).toHaveBeenCalledWith(node);
    expect(ref3.current).toBe(node);
  });

  it('should handle empty refs array', () => {
    const mergedRef = mergeRefs<HTMLDivElement>();
    const node = document.createElement('div');

    expect(() => mergedRef(node)).not.toThrow();
  });

  it('should handle null node', () => {
    const ref1 = vi.fn();
    const ref2 = React.createRef<HTMLDivElement>();
    const mergedRef = mergeRefs(ref1, ref2);

    mergedRef(null);

    expect(ref1).toHaveBeenCalledWith(null);
    expect(ref2.current).toBe(null);
  });

  it('should update refs when called multiple times', () => {
    const ref1 = React.createRef<HTMLDivElement>();
    const ref2 = React.createRef<HTMLDivElement>();
    const mergedRef = mergeRefs(ref1, ref2);
    const node1 = document.createElement('div');
    const node2 = document.createElement('div');

    mergedRef(node1);
    expect(ref1.current).toBe(node1);
    expect(ref2.current).toBe(node1);

    mergedRef(node2);
    expect(ref1.current).toBe(node2);
    expect(ref2.current).toBe(node2);
  });

  it('should handle multiple function refs', () => {
    const ref1 = vi.fn();
    const ref2 = vi.fn();
    const ref3 = vi.fn();
    const mergedRef = mergeRefs(ref1, ref2, ref3);
    const node = document.createElement('div');

    mergedRef(node);

    expect(ref1).toHaveBeenCalledWith(node);
    expect(ref2).toHaveBeenCalledWith(node);
    expect(ref3).toHaveBeenCalledWith(node);
  });

  it('should handle multiple ref objects', () => {
    const ref1 = React.createRef<HTMLDivElement>();
    const ref2 = React.createRef<HTMLDivElement>();
    const ref3 = React.createRef<HTMLDivElement>();
    const mergedRef = mergeRefs(ref1, ref2, ref3);
    const node = document.createElement('div');

    mergedRef(node);

    expect(ref1.current).toBe(node);
    expect(ref2.current).toBe(node);
    expect(ref3.current).toBe(node);
  });
});
