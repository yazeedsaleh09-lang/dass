export type ValidationResult = { ok: true; value: string } | { ok: false; message: string };

export function validateDisplayName(raw: string): ValidationResult {
  const value = raw.normalize('NFKC').trim().replace(/\s+/g, ' ');
  if (!value) return { ok: false, message: 'اكتب الاسم الظاهر.' };
  if ([...value].length > 24) return { ok: false, message: 'الاسم الظاهر بحد أقصى ٢٤ حرفًا.' };
  if (/[<>&\u0000-\u001f\u007f-\u009f\u202a-\u202e]/u.test(value)) return { ok: false, message: 'الاسم يحتوي رموزًا غير مدعومة.' };
  return { ok: true, value };
}

export function validateUsername(raw: string): ValidationResult {
  const value = raw.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(value)) return { ok: false, message: 'اسم المستخدم من ٣–٢٠: حروف إنجليزية وأرقام وشرطة سفلية.' };
  return { ok: true, value };
}

export function validateEmail(raw: string): ValidationResult {
  const value = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { ok: false, message: 'اكتب بريدًا إلكترونيًا صحيحًا.' };
  return { ok: true, value };
}

export function validatePassword(raw: string): ValidationResult {
  if (raw.length < 8 || !/[A-Za-z]/.test(raw) || !/\d/.test(raw)) return { ok: false, message: 'كلمة المرور ٨ خانات على الأقل وتحتوي حرفًا ورقمًا.' };
  return { ok: true, value: raw };
}
