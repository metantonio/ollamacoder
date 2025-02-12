import GithubIcon from "@/components/icons/github-icon";
import { HistoryDrawer } from "./historyDrawer";

export default function Header() {
  return (
    <header className="relative mx-auto flex w-full shrink-0 items-center justify-between py-1 px-3">
      <HistoryDrawer />
      <a
        href="https://github.com/annilq/ollamacoder"
        target="_blank"
        className="hidden items-center gap-3 rounded-2xl bg-white px-6 py-2 shadow sm:flex"
      >
        <GithubIcon className="h-4 w-4" />
        <span>GitHub Repo</span>
      </a>
    </header>
  );
}
