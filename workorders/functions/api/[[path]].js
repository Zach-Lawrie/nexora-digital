// Basa work orders: Cloudflare Pages Function API. Routes under /api/. D1 bound as env.DB.
const SESSION_DAYS = 14;
const COOKIE = 'basa_s';
const ROLES = ['admin', 'manager', 'foreman', 'tech', 'client'];
const STAFF = ['admin', 'manager', 'foreman', 'tech'];
const BOSS = ['admin', 'manager'];
const SUPERVISE = ['admin', 'manager', 'foreman'];
const DISCIPLINES = ['Electrical', 'Mechanical', 'Automation', 'Instrumentation'];
const TYPE_GROUPS = [
  ['General', ['Preventive maintenance', 'Corrective maintenance', 'Breakdown', 'Condition-based maintenance', 'TPM / operator fault', 'Inspection', 'Installation', 'Modification / upgrade', 'Shutdown / overhaul', 'Project work', 'Commissioning', 'Testing & commissioning']],
  ['Electrical testing', ['Electrical testing (IR, earth, RCD)', 'Test & tag (portable appliances)', 'Thermographic survey', 'Motor testing', 'Protection relay testing', 'Switching & isolation (HV/LV)']],
  ['Automation & instrumentation', ['Point-to-point (I/O check)', 'Loop check', 'Calibration', 'PLC / SCADA work']],
  ['Mechanical', ['Vibration analysis', 'Laser alignment', 'Lubrication route', 'Pump / gearbox overhaul', 'Conveyor inspection', 'Pressure / leak test', 'Lifting equipment inspection', 'Welding & fabrication']],
];
const TYPES = TYPE_GROUPS.flatMap((g) => g[1]);
const PRIORITIES = ['Urgent', 'High', 'Normal', 'Low'];
const STATUSES = ['requested', 'open', 'assigned', 'in_progress', 'on_hold', 'completed', 'reviewed', 'approved', 'sent', 'closed', 'cancelled'];
const LABEL = { requested: 'Requested', open: 'Open', assigned: 'Assigned', in_progress: 'In progress', on_hold: 'On hold', completed: 'Completed', reviewed: 'Reviewed', approved: 'Approved', sent: 'Sent to client', closed: 'Closed', cancelled: 'Cancelled' };
const WORKING = ['assigned', 'in_progress', 'on_hold'];
const DEFAULT_SETTINGS = {
  company: 'MEA · Mechanical, Electrical & Automation', short: 'MEA', tagline: 'Engineering services and maintenance',
  address: 'Harare, Zimbabwe', phone: '', email: 'manager@meazim.com', website: 'meazim.com',
  logo: '', color: '#d9822b', currency: 'USD', labour_rate: '35', vat: '15', report_costs: '1',
  report_footer: 'Thank you for choosing MEA. Please contact us about any of the recommendations in this report.',
  sms_provider: 'none', sms_user: '', sms_token: '', sms_from: '', sms_country: '263', reminder_hour: '6', tz: '120',
  separate_approval: '1', approval_limit: '0', shift_hours: '8', work_days: '5',
};

/* ---------- checklist templates ---------- */
const SAFETY = ['Job hazard assessment (JHA) done and signed', 'Permit to work issued', 'Isolation and lock-out / tag-out (LOTO) applied', 'Zero energy verified (test before touch)', 'Correct PPE worn and checked', 'Work area barricaded and signed'];
const HANDOVER = ['Area cleaned, tools and waste removed', 'Isolations removed and equipment returned to service', 'Client or operator told what was done'];
const T = {
  Electrical: {
    insp: ['Visual check of switchboard and enclosures', 'Cable condition, glands and supports', 'Terminations tight (torque check)', 'Insulation resistance test (MΩ)', 'Earth continuity / earth resistance (Ω)', 'RCD trip time test (ms)', 'Thermal scan of connections', 'Labels and circuit schedule up to date'],
    maint: ['Clean and inspect equipment', 'Tighten terminations', 'Check contactors, relays and breakers', 'Measure voltage and current (V / A)', 'Insulation resistance test (MΩ)', 'Functional test after work'],
    inst: ['Materials checked against drawing', 'Cable route and supports installed', 'Cables terminated and labelled', 'Earthing and bonding installed', 'Insulation resistance test (MΩ)', 'Polarity and phase rotation verified', 'Energised and functional test', 'As-built drawing marked up'],
  },
  Mechanical: {
    insp: ['Visual check for leaks, cracks and wear', 'Vibration reading (mm/s)', 'Bearing temperature (°C)', 'Noise check', 'Guards and covers in place', 'Lubrication level and condition', 'Belt / coupling condition', 'Fasteners and foundation bolts'],
    maint: ['Lubricate as per schedule', 'Check and adjust belt tension', 'Shaft alignment check (mm)', 'Replace worn parts', 'Vibration reading after work (mm/s)', 'Run test and leak check'],
    inst: ['Foundation and level checked', 'Equipment set and secured', 'Alignment within tolerance (mm)', 'Piping / ducting connected', 'Guards fitted', 'Lubricated before first run', 'Commissioning run test'],
  },
  Automation: {
    insp: ['PLC status and fault log checked', 'PLC program backed up', 'I/O status check', 'HMI alarms reviewed', 'Network and comms check', 'Instrument loops verified (4–20 mA)', 'Panel cooling and filters', 'UPS / power supply check'],
    maint: ['PLC program backed up before changes', 'Fault found and corrected', 'Loop test (4–20 mA)', 'Interlocks and trips tested', 'Alarms and HMI checked', 'Program change documented'],
    inst: ['Panel installed and earthed', 'Field devices installed and tagged', 'Loop checks completed', 'I/O point-to-point check', 'PLC program downloaded and backed up', 'Interlocks and E-stops tested', 'Operator handover / training'],
  },
};
T.Instrumentation = T.Automation;
const CAL = ['Reference instrument certificate valid', 'As-found reading', 'Adjustment made', 'As-left reading', 'Result within tolerance', 'Calibration sticker fitted'];
const TYPE_CHECKS = {
  'Commissioning': ['Pre-commissioning checks signed off', 'Latest drawings, IO list and procedures on site', 'Mechanical completion confirmed', 'Energised under permit', 'Function tests done (test sheet)', 'Interlocks, trips and E-stops proven', 'Performance / load test done', 'Punch list issued to client', 'Operators trained', 'Handover pack given (as-builts, manuals, test sheets)'],
  'Electrical testing (IR, earth, RCD)': ['Circuits identified and isolated', 'Test instrument in calibration', 'Insulation resistance recorded', 'Earth continuity / electrode resistance recorded', 'RCDs tested', 'Polarity verified', 'Results within limits or defects listed'],
  'Test & tag (portable appliances)': ['Test instrument in calibration', 'Items listed with location', 'Visual check of leads, plugs and casing', 'Electrical tests done', 'Tags fitted with next test date', 'Failed items removed from service and labelled', 'Register given to client'],
  'Thermographic survey': ['Equipment at 40% load or more', 'Camera emissivity and settings correct', 'All panels and connections scanned', 'Hot spots recorded with temperature rise', 'Images saved to the job', 'Priority repairs listed'],
  'Motor testing': ['Motor isolated, terminals accessible', 'Insulation resistance to earth', 'Winding resistance balanced', 'Polarisation index (if required)', 'Running current measured', 'Bearing noise and vibration checked', 'Motor reconnected and rotation checked'],
  'Protection relay testing': ['Approved settings sheet on site', 'CT / VT ratios verified', 'Secondary injection tests done', 'Trip circuit tested to breaker', 'Settings backed up', 'Results within tolerance'],
  'Switching & isolation (HV/LV)': ['Switching program approved', 'Switching operator authorised', 'Arc flash PPE to rating', 'Isolation points locked and tagged', 'Absence of voltage verified', 'Earths applied (HV)', 'Permit issued to work party', 'Restoration done and recorded'],
  'Point-to-point (I/O check)': ['IO list and drawings at latest revision', 'Panel powered and PLC online', 'Each field device wired to the correct terminal', 'Each signal seen at PLC and HMI', 'Tags and labels correct', 'Faults recorded and fixed'],
  'Loop check': ['Loop drawings available', 'Calibrator in date', 'Signal injected at the field device', 'PLC / DCS reading matches', 'Alarms and trips at setpoints', 'Loop sheet signed'],
  'PLC / SCADA work': ['Backup taken before change', 'Change approved (management of change)', 'Change tested offline / simulation', 'Change downloaded', 'Function tested with operations', 'Backup after change and documented'],
  'Vibration analysis': ['Machine at normal running load', 'Measurement points marked', 'Readings taken H / V / A at DE and NDE', 'Compared with limits and history', 'Spectrum saved for high points', 'Recommendations issued'],
  'Laser alignment': ['Machine isolated and locked', 'Soft foot checked and corrected', 'Thermal growth allowance set', 'As-found readings recorded', 'Shims and moves done', 'As-left within tolerance', 'Coupling guard refitted'],
  'Lubrication route': ['Correct lubricant per chart', 'Grease points cleaned before greasing', 'Quantities as per schedule', 'Oil levels topped up', 'Leaks reported', 'Lube chart updated'],
  'Pump / gearbox overhaul': ['Unit isolated, drained and removed', 'Parts cleaned and inspected', 'Wear measured and recorded', 'Bearings and seals replaced', 'Reassembled to spec (torques recorded)', 'Alignment done', 'Run test: noise, temperature, vibration, leaks'],
  'Conveyor inspection': ['Belt condition and splices', 'Belt tracking', 'Idlers and pulleys', 'Scrapers and skirting', 'Pull-wires and E-stops tested', 'Guards in place', 'Drive, gearbox and coupling'],
  'Pressure / leak test': ['Test procedure and limits approved', 'Gauges calibrated', 'System isolated and vented', 'Pressure raised in stages', 'Hold time completed', 'No leaks, drop within limit', 'Pressure released safely'],
  'Lifting equipment inspection': ['Register and SWL markings checked', 'Slings, chains and shackles inspected', 'Hooks and safety latches', 'Hoist brake and limit switches', 'Load test (if due)', 'Tagged with colour code and next date'],
  'Welding & fabrication': ['Hot work permit issued', 'Fire watch and extinguisher in place', 'Welder qualified for the work', 'Material and consumables correct', 'Weld visual inspection', 'NDT done if required', 'Painted / protected'],
  'Modification / upgrade': ['Management of change approved', 'Drawings marked up', 'Materials checked', 'Work done to drawing', 'Tested', 'As-builts and documents updated'],
  'Shutdown / overhaul': ['Shutdown plan and scope agreed', 'Isolations per isolation list', 'Work packs issued', 'Progress tracked against plan', 'Quality checks done', 'Isolations removed and plant handed back'],
};
TYPE_CHECKS['Testing & commissioning'] = TYPE_CHECKS['Commissioning'];

/* ---------- test sheets ---------- */
const isN = (v) => v !== '' && v != null && !isNaN(Number(v));
const N = (v) => Number(v);
const COLOURS = ['Red', 'Green', 'Blue', 'Yellow', 'White', 'Orange'];
const SHEETS = {
  func: { title: 'Function and commissioning tests', limits: 'Each function must perform as expected', cols: [['step', 'Step', 'text'], ['test', 'Function tested', 'text'], ['expected', 'Expected', 'text'], ['actual', 'Actual', 'text'], ['outcome', 'Outcome', 'sel', ['Pass', 'Fail']]], rule: (r) => r.outcome || '' },
  punch: { title: 'Punch list', limits: 'A = before start-up, B = before handover, C = can wait', cols: [['item', 'Item', 'text'], ['cat', 'Category', 'sel', ['A', 'B', 'C']], ['owner', 'Responsible', 'text'], ['status', 'Status', 'sel', ['Open', 'Closed']]], rule: (r) => r.status === 'Closed' ? 'Pass' : r.cat === 'A' ? 'Fail' : 'Open' },
  p2p: { title: 'Point-to-point / I/O check', limits: 'Field device, PLC and HMI must all be OK', cols: [['tag', 'Tag', 'text'], ['desc', 'Description', 'text'], ['io', 'Type', 'sel', ['DI', 'DO', 'AI', 'AO']], ['addr', 'PLC address', 'text'], ['term', 'Terminal', 'text'], ['field', 'Field', 'sel', ['OK', 'Fault']], ['plc', 'PLC', 'sel', ['OK', 'Fault']], ['hmi', 'HMI', 'sel', ['OK', 'Fault', 'N/A']]], rule: (r) => [r.field, r.plc, r.hmi].includes('Fault') ? 'Fail' : r.field && r.plc ? 'Pass' : '' },
  loop: { title: 'Loop check / calibration', limits: 'As-left error within tolerance', cols: [['tag', 'Tag', 'text'], ['desc', 'Description', 'text'], ['range', 'Range', 'text'], ['found', 'As found error %', 'num'], ['left', 'As left error %', 'num'], ['tol', 'Tolerance %', 'num']], rule: (r) => isN(r.left) ? (Math.abs(N(r.left)) <= (isN(r.tol) ? N(r.tol) : 0.5) ? 'Pass' : 'Fail') : '' },
  ir: { title: 'Insulation resistance test', limits: 'Minimum 1 MΩ unless stated (LV)', cols: [['circuit', 'Circuit / cable', 'text'], ['size', 'Size', 'text'], ['volts', 'Test V', 'sel', ['250', '500', '1000', '2500', '5000']], ['l1', 'L1-E MΩ', 'num'], ['l2', 'L2-E MΩ', 'num'], ['l3', 'L3-E MΩ', 'num'], ['ne', 'N-E MΩ', 'num'], ['ll', 'L-L MΩ', 'num'], ['min', 'Min MΩ', 'num']], rule: (r) => { const v = ['l1', 'l2', 'l3', 'ne', 'll'].filter((k) => isN(r[k])).map((k) => N(r[k])); return v.length ? (Math.min(...v) >= (isN(r.min) ? N(r.min) : 1) ? 'Pass' : 'Fail') : ''; } },
  earth: { title: 'Earth and continuity test', limits: 'Result at or below the limit', cols: [['location', 'Location', 'text'], ['kind', 'Test', 'sel', ['Earth electrode', 'Main earth bar', 'Continuity (R1+R2)', 'Equipment bonding']], ['value', 'Result Ω', 'num'], ['limit', 'Limit Ω', 'num']], rule: (r) => isN(r.value) ? (N(r.value) <= (isN(r.limit) ? N(r.limit) : 10) ? 'Pass' : 'Fail') : '' },
  rcd: { title: 'RCD test', limits: 'No trip at ½×, trip ≤ 300 ms at 1×, ≤ 40 ms at 5×', cols: [['circuit', 'Circuit', 'text'], ['rating', 'Rating mA', 'sel', ['10', '30', '100', '300']], ['half', '½× test', 'sel', ['No trip', 'Tripped']], ['x1', '1× ms', 'num'], ['x5', '5× ms', 'num'], ['button', 'Test button', 'sel', ['OK', 'Fail']]], rule: (r) => (r.half === 'Tripped' || (isN(r.x1) && N(r.x1) > 300) || (isN(r.x5) && N(r.x5) > 40) || r.button === 'Fail') ? 'Fail' : (isN(r.x1) ? 'Pass' : '') },
  tt: { title: 'Test and tag register', limits: 'AS/NZS 3760: earth ≤ 1 Ω (Class I), insulation ≥ 1 MΩ, leakage ≤ 5 mA, RCD ≤ 300 ms', due: true, cols: [['tag_no', 'Tag no.', 'text'], ['item', 'Item', 'text'], ['location', 'Location', 'text'], ['class', 'Class', 'sel', ['I', 'II']], ['visual', 'Visual', 'sel', ['Pass', 'Fail']], ['earth', 'Earth Ω', 'num'], ['ir', 'Insul. MΩ', 'num'], ['leak', 'Leakage mA', 'num'], ['rcd', 'RCD ms', 'num'], ['tag', 'Tag colour', 'sel', COLOURS], ['interval', 'Retest', 'sel', ['3 months', '6 months', '12 months', '5 years']]], rule: (r) => (r.visual === 'Fail' || (r.class !== 'II' && isN(r.earth) && N(r.earth) > 1) || (isN(r.ir) && N(r.ir) < 1) || (isN(r.leak) && N(r.leak) > 5) || (isN(r.rcd) && N(r.rcd) > 300)) ? 'Fail' : r.visual ? 'Pass' : '' },
  motor: { title: 'Motor test', limits: 'IR ≥ 1 MΩ, winding imbalance ≤ 5%, current imbalance ≤ 10%, vibration ≤ 7.1 mm/s', cols: [['tag', 'Motor tag', 'text'], ['kw', 'kW', 'num'], ['ir', 'IR MΩ', 'num'], ['uv', 'U-V Ω', 'num'], ['vw', 'V-W Ω', 'num'], ['wu', 'W-U Ω', 'num'], ['i1', 'L1 A', 'num'], ['i2', 'L2 A', 'num'], ['i3', 'L3 A', 'num'], ['vib', 'Vib mm/s', 'num']], rule: (r) => {
    const imb = (a) => { a = a.filter(isN).map(N); if (a.length < 2) return 0; const avg = a.reduce((x, y) => x + y, 0) / a.length; return avg ? (Math.max(...a) - Math.min(...a)) / avg * 100 : 0; };
    if (!isN(r.ir) && !isN(r.uv)) return '';
    return (isN(r.ir) && N(r.ir) < 1) || imb([r.uv, r.vw, r.wu]) > 5 || imb([r.i1, r.i2, r.i3]) > 10 || (isN(r.vib) && N(r.vib) > 7.1) ? 'Fail' : 'Pass'; } },
  thermo: { title: 'Thermographic survey', limits: 'Temperature rise over reference below 10 °C; 10 °C or more needs action', cols: [['location', 'Panel / location', 'text'], ['component', 'Component', 'text'], ['temp', 'Hot spot °C', 'num'], ['ref', 'Reference °C', 'num'], ['load', 'Load %', 'num']], rule: (r) => isN(r.temp) && isN(r.ref) ? (N(r.temp) - N(r.ref) >= 10 ? 'Fail' : 'Pass') : '' },
  relay: { title: 'Protection relay test', limits: 'Trip time within tolerance of expected', cols: [['relay', 'Relay', 'text'], ['func', 'Function', 'text'], ['setting', 'Setting', 'text'], ['injected', 'Injected', 'text'], ['trip', 'Trip ms', 'num'], ['expected', 'Expected ms', 'num'], ['tol', 'Tol %', 'num']], rule: (r) => isN(r.trip) && isN(r.expected) && N(r.expected) ? (Math.abs(N(r.trip) - N(r.expected)) / N(r.expected) * 100 <= (isN(r.tol) ? N(r.tol) : 5) ? 'Pass' : 'Fail') : '' },
  loto: { title: 'Isolation and lock-out register', limits: 'Every isolation verified before work', cols: [['point', 'Isolation point', 'text'], ['device', 'Device', 'text'], ['energy', 'Energy', 'sel', ['Electrical', 'Mechanical', 'Hydraulic', 'Pneumatic', 'Thermal', 'Chemical']], ['lock', 'Lock / tag no.', 'text'], ['by', 'Isolated by', 'text'], ['verified', 'Verified dead', 'sel', ['Yes', 'No']], ['removed', 'Removed by', 'text']], rule: (r) => r.verified === 'Yes' ? 'Pass' : r.verified === 'No' ? 'Fail' : '' },
  vib: { title: 'Vibration readings', limits: 'Overall velocity at or below the limit (default 4.5 mm/s)', cols: [['machine', 'Machine', 'text'], ['point', 'Point', 'sel', ['Motor DE', 'Motor NDE', 'Pump DE', 'Pump NDE', 'Gearbox in', 'Gearbox out', 'Fan DE', 'Fan NDE']], ['h', 'H mm/s', 'num'], ['v', 'V mm/s', 'num'], ['a', 'A mm/s', 'num'], ['limit', 'Limit mm/s', 'num']], rule: (r) => { const v = ['h', 'v', 'a'].filter((k) => isN(r[k])).map((k) => N(r[k])); return v.length ? (Math.max(...v) <= (isN(r.limit) ? N(r.limit) : 4.5) ? 'Pass' : 'Fail') : ''; } },
  align: { title: 'Shaft alignment', limits: 'As-left offset and angularity within tolerance', cols: [['machine', 'Machine', 'text'], ['stage', 'Stage', 'sel', ['As found', 'As left']], ['oh', 'Offset H mm', 'num'], ['ov', 'Offset V mm', 'num'], ['ah', 'Angle H mm/100', 'num'], ['av', 'Angle V mm/100', 'num'], ['tol', 'Tolerance mm', 'num']], rule: (r) => { if (r.stage !== 'As left') return ''; const v = ['oh', 'ov', 'ah', 'av'].filter((k) => isN(r[k])).map((k) => Math.abs(N(r[k]))); return v.length ? (Math.max(...v) <= (isN(r.tol) ? N(r.tol) : 0.05) ? 'Pass' : 'Fail') : ''; } },
  torque: { title: 'Bolt torque record', limits: 'Applied torque within ±5% of spec', cols: [['location', 'Joint / location', 'text'], ['size', 'Bolt size', 'text'], ['qty', 'Qty', 'num'], ['spec', 'Spec Nm', 'num'], ['applied', 'Applied Nm', 'num'], ['marked', 'Marked', 'sel', ['Yes', 'No']]], rule: (r) => isN(r.spec) && isN(r.applied) ? (Math.abs(N(r.applied) - N(r.spec)) <= N(r.spec) * 0.05 ? 'Pass' : 'Fail') : '' },
  pressure: { title: 'Pressure / leak test', limits: 'Pressure drop during hold within allowed %', cols: [['system', 'System / line', 'text'], ['medium', 'Medium', 'sel', ['Water', 'Air', 'Nitrogen', 'Oil']], ['test', 'Test bar', 'num'], ['hold', 'Hold min', 'num'], ['start', 'Start bar', 'num'], ['end', 'End bar', 'num'], ['allowed', 'Allowed drop %', 'num']], rule: (r) => isN(r.start) && isN(r.end) && N(r.start) ? ((N(r.start) - N(r.end)) / N(r.start) * 100 <= (isN(r.allowed) ? N(r.allowed) : 2) ? 'Pass' : 'Fail') : '' },
  lift: { title: 'Lifting equipment register', limits: 'Visual and load test must pass; tagged with next date', due: true, cols: [['tag_no', 'ID no.', 'text'], ['item', 'Item', 'text'], ['location', 'Location', 'text'], ['swl', 'SWL', 'text'], ['visual', 'Visual', 'sel', ['Pass', 'Fail']], ['load', 'Load test', 'sel', ['Passed', 'Not required', 'Failed']], ['tag', 'Tag colour', 'sel', COLOURS], ['interval', 'Retest', 'sel', ['3 months', '6 months', '12 months']]], rule: (r) => r.visual === 'Fail' || r.load === 'Failed' ? 'Fail' : r.visual ? 'Pass' : '' },
};
const BY_DISC = (d, e, m, a) => (disc) => disc === 'Electrical' ? e : disc === 'Mechanical' ? m : a;
const TYPE_SHEETS = {
  'Commissioning': BY_DISC(0, ['func', 'ir', 'rcd', 'punch'], ['func', 'vib', 'align', 'punch'], ['func', 'p2p', 'loop', 'punch']),
  'Testing & commissioning': BY_DISC(0, ['func', 'ir', 'rcd', 'punch'], ['func', 'vib', 'align', 'punch'], ['func', 'p2p', 'loop', 'punch']),
  'Installation': BY_DISC(0, ['ir'], ['torque', 'align'], ['p2p']),
  'Electrical testing (IR, earth, RCD)': () => ['ir', 'earth', 'rcd'], 'Test & tag (portable appliances)': () => ['tt'], 'Thermographic survey': () => ['thermo'],
  'Motor testing': () => ['motor'], 'Protection relay testing': () => ['relay'], 'Switching & isolation (HV/LV)': () => ['loto'], 'Point-to-point (I/O check)': () => ['p2p'],
  'Loop check': () => ['loop'], 'Calibration': () => ['loop'], 'Vibration analysis': () => ['vib'], 'Laser alignment': () => ['align'], 'Pump / gearbox overhaul': () => ['vib', 'torque'],
  'Pressure / leak test': () => ['pressure'], 'Lifting equipment inspection': () => ['lift'], 'Shutdown / overhaul': () => ['loto', 'punch'],
};
const sheetsFor = (discipline, type) => (TYPE_SHEETS[type] ? TYPE_SHEETS[type](discipline) : []);
const monthsOf = (v) => ({ '3 months': 3, '6 months': 6, '12 months': 12, '5 years': 60 }[v] || 12);
function addMonths(d, m) { const x = new Date(d + 'T00:00:00Z'); x.setUTCMonth(x.getUTCMonth() + m); return x.toISOString().slice(0, 10); }
const sheetDefs = () => Object.fromEntries(Object.entries(SHEETS).map(([k, v]) => [k, { title: v.title, limits: v.limits, due: !!v.due, cols: v.cols }]));
function templateFor(discipline, type) {
  const d = T[discipline] || T.Electrical;
  let main, name;
  if (TYPE_CHECKS[type]) return [['Safety before work', SAFETY], [type.replace(/ \(.*\)$/, '') + ' checks', TYPE_CHECKS[type]], ['Handover', HANDOVER]];
  if (type === 'Inspection') { main = d.insp; name = 'Inspection'; }
  else if (type === 'Installation') { main = d.inst; name = 'Installation'; }
  else if (type === 'Calibration') { main = CAL; name = 'Calibration'; }
  else { main = d.maint; name = 'Work'; }
  return [['Safety before work', SAFETY], [name + ' checks', main], ['Handover', HANDOVER]];
}

