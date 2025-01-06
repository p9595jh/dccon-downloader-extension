import JSZip from 'jszip';
import { MessageType } from '../types';

// <file signatures[:4], ext>
const signatures = new Map<string, string>([
  ['ffd8ffdb', 'jpg'],
  ['ffd8ffe0', 'jpg'],
  ['ffd8ffee', 'jpg'],
  ['ffd8ffe1', 'jpg'],
  ['89504e47', 'png'],
  ['47494638', 'gif'],
  ['52494646', 'webp'],
]);

const ext = (u8: Uint8Array): string => {
  const hex = [...u8.slice(0, 4)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
  return signatures.get(hex);
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === MessageType.DOWNLOAD) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting
        .executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            try {
              const name = document.querySelector(
                '#package_detail > div.pop_content.dccon_popinfo > div.info_viewbox.clear > div.info_viewtxt > div.viewtxt_top.clear > h4',
              ).textContent;
              const elements = document.querySelectorAll(
                '#package_detail > div.pop_content.dccon_popinfo > div.dccon_list_wrap.clear > div > ul > li',
              );

              const imgInfos = [...elements]
                .map((e) => <HTMLImageElement>e.querySelector('span > img'))
                .map(({ src, title }) => ({ src, title }));
              return { name, imgInfos };
            } catch (err) {
              alert('에러가 발생했습니다.');
              console.error(err);
              throw err;
            }
          },
        })
        .then(async (result) => {
          const { name, imgInfos } = result[0].result;

          const zip = new JSZip();
          for await (const [i, { src, title }] of imgInfos.entries()) {
            chrome.runtime.sendMessage({
              type: MessageType.PROGRESS,
              progress: i + 1,
              total: imgInfos.length,
              postprocess: false,
            });

            try {
              const buf = await fetch('http://127.0.0.1:4000', {
                method: 'POST',
                body: JSON.stringify({ src }),
              })
                .then((res) => res.text())
                .then((base64) =>
                  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)),
                );
              zip.file(`${title}.${ext(buf)}`, buf);
            } catch (err) {
              console.error('Fetch error:', err);
              throw err;
            }
          }

          chrome.runtime.sendMessage({
            type: MessageType.PROGRESS,
            progress: imgInfos.length,
            total: imgInfos.length,
            postprocess: true,
          });

          const file = await zip.generateAsync({ type: 'base64' });
          const url = 'data:application/zip;base64,' + file;
          chrome.downloads.download({ url, filename: `${name}.zip` });

          chrome.runtime.sendMessage({
            type: MessageType.PROGRESS,
            progress: 0,
            total: 0,
            postprocess: false,
          });
        });
    });
  }
});
