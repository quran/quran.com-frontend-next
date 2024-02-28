import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './CourseFeedbackForm.module.scss';

import {
  mutateCachedCourseAfterFeedback,
  mutateCachedLessonsAfterFeedback,
} from '@/components/Course/utils/mutations';
import buildFormBuilderFormField from '@/components/FormBuilder/buildFormBuilderFormField';
import buildTranslatedErrorMessageByErrorId from '@/components/FormBuilder/buildTranslatedErrorMessageByErrorId';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import Button from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutateMultipleKeys from '@/hooks/useMutateMultipleKeys';
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import { Course } from '@/types/auth/Course';
import ErrorMessageId from '@/types/ErrorMessageId';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';
import { postCourseFeedback } from '@/utils/auth/api';
import { logFormSubmission } from '@/utils/eventLogger';

type Props = {
  course: Course;
  onSuccess: () => void;
};

type CourseFeedbackFormData = {
  rating: number;
  body?: string;
};

const BODY_MAX_VALIDATION_PARAMS = {
  value: 10000,
};

const CourseFeedbackForm: React.FC<Props> = ({ course, onSuccess }) => {
  const { t } = useTranslation('learn');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const mutateWithoutRevalidation = useMutateWithoutRevalidation();
  const mutateMultipleKeys = useMutateMultipleKeys();

  const submitFeedback = async (formData: CourseFeedbackFormData) => {
    setIsLoading(true);
    postCourseFeedback({
      courseId: course.id,
      ...formData,
    })
      .then(() => {
        toast(t('feedback.feedback-success'), {
          status: ToastStatus.Success,
        });
        // update local cache to set userHasFeedback to true
        mutateCachedCourseAfterFeedback(mutateWithoutRevalidation, course.slug);
        mutateCachedLessonsAfterFeedback(mutateMultipleKeys, course.slug);
        onSuccess();
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onSubmit = async (formData: CourseFeedbackFormData) => {
    logFormSubmission('course_feedback', formData);
    submitFeedback(formData);
  };

  return (
    <FormBuilder
      formFields={[
        {
          field: 'rating',
          type: FormFieldType.StarRating,
          // user must pick a rating
          defaultValue: null,
          containerClassName: styles.ratingContainer,
          rules: [
            {
              type: RuleType.Required,
              value: true,
              errorId: ErrorMessageId.RequiredField,
              errorMessage: buildTranslatedErrorMessageByErrorId(
                ErrorMessageId.RequiredField,
                'rating',
                t,
              ),
            },
          ],
        },
        {
          field: 'body',
          placeholder: t('feedback.feedback-placeholder'),
          rules: [
            {
              ...BODY_MAX_VALIDATION_PARAMS,
              type: RuleType.MaximumLength,
              errorId: ErrorMessageId.MaximumLength,
              errorExtraParams: {
                ...BODY_MAX_VALIDATION_PARAMS,
              },
              errorMessage: buildTranslatedErrorMessageByErrorId(
                ErrorMessageId.MaximumLength,
                'body',
                t,
                {
                  ...BODY_MAX_VALIDATION_PARAMS,
                },
              ),
            },
          ],
          type: FormFieldType.TextArea,
          containerClassName: styles.bodyInput,
          fieldSetLegend: t('feedback.your-feedback'),
        },
      ].map((field) => buildFormBuilderFormField(field, t))}
      onSubmit={onSubmit}
      isSubmitting={isLoading}
      renderAction={({ isLoading: isSubmitting }) => {
        return (
          <div className={styles.submitButton}>
            <Button htmlType="submit" isLoading={isSubmitting} isDisabled={isSubmitting}>
              {t('common:submit')}
            </Button>
          </div>
        );
      }}
    />
  );
};

export default CourseFeedbackForm;
