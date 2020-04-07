exports.status = {};
exports.status.new = () => { return 'new'; };
exports.status.inProvision = () => { return 'inProvision'; };
exports.status.inMonitoring = () => { return 'inMonitoring'; };
exports.status.inReceiving = () => { return 'inReceiving'; };
exports.status.accepted = () => { return 'accepted'; };
exports.status.rejected = () => { return 'rejected'; };
exports.status.completed = () => { return 'completed'; };
exports.status.acceptedDeinstrumented = () => { return 'acceptedDeinstrumented'; };
exports.status.rejectedDeinstrumented = () => { return 'rejectedDeinstrumented'; };
exports.status.completedDeinstrumented = () => { return 'completedDeinstrumented'; };
exports.status.all = () => {
  return [
    exports.status.new(),
    exports.status.inProvision(),
    exports.status.inMonitoring(),
    exports.status.inReceiving(),
    exports.status.accepted(),
    exports.status.rejected(),
    exports.status.completed(),
    exports.status.acceptedDeinstrumented(),
    exports.status.rejectedDeinstrumented(),
    exports.status.completedDeinstrumented()
  ];
};

exports.role = {};
exports.role.name = {};
exports.role.name.deskAgent = () => { return 'Desk Agent'; };
exports.role.name.dockWorker = () => { return 'Dock Worker'; };
exports.role.name.all = () => {
  return [
    exports.role.name.deskAgent(),
    exports.role.name.dockWorker()
  ];
};
exports.role.name.exists = (name) => {
  return exports.role.name.all().indexOf(name) !== -1;
};

exports.errMsg = {};
exports.errMsg.notRoleMember = () => { return 'The user account is not a member of an allowed role.'; };

exports.photo = {};
exports.photo.action = {};
exports.photo.action.create = () => { return 'create'; };
exports.photo.action.replace = () => { return 'replace'; };
exports.photo.type = {};
exports.photo.type.pod = () => { return 'proof_of_delivery'; };
exports.photo.type.doc = () => { return 'documentation'; };
exports.photo.type.all = () => {
  return [
    exports.photo.type.pod(),
    exports.photo.type.doc()
  ];
};
exports.photo.type.exists = (name) => {
  return exports.photo.type.all().indexOf(name) !== -1;
};
