/* Trades, industry & services */
window.__SYS.push({
  id: 'jobcard', name: 'JobCard', tag: 'Garage & workshop', group: 'Trades, industry & services', icon: 'wrench', color: '#374151', color2: '#f59e0b',
  org: { name: 'Precision Auto Clinic', place: 'Graniteside, Harare', phone: '+263 242 771 305' },
  blurb: 'Job cards, quotes, parts, mechanics and invoices for garages, panel beaters and workshops.',
  headline: 'Every car in the workshop tracked from booking to collection.',
  features: ['Job cards on a workshop board', 'Quotes the customer approves before work starts', 'Parts stock used on each job', 'Mechanic jobs and labour hours'],
  roles: [
    ['owner', 'Workshop owner', 'Mr Itai Chinembiri', 'Jobs, parts and money', ['dash', 'jobs', 'customers', 'parts', 'reports']],
    ['service', 'Service advisor', 'Ms Rangarirai Mutasa', 'Book jobs, quote, invoice', ['jobs', 'customers', 'parts:r']],
    ['mech', 'Mechanic', 'Tinotenda Mhembere', 'Own jobs only', ['jobs'], { jobs: 'mechanic=Tinotenda' }]
  ],
  tables: {
    jobs: {
      label: 'Job cards', icon: 'clipboard', code: 'JC', one: 'job card', addLabel: 'Open job card', board: 'default', desc: 'Vehicles in the workshop, moved along as work is done.',
      fields: 'date:Booked in:date|reg:Reg number|vehicle:Vehicle|customer:Customer:ref:customers.name|problem:Work needed|mechanic:Mechanic:sel:Tinotenda,Farai,Alois|parts:Parts:money|labour:Labour:money|total:Total:=money|status:Status:status:Booked~info,Quoted~warn,In the bay~warn,Waiting parts~bad,Ready~ok,Collected~grey',
      calc: { total: (r) => (+r.parts || 0) + (+r.labour || 0) },
      card: ['vehicle', 'problem', 'mechanic'], print: 'Print invoice',
      rows: [['d0', 'AEZ 4410', 'Toyota Hilux GD-6', 'Mr Owen Matsika', 'Major service', 'Tinotenda', 180, 120, 'In the bay'], ['d0', 'AFD 1932', 'Honda Fit', 'Ms Linda Sibanda', 'Brake pads & discs', 'Farai', 95, 40, 'Quoted'], ['d-1', 'ADH 7720', 'Mazda BT-50', 'Kopje Properties', 'Clutch replacement', 'Alois', 320, 150, 'Waiting parts'], ['d-1', 'ACK 3398', 'Toyota Aqua', 'Mr Brian Hove', 'Hybrid battery check', 'Tinotenda', 0, 35, 'Ready'], ['d0', 'AFP 8810', 'Nissan X-Trail', 'Mrs Grace Kandawasvika', 'Engine light on', 'Farai', 0, 0, 'Booked'], ['d-3', 'AEB 5521', 'Isuzu D-Max', 'Kopje Properties', 'Suspension bushes', 'Alois', 140, 90, 'Collected'], ['d-30', 'AEZ 4410', 'Toyota Hilux GD-6', 'Mr Owen Matsika', 'Tyres x4', 'Tinotenda', 560, 40, 'Collected'], ['d-62', 'ACK 3398', 'Toyota Aqua', 'Mr Brian Hove', 'Service', 'Farai', 75, 50, 'Collected']]
    },
    customers: {
      label: 'Customers', icon: 'users', one: 'customer', desc: 'Customers and their cars.',
      fields: 'name:Customer|phone:Phone:tel|cars:Vehicles|spent:Spent:=money|type:Type:sel:Private,Company fleet',
      calc: { spent: (r, H) => H.where('jobs', 'customer=' + r.name + '&status=Collected').reduce((a, j) => a + (+j.parts || 0) + (+j.labour || 0), 0) },
      related: [['jobs', 'customer', 'Job history', ['date', 'reg', 'problem', 'status']]],
      rows: [['Mr Owen Matsika', '0772 330 118', 'AEZ 4410 Hilux', 'Private'], ['Ms Linda Sibanda', '0773 208 664', 'AFD 1932 Fit', 'Private'], ['Kopje Properties', '0242 339 140', 'ADH 7720, AEB 5521', 'Company fleet'], ['Mr Brian Hove', '0712 553 908', 'ACK 3398 Aqua', 'Private'], ['Mrs Grace Kandawasvika', '0784 118 220', 'AFP 8810 X-Trail', 'Private']]
    },
    parts: {
      label: 'Parts stock', icon: 'box', one: 'part', desc: 'Parts and consumables on the shelf.',
      fields: 'name:Part|fits:Fits|qty:Qty:num|reorder:Reorder at:num|cost:Cost:money|price:Sell price:money|status:Status:=status:OK~ok,Order now~bad',
      calc: { status: (r) => +r.qty <= +r.reorder ? 'Order now' : 'OK' },
      rows: [['Oil filter', 'Hilux / Fortuner', 12, 5, 6, 12], ['Engine oil 5W-30 5 L', 'Most', 18, 8, 22, 38], ['Brake pads (front)', 'Honda Fit', 2, 4, 18, 35], ['Clutch kit', 'Mazda BT-50', 0, 1, 210, 290], ['Air filter', 'Hilux', 6, 3, 8, 16], ['Spark plugs (set of 4)', 'Most petrol', 10, 4, 14, 28]]
    }
  },
  dash: {
    quick: [['Open job card', 'jobs', 1]],
    kpis: [['Cars in the workshop', 'count:jobs?status!=Collected', 'num'], ['Ready to collect', 'count:jobs?status=Ready', 'num'], ['Work this month', (H) => H.where('jobs', 'date>=' + H.today.slice(0, 8) + '01').reduce((a, j) => a + (+j.parts || 0) + (+j.labour || 0), 0), 'money'], ['Waiting on parts', 'count:jobs?status=Waiting parts', 'num']],
    alerts: [['jobs?status=Ready', '{n} car{s} ready: call the customer', 'info'], ['jobs?status=Waiting parts', '{n} job{s} waiting for parts', 'bad'], ['parts?status=Order now', '{n} part{s} to reorder', 'warn']],
    charts: [['Workshop income by month', 'month:jobs.date.labour', 'money'], ['Jobs by mechanic', 'by:jobs.mechanic'], ['Jobs by stage', 'by:jobs.status']],
    recent: [['jobs', 'Latest job cards', 5, ['reg', 'vehicle', 'problem', 'status']]]
  }
});

