// src/components/react/ProjectFilter.tsx — Ilha: botões de filtro + toggle hidden
'use client';

import React, { useState, useEffect } from 'react';
import { useSecrets } from '../../lib/secrets/engine';

const families = [
  { key: 'all', label: 'Todos', icon: 'fas fa-list' },
  { key: 'jogos', label: 'Jogos & Pixel', icon: 'fas fa-gamepad' },
  { key: 'dados', label: 'Dados', icon: 'fas fa-chart-line' },
  { key: 'web', label: 'Web & Apps', icon: 'fas fa-globe' },
  { key: 'visao', label: 'Visão', icon: 'fas fa-eye' },
] as const;

export function ProjectFilter() {
  const [activeFamily, setActiveFamily] = useState<'all' | 'jogos' | 'dados' | 'web' | 'visao'>('all');
  const [showHidden, setShowHidden] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const secrets = useSecrets();

  // Função para aplicar filtro diretamente nos cards
  const applyFilter = (family: typeof activeFamily, hidden: boolean) => {
    const grid = document.getElementById('bestiario-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('[data-family]');
    cards.forEach((card) => {
      const cardFamily = card.getAttribute('data-family');
      const cardStatus = card.getAttribute('data-status');
      const matchesFamily = family === 'all' || cardFamily === family;
      const matchesHidden = hidden || cardStatus !== 'arquivado';
      (card as HTMLElement).style.display = (matchesFamily && matchesHidden) ? 'flex' : 'none';
    });
  };

  // Inicialização client-side
  useEffect(() => {
    setIsClient(true);
    const params = new URLSearchParams(window.location.search);
    const family = params.get('family');
    const initialFamily = (family && families.some(f => f.key === family)) ? family : 'all';
    setActiveFamily(initialFamily as typeof activeFamily);
    // Aplica filtro inicial
    setTimeout(() => applyFilter(initialFamily, false), 0);
  }, []);

  const triggerEvent = (name: string) => {
    if (isClient && secrets) {
      secrets.triggerEvent(name);
    }
  };

  const handleFamilyChange = (family: typeof activeFamily) => {
    setActiveFamily(family);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (family === 'all') {
        url.searchParams.delete('family');
      } else {
        url.searchParams.set('family', family);
      }
      window.history.replaceState({}, '', url);
    }
    applyFilter(family, showHidden);
    triggerEvent(`filter-${family}`);
  };

  const handleHiddenToggle = () => {
    const next = !showHidden;
    setShowHidden(next);
    applyFilter(activeFamily, next);
    triggerEvent(next ? 'show-hidden' : 'hide-hidden');
  };

  // During SSR, render a simplified version without interactivity
  if (!isClient) {
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-3)',
          background: 'var(--paper)',
          border: '2px solid var(--line)',
          boxShadow: 'var(--shadow-1)',
        }}
        role="group"
        aria-label="Filtrar projetos por família"
      >
        {families.map(fam => (
          <button
            key={fam.key}
            disabled
            aria-pressed={false}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-3)',
              border: '2px solid var(--line)',
              background: 'var(--paper)',
              color: 'var(--ink-soft)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'not-allowed',
            }}
          >
            <i className={fam.icon} style={{ fontSize: 'var(--text-base)' }}></i>
            <span>{fam.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={gridRef} // <-- ref no container do grid para encontrar os cards
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-6)',
        padding: 'var(--space-3)',
        background: 'var(--paper)',
        border: '2px solid var(--line)',
        boxShadow: 'var(--shadow-1)',
      }}
      role="group"
      aria-label="Filtrar projetos por família"
    >
      {families.map(fam => (
        <button
          key={fam.key}
          onClick={() => handleFamilyChange(fam.key)}
          aria-pressed={activeFamily === fam.key}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            border: '2px solid',
            borderColor: activeFamily === fam.key ? 'var(--accent)' : 'var(--line-strong)',
            background: activeFamily === fam.key ? 'var(--accent)' : 'var(--paper)',
            color: activeFamily === fam.key ? 'var(--on-accent)' : 'var(--ink)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--dur-fast) var(--ease)',
          }}
          onMouseOver={e => {
            if (activeFamily !== fam.key) {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-1)';
            }
          }}
          onMouseOut={e => {
            if (activeFamily !== fam.key) {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <i className={fam.icon} style={{ fontSize: 'var(--text-base)' }}></i>
          <span>{fam.label}</span>
        </button>
      ))}

      <button
        onClick={handleHiddenToggle}
        aria-pressed={showHidden}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          border: '2px solid',
          borderColor: showHidden ? 'var(--p-blood)' : 'var(--line)',
          background: showHidden ? 'var(--p-blood)' : 'transparent',
          color: showHidden ? 'var(--on-accent)' : 'var(--ink-soft)',
          fontFamily: 'var(--font-hud)',
          fontSize: 'var(--text-xs)',
          cursor: 'pointer',
          transition: 'all var(--dur-fast) var(--ease)',
          marginLeft: 'auto',
        }}
      >
        <i className={showHidden ? 'fas fa-eye-slash' : 'fas fa-eye'} style={{ fontSize: 'var(--text-xs)' }}></i>
        <span>{showHidden ? 'Ocultar Arquivados' : 'Mostrar Arquivados'}</span>
      </button>
    </div>
  );
}