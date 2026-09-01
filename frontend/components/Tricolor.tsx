/**
 * The 4px three-band stripe that opens the header and closes the page.
 * `middle` is the page ground in the header and the divider grey in the footer.
 */
export function Tricolor({ middle = "paper" }: { middle?: "paper" | "divider" }) {
  return (
    <div className="tricolor" aria-hidden="true">
      <div className="bg-accent" />
      <div className={middle === "paper" ? "bg-paper" : "bg-divider"} />
      <div className="bg-stone" />
    </div>
  );
}
