export class DomainError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}
export function uuid(value: unknown, name = 'ID'): string {
  if (
    typeof value !== 'string' ||
    !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value)
  ) {
    throw new DomainError(400, name + ' must be a UUID');
  }
  return value.toLowerCase();
}
export function text(
  value: unknown,
  name: string,
  required = false,
  max = 2048,
): string | null {
  if (value === undefined || value === null || value === '') {
    if (required) throw new DomainError(400, name + ' is required');
    return null;
  }
  if (typeof value !== 'string' || value.trim().length > max)
    throw new DomainError(400, 'Invalid ' + name);
  if (required && !value.trim())
    throw new DomainError(400, name + ' is required');
  return value.trim() || null;
}
export function imageUrl(value: unknown): string | null {
  const result = text(value, 'image URL');
  if (!result) return null;
  try {
    if (new URL(result).protocol !== 'https:') throw new Error();
  } catch {
    throw new DomainError(400, 'Image URLs must use HTTPS');
  }
  return result;
}
export function date(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  ) {
    throw new DomainError(400, 'Use a valid YYYY-MM-DD date');
  }
  return value;
}
export function count(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (
    !/^\d+$/.test(String(value)) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) > 2147483647
  )
    throw new DomainError(400, 'Targets must be nonnegative whole numbers');
  return Number(value);
}
export function paging(query: Record<string, unknown>) {
  const page = Number(query.page ?? 0);
  const size = Number(query.size ?? 25);
  if (
    !Number.isInteger(page) ||
    page < 0 ||
    page > 100000 ||
    ![25, 50, 100].includes(size)
  ) {
    throw new DomainError(400, 'Invalid pagination');
  }
  return { size, offset: page * size };
}
export function projectValues(body: Record<string, unknown>) {
  const start = date(body.starts_on),
    end = date(body.ends_on);
  if (start && end && start > end)
    throw new DomainError(400, 'End date must follow start date');
  const status = body.status ?? 'active';
  if (!['active', 'suspended', 'archived'].includes(String(status)))
    throw new DomainError(400, 'Invalid project status');
  return [
    text(body.name, 'Project name', true, 180),
    text(body.code, 'Code', true, 64),
    status,
    text(body.description, 'Description', false, 10000),
    text(body.country, 'Country', false, 100),
    text(body.region, 'Region', false, 150),
    start,
    end,
    count(body.target_trees),
    count(body.target_captures),
    imageUrl(body.logo_url),
    imageUrl(body.hero_image_url),
  ];
}

export function speciesNames(body: Record<string, unknown>, creating = false) {
  const scientific_name = text(body.scientific_name, 'Latin name', false, 255);
  const herbarium_name =
    text(body.herbarium_name, 'Herbarium name', false, 8)?.toUpperCase() ??
    null;
  if (herbarium_name && !/^[A-Z]{8}$/.test(herbarium_name))
    throw new DomainError(400, 'Herbarium name must contain exactly 8 letters');
  if (creating && !scientific_name && !herbarium_name)
    throw new DomainError(400, 'Enter a herbarium name or Latin name');
  return { scientific_name, herbarium_name };
}
