// Точка входа для отладки контролов в режиме standalone (отдельное приложение, без веб клиента Sungero).
import api from './host-api-stub';
import loadApp from './src/loaders/stamp-control-loader';
import { ILoaderArgs } from '@directum/sungero-remote-component-types';

let args = {
    /** Контейнер. */
    container: document.getElementById('app'),
    /** Контекст инициализации. */
    initialContext: null,
    /** API сторонних компонентов. */
    api: api,
    /** Параметры стороннего контрола.*/
    controlInfo: null
}
loadApp(args);
