/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CurtainModel, Fabric } from './types';

export const CURTAIN_MODELS: CurtainModel[] = [
  {
    id: 'wave',
    name: 'Wave (Efeito Ondas)',
    description: 'Pregas fluidas e ondas simétricas perfeitas. Ideal para trilhos modernos.',
    defaultFoldFactor: 2.8,
    requiredAccessories: [
      {
        name: 'Trilho Suíço para Wave',
        description: 'Trilho de alumínio ideal para o deslizamento de cortinas tipo wave.',
        suggestedPrice: 45.0,
        unit: 'm',
        calculateQty: (w) => w,
        mandatory: true,
      },
      {
        name: 'Cordão Limitador / Cordão Wave (8cm)',
        description: 'Mantém o distanciamento exato das curvas para formar ondas perfeitas.',
        suggestedPrice: 15.0,
        unit: 'm',
        calculateQty: (w) => w,
        mandatory: true,
      },
      {
        name: 'Deslizantes para Wave (Passo 8cm)',
        description: 'Deslizante especial que corre livre guiado pelo cordão limitador.',
        suggestedPrice: 2.5,
        unit: 'un',
        // ~13.5 slide hooks per meter of fabric (width * foldFactor * 13.5)
        calculateQty: (w, h, f) => Math.ceil(w * f * 12.5),
        mandatory: true,
      },
      {
        name: 'Fita Wave para Cabeçote',
        description: 'Fita de sustentação translúcida costurada no topo da cortina.',
        suggestedPrice: 10.0,
        unit: 'm',
        calculateQty: (w, h, f) => Math.ceil(w * f + 0.5),
        mandatory: true,
      },
      {
        name: 'Terminais de Trilho (Par)',
        description: 'Par de limitadores de fim de curso para fixar as pontas da cortina.',
        suggestedPrice: 8.0,
        unit: 'par',
        calculateQty: () => 1,
        mandatory: true,
      },
    ],
  },
  {
    id: 'americana',
    name: 'Prega Americana',
    description: 'Pregas triplas clássicas costuradas na parte superior. visual sofisticado e tradicional.',
    defaultFoldFactor: 2.5,
    requiredAccessories: [
      {
        name: 'Trilho Comum / Suíço Simples',
        description: 'Trilho de alumínio para deslizamento convencional.',
        suggestedPrice: 35.0,
        unit: 'm',
        calculateQty: (w) => w,
        mandatory: true,
      },
      {
        name: 'Entretela de Algodão (Pregas)',
        description: 'Material rígido colocado interna e superiormente para estruturar as dobras.',
        suggestedPrice: 8.5,
        unit: 'm',
        calculateQty: (w, h, f) => Math.ceil(w * f),
        mandatory: true,
      },
      {
        name: 'Deslizantes Comuns',
        description: 'Deslizantes convencionais em polietileno.',
        suggestedPrice: 0.8,
        unit: 'un',
        // One glider roughly every 10cm of flat fabric
        calculateQty: (w, h, f) => Math.ceil((w * f) * 10),
        mandatory: true,
      },
      {
        name: 'Ganchos Caracol / Argolas',
        description: 'Ganchos de metal ou nylon para prender o tecido nos deslizantes.',
        suggestedPrice: 1.2,
        unit: 'un',
        calculateQty: (w, h, f) => Math.ceil((w * f) * 10),
        mandatory: true,
      },
    ],
  },
  {
    id: 'femea',
    name: 'Prega Fêmea',
    description: 'Dobras voltadas para dentro criando uma superfície lisa com volume interno discreto.',
    defaultFoldFactor: 2.5,
    requiredAccessories: [
      {
        name: 'Trilho Comum / Suíço Simples',
        description: 'Trilho de alumínio para deslizamento convencional.',
        suggestedPrice: 35.0,
        unit: 'm',
        calculateQty: (w) => w,
        mandatory: true,
      },
      {
        name: 'Entretela Estruturante',
        description: 'Posicionada no topo para garantir a sustentação da prega fêmea.',
        suggestedPrice: 8.5,
        unit: 'm',
        calculateQty: (w, h, f) => Math.ceil(w * f),
        mandatory: true,
      },
      {
        name: 'Deslizantes Comuns',
        description: 'Deslizantes convencionais em polietileno.',
        suggestedPrice: 0.8,
        unit: 'un',
        calculateQty: (w, h, f) => Math.ceil((w * f) * 10),
        mandatory: true,
      },
      {
        name: 'Ganchos Caracol',
        description: 'Para conexão com a sanca ou trilho suíço.',
        suggestedPrice: 1.2,
        unit: 'un',
        calculateQty: (w, h, f) => Math.ceil((w * f) * 10),
        mandatory: true,
      },
    ],
  },
  {
    id: 'macho',
    name: 'Prega Macho',
    description: 'Dobras voltadas para fora, com excelente caimento reto e encorpado de hotelaria.',
    defaultFoldFactor: 2.6,
    requiredAccessories: [
      {
        name: 'Trilho Comum / Suíço Simples',
        description: 'Trilho de alumínio para deslizamento convencional.',
        suggestedPrice: 35.0,
        unit: 'm',
        calculateQty: (w) => w,
        mandatory: true,
      },
      {
        name: 'Entretela Estruturante para Topo',
        description: 'Reforço rígido costurado sob as costuras das pregas externas.',
        suggestedPrice: 8.5,
        unit: 'm',
        calculateQty: (w, h, f) => Math.ceil(w * f),
        mandatory: true,
      },
      {
        name: 'Deslizantes Comuns',
        description: 'Deslizantes em polietileno para suporte de peso.',
        suggestedPrice: 0.8,
        unit: 'un',
        calculateQty: (w, h, f) => Math.ceil((w * f) * 10),
        mandatory: true,
      },
      {
        name: 'Ganchos de Prega Metálicos (Caracol)',
        description: 'Fornecem a fixação vertical ideal das dobras macho.',
        suggestedPrice: 1.5,
        unit: 'un',
        calculateQty: (w, h, f) => Math.ceil((w * f) * 10),
        mandatory: true,
      },
    ],
  },
  {
    id: 'ilhos',
    name: 'Ilhós',
    description: 'Cortina montada diretamente sobre varão através de anéis plásticos ou metálicos.',
    defaultFoldFactor: 2.0,
    requiredAccessories: [
      {
        name: 'Varão de Cortina Cromado / Pintado',
        description: 'Varão cilíndrico de alumínio ou metal.',
        suggestedPrice: 55.0,
        unit: 'm',
        calculateQty: (w) => w + 0.2, // Adiciona margem das ponteiras de 10cm de cada lado
        mandatory: true,
      },
      {
        name: 'Suportes de Varão de Parede / Teto',
        description: 'Suportes para fixação estável do varão.',
        suggestedPrice: 18.0,
        unit: 'un',
        // Every 1.5 meters needs a bracket, minimum of 2
        calculateQty: (w) => Math.max(2, Math.ceil(w / 1.5) + 1),
        mandatory: true,
      },
      {
        name: 'Anéis de Ilhós Redondos',
        description: 'Anéis plásticos/metálicos aplicados diretamente sob furos no tecido.',
        suggestedPrice: 3.5,
        unit: 'un',
        // Double-quantity of calculated widths to form perfect folds (even number required)
        calculateQty: (w, h, f) => {
          const flatWidth = w * f;
          const qty = Math.ceil(flatWidth * 8); // ~8 items per meter of flat fabric
          return qty % 2 === 0 ? qty : qty + 1; // force even count
        },
        mandatory: true,
      },
      {
        name: 'Entretela de Ilhós Perfurada (Entre-tela)',
        description: 'Permite furar e fixar perfeitamente o ilhós ao cabeçote.',
        suggestedPrice: 12.0,
        unit: 'm',
        calculateQty: (w, h, f) => Math.ceil(w * f),
        mandatory: true,
      },
      {
        name: 'Ponteiras Decorativas do Varão (Par)',
        description: 'Finais estéticos e limitadores do varão cilíndrico.',
        suggestedPrice: 15.0,
        unit: 'par',
        calculateQty: () => 1,
        mandatory: true,
      },
    ],
  },
];

