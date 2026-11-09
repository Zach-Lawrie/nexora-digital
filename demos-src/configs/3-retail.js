/* Shops, food & hospitality */
window.__SYS.push({
  id: 'stockwise', name: 'Stockwise POS', tag: 'Shop & hardware point of sale', group: 'Shops, food & hospitality', icon: 'cart', color: '#047857', color2: '#facc15',
  org: { name: 'Mbare Builders Hardware', place: 'Mbare, Harare', phone: '+263 77 330 1188' },
  blurb: 'Fast tills, stock levels, reorder alerts, supplier orders and credit accounts for shops and hardware stores.',
  headline: 'Sell fast, never run out, and know exactly what is on the shelf.',
  features: ['Tap-to-sell till with USD, ZiG, EcoCash and swipe', 'Stock drops with every sale; low stock alerts', 'Supplier orders and goods received', 'Credit accounts for builders and contractors'],
  roles: [
    ['owner', 'Owner', 'Mr Tafadzwa Gondo', 'Everything, including profit', ['dash', 'pos', 'sales', 'products', 'purchases', 'accounts', 'reports']],
    ['cashier', 'Cashier', 'Ms Nokutenda Zulu', 'Till and today\'s sales', ['pos', 'sales:r']],
    ['store', 'Storeman', 'Mr Ishmael Kaseke', 'Stock and deliveries', ['products', 'purchases']]
  ],
  modules: { pos: { type: 'pos', label: 'Sell', icon: 'cart', items: 'products', name: 'name', price: 'price', stock: 'stock', reorder: 'reorder', cat: 'cat', sales: 'sales', methods: ['Cash USD', 'EcoCash', 'Swipe', 'ZiG', 'InnBucks'] } },
  tables: {
    products: {
      label: 'Stock', icon: 'box', one: 'product', addLabel: 'Add product', desc: 'Every product with price, quantity and reorder level.',
      fields: 'name:Product|cat:Category:sel:Building,Plumbing,Electrical,Paint,Tools,Groceries|price:Price:money|-cost:Cost price:money|stock:In stock:num|reorder:Reorder at:num|value:Stock value:=money|status:Status:=status:In stock~ok,Low~warn,Out of stock~bad',
      calc: { value: (r) => (+r.stock || 0) * (+r.cost || 0), status: (r) => +r.stock <= 0 ? 'Out of stock' : +r.stock <= +r.reorder ? 'Low' : 'In stock' },
      actions: [['Receive 20 more', (r) => { r.stock = (+r.stock || 0) + 20; }, '', 'Stock received']],
      rows: [['Cement PPC 50 kg', 'Building', 11.5, 9.2, 140, 40], ['River sand (tonne)', 'Building', 28, 19, 12, 5], ['Brick force wire 50 m', 'Building', 6.5, 4.1, 3, 10], ['IBR roof sheet 3 m', 'Building', 14, 10.5, 65, 20], ['PVC pipe 50 mm 6 m', 'Plumbing', 7.8, 5.2, 48, 15], ['Ball valve 20 mm', 'Plumbing', 4.2, 2.6, 0, 10], ['Twin & earth 2.5 mm (100 m)', 'Electrical', 62, 47, 9, 4], ['LED bulb 9 W', 'Electrical', 1.5, 0.7, 230, 50], ['Plascon PVA 20 L', 'Paint', 38, 27, 17, 6], ['Claw hammer', 'Tools', 9, 5.5, 22, 5], ['Builders\' wheelbarrow', 'Tools', 55, 41, 4, 3], ['Cooking oil 2 L', 'Groceries', 4.5, 3.4, 60, 20]]
    },
    sales: {
      label: 'Sales', icon: 'receipt', code: 'S', one: 'sale', desc: 'Every till sale with payment method.',
      fields: 'date:Date:date|time:Time:time|items:Items|qty:Qty:num|total:Total:money|method:Method:sel:Cash USD,EcoCash,Swipe,ZiG,InnBucks|cashier:Cashier|-customer:Customer',
      print: 'Print receipt',
      rows: [['d0', '08:14', '10× Cement PPC 50 kg', 10, 115, 'Cash USD', 'Ms Nokutenda Zulu', 'Walk-in'], ['d0', '09:02', '4× PVC pipe 50 mm 6 m, 2× Ball valve 20 mm', 6, 39.6, 'EcoCash', 'Ms Nokutenda Zulu', 'Walk-in'], ['d0', '10:40', '1× Plascon PVA 20 L', 1, 38, 'Swipe', 'Ms Nokutenda Zulu', 'Walk-in'], ['d-1', '11:20', '20× IBR roof sheet 3 m', 20, 280, 'Cash USD', 'Ms Nokutenda Zulu', 'Mr Chiweshe'], ['d-1', '15:05', '10× LED bulb 9 W', 10, 15, 'ZiG', 'Ms Nokutenda Zulu', 'Walk-in'], ['d-2', '12:10', '1× Builders\' wheelbarrow', 1, 55, 'EcoCash', 'Ms Nokutenda Zulu', 'Walk-in'], ['d-6', '09:30', '30× Cement PPC 50 kg', 30, 345, 'Cash USD', 'Ms Nokutenda Zulu', 'Kubatana Builders'], ['d-14', '13:45', '2× Twin & earth 2.5 mm (100 m)', 2, 124, 'Swipe', 'Ms Nokutenda Zulu', 'Walk-in'], ['d-33', '10:00', '50× Cement PPC 50 kg', 50, 575, 'Cash USD', 'Ms Nokutenda Zulu', 'Kubatana Builders'], ['d-41', '16:20', '3× Plascon PVA 20 L', 3, 114, 'EcoCash', 'Ms Nokutenda Zulu', 'Walk-in'], ['d-66', '11:10', '40× IBR roof sheet 3 m', 40, 560, 'Cash USD', 'Ms Nokutenda Zulu', 'Mr Chiweshe'], ['d-95', '08:45', '60× Cement PPC 50 kg', 60, 690, 'Cash USD', 'Ms Nokutenda Zulu', 'Kubatana Builders'], ['d-125', '14:30', '10× PVC pipe 50 mm 6 m', 10, 78, 'EcoCash', 'Ms Nokutenda Zulu', 'Walk-in']]
    },
    purchases: {
      label: 'Supplier orders', icon: 'truck', code: 'PO', one: 'order', addLabel: 'New supplier order', desc: 'Orders placed with suppliers and goods received.',
      fields: 'date:Ordered:date|supplier:Supplier:sel:PPC Zimbabwe,Halsted Builders Express,Electrosales,Plascon Zimbabwe,Kango Products|items:Items|amount:Amount:money|due:Expected:date|status:Status:status:Ordered~warn,Received~info,Paid~ok',
      actions: [['Mark received', 'status=Received', 'status=Ordered'], ['Mark paid', 'status=Paid', 'status=Received']],
      rows: [['d-1', 'PPC Zimbabwe', '200× Cement PPC 50 kg', 1840, 'd+2', 'Ordered'], ['d-3', 'Halsted Builders Express', '40× Ball valve 20 mm, 20× Brick force wire', 186, 'd-1', 'Ordered'], ['d-10', 'Electrosales', '10× Twin & earth 2.5 mm', 470, 'd-6', 'Received'], ['d-30', 'Plascon Zimbabwe', '20× Plascon PVA 20 L', 540, 'd-24', 'Paid']]
    },
    accounts: {
      label: 'Credit accounts', icon: 'briefcase', code: 'AC', one: 'account', desc: 'Builders and contractors who buy on account.',
      fields: 'name:Customer|phone:Phone:tel|limit:Credit limit:money|owing:Owing:money|due:Pay by:date|status:Status:=status:Good~ok,Over limit~warn,Overdue~bad',
      calc: { status: (r, H) => +r.owing > 0 && r.due < H.today ? 'Overdue' : +r.owing > +r.limit ? 'Over limit' : 'Good' },
      actions: [['Record payment in full', 'owing=0', 'owing>0', 'Account settled']],
      rows: [['Kubatana Builders', '0772 661 008', 2000, 1450, 'd+12'], ['Mr Chiweshe (contractor)', '0773 120 554', 800, 920, 'd+5'], ['Shingirai Construction', '0712 448 903', 1500, 600, 'd-8'], ['Musasa Properties', '0784 330 117', 3000, 0, '']]
    }
  },
  dash: {
    quick: [['Open the till', 'pos', 1], ['Add product', 'products']],
    kpis: [['Sales today', 'sum:sales.total?date=today', 'money', 'Till total'], ['Sales this month', (H) => H.sum('sales', 'total', 'date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Stock value', 'sum:products.value', 'money', 'At cost price'], ['Owed by customers', 'sum:accounts.owing', 'money', 'Credit accounts']],
    alerts: [['products?status=Low,Out of stock', '{n} product{s} low or out of stock', 'bad'], ['purchases?status=Ordered&due<today', '{n} supplier order{s} late', 'warn'], ['accounts?status=Overdue', '{n} credit account{s} overdue', 'bad']],
    charts: [['Sales by month', 'month:sales.date.total', 'money'], ['Sales by payment method', 'sum:sales.method.total', 'money'], ['Stock value by category', 'sum:products.cat.value', 'money']],
    recent: [['sales', 'Latest sales', 5, ['time', 'items', 'total', 'method']]]
  }
});

window.__SYS.push({
  id: 'kitchenpass', name: 'Kitchen Pass', tag: 'Restaurant, bar & takeaway', group: 'Shops, food & hospitality', icon: 'utensils', color: '#9f1239', color2: '#fb923c',
  org: { name: 'Sadza & Grill House', place: 'Avondale, Harare', phone: '+263 78 902 3311' },
  blurb: 'Table orders, kitchen screen, bills, table bookings and pantry stock for restaurants, bars and takeaways.',
  headline: 'From the table to the kitchen to the bill, with nothing lost on the way.',
  features: ['Waiters send orders straight to the kitchen screen', 'Kitchen moves tickets from New to Ready', 'Bills by cash, EcoCash or swipe with receipts', 'Table bookings and pantry stock alerts'],
  roles: [
    ['mgr', 'Manager', 'Mrs Precious Dziva', 'Sales, stock and staff', ['dash', 'pos', 'orders', 'menu', 'calendar', 'bookings', 'pantry', 'reports']],
    ['waiter', 'Waiter', 'Kuda Mararike', 'Take orders and bills', ['pos', 'orders', 'calendar:r']],
    ['kitchen', 'Kitchen', 'Chef Simba Gwatidzo', 'Kitchen screen and pantry', ['orders', 'pantry']],
    ['host', 'Host', 'Lisa Mutero', 'Table bookings', ['calendar', 'bookings']]
  ],
  modules: {
    pos: { type: 'pos', label: 'Take order', icon: 'plus', items: 'menu', name: 'name', price: 'price', cat: 'cat', sales: 'orders', saleStatus: 'New', cartTitle: 'New order', payLabel: 'Send to kitchen', methods: ['Bill later', 'Cash USD', 'EcoCash', 'Swipe'], extra: { k: 'table', label: 'Table', opts: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'Bar', 'Takeaway', 'Delivery'] } },
    calendar: { type: 'agenda', label: 'Bookings calendar', icon: 'calendar', table: 'bookings', date: 'date', time: 'time', title: 'name', sub: 'party' }
  },
  tables: {
    orders: {
      label: 'Kitchen orders', icon: 'kanban', code: 'ORD', one: 'order', board: 'default', desc: 'Every order. Kitchen moves tickets across as they cook.',
      fields: 'date:Date:date|time:Time:time|table:Table:sel:T1,T2,T3,T4,T5,T6,Bar,Takeaway,Delivery|items:Items|total:Total:money|method:Payment:sel:Bill later,Cash USD,EcoCash,Swipe|cashier:Waiter|status:Status:status:New~bad,Preparing~warn,Ready~info,Served~ok,Paid~grey',
      card: ['table', 'items', 'time'], print: 'Print bill',
      actions: [['Settle bill (cash)', 'status=Paid&method=Cash USD', 'status=Served'], ['Settle bill (EcoCash)', 'status=Paid&method=EcoCash', 'status=Served']],
      rows: [['d0', '12:41', 'T3', '2× Sadza & beef stew, 2× Mazoe orange', 26, 'Bill later', 'Kuda Mararike', 'New'], ['d0', '12:35', 'Takeaway', '3× Chicken & chips', 21, 'EcoCash', 'Kuda Mararike', 'Preparing'], ['d0', '12:20', 'T1', '1× T-bone 350 g, 1× Greek salad, 2× Castle Lager', 33.5, 'Bill later', 'Kuda Mararike', 'Preparing'], ['d0', '12:05', 'T5', '4× Sadza & road runner, 4× Coca-Cola', 46, 'Bill later', 'Tino Chari', 'Ready'], ['d0', '11:50', 'Bar', '6× Zambezi Lager', 15, 'Cash USD', 'Tino Chari', 'Served'], ['d0', '11:30', 'T2', '2× Oxtail & rice', 28, 'Swipe', 'Kuda Mararike', 'Paid'], ['d-1', '19:40', 'T4', '3× Grilled bream, 3× Sides', 69, 'Cash USD', 'Tino Chari', 'Paid'], ['d-1', '13:10', 'Delivery', '5× Chicken & chips', 35, 'EcoCash', 'Kuda Mararike', 'Paid'], ['d-8', '20:05', 'T6', 'Office party: 12× Mixed grill', 264, 'Swipe', 'Tino Chari', 'Paid'], ['d-35', '19:00', 'T6', 'Wedding lunch: 30× Buffet', 540, 'Cash USD', 'Tino Chari', 'Paid'], ['d-64', '13:00', 'T1', '20× Sadza & beef stew', 180, 'Cash USD', 'Tino Chari', 'Paid']]
    },
    menu: {
      label: 'Menu', icon: 'book', one: 'menu item', desc: 'Dishes and drinks with prices.',
      fields: 'name:Item|cat:Category:sel:Traditional,Grills,Sides,Drinks,Desserts|price:Price:money|-cost:Food cost:money|margin:Margin:=pct|status:Status:status:Available~ok,Sold out~bad',
      calc: { margin: (r) => r.price ? ((r.price - (r.cost || 0)) / r.price) * 100 : 0 },
      actions: [['Mark sold out', 'status=Sold out', 'status=Available'], ['Back on the menu', 'status=Available', 'status=Sold out']],
      rows: [['Sadza & beef stew', 'Traditional', 9, 3.2, 'Available'], ['Sadza & road runner', 'Traditional', 10, 3.8, 'Available'], ['Oxtail & rice', 'Traditional', 14, 5.5, 'Available'], ['Mazondo', 'Traditional', 8, 2.6, 'Sold out'], ['T-bone 350 g', 'Grills', 18, 8, 'Available'], ['Chicken & chips', 'Grills', 7, 2.9, 'Available'], ['Grilled bream', 'Grills', 16, 7, 'Available'], ['Greek salad', 'Sides', 5, 1.6, 'Available'], ['Castle Lager', 'Drinks', 2.5, 1.3, 'Available'], ['Zambezi Lager', 'Drinks', 2.5, 1.3, 'Available'], ['Mazoe orange', 'Drinks', 2, 0.6, 'Available'], ['Malva pudding', 'Desserts', 5, 1.4, 'Available']]
    },
    bookings: {
      label: 'Table bookings', icon: 'calendar', code: 'BK', one: 'booking', desc: 'Reservations and walk-in waiting list.',
      fields: 'date:Date:date|time:Time:time|name:Name|party:Party size:num|phone:Phone:tel|table:Table:sel:T1,T2,T3,T4,T5,T6|status:Status:status:Booked~warn,Seated~ok,No show~bad,Cancelled~grey',
      actions: [['Seat now', 'status=Seated', 'status=Booked']],
      rows: [['d0', '18:30', 'Mr & Mrs Chinyanga', 2, '0772 404 118', 'T2', 'Booked'], ['d0', '19:00', 'Econet team dinner', 10, '0773 662 980', 'T6', 'Booked'], ['d+1', '13:00', 'Ms Rumbi Dube', 4, '0712 553 019', 'T4', 'Booked'], ['d+2', '19:30', 'Birthday: Tatenda', 8, '0784 330 871', 'T6', 'Booked'], ['d+4', '12:30', 'Mr Phiri', 2, '0775 662 104', 'T1', 'Booked'], ['d-1', '19:00', 'Mr Gumbo', 3, '0778 201 554', 'T3', 'No show']]
    },
    pantry: {
      label: 'Pantry stock', icon: 'box', one: 'stock item', desc: 'Ingredients and drinks on hand.',
      fields: 'item:Item|unit:Unit:sel:kg,litre,crate,each,bag|qty:On hand:num|reorder:Reorder at:num|supplier:Supplier|status:Status:=status:OK~ok,Order now~bad',
      calc: { status: (r) => +r.qty <= +r.reorder ? 'Order now' : 'OK' },
      actions: [['Restock +10', (r) => { r.qty = (+r.qty || 0) + 10; }, '', 'Restocked']],
      rows: [['Beef (stewing)', 'kg', 14, 10, 'Koala Park Butchery'], ['Road runner chicken', 'each', 6, 10, 'Village Farms'], ['Mealie meal', 'bag', 9, 4, 'National Foods'], ['Castle Lager', 'crate', 3, 4, 'Delta Beverages'], ['Cooking oil', 'litre', 25, 10, 'Olivine'], ['Bream (fresh)', 'kg', 8, 5, 'Kariba Fish']]
    }
  },
  dash: {
    quick: [['Take order', 'pos', 1], ['Book a table', 'bookings']],
    kpis: [['Sales today', 'sum:orders.total?date=today', 'money'], ['Open orders', 'count:orders?status=New,Preparing,Ready', 'num', 'In the kitchen now'], ['Unpaid bills', 'sum:orders.total?status=Served', 'money'], ['Bookings tonight', 'count:bookings?date=today&status=Booked', 'num']],
    alerts: [['orders?status=New', '{n} new order{s} waiting for the kitchen', 'bad'], ['pantry?status=Order now', '{n} pantry item{s} need ordering', 'warn'], ['menu?status=Sold out', '{n} dish{s} sold out', 'info']],
    charts: [['Sales by month', 'month:orders.date.total', 'money'], ['Orders by table', 'by:orders.table'], ['Sales by payment', 'sum:orders.method.total', 'money']],
    recent: [['orders', 'Latest orders', 5, ['time', 'table', 'items', 'total', 'status']]]
  }
});

