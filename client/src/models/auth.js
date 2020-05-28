const PERMISSIONS = {
  ADMIN: 0,
  TREE_AUDIT: 1,
  PLANTER: 2,
};

function hasPermission(user, p){
  if(!user) return false;
  return user.role.some(r => r === p) ? true : false;
}

export {PERMISSIONS, hasPermission};
