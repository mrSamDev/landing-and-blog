/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    theme: {
        extend: {
            typography: (theme) => ({
                sijo: {
                    css: {
                        '--tw-prose-body': 'var(--color-fontPrimary)',
                        '--tw-prose-headings': 'var(--color-fontPrimary)',
                        '--tw-prose-lead': '#a476ff',
                        '--tw-prose-links': '#a476ff',
                        '--tw-prose-bold': '#a476ff',
                        '--tw-prose-counters': 'var(--color-fontPrimary)',
                        '--tw-prose-bullets': 'var(--color-fontPrimary)',
                        '--tw-prose-hr': '#a476ff',
                        '--tw-prose-quotes': '#a476ff',
                        '--tw-prose-quote-borders': '#a476ff',
                        '--tw-prose-captions': '#a476ff',
                        '--tw-prose-code': 'var(--color-fontPrimary)',
                        '--tw-prose-pre-code': '#a476ff',
                        '--tw-prose-pre-bg': '#a476ff',
                        '--tw-prose-th-borders': '#a476ff',
                        '--tw-prose-td-borders': '#a476ff',
                        '--tw-prose-invert-body': '#a476ff',
                        '--tw-prose-invert-headings': 'var(--color-white)',
                        '--tw-prose-invert-lead': '#a476ff',
                        '--tw-prose-invert-links': 'var(--color-white)',
                        '--tw-prose-invert-bold': 'var(--color-white)',
                        '--tw-prose-invert-counters': '#a476ff',
                        '--tw-prose-invert-bullets': 'var(--color-pink-600)',
                        '--tw-prose-invert-hr': '#a476ff',
                        '--tw-prose-invert-quotes': '#a476ff',
                        '--tw-prose-invert-quote-borders': '#a476ff',
                        '--tw-prose-invert-captions': '#a476ff',
                        '--tw-prose-invert-code': 'var(--color-white)',
                        '--tw-prose-invert-pre-code': '#a476ff',
                        '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
                        '--tw-prose-invert-th-borders': 'var(--color-pink-600)',
                        '--tw-prose-invert-td-borders': '#a476ff'
                    }
                },
                DEFAULT: {
                    css: {
                        a: {
                            fontWeight: 'normal',
                            textDecoration: 'underline',
                            textDecorationStyle: 'dashed',
                            textDecorationThickness: '1px',
                            textUnderlineOffset: '2px',
                            '&:hover': {
                                textDecorationStyle: 'solid'
                            }
                        },
                        'h1,h2,h3,h4,h5,h6': {
                            fontWeight: 500
                        },
                        blockquote: {
                            border: 0,
                            fontSize: '1.3125em',
                            fontStyle: 'italic',
                            fontWeight: 'normal',
                            lineHeight: 1.4,
                            paddingLeft: 0,
                            '@media (min-width: theme("screens.sm"))': {
                                fontSize: '1.66667em',
                                lineHeight: 1.3
                            }
                        }
                    }
                },
                lg: {
                    css: {
                        blockquote: {
                            paddingLeft: 0
                        }
                    }
                }
            })
        }
    }
};
