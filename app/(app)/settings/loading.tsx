export default function SettingsLoading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none">
      <div className="h-44 w-full rounded-b-[28px] bg-pine-900 lg:rounded-none" />
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-6">
        <div className="h-64 rounded-2xl bg-white lg:col-start-1 lg:row-start-1" />
        <div className="h-64 rounded-2xl bg-gold-100 lg:col-start-2 lg:row-start-1" />
        <div className="h-80 rounded-2xl bg-white lg:col-start-1 lg:row-start-2" />
        <div className="h-52 rounded-2xl bg-white lg:col-start-2 lg:row-start-2" />
      </div>
    </div>
  );
}