export const PRESETS_FABRICS: Fabric[] = [
  {
    id: 'linho-sintetico',
    name: 'Linho Sintético Prime (Poliéster)',
    category: 'Linho',
    pricePerMeter: 65.0,
    width: 3.0,
    direction: 'horizontal',
    composition: '100% Poliéster',
  },
  {
    id: 'linho-puro',
    name: 'Linho Rústico Puro (Nacional)',
    category: 'Linho',
    pricePerMeter: 145.0,
    width: 2.8,
    direction: 'horizontal',
    composition: '100% Linho Natural',
  },
  {
    id: 'voil-prime',
    name: 'Voil Flame / Gaze de Linho Delicado',
    category: 'Voil',
    pricePerMeter: 38.0,
    width: 3.0,
    direction: 'horizontal',
    composition: '100% Poliéster',
  },
  {
    id: 'shantung',
    name: 'Seda Shantung Premium',
    category: 'Seda',
    pricePerMeter: 95.0,
    width: 1.4,
    direction: 'vertical',
    composition: '80% Poliéster, 20% Seda',
  },
  {
    id: 'blackout-tecido',
    name: 'Blecaute Tecido 100% Corta Vento (Fosco)',
    category: 'Corta Luz',
    pricePerMeter: 55.0,
    width: 2.8,
    direction: 'horizontal',
    composition: '100% Poliéster / Revestimento Acrílico',
  },
  {
    id: 'veludo-lux',
    name: 'Veludo Cotelê Paris (Super Encorpado)',
    category: 'Veludo',
    pricePerMeter: 120.0,
    width: 1.4,
    direction: 'vertical',
    composition: '100% Algodão/Poliest.',
  },
];

