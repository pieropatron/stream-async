"use strict";
import { callbackify } from "util";
import { WritableAsync } from "./Writable";
import { ReadableAsync } from "./Readable";

export function SeparateOptions<T>(options: object, async_keys: Set<string>){
	const result = {
		async_opts: {},
		super_opts: {}
	};

	for (const key in options){
		const value = options[key];
		if (async_keys.has(key)){
			if (value[Symbol.toStringTag] !== 'AsyncFunction') {
				throw new Error(`${key} should be AsyncFunction`);
			}
			result.async_opts[key] = value;
		} else {
			result.super_opts[key] = value;
		}
	}

	return result as {async_opts: T, super_opts: T};
}

export function CheckWritev<T>(this: WritableAsync<T>){
	if (this._writevAsync && !this._writeAsync) {
		this._writeAsync = async function (chunk: T, encoding?: BufferEncoding) {
			await this._writevAsync?.([{ chunk, encoding }]);
		};
		(this as any)._write = callbackify(this._writeAsync).bind(this);
	}
}

export function AssignAsyncOpts(self: any, async_opts: any, async_keys: Set<string>){
	async_keys.forEach(key=>{
		const cb_key = `_${key}`;
		const async_key = `${cb_key}Async`;
		let async_fn = async_opts[key];
		if (async_fn){
			if (self[async_key]){
				throw new Error(`Can not assign options ${key} as ${async_key} already declared`);
			}
			self[async_key] = async_fn;
		} else if (self[async_key]){
			async_fn = self[async_key];
		} else {
			return;
		}
		self[cb_key] = callbackify(async_fn).bind(self);
	});
}

function checkNeedDrain(w: any){
	return w && w.once && !w.destroyed && (w.writableNeedDrain || w._writableState?.needDrain);
}

function findNeedDrain(pipes: any[]){
	if (!pipes) return;
	pipes = Array.isArray(pipes) ? pipes : [pipes];
	for (let i=0;i<pipes.length; i++){
		const w = pipes[i];
		if (checkNeedDrain(w)) return w;
	}
}

export async function waitDrain(this: ReadableAsync<any>){
	if (this.destroyed) return;
	const pipes = (this as any)._readableState?.pipes;
	const w = findNeedDrain(pipes);
	if (!w) return;

	return new Promise<void>((resolve)=>{
		process.nextTick(()=>{
			if (checkNeedDrain(w)){
				w.once('drain', ()=>{
					resolve();
				});
			} else {
				resolve();
			}
		});
	});
}

export async function pushAsync<T>(this: ReadableAsync<T>, data: T){
	if (!this.push(data)) await this.waitDrain();
	return true;
}
