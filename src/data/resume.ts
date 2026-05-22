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

export const skillGroups = [
    ['Languages', 'JavaScript, TypeScript, Go, Python, Lua'],
    ['Frontend', 'React, Vue, TypeScript, React Native; Next.js, Tailwind CSS, Webpack, Vite'],
    ['Backend', 'Node.js, REST APIs, GraphQL, Microservices'],
    ['Data / Infra', 'PostgreSQL, MongoDB, AWS, GCP, Docker, Terraform, Kubernetes, Grafana, Ollama'],
    ['Testing', 'Jest, Vitest, Cypress; React Testing Library; Storybook'],
    ['Practices', 'CSR, SSR, ISR, CI/CD, TDD, SOLID, Technical Leadership, Team Mentoring, Agile (CSM)'],
    ['Performance', 'LCP, INP, FCP Optimization, Lighthouse, Technical SEO']
] as const;

export const workExperience: ResumeEntry[] = [
    {
        role: 'Technical Lead',
        company: 'Gadgeon',
        period: '2025 – Present',
        location: 'SaaS Products Team · Kochi, Kerala',
        achievements: [
            'Led adoption of React 19 across the SaaS organization, managing a team of 8 engineers across multiple products',
            'Directed incremental migration of a 100k+ line Angular monolith to React 19 using a strangler-fig approach, delivering zero downtime across 3 product teams',
            'Established code review and knowledge-sharing practices that improved delivery quality and reduced onboarding friction for new team members',
            'Championed AI tooling adoption (Claude Code, Windsurf) with hands-on workshops, boosting developer productivity by 35%'
        ],
        technologies: 'React, Vue, Zustand, MUI, Python, TanStack, Docker, Node.js, GCP, AWS, Terraform'
    },
    {
        role: 'Technical Lead',
        company: 'Diagnal Technologies',
        period: '2022 – 2025',
        location: 'Digital Media & Streaming Products · Remote (London, UK)',
        achievements: [
            'Modernized legacy React codebases into functional-component architecture, improving load times by 30% and overall frontend performance by 25%',
            'Led distributed engineering teams across time zones and earned fast-track promotion to Front-End Technical Lead',
            'Mentored engineers through code reviews and 1:1 coaching, reducing defects and improving team productivity by 35%',
            'Boosted app search rankings by 50% via technical SEO, SSE platform migration, and content/meta tag optimisation'
        ],
        technologies: 'React, React Native, GraphQL, Node.js, Next.js, Tailwind CSS, Redux, AWS, Netlify, Astro'
    },
    {
        role: 'Software Developer',
        company: 'HyperBlox',
        period: '2020 – 2022',
        location: 'IDE Products Team · Bangalore, India',
        achievements: [
            'Architected a web-based IDE for the company&apos;s IoT and 5G platform, reducing application development time by 30%',
            'Partnered with the CTO on compiler workflows and IDE integration for core platform capabilities',
            'Served as Project Owner and Scrum Master, improving sprint execution and cross-functional delivery'
        ],
        technologies: 'React, Node.js, MUI, Redux, Docker, Lua, Shell Script, Kubernetes, MongoDB'
    },
    {
        role: 'Software Developer',
        company: '7th Pillar Ventures',
        period: '2018 – 2020',
        location: 'SaaS Products Team · Kochi, India',
        achievements: [
            'Built scalable SaaS solutions for healthcare, retail, and travel industries',
            'Designed business-critical applications that improved operational efficiency by 20% and reduced manual cost through automation',
            'Accelerated product delivery for startup clients across multiple domains through reusable frontend and backend systems'
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
