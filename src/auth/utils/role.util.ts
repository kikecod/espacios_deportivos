import { TipoRol } from 'src/roles/entities/rol.entity';

/**
 * Normaliza un valor de rol (numérico o string) a su string del enum:
 *  - 0 -> 'CLIENTE'
 *  - 1 -> 'DUENIO'
 *  - etc.
 */
export function normalizeRole(r: unknown): string {
  if (typeof r === 'number') {
    // map enum numeric -> enum name
    const mapped = (TipoRol as any)[r];
    return mapped ?? String(r);
  }
  return String(r);
}