/* ---------- helpers ---------- */
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const fail = (status, msg) => { throw new HttpError(status, msg); };
const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const str = (v, max = 500) => (v == null ? '' : String(v)).trim().slice(0, max);
const numOr = (v, d = null) => { if (v === '' || v == null) return d; const n = Number(v); return Number.isFinite(n) ? n : d; };
const dateOr = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : null);
const oneOf = (v, list, d) => (list.includes(v) ? v : d);
const isoOr = (v) => { if (!v) return null; const d = new Date(String(v)); return isNaN(d) || d.getUTCFullYear() < 2000 || d.getUTCFullYear() > 2100 ? null : d.toISOString().replace(/\.\d+Z$/, 'Z'); };
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const randHex = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));
async function hashPassword(password, saltHex) {
  const salt = saltHex ? new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16))) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return { hash: hex(bits), salt: hex(salt) };
}
function safeEqual(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
function tempPassword() {
  const w = ['Volt', 'Relay', 'Drive', 'Sensor', 'Panel', 'Motor', 'Cable', 'Pump', 'Valve', 'Gear'];
  return w[crypto.getRandomValues(new Uint8Array(1))[0] % w.length] + '-' + randHex(3).toUpperCase() + '-' + (100 + (crypto.getRandomValues(new Uint16Array(1))[0] % 900));
}
function passwordRule(p) { if (typeof p !== 'string' || p.length < 8) fail(400, 'Use a password of at least 8 characters.'); if (p.length > 128) fail(400, 'That password is too long.'); }
function getCookie(req, name) { const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)')); return m ? m[1] : null; }
const cookie = (token, maxAge, secure) => `${COOKIE}=${token}; Path=/; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${maxAge}`;
const all = async (db, sql, ...b) => (await db.prepare(sql).bind(...b).all()).results || [];
const one = (db, sql, ...b) => db.prepare(sql).bind(...b).first();
const run = (db, sql, ...b) => db.prepare(sql).bind(...b).run();
async function audit(env, user, action, detail) { try { await run(env.DB, 'INSERT INTO audit (user_id, who, action, detail) VALUES (?,?,?,?)', user ? user.id : null, user ? user.email : 'public', action, detail ? String(detail).slice(0, 400) : null); } catch (e) { /* never block */ } }
const publicUser = (u) => u && ({ id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role, trade: u.trade, client_id: u.client_id, must_change: !!u.must_change, notify_push: u.notify_push !== 0, notify_sms: u.notify_sms !== 0 });
async function currentUser(env, req) {
  const t = getCookie(req, COOKIE);
  if (!t || !/^[a-f0-9]{64}$/.test(t)) return null;
  return (await one(env.DB, `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ? AND u.status = 'active'`, t, now())) || null;
}
function need(user, ...roles) {
  if (!user) fail(401, 'Please sign in.');
  if (user.must_change) fail(403, 'Change your temporary password first.');
  if (roles.length && !roles.includes(user.role)) fail(403, 'Your account cannot do that.');
}
async function settings(env) {
  const rows = await all(env.DB, 'SELECT key, value FROM settings');
  const s = { ...DEFAULT_SETTINGS };
  rows.forEach((r) => { s[r.key] = r.value; });
  return s;
}
const SECRET = ['sms_token', 'vapid_private', 'cron_key', 'last_tick'];
async function publicSettings(env, user) {
  const s = await settings(env);
  const out = {};
  for (const k of Object.keys(s)) if (!SECRET.includes(k) && k !== 'vapid_public') out[k] = s[k];
  out.sms_on = !!s.sms_provider && s.sms_provider !== 'none';
  out.tz_label = { 0: 'UTC', 60: 'UTC+1', 120: 'Harare, UTC+2', 180: 'Nairobi, UTC+3', 240: 'Dubai, UTC+4' }[s.tz] || 'UTC' + (s.tz >= 0 ? '+' : '') + s.tz / 60;
  if (user && BOSS.includes(user.role)) out.sms_token_set = !!s.sms_token; else { delete out.sms_user; delete out.sms_from; }
  return out;
}
const upsertSetting = (env, k, v) => env.DB.prepare('INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k, String(v));

/* ---------- web push (VAPID + aes128gcm, RFC 8291/8292) ---------- */
const b64u = {
  enc: (buf) => { const a = new Uint8Array(buf); let s = ''; for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec: (str) => { let x = String(str).replace(/-/g, '+').replace(/_/g, '/'); while (x.length % 4) x += '='; return Uint8Array.from(atob(x), (c) => c.charCodeAt(0)); },
};
const concat = (...arrs) => { const out = new Uint8Array(arrs.reduce((n, a) => n + a.length, 0)); let o = 0; for (const a of arrs) { out.set(a, o); o += a.length; } return out; };
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, len * 8));
}
async function vapidKeys(env) {
  let s = await settings(env);
  if (!s.vapid_public || !s.vapid_private) {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
    const pub = b64u.enc(await crypto.subtle.exportKey('raw', kp.publicKey));
    await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)').bind('vapid_public', pub), env.DB.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)').bind('vapid_private', JSON.stringify(jwk))]);
    s = await settings(env);
  }
  return { pub: s.vapid_public, jwk: JSON.parse(s.vapid_private), email: s.email };
}
async function encryptPush(sub, payload) {
  const enc = new TextEncoder();
  const ua = b64u.dec(sub.p256dh), auth = b64u.dec(sub.auth);
  const eph = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', eph.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', ua, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, eph.privateKey, 256));
  const ikm = await hkdf(auth, secret, concat(enc.encode('WebPush: info\0'), ua, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, concat(enc.encode(payload), new Uint8Array([2]))));
  const head = new Uint8Array(86); head.set(salt, 0); new DataView(head.buffer).setUint32(16, 4096); head[20] = 65; head.set(asPub, 21);
  return concat(head, ct);
}
async function vapidHeader(v, endpoint) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('jwk', v.jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const h = b64u.enc(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const c = b64u.enc(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'mailto:' + (v.email || 'admin@example.com') })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(h + '.' + c));
  return `vapid t=${h}.${c}.${b64u.enc(sig)}, k=${v.pub}`;
}
async function sendPush(env, ids, msg) {
  if (!ids.length) return 0;
  const subs = await all(env.DB, `SELECT s.* FROM push_subs s JOIN users u ON u.id=s.user_id WHERE u.status='active' AND COALESCE(u.notify_push,1)=1 AND s.user_id IN (${ids.map(() => '?').join(',')})`, ...ids);
  if (!subs.length) return 0;
  const v = await vapidKeys(env);
  const body = JSON.stringify(msg).slice(0, 3000);
  let sent = 0;
  await Promise.allSettled(subs.map(async (sub) => {
    const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(sub.endpoint, { method: 'POST', signal: ctl.signal, headers: { 'content-encoding': 'aes128gcm', 'content-type': 'application/octet-stream', ttl: '86400', urgency: msg.urgent ? 'high' : 'normal', authorization: await vapidHeader(v, sub.endpoint) }, body: await encryptPush(sub, body) });
      if (r.status === 404 || r.status === 410) await run(env.DB, 'DELETE FROM push_subs WHERE id=?', sub.id);
      else if (r.ok) sent++;
    } catch (e) { /* push service unreachable: the in-app alert still exists */ } finally { clearTimeout(tm); }
  }));
  return sent;
}

/* ---------- SMS ---------- */
function e164(phone, cc) {
  let d = String(phone || '').replace(/[^\d+]/g, '');
  if (!d) return '';
  if (d.startsWith('+')) return d;
  if (d.startsWith('00')) return '+' + d.slice(2);
  if (d.startsWith('0')) return '+' + (cc || '263') + d.slice(1);
  return '+' + d;
}
async function sendSms(env, ids, text, force) {
  const s = await settings(env);
  if (!s.sms_provider || s.sms_provider === 'none' || !ids.length) return { sent: 0, reason: 'SMS is not set up.' };
  const rows = await all(env.DB, `SELECT id, phone FROM users WHERE status='active' AND ${force ? '1=1' : 'COALESCE(notify_sms,1)=1'} AND COALESCE(phone,'')<>'' AND id IN (${ids.map(() => '?').join(',')})`, ...ids);
  const to = [...new Set(rows.map((r) => e164(r.phone, s.sms_country)).filter((x) => x.length > 8))];
  if (!to.length) return { sent: 0, reason: 'Nobody has a mobile number saved.' };
  const msg = `${s.short || 'Work orders'}: ${text}`.slice(0, 450);
  try {
    if (s.sms_provider === 'twilio') {
      let n = 0;
      for (const t of to) { const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(s.sms_user)}/Messages.json`, { method: 'POST', headers: { authorization: 'Basic ' + btoa(s.sms_user + ':' + s.sms_token), 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ To: t, From: s.sms_from, Body: msg }) }); if (r.ok) n++; else return { sent: n, reason: 'Twilio: ' + (await r.text()).slice(0, 160) }; }
      return { sent: n };
    }
    if (s.sms_provider === 'africastalking') {
      const p = new URLSearchParams({ username: s.sms_user, to: to.join(','), message: msg }); if (s.sms_from) p.set('from', s.sms_from);
      const r = await fetch('https://api.africastalking.com/version1/messaging', { method: 'POST', headers: { apiKey: s.sms_token, accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' }, body: p });
      return r.ok ? { sent: to.length } : { sent: 0, reason: "Africa's Talking: " + (await r.text()).slice(0, 160) };
    }
    if (s.sms_provider === 'webhook') {
      const r = await fetch(s.sms_user, { method: 'POST', headers: { 'content-type': 'application/json', ...(s.sms_token ? { authorization: 'Bearer ' + s.sms_token } : {}) }, body: JSON.stringify({ to, message: msg }) });
      return r.ok ? { sent: to.length } : { sent: 0, reason: 'Webhook answered ' + r.status };
    }
  } catch (e) { return { sent: 0, reason: 'Could not reach the SMS service.' }; }
  return { sent: 0, reason: 'Unknown SMS provider.' };
}

/* ---------- notify: in-app + push (+ SMS when asked) ---------- */
async function notify(env, userIds, woId, text, opt = {}) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return;
  await env.DB.batch(ids.map((id) => env.DB.prepare('INSERT INTO notifications (user_id, wo_id, text, kind) VALUES (?,?,?,?)').bind(id, woId, text.slice(0, 300), opt.kind || 'job')));
  const s = await settings(env);
  const job = woId ? text.match(/^(WO-[\w-]+):\s*/) : null;
  await sendPush(env, ids, { title: opt.title || (job ? `${s.short || ''} ${job[1]}`.trim() : (s.short || 'Work orders')), body: job ? text.slice(job[0].length) : text, url: opt.url || (woId ? '/#/job/' + woId : '/#/'), tag: opt.tag || (woId ? 'wo' + woId : undefined), urgent: !!opt.urgent });
  if (opt.sms) await sendSms(env, ids, text);
}
const roleIds = async (env, ...roles) => (await all(env.DB, `SELECT id FROM users WHERE status='active' AND role IN (${roles.map(() => '?').join(',')})`, ...roles)).map((r) => r.id);
const clientIds = async (env, clientId) => clientId ? (await all(env.DB, `SELECT id FROM users WHERE status='active' AND role='client' AND client_id=?`, clientId)).map((r) => r.id) : [];
// audience: { to: everyone|staff|tech|foreman|manager|trade|clients|client|me, trade, client_id }
async function audienceIds(env, aud, me) {
  const to = aud && aud.to;
  const q = async (where, ...b) => (await all(env.DB, `SELECT id FROM users WHERE status='active' AND ${where}`, ...b)).map((r) => r.id);
  if (to === 'everyone') return q('1=1');
  if (to === 'staff') return q(`role IN ('admin','manager','foreman','tech')`);
  if (to === 'tech') return q(`role='tech'`);
  if (to === 'foreman') return q(`role='foreman'`);
  if (to === 'manager') return q(`role IN ('admin','manager')`);
  if (to === 'trade') return q(`role IN ('tech','foreman') AND trade=?`, String(aud.trade || ''));
  if (to === 'clients') return q(`role='client'`);
  if (to === 'client') return q(`role='client' AND client_id=?`, Number(aud.client_id) || -1);
  return [me.id];
}
const AUD_TO = ['everyone', 'staff', 'tech', 'foreman', 'manager', 'trade', 'clients', 'client', 'me'];
function audienceLabel(aud, names) {
  const m = { everyone: 'Everyone', staff: 'All staff', tech: 'All technicians', foreman: 'Foremen', manager: 'Managers', clients: 'All clients', me: 'Just me' };
  if (aud.to === 'trade') return (aud.trade || '') + ' team';
  if (aud.to === 'client') return (names && names[aud.client_id]) || 'One client';
  return m[aud.to] || 'Just me';
}
function cleanAudience(body, user) {
  const to = oneOf(body.to, AUD_TO, 'me');
  if (!SUPERVISE.includes(user.role) && to !== 'me') fail(403, 'You can only set reminders for yourself.');
  return { to, trade: to === 'trade' ? oneOf(body.trade, DISCIPLINES, 'Electrical') : undefined, client_id: to === 'client' ? numOr(body.client_id) : undefined };
}
/* ---------- local time helpers (settings.tz = minutes offset, Harare = 120) ---------- */
const localNow = (s) => new Date(Date.now() + (Number(s.tz) || 0) * 60000);
const localDate = (s) => localNow(s).toISOString().slice(0, 10);
const localToUtc = (s, d, t) => new Date(new Date(`${d}T${t || '07:00'}:00Z`).getTime() - (Number(s.tz) || 0) * 60000).toISOString().replace(/\.\d+Z$/, 'Z');
function nextRepeat(iso, rep) {
  const d = new Date(iso);
  if (rep === 'daily') d.setUTCDate(d.getUTCDate() + 1);
  else if (rep === 'weekdays') { do { d.setUTCDate(d.getUTCDate() + 1); } while ([0, 6].includes(d.getUTCDay())); }
  else if (rep === 'weekly') d.setUTCDate(d.getUTCDate() + 7);
  else if (rep === 'monthly') d.setUTCMonth(d.getUTCMonth() + 1);
  else return null;
  return d.toISOString().replace(/\.\d+Z$/, 'Z');
}
/* ---------- scheduler tick: reminders, automatic daily alerts, planned maintenance ---------- */
async function tick(env, force) {
  const s = await settings(env);
  if (!force && s.last_tick && Date.now() - new Date(s.last_tick).getTime() < 9 * 60000) return { skipped: true };
  await upsertSetting(env, 'last_tick', now()).run();
  const out = { reminders: 0, daily: false, pm: [] };
  // 1. scheduled reminders
  const due = await all(env.DB, 'SELECT * FROM reminders WHERE active=1 AND next_at <= ? ORDER BY next_at LIMIT 50', now());
  for (const r of due) {
    const nx = nextRepeat(r.next_at, r.repeat);
    let next = nx; while (next && next <= now()) next = nextRepeat(next, r.repeat);
    const claim = await run(env.DB, 'UPDATE reminders SET last_sent=?, next_at=COALESCE(?, next_at), active=? WHERE id=? AND next_at=? AND active=1', now(), next, next ? 1 : 0, r.id, r.next_at);
    if (!claim.meta || !claim.meta.changes) continue; // another run already sent it
    const ids = await audienceIds(env, JSON.parse(r.audience || '{}'), { id: r.created_by });
    await notify(env, ids, null, `Reminder: ${r.title}${r.body ? ' · ' + r.body : ''}`, { kind: 'reminder', title: '⏰ ' + r.title, url: '/#/notices/reminders', sms: !!r.sms, urgent: true, tag: 'rem' + r.id });
    out.reminders++;
  }
  // 2. automatic daily reminders, once a day after the reminder hour (local time)
  const ld = localDate(s), hour = localNow(s).getUTCHours();
  if (hour >= (Number(s.reminder_hour) || 6) && ((await run(env.DB, 'INSERT OR IGNORE INTO auto_sent (k) VALUES (?)', 'daily:' + ld)).meta || {}).changes) {
    out.daily = true;
    const team = async (w) => [w.lead_id, ...(await all(env.DB, 'SELECT user_id FROM wo_team WHERE wo_id=?', w.id)).map((t) => t.user_id)];
    const sup = async (w) => w.foreman_id ? [w.foreman_id] : await roleIds(env, 'foreman');
    const tomorrow = addDays(ld, 1);
    for (const w of await all(env.DB, `SELECT w.*, s.name AS site FROM work_orders w LEFT JOIN sites s ON s.id=w.site_id WHERE w.scheduled_date=? AND w.status IN ('assigned','on_hold','in_progress')`, ld))
      await notify(env, await team(w), w.id, `${w.number}: on your schedule today: ${w.title}${w.site ? ' at ' + w.site : ''}`, { kind: 'auto' });
    for (const w of await all(env.DB, `SELECT * FROM work_orders WHERE due_date=? AND status IN ('open','assigned','in_progress','on_hold')`, tomorrow))
      await notify(env, [...await team(w), ...await sup(w)], w.id, `${w.number}: due tomorrow: ${w.title}`, { kind: 'auto' });
    for (const w of await all(env.DB, `SELECT * FROM work_orders WHERE due_date < ? AND status IN ('open','assigned','in_progress','on_hold')`, ld))
      await notify(env, [...await team(w), ...await sup(w)], w.id, `${w.number}: overdue since ${w.due_date}: ${w.title}`, { kind: 'auto', urgent: true });
    for (const w of await all(env.DB, `SELECT * FROM work_orders WHERE status='completed' AND completed_at < ?`, new Date(Date.now() - 864e5).toISOString()))
      await notify(env, await sup(w), w.id, `${w.number}: waiting for your review since ${w.completed_at.slice(0, 10)}`, { kind: 'auto' });
    for (const w of await all(env.DB, `SELECT * FROM work_orders WHERE status='reviewed' AND reviewed_at < ?`, new Date(Date.now() - 864e5).toISOString()))
      await notify(env, await roleIds(env, 'manager', 'admin'), w.id, `${w.number}: waiting for your approval`, { kind: 'auto' });
    for (const w of await all(env.DB, `SELECT * FROM work_orders WHERE status='sent' AND released_at < ?`, new Date(Date.now() - 3 * 864e5).toISOString()))
      await notify(env, await clientIds(env, w.client_id), w.id, `${w.number}: your job report is waiting for your sign-off`, { kind: 'auto' });
    if (localNow(s).getUTCDay() === 1) {
      const tags = await all(env.DB, `SELECT w.client_id, COUNT(*) n FROM test_rows t JOIN work_orders w ON w.id=t.wo_id WHERE t.sheet IN ('tt','lift') AND t.next_due IS NOT NULL AND t.next_due <= ? AND w.status<>'cancelled' GROUP BY w.client_id`, addDays(ld, 30));
      for (const g of tags) {
        const c = await one(env.DB, 'SELECT name FROM clients WHERE id=?', g.client_id);
        await notify(env, await roleIds(env, 'manager', 'admin'), null, `${g.n} tagged item${g.n > 1 ? 's' : ''} at ${c ? c.name : 'a client'} due for retest within 30 days`, { kind: 'auto', url: '/#/register' });
        await notify(env, await clientIds(env, g.client_id), null, `${g.n} of your tagged item${g.n > 1 ? 's are' : ' is'} due for retest within 30 days`, { kind: 'auto', url: '/#/register' });
      }
    }
  }
  // 3. planned maintenance jobs
  out.pm = await generatePM(env, { id: null, name: 'System' });
  return out;
}
async function log(env, wo, user, kind, text) {
  await run(env.DB, 'INSERT INTO activity (wo_id, user_id, who, kind, text) VALUES (?,?,?,?,?)', wo.id, user ? user.id : null, user ? user.name : 'System', kind, String(text).slice(0, 1000));
  await run(env.DB, 'UPDATE work_orders SET updated_at=? WHERE id=?', now(), wo.id);
}

/* ---------- access ---------- */
async function onTeam(env, wo, user) {
  if (wo.lead_id === user.id) return true;
  return !!(await one(env.DB, 'SELECT id FROM wo_team WHERE wo_id=? AND user_id=?', wo.id, user.id));
}
async function loadWO(env, id, user) {
  const wo = await one(env.DB, 'SELECT * FROM work_orders WHERE id=?', Number(id) || 0);
  if (!wo) fail(404, 'Work order not found.');
  if (user.role === 'client' && wo.client_id !== user.client_id) fail(404, 'Work order not found.');
  if (user.role === 'tech' && !(await onTeam(env, wo, user))) fail(404, 'Work order not found.');
  return wo;
}
// Who may change the job record (checklist, time, materials, photos, notes)
async function canWork(env, wo, user) {
  if (BOSS.includes(user.role)) return !['sent', 'closed', 'cancelled'].includes(wo.status);
  if (user.role === 'foreman') return !['approved', 'sent', 'closed', 'cancelled'].includes(wo.status);
  if (user.role === 'tech') return WORKING.includes(wo.status) && (await onTeam(env, wo, user));
  return false;
}
async function needWork(env, wo, user) { if (!(await canWork(env, wo, user))) fail(403, wo.status === 'completed' ? 'This job has been submitted. Ask your foreman to send it back if something must change.' : 'You cannot change this job now.'); }

const WO_LIST_SQL = `SELECT w.id, w.number, w.title, w.status, w.priority, w.discipline, w.type, w.due_date, w.scheduled_date, w.created_at, w.updated_at, w.completed_at, w.client_id, w.lead_id, w.foreman_id, w.pm_id,
  c.name AS client, s.name AS site, a.tag AS asset_tag, a.name AS asset, l.name AS lead, f.name AS foreman,
  (SELECT COUNT(*) FROM wo_team t WHERE t.wo_id=w.id) AS team_count,
  (SELECT COALESCE(SUM(hours),0) FROM time_logs t WHERE t.wo_id=w.id) AS hours,
  (SELECT COUNT(*) FROM checklist k WHERE k.wo_id=w.id) AS ck_total,
  (SELECT COUNT(*) FROM checklist k WHERE k.wo_id=w.id AND k.result<>'') AS ck_done
  FROM work_orders w LEFT JOIN clients c ON c.id=w.client_id LEFT JOIN sites s ON s.id=w.site_id LEFT JOIN assets a ON a.id=w.asset_id
  LEFT JOIN users l ON l.id=w.lead_id LEFT JOIN users f ON f.id=w.foreman_id`;
function scopeSql(user) {
  if (user.role === 'client') return [' WHERE w.client_id = ?', [user.client_id || -1]];
  if (user.role === 'tech') return [' WHERE (w.lead_id = ? OR EXISTS (SELECT 1 FROM wo_team t WHERE t.wo_id=w.id AND t.user_id=?))', [user.id, user.id]];
  return [' WHERE 1=1', []];
}
async function nextNumber(env) {
  const ym = new Date().toISOString().slice(2, 7).replace('-', '');
  const r = await one(env.DB, `SELECT number FROM work_orders WHERE number LIKE ? ORDER BY number DESC LIMIT 1`, `WO-${ym}-%`);
  const n = r ? parseInt(r.number.split('-')[2], 10) + 1 : 1;
  return `WO-${ym}-${String(n).padStart(3, '0')}`;
}
async function createWO(env, user, d) {
  let number = await nextNumber(env), r;
  for (let i = 0; i < 4; i++) {
    try {
      r = await run(env.DB, `INSERT INTO work_orders (number, client_id, site_id, asset_id, discipline, type, priority, title, description, status, requested_by, foreman_id, lead_id, due_date, scheduled_date, est_hours, quote, client_ref, pm_id, project_id, downtime_start)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, number, d.client_id, d.site_id, d.asset_id, d.discipline, d.type, d.priority, d.title, d.description, d.status, user ? user.id : null, d.foreman_id, d.lead_id, d.due_date, d.scheduled_date, d.est_hours, d.quote, d.client_ref || null, d.pm_id || null, d.project_id || null, d.downtime_start || (d.type === 'Breakdown' ? now() : null));
      break;
    } catch (e) { if (!/UNIQUE/i.test(String(e.message))) throw e; number = number.replace(/\d+$/, (x) => String(+x + 1).padStart(3, '0')); }
  }
  const id = r.meta.last_row_id;
  await run(env.DB, 'UPDATE work_orders SET sheets=? WHERE id=?', sheetsFor(d.discipline, d.type).join(','), id);
  const stmts = []; let sort = 0;
  for (const [section, items] of templateFor(d.discipline, d.type)) for (const item of items) stmts.push(env.DB.prepare('INSERT INTO checklist (wo_id, section, item, sort) VALUES (?,?,?,?)').bind(id, section, item, sort++));
  await env.DB.batch(stmts);
  return one(env.DB, 'SELECT * FROM work_orders WHERE id=?', id);
}
async function cleanRefs(env, d) {
  if (d.asset_id) { const a = await one(env.DB, 'SELECT a.*, s.client_id FROM assets a JOIN sites s ON s.id=a.site_id WHERE a.id=?', d.asset_id); if (!a) d.asset_id = null; else { d.site_id = a.site_id; d.client_id = a.client_id; } }
  if (d.site_id && !d.asset_id) { const s = await one(env.DB, 'SELECT * FROM sites WHERE id=?', d.site_id); if (!s) d.site_id = null; else d.client_id = s.client_id; }
  if (d.client_id && !(await one(env.DB, 'SELECT id FROM clients WHERE id=?', d.client_id))) d.client_id = null;
  for (const k of ['lead_id', 'foreman_id']) if (d[k]) { const u = await one(env.DB, `SELECT role FROM users WHERE id=? AND status='active'`, d[k]); if (!u || (k === 'lead_id' && !['tech', 'foreman'].includes(u.role)) || (k === 'foreman_id' && !['foreman', 'manager', 'admin'].includes(u.role))) d[k] = null; }
  return d;
}
async function generatePM(env, user) {
  const plans = await all(env.DB, `SELECT p.*, a.site_id, s.client_id, a.tag, a.name AS asset, a.run_hours FROM pm_plans p JOIN assets a ON a.id=p.asset_id JOIN sites s ON s.id=a.site_id
    WHERE p.active=1 AND (p.next_due <= ? OR (p.every_hours > 0 AND a.run_hours >= COALESCE(p.last_hours,0) + p.every_hours * 0.95)) AND NOT EXISTS (SELECT 1 FROM work_orders w WHERE w.pm_id=p.id AND w.status NOT IN ('closed','cancelled','sent','approved'))`, addDays(today(), 7));
  const made = [];
  for (const p of plans) {
    const byHours = p.every_hours > 0 && p.run_hours >= (p.last_hours || 0) + p.every_hours * 0.95 && p.next_due > addDays(today(), 7);
    const due = byHours ? addDays(today(), 3) : p.next_due;
    const every = [p.every_days < 3650 ? `every ${p.every_days} days` : '', p.every_hours ? `every ${p.every_hours} running hours` : ''].filter(Boolean).join(' or ');
    const wo = await createWO(env, user, { client_id: p.client_id, site_id: p.site_id, asset_id: p.asset_id, discipline: p.discipline, type: p.type, priority: 'Normal', title: `${p.title} · ${p.tag}`, description: `Planned maintenance from schedule (${every}).${byHours ? ` Hour meter is at ${p.run_hours} h.` : ''}`, status: 'open', foreman_id: p.foreman_id, lead_id: null, due_date: due, scheduled_date: null, est_hours: p.est_hours, quote: null, pm_id: p.id });
    await run(env.DB, 'UPDATE pm_plans SET next_due=?, last_hours=COALESCE(?, last_hours) WHERE id=?', byHours ? addDays(today(), p.every_days) : addDays(p.next_due, p.every_days), p.run_hours, p.id);
    await log(env, wo, null, 'created', byHours ? `Created automatically: running hours reached ${p.run_hours} h.` : 'Created automatically from the maintenance schedule.');
    try { const n = await reservePmParts(env, wo); if (n) await log(env, wo, null, 'material', `${n} spare part line${n > 1 ? 's' : ''} reserved in stores for this job.`); } catch (e) { console.error('reserve', e); }
    await notify(env, p.foreman_id ? [p.foreman_id] : await roleIds(env, 'foreman'), wo.id, `${wo.number}: planned job due ${p.next_due} needs a technician`);
    made.push(wo.number);
  }
  return made;
}

