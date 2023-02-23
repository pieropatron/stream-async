import { promisify } from "util";
import stream from "stream";

export {ReadableAsync} from './lib/Readable';
export {WritableAsyncOptions, WritableAsync} from './lib//Writable';
export {TransformAsyncOptions, TransformAsync} from './lib/Transform';

export const pipeline = stream.promises?.pipeline ? stream.promises.pipeline : promisify(stream.pipeline);
