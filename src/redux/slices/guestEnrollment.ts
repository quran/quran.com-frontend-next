import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../RootState';

import resetSettings from '@/redux/actions/reset-settings';
import SliceName from '@/redux/types/SliceName';

export type GuestEnrollmentState = {
  enrolledCourses: string[];
};

const initialState: GuestEnrollmentState = {
  enrolledCourses: [],
};

export const guestEnrollmentSlice = createSlice({
  name: SliceName.GUEST_ENROLLMENT,
  initialState,
  reducers: {
    enrollInCourse: (state: GuestEnrollmentState, action: PayloadAction<string>) => {
      if (!state.enrolledCourses.includes(action.payload)) {
        state.enrolledCourses.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // Clear only guest enrollments when user logs in or resets settings
    builder.addCase(resetSettings, (state) => ({ ...state, enrolledCourses: [] }));
  },
});

export const { enrollInCourse } = guestEnrollmentSlice.actions;

export const selectIsGuestEnrolledInCourse = (state: RootState, courseId: string) =>
  state.guestEnrollment.enrolledCourses.includes(courseId);

export default guestEnrollmentSlice.reducer;
