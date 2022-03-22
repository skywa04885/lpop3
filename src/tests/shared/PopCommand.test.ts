import assert from 'assert';
import { LINE_SEPARATOR } from '../../shared/Constants';

import { PopCommand, PopCommandType } from "../../shared/PopCommand";

describe('PopCommand', function () {
    describe('#encode()', function () {
        it('Constructs a basic command (without newline).', function () {
            const raw_type: PopCommandType = PopCommandType.Dele;
            const raw_message: string = 'Hello World!';
            const response: PopCommand = new PopCommand(raw_type, raw_message);
            assert.equal(response.encode(false), `${raw_type} ${raw_message}`);
        });

        it('Constructs a basic command (with newline).', function () {
            const raw_message: string = 'Hello World!';
            const raw_type: PopCommandType = PopCommandType.Retr;
            const response: PopCommand = new PopCommand(raw_type, raw_message);
            assert.equal(response.encode(true), `${raw_type} ${raw_message}${LINE_SEPARATOR}`);
        });

        it('Trims bloat when constructing a command.', function () {
            const raw_type: PopCommandType = PopCommandType.Uidl;
            const raw_message: string = '     Hello World!   ';
            const response: PopCommand = new PopCommand(raw_type, raw_message);
            assert.equal(response.encode(false), `${raw_type} ${raw_message.trim()}`);
        });
    });

    describe('#decode()', function () {
        it('Parses an basic failure.', function () {
            const raw_type: PopCommandType = PopCommandType.Stat;
            const raw_args: string = 'simple crap';
            const raw_command: string = `${raw_type} ${raw_args}`;

            const command: PopCommand = PopCommand.decode(raw_command);

            assert.equal(command.type, raw_type);
            assert.equal(command.args, raw_args);
        });

        it('Parses an basic success.', function () {
            const raw_type: PopCommandType = PopCommandType.Retr;
            const raw_args: string = 'cheese';
            const raw_command: string = `${raw_type} ${raw_args}`;

            const command: PopCommand = PopCommand.decode(raw_command);

            assert.equal(command.type, raw_type);
            assert.equal(command.args, raw_args);
        });

        it('Parses an bloated response.', function () {
            const raw_type: PopCommandType = PopCommandType.Pass;
            const raw_args: string = 'do some other shit';
            const raw_command: string = `  ${raw_type}   ${raw_args}  `;

            const command: PopCommand = PopCommand.decode(raw_command);

            assert.equal(command.type, raw_type);
            assert.equal(command.args, raw_args);
        });

        it('Errors at a response missing separator', function () {
            const raw_type: PopCommandType = PopCommandType.Retr;
            const raw_command: string = `${raw_type}`;

            assert.throws(function () {
                PopCommand.decode(raw_command);
            }, Error, 'Raw string does not contain any separator.');
        });

        it('Errors at invalid type', function () {
            const raw_type: string = 'ASDG';
            const raw_args: string = 'do some shit';
            const raw_command: string = `${raw_type} ${raw_args}`;

            assert.throws(function () {
                PopCommand.decode(raw_command);
            }, Error, 'Invalid command type.');
        });
    });
});