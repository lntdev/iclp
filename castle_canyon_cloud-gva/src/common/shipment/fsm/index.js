const Logging = require('cccommon/logging').logger('common.shipment.fsm');
Logging.enable();

const statelyJs = require('stately.js');
const statusConst = require('cccommon/constant').status;
let cachedMachineSpec;

exports.newMachineSpec = () => {
  const spec = {};

  /* new */

  spec[statusConst.new()] = {};
  spec[statusConst.new()][statusConst.inMonitoring()] = () => {
    return statusConst.inMonitoring();
  };

  /* inProvision */

  spec[statusConst.inProvision()] = {};
  spec[statusConst.inProvision()][statusConst.inMonitoring()] = () => {
    return statusConst.inMonitoring();
  };
  spec[statusConst.inProvision()][statusConst.new()] = () => {
    // OBT use-case: dock worker 'quits' working on a given shipment for any reason and another
    // dock worker must be allowed to first find the shipment in the OBT and then begin the
    // provisioning process again. The current method is to allow the status to be 'reset' back
    // to the 'new' state.
    return statusConst.new();
  };

  /* inMonitoring */

  spec[statusConst.inMonitoring()] = {};
  spec[statusConst.inMonitoring()][statusConst.completedDeinstrumented()] = () => {
    return statusConst.completedDeinstrumented();
  };

  /* inReceiving */

  spec[statusConst.inReceiving()] = {};
  spec[statusConst.inReceiving()][statusConst.accepted()] = () => {
    return statusConst.accepted();
  };
  spec[statusConst.inReceiving()][statusConst.rejected()] = () => {
    return statusConst.rejected();
  };
  spec[statusConst.inReceiving()][statusConst.inMonitoring()] = () => {
    // OBT use-case: dock worker 'quits' working on a given shipment for any reason and another
    // dock worker must be allowed to first find the shipment in the OBT and then begin the
    // receiving process again. The current method is to allow the status to be 'reset' back
    // to the 'inMonitoring' state.
    return statusConst.inMonitoring();
  };

  /* accepted */

  spec[statusConst.accepted()] = {};
  spec[statusConst.accepted()][statusConst.completed()] = () => {
    return statusConst.completed();
  };
  spec[statusConst.accepted()][statusConst.acceptedDeinstrumented()] = () => {
    return statusConst.acceptedDeinstrumented();
  };

  /* rejected */

  spec[statusConst.rejected()] = {};
  spec[statusConst.rejected()][statusConst.rejectedDeinstrumented()] = () => {
    return statusConst.rejectedDeinstrumented();
  };

  /* completed */

  spec[statusConst.completed()] = {};
  spec[statusConst.completed()][statusConst.completedDeinstrumented()] = () => {
    return statusConst.completedDeinstrumented();
  };

  /* acceptedDeinstrumented */

  spec[statusConst.acceptedDeinstrumented()] = {};
  spec[statusConst.acceptedDeinstrumented()][statusConst.completedDeinstrumented()] = () => {
    return statusConst.completedDeinstrumented();
  };

  /* rejectedDeinstrumented */

  spec[statusConst.rejectedDeinstrumented()] = {};

  /* completedDeinstrumented */

  spec[statusConst.completedDeinstrumented()] = {};

  function onEnter(event, oldState, newState) { // eslint-disable-line no-unused-vars
    // uncomment for debugging
    // console.log(`shipment FSM transition [${oldState}] -> [${newState}]`); // eslint-disable-line no-console
  }
  Object.keys(spec).forEach(state => {
    spec[state].onEnter = onEnter;
  });

  return spec;
};

exports.allowedTransitions = (fromState) => {
  if (!fromState || fromState === '') {
    throw new Error('failed to find allowed shipment status transitions, from-state is missing/empty');
  }
  if (statusConst.all().indexOf(fromState) === -1) {
    throw new Error(`failed to find allowed shipment status transitions, from-state [${fromState}] was not found`);
  }

  const spec = exports.getMachineSpec();
  const allowed = [];
  Object.keys(spec[fromState]).forEach(k => {
    if (statusConst.all().indexOf(k) !== -1) {
      allowed.push(k);
    }
  });
  return allowed;
};

exports.allowedStates = () => {
  return Object.keys(exports.getMachineSpec());
};

exports.validateState = (state) => {
  return exports.allowedStates().indexOf(state) !== -1;
};

exports.getMachineSpec = () => {
  let spec;

  // Normally we would cache the machine as a whole, but its API (understandably)
  // doesn't support 'forced' state transitions to support our ad-hoc validation use case.
  if (cachedMachineSpec) {
    spec = cachedMachineSpec;
  } else {
    cachedMachineSpec = exports.newMachineSpec();
    spec = Object.assign({}, cachedMachineSpec); // Assign to avoid risk of editing cache.
  }

  return spec;
};

exports.validateTransition = (fromState, toState) => {
  if (!fromState || fromState === '') {
    throw new Error('failed to validate shipment status transition, from-state is missing/empty');
  }
  if (!toState || toState === '') {
    throw new Error('failed to validate shipment status transition, to-state is missing/empty');
  }

  if (statusConst.all().indexOf(fromState) === -1) {
    throw new Error(`failed to validate shipment status transition, from-state [${fromState}] was not found`);
  }
  if (statusConst.all().indexOf(toState) === -1) {
    throw new Error(`failed to validate shipment status transition, to-state [${toState}] was not found`);
  }

  // E.g. machineObj.inProvision() will return 'inProvision' if the the transition was allowed,
  // otherwise it will return the original state.
  try {
    return statelyJs.machine(exports.getMachineSpec(), fromState)[toState]().getMachineState() === toState;
  } catch (err) {
    // Suppress invalid transition exceptions
  }

  return false;
};
