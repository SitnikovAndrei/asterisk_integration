class SummaryDTO {
    constructor({contextId, fromNumber, toNumber, direction}) {
      this.timestamp = Date.now();
      this.contextId = contextId;
      this.fromNumber = fromNumber;
      this.toNumber = toNumber;
      this.direction = direction;
    }
  }

  module.exports = SummaryDTO;