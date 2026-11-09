/* Education & community */
window.__SYS.push({
  id: 'chikoro', name: 'Chikoro', tag: 'School management', group: 'Education & community', icon: 'cap', color: '#1e40af', color2: '#f59e0b',
  org: { name: 'Mufakose High School', place: 'Mufakose, Harare', phone: '+263 242 610 455' },
  blurb: 'Pupils, fees, results, report cards and attendance for primary and secondary schools.',
  headline: 'Run the whole school from one place: fees, results and attendance.',
  features: ['Fee balances update the moment a payment is receipted', 'Teachers enter marks; grades and report cards are automatic', 'Parents see only their own child\'s fees and results', 'Daily attendance by class with term reports'],
  roles: [
    ['head', 'Head / Admin', 'Mrs Tariro Moyo', 'Sees the whole school', ['dash', 'pupils', 'payments', 'results', 'attendance', 'staff', 'reports']],
    ['bursar', 'Bursar', 'Mr Farai Ndlovu', 'Fees, receipts and arrears', ['dash', 'payments', 'pupils:r', 'reports']],
    ['teacher', 'Teacher', 'Ms Rudo Chikore', 'Marks and the class register', ['results', 'attendance', 'pupils:r']],
    ['parent', 'Parent portal', 'Mr Blessing Mutasa', 'Own child only', ['pupils:r', 'payments:r', 'results:r'], { pupils: 'guardian=Mr B. Mutasa', payments: 'pupil=Tanaka Mutasa', results: 'pupil=Tanaka Mutasa' }]
  ],
  tables: {
    pupils: {
      label: 'Pupils', icon: 'users', code: 'P', desc: 'Every enrolled pupil with class, guardian and fee balance for the term.',
      fields: 'name:Pupil name|cls:Class:sel:Form 1A,Form 1B,Form 2A,Form 3A,Form 4A,Lower 6,Upper 6|-gender:Gender:sel:F,M|guardian:Guardian|-phone:Guardian phone:tel|fees:Term fees:money|paid:Paid:money|bal:Balance:=money|status:Status:status:Active~ok,Suspended~bad,Left~grey',
      calc: { bal: (r) => (Number(r.fees) || 0) - (Number(r.paid) || 0) },
      actions: [['Mark fees fully paid', 'paid=@fees', 'bal>0', 'Fees marked as paid']],
      related: [['payments', 'pupil', 'Fee payments', ['date', 'amount', 'method']], ['results', 'pupil', 'Results', ['subject', 'mark', 'grade']]],
      print: 'Print fee statement',
      rows: [
        ['Tanaka Mutasa', 'Form 3A', 'M', 'Mr B. Mutasa', '0772 114 908', 480, 300, 'Active'],
        ['Nyasha Gumbo', 'Form 1A', 'F', 'Mrs P. Gumbo', '0773 552 019', 420, 420, 'Active'],
        ['Kudakwashe Sibanda', 'Form 4A', 'M', 'Mr T. Sibanda', '0712 330 871', 480, 150, 'Active'],
        ['Ruvimbo Chirwa', 'Lower 6', 'F', 'Ms A. Chirwa', '0784 662 104', 560, 560, 'Active'],
        ['Tatenda Banda', 'Form 2A', 'M', 'Mrs L. Banda', '0775 201 554', 450, 0, 'Active'],
        ['Chiedza Marufu', 'Upper 6', 'F', 'Mr K. Marufu', '0778 903 116', 560, 400, 'Active'],
        ['Tinashe Dube', 'Form 1B', 'M', 'Mrs R. Dube', '0719 448 230', 420, 380, 'Active'],
        ['Rutendo Nyathi', 'Form 3A', 'F', 'Mr S. Nyathi', '0773 870 665', 480, 480, 'Active'],
        ['Simbarashe Zhou', 'Form 4A', 'M', 'Mrs J. Zhou', '0782 115 093', 480, 200, 'Suspended'],
        ['Fadzai Mlambo', 'Form 2A', 'F', 'Mr C. Mlambo', '0771 664 280', 450, 450, 'Active'],
        ['Takudzwa Phiri', 'Lower 6', 'M', 'Ms N. Phiri', '0714 902 337', 560, 100, 'Active'],
        ['Vimbai Chakanetsa', 'Form 1A', 'F', 'Mrs E. Chakanetsa', '0776 338 412', 420, 420, 'Left']
      ]
    },
    payments: {
      label: 'Fee payments', icon: 'receipt', code: 'RCT', one: 'payment', addLabel: 'Record payment', desc: 'Receipts for school fees. Each payment updates the pupil\'s balance.',
      fields: 'date:Date:date|pupil:Pupil:ref:pupils.name|amount:Amount:money|method:Method:sel:Cash USD,EcoCash,Bank transfer,ZiG|term:Term:sel:Term 3 2026,Term 2 2026|by:Received by',
      defaults: { by: 'me' }, print: 'Print receipt',
      onAdd: (r, H) => { const p = H.find('pupils', 'name', r.pupil); if (p) p.paid = (Number(p.paid) || 0) + (Number(r.amount) || 0); },
      rows: [
        ['d-1', 'Kudakwashe Sibanda', 150, 'EcoCash', 'Term 3 2026', 'Mr Farai Ndlovu'],
        ['d-2', 'Tinashe Dube', 380, 'Bank transfer', 'Term 3 2026', 'Mr Farai Ndlovu'],
        ['d-4', 'Chiedza Marufu', 200, 'Cash USD', 'Term 3 2026', 'Mr Farai Ndlovu'],
        ['d-6', 'Tanaka Mutasa', 300, 'EcoCash', 'Term 3 2026', 'Mr Farai Ndlovu'],
        ['d-9', 'Ruvimbo Chirwa', 560, 'Bank transfer', 'Term 3 2026', 'Mr Farai Ndlovu'],
        ['d-12', 'Nyasha Gumbo', 420, 'Cash USD', 'Term 3 2026', 'Mr Farai Ndlovu'],
        ['d-20', 'Rutendo Nyathi', 480, 'EcoCash', 'Term 3 2026', 'Mr Farai Ndlovu'],
        ['d-38', 'Fadzai Mlambo', 450, 'Bank transfer', 'Term 3 2026', 'Mr Farai Ndlovu'],
        ['d-45', 'Chiedza Marufu', 200, 'Cash USD', 'Term 3 2026', 'Mr Farai Ndlovu'],
        ['d-70', 'Takudzwa Phiri', 100, 'ZiG', 'Term 2 2026', 'Mr Farai Ndlovu'],
        ['d-96', 'Simbarashe Zhou', 200, 'Cash USD', 'Term 2 2026', 'Mr Farai Ndlovu'],
        ['d-130', 'Ruvimbo Chirwa', 540, 'Bank transfer', 'Term 2 2026', 'Mr Farai Ndlovu']
      ]
    },
    results: {
      label: 'Results', icon: 'award', one: 'result', addLabel: 'Enter mark', desc: 'Marks per subject and term. Grades are worked out automatically (A 75+, B 65+, C 50+, D 40+).',
      fields: 'pupil:Pupil:ref:pupils.name|subject:Subject:sel:Mathematics,English,Shona,Combined Science,Geography,History,Accounts,Agriculture|term:Term:sel:Term 3 2026,Term 2 2026|mark:Mark %:num|grade:Grade:=tag|teacher:Teacher',
      calc: { grade: (r) => { const m = Number(r.mark); return m >= 75 ? 'A' : m >= 65 ? 'B' : m >= 50 ? 'C' : m >= 40 ? 'D' : m >= 30 ? 'E' : 'U'; } },
      defaults: { teacher: 'me' },
      rows: [
        ['Tanaka Mutasa', 'Mathematics', 'Term 3 2026', 78, 'Ms Rudo Chikore'], ['Tanaka Mutasa', 'English', 'Term 3 2026', 64, 'Mr Obert Shumba'], ['Tanaka Mutasa', 'Combined Science', 'Term 3 2026', 71, 'Ms Rudo Chikore'], ['Tanaka Mutasa', 'Shona', 'Term 3 2026', 82, 'Mrs Grace Moyo'],
        ['Kudakwashe Sibanda', 'Mathematics', 'Term 3 2026', 45, 'Ms Rudo Chikore'], ['Kudakwashe Sibanda', 'Geography', 'Term 3 2026', 58, 'Mr Obert Shumba'],
        ['Rutendo Nyathi', 'Mathematics', 'Term 3 2026', 91, 'Ms Rudo Chikore'], ['Rutendo Nyathi', 'English', 'Term 3 2026', 76, 'Mr Obert Shumba'],
        ['Tatenda Banda', 'Mathematics', 'Term 3 2026', 33, 'Ms Rudo Chikore'], ['Tatenda Banda', 'Shona', 'Term 3 2026', 61, 'Mrs Grace Moyo'],
        ['Ruvimbo Chirwa', 'Accounts', 'Term 3 2026', 69, 'Mr Obert Shumba'], ['Chiedza Marufu', 'History', 'Term 3 2026', 74, 'Mr Obert Shumba'],
        ['Fadzai Mlambo', 'Agriculture', 'Term 3 2026', 38, 'Mrs Grace Moyo'], ['Takudzwa Phiri', 'Mathematics', 'Term 3 2026', 55, 'Ms Rudo Chikore'],
        ['Nyasha Gumbo', 'English', 'Term 3 2026', 88, 'Mr Obert Shumba'], ['Tinashe Dube', 'Combined Science', 'Term 3 2026', 62, 'Ms Rudo Chikore']
      ]
    },
    attendance: {
      label: 'Attendance', icon: 'clipboard', one: 'register', addLabel: 'Mark register', desc: 'Daily class registers. The rate is worked out for you.',
      fields: 'date:Date:date|cls:Class:sel:Form 1A,Form 1B,Form 2A,Form 3A,Form 4A,Lower 6,Upper 6|present:Present:num|absent:Absent:num|rate:Attendance:=bar|by:Marked by',
      calc: { rate: (r) => { const t = (+r.present || 0) + (+r.absent || 0); return t ? (r.present / t) * 100 : 0; } }, defaults: { by: 'me' },
      rows: [['d0', 'Form 3A', 38, 2, 'Ms Rudo Chikore'], ['d0', 'Form 1A', 41, 1, 'Mr Obert Shumba'], ['d-1', 'Form 3A', 36, 4, 'Ms Rudo Chikore'], ['d-1', 'Form 4A', 33, 7, 'Mrs Grace Moyo'], ['d-2', 'Lower 6', 22, 1, 'Mr Obert Shumba'], ['d-2', 'Form 2A', 39, 3, 'Mrs Grace Moyo']]
    },
    staff: {
      label: 'Staff', icon: 'user', one: 'staff member', desc: 'Teaching and support staff.',
      fields: 'name:Name|role:Role:sel:Teacher,Head of Department,Bursar,Clerk,Ground staff|subject:Subject|phone:Phone:tel|status:Status:status:On duty~ok,On leave~warn',
      rows: [['Ms Rudo Chikore', 'Head of Department', 'Mathematics & Science', '0772 551 903', 'On duty'], ['Mr Obert Shumba', 'Teacher', 'English & History', '0773 220 418', 'On duty'], ['Mrs Grace Moyo', 'Teacher', 'Shona & Agriculture', '0715 663 001', 'On leave'], ['Mr Farai Ndlovu', 'Bursar', '', '0782 330 117', 'On duty'], ['Mrs Ivy Matanga', 'Clerk', '', '0774 118 209', 'On duty'], ['Mr Peter Gwaze', 'Ground staff', '', '0719 884 552', 'On duty']]
    }
  },
  dash: {
    quick: [['Record payment', 'payments', 1], ['Add pupil', 'pupils']],
    kpis: [['Active pupils', 'count:pupils?status=Active', 'num', 'Enrolled this term'], ['Fees collected', 'sum:payments.amount?term=Term 3 2026', 'money', 'Term 3 2026'], ['Fees outstanding', 'sum:pupils.bal?bal>0', 'money', 'Across all classes'], ['Average mark', 'avg:results.mark', 'pct', 'All subjects this term']],
    alerts: [['pupils?bal>200', '{n} pupil{s} owe more than $200 in fees', 'bad'], ['results?mark<40', '{n} result{s} below a pass mark', 'warn'], ['staff?status=On leave', '{n} staff member{s} on leave today', 'info']],
    charts: [['Fees collected by month', 'month:payments.date.amount', 'money'], ['Outstanding fees by class', 'sum:pupils.cls.bal', 'money'], ['Grades this term', 'by:results.grade']],
    recent: [['payments', 'Latest fee payments', 5, ['date', 'pupil', 'amount', 'method']]]
  }
});

