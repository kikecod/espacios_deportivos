import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { ListQueryDto } from '../dto/list-query.dto';

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  dto: ListQueryDto,
  sortable: string[] = [],
  defaultSort?: { field: string; direction: 'ASC' | 'DESC' },
): Promise<{ data: T[]; meta: PageMeta }> {
  const page = Math.max(1, Number(dto.page || 1));
  const pageSize = Math.max(1, Math.min(100, Number(dto.pageSize || 20)));

  // sort
  if (dto.sort) {
    const parts = dto.sort.split(',');
    for (const p of parts) {
      const [fieldRaw, dirRaw] = p.split(':');
      const field = fieldRaw?.trim();
      const dir = (dirRaw || 'ASC').toUpperCase() as 'ASC' | 'DESC';
      if (!field) continue;
      if (sortable.length === 0 || sortable.includes(field)) {
        qb.addOrderBy(field, dir === 'DESC' ? 'DESC' : 'ASC');
      }
    }
  } else if (defaultSort) {
    qb.addOrderBy(defaultSort.field, defaultSort.direction);
  }

  qb.skip((page - 1) * pageSize).take(pageSize);
  const [data, total] = await qb.getManyAndCount();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { data, meta: { page, pageSize, total, totalPages } };
}
