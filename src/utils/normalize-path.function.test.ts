import { normalizePath } from './normalize-path.function';

describe('normalizePath', (): void => {
  it('keeps normalized paths untouched', (): void => {
    expect(normalizePath('/documents/report.txt')).toBe(
      '/documents/report.txt',
    );
  });

  it('prefixes paths that do not start with a slash', (): void => {
    expect(normalizePath('documents/report.txt')).toBe('/documents/report.txt');
  });
});
