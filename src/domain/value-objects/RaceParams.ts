// Domain Value Object: Race Parameters
export class RaceParams {
  constructor(
    public readonly date: string,
    public readonly reunion: string,
    public readonly course: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
      throw new Error(`Invalid date format: ${this.date}. Expected YYYY-MM-DD`);
    }

    if (!/^R\d+$/.test(this.reunion)) {
      throw new Error(`Invalid reunion format: ${this.reunion}. Expected R1, R2, etc.`);
    }

    if (!/^C\d+$/.test(this.course)) {
      throw new Error(`Invalid course format: ${this.course}. Expected C1, C2, etc.`);
    }
  }

  toGuid(): string {
    // Format: 20251209_R1_C1 (date_reunion_course)
    return `${this.date.replace(/-/g, '')}_${this.reunion}_${this.course}`;
  }

  static fromQuery(query: any): RaceParams {
    const { date, reunion, course } = query;
    
    if (!date || !reunion || !course) {
      throw new Error('Missing required parameters: date, reunion, course');
    }

    return new RaceParams(
      String(date),
      String(reunion),
      String(course)
    );
  }
}
