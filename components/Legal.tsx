"use client";
import { useEffect, useState } from "react";
import { T, Lang } from "@/lib/i18n";

type Doc = { title: string; sections: [string, string][] };
export type LegalKey = "privacy" | "cookies" | "terms";

const DOCS: Record<LegalKey, Record<Lang, Doc>> = {
  privacy: {
    tr: { title: "Gizlilik", sections: [
      ["Ne topluyoruz?", "Bu site hesap istemez ve kişisel bilgi toplamaz. Yazdığın plaka, aracın bilgilerini almak için resmi kayıt servislerine (DVLA ve DVSA) sunucumuz üzerinden gönderilir."],
      ["Cihazında ne saklanıyor?", "Son aramaların, favori araçların ve dil seçimin sadece tarayıcının yerel depolamasında durur. Bunlar bize gönderilmez. Tarayıcı verilerini temizleyerek silebilirsin."],
      ["Üçüncü taraflar", "Plaka sorguları DVLA ve DVSA'ya gider. Sayfadaki dış bağlantılara (ör. GOV.UK, ücretli kontrol siteleri) tıklarsan o sitelerin kendi gizlilik kuralları geçerlidir."],
      ["Değişiklikler", "Site geliştikçe bu metin güncellenebilir. Önemli bir değişiklik olursa burada yazılır."],
    ] },
    en: { title: "Privacy", sections: [
      ["What we collect", "This site needs no account and collects no personal information. The registration you type is sent through our server to the official records services (DVLA and DVSA) to fetch the vehicle details."],
      ["What is stored on your device", "Your recent searches, favourite vehicles and language choice live only in your browser's local storage. They are not sent to us. Clear your browser data to delete them."],
      ["Third parties", "Registration lookups go to the DVLA and DVSA. If you click an external link (for example GOV.UK or paid check sites), that site's own privacy rules apply."],
      ["Changes", "This text may be updated as the site grows. Important changes will be noted here."],
    ] },
  },
  cookies: {
    tr: { title: "Çerezler", sections: [
      ["Çerez kullanıyor muyuz?", "Hayır. Bu site reklam, takip veya analiz çerezi kullanmaz."],
      ["Yerel depolama", "Favorilerin, son aramaların ve dil seçimin için tarayıcının yerel depolaması kullanılır. Bu bir çerez değildir ve sunucuya gönderilmez."],
      ["Silmek için", "Tarayıcı ayarlarından site verilerini temizlemen yeterli."],
    ] },
    en: { title: "Cookies", sections: [
      ["Do we use cookies?", "No. This site uses no advertising, tracking or analytics cookies."],
      ["Local storage", "Your browser's local storage is used for your favourites, recent searches and language choice. It is not a cookie and is not sent to the server."],
      ["To remove it", "Clear this site's data in your browser settings."],
    ] },
  },
  terms: {
    tr: { title: "Şartlar", sections: [
      ["Bilgilendirme amaçlıdır", "Bu sitedeki veriler resmi kaynaklardan (DVLA, DVSA) gelir ve bilgi vermek içindir. Risk skoru bir tahmindir, garanti veya tavsiye değildir."],
      ["Eksik veri", "Çalıntı, finans borcu ve sigorta hasar kaydı gibi bilgiler bu sitede yoktur. Bir araç satın almadan önce kendi kontrollerini yap ve gerekirse ücretli bir araç geçmişi raporu al."],
      ["Sorumluluk", "Veriler gecikmeli veya hatalı olabilir. Siteyi kullanarak aldığın kararlardan site sahibi sorumlu tutulamaz."],
      ["Resmi servis değildir", "Bu site DVLA, DVSA veya GOV.UK ile bağlantılı ya da onlar tarafından onaylı değildir."],
      ["Tasarım", "Site Ahmet Kula tarafından tasarlanmıştır."],
    ] },
    en: { title: "Terms", sections: [
      ["For information only", "The data on this site comes from official sources (DVLA, DVSA) and is provided for information. The risk score is an estimate, not a guarantee or advice."],
      ["Missing data", "Stolen status, outstanding finance and insurance write-off records are not on this site. Do your own checks before buying a vehicle and consider a paid vehicle history report."],
      ["Liability", "Data may be delayed or wrong. The site owner cannot be held responsible for decisions made using this site."],
      ["Not an official service", "This site is not affiliated with or endorsed by the DVLA, DVSA or GOV.UK."],
      ["Design", "This site was designed by Ahmet Kula."],
    ] },
  },
};

export default function Legal({ kind }: { kind: LegalKey }) {
  const [lang, setLang] = useState<Lang>("tr");
  useEffect(() => { try { const l = localStorage.getItem("ak_lang"); if (l) setLang(JSON.parse(l)); } catch {} }, []);
  const t = T[lang]; const d = DOCS[kind][lang];
  const flip = () => { const l = lang === "tr" ? "en" : "tr"; setLang(l); try { localStorage.setItem("ak_lang", JSON.stringify(l)); } catch {} };
  return (
    <>
      <header className="banner"><div className="bannerText">{t.banner}</div></header>
      <main className="wrap doc">
        <div className="top"><a href="/">{t.back}</a><button className="ghost" onClick={flip}>{t.lang}</button></div>
        <h1>{d.title}</h1>
        {d.sections.map(([h, p]) => <section key={h}><h2>{h}</h2><p>{p}</p></section>)}
        <footer className="foot"><div className="legal"><a href="/gizlilik">{t.legalNav[0]}</a><a href="/cerezler">{t.legalNav[1]}</a><a href="/sartlar">{t.legalNav[2]}</a></div></footer>
      </main>
    </>
  );
}
