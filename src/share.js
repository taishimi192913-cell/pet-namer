import { secondaryReadingIfAny } from './reading-display.js';

export function getXShareURL(name, reading) {
  const sub = secondaryReadingIfAny(name, reading);
  const text =
    sub == null
      ? `うちの子の名前候補は「${name}」！ #ペットなまえ診断`
      : `うちの子の名前候補は「${name}（${sub}）」！ #ペットなまえ診断`;
  const params = new URLSearchParams({
    text,
    url: window.location.href,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function getLINEShareURL(name, reading) {
  const sub = secondaryReadingIfAny(name, reading);
  const text =
    sub == null
      ? `うちの子の名前候補は「${name}」！ #ペットなまえ診断`
      : `うちの子の名前候補は「${name}（${sub}）」！ #ペットなまえ診断`;
  const params = new URLSearchParams({
    url: window.location.href,
    text,
  });
  return `https://social-plugins.line.me/lineit/share?${params.toString()}`;
}

export async function copyNameToClipboard(name) {
  await navigator.clipboard.writeText(name);
}
