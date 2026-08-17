import type { Product } from './types'

/** Representative building-material SKUs for the demonstration. */
export const products: Product[] = [
  { sku: 'EW-LVL-1750', description: '1-3/4 x 11-7/8 LVL Beam', category: 'Engineered Wood', unit: 'PCS', lbsPerUnit: 62, lengthFt: 24, bunkable: true },
  { sku: 'EW-LVL-2400', description: '1-3/4 x 16 LVL Beam', category: 'Engineered Wood', unit: 'PCS', lbsPerUnit: 84, lengthFt: 32, bunkable: true },
  { sku: 'EW-IJST-117', description: 'I-Joist 11-7/8 Series 40', category: 'Engineered Wood', unit: 'PCS', lbsPerUnit: 38, lengthFt: 24, bunkable: true },
  { sku: 'EW-IJST-160', description: 'I-Joist 16 Series 60', category: 'Engineered Wood', unit: 'PCS', lbsPerUnit: 51, lengthFt: 32, bunkable: true },
  { sku: 'EW-RIM-118', description: 'Rim Board 1-1/8 x 11-7/8', category: 'Engineered Wood', unit: 'PCS', lbsPerUnit: 44, lengthFt: 16, bunkable: true },
  { sku: 'EW-GLM-514', description: 'Glulam 5-1/8 x 14', category: 'Engineered Wood', unit: 'PCS', lbsPerUnit: 210, lengthFt: 28, bunkable: false },
  { sku: 'PN-OSB-716', description: '7/16 OSB Sheathing 4x8', category: 'Panel', unit: 'PCS', lbsPerUnit: 46, lengthFt: 8, bunkable: true },
  { sku: 'PN-PLY-58', description: '5/8 CDX Plywood 4x8', category: 'Panel', unit: 'PCS', lbsPerUnit: 58, lengthFt: 8, bunkable: true },
  { sku: 'PN-SUB-34', description: '3/4 T&G Subfloor 4x8', category: 'Panel', unit: 'PCS', lbsPerUnit: 70, lengthFt: 8, bunkable: true },
  { sku: 'DL-SPF-210', description: '2x10 SPF #2 Framing', category: 'Dimensional Lumber', unit: 'PCS', lbsPerUnit: 33, lengthFt: 16, bunkable: true },
  { sku: 'DL-SPF-26', description: '2x6 SPF #2 Framing', category: 'Dimensional Lumber', unit: 'PCS', lbsPerUnit: 19, lengthFt: 16, bunkable: true },
  { sku: 'DL-SYP-24', description: '2x4 SYP Stud', category: 'Dimensional Lumber', unit: 'PCS', lbsPerUnit: 11, lengthFt: 8, bunkable: true },
  { sku: 'TR-PT-26', description: '2x6 Pressure Treated', category: 'Treated', unit: 'PCS', lbsPerUnit: 27, lengthFt: 16, bunkable: true },
  { sku: 'TR-PT-6X6', description: '6x6 Pressure Treated Post', category: 'Treated', unit: 'PCS', lbsPerUnit: 96, lengthFt: 12, bunkable: true },
  { sku: 'ST-FCS-812', description: 'Fiber Cement Lap Siding 8-1/4', category: 'Siding & Trim', unit: 'PCS', lbsPerUnit: 29, lengthFt: 12, bunkable: true },
  { sku: 'ST-TRM-1X8', description: 'Primed Trim Board 1x8', category: 'Siding & Trim', unit: 'PCS', lbsPerUnit: 14, lengthFt: 16, bunkable: true },
  { sku: 'CD-COMP-16', description: 'Composite Decking 5/4x6', category: 'Composite Decking', unit: 'PCS', lbsPerUnit: 31, lengthFt: 16, bunkable: true },
  { sku: 'RF-ARCH-SQ', description: 'Architectural Shingle', category: 'Roofing', unit: 'SQ', lbsPerUnit: 240, lengthFt: 4, bunkable: true },
]

export const productBySku = new Map(products.map((p) => [p.sku, p]))
