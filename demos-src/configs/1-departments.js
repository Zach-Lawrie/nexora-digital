/* Departments in any business */
const PAYE = (g) => { g = +g || 0; return g <= 100 ? 0 : g <= 300 ? g * 0.2 - 20 : g <= 1000 ? g * 0.25 - 35 : g <= 2000 ? g * 0.3 - 85 : g <= 3000 ? g * 0.35 - 185 : g * 0.4 - 335; };
window.__SYS.push({
  id: 'payday', name: 'PayDay HR', tag: 'HR, leave & payroll', group: 'Departments in any business', icon: 'users', color: '#3730a3', color2: '#22d3ee',
  org: { name: 'Kariba Foods (Pvt) Ltd', place: 'Workington, Harare', phone: '+263 242 664 210' },
  blurb: 'Employee files, leave requests and approvals, payroll with PAYE, NSSA and payslips, and staff self-service.',
  headline: 'Payslips, leave and staff records done right, every month.',
  features: ['Employee files with contracts and grades', 'Leave requests approved by the manager online', 'Payroll with PAYE, AIDS levy and NSSA worked out', 'Staff see their own payslips and leave balance'],
  roles: [
    ['hr', 'HR manager', 'Mrs Patience Chidavaenzi', 'Staff, leave and payroll', ['dash', 'staff', 'leave', 'payroll', 'reports']],
    ['line', 'Line manager', 'Mr Tonderai Muzenda', 'Approve team leave', ['leave', 'staff:r']],
    ['emp', 'Employee self-service', 'Ms Rumbidzai Tembo', 'Own payslips and leave', ['payroll:r', 'leave'], { payroll: 'name=Rumbidzai Tembo', leave: 'name=Rumbidzai Tembo' }]
  ],
  tables: {
    staff: {
      label: 'Employees', icon: 'users', code: 'KF', one: 'employee', addLabel: 'Add employee', desc: 'Staff files with grade, salary and leave left.',
      fields: 'name:Employee|dept:Department:sel:Production,Sales,Finance,Logistics,HR,Admin|title:Job title|grade:Grade:sel:A1,A2,B1,B2,C1,D1|basic:Basic salary:money|start:Start date:date|leaveLeft:Leave days left:=num|status:Status:status:Active~ok,Probation~warn,On leave~info,Exited~grey',
      calc: { leaveLeft: (r, H) => 22 - H.sum('leave', 'days', 'name=' + r.name + '&type=Annual&status=Approved') },
      related: [['leave', 'name', 'Leave', ['from', 'type', 'days', 'status']], ['payroll', 'name', 'Payslips', ['month', 'gross', 'net']]],
      rows: [['Tonderai Muzenda', 'Production', 'Production supervisor', 'C1', 1450, 'd-2400', 'Active'], ['Rumbidzai Tembo', 'Finance', 'Accounts officer', 'B2', 980, 'd-900', 'Active'], ['Joseph Chinyanga', 'Production', 'Machine operator', 'A2', 420, 'd-1500', 'Active'], ['Memory Mutasa', 'Sales', 'Sales rep', 'B1', 650, 'd-60', 'Probation'], ['Clever Mushonga', 'Logistics', 'Driver', 'A2', 480, 'd-1100', 'On leave'], ['Patience Chidavaenzi', 'HR', 'HR manager', 'D1', 2100, 'd-3000', 'Active'], ['Nyasha Mlambo', 'Admin', 'Receptionist', 'A1', 350, 'd-400', 'Active']]
    },
    leave: {
      label: 'Leave', icon: 'calendar', code: 'LV', one: 'leave request', addLabel: 'Apply for leave', desc: 'Leave requests and approvals.',
      fields: 'name:Employee:ref:staff.name|type:Type:sel:Annual,Sick,Maternity,Compassionate,Study|from:From:date|days:Days:num|reason:Reason|status:Status:status:Pending~warn,Approved~ok,Rejected~bad',
      actions: [['Approve', 'status=Approved', 'status=Pending', 'Leave approved'], ['Reject', 'status=Rejected', 'status=Pending', 'Leave rejected']],
      rows: [['Joseph Chinyanga', 'Annual', 'd+7', 5, 'Family wedding in Gokwe', 'Pending'], ['Rumbidzai Tembo', 'Study', 'd+14', 3, 'ACCA exams', 'Pending'], ['Clever Mushonga', 'Annual', 'd-3', 10, 'Rest', 'Approved'], ['Memory Mutasa', 'Sick', 'd-20', 2, 'Flu (sick note)', 'Approved'], ['Rumbidzai Tembo', 'Annual', 'd-90', 5, 'Holiday', 'Approved'], ['Tonderai Muzenda', 'Annual', 'd-60', 7, 'Kariba trip', 'Approved']]
    },
    payroll: {
      label: 'Payroll', icon: 'cash', code: 'PS', one: 'payslip', addLabel: 'Add payslip', desc: 'Monthly payslips. PAYE uses the USD tax bands (estimate for the demo).',
      fields: 'month:Month:sel:Nov 2026,Oct 2026,Sep 2026|name:Employee:ref:staff.name|basic:Basic:money|allow:Allowances:money|ot:Overtime:money|gross:Gross:=money|paye:PAYE:=money|aids:AIDS levy 3%:=money|nssa:NSSA 4.5%:=money|net:Net pay:=money|status:Status:status:Draft~warn,Paid~ok',
      calc: { gross: (r) => (+r.basic || 0) + (+r.allow || 0) + (+r.ot || 0), paye: (r) => PAYE((+r.basic || 0) + (+r.allow || 0) + (+r.ot || 0)), aids: (r) => PAYE((+r.basic || 0) + (+r.allow || 0) + (+r.ot || 0)) * 0.03, nssa: (r) => Math.min(((+r.basic || 0) + (+r.allow || 0) + (+r.ot || 0)) * 0.045, 31.5), net: (r) => { const g = (+r.basic || 0) + (+r.allow || 0) + (+r.ot || 0); return g - PAYE(g) * 1.03 - Math.min(g * 0.045, 31.5); } },
      print: 'Print payslip',
      actions: [['Mark paid', 'status=Paid', 'status=Draft']],
      rows: [['Nov 2026', 'Tonderai Muzenda', 1450, 200, 0, 'Draft'], ['Nov 2026', 'Rumbidzai Tembo', 980, 120, 0, 'Draft'], ['Nov 2026', 'Joseph Chinyanga', 420, 60, 85, 'Draft'], ['Nov 2026', 'Memory Mutasa', 650, 150, 0, 'Draft'], ['Nov 2026', 'Clever Mushonga', 480, 80, 40, 'Draft'], ['Nov 2026', 'Patience Chidavaenzi', 2100, 300, 0, 'Draft'], ['Nov 2026', 'Nyasha Mlambo', 350, 50, 0, 'Draft'], ['Oct 2026', 'Rumbidzai Tembo', 980, 120, 0, 'Paid'], ['Oct 2026', 'Joseph Chinyanga', 420, 60, 120, 'Paid'], ['Sep 2026', 'Rumbidzai Tembo', 980, 120, 0, 'Paid']]
    }
  },
  dash: {
    quick: [['Add employee', 'staff', 1], ['Apply for leave', 'leave']],
    kpis: [['Headcount', 'count:staff?status!=Exited', 'num'], ['Payroll this month', 'sum:payroll.gross?month=Nov 2026', 'money', 'Gross pay'], ['Net to pay', 'sum:payroll.net?month=Nov 2026', 'money', 'After PAYE and NSSA'], ['Leave requests', 'count:leave?status=Pending', 'num', 'Waiting for approval']],
    alerts: [['leave?status=Pending', '{n} leave request{s} waiting for approval', 'warn'], ['staff?status=Probation', '{n} employee{s} on probation: review due', 'info'], ['payroll?status=Draft', '{n} payslip{s} not yet paid', 'warn']],
    charts: [['Gross payroll by month', 'sum:payroll.month.gross', 'money'], ['Headcount by department', 'by:staff.dept'], ['Leave days by type', 'sum:leave.type.days', 'num']],
    recent: [['leave', 'Leave requests', 5, ['name', 'type', 'from', 'days', 'status']]]
  }
});

