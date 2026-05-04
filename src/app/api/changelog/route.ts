import { NextResponse } from 'next/server';
import { fetchChangelogEntries } from '../../../lib/changelog.server';

export async function GET() {
  const entries = await fetchChangelogEntries(6);
  return NextResponse.json(entries);
}
