import type { Command } from './command';
import { CatCommand, CdCommand, LsCommand, PwdCommand } from './filesystem.commands';
import { EditInfoCommand, SudoCommand } from './hidden.commands';
import {
  AboutCommand,
  CertificatesCommand,
  ContactCommand,
  ProjectsCommand,
  ResumeCommand,
  ViewProjectCommand,
} from './info.commands';
import {
  BannerCommand,
  ClearCommand,
  DateCommand,
  EchoCommand,
  HelpCommand,
  HistoryCommand,
} from './system.commands';

/**
 * Lista de comandos registrados. A ordem aqui é a ordem exibida no `help`.
 * Para adicionar um comando, crie a classe e inclua a instância abaixo.
 */
export function createCommands(): Command[] {
  return [
    new HelpCommand(),
    new AboutCommand(),
    new ResumeCommand(),
    new CertificatesCommand(),
    new ProjectsCommand(),
    new ViewProjectCommand(),
    new ContactCommand(),
    new LsCommand(),
    new CdCommand(),
    new PwdCommand(),
    new CatCommand(),
    new HistoryCommand(),
    new EchoCommand(),
    new DateCommand(),
    new BannerCommand(),
    new ClearCommand(),
    // Ocultos
    new EditInfoCommand(),
    new SudoCommand(),
  ];
}
