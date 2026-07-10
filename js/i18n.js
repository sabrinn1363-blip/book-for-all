export const SITE_NAME = "کتاب برای همه";

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
  "19th Century": "قرن نوزدهم",
  "20th Century": "قرن بیستم",
  "Early 20th Century": "اوایل قرن بیستم",
  "18th Century": "قرن هجدهم",
  "21st Century": "قرن بیست‌و‌یکم"
};

export function displayCountry(country) {
  return countryLabels[country] || country;
}

export function displayGenre(genre) {
  return genreLabels[genre] || genre;
}

export function displaySchool(school) {
  return schoolLabels[school] || school;
}

export function displayPeriod(period) {
  return periodLabels[period] || period;
}

export function displayBrowseType(type) {
  const labels = {
    genre: "ژانر",
    country: "کشور",
    author: "نویسنده",
    school: "مکتب ادبی"
  };
  return labels[type] || type;
}

export function bookCount(n) {
  return n === 1 ? "۱ کتاب" : `${toFaDigits(n)} کتاب`;
}

export function resultCount(n, query) {
  return n === 1
    ? `۱ نتیجه برای «${query}»`
    : `${toFaDigits(n)} نتیجه برای «${query}»`;
}

export function toFaDigits(n) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

export function persianSearchText(book) {
  return [
    book.title,
    book.author,
    book.genre,
    book.country,
    book.literarySchool,
    book.translator,
    book.publisher,
    book.historicalPeriod,
    displayCountry(book.country),
    displayGenre(book.genre),
    displaySchool(book.literarySchool),
    displayPeriod(book.historicalPeriod),
    ...(book.tags || [])
  ].join(" ");
}
