import {
    suite,
    test
} from '@testdeck/mocha';
import * as _chai from 'chai';

import {
    RconPacketBuilder
} from '../src/RconPacket';
import RconPacketType from '../src/RconPacketType';
import RconError from '../src/RconError';
_chai.should();

@suite class RconPacketUnitTest {

    private SUT: RconPacketBuilder;


    before() {
        this.SUT = new RconPacketBuilder(RconPacketType.SERVERDATA_EXECCOMMAND, 0, "echo HLSW: Test");
    }

    @test 'Returns a response from buffer command'() {
        _chai.expect(this.SUT.toBuffer()).to.not.be.undefined.and.to.not.throw;
    }

    @test 'Returned buffer is correct RCON command'() {

        _chai.expect(this.SUT.toBuffer().toString("hex")).to.be.equal("1900000000000000020000006563686f20484c53573a20546573740000");
    }

    @test 'Correct parsing of RCON command in buffer format'() {
        const builder: RconPacketBuilder = RconPacketBuilder.fromBuffer(Buffer.from("1900000000000000020000006563686f20484c53573a20546573740000", "hex"));
        _chai.expect(builder.getId()).to.be.equal(0);
        _chai.expect(builder.getType()).to.be.equal(RconPacketType.SERVERDATA_EXECCOMMAND)
        _chai.expect(builder.getBody()).to.be.equal("echo HLSW: Test");
    }

    @test "Changing values of RconPacketBuilder"() {
        this.SUT.setId(1).setBody("echo TEST");
        _chai.expect(this.SUT.getId()).to.be.equal(1);
        _chai.expect(this.SUT.getBody()).to.be.equal("echo TEST");
    }




}