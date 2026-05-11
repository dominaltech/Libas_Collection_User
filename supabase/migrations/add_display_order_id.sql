-- Create a sequence starting at 1000, cycling back after 9999
CREATE SEQUENCE IF NOT EXISTS orders_display_id_seq
  START 1000
  MINVALUE 1000
  MAXVALUE 9999
  CYCLE;

-- Add display_order_id column to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS display_order_id INTEGER DEFAULT nextval('orders_display_id_seq');

-- Backfill existing orders that have NULL display_order_id
UPDATE orders
  SET display_order_id = nextval('orders_display_id_seq')
  WHERE display_order_id IS NULL;
