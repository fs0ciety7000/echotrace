import { describe, expect, it } from 'vitest';
import { ParseError, parseArgs, tokenize } from '../src/shell/tokenize.ts';

describe('tokenize', () => {
  it('splits words and pipes', () => {
    expect(tokenize('cat a.txt | grep -i x')).toEqual([
      ['cat', 'a.txt'],
      ['grep', '-i', 'x'],
    ]);
  });
  it('handles quotes and escapes', () => {
    expect(tokenize(`echo "a b" 'c|d' e\\ f`)).toEqual([['echo', 'a b', 'c|d', 'e f']]);
  });
  it('rejects dangling pipes and open quotes', () => {
    expect(() => tokenize('| ls')).toThrow(ParseError);
    expect(() => tokenize('ls |')).toThrow(ParseError);
    expect(() => tokenize('echo "oops')).toThrow(ParseError);
  });
});

describe('parseArgs', () => {
  it('parses grouped, valued and word flags', () => {
    expect(parseArgs(['-la', '/tmp'])).toEqual({ _: ['/tmp'], flags: { l: true, a: true } });
    expect(parseArgs(['-sV', '-p', '22,80', 'host'], ['p'], ['sV'])).toEqual({
      _: ['host'],
      flags: { sV: true, p: '22,80' },
    });
  });
});
