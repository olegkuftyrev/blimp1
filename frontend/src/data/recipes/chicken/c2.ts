export interface IngredientItem {
  name: string;
  amount: string;
  notes?: string;
}

export interface StepItem {
  title: string;
  bullets: string[];
}

export interface RecipeDetail {
  code: string;
  title: string;
  batchLabel: string;
  servingsApprox: string;
  cookedWeightApprox: string;
  maxHold: string;
  source: string;
  equipment: string[];
  ingredients: {
    group: string;
    items: IngredientItem[];
  }[];
  steps: StepItem[];
  timings: { label: string; value: string }[];
  qualityControl: string[];
  scaling: { label: string; details: string[] }[];
  quickRead?: {
    title: string;
    steps: string[];
    checks?: string[];
  };
}

export const c2MushroomChicken: RecipeDetail = {
  code: 'C2',
  title: 'Mushroom Chicken',
  batchLabel: 'Batch #1',
  servingsApprox: '\u22484.39 servings',
  cookedWeightApprox: '\u224825 oz cooked',
  maxHold: 'Max hold 1 hour (\u2265 135\u00B0F)',
  source: 'Panda Express Recipe Book',
  equipment: [
    'Wok (or heavy 12–14\" skillet), high BTU burner preferred',
    'Thermometer (oil + meat)',
    'Strainer, perforated spoon, spider/meat strainer',
    'Blanch basket (or slotted spoon)',
    'Timer',
  ],
  ingredients: [
    {
      group: 'Chicken',
      items: [
        { name: 'Soybean oil', amount: '5 cups', notes: 'for the protein fry' },
        { name: 'Marinated diced chicken', amount: '12 oz', notes: 'cook to 165\u00B0F (74\u00B0C), \u23F1\uFE0F 1:15' },
      ],
    },
    {
      group: 'Vegetables',
      items: [
        { name: 'Diced zucchini', amount: 'M \u00D7 1/2' },
        { name: 'Additional soybean oil', amount: '1 Tbsp', notes: 'for veg stage' },
        { name: 'Sliced mushrooms', amount: 'M \u00D7 1', notes: '\u23F1\uFE0F stir-fry 10 sec' },
      ],
    },
    {
      group: 'Sauce',
      items: [
        { name: 'Ginger & garlic mix', amount: '1\u00BD tsp' },
        { name: 'Cooking wine', amount: '1\u00BD tsp' },
        { name: '#5 sauce mix', amount: '1/2 cup' },
        { name: 'Clean water', amount: '—', notes: 'not used at Batch #1' },
      ],
    },
    {
      group: 'Finish',
      items: [
        { name: 'Sesame oil', amount: '1\u00BD tsp' },
      ],
    },
  ],
  steps: [
    {
      title: 'Preheat wok & oil',
      bullets: [
        'Heat a clean, dry wok on high until you see white smoke.',
        'Add 5 cups soybean oil. Heat to 275\u00B0F (verify with thermometer). Do not proceed until true 275\u00B0F.',
      ],
    },
    {
      title: 'Fry chicken (tiny window, stay on timer)',
      bullets: [
        'Add 12 oz marinated diced chicken to 275\u00B0F oil.',
        'High flame 10 sec, then medium. Timer: 1 min 15 sec.',
        'Stir to separate; verify 165\u00B0F internal by end. If not, cook in 10-sec bursts.',
      ],
    },
    {
      title: 'Drain & stage the wok',
      bullets: [
        'Lift chicken; drain back to wok.',
        'Pour off excess oil; leave 2 Tbsp in wok (measure to avoid greasy sauce).',
      ],
    },
    {
      title: 'Blanch zucchini (prevents sogginess)',
      bullets: [
        'In a separate pot at a rolling boil, blanch zucchini (M \u00D7 1/2) for 10 sec.',
        'Lift basket; drain 10 sec. Ensure fully drained to avoid watery pan.',
      ],
    },
    {
      title: 'Reheat wok for veg stage',
      bullets: [
        'Return wok high 5 sec with residual oil.',
        'Add +1 Tbsp fresh soybean oil; let it shimmer.',
      ],
    },
    {
      title: 'Mushrooms first (they drink oil)',
      bullets: [
        'Add sliced mushrooms (M \u00D7 1); stir-fry 10 sec.',
        'If dry, do not add oil—sauce is coming.',
      ],
    },
    {
      title: 'Aromatics, fast',
      bullets: [
        'Add ginger & garlic (1\u00BD tsp); stir 5 sec. Do not brown.',
      ],
    },
    {
      title: 'Re-mix sauce, then combine',
      bullets: [
        'Re-stir #5 sauce (1/2 cup) to re-suspend starch.',
        'Add chicken back, then cooking wine (1\u00BD tsp), then #5 sauce.',
        'Stir until sauce boils and thickens (glossy nappe).',
      ],
    },
    {
      title: 'Add zucchini; coat fully',
      bullets: [
        'Add blanched zucchini; toss until evenly coated and hot.',
      ],
    },
    {
      title: 'Finish & safety checks',
      bullets: [
        'Stream sesame oil (1\u00BD tsp) around wok rim; toss.',
        'Probe thickest chicken and center of mix: \u2265165\u00B0F. Hold \u2265135\u00B0F. Max hold 1 hour.',
      ],
    },
  ],
  timings: [
    { label: 'Oil preheat to 275\u00B0F', value: 'as needed (verify thermometer)' },
    { label: 'Chicken fry', value: '1:15 (first 0:10 high, then medium)' },
    { label: 'Zucchini', value: '0:10 blanch + 0:10 drain' },
    { label: 'Mushrooms', value: '0:10' },
    { label: 'Aromatics', value: '0:05' },
    { label: 'Sauce to boil & thicken', value: '~0:20–0:40' },
    { label: 'Finish/toss to 165\u00B0F', value: '~0:20' },
  ],
  qualityControl: [
    'Sauce not thick? Re-stir #5, ensure hard boil, raise heat if needed.',
    'Watery pan? Zucchini not drained full 10 sec or heat dipped under boil.',
    'Greasy mouthfeel? Too much oil left post-chicken; enforce 2 Tbsp rule.',
    'Dull flavor? Sesame oil added too early or toss too slow.',
  ],
  scaling: [
    {
      label: '1/2 Batch',
      details: [
        'Chicken 6 oz; zucchini M \u00D7 1/4; mushrooms M \u00D7 1/2; #5 1/3 cup;',
        'Times: chicken 1:00; mushrooms 0:10.',
      ],
    },
    {
      label: 'Batch #2',
      details: [
        'Chicken 1 lb 8 oz; zucchini M \u00D7 1; mushrooms M \u00D7 2; #5 1 cup;',
        'Times: chicken 1:30; mushrooms 0:15.',
      ],
    },
    {
      label: 'Party Tray',
      details: [
        'Chicken 2 lb 4 oz; zucchini M \u00D7 1\u00BD; mushrooms M \u00D7 3; #5 1\u00BD cups;',
        'Times: chicken 1:45; mushrooms 0:20.',
        'Always re-probe \u2265165\u00B0F; hold \u2265135\u00B0F.',
      ],
    },
  ],
  quickRead: {
    title: 'Cook — Read & Do',
    steps: [
      'Heat clean wok on high to white smoke. Add oil; bring to 275°F.',
      'Add chicken. High 10 sec, then medium; cook 1:15 to ≥165°F. Separate pieces.',
      'Remove chicken with strainer. Drain oil; leave 2 Tbsp in wok.',
      'Boil zucchini 10 sec, then drain 10 sec (no excess water).',
      'Reheat wok high 5 sec (with the 2 Tbsp). Add +1 Tbsp oil.',
      'Add mushrooms (M × 1); stir-fry 10 sec.',
      'Add ginger & garlic; stir 5 sec.',
      'Stir #5 sauce to re-suspend starch; add chicken, then wine, then sauce.',
      'Boil until sauce thickens (glossy).',
      'Add zucchini; toss to coat.',
      'Finish: Sesame oil 1½ tsp around wok; toss to ≥165°F.',
      'Pan up; hold ≥135°F. Max 1 hour.',
    ],
    checks: [
      'Oil 275°F before chicken; chicken internal ≥165°F.',
      'Zucchini fully drained; sauce must boil to thicken.',
    ],
  },
};