window.__SYS.push({
  id: 'ungano', name: 'Ungano', tag: 'Church management', group: 'Education & community', icon: 'church', color: '#6d28d9', color2: '#f472b6',
  org: { name: 'Living Waters Assembly', place: 'Belvedere, Harare', phone: '+263 77 410 2290' },
  blurb: 'Members, cell groups, tithes and offerings, pledges, services and events.',
  headline: 'Know your congregation and account for every dollar given.',
  features: ['Members and cell groups with follow-up for first-time visitors', 'Tithes, offerings and building fund receipted by EcoCash or cash', 'Members see their own giving statement on their phone', 'Service attendance and a church calendar'],
  roles: [
    ['pastor', 'Senior Pastor', 'Pastor Joseph Mapfumo', 'Full overview', ['dash', 'members', 'giving', 'calendar', 'events', 'services', 'reports']],
    ['treasurer', 'Treasurer', 'Mrs Agnes Chigumba', 'Giving and finance reports', ['dash', 'giving', 'members:r', 'reports']],
    ['secretary', 'Church secretary', 'Mr Lovemore Chari', 'Members, events and services', ['members', 'calendar', 'events', 'services']],
    ['member', 'Member portal', 'Tendai Moyo', 'Own giving and events', ['giving:r', 'calendar:r'], { giving: 'member=Tendai Moyo' }]
  ],
  modules: { calendar: { type: 'agenda', label: 'Calendar', icon: 'calendar', table: 'events', date: 'date', time: 'time', title: 'event', sub: 'venue' } },
  tables: {
    members: {
      label: 'Members', icon: 'users', code: 'M', desc: 'Everyone in the church family, with their cell group and status.',
      fields: 'name:Name|cell:Cell group:sel:Belvedere North,Belvedere South,Warren Park,Kambuzuma,Avondale|phone:Phone:tel|joined:Joined:date|dept:Ministry:sel:Choir,Ushering,Youth,Women\'s fellowship,Men\'s fellowship,Sunday school,None|status:Status:status:Member~ok,New visitor~warn,Follow up~bad,Inactive~grey',
      actions: [['Mark as member', 'status=Member', 'status!=Member', 'Welcome to the family']],
      related: [['giving', 'member', 'Giving', ['date', 'type', 'amount']]],
      rows: [['Tendai Moyo', 'Belvedere North', '0772 908 114', 'd-1500', 'Choir', 'Member'], ['Agnes Chigumba', 'Avondale', '0773 019 552', 'd-3200', 'Women\'s fellowship', 'Member'], ['Lovemore Chari', 'Warren Park', '0712 871 330', 'd-2400', 'Ushering', 'Member'], ['Patience Mhlanga', 'Kambuzuma', '0784 104 662', 'd-6', 'None', 'New visitor'], ['Brian Tsvangirai', 'Belvedere South', '0775 554 201', 'd-13', 'Youth', 'Follow up'], ['Memory Kanengoni', 'Belvedere North', '0778 116 903', 'd-900', 'Sunday school', 'Member'], ['Clive Mupfumira', 'Warren Park', '0719 230 448', 'd-700', 'Men\'s fellowship', 'Member'], ['Sarah Nkomo', 'Avondale', '0773 665 870', 'd-1100', 'Choir', 'Member'], ['Admire Zvobgo', 'Kambuzuma', '0782 093 115', 'd-2000', 'None', 'Inactive'], ['Grace Mabika', 'Belvedere South', '0771 280 664', 'd-3', 'None', 'New visitor']]
    },
    giving: {
      label: 'Giving', icon: 'heart', code: 'G', one: 'gift', addLabel: 'Record giving', desc: 'Tithes, offerings, building fund and pledges.',
      fields: 'date:Date:date|member:Member:ref:members.name|type:Type:sel:Tithe,Offering,Building fund,Pledge,Thanksgiving|amount:Amount:money|method:Method:sel:Cash USD,EcoCash,InnBucks,Bank transfer|by:Recorded by',
      defaults: { by: 'me' }, print: 'Print receipt',
      rows: [['d-2', 'Tendai Moyo', 'Tithe', 85, 'EcoCash', 'Mrs Agnes Chigumba'], ['d-2', 'Sarah Nkomo', 'Tithe', 60, 'Cash USD', 'Mrs Agnes Chigumba'], ['d-2', 'Clive Mupfumira', 'Building fund', 200, 'Bank transfer', 'Mrs Agnes Chigumba'], ['d-2', 'Memory Kanengoni', 'Offering', 15, 'Cash USD', 'Mrs Agnes Chigumba'], ['d-9', 'Tendai Moyo', 'Offering', 20, 'EcoCash', 'Mrs Agnes Chigumba'], ['d-9', 'Lovemore Chari', 'Tithe', 120, 'InnBucks', 'Mrs Agnes Chigumba'], ['d-16', 'Agnes Chigumba', 'Thanksgiving', 50, 'Cash USD', 'Mrs Agnes Chigumba'], ['d-30', 'Tendai Moyo', 'Tithe', 85, 'EcoCash', 'Mrs Agnes Chigumba'], ['d-33', 'Clive Mupfumira', 'Pledge', 500, 'Bank transfer', 'Mrs Agnes Chigumba'], ['d-61', 'Tendai Moyo', 'Tithe', 85, 'EcoCash', 'Mrs Agnes Chigumba'], ['d-64', 'Sarah Nkomo', 'Building fund', 150, 'Cash USD', 'Mrs Agnes Chigumba'], ['d-95', 'Lovemore Chari', 'Tithe', 120, 'InnBucks', 'Mrs Agnes Chigumba']]
    },
    events: {
      label: 'Events', icon: 'calendar', one: 'event', desc: 'Services, conferences, weddings and outreach.',
      fields: 'date:Date:date|time:Time:time|event:Event|venue:Venue|lead:Led by|status:Status:status:Planned~warn,Confirmed~ok,Done~grey',
      rows: [['d0', '18:00', 'Midweek prayer', 'Main sanctuary', 'Pastor Joseph Mapfumo', 'Confirmed'], ['d+1', '17:30', 'Choir practice', 'Hall B', 'Tendai Moyo', 'Confirmed'], ['d+3', '09:00', 'Sunday service', 'Main sanctuary', 'Pastor Joseph Mapfumo', 'Confirmed'], ['d+3', '14:00', 'Youth hangout', 'Youth hall', 'Brian Tsvangirai', 'Planned'], ['d+4', '10:00', 'Wedding: Chari & Nkomo', 'Main sanctuary', 'Pastor Joseph Mapfumo', 'Confirmed'], ['d+5', '08:00', 'Hospital outreach', 'Parirenyatwa', 'Women\'s fellowship', 'Planned'], ['d-4', '09:00', 'Sunday service', 'Main sanctuary', 'Pastor Joseph Mapfumo', 'Done']]
    },
    services: {
      label: 'Service attendance', icon: 'clipboard', one: 'service', addLabel: 'Record attendance', desc: 'Headcounts per service so you can see growth.',
      fields: 'date:Date:date|service:Service:sel:Sunday 1st service,Sunday 2nd service,Midweek,Youth|adults:Adults:num|children:Children:num|visitors:First-time visitors:num|total:Total:=num',
      calc: { total: (r) => (+r.adults || 0) + (+r.children || 0) + (+r.visitors || 0) },
      rows: [['d-4', 'Sunday 1st service', 312, 88, 7], ['d-4', 'Sunday 2nd service', 245, 61, 4], ['d-7', 'Midweek', 96, 0, 1], ['d-11', 'Sunday 1st service', 298, 92, 5], ['d-11', 'Sunday 2nd service', 230, 55, 3], ['d-34', 'Sunday 1st service', 280, 80, 9], ['d-64', 'Sunday 1st service', 265, 77, 6]]
    }
  },
  dash: {
    quick: [['Record giving', 'giving', 1], ['Add member', 'members']],
    kpis: [['Members', 'count:members?status=Member', 'num', 'Active church family'], ['Giving this month', (H) => H.sum('giving', 'amount', 'date>=' + H.today.slice(0, 8) + '01'), 'money', 'All types'], ['Building fund', 'sum:giving.amount?type=Building fund', 'money', 'Raised so far'], ['Last Sunday', (H) => H.sum('services', 'adults', 'date>=d-7&service~Sunday') + H.sum('services', 'children', 'date>=d-7&service~Sunday'), 'num', 'Adults and children']],
    alerts: [['members?status=New visitor,Follow up', '{n} visitor{s} waiting for a follow-up call', 'warn'], ['events?date>=today&date<=d+3&status=Planned', '{n} event{s} this week still to confirm', 'info']],
    charts: [['Giving by month', 'month:giving.date.amount', 'money'], ['Giving by type', 'sum:giving.type.amount', 'money'], ['Members by cell group', 'by:members.cell']],
    recent: [['giving', 'Latest giving', 5, ['date', 'member', 'type', 'amount']]]
  }
});

