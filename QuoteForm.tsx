/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Quote, CurtainModelId, AccessorySelection, Fabric, QuoteItem } from '../types';
import { CURTAIN_MODELS, PRESETS_FABRICS, OTHER_OPTIONAL_ACCESSORIES, DEFAULT_LABOR_RATE, DEFAULT_INSTALLATION_RATE } from '../constants';
import { calculateQuoteTotals, calculateItemTotals, generateWhatsAppMessage } from '../utils/calculator';
import { generateQuotePDF } from './PDFReportGenerator';
import AccessoryChecker from './AccessoryChecker';
import { 
  Users, Ruler, Scissors, Library, PlusCircle, Sparkles, Send, 
  FileDown, Save, FileSpreadsheet, Trash, ShieldAlert, Check, HelpCircle,
  LayoutGrid, Edit, Plus, Calendar
} from 'lucide-react';

interface QuoteFormProps {
  onSaveQuote: (quote: Quote) => void;
  loadedQuote: Quote | null;
  onClearLoadedQuote: () => void;
  userRole: 'vendedor' | 'gerente';
  activeVendedor?: string;
}

const PERSIANA_MODELS = [
  { id: 'persiana-rolo', name: 'Rolo Translúcida / Blackout', description: 'Persiana de enrolar clean e moderna, com controle ideal de claridade.', defaultFoldFactor: 1.0 },
  { id: 'persiana-double-vision', name: 'Double Vision Premium', description: 'Efeito listrado refinado alternando faixas translúcidas e opacas.', defaultFoldFactor: 1.0 },
  { id: 'persiana-romana', name: 'Romana Tradicional', description: 'Gomos horizontais clássicos que se dobram em camadas elegantes.', defaultFoldFactor: 1.0 },
  { id: 'persiana-madeira', name: 'Horizontal Madeira Luxo 50mm', description: 'Lâminas de madeira natural que proporcionam aconchego e nobreza.', defaultFoldFactor: 1.0 },
  { id: 'persiana-aluminio', name: 'Horizontal Alumínio 25mm', description: 'Praticidade, durabilidade e alta resistência contra umidade e poeira.', defaultFoldFactor: 1.0 }
];

const PERSIANA_FABRICS = [
  { id: 'tela-solar-1', name: 'Tela Solar Screen 1% (Antichama)', price: 220 },
  { id: 'tela-solar-3', name: 'Tela Solar Screen 3% (Filtragem Média)', price: 200 },
  { id: 'tela-solar-5', name: 'Tela Solar Screen 5% (Filtragem Alta)', price: 190 },
  { id: 'blackout-vinil', name: 'Tecido Blackout Emborrachado 100%', price: 185 },
  { id: 'linho-persiana', name: 'Coleção Translúcida Linho Rústico', price: 210 },
  { id: 'madeira-natural', name: 'Lâminas de Madeira Nobre 50mm', price: 420 },
  { id: 'aluminio-standard', name: 'Alumínio Convencional 25mm', price: 110 },
];

