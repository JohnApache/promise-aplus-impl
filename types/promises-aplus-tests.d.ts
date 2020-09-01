declare module 'promises-aplus-tests' {
    interface IPromisesAplusTests {
        mocha: (adapter: any)=> any;
    }

    const PromisesAplusTests: IPromisesAplusTests;
    export default PromisesAplusTests;
}
