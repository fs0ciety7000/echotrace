import type { CommandRegistry } from '../shell/command.ts';
import { accessCommands } from './access.ts';
import { baseCommands } from './base.ts';
import { echoCommands } from './echo.ts';
import { fileCommands } from './files.ts';
import { networkCommands } from './network.ts';
import { textCommands } from './text.ts';

export function registerDefaultCommands(registry: CommandRegistry): CommandRegistry {
  return registry.register(
    ...baseCommands,
    ...fileCommands,
    ...textCommands,
    ...networkCommands,
    ...accessCommands,
    ...echoCommands,
  );
}
