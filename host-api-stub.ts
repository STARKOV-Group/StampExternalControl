import { IEntity, IEntityPropertyInfo, IPropertyState, IRemoteComponentCardApi } from '@directum/sungero-remote-component-types';
import { stampHtml, page1, page2 } from './test-data.ts';

/** Заглушка API для отладки в режиме standalone. */
class HostStubApi implements IRemoteComponentCardApi {
  public executeAction(actionName: string): Promise<void> {
    console.log(`Action ${actionName} executed.`)
    return Promise.resolve();
  }

  public canExecuteAction(actionName: string): boolean {
    return true;
  }

  public getEntity<T extends IEntity>(): T {
    return {
      Id: 1,
      DisplayValue: 'Test Entity',
      Info: {
        /** Информация о свойствах сущности. */
        properties: Array<IEntityPropertyInfo>
      },
      LockInfo: {
        /** Признак, что сущность заблокирована. */
        IsLocked: false,
        /** Признак, что сущность заблокирована текущим клиентом. */
        IsLockedByMe: false,
        /** Признак, что сущность заблокирована в текущем контексте. */
        IsLockedHere: false,
        /** Время установки блокировки. */
        LockTime: null,
        /** Имя пользователя, который установил блокировку. */
        OwnerName: ''
      },
      State: {
        /** Признак доступности сущности для редактирования. */
        IsEnabled: true,
        /** Состояние свойств. */
        Properties: Array<IPropertyState>
      },
      StampInfostarkov: [
        {
          Id: 1,
          CoordX: 0,
          CoordY: 0,
          StampHtml: stampHtml,
          PageNumber: 1
        }
      ],
      Pagesstarkov: [
        {
          Number: 1,
          IsLandscape: true,
          Page: page1
          
        },
        {
          Number: 2,
          IsLandscape: true,
          Page: page2
        }
      ]
    } as unknown as T;
  }

  public onControlUpdate?: (() => void);
}

const api: IRemoteComponentCardApi = new HostStubApi();
export default api;
