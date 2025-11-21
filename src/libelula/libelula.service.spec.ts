import { Test, TestingModule } from '@nestjs/testing';
import { LibelulaService } from './libelula.service';

describe('LibelulaService', () => {
  let service: LibelulaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibelulaService],
    }).compile();

    service = module.get<LibelulaService>(LibelulaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
