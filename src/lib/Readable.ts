import { Readable, ReadableOptions } from "stream";
import { waitDrain, pushAsync } from "./lib-utils";

export class ReadableAsync<T> extends Readable {
	constructor(options: ReadableOptions){
		options.read = options.read || function(){};
		super(options);
	}

	push(chunk: T|null, encoding?: BufferEncoding): boolean{
		return Readable.prototype.push.call(this, chunk, encoding);
	}

	pushAsync(chunk: T|null, encoding?: BufferEncoding): Promise<boolean>{
		return pushAsync.call(this, chunk, encoding);
	}

	waitDrain(): Promise<void>{ return waitDrain.call(this); }
}

// no need to override in fact
ReadableAsync.prototype.push = Readable.prototype.push;
