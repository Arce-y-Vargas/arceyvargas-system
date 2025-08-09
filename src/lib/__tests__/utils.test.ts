import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should combine class names correctly', () => {
      const result = cn('bg-red-500', 'text-white', 'p-4');
      expect(result).toBe('bg-red-500 text-white p-4');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'ignored-class');
      expect(result).toBe('base-class conditional-class');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'other-class');
      expect(result).toBe('base-class other-class');
    });

    it('should merge conflicting Tailwind classes', () => {
      const result = cn('bg-red-500', 'bg-blue-500');
      expect(result).toBe('bg-blue-500');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle array input', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle object input with boolean values', () => {
      const result = cn({
        'active': true,
        'disabled': false,
        'loading': true,
      });
      expect(result).toBe('active loading');
    });
  });
});