import i18n from '@generated/i18n';
import type {ClientModule} from '@docusaurus/types';

const PREFERRED_LOCALE_KEY = 'openruyi-preferred-locale';
const chineseLocale = i18n.locales.find((locale) =>
  i18n.localeConfigs[locale].htmlLang.toLowerCase().startsWith('zh'),
);
const defaultHomepagePath =
  i18n.localeConfigs[i18n.defaultLocale].baseUrl;

let languageSwitcherListenerInstalled = false;

function getPreferredLocale(): string | null {
  try {
    const locale = window.localStorage.getItem(PREFERRED_LOCALE_KEY);
    return locale !== null && i18n.locales.includes(locale) ? locale : null;
  } catch {
    return null;
  }
}

function savePreferredLocale(locale: string): void {
  try {
    window.localStorage.setItem(PREFERRED_LOCALE_KEY, locale);
  } catch {
    // Ignore storage failures, such as private browsing restrictions.
  }
}

function browserPrefersChinese(): boolean {
  const browserLanguage = navigator.languages?.[0] ?? navigator.language;
  return browserLanguage.toLowerCase().startsWith('zh');
}

function getLocaleByHtmlLang(htmlLang: string | null): string | null {
  return (
    i18n.locales.find(
      (locale) => i18n.localeConfigs[locale].htmlLang === htmlLang,
    ) ?? null
  );
}

function installLanguageSwitcherListener(): void {
  if (languageSwitcherListenerInstalled) {
    return;
  }

  document.addEventListener(
    'click',
    (event) => {
      const selectedHtmlLang =
        event.target instanceof Element
          ? event.target.closest('a[lang]')?.getAttribute('lang') ?? null
          : null;
      const selectedLocale = getLocaleByHtmlLang(selectedHtmlLang);

      if (selectedLocale !== null) {
        savePreferredLocale(selectedLocale);
      }
    },
    {capture: true},
  );

  languageSwitcherListenerInstalled = true;
}

export const onRouteDidUpdate: NonNullable<
  ClientModule['onRouteDidUpdate']
> = ({location}) => {
  installLanguageSwitcherListener();

  if (
    i18n.currentLocale !== i18n.defaultLocale ||
    location.pathname !== defaultHomepagePath
  ) {
    return;
  }

  const preferredLocale = getPreferredLocale();
  const targetLocale =
    preferredLocale ?? (browserPrefersChinese() ? chineseLocale : null);

  if (targetLocale == null || targetLocale === i18n.defaultLocale) {
    return;
  }

  const targetLocaleConfig = i18n.localeConfigs[targetLocale];
  const targetHomepage = new URL(
    targetLocaleConfig.baseUrl,
    window.location.href,
  );
  targetHomepage.search = window.location.search;
  targetHomepage.hash = window.location.hash;
  window.location.replace(targetHomepage.href);
};