/* ---------- routes ---------- */
const routes = [];
const on = (method, pattern, handler) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler });

/* auth */
on('POST', '/auth/login', async ({ env, body, secure }) => {
  const email = str(body.email, 200).toLowerCase(), password = String(body.password || '');
  const u = await one(env.DB, 'SELECT * FROM users WHERE email = ?', email);
  if (u && u.locked_until && u.locked_until > now()) fail(429, 'Too many wrong attempts. Try again in 15 minutes.');
  const ok = u && u.status === 'active' && safeEqual((await hashPassword(password, u.pass_salt)).hash, u.pass_hash);
  if (!ok) {
    if (u) { const f = u.failed + 1; await run(env.DB, 'UPDATE users SET failed=?, locked_until=? WHERE id=?', f >= 8 ? 0 : f, f >= 8 ? new Date(Date.now() + 15 * 60e3).toISOString() : null, u.id); }
    fail(401, u && u.status !== 'active' ? 'This account is switched off. Contact your manager.' : 'Email or password is wrong.');
  }
  const token = randHex(32);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now()),
    env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)').bind(token, u.id, new Date(Date.now() + SESSION_DAYS * 864e5).toISOString()),
    env.DB.prepare('UPDATE users SET failed=0, locked_until=NULL, last_login=? WHERE id=?').bind(now(), u.id),
  ]);
  await audit(env, u, 'login', null);
  return json({ user: publicUser(u) }, 200, { 'set-cookie': cookie(token, SESSION_DAYS * 86400, secure) });
});
on('POST', '/auth/logout', async ({ env, req, secure }) => {
  const t = getCookie(req, COOKIE);
  if (t) await run(env.DB, 'DELETE FROM sessions WHERE token=?', t);
  return json({ ok: true }, 200, { 'set-cookie': cookie('x', 0, secure) });
});
on('GET', '/me', async ({ env, user }) => {
  const st = await publicSettings(env, user);
  if (user && user.role === 'client' && user.client_id) { const c = await one(env.DB, 'SELECT name, logo, color, white_label FROM clients WHERE id=?', user.client_id); if (c && c.white_label) st.client_brand = { name: c.name, logo: c.logo, color: c.color }; }
  return json({ user: publicUser(user), settings: st });
});
on('POST', '/me/password', async ({ env, user, body }) => {
  if (!user) fail(401, 'Please sign in.');
  if (!safeEqual((await hashPassword(String(body.current || ''), user.pass_salt)).hash, user.pass_hash)) fail(400, 'Your current password is wrong.');
  passwordRule(body.password);
  if (body.password === body.current) fail(400, 'Choose a new password that is different from the old one.');
  const { hash, salt } = await hashPassword(body.password);
  await run(env.DB, 'UPDATE users SET pass_hash=?, pass_salt=?, must_change=0 WHERE id=?', hash, salt, user.id);
  await audit(env, user, 'changed password', null);
  return json({ ok: true });
});
on('POST', '/me/profile', async ({ env, user, body }) => {
  need(user);
  await run(env.DB, 'UPDATE users SET name=?, phone=? WHERE id=?', str(body.name, 100) || user.name, str(body.phone, 40), user.id);
  return json({ ok: true });
});

/* lookups for forms */
on('GET', '/lookups', async ({ env, user }) => {
  need(user);
  const out = { disciplines: DISCIPLINES, types: TYPES, type_groups: TYPE_GROUPS, sheets: sheetDefs(), priorities: PRIORITIES, statuses: STATUSES, labels: LABEL, fail: FAIL, unplanned: UNPLANNED, clock_kinds: CLOCK_KINDS, cm_kinds: CM_KINDS };
  if (user.role === 'client') {
    out.clients = await all(env.DB, 'SELECT id, name FROM clients WHERE id=?', user.client_id || -1);
    out.sites = await all(env.DB, 'SELECT id, client_id, name, address FROM sites WHERE client_id=? ORDER BY name', user.client_id || -1);
    out.assets = await all(env.DB, 'SELECT a.id, a.site_id, a.tag, a.name, a.discipline FROM assets a JOIN sites s ON s.id=a.site_id WHERE s.client_id=? ORDER BY a.tag', user.client_id || -1);
    out.staff = [];
  } else {
    out.clients = await all(env.DB, 'SELECT id, name FROM clients ORDER BY name');
    out.sites = await all(env.DB, 'SELECT id, client_id, name, address FROM sites ORDER BY name');
    out.assets = await all(env.DB, 'SELECT id, site_id, tag, name, discipline FROM assets ORDER BY tag');
    out.staff = await all(env.DB, `SELECT u.id, u.name, u.role, u.trade, u.phone,
      (SELECT COUNT(*) FROM work_orders w WHERE (w.lead_id=u.id OR EXISTS (SELECT 1 FROM wo_team t WHERE t.wo_id=w.id AND t.user_id=u.id)) AND w.status IN ('assigned','in_progress','on_hold')) AS active_jobs
      FROM users u WHERE u.status='active' AND u.role IN ('tech','foreman','manager','admin') ORDER BY u.role DESC, u.name`);
    out.stores = await all(env.DB, 'SELECT id, name, site_id FROM stores WHERE active=1 ORDER BY name');
    out.parts = await all(env.DB, `SELECT p.id, p.part_no, p.name, p.unit, p.cost, p.category FROM parts p WHERE p.active=1 ORDER BY p.part_no`);
    out.stock = await all(env.DB, `SELECT st.part_id, st.store_id, st.qty, st.qty - (SELECT COALESCE(SUM(qty),0) FROM reservations r WHERE r.part_id=st.part_id AND r.store_id=st.store_id AND r.status='reserved') AS free FROM stock st WHERE st.qty > 0`);
    out.projects = await all(env.DB, `SELECT id, number, name, client_id FROM projects WHERE status IN ('planning','active','on_hold') ORDER BY id DESC`);
    out.my_clock = await one(env.DB, 'SELECT c.*, w.number FROM clock c JOIN work_orders w ON w.id=c.wo_id WHERE c.user_id=? AND c.end_at IS NULL', user.id);
  }
  return json(out);
});

/* dashboard */
on('GET', '/dashboard', async ({ env, user }) => {
  need(user);
  let made = [];
  if (SUPERVISE.includes(user.role)) made = await generatePM(env, user);
  const [w, b] = scopeSql(user);
  const rows = await all(env.DB, WO_LIST_SQL + w + ' ORDER BY w.updated_at DESC, w.id DESC', ...b);
  const t = today();
  const month = t.slice(0, 8) + '01';
  const hoursSql = user.role === 'tech' ? ['SELECT COALESCE(SUM(hours),0) h FROM time_logs WHERE user_id=? AND date>=?', user.id, month] : ['SELECT COALESCE(SUM(hours),0) h FROM time_logs WHERE date>=?', month];
  const hours = (await one(env.DB, ...hoursSql)).h;
  const out = { pm_created: made, wo: rows, hours_month: hours, today: t };
  if (SUPERVISE.includes(user.role)) {
    out.workload = await all(env.DB, `SELECT u.id, u.name, u.trade,
      (SELECT COUNT(*) FROM work_orders w WHERE (w.lead_id=u.id OR EXISTS (SELECT 1 FROM wo_team t WHERE t.wo_id=w.id AND t.user_id=u.id)) AND w.status IN ('assigned','in_progress','on_hold')) AS jobs,
      (SELECT COALESCE(SUM(hours),0) FROM time_logs l WHERE l.user_id=u.id AND l.date>=?) AS hours
      FROM users u WHERE u.status='active' AND u.role='tech' ORDER BY jobs DESC, u.name`, month);
    out.tags_due = (await one(env.DB, `SELECT COUNT(*) n FROM test_rows t JOIN work_orders w ON w.id=t.wo_id WHERE t.sheet IN ('tt','lift') AND t.next_due IS NOT NULL AND t.next_due <= ? AND w.status <> 'cancelled'`, addDays(today(), 30))).n;
    out.pm_due = await all(env.DB, `SELECT p.id, p.title, p.next_due, p.every_days, a.tag, a.name AS asset FROM pm_plans p JOIN assets a ON a.id=p.asset_id WHERE p.active=1 ORDER BY p.next_due LIMIT 8`);
    const s = await settings(env);
    out.cm_alarms = (await one(env.DB, `SELECT COUNT(*) n FROM cm_points WHERE active=1 AND last_status='alarm'`)).n;
    out.low_parts = (await one(env.DB, 'SELECT COUNT(*) n FROM parts p WHERE p.active=1 AND p.min_qty IS NOT NULL AND (SELECT COALESCE(SUM(qty),0) FROM stock s WHERE s.part_id=p.id) <= p.min_qty')).n;
    out.open_prs = (await one(env.DB, `SELECT COUNT(*) n FROM purchase_requests WHERE status IN ('requested','ordered')`)).n;
    out.clocked_on = await all(env.DB, `SELECT c.kind, c.start_at, u.name, w.id AS wo_id, w.number FROM clock c JOIN users u ON u.id=c.user_id JOIN work_orders w ON w.id=c.wo_id WHERE c.end_at IS NULL ORDER BY c.start_at`);
    out.value_month = (await one(env.DB, `SELECT COALESCE(SUM(l.hours),0)*? + COALESCE((SELECT SUM(m.qty*m.unit_cost) FROM materials m WHERE m.created_at>=?),0) v FROM time_logs l WHERE l.date>=?`, Number(s.labour_rate) || 0, month, month)).v;
  }
  return json(out);
});

/* notifications */
on('GET', '/notifications', async ({ env, user }) => { need(user); try { await tick(env, false); } catch (e) { console.error('tick', e); } return json({ items: await all(env.DB, 'SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 30', user.id), unread: (await one(env.DB, 'SELECT COUNT(*) n FROM notifications WHERE user_id=? AND read=0', user.id)).n, notices: (await one(env.DB, 'SELECT COUNT(*) n FROM ann_reads r JOIN announcements a ON a.id=r.ann_id WHERE r.user_id=? AND r.read_at IS NULL AND (a.expires IS NULL OR a.expires >= ?)', user.id, today())).n }); });
on('POST', '/notifications/read', async ({ env, user }) => { need(user); await run(env.DB, 'UPDATE notifications SET read=1 WHERE user_id=?', user.id); return json({ ok: true }); });

