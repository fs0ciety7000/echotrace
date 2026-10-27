import { useEffect } from 'react';
import { CommsDrawer } from './features/comms/CommsDrawer.tsx';
import { ConceptDrawer } from './features/journal/ConceptDrawer.tsx';
import { BriefingModal } from './features/missions/BriefingModal.tsx';
import { ChoiceModal } from './features/missions/ChoiceModal.tsx';
import { DebriefModal } from './features/missions/DebriefModal.tsx';
import { SettingsModal } from './features/SettingsModal.tsx';
import { Academy } from './screens/Academy.tsx';
import { Ending } from './screens/Ending.tsx';
import { MainMenu } from './screens/MainMenu.tsx';
import { Operator } from './screens/Operator.tsx';
import { useGame } from './state/game.ts';
import { applySettings, useSettings } from './state/settings.ts';
import { Toasts } from './ui/Toasts.tsx';

export function App() {
  const screen = useGame((s) => s.screen);
  const init = useGame((s) => s.init);
  const legible = useSettings((s) => s.legible);
  const reducedMotion = useSettings((s) => s.reducedMotion);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => applySettings({ legible, reducedMotion }), [legible, reducedMotion]);

  return (
    <div className="grain h-full">
      {screen === 'menu' ? (
        <MainMenu />
      ) : screen === 'banc' ? (
        <Academy />
      ) : screen === 'ending' ? (
        <Ending />
      ) : (
        <Operator />
      )}
      <BriefingModal />
      <DebriefModal />
      <ChoiceModal />
      <SettingsModal />
      <ConceptDrawer />
      <CommsDrawer />
      <Toasts />
    </div>
  );
}
