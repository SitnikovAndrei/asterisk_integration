class ContextDTO {
  created_at = Date.now();

  constructor({
    contextId,
    callId,
    fromNumber,
    toNumber,
    state,
    lineNumber,
    direction
  }) {
    this.contextId = contextId;
    this.callId = callId;
    this.fromNumber = fromNumber;
    this.toNumber = toNumber;
    this.state = state;
    this.lineNumber = lineNumber;
    this.direction = direction;
    this.calls = [];
  }
}


module.exports = ContextDTO;