/* work orders */
on('GET', '/wo', async ({ env, user, url }) => {
  need(user);
  let [w, b] = scopeSql(user);
  const st = url.searchParams.get('status'), q = str(url.searchParams.get('q'), 80), disc = url.searchParams.get('discipline');
  if (st === 'active') w += ` AND w.status NOT IN ('closed','cancelled')`;
  else if (STATUSES.includes(st)) { w += ' AND w.status=?'; b.push(st); }
  if (DISCIPLINES.includes(disc)) { w += ' AND w.discipline=?'; b.push(disc); }
  if (url.searchParams.get('asset')) { w += ' AND w.asset_id=?'; b.push(Number(url.searchParams.get('asset')) || 0); }
  if (q) { w += ' AND (w.number LIKE ? OR w.title LIKE ? OR c.name LIKE ? OR a.tag LIKE ? OR s.name LIKE ?)'; const l = '%' + q + '%'; b.push(l, l, l, l, l); }
  return json({ items: await all(env.DB, WO_LIST_SQL + w + ' ORDER BY w.id DESC LIMIT 500', ...b) });
});
on('POST', '/wo', async ({ env, user, body }) => {
  need(user, 'admin', 'manager', 'foreman', 'client');
  const isClient = user.role === 'client';
  const d = {
    client_id: isClient ? user.client_id : numOr(body.client_id), site_id: numOr(body.site_id), asset_id: numOr(body.asset_id),
    discipline: oneOf(body.discipline, DISCIPLINES, null), type: oneOf(body.type, TYPES, null), priority: oneOf(body.priority, PRIORITIES, 'Normal'),
    title: str(body.title, 160), description: str(body.description, 4000), due_date: dateOr(body.due_date), scheduled_date: isClient ? null : dateOr(body.scheduled_date),
    est_hours: isClient ? null : numOr(body.est_hours), quote: isClient ? null : numOr(body.quote), client_ref: str(body.client_ref, 80),
    foreman_id: isClient ? null : numOr(body.foreman_id), lead_id: isClient ? null : numOr(body.lead_id),
    project_id: isClient ? null : numOr(body.project_id), downtime_start: isoOr(body.downtime_start),
  };
  if (d.project_id && !(await one(env.DB, 'SELECT id FROM projects WHERE id=?', d.project_id))) d.project_id = null;
  if (!d.title) fail(400, 'Give the job a short title.');
  if (!d.discipline) fail(400, 'Choose the discipline: electrical, mechanical, automation or instrumentation.');
  if (!d.type) fail(400, 'Choose the type of work.');
  await cleanRefs(env, d);
  if (isClient) { if (d.client_id !== user.client_id) { d.client_id = user.client_id; d.site_id = null; d.asset_id = null; } }
  if (!d.client_id) fail(400, 'Choose the client.');
  if (user.role === 'foreman' && !d.foreman_id) d.foreman_id = user.id;
  d.status = isClient ? 'requested' : d.lead_id ? 'assigned' : 'open';
  const wo = await createWO(env, user, d);
  await log(env, wo, user, 'created', isClient ? 'Job requested by the client.' : 'Work order created.');
  if (isClient) await notify(env, await roleIds(env, 'manager', 'admin', 'foreman'), wo.id, `${wo.number}: new ${d.priority === 'Urgent' ? 'URGENT ' : ''}request from ${user.name}: ${d.title}`, { urgent: d.priority === 'Urgent', sms: d.priority === 'Urgent' });
  if (d.lead_id) { await log(env, wo, user, 'assigned', 'Assigned to ' + (await one(env.DB, 'SELECT name FROM users WHERE id=?', d.lead_id)).name); await notify(env, [d.lead_id], wo.id, `${wo.number}: you are the lead technician on "${d.title}"`, { urgent: d.priority === 'Urgent', sms: d.priority === 'Urgent' }); }
  if (d.foreman_id && d.foreman_id !== user.id) await notify(env, [d.foreman_id], wo.id, `${wo.number}: new job for your team: ${d.title}`);
  await audit(env, user, 'created work order', wo.number);
  return json({ wo }, 201);
});
async function fullWO(env, wo, user, pub) {
  const det = await one(env.DB, `SELECT w.*, c.name AS client, c.contact AS client_contact, c.email AS client_email, c.phone AS client_phone, c.address AS client_address,
    s.name AS site, s.address AS site_address, a.tag AS asset_tag, a.name AS asset, a.make AS asset_make, a.model AS asset_model, a.serial AS asset_serial, a.rating AS asset_rating,
    l.name AS lead, l.phone AS lead_phone, l.trade AS lead_trade, f.name AS foreman, r.name AS requester, r.role AS requester_role, ap.name AS approver, rv.name AS reviewer, c.logo AS client_logo, c.color AS client_color, c.white_label AS client_white_label
    FROM work_orders w LEFT JOIN clients c ON c.id=w.client_id LEFT JOIN sites s ON s.id=w.site_id LEFT JOIN assets a ON a.id=w.asset_id
    LEFT JOIN users l ON l.id=w.lead_id LEFT JOIN users f ON f.id=w.foreman_id LEFT JOIN users r ON r.id=w.requested_by LEFT JOIN users ap ON ap.id=w.approved_by LEFT JOIN users rv ON rv.id=w.reviewed_by WHERE w.id=?`, wo.id);
  const out = {
    wo: det,
    team: await all(env.DB, 'SELECT t.*, u.trade, u.phone FROM wo_team t LEFT JOIN users u ON u.id=t.user_id WHERE t.wo_id=? ORDER BY t.id', wo.id),
    checklist: await all(env.DB, 'SELECT * FROM checklist WHERE wo_id=? ORDER BY sort, id', wo.id),
    time: await all(env.DB, 'SELECT * FROM time_logs WHERE wo_id=? ORDER BY date, id', wo.id),
    materials: await all(env.DB, 'SELECT * FROM materials WHERE wo_id=? ORDER BY id', wo.id),
    photos: await all(env.DB, 'SELECT id, caption, stage, user_id, created_at FROM photos WHERE wo_id=? ORDER BY id', wo.id),
    sheets: String(det.sheets || '').split(',').filter((k) => SHEETS[k]),
    tests: (await all(env.DB, 'SELECT * FROM test_rows WHERE wo_id=? ORDER BY sheet, sort, id', wo.id)).map((t) => ({ ...t, data: JSON.parse(t.data || '{}') })),
    sheet_defs: sheetDefs(),
  };
  if (!pub) {
    out.activity = await all(env.DB, 'SELECT * FROM activity WHERE wo_id=? ORDER BY id DESC', wo.id);
    if (user.role === 'client') { out.activity = out.activity.filter((a) => ['created', 'comment', 'status', 'sent', 'signoff'].includes(a.kind)); if (!['sent', 'closed'].includes(wo.status)) { out.time = []; out.materials = []; } }
    if (user.role !== 'client') {
      const ck = await clockSummary(env, wo.id);
      const booked = out.time.reduce((a, t) => a + t.hours, 0);
      out.clock = { ...ck, mine: (ck.rows.find((r) => r.user_id === user.id && !r.end_at) || null), kinds: CLOCK_KINDS };
      out.labour = bookedVsActual(det.est_hours, booked, ck.rows.some((r) => r.kind === 'work') ? (ck.by.work || 0) : null);
      out.spares = det.asset_id ? await all(env.DB, `SELECT ap.part_id, ap.qty, ap.on_pm, p.part_no, p.name, p.unit, p.cost, (SELECT COALESCE(SUM(qty),0) FROM stock s WHERE s.part_id=p.id) AS in_stock FROM asset_parts ap JOIN parts p ON p.id=ap.part_id WHERE ap.asset_id=? ORDER BY p.part_no`, det.asset_id) : [];
      out.reservations = await all(env.DB, `SELECT r.*, p.part_no, p.name, p.unit, s.name AS store FROM reservations r JOIN parts p ON p.id=r.part_id JOIN stores s ON s.id=r.store_id WHERE r.wo_id=? AND r.status='reserved'`, wo.id);
      out.fail_lists = FAIL; out.unplanned = UNPLANNED.includes(det.type);
      const st = await settings(env);
      out.approval = { separate: st.separate_approval === '1', limit: Number(st.approval_limit) || 0, cost: await jobCost(env, wo), reviewed_by: det.reviewed_by, reviewer: det.reviewer };
    }
    if (det.project_id) out.project = await one(env.DB, 'SELECT id, number, name FROM projects WHERE id=?', det.project_id);
    out.can = {
      work: await canWork(env, wo, user),
      lead: wo.lead_id === user.id || SUPERVISE.includes(user.role),
      supervise: SUPERVISE.includes(user.role),
      boss: BOSS.includes(user.role),
      approve: BOSS.includes(user.role) || (user.role === 'foreman' && out.approval && out.approval.limit > 0 && out.approval.cost <= out.approval.limit),
    };
  } else { delete det.tech_sign; }
  return out;
}
on('GET', '/wo/:id', async ({ env, user, params }) => { need(user); const wo = await loadWO(env, params.id, user); const out = await fullWO(env, wo, user); if (!BOSS.includes(user.role)) delete out.wo.report_token; return json(out); });
on('POST', '/wo/:id/update', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  const changes = [];
  if (SUPERVISE.includes(user.role) && !['sent', 'closed', 'cancelled'].includes(wo.status)) {
    const d = { client_id: numOr(body.client_id, wo.client_id), site_id: numOr(body.site_id, wo.site_id), asset_id: 'asset_id' in body ? numOr(body.asset_id) : wo.asset_id };
    await cleanRefs(env, d);
    const f = {
      title: str(body.title ?? wo.title, 160) || wo.title, description: str(body.description ?? wo.description, 4000), priority: oneOf(body.priority, PRIORITIES, wo.priority),
      discipline: oneOf(body.discipline, DISCIPLINES, wo.discipline), type: oneOf(body.type, TYPES, wo.type), due_date: 'due_date' in body ? dateOr(body.due_date) : wo.due_date,
      scheduled_date: 'scheduled_date' in body ? dateOr(body.scheduled_date) : wo.scheduled_date, est_hours: 'est_hours' in body ? numOr(body.est_hours) : wo.est_hours,
      quote: 'quote' in body ? numOr(body.quote) : wo.quote, client_ref: 'client_ref' in body ? str(body.client_ref, 80) : wo.client_ref,
      client_id: d.client_id, site_id: d.site_id, asset_id: d.asset_id,
    };
    for (const k of Object.keys(f)) if (f[k] !== wo[k] && !(f[k] == null && wo[k] == null)) changes.push(k.replace('_id', '').replace('_', ' '));
    await run(env.DB, `UPDATE work_orders SET title=?, description=?, priority=?, discipline=?, type=?, due_date=?, scheduled_date=?, est_hours=?, quote=?, client_ref=?, client_id=?, site_id=?, asset_id=? WHERE id=?`,
      f.title, f.description, f.priority, f.discipline, f.type, f.due_date, f.scheduled_date, f.est_hours, f.quote, f.client_ref, f.client_id, f.site_id, f.asset_id, wo.id);
    if ('project_id' in body) { const pid = numOr(body.project_id); const ok = !pid || await one(env.DB, 'SELECT id FROM projects WHERE id=?', pid); if (ok && (pid || null) !== (wo.project_id || null)) { await run(env.DB, 'UPDATE work_orders SET project_id=? WHERE id=?', pid || null, wo.id); changes.push('project'); } }
  }
  if (['fail_component', 'fail_mode', 'fail_cause', 'fail_action', 'downtime_start', 'downtime_end'].some((k) => k in body)) {
    if (!SUPERVISE.includes(user.role)) await needWork(env, wo, user);
    const g = {};
    for (const k of ['component', 'mode', 'cause', 'action']) g['fail_' + k] = 'fail_' + k in body ? (oneOf(body['fail_' + k], FAIL[k], null) || (str(body['fail_' + k], 80) || null)) : wo['fail_' + k];
    g.downtime_start = 'downtime_start' in body ? isoOr(body.downtime_start) : wo.downtime_start;
    g.downtime_end = 'downtime_end' in body ? isoOr(body.downtime_end) : wo.downtime_end;
    if (g.downtime_start && g.downtime_end && g.downtime_end < g.downtime_start) fail(400, 'The machine cannot be back in service before it stopped.');
    for (const k of Object.keys(g)) if ((g[k] || '') !== (wo[k] || '')) changes.push(k.startsWith('fail') ? 'failure details' : 'downtime');
    await run(env.DB, 'UPDATE work_orders SET fail_component=?, fail_mode=?, fail_cause=?, fail_action=?, downtime_start=?, downtime_end=? WHERE id=?', g.fail_component, g.fail_mode, g.fail_cause, g.fail_action, g.downtime_start, g.downtime_end, wo.id);
  }
  if (['findings', 'work_done', 'recommendations'].some((k) => k in body)) {
    await needWork(env, wo, user);
    const g = { findings: 'findings' in body ? str(body.findings, 6000) : wo.findings, work_done: 'work_done' in body ? str(body.work_done, 6000) : wo.work_done, recommendations: 'recommendations' in body ? str(body.recommendations, 4000) : wo.recommendations };
    for (const k of Object.keys(g)) if ((g[k] || '') !== (wo[k] || '')) changes.push(k.replace('_', ' '));
    await run(env.DB, 'UPDATE work_orders SET findings=?, work_done=?, recommendations=? WHERE id=?', g.findings, g.work_done, g.recommendations, wo.id);
  }
  if (changes.length) await log(env, wo, user, 'edit', 'Updated ' + [...new Set(changes)].join(', ') + '.');
  return json({ ok: true });
});
on('POST', '/wo/:id/assign', async ({ env, user, params, body }) => {
  need(user, ...SUPERVISE);
  const wo = await loadWO(env, params.id, user);
  if (['completed', 'reviewed', 'approved', 'sent', 'closed', 'cancelled'].includes(wo.status)) fail(400, 'This job is past the assigning stage.');
  const d = await cleanRefs(env, { lead_id: numOr(body.lead_id), foreman_id: numOr(body.foreman_id, wo.foreman_id || (user.role === 'foreman' ? user.id : null)) });
  if (!d.lead_id) fail(400, 'Choose the lead technician.');
  const sched = dateOr(body.scheduled_date) || wo.scheduled_date;
  const status = ['requested', 'open'].includes(wo.status) ? 'assigned' : wo.status;
  await run(env.DB, 'UPDATE work_orders SET lead_id=?, foreman_id=?, scheduled_date=?, status=? WHERE id=?', d.lead_id, d.foreman_id, sched, status, wo.id);
  const lead = await one(env.DB, 'SELECT name FROM users WHERE id=?', d.lead_id);
  await run(env.DB, 'DELETE FROM wo_team WHERE wo_id=? AND user_id=?', wo.id, d.lead_id);
  await log(env, wo, user, 'assigned', `Lead technician: ${lead.name}${sched ? ', scheduled for ' + sched : ''}.${str(body.note, 500) ? ' Note: ' + str(body.note, 500) : ''}`);
  if (d.lead_id !== wo.lead_id) await notify(env, [d.lead_id], wo.id, `${wo.number}: you are the lead technician on "${wo.title}"${sched ? ' (' + sched + ')' : ''}`, { urgent: wo.priority === 'Urgent', sms: wo.priority === 'Urgent' });
  if (wo.status === 'requested') await notify(env, await clientIds(env, wo.client_id), wo.id, `${wo.number}: your request was accepted and a technician has been assigned`);
  return json({ ok: true });
});
on('POST', '/wo/:id/team', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  if (!(wo.lead_id === user.id || SUPERVISE.includes(user.role))) fail(403, 'Only the lead technician or the foreman can change the team.');
  if (['approved', 'sent', 'closed', 'cancelled'].includes(wo.status)) fail(400, 'This job is closed for changes.');
  if (body.remove) {
    const t = await one(env.DB, 'SELECT * FROM wo_team WHERE id=? AND wo_id=?', Number(body.remove) || 0, wo.id);
    if (t) { await run(env.DB, 'DELETE FROM wo_team WHERE id=?', t.id); await log(env, wo, user, 'team', `Removed ${t.name} from the team.`); }
    return json({ ok: true });
  }
  const uid = numOr(body.user_id), role = str(body.role_text, 60) || 'Technician';
  let name = str(body.name, 100);
  if (uid) {
    const u = await one(env.DB, `SELECT * FROM users WHERE id=? AND status='active' AND role IN ('tech','foreman')`, uid);
    if (!u) fail(400, 'That person was not found.');
    if (u.id === wo.lead_id || await one(env.DB, 'SELECT id FROM wo_team WHERE wo_id=? AND user_id=?', wo.id, u.id)) fail(400, `${u.name} is already on this job.`);
    name = u.name;
  } else if (!name) fail(400, 'Choose a team member or type a helper\'s name.');
  await run(env.DB, 'INSERT INTO wo_team (wo_id, user_id, name, role_text, added_by) VALUES (?,?,?,?,?)', wo.id, uid, name, role, user.id);
  await log(env, wo, user, 'team', `Added ${name} (${role}) to the team.`);
  if (uid) await notify(env, [uid], wo.id, `${wo.number}: ${user.name} added you to the team for "${wo.title}"`);
  return json({ ok: true });
});
// status machine
const RULES = {
  open: { from: ['requested'], who: SUPERVISE },
  in_progress: { from: ['assigned', 'on_hold', 'completed', 'reviewed'], who: [...SUPERVISE, 'tech'] },
  on_hold: { from: ['in_progress', 'assigned'], who: [...SUPERVISE, 'tech'], note: true },
  completed: { from: ['in_progress'], who: [...SUPERVISE, 'tech'] },
  reviewed: { from: ['completed'], who: SUPERVISE },
  approved: { from: ['completed', 'reviewed'], who: SUPERVISE },
  closed: { from: ['approved', 'sent'], who: BOSS },
  cancelled: { from: ['requested', 'open', 'assigned', 'on_hold', 'in_progress'], who: [...SUPERVISE, 'client'], note: true },
};
on('POST', '/wo/:id/status', async ({ env, user, params, body }) => {
  need(user);
  const wo = await loadWO(env, params.id, user);
  const to = body.to, rule = RULES[to], note = str(body.note, 1000);
  if (!rule) fail(400, 'Unknown status.');
  if (!rule.who.includes(user.role)) fail(403, 'Your account cannot do that.');
  if (!rule.from.includes(wo.status)) fail(400, `A job that is "${LABEL[wo.status]}" cannot move to "${LABEL[to]}".`);
  if (rule.note && !note) fail(400, 'Please add a short reason.');
  if (user.role === 'tech' && to === 'completed' && wo.lead_id !== user.id) fail(403, 'Only the lead technician can submit the job.');
  if (user.role === 'tech' && !(await onTeam(env, wo, user))) fail(403, 'You are not on this job.');
  if (user.role === 'tech' && ['completed', 'reviewed'].includes(wo.status)) fail(403, 'Only the foreman can send a job back.');
  if (user.role === 'client' && wo.status !== 'requested') fail(400, 'This job is already being worked on. Contact the manager to cancel it.');
  const set = { status: to };
  if (to === 'approved') {
    const s = await settings(env);
    if (s.separate_approval === '1') {
      if (wo.status !== 'reviewed') fail(400, 'This job must be reviewed before it is approved (review and approval are done by different people).');
      let rb = wo.reviewed_by;
      if (!rb) { const a = await one(env.DB, `SELECT user_id FROM activity WHERE wo_id=? AND kind='status' AND text LIKE 'Status changed to Reviewed%' ORDER BY id DESC LIMIT 1`, wo.id); rb = a && a.user_id; }
      if (rb === user.id) fail(403, 'You reviewed this job, so someone else must approve it. (A manager can switch this off in Settings.)');
    }
    if (!BOSS.includes(user.role)) {
      const lim = Number(s.approval_limit) || 0;
      if (!(lim > 0)) fail(403, 'Only a manager can approve jobs.');
      const cost = await jobCost(env, wo);
      if (cost > lim) fail(403, `This job costs ${s.currency} ${cost.toFixed(2)}, above your approval limit of ${s.currency} ${lim.toFixed(2)}. A manager must approve it.`);
    }
  }
  if (to === 'in_progress' && ['assigned', 'on_hold'].includes(wo.status)) {
    const open = await one(env.DB, `SELECT COUNT(*) n FROM checklist WHERE wo_id=? AND section LIKE 'Safety%' AND result NOT IN ('Pass','N/A')`, wo.id);
    if (open.n) fail(400, `Complete the safety checks before starting (${open.n} still open). Every item must be Pass or N/A.`);
    if (!wo.started_at) set.started_at = now();
  }
  if (to === 'in_progress' && ['completed', 'reviewed'].includes(wo.status) && !note) fail(400, 'Tell the technician what needs to be fixed.');
  if (to === 'completed') {
    const blank = await one(env.DB, `SELECT COUNT(*) n FROM checklist WHERE wo_id=? AND result=''`, wo.id);
    if (blank.n) fail(400, `Answer every checklist item first (${blank.n} left). Use N/A where it does not apply.`);
    const fails = await one(env.DB, `SELECT COUNT(*) n FROM checklist WHERE wo_id=? AND result='Fail' AND COALESCE(note,'')=''`, wo.id);
    if (fails.n) fail(400, 'Add a note to every failed checklist item explaining what was found.');
    if (!str(wo.work_done)) fail(400, 'Write what work was done before submitting.');
    if (!(await one(env.DB, 'SELECT id FROM time_logs WHERE wo_id=?', wo.id))) fail(400, 'Log the hours worked before submitting.');
    const shs = String(wo.sheets || '').split(',').filter((x) => SHEETS[x]);
    const cs = {}; for (const k of shs) cs[k] = await one(env.DB, `SELECT COUNT(*) n, SUM(CASE WHEN result='Fail' AND COALESCE(remarks,'')='' THEN 1 ELSE 0 END) f FROM test_rows WHERE wo_id=? AND sheet=?`, wo.id, k);
    for (const k of shs) if (!cs[k].n) fail(400, `Add results to the "${SHEETS[k].title}" sheet, or remove the sheet if it does not apply.`);
    for (const k of shs) if (cs[k].f) fail(400, `Add a remark to every failed line on the "${SHEETS[k].title}" sheet.`);
    if (UNPLANNED.includes(wo.type)) {
      const miss = ['component', 'mode', 'cause', 'action'].filter((k) => !(body['fail_' + k] || wo['fail_' + k]));
      if (miss.length) fail(400, `Record the failure details first (${miss.join(', ')}). They are on the Details tab under "Failure and downtime".`);
      for (const k of ['component', 'mode', 'cause', 'action']) if (body['fail_' + k]) set['fail_' + k] = str(body['fail_' + k], 80);
      if (wo.type === 'Breakdown') { set.downtime_start = wo.downtime_start || isoOr(body.downtime_start) || wo.started_at || wo.created_at; set.downtime_end = wo.downtime_end || isoOr(body.downtime_end) || now(); }
    }
    const sign = String(body.sign || '');
    if (!/^data:image\/png;base64,[A-Za-z0-9+/=]{200,}$/.test(sign) || sign.length > 300000) fail(400, 'Sign the job card to submit it.');
    set.tech_sign = sign; set.tech_sign_name = str(body.sign_name, 100) || user.name; set.completed_at = now();
  }
  if (to === 'reviewed') { set.reviewed_at = now(); set.reviewed_by = user.id; }
  if (to === 'approved') { set.approved_at = now(); set.approved_by = user.id; }
  const keys = Object.keys(set);
  await run(env.DB, `UPDATE work_orders SET ${keys.map((k) => k + '=?').join(', ')} WHERE id=?`, ...keys.map((k) => set[k]), wo.id);
  const back = to === 'in_progress' && ['completed', 'reviewed'].includes(wo.status);
  // clock on / off follows the job status
  if (to === 'in_progress' && !back && STAFF.includes(user.role) && (wo.lead_id === user.id || await onTeam(env, wo, user))) await startClock(env, wo, user.id, 'work');
  if (to === 'on_hold') { await closeClocks(env, wo.id); const wk = oneOf(body.wait, ['wait_parts', 'wait_permit'], null); if (wk && STAFF.includes(user.role)) await startClock(env, wo, user.id, wk); }
  if (['completed', 'cancelled'].includes(to)) await closeClocks(env, wo.id);
  await log(env, wo, user, 'status', (back ? 'Sent back for rework' : `Status changed to ${LABEL[to]}`) + (note ? `: ${note}` : '.'));
  const lead = wo.lead_id ? [wo.lead_id] : [];
  const sup = wo.foreman_id ? [wo.foreman_id] : await roleIds(env, 'foreman');
  if (to === 'completed') await notify(env, sup, wo.id, `${wo.number}: "${wo.title}" was completed by ${user.name}. Please review.`);
  if (to === 'reviewed') await notify(env, await roleIds(env, 'manager', 'admin'), wo.id, `${wo.number}: reviewed by ${user.name}, ready for your approval`);
  if (to === 'on_hold') await notify(env, sup.filter((x) => x !== user.id), wo.id, `${wo.number}: on hold: ${note}`);
  if (back) await notify(env, lead, wo.id, `${wo.number}: sent back for rework: ${note}`);
  if (to === 'open') await notify(env, await clientIds(env, wo.client_id), wo.id, `${wo.number}: your request was accepted`);
  if (to === 'cancelled') await notify(env, [...lead, ...(user.role === 'client' ? await roleIds(env, 'manager') : await clientIds(env, wo.client_id))], wo.id, `${wo.number}: cancelled: ${note}`);
  await audit(env, user, 'status ' + to, wo.number);
  return json({ ok: true });
});
on('POST', '/wo/:id/release', async ({ env, user, params }) => {
  need(user, ...BOSS);
  const wo = await loadWO(env, params.id, user);
  if (!['approved', 'sent'].includes(wo.status)) fail(400, 'Approve the job before sending the report.');
  const token = wo.report_token || randHex(20);
  await run(env.DB, `UPDATE work_orders SET status='sent', report_token=?, released_at=COALESCE(released_at, ?) WHERE id=?`, token, now(), wo.id);
  if (wo.status !== 'sent') {
    await log(env, wo, user, 'sent', 'Report sent to the client.');
    await notify(env, await clientIds(env, wo.client_id), wo.id, `${wo.number}: your job report for "${wo.title}" is ready`);
  }
  return json({ token });
});
on('POST', '/wo/:id/signoff', async ({ env, user, params, body }) => {
  need(user, 'client');
  const wo = await loadWO(env, params.id, user);
  if (wo.status !== 'sent') fail(400, 'This report is not ready for sign-off.');
  const sign = String(body.sign || '');
  if (!/^data:image\/png;base64,[A-Za-z0-9+/=]{200,}$/.test(sign) || sign.length > 300000) fail(400, 'Please sign in the box.');
  const name = str(body.name, 100) || user.name, comment = str(body.comment, 1000);
  await run(env.DB, `UPDATE work_orders SET status='closed', client_sign=?, client_sign_name=?, signed_at=? WHERE id=?`, sign, name, now(), wo.id);
  await log(env, wo, user, 'signoff', `Signed off by ${name}.${comment ? ' Comment: ' + comment : ''}`);
  await notify(env, [...await roleIds(env, 'manager', 'admin'), wo.foreman_id], wo.id, `${wo.number}: ${name} signed off the job${comment ? ': ' + comment : ''}`);
  return json({ ok: true });
});
on('POST', '/wo/:id/comment', async ({ env, user, params, body }) => {
  need(user);
  const wo = await loadWO(env, params.id, user);
  const text = str(body.text, 1000);
  if (!text) fail(400, 'Type a message.');
  await log(env, wo, user, 'comment', text);
  const others = user.role === 'client' ? [wo.lead_id, wo.foreman_id, ...(await roleIds(env, 'manager'))] : [wo.lead_id, wo.foreman_id, ...(await all(env.DB, 'SELECT user_id FROM wo_team WHERE wo_id=?', wo.id)).map((r) => r.user_id)];
  if (user.role !== 'client' && body.to_client) others.push(...await clientIds(env, wo.client_id));
  await notify(env, others.filter((x) => x && x !== user.id), wo.id, `${wo.number}: ${user.name}: ${text}`);
  return json({ ok: true });
});
on('POST', '/wo/:id/checklist', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  if (body.add) {
    const item = str(body.add.item, 200), section = str(body.add.section, 80) || 'Extra checks';
    if (!item) fail(400, 'Type the check to add.');
    const mx = await one(env.DB, 'SELECT COALESCE(MAX(sort),0) m FROM checklist WHERE wo_id=? AND section NOT LIKE ?', wo.id, 'Handover%');
    await run(env.DB, 'INSERT INTO checklist (wo_id, section, item, sort) VALUES (?,?,?,?)', wo.id, section, item, mx.m + 0.5);
    await log(env, wo, user, 'checklist', `Added check: ${item}`);
    return json({ ok: true });
  }
  const items = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
  const stmts = items.map((i) => env.DB.prepare('UPDATE checklist SET result=?, reading=?, note=?, done_by=? WHERE id=? AND wo_id=?').bind(oneOf(i.result, ['', 'Pass', 'Fail', 'N/A'], ''), str(i.reading, 80), str(i.note, 500), user.id, Number(i.id) || 0, wo.id));
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true });
});
on('POST', '/wo/:id/time', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  if (body.remove) {
    const t = await one(env.DB, 'SELECT * FROM time_logs WHERE id=? AND wo_id=?', Number(body.remove) || 0, wo.id);
    if (t && (t.added_by === user.id || SUPERVISE.includes(user.role) || wo.lead_id === user.id)) await run(env.DB, 'DELETE FROM time_logs WHERE id=?', t.id);
    return json({ ok: true });
  }
  const hours = numOr(body.hours);
  if (!(hours > 0 && hours <= 24)) fail(400, 'Enter hours between 0.25 and 24.');
  const date = dateOr(body.date) || today();
  let uid = numOr(body.user_id), worker;
  if (body.team_id) { const t = await one(env.DB, 'SELECT * FROM wo_team WHERE id=? AND wo_id=?', Number(body.team_id), wo.id); if (!t) fail(400, 'Team member not found.'); uid = t.user_id; worker = t.name; }
  if (!worker) {
    if (uid && uid !== user.id) {
      if (!(wo.lead_id === user.id || SUPERVISE.includes(user.role))) fail(403, 'You can only log your own hours.');
      const u = await one(env.DB, 'SELECT name FROM users WHERE id=?', uid); if (!u) fail(400, 'Person not found.'); worker = u.name;
    } else { uid = user.id; worker = user.name; }
  } else if (uid !== user.id && !(wo.lead_id === user.id || SUPERVISE.includes(user.role))) fail(403, 'You can only log your own hours.');
  await run(env.DB, 'INSERT INTO time_logs (wo_id, user_id, worker, date, hours, note, added_by) VALUES (?,?,?,?,?,?,?)', wo.id, uid, worker, date, hours, str(body.note, 300), user.id);
  await log(env, wo, user, 'time', `${hours} h logged for ${worker} on ${date}.`);
  return json({ ok: true });
});
on('POST', '/wo/:id/material', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  if (body.remove) {
    const m = await one(env.DB, 'SELECT * FROM materials WHERE id=? AND wo_id=?', Number(body.remove) || 0, wo.id);
    if (m && m.part_id && m.store_id) { await moveStock(env, user, { part_id: m.part_id, store_id: m.store_id, qty: m.qty, kind: 'return', wo_id: wo.id, unit_cost: m.unit_cost, ref: wo.number, note: 'Line removed from job' }); await log(env, wo, user, 'material', `Returned ${m.qty} ${m.unit} ${m.item} to stores.`); }
    await run(env.DB, 'DELETE FROM materials WHERE id=? AND wo_id=?', Number(body.remove) || 0, wo.id); return json({ ok: true });
  }
  const item = str(body.item, 200), qty = numOr(body.qty);
  if (!item) fail(400, 'Type the material or part.');
  if (!(qty > 0)) fail(400, 'Enter the quantity used.');
  await run(env.DB, 'INSERT INTO materials (wo_id, item, qty, unit, unit_cost, added_by) VALUES (?,?,?,?,?,?)', wo.id, item, qty, str(body.unit, 20) || 'each', Math.max(0, numOr(body.unit_cost, 0)), user.id);
  await log(env, wo, user, 'material', `Used ${qty} ${str(body.unit, 20) || 'each'} ${item}.`);
  return json({ ok: true });
});
on('POST', '/wo/:id/photo', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  if (body.remove) { const p = await one(env.DB, 'SELECT * FROM photos WHERE id=? AND wo_id=?', Number(body.remove) || 0, wo.id); if (p && (p.user_id === user.id || SUPERVISE.includes(user.role))) await run(env.DB, 'DELETE FROM photos WHERE id=?', p.id); return json({ ok: true }); }
  const data = String(body.data || '');
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(data)) fail(400, 'That photo could not be read. Try another one.');
  if (data.length > 900000) fail(400, 'That photo is too big. Try again; the app shrinks photos before upload.');
  const cnt = await one(env.DB, 'SELECT COUNT(*) n FROM photos WHERE wo_id=?', wo.id);
  if (cnt.n >= 30) fail(400, 'This job already has 30 photos.');
  await run(env.DB, 'INSERT INTO photos (wo_id, user_id, caption, stage, data) VALUES (?,?,?,?,?)', wo.id, user.id, str(body.caption, 200), oneOf(body.stage, ['Before', 'During', 'After', 'Defect'], 'During'), data);
  await log(env, wo, user, 'photo', `Added a photo${str(body.caption, 200) ? ': ' + str(body.caption, 200) : ''}.`);
  return json({ ok: true });
});
function photoResponse(p) {
  const m = p.data.match(/^data:(image\/\w+);base64,(.*)$/);
  const bin = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
  return new Response(bin, { headers: { 'content-type': m[1], 'cache-control': 'private, max-age=86400' } });
}
on('GET', '/photo/:id', async ({ env, user, params, url }) => {
  const p = await one(env.DB, 'SELECT * FROM photos WHERE id=?', Number(params.id) || 0);
  if (!p) fail(404, 'Photo not found.');
  const t = url.searchParams.get('t');
  if (t) { const wo = await one(env.DB, `SELECT id FROM work_orders WHERE id=? AND report_token=? AND status IN ('sent','closed')`, p.wo_id, t); if (!wo) fail(404, 'Photo not found.'); return photoResponse(p); }
  need(user); await loadWO(env, p.wo_id, user);
  return photoResponse(p);
});
on('POST', '/wo/:id/sheets', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  const list = String(wo.sheets || '').split(',').filter((k) => SHEETS[k]);
  if (body.add) { if (!SHEETS[body.add]) fail(400, 'Unknown test sheet.'); if (!list.includes(body.add)) list.push(body.add); await log(env, wo, user, 'test', `Added the ${SHEETS[body.add].title} sheet.`); }
  if (body.remove) {
    const n = await one(env.DB, 'SELECT COUNT(*) n FROM test_rows WHERE wo_id=? AND sheet=?', wo.id, body.remove);
    if (n.n) fail(400, 'Delete the lines on this sheet first.');
    const i = list.indexOf(body.remove); if (i >= 0) list.splice(i, 1);
  }
  await run(env.DB, 'UPDATE work_orders SET sheets=? WHERE id=?', list.join(','), wo.id);
  return json({ sheets: list });
});
on('POST', '/wo/:id/test', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  if (body.remove) { await run(env.DB, 'DELETE FROM test_rows WHERE id=? AND wo_id=?', Number(body.remove) || 0, wo.id); return json({ ok: true }); }
  const sh = SHEETS[body.sheet];
  if (!sh) fail(400, 'Unknown test sheet.');
  const data = {};
  for (const [k, , t, opts] of sh.cols) {
    let v = body.data ? body.data[k] : '';
    v = v == null ? '' : String(v).trim().slice(0, 120);
    if (t === 'num' && v !== '' && !isN(v)) fail(400, `"${sh.cols.find((c) => c[0] === k)[1]}" must be a number.`);
    if (t === 'sel' && v !== '' && !opts.includes(v)) v = '';
    data[k] = v;
  }
  if (!Object.values(data).some((v) => v !== '')) fail(400, 'Fill in at least one value.');
  const result = sh.rule(data) || '';
  const date = dateOr(body.test_date) || today();
  const due = sh.due && result === 'Pass' ? addMonths(date, monthsOf(data.interval)) : null;
  const remarks = str(body.remarks, 300);
  const list = String(wo.sheets || '').split(',').filter((k) => SHEETS[k]);
  if (!list.includes(body.sheet)) { list.push(body.sheet); await run(env.DB, 'UPDATE work_orders SET sheets=? WHERE id=?', list.join(','), wo.id); }
  if (body.id) {
    const r = await one(env.DB, 'SELECT id FROM test_rows WHERE id=? AND wo_id=?', Number(body.id), wo.id);
    if (!r) fail(404, 'Line not found.');
    await run(env.DB, 'UPDATE test_rows SET data=?, result=?, remarks=?, test_date=?, next_due=? WHERE id=?', JSON.stringify(data), result, remarks, date, due, r.id);
  } else {
    const mx = await one(env.DB, 'SELECT COALESCE(MAX(sort),0) m FROM test_rows WHERE wo_id=? AND sheet=?', wo.id, body.sheet);
    await run(env.DB, 'INSERT INTO test_rows (wo_id, sheet, data, result, remarks, test_date, next_due, sort, added_by) VALUES (?,?,?,?,?,?,?,?,?)', wo.id, body.sheet, JSON.stringify(data), result, remarks, date, due, mx.m + 1, user.id);
  }
  return json({ result, next_due: due });
});
on('GET', '/register', async ({ env, user }) => {
  need(user);
  const where = user.role === 'client' ? ' AND w.client_id=?' : '';
  const rows = await all(env.DB, `SELECT t.id, t.sheet, t.data, t.result, t.remarks, t.test_date, t.next_due, w.id AS wo_id, w.number, c.name AS client, s.name AS site, u.name AS tester
    FROM test_rows t JOIN work_orders w ON w.id=t.wo_id LEFT JOIN clients c ON c.id=w.client_id LEFT JOIN sites s ON s.id=w.site_id LEFT JOIN users u ON u.id=t.added_by
    WHERE t.sheet IN ('tt','lift') AND w.status NOT IN ('cancelled')${where} ORDER BY t.test_date DESC, t.id DESC`, ...(user.role === 'client' ? [user.client_id || -1] : []));
  const seen = new Set(), items = [];
  for (const r of rows) { const d = JSON.parse(r.data || '{}'); const key = r.sheet + '|' + (r.client || '') + '|' + (d.tag_no || 'row' + r.id); if (seen.has(key)) continue; seen.add(key); items.push({ ...r, data: d }); }
  return json({ items, today: today() });
});

