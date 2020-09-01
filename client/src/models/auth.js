const PERMISSIONS = {
  ADMIN: 1,
  TREE_AUDIT: 2,
  PLANTER: 3,
};

function hasPermission(user, p){
  console.assert(user, "Why user fail?", user);
  if(!user) return false;
  if(p instanceof Array){
    return p.some(permission => {
      return user.policy.policies.some(r => r.name === permission);
    });
  }else{
    return user.policy.policies.some(r => r.name === p) ? true : false;
  }
}

/*
 * to save the token
 */
const session = {
}

export {PERMISSIONS, hasPermission, session};
