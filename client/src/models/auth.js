const PERMISSIONS = {
  ADMIN: 0,
  TREE_AUDIT: 1,
  PLANTER: 2,
};

function hasPermission(user, p){
  console.assert(user, "Why user fail?", user);
  if(!user) return false;
  if(p instanceof Array){
    return p.some(permission => {
      return user.role.some(r => r === permission);
    });
  }else{
    return user.role.some(r => r === p) ? true : false;
  }
}

export {PERMISSIONS, hasPermission};
