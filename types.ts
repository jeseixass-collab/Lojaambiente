/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CurtainModelId = 'wave' | 'americana' | 'femea' | 'macho' | 'ilhos';

export interface CurtainModel {
  id: CurtainModelId;
  name: string;
  description: string;
  defaultFoldFactor: number; // e.g. 2.8 for wave, 2.5 for americana
  requiredAccessories: Array<{
    name: string;
    description: string;
    suggestedPrice: number;
    unit: 'm' | 'un' | 'par';
    calculateQty: (width: number, height: number, foldFactor: number) => number;
    mandatory: boolean;
  }>;
}

export interface Fabric {
  id: string;
  name: string;
  category: string;
  pricePerMeter: number;
  width: number; // e.g. 1.4 for normal fabrics or 3.0 for double-width horizontal fabrics
  direction: 'vertical' | 'horizontal'; // 'vertical' means multiple strips joined; 'horizontal' means roll runs horizontally
  composition?: string;
}

export interface AccessorySelection {
  name: string;
  unit: 'm' | 'un' | 'par';
  qty: number;
  pricePerUnit: number;
  mandatory: boolean;
  selected: boolean;
  source: 'model' | 'manual';
}

export interface ClientInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface QuoteItem {
  id: string;
  environment: string; // e.g., "Sala", "Quarto Casal"
  productType: 'cortina' | 'persiana';
  modelId: CurtainModelId | string; // 'wave', etc. or persiana-specific types
  foldFactor: number;
  
  // Dimensions
  width: number;
  height: number;
  overlapWidth: number;
  
  // Fabric details
  fabricId: string;
  fabricPrice: number;
  fabricWidth?: number;
  fabricCode?: string;
  customWastePercentage: number;
  
  // Accessories
  accessories: AccessorySelection[];
  
  // Labor & Installation
  laborRateType: 'm²' | 'linear_fabric' | 'fixed';
  laborRate: number;
  installationRate: number;
  
  // New features
  isMotorized?: boolean;
  motorizationPrice?: number;
  
  totals: {
    fabricQty: number;
    fabricTotal: number;
    laborTotal: number;
    installationTotal: number;
    accessoriesTotal: number;
    motorizationTotal?: number;
    subtotal: number;
    wasteQty: number;
    grandTotal: number;
  };
}

export interface ArchitectInfo {
  name: string;
  rtPercentage: number; // commission (Reserva Técnica)
  phone?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  date: string;
  clientInfo: ClientInfo;
  architectInfo?: ArchitectInfo;
  
  // Support for multiple rooms/items inside a single quote
  items?: QuoteItem[];
  
  // Legacy single-item fields (for backward compatibility and active edits)
  environment: string; // e.g., "Sala", "Quarto Casal"
  modelId: CurtainModelId;
  foldFactor: number;
  
  // Dimensions (in meters)
  width: number;
  height: number;
  overlapWidth: number; // transpasse (default 0.20m)
  
  // Fabric details
  fabricId: string;
  fabricPrice: number;
  fabricWidth?: number;
  fabricCode?: string;
  customWastePercentage: number; // default 10%
  
  // Selected Accessories (including mandatory ones)
  accessories: AccessorySelection[];
  
  // Labor (Mão de Obra)
  laborRateType: 'm²' | 'linear_fabric' | 'fixed';
  laborRate: number;
  
  // Installation (Instalação)
  installationRate: number;
  
  // Custom margin / discounts
  discountPercentage: number;
  architectDiscountConfig: {
    applyToClientAsDiscount: boolean; // discount passed to client or paid to architect as RT
    hidePricesOnPDF: boolean;
    hideDetailsOnPDF: boolean;
  };
  
  status?: 'pendente' | 'liberado';
  
  // New features
  isMotorized?: boolean;
  motorizationPrice?: number;
  
  engineeringAssistanceSelected?: boolean;
  engineeringAssistancePrice?: number;
  
  salesStage?: 'aprovado' | 'em_corte' | 'na_costureira' | 'em_producao' | 'programado_instalacao' | 'visita_medidas' | 'pendente';
  measurementCheckDate?: string;
  byTechnicalVisit?: boolean;
  
  vendedorName?: string;
  paymentMethod?: string;
  
  // Calculated summaries (Total overlay of items or direct single-item)
  totals: {
    fabricQty: number;
    fabricTotal: number;
    laborTotal: number;
    installationTotal: number;
    accessoriesTotal: number;
    engineeringAssistanceTotal?: number;
    motorizationTotal?: number;
    subtotal: number;
    wasteQty: number;
    discountAmount: number;
    rtAmount: number; // Architect commission
    grandTotal: number;
  };
}
