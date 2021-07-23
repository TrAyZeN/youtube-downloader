class SseEvent {
  data: string | Object;
  event: string | null;

  // Creates a new `SseEvent` from the given data and event.
  constructor(data: string | Object, event: string | null = null) {
    this.data = data;
    this.event = event;
  }

  // Gets the string representation of this event.
  toString(): string {
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

export default SseEvent;
