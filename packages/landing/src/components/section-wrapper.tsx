import clsx from 'clsx';

export function SectionWrapper({
  id,
  className,
  children,
  alternate = false,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
  alternate?: boolean;
}) {
  return (
    <section
      id={id}
      className={clsx(
        'py-20 md:py-28 scroll-mt-20',
        alternate ? 'bg-surface-2' : 'bg-surface-1',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