window.__SYS.push({
  id: 'talentdesk', name: 'TalentDesk', tag: 'Recruitment & hiring', group: 'Departments in any business', icon: 'briefcase', color: '#6b21a8', color2: '#facc15',
  org: { name: 'Simba Telecoms Group', place: 'Borrowdale, Harare', phone: '+263 242 486 100' },
  blurb: 'Vacancies, CVs, shortlists, interviews and offers in one hiring pipeline for HR teams and recruitment agencies.',
  headline: 'Hire the right people faster, with every CV in one pipeline.',
  features: ['Vacancies with closing dates', 'Candidates moved from Applied to Hired', 'Interview calendar for the panel', 'Scores and notes from every interviewer'],
  roles: [
    ['hr', 'Talent manager', 'Ms Kudzai Mahachi', 'All vacancies and candidates', ['dash', 'pipeline', 'calendar', 'vacancies', 'reports']],
    ['panel', 'Interview panel', 'Mr Simba Chitando', 'Interviews and scores', ['calendar', 'pipeline']]
  ],
  modules: { calendar: { type: 'agenda', label: 'Interviews', icon: 'calendar', table: 'candidates', date: 'interview', time: 'time', title: 'name', sub: 'vacancy' } },
  tables: {
    vacancies: {
      label: 'Vacancies', icon: 'briefcase', code: 'VAC', one: 'vacancy', addLabel: 'Open vacancy', desc: 'Open jobs and how many applied.',
      fields: 'title:Job title|dept:Department:sel:Engineering,Sales,Finance,Customer care,IT|location:Location:sel:Harare,Bulawayo,Mutare,Remote|closes:Closes:date|applicants:Applicants:=num|status:Status:status:Open~ok,Interviewing~warn,Filled~grey',
      calc: { applicants: (r, H) => H.count('candidates', 'vacancy=' + r.title) },
      related: [['candidates', 'vacancy', 'Candidates', ['name', 'score', 'status']]],
      rows: [['Network engineer', 'Engineering', 'Harare', 'd+10', 'Interviewing'], ['Sales executive', 'Sales', 'Bulawayo', 'd+21', 'Open'], ['Accountant', 'Finance', 'Harare', 'd-5', 'Interviewing'], ['Customer care agent (x5)', 'Customer care', 'Mutare', 'd+30', 'Open']]
    },
    candidates: {
      label: 'Candidates', icon: 'user', code: 'CAN', one: 'candidate', addLabel: 'Add candidate', desc: 'Everyone who applied.',
      fields: 'name:Candidate|vacancy:Vacancy:ref:vacancies.title|phone:Phone:tel|source:Source:sel:LinkedIn,Website,Referral,Newspaper,Walk-in|score:Score:stars|interview:Interview date:date|time:Time:time|status:Status:status:Applied~info,Shortlisted~warn,Interview~warn,Offer~ok,Hired~ok,Rejected~grey',
      rows: [['Tatenda Murape', 'Network engineer', '0772 330 118', 'LinkedIn', 5, 'd+1', '10:00', 'Interview'], ['Rutendo Gwaze', 'Network engineer', '0773 662 980', 'Referral', 4, 'd+1', '11:30', 'Interview'], ['Blessing Moyo', 'Network engineer', '0712 553 019', 'Website', 3, '', '', 'Shortlisted'], ['Sandra Ndlovu', 'Accountant', '0784 330 871', 'Newspaper', 4, 'd+2', '09:00', 'Interview'], ['Kevin Mudzviti', 'Accountant', '0775 662 104', 'LinkedIn', 5, 'd-3', '14:00', 'Offer'], ['Ruvimbo Chari', 'Sales executive', '0778 201 554', 'Referral', 4, '', '', 'Applied'], ['Takudzwa Phiri', 'Customer care agent (x5)', '0719 903 116', 'Walk-in', 3, '', '', 'Applied'], ['Lindiwe Sibanda', 'Sales executive', '0773 448 230', 'LinkedIn', 2, '', '', 'Rejected'], ['Tinashe Kufa', 'Customer care agent (x5)', '0782 870 665', 'Website', 4, 'd+4', '10:00', 'Interview']]
    }
  },
  dash: {
    quick: [['Add candidate', 'candidates', 1]],
    kpis: [['Open vacancies', 'count:vacancies?status!=Filled', 'num'], ['Candidates', 'count:candidates', 'num'], ['Interviews this week', 'count:candidates?interview>=today&interview<=d+7', 'num'], ['Offers out', 'count:candidates?status=Offer', 'num']],
    alerts: [['candidates?status=Applied', '{n} new CV{s} to screen', 'warn'], ['vacancies?closes<today&status=Open', '{n} vacancy closed but still open', 'bad'], ['candidates?interview=d+1', '{n} interview{s} tomorrow', 'info']],
    charts: [['Pipeline', 'by:candidates.status'], ['Candidates by source', 'by:candidates.source'], ['Candidates by vacancy', 'by:candidates.vacancy']],
    recent: [['candidates', 'Upcoming interviews', 5, ['name', 'vacancy', 'interview', 'status']]]
  }
});
window.__SYS[window.__SYS.length - 1].modules.pipeline = { type: 'table', label: 'Hiring pipeline', icon: 'kanban', table: 'candidates' };
window.__SYS[window.__SYS.length - 1].tables.candidates.board = 'default';
window.__SYS[window.__SYS.length - 1].tables.candidates.card = ['vacancy', 'score', 'interview'];

