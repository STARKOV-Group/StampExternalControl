module.exports = {
  vendorName: 'Starkov',
  componentName: 'ReactControls',
  componentVersion: '1.1',
  // Описание контролов, которые есть в компоненте. Реализация контролов находится в папке ./src/controls.
  controls: [
    {
      name: 'Stamp-control',
      loaders: [
        {
          name: 'stamp-control-loader',
          scope: 'Card'
        }
      ],
      displayNames: [
        { locale: 'en', name: 'Stamp control' },
        { locale: 'ru', name: 'Контрол для отображения штампа' },
      ]
    },
  ]
};