/* notifications: push subscriptions, preferences, tests */
on('GET', '/push/key', async ({ env, user }) => { need(user); return json({ key: (await vapidKeys(env)).pub }); });
on('POST', '/push/subscribe', async ({ env, user, body }) => {
  need(user);
  const ep = str(body.endpoint, 1000), k = body.keys || {};
  if (!/^https:\/\//.test(ep) && !/^http:\/\/localhost/.test(ep)) fail(400, 'Invalid push subscription.');
  if (!/^[A-Za-z0-9_-]{80,100}$/.test(k.p256dh || '') || !/^[A-Za-z0-9_-]{16,30}$/.test(k.auth || '')) fail(400, 'Invalid push keys.');
  await run(env.DB, 'DELETE FROM push_subs WHERE endpoint=?', ep);
  await run(env.DB, 'INSERT INTO push_subs (user_id, endpoint, p256dh, auth, ua) VALUES (?,?,?,?,?)', user.id, ep, k.p256dh, k.auth, str(body.ua, 200));
  await run(env.DB, 'UPDATE users SET notify_push=1 WHERE id=?', user.id);
  return json({ ok: true });
});
on('POST', '/push/unsubscribe', async ({ env, user, body }) => { need(user); await run(env.DB, 'DELETE FROM push_subs WHERE endpoint=? AND user_id=?', str(body.endpoint, 1000), user.id); return json({ ok: true }); });
on('POST', '/push/test', async ({ env, user }) => {
  need(user);
  const n = await sendPush(env, [user.id], { title: 'Notifications are working', body: `Hi ${user.name.split(' ')[0]}, you will get job alerts here.`, url: '/#/', urgent: true });
  return json({ sent: n, devices: (await one(env.DB, 'SELECT COUNT(*) n FROM push_subs WHERE user_id=?', user.id)).n });
});
on('POST', '/sms/test', async ({ env, user, body }) => {
  need(user, ...BOSS);
  if (!user.phone) fail(400, 'Add your mobile number under My account first.');
  const r = await sendSms(env, [user.id], 'Test message. SMS alerts are working.', true);
  if (!r.sent) fail(400, r.reason || 'The SMS was not sent.');
  return json(r);
});
on('POST', '/me/prefs', async ({ env, user, body }) => {
  need(user);
  await run(env.DB, 'UPDATE users SET notify_push=?, notify_sms=? WHERE id=?', body.notify_push === false ? 0 : 1, body.notify_sms === false ? 0 : 1, user.id);
  return json({ ok: true });
});
on('GET', '/notifications/all', async ({ env, user }) => { need(user); return json({ items: await all(env.DB, 'SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 150', user.id) }); });

/* notice board */
on('GET', '/notices', async ({ env, user }) => {
  need(user);
  const rows = await all(env.DB, `SELECT a.*, u.name AS author, u.role AS author_role, r.user_id AS rcpt, r.read_at, r.ack_at,
    (SELECT COUNT(*) FROM ann_reads x WHERE x.ann_id=a.id) AS recipients, (SELECT COUNT(*) FROM ann_reads x WHERE x.ann_id=a.id AND x.read_at IS NOT NULL) AS reads,
    (SELECT COUNT(*) FROM ann_reads x WHERE x.ann_id=a.id AND x.ack_at IS NOT NULL) AS acks
    FROM announcements a LEFT JOIN users u ON u.id=a.created_by LEFT JOIN ann_reads r ON r.ann_id=a.id AND r.user_id=?
    WHERE (r.user_id IS NOT NULL OR a.created_by=? OR ?) AND (a.expires IS NULL OR a.expires >= ?) ORDER BY a.pinned DESC, a.id DESC LIMIT 100`, user.id, user.id, BOSS.includes(user.role) ? 1 : 0, today());
  const names = Object.fromEntries((await all(env.DB, 'SELECT id, name FROM clients')).map((c) => [c.id, c.name]));
  return json({ items: rows.map((a) => ({ ...a, audience_label: audienceLabel(JSON.parse(a.audience || '{}'), names), mine: a.created_by === user.id, can_manage: a.created_by === user.id || BOSS.includes(user.role), recipient: !!a.rcpt })) });
});
on('POST', '/notices', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  const title = str(body.title, 120), text = str(body.body, 3000), aud = cleanAudience(body, user);
  if (!title) fail(400, 'Give the notice a title.');
  if (aud.to === 'me') fail(400, 'Choose who should get this notice.');
  const priority = oneOf(body.priority, ['Info', 'Important', 'Urgent'], 'Info');
  const ids = (await audienceIds(env, aud, user)).filter((x) => x !== user.id);
  if (!ids.length) fail(400, 'Nobody matches that audience yet.');
  const r = await run(env.DB, 'INSERT INTO announcements (title, body, priority, audience, pinned, expires, ack_required, sms, created_by) VALUES (?,?,?,?,?,?,?,?,?)', title, text, priority, JSON.stringify(aud), body.pinned ? 1 : 0, dateOr(body.expires), body.ack ? 1 : 0, body.sms ? 1 : 0, user.id);
  const id = r.meta.last_row_id;
  await env.DB.batch(ids.map((u) => env.DB.prepare('INSERT OR IGNORE INTO ann_reads (ann_id, user_id) VALUES (?,?)').bind(id, u)));
  await notify(env, ids, null, `${priority === 'Urgent' ? 'URGENT: ' : ''}${title}${text ? ' · ' + text.slice(0, 140) : ''}`, { kind: 'notice', title: (priority === 'Urgent' ? '🚨 ' : '📢 ') + title, url: '/#/notices', urgent: priority !== 'Info', sms: !!body.sms, tag: 'ann' + id });
  await audit(env, user, 'posted notice', title);
  return json({ id, recipients: ids.length }, 201);
});
on('POST', '/notices/:id', async ({ env, user, params, body }) => {
  need(user);
  const a = await one(env.DB, 'SELECT * FROM announcements WHERE id=?', Number(params.id) || 0);
  if (!a) fail(404, 'Notice not found.');
  const manage = a.created_by === user.id || BOSS.includes(user.role);
  if (body.read || body.ack) {
    await run(env.DB, `UPDATE ann_reads SET read_at=COALESCE(read_at, ?), ack_at=CASE WHEN ? THEN COALESCE(ack_at, ?) ELSE ack_at END WHERE ann_id=? AND user_id=?`, now(), body.ack ? 1 : 0, now(), a.id, user.id);
    return json({ ok: true });
  }
  if (!manage) fail(403, 'Only the author or a manager can change this notice.');
  if (body.delete) { await env.DB.batch([env.DB.prepare('DELETE FROM ann_reads WHERE ann_id=?').bind(a.id), env.DB.prepare('DELETE FROM announcements WHERE id=?').bind(a.id)]); return json({ ok: true }); }
  if ('pinned' in body) await run(env.DB, 'UPDATE announcements SET pinned=? WHERE id=?', body.pinned ? 1 : 0, a.id);
  if (body.remind) {
    const ids = (await all(env.DB, `SELECT user_id FROM ann_reads WHERE ann_id=? AND ${a.ack_required ? 'ack_at' : 'read_at'} IS NULL`, a.id)).map((r) => r.user_id);
    await notify(env, ids, null, `Reminder: please ${a.ack_required ? 'read and acknowledge' : 'read'} "${a.title}"`, { kind: 'notice', url: '/#/notices', tag: 'ann' + a.id, sms: !!body.sms });
    return json({ reminded: ids.length });
  }
  return json({ ok: true });
});
on('GET', '/notices/:id/receipts', async ({ env, user, params }) => {
  need(user, ...SUPERVISE);
  const a = await one(env.DB, 'SELECT * FROM announcements WHERE id=?', Number(params.id) || 0);
  if (!a) fail(404, 'Notice not found.');
  return json({ items: await all(env.DB, 'SELECT u.name, u.role, u.trade, r.read_at, r.ack_at FROM ann_reads r JOIN users u ON u.id=r.user_id WHERE r.ann_id=? ORDER BY r.read_at IS NULL DESC, u.name', a.id) });
});
/* reminders */
on('GET', '/reminders', async ({ env, user }) => {
  need(user);
  const names = Object.fromEntries((await all(env.DB, 'SELECT id, name FROM clients')).map((c) => [c.id, c.name]));
  const rows = await all(env.DB, `SELECT r.*, u.name AS author FROM reminders r LEFT JOIN users u ON u.id=r.created_by WHERE r.created_by=? OR ? ORDER BY r.active DESC, r.next_at`, user.id, BOSS.includes(user.role) ? 1 : 0);
  return json({ items: rows.map((r) => ({ ...r, audience_label: audienceLabel(JSON.parse(r.audience || '{}'), names) })), tz: (await settings(env)).tz });
});
on('POST', '/reminders', async ({ env, user, body }) => {
  need(user);
  const s = await settings(env);
  if (body.id) {
    const r = await one(env.DB, 'SELECT * FROM reminders WHERE id=?', Number(body.id));
    if (!r || (r.created_by !== user.id && !BOSS.includes(user.role))) fail(404, 'Reminder not found.');
    if (body.delete) { await run(env.DB, 'DELETE FROM reminders WHERE id=?', r.id); return json({ ok: true }); }
    if ('active' in body && Object.keys(body).length <= 2) { await run(env.DB, 'UPDATE reminders SET active=? WHERE id=?', body.active ? 1 : 0, r.id); return json({ ok: true }); }
  }
  const title = str(body.title, 120);
  if (!title) fail(400, 'What is the reminder about?');
  const d = dateOr(body.date), t = /^\d{2}:\d{2}$/.test(body.time || '') ? body.time : null;
  if (!d || !t) fail(400, 'Choose the date and time.');
  const at = localToUtc(s, d, t);
  const repeat = oneOf(body.repeat, ['none', 'daily', 'weekdays', 'weekly', 'monthly'], 'none');
  if (repeat === 'none' && at < now()) fail(400, 'That time has already passed.');
  let next = at; while (repeat !== 'none' && next < now()) next = nextRepeat(next, repeat);
  const aud = cleanAudience(body, user);
  const f = [title, str(body.body, 1000), JSON.stringify(aud), next, repeat, body.sms && SUPERVISE.includes(user.role) ? 1 : 0, 1];
  if (body.id) await run(env.DB, 'UPDATE reminders SET title=?, body=?, audience=?, next_at=?, repeat=?, sms=?, active=? WHERE id=?', ...f, Number(body.id));
  else await run(env.DB, 'INSERT INTO reminders (title, body, audience, next_at, repeat, sms, active, created_by) VALUES (?,?,?,?,?,?,?,?)', ...f, user.id);
  return json({ ok: true, next_at: next });
});
/* scheduler: called every 15 minutes by the cron worker, and as a fallback while the app is open */
on('POST', '/cron', async ({ env, req }) => {
  const s = await settings(env);
  const k = req.headers.get('x-cron-key') || '';
  if (!s.cron_key || k.length < 20 || !safeEqual(k, s.cron_key)) fail(403, 'Forbidden.');
  return json(await tick(env, true));
});

/* reports */
on('GET', '/report/:id', async ({ env, user, params }) => {
  need(user);
  const wo = await loadWO(env, params.id, user);
  if (user.role === 'client' && !['sent', 'closed'].includes(wo.status)) fail(403, 'The report will be available once the manager sends it.');
  const out = await fullWO(env, wo, user, true);
  out.settings = await publicSettings(env, null);
  out.draft = !['approved', 'sent', 'closed'].includes(wo.status);
  out.wo.tech_sign = wo.tech_sign;
  return json(out);
});
on('GET', '/public/report/:token', async ({ env, params }) => {
  if (!/^[a-f0-9]{40}$/.test(params.token)) fail(404, 'Report not found.');
  const wo = await one(env.DB, `SELECT * FROM work_orders WHERE report_token=? AND status IN ('sent','closed')`, params.token);
  if (!wo) fail(404, 'Report not found or no longer shared.');
  const out = await fullWO(env, wo, null, true);
  out.settings = await publicSettings(env, null);
  out.wo.tech_sign = wo.tech_sign;
  out.token = params.token;
  return json(out);
});

/* admin: users */
on('GET', '/users', async ({ env, user }) => { need(user, ...BOSS); return json({ items: await all(env.DB, `SELECT u.id, u.email, u.name, u.phone, u.role, u.trade, u.client_id, u.status, u.last_login, u.must_change, c.name AS client FROM users u LEFT JOIN clients c ON c.id=u.client_id ORDER BY u.status, u.role, u.name`) }); });
on('POST', '/users', async ({ env, user, body }) => {
  need(user, ...BOSS);
  const email = str(body.email, 200).toLowerCase(), name = str(body.name, 100), role = oneOf(body.role, ROLES, null);
  if (!name) fail(400, 'Enter the person\'s name.');
  if (!emailOk(email)) fail(400, 'Enter a valid email address.');
  if (!role) fail(400, 'Choose a role.');
  if (role === 'admin' && user.role !== 'admin') fail(403, 'Only an admin can create another admin.');
  const clientId = role === 'client' ? numOr(body.client_id) : null;
  if (role === 'client' && !(clientId && await one(env.DB, 'SELECT id FROM clients WHERE id=?', clientId))) fail(400, 'Choose which client company this person belongs to.');
  if (await one(env.DB, 'SELECT id FROM users WHERE email=?', email)) fail(409, 'That email already has an account.');
  const pw = tempPassword(); const { hash, salt } = await hashPassword(pw);
  await run(env.DB, 'INSERT INTO users (email, name, phone, role, trade, client_id, pass_hash, pass_salt, must_change) VALUES (?,?,?,?,?,?,?,?,1)', email, name, str(body.phone, 40), role, role === 'client' ? null : str(body.trade, 40), clientId, hash, salt);
  await audit(env, user, 'created user', `${email} (${role})`);
  return json({ password: pw }, 201);
});
on('POST', '/users/:id', async ({ env, user, params, body }) => {
  need(user, ...BOSS);
  const u = await one(env.DB, 'SELECT * FROM users WHERE id=?', Number(params.id) || 0);
  if (!u) fail(404, 'User not found.');
  if (u.role === 'admin' && user.role !== 'admin') fail(403, 'Only an admin can change an admin.');
  if (body.reset) {
    const pw = tempPassword(); const { hash, salt } = await hashPassword(pw);
    await run(env.DB, 'UPDATE users SET pass_hash=?, pass_salt=?, must_change=1, failed=0, locked_until=NULL WHERE id=?', hash, salt, u.id);
    await run(env.DB, 'DELETE FROM sessions WHERE user_id=?', u.id);
    await audit(env, user, 'reset password', u.email);
    return json({ password: pw });
  }
  const role = oneOf(body.role, ROLES, u.role);
  if (role === 'admin' && user.role !== 'admin') fail(403, 'Only an admin can make someone an admin.');
  const status = oneOf(body.status, ['active', 'disabled'], u.status);
  if (u.id === user.id && (status !== 'active' || role !== u.role)) fail(400, 'You cannot switch off or change your own role.');
  await run(env.DB, 'UPDATE users SET name=?, phone=?, role=?, trade=?, client_id=?, status=? WHERE id=?', str(body.name, 100) || u.name, str(body.phone ?? u.phone, 40), role, role === 'client' ? null : str(body.trade ?? u.trade, 40), role === 'client' ? numOr(body.client_id, u.client_id) : null, status, u.id);
  if (status !== 'active') await run(env.DB, 'DELETE FROM sessions WHERE user_id=?', u.id);
  await audit(env, user, 'updated user', u.email);
  return json({ ok: true });
});