window.__SYS.push({
  id: 'pipeline', name: 'Pipeline CRM', tag: 'Sales & customers', group: 'Departments in any business', icon: 'target', color: '#0c4a6e', color2: '#f43f5e',
  org: { name: 'Harare Office Supplies', place: 'Msasa, Harare', phone: '+263 242 446 980' },
  blurb: 'Leads, deals, follow-ups, customers and sales targets for sales teams of any size.',
  headline: 'See every deal, chase every lead, and hit the monthly target.',
  features: ['Deals on a board from New to Won', 'Follow-up calls and meetings with due dates', 'Customer history in one place', 'Sales rep targets and win rate'],
  roles: [
    ['head', 'Sales manager', 'Mr Brighton Zhou', 'Whole team', ['dash', 'deals', 'tasks', 'customers', 'reports']],
    ['rep', 'Sales rep', 'Ms Tariro Chikumbu', 'Own deals and tasks', ['deals', 'tasks', 'customers'], { deals: 'rep=Tariro', tasks: 'rep=Tariro' }]
  ],
  tables: {
    deals: {
      label: 'Deals', icon: 'kanban', code: 'DL', one: 'deal', addLabel: 'New deal', board: 'default', desc: 'Opportunities moving towards a sale.',
      fields: 'name:Deal|customer:Customer:ref:customers.name|value:Value:money|rep:Rep:sel:Tariro,Munya,Grace|date:Created:date|close:Expected close:date|status:Stage:status:New~info,Contacted~info,Proposal~warn,Negotiation~warn,Won~ok,Lost~bad',
      card: ['customer', 'value', 'rep'],
      rows: [['200 office chairs', 'CBZ Holdings', 18000, 'Tariro', 'd-12', 'd+10', 'Negotiation'], ['Printer paper (annual)', 'Ministry of Finance', 24000, 'Munya', 'd-20', 'd+30', 'Proposal'], ['Boardroom furniture', 'Old Mutual', 9500, 'Grace', 'd-5', 'd+20', 'Contacted'], ['Toner contract', 'NetOne', 7200, 'Tariro', 'd-2', 'd+40', 'New'], ['Stationery for 12 schools', 'Chitungwiza Municipality', 6100, 'Munya', 'd-30', 'd-2', 'Won'], ['Laptops x15', 'Delta Beverages', 14500, 'Tariro', 'd-40', 'd-10', 'Won'], ['Filing cabinets', 'ZIMRA', 4300, 'Grace', 'd-25', 'd-5', 'Lost'], ['Desks x40', 'Econet', 11800, 'Grace', 'd-70', 'd-40', 'Won']]
    },
    tasks: {
      label: 'Follow-ups', icon: 'phone', one: 'follow-up', addLabel: 'Add follow-up', desc: 'Calls, meetings and emails to do.',
      fields: 'due:Due:date|what:What:sel:Call,Meeting,Email,Send quote,Site visit|customer:Customer:ref:customers.name|note:Note|rep:Rep:sel:Tariro,Munya,Grace|status:Status:status:To do~warn,Done~ok',
      actions: [['Mark done', 'status=Done', 'status=To do']],
      rows: [['d0', 'Call', 'CBZ Holdings', 'Confirm discount on chairs', 'Tariro', 'To do'], ['d-1', 'Send quote', 'NetOne', 'Toner prices for 3 sites', 'Tariro', 'To do'], ['d+2', 'Meeting', 'Old Mutual', 'Show furniture samples', 'Grace', 'To do'], ['d+5', 'Site visit', 'Ministry of Finance', 'Storage room for paper', 'Munya', 'To do'], ['d-3', 'Email', 'Delta Beverages', 'Delivery note for laptops', 'Tariro', 'Done']]
    },
    customers: {
      label: 'Customers', icon: 'building', one: 'customer', desc: 'Accounts and how much they have bought.',
      fields: 'name:Customer|industry:Industry:sel:Banking,Government,Telecoms,Insurance,Manufacturing,Local authority|contact:Contact|phone:Phone:tel|won:Won to date:=money',
      calc: { won: (r, H) => H.sum('deals', 'value', 'customer=' + r.name + '&status=Won') },
      related: [['deals', 'customer', 'Deals', ['name', 'value', 'status']]],
      rows: [['CBZ Holdings', 'Banking', 'Mrs R. Ncube', '0242 748 050'], ['Ministry of Finance', 'Government', 'Mr T. Chari', '0242 794 571'], ['Old Mutual', 'Insurance', 'Ms L. Dube', '0242 308 400'], ['NetOne', 'Telecoms', 'Mr K. Sibanda', '0242 334 000'], ['Chitungwiza Municipality', 'Local authority', 'Mr P. Gumbo', '0270 22 501'], ['Delta Beverages', 'Manufacturing', 'Ms A. Moyo', '0242 702 100'], ['ZIMRA', 'Government', 'Mr J. Shoko', '0242 758 891'], ['Econet', 'Telecoms', 'Mrs F. Chikore', '0242 486 000']]
    }
  },
  dash: {
    quick: [['New deal', 'deals', 1], ['Add follow-up', 'tasks']],
    kpis: [['Open pipeline', 'sum:deals.value?status!=Won,Lost', 'money'], ['Won (90 days)', 'sum:deals.value?status=Won&close>=d-90', 'money'], ['Win rate', (H) => H.count('deals', 'status=Won') / Math.max(1, H.count('deals', 'status=Won,Lost')) * 100, 'pct'], ['Follow-ups due', 'count:tasks?status=To do&due<=today', 'num']],
    alerts: [['tasks?status=To do&due<today', '{n} follow-up{s} overdue', 'bad'], ['deals?status!=Won,Lost&close<today', '{n} deal{s} past the expected close date', 'warn'], ['deals?status=New', '{n} new deal{s} not contacted', 'info']],
    charts: [['Won by month', 'month:deals.close.value?status=Won', 'money'], ['Pipeline by stage', 'sum:deals.status.value', 'money'], ['Pipeline by rep', 'sum:deals.rep.value?status!=Won,Lost', 'money']],
    recent: [['tasks', 'Follow-ups', 5, ['due', 'what', 'customer', 'rep', 'status']]]
  }
});

