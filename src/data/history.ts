import type { IntegrationEvent, PerformanceDay } from './types'

/** Fourteen days of simulated planned-versus-actual branch history. */
export const performanceHistory: PerformanceDay[] = [
  { date: '2026-07-29', label: 'Wed 7/29', plannedMiles: 842, actualMiles: 889, plannedStops: 34, completedStops: 34, plannedDurationMin: 2280, actualDurationMin: 2411, onTimePct: 91, utilizationPct: 71, routesRun: 16, exceptions: 11 },
  { date: '2026-07-30', label: 'Thu 7/30', plannedMiles: 916, actualMiles: 948, plannedStops: 37, completedStops: 36, plannedDurationMin: 2460, actualDurationMin: 2588, onTimePct: 88, utilizationPct: 68, routesRun: 17, exceptions: 14 },
  { date: '2026-07-31', label: 'Fri 7/31', plannedMiles: 978, actualMiles: 1032, plannedStops: 41, completedStops: 41, plannedDurationMin: 2640, actualDurationMin: 2792, onTimePct: 86, utilizationPct: 74, routesRun: 18, exceptions: 17 },
  { date: '2026-08-03', label: 'Mon 8/3', plannedMiles: 795, actualMiles: 824, plannedStops: 32, completedStops: 32, plannedDurationMin: 2160, actualDurationMin: 2244, onTimePct: 93, utilizationPct: 69, routesRun: 15, exceptions: 9 },
  { date: '2026-08-04', label: 'Tue 8/4', plannedMiles: 863, actualMiles: 907, plannedStops: 35, completedStops: 34, plannedDurationMin: 2340, actualDurationMin: 2478, onTimePct: 89, utilizationPct: 72, routesRun: 16, exceptions: 12 },
  { date: '2026-08-05', label: 'Wed 8/5', plannedMiles: 901, actualMiles: 935, plannedStops: 36, completedStops: 36, plannedDurationMin: 2400, actualDurationMin: 2521, onTimePct: 90, utilizationPct: 70, routesRun: 17, exceptions: 13 },
  { date: '2026-08-06', label: 'Thu 8/6', plannedMiles: 944, actualMiles: 1001, plannedStops: 39, completedStops: 38, plannedDurationMin: 2520, actualDurationMin: 2694, onTimePct: 85, utilizationPct: 66, routesRun: 18, exceptions: 16 },
  { date: '2026-08-07', label: 'Fri 8/7', plannedMiles: 1012, actualMiles: 1058, plannedStops: 42, completedStops: 42, plannedDurationMin: 2700, actualDurationMin: 2841, onTimePct: 87, utilizationPct: 75, routesRun: 19, exceptions: 18 },
  { date: '2026-08-10', label: 'Mon 8/10', plannedMiles: 812, actualMiles: 848, plannedStops: 33, completedStops: 33, plannedDurationMin: 2220, actualDurationMin: 2318, onTimePct: 92, utilizationPct: 68, routesRun: 15, exceptions: 10 },
  { date: '2026-08-11', label: 'Tue 8/11', plannedMiles: 887, actualMiles: 921, plannedStops: 36, completedStops: 35, plannedDurationMin: 2400, actualDurationMin: 2532, onTimePct: 88, utilizationPct: 71, routesRun: 16, exceptions: 13 },
  { date: '2026-08-12', label: 'Wed 8/12', plannedMiles: 934, actualMiles: 986, plannedStops: 38, completedStops: 38, plannedDurationMin: 2520, actualDurationMin: 2663, onTimePct: 86, utilizationPct: 73, routesRun: 17, exceptions: 15 },
  { date: '2026-08-13', label: 'Thu 8/13', plannedMiles: 958, actualMiles: 995, plannedStops: 40, completedStops: 39, plannedDurationMin: 2580, actualDurationMin: 2718, onTimePct: 87, utilizationPct: 69, routesRun: 18, exceptions: 14 },
  { date: '2026-08-14', label: 'Fri 8/14', plannedMiles: 1024, actualMiles: 1079, plannedStops: 43, completedStops: 43, plannedDurationMin: 2760, actualDurationMin: 2915, onTimePct: 84, utilizationPct: 76, routesRun: 19, exceptions: 19 },
  { date: '2026-08-17', label: 'Mon 8/17', plannedMiles: 926, actualMiles: 962, plannedStops: 37, completedStops: 21, plannedDurationMin: 2400, actualDurationMin: 2534, onTimePct: 89, utilizationPct: 72, routesRun: 17, exceptions: 15 },
]

