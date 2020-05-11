class SummaryDTO {
    calls = {};
    
    constructor({contextId, start, end, fromNumber, toNumber, direction}) {
      this.contextId = contextId;
      this.start = Date.now();
      this.end = end;
      this.fromNumber = fromNumber;
      this.toNumber = toNumber;
      this.direction = direction;
    }
  }

  module.exports = SummaryDTO;