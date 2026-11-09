/* Health & care, Money & finance */
window.__SYS.push({
  id: 'utano', name: 'Utano Clinic', tag: 'Clinic, surgery & lab', group: 'Health & care', icon: 'stethoscope', color: '#0369a1', color2: '#14b8a6',
  org: { name: 'Greendale Family Clinic', place: 'Greendale, Harare', phone: '+263 242 495 210' },
  blurb: 'Patient records, appointments, consultations, lab tests, billing and medical aid claims for clinics and surgeries.',
  headline: 'Patients seen faster, records kept safe, and every claim paid.',
  features: ['Patient files with visit history', 'Doctor\'s day calendar and walk-in queue', 'Lab requests from New to Results ready', 'Bills split between cash and medical aid (CIMAS, PSMAS, First Mutual)'],
  roles: [
    ['admin', 'Clinic manager', 'Mrs Fungai Mapondera', 'Patients, money and claims', ['dash', 'calendar', 'visits', 'patients', 'lab', 'claims', 'reports']],
    ['doctor', 'Doctor', 'Dr Kudzai Mhaka', 'Own consultations', ['calendar:r', 'visits', 'patients:r', 'lab'], { visits: 'doctor=Dr Kudzai Mhaka' }],
    ['recep', 'Reception', 'Ms Tsitsi Chirume', 'Bookings and billing', ['calendar', 'visits', 'patients']],
    ['lab', 'Lab technician', 'Mr Obey Nyamande', 'Lab requests and results', ['lab']]
  ],
  modules: { calendar: { type: 'agenda', label: 'Appointments', icon: 'calendar', table: 'visits', date: 'date', time: 'time', title: 'patient', sub: 'reason' } },
  tables: {
    patients: {
      label: 'Patients', icon: 'users', code: 'GFC', one: 'patient', addLabel: 'Register patient', desc: 'Patient register with medical aid.',
      fields: 'name:Patient|dob:Date of birth:date|gender:Gender:sel:F,M|phone:Phone:tel|aid:Medical aid:sel:Cash,CIMAS,PSMAS,First Mutual,Fidelity|allergies:Allergies|visits:Visits:=num',
      calc: { visits: (r, H) => H.count('visits', 'patient=' + r.name) },
      related: [['visits', 'patient', 'Visit history', ['date', 'reason', 'doctor', 'fee']], ['lab', 'patient', 'Lab tests', ['date', 'test', 'status']]],
      rows: [['Mrs Alice Murwira', '1968-04-12', 'F', '0772 119 004', 'CIMAS', 'Penicillin'], ['Mr Tendai Chigwada', '1985-09-30', 'M', '0773 552 870', 'PSMAS', ''], ['Baby Ano Sithole', '2024-01-18', 'F', '0712 330 991', 'First Mutual', ''], ['Mr Peter Zinyama', '1952-06-03', 'M', '0784 662 218', 'Cash', 'Sulfa drugs'], ['Ms Rumbidzai Hove', '1999-12-21', 'F', '0775 201 663', 'CIMAS', ''], ['Mr Joseph Mudenda', '1977-02-14', 'M', '0778 903 445', 'Fidelity', '']]
    },
    visits: {
      label: 'Consultations', icon: 'stethoscope', code: 'V', one: 'visit', addLabel: 'Book visit', desc: 'Bookings and consultations with diagnosis and fee.',
      fields: 'date:Date:date|time:Time:time|patient:Patient:ref:patients.name|reason:Reason|doctor:Doctor:sel:Dr Kudzai Mhaka,Dr Ruth Ncube|-diagnosis:Diagnosis:area|fee:Fee:money|pay:Paid by:sel:Cash,Medical aid|status:Status:status:Booked~warn,Waiting~info,Seen~ok,No show~bad',
      actions: [['Patient arrived', 'status=Waiting', 'status=Booked'], ['Mark seen', 'status=Seen', 'status=Waiting']],
      print: 'Print invoice',
      rows: [['d0', '08:30', 'Mrs Alice Murwira', 'Blood pressure review', 'Dr Kudzai Mhaka', 'Hypertension, stable', 35, 'Medical aid', 'Seen'], ['d0', '09:15', 'Baby Ano Sithole', 'Fever and cough', 'Dr Ruth Ncube', '', 30, 'Medical aid', 'Waiting'], ['d0', '10:00', 'Mr Tendai Chigwada', 'Back pain', 'Dr Kudzai Mhaka', '', 35, 'Medical aid', 'Booked'], ['d0', '11:30', 'Mr Peter Zinyama', 'Diabetes check', 'Dr Kudzai Mhaka', '', 40, 'Cash', 'Booked'], ['d+1', '09:00', 'Ms Rumbidzai Hove', 'Antenatal visit', 'Dr Ruth Ncube', '', 45, 'Medical aid', 'Booked'], ['d+2', '14:00', 'Mr Joseph Mudenda', 'Medical for work', 'Dr Kudzai Mhaka', '', 60, 'Cash', 'Booked'], ['d-1', '15:30', 'Mr Peter Zinyama', 'Wound dressing', 'Dr Ruth Ncube', 'Healing well', 20, 'Cash', 'Seen'], ['d-7', '10:00', 'Mrs Alice Murwira', 'Headaches', 'Dr Kudzai Mhaka', 'BP 160/95, meds adjusted', 35, 'Medical aid', 'Seen'], ['d-35', '09:00', 'Mr Tendai Chigwada', 'Flu', 'Dr Ruth Ncube', 'Viral URTI', 30, 'Medical aid', 'Seen'], ['d-70', '11:00', 'Ms Rumbidzai Hove', 'Antenatal booking', 'Dr Ruth Ncube', '12 weeks', 45, 'Medical aid', 'Seen']]
    },
    lab: {
      label: 'Lab tests', icon: 'flask', code: 'LAB', one: 'lab request', addLabel: 'Request test', board: 'default', desc: 'Lab requests from sample to result.',
      fields: 'date:Date:date|patient:Patient:ref:patients.name|test:Test:sel:Full blood count,Malaria RDT,HbA1c,Urinalysis,Lipid profile,HIV rapid test,Pregnancy test|by:Requested by|result:Result|status:Status:status:Requested~bad,Sample taken~warn,Processing~info,Results ready~ok',
      card: ['test', 'by'],
      rows: [['d0', 'Baby Ano Sithole', 'Malaria RDT', 'Dr Ruth Ncube', '', 'Requested'], ['d0', 'Mr Peter Zinyama', 'HbA1c', 'Dr Kudzai Mhaka', '', 'Sample taken'], ['d-1', 'Mrs Alice Murwira', 'Lipid profile', 'Dr Kudzai Mhaka', '', 'Processing'], ['d-2', 'Ms Rumbidzai Hove', 'Full blood count', 'Dr Ruth Ncube', 'Hb 11.8, normal', 'Results ready']]
    },
    claims: {
      label: 'Medical aid claims', icon: 'shield', code: 'CLM', one: 'claim', addLabel: 'New claim', desc: 'Claims sent to medical aid societies.',
      fields: 'date:Sent:date|patient:Patient:ref:patients.name|aid:Medical aid:sel:CIMAS,PSMAS,First Mutual,Fidelity|amount:Claimed:money|paid:Paid:money|status:Status:status:Draft~grey,Submitted~warn,Paid~ok,Rejected~bad',
      actions: [['Submit claim', 'status=Submitted', 'status=Draft'], ['Mark paid in full', 'status=Paid&paid=@amount', 'status=Submitted']],
      rows: [['d-1', 'Mrs Alice Murwira', 'CIMAS', 35, 0, 'Draft'], ['d-8', 'Mrs Alice Murwira', 'CIMAS', 35, 0, 'Submitted'], ['d-20', 'Ms Rumbidzai Hove', 'CIMAS', 75, 0, 'Submitted'], ['d-36', 'Mr Tendai Chigwada', 'PSMAS', 30, 0, 'Rejected'], ['d-60', 'Ms Rumbidzai Hove', 'CIMAS', 45, 45, 'Paid']]
    }
  },
  dash: {
    quick: [['Book visit', 'visits', 1], ['Register patient', 'patients']],
    kpis: [['Patients today', 'count:visits?date=today', 'num'], ['Waiting room', 'count:visits?status=Waiting', 'num', 'Waiting to be seen'], ['Fees this month', (H) => H.sum('visits', 'fee', 'status=Seen&date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Claims unpaid', 'sum:claims.amount?status=Submitted,Draft', 'money', 'Owed by medical aids']],
    alerts: [['visits?status=Waiting', '{n} patient{s} in the waiting room', 'info'], ['lab?status=Requested', '{n} lab request{s} still need a sample', 'warn'], ['claims?status=Submitted&date<d-14', '{n} claim{s} unpaid after 14 days', 'bad'], ['claims?status=Rejected', '{n} rejected claim{s} to fix', 'bad']],
    charts: [['Consultation fees by month', 'month:visits.date.fee?status=Seen', 'money'], ['Patients by medical aid', 'by:patients.aid'], ['Lab tests by type', 'by:lab.test']],
    recent: [['visits', 'Today\'s patients', 6, ['time', 'patient', 'reason', 'doctor', 'status']]]
  }
});

window.__SYS.push({
  id: 'mushonga', name: 'Mushonga', tag: 'Pharmacy point of sale & stock', group: 'Health & care', icon: 'pill', color: '#15803d', color2: '#22d3ee',
  org: { name: 'Avenues Pharmacy', place: 'Avenues, Harare', phone: '+263 242 252 880' },
  blurb: 'Dispensing till, prescriptions, batch and expiry tracking, reorders and medical aid sales for pharmacies.',
  headline: 'Dispense fast, catch expiring stock early and never run out of essentials.',
  features: ['Till for cash, swipe, EcoCash and medical aid', 'Batches with expiry dates and 90-day warnings', 'Prescription register with pharmacist sign-off', 'Reorder list for suppliers'],
  roles: [
    ['owner', 'Pharmacist in charge', 'Mr Ronald Chakanyuka', 'Everything', ['dash', 'pos', 'sales', 'stock', 'scripts', 'reports']],
    ['tech', 'Dispensary assistant', 'Ms Petronella Mutumwa', 'Till and prescriptions', ['pos', 'scripts', 'stock:r']]
  ],
  modules: { pos: { type: 'pos', label: 'Dispense', icon: 'pill', items: 'stock', name: 'name', price: 'price', stock: 'qty', reorder: 'reorder', cat: 'cat', sales: 'sales', methods: ['Cash USD', 'EcoCash', 'Swipe', 'Medical aid'] } },
  tables: {
    stock: {
      label: 'Stock & expiry', icon: 'box', one: 'product', desc: 'Medicines with batch, quantity and expiry date.',
      fields: 'name:Product|cat:Category:sel:Pain & fever,Antibiotics,Chronic,Children,Vitamins,First aid|batch:Batch|expiry:Expiry:date|price:Price:money|qty:Qty:num|reorder:Reorder at:num|status:Status:=status:OK~ok,Low~warn,Expiring~warn,Expired~bad',
      calc: { status: (r, H) => r.expiry < H.today ? 'Expired' : H.days(H.today, r.expiry) <= 90 ? 'Expiring' : +r.qty <= +r.reorder ? 'Low' : 'OK' },
      rows: [['Paracetamol 500 mg x24', 'Pain & fever', 'PC2391', 'd+400', 1.5, 220, 50], ['Amoxicillin 500 mg x21', 'Antibiotics', 'AM7720', 'd+60', 4.8, 35, 20], ['Metformin 500 mg x56', 'Chronic', 'MF1180', 'd+300', 6, 12, 15], ['Amlodipine 5 mg x30', 'Chronic', 'AL5512', 'd+500', 5.5, 48, 15], ['Calpol syrup 100 ml', 'Children', 'CP0912', 'd-5', 5, 6, 10], ['ORS sachets x10', 'Children', 'OR3341', 'd+700', 2, 80, 20], ['Vitamin C 1000 mg x30', 'Vitamins', 'VC6620', 'd+250', 7, 25, 10], ['Elastoplast assorted', 'First aid', 'EP2219', 'd+900', 3.5, 4, 10]]
    },
    sales: {
      label: 'Sales', icon: 'receipt', code: 'RX', one: 'sale', desc: 'Every sale at the till.',
      fields: 'date:Date:date|time:Time:time|items:Items|total:Total:money|method:Method:sel:Cash USD,EcoCash,Swipe,Medical aid|customer:Customer|cashier:By',
      print: 'Print receipt',
      rows: [['d0', '08:20', '2× Paracetamol 500 mg x24', 3, 'Cash USD', 'Walk-in', 'Ms Petronella Mutumwa'], ['d0', '09:05', '1× Amlodipine 5 mg x30, 1× Metformin 500 mg x56', 11.5, 'Medical aid', 'Mr P. Zinyama', 'Ms Petronella Mutumwa'], ['d-1', '16:30', '1× Amoxicillin 500 mg x21', 4.8, 'EcoCash', 'Walk-in', 'Mr Ronald Chakanyuka'], ['d-3', '12:00', '3× ORS sachets x10', 6, 'Cash USD', 'Walk-in', 'Ms Petronella Mutumwa'], ['d-31', '10:00', '6× Vitamin C 1000 mg x30', 42, 'Swipe', 'Walk-in', 'Mr Ronald Chakanyuka'], ['d-62', '11:00', '10× Paracetamol 500 mg x24', 15, 'Cash USD', 'Walk-in', 'Ms Petronella Mutumwa']]
    },
    scripts: {
      label: 'Prescriptions', icon: 'file', code: 'SCR', one: 'prescription', addLabel: 'Log prescription', desc: 'Prescription register.',
      fields: 'date:Date:date|patient:Patient|doctor:Prescriber|items:Items|aid:Medical aid:sel:Cash,CIMAS,PSMAS,First Mutual|status:Status:status:Received~warn,Dispensed~ok,Collected~grey',
      actions: [['Dispensed', 'status=Dispensed', 'status=Received'], ['Collected', 'status=Collected', 'status=Dispensed']],
      rows: [['d0', 'Mr Peter Zinyama', 'Dr Kudzai Mhaka', 'Metformin, Amlodipine', 'Cash', 'Received'], ['d0', 'Mrs Alice Murwira', 'Dr Kudzai Mhaka', 'Amlodipine 10 mg', 'CIMAS', 'Dispensed'], ['d-1', 'Baby Ano Sithole', 'Dr Ruth Ncube', 'Amoxicillin syrup', 'First Mutual', 'Collected']]
    }
  },
  dash: {
    quick: [['Open the till', 'pos', 1], ['Log prescription', 'scripts']],
    kpis: [['Sales today', 'sum:sales.total?date=today', 'money'], ['Sales this month', (H) => H.sum('sales', 'total', 'date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Expiring in 90 days', 'count:stock?status=Expiring', 'num', 'Sell or return first'], ['Scripts waiting', 'count:scripts?status=Received', 'num']],
    alerts: [['stock?status=Expired', '{n} product{s} expired: remove from the shelf', 'bad'], ['stock?status=Expiring', '{n} product{s} expire within 90 days', 'warn'], ['stock?status=Low', '{n} product{s} need reordering', 'warn']],
    charts: [['Sales by month', 'month:sales.date.total', 'money'], ['Sales by payment', 'sum:sales.method.total', 'money'], ['Stock by category', 'sum:stock.cat.qty', 'num']],
    recent: [['sales', 'Latest sales', 5, ['time', 'items', 'total', 'method']]]
  }
});

window.__SYS.push({
  id: 'restwell', name: 'RestWell', tag: 'Funeral cover & parlour', group: 'Health & care', icon: 'shield', color: '#334155', color2: '#a78bfa',
  org: { name: 'Dignity Funeral Services', place: 'Gweru', phone: '+263 54 222 9810' },
  blurb: 'Funeral policies, monthly premiums, lapses, claims and funeral bookings for funeral parlours and burial schemes.',
  headline: 'Every policy, premium and funeral handled with care and on record.',
  features: ['Family policies with dependants covered', 'Premiums by EcoCash and stop orders, with lapse warnings', 'Claims checked against the waiting period', 'Funeral calendar for hearses and chapels'],
  roles: [
    ['mgr', 'Branch manager', 'Mr Edmore Chivhanga', 'Policies, claims and funerals', ['dash', 'policies', 'premiums', 'claims', 'calendar', 'funerals', 'reports']],
    ['agent', 'Sales agent', 'Ms Loice Mavhunga', 'Sign up and collect premiums', ['policies', 'premiums']],
    ['holder', 'Policy holder', 'Mr Samuel Hove', 'Own policy and payments', ['policies:r', 'premiums:r'], { policies: 'holder=Mr Samuel Hove', premiums: 'policy=Mr Samuel Hove' }]
  ],
  modules: { calendar: { type: 'agenda', label: 'Funeral calendar', icon: 'calendar', table: 'funerals', date: 'date', time: 'time', title: 'deceased', sub: 'venue' } },
  tables: {
    policies: {
      label: 'Policies', icon: 'shield', code: 'POL', one: 'policy', addLabel: 'New policy', desc: 'Family funeral policies.',
      fields: 'holder:Policy holder|plan:Plan:sel:Basic,Family,Premium,Society|covered:Lives covered:num|premium:Monthly premium:money|start:Start date:date|paidto:Paid up to:date|status:Status:=status:In force~ok,Grace~warn,Lapsed~bad,Waiting period~info',
      calc: { status: (r, H) => r.paidto < H.addDays(-60) ? 'Lapsed' : r.paidto < H.today ? 'Grace' : H.days(r.start) < 180 ? 'Waiting period' : 'In force' },
      related: [['premiums', 'policy', 'Premiums paid', ['date', 'months', 'amount']]],
      print: 'Print policy schedule',
      rows: [['Mr Samuel Hove', 'Family', 6, 12, 'd-800', 'd+20'], ['Mrs Ellen Gumbo', 'Premium', 8, 25, 'd-1200', 'd+5'], ['Mr Tafara Chingono', 'Basic', 2, 5, 'd-90', 'd+10'], ['Mrs Martha Shoko', 'Family', 5, 12, 'd-600', 'd-25'], ['Mr Nelson Dube', 'Basic', 1, 5, 'd-1000', 'd-95'], ['Mutapa Burial Society', 'Society', 40, 160, 'd-400', 'd+28']]
    },
    premiums: {
      label: 'Premiums', icon: 'receipt', code: 'PRM', one: 'premium', addLabel: 'Record premium', desc: 'Premium payments received.',
      fields: 'date:Date:date|policy:Policy holder:ref:policies.holder|months:Months:num|amount:Amount:money|method:Method:sel:EcoCash,Cash USD,Stop order,InnBucks',
      onAdd: (r, H) => { const p = H.find('policies', 'holder', r.policy); if (p) p.paidto = H.addDays(30 * (+r.months || 1), p.paidto > H.today ? p.paidto : H.today); },
      print: 'Print receipt',
      rows: [['d-10', 'Mr Samuel Hove', 1, 12, 'EcoCash'], ['d-12', 'Mutapa Burial Society', 1, 160, 'Stop order'], ['d-25', 'Mrs Ellen Gumbo', 1, 25, 'Stop order'], ['d-40', 'Mr Samuel Hove', 1, 12, 'EcoCash'], ['d-55', 'Mrs Martha Shoko', 1, 12, 'Cash USD'], ['d-70', 'Mr Samuel Hove', 1, 12, 'EcoCash'], ['d-100', 'Mr Tafara Chingono', 3, 15, 'InnBucks']]
    },
    claims: {
      label: 'Claims', icon: 'file', code: 'CLM', one: 'claim', addLabel: 'Log a claim', board: true, desc: 'Funeral claims and payouts.',
      fields: 'date:Date:date|policy:Policy holder:ref:policies.holder|deceased:Deceased|relation:Relation:sel:Main member,Spouse,Child,Parent,Society member|benefit:Benefit:money|status:Status:status:Received~warn,Checking~info,Approved~ok,Paid~grey,Declined~bad',
      rows: [['d-1', 'Mutapa Burial Society', 'Mr Charles Banda', 'Society member', 1200, 'Received'], ['d-6', 'Mrs Ellen Gumbo', 'Mrs Rhoda Gumbo', 'Parent', 1500, 'Approved'], ['d-50', 'Mr Samuel Hove', 'Mr Isaac Hove', 'Parent', 1000, 'Paid']]
    },
    funerals: {
      label: 'Funerals', icon: 'calendar', code: 'FN', one: 'funeral', addLabel: 'Book funeral', desc: 'Services, hearses and chapels booked.',
      fields: 'date:Date:date|time:Time:time|deceased:Deceased|venue:Venue|hearse:Hearse:sel:Hearse 1 (AEX 2210),Hearse 2 (AFB 9081)|status:Status:status:Booked~warn,Done~ok',
      rows: [['d+1', '10:00', 'Mr Charles Banda', 'Mkoba Cemetery', 'Hearse 1 (AEX 2210)', 'Booked'], ['d+2', '09:00', 'Mrs Rhoda Gumbo', 'Senga chapel then Gweru', 'Hearse 2 (AFB 9081)', 'Booked'], ['d+5', '11:00', 'Mr Joel Moyo', 'Lower Gweru', 'Hearse 1 (AEX 2210)', 'Booked']]
    }
  },
  dash: {
    quick: [['Record premium', 'premiums', 1], ['New policy', 'policies']],
    kpis: [['Policies in force', 'count:policies?status=In force,Waiting period', 'num'], ['Lives covered', 'sum:policies.covered?status!=Lapsed', 'num'], ['Premium income this month', (H) => H.sum('premiums', 'amount', 'date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Claims to pay', 'sum:claims.benefit?status=Received,Checking,Approved', 'money']],
    alerts: [['policies?status=Grace', '{n} policy holder{s} behind: in grace period', 'warn'], ['policies?status=Lapsed', '{n} policy{s} lapsed', 'bad'], ['claims?status=Received', '{n} new claim{s} to check', 'info']],
    charts: [['Premium income by month', 'month:premiums.date.amount', 'money'], ['Policies by plan', 'by:policies.plan'], ['Policies by status', 'by:policies.status']],
    recent: [['premiums', 'Latest premiums', 5, ['date', 'policy', 'amount', 'method']]]
  }
});

window.__SYS.push({
  id: 'marilend', name: 'MariLend', tag: 'Microfinance & loans', group: 'Money & finance', icon: 'cash', color: '#065f46', color2: '#fbbf24',
  org: { name: 'Kurima Microfinance', place: 'Chinhoyi', phone: '+263 67 212 4450' },
  blurb: 'Loan applications, approvals, repayment schedules, arrears and collections for microlenders and credit schemes.',
  headline: 'Lend with confidence: every loan, repayment and arrear in one place.',
  features: ['Applications with approval workflow', 'Instalments and balances worked out for you', 'Arrears list for the collections team', 'Portfolio at risk and income reports'],
  roles: [
    ['mgr', 'Branch manager', 'Mr Fidelis Mapfumo', 'Approvals and portfolio', ['dash', 'apps', 'loans', 'repay', 'clients', 'reports']],
    ['officer', 'Loan officer', 'Ms Rutendo Masimba', 'Clients and applications', ['clients', 'apps', 'loans:r', 'repay']],
    ['collect', 'Collections', 'Mr Daniel Gwenzi', 'Arrears follow-up', ['loans:r', 'repay']]
  ],
  tables: {
    clients: {
      label: 'Clients', icon: 'users', code: 'KM', one: 'client', desc: 'Borrowers and what they do.',
      fields: 'name:Client|phone:Phone:tel|business:Business:sel:Market vendor,Farmer,Civil servant,Transport,Small shop,Salon|branch:Branch:sel:Chinhoyi,Karoi,Banket|income:Monthly income:money|score:Repayment record:stars',
      related: [['loans', 'client', 'Loans', ['date', 'amount', 'balance', 'status']]],
      rows: [['Mrs Esther Mukanya', '0772 330 445', 'Market vendor', 'Chinhoyi', 600, 5], ['Mr Tichaona Shava', '0773 118 662', 'Farmer', 'Banket', 900, 4], ['Mr Leonard Kumbirai', '0712 553 207', 'Civil servant', 'Chinhoyi', 480, 3], ['Mrs Jane Mutero', '0784 902 118', 'Salon', 'Karoi', 700, 5], ['Mr Abel Chikomo', '0775 448 903', 'Transport', 'Chinhoyi', 1500, 2], ['Mrs Faith Nyamupinga', '0778 663 019', 'Small shop', 'Karoi', 820, 4]]
    },
    apps: {
      label: 'Applications', icon: 'file', code: 'APP', one: 'application', addLabel: 'New application', board: 'default', desc: 'Loan requests waiting for a decision.',
      fields: 'date:Applied:date|client:Client:ref:clients.name|amount:Amount:money|months:Term (months):num|purpose:Purpose|status:Status:status:New~warn,Assessing~info,Approved~ok,Declined~bad',
      card: ['amount', 'months', 'purpose'],
      onStatus: (r, H) => { if (r.status === 'Approved' && !H.find('loans', 'app', r.id)) { const db = H.db; const n = db.loans.length + 1; db.loans.unshift({ id: 'LN-' + (2000 + n), date: H.today, client: r.client, amount: r.amount, rate: 5, months: r.months, paid: 0, app: r.id }); } },
      rows: [['d0', 'Mrs Faith Nyamupinga', 800, 6, 'Restock shop', 'New'], ['d-1', 'Mr Tichaona Shava', 1500, 9, 'Irrigation pump', 'Assessing'], ['d-2', 'Mrs Jane Mutero', 400, 4, 'Salon chairs', 'Assessing'], ['d-5', 'Mr Abel Chikomo', 3000, 12, 'Kombi repairs', 'Declined']]
    },
    loans: {
      label: 'Loans', icon: 'cash', code: 'LN', one: 'loan', desc: 'Active loans. Interest is 5% a month on a flat basis.',
      fields: 'date:Disbursed:date|client:Client:ref:clients.name|amount:Principal:money|rate:Rate % pm:pct|months:Months:num|instalment:Monthly instalment:=money|paid:Repaid:money|balance:Balance:=money|status:Status:=status:Current~ok,In arrears~bad,Closed~grey|-app:Application',
      calc: {
        instalment: (r) => (+r.amount || 0) * (1 + (+r.rate || 0) / 100 * (+r.months || 1)) / (+r.months || 1),
        balance: (r) => (+r.amount || 0) * (1 + (+r.rate || 0) / 100 * (+r.months || 1)) - (+r.paid || 0),
        status: (r, H) => { const total = (+r.amount || 0) * (1 + (+r.rate || 0) / 100 * (+r.months || 1)); if (total - (+r.paid || 0) <= 0.01) return 'Closed'; const due = Math.min(+r.months || 1, Math.floor(H.days(r.date) / 30)) * (total / (+r.months || 1)); return (+r.paid || 0) + 0.01 < due ? 'In arrears' : 'Current'; }
      },
      noForm: ['app'], related: [['repay', 'loan', 'Repayments', ['date', 'amount', 'method']]], print: 'Print loan statement',
      rows: [['d-95', 'Mrs Esther Mukanya', 500, 5, 6, 345, ''], ['d-130', 'Mr Leonard Kumbirai', 1000, 5, 10, 600, ''], ['d-65', 'Mrs Jane Mutero', 300, 5, 4, 180, ''], ['d-200', 'Mr Abel Chikomo', 1200, 5, 6, 900, ''], ['d-35', 'Mr Tichaona Shava', 700, 5, 6, 155, ''], ['d-300', 'Mrs Faith Nyamupinga', 600, 5, 6, 780, '']]
    },
    repay: {
      label: 'Repayments', icon: 'receipt', code: 'RP', one: 'repayment', addLabel: 'Record repayment', desc: 'Money received against loans.',
      fields: 'date:Date:date|loan:Loan:ref:loans.id|client:Client:ref:clients.name|amount:Amount:money|method:Method:sel:EcoCash,Cash USD,Bank transfer|by:Received by',
      defaults: { by: 'me' }, print: 'Print receipt',
      onAdd: (r, H) => { const l = H.find('loans', 'id', r.loan); if (l) { l.paid = (+l.paid || 0) + (+r.amount || 0); r.client = l.client; } },
      rows: [['d-3', 'LN-1001', 'Mrs Esther Mukanya', 115, 'EcoCash', 'Ms Rutendo Masimba'], ['d-6', 'LN-1003', 'Mrs Jane Mutero', 86.25, 'EcoCash', 'Ms Rutendo Masimba'], ['d-15', 'LN-1002', 'Mr Leonard Kumbirai', 150, 'Bank transfer', 'Ms Rutendo Masimba'], ['d-33', 'LN-1001', 'Mrs Esther Mukanya', 115, 'EcoCash', 'Ms Rutendo Masimba'], ['d-45', 'LN-1002', 'Mr Leonard Kumbirai', 150, 'Bank transfer', 'Ms Rutendo Masimba'], ['d-60', 'LN-1004', 'Mr Abel Chikomo', 300, 'Cash USD', 'Mr Daniel Gwenzi'], ['d-64', 'LN-1001', 'Mrs Esther Mukanya', 115, 'EcoCash', 'Ms Rutendo Masimba'], ['d-130', 'LN-1004', 'Mr Abel Chikomo', 300, 'Cash USD', 'Mr Daniel Gwenzi']]
    }
  },
  dash: {
    quick: [['Record repayment', 'repay', 1], ['New application', 'apps']],
    kpis: [['Loan book', 'sum:loans.balance?status!=Closed', 'money', 'Outstanding balances'], ['Portfolio at risk', (H) => H.sum('loans', 'balance', 'status=In arrears') / Math.max(1, H.sum('loans', 'balance', 'status!=Closed')) * 100, 'pct', 'Share in arrears'], ['Collected this month', (H) => H.sum('repay', 'amount', 'date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Applications waiting', 'count:apps?status=New,Assessing', 'num']],
    alerts: [['loans?status=In arrears', '{n} loan{s} in arrears: call today', 'bad'], ['apps?status=New', '{n} new application{s} to assess', 'warn']],
    charts: [['Repayments by month', 'month:repay.date.amount', 'money'], ['Loan book by status', 'sum:loans.status.balance', 'money'], ['Clients by business', 'by:clients.business']],
    recent: [['repay', 'Latest repayments', 5, ['date', 'client', 'amount', 'method']]]
  }
});

window.__SYS.push({
  id: 'bhuku', name: 'Bhuku Books', tag: 'Invoicing, expenses & accounts', group: 'Money & finance', icon: 'receipt', color: '#1d4ed8', color2: '#38bdf8',
  org: { name: 'Zambezi Logistics (Pvt) Ltd', place: 'Southerton, Harare', phone: '+263 242 621 773' },
  blurb: 'Quotes, invoices, payments received, expenses, debtors and profit for small and medium businesses.',
  headline: 'Send invoices, get paid, and know your profit every day.',
  features: ['Quotes that turn into invoices', 'Invoices with due dates and overdue alerts', 'Expenses by category with receipts', 'Profit and debtors reports for the accountant'],
  roles: [
    ['owner', 'Director', 'Mr Kelvin Mashingaidze', 'Profit and cash', ['dash', 'invoices', 'quotes', 'expenses', 'customers', 'reports']],
    ['acc', 'Accounts clerk', 'Ms Charmaine Ruzvidzo', 'Invoices and expenses', ['invoices', 'quotes', 'expenses', 'customers']],
    ['auditor', 'External accountant', 'Mr Tonderai Mugabe CA', 'Read only', ['dash', 'invoices:r', 'expenses:r', 'reports']]
  ],
  tables: {
    invoices: {
      label: 'Invoices', icon: 'receipt', code: 'INV', one: 'invoice', addLabel: 'New invoice', desc: 'Invoices sent to customers.',
      fields: 'date:Date:date|customer:Customer:ref:customers.name|desc:Description|amount:Amount:money|vat:VAT 15%:=money|total:Total:=money|due:Due:date|status:Status:=status:Draft~grey,Sent~warn,Overdue~bad,Paid~ok|-paidOn:Paid on:date|-sent:Sent:sel:No,Yes',
      calc: { vat: (r) => (+r.amount || 0) * 0.15, total: (r) => (+r.amount || 0) * 1.15, status: (r, H) => r.paidOn ? 'Paid' : r.sent !== 'Yes' ? 'Draft' : r.due < H.today ? 'Overdue' : 'Sent' },
      actions: [['Send to customer', 'sent=Yes', 'status=Draft', 'Invoice sent'], ['Mark paid', 'paidOn=today', 'status=Sent,Overdue', 'Payment recorded']],
      defaults: { due: 'd+30', sent: 'No' }, print: 'Print invoice',
      rows: [['d-2', 'Delta Beverages', 'Haulage Harare to Beitbridge (3 loads)', 4200, 'd+28', '', 'Yes'], ['d-5', 'Olivine Industries', 'Warehousing Oct', 1800, 'd+25', '', 'Yes'], ['d-40', 'Tanganda Tea', 'Haulage Mutare to Harare', 2600, 'd-10', '', 'Yes'], ['d-48', 'National Foods', 'Cross-border to Lusaka', 5400, 'd-18', '', 'Yes'], ['d-35', 'Delta Beverages', 'Haulage (5 loads)', 7000, 'd-5', 'd-6', 'Yes'], ['d-66', 'Olivine Industries', 'Warehousing Sep', 1800, 'd-36', 'd-40', 'Yes'], ['d-95', 'Schweppes Zimbabwe', 'Distribution run', 3100, 'd-65', 'd-70', 'Yes'], ['d0', 'Tanganda Tea', 'Haulage Chipinge to Harare', 2900, 'd+30', '', 'No']]
    },
    quotes: {
      label: 'Quotes', icon: 'file', code: 'QT', one: 'quote', addLabel: 'New quote', board: true, desc: 'Quotes sent and whether they were accepted.',
      fields: 'date:Date:date|customer:Customer:ref:customers.name|desc:Description|amount:Amount:money|valid:Valid until:date|status:Status:status:Draft~grey,Sent~warn,Accepted~ok,Lost~bad',
      actions: [['Turn into invoice', (r, H) => { r.status = 'Accepted'; const n = H.db.invoices.length + 1; H.db.invoices.unshift({ id: 'INV-' + (2000 + n), date: H.today, customer: r.customer, desc: r.desc, amount: r.amount, due: H.addDays(30), paidOn: '', sent: 'No' }); }, 'status=Sent,Draft', 'Invoice created from quote']],
      rows: [['d-1', 'Schweppes Zimbabwe', 'Monthly distribution contract', 9500, 'd+14', 'Sent'], ['d-7', 'Tanganda Tea', 'Seasonal haulage', 12000, 'd+7', 'Sent'], ['d-20', 'National Foods', 'Warehousing 200 pallets', 3600, 'd-6', 'Lost']]
    },
    expenses: {
      label: 'Expenses', icon: 'coins', code: 'EXP', one: 'expense', addLabel: 'Record expense', desc: 'Money going out, by category.',
      fields: 'date:Date:date|supplier:Supplier|cat:Category:sel:Fuel,Salaries,Tyres & repairs,Tolls & permits,Rent,Insurance,Office|amount:Amount:money|method:Paid by:sel:Bank transfer,Cash USD,EcoCash,Card',
      rows: [['d-1', 'Zuva Petroleum', 'Fuel', 1450, 'Card'], ['d-3', 'ZINARA', 'Tolls & permits', 210, 'Cash USD'], ['d-8', 'Tyre Express', 'Tyres & repairs', 980, 'Bank transfer'], ['d-10', 'Staff', 'Salaries', 6200, 'Bank transfer'], ['d-12', 'Southerton Properties', 'Rent', 1200, 'Bank transfer'], ['d-30', 'Zuva Petroleum', 'Fuel', 3900, 'Card'], ['d-40', 'Staff', 'Salaries', 6200, 'Bank transfer'], ['d-41', 'Old Mutual Insurance', 'Insurance', 640, 'Bank transfer'], ['d-70', 'Staff', 'Salaries', 6100, 'Bank transfer'], ['d-72', 'Zuva Petroleum', 'Fuel', 3500, 'Card']]
    },
    customers: {
      label: 'Customers', icon: 'building', one: 'customer', desc: 'Customers and what they owe.',
      fields: 'name:Customer|contact:Contact person|phone:Phone:tel|email:Email:email|owing:Owing:=money|terms:Terms:sel:30 days,14 days,7 days,Cash',
      calc: { owing: (r, H) => H.where('invoices', 'customer=' + r.name + '&status=Sent,Overdue').reduce((a, i) => a + (+i.amount || 0) * 1.15, 0) },
      related: [['invoices', 'customer', 'Invoices', ['date', 'desc', 'amount', 'status']]],
      rows: [['Delta Beverages', 'Mr R. Sibanda', '0242 702 100', 'logistics@delta.example', '30 days'], ['Olivine Industries', 'Ms P. Mhaka', '0242 755 310', 'stores@olivine.example', '30 days'], ['Tanganda Tea', 'Mr J. Muchena', '0202 600 221', 'transport@tanganda.example', '14 days'], ['National Foods', 'Mrs A. Phiri', '0242 621 991', 'ops@natfoods.example', '30 days'], ['Schweppes Zimbabwe', 'Mr K. Moyo', '0242 487 300', 'dist@schweppes.example', '30 days']]
    }
  },
  dash: {
    quick: [['New invoice', 'invoices', 1], ['Record expense', 'expenses']],
    kpis: [['Invoiced this month', (H) => H.where('invoices', 'date>=' + H.today.slice(0, 8) + '01').reduce((a, r) => a + (+r.amount || 0), 0), 'money', 'Before VAT'], ['Owed to you', 'sum:invoices.total?status=Sent,Overdue', 'money', 'Debtors'], ['Overdue', 'sum:invoices.total?status=Overdue', 'money'], ['Profit (90 days)', (H) => H.sum('invoices', 'amount', 'status=Paid&date>=d-90') - H.sum('expenses', 'amount', 'date>=d-90'), 'money', 'Paid invoices less expenses']],
    alerts: [['invoices?status=Overdue', '{n} invoice{s} overdue: chase payment', 'bad'], ['invoices?status=Draft', '{n} draft invoice{s} not sent yet', 'warn'], ['quotes?status=Sent&valid<=d+7', '{n} quote{s} expire this week', 'info']],
    charts: [['Invoiced by month', 'month:invoices.date.amount', 'money'], ['Expenses by month', 'month:expenses.date.amount', 'money'], ['Expenses by category', 'sum:expenses.cat.amount', 'money']],
    recent: [['invoices', 'Latest invoices', 5, ['date', 'customer', 'total', 'status']]]
  }
});
