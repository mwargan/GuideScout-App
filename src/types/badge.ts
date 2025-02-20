// A badge can be either a number, string, or true.
export type Badge = string | true;

export type BadgeObject = {
  value: Badge;
  className?:
    | "secondary"
    | "contrast"
    | "notification"
    | "outline"
    | "success"
    | "outline secondary"
    | "outline contrast"
    | "outline notification"
    | "outline success"
    | "success rectangular";
};
