"use strict";

import {strictEqual} from 'assert';

import {ReadableAsync, TransformAsync, WriteableAsync, pipeline} from '../src/index';

type OPTS = { i: number };
type RES = { J: number };

const test_common = async (ar: RES[], rs: ReadableAsync<OPTS>, ts: TransformAsync<OPTS, RES>, ws: WriteableAsync<RES>)=>{
	const count = 100;
	await Promise.all([
		pipeline(rs, ts, ws),
		(async () => {
			for (let i = 0; i < count; i++) {
				if (!rs.push({ i })) {
					await rs.waitDrain();
				}
			}
			rs.push(null);
		})()
	]);
	strictEqual(ar.length, count);
	strictEqual(ar[0].J, 0);
	strictEqual(ar[count - 1].J, count - 1);
};

async function ts_writev(this: TransformAsync<OPTS, RES>, _archunks: {chunk: OPTS}[]){
	for (let i = 0; i < _archunks.length; i++) {
		const chunk = _archunks[i].chunk;
		if (!this.push({ J: chunk.i })) {
			await this.waitDrain();
		}
	}
}

async function ws_write(ar: RES[], chunk:RES) {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			ar.push(chunk);
			resolve();
		}, 10);
	});
}

const test_options = async()=>{
	const rs = new ReadableAsync<OPTS>({objectMode: true});
	const ts = new TransformAsync<OPTS, RES>({
		highWaterMark: 5,
		objectMode: true,
		writev: ts_writev
	});

	const ar: RES[] = [];
	const ws = new WriteableAsync<RES>({
		objectMode: true,
		write: ws_write.bind(null, ar)
	});

	await test_common(ar, rs, ts, ws);
};
const test_classes = async()=>{
	const rs = new ReadableAsync<OPTS>({objectMode: true});
	class TS extends TransformAsync<OPTS, RES> {
		constructor(){
			super({
				highWaterMark: 5,
				objectMode: true
			});
		}

		async _writevAsync(chunks){
			await ts_writev.call(this, chunks);
		}
	}

	const ar: RES[] = [];

	class WS extends WriteableAsync<RES> {
		constructor(){
			super({
				objectMode: true
			});
		}

		async _writeAsync(chunk: RES) {
			await ws_write.call(this, ar, chunk);
		}
	}

	await test_common(ar, rs, new TS(), new WS());
};

const run = async ()=>{
	console.time("test_options");
	await test_options();
	console.timeEnd("test_options");
	console.time("test_classes");
	await test_classes();
	console.timeEnd("test_classes");
};

const fatal = (error:Error)=>{
	console.error(error);
	process.exit(1);
};

const to = setTimeout(()=>{
	fatal(new Error(`test timeout expired`));
}, 10000);

run().then(()=>{
	clearTimeout(to);
	console.log("test OK");
	process.exit(0);
}, fatal);
