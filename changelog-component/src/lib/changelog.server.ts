import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { ChangelogEntry } from '../components/changelog/types';
import { changelogEntries as staticEntries } from '../data/changelog-entries';

type AnyProp = PageObjectResponse['properties'][string];

function getText(p: AnyProp | undefined): string {
  if (!p) return '';
  if (p.type === 'title') return p.title.map((t) => t.plain_text).join('');
  if (p.type === 'rich_text') return p.rich_text.map((t) => t.plain_text).join('');
  if (p.type === 'url') return p.url ?? '';
  return '';
}

function getDate(p: AnyProp | undefined): string {
  if (!p || p.type !== 'date') return '';
  return p.date?.start ?? '';
}

function getMultiSelect(p: AnyProp | undefined): string[] {
  if (!p || p.type !== 'multi_select') return [];
  return p.multi_select.map((s) => s.name);
}

function transformPage(page: PageObjectResponse): ChangelogEntry {
  const pr = (name: string) => page.properties[name] as AnyProp | undefined;
  return {
    id: page.id,
    date: getDate(pr('Date')),
    changelogUrl: getText(pr('ChangelogUrl')) || undefined,
    features: [
      {
        id: page.id.slice(0, 8),
        title: getText(pr('Title')),
        description: getText(pr('Description')),
        tags: getMultiSelect(pr('Tags')),
        docsUrl: getText(pr('DocsUrl')) || undefined,
        media: getText(pr('ImageUrl'))
          ? [{ type: 'image' as const, src: getText(pr('ImageUrl')), alt: getText(pr('Title')) }]
          : undefined,
      },
    ],
  };
}

export async function fetchChangelogEntries(limit?: number): Promise<ChangelogEntry[]> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return limit ? staticEntries.slice(0, limit) : staticEntries;
  }

  try {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_DATABASE_ID!,
      filter: { property: 'Published', checkbox: { equals: true } },
      sorts: [{ property: 'Date', direction: 'descending' }],
      ...(limit ? { page_size: limit } : {}),
    });

    return response.results
      .filter((p): p is PageObjectResponse => p.object === 'page' && 'properties' in p)
      .map(transformPage);
  } catch (err) {
    console.error('[changelog] Notion fetch failed:', err);
    return limit ? staticEntries.slice(0, limit) : staticEntries;
  }
}
