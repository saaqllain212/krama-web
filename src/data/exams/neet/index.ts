// 1. IMPORT SUBJECTS
import physics from './neet-physics.json'
import chemistry from './neet-chemistry.json' // Ensure the '#' is removed in this file
import biology from './neet-biology.json'

// 2. BUILD THE MASTER TREE
const neetMaster = [
  {
    id: "root_neet",
    title: "National Eligibility cum Entrance Test (NEET)",
    type: "branch",
    children: [
        // Spread the arrays to put them all at the top level under NEET
        ...biology,
        ...physics,
        ...chemistry
    ]
  }
]

export default neetMaster