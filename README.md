
# Ngrx (entity module, Part II)

## Установка Angular CLI

При помощи команды ниже angular-cli будет установлена глобально на вашей машине:

    npm install -g @angular/cli 

## Запуск Development Backend Server

Мы можем запустить backend приложение при помощи следующей команды:

    npm run server

Это небольшой написанный на Node REST API сервер.

## Чтобы запустить Development UI Server

Чтобы запустить frontend часть нашего кода, мы будем использовать Angular CLI:

    npm start 

Приложение доступно на порту 4200: [http://localhost:4200](http://localhost:4200)


<span style="color: yellow;">entity data</span> - такие как``` courses``` (множ-е сущности: ```Course[]```), но entity подрузомевают преобразование таких данных в ```Map```
(чтобы было легче получать курс уник ключу и тд со своим набором св-в, для работы с мапом)

```CoursesResolver``` - спец. сервис, кот выполняется перед срабатыванием навигации роутера т.е. это гарантирует, что переход на целевую стр будет невозможен пока мы не получим данные

## entity format

В ```reducer``` вместо обычного ```State``` (```courses: Course[]```) определим данные в entity формате:

Автоматизировано ```EntityState``` (см.ниже):

```
export interface CoursesState {
    entities: {[key: number]: Course},  // делаем (key-value-map) Map entities чтобы было легче получать курс
                                        // по уник. идентификатору, где key это id
    ids: number[]                       // массив id для order (группировки - по убывани, дате, и тд в нашем случае по св-ву seqNo)
}
```


Чтобы для каждой entity (а их может быть много) воспользуемся ```EntityState``` (данный класс под капотом расширит наш интерфейс св-ми entities, ids):

```
export interface CoursesState extends EntityState<Course>{

}
```


##  adapter
<span style="color: yellow;">adapter</span> позволяет добавлять/удалять (все типичные CRUD операции) и т.д. entity, 
то есть делает работу со state в reducer проще, чем в обычном reducer.

coursesReducer с адаптером:

```
export interface CoursesState extends EntityState<Course>{}
export const adapter = createEntityAdapter<Course>();
export const initialCoursesState = adapter.getInitialState()

export const coursesReducer = createReducer(
    initialCoursesState,
    on(allCoursesLoaded, (state, action) => { // при получении данных с бэка сохраяем данные в сторе
        return adapter.addMany(action.courses, state)
    })
)
export const { selectAll } = adapter.getSelectors(); // selectAll будем использовать, чтобы получить натуральный массив courses в селекторах ***
```


Не забываем зарегистрировать в ```CoursesModule``` feature:
```
StoreModule.forFeature('courses', coursesReducer)
```


##  Cелекторы для редьюсера с адаптером
```
export const selectCoursesState = createFeatureSelector<CoursesState>('courses');
export const selectAllCourses = createSelector(
    selectCoursesState,
    selectAll             // см описание в редьюсере ***
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
```



##  Получаем данные в компоненте
(home.component.ts)
```
this.beginnerCourses$ = this.store.pipe(select(selectBeginnerCourses))
this.advancedCourses$ = this.store.pipe(select(selectAdvancedCourses));
this.promoTotal$ = this.store.pipe(select(selectPromoTotal));
```


## Сортировка entity по уник. ключу

В редьюсере при создании адаптера добавляем ф-ю сортировки.

```
export const adapter = createEntityAdapter<Course>({
    sortComparer: compareCourses,           // ф-я сортировки
    // selectId: course => course.courseID  // указываем уник. ключ entity
});
```

## Как загружать данные (courses) только по необходимости (если их нет)

Данные загружаются при каждом роутинге - в нашем случае при помощи ```resolver```, но зачем,
если можно загрузить их один раз.

// Добавим дополнит-й state (флаг allCoursesLoaded), в кот будем смотреть загружены ли данные или нет:
```
export interface CoursesState extends EntityState<Course>{
    allCoursesLoaded: boolean
}
```

Добавим селектор:
```
export const areCoursesLoaded = createSelector(
    selectCoursesState,
    state => state.allCoursesLoaded
)
```

Далее получаем курсы в ```resolver```:
```
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
```


В reducer обновим флаг ```allCoursesLoaded``` на ```true``` при получении курсов:

```
export const coursesReducer = createReducer(
    initialCoursesState,
    on(allCoursesLoaded, (state, action) => {
        return adapter.addMany(
            action.courses,
            {...state, allCoursesLoaded: true}
        )
    })
)
```

###  loading
```loading``` ставим ```app.component``` и лишь тогда, когда на ```router``` сработает ```NavigationEnd```, 
т.к. мы получаем данные через ```resolver```.


###  Как UPDATE данные (courses)

<span style="color: yellow;">optimistically editing</span> - обновляем в фоне, без показа ```loading``` индикатора пользователю.

1. Создадим action:
Старт редактирования
```
export const courseUpdated = createAction(
    '[Edit course dialog] Course Updated',
    props<{ update: Update<Course> }>() // Update - спец тип от @ngrx/entity
);
```
2. Диспатчим данные:
```
onSave() {
    const update: Update<Course> = {
        id: course.id,
        changes: course
    };
    this.store.dispatch(courseUpdated({update}));
    //...
}
```
3. Дополним reducer (обновляем ```store```)
```
on(courseUpdated, (state, action) => {
    return adapter.updateOne(action.update, state);
})
```
4. Обновляем backend (в effects)
```
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
    {dispatch: false}
);
```
