import { normalizeRole } from './role.util';
import { TipoRol } from 'src/roles/entities/rol.entity';

describe('normalizeRole', () => {
  it('maps enum numeric to string', () => {
    // simulate numeric enum indices (if ever passed)
    expect(normalizeRole((TipoRol as any)['ADMIN'])).toBe('ADMIN');
  });

  it('returns string as-is', () => {
    expect(normalizeRole('CLIENTE')).toBe('CLIENTE');
  });

  it('coerces unknown to string', () => {
    expect(normalizeRole(123 as any)).toBe(String(123));
  });
});

