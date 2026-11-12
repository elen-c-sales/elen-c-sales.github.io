// src/lib/secrets/engine.tsx — SecretsProvider + hooks (ilha única)
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { SecretDef, SecretState, SecretReward } from './types';
import { secrets, getSecretById, getVisibleSecrets, getSecretCount } from './definitions';
import {
  loadState,
  saveState,
  processTriggers,
  getUnlockedCount,
  evaluateTrigger,
  checkKonami,
} from './logic';

interface SecretsContextValue {
  state: SecretState;
  unlockedCount: number;
  totalSecrets: number;
  visibleSecrets: SecretDef[];
  triggerEvent: (name: string) => void;
  registerClick: (selector: string) => void;
  registerVisit: (slug: string) => void;
  checkDevtools: () => void;
  unlockSecret: (id: string) => void;
}

const SecretsContext = createContext<SecretsContextValue | null>(null);

// Mock context for SSR
const mockContext: SecretsContextValue = {
  state: { unlocked: {}, progress: {}, lastCheck: Date.now() },
  unlockedCount: 0,
  totalSecrets: 9,
  visibleSecrets: [],
  triggerEvent: () => {},
  registerClick: () => {},
  registerVisit: () => {},
  checkDevtools: () => {},
  unlockSecret: () => {},
};

export function useSecrets() {
  const ctx = useContext(SecretsContext);
  // During SSR, context might not be available yet
  return ctx ?? mockContext;
}

interface Toast {
  id: number;
  message: string;
  type: 'hint' | 'achievement' | 'page' | 'theme';
}

export function SecretsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SecretState>(() => loadState());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const keySequenceRef = useRef<string[]>([]);
  const toastIdRef = useRef(0);
  const devtoolsCheckInterval = useRef<number>();

  const unlockedCount = getUnlockedCount(state);
  const totalSecrets = getSecretCount();
  const visibleSecrets = getVisibleSecrets();

  useEffect(() => {
    saveState(state);
  }, [state]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'hint') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const applyReward = useCallback((reward: SecretReward) => {
    switch (reward.kind) {
      case 'theme': {
        document.documentElement.dataset.theme = reward.value;
        localStorage.setItem('codex.theme', reward.value);
        showToast(`Tema "${reward.value}" desbloqueado!`, 'theme');
        break;
      }
      case 'page': {
        showToast(`Página secreta: ${reward.value}`, 'page');
        break;
      }
      case 'hint': {
        showToast(reward.value, 'hint');
        break;
      }
      case 'achievement': {
        showToast(`Conquista: ${reward.value}`, 'achievement');
        break;
      }
      case 'toast': {
        showToast(reward.value, 'hint');
        break;
      }
    }
  }, [showToast]);

  const processAndApply = useCallback((
    context: { keySequence?: string[]; selector?: string; slug?: string; eventName?: string }
  ) => {
    setState(prev => {
      const { newState, rewards } = processTriggers(prev, context);
      rewards.forEach(({ reward }) => applyReward(reward));
      return newState;
    });
  }, [applyReward]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keySequenceRef.current.push(e.code);
      if (keySequenceRef.current.length > 20) {
        keySequenceRef.current.shift();
      }

      if (checkKonami(keySequenceRef.current)) {
        processAndApply({ keySequence: keySequenceRef.current });
        keySequenceRef.current = [];
      }

      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setTerminalOpen(prev => !prev);
        if (!terminalOpen) {
          processAndApply({ eventName: 'terminal-open' });
        }
      }

      if (e.key === 'Escape' && terminalOpen) {
        setTerminalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processAndApply, terminalOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const secretEl = target.closest('[data-secret]') as HTMLElement | null;
      if (secretEl) {
        const selector = `[data-secret="${secretEl.dataset.secret}"]`;
        processAndApply({ selector });
      }

      if (target.id === 'sigil-footer' || target.closest('#sigil-footer')) {
        processAndApply({ selector: '#sigil-footer' });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [processAndApply]);

  useEffect(() => {
    const check = () => {
      if (evaluateTrigger({ type: 'devtools' }, {})) {
        processAndApply({});
      }
    };
    devtoolsCheckInterval.current = window.setInterval(check, 3000);
    check();
    return () => {
      if (devtoolsCheckInterval.current) clearInterval(devtoolsCheckInterval.current);
    };
  }, [processAndApply]);

  useEffect(() => {
    processAndApply({});
  }, [processAndApply]);

  const triggerEvent = useCallback((name: string) => {
    processAndApply({ eventName: name });
  }, [processAndApply]);

  const registerClick = useCallback((selector: string) => {
    processAndApply({ selector });
  }, [processAndApply]);

  const registerVisit = useCallback((slug: string) => {
    processAndApply({ slug });
  }, [processAndApply]);

  const checkDevtools = useCallback(() => {
    processAndApply({});
  }, [processAndApply]);

  const unlockSecret = useCallback((id: string) => {
    const secret = getSecretById(id);
    if (secret && !state.unlocked[id]) {
      setState(prev => mergeState(prev, { unlocked: { [id]: true } }));
      applyReward(secret.reward);
    }
  }, [state.unlocked, applyReward]);

  function mergeState(base: SecretState, incoming: Partial<SecretState>): SecretState {
    return {
      unlocked: { ...base.unlocked, ...incoming.unlocked },
      progress: { ...base.progress, ...incoming.progress },
      lastCheck: incoming.lastCheck ?? base.lastCheck,
    };
  }

  const value: SecretsContextValue = {
    state,
    unlockedCount,
    totalSecrets,
    visibleSecrets,
    triggerEvent,
    registerClick,
    registerVisit,
    checkDevtools,
    unlockSecret,
  };

  return (
    <SecretsContext.Provider value={value}>
      {children}
      <Toasts toasts={toasts} />
      <Terminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
      <HUD unlockedCount={unlockedCount} totalSecrets={totalSecrets} />
    </SecretsContext.Provider>
  );
}