export default function QuoteForm({ onSaveQuote, loadedQuote, onClearLoadedQuote, userRole, activeVendedor }: QuoteFormProps) {
  // 0. Multi-room management lists
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [productType, setProductType] = useState<'cortina' | 'persiana'>('cortina');

  // Active item motorization options
  const [isMotorized, setIsMotorized] = useState(false);
  const [motorizationPrice, setMotorizationPrice] = useState<number>(950);

  // Global engineering, scheduling, and visit states
  const [engineeringAssistanceSelected, setEngineeringAssistanceSelected] = useState(false);
  const [engineeringAssistancePrice, setEngineeringAssistancePrice] = useState<number>(180);
  const [salesStage, setSalesStage] = useState<'aprovado' | 'em_corte' | 'na_costureira' | 'em_producao' | 'programado_instalacao' | 'visita_medidas' | 'pendente'>('pendente');
  const [measurementCheckDate, setMeasurementCheckDate] = useState('');
  const [byTechnicalVisit, setByTechnicalVisit] = useState(false);

  // New user requested states
  const [vendedorName, setVendedorName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('À Vista (Pix/Transferência)');
  const [fabricWidth, setFabricWidth] = useState<number>(3.0);
  const [fabricCode, setFabricCode] = useState<string>('');
  const [optimizeFabric, setOptimizeFabric] = useState<boolean>(true);

  // 1. Client & Partner information
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  
  const [hasArchitect, setHasArchitect] = useState(false);
  const [architectName, setArchitectName] = useState('');
  const [architectRtPercentage, setArchitectRtPercentage] = useState(10);
  const [rtAppliedAsDiscount, setRtAppliedAsDiscount] = useState(false);
  
  const [hidePricesOnPDF, setHidePricesOnPDF] = useState(false);
  const [hideDetailsOnPDF, setHideDetailsOnPDF] = useState(false);

  // 2. Room specs
  const [environment, setEnvironment] = useState('Sala de Estar');
  const [modelId, setModelId] = useState<string>('wave');
  const [width, setWidth] = useState(2.5);
  const [height, setHeight] = useState(2.8);
  const [overlapWidth, setOverlapWidth] = useState(0.20); // transpasse
  const [foldFactor, setFoldFactor] = useState(2.8);

  // 3. Fabric select
  const [selectedFabricId, setSelectedFabricId] = useState('linho-sintetico');
  const [customFabricName, setCustomFabricName] = useState('');
  const [customFabricPrice, setCustomFabricPrice] = useState<number>(0);
  const [fabricPriceInput, setFabricPriceInput] = useState<string>('65');
  const [customWastePercentage, setCustomWastePercentage] = useState(10);

  // 4. Accessories
  const [accessories, setAccessories] = useState<AccessorySelection[]>([]);
  
  // Custom Accessory creation
  const [customAccName, setCustomAccName] = useState('');
  const [customAccPrice, setCustomAccPrice] = useState<number>(0);
  const [customAccUnit, setCustomAccUnit] = useState<'m' | 'un' | 'par'>('un');
  const [customAccQty, setCustomAccQty] = useState<number>(1);

  // 5. Labor & Installation
  const [laborType, setLaborType] = useState<'m²' | 'linear_fabric' | 'fixed'>('m²');
  const [laborRate, setLaborRate] = useState<number>(DEFAULT_LABOR_RATE);
  const [installationRate, setInstallationRate] = useState<number>(DEFAULT_INSTALLATION_RATE);

  // 6. Global stats & discount
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [status, setStatus] = useState<'pendente' | 'liberado'>('pendente');

  // Enforce vendedor discount limits
  useEffect(() => {
    if (userRole === 'vendedor' && discountPercentage > 10) {
      setDiscountPercentage(10);
    }
  }, [userRole, discountPercentage]);

  // Preset chips helpers
  const roomChips = ['Sala de Estar', 'Quarto Casal', 'Sanca / Sala', 'Varanda G.', 'Suíte', 'Escritório', 'Cozinha', 'Área de Serviço'];

  // Synchronize productType with default parameters
  useEffect(() => {
    if (productType === 'persiana') {
      const isAlreadyPersiana = modelId.startsWith('persiana-');
      if (!isAlreadyPersiana) {
        setModelId('persiana-rolo');
        setSelectedFabricId('tela-solar-3');
        setFoldFactor(1.0);
        setOverlapWidth(0); 
      }
    } else {
      const isAlreadyCurtain = !modelId.startsWith('persiana-') && modelId !== '';
      if (!isAlreadyCurtain) {
        setModelId('wave');
        setSelectedFabricId('linho-sintetico');
        setFoldFactor(2.8);
        setOverlapWidth(0.20);
      }
    }
  }, [productType]);

  // Handle Model change: auto populate required items
  useEffect(() => {
    if (productType === 'persiana') {
      const initialRequired = [
        {
          name: 'Comando e Corrente com Limitador de Curso',
          unit: 'un' as const,
          qty: 1,
          pricePerUnit: 25.0,
          mandatory: true,
          selected: true,
          source: 'model' as const,
        },
        {
          name: 'Suporte Lateral Reforçado com Parafusos',
          unit: 'un' as const,
          qty: 2,
          pricePerUnit: 10.0,
          mandatory: true,
          selected: true,
          source: 'model' as const,
        },
        {
          name: 'Prendedor de Segurança Infantil Cordão',
          unit: 'un' as const,
          qty: 1,
          pricePerUnit: 5.0,
          mandatory: false,
          selected: true,
          source: 'model' as const,
        }
      ];
      setAccessories(initialRequired);
    } else {
      const selectedModel = CURTAIN_MODELS.find(m => m.id === modelId);
      if (selectedModel) {
        setFoldFactor(selectedModel.defaultFoldFactor);
        
        // Auto populate accessories mandated by the model with standard quantities
        const initialRequired = selectedModel.requiredAccessories.map(acc => ({
          name: acc.name,
          unit: acc.unit,
          qty: acc.calculateQty(width, height, selectedModel.defaultFoldFactor),
          pricePerUnit: acc.suggestedPrice,
          mandatory: acc.mandatory,
          selected: true,
          source: 'model' as const,
        }));
        setAccessories(initialRequired);
      }
    }
  }, [modelId, productType]);

  // Handle Dimension or Factor edits: update accessories quantities automatically
  useEffect(() => {
    if (productType === 'persiana') return;

    const selectedModel = CURTAIN_MODELS.find(m => m.id === modelId);
    if (selectedModel) {
      const updated = accessories.map(acc => {
        const correspondingModelAcc = selectedModel.requiredAccessories.find(rma => rma.name === acc.name);
        if (correspondingModelAcc && acc.source === 'model') {
          return {
            ...acc,
            qty: correspondingModelAcc.calculateQty(width, height, foldFactor),
          };
        }
        return acc;
      });
      setAccessories(updated);
    }
  }, [width, height, foldFactor, productType]);

  // Handle selected fabric details state sync
  useEffect(() => {
    if (selectedFabricId === 'custom') return;
    
    if (productType === 'persiana') {
      const selectedFabric = PERSIANA_FABRICS.find(f => f.id === selectedFabricId);
      if (selectedFabric) {
        setFabricPriceInput(selectedFabric.price.toString());
        setCustomFabricPrice(selectedFabric.price);
        setFabricWidth(3.0);
      }
    } else {
      const selectedFabric = PRESETS_FABRICS.find(f => f.id === selectedFabricId);
      if (selectedFabric) {
        setFabricPriceInput(selectedFabric.pricePerMeter.toString());
        setCustomFabricPrice(selectedFabric.pricePerMeter);
        setFabricWidth(selectedFabric.width ?? 3.0);
      }
    }
  }, [selectedFabricId, productType]);

  // Load quote if chosen from history
  useEffect(() => {
    if (loadedQuote) {
      setClientName(loadedQuote.clientInfo.name);
      setClientPhone(loadedQuote.clientInfo.phone || '');
      setClientEmail(loadedQuote.clientInfo.email || '');
      setClientAddress(loadedQuote.clientInfo.address || '');
      
      if (loadedQuote.architectInfo) {
        setHasArchitect(true);
        setArchitectName(loadedQuote.architectInfo.name);
        setArchitectRtPercentage(loadedQuote.architectInfo.rtPercentage);
      } else {
        setHasArchitect(false);
        setArchitectName('');
      }
      
      setRtAppliedAsDiscount(loadedQuote.architectDiscountConfig.applyToClientAsDiscount);
      setHidePricesOnPDF(loadedQuote.architectDiscountConfig.hidePricesOnPDF);
      setHideDetailsOnPDF(loadedQuote.architectDiscountConfig.hideDetailsOnPDF);
      
      setEnvironment(loadedQuote.environment);
      setModelId(loadedQuote.modelId);
      setWidth(loadedQuote.width);
      setHeight(loadedQuote.height);
      setOverlapWidth(loadedQuote.overlapWidth);
      setFoldFactor(loadedQuote.foldFactor);
      
      setSelectedFabricId(loadedQuote.fabricId);
      setFabricPriceInput(loadedQuote.fabricPrice.toString());
      setCustomFabricPrice(loadedQuote.fabricPrice);
      setCustomWastePercentage(loadedQuote.customWastePercentage);
      
      setAccessories(loadedQuote.accessories);
      setLaborType(loadedQuote.laborRateType);
      setLaborRate(loadedQuote.laborRate);
      setInstallationRate(loadedQuote.installationRate);
      setDiscountPercentage(loadedQuote.discountPercentage);
      setStatus(loadedQuote.status || 'pendente');

      setEngineeringAssistanceSelected(loadedQuote.engineeringAssistanceSelected || false);
      setEngineeringAssistancePrice(loadedQuote.engineeringAssistancePrice !== undefined ? loadedQuote.engineeringAssistancePrice : 180);
      setSalesStage(loadedQuote.salesStage || 'pendente');
      setMeasurementCheckDate(loadedQuote.measurementCheckDate || '');
      setByTechnicalVisit(loadedQuote.byTechnicalVisit || false);

      setVendedorName(loadedQuote.vendedorName || '');
      setPaymentMethod(loadedQuote.paymentMethod || 'À Vista (Pix/Transferência)');
      setFabricWidth(loadedQuote.fabricWidth !== undefined ? loadedQuote.fabricWidth : 3.0);
      setFabricCode(loadedQuote.fabricCode || '');

      // Multiple Items migration
      if (loadedQuote.items && loadedQuote.items.length > 0) {
        setItems(loadedQuote.items);
      } else {
        // Build items list with a single migrated room if old quote format loaded
        const roomName = loadedQuote.environment || 'Sala';
        const migratedItem: QuoteItem = {
          id: Math.random().toString(36).substr(2, 9),
          environment: roomName,
          productType: (loadedQuote.modelId && loadedQuote.modelId.startsWith('persiana-')) ? 'persiana' : 'cortina',
          modelId: loadedQuote.modelId || 'wave',
          foldFactor: loadedQuote.foldFactor || 2.8,
          width: loadedQuote.width || 2.50,
          height: loadedQuote.height || 2.80,
          overlapWidth: loadedQuote.overlapWidth || 0.20,
          fabricId: loadedQuote.fabricId || 'linho-sintetico',
          fabricPrice: loadedQuote.fabricPrice || 65.0,
          fabricWidth: loadedQuote.fabricWidth !== undefined ? loadedQuote.fabricWidth : 3.0,
          fabricCode: loadedQuote.fabricCode || '',
          customWastePercentage: loadedQuote.customWastePercentage || 10,
          accessories: loadedQuote.accessories || [],
          laborRateType: loadedQuote.laborRateType || 'm²',
          laborRate: loadedQuote.laborRate || 40.0,
          installationRate: loadedQuote.installationRate || 80.0,
          totals: {
            fabricQty: loadedQuote.totals.fabricQty,
            fabricTotal: loadedQuote.totals.fabricTotal,
            laborTotal: loadedQuote.totals.laborTotal,
            installationTotal: loadedQuote.totals.installationTotal,
            accessoriesTotal: loadedQuote.totals.accessoriesTotal,
            subtotal: loadedQuote.totals.subtotal,
            wasteQty: loadedQuote.totals.wasteQty,
            grandTotal: loadedQuote.totals.grandTotal,
          }
        };
        setItems([migratedItem]);
      }
    }
  }, [loadedQuote]);

  // Dynamic aggregations for multiple rooms
  const hasItems = items.length > 0;
  
  // Calculate the active item's totals (the current form state)
  const currentFabricPriceValue = selectedFabricId === 'custom' ? parseFloat(fabricPriceInput) || 0 : customFabricPrice;
  const activeItemTotals = calculateItemTotals({
    productType,
    width,
    height,
    overlapWidth,
    modelId,
    foldFactor,
    fabricId: selectedFabricId,
    customFabricPrice: currentFabricPriceValue,
    customWastePercentage,
    accessories,
    laborRateType: laborType,
    laborRate,
    installationRate,
    isMotorized,
    motorizationPrice,
    fabricWidth,
  });

  // Aggregation of compiled rooms in the list
  const aggregatedTotals = items.reduce((acc, it) => {
    return {
      fabricQty: acc.fabricQty + it.totals.fabricQty,
      fabricTotal: acc.fabricTotal + it.totals.fabricTotal,
      laborTotal: acc.laborTotal + it.totals.laborTotal,
      installationTotal: acc.installationTotal + it.totals.installationTotal,
      accessoriesTotal: acc.accessoriesTotal + it.totals.accessoriesTotal,
      motorizationTotal: acc.motorizationTotal + (it.totals.motorizationTotal || 0),
      subtotal: acc.subtotal + it.totals.subtotal,
      wasteQty: acc.wasteQty + (it.totals.wasteQty || 0),
    };
  }, {
    fabricQty: 0,
    fabricTotal: 0,
    laborTotal: 0,
    installationTotal: 0,
    accessoriesTotal: 0,
    motorizationTotal: 0,
    subtotal: 0,
    wasteQty: 0,
  });

  // Computes the combined totals with fabric reuse optimization
  const getOptimizedTotals = () => {
    if (!optimizeFabric || items.length <= 1) {
      return aggregatedTotals;
    }

    // Group items by fabric key: fabricId + "_" + (fabricCode || 'default') + "_" + fabricPrice
    const groups: { [key: string]: QuoteItem[] } = {};
    items.forEach(item => {
      const key = `${item.fabricId}_${(item.fabricCode || '').trim().toLowerCase()}_${item.fabricPrice}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    let totalOptimizedFabricQty = 0;
    let totalOptimizedFabricCost = 0;
    let totalOptimizedWasteQty = 0;

    // For each fabric group, calculate optimization
    Object.keys(groups).forEach(key => {
      const groupItems = groups[key];
      const sampleItem = groupItems[0];
      
      const presetFabric = PRESETS_FABRICS.find(f => f.id === sampleItem.fabricId);
      const fabricDirection = presetFabric?.direction ?? 'horizontal';
      const fabricPrice = sampleItem.fabricPrice;
      const customWidth = sampleItem.fabricWidth;
      const resolvedWidth = customWidth !== undefined && customWidth > 0 ? customWidth : (presetFabric?.width ?? 3.0);
      const wastePercentage = sampleItem.customWastePercentage || 10;
      const wasteMultiplier = 1 + (wastePercentage / 100);

      if (groupItems.length === 1) {
        // Only one item in group, no optimization
        totalOptimizedFabricQty += sampleItem.totals.fabricQty;
        totalOptimizedFabricCost += sampleItem.totals.fabricTotal;
        totalOptimizedWasteQty += sampleItem.totals.wasteQty;
        return;
      }

      if (fabricDirection === 'horizontal') {
        // Horizontal fabric stacking logic
        const flatWidths = groupItems.map(it => {
          const baseW = it.width + it.overlapWidth;
          const flatW = baseW * it.foldFactor + 0.20;
          return {
            id: it.id,
            height: it.height,
            flatWidth: flatW,
          };
        }).sort((a, b) => b.flatWidth - a.flatWidth);

        // Fit heights into lanes of size resolvedWidth
        interface StackingLane {
          occupiedHeight: number;
          maxFlatWidth: number;
        }
        
        const lanes: StackingLane[] = [];
        flatWidths.forEach(item => {
          let placed = false;
          for (const lane of lanes) {
            if (lane.occupiedHeight + item.height + 0.15 <= resolvedWidth) {
              lane.occupiedHeight += item.height + 0.15;
              lane.maxFlatWidth = Math.max(lane.maxFlatWidth, item.flatWidth);
              placed = true;
              break;
            }
          }
          if (!placed) {
            lanes.push({
              occupiedHeight: item.height,
              maxFlatWidth: item.flatWidth
            });
          }
        });

        let groupOptimizedRawQty = 0;
        lanes.forEach(lane => {
          groupOptimizedRawQty += lane.maxFlatWidth;
        });

        const qtyWithWaste = Number((groupOptimizedRawQty * wasteMultiplier).toFixed(2));
        const wasteQty = Number((groupOptimizedRawQty * (wastePercentage / 100)).toFixed(2));
        const groupCost = Number((qtyWithWaste * fabricPrice).toFixed(2));

        totalOptimizedFabricQty += qtyWithWaste;
        totalOptimizedFabricCost += groupCost;
        totalOptimizedWasteQty += wasteQty;

      } else {
        // Vertical fabric remnant sharing
        let groupTotalRawQty = 0;
        groupItems.forEach(it => {
          const multiplier = 1 + (it.customWastePercentage / 100);
          const rawQty = it.totals.fabricQty / multiplier;
          groupTotalRawQty += rawQty;
        });

        // 8% remnant sharing efficiency
        const optimizedRawQty = groupTotalRawQty * 0.92;
        const qtyWithWaste = Number((optimizedRawQty * wasteMultiplier).toFixed(2));
        const wasteQty = Number((optimizedRawQty * (wastePercentage / 100)).toFixed(2));
        const groupCost = Number((qtyWithWaste * fabricPrice).toFixed(2));

        totalOptimizedFabricQty += qtyWithWaste;
        totalOptimizedFabricCost += groupCost;
        totalOptimizedWasteQty += wasteQty;
      }
    });

    const nonFabricTotal = items.reduce((sum, it) => {
      return sum + it.totals.laborTotal + it.totals.installationTotal + it.totals.accessoriesTotal + (it.totals.motorizationTotal || 0);
    }, 0);

    const optimizedSubtotal = Number((nonFabricTotal + totalOptimizedFabricCost).toFixed(2));

    return {
      fabricQty: Number(totalOptimizedFabricQty.toFixed(2)),
      fabricTotal: Number(totalOptimizedFabricCost.toFixed(2)),
      laborTotal: aggregatedTotals.laborTotal,
      installationTotal: aggregatedTotals.installationTotal,
      accessoriesTotal: aggregatedTotals.accessoriesTotal,
      motorizationTotal: aggregatedTotals.motorizationTotal,
      subtotal: optimizedSubtotal,
      wasteQty: Number(totalOptimizedWasteQty.toFixed(2)),
    };
  };

  const finalAggregatedTotals = (optimizeFabric && items.length > 1) ? getOptimizedTotals() : aggregatedTotals;

  // If items exist, use sum. Otherwise, use current active form values as standard single-room quote.
  const displayTotals = hasItems ? finalAggregatedTotals : activeItemTotals;

  const isVendedorMatchBlocked = !!(
    userRole === 'vendedor' && 
    loadedQuote && 
    loadedQuote.vendedorName && 
    activeVendedor && 
    loadedQuote.vendedorName.trim().toLowerCase() !== activeVendedor.trim().toLowerCase()
  );
  
  // Calculate discount and commission based on selected level
  const escFee = engineeringAssistanceSelected ? (engineeringAssistancePrice || 0) : 0;
  const discountAmount = Number((displayTotals.subtotal * (discountPercentage / 100)).toFixed(2));
  const subtotalAfterDiscount = (displayTotals.subtotal + escFee) - discountAmount;
  const rtAmount = hasArchitect ? Number((displayTotals.subtotal * (architectRtPercentage / 100)).toFixed(2)) : 0;
  
  const grandTotalValue = Number((subtotalAfterDiscount).toFixed(2));
  const clientGrandTotal = rtAppliedAsDiscount ? (grandTotalValue - rtAmount) : grandTotalValue;

  const fabricSavingsMeters = optimizeFabric && items.length > 1 ? Number(Math.max(0, aggregatedTotals.fabricQty - finalAggregatedTotals.fabricQty).toFixed(2)) : 0;
  const fabricSavingsCost = optimizeFabric && items.length > 1 ? Number(Math.max(0, aggregatedTotals.fabricTotal - finalAggregatedTotals.fabricTotal).toFixed(2)) : 0;

  // Final consolidated object for parent components or action exports
  const compileFinalTotals = {
    fabricQty: displayTotals.fabricQty,
    fabricTotal: displayTotals.fabricTotal,
    laborTotal: displayTotals.laborTotal,
    installationTotal: displayTotals.installationTotal,
    accessoriesTotal: displayTotals.accessoriesTotal,
    motorizationTotal: displayTotals.motorizationTotal || 0,
    engineeringAssistanceTotal: escFee,
    subtotal: displayTotals.subtotal + escFee,
    wasteQty: displayTotals.wasteQty,
    discountAmount,
    rtAmount,
    grandTotal: clientGrandTotal,
    flatWidthNeeded: hasItems ? 0 : activeItemTotals.flatWidthNeeded,
  };

  // Setup legacy direct totals variable to prevent errors in existing component bindings
  const totals = {
    ...activeItemTotals,
    rtAmount: compileFinalTotals.rtAmount,
    discountAmount: compileFinalTotals.discountAmount,
    subtotal: compileFinalTotals.subtotal,
    grandTotal: compileFinalTotals.grandTotal,
  };

  // Render accessories items
  const handleToggleAccessory = (index: number) => {
    const updated = [...accessories];
    updated[index].selected = !updated[index].selected;
    setAccessories(updated);
  };

  const handleUpdateAccessoryQty = (index: number, newQty: number) => {
    const updated = [...accessories];
    updated[index].qty = Math.max(0.1, newQty);
    setAccessories(updated);
  };

  const handleUpdateAccessoryPrice = (index: number, newPrice: number) => {
    const updated = [...accessories];
    updated[index].pricePerUnit = Math.max(0, newPrice);
    setAccessories(updated);
  };

  const handleAddCustomAccessory = () => {
    if (!customAccName.trim()) return;
    const newAcc: AccessorySelection = {
      name: customAccName,
      qty: customAccQty,
      pricePerUnit: customAccPrice,
      unit: customAccUnit,
      mandatory: false,
      selected: true,
      source: 'manual',
    };
    setAccessories([...accessories, newAcc]);
    setCustomAccName('');
    setCustomAccQty(1);
    setCustomAccPrice(0);
  };

  const handleAddPresetOptional = (preset: typeof OTHER_OPTIONAL_ACCESSORIES[0]) => {
    // Check if already in accessories select
    const match = accessories.findIndex(a => a.name === preset.name);
    if (match > -1) {
      const updated = [...accessories];
      updated[match].selected = true;
      setAccessories(updated);
    } else {
      setAccessories([...accessories, {
        name: preset.name,
        pricePerUnit: preset.price,
        unit: preset.unit,
        qty: preset.unit === 'm' ? width : 1,
        mandatory: false,
        selected: true,
        source: 'manual',
      }]);
    }
  };

  const handleDeleteAccessory = (index: number) => {
    setAccessories(accessories.filter((_, idx) => idx !== index));
  };

  const handleAddOrUpdateItem = () => {
    const compiledItem: QuoteItem = {
      id: activeItemIndex !== null ? items[activeItemIndex].id : Math.random().toString(36).substr(2, 9),
      environment: environment || 'Cômodo',
      productType,
      modelId,
      foldFactor,
      width,
      height,
      overlapWidth,
      fabricId: selectedFabricId,
      fabricPrice: currentFabricPriceValue,
      fabricWidth: fabricWidth,
      fabricCode: fabricCode,
      customWastePercentage,
      accessories: [...accessories],
      laborRateType: laborType,
      laborRate,
      installationRate,
      isMotorized,
      motorizationPrice,
      totals: {
        ...activeItemTotals,
        grandTotal: activeItemTotals.subtotal,
      }
    };

    if (activeItemIndex !== null) {
      // Update existing item
      const updated = [...items];
      updated[activeItemIndex] = compiledItem;
      setItems(updated);
      setActiveItemIndex(null);
    } else {
      // Add new item
      setItems([...items, compiledItem]);
    }

    // Reset some of the temporary spec values to feel fresh
    setEnvironment('');
    setIsMotorized(false);
    setMotorizationPrice(950);
  };

  const handleEditItem = (index: number) => {
    const item = items[index];
    setActiveItemIndex(index);
    setEnvironment(item.environment);
    setProductType(item.productType);
    setModelId(item.modelId);
    setFoldFactor(item.foldFactor);
    setWidth(item.width);
    setHeight(item.height);
    setOverlapWidth(item.overlapWidth);
    setSelectedFabricId(item.fabricId);
    setCustomWastePercentage(item.customWastePercentage);
    setFabricWidth(item.fabricWidth !== undefined ? item.fabricWidth : 3.0);
    setFabricCode(item.fabricCode || '');
    setAccessories(item.accessories);
    setLaborType(item.laborRateType);
    setLaborRate(item.laborRate);
    setInstallationRate(item.installationRate);
    setIsMotorized(item.isMotorized || false);
    setMotorizationPrice(item.motorizationPrice || 950);

    if (item.fabricId === 'custom') {
      setFabricPriceInput(item.fabricPrice.toString());
      setCustomFabricPrice(item.fabricPrice);
    } else {
      const prFabric = item.productType === 'persiana' 
        ? PERSIANA_FABRICS.find(f => f.id === item.fabricId)
        : PRESETS_FABRICS.find(f => f.id === item.fabricId);
      if (prFabric) {
        const prPrice = 'pricePerMeter' in prFabric ? prFabric.pricePerMeter : prFabric.price;
        setFabricPriceInput(prPrice.toString());
        setCustomFabricPrice(prPrice);
      }
    }
  };

  const handleDeleteItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
    if (activeItemIndex === index) {
      setActiveItemIndex(null);
      setEnvironment('');
    } else if (activeItemIndex !== null && activeItemIndex > index) {
      setActiveItemIndex(activeItemIndex - 1);
    }
  };

  const handleCancelEdit = () => {
    setActiveItemIndex(null);
    setEnvironment('');
  };

  // Compile final quote object for save/report
  const getCompiledQuote = (): Quote => {
    const primaryItem = items.length > 0 ? items[0] : {
      environment,
      modelId,
      foldFactor,
      width,
      height,
      overlapWidth,
      fabricId: selectedFabricId,
      fabricPrice: currentFabricPriceValue,
      customWastePercentage,
      accessories,
      laborRateType: laborType,
      laborRate,
      installationRate,
      isMotorized,
      motorizationPrice,
    };

    return {
      id: loadedQuote?.id || Math.random().toString(36).substr(2, 9),
      quoteNumber: loadedQuote?.quoteNumber || `QA${Math.floor(1000 + Math.random() * 9000)}`,
      date: loadedQuote?.date || new Date().toISOString(),
      clientInfo: {
        name: clientName || 'Cliente Particular',
        phone: clientPhone,
        email: clientEmail,
        address: clientAddress,
      },
      architectInfo: hasArchitect && architectName ? {
        name: architectName,
        rtPercentage: architectRtPercentage,
        phone: '',
      } : undefined,
      environment: primaryItem.environment,
      modelId: primaryItem.modelId as any,
      foldFactor: primaryItem.foldFactor,
      width: primaryItem.width,
      height: primaryItem.height,
      overlapWidth: primaryItem.overlapWidth,
      fabricId: primaryItem.fabricId,
      fabricPrice: primaryItem.fabricPrice,
      customWastePercentage: primaryItem.customWastePercentage,
      accessories: primaryItem.accessories,
      laborRateType: primaryItem.laborRateType,
      laborRate: primaryItem.laborRate,
      installationRate: primaryItem.installationRate,
      isMotorized: items.length > 0 ? primaryItem.isMotorized : isMotorized,
      motorizationPrice: items.length > 0 ? primaryItem.motorizationPrice : motorizationPrice,
      engineeringAssistanceSelected,
      engineeringAssistancePrice,
      salesStage,
      measurementCheckDate,
      byTechnicalVisit,
      discountPercentage,
      architectDiscountConfig: {
        applyToClientAsDiscount: rtAppliedAsDiscount,
        hidePricesOnPDF,
        hideDetailsOnPDF,
      },
      status,
      vendedorName,
      paymentMethod,
      fabricWidth,
      fabricCode,
      totals: {
        ...compileFinalTotals,
      },
      items: items.length > 0 ? items : [
        {
          id: 'primary',
          environment,
          productType,
          modelId,
          foldFactor,
          width,
          height,
          overlapWidth,
          fabricId: selectedFabricId,
          fabricPrice: currentFabricPriceValue,
          fabricWidth: fabricWidth,
          fabricCode: fabricCode,
          customWastePercentage,
          accessories: [...accessories],
          laborRateType: laborType,
          laborRate,
          installationRate,
          isMotorized,
          motorizationPrice,
          totals: {
            ...activeItemTotals,
            grandTotal: activeItemTotals.subtotal,
          }
        }
      ]
    };
  };

  const handleManagerApprove = () => {
    setStatus('liberado');
    const finalQuote = getCompiledQuote();
    finalQuote.status = 'liberado';
    onSaveQuote(finalQuote);
    alert(`✓ Sucesso! Orçamento #${finalQuote.quoteNumber} foi LIBERADO pelo gerente e está pronto para faturamento!`);
  };

  const handleSave = () => {
    if (isVendedorMatchBlocked) {
      alert(`⚠️ Bloqueio de Segurança: Este orçamento pertence originalmente ao vendedor "${loadedQuote?.vendedorName}". Como você está identificado como "${activeVendedor}", você não tem permissão para alterar este orçamento.`);
      return;
    }

    let finalStatus = status;
    if (userRole === 'vendedor' && loadedQuote && loadedQuote.status === 'liberado') {
      const confirmDowngrade = confirm(
        'Este orçamento já estava LIBERADO pela gerência. Ao salvar alterações como VENDEDOR, o status voltará para PENDENTE e exigirá uma nova liberação do gerente. Deseja prosseguir?'
      );
      if (!confirmDowngrade) return;
      finalStatus = 'pendente';
    }
    
    // Default fallback status for brand new quotes
    if (!loadedQuote) {
      finalStatus = 'pendente';
    }

    setStatus(finalStatus);

    const finalQuote = getCompiledQuote();
    finalQuote.status = finalStatus;
    onSaveQuote(finalQuote);
  };

  const handleDownloadPDF = () => {
    const finalQuote = getCompiledQuote();
    generateQuotePDF(finalQuote);
  };

  const handleSendWhatsApp = () => {
    const finalQuote = getCompiledQuote();
    const formattedMsg = generateWhatsAppMessage(finalQuote);
    const tel = clientPhone ? clientPhone.replace(/\D/g, '') : '';
    window.open(`https://api.whatsapp.com/send?phone=${tel}&text=${encodeURIComponent(formattedMsg)}`, '_blank');
  };

  return (
    <div className="space-y-6" id="quote-form-workspace">
      
      {isVendedorMatchBlocked && (
        <div className="bg-red-50 border border-red-200 text-red-950 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm" id="vendor-mismatch-banner">
          <div className="flex items-start gap-3.5 text-left">
            <div className="bg-red-600 text-white p-2 rounded-xl shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-red-950">Acesso Restrito: Orçamento de Outro Vendedor</h4>
              <p className="text-xs text-red-800 leading-relaxed max-w-2xl">
                Este orçamento (<strong>#{loadedQuote?.quoteNumber}</strong>) pertence originalmente ao vendedor <strong className="underline underline-offset-2 decoration-2 text-red-950 font-bold">{loadedQuote?.vendedorName}</strong>. 
                Sua identificação ativa registrada é <strong className="text-red-950 font-bold">"{activeVendedor || 'Não Definida'}"</strong>. 
                Para garantir a integridade das comissões, o salvamento está bloqueado para seu perfil.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClearLoadedQuote}
            className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all self-stretch md:self-auto text-center cursor-pointer whitespace-nowrap shadow-xs"
          >
            Sair e Fazer Novo
          </button>
        </div>
      )}

      {loadedQuote && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4.5 w-4.5 text-teal-600 animate-pulse" />
            <span>Editando Orçamento Salvo: <strong className="font-bold">#{loadedQuote.quoteNumber}</strong> ({loadedQuote.clientInfo.name})</span>
          </div>
          <button 
            onClick={onClearLoadedQuote}
            className="text-xs bg-teal-100 hover:bg-teal-200 text-teal-800 px-3 py-1 rounded-lg transition-colors font-semibold"
          >
            Novo Orçamento ×
          </button>
        </div>
      )}

      {/* Dynamic Status and Role Alert Banners */}
      {loadedQuote && (
        <div className={`p-5 rounded-2xl border text-left shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
          status === 'liberado'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              {status === 'liberado' ? (
                <>
                  <Check className="h-4.5 w-4.5 text-emerald-600" />
                  Orçamento Totalmente Liberado pela Gerência
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4.5 w-4.5 text-amber-600" />
                  Anotação Técnica • Pendente de Aprovação
                </>
              )}
            </h4>
            <p className="text-xs text-[#4A443E]/90 leading-relaxed font-medium">
              {status === 'liberado'
                ? 'Este documento já passou pela auditoria e foi devidamente liberado para faturamento físico pela equipe da Loja Ambiente Araranguá.'
                : 'Este documento foi cadastrado em sistema e está aguardando liberação de descontos ou de acréscimo de cômodos pela chefia geral.'
              }
            </p>
            {status === 'liberado' && userRole === 'vendedor' && (
              <p className="text-[11px] text-amber-800 font-bold mt-1.5 bg-amber-100/50 px-2.5 py-1 rounded-lg border border-amber-200 leading-tight">
                ⚠ Atenção Vendedor: Quaisquer novas modificações feitas por você redefinirão este status para PENDENTE ao salvar.
              </p>
            )}
          </div>
          
          {userRole === 'gerente' && (
            <div className="self-stretch flex items-center shrink-0">
              {status === 'liberado' ? (
                <button
                  type="button"
                  onClick={() => setStatus('pendente')}
                  className="w-full bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  Bloquear / Voltar a Pendente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleManagerApprove}
                  className="w-full bg-[#7A1657] hover:bg-[#5C1041] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 border border-[#5C1041]"
                >
                  <Check className="h-3.5 w-3.5 text-white" />
                  Liberar Orçamento Já
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* BLOCK 1: Client details */}
      <section className="bg-white border border-natural-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-sm font-bold text-natural-muted uppercase tracking-widest flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-natural-primary" />
          1. Dados Cadastrais e do Cliente
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Nome do Cliente Completo</label>
            <input 
              type="text" 
              value={clientName} 
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Maria Oliveira" 
              className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
              id="client-name-input"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Telefone (Whatsapp)</label>
            <input 
              type="text" 
              value={clientPhone} 
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Ex: (11) 98765-4321" 
              className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
              id="client-phone-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">E-mail para Envio</label>
            <input 
              type="email" 
              value={clientEmail} 
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Ex: maria@email.com" 
              className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
              id="client-email-input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Endereço de Instalação</label>
            <input 
              type="text" 
              value={clientAddress} 
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Rua, Número, Apto, Bairro" 
              className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
              id="client-address"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-natural-muted uppercase">Vendedor Responsável</label>
              {activeVendedor && (
                <button
                  type="button"
                  onClick={() => setVendedorName(activeVendedor)}
                  className="text-[10px] text-[#7A1657] hover:underline font-bold cursor-pointer"
                >
                  Identificar como "{activeVendedor}"
                </button>
              )}
            </div>
            <input 
              type="text" 
              value={vendedorName} 
              onChange={(e) => setVendedorName(e.target.value)}
              placeholder="Nome do vendedor responsável" 
              className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-[#7A1657] font-semibold focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
              id="vendedor-name-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Forma de Pagamento Prevista</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs cursor-pointer"
              id="payment-method-select"
            >
              <option value="À Vista (Pix/Transferência)">À Vista (Pix/Transferência)</option>
              <option value="Cartão de Crédito - 1x sem juros">Cartão de Crédito - 1x sem juros</option>
              <option value="Cartão de Crédito - Parcelado em até 6x">Cartão de Crédito - Parcelado em até 6x</option>
              <option value="Cartão de Crédito - Parcelado em até 10x">Cartão de Crédito - Parcelado em até 10x</option>
              <option value="Entrada 50% + Saldo na Entrega/Instalação">Entrada 50% + Saldo na Entrega/Instalação</option>
              <option value="Boleto Faturado (Sob Consulta Cadastral)">Boleto Faturado (Sob Consulta Cadastral)</option>
            </select>
          </div>
        </div>

        {/* Architect Commissioning Subsection */}
        <div className="mt-5 pt-5 border-t border-natural-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="toggle-architect" 
                checked={hasArchitect}
                onChange={(e) => setHasArchitect(e.target.checked)}
                className="rounded-sm border-natural-input text-natural-primary focus:ring-natural-primary h-4.5 w-4.5 cursor-pointer accent-natural-primary"
              />
              <label htmlFor="toggle-architect" className="text-sm font-semibold text-[#4A443E] cursor-pointer">
                Parceria ou comissão de Arquiteto(a) (Reserva Técnica - RT)
              </label>
            </div>
          </div>

          {hasArchitect && (
            <div className="bg-natural-card p-4 border border-natural-border rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-down" id="architect-panel">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Nome do(a) Arquiteto(a)</label>
                <input 
                  type="text" 
                  value={architectName} 
                  onChange={(e) => setArchitectName(e.target.value)}
                  placeholder="Ex: Arq. Mariana Mendes"
                  className="w-full bg-white border border-natural-input rounded-lg px-3.5 py-2 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Comissão de RT (%)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={architectRtPercentage} 
                    onChange={(e) => setArchitectRtPercentage(Number(e.target.value))}
                    className="w-full bg-white border border-natural-input rounded-lg px-3.5 py-2 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary transition-all shadow-xs"
                    min="0"
                    max="50"
                  />
                  <span className="text-sm text-natural-muted font-bold">%</span>
                </div>
              </div>

              <div className="flex items-center pt-5 sm:pt-0">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rtAppliedAsDiscount}
                    onChange={(e) => setRtAppliedAsDiscount(e.target.checked)}
                    className="rounded-sm border-natural-input text-natural-primary focus:ring-natural-primary h-4.5 w-4.5 accent-natural-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-natural-text block">Reverter RT como Desconto</span>
                    <span className="text-[10px] text-natural-muted block line-clamp-2">Diminui o preço do cliente pela comissão</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Rooms Dashboard (Multi-room panel) */}
      <section className="bg-white border border-natural-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-natural-border pb-3">
          <h2 className="text-sm font-bold text-[#4A443E] uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-natural-primary" />
            Cômodos do Orçamento Cadastrados ({items.length})
          </h2>
          <span className="text-[10px] bg-natural-card px-2.5 py-1 text-natural-muted uppercase font-bold rounded-lg border border-natural-border">
            Multi-Ambientes
          </span>
        </div>

        {items.length === 0 ? (
          <div className="bg-[#FAF9F7] p-5 rounded-xl text-center space-y-2 border border-dashed border-natural-border">
            <Sparkles className="h-6 w-6 text-natural-primary mx-auto opacity-60" />
            <p className="text-xs text-natural-text font-bold">Inicie preenchendo as especificações do primeiro cômodo abaixo.</p>
            <p className="text-[10px] text-[#8C8375] font-medium">Ao concluir o primeiro ambiente, use o botão "Acrescentar Cômodo ao Orçamento" logo no fim da página para poder simular e registrar múltiplos cômodos e tipos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((item, idx) => {
              const itemFabric = item.productType === 'persiana'
                ? PERSIANA_FABRICS.find(f => f.id === item.fabricId)
                : PRESETS_FABRICS.find(f => f.id === item.fabricId);
              return (
                <div 
                  key={item.id}
                  className={`border rounded-xl p-4 relative transition-all flex flex-col justify-between ${
                    activeItemIndex === idx 
                      ? 'border-natural-primary bg-natural-card shadow-sm ring-1 ring-natural-primary/10' 
                      : 'border-natural-border bg-white hover:border-natural-subtle hover:scale-[1.01]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#4A443E] truncate">{item.environment}</h4>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                        item.productType === 'persiana' ? 'bg-[#ECEAE6] text-natural-primary' : 'bg-[#EFEDE9] text-natural-muted'
                      }`}>
                        {item.productType === 'persiana' ? 'Persiana' : 'Cortina'}
                      </span>
                    </div>
                    <p className="text-[10px] text-natural-muted mt-2 font-mono">
                      Dimensões: {item.width.toFixed(2)}m (L) x {item.height.toFixed(2)}m (A)
                    </p>
                    <p className="text-[10px] text-natural-muted leading-tight mt-1 line-clamp-1 font-medium">
                      Material: {itemFabric ? itemFabric.name : 'Personalizado'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dotted border-natural-border flex items-center justify-between">
                    <span className="text-xs font-bold text-natural-primary">R$ {item.totals.subtotal.toFixed(2)}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditItem(idx)}
                        className="p-1.5 text-natural-muted hover:text-natural-primary hover:bg-natural-card rounded-md transition-colors cursor-pointer"
                        title="Editar Cômodo"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1.5 text-natural-muted hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Remover Cômodo"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BLOCK 2: Technical Specifications */}
      <section className="bg-white border border-natural-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-sm font-bold text-natural-muted uppercase tracking-widest flex items-center gap-2 mb-4">
          <Ruler className="h-4 w-4 text-natural-primary" />
          2. Especificações do Cômodo Ativo
        </h2>

        {/* Product Type Toggle */}
        <div className="mb-6 bg-natural-card p-3 rounded-xl border border-natural-border flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <span className="text-xs font-bold text-[#4A443E] uppercase tracking-wide">Tipo de Produto para este ambiente:</span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setProductType('cortina')}
              className={`flex-1 sm:flex-none text-xs px-4 py-2 font-bold rounded-lg transition-all cursor-pointer ${
                productType === 'cortina'
                  ? 'bg-natural-primary text-white shadow-xs'
                  : 'bg-white text-natural-muted border border-natural-border hover:border-natural-subtle'
              }`}
            >
              Cortina Tradicional
            </button>
            <button
              type="button"
              onClick={() => setProductType('persiana')}
              className={`flex-1 sm:flex-none text-xs px-4 py-2 font-bold rounded-lg transition-all cursor-pointer ${
                productType === 'persiana'
                  ? 'bg-natural-primary text-white shadow-xs'
                  : 'bg-white text-natural-muted border border-natural-border hover:border-natural-subtle'
              }`}
            >
              Persiana / Cortina Técnica
            </button>
          </div>
        </div>

        {/* Quick Room Presets */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-natural-subtle uppercase mr-3">Ambiente / Identificação do Cômodo:</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {roomChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setEnvironment(chip)}
                className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  environment === chip 
                    ? 'bg-natural-primary text-white border-natural-primary font-semibold shadow-xs' 
                    : 'bg-white text-natural-muted border-natural-input hover:border-natural-subtle'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
          <input 
            type="text" 
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="w-full max-w-sm mt-3 bg-natural-card border border-natural-input rounded-xl px-4 py-2 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
            placeholder="Especificar outro ambiente"
          />
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-5">
          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Largura do Vão (m)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                step="0.05"
                value={width} 
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
                id="curtain-width"
              />
              <span className="text-xs text-natural-subtle font-bold">m</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Altura do Vão (m)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                step="0.05"
                value={height} 
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
                id="curtain-height"
              />
              <span className="text-xs text-natural-subtle font-bold">m</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8C8375] mb-1.5 uppercase">Folga Lateral (m)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                step="0.05"
                disabled={productType === 'persiana'}
                value={productType === 'persiana' ? 0 : overlapWidth} 
                onChange={(e) => setOverlapWidth(Number(e.target.value))}
                className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs disabled:opacity-50"
              />
              <span className="text-xs text-natural-subtle font-bold">m</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8C8375] mb-1.5 uppercase">Franzimento / Ondas (x)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                step="0.1"
                min="1.0"
                max="4"
                disabled={productType === 'persiana'}
                value={productType === 'persiana' ? 1.0 : foldFactor} 
                onChange={(e) => setFoldFactor(Number(e.target.value))}
                className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs disabled:opacity-50"
              />
              <span className="text-xs text-natural-subtle font-bold">X</span>
            </div>
          </div>
        </div>

        {/* Model selections cards */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-[#5C5346] mb-3 uppercase font-semibold">
            {productType === 'persiana' ? 'Selecione o Modelo de Persiana' : 'Selecione o Modelo de Cortina / Acabamento Superior'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {productType === 'persiana' ? (
              PERSIANA_MODELS.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setModelId(m.id)}
                  className={`cursor-pointer border rounded-xl p-3.5 transition-all text-left relative flex flex-col justify-between ${
                    modelId === m.id
                      ? 'border-natural-primary bg-[#FAF9F7] text-natural-text shadow-sm ring-1 ring-natural-primary/10'
                      : 'border-natural-border bg-white hover:border-natural-subtle text-natural-muted'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-xs tracking-tight flex items-center justify-between">
                      {m.name}
                      {modelId === m.id && <span className="h-1.5 w-1.5 rounded-full bg-natural-primary"></span>}
                    </h4>
                    <p className="text-[10px] text-[#8C8375] mt-1.5 line-clamp-3 leading-relaxed font-medium">
                      {m.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              CURTAIN_MODELS.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setModelId(m.id)}
                  className={`cursor-pointer border rounded-xl p-3.5 transition-all text-left relative flex flex-col justify-between ${
                    modelId === m.id
                      ? 'border-natural-primary bg-natural-card text-natural-text shadow-sm ring-1 ring-natural-primary/10'
                      : 'border-natural-border bg-white hover:border-natural-subtle text-natural-muted'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm tracking-tight flex items-center justify-between">
                      {m.name.split(' ')[0]}
                      {modelId === m.id && <span className="h-1.5 w-1.5 rounded-full bg-natural-primary animate-ping"></span>}
                    </h4>
                    <p className="text-[10px] text-natural-muted mt-1.5 line-clamp-3 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-2.5 border-t border-dotted border-natural-border flex justify-between items-center text-[10px] text-natural-subtle">
                    <span>Fator ideal:</span>
                    <span className="font-bold">{m.defaultFoldFactor}x</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Optional Motorization for the environment */}
        <div className="mt-6 pt-5 border-t border-natural-border">
          <div className="bg-[#fcf8fa] hover:bg-[#FAF6F8] border border-[#f5e6ee] rounded-xl p-4 transition-all">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={isMotorized}
                onChange={(e) => setIsMotorized(e.target.checked)}
                className="mt-1 rounded-sm border-[#c9abbc] text-[#7A1657] focus:ring-[#7A1657] h-4.5 w-4.5 accent-[#7A1657]"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-[#7A1657] tracking-wider uppercase block">Incluir Motorização Automatizada Opcional</span>
                <span className="text-[11px] text-[#8C7581] mt-0.5 block">
                  Permite controlar a cortina ou persiana por controle remoto, Alexa ou interruptor de parede inteligente.
                </span>
                
                {isMotorized && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl p-3 bg-white border border-[#ebd0df] rounded-xl animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-bold text-[#7A1657] uppercase mb-1">Preço do Kit de Motorização (R$)</label>
                      <input 
                        type="number"
                        value={motorizationPrice}
                        onChange={(e) => setMotorizationPrice(Number(e.target.value))}
                        className="w-full bg-natural-card border border-[#ebd0df] rounded-lg px-3 py-1.5 text-xs font-semibold text-natural-text focus:outline-hidden focus:ring-1 focus:ring-[#7A1657] focus:bg-white"
                      />
                    </div>
                    <div className="flex items-end pb-1.5">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 block w-full text-center">
                        ✓ Motorização somada: + R$ {motorizationPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* BLOCK 3: Fabric Specifications  */}
      <section className="bg-white border border-natural-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-sm font-bold text-natural-muted uppercase tracking-widest flex items-center gap-2 mb-4">
          <Scissors className="h-4 w-4 text-natural-primary" />
          {productType === 'persiana' ? '3. Tecidos e Catálogos Técnicos de Persiana' : '3. Tecido e cálculo de desperdício automático'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Fabric Preset Options */}
          <div className="col-span-1">
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Escolha o Catálogo de Tecido</label>
            <select
              value={selectedFabricId}
              onChange={(e) => setSelectedFabricId(e.target.value)}
              className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
            >
              {productType === 'persiana' ? (
                PERSIANA_FABRICS.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))
              ) : (
                PRESETS_FABRICS.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))
              )}
              <option value="custom">-- Material Personalizado Fornecedor --</option>
            </select>
            
            {selectedFabricId === 'custom' && (
              <div className="mt-3.5 space-y-3 p-3.5 bg-natural-card border border-natural-border rounded-xl">
                <div>
                  <label className="block text-[10px] font-bold text-natural-muted mb-1">Nome do Material</label>
                  <input 
                    type="text" 
                    value={customFabricName}
                    onChange={(e) => setCustomFabricName(e.target.value)}
                    placeholder="Ex: Jacquard Premium"
                    className="w-full bg-white border border-natural-input rounded-lg px-3 py-1.5 text-xs text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">
              {productType === 'persiana' ? 'Preço p/ m² de Persiana (R$)' : 'Preço p/ Metro Linear (R$)'}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-natural-subtle font-bold">R$</span>
              <input 
                type="text"
                value={fabricPriceInput}
                onChange={(e) => {
                  setFabricPriceInput(e.target.value);
                  setCustomFabricPrice(parseFloat(e.target.value) || 0);
                }}
                className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
                id="fabric-unit-price"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Taxa de Desperdício / Cobrança Mínima (%)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range"
                min="0"
                max="25"
                step="1"
                disabled={productType === 'persiana'}
                value={productType === 'persiana' ? 0 : customWastePercentage}
                onChange={(e) => setCustomWastePercentage(Number(e.target.value))}
                className="flex-1 accent-natural-primary cursor-pointer disabled:opacity-50"
              />
              <span className="text-sm font-bold text-natural-primary bg-natural-card px-2.5 py-1 rounded-lg border border-natural-border min-w-[50px] text-center">
                {productType === 'persiana' ? 'Mín.' : `${customWastePercentage}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Custom Width, Fabric Code & Optimization Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4 border-t border-natural-border/60 pt-4">
          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">
              {productType === 'persiana' ? 'Largura Máxima do Rolo (m)' : 'Largura/Altura do Rolo (m - Útil)'}
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                step="0.05"
                min="1.0"
                max="5.0"
                value={fabricWidth}
                onChange={(e) => setFabricWidth(Number(e.target.value))}
                className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm font-semibold text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
                placeholder="Ex: 3.0"
                id="fabric-width-input"
              />
              <span className="text-xs text-natural-subtle font-bold">m</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Código / SKU / Referência do Tecido</label>
            <input 
              type="text"
              value={fabricCode}
              onChange={(e) => setFabricCode(e.target.value)}
              className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm placeholder:text-natural-subtle text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs uppercase tracking-wider font-mono font-semibold"
              placeholder="Ex: LNC-412"
              id="fabric-code-input"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 bg-natural-card/50 hover:bg-natural-card border border-natural-border/60 hover:border-natural-border p-3.5 rounded-xl transition-all cursor-pointer select-none w-full shadow-xs">
              <input 
                type="checkbox"
                checked={optimizeFabric}
                onChange={(e) => setOptimizeFabric(e.target.checked)}
                className="rounded-sm border-natural-input text-[#7A1657] focus:ring-[#7A1657] h-5 w-5 accent-[#7A1657]"
              />
              <div className="text-left">
                <span className="block text-xs font-bold text-natural-primary uppercase">Aproveitar Retalhos</span>
                <span className="block text-[10px] text-natural-subtle leading-tight mt-0.5">Calcula encaixe de alturas e redução de perdas de mesmo rolo/código</span>
              </div>
            </label>
          </div>
        </div>

        {/* Fabric Calculations Live Preview */}
        <div className="mt-5 p-4 bg-natural-card border border-natural-border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-natural-primary uppercase tracking-wider">
              {productType === 'persiana' ? 'Cálculo de Área e Perdas Integrados' : 'Cálculo de Consumo de Tecido Integrado'}
            </h4>
            <div className="text-xs text-[#5C5346] font-medium leading-relaxed">
              {productType === 'persiana' ? (
                <>
                  Área do Vão Real: <strong className="text-natural-text">{(width * height).toFixed(2)} m²</strong> 
                  <span className="text-natural-muted block mt-1 text-[10px]">
                    Obs: Práticas da indústria estipulam área mínima de <strong className="text-natural-text">1.50 m²</strong> faturada por peça.
                  </span>
                </>
              ) : (
                <>
                  Largura Total Tecido Plano: <strong className="text-natural-text">{activeItemTotals.flatWidthNeeded.toFixed(2)}m</strong> 
                  {activeItemTotals.stripsCount && (
                    <span className="text-natural-muted block mt-1 text-[10px]">
                      Corte por folhas de largura 1.40m: <strong className="text-natural-text">{activeItemTotals.stripsCount} FOLHAS</strong> de <strong className="text-natural-text">{activeItemTotals.stripLength}m</strong> cada.
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="text-right sm:border-l sm:border-natural-border sm:pl-5">
            <span className="text-[10px] font-bold text-natural-primary uppercase block tracking-wider">
              {productType === 'persiana' ? 'Área de Cobrança Faturada' : 'Metragem com Perdas'}
            </span>
            <span className="text-lg font-bold text-natural-text block font-mono">
              {activeItemTotals.fabricQty.toFixed(2)} {productType === 'persiana' ? 'm²' : 'metros'}
            </span>
            <span className="text-xs text-natural-primary font-bold">
              Subtotal: R$ {activeItemTotals.fabricTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* BLOCK 4: Checklist Preventions and Accessories details */}
      <section className="bg-white border border-natural-border p-6 rounded-2xl shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-natural-muted uppercase tracking-widest flex items-center gap-2">
          <Library className="h-4 w-4 text-natural-primary" />
          4. Checklist Inteligente e Adição de Acessórios
        </h2>

        {/* Checker Component embeds warnings and one-click corrects */}
        <AccessoryChecker 
          modelId={modelId}
          accessories={accessories}
          width={width}
          height={height}
          foldFactor={foldFactor}
          onUpdateAccessories={(newAcc) => setAccessories(newAcc)}
        />

        {/* Table detailing selected Accessories prices/quantities */}
        <div className="border border-natural-border rounded-xl overflow-hidden mt-4">
          <div className="bg-natural-card px-4 py-3 border-b border-natural-border flex justify-between items-center">
            <span className="text-xs font-bold text-natural-muted uppercase">Acessórios Incluídos no Orçamento</span>
            <span className="text-xs font-semibold text-natural-text font-mono">Total: R$ {activeItemTotals.accessoriesTotal.toFixed(2)}</span>
          </div>

          <table className="min-w-full text-left border-collapse" id="accessories-table">
            <thead>
              <tr className="border-b border-natural-border bg-natural-card/50 text-natural-subtle text-[10px] font-bold uppercase">
                <th className="px-4 py-2.5">Item</th>
                <th className="px-4 py-2.5 w-24">Qtd.</th>
                <th className="px-4 py-2.5 w-16 text-center">Un.</th>
                <th className="px-4 py-2.5 w-32">Preço Unit.</th>
                <th className="px-4 py-2.5 w-28 text-right">Subtotal</th>
                <th className="px-4 py-2.5 w-12 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-border text-natural-text text-xs">
              {accessories.map((acc, index) => (
                <tr 
                  key={index}
                  className={`hover:bg-natural-card/20 ${!acc.selected ? 'opacity-40 line-through bg-natural-card/10' : ''}`}
                >
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-natural-text text-sm block">{acc.name}</span>
                    <span className="text-[10px] text-natural-subtle">{acc.mandatory ? '✓ Item de fábrica obrigatório indicado' : 'Catálogo opcional do vendedor'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <input 
                      type="number"
                      step="0.1"
                      disabled={!acc.selected}
                      value={acc.qty}
                      onChange={(e) => handleUpdateAccessoryQty(index, Number(e.target.value))}
                      className="w-20 bg-white border border-natural-input rounded-md px-2 py-1 text-xs text-natural-text disabled:bg-natural-card"
                    />
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-natural-subtle">
                    {acc.unit}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-natural-subtle">R$</span>
                      <input 
                        type="number"
                        disabled={!acc.selected}
                        value={acc.pricePerUnit}
                        onChange={(e) => handleUpdateAccessoryPrice(index, Number(e.target.value))}
                        className="w-20 bg-white border border-natural-input rounded-md px-2 py-1 text-xs text-natural-text disabled:bg-natural-card"
                        id={`accessory-unit-price-${index}`}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-natural-text">
                    R$ {(acc.selected ? (acc.qty * acc.pricePerUnit) : 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex justify-center items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={acc.selected}
                        onChange={() => handleToggleAccessory(index)}
                        className="rounded-sm border-natural-input text-natural-primary focus:ring-natural-primary h-4 w-4 accent-natural-primary"
                      />
                      {!acc.mandatory && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAccessory(index)}
                          className="text-rose-700 hover:text-rose-900 p-1.5 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recommended catalog shortcuts */}
        <div className="pt-2">
          <span className="text-xs font-bold text-natural-subtle uppercase">Adicionar Opcionais recomendados rápidos:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {OTHER_OPTIONAL_ACCESSORIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddPresetOptional(preset)}
                className="text-xs bg-natural-card hover:bg-natural-border/40 border border-natural-border text-natural-muted font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5 text-natural-primary" />
                {preset.name} (+ R$ {preset.price})
              </button>
            ))}
          </div>
        </div>

        {/* Custom Accessory Generator Form */}
        <div className="bg-natural-card p-4 border border-natural-border rounded-xl mt-5">
          <h4 className="text-xs font-bold text-natural-muted uppercase mb-3">Inserir Outro Acessório Personalizado ao Pedido</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-natural-subtle mb-1">Nome do Item</label>
              <input 
                type="text" 
                value={customAccName}
                onChange={(e) => setCustomAccName(e.target.value)}
                placeholder="Ex: Varão Duplo Extra"
                className="w-full bg-white border border-natural-input rounded-lg px-3 py-1.5 text-xs text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-natural-subtle mb-1">Preço Unitário (R$)</label>
              <input 
                type="number" 
                value={customAccPrice}
                onChange={(e) => setCustomAccPrice(Number(e.target.value))}
                className="w-full bg-white border border-natural-input rounded-lg px-3 py-1.5 text-xs text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-natural-subtle mb-1">Quantidade</label>
              <input 
                type="number" 
                value={customAccQty}
                onChange={(e) => setCustomAccQty(Number(e.target.value))}
                className="w-full bg-white border border-natural-input rounded-lg px-3 py-1.5 text-xs text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-natural-subtle mb-1">Unidade</label>
                <select
                  value={customAccUnit}
                  onChange={(e) => setCustomAccUnit(e.target.value as any)}
                  className="w-full bg-white border border-natural-input rounded-lg px-2 py-1.5 text-xs text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary"
                >
                  <option value="un">un</option>
                  <option value="m">m</option>
                  <option value="par">par</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddCustomAccessory}
                className="text-xs bg-natural-primary hover:bg-natural-primary-hover text-white font-bold rounded-lg px-3.5 py-1.5 h-[32px] flex items-center gap-1 transition-colors cursor-pointer"
                id="add-custom-acc-btn"
              >
                Incluir
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Item Conclusion Action Bar */}
      <div className="bg-[#FAF9F7] border border-natural-border p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 transition-all shadow-xs">
        <div className="text-left space-y-1">
          <h4 className="text-xs font-bold text-[#4A443E] uppercase tracking-wide">
            {activeItemIndex !== null ? 'Finalizou a edição deste cômodo?' : 'Concluiu as configurações deste ambiente?'}
          </h4>
          <p className="text-[10px] text-[#8C8375] font-medium">
            {activeItemIndex !== null 
              ? 'Clique abaixo para atualizar as especificações no seu quadro de ambientes.' 
              : 'Clique para registrar este cômodo no orçamento e liberar novas simulações de cômodos!'}
          </p>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto">
          {activeItemIndex !== null ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 sm:flex-none text-xs font-semibold bg-white border border-natural-border text-natural-muted px-4 py-2.5 rounded-xl transition-all hover:bg-natural-card cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddOrUpdateItem}
                className="flex-1 sm:flex-none text-xs font-bold bg-natural-primary text-white border border-natural-primary px-5 py-2.5 rounded-xl transition-all hover:bg-natural-primary-hover shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Atualizar ({environment})
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleAddOrUpdateItem}
              className="w-full sm:w-auto text-xs font-bold bg-[#433E37] text-white border border-[#433E37] px-6 py-3 rounded-xl transition-all hover:bg-[#2F2A24] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="h-4.5 w-4.5 text-natural-success-border" />
              Acrescentar Cômodo ao Orçamento
            </button>
          )}
        </div>
      </div>

      {/* BLOCK 5: Labor and installation settings */}
      <section className="bg-white border border-natural-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-sm font-bold text-natural-muted uppercase tracking-widest flex items-center gap-2 mb-4">
          <FileSpreadsheet className="h-4 w-4 text-natural-primary" />
          5. Mão de obra de confecção e Instalação (Serviços)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Critério de Mão de Obra</label>
            <select
              value={laborType}
              onChange={(e) => setLaborType(e.target.value as any)}
              className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
            >
              <option value="m²">Calcular por m² de Cortina Instalada</option>
              <option value="linear_fabric">Calcular por Metro Linear de Tecido Gasto</option>
              <option value="fixed">Preço de Serviço Fixo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">
              {laborType === 'm²' ? 'Tarifa Confecção por m² (R$)' : laborType === 'linear_fabric' ? 'Tarifa por Metro Linear (R$)' : 'Taxa de Mão de Obra Fixa (R$)'}
            </label>
            <input 
              type="number"
              value={laborRate}
              onChange={(e) => setLaborRate(Number(e.target.value))}
              className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
              id="labor-rate"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-natural-muted mb-1.5 uppercase">Serviço Técnico de Instalação (R$)</label>
            <input 
              type="number"
              value={installationRate}
              onChange={(e) => setInstallationRate(Number(e.target.value))}
              className="w-full bg-natural-card border border-natural-input rounded-xl px-4 py-2.5 text-sm text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary focus:bg-white transition-all shadow-xs"
              id="installation-rate"
            />
          </div>
        </div>

        {/* Optional Sales Engineering fee */}
        <div className="mt-5 pt-4 border-t border-natural-border">
          <div className="bg-[#fcfbf9] hover:bg-[#faf9f6] border border-[#f0ece1] rounded-xl p-4 transition-all">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={engineeringAssistanceSelected}
                onChange={(e) => setEngineeringAssistanceSelected(e.target.checked)}
                className="mt-1 rounded-sm border-[#d2c9b4] text-amber-800 focus:ring-amber-800 h-4.5 w-4.5 accent-amber-800"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-amber-900 tracking-wider uppercase block">Incluir Assistência de Engenharia de Venda (Opcional)</span>
                <span className="text-[11px] text-[#8C7B65] mt-0.5 block">
                  Visita consultiva e detalhamento técnico das cortinas/persianas para garantir o caimento, folgas e compatibilidade de fixação.
                </span>
                
                {engineeringAssistanceSelected && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl p-3 bg-white border border-[#e3dac4] rounded-xl animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-bold text-[#8C7B65] uppercase mb-1">Preço do Serviço de Engenharia (R$)</label>
                      <input 
                        type="number"
                        value={engineeringAssistancePrice}
                        onChange={(e) => setEngineeringAssistancePrice(Number(e.target.value))}
                        className="w-full bg-natural-card border-[#e3dac4] rounded-lg px-3 py-1.5 text-xs font-semibold text-natural-text focus:outline-hidden focus:ring-1 focus:ring-amber-800 focus:bg-white"
                      />
                    </div>
                    <div className="flex items-end pb-1.5">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 block w-full text-center">
                        ✓ Assistência ativa: + R$ {engineeringAssistancePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* BLOCK 6: Sales Pipeline & Scheduling */}
      <section className="bg-white border border-[#DDDCDA] p-6 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-natural-muted uppercase tracking-widest flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-natural-primary" />
          6. Agendamento de Medição & Acompanhamento de Processos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Technical Visit Confirmation Checkbox */}
          <div className="bg-natural-card border border-natural-border p-4 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#4A443E] uppercase tracking-wide block mb-1">Visita Técnica Concluída?</span>
              <span className="text-[10px] text-natural-muted block mb-3">Informe se este orçamento foi elaborado mediante uma visita presencial para conferência.</span>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer bg-white border border-natural-border p-2.5 rounded-lg hover:border-natural-subtle transition-colors">
              <input 
                type="checkbox"
                checked={byTechnicalVisit}
                onChange={(e) => setByTechnicalVisit(e.target.checked)}
                className="rounded-sm border-natural-input text-natural-primary focus:ring-natural-primary h-4.5 w-4.5 accent-natural-primary"
              />
              <span className="text-[11px] font-bold text-natural-text">Feito sob Visita Técnica</span>
            </label>
          </div>

          {/* Measurement check scheduling */}
          <div className="bg-natural-card border border-natural-border p-4 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#4A443E] uppercase tracking-wide block mb-1">Agenda de Conferência de Medidas</span>
              <span className="text-[10px] text-natural-muted block mb-3">Agende a data e horário da visita técnica para verificação de vãos e especificações.</span>
            </div>
            <div>
              <input 
                type="datetime-local"
                value={measurementCheckDate}
                onChange={(e) => setMeasurementCheckDate(e.target.value)}
                className="w-full bg-white border border-natural-input rounded-lg px-3 py-2 text-xs font-semibold text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary"
              />
            </div>
          </div>

          {/* Sales Status / Process Pipeline Tracking */}
          <div className="bg-natural-card border border-natural-border p-4 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#4A443E] uppercase tracking-wide block mb-1">Acompanhar Etapa da Venda</span>
              <span className="text-[10px] text-natural-muted block mb-3">Atualize o andamento do pedido à medida que avança na produção e costura.</span>
            </div>
            <div>
              <select
                value={salesStage}
                onChange={(e) => setSalesStage(e.target.value as any)}
                className="w-full bg-white border border-natural-input rounded-lg px-3 py-2 text-xs font-bold text-natural-text focus:outline-hidden focus:ring-2 focus:ring-natural-primary shadow-xs"
              >
                <option value="pendente">⏳ Orçamento Emitido (Pendente)</option>
                <option value="aprovado">✅ Orçamento Aprovado pelo Cliente</option>
                <option value="visita_medidas">📐 Visita para Conferência de Medidas</option>
                <option value="em_corte">✂️ Em Fase de Corte do Tecido</option>
                <option value="na_costureira">🪡 Enviado para a Costureira</option>
                <option value="em_producao">🏭 Em Fabricação / Produção</option>
                <option value="programado_instalacao">🛠️ Programado Instalação no Local</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Stepper to follow status */}
        <div className="bg-[#FAF9F7] border border-natural-border p-4.5 rounded-xl">
          <span className="text-[10px] font-bold text-[#4A443E] uppercase tracking-wider block mb-3">Fluxo de Produção & Venda:</span>
          
          <div className="hidden md:flex items-center justify-between relative mt-2">
            {/* Background progress bar line */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-0"></div>
            
            {[
              { key: 'pendente', label: 'Emitido', icon: '⏳', color: 'text-amber-500 bg-amber-50 border-amber-200' },
              { key: 'aprovado', label: 'Aprovado', icon: '✅', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
              { key: 'visita_medidas', label: 'Visita Medidas', icon: '📐', color: 'text-sky-500 bg-sky-50 border-sky-200' },
              { key: 'em_corte', label: 'Em Corte', icon: '✂️', color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
              { key: 'na_costureira', label: 'Na Costureira', icon: '🪡', color: 'text-pink-500 bg-pink-50 border-pink-200' },
              { key: 'em_producao', label: 'Produção', icon: '🏭', color: 'text-orange-500 bg-orange-50 border-orange-200' },
              { key: 'programado_instalacao', label: 'Instalação Plan.', icon: '🛠️', color: 'text-teal-500 bg-teal-50 border-teal-200' },
            ].map((step, idx) => {
              const isActive = salesStage === step.key;
              return (
                <div key={step.key} className="flex flex-col items-center z-10 w-20 text-center">
                  <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center text-sm border-2 shadow-xs transition-all ${
                    isActive 
                      ? `${step.color} ring-2 ring-offset-2 ring-natural-primary scale-115 font-bold` 
                      : 'bg-white border-gray-300 text-gray-400 grayscale scale-95 opacity-70'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-[9px] mt-2 leading-none font-bold block ${isActive ? 'text-natural-primary' : 'text-natural-muted'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="md:hidden flex flex-col gap-2 mt-1">
            {[
              { key: 'pendente', label: 'Emitido (Aguardando cliente) ⏳' },
              { key: 'aprovado', label: 'Orçamento Aprovado ✅' },
              { key: 'visita_medidas', label: 'Visita de Conferência de Medidas Agendada 📐' },
              { key: 'em_corte', label: 'Tecido Encaminhado para Corte ✂️' },
              { key: 'na_costureira', label: 'Em Confecção na Costureira 🪡' },
              { key: 'em_producao', label: 'Fabricação / Produção de Trilhos & Suportes 🏭' },
              { key: 'programado_instalacao', label: 'Serviço de Instalação Agendado 🛠️' },
            ].map((step) => (
              <div 
                key={step.key} 
                className={`text-xs px-3 py-2 rounded-lg border transition-all flex items-center justify-between font-semibold ${
                  salesStage === step.key 
                    ? 'bg-natural-card border-natural-primary text-natural-primary font-bold shadow-xs' 
                    : 'bg-white border-natural-border text-gray-400 grayscale opacity-60'
                }`}
              >
                <span>{step.label}</span>
                {salesStage === step.key && <span className="h-2 w-2 rounded-full bg-natural-primary animate-ping"></span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCK 7: Quotation Customizations options */}
      <section className="bg-natural-card border border-natural-border p-6 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-[#4A443E] uppercase tracking-widest flex items-center gap-2 mb-4">
          🎨 Customização Especial do PDF e Envio
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-start gap-2.5 bg-white border border-natural-border p-3 rounded-xl cursor-pointer hover:border-natural-subtle transition-colors">
            <input 
              type="checkbox" 
              checked={hidePricesOnPDF} 
              onChange={(e) => setHidePricesOnPDF(e.target.checked)}
              className="mt-0.5 rounded-sm border-natural-input text-natural-primary focus:ring-natural-primary h-4 w-4 accent-natural-primary"
            />
            <div>
              <span className="text-xs font-bold text-natural-text block">Esconder Valores Individuais no PDF</span>
              <span className="text-[10px] text-natural-muted">Útil para arquitetos repassarem seus orçamentos sem discriminar margens brutas.</span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 bg-white border border-natural-border p-3 rounded-xl cursor-pointer hover:border-natural-subtle transition-colors">
            <input 
              type="checkbox" 
              checked={hideDetailsOnPDF} 
              onChange={(e) => setHideDetailsOnPDF(e.target.checked)}
              className="mt-0.5 rounded-sm border-natural-input text-natural-primary focus:ring-natural-primary h-4 w-4 accent-natural-primary"
            />
            <div>
              <span className="text-xs font-bold text-natural-text block">Esconder Detalhes de Tecido / Simplificar Linhas</span>
              <span className="text-[10px] text-natural-muted">Mostra apenas o produto de confecção final simplificado e o preço final consolidado.</span>
            </div>
          </label>
        </div>

        {/* Global Sale Discount */}
        <div className="mt-5 pt-4 border-t border-natural-border text-left">
          <label className="block text-xs font-bold text-[#4A443E] mb-1.5 uppercase">
            Desconto Geral Especial na Cortina (%) {userRole === 'vendedor' && '(Máx. 10% Vendedor)'}
          </label>
          <div className="flex items-center gap-4 max-w-sm">
            <input 
              type="range"
              min="0"
              max={userRole === 'vendedor' ? '10' : '40'}
              step="1"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              className="flex-1 accent-[#7A1657] cursor-pointer"
            />
            <span className="text-sm font-bold text-rose-700 bg-red-50/70 px-2.5 py-1 rounded-lg border border-red-200 min-w-[50px] text-center">
              {discountPercentage}%
            </span>
          </div>
          {userRole === 'vendedor' && (
            <p className="text-[10px] text-amber-600 mt-1.5 font-semibold">
              * Limite do Vendedor: 10%. Descontos superiores exigem liberação do <strong>Gerente Geral</strong>.
            </p>
          )}
          {userRole === 'gerente' && (
            <p className="text-[10px] text-emerald-600 mt-1.5 font-semibold">
              * Alçada de Gerente Geral liberada: Permite descontos de até 40% no fechamento.
            </p>
          )}
        </div>
      </section>

      {/* BLOCK 7: Big Interactive Calculations Summary Banner and Action Controls */}
      <div className="bg-[#4A443E] text-white rounded-2xl p-6 md:p-8 shadow-md border border-natural-text">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5 text-left">
            <span className="text-xs font-bold text-natural-success-border uppercase tracking-widest inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/15">
              <Sparkles className="h-3 w-3 text-natural-success-border" /> 
              {items.length > 0 ? `Cálculo Consolidado (${items.length} Cômodos)` : 'Cálculo Ativo Unificado'}
            </span>
            <h3 className="text-3xl font-serif font-bold tracking-tight text-white" id="compiled-grand-total">
              R$ {clientGrandTotal.toFixed(2)}
            </h3>
            <p className="text-xs text-natural-border/80 font-medium">
              {items.length > 0 ? (
                <span>Inclui confecção e acessórios estipulados para todos os ambientes listados acima.</span>
              ) : (
                <span>Material: {activeItemTotals.fabricQty.toFixed(2)}m/m² (Desecho estimado incluído no subtotal).</span>
              )}
              {hasArchitect && (
                <span className="text-[#C5D9C4] block mt-1 font-semibold">
                  Comissão de RT {architectName ? `(Arq. ${architectName})` : ''}: R$ {rtAmount.toFixed(2)} ({architectRtPercentage}% RT)
                </span>
              )}
            </p>
            {fabricSavingsCost > 0 && (
              <div className="mt-3 bg-emerald-500/25 border border-emerald-500/30 text-emerald-100 px-4 py-2 bg-blend-normal rounded-xl text-xs flex items-center gap-2 max-w-lg transition-transform animate-pulse">
                <span>✨ <strong>Economia Ativa:</strong> Foram poupados <strong>{fabricSavingsMeters.toFixed(2)}m</strong> de debrum do mesmo rolo, reduzindo o custo de tecido em <strong className="text-emerald-300">R$ {fabricSavingsCost.toFixed(2)}</strong>!</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            {userRole === 'gerente' && status !== 'liberado' && (
              <button
                type="button"
                onClick={handleManagerApprove}
                className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer shadow-md font-sans"
                id="manager-release-action"
              >
                <Check className="h-4.5 w-4.5 text-[#C5D9C4]" />
                Liberar Orçamento
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 md:flex-initial text-natural-text bg-white hover:bg-natural-card border border-natural-border px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer shadow-xs"
              id="save-quote-action"
            >
              <Save className="h-4.5 w-4.5 text-natural-primary" />
              Salvar Orçamento
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="flex-1 md:flex-initial bg-natural-success-bg border border-natural-success-border text-natural-success-text px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer shadow-xs"
              id="download-pdf-action"
            >
              <FileDown className="h-4.5 w-4.5" />
              Obter Relatório PDF
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full md:w-auto bg-natural-primary hover:bg-natural-primary-hover text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer shadow-xs border border-natural-primary-hover"
              id="whatsapp-share-action"
            >
              <Send className="h-4.5 w-4.5" />
              Enviar Zap
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
