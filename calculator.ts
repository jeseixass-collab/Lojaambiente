/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quote, Fabric, CurtainModelId, AccessorySelection } from '../types';
import { CURTAIN_MODELS, PRESETS_FABRICS } from '../constants';

export interface CalculationResult {
  fabricQty: number; // in meters or m²
  fabricTotal: number;
  laborTotal: number;
  installationTotal: number;
  accessoriesTotal: number;
  motorizationTotal?: number;
  engineeringAssistanceTotal?: number;
  subtotal: number;
  wasteQty: number; // amount of fabric waste in meters
  discountAmount: number;
  rtAmount: number; // Architect commission
  grandTotal: number;
  
  // Supplementary detailed metrics for the UI
  flatWidthNeeded: number;
  stripsCount?: number; // Only if vertical fabric orientation split
  stripLength?: number;
}

export function calculateItemTotals(params: {
  productType: 'cortina' | 'persiana';
  width: number;
  height: number;
  overlapWidth: number;
  modelId: string;
  foldFactor: number;
  fabricId: string;
  customFabricPrice?: number;
  customWastePercentage?: number;
  accessories: AccessorySelection[];
  laborRateType: 'm²' | 'linear_fabric' | 'fixed';
  laborRate: number;
  installationRate: number;
  isMotorized?: boolean;
  motorizationPrice?: number;
  fabricWidth?: number;
}): Omit<CalculationResult, 'discountAmount' | 'rtAmount'> {
  const {
    productType,
    width,
    height,
    overlapWidth,
    modelId,
    foldFactor,
    fabricId,
    customFabricPrice,
    customWastePercentage = 10,
    accessories,
    laborRateType,
    laborRate,
    installationRate,
    isMotorized = false,
    motorizationPrice = 0,
    fabricWidth,
  } = params;

  if (productType === 'persiana') {
    // Specialized Blind (Persiana) calculation. 
    // It's billed by Area in square meters, with a standard minimum of 1.50m² per individual shade (regra padrão no Brasil).
    const rawArea = width * height;
    const baseArea = Math.max(1.50, rawArea);
    
    // Get materials price
    const unitPrice = customFabricPrice !== undefined ? customFabricPrice : 180.00; // default for persianas/m2
    const materialTotal = Number((baseArea * unitPrice).toFixed(2));
    
    // Labor
    let laborTotal = 0;
    if (laborRateType === 'm²') {
      laborTotal = rawArea * laborRate;
    } else if (laborRateType === 'fixed') {
      laborTotal = laborRate;
    } else {
      laborTotal = (width * foldFactor) * laborRate;
    }
    laborTotal = Number(laborTotal.toFixed(2));
    
    // Accessories total
    const accessoriesTotal = accessories
      .filter(acc => acc.selected)
      .reduce((sum, acc) => sum + (acc.qty * acc.pricePerUnit), 0);
      
    const motorizationTotal = isMotorized ? motorizationPrice : 0;
    const subtotal = Number((materialTotal + laborTotal + installationRate + accessoriesTotal + motorizationTotal).toFixed(2));
    
    return {
      fabricQty: baseArea,
      fabricTotal: materialTotal,
      laborTotal,
      installationTotal: installationRate,
      accessoriesTotal,
      motorizationTotal,
      subtotal,
      wasteQty: 0,
      grandTotal: subtotal,
      flatWidthNeeded: width,
    };
  } else {
    // Normal curtain calculation
    const res = calculateQuoteTotals({
      width,
      height,
      overlapWidth,
      modelId: modelId as CurtainModelId,
      foldFactor,
      fabricId,
      customFabricPrice,
      customWastePercentage,
      accessories,
      laborRateType,
      laborRate,
      installationRate,
      discountPercentage: 0, // applied at parent Quote level
      rtPercentage: 0, // applied at parent Quote level
      isMotorized,
      motorizationPrice,
      fabricWidth,
    });
    return {
      fabricQty: res.fabricQty,
      fabricTotal: res.fabricTotal,
      laborTotal: res.laborTotal,
      installationTotal: res.installationTotal,
      accessoriesTotal: res.accessoriesTotal,
      motorizationTotal: res.motorizationTotal,
      subtotal: res.subtotal,
      wasteQty: res.wasteQty,
      grandTotal: res.grandTotal,
      flatWidthNeeded: res.flatWidthNeeded,
      stripsCount: res.stripsCount,
      stripLength: res.stripLength,
    };
  }
}