window.__SYS.push({
  id: 'sitebook', name: 'SiteBook', tag: 'Construction projects', group: 'Trades, industry & services', icon: 'hardhat', color: '#92400e', color2: '#fcd34d',
  org: { name: 'Mvura Construction', place: 'Msasa, Harare', phone: '+263 242 487 551' },
  blurb: 'Projects, site diaries, materials requests, payment certificates and labour for builders and contractors.',
  headline: 'Every site, every bag of cement and every certificate under control.',
  features: ['Projects with contract value, invoiced and progress', 'Daily site diary from the site agent\'s phone', 'Materials requests approved before buying', 'Labour and equipment hire tracked per site'],
  roles: [
    ['md', 'Managing director', 'Eng. Patrick Mavhunga', 'All projects and money', ['dash', 'projects', 'diary', 'materials', 'certs', 'reports']],
    ['pm', 'Project manager', 'Ms Rumbidzai Kanhema', 'Projects and approvals', ['projects', 'materials', 'certs', 'diary:r']],
    ['agent', 'Site agent', 'Mr Wellington Gwatidzo', 'Diary and requests', ['diary', 'materials'], { diary: 'project=Borrowdale townhouses' }]
  ],
  tables: {
    projects: {
      label: 'Projects', icon: 'building', code: 'MC', one: 'project', desc: 'Contracts with value, progress and money in.',
      fields: 'name:Project|client:Client|site:Site|value:Contract value:money|invoiced:Certified:money|progress:Progress:bar|due:Completion:date|status:Status:status:Tender~info,On site~ok,Behind~bad,Snagging~warn,Complete~grey',
      related: [['certs', 'project', 'Payment certificates', ['date', 'amount', 'status']], ['diary', 'project', 'Site diary', ['date', 'workers', 'work']]],
      rows: [['Borrowdale townhouses', 'Kopje Properties', 'Borrowdale', 480000, 210000, 48, 'd+150', 'On site'], ['Ruwa clinic extension', 'Ministry of Health', 'Ruwa', 260000, 190000, 70, 'd+40', 'Behind'], ['Msasa warehouse', 'Zambezi Logistics', 'Msasa', 320000, 300000, 95, 'd+10', 'Snagging'], ['Chitungwiza school block', 'Chitungwiza Municipality', 'Unit L', 150000, 0, 0, 'd+260', 'Tender']]
    },
    diary: {
      label: 'Site diary', icon: 'book', code: 'SD', one: 'diary entry', addLabel: 'Write today\'s diary', desc: 'Daily record from each site.',
      fields: 'date:Date:date|project:Project:ref:projects.name|weather:Weather:sel:Sunny,Cloudy,Rain stopped work,Windy|workers:Workers on site:num|work:Work done:area|issues:Issues',
      rows: [['d0', 'Borrowdale townhouses', 'Sunny', 34, 'Block C ring beam poured; roof trusses delivered.', ''], ['d-1', 'Borrowdale townhouses', 'Rain stopped work', 12, 'Rebar for ring beam.', 'Lost 4 hours to rain'], ['d0', 'Ruwa clinic extension', 'Sunny', 22, 'Plastering ward 2.', 'Plaster sand short'], ['d-2', 'Msasa warehouse', 'Cloudy', 9, 'Snag list items 1 to 14 closed.', '']]
    },
    materials: {
      label: 'Materials requests', icon: 'clipboard', code: 'MR', one: 'request', addLabel: 'Request materials', board: 'default', desc: 'Site requests waiting for approval and delivery.',
      fields: 'date:Date:date|project:Project:ref:projects.name|item:Material|qty:Quantity|cost:Est. cost:money|status:Status:status:Requested~warn,Approved~info,Ordered~info,Delivered~ok,Rejected~bad',
      card: ['project', 'qty', 'cost'],
      rows: [['d0', 'Ruwa clinic extension', 'Plaster sand', '20 t', 560, 'Requested'], ['d0', 'Borrowdale townhouses', 'IBR roof sheets 6 m', '180', 4300, 'Requested'], ['d-1', 'Borrowdale townhouses', 'Cement PPC', '300 bags', 3450, 'Approved'], ['d-3', 'Msasa warehouse', 'Paint (epoxy floor)', '40 L', 900, 'Ordered'], ['d-6', 'Ruwa clinic extension', 'Window frames', '24', 2880, 'Delivered']]
    },
    certs: {
      label: 'Payment certificates', icon: 'receipt', code: 'PC', one: 'certificate', addLabel: 'New certificate', desc: 'Interim certificates claimed and paid.',
      fields: 'date:Date:date|project:Project:ref:projects.name|amount:Amount:money|retention:Retention 5%:=money|net:Net due:=money|status:Status:status:Submitted~warn,Certified~info,Paid~ok',
      calc: { retention: (r) => (+r.amount || 0) * 0.05, net: (r) => (+r.amount || 0) * 0.95 },
      actions: [['Mark certified', 'status=Certified', 'status=Submitted'], ['Mark paid', 'status=Paid', 'status=Certified']],
      rows: [['d-4', 'Borrowdale townhouses', 60000, 'Submitted'], ['d-20', 'Ruwa clinic extension', 45000, 'Certified'], ['d-34', 'Borrowdale townhouses', 80000, 'Paid'], ['d-50', 'Msasa warehouse', 90000, 'Paid'], ['d-80', 'Ruwa clinic extension', 70000, 'Paid'], ['d-110', 'Borrowdale townhouses', 70000, 'Paid']]
    }
  },
  dash: {
    quick: [['Write site diary', 'diary', 1], ['Request materials', 'materials']],
    kpis: [['Work in hand', 'sum:projects.value?status!=Complete,Tender', 'money', 'Contract value'], ['Certified to date', 'sum:projects.invoiced', 'money'], ['Cash owed to us', 'sum:certs.net?status=Submitted,Certified', 'money'], ['Workers on site today', 'sum:diary.workers?date=today', 'num']],
    alerts: [['projects?status=Behind', '{n} project{s} behind programme', 'bad'], ['materials?status=Requested', '{n} materials request{s} to approve', 'warn'], ['certs?status=Certified', '{n} certificate{s} certified, awaiting payment', 'info']],
    charts: [['Certified by month', 'month:certs.date.amount', 'money'], ['Contract value by project', 'sum:projects.name.value', 'money'], ['Requests by stage', 'by:materials.status']],
    recent: [['diary', 'Latest site diary', 4, ['date', 'project', 'workers', 'work']]]
  }
});

