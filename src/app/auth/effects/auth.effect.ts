import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {login, logout} from '../actionns';
import {tap} from 'rxjs/operators';
import {Router} from '@angular/router';


@Injectable()
export class AuthEffect {

  login$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(login),
        tap(action => {
          localStorage.setItem('user', JSON.stringify(action.user));
        })
      )
    },
    {dispatch: false}
  ) // этот эффект не диспатчит побочные action, превентим infinite loop


  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(logout),
      tap(action => {
        localStorage.removeItem('user');
        this.router.navigateByUrl('/login');
      })
    )
  }, {dispatch: false});

  constructor(private actions$: Actions, private router: Router) {


    // simple way (not ngRX implementations) I realization
    // actions$.subscribe(action => {
    //   if (action.type == '[Login Page] User Login') {
    //     localStorage.setItem('user', JSON.stringify(action['user']));
    //   }
    // });
  }

}
