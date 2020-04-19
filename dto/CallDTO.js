class CallDTO {
  constructor({contextId, callId, fromNumber, toNumber, state, lineNumber, direction, location}) {
    this.timestamp = Date.now();
    this.contextId = contextId;
    this.callId = callId;
    this.fromNumber = fromNumber;
    this.toNumber = toNumber;
    this.state = state;
    this.lineNumber = lineNumber;
    this.direction = direction;
    this.location = location;
  }
}


module.exports = CallDTO;