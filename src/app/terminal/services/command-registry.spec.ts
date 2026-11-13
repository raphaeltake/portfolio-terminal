import { TestBed } from '@angular/core/testing';

import { CommandRegistry } from './command-registry';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = TestBed.inject(CommandRegistry);
  });

  it('encontra comandos por nome e apelido', () => {
    expect(registry.find('help')?.name).toBe('help');
    expect(registry.find('ajuda')?.name).toBe('help');
    expect(registry.find('CV')?.name).toBe('curriculo');
  });

  it('executa comandos ocultos, mas nunca os expõe', () => {
    expect(registry.find('edit-infos-minhas')?.hidden).toBe(true);
    expect(registry.visible().map((c) => c.name)).not.toContain('edit-infos-minhas');
    expect(registry.completeName('edit')).toEqual([]);
    expect(registry.suggest('edit-infos-minha')).toBeNull();
  });

  it('possui os comandos principais', () => {
    const names = registry.visible().map((c) => c.name);
    for (const name of [
      'help',
      'cd',
      'ls',
      'visualizar-projeto',
      'curriculo',
      'sobre',
      'contato',
    ]) {
      expect(names).toContain(name);
    }
  });

  it('sugere comandos parecidos', () => {
    expect(registry.suggest('hepl')).toBe('help');
    expect(registry.suggest('curiculo')).toBe('curriculo');
    expect(registry.suggest('xyzxyz')).toBeNull();
  });
});
