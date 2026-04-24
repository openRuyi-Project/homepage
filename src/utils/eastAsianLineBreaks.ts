import type { Paragraph, PhrasingContent, Root, Text } from 'mdast';
import type { VFile } from 'vfile';

import { eastAsianWidth } from "eastasianwidth"; /* We have ICU at home */
import { visit } from 'unist-util-visit';

/*
 * Segment break processing rules from Firefox 150.0:
 *
 * https://github.com/mozilla-firefox/firefox/blob/FIREFOX_150_0_RELEASE/intl/unicharutil/util/nsUnicharUtils.cpp#L517-L547
 */

const isEastAsianWidthFHW = (c: string): boolean => {
  const eaw = eastAsianWidth(c);
  return eaw === 'F' || eaw === 'H' || eaw === 'W';
};

const isHangul = (c: string): boolean => c.match(/^\p{Script=Hangul}$/u) !== null;
const isEmoji = (c: string): boolean => c.match(/^\p{Emoji}$/u) !== null;
const isPunctuation = (c: string): boolean => c.match(/^\p{Punctuation}$/u) !== null;

const wonSign = '\u20a9'; /* East Asian Width H, but often used in non-CJK context */
const fullwidthTilde = '\uff5e'; /* General Category Sm, but used as punctuation */
const ideographicSpace = '\u3000'; /* User-specified spacing should be preserved */

const isSkipBreakBoth = (c: string): boolean =>
  isEastAsianWidthFHW(c) && !isHangul(c) && !isEmoji(c) && c !== wonSign;

const isSkipBreakEither = (c: string): boolean =>
  isEastAsianWidthFHW(c) && (isPunctuation(c) || c === fullwidthTilde || c === ideographicSpace);

/**
 * Whether the line break should be skipped when occurring between `pre` and
 * `post`. Both `pre` and `post` must be a single character.
 *
 * @param pre The character before the line break
 * @param post The character after the line break
 */
function skipLineBreak(pre: string, post: string): boolean {
  if (pre !== [...pre][0])
    throw TypeError("Argument pre to skipLineBreak must be a single code point");

  if (post !== [...post][0])
    throw TypeError("Argument post to skipLineBreak must be a single code point");

  /*
   * Firefox only processes the "either" case if the lang attribute is Chinese
   * or Japanese for compatibility, but we don't add that restriction since we
   * are opting into this processing.
   */

  return isSkipBreakBoth(pre) && isSkipBreakBoth(post)
    || (isSkipBreakEither(pre) || isSkipBreakEither(post));
};

const lastChar = (s: string): string => [... s.slice(-2)].at(-1);
const firstChar = (s: string): string => String.fromCodePoint(s.codePointAt(0));

/**
 * A [remark plugin] to process line breaks into either nothing or a space based
 * on East Asian text rules, to allow for writing long paragraph in multiple
 * lines in source text without unwanted spaces in East Asian language text,
 * while having consistent behavior across browsers.
 *
 * Remark passes through newlines in Markdown as is.
 * Newline character processing in HTML is implementation-defined according to
 * [CSS Text Level 3] and is an [open issue].
 * In particular, some browsers replace a newline with nothing instead of a
 * space in some situations in East Asian text.
 * This plugin preprocesses Markdown text for a consistent result, based on
 * rules from Firefox 150.0 adapted to Markdown.
 *
 * [remark plugin]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md
 * [CSS Text Level 3]: https://www.w3.org/TR/css-text-3/#line-break-transform
 * [open issue]: https://github.com/w3c/csswg-drafts/issues/5086
 */
export default (options: object) => {
  return function (tree: Root, file: VFile) {
    visit(tree, 'paragraph', (paragraph: Paragraph) => {
      const textNodes: { value: string }[] = [];

      /* Recursively extract all text nodes in this paragraph */
      const collect = (node: PhrasingContent) => {
        if (node.type === 'text') {
          /* In case we get empty text nodes, skip to simplify handling */
          if (node.value !== '')
            textNodes.push(node);
        } else if (node.type === 'inlineCode') {
          /* Treat inline code like a non-CJK word by inserting a fake text node */
          textNodes.push({ value: ' ' });
        } else if ('children' in node) {
          for (const child of node.children)
            collect(child);
        } else {
          /* Assume unknown nodes have no content that affects line break handling */
        }
      };

      for (const child of paragraph.children)
        collect(child);

      for (let i = 0; i < textNodes.length; i++) {
        const self = textNodes[i];
        const prevChar = i === 0 ? '' : lastChar(textNodes[i - 1].value);
        const nextChar = i === textNodes.length - 1 ? '' : firstChar(textNodes[i + 1].value);

        /* Match newline, with one char before and one char after if they exist */
        self.value = self.value.replaceAll(/(?<=(^|.))\n(?=($|.))/gu, (match, pre, post) => {
          /* Handle newline at start of node */
          if (pre === '')
            pre = prevChar;

          /* Same for end of node */
          if (post === '')
            post = nextChar;

          /* Newline at start or end of paragraph is weird. Just return as is. */
          if (pre === '' || post === '')
            return match;

          if (skipLineBreak(pre, post))
            return '';

          return ' ';
        });
      }
    });
  };
};
