export {}
export type SigmaSearchResultEntry = {
    id: string;
    url: string;
    file: string;
    author: string;
    description: string;
    title: string;
    score: number;
    modified: string;
    date: string;
    status: string;
    level: string;
    references: string[];
    tags: string[];
    falsepositives: string[];
    detection: string;
}