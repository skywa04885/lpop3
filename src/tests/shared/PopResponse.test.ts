import assert from 'assert';
import { describe, it } from 'mocha';
import { LINE_SEPARATOR } from '../../shared/Constants';
import { PopResponse, PopResponseType } from '../../shared/PopResponse';

describe('PopResponse', function () {
    describe('#encode()', function () {
        it('Constructs a basic response (without newline).', function () {
            const raw_type: PopResponseType = PopResponseType.Failure;
            const raw_message: string = 'Hello World!';
            const response: PopResponse = new PopResponse(raw_type, raw_message);
            assert.equal(response.encode(false), `${raw_type} ${raw_message}`);
        });

        it('Constructs a basic response (with newline).', function () {
            const raw_message: string = 'Hello World!';
            const raw_type: PopResponseType = PopResponseType.Success;
            const response: PopResponse = new PopResponse(raw_type, raw_message);
            assert.equal(response.encode(true), `${raw_type} ${raw_message}${LINE_SEPARATOR}`);
        });

        it('Trims bloat when constructing a response.', function () {
            const raw_type: PopResponseType = PopResponseType.Failure;
            const raw_message: string = '     Hello World!   ';
            const response: PopResponse = new PopResponse(raw_type, raw_message);
            assert.equal(response.encode(false), `${raw_type} ${raw_message.trim()}`);
        });
    });

    describe('#decode()', function () {
        it('Parses an basic failure.', function () {
            const raw_type: PopResponseType = PopResponseType.Failure;
            const raw_message: string = 'This is a simple error';
            const raw_response: string = `${raw_type} ${raw_message}`;

            const response: PopResponse = PopResponse.decode(raw_response);

            assert.equal(response.type, raw_type);
            assert.equal(response.message, raw_message);
        });

        it('Parses an basic success.', function () {
            const raw_type: PopResponseType = PopResponseType.Success;
            const raw_message: string = 'This is a simple success';
            const raw_response: string = `${raw_type} ${raw_message}`;

            const response: PopResponse = PopResponse.decode(raw_response);

            assert.equal(response.type, raw_type);
            assert.equal(response.message, raw_message);
        });

        it('Parses an bloated response.', function () {
            const raw_type: PopResponseType = PopResponseType.Success;
            const raw_message: string = 'This is a simple success';
            const raw_response: string = `  ${raw_type}   ${raw_message}  `;

            const response: PopResponse = PopResponse.decode(raw_response);

            assert.equal(response.type, raw_type);
            assert.equal(response.message, raw_message);
        });

        it('Errors at a response missing separator', function () {
            const raw_type: PopResponseType = PopResponseType.Success;
            const raw_response: string = `${raw_type}`;

            assert.throws(function () {
                PopResponse.decode(raw_response);
            }, Error, 'Raw string does not contain any separator.');
        });

        it('Errors at invalid type', function () {
            const raw_type: string = '+KAAS';
            const raw_message: string = 'This is a simple success';
            const raw_response: string = `${raw_type} ${raw_message}`;

            assert.throws(function () {
                PopResponse.decode(raw_response);
            }, Error, 'Invalid response type.');
        });
    });
});
