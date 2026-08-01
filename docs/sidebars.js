module.exports = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Документация',
      collapsed: false,
      link: { type: 'doc', id: 'intro' },
      items: [
        {
          type: 'category',
          label: 'Бизнес',
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: 'business/business-rules',
              label: 'Бизнес-правила',
            },
          ],
        },
        {
          type: 'category',
          label: 'Система',
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: 'system/system-specification',
              label: 'Системная спецификация',
            },
            {
              type: 'doc',
              id: 'system/data-model',
              label: 'Модель данных',
            },
          ],
        },
        {
          type: 'category',
          label: 'Архитектура',
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: 'architecture/overview',
              label: 'Обзор',
            },
            {
              type: 'category',
              label: 'ADR',
              collapsed: false,
              items: [
                {
                  type: 'doc',
                  id: 'architecture/adr/testing',
                  label: 'E2E-тестирование с Testcontainers',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