export function calculateQuoteTotals(params: {
  width: number;
  height: number;
  overlapWidth: number;
  modelId: CurtainModelId;
  foldFactor: number;
  fabricId: string;
  customFabricPrice?: number;
  customWastePercentage?: number;
  accessories: AccessorySelection[];
  laborRateType: 'm²' | 'linear_fabric' | 'fixed';
  laborRate: number;
  installationRate: number;
  discountPercentage: number;
  rtPercentage: number; // Architect reserve percentage
  isMotorized?: boolean;
  motorizationPrice?: number;
  fabricWidth?: number;
}): CalculationResult {
  const {
    width,
    height,
    overlapWidth,
    modelId,
    foldFactor,
    fabricId,
    customFabricPrice,
    customWastePercentage = 10,
    accessories,
    laborRateType,
    laborRate,
    installationRate,
    discountPercentage,
    rtPercentage,
    isMotorized = false,
    motorizationPrice = 0,
    fabricWidth,
  } = params;

  // 1. Get fabric details
  const presetFabric = PRESETS_FABRICS.find(f => f.id === fabricId);
  const fabricPrice = customFabricPrice !== undefined ? customFabricPrice : (presetFabric?.pricePerMeter ?? 50.0);
  const ResolvedFabricWidth = fabricWidth !== undefined && fabricWidth > 0 ? fabricWidth : (presetFabric?.width ?? 3.0);
  const fabricDirection = presetFabric?.direction ?? 'horizontal';

  // 2. Base width calculations (add overlap, apply fold factor)
  const baseWidth = width + overlapWidth;
  // Side hems usually consume about 20cm total of flat fabric
  const sideHems = 0.20; 
  const flatWidthNeeded = baseWidth * foldFactor + sideHems;

  let fabricQtyRaw = 0;
  let stripsCount = 0;
  let stripLength = 0;

  if (fabricDirection === 'horizontal') {
    // Fabric used horizontally: length needed is flatWidthNeeded
    fabricQtyRaw = flatWidthNeeded;
  } else {
    // Fabric used vertically (strips / emendas needed)
    // Standard fabric width (e.g., 1.4m)
    stripsCount = Math.ceil(flatWidthNeeded / ResolvedFabricWidth);
    // Hems: Top head hem + bottom foot hem consumes roughly 35 cm of vertical length
    stripLength = height + 0.35;
    fabricQtyRaw = stripsCount * stripLength;
  }

  // 3. Waste calculation (Desperdício)
  const wasteMultiplier = 1 + (customWastePercentage / 100);
  const fabricQty = Number((fabricQtyRaw * wasteMultiplier).toFixed(2));
  const wasteQty = Number((fabricQtyRaw * (customWastePercentage / 100)).toFixed(2));
  const fabricTotal = Number((fabricQty * fabricPrice).toFixed(2));

  // 4. Labor total (Mão de Obra)
  let laborTotal = 0;
  if (laborRateType === 'm²') {
    // Area of the finished curtain
    const area = width * height;
    laborTotal = area * laborRate;
  } else if (laborRateType === 'linear_fabric') {
    // Calculated over exact flat fabric required
    laborTotal = flatWidthNeeded * laborRate;
  } else {
    // Fixed cost per curtain
    laborTotal = laborRate;
  }
  laborTotal = Number(laborTotal.toFixed(2));

  // 5. Installation total (Instalação)
  const installationTotal = Number(installationRate.toFixed(2));

  // 6. Selected Accessories total
  const accessoriesTotal = accessories
    .filter(acc => acc.selected)
    .reduce((sum, acc) => sum + (acc.qty * acc.pricePerUnit), 0);

  const motorizationTotal = isMotorized ? motorizationPrice : 0;

  // 7. Base subtotal
  const subtotal = fabricTotal + laborTotal + installationTotal + accessoriesTotal + motorizationTotal;

  // 8. Discounts & Commissions (Reserva Técnica)
  // Discount is calculated on client's price
  const discountAmount = Number((subtotal * (discountPercentage / 100)).toFixed(2));
  const preFinalTotal = subtotal - discountAmount;
  
  // RT (Reserva Técnica) for architects
  const rtAmount = Number((subtotal * (rtPercentage / 100)).toFixed(2));

  // Grand Total
  const grandTotal = Number(preFinalTotal.toFixed(2));

  return {
    fabricQty,
    fabricTotal,
    laborTotal,
    installationTotal,
    accessoriesTotal,
    motorizationTotal,
    subtotal: Number(subtotal.toFixed(2)),
    wasteQty,
    discountAmount,
    rtAmount,
    grandTotal,
    flatWidthNeeded: Number(flatWidthNeeded.toFixed(2)),
    stripsCount: stripsCount > 0 ? stripsCount : undefined,
    stripLength: stripLength > 0 ? Number(stripLength.toFixed(2)) : undefined,
  };
}

