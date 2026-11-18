-- Each gift can be priced in its own currency. Values are stored as integer
-- minor units in price_pence (the legacy column name); existing gifts are GBP.
alter table gifts
  add column currency text not null default 'GBP'
  constraint gifts_currency_check
  check (currency in ('GBP', 'EUR', 'USD', 'AUD', 'CAD', 'NZD', 'CHF', 'SGD'));
