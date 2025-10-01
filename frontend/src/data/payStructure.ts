const pay = {
  roles: [
    "Counter Help",
    "Kitchen Help", 
    "Shift Leader",
    "Cook",
    "AM",
    "Chef",
    "SM",
    "GM",
    "TL"
  ],
  regions: [
    {
      name: "Montana Tier 2",
      stores: [2044, 2662],
      pay: {
        "Counter Help": 19.00,
        "Kitchen Help": 21.00,
        "Shift Leader": 20.00,
        "Cook": 23.00,
        "AM": 26.50,
        "Chef": 26.50,
        "SM": 30.50,
        "GM": 31.50,
        "TL": 33.50
      }
    },
    {
      name: "Montana Tier 1",
      stores: [2261, 2874, 3698],
      pay: {
        "Counter Help": 19.00,
        "Kitchen Help": 21.00,
        "Shift Leader": 20.00,
        "Cook": 23.00,
        "AM": 26.50,
        "Chef": 26.50,
        "SM": 31.00,
        "GM": 32.00,
        "TL": 34.00
      }
    },
    {
      name: "Spokane / CDA / Moscow / Pullman /Lewiston / Central WA",
      stores: [
        1080, 1182, 1220, 1302, 1423, 1449, 1495, 1504, 1596, 1658,
        1670, 1708, 1725, 1742, 1881, 1887, 2047, 2128, 2129, 2527,
        2875, 2966, 3264, 3431, 3544, 599, 815
      ],
      pay: {
        "Counter Help": 17.70,
        "Kitchen Help": 19.20,
        "Shift Leader": 19.70,
        "Cook": 21.20,
        "AM": 24.00,
        "Chef": 24.00,
        "SM": 29.00,
        "GM": 30.00,
        "TL": 32.00
      }
    },
    {
      name: "Seattle DMA Tier 3",
      stores: [1073, 1973, 2014, 2226],
      pay: {
        "Counter Help": 21.00,
        "Kitchen Help": 22.00,
        "Shift Leader": 23.00,
        "Cook": 24.00,
        "AM": 25.00,
        "Chef": 25.00,
        "SM": 31.00,
        "GM": 32.00,
        "TL": 34.00
      }
    },
    {
      name: "Seattle DMA Tier 2",
      stores: [1020, 1088, 1291, 1505, 1961, 3078, 329, 574],
      pay: {
        "Counter Help": 22.00,
        "Kitchen Help": 23.00,
        "Shift Leader": 24.00,
        "Cook": 25.00,
        "AM": 26.00,
        "Chef": 26.00,
        "SM": 32.00,
        "GM": 33.00,
        "TL": 35.00
      }
    },
    {
      name: "Seattle DMA Tier 1",
      stores: [1024, 1232, 1564, 1649, 1650, 1911, 2154, 2475, 2605, 2757, 3317],
      pay: {
        "Counter Help": 23.00,
        "Kitchen Help": 24.00,
        "Shift Leader": 25.00,
        "Cook": 26.00,
        "AM": 27.00,
        "Chef": 27.00,
        "SM": 33.00,
        "GM": 34.00,
        "TL": 36.00
      }
    }
  ]
};

export default pay;




