import { IRemoteControlLoader } from '@directum/sungero-remote-component-types';

import * as StampControlLoader from './src/loaders/stamp-control-loader';

// Загрузчики контролов компонента.
const loaders: Record<string, IRemoteControlLoader> = {
  'stamp-control-loader': StampControlLoader
};

export default loaders;
