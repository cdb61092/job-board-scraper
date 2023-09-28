export interface Job {
    title: string;
    description: string;
    salary?: string;
    company: string;
    keywords: string[];
    location: string;
}

export enum DatePosted {
    Last24Hours = 'Last 24 hours',
    Last3Days = 'Last 3 days',
    Last7Days = 'Last 7 days',
    Last14Days = 'Last 14 days',
}

export enum RemoteType {
    Remote = 'Remote',
    Hybrid = 'Hybrid',
}

export enum ExperienceLevel {
    None  = 'None',
    Entry = 'Entry',
    Mid   = 'Mid',
    Senior = 'Senior',
}

export enum DeveloperSkill {
    JavaScript = 'JavaScript',
    TypeScript = 'TypeScript',
    React = 'React',
    Angular = 'Angular',
    Vue = 'Vue',
    Node = 'Node',
    Python = 'Python',
    Java = 'Java',
    CSharp = 'C#',
    CPlusPlus = 'C++',
    C = 'C',
    Go = 'Go',
    Ruby = 'Ruby',
    PHP = 'PHP',
    Swift = 'Swift',
    Kotlin = 'Kotlin',
    Rust = 'Rust',
}

export interface Filters {
    searchTerm: string;
    where: string;
    remoteType: RemoteType | null;
    datePosted: DatePosted | null;
    experienceLevel: ExperienceLevel | null;
    developerSkill:  DeveloperSkill | null;
}