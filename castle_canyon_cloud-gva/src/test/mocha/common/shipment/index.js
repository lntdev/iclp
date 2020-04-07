const expect = T.expect;
const fsm = require('cccommon/shipment/fsm');
const statusConst = require('cccommon/constant').status;

describe('state machine', function() {
  /**
   * Expected transitions
   */

  it('should allow new to inProvision', function() {
    expect(fsm.validateTransition(statusConst.new(), statusConst.inProvision())).to.be.true;
  });

  it('should allow inProvision to new', function() {
    expect(fsm.validateTransition(statusConst.inProvision(), statusConst.new())).to.be.true;
  });

  it('should allow inProvision to inMonitoring', function() {
    expect(fsm.validateTransition(statusConst.inProvision(), statusConst.inMonitoring())).to.be.true;
  });

  it('should allow inMonitoring to inReceiving', function() {
    expect(fsm.validateTransition(statusConst.inMonitoring(), statusConst.inReceiving())).to.be.true;
  });

  it('should allow inReceiving to inMonitoring', function() {
    expect(fsm.validateTransition(statusConst.inReceiving(), statusConst.inMonitoring())).to.be.true;
  });

  it('should allow inReceiving to accepted', function() {
    expect(fsm.validateTransition(statusConst.inReceiving(), statusConst.accepted())).to.be.true;
  });

  it('should allow inReceiving to rejected', function() {
    expect(fsm.validateTransition(statusConst.inReceiving(), statusConst.rejected())).to.be.true;
  });

  it('should allow accepted to completed', function() {
    expect(fsm.validateTransition(statusConst.accepted(), statusConst.completed())).to.be.true;
  });

  it('should allow accepted to acceptedDeinstrumented', function() {
    expect(fsm.validateTransition(statusConst.accepted(), statusConst.acceptedDeinstrumented())).to.be.true;
  });

  it('should allow rejected to rejectedDeinstrumented', function() {
    expect(fsm.validateTransition(statusConst.rejected(), statusConst.rejectedDeinstrumented())).to.be.true;
  });

  it('should allow acceptedDeinstrumented to completedDeinstrumented', function() {
    expect(fsm.validateTransition(statusConst.acceptedDeinstrumented(), statusConst.completedDeinstrumented())).to.be.true;
  });

  it('should allow completed to completedDeinstrumented', function() {
    expect(fsm.validateTransition(statusConst.completed(), statusConst.completedDeinstrumented())).to.be.true;
  });
  /**
   * Assorted sanity checks
   */

  it('should not allow new to inMonitoring', function() {
    expect(fsm.validateTransition(statusConst.new(), statusConst.inMonitoring())).to.be.false;
  });

  it('should not allow rejected to inProvision', function() {
    expect(fsm.validateTransition(statusConst.rejected(), statusConst.inProvision())).to.be.false;
  });

  it('should not allow inReceiving to new', function() {
    expect(fsm.validateTransition(statusConst.inReceiving(), statusConst.new())).to.be.false;
  });

  /**
   * Inspection / debugging
   */

  it('should output allowed transitions', function() {
    expect(fsm.allowedTransitions(statusConst.new())).to.be.equalArray([
      statusConst.inProvision()
    ]);

    expect(fsm.allowedTransitions(statusConst.inProvision())).to.be.equalArray([
      statusConst.new(),
      statusConst.inMonitoring()
    ]);

    expect(fsm.allowedTransitions(statusConst.inMonitoring())).to.be.equalArray([
      statusConst.inReceiving()
    ]);

    expect(fsm.allowedTransitions(statusConst.inReceiving())).to.be.equalArray([
      statusConst.inMonitoring(),
      statusConst.accepted(),
      statusConst.rejected()
    ]);

    expect(fsm.allowedTransitions(statusConst.accepted())).to.be.equalArray([
      statusConst.completed(),
      statusConst.acceptedDeinstrumented()
    ]);

    expect(fsm.allowedTransitions(statusConst.rejected())).to.be.equalArray([
      statusConst.rejectedDeinstrumented()
    ]);

    expect(fsm.allowedTransitions(statusConst.rejectedDeinstrumented())).to.be.equalArray([]);

    expect(fsm.allowedTransitions(statusConst.acceptedDeinstrumented())).to.be.equalArray([
      statusConst.completedDeinstrumented()
    ]);

    expect(fsm.allowedTransitions(statusConst.completed())).to.be.equalArray([statusConst.completedDeinstrumented()]);

    expect(fsm.allowedTransitions(statusConst.completedDeinstrumented())).to.be.equalArray([]);
  });

  it('should output all known states', function() {
    expect(fsm.allowedStates()).to.be.equalArray(statusConst.all());
  });

  it('should validate all known states', function() {
    statusConst.all().forEach(state => {
      expect(fsm.validateState(state)).to.be.true;
    });

    statusConst.all().forEach(state => {
      expect(fsm.validateState(state + 'invalidate name')).to.be.false;
    });
  });
});
