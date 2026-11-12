// tests/secrets.test.ts — Testes da engine de segredos (lógica pura)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkKonami,
  checkHour,
  mergeState,
  loadState,
  saveState,
  evaluateTrigger,
  processTriggers,
  getUnlockedCount,
  getTotalSecrets,
} from '../src/lib/secrets/logic';
import { secrets, DEFAULT_STATE } from '../src/lib/secrets/definitions';
import type { SecretState } from '../src/lib/secrets/types';

// Mock localStorage
const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
});

vi.stubGlobal('window', {
  outerWidth: 1024,
  innerWidth: 1024,
  outerHeight: 768,
  innerHeight: 768,
  Date,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  matchMedia: vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
});

describe('Secrets Logic', () => {
  beforeEach(() => {
    mockStorage['codex.secrets.v1'] = JSON.stringify(DEFAULT_STATE);
  });

  describe('checkKonami', () => {
    it('retorna true para sequência correta', () => {
      const sequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
      ];
      expect(checkKonami(sequence)).toBe(true);
    });

    it('retorna false para sequência incorreta', () => {
      expect(checkKonami(['ArrowUp', 'ArrowDown'])).toBe(false);
    });

    it('retorna false para sequência vazia', () => {
      expect(checkKonami([])).toBe(false);
    });

    it('detecta konami no final de sequência longa', () => {
      const sequence = ['KeyX', 'KeyY', 'KeyZ',
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
      ];
      expect(checkKonami(sequence)).toBe(true);
    });
  });

  describe('checkHour', () => {
    it('retorna true quando hora está no range', () => {
      // Mock Date para hora 00:30
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T00:30:00'));
      expect(checkHour([0, 1])).toBe(true);
      vi.useRealTimers();
    });

    it('retorna false quando hora fora do range', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00'));
      expect(checkHour([0, 1])).toBe(false);
      vi.useRealTimers();
    });

    it('funciona com range que cruza meia-noite', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T23:30:00'));
      expect(checkHour([22, 2])).toBe(true);
      vi.useRealTimers();
    });
  });

  describe('mergeState', () => {
    it('merge unlocked corretamente', () => {
      const base: SecretState = { unlocked: { a: true }, progress: {}, lastCheck: 0 };
      const incoming: Partial<SecretState> = { unlocked: { b: true } };
      const result = mergeState(base, incoming);
      expect(result.unlocked).toEqual({ a: true, b: true });
    });

    it('merge progress corretamente', () => {
      const base: SecretState = { unlocked: {}, progress: { a: 3 }, lastCheck: 0 };
      const incoming: Partial<SecretState> = { progress: { b: 1 } };
      const result = mergeState(base, incoming);
      expect(result.progress).toEqual({ a: 3, b: 1 });
    });

    it('sobrescreve lastCheck', () => {
      const base: SecretState = { unlocked: {}, progress: {}, lastCheck: 100 };
      const incoming: Partial<SecretState> = { lastCheck: 200 };
      const result = mergeState(base, incoming);
      expect(result.lastCheck).toBe(200);
    });
  });

  describe('loadState/saveState', () => {
    it('carrega estado padrão quando storage vazio', () => {
      mockStorage['codex.secrets.v1'] = '';
      const state = loadState();
      expect(state.unlocked).toEqual({});
      expect(state.progress).toEqual({});
      expect(typeof state.lastCheck).toBe('number');
      expect(state.lastCheck).toBeGreaterThan(0);
    });

    it('carrega estado salvo', () => {
      const customState: SecretState = {
        unlocked: { konami: true },
        progress: { diabrete: 3 },
        lastCheck: 1234567890,
      };
      mockStorage['codex.secrets.v1'] = JSON.stringify(customState);
      const state = loadState();
      expect(state).toEqual(customState);
    });

    it('salva estado no storage', () => {
      const state: SecretState = { unlocked: { test: true }, progress: {}, lastCheck: 0 };
      saveState(state);
      expect(mockStorage['codex.secrets.v1']).toBe(JSON.stringify(state));
    });
  });

  describe('evaluateTrigger', () => {
    it('avalia konami corretamente', () => {
      const trigger = { type: 'konami' as const };
      expect(evaluateTrigger(trigger, { keySequence: [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
      ] })).toBe(true);
    });

    it('avalia click corretamente', () => {
      const trigger = { type: 'click' as const, selector: '#test' };
      expect(evaluateTrigger(trigger, { selector: '#test' })).toBe(true);
      expect(evaluateTrigger(trigger, { selector: '#other' })).toBe(false);
    });

    it('avalia visit corretamente', () => {
      const trigger = { type: 'visit' as const, slug: 'gunship-cqb' };
      expect(evaluateTrigger(trigger, { slug: 'gunship-cqb' })).toBe(true);
      expect(evaluateTrigger(trigger, { slug: 'other' })).toBe(false);
    });

    it('avalia event corretamente', () => {
      const trigger = { type: 'event' as const, name: 'terminal-open' };
      expect(evaluateTrigger(trigger, { eventName: 'terminal-open' })).toBe(true);
      expect(evaluateTrigger(trigger, { eventName: 'other' })).toBe(false);
    });
  });

  describe('processTriggers', () => {
    it('desbloqueia segredo konami e retorna reward', () => {
      const state = loadState();
      const { newState, rewards } = processTriggers(state, {
        keySequence: [
          'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
          'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
          'KeyB', 'KeyA'
        ]
      });
      expect(newState.unlocked.konami).toBe(true);
      expect(rewards).toHaveLength(1);
      expect(rewards[0].secretId).toBe('konami');
      expect(rewards[0].reward.kind).toBe('theme');
    });

    it('incrementa progress para click-count', () => {
      const state = loadState();
      const { newState } = processTriggers(state, { selector: '[data-secret="diabrete"]' });
      expect(newState.progress.diabrete).toBe(1);
    });

    it('desbloqueia diabrete após 5 cliques', () => {
      let state = loadState();
      for (let i = 0; i < 5; i++) {
        const result = processTriggers(state, { selector: '[data-secret="diabrete"]' });
        state = result.newState;
      }
      expect(state.unlocked.diabrete).toBe(true);
      expect(state.progress.diabrete).toBe(5);
    });

    it('não processa segredos já desbloqueados', () => {
      let state = { ...loadState(), unlocked: { konami: true } };
      const { newState, rewards } = processTriggers(state, {
        keySequence: [
          'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
          'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
          'KeyB', 'KeyA'
        ]
      });
      expect(rewards).toHaveLength(0);
      expect(newState.unlocked.konami).toBe(true);
    });
  });

  describe('getUnlockedCount', () => {
    it('conta segredos desbloqueados', () => {
      const state: SecretState = { unlocked: { a: true, b: false, c: true }, progress: {}, lastCheck: 0 };
      expect(getUnlockedCount(state)).toBe(2);
    });
  });

  describe('getTotalSecrets', () => {
    it('retorna número total de segredos definidos', () => {
      expect(getTotalSecrets()).toBe(secrets.length);
      expect(getTotalSecrets()).toBe(9);
    });
  });
});