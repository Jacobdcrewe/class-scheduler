import Class from "./Class";

interface ClassBlock {
    class: Class,
    day: string,
    height: number,
    top: number,
    overlaps: number,
    overlap_pos: number
}

export default ClassBlock;