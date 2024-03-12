import { IChildEntity, IChildEntityCollection, IEntity } from '@directum/sungero-remote-component-types';

export interface IStampInfoRow extends IChildEntity<IStampInfo> {
  IsLandscape: boolean;
  CoordX: number;
  CoordY: number;
  StampHtml: string;
  FirstPageAsImage: string;
}

export interface IStampInfo extends IEntity {
  StampInfostarkov: IChildEntityCollection<IStampInfo, IStampInfoRow>;
}
