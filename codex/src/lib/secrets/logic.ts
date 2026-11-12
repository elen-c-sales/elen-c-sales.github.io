// src/lib/secrets/logic.ts — Lógica pura dos triggers (testável)
import type { SecretDef, SecretState, SecretTrigger } from './types';
import { secrets, getSecretById } from './definitions';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

export function checkKonami(sequence: string[]): boolean {
  if (sequence.length < KONAMI_CODE.length) return false;
  const recent = sequence.slice(-KONAMI_CODE.length);
  return recent.every((key, i) => key === KONAMI_CODE[i]);
}

export function checkHour(range: [number, number]): boolean {
  const hour = new Date().getHours();
  const [start, end] = range;
  if (start <= end) {
    return hour >= start && hour <= end;
  }
  // range cruza meia-noite (ex: [22, 2])
  return hour >= start || hour <= end;
}

export function checkDevtools(): boolean {
  // Heurística: devtools aberto muda dimensionamento da janela
  // Nota: não 100% confiável, mas funciona na maioria dos casos
  const threshold = 160;
  return (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  );
}

export function mergeState(base: SecretState, incoming: Partial<SecretState>): SecretState {
  return {
    unlocked: { ...base.unlocked, ...incoming.unlocked },
    progress: { ...base.progress, ...incoming.progress },
    lastCheck: incoming.lastCheck ?? base.lastCheck,
  };
}

export function loadState(): SecretState {
  try {
    const raw = localStorage.getItem('codex.secrets.v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validação básica
      if (parsed && typeof parsed === 'object') {
        return {
          unlocked: parsed.unlocked ?? {},
          progress: parsed.progress ?? {},
          lastCheck: parsed.lastCheck ?? Date.now(),
        };
      }
    }
  } catch {
    // Ignora erro de parse
  }
  return {
    unlocked: {},
    progress: {},
    lastCheck: Date.now(),
  };
}

export function saveState(state: SecretState): void {
  try {
    localStorage.setItem('codex.secrets.v1', JSON.stringify(state));
  } catch {
    // Ignora erro de quota/storage
  }
}

export function evaluateTrigger(
  trigger: SecretTrigger,
  context: { keySequence?: string[]; selector?: string; slug?: string; eventName?: string }
): boolean {
  switch (trigger.type) {
    case 'konami':
      return checkKonami(context.keySequence ?? []);
    case 'click-count':
      return false; // Verificado via progress no state
    case 'click':
      return context.selector === trigger.selector;
    case 'visit':
      return context.slug === trigger.slug;
    case 'event':
      return context.eventName === trigger.name;
    case 'hour':
      return checkHour(trigger.range);
    case 'devtools':
      return checkDevtools();
    default:
      return false;
  }
}

export function processTriggers(
  state: SecretState,
  context: { keySequence?: string[]; selector?: string; slug?: string; eventName?: string }
): { newState: SecretState; rewards: Array<{ secretId: string; reward: SecretDef['reward'] }> } {
  let newState = { ...state };
  const rewards: Array<{ secretId: string; reward: SecretDef['reward'] }> = [];

  for (const secret of secrets) {
    if (newState.unlocked[secret.id]) continue; // Já desbloqueado

    let triggered = false;

    switch (secret.trigger.type) {
      case 'click-count': {
        const current = newState.progress[secret.id] ?? 0;
        if (context.selector === secret.trigger.selector) {
          const next = current + 1;
          newState = mergeState(newState, { progress: { [secret.id]: next } });
          if (next >= secret.trigger.count) {
            triggered = true;
          }
        }
        break;
      }
      case 'hour': {
        // Só verifica uma vez por sessão para não spammar
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        if (now - newState.lastCheck > dayMs) {
          newState = mergeState(newState, { lastCheck: now });
          if (evaluateTrigger(secret.trigger, context)) {
            triggered = true;
          }
        }
        break;
      }
      default: {
        if (evaluateTrigger(secret.trigger, context)) {
          triggered = true;
        }
      }
    }

    if (triggered) {
      newState = mergeState(newState, { unlocked: { [secret.id]: true } });
      rewards.push({ secretId: secret.id, reward: secret.reward });
    }
  }

  return { newState, rewards };
}

export function getUnlockedCount(state: SecretState): number {
  return Object.keys(state.unlocked).filter(k => state.unlocked[k]).length;
}

export function getTotalSecrets(): number {
  return secrets.length;
}