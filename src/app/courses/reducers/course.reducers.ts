import {compareCourses, Course} from '../model/course';
import {createEntityAdapter, EntityState} from '@ngrx/entity';
import {createReducer, on} from '@ngrx/store';
import {allCoursesLoaded, courseUpdated} from '../actions';


// export interface CoursesState {
//   entities: {[key: number]: Course}, // делаем (key-value-map) Map entities чтобы было легче получать курс по уник. идентификатору, где key это id
//   ids: number[]       // массив id для order (группировки - по убывани, дате, и тд в нашем случае по св-ву seqNo)
// }

export interface CoursesState extends EntityState<Course> {
  allCoursesLoaded: boolean
}

export const adapter = createEntityAdapter<Course>({
  sortComparer: compareCourses,           // ф-я сортировки
  // selectId: course => course.courseID  // указываем уник ключ entity
});

export const initialCoursesState = adapter.getInitialState({
  allCoursesLoaded: false
});

export const coursesReducer = createReducer(
  initialCoursesState,
  on(allCoursesLoaded, (state, action) => {
    return adapter.addMany(
      action.courses,
      {...state, allCoursesLoaded: true}
    )
  }),

  on(courseUpdated, (state, action) => {
    return adapter.updateOne(action.update, state);
  })
)

export const {selectAll} = adapter.getSelectors(); // selectAll будем использовать, чтобы получить натуральный массив courses в селекторах