window.__SYS.push({
  id: 'buyright', name: 'BuyRight', tag: 'Procurement & purchase orders', group: 'Departments in any business', icon: 'clipboard', color: '#155e75', color2: '#a3e635',
  org: { name: 'Hwange Power Services', place: 'Hwange', phone: '+263 81 233 4410' },
  blurb: 'Purchase requisitions, approvals, quotations, purchase orders, deliveries and supplier ratings for procurement teams.',
  headline: 'Nothing bought without approval, and every dollar accounted for.',
  features: ['Requisitions from any department', 'Approval by budget holder before ordering', 'Three quotes compared per purchase', 'Supplier performance ratings'],
  roles: [
    ['proc', 'Procurement manager', 'Mr Wilbert Chiyangwa', 'All purchasing', ['dash', 'reqs', 'pos', 'suppliers', 'reports']],
    ['hod', 'Head of department', 'Eng. Martha Dube', 'Approve requests', ['reqs', 'pos:r']],
    ['requester', 'Staff member', 'Mr Ian Mpofu', 'Raise requests', ['reqs'], { reqs: 'by=Mr Ian Mpofu' }]
  ],
  tables: {
    reqs: {
      label: 'Requisitions', icon: 'file', code: 'PR', one: 'requisition', addLabel: 'New requisition', board: 'default', desc: 'Purchase requests from departments.',
      fields: 'date:Date:date|item:Item|dept:Department:sel:Maintenance,Operations,IT,Admin,Safety|qty:Qty:num|est:Est. cost:money|by:Requested by|status:Status:status:Submitted~warn,Approved~info,Ordered~info,Received~ok,Rejected~bad',
      card: ['dept', 'est', 'by'], defaults: { by: 'me' },
      rows: [['d0', 'Safety boots size 8–11', 'Safety', 30, 1350, 'Mr Ian Mpofu', 'Submitted'], ['d-1', 'Laptop for control room', 'IT', 2, 2400, 'Ms Ruth Gora', 'Submitted'], ['d-3', 'Bearing 6312 2RS', 'Maintenance', 12, 540, 'Mr Ian Mpofu', 'Approved'], ['d-6', 'Diesel for standby genset', 'Operations', 2000, 3200, 'Mr Ian Mpofu', 'Ordered'], ['d-15', 'Office chairs', 'Admin', 6, 780, 'Mrs Lisa Chari', 'Received'], ['d-20', 'Gaming monitor', 'IT', 1, 650, 'Ms Ruth Gora', 'Rejected']]
    },
    pos: {
      label: 'Purchase orders', icon: 'receipt', code: 'PO', one: 'purchase order', addLabel: 'Raise PO', desc: 'Orders sent to suppliers.',
      fields: 'date:Date:date|supplier:Supplier:ref:suppliers.name|items:Items|amount:Amount:money|quotes:Quotes compared:num|due:Delivery due:date|status:Status:status:Sent~warn,Delivered~ok,Invoiced~info,Paid~grey',
      print: 'Print purchase order',
      actions: [['Goods received', 'status=Delivered', 'status=Sent'], ['Mark paid', 'status=Paid', 'status=Delivered,Invoiced']],
      rows: [['d-5', 'Puma Energy', '2000 L diesel', 3150, 3, 'd-1', 'Sent'], ['d-2', 'Bearings International', '12× 6312 2RS', 516, 3, 'd+5', 'Sent'], ['d-14', 'Office Mart', '6× office chairs', 760, 3, 'd-8', 'Delivered'], ['d-40', 'Safety World', 'PPE restock', 2900, 2, 'd-30', 'Paid'], ['d-70', 'Puma Energy', '3000 L diesel', 4650, 3, 'd-66', 'Paid']]
    },
    suppliers: {
      label: 'Suppliers', icon: 'truck', one: 'supplier', desc: 'Approved suppliers with ratings.',
      fields: 'name:Supplier|cat:Supplies:sel:Fuel,Spares,PPE,Office,IT|phone:Phone:tel|rating:Rating:stars|spend:Spend to date:=money|status:Status:status:Approved~ok,On review~warn,Blocked~bad',
      calc: { spend: (r, H) => H.sum('pos', 'amount', 'supplier=' + r.name) },
      related: [['pos', 'supplier', 'Purchase orders', ['date', 'items', 'amount', 'status']]],
      rows: [['Puma Energy', 'Fuel', '0242 304 800', 4, 'Approved'], ['Bearings International', 'Spares', '0242 621 445', 5, 'Approved'], ['Office Mart', 'Office', '0242 772 019', 3, 'Approved'], ['Safety World', 'PPE', '0292 880 112', 2, 'On review'], ['Tech Hub ZW', 'IT', '0242 252 553', 4, 'Approved']]
    }
  },
  dash: {
    quick: [['New requisition', 'reqs', 1], ['Raise PO', 'pos']],
    kpis: [['Waiting approval', 'count:reqs?status=Submitted', 'num'], ['Spend this month', (H) => H.sum('pos', 'amount', 'date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Open orders', 'sum:pos.amount?status=Sent', 'money'], ['Spend (90 days)', 'sum:pos.amount?date>=d-90', 'money']],
    alerts: [['reqs?status=Submitted', '{n} requisition{s} waiting for approval', 'warn'], ['pos?status=Sent&due<today', '{n} order{s} late from suppliers', 'bad'], ['pos?quotes<3', '{n} order{s} placed with fewer than 3 quotes', 'warn']],
    charts: [['Spend by month', 'month:pos.date.amount', 'money'], ['Requests by department', 'sum:reqs.dept.est', 'money'], ['Spend by supplier', 'sum:pos.supplier.amount', 'money']],
    recent: [['reqs', 'Latest requisitions', 5, ['date', 'item', 'dept', 'est', 'status']]]
  }
});

window.__SYS.push({
  id: 'assetbook', name: 'AssetBook', tag: 'Asset register', group: 'Departments in any business', icon: 'layers', color: '#334155', color2: '#38bdf8',
  org: { name: 'City of Mutare', place: 'Mutare', phone: '+263 20 206 4412' },
  blurb: 'Fixed asset register with tags, locations, custodians, depreciation, maintenance and disposals for audits.',
  headline: 'Know where every asset is, who has it and what it is worth.',
  features: ['Asset tags with location and custodian', 'Straight-line depreciation worked out', 'Transfers between departments', 'Audit-ready register and disposals'],
  roles: [
    ['fin', 'Finance / assets officer', 'Mrs Chipo Matanda', 'Full register', ['dash', 'assets', 'moves', 'reports']],
    ['dept', 'Department head', 'Mr Abel Makoni', 'Own department assets', ['assets:r', 'moves'], { assets: 'dept=Water' }],
    ['audit', 'Auditor', 'Ms Tendai Mukori', 'Read only', ['dash', 'assets:r', 'moves:r', 'reports']]
  ],
  tables: {
    assets: {
      label: 'Assets', icon: 'tag', code: 'MUT', one: 'asset', addLabel: 'Add asset', desc: 'Everything owned, tagged and valued.',
      fields: 'name:Asset|cat:Category:sel:Vehicles,Computers,Furniture,Plant & machinery,Buildings|dept:Department:sel:Finance,Water,Roads,Health,Admin|custodian:Custodian|bought:Bought:date|cost:Cost:money|life:Life (years):num|value:Book value:=money|status:Status:status:In use~ok,Under repair~warn,Disposed~grey,Missing~bad',
      calc: { value: (r, H) => { const yrs = H.days(r.bought) / 365; return Math.max(0, (+r.cost || 0) * (1 - yrs / (+r.life || 1))); } },
      print: 'Print asset tag',
      rows: [['Toyota Hilux AEZ 4410', 'Vehicles', 'Water', 'Mr Abel Makoni', 'd-900', 38000, 5, 'In use'], ['Water pump 75 kW', 'Plant & machinery', 'Water', 'Mr Peter Gotora', 'd-1500', 42000, 15, 'Under repair'], ['Dell laptop (x12)', 'Computers', 'Finance', 'Mrs Chipo Matanda', 'd-400', 10800, 3, 'In use'], ['Grader CAT 140', 'Plant & machinery', 'Roads', 'Mr Joseph Ruvimbo', 'd-2500', 185000, 20, 'In use'], ['Clinic beds (x20)', 'Furniture', 'Health', 'Sister R. Mlambo', 'd-700', 9000, 10, 'In use'], ['Projector Epson', 'Computers', 'Admin', 'Ms Ivy Gumbo', 'd-1100', 900, 4, 'Missing'], ['Nissan NP200 ABD 1102', 'Vehicles', 'Health', 'Mr Ishmael Chari', 'd-3000', 16000, 5, 'Disposed']]
    },
    moves: {
      label: 'Transfers & checks', icon: 'refresh', code: 'MV', one: 'movement', addLabel: 'Log movement', desc: 'Transfers, repairs, verifications and disposals.',
      fields: 'date:Date:date|asset:Asset:ref:assets.name|action:Action:sel:Transfer,Sent for repair,Verified in audit,Disposed,Reported missing|from:From|to:To|by:By',
      defaults: { by: 'me' },
      rows: [['d-2', 'Water pump 75 kW', 'Sent for repair', 'Sakubva pump station', 'Mutare Engineering', 'Mr Peter Gotora'], ['d-10', 'Projector Epson', 'Reported missing', 'Boardroom', '', 'Ms Ivy Gumbo'], ['d-30', 'Dell laptop (x12)', 'Verified in audit', 'Finance', 'Finance', 'Ms Tendai Mukori'], ['d-60', 'Nissan NP200 ABD 1102', 'Disposed', 'Health', 'Auction', 'Mrs Chipo Matanda']]
    }
  },
  dash: {
    kpis: [['Assets in use', 'count:assets?status=In use,Under repair', 'num'], ['Original cost', 'sum:assets.cost?status!=Disposed', 'money'], ['Book value', 'sum:assets.value?status!=Disposed', 'money', 'After depreciation'], ['Missing', 'count:assets?status=Missing', 'num']],
    alerts: [['assets?status=Missing', '{n} asset{s} reported missing', 'bad'], ['assets?status=Under repair', '{n} asset{s} under repair', 'warn']],
    charts: [['Book value by category', 'sum:assets.cat.value?status!=Disposed', 'money'], ['Assets by department', 'by:assets.dept'], ['Asset status', 'by:assets.status']],
    recent: [['moves', 'Latest movements', 4, ['date', 'asset', 'action', 'to']]]
  }
});

window.__SYS.push({
  id: 'helpdesk', name: 'HelpDesk', tag: 'IT & customer support tickets', group: 'Departments in any business', icon: 'headset', color: '#1d4ed8', color2: '#a855f7',
  org: { name: 'ZimNet Internet Services', place: 'Harare', phone: '+263 8677 000 111' },
  blurb: 'Support tickets with priority, response times, agents and customer satisfaction for IT teams and service desks.',
  headline: 'Every complaint answered, every ticket closed on time.',
  features: ['Tickets from WhatsApp, email, phone and walk-in', 'Priority and response deadlines (SLA)', 'Board view from Open to Resolved', 'Customer satisfaction after each ticket'],
  roles: [
    ['lead', 'Support lead', 'Ms Tatenda Mavhima', 'All tickets and SLAs', ['dash', 'tickets', 'customers', 'reports']],
    ['agent', 'Support agent', 'Mr Brian Zvimba', 'Own tickets', ['tickets', 'customers:r'], { tickets: 'agent=Brian' }]
  ],
  tables: {
    tickets: {
      label: 'Tickets', icon: 'headset', code: 'TK', one: 'ticket', addLabel: 'Log ticket', board: 'default', desc: 'Support requests from customers and staff.',
      fields: 'date:Opened:date|subject:Subject|customer:Customer:ref:customers.name|channel:Channel:sel:WhatsApp,Email,Phone,Walk-in|priority:Priority:sel:Urgent,High,Normal,Low|agent:Agent:sel:Brian,Nokuthula,Farai,Unassigned|due:Respond by:=text|rating:Rating:stars|status:Status:status:Open~bad,In progress~warn,Waiting on customer~info,Resolved~ok',
      calc: { due: (r, H) => H.addDays({ Urgent: 0, High: 1, Normal: 2, Low: 5 }[r.priority] || 2, r.date) },
      card: ['customer', 'priority', 'agent'], defaults: { agent: 'Unassigned', rating: '' },
      rows: [['d0', 'Fibre down since morning', 'Avondale Pharmacy', 'WhatsApp', 'Urgent', 'Brian', '', 'In progress'], ['d0', 'Cannot log in to email', 'Kopje Properties', 'Phone', 'High', 'Unassigned', '', 'Open'], ['d-1', 'Slow speeds in evening', 'Mr T. Gondo', 'Email', 'Normal', 'Nokuthula', '', 'Waiting on customer'], ['d-1', 'Router replacement', 'Greendale Clinic', 'Walk-in', 'High', 'Farai', '', 'In progress'], ['d-3', 'Invoice query', 'Mrs A. Phiri', 'Email', 'Low', 'Brian', '', 'Open'], ['d-4', 'Wi-Fi password reset', 'Mr T. Gondo', 'WhatsApp', 'Normal', 'Brian', 5, 'Resolved'], ['d-9', 'New office connection', 'Kopje Properties', 'Email', 'Normal', 'Farai', 4, 'Resolved'], ['d-35', 'Outage in Avondale', 'Avondale Pharmacy', 'Phone', 'Urgent', 'Nokuthula', 3, 'Resolved']]
    },
    customers: {
      label: 'Customers', icon: 'users', one: 'customer', desc: 'Accounts with their package.',
      fields: 'name:Customer|package:Package:sel:Home 20 Mbps,Home 50 Mbps,Business 100 Mbps,Business 200 Mbps|phone:Phone:tel|area:Area|open:Open tickets:=num',
      calc: { open: (r, H) => H.count('tickets', 'customer=' + r.name + '&status!=Resolved') },
      related: [['tickets', 'customer', 'Tickets', ['date', 'subject', 'status']]],
      rows: [['Avondale Pharmacy', 'Business 100 Mbps', '0242 339 220', 'Avondale'], ['Kopje Properties', 'Business 200 Mbps', '0242 339 140', 'Avondale'], ['Mr T. Gondo', 'Home 50 Mbps', '0772 330 118', 'Greendale'], ['Greendale Clinic', 'Business 100 Mbps', '0242 495 210', 'Greendale'], ['Mrs A. Phiri', 'Home 20 Mbps', '0773 662 980', 'Mabelreign']]
    }
  },
  dash: {
    quick: [['Log ticket', 'tickets', 1]],
    kpis: [['Open tickets', 'count:tickets?status!=Resolved', 'num'], ['Past response time', 'count:tickets?status=Open,In progress&due<today', 'num', 'SLA breached'], ['Resolved (30 days)', 'count:tickets?status=Resolved&date>=d-30', 'num'], ['Satisfaction', (H) => H.where('tickets', 'rating>0').reduce((a, r, i, l) => a + r.rating / l.length, 0) / 5 * 100, 'pct', 'From customer ratings']],
    alerts: [['tickets?status=Open&agent=Unassigned', '{n} ticket{s} not assigned to anyone', 'bad'], ['tickets?priority=Urgent&status!=Resolved', '{n} urgent ticket{s} open', 'bad'], ['tickets?status=Open,In progress&due<today', '{n} ticket{s} past response time', 'warn']],
    charts: [['Tickets by month', 'month:tickets.date', 'num'], ['Tickets by channel', 'by:tickets.channel'], ['Open tickets by agent', 'by:tickets.agent?status!=Resolved']],
    recent: [['tickets', 'Latest tickets', 5, ['subject', 'customer', 'priority', 'status']]]
  }
});

window.__SYS.push({
  id: 'frontgate', name: 'FrontGate', tag: 'Visitors & reception', group: 'Departments in any business', icon: 'door', color: '#0f766e', color2: '#fbbf24',
  org: { name: 'Pearl House Offices', place: 'Harare CBD', phone: '+263 242 707 330' },
  blurb: 'Visitor sign-in, host notifications, badges, pre-booked guests, deliveries and evacuation lists for receptions and gates.',
  headline: 'Know who is in the building right now, and who they came to see.',
  features: ['Sign visitors in and out in seconds', 'Pre-booked guests on a calendar', 'Deliveries and parcels for staff', 'Live on-site list for fire drills'],
  roles: [
    ['admin', 'Facilities manager', 'Mr Clifford Murambiwa', 'All visitors and reports', ['dash', 'visitors', 'calendar', 'deliveries', 'reports']],
    ['recep', 'Receptionist', 'Ms Chido Makuvaza', 'Sign in and out', ['visitors', 'calendar', 'deliveries']],
    ['guard', 'Gate guard', 'Mr Tafara Shumba', 'Gate log', ['visitors']]
  ],
  modules: { calendar: { type: 'agenda', label: 'Expected guests', icon: 'calendar', table: 'visitors', date: 'date', time: 'in', title: 'name', sub: 'host' } },
  tables: {
    visitors: {
      label: 'Visitors', icon: 'users', code: 'VS', one: 'visitor', addLabel: 'Sign visitor in', desc: 'Everyone who came in through the front door.',
      fields: 'date:Date:date|in:Time in:time|name:Visitor|company:Company|host:Here to see:sel:Mr Chikore (CEO),Finance,HR,IT,Sales|badge:Badge:sel:V01,V02,V03,V04,V05,V06|out:Time out:time|status:Status:=status:Expected~info,On site~warn,Signed out~ok|-arrived:Arrived:sel:No,Yes',
      calc: { status: (r) => r.out ? 'Signed out' : r.arrived === 'Yes' ? 'On site' : 'Expected' },
      actions: [['Arrived: sign in', (r) => { r.arrived = 'Yes'; const d = new Date(); r.in = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }, 'status=Expected', 'Signed in'], ['Sign out', (r) => { const d = new Date(); r.out = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }, 'status=On site', 'Signed out']],
      defaults: { arrived: 'Yes' }, print: 'Print visitor badge',
      rows: [['d0', '08:05', 'Mr Peter Moyo', 'ZIMRA', 'Finance', 'V01', '09:40', 'Yes'], ['d0', '09:12', 'Ms Linda Banda', 'Old Mutual', 'Mr Chikore (CEO)', 'V02', '', 'Yes'], ['d0', '10:30', 'Mr Kevin Ncube', 'Tech Hub ZW', 'IT', 'V03', '', 'Yes'], ['d0', '14:00', 'Mrs Agnes Dube', 'Job interview', 'HR', '', '', 'No'], ['d+1', '09:00', 'Board members (x4)', 'Board', 'Mr Chikore (CEO)', '', '', 'No'], ['d+2', '11:00', 'Mr Tonde Sithole', 'CBZ Bank', 'Finance', '', '', 'No'], ['d-1', '13:20', 'Ms Rudo Phiri', 'Supplier', 'Sales', 'V04', '14:05', 'Yes']]
    },
    deliveries: {
      label: 'Deliveries', icon: 'box', code: 'DV', one: 'delivery', addLabel: 'Log delivery', desc: 'Parcels and documents for staff.',
      fields: 'date:Date:date|from:From|for:For|item:Item|status:Status:status:At reception~warn,Collected~ok',
      actions: [['Collected', 'status=Collected', 'status=At reception']],
      rows: [['d0', 'DHL', 'Finance', 'Bank statements', 'At reception'], ['d0', 'Tumira couriers', 'Mr Chikore (CEO)', 'Parcel', 'At reception'], ['d-1', 'Office Mart', 'Admin', 'Stationery (3 boxes)', 'Collected']]
    }
  },
  dash: {
    quick: [['Sign visitor in', 'visitors', 1]],
    kpis: [['On site now', 'count:visitors?status=On site', 'num', 'For a fire drill'], ['Visitors today', 'count:visitors?date=today&arrived=Yes', 'num'], ['Expected today', 'count:visitors?date=today&status=Expected', 'num'], ['Parcels waiting', 'count:deliveries?status=At reception', 'num']],
    alerts: [['visitors?status=On site&date<today', '{n} visitor{s} never signed out', 'bad'], ['visitors?date=today&status=Expected', '{n} guest{s} still expected today', 'info'], ['deliveries?status=At reception', '{n} parcel{s} waiting at reception', 'warn']],
    charts: [['Visitors by month', 'month:visitors.date?arrived=Yes', 'num'], ['Visitors by host', 'by:visitors.host'], ['Visitor status', 'by:visitors.status']],
    recent: [['visitors', 'On site and today', 6, ['in', 'name', 'company', 'host', 'status']]]
  }
});

window.__SYS.push({
  id: 'safesite', name: 'SafeSite', tag: 'Health, safety & environment (SHEQ)', group: 'Departments in any business', icon: 'alert', color: '#b91c1c', color2: '#facc15',
  org: { name: 'Zvishavane Mining Co.', place: 'Zvishavane', phone: '+263 51 225 8800' },
  blurb: 'Incident reporting, investigations, inspections, toolbox talks, PPE issue and safety statistics for SHEQ teams.',
  headline: 'Every hazard reported, every incident closed, every worker home safe.',
  features: ['Report incidents and near misses from a phone', 'Investigations with corrective actions', 'Inspections with scores', 'Days without a lost-time injury'],
  roles: [
    ['sheq', 'SHEQ manager', 'Mr Gift Mangwende', 'All safety data', ['dash', 'incidents', 'inspections', 'talks', 'ppe', 'reports']],
    ['super', 'Supervisor', 'Ms Esther Chuma', 'Report and inspect', ['incidents', 'inspections', 'talks']],
    ['worker', 'Any worker', 'Mr Lovemore Mhaka', 'Report a hazard', ['incidents'], { incidents: 'by=Mr Lovemore Mhaka' }]
  ],
  tables: {
    incidents: {
      label: 'Incidents', icon: 'alert', code: 'IR', one: 'incident', addLabel: 'Report incident', board: true, desc: 'Incidents, near misses and hazards.',
      fields: 'date:Date:date|area:Area:sel:Open pit,Plant,Workshop,Stores,Offices,Tailings|type:Type:sel:Hazard,Near miss,First aid,Medical treatment,Lost time injury,Environmental|what:What happened:area|action:Corrective action|by:Reported by|status:Status:status:Reported~bad,Investigating~warn,Action open~warn,Closed~ok',
      defaults: { by: 'me' },
      rows: [['d0', 'Workshop', 'Hazard', 'Oil spill near the lathe, not cordoned.', '', 'Mr Lovemore Mhaka', 'Reported'], ['d-2', 'Plant', 'Near miss', 'Loader reversed close to pedestrian walkway.', 'Install reverse alarms, mark walkways', 'Ms Esther Chuma', 'Action open'], ['d-5', 'Open pit', 'First aid', 'Worker cut hand on steel rope.', 'Issue cut-resistant gloves', 'Ms Esther Chuma', 'Closed'], ['d-12', 'Tailings', 'Environmental', 'Seepage at TSF wall section 3.', 'Engineer assessment', 'Mr Gift Mangwende', 'Investigating'], ['d-140', 'Plant', 'Lost time injury', 'Fractured foot from falling liner.', 'Lifting procedure updated', 'Mr Gift Mangwende', 'Closed'], ['d-40', 'Stores', 'Near miss', 'Pallet fell from racking.', 'Racking inspection', 'Ms Esther Chuma', 'Closed']]
    },
    inspections: {
      label: 'Inspections', icon: 'clipboard', code: 'INSP', one: 'inspection', addLabel: 'New inspection', desc: 'Planned inspections with score.',
      fields: 'date:Date:date|area:Area:sel:Open pit,Plant,Workshop,Stores,Offices,Tailings|type:Type:sel:Housekeeping,Fire equipment,Electrical,Scaffolding,Vehicles|score:Score:bar|by:Inspector|findings:Findings',
      defaults: { by: 'me' },
      rows: [['d-1', 'Workshop', 'Housekeeping', 62, 'Ms Esther Chuma', 'Oil on floor, tools left out'], ['d-3', 'Plant', 'Electrical', 88, 'Mr Gift Mangwende', 'Two DB covers missing'], ['d-8', 'Offices', 'Fire equipment', 95, 'Ms Esther Chuma', 'One extinguisher due service'], ['d-15', 'Open pit', 'Vehicles', 79, 'Mr Gift Mangwende', 'Two LDVs without flags']]
    },
    talks: {
      label: 'Toolbox talks', icon: 'megaphone', code: 'TT', one: 'talk', addLabel: 'Record talk', desc: 'Daily safety talks and who attended.',
      fields: 'date:Date:date|topic:Topic|area:Area:sel:Open pit,Plant,Workshop,Stores,Offices,Tailings|by:Given by|attended:Attended:num',
      defaults: { by: 'me' },
      rows: [['d0', 'Working at heights', 'Plant', 'Ms Esther Chuma', 24], ['d-1', 'Isolation and lock-out', 'Workshop', 'Mr Gift Mangwende', 18], ['d-2', 'Heat stress', 'Open pit', 'Ms Esther Chuma', 41]]
    },
    ppe: {
      label: 'PPE issue', icon: 'hardhat', code: 'PPE', one: 'issue', addLabel: 'Issue PPE', desc: 'Protective equipment issued to workers.',
      fields: 'date:Date:date|worker:Worker|item:Item:sel:Hard hat,Safety boots,Gloves,Overalls,Ear plugs,Safety glasses,Reflective vest|qty:Qty:num|by:Issued by',
      defaults: { by: 'me' },
      rows: [['d0', 'Mr Lovemore Mhaka', 'Gloves', 2, 'Stores'], ['d-1', 'Mr Peter Chari', 'Safety boots', 1, 'Stores'], ['d-5', 'Ms Rose Tavengwa', 'Overalls', 2, 'Stores']]
    }
  },
  dash: {
    quick: [['Report incident', 'incidents', 1], ['Record toolbox talk', 'talks']],
    kpis: [['Days without LTI', (H) => { const l = H.where('incidents', 'type=Lost time injury').map((r) => r.date).sort().pop(); return l ? H.days(l) : 365; }, 'num', 'Since the last lost-time injury'], ['Open incidents', 'count:incidents?status!=Closed', 'num'], ['Near misses (30 days)', 'count:incidents?type=Near miss&date>=d-30', 'num', 'Reporting is good'], ['Average inspection score', 'avg:inspections.score', 'pct']],
    alerts: [['incidents?status=Reported', '{n} new report{s} to investigate', 'bad'], ['incidents?status=Action open', '{n} corrective action{s} still open', 'warn'], ['inspections?score<70', '{n} inspection{s} scored below 70%', 'warn']],
    charts: [['Incidents by month', 'month:incidents.date', 'num'], ['Incidents by type', 'by:incidents.type'], ['Incidents by area', 'by:incidents.area']],
    recent: [['incidents', 'Latest reports', 5, ['date', 'area', 'type', 'status']]]
  }
});

window.__SYS.push({
  id: 'doctrack', name: 'DocTrack', tag: 'Contracts & compliance register', group: 'Departments in any business', icon: 'file', color: '#475569', color2: '#14b8a6',
  org: { name: 'Zambezi Logistics (Pvt) Ltd', place: 'Southerton, Harare', phone: '+263 242 621 773' },
  blurb: 'Contracts, licences, permits, insurance and compliance certificates with owners, values and expiry reminders.',
  headline: 'Never miss a renewal: contracts, licences and permits all in one register.',
  features: ['Every contract with value, owner and end date', 'Licences and permits: ZIMRA, NSSA, EMA, council', 'Renewal reminders 60 days before expiry', 'Approval trail for new contracts'],
  roles: [
    ['legal', 'Company secretary', 'Mrs Rutendo Chimanikire', 'Full register', ['dash', 'docs', 'approvals', 'reports']],
    ['mgr', 'Department manager', 'Mr Kelvin Mashingaidze', 'Own documents', ['docs', 'approvals'], { docs: 'owner=Mr Kelvin Mashingaidze' }]
  ],
  tables: {
    docs: {
      label: 'Register', icon: 'file', code: 'DOC', one: 'document', addLabel: 'Add document', desc: 'Contracts, licences and certificates.',
      fields: 'title:Document|type:Type:sel:Customer contract,Supplier contract,Lease,Licence / permit,Insurance,Tax clearance,Employment|party:Other party|owner:Owner|value:Value:money|start:Start:date|ends:Expires:date|status:Status:=status:Active~ok,Renew soon~warn,Expired~bad',
      calc: { status: (r, H) => !r.ends ? 'Active' : r.ends < H.today ? 'Expired' : H.days(H.today, r.ends) <= 60 ? 'Renew soon' : 'Active' },
      actions: [['Renewed for 1 year', (r, H) => { r.ends = H.addDays(365, r.ends > H.today ? r.ends : H.today); }, '', 'Renewal recorded']],
      rows: [['Haulage agreement', 'Customer contract', 'Delta Beverages', 'Mr Kelvin Mashingaidze', 84000, 'd-300', 'd+65'], ['Warehouse lease', 'Lease', 'Southerton Properties', 'Mrs Rutendo Chimanikire', 14400, 'd-700', 'd+30'], ['ZIMRA tax clearance (ITF 263)', 'Tax clearance', 'ZIMRA', 'Mrs Rutendo Chimanikire', 0, 'd-330', 'd+35'], ['Goods-in-transit insurance', 'Insurance', 'Old Mutual Insurance', 'Mr Kelvin Mashingaidze', 7600, 'd-200', 'd+165'], ['Cross-border operator permit', 'Licence / permit', 'Ministry of Transport', 'Mr Kelvin Mashingaidze', 0, 'd-380', 'd-15'], ['EMA licence: fuel storage', 'Licence / permit', 'EMA', 'Mrs Rutendo Chimanikire', 0, 'd-100', 'd+265'], ['Tyre supply contract', 'Supplier contract', 'Tyre Express', 'Mr Kelvin Mashingaidze', 22000, 'd-60', 'd+300']]
    },
    approvals: {
      label: 'Approvals', icon: 'check', code: 'AP', one: 'approval', addLabel: 'Request approval', board: 'default', desc: 'New contracts waiting for sign-off.',
      fields: 'date:Date:date|title:Contract|party:Other party|value:Value:money|by:Requested by|status:Status:status:Draft~grey,Legal review~warn,Director sign-off~info,Signed~ok,Rejected~bad',
      card: ['party', 'value', 'by'], defaults: { by: 'me' },
      rows: [['d-1', 'Distribution contract', 'Schweppes Zimbabwe', 114000, 'Mr Kelvin Mashingaidze', 'Legal review'], ['d-4', 'Security services', 'Sentinel Guard Services', 15600, 'Mrs Rutendo Chimanikire', 'Director sign-off'], ['d-9', 'Fuel supply', 'Zuva Petroleum', 46000, 'Mr Kelvin Mashingaidze', 'Signed']]
    }
  },
  dash: {
    quick: [['Add document', 'docs', 1]],
    kpis: [['Documents', 'count:docs', 'num'], ['Renew within 60 days', 'count:docs?status=Renew soon', 'num'], ['Expired', 'count:docs?status=Expired', 'num'], ['Contract value', 'sum:docs.value?status!=Expired', 'money']],
    alerts: [['docs?status=Expired', '{n} document{s} expired: renew now', 'bad'], ['docs?status=Renew soon', '{n} document{s} expire within 60 days', 'warn'], ['approvals?status=Legal review,Director sign-off', '{n} contract{s} waiting for sign-off', 'info']],
    charts: [['Documents by type', 'by:docs.type'], ['Value by type', 'sum:docs.type.value', 'money'], ['Register status', 'by:docs.status']],
    recent: [['docs', 'Renewals coming up', 5, ['title', 'party', 'ends', 'status']]]
  }
});

window.__SYS.push({
  id: 'skilllog', name: 'SkillLog', tag: 'Training & certifications', group: 'Departments in any business', icon: 'award', color: '#9a3412', color2: '#fdba74',
  org: { name: 'MEA Training Centre', place: 'Harare', phone: '' },
  blurb: 'Training courses, sessions, attendance, certificates, tickets and expiry dates for training providers and HR.',
  headline: 'Every ticket and certificate valid, and every course full.',
  features: ['Training calendar with bookings', 'Certificates and tickets with expiry dates', 'Alerts before a ticket expires', 'Training cost and hours per person'],
  roles: [
    ['tm', 'Training manager', 'Ms Monica Gumbo', 'Courses and certificates', ['dash', 'calendar', 'sessions', 'certs', 'courses', 'reports']],
    ['trainer', 'Trainer', 'Mr Fortune Chikanga', 'Sessions and attendance', ['calendar', 'sessions', 'certs']],
    ['staff', 'Staff member', 'Mr Tapiwa Moyo', 'Own certificates', ['certs:r'], { certs: 'person=Mr Tapiwa Moyo' }]
  ],
  modules: { calendar: { type: 'agenda', label: 'Training calendar', icon: 'calendar', table: 'sessions', date: 'date', time: 'time', title: 'course', sub: 'venue' } },
  tables: {
    courses: {
      label: 'Courses', icon: 'book', one: 'course', desc: 'Courses on offer.',
      fields: 'name:Course|cat:Category:sel:Electrical,Instrumentation,Safety,PLC & automation,Soft skills|days:Days:num|price:Price per person:money|valid:Certificate valid (years):num',
      rows: [['HV switching ticket', 'Electrical', 3, 450, 3], ['PLC programming level 1', 'PLC & automation', 5, 600, 0], ['First aid level 2', 'Safety', 2, 120, 2], ['Working at heights', 'Safety', 1, 90, 2], ['Instrument calibration', 'Instrumentation', 4, 520, 0], ['Supervisory skills', 'Soft skills', 2, 200, 0]]
    },
    sessions: {
      label: 'Sessions', icon: 'calendar', code: 'TS', one: 'session', addLabel: 'Schedule session', desc: 'Upcoming and past training sessions.',
      fields: 'date:Date:date|time:Time:time|course:Course:ref:courses.name|venue:Venue:sel:Harare training room,Bulawayo,On client site,Online|trainer:Trainer|booked:Booked:num|seats:Seats:num|fill:Full:=bar|status:Status:status:Open~ok,Full~warn,Done~grey',
      calc: { fill: (r) => r.seats ? (r.booked / r.seats) * 100 : 0 },
      rows: [['d+2', '08:00', 'HV switching ticket', 'Harare training room', 'Mr Fortune Chikanga', 10, 12, 'Open'], ['d+3', '08:00', 'First aid level 2', 'On client site', 'Sister T. Ncube', 16, 16, 'Full'], ['d+6', '08:30', 'PLC programming level 1', 'Harare training room', 'Mr Fortune Chikanga', 7, 10, 'Open'], ['d+9', '09:00', 'Working at heights', 'Bulawayo', 'Mr B. Sibanda', 4, 12, 'Open'], ['d-12', '08:00', 'Instrument calibration', 'Harare training room', 'Mr Fortune Chikanga', 8, 8, 'Done']]
    },
    certs: {
      label: 'Certificates', icon: 'award', code: 'CERT', one: 'certificate', addLabel: 'Add certificate', desc: 'Who holds which ticket, and when it expires.',
      fields: 'person:Person|company:Company|course:Certificate:ref:courses.name|issued:Issued:date|expires:Expires:date|status:Status:=status:Valid~ok,Expiring~warn,Expired~bad,No expiry~info',
      calc: { status: (r, H) => !r.expires ? 'No expiry' : r.expires < H.today ? 'Expired' : H.days(H.today, r.expires) <= 60 ? 'Expiring' : 'Valid' },
      print: 'Print certificate',
      rows: [['Mr Tapiwa Moyo', 'Zvishavane Mining Co.', 'HV switching ticket', 'd-1050', 'd+45'], ['Mr Tapiwa Moyo', 'Zvishavane Mining Co.', 'First aid level 2', 'd-800', 'd-70'], ['Ms Ruth Mapfumo', 'Shamva Gold', 'Working at heights', 'd-200', 'd+530'], ['Mr Peter Dube', 'Hwange Power Services', 'PLC programming level 1', 'd-90', ''], ['Mr Simba Zhou', 'Hwange Power Services', 'HV switching ticket', 'd-1080', 'd+15'], ['Ms Grace Ncube', 'Kariba Foods', 'First aid level 2', 'd-30', 'd+700']]
    }
  },
  dash: {
    quick: [['Schedule session', 'sessions', 1], ['Add certificate', 'certs']],
    kpis: [['Sessions coming up', 'count:sessions?date>=today', 'num'], ['Seats booked', 'sum:sessions.booked?date>=today', 'num'], ['Training income booked', (H) => H.where('sessions', 'date>=today').reduce((a, s) => { const c = H.find('courses', 'name', s.course); return a + (c ? c.price * s.booked : 0); }, 0), 'money'], ['Tickets expiring (60 days)', 'count:certs?status=Expiring', 'num']],
    alerts: [['certs?status=Expired', '{n} certificate{s} expired: book a refresher', 'bad'], ['certs?status=Expiring', '{n} certificate{s} expire within 60 days', 'warn'], ['sessions?status=Open&date<=d+3', '{n} session{s} this week with seats left', 'info']],
    charts: [['Seats booked by course', 'sum:sessions.course.booked', 'num'], ['Certificates by status', 'by:certs.status'], ['Courses by category', 'by:courses.cat']],
    recent: [['sessions', 'Upcoming sessions', 5, ['date', 'course', 'venue', 'booked', 'status']]]
  }
});
