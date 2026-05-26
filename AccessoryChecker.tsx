/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CurtainModelId, AccessorySelection } from '../types';
import { CURTAIN_MODELS, MODEL_ESSENTIAL_ACCESSORIES_RULES } from '../constants';
import { AlertTriangle, CheckCircle2, Plus, RefreshCw, Sparkles } from 'lucide-react';

interface AccessoryCheckerProps {
  modelId: CurtainModelId;
  accessories: AccessorySelection[];
  width: number;
  height: number;
  foldFactor: number;
  onUpdateAccessories: (accessories: AccessorySelection[]) => void;
}

export default function AccessoryChecker({
  modelId,
  accessories,
  width,
  height,
  foldFactor,
  onUpdateAccessories,
}: AccessoryCheckerProps) {
  const model = CURTAIN_MODELS.find(m => m.id === modelId);
  const essentialNames = MODEL_ESSENTIAL_ACCESSORIES_RULES[modelId] || [];

  // Check which mandatory accessories are currently selected
  const checks = essentialNames.map(name => {
    const matchingAcc = accessories.find(acc => acc.name === name);
    const isSelected = !!matchingAcc?.selected;
    const modelRule = model?.requiredAccessories.find(a => a.name === name);
    
    return {
      name,
      isSelected,
      description: modelRule?.description || '',
      suggestedPrice: modelRule?.suggestedPrice || 0,
      unit: modelRule?.unit || 'un',
      calculateQty: modelRule?.calculateQty,
    };
  });

  const missingCount = checks.filter(c => !c.isSelected).length;

  const handleAddAccessory = (check: typeof checks[0]) => {
    const matchingAccIndex = accessories.findIndex(acc => acc.name === check.name);
    
    // Calculate recommended quantity
    const finalQty = check.calculateQty ? check.calculateQty(width, height, foldFactor) : 1;
    
    const updated = [...accessories];
    if (matchingAccIndex > -1) {
      updated[matchingAccIndex] = {
        ...updated[matchingAccIndex],
        selected: true,
        qty: finalQty,
        pricePerUnit: check.suggestedPrice,
      };
    } else {
      updated.push({
        name: check.name,
        unit: check.unit as 'm' | 'un' | 'par',
        qty: finalQty,
        pricePerUnit: check.suggestedPrice,
        mandatory: true,
        selected: true,
        source: 'model',
      });
    }
    onUpdateAccessories(updated);
  };

  const handleAddAllMissing = () => {
    const updated = [...accessories];
    checks.forEach(check => {
      if (!check.isSelected) {
        const matchingAccIndex = updated.findIndex(acc => acc.name === check.name);
        const finalQty = check.calculateQty ? check.calculateQty(width, height, foldFactor) : 1;
        
        if (matchingAccIndex > -1) {
          updated[matchingAccIndex] = {
            ...updated[matchingAccIndex],
            selected: true,
            qty: finalQty,
            pricePerUnit: check.suggestedPrice,
          };
        } else {
          updated.push({
            name: check.name,
            unit: check.unit as 'm' | 'un' | 'par',
            qty: finalQty,
            pricePerUnit: check.suggestedPrice,
            mandatory: true,
            selected: true,
            source: 'model',
          });
        }
      }
    });
    onUpdateAccessories(updated);
  };

  return (
    <div className="bg-natural-card border border-natural-border rounded-xl p-5" id="accessory-checker-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-natural-text flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-natural-primary animate-pulse" />
            Checklist de Segurança do Vendedor
          </h3>
          <p className="text-xs text-natural-muted mt-0.5">
            Garantias técnicas exigidas pelo modelo <span className="font-medium text-natural-text">{model?.name}</span>
          </p>
        </div>
        
        {missingCount > 0 ? (
          <button
            type="button"
            onClick={handleAddAllMissing}
            className="text-xs font-bold bg-[#FAECE3] hover:bg-[#F3DDD0] text-[#8C3F1D] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-[#EAD0C1]"
            id="add-all-missing-btn"
          >
            <RefreshCw className="h-3 w-3" />
            Resolver Pendências ({missingCount})
          </button>
        ) : (
          <span className="text-xs font-bold bg-[#E4EEE3] text-natural-success-text px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#C5D9C4]">
            <CheckCircle2 className="h-3.5 w-3.5 text-natural-success-text" />
            Pedido Seguro (Sem pendências!)
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {checks.map((check) => (
          <div
            key={check.name}
            className={`flex items-start sm:items-center justify-between p-3.5 rounded-lg border transition-all ${
              check.isSelected
                ? 'bg-white border-[#C5D9C4] hover:border-[#B3CCB1] shadow-xs'
                : 'bg-[#FDFAF7] border-[#EAD0C1] shadow-xs ring-1 ring-[#8C3F1D]/10'
            }`}
          >
            <div className="flex items-start gap-3 max-w-[70%]">
              <div className="mt-0.5 sm:mt-0">
                {check.isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-natural-success-text shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-[#C95B2B] shrink-0 animate-bounce" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-natural-text flex items-center gap-1.5">
                  {check.name}
                  {!check.isSelected && (
                    <span className="text-[10px] font-bold bg-[#FAECE3] text-[#8C3F1D] px-2 py-0.5 rounded-full uppercase border border-[#EAD0C1]">
                      Obrigatório
                    </span>
                  )}
                </h4>
                <p className="text-xs text-natural-subtle mt-0.5 line-clamp-2 md:line-clamp-none">
                  {check.description}
                </p>
              </div>
            </div>

            <div>
              {check.isSelected ? (
                <span className="text-xs font-bold text-natural-success-text bg-[#F0F7EF] px-2.5 py-1 rounded-md border border-[#C5D9C4]">
                  Adicionado
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddAccessory(check)}
                  className="text-xs font-bold text-[#8C3F1D] bg-[#FAECE3] hover:bg-[#F3DDD0] border border-[#EAD0C1] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Incluir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
