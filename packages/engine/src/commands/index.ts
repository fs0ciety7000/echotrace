import type { CommandRegistry } from '../shell/command.ts';
import { accessCommands } from './access.ts';
import { baseCommands } from './base.ts';
import { defenseCommands } from './defense.ts';
import { dossierCommands } from './dossier.ts';
import { echoCommands } from './echo.ts';
import { fileCommands } from './files.ts';
import { intelCommands } from './intel.ts';
import { networkCommands } from './network.ts';
import { systemCommands } from './system.ts';
import { textCommands } from './text.ts';
import { webCommands } from './web.ts';

export function registerDefaultCommands(registry: CommandRegistry): CommandRegistry {
  return registry.register(
    ...baseCommands,
    ...fileCommands,
    ...textCommands,
    ...networkCommands,
    ...intelCommands,
    ...webCommands,
    ...systemCommands,
    ...accessCommands,
    ...echoCommands,
    ...defenseCommands,
    ...dossierCommands,
  );
}
