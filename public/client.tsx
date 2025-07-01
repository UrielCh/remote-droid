import { h, hydrate } from 'preact';
import { App } from './App.js';

hydrate(<App />, document.body.querySelector('main > div') ?? document.body);
