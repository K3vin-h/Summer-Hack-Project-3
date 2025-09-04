function getSeedAutocomplete(focusedValue) {
  const seeds = [
    "Carrot",
    "Strawberry",
    "Blueberry",
    "Orange Tulip",
    "Tomato",
    "Corn",
    "Daffodil",
    "Watermelon",
    "Pumpkin",
    "Apple",
    "Bamboo",
    "Coconut",
    "Cactus",
    "Dragon Fruit",
    "Mango",
    "Grape",
    "Mushroom",
    "Pepper",
    "Cacao",
    "Beanstalk",
    "Ember Lily",
    "Sugar Apple",
    "Burning Bud",
    "Giant Pinecone"
  ];

  return seeds
    .filter(seed => seed.toLowerCase().includes(focusedValue.toLowerCase()))
    .slice(0, 25)
    .map(seed => ({ name: seed, value: seed }));
}
function getGearAutocomplete(focusedValue) {
  const gear = [
    "Watering Can",
    "Trowel",
    "Recall Wrench",
    "Basic Sprinkler",
    "Advanced Sprinkler",
    "Godly Sprinkler",
    "Magnifying Glass",
    "Tanning Mirror",
    "Master Sprinkler",
    "Cleaning Spray",
    "Favourite Tool",
    "Harvest Tool",
    "Friendship Pot",
    "Medium Toy",
    "Medium Treat",
    "Level Up Lollipop"
  ]
  return gear.filter(gear => gear.toLowerCase().includes(focusedValue.toLowerCase()))
    .slice(0, 25)
    .map(gear => ({ name: gear, value: gear }));
}
function getEggAutocomplete(focusedValue) {
  const eggs = [
    "Common Egg",
    "Common Summer Egg",
    "Rare Summer Egg",
    "Mythical Egg",
    "Paradise Egg",
    "Bug Egg",
    "Bee Egg"
  ]
  return eggs.filter(egg => egg.toLowerCase().includes(focusedValue.toLowerCase()))
    .slice(0, 25)
    .map(egg => ({ name: egg, value: egg }));
}
function getCosmeticAutocomplete(focusedValue) {
  const cosmetics = [
    "Ring Walkway",
    "Blue Well",
    "Cooking Pot",
    "Medium Wood Flooring",
    "Brown Bench",
    "White Bench",
    "Wood Fence",
    "Hay Bale",
    "Water Tough",
    "Viney Beam",
    "Yellow Umbrella",
    "Torch",
    "Log",
    "Rake",
    "Small Stone Lantern",
    "Medium Circle Tile",
    "Mini TV",
    "Medium Path Tile",
    "Red Tractor",
    "Wheelbarrow",
    "Red Pottery",
    "Water Trough",
    "Large Stone Pad"
  ]
  return cosmetics.filter(cosmetic => cosmetic.toLowerCase().includes(focusedValue.toLowerCase()))
    .slice(0, 25)
    .map(cosmetic => ({ name: cosmetic, value: cosmetic }));
}

function getWeatherAutocomplete(focusedValue) {
  const weather = [
    "Rain",
    "Heatwave",
    "SummerHarvest",
    "Tornado",
    "Windy",
    "AuroraBorealis",
    "TropicalRain",
    "NightEvent",
    "SunGod",
    "MegaHarvest",
    "Gale",
    "Thunderstorm",
    "BloodMoonEvent",
    "MeteorShower",
    "SpaceTravel",
    "Disco",
    "DJJhai",
    "Blackhole",
    "JandelStorm",
    "Sandstorm",
    "DJSandstorm",
    "Volcano",
    "UnderTheSea",
    "AlienInvasion",
    "JandelLazer",
    "Obby",
    "PoolParty",
    "JandelZombie"
  ];
  return weather.filter(weather => weather.toLowerCase().includes(focusedValue.toLowerCase()))
    .slice(0, 25)
    .map(weather => ({ name: weather, value: weather }));
}
function getEventAutocomplete(focusedValue) {
  const events = [
    "Zen Seed Pack",
    "Zen Egg",
    "Hot Spring",
    "Zen Sand",
    "Soft Sunshine Seed",
    "Zen Crate",
    "Zenflare Seed",
    "Koi",
    "Zen Gnome Crate",
    "Spiked Mango Seed",
    "Pet Mutation Shard Tranquil"
  ]

  return events.filter(event => event.toLowerCase().includes(focusedValue.toLowerCase()))
    .slice(0, 25)
    .map(event => ({ name: event, value: event }));
}

module.exports = { getSeedAutocomplete, getGearAutocomplete, getEggAutocomplete, getCosmeticAutocomplete, getWeatherAutocomplete, getEventAutocomplete };