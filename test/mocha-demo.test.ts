import MyPromise from '../src/Promise';
import PromisesAplusTests from 'promises-aplus-tests';


MyPromise.defer = MyPromise.deferred = function() {
    const result: any = {};
    result.promise = new MyPromise((resolve: any, reject: any) => {
        result.resolve = resolve;
        result.reject = reject;
    });
    return result;
};

describe('Promises/A+ Tests', function() {
    PromisesAplusTests.mocha(MyPromise);
});
