export declare class RaceParams {
    readonly date: string;
    readonly reunion: string;
    readonly course: string;
    constructor(date: string, reunion: string, course: string);
    private validate;
    toGuid(): string;
    static fromQuery(query: any): RaceParams;
}
//# sourceMappingURL=RaceParams.d.ts.map