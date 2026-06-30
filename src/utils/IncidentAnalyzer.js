/**
 * Lógica de estimativa de queda.
 *
 * O acelerômetro retorna aceleração nos eixos x, y e z. Para simplificar a
 * análise, calculamos o módulo da aceleração: sqrt(x² + y² + z²).
 * Em repouso, esse valor tende a ficar próximo de 1 g por causa da gravidade.
 *
 * Critério usado:
 * 1) possível queda livre: módulo muito baixo;
 * 2) impacto: pico alto logo depois;
 * 3) confirmação: pouca variação por alguns instantes após o impacto.
 */

export const SENSITIVITY_LEVELS = {
  alta: {
    label: 'Alta',
    description: 'Detecta impactos menores. Pode gerar mais falsos positivos.',
    freeFallG: 0.65,
    impactG: 2.25,
    immobilityMaxRange: 0.38
  },
  media: {
    label: 'Média',
    description: 'Equilíbrio entre precisão e sensibilidade.',
    freeFallG: 0.55,
    impactG: 2.65,
    immobilityMaxRange: 0.32
  },
  baixa: {
    label: 'Baixa',
    description: 'Exige impacto mais forte. Reduz falsos positivos.',
    freeFallG: 0.45,
    impactG: 3.05,
    immobilityMaxRange: 0.26
  }
};

export const DEFAULT_DETECTOR_STATE = {
  phase: 'normal',
  freeFallAt: null,
  impactAt: null,
  lastFallAt: 0,
  postImpactSamples: []
};

export const DETECTOR_CONFIG = {
  impactWindowMs: 1400,
  immobilityWindowMs: 1600,
  cooldownMs: 6000
};

export function calculateMagnitude({ x = 0, y = 0, z = 0 }) {
  return Math.sqrt(x * x + y * y + z * z);
}

export function formatG(value) {
  if (Number.isNaN(value) || value === undefined || value === null) return '0.000 g';
  return `${value.toFixed(3)} g`;
}

function getSampleRange(samples) {
  if (!samples.length) return 0;
  const values = samples.map((item) => item.magnitude);
  return Math.max(...values) - Math.min(...values);
}

export function getPhaseLabel(phase) {
  const labels = {
    normal: 'Monitorando normalmente',
    freefall: 'Possível queda livre detectada',
    impact: 'Impacto detectado; verificando imobilidade'
  };

  return labels[phase] || labels.normal;
}

export function processFallSample({ sample, state, sensitivityKey, now }) {
  const sensitivity = SENSITIVITY_LEVELS[sensitivityKey] || SENSITIVITY_LEVELS.media;
  const magnitude = calculateMagnitude(sample);
  const nextState = { ...state };

  if (now - nextState.lastFallAt < DETECTOR_CONFIG.cooldownMs) {
    return {
      magnitude,
      nextState,
      event: null
    };
  }

  if (nextState.phase === 'normal' && magnitude < sensitivity.freeFallG) {
    nextState.phase = 'freefall';
    nextState.freeFallAt = now;
  }

  if (nextState.phase === 'freefall') {
    const elapsed = now - nextState.freeFallAt;

    if (elapsed > DETECTOR_CONFIG.impactWindowMs) {
      nextState.phase = 'normal';
      nextState.freeFallAt = null;
    } else if (magnitude > sensitivity.impactG) {
      nextState.phase = 'impact';
      nextState.impactAt = now;
      nextState.postImpactSamples = [{ magnitude, time: now }];
    }
  }

  if (nextState.phase === 'impact') {
    const elapsed = now - nextState.impactAt;
    nextState.postImpactSamples = [
      ...nextState.postImpactSamples,
      { magnitude, time: now }
    ].filter((item) => now - item.time <= DETECTOR_CONFIG.immobilityWindowMs);

    if (elapsed >= DETECTOR_CONFIG.immobilityWindowMs) {
      const variation = getSampleRange(nextState.postImpactSamples);
      const confirmed = variation <= sensitivity.immobilityMaxRange;

      nextState.phase = 'normal';
      nextState.freeFallAt = null;
      nextState.impactAt = null;
      nextState.postImpactSamples = [];

      if (confirmed) {
        nextState.lastFallAt = now;
        return {
          magnitude,
          nextState,
          event: {
            type: 'fall',
            magnitude,
            variation,
            sensitivity: sensitivity.label,
            timestamp: new Date(now).toISOString()
          }
        };
      }
    }
  }

  return {
    magnitude,
    nextState,
    event: null
  };
}
