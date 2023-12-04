/*
         Copyright 2021 EPOS ERIC

 Licensed under the Apache License, Version 2.0 (the License); you may not
 use this file except in compliance with the License.  You may obtain a copy
 of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an AS IS BASIS, WITHOUT
 WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 License for the specific language governing permissions and limitations under
 the License.
 */
import { BehaviorSubject, Observable } from 'rxjs';
import { Persister } from '../persisters/persister';
import { Model, modelContext } from '../model.service';
import { LocalStorageVariables } from '../persisters/localStorageVariables.enum';

/**
 * {@link ModelItem}s are primarily used by the {@link Model}, either as they come, or exteded
 * to add functionality.
 * {@link ModelItem}s are holders of values and have methods to "get", "set", "watch" for changes,
 * and "trigger" the change notification without updating the value.
 *
 */
export class ModelItem<T> {
  public isModelItem = true; // identifies this as a modalItem when type unknown
  public identifier: string;
  public initialised = false;
  public populatedOnInit = false;
  public persistableOnConfigurables = false;

  public prePersistConverter: (modelItem: ModelItem<T>) => unknown;
  public postPersistConverter: (modelItem: ModelItem<T>, value: unknown) => Promise<T>;
  public defaultValueSetter: (modelItem: ModelItem<T>) => Promise<T>;
  public initFunction: (modelItem: ModelItem<T>) => Promise<void>;

  protected valueSource: BehaviorSubject<T>;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public valueObs: Observable<T>;

  protected persister: null | Persister;
  protected persistable = false;
  // object of service references from the gathered from the dataMoel service
  protected services: Record<string, unknown>;

  protected logging = false;


  protected constructor(defaultValue: T) {
    this.valueSource = new BehaviorSubject<T>(defaultValue);
    this.valueObs = this.valueSource.asObservable();
    if (defaultValue != null) {
      this.setDefaultValueFunction(() => Promise.resolve(defaultValue));
    }
  }

  public static makeNullable<T1>(defaultValue: null | T1 = null): ModelItem<null | T1> {
    return new ModelItem<null | T1>(defaultValue);
  }
  public static make<T1>(defaultValue: T1): ModelItem<T1> {
    return new ModelItem<T1>(defaultValue);
  }

  public init(services: Record<string, unknown>): void {
    this.services = services;
    if (this.initFunction != null) {
      void this.initFunction(this)
        .then(() => this.setInitialised());
    } else {
      this.setInitialised();
    }
  }
  public setPersistable(persistable = true): this {
    this.persistable = persistable;
    return this;
  }

  /**
   * Sets this item to persist using the persister set on the model.
   * Defaults to return exact value, which is acceptable for simple types.
   */
  public setPersistFunctions(
    prePersistConverter = (modelItem: ModelItem<T>) => modelItem.get() as unknown,
    postPersistConverter = (modelItem: ModelItem<T>, value: unknown) => Promise.resolve(value as T),
  ): this {
    this.prePersistConverter = prePersistConverter;
    this.postPersistConverter = postPersistConverter;
    this.setPersistable();
    return this;
  }
  public setDefaultValueFunction(
    defaultValueSetter: (modelItem: ModelItem<T>) => Promise<T>,
  ): this {
    this.defaultValueSetter = defaultValueSetter;
    return this;
  }
  public setInitFunction(
    initFunc: (modelItem: ModelItem<T>) => Promise<void>,
  ): this {
    this.initFunction = initFunc;
    return this;
  }

  public setIdentifier(id: string): this {
    this.identifier = id;
    return this;
  }

  public setPersistableOnConfigurables(value: boolean): this {
    this.persistableOnConfigurables = value;
    return this;
  }


  public setPersister(persister: null | Persister): this {
    this.persister = persister;
    return this;
  }

  // try to set from persistence function.
  // if still empty try from default function
  // this could potentially be expanded if we had multiple persistence sources.
  public populateValueOnInit(): this {
    if (this.checkModelItemOnContext()) {
      void this.setFromPersistence()
        .then(() => {
          if (this.get() == null) {
            void this.setFromDefault();
          }
          this.populatedOnInit = true;
        });
      return this;
    } else {
      return this;
    }
  }

