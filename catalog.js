/* Nosewise catalog — 27 curated picks.
   Tags drive the quiz scoring and the browse filters.
   Tiers are relative only. No prices anywhere on the site. */
const PERFUMES = [
  // Him
  { id: "bleu-de-chanel", name: "Bleu de Chanel", who: "him", family: "woody", occasion: "office", intensity: "noticeable", tier: "premium",
    desc: "A polished woody-aromatic signature. Clean, confident, and made for the office." },
  { id: "club-de-nuit-intense-man", name: "Armaf Club de Nuit Intense Man", who: "him", family: "woody", occasion: "evenings", intensity: "bold", tier: "affordable",
    desc: "Smoky, woody, and bold — a powerhouse evening scent at an affordable tier." },
  { id: "hawas-ice-freeze", name: "Rasasi Hawas Ice Freeze", who: "him", family: "fresh", occasion: "everyday", intensity: "noticeable", tier: "affordable",
    desc: "Icy citrus with cool mint and ginger, drying down to smooth woods and musk." },
  { id: "montblanc-explorer", name: "Montblanc Explorer", who: "him", family: "woody", occasion: "everyday", intensity: "noticeable", tier: "mid",
    desc: "A refined woody-aromatic everyday wearer — clean, versatile, quietly confident." },
  { id: "supremacy-ce", name: "Afnan Supremacy Collector's Edition", who: "him", family: "woody", occasion: "evenings", intensity: "bold", tier: "affordable",
    desc: "Smoky fruity-woody character in the Aventus style — bold and long-lasting." },
  { id: "hawas-ice", name: "Rasasi Hawas Ice", who: "him", family: "fresh", occasion: "everyday", intensity: "noticeable", tier: "affordable",
    desc: "A cooler, crisper take on the Hawas DNA — fruity-fresh with a sweet musky base." },
  { id: "liquid-brun", name: "French Avenue Liquid Brun", who: "him", family: "sweet", occasion: "evenings", intensity: "bold", tier: "affordable",
    desc: "Warm vanilla, cinnamon, and praline — a cozy, confident gourmand for evenings." },
  { id: "stronger-with-you-intensely", name: "Emporio Armani Stronger With You Intensely", who: "him", family: "sweet", occasion: "evenings", intensity: "bold", tier: "premium",
    desc: "Sweet vanilla and amber with a warm, addictive edge — built for nights out." },
  { id: "elysium", name: "Roja Parfums Elysium Pour Homme", who: "him", family: "fresh", occasion: "office", intensity: "noticeable", tier: "premium",
    desc: "Bright citrus over vetiver and musk — a premium fresh signature." },
  { id: "tuscan-leather", name: "Tom Ford Tuscan Leather", who: "him", family: "leather", occasion: "evenings", intensity: "bold", tier: "premium",
    desc: "The leather benchmark — raspberry and saffron over rich, smoky leather." },
  { id: "la-yuqawam", name: "Rasasi La Yuqawam", who: "him", family: "leather", occasion: "evenings", intensity: "bold", tier: "mid",
    desc: "Leather and raspberry over oud — a bold Middle Eastern evening scent." },
  { id: "le-sel-d-issey", name: "Issey Miyake Le Sel d'Issey", who: "him", family: "woody", occasion: "everyday", intensity: "noticeable", tier: "premium",
    desc: "Salt accord and ginger over cedarwood and vetiver — a fresh woody-marine." },
  // Her
  { id: "yara", name: "Lattafa Yara", who: "her", family: "sweet", occasion: "everyday", intensity: "noticeable", tier: "affordable",
    desc: "Sweet and soft — a beloved everyday gourmand with a creamy, tropical feel." },
  { id: "bright-crystal", name: "Versace Bright Crystal", who: "her", family: "floral", occasion: "office", intensity: "light", tier: "mid",
    desc: "Light, clean florals — an easy office-friendly everyday scent." },
  { id: "coco-mademoiselle", name: "Chanel Coco Mademoiselle", who: "her", family: "floral", occasion: "evenings", intensity: "noticeable", tier: "premium",
    desc: "A timeless floral-oriental — polished, radiant, and made for evenings." },
  { id: "good-girl", name: "Carolina Herrera Good Girl", who: "her", family: "sweet", occasion: "evenings", intensity: "bold", tier: "premium",
    desc: "Sweet and bold — jasmine and tonka with a daring edge." },
  // Unisex
  { id: "khamrah", name: "Lattafa Khamrah", who: "unisex", family: "warm", occasion: "evenings", intensity: "noticeable", tier: "affordable",
    desc: "Warm spice, cinnamon, and vanilla — a cozy evening favorite." },
  { id: "shaghaf-oud", name: "Swiss Arabian Shaghaf Oud", who: "unisex", family: "woody", occasion: "special", intensity: "bold", tier: "mid",
    desc: "Oud and woods with a marine twist — a statement scent for special occasions." },
  { id: "baccarat-rouge-540", name: "Maison Francis Kurkdjian Baccarat Rouge 540", who: "unisex", family: "sweet", occasion: "evenings", intensity: "bold", tier: "premium",
    desc: "Sweet amber and saffron — luminous, bold, and instantly recognizable." },
  { id: "ck-one", name: "Calvin Klein CK One", who: "unisex", family: "fresh", occasion: "everyday", intensity: "light", tier: "affordable",
    desc: "The original clean unisex fresh scent — light, easy, everyday." },
  { id: "mykonos-inception", name: "Mykonos Inception", who: "unisex", family: "fresh", occasion: "everyday", intensity: "noticeable", tier: "mid",
    desc: "Citrus and black tea over cedarwood — a modern fresh-woody extrait." },
  { id: "mykonos-slow-living", name: "Mykonos Slow Living", who: "unisex", family: "floral", occasion: "everyday", intensity: "noticeable", tier: "mid",
    desc: "Citrus and white florals over soft musk — calm, clean, and easy to wear." },
  { id: "dynasty", name: "Lattafa Dynasty", who: "unisex", family: "warm", occasion: "everyday", intensity: "noticeable", tier: "affordable",
    desc: "Spiced tea and suede over warm woods — a refined modern signature." },
  { id: "rare-reef", name: "Afnan Rare Reef", who: "unisex", family: "fresh", occasion: "everyday", intensity: "noticeable", tier: "affordable",
    desc: "Bright citrus and mint over fig and amberwood — a fresh coastal extrait." },
  { id: "tobacco-vanille", name: "Tom Ford Tobacco Vanille", who: "unisex", family: "tobacco", occasion: "evenings", intensity: "bold", tier: "premium",
    desc: "Tobacco leaf, vanilla, and cocoa — warm, rich, and unmistakable." },
  { id: "megamare", name: "Orto Parisi Megamare", who: "unisex", family: "fresh", occasion: "everyday", intensity: "bold", tier: "premium",
    desc: "Salty seaweed and driftwood over musk — a bold, raw marine that smells like the open sea." },
  { id: "black-afgano", name: "Nasomatto Black Afgano Extrait de Parfum", who: "unisex", family: "tobacco", occasion: "evenings", intensity: "bold", tier: "premium",
    desc: "Dark hashish, oud, and incense over tobacco and coffee — a bold, smoky extrait for nights." },
];

