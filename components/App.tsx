"use client";
import { useEffect, useMemo, useState } from "react";
import { T, Lang } from "@/lib/i18n";
import { computeRisk } from "@/lib/risk";
import type { Vehicle } from "@/lib/types";
import { Home, FileText, Car, ClipboardCheck, HelpCircle, Gauge, ShieldCheck, Leaf } from "lucide-react";
import MileageChart from "./MileageChart";
import { countdown, countdownText, ulez, ulezText, yearlyMileage, taxBand, RECALL_URL, TFL_URL, TAX_RATES_URL } from "@/lib/extras";

const PAID = [
  { n: "HPI Check", u: "https://www.hpicheck.com/" },
  { n: "RAC Vehicle Check", u: "https://www.rac.co.uk/buying-a-car/rac-car-data-check" },
  { n: "Total Car Check", u: "https://totalcarcheck.co.uk/" },
];

function load<X>(k: string, d: X): X { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as X) : d; } catch { return d; } }
function save(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export default function App({ sample = false, motOnly = false }: { sample?: boolean; motOnly?: boolean }) {
  const [lang, setLang] = useState<Lang>("tr");
  const [reg, setReg] = useState("");
  const [v, setV] = useState<Vehicle | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "notfound" | "error">("idle");
  const [favs, setFavs] = useState<Vehicle[]>([]);
  const [hist, setHist] = useState<string[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [showCmp, setShowCmp] = useState(false);
  const t = T[lang];

  useEffect(() => { setFavs(load("ak_favs", [])); setHist(load("ak_hist", [])); setLang(load("ak_lang", "tr")); }, []);

  useEffect(() => { if (sample) run("AB12CDE"); /* eslint-disable-next-line */ }, [sample]);

  async function run(r: string) {
    const q = r.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (q.length < 2) return;
    setState("loading"); setV(null);
    try {
      const res = await fetch(`/api/vehicle?reg=${q}${sample ? "&sample=1" : ""}`);
      if (res.status === 404) return setState("notfound");
      if (!res.ok) return setState("error");
      const data: Vehicle = await res.json();
      setV(data); setState("idle"); setReg(q);
      const h = [q, ...hist.filter((x) => x !== q)].slice(0, 8); setHist(h); save("ak_hist", h);
    } catch { setState("error"); }
  }

  const risk = useMemo(() => (v ? computeRisk(v) : null), [v]);
  const isFav = !!v && favs.some((f) => f.reg === v.reg);
  const toggleFav = () => { if (!v) return; const n = isFav ? favs.filter((f) => f.reg !== v.reg) : [v, ...favs]; setFavs(n); save("ak_favs", n); };
  const delFav = (r: string) => { const n = favs.filter((f) => f.reg !== r); setFavs(n); save("ak_favs", n); setSel(sel.filter((s) => s !== r)); };
  const toggleSel = (r: string) => setSel((s) => (s.includes(r) ? s.filter((x) => x !== r) : s.length < 3 ? [...s, r] : s));
  const switchLang = () => { const l = lang === "tr" ? "en" : "tr"; setLang(l); save("ak_lang", l); };
  const lvl = risk ? t[risk.level] : "";
  const cmp = favs.filter((f) => sel.includes(f.reg));

  return (
    <>
      <header className="banner"><div className="bannerText">{t.banner}</div></header>
      <nav className="nav noprint">
        <a href="/"><Home size={16} />{t.nav[0]}</a><a href="/ornek"><FileText size={16} />{t.nav[1]}</a><a href="/#garaj"><Car size={16} />{t.nav[2]}</a><a href="/mot"><ClipboardCheck size={16} />{t.more[0]}</a><a href="/#sss"><HelpCircle size={16} />{t.nav[3]}</a>
      </nav>
      <main className="wrap">
        <div className="top"><h1>{motOnly ? t.motPageTitle : t.title}</h1><button className="ghost" onClick={switchLang}>{t.lang}</button></div>
        <p className="sub">{sample ? t.sampleNote : motOnly ? t.motPageSub : t.sub}</p>

        <form className="search" onSubmit={(e) => { e.preventDefault(); run(reg); }}>
          <input value={reg} onChange={(e) => setReg(e.target.value.toUpperCase())} placeholder={t.placeholder} maxLength={9} inputMode="text" autoCapitalize="characters" aria-label="registration" />
          <button type="submit" disabled={state === "loading"}>{state === "loading" ? t.loading : t.check}</button>
        </form>

        {hist.length > 0 && !v && (
          <div className="chips"><span className="lbl">{t.hist}:</span>{hist.map((h) => <button key={h} className="chip" onClick={() => run(h)}>{h}</button>)}</div>
        )}

        {state === "notfound" && <p className="msg bad">{t.notFound}</p>}
        {state === "error" && <p className="msg bad">{t.err}</p>}

        {v && risk && motOnly && (
          <section className="card" id="report">
            {v.demo && <p className="demo">{t.demo}</p>}
            <div className="head"><div className="plate">{v.reg}</div><div className="title">{v.make} {v.model} {v.year ?? ""}</div></div>
            <div className="cd cd2" style={{ marginTop: 14 }}>
              {(() => { const c = countdown(v.motExpiry); return <div className={`cdBox ${c.sev}`}><span>{t.motLeft}</span><b>{countdownText(c, lang)}</b><small>{v.motExpiry ?? "-"}</small></div>; })()}
              <div className="cdBox na"><span>{t.mot}</span><b>{v.motStatus || "-"}</b></div>
            </div>
            <h3>{t.mileage}</h3>
            <MileageChart tests={v.tests} />
            <MotHistory v={v} t={t} />
          </section>
        )}

        {v && risk && !motOnly && (
          <section className="card" id="report">
            {v.demo && <p className="demo">{t.demo}</p>}
            <div className="head">
              <div className="plate">{v.reg}</div>
              <div className="title">{v.make} {v.model} {v.year ?? ""}</div>
            </div>

            <div className={`risk ${risk.level}`}>
              <div className="score">{risk.score}<small>/100</small></div>
              <div><div className="rl">{t.risk}</div><div className="rv">{lvl}</div></div>
            </div>
            <ul className="flags">
              {risk.flags.map((f) => <li key={f.key} className={f.sev}>{lang === "tr" ? f.tr : f.en}</li>)}
            </ul>

            <h3>{t.dates}</h3>
            <div className="cd">
              {([[t.motLeft, v.motExpiry], [t.taxLeft, v.taxDue]] as const).map(([k, d]) => {
                const c = countdown(d);
                return <div key={k} className={`cdBox ${c.sev}`}><span>{k}</span><b>{countdownText(c, lang)}</b><small>{d ?? "-"}</small></div>;
              })}
              {(() => { const u = ulez(v); const sev = u.status === "yes" || u.status === "likely" ? "ok" : u.status === "unknown" ? "na" : "bad";
                return <div className={`cdBox ${sev}`}><span>{t.ulez}</span><b>{ulezText(u, lang)}</b><small>{u.basis}</small></div>; })()}
            </div>
            <p className="muted small">{t.ulezNote}</p>
            <div className="recall noprint">
              <h3>{t.congTitle}</h3>
              <p className="muted">{t.congText}</p>
              <a className="chip link" href={TFL_URL} target="_blank" rel="noopener noreferrer">{t.tflBtn}</a>
            </div>
            {(() => { const b = taxBand(v); if (b.kind === "unknown") return null;
              return <div className="cdBox na" style={{ margin: "12px 0" }}><span>{t.taxBand}</span><b>{b.kind === "band" ? `${b.band}` : t.flat}</b><small>{t.bandNote} <a className="link" href={TAX_RATES_URL} target="_blank" rel="noopener noreferrer">{t.taxLink}</a></small></div>; })()}

            <div className="grid">
              <Info k={t.make} v={v.make} /><Info k={t.model} v={v.model} /><Info k={t.year} v={v.year} /><Info k={t.colour} v={v.colour} />
              <Info k={t.fuel} v={v.fuel} /><Info k={t.engine} v={v.engineCc} /><Info k={t.tax} v={v.taxStatus} /><Info k={t.mot} v={v.motStatus} />
              <Info k={t.motExp} v={v.motExpiry} /><Info k={t.taxDue} v={v.taxDue} /><Info k={t.co2} v={v.co2} /><Info k={t.euro} v={v.euroStatus ?? null} />
              <Info k={t.yearly} v={(() => { const y = yearlyMileage(v); const u = v.tests.find((x) => x.mileage != null)?.unit ?? "mi"; return y ? `${y.toLocaleString("en-GB")} ${u}` : null; })()} /><Info k={t.firstReg} v={v.firstReg ?? null} />
              <Info k={t.exportSt} v={v.exported == null ? null : v.exported ? t.yes : t.no} /><Info k={t.v5c} v={v.v5c ?? null} />
              <Info k={t.typeApp} v={v.typeApproval ?? null} /><Info k={t.wheelplan} v={v.wheelplan ?? null} />
            </div>

            <div className="actions noprint">
              <button onClick={toggleFav}>{isFav ? "★ " + t.saved : "☆ " + t.save}</button>
              <button className="ghost" onClick={() => window.print()}>⬇ {t.pdf}</button>
            </div>

            <div className="recall noprint">
              <h3>{t.recallTitle}</h3>
              <p className="muted">{t.recallText}</p>
              <a className="chip link" href={RECALL_URL} target="_blank" rel="noopener noreferrer">{t.recallBtn}</a>
            </div>

            <h3>{t.mileage}</h3>
            <MileageChart tests={v.tests} />

            <MotHistory v={v} t={t} />

            <div className="paid noprint">
              <h3>{t.paid}</h3>
              <p className="muted">{t.paidNote}</p>
              <div className="chips">{PAID.map((p) => <a key={p.n} className="chip link" href={p.u} target="_blank" rel="noopener noreferrer">{p.n} ↗</a>)}</div>
            </div>
          </section>
        )}

        {!v && !sample && !motOnly && state !== "loading" && (
          <>
            <div className="feats noprint">
              {[<ClipboardCheck key="a" size={22} />, <Gauge key="b" size={22} />, <Leaf key="c" size={22} />].map((ic, i) => (
                <div key={i} className="feat"><div className="ic">{ic}</div><div><b>{t.feats[i][0]}</b><span className="muted">{t.feats[i][1]}</span></div></div>
              ))}
            </div>
            <section className="card noprint">
              <h3>{t.freeTitle}</h3>
              <ul className="ticks">{t.freeList.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
            <section className="card noprint">
              <h3>{t.howTitle}</h3>
              <div className="steps">{t.how.map(([a, b]) => <div key={a} className="step"><b>{a}</b><span className="muted">{b}</span></div>)}</div>
            </section>
            <section className="card noprint">
              <h3>{t.fullTitle}</h3>
              <p className="muted">{t.fullText}</p>
              <ul className="ticks lock">{t.fullList.map((x) => <li key={x}>{x}</li>)}</ul>
              <div className="chips">{PAID.map((p) => <a key={p.n} className="chip link" href={p.u} target="_blank" rel="noopener noreferrer">{p.n} ↗</a>)}</div>
              <p><a className="chip link" href="/ornek">{t.nav[1]} →</a></p>
            </section>
          </>
        )}

        <section className="card noprint" id="garaj">
          <h3>{t.fav}</h3>
          {favs.length === 0 ? <p className="muted">{t.empty}</p> : (
            <>
              <ul className="favs">
                {favs.map((f) => (
                  <li key={f.reg}>
                    <label><input type="checkbox" checked={sel.includes(f.reg)} onChange={() => toggleSel(f.reg)} /> <b>{f.reg}</b> <span className="muted">{f.make} {f.model}</span></label>
                    <span className="fa"><button className="mini" onClick={() => { setReg(f.reg); setV(f); setState("idle"); }}>↗</button><button className="mini ghost" onClick={() => delFav(f.reg)} aria-label={t.remove}>✕</button></span>
                  </li>
                ))}
              </ul>
              <button disabled={sel.length < 2} onClick={() => setShowCmp(true)}>{t.compare} ({sel.length}/3)</button>
              {sel.length < 2 && <p className="muted small">{t.pick}</p>}
            </>
          )}
        </section>
        <section className="card noprint" id="sss">
          <h3>{t.sources}</h3>
          <p className="muted">{t.sourcesText}</p>
          <h3>{t.faq}</h3>
          {t.faqs.map(([q, a]) => (
            <details key={q} className="faq"><summary>{q}</summary><p className="muted">{a}</p></details>
          ))}
        </section>
        <footer className="foot">{t.footer}<div className="legal"><a href="/mot">{t.more[0]}</a><a href="/sat">{t.more[1]}</a><a href="/blog">{t.more[2]}</a><a href="/destek">{t.more[3]}</a></div><div className="legal"><a href="/gizlilik">{t.legalNav[0]}</a><a href="/cerezler">{t.legalNav[1]}</a><a href="/sartlar">{t.legalNav[2]}</a></div></footer>
      </main>

      {showCmp && (
        <div className="modal" onClick={() => setShowCmp(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="top"><h3>{t.compareTitle}</h3><button className="ghost" onClick={() => setShowCmp(false)}>{t.close}</button></div>
            <div className="tw"><table>
              <thead><tr><th></th>{cmp.map((c) => <th key={c.reg}>{c.reg}</th>)}</tr></thead>
              <tbody>
                {[
                  [t.risk, (c: Vehicle) => `${computeRisk(c).score}/100`], [t.make, (c: Vehicle) => c.make], [t.model, (c: Vehicle) => c.model],
                  [t.year, (c: Vehicle) => c.year ?? "-"], [t.fuel, (c: Vehicle) => c.fuel], [t.tax, (c: Vehicle) => c.taxStatus], [t.mot, (c: Vehicle) => c.motStatus],
                  [t.mileage, (c: Vehicle) => { const m = c.tests.filter((x) => x.mileage != null).sort((a, b) => b.date.localeCompare(a.date))[0]; return m ? `${m.mileage!.toLocaleString("en-GB")} ${m.unit}` : "-"; }],
                ].map(([label, fn]) => (
                  <tr key={label as string}><td>{label as string}</td>{cmp.map((c) => <td key={c.reg}>{(fn as (c: Vehicle) => string)(c)}</td>)}</tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </div>
      )}
    </>
  );
}

function MotHistory({ v, t }: { v: Vehicle; t: (typeof T)[Lang] }) {
  return (
    <>
      <h3>{t.motHistory}</h3>
      {v.tests.length === 0 && <p className="muted">{t.noTests}</p>}
      <ul className="tests">
        {[...v.tests].sort((a, b) => b.date.localeCompare(a.date)).map((x, i) => (
          <li key={i}>
            <div className="row"><b>{x.date}</b><span className={/fail/i.test(x.result) ? "tag bad" : "tag ok"}>{/fail/i.test(x.result) ? t.failed : t.passed}</span><span className="muted">{x.mileage != null ? `${x.mileage.toLocaleString("en-GB")} ${x.unit}` : "-"}</span></div>
            {x.defects.length > 0 && <ul className="def">{x.defects.map((d, j) => <li key={j}><i>{d.type}</i> {d.text}</li>)}</ul>}
          </li>
        ))}
      </ul>
    </>
  );
}

function Info({ k, v }: { k: string; v: string | number | null }) {
  return <div className="info"><span>{k}</span><b>{v ?? "-"}</b></div>;
}
