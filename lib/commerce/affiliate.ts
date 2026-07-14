const DEFAULT_TRACKING = {
  utm_source: "padelcompare",
  utm_medium: "affiliate"
} as const;

export type AffiliateProgram = {
  merchant: string;
  network: "awin" | "inhouse" | "uppromote" | "unknown";
  programUrl: string;
  evidence: string;
  evidenceDate: string;
  hostnames: string[];
  params: Record<string, string>;
  notes: string;
};

export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    merchant: "Padel Market",
    network: "awin",
    programUrl: "https://www.awin.com/gb/advertisers/case-studies/padel-market-internationalising-affiliate-marketing",
    evidence: "Awin case study confirms an active affiliate programme for Padel Market.",
    evidenceDate: "2022-06-24",
    hostnames: ["padelmarket.com"],
    params: {
      ...DEFAULT_TRACKING,
      utm_campaign: "padel-market",
      clickref: "padelcompare"
    },
    notes: "Strong store target for early outreach because the programme already exists."
  },
  {
    merchant: "HEAD US",
    network: "awin",
    programUrl: "https://ui.awin.com/merchant-profile/27978",
    evidence: "Awin merchant profile shows Head (US) affiliate programme with a 30 day cookie.",
    evidenceDate: "2026-07-08",
    hostnames: ["head.com"],
    params: {
      ...DEFAULT_TRACKING,
      utm_campaign: "head-us",
      clickref: "padelcompare"
    },
    notes: "Programme exists on Awin; direct activation still depends on approved publisher access."
  },
  {
    merchant: "NOX USA",
    network: "uppromote",
    programUrl: "https://noxsportusa.com/pages/become-an-ambassador",
    evidence: "NOX USA publicly advertises an Ambassador & Affiliate Program.",
    evidenceDate: "2026-07-08",
    hostnames: ["noxsportusa.com"],
    params: {
      ...DEFAULT_TRACKING,
      utm_campaign: "nox-usa",
      ref: "padelcompare"
    },
    notes: "Best fit for creator, coach, and buyer-guide traffic."
  },
  {
    merchant: "Bullpadel Australia",
    network: "uppromote",
    programUrl: "https://af.uppromote.com/bullpadel-australia/register",
    evidence: "Bullpadel Australia has a public affiliate registration page with 5% commission.",
    evidenceDate: "2026-07-08",
    hostnames: ["bullpadel.com.au"],
    params: {
      ...DEFAULT_TRACKING,
      utm_campaign: "bullpadel-au",
      ref: "padelcompare"
    },
    notes: "Useful as proof Bullpadel-branded retail can support affiliate, even if the global site does not."
  },
  {
    merchant: "PadelNuestro EU",
    network: "unknown",
    programUrl: "https://www.affiliate-toolkit.com/program/padelnuestro-eu/",
    evidence: "Third-party affiliate directory lists PadelNuestro EU with product feed and up to 5% commission.",
    evidenceDate: "2026-07-08",
    hostnames: ["padelnuestro.com"],
    params: {
      ...DEFAULT_TRACKING,
      utm_campaign: "padelnuestro",
      ref: "padelcompare"
    },
    notes: "Treat as outreach lead until verified directly with the merchant or network."
  }
];

export type AffiliateLink = {
  url: string;
  isAffiliate: boolean;
  merchant?: string;
  network?: AffiliateProgram["network"];
  label?: string;
  notes?: string;
};

function findProgramByUrl(rawUrl: string) {
  try {
    const hostname = new URL(rawUrl).hostname.replace(/^www\./, "");
    return (
      AFFILIATE_PROGRAMS.find((program) =>
        program.hostnames.some((candidate) => hostname === candidate || hostname.endsWith(`.${candidate}`))
      ) ?? null
    );
  } catch {
    return null;
  }
}

export function buildAffiliateLink(rawUrl: string): AffiliateLink {
  if (!rawUrl || rawUrl === "#") {
    return { url: rawUrl, isAffiliate: false };
  }

  const program = findProgramByUrl(rawUrl);
  if (!program) {
    return { url: rawUrl, isAffiliate: false };
  }

  try {
    const url = new URL(rawUrl);
    for (const [key, value] of Object.entries(program.params)) {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }

    return {
      url: url.toString(),
      isAffiliate: true,
      merchant: program.merchant,
      network: program.network,
      label: `${program.network}-ready`,
      notes: program.notes
    };
  } catch {
    return { url: rawUrl, isAffiliate: false };
  }
}
