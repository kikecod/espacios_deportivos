export interface SearchResult {
  idCancha: number;
  nombre: string;
  precio: number;
  ratingPromedio: number;
  totalResenas: number;
  superficie: string;
  cubierta: boolean;
  dimensiones: string;
  aforoMax: number;
  horaApertura: string;
  horaCierre: string;
  fotos: FotoResult[];
  disciplinas: DisciplinaResult[];
  sede: SedeResult;
  disponible?: boolean;
  distancia?: number;
}

export interface FotoResult {
  idFoto: number;
  urlFoto: string;
}

export interface DisciplinaResult {
  idDisciplina: number;
  nombre: string;
  categoria: string;
}

export interface SedeResult {
  idSede: number;
  nombre: string;
  country: string;
  stateProvince: string;
  city: string;
  district: string;
  addressLine: string;
  latitude: number | null;
  longitude: number | null;
  telefono: string;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FiltersInfo {
  availableCities: string[];
  availableDistricts: string[];
  availableDisciplines: { id: number; nombre: string }[];
  priceRange: { min: number; max: number };
}

export interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    pagination: PaginationResult;
    filters?: FiltersInfo;
  };
}

export interface AvailabilityResult {
  disponible: boolean;
  conflictos: any[];
  horariosDisponibles: { inicio: string; fin: string }[];
}
