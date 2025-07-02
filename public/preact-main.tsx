import { h } from 'preact';

import { PageSkeleton } from './PageSkeleton.js';
import { App } from './App.js';

// Render to string for static HTML
import { render } from 'preact-render-to-string';
import { writeFileSync } from 'fs';

const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Preact Static</title></head><body>${render(<PageSkeleton><App /></PageSkeleton>)}<script type="module" src="/client.js"></script></body></html>`;
writeFileSync('public/index.html', html);
