import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../app.reducer';
import {filter, finalize, first, tap} from 'rxjs/operators';
import {loadAllCourses} from '../../courses/actions';
import {areCoursesLoaded} from '../../courses/selectors';

@Injectable()
export class CoursesResolver implements Resolve<any> {

  loading = false;

  constructor(private store: Store<AppState>) {
  }

  resolve(route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot): Observable<any> {

    return this.store.pipe(
      select(areCoursesLoaded),
      tap((areCoursesLoaded) => {
        if (!this.loading && !areCoursesLoaded) { // !areCoursesLoaded - проверяем загружены ли курсы или нет
          this.loading = true;
          this.store.dispatch(loadAllCourses()) // side effect диспатчит данные и мы переходим на страницу
        }
      }),
      filter(areCoursesLoaded => areCoursesLoaded),     // чтобы избежать перехода на страницу пока данные не будут загружены
                                                                 // tap - пробрасывает далее тоже значение
      first(),  // сработает только 1 раз, если флаг areCoursesLoaded true
      finalize(() => {
        this.loading = false;
      })
    )
  }

}
