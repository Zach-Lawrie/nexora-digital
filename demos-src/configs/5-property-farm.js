/* Property, farming & transport */
window.__SYS.push({
  id: 'imba', name: 'Imba Rentals', tag: 'Property & rentals', group: 'Property, farming & transport', icon: 'key', color: '#9a3412', color2: '#fb923c',
  org: { name: 'Kopje Properties', place: 'Avondale, Harare', phone: '+263 242 339 140' },
  blurb: 'Properties, units, tenants, leases, rent collection, arrears and repairs for landlords and property managers.',
  headline: 'Collect every month\'s rent and keep every tenant happy.',
  features: ['Units with tenants, leases and rent', 'Rent receipts with arrears worked out', 'Repairs from reported to fixed', 'Tenants see their own statement and log repairs'],
  roles: [
    ['landlord', 'Property manager', 'Mr Godfrey Mukwena', 'All properties and money', ['dash', 'units', 'tenants', 'rent', 'repairs', 'reports']],
    ['agent', 'Letting agent', 'Ms Rufaro Chimombe', 'Tenants, rent and repairs', ['tenants', 'rent', 'repairs', 'units:r']],
    ['tenant', 'Tenant portal', 'Mrs Shingai Mapuranga', 'Own rent and repairs', ['rent:r', 'repairs'], { rent: 'tenant=Mrs Shingai Mapuranga', repairs: 'unit=Belgravia Flats 2B' }]
  ],
  tables: {
    units: {
      label: 'Units', icon: 'building', one: 'unit', desc: 'Every flat, house and shop you manage.',
      fields: 'name:Unit|area:Suburb:sel:Avondale,Belgravia,Mabelreign,Eastlea,CBD|type:Type:sel:Flat,House,Cottage,Shop,Office|rent:Monthly rent:money|status:Status:=status:Let~ok,Vacant~warn',
      calc: { status: (r, H) => H.count('tenants', 'unit=' + r.name + '&status!=Moved out') ? 'Let' : 'Vacant' },
      related: [['tenants', 'unit', 'Tenants', ['name', 'leaseEnd', 'status']], ['repairs', 'unit', 'Repairs', ['date', 'issue', 'status']]],
      rows: [['Belgravia Flats 2B', 'Belgravia', 'Flat', 450], ['Belgravia Flats 3A', 'Belgravia', 'Flat', 480], ['Avondale Cottage', 'Avondale', 'Cottage', 350], ['14 Mabelreign Drive', 'Mabelreign', 'House', 800], ['Eastlea Office 5', 'Eastlea', 'Office', 600], ['Julius Nyerere Shop 12', 'CBD', 'Shop', 1100], ['Belgravia Flats 4C', 'Belgravia', 'Flat', 480]]
    },
    tenants: {
      label: 'Tenants', icon: 'users', code: 'TN', one: 'tenant', desc: 'Tenants, leases and what they owe.',
      fields: 'name:Tenant|unit:Unit:ref:units.name|phone:Phone:tel|rent:Rent:money|leaseEnd:Lease ends:date|deposit:Deposit held:money|owing:Owing:=money|status:Status:=status:Paid up~ok,In arrears~bad,Lease ending~warn,Moved out~grey|-moved:Moved out:sel:No,Yes',
      calc: {
        owing: (r, H) => { if (r.moved === 'Yes') return 0; const months = 3; return Math.max(0, months * (+r.rent || 0) - H.sum('rent', 'amount', 'tenant=' + r.name + '&date>=d-' + (30 * months - 15))); },
        status: (r, H) => { if (r.moved === 'Yes') return 'Moved out'; const owing = Math.max(0, 3 * (+r.rent || 0) - H.sum('rent', 'amount', 'tenant=' + r.name + '&date>=d-75')); return owing > 1 ? 'In arrears' : H.days(H.today, r.leaseEnd) <= 60 ? 'Lease ending' : 'Paid up'; }
      },
      actions: [['Tenant moved out', 'moved=Yes', 'status!=Moved out']],
      related: [['rent', 'tenant', 'Rent paid', ['date', 'month', 'amount']]], print: 'Print statement', defaults: { moved: 'No' },
      rows: [['Mrs Shingai Mapuranga', 'Belgravia Flats 2B', '0772 118 330', 450, 'd+200', 450, 'No'], ['Mr Tapiwa Gumbo', 'Belgravia Flats 3A', '0773 662 118', 480, 'd+40', 480, 'No'], ['Ms Nomvula Dube', 'Avondale Cottage', '0712 904 553', 350, 'd+300', 350, 'No'], ['The Banda family', '14 Mabelreign Drive', '0784 553 662', 800, 'd+150', 1600, 'No'], ['Kwekwe Accountants', 'Eastlea Office 5', '0242 790 018', 600, 'd+500', 1200, 'No'], ['Mama\'s Kitchen', 'Julius Nyerere Shop 12', '0775 018 904', 1100, 'd+90', 2200, 'No']]
    },
    rent: {
      label: 'Rent received', icon: 'receipt', code: 'RNT', one: 'payment', addLabel: 'Record rent', desc: 'Rent receipts.',
      fields: 'date:Date:date|tenant:Tenant:ref:tenants.name|month:For month:sel:Nov 2026,Oct 2026,Sep 2026,Aug 2026|amount:Amount:money|method:Method:sel:Bank transfer,EcoCash,Cash USD,ZiG',
      print: 'Print receipt',
      rows: [['d-5', 'Mrs Shingai Mapuranga', 'Nov 2026', 450, 'EcoCash'], ['d-6', 'Ms Nomvula Dube', 'Nov 2026', 350, 'Cash USD'], ['d-8', 'Kwekwe Accountants', 'Nov 2026', 600, 'Bank transfer'], ['d-9', 'Mama\'s Kitchen', 'Nov 2026', 1100, 'Bank transfer'], ['d-10', 'The Banda family', 'Nov 2026', 800, 'Bank transfer'], ['d-36', 'Mrs Shingai Mapuranga', 'Oct 2026', 450, 'EcoCash'], ['d-37', 'Ms Nomvula Dube', 'Oct 2026', 350, 'Cash USD'], ['d-38', 'Kwekwe Accountants', 'Oct 2026', 600, 'Bank transfer'], ['d-38', 'Mama\'s Kitchen', 'Oct 2026', 1100, 'Bank transfer'], ['d-40', 'The Banda family', 'Oct 2026', 800, 'Bank transfer'], ['d-41', 'Mr Tapiwa Gumbo', 'Oct 2026', 480, 'EcoCash'], ['d-66', 'Mrs Shingai Mapuranga', 'Sep 2026', 450, 'EcoCash'], ['d-67', 'Ms Nomvula Dube', 'Sep 2026', 350, 'Cash USD'], ['d-68', 'Kwekwe Accountants', 'Sep 2026', 600, 'Bank transfer'], ['d-69', 'Mama\'s Kitchen', 'Sep 2026', 1100, 'Bank transfer'], ['d-70', 'The Banda family', 'Sep 2026', 800, 'Bank transfer'], ['d-72', 'Mr Tapiwa Gumbo', 'Sep 2026', 480, 'EcoCash'], ['d-98', 'The Banda family', 'Aug 2026', 800, 'Bank transfer'], ['d-128', 'Mama\'s Kitchen', 'Jul 2026', 1100, 'Bank transfer']]
    },
    repairs: {
      label: 'Repairs', icon: 'wrench', code: 'RQ', one: 'repair', addLabel: 'Report a repair', board: 'default', desc: 'Repairs reported by tenants, from reported to fixed.',
      fields: 'date:Reported:date|unit:Unit:ref:units.name|issue:Issue|priority:Priority:sel:Low,Medium,High|contractor:Contractor|cost:Cost:money|status:Status:status:Reported~bad,Booked~warn,Fixed~ok',
      card: ['unit', 'priority', 'contractor'],
      rows: [['d-1', 'Belgravia Flats 2B', 'Geyser leaking', 'High', 'Pipeline Plumbers', 0, 'Reported'], ['d-4', '14 Mabelreign Drive', 'Gate motor not opening', 'Medium', 'Centurion Gates', 120, 'Booked'], ['d-9', 'Julius Nyerere Shop 12', 'Broken window', 'Low', 'Glass Express', 45, 'Fixed'], ['d-20', 'Avondale Cottage', 'Blocked drain', 'Medium', 'Pipeline Plumbers', 60, 'Fixed']]
    }
  },
  dash: {
    quick: [['Record rent', 'rent', 1], ['Report a repair', 'repairs']],
    kpis: [['Occupancy', (H) => H.count('units', 'status=Let') / Math.max(1, H.count('units')) * 100, 'pct', 'Units let'], ['Rent roll', 'sum:tenants.rent?status!=Moved out', 'money', 'Expected each month'], ['Collected this month', (H) => H.sum('rent', 'amount', 'date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Arrears', 'sum:tenants.owing', 'money', 'Owed by tenants']],
    alerts: [['tenants?status=In arrears', '{n} tenant{s} in arrears', 'bad'], ['tenants?status=Lease ending', '{n} lease{s} end within 60 days', 'warn'], ['repairs?status=Reported', '{n} repair{s} not booked yet', 'warn'], ['units?status=Vacant', '{n} unit{s} vacant', 'info']],
    charts: [['Rent collected by month', 'month:rent.date.amount', 'money'], ['Rent by suburb', 'sum:units.area.rent', 'money'], ['Repairs cost by unit', 'sum:repairs.unit.cost', 'money']],
    recent: [['rent', 'Latest rent received', 5, ['date', 'tenant', 'month', 'amount']]]
  }
});

window.__SYS.push({
  id: 'munda', name: 'Munda Farm', tag: 'Farm records', group: 'Property, farming & transport', icon: 'sprout', color: '#3f6212', color2: '#eab308',
  org: { name: 'Mazowe Valley Farm', place: 'Mazowe, Mashonaland Central', phone: '+263 77 610 2234' },
  blurb: 'Fields and crops, livestock, inputs store, farm sales, workers and daily tasks for commercial and smallholder farms.',
  headline: 'Know what every field, animal and bag of fertiliser is making you.',
  features: ['Fields with crop, planting date and expected yield', 'Livestock register with health and weights', 'Inputs store with reorder alerts', 'Sales to GMB, contractors and the market'],
  roles: [
    ['owner', 'Farm owner', 'Mr Kennedy Matare', 'Everything and profit', ['dash', 'fields', 'livestock', 'inputs', 'sales', 'tasks', 'reports']],
    ['mgr', 'Farm manager', 'Mr Clever Zvidzai', 'Field work and stock', ['fields', 'livestock', 'inputs', 'tasks']],
    ['foreman', 'Foreman', 'Mr Silas Gora', 'Daily tasks', ['tasks', 'livestock:r']]
  ],
  tables: {
    fields: {
      label: 'Fields & crops', icon: 'leaf', one: 'field', desc: 'Every field and what is growing in it.',
      fields: 'name:Field|crop:Crop:sel:Maize,Soya beans,Tobacco,Wheat,Potatoes,Fallow|ha:Hectares:num|planted:Planted:date|harvest:Harvest due:date|yield:Expected yield (t):num|status:Status:status:Prepared~info,Growing~ok,Harvesting~warn,Harvested~grey',
      rows: [['Block A (river)', 'Maize', 25, 'd-40', 'd+110', 175, 'Growing'], ['Block B', 'Soya beans', 18, 'd-25', 'd+105', 54, 'Growing'], ['Block C (irrigated)', 'Tobacco', 10, 'd-50', 'd+70', 30, 'Growing'], ['Block D', 'Wheat', 12, 'd-160', 'd-5', 72, 'Harvesting'], ['Block E', 'Potatoes', 4, 'd-100', 'd+5', 100, 'Growing'], ['Block F', 'Fallow', 8, '', '', 0, 'Prepared']]
    },
    livestock: {
      label: 'Livestock', icon: 'cow', code: 'TAG', one: 'animal', desc: 'Cattle, goats and pigs with weight and health.',
      fields: 'name:Tag / name|kind:Animal:sel:Cattle,Goat,Pig,Sheep|breed:Breed|weight:Weight (kg):num|value:Value:money|health:Health:status:Healthy~ok,Under treatment~warn,Sold~grey,Dead~bad',
      rows: [['Bull 01 Shumba', 'Cattle', 'Brahman', 640, 1100, 'Healthy'], ['Cow 14', 'Cattle', 'Mashona', 410, 650, 'Healthy'], ['Cow 22', 'Cattle', 'Mashona', 395, 620, 'Under treatment'], ['Steer 31', 'Cattle', 'Brahman cross', 360, 600, 'Healthy'], ['Goat flock A (x24)', 'Goat', 'Boer', 35, 1440, 'Healthy'], ['Sow 3', 'Pig', 'Large White', 180, 260, 'Healthy']]
    },
    inputs: {
      label: 'Inputs store', icon: 'box', one: 'input', desc: 'Seed, fertiliser, chemicals and fuel in store.',
      fields: 'item:Item|cat:Type:sel:Seed,Fertiliser,Chemicals,Fuel,Feed|qty:In store:num|unit:Unit:sel:bags,litres,kg,packs|reorder:Reorder at:num|cost:Unit cost:money|status:Status:=status:OK~ok,Order now~bad',
      calc: { status: (r) => +r.qty <= +r.reorder ? 'Order now' : 'OK' },
      actions: [['Receive 20 more', (r) => { r.qty = (+r.qty || 0) + 20; }, '', 'Stock received']],
      rows: [['SC 727 maize seed 25 kg', 'Seed', 6, 'bags', 10, 95], ['Compound D 50 kg', 'Fertiliser', 40, 'bags', 20, 38], ['Ammonium nitrate 50 kg', 'Fertiliser', 12, 'bags', 25, 42], ['Diesel', 'Fuel', 850, 'litres', 300, 1.6], ['Dip chemical (Triatix)', 'Chemicals', 4, 'litres', 2, 55], ['Dairy meal 50 kg', 'Feed', 9, 'bags', 10, 22]]
    },
    sales: {
      label: 'Farm sales', icon: 'cash', code: 'FS', one: 'sale', addLabel: 'Record sale', desc: 'Produce and livestock sold.',
      fields: 'date:Date:date|buyer:Buyer:sel:GMB,Contractor (Cottco),Mbare Musika,Butchery,Tobacco auction floor,Local buyers|item:Item|qty:Quantity|amount:Amount:money|status:Status:status:Paid~ok,Awaiting payment~warn',
      rows: [['d-3', 'Mbare Musika', 'Potatoes (early dig)', '8 t', 3200, 'Paid'], ['d-12', 'Butchery', 'Steer 27', '1 head', 640, 'Paid'], ['d-20', 'GMB', 'Wheat', '30 t', 12600, 'Awaiting payment'], ['d-55', 'Local buyers', 'Goats', '6 head', 360, 'Paid'], ['d-140', 'Tobacco auction floor', 'Tobacco', '28 t', 92000, 'Paid'], ['d-100', 'GMB', 'Maize', '160 t', 48000, 'Paid']]
    },
    tasks: {
      label: 'Daily tasks', icon: 'check', one: 'task', addLabel: 'Add task', board: 'default', desc: 'Work for the team today and this week.',
      fields: 'date:Date:date|task:Task|field:Where|team:Team / person|status:Status:status:To do~warn,In progress~info,Done~ok',
      rows: [['d0', 'Top-dress maize with AN', 'Block A (river)', 'Team 1 (8 workers)', 'In progress'], ['d0', 'Dip cattle', 'Kraal', 'Mr Silas Gora', 'To do'], ['d0', 'Combine wheat', 'Block D', 'Tractor driver Tawanda', 'In progress'], ['d+1', 'Spray soya for rust', 'Block B', 'Team 2', 'To do'], ['d-1', 'Repair irrigation pipe', 'Block C (irrigated)', 'Mr Clever Zvidzai', 'Done']]
    }
  },
  dash: {
    quick: [['Add task', 'tasks', 1], ['Record sale', 'sales']],
    kpis: [['Hectares planted', 'sum:fields.ha?crop!=Fallow', 'num', 'Across all blocks'], ['Expected harvest', 'sum:fields.yield', 'num', 'Tonnes this season'], ['Sales this season', 'sum:sales.amount?date>=d-180', 'money'], ['Livestock value', 'sum:livestock.value?health=Healthy,Under treatment', 'money']],
    alerts: [['inputs?status=Order now', '{n} input{s} running low', 'bad'], ['fields?harvest>=today&harvest<=d+14', '{n} field{s} ready to harvest within 2 weeks', 'warn'], ['livestock?health=Under treatment', '{n} animal{s} under treatment', 'warn'], ['sales?status=Awaiting payment', '{n} sale{s} not paid yet', 'info']],
    charts: [['Hectares by crop', 'sum:fields.crop.ha', 'num'], ['Sales by buyer', 'sum:sales.buyer.amount', 'money'], ['Livestock by type', 'by:livestock.kind']],
    recent: [['tasks', 'Today on the farm', 5, ['task', 'field', 'team', 'status']]]
  }
});

window.__SYS.push({
  id: 'fleetline', name: 'FleetLine', tag: 'Fleet & transport', group: 'Property, farming & transport', icon: 'truck', color: '#1e3a8a', color2: '#f97316',
  org: { name: 'Express Haulage', place: 'Workington, Harare', phone: '+263 242 754 020' },
  blurb: 'Vehicles, drivers, trips, fuel, services, licences and breakdowns for haulage, buses and company fleets.',
  headline: 'Every truck earning, serviced on time and legal on the road.',
  features: ['Vehicles with service due, ZINARA licence and insurance expiry', 'Trips with revenue per kilometre', 'Fuel log with cost per truck', 'Breakdowns and repairs on a board'],
  roles: [
    ['fleet', 'Fleet manager', 'Mr Simbarashe Kanyemba', 'Whole fleet and costs', ['dash', 'vehicles', 'trips', 'fuel', 'repairs', 'reports']],
    ['dispatch', 'Dispatcher', 'Ms Monalisa Chingwe', 'Trips and drivers', ['trips', 'vehicles:r']],
    ['driver', 'Driver', 'Mr Takesure Mavhura', 'Own trips and fuel', ['trips:r', 'fuel'], { trips: 'driver=Takesure Mavhura', fuel: 'vehicle=ACX 4471' }]
  ],
  tables: {
    vehicles: {
      label: 'Vehicles', icon: 'truck', one: 'vehicle', desc: 'The fleet with service and legal dates.',
      fields: 'reg:Reg number|type:Type:sel:Horse & trailer,Rigid truck,Bus,Pickup,Car|driver:Driver|km:Odometer:num|serviceKm:Service due at:num|licence:ZINARA licence:date|insurance:Insurance:date|status:Status:=status:On the road~ok,Service due~warn,Papers expiring~warn,Off road~bad|-off:Off road:sel:No,Yes',
      calc: { status: (r, H) => r.off === 'Yes' ? 'Off road' : +r.km >= +r.serviceKm - 1000 ? 'Service due' : (r.licence < H.addDays(30) || r.insurance < H.addDays(30)) ? 'Papers expiring' : 'On the road' },
      related: [['trips', 'vehicle', 'Trips', ['date', 'route', 'km', 'revenue']], ['fuel', 'vehicle', 'Fuel', ['date', 'litres', 'cost']]],
      defaults: { off: 'No' },
      rows: [['ACX 4471', 'Horse & trailer', 'Takesure Mavhura', 412300, 420000, 'd+200', 'd+120', 'No'], ['AEF 2290', 'Horse & trailer', 'Joseph Mutizwa', 288900, 289500, 'd+90', 'd+300', 'No'], ['ABD 7713', 'Rigid truck', 'Philip Ncube', 198200, 210000, 'd+12', 'd+200', 'No'], ['AFK 5502', 'Bus', 'Godknows Sithole', 305400, 315000, 'd+150', 'd+60', 'Yes'], ['ADZ 1188', 'Pickup', 'Ms Lucy Chari', 88100, 95000, 'd+250', 'd+20', 'No']]
    },
    trips: {
      label: 'Trips', icon: 'pin', code: 'TRP', one: 'trip', addLabel: 'Log trip', desc: 'Loads, routes and what each trip earned.',
      fields: 'date:Date:date|vehicle:Vehicle:ref:vehicles.reg|driver:Driver|route:Route:sel:Harare – Beitbridge,Harare – Mutare,Harare – Bulawayo,Harare – Chirundu,Bulawayo – Victoria Falls,Local|customer:Customer|km:Km:num|revenue:Revenue:money|perKm:Per km:=money|status:Status:status:Loading~info,On the road~warn,Delivered~ok',
      calc: { perKm: (r) => r.km ? r.revenue / r.km : 0 },
      actions: [['Mark delivered', 'status=Delivered', 'status!=Delivered']],
      rows: [['d0', 'ACX 4471', 'Takesure Mavhura', 'Harare – Beitbridge', 'Delta Beverages', 580, 1400, 'On the road'], ['d0', 'ABD 7713', 'Philip Ncube', 'Local', 'Bakers Inn', 120, 260, 'Loading'], ['d-2', 'AEF 2290', 'Joseph Mutizwa', 'Harare – Chirundu', 'Zambian Breweries', 350, 1100, 'Delivered'], ['d-4', 'ACX 4471', 'Takesure Mavhura', 'Harare – Mutare', 'Tanganda Tea', 265, 700, 'Delivered'], ['d-9', 'AEF 2290', 'Joseph Mutizwa', 'Harare – Bulawayo', 'National Foods', 440, 1150, 'Delivered'], ['d-35', 'ACX 4471', 'Takesure Mavhura', 'Harare – Beitbridge', 'Delta Beverages', 580, 1400, 'Delivered'], ['d-38', 'ABD 7713', 'Philip Ncube', 'Harare – Mutare', 'Olivine', 265, 650, 'Delivered'], ['d-64', 'AEF 2290', 'Joseph Mutizwa', 'Harare – Chirundu', 'Zambian Breweries', 350, 1100, 'Delivered'], ['d-95', 'ACX 4471', 'Takesure Mavhura', 'Harare – Beitbridge', 'Delta Beverages', 580, 1350, 'Delivered']]
    },
    fuel: {
      label: 'Fuel log', icon: 'fuel', code: 'FL', one: 'fill-up', addLabel: 'Log fuel', desc: 'Diesel and petrol by vehicle.',
      fields: 'date:Date:date|vehicle:Vehicle:ref:vehicles.reg|litres:Litres:num|cost:Cost:money|station:Station|km:Odometer:num',
      rows: [['d0', 'ACX 4471', 320, 512, 'Zuva Msasa', 412300], ['d-2', 'AEF 2290', 210, 336, 'Puma Chirundu', 288700], ['d-4', 'ACX 4471', 180, 288, 'Total Mutare', 411700], ['d-9', 'AEF 2290', 260, 416, 'Zuva Msasa', 288100], ['d-36', 'ACX 4471', 320, 505, 'Zuva Msasa', 409900], ['d-64', 'ABD 7713', 140, 220, 'Engen Workington', 196300]]
    },
    repairs: {
      label: 'Breakdowns & repairs', icon: 'wrench', code: 'JB', one: 'repair', addLabel: 'Report breakdown', board: 'default', desc: 'Breakdowns, services and repairs.',
      fields: 'date:Date:date|vehicle:Vehicle:ref:vehicles.reg|issue:Issue|where:Where|cost:Cost:money|status:Status:status:Reported~bad,In workshop~warn,Waiting parts~info,Back on road~ok',
      card: ['vehicle', 'where', 'cost'],
      rows: [['d-1', 'AFK 5502', 'Gearbox noise', 'Workington yard', 0, 'In workshop'], ['d-3', 'AEF 2290', 'Service 290 000 km', 'Workington yard', 380, 'Reported'], ['d-12', 'ABD 7713', 'Tyre blowout', 'Ruwa', 260, 'Back on road']]
    }
  },
  dash: {
    quick: [['Log trip', 'trips', 1], ['Log fuel', 'fuel']],
    kpis: [['Trips this month', (H) => H.count('trips', 'date>=' + H.today.slice(0, 8) + '01'), 'num'], ['Revenue this month', (H) => H.sum('trips', 'revenue', 'date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Fuel this month', (H) => H.sum('fuel', 'cost', 'date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Vehicles on the road', 'count:vehicles?status!=Off road', 'num']],
    alerts: [['vehicles?status=Service due', '{n} vehicle{s} due for a service', 'warn'], ['vehicles?status=Papers expiring', '{n} vehicle{s} with licence or insurance expiring', 'bad'], ['vehicles?status=Off road', '{n} vehicle{s} off the road', 'bad']],
    charts: [['Trip revenue by month', 'month:trips.date.revenue', 'money'], ['Revenue by vehicle', 'sum:trips.vehicle.revenue', 'money'], ['Fuel cost by vehicle', 'sum:fuel.vehicle.cost', 'money']],
    recent: [['trips', 'Latest trips', 5, ['date', 'vehicle', 'route', 'revenue', 'status']]]
  }
});

window.__SYS.push({
  id: 'tumira', name: 'Tumira', tag: 'Courier & deliveries', group: 'Property, farming & transport', icon: 'box', color: '#c2410c', color2: '#fde047',
  org: { name: 'Swift Parcels Zimbabwe', place: 'Harare, Bulawayo, Mutare', phone: '+263 71 400 7700' },
  blurb: 'Parcel booking, tracking numbers, riders, cash on delivery and branch-to-branch transfers for couriers.',
  headline: 'Book, track and deliver every parcel, and collect every dollar.',
  features: ['Tracking numbers and a parcel board', 'Riders with their delivery runs', 'Cash on delivery collected and banked', 'Customers check the status of their parcel'],
  roles: [
    ['ops', 'Operations manager', 'Mrs Tsitsi Marimo', 'All branches', ['dash', 'parcels', 'riders', 'cod', 'reports']],
    ['counter', 'Counter clerk', 'Mr Batsirai Nhema', 'Book parcels', ['parcels', 'cod:r']],
    ['rider', 'Rider', 'Tafadzwa Kunaka', 'Own deliveries', ['parcels'], { parcels: 'rider=Tafadzwa Kunaka' }]
  ],
  tables: {
    parcels: {
      label: 'Parcels', icon: 'box', code: 'SWP', one: 'parcel', addLabel: 'Book parcel', board: 'default', desc: 'Every parcel from drop-off to delivery.',
      fields: 'date:Booked:date|sender:Sender|receiver:Receiver|to:Destination:sel:Harare,Bulawayo,Mutare,Gweru,Masvingo,Kwekwe|weight:Weight (kg):num|fee:Fee:money|cod:Cash on delivery:money|rider:Rider:ref:riders.name|status:Status:status:Received~info,In transit~warn,Out for delivery~warn,Delivered~ok,Returned~bad',
      card: ['receiver', 'to', 'rider'], print: 'Print waybill',
      rows: [['d0', 'Mr J. Moyo', 'Ms Rudo Phiri', 'Bulawayo', 2.5, 12, 0, 'Sipho Dlamini', 'Received'], ['d0', 'Fashion Hub', 'Mrs A. Chari', 'Harare', 1, 5, 45, 'Tafadzwa Kunaka', 'Out for delivery'], ['d0', 'TechZone', 'Mr L. Banda', 'Harare', 0.8, 5, 320, 'Tafadzwa Kunaka', 'Out for delivery'], ['d-1', 'Mr K. Dube', 'Mr P. Sithole', 'Mutare', 6, 18, 0, 'Brian Chiweshe', 'In transit'], ['d-1', 'Bulawayo Books', 'Ms N. Ncube', 'Gweru', 3, 14, 25, 'Sipho Dlamini', 'In transit'], ['d-2', 'Fashion Hub', 'Ms T. Gumbo', 'Harare', 1.2, 5, 60, 'Tafadzwa Kunaka', 'Delivered'], ['d-3', 'Mrs E. Zhou', 'Mr C. Zhou', 'Masvingo', 10, 25, 0, 'Brian Chiweshe', 'Delivered'], ['d-5', 'TechZone', 'Mr S. Mpofu', 'Kwekwe', 0.5, 10, 150, 'Sipho Dlamini', 'Returned'], ['d-34', 'Fashion Hub', 'Ms R. Hove', 'Harare', 1, 5, 40, 'Tafadzwa Kunaka', 'Delivered'], ['d-60', 'TechZone', 'Mr A. Moyo', 'Bulawayo', 2, 12, 280, 'Sipho Dlamini', 'Delivered']]
    },
    riders: {
      label: 'Riders & drivers', icon: 'bus', one: 'rider', desc: 'Delivery team and how much they delivered.',
      fields: 'name:Rider|phone:Phone:tel|branch:Branch:sel:Harare,Bulawayo,Mutare|bike:Vehicle|delivered:Delivered:=num|status:Status:status:On shift~ok,Off~grey',
      calc: { delivered: (r, H) => H.count('parcels', 'rider=' + r.name + '&status=Delivered') },
      rows: [['Tafadzwa Kunaka', '0772 554 118', 'Harare', 'Honda Ace 125', 'On shift'], ['Sipho Dlamini', '0773 201 902', 'Bulawayo', 'Toyota Probox', 'On shift'], ['Brian Chiweshe', '0712 663 019', 'Mutare', 'Nissan NP200', 'Off']]
    },
    cod: {
      label: 'Cash on delivery', icon: 'cash', code: 'COD', one: 'collection', addLabel: 'Record collection', desc: 'Money collected for sellers and paid out.',
      fields: 'date:Date:date|seller:Seller:sel:Fashion Hub,TechZone,Bulawayo Books|amount:Collected:money|fee:Our fee 5%:=money|payout:To seller:=money|status:Status:status:Collected~warn,Paid to seller~ok',
      calc: { fee: (r) => (+r.amount || 0) * 0.05, payout: (r) => (+r.amount || 0) * 0.95 },
      actions: [['Pay seller', 'status=Paid to seller', 'status=Collected']],
      rows: [['d-2', 'Fashion Hub', 60, 'Collected'], ['d-6', 'TechZone', 410, 'Collected'], ['d-14', 'Fashion Hub', 230, 'Paid to seller'], ['d-34', 'Fashion Hub', 40, 'Paid to seller'], ['d-60', 'TechZone', 280, 'Paid to seller']]
    }
  },
  dash: {
    quick: [['Book parcel', 'parcels', 1]],
    kpis: [['Parcels today', 'count:parcels?date=today', 'num'], ['Out for delivery', 'count:parcels?status=Out for delivery', 'num'], ['Fees this month', (H) => H.sum('parcels', 'fee', 'date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Owed to sellers', 'sum:cod.payout?status=Collected', 'money', 'Cash on delivery']],
    alerts: [['parcels?status=Returned', '{n} parcel{s} returned to sender', 'bad'], ['parcels?status=In transit&date<d-1', '{n} parcel{s} in transit for over a day', 'warn'], ['cod?status=Collected', '{n} seller payout{s} waiting', 'info']],
    charts: [['Parcel fees by month', 'month:parcels.date.fee', 'money'], ['Parcels by destination', 'by:parcels.to'], ['Parcels by status', 'by:parcels.status']],
    recent: [['parcels', 'Latest parcels', 5, ['id', 'receiver', 'to', 'status']]]
  }
});
