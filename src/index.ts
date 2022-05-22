import WebUSBController from './WebUSBController';
import { JokeI } from './types';

const JOKE_ENDPOINT = 'https://v2.jokeapi.dev/joke/Programming';

(function () {
  document.addEventListener('DOMContentLoaded', (event) => {
    const Controller = new WebUSBController();
    const textDecoder = new TextDecoder('utf-8');
    const $connectArea =
      document.querySelector<HTMLDivElement>('#connect-area');
    const $connectButton =
      document.querySelector<HTMLButtonElement>('#connect');
    const $connectButtonSkip =
      document.querySelector<HTMLButtonElement>('#connect-skip');
    const $joke = document.querySelector<HTMLDivElement>('#joke');
    const $muteButton =
      document.querySelector<HTMLButtonElement>('#mute-button');
    let read = false;

    /**
     * Methods
     */

    const loadNewJoke = async () => {
      showJoke();
      const req = await fetch(JOKE_ENDPOINT);
      const json: JokeI = await req.json();
      showJoke(
        [json.joke || '', json.setup || '', json.delivery].filter(Boolean)
      );
    };

    const showJoke = (joke: Array<string> = []): void => {
      $joke.innerHTML = `<p>${joke
        .join('</p><p>')
        .replace(/(?:\r\n|\r|\n)/g, '<br>')}</p>`;
      joke.length !== 0 && doRead();
    };

    const doRead = () => {
      if (read) {
        const utter = new SpeechSynthesisUtterance();
        utter.lang = 'en-US';
        utter.text = $joke.innerText;
        speechSynthesis.speak(utter);
      }
    };

    /**
     * Setup
     */

    $connectButton.addEventListener('click', async () => {
      await Controller.connect({ filters: [{ vendorId: 0x2e8a }] });
    });

    $connectButtonSkip.addEventListener('click', async () => {
      $connectArea.style.display = 'none';
      await loadNewJoke();
    });

    Controller.onReceive(async (data) => {
      if (data.byteLength === 1 && data.getInt8(0) === 1) {
        await loadNewJoke();
      }
    });

    Controller.onDeviceConnect(async (device) => {
      if (device) {
        $connectArea.style.display = 'none';
        await loadNewJoke();
      } else {
        $connectArea.style.display = 'flex';
      }
    });

    $muteButton.addEventListener('click', () => {
      read = !read;
      doRead();
      $muteButton.querySelectorAll('svg').forEach(($svg) => {
        $svg.style.display =
          window.getComputedStyle($svg, null).display === 'none'
            ? 'block'
            : 'none';
      });
    });

    window.addEventListener(
      'keypress',
      (ev) =>
        ev.which === 32 &&
        window.getComputedStyle($connectArea, null).display === 'none' &&
        loadNewJoke()
    );
  });
})();
