class CallDTO {
  constructor({
    contextId,
    callId,
    fromNumber,
    toNumber,
    state,
    lineNumber,
    direction
  }) {
    this.timestamp = Date.now();
    this.contextId = contextId;
    this.callId = callId;
    this.fromNumber = fromNumber;
    this.toNumber = toNumber;
    this.state = state;
    this.lineNumber = lineNumber;
    this.direction = direction;
  }
}


module.exports = CallDTO;