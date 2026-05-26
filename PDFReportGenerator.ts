/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote } from '../types';
import { CURTAIN_MODELS, PRESETS_FABRICS } from '../constants';

export function generateQuotePDF(quote: Quote) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const model = CURTAIN_MODELS.find(m => m.id === quote.modelId);
  const fabric = PRESETS_FABRICS.find(f => f.id === quote.fabricId);

  // Styling Constants
  const primaryColor = [122, 22, 87]; // Loja Ambiente Deep Purple/Plum
  const accentColor = [225, 59, 126]; // Loja Ambiente Pink/Rose
  const textColor = [48, 26, 41]; // Deep plum-tinted dark charcoal

  // 1. Header with branding
  doc.setFillColor(122, 22, 87); // Deep Plum background bar
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('LOJA AMBIENTE', 15, 17);
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(245, 237, 241);
  doc.text('decorando o seu espaço', 15, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('E.C. DECORACOES EIRELI ME | Rua Antonio Bertoncini, 135 - Bairro Cidade Alta - Ararangua/SC', 15, 28);
  doc.text('Fones: (48) 3524-1574 / 99931-1574 | lojaambiente@hotmail.com | CNPJ: 22.675.872/0001-92', 15, 32);

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORÇAMENTO #${quote.quoteNumber}`, 145, 17);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${new Date(quote.date).toLocaleDateString('pt-BR')}`, 145, 23);
  doc.text('Validade: 10 dias', 145, 28);
  doc.text('Insc: 25.767.782-8', 145, 33);

  // 2. Client & Architect Information
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DADOS DO CLIENTE', 15, 48);

  doc.setLineWidth(0.5);
  doc.setDrawColor(229, 231, 235);
  doc.line(15, 50, 195, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Nome:', 15, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.clientInfo.name, 30, 56);

  doc.setFont('helvetica', 'bold');
  doc.text('Telefone:', 15, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.clientInfo.phone || 'Não informado', 35, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('E-mail:', 15, 68);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.clientInfo.email || 'Não informado', 30, 68);

  doc.setFont('helvetica', 'bold');
  doc.text('Instalação:', 15, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.clientInfo.address || 'Não informado', 35, 74);

  // Architect block if present
  if (quote.architectInfo && quote.architectInfo.name) {
    doc.setTextColor(94, 108, 91); // Sage Green header for arch
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SISTEMA PARCEIRO (ARQUITETO)', 120, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Arquiteto(a):', 120, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.architectInfo.name, 145, 56);

    doc.setFont('helvetica', 'bold');
    doc.text('Reserva Técnica:', 120, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(`${quote.architectInfo.rtPercentage}% RT`, 152, 62);

    if (quote.architectDiscountConfig.applyToClientAsDiscount) {
      doc.text('(Revertido p/ Cliente)', 120, 68);
    } else {
      doc.text('(Pago ao Arquiteto)', 120, 68);
    }
  }

  // 3. Technical Specifications of the Curtain or Environments list
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  
  if (quote.items && quote.items.length > 0) {
    doc.text('AMBIENTES E ESPECIFICAÇÕES CADASTRADAS', 15, 85);
    doc.line(15, 87, 195, 87);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const roomsText = quote.items.map((it, idx) => `${idx + 1}. ${it.environment} (${it.productType === 'persiana' ? 'Persiana' : `Cortina ${it.modelId.toUpperCase()}`}: ${it.width.toFixed(2)}x${it.height.toFixed(2)}m)`).join('  |  ');
    const splitRooms = doc.splitTextToSize(roomsText, 180);
    doc.text(splitRooms, 15, 93);
  } else {
    doc.text('ESPECIFICAÇÕES DA CORTINA', 15, 85);
    doc.line(15, 87, 195, 87);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Ambiente:', 15, 93);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.environment || 'Sala de Estar', 35, 93);

    doc.setFont('helvetica', 'bold');
    doc.text('Modelo:', 15, 99);
    doc.setFont('helvetica', 'normal');
    doc.text(model?.name || quote.modelId, 32, 99);

    doc.setFont('helvetica', 'bold');
    doc.text('Fator Franzido:', 15, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(`${quote.foldFactor.toFixed(1)}x de tecido`, 43, 105);

    doc.setFont('helvetica', 'bold');
    doc.text('Medida do Vão:', 120, 93);
    doc.setFont('helvetica', 'normal');
    doc.text(`${quote.width.toFixed(2)}m (L) x ${quote.height.toFixed(2)}m (A)`, 150, 93);

    doc.setFont('helvetica', 'bold');
    doc.text('Folga (Transpasse):', 120, 99);
    doc.setFont('helvetica', 'normal');
    doc.text(`${quote.overlapWidth.toFixed(2)}m`, 156, 99);

    doc.setFont('helvetica', 'bold');
    doc.text('Tecido Flat Necess.:', 120, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(`${quote.totals.fabricQty.toFixed(2)}m (Incluso descarte)`, 158, 105);
  }

  // 4. Detail Table (Customizable based on configuration)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DETALHAMENTO DOS ITENS E VALORES', 15, 116);

  const hidePrices = quote.architectDiscountConfig.hidePricesOnPDF;
  const hideDetails = quote.architectDiscountConfig.hideDetailsOnPDF;

  if (hideDetails) {
    // Elegant single line table summary
    const tableBody = quote.items && quote.items.length > 0
      ? quote.items.map((item, idx) => [
          `${idx + 1}. Confeccao de ${item.productType === 'persiana' ? 'Persiana' : 'Cortina'} - ${item.environment}`,
          `Modelo: ${(item.productType === 'persiana' ? 'Persiana' : CURTAIN_MODELS.find(m => m.id === item.modelId)?.name) || item.modelId} | ${item.width.toFixed(2)}m x ${item.height.toFixed(2)}m`,
          '1 un',
          hidePrices ? '-' : `R$ ${item.totals.grandTotal.toFixed(2)}`
        ])
      : [
          [
            'Confeccao de Cortina Completa sob Medida',
            `${fabric?.name || 'Trama Premium'} - Modelo ${model?.name || quote.modelId}`,
            '1 un',
            hidePrices ? '-' : `R$ ${quote.totals.grandTotal.toFixed(2)}`
          ]
        ];

    autoTable(doc, {
      startY: 119,
      head: [['Item / Descricao', 'Especificacoes Tecnicas', 'Quant.', 'Valores (R$)']],
      body: tableBody,
      headStyles: { fillColor: [122, 22, 87], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      theme: 'grid',
    });
  } else {
    // Full technical detail table
    const tableHeaders = ['Item', 'Descricao/Unidade', 'Quantidade', 'Valor Unit.', 'Total (R$)'];
    const tableBody: any[] = [];

    const itemsToProcess = quote.items && quote.items.length > 0
      ? quote.items
      : [
          {
            environment: quote.environment,
            productType: 'cortina' as const,
            modelId: quote.modelId,
            width: quote.width,
            height: quote.height,
            overlapWidth: quote.overlapWidth,
            fabricId: quote.fabricId,
            fabricPrice: quote.fabricPrice,
            customWastePercentage: quote.customWastePercentage,
            accessories: quote.accessories,
            laborRateType: quote.laborRateType,
            laborRate: quote.laborRate,
            installationRate: quote.installationRate,
            totals: {
              fabricQty: quote.totals.fabricQty,
              fabricTotal: quote.totals.fabricTotal,
              laborTotal: quote.totals.laborTotal,
              installationTotal: quote.totals.installationTotal,
              accessoriesTotal: quote.totals.accessoriesTotal,
              subtotal: quote.totals.subtotal,
              grandTotal: quote.totals.grandTotal
            }
          }
        ];

    itemsToProcess.forEach((item) => {
      // Add a highlighted group separator row for the Environment
      tableBody.push([
        { content: `${item.environment.toUpperCase()} (${item.productType === 'persiana' ? 'PERSIANA' : 'CORTINA'})`, colSpan: 5, styles: { fillColor: [245, 237, 241], fontStyle: 'bold', textColor: [122, 22, 87] } }
      ]);

      const itemFabric = PRESETS_FABRICS.find(f => f.id === item.fabricId);

      // Fabric line
      tableBody.push([
        item.productType === 'persiana' ? 'Estrutura / Material' : 'Tecido do Corpo',
        `${itemFabric?.name || 'Material Adaptado'} (Larg. ${itemFabric?.width || 3.0}m)`,
        `${item.totals.fabricQty.toFixed(2)} ${item.productType === 'persiana' ? 'm²' : 'm'}`,
        hidePrices ? '-' : `R$ ${item.fabricPrice.toFixed(2)}`,
        hidePrices ? '-' : `R$ ${item.totals.fabricTotal.toFixed(2)}`
      ]);

      // Labor line
      if (item.totals.laborTotal > 0) {
        let laborDesc = '';
        if (item.laborRateType === 'm²') {
          laborDesc = `Mão de Obra Confecção (p/ m² - área: ${(item.width * item.height).toFixed(2)}m²)`;
        } else if (item.laborRateType === 'linear_fabric') {
          laborDesc = 'Mão de Obra Confecção (p/ metro linear)';
        } else {
          laborDesc = 'Taxa de Confecção Fixa';
        }
        tableBody.push([
          'Confeccao',
          laborDesc,
          item.laborRateType === 'fixed' ? '1 un' : `${(item.laborRateType === 'm²' ? item.width * item.height : item.totals.fabricQty).toFixed(2)}`,
          hidePrices ? '-' : `R$ ${item.laborRate.toFixed(2)}`,
          hidePrices ? '-' : `R$ ${item.totals.laborTotal.toFixed(2)}`
        ]);
      }

      // Installation line
      if (item.totals.installationTotal > 0) {
        tableBody.push([
          'Instalacao',
          'Servico tecnico especializado de fixacao e alinhamento',
          '1 un',
          hidePrices ? '-' : `R$ ${item.totals.installationTotal.toFixed(2)}`,
          hidePrices ? '-' : `R$ ${item.totals.installationTotal.toFixed(2)}`
        ]);
      }

      // Motorization line
      if (item.isMotorized) {
        tableBody.push([
          'Motorizacao',
          'Kit Motorizacao Inteligente (Controle / Smartphone / Alexa)',
          '1 un',
          hidePrices ? '-' : `R$ ${(item.motorizationPrice || 950).toFixed(2)}`,
          hidePrices ? '-' : `R$ ${(item.totals.motorizationTotal || item.motorizationPrice || 950).toFixed(2)}`
        ]);
      }

      // Accessories lines
      item.accessories.filter(acc => acc.selected).forEach(acc => {
        tableBody.push([
          `Acessorio: ${acc.name}`,
          `Componente tecnico de acabamento`,
          `${acc.qty} ${acc.unit}`,
          hidePrices ? '-' : `R$ ${acc.pricePerUnit.toFixed(2)}`,
          hidePrices ? '-' : `R$ ${(acc.qty * acc.pricePerUnit).toFixed(2)}`
        ]);
      });
    });

    autoTable(doc, {
      startY: 119,
      head: [tableHeaders],
      body: tableBody,
      headStyles: { fillColor: [122, 22, 87], fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
      theme: 'striped',
    });
  }

  // 5. Total Calculations & Observations
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Draw decorative box for totals
  let totalsBoxHeight = 45;
  const hasEngineeringFee = quote.engineeringAssistanceSelected && (quote.engineeringAssistancePrice || 0) > 0;
  if (hasEngineeringFee) {
    totalsBoxHeight += 6;
  }

  doc.setFillColor(249, 250, 251);
  doc.rect(115, finalY, 80, totalsBoxHeight, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(115, finalY, 80, totalsBoxHeight, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  let cursorY = finalY + 6;
  
  if (!hidePrices) {
    // List subtotals inside the box
    const itemsSubtotal = quote.totals.subtotal - (quote.totals.engineeringAssistanceTotal || 0);
    doc.text('Subtotal dos Itens:', 119, cursorY);
    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${itemsSubtotal.toFixed(2)}`, 168, cursorY);
    doc.setFont('helvetica', 'normal');

    if (hasEngineeringFee) {
      cursorY += 6;
      doc.text('Assistência Engenharia:', 119, cursorY);
      doc.setFont('helvetica', 'bold');
      doc.text(`R$ ${(quote.totals.engineeringAssistanceTotal || quote.engineeringAssistancePrice || 0).toFixed(2)}`, 168, cursorY);
      doc.setFont('helvetica', 'normal');
    }

    if (quote.discountPercentage > 0) {
      cursorY += 6;
      doc.text(`Desconto (${quote.discountPercentage}%):`, 119, cursorY);
      doc.setFont('helvetica', 'bold');
      doc.text(`- R$ ${quote.totals.discountAmount.toFixed(2)}`, 168, cursorY);
      doc.setFont('helvetica', 'normal');
    }

    if (quote.architectInfo && quote.totals.rtAmount > 0) {
      cursorY += 6;
      doc.text(`Comissão Arquiteto (${quote.totals.rtAmount > 0 ? quote.architectInfo.rtPercentage : 0}%):`, 119, cursorY);
      doc.setFont('helvetica', 'bold');
      doc.text(`R$ ${quote.totals.rtAmount.toFixed(2)}`, 168, cursorY);
      doc.setFont('helvetica', 'normal');
    }

    cursorY += 10;
    // Draw divider inside box
    doc.setDrawColor(209, 213, 219);
    doc.line(119, cursorY - 5, 191, cursorY - 5);
    
    doc.setTextColor(122, 22, 87); // Deep Plum for outstanding total
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL FINAL:', 119, cursorY);
    doc.text(`R$ ${quote.totals.grandTotal.toFixed(2)}`, 162, cursorY);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Valores Sob Consulta', 125, cursorY + 15);
  }

  // 6. Draw Scheduled Visits / Technical Check info
  let visitY = finalY + 41;
  doc.setFillColor(245, 245, 247);
  doc.rect(15, visitY, 90, 21, 'F');
  doc.setDrawColor(220, 220, 225);
  doc.rect(15, visitY, 90, 21, 'D');

  doc.setTextColor(122, 22, 87);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('AGENDA & CONTROLE DE MEDIÇÃO:', 18, visitY + 5);

  doc.setFontSize(7.5);
  
  // Choose color based on technical visit approval
  if (quote.byTechnicalVisit) {
    doc.setTextColor(16, 124, 65); // Green
    doc.setFont('helvetica', 'bold');
    doc.text('✓ Orçamento elaborado APÓS visita técnica para conferência.', 18, visitY + 10);
  } else {
    doc.setTextColor(180, 83, 9); // Amber
    doc.setFont('helvetica', 'normal');
    doc.text('⏳ Elaborado sem visita técnica presencial prévia (conferir medidas!).', 18, visitY + 10);
  }

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  // Date scheduling information
  if (quote.measurementCheckDate) {
    const formattedDate = new Date(quote.measurementCheckDate).toLocaleString('pt-BR');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(48, 26, 41);
    doc.text(`📆 Visita de Conferência Agendada: ${formattedDate}`, 18, visitY + 15);
  } else {
    doc.text('📆 Visita de Conferência: Aguardando agendamento', 18, visitY + 15);
  }

  // Draw observations on left side - Official Terms & Conditions of Loja Ambiente
  doc.setTextColor(122, 22, 87);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('TERMOS E CONDIÇÕES DE FORNECIMENTO (LOJA AMBIENTE):', 15, finalY + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('1. Nossos produtos possuem 01 ano de garantia contra defeitos de fabricacao.', 15, finalY + 11);
  doc.text('2. A garantia sera invalidada se o tecido for lavado ou com manutencao fora da LOJA AMBIENTE.', 15, finalY + 15);
  doc.text('3. Nao aceitamos desistencia apos a compra pois a confeccao sob medida inicia de imediato.', 15, finalY + 19);
  doc.text('4. O prazo de entrega comeca a contar de forma estrita a partir da realizacao da medicao final.', 15, finalY + 23);
  doc.text('5. Podem ocorrer pequenas alteracoes de cor/textura das amostras em relacao ao lote do tecido recebido.', 15, finalY + 27);
  doc.text('6. Toda e qualquer instalacao eletrica ou infraestrutura de sanca e motorizacao e de responsabilidade exclusiva do cliente.', 15, finalY + 31);
  doc.text(`7. Desperdicio estrutural padrao de ${quote.customWastePercentage || 10}% calculado. Orcamento oficial valido por 10 dias.`, 15, finalY + 35);

  // Footer page numbering
  doc.setLineWidth(0.3);
  doc.setDrawColor(209, 213, 219);
  doc.line(15, 280, 195, 280);

  doc.setFontSize(7.5);
  doc.text('Emitido pelo Sistema Oficial Uni_Ambiente - Ararangua/SC. Obrigado pela preferencia!', 15, 285);
  doc.text('Pagina 1 de 1', 178, 285);

  // Save the PDF
  doc.save(`Orcamento_Cortina_${quote.clientInfo.name.replace(/\s+/g, '_')}_${quote.quoteNumber}.pdf`);
}
