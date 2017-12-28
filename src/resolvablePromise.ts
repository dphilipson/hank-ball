export interface ResolvablePromise<T> {
    promise: Promise<T>;
    resolve(value: T | PromiseLike<T>): void;
    reject(reason?: any): void;
}

export function makeResolvablePromise<T>(): ResolvablePromise<T> {
    let resolve: (value: T | PromiseLike<T>) => void = undefined!;
    let reject: (error: any) => void = undefined!;
    const promise = new Promise<T>((resolveArg, rejectArg) => {
        resolve = resolveArg;
        reject = rejectArg;
    });
    return { promise, resolve, reject };
}
