import { promisify } from "util";
import stream from "stream";

export {ReadableAsync} from './Readable';
export {WritableAsyncOptions, WritableAsync} from './Writable';
export {TransformAsyncOptions, TransformAsync} from './Transform';

export const pipeline = stream.promises?.pipeline ? stream.promises.pipeline : promisify(stream.pipeline);
