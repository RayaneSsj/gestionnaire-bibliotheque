import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return empty string for null value', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('should return empty string for undefined value', () => {
      expect(pipe.transform(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(pipe.transform('')).toBe('');
    });

    it('should return original string if shorter than limit', () => {
      const text = 'Short text';
      expect(pipe.transform(text, 100)).toBe(text);
    });

    it('should return original string if equal to limit', () => {
      const text = 'A'.repeat(100);
      expect(pipe.transform(text, 100)).toBe(text);
    });

    it('should truncate string longer than limit with default suffix', () => {
      const text = 'This is a very long text that should be truncated';
      const result = pipe.transform(text, 20);

      expect(result).toBe('This is a very long...');
      expect(result.length).toBe(22);
    });

    it('should truncate string with custom suffix', () => {
      const text = 'This is a very long text that should be truncated';
      const result = pipe.transform(text, 20, ' [more]');

      expect(result).toBe('This is a very long [more]');
    });

    it('should use default limit of 100 when not specified', () => {
      const text = 'A'.repeat(150);
      const result = pipe.transform(text);

      expect(result).toBe('A'.repeat(100) + '...');
      expect(result.length).toBe(103);
    });

    it('should trim whitespace before adding suffix', () => {
      const text = 'This is a text with spaces   ';
      const result = pipe.transform(text, 25);

      expect(result).toBe('This is a text with space...');
      expect(result.endsWith('space...')).toBeTrue();
    });

    it('should handle special characters', () => {
      const text = 'Texte avec des accents éàîö and symbols @#$%';
      const result = pipe.transform(text, 20);

      expect(result).toBe('Texte avec des accen...');
    });

    it('should handle very small limits', () => {
      const text = 'Hello world';
      const result = pipe.transform(text, 5);

      expect(result).toBe('Hello...');
    });

    it('should handle limit of 0', () => {
      const text = 'Hello world';
      const result = pipe.transform(text, 0);

      expect(result).toBe('...');
    });

    it('should work with custom suffix of different lengths', () => {
      const text = 'This is a test text';

      expect(pipe.transform(text, 10, '!')).toBe('This is a!');
      expect(pipe.transform(text, 10, ' (continued)')).toBe('This is a (continued)');
      expect(pipe.transform(text, 10, '')).toBe('This is a');
    });

    it('should handle newlines and tabs in text', () => {
      const text = 'Line 1\nLine 2\tTabbed content';
      const result = pipe.transform(text, 15);

      expect(result).toBe('Line 1\nLine 2\tT...');
    });
  });
});