/* Bottle photos: optimized WebP versions in images-opt/ (originals kept in
   images/). Missing photos fall back to a clean typographic tile. */
const PHOTOS = {
  "bleu-de-chanel": "images-opt/bleu-de-chanel.webp",
  "club-de-nuit-intense-man": "images-opt/club-de-nuit-intense-man.webp",
  "hawas-ice-freeze": "images-opt/hawas-ice-freeze.webp",
  "montblanc-explorer": "images-opt/montblanc-explorer.webp",
  "supremacy-ce": "images-opt/supremacy-ce.webp",
  "hawas-ice": "images-opt/hawas-ice.webp",
  "liquid-brun": "images-opt/liquid-brun.webp",
  "stronger-with-you-intensely": "images-opt/stronger-with-you-intensely.webp",
  "elysium": "images-opt/elysium.webp",
  "tuscan-leather": "images-opt/tuscan-leather.webp",
  "la-yuqawam": "images-opt/la-yuqawam.webp",
  "le-sel-d-issey": "images-opt/le-sel-d-issey.webp",
  "yara": "images-opt/yara.webp",
  "bright-crystal": "images-opt/bright-crystal.webp",
  "coco-mademoiselle": "images-opt/coco-mademoiselle.webp",
  "good-girl": "images-opt/good-girl.webp",
  "khamrah": "images-opt/khamrah.webp",
  "shaghaf-oud": "images-opt/shaghaf-oud.webp",
  "baccarat-rouge-540": "images-opt/baccarat-rouge-540.webp",
  "ck-one": "images-opt/ck-one.webp",
  "mykonos-inception": "images-opt/mykonos-inception.webp",
  "mykonos-slow-living": "images-opt/mykonos-slow-living.webp",
  "dynasty": "images-opt/dynasty.webp",
  "rare-reef": "images-opt/rare-reef.webp",
  "tobacco-vanille": "images-opt/tobacco-vanille.webp",
  "megamare": "images-opt/megamare.webp",
  "black-afgano": "images-opt/black-afgano.webp",
};