export const OTHER_OPTIONAL_ACCESSORIES = [
  { name: 'Abraçadeira Estilo Pingente clássico', price: 42.0, unit: 'un' as const, description: 'Prendedores de tecido clássicos com franjas' },
  { name: 'Abraçadeira com Imã Minimalista', price: 24.5, unit: 'un' as const, description: 'Fixador moderno com fixação magnética em couro ou metal' },
  { name: 'Sanca em MDF / Cortineiro de Sobrepor', price: 78.0, unit: 'm' as const, description: 'Acabamento que oculta o trilho' },
  { name: 'Forro Microfibra Extra (Garante caimento)', price: 32.0, unit: 'm' as const, description: 'Forro extra protetor contra radiação solar' },
];

export const DEFAULT_LABOR_RATE = 40.0; // R$ 40 per linear/square meter
export const DEFAULT_INSTALLATION_RATE = 80.0; // R$ 80 fixed base cost per curtain unit

// Checklist helpers
export const MODEL_ESSENTIAL_ACCESSORIES_RULES: Record<string, string[]> = {
  wave: ['Trilho Suíço para Wave', 'Cordão Limitador / Cordão Wave (8cm)', 'Deslizantes para Wave (Passo 8cm)', 'Fita Wave para Cabeçote', 'Terminais de Trilho (Par)'],
  americana: ['Trilho Comum / Suíço Simples', 'Entretela de Algodão (Pregas)', 'Deslizantes Comuns', 'Ganchos Caracol / Argolas'],
  femea: ['Trilho Comum / Suíço Simples', 'Entretela Estruturante', 'Deslizantes Comuns', 'Ganchos Caracol'],
  macho: ['Trilho Comum / Suíço Simples', 'Entretela Estruturante para Topo', 'Deslizantes Comuns', 'Ganchos de Prega Metálicos (Caracol)'],
  ilhos: ['Varão de Cortina Cromado / Pintado', 'Suportes de Varão de Parede / Teto', 'Anéis de Ilhós Redondos', 'Entretela de Ilhós Perfurada (Entre-tela)', 'Ponteiras Decorativas do Varão (Par)'],
};