window.__SYS.push({
  id: 'nhengo', name: 'Nhengo', tag: 'Membership & associations', group: 'Education & community', icon: 'award', color: '#0f766e', color2: '#84cc16',
  org: { name: 'Zimbabwe Institute of Technicians', place: 'Harare & Bulawayo', phone: '+263 242 703 118' },
  blurb: 'Members, subscriptions, renewals, CPD events and certificates for clubs, unions and professional bodies.',
  headline: 'Renewals, subscriptions and events for every member, on time.',
  features: ['Membership categories, branches and expiry dates', 'Renewal reminders before memberships lapse', 'Subscriptions receipted by EcoCash, bank or cash', 'CPD and event attendance with points'],
  roles: [
    ['sec', 'Secretary General', 'Eng. Ruth Mavhunga', 'Full overview', ['dash', 'members', 'subs', 'events', 'reports']],
    ['fin', 'Finance officer', 'Mr Gift Marange', 'Subscriptions and income', ['dash', 'subs', 'members:r', 'reports']],
    ['branch', 'Branch chair', 'Mr Sipho Ncube', 'Bulawayo branch only', ['members:r', 'events'], { members: 'branch=Bulawayo' }]
  ],
  tables: {
    members: {
      label: 'Members', icon: 'users', code: 'ZIT', desc: 'All members with category, branch and expiry.',
      fields: 'name:Name|cat:Category:sel:Fellow,Full member,Associate,Student,Corporate|branch:Branch:sel:Harare,Bulawayo,Mutare,Gweru,Masvingo|phone:Phone:tel|expires:Expires:date|status:Status:=status:Active~ok,Expiring~warn,Grace~bad,Lapsed~grey,Pending~info',
      calc: { status: (r, H) => !r.expires ? 'Pending' : r.expires < H.today ? (H.days(r.expires) > 60 ? 'Lapsed' : 'Grace') : H.days(H.today, r.expires) <= 30 ? 'Expiring' : 'Active' },
      actions: [['Renew for 1 year', (r, H) => { r.expires = H.addDays(365, r.expires && r.expires > H.today ? r.expires : H.today); }, '', 'Membership renewed']],
      related: [['subs', 'member', 'Subscriptions', ['date', 'period', 'amount']]], print: 'Print certificate',
      rows: [['Eng. Tawanda Hove', 'Fellow', 'Harare', '0772 401 118', 'd+220'], ['Ms Linda Moyo', 'Full member', 'Harare', '0773 662 980', 'd+14'], ['Mr Sipho Ncube', 'Full member', 'Bulawayo', '0712 553 019', 'd+180'], ['Mr Thabani Dube', 'Associate', 'Bulawayo', '0784 330 871', 'd-20'], ['Ms Precious Sibanda', 'Student', 'Bulawayo', '0775 662 104', 'd+300'], ['Delta Engineering (Pvt) Ltd', 'Corporate', 'Harare', '0242 778 120', 'd+90'], ['Mr Kelvin Mutswairo', 'Full member', 'Mutare', '0778 201 554', 'd-95'], ['Mrs Nomsa Khumalo', 'Associate', 'Gweru', '0719 903 116', 'd+25'], ['Mr Collen Rusere', 'Student', 'Masvingo', '0773 448 230', 'd+150'], ['Eng. Mercy Chidzambwa', 'Fellow', 'Harare', '0782 870 665', 'd+400']]
    },
    subs: {
      label: 'Subscriptions', icon: 'receipt', code: 'SUB', one: 'subscription', addLabel: 'Record subscription', desc: 'Membership fees received.',
      fields: 'date:Date:date|member:Member:ref:members.name|period:Period:sel:2026/27,2025/26|amount:Amount:money|method:Method:sel:EcoCash,Bank transfer,Cash USD,Swipe',
      print: 'Print receipt',
      rows: [['d-3', 'Eng. Mercy Chidzambwa', '2026/27', 180, 'Bank transfer'], ['d-8', 'Ms Precious Sibanda', '2026/27', 25, 'EcoCash'], ['d-15', 'Mr Sipho Ncube', '2026/27', 90, 'EcoCash'], ['d-40', 'Delta Engineering (Pvt) Ltd', '2026/27', 650, 'Bank transfer'], ['d-66', 'Eng. Tawanda Hove', '2026/27', 180, 'Swipe'], ['d-120', 'Mr Collen Rusere', '2026/27', 25, 'Cash USD'], ['d-150', 'Ms Linda Moyo', '2025/26', 90, 'EcoCash']]
    },
    events: {
      label: 'Events & CPD', icon: 'calendar', one: 'event', desc: 'Workshops, AGMs and CPD sessions with points earned.',
      fields: 'date:Date:date|event:Event|branch:Branch:sel:Harare,Bulawayo,Mutare,Gweru,Masvingo,Online|points:CPD points:num|booked:Booked:num|fee:Fee:money|status:Status:status:Open~ok,Full~warn,Done~grey',
      rows: [['d+9', 'Solar PV design workshop', 'Harare', 8, 46, 35, 'Open'], ['d+16', 'Electrical safety refresher', 'Bulawayo', 4, 30, 20, 'Full'], ['d+40', 'Annual general meeting', 'Online', 2, 120, 0, 'Open'], ['d-12', 'PLC programming basics', 'Harare', 8, 28, 50, 'Done']]
    }
  },
  dash: {
    quick: [['Record subscription', 'subs', 1], ['Add member', 'members']],
    kpis: [['Active members', 'count:members?status=Active,Expiring', 'num'], ['Renewals due (30 days)', 'count:members?status=Expiring', 'num', 'Send reminders'], ['Lapsed or in grace', 'count:members?status=Lapsed,Grace', 'num'], ['Subscriptions this year', 'sum:subs.amount?period=2026/27', 'money']],
    alerts: [['members?status=Expiring', '{n} membership{s} expire in the next 30 days', 'warn'], ['members?status=Grace', '{n} member{s} in the grace period', 'bad']],
    charts: [['Subscription income', 'month:subs.date.amount', 'money'], ['Members by category', 'by:members.cat'], ['Members by branch', 'by:members.branch']],
    recent: [['subs', 'Latest subscriptions', 5, ['date', 'member', 'amount']]]
  }
});

