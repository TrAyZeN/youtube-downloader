class SseEvent {
  // Creates a new `SseEvent` from the given data and event.
  constructor(data, event = null) {
    this.data = data;
    this.event = event;
  }

  // Gets the string representation of this event.
  toString() {
    let s = '';
    if (this.event) {
      s += `event: ${this.event}\n`;
    }

    if (this.data instanceof Object) {
      s += `data: ${JSON.stringify(this.data)}\n\n`;
    } else {
      s += `data: ${this.data}\n\n`;
    }

    return s;
  }
}

module.exports = {
  SseEvent,
};
