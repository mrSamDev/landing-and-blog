const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                accent: {
                    DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
                    muted: 'rgb(var(--color-accent-muted) / <alpha-value>)'
                },
                status: {
                    success: 'rgb(var(--color-success) / <alpha-value>)',
                    warning: 'rgb(var(--color-warning) / <alpha-value>)',
                    error: 'rgb(var(--color-error) / <alpha-value>)',
                    info: 'rgb(var(--color-info) / <alpha-value>)'
                }
            },
            textColor: {
                main: 'rgb(var(--color-text-main) / <alpha-value>)',
                accent: {
                    DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
                    muted: 'rgb(var(--color-accent-muted) / <alpha-value>)'
                },
                status: {
                    success: 'rgb(var(--color-success) / <alpha-value>)',
                    warning: 'rgb(var(--color-warning) / <alpha-value>)',
                    error: 'rgb(var(--color-error) / <alpha-value>)',
                    info: 'rgb(var(--color-info) / <alpha-value>)'
                }
            },
            backgroundColor: {
                main: 'rgb(var(--color-bg-main) / <alpha-value>)',
                muted: 'rgb(var(--color-bg-muted) / <alpha-value>)',
                accent: {
                    DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
                    muted: 'rgb(var(--color-accent-muted) / <alpha-value>)'
                },
                status: {
                    success: 'rgb(var(--color-success) / <alpha-value>)',
                    warning: 'rgb(var(--color-warning) / <alpha-value>)',
                    error: 'rgb(var(--color-error) / <alpha-value>)',
                    info: 'rgb(var(--color-info) / <alpha-value>)'
                }
            },
            borderColor: {
                main: 'rgb(var(--color-border-main) / <alpha-value>)',
                accent: {
                    DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
                    muted: 'rgb(var(--color-accent-muted) / <alpha-value>)'
                },
                status: {
                    success: 'rgb(var(--color-success) / <alpha-value>)',
                    warning: 'rgb(var(--color-warning) / <alpha-value>)',
                    error: 'rgb(var(--color-error) / <alpha-value>)',
                    info: 'rgb(var(--color-info) / <alpha-value>)'
                }
            },
            typography: (theme) => ({
                sijo: {
                    css: {
                        '--tw-prose-body': theme('textColor.main / 100%'),
                        '--tw-prose-headings': theme('textColor.main / 100%'),
                        '--tw-prose-lead': theme('textColor.main / 100%'),
                        '--tw-prose-links': theme('textColor.accent / 100%'),
                        '--tw-prose-bold': theme('textColor.main / 100%'),
                        '--tw-prose-counters': theme('textColor.main / 100%'),
                        '--tw-prose-bullets': theme('textColor.main / 100%'),
                        '--tw-prose-hr': theme('borderColor.main / 100%'),
                        '--tw-prose-quotes': theme('textColor.main / 100%'),
                        '--tw-prose-quote-borders': theme('borderColor.accent / 100%'),
                        '--tw-prose-captions': theme('textColor.main / 100%'),
                        '--tw-prose-code': theme('textColor.main / 100%'),
                        '--tw-prose-pre-code': theme('colors.zinc.100'),
                        '--tw-prose-pre-bg': theme('colors.zinc.800'),
                        '--tw-prose-th-borders': theme('borderColor.main / 100%'),
                        '--tw-prose-td-borders': theme('borderColor.main / 100%')
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
                            color: 'rgb(var(--color-accent) / 1)',
                            '&:hover': {
                                textDecorationStyle: 'solid',
                                color: 'rgb(var(--color-accent-muted) / 1)'
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
    },
    plugins: [require('@tailwindcss/typography')]
};
