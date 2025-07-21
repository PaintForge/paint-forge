import { storage } from './storage.js';

const paintDatabase = [
  // Citadel Base Paints
  { name: "Macragge Blue", brand: "Citadel", color: "#1b3a57", type: "Base", barcode: "5011921188246" },
  { name: "Castellan Green", brand: "Citadel", color: "#264715", type: "Base", barcode: "5011921188253" },
  { name: "Death World Forest", brand: "Citadel", color: "#5b6730", type: "Base", barcode: "5011921188260" },
  { name: "Caliban Green", brand: "Citadel", color: "#00401f", type: "Base", barcode: "5011921188277" },
  { name: "Waaagh! Flesh", brand: "Citadel", color: "#6a7c3e", type: "Base", barcode: "5011921188284" },
  { name: "Castellax Bronze", brand: "Citadel", color: "#9c6201", type: "Base", barcode: "5011921188291" },
  { name: "Leadbelcher", brand: "Citadel", color: "#888d8f", type: "Base", barcode: "5011921188307" },
  { name: "Retributor Armour", brand: "Citadel", color: "#c39e81", type: "Base", barcode: "5011921188314" },
  { name: "Abaddon Black", brand: "Citadel", color: "#000000", type: "Base", barcode: "5011921188321" },
  { name: "White Scar", brand: "Citadel", color: "#ffffff", type: "Base", barcode: "5011921188338" },
  { name: "Mephiston Red", brand: "Citadel", color: "#960c09", type: "Base", barcode: "5011921188345" },
  { name: "Khorne Red", brand: "Citadel", color: "#6a0001", type: "Base", barcode: "5011921188352" },
  { name: "Naggaroth Night", brand: "Citadel", color: "#3d3354", type: "Base", barcode: "5011921188369" },
  { name: "Daemonette Hide", brand: "Citadel", color: "#696684", type: "Base", barcode: "5011921188376" },
  { name: "Warplock Bronze", brand: "Citadel", color: "#927556", type: "Base", barcode: "5011921188383" },
  { name: "Balthasar Gold", brand: "Citadel", color: "#a47552", type: "Base", barcode: "5011921188390" },
  { name: "Screaming Bell", brand: "Citadel", color: "#c78582", type: "Base", barcode: "5011921188406" },
  { name: "Warpfiend Grey", brand: "Citadel", color: "#6c6a74", type: "Base", barcode: "5011921188413" },
  { name: "Fenris Grey", brand: "Citadel", color: "#507281", type: "Base", barcode: "5011921188420" },
  { name: "The Fang", brand: "Citadel", color: "#436174", type: "Base", barcode: "5011921188437" },
  
  // Citadel Layer Paints
  { name: "Cadian Fleshtone", brand: "Citadel", color: "#c77853", type: "Layer", barcode: "5011921188444" },
  { name: "Kislev Flesh", brand: "Citadel", color: "#d6a875", type: "Layer", barcode: "5011921188451" },
  { name: "Bestigor Flesh", brand: "Citadel", color: "#d38a57", type: "Layer", barcode: "5011921188468" },
  { name: "Ungor Flesh", brand: "Citadel", color: "#d7966b", type: "Layer", barcode: "5011921188475" },
  { name: "Skrag Brown", brand: "Citadel", color: "#90490a", type: "Layer", barcode: "5011921188482" },
  { name: "Deathclaw Brown", brand: "Citadel", color: "#b36853", type: "Layer", barcode: "5011921188499" },
  { name: "Tau Light Ochre", brand: "Citadel", color: "#c6973e", type: "Layer", barcode: "5011921188505" },
  { name: "Tallarn Sand", brand: "Citadel", color: "#a07409", type: "Layer", barcode: "5011921188512" },
  { name: "Karak Stone", brand: "Citadel", color: "#bb9662", type: "Layer", barcode: "5011921188529" },
  { name: "Ushabti Bone", brand: "Citadel", color: "#bbad82", type: "Layer", barcode: "5011921188536" },
  { name: "Screaming Skull", brand: "Citadel", color: "#d2d4a2", type: "Layer", barcode: "5011921188543" },
  { name: "Pallid Wych Flesh", brand: "Citadel", color: "#cdccc1", type: "Layer", barcode: "5011921188550" },
  { name: "Ratskin Flesh", brand: "Citadel", color: "#aa7366", type: "Layer", barcode: "5011921188567" },
  { name: "Flayed One Flesh", brand: "Citadel", color: "#edc9a5", type: "Layer", barcode: "5011921188574" },
  { name: "Fulgurite Copper", brand: "Citadel", color: "#b48b62", type: "Layer", barcode: "5011921188581" },
  { name: "Sycorax Bronze", brand: "Citadel", color: "#c7944a", type: "Layer", barcode: "5011921188598" },
  { name: "Hashut Copper", brand: "Citadel", color: "#92561f", type: "Layer", barcode: "5011921188604" },
  { name: "Brass Scorpion", brand: "Citadel", color: "#b7885a", type: "Layer", barcode: "5011921188611" },
  { name: "Auric Armour Gold", brand: "Citadel", color: "#c99e2b", type: "Layer", barcode: "5011921188628" },
  { name: "Liberator Gold", brand: "Citadel", color: "#d3b227", type: "Layer", barcode: "5011921188635" },

  // Citadel Contrast Paints
  { name: "Blood Angels Red", brand: "Citadel", color: "#aa0808", type: "Contrast", barcode: "5011921139699" },
  { name: "Flesh Tearers Red", brand: "Citadel", color: "#8b0000", type: "Contrast", barcode: "5011921139705" },
  { name: "Imperial Fist", brand: "Citadel", color: "#ffd700", type: "Contrast", barcode: "5011921139712" },
  { name: "Iyanden Yellow", brand: "Citadel", color: "#f4d71a", type: "Contrast", barcode: "5011921139729" },
  { name: "Gryph-charger Grey", brand: "Citadel", color: "#a6a6a6", type: "Contrast", barcode: "5011921139736" },
  { name: "Space Wolves Grey", brand: "Citadel", color: "#9bb2d1", type: "Contrast", barcode: "5011921139743" },
  { name: "The Fang", brand: "Citadel", color: "#506e85", type: "Contrast", barcode: "5011921139750" },
  { name: "Fenrisian Grey", brand: "Citadel", color: "#719bb7", type: "Contrast", barcode: "5011921139767" },
  { name: "Russ Grey", brand: "Citadel", color: "#507281", type: "Contrast", barcode: "5011921139774" },
  { name: "Celestium Blue", brand: "Citadel", color: "#4682b4", type: "Contrast", barcode: "5011921139781" },
  { name: "Leviadon Blue", brand: "Citadel", color: "#1e90ff", type: "Contrast", barcode: "5011921139798" },
  { name: "Ultramarines Blue", brand: "Citadel", color: "#01308f", type: "Contrast", barcode: "5011921139804" },
  { name: "Akhelian Green", brand: "Citadel", color: "#00796b", type: "Contrast", barcode: "5011921139811" },
  { name: "Dark Angels Green", brand: "Citadel", color: "#004225", type: "Contrast", barcode: "5011921139828" },
  { name: "Nazdreg Yellow", brand: "Citadel", color: "#fff700", type: "Contrast", barcode: "5011921139835" },
  { name: "Ork Flesh", brand: "Citadel", color: "#9acd32", type: "Contrast", barcode: "5011921139842" },
  { name: "Creed Camo", brand: "Citadel", color: "#8fbc8f", type: "Contrast", barcode: "5011921139859" },
  { name: "Militarum Green", brand: "Citadel", color: "#556b2f", type: "Contrast", barcode: "5011921139866" },
  { name: "Castellan Green", brand: "Citadel", color: "#355e3b", type: "Contrast", barcode: "5011921139873" },
  { name: "Death World Forest", brand: "Citadel", color: "#4a5d23", type: "Contrast", barcode: "5011921139880" },

  // Citadel Technical Paints  
  { name: "Armageddon Dust", brand: "Citadel", color: "#c7944a", type: "Technical", barcode: "5011921139897" },
  { name: "Armageddon Dunes", brand: "Citadel", color: "#d69e2e", type: "Technical", barcode: "5011921139903" },
  { name: "Blackfire Earth", brand: "Citadel", color: "#280e0b", type: "Technical", barcode: "5011921139910" },
  { name: "Stirland Mud", brand: "Citadel", color: "#3e2601", type: "Technical", barcode: "5011921139927" },
  { name: "Stirland Battlemire", brand: "Citadel", color: "#4b3820", type: "Technical", barcode: "5011921139934" },
  { name: "Typhus Corrosion", brand: "Citadel", color: "#463029", type: "Technical", barcode: "5011921139941" },
  { name: "Ryza Rust", brand: "Citadel", color: "#ec631a", type: "Technical", barcode: "5011921139958" },
  { name: "Nihilakh Oxide", brand: "Citadel", color: "#5fada0", type: "Technical", barcode: "5011921139965" },
  { name: "Nurgle's Rot", brand: "Citadel", color: "#9eb82b", type: "Technical", barcode: "5011921139972" },
  { name: "Blood for the Blood God", brand: "Citadel", color: "#7a0b0b", type: "Technical", barcode: "5011921139989" },
  { name: "Hexwraith Flame", brand: "Citadel", color: "#1cb68b", type: "Technical", barcode: "5011921139996" },
  { name: "Nighthaunt Gloom", brand: "Citadel", color: "#007482", type: "Technical", barcode: "5011921140008" },
  { name: "Spiritstone Red", brand: "Citadel", color: "#ff073a", type: "Technical", barcode: "5011921140015" },
  { name: "Waystone Green", brand: "Citadel", color: "#00ff87", type: "Technical", barcode: "5011921140022" },
  { name: "Soulstone Blue", brand: "Citadel", color: "#0080ff", type: "Technical", barcode: "5011921140039" },

  // Citadel Dry Paints
  { name: "Necron Compound", brand: "Citadel", color: "#c0c5c1", type: "Dry", barcode: "5011921140046" },
  { name: "Terminatus Stone", brand: "Citadel", color: "#bdb192", type: "Dry", barcode: "5011921140053" },
  { name: "Tyrant Skull", brand: "Citadel", color: "#ede7ca", type: "Dry", barcode: "5011921140060" },
  { name: "Praxeti White", brand: "Citadel", color: "#ffffff", type: "Dry", barcode: "5011921140077" },
  { name: "Longbeard Grey", brand: "Citadel", color: "#cecc96", type: "Dry", barcode: "5011921140084" },
  { name: "Dawnstone", brand: "Citadel", color: "#697068", type: "Dry", barcode: "5011921140091" },
  { name: "Administratum Grey", brand: "Citadel", color: "#949b9a", type: "Dry", barcode: "5011921140107" },
  { name: "Chronus Blue", brand: "Citadel", color: "#5e99c2", type: "Dry", barcode: "5011921140114" },
  { name: "Hoeth Blue", brand: "Citadel", color: "#4c78af", type: "Dry", barcode: "5011921140121" },
  { name: "Imrik Blue", brand: "Citadel", color: "#1f3a93", type: "Dry", barcode: "5011921140138" },
  { name: "Asurmen Blue", brand: "Citadel", color: "#4a90a4", type: "Dry", barcode: "5011921140145" },
  { name: "Etherium Blue", brand: "Citadel", color: "#a2bad2", type: "Dry", barcode: "5011921140152" },
  { name: "Skink Blue", brand: "Citadel", color: "#58c1cd", type: "Dry", barcode: "5011921140169" },
  { name: "Hellion Green", brand: "Citadel", color: "#84c3aa", type: "Dry", barcode: "5011921140176" },
  { name: "Underhive Ash", brand: "Citadel", color: "#c0c58f", type: "Dry", barcode: "5011921140183" },

  // Additional Citadel Shade Paints (expanding the current 10)
  { name: "Carroburg Crimson", brand: "Citadel", color: "#501f1c", type: "Shade", barcode: "5011921140190" },
  { name: "Druchii Violet", brand: "Citadel", color: "#7c4b8a", type: "Shade", barcode: "5011921140206" },
  { name: "Drakenhof Nightshade", brand: "Citadel", color: "#3c485a", type: "Shade", barcode: "5011921140213" },
  { name: "Coelia Greenshade", brand: "Citadel", color: "#067439", type: "Shade", barcode: "5011921140220" },
  { name: "Biel-Tan Green", brand: "Citadel", color: "#1ba169", type: "Shade", barcode: "5011921140237" },
  { name: "Athonian Camoshade", brand: "Citadel", color: "#403a24", type: "Shade", barcode: "5011921140244" },
  { name: "Seraphim Sepia", brand: "Citadel", color: "#9e5b2e", type: "Shade", barcode: "5011921140251" },
  { name: "Reikland Fleshshade", brand: "Citadel", color: "#b14532", type: "Shade", barcode: "5011921140268" },
  { name: "Poxwalker", brand: "Citadel", color: "#9c7a3c", type: "Shade", barcode: "5011921140275" },
  { name: "Targor Rageshade", brand: "Citadel", color: "#4e2329", type: "Shade", barcode: "5011921140282" },

  // Vallejo Model Color
  { name: "Hull Red", brand: "Vallejo", color: "#a03033", type: "Base", barcode: "8429551700016" },
  { name: "Mahogany Brown", brand: "Vallejo", color: "#4a2c17", type: "Base", barcode: "8429551700023" },
  { name: "Burnt Cadmium Red", brand: "Vallejo", color: "#b33a20", type: "Base", barcode: "8429551700030" },
  { name: "Vermillion", brand: "Vallejo", color: "#e2341a", type: "Base", barcode: "8429551700047" },
  { name: "Orange Red", brand: "Vallejo", color: "#ff4500", type: "Base", barcode: "8429551700054" },
  { name: "Light Orange", brand: "Vallejo", color: "#ff7f00", type: "Base", barcode: "8429551700061" },
  { name: "Hot Orange", brand: "Vallejo", color: "#ff4500", type: "Base", barcode: "8429551700078" },
  { name: "Cadmium Orange", brand: "Vallejo", color: "#ff8c00", type: "Base", barcode: "8429551700085" },
  { name: "Golden Yellow", brand: "Vallejo", color: "#ffd700", type: "Base", barcode: "8429551700092" },
  { name: "Sun Yellow", brand: "Vallejo", color: "#ffff00", type: "Base", barcode: "8429551700108" },
  { name: "Lemon Yellow", brand: "Vallejo", color: "#fff700", type: "Base", barcode: "8429551700115" },
  { name: "Yellow Green", brand: "Vallejo", color: "#9acd32", type: "Base", barcode: "8429551700122" },
  { name: "Livery Green", brand: "Vallejo", color: "#4a5d23", type: "Base", barcode: "8429551700139" },
  { name: "Green Grey", brand: "Vallejo", color: "#808080", type: "Base", barcode: "8429551700146" },
  { name: "Reflective Green", brand: "Vallejo", color: "#00ff00", type: "Base", barcode: "8429551700153" },
  { name: "Intermediate Green", brand: "Vallejo", color: "#228b22", type: "Base", barcode: "8429551700160" },
  { name: "Goblin Green", brand: "Vallejo", color: "#3cb371", type: "Base", barcode: "8429551700177" },
  { name: "Emerald", brand: "Vallejo", color: "#50c878", type: "Base", barcode: "8429551700184" },
  { name: "Sick Green", brand: "Vallejo", color: "#9acd32", type: "Base", barcode: "8429551700191" },
  { name: "Jade Green", brand: "Vallejo", color: "#00a86b", type: "Base", barcode: "8429551700207" },
  
  // Army Painter Warpaints
  { name: "Matt Black", brand: "Army Painter", color: "#000000", type: "Base", barcode: "5713799100015" },
  { name: "Matt White", brand: "Army Painter", color: "#ffffff", type: "Base", barcode: "5713799100022" },
  { name: "Uniform Grey", brand: "Army Painter", color: "#5a6068", type: "Base", barcode: "5713799100039" },
  { name: "Wolf Grey", brand: "Army Painter", color: "#9ca3a8", type: "Base", barcode: "5713799100046" },
  { name: "Ash Grey", brand: "Army Painter", color: "#b5b5b5", type: "Base", barcode: "5713799100053" },
  { name: "Spaceship Exterior", brand: "Army Painter", color: "#808080", type: "Base", barcode: "5713799100060" },
  { name: "Plate Mail Metal", brand: "Army Painter", color: "#c0c0c0", type: "Metallic", barcode: "5713799100077" },
  { name: "Weapon Bronze", brand: "Army Painter", color: "#cd7f32", type: "Metallic", barcode: "5713799100084" },
  { name: "Greedy Gold", brand: "Army Painter", color: "#ffd700", type: "Metallic", barcode: "5713799100091" },
  { name: "Shining Silver", brand: "Army Painter", color: "#c0c0c0", type: "Metallic", barcode: "5713799100107" },
  { name: "Gun Metal", brand: "Army Painter", color: "#2c3539", type: "Metallic", barcode: "5713799100114" },
  { name: "Bright Gold", brand: "Army Painter", color: "#ffd700", type: "Metallic", barcode: "5713799100121" },
  { name: "Dragon Red", brand: "Army Painter", color: "#c1272d", type: "Base", barcode: "5713799100138" },
  { name: "Pure Red", brand: "Army Painter", color: "#ea212d", type: "Base", barcode: "5713799100145" },
  { name: "Heart Fire", brand: "Army Painter", color: "#ff6b35", type: "Base", barcode: "5713799100152" },
  { name: "Lava Orange", brand: "Army Painter", color: "#ff4500", type: "Base", barcode: "5713799100169" },
  { name: "Demonic Yellow", brand: "Army Painter", color: "#ffff00", type: "Base", barcode: "5713799100176" },
  { name: "Necrotite Green", brand: "Army Painter", color: "#228b22", type: "Base", barcode: "5713799100183" },
  { name: "Angel Green", brand: "Army Painter", color: "#90ee90", type: "Base", barcode: "5713799100190" },
  { name: "Goblin Green", brand: "Army Painter", color: "#3cb371", type: "Base", barcode: "5713799100206" },
  
  // Additional Citadel Shades
  { name: "Agrax Earthshade", brand: "Citadel", color: "#947a47", type: "Shade", barcode: "5011921188642" },
  { name: "Nuln Oil", brand: "Citadel", color: "#14100e", type: "Shade", barcode: "5011921188659" },
  { name: "Carroburg Crimson", brand: "Citadel", color: "#a12f36", type: "Shade", barcode: "5011921188666" },
  { name: "Druchii Violet", brand: "Citadel", color: "#7a4d93", type: "Shade", barcode: "5011921188673" },
  { name: "Drakenhof Nightshade", brand: "Citadel", color: "#125a98", type: "Shade", barcode: "5011921188680" },
  { name: "Athonian Camoshade", brand: "Citadel", color: "#689774", type: "Shade", barcode: "5011921188697" },
  { name: "Seraphim Sepia", brand: "Citadel", color: "#b7a069", type: "Shade", barcode: "5011921188703" },
  { name: "Reikland Fleshshade", brand: "Citadel", color: "#ca6c4d", type: "Shade", barcode: "5011921188710" },
  { name: "Casandora Yellow", brand: "Citadel", color: "#ffd700", type: "Shade", barcode: "5011921188727" },
  { name: "Fuegan Orange", brand: "Citadel", color: "#ff4500", type: "Shade", barcode: "5011921188734" }
];

async function populatePaints() {
  console.log('Starting paint database population...');
  
  for (const paintData of paintDatabase) {
    try {
      await storage.createPaint({
        ...paintData,
        quantity: 100,
        status: "in_stock",
        userId: null // Master catalog - not owned by any user
      });
      console.log(`Added: ${paintData.name} by ${paintData.brand}`);
    } catch (error) {
      console.error(`Failed to add ${paintData.name}:`, error);
    }
  }
  
  console.log('Paint database population complete!');
  process.exit(0);
}

populatePaints().catch(console.error);