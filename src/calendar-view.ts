import { partState } from "@ui-sdk/core/renderer";

type DayCell = { date: string; hidden?: boolean };
type GridState = { weekdays?: unknown[]; weeks?: DayCell[][] };
type LabelState = { label?: string };

type CalendarInstance = {
  part: (slot: string, props?: Record<string, unknown>) => unknown;
  subscribe: (listener: () => void) => () => void;
};

export function paintCalendar(
  root: HTMLElement,
  instance: CalendarInstance,
  tags: { day: string; weekday: string; week: string },
) {
  let signature = "";
  const draw = () => {
    const heading = root.querySelector("[data-ra-heading]");
    const headingState = partState(instance.part("heading", {}) as never) as LabelState;
    if (heading && headingState.label) heading.textContent = headingState.label;
    const grid = partState(instance.part("grid", { offset: 0, id: "0" }) as never) as GridState;
    const next = JSON.stringify(grid.weeks ?? []);
    if (next === signature) return;
    signature = next;
    const weekdays = root.querySelector("[data-ra-weekdays]");
    if (weekdays && grid.weekdays) {
      weekdays.replaceChildren(
        ...grid.weekdays.map((_, index) => {
          const el = document.createElement(tags.weekday);
          el.setAttribute("index", String(index));
          const label = partState(
            instance.part("weekday", { index, id: `0-${index}` }) as never,
          ) as LabelState;
          el.textContent = label.label ?? "";
          return el;
        }),
      );
    }
    const weeks = root.querySelector("[data-ra-weeks]");
    if (!weeks || !grid.weeks) return;
    weeks.replaceChildren(
      ...grid.weeks.map(week => {
        const row = document.createElement(tags.week);
        for (const cell of week) {
          if (cell.hidden) {
            const gap = document.createElement("span");
            gap.setAttribute("aria-hidden", "true");
            row.append(gap);
            continue;
          }
          const day = document.createElement(tags.day);
          day.setAttribute("value", cell.date);
          const label = partState(
            instance.part("day", { value: cell.date, offset: 0 }) as never,
          ) as LabelState;
          day.textContent = label.label ?? cell.date.slice(-2);
          row.append(day);
        }
        return row;
      }),
    );
  };
  draw();
  return instance.subscribe(draw);
}