/* admin: clients, sites, assets, PM plans */
on('GET', '/clients', async ({ env, user }) => {
  need(user, ...SUPERVISE);
  return json({
    items: await all(env.DB, `SELECT c.*, (SELECT COUNT(*) FROM sites s WHERE s.client_id=c.id) AS sites, (SELECT COUNT(*) FROM work_orders w WHERE w.client_id=c.id AND w.status NOT IN ('closed','cancelled')) AS open_jobs,
      (SELECT COUNT(*) FROM users u WHERE u.client_id=c.id) AS logins FROM clients c ORDER BY c.name`),
    sites: await all(env.DB, `SELECT s.*, (SELECT COUNT(*) FROM assets a WHERE a.site_id=s.id) AS assets FROM sites s ORDER BY s.name`),
  });
});
on('POST', '/clients', async ({ env, user, body }) => {
  need(user, ...BOSS);
  const logo = str(body.logo, 400000), color = /^#[0-9a-fA-F]{6}$/.test(String(body.color || '')) ? body.color : null;
  if (logo && !/^data:image\/(png|jpeg|webp);base64,/.test(logo) && !/^https:\/\//.test(logo)) fail(400, 'The logo must be an uploaded image or an https link.');
  const f = [str(body.name, 120), str(body.contact, 100), str(body.email, 200), str(body.phone, 40), str(body.address, 300), str(body.notes, 1000), logo || null, color, body.white_label ? 1 : 0];
  if (!f[0]) fail(400, 'Enter the client company name.');
  if (body.id) await run(env.DB, 'UPDATE clients SET name=?, contact=?, email=?, phone=?, address=?, notes=?, logo=?, color=?, white_label=? WHERE id=?', ...f, Number(body.id));
  else await run(env.DB, 'INSERT INTO clients (name, contact, email, phone, address, notes, logo, color, white_label) VALUES (?,?,?,?,?,?,?,?,?)', ...f);
  return json({ ok: true });
});
on('POST', '/sites', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  const name = str(body.name, 120), cid = numOr(body.client_id);
  if (!name) fail(400, 'Enter the site name.');
  if (!cid || !(await one(env.DB, 'SELECT id FROM clients WHERE id=?', cid))) fail(400, 'Choose the client.');
  if (body.id) await run(env.DB, 'UPDATE sites SET name=?, address=?, client_id=? WHERE id=?', name, str(body.address, 300), cid, Number(body.id));
  else await run(env.DB, 'INSERT INTO sites (client_id, name, address) VALUES (?,?,?)', cid, name, str(body.address, 300));
  return json({ ok: true });
});
on('GET', '/assets', async ({ env, user }) => {
  need(user);
  const where = user.role === 'client' ? ' WHERE s.client_id=?' : '';
  const b = user.role === 'client' ? [user.client_id || -1] : [];
  return json({ items: await all(env.DB, `SELECT a.*, s.name AS site, c.name AS client, c.id AS client_id,
    (SELECT COUNT(*) FROM work_orders w WHERE w.asset_id=a.id) AS jobs, (SELECT MAX(substr(completed_at,1,10)) FROM work_orders w WHERE w.asset_id=a.id) AS last_job,
    (SELECT MIN(next_due) FROM pm_plans p WHERE p.asset_id=a.id AND p.active=1) AS next_pm
    FROM assets a JOIN sites s ON s.id=a.site_id JOIN clients c ON c.id=s.client_id${where} ORDER BY c.name, a.tag`, ...b) });
});
on('POST', '/assets', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  const tag = str(body.tag, 40), name = str(body.name, 120), sid = numOr(body.site_id);
  if (!tag || !name) fail(400, 'Enter the asset tag and name.');
  if (!sid || !(await one(env.DB, 'SELECT id FROM sites WHERE id=?', sid))) fail(400, 'Choose the site.');
  const f = [sid, tag, name, oneOf(body.discipline, DISCIPLINES, 'Electrical'), str(body.make, 80), str(body.model, 80), str(body.serial, 80), str(body.rating, 80), oneOf(body.criticality, ['A', 'B', 'C'], 'B'), str(body.notes, 500), numOr(body.run_hours)];
  if (body.id) await run(env.DB, 'UPDATE assets SET site_id=?, tag=?, name=?, discipline=?, make=?, model=?, serial=?, rating=?, criticality=?, notes=?, run_hours=? WHERE id=?', ...f, Number(body.id));
  else await run(env.DB, 'INSERT INTO assets (site_id, tag, name, discipline, make, model, serial, rating, criticality, notes, run_hours) VALUES (?,?,?,?,?,?,?,?,?,?,?)', ...f);
  return json({ ok: true });
});
on('GET', '/pm', async ({ env, user }) => { need(user, ...SUPERVISE); return json({ items: await all(env.DB, `SELECT p.*, a.tag, a.name AS asset, s.name AS site, c.name AS client, f.name AS foreman FROM pm_plans p JOIN assets a ON a.id=p.asset_id JOIN sites s ON s.id=a.site_id JOIN clients c ON c.id=s.client_id LEFT JOIN users f ON f.id=p.foreman_id ORDER BY p.active DESC, p.next_due`) }); });
on('POST', '/pm', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  if (body.generate) return json({ created: await generatePM(env, user) });
  const aid = numOr(body.asset_id), every = Math.round(numOr(body.every_days, 0)), title = str(body.title, 120), next = dateOr(body.next_due);
  if (!aid || !(await one(env.DB, 'SELECT id FROM assets WHERE id=?', aid))) fail(400, 'Choose the asset.');
  if (!title) fail(400, 'Enter what the planned job is, for example "Monthly motor inspection".');
  const hrs = numOr(body.every_hours);
  if (hrs != null && !(hrs >= 10 && hrs <= 100000)) fail(400, 'Running hours must be between 10 and 100000.');
  const days = every || (hrs ? 3650 : 0);
  if (!(days >= 1 && days <= 3650)) fail(400, 'Enter how often in days (for example 30), or in running hours.');
  const nd = next || (hrs ? addDays(today(), days) : null);
  if (!nd) fail(400, 'Choose when it is next due.');
  const a = await one(env.DB, 'SELECT run_hours FROM assets WHERE id=?', aid);
  const f = [aid, title, oneOf(body.discipline, DISCIPLINES, 'Electrical'), oneOf(body.type, TYPES, 'Preventive maintenance'), days, nd, numOr(body.foreman_id), numOr(body.est_hours), body.active === false || body.active === 0 ? 0 : 1, hrs];
  if (body.id) await run(env.DB, 'UPDATE pm_plans SET asset_id=?, title=?, discipline=?, type=?, every_days=?, next_due=?, foreman_id=?, est_hours=?, active=?, every_hours=? WHERE id=?', ...f, Number(body.id));
  else await run(env.DB, 'INSERT INTO pm_plans (asset_id, title, discipline, type, every_days, next_due, foreman_id, est_hours, active, every_hours, last_hours) VALUES (?,?,?,?,?,?,?,?,?,?,?)', ...f, a ? a.run_hours || 0 : 0);
  return json({ ok: true });
});
/* settings */
on('POST', '/settings', async ({ env, user, body }) => {
  need(user, ...BOSS);
  const stmts = [];
  for (const k of Object.keys(DEFAULT_SETTINGS)) if (k in body) {
    let v = str(body[k], k === 'logo' ? 400000 : 600);
    if (k === 'sms_token' && !v) continue;
    if (k === 'sms_provider') v = oneOf(v, ['none', 'twilio', 'africastalking', 'webhook'], 'none');
    if (k === 'sms_user' && body.sms_provider === 'webhook' && v && !/^https:\/\//.test(v)) fail(400, 'The webhook must be an https link.');
    if (k === 'reminder_hour') v = String(Math.min(23, Math.max(0, Math.round(Number(v) || 6))));
    if (k === 'tz') v = String(Math.round(Number(v) || 0));
    if (k === 'logo' && v && !/^data:image\/(png|jpeg|webp);base64,/.test(v) && !/^https:\/\//.test(v) && !/^\/[\w/.-]+$/.test(v)) fail(400, 'The logo must be an uploaded image or a link.');
    if (k === 'color' && !/^#[0-9a-fA-F]{6}$/.test(v)) v = DEFAULT_SETTINGS.color;
    if (k === 'separate_approval') v = v === '0' || v === 'false' ? '0' : '1';
    if (['approval_limit', 'shift_hours', 'work_days'].includes(k)) v = String(Math.max(0, Math.min(k === 'work_days' ? 7 : k === 'shift_hours' ? 24 : 1e9, Number(v) || 0)));
    stmts.push(env.DB.prepare('INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k, v));
  }
  if (stmts.length) await env.DB.batch(stmts);
  await audit(env, user, 'changed settings', null);
  return json({ ok: true });
});
/* exports */
const csvCell = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) || /^[=+\-@]/.test(s) ? '"' + (/^[=+\-@]/.test(s) ? "'" : '') + s.replace(/"/g, '""') + '"' : s; };
on('GET', '/export/:kind', async ({ env, user, params, url }) => {
  need(user, ...SUPERVISE);
  const from = dateOr(url.searchParams.get('from')) || '2000-01-01', to = dateOr(url.searchParams.get('to')) || '2999-12-31';
  const s = await settings(env); const rate = Number(s.labour_rate) || 0;
  const Q = {
    workorders: [`SELECT w.number AS "Work order", substr(w.created_at,1,10) AS "Created", w.status AS "Status", w.priority AS "Priority", w.discipline AS "Discipline", w.type AS "Type", w.title AS "Title",
      c.name AS "Client", s.name AS "Site", a.tag AS "Asset", f.name AS "Foreman", l.name AS "Lead technician", w.due_date AS "Due", w.scheduled_date AS "Scheduled", substr(w.completed_at,1,10) AS "Completed",
      (SELECT COALESCE(SUM(hours),0) FROM time_logs t WHERE t.wo_id=w.id) AS "Hours", (SELECT ROUND(COALESCE(SUM(qty*unit_cost),0),2) FROM materials m WHERE m.wo_id=w.id) AS "Materials cost",
      ROUND((SELECT COALESCE(SUM(hours),0) FROM time_logs t WHERE t.wo_id=w.id)*${rate} + (SELECT COALESCE(SUM(qty*unit_cost),0) FROM materials m WHERE m.wo_id=w.id),2) AS "Job value (ex VAT)"
      FROM work_orders w LEFT JOIN clients c ON c.id=w.client_id LEFT JOIN sites s ON s.id=w.site_id LEFT JOIN assets a ON a.id=w.asset_id LEFT JOIN users f ON f.id=w.foreman_id LEFT JOIN users l ON l.id=w.lead_id
      WHERE substr(w.created_at,1,10) BETWEEN ? AND ? ORDER BY w.id DESC`],
    timesheets: [`SELECT t.date AS "Date", t.worker AS "Worker", t.hours AS "Hours", w.number AS "Work order", w.title AS "Job", c.name AS "Client", t.note AS "Note"
      FROM time_logs t JOIN work_orders w ON w.id=t.wo_id LEFT JOIN clients c ON c.id=w.client_id WHERE t.date BETWEEN ? AND ? ORDER BY t.date, t.worker`],
    materials: [`SELECT substr(m.created_at,1,10) AS "Date", w.number AS "Work order", c.name AS "Client", m.item AS "Item", m.qty AS "Qty", m.unit AS "Unit", m.unit_cost AS "Unit cost", ROUND(m.qty*m.unit_cost,2) AS "Total"
      FROM materials m JOIN work_orders w ON w.id=m.wo_id LEFT JOIN clients c ON c.id=w.client_id WHERE substr(m.created_at,1,10) BETWEEN ? AND ? ORDER BY m.id`],
    stock: [`SELECT p.part_no AS "Part no.", p.name AS "Description", p.category AS "Category", s.name AS "Store", st.bin AS "Bin", st.qty AS "Qty", p.unit AS "Unit", p.cost AS "Unit cost", ROUND(st.qty*p.cost,2) AS "Value", p.min_qty AS "Minimum", p.supplier AS "Supplier"
      FROM stock st JOIN parts p ON p.id=st.part_id JOIN stores s ON s.id=st.store_id WHERE ? <= ? ORDER BY p.part_no, s.name`],
    moves: [`SELECT substr(m.created_at,1,10) AS "Date", p.part_no AS "Part no.", p.name AS "Description", s.name AS "Store", m.kind AS "Movement", m.qty AS "Qty", m.unit_cost AS "Unit cost", w.number AS "Work order", m.ref AS "Reference", u.name AS "By"
      FROM stock_moves m JOIN parts p ON p.id=m.part_id JOIN stores s ON s.id=m.store_id LEFT JOIN work_orders w ON w.id=m.wo_id LEFT JOIN users u ON u.id=m.user_id WHERE substr(m.created_at,1,10) BETWEEN ? AND ? ORDER BY m.id`],
    tests: [`SELECT t.test_date AS "Date", w.number AS "Work order", c.name AS "Client", s.name AS "Site", t.sheet AS "Sheet", t.data AS "Readings", t.result AS "Result", t.remarks AS "Remarks", t.next_due AS "Next due", u.name AS "Tested by"
      FROM test_rows t JOIN work_orders w ON w.id=t.wo_id LEFT JOIN clients c ON c.id=w.client_id LEFT JOIN sites s ON s.id=w.site_id LEFT JOIN users u ON u.id=t.added_by WHERE t.test_date BETWEEN ? AND ? ORDER BY t.test_date, w.number`],
  }[params.kind];
  if (!Q) fail(404, 'Unknown export.');
  const rows = await all(env.DB, Q[0], from, to);
  if (params.kind === 'tests') rows.forEach((r) => { const sh = SHEETS[r.Sheet]; const d = JSON.parse(r.Readings || '{}'); r.Readings = sh ? sh.cols.filter((c) => d[c[0]] !== '' && d[c[0]] != null).map((c) => `${c[1]}: ${d[c[0]]}`).join('; ') : r.Readings; r.Sheet = sh ? sh.title : r.Sheet; });
  const head = [...Q[0].matchAll(/ AS "([^"]+)"/g)].map((m) => m[1]);
  const csv = [head.map(csvCell).join(','), ...rows.map((r) => head.map((h) => csvCell(r[h])).join(','))].join('\r\n');
  return new Response('﻿' + csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${params.kind}-${from}-to-${to}.csv"`, 'cache-control': 'no-store' } });
});
on('GET', '/audit', async ({ env, user }) => { need(user, ...BOSS); return json({ items: await all(env.DB, 'SELECT * FROM audit ORDER BY id DESC LIMIT 200') }); });

/* =====================================================================
   v3: stores & spares, clock on/off and labour utilisation, failure codes
   and downtime, analysis, condition monitoring, TPM (operator checks, OEE),
   projects, client branding.
   ===================================================================== */
const UNPLANNED = ['Breakdown', 'Corrective maintenance', 'TPM / operator fault'];
const FAIL = {
  component: ['Motor', 'Bearing', 'Seal', 'Coupling', 'Gearbox', 'Belt / chain', 'Pump', 'Valve', 'Cable / wiring', 'Contactor / starter', 'VSD / drive', 'Breaker / fuse', 'Sensor / instrument', 'PLC / I/O', 'Hydraulics', 'Pneumatics', 'Structure', 'Other'],
  mode: ["Won't start", 'Tripped', 'Overheating', 'Vibration / noise', 'Leak', 'Broken / worn', 'Electrical fault (earth / short)', 'Out of calibration', 'Low output / performance', 'Blocked / jammed', 'Other'],
  cause: ['Wear and tear', 'Lack of lubrication', 'Misalignment / imbalance', 'Overload', 'Contamination (dust / water)', 'Operator error', 'Poor installation / repair', 'Design / wrong spec', 'Power supply problem', 'Age / end of life', 'Unknown'],
  action: ['Replaced', 'Repaired', 'Adjusted / aligned', 'Cleaned', 'Lubricated', 'Reset', 'Recalibrated', 'Temporary fix', 'Other'],
};
const CLOCK_KINDS = { work: 'Hands-on work', travel: 'Travel', wait_parts: 'Waiting for parts', wait_permit: 'Waiting for permit / isolation' };
const CM_KINDS = { vibration: ['Vibration', 'mm/s'], temperature: ['Temperature', '°C'], oil: ['Oil analysis (particle count / ISO code)', 'ISO'], ir: ['Insulation resistance', 'MΩ'], current: ['Motor current', 'A'], pressure: ['Pressure', 'bar'], hours: ['Run hours (hour meter)', 'h'], other: ['Other reading', ''] };
const TPM_DEFAULT = { Electrical: ['Panel and cables clean and dry, no burning smell', 'Indicator lights and meters working', 'No unusual noise or heat from motor', 'Guards and covers in place'], Mechanical: ['Machine clean, no oil or grease build-up', 'Oil level in sight glass OK', 'No leaks (oil, air, water)', 'Belts / chains tension OK, guards in place', 'Grease points lubricated as per chart', 'No unusual noise or vibration', 'Bolts and fasteners tight'], Automation: ['Sensors clean and aligned', 'Air pressure in range, no leaks', 'Emergency stop tested', 'HMI shows no active alarms'], Instrumentation: ['Gauges readable and in range', 'Impulse lines and tubing not leaking', 'Transmitter display OK'] };
const mins = (a, b) => Math.max(0, (new Date(b || now()).getTime() - new Date(a).getTime()) / 60000);
const r1 = (n) => Math.round(n * 10) / 10, r2 = (n) => Math.round(n * 100) / 100;
async function partStock(env, partId) {
  return all(env.DB, `SELECT st.store_id, s.name AS store, st.qty, st.bin,
    (SELECT COALESCE(SUM(qty),0) FROM reservations r WHERE r.part_id=st.part_id AND r.store_id=st.store_id AND r.status='reserved') AS reserved
    FROM stock st JOIN stores s ON s.id=st.store_id WHERE st.part_id=? ORDER BY s.name`, partId);
}
async function lowStockCheck(env, partId) {
  const p = await one(env.DB, 'SELECT p.*, (SELECT COALESCE(SUM(qty),0) FROM stock s WHERE s.part_id=p.id) AS total FROM parts p WHERE p.id=?', partId);
  if (!p) return;
  if (p.min_qty != null && p.total <= p.min_qty) {
    if (!p.alerted) {
      await run(env.DB, 'UPDATE parts SET alerted=1 WHERE id=?', p.id);
      await notify(env, await roleIds(env, 'manager', 'admin', 'foreman'), null, `Low stock: ${p.part_no} ${p.name} (${p.total} ${p.unit} left, minimum ${p.min_qty}). Raise a purchase request.`, { kind: 'stock', url: '/#/stores/part/' + p.id, title: 'Low stock' });
    }
  } else if (p.alerted) await run(env.DB, 'UPDATE parts SET alerted=0 WHERE id=?', p.id);
}
async function moveStock(env, user, m) {
  // m: { part_id, store_id, qty (+in / -out), kind, wo_id, unit_cost, ref, note }
  const cur = await one(env.DB, 'SELECT * FROM stock WHERE part_id=? AND store_id=?', m.part_id, m.store_id);
  if (m.qty < 0 && (!cur || cur.qty + m.qty < -1e-9)) fail(400, `Only ${cur ? cur.qty : 0} in that store.`);
  if (cur) await run(env.DB, 'UPDATE stock SET qty=qty+? WHERE part_id=? AND store_id=?', m.qty, m.part_id, m.store_id);
  else await run(env.DB, 'INSERT INTO stock (part_id, store_id, qty) VALUES (?,?,?)', m.part_id, m.store_id, m.qty);
  if (m.kind === 'receive' && m.unit_cost > 0) {
    // weighted average cost across all stores
    const p = await one(env.DB, 'SELECT p.cost, (SELECT COALESCE(SUM(qty),0) FROM stock s WHERE s.part_id=p.id) AS total FROM parts p WHERE p.id=?', m.part_id);
    const before = Math.max(0, p.total - m.qty);
    await run(env.DB, 'UPDATE parts SET cost=? WHERE id=?', r2(((before * (p.cost || 0)) + m.qty * m.unit_cost) / Math.max(1e-9, before + m.qty)), m.part_id);
  }
  await run(env.DB, 'INSERT INTO stock_moves (part_id, store_id, qty, kind, wo_id, unit_cost, ref, note, user_id) VALUES (?,?,?,?,?,?,?,?,?)', m.part_id, m.store_id, m.qty, m.kind, m.wo_id || null, m.unit_cost ?? null, m.ref || null, m.note || null, user ? user.id : null);
  await lowStockCheck(env, m.part_id);
}
async function closeClocks(env, woId, userId) {
  await run(env.DB, `UPDATE clock SET end_at=? WHERE end_at IS NULL AND wo_id=? ${userId ? 'AND user_id=' + Number(userId) : ''}`, now(), woId);
}
async function startClock(env, wo, uid, kind) {
  await run(env.DB, 'UPDATE clock SET end_at=? WHERE end_at IS NULL AND user_id=?', now(), uid); // one thing at a time per person
  await run(env.DB, 'INSERT INTO clock (wo_id, user_id, kind, start_at) VALUES (?,?,?,?)', wo.id, uid, kind, now());
}
async function clockSummary(env, woId) {
  const rows = await all(env.DB, 'SELECT c.*, u.name FROM clock c LEFT JOIN users u ON u.id=c.user_id WHERE c.wo_id=? ORDER BY c.id', woId);
  const by = {}, per = {};
  for (const r of rows) { const m = mins(r.start_at, r.end_at); by[r.kind] = (by[r.kind] || 0) + m; const p = per[r.user_id] || (per[r.user_id] = { user_id: r.user_id, name: r.name, work: 0, other: 0, open: null }); if (r.kind === 'work') p.work += m; else p.other += m; if (!r.end_at) p.open = r.kind; }
  return { rows: rows.map((r) => ({ ...r, minutes: Math.round(mins(r.start_at, r.end_at)) })), by: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, r2(v / 60)])), people: Object.values(per).map((p) => ({ ...p, work: r2(p.work / 60), other: r2(p.other / 60) })) };
}
function bookedVsActual(est, booked, actual) {
  const none = actual == null; actual = actual || 0;
  const flag = !none && booked > 0 && Math.abs(booked - actual) > Math.max(0.5, actual * 0.25);
  return { est, booked: r2(booked), actual: none ? null : r2(actual), diff: none ? null : r2(booked - actual), flag, note: none ? (booked ? 'No clock-on time recorded. Ask the team to use Start / Stop on the job.' : '') : flag ? (booked > actual ? `${r2(booked - actual)} h more booked than clocked on the job.` : `${r2(actual - booked)} h clocked but not booked.`) : 'Booked hours match the clock.' };
}
async function jobCost(env, wo) {
  const s = await settings(env), rate = Number(s.labour_rate) || 0;
  const h = (await one(env.DB, 'SELECT COALESCE(SUM(hours),0) h FROM time_logs WHERE wo_id=?', wo.id)).h;
  const m = (await one(env.DB, 'SELECT COALESCE(SUM(qty*unit_cost),0) m FROM materials WHERE wo_id=?', wo.id)).m;
  return r2(h * rate + m);
}
async function reservePmParts(env, wo) {
  if (!wo.asset_id) return 0;
  const list = await all(env.DB, 'SELECT * FROM asset_parts WHERE asset_id=? AND on_pm=1', wo.asset_id);
  let n = 0;
  for (const ap of list) {
    const st = await one(env.DB, `SELECT st.store_id, st.qty - (SELECT COALESCE(SUM(qty),0) FROM reservations r WHERE r.part_id=st.part_id AND r.store_id=st.store_id AND r.status='reserved') AS free FROM stock st WHERE st.part_id=? ORDER BY free DESC LIMIT 1`, ap.part_id);
    if (st && st.free >= ap.qty) { await run(env.DB, 'INSERT INTO reservations (part_id, store_id, wo_id, qty, status) VALUES (?,?,?,?,?)', ap.part_id, st.store_id, wo.id, ap.qty, 'reserved'); n++; }
    else { const p = await one(env.DB, 'SELECT part_no, name FROM parts WHERE id=?', ap.part_id); await notify(env, await roleIds(env, 'manager', 'admin', 'foreman'), wo.id, `${wo.number}: not enough ${p.part_no} ${p.name} in stock for the planned job. Order ${ap.qty}.`, { kind: 'stock' }); }
  }
  return n;
}
function workDays(from, to, perWeek) {
  let n = 0; for (let d = from; d <= to; d = addDays(d, 1)) { const wd = new Date(d + 'T00:00:00Z').getUTCDay(); if (wd >= 1 && wd <= perWeek || (perWeek >= 7 && wd === 0)) n++; } return n;
}
async function labourStats(env, from, to) {
  const s = await settings(env), shift = Number(s.shift_hours) || 8, wd = Number(s.work_days) || 5;
  const end = to > today() ? today() : to;
  const days = from <= end ? workDays(from, end, wd) : 0;
  const people = await all(env.DB, `SELECT id, name, trade, role, shift_hours FROM users WHERE status='active' AND role IN ('tech','foreman') ORDER BY name`);
  const clocks = await all(env.DB, `SELECT user_id, kind, start_at, end_at FROM clock WHERE substr(start_at,1,10) BETWEEN ? AND ?`, from, to);
  const booked = await all(env.DB, `SELECT user_id, date, SUM(hours) h FROM time_logs WHERE date BETWEEN ? AND ? AND user_id IS NOT NULL GROUP BY user_id, date`, from, to);
  const done = await all(env.DB, `SELECT w.id, w.lead_id, w.est_hours, (SELECT COALESCE(SUM(hours),0) FROM time_logs t WHERE t.wo_id=w.id) AS booked FROM work_orders w WHERE w.completed_at IS NOT NULL AND substr(w.completed_at,1,10) BETWEEN ? AND ?`, from, to);
  return people.map((p) => {
    const avail = days * (p.shift_hours || shift);
    const cs = clocks.filter((c) => c.user_id === p.id), k = (kind) => r1(cs.filter((c) => c.kind === kind).reduce((a, c) => a + mins(c.start_at, c.end_at), 0) / 60);
    const work = k('work'), travel = k('travel'), wait = r1(k('wait_parts') + k('wait_permit'));
    const bk = booked.filter((b) => b.user_id === p.id), bookedH = r1(bk.reduce((a, b) => a + b.h, 0));
    const ot = r1(bk.reduce((a, b) => a + Math.max(0, b.h - (p.shift_hours || shift)), 0));
    const mine = done.filter((d) => d.lead_id === p.id && d.est_hours > 0 && d.booked > 0);
    const acc = mine.length ? Math.round(mine.reduce((a, d) => a + Math.min(d.est_hours, d.booked) / Math.max(d.est_hours, d.booked), 0) / mine.length * 100) : null;
    return { id: p.id, name: p.name, trade: p.trade, available: avail, booked: bookedH, work, travel, wait, utilisation: avail ? Math.round((bookedH / avail) * 100) : null, wrench: work + travel + wait ? Math.round((work / (work + travel + wait)) * 100) : null, overtime: ot, jobs_done: done.filter((d) => d.lead_id === p.id).length, estimate_accuracy: acc };
  });
}

/* stores and spares */
on('GET', '/stores', async ({ env, user }) => {
  need(user, ...STAFF);
  const stores = await all(env.DB, `SELECT s.*, si.name AS site, (SELECT COALESCE(SUM(st.qty * p.cost),0) FROM stock st JOIN parts p ON p.id=st.part_id WHERE st.store_id=s.id) AS value FROM stores s LEFT JOIN sites si ON si.id=s.site_id WHERE s.active=1 ORDER BY s.name`);
  const parts = await all(env.DB, `SELECT p.*, (SELECT COALESCE(SUM(qty),0) FROM stock s WHERE s.part_id=p.id) AS total,
    (SELECT COALESCE(SUM(qty),0) FROM reservations r WHERE r.part_id=p.id AND r.status='reserved') AS reserved,
    (SELECT COALESCE(-SUM(qty),0) FROM stock_moves m WHERE m.part_id=p.id AND m.kind='issue' AND m.created_at >= ?) AS used_90,
    (SELECT GROUP_CONCAT(a.tag, ', ') FROM asset_parts ap JOIN assets a ON a.id=ap.asset_id WHERE ap.part_id=p.id) AS used_on
    FROM parts p WHERE p.active=1 ORDER BY p.part_no`, addDays(today(), -90));
  const stock = await all(env.DB, 'SELECT part_id, store_id, qty, bin FROM stock');
  const prs = await all(env.DB, `SELECT r.*, p.part_no, p.name, p.unit, s.name AS store, u.name AS by_name, w.number FROM purchase_requests r JOIN parts p ON p.id=r.part_id LEFT JOIN stores s ON s.id=r.store_id LEFT JOIN users u ON u.id=r.requested_by LEFT JOIN work_orders w ON w.id=r.wo_id WHERE r.status IN ('requested','ordered') ORDER BY r.id DESC`);
  return json({ stores, parts: parts.map((p) => ({ ...p, low: p.min_qty != null && p.total <= p.min_qty, stock: stock.filter((s) => s.part_id === p.id) })), requests: prs });
});
on('GET', '/stores/part/:id', async ({ env, user, params }) => {
  need(user, ...STAFF);
  const p = await one(env.DB, 'SELECT * FROM parts WHERE id=?', Number(params.id) || 0);
  if (!p) fail(404, 'Part not found.');
  return json({ part: p, stock: await partStock(env, p.id),
    moves: await all(env.DB, `SELECT m.*, s.name AS store, u.name AS by_name, w.number FROM stock_moves m LEFT JOIN stores s ON s.id=m.store_id LEFT JOIN users u ON u.id=m.user_id LEFT JOIN work_orders w ON w.id=m.wo_id WHERE m.part_id=? ORDER BY m.id DESC LIMIT 100`, p.id),
    assets: await all(env.DB, 'SELECT ap.*, a.tag, a.name FROM asset_parts ap JOIN assets a ON a.id=ap.asset_id WHERE ap.part_id=? ORDER BY a.tag', p.id),
    reservations: await all(env.DB, `SELECT r.*, w.number, s.name AS store FROM reservations r JOIN work_orders w ON w.id=r.wo_id JOIN stores s ON s.id=r.store_id WHERE r.part_id=? AND r.status='reserved'`, p.id),
    requests: await all(env.DB, 'SELECT r.*, u.name AS by_name FROM purchase_requests r LEFT JOIN users u ON u.id=r.requested_by WHERE r.part_id=? ORDER BY r.id DESC LIMIT 20', p.id) });
});
on('POST', '/stores', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  const name = str(body.name, 80); if (!name) fail(400, 'Name the store, e.g. Main store or Site container.');
  if (body.id) await run(env.DB, 'UPDATE stores SET name=?, site_id=?, notes=?, active=? WHERE id=?', name, numOr(body.site_id), str(body.notes, 300), body.active === false ? 0 : 1, Number(body.id));
  else await run(env.DB, 'INSERT INTO stores (name, site_id, notes) VALUES (?,?,?)', name, numOr(body.site_id), str(body.notes, 300));
  return json({ ok: true });
});
on('POST', '/parts', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  if (body.link) { // link a part to an asset's spares list
    const a = numOr(body.link.asset_id), pid = numOr(body.link.part_id);
    if (body.link.remove) await run(env.DB, 'DELETE FROM asset_parts WHERE asset_id=? AND part_id=?', a, pid);
    else await run(env.DB, 'INSERT INTO asset_parts (asset_id, part_id, qty, on_pm) VALUES (?,?,?,?) ON CONFLICT(asset_id, part_id) DO UPDATE SET qty=excluded.qty, on_pm=excluded.on_pm', a, pid, Math.max(1, numOr(body.link.qty, 1)), body.link.on_pm ? 1 : 0);
    return json({ ok: true });
  }
  const part_no = str(body.part_no, 60), name = str(body.name, 160);
  if (!part_no || !name) fail(400, 'Enter the part number and description.');
  const f = [part_no, name, str(body.category, 60) || null, str(body.unit, 20) || 'each', Math.max(0, numOr(body.cost, 0)), numOr(body.min_qty), numOr(body.reorder_qty), str(body.supplier, 120) || null, str(body.notes, 500) || null];
  try {
    if (body.id) { await run(env.DB, 'UPDATE parts SET part_no=?, name=?, category=?, unit=?, cost=?, min_qty=?, reorder_qty=?, supplier=?, notes=? WHERE id=?', ...f, Number(body.id)); await lowStockCheck(env, Number(body.id)); return json({ id: Number(body.id) }); }
    const r = await run(env.DB, 'INSERT INTO parts (part_no, name, category, unit, cost, min_qty, reorder_qty, supplier, notes) VALUES (?,?,?,?,?,?,?,?,?)', ...f);
    const id = r.meta.last_row_id;
    const sid = numOr(body.store_id), q = numOr(body.qty, 0);
    if (sid && q > 0) await moveStock(env, user, { part_id: id, store_id: sid, qty: q, kind: 'receive', unit_cost: f[4], note: 'Opening stock' });
    if (body.bin && sid) await run(env.DB, 'UPDATE stock SET bin=? WHERE part_id=? AND store_id=?', str(body.bin, 40), id, sid);
    return json({ id }, 201);
  } catch (e) { if (/UNIQUE/i.test(String(e.message))) fail(409, 'That part number already exists.'); throw e; }
});
on('POST', '/stock', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  const pid = numOr(body.part_id), sid = numOr(body.store_id), qty = numOr(body.qty);
  if (!(await one(env.DB, 'SELECT id FROM parts WHERE id=?', pid)) || !(await one(env.DB, 'SELECT id FROM stores WHERE id=?', sid))) fail(400, 'Choose the part and store.');
  const kind = oneOf(body.kind, ['receive', 'adjust', 'transfer', 'count'], null);
  if (!kind) fail(400, 'Choose what happened.');
  if (kind === 'count') { const cur = await one(env.DB, 'SELECT qty FROM stock WHERE part_id=? AND store_id=?', pid, sid); const diff = r2((qty || 0) - (cur ? cur.qty : 0)); if (qty == null || qty < 0) fail(400, 'Enter the counted quantity.'); if (diff) await moveStock(env, user, { part_id: pid, store_id: sid, qty: diff, kind: 'adjust', note: 'Stock count' + (str(body.note, 200) ? ': ' + str(body.note, 200) : '') }); return json({ ok: true, diff }); }
  if (!qty) fail(400, 'Enter the quantity.');
  if (kind === 'transfer') {
    const to = numOr(body.to_store_id); if (!to || to === sid) fail(400, 'Choose the store to move it to.');
    await moveStock(env, user, { part_id: pid, store_id: sid, qty: -Math.abs(qty), kind: 'transfer', note: 'Moved out' });
    await moveStock(env, user, { part_id: pid, store_id: to, qty: Math.abs(qty), kind: 'transfer', note: 'Moved in' });
  } else await moveStock(env, user, { part_id: pid, store_id: sid, qty: kind === 'receive' ? Math.abs(qty) : qty, kind, unit_cost: numOr(body.unit_cost), ref: str(body.ref, 60), note: str(body.note, 200) });
  if (body.bin) await run(env.DB, 'UPDATE stock SET bin=? WHERE part_id=? AND store_id=?', str(body.bin, 40), pid, sid);
  return json({ ok: true });
});
on('POST', '/purchase', async ({ env, user, body }) => {
  need(user, ...STAFF);
  if (body.id) {
    need(user, ...SUPERVISE);
    const r = await one(env.DB, 'SELECT * FROM purchase_requests WHERE id=?', Number(body.id));
    if (!r) fail(404, 'Request not found.');
    const to = oneOf(body.status, ['ordered', 'received', 'cancelled'], null); if (!to) fail(400, 'Unknown step.');
    if (to === 'received') {
      if (r.status === 'received') fail(400, 'Already received.');
      const qty = numOr(body.qty, r.qty), sid = numOr(body.store_id, r.store_id);
      if (!sid) fail(400, 'Choose the store it goes into.');
      await moveStock(env, user, { part_id: r.part_id, store_id: sid, qty, kind: 'receive', unit_cost: numOr(body.unit_cost, r.unit_cost), ref: 'PR-' + r.id + (str(body.ref, 60) ? ' ' + str(body.ref, 60) : ''), note: 'Purchase received' });
      await run(env.DB, `UPDATE purchase_requests SET status='received', received_at=?, qty=?, store_id=?, unit_cost=COALESCE(?, unit_cost) WHERE id=?`, now(), qty, sid, numOr(body.unit_cost), r.id);
      if (r.requested_by && r.requested_by !== user.id) await notify(env, [r.requested_by], r.wo_id, `Parts you asked for have arrived (PR-${r.id}).`, { kind: 'stock', url: r.wo_id ? '/#/job/' + r.wo_id + '/materials' : '/#/stores' });
    } else await run(env.DB, `UPDATE purchase_requests SET status=?, ordered_at=CASE WHEN ?='ordered' THEN ? ELSE ordered_at END, supplier=COALESCE(?, supplier), unit_cost=COALESCE(?, unit_cost) WHERE id=?`, to, to, now(), str(body.supplier, 120) || null, numOr(body.unit_cost), r.id);
    return json({ ok: true });
  }
  const pid = numOr(body.part_id), qty = numOr(body.qty);
  const p = await one(env.DB, 'SELECT * FROM parts WHERE id=?', pid);
  if (!p) fail(400, 'Choose the part.'); if (!(qty > 0)) fail(400, 'How many are needed?');
  const r = await run(env.DB, 'INSERT INTO purchase_requests (part_id, store_id, qty, supplier, unit_cost, note, requested_by, wo_id, status) VALUES (?,?,?,?,?,?,?,?,?)', pid, numOr(body.store_id), qty, str(body.supplier, 120) || p.supplier, p.cost, str(body.note, 300), user.id, numOr(body.wo_id), 'requested');
  await notify(env, (await roleIds(env, 'manager', 'admin')).filter((x) => x !== user.id), numOr(body.wo_id), `Purchase request PR-${r.meta.last_row_id}: ${qty} ${p.unit} ${p.part_no} ${p.name} (${user.name})`, { kind: 'stock', url: '/#/stores' });
  return json({ id: r.meta.last_row_id }, 201);
});
on('POST', '/wo/:id/issue', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  if (['approved', 'sent', 'closed', 'cancelled'].includes(wo.status)) fail(400, 'This job is closed for changes.');
  const p = await one(env.DB, 'SELECT * FROM parts WHERE id=?', numOr(body.part_id));
  if (!p) fail(400, 'Choose the part.');
  const sid = numOr(body.store_id), qty = numOr(body.qty);
  if (!(qty > 0)) fail(400, 'How many did you use?');
  const st = await one(env.DB, `SELECT st.qty, (SELECT COALESCE(SUM(qty),0) FROM reservations r WHERE r.part_id=st.part_id AND r.store_id=st.store_id AND r.status='reserved' AND r.wo_id<>?) AS held FROM stock st WHERE st.part_id=? AND st.store_id=?`, wo.id, p.id, sid);
  if (!st || st.qty - st.held < qty - 1e-9) fail(400, `Only ${st ? Math.max(0, r2(st.qty - st.held)) : 0} ${p.unit} free in that store${st && st.held ? ` (${st.held} held for other planned jobs)` : ''}.`);
  await moveStock(env, user, { part_id: p.id, store_id: sid, qty: -qty, kind: 'issue', wo_id: wo.id, unit_cost: p.cost, ref: wo.number });
  const res = await one(env.DB, `SELECT * FROM reservations WHERE wo_id=? AND part_id=? AND status='reserved'`, wo.id, p.id);
  if (res) await run(env.DB, `UPDATE reservations SET status='issued' WHERE id=?`, res.id);
  await run(env.DB, 'INSERT INTO materials (wo_id, item, qty, unit, unit_cost, added_by, part_id, store_id) VALUES (?,?,?,?,?,?,?,?)', wo.id, `${p.part_no} · ${p.name}`, qty, p.unit, p.cost || 0, user.id, p.id, sid);
  const left = (await one(env.DB, 'SELECT qty FROM stock WHERE part_id=? AND store_id=?', p.id, sid)).qty;
  const store = await one(env.DB, 'SELECT name FROM stores WHERE id=?', sid);
  await log(env, wo, user, 'material', `Issued ${qty} ${p.unit} ${p.part_no} ${p.name} from ${store.name} (${left} left).`);
  return json({ left, store: store.name, unit: p.unit });
});
on('POST', '/wo/:id/return', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  const m = await one(env.DB, 'SELECT * FROM materials WHERE id=? AND wo_id=? AND part_id IS NOT NULL', Number(body.material_id) || 0, wo.id);
  if (!m) fail(404, 'That part was not issued from stores.');
  const qty = Math.min(m.qty, numOr(body.qty, m.qty));
  if (!(qty > 0)) fail(400, 'How many are you returning?');
  await moveStock(env, user, { part_id: m.part_id, store_id: m.store_id, qty, kind: 'return', wo_id: wo.id, unit_cost: m.unit_cost, ref: wo.number });
  if (qty >= m.qty) await run(env.DB, 'DELETE FROM materials WHERE id=?', m.id); else await run(env.DB, 'UPDATE materials SET qty=qty-? WHERE id=?', qty, m.id);
  await log(env, wo, user, 'material', `Returned ${qty} ${m.unit} ${m.item} to stores.`);
  return json({ ok: true });
});
on('POST', '/wo/:id/reserve', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  if (!(wo.lead_id === user.id || SUPERVISE.includes(user.role))) fail(403, 'Only the lead technician or foreman can reserve parts.');
  if (body.release) { await run(env.DB, `UPDATE reservations SET status='released' WHERE id=? AND wo_id=?`, Number(body.release), wo.id); return json({ ok: true }); }
  const pid = numOr(body.part_id), sid = numOr(body.store_id), qty = numOr(body.qty);
  if (!(qty > 0)) fail(400, 'How many?');
  const st = await one(env.DB, `SELECT st.qty - (SELECT COALESCE(SUM(qty),0) FROM reservations r WHERE r.part_id=st.part_id AND r.store_id=st.store_id AND r.status='reserved') AS free FROM stock st WHERE st.part_id=? AND st.store_id=?`, pid, sid);
  if (!st || st.free < qty) fail(400, `Only ${st ? Math.max(0, st.free) : 0} free in that store. Raise a purchase request.`);
  await run(env.DB, 'INSERT INTO reservations (part_id, store_id, wo_id, qty, status, user_id) VALUES (?,?,?,?,?,?)', pid, sid, wo.id, qty, 'reserved', user.id);
  return json({ ok: true });
});

