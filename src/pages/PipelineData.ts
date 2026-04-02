export interface EndItemRow {
  ei: string;
  model: string;
  eng: string;
  drv: string;
  side: string;
  trans: string;
  trim: string;
  color: string;
  destName: string;
  destCode: string;
  fty: string;
  vol: number[];
}

export const eiMasterRaw: EndItemRow[] = [
// WEST (FRA, NLD, BEL, LUX)
{ ei: "J10DFD2WLMTACESV-FR", model: "Qashqai", eng: "2.2 dCi Diesel", drv: "2WD", side: "LHD", trans: "MT", trim: "Acenta", color: "Silver", destName: "France", destCode: "FRA", fty: "NMUK", vol: [85, 90] },
{ ei: "J10P162WLMTSVESV-FR", model: "Qashqai", eng: "1.6 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "SVE", color: "Silver", destName: "France", destCode: "FRA", fty: "NMUK", vol: [40, 50] },
{ ei: "T31DFD4WLMTTEKBK-FR", model: "X-Trail", eng: "2.2 dCi Diesel", drv: "4WD", side: "LHD", trans: "MT", trim: "Tekna", color: "Black", destName: "France", destCode: "FRA", fty: "NML", vol: [30, 35] },
{ ei: "K13P122WLMTVISWH-NL", model: "Micra", eng: "1.2 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "Visia", color: "White", destName: "Netherlands", destCode: "NLD", fty: "NMISA", vol: [110, 120] },
{ ei: "E12P142WLMTACEBL-BE", model: "Note", eng: "1.4 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "Acenta", color: "Blue", destName: "Belgium", destCode: "BEL", fty: "NMUK", vol: [45, 50] },

// UK (GBR)
{ ei: "J10DFD2WRMTACESV-GB", model: "Qashqai", eng: "2.2 dCi Diesel", drv: "2WD", side: "RHD", trans: "MT", trim: "Acenta", color: "Silver", destName: "United Kingdom", destCode: "GBR", fty: "NMUK", vol: [250, 270] },
{ ei: "J10P162WRMTSVEBK-GB", model: "Qashqai", eng: "1.6 Petrol", drv: "2WD", side: "RHD", trans: "MT", trim: "SVE", color: "Black", destName: "United Kingdom", destCode: "GBR", fty: "NMUK", vol: [180, 200] },
{ ei: "J10DFD4WRMTTEKWH-GB", model: "Qashqai", eng: "2.2 dCi Diesel", drv: "4WD", side: "RHD", trans: "MT", trim: "Tekna", color: "White", destName: "United Kingdom", destCode: "GBR", fty: "NMUK", vol: [150, 160] },
{ ei: "K13P122WRMTVISRD-GB", model: "Micra", eng: "1.2 Petrol", drv: "2WD", side: "RHD", trans: "MT", trim: "Visia", color: "Red", destName: "United Kingdom", destCode: "GBR", fty: "NMISA", vol: [200, 220] },
{ ei: "E12P142WRMTACEBL-GB", model: "Note", eng: "1.4 Petrol", drv: "2WD", side: "RHD", trans: "MT", trim: "Acenta", color: "Blue", destName: "United Kingdom", destCode: "GBR", fty: "NMUK", vol: [180, 190] },
{ ei: "Z51V354WRATTEKSV-GB", model: "Murano", eng: "3.5 V6 Petrol", drv: "4WD", side: "RHD", trans: "AT", trim: "Tekna", color: "Silver", destName: "United Kingdom", destCode: "GBR", fty: "NML", vol: [25, 30] },
{ ei: "D40D254WRMTNTKBK-GB", model: "Navara", eng: "2.5 dCi Navara", drv: "4WD", side: "RHD", trans: "MT", trim: "N-Trek", color: "Black", destName: "United Kingdom", destCode: "GBR", fty: "NMISA", vol: [120, 130] },

// NORDICS (SWE, NOR, DEN, FIN, EST, LAT, LIT)
{ ei: "J10DFD4WLMTTEKSV-SE", model: "Qashqai", eng: "2.2 dCi Diesel", drv: "4WD", side: "LHD", trans: "MT", trim: "Tekna", color: "Silver", destName: "Sweden", destCode: "SWE", fty: "NMUK", vol: [60, 65] },
{ ei: "T31DFD4WLMTSVEWH-NO", model: "X-Trail", eng: "2.2 dCi Diesel", drv: "4WD", side: "LHD", trans: "MT", trim: "SVE", color: "White", destName: "Norway", destCode: "NOR", fty: "NML", vol: [70, 75] },
{ ei: "R51DFD4WLMTTEKBK-DK", model: "Pathfinder", eng: "2.5 dCi Path", drv: "4WD", side: "LHD", trans: "MT", trim: "Tekna", color: "Black", destName: "Denmark", destCode: "DEN", fty: "NML", vol: [25, 30] },
{ ei: "J10P164WLMTACESV-FI", model: "Qashqai", eng: "1.6 Petrol", drv: "4WD", side: "LHD", trans: "MT", trim: "Acenta", color: "Silver", destName: "Finland", destCode: "FIN", fty: "NMUK", vol: [50, 55] },
{ ei: "E12P142WLMTVISBL-LT", model: "Note", eng: "1.4 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "Visia", color: "Blue", destName: "Lithuania", destCode: "LIT", fty: "NMUK", vol: [20, 25] },

// ITA (ITA)
{ ei: "J10P162WLMTSVESV-IT", model: "Qashqai", eng: "1.6 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "SVE", color: "Silver", destName: "Italy", destCode: "ITA", fty: "NMUK", vol: [120, 130] },
{ ei: "K13P122WLMTVISRD-IT", model: "Micra", eng: "1.2 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "Visia", color: "Red", destName: "Italy", destCode: "ITA", fty: "NMISA", vol: [150, 160] },
{ ei: "F15P162WLMTACEBK-IT", model: "Juke", eng: "1.6 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "Acenta", color: "Black", destName: "Italy", destCode: "ITA", fty: "NMUK", vol: [90, 100] },
{ ei: "E12P142WLMTACESV-IT", model: "Note", eng: "1.4 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "Acenta", color: "Silver", destName: "Italy", destCode: "ITA", fty: "NMUK", vol: [80, 85] },

// CEE (POL, CZE, HUN, SVK, AUT)
{ ei: "J10P162WLMTACESV-PL", model: "Qashqai", eng: "1.6 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "Acenta", color: "Silver", destName: "Poland", destCode: "POL", fty: "NMUK", vol: [70, 75] },
{ ei: "J10DFD2WLMTACEWH-CZ", model: "Qashqai", eng: "2.2 dCi Diesel", drv: "2WD", side: "LHD", trans: "MT", trim: "Acenta", color: "White", destName: "Czech Republic", destCode: "CZE", fty: "NMUK", vol: [45, 50] },
{ ei: "T31DFD4WLMTSVEBK-HU", model: "X-Trail", eng: "2.2 dCi Diesel", drv: "4WD", side: "LHD", trans: "MT", trim: "SVE", color: "Black", destName: "Hungary", destCode: "HUN", fty: "NML", vol: [35, 40] },
{ ei: "D40D254WLMTNTKSV-SK", model: "Navara", eng: "2.5 dCi Navara", drv: "4WD", side: "LHD", trans: "MT", trim: "N-Trek", color: "Silver", destName: "Slovakia", destCode: "SVK", fty: "NMISA", vol: [40, 45] },

// CENTER (GER, CHE, AUT)
{ ei: "J10DFD2WLMTSVEBK-DE", model: "Qashqai", eng: "2.2 dCi Diesel", drv: "2WD", side: "LHD", trans: "MT", trim: "SVE", color: "Black", destName: "Germany", destCode: "GER", fty: "NMUK", vol: [190, 200] },
{ ei: "J10DFD4WLMTTEKSV-DE", model: "Qashqai", eng: "2.2 dCi Diesel", drv: "4WD", side: "LHD", trans: "MT", trim: "Tekna", color: "Silver", destName: "Germany", destCode: "GER", fty: "NMUK", vol: [140, 150] },
{ ei: "T31DFD4WLMTTEKWH-CH", model: "X-Trail", eng: "2.2 dCi Diesel", drv: "4WD", side: "LHD", trans: "MT", trim: "Tekna", color: "White", destName: "Switzerland", destCode: "CHE", fty: "NML", vol: [60, 65] },
{ ei: "Z51V354WLATTEKBK-DE", model: "Murano", eng: "3.5 V6 Petrol", drv: "4WD", side: "LHD", trans: "AT", trim: "Tekna", color: "Black", destName: "Germany", destCode: "GER", fty: "NML", vol: [30, 35] },
{ ei: "J10DFD4WLMTSVESV-AT", model: "Qashqai", eng: "2.2 dCi Diesel", drv: "4WD", side: "LHD", trans: "MT", trim: "SVE", color: "Silver", destName: "Austria", destCode: "AUT", fty: "NMUK", vol: [50, 55] },

// RUSSIA (RUS, UKR)
{ ei: "T31DFD4WLMTTEKBK-RU", model: "X-Trail", eng: "2.2 dCi Diesel", drv: "4WD", side: "LHD", trans: "MT", trim: "Tekna", color: "Black", destName: "Russia", destCode: "RUS", fty: "NML", vol: [180, 200] },
{ ei: "J10P164WLMTACEWH-RU", model: "Qashqai", eng: "1.6 Petrol", drv: "4WD", side: "LHD", trans: "MT", trim: "Acenta", color: "White", destName: "Russia", destCode: "RUS", fty: "NMUK", vol: [150, 160] },
{ ei: "Y62V564WLATTEKWH-RU", model: "Patrol", eng: "5.6 V8 Petrol", drv: "4WD", side: "LHD", trans: "AT", trim: "Tekna", color: "White", destName: "Russia", destCode: "RUS", fty: "NML", vol: [80, 90] },
{ ei: "R51DFD4WLMTSVEBK-RU", model: "Pathfinder", eng: "2.5 dCi Path", drv: "4WD", side: "LHD", trans: "MT", trim: "SVE", color: "Black", destName: "Russia", destCode: "RUS", fty: "NML", vol: [100, 110] },
{ ei: "J10P162WLMTACESV-UA", model: "Qashqai", eng: "1.6 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "Acenta", color: "Silver", destName: "Ukraine", destCode: "UKR", fty: "NMUK", vol: [40, 45] },
{ ei: "T31DFD4WLMTSVEWH-UA", model: "X-Trail", eng: "2.2 dCi Diesel", drv: "4WD", side: "LHD", trans: "MT", trim: "SVE", color: "White", destName: "Ukraine", destCode: "UKR", fty: "NML", vol: [35, 40] },

// IBERIA (ESP, POR)
{ ei: "J10DFD2WLMTACESV-ES", model: "Qashqai", eng: "2.2 dCi Diesel", drv: "2WD", side: "LHD", trans: "MT", trim: "Acenta", color: "Silver", destName: "Spain", destCode: "ESP", fty: "NMUK", vol: [160, 170] },
{ ei: "K13P122WLMTVISWH-ES", model: "Micra", eng: "1.2 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "Visia", color: "White", destName: "Spain", destCode: "ESP", fty: "NMISA", vol: [130, 140] },
{ ei: "F15P162WLMTSVERD-ES", model: "Juke", eng: "1.6 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "SVE", color: "Red", destName: "Spain", destCode: "ESP", fty: "NMUK", vol: [110, 120] },
{ ei: "J10P162WLMTACEBL-PT", model: "Qashqai", eng: "1.6 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "Acenta", color: "Blue", destName: "Portugal", destCode: "POR", fty: "NMUK", vol: [60, 65] },
{ ei: "D40D252WLMTACESV-ES", model: "Navara", eng: "2.5 dCi Navara", drv: "2WD", side: "LHD", trans: "MT", trim: "Acenta", color: "Silver", destName: "Spain", destCode: "ESP", fty: "NMISA", vol: [80, 90] },

// MEA (ISR, MAR, TUN, CYP)
{ ei: "J10P162WLMTACEWH-IL", model: "Qashqai", eng: "1.6 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "Acenta", color: "White", destName: "Israel", destCode: "ISR", fty: "NMUK", vol: [50, 55] },
{ ei: "T31DFD4WLMTTEKBK-MA", model: "X-Trail", eng: "2.2 dCi Diesel", drv: "4WD", side: "LHD", trans: "MT", trim: "Tekna", color: "Black", destName: "Morocco", destCode: "MAR", fty: "NML", vol: [40, 45] },
{ ei: "D40D254WLMTNTKSV-TN", model: "Navara", eng: "2.5 dCi Navara", drv: "4WD", side: "LHD", trans: "MT", trim: "N-Trek", color: "Silver", destName: "Tunisia", destCode: "TUN", fty: "NMISA", vol: [30, 35] },
{ ei: "J10P162WRMTACESV-CY", model: "Qashqai", eng: "1.6 Petrol", drv: "2WD", side: "RHD", trans: "MT", trim: "Acenta", color: "Silver", destName: "Cyprus", destCode: "CYP", fty: "NMUK", vol: [20, 25] },

// Commercial Vehicles
{ ei: "M20D152WLMTVISWH-FR", model: "NV200", eng: "1.5 dCi Diesel", drv: "2WD", side: "LHD", trans: "MT", trim: "Visia", color: "White", destName: "France", destCode: "FRA", fty: "NMISA", vol: [85, 95] },
{ ei: "F24D252WRMTCCHWH-GB", model: "Cabstar", eng: "2.5 dCi Diesel", drv: "2WD", side: "RHD", trans: "MT", trim: "Chassis Cab", color: "White", destName: "United Kingdom", destCode: "GBR", fty: "NMISA", vol: [60, 70] },
{ ei: "X83D202WLMTPANWH-DE", model: "Primastar", eng: "2.0 dCi Diesel", drv: "2WD", side: "LHD", trans: "MT", trim: "Panel Van", color: "White", destName: "Germany", destCode: "GER", fty: "NMISA", vol: [55, 60] },
{ ei: "X70D232WLMTLWBWH-ES", model: "Interstar", eng: "2.3 dCi Diesel", drv: "2WD", side: "LHD", trans: "MT", trim: "Long Wheelbase", color: "White", destName: "Spain", destCode: "ESP", fty: "NMISA", vol: [45, 50] },

// Z Car
{ ei: "Z33V352WLMTGTABK-DE", model: "350Z", eng: "3.5 V6 Petrol", drv: "2WD", side: "LHD", trans: "MT", trim: "GT Pack", color: "Black", destName: "Germany", destCode: "GER", fty: "NML", vol: [15, 20] },
{ ei: "Z33V352WRMTGTASV-GB", model: "350Z", eng: "3.5 V6 Petrol", drv: "2WD", side: "RHD", trans: "MT", trim: "GT Pack", color: "Silver", destName: "United Kingdom", destCode: "GBR", fty: "NML", vol: [20, 25] }
];
