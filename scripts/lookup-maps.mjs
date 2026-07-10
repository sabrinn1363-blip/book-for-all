export const countryLabels = {
  Russia: "ادبیات روسی",
  France: "ادبیات فرانسوی",
  England: "ادبیات انگلیسی",
  "United States": "ادبیات آمریکایی",
  Spain: "ادبیات اسپانیایی",
  Colombia: "ادبیات آمریکای لاتین",
  "Czech Republic": "ادبیات چکی",
  Germany: "ادبیات آلمانی",
  Iran: "ادبیات ایرانی",
  Italy: "ادبیات ایتالیایی",
  Japan: "ادبیات ژاپنی"
};

export const genreLabels = {
  "Philosophical Novel": "رمان فلسفی",
  "Historical Novel": "رمان تاریخی",
  "Realist Novel": "رمان واقع‌گرا",
  Novella: "نوول",
  "Magical Realism": "واقع‌گرایی جادویی",
  Romance: "عاشقانه",
  Adventure: "ماجراجویی",
  Poetry: "شعر",
  Drama: "نمایشنامه"
};

export const schoolLabels = {
  "Russian Realism": "واقع‌گرایی روسی",
  "French Realism": "واقع‌گرایی فرانسوی",
  "French Romanticism": "رمانتیسیسم فرانسوی",
  Modernism: "مدرنیسم",
  "Latin American Boom": "موج آمریکای لاتین",
  "English Realism": "واقع‌گرایی انگلیسی",
  "American Romanticism": "رمانتیسیسم آمریکایی",
  Existentialism: "اگزیستانسیالیسم",
  "Spanish Golden Age": "عصر طلایی اسپانیا"
};

export const periodLabels = {
  "17th Century": "قرن هفدهم",
  "18th Century": "قرن هجدهم",
  "19th Century": "قرن نوزدهم",
  "20th Century": "قرن بیستم",
  "Early 20th Century": "اوایل قرن بیستم",
  "21st Century": "قرن بیست‌و‌یکم"
};

const COLUMN_ALIASES = {
  id: ["id", "شناسه", "کد"],
  title: ["title", "عنوان"],
  author: ["author", "نویسنده"],
  translator: ["translator", "مترجم"],
  publisher: ["publisher", "ناشر"],
  year: ["year", "سال", "سال انتشار"],
  country: ["country", "کشور"],
  genre: ["genre", "ژانر"],
  literarySchool: ["literaryschool", "literary school", "مکتب ادبی", "مکتب"],
  historicalPeriod: ["historicalperiod", "historical period", "دوره تاریخی", "دوره"],
  pages: ["pages", "تعداد صفحات", "صفحات"],
  summary: ["summary", "خلاصه"],
  review: ["review", "نقد", "نقد کوتاه"],
  tags: ["tags", "برچسب", "برچسب‌ها", "برچسب ها"],
  cover: ["cover", "جلد", "تصویر جلد"],
  addedAt: ["addedat", "added at", "تاریخ اضافه", "تاریخ"]
};

function buildReverse(map) {
  const reverse = {};
  for (const [english, persian] of Object.entries(map)) {
    reverse[normalizeKey(english)] = english;
    reverse[normalizeKey(persian)] = english;
  }
  return reverse;
}

function normalizeKey(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

export const countryReverse = buildReverse(countryLabels);
export const genreReverse = buildReverse(genreLabels);
export const schoolReverse = buildReverse(schoolLabels);
export const periodReverse = buildReverse(periodLabels);

export function resolveColumn(header) {
  const key = normalizeKey(header);
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some((alias) => normalizeKey(alias) === key)) {
      return field;
    }
  }
  return null;
}

export function resolveLookup(value, reverseMap, label) {
  if (!value) return "";
  const trimmed = String(value).trim();
  const resolved = reverseMap[normalizeKey(trimmed)];
  if (resolved) return resolved;
  return trimmed;
}
