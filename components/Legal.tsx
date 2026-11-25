"use client";
import { useEffect, useState } from "react";
import { T, Lang } from "@/lib/i18n";

type Doc = { title: string; sections: ([string, string] | [string, string, [string, string]])[] };
export type LegalKey = "privacy" | "cookies" | "terms" | "sell" | "blog" | "support";

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
  sell: {
    tr: { title: "Aracımı sat", sections: [
      ["Belgeleri hazırla", "V5C (tescil belgesi), geçerli MOT sertifikası ve varsa servis kayıtlarını bir araya getir. Eksiksiz belge, alıcıya güven verir."],
      ["Aracın geçmişini kendin kontrol et", "Alıcılar büyük ihtimalle plakanı bu tür sitelerde sorgulayacak. Kendi aracını önce sen sorgula: MOT geçmişi, kilometre kayıtları ve vergi durumu sana nasıl görünüyor?"],
      ["Kilometre ve uyarıları açıkla", "MOT'ta tekrar eden uyarılar varsa onları düzelttiğini ya da neden hâlâ durduğunu açıkça anlat. Sürpriz çıkan şey alıcıyı kaçırır."],
      ["Satış sonrası DVLA'ya bildir", "Aracı sattıktan sonra DVLA'ya bildirmeyi unutma. Resmi adımlar için GOV.UK sayfasına bak.", ["GOV.UK: araç satma ve alma ↗", "https://www.gov.uk/sold-bought-vehicle"]],
    ] },
    en: { title: "Sell my car", sections: [
      ["Gather the paperwork", "Collect the V5C (registration certificate), a valid MOT certificate and any service records. Complete paperwork gives buyers confidence."],
      ["Check your own car's history first", "Buyers will probably look up your plate on sites like this one. Check your own vehicle first: how do the MOT history, mileage records and tax status look?"],
      ["Explain mileage and advisories", "If MOT advisories repeat, say whether you fixed them or why they remain. Surprises scare buyers off."],
      ["Tell the DVLA after the sale", "Don't forget to tell the DVLA once you have sold the vehicle. See the GOV.UK page for the official steps.", ["GOV.UK: selling and buying a vehicle ↗", "https://www.gov.uk/sold-bought-vehicle"]],
    ] },
  },
  blog: {
    tr: { title: "Blog", sections: [
      ["MOT geçmişi nasıl okunur?", "Her kayıt geçti ya da kaldı olarak biter. Geçen testlerde bile uyarılar (advisory) olabilir: bunlar henüz arıza değil ama yakında olabilecek sorunlardır. Aynı uyarı yıllarca tekrar ediyorsa, sorun düzeltilmemiş demektir. Kalan testlerin hemen ardından gelen geçen test, tamirin yapıldığını gösterir."],
      ["Kilometre geri alma belirtileri", "Kilometre, MOT'tan MOT'a artmalıdır. İki test arasında rakam düşüyorsa ya da sonraki testte aniden çok az artıyorsa dikkat et. Direksiyon, pedallar ve koltuk aşınması da rakamla uyumlu olmalı. Bu sitedeki grafik, tutarsızlıkları görmeyi kolaylaştırır."],
      ["Ücretsiz kontrol neyi göstermez?", "Ücretsiz resmi kayıtlar aracın finans borcunu, çalıntı olarak işaretli olup olmadığını ya da sigorta hasar kaydını göstermez. Ciddi bir aday için ücretli bir araç geçmişi raporu almak mantıklı. Güvenlik geri çağırmaları için ise resmi GOV.UK kontrolü ücretsiz.", ["GOV.UK recall kontrolü ↗", "https://www.gov.uk/check-vehicle-recall"]],
    ] },
    en: { title: "Blog", sections: [
      ["How to read an MOT history", "Every record ends as a pass or a fail. Even passed tests can carry advisories: not faults yet, but things likely to become one. If the same advisory repeats for years, it was never fixed. A pass right after a fail usually shows the repair was done."],
      ["Signs of mileage tampering", "Mileage should go up from one MOT to the next. If the figure drops between tests, or suddenly rises very little, be careful. Wear on the steering wheel, pedals and seat should also fit the number. The chart on this site makes inconsistencies easy to spot."],
      ["What does the free check not show?", "Free official records do not show outstanding finance, whether a car is marked stolen, or an insurance write-off record. For a serious candidate a paid vehicle history report makes sense. For safety recalls, the official GOV.UK check is free.", ["GOV.UK recall check ↗", "https://www.gov.uk/check-vehicle-recall"]],
    ] },
  },
  support: {
    tr: { title: "Destek", sections: [
      ["Bir sorun mu var?", "Veri yanlış görünüyorsa önce plakayı kontrol et. Veriler DVLA ve DVSA'dan geldiği için, hata resmi kayıttan da kaynaklanıyor olabilir."],
      ["Sık sorulan sorular", "Ana sayfanın altındaki SSS bölümünde risk skoru, ULEZ ve veri kaynakları anlatılıyor."],
      ["İletişim", "Site Ahmet Kula tarafından tasarlanmıştır. Geri bildirim ve düzeltme istekleri için ona ulaşabilirsin."],
    ] },
    en: { title: "Support", sections: [
      ["Having a problem?", "If the data looks wrong, first check the plate. Since the data comes from the DVLA and DVSA, an error may come from the official record itself."],
      ["Frequently asked questions", "The FAQ at the bottom of the home page explains the risk score, ULEZ and data sources."],
      ["Contact", "This site was designed by Ahmet Kula. You can reach him for feedback and correction requests."],
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
        {d.sections.map(([h, p, link]) => <section key={h}><h2>{h}</h2><p>{p}</p>{link && <p><a href={link[1]} target="_blank" rel="noopener noreferrer">{link[0]}</a></p>}</section>)}
        {kind === "support" && process.env.NEXT_PUBLIC_CONTACT_EMAIL && <p><a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}>{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</a></p>}
        <footer className="foot"><div className="legal"><a href="/gizlilik">{t.legalNav[0]}</a><a href="/cerezler">{t.legalNav[1]}</a><a href="/sartlar">{t.legalNav[2]}</a></div></footer>
      </main>
    </>
  );
}
