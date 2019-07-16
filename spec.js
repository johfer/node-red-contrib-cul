const chai = require('chai')
const spies = require('chai-spies');

chai.use(spies);

const expect = chai.expect;

var helper = require("node-red-node-test-helper");

class Cul {
	write() {}
	on() {}
}
var mock = require('mock-require');
mock('cul', Cul);

var culnodes = require("./cul.js");

helper.init(require.resolve('node-red'));

describe('CUL Out Node', function () {

	const defaultFlow = [{
		id: "n1",
		type: "helper",
		wires: [["n2"]]
	},
	{
		id: "n2",
		type: "cul-out",
		name: "test name",
		controller: "n3"
	},
	{
		id: "n3",
		type: "cul-controller"
	}];

	let n1, n2;

	beforeEach(function (done) {
				
		helper.startServer(function () {
			helper.load(culnodes, defaultFlow, function () {
				n1 = helper.getNode("n1");
				n2 = helper.getNode("n2");
				done();
			});
		});
	});

	afterEach(function (done) {
		helper.unload();
		helper.stopServer(done);
	});

	it('should be loaded', function () {
		expect(n2.name).to.equal('test name');
	});

	it('should send string', function (done) {
		var spy = chai.spy.on(n2.controller.culConn, 'write');
		
		n2.on("input", function (msg) {
			expect(spy).to.have.been.called.with('testsignal');
			done();
		});

		n1.send({
			payload: 'testsignal'
		});
	});
	
	it('should send stringified object', function (done) {
		var spy = chai.spy.on(n2.controller.culConn, 'write');
		
		n2.on("input", function (msg) {
			expect(spy).to.have.been.called.with('{"a":42,"b":"someString"}');
			done();
		});

		n1.send({
			payload: {
				a: 42,
				b: 'someString'
			}
		});
	});

});