window.__SYS.push({
  id: 'plantcare', name: 'PlantCare', tag: 'Maintenance & work orders', group: 'Trades, industry & services', icon: 'gauge', color: '#075985', color2: '#f97316',
  org: { name: 'Shamva Gold Processing Plant', place: 'Shamva', phone: '+263 71 220 9014' },
  blurb: 'Equipment register, planned maintenance, breakdown work orders, spares and downtime for mines, factories and plants.',
  headline: 'Fewer breakdowns, planned maintenance on time, and spares when you need them.',
  features: ['Equipment register by area and criticality', 'Work orders from breakdown to closed', 'Planned maintenance with due dates', 'Spares store with minimum levels'],
  roles: [
    ['eng', 'Engineering manager', 'Eng. Tawanda Mhike', 'Plant reliability', ['dash', 'orders', 'equipment', 'pm', 'spares', 'reports']],
    ['planner', 'Maintenance planner', 'Ms Agnes Chikomba', 'Plan and assign work', ['orders', 'pm', 'equipment:r', 'spares']],
    ['tech', 'Artisan', 'Mr Kudakwashe Rusike', 'Own work orders', ['orders'], { orders: 'tech=Kudakwashe Rusike' }],
    ['ops', 'Operator', 'Mr Joseph Chiwara', 'Report breakdowns', ['orders']]
  ],
  tables: {
    equipment: {
      label: 'Equipment', icon: 'sliders', code: 'EQ', one: 'machine', desc: 'Plant equipment with criticality and running hours.',
      fields: 'name:Equipment|area:Area:sel:Crushing,Milling,CIL tanks,Elution,Tailings,Power|crit:Criticality:sel:A (stops plant),B (slows plant),C (can wait)|hours:Running hours:num|status:Status:status:Running~ok,Down~bad,Standby~grey',
      related: [['orders', 'equipment', 'Work orders', ['date', 'job', 'status']]],
      rows: [['Jaw crusher JC-01', 'Crushing', 'A (stops plant)', 18420, 'Running'], ['Conveyor CV-03', 'Crushing', 'B (slows plant)', 15110, 'Running'], ['Ball mill BM-01', 'Milling', 'A (stops plant)', 21300, 'Running'], ['Slurry pump SP-04', 'Milling', 'A (stops plant)', 9800, 'Down'], ['CIL agitator T3', 'CIL tanks', 'B (slows plant)', 26500, 'Running'], ['Elution heater EH-1', 'Elution', 'B (slows plant)', 7200, 'Standby'], ['Tailings pump TP-02', 'Tailings', 'B (slows plant)', 11030, 'Running'], ['Standby genset 500 kVA', 'Power', 'A (stops plant)', 1240, 'Standby']]
    },
    orders: {
      label: 'Work orders', icon: 'wrench', code: 'WO', one: 'work order', addLabel: 'Raise work order', board: 'default', desc: 'Breakdowns and jobs from raised to closed.',
      fields: 'date:Raised:date|equipment:Equipment:ref:equipment.name|job:Job|type:Type:sel:Breakdown,Planned,Inspection,Improvement|priority:Priority:sel:Urgent,High,Normal|tech:Assigned to:sel:Kudakwashe Rusike,Tendai Mafa,Simon Ndoro,Unassigned|downtime:Downtime (h):num|status:Status:status:Raised~bad,Assigned~warn,In progress~info,Waiting spares~bad,Closed~ok',
      card: ['equipment', 'priority', 'tech'], print: 'Print work order',
      onStatus: (r, H) => { const e = H.find('equipment', 'name', r.equipment); if (e && r.type === 'Breakdown') e.status = r.status === 'Closed' ? 'Running' : 'Down'; },
      defaults: { tech: 'Unassigned' },
      rows: [['d0', 'Slurry pump SP-04', 'Pump seized: replace impeller and bearings', 'Breakdown', 'Urgent', 'Kudakwashe Rusike', 6, 'In progress'], ['d0', 'Conveyor CV-03', 'Belt tracking off, idlers noisy', 'Inspection', 'High', 'Unassigned', 0, 'Raised'], ['d-1', 'Ball mill BM-01', 'Replace liners (planned shutdown)', 'Planned', 'High', 'Simon Ndoro', 0, 'Waiting spares'], ['d-2', 'CIL agitator T3', 'Gearbox oil change', 'Planned', 'Normal', 'Tendai Mafa', 0, 'Assigned'], ['d-4', 'Jaw crusher JC-01', 'Toggle plate cracked', 'Breakdown', 'Urgent', 'Kudakwashe Rusike', 9, 'Closed'], ['d-20', 'Tailings pump TP-02', 'Gland packing leak', 'Breakdown', 'High', 'Tendai Mafa', 3, 'Closed'], ['d-45', 'Jaw crusher JC-01', 'Bearing overheating', 'Breakdown', 'Urgent', 'Kudakwashe Rusike', 14, 'Closed'], ['d-80', 'Ball mill BM-01', 'Motor VSD fault', 'Breakdown', 'Urgent', 'Simon Ndoro', 11, 'Closed']]
    },
    pm: {
      label: 'Planned maintenance', icon: 'calendar', code: 'PM', one: 'PM task', desc: 'Routine maintenance and when it is next due.',
      fields: 'equipment:Equipment:ref:equipment.name|task:Task|every:Every (days):num|last:Last done:date|next:Next due:=text|status:Status:=status:Due soon~warn,Overdue~bad,OK~ok',
      calc: { next: (r, H) => H.addDays(+r.every || 0, r.last), status: (r, H) => { const n = H.addDays(+r.every || 0, r.last); return n < H.today ? 'Overdue' : H.days(H.today, n) <= 7 ? 'Due soon' : 'OK'; } },
      actions: [['Done today', 'last=today', '', 'Maintenance logged']],
      rows: [['Ball mill BM-01', 'Grease trunnion bearings', 7, 'd-8'], ['Jaw crusher JC-01', 'Check toggle and tension rod', 14, 'd-10'], ['Standby genset 500 kVA', 'Test run under load', 30, 'd-12'], ['Slurry pump SP-04', 'Check gland and impeller wear', 30, 'd-40'], ['CIL agitator T3', 'Gearbox oil sample', 90, 'd-20']]
    },
    spares: {
      label: 'Spares store', icon: 'box', one: 'spare', desc: 'Critical spares with minimum stock.',
      fields: 'name:Spare|part:Part number|for:Used on|qty:In stock:num|min:Minimum:num|cost:Unit cost:money|status:Status:=status:OK~ok,Below minimum~bad',
      calc: { status: (r) => +r.qty < +r.min ? 'Below minimum' : 'OK' },
      rows: [['Impeller 8x6', 'WAR-8X6-IMP', 'Slurry pump SP-04', 0, 1, 1850], ['Bearing 22222 EK', 'SKF-22222EK', 'Ball mill, pumps', 4, 2, 420], ['Mill liners (set)', 'ML-BM01-SET', 'Ball mill BM-01', 0, 1, 26000], ['Conveyor idler 127 mm', 'IDL-127', 'Conveyors', 14, 10, 38], ['Toggle plate', 'JC-TP-900', 'Jaw crusher JC-01', 1, 1, 960]]
    }
  },
  dash: {
    quick: [['Raise work order', 'orders', 1]],
    kpis: [['Open work orders', 'count:orders?status!=Closed', 'num'], ['Equipment down', 'count:equipment?status=Down', 'num'], ['Downtime (30 days)', 'sum:orders.downtime?date>=d-30', 'num', 'Hours lost to breakdowns'], ['PM compliance', (H) => H.count('pm', 'status!=Overdue') / Math.max(1, H.count('pm')) * 100, 'pct', 'Planned tasks on time']],
    alerts: [['equipment?status=Down&crit~A', '{n} critical machine{s} down: plant at risk', 'bad'], ['orders?status=Raised', '{n} work order{s} not yet assigned', 'warn'], ['pm?status=Overdue', '{n} planned task{s} overdue', 'bad'], ['spares?status=Below minimum', '{n} critical spare{s} below minimum', 'warn']],
    charts: [['Downtime hours by month', 'month:orders.date.downtime', 'num'], ['Work orders by type', 'by:orders.type'], ['Downtime by equipment', 'sum:orders.equipment.downtime', 'num']],
    recent: [['orders', 'Latest work orders', 5, ['date', 'equipment', 'job', 'status']]]
  }
});

