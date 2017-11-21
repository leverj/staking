import chai from 'chai'
import React from 'react'
// import Enzyme from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';
// import { shallow } from 'enzyme'
import App from './../src/client/js/index.js'

chai.should()
// Enzyme.configure({ adapter: new Adapter() });

describe('Component: App', () => {
	it('renders without exploding', () => {
		const app = new App()
		console.log('app', app)
	})
	it('initializes the Smart Contract stake, lev and fee in the client', () => {

	})
})
