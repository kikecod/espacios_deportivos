import { Test, TestingModule } from '@nestjs/testing';
import { LibelulaController } from './libelula.controller';
import { LibelulaService } from './libelula.service';

describe('LibelulaController', () => {
  let controller: LibelulaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibelulaController],
      providers: [LibelulaService],
    }).compile();

    controller = module.get<LibelulaController>(LibelulaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
