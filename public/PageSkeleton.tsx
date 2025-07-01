import { h } from 'preact';

export function PageSkeleton({ children }: { children: preact.ComponentChildren }) {
  return (
    <div>
      <nav style={{ background: '#222', color: '#fff', padding: '0.5em 1em' }}>
        <span>Remote Droid</span>
      </nav>
      <main>{children}</main>
    </div>
  );
}
