import {createAction, props} from '@ngrx/store';
import {Course} from '../model/course';
import {Update} from '@ngrx/entity';

// стартуем загрузку (этот action не обрабатывается reducer - он нужен для того чтобы стартовать side effect)
export const loadAllCourses = createAction(
  '[Course Resolver] Load All Courses'
)

export const allCoursesLoaded = createAction(
  '[Load Courses Effect] All Courses Loaded',
  props<{ courses: Course[] }>()
);

// старт редактирования
export const courseUpdated = createAction(
  '[Edit course dialog] Course Updated',
  props<{ update: Update<Course> }>() // Update - спец тип от @ngrx/entity
);
