import { getErrorMessage } from './get-error-message.function';

describe('getErrorMessage', (): void => {
  it('returns the message when the error is an Error instance', (): void => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns the string itself when the error is a string', (): void => {
    expect(getErrorMessage('boom')).toBe('boom');
  });

  it('serializes objects and arrays', (): void => {
    expect(getErrorMessage({ detail: 'boom' })).toBe('{"detail":"boom"}');
    expect(getErrorMessage(['boom'])).toBe('["boom"]');
  });

  it('returns Unknown error for unsupported values', (): void => {
    expect(getErrorMessage(123)).toBe('Unknown error');
    expect(getErrorMessage(undefined)).toBe('Unknown error');
  });
});
