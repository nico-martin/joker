import WebUSBController from '@nico-martin/webusb-controller';

import './css/reset.css';
import './css/styles.css';

import { JOKES } from './jokes';
const synth = window.speechSynthesis;

(function () {
  document.addEventListener('DOMContentLoaded', (event) => {
    const Controller = new WebUSBController();
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
      showJoke(JOKES[Math.floor(Math.random() * JOKES.length)]);
    };

    const showJoke = (joke: Array<string> = []): void => {
      $joke.innerHTML = `<p>${joke
        .join('</p><p>')
        .replace(/(?:\r\n|\r|\n)/g, '<br>')}</p>`;
      joke.length !== 0 && doRead();
    };

    const doRead = () => {
      if (read) {
        window.speechSynthesis.cancel();
        try {
          const voices = window.speechSynthesis
            .getVoices()
            .filter((voice) => voice.lang === 'en-US');
          const utter = new SpeechSynthesisUtterance();
          utter.lang = 'en-US';
          utter.text = $joke.innerText;
          utter.volume = 1;
          utter.voice = voices[Math.floor(Math.random() * voices.length)];
          utter.rate = 1;
          utter.pitch = 1;

          window.speechSynthesis.speak(utter);
        } catch (e) {
          console.log(e);
        }
      }
    };

    const toggleMute = () => {
      read = !read;
      !read && window.speechSynthesis.cancel();
      $muteButton.querySelectorAll('svg').forEach(($svg) => {
        $svg.style.display =
          window.getComputedStyle($svg, null).display === 'none'
            ? 'block'
            : 'none';
      });
    };

    //toggleMute();

    /**
     * Setup
     */

    $connectButton.addEventListener('click', async () => {
      await Controller.connect({ filters: [{ vendorId: 0x2e8a }] });
    });

    $connectButtonSkip.addEventListener('click', async () => {
      $connectArea.style.display = 'none';
      $joke.innerHTML = `<p class="description">Press the space bar to load joke</p>`;
      //await loadNewJoke();
    });

    Controller.onReceive(async (data) => {
      if (data.byteLength === 1 && data.getInt8(0) === 1) {
        await loadNewJoke();
      }
    });

    Controller.onDeviceConnect(async (device) => {
      if (device) {
        $connectArea.style.display = 'none';
        //await loadNewJoke();
        $joke.innerHTML = `<p class="description">Press buzzer to load joke</p>`;
      } else {
        $connectArea.style.display = 'flex';
      }
    });

    $muteButton.addEventListener('click', () => {
      toggleMute();
      doRead();
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