window.__SYS.push({
  id: 'mukando', name: 'Mukando', tag: 'Savings clubs & burial societies', group: 'Education & community', icon: 'coins', color: '#b45309', color2: '#facc15',
  org: { name: 'Tashinga Savings Club', place: 'Chitungwiza', phone: '+263 78 220 4419' },
  blurb: 'Monthly contributions, member loans with interest, payouts and burial cover for savings groups.',
  headline: 'Every contribution, loan and payout, open for every member to see.',
  features: ['Monthly contributions with who has and hasn\'t paid', 'Member loans with interest worked out', 'Burial and emergency claims with approvals', 'Members check their own balance on their phone'],
  roles: [
    ['chair', 'Chairperson', 'Mai Rumbi Chiwenga', 'Full overview', ['dash', 'members', 'contrib', 'loans', 'claims', 'reports']],
    ['treas', 'Treasurer', 'Mrs Loveness Tagwireyi', 'Money in and out', ['dash', 'contrib', 'loans', 'claims', 'members:r', 'reports']],
    ['member', 'Member', 'Mrs Shamiso Banda', 'Own contributions and loans', ['contrib:r', 'loans:r'], { contrib: 'member=Mrs Shamiso Banda', loans: 'member=Mrs Shamiso Banda' }]
  ],
  tables: {
    members: {
      label: 'Members', icon: 'users', code: 'TS', desc: 'Club members and their monthly commitment.',
      fields: 'name:Name|phone:Phone:tel|joined:Joined:date|monthly:Monthly amount:money|saved:Total saved:=money|status:Status:status:Active~ok,Behind~bad,Left~grey',
      calc: { saved: (r, H) => H.sum('contrib', 'amount', 'member=' + r.name) },
      related: [['contrib', 'member', 'Contributions', ['date', 'month', 'amount']], ['loans', 'member', 'Loans', ['date', 'amount', 'balance', 'status']]],
      rows: [['Mai Rumbi Chiwenga', '0772 118 440', 'd-700', 50, 'Active'], ['Mrs Loveness Tagwireyi', '0773 552 210', 'd-700', 50, 'Active'], ['Mrs Shamiso Banda', '0712 908 663', 'd-500', 30, 'Active'], ['Mrs Ropafadzo Gore', '0784 019 337', 'd-420', 30, 'Behind'], ['Mrs Esther Mudzingwa', '0775 871 902', 'd-380', 50, 'Active'], ['Mrs Faith Machingura', '0778 104 551', 'd-300', 20, 'Active'], ['Mrs Ruth Chabata', '0719 554 118', 'd-200', 30, 'Behind'], ['Mrs Joyce Mhuri', '0773 903 006', 'd-120', 20, 'Active']]
    },
    contrib: {
      label: 'Contributions', icon: 'coins', code: 'C', one: 'contribution', addLabel: 'Record contribution', desc: 'Monthly money paid in by members.',
      fields: 'date:Date:date|member:Member:ref:members.name|month:For month:sel:Nov 2026,Oct 2026,Sep 2026|amount:Amount:money|method:Method:sel:EcoCash,Cash USD,InnBucks',
      print: 'Print receipt',
      rows: [['d-2', 'Mai Rumbi Chiwenga', 'Nov 2026', 50, 'EcoCash'], ['d-3', 'Mrs Shamiso Banda', 'Nov 2026', 30, 'EcoCash'], ['d-5', 'Mrs Esther Mudzingwa', 'Nov 2026', 50, 'Cash USD'], ['d-6', 'Mrs Loveness Tagwireyi', 'Nov 2026', 50, 'InnBucks'], ['d-31', 'Mai Rumbi Chiwenga', 'Oct 2026', 50, 'EcoCash'], ['d-32', 'Mrs Shamiso Banda', 'Oct 2026', 30, 'EcoCash'], ['d-33', 'Mrs Faith Machingura', 'Oct 2026', 20, 'Cash USD'], ['d-34', 'Mrs Joyce Mhuri', 'Oct 2026', 20, 'EcoCash'], ['d-35', 'Mrs Ropafadzo Gore', 'Oct 2026', 30, 'Cash USD'], ['d-36', 'Mrs Esther Mudzingwa', 'Oct 2026', 50, 'Cash USD'], ['d-37', 'Mrs Loveness Tagwireyi', 'Oct 2026', 50, 'InnBucks'], ['d-62', 'Mai Rumbi Chiwenga', 'Sep 2026', 50, 'EcoCash'], ['d-63', 'Mrs Shamiso Banda', 'Sep 2026', 30, 'EcoCash'], ['d-64', 'Mrs Ruth Chabata', 'Sep 2026', 30, 'Cash USD'], ['d-66', 'Mrs Esther Mudzingwa', 'Sep 2026', 50, 'Cash USD']]
    },
    loans: {
      label: 'Loans', icon: 'cash', code: 'L', one: 'loan', addLabel: 'Issue loan', desc: 'Loans to members. Interest is worked out on the amount borrowed.',
      fields: 'date:Issued:date|member:Member:ref:members.name|amount:Amount:money|rate:Interest %:pct|due:Due date:date|owed:Total owed:=money|repaid:Repaid:money|balance:Balance:=money|status:Status:=status:Active~warn,Overdue~bad,Repaid~ok',
      calc: { owed: (r) => (+r.amount || 0) * (1 + (+r.rate || 0) / 100), balance: (r) => (+r.amount || 0) * (1 + (+r.rate || 0) / 100) - (+r.repaid || 0), status: (r, H) => { const b = (+r.amount || 0) * (1 + (+r.rate || 0) / 100) - (+r.repaid || 0); return b <= 0.001 ? 'Repaid' : r.due < H.today ? 'Overdue' : 'Active'; } },
      defaults: { rate: 10, due: 'd+90' },
      actions: [['Record full repayment', (r) => { r.repaid = (+r.amount || 0) * (1 + (+r.rate || 0) / 100); }, 'balance>0', 'Loan repaid']],
      rows: [['d-40', 'Mrs Shamiso Banda', 150, 10, 'd+50', 60], ['d-100', 'Mrs Ropafadzo Gore', 200, 10, 'd-10', 80], ['d-20', 'Mrs Faith Machingura', 100, 10, 'd+70', 0], ['d-150', 'Mrs Esther Mudzingwa', 300, 10, 'd-60', 330]]
    },
    claims: {
      label: 'Claims & payouts', icon: 'shield', code: 'CL', one: 'claim', addLabel: 'Log a claim', desc: 'Burial cover and emergency payouts.',
      fields: 'date:Date:date|member:Member:ref:members.name|reason:Reason:sel:Funeral (member),Funeral (family),Hospital,Year-end payout|payout:Payout:money|status:Status:status:Submitted~warn,Approved~info,Paid~ok,Declined~bad',
      actions: [['Approve', 'status=Approved', 'status=Submitted'], ['Mark paid', 'status=Paid', 'status=Approved']],
      rows: [['d-4', 'Mrs Ruth Chabata', 'Funeral (family)', 250, 'Submitted'], ['d-50', 'Mrs Joyce Mhuri', 'Hospital', 120, 'Paid']]
    }
  },
  dash: {
    quick: [['Record contribution', 'contrib', 1], ['Issue loan', 'loans']],
    kpis: [['Club fund', (H) => H.sum('contrib', 'amount') - H.sum('loans', 'amount') + H.sum('loans', 'repaid') - H.sum('claims', 'payout', 'status=Paid'), 'money', 'Cash available now'], ['Total saved', 'sum:contrib.amount', 'money', 'All contributions'], ['Loans out', 'sum:loans.balance?status!=Repaid', 'money', 'Still to come back'], ['Interest earned', (H) => H.where('loans').reduce((a, r) => a + (+r.amount || 0) * (+r.rate || 0) / 100, 0), 'money', 'On all loans']],
    alerts: [['loans?status=Overdue', '{n} loan{s} past the due date', 'bad'], ['members?status=Behind', '{n} member{s} behind on contributions', 'warn'], ['claims?status=Submitted', '{n} claim{s} waiting for approval', 'warn']],
    charts: [['Contributions by month', 'month:contrib.date.amount', 'money'], ['Saved by member', 'sum:contrib.member.amount', 'money']],
    recent: [['contrib', 'Latest contributions', 5, ['date', 'member', 'month', 'amount']]]
  }
});

