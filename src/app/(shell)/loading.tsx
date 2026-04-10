export default function ShellLoading() {
  return (
    <div className="relative h-full min-h-0 bg-surface-container-lowest">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden bg-surface-container">
        <div className="workspace-loading-bar h-full w-1/3" />
      </div>
    </div>
  );
}
