import { describe, expect, it } from 'vitest';
import { validateCitySearchInput, validateReminderTime } from '../utils/validation.js';
import { celsiusToFahrenheit, formatTemperature } from '../utils/temperatureUtils.js';

describe('validateCitySearchInput', () => {
  it('rejects empty or whitespace-only queries', () => {
    expect(validateCitySearchInput('').isValid).toBe(false);
    expect(validateCitySearchInput('   ').isValid).toBe(false);
  });

  it('rejects single-character queries', () => {
    const res = validateCitySearchInput('K');
    expect(res.isValid).toBe(false);
    expect(res.error).toMatch(/at least 2 characters/i);
  });

  it('rejects queries without letters', () => {
    const res = validateCitySearchInput('12345');
    expect(res.isValid).toBe(false);
    expect(res.error).toMatch(/letters/i);
  });

  it('accepts valid international city names and trims whitespace', () => {
    const res = validateCitySearchInput('  Karachi  ');
    expect(res.isValid).toBe(true);
    expect(res.normalizedQuery).toBe('Karachi');
    expect(res.error).toBeNull();
  });
});

describe('validateReminderTime', () => {
  it('accepts valid 24-hour HH:MM strings', () => {
    expect(validateReminderTime('07:30').isValid).toBe(true);
    expect(validateReminderTime('00:00').isValid).toBe(true);
    expect(validateReminderTime('23:59').isValid).toBe(true);
  });

  it('rejects invalid or empty time values', () => {
    expect(validateReminderTime('').isValid).toBe(false);
    expect(validateReminderTime('25:00').isValid).toBe(false);
    expect(validateReminderTime('08:99').isValid).toBe(false);
    expect(validateReminderTime('morning').isValid).toBe(false);
  });
});

describe('temperature conversion utilities', () => {
  it('converts Celsius to Fahrenheit accurately', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(25)).toBe(77);
  });

  it('formats Celsius and Fahrenheit cleanly with rounding', () => {
    expect(formatTemperature(25.4, 'C')).toBe('25°C');
    expect(formatTemperature(25, 'F')).toBe('77°F');
    expect(formatTemperature(null, 'C')).toBe('—');
  });
});
