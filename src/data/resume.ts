export type ResumeEntry = {
    role: string;
    company: string;
    period: string;
    location: string;
    achievements: string[];
    technologies: string;
};

export type ResumeProject = {
    title: string;
    label: string;
    href: string;
    hrefLabel: string;
    description?: string;
    achievements?: string[];
    technologies?: string;
};

export const profile = {
    name: 'Sijo Sam',
    title: 'Team Lead and Full-Stack Engineer',
    summary:
        'Team Lead and hands-on Software Engineer with 8+ years of experience building scalable web platforms and distributed systems. Strong expertise in TypeScript, Node.js and modern software architecture. Experienced in coaching developers, leading agile teams and driving code quality through mentoring, reviews and best engineering practices.',
    contact: {
        phone: '+91-9562299603',
        email: 'sijo@sijosam.com',
        website: 'https://www.sijosam.com/',
        linkedin: 'https://www.linkedin.com/in/sijo-sam/',
        portfolio: 'https://github.com/mrSamDev'
    }
} as const;

export const education = {
    degree: 'B.Tech in Computer Science',
    institution: 'University of Cochin, India',
    year: '2018'
} as const;

export const certifications = [
    'Certified Scrum Master (CSM), Scrum Alliance',
    'Certified Secure Web Application Engineer (CSWAE), Mile2'
] as const;

export const skillGroups = [
    [
        'Leadership',
        'Team Leadership, Coaching & Mentoring, Performance Development, Stakeholder Management, Technical Roadmaps, Cross-functional Collaboration'
    ],
    ['Core', 'TypeScript, Node.js, React, Next.js, REST APIs, GraphQL'],
    ['Architecture', 'System Design, SOLID, TDD'],
    ['Delivery', 'Code Reviews, Pair Programming, CI/CD, Scrum / Agile Delivery'],
    ['Infra', 'AWS, Docker'],
    ['Languages', 'English (Native), Malayalam (Native)']
] as const;

export const workExperience: ResumeEntry[] = [
    {
        role: 'Technical Lead',
        company: 'Gadgeon',
        period: '2025 – Present',
        location: 'Kochi, India',
        achievements: [
            'Lead architecture and technical design for enterprise software platforms',
            'Migrated a 100k+ line Angular application to React 19, defining standards and state management practices',
            'Introduced AI-assisted development tools, increasing team delivery throughput by 10%',
            'Built a shared analytics framework adopted across multiple product lines',
            'Mentor developers, conduct code reviews and drive engineering best practices'
        ],
        technologies: 'React, Vue, Zustand, MUI, Python, TanStack, Docker, Node.js, GCP, AWS, Terraform'
    },
    {
        role: 'Technical Lead',
        company: 'Diagnal Technologies',
        period: '2022 – 2025',
        location: 'London, UK',
        achievements: [
            'Led international engineering teams and coached developers through regular feedback and mentoring',
            'Modernised large-scale streaming platforms, improving load performance by 30%',
            'Designed and delivered scalable GraphQL and REST integrations',
            'Improved code quality processes, reducing defects by 35%',
            'Drove SSR migration and technical SEO improvements, increasing organic traffic by 50%'
        ],
        technologies: 'React, React Native, GraphQL, Node.js, Next.js, Tailwind CSS, Redux, AWS, Netlify, Astro'
    },
    {
        role: 'Software Developer / Scrum Master',
        company: 'HyperBlox',
        period: '2020 – 2022',
        location: 'Bangalore, India',
        achievements: [
            'Designed and developed a browser-based IDE for IoT and 5G platforms',
            'Built reusable frontend and backend components that accelerated product delivery',
            'Collaborated with the CTO on platform architecture and runtime design',
            'Reduced application development time by 30% through platform automation',
            'Served as Scrum Master, facilitating delivery planning and agile ceremonies'
        ],
        technologies: 'React, Node.js, MUI, Redux, Docker, Lua, Shell Script, Kubernetes, MongoDB'
    },
    {
        role: 'Software Developer',
        company: '7th Pillar Ventures',
        period: '2018 – 2020',
        location: 'Kochi, India',
        achievements: [
            'Developed full-stack SaaS applications using TypeScript, Node.js, React and Next.js',
            'Delivered solutions for healthcare, retail and travel clients',
            'Built business-critical frontend and backend features',
            'Improved client operational efficiency by 20% through process automation',
            'Collaborated directly with stakeholders to translate business requirements into software solutions'
        ],
        technologies: 'React, React Native, Node.js, Next.js, MUI, SCSS, Redux, AWS, GCP, Firebase, MongoDB'
    }
];

export const projects: ResumeProject[] = [
    {
        title: 'llm-moat',
        label: 'LLM Security Toolkit · Open Source',
        href: 'https://github.com/mrSamDev/llm-moat',
        hrefLabel: 'GitHub ↗',
        achievements: [
            'Built an open-source TypeScript security toolkit for production LLM applications, focused on prompt injection defense and trust-boundary enforcement',
            'TypeScript toolkit to detect and mitigate prompt injection in production LLM systems',
            'Hybrid detection pipeline combining rule-based filters and semantic classification (OpenAI, Anthropic, Ollama)',
            'Input sanitisation and trust boundary enforcement to prevent tool misuse and data exfiltration',
            'Streaming-aware detection for large, real-time inputs with extensible adapters and telemetry hooks'
        ],
        technologies: 'TypeScript, LLM Security, Prompt Injection Detection, OpenAI, Anthropic, Ollama'
    },
    {
        title: 'PromptRange',
        label: 'LLM Security Training Platform',
        href: 'https://prompt-range.mrsamdev.xyz/',
        hrefLabel: 'Live ↗',
        achievements: [
            'Interactive platform to simulate prompt injection attacks with real tool execution',
            'Attack scenarios covering privilege escalation, data exfiltration, and tool misuse',
            'RBAC-based tool access, input validation, and context isolation; exposed execution traces and prompt diffs'
        ],
        technologies: 'RBAC, Tool Execution Controls, Input Validation, Prompt Diffing, Trace Inspection'
    },
    {
        title: 'My Silent Thoughts',
        label: 'Technical Blog',
        href: 'https://sijosam.com/',
        hrefLabel: 'Live ↗',
        description:
            'Frontend architecture and performance articles focused on practical trade-offs, including Why Your Frontend Needs a Safety Net and Network-Aware Development.'
    }
];
