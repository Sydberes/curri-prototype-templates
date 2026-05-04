import { ChangelogEntry } from '../components/changelog/types';

export const changelogEntries: ChangelogEntry[] = [
  {
    id: 'dec-17-2025',
    date: '2025-12-17',
    changelogUrl: 'https://help.curri.com/en/collections/16173774-route-planner',
    features: [
      {
        id: 'pretip-dvir',
        title: 'Custom stop tasks',
        description:
          'Build custom task templates with form fields, photos, and e-signatures — then preview exactly how drivers will see them on mobile before publishing. Required fields are enforced at stop completion, so nothing gets missed.',
        tags: ['Route Planner'],
        docsUrl: 'https://help.curri.com/en/collections/16173774-route-planner',
        media: [
          {
            type: 'image',
            src: '/media/placeholder-preview.png',
            alt: 'Pre-trip DVIR task builder with mobile preview',
          },
        ],
      },
      {
        id: 'fleet-metrics',
        title: 'Fleet metrics',
        description:
          'A new metrics view gives you fleet utilization scores, driver performance ratings, and route stats — all in one place. Alerts and observations surface anomalies automatically so you can act before they become issues.',
        tags: ['Route Planner'],
        docsUrl: 'https://help.curri.com/en/collections/16173774-route-planner',
        media: [
          {
            type: 'image',
            src: '/media/placeholder-preview-2.png',
            alt: 'Fleet metrics dashboard with utilization and performance scores',
          },
        ],
      },
    ],
  },
  {
    id: 'nov-30-2025',
    date: '2025-11-30',
    changelogUrl: 'https://help.curri.com/en/collections/16173774-route-planner',
    features: [
      {
        id: 'bulk-reassign',
        title: 'Bulk reassign deliveries',
        description:
          'Select multiple active deliveries and reassign them to a different driver in a single action — no more one-by-one updates.',
        tags: ['Route Planner'],
        media: [
          {
            type: 'image',
            src: '/media/placeholder-preview.png',
            alt: 'Bulk reassign UI',
          },
        ],
      },
    ],
  },
];