/** Service-time history for the location the Planned-versus-Actual agent flagged. */
export const berkshireServiceHistory = [
  { label: '7/31', planned: 55, actual: 86 },
  { label: '8/4', planned: 55, actual: 57 },
  { label: '8/6', planned: 55, actual: 92 },
  { label: '8/11', planned: 55, actual: 61 },
  { label: '8/13', planned: 55, actual: 88 },
  { label: '8/17', planned: 55, actual: 103 },
]

export const integrationEvents: IntegrationEvent[] = [
  { id: 'IEV-001', at: '2026-08-17T05:10', source: 'Order workflow', target: 'Routing view', type: 'Order release', status: 'Delayed', orderId: 'DEMO-10511', detail: 'Release event queued for 22 minutes before it appeared in the routing view.' },
  { id: 'IEV-002', at: '2026-08-17T05:12', source: 'Routing view', target: 'Load planning', type: 'Route generated', status: 'Completed', detail: 'Route 5 generated from the order set available at 05:12.' },
  { id: 'IEV-003', at: '2026-08-17T05:41', source: 'Order workflow', target: 'Routing view', type: 'Order revision', status: 'Delayed', orderId: 'DEMO-10511', detail: 'Quantity change from 96 to 110 pieces arrived after Route 5 had been generated.' },
  { id: 'IEV-004', at: '2026-08-17T05:44', source: 'Command center', target: 'Exception queue', type: 'Exception raised', status: 'Completed', orderId: 'DEMO-10511', detail: 'Stale load plan detected by comparing route timestamp to order revision timestamp.' },
  { id: 'IEV-005', at: '2026-08-17T05:58', source: 'Order workflow', target: 'Routing view', type: 'Feed recovery', status: 'Retried', detail: 'Queued events cleared. Feed returned to normal without intervention.' },
  { id: 'IEV-006', at: '2026-08-17T06:12', source: 'Order workflow', target: 'Routing view', type: 'Order revision', status: 'Completed', orderId: 'DEMO-10477', detail: 'Six units added to line PN-SUB-34 and delivered to routing within 40 seconds.' },
  { id: 'IEV-007', at: '2026-08-17T06:30', source: 'Routing view', target: 'Carrier portal', type: 'Load tender', status: 'Completed', detail: 'Route 4 tendered to the approved Mass Pike carrier.' },
  { id: 'IEV-008', at: '2026-08-17T06:49', source: 'Carrier portal', target: 'Routing view', type: 'Tender acknowledgment', status: 'Failed', detail: 'No acceptance received within the 15-minute expected response window.' },
  { id: 'IEV-009', at: '2026-08-17T07:02', source: 'Fleet system', target: 'Command center', type: 'Equipment status', status: 'Completed', detail: 'Truck 108 released from scheduled maintenance at 06:40, 40 minutes behind plan.' },
  { id: 'IEV-010', at: '2026-08-17T08:21', source: 'Driver device', target: 'Delivery record', type: 'Proof of delivery', status: 'Completed', orderId: 'DEMO-10482', detail: 'Signed proof of delivery captured at the Northampton yard.' },
  { id: 'IEV-011', at: '2026-08-17T11:05', source: 'Driver device', target: 'Delivery record', type: 'Proof of delivery', status: 'Failed', orderId: 'DEMO-10507', detail: 'Image upload failed on first attempt. Retried successfully at 12:58.' },
  { id: 'IEV-012', at: '2026-08-17T12:58', source: 'Driver device', target: 'Delivery record', type: 'Proof of delivery', status: 'Retried', orderId: 'DEMO-10507', detail: 'Signed copy re-uploaded from the yard.' },
]
