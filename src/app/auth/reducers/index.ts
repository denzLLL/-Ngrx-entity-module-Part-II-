import {createReducer, MetaReducer, on} from '@ngrx/store';
import {environment} from '../../../environments/environment';
import {User} from '../model/user.model';
import {login, logout} from '../actionns';


export const authFeatureKey = 'auth';

export interface AuthState {
  user: User
}

export const initialAuthState: AuthState = {
  user: undefined
}

export const  authReducer = createReducer(
  initialAuthState,
  on(login, (state, action) => {
    return {
      user: action.user
    }
  }), 
  on(logout, (state, action) => {
    return {
      user: undefined
    }
  })
)

export const metaReducers: MetaReducer<AuthState>[] = !environment.production ? [] : [];