function Toasts({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notificações"
      style={{
        position: 'fixed',
        bottom: 'var(--space-4)',
        right: 'var(--space-4)',
        zIndex: 'var(--z-toast)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            background: 'var(--paper)',
            border: '2px solid var(--line-strong)',
            boxShadow: 'var(--shadow-2)',
            padding: 'var(--space-3) var(--space-4)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink)',
            maxWidth: '320px',
            animation: 'slide-up var(--dur-med) var(--ease)',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function HUD({ unlockedCount, totalSecrets }: { unlockedCount: number; totalSecrets: number }) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-hud)',
        background: 'var(--paper)',
        borderBottom: '2px solid var(--line)',
        boxShadow: 'var(--shadow-1)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'var(--space-3) var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span
            id="sigil-footer"
            style={{
              fontFamily: 'var(--font-hud)',
              fontSize: 'var(--text-lg)',
              color: 'var(--accent)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            title="Clique para revelar"
          >
            ⟠
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600 }}>
            CÓDICE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span
            style={{
              fontFamily: 'var(--font-hud)',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-soft)',
            }}
          >
            Segredos: {unlockedCount}/{totalSecrets}
          </span>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

function ThemeSwitcher() {
  const { state } = useSecrets();
  const themes = ['manuscript', 'candle', 'void'] as const;
  const currentTheme = document.documentElement.dataset.theme ?? 'candle';
  const currentIndex = themes.indexOf(currentTheme as typeof themes[number]);
  const voidUnlocked = state.unlocked.konami;

  const cycleTheme = () => {
    let nextIndex = (currentIndex + 1) % themes.length;
    if (themes[nextIndex] === 'void' && !voidUnlocked) {
      nextIndex = (nextIndex + 1) % themes.length;
    }
    const nextTheme = themes[nextIndex];
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('codex.theme', nextTheme);
  };

  return (
    <button
      onClick={cycleTheme}
      aria-label={`Tema atual: ${currentTheme}. Clique para alternar.`}
      style={{
        fontFamily: 'var(--font-hud)',
        fontSize: 'var(--text-xs)',
        padding: 'var(--space-1) var(--space-3)',
        border: '2px solid var(--line-strong)',
        background: 'var(--paper)',
        color: 'var(--ink)',
        cursor: 'pointer',
        transition: 'transform var(--dur-fast), box-shadow var(--dur-fast)',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translate(-2px, -2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-1)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {currentTheme.toUpperCase()}
      {currentTheme === 'void' && <span style={{ marginLeft: 'var(--space-1)', color: 'var(--accent-ink)' }}>✧</span>}
    </button>
  );
}

function Terminal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{ type: 'input' | 'output'; text: string }>>([]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { triggerEvent } = useSecrets();

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const commands: Record<string, { desc: string; fn: (args: string[]) => string | string[] }> = {
    help: {
      desc: 'Lista comandos disponíveis',
      fn: () => Object.entries(commands).map(([k, v]) => `  ${k.padEnd(12)} ${v.desc}`),
    },
    ls: {
      desc: 'Lista projetos (slugs)',
      fn: () => ['pomodoro-diabrete', 'gunship-cqb', 'inadimplencia-brasil', 'doom-fire'],
    },
    open: {
      desc: 'Abre página de projeto: open <slug>',
      fn: (args) => {
        if (!args[0]) return 'Uso: open <slug>';
        triggerEvent(`visit-${args[0]}`);
        return `Abrindo ${args[0]}...`;
      },
    },
    theme: {
      desc: 'Altera tema: theme <manuscript|candle|void>',
      fn: (args) => {
        if (!args[0]) return `Tema atual: ${document.documentElement.dataset.theme}`;
        const valid = ['manuscript', 'candle', 'void'];
        if (!valid.includes(args[0])) return `Temas válidos: ${valid.join(', ')}`;
        document.documentElement.dataset.theme = args[0];
        localStorage.setItem('codex.theme', args[0]);
        return `Tema alterado para ${args[0]}`;
      },
    },
    secret: {
      desc: 'Lista segredos desbloqueados',
      fn: () => {
        const { state } = useSecrets();
        const unlocked = Object.entries(state.unlocked)
          .filter(([, v]) => v)
          .map(([k]) => k);
        return unlocked.length ? unlocked : ['(nenhum ainda)'];
      },
    },
    whoami: {
      desc: 'Identidade do usuário',
      fn: () => ['Elen Camila Sales Silva', 'Dev Full-Stack & Data Science', 'Keeper of the Codex'],
    },
    clear: {
      desc: 'Limpa histórico',
      fn: () => { setHistory([]); return []; },
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setHistory(prev => [...prev, { type: 'input', text: `> ${trimmed}` }]);

    const [cmd, ...args] = trimmed.split(/\s+/);
    const command = commands[cmd];

    if (command) {
      const result = command.fn(args);
      const output = Array.isArray(result) ? result.join('\n') : result;
      if (output) {
        setHistory(prev => [...prev, { type: 'output', text: output }]);
      }
    } else {
      setHistory(prev => [...prev, { type: 'output', text: `Comando desconhecido: ${cmd}. Digite 'help'.` }]);
    }

    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-modal)',
        background: 'var(--p-ink)',
        borderTop: '2px solid var(--line-strong)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        maxHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-hud)',
        fontSize: 'var(--text-xs)',
        color: 'var(--p-mint)',
      }}
      role="dialog"
      aria-label="Terminal do Códice"
    >
      <div
        style={{
          padding: 'var(--space-2) var(--space-3)',
          borderBottom: '2px solid var(--line-strong)',
          background: 'var(--p-ink-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--p-candle)',
        }}
      >
        <span>⬢ TERMINAL.CODEX</span>
        <button
          onClick={onClose}
          aria-label="Fechar terminal"
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            cursor: 'pointer',
            padding: 'var(--space-1)',
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
        }}
      >
        {history.map((entry, i) => (
          <div
            key={i}
            style={{
              color: entry.type === 'input' ? 'var(--p-candle)' : 'var(--p-mint)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {entry.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', padding: 'var(--space-2) var(--space-3)', borderTop: '2px solid var(--line-strong)' }}>
        <span style={{ color: 'var(--p-candle)', marginRight: 'var(--space-2)' }}>{" > "}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') onClose();
          }}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            outline: 'none',
          }}
          placeholder="Digite 'help' para comandos"
          autoComplete="off"
        />
        {cursorVisible && <span style={{ color: 'var(--p-candle)', animation: 'blink 1s step-end infinite' }}>█</span>}
      </form>
    </div>
  );
}