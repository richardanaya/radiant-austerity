import "../src/theme.css";
import { toast } from "../src/index.ts";
import "./demo.css";

for (const region of document.querySelectorAll("ra-toast-region")) {
  (region as HTMLElement & { toaster?: typeof toast }).toaster = toast;
}
