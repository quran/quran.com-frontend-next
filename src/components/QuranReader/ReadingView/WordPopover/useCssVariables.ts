import { useEffect } from 'react';

/**
 * Props for the useCssVariables hook
 * @interface UseCssVariablesProps
 * @property {boolean} [isActive=false] - Whether the CSS variables should be applied
 * @property {string} [marginLeft='0'] - Value for the --popover-margin-left CSS variable
 * @property {string} [marginRight='0'] - Value for the --popover-margin-right CSS variable
 * @property {string} [marginTop='0'] - Value for the --popover-margin-top CSS variable
 */
interface UseCssVariablesProps {
  isActive?: boolean;
  marginLeft?: string;
  marginRight?: string;
  marginTop?: string;
}

/**
 * A custom hook that manages CSS variables for popover positioning.
 * It applies the specified margin values as CSS variables when active,
 * and cleans them up when inactive or when the component unmounts.
 *
 * @param {UseCssVariablesProps} props - The hook configuration
 * @param {boolean} props.isActive - Whether to apply the CSS variables
 * @param {string} props.marginLeft - Left margin value
 * @param {string} props.marginRight - Right margin value
 * @param {string} props.marginTop - Top margin value
 *
 * @example
 * useCssVariables({
 *   isActive: true,
 *   marginLeft: '10px',
 *   marginRight: '10px',
 *   marginTop: '5px'
 * });
 */
const useCssVariables = ({
  isActive = false,
  marginLeft = '0',
  marginRight = '0',
  marginTop = '0',
}: UseCssVariablesProps) => {
  useEffect(() => {
    const cssVars = [
      { name: '--popover-margin-left', value: marginLeft },
      { name: '--popover-margin-right', value: marginRight },
      { name: '--popover-margin-top', value: marginTop },
    ];

    if (isActive) {
      cssVars.forEach(({ name, value }) => {
        document.documentElement.style.setProperty(name, value);
      });
    } else {
      cssVars.forEach(({ name }) => {
        document.documentElement.style.removeProperty(name);
      });
    }

    return () => {
      if (isActive) {
        cssVars.forEach(({ name }) => {
          document.documentElement.style.removeProperty(name);
        });
      }
    };
  }, [isActive, marginLeft, marginRight, marginTop]);
};

export default useCssVariables;
