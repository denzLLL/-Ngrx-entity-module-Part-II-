import {createFeatureSelector, createSelector} from '@ngrx/store';
import {CoursesState, selectAll} from '../reducers/course.reducers';
import {Course} from '../model/course';

export const selectCoursesState = createFeatureSelector<CoursesState>('courses');
export const selectAllCourses = createSelector(
  selectCoursesState,
  selectAll // см описание в редьюсере
)

export const selectBeginnerCourses = createSelector(
  selectAllCourses,
  (courses: Course[]) => {
    return courses.filter(course => course.category === 'BEGINNER');
  }
)

export const selectAdvancedCourses = createSelector(
  selectAllCourses,
  courses => {
    return courses.filter(course => course.category === 'ADVANCED');
  }
)

export const selectPromoTotal = createSelector(
  selectAllCourses,
  courses => {
    return courses.filter(course => !!course.promo).length;
  }
)

export const areCoursesLoaded = createSelector(
  selectCoursesState,
  state => state.allCoursesLoaded
)
