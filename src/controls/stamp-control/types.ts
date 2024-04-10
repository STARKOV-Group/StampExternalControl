import { IChildEntity, IChildEntityCollection, IEntity } from '@directum/sungero-remote-component-types';

export interface IStampInfoRow extends IChildEntity<ICustomEntity> {
  Id: number;
  CoordX: number;
  CoordY: number;
  StampHtml: string;
  PageNumber: number;
}

export interface IPagesRow extends IChildEntity<ICustomEntity> {
  Number: number;
  Page: string;
  IsLandscape: boolean;
}

export interface ICustomEntity extends IEntity {
  StampInfostarkov: IChildEntityCollection<ICustomEntity, IStampInfoRow>;
  Pagesstarkov: IChildEntityCollection<ICustomEntity, IPagesRow>;
}
