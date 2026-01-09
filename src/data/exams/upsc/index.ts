// 1. IMPORT PRELIMS
import prelimsGS from './prelims_gs.json'
import csat from './CSAT.json'

// 2. IMPORT MAINS - GS
import gs1 from './gs1.json'
import gs2 from './gs2.json'
import gs3 from './gs3.json'
import gs4 from './gs4.json'

// 3. IMPORT MAINS - OPTIONALS
// Anthropology
import anthro1 from './anthro1.json'
import anthro2 from './anthro2.json'
// Economics
import eco1 from './economics1.json'
import eco2 from './economics2.json'
// Geography
import geo1 from './geography.json'
import geo2 from './geography2.json'
// History
import hist1 from './history1.json'
import hist2 from './history2.json'
// PSIR
import psir1 from './psir1.json'
import psir2 from './psir2.json'
// Public Admin (Renaming variable to be safe)
import pubAd1 from './public admin1.json'
import pubAd2 from './public admin2.json'
// Sociology
import soc1 from './sociology1.json'
import soc2 from './sociology2.json'

// 4. BUILD THE MASTER TREE
const upscMaster = [
  {
    id: "root_upsc",
    title: "UPSC CSE",
    type: "branch",
    children: [
      // === STAGE 1: PRELIMS ===
      {
        id: "upsc_prelims",
        title: "Stage 1: Prelims",
        type: "branch",
        children: [
          {
            id: "prelims_gs",
            title: "General Studies (Paper I)",
            type: "branch", // Assuming your JSON has structure inside
            children: prelimsGS
          },
          {
            id: "prelims_csat",
            title: "CSAT (Paper II)",
            type: "branch",
            children: csat
          }
        ]
      },

      // === STAGE 2: MAINS ===
      {
        id: "upsc_mains",
        title: "Stage 2: Mains",
        type: "branch",
        children: [
          // A. GENERAL STUDIES
          {
            id: "mains_gs_folder",
            title: "General Studies (GS)",
            type: "branch",
            children: [
              {
                id: "mains_gs1",
                title: "GS Paper I (Heritage, History, Geo)",
                type: "branch",
                children: gs1
              },
              {
                id: "mains_gs2",
                title: "GS Paper II (Polity, IR, Governance)",
                type: "branch",
                children: gs2
              },
              {
                id: "mains_gs3",
                title: "GS Paper III (Tech, Bio, Economy)",
                type: "branch",
                children: gs3
              },
              {
                id: "mains_gs4",
                title: "GS Paper IV (Ethics, Integrity)",
                type: "branch",
                children: gs4
              }
            ]
          },

          // B. OPTIONAL SUBJECTS
          {
            id: "mains_opt_folder",
            title: "Optional Subjects",
            type: "branch",
            children: [
              {
                id: "opt_anthro",
                title: "Anthropology",
                type: "branch",
                children: [
                  { id: "anthro_p1", title: "Paper I", type: "branch", children: anthro1 },
                  { id: "anthro_p2", title: "Paper II", type: "branch", children: anthro2 }
                ]
              },
              {
                id: "opt_economics",
                title: "Economics",
                type: "branch",
                children: [
                  { id: "eco_p1", title: "Paper I", type: "branch", children: eco1 },
                  { id: "eco_p2", title: "Paper II", type: "branch", children: eco2 }
                ]
              },
              {
                id: "opt_geography",
                title: "Geography",
                type: "branch",
                children: [
                  { id: "geo_p1", title: "Paper I", type: "branch", children: geo1 },
                  { id: "geo_p2", title: "Paper II", type: "branch", children: geo2 }
                ]
              },
              {
                id: "opt_history",
                title: "History",
                type: "branch",
                children: [
                  { id: "hist_p1", title: "Paper I", type: "branch", children: hist1 },
                  { id: "hist_p2", title: "Paper II", type: "branch", children: hist2 }
                ]
              },
              {
                id: "opt_psir",
                title: "PSIR",
                type: "branch",
                children: [
                  { id: "psir_p1", title: "Paper I", type: "branch", children: psir1 },
                  { id: "psir_p2", title: "Paper II", type: "branch", children: psir2 }
                ]
              },
              {
                id: "opt_pubad",
                title: "Public Administration",
                type: "branch",
                children: [
                  { id: "pubad_p1", title: "Paper I", type: "branch", children: pubAd1 },
                  { id: "pubad_p2", title: "Paper II", type: "branch", children: pubAd2 }
                ]
              },
              {
                id: "opt_socio",
                title: "Sociology",
                type: "branch",
                children: [
                  { id: "soc_p1", title: "Paper I", type: "branch", children: soc1 },
                  { id: "soc_p2", title: "Paper II", type: "branch", children: soc2 }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]

export default upscMaster