window.__SYS.push({
  id: 'staylodge', name: 'StayLodge', tag: 'Hotel, lodge & guest house', group: 'Shops, food & hospitality', icon: 'bed', color: '#115e59', color2: '#eab308',
  org: { name: 'Msasa Ridge Lodge', place: 'Victoria Falls', phone: '+263 83 284 6610' },
  blurb: 'Rooms, reservations, check-in and check-out, guest bills and housekeeping for lodges and hotels.',
  headline: 'Every room, guest and dollar on one screen, from booking to checkout.',
  features: ['Room board with available, occupied and cleaning', 'Reservations from walk-ins, agents and Booking.com', 'Guest bills with deposits and balances', 'Housekeeping tasks for each room'],
  roles: [
    ['gm', 'General manager', 'Mr Brian Sithole', 'Occupancy and revenue', ['dash', 'calendar', 'bookings', 'rooms', 'house', 'reports']],
    ['front', 'Front desk', 'Ms Thandi Moyo', 'Bookings and check-in', ['calendar', 'bookings', 'rooms:r']],
    ['hk', 'Housekeeping', 'Mrs Sekai Ncube', 'Room cleaning', ['house', 'rooms']]
  ],
  modules: { calendar: { type: 'agenda', label: 'Arrivals', icon: 'calendar', table: 'bookings', date: 'checkin', time: 'room', title: 'guest', sub: 'source' } },
  tables: {
    rooms: {
      label: 'Rooms', icon: 'key', one: 'room', board: true, desc: 'Every room and what state it is in.',
      fields: 'room:Room|type:Type:sel:Standard,Deluxe,Family chalet,Honeymoon suite|rate:Rate per night:money|beds:Beds|status:Status:status:Available~ok,Occupied~info,Cleaning~warn,Out of order~bad',
      rows: [['101', 'Standard', 85, '1 queen', 'Occupied'], ['102', 'Standard', 85, '2 single', 'Available'], ['103', 'Standard', 85, '1 queen', 'Cleaning'], ['201', 'Deluxe', 130, '1 king', 'Occupied'], ['202', 'Deluxe', 130, '1 king', 'Available'], ['301', 'Family chalet', 180, '1 king + 2 single', 'Occupied'], ['302', 'Family chalet', 180, '1 king + 2 single', 'Out of order'], ['401', 'Honeymoon suite', 260, '1 king', 'Available']]
    },
    bookings: {
      label: 'Reservations', icon: 'calendar', code: 'RES', one: 'reservation', addLabel: 'New reservation', desc: 'Guests, dates and what they owe.',
      fields: 'guest:Guest|room:Room:ref:rooms.room|checkin:Check-in:date|nights:Nights:num|source:Source:sel:Walk-in,Booking.com,Phone,Travel agent,Website|total:Bill:=money|paid:Paid:money|balance:Balance:=money|status:Status:status:Reserved~warn,Checked in~info,Checked out~ok,Cancelled~grey',
      calc: { total: (r, H) => { const rm = H.find('rooms', 'room', r.room); return rm ? (+rm.rate || 0) * (+r.nights || 0) : 0; }, balance: (r, H) => { const rm = H.find('rooms', 'room', r.room); return (rm ? (+rm.rate || 0) * (+r.nights || 0) : 0) - (+r.paid || 0); } },
      onStatus: (r, H) => { const rm = H.find('rooms', 'room', r.room); if (!rm) return; if (r.status === 'Checked in') rm.status = 'Occupied'; if (r.status === 'Checked out') rm.status = 'Cleaning'; },
      actions: [['Check in', 'status=Checked in', 'status=Reserved'], ['Take full payment', (r, H) => { const rm = H.find('rooms', 'room', r.room); r.paid = rm ? (+rm.rate || 0) * (+r.nights || 0) : r.paid; }, 'balance>0', 'Payment recorded'], ['Check out', 'status=Checked out', 'status=Checked in']],
      print: 'Print guest bill',
      rows: [['Mr & Mrs Hendricks', '101', 'd-2', 4, 'Booking.com', 200, 'Checked in'], ['Dr Farai Mlambo', '201', 'd-1', 2, 'Phone', 260, 'Checked in'], ['The Ncube family', '301', 'd-3', 5, 'Travel agent', 540, 'Checked in'], ['Ms Claire Dubois', '202', 'd0', 3, 'Website', 130, 'Reserved'], ['Mr Takura Chikwanha', '102', 'd+1', 2, 'Walk-in', 0, 'Reserved'], ['Honeymoon: Moyo & Banda', '401', 'd+2', 4, 'Travel agent', 520, 'Reserved'], ['Mr Peter Okafor', '103', 'd+4', 1, 'Booking.com', 0, 'Reserved'], ['Mr James Wilson', '202', 'd-9', 3, 'Booking.com', 390, 'Checked out'], ['Ms Ruvimbo Shumba', '101', 'd-30', 2, 'Phone', 170, 'Checked out'], ['Tour group (Sunway)', '301', 'd-60', 6, 'Travel agent', 1080, 'Checked out']]
    },
    house: {
      label: 'Housekeeping', icon: 'check', one: 'task', addLabel: 'Add task', board: 'default', desc: 'Cleaning and room fixes, moved across as they are done.',
      fields: 'date:Date:date|room:Room:ref:rooms.room|task:Task:sel:Full clean,Turn-down,Change linen,Fix plumbing,Fix aircon,Restock minibar|staff:Assigned to|status:Status:status:To do~warn,Doing~info,Done~ok',
      onStatus: (r, H) => { if (r.status === 'Done' && r.task === 'Full clean') { const rm = H.find('rooms', 'room', r.room); if (rm && rm.status === 'Cleaning') rm.status = 'Available'; } },
      rows: [['d0', '103', 'Full clean', 'Mrs Sekai Ncube', 'Doing'], ['d0', '302', 'Fix plumbing', 'Mr Joseph Banda', 'To do'], ['d0', '101', 'Turn-down', 'Ms Agnes Phiri', 'To do'], ['d0', '201', 'Change linen', 'Ms Agnes Phiri', 'Done']]
    }
  },
  dash: {
    quick: [['New reservation', 'bookings', 1]],
    kpis: [['Occupancy', (H) => H.count('rooms', 'status=Occupied') / Math.max(1, H.count('rooms', 'status!=Out of order')) * 100, 'pct', 'Rooms in use tonight'], ['Arrivals today', 'count:bookings?checkin=today&status=Reserved', 'num'], ['Revenue this month', (H) => H.where('bookings', 'checkin>=' + H.today.slice(0, 8) + '01&status!=Cancelled').reduce((a, r) => a + H.val('bookings', r, 'total'), 0), 'money'], ['Guest balances', 'sum:bookings.balance?status=Checked in,Reserved', 'money', 'Still to collect']],
    alerts: [['bookings?checkin=today&status=Reserved', '{n} guest{s} arriving today', 'info'], ['rooms?status=Out of order', '{n} room{s} out of order', 'bad'], ['house?status=To do', '{n} housekeeping task{s} not started', 'warn']],
    charts: [['Booked revenue by month', 'month:bookings.checkin.total', 'money'], ['Bookings by source', 'by:bookings.source'], ['Rooms right now', 'by:rooms.status']],
    recent: [['bookings', 'Reservations', 5, ['guest', 'room', 'checkin', 'balance', 'status']]]
  }
});

