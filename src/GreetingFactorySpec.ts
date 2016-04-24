
import {GreetingFactory} from './GreetingFactory';

describe('GreetingFactory', function() {
    describe('make', function() {
        let name;
        beforeEach(function() {
            name = 'Joel';
        });
        
        it('should make a greeting', function() {
            let greeting = GreetingFactory.make(name);
            expect(greeting).toEqual('Hello, Joel');
        });
    });
});
