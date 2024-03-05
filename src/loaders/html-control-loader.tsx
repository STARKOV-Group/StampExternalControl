import * as React from 'react'
import { createRoot } from 'react-dom/client';
import { ControlCleanupCallback, ILoaderArgs, IRemoteComponentCardApi } from '@directum/sungero-remote-component-types';

import HtmlControl from '../controls/html-control/html-control';

/**
 * Загрузчик контрола для контекста карточки.
 * @param args Аргументы загрузчика.
 */
export default (args: ILoaderArgs): Promise<ControlCleanupCallback> => {
  const root = createRoot(args.container);
  root.render(<HtmlControl api={args.api as IRemoteComponentCardApi} controlInfo={args.controlInfo} />);
  return Promise.resolve(() => root.unmount());
};
