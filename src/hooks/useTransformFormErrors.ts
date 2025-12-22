import useTranslation from 'next-translate/useTranslation';

interface FieldErrorConfig {
  fieldNameKey: string;
  extraParams?: Record<string, unknown>;
}

type FormErrorTransformerConfig<T> = {
  [K in keyof T]?: FieldErrorConfig;
};

interface TransformFormErrorsResult<T> {
  transformErrors: (
    apiResult: { errors?: Record<string, string>; success?: boolean } | void | undefined,
  ) => { errors?: { [key in keyof T]: string }; success?: boolean } | undefined;
}

/**
 * Custom hook to transform API errors into translated form error messages
 * @param {FormErrorTransformerConfig<T>} fieldConfig - Configuration mapping form fields to their translation keys and extra params
 * @returns {TransformFormErrorsResult<T>} Object containing transformErrors function
 */
const useTransformFormErrors = <T extends Record<string, unknown>>(
  fieldConfig: FormErrorTransformerConfig<T>,
): TransformFormErrorsResult<T> => {
  const { t } = useTranslation('common');

  const transformErrors = (
    apiResult: { errors?: Record<string, string>; success?: boolean } | void | undefined,
  ): { errors?: { [key in keyof T]: string }; success?: boolean } | undefined => {
    // Return success result if no errors present
    if (!apiResult || !('errors' in apiResult) || !apiResult.errors) {
      if (apiResult && apiResult.success) {
        return { success: true };
      }
      return undefined;
    }

    const errors: Partial<{ [key in keyof T]: string }> = {};

    Object.entries(apiResult.errors).forEach(([field, errorKey]) => {
      const config = fieldConfig[field as keyof T];
      if (config) {
        const fieldName = t(config.fieldNameKey);
        const errorMessage = t(errorKey, {
          fieldName,
          ...config.extraParams,
        });
        errors[field as keyof T] = errorMessage;
      } else if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn(`Unconfigured error field: ${field}`);
      }
    });

    if (Object.keys(errors).length === 0) {
      return undefined;
    }

    return { errors: errors as { [key in keyof T]: string } };
  };

  return {
    transformErrors,
  };
};

export default useTransformFormErrors;
