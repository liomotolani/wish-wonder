-- Keep track of which boxes a buyer has peeked at during a picker visit.
-- Gift names and the number-to-gift mapping stay on the server.
alter table picker_visits
  add column peeked_gift_ids uuid[] not null default '{}'::uuid[];
