import { EventEmitter } from "events";
import { FailureRecord } from "./types";

class FailureEventEmitter extends EventEmitter {
  emitFailure(record: FailureRecord): boolean {
    return super.emit("failure", record);
  }

  onFailure(listener: (record: FailureRecord) => void): this {
    return this.on("failure", listener);
  }

  offFailure(listener: (record: FailureRecord) => void): this {
    return this.off("failure", listener);
  }
}

export const FailureEmitter = new FailureEventEmitter();
