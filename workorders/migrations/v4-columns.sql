ALTER TABLE stock_moves ADD COLUMN department TEXT;
ALTER TABLE stock_moves ADD COLUMN req_id INTEGER;
ALTER TABLE purchase_requests ADD COLUMN po_id INTEGER;
ALTER TABLE purchase_requests ADD COLUMN req_line_id INTEGER;
