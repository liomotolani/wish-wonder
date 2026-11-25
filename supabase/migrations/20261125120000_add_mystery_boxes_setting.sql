-- Organiser can turn the mystery boxes off for the whole group (FR-46).
alter table families
  add column mystery_boxes boolean not null default true;
