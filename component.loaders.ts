import { IRemoteControlLoader } from '@directum/sungero-remote-component-types';

import * as HtmlControlLoader from './src/loaders/html-control-loader';

// Загрузчики контролов компонента.
const loaders: Record<string, IRemoteControlLoader> = {
  'html-control-loader': HtmlControlLoader
};

export default loaders;
