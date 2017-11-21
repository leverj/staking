const chai = require('chai')
const React = require('react')
// import Enzyme from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';
// import { shallow } from 'enzyme'
const App = require('./../../src/client/js/index.js')

chai.should()
// Enzyme.configure({ adapter: new Adapter() });

describe('Component: App', () => {
	it('renders without exploding', () => {
		const app = new App()
		console.log('app', app)
	})
	it('initializes the Smart Contract stake, lev and fee in the client')
	it('gets the initial start, end block, bar percentage, stake, lev and fee addresses, initial data')
	it('converts the amounts to lev with the method `toLev()`')
	it('gets the user specific information once you set your address and click on get info')
	it('approves the selected amount')
	it('should not approve more than the user\'s balance')
	it('should approve less than the user\'s balance')
	it('should stake tokens once you have approved some tokens')
})
