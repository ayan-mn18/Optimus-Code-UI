import { create, insertMultiple, search } from '@orama/orama';
import type { SearchResult } from './types';

export interface CommandSearchRecord {
  id: string;
  label: string;
  detail: string;
  type: 'action' | 'result';
  to: string;
  resultType: SearchResult['type'] | '';
  resultId: string;
  slug: string;
  kind: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  aliases?: string;
}

const commandSearchSchema = {
  label: 'string',
  detail: 'string',
  aliases: 'string',
  type: 'string',
  to: 'string',
  resultType: 'string',
  resultId: 'string',
  slug: 'string',
  kind: 'string',
  topic: 'string',
  subtopic: 'string',
  difficulty: 'string',
} as const;

function stemForCompactSearch(word: string) {
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('er') && word.length > 5) return word.slice(0, -2);
  return word;
}

/** Adds compact forms such as `ratelimit` for “rate limiter”. */
function compactAliases(value: string) {
  const words = value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const stems = words.map(stemForCompactSearch);
  return stems.slice(0, -1).map((word, index) => `${word}${stems[index + 1]}`).join(' ');
}

function toDocument(record: CommandSearchRecord) {
  return {
    id: record.id,
    label: record.label,
    detail: record.detail,
    aliases: [record.aliases, record.label, record.detail, compactAliases(`${record.label} ${record.detail}`)]
      .filter(Boolean)
      .join(' '),
    type: record.type,
    to: record.to,
    resultType: record.resultType,
    resultId: record.resultId,
    slug: record.slug,
    kind: record.kind,
    topic: record.topic,
    subtopic: record.subtopic,
    difficulty: record.difficulty,
  };
}

export function resultRecord(result: SearchResult): CommandSearchRecord {
  return {
    id: `${result.type}:${result.id}`,
    label: result.title,
    detail: [result.kind, result.topic, result.difficulty].filter(Boolean).join(' · '),
    type: 'result',
    to: '',
    resultType: result.type,
    resultId: result.id,
    slug: result.slug,
    kind: result.kind,
    topic: result.topic ?? '',
    subtopic: result.subtopic ?? '',
    difficulty: result.difficulty ?? '',
  };
}

export function createCommandSearchIndex(records: CommandSearchRecord[]) {
  const database = create({ schema: commandSearchSchema });
  insertMultiple(database, records.map(toDocument));
  return database;
}

export function searchCommandIndex(database: ReturnType<typeof createCommandSearchIndex>, query: string) {
  const result = search(database, {
    term: query,
    properties: ['label', 'detail', 'aliases'],
    tolerance: query.length >= 5 ? 1 : 0,
    limit: 16,
  }) as { hits: { document: CommandSearchRecord }[] };

  return result.hits.map(({ document }) => document as CommandSearchRecord);
}
