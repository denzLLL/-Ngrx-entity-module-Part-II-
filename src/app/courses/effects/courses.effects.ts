import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Router} from '@angular/router';
import {allCoursesLoaded, courseUpdated, loadAllCourses} from '../actions';
import {concatMap, map, tap} from 'rxjs/operators';
import {CoursesHttpService} from '../services/courses-http.service';
import {Course} from '../model/course';


@Injectable()
export class CoursesEffect {

  // стартуем загрузку
  loadCourses$ = createEffect(
    () => {
      return this.actions$
        .pipe(
          ofType(loadAllCourses),
          concatMap(action => this.coursesHttpService.findAllCourses()), // получаем курсы с бэка
          map(courses => {
            return allCoursesLoaded({courses}); // вызываем action на то, что курсы загрузились
          })
        )
    },
    // {dispatch: false} - не ставим тк в цепочке есть action (allCoursesLoaded)
  );

  saveCourse = createEffect(() => {
      return this.actions$
        .pipe(
          ofType(courseUpdated),
          concatMap(action => {
            return this.coursesHttpService.saveCourse(
              action.update.id,
              action.update.changes
            )
          })
        )
    },
    {dispatch: false});


  constructor(private actions$: Actions,
              private router: Router,
              private coursesHttpService: CoursesHttpService) {
  }

}
