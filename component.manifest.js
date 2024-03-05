module.exports = {
  vendorName: 'Starkov',
  componentName: 'ReactControls',
  componentVersion: '1.1',
  // Описание контролов, которые есть в компоненте. Реализация контролов находится в папке ./src/controls.
  controls: [
    //#region custom
    {
      name: 'Html-control',
      loaders: [
        {
          name: 'html-control-loader',
          scope: 'Card'
        }
      ],
      displayNames: [
        { locale: 'en', name: 'Html control' },
        { locale: 'ru', name: 'Контрол с html' },
      ]
    },
    //#endregion
  ]
};
