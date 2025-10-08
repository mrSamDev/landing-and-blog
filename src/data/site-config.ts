export type Image = {
    src: string;
    alt?: string;
    caption?: string;
};

export type Link = {
    text: string;
    href: string;
    target?: string;
};

export type Hero = {
    title?: string;
    text?: string;
    image?: Image;
    actions?: Link[];
};

export type Subscribe = {
    title?: string;
    text?: string;
    formUrl: string;
};

export type SiteConfig = {
    logo?: Image;
    title: string;
    subtitle?: string;
    description: string;
    image?: Image;
    headerNavLinks?: Link[];
    footerNavLinks?: Link[];
    socialLinks?: Link[];
    hero?: Hero;
    subscribe?: Subscribe;
    postsPerPage?: number;
    projectsPerPage?: number;
};

const siteConfig: SiteConfig = {
    title: 'Sijo Sam',
    subtitle: 'Software engineer',
    description: 'Technical leader specializing in React, AWS, and modern web development with expertise in video business product solutions',
    image: {
        src: 'https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/iotd6l0if1gixlitydpq',
        alt: 'Sijo Sam - Software engineer'
    },
    headerNavLinks: [
        {
            text: 'Home',
            href: '/'
        },
        {
            text: 'Projects',
            href: '/projects'
        },
        {
            text: 'Blog',
            href: '/blog'
        },
        {
            text: 'Guides',
            href: '/guides'
        },
        {
            text: 'AI Tips',
            href: '/ai-tips'
        }
    ],
    footerNavLinks: [
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Contact',
            href: '/contact'
        },
        {
            text: 'Code',
            href: 'https://github.com/mrSamDev/landing-and-blog',
            target: '_blank'
        },
        {
            text: 'Paddle game',
            href: 'https://mrsamdev-paddle-game.netlify.app/',
            target: '_blank'
        }
    ],
    socialLinks: [
        { text: 'LinkedIn', href: 'https://www.linkedin.com/in/sijo-sam/' },
        { text: 'GitHub', href: 'https://github.com/mrSamDev' },
        { text: 'Email', href: 'mailto:dev.sijo.sam@gmail.com' },
        { text: 'BlueSky', href: 'https://bsky.app/profile/sijosam.in' }
    ],
    hero: {
        title: 'Sijo Sam',
        text: 'നദിക്ക് വള്ളവും മനുഷ്യൻക്ക് സ്വപ്നവും ഒരുപോലെയാണ്.',
        image: {
            src: 'https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/iotd6l0if1gixlitydpq',
            alt: 'Sijo Sam - Technical Lead'
        },
        actions: [
            { text: 'About Me!', href: '/about' },
            { text: 'Cool Stuff!', href: '/projects' },
            { text: 'Say Hi!', href: '/contact' }
        ]
    },
    // subscribe: {
    //     title: 'Subscribe to Dante Newsletter',
    //     text: 'One update per week. All the latest posts directly in your inbox.',
    //     formUrl: '#'
    // },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