window.__SYS.push({
  id: 'guardian', name: 'Guardian', tag: 'Security company', group: 'Trades, industry & services', icon: 'shield', color: '#1e293b', color2: '#3b82f6',
  org: { name: 'Sentinel Guard Services', place: 'Eastlea, Harare', phone: '+263 242 776 112' },
  blurb: 'Client sites, guard roster, attendance, incidents, patrols and monthly billing for security companies.',
  headline: 'Every post manned, every incident logged and every client billed.',
  features: ['Client sites with guards needed per shift', 'Shift roster with present, late and absent', 'Incident reports from the post', 'Monthly invoices per site'],
  roles: [
    ['ops', 'Operations manager', 'Mr Tinashe Chirwa', 'All sites and billing', ['dash', 'roster', 'incidents', 'sites', 'guards', 'reports']],
    ['super', 'Supervisor', 'Mr Ezra Mutandwa', 'Roster and incidents', ['roster', 'incidents', 'guards:r']],
    ['client', 'Client view', 'Mrs Rose Chanakira', 'Own site only', ['roster:r', 'incidents:r'], { roster: 'site=Avondale Shopping Centre', incidents: 'site=Avondale Shopping Centre' }]
  ],
  tables: {
    sites: {
      label: 'Client sites', icon: 'building', one: 'site', desc: 'Sites guarded with monthly fee.',
      fields: 'name:Site|client:Client|guards:Guards per shift:num|fee:Monthly fee:money|contractEnd:Contract ends:date|status:Status:status:Active~ok,Notice given~warn',
      rows: [['Avondale Shopping Centre', 'Avondale Properties', 4, 2800, 'd+240', 'Active'], ['Graniteside warehouse', 'Zambezi Logistics', 2, 1300, 'd+90', 'Active'], ['Borrowdale residence', 'Mr & Mrs Chikowore', 1, 650, 'd+30', 'Notice given'], ['Msasa factory', 'Superior Plastics', 3, 2100, 'd+400', 'Active']]
    },
    guards: {
      label: 'Guards', icon: 'users', code: 'SG', one: 'guard', desc: 'Guards with grade and certificate expiry.',
      fields: 'name:Guard|grade:Grade:sel:Guard,Senior guard,Dog handler,Supervisor|site:Posted to:ref:sites.name|phone:Phone:tel|cert:Certificate expires:date|status:Status:=status:On duty~ok,Certificate expiring~warn,Certificate expired~bad',
      calc: { status: (r, H) => r.cert < H.today ? 'Certificate expired' : H.days(H.today, r.cert) <= 30 ? 'Certificate expiring' : 'On duty' },
      rows: [['Mr Blessing Chikwanha', 'Senior guard', 'Avondale Shopping Centre', '0772 118 553', 'd+200'], ['Mr Simba Mhlanga', 'Guard', 'Avondale Shopping Centre', '0773 904 221', 'd+20'], ['Ms Faith Nyoni', 'Guard', 'Graniteside warehouse', '0712 662 118', 'd+150'], ['Mr Lameck Banda', 'Dog handler', 'Msasa factory', '0784 553 330', 'd-5'], ['Mr Tobias Shoko', 'Guard', 'Borrowdale residence', '0775 202 664', 'd+300'], ['Mr Prince Dube', 'Guard', 'Msasa factory', '0778 118 904', 'd+90']]
    },
    roster: {
      label: 'Roster & attendance', icon: 'clipboard', code: 'SH', one: 'shift', addLabel: 'Add shift', desc: 'Shifts by site with attendance.',
      fields: 'date:Date:date|site:Site:ref:sites.name|guard:Guard:ref:guards.name|shift:Shift:sel:Day 06:00–18:00,Night 18:00–06:00|status:Attendance:status:Scheduled~info,Present~ok,Late~warn,Absent~bad',
      actions: [['Mark present', 'status=Present', 'status=Scheduled'], ['Mark late', 'status=Late', 'status=Scheduled'], ['Mark absent', 'status=Absent', 'status=Scheduled']],
      rows: [['d0', 'Avondale Shopping Centre', 'Mr Blessing Chikwanha', 'Day 06:00–18:00', 'Present'], ['d0', 'Avondale Shopping Centre', 'Mr Simba Mhlanga', 'Day 06:00–18:00', 'Late'], ['d0', 'Graniteside warehouse', 'Ms Faith Nyoni', 'Day 06:00–18:00', 'Present'], ['d0', 'Msasa factory', 'Mr Lameck Banda', 'Night 18:00–06:00', 'Scheduled'], ['d0', 'Msasa factory', 'Mr Prince Dube', 'Night 18:00–06:00', 'Scheduled'], ['d0', 'Borrowdale residence', 'Mr Tobias Shoko', 'Night 18:00–06:00', 'Scheduled'], ['d-1', 'Msasa factory', 'Mr Prince Dube', 'Night 18:00–06:00', 'Absent'], ['d-1', 'Avondale Shopping Centre', 'Mr Simba Mhlanga', 'Day 06:00–18:00', 'Present']]
    },
    incidents: {
      label: 'Incidents', icon: 'alert', code: 'INC', one: 'incident', addLabel: 'Report incident', desc: 'Incidents reported from sites.',
      fields: 'date:Date:date|site:Site:ref:sites.name|type:Type:sel:Theft,Attempted break-in,Trespass,Fire,Injury,Other|details:What happened:area|by:Reported by|status:Status:status:Open~bad,Police notified~warn,Closed~ok',
      defaults: { by: 'me' },
      rows: [['d-1', 'Avondale Shopping Centre', 'Theft', 'Shoplifter stopped at exit with 3 items; handed to shop manager.', 'Mr Blessing Chikwanha', 'Closed'], ['d-2', 'Msasa factory', 'Attempted break-in', 'Fence cut at north corner at 02:10. Dog unit responded.', 'Mr Lameck Banda', 'Police notified'], ['d0', 'Graniteside warehouse', 'Trespass', 'Two men loitering at gate, moved on.', 'Ms Faith Nyoni', 'Open']]
    }
  },
  dash: {
    kpis: [['Guards on duty today', 'count:roster?date=today&status=Present,Late', 'num'], ['Absent or late today', 'count:roster?date=today&status=Absent,Late', 'num'], ['Monthly billing', 'sum:sites.fee', 'money', 'All active sites'], ['Open incidents', 'count:incidents?status!=Closed', 'num']],
    alerts: [['roster?date=today&status=Scheduled', '{n} shift{s} not yet confirmed', 'warn'], ['guards?status=Certificate expired', '{n} guard{s} with an expired certificate', 'bad'], ['incidents?status=Open', '{n} incident{s} still open', 'bad'], ['sites?status=Notice given', '{n} client{s} gave notice', 'warn']],
    charts: [['Incidents by type', 'by:incidents.type'], ['Billing by site', 'sum:sites.name.fee', 'money'], ['Attendance', 'by:roster.status']],
    recent: [['incidents', 'Latest incidents', 4, ['date', 'site', 'type', 'status']]]
  }
});