export function generateWhatsAppMessage(quote: Quote): string {
  // If we have items in the quote, provide a gorgeous composite multi-room message
  if (quote.items && quote.items.length > 0) {
    let text = `*Orçamento Multi-Ambientes - LOJA Ambiente* 🏠✨\n`;
    text += `----------------------------------------\n`;
    text += `👤 Cliente: ${quote.clientInfo.name}\n`;
    text += `📞 Tel: ${quote.clientInfo.phone || 'Não informado'}\n`;
    text += `📅 Data: ${new Date(quote.date).toLocaleDateString('pt-BR')}\n`;
    text += `----------------------------------------\n\n`;
    text += `*Espaços Cadastrados e Especificações:*`;
    
    quote.items.forEach((item, idx) => {
      const prodType = item.productType === 'persiana' ? 'Persiana' : 'Cortina';
      text += `\n\n${idx + 1}. 🛋️ *${item.environment}* (${prodType})\n`;
      text += `   📐 Medidas: ${item.width.toFixed(2)}m (L) x ${item.height.toFixed(2)}m (A)\n`;
      text += `   ✨ Especificação: ${item.modelId.toUpperCase()}\n`;
      text += `   💰 Item Total: R$ ${item.totals.grandTotal.toFixed(2)}`;
    });

    const discountText = quote.discountPercentage > 0 ? `\n🎁 Desconto Especial: ${quote.discountPercentage}% (-R$ ${quote.totals.discountAmount.toFixed(2)})` : '';
    const rtText = quote.architectInfo ? `\n📐 Arquiteto(a): ${quote.architectInfo.name}` : '';

    text += `\n\n----------------------------------------\n`;
    text += `💵 Subtotal Geral: R$ ${(quote.items.reduce((s, i) => s + i.totals.grandTotal, 0)).toFixed(2)}${discountText}${rtText}\n`;
    text += `👑 *CONDIÇÃO ESPECIAL À VISTA / FINAL: R$ ${quote.totals.grandTotal.toFixed(2)}*\n`;
    text += `----------------------------------------\n`;
    text += `_Emitido pelo Sistema Oficial da LOJA Ambiente. decorando o seu espaço._`;
    return encodeURIComponent(text);
  }

  const model = CURTAIN_MODELS.find(m => m.id === quote.modelId)?.name ?? quote.modelId;
  const rtText = quote.architectInfo ? `\n📐 Arquiteto(a): ${quote.architectInfo.name}` : '';
  const discountText = quote.discountPercentage > 0 ? `\n🎁 Desconto Especial: ${quote.discountPercentage}%` : '';
  
  const text = `*Orçamento de Cortina Sob Medida* 🌟
----------------------------------------
👤 Cliente: ${quote.clientInfo.name}
📞 Tel: ${quote.clientInfo.phone}
📍 Ambiente: *${quote.environment}*
📐 Medidas: ${quote.width.toFixed(2)}m (largura) x ${quote.height.toFixed(2)}m (altura)
✨ Modelo: *${model}* (Fator ${quote.foldFactor}x)

*Resumo dos Itens:*
- Tecido: R$ ${quote.totals.fabricTotal.toFixed(2)} (${quote.totals.fabricQty.toFixed(2)} metros)
- Mão de Obra: R$ ${quote.totals.laborTotal.toFixed(2)}
- Acessórios: R$ ${quote.totals.accessoriesTotal.toFixed(2)}
- Instalação: R$ ${quote.totals.installationTotal.toFixed(2)}${discountText}${rtText}

----------------------------------------
💰 *Valor Total: R$ ${quote.totals.grandTotal.toFixed(2)}*
----------------------------------------
_Orçamento gerado pelo CurtainPro automatizado._`;

  return encodeURIComponent(text);
}