  /**
   * Sets the value
   * @param {T} value New value.
   * @param {boolean} force Forces change notifications even if old and new values were the same.
   */
  public set(value: T, force = false): void {
    // check if changed
    if (force || (this.initialised && !this.valueSame(value))) {
      this.log('DM set', this.identifier, value);
      this.valueSource.next(value);

      if ((this.persistable) && (this.persister != null)) {
        const persistValue = (this.prePersistConverter != null) ? this.prePersistConverter(this) : value;
        this.persister.set(this.identifier, persistValue, false, false);

        if (this.persistableOnConfigurables) {
          this.persister.set(LocalStorageVariables.LS_CONFIGURABLES, persistValue, false, this.identifier);
        }
      }
    }
  }

  /**
   * @returns {T} Current Value
   */
  public get(): T {
    this.log('DM get', this.identifier, this.valueSource.getValue());
    return this.valueSource.getValue();
  }

  /**
   * @returns {Observable<T>} An observable which will emit notifications of changes to the value.
   * @deprecated Use the public observable {@link valueObs} instead;
   */
  public watch(): Observable<T> {
    this.log('DM watch', this.identifier);
    return this.valueObs;
  }


  /**
   * Results in the emitting of a notifications of change, but with the same value as before.
   */
  public trigger(): void {
    this.log('DM trigger', this.identifier);
    this.set(this.valueSource.getValue());
  }

  /**
   * @returns {Model} The Model that this item is registered to.
   */
  public getModel(): Model {
    return this.services.Model as Model;
  }

  public getService(service: string): unknown {
    const requestedService = this.services[service];
    if (requestedService == null) {
      console.error(`No service set with id '${service}'.  Please set it in the ModelPrimer.service.`);
    }
    return requestedService;
  }

  protected log(message?: string, ...optionalParams: Array<unknown>): void {
    if (this.logging) {
      console.log(message, ...optionalParams);
    }
  }


  protected getPersistedValue(): Promise<unknown> {
    return new Promise((resolve) => {
      if (this.persister != null) {
        this.log('ModelItem: try setting value from persistence', this.identifier);
        void this.persister.get(this.identifier)
          .then((rawValue: unknown) => {
            this.log('ModelItem: raw value from persistence', this.identifier, rawValue);
            resolve(rawValue);
          });
      } else {
        resolve(null);
      }
    });
  }

  protected setFromPersistence(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.persistable) {
        resolve();
      } else {
        void this.getPersistedValue()
          .then((rawValue: unknown) => {
            if (rawValue != null) {
              void ((this.postPersistConverter == null)
                ? Promise.resolve(rawValue)
                : this.postPersistConverter(this, rawValue)
              ).then((value: T) => {
                this.set(value);
                resolve();
                this.log('ModelItem: set value from persistence', this.identifier, value);
              });
            } else {
              resolve();
              this.log('ModelItem: no value from persistence', this.identifier);
            }
          });
      }
    });
  }


  protected setFromDefault(): Promise<void> {
    if (this.defaultValueSetter != null) {
      this.log('ModelItem: try setting value from default', this.identifier);
      return this.defaultValueSetter(this)
        .then((value: T) => {
          this.log('ModelItem: set value from default', this.identifier, value);
          this.set(value);
        });
    } else {
      return Promise.resolve();
    }
  }

  private valueSame(newValue: T): boolean {
    // only works with simple types and arrays of simple types
    // return (JSON.stringify(this.get()) === (JSON.stringify(newValue)));
    return false;
  }

  private setInitialised(initialised = true) {
    this.initialised = initialised;
  }

  private checkModelItemOnContext(): boolean {
    const urlPath = window.location.pathname.split('/').pop();

    const modelContextTemp = modelContext.find(e =>
      e.variable === this.identifier && urlPath !== e.context);

    if (modelContextTemp !== undefined) {
      return false;
    }

    return true;
  }

}
