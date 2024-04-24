import * as React from 'react'
import { createRoot } from 'react-dom/client';
import { ControlCleanupCallback, ILoaderArgs, IRemoteComponentCardApi } from '@directum/sungero-remote-component-types';

import StampControl from '../controls/stamp-control/stamp-control';

/**
 * Загрузчик контрола для контекста карточки.
 * @param args Аргументы загрузчика.
 */
export default (args: ILoaderArgs): Promise<ControlCleanupCallback> => {
  const root = createRoot(args.container);
  root.render(<StampControl initialContext={args.initialContext} api={args.api as IRemoteComponentCardApi} />);
  return Promise.resolve(() => root.unmount());
};
