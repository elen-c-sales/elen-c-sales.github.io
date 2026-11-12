// src/components/react/ThemeSwitcher.tsx — Ilha: ciclo de temas (void só se unlocked)
'use client';

import React from 'react';
import { useSecrets } from '../../lib/secrets/engine';

const themes = ['manuscript', 'candle', 'void'] as const;

export function ThemeSwitcher() {
  const { state } = useSecrets();
  const currentTheme = document.documentElement.dataset.theme ?? 'candle';
  const currentIndex = themes.indexOf(currentTheme as typeof themes[number]);
  const voidUnlocked = state.unlocked.konami;

  const cycleTheme = () => {
    let nextIndex = (currentIndex + 1) % themes.length;
    // Pula void se não desbloqueado
    if (themes[nextIndex] === 'void' && !voidUnlocked) {
      nextIndex = (nextIndex + 1) % themes.length;
    }
    const nextTheme = themes[nextIndex];
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('codex.theme', nextTheme);
  };

  const themeLabels: Record<string, string> = {
    manuscript: 'Manuscrito',
    candle: 'Vela',
    void: 'Vazio',
  };

  return (
    <button
      onClick={cycleTheme}
      aria-label={`Tema atual: ${themeLabels[currentTheme]}. Clique para alternar.`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        border: '2px solid var(--line-strong)',
        background: 'var(--paper)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-hud)',
        fontSize: 'var(--text-xs)',
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
      <i className="fas fa-palette" style={{ fontSize: 'var(--text-xs)' }}></i>
      <span>{themeLabels[currentTheme].toUpperCase()}</span>
      {currentTheme === 'void' && (
        <span style={{ color: 'var(--accent-ink)', fontSize: 'var(--text-xs)' }}>✧</span>
      )}
    </button>
  );
}