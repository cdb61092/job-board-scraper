export interface Job {
    title: string;
    description: string;
    salary?: string;
    company: string;
    keywords: string[];
    location: string;
}

export interface Filters {
    searchTerm: string;
    where: string;
    remote: {
        enabled: boolean;
        selector: string;
    }
}