/* clock on / off */
on('POST', '/wo/:id/clock', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  let uid = user.id;
  if (body.user_id && Number(body.user_id) !== user.id) {
    if (!(wo.lead_id === user.id || SUPERVISE.includes(user.role))) fail(403, 'You can only clock yourself on.');
    if (!(Number(body.user_id) === wo.lead_id || await one(env.DB, 'SELECT id FROM wo_team WHERE wo_id=? AND user_id=?', wo.id, Number(body.user_id)))) fail(400, 'That person is not on this job.');
    uid = Number(body.user_id);
  }
  const act = oneOf(body.action, ['start', 'stop'], null); if (!act) fail(400, 'Start or stop?');
  if (act === 'stop') { await closeClocks(env, wo.id, uid); return json({ ok: true }); }
  if (!['assigned', 'in_progress', 'on_hold'].includes(wo.status)) fail(400, 'Start the job first.');
  const kind = oneOf(body.kind, Object.keys(CLOCK_KINDS), 'work');
  if (kind === 'work' && wo.status !== 'in_progress') fail(400, 'Tap "Start job" first (safety checks), then clock on to the work.');
  await startClock(env, wo, uid, kind);
  return json({ ok: true });
});

/* labour utilisation and analysis */
on('GET', '/analysis', async ({ env, user, url }) => {
  need(user, ...SUPERVISE);
  const q = url.searchParams, t = today();
  const from = dateOr(q.get('from')) || t.slice(0, 8) + '01', to = dateOr(q.get('to')) || t, cid = numOr(q.get('client_id'));
  const s = await settings(env), rate = Number(s.labour_rate) || 0;
  const span = Math.max(1, (new Date((to > t ? t : to) + 'T23:59:59Z') - new Date(from + 'T00:00:00Z')) / 3600e3);
  const cw = cid ? ' AND w.client_id=' + Number(cid) : '';
  const wos = await all(env.DB, `SELECT w.*, a.tag, a.name AS asset, a.criticality, c.name AS client,
    (SELECT COALESCE(SUM(hours),0) FROM time_logs t WHERE t.wo_id=w.id) AS hours, (SELECT COALESCE(SUM(qty*unit_cost),0) FROM materials m WHERE m.wo_id=w.id) AS mat
    FROM work_orders w LEFT JOIN assets a ON a.id=w.asset_id LEFT JOIN clients c ON c.id=w.client_id
    WHERE w.status<>'cancelled' AND (substr(w.created_at,1,10) BETWEEN ? AND ? OR substr(COALESCE(w.completed_at,''),1,10) BETWEEN ? AND ? OR substr(COALESCE(w.downtime_start,''),1,10) BETWEEN ? AND ?)${cw}`, from, to, from, to, from, to);
  const cost = (w) => w.hours * rate + w.mat;
  const unplanned = wos.filter((w) => UNPLANNED.includes(w.type)), planned = wos.filter((w) => !UNPLANNED.includes(w.type));
  // reliability per asset from breakdowns with downtime
  const fails = wos.filter((w) => UNPLANNED.includes(w.type) && w.asset_id && (w.downtime_start || w.started_at));
  const per = {};
  for (const w of wos.filter((x) => x.asset_id)) { const a = per[w.asset_id] || (per[w.asset_id] = { asset_id: w.asset_id, tag: w.tag, name: w.asset, client: w.client, criticality: w.criticality, failures: 0, downtime: 0, repair: 0, cost: 0, jobs: 0 }); a.jobs++; a.cost += cost(w); }
  for (const w of fails) {
    const a = per[w.asset_id]; a.failures++;
    if (w.downtime_start) a.downtime += mins(w.downtime_start, w.downtime_end || (w.completed_at || null)) / 60;
    a.repair += w.started_at && w.completed_at ? mins(w.started_at, w.completed_at) / 60 : (w.downtime_start ? mins(w.downtime_start, w.downtime_end || w.completed_at) / 60 : 0);
  }
  const assets = Object.values(per).map((a) => ({ ...a, cost: r2(a.cost), downtime: r1(a.downtime), mttr: a.failures ? r1(a.repair / a.failures) : null, mtbf: a.failures ? r1((span - a.downtime) / a.failures) : null, availability: r1(Math.max(0, (span - a.downtime) / span) * 100) }));
  const totDown = assets.reduce((x, a) => x + a.downtime, 0), totFail = assets.reduce((x, a) => x + a.failures, 0);
  // planned maintenance compliance: PM jobs due in the period
  const pmDue = wos.filter((w) => w.pm_id && w.due_date && w.due_date >= from && w.due_date <= (to > t ? t : to));
  const pmOnTime = pmDue.filter((w) => w.completed_at && w.completed_at.slice(0, 10) <= w.due_date);
  // backlog
  const techs = (await one(env.DB, `SELECT COUNT(*) n FROM users WHERE status='active' AND role IN ('tech','foreman')`)).n;
  const open = await all(env.DB, `SELECT est_hours FROM work_orders w WHERE status IN ('requested','open','assigned','in_progress','on_hold')${cw}`);
  const backlogH = open.reduce((x, w) => x + (w.est_hours || 2), 0), weekCap = Math.max(1, techs * (Number(s.shift_hours) || 8) * (Number(s.work_days) || 5));
  // failure pareto
  const pareto = (k) => { const m = {}; for (const w of fails) if (w[k]) m[w[k]] = (m[w[k]] || 0) + 1; return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8); };
  // money by month and client
  const byMonth = {}, byClient = {}, byType = {};
  for (const w of wos) { const m = (w.completed_at || w.created_at).slice(0, 7); byMonth[m] = r2((byMonth[m] || 0) + cost(w)); byClient[w.client || '—'] = r2((byClient[w.client || '—'] || 0) + cost(w)); byType[w.type] = (byType[w.type] || 0) + 1; }
  // spares
  const spares = await all(env.DB, `SELECT p.part_no, p.name, p.unit, -SUM(m.qty) AS qty, -SUM(m.qty * COALESCE(m.unit_cost, p.cost)) AS value FROM stock_moves m JOIN parts p ON p.id=m.part_id WHERE m.kind='issue' AND substr(m.created_at,1,10) BETWEEN ? AND ? GROUP BY p.id ORDER BY value DESC LIMIT 10`, from, to);
  const stockValue = (await one(env.DB, 'SELECT COALESCE(SUM(st.qty * p.cost),0) v FROM stock st JOIN parts p ON p.id=st.part_id')).v;
  const lowParts = (await one(env.DB, 'SELECT COUNT(*) n FROM parts p WHERE p.active=1 AND p.min_qty IS NOT NULL AND (SELECT COALESCE(SUM(qty),0) FROM stock s WHERE s.part_id=p.id) <= p.min_qty')).n;
  // booked vs actual on completed jobs
  const comp = wos.filter((w) => w.completed_at && w.completed_at.slice(0, 10) >= from);
  const bva = [];
  for (const w of comp) { const c = await one(env.DB, `SELECT CASE WHEN COUNT(*)=0 THEN NULL ELSE SUM((julianday(COALESCE(end_at, ?)) - julianday(start_at)) * 24) END h FROM clock WHERE wo_id=? AND kind='work'`, now(), w.id); bva.push({ id: w.id, number: w.number, title: w.title, ...bookedVsActual(w.est_hours, w.hours, c.h) }); }
  // condition monitoring and TPM
  const cm = await one(env.DB, `SELECT COUNT(*) n, SUM(CASE WHEN status='alarm' THEN 1 ELSE 0 END) alarms, SUM(CASE WHEN status='warn' THEN 1 ELSE 0 END) warns FROM cm_readings WHERE substr(at,1,10) BETWEEN ? AND ?`, from, to);
  const tpm = await one(env.DB, `SELECT COUNT(*) n, SUM(issues) issues FROM tpm_logs WHERE date BETWEEN ? AND ?`, from, to);
  const oee = await all(env.DB, `SELECT o.*, a.tag FROM oee_logs o JOIN assets a ON a.id=o.asset_id WHERE o.date BETWEEN ? AND ?`, from, to);
  const oeeCalc = (o) => { const A = o.planned_min ? (o.planned_min - o.downtime_min) / o.planned_min : 0, run = o.planned_min - o.downtime_min, P = run > 0 && o.ideal_rate ? Math.min(1, o.total_units / (run * o.ideal_rate)) : 0, Q = o.total_units ? o.good_units / o.total_units : 0; return { A, P, Q, oee: A * P * Q }; };
  const oeeAvg = oee.length ? r1(oee.reduce((x, o) => x + oeeCalc(o).oee, 0) / oee.length * 100) : null;
  return json({
    from, to, hours_in_period: Math.round(span),
    summary: { jobs: wos.length, completed: comp.length, planned: planned.length, unplanned: unplanned.length, planned_pct: wos.length ? Math.round((planned.length / wos.length) * 100) : null,
      failures: totFail, downtime: r1(totDown), mttr: totFail ? r1(assets.reduce((x, a) => x + (a.mttr || 0) * a.failures, 0) / totFail) : null, mtbf: totFail && assets.filter((a) => a.failures).length ? r1(assets.filter((a) => a.failures).reduce((x, a) => x + a.mtbf, 0) / assets.filter((a) => a.failures).length) : null,
      pm_due: pmDue.length, pm_on_time: pmOnTime.length, pm_compliance: pmDue.length ? Math.round((pmOnTime.length / pmDue.length) * 100) : null,
      backlog_hours: r1(backlogH), backlog_weeks: r1(backlogH / weekCap), open_jobs: open.length,
      cost: r2(wos.reduce((x, w) => x + cost(w), 0)), labour_cost: r2(wos.reduce((x, w) => x + w.hours * rate, 0)), parts_cost: r2(wos.reduce((x, w) => x + w.mat, 0)), stock_value: r2(stockValue), low_parts: lowParts,
      cm_readings: cm.n || 0, cm_alarms: cm.alarms || 0, cm_warns: cm.warns || 0, tpm_checks: tpm.n || 0, tpm_issues: tpm.issues || 0, oee: oeeAvg },
    bad_actors: assets.filter((a) => a.failures || a.cost).sort((a, b) => b.downtime - a.downtime || b.failures - a.failures || b.cost - a.cost).slice(0, 10),
    assets, pareto: { component: pareto('fail_component'), mode: pareto('fail_mode'), cause: pareto('fail_cause') },
    by_month: Object.entries(byMonth).sort(), by_client: Object.entries(byClient).sort((a, b) => b[1] - a[1]), by_type: Object.entries(byType).sort((a, b) => b[1] - a[1]),
    labour: await labourStats(env, from, to), booked_vs_actual: bva.sort((a, b) => Math.abs(b.diff || 0) - Math.abs(a.diff || 0)), spares,
    oee: oee.map((o) => { const c = oeeCalc(o); return { date: o.date, tag: o.tag, shift: o.shift, A: r1(c.A * 100), P: r1(c.P * 100), Q: r1(c.Q * 100), oee: r1(c.oee * 100) }; }),
  });
});

