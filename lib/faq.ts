export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is BandCheck AI free to use?",
    answer:
      "Yes — checking your council tax band is completely free and does not require an account. If you build an appeal and it succeeds, we only take a small share of your savings under our no win, no fee model.",
  },
  {
    question: "How accurate is the band check?",
    answer:
      "We pull data from official UK sources including the GOV.UK council tax checker and publicly available VOA records. Adding your house number gives the most accurate result. Always verify your official band at gov.uk before submitting an appeal.",
  },
  {
    question: "Can I appeal my council tax band myself?",
    answer:
      "Yes. Council tax band appeals are an administrative process handled by the Valuation Office Agency (VOA). You do not need a solicitor. BandCheck AI helps you gather comparable evidence and prepare a structured submission.",
  },
  {
    question: "How long does an appeal take?",
    answer:
      "After you submit to the VOA, most appeals are reviewed within 2–6 months. You may receive a backdated refund if your band is lowered — typically up to when you moved in or when the band was last changed.",
  },
  {
    question: "What evidence do I need?",
    answer:
      "The strongest cases show similar nearby properties in a lower band. BandCheck AI finds those comparables for you. A council tax bill and photos of your property can also help, but are not always required.",
  },
  {
    question: "Will appealing increase my council tax?",
    answer:
      "The VOA can only lower your band or leave it unchanged during a formal challenge. They cannot increase your band as a result of you appealing. Neighbours' bands are not affected by your appeal.",
  },
  {
    question: "Do you sell my data?",
    answer:
      "No. Your email and property details are used only to deliver your evidence pack and support your appeal. We never sell or share your personal data with third parties for marketing.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "Yes. The BandCheck AI app lets you track appeal progress, receive reminders, and manage multiple cases. You can start a check on the website and continue in the app at any time.",
  },
];