window.__SYS.push({
  id: 'rubatsiro', name: 'Rubatsiro', tag: 'NGO projects & beneficiaries', group: 'Education & community', icon: 'globe', color: '#0e7490', color2: '#22c55e',
  org: { name: 'Hope Rural Trust', place: 'Masvingo & Mutare', phone: '+263 39 226 4410' },
  blurb: 'Donor projects, budgets, beneficiaries, distributions and field visits with donor reports.',
  headline: 'Show donors exactly where every dollar and every bag of seed went.',
  features: ['Projects with budget against spend', 'Beneficiary register by district and programme', 'Distributions and field visits from the field', 'Donor role sees reports, read only'],
  roles: [
    ['dir', 'Programme director', 'Dr Chipo Makoni', 'All projects', ['dash', 'projects', 'beneficiaries', 'distributions', 'visits', 'reports']],
    ['officer', 'Field officer', 'Mr Tonderai Mafu', 'Register and distribute', ['beneficiaries', 'distributions', 'visits']],
    ['donor', 'Donor view', 'Ms Anna Larsen', 'Read only reports', ['dash', 'projects:r', 'distributions:r', 'reports']]
  ],
  tables: {
    projects: {
      label: 'Projects', icon: 'target', code: 'PRJ', desc: 'Funded projects with budget used.',
      fields: 'name:Project|donor:Donor|district:District:sel:Masvingo,Bikita,Mutare,Chimanimani,Zaka|budget:Budget:money|spent:Spent:money|used:Budget used:=bar|ends:Ends:date|status:Status:status:Active~ok,At risk~bad,Closing~warn,Closed~grey',
      calc: { used: (r) => r.budget ? (r.spent / r.budget) * 100 : 0 },
      related: [['distributions', 'project', 'Distributions', ['date', 'item', 'reached']]],
      rows: [['Drought-tolerant seed pack', 'Nordic Aid', 'Bikita', 85000, 61200, 'd+120', 'Active'], ['Borehole rehabilitation', 'Water4All', 'Zaka', 140000, 131500, 'd+30', 'At risk'], ['School feeding', 'World Kids Fund', 'Masvingo', 60000, 22800, 'd+200', 'Active'], ['Cyclone recovery shelters', 'Red Relief', 'Chimanimani', 210000, 198000, 'd+12', 'Closing']]
    },
    beneficiaries: {
      label: 'Beneficiaries', icon: 'users', code: 'BEN', one: 'beneficiary', desc: 'Registered households.',
      fields: 'name:Household head|district:District:sel:Masvingo,Bikita,Mutare,Chimanimani,Zaka|programme:Programme:sel:Seed pack,Water,School feeding,Shelter|gender:Gender:sel:F,M|size:Household size:num|registered:Registered:date|status:Status:status:Active~ok,Pending verification~warn,Graduated~grey',
      rows: [['Mrs Elizabeth Shoko', 'Bikita', 'Seed pack', 'F', 6, 'd-60', 'Active'], ['Mr John Chivasa', 'Zaka', 'Water', 'M', 8, 'd-90', 'Active'], ['Mrs Martha Gumbo', 'Chimanimani', 'Shelter', 'F', 5, 'd-150', 'Graduated'], ['Mrs Ruth Zhou', 'Masvingo', 'School feeding', 'F', 4, 'd-20', 'Active'], ['Mr Peter Moyo', 'Bikita', 'Seed pack', 'M', 7, 'd-3', 'Pending verification'], ['Mrs Agnes Rusike', 'Zaka', 'Water', 'F', 9, 'd-45', 'Active'], ['Mrs Tecla Hungwe', 'Chimanimani', 'Shelter', 'F', 3, 'd-2', 'Pending verification']]
    },
    distributions: {
      label: 'Distributions', icon: 'box', code: 'DST', one: 'distribution', desc: 'What was handed out, where and to how many people.',
      fields: 'date:Date:date|project:Project:ref:projects.name|district:District:sel:Masvingo,Bikita,Mutare,Chimanimani,Zaka|item:Item|qty:Quantity:num|reached:People reached:num|cost:Cost:money',
      rows: [['d-5', 'Drought-tolerant seed pack', 'Bikita', 'Sorghum seed 10 kg', 420, 2520, 6300], ['d-12', 'School feeding', 'Masvingo', 'Maize meal 50 kg', 80, 1900, 3200], ['d-30', 'Borehole rehabilitation', 'Zaka', 'Borehole repair kit', 6, 3400, 21000], ['d-44', 'Cyclone recovery shelters', 'Chimanimani', 'Shelter kit', 75, 380, 41250], ['d-70', 'Drought-tolerant seed pack', 'Bikita', 'Fertiliser 25 kg', 300, 1800, 9600]]
    },
    visits: {
      label: 'Field visits', icon: 'pin', code: 'FV', one: 'visit', desc: 'Monitoring visits and what was found.',
      fields: 'date:Date:date|district:District:sel:Masvingo,Bikita,Mutare,Chimanimani,Zaka|officer:Officer|finding:Finding:area|status:Status:status:Logged~info,Action needed~bad,Closed~ok',
      defaults: { officer: 'me' },
      rows: [['d-1', 'Zaka', 'Mr Tonderai Mafu', 'Two boreholes need new pump rods.', 'Action needed'], ['d-8', 'Bikita', 'Mr Tonderai Mafu', 'Germination good in 80% of plots.', 'Closed'], ['d-15', 'Masvingo', 'Ms Nyarai Chuma', 'Feeding running at all 4 schools.', 'Logged']]
    }
  },
  dash: {
    kpis: [['Active projects', 'count:projects?status!=Closed', 'num'], ['Total budget', 'sum:projects.budget', 'money'], ['Spent so far', 'sum:projects.spent', 'money'], ['People reached', 'sum:distributions.reached', 'num', 'From distributions']],
    alerts: [['projects?status=At risk', '{n} project{s} at risk of overspending', 'bad'], ['visits?status=Action needed', '{n} field visit{s} need action', 'warn'], ['beneficiaries?status=Pending verification', '{n} household{s} waiting for verification', 'info']],
    charts: [['People reached by month', 'month:distributions.date.reached', 'num'], ['Spend by project', 'sum:projects.name.spent', 'money'], ['Beneficiaries by programme', 'by:beneficiaries.programme']],
    recent: [['distributions', 'Latest distributions', 5, ['date', 'item', 'district', 'reached']]]
  }
});