window.__SYS.push({
  id: 'sunco', name: 'SunCo', tag: 'Solar sales & installations', group: 'Trades, industry & services', icon: 'sun', color: '#a16207', color2: '#0ea5e9',
  org: { name: 'Bright Sun Solar', place: 'Belvedere, Harare', phone: '+263 77 801 4450' },
  blurb: 'Enquiries, site surveys, quotes, installations, panel and battery stock and after-sales service for solar companies.',
  headline: 'From enquiry to switched on, every solar job in one pipeline.',
  features: ['Enquiries pipeline from survey to installed', 'System size and price per job', 'Panels, inverters and batteries in stock', 'Warranty and service visits after install'],
  roles: [
    ['owner', 'Director', 'Mr Prosper Chinoda', 'Sales, jobs and stock', ['dash', 'leads', 'jobs', 'stock', 'service', 'reports']],
    ['sales', 'Sales consultant', 'Ms Natasha Moyo', 'Enquiries and quotes', ['leads', 'stock:r']],
    ['tech', 'Installer', 'Mr Tapiwa Gweshe', 'Installations and service', ['jobs', 'service']]
  ],
  tables: {
    leads: {
      label: 'Enquiries', icon: 'target', code: 'EN', one: 'enquiry', addLabel: 'New enquiry', board: 'default', desc: 'Customers who asked about solar, moved along to a sale.',
      fields: 'date:Date:date|customer:Customer|area:Area|need:Wants to power|kw:Size (kW):num|quote:Quote:money|status:Status:status:New~info,Survey booked~warn,Quoted~warn,Deposit paid~ok,Lost~bad',
      card: ['area', 'kw', 'quote'],
      rows: [['d0', 'Mrs Linda Mabhena', 'Greendale', 'Whole house incl. borehole', 5, 0, 'New'], ['d-1', 'Mr Takunda Shumba', 'Waterfalls', 'Lights, fridge, TV', 3, 0, 'Survey booked'], ['d-3', 'Hilltop Lodge', 'Nyanga', 'Kitchen and 12 rooms', 15, 18500, 'Quoted'], ['d-6', 'Mr Paul Chigumira', 'Marlborough', 'Whole house', 8, 7600, 'Deposit paid'], ['d-12', 'Mrs R. Gondo', 'Mabvuku', 'Lights and phone charging', 1, 950, 'Lost']]
    },
    jobs: {
      label: 'Installations', icon: 'zap', code: 'INS', one: 'installation', addLabel: 'Schedule install', board: true, desc: 'Systems sold and installed.',
      fields: 'date:Install date:date|customer:Customer|kw:Size (kW):num|inverter:Inverter|battery:Battery|price:Price:money|paid:Paid:money|balance:Balance:=money|status:Status:status:Scheduled~warn,Installing~info,Switched on~ok',
      calc: { balance: (r) => (+r.price || 0) - (+r.paid || 0) }, print: 'Print certificate',
      rows: [['d+3', 'Mr Paul Chigumira', 8, 'Deye 8 kW hybrid', '2× 5.12 kWh lithium', 7600, 3800, 'Scheduled'], ['d0', 'Mrs Tendai Mupfumi', 5, 'Growatt 5 kW', '1× 5.12 kWh lithium', 4300, 4300, 'Installing'], ['d-10', 'Kwekwe Accountants', 10, 'Deye 10 kW hybrid', '3× 5.12 kWh lithium', 9800, 9800, 'Switched on'], ['d-40', 'Mr Brian Hove', 3, 'Must 3 kW', '1× 2.4 kWh lithium', 2100, 2100, 'Switched on'], ['d-75', 'Mutapa Clinic', 12, 'Deye 12 kW hybrid', '4× 5.12 kWh lithium', 12400, 12400, 'Switched on']]
    },
    stock: {
      label: 'Stock', icon: 'box', one: 'item', desc: 'Panels, inverters, batteries and parts.',
      fields: 'name:Item|cat:Type:sel:Panel,Inverter,Battery,Mounting,Cable|qty:In stock:num|reorder:Reorder at:num|cost:Cost:money|price:Sell price:money|status:Status:=status:OK~ok,Low~bad',
      calc: { status: (r) => +r.qty <= +r.reorder ? 'Low' : 'OK' },
      rows: [['Jinko 550 W panel', 'Panel', 64, 30, 95, 140], ['Deye 8 kW hybrid inverter', 'Inverter', 2, 3, 1450, 1950], ['Growatt 5 kW inverter', 'Inverter', 5, 2, 780, 1100], ['5.12 kWh lithium battery', 'Battery', 6, 6, 980, 1350], ['Roof mounting kit (4 panels)', 'Mounting', 20, 8, 60, 95], ['PV cable 6 mm (100 m)', 'Cable', 3, 2, 85, 130]]
    },
    service: {
      label: 'Service visits', icon: 'wrench', code: 'SV', one: 'visit', addLabel: 'Book service', desc: 'After-sales checks and warranty call-outs.',
      fields: 'date:Date:date|customer:Customer|reason:Reason:sel:Annual check,Battery not charging,Inverter error,Panel cleaning|tech:Technician|status:Status:status:Booked~warn,Done~ok',
      rows: [['d+1', 'Mutapa Clinic', 'Annual check', 'Mr Tapiwa Gweshe', 'Booked'], ['d0', 'Mr Brian Hove', 'Inverter error', 'Mr Tapiwa Gweshe', 'Booked'], ['d-15', 'Kwekwe Accountants', 'Panel cleaning', 'Mr Tapiwa Gweshe', 'Done']]
    }
  },
  dash: {
    quick: [['New enquiry', 'leads', 1], ['Schedule install', 'jobs']],
    kpis: [['Pipeline value', 'sum:leads.quote?status=Quoted,Survey booked', 'money', 'Quotes out'], ['Sales (90 days)', 'sum:jobs.price?date>=d-90', 'money'], ['kW installed', 'sum:jobs.kw?status=Switched on', 'num', 'Total solar switched on'], ['Balances to collect', 'sum:jobs.balance', 'money']],
    alerts: [['leads?status=New', '{n} new lead{s} to call back', 'warn'], ['stock?status=Low', '{n} stock item{s} low', 'bad'], ['service?status=Booked&date<=today', '{n} service visit{s} today', 'info']],
    charts: [['Install value by month', 'month:jobs.date.price', 'money'], ['Pipeline by stage', 'by:leads.status'], ['Stock on hand by type', 'sum:stock.cat.qty', 'num']],
    recent: [['jobs', 'Installations', 5, ['date', 'customer', 'kw', 'price', 'status']]]
  }
});