on('GET', '/labour', async ({ env, user, url }) => {
  need(user, ...STAFF);
  const t = today(), from = dateOr(url.searchParams.get('from')) || t.slice(0, 8) + '01', to = dateOr(url.searchParams.get('to')) || t;
  let rows = await labourStats(env, from, to);
  if (!SUPERVISE.includes(user.role)) rows = rows.filter((r) => r.id === user.id);
  const jobs = await all(env.DB, `SELECT w.id, w.number, w.title, w.est_hours, (SELECT COALESCE(SUM(hours),0) FROM time_logs t WHERE t.wo_id=w.id${SUPERVISE.includes(user.role) ? '' : ' AND t.user_id=' + Number(user.id)}) AS booked,
    (SELECT CASE WHEN COUNT(*)=0 THEN NULL ELSE SUM((julianday(COALESCE(end_at, ?)) - julianday(start_at)) * 24) END FROM clock c WHERE c.wo_id=w.id AND c.kind='work'${SUPERVISE.includes(user.role) ? '' : ' AND c.user_id=' + Number(user.id)}) AS actual
    FROM work_orders w WHERE substr(COALESCE(w.completed_at, w.updated_at, w.created_at),1,10) BETWEEN ? AND ? AND EXISTS (SELECT 1 FROM time_logs t WHERE t.wo_id=w.id${SUPERVISE.includes(user.role) ? '' : ' AND t.user_id=' + Number(user.id)}) ORDER BY w.id DESC LIMIT 60`, now(), from, to);
  return json({ from, to, people: rows, jobs: jobs.map((j) => ({ ...j, ...bookedVsActual(j.est_hours, j.booked, j.actual) })) });
});
on('GET', '/clock/me', async ({ env, user }) => { need(user, ...STAFF); return json({ clock: await one(env.DB, 'SELECT c.*, w.number, w.title FROM clock c JOIN work_orders w ON w.id=c.wo_id WHERE c.user_id=? AND c.end_at IS NULL', user.id) }); });

/* condition monitoring */
async function cmPointStatus(p, v) {
  if (p.alarm == null && p.warn == null) return 'ok';
  const hi = p.direction !== 'low';
  if (p.alarm != null && (hi ? v >= p.alarm : v <= p.alarm)) return 'alarm';
  if (p.warn != null && (hi ? v >= p.warn : v <= p.warn)) return 'warn';
  return 'ok';
}
on('GET', '/cm', async ({ env, user }) => {
  need(user, ...STAFF);
  const pts = await all(env.DB, `SELECT p.*, a.tag, a.name AS asset, a.criticality, s.name AS site, c.name AS client FROM cm_points p JOIN assets a ON a.id=p.asset_id JOIN sites s ON s.id=a.site_id JOIN clients c ON c.id=s.client_id WHERE p.active=1 ORDER BY CASE p.last_status WHEN 'alarm' THEN 0 WHEN 'warn' THEN 1 ELSE 2 END, a.tag, p.name`);
  const t = today();
  for (const p of pts) { p.history = (await all(env.DB, 'SELECT value, status, at FROM cm_readings WHERE point_id=? ORDER BY id DESC LIMIT 12', p.id)).reverse(); p.due = p.interval_days ? (p.last_at ? addDays(p.last_at.slice(0, 10), p.interval_days) : t) : null; p.overdue = p.due && p.due <= t; }
  return json({ items: pts, kinds: CM_KINDS });
});
on('POST', '/cm/points', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  if (body.id && body.remove) { await run(env.DB, 'UPDATE cm_points SET active=0 WHERE id=?', Number(body.id)); return json({ ok: true }); }
  const aid = numOr(body.asset_id); if (!(await one(env.DB, 'SELECT id FROM assets WHERE id=?', aid))) fail(400, 'Choose the machine.');
  const kind = oneOf(body.kind, Object.keys(CM_KINDS), 'other');
  const name = str(body.name, 80) || CM_KINDS[kind][0];
  const f = [aid, name, kind, str(body.unit, 20) || CM_KINDS[kind][1], numOr(body.warn), numOr(body.alarm), body.direction === 'low' ? 'low' : 'high', numOr(body.interval_days)];
  if (body.id) await run(env.DB, 'UPDATE cm_points SET asset_id=?, name=?, kind=?, unit=?, warn=?, alarm=?, direction=?, interval_days=? WHERE id=?', ...f, Number(body.id));
  else await run(env.DB, 'INSERT INTO cm_points (asset_id, name, kind, unit, warn, alarm, direction, interval_days) VALUES (?,?,?,?,?,?,?,?)', ...f);
  return json({ ok: true });
});
async function cmReading(env, user, p, v, note, woId) {
  const status = await cmPointStatus(p, v);
  await run(env.DB, 'INSERT INTO cm_readings (point_id, value, status, note, user_id, wo_id, at) VALUES (?,?,?,?,?,?,?)', p.id, v, status, note || null, user ? user.id : null, woId || null, now());
  await run(env.DB, 'UPDATE cm_points SET last_value=?, last_at=?, last_status=? WHERE id=?', v, now(), status, p.id);
  if (p.kind === 'hours') await run(env.DB, 'UPDATE assets SET run_hours=? WHERE id=? AND (run_hours IS NULL OR run_hours < ?)', v, p.asset_id, v);
  const a = await one(env.DB, 'SELECT a.*, s.client_id FROM assets a JOIN sites s ON s.id=a.site_id WHERE a.id=?', p.asset_id);
  let made = null;
  if (status === 'alarm') {
    const openWo = await one(env.DB, `SELECT id, number FROM work_orders WHERE asset_id=? AND type='Condition-based maintenance' AND status IN ('requested','open','assigned','in_progress','on_hold')`, a.id);
    if (!openWo) {
      const wo = await createWO(env, user || { id: null }, { client_id: a.client_id, site_id: a.site_id, asset_id: a.id, discipline: a.discipline || 'Mechanical', type: 'Condition-based maintenance', priority: a.criticality === 'A' ? 'Urgent' : 'High', title: `${p.name} in alarm · ${a.tag}`, description: `Condition monitoring: ${p.name} read ${v} ${p.unit || ''} (alarm limit ${p.alarm} ${p.unit || ''}).${note ? ' Note: ' + note : ''} Investigate and correct before failure.`, status: 'open', foreman_id: null, lead_id: null, due_date: addDays(today(), a.criticality === 'A' ? 1 : 3), scheduled_date: null, est_hours: null, quote: null });
      await log(env, wo, user, 'created', `Created automatically: ${p.name} reading ${v} ${p.unit || ''} is in alarm.`);
      made = wo.number;
      await notify(env, await roleIds(env, 'manager', 'admin', 'foreman'), wo.id, `${wo.number}: ALARM on ${a.tag} ${p.name}: ${v} ${p.unit || ''}. Job created.`, { urgent: true, sms: a.criticality === 'A' });
    }
  } else if (status === 'warn') await notify(env, await roleIds(env, 'foreman', 'manager'), null, `Warning: ${a.tag} ${p.name} read ${v} ${p.unit || ''} (warning limit ${p.warn}). Watch the trend.`, { kind: 'cm', url: '/#/cm' });
  return { status, job: made };
}
on('POST', '/cm/readings', async ({ env, user, body }) => {
  need(user, ...STAFF);
  const p = await one(env.DB, 'SELECT * FROM cm_points WHERE id=? AND active=1', numOr(body.point_id));
  if (!p) fail(404, 'Measurement point not found.');
  const v = numOr(body.value); if (v == null) fail(400, 'Enter the reading.');
  return json(await cmReading(env, user, p, v, str(body.note, 300), numOr(body.wo_id)));
});

/* TPM: operator checks by QR, fault tags, OEE */
async function assetByToken(env, token) {
  if (!/^[a-f0-9]{24}$/.test(String(token))) fail(404, 'This QR code is not valid.');
  const a = await one(env.DB, 'SELECT a.*, s.name AS site, s.client_id, c.name AS client FROM assets a JOIN sites s ON s.id=a.site_id JOIN clients c ON c.id=s.client_id WHERE a.qr_token=?', token);
  if (!a) fail(404, 'This QR code is not valid any more.');
  return a;
}
async function tpmItems(env, a) {
  const items = await all(env.DB, 'SELECT * FROM tpm_items WHERE asset_id=? ORDER BY sort, id', a.id);
  return items.length ? items : (TPM_DEFAULT[a.discipline] || TPM_DEFAULT.Mechanical).map((item, i) => ({ id: 'd' + i, item }));
}
on('GET', '/public/tpm/:token', async ({ env, params }) => {
  const a = await assetByToken(env, params.token);
  const s = await publicSettings(env, null);
  return json({ asset: { tag: a.tag, name: a.name, site: a.site, client: a.client, discipline: a.discipline, run_hours: a.run_hours }, items: (await tpmItems(env, a)).map((i) => ({ id: i.id, item: i.item })),
    today: await all(env.DB, 'SELECT operator, shift, issues, created_at FROM tpm_logs WHERE asset_id=? AND date=? ORDER BY id DESC', a.id, today()),
    faults: await all(env.DB, `SELECT number, title, status, created_at FROM work_orders WHERE asset_id=? AND type='TPM / operator fault' AND status NOT IN ('closed','cancelled') ORDER BY id DESC LIMIT 5`, a.id),
    brand: { company: s.company, short: s.short, logo: s.logo, color: s.color } });
});
async function tpmRate(env, a) {
  const since = new Date(Date.now() - 3600e3).toISOString().replace(/\.\d+Z$/, 'Z');
  const n = (await one(env.DB, `SELECT (SELECT COUNT(*) FROM tpm_logs WHERE asset_id=? AND created_at >= ?) + (SELECT COUNT(*) FROM oee_logs WHERE asset_id=? AND created_at >= ?) + (SELECT COUNT(*) FROM work_orders WHERE asset_id=? AND type='TPM / operator fault' AND requested_by IS NULL AND created_at >= ?) AS n`, a.id, since, a.id, since, a.id, since)).n;
  if (n >= 20) fail(429, 'Too many submissions for this machine. Try again later.');
}
on('POST', '/public/tpm/:token', async ({ env, params, body }) => {
  const a = await assetByToken(env, params.token);
  await tpmRate(env, a);
  const operator = str(body.operator, 80); if (operator.length < 2) fail(400, 'Enter your name.');
  const items = await tpmItems(env, a);
  const results = (Array.isArray(body.results) ? body.results : []).slice(0, 60).map((r) => ({ id: String(r.id), ok: r.ok === true, note: str(r.note, 300) }));
  const missing = items.filter((i) => !results.some((r) => r.id === String(i.id)));
  if (missing.length && !body.fault_only) fail(400, 'Answer every check (OK or Problem).');
  const bad = results.filter((r) => !r.ok);
  const meter = numOr(body.hour_meter);
  if (!body.fault_only) await run(env.DB, 'INSERT INTO tpm_logs (asset_id, operator, shift, date, results, issues, hour_meter) VALUES (?,?,?,?,?,?,?)', a.id, operator, oneOf(body.shift, ['Day', 'Night', 'Morning', 'Afternoon'], 'Day'), today(), JSON.stringify(results.map((r) => ({ ...r, item: (items.find((i) => String(i.id) === r.id) || {}).item }))), bad.length, meter);
  if (meter != null && meter > 0) { await run(env.DB, 'UPDATE assets SET run_hours=? WHERE id=? AND (run_hours IS NULL OR run_hours < ?)', meter, a.id, meter); }
  const fault = str(body.fault, 1000);
  let number = null;
  if (bad.length || fault) {
    const desc = [fault, ...bad.map((r) => `Problem: ${(items.find((i) => String(i.id) === r.id) || {}).item}${r.note ? ' (' + r.note + ')' : ''}`)].filter(Boolean).join('\n');
    const wo = await createWO(env, { id: null }, { client_id: a.client_id, site_id: a.site_id, asset_id: a.id, discipline: a.discipline || 'Mechanical', type: 'TPM / operator fault', priority: body.urgent ? 'Urgent' : 'Normal', title: `Operator fault tag · ${a.tag}${fault ? ': ' + fault.slice(0, 60) : ''}`, description: `Raised by operator ${operator} from the machine QR code.\n${desc}`, status: 'requested', foreman_id: null, lead_id: null, due_date: null, scheduled_date: null, est_hours: null, quote: null });
    await log(env, wo, null, 'created', `Fault tag raised by operator ${operator} from the machine QR code.`);
    const photo = String(body.photo || '');
    if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo) && photo.length < 900000) await run(env.DB, 'INSERT INTO photos (wo_id, caption, stage, data) VALUES (?,?,?,?)', wo.id, 'Operator photo', 'Defect', photo);
    await notify(env, await roleIds(env, 'manager', 'admin', 'foreman'), wo.id, `${wo.number}: ${body.urgent ? 'URGENT ' : ''}fault tag on ${a.tag} from operator ${operator}: ${desc.split('\n')[0].slice(0, 120)}`, { urgent: !!body.urgent, sms: !!body.urgent });
    number = wo.number;
  }
  return json({ ok: true, fault: number, issues: bad.length }, 201);
});
on('POST', '/public/oee/:token', async ({ env, params, body }) => {
  const a = await assetByToken(env, params.token);
  await tpmRate(env, a);
  const operator = str(body.operator, 80); if (operator.length < 2) fail(400, 'Enter your name.');
  const planned = numOr(body.planned_min), down = numOr(body.downtime_min, 0), rateU = numOr(body.ideal_rate), total = numOr(body.total_units), good = numOr(body.good_units);
  if (!(planned > 0) || down < 0 || down > planned) fail(400, 'Check planned time and downtime (minutes).');
  if (!(rateU > 0) || total == null || good == null || good > total || total < 0) fail(400, 'Check the speed and the number of units made and good.');
  await run(env.DB, 'INSERT INTO oee_logs (asset_id, date, shift, planned_min, downtime_min, ideal_rate, total_units, good_units, operator) VALUES (?,?,?,?,?,?,?,?,?)', a.id, dateOr(body.date) || today(), oneOf(body.shift, ['Day', 'Night', 'Morning', 'Afternoon'], 'Day'), planned, down, rateU, total, good, operator);
  const A = (planned - down) / planned, P = Math.min(1, total / Math.max(1e-9, (planned - down) * rateU)), Q = total ? good / total : 0;
  return json({ availability: r1(A * 100), performance: r1(P * 100), quality: r1(Q * 100), oee: r1(A * P * Q * 100) }, 201);
});
on('GET', '/tpm', async ({ env, user }) => {
  need(user, ...SUPERVISE);
  const assets = await all(env.DB, `SELECT a.id, a.tag, a.name, a.discipline, a.criticality, a.qr_token, a.run_hours, s.name AS site, c.name AS client,
    (SELECT COUNT(*) FROM tpm_logs l WHERE l.asset_id=a.id AND l.date >= ?) AS checks_7, (SELECT MAX(date) FROM tpm_logs l WHERE l.asset_id=a.id) AS last_check,
    (SELECT COALESCE(SUM(issues),0) FROM tpm_logs l WHERE l.asset_id=a.id AND l.date >= ?) AS issues_30,
    (SELECT COUNT(*) FROM tpm_items i WHERE i.asset_id=a.id) AS own_items
    FROM assets a JOIN sites s ON s.id=a.site_id JOIN clients c ON c.id=s.client_id ORDER BY c.name, a.tag`, addDays(today(), -6), addDays(today(), -30));
  const logs = await all(env.DB, 'SELECT l.*, a.tag FROM tpm_logs l JOIN assets a ON a.id=l.asset_id ORDER BY l.id DESC LIMIT 40');
  const oee = await all(env.DB, 'SELECT o.*, a.tag FROM oee_logs o JOIN assets a ON a.id=o.asset_id ORDER BY o.id DESC LIMIT 40');
  return json({ assets, logs: logs.map((l) => ({ ...l, results: JSON.parse(l.results || '[]') })), oee, defaults: TPM_DEFAULT });
});
on('POST', '/tpm', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  const a = await one(env.DB, 'SELECT * FROM assets WHERE id=?', numOr(body.asset_id));
  if (!a) fail(404, 'Machine not found.');
  if (body.qr) { const tok = a.qr_token && !body.renew ? a.qr_token : randHex(12); await run(env.DB, 'UPDATE assets SET qr_token=? WHERE id=?', tok, a.id); return json({ token: tok }); }
  if (Array.isArray(body.items)) {
    const items = body.items.map((x) => str(x, 160)).filter(Boolean).slice(0, 40);
    await env.DB.batch([env.DB.prepare('DELETE FROM tpm_items WHERE asset_id=?').bind(a.id), ...items.map((it, i) => env.DB.prepare('INSERT INTO tpm_items (asset_id, item, sort) VALUES (?,?,?)').bind(a.id, it, i))]);
    return json({ ok: true, count: items.length });
  }
  fail(400, 'Nothing to change.');
});

/* projects */
async function projectFull(env, p) {
  const s = await settings(env), rate = Number(s.labour_rate) || 0;
  const wos = await all(env.DB, WO_LIST_SQL + ' WHERE w.project_id=? ORDER BY COALESCE(w.scheduled_date, w.due_date, w.created_at)', p.id);
  for (const w of wos) w.mat = (await one(env.DB, 'SELECT COALESCE(SUM(qty*unit_cost),0) m FROM materials WHERE wo_id=?', w.id)).m;
  const ms = await all(env.DB, `SELECT * FROM project_milestones WHERE project_id=? ORDER BY COALESCE(due, '9999'), sort, id`, p.id);
  const costs = await all(env.DB, 'SELECT k.*, u.name AS by_name FROM project_costs k LEFT JOIN users u ON u.id=k.user_id WHERE project_id=? ORDER BY date DESC, id DESC', p.id);
  const labour = r2(wos.reduce((a, w) => a + w.hours * rate, 0)), parts = r2(wos.reduce((a, w) => a + w.mat, 0)), other = r2(costs.reduce((a, c) => a + c.amount, 0));
  const done = (st) => ['completed', 'reviewed', 'approved', 'sent', 'closed'].includes(st);
  const tw = ms.reduce((a, m) => a + (m.weight || 1), 0);
  const progress = ms.length ? Math.round(ms.filter((m) => m.done_at).reduce((a, m) => a + (m.weight || 1), 0) / tw * 100) : wos.filter((w) => w.status !== 'cancelled').length ? Math.round(wos.filter((w) => done(w.status)).length / wos.filter((w) => w.status !== 'cancelled').length * 100) : 0;
  const spent = r2(labour + parts + other);
  return { ...p, wos, milestones: ms, costs, labour, parts, other, spent, progress, budget_left: p.budget != null ? r2(p.budget - spent) : null, budget_pct: p.budget ? Math.round(spent / p.budget * 100) : null, hours: r1(wos.reduce((a, w) => a + w.hours, 0)) };
}
on('GET', '/projects', async ({ env, user }) => {
  need(user);
  const where = user.role === 'client' ? ' WHERE p.client_id=' + Number(user.client_id || -1) : user.role === 'tech' ? ' WHERE EXISTS (SELECT 1 FROM work_orders w WHERE w.project_id=p.id AND (w.lead_id=' + Number(user.id) + ' OR EXISTS (SELECT 1 FROM wo_team t WHERE t.wo_id=w.id AND t.user_id=' + Number(user.id) + ')))' : '';
  const rows = await all(env.DB, `SELECT p.*, c.name AS client, s.name AS site, u.name AS manager FROM projects p LEFT JOIN clients c ON c.id=p.client_id LEFT JOIN sites s ON s.id=p.site_id LEFT JOIN users u ON u.id=p.manager_id${where} ORDER BY p.status='done', p.id DESC`);
  const out = []; for (const p of rows) { const f = await projectFull(env, p); out.push({ ...f, wos: undefined, costs: undefined, milestones: undefined, jobs: f.wos.length, ms_total: f.milestones.length, ms_done: f.milestones.filter((m) => m.done_at).length }); }
  return json({ items: out });
});
on('GET', '/projects/:id', async ({ env, user, params }) => {
  need(user);
  const p = await one(env.DB, `SELECT p.*, c.name AS client, c.logo AS client_logo, s.name AS site, u.name AS manager FROM projects p LEFT JOIN clients c ON c.id=p.client_id LEFT JOIN sites s ON s.id=p.site_id LEFT JOIN users u ON u.id=p.manager_id WHERE p.id=?`, Number(params.id) || 0);
  if (!p || (user.role === 'client' && p.client_id !== user.client_id)) fail(404, 'Project not found.');
  const f = await projectFull(env, p);
  if (user.role === 'client') { delete f.costs; delete f.labour; delete f.parts; delete f.other; delete f.spent; delete f.budget; delete f.budget_left; delete f.budget_pct; }
  return json({ item: f, settings: await publicSettings(env, null) });
});
on('POST', '/projects', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  const name = str(body.name, 160); if (!name) fail(400, 'Name the project.');
  const cid = numOr(body.client_id); if (!cid || !(await one(env.DB, 'SELECT id FROM clients WHERE id=?', cid))) fail(400, 'Choose the client.');
  const f = [name, cid, numOr(body.site_id), numOr(body.manager_id), dateOr(body.start_date), dateOr(body.end_date), numOr(body.budget), oneOf(body.status, ['planning', 'active', 'on_hold', 'done', 'cancelled'], 'planning'), str(body.description, 3000), str(body.client_ref, 80)];
  if (body.id) { await run(env.DB, 'UPDATE projects SET name=?, client_id=?, site_id=?, manager_id=?, start_date=?, end_date=?, budget=?, status=?, description=?, client_ref=? WHERE id=?', ...f, Number(body.id)); return json({ id: Number(body.id) }); }
  const ym = today().slice(2, 7).replace('-', ''), last = await one(env.DB, 'SELECT number FROM projects WHERE number LIKE ? ORDER BY id DESC LIMIT 1', `PRJ-${ym}-%`);
  const number = `PRJ-${ym}-${String(last ? parseInt(last.number.split('-')[2], 10) + 1 : 1).padStart(2, '0')}`;
  const r = await run(env.DB, 'INSERT INTO projects (name, client_id, site_id, manager_id, start_date, end_date, budget, status, description, client_ref, number) VALUES (?,?,?,?,?,?,?,?,?,?,?)', ...f, number);
  await audit(env, user, 'created project', number);
  return json({ id: r.meta.last_row_id, number }, 201);
});
on('POST', '/projects/:id/milestone', async ({ env, user, params, body }) => {
  need(user, ...SUPERVISE);
  const p = await one(env.DB, 'SELECT * FROM projects WHERE id=?', Number(params.id) || 0); if (!p) fail(404, 'Project not found.');
  if (body.id) {
    if (body.remove) await run(env.DB, 'DELETE FROM project_milestones WHERE id=? AND project_id=?', Number(body.id), p.id);
    else if ('done' in body) { await run(env.DB, 'UPDATE project_milestones SET done_at=? WHERE id=? AND project_id=?', body.done ? now() : null, Number(body.id), p.id); if (body.done) { const m = await one(env.DB, 'SELECT name FROM project_milestones WHERE id=?', Number(body.id)); await notify(env, await clientIds(env, p.client_id), null, `${p.number} ${p.name}: milestone reached: ${m.name}`, { url: '/#/projects/' + p.id }); } }
    return json({ ok: true });
  }
  const name = str(body.name, 160); if (!name) fail(400, 'Name the milestone.');
  await run(env.DB, 'INSERT INTO project_milestones (project_id, name, due, weight, sort) VALUES (?,?,?,?,?)', p.id, name, dateOr(body.due), Math.max(1, numOr(body.weight, 1)), Date.now() % 1e6);
  return json({ ok: true }, 201);
});
on('POST', '/projects/:id/cost', async ({ env, user, params, body }) => {
  need(user, ...SUPERVISE);
  const p = await one(env.DB, 'SELECT * FROM projects WHERE id=?', Number(params.id) || 0); if (!p) fail(404, 'Project not found.');
  if (body.remove) { await run(env.DB, 'DELETE FROM project_costs WHERE id=? AND project_id=?', Number(body.remove), p.id); return json({ ok: true }); }
  const amount = numOr(body.amount); if (!(amount > 0)) fail(400, 'Enter the amount.');
  await run(env.DB, 'INSERT INTO project_costs (project_id, date, kind, amount, note, user_id) VALUES (?,?,?,?,?,?)', p.id, dateOr(body.date) || today(), oneOf(body.kind, ['Subcontractor', 'Equipment hire', 'Transport', 'Materials (bought direct)', 'Other'], 'Other'), amount, str(body.note, 300), user.id);
  return json({ ok: true }, 201);
});

/* ---------- entry ---------- */
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const method = request.method.toUpperCase();
  const secure = url.protocol === 'https:';
  try {
    if (!env.DB) fail(503, 'The database is not connected yet.');
    if (method !== 'GET' && method !== 'HEAD') {
      if (!(request.headers.get('content-type') || '').includes('application/json')) fail(415, 'Send JSON.');
      const origin = request.headers.get('origin');
      if (origin && new URL(origin).host !== url.host) fail(403, 'Cross-site request blocked.');
    }
    for (const r of routes) {
      if (r.method !== method) continue;
      const m = path.match(r.re);
      if (!m) continue;
      let body = {};
      if (method === 'POST') { try { body = await request.json(); } catch { body = {}; } if (!body || typeof body !== 'object') body = {}; }
      const user = await currentUser(env, request);
      return await r.handler({ env, req: request, url, body, user, params: m.groups || {}, secure });
    }
    return json({ error: 'Not found.' }, 404);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: 'Something went wrong on our side. Please try again.' }, 500);
  }
}
