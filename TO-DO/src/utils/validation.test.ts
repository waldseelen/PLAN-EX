import { describe, it, expect } from 'vitest';
import { validateEmail, validateDate, validateTaskText, validateCourseCode, sanitizeInput } from './validation';

describe('Validation Utilities', () => {
    describe('validateEmail', () => {
        it('should validate correct email addresses', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            expect(validateEmail('test@')).toBe(false);
            expect(validateEmail('test@example')).toBe(false);
            expect(validateEmail('test')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
        });
    });

    describe('validateDate', () => {
        it('should validate correct date strings', () => {
            expect(validateDate('2023-10-27')).toBe(true);
            expect(validateDate('2024-01-01T12:00:00')).toBe(true);
        });

        it('should reject invalid date strings', () => {
            expect(validateDate('invalid-date')).toBe(false);
            expect(validateDate('2023-13-45')).toBe(false); // Valid string format but invalid date object in some browsers, though Date("...") behavior varies.
            // Actually new Date("2023-13-45") might result in "Invalid Date".
            // Let's rely on standard invalid string.
            expect(validateDate('')).toBe(false);
        });
    });

    describe('validateTaskText', () => {
        it('should return true for valid task text', () => {
            expect(validateTaskText('Finish the assignment')).toBe(true);
        });

        it('should return false for empty or whitespace-only text', () => {
            expect(validateTaskText('')).toBe(false);
            expect(validateTaskText('   ')).toBe(false);
        });

        it('should return false for text exceeding 500 characters', () => {
            const longText = 'a'.repeat(501);
            expect(validateTaskText(longText)).toBe(false);
        });
    });

    describe('validateCourseCode', () => {
        it('should return true for valid course code', () => {
            expect(validateCourseCode('CS101')).toBe(true);
            expect(validateCourseCode('MATH 202')).toBe(true);
        });

        it('should return false for empty code', () => {
            expect(validateCourseCode('')).toBe(false);
            expect(validateCourseCode('   ')).toBe(false);
        });

        it('should return false for code exceeding 10 characters', () => {
            expect(validateCourseCode('VERYLONGCODE')).toBe(false);
        });
    });

    describe('sanitizeInput', () => {
        it('should remove HTML tags', () => {
            expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('Hello');
            expect(sanitizeInput('<b>Bold</b>')).toBe('Bold');
        });

        it('should trim whitespace', () => {
            expect(sanitizeInput('  test  ')).toBe('test');
        });

        it('should handle strings without HTML correctly', () => {
            expect(sanitizeInput('Hello World')).toBe('Hello World');
        });
    });
});
