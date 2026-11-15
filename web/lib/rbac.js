// Which table holds each role's login accounts (fixed whitelist, never user input)
export const ROLE_TABLES = {
  admin:   { table: 'admin',   idCol: 'admin_id' },
  trainer: { table: 'trainer', idCol: 'trainer_id' },
  member:  { table: 'member',  idCol: 'member_id' },
};