/* Reference-perfume lookup: well-known perfume -> scent family.
   Used by the quiz's reference question. Unknown names are ignored. */
const REFERENCE_FAMILIES = {
  "dior sauvage": "fresh", "creed aventus": "woody", "bleu de chanel": "woody",
  "chanel coco mademoiselle": "floral", "lattafa yara": "sweet", "lattafa khamrah": "warm",
  "tom ford tuscan leather": "leather", "tom ford tobacco vanille": "tobacco",
  "stronger with you intensely": "sweet", "versace eros": "sweet",
  "chanel chance": "floral", "miss dior": "floral", "la vie est belle": "sweet",
  "ysl libre": "floral", "gucci guilty": "woody", "montblanc legend": "woody",
  "acqua di gio": "fresh", "versace pour homme": "fresh", "nautica voyage": "fresh",
  "lattafa asad": "woody", "club de nuit intense man": "woody", "rasasi hawas": "fresh",
  "afnan supremacy": "woody", "tom ford oud wood": "woody", "dior homme intense": "woody",
  "baccarat rouge 540": "sweet", "ck one": "fresh", "good girl": "sweet",
  "bright crystal": "floral", "shaghaf oud": "woody", "la yuqawam": "leather",
  "le sel d'issey": "woody", "liquid brun": "sweet", "rare reef": "fresh",
  "dynasty": "warm", "mykonos inception": "fresh", "mykonos slow living": "floral",
  "orto parisi megamare": "fresh", "nasomatto black afgano": "tobacco",
  "spicebomb": "warm", "sauvage elixir": "warm", "terre d'hermes": "woody",
};

const FAMILY_LABELS = {
  fresh: "Fresh & citrusy", floral: "Floral", warm: "Warm & spicy",
  woody: "Woody & earthy", sweet: "Sweet", leather: "Leather", tobacco: "Tobacco",
};
const OCCASION_LABELS = {
  everyday: "Everyday", office: "Office", evenings: "Evenings & dates", special: "Special occasions",
};
const INTENSITY_LABELS = { light: "Light & close", noticeable: "Noticeable", bold: "Bold & long-lasting" };
const TIER_LABELS = { affordable: "Affordable", mid: "Mid-range", premium: "Premium" };
const WHO_LABELS = { him: "For him", her: "For her", unisex: "Unisex" };

if (typeof module !== "undefined") {
  module.exports = { PERFUMES, PHOTOS, REFERENCE_FAMILIES, FAMILY_LABELS, OCCASION_LABELS, INTENSITY_LABELS, TIER_LABELS, WHO_LABELS };
}
