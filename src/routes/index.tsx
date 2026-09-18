import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  Mail,
  ListChecks,
  Search,
  History,
  Menu,
  Settings,
  HelpCircle,
  Copy,
  Download,
  Loader2,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { generateDraft } from "@/lib/assistant.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workplace AI — Email, Meeting Notes & Research Assistant" },
      {
        name: "description",
        content:
          "Draft polished workplace emails, turn meeting transcripts into action items, and structure research briefs with editable AI-assisted outputs.",
      },
      {
        property: "og:title",
        content: "Workplace AI — Email, Meeting Notes & Research Assistant",
      },
      {
        property: "og:description",
        content:
          "An AI productivity workspace for professional emails, meeting summaries and research briefs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

type ToolId = "email" | "notes" | "research";

const TOOLS = [
  {
    id: "email" as ToolId,
    num: "01",
    icon: Mail,
    title: "Smart Email Generator",
    blurb:
      "Generate polished professional emails with formal, friendly, or persuasive tones.",
    badges: ["Formal", "Friendly", "Persuasive"],
    prompt:
      "Write a professional workplace email for the stated audience and goal. Be clear, concise, and action-oriented. Do not invent facts.",
  },
  {
    id: "notes" as ToolId,
    num: "02",
    icon: ListChecks,
    title: "Meeting Notes Summarizer",
    blurb:
      "Summarize long notes and extract action items, decisions, owners, and deadlines.",
    badges: ["Decisions", "Actions", "Deadlines"],
    prompt:
      "Summarize only information present in the source. Separate decisions, action items, owners, deadlines, open questions, and notable discussion points.",
  },
  {
    id: "research" as ToolId,
    num: "03",
    icon: Search,
    title: "AI Research Assistant",
    blurb:
      "Summarize topics and articles, surface insights, and provide practical recommendations.",
    badges: ["Insights", "Recommendations"],
    prompt:
      "Frame the question, identify sub-questions, distinguish known facts from assumptions, and propose sources or validation steps. Avoid fabricated citations.",
  },
];

const EMPTY = {
  audience: "",
  tone: "Professional",
  goal: "",
  context: "",
  meetingTitle: "",
  transcript: "",
  topic: "",
  source: "",
  researchAudience: "",
  depth: "Executive brief",
};

function Workspace() {
  const [tool, setTool] = useState<ToolId>("email");
  const [menuOpen, setMenuOpen] = useState(false);
  const [fields, setFields] = useState({ ...EMPTY });
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState<{ tool: string; text: string }[]>([]);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"appearance" | "about" | "faqs">("appearance");
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);




  const run = useServerFn(generateDraft);
  const active = TOOLS.find((t) => t.id === tool)!;

  const set = (key: keyof typeof EMPTY) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const payload =
        tool === "email"
          ? {
              Recipient: fields.audience,
              Tone: fields.tone,
              Goal: fields.goal,
              Context: fields.context,
            }
          : tool === "notes"
            ? { "Meeting title": fields.meetingTitle, Transcript: fields.transcript }
            : {
                Topic: fields.topic,
                "Source content": fields.source,
                Audience: fields.researchAudience,
                Depth: fields.depth,
              };
      return run({ data: { tool, fields: payload } });
    },
    onSuccess: (result) => {
      setOutput(result.text);
      setHistory((prev) => [{ tool: active.title, text: result.text }, ...prev].slice(0, 8));
    },
    onError: (error: Error) => toast.error(error.message || "Generation failed."),
  });

  const canGenerate =
    tool === "email"
      ? fields.goal.trim().length > 0
      : tool === "notes"
        ? fields.transcript.trim().length > 0
        : fields.topic.trim().length > 0;

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const exportTxt = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool}-draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const q = query.trim().toLowerCase();
  const results = [
    ...TOOLS.filter(
      (t) =>
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.blurb.toLowerCase().includes(q) ||
        t.badges.some((b) => b.toLowerCase().includes(q)),
    ).map((t) => ({
      key: `tool-${t.id}`,
      icon: t.icon,
      title: t.title,
      subtitle: t.blurb,
      run: () => {
        setTool(t.id);
        setQuery("");
        setSearchOpen(false);
        setMenuOpen(false);
      },
    })),
    ...history
      .map((h, i) => ({ ...h, i }))
      .filter((h) => !q || h.tool.toLowerCase().includes(q) || h.text.toLowerCase().includes(q))
      .map((h) => ({
        key: `history-${h.i}`,
        icon: History,
        title: `${h.tool} · saved draft`,
        subtitle: h.text.slice(0, 90),
        run: () => {
          setOutput(h.text);
          setQuery("");
          setSearchOpen(false);
        },
      })),
  ].slice(0, 8);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (

    <div className="flex min-h-screen bg-background font-sans">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex w-[250px] flex-col bg-sidebar px-4 py-6 text-sidebar-foreground transition-transform",
          menuOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 px-2 pb-7 font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            AI
          </span>
          Workplace AI
        </div>
        <nav className="grid gap-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTool(t.id);
                setMenuOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                tool === t.id && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <t.icon className="size-4" />
              {t.title.replace("Smart ", "").replace("AI ", "")}
            </button>
          ))}
          <div className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-muted">
            <History className="size-4" />
            History · {history.length}
          </div>
        </nav>
        <div className="mt-auto border-t border-sidebar-border pt-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="grid size-9 place-items-center rounded-full bg-sidebar-accent text-xs font-bold uppercase">
              {(user?.email ?? "U").charAt(0)}
            </span>
            <div className="min-w-0 text-sm">
              <span className="block truncate">{user?.email ?? "User"}</span>
              <span className="block text-xs text-sidebar-muted">Workspace account</span>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth" });
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>

      </aside>

      <div className="w-full min-w-0 md:ml-[250px] md:w-[calc(100%-250px)]">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between gap-3 border-b border-border bg-card/90 px-5 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <Menu />
            </Button>
            
          </div>

          <div className="relative ml-auto w-full max-w-[340px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) results[0].run();
                if (e.key === "Escape") setSearchOpen(false);
              }}
              placeholder="Jump to a tool or saved draft…"
              aria-label="Search tools and saved drafts"
              className="pl-9"
            />
            {searchOpen && results.length > 0 && (
              <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-[320px] overflow-auto rounded-xl border border-border bg-popover p-1.5 shadow-[var(--shadow-lift)]">
                {results.map((r) => (
                  <li key={r.key}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={r.run}
                      className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <r.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{r.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {r.subtitle}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {searchOpen && query.trim() && results.length === 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-xl border border-border bg-popover px-3 py-2.5 text-sm text-muted-foreground shadow-[var(--shadow-lift)]">
                No matching tool or saved draft.
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Help"
              onClick={() => {
                setSettingsTab("faqs");
                setSettingsOpen(true);
              }}
            >
              <HelpCircle />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Settings"
              onClick={() => {
                setSettingsTab("appearance");
                setSettingsOpen(true);
              }}
            >
              <Settings />
            </Button>
          </div>
        </header>


        <main className="mx-auto max-w-[1300px] p-5 md:p-8">
          <section className="mb-7 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
                AI productivity workspace
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight">
                Get workplace tasks done faster.
              </h1>
              <p className="mt-2 max-w-[650px] text-sm text-muted-foreground">
                Create polished emails, turn meeting transcripts into concise notes, and
                structure research into useful briefs — with editable AI-assisted outputs.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-muted-foreground">
              <span className="mr-2 inline-block size-2 rounded-full bg-success" />
              AI assistant ready
            </div>
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <article
                key={t.id}
                className={cn(
                  "rounded-2xl border border-border bg-card p-5 shadow-panel transition hover:-translate-y-0.5 hover:shadow-lift",
                  tool === t.id && "border-primary/40 ring-3 ring-primary/10",
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent text-primary">
                    <t.icon className="size-5" />
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">{t.num}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold">{t.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t.blurb}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded-full bg-accent px-2 py-1 text-[10px] font-semibold text-accent-foreground"
                    >
                      {b}
                    </span>
                  ))}
                </div>
                <Button
                  variant="link"
                  className="mt-3 h-auto p-0 font-bold"
                  onClick={() => setTool(t.id)}
                >
                  Open tool →
                </Button>
              </article>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-panel">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h3 className="text-sm font-semibold">
                  {tool === "email"
                    ? "Describe the email you need"
                    : tool === "notes"
                      ? "Paste your meeting notes"
                      : "Define your research question"}
                </h3>
                <span className="text-xs text-muted-foreground">Structured prompt</span>
              </div>
              <div className="p-5">
                {tool === "email" && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Recipient / audience">
                        <Input
                          value={fields.audience}
                          onChange={(e) => set("audience")(e.target.value)}
                          placeholder="e.g. Head of Operations"
                        />
                      </Field>
                      <Field label="Tone">
                        <Picker
                          value={fields.tone}
                          onChange={set("tone")}
                          options={["Professional", "Friendly", "Concise", "Persuasive"]}
                        />
                      </Field>
                    </div>
                    <Field label="What should the email accomplish?">
                      <Textarea
                        value={fields.goal}
                        onChange={(e) => set("goal")(e.target.value)}
                        placeholder="Request approval for the revised project timeline…"
                      />
                    </Field>
                    <Field label="Important context">
                      <Textarea
                        value={fields.context}
                        onChange={(e) => set("context")(e.target.value)}
                        placeholder="Key facts, dates, names to include."
                      />
                    </Field>
                  </>
                )}

                {tool === "notes" && (
                  <>
                    <Field label="Meeting title">
                      <Input
                        value={fields.meetingTitle}
                        onChange={(e) => set("meetingTitle")(e.target.value)}
                        placeholder="Q3 planning sync"
                      />
                    </Field>
                    <Field label="Meeting transcript / notes">
                      <Textarea
                        className="min-h-[200px]"
                        value={fields.transcript}
                        onChange={(e) => set("transcript")(e.target.value)}
                        placeholder="Paste the raw transcript or notes…"
                      />
                    </Field>
                  </>
                )}

                {tool === "research" && (
                  <>
                    <Field label="Research question or topic">
                      <Textarea
                        value={fields.topic}
                        onChange={(e) => set("topic")(e.target.value)}
                        placeholder="How are mid-sized firms adopting AI assistants?"
                      />
                    </Field>
                    <Field label="Article / source content (optional)">
                      <Textarea
                        value={fields.source}
                        onChange={(e) => set("source")(e.target.value)}
                        placeholder="Paste source text to ground the summary."
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Audience">
                        <Input
                          value={fields.researchAudience}
                          onChange={(e) => set("researchAudience")(e.target.value)}
                          placeholder="Executive team"
                        />
                      </Field>
                      <Field label="Desired depth">
                        <Picker
                          value={fields.depth}
                          onChange={set("depth")}
                          options={["Executive brief", "Detailed analysis", "Research outline"]}
                        />
                      </Field>
                    </div>
                  </>
                )}

                <div className="mt-1 rounded-xl border border-primary/15 bg-accent px-3 py-3">
                  <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-primary">
                    AI prompt
                  </p>
                  <p className="text-xs leading-relaxed text-accent-foreground/80">
                    {active.prompt}
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFields({ ...EMPTY });
                      setOutput("");
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => mutation.mutate()}
                    disabled={!canGenerate || mutation.isPending}
                  >
                    {mutation.isPending && <Loader2 className="animate-spin" />}
                    {mutation.isPending ? "Generating…" : "Generate draft"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-panel">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h3 className="text-sm font-semibold">AI output</h3>
                <span className="text-xs text-muted-foreground">Editable</span>
              </div>
              <div className="p-5">
                <Textarea
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder="Your AI-assisted result will appear here."
                  className="min-h-[300px] leading-relaxed"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {output ? `${output.length} characters` : "No output yet"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" disabled={!output} onClick={copy}>
                      <Copy /> Copy
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!output}
                      onClick={exportTxt}
                    >
                      <Download /> Export .txt
                    </Button>
                  </div>
                </div>

                {history.length > 0 && (
                  <div className="mt-5 border-t border-border pt-4">
                    <p className="mb-2 text-xs font-bold">This session</p>
                    <ul className="grid gap-1.5">
                      {history.map((item, i) => (
                        <li key={i}>
                          <button
                            className="w-full truncate rounded-lg bg-muted px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setOutput(item.text)}
                          >
                            {item.tool} — {item.text.slice(0, 60)}…
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-5 rounded-xl border border-caution-border bg-caution px-4 py-3 text-xs leading-relaxed text-caution-foreground">
                  <strong>Responsible AI:</strong> Review AI-generated content before sharing
                  or acting on it. Outputs may be incomplete or incorrect. Do not enter
                  confidential, regulated, or sensitive personal information unless your
                  organization's approved AI policy allows it.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <SettingsDialog
        key={settingsTab}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        defaultTab={settingsTab}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <Label className="mb-2 text-xs font-bold">{label}</Label>
      {children}
    </div>
  );
}

function Picker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
