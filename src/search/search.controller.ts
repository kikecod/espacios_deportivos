import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchMainDto } from './dto/search-main.dto';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';

@ApiTags('Search - Búsqueda y Filtrado')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * BÚSQUEDA PRINCIPAL
   * Buscar canchas por ubicación, fecha, hora y disciplina
   */
  @Get('main')
  @ApiOperation({
    summary: 'Búsqueda principal de canchas',
    description:
      'Buscar canchas disponibles filtradas por ubicación, fecha, hora y disciplina',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de la búsqueda',
  })
  async searchMain(@Query() dto: SearchMainDto) {
    return this.searchService.searchMain(dto);
  }

  /**
   * BÚSQUEDA CON FILTROS AVANZADOS
   * Incluye filtros de precio, rating, características, etc.
   */
  @Get('filters')
  @ApiOperation({
    summary: 'Búsqueda con filtros avanzados',
    description:
      'Buscar canchas con filtros adicionales: precio, rating, características, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de la búsqueda con filtros',
  })
  async searchWithFilters(@Query() dto: SearchFiltersDto) {
    return this.searchService.searchWithFilters(dto);
  }

  /**
   * VERIFICAR DISPONIBILIDAD
   * Verificar si una cancha específica está disponible en fecha/hora
   */
  @Post('availability')
  @ApiOperation({
    summary: 'Verificar disponibilidad de cancha',
    description:
      'Verifica si una cancha está disponible en la fecha y hora especificadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de disponibilidad',
  })
  async checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.searchService.checkAvailability(dto);
  }

  /**
   * OBTENER UBICACIONES DISPONIBLES
   * Obtiene lista de países, estados, ciudades y distritos con canchas
   */
  @Get('locations')
  @ApiOperation({
    summary: 'Obtener ubicaciones disponibles',
    description:
      'Obtiene lista jerárquica de ubicaciones donde hay canchas disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ubicaciones',
  })
  async getAvailableLocations() {
    return this.searchService.getAvailableLocations();
  }

  /**
   * BÚSQUEDA DE SEDES POR NOMBRE
   * Autocompletado de sedes
   */
  @Get('sedes')
  @ApiOperation({
    summary: 'Buscar sedes por nombre',
    description: 'Búsqueda tipo autocompletado para nombres de sedes',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Texto a buscar',
    example: 'sag',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sedes que coinciden',
  })
  async searchSedesByName(@Query('q') query: string) {
    return this.searchService.searchSedesByName(query);
  }

  /**
   * AUTOCOMPLETADO DE CIUDADES
   * Sugerencias de ciudades para el buscador
   */
  @Get('cities')
  @ApiOperation({
    summary: 'Autocompletado de ciudades',
    description: 'Búsqueda tipo autocompletado para nombres de ciudades',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Texto a buscar',
    example: 'la',
  })
  @ApiResponse({
    status: 200,
    description: 'Sugerencias de ciudades',
  })
  async autocompleteCities(@Query('q') query: string) {
    return this.searchService.autocompleteCities(query);
  }

  /**
   * AUTOCOMPLETADO DE DISTRITOS
   * Sugerencias de distritos/zonas para el buscador
   */
  @Get('districts')
  @ApiOperation({
    summary: 'Autocompletado de distritos/zonas',
    description: 'Búsqueda tipo autocompletado para nombres de distritos',
  })
  @ApiQuery({
    name: 'city',
    required: true,
    description: 'Ciudad donde buscar',
    example: 'La Paz',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Texto a buscar',
    example: 'san',
  })
  @ApiResponse({
    status: 200,
    description: 'Sugerencias de distritos',
  })
  async autocompleteDistricts(
    @Query('city') city: string,
    @Query('q') query: string,
  ) {
    return this.searchService.autocompleteDistricts(city, query);
  }
}
