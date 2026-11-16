-- Member names are unique within a family, regardless of capitalisation.
create unique index uq_members_family_display_name_lower
  on members (family_id, lower(display_name));
