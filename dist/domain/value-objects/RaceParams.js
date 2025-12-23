"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceParams = void 0;
// Domain Value Object: Race Parameters
class RaceParams {
    constructor(date, reunion, course) {
        this.date = date;
        this.reunion = reunion;
        this.course = course;
        this.validate();
    }
    validate() {
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
    toGuid() {
        // Format: 20251209_CHA_6 (date_reunion_course)
        return `${this.date.replace(/-/g, '')}_${this.reunion}_${this.course}`;
    }
    static fromQuery(query) {
        const { date, reunion, course } = query;
        if (!date || !reunion || !course) {
            throw new Error('Missing required parameters: date, reunion, course');
        }
        return new RaceParams(String(date), String(reunion), String(course));
    }
}
exports.RaceParams = RaceParams;
//# sourceMappingURL=RaceParams.js.map