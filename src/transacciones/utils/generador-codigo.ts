export function generarCodigoAutorizacion(prefix = 'ROGU'): string {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();

  return `${prefix}-${timestamp}-${random}`;
}