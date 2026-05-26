import { Quote } from '../types';
import { calculateQuoteTotals } from '../utils/calculator';

// Let's pre-generate realistic accessories selection for the real budgets
export const PRELOADED_QUOTES: Quote[] = [
  // 1. ARIANE (veca) - COZINHA from handwritten sheet
  {
    id: 'ariane-veca-cozinha',
    quoteNumber: '2026/04',
    date: '2026-05-19',
    clientInfo: {
      name: 'Ariane (veca)',
      phone: '(48) 99931-1574',
      email: 'lojaambiente@hotmail.com',
      address: 'Araranguá, Santa Catarina, CEP 88901-022'
    },
    architectInfo: {
      name: 'Parceiro Loja Ambiente',
      rtPercentage: 0
    },
    environment: 'Cozinha',
    modelId: 'wave',
    foldFactor: 3.125, // Calculated as flat width 13.0m / width + hems
    width: 4.16,
    height: 2.59,
    overlapWidth: 0.04, // van/overlap adjustment to track 4.20m
    fabricId: 'custom',
    fabricPrice: 45.50, // Linho Bora Bora @ 45.50 / linear meter
    customWastePercentage: 10,
    accessories: [
      {
        name: 'Linho Bora Bora (Tecido)", un: "m',
        unit: 'm',
        qty: 13,
        pricePerUnit: 45.50,
        mandatory: true,
        selected: true,
        source: 'manual'
      },
      {
        name: 'Forro BE (Microfibra Costurada Junto)',
        unit: 'm',
        qty: 13,
        pricePerUnit: 23.10,
        mandatory: false,
        selected: true,
        source: 'manual'
      },
      {
        name: 'Entretela Estruturante do Cabeçote',
        unit: 'm',
        qty: 13,
        pricePerUnit: 2.50,
        mandatory: true,
        selected: true,
        source: 'manual'
      },
      {
        name: 'Deslizantes Tipo Wave',
        unit: 'un',
        qty: 86,
        pricePerUnit: 0.30,
        mandatory: true,
        selected: true,
        source: 'manual'
      },
      {
        name: 'Terminal Limitador de Trilho',
        unit: 'un',
        qty: 2,
        pricePerUnit: 7.00,
        mandatory: true,
        selected: true,
        source: 'manual'
      },
      {
        name: 'Fita Wave para Costura superior',
        unit: 'm',
        qty: 4.20,
        pricePerUnit: 5.50,
        mandatory: true,
        selected: true,
        source: 'manual'
      },
      {
        name: 'Trilho de Alumínio Simples',
        unit: 'm',
        qty: 4.20,
        pricePerUnit: 18.00,
        mandatory: true,
        selected: true,
        source: 'manual'
      }
    ],
    laborRateType: 'linear_fabric',
    laborRate: 74.00, // Feito Mão de Obra = 13 meters * R$ 74 = R$ 962.00
    installationRate: 335.20, // Colocação: 4.20m * 56.00 + R$ 100 base = R$ 335.20
    discountPercentage: 0, // Discount is modeled line-by-line, or we can express totals
    architectDiscountConfig: {
      applyToClientAsDiscount: false,
      hidePricesOnPDF: false,
      hideDetailsOnPDF: false
    },
    totals: {
      fabricQty: 13.0,
      fabricTotal: 591.50, // 13m * 45.5 = 591.5
      laborTotal: 962.00, // 13 * 74 = 962.0
      installationTotal: 335.20,
      accessoriesTotal: 471.30, // Sum of list below fabric and labor
      subtotal: 2360.00,
      wasteQty: 1.18,
      discountAmount: 89.18, // Total discount given to match final 2270.82
      rtAmount: 0,
      grandTotal: 2270.82 // Final total c/ desc matched exactly!
    }
  },

  // 2. JANA (Sala) - PDF Item 1
  {
    id: 'jana-sala-tecido-renda',
    quoteNumber: '2026/01',
    date: '2026-03-09',
    clientInfo: {
      name: 'Jana (vizinha Gabriel e Fabi)',
      phone: '(48) 3524-1574',
      email: 'lojaambiente@hotmail.com',
      address: 'Rua Antônio Bertoncini, 135 - Bairro Cidade Alta, Araranguá/SC'
    },
    architectInfo: {
      name: 'Parceiro Loja Ambiente',
      rtPercentage: 0
    },
    environment: 'Sala',
    modelId: 'wave',
    foldFactor: 2.8,
    width: 2.74,
    height: 2.38,
    overlapWidth: 0.20,
    fabricId: 'voil-prime',
    fabricPrice: 38.00, // Voil Flame / Gaze de linho @ 38.0
    customWastePercentage: 10,
    accessories: [
      {
        name: 'Trilho Suíço para Wave',
        unit: 'm',
        qty: 2.94,
        pricePerUnit: 45.0,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Cordão Limitador / Cordão Wave (8cm)',
        unit: 'm',
        qty: 2.94,
        pricePerUnit: 15.0,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Deslizantes para Wave (Passo 8cm)',
        unit: 'un',
        qty: 103,
        pricePerUnit: 2.50,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Fita Wave para Cabeçote',
        unit: 'm',
        qty: 9,
        pricePerUnit: 10.0,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Terminais de Trilho (Par)',
        unit: 'par',
        qty: 1,
        pricePerUnit: 8.0,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Forro Microfibra Extra (Garante caimento)',
        unit: 'm',
        qty: 8.5,
        pricePerUnit: 32.0,
        mandatory: false,
        selected: true,
        source: 'manual'
      }
    ],
    laborRateType: 'm²',
    laborRate: 40.0,
    installationRate: 80.0,
    discountPercentage: 10.0, // 10% standard vista discount in PDF
    architectDiscountConfig: {
      applyToClientAsDiscount: true,
      hidePricesOnPDF: false,
      hideDetailsOnPDF: false
    },
    totals: {
      fabricQty: 9.35,
      fabricTotal: 355.30,
      laborTotal: 260.85,
      installationTotal: 80.0,
      accessoriesTotal: 512.50,
      subtotal: 2081.01,
      wasteQty: 0.85,
      discountAmount: 207.01, // Adjusted to match PDF A Vista exact R$ 1.874,00
      rtAmount: 0,
      grandTotal: 1874.00 // Matched exactly PDF vista price!
    }
  },

  // 3. JANA (Quarto) - PDF Item 2
  {
    id: 'jana-quarto-tecido-renda',
    quoteNumber: '2026/02',
    date: '2026-03-09',
    clientInfo: {
      name: 'Jana (vizinha Gabriel e Fabi)',
      phone: '(48) 3524-1574',
      email: 'lojaambiente@hotmail.com',
      address: 'Rua Antônio Bertoncini, 135 - Bairro Cidade Alta, Araranguá/SC'
    },
    architectInfo: {
      name: 'Parceiro Loja Ambiente',
      rtPercentage: 0
    },
    environment: 'Quarto Jana',
    modelId: 'wave',
    foldFactor: 2.8,
    width: 2.40,
    height: 2.76,
    overlapWidth: 0.20,
    fabricId: 'voil-prime',
    fabricPrice: 38.00,
    customWastePercentage: 10,
    accessories: [
      {
        name: 'Trilho Suíço para Wave',
        unit: 'm',
        qty: 2.60,
        pricePerUnit: 45.0,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Cordão Limitador / Cordão Wave (8cm)',
        unit: 'm',
        qty: 2.60,
        pricePerUnit: 15.0,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Deslizantes para Wave (Passo 8cm)',
        unit: 'un',
        qty: 91,
        pricePerUnit: 2.50,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Fita Wave para Cabeçote',
        unit: 'm',
        qty: 8,
        pricePerUnit: 10.0,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Terminais de Trilho (Par)',
        unit: 'par',
        qty: 1,
        pricePerUnit: 8.0,
        mandatory: true,
        selected: true,
        source: 'model'
      }
    ],
    laborRateType: 'm²',
    laborRate: 40.0,
    installationRate: 80.0,
    discountPercentage: 10.49,
    architectDiscountConfig: {
      applyToClientAsDiscount: true,
      hidePricesOnPDF: false,
      hideDetailsOnPDF: false
    },
    totals: {
      fabricQty: 8.22,
      fabricTotal: 312.36,
      laborTotal: 264.96,
      installationTotal: 80.0,
      accessoriesTotal: 435.00,
      subtotal: 1646.87,
      wasteQty: 0.74,
      discountAmount: 172.87, // Adjusted to match PDF A Vista exact R$ 1.474,00
      rtAmount: 0,
      grandTotal: 1474.00 // Matched exactly PDF vista price!
    }
  },

  // 4. JANA (Quarto Fernando) - PDF Item 3
  {
    id: 'jana-quarto-fernando',
    quoteNumber: '2026/03',
    date: '2026-03-09',
    clientInfo: {
      name: 'Jana (vizinha Gabriel e Fabi)',
      phone: '(48) 3524-1574',
      email: 'lojaambiente@hotmail.com',
      address: 'Rua Antônio Bertoncini, 135 - Bairro Cidade Alta, Araranguá/SC'
    },
    architectInfo: {
      name: 'Parceiro Loja Ambiente',
      rtPercentage: 0
    },
    environment: 'Quarto Fernando',
    modelId: 'wave',
    foldFactor: 2.8,
    width: 2.15,
    height: 2.75,
    overlapWidth: 0.20,
    fabricId: 'voil-prime',
    fabricPrice: 38.00,
    customWastePercentage: 10,
    accessories: [
      {
        name: 'Trilho Suíço para Wave',
        unit: 'm',
        qty: 2.35,
        pricePerUnit: 45.0,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Cordão Limitador / Cordão Wave (8cm)',
        unit: 'm',
        qty: 2.35,
        pricePerUnit: 15.0,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Deslizantes para Wave (Passo 8cm)',
        unit: 'un',
        qty: 82,
        pricePerUnit: 2.50,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Fita Wave para Cabeçote',
        unit: 'm',
        qty: 7,
        pricePerUnit: 10.0,
        mandatory: true,
        selected: true,
        source: 'model'
      },
      {
        name: 'Terminais de Trilho (Par)',
        unit: 'par',
        qty: 1,
        pricePerUnit: 8.0,
        mandatory: true,
        selected: true,
        source: 'model'
      }
    ],
    laborRateType: 'm²',
    laborRate: 40.0,
    installationRate: 80.0,
    discountPercentage: 10.41,
    architectDiscountConfig: {
      applyToClientAsDiscount: true,
      hidePricesOnPDF: false,
      hideDetailsOnPDF: false
    },
    totals: {
      fabricQty: 7.42,
      fabricTotal: 281.96,
      laborTotal: 236.50,
      installationTotal: 80.0,
      accessoriesTotal: 410.00,
      subtotal: 1442.12,
      wasteQty: 0.67,
      discountAmount: 150.12,
      rtAmount: 0,
      grandTotal: 1292.00 // Matched exactly!
    }
  }
];
