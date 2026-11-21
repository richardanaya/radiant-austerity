import { calendar } from "@ui-sdk/core/calendar";
import { dateInput } from "@ui-sdk/core/date-input";
import { datePicker } from "@ui-sdk/core/date-picker";
import { timeInput } from "@ui-sdk/core/time-input";
import { createParts, wrappedButton } from "@ui-sdk/web";
import { followAnchor } from "./anchor.js";
import { paintCalendar } from "./calendar-view.js";
import { popupApi, popupKinds, popupState } from "./popup-state.js";
import { paintSegments } from "./segments.js";

const calendarTags = {
  day: "ra-calendar-day",
  weekday: "ra-calendar-weekday",
  week: "ra-calendar-week",
};

createParts(datePicker, {
  root: {
    tag: "ra-date-picker",
    display: "block",
    defaults: { dismissible: true, closeOnSelect: true },
    kinds: popupKinds,
    options: () => ({ container: undefined }),
    state: popupState,
    api: [...popupApi, "setValue", "clear", "setMonth", "focus"],
    render(el: HTMLElement, instance) {
      const stopAnchor = followAnchor(el, "ra-date-picker-content", "ra-date-picker-trigger");
      const stopPaint = paintCalendar(el, instance as never, calendarTags);
      return () => {
        stopAnchor();
        stopPaint();
      };
    },
  },
  trigger: { tag: "ra-date-picker-trigger", display: "contents", target: wrappedButton },
  content: { tag: "ra-date-picker-content", kinds: popupKinds },
});

const owned = { owners: ["ra-date-picker"] };

createParts(calendar, {
  root: {
    tag: "ra-calendar",
    display: "block",
    api: ["getValue", "setValue", "setMonth", "previous", "next", "focus"],
    render: (el: HTMLElement, instance) => paintCalendar(el, instance as never, calendarTags),
  },
  heading: { tag: "ra-calendar-heading", display: "block", ...owned },
  previous: { tag: "ra-calendar-previous", display: "contents", target: wrappedButton, ...owned },
  next: { tag: "ra-calendar-next", display: "contents", target: wrappedButton, ...owned },
  grid: { tag: "ra-calendar-grid", display: "block", ...owned },
  weekdays: { tag: "ra-calendar-weekdays", display: "block", ...owned },
  weekday: { tag: "ra-calendar-weekday", display: "block", ...owned },
  week: { tag: "ra-calendar-week", display: "block", ...owned },
  day: { tag: "ra-calendar-day", display: "block", ...owned },
});

createParts(dateInput, {
  root: {
    tag: "ra-date-input",
    display: "block",
    api: ["getValue", "setValue", "clear", "focus"],
    render: (el: HTMLElement, instance) => paintSegments(el, instance as never, "ra-date-input-segment"),
  },
  segment: {
    tag: "ra-date-input-segment",
    display: "block",
    target: (el: HTMLElement) => el.querySelector("input") ?? el,
    context: (el: HTMLElement) => {
      const key = el.getAttribute("segment") ?? "";
      return { segment: { key }, id: key };
    },
    rebind: ["segment"],
  },
});

createParts(timeInput, {
  root: {
    tag: "ra-time-input",
    display: "block",
    api: ["getValue", "setValue", "clear", "focus"],
    render: (el: HTMLElement, instance) => paintSegments(el, instance as never, "ra-time-input-segment"),
  },
  segment: {
    tag: "ra-time-input-segment",
    display: "block",
    target: (el: HTMLElement) => el.querySelector("input") ?? el,
    context: (el: HTMLElement) => {
      const key = el.getAttribute("segment") ?? "";
      return { segment: { key }, id: key };
    },
    rebind: ["segment"],
  },
});
