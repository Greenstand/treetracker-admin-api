function needRoleUpdate(update_userSession, userSession) {
  /*if no role exist prev/current, then update regardless and don't check if both are equa */
  const hasRoles = !!update_userSession.role && !!userSession.role;
  if (!hasRoles) {
    return true;
  } else {
    /*check if roles equal */
    const isEqual =
      update_userSession.role.length === userSession.role.length &&
      userSession.role.every((val) => update_userSession.role.includes(val));
    return isEqual ? false : true;
  }
}

exports.helper = {
  needRoleUpdate,
};
