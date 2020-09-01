enum STATE {
    PENDING = 'pending',
    FULFILLED = 'fulfilled',
    REJECTED = 'rejected'
}

type TResolveFn = (value?: any)=> void;
type TRejectFn = (reason?: any)=> void;
type TFulfilledFn = (data?: any)=> any;
type TRejectedFn = (err?: any)=> any;
type TPromiseExecutor = (resolve: TResolveFn, reject: TRejectFn)=> void;

interface ICallback {
    resolve: TResolveFn;
    reject: TRejectFn;
    onFulfilled?: TFulfilledFn;
    onRejected?: TRejectedFn;
}

const isFunction = (value: any): value is Function => typeof value === 'function';

const isObject = (value: any): value is Object => Object.prototype.toString.call(value) === '[object Object]';

/* eslint-disable */
const isMyPromise = (value: any): value is MyPromise => value instanceof MyPromise;
/* eslint-enable */

const isThenable = (thenable: any): boolean => (isFunction(thenable) || isObject(thenable)) && 'then' in thenable;

class MyPromise {

    public state: STATE = STATE.PENDING
    public result: any;
    public callbacks: ICallback[] = [];

    constructor (executor: TPromiseExecutor) {

        const onFulfilled = (value: any) => this._transition(STATE.FULFILLED, value);
        const onRejected = (reason: any) => this._transition(STATE.REJECTED, reason);

        let ignore: boolean = false;
        const resolve = (value: any) => {
            if (ignore) return;
            ignore = true;
            this._resolvePromise(value, onFulfilled, onRejected);
        };

        const reject = (reason: any) => {
            if (ignore) return;
            ignore = true;
            onRejected(reason);
        };

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }

    }

    public then (onFulfilled?: TFulfilledFn, onRejected?: TRejectedFn) {
        return new MyPromise((resolve, reject) => {
            const callback: ICallback = {
                onFulfilled, onRejected, resolve, reject,
            };
            if (this.state === STATE.PENDING) {
                this.callbacks.push(callback);
                return;
            }
            setTimeout(this._handleCallback.bind(this, callback), 0);
        });
    }

    public catch (onRejected?: TRejectedFn) {
        return this.then(undefined, onRejected);
    }

    private _transition (state: STATE, result: any) {
        if (this.state !== STATE.PENDING) return;
        this.state = state;
        this.result = result;
        setTimeout(this._handleAllCallbacks.bind(this), 0);
    }

    private _handleCallback (callback: ICallback) {
        const {
            onFulfilled, onRejected, resolve, reject,
        } = callback;

        try {
            if (this.state === STATE.FULFILLED) {
                isFunction(onFulfilled) ?
                    resolve(onFulfilled(this.result)) :
                    resolve(this.result);
                return;
            }
            if (this.state === STATE.REJECTED) {
                isFunction(onRejected) ?
                    resolve(onRejected(this.result)) :
                    reject(this.result);
            }
        } catch (error) {
            reject(error);
        }
    }

    private _handleAllCallbacks () {
        this.callbacks.forEach(callback => this._handleCallback(callback));
        this.callbacks = [];
    }

    private _resolvePromise (value: any, onFullfilled: TFulfilledFn, onRejected: TRejectedFn) {
        if (value === this) {
            return onRejected(new TypeError('Can not fulfill promise with itself'));
        }
        if (isMyPromise(value)) {
            return value.then(onFullfilled, onRejected);
        }
        if (isThenable(value)) {
            try {
                const then = value.then;
                if (isFunction(then)) {
                    return new MyPromise(then.bind(value)).then(onFullfilled, onRejected);
                }
            } catch (error) {
                return onRejected(error);
            }
        }
        onFullfilled(value);
    }

    // 兼容测试用例
    public static defer: any;
    public static deferred: any;

    public static resolve (value?: any) {
        return new MyPromise(resolve => resolve(value));
    }

    public static reject (reason?: any) {
        return new MyPromise((_, reject) => reject(reason));
    }

    public static all (...promises: MyPromise[]) {
        return new MyPromise((resolve, reject) => {
            const len = promises.length;
            const values: any[] = new Array(len);
            let count = 0;
            promises.forEach((prom, i) => {
                prom.then(value => {
                    values[i] = value;
                    count++;
                    if (count === len) {
                        resolve(values);
                    }
                }, reject);
            });
        });
    }

    public static race (...promises: MyPromise[]) {
        return new MyPromise((resolve, reject) => {
            promises.forEach(prom => {
                prom.then(resolve, reject);
            });
        });
    }

}

export default MyPromise;
