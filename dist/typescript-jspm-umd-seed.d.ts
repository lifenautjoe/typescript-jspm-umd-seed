declare module 'typescript-jspm-umd-seed/GreetingFactory' {
	export class GreetingFactory {
	    static make(name: string): string;
	}

}
declare module 'typescript-jspm-umd-seed' {
	export { GreetingFactory } from 'typescript-jspm-umd-seed/GreetingFactory';

}
