import React from 'react';

// Page banner in the 2026 brand style: navy grid paper, a torn white paper
// title card and a red dotted strip — same identity as the home hero.
const PageHeader = ({ title, subtitle, icon: Icon, children }) => (
    <header className="relative overflow-hidden bg-brand-grid text-white pt-12 pb-20 md:pt-16 md:pb-24">
        <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-12 bg-brand-dots [clip-path:polygon(0_35%,9%_15%,19%_32%,30%_10%,41%_28%,52%_8%,63%_26%,74%_12%,85%_30%,94%_14%,100%_24%,100%_100%,0_100%)]"
        />
        <div className="container mx-auto px-4 relative text-center">
            <div className="paper-torn inline-block px-8 py-7 md:px-14 md:py-9 -rotate-1 max-w-3xl w-full sm:w-auto">
                {Icon && <Icon className="text-3xl text-[var(--brand-red)] mx-auto mb-2" aria-hidden="true" />}
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-[var(--brand-navy)] leading-tight">{title}</h1>
                {subtitle && <p className="mt-3 text-gray-700 md:text-lg font-medium">{subtitle}</p>}
            </div>
            {children}
        </div>
    </header>
);

export default PageHeader;
