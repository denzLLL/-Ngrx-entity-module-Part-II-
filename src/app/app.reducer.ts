import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { environment } from '../environments/environment';

export interface AppState {
  router: RouterReducerState<any>;
}

export function logger(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action) => {
    console.group('logger [metaReducer]')
    console.log("state before: ", state);
    console.log("action", action);
    console.groupEnd()
    return reducer(state, action);
  }
}

export const reducers: ActionReducerMap<AppState> = {
  router: routerReducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [logger] : [];