window.__SYS.push({
  id: 'glowbook', name: 'GlowBook', tag: 'Salon, barber & spa', group: 'Shops, food & hospitality', icon: 'scissors', color: '#be185d', color2: '#fbbf24',
  org: { name: 'Glow Beauty Studio', place: 'Sam Levy\'s Village, Borrowdale', phone: '+263 77 555 0192' },
  blurb: 'Appointments, stylists, client history, product sales and commissions for salons, barbers and spas.',
  headline: 'A full appointment book, happy clients and no double bookings.',
  features: ['Week calendar for every stylist', 'Client history and loyalty points', 'Sell products at checkout with receipts', 'Stylist commission worked out automatically'],
  roles: [
    ['owner', 'Owner', 'Ms Nyasha Kativhu', 'Bookings, sales and commission', ['dash', 'calendar', 'appts', 'clients', 'pos', 'services', 'products', 'reports']],
    ['front', 'Reception', 'Ms Vimbai Moyo', 'Book clients and check out', ['calendar', 'appts', 'clients', 'pos']],
    ['stylist', 'Stylist', 'Rutendo Chari', 'Own appointments only', ['calendar:r', 'appts:r'], { appts: 'stylist=Rutendo' }]
  ],
  modules: {
    calendar: { type: 'agenda', label: 'Calendar', icon: 'calendar', table: 'appts', date: 'date', time: 'time', title: 'client', sub: 'service' },
    pos: { type: 'pos', label: 'Checkout', icon: 'cart', items: 'products', name: 'name', price: 'price', stock: 'stock', cat: 'cat', sales: 'sales', methods: ['Cash USD', 'EcoCash', 'Swipe'] }
  },
  tables: {
    appts: {
      label: 'Appointments', icon: 'clock', code: 'AP', one: 'appointment', addLabel: 'Book appointment', desc: 'Every booking with stylist and price.',
      fields: 'date:Date:date|time:Time:time|client:Client:ref:clients.name|service:Service:ref:services.name|stylist:Stylist:sel:Rutendo,Tanaka,Shamiso,Blessing|price:Price:money|commission:Commission:=money|status:Status:status:Booked~warn,Done~ok,No show~bad,Cancelled~grey',
      calc: { commission: (r) => r.status === 'Done' ? (+r.price || 0) * 0.3 : 0 },
      onAdd: (r, H) => { if (!r.price) { const sv = H.find('services', 'name', r.service); if (sv) r.price = sv.price; } },
      actions: [['Mark done', 'status=Done', 'status=Booked'], ['No show', 'status=No show', 'status=Booked']],
      rows: [['d0', '09:00', 'Mrs Chipo Mandaza', 'Knotless braids', 'Rutendo', 55, 'Done'], ['d0', '10:30', 'Ms Tadiwa Gumbo', 'Gel manicure', 'Shamiso', 18, 'Booked'], ['d0', '13:00', 'Mr Kelvin Nyoni', 'Fade & beard', 'Blessing', 10, 'Booked'], ['d0', '15:00', 'Ms Ropa Chikore', 'Silk press', 'Tanaka', 35, 'Booked'], ['d+1', '09:30', 'Mrs Chipo Mandaza', 'Full body massage', 'Shamiso', 40, 'Booked'], ['d+1', '11:00', 'Ms Linda Zhou', 'Knotless braids', 'Rutendo', 55, 'Booked'], ['d+2', '14:00', 'Ms Tadiwa Gumbo', 'Facial', 'Shamiso', 30, 'Booked'], ['d+3', '10:00', 'Ms Ropa Chikore', 'Wash & set', 'Rutendo', 20, 'Booked'], ['d-1', '12:00', 'Ms Linda Zhou', 'Gel manicure', 'Shamiso', 18, 'No show'], ['d-2', '09:00', 'Mrs Ruth Moyo', 'Knotless braids', 'Rutendo', 55, 'Done'], ['d-20', '10:00', 'Mrs Ruth Moyo', 'Silk press', 'Tanaka', 35, 'Done'], ['d-40', '11:00', 'Mrs Chipo Mandaza', 'Facial', 'Shamiso', 30, 'Done']]
    },
    clients: {
      label: 'Clients', icon: 'users', one: 'client', desc: 'Client list with loyalty points.',
      fields: 'name:Client|phone:Phone:tel|birthday:Birthday:date|visits:Visits:=num|spent:Spent:=money|points:Loyalty points:=num|notes:Notes',
      calc: { visits: (r, H) => H.count('appts', 'client=' + r.name + '&status=Done'), spent: (r, H) => H.sum('appts', 'price', 'client=' + r.name + '&status=Done'), points: (r, H) => Math.floor(H.sum('appts', 'price', 'client=' + r.name + '&status=Done')) },
      related: [['appts', 'client', 'Appointments', ['date', 'service', 'stylist', 'status']]],
      rows: [['Mrs Chipo Mandaza', '0772 118 900', 'd+6', 'Prefers Rutendo'], ['Ms Tadiwa Gumbo', '0773 662 104', 'd+40', ''], ['Mr Kelvin Nyoni', '0712 905 330', 'd+120', 'Skin fade #1'], ['Ms Ropa Chikore', '0784 201 776', 'd+80', 'Sensitive scalp'], ['Ms Linda Zhou', '0775 430 118', 'd+200', ''], ['Mrs Ruth Moyo', '0778 554 662', 'd+15', 'VIP']]
    },
    services: {
      label: 'Services', icon: 'star', one: 'service', desc: 'Price list.',
      fields: 'name:Service|cat:Category:sel:Hair,Nails,Barber,Spa|mins:Minutes:num|price:Price:money',
      rows: [['Knotless braids', 'Hair', 300, 55], ['Silk press', 'Hair', 90, 35], ['Wash & set', 'Hair', 60, 20], ['Gel manicure', 'Nails', 45, 18], ['Fade & beard', 'Barber', 40, 10], ['Full body massage', 'Spa', 60, 40], ['Facial', 'Spa', 50, 30]]
    },
    products: {
      label: 'Products', icon: 'tag', one: 'product', desc: 'Retail products on the shelf.',
      fields: 'name:Product|cat:Category:sel:Hair care,Nails,Skin care|price:Price:money|stock:In stock:num',
      rows: [['Edge control', 'Hair care', 6, 24], ['Leave-in conditioner', 'Hair care', 12, 15], ['Braiding hair (pack)', 'Hair care', 4, 80], ['Cuticle oil', 'Nails', 5, 10], ['Shea body butter', 'Skin care', 9, 3], ['Vitamin C serum', 'Skin care', 22, 6]]
    },
    sales: {
      label: 'Product sales', icon: 'receipt', code: 'PS', one: 'sale', desc: 'Retail sales at checkout.',
      fields: 'date:Date:date|time:Time:time|items:Items|total:Total:money|method:Method:sel:Cash USD,EcoCash,Swipe|customer:Client|cashier:By',
      rows: [['d0', '11:10', '2× Edge control', 12, 'EcoCash', 'Mrs Chipo Mandaza', 'Ms Vimbai Moyo'], ['d-2', '10:30', '1× Vitamin C serum', 22, 'Swipe', 'Mrs Ruth Moyo', 'Ms Vimbai Moyo'], ['d-30', '15:00', '4× Braiding hair (pack)', 16, 'Cash USD', 'Walk-in', 'Ms Vimbai Moyo']]
    }
  },
  dash: {
    quick: [['Book appointment', 'appts', 1], ['Checkout', 'pos']],
    kpis: [['Appointments today', 'count:appts?date=today', 'num'], ['Booked revenue today', 'sum:appts.price?date=today&status!=Cancelled,No show', 'money'], ['Services this month', (H) => H.sum('appts', 'price', 'status=Done&date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Commission due', 'sum:appts.commission', 'money', 'Stylists at 30%']],
    alerts: [['appts?date=today&status=Booked', '{n} client{s} still to come in today', 'info'], ['products?stock<5', '{n} product{s} running low', 'warn'], ['clients?birthday>=today&birthday<=d+7', '{n} client birthday{s} this week: send a treat', 'info']],
    charts: [['Service revenue by month', 'month:appts.date.price?status=Done', 'money'], ['Bookings by stylist', 'by:appts.stylist'], ['Revenue by service', 'sum:appts.service.price', 'money']],
    recent: [['appts', 'Today and next', 5, ['date', 'time', 'client', 'service', 'stylist']]]
  }
});

window.__SYS.push({
  id: 'fittrack', name: 'FitTrack', tag: 'Gym & fitness centre', group: 'Shops, food & hospitality', icon: 'dumbbell', color: '#b91c1c', color2: '#f97316',
  org: { name: 'Iron Lion Gym', place: 'Kensington, Bulawayo', phone: '+263 29 288 4410' },
  blurb: 'Memberships, renewals, check-ins at the door, classes and payments for gyms and fitness studios.',
  headline: 'Know who is paid up, who is coming in and who is about to leave.',
  features: ['Member plans with automatic expiry', 'Front desk check-in in one tap', 'Class timetable with bookings', 'Renewal reminders before plans run out'],
  roles: [
    ['mgr', 'Gym manager', 'Mr Sizwe Khumalo', 'Members, money and classes', ['dash', 'members', 'payments', 'checkins', 'calendar', 'classes', 'reports']],
    ['desk', 'Front desk', 'Ms Zodwa Ndlovu', 'Check-ins and payments', ['checkins', 'members', 'payments']],
    ['coach', 'Coach', 'Coach Tinashe', 'Class timetable', ['calendar', 'classes']]
  ],
  modules: { calendar: { type: 'agenda', label: 'Timetable', icon: 'calendar', table: 'classes', date: 'date', time: 'time', title: 'cls', sub: 'coach' } },
  tables: {
    members: {
      label: 'Members', icon: 'users', code: 'IL', desc: 'Every member, their plan and when it ends.',
      fields: 'name:Member|plan:Plan:sel:Monthly,Quarterly,Annual,Student,Day pass|phone:Phone:tel|joined:Joined:date|expires:Expires:date|status:Status:=status:Active~ok,Expiring~warn,Expired~bad',
      calc: { status: (r, H) => r.expires < H.today ? 'Expired' : H.days(H.today, r.expires) <= 7 ? 'Expiring' : 'Active' },
      actions: [['Renew 1 month', (r, H) => { r.expires = H.addDays(30, r.expires > H.today ? r.expires : H.today); }, '', 'Renewed for a month']],
      related: [['checkins', 'member', 'Recent check-ins', ['date', 'time']], ['payments', 'member', 'Payments', ['date', 'plan', 'amount']]],
      rows: [['Mthokozisi Dube', 'Monthly', '0772 330 118', 'd-200', 'd+18'], ['Ntombi Sibanda', 'Annual', '0773 908 662', 'd-300', 'd+65'], ['Tawanda Mpofu', 'Monthly', '0712 104 553', 'd-90', 'd+3'], ['Lindiwe Moyo', 'Student', '0784 553 019', 'd-40', 'd-2'], ['Brian Ncube', 'Quarterly', '0775 019 330', 'd-60', 'd+30'], ['Chantelle Phiri', 'Monthly', '0778 871 201', 'd-15', 'd+15'], ['Gift Nyathi', 'Monthly', '0719 662 903', 'd-120', 'd-20'], ['Sibusiso Tshuma', 'Annual', '0773 201 448', 'd-20', 'd+345']]
    },
    payments: {
      label: 'Payments', icon: 'receipt', code: 'PAY', one: 'payment', addLabel: 'Take payment', desc: 'Membership fees received.',
      fields: 'date:Date:date|member:Member:ref:members.name|plan:Plan:sel:Monthly,Quarterly,Annual,Student,Day pass|amount:Amount:money|method:Method:sel:Cash USD,EcoCash,Swipe,ZiG',
      print: 'Print receipt',
      rows: [['d-1', 'Chantelle Phiri', 'Monthly', 35, 'EcoCash'], ['d-4', 'Sibusiso Tshuma', 'Annual', 320, 'Swipe'], ['d-12', 'Mthokozisi Dube', 'Monthly', 35, 'Cash USD'], ['d-30', 'Brian Ncube', 'Quarterly', 95, 'EcoCash'], ['d-35', 'Tawanda Mpofu', 'Monthly', 35, 'Cash USD'], ['d-40', 'Lindiwe Moyo', 'Student', 20, 'EcoCash'], ['d-65', 'Mthokozisi Dube', 'Monthly', 35, 'Cash USD'], ['d-100', 'Ntombi Sibanda', 'Annual', 320, 'Swipe']]
    },
    checkins: {
      label: 'Check-ins', icon: 'door', one: 'check-in', addLabel: 'Check member in', desc: 'Who came in and when.',
      fields: 'date:Date:date|time:Time:time|member:Member:ref:members.name|area:Area:sel:Gym floor,Class,Pool,Sauna',
      rows: [['d0', '05:42', 'Mthokozisi Dube', 'Gym floor'], ['d0', '06:05', 'Ntombi Sibanda', 'Class'], ['d0', '06:15', 'Brian Ncube', 'Gym floor'], ['d0', '07:30', 'Sibusiso Tshuma', 'Pool'], ['d-1', '17:40', 'Chantelle Phiri', 'Class'], ['d-1', '18:10', 'Tawanda Mpofu', 'Gym floor']]
    },
    classes: {
      label: 'Classes', icon: 'calendar', one: 'class', addLabel: 'Schedule class', desc: 'Group classes and how full they are.',
      fields: 'date:Date:date|time:Time:time|cls:Class:sel:HIIT,Spinning,Boxing,Yoga,Aerobics|coach:Coach|booked:Booked:num|capacity:Capacity:num|fill:Full:=bar',
      calc: { fill: (r) => r.capacity ? (r.booked / r.capacity) * 100 : 0 },
      rows: [['d0', '06:00', 'HIIT', 'Coach Tinashe', 18, 20], ['d0', '17:30', 'Boxing', 'Coach Sipho', 12, 15], ['d+1', '06:00', 'Spinning', 'Coach Tinashe', 15, 15], ['d+1', '18:00', 'Yoga', 'Coach Rufaro', 8, 20], ['d+2', '06:00', 'HIIT', 'Coach Tinashe', 10, 20], ['d+3', '09:00', 'Aerobics', 'Coach Rufaro', 22, 25], ['d+5', '08:00', 'Boxing', 'Coach Sipho', 6, 15]]
    }
  },
  dash: {
    quick: [['Check member in', 'checkins', 1], ['Take payment', 'payments']],
    kpis: [['Active members', 'count:members?status=Active,Expiring', 'num'], ['Check-ins today', 'count:checkins?date=today', 'num'], ['Income this month', (H) => H.sum('payments', 'amount', 'date>=' + H.today.slice(0, 8) + '01'), 'money'], ['Expiring this week', 'count:members?status=Expiring', 'num', 'Call them to renew']],
    alerts: [['members?status=Expiring', '{n} membership{s} end this week', 'warn'], ['members?status=Expired', '{n} member{s} expired: win them back', 'bad'], ['classes?booked>=@capacity', '{n} class session{s} fully booked', 'info']],
    charts: [['Income by month', 'month:payments.date.amount', 'money'], ['Members by plan', 'by:members.plan'], ['Check-ins by area', 'by:checkins.area']],
    recent: [['checkins', 'Latest check-ins', 5, ['date', 'time', 'member', 'area']]]
  }
});

window.__SYS.push({
  id: 'gatepass', name: 'GatePass', tag: 'Events & ticketing', group: 'Shops, food & hospitality', icon: 'ticket', color: '#5b21b6', color2: '#06b6d4',
  org: { name: 'Sunset Events Zimbabwe', place: 'Harare Gardens', phone: '+263 71 990 4400' },
  blurb: 'Ticket tiers, box office sales, gate check-in, sponsors and event budgets for promoters and venues.',
  headline: 'Sell tickets, scan them at the gate, and know your numbers live.',
  features: ['Box office with General, VIP and VVIP tiers', 'Gate staff check tickets in from a phone', 'Sales by tier and payment method in real time', 'Event budget against ticket income'],
  roles: [
    ['promoter', 'Promoter', 'Mr Ray Chinamasa', 'Sales and budgets', ['dash', 'pos', 'tickets', 'tiers', 'events', 'reports']],
    ['box', 'Box office', 'Ms Fadzi Mapuranga', 'Sell tickets', ['pos', 'tickets:r']],
    ['gate', 'Gate staff', 'Mr Sam Tembo', 'Check tickets in', ['tickets']]
  ],
  modules: { pos: { type: 'pos', label: 'Box office', icon: 'ticket', items: 'tiers', name: 'name', price: 'price', stock: 'left', cat: 'event', sales: 'tickets', saleStatus: 'Valid', cartTitle: 'Tickets', payLabel: 'Issue tickets', methods: ['EcoCash', 'Cash USD', 'Swipe', 'InnBucks'] } },
  tables: {
    events: {
      label: 'Events', icon: 'star', code: 'EV', one: 'event', desc: 'Shows with budget and capacity.',
      fields: 'name:Event|date:Date:date|venue:Venue|capacity:Capacity:num|budget:Budget:money|income:Ticket income:=money|profit:Profit:=money|status:Status:status:On sale~ok,Sold out~warn,Done~grey',
      calc: { income: (r, H) => H.where('tickets').filter((t) => String(t.items).includes(r.name)).reduce((a, t) => a + (+t.total || 0), 0), profit: (r, H) => H.where('tickets').filter((t) => String(t.items).includes(r.name)).reduce((a, t) => a + (+t.total || 0), 0) - (+r.budget || 0) },
      rows: [['Harare Jazz Night', 'd+10', 'Harare Gardens', 1500, 9000, 'On sale'], ['Bulawayo Comedy Fest', 'd+24', 'Large City Hall', 800, 4500, 'On sale'], ['Amapiano Sundowner', 'd-20', 'Pariah State', 600, 3000, 'Done']]
    },
    tiers: {
      label: 'Ticket tiers', icon: 'tag', one: 'tier', desc: 'Prices and tickets left for each event.',
      fields: 'name:Tier|event:Event:ref:events.name|price:Price:money|left:Tickets left:num',
      rows: [['Harare Jazz Night · General', 'Harare Jazz Night', 15, 820], ['Harare Jazz Night · VIP', 'Harare Jazz Night', 40, 96], ['Harare Jazz Night · VVIP table (6)', 'Harare Jazz Night', 300, 4], ['Bulawayo Comedy Fest · General', 'Bulawayo Comedy Fest', 10, 540], ['Bulawayo Comedy Fest · VIP', 'Bulawayo Comedy Fest', 25, 60]]
    },
    tickets: {
      label: 'Tickets sold', icon: 'ticket', code: 'TKT', one: 'ticket', desc: 'Every ticket sale. Gate staff check them in.',
      fields: 'date:Sold:date|time:Time:time|items:Tickets|qty:Qty:num|total:Total:money|method:Method:sel:EcoCash,Cash USD,Swipe,InnBucks|customer:Buyer|-cashier:Sold by|status:Status:status:Valid~info,Checked in~ok,Refunded~grey',
      actions: [['Check in at gate', 'status=Checked in', 'status=Valid', 'Ticket checked in'], ['Refund', 'status=Refunded', 'status=Valid']],
      rows: [['d0', '09:15', '2× Harare Jazz Night · VIP', 2, 80, 'EcoCash', 'Tafara Mukono', 'Ms Fadzi Mapuranga', 'Valid'], ['d-1', '16:40', '4× Harare Jazz Night · General', 4, 60, 'Cash USD', 'Rudo Hwata', 'Ms Fadzi Mapuranga', 'Valid'], ['d-2', '12:00', '1× Harare Jazz Night · VVIP table (6)', 1, 300, 'Swipe', 'CBZ Bank', 'Ms Fadzi Mapuranga', 'Valid'], ['d-3', '18:20', '3× Bulawayo Comedy Fest · General', 3, 30, 'EcoCash', 'Sipho Moyo', 'Ms Fadzi Mapuranga', 'Valid'], ['d-5', '10:10', '6× Harare Jazz Night · General', 6, 90, 'InnBucks', 'Nyasha Ruzvidzo', 'Ms Fadzi Mapuranga', 'Valid'], ['d-21', '19:00', '40× Amapiano Sundowner · General', 40, 400, 'Cash USD', 'Walk-in', 'Ms Fadzi Mapuranga', 'Checked in'], ['d-25', '14:00', '20× Amapiano Sundowner · VIP', 20, 500, 'EcoCash', 'Online', 'Ms Fadzi Mapuranga', 'Checked in'], ['d-50', '14:00', '60× Amapiano Sundowner · General', 60, 600, 'EcoCash', 'Online', 'Ms Fadzi Mapuranga', 'Checked in']]
    }
  },
  dash: {
    quick: [['Open box office', 'pos', 1]],
    kpis: [['Tickets sold', 'sum:tickets.qty?status!=Refunded', 'num'], ['Ticket income', 'sum:tickets.total?status!=Refunded', 'money'], ['Checked in', 'sum:tickets.qty?status=Checked in', 'num'], ['Next event', (H) => { const e = H.where('events', 'date>=today').sort((a, b) => a.date.localeCompare(b.date))[0]; return e ? H.days(H.today, e.date) : 0; }, 'days', 'Until the gates open']],
    alerts: [['tiers?left<10', '{n} ticket tier{s} almost sold out', 'warn'], ['events?status=On sale&date<=d+14', '{n} event{s} in the next two weeks', 'info']],
    charts: [['Ticket income by month', 'month:tickets.date.total', 'money'], ['Income by payment method', 'sum:tickets.method.total', 'money'], ['Event profit', 'sum:events.name.profit', 'money']],
    recent: [['tickets', 'Latest ticket sales', 5, ['date', 'items', 'total', 'customer']]]
  }
});
