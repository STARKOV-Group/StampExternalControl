import { IEntity, IEntityPropertyInfo, IPropertyState, IRemoteComponentCardApi } from '@directum/sungero-remote-component-types';

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
          IsLandscape: true,
          CoordX: 0,
          CoordY: 0,
          StampHtml: 
          `<html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <style type="text/css">
        .box1 {
          padding: 1.5px;
          border: 1px solid #d7d7d7;
          border-color: #003f75;
          width: 235px;
        }
        .tg1{font-size:6pt;font-family:Arial, "Segoe UI", Consolas, Calibri, monospace;line-height:6pt;color: #003f75;white-space: pre-wrap}
        .tg2{font-size:8.25pt;font-family:Arial, "Segoe UI", Consolas, Calibri, monospace;text-align:center;line-height:9.75pt;color: #003f75;white-space: nowrap}
         
        </style>
        </head>
        <body style="margin: 0">
         
        <table class="box1">
        <tr>
           <td width = 31 height = 39 align = "right">
            <img width = 27 src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAC4jAAAuIwF4pT92AAAGtmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOS0wMS0yM1QxMjozNjowMiswNDowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTktMDEtMjNUMTc6NDA6NTQrMDQ6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTktMDEtMjNUMTc6NDA6NTQrMDQ6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTIzMjk1OGEtZWNiYS1hZjRjLWE2MTQtZjc3YTkzZTAyZDAyIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6NmIxNzA1ZDgtYjRmMy04NjQxLWJmZjAtOGUzZDAyOTg3ZTMzIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NzZiYzgyODYtMjMyNS1lNjQzLWIyMTgtNDk0ZjYzNmU4ZmU1Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3NmJjODI4Ni0yMzI1LWU2NDMtYjIxOC00OTRmNjM2ZThmZTUiIHN0RXZ0OndoZW49IjIwMTktMDEtMjNUMTI6MzY6MDIrMDQ6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjhhZWZiZjY0LWJhMjMtODM0YS1iYmJiLTA5OTBhYjU2MTYwZiIgc3RFdnQ6d2hlbj0iMjAxOS0wMS0yM1QxNzo0MDo1NCswNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MTIzMjk1OGEtZWNiYS1hZjRjLWE2MTQtZjc3YTkzZTAyZDAyIiBzdEV2dDp3aGVuPSIyMDE5LTAxLTIzVDE3OjQwOjU0KzA0OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pl5NEzkAABjjSURBVHic7Z1ptB1V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"/>
        </td>
          <td height = 39>  
            <div class="tg2" style="margin-left:7.5px;margin-right:3.75px">ДОКУМЕНТ ПОДПИСАН<br>
        ЭЛЕКТРОННОЙ ПОДПИСЬЮ</div>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <span class="tg1" style="white-space: nowrap">Сертификат 16724879682167awd</span>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <span class="tg1">Владелец <b>test</b></span>
          </td>  
        </tr>
        <tr>
          <td colspan="2">
            <span class="tg1">Действителен с 20.01.2015 по 27.12.2025</span>
          </td>
        </tr>
           
        </table>
        </body>
        </html>`,
          FirstPageAsImage: ''
        }
      ]
    } as unknown as T;
  }

  public onControlUpdate?: (() => void);
}

const api: IRemoteComponentCardApi = new HostStubApi();
export default api;
