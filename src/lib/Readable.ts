"use strict";

import { Readable, ReadableOptions } from "stream";
import { waitDrain, pushAsync } from "./lib-utils";

export class ReadableAsync<T> extends Readable {
	public push: (chunk: T|null, encoding?: BufferEncoding | undefined)=>boolean;
	public pushAsync: (chunk: T|null, encoding?: BufferEncoding | undefined)=>Promise<boolean>;
	public waitDrain: ()=>Promise<void>;

	constructor(options: ReadableOptions){
		options.read = options.read || function(){};
		super(options);
	}
}

ReadableAsync.prototype.pushAsync = pushAsync;
ReadableAsync.prototype.waitDrain = waitDrain;