window.__SYS.push({
  id: 'casefile', name: 'CaseFile', tag: 'Law firm practice', group: 'Trades, industry & services', icon: 'scale', color: '#1c1917', color2: '#d4a373',
  org: { name: 'Mandizha & Partners Legal Practitioners', place: 'Harare CBD', phone: '+263 242 790 450' },
  blurb: 'Clients, matters, court diary, time and fees, trust deposits and deadlines for law firms and legal departments.',
  headline: 'Never miss a court date, and bill every hour you work.',
  features: ['Matters with court, judge and next date', 'Court diary for the whole firm', 'Time sheets turned into fee notes', 'Trust account deposits per client'],
  roles: [
    ['partner', 'Senior partner', 'Adv. Tafadzwa Mandizha', 'All matters and fees', ['dash', 'diary', 'matters', 'time', 'clients', 'reports']],
    ['assoc', 'Associate', 'Ms Chiedza Nhongo', 'Own matters and time', ['diary', 'matters', 'time'], { matters: 'lawyer=Ms Chiedza Nhongo', time: 'lawyer=Ms Chiedza Nhongo' }],
    ['clerk', 'Legal secretary', 'Mrs Pauline Mhizha', 'Diary and clients', ['diary', 'clients', 'matters:r']]
  ],
  modules: { diary: { type: 'agenda', label: 'Court diary', icon: 'calendar', table: 'matters', date: 'next', time: 'court', title: 'name', sub: 'lawyer', days: 7 } },
  tables: {
    clients: {
      label: 'Clients', icon: 'users', code: 'CL', one: 'client', desc: 'Clients and money held in trust.',
      fields: 'name:Client|type:Type:sel:Individual,Company,Estate|phone:Phone:tel|email:Email:email|trust:Trust balance:money',
      related: [['matters', 'client', 'Matters', ['name', 'type', 'status']]],
      rows: [['Mr Garikai Mazvita', 'Individual', '0772 330 901', 'g.mazvita@mail.example', 1500], ['Zambezi Logistics (Pvt) Ltd', 'Company', '0242 621 773', 'legal@zl.example', 8000], ['Estate Late J. Dube', 'Estate', '0712 448 019', 'dube.estate@mail.example', 22000], ['Mrs Norah Chinyoka', 'Individual', '0784 118 662', 'norah.c@mail.example', 0]]
    },
    matters: {
      label: 'Matters', icon: 'briefcase', code: 'MAT', one: 'matter', addLabel: 'Open matter', desc: 'Every case with the next date.',
      fields: 'name:Matter|client:Client:ref:clients.name|type:Type:sel:Civil claim,Labour,Conveyancing,Estate,Criminal defence,Commercial|court:Court:sel:High Court Harare,Magistrates Court,Labour Court,Supreme Court,No court|lawyer:Lawyer:sel:Adv. Tafadzwa Mandizha,Ms Chiedza Nhongo,Mr Simbarashe Gutu|next:Next date:date|status:Status:status:Open~info,Hearing set~warn,Judgment reserved~warn,Closed~grey',
      related: [['time', 'matter', 'Time recorded', ['date', 'hours', 'amount']]],
      rows: [['Mazvita v ZESA Holdings', 'Mr Garikai Mazvita', 'Civil claim', 'High Court Harare', 'Adv. Tafadzwa Mandizha', 'd+2', 'Hearing set'], ['Zambezi Logistics: unfair dismissal', 'Zambezi Logistics (Pvt) Ltd', 'Labour', 'Labour Court', 'Ms Chiedza Nhongo', 'd+4', 'Hearing set'], ['Estate Late J. Dube', 'Estate Late J. Dube', 'Estate', 'No court', 'Mr Simbarashe Gutu', 'd+9', 'Open'], ['Transfer: Stand 4410 Borrowdale', 'Mrs Norah Chinyoka', 'Conveyancing', 'No court', 'Ms Chiedza Nhongo', 'd0', 'Open'], ['Zambezi Logistics v Kwacha Freight', 'Zambezi Logistics (Pvt) Ltd', 'Commercial', 'High Court Harare', 'Adv. Tafadzwa Mandizha', 'd+6', 'Judgment reserved']]
    },
    time: {
      label: 'Time & fees', icon: 'clock', code: 'TM', one: 'time entry', addLabel: 'Record time', desc: 'Hours worked, turned into fees.',
      fields: 'date:Date:date|matter:Matter:ref:matters.name|lawyer:Lawyer:sel:Adv. Tafadzwa Mandizha,Ms Chiedza Nhongo,Mr Simbarashe Gutu|work:Work done|hours:Hours:num|rate:Rate:money|amount:Fee:=money|status:Status:status:Unbilled~warn,Billed~info,Paid~ok',
      calc: { amount: (r) => (+r.hours || 0) * (+r.rate || 0) },
      actions: [['Bill client', 'status=Billed', 'status=Unbilled'], ['Mark paid', 'status=Paid', 'status=Billed']],
      defaults: { rate: 120 }, print: 'Print fee note',
      rows: [['d0', 'Transfer: Stand 4410 Borrowdale', 'Ms Chiedza Nhongo', 'Drafted deed of transfer', 2.5, 90, 'Unbilled'], ['d-1', 'Mazvita v ZESA Holdings', 'Adv. Tafadzwa Mandizha', 'Heads of argument', 6, 150, 'Unbilled'], ['d-3', 'Zambezi Logistics: unfair dismissal', 'Ms Chiedza Nhongo', 'Witness interviews', 4, 90, 'Unbilled'], ['d-15', 'Zambezi Logistics v Kwacha Freight', 'Adv. Tafadzwa Mandizha', 'Trial (day 2)', 8, 150, 'Billed'], ['d-40', 'Estate Late J. Dube', 'Mr Simbarashe Gutu', 'Inventory and advert', 3, 80, 'Paid'], ['d-70', 'Zambezi Logistics v Kwacha Freight', 'Adv. Tafadzwa Mandizha', 'Trial (day 1)', 8, 150, 'Paid']]
    }
  },
  dash: {
    quick: [['Record time', 'time', 1], ['Open matter', 'matters']],
    kpis: [['Open matters', 'count:matters?status!=Closed', 'num'], ['Court dates this week', 'count:matters?next>=today&next<=d+7&court!=No court', 'num'], ['Unbilled fees', 'sum:time.amount?status=Unbilled', 'money', 'Work not yet billed'], ['Trust money held', 'sum:clients.trust', 'money']],
    alerts: [['matters?next=today', '{n} matter{s} with a date today', 'bad'], ['matters?next>today&next<=d+3', '{n} matter{s} in the next 3 days', 'warn'], ['time?status=Billed&date<d-30', '{n} fee note{s} unpaid after 30 days', 'warn']],
    charts: [['Fees by month', 'month:time.date.amount', 'money'], ['Matters by type', 'by:matters.type'], ['Fees by lawyer', 'sum:time.lawyer.amount', 'money']],
    recent: [['matters', 'Upcoming dates', 5, ['name', 'court', 'next', 'status']]]
  }
});
